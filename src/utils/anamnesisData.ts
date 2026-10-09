import type { Anamnesis } from '../types';

export const anamnesisFields: ReadonlyArray<{key: keyof Anamnesis; label: string; section: string}> = [
  {
    "key": "gender",
    "label": "Gênero",
    "section": "1. Identificação e Dados Demográficos (Vigilância & Suscetibilidade)"
  },
  {
    "key": "ageAndBiologicalSexNotes",
    "label": "Observações sobre suscetibilidade por idade e sexo biológico",
    "section": "1. Identificação e Dados Demográficos (Vigilância & Suscetibilidade)"
  },
  {
    "key": "ethnicity",
    "label": "Raça/cor autodeclarada",
    "section": "1. Identificação e Dados Demográficos (Vigilância & Suscetibilidade)"
  },
  {
    "key": "ethnicityDetails",
    "label": "Detalhes sobre raça/cor",
    "section": "1. Identificação e Dados Demográficos (Vigilância & Suscetibilidade)"
  },
  {
    "key": "profession",
    "label": "Profissão/Ocupação",
    "section": "1. Identificação e Dados Demográficos (Vigilância & Suscetibilidade)"
  },
  {
    "key": "occupationalRisks",
    "label": "Riscos ocupacionais",
    "section": "1. Identificação e Dados Demográficos (Vigilância & Suscetibilidade)"
  },
  {
    "key": "currentResidence",
    "label": "Local de residência atual",
    "section": "1. Identificação e Dados Demográficos (Vigilância & Suscetibilidade)"
  },
  {
    "key": "previousResidence",
    "label": "Residência anterior",
    "section": "1. Identificação e Dados Demográficos (Vigilância & Suscetibilidade)"
  },
  {
    "key": "endemicAreaExposure",
    "label": "Exposição a áreas endêmicas",
    "section": "1. Identificação e Dados Demográficos (Vigilância & Suscetibilidade)"
  },
  {
    "key": "vaccinationStatus",
    "label": "Status vacinal: Registro de vacinas ao longo da vida",
    "section": "2. Histórico Clínico e Imunológico"
  },
  {
    "key": "vaccinationDetails",
    "label": "Vacinas informadas",
    "section": "2. Histórico Clínico e Imunológico"
  },
  {
    "key": "hasVaccinationUpToDate",
    "label": "Vacinação em dia?",
    "section": "2. Histórico Clínico e Imunológico"
  },
  {
    "key": "comorbiditiesSummary",
    "label": "Comorbidades relatadas",
    "section": "2. Histórico Clínico e Imunológico"
  },
  {
    "key": "previousInfectionsHistory",
    "label": "Infecções anteriores",
    "section": "2. Histórico Clínico e Imunológico"
  },
  {
    "key": "travelHistory",
    "label": "Histórico de viagens nos últimos meses",
    "section": "3. Exposição e Comportamento (Vigilância)"
  },
  {
    "key": "closeContactsInfectious",
    "label": "Convivência com pessoas que testaram positivo para doenças infectocontagiosas",
    "section": "3. Exposição e Comportamento (Vigilância)"
  },
  {
    "key": "closeContactsDetails",
    "label": "Contato com pessoas com infecção: detalhes",
    "section": "3. Exposição e Comportamento (Vigilância)"
  },
  {
    "key": "lifestyleDiet",
    "label": "Estilo de vida: Dieta e hábitos nutricionais",
    "section": "3. Exposição e Comportamento (Vigilância)"
  },
  {
    "key": "physicalActivityLevel",
    "label": "Atividade física",
    "section": "3. Exposição e Comportamento (Vigilância)"
  },
  {
    "key": "sexualHealthBehavior",
    "label": "Comportamento de saúde e prevenção",
    "section": "3. Exposição e Comportamento (Vigilância)"
  },
  {
    "key": "environmentalExposure",
    "label": "Exposição ambiental",
    "section": "3. Exposição e Comportamento (Vigilância)"
  },
  {
    "key": "environmentalExposureDetails",
    "label": "Exposição ambiental: detalhes",
    "section": "3. Exposição e Comportamento (Vigilância)"
  },
  {
    "key": "geneticMarkers",
    "label": "Marcadores genéticos / predisposição a mutações e condições específicas",
    "section": "4. Dados Genéticos e Familiares"
  },
  {
    "key": "geneticMarkersDetails",
    "label": "Condição genética: detalhes",
    "section": "4. Dados Genéticos e Familiares"
  },
  {
    "key": "hasGoodHealth",
    "label": "Você goza de boa saúde?",
    "section": "Saúde Geral & Histórico Médico"
  },
  {
    "key": "isUndergoingMedicalTreatment",
    "label": "Está atualmente fazendo qualquer tratamento médico?",
    "section": "Saúde Geral & Histórico Médico"
  },
  {
    "key": "medicalTreatmentDetails",
    "label": "Tratamento médico: detalhes",
    "section": "Saúde Geral & Histórico Médico"
  },
  {
    "key": "hasAllergies",
    "label": "Apresenta alergias?",
    "section": "Saúde Geral & Histórico Médico"
  },
  {
    "key": "allergyDetails",
    "label": "Alergias: substância e reação relatada",
    "section": "Saúde Geral & Histórico Médico"
  },
  {
    "key": "bloodPressureStatus",
    "label": "Pressão arterial",
    "section": "Saúde Geral & Histórico Médico"
  },
  {
    "key": "hasHeartDisease",
    "label": "Doença do coração / infarto / sopro",
    "section": "Saúde Geral & Histórico Médico"
  },
  {
    "key": "hasRheumaticFever",
    "label": "Febre reumática",
    "section": "Saúde Geral & Histórico Médico"
  },
  {
    "key": "hasAsthma",
    "label": "Asma",
    "section": "Saúde Geral & Histórico Médico"
  },
  {
    "key": "hasArthritis",
    "label": "Artrite",
    "section": "Saúde Geral & Histórico Médico"
  },
  {
    "key": "hasFaintingSpells",
    "label": "Desmaios frequentes / síncope",
    "section": "Saúde Geral & Histórico Médico"
  },
  {
    "key": "hasSinusitis",
    "label": "Sinusite",
    "section": "Saúde Geral & Histórico Médico"
  },
  {
    "key": "hasHepatitis",
    "label": "Hepatite",
    "section": "Saúde Geral & Histórico Médico"
  },
  {
    "key": "hasOtherInfections",
    "label": "Outras infecções",
    "section": "Saúde Geral & Histórico Médico"
  },
  {
    "key": "otherInfectionsDetails",
    "label": "Outras infecções: detalhes",
    "section": "Saúde Geral & Histórico Médico"
  },
  {
    "key": "hasRadiationTherapyFaceJaw",
    "label": "Tratamento pelos raios-X na face ou nos maxilares",
    "section": "Saúde Geral & Histórico Médico"
  },
  {
    "key": "hasFaceJawTrauma",
    "label": "Traumatismo na face ou nos maxilares",
    "section": "Saúde Geral & Histórico Médico"
  },
  {
    "key": "faceJawTraumaDetails",
    "label": "Trauma na face/maxilares: detalhes",
    "section": "Saúde Geral & Histórico Médico"
  },
  {
    "key": "hasAdverseDentalReaction",
    "label": "Reação desfavorável ao tratamento dentário",
    "section": "Saúde Geral & Histórico Médico"
  },
  {
    "key": "adverseDentalReactionDetails",
    "label": "Reação ao tratamento dentário: detalhes",
    "section": "Saúde Geral & Histórico Médico"
  },
  {
    "key": "hasOtherUnlistedDiseases",
    "label": "Qualquer enfermidade não-relacionada",
    "section": "Saúde Geral & Histórico Médico"
  },
  {
    "key": "otherUnlistedDiseasesDetails",
    "label": "Outras doenças: detalhes",
    "section": "Saúde Geral & Histórico Médico"
  },
  {
    "key": "hasPacemaker",
    "label": "Marca-passo ou próteses cardíacas/valvulares",
    "section": "Saúde Geral & Histórico Médico"
  },
  {
    "key": "hasShortnessOfBreath",
    "label": "Sente falta de ar com frequência / dispneia",
    "section": "Saúde Geral & Histórico Médico"
  },
  {
    "key": "hasDiabetes",
    "label": "Tem diabetes?",
    "section": "Saúde Geral & Histórico Médico"
  },
  {
    "key": "diabetesType",
    "label": "Tipo de diabetes informado",
    "section": "Saúde Geral & Histórico Médico"
  },
  {
    "key": "hasHypertension",
    "label": "Tem hipertensão arterial?",
    "section": "Saúde Geral & Histórico Médico"
  },
  {
    "key": "bleedingDisorder",
    "label": "Distúrbios de coagulação / hemorragia",
    "section": "Saúde Geral & Histórico Médico"
  },
  {
    "key": "bleedingType",
    "label": "Sangramento ao corte",
    "section": "Saúde Geral & Histórico Médico"
  },
  {
    "key": "healingType",
    "label": "Cicatrização",
    "section": "Saúde Geral & Histórico Médico"
  },
  {
    "key": "usesAnticoagulants",
    "label": "Uso de AAS, Marevan, Xarelto, Clopidogrel",
    "section": "Saúde Geral & Histórico Médico"
  },
  {
    "key": "hasRespiratoryDisease",
    "label": "Asma, bronquite, rinite, sinusite, DPOC",
    "section": "Saúde Geral & Histórico Médico"
  },
  {
    "key": "hasRenalOrHepatic",
    "label": "Problemas renais ou hepáticos",
    "section": "Saúde Geral & Histórico Médico"
  },
  {
    "key": "hasThyroidDisorder",
    "label": "Hipotireoidismo / Hipertireoidismo",
    "section": "Saúde Geral & Histórico Médico"
  },
  {
    "key": "hasSeizures",
    "label": "Convulsões / Epilepsia / AVC",
    "section": "Saúde Geral & Histórico Médico"
  },
  {
    "key": "hasCancerHistory",
    "label": "Neoplasia, quimioterapia, radioterapia",
    "section": "Saúde Geral & Histórico Médico"
  },
  {
    "key": "usesBisphosphonates",
    "label": "Bisfosfonatos",
    "section": "Saúde Geral & Histórico Médico"
  },
  {
    "key": "hasHadSurgery",
    "label": "Já realizou alguma cirurgia",
    "section": "Saúde Geral & Histórico Médico"
  },
  {
    "key": "surgeryDetails",
    "label": "Cirurgias/internações: detalhes",
    "section": "Saúde Geral & Histórico Médico"
  },
  {
    "key": "pastHealthProblems",
    "label": "Outros problemas de saúde e internações",
    "section": "Saúde Geral & Histórico Médico"
  },
  {
    "key": "isPregnant",
    "label": "Está grávida?",
    "section": "Saúde Geral & Histórico Médico"
  },
  {
    "key": "pregnancyWeeks",
    "label": "Semanas ou trimestre da gestação",
    "section": "Saúde Geral & Histórico Médico"
  },
  {
    "key": "isBreastfeeding",
    "label": "Amamentando",
    "section": "Saúde Geral & Histórico Médico"
  },
  {
    "key": "climactericOrMenopause",
    "label": "Climatério/menopausa",
    "section": "Saúde Geral & Histórico Médico"
  },
  {
    "key": "hasAndropause",
    "label": "Andropausa / acompanhamento hormonal",
    "section": "Saúde Geral & Histórico Médico"
  },
  {
    "key": "andropauseStatus",
    "label": "Acompanhamento hormonal masculino",
    "section": "Saúde Geral & Histórico Médico"
  },
  {
    "key": "andropauseDetails",
    "label": "Detalhes ou sintomas da andropausa / reposição hormonal",
    "section": "Saúde Geral & Histórico Médico"
  },
  {
    "key": "takesMedication",
    "label": "Você está tomando alguma medicação atualmente?",
    "section": "Saúde Geral & Histórico Médico"
  },
  {
    "key": "medicationDetails",
    "label": "Quais medicamentos? Nome, dose, frequência e motivo, se souber.",
    "section": "Saúde Geral & Histórico Médico"
  },
  {
    "key": "treatingPhysician",
    "label": "Médico responsável e contato, se houver",
    "section": "Saúde Geral & Histórico Médico"
  },
  {
    "key": "healthChangesSinceLastVisit",
    "label": "Mudanças de saúde ou medicação desde a última consulta",
    "section": "Saúde Geral & Histórico Médico"
  },
  {
    "key": "continuousMedication",
    "label": "Medicamentos de uso contínuo já registrados",
    "section": "Saúde Geral & Histórico Médico"
  },
  {
    "key": "usesHerbalOrSupplements",
    "label": "Uso de chás, fitoterápicos ou suplementos",
    "section": "Saúde Geral & Histórico Médico"
  },
  {
    "key": "herbalDetails",
    "label": "Chás, fitoterápicos e suplementos: quais?",
    "section": "Saúde Geral & Histórico Médico"
  },
  {
    "key": "familyMedicalHistory",
    "label": "Histórico médico familiar",
    "section": "Saúde Geral & Histórico Médico"
  },
  {
    "key": "familyHistoryDetails",
    "label": "Histórico familiar: detalhes",
    "section": "Saúde Geral & Histórico Médico"
  },
  {
    "key": "generalHealthRating",
    "label": "Como avalia sua saúde geral?",
    "section": "Saúde Geral & Histórico Médico"
  },
  {
    "key": "waterIntakeFrequency",
    "label": "Ingestão diária de água",
    "section": "Hábitos, Estilo de Vida & Sono"
  },
  {
    "key": "isSmoker",
    "label": "Tabagismo",
    "section": "Hábitos, Estilo de Vida & Sono"
  },
  {
    "key": "smokingFrequency",
    "label": "Frequência de tabagismo",
    "section": "Hábitos, Estilo de Vida & Sono"
  },
  {
    "key": "smokingDetails",
    "label": "Quantidade de cigarros/dia ou tempo de fumo",
    "section": "Hábitos, Estilo de Vida & Sono"
  },
  {
    "key": "usesRecreationalDrugs",
    "label": "Uso de drogas ou substâncias recreativas",
    "section": "Hábitos, Estilo de Vida & Sono"
  },
  {
    "key": "drugUsageFrequency",
    "label": "Frequência de uso de substâncias",
    "section": "Hábitos, Estilo de Vida & Sono"
  },
  {
    "key": "drugDetails",
    "label": "Tipo de substância",
    "section": "Hábitos, Estilo de Vida & Sono"
  },
  {
    "key": "drugUsageNotes",
    "label": "Observações do profissional sobre impacto cirúrgico/anestésico",
    "section": "Hábitos, Estilo de Vida & Sono"
  },
  {
    "key": "habitsNotes",
    "label": "Observações gerais sobre hábitos",
    "section": "Hábitos, Estilo de Vida & Sono"
  },
  {
    "key": "consumesAlcohol",
    "label": "Consumo frequente de bebidas alcoólicas",
    "section": "Hábitos, Estilo de Vida & Sono"
  },
  {
    "key": "hasBruxism",
    "label": "Bruxismo ou apertamento dental",
    "section": "Hábitos, Estilo de Vida & Sono"
  },
  {
    "key": "nailBitingOrHabits",
    "label": "Onicofagia, roer objetos, morder lábios/bochecha/caneta",
    "section": "Hábitos, Estilo de Vida & Sono"
  },
  {
    "key": "breathingType",
    "label": "Via respiratória principal",
    "section": "Hábitos, Estilo de Vida & Sono"
  },
  {
    "key": "respiratoryPattern",
    "label": "Padrão muscular / mecânica respiratória",
    "section": "Hábitos, Estilo de Vida & Sono"
  },
  {
    "key": "sleepingPosture",
    "label": "Postura ao dormir",
    "section": "Hábitos, Estilo de Vida & Sono"
  },
  {
    "key": "sleepQuality",
    "label": "Padrão de sono",
    "section": "Hábitos, Estilo de Vida & Sono"
  },
  {
    "key": "hasSnoringOrApnea",
    "label": "Ronco ou apnéia do sono",
    "section": "Hábitos, Estilo de Vida & Sono"
  },
  {
    "key": "sleepHoursPerNight",
    "label": "Média de horas de sono",
    "section": "Hábitos, Estilo de Vida & Sono"
  },
  {
    "key": "usesNightGuardOrCpap",
    "label": "Placa de mordida ou aparelho para ronco / CPAP",
    "section": "Hábitos, Estilo de Vida & Sono"
  },
  {
    "key": "psychologicalState",
    "label": "Estado comportamental recente",
    "section": "Hábitos, Estilo de Vida & Sono"
  },
  {
    "key": "hasFaceOrAtmPainLastMonth",
    "label": "Dor na face, maxilares ou têmporas no último mês",
    "section": "DTM, Dor Facial & Articulação"
  },
  {
    "key": "hasAtmLocking",
    "label": "Travamento na articulação",
    "section": "DTM, Dor Facial & Articulação"
  },
  {
    "key": "atmLockingDetails",
    "label": "Tipo de travamento da ATM",
    "section": "DTM, Dor Facial & Articulação"
  },
  {
    "key": "hasAtmPainOrClicking",
    "label": "Estalos ou ruídos ao mastigar/abrir a boca",
    "section": "DTM, Dor Facial & Articulação"
  },
  {
    "key": "hasTinnitusOrEarRinging",
    "label": "Zumbidos ou apitos no ouvido",
    "section": "DTM, Dor Facial & Articulação"
  },
  {
    "key": "entEvaluated",
    "label": "Avaliado por Otorrinolaringologista",
    "section": "DTM, Dor Facial & Articulação"
  },
  {
    "key": "hasJawFatigueWakingUp",
    "label": "Mandíbula cansada ou dolorida ao acordar",
    "section": "DTM, Dor Facial & Articulação"
  },
  {
    "key": "hasOcclusalDiscomfort",
    "label": "Desconforto ao encaixar os dentes",
    "section": "DTM, Dor Facial & Articulação"
  },
  {
    "key": "painEvaScore",
    "label": "Escala Visual de Dor",
    "section": "DTM, Dor Facial & Articulação"
  },
  {
    "key": "chiefComplaint",
    "label": "Motivo principal da consulta",
    "section": "Histórico Clínico Completo"
  },
  {
    "key": "lastDentalVisit",
    "label": "Última consulta odontológica",
    "section": "Histórico Clínico Completo"
  },
  {
    "key": "oralHealthRating",
    "label": "Como avalia sua saúde bucal?",
    "section": "Histórico Clínico Completo"
  },
  {
    "key": "hasAnesthesiaReaction",
    "label": "Complicação ou mal-estar prévio com anestésico local",
    "section": "Histórico Clínico Completo"
  },
  {
    "key": "anesthesiaReactionDetails",
    "label": "Reação anestésica: detalhes",
    "section": "Histórico Clínico Completo"
  },
  {
    "key": "hasGingivalBleeding",
    "label": "Sangramento na gengiva ao escovar ou passar fio",
    "section": "Histórico Clínico Completo"
  },
  {
    "key": "hasToothSensitivity",
    "label": "Sensibilidade ao frio, quente ou doce",
    "section": "Histórico Clínico Completo"
  },
  {
    "key": "hasLooseTeeth",
    "label": "Dentes moles ou mobilidade dental",
    "section": "Histórico Clínico Completo"
  },
  {
    "key": "dryMouthOrBadTaste",
    "label": "Sensação de boca seca",
    "section": "Histórico Clínico Completo"
  },
  {
    "key": "hasFaceOrLipSores",
    "label": "Feridas ou bolhas frequentes nos lábios/boca",
    "section": "Histórico Clínico Completo"
  },
  {
    "key": "usesDentalProsthesis",
    "label": "Uso de prótese removível ou fixa",
    "section": "Histórico Clínico Completo"
  },
  {
    "key": "orthodonticTreatment",
    "label": "Aparelho ortodôntico",
    "section": "Histórico Clínico Completo"
  },
  {
    "key": "brushingFrequency",
    "label": "Escovação diária",
    "section": "Histórico Clínico Completo"
  },
  {
    "key": "usesDentalFloss",
    "label": "Uso de fio dental",
    "section": "Histórico Clínico Completo"
  },
  {
    "key": "notes",
    "label": "Observações do cirurgião-dentista",
    "section": "Histórico Clínico Completo"
  }
];

