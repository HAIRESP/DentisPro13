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
