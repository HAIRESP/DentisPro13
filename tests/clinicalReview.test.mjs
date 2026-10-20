import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import express from 'express';
import { stageClinicalBackup } from '../server/clinicalMigration.mjs';
import { openClinicalReviewStore } from '../server/clinicalReviewStore.mjs';
import { clinicalReviewRoutes } from '../server/clinicalReviewRoutes.ts';
import { createLocalAuthStore } from '../server/localAuthStore.ts';

const backup = () => ({ app: 'DentisPro Dental Management System',
  patients: [
    { id: 'p1', name: 'Fictício', phone: '123', address: { city: 'Teste', hidden: 'clinical secret' },
      anamnesis: { notes: 'clinical secret' }, images: ['https://example.invalid/image.png'], futurePrivate: 'clinical secret' },
    { id: 'p2', name: 'Outro', anamnesis: { notes: 'other secret' } },
  ],
  appointments: [{ id: 'a1', patientId: 'p1', date: '2026-10-07', time: '14:00', status: 'agendado',
    procedure: 'clinical secret', notes: 'clinical secret', customRequiredMaterials: [{ private: true }] }],
  inventory: [], professionals: [{ id: 'pr1', name: 'Profissional' }, { id: 'pr2', name: 'Segundo' }],
  tussProcedures: [{ code: '81000030', description: 'Consulta' }],
});
const profiles = () => ({ admin: { uid: 'admin', role: 'admin' },
  reception: { uid: 'reception', role: 'receptionist' },
  dentist: { uid: 'dentist', role: 'dentist', professionalId: 'pr1' },
  other: { uid: 'other', role: 'dentist', professionalId: 'pr2' },
});
function setup(t) {
  const dir = mkdtempSync(join(tmpdir(), 'dentispro-review-'));
  const path = join(dir, 'clinical.sqlite');
  stageClinicalBackup(Buffer.from(JSON.stringify(backup())), path);
  let now = 1800000000000;
  const accounts = profiles();
  const dependencies = { now: () => now,
    resolveSession: token => { if (!accounts[token]) throw Error(); return accounts[token]; },
    resolveAccount: (_token, uid) => Object.values(accounts).find(profile => profile.uid === uid),
  };
  const store = openClinicalReviewStore(path, dependencies);
  const cleanup = [() => rmSync(dir, { recursive: true, force: true }), () => store.close()];
  t.after(async () => { for (const action of cleanup.toReversed()) await action(); });
  const grantInput = (updates = {}) => ({ accountUid: 'dentist', permission: 'read',
    patientConfirmed: true, confirmationMethod: 'in_person', consentReference: 'CONSENT-TEST-001',
    expiresAt: now + 86400000, expectedVersion: 0, ...updates });
  return { dir, path, store, accounts, dependencies, grantInput, cleanup, advance: ms => { now += ms; } };
}
const status = expected => error => error.status === expected;

test('default deny: administrator and reception cannot read records, ungranted dentist cannot infer patient existence', t => {
  const { store } = setup(t);
  for (const token of ['admin', 'reception', 'dentist']) {
    for (const id of ['p1', 'unknown']) assert.throws(() => store.record(token, id), status(403));
  }
  assert.throws(() => store.record('invalid', 'p1'), status(401));
  assert.deepEqual(store.patientList('dentist').patients, []);
});

test('reception receives only explicit registration and schedule fields, never clinical data', t => {
  const { store } = setup(t);
  for (const result of [store.demographics('reception', 'p1'), store.patientList('reception'), store.appointments('reception', 'p1')]) {
    const json = JSON.stringify(result);
    assert.ok(!json.includes('clinical secret')); assert.ok(!json.includes('image.png'));
    assert.ok(!json.includes('customRequiredMaterials')); assert.ok(!json.includes('anamnesis'));
  }
  assert.equal(store.appointments('reception', 'p1')[0].time, '14:00');
  assert.throws(() => store.catalog('reception'), status(403));
});

test('record access is bound to patient, account, current role and current professional', t => {
  const { store, accounts, grantInput } = setup(t);
  store.grant('admin', 'p1', grantInput());
  assert.equal(store.record('dentist', 'p1').patient.anamnesis.notes, 'clinical secret');
  assert.equal(store.patientList('dentist').patients.length, 1);
  assert.throws(() => store.record('dentist', 'p2'), status(403));
  assert.throws(() => store.record('other', 'p1'), status(403));
  accounts.dentist.professionalId = 'pr2';
  assert.throws(() => store.record('dentist', 'p1'), status(403));
  accounts.dentist.professionalId = 'pr1'; accounts.dentist.role = 'admin';
  assert.throws(() => store.record('dentist', 'p1'), status(403));
});

