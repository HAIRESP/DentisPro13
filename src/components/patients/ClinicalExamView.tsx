import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Odontogram } from './Odontogram';
import { PainEvaluationExamView } from './PainEvaluationExamView';
import { ImageGalleryWithEditor } from '../common/ImageGalleryWithEditor';
import { DocumentSignatureFooter } from '../common/DocumentSignatureFooter';
import { printDocumentWithTitle } from '../../utils/printUtils';
import { 
  Stethoscope, 
  Smile, 
  Eye, 
  Flame,
  CheckCircle2, 
  Save, 
  UserCheck, 
  Printer,
  Send,
  Copy,
  X,
  ExternalLink,
  Globe,
  Mail,
  Phone,
  FileText,
  AlertTriangle,
  ShieldAlert,
  Info
} from 'lucide-react';

import { getThemeStyles } from '../../utils/themeUtils';

export const ClinicalExamView: React.FC<{ patientIdOverride?: string }> = ({ patientIdOverride }) => {
  const { 
    patients, 
    selectedPatientId, 
    setSelectedPatientId, 
    updatePatient, 
    getClinicalExam, 
    updateClinicalExam, 
    clinicInfo,
    activeProfessional,
    layoutTheme 
  } = useApp();

  const t = getThemeStyles(layoutTheme);

  const activePatientId = patientIdOverride || selectedPatientId || patients[0]?.id || '';
  const currentPatient = patients.find(p => p.id === activePatientId) || patients[0];

  const [activeSection, setActiveSection] = useState<'odontogram' | 'dor_urgencia' | 'extraoral' | 'intraoral'>('odontogram');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  const exam = getClinicalExam(activePatientId);

  // Local draft state for extraoral, intraoral, and general exam notes
  const [extraoral, setExtraoral] = useState(exam.extraoral || {});
  const [intraoral, setIntraoral] = useState(exam.intraoral || {});
  const [generalNotes, setGeneralNotes] = useState(exam.generalNotes || '');

  const patientImages = currentPatient?.images || exam.odontogramImages || extraoral.images || intraoral.images || [];

  const handleUpdatePatientImages = (newImgs: string[]) => {
    const updatedExtraoral = { ...extraoral, images: newImgs };
    const updatedIntraoral = { ...intraoral, images: newImgs };
    setExtraoral(updatedExtraoral);
    setIntraoral(updatedIntraoral);
    updatePatient(activePatientId, { images: newImgs });
    updateClinicalExam(activePatientId, {
      odontogramImages: newImgs,
      extraoral: updatedExtraoral,
      intraoral: updatedIntraoral,
      generalNotes
    });
  };

  // Sync draft state when selected patient changes
  React.useEffect(() => {
    if (activePatientId) {
      const e = getClinicalExam(activePatientId);
      setExtraoral(e.extraoral || {});
      setIntraoral(e.intraoral || {});
      setGeneralNotes(e.generalNotes || '');
    }
  }, [activePatientId]);

  const handleSaveExam = () => {
    updateClinicalExam(activePatientId, {
      extraoral,
      intraoral,
      generalNotes
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // WhatsApp Message Generator
  const generateWhatsAppMessage = () => {
    const patientName = currentPatient?.name || 'Paciente';
    const doctorName = activeProfessional?.name || clinicInfo.dentistName || 'Cirurgião-Dentista';
    const cro = activeProfessional?.cro || clinicInfo.cro || 'CRO';
    const dateStr = new Date().toLocaleDateString('pt-BR');

    let msg = `📋 *LAUDO E RESUMO DE EXAME CLÍNICO ODONTOLÓGICO*\n`;
    msg += `🏥 *${clinicInfo.name || 'DentisPro Odontologia'}*\n`;
    msg += `👤 *Paciente:* ${patientName}\n`;
    msg += `📅 *Data:* ${dateStr}\n\n`;

    if (currentPatient?.anamnesis) {
      const a = currentPatient.anamnesis;
      msg += `🩺 *ALERTAS DE SAÚDE / ANAMNESE:*\n`;
      if (a.hasAllergies) msg += `• 🔴 Alergia: ${a.allergyDetails || 'Sim'}\n`;
      if (a.isSmoker) msg += `• 🚬 Tabagista: ${a.smokingFrequency === 'vape_eletronico' ? 'Vape/Pod Eletrônico' : 'Fumante'} ${a.smokingDetails ? `(${a.smokingDetails})` : ''}\n`;
      if (a.usesRecreationalDrugs) msg += `• ⚠️ Uso de Substâncias: ${a.drugDetails || 'Registrado'}\n`;
      if (a.hasAndropause) msg += `• 🔷 Andropausa/TRH: ${a.andropauseDetails || 'Em acompanhamento'}\n`;
      if (a.hasHeartDisease) msg += `• 🟡 Cardiopatia\n`;
      if (a.hasDiabetes) msg += `• 🟡 Diabetes (${a.diabetesType || 'Controlada'})\n`;
      if (a.hasHypertension) msg += `• 🟡 Hipertensão Arterial\n`;
      msg += `\n`;
    }

    msg += `👁️ *EXAME EXTRAORAL:*\n`;
    msg += `• Simetria Facial: ${extraoral.faceSymmetry || 'Sem alterações relevantes'}\n`;
    msg += `• Linfonodos: ${extraoral.neckLymphNodes || 'Impalpáveis e indolores'}\n`;
    msg += `• ATM: ${extraoral.atmJoints || 'Sem estalidos ou dores'}\n`;
    msg += `• Lábios / Perfil: ${extraoral.lipsAndProfile || 'Selamento preservado'}\n`;
    if (extraoral.andropauseOrHormonalObs) msg += `• Fatores Hormonais: ${extraoral.andropauseOrHormonalObs}\n`;
    if (extraoral.substanceUsageObs) msg += `• Obs de Substâncias: ${extraoral.substanceUsageObs}\n`;
    if (extraoral.notes) msg += `• Obs Extraorais: ${extraoral.notes}\n`;
    msg += `\n`;

    msg += `🩺 *EXAME INTRAORAL:*\n`;
    msg += `• Mucosa Jugal: ${intraoral.buccalMucosa || 'Normocorada e íntegra'}\n`;
    msg += `• Língua / Assoalho: ${intraoral.tongueAndFloor || 'Sem lesões visíveis'}\n`;
    msg += `• Palato: ${intraoral.palateHardSoft || 'Íntegro'}\n`;
    msg += `• Gengiva / Periodonto: ${intraoral.gingivaPeriodontum || 'Saudável'}\n`;
    msg += `• Crista Alveolar: ${intraoral.alveolarRidge || 'Preservada'}\n`;
    msg += `• Orofaringe: ${intraoral.oropharynx || 'Sem hiperemia'}\n`;
    if (intraoral.smokingOralImpact) msg += `• Impacto Tabagismo: ${intraoral.smokingOralImpact}\n`;
    if (intraoral.substanceOralImpact) msg += `• Impacto Substâncias: ${intraoral.substanceOralImpact}\n`;
    if (intraoral.notes) msg += `• Obs Intraorais: ${intraoral.notes}\n`;
    msg += `\n`;

    if (exam.painExam && (exam.painExam.diagnostico || exam.painExam.chiefComplaint || exam.painExam.tratamentoUrgenciaProposto)) {
      const pe = exam.painExam;
      msg += `⚡ *EXAME DE URGÊNCIA & DOR:*\n`;
      if (pe.chiefComplaint) msg += `• Queixa Principal: ${pe.chiefComplaint}\n`;
      if (pe.diagnostico) msg += `• Diagnóstico: ${pe.diagnostico}\n`;
      if (pe.tratamentoUrgenciaProposto) msg += `• Tratamento Proposto: ${pe.tratamentoUrgenciaProposto}\n`;
      if (pe.tratamentoExecutado) msg += `• Tratamento Executado: ${pe.tratamentoExecutado}\n`;
      msg += `\n`;
    }

    if (generalNotes) {
      msg += `📌 *PARECER DO CIRURGIÃO-DENTISTA:*\n${generalNotes}\n\n`;
    }

    msg += `Atenciosamente,\n*${doctorName}*\n${cro} • Cirurgião-Dentista`;

    return msg;
  };

  const [whatsAppText, setWhatsAppText] = useState(generateWhatsAppMessage());
  const [patientPhone, setPatientPhone] = useState(currentPatient?.phone || '');

  React.useEffect(() => {
    setWhatsAppText(generateWhatsAppMessage());
    setPatientPhone(currentPatient?.phone || '');
  }, [extraoral, intraoral, generalNotes, activePatientId]);

  const handleOpenWhatsAppWeb = () => {
    const cleanDigits = patientPhone.replace(/\D/g, '');
    const phoneWithCountry = cleanDigits
      ? cleanDigits.startsWith('55')
        ? cleanDigits
        : `55${cleanDigits}`
      : '';

    const url = phoneWithCountry
      ? `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(whatsAppText)}`
      : `https://wa.me/?text=${encodeURIComponent(whatsAppText)}`;

    window.open(url, '_blank');
  };

  const handleCopyWhatsAppText = () => {
    navigator.clipboard.writeText(whatsAppText);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 2000);
  };

  const handleNativePrint = () => {
    handleSaveExam();
    setIsPrintModalOpen(true);
    setTimeout(() => {
      printDocumentWithTitle({
        docTitle: 'Exame_Clinico_Odontologico',
        patientName: currentPatient?.name,
        date: new Date()
      });
    }, 400);
  };

  if (!currentPatient) {
    return (
      <div className={`${t.cardBg} border ${t.cardBorder} rounded-[32px] p-12 text-center text-gray-400 space-y-3 shadow-sm`}>
        <Stethoscope className={`w-10 h-10 mx-auto ${t.accentText}`} />
        <h3 className={`text-base font-bold ${t.headingText}`}>Nenhum paciente cadastrado</h3>
        <p className="text-xs opacity-75">Cadastre um paciente primeiro para realizar o Exame Clínico e Odontograma.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Title Header */}
      <div className={`${t.cardBg} border ${t.cardBorder} rounded-[32px] p-6 shadow-xs flex items-center justify-between gap-4 print:hidden`}>
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-2xl ${t.btnPrimaryBg} ${t.btnPrimaryText} shadow-2xs`}>
            <Stethoscope className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className={`text-2xl font-bold ${t.headingText}`}>Exame Clínico Completo</h1>
            <p className="text-xs opacity-75">Avaliação Física Extraoral, Intraoral, Odontograma e Prontuário Clínico.</p>
          </div>
        </div>
      </div>

      {savedSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-2 print:hidden shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Exame Clínico e Odontograma salvos no prontuário do paciente com sucesso!
        </div>
      )}

      {/* Main Section Navigation Tabs */}
      <div className={`${t.cardBg} p-1.5 rounded-2xl border ${t.cardBorder} flex flex-wrap items-center gap-2 text-xs print:hidden`}>
        <button
          type="button"
          onClick={() => setActiveSection('odontogram')}
          className={`flex-1 min-w-[150px] py-3 px-4 rounded-xl font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
            activeSection === 'odontogram'
              ? `${t.btnPrimaryBg} ${t.btnPrimaryText} shadow-xs`
              : `${t.btnSecondaryBg} ${t.btnSecondaryText} hover:opacity-80`
          }`}
        >
          <Smile className={`w-4 h-4 ${activeSection === 'odontogram' ? 'text-white' : t.accentText}`} /> Odontograma Interativo
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('dor_urgencia')}
          className={`flex-1 min-w-[150px] py-3 px-4 rounded-xl font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
            activeSection === 'dor_urgencia'
              ? 'bg-amber-600 text-white shadow-xs font-black'
              : `${t.btnSecondaryBg} ${t.btnSecondaryText} hover:opacity-80`
          }`}
        >
          <Flame className={`w-4 h-4 ${activeSection === 'dor_urgencia' ? 'text-amber-200' : 'text-amber-600'}`} /> Exame de Urgência & Dor
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('extraoral')}
          className={`flex-1 min-w-[150px] py-3 px-4 rounded-xl font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
            activeSection === 'extraoral'
              ? `${t.btnPrimaryBg} ${t.btnPrimaryText} shadow-xs`
              : `${t.btnSecondaryBg} ${t.btnSecondaryText} hover:opacity-80`
          }`}
        >
          <Eye className={`w-4 h-4 ${activeSection === 'extraoral' ? 'text-white' : t.accentText}`} /> Exame Extraoral
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('intraoral')}
          className={`flex-1 min-w-[150px] py-3 px-4 rounded-xl font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
            activeSection === 'intraoral'
              ? `${t.btnPrimaryBg} ${t.btnPrimaryText} shadow-xs`
              : `${t.btnSecondaryBg} ${t.btnSecondaryText} hover:opacity-80`
          }`}
        >
          <Stethoscope className={`w-4 h-4 ${activeSection === 'intraoral' ? 'text-white' : t.accentText}`} /> Exame Intraoral
        </button>
      </div>

      {/* SECTION: EXAME DE URGÊNCIA & DOR */}
      {activeSection === 'dor_urgencia' && (
        <div className="space-y-4">
          <PainEvaluationExamView patientId={activePatientId} />
        </div>
      )}

      {/* SECTION 1: EXAME EXTRAORAL */}
      {activeSection === 'extraoral' && (
        <div className="bg-white border border-[#e5e5d1] rounded-[32px] p-6 shadow-xs space-y-6 print:hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e5e5d1] pb-4">
            <div>
              <h2 className="text-lg font-serif italic text-[#5a5a40] flex items-center gap-2">
                <Eye className="w-5 h-5 text-[#d4a373]" />
                Exame Extraoral (Face, Pescoço, ATM e Fatores Hormonais)
              </h2>
              <p className="text-xs text-gray-500">Inspeção palpatória e anatômica da simetria facial, musculatura, linfonodos, ATM e fatores sistêmicos.</p>
            </div>

            <button
              type="button"
              onClick={handleSaveExam}
              className={`px-5 py-2.5 ${t.btnPrimaryBg} ${t.btnPrimaryText} font-bold text-xs rounded-xl shadow-2xs flex items-center gap-2 transition cursor-pointer`}
            >
              <Save className="w-4 h-4" /> Salvar Exame Extraoral
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Simetria Facial */}
            <div className="bg-[#fbfbf9] p-4 rounded-2xl border border-[#e5e5d1] space-y-2">
              <label className="block font-bold text-[#5a5a40]">Simetria e Perfil Facial:</label>
              <div className="flex flex-wrap gap-1">
                {[
                  'Face simétrica',
                  'Assimetria facial',
                  'Perfil Reto',
                  'Perfil Convexo',
                  'Perfil Côncavo',
                  'Terço inf. aumentado'
                ].map(opt => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      const current = extraoral.faceSymmetry || '';
                      if (!current) setExtraoral({ ...extraoral, faceSymmetry: opt });
                      else if (!current.includes(opt)) setExtraoral({ ...extraoral, faceSymmetry: `${current}, ${opt}` });
                    }}
                    className="px-2 py-0.5 bg-white hover:bg-[#5a5a40] hover:text-white text-gray-700 font-semibold rounded-lg border border-[#e5e5d1] text-[10px] transition"
                  >
                    + {opt}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={extraoral.faceSymmetry || ''}
                onChange={(e) => setExtraoral({ ...extraoral, faceSymmetry: e.target.value })}
                placeholder="Ex: Face simétrica, terços faciais proporcionais, perfil reto..."
                className="w-full bg-white border border-[#e5e5d1] rounded-xl px-3.5 py-2 text-xs text-[#2c2c2c] focus:outline-none focus:border-[#5a5a40]"
              />
            </div>

            {/* Linfonodos Cervicais e Submandibulares */}
            <div className="bg-[#fbfbf9] p-4 rounded-2xl border border-[#e5e5d1] space-y-2">
              <label className="block font-bold text-[#5a5a40]">Linfonodos Cabeça e Pescoço:</label>
              <div className="flex flex-wrap gap-1">
                {[
                  'Impalpáveis e indolores',
                  'Submandibular palpável',
                  'Cervical anterior palpável',
                  'Doloroso / Infartado'
                ].map(opt => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      const current = extraoral.neckLymphNodes || '';
                      if (!current) setExtraoral({ ...extraoral, neckLymphNodes: opt });
                      else if (!current.includes(opt)) setExtraoral({ ...extraoral, neckLymphNodes: `${current}, ${opt}` });
                    }}
                    className="px-2 py-0.5 bg-white hover:bg-[#5a5a40] hover:text-white text-gray-700 font-semibold rounded-lg border border-[#e5e5d1] text-[10px] transition"
                  >
                    + {opt}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={extraoral.neckLymphNodes || ''}
                onChange={(e) => setExtraoral({ ...extraoral, neckLymphNodes: e.target.value })}
                placeholder="Ex: Impalpáveis, indolores e móveis..."
                className="w-full bg-white border border-[#e5e5d1] rounded-xl px-3.5 py-2 text-xs text-[#2c2c2c] focus:outline-none focus:border-[#5a5a40]"
              />
            </div>

            {/* Articulação Temporomandibular (ATM) */}
            <div className="bg-[#fbfbf9] p-4 rounded-2xl border border-[#e5e5d1] space-y-2">
              <label className="block font-bold text-[#5a5a40]">ATM (Articulação Temporomandibular):</label>
              <div className="flex flex-wrap gap-1">
                {[
                  'Sem estalidos ou ruídos',
                  'Estalido unilateral',
                  'Estalido bilateral',
                  'Crepitação',
                  'Dor à palpação articular',
                  'Abertura reduzida (<35mm)'
                ].map(opt => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      const current = extraoral.atmJoints || '';
                      if (!current) setExtraoral({ ...extraoral, atmJoints: opt });
                      else if (!current.includes(opt)) setExtraoral({ ...extraoral, atmJoints: `${current}, ${opt}` });
                    }}
                    className="px-2 py-0.5 bg-white hover:bg-[#5a5a40] hover:text-white text-gray-700 font-semibold rounded-lg border border-[#e5e5d1] text-[10px] transition"
                  >
                    + {opt}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={extraoral.atmJoints || ''}
                onChange={(e) => setExtraoral({ ...extraoral, atmJoints: e.target.value })}
                placeholder="Ex: Sem estalidos, abertura de boca > 40mm, sem dor articular..."
                className="w-full bg-white border border-[#e5e5d1] rounded-xl px-3.5 py-2 text-xs text-[#2c2c2c] focus:outline-none focus:border-[#5a5a40]"
              />
            </div>

            {/* Lábios e Selamento Labial */}
            <div className="bg-[#fbfbf9] p-4 rounded-2xl border border-[#e5e5d1] space-y-2">
              <label className="block font-bold text-[#5a5a40]">Lábios e Selamento Labial:</label>
              <div className="flex flex-wrap gap-1">
                {[
                  'Selamento passivo conservado',
                  'Incompetência labial',
                  'Lábios ressecados',
                  'Queilite angular'
                ].map(opt => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      const current = extraoral.lipsAndProfile || '';
                      if (!current) setExtraoral({ ...extraoral, lipsAndProfile: opt });
                      else if (!current.includes(opt)) setExtraoral({ ...extraoral, lipsAndProfile: `${current}, ${opt}` });
                    }}
                    className="px-2 py-0.5 bg-white hover:bg-[#5a5a40] hover:text-white text-gray-700 font-semibold rounded-lg border border-[#e5e5d1] text-[10px] transition"
                  >
                    + {opt}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={extraoral.lipsAndProfile || ''}
                onChange={(e) => setExtraoral({ ...extraoral, lipsAndProfile: e.target.value })}
                placeholder="Ex: Lábios hidratados, selamento passivo conservado..."
                className="w-full bg-white border border-[#e5e5d1] rounded-xl px-3.5 py-2 text-xs text-[#2c2c2c] focus:outline-none focus:border-[#5a5a40]"
              />
            </div>

            {/* Fatores Hormonais e Andropausa no Exame Extraoral */}
            <div className="bg-blue-50/60 p-4 rounded-2xl border border-blue-200 space-y-1.5">
              <label className="block font-bold text-blue-900 flex items-center gap-1.5">
                🔷 Fatores Hormonais / Andropausa / TRH (Manifestações Cutâneas e Faciais):
              </label>
              <input
                type="text"
                value={extraoral.andropauseOrHormonalObs || ''}
                onChange={(e) => setExtraoral({ ...extraoral, andropauseOrHormonalObs: e.target.value })}
                placeholder="Ex: Paciente relata andropausa / reposição de testosterona; sem alopecia acentuada..."
                className="w-full bg-white border border-blue-300 rounded-xl px-3.5 py-2 text-xs text-[#2c2c2c] focus:outline-none focus:border-blue-600"
              />
            </div>

            {/* Alerta de Substâncias / Medicamentos Críticos */}
            <div className="bg-rose-50/60 p-4 rounded-2xl border border-rose-200 space-y-1.5">
              <label className="block font-bold text-rose-900 flex items-center gap-1.5">
                ⚠️ Observações de Uso de Substâncias / Tabagismo Severo:
              </label>
              <input
                type="text"
                value={extraoral.substanceUsageObs || ''}
                onChange={(e) => setExtraoral({ ...extraoral, substanceUsageObs: e.target.value })}
                placeholder="Ex: Histórico de fumo/vape; atenção a vasoconstritores e sangramento..."
                className="w-full bg-white border border-rose-300 rounded-xl px-3.5 py-2 text-xs text-[#2c2c2c] focus:outline-none focus:border-rose-600"
              />
            </div>
          </div>

          {/* Observações Gerais Extraorais */}
          <div className="bg-[#fbfbf9] p-4 rounded-2xl border border-[#e5e5d1] space-y-1.5">
            <label className="block font-bold text-[#5a5a40] text-xs">Observações Complementares Extraorais:</label>
            <textarea
              rows={2}
              value={extraoral.notes || ''}
              onChange={(e) => setExtraoral({ ...extraoral, notes: e.target.value })}
              placeholder="Descreva detalhes adicionais, cicatrizes, lesões cutâneas ou características marcantes..."
              className="w-full bg-white border border-[#e5e5d1] rounded-xl p-3 text-xs text-[#2c2c2c] focus:outline-none focus:border-[#5a5a40]"
            />
          </div>

          {/* Photo Gallery & Advanced Editor for Extraoral Exam */}
          <ImageGalleryWithEditor
            title="Fotos e radiografias (Exame Extraoral)"
            description="Importe e gerencie fotografias e radiografias clínicas do paciente. Clique em qualquer imagem para abrir o editor avançado com desenho, inversão RX e legendas."
            images={patientImages}
            onUpdateImages={handleUpdatePatientImages}
          />
        </div>
      )}

      {/* SECTION 2: EXAME INTRAORAL */}
      {activeSection === 'intraoral' && (
        <div className="bg-white border border-[#e5e5d1] rounded-[32px] p-6 shadow-xs space-y-6 print:hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e5e5d1] pb-4">
            <div>
              <h2 className="text-lg font-serif italic text-[#5a5a40] flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-[#d4a373]" />
                Exame Intraoral (Tecidos Moles, Duros e Lesões)
              </h2>
              <p className="text-xs text-gray-500">Avaliação minuciosa da mucosa jugal, língua, assoalho bucal, palato, gengiva, rebordo alveolar e manifestações de tabagismo.</p>
            </div>

            <button
              type="button"
              onClick={handleSaveExam}
              className={`px-5 py-2.5 ${t.btnPrimaryBg} ${t.btnPrimaryText} font-bold text-xs rounded-xl shadow-2xs flex items-center gap-2 transition cursor-pointer`}
            >
              <Save className="w-4 h-4" /> Salvar Exame Intraoral
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Mucosa Jugal e Lábio Interno */}
            <div className="bg-[#fbfbf9] p-4 rounded-2xl border border-[#e5e5d1] space-y-1.5">
              <label className="block font-bold text-[#5a5a40]">Mucosa Jugal e Vestíbulo:</label>
              <input
                type="text"
                value={intraoral.buccalMucosa || ''}
                onChange={(e) => setIntraoral({ ...intraoral, buccalMucosa: e.target.value })}
                placeholder="Ex: Mucosa normocorada, ductos parotídeos pérvios..."
                className="w-full bg-white border border-[#e5e5d1] rounded-xl px-3.5 py-2 text-xs text-[#2c2c2c] focus:outline-none focus:border-[#5a5a40]"
              />
            </div>

            {/* Língua e Assoalho Bucal */}
            <div className="bg-[#fbfbf9] p-4 rounded-2xl border border-[#e5e5d1] space-y-1.5">
              <label className="block font-bold text-[#5a5a40]">Língua e Assoalho da Boca:</label>
              <input
                type="text"
                value={intraoral.tongueAndFloor || ''}
                onChange={(e) => setIntraoral({ ...intraoral, tongueAndFloor: e.target.value })}
                placeholder="Ex: Dorso lingual sem saburra, assoalho depressível..."
                className="w-full bg-white border border-[#e5e5d1] rounded-xl px-3.5 py-2 text-xs text-[#2c2c2c] focus:outline-none focus:border-[#5a5a40]"
              />
            </div>

            {/* Palato Duro e Mole */}
            <div className="bg-[#fbfbf9] p-4 rounded-2xl border border-[#e5e5d1] space-y-1.5">
              <label className="block font-bold text-[#5a5a40]">Palato Duro e Mole:</label>
              <input
                type="text"
                value={intraoral.palateHardSoft || ''}
                onChange={(e) => setIntraoral({ ...intraoral, palateHardSoft: e.target.value })}
                placeholder="Ex: Rugas palatinas íntegras, sem torus ou fendas..."
                className="w-full bg-white border border-[#e5e5d1] rounded-xl px-3.5 py-2 text-xs text-[#2c2c2c] focus:outline-none focus:border-[#5a5a40]"
              />
            </div>

            {/* Gengiva e Periodonto */}
            <div className="bg-[#fbfbf9] p-4 rounded-2xl border border-[#e5e5d1] space-y-1.5">
              <label className="block font-bold text-[#5a5a40]">Gengiva e Periodonto:</label>
              <input
                type="text"
                value={intraoral.gingivaPeriodontum || ''}
                onChange={(e) => setIntraoral({ ...intraoral, gingivaPeriodontum: e.target.value })}
                placeholder="Ex: Gengiva em casca de laranja, sem bolsas periodontais..."
                className="w-full bg-white border border-[#e5e5d1] rounded-xl px-3.5 py-2 text-xs text-[#2c2c2c] focus:outline-none focus:border-[#5a5a40]"
              />
            </div>

            {/* Crista Alveolar e Ossos Maxilares */}
            <div className="bg-[#fbfbf9] p-4 rounded-2xl border border-[#e5e5d1] space-y-1.5">
              <label className="block font-bold text-[#5a5a40]">Crista Alveolar e Ossos Maxilares:</label>
              <input
                type="text"
                value={intraoral.alveolarRidge || ''}
                onChange={(e) => setIntraoral({ ...intraoral, alveolarRidge: e.target.value })}
                placeholder="Ex: Rebordo preservado, sem reabsorção severa..."
                className="w-full bg-white border border-[#e5e5d1] rounded-xl px-3.5 py-2 text-xs text-[#2c2c2c] focus:outline-none focus:border-[#5a5a40]"
              />
            </div>

            {/* Orofaringe */}
            <div className="bg-[#fbfbf9] p-4 rounded-2xl border border-[#e5e5d1] space-y-1.5">
              <label className="block font-bold text-[#5a5a40]">Orofaringe e Amígdalas:</label>
              <input
                type="text"
                value={intraoral.oropharynx || ''}
                onChange={(e) => setIntraoral({ ...intraoral, oropharynx: e.target.value })}
                placeholder="Ex: Pilares amigdalianos sem hiperemia, úvula centrada..."
                className="w-full bg-white border border-[#e5e5d1] rounded-xl px-3.5 py-2 text-xs text-[#2c2c2c] focus:outline-none focus:border-[#5a5a40]"
              />
            </div>

            {/* Impacto de Tabagismo na Boca */}
            <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200 space-y-1.5">
              <label className="block font-bold text-amber-900 flex items-center gap-1.5">
                🚬 Impacto de Tabagismo na Mucosa / Dentes:
              </label>
              <input
                type="text"
                value={intraoral.smokingOralImpact || ''}
                onChange={(e) => setIntraoral({ ...intraoral, smokingOralImpact: e.target.value })}
                placeholder="Ex: Manchas de nicotina nos incisivos, leucoplasia/estomatite nicotínica..."
                className="w-full bg-white border border-amber-300 rounded-xl px-3.5 py-2 text-xs text-[#2c2c2c] focus:outline-none focus:border-amber-600"
              />
            </div>

            {/* Impacto de Uso de Substâncias e Xerostomia */}
            <div className="bg-rose-50/60 p-4 rounded-2xl border border-rose-200 space-y-1.5">
              <label className="block font-bold text-rose-900 flex items-center gap-1.5">
                ⚠️ Xerostomia / Lesões por Substâncias / Medicação:
              </label>
              <input
                type="text"
                value={intraoral.substanceOralImpact || ''}
                onChange={(e) => setIntraoral({ ...intraoral, substanceOralImpact: e.target.value })}
                placeholder="Ex: Fluxo salivar reduzido (hipossalivação/xerostomia), desgaste dental severo..."
                className="w-full bg-white border border-rose-300 rounded-xl px-3.5 py-2 text-xs text-[#2c2c2c] focus:outline-none focus:border-rose-600"
              />
            </div>
          </div>

          {/* Observações Gerais Intraorais */}
          <div className="bg-[#fbfbf9] p-4 rounded-2xl border border-[#e5e5d1] space-y-1.5">
            <label className="block font-bold text-[#5a5a40] text-xs">Observações Complementares Intraorais:</label>
            <textarea
              rows={2}
              value={intraoral.notes || ''}
              onChange={(e) => setIntraoral({ ...intraoral, notes: e.target.value })}
              placeholder="Descreva observações adicionais, placa bacteriana, tártaro ou achados específicos..."
              className="w-full bg-white border border-[#e5e5d1] rounded-xl p-3 text-xs text-[#2c2c2c] focus:outline-none focus:border-[#5a5a40]"
            />
          </div>

          {/* General Dentist Conclusion */}
          <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-200 space-y-1.5">
            <label className="block font-bold text-emerald-900 text-xs">Conclusão e Parecer Clínico do Cirurgião-Dentista:</label>
            <textarea
              rows={3}
              value={generalNotes}
              onChange={(e) => setGeneralNotes(e.target.value)}
              placeholder="Parecer final do profissional referente ao exame clínico, indicação de exames complementares (radiografias, tomografia) ou conduta cirúrgica..."
              className="w-full bg-white border border-emerald-300 rounded-xl p-3 text-xs text-[#2c2c2c] focus:outline-none focus:border-emerald-600"
            />
          </div>

          {/* Photo Gallery & Advanced Editor for Intraoral Exam */}
          <ImageGalleryWithEditor
            title="Fotos e radiografias (Exame Intraoral)"
            description="Importe e gerencie fotografias e radiografias clínicas do paciente. Clique em qualquer imagem para abrir o editor avançado com desenho, inversão RX e legendas."
            images={patientImages}
            onUpdateImages={handleUpdatePatientImages}
          />
        </div>
      )}

      {/* SECTION 3: ODONTOGRAMA INTERATIVO */}
      {activeSection === 'odontogram' && (
        <div className="space-y-4 print:hidden">
          <Odontogram patientId={activePatientId} />
        </div>
      )}

      {/* MODAL: ENVIO PARA WHATSAPP DO PACIENTE */}
      {isWhatsAppModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-[28px] max-w-xl w-full p-6 shadow-2xl space-y-4 text-left text-xs font-sans">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                  <Send className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Enviar Laudo do Exame ao WhatsApp</h3>
                  <p className="text-xs text-gray-500">Revise os dados antes de disparar a mensagem para o paciente.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsWhatsAppModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Telefone do Paciente (com DDD):</label>
                <input
                  type="text"
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                  placeholder="Ex: (85) 99999-8888"
                  className="w-full text-xs p-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Texto do Laudo e Resumo do Exame:</label>
                <textarea
                  rows={10}
                  value={whatsAppText}
                  onChange={(e) => setWhatsAppText(e.target.value)}
                  className="w-full text-xs p-3 bg-gray-50 border border-gray-300 rounded-xl font-mono focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-3 border-t border-gray-200">
              <button
                type="button"
                onClick={handleCopyWhatsAppText}
                className="px-4 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 font-bold text-xs rounded-xl flex items-center gap-2 transition cursor-pointer"
              >
                <Copy className="w-4 h-4" />
                {copiedSuccess ? 'Copiado!' : 'Copiar Texto'}
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsWhatsAppModalOpen(false)}
                  className="px-4 py-2.5 border border-gray-300 text-gray-600 hover:bg-gray-100 font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleOpenWhatsAppWeb}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition cursor-pointer"
                >
                  <Send className="w-4 h-4" /> Enviar no WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PRINTABLE DOCUMENT VIEW (VISIBLE DURING window.print()) */}
      <div className="hidden print:block font-sans text-stone-900 p-4 space-y-6">
        {/* Clinic Header */}
        <div className="border-b-2 border-stone-800 pb-4 flex justify-between items-start">
          <div>
            <h1 className="text-xl font-bold text-stone-900 uppercase tracking-tight">{clinicInfo.name || 'DentisPro Odontologia'}</h1>
            <p className="text-xs font-semibold text-stone-700">
              {activeProfessional?.name || clinicInfo.dentistName} • {activeProfessional?.cro || clinicInfo.cro}
            </p>
            {clinicInfo.epaoNumber && (
              <p className="text-[11px] text-stone-600">EPAO: {clinicInfo.epaoNumber}</p>
            )}
            <p className="text-[11px] text-stone-600">{clinicInfo.address || 'Fortaleza - CE'}</p>
          </div>

          <div className="text-right text-[11px] text-stone-700 space-y-1">
            <p><strong>Data do Exame:</strong> {new Date().toLocaleDateString('pt-BR')}</p>
            {clinicInfo.phone && <p><strong>Tel:</strong> {clinicInfo.phone}</p>}
            {clinicInfo.email && <p><strong>Email:</strong> {clinicInfo.email}</p>}
          </div>
        </div>

        {/* Document Title */}
        <div className="text-center py-2 bg-stone-100 rounded-lg border border-stone-300">
          <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">Laudo do Exame Clínico & Prontuário Odontológico</h2>
        </div>

        {/* Patient Demographic Summary */}
        <div className="bg-stone-50 border border-stone-300 p-3 rounded-lg text-xs grid grid-cols-2 gap-2">
          <div><strong>Paciente:</strong> {currentPatient.name}</div>
          <div><strong>CPF:</strong> {currentPatient.cpf || 'Não informado'}</div>
          <div><strong>Telefone:</strong> {currentPatient.phone || 'Não informado'}</div>
          <div><strong>Data de Nasc.:</strong> {currentPatient.birthDate || 'Não informada'}</div>
        </div>

        {/* Anamnesis Highlights */}
        {currentPatient.anamnesis && (
          <div className="border border-stone-300 p-3 rounded-lg text-xs space-y-1">
            <h3 className="font-bold text-stone-900 uppercase text-[11px] border-b border-stone-200 pb-1">1. Alertas de Saúde Sistêmica & Hábitos</h3>
            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
              {currentPatient.anamnesis.hasAllergies && <div>• Alergias: {currentPatient.anamnesis.allergyDetails}</div>}
              {currentPatient.anamnesis.isSmoker && <div>• Tabagismo: {currentPatient.anamnesis.smokingDetails || 'Fumante'}</div>}
              {currentPatient.anamnesis.usesRecreationalDrugs && <div>• Uso de Substâncias: {currentPatient.anamnesis.drugDetails || 'Sim'}</div>}
              {currentPatient.anamnesis.hasAndropause && <div>• Andropausa/TRH: {currentPatient.anamnesis.andropauseDetails || 'Sim'}</div>}
              {currentPatient.anamnesis.hasHeartDisease && <div>• Cardiopatia: Sim</div>}
              {currentPatient.anamnesis.hasDiabetes && <div>• Diabetes: {currentPatient.anamnesis.diabetesType}</div>}
              {currentPatient.anamnesis.hasHypertension && <div>• Hipertensão: Sim</div>}
            </div>
          </div>
        )}

        {/* Extraoral Findings */}
        <div className="border border-stone-300 p-3 rounded-lg text-xs space-y-1">
          <h3 className="font-bold text-stone-900 uppercase text-[11px] border-b border-stone-200 pb-1">2. Achados do Exame Extraoral</h3>
          <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
            <div><strong>Simetria Facial:</strong> {extraoral.faceSymmetry || 'Normal'}</div>
            <div><strong>Linfonodos:</strong> {extraoral.neckLymphNodes || 'Impalpáveis'}</div>
            <div><strong>ATM:</strong> {extraoral.atmJoints || 'Sem estalidos'}</div>
            <div><strong>Lábios/Perfil:</strong> {extraoral.lipsAndProfile || 'Normal'}</div>
            {extraoral.andropauseOrHormonalObs && <div className="col-span-2"><strong>Fatores Hormonais:</strong> {extraoral.andropauseOrHormonalObs}</div>}
            {extraoral.substanceUsageObs && <div className="col-span-2"><strong>Uso de Substâncias:</strong> {extraoral.substanceUsageObs}</div>}
            {extraoral.notes && <div className="col-span-2"><strong>Obs Extraorais:</strong> {extraoral.notes}</div>}
          </div>
        </div>

        {/* Intraoral Findings */}
        <div className="border border-stone-300 p-3 rounded-lg text-xs space-y-1">
          <h3 className="font-bold text-stone-900 uppercase text-[11px] border-b border-stone-200 pb-1">3. Achados do Exame Intraoral</h3>
          <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
            <div><strong>Mucosa Jugal:</strong> {intraoral.buccalMucosa || 'Normocorada'}</div>
            <div><strong>Língua/Assoalho:</strong> {intraoral.tongueAndFloor || 'Sem lesões'}</div>
            <div><strong>Palato:</strong> {intraoral.palateHardSoft || 'Íntegro'}</div>
            <div><strong>Gengiva/Periodonto:</strong> {intraoral.gingivaPeriodontum || 'Saudável'}</div>
            <div><strong>Crista Alveolar:</strong> {intraoral.alveolarRidge || 'Preservada'}</div>
            <div><strong>Orofaringe:</strong> {intraoral.oropharynx || 'Normal'}</div>
            {intraoral.smokingOralImpact && <div className="col-span-2"><strong>Impacto Tabagismo:</strong> {intraoral.smokingOralImpact}</div>}
            {intraoral.substanceOralImpact && <div className="col-span-2"><strong>Impacto Substâncias:</strong> {intraoral.substanceOralImpact}</div>}
            {intraoral.notes && <div className="col-span-2"><strong>Obs Intraorais:</strong> {intraoral.notes}</div>}
          </div>
        </div>

        {/* Pain / Urgency Exam Findings if recorded */}
        {exam.painExam && (exam.painExam.diagnostico || exam.painExam.chiefComplaint || exam.painExam.tratamentoUrgenciaProposto) && (
          <div className="border border-stone-300 p-3 rounded-lg text-xs space-y-1">
            <h3 className="font-bold text-stone-900 uppercase text-[11px] border-b border-stone-200 pb-1">4. Avaliação de Dor & Exame de Urgência</h3>
            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
              {exam.painExam.chiefComplaint && <div className="col-span-2"><strong>Queixa Principal:</strong> {exam.painExam.chiefComplaint}</div>}
              {exam.painExam.diagnostico && <div className="col-span-2"><strong>Diagnóstico Odontológico:</strong> {exam.painExam.diagnostico}</div>}
              {exam.painExam.tratamentoUrgenciaProposto && <div className="col-span-2"><strong>Tratamento Proposto:</strong> {exam.painExam.tratamentoUrgenciaProposto}</div>}
              {exam.painExam.tratamentoExecutado && <div className="col-span-2"><strong>Tratamento Executado:</strong> {exam.painExam.tratamentoExecutado}</div>}
            </div>
          </div>
        )}

        {/* Parecer do Dentista */}
        {generalNotes && (
          <div className="border border-stone-300 p-3 rounded-lg text-xs space-y-1">
            <h3 className="font-bold text-stone-900 uppercase text-[11px] border-b border-stone-200 pb-1">5. Parecer e Recomendações do Cirurgião-Dentista</h3>
            <p className="text-[11px] pt-1 whitespace-pre-wrap">{generalNotes}</p>
          </div>
        )}

        {/* Interactive Interactive Footer Links for RULE 4 */}
        <div className="pt-4 border-t border-stone-300 flex items-center justify-between text-[10px] text-stone-600">
          <div className="flex items-center gap-3">
            <a href="https://dentispro.com.br" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:underline text-stone-800">
              <Globe className="w-3 h-3 text-stone-700" /> https://dentispro.com.br
            </a>
            {clinicInfo.email && (
              <a href={`mailto:${clinicInfo.email}`} className="flex items-center gap-1 hover:underline text-stone-800">
                <Mail className="w-3 h-3 text-stone-700" /> {clinicInfo.email}
              </a>
            )}
            {clinicInfo.phone && (
              <a href={`tel:${clinicInfo.phone.replace(/\D/g, '')}`} className="flex items-center gap-1 hover:underline text-stone-800">
                <Phone className="w-3 h-3 text-stone-700" /> {clinicInfo.phone}
              </a>
            )}
          </div>
          <div>DentisPro • Prontuário Odontológico Digital</div>
        </div>

        {/* Signature Block */}
        <DocumentSignatureFooter
          customDentistName={activeProfessional?.name || clinicInfo.dentistName}
          customCro={activeProfessional?.cro || clinicInfo.cro}
          documentTitle="Exame Clínico e Odontograma"
        />
      </div>
    </div>
  );
};
