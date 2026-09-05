import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { getThemeStyles } from '../../utils/themeUtils';
import { printDocumentWithTitle } from '../../utils/printUtils';
import { 
  PainEvaluationExam, 
  ToothPainSummaryItem, 
  SplitSignValue, 
  MobilityClass, 
  PocketDepth, 
  ExamCategoryType,
  ToothSurface,
  ToothConditionType
} from '../../types';
import { 
  Stethoscope, 
  Flame, 
  Snowflake, 
  Activity, 
  Zap, 
  AlertCircle, 
  CheckCircle2, 
  Printer, 
  Send, 
  Plus, 
  Trash2, 
  Save, 
  Layers, 
  ShieldAlert, 
  Heart, 
  ChevronDown, 
  Sparkles, 
  FileText, 
  HelpCircle,
  Clock,
  UserCheck,
  Check
} from 'lucide-react';

interface PainEvaluationExamViewProps {
  patientId: string;
}

// FDI Teeth list ordered by quadrants
const ALL_FDI_TEETH = [
  // Permanents
  { number: 18, label: '18 - 3º Molar Sup. Dir.' },
  { number: 17, label: '17 - 2º Molar Sup. Dir.' },
  { number: 16, label: '16 - 1º Molar Sup. Dir.' },
  { number: 15, label: '15 - 2º Pré-molar Sup. Dir.' },
  { number: 14, label: '14 - 1º Pré-molar Sup. Dir.' },
  { number: 13, label: '13 - Canino Sup. Dir.' },
  { number: 12, label: '12 - Incisivo Lat. Sup. Dir.' },
  { number: 11, label: '11 - Incisivo Central Sup. Dir.' },
  { number: 21, label: '21 - Incisivo Central Sup. Esq.' },
  { number: 22, label: '22 - Incisivo Lat. Sup. Esq.' },
  { number: 23, label: '23 - Canino Sup. Esq.' },
  { number: 24, label: '24 - 1º Pré-molar Sup. Esq.' },
  { number: 25, label: '25 - 2º Pré-molar Sup. Esq.' },
  { number: 26, label: '26 - 1º Molar Sup. Esq.' },
  { number: 27, label: '27 - 2º Molar Sup. Esq.' },
  { number: 28, label: '28 - 3º Molar Sup. Esq.' },
  { number: 48, label: '48 - 3º Molar Inf. Dir.' },
  { number: 47, label: '47 - 2º Molar Inf. Dir.' },
  { number: 46, label: '46 - 1º Molar Inf. Dir.' },
  { number: 45, label: '45 - 2º Pré-molar Inf. Dir.' },
  { number: 44, label: '44 - 1º Pré-molar Inf. Dir.' },
  { number: 43, label: '43 - Canino Inf. Dir.' },
  { number: 42, label: '42 - Incisivo Lat. Inf. Dir.' },
  { number: 41, label: '41 - Incisivo Central Inf. Dir.' },
  { number: 31, label: '31 - Incisivo Central Inf. Esq.' },
  { number: 32, label: '32 - Incisivo Lat. Inf. Esq.' },
  { number: 33, label: '33 - Canino Inf. Esq.' },
  { number: 34, label: '34 - 1º Pré-molar Inf. Esq.' },
  { number: 35, label: '35 - 2º Pré-molar Inf. Esq.' },
  { number: 36, label: '36 - 1º Molar Inf. Esq.' },
  { number: 37, label: '37 - 2º Molar Inf. Esq.' },
  { number: 38, label: '38 - 3º Molar Inf. Esq.' },
  // Deciduous
  { number: 55, label: '55 - 2º Molar Decíduo Sup. Dir.' },
  { number: 54, label: '54 - 1º Molar Decíduo Sup. Dir.' },
  { number: 53, label: '53 - Canino Decíduo Sup. Dir.' },
  { number: 52, label: '52 - Incisivo Lat. Decíduo Sup. Dir.' },
  { number: 51, label: '51 - Incisivo Central Decíduo Sup. Dir.' },
  { number: 61, label: '61 - Incisivo Central Decíduo Sup. Esq.' },
  { number: 62, label: '62 - Incisivo Lat. Decíduo Sup. Esq.' },
  { number: 63, label: '63 - Canino Decíduo Sup. Esq.' },
  { number: 64, label: '64 - 1º Molar Decíduo Sup. Esq.' },
  { number: 65, label: '65 - 2º Molar Decíduo Sup. Esq.' },
  { number: 85, label: '85 - 2º Molar Decíduo Inf. Dir.' },
  { number: 84, label: '84 - 1º Molar Decíduo Inf. Dir.' },
  { number: 83, label: '83 - Canino Decíduo Inf. Dir.' },
  { number: 82, label: '82 - Incisivo Lat. Decíduo Inf. Dir.' },
  { number: 81, label: '81 - Incisivo Central Decíduo Inf. Dir.' },
  { number: 71, label: '71 - Incisivo Central Decíduo Inf. Esq.' },
  { number: 72, label: '72 - Incisivo Lat. Decíduo Inf. Esq.' },
  { number: 73, label: '73 - Canino Decíduo Inf. Esq.' },
  { number: 74, label: '74 - 1º Molar Decíduo Inf. Esq.' },
  { number: 75, label: '75 - 2º Molar Decíduo Inf. Esq.' }
];

const DEFAULT_TOOTH_SUMMARIES: ToothPainSummaryItem[] = [
  { id: 'ts-1', toothNumber: 11, calor: false, frio: false, sensibilidadePulpar: false, percussao: false, palpacao: false, mobilidade: '', bolsaV: false, bolsaM: false, bolsaD: false, bolsaL: false, bolsaProfundidade: '', fratura: false, carie: false, fistula: false },
  { id: 'ts-2', toothNumber: 16, calor: false, frio: false, sensibilidadePulpar: false, percussao: false, palpacao: false, mobilidade: '', bolsaV: false, bolsaM: false, bolsaD: false, bolsaL: false, bolsaProfundidade: '', fratura: false, carie: false, fistula: false },
  { id: 'ts-3', toothNumber: 21, calor: false, frio: false, sensibilidadePulpar: false, percussao: false, palpacao: false, mobilidade: '', bolsaV: false, bolsaM: false, bolsaD: false, bolsaL: false, bolsaProfundidade: '', fratura: false, carie: false, fistula: false },
  { id: 'ts-4', toothNumber: 46, calor: false, frio: false, sensibilidadePulpar: false, percussao: false, palpacao: false, mobilidade: '', bolsaV: false, bolsaM: false, bolsaD: false, bolsaL: false, bolsaProfundidade: '', fratura: false, carie: false, fistula: false }
];

