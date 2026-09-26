import test from 'node:test';
import assert from 'node:assert/strict';
import {ClinicalSecurity} from '../server/security/service.ts';
import {canRead, validateWorkspace, requireRecentPassword, codeDigest} from '../server/security/policy.ts';

function fixture() {
  let now = 1800000000000, failAudit = false, failDelivery = false;
  const docs = new Map(), blobs = new Map(), logs = [], messages = [];
  let serial = Promise.resolve();
  const clone = v => v === undefined ? undefined : structuredClone(v);
  const store = {
    transaction(fn) {
      const work = serial.then(async () => {
        const next = new Map([...docs].map(([k,v]) => [k,clone(v)]));
        let wrote = false;
        const result = await fn({
          get: async p => {assert.equal(wrote, false, 'Firestore disallows reads after writes'); return clone(next.get(p) || null);},
          set: (p,v) => {wrote = true; next.set(p,clone(v));},
          create: (p,v) => {wrote = true; assert.equal(next.has(p), false, 'create may not overwrite'); next.set(p,clone(v));},
        });
        docs.clear(); for (const [k,v] of next) docs.set(k,v); return result;
      }); serial = work.catch(() => {}); return work;
    },
    list: async (path, limit = 100, after) => [...docs].filter(([k]) => k.startsWith(path + '/') && k.split('/').length === path.split('/').length+1).map(([k,v]) => ({...clone(v), id:k.split('/').at(-1)})).sort((a,b) => a.id.localeCompare(b.id)).filter(v => !after || v.id > after).slice(0,limit),
    putBlob: async v => {const k = 'blob-'+blobs.size; blobs.set(k,clone(v)); return k;},
    getBlob: async k => clone(blobs.get(k)),
    audit: async event => {if(failAudit) throw Error('audit offline'); logs.push(clone(event)); return 'audit-'+logs.length;},
    deliver: async (destination,message) => {if(failDelivery) throw Error('delivery offline'); messages.push({destination,message});},
    account: async uid => ({uid,name:uid,email:uid+'@test.invalid'}),
    createAccount: async () => 'new-account', activateAccount: async () => {},
  };
  const api = new ClinicalSecurity(store,'clinic','a'.repeat(32),'http://localhost:3000', () => now);
  const actors = Object.fromEntries(['owner','other','admin','reception'].map(uid => [uid,{uid,name:uid,role:uid === 'admin' ? 'admin' : uid === 'reception' ? 'receptionist' : 'dentist',authTime:now/1000}]));
  for (const actor of Object.values(actors)) docs.set(api.path('members',actor.uid),{...actor,active:true});
  const create = () => api.run(actors.reception,'patients.create',undefined,{ownerUid:'owner',demographics:{name:'Patient',email:'patient@test.invalid'}});
  const token = () => messages.at(-1).message.match(/patient-access#([\w-]+)/)[1];
  const otp = () => messages.at(-1).message.match(/Código: (\d{6})/)[1];
  return {api, actors, docs, logs, messages, create, otp, token, store, advance: n => {now+=n;}, failAudit: () => {failAudit=true;}, failDelivery: () => {failDelivery=true;}};
}

test('admin has no implicit clinical access, reception sees only demographics, foreign member denied', async () => {
  const f=fixture(), {id}=await f.create();
  for(const actor of [f.actors.admin,f.actors.other,f.actors.reception]) await assert.rejects(f.api.run(actor,'clinical.read',id), /autorizar/);
  const read = await f.api.run(f.actors.owner,'clinical.read',id); assert.equal(read.workspace.dentispro_patients_v2.length,1);
  const list = await f.api.run(f.actors.reception,'patients.list'); assert.equal(list.items[0].blob,undefined); assert.equal(list.items[0].canRead,false);
  await assert.rejects(f.api.actor('outsider',0,'bootstrap'), /vinculada/);
  f.docs.set(f.api.path('members','owner'), {...f.actors.owner, active:false});
  await assert.rejects(f.api.run(f.actors.owner,'clinical.read',id), /permissão mudou/);
});
test('OTP is one use, patient suspends and reauthorization is required; code not returned to staff', async () => {
  const f=fixture(), {id}=await f.create();
  const c=await f.api.run(f.actors.reception,'access.request',id,{targetUid:'owner',duration:'until_revoked'});
  assert.deepEqual(Object.keys(c).sort(),['expiresAt','requestId']);
  await f.api.run(f.actors.reception,'access.confirm',id,{requestId:c.requestId,code:f.otp()});
  await assert.rejects(f.api.run(f.actors.reception,'access.confirm',id,{requestId:c.requestId,code:f.otp()}),/utilizado/);
  const portal=await f.api.portal(f.token(),'view'); assert.equal(portal.grants.length,1);
  await f.api.portal(f.token(),'suspend',undefined,'owner');
  await assert.rejects(f.api.run(f.actors.owner,'clinical.read',id), /autorizar/);
  f.advance(60001);
  const c2=await f.api.run(f.actors.reception,'access.request',id,{targetUid:'other',duration:'visit'});
  await f.api.portal(f.token(),'confirm',f.otp());
  await f.api.run(f.actors.other,'clinical.read',id);
  f.advance(28800001); await assert.rejects(f.api.run(f.actors.other,'clinical.read',id),/autorizar/);
  assert.ok(f.docs.get(f.api.path('challenges',c2.requestId)).codeHash); assert.equal(f.docs.get(f.api.path('challenges',c2.requestId)).code,undefined);
});
test('wrong attempts persist, new challenges are rate limited and expiry rejects', async () => {
  const f=fixture(), {id}=await f.create();
  const c=await f.api.run(f.actors.reception,'access.request',id,{targetUid:'owner',duration:'visit'});
  for(let i=0;i<5;i++) await assert.rejects(f.api.run(f.actors.reception,'access.confirm',id,{requestId:c.requestId,code:'wrong'}));
  assert.equal(f.docs.get(f.api.path('challenges',c.requestId)).attempts,5);
  await assert.rejects(f.api.run(f.actors.reception,'access.confirm',id,{requestId:c.requestId,code:f.otp()}));
  await assert.rejects(f.api.run(f.actors.owner,'access.request',id,{targetUid:'owner',duration:'visit'}), /minuto/);
  f.advance(60001); const c2=await f.api.run(f.actors.owner,'access.request',id,{targetUid:'owner',duration:'visit'});
  f.advance(300001); await assert.rejects(f.api.run(f.actors.owner,'access.confirm',id,{requestId:c2.requestId,code:f.otp()}),/expirado/);
});
test('versions are immutable, changes require reason and concurrent saves conflict', async () => {
  const f=fixture(), {id}=await f.create();
  const read=await f.api.run(f.actors.owner,'clinical.read',id);
  const workspace={...read.workspace,dentispro_evolutions_v2:[{id:'e1',patientId:id,text:'original'}]};
  const results=await Promise.allSettled([1,2].map(() => f.api.run(f.actors.owner,'clinical.save',id,{workspace,revision:0,reason:'Atendimento inicial'})));
  assert.equal(results.filter(r=>r.status==='fulfilled').length,1);
  const current=await f.api.run(f.actors.owner,'clinical.read',id);
  assert.equal(current.revision,1); assert.equal(current.workspace.dentispro_evolutions_v2[0].authorUid,'owner');
  current.workspace.dentispro_evolutions_v2[0].text='overwritten';
  await assert.rejects(f.api.run(f.actors.owner,'clinical.save',id,{workspace:current.workspace,revision:1,reason:'Correction'}),/complemento/);
  const history=await f.api.run(f.actors.owner,'clinical.history',id); assert.equal(history.length,1);
  await assert.rejects(f.api.run(f.actors.owner,'clinical.save',id,{workspace,revision:1,reason:''}),/campos/);
  await assert.rejects(f.api.run(f.actors.reception,'clinical.save',id,{workspace,revision:1,reason:'Not permitted'}),/autorização/);
});
test('exception requires admin, recent password, justification, confirmed contact and delivery; expires and never writes', async () => {
  const f=fixture(), {id}=await f.create();
  await assert.rejects(f.api.run(f.actors.admin,'access.exception',id,{reason:'Atendimento excepcional urgente'}),/contato/);
  await f.api.run(f.actors.reception,'access.request',id,{targetUid:'owner',duration:'visit'}); await f.api.portal(f.token(),'confirm',f.otp());
  await assert.rejects(f.api.run(f.actors.other,'access.exception',id,{reason:'Atendimento excepcional urgente'}),/administração/);
  await assert.rejects(f.api.run({...f.actors.admin,authTime:0},'access.exception',id,{reason:'Atendimento excepcional urgente'}),/senha/);
  await f.api.run(f.actors.admin,'access.exception',id,{reason:'Atendimento excepcional urgente'});
  const r=await f.api.run(f.actors.admin,'clinical.read',id); assert.equal(r.readOnly,true);
  await assert.rejects(f.api.run(f.actors.admin,'clinical.save',id,{workspace:r.workspace,revision:0,reason:'Forbidden change'}),/autorização/);
  f.advance(900001); await assert.rejects(f.api.run(f.actors.admin,'clinical.read',id),/autorizar/);
});
test('audit outage prevents reads and mutations; delivery failure grants nothing', async () => {
  const f=fixture(), {id}=await f.create();
  f.failDelivery(); await assert.rejects(f.api.run(f.actors.reception,'access.request',id,{targetUid:'owner',duration:'visit'}));
  assert.deepEqual(f.docs.get(f.api.path('patients',id)).grants,{});
  const g=fixture(), p=await g.create(); g.failAudit();
  await assert.rejects(g.api.run(g.actors.owner,'clinical.read',p.id), /audit offline/);
  await assert.rejects(g.api.run(g.actors.reception,'patients.update',p.id,{demographics:{name:'Changed',email:'patient@test.invalid'}}));
  assert.equal(g.docs.get(g.api.path('patients',p.id)).demographics.name,'Patient');
});
test('workspace rejects cross-patient rows and maps, contact cannot be silently changed', async () => {
  assert.throws(()=>validateWorkspace({dentispro_patients_v2:[{id:'other'}]},'patient'),/outro paciente/);
  assert.throws(()=>validateWorkspace({dentispro_patients_v2:[{id:'patient'}],dentispro_odontograms_v2:{other:[]}},'patient'),/outro paciente/);
  const f=fixture(), {id}=await f.create();
  await assert.rejects(f.api.run(f.actors.reception,'patients.update',id,{demographics:{name:'Patient',email:'attacker@test.invalid'}}),/contato/);
});
test('revocation while blob is loading denies response', async () => {
  const f=fixture(), {id}=await f.create();
  const r=await f.api.run(f.actors.owner,'clinical.read',id);
  await f.api.run(f.actors.owner,'clinical.save',id,{workspace:r.workspace,revision:0,reason:'Initial version'});
  const original=f.store.getBlob;
  f.store.getBlob=async key=>{
    const p=f.docs.get(f.api.path('patients',id)); f.docs.set(f.api.path('patients',id),{...p,grants:{owner:{status:'suspended',expiresAt:null,authorizedAt:0}}});
    return original(key);
  };
  await assert.rejects(f.api.run(f.actors.owner,'clinical.read',id),/suspenso/);
});

test('migration requires admin reauthentication, preserves IDs and cannot overwrite an import', async () => {
  const f=fixture();
  const input={patientId:'legacy-1',ownerUid:'owner',demographics:{name:'Patient',email:'patient@test.invalid'},workspace:{dentispro_patients_v2:[{id:'legacy-1',name:'Patient',email:'patient@test.invalid'}]},acknowledged:true,reason:'Importação autorizada do cadastro antigo'};
  await assert.rejects(f.api.run(f.actors.other,'migration.import',undefined,input),/administração/);
  await assert.rejects(f.api.run({...f.actors.admin,authTime:0},'migration.import',undefined,input),/senha/);
  await f.api.run(f.actors.admin,'migration.import',undefined,input);
  await assert.rejects(f.api.run(f.actors.admin,'migration.import',undefined,input),/já foi importado/);
  await assert.rejects(f.api.run(f.actors.admin,'clinical.read','legacy-1'),/autorizar/);
  assert.equal((await f.api.run(f.actors.owner,'clinical.read','legacy-1')).revision,1);
});
test('clinic configuration never opens patient data and versions conflict; role changes are effective', async () => {
  const f=fixture();
  await assert.rejects(f.api.run(f.actors.other,'clinic.save',undefined,{workspace:{},revision:0,reason:'Changing settings'}),/administração/);
  await assert.rejects(f.api.run(f.actors.admin,'clinic.save',undefined,{workspace:{dentispro_patients_v2:[]},revision:0,reason:'Wrong scope'}),/inválida/);
  await f.api.run(f.actors.admin,'clinic.save',undefined,{workspace:{dentispro_clinic_info_v1:{name:'Clinic',signatureImageUrl:'data:image/png,private'},dentispro_professionals_v1:[{userId:'owner',name:'Owner'},{userId:'other',name:'Other'}]},revision:0,reason:'Initial settings'});
  const context=await f.api.run(f.actors.owner,'clinic.context');assert.equal(context.workspace.dentispro_professionals_v1.length,1);assert.equal(context.workspace.dentispro_clinic_info_v1.signatureImageUrl,undefined);
  await assert.rejects(f.api.run(f.actors.admin,'clinic.save',undefined,{workspace:{},revision:0,reason:'Stale settings'}),/outra sessão/);
  await f.api.run(f.actors.admin,'members.save',undefined,{uid:'other',role:'dentist',active:false});
  await assert.rejects(f.api.actor('other',0,'bootstrap'),/vinculada/);
});
test('concurrent successful OTP submissions grant only once', async () => {
  const f=fixture(),{id}=await f.create();
  const c=await f.api.run(f.actors.reception,'access.request',id,{targetUid:'owner',duration:'visit'});
  const results=await Promise.allSettled([1,2].map(()=>f.api.run(f.actors.reception,'access.confirm',id,{requestId:c.requestId,code:f.otp()})));
  assert.equal(results.filter(r=>r.status==='fulfilled').length,1);
  assert.equal(f.docs.get(f.api.path('challenges',c.requestId)).status,'used');
});
test('print and export recheck grants and do not unnecessarily return the chart', async () => {
  const f=fixture(),{id}=await f.create();
  assert.deepEqual(await f.api.run(f.actors.owner,'clinical.print',id),{allowed:true});
  await assert.rejects(f.api.run(f.actors.admin,'clinical.export',id),/autorizar/);
  assert.ok(f.logs.some(e=>e.action==='clinical.print'&&e.outcome==='success'));
});
test('appointments are administrative and retain previous versions; direct clinical fields are not accepted', async () => {
  const f=fixture(),{id}=await f.create();
  const a=await f.api.run(f.actors.reception,'appointments.save',id,{professionalUid:'owner',date:'2026-09-25',time:'10:30',status:'agendado',diagnosis:'must not be stored'});
  const rows=await f.api.run(f.actors.reception,'appointments.list',id);assert.equal(rows[0].diagnosis,undefined);
  await f.api.run(f.actors.reception,'appointments.save',id,{...rows[0],status:'cancelado'});
  assert.equal((await f.store.list(f.api.path('appointment_versions'))).length,2);
  assert.equal((await f.api.run(f.actors.reception,'appointments.list',id))[0].status,'cancelado');
});