test('grant requires recorded in-person patient confirmation and a registered dentist', t => {
  const { store, accounts, grantInput } = setup(t);
  for (const input of [grantInput({ patientConfirmed: false }), grantInput({ confirmationMethod: 'assumed' }),
    grantInput({ consentReference: '' }), grantInput({ expiresAt: 1800000000000 + 31 * 86400000 }),
    grantInput({ permission: 'admin' })]) {
    assert.throws(() => store.grant('admin', 'p1', input), status(400));
  }
  for (const accountUid of ['admin', 'reception', 'unknown']) {
    assert.throws(() => store.grant('admin', 'p1', grantInput({ accountUid })), status(403));
  }
  accounts.dentist.professionalId = 'unregistered';
  assert.throws(() => store.grant('admin', 'p1', grantInput()), status(403));
  assert.deepEqual(store.grants('admin', 'p1'), []);
});

test('dentists and reception cannot grant themselves or others access or read the audit', t => {
  const { store, grantInput } = setup(t);
  for (const token of ['reception', 'dentist']) {
    assert.throws(() => store.grant(token, 'p1', grantInput()), status(403));
    assert.throws(() => store.revoke(token, 'p1', { accountUid: 'dentist', expectedVersion: 1 }), status(403));
    assert.throws(() => store.grants(token, 'p1'), status(403));
    assert.throws(() => store.events(token), status(403));
  }
});

test('validity in days uses the server clock and rejects ambiguous or excessive duration', t => {
  const { store, grantInput } = setup(t);
  const input = grantInput(); delete input.expiresAt;
  assert.throws(() => store.grant('admin', 'p1', { ...input, validForDays: 31 }), status(400));
  assert.throws(() => store.grant('admin', 'p1', { ...grantInput(), validForDays: 1 }), status(400));
  const result = store.grant('admin', 'p1', { ...input, validForDays: 30 });
  assert.equal(result.expiresAt, 1800000000000 + 30 * 86400000);
});

test('expiry and revocation take effect immediately; stale versions cannot restore access', t => {
  const { store, grantInput, advance } = setup(t);
  store.grant('admin', 'p1', grantInput());
  advance(86400000);
  assert.throws(() => store.record('dentist', 'p1'), status(403));
  store.grant('admin', 'p1', grantInput({ expectedVersion: 1 }));
  store.revoke('admin', 'p1', { accountUid: 'dentist', expectedVersion: 2 });
  assert.throws(() => store.record('dentist', 'p1'), status(403));
  assert.throws(() => store.grant('admin', 'p1', grantInput({ expectedVersion: 2 })), status(409));
  assert.equal(store.grants('admin', 'p1')[0].version, 3);
});

test('two connections cannot overwrite each other with the same expected version', t => {
  const { store, path, dependencies, grantInput } = setup(t);
  const second = openClinicalReviewStore(path, dependencies);
  try {
    store.grant('admin', 'p1', grantInput());
    assert.throws(() => second.grant('admin', 'p1', grantInput()), status(409));
    assert.equal(second.record('dentist', 'p1').patient.id, 'p1');
  } finally { second.close(); }
});

test('audit records successful and denied actions and SQLite rejects edits/deletion of events', t => {
  const { store, path, grantInput } = setup(t);
  store.grant('admin', 'p1', grantInput()); store.record('dentist', 'p1');
  assert.throws(() => store.record('other', 'p1'), status(403));
  const events = store.events('admin');
  assert.ok(events.some(row => row.actor_uid === 'dentist' && row.outcome === 'allowed'));
  assert.ok(events.some(row => row.actor_uid === 'other' && row.outcome === 'denied'));
  assert.ok(!JSON.stringify(events).includes('clinical secret'));
  const db = new DatabaseSync(path);
  try {
    assert.throws(() => db.exec('DELETE FROM clinical_access_events'), /cannot be deleted/);
    assert.throws(() => db.exec("UPDATE clinical_access_events SET actor_uid='other'"), /cannot be updated/);
    assert.equal(db.prepare('PRAGMA integrity_check').get().integrity_check, 'ok');
    assert.equal(db.prepare('SELECT state FROM migration').get().state, 'staged_not_active');
  } finally { db.close(); }
});

test('failed audit insert rolls back permission change and does not leak a record', t => {
  const { store, path, grantInput } = setup(t);
  const db = new DatabaseSync(path);
  try {
    db.exec("CREATE TRIGGER simulate_audit_full BEFORE INSERT ON clinical_access_events BEGIN SELECT RAISE(ABORT,'audit unavailable'); END");
    assert.throws(() => store.grant('admin', 'p1', grantInput()), /audit unavailable/);
    assert.equal(db.prepare('SELECT count(*) AS n FROM patient_access').get().n, 0);
    assert.throws(() => store.demographics('admin', 'p1'), /audit unavailable/);
  } finally { db.close(); }
});

