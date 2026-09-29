import {isDeepStrictEqual} from 'node:util';
import {type Actor, requireThat} from './policy';

type Row = Record<string, any>;
export type ClinicalIdentity = {uid:string; name:string; cro:string};
export function clinicalIdentity(actor:Actor, profile:Row|null):ClinicalIdentity {
  requireThat(profile?.uid===actor.uid,409,'Cadastre o perfil profissional vinculado à sua conta antes de salvar registros clínicos.');
  const raw=typeof profile.cro==='string'?profile.cro.trim():'';
  const match=/^(?:CRO\/)?([A-Z]{2})[\s/-]+(\d{1,8})$/.exec(raw);
  requireThat(match && actor.name.trim(),409,'Cadastre o CRO com UF no perfil profissional da sua conta (exemplo: CRO/CE 12345).');
  return {uid:actor.uid,name:actor.name.trim(),cro:`CRO/${match[1]} ${match[2]}`};
}
const finalKeys=new Set(['dentispro_prescriptions_v2','dentispro_evolutions_v2','dentispro_saved_documents_v2','dentispro_odontogram_snapshots_v2']);
const mapKeys=new Set(['dentispro_odontograms_v2','dentispro_odontogram_snapshots_v2','dentispro_clinical_exams_v2']);
function rows(workspace:Row,key:string):Row[] {
 const value=workspace[key];
 if(!value)return [];
 if(key==='dentispro_clinical_exams_v2')return Object.values(value);
 if(mapKeys.has(key))return Object.values(value).flat() as Row[];
 return value;
}
function recordId(row:Row){return row.id ?? row.patientId ?? row.toothNumber;}

/** Stamp records only after structural validation. Never trust client authorship. */
export function applyClinicalAuthorship(workspace:Row, previous:Row|undefined, identity:ClinicalIdentity, now:number) {
 const result=structuredClone(workspace),at=new Date(now).toISOString();
 for(const key of Object.keys(previous||{})){
  if(!finalKeys.has(key))continue;
  const submitted=rows(result,key);
  for(const old of rows(previous!,key)){
   const current=submitted.find(r=>recordId(r)===recordId(old));
   requireThat(current && isDeepStrictEqual(current,old),409,'Registro clínico finalizado: preserve o original e registre um novo documento ou complemento.');
  }
 }
 for(const key of Object.keys(result))for(const row of rows(result,key)){
  const old=previous && rows(previous,key).find(r=>recordId(r)===recordId(row));
  if(old && isDeepStrictEqual(row,old))continue;
  if(old) requireThat(isDeepStrictEqual(row.provenance,old.provenance),409,'A autoria original não pode ser alterada pelo navegador.');
  else requireThat(!row.provenance,400,'A autoria de novos registros é atribuída exclusivamente pelo servidor.');
  const original=old?.provenance || (old ? {source:'legacy_unverified',authorUid:'',authorName:'',authorCro:'',recordedAt:'',importedBy:'',importedAt:''} : {source:'server',authorUid:identity.uid,authorName:identity.name,authorCro:identity.cro,recordedAt:at,importedBy:'',importedAt:''});
  row.provenance={...original,lastModifiedBy:identity.uid,lastModifiedName:identity.name,lastModifiedCro:identity.cro,lastModifiedAt:at};
  if('dentistName' in row)row.dentistName=identity.name;
  if('professionalName' in row)row.professionalName=identity.name;
  if('dentistCro' in row)row.dentistCro=identity.cro;
  if(key==='dentispro_evolutions_v2'){row.authorUid=identity.uid;row.recordedAt=at;}
  // Opaque rendered HTML cannot attest the authenticated professional.
  if(key==='dentispro_saved_documents_v2'){
   requireThat(!row.htmlSnapshot,400,'Salve o documento estruturado; HTML fornecido pelo navegador não comprova autoria.');
   if(row.templateData){
    for(const field of ['dentistName','professionalName','effectiveDentistName','mainSurgeon'])if(field in row.templateData)row.templateData[field]=identity.name;
    for(const field of ['dentistCro','professionalCro','effectiveDentistCro','cro'])if(field in row.templateData)row.templateData[field]=identity.cro;
    for(const field of ['signatureImageUrl','stampImageUrl'])requireThat(!row.templateData[field],400,'Assinatura enviada no conteúdo do documento não é uma autoria verificada.');
   }
  }
 }
 return result;
}

/** Imported records retain their declared historical content, never a verified author. */
export function markImportedAuthorship(workspace:Row, actor:Actor, now:number) {
 const result=structuredClone(workspace),at=new Date(now).toISOString();
 for(const key of Object.keys(result))for(const row of rows(result,key)){
  row.provenance={source:'legacy_unverified',authorUid:'',authorName:'',authorCro:'',recordedAt:'',importedBy:actor.uid,importedAt:at,lastModifiedBy:actor.uid,lastModifiedName:actor.name,lastModifiedCro:'',lastModifiedAt:at};
 }
 return result;
}
