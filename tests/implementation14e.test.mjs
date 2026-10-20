import test from 'node:test';
import assert from 'node:assert/strict';
import {freshMeasurementSession,resetMeasurementDraft} from '../src/utils/measurementSession.ts';
import {clinicalPatient} from '../src/utils/clinicalPatient.ts';
import {documentCategoryLabel,validateModelMetadata,removeCustomModel} from '../src/utils/documentCategory.ts';
import {PROCEDURE_REFERENCE} from '../src/data/procedureReference.ts';
import {ENTITY_REFERENCES} from '../src/data/entityReferences.ts';
test('new measurement session uses local date and time with no old values',()=>{
 assert.deepEqual(freshMeasurementSession(new Date(2026,9,20,9,5)),{date:'2026-10-20',values:{examTime:'09:05'}});
});
test('reset clears legacy and current vitals while keeping clinical findings and the archived record intact',()=>{
 const archived={examDate:'2026-10-19',vitalSigns:{heartRate:'72',temperature:'36.5',bloodPressure:'120/80',oxygenSaturation:'98',examTime:'08:00'},heartRateBpm:72,bloodPressureSystolic:120,bloodPressureDiastolic:80,bodyTemperatureCelsius:36.5,oxygenSaturationPercent:98,capillaryGlucoseMgDl:90,notes:'Achado registrado',images:['anexo1']};
 const before=JSON.stringify(archived);const draft=resetMeasurementDraft(archived,new Date(2026,9,20,10,20));
 assert.equal(JSON.stringify(archived),before);assert.equal(draft.notes,archived.notes);assert.deepEqual(draft.images,['anexo1']);assert.equal(draft.examDate,'2026-10-20');assert.deepEqual(draft.vitalSigns,{examTime:'10:20'});
 for(const key of ['heartRateBpm','bloodPressureSystolic','bloodPressureDiastolic','bodyTemperatureCelsius','oxygenSaturationPercent','capillaryGlucoseMgDl'])assert.equal(draft[key],undefined);
});
test('measurement reset never copies measurements from another session',()=>{
 const next=resetMeasurementDraft({patientId:'p2',examDate:'2026-10-19',vitalSigns:{heartRate:'90'}});
 assert.equal(next.patientId,'p2');assert.equal(next.vitalSigns.heartRate,undefined);
});
test('clinical patient lookup never falls back to the first patient',()=>{
 const patients=[{id:'p1',name:'A'},{id:'p2',name:'B'}];
 assert.equal(clinicalPatient(patients,'p2'),patients[1]);
 for(const id of [null,undefined,'','missing'])assert.equal(clinicalPatient(patients,id),undefined);
});
test('document categories keep recipes and terms distinct from requests',()=>{
 assert.equal(documentCategoryLabel('receita'),'Receita');assert.equal(documentCategoryLabel('receituario'),'Receita');assert.equal(documentCategoryLabel('termo'),'Termo');assert.equal(documentCategoryLabel('solicitacao'),'Solicitação');assert.equal(documentCategoryLabel('outro'),'Outro');
});
test('new procedure reference preserves 22 parameters and flags unfinished source definitions',()=>{
 assert.equal(PROCEDURE_REFERENCE.length,22);assert.equal(new Set(PROCEDURE_REFERENCE.map(r=>r.key)).size,22);
 assert.ok(PROCEDURE_REFERENCE.some(r=>r.key==='patientId'));assert.ok(PROCEDURE_REFERENCE.some(r=>r.key==='face'));
 assert.equal(PROCEDURE_REFERENCE.find(r=>r.key==='priceTable').description,'E');assert.ok(PROCEDURE_REFERENCE.find(r=>r.key==='postCare').note);
 assert.ok(PROCEDURE_REFERENCE.every(r=>!('defaultValue' in r)));
});
test('reference distinguishes implemented entities from the proposed laboratory register',()=>{
 for(const id of ['Patient','PriceTable','LabExamItem','InventoryItem','SavedClinicDocument'])assert.ok(ENTITY_REFERENCES.find(r=>r.id===id)?.fields.length);
 assert.ok(ENTITY_REFERENCES.find(r=>r.id==='laboratories').fields.every(f=>f.status==='Proposta — não implementado'));
});

test('model metadata preserves selected category, subtitle and description and rejects empty names',()=>{
 const metadata={title:'  Modelo  ',subtitle:'Meu subtítulo',description:'Descrição editável',category:'receita'};
 assert.deepEqual(validateModelMetadata(metadata),{...metadata,title:'Modelo'});assert.equal(metadata.title,'  Modelo  ');
 assert.throws(()=>validateModelMetadata({...metadata,title:' '}));assert.throws(()=>validateModelMetadata({...metadata,category:'invalida'}));
});
test('model removal preserves other models and generated document snapshots',()=>{
 const models=[{id:'custom-1',templateText:'Novo texto'},{id:'padrao',templateText:'Padrão'}];
 const issued={templateId:'custom-1',summary:'Conteúdo arquivado',patientId:'p1'};
 const next=removeCustomModel(models,'custom-1');assert.deepEqual(next,[models[1]]);assert.equal(models.length,2);
 assert.equal(issued.summary,'Conteúdo arquivado');assert.equal(issued.templateId,'custom-1');assert.throws(()=>removeCustomModel(models,'padrao'));
});
