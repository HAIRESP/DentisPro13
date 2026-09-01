import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { UrgentCareExam, UrgentToothEvaluation, Patient } from '../../types';
import { formatCPF, formatCEP } from '../../utils/formatters';
import { getPatientAgeAndBirthDate } from '../../utils/patientUtils';
import { getThemeStyles } from '../../utils/themeUtils';
import { 
  FileText, 
  Printer, 
  Save, 
  X, 
  Send, 
  AlertTriangle, 
  Check, 
  Plus, 
  Trash2, 
  Stethoscope, 
  Activity, 
  Clock, 
  Sparkles,
  Globe,
  Mail,
  Phone,
  User,
  CheckCircle2,
  HelpCircle,
  Copy,
  ChevronDown
} from 'lucide-react';

interface UrgentCareExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPatientId?: string;
  existingExamId?: string;
}

const DEFAULT_TOOTH_EVALUATION = (num: string = ''): UrgentToothEvaluation => ({
  id: `tooth-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
  toothNumber: num,
  calor: false,
  frio: false,
  sensibilidadePulpar: false,
  percussao: false,
  palpacao: false,
  mobilidade: false,
  bolsaV: false,
  bolsaM: false,
  bolsaD: false,
  bolsaL: false,
  fratura: false,
  carie: false,
  fistula: false
});

const QUICK_DIAGNOSES = [
  'Pulpite Irreversível Aguda (K04.0)',
  'Pulpite Reversível (K04.0)',
  'Necrose Pulpar com Periodontite Apical Aguda (K04.4)',
  'Abscesso Periapical Agudo sem Fístula (K04.7)',
  'Abscesso Periapical com Fístula (K04.6)',
  'Abscesso Periodontal Agudo (K05.5)',
  'Pericoronarite Aguda em 3º Molar (K05.2)',
  'Fratura Coronária / Corono-Radicular (K08.8 / S02.5)',
  'Trauma Dentoalveolar / Luxação / Concussão (S03.2)',
  'Alveolite Seca / Fibrinosa Pós-Exodontia (K10.3)',
  'Hipersensibilidade Dentinária Severa (K03.8)',
  'Gengivite Ulcerativa Necrosante Aguda - GUNA (K05.0)'
];

const QUICK_URGENT_TREATMENTS = [
  'Abertura coronária, pulpotomia de urgência, medicação intracanal (Otosporin/Calen) e selamento provisório.',
  'Drenagem cirúrgica de abscesso por via canalicular/submucosa, irrigação com Clorexidina 2% e medicação.',
  'Remoção de tecido cariado, proteção do complexo dentino-pulpar com CIV e restauração provisória.',
  'Alívio oclusal, ajuste prévio, medicação analgésica/anti-inflamatória e agendamento de endodontia.',
  'Curetagem e irrigação alveolar com soro fisiológico, colocação de pasta analgésica (Alveolit) e sutura.',
  'Exodontia simples de urgência sob anestesia local com hemostasia satisfatória.',
  'Capeamento pulpar indireto e restauração em Resina Composta / CIV.',
  'Imobilização semi-rígida com fio ortodôntico e resina composta após reposicionamento dentário.'
];

export const UrgentCareExamModal: React.FC<UrgentCareExamModalProps> = ({
  isOpen,
  onClose,
  initialPatientId,
  existingExamId
}) => {
  const { 
    patients, 
    selectedPatientId, 
    clinicInfo, 
    activeProfessional, 
    activeClinic,
    layoutTheme,
    urgentCareExams,
    saveUrgentCareExam,
    addSavedClinicDocument
  } = useApp();

  const t = getThemeStyles(layoutTheme);
  const printAreaRef = useRef<HTMLDivElement>(null);

  // Selected Patient State
  const defaultPatientId = initialPatientId || selectedPatientId || patients[0]?.id || '';
  const [currentPatientId, setCurrentPatientId] = useState<string>(defaultPatientId);
  const selectedPatient = patients.find(p => p.id === currentPatientId) || patients[0];

  // View mode: 'form' (interactive form) or 'preview' (standard printed sheet)
  const [viewMode, setViewMode] = useState<'form' | 'preview'>('form');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Form State
  const [recordNumber, setRecordNumber] = useState<string>('');
  const [examDate, setExamDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [patientCivilStatus, setPatientCivilStatus] = useState<string>('Solteiro(a)');

  // 1. HISTÓRIA CLÍNICA
  const [chiefComplaint, setChiefComplaint] = useState<string>('');
  const [pain, setPain] = useState({
    provocada: false,
    espontanea: false,
    intermitente: false,
    intensa: false,
    moderada: false,
    precipitadaFrio: false,
    precipitadaCalor: false,
    precipitadaMastigacao: false
  });
  const [swelling, setSwelling] = useState({
    localizacao: '',
    duracao: '',
    consistencia: ''
  });
  const [currentIllnessHistory, setCurrentIllnessHistory] = useState<string>('');
  const [medicalHistory, setMedicalHistory] = useState({
    goodHealth: 'Sim, bom estado geral',
    currentMedicalTreatment: 'Não refere',
    conditions: {
      febreReumatica: false,
      doencaCoracao: false,
      hipertensaoArterial: false,
      alergia: false,
      asma: false,
      artrite: false,
      epilepsia: false,
      diabetes: false,
      desmaiosFrequentes: false,
      sinusite: false,
      hepatite: false,
      outrasInfeccoes: false
    },
    hasRadiotherapyFaceJaw: 'Não',
    currentMedications: 'Não refere',
    hasFaceJawTrauma: 'Não refere',
    hasAdverseDentalReaction: 'Não',
    isPregnant: 'Não',
    otherConditions: 'Nenhuma outra condição relatada'
  });

  // 2. EXAME CLÍNICO (OBJETIVO)
  const [generalAppearance, setGeneralAppearance] = useState<string>('Bom estado geral, consciente, orientado(a) no tempo e espaço.');
  const [affectedArea, setAffectedArea] = useState({
    inspecaoStatus: '+' as '+' | '-' | '',
    inspecaoDetails: '',
    percussaoStatus: '+' as '+' | '-' | '',
    percussaoDetails: '',
    palpacaoStatus: '+' as '+' | '-' | '',
    palpacaoDetails: '',
    mobilidadeClasse: '' as '1' | '2' | '3' | '',
    mobilidadeDetails: ''
  });
  const [otherFindings, setOtherFindings] = useState<string>('');
  const [supplementaryExams, setSupplementaryExams] = useState({
    radiografia: 'Radiografia Periapical de Urgência realizada.',
    outrosSolicitados: ''
  });

  // 3. RESUMO (Avaliação por Dente - mínimo 4 dentes conforme modelo)
  const [toothEvaluations, setToothEvaluations] = useState<UrgentToothEvaluation[]>([
    DEFAULT_TOOTH_EVALUATION(''),
    DEFAULT_TOOTH_EVALUATION(''),
    DEFAULT_TOOTH_EVALUATION(''),
    DEFAULT_TOOTH_EVALUATION('')
  ]);

  // 4. CONCLUSÕES
  const [diagnosis, setDiagnosis] = useState<string>('');
  const [proposedUrgentTreatment, setProposedUrgentTreatment] = useState<string>('');
  const [executedTreatment, setExecutedTreatment] = useState<string>('');

  // Effective Clinic / Professional
  const effectiveClinicName = (activeClinic && activeClinic.id !== 'todas') ? activeClinic.name : (clinicInfo.headerTitle || clinicInfo.name || 'DentisPro Odontologia');
  const effectiveClinicAddress = (activeClinic && activeClinic.id !== 'todas') ? activeClinic.address : (clinicInfo.address || 'Rua Visconde de Mauá 2600');
  const effectiveClinicCity = (activeClinic && activeClinic.id !== 'todas') ? activeClinic.city : (clinicInfo.city || 'Fortaleza - CE');
  const effectiveClinicCep = formatCEP(clinicInfo.cep || '60.160-110');
  const effectiveClinicPhone = (activeClinic && activeClinic.id !== 'todas') ? activeClinic.phone : (clinicInfo.phone || '(85) 98684-6424');
  const effectiveClinicEmail = (activeClinic && activeClinic.id !== 'todas') ? activeClinic.email : (clinicInfo.email || 'contato@dentispro.com.br');

  const effectiveDentistName = activeProfessional?.name || clinicInfo.dentistName || 'Dr. Hugo Andres Iglesias Ricoy';
  const effectiveDentistCro = activeProfessional?.cro || clinicInfo.cro || 'CRO/CE 5925';
  const effectiveDentistSpecialty = activeProfessional?.specialty || clinicInfo.specialty || 'Cirurgião-Dentista';

  // Load existing or initialize from patient
  useEffect(() => {
    if (existingExamId && urgentCareExams) {
      const found = urgentCareExams.find(e => e.id === existingExamId);
      if (found) {
        setCurrentPatientId(found.patientId);
        setRecordNumber(found.recordNumber || '');
        setExamDate(found.examDate || new Date().toISOString().split('T')[0]);
        setPatientCivilStatus(found.patientCivilStatus || 'Solteiro(a)');
        setChiefComplaint(found.chiefComplaint || '');
        setPain(found.pain || {
          provocada: false,
          espontanea: false,
          intermitente: false,
          intensa: false,
          moderada: false,
          precipitadaFrio: false,
          precipitadaCalor: false,
          precipitadaMastigacao: false
        });
        setSwelling(found.swelling || { localizacao: '', duracao: '', consistencia: '' });
        setCurrentIllnessHistory(found.currentIllnessHistory || '');
        setMedicalHistory(found.medicalHistory || {
          goodHealth: 'Sim',
          currentMedicalTreatment: 'Não',
          conditions: {
            febreReumatica: false,
            doencaCoracao: false,
            hipertensaoArterial: false,
            alergia: false,
            asma: false,
            artrite: false,
            epilepsia: false,
            diabetes: false,
            desmaiosFrequentes: false,
            sinusite: false,
            hepatite: false,
            outrasInfeccoes: false
          },
          hasRadiotherapyFaceJaw: 'Não',
          currentMedications: 'Não',
          hasFaceJawTrauma: 'Não',
          hasAdverseDentalReaction: 'Não',
          isPregnant: 'Não',
          otherConditions: 'Nenhuma'
        });
        setGeneralAppearance(found.generalAppearance || '');
        setAffectedArea(found.affectedArea || {
          inspecaoStatus: '+',
          inspecaoDetails: '',
          percussaoStatus: '+',
          percussaoDetails: '',
          palpacaoStatus: '+',
          palpacaoDetails: '',
          mobilidadeClasse: '',
          mobilidadeDetails: ''
        });
        setOtherFindings(found.otherFindings || '');
        setSupplementaryExams(found.supplementaryExams || { radiografia: '', outrosSolicitados: '' });
        setToothEvaluations(found.toothEvaluations && found.toothEvaluations.length > 0 ? found.toothEvaluations : [
          DEFAULT_TOOTH_EVALUATION(''),
          DEFAULT_TOOTH_EVALUATION(''),
          DEFAULT_TOOTH_EVALUATION(''),
          DEFAULT_TOOTH_EVALUATION('')
        ]);
        setDiagnosis(found.diagnosis || '');
        setProposedUrgentTreatment(found.proposedUrgentTreatment || '');
        setExecutedTreatment(found.executedTreatment || '');
        return;
      }
    }

    // Default initialization from selected patient
    if (selectedPatient) {
      setRecordNumber(selectedPatient.id ? `F-${selectedPatient.id.replace(/\D/g, '').slice(0, 5) || '101'}` : 'F-101');
      if (selectedPatient.anamnesis) {
        const a = selectedPatient.anamnesis;
        setMedicalHistory(prev => ({
          ...prev,
          conditions: {
            ...prev.conditions,
            alergia: Boolean(a.hasAllergies),
            hipertensaoArterial: Boolean(a.hasHypertension),
            diabetes: Boolean(a.hasDiabetes),
            doencaCoracao: Boolean(a.hasHeartDisease),
            asma: Boolean(a.hasRespiratoryDisease),
            epilepsia: Boolean(a.hasSeizures)
          },
          currentMedications: a.continuousMedication || (a.hasAllergies ? `Alergia: ${a.allergyDetails}` : 'Não refere'),
          isPregnant: a.isPregnant ? `Sim (${a.pregnancyWeeks || 'Gestante'})` : 'Não'
        }));
        if (a.chiefComplaint) {
          setChiefComplaint(a.chiefComplaint);
        }
      }
    }
  }, [existingExamId, currentPatientId]);

  if (!isOpen) return null;

  const ageAndBirth = selectedPatient ? getPatientAgeAndBirthDate(selectedPatient) : { age: 30, formattedBirthDate: '' };
  const fullAddress = selectedPatient?.address 
    ? `${selectedPatient.address.street || ''}, ${selectedPatient.address.number || ''} ${selectedPatient.address.neighborhood ? '- ' + selectedPatient.address.neighborhood : ''} ${selectedPatient.address.city ? '• ' + selectedPatient.address.city : ''} ${selectedPatient.address.state ? '-' + selectedPatient.address.state : ''} • CEP: ${formatCEP(selectedPatient.address.cep || '60.160-110')}`
    : 'Rua Visconde de Mauá, 2600 - Dionísio Torres • Fortaleza - CE • CEP: 60.160-110';

  const handleTogglePain = (key: keyof typeof pain) => {
    setPain(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleToggleCondition = (key: keyof typeof medicalHistory.conditions) => {
    setMedicalHistory(prev => ({
      ...prev,
      conditions: {
        ...prev.conditions,
        [key]: !prev.conditions[key]
      }
    }));
  };

  const handleUpdateToothEvaluation = (index: number, field: keyof UrgentToothEvaluation, val: any) => {
    setToothEvaluations(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: val };
      return updated;
    });
  };

  const handleAddToothRow = () => {
    setToothEvaluations(prev => [...prev, DEFAULT_TOOTH_EVALUATION('')]);
  };

  const handleRemoveToothRow = (index: number) => {
    if (toothEvaluations.length <= 1) return;
    setToothEvaluations(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveExam = () => {
    const examPayload: UrgentCareExam = {
      id: existingExamId || `urg-exam-${Date.now()}`,
      patientId: currentPatientId,
      patientName: selectedPatient?.name || 'Paciente',
      recordNumber: recordNumber || `F-${currentPatientId.replace(/\D/g, '').slice(0, 5) || '101'}`,
      patientAddress: fullAddress,
      patientPhone: selectedPatient?.phone || '',
      patientAge: ageAndBirth.age,
      patientGender: selectedPatient?.gender === 'feminino' ? 'Feminino' : 'Masculino',
      patientCivilStatus,
      examDate,
      dentistName: effectiveDentistName,
      dentistCro: effectiveDentistCro,
      clinicId: activeClinic?.id || 'cli-1',
      clinicName: effectiveClinicName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      chiefComplaint,
      pain,
      swelling,
      currentIllnessHistory,
      medicalHistory,
      generalAppearance,
      affectedArea,
      otherFindings,
      supplementaryExams,
      toothEvaluations,
      diagnosis,
      proposedUrgentTreatment,
      executedTreatment
    };

    saveUrgentCareExam(examPayload);

    // Also register in saved clinic documents
    addSavedClinicDocument({
      title: 'Exame de Urgência Odontológica',
      subtitle: `Ficha nº ${recordNumber || 'Urgência'} • ${diagnosis || 'Atendimento de Urgência'}`,
      category: 'outro',
      patientId: currentPatientId,
      patientName: selectedPatient?.name || 'Paciente',
      professionalName: effectiveDentistName,
      summary: `Diagnóstico: ${diagnosis || 'Não especificado'} | Tratamento executado: ${executedTreatment || 'Realizado atendimento de urgência'}`
    });

    setSaveSuccessMsg('Ficha de Exame de Urgência salva com sucesso no prontuário!');
    setTimeout(() => setSaveSuccessMsg(null), 3500);
  };

  // NATIVE PRINT: Uses browser window.print() adhering to AGENTS.md rules
  const handlePrint = () => {
    // If currently in form mode, temporarily switch or trigger print window
    window.print();
  };

  // WhatsApp formatted emergency summary
  const handleSendWhatsApp = () => {
    if (!selectedPatient?.phone) {
      alert('O paciente selecionado não possui telefone cadastrado.');
      return;
    }
    const cleanPhone = selectedPatient.phone.replace(/\D/g, '');
    const phoneWithCountry = cleanPhone.length <= 11 ? `55${cleanPhone}` : cleanPhone;

    const message = `🦷 *${effectiveClinicName.toUpperCase()} - RESUMO DO ATENDIMENTO DE URGÊNCIA*
━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 *Paciente:* ${selectedPatient.name}
📋 *Data do Exame:* ${new Date(examDate).toLocaleDateString('pt-BR')}
👨‍⚕️ *Cirurgião-Dentista:* ${effectiveDentistName} (${effectiveDentistCro})

*Queixa Principal:* ${chiefComplaint || 'Atendimento Odontológico de Urgência'}
*Diagnóstico:* ${diagnosis || 'Avaliação clínica e radiográfica'}
*Conduta Executada:* ${executedTreatment || 'Atendimento de urgência concluído com sucesso'}

⚠️ *Orientações Pós-Urgência:*
- Mantenha a higiene oral cuidadosa e tome as medicações prescritas nos horários corretos.
- Evite mastigar alimentos duros sobre a região tratada nas primeiras 48 horas.
- Em caso de dúvidas ou persistência dos sintomas, entre em contato imediatamente com nossa clínica.

📞 *Contato:* ${effectiveClinicPhone}
🌐 *Website:* https://dentispro.com.br`;

    const url = `https://api.whatsapp.com/send?phone=${phoneWithCountry}&text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white print:static">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-stone-200 flex flex-col max-h-[92vh] overflow-hidden print:max-h-none print:shadow-none print:border-none print:rounded-none">
        
        {/* MODAL ACTION BAR (Hidden in print) */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-stone-50 border-b border-stone-200 print:hidden shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-700">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-stone-800">Ficha de Exame de Urgência</h2>
                <span className="px-2 py-0.5 rounded-full text-2xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
                  Urgência & Emergência
                </span>
              </div>
              <p className="text-xs text-stone-500">
                Modelo oficial de anamnese e exame clínico de urgência odontológica
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex rounded-lg border border-stone-300 p-0.5 bg-stone-200/60 text-xs font-medium">
              <button
                type="button"
                onClick={() => setViewMode('form')}
                className={`px-3 py-1 rounded-md transition ${viewMode === 'form' ? 'bg-white text-stone-800 shadow-xs font-semibold' : 'text-stone-600 hover:text-stone-900'}`}
              >
                Preenchimento
              </button>
              <button
                type="button"
                onClick={() => setViewMode('preview')}
                className={`px-3 py-1 rounded-md transition ${viewMode === 'preview' ? 'bg-white text-stone-800 shadow-xs font-semibold' : 'text-stone-600 hover:text-stone-900'}`}
              >
                Visualizar Modelo
              </button>
            </div>

            {/* Save Button */}
            <button
              type="button"
              onClick={handleSaveExam}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold transition cursor-pointer shadow-2xs"
              title="Salvar no prontuário do paciente"
            >
              <Save className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Salvar</span>
            </button>

            {/* WhatsApp Share */}
            <button
              type="button"
              onClick={handleSendWhatsApp}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition cursor-pointer shadow-2xs"
              title="Enviar resumo por WhatsApp"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden md:inline">WhatsApp</span>
            </button>

            {/* PRINT BUTTON: Adhering to AGENTS.md rule: Label MUST be strictly "Imprimir" */}
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-stone-800 hover:bg-stone-900 text-white rounded-lg text-xs font-semibold transition cursor-pointer shadow-2xs"
              title="Imprimir documento"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir</span>
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* FEEDBACK BANNER */}
        {saveSuccessMsg && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2 flex items-center gap-2 text-emerald-800 text-xs font-medium print:hidden">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}

        {/* MODAL BODY */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-stone-100/50 print:p-0 print:bg-white">
          
          {/* ========================================================================= */}
          {/* FORM MODE: Interative Form View */}
          {/* ========================================================================= */}
          {viewMode === 'form' && (
            <div className="space-y-6 max-w-4xl mx-auto print:hidden">
              
              {/* Patient Selection & Quick Data */}
              <div className="bg-white p-4 sm:p-5 rounded-xl border border-stone-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
                  <span className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-stone-500" />
                    Paciente Selecionado
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xs text-stone-500 font-medium">Trocar Paciente:</span>
                    <select
                      value={currentPatientId}
                      onChange={(e) => setCurrentPatientId(e.target.value)}
                      className="text-xs font-medium bg-stone-50 border border-stone-200 rounded-md px-2 py-1 text-stone-700 focus:ring-1 focus:ring-amber-500"
                    >
                      {patients.map(p => (
                        <option key={p.id} value={p.id}>{p.name} ({formatCPF(p.cpf)})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="block text-stone-500 text-2xs mb-0.5 font-medium">Nome Completo</label>
                    <input
                      type="text"
                      value={selectedPatient?.name || ''}
                      readOnly
                      className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-md font-semibold text-stone-800"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-500 text-2xs mb-0.5 font-medium">Ficha nº</label>
                    <input
                      type="text"
                      value={recordNumber}
                      onChange={(e) => setRecordNumber(e.target.value)}
                      placeholder="Ex: F-102"
                      className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-md font-semibold text-stone-800 focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-500 text-2xs mb-0.5 font-medium">Data do Exame</label>
                    <input
                      type="date"
                      value={examDate}
                      onChange={(e) => setExamDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-md font-medium text-stone-800 focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-500 text-2xs mb-0.5 font-medium">Estado Civil</label>
                    <select
                      value={patientCivilStatus}
                      onChange={(e) => setPatientCivilStatus(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-md text-stone-800 focus:ring-1 focus:ring-amber-500"
                    >
                      <option value="Solteiro(a)">Solteiro(a)</option>
                      <option value="Casado(a)">Casado(a)</option>
                      <option value="União Estável">União Estável</option>
                      <option value="Divorciado(a)">Divorciado(a)</option>
                      <option value="Viúvo(a)">Viúvo(a)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 1. HISTÓRIA CLÍNICA */}
              <div className="bg-white p-4 sm:p-5 rounded-xl border border-stone-200 shadow-2xs space-y-4">
                <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
                  <Activity className="w-4 h-4 text-amber-600" />
                  <h3 className="text-xs sm:text-sm font-bold text-stone-800 uppercase tracking-wide">
                    1. História Clínica
                  </h3>
                </div>

                {/* Queixa Principal */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Queixa Principal <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={chiefComplaint}
                    onChange={(e) => setChiefComplaint(e.target.value)}
                    placeholder="Ex: Dor intensa e contínua no dente 46 que piora ao deitar e ao mastigar."
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs sm:text-sm text-stone-800 focus:bg-white focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                {/* Características da Dor */}
                <div className="bg-amber-50/50 p-3.5 rounded-lg border border-amber-200/60 space-y-2">
                  <span className="text-xs font-bold text-amber-900 block">
                    Características da Dor:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    {[
                      { key: 'provocada', label: 'Provocada' },
                      { key: 'espontanea', label: 'Espontânea' },
                      { key: 'intermitente', label: 'Intermitente' },
                      { key: 'intensa', label: 'Intensa' },
                      { key: 'moderada', label: 'Moderada' },
                      { key: 'precipitadaFrio', label: 'Precipitada pelo frio' },
                      { key: 'precipitadaCalor', label: 'Precipitada pelo calor' },
                      { key: 'precipitadaMastigacao', label: 'Precipitada pela mastigação' },
                    ].map(({ key, label }) => (
                      <label 
                        key={key} 
                        className={`flex items-center gap-2 p-2 rounded-md border cursor-pointer select-none transition ${pain[key as keyof typeof pain] ? 'bg-amber-100 border-amber-400 text-amber-950 font-semibold' : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'}`}
                      >
                        <input
                          type="checkbox"
                          checked={pain[key as keyof typeof pain]}
                          onChange={() => handleTogglePain(key as keyof typeof pain)}
                          className="rounded text-amber-600 focus:ring-amber-500"
                        />
                        <span>{label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Tumefação */}
                <div className="bg-stone-50 p-3.5 rounded-lg border border-stone-200 space-y-2">
                  <span className="text-xs font-bold text-stone-800 block">
                    Tumefação (Inchaço / Aumento de Volume):
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block text-2xs text-stone-500 font-medium mb-0.5">Localização</label>
                      <input
                        type="text"
                        value={swelling.localizacao}
                        onChange={(e) => setSwelling({ ...swelling, localizacao: e.target.value })}
                        placeholder="Ex: Região vestibular dente 46"
                        className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-md text-stone-800"
                      />
                    </div>
                    <div>
                      <label className="block text-2xs text-stone-500 font-medium mb-0.5">Duração</label>
                      <input
                        type="text"
                        value={swelling.duracao}
                        onChange={(e) => setSwelling({ ...swelling, duracao: e.target.value })}
                        placeholder="Ex: Há 2 dias"
                        className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-md text-stone-800"
                      />
                    </div>
                    <div>
                      <label className="block text-2xs text-stone-500 font-medium mb-0.5">Consistência</label>
                      <input
                        type="text"
                        value={swelling.consistencia}
                        onChange={(e) => setSwelling({ ...swelling, consistencia: e.target.value })}
                        placeholder="Ex: Flutuante / Endurecida"
                        className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-md text-stone-800"
                      />
                    </div>
                  </div>
                </div>

                {/* História da Doença Atual */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    História da Doença Atual
                  </label>
                  <textarea
                    rows={2}
                    value={currentIllnessHistory}
                    onChange={(e) => setCurrentIllnessHistory(e.target.value)}
                    placeholder="Ex: Paciente relata início de desconforto há 5 dias após quebra de restauração antiga, evoluindo com dor pulsátil e edema local."
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-800 focus:bg-white focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                {/* História Pregressa / Médica */}
                <div className="border-t border-stone-200 pt-3 space-y-3">
                  <span className="text-xs font-bold text-stone-800 block">
                    História Pregressa (História Médica):
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-2xs text-stone-600 font-medium mb-0.5">
                        =&gt; Você goza de boa saúde?
                      </label>
                      <input
                        type="text"
                        value={medicalHistory.goodHealth}
                        onChange={(e) => setMedicalHistory({ ...medicalHistory, goodHealth: e.target.value })}
                        placeholder="Ex: Sim / Não"
                        className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-md text-stone-800"
                      />
                    </div>
                    <div>
                      <label className="block text-2xs text-stone-600 font-medium mb-0.5">
                        =&gt; Está atualmente fazendo qualquer tratamento médico?
                      </label>
                      <input
                        type="text"
                        value={medicalHistory.currentMedicalTreatment}
                        onChange={(e) => setMedicalHistory({ ...medicalHistory, currentMedicalTreatment: e.target.value })}
                        placeholder="Ex: Não / Sim (especificar)"
                        className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-md text-stone-800"
                      />
                    </div>
                  </div>

                  {/* Doenças & Enfermidades Checklist */}
                  <div className="bg-stone-50 p-3 rounded-lg border border-stone-200 space-y-2">
                    <label className="block text-2xs text-stone-600 font-bold">
                      =&gt; Você tem ou teve qualquer das seguintes enfermidades ou problemas?
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 text-xs">
                      {[
                        { key: 'febreReumatica', label: 'Febre reumática' },
                        { key: 'doencaCoracao', label: 'Doença do coração' },
                        { key: 'hipertensaoArterial', label: 'Hipertensão arterial' },
                        { key: 'alergia', label: 'Alergia' },
                        { key: 'asma', label: 'Asma' },
                        { key: 'artrite', label: 'Artrite' },
                        { key: 'epilepsia', label: 'Epilepsia' },
                        { key: 'diabetes', label: 'Diabetes' },
                        { key: 'desmaiosFrequentes', label: 'Desmaios frequentes' },
                        { key: 'sinusite', label: 'Sinusite' },
                        { key: 'hepatite', label: 'Hepatite' },
                        { key: 'outrasInfeccoes', label: 'Outras infecções' },
                      ].map(({ key, label }) => (
                        <label 
                          key={key} 
                          className={`flex items-center gap-1.5 p-1.5 rounded border cursor-pointer select-none text-2xs transition ${medicalHistory.conditions[key as keyof typeof medicalHistory.conditions] ? 'bg-rose-50 border-rose-300 text-rose-900 font-semibold' : 'bg-white border-stone-200 text-stone-700'}`}
                        >
                          <input
                            type="checkbox"
                            checked={medicalHistory.conditions[key as keyof typeof medicalHistory.conditions]}
                            onChange={() => handleToggleCondition(key as keyof typeof medicalHistory.conditions)}
                            className="rounded text-rose-600 focus:ring-rose-500"
                          />
                          <span>{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Perguntas Médicas Complementares */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-2xs text-stone-600 font-medium mb-0.5">
                        =&gt; Tratamento por raios-X na face/maxilares?
                      </label>
                      <input
                        type="text"
                        value={medicalHistory.hasRadiotherapyFaceJaw}
                        onChange={(e) => setMedicalHistory({ ...medicalHistory, hasRadiotherapyFaceJaw: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-md text-stone-800"
                      />
                    </div>
                    <div>
                      <label className="block text-2xs text-stone-600 font-medium mb-0.5">
                        =&gt; Fazendo uso de algum medicamento?
                      </label>
                      <input
                        type="text"
                        value={medicalHistory.currentMedications}
                        onChange={(e) => setMedicalHistory({ ...medicalHistory, currentMedications: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-md text-stone-800"
                      />
                    </div>
                    <div>
                      <label className="block text-2xs text-stone-600 font-medium mb-0.5">
                        =&gt; Sofreu traumatismo na face/maxilares?
                      </label>
                      <input
                        type="text"
                        value={medicalHistory.hasFaceJawTrauma}
                        onChange={(e) => setMedicalHistory({ ...medicalHistory, hasFaceJawTrauma: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-md text-stone-800"
                      />
                    </div>
                    <div>
                      <label className="block text-2xs text-stone-600 font-medium mb-0.5">
                        =&gt; Reação desfavorável a tratamento dentário?
                      </label>
                      <input
                        type="text"
                        value={medicalHistory.hasAdverseDentalReaction}
                        onChange={(e) => setMedicalHistory({ ...medicalHistory, hasAdverseDentalReaction: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-md text-stone-800"
                      />
                    </div>
                    <div>
                      <label className="block text-2xs text-stone-600 font-medium mb-0.5">
                        =&gt; (Mulher) Está grávida atualmente?
                      </label>
                      <input
                        type="text"
                        value={medicalHistory.isPregnant}
                        onChange={(e) => setMedicalHistory({ ...medicalHistory, isPregnant: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-md text-stone-800"
                      />
                    </div>
                    <div>
                      <label className="block text-2xs text-stone-600 font-medium mb-0.5">
                        =&gt; Qualquer outra enfermidade não-relacionada?
                      </label>
                      <input
                        type="text"
                        value={medicalHistory.otherConditions}
                        onChange={(e) => setMedicalHistory({ ...medicalHistory, otherConditions: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-md text-stone-800"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. EXAME CLÍNICO (OBJETIVO) */}
              <div className="bg-white p-4 sm:p-5 rounded-xl border border-stone-200 shadow-2xs space-y-4">
                <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
                  <Stethoscope className="w-4 h-4 text-amber-600" />
                  <h3 className="text-xs sm:text-sm font-bold text-stone-800 uppercase tracking-wide">
                    2. Exame Clínico (Objetivo)
                  </h3>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Aparência Geral
                  </label>
                  <input
                    type="text"
                    value={generalAppearance}
                    onChange={(e) => setGeneralAppearance(e.target.value)}
                    placeholder="Ex: Bom estado geral, fácies de dor moderada..."
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-800 focus:bg-white focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                {/* Área Afetada */}
                <div className="bg-stone-50 p-3.5 rounded-lg border border-stone-200 space-y-3">
                  <span className="text-xs font-bold text-stone-800 block">
                    Área Afetada:
                  </span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <div className="flex items-center justify-between mb-0.5">
                        <label className="text-2xs font-semibold text-stone-700">Inspeção (+ / -)</label>
                        <div className="flex gap-1">
                          {['+', '-'].map((st) => (
                            <button
                              key={st}
                              type="button"
                              onClick={() => setAffectedArea({ ...affectedArea, inspecaoStatus: st as any })}
                              className={`px-2 py-0.5 rounded text-2xs font-bold ${affectedArea.inspecaoStatus === st ? 'bg-amber-600 text-white' : 'bg-stone-200 text-stone-700'}`}
                            >
                              ({st})
                            </button>
                          ))}
                        </div>
                      </div>
                      <input
                        type="text"
                        value={affectedArea.inspecaoDetails}
                        onChange={(e) => setAffectedArea({ ...affectedArea, inspecaoDetails: e.target.value })}
                        placeholder="Detalhes da inspeção (edema, lesão cariosa, fístula...)"
                        className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-md text-stone-800"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-0.5">
                        <label className="text-2xs font-semibold text-stone-700">Percussão (+ / -)</label>
                        <div className="flex gap-1">
                          {['+', '-'].map((st) => (
                            <button
                              key={st}
                              type="button"
                              onClick={() => setAffectedArea({ ...affectedArea, percussaoStatus: st as any })}
                              className={`px-2 py-0.5 rounded text-2xs font-bold ${affectedArea.percussaoStatus === st ? 'bg-amber-600 text-white' : 'bg-stone-200 text-stone-700'}`}
                            >
                              ({st})
                            </button>
                          ))}
                        </div>
                      </div>
                      <input
                        type="text"
                        value={affectedArea.percussaoDetails}
                        onChange={(e) => setAffectedArea({ ...affectedArea, percussaoDetails: e.target.value })}
                        placeholder="Detalhes da percussão vertical/horizontal..."
                        className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-md text-stone-800"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-0.5">
                        <label className="text-2xs font-semibold text-stone-700">Palpação (+ / -)</label>
                        <div className="flex gap-1">
                          {['+', '-'].map((st) => (
                            <button
                              key={st}
                              type="button"
                              onClick={() => setAffectedArea({ ...affectedArea, palpacaoStatus: st as any })}
                              className={`px-2 py-0.5 rounded text-2xs font-bold ${affectedArea.palpacaoStatus === st ? 'bg-amber-600 text-white' : 'bg-stone-200 text-stone-700'}`}
                            >
                              ({st})
                            </button>
                          ))}
                        </div>
                      </div>
                      <input
                        type="text"
                        value={affectedArea.palpacaoDetails}
                        onChange={(e) => setAffectedArea({ ...affectedArea, palpacaoDetails: e.target.value })}
                        placeholder="Detalhes da palpação apical e tecidos moles..."
                        className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-md text-stone-800"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-0.5">
                        <label className="text-2xs font-semibold text-stone-700">Mobilidade Dental</label>
                        <div className="flex gap-1">
                          {['1', '2', '3'].map((cl) => (
                            <button
                              key={cl}
                              type="button"
                              onClick={() => setAffectedArea({ ...affectedArea, mobilidadeClasse: affectedArea.mobilidadeClasse === cl ? '' : cl as any })}
                              className={`px-2 py-0.5 rounded text-2xs font-bold ${affectedArea.mobilidadeClasse === cl ? 'bg-amber-600 text-white' : 'bg-stone-200 text-stone-700'}`}
                            >
                              Grau {cl}
                            </button>
                          ))}
                        </div>
                      </div>
                      <input
                        type="text"
                        value={affectedArea.mobilidadeDetails}
                        onChange={(e) => setAffectedArea({ ...affectedArea, mobilidadeDetails: e.target.value })}
                        placeholder="Detalhes da mobilidade (ausente / leve / acentuada)"
                        className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-md text-stone-800"
                      />
                    </div>
                  </div>
                </div>

                {/* Outros achados & Recursos Suplementares */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-2xs font-semibold text-stone-700 mb-0.5">
                      Outros Achados Clínicos
                    </label>
                    <input
                      type="text"
                      value={otherFindings}
                      onChange={(e) => setOtherFindings(e.target.value)}
                      placeholder="Ex: Trismo mandibular leve, ausência de linfadenopatia."
                      className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-md text-stone-800"
                    />
                  </div>

                  <div>
                    <label className="block text-2xs font-semibold text-stone-700 mb-0.5">
                      Recursos Suplementares (Radiografia / Outros)
                    </label>
                    <input
                      type="text"
                      value={supplementaryExams.radiografia}
                      onChange={(e) => setSupplementaryExams({ ...supplementaryExams, radiografia: e.target.value })}
                      placeholder="Ex: Radiografia periapical com imagem radiolúcida periapical..."
                      className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-md text-stone-800"
                    />
                  </div>
                </div>
              </div>

              {/* 3. RESUMO: TESTES E AVALIAÇÃO POR DENTE */}
              <div className="bg-white p-4 sm:p-5 rounded-xl border border-stone-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <h3 className="text-xs sm:text-sm font-bold text-stone-800 uppercase tracking-wide">
                      3. Resumo dos Testes Diagnósticos por Dente
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddToothRow}
                    className="flex items-center gap-1 text-2xs font-bold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-md border border-amber-200 transition"
                  >
                    <Plus className="w-3 h-3" />
                    Adicionar Dente
                  </button>
                </div>

                <div className="space-y-3">
                  {toothEvaluations.map((evalItem, index) => (
                    <div 
                      key={evalItem.id}
                      className="p-3 bg-stone-50 border border-stone-200 rounded-lg space-y-2 relative group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-stone-800">
                            Dente #{index + 1}:
                          </span>
                          <input
                            type="text"
                            value={evalItem.toothNumber}
                            onChange={(e) => handleUpdateToothEvaluation(index, 'toothNumber', e.target.value)}
                            placeholder="Nº (ex: 46)"
                            className="w-20 px-2 py-0.5 text-xs font-bold bg-white border border-stone-300 rounded text-center focus:ring-1 focus:ring-amber-500"
                          />
                        </div>

                        {toothEvaluations.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveToothRow(index)}
                            className="text-stone-400 hover:text-rose-600 p-1 transition"
                            title="Remover linha deste dente"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Test checkboxes matching the document */}
                      <div className="flex flex-wrap gap-1.5 sm:gap-2 text-2xs">
                        {[
                          { field: 'calor', label: 'Calor' },
                          { field: 'frio', label: 'Frio' },
                          { field: 'sensibilidadePulpar', label: 'Sensib. Pulpar' },
                          { field: 'percussao', label: 'Percussão' },
                          { field: 'palpacao', label: 'Palpação' },
                          { field: 'mobilidade', label: 'Mobilidade' },
                          { field: 'bolsaV', label: 'Bolsa V' },
                          { field: 'bolsaM', label: 'Bolsa M' },
                          { field: 'bolsaD', label: 'Bolsa D' },
                          { field: 'bolsaL', label: 'Bolsa L' },
                          { field: 'fratura', label: 'Fratura' },
                          { field: 'carie', label: 'Cárie' },
                          { field: 'fistula', label: 'Fístula' },
                        ].map(({ field, label }) => {
                          const isChecked = Boolean(evalItem[field as keyof UrgentToothEvaluation]);
                          return (
                            <label
                              key={field}
                              className={`flex items-center gap-1 px-2 py-1 rounded border cursor-pointer select-none transition ${isChecked ? 'bg-amber-100 border-amber-400 text-amber-950 font-bold' : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-100'}`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => handleUpdateToothEvaluation(index, field as keyof UrgentToothEvaluation, e.target.checked)}
                                className="w-3 h-3 rounded text-amber-600 focus:ring-amber-500"
                              />
                              <span>{label}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. CONCLUSÕES: DIAGNÓSTICO E TRATAMENTOS */}
              <div className="bg-white p-4 sm:p-5 rounded-xl border border-stone-200 shadow-2xs space-y-4">
                <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-xs sm:text-sm font-bold text-stone-800 uppercase tracking-wide">
                    4. Conclusões
                  </h3>
                </div>

                {/* Diagnóstico */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-stone-800">
                      Diagnóstico Definitivo / Hipótese Diagnóstica <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-2xs text-stone-400">Sugestões rápidas abaixo:</span>
                  </div>
                  <input
                    type="text"
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    placeholder="Ex: Pulpite Irreversível Aguda no Dente 46 (CID-10 K04.0)"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs sm:text-sm font-semibold text-stone-900 focus:bg-white focus:ring-1 focus:ring-amber-500"
                  />
                  {/* Quick Diagnoses chips */}
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {QUICK_DIAGNOSES.slice(0, 6).map((diag, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setDiagnosis(diag)}
                        className="text-2xs bg-stone-100 hover:bg-stone-200 text-stone-700 px-2 py-0.5 rounded border border-stone-200 transition"
                      >
                        + {diag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tratamento Proposto */}
                <div>
                  <label className="block text-xs font-semibold text-stone-800 mb-1">
                    Tratamento de Urgência Proposto
                  </label>
                  <input
                    type="text"
                    value={proposedUrgentTreatment}
                    onChange={(e) => setProposedUrgentTreatment(e.target.value)}
                    placeholder="Ex: Abertura coronária, pulpotomia de urgência e medicação intracanal."
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-900 focus:bg-white focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                {/* Tratamento Executado */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-stone-800">
                      Tratamento Executado na Urgência
                    </label>
                    <span className="text-2xs text-stone-400">Modelos de conduta:</span>
                  </div>
                  <textarea
                    rows={3}
                    value={executedTreatment}
                    onChange={(e) => setExecutedTreatment(e.target.value)}
                    placeholder="Ex: Realizada anestesia infiltrativa, isolamento absoluto, remoção de cárie, abertura coronária, irrigação com NaOCl 2.5%, pulpotomia de urgência, inserção de Otosporin e selamento com Coltosol."
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-900 focus:bg-white focus:ring-1 focus:ring-amber-500"
                  />
                  <div className="flex flex-wrap gap-1 mt-1">
                    {QUICK_URGENT_TREATMENTS.slice(0, 4).map((cond, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setExecutedTreatment(cond)}
                        className="text-2xs bg-stone-100 hover:bg-stone-200 text-stone-700 px-2 py-0.5 rounded border border-stone-200 transition text-left truncate max-w-xs"
                        title={cond}
                      >
                        + {cond}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setViewMode('preview')}
                  className="w-full sm:w-auto px-5 py-2.5 border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 font-semibold text-xs rounded-xl transition shadow-2xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-stone-500" />
                  <span>Visualizar Ficha A4</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveExam}
                  className="w-full sm:w-auto px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Salvar Exame de Urgência</span>
                </button>

                {/* PRINT BUTTON: Strictly labeled "Imprimir" */}
                <button
                  type="button"
                  onClick={handlePrint}
                  className="w-full sm:w-auto px-6 py-2.5 bg-stone-900 hover:bg-black text-white font-bold text-xs rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-amber-400" />
                  <span>Imprimir</span>
                </button>
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* PREVIEW & OFFICIAL PRINT SHEET (A4 1:1 REPLICA OF THE MODEL DOCUMENT) */}
          {/* ========================================================================= */}
          <div 
            ref={printAreaRef}
            className={`${viewMode === 'form' ? 'hidden print:block' : 'block'} max-w-4xl mx-auto bg-white p-6 sm:p-10 lg:p-12 border border-stone-300 shadow-md font-sans text-stone-900 print:p-0 print:border-none print:shadow-none print:max-w-none text-xs leading-relaxed`}
          >
            {/* DOCUMENT TITLE (EXAME DE URGÊNCIA) */}
            <div className="mb-4">
              <h1 className="text-base sm:text-lg font-extrabold uppercase tracking-wide text-black mb-2">
                EXAME DE URGÊNCIA
              </h1>

              {/* Patient Identification Lines */}
              <div className="space-y-1.5 text-xs text-stone-900">
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="font-semibold whitespace-nowrap">Nome:</span>
                  <span className="flex-1 border-b border-stone-800 pb-0.5 font-bold min-w-[200px]">
                    {selectedPatient?.name || '_____________________________________________________'}
                  </span>
                  <span className="font-semibold whitespace-nowrap ml-2">Ficha nº</span>
                  <span className="border-b border-stone-800 pb-0.5 font-bold min-w-[100px] text-center">
                    {recordNumber || '___________'}
                  </span>
                </div>

                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="font-semibold whitespace-nowrap">Endereço:</span>
                  <span className="flex-1 border-b border-stone-800 pb-0.5 min-w-[200px]">
                    {fullAddress}
                  </span>
                  <span className="font-semibold whitespace-nowrap ml-2">Telefone:</span>
                  <span className="border-b border-stone-800 pb-0.5 font-bold min-w-[120px] text-center">
                    {selectedPatient?.phone || '_____________'}
                  </span>
                </div>

                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="font-semibold whitespace-nowrap">Idade:</span>
                  <span className="border-b border-stone-800 pb-0.5 min-w-[50px] text-center font-bold">
                    {ageAndBirth.age} anos
                  </span>
                  <span className="font-semibold whitespace-nowrap ml-1">, Sexo:</span>
                  <span className="border-b border-stone-800 pb-0.5 min-w-[70px] text-center font-bold">
                    {selectedPatient?.gender === 'feminino' ? 'Feminino' : 'Masculino'}
                  </span>
                  <span className="font-semibold whitespace-nowrap ml-1">, Est. Civil:</span>
                  <span className="border-b border-stone-800 pb-0.5 min-w-[100px] text-center">
                    {patientCivilStatus}
                  </span>
                  <span className="font-semibold whitespace-nowrap ml-1">, Data de Exame:</span>
                  <span className="flex-1 border-b border-stone-800 pb-0.5 min-w-[100px] text-center font-bold">
                    {new Date(examDate).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
            </div>

            {/* SECTION: HISTÓRIA CLÍNICA */}
            <div className="mt-4 pt-2 border-t border-stone-400 space-y-1.5">
              <h2 className="text-xs font-extrabold uppercase tracking-wide text-black">
                HISTÓRIA CLÍNICA
              </h2>

              <div className="flex items-baseline gap-2">
                <span className="font-semibold whitespace-nowrap">Queixa principal:</span>
                <span className="flex-1 border-b border-stone-800 pb-0.5 font-bold">
                  {chiefComplaint || '_________________________________________________________________________________________'}
                </span>
              </div>

              {/* Dor: provocada (_), espontânea (_), ... */}
              <div className="leading-normal">
                <span className="font-semibold">Dor: </span>
                <span>provocada ({pain.provocada ? 'X' : '_'}), </span>
                <span>espontânea ({pain.espontanea ? 'X' : '_'}), </span>
                <span>intermitente ({pain.intermitente ? 'X' : '_'}), </span>
                <span>intensa ({pain.intensa ? 'X' : '_'}), </span>
                <span>moderada ({pain.moderada ? 'X' : '_'}), </span>
                <span>precipitada pelo frio ({pain.precipitadaFrio ? 'X' : '_'}), </span>
                <span>calor ({pain.precipitadaCalor ? 'X' : '_'}), </span>
                <span>mastigação ({pain.precipitadaMastigacao ? 'X' : '_'}), </span>
                <span className="font-semibold">Tumefação: </span>
                <span>localização </span>
                <span className="border-b border-stone-800 pb-0.5 px-2 font-medium">
                  {swelling.localizacao || '__________________________'}
                </span>
                <span>, duração </span>
                <span className="border-b border-stone-800 pb-0.5 px-2 font-medium">
                  {swelling.duracao || '______________'}
                </span>
                <span>, consistência </span>
                <span className="border-b border-stone-800 pb-0.5 px-2 font-medium">
                  {swelling.consistencia || '___________________________'}
                </span>.
              </div>

              <div className="flex items-baseline gap-2">
                <span className="font-semibold whitespace-nowrap">História da doença atual:</span>
                <span className="flex-1 border-b border-stone-800 pb-0.5">
                  {currentIllnessHistory || '___________________________________________________________________________________'}
                </span>
              </div>

              {/* História Pregressa */}
              <div className="space-y-1 pt-1">
                <div>
                  <span className="font-semibold">História Pregressa (história médica): =&gt; você goza de boa saúde?</span>
                  <div className="border-b border-stone-800 pb-0.5 pl-2 font-medium">
                    {medicalHistory.goodHealth || '_____________________________________________________________________________________________'}
                  </div>
                </div>

                <div>
                  <span className="font-semibold">=&gt; você está atualmente fazendo qualquer tratamento médico?</span>
                  <div className="border-b border-stone-800 pb-0.5 pl-2 font-medium">
                    {medicalHistory.currentMedicalTreatment || '_____________________________________________________________________________________________'}
                  </div>
                </div>

                <div>
                  <span className="font-semibold">=&gt; você tem ou teve qualquer das seguintes enfermidades ou problemas? </span>
                  <span>Febre reumática ({medicalHistory.conditions.febreReumatica ? 'X' : '_'}), </span>
                  <span>doença do coração ({medicalHistory.conditions.doencaCoracao ? 'X' : '_'}), </span>
                  <span>hipertensão arterial ({medicalHistory.conditions.hipertensaoArterial ? 'X' : '_'}), </span>
                  <span>alergia ({medicalHistory.conditions.alergia ? 'X' : '_'}), </span>
                  <span>asma ({medicalHistory.conditions.asma ? 'X' : '_'}), </span>
                  <span>artrite ({medicalHistory.conditions.artrite ? 'X' : '_'}), </span>
                  <span>epilepsia ({medicalHistory.conditions.epilepsia ? 'X' : '_'}), </span>
                  <span>diabetes ({medicalHistory.conditions.diabetes ? 'X' : '_'}), </span>
                  <span>desmaios frequentes ({medicalHistory.conditions.desmaiosFrequentes ? 'X' : '_'}), </span>
                  <span>sinusite ({medicalHistory.conditions.sinusite ? 'X' : '_'}), </span>
                  <span>hepatite ({medicalHistory.conditions.hepatite ? 'X' : '_'}) </span>
                  <span>outras infecções ({medicalHistory.conditions.outrasInfeccoes ? 'X' : '_'}). </span>
                  <span>=&gt; você já sofreu tratamento pelos raios-X, na face ou nos maxilares? </span>
                  <span className="font-semibold underline mr-1">{medicalHistory.hasRadiotherapyFaceJaw}</span>
                  <span>=&gt; você está fazendo uso de algum medicamento? </span>
                  <span className="font-semibold underline mr-1">{medicalHistory.currentMedications}</span>
                  <span>=&gt; você já sofreu algum traumatismo na face ou nos maxilares? </span>
                  <span className="font-semibold underline mr-1">{medicalHistory.hasFaceJawTrauma}</span>
                  <span>=&gt; você já teve alguma reação desfavorável ao tratamento dentário? </span>
                  <span className="font-semibold underline mr-1">{medicalHistory.hasAdverseDentalReaction}</span>
                  <span>=&gt; (mulher) você está grávida atualmente? </span>
                  <span className="font-semibold underline mr-1">{medicalHistory.isPregnant}</span>
                  <span>=&gt; você tem qualquer enfermidade não-relacionada aqui? </span>
                  <span className="font-semibold underline">{medicalHistory.otherConditions}</span>
                </div>
              </div>
            </div>

            {/* SECTION: EXAME CLÍNICO (OBJETIVO) */}
            <div className="mt-4 pt-2 border-t border-stone-400 space-y-1.5">
              <div className="flex items-baseline gap-2">
                <h2 className="text-xs font-extrabold uppercase tracking-wide text-black whitespace-nowrap">
                  EXAME CLÍNICO (OBJETIVO)
                </h2>
                <span className="font-semibold">Aparência geral</span>
              </div>
              <div className="border-b border-stone-800 pb-0.5">
                {generalAppearance || '_____________________________________________________________________________________________________'}
              </div>

              <div>
                <span className="font-semibold">Área Afetada: </span>
                <span>inspeção (+)(-) </span>
                <span className="border-b border-stone-800 pb-0.5 px-1 font-medium">
                  {affectedArea.inspecaoStatus ? `(${affectedArea.inspecaoStatus}) ` : ''}{affectedArea.inspecaoDetails || '____________________'}
                </span>
                <span>, percussão (+) (-) </span>
                <span className="border-b border-stone-800 pb-0.5 px-1 font-medium">
                  {affectedArea.percussaoStatus ? `(${affectedArea.percussaoStatus}) ` : ''}{affectedArea.percussaoDetails || '_____________________'}
                </span>
                <span> palpação (+)(-) </span>
                <span className="border-b border-stone-800 pb-0.5 px-1 font-medium">
                  {affectedArea.palpacaoStatus ? `(${affectedArea.palpacaoStatus}) ` : ''}{affectedArea.palpacaoDetails || '_____________________'}
                </span>
                <span>, mobilidade classe 1({affectedArea.mobilidadeClasse === '1' ? 'X' : '_'}), 2({affectedArea.mobilidadeClasse === '2' ? 'X' : '_'}), 3({affectedArea.mobilidadeClasse === '3' ? 'X' : '_'}): </span>
                <span className="border-b border-stone-800 pb-0.5 px-1 font-medium">
                  {affectedArea.mobilidadeDetails || '________________________'}
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="font-semibold whitespace-nowrap">Outros achados:</span>
                <span className="flex-1 border-b border-stone-800 pb-0.5">
                  {otherFindings || '_______________________________________________________________________________________________________'}
                </span>
              </div>

              <div>
                <span className="font-semibold">RECURSOS SUPLEMENTARES DE EXAME Radiografia: </span>
                <span className="border-b border-stone-800 pb-0.5 px-1">
                  {supplementaryExams.radiografia || '_________________________________________'}
                </span>
                <span>; outros solicitados: </span>
                <span className="border-b border-stone-800 pb-0.5 px-1">
                  {supplementaryExams.outrosSolicitados || '____________________________'}
                </span>
              </div>
            </div>

            {/* SECTION: RESUMO (Dentes e Testes Clínicos) */}
            <div className="mt-4 pt-2 border-t border-stone-400 space-y-1">
              <h2 className="text-xs font-extrabold uppercase tracking-wide text-black">
                RESUMO
              </h2>

              <div className="space-y-1 font-mono text-2xs sm:text-xs">
                {toothEvaluations.map((tRow, i) => (
                  <div key={tRow.id || i} className="leading-snug">
                    <span className="font-sans font-semibold">Dente número (</span>
                    <span className="font-bold underline px-1">{tRow.toothNumber || '____'}</span>
                    <span className="font-sans font-semibold">): </span>
                    <span>calor ({tRow.calor ? 'X' : '_'}), </span>
                    <span>frio ({tRow.frio ? 'X' : '_'}), </span>
                    <span>sensibilidade pulpar ({tRow.sensibilidadePulpar ? 'X' : '_'}), </span>
                    <span>percussão ({tRow.percussao ? 'X' : '_'}), </span>
                    <span>palpação ({tRow.palpacao ? 'X' : '_'}), </span>
                    <span>mobilidade ({tRow.mobilidade ? 'X' : '_'}), </span>
                    <span>bolsa V ({tRow.bolsaV ? 'X' : '_'}), M ({tRow.bolsaM ? 'X' : '_'}), D ({tRow.bolsaD ? 'X' : '_'}), L ({tRow.bolsaL ? 'X' : '_'}), </span>
                    <span>fratura ({tRow.fratura ? 'X' : '_'}), </span>
                    <span>cárie ({tRow.carie ? 'X' : '_'}), </span>
                    <span>fístula ({tRow.fistula ? 'X' : '_'});</span>
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION: CONCLUSÕES */}
            <div className="mt-4 pt-2 border-t border-stone-400 space-y-2">
              <h2 className="text-xs font-extrabold uppercase tracking-wide text-black">
                CONCLUSÕES
              </h2>

              <div className="flex items-baseline gap-2">
                <span className="font-semibold whitespace-nowrap">Diagnóstico:</span>
                <span className="flex-1 border-b border-stone-800 pb-0.5 font-bold">
                  {diagnosis || '___________________________________________________________________________________'}
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="font-semibold whitespace-nowrap">Tratamento de Urgência Proposto:</span>
                <span className="flex-1 border-b border-stone-800 pb-0.5">
                  {proposedUrgentTreatment || '_________________________________________________'}
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="font-semibold whitespace-nowrap">Tratamento Executado:</span>
                <span className="flex-1 border-b border-stone-800 pb-0.5 font-semibold">
                  {executedTreatment || '__________________________________________________________'}
                </span>
              </div>
            </div>

            {/* PROFESSIONAL SIGNATURE & FOOTER (Fully adhering to AGENTS.md rules) */}
            <div className="mt-8 pt-4 border-t border-stone-300 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-2xs text-stone-600 space-y-0.5 text-center sm:text-left">
                <div className="font-bold text-stone-800">{effectiveClinicName}</div>
                <div>{effectiveClinicCity} • CEP: {effectiveClinicCep}</div>
                <div className="flex items-center justify-center sm:justify-start gap-3 pt-1">
                  <a 
                    href="https://dentispro.com.br" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="flex items-center gap-1 text-stone-700 hover:text-amber-700 transition"
                  >
                    <Globe className="w-3 h-3" />
                    <span>dentispro.com.br</span>
                  </a>
                  <a 
                    href={`mailto:${effectiveClinicEmail}`} 
                    className="flex items-center gap-1 text-stone-700 hover:text-amber-700 transition"
                  >
                    <Mail className="w-3 h-3" />
                    <span>{effectiveClinicEmail}</span>
                  </a>
                  <a 
                    href={`tel:${effectiveClinicPhone}`} 
                    className="flex items-center gap-1 text-stone-700 hover:text-amber-700 transition"
                  >
                    <Phone className="w-3 h-3" />
                    <span>{effectiveClinicPhone}</span>
                  </a>
                </div>
              </div>

              <div className="text-center sm:text-right">
                <div className="w-56 border-t border-stone-800 mx-auto sm:ml-auto pt-1 mb-1" />
                <div className="font-bold text-xs text-stone-900">{effectiveDentistName}</div>
                <div className="text-2xs text-stone-600 font-medium">{effectiveDentistCro} • {effectiveDentistSpecialty}</div>
                <div className="text-3xs text-stone-400 mt-0.5">
                  Emitido em {new Date(examDate).toLocaleDateString('pt-BR')}
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
