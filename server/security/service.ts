import { randomUUID } from 'node:crypto';
import { Actor, AccessError, canRead, code, codeDigest, digest, equalDigest, identifier, requireRecentPassword, requireThat, secret, textField, validateDemographics, validateWorkspace, validateClinicWorkspace, treatmentMonthExpiresAt } from './policy';
import type { Document, SecureStore, UnitOfWork } from './store';

export class ClinicalSecurity {
  constructor(private store: SecureStore, private clinic: string, private key: string, private publicUrl: string, private clock = Date.now) {}
  path(kind: string, id?: string) { return `secure_clinics/${this.clinic}/${kind}${id ? `/${identifier(id)}` : ''}`; }
  async actor(uid: string, authTime: number, bootstrapUid: string): Promise<Actor> {
    identifier(uid);
    let member = await this.store.transaction(tx => tx.get(this.path('members', uid)));
    if (!member && uid === bootstrapUid) {
      const account = await this.store.account(uid);
      await this.store.audit({action: 'bootstrap_admin', actorUid: uid, clinic: this.clinic});
      member = await this.store.transaction(async tx => {
        const old = await tx.get(this.path('members', uid));
        if (old) return old;
        const value = {uid, name: account.name, role: 'admin', active: true};
        tx.create(this.path('members', uid), value); return value;
      });
    }
    requireThat(member?.active && ['admin', 'dentist', 'receptionist'].includes(member.role), 403, 'Sua conta ainda não está vinculada a esta clínica.');
    return {uid, name: member.name, role: member.role, authTime};
  }
  async run(actor: Actor, action: string, patientId: string | undefined, input: any = {}) {
    if (patientId) identifier(patientId);
    // A heartbeat does not deliver data and is not a user action. Do not create
    // hundreds of immutable audit objects merely because a chart stays open.
    if (action === 'access.status') return this.store.transaction(async tx => {
      const member = await tx.get(this.path('members', actor.uid));
      const p = await tx.get(this.path('patients', patientId));
      requireThat(member?.active && member.role === actor.role && p && canRead(p as any, actor, this.clock()), 403, 'Acesso indisponível.');
      return {allowed: true, readOnly: !canRead(p as any, actor, this.clock(), true)};
    });
    const event = {clinic: this.clinic, actorUid: actor.uid, role: actor.role, action, patientId: patientId || null};
    // Audit precedes data access. Failure here prevents the operation entirely.
    const intentId = await this.store.audit({...event, outcome: 'attempt'});
    const transaction = <T>(fn: (tx: UnitOfWork) => Promise<T>) => this.store.transaction(async tx => {
      const member = await tx.get(this.path('members', actor.uid));
      requireThat(member?.active && member.role === actor.role, 403, 'Sua permissão mudou. Entre novamente.');
      const result = await fn(tx);
      tx.create(this.path('receipts', randomUUID()), {...event, intentId, at: this.clock(), outcome: 'committed'});
      return result;
    });
    const patient = async (tx: UnitOfWork) => {
      const p = await tx.get(this.path('patients', patientId));
      requireThat(p, 404, 'Paciente não encontrado.'); return p;
    };
    try {
      let result: any;
      let details: Record<string, any> = {};
      if (action === 'session') result = {actor, clinic: this.clinic};
      else if (action === 'clinic.read' || action === 'clinic.context' || action === 'clinic.export' || action === 'clinic.print') {
        if (action !== 'clinic.context') requireThat(actor.role === 'admin', 403, 'Configurações restritas à administração.');
        const config = await transaction(tx => tx.get(this.path('settings', 'current')));
        const workspace = config?.blob ? await this.store.getBlob(config.blob) : {};
        if (action === 'clinic.context') {
          result = {workspace: {
            dentispro_clinic_info_v1: workspace.dentispro_clinic_info_v1 || {},
            dentispro_clinics_v1: workspace.dentispro_clinics_v1 || [],
            dentispro_professionals_v1: (workspace.dentispro_professionals_v1 || []).filter((p: any) => p.userId === actor.uid),
            dentispro_document_templates_v1: workspace.dentispro_document_templates_v1 || [],
            dentispro_tuss_procedures_v1: workspace.dentispro_tuss_procedures_v1 || [],
            dentispro_price_tables_v1: workspace.dentispro_price_tables_v1 || [],
          }};
          // A shared clinic's settings must not inject another person's signature.
          const info = {...result.workspace.dentispro_clinic_info_v1};
          for (const field of ['signatureImageUrl', 'stampImageUrl', 'dentistName', 'cro', 'cpf', 'signatureLabel', 'headerSubtitle']) delete info[field];
          result.workspace.dentispro_clinic_info_v1 = info;
        } else result = {workspace, revision: config?.revision || 0};
      } else if (action === 'clinic.save') {
        requireThat(actor.role === 'admin', 403, 'Configurações restritas à administração.');
        const reason = textField(input.reason, 500, 5), workspace = validateClinicWorkspace(input.workspace);
        const blob = await this.store.putBlob(workspace);
        result = await transaction(async tx => {
          const old = await tx.get(this.path('settings', 'current'));
          requireThat(Number.isInteger(input.revision) && (old?.revision || 0) === input.revision, 409, 'Configuração alterada por outra sessão. Reabra antes de salvar.');
          const revision = input.revision + 1;
          tx.set(this.path('settings', 'current'), {blob, revision});
          tx.create(this.path('settings_versions', String(revision).padStart(12, '0')), {blob, revision, reason, authorUid: actor.uid, at: this.clock(), intentId});
          return {workspace, revision};
        });
        details = {reason, revision: result.revision, resources: Object.keys(workspace)};
      } else if (action === 'clinical.ai' || action === 'intake.ocr' || action === 'admin.tools') {
        await transaction(async tx => {
          if (action === 'admin.tools') requireThat(actor.role === 'admin', 403, 'Acesso administrativo necessário.');
          else {const p = await patient(tx); if (action === 'clinical.ai') requireThat(canRead(p as any, actor, this.clock(), true), 403, 'O paciente precisa autorizar seu acesso.');}
        }); result = {allowed: true};
      } else if (action === 'members.list') {
        const rows = await this.store.list(this.path('members'));
        result = rows.filter(r => r.active).map(r => ({uid: r.uid, name: r.name, role: r.role}));
      } else if (action === 'members.create') {
        requireThat(actor.role === 'admin', 403, 'Somente a administração pode cadastrar contas.');
        const email = textField(input.email, 254), name = textField(input.name, 160);
        requireThat(typeof input.password === 'string' && input.password.length >= 12 && input.password.length <= 128 && input.password === input.confirmation, 400, 'Use uma senha de pelo menos 12 caracteres e confirme-a.');
        requireThat(['admin', 'dentist', 'receptionist'].includes(input.role), 400, 'Perfil inválido.');
        const uid = await this.store.createAccount(email, input.password, name);
        try {
          await transaction(async tx => {
            tx.create(`users/${uid}`, {uid, email, name, role: input.role, createdAt: new Date(this.clock()).toISOString()});
            tx.create(this.path('members', uid), {uid, name, role: input.role, active: true});
          });
        } catch {
          throw new AccessError(503, `Cadastro pendente: a conta ${uid} foi criada desativada. Confira o perfil e o vínculo antes de ativá-la no Firebase; não repita o cadastro.`);
        }
        await this.store.audit({...event, action: 'members.activate', targetUid: uid, outcome: 'attempt'});
        await this.store.activateAccount(uid);
        details = {targetUid: uid, role: input.role}; result = {uid};
      } else if (action === 'members.save') {
        requireThat(actor.role === 'admin', 403, 'Somente a administração pode vincular contas.');
        const uid = identifier(input.uid);
        requireThat(['admin', 'dentist', 'receptionist'].includes(input.role), 400, 'Perfil inválido.');
        requireThat(uid !== actor.uid, 400, 'Não altere sua própria permissão por esta tela.');
        const account = await this.store.account(uid);
        await transaction(async tx => { const before = await tx.get(this.path('members', uid)); const after = {uid, name: account.name, role: input.role, active: input.active !== false}; tx.set(this.path('members', uid), after); tx.create(this.path('membership_versions', randomUUID()), {before, after, intentId}); });
        details = {targetUid: uid, role: input.role, active: input.active !== false};
        result = {ok: true};
      } else if (action === 'patients.list') {
        const rows = await this.store.list(this.path('patients'), 100, input.after ? identifier(input.after) : undefined);
        result = {items: rows.map(r => ({id: r.id, ...r.demographics, ownerUid: r.ownerUid, contactVerified: !!r.contactVerifiedAt, canRead: canRead(r as any, actor, this.clock()), revision: r.revision})), next: rows.length === 100 ? rows.at(-1)!.id : null};
      } else if (action === 'migration.import') {
        requireThat(actor.role === 'admin', 403, 'Importação restrita à administração.');
        requireRecentPassword(actor, this.clock());
        requireThat(input.acknowledged === true, 400, 'Confirme o vínculo profissional e a origem dos dados.');
        const demographics = validateDemographics(input.demographics), ownerUid = identifier(input.ownerUid), id = identifier(input.patientId);
        const workspace = validateWorkspace(input.workspace, id), reason = textField(input.reason, 500, 15);
        const blob = await this.store.putBlob(workspace);
        await transaction(async tx => {
          const owner = await tx.get(this.path('members', ownerUid));
          const existing = await tx.get(this.path('patients', id));
          requireThat(!existing, 409, 'Este identificador já foi importado. Nenhum conteúdo foi substituído.');
          requireThat(owner?.active && ['dentist', 'admin'].includes(owner.role), 400, 'Responsável inválido.');
          tx.create(this.path('patients', id), {demographics, ownerUid, grants: {}, exceptions: {}, revision: 1, blob, contactVerifiedAt: null, createdAt: this.clock(), createdBy: actor.uid});
          tx.create(this.path('patients', id) + '/versions/000000000001', {revision: 1, blob, reason, authorUid: actor.uid, at: this.clock(), intentId, imported: true});
        }); details = {importedPatientId: id, ownerUid, reason}; result = {id};
      } else if (action === 'patients.create') {
        const demographics = validateDemographics(input.demographics);
        requireThat(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(demographics.email), 400, 'Informe um e-mail válido para contato do paciente.');
        const ownerUid = identifier(input.ownerUid), id = randomUUID();
        await transaction(async tx => {
          const owner = await tx.get(this.path('members', ownerUid));
          requireThat(owner?.active && ['dentist', 'admin'].includes(owner.role), 400, 'Selecione um profissional vinculado à clínica.');
          if (actor.role === 'dentist') requireThat(ownerUid === actor.uid, 403, 'O profissional responsável deve ser sua própria conta.');
          tx.create(this.path('patients', id), {demographics, ownerUid, grants: {}, exceptions: {}, revision: 0, blob: null, contactVerifiedAt: null, createdAt: this.clock(), createdBy: actor.uid});
        });
        result = {id};
      } else if (action === 'patients.update') {
        const demographics = validateDemographics(input.demographics);
        await transaction(async tx => {
          const p = await patient(tx);
          requireThat(demographics.email === p.demographics.email, 409, 'A troca do contato de autorização exige um procedimento de verificação; não é permitida nesta tela.');
          tx.set(this.path('patients', patientId), {...p, demographics});
          tx.create(this.path('demographic_versions', randomUUID()), {patientId, before: p.demographics, after: demographics, authorUid: actor.uid, at: this.clock(), intentId});
        }); result = {ok: true};
      } else if (action === 'access.status' || action === 'clinical.read' || action === 'clinical.history' || action === 'clinical.version' || action === 'clinical.print' || action === 'clinical.export') {
        const p = await transaction(async tx => {
          const p = await patient(tx);
          requireThat(canRead(p as any, actor, this.clock()), 403, 'O paciente precisa autorizar seu acesso.');
          return p;
        });
        if (action === 'clinical.print' || action === 'clinical.export') {
          details = {requestedResource: typeof input.resourceId === 'string' ? input.resourceId.slice(0,128) : 'current_workspace', revision: p.revision};
          result = {allowed: true};
        }
        else if (action === 'clinical.history') {
          result = (await this.store.list(this.path('patients', patientId) + '/versions', 100, input.after ? identifier(input.after) : undefined)).map(v => ({id: v.id, revision: v.revision, at: v.at, authorUid: v.authorUid, reason: v.reason}));
        } else {
          let reference = p.blob;
          if (action === 'clinical.version') {
            const v = await transaction(tx => tx.get(this.path('patients', patientId) + `/versions/${identifier(input.versionId)}`));
            requireThat(v, 404, 'Versão não encontrada.'); reference = v.blob;
          }
          const workspace = reference ? await this.store.getBlob(reference) : {dentispro_patients_v2: [{id: patientId, ...p.demographics, status: 'ativo', createdAt: new Date(p.createdAt).toISOString(), healthInsurance: '', gender: '', address: {street:'',number:'',neighborhood:'',city:'',state:'',cep:''}, anamnesis: {}}]};
          if (action === 'clinical.read') workspace.dentispro_patients_v2[0] = {...workspace.dentispro_patients_v2[0], ...p.demographics};
          // Recheck after potentially slow blob retrieval; revocation must win before delivery.
          await transaction(async tx => requireThat(canRead(await patient(tx) as any, actor, this.clock()), 403, 'Acesso suspenso.'));
          result = {workspace, revision: p.revision, readOnly: !canRead(p as any, actor, this.clock(), true), demographics: p.demographics};
        }
      } else if (action === 'clinical.save') {
        const reason = textField(input.reason, 500, 5);
        const before = await transaction(async tx => { const p = await patient(tx); requireThat(canRead(p as any, actor, this.clock(), true), 403, 'Sem autorização para alterar este prontuário.'); return p; });
        const previous = before.blob ? await this.store.getBlob(before.blob) : undefined;
        const workspace = validateWorkspace(input.workspace, patientId!, previous);
        // Patient demographic contact and ownership cannot be changed through clinical payloads.
        for (const [field, value] of Object.entries(before.demographics)) requireThat((workspace.dentispro_patients_v2[0][field] || '') === value, 409, 'Cadastro divergente. Atualize os dados na seção Editar cadastro e reabra o prontuário.');
        workspace.dentispro_patients_v2[0] = {...workspace.dentispro_patients_v2[0], ...before.demographics, id: patientId};
        const previousIds = new Set((previous?.dentispro_evolutions_v2 || []).map((r: any) => r.id));
        for (const row of workspace.dentispro_evolutions_v2 || []) if (!previousIds.has(row.id)) {
          row.authorUid = actor.uid; row.recordedAt = new Date(this.clock()).toISOString();
        }
        const blob = await this.store.putBlob(workspace);
        details = {reason, changedResources: Object.keys(workspace).filter(k => JSON.stringify(previous?.[k]) !== JSON.stringify(workspace[k])), beforeDigest: previous ? digest(JSON.stringify(previous)) : null, afterDigest: digest(JSON.stringify(workspace))};
        result = await transaction(async tx => {
          const p = await patient(tx);
          requireThat(canRead(p as any, actor, this.clock(), true), 403, 'Acesso suspenso. Alteração não salva.');
          requireThat(Number.isInteger(input.revision) && p.revision === input.revision && before.revision === p.revision, 409, 'Outra pessoa salvou alterações. Reabra o prontuário antes de continuar.');
          const revision = p.revision + 1;
          tx.set(this.path('patients', patientId), {...p, blob, revision});
          tx.create(this.path('patients', patientId) + `/versions/${String(revision).padStart(12, '0')}`, {revision, blob, at: this.clock(), authorUid: actor.uid, reason, digest: digest(JSON.stringify(workspace)), intentId});
          return {revision, workspace};
        });
      } else if (action === 'appointments.list') {
        result = await this.store.list(this.path('patients', patientId) + '/appointments', 100);
      } else if (action === 'appointments.save') {
        const id = input.id ? identifier(input.id) : randomUUID();
        const professionalUid = identifier(input.professionalUid);
        requireThat(/^\d{4}-\d{2}-\d{2}$/.test(input.date) && /^\d{2}:\d{2}$/.test(input.time), 400, 'Data ou horário inválido.');
        requireThat(['agendado', 'confirmado', 'cancelado', 'concluido'].includes(input.status), 400, 'Status inválido.');
        await transaction(async tx => {
          await patient(tx);
          const member = await tx.get(this.path('members', professionalUid));
          requireThat(member?.active && ['admin', 'dentist'].includes(member.role), 400, 'Profissional inválido.');
          const old = await tx.get(this.path('patients', patientId) + `/appointments/${id}`);
          const entry = {id, patientId, professionalUid, date: input.date, time: input.time, status: input.status, updatedBy: actor.uid, updatedAt: this.clock()};
          tx.set(this.path('patients', patientId) + `/appointments/${id}`, entry);
          tx.create(this.path('appointment_versions', randomUUID()), {before: old, after: entry, intentId});
        }); result = {id};
      } else if (action === 'access.list') {
        result = await transaction(async tx => { const p = await patient(tx); return {ownerUid: p.ownerUid, grants: p.grants, contactVerified: !!p.contactVerifiedAt}; });
      } else if (action === 'access.request') {
        const targetUid = identifier(input.targetUid);
        requireThat(['visit', 'month', 'until_revoked'].includes(input.duration), 400, 'Escolha o período da autorização.');
        const id = randomUUID(), otp = code(), portal = secret(), now = this.clock();
        const request = await transaction(async tx => {
          const p = await patient(tx);
          const target = await tx.get(this.path('members', targetUid));
          requireThat(target?.active && ['admin', 'dentist'].includes(target.role), 400, 'Profissional inválido.');
          requireThat(input.duration !== 'until_revoked' || targetUid === p.ownerUid, 400, 'Para outro profissional, escolha um atendimento ou um mês, com autorização do paciente.');
          requireThat(p.contactVerifiedAt || targetUid === p.ownerUid, 409, 'Primeiro confirme o contato do paciente autorizando o profissional responsável.');
          const rate = await tx.get(this.path('rates', patientId));
          const count = rate?.day === Math.floor(now / 86400000) ? rate.count : 0;
          requireThat(!rate || now - rate.last >= 60000, 429, 'Aguarde um minuto antes de reenviar.');
          requireThat(count < 5, 429, 'Limite diário de solicitações atingido.');
          tx.set(this.path('rates', patientId), {last: now, day: Math.floor(now / 86400000), count: count + 1});
          const request = {purpose: 'consent', consentVersion: p.consentVersions?.[targetUid] || 0, id, patientId, targetUid, targetName: target.name, requestedBy: actor.uid, duration: input.duration, expiresAt: now + 300000, portalExpiresAt: now + 86400000, attempts: 0, codeHash: codeDigest(this.key, id, otp), portalHash: digest(portal), status: 'sending', createdAt: now, email: p.demographics.email};
          tx.create(this.path('challenges', id), request);
          tx.create(this.path('portals', digest(portal)), {requestId: id});
          return request;
        });
        try {
          const url = `${this.publicUrl.replace(/\/$/, '')}/patient-access#${portal}`;
          await this.store.deliver(request.email, `Solicitação de ${request.targetName} para acessar seu prontuário. Período: ${input.duration === 'visit' ? '8 horas' : input.duration === 'month' ? 'um mês a partir da confirmação, sem renovação automática' : 'até você suspender'}. Código: ${otp}. Válido por 5 minutos, uso único. Só informe se concordar. Confirme ou suspenda pelo link (válido por 24 horas): ${url}`);
          await transaction(async tx => { const c = await tx.get(this.path('challenges', id)); requireThat(c?.status === 'sending', 409, 'Solicitação indisponível.'); tx.set(this.path('challenges', id), {...c, status: 'pending'}); });
        } catch (e) {
          await transaction(async tx => { const c = await tx.get(this.path('challenges', id)); if (c?.status === 'sending') tx.set(this.path('challenges', id), {...c, status: 'failed'}); }); throw e;
        }
        result = {requestId: id, expiresAt: request.expiresAt}; // Never return OTP or patient bearer link to staff.
      } else if (action === 'access.confirm') {
        const requestId = identifier(input.requestId);
        const c = await transaction(tx => tx.get(this.path('challenges', requestId)));
        requireThat(c?.patientId === patientId, 400, 'Solicitação pertence a outro paciente.');
        result = await this.confirm(requestId, String(input.code || ''), actor.uid, transaction);
      } else if (action === 'access.exception') {
        requireThat(actor.role === 'admin', 403, 'Somente a administração pode solicitar acesso excepcional.');
        requireRecentPassword(actor, this.clock());
        const reason = textField(input.reason, 1000, 15);
        const p = await transaction(tx => patient(tx));
        details = {reason, readOnly: true, durationMinutes: 15};
        requireThat(p.contactVerifiedAt, 409, 'O contato do paciente precisa estar confirmado para receber a notificação.');
        await this.store.deliver(p.demographics.email, `Acesso excepcional solicitado por ${actor.name} ao seu prontuário, somente leitura, por 15 minutos. Motivo: ${reason}. A operação será registrada para auditoria.`);
        result = await transaction(async tx => {
          const current = await patient(tx), expiresAt = this.clock() + 900000;
          requireThat((current.consentVersions?.[actor.uid] || 0) === (p.consentVersions?.[actor.uid] || 0), 409, 'O paciente alterou o acesso durante a solicitação. A exceção não foi liberada.');
          tx.set(this.path('patients', patientId), {...current, exceptions: {...current.exceptions, [actor.uid]: {expiresAt, reason}}});
          tx.create(this.path('exception_history', randomUUID()), {patientId, actorUid: actor.uid, reason, expiresAt, intentId});
          return {expiresAt};
        });
      } else if (action === 'audit.list') {
        requireThat(actor.role === 'admin', 403, 'Somente a administração consulta a auditoria da clínica.');
        result = await this.store.list(this.path('audit_index'), 100, input.after ? identifier(input.after) : undefined);
      } else throw new AccessError(404, 'Operação indisponível.');
      const resources = result?.workspace ? Object.keys(result.workspace).map(key => ({key, ids: Array.isArray(result.workspace[key]) ? result.workspace[key].map((r: any) => r.id) : Object.keys(result.workspace[key])})) : undefined;
      await this.store.audit({...event, intentId, outcome: 'success', ...details, ...(resources ? {resources} : {}), ...(Array.isArray(result?.items) ? {patientIds: result.items.map((r: any) => r.id)} : {})});
      return result;
    } catch (error) {
      await this.store.audit({...event, intentId, outcome: 'denied_or_failed', status: error instanceof AccessError ? error.status : 503});
      throw error;
    }
  }
  private async confirm(id: string, entered: string, requester: string | null, transaction: SecureStore['transaction']) {
    const outcome = await transaction(async tx => {
      const c = await tx.get(this.path('challenges', id));
      requireThat(c && c.status === 'pending' && c.expiresAt > this.clock() && c.attempts < 5, 400, 'Código inválido, expirado ou já utilizado.');
      if (requester) requireThat(c.requestedBy === requester, 403, 'Use a conta que solicitou a autorização.');
      if (!/^\d{6}$/.test(entered) || !equalDigest(c.codeHash, codeDigest(this.key, id, entered))) {
        tx.set(this.path('challenges', id), {...c, attempts: c.attempts + 1}); return false;
      }
      const p = await tx.get(this.path('patients', c.patientId));
      if (c.purpose === 'management') {
        requireThat(!requester && p?.contactVerifiedAt && c.email === p.demographics.email, 403, 'Confirme o gerenciamento pelo link enviado ao paciente.');
        tx.set(this.path('challenges', id), {...c, status: 'used', usedAt: this.clock()});
        tx.create(this.path('receipts', randomUUID()), {action: 'patient.management.confirm', patientId: c.patientId, requestId: id, at: this.clock(), actorUid: 'patient', outcome: 'committed'});
        return true; // Identity confirmation never creates or extends a clinical grant.
      }
      requireThat(p && (c.consentVersion ?? 0) === (p.consentVersions?.[c.targetUid] || 0), 409, 'Este código é anterior à suspensão ou a outra autorização. Solicite um novo código.');
      const member = await tx.get(this.path('members', c.targetUid));
      requireThat(p && member?.active && ['admin', 'dentist'].includes(member.role), 403, 'Profissional ou paciente indisponível.');
      requireThat(['visit', 'month', 'until_revoked'].includes(c.duration) && (c.duration !== 'until_revoked' || c.targetUid === p.ownerUid), 400, 'Prazo de autorização indisponível. Solicite um novo código.');
      const grant = {status: 'active', expiresAt: c.duration === 'visit' ? this.clock() + 28800000 : c.duration === 'month' ? treatmentMonthExpiresAt(this.clock()) : null, authorizedAt: this.clock()};
      tx.set(this.path('patients', c.patientId), {...p, consentVersions: {...p.consentVersions, [c.targetUid]: (p.consentVersions?.[c.targetUid] || 0) + 1}, contactVerifiedAt: p.contactVerifiedAt || this.clock(), grants: {...p.grants, [c.targetUid]: grant}});
      tx.set(this.path('challenges', id), {...c, status: 'used', usedAt: this.clock()});
      tx.create(this.path('consent_history', randomUUID()), {patientId: c.patientId, targetUid: c.targetUid, requestId: id, channel: 'email_otp', duration: c.duration, at: this.clock(), requestedBy: c.requestedBy, confirmedBy: requester || 'patient', previous: p.grants[c.targetUid] || null, grant});
      return true;
    });
    requireThat(outcome, 400, 'Código incorreto.');
    return {ok: true};
  }
  private async renewManagement(previous: Document, intentId: string) {
    const now = this.clock(), id = randomUUID(), otp = code(), portal = secret();
    const request = await this.store.transaction(async tx => {
      const p = await tx.get(this.path('patients', previous.patientId));
      const rate = await tx.get(this.path('portal_rates', previous.patientId));
      requireThat(p?.contactVerifiedAt, 403, 'O contato ainda precisa ser confirmado pela primeira autorização na clínica.');
      const count = rate?.day === Math.floor(now / 86400000) ? rate.count : 0;
      requireThat(!rate || now - rate.last >= 60000, 429, 'Aguarde um minuto antes de reenviar.');
      requireThat(count < 5, 429, 'Limite diário de renovação atingido.');
      const value = {id, patientId: previous.patientId, targetUid: null, targetName: null, requestedBy: 'patient', purpose: 'management', duration: null,
        expiresAt: now + 300000, portalExpiresAt: now + 86400000, attempts: 0, codeHash: codeDigest(this.key, id, otp), portalHash: digest(portal),
        status: 'sending', createdAt: now, email: p.demographics.email};
      tx.set(this.path('portal_rates', previous.patientId), {last: now, day: Math.floor(now / 86400000), count: count + 1});
      tx.create(this.path('challenges', id), value);
      tx.create(this.path('portals', digest(portal)), {requestId: id});
      tx.create(this.path('receipts', randomUUID()), {action: 'patient.management.request', patientId: previous.patientId, requestId: id, intentId, at: now});
      return value;
    });
    try {
      await this.store.deliver(request.email, `Gerenciamento de autorizações do DentisPro. Este código não autoriza nem renova acesso de profissionais. Código: ${otp}. Válido por 5 minutos. Link válido por 24 horas: ${this.publicUrl.replace(/\/$/, '')}/patient-access#${portal}`);
      await this.store.transaction(async tx => {const c = await tx.get(this.path('challenges', id)); requireThat(c?.status === 'sending', 409, 'Solicitação indisponível.'); tx.set(this.path('challenges', id), {...c, status: 'pending'});});
    } catch(e) {
      await this.store.transaction(async tx => {const c = await tx.get(this.path('challenges', id)); if(c?.status === 'sending') tx.set(this.path('challenges', id), {...c, status: 'failed'});});
      throw e;
    }
    return {ok: true, message: 'Novo link enviado ao contato já confirmado. Abra o e-mail e confirme o código. Nenhuma autorização clínica foi renovada.'};
  }
  async portal(token: string, action: string, entered?: string, targetUid?: string) {
    requireThat(/^[A-Za-z0-9_-]{43}$/.test(token), 400, 'Link inválido.');
    const portalId = digest(token);
    const intent = await this.store.audit({action: `patient.${action}`, clinic: this.clinic, portalId, outcome: 'attempt'});
    try {
      const request = await this.store.transaction(async tx => {
        const ref = await tx.get(this.path('portals', portalId));
        const c = ref ? await tx.get(this.path('challenges', ref.requestId)) : null;
        requireThat(c && (action === 'renew' || c.portalExpiresAt > this.clock()) && ['pending', 'used'].includes(c.status), 400, 'Link expirado ou indisponível. Use Renovar link de gerenciamento para receber um novo e-mail.'); return c;
      });
      let result: any;
      let details: Record<string, any> = {};
      if (action === 'renew') result = await this.renewManagement(request, intent);
      else if (action === 'confirm') result = await this.confirm(request.id, entered || '', null, this.store.transaction.bind(this.store));
      else if (action === 'suspend') {
        requireThat(request.status === 'used', 403, 'Confirme o código para gerenciar o acesso.');
        const uid = identifier(targetUid);
        await this.store.transaction(async tx => {
          const p = await tx.get(this.path('patients', request.patientId));
          requireThat(p && (p.grants[uid] || p.ownerUid === uid || p.exceptions[uid]), 400, 'Autorização não encontrada.');
          const exceptions = {...p.exceptions}; delete exceptions[uid];
          tx.set(this.path('patients', request.patientId), {...p, consentVersions: {...p.consentVersions, [uid]: (p.consentVersions?.[uid] || 0) + 1}, exceptions, grants: {...p.grants, [uid]: {status: 'suspended', expiresAt: null, authorizedAt: this.clock()}}});
          tx.create(this.path('receipts', randomUUID()), {action: 'patient.suspend', patientId: request.patientId, targetUid: uid, intentId: intent, at: this.clock(), actorUid: 'patient', outcome: 'committed'});
        }); result = {ok: true};
      } else if (action === 'view') {
        result = {purpose: request.purpose || 'consent', professional: request.targetName, duration: request.duration, status: request.status, portalExpiresAt: request.portalExpiresAt};
        if (request.status === 'used') {
          const p = await this.store.transaction(tx => tx.get(this.path('patients', request.patientId)));
          const members = await this.store.list(this.path('members'));
          const ids = new Set([p!.ownerUid, ...Object.keys(p!.grants), ...Object.keys(p!.exceptions)]);
          result.grants = [...ids].map(uid => ({uid, name: members.find(m => m.uid === uid)?.name || 'Profissional',
            ...(p!.grants[uid] || (uid === p!.ownerUid ? {status: 'active', expiresAt: null} : {status: 'none', expiresAt: null})),
            exception: p!.exceptions[uid]?.expiresAt > this.clock() ? p!.exceptions[uid] : null}));
        }
      } else throw new AccessError(400, 'Operação inválida.');
      await this.store.audit({action: `patient.${action}`, clinic: this.clinic, patientId: request.patientId, targetUid: targetUid || request.targetUid, intentId: intent, outcome: 'success'});
      return result;
    } catch (e) { await this.store.audit({action: `patient.${action}`, intentId: intent, outcome: 'failed'}); throw e; }
  }
}
