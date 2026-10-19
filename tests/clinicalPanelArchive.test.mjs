import {test} from 'node:test';
import assert from 'node:assert/strict';
import {panelData,panelSummary,persistClinicalSave,validateExamDate} from '../src/utils/clinicalPanelArchive.ts';
import {extractAppliedVoiceCommand} from '../src/utils/voiceApplyCommand.ts';

test('voz somente confirma com Aplicar ao final',()=>{
 assert.equal(extractAppliedVoiceCommand('dente 16 cárie'),null);
 assert.equal(extractAppliedVoiceCommand('Aplicar cárie no 16'),null);
 assert.equal(extractAppliedVoiceCommand('dente 16 cárie Aplicar.'),'dente 16 cárie');
 assert.equal(extractAppliedVoiceCommand('Aplicar'), '');
 assert.equal(extractAppliedVoiceCommand('dente 16 reaplicar'),null);
});
test('datas inválidas são recusadas antes de arquivar',()=>{
 for(const value of ['', '2026-02-30','2026-13-01','14/10/2026']) assert.throws(()=>validateExamDate(value));
 assert.doesNotThrow(()=>validateExamDate('2028-02-29'));
});
test('relatórios dos painéis não misturam datas e achados',()=>{
 const exam={extraoral:{examDate:'2026-10-01',notes:'Face'},intraoral:{examDate:'2026-10-02',notes:'Língua'},painExam:{examDate:'2026-10-03',diagnostico:'Dor'},generalNotes:'Parecer'};
 assert.equal(panelData('extraoral',exam,[]).examDate,'2026-10-01');
 assert.equal(panelData('intraoral',exam,[]).examDate,'2026-10-02');
 assert.equal(panelData('pain',exam,[]).examDate,'2026-10-03');
 assert.match(panelSummary(panelData('extraoral',exam,[])),/Face/);
 assert.doesNotMatch(panelSummary(panelData('extraoral',exam,[])),/Língua|Dor|examDate/);
 assert.match(panelSummary(panelData('odontogram',exam,[{toothNumber:16,wholeToothCondition:'carie'}])),/Dente: 16/);
});
test('falha de armazenamento desfaz gravação parcial e mantém dados anteriores',()=>{
 const data=new Map([['pacientes','anterior'],['exames','exame anterior']]);
 const storage={getItem:k=>data.get(k)??null,removeItem:k=>data.delete(k),setItem(k,v){if(k==='exames'&&v==='novo')throw Error('quota');data.set(k,v);}};
 assert.throws(()=>persistClinicalSave(storage,[['pacientes','novo'],['exames','novo'],['evolucoes','nova']]),/quota/);
 assert.equal(data.get('pacientes'),'anterior');assert.equal(data.get('exames'),'exame anterior');assert.equal(data.has('evolucoes'),false);
});
test('sucesso grava exame, evolução e galeria',()=>{
 const data=new Map();const storage={getItem:k=>data.get(k)??null,removeItem:k=>data.delete(k),setItem:(k,v)=>data.set(k,v)};
 persistClinicalSave(storage,[['pacientes','pdf'],['exames','data'],['evolucoes','resumo']]);
 assert.equal(data.size,3);
});

