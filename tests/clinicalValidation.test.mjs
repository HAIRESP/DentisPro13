import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {validateWorkspace, AccessError} from '../server/security/policy.ts';
import {fixture} from './clinicalFixture.mjs';
const date='2026-09-29';
function complete(id='patient') {
 return {
  dentispro_patients_v2:[{id,name:'Paciente fictício',email:'patient@test.invalid',cpf:'',phone:'',birthDate:'',gender:'',status:'ativo',createdAt:date,address:{street:'',number:'',neighborhood:'',city:'',state:'',cep:''},anamnesis:{hasAllergies:false,hasDiabetes:true}}],
  dentispro_treatment_plans_v2:[{id:'plan',patientId:id,patientName:'Paciente fictício',title:'Plano',date,dentistName:'Profissional',status:'proposto',items:[{id:'item',procedureName:'Consulta',specialty:'Clínica geral',cost:100,finalCost:100,status:'pendente'}],totalValue:100,discountValue:0,finalValue:100}],
  dentispro_prescriptions_v2:[{id:'rx',patientId:id,patientName:'Paciente fictício',date,medications:[{name:'Medicamento de teste',dosage:'Conforme prescrição',instructions:'Exemplo fictício',quantity:'1'}],type:'simples',dentistName:'Profissional',dentistCro:''}],
  dentispro_odontograms_v2:{[id]:[{toothNumber:11,surfaces:{mesial:'carie'}}]},
  dentispro_odontogram_snapshots_v2:{[id]:[{id:'snapshot',patientId:id,date,title:'Registro',conditions:[{toothNumber:11,wholeToothCondition:'sio'}]}]},
  dentispro_clinical_exams_v2:{[id]:{patientId:id,updatedAt:date,extraoral:{},intraoral:{gingivaPeriodontum:'Observação registrada'},painExam:{patientId:id,examType:'rotina',examDate:date,painCharacteristics:{},swelling:{},hda:'',affectedArea:{},supplementary:{},toothSummaries:[]}}},
  dentispro_evolutions_v2:[{id:'evolution',patientId:id,date,dentistName:'Profissional',procedure:'Consulta',description:'Observação registrada'}],
  dentispro_patient_payments_v2:[{id:'payment',patientId:id,patientName:'Paciente fictício',date,amount:100,paymentMethod:'pix',description:'Consulta'}],
  dentispro_financial_v2:[{id:'transaction',patientId:id,type:'receita',category:'Atendimento',description:'Consulta',amount:100,date,paymentMethod:'pix',status:'pago'}],
  dentispro_insurance_guides_v2:[{id:'guide',patientId:id,guideNumber:'1',insuranceName:'Convênio fictício',patientName:'Paciente fictício',procedureName:'Consulta',submissionDate:date,valueClaimed:100,valueApproved:0,disallowanceValue:0,status:'enviada'}],
  dentispro_saved_documents_v2:[{id:'doc',patientId:id,patientName:'Paciente fictício',createdAt:date,formattedDateStr:'29/09/2026',title:'Documento',professionalName:'Profissional',category:'prontuario',summary:'Registro',status:'gerado',templateData:{anamnesis:{hasAllergies:false}}}],
 };
}
const mutations=[
 ['missing plan ID',w=>delete w.dentispro_treatment_plans_v2[0].id],
 ['missing plan items',w=>delete w.dentispro_treatment_plans_v2[0].items],
 ['null exam',w=>w.dentispro_clinical_exams_v2.patient=null],
 ['boolean as string',w=>w.dentispro_patients_v2[0].anamnesis.hasAllergies='false'],
 ['missing medication dosage',w=>delete w.dentispro_prescriptions_v2[0].medications[0].dosage],
 ['invalid plan status',w=>w.dentispro_treatment_plans_v2[0].status='unknown'],
 ['impossible date',w=>w.dentispro_patient_payments_v2[0].date='2026-02-30'],
 ['invalid timestamp',w=>w.dentispro_clinical_exams_v2.patient.updatedAt='2026-09-29T29:15:00Z'],
 ['negative amount',w=>w.dentispro_financial_v2[0].amount=-10],
 ['not finite',w=>w.dentispro_insurance_guides_v2[0].valueClaimed=Infinity],
 ['tooth number',w=>w.dentispro_odontograms_v2.patient[0].toothNumber=99],
 ['tooth surface',w=>w.dentispro_odontograms_v2.patient[0].surfaces={bogus:'carie'}],
 ['nested other patient',w=>w.dentispro_clinical_exams_v2.patient.painExam.patientId='other'],
 ['snapshot other patient',w=>w.dentispro_odontogram_snapshots_v2.patient[0].patientId='other'],
 ['duplicate items',w=>w.dentispro_treatment_plans_v2[0].items.push({...w.dentispro_treatment_plans_v2[0].items[0]})],
 ['unexpected field',w=>w.dentispro_patients_v2[0].unexpected=true],
 ['prototype key',w=>Object.defineProperty(w.dentispro_saved_documents_v2[0].templateData,'__proto__',{value:{admin:true},enumerable:true})],
 ['too many rows',w=>w.dentispro_prescriptions_v2=Array.from({length:10001},(_,i)=>({...w.dentispro_prescriptions_v2[0],id:`r${i}`}))],
 ['too large',w=>w.dentispro_saved_documents_v2[0].htmlSnapshot='x'.repeat(24*1024*1024+1)],
];
test('clinical schemas accept every resource, preserve content and unanswered screening',()=>{
 const w=complete();delete w.dentispro_patients_v2[0].anamnesis.hasAllergies;
 const before=structuredClone(w);assert.deepEqual(validateWorkspace(w,'patient'),before);assert.deepEqual(w,before);
 assert.equal(w.dentispro_patients_v2[0].anamnesis.hasAllergies,undefined);
});
test('clinical schemas reject malformed nested records without exposing patient values',async t=>{
 for(const [name,mutate]of mutations)await t.test(name,()=>{const w=complete();mutate(w);assert.throws(()=>validateWorkspace(w,'patient'),e=>e instanceof AccessError&&e.status===400&&!e.message.includes('Paciente fictício'));});
});
test('R03: malformed clinical save and migration create no blob or version',async()=>{
 for(const action of ['clinical.save','migration.import']){
  const f=fixture(),{id}=await f.create();let puts=0;const put=f.store.putBlob;f.store.putBlob=async v=>{puts++;return put(v);};
  const patientId=action==='migration.import'?'imported':id,w=complete(patientId);w.dentispro_treatment_plans_v2[0]={patientId};w.dentispro_clinical_exams_v2[patientId]=null;
  const input={workspace:w,revision:0,reason:'Synthetic validation regression',patientId,ownerUid:'owner',demographics:{name:'Patient',email:'patient@test.invalid'},acknowledged:true};
  await assert.rejects(f.api.run(action==='migration.import'?f.actors.admin:f.actors.owner,action,action==='migration.import'?undefined:id,input),e=>e.status===400);
  assert.equal(puts,0);assert.equal(f.docs.get(f.api.path('patients',id)).revision,0);
  assert.equal(f.docs.has(f.api.path('patients','imported')),false);assert.equal([...f.docs.keys()].some(k=>k.includes('/versions/')),false);
 }
});
test('valid complete workspace saves twice and retains immutable server-authored evolution',async()=>{
 const f=fixture(),{id}=await f.create(),w=complete(id);Object.assign(w.dentispro_patients_v2[0],{name:'Patient'});
 const saved=await f.api.run(f.actors.owner,'clinical.save',id,{workspace:w,revision:0,reason:'Initial complete record'});
 assert.equal(saved.revision,1);assert.equal(saved.workspace.dentispro_evolutions_v2[0].authorUid,'owner');
 saved.workspace.dentispro_patients_v2[0].anamnesis.notes='Atualização';
 const again=await f.api.run(f.actors.owner,'clinical.save',id,{workspace:saved.workspace,revision:1,reason:'Update screening notes'});assert.equal(again.revision,2);
 again.workspace.dentispro_evolutions_v2[0].description='Changed';
 await assert.rejects(f.api.run(f.actors.owner,'clinical.save',id,{workspace:again.workspace,revision:2,reason:'Cannot overwrite evolution'}),/complemento/);
});
test('checked-in runtime contract stays synchronized with clinical TypeScript models',()=>{
 execFileSync(process.execPath,['scripts/clinical-schema.mjs','--check']);
});
