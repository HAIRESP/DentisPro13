import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { getThemeStyles } from '../../utils/themeUtils';
import { Anamnesis, Patient, Gender } from '../../types';
import { formatCPF } from '../../utils/formatters';
import { formatPhoneWithDDI } from '../common/PhoneInputWithDDI';
import { formatFullAddress } from '../common/AddressFields';
import { printDocumentWithTitle } from '../../utils/printUtils';
import { 
  AlertTriangle, 
  Heart, 
  Activity, 
  ShieldAlert, 
  Pill, 
  Smile, 
  Check, 
  X, 
  Stethoscope, 
  FileText,
  Sparkles,
  Info,
  Clock,
  Zap,
  HelpCircle,
  Volume2,
  Moon,
  ActivitySquare,
  Thermometer,
  User,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Shield,
  Plane,
  Syringe,
  Dna,
  Compass,
  Briefcase,
  Users,
  ArrowLeft,
  Printer,
  Plus
} from 'lucide-react';

const COMMON_RECREATIONAL_SUBSTANCES = [
  'Cannabis / Maconha',
  'Cocaína / Derivados',
  'MDMA / Êxtase',
  'Opioides',
  'Estimulantes / Anfetaminas',
  'Benzodiazepínicos sem prescrição',
  'Solventes / Inalantes',
  'Cetamina / Dissociativos',
  'Álcool em padrão abusivo'
];

const COMMON_PROFESSIONS = [
  'Administrador(a)',
  'Advogado(a)',
  'Agricultor(a) / Trabalhador Rural',
  'Aposentado(a) / Pensionista',
  'Arquiteto(a) / Urbanista',
  'Assistente Administrativo / Escritório',
  'Atleta Profissional / Educador(a) Físico(a)',
  'Autônomo(a) / Comerciante',
  'Bancário(a) / Financeiro',
  'Biólogo(a) / Biomédico(a)',
  'Cabeleireiro(a) / Barbeiro / Esteticista',
  'Caminhoneiro(a) / Motorista / Condutor',
  'Carpinteiro(a) / Marceneiro(a)',
  'Cientista / Pesquisador(a)',
  'Cirurgião(ã)-Dentista / Odontologista',
  'Contador(a) / Auditor(a)',
  'Cozinheiro(a) / Chef / Gastronomia',
  'Designer / Publicitário(a) / Marketing',
  'Do Lar / Cuidador(a) Familiar',
  'Eletricista / Técnico Eletrônico',
  'Enfermeiro(a) / Técnico(a) de Enfermagem',
  'Engenheiro(a) (Civil, Mecânico, etc.)',
  'Estudante / Universitário(a)',
  'Farmacêutico(a) / Químico(a)',
  'Fisioterapeuta / Terapeuta Ocupacional',
  'Fonoaudiólogo(a)',
  'Fotógrafo(a) / Cinegrafista',
  'Garçom / Garçonete / Atendente',
  'Jornalista / Comunicador(a)',
  'Juiz(a) / Promotor(a) / Defensor(a)',
  'Manicure / Pedicure / Podólogo(a)',
  'Marceneiro(a) / Artesão(ã)',
  'Mecânico(a) / Funileiro(a)',
  'Médico(a) / Especialista em Saúde',
  'Metalúrgico(a) / Soldador(a)',
  'Militar / Policial / Bombeiro / Segurança',
  'Músico(a) / Artista / Produtor Cultural',
  'Nutricionista',
  'Operador(a) de Máquinas / Linha de Produção',
  'Pedagogo(a) / Educador(a) Infantil',
  'Pedreiro(a) / Construção Civil',
  'Pintor(a)',
  'Professor(a) / Docente',
  'Psicólogo(a) / Terapeuta',
  'Recepcionista / Secretário(a)',
  'Representante Comercial / Vendas',
  'Servidor(a) Público(a)',
  'Técnico(a) em Informática / TI',
  'Veterinário(a) / Zootecnista',
  'Vigilante / Segurança Privada',
  'Outra Profissão / Ocupação'
];

const COMMON_OCCUPATIONAL_RISKS = [
  'Agentes Biológicos / Material Infectocontagioso',
  'Agentes Químicos / Solventes / Ácidos / Metais',
  'Carga Térmica / Frio ou Calor Extremo',
  'Ergonômico / Movimentos Repetitivos / Postura Estática Prolongada',
  'Estresse Ocupacional / Carga Mental Elevada',
  'Poeiras Minerais / Partículas em Suspensão / Fumos',
  'Radiação Ionizante / Não-ionizante (RX, UV, Laser)',
  'Ruído Excessivo / Vibrações Mecânicas',
  'Trabalho Noturno / Turnos Alternados',
  'Nenhum Risco Ocupacional Específico'
];

interface AnamnesisModalProps {
  patient: Patient;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedAnamnesis: Anamnesis) => void;
}

