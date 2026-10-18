import {test} from 'node:test';
import assert from 'node:assert/strict';
import {ageAtExam} from '../src/utils/clinicalPanelCapture.ts';
test('idade usa a data do exame e inclui anos e meses sem inventar nascimento',()=>{
 assert.equal(ageAtExam('2000-02-15','2026-10-16'),'26 anos e 8 meses');
 assert.equal(ageAtExam('2000-02-15','2026-10-14'),'26 anos e 7 meses');
 assert.equal(ageAtExam('2025-10-16','2026-10-16'),'1 ano e 0 meses');
 assert.equal(ageAtExam('2026-09-16','2026-10-16'),'0 anos e 1 mês');
 assert.equal(ageAtExam(undefined,'2026-10-16'),'Idade não informada');
 assert.equal(ageAtExam('2027-01-01','2026-10-16'),'Idade não informada');
 assert.equal(ageAtExam('2026-02-30','2026-10-16'),'Idade não informada');
});
