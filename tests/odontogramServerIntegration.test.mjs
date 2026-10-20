import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { openClinicalReviewStore } from '../server/clinicalReviewStore.mjs';
import { openClinicalOdontogramStore } from '../server/clinicalOdontogramStore.mjs';

function setup(t) {
  const dir = mkdtempSync(join(tmpdir(), 'dentispro-14b-'));
  const reviewPath = join(dir, 'review.sqlite');
  const db = new DatabaseSync(reviewPath);
  db.exec(`PRAGMA user_version=2;
    CREATE TABLE migration(id INTEGER PRIMARY KEY,state TEXT);
    INSERT INTO migration VALUES(1,'staged_not_active');
    CREATE TABLE patient_records(patient_id TEXT PRIMARY KEY,record_json TEXT);
    INSERT INTO patient_records VALUES('p1','{"patient":{"id":"p1"}}');
    CREATE TABLE patient_access(patient_id TEXT,account_uid TEXT,permission TEXT,professional_id TEXT,expires_at INTEGER,version INTEGER);
    CREATE TABLE clinical_access_events(id INTEGER PRIMARY KEY,occurred_at INTEGER,actor_uid TEXT,action TEXT,patient_id TEXT,outcome TEXT,details_json TEXT);`);
  let clock = 1000;
  db.prepare('INSERT INTO patient_access VALUES(?,?,?,?,?,?)').run('p1','d1','write','pr1',2000,1);
  const users = { d1: {uid:'d1',role:'dentist',professionalId:'pr1'}, admin: {uid:'a',role:'admin'}, reception: {uid:'r',role:'receptionist'} };
  const auth = { session: token => { if (!users[token]) throw Error('invalid'); return users[token]; } };
  const review = openClinicalReviewStore(reviewPath, {resolveSession:auth.session,resolveAccount:()=>null,now:()=>clock});
  const filename = join(dir,'odontogram.sqlite');
  let store = openClinicalOdontogramStore(filename,auth,review);
  t.after(()=>{store.close();review.close();db.close();rmSync(dir,{recursive:true,force:true});});
  return {get store(){return store;},db,users,review,auth,filename,
    expire:()=>{clock=2000;},
    reopen:()=>{store.close();store=openClinicalOdontogramStore(filename,auth,review);}};
}
const input = {requestId:'request1',expectedVersion:0,conditions:[{toothNumber:16}],date:'2026-10-19',title:'Avaliação',description:'Registro de teste',filename:'Teste.pdf',pdfBase64:Buffer.from('%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\nstartxref\n0\n%%EOF').toString('base64')};
test('integrated store preserves complete acknowledgement after restart and repeated request',t=>{
  const f=setup(t); const first=f.store.completeEvaluation('d1','p1',input);
  f.reopen();const repeated=f.store.completeEvaluation('d1','p1',input);
  assert.deepEqual(repeated,{...first,alreadySaved:true});
  assert.equal(f.store.history('d1','p1').length,1);
  assert.equal(f.store.evaluationDocument('d1','p1',first.id).pdfBase64,input.pdfBase64);
});
test('read-only grant can read but cannot save draft or completed evaluation',t=>{
  const f=setup(t);f.db.exec("UPDATE patient_access SET permission='read'");
  assert.equal(f.store.read('d1','p1').version,0);
  assert.throws(()=>f.store.save('d1','p1',{expectedVersion:0,conditions:[]}),e=>e.status===403);
  assert.throws(()=>f.store.completeEvaluation('d1','p1',input),e=>e.status===403);
  assert.equal(f.store.read('d1','p1').version,0);
  assert.equal(f.db.prepare("SELECT count(*) AS n FROM clinical_access_events WHERE outcome='denied'").get().n,2);
});
test('integration denies other patient, admin, reception and invalid sessions',t=>{
  const f=setup(t);
  for(const actor of ['admin','reception'])assert.throws(()=>f.store.read(actor,'p1'),e=>e.status===403);
  assert.throws(()=>f.store.read('missing','p1'),e=>e.status===401);
  assert.throws(()=>f.store.read('d1','p2'),e=>e.status===403);
});
test('revoked grant blocks read, write and replay of previously saved operation',t=>{
  const f=setup(t);f.store.completeEvaluation('d1','p1',input);
  f.db.exec('UPDATE patient_access SET expires_at=0');
  assert.throws(()=>f.store.read('d1','p1'),e=>e.status===403);
  assert.throws(()=>f.store.completeEvaluation('d1','p1',input),e=>e.status===403);
});
test('expired grant and changed professional link are rejected',t=>{
  const f=setup(t);f.users.d1.professionalId='other';
  assert.throws(()=>f.store.read('d1','p1'),e=>e.status===403);
  f.users.d1.professionalId='pr1';f.expire();
  assert.throws(()=>f.store.read('d1','p1'),e=>e.status===403);
});
test('revoked session is rejected after a successful evaluation',t=>{
  const f=setup(t);f.store.completeEvaluation('d1','p1',input);delete f.users.d1;
  assert.throws(()=>f.store.read('d1','p1'),e=>e.status===401);
});
test('missing patient record and unsupported permission fail closed',t=>{
  const f=setup(t);
  assert.throws(()=>f.review.authorizeOdontogram('d1','p1','delete'),e=>e.status===400);
  f.db.exec('DELETE FROM patient_records');
  assert.throws(()=>f.store.read('d1','p1'),e=>e.status===403);
});

