import test from 'node:test';
import assert from 'node:assert/strict';
import { withDeadline, validateSessionProfile, canSelectProfessional, sanitizeProfileWrite } from '../src/utils/authSession.ts';

const user = { uid: 'real-user', email: 'user@example.test' };
const profile = { uid: user.uid, name: 'Test', role: 'admin' };

test('rejects missing profiles, demo identities and unknown roles', () => {
  for (const candidate of [null, { ...profile, uid: 'demo_admin_01' }, { ...profile, role: 'owner' }, { ...profile, name: null }]) {
    assert.throws(() => validateSessionProfile(user, candidate));
  }
});
test('uses the authenticated identity and strips legacy passwords', () => {
  const result = validateSessionProfile(user, { ...profile, email: 'forged@example.test', password: 'legacy' });
  assert.equal(result.email, user.email);
  assert.equal(result.role, 'admin');
  assert.equal('password' in result, false);
});
test('accepts all supported roles', () => {
  for (const role of ['admin', 'dentist', 'receptionist']) assert.equal(validateSessionProfile(user, { ...profile, role }).role, role);
});
test('profile requests have a finite deadline', async () => {
  await assert.rejects(withDeadline(new Promise(() => {}), 10), /profile-timeout/);
});
test('propagates success and server errors', async () => {
  assert.equal(await withDeadline(Promise.resolve(42), 100), 42);
  await assert.rejects(withDeadline(Promise.reject(new Error('permission-denied')), 100), /permission-denied/);
});

test('professional selection requires admin or an explicit dentist link', () => {
  assert.equal(canSelectProfessional({role: 'admin'}, 'p1'), true);
  assert.equal(canSelectProfessional({role: 'dentist', professionalId: 'p1'}, 'p1'), true);
  for (const profile of [{role: 'dentist'}, {role: 'dentist', professionalId: 'p2'}, {role: 'receptionist', professionalId: 'p1'}, {role: 'owner'}]) {
    assert.equal(canSelectProfessional(profile, 'p1'), false);
  }
  assert.equal(canSelectProfessional({role: 'admin'}, ''), false);
});

test('profile writes discard passwords and undefined fields, preserving valid values', () => {
  const input = { uid: 'u', password: 'secret', cro: undefined, active: false, name: '' };
  assert.deepEqual(sanitizeProfileWrite(input), { uid: 'u', active: false, name: '' });
  assert.equal(input.password, 'secret');
});
