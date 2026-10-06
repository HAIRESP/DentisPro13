import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { apiAccess } from '../server/apiAccess.ts';
import { resetPasswordWithConfirmation } from '../src/utils/resetPassword.ts';
import { provisionUser } from '../src/utils/provisionUser.ts';

test('reset rejects mismatched passwords before contacting the server', async () => {
  let calls = 0;
  await assert.rejects(resetPasswordWithConfirmation('abc ', 'abc', async () => { calls++; return true; }, async () => { calls++; }), /coincidem/);
  assert.equal(calls, 0);
});
test('reset enforces project policy and preserves whitespace in a valid password', async () => {
  let confirmed;
  await assert.rejects(resetPasswordWithConfirmation('a', 'a', async () => false, async p => { confirmed = p; }), /requisitos/);
  assert.equal(confirmed, undefined);
  await resetPasswordWithConfirmation(' strong password ', ' strong password ', async () => true, async p => { confirmed = p; });
  assert.equal(confirmed, ' strong password ');
});
test('provisioning compensates profile failure, but does not delete successful accounts', async () => {
  let deleted = 0;
  const steps = { create: async () => ({uid:'new'}), save: async () => {throw Error('denied');}, rollback: async () => {deleted++;} };
  await assert.rejects(provisionUser(steps), /denied/);
  assert.equal(deleted, 1);
  assert.deepEqual(await provisionUser({...steps, save: async () => {}}), {uid:'new'});
  assert.equal(deleted, 1);
  await assert.rejects(provisionUser({...steps, rollback: async () => {throw Error('offline');}}), /cleanup-required/);
});
test('API rejects missing and invalid tokens, unauthorized roles and unmapped routes', async t => {
  const app = express();
  app.use('/api', apiAccess(async token => {
    if (token === 'invalid') throw Error('invalid');
    return {uid:'u',role:token};
  }));
  app.use('/api', (_req,res) => res.json({ok:true}));
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening',resolve));
  t.after(() => new Promise(resolve => {server.close(resolve); server.closeAllConnections();}));
  const base = `http://127.0.0.1:${server.address().port}/api`;
  const request = (path, role, method='GET') => fetch(base+path, {method,headers:role ? {Authorization:`Bearer ${role}`} : {}});
  assert.equal((await request('/sql/tuss-export')).status,401);
  assert.equal((await request('/sql/tuss-export','invalid')).status,401);
  assert.equal((await request('/sql/tuss-export','dentist')).status,403);
  assert.equal((await request('/sql/tuss-export','admin')).status,200);
  assert.equal((await request('/ai/parse-document','receptionist','POST')).status,200);
  assert.equal((await request('/ai/parse-voice-odontogram','receptionist','POST')).status,403);
  assert.equal((await request('/ai/parse-voice-odontogram','dentist','POST')).status,200);
  assert.equal((await request('/whatsapp/webhook','admin','POST')).status,403);
  assert.equal((await request('/unknown','admin')).status,403);
});

test('new account form reads independent credentials and requires confirmation', async () => {
  const { readSignupFields } = await import('../src/utils/signupFields.ts');
  const data = new FormData();
  data.set('username','administrator@example.test');
  data.set('password','previous-password');
  assert.throws(() => readSignupFields(data), /Preencha/);
  data.set('new-user-name',' New dentist ');
  data.set('new-user-email',' dentist@example.test ');
  data.set('new-user-password',' new-password ');
  assert.throws(() => readSignupFields(data), /coincidem/);
  data.set('new-user-confirmation',' new-password ');
  assert.deepEqual(readSignupFields(data), {name:'New dentist',email:'dentist@example.test',password:' new-password ',role:'dentist',cro:'',specialty:''});
  data.set('new-user-role','owner');
  assert.throws(() => readSignupFields(data), /perfil válido/);
});