export const AnamnesisModal: React.FC<AnamnesisModalProps> = ({
  patient,
  isOpen,
  onClose,
  onSave
}) => {
  const { layoutTheme, addSavedClinicDocument, clinicInfo, activeProfessional } = useApp();
  const t = getThemeStyles(layoutTheme);

  const initial = patient.anamnesis || ({} as Anamnesis);

  // Helper para cálculo de idade
  const calculatePatientAge = (birthDateString?: string) => {
    if (!birthDateString) return 'Idade não informada';
    const birth = new Date(birthDateString + 'T00:00:00');
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
      age--;
    }
    return isNaN(age) || age < 0 ? 'Idade não informada' : `${age} anos`;
  };

  // Helper para gerenciar adição/remoção de substâncias recreativas
  const [newSubstanceInput, setNewSubstanceInput] = useState('');

  const handleAddSubstance = (substanceName?: string) => {
    const toAdd = (substanceName || newSubstanceInput).trim();
    if (!toAdd) return;
    const currentList = drugDetails ? drugDetails.split(',').map(s => s.trim()).filter(Boolean) : [];
    if (!currentList.includes(toAdd)) {
      const updated = [...currentList, toAdd].join(', ');
      setDrugDetails(updated);
    }
    setNewSubstanceInput('');
  };

  const handleRemoveSubstance = (substanceToRemove: string) => {
    const currentList = drugDetails ? drugDetails.split(',').map(s => s.trim()).filter(Boolean) : [];
    const updated = currentList.filter(s => s !== substanceToRemove).join(', ');
    setDrugDetails(updated);
  };

  // === 1. Identificação e Dados Demográficos (Vigilância & Suscetibilidade) ===
  const [gender, setGender] = useState<Gender>(initial.gender || patient.gender || 'cisgenero');
  const [ageAndBiologicalSexNotes, setAgeAndBiologicalSexNotes] = useState(initial.ageAndBiologicalSexNotes || '');
  const [ethnicity, setEthnicity] = useState<Anamnesis['ethnicity']>(initial.ethnicity || patient.ethnicity || 'branca');
  const [ethnicityDetails, setEthnicityDetails] = useState(initial.ethnicityDetails || '');
  const [profession, setProfession] = useState(initial.profession || patient.profession || '');
  const [occupationalRisks, setOccupationalRisks] = useState(initial.occupationalRisks || '');
  const [currentResidence, setCurrentResidence] = useState(
    initial.currentResidence || (patient.address ? `${patient.address.city || ''} - ${patient.address.state || ''}` : '') || ''
  );
  const [previousResidence, setPreviousResidence] = useState(initial.previousResidence || patient.previousResidence || '');
  const [endemicAreaExposure, setEndemicAreaExposure] = useState(initial.endemicAreaExposure || '');

  // === 2. Histórico Clínico e Imunológico ===
  const [hasVaccinationUpToDate, setHasVaccinationUpToDate] = useState(
    initial.hasVaccinationUpToDate !== undefined ? initial.hasVaccinationUpToDate : true
  );
  const [vaccinationStatus, setVaccinationStatus] = useState(initial.vaccinationStatus || '');
  const [vaccinationDetails, setVaccinationDetails] = useState(initial.vaccinationDetails || '');
  const [comorbiditiesSummary, setComorbiditiesSummary] = useState(initial.comorbiditiesSummary || '');
  const [previousInfectionsHistory, setPreviousInfectionsHistory] = useState(initial.previousInfectionsHistory || '');

  // === 3. Exposição e Comportamento (Vigilância) ===
  const [travelHistory, setTravelHistory] = useState(initial.travelHistory || '');
  const [closeContactsInfectious, setCloseContactsInfectious] = useState(initial.closeContactsInfectious || false);
  const [closeContactsDetails, setCloseContactsDetails] = useState(initial.closeContactsDetails || '');
  const [lifestyleDiet, setLifestyleDiet] = useState(initial.lifestyleDiet || '');
  const [physicalActivityLevel, setPhysicalActivityLevel] = useState<Anamnesis['physicalActivityLevel']>(
    initial.physicalActivityLevel || 'moderado'
  );
  const [sexualHealthBehavior, setSexualHealthBehavior] = useState(initial.sexualHealthBehavior || '');
  const [environmentalExposure, setEnvironmentalExposure] = useState(initial.environmentalExposure || false);
  const [environmentalExposureDetails, setEnvironmentalExposureDetails] = useState(initial.environmentalExposureDetails || '');

  // === 4. Dados Genéticos e Familiares ===
  const [familyMedicalHistory, setFamilyMedicalHistory] = useState(initial.familyMedicalHistory || false);
  const [familyHistoryDetails, setFamilyHistoryDetails] = useState(initial.familyHistoryDetails || '');
  const [geneticMarkers, setGeneticMarkers] = useState(initial.geneticMarkers || false);
  const [geneticMarkersDetails, setGeneticMarkersDetails] = useState(initial.geneticMarkersDetails || '');

  // --- Saúde Geral & Histórico Médico (Questionário Diagnóstico Clínico) ---
  const [hasGoodHealth, setHasGoodHealth] = useState(initial.hasGoodHealth !== undefined ? initial.hasGoodHealth : true);
  const [isUndergoingMedicalTreatment, setIsUndergoingMedicalTreatment] = useState(initial.isUndergoingMedicalTreatment || false);
  const [medicalTreatmentDetails, setMedicalTreatmentDetails] = useState(initial.medicalTreatmentDetails || '');
  const [hasRheumaticFever, setHasRheumaticFever] = useState(initial.hasRheumaticFever || false);
  const [hasAsthma, setHasAsthma] = useState(initial.hasAsthma || false);
  const [hasArthritis, setHasArthritis] = useState(initial.hasArthritis || false);
  const [hasFaintingSpells, setHasFaintingSpells] = useState(initial.hasFaintingSpells || false);
  const [hasSinusitis, setHasSinusitis] = useState(initial.hasSinusitis || false);
  const [hasHepatitis, setHasHepatitis] = useState(initial.hasHepatitis || false);
  const [hasOtherInfections, setHasOtherInfections] = useState(initial.hasOtherInfections || false);
  const [otherInfectionsDetails, setOtherInfectionsDetails] = useState(initial.otherInfectionsDetails || '');
  const [hasRadiationTherapyFaceJaw, setHasRadiationTherapyFaceJaw] = useState(initial.hasRadiationTherapyFaceJaw || false);
  const [hasFaceJawTrauma, setHasFaceJawTrauma] = useState(initial.hasFaceJawTrauma || false);
  const [faceJawTraumaDetails, setFaceJawTraumaDetails] = useState(initial.faceJawTraumaDetails || '');
  const [hasAdverseDentalReaction, setHasAdverseDentalReaction] = useState(initial.hasAdverseDentalReaction || false);
  const [adverseDentalReactionDetails, setAdverseDentalReactionDetails] = useState(initial.adverseDentalReactionDetails || '');
  const [hasOtherUnlistedDiseases, setHasOtherUnlistedDiseases] = useState(initial.hasOtherUnlistedDiseases || false);
  const [otherUnlistedDiseasesDetails, setOtherUnlistedDiseasesDetails] = useState(initial.otherUnlistedDiseasesDetails || '');

  const [hasAllergies, setHasAllergies] = useState(initial.hasAllergies || false);
  const [allergyDetails, setAllergyDetails] = useState(initial.allergyDetails || '');
  const [bloodPressureStatus, setBloodPressureStatus] = useState<Anamnesis['bloodPressureStatus']>(initial.bloodPressureStatus || 'normal');
  const [hasHeartDisease, setHasHeartDisease] = useState(initial.hasHeartDisease || false);
  const [hasPacemaker, setHasPacemaker] = useState(initial.hasPacemaker || false);
  const [hasShortnessOfBreath, setHasShortnessOfBreath] = useState(initial.hasShortnessOfBreath || false);
  const [hasDiabetes, setHasDiabetes] = useState(initial.hasDiabetes || false);
  const [diabetesType, setDiabetesType] = useState<Anamnesis['diabetesType']>(initial.diabetesType || 'controlada');
  const [hasHypertension, setHasHypertension] = useState(initial.hasHypertension || false);
  const [bleedingDisorder, setBleedingDisorder] = useState(initial.bleedingDisorder || false);
  const [bleedingType, setBleedingType] = useState<Anamnesis['bleedingType']>(initial.bleedingType || 'normal');
  const [healingType, setHealingType] = useState<Anamnesis['healingType']>(initial.healingType || 'normal');
  const [usesAnticoagulants, setUsesAnticoagulants] = useState(initial.usesAnticoagulants || false);
  const [hasRespiratoryDisease, setHasRespiratoryDisease] = useState(initial.hasRespiratoryDisease || false);
  const [hasRenalOrHepatic, setHasRenalOrHepatic] = useState(initial.hasRenalOrHepatic || false);
  const [hasThyroidDisorder, setHasThyroidDisorder] = useState(initial.hasThyroidDisorder || false);
  const [hasSeizures, setHasSeizures] = useState(initial.hasSeizures || false);
  const [hasCancerHistory, setHasCancerHistory] = useState(initial.hasCancerHistory || false);
  const [usesBisphosphonates, setUsesBisphosphonates] = useState(initial.usesBisphosphonates || false);
  const [hasHadSurgery, setHasHadSurgery] = useState(initial.hasHadSurgery || false);
  const [surgeryDetails, setSurgeryDetails] = useState(initial.surgeryDetails || '');
  const [pastHealthProblems, setPastHealthProblems] = useState(initial.pastHealthProblems || '');
  const [isPregnant, setIsPregnant] = useState(initial.isPregnant || false);
  const [pregnancyWeeks, setPregnancyWeeks] = useState(initial.pregnancyWeeks || '');
  const [isBreastfeeding, setIsBreastfeeding] = useState(initial.isBreastfeeding || false);
  const [climactericOrMenopause, setClimactericOrMenopause] = useState<Anamnesis['climactericOrMenopause']>(initial.climactericOrMenopause || 'nenhum');
  const [hasAndropause, setHasAndropause] = useState(initial.hasAndropause || false);
  const [andropauseStatus, setAndropauseStatus] = useState<Anamnesis['andropauseStatus']>(initial.andropauseStatus || 'nenhum');
  const [andropauseDetails, setAndropauseDetails] = useState(initial.andropauseDetails || '');
  const [continuousMedication, setContinuousMedication] = useState(initial.continuousMedication || '');
  const [usesHerbalOrSupplements, setUsesHerbalOrSupplements] = useState(initial.usesHerbalOrSupplements || false);
  const [herbalDetails, setHerbalDetails] = useState(initial.herbalDetails || '');
  const [generalHealthRating, setGeneralHealthRating] = useState<Anamnesis['generalHealthRating']>(initial.generalHealthRating || 'boa');

  // --- Hábitos, Estilo de Vida & Sono ---
  const [waterIntakeFrequency, setWaterIntakeFrequency] = useState<Anamnesis['waterIntakeFrequency']>(
    initial.waterIntakeFrequency || 'normal'
  );
  const [isSmoker, setIsSmoker] = useState(initial.isSmoker || false);
  const [smokingFrequency, setSmokingFrequency] = useState<Anamnesis['smokingFrequency']>(initial.smokingFrequency || 'diario_ate_10');
  const [smokingDetails, setSmokingDetails] = useState(initial.smokingDetails || '');
  const [usesRecreationalDrugs, setUsesRecreationalDrugs] = useState(initial.usesRecreationalDrugs || false);
  const [drugUsageFrequency, setDrugUsageFrequency] = useState<Anamnesis['drugUsageFrequency']>(initial.drugUsageFrequency || 'ocasional_social');
  const [drugDetails, setDrugDetails] = useState(initial.drugDetails || '');
  const [drugUsageNotes, setDrugUsageNotes] = useState(initial.drugUsageNotes || '');
  const [habitsNotes, setHabitsNotes] = useState(initial.habitsNotes || '');
  const [consumesAlcohol, setConsumesAlcohol] = useState(initial.consumesAlcohol || false);
  const [hasBruxism, setHasBruxism] = useState(initial.hasBruxism || false);
  const [nailBitingOrHabits, setNailBitingOrHabits] = useState(initial.nailBitingOrHabits || '');
  const [breathingType, setBreathingType] = useState<Anamnesis['breathingType']>(initial.breathingType || 'nasal');
  const [respiratoryPattern, setRespiratoryPattern] = useState<Anamnesis['respiratoryPattern']>(
    initial.respiratoryPattern || 'mista_nao_avaliado'
  );
  const [sleepingPosture, setSleepingPosture] = useState<Anamnesis['sleepingPosture']>(initial.sleepingPosture || 'decubito_dorsal');
  const [sleepQuality, setSleepQuality] = useState<Anamnesis['sleepQuality']>(initial.sleepQuality || 'reparador');
  const [hasSnoringOrApnea, setHasSnoringOrApnea] = useState(initial.hasSnoringOrApnea || false);
  const [sleepHoursPerNight, setSleepHoursPerNight] = useState(initial.sleepHoursPerNight || '8');
  const [usesNightGuardOrCpap, setUsesNightGuardOrCpap] = useState(initial.usesNightGuardOrCpap || false);
  const [psychologicalState, setPsychologicalState] = useState(initial.psychologicalState || '');

  // Helper para horas de sono
  const parseSleepHours = (val: string): number => {
    if (!val) return 8;
    const digits = val.replace(/\D/g, '');
    if (!digits) return 8;
    const num = parseInt(digits, 10);
    if (isNaN(num) || num < 1) return 1;
    if (num > 12) return 12;
    return num;
  };

  const sleepHoursNum = parseSleepHours(sleepHoursPerNight);

  // --- DTM, Dor Facial & Articulação ---
  const [hasFaceOrAtmPainLastMonth, setHasFaceOrAtmPainLastMonth] = useState(initial.hasFaceOrAtmPainLastMonth || false);
  const [hasAtmLocking, setHasAtmLocking] = useState(initial.hasAtmLocking || false);
  const [atmLockingDetails, setAtmLockingDetails] = useState<Anamnesis['atmLockingDetails']>(initial.atmLockingDetails || 'aberta');
  const [hasAtmPainOrClicking, setHasAtmPainOrClicking] = useState(initial.hasAtmPainOrClicking || false);
  const [hasTinnitusOrEarRinging, setHasTinnitusOrEarRinging] = useState(initial.hasTinnitusOrEarRinging || false);
  const [entEvaluated, setEntEvaluated] = useState(initial.entEvaluated || false);
  const [hasJawFatigueWakingUp, setHasJawFatigueWakingUp] = useState(initial.hasJawFatigueWakingUp || false);
  const [hasOcclusalDiscomfort, setHasOcclusalDiscomfort] = useState(initial.hasOcclusalDiscomfort || false);
  const [painEvaScore, setPainEvaScore] = useState<number>(initial.painEvaScore || 0);

  // --- Queixa Principal & Exame Odontológico ---
  const [chiefComplaint, setChiefComplaint] = useState(initial.chiefComplaint || '');
  const [lastDentalVisit, setLastDentalVisit] = useState(initial.lastDentalVisit || '');
  const [oralHealthRating, setOralHealthRating] = useState<Anamnesis['oralHealthRating']>(initial.oralHealthRating || 'boa');
  const [hasAnesthesiaReaction, setHasAnesthesiaReaction] = useState(initial.hasAnesthesiaReaction || false);
  const [anesthesiaReactionDetails, setAnesthesiaReactionDetails] = useState(initial.anesthesiaReactionDetails || '');
  const [hasGingivalBleeding, setHasGingivalBleeding] = useState(initial.hasGingivalBleeding || false);
  const [hasToothSensitivity, setHasToothSensitivity] = useState(initial.hasToothSensitivity || false);
  const [hasLooseTeeth, setHasLooseTeeth] = useState(initial.hasLooseTeeth || false);
  const [dryMouthOrBadTaste, setDryMouthOrBadTaste] = useState(initial.dryMouthOrBadTaste || false);
  const [hasFaceOrLipSores, setHasFaceOrLipSores] = useState(initial.hasFaceOrLipSores || false);
  const [usesDentalProsthesis, setUsesDentalProsthesis] = useState(initial.usesDentalProsthesis || false);
  const [orthodonticTreatment, setOrthodonticTreatment] = useState(initial.orthodonticTreatment || false);
  const [brushingFrequency, setBrushingFrequency] = useState(initial.brushingFrequency || '3x ao dia');
  const [usesDentalFloss, setUsesDentalFloss] = useState(initial.usesDentalFloss !== undefined ? initial.usesDentalFloss : true);
  const [notes, setNotes] = useState(initial.notes || '');

  // Sincronizar estado sempre que o modal for aberto ou o paciente mudar
  useEffect(() => {
    if (isOpen) {
      const curr = patient.anamnesis || ({} as Anamnesis);
      setGender(curr.gender || patient.gender || 'cisgenero');
      setAgeAndBiologicalSexNotes(curr.ageAndBiologicalSexNotes || '');
      setEthnicity(curr.ethnicity || patient.ethnicity || 'branca');
      setEthnicityDetails(curr.ethnicityDetails || '');
      setProfession(curr.profession || patient.profession || '');
      setOccupationalRisks(curr.occupationalRisks || '');
      setCurrentResidence(
        curr.currentResidence || (patient.address ? `${patient.address.city || ''} - ${patient.address.state || ''}` : '') || ''
      );
      setPreviousResidence(curr.previousResidence || patient.previousResidence || '');
      setEndemicAreaExposure(curr.endemicAreaExposure || '');
      setHasVaccinationUpToDate(curr.hasVaccinationUpToDate !== undefined ? curr.hasVaccinationUpToDate : true);
      setVaccinationStatus(curr.vaccinationStatus || '');
      setVaccinationDetails(curr.vaccinationDetails || '');
      setComorbiditiesSummary(curr.comorbiditiesSummary || '');
      setPreviousInfectionsHistory(curr.previousInfectionsHistory || '');
      setTravelHistory(curr.travelHistory || '');
      setCloseContactsInfectious(curr.closeContactsInfectious || false);
      setCloseContactsDetails(curr.closeContactsDetails || '');
      setLifestyleDiet(curr.lifestyleDiet || '');
      setPhysicalActivityLevel(curr.physicalActivityLevel || 'moderado');
      setSexualHealthBehavior(curr.sexualHealthBehavior || '');
      setEnvironmentalExposure(curr.environmentalExposure || false);
      setEnvironmentalExposureDetails(curr.environmentalExposureDetails || '');
      setFamilyMedicalHistory(curr.familyMedicalHistory || false);
      setFamilyHistoryDetails(curr.familyHistoryDetails || '');
      setGeneticMarkers(curr.geneticMarkers || false);
      setGeneticMarkersDetails(curr.geneticMarkersDetails || '');
      setHasGoodHealth(curr.hasGoodHealth !== undefined ? curr.hasGoodHealth : true);
      setIsUndergoingMedicalTreatment(curr.isUndergoingMedicalTreatment || false);
      setMedicalTreatmentDetails(curr.medicalTreatmentDetails || '');
      setHasRheumaticFever(curr.hasRheumaticFever || false);
      setHasAsthma(curr.hasAsthma || false);
      setHasArthritis(curr.hasArthritis || false);
      setHasFaintingSpells(curr.hasFaintingSpells || false);
      setHasSinusitis(curr.hasSinusitis || false);
      setHasHepatitis(curr.hasHepatitis || false);
      setHasOtherInfections(curr.hasOtherInfections || false);
      setOtherInfectionsDetails(curr.otherInfectionsDetails || '');
      setHasRadiationTherapyFaceJaw(curr.hasRadiationTherapyFaceJaw || false);
      setHasFaceJawTrauma(curr.hasFaceJawTrauma || false);
      setFaceJawTraumaDetails(curr.faceJawTraumaDetails || '');
      setHasAdverseDentalReaction(curr.hasAdverseDentalReaction || false);
      setAdverseDentalReactionDetails(curr.adverseDentalReactionDetails || '');
      setHasOtherUnlistedDiseases(curr.hasOtherUnlistedDiseases || false);
      setOtherUnlistedDiseasesDetails(curr.otherUnlistedDiseasesDetails || '');
      setHasAllergies(curr.hasAllergies || false);
      setAllergyDetails(curr.allergyDetails || '');
      setBloodPressureStatus(curr.bloodPressureStatus || 'normal');
      setHasHeartDisease(curr.hasHeartDisease || false);
      setHasPacemaker(curr.hasPacemaker || false);
      setHasShortnessOfBreath(curr.hasShortnessOfBreath || false);
      setHasDiabetes(curr.hasDiabetes || false);
      setDiabetesType(curr.diabetesType || 'controlada');
      setHasHypertension(curr.hasHypertension || false);
      setBleedingDisorder(curr.bleedingDisorder || false);
      setBleedingType(curr.bleedingType || 'normal');
      setHealingType(curr.healingType || 'normal');
      setUsesAnticoagulants(curr.usesAnticoagulants || false);
      setHasRespiratoryDisease(curr.hasRespiratoryDisease || false);
      setHasRenalOrHepatic(curr.hasRenalOrHepatic || false);
      setHasThyroidDisorder(curr.hasThyroidDisorder || false);
      setHasSeizures(curr.hasSeizures || false);
      setHasCancerHistory(curr.hasCancerHistory || false);
      setUsesBisphosphonates(curr.usesBisphosphonates || false);
      setHasHadSurgery(curr.hasHadSurgery || false);
      setSurgeryDetails(curr.surgeryDetails || '');
      setPastHealthProblems(curr.pastHealthProblems || '');
      setIsPregnant(curr.isPregnant || false);
      setPregnancyWeeks(curr.pregnancyWeeks || '');
      setIsBreastfeeding(curr.isBreastfeeding || false);
      setClimactericOrMenopause(curr.climactericOrMenopause || 'nenhum');
      setHasAndropause(curr.hasAndropause || false);
      setAndropauseStatus(curr.andropauseStatus || 'nenhum');
      setAndropauseDetails(curr.andropauseDetails || '');
      setContinuousMedication(curr.continuousMedication || '');
      setUsesHerbalOrSupplements(curr.usesHerbalOrSupplements || false);
      setHerbalDetails(curr.herbalDetails || '');
      setGeneralHealthRating(curr.generalHealthRating || 'boa');
      setWaterIntakeFrequency(curr.waterIntakeFrequency || 'normal');
      setIsSmoker(curr.isSmoker || false);
      setSmokingFrequency(curr.smokingFrequency || 'diario_ate_10');
      setSmokingDetails(curr.smokingDetails || '');
      setUsesRecreationalDrugs(curr.usesRecreationalDrugs || false);
      setDrugUsageFrequency(curr.drugUsageFrequency || 'ocasional_social');
      setDrugDetails(curr.drugDetails || '');
      setDrugUsageNotes(curr.drugUsageNotes || '');
      setHabitsNotes(curr.habitsNotes || '');
      setConsumesAlcohol(curr.consumesAlcohol || false);
      setHasBruxism(curr.hasBruxism || false);
      setNailBitingOrHabits(curr.nailBitingOrHabits || '');
      setBreathingType(curr.breathingType || 'nasal');
      setRespiratoryPattern(curr.respiratoryPattern || 'mista_nao_avaliado');
      setSleepingPosture(curr.sleepingPosture || 'decubito_dorsal');
      setSleepQuality(curr.sleepQuality || 'reparador');
      setHasSnoringOrApnea(curr.hasSnoringOrApnea || false);
      setSleepHoursPerNight(curr.sleepHoursPerNight || '8');
      setUsesNightGuardOrCpap(curr.usesNightGuardOrCpap || false);
      setPsychologicalState(curr.psychologicalState || '');
      setHasFaceOrAtmPainLastMonth(curr.hasFaceOrAtmPainLastMonth || false);
      setHasAtmLocking(curr.hasAtmLocking || false);
      setAtmLockingDetails(curr.atmLockingDetails || 'aberta');
      setHasAtmPainOrClicking(curr.hasAtmPainOrClicking || false);
      setHasTinnitusOrEarRinging(curr.hasTinnitusOrEarRinging || false);
      setEntEvaluated(curr.entEvaluated || false);
      setHasJawFatigueWakingUp(curr.hasJawFatigueWakingUp || false);
      setHasOcclusalDiscomfort(curr.hasOcclusalDiscomfort || false);
      setPainEvaScore(curr.painEvaScore || 0);
      setChiefComplaint(curr.chiefComplaint || '');
      setLastDentalVisit(curr.lastDentalVisit || '');
      setOralHealthRating(curr.oralHealthRating || 'boa');
      setHasAnesthesiaReaction(curr.hasAnesthesiaReaction || false);
      setAnesthesiaReactionDetails(curr.anesthesiaReactionDetails || '');
      setHasGingivalBleeding(curr.hasGingivalBleeding || false);
      setHasToothSensitivity(curr.hasToothSensitivity || false);
      setHasLooseTeeth(curr.hasLooseTeeth || false);
      setDryMouthOrBadTaste(curr.dryMouthOrBadTaste || false);
      setHasFaceOrLipSores(curr.hasFaceOrLipSores || false);
      setUsesDentalProsthesis(curr.usesDentalProsthesis || false);
      setOrthodonticTreatment(curr.orthodonticTreatment || false);
      setBrushingFrequency(curr.brushingFrequency || '3x ao dia');
      setUsesDentalFloss(curr.usesDentalFloss !== undefined ? curr.usesDentalFloss : true);
      setNotes(curr.notes || '');
    }
  }, [isOpen, patient]);

  // Quick vaccine toggle helper
  const addVaccineToStatus = (vacName: string) => {
    const list = vaccinationDetails ? vaccinationDetails.split(',').map(s => s.trim()) : [];
    if (list.includes(vacName)) {
      const filtered = list.filter(item => item !== vacName);
      setVaccinationDetails(filtered.join(', '));
    } else {
      list.push(vacName);
      setVaccinationDetails(list.join(', '));
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedAnamnesis: Anamnesis = {
      // 1. Identificação e Dados Demográficos
      gender,
      ageAndBiologicalSexNotes,
      ethnicity,
      ethnicityDetails,
      profession,
      occupationalRisks,
      currentResidence,
      previousResidence,
      endemicAreaExposure,

      // 2. Histórico Clínico e Imunológico
      hasVaccinationUpToDate,
      vaccinationStatus,
      vaccinationDetails,
      comorbiditiesSummary,
      previousInfectionsHistory,

      // 3. Exposição e Comportamento
      travelHistory,
      closeContactsInfectious,
      closeContactsDetails: closeContactsInfectious ? closeContactsDetails : '',
      lifestyleDiet,
      physicalActivityLevel,
      sexualHealthBehavior,
      environmentalExposure,
      environmentalExposureDetails: environmentalExposure ? environmentalExposureDetails : '',

      // 4. Dados Genéticos e Familiares
      familyMedicalHistory,
      familyHistoryDetails: familyMedicalHistory ? familyHistoryDetails : '',
      geneticMarkers,
      geneticMarkersDetails: geneticMarkers ? geneticMarkersDetails : '',

      // Saúde Geral & Histórico Médico
      hasGoodHealth,
      isUndergoingMedicalTreatment,
      medicalTreatmentDetails: isUndergoingMedicalTreatment ? medicalTreatmentDetails : '',
      hasRheumaticFever,
      hasAsthma,
      hasArthritis,
      hasFaintingSpells,
      hasSinusitis,
      hasHepatitis,
      hasOtherInfections,
      otherInfectionsDetails: hasOtherInfections ? otherInfectionsDetails : '',
      hasRadiationTherapyFaceJaw,
      hasFaceJawTrauma,
      faceJawTraumaDetails: hasFaceJawTrauma ? faceJawTraumaDetails : '',
      hasAdverseDentalReaction,
      adverseDentalReactionDetails: hasAdverseDentalReaction ? adverseDentalReactionDetails : '',
      hasOtherUnlistedDiseases,
      otherUnlistedDiseasesDetails: hasOtherUnlistedDiseases ? otherUnlistedDiseasesDetails : '',
      hasAllergies,
      allergyDetails: hasAllergies ? allergyDetails : '',
      bloodPressureStatus,
      hasHeartDisease,
      hasPacemaker,
      hasShortnessOfBreath,
      hasDiabetes,
      diabetesType: hasDiabetes ? diabetesType : undefined,
      hasHypertension,
      bleedingDisorder,
      bleedingType,
      healingType,
      usesAnticoagulants,
      hasRespiratoryDisease,
      hasRenalOrHepatic,
      hasThyroidDisorder,
      hasSeizures,
      hasCancerHistory,
      usesBisphosphonates,
      hasHadSurgery,
      surgeryDetails: hasHadSurgery ? surgeryDetails : '',
      pastHealthProblems,
      isPregnant,
      pregnancyWeeks: isPregnant ? pregnancyWeeks : '',
      isBreastfeeding,
      climactericOrMenopause,
      hasAndropause,
      andropauseStatus: hasAndropause ? andropauseStatus : 'nenhum',
      andropauseDetails: hasAndropause ? andropauseDetails : '',
      continuousMedication,
      usesHerbalOrSupplements,
      herbalDetails: usesHerbalOrSupplements ? herbalDetails : '',
      generalHealthRating,

      // Hábitos, Estilo de Vida & Sono
      waterIntakeFrequency,
      isSmoker,
      smokingFrequency: isSmoker ? smokingFrequency : undefined,
      smokingDetails: isSmoker ? smokingDetails : '',
      usesRecreationalDrugs,
      drugUsageFrequency: usesRecreationalDrugs ? drugUsageFrequency : undefined,
      drugDetails: usesRecreationalDrugs ? drugDetails : '',
      drugUsageNotes: usesRecreationalDrugs ? drugUsageNotes : '',
      habitsNotes,
      consumesAlcohol,
      hasBruxism,
      nailBitingOrHabits,
      breathingType,
      respiratoryPattern,
      sleepingPosture,
      sleepQuality,
      hasSnoringOrApnea,
      sleepHoursPerNight,
      usesNightGuardOrCpap,
      psychologicalState,

      // DTM & Dor Facial
      hasFaceOrAtmPainLastMonth,
      hasAtmLocking,
      atmLockingDetails: hasAtmLocking ? atmLockingDetails : undefined,
      hasAtmPainOrClicking,
      hasTinnitusOrEarRinging,
      entEvaluated,
      hasJawFatigueWakingUp,
      hasOcclusalDiscomfort,
      painEvaScore,

      // Queixa Principal & Exame
      chiefComplaint,
      lastDentalVisit,
      oralHealthRating,
      hasAnesthesiaReaction,
      anesthesiaReactionDetails: hasAnesthesiaReaction ? anesthesiaReactionDetails : '',
      hasGingivalBleeding,
      hasToothSensitivity,
      hasLooseTeeth,
      dryMouthOrBadTaste,
      hasFaceOrLipSores,
      usesDentalProsthesis,
      orthodonticTreatment,
      brushingFrequency,
      usesDentalFloss,
      notes
    };

    // Salvar documento no histórico de documentos e prontuário do paciente
    try {
      addSavedClinicDocument({
        patientId: patient.id,
        patientName: patient.name,
        patientCpf: patient.cpf,
        patientPhone: patient.phone,
        title: 'Prontuário Médico e Histórico Clínico Completo',
        subtitle: 'Anamnese Geral, Doenças Sistêmicas, Alertas e Hábitos',
        category: 'prontuario',
        templateId: 'prontuario_medico_anamnese',
        date: new Date().toISOString().split('T')[0],
        professionalName: activeProfessional?.name || clinicInfo.dentistName || 'Dr. Hugo Andres',
        professionalCro: activeProfessional?.cro || clinicInfo.cro || 'CRO/CE 5925',
        summary: `Mapeamento e atualização do prontuário médico e histórico clínico de ${patient.name}.`,
        content: JSON.stringify(updatedAnamnesis)
      });
    } catch (e) {
      console.error('Erro ao registrar documento salvo da anamnese:', e);
    }

    onSave(updatedAnamnesis);
    onClose();
  };

  const patientAgeFormatted = calculatePatientAge(patient.birthDate);
  const formattedBirthDate = patient.birthDate 
    ? new Date(patient.birthDate + 'T00:00:00').toLocaleDateString('pt-BR') 
    : 'Não informada';

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 ${t.overlayBg} flex items-center justify-center p-3 sm:p-4 overflow-y-auto`}>
      <div className={`${t.modalBg} border ${t.modalBorder} rounded-[32px] max-w-4xl w-full p-4 sm:p-6 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto my-4`}>
        
        {/* Modal Top Header */}
        <div className={`flex items-center justify-between border-b ${t.modalBorder} pb-3`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl ${t.btnPrimaryBg} ${t.btnPrimaryText} flex items-center justify-center shadow-xs`}>
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h2 className={`text-lg font-bold ${t.modalText}`}>Prontuário Médico e Histórico Clínico Completo</h2>
              <p className={`text-xs ${t.modalMutedText}`}>Mapeamento demográfico, imunológico, epidemiológico e odontológico</p>
            </div>
          </div>

          <button
            onClick={onClose}
            type="button"
            className="p-2 text-gray-400 hover:text-gray-700 rounded-full transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* IDENTIFICAÇÃO CADASTRAL DO PACIENTE (Header Card Solicitado) */}
        <div className="bg-white p-4 rounded-2xl border border-[#e5e5d1] shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#5a5a40] flex items-center gap-1.5">
              <User className="w-4 h-4 text-[#5a5a40]" /> Identificação Cadastral do Paciente
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#f0f0e8] text-[#5a5a40] border border-[#e5e5d1] uppercase">
              {patient.status || 'Ativo'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="bg-[#fbfbf9] p-2.5 rounded-xl border border-[#e5e5d1]/70">
              <span className="text-[10px] font-semibold text-gray-500 block">Nome Completo:</span>
              <strong className="text-gray-900 text-sm">{patient.name}</strong>
            </div>

            <div className="bg-[#fbfbf9] p-2.5 rounded-xl border border-[#e5e5d1]/70">
              <span className="text-[10px] font-semibold text-gray-500 block">Idade / Data de Nascimento:</span>
              <strong className="text-gray-900">{patientAgeFormatted}</strong>
              <span className="text-[11px] text-gray-500 block font-medium">({formattedBirthDate})</span>
            </div>

            <div className="bg-[#fbfbf9] p-2.5 rounded-xl border border-[#e5e5d1]/70">
              <span className="text-[10px] font-semibold text-gray-500 block">Identificação de Gênero / CPF:</span>
              <strong className="text-gray-900 capitalize">{patient.gender || 'Não informado'}</strong>
              <span className="text-[11px] text-gray-500 block font-mono font-medium">{formatCPF(patient.cpf)}</span>
            </div>

            <div className="bg-[#fbfbf9] p-2.5 rounded-xl border border-[#e5e5d1]/70">
              <span className="text-[10px] font-semibold text-gray-500 block">Plano / Carteirinha:</span>
              <strong className="text-[#5a5a40]">{patient.healthInsurance || 'Particular'}</strong>
              <span className="text-[11px] text-gray-500 block">
                {(!patient.healthInsurance || patient.healthInsurance === 'Particular') ? 'Particular (Sem carteirinha)' : `Nº: ${patient.insuranceNumber || 'Não informada'}`}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
            <div className="flex items-center gap-2 text-gray-700 bg-[#fbfbf9] p-2 rounded-xl border border-[#e5e5d1]/70">
              <Phone className="w-3.5 h-3.5 text-[#5a5a40] shrink-0" />
              <span><strong>Telefone/WhatsApp:</strong> {formatPhoneWithDDI(patient.phone)}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700 bg-[#fbfbf9] p-2 rounded-xl border border-[#e5e5d1]/70">
              <MapPin className="w-3.5 h-3.5 text-[#5a5a40] shrink-0" />
              <span className="truncate"><strong>Endereço:</strong> {formatFullAddress(patient.address) || 'Não informado'}</span>
            </div>
          </div>
        </div>

        {/* Live Safety Badge Banner */}
        <div className={`${t.cardBg} p-3.5 rounded-2xl border ${t.cardBorder} space-y-2`}>
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600" /> Resumo de Alertas Médicos & Vigilância
          </span>
          <div className="flex flex-wrap gap-2 text-xs">
            {hasAllergies && (
              <span className="px-3 py-1 bg-rose-100 text-rose-800 border border-rose-300 font-bold rounded-xl flex items-center gap-1">
                🔴 Alergia: {allergyDetails || 'Não informada'}
              </span>
            )}
            {usesBisphosphonates && (
              <span className="px-3 py-1 bg-rose-100 text-rose-900 border border-rose-400 font-bold rounded-xl flex items-center gap-1">
                🔴 BISFOSFONATOS (Risco de Osteonecrose)
              </span>
            )}
            {usesAnticoagulants && (
              <span className="px-3 py-1 bg-rose-100 text-rose-800 border border-rose-300 font-bold rounded-xl flex items-center gap-1">
                🔴 Anticoagulante (Risco Hemorragia)
              </span>
            )}
            {bleedingDisorder && (
              <span className="px-3 py-1 bg-rose-100 text-rose-800 border border-rose-300 font-bold rounded-xl flex items-center gap-1">
                🔴 Distúrbio de Coagulação
              </span>
            )}
            {isPregnant && (
              <span className="px-3 py-1 bg-purple-100 text-purple-900 border border-purple-300 font-bold rounded-xl flex items-center gap-1">
                🟣 Gestante ({pregnancyWeeks || 'Semana não informada'})
              </span>
            )}
            {hasDiabetes && (
              <span className="px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 font-bold rounded-xl flex items-center gap-1">
                🟡 Diabetes ({diabetesType})
              </span>
            )}
            {hasHypertension && (
              <span className="px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 font-bold rounded-xl flex items-center gap-1">
                🟡 Hipertensão Arterial
              </span>
            )}
            {hasHeartDisease && (
              <span className="px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 font-bold rounded-xl flex items-center gap-1">
                🟡 Cardiopatia / Doença Cardíaca
              </span>
            )}
            {closeContactsInfectious && (
              <span className="px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 font-bold rounded-xl flex items-center gap-1">
                ⚠️ Contato Próximo Infectocontagioso
              </span>
            )}
            {environmentalExposure && (
              <span className="px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 font-bold rounded-xl flex items-center gap-1">
                ⚠️ Exposição Ambiental / Vetores
              </span>
            )}
            {geneticMarkers && (
              <span className="px-3 py-1 bg-indigo-100 text-indigo-900 border border-indigo-300 font-bold rounded-xl flex items-center gap-1">
                🧬 Marcador Genético Registrado
              </span>
            )}
            {isSmoker && (
              <span className="px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 font-bold rounded-xl flex items-center gap-1">
                🚬 Fumante ({smokingFrequency === 'vape_eletronico' ? 'Vape/Eletrônico' : smokingFrequency === 'diario_mais_20' ? 'Diário > 20 cig' : 'Tabagista'})
              </span>
            )}
            {usesRecreationalDrugs && (
              <span className="px-3 py-1 bg-rose-100 text-rose-900 border border-rose-300 font-bold rounded-xl flex items-center gap-1">
                ⚠️ Uso de Substâncias / Drogas
              </span>
            )}
            {!hasAllergies && !usesBisphosphonates && !usesAnticoagulants && !isPregnant && !hasDiabetes && !hasHypertension && !hasHeartDisease && !isSmoker && !usesRecreationalDrugs && !closeContactsInfectious && !environmentalExposure && (
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium rounded-xl">
                ✅ Nenhum alerta crítico ativo relatado
              </span>
            )}
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="space-y-6">

          {/* PILAR 1: Identificação e Dados Demográficos (Vigilância & Suscetibilidade) */}
          <div className="bg-[#fbfbf9] p-4 sm:p-5 rounded-2xl border border-[#e5e5d1] space-y-4">
            <h3 className="text-sm font-bold text-[#5a5a40] flex items-center gap-2 border-b border-[#e5e5d1] pb-2">
              <Compass className="w-4 h-4 text-[#5a5a40]" /> 1. Identificação e Dados Demográficos (Vigilância & Suscetibilidade)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Identificação de Gênero */}
              <div className="bg-white p-3.5 rounded-xl border border-[#e5e5d1] space-y-2">
                <label className="block text-xs font-bold text-gray-800">
                  Identificação de Gênero:
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as Gender)}
                  className="w-full text-xs p-2 bg-[#fbfbf9] border border-[#e5e5d1] rounded-lg focus:outline-none font-semibold text-stone-800"
                >
                  <option value="cisgenero">Cisgênero</option>
                  <option value="transgenero">Transgênero</option>
                  <option value="nao_binario">Não-binário</option>
                  <option value="masculino">Masculino</option>
                  <option value="feminino">Feminino</option>
                  <option value="outro">Outro / Prefere não declarar</option>
                </select>
                <input
                  type="text"
                  value={ageAndBiologicalSexNotes}
                  onChange={(e) => setAgeAndBiologicalSexNotes(e.target.value)}
                  placeholder="Anotações e considerações clínicas do paciente..."
                  className="w-full text-xs p-2 bg-[#fbfbf9] border border-[#e5e5d1] rounded-lg focus:outline-none"
                />
              </div>

              {/* Raça / Etnia */}
              <div className="bg-white p-3.5 rounded-xl border border-[#e5e5d1] space-y-2">
                <label className="block text-xs font-bold text-gray-800">
                  Raça / Etnia (Predisposições Genéticas e Étnicas):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <select
                    value={ethnicity}
                    onChange={(e) => setEthnicity(e.target.value as any)}
                    className="w-full text-xs p-2 bg-[#fbfbf9] border border-[#e5e5d1] rounded-lg focus:outline-none"
                  >
                    <option value="branca">Branca</option>
                    <option value="preta">Preta</option>
                    <option value="parda">Parda</option>
                    <option value="amarela">Amarela / Asiática</option>
                    <option value="indigena">Indígena</option>
                    <option value="outra">Outra</option>
                  </select>
                  <input
                    type="text"
                    value={ethnicityDetails}
                    onChange={(e) => setEthnicityDetails(e.target.value)}
                    placeholder="Ex: Traço falciforme, histórico étnico..."
                    className="w-full text-xs p-2 bg-[#fbfbf9] border border-[#e5e5d1] rounded-lg focus:outline-none"
                  />
                </div>
                <p className="text-[10px] text-gray-400">Importante para predisposições genéticas específicas (ex: anemia falciforme, hipertensão precoce).</p>
              </div>

              {/* Profissão / Ocupação */}
              <div className="bg-white p-3.5 rounded-xl border border-[#e5e5d1] space-y-2">
                <label className="block text-xs font-bold text-gray-800 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-[#5a5a40]" /> Profissão / Ocupação & Riscos Ocupacionais:
                </label>
                <div className="space-y-2">
                  <div className="space-y-1">
                    <span className="text-[11px] font-semibold text-gray-600 block">Profissão / Ocupação (Ordem Alfabética):</span>
                    <select
                      value={COMMON_PROFESSIONS.includes(profession) ? profession : (profession ? 'Outra Profissão / Ocupação' : '')}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val !== 'Outra Profissão / Ocupação') {
                          setProfession(val);
                        }
                      }}
                      className="w-full text-xs p-2 bg-[#fbfbf9] border border-[#e5e5d1] rounded-lg focus:outline-none font-medium text-gray-800 cursor-pointer"
                    >
                      <option value="">Selecione a profissão / ocupação...</option>
                      {COMMON_PROFESSIONS.map((prof) => (
                        <option key={prof} value={prof}>
                          {prof}
                        </option>
                      ))}
                    </select>

                    <input
                      type="text"
                      value={profession}
                      onChange={(e) => setProfession(e.target.value)}
                      placeholder="Ou digite/especifique a profissão do paciente..."
                      className="w-full text-xs p-2 bg-[#fbfbf9] border border-[#e5e5d1] rounded-lg focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1 pt-1 border-t border-gray-100">
                    <span className="text-[11px] font-semibold text-gray-600 block">Riscos Ocupacionais (Ordem Alfabética):</span>
                    <select
                      value={COMMON_OCCUPATIONAL_RISKS.includes(occupationalRisks) ? occupationalRisks : ''}
                      onChange={(e) => {
                        if (e.target.value) {
                          setOccupationalRisks(e.target.value);
                        }
                      }}
                      className="w-full text-xs p-2 bg-[#fbfbf9] border border-[#e5e5d1] rounded-lg focus:outline-none text-gray-700 cursor-pointer"
                    >
                      <option value="">Selecione risco ocupacional pré-definido...</option>
                      {COMMON_OCCUPATIONAL_RISKS.map((risk) => (
                        <option key={risk} value={risk}>
                          {risk}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={occupationalRisks}
                      onChange={(e) => setOccupationalRisks(e.target.value)}
                      placeholder="Especifique outros riscos de exposição (agentes químicos, poeiras, radiação, ruído, ergonomia)..."
                      className="w-full text-xs p-2 bg-[#fbfbf9] border border-[#e5e5d1] rounded-lg focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Local de residência atual e anterior */}
              <div className="bg-white p-3.5 rounded-xl border border-[#e5e5d1] space-y-2">
                <label className="block text-xs font-bold text-gray-800 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#5a5a40]" /> Local de Residência (Atual e Anterior / Áreas Endêmicas):
                </label>
                <div className="space-y-1.5">
                  <input
                    type="text"
                    value={currentResidence}
                    onChange={(e) => setCurrentResidence(e.target.value)}
                    placeholder="Residência atual (Cidade, Estado, Região)..."
                    className="w-full text-xs p-2 bg-[#fbfbf9] border border-[#e5e5d1] rounded-lg focus:outline-none"
                  />
                  <input
                    type="text"
                    value={previousResidence}
                    onChange={(e) => setPreviousResidence(e.target.value)}
                    placeholder="Residências anteriores nos últimos anos..."
                    className="w-full text-xs p-2 bg-[#fbfbf9] border border-[#e5e5d1] rounded-lg focus:outline-none"
                  />
                  <input
                    type="text"
                    value={endemicAreaExposure}
                    onChange={(e) => setEndemicAreaExposure(e.target.value)}
                    placeholder="Proximidade com áreas endêmicas (dengue, malária, febre amarela, chagas, poluição)..."
                    className="w-full text-xs p-2 bg-[#fbfbf9] border border-[#e5e5d1] rounded-lg focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* PILAR 2: Histórico Clínico e Imunológico */}
          <div className="bg-[#fbfbf9] p-4 sm:p-5 rounded-2xl border border-[#e5e5d1] space-y-4">
            <h3 className="text-sm font-bold text-[#5a5a40] flex items-center gap-2 border-b border-[#e5e5d1] pb-2">
              <Syringe className="w-4 h-4 text-emerald-600" /> 2. Histórico Clínico e Imunológico
            </h3>

            {/* Status Vacinal */}
            <div className="bg-white p-3.5 rounded-xl border border-[#e5e5d1] space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                  <Syringe className="w-3.5 h-3.5 text-emerald-600" /> Status Vacinal Completo ao Longo da Vida:
                </label>
                <label className="flex items-center gap-1.5 text-xs text-gray-700 cursor-pointer font-semibold">
                  <input
                    type="checkbox"
                    checked={hasVaccinationUpToDate}
                    onChange={(e) => setHasVaccinationUpToDate(e.target.checked)}
                    className="rounded text-[#5a5a40]"
                  />
                  <span>Vacinação em Dia</span>
                </label>
              </div>

              {/* Quick Vaccine Badges */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {['COVID-19', 'Tétano (DTPa)', 'Hepatite B', 'Febre Amarela', 'Influenza (Gripe)', 'Tríplice Viral', 'HPV'].map((vac) => {
                  const isSelected = vaccinationDetails.includes(vac);
                  return (
                    <button
                      key={vac}
                      type="button"
                      onClick={() => addVaccineToStatus(vac)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer border ${
                        isSelected 
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                          : 'bg-[#fbfbf9] text-gray-600 border-[#e5e5d1] hover:bg-gray-100'
                      }`}
                    >
                      {isSelected ? `✓ ${vac}` : `+ ${vac}`}
                    </button>
                  );
                })}
              </div>

              <input
                type="text"
                value={vaccinationDetails}
                onChange={(e) => setVaccinationDetails(e.target.value)}
                placeholder="Registro de vacinas tomadas, doses, reforços ou pendências..."
                className="w-full text-xs p-2 bg-[#fbfbf9] border border-[#e5e5d1] rounded-lg focus:outline-none"
              />
            </div>

            {/* Infecções Anteriores */}
            <div className="bg-white p-3.5 rounded-xl border border-[#e5e5d1] space-y-2">
              <label className="block text-xs font-bold text-gray-800">
                Histórico de Infecções Anteriores & Sequelas:
              </label>
              <textarea
                rows={2}
                value={previousInfectionsHistory}
                onChange={(e) => setPreviousInfectionsHistory(e.target.value)}
                placeholder="Doenças que já teve (Covid-19, catapora/varicela, dengue, tuberculose, hepatites, chikungunya, sequelas)..."
                className="w-full text-xs p-2 bg-[#fbfbf9] border border-[#e5e5d1] rounded-lg focus:outline-none"
              />
            </div>
          </div>

          {/* PILAR 3: Exposição e Comportamento (Vigilância) */}
          <div className="bg-[#fbfbf9] p-4 sm:p-5 rounded-2xl border border-[#e5e5d1] space-y-4">
            <h3 className="text-sm font-bold text-[#5a5a40] flex items-center gap-2 border-b border-[#e5e5d1] pb-2">
              <Plane className="w-4 h-4 text-blue-600" /> 3. Exposição e Comportamento (Vigilância Epidemiológica & Estilo de Vida)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Histórico de Viagens */}
              <div className="bg-white p-3.5 rounded-xl border border-[#e5e5d1] space-y-2">
                <label className="block text-xs font-bold text-gray-800 flex items-center gap-1.5">
                  <Plane className="w-3.5 h-3.5 text-blue-600" /> Histórico de Viagens Recentes (Últimos Meses):
                </label>
                <input
                  type="text"
                  value={travelHistory}
                  onChange={(e) => setTravelHistory(e.target.value)}
                  placeholder="Cidades, estados ou países visitados (identificação de doenças importadas e zonas de risco)..."
                  className="w-full text-xs p-2 bg-[#fbfbf9] border border-[#e5e5d1] rounded-lg focus:outline-none"
                />
              </div>

              {/* Contatos Próximos */}
              <div className="bg-white p-3.5 rounded-xl border border-[#e5e5d1] space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-amber-600" /> Contatos Próximos Infectocontagiosos:
                  </label>
                  <label className="flex items-center gap-1 text-xs cursor-pointer font-medium">
                    <input
                      type="checkbox"
                      checked={closeContactsInfectious}
                      onChange={(e) => setCloseContactsInfectious(e.target.checked)}
                      className="rounded text-[#5a5a40]"
                    />
                    <span>Sim</span>
                  </label>
                </div>
                {closeContactsInfectious ? (
                  <input
                    type="text"
                    value={closeContactsDetails}
                    onChange={(e) => setCloseContactsDetails(e.target.value)}
                    placeholder="Convivência com pessoas que testaram positivo para doenças transmissíveis (Covid, Tuberculose, etc)..."
                    className="w-full text-xs p-2 bg-amber-50/60 border border-amber-300 rounded-lg focus:outline-none"
                  />
                ) : (
                  <p className="text-[10px] text-gray-400">Nenhum contato próximo com portadores de doenças infectocontagiosas relatado.</p>
                )}
              </div>

              {/* Estilo de Vida: Dieta, Hidratação & Atividade Física */}
              <div className="bg-white p-3.5 rounded-xl border border-[#e5e5d1] space-y-2.5">
                <label className="block text-xs font-bold text-gray-800">
                  Estilo de Vida (Dieta, Hidratação & Atividade Física):
                </label>
                
                {/* Consumo de Água / Hidratação */}
                <div className="bg-sky-50/70 p-2.5 rounded-lg border border-sky-200 space-y-1.5">
                  <label className="block text-[11px] font-bold text-sky-900">
                    💧 Bebe Água (Frequência de Ingestão Diária):
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { val: 'baixa', label: 'Baixa', desc: '< 1L/dia' },
                      { val: 'normal', label: 'Normal', desc: '1,5 - 2,5L/dia' },
                      { val: 'alta', label: 'Alta', desc: '> 2,5L/dia' }
                    ].map((opt) => (
                      <button
                        key={opt.val}
                        type="button"
                        onClick={() => setWaterIntakeFrequency(opt.val as any)}
                        className={`py-1.5 px-2 rounded-lg text-xs font-semibold text-center border transition-all ${
                          waterIntakeFrequency === opt.val
                            ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                            : 'bg-white text-gray-700 border-sky-200 hover:bg-sky-100/60'
                        }`}
                      >
                        <div>{opt.label}</div>
                        <div className={`text-[10px] font-normal ${waterIntakeFrequency === opt.val ? 'text-sky-100' : 'text-gray-500'}`}>
                          {opt.desc}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <select
                    value={physicalActivityLevel}
                    onChange={(e) => setPhysicalActivityLevel(e.target.value as any)}
                    className="w-full text-xs p-2 bg-[#fbfbf9] border border-[#e5e5d1] rounded-lg focus:outline-none"
                  >
                    <option value="sedentario">Sedentário</option>
                    <option value="leve">Atividade Leve (1-2x/sem)</option>
                    <option value="moderado">Atividade Moderada (3-4x/sem)</option>
                    <option value="intenso">Atividade Intensa / Atleta</option>
                  </select>
                  <input
                    type="text"
                    value={lifestyleDiet}
                    onChange={(e) => setLifestyleDiet(e.target.value)}
                    placeholder="Hábitos alimentares / dieta (ex: vegetariana, rica em açúcares)..."
                    className="w-full text-xs p-2 bg-[#fbfbf9] border border-[#e5e5d1] rounded-lg focus:outline-none"
                  />
                </div>
                <input
                  type="text"
                  value={sexualHealthBehavior}
                  onChange={(e) => setSexualHealthBehavior(e.target.value)}
                  placeholder="Comportamento de saúde e prevenção (opcional)..."
                  className="w-full text-xs p-2 bg-[#fbfbf9] border border-[#e5e5d1] rounded-lg focus:outline-none"
                />
              </div>

              {/* Exposição Ambiental */}
              <div className="bg-white p-3.5 rounded-xl border border-[#e5e5d1] space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-800">
                    Exposição Ambiental (Água não tratada, Vetores, Esgoto aberto):
                  </label>
                  <label className="flex items-center gap-1 text-xs cursor-pointer font-medium">
                    <input
                      type="checkbox"
                      checked={environmentalExposure}
                      onChange={(e) => setEnvironmentalExposure(e.target.checked)}
                      className="rounded text-[#5a5a40]"
                    />
                    <span>Sim</span>
                  </label>
                </div>
                {environmentalExposure ? (
                  <input
                    type="text"
                    value={environmentalExposureDetails}
                    onChange={(e) => setEnvironmentalExposureDetails(e.target.value)}
                    placeholder="Contato com água contaminada, vetores (mosquitos, barbeiros), animais silvestres, esgoto aberto..."
                    className="w-full text-xs p-2 bg-amber-50/60 border border-amber-300 rounded-lg focus:outline-none"
                  />
                ) : (
                  <p className="text-[10px] text-gray-400">Sem histórico de exposição ambiental de risco.</p>
                )}
              </div>
            </div>
          </div>

          {/* PILAR 4: Dados Genéticos e Familiares */}
          <div className="bg-[#fbfbf9] p-4 sm:p-5 rounded-2xl border border-[#e5e5d1] space-y-4">
            <h3 className="text-sm font-bold text-[#5a5a40] flex items-center gap-2 border-b border-[#e5e5d1] pb-2">
              <Dna className="w-4 h-4 text-purple-600" /> 4. Dados Genéticos e Familiares
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Histórico Familiar (1º Grau) */}
              <div className="bg-white p-3.5 rounded-xl border border-[#e5e5d1] space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-800">
                    Histórico Familiar (1º Grau - Pais/Irmãos):
                  </label>
                  <label className="flex items-center gap-1 text-xs cursor-pointer font-medium">
                    <input
                      type="checkbox"
                      checked={familyMedicalHistory}
                      onChange={(e) => setFamilyMedicalHistory(e.target.checked)}
                      className="rounded text-[#5a5a40]"
                    />
                    <span>Sim</span>
                  </label>
                </div>
                <input
                  type="text"
                  value={familyHistoryDetails}
                  onChange={(e) => setFamilyHistoryDetails(e.target.value)}
                  placeholder="Presença de doenças hereditárias ou crônicas (infarto precoce, diabetes, câncer, trombose)..."
                  className="w-full text-xs p-2 bg-[#fbfbf9] border border-[#e5e5d1] rounded-lg focus:outline-none"
                />
              </div>

              {/* Marcadores Genéticos */}
              <div className="bg-white p-3.5 rounded-xl border border-[#e5e5d1] space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                    <Dna className="w-3.5 h-3.5 text-purple-600" /> Marcadores Genéticos & Predisposições:
                  </label>
                  <label className="flex items-center gap-1 text-xs cursor-pointer font-medium">
                    <input
                      type="checkbox"
                      checked={geneticMarkers}
                      onChange={(e) => setGeneticMarkers(e.target.checked)}
                      className="rounded text-purple-600"
                    />
                    <span>Sim</span>
                  </label>
                </div>
                {geneticMarkers ? (
                  <input
                    type="text"
                    value={geneticMarkersDetails}
                    onChange={(e) => setGeneticMarkersDetails(e.target.value)}
                    placeholder="Mutações conhecidas, painel genético, predisposições (BRCA, trombofilia, coagulopatias)..."
                    className="w-full text-xs p-2 bg-purple-50/60 border border-purple-300 rounded-lg focus:outline-none"
                  />
                ) : (
                  <p className="text-[10px] text-gray-400">Nenhum marcador genético ou teste molecular específico informado.</p>
                )}
              </div>
            </div>
          </div>

          {/* SEÇÃO 5: Questionário Clínico Diagnóstico & Saúde Geral */}
          <div className="bg-[#fbfbf9] p-4 sm:p-5 rounded-2xl border border-[#e5e5d1] space-y-4">
            <h3 className="text-sm font-bold text-[#5a5a40] flex items-center gap-2 border-b border-[#e5e5d1] pb-2">
              <Heart className="w-4 h-4 text-rose-500" /> 5. Avaliação da Saúde Geral & Questionário Sistêmico Odontológico
            </h3>

            {/* Questions: Boa Saúde & Tratamento Médico Atual */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-4 rounded-2xl border border-[#e5e5d1]">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-800">Você goza de boa saúde?</label>
                <div className="flex items-center gap-4 text-xs">
                  <label className="flex items-center gap-1.5 cursor-pointer font-medium">
                    <input
                      type="radio"
                      name="hasGoodHealth"
                      checked={hasGoodHealth === true}
                      onChange={() => setHasGoodHealth(true)}
                      className="text-[#5a5a40] focus:ring-0"
                    />
                    <span>Sim</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer font-medium">
                    <input
                      type="radio"
                      name="hasGoodHealth"
                      checked={hasGoodHealth === false}
                      onChange={() => setHasGoodHealth(false)}
                      className="text-[#5a5a40] focus:ring-0"
                    />
                    <span>Não</span>
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-800">Está atualmente fazendo algum tratamento médico?</label>
                <div className="flex items-center gap-4 text-xs">
                  <label className="flex items-center gap-1.5 cursor-pointer font-medium">
                    <input
                      type="radio"
                      name="isUndergoingMedicalTreatment"
                      checked={isUndergoingMedicalTreatment === true}
                      onChange={() => setIsUndergoingMedicalTreatment(true)}
                      className="text-[#5a5a40] focus:ring-0"
                    />
                    <span>Sim</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer font-medium">
                    <input
                      type="radio"
                      name="isUndergoingMedicalTreatment"
                      checked={isUndergoingMedicalTreatment === false}
                      onChange={() => setIsUndergoingMedicalTreatment(false)}
                      className="text-[#5a5a40] focus:ring-0"
                    />
                    <span>Não</span>
                  </label>
                </div>
              </div>
            </div>

            {isUndergoingMedicalTreatment && (
              <div className="bg-blue-50 p-3 rounded-xl border border-blue-200">
                <label className="block text-xs font-semibold text-blue-900 mb-1">Qual tratamento médico e médico responsável?</label>
                <input
                  type="text"
                  value={medicalTreatmentDetails}
                  onChange={(e) => setMedicalTreatmentDetails(e.target.value)}
                  placeholder="Ex: Tratamento cardiológico com Dr. Silva; fisioterapia respiratória"
                  className="w-full text-xs p-2 bg-white border border-blue-300 rounded-lg focus:outline-none"
                />
              </div>
            )}

            {/* Doenças Preexistentes (Checkboxes) */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-800">
                Você tem ou já teve alguma das seguintes condições?
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer bg-white p-2.5 rounded-xl border border-[#e5e5d1] hover:border-gray-400 transition">
                  <input
                    type="checkbox"
                    checked={hasHeartDisease}
                    onChange={(e) => setHasHeartDisease(e.target.checked)}
                    className="rounded text-[#5a5a40] focus:ring-0"
                  />
                  <span>Doença Cardíaca / Infarto</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer bg-white p-2.5 rounded-xl border border-[#e5e5d1] hover:border-gray-400 transition">
                  <input
                    type="checkbox"
                    checked={hasRheumaticFever}
                    onChange={(e) => setHasRheumaticFever(e.target.checked)}
                    className="rounded text-[#5a5a40] focus:ring-0"
                  />
                  <span>Febre Reumática</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer bg-white p-2.5 rounded-xl border border-[#e5e5d1] hover:border-gray-400 transition">
                  <input
                    type="checkbox"
                    checked={hasAsthma}
                    onChange={(e) => setHasAsthma(e.target.checked)}
                    className="rounded text-[#5a5a40] focus:ring-0"
                  />
                  <span>Asma / Bronquite</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer bg-white p-2.5 rounded-xl border border-[#e5e5d1] hover:border-gray-400 transition">
                  <input
                    type="checkbox"
                    checked={hasArthritis}
                    onChange={(e) => setHasArthritis(e.target.checked)}
                    className="rounded text-[#5a5a40] focus:ring-0"
                  />
                  <span>Artrite / Reumatismo</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer bg-white p-2.5 rounded-xl border border-[#e5e5d1] hover:border-gray-400 transition">
                  <input
                    type="checkbox"
                    checked={hasFaintingSpells}
                    onChange={(e) => setHasFaintingSpells(e.target.checked)}
                    className="rounded text-[#5a5a40] focus:ring-0"
                  />
                  <span>Desmaios / Síncope</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer bg-white p-2.5 rounded-xl border border-[#e5e5d1] hover:border-gray-400 transition">
                  <input
                    type="checkbox"
                    checked={hasSinusitis}
                    onChange={(e) => setHasSinusitis(e.target.checked)}
                    className="rounded text-[#5a5a40] focus:ring-0"
                  />
                  <span>Sinusite Frequente</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer bg-white p-2.5 rounded-xl border border-[#e5e5d1] hover:border-gray-400 transition">
                  <input
                    type="checkbox"
                    checked={hasHepatitis}
                    onChange={(e) => setHasHepatitis(e.target.checked)}
                    className="rounded text-[#5a5a40] focus:ring-0"
                  />
                  <span>Hepatite (A, B, C)</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer bg-white p-2.5 rounded-xl border border-[#e5e5d1] hover:border-gray-400 transition">
                  <input
                    type="checkbox"
                    checked={hasOtherInfections}
                    onChange={(e) => setHasOtherInfections(e.target.checked)}
                    className="rounded text-[#5a5a40] focus:ring-0"
                  />
                  <span>Outras Infecções</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer bg-white p-2.5 rounded-xl border border-[#e5e5d1] hover:border-gray-400 transition">
                  <input
                    type="checkbox"
                    checked={hasHypertension}
                    onChange={(e) => setHasHypertension(e.target.checked)}
                    className="rounded text-[#5a5a40] focus:ring-0"
                  />
                  <span className="text-amber-800 font-semibold">Hipertensão Arterial</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer bg-white p-2.5 rounded-xl border border-[#e5e5d1] hover:border-gray-400 transition">
                  <input
                    type="checkbox"
                    checked={hasDiabetes}
                    onChange={(e) => setHasDiabetes(e.target.checked)}
                    className="rounded text-[#5a5a40] focus:ring-0"
                  />
                  <span className="text-amber-800 font-semibold">Diabetes</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer bg-white p-2.5 rounded-xl border border-[#e5e5d1] hover:border-gray-400 transition">
                  <input
                    type="checkbox"
                    checked={hasAllergies}
                    onChange={(e) => setHasAllergies(e.target.checked)}
                    className="rounded text-[#5a5a40] focus:ring-0"
                  />
                  <span className="text-rose-700 font-semibold">Alergias Medicamentosas</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer bg-white p-2.5 rounded-xl border border-[#e5e5d1] hover:border-gray-400 transition">
                  <input
                    type="checkbox"
                    checked={bleedingDisorder}
                    onChange={(e) => setBleedingDisorder(e.target.checked)}
                    className="rounded text-[#5a5a40] focus:ring-0"
                  />
                  <span className="text-rose-700 font-semibold">Distúrbio Coagulação</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer bg-white p-2.5 rounded-xl border border-[#e5e5d1] hover:border-gray-400 transition">
                  <input
                    type="checkbox"
                    checked={usesAnticoagulants}
                    onChange={(e) => setUsesAnticoagulants(e.target.checked)}
                    className="rounded text-[#5a5a40] focus:ring-0"
                  />
                  <span className="text-rose-700 font-semibold">Usa Anticoagulantes</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer bg-white p-2.5 rounded-xl border border-[#e5e5d1] hover:border-gray-400 transition">
                  <input
                    type="checkbox"
                    checked={usesBisphosphonates}
                    onChange={(e) => setUsesBisphosphonates(e.target.checked)}
                    className="rounded text-[#5a5a40] focus:ring-0"
                  />
                  <span className="text-rose-800 font-semibold">Bisfosfonatos</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer bg-white p-2.5 rounded-xl border border-[#e5e5d1] hover:border-gray-400 transition">
                  <input
                    type="checkbox"
                    checked={hasCancerHistory}
                    onChange={(e) => setHasCancerHistory(e.target.checked)}
                    className="rounded text-[#5a5a40] focus:ring-0"
                  />
                  <span>Câncer / Quimioterapia</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer bg-white p-2.5 rounded-xl border border-[#e5e5d1] hover:border-gray-400 transition">
                  <input
                    type="checkbox"
                    checked={hasHadSurgery}
                    onChange={(e) => setHasHadSurgery(e.target.checked)}
                    className="rounded text-[#5a5a40] focus:ring-0"
                  />
                  <span>Cirurgias / Internações</span>
                </label>
              </div>
            </div>

            {hasHadSurgery && (
              <div className="bg-blue-50/90 p-3.5 rounded-xl border-2 border-blue-300 space-y-2.5 animate-fadeIn shadow-xs">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-blue-900 flex items-center gap-1.5">
                    🏥 Quais cirurgias ou internações?
                  </label>
                  <span className="text-[10px] text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-md font-medium">
                    Histórico Cirúrgico e Hospitalar
                  </span>
                </div>
                
                {/* Sugestões rápidas de cirurgias */}
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Apendicectomia',
                    'Cirurgia Cardíaca / Stent',
                    'Colecistectomia (Vesícula)',
                    'Cesariana / Parto Cirúrgico',
                    'Cirurgia Ortopédica / Prótese',
                    'Internação em UTI',
                    'Cirurgia Bucomaxilofacial',
                    'Amigdalectomia / Adenoide'
                  ].map((surg) => (
                    <button
                      key={surg}
                      type="button"
                      onClick={() => {
                        if (!surgeryDetails.includes(surg)) {
                          setSurgeryDetails(surgeryDetails ? `${surgeryDetails}, ${surg}` : surg);
                        }
                      }}
                      className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-white text-blue-800 border border-blue-200 hover:bg-blue-100 transition cursor-pointer"
                    >
                      + {surg}
                    </button>
                  ))}
                </div>

                <textarea
                  rows={2}
                  value={surgeryDetails}
                  onChange={(e) => setSurgeryDetails(e.target.value)}
                  placeholder="Descreva o procedimento cirúrgico, motivo da internação, ano/data aproximada e se houve intercorrências..."
                  className="w-full text-xs p-2.5 bg-white border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            )}

            {hasOtherInfections && (
              <div className="bg-amber-50 p-3 rounded-xl border border-amber-200">
                <label className="block text-xs font-semibold text-amber-900 mb-1">Especifique as outras infecções:</label>
                <input
                  type="text"
                  value={otherInfectionsDetails}
                  onChange={(e) => setOtherInfectionsDetails(e.target.value)}
                  placeholder="Ex: Tuberculose, IST, Mononucleose..."
                  className="w-full text-xs p-2 bg-white border border-amber-300 rounded-lg focus:outline-none"
                />
              </div>
            )}

            {/* Traumatismos, Raios-X e Reação Odontológica */}
            <div className="space-y-3 pt-2">
              <div className="bg-white p-3.5 rounded-xl border border-[#e5e5d1] space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-xs font-bold text-gray-800">
                    Você já sofreu tratamento pelos raios-X, na face ou nos maxilares (Radioterapia)?
                  </label>
                  <div className="flex items-center gap-4 text-xs">
                    <label className="flex items-center gap-1 cursor-pointer font-medium text-rose-700">
                      <input
                        type="radio"
                        name="hasRadiationTherapyFaceJaw"
                        checked={hasRadiationTherapyFaceJaw === true}
                        onChange={() => setHasRadiationTherapyFaceJaw(true)}
                        className="text-rose-600 focus:ring-0"
                      />
                      <span>Sim</span>
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer font-medium">
                      <input
                        type="radio"
                        name="hasRadiationTherapyFaceJaw"
                        checked={hasRadiationTherapyFaceJaw === false}
                        onChange={() => setHasRadiationTherapyFaceJaw(false)}
                        className="text-[#5a5a40] focus:ring-0"
                      />
                      <span>Não</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-[#e5e5d1] space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-xs font-bold text-gray-800">
                    Você já sofreu algum traumatismo na face ou nos maxilares?
                  </label>
                  <div className="flex items-center gap-4 text-xs">
                    <label className="flex items-center gap-1 cursor-pointer font-medium text-amber-700">
                      <input
                        type="radio"
                        name="hasFaceJawTrauma"
                        checked={hasFaceJawTrauma === true}
                        onChange={() => setHasFaceJawTrauma(true)}
                        className="text-amber-600 focus:ring-0"
                      />
                      <span>Sim</span>
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer font-medium">
                      <input
                        type="radio"
                        name="hasFaceJawTrauma"
                        checked={hasFaceJawTrauma === false}
                        onChange={() => setHasFaceJawTrauma(false)}
                        className="text-[#5a5a40] focus:ring-0"
                      />
                      <span>Não</span>
                    </label>
                  </div>
                </div>
                {hasFaceJawTrauma && (
                  <input
                    type="text"
                    value={faceJawTraumaDetails}
                    onChange={(e) => setFaceJawTraumaDetails(e.target.value)}
                    placeholder="Se afirmativo, quando e como ocorreu o traumatismo?"
                    className="w-full text-xs p-2 bg-amber-50/50 border border-amber-300 rounded-lg focus:outline-none"
                  />
                )}
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-[#e5e5d1] space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-xs font-bold text-gray-800">
                    Você já teve alguma reação desfavorável ao tratamento dentário?
                  </label>
                  <div className="flex items-center gap-4 text-xs">
                    <label className="flex items-center gap-1 cursor-pointer font-medium text-rose-700">
                      <input
                        type="radio"
                        name="hasAdverseDentalReaction"
                        checked={hasAdverseDentalReaction === true}
                        onChange={() => setHasAdverseDentalReaction(true)}
                        className="text-rose-600 focus:ring-0"
                      />
                      <span>Sim</span>
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer font-medium">
                      <input
                        type="radio"
                        name="hasAdverseDentalReaction"
                        checked={hasAdverseDentalReaction === false}
                        onChange={() => setHasAdverseDentalReaction(false)}
                        className="text-[#5a5a40] focus:ring-0"
                      />
                      <span>Não</span>
                    </label>
                  </div>
                </div>
                {hasAdverseDentalReaction && (
                  <input
                    type="text"
                    value={adverseDentalReactionDetails}
                    onChange={(e) => setAdverseDentalReactionDetails(e.target.value)}
                    placeholder="Se afirmativo, descreva o que aconteceu (ex: síncope por anestésico, dor intensa, náusea)..."
                    className="w-full text-xs p-2 bg-rose-50/50 border border-rose-300 rounded-lg focus:outline-none"
                  />
                )}
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-[#e5e5d1] space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-xs font-bold text-gray-800">
                    Você tem qualquer enfermidade não-relacionada aqui?
                  </label>
                  <div className="flex items-center gap-4 text-xs">
                    <label className="flex items-center gap-1 cursor-pointer font-medium text-amber-700">
                      <input
                        type="radio"
                        name="hasOtherUnlistedDiseases"
                        checked={hasOtherUnlistedDiseases === true}
                        onChange={() => setHasOtherUnlistedDiseases(true)}
                        className="text-amber-600 focus:ring-0"
                      />
                      <span>Sim</span>
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer font-medium">
                      <input
                        type="radio"
                        name="hasOtherUnlistedDiseases"
                        checked={hasOtherUnlistedDiseases === false}
                        onChange={() => setHasOtherUnlistedDiseases(false)}
                        className="text-[#5a5a40] focus:ring-0"
                      />
                      <span>Não</span>
                    </label>
                  </div>
                </div>
                {hasOtherUnlistedDiseases && (
                  <input
                    type="text"
                    value={otherUnlistedDiseasesDetails}
                    onChange={(e) => setOtherUnlistedDiseasesDetails(e.target.value)}
                    placeholder="Se afirmativo, especifique a enfermidade..."
                    className="w-full text-xs p-2 bg-amber-50/50 border border-amber-300 rounded-lg focus:outline-none"
                  />
                )}
              </div>
            </div>

            {/* Conditional Subfields */}
            {hasAllergies && (
              <div className="bg-rose-50 p-3 rounded-xl border border-rose-200">
                <label className="block text-xs font-semibold text-rose-900 mb-1">Especifique as alergias (Penicilina, Anestésicos, Látex, AINEs):</label>
                <input
                  type="text"
                  value={allergyDetails}
                  onChange={(e) => setAllergyDetails(e.target.value)}
                  placeholder="Ex: Alergia a Penicilina e Dipirona"
                  className="w-full text-xs p-2 bg-white border border-rose-300 rounded-lg focus:outline-none"
                />
              </div>
            )}

            {/* Cicatrização e Sangramento */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Como é a sua cicatrização?</label>
                <select
                  value={healingType}
                  onChange={(e) => setHealingType(e.target.value as any)}
                  className="w-full text-xs p-2.5 bg-white border border-[#e5e5d1] rounded-xl focus:outline-none"
                >
                  <option value="normal">Normal</option>
                  <option value="complicada">Complicada / Difícil / Queloide</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Quando se corta, o sangramento é:</label>
                <select
                  value={bleedingType}
                  onChange={(e) => setBleedingType(e.target.value as any)}
                  className="w-full text-xs p-2.5 bg-white border border-[#e5e5d1] rounded-xl focus:outline-none"
                >
                  <option value="normal">Normal</option>
                  <option value="excessivo">Excessivo / Demorado para estancar</option>
                </select>
              </div>
            </div>

            {/* Gestação & Hormonal Feminino */}
            {(patient.gender === 'feminino' || !patient.gender) && (
              <div className="bg-purple-50/70 p-3 rounded-xl border border-purple-200 space-y-3">
                <span className="text-xs font-bold text-purple-900 flex items-center gap-1">
                  🌸 Condições Hormonais & Gestação (Feminino)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <label className="flex items-center gap-2 text-xs text-purple-900 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isPregnant}
                      onChange={(e) => setIsPregnant(e.target.checked)}
                      className="rounded text-purple-700 focus:ring-0"
                    />
                    <span>Gestante</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs text-purple-900 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isBreastfeeding}
                      onChange={(e) => setIsBreastfeeding(e.target.checked)}
                      className="rounded text-purple-700 focus:ring-0"
                    />
                    <span>Amamentando</span>
                  </label>

                  <div>
                    <label className="block text-[10px] font-semibold text-purple-900 mb-0.5">Status Hormonal / Climatério:</label>
                    <select
                      value={climactericOrMenopause}
                      onChange={(e) => setClimactericOrMenopause(e.target.value as any)}
                      className="w-full text-xs p-1.5 bg-white border border-purple-200 rounded-lg text-purple-900 font-medium"
                    >
                      <option value="nenhum">Sem menopausa</option>
                      <option value="climaterio">Em climatério</option>
                      <option value="menopausa">Em menopausa</option>
                      <option value="pos_menopausa">Pós-menopausa</option>
                    </select>
                  </div>
                </div>

                {isPregnant && (
                  <div>
                    <label className="block text-xs font-semibold text-purple-900 mb-1">Tempo de Gestação (Semanas / Trimestre):</label>
                    <input
                      type="text"
                      value={pregnancyWeeks}
                      onChange={(e) => setPregnancyWeeks(e.target.value)}
                      placeholder="Ex: 18 semanas (2º Trimestre)"
                      className="w-full text-xs p-2 bg-white border border-purple-300 rounded-lg focus:outline-none"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Andropausa & Hormonal Masculino */}
            {(patient.gender === 'masculino' || !patient.gender || hasAndropause) && (
              <div className="bg-blue-50/70 p-3 rounded-xl border border-blue-200 space-y-3">
                <span className="text-xs font-bold text-blue-900 flex items-center gap-1">
                  🔷 Saúde Hormonal Masculina & Andropausa (DAEM)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="flex items-center gap-2 text-xs text-blue-900 font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasAndropause}
                      onChange={(e) => setHasAndropause(e.target.checked)}
                      className="rounded text-blue-700 focus:ring-0"
                    />
                    <span>Diagnóstico ou sintomas de Andropausa / Baixa de Testosterona</span>
                  </label>

                  {hasAndropause && (
                    <div>
                      <label className="block text-xs font-semibold text-blue-900 mb-1">Status / Tratamento Hormonal:</label>
                      <select
                        value={andropauseStatus}
                        onChange={(e) => setAndropauseStatus(e.target.value as any)}
                        className="w-full text-xs p-1.5 bg-white border border-blue-300 rounded-lg"
                      >
                        <option value="nenhum">Nenhum / Apenas sintomas</option>
                        <option value="andropausa">Andropausa Confirmada</option>
                        <option value="reposicao_hormonal_trh">Em Reposição Hormonal (TRH / Testosterona)</option>
                      </select>
                    </div>
                  )}
                </div>

                {hasAndropause && (
                  <div>
                    <label className="block text-xs font-semibold text-blue-900 mb-1">Observações ou Especialista Responsável (Urologista/Endócrino):</label>
                    <input
                      type="text"
                      value={andropauseDetails}
                      onChange={(e) => setAndropauseDetails(e.target.value)}
                      placeholder="Ex: Em uso de gel de testosterona 50mg/dia acompanhado por endocrinologista..."
                      className="w-full text-xs p-2 bg-white border border-blue-300 rounded-lg focus:outline-none"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Medicamentos e Suplementos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                  <Pill className="w-3.5 h-3.5 text-blue-600" /> Medicamentos de uso contínuo (Dosagem):
                </label>
                <input
                  type="text"
                  value={continuousMedication}
                  onChange={(e) => setContinuousMedication(e.target.value)}
                  placeholder="Ex: Losartana 50mg 1x/dia, Metformina 850mg"
                  className="w-full text-xs p-2.5 bg-white border border-[#e5e5d1] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#5a5a40]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Faz uso de chás, fitoterápicos ou suplementos?</label>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={usesHerbalOrSupplements}
                      onChange={(e) => setUsesHerbalOrSupplements(e.target.checked)}
                      className="rounded text-[#5a5a40]"
                    />
                    <span>Sim</span>
                  </label>
                  {usesHerbalOrSupplements && (
                    <input
                      type="text"
                      value={herbalDetails}
                      onChange={(e) => setHerbalDetails(e.target.value)}
                      placeholder="Ex: Chá de Ginkgo Biloba, Omega 3, Creatina"
                      className="flex-1 text-xs p-2 bg-white border border-[#e5e5d1] rounded-xl focus:outline-none"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* SEÇÃO 6: Articulação Temporomandibular (ATM), DTM e Dor Facial */}
          <div className={`${t.cardBg} p-4 sm:p-5 rounded-2xl border ${t.cardBorder} space-y-4`}>
            <h3 className={`text-sm font-bold ${t.headingText} flex items-center gap-2 border-b ${t.cardBorder} pb-2`}>
              <Zap className="w-4 h-4 text-amber-600" /> 6. Articulação Temporomandibular (ATM), DTM e Dor Facial
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer bg-white p-2.5 rounded-xl border border-[#e5e5d1]">
                <input
                  type="checkbox"
                  checked={hasFaceOrAtmPainLastMonth}
                  onChange={(e) => setHasFaceOrAtmPainLastMonth(e.target.checked)}
                  className="rounded text-[#5a5a40] focus:ring-0"
                />
                <span className="font-semibold">Dor na face, maxilares ou têmporas no último mês</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer bg-white p-2.5 rounded-xl border border-[#e5e5d1]">
                <input
                  type="checkbox"
                  checked={hasAtmPainOrClicking}
                  onChange={(e) => setHasAtmPainOrClicking(e.target.checked)}
                  className="rounded text-[#5a5a40] focus:ring-0"
                />
                <span>Estalos, ruídos ou dores na articulação da mandíbula</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer bg-white p-2.5 rounded-xl border border-[#e5e5d1]">
                <input
                  type="checkbox"
                  checked={hasAtmLocking}
                  onChange={(e) => setHasAtmLocking(e.target.checked)}
                  className="rounded text-[#5a5a40] focus:ring-0"
                />
                <span className="font-semibold text-amber-800">Travamento da articulação (impossibilidade de abrir/fechar)</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer bg-white p-2.5 rounded-xl border border-[#e5e5d1]">
                <input
                  type="checkbox"
                  checked={hasTinnitusOrEarRinging}
                  onChange={(e) => setHasTinnitusOrEarRinging(e.target.checked)}
                  className="rounded text-[#5a5a40] focus:ring-0"
                />
                <span>Zumbido ou apito constante nos ouvidos</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer bg-white p-2.5 rounded-xl border border-[#e5e5d1]">
                <input
                  type="checkbox"
                  checked={hasJawFatigueWakingUp}
                  onChange={(e) => setHasJawFatigueWakingUp(e.target.checked)}
                  className="rounded text-[#5a5a40] focus:ring-0"
                />
                <span>Sensação de mandíbula cansada ou dolorida ao acordar</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer bg-white p-2.5 rounded-xl border border-[#e5e5d1]">
                <input
                  type="checkbox"
                  checked={hasOcclusalDiscomfort}
                  onChange={(e) => setHasOcclusalDiscomfort(e.target.checked)}
                  className="rounded text-[#5a5a40] focus:ring-0"
                />
                <span>Desconforto ao encaixar ou morder dentes</span>
              </label>
            </div>

            {hasAtmLocking && (
              <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 flex items-center justify-between text-xs">
                <span className="font-semibold text-amber-900">Tipo de travamento ocorrido:</span>
                <div className="flex gap-4">
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name="atmLock"
                      value="aberta"
                      checked={atmLockingDetails === 'aberta'}
                      onChange={() => setAtmLockingDetails('aberta')}
                    />
                    <span>Boca Aberta</span>
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name="atmLock"
                      value="fechada"
                      checked={atmLockingDetails === 'fechada'}
                      onChange={() => setAtmLockingDetails('fechada')}
                    />
                    <span>Boca Fechada</span>
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name="atmLock"
                      value="ambas"
                      checked={atmLockingDetails === 'ambas'}
                      onChange={() => setAtmLockingDetails('ambas')}
                    />
                    <span>Ambas</span>
                  </label>
                </div>
              </div>
            )}

            {/* Scale EVA of Pain */}
            <div className="bg-white p-3.5 rounded-xl border border-[#e5e5d1] space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-gray-700">
                <span>Intensidade da Dor Facial / DTM (Escala EVA 0 - 10)</span>
                <span className="text-sm font-bold text-[#5a5a40] bg-[#f0f0e4] px-3 py-0.5 rounded-full">
                  Nível {painEvaScore} / 10
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                value={painEvaScore}
                onChange={(e) => setPainEvaScore(Number(e.target.value))}
                className="w-full accent-[#5a5a40] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-gray-400">
                <span>0 (Sem dor)</span>
                <span>5 (Dor moderada)</span>
                <span>10 (Dor insuportável)</span>
              </div>
            </div>
          </div>

          {/* SEÇÃO 7: Hábitos, Respiração & Sono */}
          <div className={`${t.cardBg} p-4 sm:p-5 rounded-2xl border ${t.cardBorder} space-y-4`}>
            <h3 className={`text-sm font-bold ${t.headingText} flex items-center gap-2 border-b ${t.cardBorder} pb-2`}>
              <Moon className="w-4 h-4 text-indigo-600" /> 7. Hábito Parafuncional, Respiração e Padrão de Sono
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Tabagismo */}
              <div className="bg-white p-3.5 rounded-xl border border-[#e5e5d1] space-y-2.5">
                <label className="flex items-center gap-2 text-xs font-bold text-gray-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isSmoker}
                    onChange={(e) => setIsSmoker(e.target.checked)}
                    className="rounded text-[#5a5a40]"
                  />
                  <span>É ex-fumante / ex-tabagista?</span>
                </label>

                {isSmoker && (
                  <div className="space-y-2 pt-1 border-t border-gray-100">
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-600 mb-1">Frequência e Padrão de Fumo:</label>
                      <select
                        value={smokingFrequency}
                        onChange={(e) => setSmokingFrequency(e.target.value as any)}
                        className="w-full text-xs p-2 bg-[#fbfbf9] border border-[#e5e5d1] rounded-lg focus:outline-none"
                      >
                        <option value="social">Socialmente / Ocasional</option>
                        <option value="diario_ate_10">Diário (até 10 cigarros/dia)</option>
                        <option value="diario_10_20">Diário (10 a 20 cigarros/dia)</option>
                        <option value="diario_mais_20">Diário (mais de 20 cigarros/dia - Carga alta)</option>
                        <option value="vape_eletronico">Pod / Vape / Cigarro Eletrônico</option>
                        <option value="ex_fumante">Ex-fumante</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-gray-600 mb-1">Tempo de fumo ou detalhes:</label>
                      <input
                        type="text"
                        value={smokingDetails}
                        onChange={(e) => setSmokingDetails(e.target.value)}
                        placeholder="Ex: Fumou por 8 anos; parou há 6 meses..."
                        className="w-full text-xs p-2 bg-[#fbfbf9] border border-[#e5e5d1] rounded-lg"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Uso de Drogas / Substâncias */}
              <div className="bg-white p-3.5 rounded-xl border border-[#e5e5d1] space-y-2.5">
                <label className="flex items-center gap-2 text-xs font-bold text-gray-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={usesRecreationalDrugs}
                    onChange={(e) => setUsesRecreationalDrugs(e.target.checked)}
                    className="rounded text-rose-600"
                  />
                  <span className="text-rose-900">Uso de drogas / substâncias recreativas?</span>
                </label>

                {usesRecreationalDrugs && (
                  <div className="space-y-3 pt-1 border-t border-rose-100 bg-rose-50/50 p-3 rounded-xl border border-rose-200">
                    {/* 1. SUBSTÂNCIA(S) UTILIZADA(S) (PRIMEIRO) COM BOTÃO DE ADICIONAR */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="block text-[11px] font-bold text-rose-900">
                          Substância(s) utilizada(s):
                        </label>
                        <span className="text-[10px] text-rose-700 font-medium">
                          Adicione ou selecione as substâncias
                        </span>
                      </div>

                      {/* Input + Botão Adicionar */}
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={newSubstanceInput}
                          onChange={(e) => setNewSubstanceInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddSubstance();
                            }
                          }}
                          placeholder="Digite o nome da substância..."
                          className="flex-1 text-xs p-2 bg-white border border-rose-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddSubstance()}
                          className="px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg transition flex items-center gap-1 shadow-xs shrink-0 cursor-pointer"
                          title="Adicionar substância ao prontuário"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Adicionar</span>
                        </button>
                      </div>

                      {/* Sugestões Rápidas de Substâncias */}
                      <div className="space-y-1">
                        <span className="text-[9.5px] font-semibold text-rose-800/80 block">
                          Sugestões frequentes (clique para adicionar):
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {COMMON_RECREATIONAL_SUBSTANCES.map((sub, sIdx) => {
                            const isIncluded = drugDetails
                              .toLowerCase()
                              .includes(sub.toLowerCase().split(' / ')[0]);
                            return (
                              <button
                                key={sIdx}
                                type="button"
                                onClick={() => handleAddSubstance(sub)}
                                className={`text-[10px] px-2 py-0.5 rounded-md font-medium transition cursor-pointer ${
                                  isIncluded
                                    ? 'bg-rose-200 text-rose-950 font-bold border border-rose-300'
                                    : 'bg-white hover:bg-rose-100 text-rose-900 border border-rose-200'
                                }`}
                              >
                                + {sub}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Lista Ativa de Substâncias Selecionadas */}
                      {drugDetails && (
                        <div className="pt-1.5 border-t border-rose-200/60">
                          <span className="text-[10px] font-bold text-rose-900 block mb-1">
                            Substâncias registradas no prontuário:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {drugDetails
                              .split(',')
                              .map(s => s.trim())
                              .filter(Boolean)
                              .map((subItem, subIdx) => (
                                <span
                                  key={subIdx}
                                  className="inline-flex items-center gap-1 text-[11px] font-bold bg-rose-600 text-white px-2.5 py-0.5 rounded-full shadow-2xs"
                                >
                                  {subItem}
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveSubstance(subItem)}
                                    className="hover:bg-rose-700 rounded-full p-0.5 transition cursor-pointer"
                                    title="Remover substância"
                                  >
                                    <X className="w-3 h-3 text-rose-100" />
                                  </button>
                                </span>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 2. FREQUÊNCIA DO USO (SEGUNDO - TROCADO DE LUGAR) */}
                    <div>
                      <label className="block text-[11px] font-bold text-rose-900 mb-1">Frequência do Uso:</label>
                      <select
                        value={drugUsageFrequency}
                        onChange={(e) => setDrugUsageFrequency(e.target.value as any)}
                        className="w-full text-xs p-2 bg-white border border-rose-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-500"
                      >
                        <option value="ocasional_social">Ocasional / Social</option>
                        <option value="semanal">Uso Semanal</option>
                        <option value="diario">Uso Diário / Frequente</option>
                        <option value="ex_usuario">Ex-usuário</option>
                      </select>
                    </div>

                    {/* 3. OBSERVAÇÕES MÉDICAS / RISCO ANESTÉSICO */}
                    <div>
                      <label className="block text-[11px] font-bold text-rose-900 mb-1">Observações Médicas / Risco Anestésico:</label>
                      <input
                        type="text"
                        value={drugUsageNotes}
                        onChange={(e) => setDrugUsageNotes(e.target.value)}
                        placeholder="Ex: Atenção especial para interações com anestésicos com vasoconstritor"
                        className="w-full text-xs p-2 bg-white border border-rose-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Bruxismo */}
              <div className="bg-white p-3 rounded-xl border border-[#e5e5d1] space-y-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasBruxism}
                    onChange={(e) => setHasBruxism(e.target.checked)}
                    className="rounded text-[#5a5a40]"
                  />
                  <span>Bruxismo (Range ou aperta os dentes de dia/noite)</span>
                </label>
                <input
                  type="text"
                  value={nailBitingOrHabits}
                  onChange={(e) => setNailBitingOrHabits(e.target.value)}
                  placeholder="Outros hábitos: roer unhas, morder caneta, morder bochechas"
                  className="w-full text-xs p-2 bg-[#fbfbf9] border border-[#e5e5d1] rounded-lg"
                />
              </div>

              {/* Observações de Hábitos */}
              <div className="bg-white p-3 rounded-xl border border-[#e5e5d1] space-y-2">
                <label className="block text-xs font-semibold text-gray-700">Observações adicionais de estilo de vida / hábitos:</label>
                <textarea
                  rows={2}
                  value={habitsNotes}
                  onChange={(e) => setHabitsNotes(e.target.value)}
                  placeholder="Consumo excessivo de café, bebidas alcoólicas, estresse ocupacional..."
                  className="w-full text-xs p-2 bg-[#fbfbf9] border border-[#e5e5d1] rounded-lg"
                />
              </div>
            </div>

            {/* Respiração (Dividida) & Sono */}
            <div className="bg-white p-3.5 rounded-xl border border-[#e5e5d1] space-y-3">
              <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                🫁 Função Respiratória & Dinâmica do Sono
              </span>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* 1. Via / Modo Respiratório */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Via Respiratória Predominante</label>
                  <select
                    value={breathingType}
                    onChange={(e) => setBreathingType(e.target.value as any)}
                    className="w-full text-xs p-2.5 bg-[#fbfbf9] border border-[#e5e5d1] rounded-xl focus:outline-none"
                  >
                    <option value="nasal">Nasal (Pelas narinas)</option>
                    <option value="bucal">Bucal (Pela boca)</option>
                    <option value="mista">Mista (Naso-bucal)</option>
                  </select>
                </div>

                {/* 2. Padrão / Mecânica Respiratória */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Mecânica / Padrão Muscular</label>
                  <select
                    value={respiratoryPattern}
                    onChange={(e) => setRespiratoryPattern(e.target.value as any)}
                    className="w-full text-xs p-2.5 bg-[#fbfbf9] border border-[#e5e5d1] rounded-xl focus:outline-none"
                  >
                    <option value="diafragmatica">Diafragmática (Abdominal)</option>
                    <option value="toracica">Torácica / Costal Superior</option>
                    <option value="apical">Apical / Clavicular</option>
                    <option value="mista_nao_avaliado">Mista / Não avaliado</option>
                  </select>
                </div>

                {/* 3. Padrão de Sono */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Qualidade do Sono</label>
                  <select
                    value={sleepQuality}
                    onChange={(e) => setSleepQuality(e.target.value as any)}
                    className="w-full text-xs p-2.5 bg-[#fbfbf9] border border-[#e5e5d1] rounded-xl focus:outline-none"
                  >
                    <option value="reparador">Reparador (Acorda descansado)</option>
                    <option value="nao_reparador">Não Reparador (Acorda cansado)</option>
                    <option value="insonia">Insônia / Dificuldade para dormir</option>
                    <option value="sono_leve">Sono Leve / Fracionado</option>
                  </select>
                </div>

                {/* 4. Postura ao Dormir */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Postura ao Dormir</label>
                  <select
                    value={sleepingPosture}
                    onChange={(e) => setSleepingPosture(e.target.value as any)}
                    className="w-full text-xs p-2.5 bg-[#fbfbf9] border border-[#e5e5d1] rounded-xl focus:outline-none"
                  >
                    <option value="decubito_dorsal">Barriga para cima (Decúbito Dorsal)</option>
                    <option value="decubito_lateral">De Lado (Decúbito Lateral)</option>
                    <option value="decubito_ventral">Barriga para baixo (Decúbito Ventral)</option>
                    <option value="mudanca_decubito">Não sabe / Mudança de decúbito</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer bg-white p-2.5 rounded-xl border border-[#e5e5d1]">
                <input
                  type="checkbox"
                  checked={hasSnoringOrApnea}
                  onChange={(e) => setHasSnoringOrApnea(e.target.checked)}
                  className="rounded text-[#5a5a40]"
                />
                <span>Ronco frequente ou Apneia do Sono</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer bg-white p-2.5 rounded-xl border border-[#e5e5d1]">
                <input
                  type="checkbox"
                  checked={usesNightGuardOrCpap}
                  onChange={(e) => setUsesNightGuardOrCpap(e.target.checked)}
                  className="rounded text-[#5a5a40]"
                />
                <span>Usa Placa de Mordida ou CPAP / Aparelho de Ronco</span>
              </label>
            </div>

            {/* Barra de 12 Horas de Sono */}
            <div className="bg-white p-3.5 rounded-xl border border-[#e5e5d1] space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-gray-700">
                <span className="flex items-center gap-1.5 font-bold text-[#5a5a40]">
                  <Clock className="w-3.5 h-3.5 text-indigo-600" /> Horas de Sono
                </span>
                <span className="text-xs font-bold text-[#5a5a40] bg-[#f0f0e4] px-3 py-0.5 rounded-full">
                  {sleepHoursNum} {sleepHoursNum === 1 ? 'hora' : 'horas'} de sono / noite
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="12"
                step="1"
                value={sleepHoursNum}
                onChange={(e) => setSleepHoursPerNight(`${e.target.value}h`)}
                className="w-full accent-[#5a5a40] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-gray-400 font-medium">
                <span>1h (Muito reduzido)</span>
                <span>6h - 8h (Recomendado)</span>
                <span>12h (Prolongado)</span>
              </div>
            </div>
          </div>

          {/* SEÇÃO 8: Queixa Principal & Exame Clínico Odontológico */}
          <div className={`${t.cardBg} p-4 sm:p-5 rounded-2xl border ${t.cardBorder} space-y-4`}>
            <h3 className={`text-sm font-bold ${t.headingText} flex items-center gap-2 border-b ${t.cardBorder} pb-2`}>
              <Smile className="w-4 h-4 text-emerald-600" /> 8. Queixa Principal e Exame Clínico Odontológico
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Queixa Principal / Motivo da Consulta:
                </label>
                <textarea
                  value={chiefComplaint}
                  onChange={(e) => setChiefComplaint(e.target.value)}
                  placeholder="Relato do paciente em suas próprias palavras (ex: 'Sinto dor ao mastigar no lado esquerdo há 3 dias', 'Quero clarear meus dentes')..."
                  className="w-full text-xs p-3 bg-white border border-[#e5e5d1] rounded-xl h-20 focus:outline-none focus:ring-1 focus:ring-[#5a5a40]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Última consulta ao dentista</label>
                  <input
                    type="text"
                    value={lastDentalVisit}
                    onChange={(e) => setLastDentalVisit(e.target.value)}
                    placeholder="Ex: Há 6 meses, Há mais de 2 anos"
                    className="w-full text-xs p-2.5 bg-white border border-[#e5e5d1] rounded-xl focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Como avalia a sua saúde bucal?</label>
                  <select
                    value={oralHealthRating}
                    onChange={(e) => setOralHealthRating(e.target.value as any)}
                    className="w-full text-xs p-2.5 bg-white border border-[#e5e5d1] rounded-xl focus:outline-none"
                  >
                    <option value="excelente">Excelente</option>
                    <option value="muito_boa">Muito Boa</option>
                    <option value="boa">Boa</option>
                    <option value="razoavel">Razoável</option>
                    <option value="precaria">Precária</option>
                  </select>
                </div>
              </div>

              {/* Dental Checks */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
                <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer bg-white p-2.5 rounded-xl border border-[#e5e5d1]">
                  <input
                    type="checkbox"
                    checked={hasAnesthesiaReaction}
                    onChange={(e) => setHasAnesthesiaReaction(e.target.checked)}
                    className="rounded text-[#5a5a40]"
                  />
                  <span>Reação/mal-estar com anestesia</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer bg-white p-2.5 rounded-xl border border-[#e5e5d1]">
                  <input
                    type="checkbox"
                    checked={hasGingivalBleeding}
                    onChange={(e) => setHasGingivalBleeding(e.target.checked)}
                    className="rounded text-[#5a5a40]"
                  />
                  <span>Gengiva sangra ao escovar</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer bg-white p-2.5 rounded-xl border border-[#e5e5d1]">
                  <input
                    type="checkbox"
                    checked={hasToothSensitivity}
                    onChange={(e) => setHasToothSensitivity(e.target.checked)}
                    className="rounded text-[#5a5a40]"
                  />
                  <span>Sensibilidade ao frio ou quente</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer bg-white p-2.5 rounded-xl border border-[#e5e5d1]">
                  <input
                    type="checkbox"
                    checked={hasLooseTeeth}
                    onChange={(e) => setHasLooseTeeth(e.target.checked)}
                    className="rounded text-[#5a5a40]"
                  />
                  <span>Dentes moles / mobilidade</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer bg-white p-2.5 rounded-xl border border-[#e5e5d1]">
                  <input
                    type="checkbox"
                    checked={dryMouthOrBadTaste}
                    onChange={(e) => setDryMouthOrBadTaste(e.target.checked)}
                    className="rounded text-[#5a5a40]"
                  />
                  <span>Sensação de boca seca ou gosto ruim</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer bg-white p-2.5 rounded-xl border border-[#e5e5d1]">
                  <input
                    type="checkbox"
                    checked={hasFaceOrLipSores}
                    onChange={(e) => setHasFaceOrLipSores(e.target.checked)}
                    className="rounded text-[#5a5a40]"
                  />
                  <span>Ferida ou bolha recorrente nos lábios</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer bg-white p-2.5 rounded-xl border border-[#e5e5d1]">
                  <input
                    type="checkbox"
                    checked={usesDentalProsthesis}
                    onChange={(e) => setUsesDentalProsthesis(e.target.checked)}
                    className="rounded text-[#5a5a40]"
                  />
                  <span>Usa prótese dentária (PPR, roach, total)</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer bg-white p-2.5 rounded-xl border border-[#e5e5d1]">
                  <input
                    type="checkbox"
                    checked={orthodonticTreatment}
                    onChange={(e) => setOrthodonticTreatment(e.target.checked)}
                    className="rounded text-[#5a5a40]"
                  />
                  <span>Usa ou já usou aparelho ortodôntico</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer bg-white p-2.5 rounded-xl border border-[#e5e5d1]">
                  <input
                    type="checkbox"
                    checked={usesDentalFloss}
                    onChange={(e) => setUsesDentalFloss(e.target.checked)}
                    className="rounded text-[#5a5a40]"
                  />
                  <span>Usa fio dental diariamente</span>
                </label>
              </div>

              {hasAnesthesiaReaction && (
                <div className="bg-rose-50 p-3 rounded-xl border border-rose-200">
                  <label className="block text-xs font-semibold text-rose-900 mb-1">Detalhes da reação ao anestésico local:</label>
                  <input
                    type="text"
                    value={anesthesiaReactionDetails}
                    onChange={(e) => setAnesthesiaReactionDetails(e.target.value)}
                    placeholder="Ex: Taquicardia com anestésico com vasoconstritor, tontura"
                    className="w-full text-xs p-2 bg-white border border-rose-300 rounded-lg"
                  />
                </div>
              )}

              {/* Escovação e Observações Dentista */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Frequência de Escovação Diária</label>
                  <input
                    type="text"
                    value={brushingFrequency}
                    onChange={(e) => setBrushingFrequency(e.target.value)}
                    placeholder="Ex: 3x ao dia após as refeições principais"
                    className="w-full text-xs p-2.5 bg-white border border-[#e5e5d1] rounded-xl focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Observações e Alertas do Cirurgião-Dentista</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Observações clínicas, conduta cirúrgica ou restrições do profissional"
                    className="w-full text-xs p-2.5 bg-white border border-[#e5e5d1] rounded-xl focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className={`flex items-center justify-between gap-3 border-t ${t.modalBorder} pt-4 flex-wrap`}>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className={`px-4 py-2.5 border ${t.cardBorder} text-xs font-semibold ${t.btnSecondaryText} ${t.btnSecondaryBg} rounded-xl transition cursor-pointer flex items-center gap-1.5`}
              >
                <ArrowLeft className="w-4 h-4" /> Voltar
              </button>
              <button
                type="button"
                onClick={() => printDocumentWithTitle({
                  docTitle: 'Ficha_Anamnese_Clinica',
                  patientName: patient?.name,
                  date: new Date()
                })}
                className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 border border-[#e5e5d1]"
              >
                <Printer className="w-4 h-4 text-[#5a5a40]" /> Imprimir
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className={`px-5 py-2.5 border ${t.cardBorder} text-xs font-semibold ${t.btnSecondaryText} ${t.btnSecondaryBg} rounded-xl transition cursor-pointer`}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className={`px-6 py-2.5 ${t.btnPrimaryBg} ${t.btnPrimaryText} text-xs font-bold rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer`}
              >
                <Check className="w-4 h-4" /> Salvar Prontuário Médico
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};
