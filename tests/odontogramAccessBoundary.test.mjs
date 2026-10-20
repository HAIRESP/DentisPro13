import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { apiAccess } from '../server/apiAccess.ts';
import { createLocalAuthStore } from '../server/localAuthStore.ts';

const createFixture = async t => {
  const store = createLocalAuthStore(':memory:');
  t.after(() => store.close());
  const admin = await store.createUser({ email: 'security-admin@example.test', name: 'Test Admin', password: 'security-test-password-123' });
  const adminLogin = await store.login(admin.email, 'security-test-password-123');
  const dentist = await store.createUser({ email: 'security-dentist@example.test', name: 'Test Dentist', password: 'security-test-password-456', role: 'dentist', professionalId: 'dentist-test-1' }, adminLogin.token);
  const dentistLogin = await store.login(dentist.email, 'security-test-password-456');
  return { store, admin, adminLogin, dentist, dentistLogin };
};

test('clinical write routes are not allowed by generic API role allowlist', async () => {
  const app = express();
  app.use('/api', apiAccess(async token => ({ uid: token, role: token })));
  app.use('/api', (_req, res) => res.json({ ok: true }));
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  try {
    const base = `http://127.0.0.1:${server.address().port}/api`;
    for (const role of ['admin', 'dentist', 'receptionist']) {
      for (const method of ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']) {
        const response = await fetch(`${base}/patients/patient-test-1/odontogram`, {
          method, headers: { Authorization: `Bearer ${role}` }
        });
        assert.equal(response.status, 403, `${role} ${method} must be denied until a patient-scoped API exists`);
      }
    }
  } finally {
    server.closeAllConnections();
    await new Promise(resolve => server.close(resolve));
  }
});

test('a revoked session cannot authenticate for clinical operations', async t => {
  const { store, dentistLogin } = await createFixture(t);
  assert.equal(store.session(dentistLogin.token).role, 'dentist');
  store.logout(dentistLogin.token);
  assert.throws(() => store.session(dentistLogin.token));
});

test('changing a dentist account role immediately invalidates existing sessions', async t => {
  const { store, adminLogin, dentist, dentistLogin } = await createFixture(t);
  store.updateUser(adminLogin.token, dentist.uid, { role: 'receptionist' });
  assert.throws(() => store.session(dentistLogin.token));
});

test('changing a professional link immediately invalidates existing sessions', async t => {
  const { store, adminLogin, dentist, dentistLogin } = await createFixture(t);
  store.updateUser(adminLogin.token, dentist.uid, { professionalId: 'dentist-test-2' });
  assert.throws(() => store.session(dentistLogin.token));
});

test('invalid sessions are not accepted by the generic API gate', async t => {
  const { store, dentistLogin } = await createFixture(t);
  const app = express();
  app.use('/api', apiAccess(async token => store.session(token)));
  app.get('/api/sql/tuss-schema', (_req, res) => res.json({ ok: true }));
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  t.after(() => new Promise(resolve => { server.close(resolve); server.closeAllConnections(); }));
  const url = `http://127.0.0.1:${server.address().port}/api/sql/tuss-schema`;
  assert.equal((await fetch(url)).status, 401);
  assert.equal((await fetch(url, { headers: { Authorization: `Bearer ${dentistLogin.token}` } })).status, 403);
  store.logout(dentistLogin.token);
  assert.equal((await fetch(url, { headers: { Authorization: `Bearer ${dentistLogin.token}` } })).status, 401);
});