export function medicationAnswer(anamnesis: Partial<Anamnesis> = {}): boolean | undefined {
  if (typeof anamnesis.takesMedication === 'boolean') return anamnesis.takesMedication;
  if (anamnesis.medicationDetails?.trim() || anamnesis.continuousMedication?.trim()) return true;
  return undefined;
}
export function medicationSummary(anamnesis: Partial<Anamnesis> = {}) {
  const answer = medicationAnswer(anamnesis);
  if (answer === false) return 'Não';
  if (answer === undefined) return 'Não informado';
  return anamnesis.medicationDetails?.trim() || anamnesis.continuousMedication?.trim() || 'Sim — medicamentos não especificados';
}
export function anamnesisRows(anamnesis: Partial<Anamnesis>) {
  return anamnesisFields.map(field => {
    let value = anamnesis[field.key];
    if (field.key === 'takesMedication') value = medicationAnswer(anamnesis);
    if (field.key === 'medicationDetails') value = anamnesis.medicationDetails || (medicationAnswer(anamnesis) ? anamnesis.continuousMedication : '');
    const answer = value === true ? 'Sim' : value === false ? 'Não' :
      value === undefined || value === null || value === '' ? 'Não informado' : String(value).replace(/_/g, ' ');
    return {...field, answer};
  });
}
