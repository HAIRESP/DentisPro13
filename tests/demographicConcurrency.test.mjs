import test from 'node:test';
import assert from 'node:assert/strict';
import {fixture} from './clinicalFixture.mjs';
const demographics={name:'Patient',email:'patient@test.invalid',phone:'123',cpf:'',birthDate:''};
test('R05: stale demographic form cannot replace a more recent update',async()=>{
 const f=fixture(),{id}=await f.create();
 await f.api.run(f.actors.reception,'patients.update',id,{demographics,demographicsRevision:0});
 await assert.rejects(f.api.run(f.actors.reception,'patients.update',id,{demographics:{...demographics,phone:'old'},demographicsRevision:0}),e=>e.status===409);
 assert.equal(f.docs.get(f.api.path('patients',id)).demographics.phone,'123');
 await f.api.run(f.actors.reception,'patients.update',id,{demographics:{...demographics,phone:'456'},demographicsRevision:1});
 assert.equal(f.docs.get(f.api.path('patients',id)).demographicsRevision,2);
});
test('R05: demographic change during clinical upload blocks publication of stale version',async()=>{
 const f=fixture(),{id}=await f.create(),read=await f.api.run(f.actors.owner,'clinical.read',id,{});
 const put=f.store.putBlob;f.store.putBlob=async w=>{const ref=await put(w);await f.api.run(f.actors.reception,'patients.update',id,{demographics,demographicsRevision:0});return ref;};
 await assert.rejects(f.api.run(f.actors.owner,'clinical.save',id,{workspace:read.workspace,revision:0,reason:'First consultation'}),e=>e.status===409&&/cadastro mudou/.test(e.message));
 assert.equal(f.docs.get(f.api.path('patients',id)).revision,0);
 assert.equal(f.docs.get(f.api.path('patients',id)).demographics.phone,'123');
});
test('later consultation completes unanswered screening without rewriting previous consultation',async()=>{
 const f=fixture(),{id}=await f.create(),read=await f.api.run(f.actors.owner,'clinical.read',id,{});
 let saved=await f.api.run(f.actors.owner,'clinical.save',id,{workspace:read.workspace,revision:0,reason:'First consultation: incomplete screening'});
 f.advance(86400000);saved.workspace.dentispro_patients_v2[0].anamnesis.hasAllergies=true;
 const next=await f.api.run(f.actors.owner,'clinical.save',id,{workspace:saved.workspace,revision:1,reason:'Second consultation: patient confirms allergy'});
 assert.equal(next.revision,2);assert.equal(next.workspace.dentispro_patients_v2[0].anamnesis.hasAllergies,true);
 const old=await f.api.run(f.actors.owner,'clinical.version',id,{versionId:'000000000001'});
 assert.equal(old.workspace.dentispro_patients_v2[0].anamnesis.hasAllergies,undefined);
 next.workspace.dentispro_patients_v2[0].anamnesis.hasAllergies='invalid';
 await assert.rejects(f.api.run(f.actors.owner,'clinical.save',id,{workspace:next.workspace,revision:2,reason:'Invalid value must not replace valid record'}),e=>e.status===400);
 assert.equal(f.docs.get(f.api.path('patients',id)).revision,2);
});
