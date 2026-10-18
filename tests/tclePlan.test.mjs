import {test} from 'node:test';
import assert from 'node:assert/strict';
import {proceduresForConsent,applyConsentContent} from '../src/utils/tclePlan.ts';
import {renderTcleProceduresBody} from '../src/utils/tcleProcedures.ts';
const item={id:'i',procedureName:'Procedimento <A>',tussCode:'123',status:'pendente',finalCost:120,toothNumber:26};
const plan={id:'p',patientId:'a',status:'aprovado',items:[item,{...item,id:'done',status:'concluido'},{...item,id:'no',selectedForPlan:false}]};
const catalog=[{code:'123',fullDescription:'Técnica',professionalDescription:'Interna',patientDescription:'Explicação',risks:'Risco & cuidado',benefits:'Benefício'}];
test('usa somente procedimentos pendentes escolhidos e detalhes do código correto',()=>{
 const rows=proceduresForConsent(plan,catalog);assert.equal(rows.length,1);assert.equal(rows[0].region,'Dente 26');assert.equal(rows[0].value,120);assert.equal(rows[0].patientDescription,'Explicação');assert.deepEqual(proceduresForConsent({...plan,status:'cancelado'},catalog),[]);
});
test('conteúdo do paciente prevalece sobre catálogo e preserva campos financeiros',()=>{
 const saved=applyConsentContent(item,{...proceduresForConsent(plan,catalog)[0],risks:''});assert.equal(saved.finalCost,120);assert.equal(saved.toothNumber,26);assert.equal(proceduresForConsent({...plan,items:[saved]},catalog)[0].risks,'');
});
test('TCLE dinâmico usa snapshot, escapa textos e não inclui exemplos ou texto interno',()=>{
 const procedures=proceduresForConsent(plan,catalog);
 const data={patientName:'Paciente',procedures};const snapshot=JSON.parse(JSON.stringify(data));catalog[0].risks='Alterado';
 const html=renderTcleProceduresBody(snapshot);assert.ok(html.includes('Procedimento &lt;A&gt;'));assert.ok(html.includes('Risco &amp; cuidado'));assert.ok(html.includes('Dente 26'));assert.ok(html.includes('120,00'));assert.ok(!html.includes('Interna'));assert.ok(!html.includes('8.10.00.065'));assert.ok(!html.includes('rotineiros e seguros'));assert.ok(!renderTcleProceduresBody({...data,procedures:[]}).includes('Raspagem'));
});
