import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { medicationAnswer, medicationSummary, anamnesisRows, anamnesisFields } from '../src/utils/anamnesisData.ts';
import { commitAnamnesis } from '../src/utils/anamnesisStore.ts';
import { buildAnamnesisPdf, archivedAnamnesisInput } from '../src/utils/anamnesisPdf.ts';
import { STORAGE_KEYS } from '../src/utils/storageKeys.ts';
const clinic={name:'Clínica Fictícia',dentistName:'Dentista Fictício',cro:'CRO TESTE',address:'Rua Teste',city:'Fortaleza',phone:'',email:'',specialty:''};
const setup=()=>{
 const patients=[{id:'p',name:'Paciente fictício',anamnesis:{continuousMedication:'Losartana 50 mg'}}];
 const documents=[{id:'old',content:'original'}];
 const map=new Map([[STORAGE_KEYS.PATIENTS,JSON.stringify(patients)],[STORAGE_KEYS.SAVED_DOCUMENTS,JSON.stringify(documents)]]);
 return {patients,documents,map,storage:{getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v),removeItem:k=>map.delete(k)}};
};
test('medication preserves legacy answers, explicit no and unknown are distinct',()=>{
 assert.equal(medicationAnswer({}),undefined);assert.equal(medicationAnswer({continuousMedication:'  '}),undefined);
 assert.equal(medicationAnswer({continuousMedication:'Losartana'}),true);
 assert.equal(medicationAnswer({takesMedication:false,continuousMedication:'registro anterior'}),false);
 assert.equal(medicationSummary({takesMedication:true,medicationDetails:'Antibiótico temporário'}),'Antibiótico temporário');
 assert.equal(medicationSummary({}),'Não informado');
});
test('print schema covers every medical-history field except review timestamp, keeps zero and false',()=>{
 const source=readFileSync(new URL('../src/types/index.ts',import.meta.url),'utf8').split('export interface Anamnesis {')[1].split('\n}')[0];
 const keys=[...source.matchAll(/^\s*(\w+)\??:/gm)].map(m=>m[1]).filter(k=>k!=='lastReviewedAt');
 assert.deepEqual([...anamnesisFields.map(f=>f.key)].sort(),keys.sort());
 const rows=anamnesisRows({painEvaScore:0,hasDiabetes:false});
 assert.equal(rows.find(r=>r.key==='painEvaScore').answer,'0');
 assert.equal(rows.find(r=>r.key==='hasDiabetes').answer,'Não');
 assert.equal(rows.find(r=>r.key==='hasHeartDisease').answer,'Não informado');
});
test('save and reopen preserve medication, unknown extension fields and historical documents',()=>{
 const f=setup(), old=f.patients[0].anamnesis;
 const result=commitAnamnesis(f.storage,f.patients,f.documents,'p',old,{...old,takesMedication:true,medicationDetails:'Amoxicilina conforme relato',futureField:'preservado'},{id:'new',content:'snapshot'});
 assert.equal(JSON.parse(f.storage.getItem(STORAGE_KEYS.PATIENTS))[0].anamnesis.medicationDetails,'Amoxicilina conforme relato');
 assert.equal(result.documents[1].content,'original');assert.equal(result.patients[0].anamnesis.futureField,'preservado');
});
test('archive write failure restores patient and archive; stale form is rejected',()=>{
 const f=setup(), before=JSON.stringify([...f.map]);let fails=true;
 const storage={...f.storage,setItem:(k,v)=>{if(k===STORAGE_KEYS.SAVED_DOCUMENTS&&fails){fails=false;throw Error('quota');}f.map.set(k,v);}};
 assert.throws(()=>commitAnamnesis(storage,f.patients,f.documents,'p',f.patients[0].anamnesis,{takesMedication:false},{id:'new'}),/Não foi possível salvar/);
 assert.equal(JSON.stringify([...f.map]),before);
 assert.throws(()=>commitAnamnesis(f.storage,f.patients,f.documents,'p',{}, {},{id:'new'}),/mudou em outra tela/);
});
test('archived questionnaire uses saved answers and identity; invalid content is rejected',()=>{
 const input=archivedAnamnesisInput({patientName:'Nome antigo',patientCpf:'cpf antigo',createdAt:'2026-10-09T10:00:00Z',professionalName:'Profissional antigo',content:JSON.stringify({medicationDetails:'Medicamento antigo'})},clinic);
 assert.equal(input.patient.name,'Nome antigo');assert.equal(input.anamnesis.medicationDetails,'Medicamento antigo');assert.equal(input.clinic.showSignatureImage,false);
 assert.throws(()=>archivedAnamnesisInput({content:'bad'},clinic),/respostas legíveis/);
});
test('PDF is a real paginated document and supports long medication responses',async()=>{
 const {pdf,filename}=await buildAnamnesisPdf({patient:{name:'Paciente Fictício'},anamnesis:{takesMedication:true,medicationDetails:'Medicação relatada. '.repeat(200)},clinic,date:new Date('2026-10-09T10:00:00Z')});
 assert.ok(pdf.getNumberOfPages()>2);assert.match(pdf.output(),/^%PDF-/);assert.ok(filename.endsWith('.pdf'));
});
test('PDF is stored with patient files, preserving photographs and prior files after reload',()=>{
 const f=setup();f.patients[0].images=['foto-existente'];f.patients[0].files=[{id:'old-file',name:'anterior.pdf'}];
 f.storage.setItem(STORAGE_KEYS.PATIENTS,JSON.stringify(f.patients));
 const file={id:'pdf-new',name:'prontuario.pdf',fileUrl:'data:application/pdf;base64,JVBERi0=',fileType:'pdf',uploadedAt:'2026-10-09',sourceDocumentId:'doc-new'};
 const doc={id:'doc-new',patientId:'p',patientFileId:file.id,content:'snapshot'};
 commitAnamnesis(f.storage,f.patients,f.documents,'p',f.patients[0].anamnesis,{takesMedication:false},doc,file);
 const reopened=JSON.parse(f.storage.getItem(STORAGE_KEYS.PATIENTS))[0];
 assert.deepEqual(reopened.images,['foto-existente']);assert.equal(reopened.files[0].fileUrl,file.fileUrl);assert.equal(reopened.files[1].id,'old-file');
 assert.equal(JSON.parse(f.storage.getItem(STORAGE_KEYS.SAVED_DOCUMENTS))[0].patientFileId,'pdf-new');
});
test('failed archive save rolls back attached PDF and preserves previous files',()=>{
 const f=setup(),before=f.storage.getItem(STORAGE_KEYS.PATIENTS);let failed=false;
 const storage={...f.storage,setItem:(key,value)=>{if(key===STORAGE_KEYS.SAVED_DOCUMENTS&&!failed){failed=true;throw Error('quota');}f.storage.setItem(key,value);}};
 assert.throws(()=>commitAnamnesis(storage,f.patients,f.documents,'p',f.patients[0].anamnesis,{}, {id:'d',patientId:'p'}, {id:'f',sourceDocumentId:'d',fileUrl:'data:application/pdf;base64,JVBERi0='}),/Não foi possível salvar/);
 assert.equal(f.storage.getItem(STORAGE_KEYS.PATIENTS),before);
});
test('real PDF bytes and filename survive saving and reopening inside patient files',async()=>{
 const f=setup();
 const {pdf,filename}=await buildAnamnesisPdf({patient:{id:'p',name:'Paciente Fictício'},anamnesis:{takesMedication:true,medicationDetails:'Medicamento fictício 10 mg',hasDiabetes:false},clinic,date:new Date('2026-10-09T12:00:00Z')});
 const originalBytes=Buffer.from(pdf.output('arraybuffer'));
 const file={id:'pdf-roundtrip',name:filename,fileUrl:pdf.output('datauristring'),fileType:'pdf',uploadedAt:'2026-10-09',sourceDocumentId:'doc-roundtrip'};
 commitAnamnesis(f.storage,f.patients,f.documents,'p',f.patients[0].anamnesis,{takesMedication:true},{id:'doc-roundtrip',patientId:'p'},file);
 const reopened=JSON.parse(f.storage.getItem(STORAGE_KEYS.PATIENTS))[0].files[0];
 const reopenedBytes=Buffer.from(reopened.fileUrl.split(',')[1],'base64');
 assert.deepEqual(reopenedBytes,originalBytes);
 assert.equal(reopened.name,filename);assert.ok(filename.endsWith('.pdf'));
 assert.ok(reopenedBytes.subarray(0,8).toString().startsWith('%PDF-'));
 assert.ok(reopenedBytes.subarray(-30).toString().includes('%%EOF'));
});
