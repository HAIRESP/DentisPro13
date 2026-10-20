import type {UserProfile} from '../lib/authProfile';
export function authorship(user: Pick<UserProfile,'uid'|'name'|'professionalId'> | null, at = new Date().toISOString()) {
  if (!user?.uid) throw new Error('Entre novamente para registrar a alteração.');
  return {accountUid:user.uid, professionalId:user.professionalId || '', professionalName:user.name, at};
}
export function appendLocalAudit(storage: Pick<Storage,'getItem'|'setItem'>, actor: ReturnType<typeof authorship>, action:string, targetId:string) {
  const key='dentispro_activity_audit_v1';
  const records=JSON.parse(storage.getItem(key) || '[]');
  if(!Array.isArray(records))throw new Error('Registro de atividades inválido.');
  storage.setItem(key,JSON.stringify([...records,{id:crypto.randomUUID(),...actor,action,targetId}]));
}

export function detachDocumentFiles<T extends {id:string;files?:Array<{id:string;sourceDocumentId:string}>}>(patients:T[], doc:{id:string;patientId?:string;patientFileId?:string}) {
 const linkedFiles:unknown[]=[];
 const nextPatients=patients.map(patient=>{
  if(!doc.patientId || patient.id!==doc.patientId)return patient;
  const files=(patient.files || []).filter(file=>{const linked=file.sourceDocumentId===doc.id || file.id===doc.patientFileId;if(linked)linkedFiles.push(file);return !linked;});
  return linkedFiles.length ? {...patient,files} : patient;
 });
 return {nextPatients,linkedFiles};
}