export const PainEvaluationExamView: React.FC<PainEvaluationExamViewProps> = ({ patientId }) => {
  const { 
    patients, 
    getClinicalExam, 
    updateClinicalExam, 
    updateToothCondition,
    clinicInfo, 
    activeProfessional, 
    layoutTheme 
  } = useApp();

  const t = getThemeStyles(layoutTheme);
  const currentPatient = patients.find(p => p.id === patientId);
  const clinicalExam = getClinicalExam(patientId);

  const initialPainExam: PainEvaluationExam = clinicalExam.painExam || {
    patientId,
    examType: 'urgencia',
    examDate: new Date().toISOString().split('T')[0],
    chiefComplaint: currentPatient?.anamnesis?.chiefComplaint || '',
    painCharacteristics: {
      provocada: false,
      espontanea: true,
      intermitente: false,
      intensa: true,
      moderada: false,
      precipitadaFrio: false,
      precipitadaCalor: false,
      precipitadaMastigacao: false
    },
    swelling: {
      localizacao: '',
      duracao: '',
      consistencia: ''
    },
    hda: '',
    affectedArea: {
      inspecaoSign: '',
      inspecaoNotes: '',
      percussaoSign: '+',
      percussaoNotes: '',
      palpacaoSign: '',
      palpacaoNotes: '',
      mobilidadeClasse: '0',
      mobilidadeNotes: '',
      outrosAchados: ''
    },
    supplementary: {
      radiografia: '',
      outrosSolicitados: ''
    },
    toothSummaries: DEFAULT_TOOTH_SUMMARIES,
    diagnostico: '',
    tratamentoUrgenciaProposto: '',
    tratamentoExecutado: ''
  };

  const [examState, setExamState] = useState<PainEvaluationExam>(initialPainExam);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showHistoryPreview, setShowHistoryPreview] = useState(true);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const isLoadedRef = useRef(false);
  const currentPatientIdRef = useRef(patientId);

  // Sync state if patient changes
  useEffect(() => {
    isLoadedRef.current = false;
    currentPatientIdRef.current = patientId;
    const exam = getClinicalExam(patientId);
    if (exam.painExam) {
      setExamState(exam.painExam);
    } else {
      setExamState({
        ...initialPainExam,
        patientId,
        chiefComplaint: currentPatient?.anamnesis?.chiefComplaint || ''
      });
    }
    // Allow auto-save after initial load is done
    const t = setTimeout(() => {
      isLoadedRef.current = true;
    }, 150);
    return () => clearTimeout(t);
  }, [patientId]);

  // Debounced Auto-save
  useEffect(() => {
    if (!isLoadedRef.current || currentPatientIdRef.current !== patientId) {
      return;
    }

    setIsAutoSaving(true);
    const handler = setTimeout(() => {
      const updatedExam: PainEvaluationExam = {
        ...examState,
        patientId,
        updatedAt: new Date().toISOString()
      };
      updateClinicalExam(patientId, {
        painExam: updatedExam
      });
      setIsAutoSaving(false);
      setLastSavedTime(new Date().toLocaleTimeString('pt-BR'));
    }, 500);

    return () => clearTimeout(handler);
  }, [examState, patientId]);

  const handleSave = () => {
    const updatedExam: PainEvaluationExam = {
      ...examState,
      patientId,
      updatedAt: new Date().toISOString()
    };
    updateClinicalExam(patientId, {
      painExam: updatedExam
    });
    setLastSavedTime(new Date().toLocaleTimeString('pt-BR'));
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handlePrint = () => {
    handleSave();
    setTimeout(() => {
      printDocumentWithTitle({
        docTitle: 'Ficha_Avaliacao_Dor_Endodontica',
        patientName: currentPatient?.name,
        date: new Date()
      });
    }, 300);
  };

  // Helper for cycling (+)(-) split sign
  const cycleSign = (currentVal: SplitSignValue | string | undefined, isPositive: boolean): SplitSignValue => {
    if (isPositive) {
      if (currentVal === '+') return '++';
      if (currentVal === '++') return '+++';
      if (currentVal === '+++') return '';
      return '+';
    } else {
      if (currentVal === '-') return '--';
      if (currentVal === '--') return '---';
      if (currentVal === '---') return '';
      return '-';
    }
  };

  // Split Sign Button Component (Red '+' on left, Blue '-' on right)
  const SplitSignButton: React.FC<{
    value?: SplitSignValue;
    onChange: (val: SplitSignValue) => void;
    label?: string;
  }> = ({ value = '', onChange, label }) => {
    const isPlus = value.startsWith('+');
    const isMinus = value.startsWith('-');

    return (
      <div className="inline-flex items-center gap-1.5 bg-white border border-slate-200 rounded-2xl p-1 shadow-2xs">
        {label && <span className="text-[11px] font-bold text-slate-700 px-1">{label}:</span>}
        <div className="inline-flex rounded-xl overflow-hidden border border-slate-300 shadow-2xs">
          {/* Positive side (Red) */}
          <button
            type="button"
            onClick={() => onChange(cycleSign(value, true))}
            className={`px-3 py-1.5 text-xs font-black transition flex items-center gap-0.5 cursor-pointer select-none ${
              isPlus
                ? 'bg-red-600 text-white shadow-inner font-extrabold ring-1 ring-red-400'
                : 'bg-red-50 text-red-700 hover:bg-red-100'
            }`}
            title="Sinal Positivo: clique para alternar (+, ++, +++ ou limpar)"
          >
            <span>{isPlus ? value : '+'}</span>
          </button>

          <div className="w-[1px] bg-slate-300"></div>

          {/* Negative side (Blue) */}
          <button
            type="button"
            onClick={() => onChange(cycleSign(value, false))}
            className={`px-3 py-1.5 text-xs font-black transition flex items-center gap-0.5 cursor-pointer select-none ${
              isMinus
                ? 'bg-blue-600 text-white shadow-inner font-extrabold ring-1 ring-blue-400'
                : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
            }`}
            title="Sinal Negativo: clique para alternar (-, --, --- ou limpar)"
          >
            <span>{isMinus ? value : '-'}</span>
          </button>
        </div>

        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="text-[10px] text-slate-400 hover:text-red-500 font-bold px-1"
            title="Limpar sinal"
          >
            ✕
          </button>
        )}
      </div>
    );
  };

  // Sync Tooth Periodontal Pocket (Bolsa) with Odontogram
  const syncToothBolsaToOdontogram = (item: ToothPainSummaryItem) => {
    const activeSurfaces: Partial<Record<ToothSurface, ToothConditionType>> = {};
    if (item.bolsaV) activeSurfaces.vestibular = 'calculo_subgengival';
    if (item.bolsaM) activeSurfaces.mesial = 'calculo_subgengival';
    if (item.bolsaD) activeSurfaces.distal = 'calculo_subgengival';
    if (item.bolsaL) {
      activeSurfaces.lingual = 'calculo_subgengival';
      activeSurfaces.palatina = 'calculo_subgengival';
    }

    if (item.carie) {
      activeSurfaces.oclusal = 'carie';
      activeSurfaces.incisal = 'carie';
    }

    updateToothCondition(patientId, {
      toothNumber: item.toothNumber,
      hasCalculoSub: Boolean(item.bolsaV || item.bolsaM || item.bolsaD || item.bolsaL),
      surfaces: activeSurfaces,
      notes: `Bolsa: Profundidade ${item.bolsaProfundidade || '0'}, Mob: ${item.mobilidade || '0'}${item.fistula ? ', Fístula presente' : ''}${item.fratura ? ', Fratura' : ''}`
    });

    handleSave();
  };

  // Handle Tooth Summary updates
  const updateToothSummary = (idx: number, patch: Partial<ToothPainSummaryItem>) => {
    const list = [...examState.toothSummaries];
    list[idx] = { ...list[idx], ...patch };
    setExamState(prev => ({ ...prev, toothSummaries: list }));
  };

  const addToothSummaryRow = () => {
    const nextId = `ts-${Date.now()}`;
    const nextToothNum = 21;
    setExamState(prev => ({
      ...prev,
      toothSummaries: [
        ...prev.toothSummaries,
        {
          id: nextId,
          toothNumber: nextToothNum,
          calor: false,
          frio: false,
          sensibilidadePulpar: false,
          percussao: false,
          palpacao: false,
          mobilidade: '',
          bolsaV: false,
          bolsaM: false,
          bolsaD: false,
          bolsaL: false,
          bolsaProfundidade: '',
          fratura: false,
          carie: false,
          fistula: false
        }
      ]
    }));
  };

  const removeToothSummaryRow = (idx: number) => {
    if (examState.toothSummaries.length <= 1) return;
    setExamState(prev => ({
      ...prev,
      toothSummaries: prev.toothSummaries.filter((_, i) => i !== idx)
    }));
  };

  // Generate WhatsApp message for this Exam
  const generateWhatsAppMessage = () => {
    const pName = currentPatient?.name || 'Paciente';
    const doctor = activeProfessional?.name || clinicInfo.dentistName || 'Cirurgião-Dentista';
    const cro = activeProfessional?.cro || clinicInfo.cro || '';
    const dateFormatted = examState.examDate.split('-').reverse().join('/');

    let text = `📋 *LAUDO E FICHA DE ${examState.examType === 'urgencia' ? 'EXAME DE URGÊNCIA' : 'EXAME DE ROTINA'}*\n`;
    text += `🏥 *${clinicInfo.name || 'DentisPro Odontologia'}*\n`;
    text += `👤 *Paciente:* ${pName}\n`;
    text += `📅 *Data:* ${dateFormatted}\n\n`;

    if (examState.chiefComplaint) {
      text += `📌 *Queixa Principal:* ${examState.chiefComplaint}\n\n`;
    }

    const painTraits: string[] = [];
    if (examState.painCharacteristics.provocada) painTraits.push('Provocada');
    if (examState.painCharacteristics.espontanea) painTraits.push('Espontânea');
    if (examState.painCharacteristics.intermitente) painTraits.push('Intermitente');
    if (examState.painCharacteristics.intensa) painTraits.push('Intensa');
    if (examState.painCharacteristics.moderada) painTraits.push('Moderada');
    if (examState.painCharacteristics.precipitadaFrio) painTraits.push('Precipitada pelo frio');
    if (examState.painCharacteristics.precipitadaCalor) painTraits.push('Precipitada pelo calor');
    if (examState.painCharacteristics.precipitadaMastigacao) painTraits.push('Precipitada pela mastigação');

    if (painTraits.length > 0) {
      text += `⚡ *Características da Dor:* ${painTraits.join(', ')}\n`;
    }

    if (examState.swelling.localizacao || examState.swelling.duracao || examState.swelling.consistencia) {
      text += `🔍 *Tumefação:* ${[examState.swelling.localizacao, examState.swelling.duracao, examState.swelling.consistencia].filter(Boolean).join(' • ')}\n`;
    }

    if (examState.hda) {
      text += `📖 *História da Doença Atual:* ${examState.hda}\n`;
    }

    text += `\n🦷 *RESUMO DOS DENTES AVALIADOS:*\n`;
    examState.toothSummaries.forEach(ts => {
      const tests: string[] = [];
      if (ts.calor) tests.push('Calor (+)');
      if (ts.frio) tests.push('Frio (+)');
      if (ts.sensibilidadePulpar) tests.push('Sensib. Pulpar (+)');
      if (ts.percussao) tests.push('Percussão (+)');
      if (ts.palpacao) tests.push('Palpação (+)');
      if (ts.mobilidade && ts.mobilidade !== '0') tests.push(`Mobilidade Cl.${ts.mobilidade}`);
      const bolsaFaces = [ts.bolsaV ? 'V' : '', ts.bolsaM ? 'M' : '', ts.bolsaD ? 'D' : '', ts.bolsaL ? 'L' : ''].filter(Boolean);
      if (bolsaFaces.length > 0) tests.push(`Bolsa (${bolsaFaces.join('')}${ts.bolsaProfundidade ? ` Prof.${ts.bolsaProfundidade}` : ''})`);
      if (ts.fratura) tests.push('Fratura');
      if (ts.carie) tests.push('Cárie');
      if (ts.fistula) tests.push('Fístula');

      text += `• *Dente #${ts.toothNumber}:* ${tests.length > 0 ? tests.join(', ') : 'Sem alterações detectadas'}\n`;
    });

    if (examState.diagnostico) {
      text += `\n🎯 *Diagnóstico:* ${examState.diagnostico}\n`;
    }
    if (examState.tratamentoUrgenciaProposto) {
      text += `🛠️ *Tratamento Proposto:* ${examState.tratamentoUrgenciaProposto}\n`;
    }
    if (examState.tratamentoExecutado) {
      text += `✅ *Tratamento Executado:* ${examState.tratamentoExecutado}\n`;
    }

    text += `\nAtenciosamente,\n*${doctor}*\n${cro ? `${cro} • ` : ''}Cirurgião-Dentista`;
    return text;
  };

  const handleOpenWhatsApp = () => {
    const cleanDigits = (currentPatient?.phone || '').replace(/\D/g, '');
    const phoneWithCountry = cleanDigits ? (cleanDigits.startsWith('55') ? cleanDigits : `55${cleanDigits}`) : '';
    const text = generateWhatsAppMessage();
    const url = phoneWithCountry
      ? `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(text)}`
      : `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const anamnesis = currentPatient?.anamnesis;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {saveSuccess && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-3 rounded-2xl text-xs font-bold flex items-center justify-between shadow-sm animate-fadeIn print:hidden">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Exame de Dor / Urgência e Diagnóstico Odontológico salvo com sucesso no prontuário!</span>
          </div>
        </div>
      )}

      {/* Main Printable Exam Sheet */}
      <div className="bg-white border border-[#e5e5d1] rounded-[32px] p-4 sm:p-8 shadow-sm space-y-6 print:border-none print:shadow-none print:p-0">
        
        {/* Header: EXAME DE ROTINA / EXAME DE URGÊNCIA Toggle Switch */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e5e5d1] pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-2xl bg-amber-500/10 text-amber-900 border border-amber-500/20">
                <Stethoscope className="w-5 h-5 text-amber-700" />
              </span>
              <h2 className="text-xl font-bold text-slate-900 font-serif tracking-tight">
                Ficha Diagnóstica e Avaliação de Dor
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              Mapeamento de queixas álgicas, exames físicos por dente e conduta odontológica.
            </p>
          </div>

          {/* Segmented Switch: EXAME DE ROTINA vs EXAME DE URGÊNCIA */}
          <div className="inline-flex p-1 bg-slate-100 rounded-2xl border border-slate-200 shadow-inner">
            <button
              type="button"
              onClick={() => setExamState(prev => ({ ...prev, examType: 'rotina' }))}
              className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer select-none flex items-center gap-1.5 ${
                examState.examType === 'rotina'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>EXAME DE ROTINA</span>
            </button>

            <button
              type="button"
              onClick={() => setExamState(prev => ({ ...prev, examType: 'urgencia' }))}
              className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer select-none flex items-center gap-1.5 ${
                examState.examType === 'urgencia'
                  ? 'bg-red-600 text-white shadow-md ring-2 ring-red-400/40'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-300" />
              <span>EXAME DE URGÊNCIA</span>
            </button>
          </div>
        </div>

        {/* Patient Identification Header Strip (Pre-filled & Editable) */}
        <div className="bg-[#fbfbf9] rounded-2xl border border-[#e5e5d1] p-4 text-xs space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <span className="text-[11px] font-bold text-slate-500 block mb-0.5">Nome do Paciente:</span>
              <p className="text-sm font-bold text-slate-900">{currentPatient?.name || 'Não informado'}</p>
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-500 block mb-0.5">Ficha nº:</span>
              <p className="text-sm font-mono font-bold text-slate-800">#{currentPatient?.id?.replace('pat-', '') || '001'}</p>
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-500 block mb-0.5">Telefone / WhatsApp:</span>
              <p className="text-sm font-bold text-slate-800">{currentPatient?.phone || 'Não cadastrado'}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-[#e5e5d1]">
            <div>
              <span className="text-[10px] font-bold text-slate-500 block">Endereço:</span>
              <p className="text-xs text-slate-700 truncate">{currentPatient?.address?.street ? `${currentPatient.address.street}, ${currentPatient.address.number || ''}` : 'Consultório'}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 block">Sexo / Gênero:</span>
              <p className="text-xs font-semibold text-slate-700 capitalize">{currentPatient?.gender || 'Não informado'}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 block">Data de Nascimento:</span>
              <p className="text-xs text-slate-700">{currentPatient?.birthDate ? currentPatient.birthDate.split('-').reverse().join('/') : 'Não informada'}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 block">Data do Exame:</span>
              <input
                type="date"
                value={examState.examDate}
                onChange={(e) => setExamState(prev => ({ ...prev, examDate: e.target.value }))}
                className="bg-white border border-slate-300 rounded-lg px-2 py-0.5 text-xs font-bold text-slate-800 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* HISTÓRIA CLÍNICA */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
            <h3 className="text-sm font-black text-slate-800 tracking-wider uppercase flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-600" />
              História Clínica & Avaliação de Dor
            </h3>
          </div>

          {/* Queixa Principal */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>Queixa Principal:</span>
              <span className="text-[10px] text-slate-400 font-normal">Motivo relatado pelo paciente</span>
            </label>
            <input
              type="text"
              value={examState.chiefComplaint}
              onChange={(e) => setExamState(prev => ({ ...prev, chiefComplaint: e.target.value }))}
              placeholder="Ex: Dor latejante intensa no dente inferior esquerdo ao mastigar e com água fria..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Características da Dor (Selectable Pill Buttons based on image.png script) */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 block">
              Características da Dor (Clique para selecionar):
            </label>

            <div className="flex flex-wrap gap-2">
              {/* Provocada */}
              <button
                type="button"
                onClick={() => setExamState(prev => ({
                  ...prev,
                  painCharacteristics: { ...prev.painCharacteristics, provocada: !prev.painCharacteristics.provocada }
                }))}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition shadow-2xs cursor-pointer select-none ${
                  examState.painCharacteristics.provocada
                    ? 'bg-amber-600 text-white ring-2 ring-amber-400'
                    : 'bg-white text-slate-700 border border-slate-300 hover:bg-amber-50'
                }`}
              >
                Dor provocada
              </button>

              {/* Espontânea */}
              <button
                type="button"
                onClick={() => setExamState(prev => ({
                  ...prev,
                  painCharacteristics: { ...prev.painCharacteristics, espontanea: !prev.painCharacteristics.espontanea }
                }))}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition shadow-2xs cursor-pointer select-none ${
                  examState.painCharacteristics.espontanea
                    ? 'bg-red-600 text-white ring-2 ring-red-400'
                    : 'bg-white text-slate-700 border border-slate-300 hover:bg-red-50'
                }`}
              >
                Dor espontânea
              </button>

              {/* Intermitente */}
              <button
                type="button"
                onClick={() => setExamState(prev => ({
                  ...prev,
                  painCharacteristics: { ...prev.painCharacteristics, intermitente: !prev.painCharacteristics.intermitente }
                }))}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition shadow-2xs cursor-pointer select-none ${
                  examState.painCharacteristics.intermitente
                    ? 'bg-purple-600 text-white ring-2 ring-purple-400'
                    : 'bg-white text-slate-700 border border-slate-300 hover:bg-purple-50'
                }`}
              >
                Dor intermitente
              </button>

              {/* Intensa */}
              <button
                type="button"
                onClick={() => setExamState(prev => ({
                  ...prev,
                  painCharacteristics: { 
                    ...prev.painCharacteristics, 
                    intensa: !prev.painCharacteristics.intensa,
                    moderada: !prev.painCharacteristics.intensa ? false : prev.painCharacteristics.moderada
                  }
                }))}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition shadow-2xs cursor-pointer select-none ${
                  examState.painCharacteristics.intensa
                    ? 'bg-rose-700 text-white ring-2 ring-rose-500'
                    : 'bg-white text-slate-700 border border-slate-300 hover:bg-rose-50'
                }`}
              >
                Dor intensa
              </button>

              {/* Moderada */}
              <button
                type="button"
                onClick={() => setExamState(prev => ({
                  ...prev,
                  painCharacteristics: { 
                    ...prev.painCharacteristics, 
                    moderada: !prev.painCharacteristics.moderada,
                    intensa: !prev.painCharacteristics.moderada ? false : prev.painCharacteristics.intensa
                  }
                }))}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition shadow-2xs cursor-pointer select-none ${
                  examState.painCharacteristics.moderada
                    ? 'bg-amber-500 text-white ring-2 ring-amber-300'
                    : 'bg-white text-slate-700 border border-slate-300 hover:bg-amber-50'
                }`}
              >
                Dor moderada
              </button>

              {/* Precipitada pelo frio */}
              <button
                type="button"
                onClick={() => setExamState(prev => ({
                  ...prev,
                  painCharacteristics: { ...prev.painCharacteristics, precipitadaFrio: !prev.painCharacteristics.precipitadaFrio }
                }))}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition shadow-2xs cursor-pointer select-none flex items-center gap-1 ${
                  examState.painCharacteristics.precipitadaFrio
                    ? 'bg-blue-600 text-white ring-2 ring-blue-300'
                    : 'bg-white text-slate-700 border border-slate-300 hover:bg-blue-50'
                }`}
              >
                <Snowflake className="w-3 h-3" />
                <span>Precipitada pelo frio</span>
              </button>

              {/* Precipitada pelo calor */}
              <button
                type="button"
                onClick={() => setExamState(prev => ({
                  ...prev,
                  painCharacteristics: { ...prev.painCharacteristics, precipitadaCalor: !prev.painCharacteristics.precipitadaCalor }
                }))}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition shadow-2xs cursor-pointer select-none flex items-center gap-1 ${
                  examState.painCharacteristics.precipitadaCalor
                    ? 'bg-orange-600 text-white ring-2 ring-orange-400'
                    : 'bg-white text-slate-700 border border-slate-300 hover:bg-orange-50'
                }`}
              >
                <Flame className="w-3 h-3" />
                <span>Precipitada pelo calor</span>
              </button>

              {/* Precipitada pela mastigação */}
              <button
                type="button"
                onClick={() => setExamState(prev => ({
                  ...prev,
                  painCharacteristics: { ...prev.painCharacteristics, precipitadaMastigacao: !prev.painCharacteristics.precipitadaMastigacao }
                }))}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition shadow-2xs cursor-pointer select-none ${
                  examState.painCharacteristics.precipitadaMastigacao
                    ? 'bg-amber-800 text-white ring-2 ring-amber-600'
                    : 'bg-white text-slate-700 border border-slate-300 hover:bg-amber-50'
                }`}
              >
                Precipitada pela mastigação
              </button>
            </div>
          </div>

          {/* Tumefação (Localização, Duração, Consistência) */}
          <div className="bg-slate-50/80 rounded-2xl border border-slate-200 p-3.5 space-y-3">
            <span className="text-xs font-bold text-slate-800 block">Tumefação / Edema:</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] text-slate-600 block mb-1">Localização:</label>
                <input
                  type="text"
                  value={examState.swelling.localizacao}
                  onChange={(e) => setExamState(prev => ({
                    ...prev,
                    swelling: { ...prev.swelling, localizacao: e.target.value }
                  }))}
                  placeholder="Ex: Fundo de sulco vestibular dente 46"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-600 block mb-1">Duração:</label>
                <input
                  type="text"
                  value={examState.swelling.duracao}
                  onChange={(e) => setExamState(prev => ({
                    ...prev,
                    swelling: { ...prev.swelling, duracao: e.target.value }
                  }))}
                  placeholder="Ex: 2 dias, 24 horas"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-600 block mb-1">Consistência:</label>
                <input
                  type="text"
                  value={examState.swelling.consistencia}
                  onChange={(e) => setExamState(prev => ({
                    ...prev,
                    swelling: { ...prev.swelling, consistencia: e.target.value }
                  }))}
                  placeholder="Ex: Flutuante, Mole, Endurecida"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* História da Doença Atual (HDA) */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">
              História da Doença Atual (HDA):
            </label>
            <textarea
              rows={2}
              value={examState.hda}
              onChange={(e) => setExamState(prev => ({ ...prev, hda: e.target.value }))}
              placeholder="Descreva a evolução temporal dos sintomas, fatores de melhora/piora, analgesia prévia..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* ÁREA AFETADA (EXAME FÍSICO COM BOTÃO (+)(-) DUAL VERMELHO/AZUL) */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
            <h3 className="text-sm font-black text-slate-800 tracking-wider uppercase flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-rose-600" />
              Área Afetada & Sinais Físicos
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Inspeção */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">Inspeção:</span>
                <SplitSignButton
                  value={examState.affectedArea.inspecaoSign}
                  onChange={(sign) => setExamState(prev => ({
                    ...prev,
                    affectedArea: { ...prev.affectedArea, inspecaoSign: sign }
                  }))}
                />
              </div>
              <input
                type="text"
                value={examState.affectedArea.inspecaoNotes}
                onChange={(e) => setExamState(prev => ({
                  ...prev,
                  affectedArea: { ...prev.affectedArea, inspecaoNotes: e.target.value }
                }))}
                placeholder="Anotações da inspeção visual (hiperemia, tumefação, lesão)..."
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none"
              />
            </div>

            {/* Percussão */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">Percussão (Vertical/Horizontal):</span>
                <SplitSignButton
                  value={examState.affectedArea.percussaoSign}
                  onChange={(sign) => setExamState(prev => ({
                    ...prev,
                    affectedArea: { ...prev.affectedArea, percussaoSign: sign }
                  }))}
                />
              </div>
              <input
                type="text"
                value={examState.affectedArea.percussaoNotes}
                onChange={(e) => setExamState(prev => ({
                  ...prev,
                  affectedArea: { ...prev.affectedArea, percussaoNotes: e.target.value }
                }))}
                placeholder="Anotações de percussão (sensível verticalmente, ligamento inflamado)..."
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none"
              />
            </div>

            {/* Palpação */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">Palpação (Ápice / Fundo de Sulco):</span>
                <SplitSignButton
                  value={examState.affectedArea.palpacaoSign}
                  onChange={(sign) => setExamState(prev => ({
                    ...prev,
                    affectedArea: { ...prev.affectedArea, palpacaoSign: sign }
                  }))}
                />
              </div>
              <input
                type="text"
                value={examState.affectedArea.palpacaoNotes}
                onChange={(e) => setExamState(prev => ({
                  ...prev,
                  affectedArea: { ...prev.affectedArea, palpacaoNotes: e.target.value }
                }))}
                placeholder="Anotações de palpação periapical..."
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none"
              />
            </div>

            {/* Mobilidade Classe (0, 1, 2, 3) */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">Mobilidade Classe:</span>
                <div className="inline-flex rounded-xl overflow-hidden border border-slate-300 bg-white shadow-2xs">
                  {(['0', '1', '2', '3'] as MobilityClass[]).map(mc => {
                    const isSelected = examState.affectedArea.mobilidadeClasse === mc;
                    return (
                      <button
                        key={mc}
                        type="button"
                        onClick={() => setExamState(prev => ({
                          ...prev,
                          affectedArea: { ...prev.affectedArea, mobilidadeClasse: mc }
                        }))}
                        className={`px-3 py-1 text-xs font-bold transition cursor-pointer ${
                          isSelected
                            ? 'bg-amber-600 text-white font-black shadow-inner'
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        Classe {mc}
                      </button>
                    );
                  })}
                </div>
              </div>
              <input
                type="text"
                value={examState.affectedArea.mobilidadeNotes}
                onChange={(e) => setExamState(prev => ({
                  ...prev,
                  affectedArea: { ...prev.affectedArea, mobilidadeNotes: e.target.value }
                }))}
                placeholder="Anotações de mobilidade dental..."
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none"
              />
            </div>
          </div>

          {/* Outros Achados */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">Outros achados clínicos:</label>
            <input
              type="text"
              value={examState.affectedArea.outrosAchados}
              onChange={(e) => setExamState(prev => ({
                ...prev,
                affectedArea: { ...prev.affectedArea, outrosAchados: e.target.value }
              }))}
              placeholder="Ex: Faceta de desgaste oclusal acentuada, trinca em esmalte, contato prematuro..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        {/* RECURSOS SUPLEMENTARES DE EXAME */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
            <h3 className="text-sm font-black text-slate-800 tracking-wider uppercase flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-cyan-700" />
              Recursos Suplementares de Exame
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">Radiografia:</label>
              <input
                type="text"
                value={examState.supplementary.radiografia}
                onChange={(e) => setExamState(prev => ({
                  ...prev,
                  supplementary: { ...prev.supplementary, radiografia: e.target.value }
                }))}
                placeholder="Ex: Periapical: espessamento do espaço periodontal apical, lesão periapical circunscrita..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">Outros Solicitados:</label>
              <input
                type="text"
                value={examState.supplementary.outrosSolicitados}
                onChange={(e) => setExamState(prev => ({
                  ...prev,
                  supplementary: { ...prev.supplementary, outrosSolicitados: e.target.value }
                }))}
                placeholder="Ex: Tomografia Cone-Beam, teste de vitalidade elétrico..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* RESUMO POR DENTE (DIAGNÓSTICO DENTÁRIO INDIVIDUAL COM ROLAGEM VERTICAL FDI & BOTÕES EM PÍLULA) */}
        <div className="space-y-4 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
            <div>
              <h3 className="text-sm font-black text-slate-800 tracking-wider uppercase flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" />
                Resumo por Dente (Testes, Bolsa Periodontal 4 Faces & Condições)
              </h3>
              <p className="text-[11px] text-slate-500">
                Selecione o número do dente na barra vertical FDI e marque os testes pulpares, periodontais e faces de bolsa.
              </p>
            </div>

            <button
              type="button"
              onClick={addToothSummaryRow}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-2xs flex items-center gap-1.5 self-start cursor-pointer transition print:hidden"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Adicionar Dente</span>
            </button>
          </div>

          <div className="space-y-4">
            {examState.toothSummaries.map((item, idx) => (
              <div 
                key={item.id || idx}
                className="bg-[#fbfbf9] rounded-2xl border border-slate-300 p-4 space-y-3.5 shadow-2xs relative"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-2.5">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-slate-800 text-white text-xs font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>

                    {/* Dente Número: Input Direto + Dropdown Vertical FDI */}
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-bold text-slate-800 shrink-0">Dente número:</label>
                      <select
                        value={item.toothNumber}
                        onChange={(e) => updateToothSummary(idx, { toothNumber: parseInt(e.target.value, 10) || 11 })}
                        className="bg-white border-2 border-amber-500/80 rounded-xl px-3 py-1.5 text-xs font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 max-h-48 overflow-y-auto cursor-pointer shadow-xs"
                      >
                        <optgroup label="Arcada Superior Direita (Q1)">
                          {ALL_FDI_TEETH.slice(0, 8).map(t => (
                            <option key={t.number} value={t.number}>{t.label}</option>
                          ))}
                        </optgroup>
                        <optgroup label="Arcada Superior Esquerda (Q2)">
                          {ALL_FDI_TEETH.slice(8, 16).map(t => (
                            <option key={t.number} value={t.number}>{t.label}</option>
                          ))}
                        </optgroup>
                        <optgroup label="Arcada Inferior Direita (Q4)">
                          {ALL_FDI_TEETH.slice(16, 24).map(t => (
                            <option key={t.number} value={t.number}>{t.label}</option>
                          ))}
                        </optgroup>
                        <optgroup label="Arcada Inferior Esquerda (Q3)">
                          {ALL_FDI_TEETH.slice(24, 32).map(t => (
                            <option key={t.number} value={t.number}>{t.label}</option>
                          ))}
                        </optgroup>
                        <optgroup label="Dentes Decíduos (Infantis)">
                          {ALL_FDI_TEETH.slice(32).map(t => (
                            <option key={t.number} value={t.number}>{t.label}</option>
                          ))}
                        </optgroup>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => syncToothBolsaToOdontogram(item)}
                      className="px-2.5 py-1 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-300 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer print:hidden"
                      title="Refletir achados deste dente no Odontograma"
                    >
                      <Layers className="w-3 h-3 text-sky-600" />
                      <span>Sincronizar no Odontograma</span>
                    </button>

                    {examState.toothSummaries.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeToothSummaryRow(idx)}
                        className="p-1 text-slate-400 hover:text-red-600 transition rounded-lg print:hidden cursor-pointer"
                        title="Remover linha"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Testes e Condições (Selectable Pills according to image.png) */}
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    {/* Calor */}
                    <button
                      type="button"
                      onClick={() => updateToothSummary(idx, { calor: !item.calor })}
                      className={`px-3 py-1 rounded-full font-bold transition shadow-2xs cursor-pointer select-none flex items-center gap-1 ${
                        item.calor
                          ? 'bg-orange-600 text-white ring-2 ring-orange-300'
                          : 'bg-white text-slate-700 border border-slate-300 hover:bg-orange-50'
                      }`}
                    >
                      <Flame className="w-3 h-3" />
                      <span>Calor</span>
                    </button>

                    {/* Frio */}
                    <button
                      type="button"
                      onClick={() => updateToothSummary(idx, { frio: !item.frio })}
                      className={`px-3 py-1 rounded-full font-bold transition shadow-2xs cursor-pointer select-none flex items-center gap-1 ${
                        item.frio
                          ? 'bg-blue-600 text-white ring-2 ring-blue-300'
                          : 'bg-white text-slate-700 border border-slate-300 hover:bg-blue-50'
                      }`}
                    >
                      <Snowflake className="w-3 h-3" />
                      <span>Frio</span>
                    </button>

                    {/* Sensibilidade pulpar */}
                    <button
                      type="button"
                      onClick={() => updateToothSummary(idx, { sensibilidadePulpar: !item.sensibilidadePulpar })}
                      className={`px-3 py-1 rounded-full font-bold transition shadow-2xs cursor-pointer select-none flex items-center gap-1 ${
                        item.sensibilidadePulpar
                          ? 'bg-amber-400 text-slate-950 font-black ring-2 ring-amber-300'
                          : 'bg-white text-slate-700 border border-slate-300 hover:bg-amber-50'
                      }`}
                    >
                      <Zap className="w-3 h-3" />
                      <span>Sensibilidade pulpar</span>
                    </button>

                    {/* Percussão */}
                    <button
                      type="button"
                      onClick={() => updateToothSummary(idx, { percussao: !item.percussao })}
                      className={`px-3 py-1 rounded-full font-bold transition shadow-2xs cursor-pointer select-none ${
                        item.percussao
                          ? 'bg-red-600 text-white ring-2 ring-red-300'
                          : 'bg-white text-slate-700 border border-slate-300 hover:bg-red-50'
                      }`}
                    >
                      Percussão
                    </button>

                    {/* Palpação */}
                    <button
                      type="button"
                      onClick={() => updateToothSummary(idx, { palpacao: !item.palpacao })}
                      className={`px-3 py-1 rounded-full font-bold transition shadow-2xs cursor-pointer select-none ${
                        item.palpacao
                          ? 'bg-purple-600 text-white ring-2 ring-purple-300'
                          : 'bg-white text-slate-700 border border-slate-300 hover:bg-purple-50'
                      }`}
                    >
                      Palpação
                    </button>

                    {/* Fratura */}
                    <button
                      type="button"
                      onClick={() => updateToothSummary(idx, { fratura: !item.fratura })}
                      className={`px-3 py-1 rounded-full font-bold transition shadow-2xs cursor-pointer select-none ${
                        item.fratura
                          ? 'bg-orange-700 text-white ring-2 ring-orange-400'
                          : 'bg-white text-slate-700 border border-slate-300 hover:bg-orange-50'
                      }`}
                    >
                      Fratura
                    </button>

                    {/* Cárie */}
                    <button
                      type="button"
                      onClick={() => updateToothSummary(idx, { carie: !item.carie })}
                      className={`px-3 py-1 rounded-full font-bold transition shadow-2xs cursor-pointer select-none ${
                        item.carie
                          ? 'bg-red-500 text-white ring-2 ring-red-300'
                          : 'bg-white text-slate-700 border border-slate-300 hover:bg-red-50'
                      }`}
                    >
                      Cárie
                    </button>

                    {/* Fístula */}
                    <button
                      type="button"
                      onClick={() => updateToothSummary(idx, { fistula: !item.fistula })}
                      className={`px-3 py-1 rounded-full font-bold transition shadow-2xs cursor-pointer select-none ${
                        item.fistula
                          ? 'bg-fuchsia-700 text-white ring-2 ring-fuchsia-400'
                          : 'bg-white text-slate-700 border border-slate-300 hover:bg-fuchsia-50'
                      }`}
                    >
                      Fístula
                    </button>
                  </div>

                  {/* Mobilidade Classe (0, 1, 2, 3 - Seleção Única) */}
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <div className="flex items-center gap-1.5 bg-white border border-slate-300 rounded-xl px-2.5 py-1">
                      <span className="text-[11px] font-bold text-slate-700">Mobilidade:</span>
                      <div className="inline-flex rounded-lg overflow-hidden border border-slate-200">
                        {(['0', '1', '2', '3'] as MobilityClass[]).map(mc => (
                          <button
                            key={mc}
                            type="button"
                            onClick={() => updateToothSummary(idx, { mobilidade: item.mobilidade === mc ? '' : mc })}
                            className={`px-2 py-0.5 text-[10.5px] font-black transition cursor-pointer ${
                              item.mobilidade === mc
                                ? 'bg-amber-600 text-white'
                                : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            {mc}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Bolsa Periodontal (4 Faces: V, M, D, L) */}
                    <div className="flex items-center gap-1.5 bg-white border border-slate-300 rounded-xl px-2.5 py-1">
                      <span className="text-[11px] font-bold text-slate-700">Bolsa Faces:</span>
                      <div className="inline-flex gap-1">
                        {/* V (Vestibular) */}
                        <button
                          type="button"
                          onClick={() => updateToothSummary(idx, { bolsaV: !item.bolsaV })}
                          className={`w-6 h-6 rounded-lg text-xs font-black transition flex items-center justify-center cursor-pointer ${
                            item.bolsaV
                              ? 'bg-amber-800 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                          title="Bolsa na Face Vestibular (V)"
                        >
                          V
                        </button>
                        {/* M (Mesial) */}
                        <button
                          type="button"
                          onClick={() => updateToothSummary(idx, { bolsaM: !item.bolsaM })}
                          className={`w-6 h-6 rounded-lg text-xs font-black transition flex items-center justify-center cursor-pointer ${
                            item.bolsaM
                              ? 'bg-amber-800 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                          title="Bolsa na Face Mesial (M)"
                        >
                          M
                        </button>
                        {/* D (Distal) */}
                        <button
                          type="button"
                          onClick={() => updateToothSummary(idx, { bolsaD: !item.bolsaD })}
                          className={`w-6 h-6 rounded-lg text-xs font-black transition flex items-center justify-center cursor-pointer ${
                            item.bolsaD
                              ? 'bg-amber-800 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                          title="Bolsa na Face Distal (D)"
                        >
                          D
                        </button>
                        {/* L (Lingual/Palatina) */}
                        <button
                          type="button"
                          onClick={() => updateToothSummary(idx, { bolsaL: !item.bolsaL })}
                          className={`w-6 h-6 rounded-lg text-xs font-black transition flex items-center justify-center cursor-pointer ${
                            item.bolsaL
                              ? 'bg-amber-800 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                          title="Bolsa na Face Lingual/Palatina (L)"
                        >
                          L
                        </button>
                      </div>
                    </div>

                    {/* Profundidade da Bolsa (0, 1, 2, 3 - Seleção Única Exclusiva) */}
                    <div className="flex items-center gap-1.5 bg-white border border-slate-300 rounded-xl px-2.5 py-1">
                      <span className="text-[11px] font-bold text-slate-700">Profundidade da Bolsa:</span>
                      <div className="inline-flex rounded-lg overflow-hidden border border-slate-200">
                        {(['0', '1', '2', '3'] as PocketDepth[]).map(pd => (
                          <button
                            key={pd}
                            type="button"
                            onClick={() => updateToothSummary(idx, { bolsaProfundidade: item.bolsaProfundidade === pd ? '' : pd })}
                            className={`px-2 py-0.5 text-[10.5px] font-black transition cursor-pointer ${
                              item.bolsaProfundidade === pd
                                ? 'bg-amber-900 text-white'
                                : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            {pd}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CONCLUSÕES & CONDUTA */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
            <h3 className="text-sm font-black text-slate-800 tracking-wider uppercase flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Conclusões, Diagnóstico & Conduta
            </h3>
          </div>

          <div className="space-y-3">
            {/* Diagnóstico */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">Diagnóstico Odontológico:</label>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-slate-400">Sugestões rápidas:</span>
                  <button
                    type="button"
                    onClick={() => setExamState(prev => ({ ...prev, diagnostico: 'Pulpite Irreversível Sintomática' }))}
                    className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded cursor-pointer"
                  >
                    Pulpite
                  </button>
                  <button
                    type="button"
                    onClick={() => setExamState(prev => ({ ...prev, diagnostico: 'Abscesso Periapical Agudo' }))}
                    className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded cursor-pointer"
                  >
                    Abscesso
                  </button>
                  <button
                    type="button"
                    onClick={() => setExamState(prev => ({ ...prev, diagnostico: 'Necrose Pulpar com Periodontite Apical' }))}
                    className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded cursor-pointer"
                  >
                    Necrose
                  </button>
                </div>
              </div>
              <input
                type="text"
                value={examState.diagnostico}
                onChange={(e) => setExamState(prev => ({ ...prev, diagnostico: e.target.value }))}
                placeholder="Ex: Pulpite Irreversível Sintomática no dente 46 provocada por lesão cariosa profunda..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none"
              />
            </div>

            {/* Tratamento de Urgência Proposto */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">Tratamento de Urgência Proposto:</label>
              <input
                type="text"
                value={examState.tratamentoUrgenciaProposto}
                onChange={(e) => setExamState(prev => ({ ...prev, tratamentoUrgenciaProposto: e.target.value }))}
                placeholder="Ex: Pulpectomia de urgência, remoção do tecido carioso, curativo de demora e restauração provisória..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none"
              />
            </div>

            {/* Tratamento Executado */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">Tratamento Executado:</label>
              <input
                type="text"
                value={examState.tratamentoExecutado}
                onChange={(e) => setExamState(prev => ({ ...prev, tratamentoExecutado: e.target.value }))}
                placeholder="Ex: Anestesia infiltrativa, isolamento absoluto, odontometria eletrônica, medicação Otosporin e selamento com CIV..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* HISTÓRIA PREGRESSA (MÉDICA) INTEGRADA COM ANAMNESE */}
        {anamnesis && (
          <div className="bg-[#fcfcfa] rounded-2xl border border-amber-200/80 p-4 space-y-3 print:border print:border-slate-300">
            <div 
              onClick={() => setShowHistoryPreview(!showHistoryPreview)}
              className="flex items-center justify-between cursor-pointer select-none"
            >
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-600" />
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  História Pregressa (Histórico Médico Integrado da Anamnese)
                </h4>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${showHistoryPreview ? 'rotate-180' : ''}`} />
            </div>

            {showHistoryPreview && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-2 text-xs border-t border-amber-100">
                <div className="p-2 rounded-xl bg-white border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Boa Saúde Geral:</span>
                  <span className="font-bold text-slate-800">
                    {anamnesis.hasGoodHealth !== false ? '✅ Sim (Boa saúde)' : '⚠️ Alterada'}
                  </span>
                </div>

                <div className="p-2 rounded-xl bg-white border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Tratamento Médico Atual:</span>
                  <span className="font-bold text-slate-800">
                    {anamnesis.isUndergoingMedicalTreatment ? `⚠️ Sim: ${anamnesis.medicalTreatmentDetails || 'Em andamento'}` : 'Não'}
                  </span>
                </div>

                <div className="p-2 rounded-xl bg-white border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Alergias:</span>
                  <span className={`font-bold ${anamnesis.hasAllergies ? 'text-red-600' : 'text-slate-800'}`}>
                    {anamnesis.hasAllergies ? `🔴 Sim (${anamnesis.allergyDetails || 'Presente'})` : 'Não referidas'}
                  </span>
                </div>

                <div className="p-2 rounded-xl bg-white border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Cardiopatia / Pressão:</span>
                  <span className="font-bold text-slate-800">
                    {anamnesis.hasHeartDisease ? '⚠️ Cardiopatia' : ''} {anamnesis.hasHypertension ? '⚠️ Hipertensão' : ''} {anamnesis.hasRheumaticFever ? '⚠️ Febre Reumática' : ''} {!anamnesis.hasHeartDisease && !anamnesis.hasHypertension && !anamnesis.hasRheumaticFever ? 'Normal' : ''}
                  </span>
                </div>

                <div className="p-2 rounded-xl bg-white border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Asma / Sinusite / Respiratório:</span>
                  <span className="font-bold text-slate-800">
                    {anamnesis.hasAsthma ? '⚠️ Asma' : ''} {anamnesis.hasSinusitis ? '⚠️ Sinusite' : ''} {!anamnesis.hasAsthma && !anamnesis.hasSinusitis ? 'Sem alterações' : ''}
                  </span>
                </div>

                <div className="p-2 rounded-xl bg-white border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Diabetes / Hepatite / Epilepsia:</span>
                  <span className="font-bold text-slate-800">
                    {anamnesis.hasDiabetes ? '⚠️ Diabetes' : ''} {anamnesis.hasHepatitis ? '⚠️ Hepatite' : ''} {anamnesis.hasSeizures || anamnesis.hasFaintingSpells ? '⚠️ Convulsões/Desmaios' : ''} {!anamnesis.hasDiabetes && !anamnesis.hasHepatitis && !anamnesis.hasSeizures && !anamnesis.hasFaintingSpells ? 'Nenhum' : ''}
                  </span>
                </div>

                <div className="p-2 rounded-xl bg-white border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Radioterapia Face/Maxilares:</span>
                  <span className="font-bold text-slate-800">
                    {anamnesis.hasRadiationTherapyFaceJaw ? '🔴 Sim (Raios-X / Radioterapia)' : 'Não'}
                  </span>
                </div>

                <div className="p-2 rounded-xl bg-white border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Traumatismo na Face/Maxilares:</span>
                  <span className="font-bold text-slate-800">
                    {anamnesis.hasFaceJawTrauma ? `⚠️ Sim (${anamnesis.faceJawTraumaDetails || 'Registrado'})` : 'Não'}
                  </span>
                </div>

                <div className="p-2 rounded-xl bg-white border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Medicamentos em Uso:</span>
                  <span className="font-bold text-slate-800 truncate">
                    {anamnesis.continuousMedication || 'Nenhum de uso contínuo'}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200 print:hidden">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Ficha Diagnóstica</span>
            </button>

            {/* Auto-save Status Indicator */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600">
              {isAutoSaving ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                  <span className="font-medium text-amber-700">Salvando alterações...</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className="text-slate-600">
                    Auto-salvo {lastSavedTime ? `às ${lastSavedTime}` : 'automaticamente'}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleOpenWhatsApp}
              className="px-4 py-2.5 bg-[#25d366] hover:bg-[#20bd5a] text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-1.5 cursor-pointer"
              title="Enviar laudo de dor e urgência pelo WhatsApp"
            >
              <Send className="w-4 h-4" />
              <span>WhatsApp</span>
            </button>

            {/* Standardized "Imprimir" button per AGENTS.md user rule */}
            <button
              type="button"
              onClick={handlePrint}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-1.5 cursor-pointer"
              title="Disparar impressão da ficha"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
