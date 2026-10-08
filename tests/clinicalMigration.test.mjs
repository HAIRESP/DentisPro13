import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
import { inspectClinicalBackup, stageClinicalBackup } from '../server/clinicalMigration.mjs';

const fixture = () => ({
  app: 'DentisPro Dental Management System', version: '2.5.0',
  patients: [{ id: 'p1', name: 'Paciente fictício', images: ['data:image/png;base64,QUJD'], anamnesis: { notes: 'Preservar' } }],
  appointments: [{ id: 'a1', patientId: 'p1', tussCode: '81000030', procedure: 'Nome antigo', customRequiredMaterials: [{ id: 'r1', quantityNeeded: 2 }] }],
  inventory: [{ id: 'm1', quantity: 17 }],
  tussProcedures: [{ code: '81000030', description: 'Nome atual', fullDescription: '<p>Texto</p>', images: ['data:image/png;base64,REVG'] }],
  treatmentPlans: [{ id: 't1', patientId: 'p1', items: [{ id: 'i1', tussCode: '81000030', procedureName: 'Original', cost: 50 }], consentAttachments: [{ id: 'doc1', fileUrl: 'data:application/pdf;base64,JVBERg==' }] }],
  clinicalEvolutions: [{ id: 'e1', patientId: 'p1', images: ['data:image/png;base64,R0hJ'] }],
  odontograms: { p1: [{ toothNumber: 18 }] },
  odontogramSnapshots: { p1: [{ id: 's1', patientId: 'p1', conditions: [] }] },
  clinicalExams: { p1: { patientId: 'p1', generalNotes: 'Exame' } },
  savedClinicDocuments: [{ id: 'd1', patientId: 'p1', htmlSnapshot: '<p>Documento</p>' }, { id: 'd2', patientName: 'Paciente fictício', htmlSnapshot: '<p>Sem vínculo</p>' }],
  futureField: { keep: ['não perder'] },
});
const bytesOf = value => Buffer.from(JSON.stringify(value));
function temp(t) {
  const dir = mkdtempSync(join(tmpdir(), 'dentispro-migration-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  return dir;
}

test('unifies complete patient record, keeps procedure catalog separate and persists across reopen', t => {
  const dir = temp(t), path = join(dir, 'new.sqlite');
  const original = Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), bytesOf(fixture())]);
  const summary = stageClinicalBackup(original, path);
  const db = new DatabaseSync(path, { readOnly: true }); t.after(() => db.close());
  const record = JSON.parse(db.prepare('SELECT record_json FROM patient_records').get().record_json);
  assert.deepEqual(record.patient, fixture().patients[0]);
  assert.deepEqual(record.collections.treatmentPlans, fixture().treatmentPlans);
  assert.deepEqual(record.collections.savedClinicDocuments, [fixture().savedClinicDocuments[0]]);
  assert.deepEqual(record.maps.clinicalExams, fixture().clinicalExams.p1);
  assert.deepEqual(record.maps.odontograms, fixture().odontograms.p1);
  assert.deepEqual(record.maps.odontogramSnapshots, fixture().odontogramSnapshots.p1);
  assert.deepEqual(record.collections.clinicalEvolutions, fixture().clinicalEvolutions);
  assert.deepEqual(Buffer.from(db.prepare('SELECT source_bytes FROM migration').get().source_bytes), original);
  assert.deepEqual(JSON.parse(db.prepare("SELECT data_json FROM clinic_data WHERE section='futureField'").get().data_json), fixture().futureField);
  assert.equal(db.prepare('SELECT count(*) AS n FROM patient_access').get().n, 0);
  assert.equal(db.prepare('SELECT count(*) AS n FROM migration_events').get().n, 1);
  assert.equal(summary.unlinkedDocuments, 1);
  assert.equal(summary.mediaReferences.embedded, 4);
  assert.equal(summary.state, 'staged_not_active');
  assert.equal(db.prepare('PRAGMA integrity_check').get().integrity_check, 'ok');
});

test('catalog edits do not rewrite imported history or catalog-at-import snapshots', t => {
  const path = join(temp(t), 'new.sqlite'); stageClinicalBackup(bytesOf(fixture()), path);
  const db = new DatabaseSync(path); t.after(() => db.close());
  db.prepare('UPDATE procedure_catalog SET procedure_json=?, revision=2').run('{"description":"Changed"}');
  const rows = db.prepare('SELECT historical_item_json,catalog_at_import_json FROM procedure_snapshots').all();
  assert.equal(rows.length, 2);
  assert.equal(JSON.parse(rows[0].historical_item_json).procedure, 'Nome antigo');
  assert.equal(JSON.parse(rows[1].historical_item_json).cost, 50);
  assert.equal(JSON.parse(rows[0].catalog_at_import_json).description, 'Nome atual');
});

test('never overwrites existing databases, including accounts and repeated imports', t => {
  const path = join(temp(t), 'accounts.sqlite'); writeFileSync(path, 'existing account database');
  assert.throws(() => stageClinicalBackup(bytesOf(fixture()), path), { code: 'EEXIST' });
  assert.equal(readFileSync(path, 'utf8'), 'existing account database');
  const other = `${path}.new`; stageClinicalBackup(bytesOf(fixture()), other);
  const first = readFileSync(other);
  assert.throws(() => stageClinicalBackup(bytesOf(fixture()), other), { code: 'EEXIST' });
  assert.deepEqual(readFileSync(other), first);
});