test('wrong or missing database is not created or modified', t => {
  const { dir, dependencies } = setup(t);
  const missing = join(dir, 'missing.sqlite');
  assert.throws(() => openClinicalReviewStore(missing, dependencies)); assert.ok(!existsSync(missing));
  const path = join(dir, 'accounts.sqlite');
  const db = new DatabaseSync(path); db.exec('CREATE TABLE accounts(uid TEXT)'); db.close();
  const original = readFileSync(path);
  assert.throws(() => openClinicalReviewStore(path, dependencies)); assert.deepEqual(readFileSync(path), original);
});

test('pagination is bounded and does not expose ungranted patient identifiers', t => {
  const { store, grantInput } = setup(t);
  const first = store.patientList('reception', '', 1); assert.equal(first.next, 'p1');
  assert.equal(store.patientList('reception', first.next, 1).patients[0].id, 'p2');
  assert.throws(() => store.patientList('admin', '', 101), status(400));
  assert.throws(() => store.catalog('admin', '', -1), status(400));
  store.grant('admin', 'p1', grantInput());
  assert.equal(store.patientList('dentist', '', 1).next, null);
});

test('HTTP uses real server sessions, reauthentication, JSON limits and denies unknown writes', async t => {
  const { dir, path, cleanup } = setup(t);
  const auth = createLocalAuthStore(join(dir, 'auth.sqlite'));
  const password = 'testing-only-password-123';
  await auth.createUser({ name: 'Admin', email: 'admin@example.test', password, role: 'admin' });
  const admin = await auth.login('admin@example.test', password);
  const dentist = await auth.createUser({ name: 'Dentist', email: 'dentist@example.test', password, role: 'dentist', professionalId: 'pr1' }, admin.token);
  const dentistSession = await auth.login(dentist.email, password);
  const reception = await auth.createUser({ name: 'Reception', email: 'reception@example.test', password, role: 'receptionist' }, admin.token);
  const receptionSession = await auth.login(reception.email, password);
  const store = openClinicalReviewStore(path, { resolveSession: token => auth.session(token),
    resolveAccount: (token, uid) => auth.listUsers(token).find(profile => profile.uid === uid) });
  const app = express(); app.use('/api/clinical-review', clinicalReviewRoutes(store, auth));
  const server = app.listen(0, '127.0.0.1'); await new Promise(resolve => server.once('listening', resolve));
  cleanup.push(async () => { await new Promise(resolve => { server.close(resolve); server.closeAllConnections(); }); store.close(); auth.close(); });
  const base = `http://127.0.0.1:${server.address().port}/api/clinical-review`;
  const request = (route, token, body, method = body ? 'POST' : 'GET') => fetch(base + route, {
    method, headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), 'Content-Type': 'application/json' },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  assert.equal((await request('/patients', '')).status, 401);
  assert.equal((await request('/patients/p1/record', admin.token)).status, 403);
  assert.equal((await request('/patients/p1/record', dentistSession.token)).status, 403);
  const input = { accountUid: dentist.uid, expectedVersion: 0, permission: 'read', patientConfirmed: true,
    confirmationMethod: 'in_person', consentReference: 'CONFIRMATION-TEST', expiresAt: Date.now() + 86400000 };
  assert.equal((await request('/patients/p1/access', admin.token, { ...input, currentPassword: 'wrong' })).status, 403);
  assert.equal((await request('/patients/p1/access', receptionSession.token, { ...input, currentPassword: password, role: 'admin' })).status, 403);
  const granted = await request('/patients/p1/access', admin.token, { ...input, currentPassword: password }); assert.equal(granted.status, 200);
  const record = await request('/patients/p1/record', dentistSession.token);
  assert.equal(record.status, 200); assert.equal(record.headers.get('cache-control'), 'no-store');
  assert.equal((await record.json()).patient.id, 'p1');
  assert.equal((await request('/patients/p1/record', dentistSession.token, { patient: {} }, 'PUT')).status, 404);
  assert.equal((await request('/patients/p1/access', admin.token, { junk: 'x'.repeat(17000) })).status, 413);
  assert.equal((await request('/patients?limit=1000000', admin.token)).status, 400);
  assert.equal((await request('/audit?after=oops', admin.token)).status, 400);
  assert.equal((await request('/patients/p1/access/revoke', admin.token, { accountUid: dentist.uid, expectedVersion: 1, currentPassword: password })).status, 200);
  assert.equal((await request('/patients/p1/record', dentistSession.token)).status, 403);
  const events = store.events(admin.token); assert.ok(!JSON.stringify(events).includes(password));
  auth.logout(dentistSession.token);
  assert.equal((await request('/patients/p1/record', dentistSession.token)).status, 401);
});
