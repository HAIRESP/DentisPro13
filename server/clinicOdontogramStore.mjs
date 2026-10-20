import { DatabaseSync } from 'node:sqlite';
import { openOdontogramStore, OdontogramStoreError } from './odontogramStore.mjs';

// One local installation is one clinic workspace. No per-patient grant in this mode.
// Reception/admin settings permissions and the isolated review mode remain separate.
export function openClinicOdontogramStore(filename, authStore) {
  let registry;
  const session = token => {
    const actor = authStore.session(token);
    return {...actor, professionalId: actor.professionalId || actor.uid};
  };
  const dentist = token => {
    let actor;
    try { actor = session(token); } catch { throw new OdontogramStoreError(401, 'Sessão inválida.'); }
    if (actor.role !== 'dentist') throw new OdontogramStoreError(403, 'Entre com uma conta de dentista para abrir o odontograma.');
    return actor;
  };
  const core = openOdontogramStore(filename, {
    allowExisting: true, resolveSession: session,
    authorizePatient: (_actor, id) => {
      if (!registry.prepare('SELECT 1 FROM odontogram_patients WHERE patient_id=?').get(id))
        throw new OdontogramStoreError(404, 'Paciente ainda não vinculado ao odontograma SQLite.');
      return true;
    },
  });
  try {
    registry = new DatabaseSync(filename);
    registry.exec(`PRAGMA synchronous=FULL;
      CREATE TABLE IF NOT EXISTS odontogram_patients(patient_id TEXT PRIMARY KEY, patient_json TEXT NOT NULL CHECK(json_valid(patient_json)), created_by TEXT NOT NULL, created_at INTEGER NOT NULL);
      CREATE TABLE IF NOT EXISTS odontogram_authors(archive_id TEXT PRIMARY KEY REFERENCES odontogram_history(id), uid TEXT NOT NULL, name TEXT NOT NULL, professional_id TEXT NOT NULL);
      CREATE TRIGGER IF NOT EXISTS authors_no_update BEFORE UPDATE ON odontogram_authors BEGIN SELECT RAISE(ABORT,'Immutable author'); END;
      CREATE TRIGGER IF NOT EXISTS authors_no_delete BEFORE DELETE ON odontogram_authors BEGIN SELECT RAISE(ABORT,'Immutable author'); END;`);
  } catch (e) { registry?.close(); core.close(); throw e; }
  function identity(id, data) {
    if (typeof id !== 'string' || !id || id.length > 200 || /[\x00-\x1f]/.test(id) ||
        !data || data.id !== id || typeof data.name !== 'string' || !data.name.trim() || data.name.length > 200 ||
        (data.birthDate !== undefined && (typeof data.birthDate !== 'string' || data.birthDate.length > 20)))
      throw new OdontogramStoreError(400, 'Identificação do paciente inválida.');
    return {id, name: data.name.trim(), birthDate: data.birthDate || ''};
  }
  return {
    ...core,
    close() { registry.close(); core.close(); },
    patient(token, id) {
      const actor = dentist(token);
      const row = registry.prepare('SELECT patient_json FROM odontogram_patients WHERE patient_id=?').get(id);
      if (!row) throw new OdontogramStoreError(404, 'Paciente ainda não vinculado ao odontograma SQLite.');
      registry.prepare('INSERT INTO odontogram_events(patient_id,actor_uid,operation,outcome,occurred_at) VALUES(?,?,?,?,?)').run(id,actor.uid,'patient-read','allowed',Date.now());
      return {patient:JSON.parse(row.patient_json)};
    },
    registerPatient(token, id, data) {
      const actor = dentist(token), patient = identity(id,data);
      registry.exec('BEGIN IMMEDIATE');
      try {
        const old = registry.prepare('SELECT patient_json FROM odontogram_patients WHERE patient_id=?').get(id);
        if (old && JSON.stringify(JSON.parse(old.patient_json)) !== JSON.stringify(patient))
          throw new OdontogramStoreError(409, 'Este identificador já pertence a um cadastro diferente no SQLite. Confira nome e nascimento antes de continuar.');
        if (!old && registry.prepare('SELECT 1 FROM odontogram_current WHERE patient_id=?').get(id))
          throw new OdontogramStoreError(409, 'Existe um odontograma antigo sem vínculo cadastral. É necessária conferência antes de associar o paciente.');
        if (!old) registry.prepare('INSERT INTO odontogram_patients VALUES(?,?,?,?)').run(id,JSON.stringify(patient),actor.uid,Date.now());
        registry.prepare('INSERT INTO odontogram_events(patient_id,actor_uid,operation,outcome,occurred_at) VALUES(?,?,?,?,?)').run(id,actor.uid,'patient-linked','allowed',Date.now());
        registry.exec('COMMIT');return {patient};
      } catch(e) { registry.exec('ROLLBACK');throw e; }
    },
  };
}
