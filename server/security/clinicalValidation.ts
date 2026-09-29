import contract from './clinical-schema.json' with {type:'json'};
import {AccessError} from './policy';

type Schema = {kind:string; name?:string; value?:unknown; properties?:Record<string,Schema>; required?:string[]; options?:Schema[]; item?:Schema; key?:Schema};
const definitions = contract.definitions as unknown as Record<string, Schema>;
const MAX_BYTES = 24 * 1024 * 1024;
const MAX_NODES = 100000;
function invalid(path:string, reason:string): never {
  // Show field locations, never values containing patient information.
  throw new AccessError(400, `Prontuário inválido em ${path.slice(0,180)}: ${reason}. Nenhuma versão foi salva.`);
}
function object(value:unknown): value is Record<string,unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value) && Object.getPrototypeOf(value) === Object.prototype;
}
function safeKey(key:string) {return /^[A-Za-z0-9_-]{1,128}$/.test(key) && !['__proto__','prototype','constructor'].includes(key);}
function calendarDate(value:string) {
  const match=/^(\d{4})-(\d{2})-(\d{2})(?:T([01]\d|2[0-3]):([0-5]\d):([0-5]\d)(?:\.\d{1,3})?(?:Z|[+-](?:0\d|1[0-4]):[0-5]\d))?$/.exec(value);
  if(!match)return false;
  const day=new Date(value.slice(0,10)+'T00:00:00.000Z');
  return Number.isFinite(day.getTime()) && day.toISOString().slice(0,10)===value.slice(0,10) && Number.isFinite(Date.parse(value));
}
const dateFields=new Set(['date','birthDate','createdAt','updatedAt','recordedAt','importedAt','lastModifiedAt','examDate','submissionDate','uploadedAt','signatureDate','consentAcceptedAt']);
const amounts=new Set(['amount','cost','finalCost','totalValue','discountValue','finalValue','valueClaimed','valueApproved','disallowanceValue','totalBudget','discount','finalAgreed','installmentValue']);
function semantic(value:unknown,key:string,path:string,optional:boolean,patientId:string) {
  if(typeof value==='string') {
    if((key==='id'||key==='patientId'||(key==='authorUid'&&value!=='')) && !safeKey(value))invalid(path,'identificador ausente ou inválido');
    if(key==='patientId' && value!==patientId)invalid(path,'dados de outro paciente');
    if(dateFields.has(key) && !(value===''&&(optional||key==='birthDate'||key==='recordedAt'||key==='importedAt')) && !calendarDate(value))invalid(path,'data inválida; use data ISO válida');
    if(['name','title','procedureName','procedure','description'].includes(key) && !optional && !value.trim())invalid(path,'campo obrigatório vazio');
  }
  if(typeof value==='number') {
    if(amounts.has(key) && (value<0 || value>1e12))invalid(path,'valor fora do limite');
    if(key==='discountPercentage' && (value<0||value>100))invalid(path,'percentual deve estar entre 0 e 100');
    if(key==='toothNumber' && (!Number.isInteger(value)||!/^([1-4][1-8]|[5-8][1-5])$/.test(String(value))))invalid(path,'número de dente inválido');
    if(key==='installments' && (!Number.isInteger(value)||value<1||value>1200))invalid(path,'quantidade de parcelas inválida');
  }
}
function check(value:unknown,s:Schema,path:string,patientId:string):void {
  if(s.kind==='ref')return check(value,definitions[s.name!],path,patientId);
  if(s.kind==='json')return; // Bounded JSON checked once by the global traversal below.
  if(s.kind==='union') {
    for(const option of s.options!){try{check(value,option,path,patientId);return;}catch(e){if(!(e instanceof AccessError))throw e;}}
    invalid(path,'valor não permitido');
  }
  if(s.kind==='literal'){if(value!==s.value)invalid(path,'valor não permitido');return;}
  if(['string','number','boolean'].includes(s.kind)) {
    if(typeof value!==s.kind || (typeof value==='number'&&!Number.isFinite(value)))invalid(path,`esperado ${s.kind}`);
    return;
  }
  if(s.kind==='array') {
    if(!Array.isArray(value))invalid(path,'esperada lista');
    const ids=new Set<string>();
    value.forEach((v,i)=>{
      check(v,s.item!,`${path}[${i}]`,patientId);
      if(object(v)&&typeof v.id==='string'){if(ids.has(v.id))invalid(path,'identificadores duplicados');ids.add(v.id);}
    });return;
  }
  if(!object(value))invalid(path,'esperado objeto preenchido');
  if(s.kind==='record') {
    for(const [key,v]of Object.entries(value)){check(key,s.key!,path,patientId);check(v,s.value as Schema,`${path}.${key}`,patientId);}return;
  }
  if(s.kind!=='object')throw Error('Invalid clinical contract');
  for(const key of s.required!)if(!Object.hasOwn(value,key))invalid(`${path}.${key}`,'campo obrigatório ausente');
  for(const [key,v]of Object.entries(value)){
    if(!Object.hasOwn(s.properties!,key))invalid(path,'campo não reconhecido pelo contrato clínico');
    check(v,s.properties![key],`${path}.${key}`,patientId);
    semantic(v,key,`${path}.${key}`,!s.required!.includes(key),patientId);
  }
}
export function validateClinicalStructure(input:Record<string,unknown>,patientId:string) {
  let nodes=0,bytes=0;
  function bounded(value:unknown,depth=0):void {
    if(++nodes>MAX_NODES||depth>20)invalid('prontuário','estrutura excede os limites');
    if(typeof value==='string')bytes+=Buffer.byteLength(value,'utf8');
    else if(Array.isArray(value)){if(value.length>10000)invalid('prontuário','lista excede 10000 registros');for(const v of value)bounded(v,depth+1);}
    else if(object(value)){
      const entries=Object.entries(value);if(entries.length>1000)invalid('prontuário','objeto excede 1000 campos');
      for(const [k,v]of entries){if(!safeKey(k))invalid('prontuário','chave inválida');bytes+=Buffer.byteLength(k);bounded(v,depth+1);}
    }else if(value!==null && typeof value!=='boolean' && !(typeof value==='number'&&Number.isFinite(value)))invalid('prontuário','conteúdo não é JSON válido');
    if(bytes>MAX_BYTES)invalid('prontuário','conteúdo excede 24 MB');
  }
  bounded(input);
  for(const [key,value]of Object.entries(input)){
    const model=(contract.roots as Record<string,string>)[key];
    if(!model)invalid('prontuário','recurso desconhecido');
    if(key==='dentispro_clinical_exams_v2'){
      for(const [id,exam]of Object.entries(value as Record<string,unknown>))check(exam,{kind:'ref',name:model},`${key}.${id}`,patientId);
    }else if(['dentispro_odontograms_v2','dentispro_odontogram_snapshots_v2'].includes(key)){
      for(const [id,rows]of Object.entries(value as Record<string,unknown>))check(rows,{kind:'array',item:{kind:'ref',name:model}},`${key}.${id}`,patientId);
    }else check(value,{kind:'array',item:{kind:'ref',name:model}},key,patientId);
  }
}
