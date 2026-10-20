import assert from 'node:assert/strict';
import {test} from 'node:test';
import {getRecordedExamReport} from '../src/utils/clinicalReportData.ts';

test('sem exame nao afirma achados clinicos normais',()=>{
  const report=getRecordedExamReport();
  assert.equal(report.summary,'Exame clínico não registrado.');
  assert.equal(report.periodontal,'Não registrado.');
});
test('exame parcial nao preenche tecidos ausentes',()=>{
  const report=getRecordedExamReport({intraoral:{gingivaPeriodontum:'Sangramento registrado'},extraoral:{}});
  assert.equal(report.periodontal,'Sangramento registrado');
  assert.equal(report.softTissues,'Não registrado.');
  assert.equal(report.observations,'Não registrado.');
});
test('achados e observacoes salvos aparecem sem modificar o exame',()=>{
  const exam={intraoral:{buccalMucosa:'Lesão anotada',tongueAndFloor:'Observação da língua',notes:'Nota intraoral'},extraoral:{notes:'Nota extraoral'},generalNotes:'Observação geral'};
  const before=JSON.stringify(exam);
  const report=getRecordedExamReport(exam);
  for(const text of ['Lesão anotada','Observação da língua','Nota intraoral','Nota extraoral','Observação geral']) assert.ok(report.summary.includes(text));
  assert.equal(JSON.stringify(exam),before);
});
test('campos vazios continuam nao registrados',()=>{
  const report=getRecordedExamReport({intraoral:{gingivaPeriodontum:'  ',buccalMucosa:''},extraoral:{},generalNotes:' '});
  assert.equal(report.periodontal,'Não registrado.');
  assert.equal(report.softTissues,'Não registrado.');
  assert.equal(report.observations,'Não registrado.');
});