for (const [name, mutate] of [
  ['duplicate patients', data => data.patients.push({ ...data.patients[0] })],
  ['duplicate procedures', data => data.tussProcedures.push({ ...data.tussProcedures[0] })],
  ['missing patient reference', data => { data.appointments[0].patientId = 'secret-patient-name'; }],
  ['missing required patientId', data => { delete data.treatmentPlans[0].patientId; }],
  ['map orphan', data => { data.odontograms = { unknown: [] }; }],
  ['mismatched exam patient', data => { data.clinicalExams.p1.patientId = 'p2'; }],
  ['mismatched snapshot patient', data => { data.odontogramSnapshots.p1[0].patientId = 'p2'; }],
  ['duplicate treatment items', data => data.treatmentPlans[0].items.push({ ...data.treatmentPlans[0].items[0] })],
  ['invalid treatment items', data => { data.treatmentPlans[0].items = {}; }],
  ['missing inventory', data => { delete data.inventory; }],
]) test(`rejects ${name} before creating a destination`, t => {
  const dir = temp(t), data = fixture(); mutate(data);
  assert.throws(() => stageClinicalBackup(bytesOf(data), join(dir, 'new.sqlite')), error => {
    assert.ok(!error.message.includes('secret-patient-name')); return /Backup inválido/.test(error.message);
  });
  assert.deepEqual(readdirSync(dir), []);
});

test('rejects corrupt UTF-8, malformed JSON, oversized and wrong application backups', () => {
  for (const bytes of [Buffer.from([0xff]), Buffer.from('{'), bytesOf({ app: 'other' }), Buffer.alloc(256 * 1024 * 1024 + 1)]) {
    assert.throws(() => inspectClinicalBackup(bytes));
  }
});

test('flags external and temporary links without downloading them or assigning documents by name', () => {
  const data = fixture(); data.patients[0].images.push('https://example.invalid/private.png', 'blob:unavailable');
  const plan = inspectClinicalBackup(bytesOf(data));
  assert.deepEqual(plan.summary.mediaReferences, { embedded: 4, external: 1, temporary: 1 });
  assert.equal(plan.summary.externalLinkPolicy, 'preserve_links_no_offline_copy_required');
  assert.equal(plan.clinic.savedClinicDocuments.length, 1);
  assert.equal(plan.patients.get('p1').collections.savedClinicDocuments.length, 1);
});

test('missing legacy catalog does not drop historical treatment items', () => {
  const data = fixture(); delete data.tussProcedures;
  const plan = inspectClinicalBackup(bytesOf(data));
  assert.equal(plan.snapshots.length, 2);
  assert.equal(plan.summary.missingCatalogReferences, 2);
  assert.ok(plan.summary.missingSections.includes('tussProcedures'));
  assert.equal(plan.snapshots[0].catalogAtImport, null);
});

test('CLI dry run never writes, create keeps source unchanged, and output excludes patient content', t => {
  const dir = temp(t), source = join(dir, 'source.json'), destination = join(dir, 'new.sqlite');
  const bytes = bytesOf(fixture()); writeFileSync(source, bytes);
  const script = new URL('../scripts/stage-clinical-data.mjs', import.meta.url);
  const run = args => spawnSync(process.execPath, [fileURLToPath(script), ...args], { encoding: 'utf8' });
  const dry = run(['--source', source]); assert.equal(dry.status, 0, dry.stderr);
  assert.equal(JSON.parse(dry.stdout).mode, 'validation_only');
  assert.deepEqual(readdirSync(dir), ['source.json']);
  assert.ok(!dry.stdout.includes('Paciente fictício'));
  const create = run(['--source', source, '--create', destination]); assert.equal(create.status, 0, create.stderr);
  assert.deepEqual(readFileSync(source), bytes);
  assert.equal(JSON.parse(create.stdout).mode, 'created_staging_database');
  const repeat = run(['--source', source, '--create', destination]); assert.equal(repeat.status, 1);
  assert.match(repeat.stderr, /destino já existe/);
  assert.equal(run(['--source', source, '--unknown', 'x']).status, 1);
});

test('legacy insurance guides and commissions have no patientId and remain available for reconciliation', () => {
  const data = fixture();
  data.insuranceGuides = [{ id: 'g1', patientName: 'Paciente fictício', guideNumber: '1' }];
  data.commissions = [{ id: 'c1', patientName: 'Paciente fictício', commissionAmount: 10 }];
  const plan = inspectClinicalBackup(bytesOf(data));
  assert.deepEqual(plan.clinic.insuranceGuides, data.insuranceGuides);
  assert.deepEqual(plan.clinic.commissions, data.commissions);
  assert.equal(plan.summary.unlinkedInsuranceGuides, 1);
  assert.equal(plan.summary.unlinkedCommissions, 1);
});

test('failure during SQL insertion rolls back and removes only this attempt', t => {
  const dir = temp(t), path = join(dir, 'new.sqlite');
  const originalPrepare = DatabaseSync.prototype.prepare;
  t.mock.method(DatabaseSync.prototype, 'prepare', function(sql) {
    if (sql.startsWith('INSERT INTO clinic_data')) throw new Error('simulated write failure');
    return originalPrepare.call(this, sql);
  });
  assert.throws(() => stageClinicalBackup(bytesOf(fixture()), path), /simulated write failure/);
  assert.deepEqual(readdirSync(dir), []);
});

test('preexisting SQLite sidecars are never opened or removed', t => {
  const dir = temp(t), path = join(dir, 'new.sqlite');
  writeFileSync(`${path}-journal`, 'preserve existing journal');
  assert.throws(() => stageClinicalBackup(bytesOf(fixture()), path), /arquivos auxiliares/);
  assert.deepEqual(readdirSync(dir), ['new.sqlite-journal']);
  assert.equal(readFileSync(`${path}-journal`, 'utf8'), 'preserve existing journal');
});
