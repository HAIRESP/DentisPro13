import { createHash } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import { openSync, closeSync, rmSync, lstatSync } from 'node:fs';

const APP = 'DentisPro Dental Management System';
const MAX_BYTES = 256 * 1024 * 1024;
const lists = [
  'patients', 'appointments', 'inventory', 'financials', 'prescriptions',
  'clinicalEvolutions', 'tussProcedures', 'priceTables', 'treatmentPlans',
  'patientPayments', 'commissions', 'insuranceGuides', 'documentTemplates',
  'savedClinicDocuments', 'clinics', 'professionals',
];
const patientLists = new Set([
  'appointments', 'prescriptions', 'clinicalEvolutions', 'treatmentPlans',
  'patientPayments',
]);
const patientMaps = ['odontograms', 'odontogramSnapshots', 'clinicalExams'];
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const identifier = value => typeof value === 'string' && value.trim().length > 0;
function invalid(location) {
  // Locations contain schema names and indices only, never patient data.
  throw new Error(`Backup inválido em ${location}. Nenhum dado da origem foi alterado.`);
}

/** Validate the current JSON export without touching the filesystem or network. */
export function inspectClinicalBackup(bytes) {
  if (!Buffer.isBuffer(bytes) || bytes.length > MAX_BYTES) {
    throw new Error('O backup deve ter no máximo 256 MiB.');
  }
  let data;
  try {
    const source = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    data = JSON.parse(source.replace(/^\uFEFF/, ''));
  } catch { throw new Error('O arquivo não é um JSON UTF-8 válido.'); }
  if (!object(data) || data.app !== APP) invalid('app');
  for (const key of ['patients', 'appointments', 'inventory']) {
    if (!Object.hasOwn(data, key)) invalid(key);
  }
  for (const key of lists) {
    if (!Object.hasOwn(data, key)) continue;
    if (!Array.isArray(data[key])) invalid(key);
    const seen = new Set();
    for (const [index, entry] of data[key].entries()) {
      if (!object(entry)) invalid(`${key}[${index}]`);
      const id = entry[key === 'tussProcedures' ? 'code' : 'id'];
      if (!identifier(id) || seen.has(id)) invalid(`${key}[${index}].identificador`);
      seen.add(id);
    }
  }
  const patients = new Map(data.patients.map(patient => [patient.id, {
    patient, collections: {}, maps: {},
  }]));
  const clinic = {};
  const catalog = new Map((data.tussProcedures ?? []).map(procedure => [procedure.code, procedure]));
  const snapshots = [];
  let missingCatalogReferences = 0;
  const snapshot = (patientId, sourceKind, sourceId, item) => {
    if (item.tussCode != null && !identifier(item.tussCode)) invalid(`${sourceKind}.tussCode`);
    // Keep the actual historic item even when it has no TUSS code or was removed from the catalog.
    const procedure = catalog.get(item.tussCode);
    if (item.tussCode && !procedure) missingCatalogReferences++;
    snapshots.push({ patientId, sourceKind, sourceId, item,
      catalogAtImport: procedure ?? null });
  };
  for (const key of lists) {
    if (key === 'patients' || key === 'tussProcedures' || !Object.hasOwn(data, key)) continue;
    const unlinked = [];
    for (const [index, entry] of data[key].entries()) {
      if (entry.patientId != null) {
        if (!identifier(entry.patientId) || !patients.has(entry.patientId)) invalid(`${key}[${index}].patientId`);
        const record = patients.get(entry.patientId);
        (record.collections[key] ??= []).push(entry);
        if (key === 'appointments') snapshot(entry.patientId, key, entry.id, entry);
        if (key === 'treatmentPlans') {
          if (!Array.isArray(entry.items)) invalid(`${key}[${index}].items`);
          const itemIds = new Set();
          entry.items.forEach((item, i) => {
            if (!object(item) || !identifier(item.id) || itemIds.has(item.id)) invalid(`${key}[${index}].items[${i}]`);
            itemIds.add(item.id);
            snapshot(entry.patientId, key, `${entry.id}/${item.id}`, item);
          });
        }
      } else {
        if (patientLists.has(key)) invalid(`${key}[${index}].patientId`);
        // Legacy documents without patientId are preserved for manual reconciliation, never matched by name.
        unlinked.push(entry);
      }
    }
    clinic[key] = unlinked;
  }
  for (const key of patientMaps) {
    if (!Object.hasOwn(data, key)) continue;
    if (!object(data[key])) invalid(key);
    for (const [index, [patientId, value]] of Object.entries(data[key]).entries()) {
      if (!patients.has(patientId)) invalid(`${key}[${index}].patientId`);
      if (key === 'clinicalExams') {
        if (!object(value) || (value.patientId != null && value.patientId !== patientId)) invalid(`${key}[${index}]`);
      } else {
        if (!Array.isArray(value) || !value.every(object)) invalid(`${key}[${index}]`);
        if (key === 'odontogramSnapshots' && value.some(item => item.patientId !== patientId)) invalid(`${key}[${index}].patientId`);
      }
      patients.get(patientId).maps[key] = value;
    }
  }
  // Preserve unknown future fields and settings as well as the byte-exact original archive.
  const handled = new Set([...lists, ...patientMaps]);
  for (const [key, value] of Object.entries(data)) {
    if (!handled.has(key)) Object.defineProperty(clinic, key, { value, enumerable: true });
  }
  const media = { embedded: 0, external: 0, temporary: 0 };
  function countMedia(value) {
    if (typeof value === 'string') {
      if (/^data:/i.test(value)) media.embedded++;
      else if (/^(?:https?:|file:|\/\/)/i.test(value)) media.external++;
      else if (/^blob:/i.test(value)) media.temporary++;
    } else if (Array.isArray(value)) value.forEach(countMedia);
    else if (object(value)) Object.values(value).forEach(countMedia);
  }
  countMedia(data);
  const summary = {
    schemaVersion: 1,
    sourceSha256: createHash('sha256').update(bytes).digest('hex'),
    sourceBytes: bytes.length,
    counts: Object.fromEntries(lists.map(key => [key, data[key]?.length ?? 0])),
    missingSections: [...lists, ...patientMaps].filter(key => !Object.hasOwn(data, key)),
    unlinkedDocuments: (clinic.savedClinicDocuments ?? []).length,
    unlinkedInsuranceGuides: (clinic.insuranceGuides ?? []).length,
    unlinkedCommissions: (clinic.commissions ?? []).length,
    snapshots: snapshots.length,
    missingCatalogReferences,
    mediaReferences: media,
    state: 'staged_not_active',
    warnings: [
      'Cópia de conferência: a aplicação continua usando os dados atuais do navegador.',
      'Nenhuma permissão clínica ou consentimento foi inferido durante a importação.',
      'O catálogo copiado reflete a data da migração; não comprova sua versão na data do atendimento.',
      ...(media.external ? ['Existem referências externas. Seus arquivos não foram baixados nem validados para uso offline.'] : []),
      ...(media.temporary ? ['Existem referências blob temporárias. Exporte novamente os respectivos anexos antes da ativação.'] : []),
      ...((clinic.savedClinicDocuments ?? []).length ? ['Documentos sem patientId aguardam vinculação manual.'] : []),
      ...((clinic.insuranceGuides ?? []).length || (clinic.commissions ?? []).length
        ? ['Guias e comissões legadas sem patientId foram preservadas na área da clínica; não foram vinculadas por nome.'] : []),
    ],
  };
  return { patients, clinic, catalog, snapshots, summary };
}

