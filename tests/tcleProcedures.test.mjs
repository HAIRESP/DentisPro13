import { test } from 'node:test';
import assert from 'node:assert/strict';
import {renderTcleProceduresBody,renderTclePatientSignature} from '../src/utils/tcleProcedures.ts';
const data={patientName:'Paciente <teste>',document:'CPF: 000',birthDate:'01/02/2000',legalGuardian:'Responsável & Família',professionalName:'Dentista Teste',professionalCro:'CRO-CE nº 123',city:'Fortaleza - CE',date:'16 de outubro de 2026'};
test('TCLE contém as seis seções, os três códigos e os dados preenchidos com escape',()=>{
 const html=renderTcleProceduresBody(data);
 for(const code of ['8.10.00.065','8.40.00.139','8.53.00.047'])assert.ok(html.includes(code));
 assert.equal((html.match(/<h3 /g)||[]).length,6);
 assert.ok(html.includes('Paciente &lt;teste&gt;'));
 assert.ok(html.includes('Responsável &amp; Família'));
 assert.ok(html.includes('01/02/2000'));
 assert.ok(html.includes('CRO-CE nº 123'));
 assert.ok(html.includes('posso revogar este consentimento'));
 assert.ok(renderTclePatientSignature(data).includes('Assinatura do Paciente ou Responsável Legal'));
});
