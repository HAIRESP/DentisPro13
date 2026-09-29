import test from 'node:test';
import assert from 'node:assert/strict';
import {fixture} from './clinicalFixture.mjs';
import {applyClinicalAuthorship, markImportedAuthorship} from '../server/security/clinicalAuthorship.ts';
const identity={uid:'owner',name:'owner',cro:'CRO/CE 12345'};
const rx=id=>({id:'rx',patientId:id,patientName:'Patient',date:'2026-09-29',medications:[],type:'simples',dentistName:'Another professional',dentistCro:'CRO/CE 999'});
async function setup(){const f=fixture(),{id}=await f.create(),read=await f.api.run(f.actors.owner,'clinical.read',id,{});read.workspace.dentispro_prescriptions_v2=[rx(id)];return {...f,id,workspace:read.workspace};}
const save=(f,w=f.workspace,revision=0)=>f.api.run(f.actors.owner,'clinical.save',f.id,{workspace:w,revision,reason:'Authorship regression test'});
test('R04: server binds prescription name, CRO and provenance to authenticated account',async()=>{
 const f=await setup(),result=await save(f),r=result.workspace.dentispro_prescriptions_v2[0];
 assert.equal(r.dentistName,'owner');assert.equal(r.dentistCro,identity.cro);assert.equal(r.provenance.authorUid,'owner');assert.equal(r.provenance.source,'server');
 assert.equal([...f.docs.entries()].find(([k])=>k.includes('/versions/'))[1].authorUid,'owner');
 const again=await save(f,result.workspace,1);assert.deepEqual(again.workspace.dentispro_prescriptions_v2[0],r);
});
test('R04: client cannot forge provenance or overwrite/delete finalized prescription',async()=>{
 const f=await setup();f.workspace.dentispro_prescriptions_v2[0].provenance=applyClinicalAuthorship({dentispro_prescriptions_v2:[rx(f.id)]},undefined,identity,Date.now()).dentispro_prescriptions_v2[0].provenance;
 await assert.rejects(save(f),/exclusivamente pelo servidor/);delete f.workspace.dentispro_prescriptions_v2[0].provenance;
 const saved=await save(f);
 for(const change of [w=>w.dentispro_prescriptions_v2[0].dentistName='Forged',w=>w.dentispro_prescriptions_v2=[],w=>delete w.dentispro_prescriptions_v2]){
  const w=structuredClone(saved.workspace);change(w);await assert.rejects(save(f,w,1),/finalizado/);
 }
 assert.equal(f.docs.get(f.api.path('patients',f.id)).revision,1);
});
test('R04: missing CRO and profile change during upload cannot commit a clinical version',async()=>{
 const f=await setup(),profile=f.docs.get('users/owner');delete profile.cro;
 await assert.rejects(save(f),/CRO com UF/);assert.equal(f.docs.get(f.api.path('patients',f.id)).revision,0);
 profile.cro=identity.cro;const put=f.store.putBlob;f.store.putBlob=async w=>{const ref=await put(w);f.docs.get('users/owner').cro='CRO/CE 54321';return ref;};
 await assert.rejects(save(f),/perfil profissional mudou/);assert.equal(f.docs.get(f.api.path('patients',f.id)).revision,0);
});
test('R04: subsequent editor preserves original provenance and gets separate modification attribution',()=>{
 const first=applyClinicalAuthorship({dentispro_treatment_plans_v2:[{id:'plan',dentistName:'Spoof',title:'Plan'}]},undefined,identity,1800000000000);
 const edit=structuredClone(first);edit.dentispro_treatment_plans_v2[0].title='Updated';
 const second=applyClinicalAuthorship(edit,first,{uid:'other',name:'Other',cro:'CRO/CE 123'},1800000001000).dentispro_treatment_plans_v2[0];
 assert.equal(second.provenance.authorUid,'owner');assert.equal(second.provenance.lastModifiedBy,'other');
 edit.dentispro_treatment_plans_v2[0].provenance.authorUid='forged';assert.throws(()=>applyClinicalAuthorship(edit,first,identity,Date.now()),/autoria original/);
});
test('R04: import is explicitly unverified and structured documents cannot carry forged embedded identity',()=>{
 const w={dentispro_prescriptions_v2:[rx('patient')]},imported=markImportedAuthorship(w,{uid:'admin',name:'Admin'},Date.now());
 const p=imported.dentispro_prescriptions_v2[0];assert.equal(p.dentistName,'Another professional');assert.equal(p.provenance.authorUid,'');assert.equal(p.provenance.source,'legacy_unverified');assert.equal(p.provenance.importedBy,'admin');
 const doc={id:'doc',professionalName:'Spoof',templateData:{dentistName:'Spoof',dentistCro:'fake'}};
 const out=applyClinicalAuthorship({dentispro_saved_documents_v2:[doc]},undefined,identity,Date.now()).dentispro_saved_documents_v2[0];
 assert.equal(out.professionalName,'owner');assert.equal(out.templateData.dentistCro,identity.cro);
 for(const bad of [{...doc,htmlSnapshot:'<p>Forged</p>'},{...doc,templateData:{signatureImageUrl:'data:image/png;base64,AA'}}])assert.throws(()=>applyClinicalAuthorship({dentispro_saved_documents_v2:[bad]},undefined,identity,Date.now()));
});
