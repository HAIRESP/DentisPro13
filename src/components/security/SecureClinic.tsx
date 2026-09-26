import { useAuditedSharing } from './useAuditedSharing';
import { setWorkspaceActionContext, authorizeWorkspaceAction } from '../../utils/workspaceActions';
import { SecureAdministration } from './SecureAdministration';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {EmailAuthProvider, reauthenticateWithCredential} from 'firebase/auth';
import {auth} from '../../lib/firebase';
import {useAuth} from '../../context/AuthContext';
import {AppProvider, useApp} from '../../context/AppContext';
import {DomainProviders} from '../../context/DomainContexts';
import {secureApi} from '../../utils/secureApi';
import {clinicalKeys} from '../../utils/secureWorkspace';
import {PatientList} from '../patients/PatientList';
import {ClinicalExamView} from '../patients/ClinicalExamView';
import {DentalDocumentManager} from '../documents/DentalDocumentManager';
import {LaudosView} from '../laudos/LaudosView';

type Person = {id: string; name: string; email: string; phone: string; cpf: string; birthDate: string; ownerUid: string; canRead: boolean; contactVerified: boolean};
const field = 'border border-stone-300 rounded p-2 w-full bg-white text-stone-900';
const button = 'rounded bg-stone-700 text-white px-4 py-2 disabled:opacity-50';
function ClinicalViews() {
  const {activeTab, setActiveTab} = useApp();
  const tabs = [['pacientes','Prontuário'],['exame_clinico','Exame e odontograma'],['documentos','Documentos'],['laudos','Laudos']] as const;
  return <><nav className="flex gap-2 flex-wrap p-3 print:hidden">{tabs.map(([tab,label]) => <button key={tab} className={button} onClick={() => setActiveTab(tab)}>{label}</button>)}</nav>
    {activeTab === 'documentos' ? <DentalDocumentManager/> : activeTab === 'laudos' ? <LaudosView/> : ['exame_clinico','odontograma'].includes(activeTab) ? <ClinicalExamView/> : <PatientList/>}
  </>;
}
export function SecureClinic() {
  const {currentUser, logout} = useAuth();
  const [session, setSession] = useState<any>(null), [patients, setPatients] = useState<Person[]>([]), [members, setMembers] = useState<any[]>([]);
  const [selected, setSelected] = useState<Person | null>(null), [bundle, setBundle] = useState<any>(null);
  const [error, setError] = useState(''), [notice, setNotice] = useState(''), [busy, setBusy] = useState(false), [dirty, setDirty] = useState(false);
  const [request, setRequest] = useState<any>(null), [access, setAccess] = useState<any>(null), [appointments, setAppointments] = useState<any[]>([]), [audit, setAudit] = useState<any[]>([]), [history, setHistory] = useState<any[]>([]);
  const [administration, setAdministration] = useState(false), [clinicContext, setClinicContext] = useState<any>({workspace:{}});
  const [search, setSearch] = useState(''), [next, setNext] = useState<string | null>(null), [masked, setMasked] = useState(false);
  const workspace = useRef<Record<string, any>>({}), baseline = useRef(''), lock = useRef(false), selectedRef = useRef<string | null>(null), requestVersion = useRef(0);
  const onChange = useCallback((value: Record<string, any>) => {
    workspace.current = value;
    const serialized = JSON.stringify(value);
    if (!baseline.current) baseline.current = serialized;
    setDirty(serialized !== baseline.current);
  }, []);
  useAuditedSharing(Boolean(bundle), setError);
  async function perform(fn: () => Promise<void>) {
    if (lock.current) return; lock.current = true; setBusy(true); setError(''); setNotice('');
    try { await fn(); } catch (e: any) {setError(e.message || 'Não foi possível concluir.');}
    finally {lock.current = false; setBusy(false);}
  }
  async function list(after?: string) {
    const result = await secureApi('patients.list', undefined, {after});
    setPatients(old => after ? [...old, ...result.items] : result.items); setNext(result.next);
  }
  const initialize = () => perform(async () => {
    setSession(await secureApi('session'));
    const [m, context] = await Promise.all([secureApi('members.list'), secureApi('clinic.context'), list()]); setMembers(m); setClinicContext(context);
  });
  useEffect(() => {void initialize(); return () => {++requestVersion.current;};}, [currentUser?.uid]);
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {if (dirty) {e.preventDefault(); e.returnValue = '';}};
    window.addEventListener('beforeunload', warn); return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);
  useEffect(() => {
    if (!selected || !bundle) return;
    let active = true, checking = false;
    async function check() {
      if (checking) return; checking = true;
      try {await secureApi('access.status', selected!.id); if (active) setMasked(document.hidden);}
      catch {if (active) {setBundle(null); setDirty(false); workspace.current = {}; setError('O acesso foi suspenso ou não pôde ser confirmado. Reabra o prontuário quando houver autorização e conexão.');}}
      finally {checking = false;}
    }
    const visible = () => {setMasked(true); if (!document.hidden) void check();};
    const timer = window.setInterval(() => {if (!document.hidden) void check();}, 20000);
    document.addEventListener('visibilitychange', visible);
    return () => {active = false; clearInterval(timer); document.removeEventListener('visibilitychange', visible);};
  }, [selected?.id, !!bundle]);
  useEffect(() => {
    if (!selected || !bundle) return;
    setWorkspaceActionContext({mode:'clinical',patientId:selected.id});
    // App-requested downloads are checked before clicking the link again.
    let authorized: HTMLAnchorElement | null = null;
    const download = (e: MouseEvent) => {
      const link = (e.target as Element)?.closest?.('a[download]') as HTMLAnchorElement | null;
      if (!link || link === authorized) return;
      e.preventDefault(); e.stopImmediatePropagation();
      const downloadBlob = link.href.startsWith('blob:') ? fetch(link.href).then(r=>r.blob()) : null;
      void authorizeWorkspaceAction('export').then(async () => {
        const url = downloadBlob ? URL.createObjectURL(await downloadBlob) : null;
        if(url) link.href = url; authorized = link; link.click(); authorized = null;
        if(url) setTimeout(()=>URL.revokeObjectURL(url), 60000);
      }).catch(e => setError(e.message));
    };
    document.addEventListener('click', download, true);
    return () => {setWorkspaceActionContext(null); document.removeEventListener('click', download, true);};
  }, [selected?.id, !!bundle]);
  async function choose(p: Person) {
    if (dirty && !window.confirm('Há alterações ainda não salvas. Deseja descartá-las e sair deste prontuário?')) return;
    ++requestVersion.current; selectedRef.current = p.id; setSelected(p); setBundle(null); setDirty(false); setMasked(false); baseline.current = ''; workspace.current = {};
    setRequest(null); setHistory([]);
    const [a, ag] = await Promise.all([secureApi('access.list', p.id), secureApi('appointments.list', p.id)]); setAccess(a); setAppointments(ag);
  }
  async function open() {
    const id = selected!.id, version = ++requestVersion.current;
    const value = await secureApi('clinical.read', id);
    if (selectedRef.current !== id || version !== requestVersion.current) return;
    baseline.current = ''; workspace.current = value.workspace; setBundle(value); setDirty(false); setMasked(false);
  }
  async function save(form: HTMLFormElement) {
    const values = new FormData(form);
    const result = await secureApi('clinical.save', selected!.id, {workspace: workspace.current, revision: bundle.revision, reason: values.get('reason')});
    baseline.current = ''; setBundle({...bundle, ...result}); setDirty(false); setNotice('Versão salva no servidor com auditoria.'); form.reset();
  }
  const seed = bundle && selected ? {
    ...clinicContext.workspace,
    ...bundle.workspace,
    dentispro_clinics_v1: clinicContext.workspace.dentispro_clinics_v1?.length ? clinicContext.workspace.dentispro_clinics_v1 : [{id: session.clinic, name: 'Clínica', address: '', city: '', phone: ''}],
    dentispro_professionals_v1: clinicContext.workspace.dentispro_professionals_v1?.length ? clinicContext.workspace.dentispro_professionals_v1 : [{id: session.actor.uid, userId: session.actor.uid, name: session.actor.name, cro: currentUser?.cro || '', specialty: currentUser?.specialty || '', clinicIds: [session.clinic], primaryClinicId: session.clinic}],
    dentispro_active_prof_v1: clinicContext.workspace.dentispro_professionals_v1?.[0]?.id || session.actor.uid, dentispro_active_clinic_v1: session.clinic,
    dentispro_clinic_info_v1: {name: 'DentisPro', dentistName: session.actor.name, cro: currentUser?.cro || '', specialty: currentUser?.specialty || '', phone: '', email: currentUser?.email || '', address: '', city: '', showSignatureImage: false, showStampImage: false, ...clinicContext.workspace.dentispro_clinic_info_v1},
  } : null;
  async function importLocal(form: HTMLFormElement) {
    const values = new FormData(form), legacyId = String(values.get('legacyId') || '');
    if (!auth.currentUser?.email) throw Error('Entre novamente.');
    await reauthenticateWithCredential(auth.currentUser, EmailAuthProvider.credential(auth.currentUser.email, String(values.get('password'))));
    await auth.currentUser.getIdToken(true);
    const raw = localStorage.getItem('dentispro_patients_v2') || localStorage.getItem('planetodonto_patients_v2') || '[]';
    const oldPatient = JSON.parse(raw).find((p: any) => p.id === legacyId);
    if (!oldPatient) throw Error('Paciente não encontrado no armazenamento antigo deste navegador.');
    if (!window.confirm(`Importar ${oldPatient.name} vinculando o profissional selecionado? O original será preservado.`)) return;
    const data: Record<string, any> = {};
    for (const key of clinicalKeys) {
      const raw = localStorage.getItem(key) || localStorage.getItem(key.replace('dentispro_', 'planetodonto_'));
      if (!raw) continue;
      const value = JSON.parse(raw);
      if (Array.isArray(value)) data[key] = value.filter(r => key === 'dentispro_patients_v2' ? r.id === legacyId : r.patientId === legacyId);
      else if (value[legacyId]) data[key] = {[legacyId]: value[legacyId]};
    }
    await secureApi('migration.import', undefined, {patientId: legacyId, ownerUid: values.get('ownerUid'), acknowledged: true, workspace: data, reason: values.get('reason'), demographics: {name:oldPatient.name,email:oldPatient.email,phone:oldPatient.phone||'',birthDate:oldPatient.birthDate||'',cpf:oldPatient.cpf||''}});
    form.reset(); await list(); setNotice('Paciente importado com o responsável selecionado. O original foi preservado.');
  }

  return <main className="min-h-screen bg-stone-100 text-stone-900 p-4">
    <header className="flex justify-between gap-3 items-center max-w-[1700px] mx-auto mb-4 print:hidden"><div><h1 className="text-xl font-bold">DentisPro · Atendimento protegido</h1><p>{session?.actor.name || currentUser?.name} · {session?.actor.role || currentUser?.role}</p></div><button className={button} disabled={busy} onClick={() => {if (!dirty || confirm('Descartar alterações não salvas e sair?')) void logout();}}>Sair da sessão</button></header>
    {error && <p role="alert" className="max-w-[1700px] mx-auto p-3 bg-red-50 border border-red-300 rounded text-red-800 print:hidden">{error}</p>}
    {notice && <p role="status" className="p-3 bg-green-50 text-green-800 print:hidden">{notice}</p>}
    {!session && <section className="max-w-xl mx-auto bg-white p-6 rounded space-y-3"><h2 className="font-bold">Preparação do atendimento protegido</h2><p>A configuração do servidor precisa estar concluída antes de liberar prontuários. Seus dados antigos não foram apagados nem carregados para outras contas.</p><button disabled={busy} className={button} onClick={initialize}>{busy ? 'Verificando…' : 'Verificar configuração'}</button></section>}
    {session && administration && <SecureAdministration onClose={() => {setAdministration(false); void perform(async()=>setClinicContext(await secureApi('clinic.context')));}}/>}
    {session && !administration && <fieldset disabled={busy} className="max-w-[1700px] mx-auto space-y-4">
      <div className="grid lg:grid-cols-[300px_1fr] gap-4 print:block">
        <aside className="bg-white rounded p-4 space-y-3 print:hidden"><h2 className="font-bold">Pacientes</h2><input aria-label="Buscar paciente" className={field} value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar pelo nome"/>
          {patients.filter(p => p.name.toLowerCase().includes(search.toLowerCase())).map(p => <button key={p.id} className={`block text-left w-full border rounded p-2 ${selected?.id === p.id ? 'bg-amber-50' : ''}`} onClick={() => void perform(() => choose(p))}>{p.name}<small className="block">{p.canRead ? 'Acesso autorizado' : 'Solicitar autorização'}</small></button>)}
          {next && <button onClick={() => void perform(() => list(next))}>Carregar mais</button>}
          <details><summary>Novo cadastro</summary><form className="space-y-2 mt-2" onSubmit={e => {e.preventDefault(); const f = e.currentTarget, v = Object.fromEntries(new FormData(f)); void perform(async () => {await secureApi('patients.create', undefined, {demographics: v, ownerUid: v.ownerUid}); f.reset(); await list(); setNotice('Cadastro criado. Selecione o paciente para confirmar o contato por código.');});}}>
            <input className={field} name="name" placeholder="Nome completo" required/><input className={field} name="email" type="email" placeholder="E-mail do paciente" required/>
            <input className={field} name="phone" placeholder="Telefone"/><input className={field} name="cpf" placeholder="CPF"/><input aria-label="Data de nascimento" className={field} name="birthDate" type="date"/>
            <label>Profissional responsável<select className={field} name="ownerUid" required defaultValue={session.actor.role !== 'receptionist' ? session.actor.uid : ''}><option value="">Selecione</option>{members.filter(m => m.role !== 'receptionist' && (session.actor.role !== 'dentist' || m.uid === session.actor.uid)).map(m => <option key={m.uid} value={m.uid}>{m.name}</option>)}</select></label>
            <p className="text-xs">Confira a identidade do paciente e o contato informado antes de cadastrar.</p><button className={button}>Cadastrar</button>
          </form></details>
          {session.actor.role === 'admin' && <details><summary>Importar um paciente do navegador</summary><p className="text-xs my-2">Confira o vínculo do responsável antes de importar. Esta operação administrativa excepcional fica registrada. Os dados antigos permanecem intactos. Use o identificador do paciente no backup existente.</p><form onSubmit={e => {e.preventDefault(); const f = e.currentTarget; void perform(() => importLocal(f));}}><input className={field} name="legacyId" placeholder="Identificador do paciente" required/><select className={field} name="ownerUid" required><option value="">Profissional responsável</option>{members.filter(m=>m.role!=='receptionist').map(m=><option key={m.uid} value={m.uid}>{m.name}</option>)}</select><input className={field} name="reason" minLength={15} required placeholder="Origem dos dados e motivo da importação"/><input className={field} name="password" type="password" autoComplete="current-password" required placeholder="Confirme sua senha"/><button className={button}>Importar com histórico</button></form></details>}
          {session.actor.role === 'admin' && <button className={button} onClick={()=>{if(!dirty||confirm('Descartar alterações não salvas e abrir configurações?')){setBundle(null);setDirty(false);setAdministration(true);}}}>Configurações e estoque</button>}
          {session.actor.role === 'admin' && <details><summary>Equipe e auditoria</summary><details><summary>Criar nova conta</summary><form className="space-y-2" onSubmit={e=>{e.preventDefault();const f=e.currentTarget,v=Object.fromEntries(new FormData(f));void perform(async()=>{await secureApi('members.create',undefined,v);setMembers(await secureApi('members.list'));f.reset();setNotice('Conta criada com vínculo à clínica.');});}}><input className={field} name="name" required placeholder="Nome completo"/><input className={field} name="email" type="email" autoComplete="off" required placeholder="E-mail da nova conta"/><input className={field} name="password" type="password" autoComplete="new-password" minLength={12} required placeholder="Nova senha (12 caracteres ou mais)"/><input className={field} name="confirmation" type="password" autoComplete="new-password" minLength={12} required placeholder="Confirme a nova senha"/><select className={field} name="role"><option value="dentist">Dentista</option><option value="receptionist">Recepção</option><option value="admin">Administrador</option></select><button className={button}>Criar conta</button></form></details><p className="text-sm">Vincule o UID de uma conta já criada no Firebase Authentication.</p><form className="space-y-2" onSubmit={e => {e.preventDefault(); const f = e.currentTarget, v = Object.fromEntries(new FormData(f)); void perform(async () => {await secureApi('members.save', undefined, {...v, active: v.active === 'true'}); setMembers(await secureApi('members.list')); f.reset(); setNotice('Vínculo atualizado e registrado.');});}}><input name="uid" className={field} placeholder="UID da conta" required/><select name="role" className={field}><option value="dentist">Dentista</option><option value="receptionist">Recepção</option><option value="admin">Administrador</option></select><select name="active" className={field}><option value="true">Ativo</option><option value="false">Bloqueado</option></select><button className={button}>Salvar vínculo</button></form><button onClick={() => void perform(async () => {setAudit(await secureApi('audit.list'));})}>Consultar auditoria</button><pre className="text-xs whitespace-pre-wrap max-h-80 overflow-auto">{audit.length ? JSON.stringify(audit, null, 2) : ''}</pre>{audit.length === 100 && <button onClick={() => void perform(async () => setAudit(await secureApi('audit.list', undefined, {after: audit.at(-1).id})))}>Próxima página</button>}</details>}
        </aside>
        <section className="min-w-0 space-y-4">{!selected ? <p className="bg-white p-6 rounded">Selecione um paciente para consultar cadastro, agenda e autorizações.</p> : <>
          <section className="bg-white p-4 rounded space-y-3 print:hidden"><h2 className="font-bold text-lg">{selected.name}</h2><p>{selected.email} · {selected.phone}</p>
            <details><summary>Editar cadastro</summary><form key={selected.id} className="grid sm:grid-cols-2 gap-2 mt-2" onSubmit={e => {e.preventDefault(); const v = Object.fromEntries(new FormData(e.currentTarget)); void perform(async () => {await secureApi('patients.update', selected.id, {demographics: v}); setSelected({...selected, ...v} as Person); setBundle(null); setDirty(false); await list(); setNotice('Cadastro atualizado.');});}}>{['name','email','phone','cpf','birthDate'].map(k => <label key={k}>{({name:'Nome',email:'E-mail confirmado',phone:'Telefone',cpf:'CPF',birthDate:'Nascimento'} as any)[k]}<input className={field} name={k} defaultValue={(selected as any)[k]} readOnly={k === 'email'} required={['name','email'].includes(k)}/></label>)}<button className={button}>Salvar cadastro</button></form></details>
            <div className="flex gap-2 flex-wrap">{session.actor.role !== 'receptionist' && <button className={button} onClick={() => void perform(open)}>Abrir prontuário</button>}<button className={button} onClick={() => void perform(async () => setAccess(await secureApi('access.list', selected.id)))}>Atualizar autorizações</button></div>
            <details open={!bundle}><summary>Autorizações do paciente</summary><p className="text-sm">{access?.contactVerified ? 'Contato confirmado.' : 'Primeiro envie um código autorizando o profissional responsável para confirmar o contato.'} Uma autorização para atendimento dura 8 horas.</p>
              <form className="flex gap-2 flex-wrap mt-2" onSubmit={e => {e.preventDefault(); const v = Object.fromEntries(new FormData(e.currentTarget)); void perform(async () => {setRequest(await secureApi('access.request', selected.id, v)); setNotice('Código enviado ao paciente. Ele também recebeu um link para confirmar e suspender autorizações.');});}}><select aria-label="Profissional a autorizar" className={field} name="targetUid" required defaultValue={selected.ownerUid}>{members.filter(m => m.role !== 'receptionist').map(m => <option key={m.uid} value={m.uid}>{m.name}</option>)}</select><select aria-label="Duração" className={field} name="duration"><option value="visit">Somente este atendimento (8 horas)</option><option value="until_revoked">Até o paciente suspender</option></select><button className={button}>Enviar código ao paciente</button></form>
              {request && <form className="flex gap-2 my-3" onSubmit={e => {e.preventDefault(); const f = e.currentTarget, code = new FormData(f).get('code'); void perform(async () => {await secureApi('access.confirm', selected.id, {requestId: request.requestId, code}); setRequest(null); setAccess(await secureApi('access.list', selected.id)); await list(); setNotice('Autorização registrada.');});}}><input aria-label="Código informado pelo paciente" className={field} name="code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} placeholder="Código de 6 dígitos" required/><button className={button}>Confirmar autorização</button></form>}
              {Object.entries(access?.grants || {}).map(([uid,g]: any) => <p key={uid}>{members.find(m => m.uid === uid)?.name || uid}: {g.status === 'suspended' ? 'suspenso' : g.expiresAt && g.expiresAt <= Date.now() ? 'expirado' : 'autorizado'}</p>)}
            </details>
            {session.actor.role === 'admin' && <details><summary>Acesso excepcional · somente leitura</summary><form className="space-y-2" onSubmit={e => {e.preventDefault(); const f = e.currentTarget, v = new FormData(f); void perform(async () => {if (!auth.currentUser?.email) throw Error('Entre novamente.'); await reauthenticateWithCredential(auth.currentUser, EmailAuthProvider.credential(auth.currentUser.email, String(v.get('password')))); await auth.currentUser.getIdToken(true); f.reset(); await secureApi('access.exception', selected.id, {reason: v.get('reason')}); await open(); setNotice('Acesso excepcional por 15 minutos. Paciente notificado.');});}}><textarea name="reason" className={field} required minLength={15} placeholder="Descreva a necessidade excepcional"/><input name="password" className={field} type="password" autoComplete="current-password" required placeholder="Confirme sua senha"/><button className={button}>Registrar justificativa e acessar</button></form></details>}
            <details><summary>Agenda do paciente</summary>{appointments.map(a => <p key={a.id}>{a.date} às {a.time} · {members.find(m => m.uid === a.professionalUid)?.name} · {a.status} <button onClick={() => void perform(async () => {await secureApi('appointments.save', selected.id, {...a, status: 'cancelado'}); setAppointments(await secureApi('appointments.list', selected.id));})}>Cancelar</button></p>)}<form className="grid sm:grid-cols-2 gap-2 mt-2" onSubmit={e => {e.preventDefault(); const f = e.currentTarget, v = Object.fromEntries(new FormData(f)); void perform(async () => {await secureApi('appointments.save', selected.id, {...v,status:'agendado'}); setAppointments(await secureApi('appointments.list', selected.id)); f.reset();});}}><input aria-label="Data" className={field} name="date" type="date" required/><input aria-label="Horário" className={field} name="time" type="time" required/><select aria-label="Profissional" className={field} name="professionalUid">{members.filter(m => m.role !== 'receptionist').map(m => <option key={m.uid} value={m.uid}>{m.name}</option>)}</select><button className={button}>Agendar</button></form></details>
          </section>
          {bundle && <section className="bg-white rounded border border-stone-300 relative">
            <div className="sticky top-0 z-40 bg-amber-50 p-3 border-b space-y-2 print:hidden"><strong>{bundle.readOnly ? 'Acesso excepcional: somente leitura' : dirty ? 'Alterações pendentes — salve a versão abaixo antes de sair' : `Versão ${bundle.revision} · carregada do servidor`}</strong>
              {!bundle.readOnly && <form className="flex flex-wrap gap-2" onSubmit={e => {e.preventDefault(); const f = e.currentTarget; void perform(() => save(f));}}><input className="border rounded p-2 grow" name="reason" required minLength={5} maxLength={500} placeholder="Motivo: atendimento, complemento ou correção"/><button disabled={busy || !dirty} className={button}>Salvar versão no servidor</button></form>}
              <button onClick={() => void perform(async () => setHistory(await secureApi('clinical.history', selected.id)))}>Histórico de versões</button>
              {history.map(v => <div key={v.id}>{v.revision} · {new Date(v.at).toLocaleString('pt-BR')} · {v.reason} <button onClick={() => void perform(async () => {const value = await secureApi('clinical.version', selected.id, {versionId: v.id}); setBundle({...value, readOnly: true});})}>Consultar versão preservada</button></div>)}
            </div>
            {masked && <p className="p-8">Confirmando autorização…</p>}<div hidden={masked}>{bundle.readOnly ? <div className="p-4"><h3 className="font-bold">Conteúdo preservado do prontuário</h3><p>Visualização somente leitura. Use “Abrir prontuário” para retornar à versão atual.</p><pre className="whitespace-pre-wrap break-words text-sm">{JSON.stringify(bundle.workspace, null, 2)}</pre><button className={`${button} print:hidden`} onClick={() => {void authorizeWorkspaceAction('print').then(()=>window.print()).catch(e=>setError(e.message));}}>Imprimir</button></div> : <AppProvider key={`${selected.id}:${bundle.revision}`} secure={{patientId:selected.id, initialStorage:seed, onChange}}><DomainProviders><ClinicalViews/></DomainProviders></AppProvider>}</div>
          </section>}
        </> }</section>
      </div>
    </fieldset>}
  </main>;
}
