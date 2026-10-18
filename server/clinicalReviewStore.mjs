import { DatabaseSync } from 'node:sqlite';
import { statSync } from 'node:fs';

export class ClinicalReviewError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}
const denied = () => { throw new ClinicalReviewError(403, 'Acesso não autorizado.'); };
const invalid = () => { throw new ClinicalReviewError(400, 'Confira os campos informados.'); };
const validId = value => typeof value === 'string' && value.length > 0 && value.length <= 200;
const pickStrings = (source, keys) => Object.fromEntries(keys
  .filter(key => typeof source?.[key] === 'string')
  .map(key => [key, source[key]]));

// Deliberately excludes anamnesis, pictures, notes, document snapshots and arbitrary future fields.
export function patientDemographics(patient) {
  return {
    ...pickStrings(patient, ['id', 'name', 'cpf', 'rg', 'birthDate', 'gender', 'phone', 'email',
      'profession', 'healthInsurance', 'insuranceNumber', 'status', 'createdAt',
      'preferredClinicId', 'preferredClinicName', 'preferredDentistName']),
    address: pickStrings(patient.address, ['street', 'number', 'neighborhood', 'city', 'state', 'cep', 'complement']),
  };
}

/** Review-only access to an existing staged DB. No writes to the clinical source or catalog. */
export function openClinicalReviewStore(filename, { resolveSession, resolveAccount, now = Date.now }) {
  if (!filename || filename === ':memory:' || !statSync(filename).isFile()) throw Error('Informe um banco de conferência existente.');
  // Validate before opening for writes. A wrong path must never create a database or change accounts.sqlite.
  const check = new DatabaseSync(filename, { readOnly: true });
  try {
    if (check.prepare('SELECT state FROM migration WHERE id=1').get()?.state !== 'staged_not_active') {
      throw Error('Banco não identificado como cópia de conferência.');
    }
    const version = check.prepare('PRAGMA user_version').get().user_version;
    if (![1, 2].includes(version)) throw Error('Versão do banco não suportada.');
  } finally { check.close(); }
  const db = new DatabaseSync(filename);
  try {
    db.exec('PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000; PRAGMA synchronous=FULL; BEGIN IMMEDIATE;');
    const version = db.prepare('PRAGMA user_version').get().user_version;
    if (version === 1) {
      db.exec(`ALTER TABLE patient_access ADD COLUMN professional_id TEXT;
        ALTER TABLE patient_access ADD COLUMN expires_at INTEGER;
        ALTER TABLE patient_access ADD COLUMN granted_by TEXT;
        ALTER TABLE patient_access ADD COLUMN consent_reference TEXT;
        ALTER TABLE patient_access ADD COLUMN granted_at INTEGER;
        ALTER TABLE patient_access ADD COLUMN version INTEGER NOT NULL DEFAULT 0;
        CREATE TABLE clinical_access_events (
          id INTEGER PRIMARY KEY, occurred_at INTEGER NOT NULL, actor_uid TEXT NOT NULL,
          action TEXT NOT NULL, patient_id TEXT, outcome TEXT NOT NULL,
          details_json TEXT NOT NULL CHECK(json_valid(details_json))
        );
        CREATE TRIGGER clinical_events_no_update BEFORE UPDATE ON clinical_access_events
          BEGIN SELECT RAISE(ABORT,'Audit events cannot be updated'); END;
        CREATE TRIGGER clinical_events_no_delete BEFORE DELETE ON clinical_access_events
          BEGIN SELECT RAISE(ABORT,'Audit events cannot be deleted'); END;
        PRAGMA user_version=2;`);
    }
    db.exec('COMMIT');
  } catch (error) { try { db.exec('ROLLBACK'); } catch {} db.close(); throw error; }
  const event = (actor, action, patientId, outcome, details = {}) => db.prepare(
    'INSERT INTO clinical_access_events(occurred_at,actor_uid,action,patient_id,outcome,details_json) VALUES(?,?,?,?,?,?)'
  ).run(now(), actor.uid, action, patientId ?? null, outcome, JSON.stringify(details));
  function identity(token) {
    try {
      const actor = resolveSession(token);
      if (!validId(actor?.uid) || !['admin', 'dentist', 'receptionist'].includes(actor.role)) throw Error();
      return actor;
    } catch { throw new ClinicalReviewError(401, 'Sessão inválida. Entre novamente.'); }
  }
  function audited(token, action, patientId, work) {
    const actor = identity(token);
    if (patientId !== null && !validId(patientId)) invalid();
    db.exec('BEGIN IMMEDIATE');
    try {
      const result = work(actor);
      event(actor, action, patientId, 'allowed', result.audit);
      db.exec('COMMIT');
      return result.value;
    } catch (error) {
      db.exec('ROLLBACK');
      if (error instanceof ClinicalReviewError) event(actor, action, patientId, 'denied', { status: error.status });
      throw error;
    }
  }
  function requireClinical(actor, patientId) {
    if (actor.role !== 'dentist' || !validId(actor.professionalId)) denied();
    const grant = db.prepare('SELECT * FROM patient_access WHERE patient_id=? AND account_uid=?').get(patientId, actor.uid);
    if (!grant || grant.professional_id !== actor.professionalId || grant.expires_at <= now() ||
        grant.expires_at == null || !['read', 'write'].includes(grant.permission)) denied();
  }
  const readRecord = patientId => {
    const row = db.prepare('SELECT record_json FROM patient_records WHERE patient_id=?').get(patientId);
    if (!row) denied(); // Do not disclose whether a non-authorized patient exists.
    return JSON.parse(row.record_json);
  };
  function canViewRegistration(actor, patientId) {
    if (actor.role === 'dentist') requireClinical(actor, patientId);
    // Admin/reception can see ONLY the explicitly projected registration fields.
  }
  return {
    close: () => db.close(),
    status: token => audited(token, 'review-status', null, () => ({ value: { mode: 'review_only', schemaVersion: 2 } })),
    deniedMutation: (token, patientId) => {
      const actor = identity(token);
      event(actor, 'access-reauthentication', validId(patientId) ? patientId : null, 'denied');
    },
    demographics: (token, patientId) => audited(token, 'demographics-read', patientId, actor => {
      canViewRegistration(actor, patientId);
      return { value: patientDemographics(readRecord(patientId).patient) };
    }),
    patientList: (token, after = '', limit = 50) => audited(token, 'patients-list', null, actor => {
      if (typeof after !== 'string' || after.length > 200 || !Number.isInteger(limit) || limit < 1 || limit > 100) invalid();
      const rows = actor.role === 'dentist'
        ? db.prepare(`SELECT r.patient_id, r.record_json FROM patient_records r JOIN patient_access a
            ON a.patient_id=r.patient_id WHERE a.account_uid=? AND a.professional_id=?
            AND a.expires_at>? AND a.permission IN ('read','write') AND r.patient_id>?
            ORDER BY r.patient_id LIMIT ?`).all(actor.uid, actor.professionalId || '', now(), after, limit + 1)
        : db.prepare('SELECT patient_id, record_json FROM patient_records WHERE patient_id>? ORDER BY patient_id LIMIT ?').all(after, limit + 1);
      const selected = rows.slice(0, limit);
      return { value: { patients: selected.map(row => patientDemographics(JSON.parse(row.record_json).patient)),
        next: rows.length > limit ? selected.at(-1).patient_id : null }, audit: { count: selected.length } };
    }),
    appointments: (token, patientId) => audited(token, 'appointments-read', patientId, actor => {
      canViewRegistration(actor, patientId);
      const appointments = readRecord(patientId).collections.appointments ?? [];
      return { value: appointments.map(item => ({
        ...pickStrings(item, ['id', 'patientId', 'patientName', 'patientPhone', 'dentistName',
          'professionalId', 'clinicId', 'clinicName', 'date', 'time', 'status']),
        ...(typeof item.durationMinutes === 'number' ? { durationMinutes: item.durationMinutes } : {}),
      })) };
    }),
    record: (token, patientId) => audited(token, 'clinical-record-read', patientId, actor => {
      requireClinical(actor, patientId);
      return { value: readRecord(patientId) };
    }),
    catalog: (token, after = '', limit = 50) => audited(token, 'catalog-read', null, actor => {
      if (!['admin', 'dentist'].includes(actor.role)) denied();
      if (typeof after !== 'string' || after.length > 200 || !Number.isInteger(limit) || limit < 1 || limit > 100) invalid();
      const rows = db.prepare('SELECT * FROM procedure_catalog WHERE code>? ORDER BY code LIMIT ?').all(after, limit + 1);
      return { value: { procedures: rows.slice(0, limit).map(row => ({ code: row.code, revision: row.revision, procedure: JSON.parse(row.procedure_json) })),
        next: rows.length > limit ? rows[limit - 1].code : null } };
    }),
    grant: (token, patientId, input) => audited(token, 'patient-access-grant', patientId, actor => {
      if (actor.role !== 'admin') denied();
      if (input && Object.hasOwn(input, 'validForDays') && Object.hasOwn(input, 'expiresAt')) invalid();
      const expiresAt = input && Object.hasOwn(input, 'validForDays')
        ? (Number.isInteger(input.validForDays) && input.validForDays >= 1 && input.validForDays <= 30
          ? now() + input.validForDays * 86400000 : NaN)
        : input?.expiresAt;
      if (!input || !validId(input.accountUid) || !['read', 'write'].includes(input.permission) ||
          input.patientConfirmed !== true || input.confirmationMethod !== 'in_person' ||
          typeof input.consentReference !== 'string' || input.consentReference.trim().length < 5 || input.consentReference.length > 500 ||
          !Number.isSafeInteger(expiresAt) || expiresAt <= now() || expiresAt > now() + 30 * 86400000 ||
          !Number.isSafeInteger(input.expectedVersion) || input.expectedVersion < 0) invalid();
      const target = resolveAccount(token, input.accountUid);
      if (!target || target.role !== 'dentist' || !validId(target.professionalId)) denied();
      const professionalsRow = db.prepare("SELECT data_json FROM clinic_data WHERE section='professionals'").get();
      const professionals = professionalsRow ? JSON.parse(professionalsRow.data_json) : [];
      if (!professionals.some(professional => professional.id === target.professionalId)) denied();
      readRecord(patientId);
      const previous = db.prepare('SELECT version FROM patient_access WHERE patient_id=? AND account_uid=?').get(patientId, target.uid);
      const version = previous?.version ?? 0;
      if (input.expectedVersion !== version) throw new ClinicalReviewError(409, 'A autorização mudou. Consulte a versão atual.');
      db.prepare(`INSERT INTO patient_access(patient_id,account_uid,permission,professional_id,expires_at,granted_by,consent_reference,granted_at,version)
        VALUES(?,?,?,?,?,?,?,?,?) ON CONFLICT(patient_id,account_uid) DO UPDATE SET
        permission=excluded.permission,professional_id=excluded.professional_id,expires_at=excluded.expires_at,
        granted_by=excluded.granted_by,consent_reference=excluded.consent_reference,granted_at=excluded.granted_at,version=excluded.version`)
        .run(patientId, target.uid, input.permission, target.professionalId, expiresAt, actor.uid, input.consentReference.trim(), now(), version + 1);
      return { value: { version: version + 1, expiresAt }, audit: { targetUid: target.uid,
        professionalId: target.professionalId, permission: input.permission, expiresAt,
        confirmationMethod: 'in_person', consentReference: input.consentReference.trim(), version: version + 1 } };
    }),
    grants: (token, patientId) => audited(token, 'patient-access-list', patientId, actor => {
      if (actor.role !== 'admin') denied();
      readRecord(patientId);
      return { value: db.prepare(`SELECT account_uid,professional_id,permission,expires_at,granted_by,granted_at,version
        FROM patient_access WHERE patient_id=? ORDER BY account_uid`).all(patientId) };
    }),
    revoke: (token, patientId, input) => audited(token, 'patient-access-revoke', patientId, actor => {
      if (actor.role !== 'admin') denied();
      if (!input || !validId(input.accountUid) || !Number.isSafeInteger(input.expectedVersion) || input.expectedVersion < 1) invalid();
      const result = db.prepare(`UPDATE patient_access SET expires_at=0,version=version+1
        WHERE patient_id=? AND account_uid=? AND version=?`).run(patientId, input.accountUid, input.expectedVersion);
      if (!result.changes) throw new ClinicalReviewError(409, 'A autorização mudou. Consulte a versão atual.');
      return { value: { version: input.expectedVersion + 1, revoked: true }, audit: { targetUid: input.accountUid, version: input.expectedVersion + 1 } };
    }),
    events: (token, after = 0) => audited(token, 'audit-read', null, actor => {
      if (actor.role !== 'admin') denied();
      if (!Number.isSafeInteger(after) || after < 0) invalid();
      return { value: db.prepare('SELECT * FROM clinical_access_events WHERE id>? ORDER BY id LIMIT 100').all(after) };
    }),
  };
}
