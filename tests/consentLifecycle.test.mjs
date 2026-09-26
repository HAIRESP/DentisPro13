import test from 'node:test';
import assert from 'node:assert/strict';
import {fixture} from './clinicalFixture.mjs';
import {treatmentMonthExpiresAt} from '../server/security/policy.ts';
async function confirmedOwner(f,id) {
 await f.api.run(f.actors.reception,'access.request',id,{targetUid:'owner',duration:'visit'});
 const portal=f.token();await f.api.portal(portal,'confirm',f.otp());return portal;
}
test('R01: pre-suspension code cannot restore access; a new patient confirmation can',async()=>{
 const f=fixture(),{id}=await f.create(),portal=await confirmedOwner(f,id);f.advance(60001);
 const c=await f.api.run(f.actors.reception,'access.request',id,{targetUid:'owner',duration:'month'});
 const stale=f.otp(),oldLink=f.token();await f.api.portal(portal,'suspend',undefined,'owner');
 await assert.rejects(f.api.portal(oldLink,'confirm',stale),/anterior/);
 await assert.rejects(f.api.run(f.actors.reception,'access.confirm',id,{requestId:c.requestId,code:stale}),/anterior/);
 await assert.rejects(f.api.run(f.actors.owner,'clinical.read',id),/autorizar/);
 f.advance(60001);await f.api.run(f.actors.reception,'access.request',id,{targetUid:'owner',duration:'month'});
 await f.api.portal(f.token(),'confirm',f.otp());await f.api.run(f.actors.owner,'clinical.read',id);
});
test('new professional gets one month only after explicit confirmation, without automatic renewal',async()=>{
 const f=fixture(),{id}=await f.create();await confirmedOwner(f,id);f.advance(60001);
 await assert.rejects(f.api.run(f.actors.reception,'access.request',id,{targetUid:'other',duration:'until_revoked'}),/outro profissional/);
 await f.api.run(f.actors.reception,'access.request',id,{targetUid:'other',duration:'month'});
 await assert.rejects(f.api.run(f.actors.other,'clinical.read',id),/autorizar/);
 assert.match(f.messages.at(-1).message,/um mês.*sem renovação automática/);
 await f.api.portal(f.token(),'confirm',f.otp());const p=f.docs.get(f.api.path('patients',id)),grant=p.grants.other;
 assert.equal(grant.expiresAt,treatmentMonthExpiresAt(grant.authorizedAt));
 await f.api.run(f.actors.other,'clinical.read',id);
 f.advance(grant.expiresAt-grant.authorizedAt);await assert.rejects(f.api.run(f.actors.other,'clinical.read',id),/autorizar/);
});
test('calendar month clamps month end and preserves Fortaleza wall clock',()=>{
 assert.equal(new Date(treatmentMonthExpiresAt(Date.parse('2026-01-31T22:00:00-03:00'))).toISOString(),'2026-03-01T01:00:00.000Z');
 assert.equal(new Date(treatmentMonthExpiresAt(Date.parse('2028-01-31T10:00:00-03:00'))).toISOString(),'2028-02-29T13:00:00.000Z');
 assert.equal(new Date(treatmentMonthExpiresAt(Date.parse('2026-12-26T10:00:00-03:00'))).toISOString(),'2027-01-26T13:00:00.000Z');
});
test('R02: expired 24h link can send management recovery but cannot view or suspend directly',async()=>{
 const f=fixture(),{id}=await f.create();await f.api.run(f.actors.reception,'access.request',id,{targetUid:'owner',duration:'month'});
 const old=f.token();await f.api.portal(old,'confirm',f.otp());const before=structuredClone(f.docs.get(f.api.path('patients',id)).grants);f.advance(86400001);
 await assert.rejects(f.api.portal(old,'view'),/expirado/);await assert.rejects(f.api.portal(old,'suspend',undefined,'owner'),/expirado/);
 const renewal=await f.api.portal(old,'renew');assert.deepEqual(Object.keys(renewal).sort(),['message','ok']);
 assert.equal(f.messages.at(-1).destination,'patient@test.invalid');assert.match(f.messages.at(-1).message,/não autoriza nem renova/);
 const token=f.token();assert.notEqual(token,old);
 const pending=await f.api.portal(token,'view');assert.equal(pending.purpose,'management');assert.equal(pending.grants,undefined);
 await assert.rejects(f.api.portal(token,'suspend',undefined,'owner'),/Confirme/);
 await f.api.portal(token,'confirm',f.otp());assert.deepEqual(f.docs.get(f.api.path('patients',id)).grants,before);
 await f.api.portal(token,'suspend',undefined,'owner');await assert.rejects(f.api.run(f.actors.owner,'clinical.read',id));
});
test('management recovery respects rate, OTP attempts, one use and delivery failure',async()=>{
 const f=fixture(),{id}=await f.create(),portal=await confirmedOwner(f,id);
 await f.api.portal(portal,'renew');const token=f.token(),otp=f.otp();
 await assert.rejects(f.api.portal(portal,'renew'),/minuto/);
 for(let i=0;i<5;i++)await assert.rejects(f.api.portal(token,'confirm','wrong'));
 await assert.rejects(f.api.portal(token,'confirm',otp),/inválido/);
 f.advance(60001);await f.api.portal(portal,'renew');const next=f.token(),code=f.otp();await f.api.portal(next,'confirm',code);await assert.rejects(f.api.portal(next,'confirm',code),/utilizado/);
 f.advance(60001);f.failDelivery();await assert.rejects(f.api.portal(portal,'renew'),/delivery/);
 assert.equal([...f.docs.values()].filter(d=>d.purpose==='management'&&d.status==='failed').length,1);
});
test('R07: exception is visible and patient can suspend it; suspension wins over in-flight exception',async()=>{
 const f=fixture(),{id}=await f.create(),portal=await confirmedOwner(f,id);
 await f.api.run(f.actors.admin,'access.exception',id,{reason:'Synthetic exceptional access'});
 const view=await f.api.portal(portal,'view');assert.ok(view.grants.find(g=>g.uid==='admin').exception);
 await f.api.portal(portal,'suspend',undefined,'admin');await assert.rejects(f.api.run(f.actors.admin,'clinical.read',id));
 const deliver=f.store.deliver;f.store.deliver=async(...args)=>{await deliver(...args);await f.api.portal(portal,'suspend',undefined,'admin');};
 await assert.rejects(f.api.run(f.actors.admin,'access.exception',id,{reason:'Synthetic exceptional retry'}),/alterou o acesso/);
});
test('concurrent suspend and confirmation cannot leave a stale code active',async()=>{
 const f=fixture(),{id}=await f.create(),portal=await confirmedOwner(f,id);f.advance(60001);
 await f.api.run(f.actors.reception,'access.request',id,{targetUid:'owner',duration:'month'});const token=f.token(),code=f.otp();
 await Promise.allSettled([f.api.portal(portal,'suspend',undefined,'owner'),f.api.portal(token,'confirm',code)]);
 await assert.rejects(f.api.run(f.actors.owner,'clinical.read',id));
});
