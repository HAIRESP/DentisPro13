import test from 'node:test';
import assert from 'node:assert/strict';
import {authorship,appendLocalAudit,detachDocumentFiles} from '../src/utils/localAuthorship.ts';
import {reportVitalSigns} from '../src/utils/reportVitalSigns.ts';
import {PROCEDURE_PARAMETERS} from '../src/data/procedureParameters.ts';
import {registerHooks} from 'node:module';
registerHooks({resolve(specifier,context,next){if(specifier.startsWith('.')&&!/\.[a-z]+$/i.test(specifier))return next(specifier+'.ts',context);return next(specifier,context);}});
const {prepareBackupRestore}=await import('../src/utils/databaseBackup.ts');
test('authorship always identifies authenticated account, without a fabricated professional link',()=>{
 assert.deepEqual(authorship({uid:'u-hugo',name:'Hugo'},'2026-10-20T12:00:00Z'),{accountUid:'u-hugo',professionalId:'',professionalName:'Hugo',at:'2026-10-20T12:00:00Z'});
 assert.throws(()=>authorship(null),/Entre novamente/);
});
test('local activity preserves previous actors and reports storage failure',()=>{
 const data=new Map();const storage={getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v)};
 appendLocalAudit(storage,authorship({uid:'u1',name:'Hugo'}),'consulta-info','p1');
 appendLocalAudit(storage,authorship({uid:'u2',name:'Maria'}),'documento-removido','d1');
 const rows=JSON.parse(data.get('dentispro_activity_audit_v1'));
 assert.deepEqual(rows.map(r=>r.professionalName),['Hugo','Maria']);
 assert.equal(rows[1].targetId,'d1');assert.notEqual(rows[0].id,rows[1].id);
 assert.throws(()=>appendLocalAudit({...storage,setItem(){throw Error('quota');}},authorship({uid:'u1',name:'Hugo'}),'consulta','p1'),/quota/);
});
test('vital signs keep exam dates and blanks separate instead of combining readings',()=>{
 const patient={medicalExamDate:'2026-10-19',medicalVitalSigns:{heartRate:'72'}};
 const exam={extraoral:{examDate:'2026-10-20',vitalSigns:{bloodPressure:'120/80'}},intraoral:{}};
 const rows=reportVitalSigns(patient,exam);
 assert.equal(rows.length,2);assert.equal(rows[0].date,'2026-10-19');assert.equal(rows[1].date,'2026-10-20');
 assert.equal(rows[0].readings.find(r=>r.label==='Pressão arterial').value,'');
 assert.equal(rows[1].readings.find(r=>r.label==='Frequência cardíaca').value,'');
});
test('empty examinations do not invent signs or dates',()=>{assert.deepEqual(reportVitalSigns({},null),[]);const r=reportVitalSigns({medicalVitalSigns:{heartRate:'0'}},null);assert.equal(r[0].date,'');assert.equal(r[0].readings[1].value,'0');});
test('legacy vital measurements and glucose are retained without mutating source',()=>{
 const exam={extraoral:{heartRateBpm:70,bloodPressureSystolic:120,bloodPressureDiastolic:80,capillaryGlucoseMgDl:90},intraoral:{}};
 const before=JSON.stringify(exam);const row=reportVitalSigns(null,exam)[0];
 assert.equal(row.readings[0].value,'120/80');assert.equal(row.readings[4].value,'90');assert.equal(JSON.stringify(exam),before);
});
test('procedure dictionary separates individual records and contains no clinical example defaults',()=>{
 assert.equal(PROCEDURE_PARAMETERS.length,21);assert.equal(new Set(PROCEDURE_PARAMETERS.map(f=>f.category)).size,6);
 assert.deepEqual(PROCEDURE_PARAMETERS.filter(f=>f.patientOnly).map(f=>f.key),['eligibility','actualComplications','evolutionLots','consent']);
 assert.ok(PROCEDURE_PARAMETERS.every(f=>!('example' in f) && !('value' in f)));
});
test('backups preserve local activity and trash while old backups leave them intact',()=>{
 const base={app:'DentisPro Dental Management System',patients:[],appointments:[],inventory:[]};
 const old=prepareBackupRestore(JSON.stringify(base));assert.equal(old.has('dentispro_activity_audit_v1'),false);
 const writes=prepareBackupRestore(JSON.stringify({...base,activityAudit:[{id:'event1',professionalName:'Hugo'}],documentTrash:[{id:'doc1',removedBy:{professionalName:'Hugo'}}]}));
 assert.equal(JSON.parse(writes.get('dentispro_document_trash_v1'))[0].removedBy.professionalName,'Hugo');
});

test('document removal detaches only its own patient files and retains bytes for trash',()=>{
 const file={id:'f1',sourceDocumentId:'d1',fileUrl:'data:application/pdf;base64,AAAA'};
 const patients=[{id:'p1',files:[file,{id:'f2',sourceDocumentId:'d2'}]},{id:'p2',files:[{id:'f3',sourceDocumentId:'d1'}]}];
 const result=detachDocumentFiles(patients,{id:'d1',patientId:'p1'});
 assert.deepEqual(result.nextPatients[0].files.map(f=>f.id),['f2']);assert.deepEqual(result.linkedFiles,[file]);assert.equal(result.nextPatients[1],patients[1]);assert.equal(patients[0].files.length,2);
 assert.deepEqual(detachDocumentFiles(patients,{id:'d1'}).linkedFiles,[]);
});
