import { DatabaseSync } from 'node:sqlite';
import { randomUUID, createHash } from 'node:crypto';
import { existsSync } from 'node:fs';

export class OdontogramStoreError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}
const deny = () => { throw new OdontogramStoreError(403, 'Acesso clínico não autorizado.'); };
const invalid = () => { throw new OdontogramStoreError(400, 'Dados do odontograma inválidos.'); };
const validId = x => typeof x === 'string' && x.length > 0 && x.length <= 200 && !/[\x00-\x1f]/.test(x);
const validateConditions = conditions => {
  if (!Array.isArray(conditions) || conditions.length > 52) invalid();
  const used = new Set();
  for (const tooth of conditions) {
    if (!tooth || typeof tooth !== 'object' || Array.isArray(tooth) || !Number.isInteger(tooth.toothNumber) ||
        !([1,2,3,4,5,6,7,8].includes(Math.floor(tooth.toothNumber / 10))) ||
        tooth.toothNumber % 10 < 1 || tooth.toothNumber % 10 > (tooth.toothNumber < 50 ? 8 : 5) ||
        used.has(tooth.toothNumber)) invalid();
    used.add(tooth.toothNumber);
  }
  const encoded = JSON.stringify(conditions);
  if (encoded.length > 250_000) invalid();
  return encoded;
};

/** ISOLATED TEST-ONLY storage. Caller supplies independently verified session and per-patient access.
 * Does NOT mount routes, touch accounts, or open any existing clinical database.
 */
