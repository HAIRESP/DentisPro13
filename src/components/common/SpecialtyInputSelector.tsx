import React, { useState } from 'react';
import { Plus, Sparkles, Check, Tag } from 'lucide-react';

export const RECOMMENDED_SPECIALTIES = [
  'Clínica Geral',
  'Implantodontia',
  'Ortodontia',
  'Endodontia',
  'Periodontia',
  'Odontopediatria',
  'Prótese Dentária',
  'Cirurgia Bucomaxilofacial',
  'Harmonização Orofacial',
  'Dentística Estética',
  'Radiologia Odontológica',
  'Odontogeriatria',
  'DTM e Dor Orofacial',
  'Estomatologia',
  'Odontologia do Trabalho',
  'Patologia Oral',
  'Ortopedia Funcional dos Maxilares',
  'Odontologia Esportiva',
  'Laserterapia Odontológica'
];

interface SpecialtyInputSelectorProps {
  value: string;
  onChange: (specialty: string) => void;
  availableSpecialties?: string[];
  onAddSpecialty?: (newSpecialty: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
}

export const SpecialtyInputSelector: React.FC<SpecialtyInputSelectorProps> = ({
  value,
  onChange,
  availableSpecialties = RECOMMENDED_SPECIALTIES,
  onAddSpecialty,
  label = 'Especialidade',
  placeholder = 'Digitar ou selecionar especialidade...',
  className = ''
}) => {
  const [isOpenInput, setIsOpenInput] = useState(false);
  const [customInputText, setCustomInputText] = useState('');

  // Combine default recommendations with passed list
  const mergedSpecialties = Array.from(new Set([...availableSpecialties, ...RECOMMENDED_SPECIALTIES]));

  // Suggested specialties that are not currently selected
  const suggestedOptions = RECOMMENDED_SPECIALTIES.filter(
    (s) => s.toLowerCase() !== value.toLowerCase()
  );

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === '__NEW__') {
      setIsOpenInput(true);
    } else {
      onChange(val);
      setIsOpenInput(false);
    }
  };

  const handleConfirmCustomSpecialty = (selectedText?: string) => {
    const textToUse = (selectedText || customInputText).trim();
    if (textToUse) {
      if (onAddSpecialty) {
        onAddSpecialty(textToUse);
      }
      onChange(textToUse);
      setCustomInputText('');
      setIsOpenInput(false);
    }
  };

  return (
    <div className={`space-y-2 font-sans ${className}`}>
      {label && (
        <label className="block text-xs font-semibold text-[#5a5a40] mb-1 flex items-center justify-between">
          <span>{label}</span>
          <span className="text-[10px] text-gray-500 font-normal">Selecione ou digite uma nova</span>
        </label>
      )}

      {/* Main Dropdown & Toggle Button */}
      <div className="flex items-center gap-2">
        <select
          value={value}
          onChange={handleSelectChange}
          className="w-full bg-white border border-[#e5e5d1] rounded-2xl px-3 py-2 text-xs text-[#2c2c2c] font-bold focus:outline-none focus:border-[#5a5a40] shadow-2xs"
        >
          {mergedSpecialties.map((spec) => (
            <option key={spec} value={spec}>
              {spec}
            </option>
          ))}
          <option value="__NEW__" className="font-bold text-amber-800 bg-amber-50">
            ➕ Digitar Nova Especialidade...
          </option>
        </select>

        <button
          type="button"
          onClick={() => setIsOpenInput(!isOpenInput)}
          className={`p-2 rounded-xl transition cursor-pointer shrink-0 border ${
            isOpenInput
              ? 'bg-[#d4a373] text-white border-[#d4a373]'
              : 'bg-[#5a5a40] hover:bg-[#4a4a35] text-white border-[#5a5a40]'
          }`}
          title="Nova Especialidade / Sugestões"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Interactive Panel: Suggestions Chips + Custom Text Input */}
      {isOpenInput && (
        <div className="p-3.5 bg-gradient-to-br from-amber-50/80 via-stone-50 to-emerald-50/50 rounded-2xl border border-amber-200 shadow-md space-y-3 transition-all animate-fadeIn text-xs">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-amber-200/60 pb-2">
            <span className="font-bold text-[#5a5a40] flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              Sugestões e Nova Especialidade
            </span>
            <button
              type="button"
              onClick={() => setIsOpenInput(false)}
              className="text-[10px] text-stone-500 hover:text-stone-800 font-bold"
            >
              Fechar ✕
            </button>
          </div>

          {/* Suggested Specialty Chips (Click to Select) */}
          <div className="space-y-1.5">
            <span className="block text-[10px] font-bold text-[#5a5a40] uppercase">
              Sugestões Rápidas de Especialidades Odontológicas:
            </span>
            <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-1 bg-white/70 rounded-xl border border-stone-200/80">
              {suggestedOptions.slice(0, 12).map((spec) => (
                <button
                  key={spec}
                  type="button"
                  onClick={() => handleConfirmCustomSpecialty(spec)}
                  className="px-2 py-1 bg-white hover:bg-amber-100 text-[#5a5a40] hover:text-amber-900 text-[10.5px] font-semibold rounded-lg border border-stone-200 hover:border-amber-300 transition flex items-center gap-1 cursor-pointer shadow-2xs"
                >
                  <Tag className="w-2.5 h-2.5 text-amber-600" />
                  {spec}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Text Input for Completely New Specialty */}
          <div className="space-y-1.5 pt-1 border-t border-amber-200/60">
            <label className="block text-[10px] font-bold text-[#5a5a40] uppercase">
              Ou digite a Nova Especialidade:
            </label>

            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  list="specialty-suggestions-list"
                  placeholder={placeholder}
                  value={customInputText}
                  onChange={(e) => setCustomInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleConfirmCustomSpecialty();
                    }
                  }}
                  className="w-full bg-white border border-[#e5e5d1] rounded-xl px-3 py-1.5 text-xs text-stone-900 font-semibold focus:outline-none focus:border-[#5a5a40] focus:ring-1 focus:ring-[#5a5a40]"
                />
                <datalist id="specialty-suggestions-list">
                  {RECOMMENDED_SPECIALTIES.map((spec) => (
                    <option key={spec} value={spec} />
                  ))}
                </datalist>
              </div>

              <button
                type="button"
                onClick={() => handleConfirmCustomSpecialty()}
                disabled={!customInputText.trim()}
                className="px-3 py-1.5 bg-[#2c3e2e] hover:bg-[#1b281d] disabled:opacity-50 text-white text-xs font-bold rounded-xl transition flex items-center gap-1 shrink-0 cursor-pointer shadow-2xs"
              >
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
