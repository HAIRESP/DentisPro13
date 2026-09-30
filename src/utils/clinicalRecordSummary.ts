import type { ClinicalExam } from '../types';

/** Report only observations actually recorded; an empty exam is not a normal exam. */
export function summarizeClinicalExam(exam?: ClinicalExam | null): string {
  if (!exam) return 'Exame clínico não registrado.';
  const observations: [string, string | undefined][] = [
    ['Simetria facial', exam.extraoral?.faceSymmetry],
    ['Linfonodos', exam.extraoral?.neckLymphNodes],
    ['ATM', exam.extraoral?.atmJoints],
    ['Lábios e perfil', exam.extraoral?.lipsAndProfile],
    ['Observações extraorais', exam.extraoral?.notes],
    ['Mucosa bucal', exam.intraoral?.buccalMucosa],
    ['Língua e assoalho', exam.intraoral?.tongueAndFloor],
    ['Palato', exam.intraoral?.palateHardSoft],
    ['Gengiva e periodonto', exam.intraoral?.gingivaPeriodontum],
    ['Rebordo alveolar', exam.intraoral?.alveolarRidge],
    ['Orofaringe', exam.intraoral?.oropharynx],
    ['Observações intraorais', exam.intraoral?.notes],
    ['Observações gerais', exam.generalNotes],
  ];
  return observations.filter(([, value]) => value?.trim())
    .map(([label, value]) => `${label}: ${value!.trim()}`).join('\n')
    || 'Exame sem observações clínicas registradas.';
}

/** Fill UI structure only. Never infer medical answers or demographic values. */
export function normalizePatientRecord(patient: import('../types').Patient): import('../types').Patient {
  return {
    ...patient,
    name: patient.name ?? '', cpf: patient.cpf ?? '', phone: patient.phone ?? '',
    email: patient.email ?? '', birthDate: patient.birthDate ?? '', gender: patient.gender ?? '',
    address: {street:'', number:'', neighborhood:'', city:'', state:'', cep:'', ...patient.address},
    anamnesis: {...patient.anamnesis},
  };
}
