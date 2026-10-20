import type {Patient, ClinicalExam, ExamVitalSigns} from '../types';
const labels: Array<[keyof ExamVitalSigns,string,string]>=[['bloodPressure','Pressão arterial','mmHg'],['heartRate','Frequência cardíaca','bpm'],['temperature','Temperatura','°C'],['oxygenSaturation','Oximetria','%']];
export function reportVitalSigns(patient: Partial<Patient> | null, exam: ClinicalExam | null) {
 const sources=[
  {source:'Prontuário médico',date:patient?.medicalExamDate,values:patient?.medicalVitalSigns},
  {source:'Odontograma',date:exam?.odontogramExamDate || exam?.odontogramDate,values:exam?.odontogramVitalSigns},
  {source:'Exame extraoral',date:exam?.extraoral?.examDate,values:exam?.extraoral?.vitalSigns},
  {source:'Exame intraoral',date:exam?.intraoral?.examDate,values:exam?.intraoral?.vitalSigns},
  {source:'Urgência e dor',date:exam?.painExam?.examDate,values:exam?.painExam?.vitalSigns}
 ];
 const extra=exam?.extraoral;
 return sources.map(item=>{
  const values={...item.values};
  let glucose: number | undefined;
  if(item.source==='Exame extraoral' && extra){
   values.heartRate ??= extra.heartRateBpm?.toString();
   values.temperature ??= extra.bodyTemperatureCelsius?.toString();
   values.oxygenSaturation ??= extra.oxygenSaturationPercent?.toString();
   if(values.bloodPressure == null && extra.bloodPressureSystolic != null && extra.bloodPressureDiastolic != null) values.bloodPressure=`${extra.bloodPressureSystolic}/${extra.bloodPressureDiastolic}`;
   glucose=extra.capillaryGlucoseMgDl;
  }
  const readings=labels.map(([key,label,unit])=>({label,unit,value:values[key] ?? ''}));
  readings.push({label:'Glicemia capilar',unit:'mg/dL',value:glucose?.toString() ?? ''});
  return {source:item.source,date:item.date || '',time:values.examTime || '',readings};
 }).filter(item=>item.readings.some(r=>r.value!==''));
}
