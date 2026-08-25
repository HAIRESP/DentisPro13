import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Odontogram } from './Odontogram';
import { ImageGalleryWithEditor } from '../common/ImageGalleryWithEditor';
import { 
  Stethoscope, 
  Smile, 
  Eye, 
  CheckCircle2, 
  Save, 
  UserCheck, 
  Sparkles,
  Info,
  Sliders,
  Maximize2
} from 'lucide-react';

import { getThemeStyles } from '../../utils/themeUtils';

export const ClinicalExamView: React.FC<{ patientIdOverride?: string }> = ({ patientIdOverride }) => {
  const { patients, selectedPatientId, setSelectedPatientId, updatePatient, getClinicalExam, updateClinicalExam, layoutTheme } = useApp();
  const t = getThemeStyles(layoutTheme);

  const activePatientId = patientIdOverride || selectedPatientId || patients[0]?.id || '';
  const currentPatient = patients.find(p => p.id === activePatientId) || patients[0];

  const [activeSection, setActiveSection] = useState<'odontogram' | 'extraoral' | 'intraoral'>('odontogram');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const exam = getClinicalExam(activePatientId);

  // Local draft state for extraoral and intraoral forms
  const [extraoral, setExtraoral] = useState(exam.extraoral || {});
  const [intraoral, setIntraoral] = useState(exam.intraoral || {});

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
    });
  };

  // Update when patient changes
  React.useEffect(() => {
    if (activePatientId) {
      const e = getClinicalExam(activePatientId);
      setExtraoral(e.extraoral || {});
      setIntraoral(e.intraoral || {});
    }
  }, [activePatientId]);

  const handleSaveExam = () => {
    updateClinicalExam(activePatientId, {
      extraoral,
      intraoral
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
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
      {/* Page Title & Patient Selector Header */}
      <div className={`${t.cardBg} border ${t.cardBorder} rounded-[32px] p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4`}>
        <div>
          <div className="flex items-center gap-2">
            <div className={`p-2.5 rounded-2xl ${t.btnPrimaryBg} ${t.btnPrimaryText} shadow-2xs`}>
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${t.headingText}`}>Exame Clínico</h1>
              <p className="text-xs opacity-75">Avaliação Física Extraoral, Intraoral e Odontograma completo do paciente.</p>
            </div>
          </div>
        </div>

        {/* Patient Picker Dropdown */}
        <div className={`flex items-center gap-3 ${t.inputBg} p-2.5 rounded-2xl border ${t.inputBorder} shrink-0`}>
          <UserCheck className={`w-5 h-5 ${t.accentText}`} />
          <div className="text-xs">
            <span className="block text-[10px] font-bold opacity-60 uppercase">Paciente Selecionado:</span>
            <select
              value={activePatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="bg-transparent font-bold focus:outline-none cursor-pointer"
            >
              {patients.map(p => (
                <option key={p.id} value={p.id}>{p.name} (CPF: {p.cpf})</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Section Navigation Tabs */}
      <div className={`${t.cardBg} p-1.5 rounded-2xl border ${t.cardBorder} flex flex-wrap items-center gap-2 text-xs`}>
        <button
          type="button"
          onClick={() => setActiveSection('odontogram')}
          className={`flex-1 min-w-[160px] py-3 px-4 rounded-xl font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
            activeSection === 'odontogram'
              ? `${t.btnPrimaryBg} ${t.btnPrimaryText} shadow-xs`
              : `${t.btnSecondaryBg} ${t.btnSecondaryText} hover:opacity-80`
          }`}
        >
          <Smile className={`w-4 h-4 ${activeSection === 'odontogram' ? 'text-white' : t.accentText}`} /> Odontograma
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('extraoral')}
          className={`flex-1 min-w-[160px] py-3 px-4 rounded-xl font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
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
          className={`flex-1 min-w-[160px] py-3 px-4 rounded-xl font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
            activeSection === 'intraoral'
              ? `${t.btnPrimaryBg} ${t.btnPrimaryText} shadow-xs`
              : `${t.btnSecondaryBg} ${t.btnSecondaryText} hover:opacity-80`
          }`}
        >
          <Stethoscope className={`w-4 h-4 ${activeSection === 'intraoral' ? 'text-white' : t.accentText}`} /> Exame Intraoral
        </button>
      </div>

      {/* SECTION 1: EXAME EXTRAORAL */}
      {activeSection === 'extraoral' && (
        <div className="bg-white border border-[#e5e5d1] rounded-[32px] p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e5e5d1] pb-4">
            <div>
              <h2 className="text-lg font-serif italic text-[#5a5a40] flex items-center gap-2">
                <Eye className="w-5 h-5 text-[#d4a373]" />
                Exame Extraoral (Face, Pescoço e ATM)
              </h2>
              <p className="text-xs text-gray-500">Inspeção palpatória e anatômica da simetria facial, musculatura, linfonodos e articulação temporomandibular.</p>
            </div>

            <button
              type="button"
              onClick={handleSaveExam}
              className={`px-5 py-2.5 ${t.btnPrimaryBg} ${t.btnPrimaryText} font-bold text-xs rounded-xl shadow-2xs flex items-center gap-2 transition cursor-pointer`}
            >
              <Save className="w-4 h-4" /> Salvar Exame Extraoral
            </button>
          </div>

          {savedSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2.5 rounded-2xl text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Exame Extraoral salvo com sucesso!
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Simetria Facial */}
            <div className="bg-[#fbfbf9] p-4 rounded-2xl border border-[#e5e5d1] space-y-2">
              <label className="block font-bold text-[#5a5a40]">Simetria e Perfil Facial:</label>
              
              {/* Option Chips */}
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
                placeholder="Ex: Face simétrica, tercos faciais proporcionais, perfil reto..."
                className="w-full bg-white border border-[#e5e5d1] rounded-xl px-3.5 py-2 text-xs text-[#2c2c2c] focus:outline-none focus:border-[#5a5a40]"
              />
            </div>

            {/* Linfonodos Cervicais e Submandibulares */}
            <div className="bg-[#fbfbf9] p-4 rounded-2xl border border-[#e5e5d1] space-y-2">
              <label className="block font-bold text-[#5a5a40]">Linfonodos Cabeça e Pescoço:</label>
              
              {/* Option Chips */}
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
              
              {/* Option Chips */}
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
              
              {/* Option Chips */}
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
        <div className="bg-white border border-[#e5e5d1] rounded-[32px] p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e5e5d1] pb-4">
            <div>
              <h2 className="text-lg font-serif italic text-[#5a5a40] flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-[#d4a373]" />
                Exame Intraoral (Tecidos Moles e Duros)
              </h2>
              <p className="text-xs text-gray-500">Avaliação minuciosa da mucosa jugal, língua, assoalho bucal, palato, gengiva e rebordo alveolar.</p>
            </div>

            <button
              type="button"
              onClick={handleSaveExam}
              className={`px-5 py-2.5 ${t.btnPrimaryBg} ${t.btnPrimaryText} font-bold text-xs rounded-xl shadow-2xs flex items-center gap-2 transition cursor-pointer`}
            >
              <Save className="w-4 h-4" /> Salvar Exame Intraoral
            </button>
          </div>

          {savedSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2.5 rounded-2xl text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Exame Intraoral salvo com sucesso!
            </div>
          )}

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
                placeholder="Ex: Rugas palatinas íntegras, sem taurus ou fendas..."
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
        <div className="space-y-4">
          <Odontogram patientId={activePatientId} />
        </div>
      )}
    </div>
  );
};