test('clinical date, notes and vital signs survive restart with history and PDF',t=>{
  const f=setup(t);const details={notes:'Observação clínica',vitalSigns:{heartRate:72,examTime:'10:30'}};
  const result=f.store.completeEvaluation('d1','p1',{...input,details});f.reopen();
  const current=f.store.read('d1','p1');assert.deepEqual(current.details,details);assert.equal(current.date,input.date);
  assert.deepEqual(f.store.history('d1','p1')[0].details,details);
  assert.equal(f.store.evaluationDocument('d1','p1',result.id).pdfBase64,input.pdfBase64);
});
test('invalid metadata is rejected without changing current odontogram',t=>{
  const f=setup(t);
  for(const details of [[],{unexpected:true},{notes:42},{vitalSigns:[]},{notes:'x'.repeat(20001)}]) {
    assert.throws(()=>f.store.completeEvaluation('d1','p1',{...input,details}),e=>e.status===400);
  }
  assert.equal(f.store.read('d1','p1').version,0);assert.equal(f.store.history('d1','p1').length,0);
});
test('changed metadata cannot reuse an already completed request ID',t=>{
  const f=setup(t);f.store.completeEvaluation('d1','p1',{...input,details:{notes:'original'}});
  assert.throws(()=>f.store.completeEvaluation('d1','p1',{...input,details:{notes:'alterada'}}),e=>e.status===409);
  assert.equal(f.store.read('d1','p1').details.notes,'original');
});
test('metadata remains immutable and its insertion rolls back with evaluation failure',t=>{
  const f=setup(t);const db=new DatabaseSync(f.filename);
  try {
    db.exec("CREATE TRIGGER fail_details BEFORE INSERT ON odontogram_evaluation_details BEGIN SELECT RAISE(ABORT,'metadata unavailable'); END");
    assert.throws(()=>f.store.completeEvaluation('d1','p1',{...input,details:{notes:'teste'}}),/metadata unavailable/);
    assert.equal(f.store.read('d1','p1').version,0);assert.equal(f.store.history('d1','p1').length,0);
    db.exec('DROP TRIGGER fail_details');f.store.completeEvaluation('d1','p1',{...input,details:{notes:'teste'}});
    assert.throws(()=>db.exec('DELETE FROM odontogram_evaluation_details'),/Immutable/);
    assert.throws(()=>db.exec("UPDATE odontogram_evaluation_details SET details_json='{}'"),/Immutable/);
  }finally{db.close();}
});