/** Creates a NEW staging database. Never opens or overwrites any existing database. */
export function stageClinicalBackup(bytes, destination) {
  const plan = inspectClinicalBackup(bytes);
  if (!destination || destination === ':memory:') throw new Error('Informe um novo arquivo de banco de conferência.');
  for (const suffix of ['-journal', '-wal', '-shm']) {
    try {
      lstatSync(`${destination}${suffix}`);
      throw new Error('Existem arquivos auxiliares SQLite nesse destino. Escolha outro nome.');
    } catch (error) { if (error?.code !== 'ENOENT') throw error; }
  }
  // Exclusive reservation also rejects symlinks, existing accounts DBs and concurrent import attempts.
  const fd = openSync(destination, 'wx', 0o600);
  closeSync(fd);
  let db;
  try {
    db = new DatabaseSync(destination);
    db.exec(`PRAGMA foreign_keys=ON; PRAGMA journal_mode=DELETE; PRAGMA synchronous=FULL;
      BEGIN IMMEDIATE;
      PRAGMA user_version=1;
      CREATE TABLE migration (
        id INTEGER PRIMARY KEY CHECK(id=1), source_sha256 TEXT NOT NULL,
        imported_at TEXT NOT NULL, state TEXT NOT NULL CHECK(state='staged_not_active'),
        summary_json TEXT NOT NULL CHECK(json_valid(summary_json)), source_bytes BLOB NOT NULL
      );
      CREATE TABLE patient_records (
        patient_id TEXT PRIMARY KEY, record_json TEXT NOT NULL CHECK(json_valid(record_json))
      );
      CREATE TABLE procedure_catalog (
        code TEXT PRIMARY KEY, revision INTEGER NOT NULL CHECK(revision>0),
        procedure_json TEXT NOT NULL CHECK(json_valid(procedure_json))
      );
      CREATE TABLE procedure_snapshots (
        id INTEGER PRIMARY KEY, patient_id TEXT NOT NULL REFERENCES patient_records(patient_id),
        source_kind TEXT NOT NULL, source_id TEXT NOT NULL,
        historical_item_json TEXT NOT NULL CHECK(json_valid(historical_item_json)),
        catalog_at_import_json TEXT CHECK(json_valid(catalog_at_import_json))
      );
      CREATE TABLE clinic_data (
        section TEXT PRIMARY KEY, data_json TEXT NOT NULL CHECK(json_valid(data_json))
      );
      CREATE TABLE patient_access (
        patient_id TEXT NOT NULL REFERENCES patient_records(patient_id), account_uid TEXT NOT NULL,
        permission TEXT NOT NULL CHECK(permission IN ('read','write')),
        PRIMARY KEY(patient_id, account_uid)
      );
      CREATE TABLE migration_events (
        id INTEGER PRIMARY KEY, created_at TEXT NOT NULL, action TEXT NOT NULL,
        details_json TEXT NOT NULL CHECK(json_valid(details_json))
      );`);
    const now = new Date().toISOString();
    db.prepare('INSERT INTO migration VALUES(1,?,?,?,?,?)').run(
      plan.summary.sourceSha256, now, 'staged_not_active', JSON.stringify(plan.summary), bytes);
    const insertPatient = db.prepare('INSERT INTO patient_records VALUES(?,?)');
    for (const [id, record] of plan.patients) insertPatient.run(id, JSON.stringify(record));
    const insertProcedure = db.prepare('INSERT INTO procedure_catalog VALUES(?,1,?)');
    for (const [code, procedure] of plan.catalog) insertProcedure.run(code, JSON.stringify(procedure));
    const insertSnapshot = db.prepare('INSERT INTO procedure_snapshots(patient_id,source_kind,source_id,historical_item_json,catalog_at_import_json) VALUES(?,?,?,?,?)');
    for (const row of plan.snapshots) insertSnapshot.run(row.patientId, row.sourceKind, row.sourceId,
      JSON.stringify(row.item), row.catalogAtImport ? JSON.stringify(row.catalogAtImport) : null);
    const insertSection = db.prepare('INSERT INTO clinic_data VALUES(?,?)');
    for (const [section, value] of Object.entries(plan.clinic)) insertSection.run(section, JSON.stringify(value));
    db.prepare('INSERT INTO migration_events(created_at,action,details_json) VALUES(?,?,?)').run(
      now, 'staged_import', JSON.stringify({ sourceSha256: plan.summary.sourceSha256, counts: plan.summary.counts }));
    if (db.prepare('PRAGMA foreign_key_check').all().length) throw new Error('Falha nas referências internas.');
    db.exec('COMMIT');
    const integrity = db.prepare('PRAGMA integrity_check').get();
    if (integrity.integrity_check !== 'ok') throw new Error('Falha na integridade do banco de conferência.');
    return plan.summary;
  } catch (error) {
    if (db) { try { db.exec('ROLLBACK'); } catch { /* transaction may already be closed */ } }
    // Remove only the new file exclusively reserved by THIS attempt; never touch the source.
    if (db) { db.close(); db = undefined; }
    rmSync(destination, { force: true });
    rmSync(`${destination}-journal`, { force: true });
    throw error;
  } finally { db?.close(); }
}
