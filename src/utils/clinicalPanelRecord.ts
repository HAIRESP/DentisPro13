import type { ClinicalPanelKind, ClinicalEvolutionEntry, Patient, PatientFile, ClinicalExam, OdontogramSnapshot } from '../types/index.ts';
import {STORAGE_KEYS} from './storageKeys.ts';
export const panelTitles:Record<ClinicalPanelKind,string>={pain:'Ficha Diagnóstica e Avaliação de Dor',extraoral:'Exame Extraoral',intraoral:'Exame Intraoral',odontogram:'Odontograma Interativo'};
export function localExamDate(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
export function examDateValue(value:string){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(value))throw Error('Informe uma data válida para este exame.');
 const d=new Date(value+'T12:00:00');if(isNaN(d.getTime())||d.getFullYear()!==Number(value.slice(0,4))||d.getMonth()+1!==Number(value.slice(5,7))||d.getDate()!==Number(value.slice(8,10)))throw Error('Data do exame inválida.');return d;
}
const labels:Record<string,string>={
 faceSymmetry:'Simetria facial',neckLymphNodes:'Linfonodos',atmJoints:'ATM',lipsAndProfile:'Lábios e perfil',skinObservations:'Pele',andropauseOrHormonalObs:'Observações hormonais',substanceUsageObs:'Observação anterior de substâncias',heartRateBpm:'Frequência cardíaca (BPM)',bloodPressureSystolic:'Pressão sistólica (mmHg)',bloodPressureDiastolic:'Pressão diastólica (mmHg)',bodyTemperatureCelsius:'Temperatura corpórea (°C)',oxygenSaturationPercent:'Oximetria SpO₂ (%)',capillaryGlucoseMgDl:'Glicemia capilar (mg/dL)',buccalMucosa:'Mucosa bucal',tongueAndFloor:'Língua e assoalho',palateHardSoft:'Palato duro e mole',gingivaPeriodontum:'Gengiva e periodonto',alveolarRidge:'Rebordo alveolar',oropharynx:'Orofaringe',smokingOralImpact:'Impacto oral do tabagismo',substanceOralImpact:'Impacto oral das substâncias',notes:'Observações',generalNotes:'Observações gerais',examType:'Tipo do exame',chiefComplaint:'Queixa principal',painCharacteristics:'Características da dor',swelling:'Edema',hda:'História da doença atual',affectedArea:'Área afetada',supplementary:'Exames complementares',toothSummaries:'Avaliação por dente',diagnostico:'Diagnóstico',tratamentoUrgenciaProposto:'Tratamento de urgência proposto',tratamentoExecutado:'Tratamento executado',provocada:'Provocada',espontanea:'Espontânea',intermitente:'Intermitente',intensa:'Intensa',moderada:'Moderada',precipitadaFrio:'Precipitada pelo frio',precipitadaCalor:'Precipitada pelo calor',precipitadaMastigacao:'Precipitada pela mastigação',localizacao:'Localização',duracao:'Duração',consistencia:'Consistência',inspecaoSign:'Inspeção — sinal',inspecaoNotes:'Inspeção — observações',percussaoSign:'Percussão — sinal',percussaoNotes:'Percussão — observações',palpacaoSign:'Palpação — sinal',palpacaoNotes:'Palpação — observações',mobilidadeClasse:'Classe de mobilidade',mobilidadeNotes:'Mobilidade — observações',outrosAchados:'Outros achados',radiografia:'Radiografia',outrosSolicitados:'Outros exames solicitados',toothNumber:'Dente',calor:'Calor',frio:'Frio',sensibilidadePulpar:'Sensibilidade pulpar',percussao:'Percussão',palpacao:'Palpação',mobilidade:'Mobilidade',bolsaV:'Bolsa vestibular',bolsaM:'Bolsa mesial',bolsaD:'Bolsa distal',bolsaL:'Bolsa lingual/palatina',bolsaProfundidade:'Profundidade de bolsa',fratura:'Fratura',carie:'Cárie',fistula:'Fístula',wholeToothCondition:'Condição do dente',surfaces:'Faces',isGirovertido:'Giroversão',hasCalculoSupra:'Cálculo supragengival',hasCalculoSub:'Cálculo subgengival',isDeciduous:'Dente decíduo',mesial:'Mesial',distal:'Distal',oclusal:'Oclusal',incisal:'Incisal',vestibular:'Vestibular',lingual:'Lingual',palatina:'Palatina',conditions:'Condições',title:'Título'};
