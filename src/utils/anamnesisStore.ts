import type { Anamnesis, Patient, PatientFile, SavedClinicDocument } from '../types';
import { STORAGE_KEYS } from './storageKeys.ts';

export function commitAnamnesis(storage: Pick<Storage,'getItem'|'setItem'|'removeItem'>,
  patients: Patient[], documents: SavedClinicDocument[], patientId:string,
  expected:Anamnesis | undefined, anamnesis:Anamnesis, document:SavedClinicDocument, file?:PatientFile) {
  const oldPatients=storage.getItem(STORAGE_KEYS.PATIENTS);
  const oldDocuments=storage.getItem(STORAGE_KEYS.SAVED_DOCUMENTS);
  const current:Patient[]=oldPatients===null ? patients : JSON.parse(oldPatients);
  const currentDocs:SavedClinicDocument[]=oldDocuments===null ? documents : JSON.parse(oldDocuments);
  if(!Array.isArray(current)||!Array.isArray(currentDocs))throw Error('Dados locais inválidos. Não foi possível salvar o prontuário.');
  const patient=current.find(p=>p.id===patientId);
  if(!patient)throw Error('Paciente não encontrado.');
  if(JSON.stringify(patient.anamnesis)!==JSON.stringify(expected))throw Error('O prontuário mudou em outra tela. Reabra antes de salvar.');
  if(file && (file.sourceDocumentId!==document.id || document.patientId!==patientId || !file.fileUrl.startsWith('data:application/pdf')))throw Error('O PDF não corresponde ao prontuário deste paciente.');
  const nextPatients=current.map(p=>p.id!==patientId?p:{...p,anamnesis,...(file ? {files:[file,...(p.files || [])]} : {}),gender:anamnesis.gender||p.gender,
    ethnicity:anamnesis.ethnicity||p.ethnicity,profession:anamnesis.profession||p.profession});
  const nextDocuments=[document,...currentDocs];
  const patientsJson=JSON.stringify(nextPatients), docsJson=JSON.stringify(nextDocuments);
  try{
    storage.setItem(STORAGE_KEYS.PATIENTS,patientsJson);
    storage.setItem(STORAGE_KEYS.SAVED_DOCUMENTS,docsJson);
  }catch(error){
    try{
      if(oldPatients===null)storage.removeItem(STORAGE_KEYS.PATIENTS);else storage.setItem(STORAGE_KEYS.PATIENTS,oldPatients);
      if(oldDocuments===null)storage.removeItem(STORAGE_KEYS.SAVED_DOCUMENTS);else storage.setItem(STORAGE_KEYS.SAVED_DOCUMENTS,oldDocuments);
    }catch{throw Error('Falha ao salvar e restaurar os dados locais. Preserve o backup e não faça novas alterações.');}
    throw Error('Não foi possível salvar o prontuário e seu arquivo. Verifique o espaço de armazenamento.');
  }
  return {patients:nextPatients,documents:nextDocuments};
}
