import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {DatabaseSync} from 'node:sqlite';
import {openClinicOdontogramStore} from '../server/clinicOdontogramStore.mjs';
const patient={id:'patient-a',name:'Paciente de teste',birthDate:'1990-01-01'};
const input={requestId:'evaluation-1',expectedVersion:0,conditions:[{toothNumber:16}],date:'2026-10-20',title:'Avaliação',description:'Teste',filename:'Teste.pdf',pdfBase64:Buffer.from('%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\nstartxref\n0\n%%EOF').toString('base64'),details:{notes:'Observação',vitalSigns:{heartRate:72}}};
function fixture(t){
 const directory=mkdtempSync(join(tmpdir(),'dentispro-clinic-'));
 const filename=join(directory,'odontogram.sqlite');
 const users={hugo:{uid:'account-hugo',name:'Hugo',role:'dentist'},other:{uid:'account-other',name:'Outra dentista',role:'dentist',professionalId:'pr2'},admin:{uid:'admin',role:'admin'},reception:{uid:'reception',role:'receptionist'}};
 const auth={session(token){if(!users[token])throw Error('expired');return users[token];}};
 let store=openClinicOdontogramStore(filename,auth);
 t.after(()=>{store.close();rmSync(directory,{recursive:true,force:true});});
 return {get store(){return store;},filename,users,reopen(){store.close();store=openClinicOdontogramStore(filename,auth);}};
}
test('clinic mode links only the selected patient and needs no individual grant',t=>{
 const f=fixture(t);
 assert.throws(()=>f.store.read('hugo',patient.id),e=>e.status===404);
 assert.deepEqual(f.store.registerPatient('hugo',patient.id,{...patient,unexpected:'not persisted'}),{patient});
 assert.deepEqual(f.store.patient('other',patient.id),{patient});
 assert.equal(f.store.read('other',patient.id).version,0);
 assert.throws(()=>f.store.registerPatient('hugo','different',patient),e=>e.status===400);
 assert.throws(()=>f.store.read('hugo','different'),e=>e.status===404);
});
test('clinic SQLite preserves evaluation PDF vitals author and replay after restart',t=>{
 const f=fixture(t);f.store.registerPatient('hugo',patient.id,patient);
 const saved=f.store.completeEvaluation('hugo',patient.id,{...input,createdBy:'spoofed'});
 f.reopen();assert.deepEqual(f.store.read('other',patient.id).details,input.details);
 const history=f.store.history('other',patient.id);
 assert.equal(history[0].dentistUid,'account-hugo');assert.equal(history[0].dentistName,'Hugo');
 assert.equal(f.store.evaluationDocument('other',patient.id,saved.id).pdfBase64,input.pdfBase64);
 assert.equal(f.store.evaluationEvolution('other',patient.id,saved.id).professionalUid,'account-hugo');
 assert.equal(f.store.completeEvaluation('hugo',patient.id,input).alreadySaved,true);
 assert.equal(f.store.history('hugo',patient.id).length,1);
});
test('clinic rejects identity collisions without overwriting existing identity or evaluation',t=>{
 const f=fixture(t);f.store.registerPatient('hugo',patient.id,patient);f.store.completeEvaluation('hugo',patient.id,input);
 for(const data of [{...patient,name:'Outra pessoa'},{...patient,birthDate:'1980-01-01'}])assert.throws(()=>f.store.registerPatient('other',patient.id,data),e=>e.status===409);
 assert.deepEqual(f.store.patient('hugo',patient.id),{patient});assert.equal(f.store.read('hugo',patient.id).version,1);
});
test('clinic mode still requires authenticated dentist and respects revoked sessions',t=>{
 const f=fixture(t);
 for(const token of ['admin','reception','missing'])assert.throws(()=>f.store.registerPatient(token,patient.id,patient),e=>[401,403].includes(e.status));
 f.store.registerPatient('hugo',patient.id,patient);delete f.users.hugo;
 assert.throws(()=>f.store.read('hugo',patient.id),e=>e.status===401);
 assert.throws(()=>f.store.completeEvaluation('admin',patient.id,input),e=>e.status===403);
});
test('concurrent stale version cannot overwrite the saved evaluation',t=>{
 const f=fixture(t);f.store.registerPatient('hugo',patient.id,patient);f.store.completeEvaluation('hugo',patient.id,input);
 assert.throws(()=>f.store.completeEvaluation('other',patient.id,{...input,requestId:'evaluation-2',conditions:[]}),e=>e.status===409);
 assert.deepEqual(f.store.read('hugo',patient.id).conditions,input.conditions);
});
test('failure to record author rolls back odontogram PDF evolution and replay key together',t=>{
 const f=fixture(t);f.store.registerPatient('hugo',patient.id,patient);
 const db=new DatabaseSync(f.filename);
 try{
  db.exec("CREATE TRIGGER fail_author BEFORE INSERT ON odontogram_authors BEGIN SELECT RAISE(ABORT,'author unavailable'); END");
  assert.throws(()=>f.store.completeEvaluation('hugo',patient.id,input),/author unavailable/);
  for(const table of ['odontogram_current','odontogram_history','odontogram_documents','odontogram_evolutions','odontogram_requests'])assert.equal(db.prepare(`SELECT count(*) n FROM ${table}`).get().n,0);
  db.exec('DROP TRIGGER fail_author');f.store.completeEvaluation('hugo',patient.id,input);
  assert.throws(()=>db.exec('DELETE FROM odontogram_authors'),/Immutable/);
  assert.ok(db.prepare("SELECT count(*) n FROM odontogram_events WHERE actor_uid='account-hugo'").get().n>0);
 }finally{db.close();}
});