const values:Record<string,string>={sio:'Sem alteração registrada',carie:'Cárie',restauracao:'Restauração satisfatória',restauracao_insatisfatoria:'Restauração insatisfatória',canal:'Endodontia insatisfatória',endodontia_insatisfatoria:'Endodontia insatisfatória',endodontia_satisfatoria:'Endodontia satisfatória',necessidade_endodontica:'Necessidade endodôntica',ausente:'Ausente/extraído',implante:'Implante',protese:'Prótese/coroa',extracao_indicada:'Extração indicada',girovertido:'Girovertido',calculo_supragengival:'Cálculo supragengival',calculo_subgengival:'Cálculo subgengival',urgencia:'Urgência',rotina:'Rotina'};
export function clinicalPanelRows(panel:ClinicalPanelKind,data:unknown){
 const rows:Array<{section:string;label:string;answer:string}>=[];
 const visit=(value:unknown,label:string,section:string)=>{
  if(Array.isArray(value)){if(!value.length){rows.push({section,label,answer:'Nenhum registro.'});return;}value.forEach((v,i)=>visit(v,`${label} ${i+1}`,section));return;}
  if(value && typeof value==='object'){
   const obj=value as Record<string,unknown>;const name=obj.toothNumber?`Dente ${obj.toothNumber}`:label;
   for(const [k,v] of Object.entries(obj)){
    if(['id','patientId','createdAt','updatedAt','examDate'].includes(k))continue;
    if(k==='images'){rows.push({section,label:'Fotos e radiografias vinculadas',answer:String(Array.isArray(v)?v.length:0)});continue;}
    visit(v,labels[k]||k.replace(/([A-Z])/g,' $1'),name || section);
   }return;
  }
  const answer=typeof value==='boolean'?(value?'Sim':'Não'):value===null||value===undefined||value===''?'Não informado':values[String(value)]||String(value);
  rows.push({section,label,answer});
 };
 visit(data,panelTitles[panel],panelTitles[panel]);return rows;
}
export function commitClinicalPanel(storage:Pick<Storage,'getItem'|'setItem'|'removeItem'>,fallback:{patients:Patient[];exams:Record<string,ClinicalExam>;evolutions:ClinicalEvolutionEntry[];snapshots:Record<string,OdontogramSnapshot[]>},input:{patientId:string;panel:ClinicalPanelKind;date:string;data:any;evolution:ClinicalEvolutionEntry;file:PatientFile;snapshot?:OdontogramSnapshot}){
 examDateValue(input.date);
 const keys=[STORAGE_KEYS.PATIENTS,STORAGE_KEYS.CLINICAL_EXAMS,STORAGE_KEYS.EVOLUTIONS,STORAGE_KEYS.ODONTOGRAM_SNAPSHOTS];
 const originals=keys.map(k=>storage.getItem(k));
 const patients:Patient[]=originals[0]===null?fallback.patients:JSON.parse(originals[0]);
 const exams:Record<string,ClinicalExam>=originals[1]===null?fallback.exams:JSON.parse(originals[1]);
 const evolutions:ClinicalEvolutionEntry[]=originals[2]===null?fallback.evolutions:JSON.parse(originals[2]);
 const snapshots:Record<string,OdontogramSnapshot[]>=originals[3]===null?fallback.snapshots:JSON.parse(originals[3]);
 if(!Array.isArray(patients)||!Array.isArray(evolutions)||!exams||typeof exams!=='object'||Array.isArray(exams)||!snapshots||typeof snapshots!=='object'||Array.isArray(snapshots))throw Error('Dados locais inválidos. O exame não foi arquivado.');
 if(!patients.some(p=>p.id===input.patientId)||input.evolution.patientId!==input.patientId||input.evolution.date!==input.date||input.file.sourceEvolutionId!==input.evolution.id||!input.file.fileUrl.startsWith('data:application/pdf'))throw Error('Paciente ou PDF do exame inválido.');
 if(input.snapshot && (input.snapshot.patientId!==input.patientId || input.snapshot.date!==input.date))throw Error('A versão do odontograma não corresponde ao exame.');
 const previous=exams[input.patientId]||{patientId:input.patientId,extraoral:{},intraoral:{},updatedAt:input.evolution.savedAt};
 const nextExam={...previous,updatedAt:input.evolution.savedAt};
 if(input.panel==='pain')nextExam.painExam={...input.data,examDate:input.date};
 else if(input.panel==='odontogram')nextExam.odontogramExamDate=input.date;
 else{const {generalNotes,...panelData}=input.data;nextExam[input.panel]={...previous[input.panel],...panelData,examDate:input.date};if(typeof generalNotes==='string')nextExam.generalNotes=generalNotes;}
 const next={patients:patients.map(p=>p.id===input.patientId?{...p,files:[input.file,...(p.files||[])]}:p),exams:{...exams,[input.patientId]:nextExam},evolutions:[input.evolution,...evolutions],snapshots:input.snapshot?{...snapshots,[input.patientId]:[input.snapshot,...(snapshots[input.patientId]||[])]}:snapshots};
 const json=[next.patients,next.exams,next.evolutions,next.snapshots].map(v=>JSON.stringify(v));
 try{keys.forEach((k,i)=>storage.setItem(k,json[i]));}catch{
  try{keys.forEach((k,i)=>originals[i]===null?storage.removeItem(k):storage.setItem(k,originals[i]!));}catch{throw Error('Falha ao salvar e restaurar os dados. Preserve seu backup antes de continuar.');}
  throw Error('Não foi possível arquivar o exame, a evolução e o PDF. Verifique o espaço de armazenamento.');
 }
 return next;
}
