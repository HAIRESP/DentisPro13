import type { Anamnesis } from '../types';

// Same conditions as the medical-history checkbox group.
export const medicalConditionAlerts: ReadonlyArray<{
  key: keyof Anamnesis;
  label: string;
  detailsKey?: keyof Anamnesis;
}> = [
  { key: 'hasHeartDisease', label: 'Doença Cardíaca / Infarto' },
  { key: 'hasRheumaticFever', label: 'Febre Reumática' },
  { key: 'hasAsthma', label: 'Asma / Bronquite' },
  { key: 'hasArthritis', label: 'Artrite / Reumatismo' },
  { key: 'hasFaintingSpells', label: 'Desmaios / Síncope' },
  { key: 'hasSinusitis', label: 'Sinusite Frequente' },
  { key: 'hasHepatitis', label: 'Hepatite (A, B, C)' },
  { key: 'hasOtherInfections', label: 'Outras Infecções', detailsKey: 'otherInfectionsDetails' },
  { key: 'hasHypertension', label: 'Hipertensão Arterial' },
  { key: 'hasDiabetes', label: 'Diabetes' },
  { key: 'hasAllergies', label: 'Alergias Medicamentosas', detailsKey: 'allergyDetails' },
  { key: 'bleedingDisorder', label: 'Distúrbio de Coagulação' },
  { key: 'usesAnticoagulants', label: 'Usa Anticoagulantes' },
  { key: 'usesBisphosphonates', label: 'Bisfosfonatos' },
  { key: 'hasCancerHistory', label: 'Câncer / Quimioterapia' },
  { key: 'hasPacemaker', label: 'Marca-passo / prótese cardíaca' },
  { key: 'hasShortnessOfBreath', label: 'Falta de ar relatada' },
  { key: 'hasRespiratoryDisease', label: 'Doença respiratória' },
  { key: 'hasRenalOrHepatic', label: 'Doença renal / hepática' },
  { key: 'hasThyroidDisorder', label: 'Alteração da tireoide' },
  { key: 'hasSeizures', label: 'Convulsões / condição neurológica relatada' },
  { key: 'hasRadiationTherapyFaceJaw', label: 'Radioterapia na face / maxilares' },
  { key: 'hasFaceJawTrauma', label: 'Trauma na face / maxilares', detailsKey: 'faceJawTraumaDetails' },
  { key: 'hasAdverseDentalReaction', label: 'Reação ao tratamento dentário', detailsKey: 'adverseDentalReactionDetails' },
  { key: 'hasAnesthesiaReaction', label: 'Reação anestésica', detailsKey: 'anesthesiaReactionDetails' },
  { key: 'hasOtherUnlistedDiseases', label: 'Outras doenças relatadas', detailsKey: 'otherUnlistedDiseasesDetails' },
  { key: 'hasHadSurgery', label: 'Cirurgias / Internações', detailsKey: 'surgeryDetails' },
];

export function getMedicalConditionAlerts(anamnesis?: Partial<Anamnesis>) {
  return medicalConditionAlerts
    .filter(({ key }) => anamnesis?.[key] === true)
    .map(({ key, label, detailsKey }) => {
      const details = detailsKey ? anamnesis?.[detailsKey] : undefined;
      return { key, label: typeof details === 'string' && details.trim() ? `${label}: ${details.trim()}` : label };
    });
}
