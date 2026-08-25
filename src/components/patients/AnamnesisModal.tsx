import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { getThemeStyles } from '../../utils/themeUtils';
import { Anamnesis, Patient } from '../../types';
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
  Thermometer
} from 'lucide-react';

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
  const { layoutTheme } = useApp();
  const t = getThemeStyles(layoutTheme);

  if (!isOpen) return null;

  const initial = patient.anamnesis || ({} as Anamnesis);

  // 1. Saúde Geral & Histórico Médico
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
  const [continuousMedication, setContinuousMedication] = useState(initial.continuousMedication || '');
  const [usesHerbalOrSupplements, setUsesHerbalOrSupplements] = useState(initial.usesHerbalOrSupplements || false);
  const [herbalDetails, setHerbalDetails] = useState(initial.herbalDetails || '');
  const [familyMedicalHistory, setFamilyMedicalHistory] = useState(initial.familyMedicalHistory || false);
  const [familyHistoryDetails, setFamilyHistoryDetails] = useState(initial.familyHistoryDetails || '');
  const [generalHealthRating, setGeneralHealthRating] = useState<Anamnesis['generalHealthRating']>(initial.generalHealthRating || 'boa');

  // 2. Hábitos, Estilo de Vida & Sono
  const [isSmoker, setIsSmoker] = useState(initial.isSmoker || false);
  const [smokingDetails, setSmokingDetails] = useState(initial.smokingDetails || '');
  const [consumesAlcohol, setConsumesAlcohol] = useState(initial.consumesAlcohol || false);
  const [hasBruxism, setHasBruxism] = useState(initial.hasBruxism || false);
  const [nailBitingOrHabits, setNailBitingOrHabits] = useState(initial.nailBitingOrHabits || '');
  const [breathingType, setBreathingType] = useState<Anamnesis['breathingType']>(initial.breathingType || 'nasal');
  const [sleepingPosture, setSleepingPosture] = useState<Anamnesis['sleepingPosture']>(initial.sleepingPosture || 'decubito_dorsal');
  const [sleepQuality, setSleepQuality] = useState<Anamnesis['sleepQuality']>(initial.sleepQuality || 'reparador');
  const [hasSnoringOrApnea, setHasSnoringOrApnea] = useState(initial.hasSnoringOrApnea || false);
  const [sleepHoursPerNight, setSleepHoursPerNight] = useState(initial.sleepHoursPerNight || '8');
  const [usesNightGuardOrCpap, setUsesNightGuardOrCpap] = useState(initial.usesNightGuardOrCpap || false);
  const [psychologicalState, setPsychologicalState] = useState(initial.psychologicalState || '');

  // Helper para converter/interpretar número de horas de sono
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

  // 3. DTM & Dor Facial
  const [hasFaceOrAtmPainLastMonth, setHasFaceOrAtmPainLastMonth] = useState(initial.hasFaceOrAtmPainLastMonth || false);
  const [hasAtmLocking, setHasAtmLocking] = useState(initial.hasAtmLocking || false);
  const [atmLockingDetails, setAtmLockingDetails] = useState<Anamnesis['atmLockingDetails']>(initial.atmLockingDetails || 'aberta');
  const [hasAtmPainOrClicking, setHasAtmPainOrClicking] = useState(initial.hasAtmPainOrClicking || false);
  const [hasTinnitusOrEarRinging, setHasTinnitusOrEarRinging] = useState(initial.hasTinnitusOrEarRinging || false);
  const [entEvaluated, setEntEvaluated] = useState(initial.entEvaluated || false);
  const [hasJawFatigueWakingUp, setHasJawFatigueWakingUp] = useState(initial.hasJawFatigueWakingUp || false);
  const [hasOcclusalDiscomfort, setHasOcclusalDiscomfort] = useState(initial.hasOcclusalDiscomfort || false);
  const [painEvaScore, setPainEvaScore] = useState<number>(initial.painEvaScore || 0);

  // 4. Queixa Principal e Hábitos
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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedAnamnesis: Anamnesis = {
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
      continuousMedication,
      usesHerbalOrSupplements,
      herbalDetails: usesHerbalOrSupplements ? herbalDetails : '',
      familyMedicalHistory,
      familyHistoryDetails: familyMedicalHistory ? familyHistoryDetails : '',
      generalHealthRating,
      isSmoker,
      smokingDetails: isSmoker ? smokingDetails : '',
      consumesAlcohol,
      hasBruxism,
      nailBitingOrHabits,
      breathingType,
      sleepingPosture,
      sleepQuality,
      hasSnoringOrApnea,
      sleepHoursPerNight,
      usesNightGuardOrCpap,
      psychologicalState,
      hasFaceOrAtmPainLastMonth,
      hasAtmLocking,
      atmLockingDetails: hasAtmLocking ? atmLockingDetails : undefined,
      hasAtmPainOrClicking,
      hasTinnitusOrEarRinging,
      entEvaluated,
      hasJawFatigueWakingUp,
      hasOcclusalDiscomfort,
      painEvaScore,
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

    onSave(updatedAnamnesis);
    onClose();
  };

  return (
    <div className={`fixed inset-0 z-50 ${t.overlayBg} flex items-center justify-center p-4 overflow-y-auto`}>
      <div className={`${t.modalBg} border ${t.modalBorder} rounded-[32px] max-w-4xl w-full p-6 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto my-6`}>
        
        {/* Header */}
        <div className={`flex items-center justify-between border-b ${t.modalBorder} pb-4`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl ${t.btnPrimaryBg} ${t.btnPrimaryText} flex items-center justify-center shadow-xs`}>
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h2 className={`text-lg font-bold ${t.modalText}`}>Prontuário médico completo</h2>
              <p className={`text-xs ${t.modalMutedText}`}>Questionário detalhado do estado de saúde de <strong>{patient.name}</strong></p>
            </div>
          </div>

          <button
            onClick={onClose}
            type="button"
            className="p-2 text-gray-400 hover:text-gray-700 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Safety Badge Banner */}
        <div className={`${t.cardBg} p-4 rounded-2xl border ${t.cardBorder} space-y-2`}>
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600" /> Resumo de Alertas Médicos Críticos
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
            {hasBruxism && (
              <span className="px-3 py-1 bg-blue-100 text-blue-900 border border-blue-300 font-bold rounded-xl flex items-center gap-1">
                🔵 Bruxismo / DTM
              </span>
            )}
            {!hasAllergies && !usesBisphosphonates && !usesAnticoagulants && !isPregnant && !hasDiabetes && !hasHypertension && !hasHeartDisease && (
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium rounded-xl">
                ✅ Nenhum alerta sistêmico crítico relatado
              </span>
            )}
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="space-y-6">

          {/* Section 1: Saúde Geral e Sistêmica */}
          <div className="bg-[#fbfbf9] p-5 rounded-2xl border border-[#e5e5d1] space-y-4">
            <h3 className="text-sm font-bold text-[#5a5a40] flex items-center gap-2 border-b border-[#e5e5d1] pb-2">
              <Heart className="w-4 h-4 text-rose-500" /> 1. Saúde Geral & Histórico Médico
            </h3>

            {/* General Health Rating */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Como você avalia sua saúde geral?</label>
                <select
                  value={generalHealthRating}
                  onChange={(e) => setGeneralHealthRating(e.target.value as any)}
                  className="w-full text-xs p-2.5 bg-white border border-[#e5e5d1] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#5a5a40]"
                >
                  <option value="excelente">Excelente</option>
                  <option value="muito_boa">Muito Boa</option>
                  <option value="boa">Boa</option>
                  <option value="razoavel">Razoável</option>
                  <option value="precaria">Precária</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Pressão Arterial Habitual</label>
                <select
                  value={bloodPressureStatus}
                  onChange={(e) => setBloodPressureStatus(e.target.value as any)}
                  className="w-full text-xs p-2.5 bg-white border border-[#e5e5d1] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#5a5a40]"
                >
                  <option value="normal">Normal (Sistemática 120/80 mmHg)</option>
                  <option value="alta">Alta (Hipertensão)</option>
                  <option value="baixa">Baixa (Hipotensão)</option>
                  <option value="controlada_medicamento">Controlada com Medicamento</option>
                </select>
              </div>
            </div>

            {/* Checkboxes Grid 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer bg-white p-2.5 rounded-xl border border-[#e5e5d1]">
                <input
                  type="checkbox"
                  checked={hasAllergies}
                  onChange={(e) => setHasAllergies(e.target.checked)}
                  className="rounded text-[#5a5a40] focus:ring-0"
                />
                <span className="font-semibold">Tem Alergia a medicamentos ou materiais?</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer bg-white p-2.5 rounded-xl border border-[#e5e5d1]">
                <input
                  type="checkbox"
                  checked={hasHeartDisease}
                  onChange={(e) => setHasHeartDisease(e.target.checked)}
                  className="rounded text-[#5a5a40] focus:ring-0"
                />
                <span>Problemas cardíacos / Sopros / Infarto</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer bg-white p-2.5 rounded-xl border border-[#e5e5d1]">
                <input
                  type="checkbox"
                  checked={hasPacemaker}
                  onChange={(e) => setHasPacemaker(e.target.checked)}
                  className="rounded text-[#5a5a40] focus:ring-0"
                />
                <span>Usa Marca-passo ou Prótese Valvular</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer bg-white p-2.5 rounded-xl border border-[#e5e5d1]">
                <input
                  type="checkbox"
                  checked={hasShortnessOfBreath}
                  onChange={(e) => setHasShortnessOfBreath(e.target.checked)}
                  className="rounded text-[#5a5a40] focus:ring-0"
                />
                <span>Sente falta de ar com frequência (Dispneia)</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer bg-white p-2.5 rounded-xl border border-[#e5e5d1]">
                <input
                  type="checkbox"
                  checked={hasDiabetes}
                  onChange={(e) => setHasDiabetes(e.target.checked)}
                  className="rounded text-[#5a5a40] focus:ring-0"
                />
                <span className="font-semibold">Possui Diabetes</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer bg-white p-2.5 rounded-xl border border-[#e5e5d1]">
                <input
                  type="checkbox"
                  checked={hasHypertension}
                  onChange={(e) => setHasHypertension(e.target.checked)}
                  className="rounded text-[#5a5a40] focus:ring-0"
                />
                <span>Hipertensão Arterial (Pressão Alta)</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer bg-white p-2.5 rounded-xl border border-[#e5e5d1]">
                <input
                  type="checkbox"
                  checked={usesAnticoagulants}
                  onChange={(e) => setUsesAnticoagulants(e.target.checked)}
                  className="rounded text-[#5a5a40] focus:ring-0"
                />
                <span className="font-semibold text-rose-700">Usa Anticoagulantes (AAS, Marevan, Xarelto)</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer bg-white p-2.5 rounded-xl border border-[#e5e5d1]">
                <input
                  type="checkbox"
                  checked={usesBisphosphonates}
                  onChange={(e) => setUsesBisphosphonates(e.target.checked)}
                  className="rounded text-[#5a5a40] focus:ring-0"
                />
                <span className="font-semibold text-rose-800">Usa Bisfosfonatos (Alendronato, Zometa)</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer bg-white p-2.5 rounded-xl border border-[#e5e5d1]">
                <input
                  type="checkbox"
                  checked={hasCancerHistory}
                  onChange={(e) => setHasCancerHistory(e.target.checked)}
                  className="rounded text-[#5a5a40] focus:ring-0"
                />
                <span>Histórico de Câncer / Quimio / Radioterapia</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer bg-white p-2.5 rounded-xl border border-[#e5e5d1]">
                <input
                  type="checkbox"
                  checked={hasSeizures}
                  onChange={(e) => setHasSeizures(e.target.checked)}
                  className="rounded text-[#5a5a40] focus:ring-0"
                />
                <span>Convulsões / Epilepsia / AVC</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer bg-white p-2.5 rounded-xl border border-[#e5e5d1]">
                <input
                  type="checkbox"
                  checked={hasHadSurgery}
                  onChange={(e) => setHasHadSurgery(e.target.checked)}
                  className="rounded text-[#5a5a40] focus:ring-0"
                />
                <span>Já realizou cirurgias ou internações anteriores</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer bg-white p-2.5 rounded-xl border border-[#e5e5d1]">
                <input
                  type="checkbox"
                  checked={familyMedicalHistory}
                  onChange={(e) => setFamilyMedicalHistory(e.target.checked)}
                  className="rounded text-[#5a5a40] focus:ring-0"
                />
                <span>Histórico familiar de doenças graves</span>
              </label>
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

            {hasHadSurgery && (
              <div className="bg-blue-50 p-3 rounded-xl border border-blue-200">
                <label className="block text-xs font-semibold text-blue-900 mb-1">Quais cirurgias ou internações?</label>
                <input
                  type="text"
                  value={surgeryDetails}
                  onChange={(e) => setSurgeryDetails(e.target.value)}
                  placeholder="Ex: Apendicectomia em 2020, Cirurgia cardíaca em 2018"
                  className="w-full text-xs p-2 bg-white border border-blue-300 rounded-lg focus:outline-none"
                />
              </div>
            )}

            {familyMedicalHistory && (
              <div className="bg-amber-50 p-3 rounded-xl border border-amber-200">
                <label className="block text-xs font-semibold text-amber-900 mb-1">Histórico familiar (pais/irmãos com infarto, diabetes, câncer):</label>
                <input
                  type="text"
                  value={familyHistoryDetails}
                  onChange={(e) => setFamilyHistoryDetails(e.target.value)}
                  placeholder="Ex: Pai hipertenso e cardiopata; Mãe diabética"
                  className="w-full text-xs p-2 bg-white border border-amber-300 rounded-lg focus:outline-none"
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

            {/* Gestação & Hormonal */}
            {patient.gender === 'feminino' && (
              <div className="bg-purple-50/70 p-3 rounded-xl border border-purple-200 space-y-3">
                <span className="text-xs font-bold text-purple-900 flex items-center gap-1">
                  🌸 Condições Femininas & Gestação
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
                    <select
                      value={climactericOrMenopause}
                      onChange={(e) => setClimactericOrMenopause(e.target.value as any)}
                      className="w-full text-xs p-1.5 bg-white border border-purple-200 rounded-lg"
                    >
                      <option value="nenhum">Sem menopausa</option>
                      <option value="climaterio">No Climatério</option>
                      <option value="menopausa">Em Menopausa</option>
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

          {/* Section 2: DTM, Dor Facial e ATM */}
          <div className={`${t.cardBg} p-5 rounded-2xl border ${t.cardBorder} space-y-4`}>
            <h3 className={`text-sm font-bold ${t.headingText} flex items-center gap-2 border-b ${t.cardBorder} pb-2`}>
              <Zap className="w-4 h-4 text-amber-600" /> 2. Articulação Temporomandibular (ATM), DTM e Dor Facial
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

          {/* Section 3: Hábitos, Respiração & Sono */}
          <div className={`${t.cardBg} p-5 rounded-2xl border ${t.cardBorder} space-y-4`}>
            <h3 className={`text-sm font-bold ${t.headingText} flex items-center gap-2 border-b ${t.cardBorder} pb-2`}>
              <Moon className="w-4 h-4 text-indigo-600" /> 3. Hábito Parafuncional, Respiração e Padrão de Sono
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Tabagismo */}
              <div className="bg-white p-3 rounded-xl border border-[#e5e5d1] space-y-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isSmoker}
                    onChange={(e) => setIsSmoker(e.target.checked)}
                    className="rounded text-[#5a5a40]"
                  />
                  <span>É fumante / tabagista?</span>
                </label>
                {isSmoker && (
                  <input
                    type="text"
                    value={smokingDetails}
                    onChange={(e) => setSmokingDetails(e.target.value)}
                    placeholder="Ex: 10 cigarros/dia há 5 anos"
                    className="w-full text-xs p-2 bg-[#fbfbf9] border border-[#e5e5d1] rounded-lg"
                  />
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
            </div>

            {/* Respiração & Postura ao dormir */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Tipo de Respiração</label>
                <select
                  value={breathingType}
                  onChange={(e) => setBreathingType(e.target.value as any)}
                  className="w-full text-xs p-2.5 bg-white border border-[#e5e5d1] rounded-xl focus:outline-none"
                >
                  <option value="nasal">Nasal (Predominante pelas narinas)</option>
                  <option value="bucal">Bucal (Pela boca)</option>
                  <option value="mista">Mista</option>
                  <option value="apical">Apical</option>
                  <option value="diafragmatica">Diafragmática</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Padrão de Sono</label>
                <select
                  value={sleepQuality}
                  onChange={(e) => setSleepQuality(e.target.value as any)}
                  className="w-full text-xs p-2.5 bg-white border border-[#e5e5d1] rounded-xl focus:outline-none"
                >
                  <option value="reparador">Reparador (Acorda descansado)</option>
                  <option value="nao_reparador">Não Reparador (Acorda cansado)</option>
                  <option value="insonia">Insônia / Dificuldade para dormir</option>
                  <option value="sono_leve">Sono Leve / Fracionado</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Postura ao Dormir</label>
                <select
                  value={sleepingPosture}
                  onChange={(e) => setSleepingPosture(e.target.value as any)}
                  className="w-full text-xs p-2.5 bg-white border border-[#e5e5d1] rounded-xl focus:outline-none"
                >
                  <option value="decubito_dorsal">Barriga para cima (Dorsal)</option>
                  <option value="decubito_lateral">De Lado (Lateral)</option>
                  <option value="decubito_ventral">Barriga para baixo (Ventral)</option>
                </select>
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

          {/* Section 4: Queixa Principal & Exame */}
          <div className={`${t.cardBg} p-5 rounded-2xl border ${t.cardBorder} space-y-4`}>
            <h3 className={`text-sm font-bold ${t.headingText} flex items-center gap-2 border-b ${t.cardBorder} pb-2`}>
              <Smile className="w-4 h-4 text-emerald-600" /> 4. Queixa Principal e Exame
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
          <div className={`flex items-center justify-end gap-3 border-t ${t.modalBorder} pt-4`}>
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

        </form>
      </div>
    </div>
  );
};
