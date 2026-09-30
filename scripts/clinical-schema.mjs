// Generate the runtime structural contract from the clinical TypeScript models.
// Unsupported syntax fails generation; never silently weaken validation.
import ts from 'typescript';
import {readFileSync, writeFileSync} from 'node:fs';
const source=ts.createSourceFile('types.ts',readFileSync(new URL('../src/types/index.ts',import.meta.url),'utf8'),ts.ScriptTarget.Latest,true);
const declarations=new Map(source.statements.filter(n=>ts.isInterfaceDeclaration(n)||ts.isTypeAliasDeclaration(n)).map(n=>[n.name.text,n]));
const definitions={};
function object(members){
 const properties={};const required=[];
 for(const m of members){
  if(!ts.isPropertySignature(m)||!m.type)throw Error('Unsupported member: '+m.getText(source));
  const key=m.name.getText(source).replace(/^['"]|['"]$/g,'');
  properties[key]=schema(m.type);if(!m.questionToken)required.push(key);
 }
 return {kind:'object',properties,required};
}
function reference(name){
 if(!Object.hasOwn(definitions,name)){
  const n=declarations.get(name);if(!n)throw Error('Unknown model '+name);
  definitions[name]={kind:'pending'};
  definitions[name]=ts.isInterfaceDeclaration(n)?object(n.members):schema(n.type);
 }
 return {kind:'ref',name};
}
function schema(n){
 if(n.kind===ts.SyntaxKind.StringKeyword)return {kind:'string'};
 if(n.kind===ts.SyntaxKind.NumberKeyword)return {kind:'number'};
 if(n.kind===ts.SyntaxKind.BooleanKeyword)return {kind:'boolean'};
 if(n.kind===ts.SyntaxKind.AnyKeyword)return {kind:'json'};
 if(ts.isLiteralTypeNode(n))return {kind:'literal',value:ts.isStringLiteral(n.literal) ? n.literal.text : JSON.parse(n.literal.getText(source))};
 if(ts.isUnionTypeNode(n))return {kind:'union',options:n.types.map(schema)};
 if(ts.isArrayTypeNode(n))return {kind:'array',item:schema(n.elementType)};
 if(ts.isTypeLiteralNode(n))return object(n.members);
 if(ts.isTypeReferenceNode(n)){
  const name=n.typeName.getText(source),args=n.typeArguments;
  if(name==='Record')return {kind:'record',key:schema(args[0]),value:schema(args[1])};
  if(name==='Partial' && ts.isTypeReferenceNode(args[0]) && args[0].typeName.getText(source)==='Record')return schema(args[0]);
  return reference(name);
 }
 throw Error('Unsupported type: '+n.getText(source));
}
const roots={dentispro_patients_v2:'Patient',dentispro_prescriptions_v2:'Prescription',dentispro_evolutions_v2:'ClinicalEvolutionEntry',dentispro_treatment_plans_v2:'TreatmentPlan',dentispro_patient_payments_v2:'PatientPayment',dentispro_financial_v2:'FinancialTransaction',dentispro_insurance_guides_v2:'InsuranceGuide',dentispro_saved_documents_v2:'SavedClinicDocument',dentispro_odontograms_v2:'ToothCondition',dentispro_odontogram_snapshots_v2:'OdontogramSnapshot',dentispro_clinical_exams_v2:'ClinicalExam'};
for(const name of Object.values(roots))reference(name);
// Server metadata is persisted on evolution records, beyond the display model.
definitions.ClinicalEvolutionEntry.properties.authorUid={kind:'string'};
definitions.ClinicalEvolutionEntry.properties.recordedAt={kind:'string'};
// Patient-scoped financial guides must carry their link even in the older model.
definitions.InsuranceGuide.properties.patientId={kind:'string'};
definitions.InsuranceGuide.required.push('patientId');
const output=JSON.stringify({version:1,roots,definitions},null,2)+'\n';
const target=new URL('../server/security/clinical-schema.json',import.meta.url);
if(process.argv.includes('--check')){if(readFileSync(target,'utf8').replace(/\r\n/g,'\n')!==output)throw Error('Clinical schema is stale: node scripts/clinical-schema.mjs');}
else writeFileSync(target,output);