export function openOdontogramStore(filename, { resolveSession, authorizePatient, now = Date.now }) {
  if (!filename || filename === ':memory:' || existsSync(filename)) throw Error('Use um caminho NOVO para um banco temporário de teste.');
  if (typeof resolveSession !== 'function' || typeof authorizePatient !== 'function') throw Error('Verificadores obrigatórios.');
  const db = new DatabaseSync(filename);
  db.exec(`PRAGMA foreign_keys=ON; PRAGMA journal_mode=DELETE; PRAGMA synchronous=FULL;
    CREATE TABLE odontogram_current(patient_id TEXT PRIMARY KEY,version INTEGER NOT NULL CHECK(version>=1),conditions_json TEXT NOT NULL CHECK(json_valid(conditions_json)),updated_at INTEGER NOT NULL,updated_by TEXT NOT NULL);
    CREATE TABLE odontogram_history(id TEXT PRIMARY KEY,patient_id TEXT NOT NULL,version INTEGER NOT NULL,exam_date TEXT NOT NULL,title TEXT NOT NULL,conditions_json TEXT NOT NULL CHECK(json_valid(conditions_json)),created_at INTEGER NOT NULL,created_by TEXT NOT NULL);
    CREATE TABLE odontogram_documents(id TEXT PRIMARY KEY,patient_id TEXT NOT NULL,archive_id TEXT NOT NULL UNIQUE,filename TEXT NOT NULL,pdf BLOB NOT NULL CHECK(length(pdf)>30),created_at INTEGER NOT NULL);
    CREATE TABLE odontogram_evolutions(id TEXT PRIMARY KEY,patient_id TEXT NOT NULL,archive_id TEXT NOT NULL UNIQUE,description TEXT NOT NULL,exam_date TEXT NOT NULL,created_at INTEGER NOT NULL,created_by TEXT NOT NULL);
    CREATE TABLE odontogram_requests(patient_id TEXT NOT NULL,request_id TEXT NOT NULL,archive_id TEXT NOT NULL,version INTEGER NOT NULL,payload_hash TEXT NOT NULL,PRIMARY KEY(patient_id,request_id));
    CREATE TABLE odontogram_events(id INTEGER PRIMARY KEY AUTOINCREMENT,patient_id TEXT NOT NULL,actor_uid TEXT NOT NULL,operation TEXT NOT NULL,outcome TEXT NOT NULL,occurred_at INTEGER NOT NULL);
    CREATE TRIGGER documents_no_update BEFORE UPDATE ON odontogram_documents BEGIN SELECT RAISE(ABORT,'Immutable document'); END;
    CREATE TRIGGER documents_no_delete BEFORE DELETE ON odontogram_documents BEGIN SELECT RAISE(ABORT,'Immutable document'); END;
    CREATE TRIGGER evolutions_no_update BEFORE UPDATE ON odontogram_evolutions BEGIN SELECT RAISE(ABORT,'Immutable evolution'); END;
    CREATE TRIGGER evolutions_no_delete BEFORE DELETE ON odontogram_evolutions BEGIN SELECT RAISE(ABORT,'Immutable evolution'); END;
    CREATE TRIGGER history_no_update BEFORE UPDATE ON odontogram_history BEGIN SELECT RAISE(ABORT,'Immutable history'); END;
    CREATE TRIGGER history_no_delete BEFORE DELETE ON odontogram_history BEGIN SELECT RAISE(ABORT,'Immutable history'); END;
    CREATE TRIGGER audit_no_update BEFORE UPDATE ON odontogram_events BEGIN SELECT RAISE(ABORT,'Immutable audit'); END;
    CREATE TRIGGER audit_no_delete BEFORE DELETE ON odontogram_events BEGIN SELECT RAISE(ABORT,'Immutable audit'); END;`);
  function authorize(token,patientId,permission) {
    if (!validId(patientId)) invalid();
    let actor;
    try { actor = resolveSession(token); } catch { throw new OdontogramStoreError(401,'Sessão inválida.'); }
    if (!actor || actor.role !== 'dentist' || !validId(actor.uid) || !validId(actor.professionalId) ||
        authorizePatient(actor,patientId,permission) !== true) deny();
    return actor;
  }
  function log(patientId, uid, operation, outcome) {
    db.prepare('INSERT INTO odontogram_events(patient_id,actor_uid,operation,outcome,occurred_at) VALUES(?,?,?,?,?)')
      .run(patientId,uid,operation,outcome,now());
  }
  function run(token,patientId,permission,operation,fn) {
    const actor = authorize(token,patientId,permission);
    db.exec('BEGIN IMMEDIATE');
    try { const value = fn(actor); log(patientId,actor.uid,operation,'allowed'); db.exec('COMMIT'); return value; }
    catch(error) { db.exec('ROLLBACK'); throw error; }
  }
  const currentRow = id => db.prepare('SELECT * FROM odontogram_current WHERE patient_id=?').get(id);
  return {
    close: () => db.close(),
    read: (token,id) => run(token,id,'read','read',() => {
      const row = currentRow(id); return row ? {version:row.version,conditions:JSON.parse(row.conditions_json)} : {version:0,conditions:[]};
    }),
    save: (token,id,{expectedVersion,conditions}) => run(token,id,'write','save',actor => {
      if (!Number.isSafeInteger(expectedVersion) || expectedVersion < 0) invalid();
      const payload=validateConditions(conditions);
      const row=currentRow(id);
      if ((row?.version ?? 0)!==expectedVersion) throw new OdontogramStoreError(409,'Odontograma alterado em outra sessão. Recarregue antes de salvar.');
      const version=expectedVersion+1;
      if (row) db.prepare('UPDATE odontogram_current SET version=?,conditions_json=?,updated_at=?,updated_by=? WHERE patient_id=?').run(version,payload,now(),actor.uid,id);
      else db.prepare('INSERT INTO odontogram_current VALUES(?,?,?,?,?)').run(id,version,payload,now(),actor.uid);
      return {version};
    }),
    archive: (token,id,{expectedVersion,date,title}) => run(token,id,'write','archive',actor => {
      if (!Number.isSafeInteger(expectedVersion) || expectedVersion < 1 ||
          typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(Date.parse(date+'T12:00:00Z')) ||
          new Date(date+'T12:00:00Z').toISOString().slice(0,10)!==date ||
          typeof title !== 'string' || !title.trim() || title.length>200) invalid();
      const row=currentRow(id);
      if (!row || row.version!==expectedVersion) throw new OdontogramStoreError(409,'Versão do odontograma desatualizada.');
      const archiveId=randomUUID();
      db.prepare('INSERT INTO odontogram_history VALUES(?,?,?,?,?,?,?,?)').run(archiveId,id,row.version,date,title.trim(),row.conditions_json,now(),actor.uid);
      return {id:archiveId,version:row.version};
    }),
    // Clinical completion: the current odontogram, historical snapshot, PDF and evolution
    // are committed in ONE SQLite transaction, with a patient-scoped idempotency key.
    completeEvaluation: (token,id,input) => run(token,id,'write','evaluation-completed',actor => {
      if (!input || typeof input !== 'object' || Array.isArray(input)) invalid();
      const {requestId,expectedVersion,conditions,date,title,description,pdfBase64,filename} = input;
      if (!validId(requestId) || !Number.isSafeInteger(expectedVersion) || expectedVersion<0 ||
          typeof date!=='string' || !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
          !Number.isFinite(Date.parse(date+'T12:00:00Z')) || new Date(date+'T12:00:00Z').toISOString().slice(0,10)!==date ||
          typeof title!=='string' || !title.trim() || title.length>200 ||
          typeof description!=='string' || description.length>20000 ||
          typeof filename!=='string' || !/^[\w.\- ]{1,160}\.pdf$/i.test(filename) ||
          typeof pdfBase64!=='string' || pdfBase64.length>3_000_000 || pdfBase64.length<40 ||
          !/^[A-Za-z0-9+/]+={0,2}$/.test(pdfBase64)) invalid();
      const json=validateConditions(conditions);
      const pdf=Buffer.from(pdfBase64,'base64');
      if (pdf.length<40 || pdf.length>2_000_000 || pdf.subarray(0,5).toString()!=='%PDF-' ||
          !pdf.subarray(-2048).toString('latin1').includes('%%EOF')) invalid();
      const payloadHash=createHash('sha256').update(JSON.stringify({conditions,date,title,description,pdfBase64,filename})).digest('hex');
      const prior=db.prepare('SELECT archive_id,version,payload_hash FROM odontogram_requests WHERE patient_id=? AND request_id=?').get(id,requestId);
      if (prior && prior.payload_hash!==payloadHash) throw new OdontogramStoreError(409,'Identificador de operação reutilizado com dados diferentes.');
      if (prior) return {id:prior.archive_id,version:prior.version,alreadySaved:true};
      const row=currentRow(id);
      if ((row?.version??0)!==expectedVersion) throw new OdontogramStoreError(409,'Odontograma alterado em outra sessão. Recarregue antes de salvar.');
      const version=expectedVersion+1, at=now(), archiveId=randomUUID(), documentId=randomUUID(), evolutionId=randomUUID();
      if(row) db.prepare('UPDATE odontogram_current SET version=?,conditions_json=?,updated_at=?,updated_by=? WHERE patient_id=?').run(version,json,at,actor.uid,id);
      else db.prepare('INSERT INTO odontogram_current VALUES(?,?,?,?,?)').run(id,version,json,at,actor.uid);
      db.prepare('INSERT INTO odontogram_history VALUES(?,?,?,?,?,?,?,?)').run(archiveId,id,version,date,title.trim(),json,at,actor.uid);
      db.prepare('INSERT INTO odontogram_documents VALUES(?,?,?,?,?,?)').run(documentId,id,archiveId,filename,pdf,at);
      db.prepare('INSERT INTO odontogram_evolutions VALUES(?,?,?,?,?,?,?)').run(evolutionId,id,archiveId,description,date,at,actor.uid);
      db.prepare('INSERT INTO odontogram_requests VALUES(?,?,?,?,?)').run(id,requestId,archiveId,version,payloadHash);
      return {id:archiveId,documentId,evolutionId,version,alreadySaved:false};
    }),
    evaluationDocument: (token,id,archiveId) => run(token,id,'read','evaluation-document',() => {
      if (!validId(archiveId)) invalid();
      const doc=db.prepare('SELECT filename,pdf FROM odontogram_documents WHERE patient_id=? AND archive_id=?').get(id,archiveId);
      if(!doc) throw new OdontogramStoreError(404,'Documento não encontrado.');
      return {filename:doc.filename,pdfBase64:Buffer.from(doc.pdf).toString('base64')};
    }),
    evaluationEvolution: (token,id,archiveId) => run(token,id,'read','evaluation-evolution',() => {
      if (!validId(archiveId)) invalid();
      const row=db.prepare('SELECT description,exam_date AS date,created_at AS createdAt,created_by AS professionalUid FROM odontogram_evolutions WHERE patient_id=? AND archive_id=?').get(id,archiveId);
      if(!row) throw new OdontogramStoreError(404,'Evolução não encontrada.');
      return row;
    }),
    history: (token,id) => run(token,id,'read','history',() => db.prepare('SELECT id,version,exam_date AS date,title,conditions_json AS data FROM odontogram_history WHERE patient_id=? ORDER BY created_at DESC,id DESC LIMIT 100').all(id).map(r=>({...r,conditions:JSON.parse(r.data),data:undefined}))),
  };
}
