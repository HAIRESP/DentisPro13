import type { TreatmentPlan, TreatmentPlanItem, TUSSProcedure } from '../types/index';

export interface ProcedureConsentContent {
  professionalDescription?: string;
  patientDescription?: string;
  risks?: string;
  benefits?: string;
}
export interface TcleProcedure extends ProcedureConsentContent {
  itemId: string;
  name: string;
  code: string;
  region: string;
  technicalDescription: string;
  value: number;
}
export function proceduresForConsent(plan: TreatmentPlan, catalog: TUSSProcedure[]): TcleProcedure[] {
  if (plan.status === 'cancelado' || plan.status === 'concluido') return [];
  return plan.items.filter(i => i.selectedForPlan !== false && i.status !== 'concluido').map(i => {
    const base = catalog.find(p => p.code === i.tussCode);
    return {
      itemId: i.id, name: i.procedureName, code: i.tussCode || '',
      region: [i.toothNumber ? `Dente ${i.toothNumber}` : '', i.toothSurface, i.regionDescription || i.regionCode].filter(Boolean).join(' — '),
      technicalDescription: i.fullProcedureDetails ?? base?.fullDescription ?? '',
      professionalDescription: i.professionalDescription ?? base?.professionalDescription ?? '',
      patientDescription: i.patientDescription ?? base?.patientDescription ?? '',
      risks: i.risks ?? base?.risks ?? '', benefits: i.benefits ?? base?.benefits ?? '', value: i.finalCost
    };
  });
}
export function consentContent(p: TcleProcedure): ProcedureConsentContent {
  return {professionalDescription:p.professionalDescription, patientDescription:p.patientDescription, risks:p.risks, benefits:p.benefits};
}
export function applyConsentContent(item: TreatmentPlanItem, p: TcleProcedure): TreatmentPlanItem {
  return {...item, ...consentContent(p), fullProcedureDetails:p.technicalDescription};
}
