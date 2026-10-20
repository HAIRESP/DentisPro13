import type { ClinicalExam, ToothCondition } from '../types';
export type ClinicalPanel = 'odontogram' | 'pain' | 'extraoral' | 'intraoral' | 'medical';
export const panelTitles: Record<ClinicalPanel, string> = { medical: 'Prontuário Médico', odontogram: 'Odontograma', pain: 'Exame de Urgência e Dor', extraoral: 'Exame Extraoral', intraoral: 'Exame Intraoral' };
export const localExamDate = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };
export function validateExamDate(date: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(Date.parse(`${date}T12:00:00Z`)) || new Date(`${date}T12:00:00Z`).toISOString().slice(0,10) !== date) throw Error('Informe uma data válida para o exame.');
}
const labels: Record<string,string> = { vitalSigns:'Sinais vitais', temperature:'Temperatura corpórea (°C)', bloodPressure:'Pressão arterial (mmHg)', heartRate:'Batimentos cardíacos (bpm)', oxygenSaturation:'Oximetria (%)', faceSymmetry:'Simetria facial', neckLymphNodes:'Linfonodos', atmJoints:'ATM', lipsAndProfile:'Lábios e perfil', skinObservations:'Pele', andropauseOrHormonalObs:'Fatores hormonais', substanceUsageObs:'Uso de substâncias', buccalMucosa:'Mucosa jugal', tongueAndFloor:'Língua e assoalho', palateHardSoft:'Palato', gingivaPeriodontum:'Gengiva e periodonto', alveolarRidge:'Crista alveolar', oropharynx:'Orofaringe', smokingOralImpact:'Impacto do tabagismo', substanceOralImpact:'Impacto de substâncias', notes:'Observações', generalNotes:'Parecer clínico', chiefComplaint:'Queixa principal', examType:'Tipo de exame', painCharacteristics:'Características da dor', swelling:'Edema', hda:'História da doença atual', affectedArea:'Área afetada', diagnostico:'Diagnóstico', tratamentoUrgenciaProposto:'Tratamento proposto', tratamentoExecutado:'Tratamento executado', toothSummaries:'Avaliação por dente', toothNumber:'Dente', wholeToothCondition:'Condição do dente', surfaces:'Faces', hasCalculoSupra:'Cálculo supragengival', hasCalculoSub:'Cálculo subgengival', isGirovertido:'Giroversão', isDeciduous:'Dente decíduo', supplementary:'Exames complementares' };
export function panelSummary(data: unknown, prefix=''): string {
  if (Array.isArray(data)) return data.map((v,i)=>panelSummary(v,`${prefix} ${i+1}`)).filter(Boolean).join('\n');
  if (data && typeof data==='object') return Object.entries(data).filter(([k])=>!['images','id','patientId','updatedAt','examDate'].includes(k)).map(([k,v])=>panelSummary(v,`${prefix ? prefix+' / ' : ''}${labels[k] || k.replace(/([a-z])([A-Z])/g,'$1 $2')}`)).filter(Boolean).join('\n');
  if (data===undefined || data===null || data==='') return '';
  return `${prefix}: ${typeof data==='boolean' ? (data?'Sim':'Não') : String(data).replace(/_/g,' ')}`;
}
export function panelData(panel: ClinicalPanel, exam: ClinicalExam, teeth: ToothCondition[]) {
  if(panel==='medical') return {};
  if(panel==='odontogram') return { vitalSigns: exam.odontogramVitalSigns, dentes: teeth };
  if(panel==='pain') return exam.painExam || {};
  return { ...exam[panel], generalNotes:exam.generalNotes };
}
// Write all values before publishing React state. Roll back any partial write on quota/errors.
export function persistClinicalSave(storage: Pick<Storage,'getItem'|'setItem'|'removeItem'>, entries: [string,string][]) {
  const before=entries.map(([key])=>[key,storage.getItem(key)] as const);
  let written=0;
  try { for(const [key,value] of entries) { storage.setItem(key,value); written++; } }
  catch(error) {
    try { for(let i=written-1;i>=0;i--) { const [key,value]=before[i]; if(value===null) storage.removeItem(key); else storage.setItem(key,value); } }
    catch { throw Error('Falha ao restaurar o armazenamento anterior. Preserve esta sessão e restaure o backup antes de continuar.'); }
    throw error;
  }
}
