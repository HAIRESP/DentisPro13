import type { ClinicalExam } from '../types';

// Relatórios usam apenas dados salvos, sem preencher achados clínicos ausentes.
export function getRecordedExamReport(exam?: ClinicalExam | null) {
  const join = (values: Array<string | undefined>) => values
    .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
    .map(value => value.trim()).join(' • ');
  const intraoral = exam?.intraoral;
  const extraoral = exam?.extraoral;
  const softTissues = join([
    intraoral?.buccalMucosa, intraoral?.tongueAndFloor,
    intraoral?.palateHardSoft, intraoral?.oropharynx, extraoral?.lipsAndProfile
  ]) || 'Não registrado.';
  const periodontal = intraoral?.gingivaPeriodontum?.trim() || 'Não registrado.';
  const observations = join([extraoral?.notes, intraoral?.notes, exam?.generalNotes]) || 'Não registrado.';
  const summary = exam
    ? `Tecidos moles: ${softTissues} Gengiva / Periodonto: ${periodontal} Observações: ${observations}`
    : 'Exame clínico não registrado.';
  return { softTissues, periodontal, observations, summary };
}
