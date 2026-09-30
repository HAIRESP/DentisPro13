import test from 'node:test';
import assert from 'node:assert/strict';
import {summarizeClinicalExam, normalizePatientRecord} from '../src/utils/clinicalRecordSummary.ts';

test('reports never infer normal findings from absent or empty clinical exams', () => {
  assert.equal(summarizeClinicalExam(null), 'Exame clínico não registrado.');
  assert.equal(summarizeClinicalExam({extraoral:{},intraoral:{}}), 'Exame sem observações clínicas registradas.');
  const text = summarizeClinicalExam({extraoral:{},intraoral:{gingivaPeriodontum:'Sangramento registrado'}});
  assert.equal(text, 'Gengiva e periodonto: Sangramento registrado');
  assert.doesNotMatch(text, /Classe I|Adequado|Baixo|sem lesões/);
});

test('minimal patient records can render without inventing clinical answers; recorded negatives remain negatives', () => {
  const p = normalizePatientRecord({id:'p',name:'Paciente'});
  assert.equal(p.address.city,''); assert.equal(p.birthDate,''); assert.equal(p.gender,'');
  assert.equal(p.anamnesis.hasAllergies,undefined); assert.equal(p.anamnesis.isPregnant,undefined);
  const original = {id:'p',name:'Paciente',anamnesis:{hasAllergies:false,hasDiabetes:true},address:{city:'Fortaleza'}};
  const normalized = normalizePatientRecord(original);
  assert.equal(normalized.anamnesis.hasAllergies,false); assert.equal(normalized.anamnesis.hasDiabetes,true);
  assert.equal(normalized.address.city,'Fortaleza'); assert.equal(original.address.street,undefined);
});
