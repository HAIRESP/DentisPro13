// Diagnostic reproductions: a reproduced finding is NOT a security pass. Synthetic data only.
import assert from 'node:assert/strict';
import {ClinicalSecurity} from '../../../server/security/service.ts';
import {canRead, validateWorkspace, requireRecentPassword, codeDigest} from '../../../server/security/policy.ts';

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

const findings = [];
async function probe(id, fn) {try {const evidence=await fn();findings.push({id,reproduced:true,evidence});}catch(e){findings.push({id,reproduced:false,error:e.message});}}
await probe('R01_pending_code_restores_suspended_access', async()=>{
 const f=fixture(),{id}=await f.create();
 await f.api.run(f.actors.reception,'access.request',id,{targetUid:'owner',duration:'until_revoked'});
 const portal=f.token(); await f.api.portal(portal,'confirm',f.otp());
 f.advance(60001);
 await f.api.run(f.actors.reception,'access.request',id,{targetUid:'owner',duration:'until_revoked'});
 const oldCode=f.otp(),request=f.messages.at(-1);
 await f.api.portal(portal,'suspend',undefined,'owner');
 await assert.rejects(f.api.run(f.actors.owner,'clinical.read',id));
 await f.api.portal(f.token(),'confirm',oldCode);
 await f.api.run(f.actors.owner,'clinical.read',id);
 return 'A code issued before suspension reactivated access after suspension.';
});
await probe('R02_patient_loses_self_service_revocation',async()=>{
 const f=fixture(),{id}=await f.create();
 await f.api.run(f.actors.reception,'access.request',id,{targetUid:'owner',duration:'until_revoked'});
 const portal=f.token();await f.api.portal(portal,'confirm',f.otp());f.advance(86400001);
 await assert.rejects(f.api.portal(portal,'suspend',undefined,'owner'),/expirado/);
 await f.api.run(f.actors.owner,'clinical.read',id);
 return 'Unlimited grant remains active after the only patient management link expires.';
});
await probe('R03_incomplete_clinical_schema_accepted',async()=>{
 const f=fixture(),{id}=await f.create();const r=await f.api.run(f.actors.owner,'clinical.read',id);
 const workspace={...r.workspace,dentispro_treatment_plans_v2:[{patientId:id}],dentispro_clinical_exams_v2:{[id]:null}};
 await f.api.run(f.actors.owner,'clinical.save',id,{workspace,revision:0,reason:'Synthetic malformed record'});
 return 'Missing record ID/items and null exam accepted as a saved clinical version.';
});
await probe('R04_forged_clinical_identity_accepted',async()=>{
 const f=fixture(),{id}=await f.create();const r=await f.api.run(f.actors.owner,'clinical.read',id);
 const workspace={...r.workspace,dentispro_prescriptions_v2:[{id:'rx',patientId:id,dentistName:'Other Professional',authorUid:'other',date:'2026-01-01'}]};
 await f.api.run(f.actors.owner,'clinical.save',id,{workspace,revision:0,reason:'Synthetic attribution probe'});
 const p=(await f.api.run(f.actors.owner,'clinical.read',id)).workspace.dentispro_prescriptions_v2[0];
 assert.equal(p.authorUid,'other');assert.equal(p.dentistName,'Other Professional');
 return 'Version author is owner, but prescription retains client-supplied other author/professional.';
});
await probe('R05_demographic_race_with_clinical_save',async()=>{
 const f=fixture(),{id}=await f.create();const r=await f.api.run(f.actors.owner,'clinical.read',id);
 const put=f.store.putBlob;f.store.putBlob=async w=>{const key=await put(w);await f.api.run(f.actors.reception,'patients.update',id,{demographics:{name:'Updated Name',email:'patient@test.invalid'}});return key;};
 await f.api.run(f.actors.owner,'clinical.save',id,{workspace:r.workspace,revision:0,reason:'Concurrent registration change'});
 const now=await f.api.run(f.actors.owner,'clinical.read',id),old=await f.api.run(f.actors.owner,'clinical.version',id,{versionId:'000000000001'});
 assert.equal(now.workspace.dentispro_patients_v2[0].name,'Updated Name');assert.equal(old.workspace.dentispro_patients_v2[0].name,'Patient');
 return 'Save succeeds while demographics changed; new snapshot already has stale identity.';
});
await probe('R06_read_released_after_suspend_during_final_audit',async()=>{
 const f=fixture(),{id}=await f.create();const audit=f.store.audit;
 f.store.audit=async e=>{if(e.action==='clinical.read'&&e.outcome==='success'){const p=f.docs.get(f.api.path('patients',id));f.docs.set(f.api.path('patients',id),{...p,grants:{owner:{status:'suspended',expiresAt:null}}});}return audit(e);};
 const r=await f.api.run(f.actors.owner,'clinical.read',id);assert.equal(r.workspace.dentispro_patients_v2.length,1);
 assert.equal(f.docs.get(f.api.path('patients',id)).grants.owner.status,'suspended');
 return 'Response contains clinical data even though suspension completed while final audit awaited.';
});
await probe('R07_exception_invisible_and_not_suspendable_by_patient',async()=>{
 const f=fixture(),{id}=await f.create();await f.api.run(f.actors.reception,'access.request',id,{targetUid:'owner',duration:'until_revoked'});const portal=f.token();await f.api.portal(portal,'confirm',f.otp());
 await f.api.run(f.actors.admin,'access.exception',id,{reason:'Synthetic exceptional access'});
 const view=await f.api.portal(portal,'view');assert.equal(view.grants.some(g=>g.uid==='admin'),false);
 await assert.rejects(f.api.portal(portal,'suspend',undefined,'admin'),/não encontrada/);
 return 'Patient receives notification but exception-only admin is absent from grants and cannot be suspended.';
});
await probe('R08_inactive_actor_gets_patient_list_in_flight',async()=>{
 const f=fixture(),{id}=await f.create();const audit=f.store.audit;
 f.store.audit=async e=>{if(e.action==='patients.list'&&e.outcome==='attempt')f.docs.set(f.api.path('members','reception'),{...f.actors.reception,active:false});return audit(e);};
 const r=await f.api.run(f.actors.reception,'patients.list');assert.equal(r.items[0].id,id);
 return 'Member deactivated during intent audit still receives patient list; this branch has no recheck.';
});
await probe('R09_configuration_committed_then_response_fails',async()=>{
 const f=fixture();await assert.rejects(f.api.run(f.actors.admin,'clinic.save',undefined,{workspace:{dentispro_clinic_info_v1:null},revision:0,reason:'Synthetic invalid configuration'}));
 assert.equal(f.docs.get(f.api.path('settings','current')).revision,1);
 return 'Null configuration passes validator and commits; Object.keys(null) fails during result audit.';
});
console.log(JSON.stringify({warning:'Reproduced=true means a defect was observed, not fixed.',findings},null,2));
if(findings.some(f=>!f.reproduced)) process.exitCode=1;
