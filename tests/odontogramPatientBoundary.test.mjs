import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import express from 'express';
import { stageClinicalBackup } from '../server/clinicalMigration.mjs';
import { openClinicalReviewStore } from '../server/clinicalReviewStore.mjs';
import { clinicalReviewRoutes } from '../server/clinicalReviewRoutes.ts';
import { createLocalAuthStore } from '../server/localAuthStore.ts';

const pass = 'strong-test-password-only-123';
const sample = () => ({
  app: 'DentisPro Dental Management System',
  patients: [
    { id: 'test-patient-a', name: 'Paciente A', anamnesis: { notes: 'private-a-token' } },
    { id: 'test-patient-b', name: 'Paciente B', anamnesis: { notes: 'private-b-token' } },
  ],
  professionals: [{ id: 'dentist-a', name: 'Dentista A' }, { id: 'dentist-b', name: 'Dentista B' }],
  appointments: [], inventory: [], tussProcedures: [],
});

async function setup(t) {
  const dir = mkdtempSync(join(tmpdir(), 'dentispro-patient-boundary-'));
  const dbFile = join(dir, 'clinical-review.sqlite');
  let server; let review; let auth;
  t.after(async () => {
    if (server) await new Promise(resolve => { server.close(resolve); server.closeAllConnections(); });
    review?.close(); auth?.close();
    rmSync(dir, { recursive: true, force: true });
  });
  stageClinicalBackup(Buffer.from(JSON.stringify(sample())), dbFile);
  auth = createLocalAuthStore(join(dir, 'accounts.sqlite'));
  await auth.createUser({ name: 'Admin', email: 'admin@test.invalid', password: pass });
  const admin = await auth.login('admin@test.invalid', pass);
  const profileA = await auth.createUser({ name: 'Dentista A', email: 'a@test.invalid', password: pass,
    role: 'dentist', professionalId: 'dentist-a' }, admin.token);
  const profileB = await auth.createUser({ name: 'Dentista B', email: 'b@test.invalid', password: pass,
    role: 'dentist', professionalId: 'dentist-b' }, admin.token);
  const a = await auth.login(profileA.email, pass);
  const b = await auth.login(profileB.email, pass);
  review = openClinicalReviewStore(dbFile, {
    resolveSession: token => auth.session(token),
    resolveAccount: (token, uid) => auth.listUsers(token).find(profile => profile.uid === uid),
  });
  const app = express();
  app.use('/api/clinical-review', clinicalReviewRoutes(review, auth));
  server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}/api/clinical-review`;
  const call = (method, path, token, body) => fetch(base + path, {
    method,
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }) },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  async function grant(patientId, profile) {
    const response = await call('POST', `/patients/${patientId}/access`, admin.token, {
      currentPassword: pass, accountUid: profile.uid, expectedVersion: 0,
      patientConfirmed: true, confirmationMethod: 'in_person',
      consentReference: 'CONSENT-TEST-ONLY', permission: 'read', validForDays: 1,
    });
    assert.equal(response.status, 200, await response.text());
  }
  return { auth, review, admin, a, b, profileA, profileB, call, grant };
}

test('access to one patient never implies access to another, even when an ID is supplied explicitly', async t => {
  const x = await setup(t);
  await x.grant('test-patient-a', x.profileA);
  const allowed = await x.call('GET', '/patients/test-patient-a/record', x.a.token);
  assert.equal(allowed.status, 200);
  assert.match(JSON.stringify(await allowed.json()), /private-a-token/);
  for (const path of ['/patients/test-patient-b/record', '/patients/missing/record',
    '/patients/test-patient-b/record?patientId=test-patient-a']) {
    const response = await x.call('GET', path, x.a.token);
    assert.equal(response.status, 403, path);
    assert.doesNotMatch(await response.text(), /private-b-token/);
  }
  assert.equal((await x.call('GET', '/patients/test-patient-a/record', x.b.token)).status, 403);
  assert.equal((await x.call('GET', '/patients/test-patient-a/record', x.admin.token)).status, 403);
  const list = await x.call('GET', '/patients', x.a.token);
  assert.deepEqual((await list.json()).patients.map(p => p.id), ['test-patient-a']);
});

test('review routes reject writes, including attempts to alter the odontogram via other verbs', async t => {
  const x = await setup(t);
  await x.grant('test-patient-a', x.profileA);
  for (const method of ['POST', 'PUT', 'PATCH', 'DELETE']) {
    const response = await x.call(method, '/patients/test-patient-a/record', x.a.token, { odontogram: [{ toothNumber: 16 }] });
    assert.equal(response.status, 404, method);
  }
  const response = await x.call('GET', '/patients/test-patient-a/record', x.a.token);
  assert.equal(response.status, 200);
  assert.doesNotMatch(await response.text(), /toothNumber/);
});

test('revocation and account session invalidation are independently enforced', async t => {
  const x = await setup(t);
  await x.grant('test-patient-a', x.profileA);
  assert.equal((await x.call('GET', '/patients/test-patient-a/record', x.a.token)).status, 200);
  const revoked = await x.call('POST', '/patients/test-patient-a/access/revoke', x.admin.token, {
    currentPassword: pass, accountUid: x.profileA.uid, expectedVersion: 1,
  });
  assert.equal(revoked.status, 200, await revoked.text());
  assert.equal((await x.call('GET', '/patients/test-patient-a/record', x.a.token)).status, 403);
  x.auth.logout(x.a.token);
  assert.equal((await x.call('GET', '/patients/test-patient-a/record', x.a.token)).status, 401);
});