test('sinais vitais permanecem independentes e entram no resumo de cada painel',()=>{
 const exam={odontogramVitalSigns:{temperature:'36,5'},extraoral:{vitalSigns:{bloodPressure:'120/80'}},intraoral:{vitalSigns:{heartRate:'72'}},painExam:{vitalSigns:{oxygenSaturation:'98'}}};
 for(const [panel,label,value] of [['odontogram','Temperatura corpórea (°C)','36,5'],['extraoral','Pressão arterial (mmHg)','120/80'],['intraoral','Batimentos cardíacos (bpm)','72'],['pain','Oximetria (%)','98']]) {
  const summary=panelSummary(panelData(panel,exam,[]));
  assert.ok(summary.includes(`${label}: ${value}`));
  assert.equal(summary.split('\n').length,1);
 }
 const persisted=JSON.parse(JSON.stringify(exam));
 assert.deepEqual(persisted,exam);
 assert.equal(panelSummary(panelData('extraoral',{extraoral:{}},[])),'');

});
import {commitClinicalPanel,clinicalPanelRows,examDateValue} from '../src/utils/clinicalPanelRecord.ts';
import {buildClinicalPanelPdf} from '../src/utils/clinicalPanelPdf.ts';
import {STORAGE_KEYS} from '../src/utils/storageKeys.ts';
import {prepareLocalSpeech,speechErrorMessage} from '../src/utils/localSpeech.ts';
const clinic={name:'Clínica fictícia',dentistName:'Dentista fictício',cro:'CRO TESTE'};
const initial=()=>({patients:[{id:'p',name:'Paciente fictício',images:['foto-anterior'],files:[]}],exams:{p:{patientId:'p',extraoral:{examDate:'2026-10-01',notes:'original'},intraoral:{examDate:'2026-10-02'},painExam:{examDate:'2026-10-03'},odontogramExamDate:'2026-10-04'}},evolutions:[{id:'antiga',description:'preservada'}],snapshots:{}});
function setup(){const fallback=initial(),map=new Map();return {fallback,map,storage:{getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v),removeItem:k=>map.delete(k)}};}
const input=(panel,date,data={})=>({patientId:'p',panel,date,data,evolution:{id:'e-'+panel,patientId:'p',date,savedAt:'2026-10-14T02:00:00Z'},file:{id:'f-'+panel,sourceEvolutionId:'e-'+panel,fileUrl:'data:application/pdf;base64,JVBERi0='}});
test('each saved panel keeps its independent date, prior evolution and photographs',()=>{
 const f=setup();let next;
 for(const [panel,date] of [['extraoral','2026-09-10'],['intraoral','2026-09-11'],['pain','2026-09-12'],['odontogram','2026-09-13']])next=commitClinicalPanel(f.storage,f.fallback,input(panel,date,{notes:'novo'}));
 assert.equal(next.exams.p.extraoral.examDate,'2026-09-10');assert.equal(next.exams.p.intraoral.examDate,'2026-09-11');assert.equal(next.exams.p.painExam.examDate,'2026-09-12');assert.equal(next.exams.p.odontogramExamDate,'2026-09-13');
 assert.equal(next.patients[0].files.length,4);assert.equal(next.evolutions.length,5);assert.equal(next.evolutions[4].description,'preservada');assert.deepEqual(next.patients[0].images,['foto-anterior']);
});
test('a quota failure rolls back exam, evolution, PDF and snapshot together',()=>{
 const f=setup();let fail=true;const storage={...f.storage,setItem:(k,v)=>{if(k===STORAGE_KEYS.EVOLUTIONS&&fail){fail=false;throw Error('quota');}f.storage.setItem(k,v);}};
 assert.throws(()=>commitClinicalPanel(storage,f.fallback,input('extraoral','2026-10-05')),/Não foi possível arquivar/);
 assert.equal(f.map.size,0);
});
test('snapshot is preserved with odontogram PDF/evolution and invalid dates reject all writes',()=>{
 const f=setup(),i=input('odontogram','2026-10-07',{conditions:[]});i.snapshot={id:'s',patientId:'p',date:i.date,conditions:[]};
 const next=commitClinicalPanel(f.storage,f.fallback,i);assert.equal(next.snapshots.p[0].id,'s');
 assert.throws(()=>examDateValue('2026-02-30'));assert.throws(()=>examDateValue(''));
});
test('rows preserve zero, negative answers, units, and full observations',()=>{
 const rows=clinicalPanelRows('extraoral',{heartRateBpm:0,bodyTemperatureCelsius:36.7,notes:'observação completa',other:false});
 assert.equal(rows.find(r=>r.label.includes('BPM')).answer,'0');assert.equal(rows.find(r=>r.label.includes('°C')).answer,'36.7');assert.equal(rows.find(r=>r.label==='other').answer,'Não');
});
test('every panel generates real PDF bytes with its own title, including vector odontogram',async()=>{
 for(const panel of ['pain','extraoral','intraoral','odontogram']){
  const {pdf,filename}=await buildClinicalPanelPdf({patient:{id:'p',name:'Paciente fictício'},panel,date:'2026-10-06',data:panel==='odontogram'?{conditions:[{toothNumber:16,surfaces:{mesial:'carie'}}]}:{notes:'Observação '.repeat(1000)},clinic});
  const bytes=Buffer.from(pdf.output('arraybuffer'));assert.ok(bytes.subarray(0,8).toString().startsWith('%PDF-'));assert.ok(filename.endsWith('.pdf'));assert.ok(pdf.getNumberOfPages()>=1);
 }
});
test('local speech prepares Portuguese pack before microphone start and never enables remote recognition',async()=>{
 let installed=false;const r={processLocally:false};const statuses=[];const C={available:async()=>installed?'available':'downloadable',install:async({langs})=>{assert.deepEqual(langs,['pt-BR']);installed=true;return true;}};
 await prepareLocalSpeech(C,r,v=>statuses.push(v));assert.equal(r.processLocally,true);assert.equal(r.lang,'pt-BR');assert.ok(statuses.some(s=>s.includes('Preparando')));
 await assert.rejects(()=>prepareLocalSpeech({available:async()=> 'unavailable'},r,()=>{}),/Português não está disponível/);
 assert.ok(speechErrorMessage('not-allowed').includes('microfone'));assert.ok(speechErrorMessage('audio-capture').includes('dispositivo'));
});
