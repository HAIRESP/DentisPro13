import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Stethoscope, 
  Building2, 
  ChevronDown, 
  Check, 
  Lock, 
  ShieldCheck, 
  Sparkles,
  MapPin
} from 'lucide-react';

interface ProfessionalClinicSelectorProps {
  variant?: 'compact-header' | 'banner-inline' | 'card';
  className?: string;
}

export const ProfessionalClinicSelector: React.FC<ProfessionalClinicSelectorProps> = ({
  variant = 'compact-header',
  className = ''
}) => {
  const { 
    professionals, 
    clinics, 
    activeProfessional, 
    activeClinic, 
    activeProfessionalId, 
    activeClinicId, 
    requestSwitchProfessional,
    setActiveClinicId
  } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter clinics where the active professional works
  const currentProfClinics = clinics.filter(c => 
    !activeProfessional?.clinicIds || 
    activeProfessional.clinicIds.length === 0 || 
    activeProfessional.clinicIds.includes(c.id) ||
    c.id === 'cli-online'
  );

  const handleSelectProfessional = (profId: string) => {
    if (profId === activeProfessionalId) {
      return;
    }
    const targetProf = professionals.find(p => p.id === profId);
    let targetClinicId = activeClinicId;
    // If current clinic is not in target prof's clinics, pick target prof's primary or first clinic
    if (targetProf && targetProf.clinicIds && targetProf.clinicIds.length > 0) {
      if (!targetProf.clinicIds.includes(activeClinicId) && activeClinicId !== 'todas') {
        targetClinicId = targetProf.primaryClinicId || targetProf.clinicIds[0];
      }
    }
    setIsOpen(false);
    requestSwitchProfessional(profId, targetClinicId);
  };

  const handleSelectClinic = (clinicId: string) => {
    if (clinicId === activeClinicId) return;
    setActiveClinicId(clinicId);
  };

  // BANNER INLINE VARIANT (Used on Dashboard banner)
  if (variant === 'banner-inline') {
    return (
      <div className={`flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-black/20 p-2 sm:p-2.5 rounded-2xl backdrop-blur-xs border border-white/10 ${className}`}>
        {/* Professional Select */}
        <div className="flex-1 min-w-[200px] flex items-center gap-2 bg-white/10 hover:bg-white/15 px-3 py-1.5 rounded-xl border border-white/10 transition">
          <Stethoscope className="w-4 h-4 text-[#d4a373] shrink-0" />
          <div className="flex-1 min-w-0">
            <span className="text-[10px] text-white/60 font-semibold uppercase tracking-wider block leading-none mb-0.5">
              Cirurgião-Dentista Ativo
            </span>
            <select
              value={activeProfessionalId}
              onChange={(e) => handleSelectProfessional(e.target.value)}
              className="w-full bg-transparent text-white text-xs font-bold focus:outline-none cursor-pointer truncate"
              title="Alternar Cirurgião-Dentista (Requer Senha)"
            >
              {professionals.map((prof) => (
                <option key={prof.id} value={prof.id} className="text-stone-900 bg-white">
                  {prof.name} ({prof.cro})
                </option>
              ))}
            </select>
          </div>
          <Lock className="w-3.5 h-3.5 text-white/40 shrink-0" title="Troca protegida por senha" />
        </div>

        {/* Clinic Select */}
        <div className="flex-1 min-w-[180px] flex items-center gap-2 bg-white/10 hover:bg-white/15 px-3 py-1.5 rounded-xl border border-white/10 transition">
          <Building2 className="w-4 h-4 text-[#d4a373] shrink-0" />
          <div className="flex-1 min-w-0">
            <span className="text-[10px] text-white/60 font-semibold uppercase tracking-wider block leading-none mb-0.5">
              Unidade de Atendimento
            </span>
            <select
              value={activeClinicId}
              onChange={(e) => handleSelectClinic(e.target.value)}
              className="w-full bg-transparent text-white text-xs font-bold focus:outline-none cursor-pointer truncate"
              title="Selecionar unidade onde trabalha"
            >
              <option value="todas" className="text-stone-900 bg-white">Todas as Unidades</option>
              {clinics.map((clinic) => {
                const worksHere = activeProfessional?.clinicIds?.includes(clinic.id);
                return (
                  <option key={clinic.id} value={clinic.id} className="text-stone-900 bg-white">
                    {clinic.name} {worksHere ? '✓ (Vinculado)' : ''}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
      </div>
    );
  }

  // COMPACT HEADER VARIANT (Used on SectionHeaderBar)
  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-3.5 py-1.5 bg-white hover:bg-stone-50 text-stone-800 rounded-xl border border-stone-200/80 shadow-2xs hover:border-stone-300 transition cursor-pointer text-left group"
        title="Clique para alternar o Dentista ou a Unidade onde trabalha"
      >
        <div className="w-7 h-7 rounded-lg bg-[#5a5a40]/10 flex items-center justify-center text-[#5a5a40] shrink-0 group-hover:bg-[#5a5a40]/15 transition">
          <Stethoscope className="w-3.5 h-3.5 text-[#5a5a40]" />
        </div>

        <div className="flex flex-col min-w-0 pr-1">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-stone-900 truncate max-w-[150px] sm:max-w-[190px]">
              {activeProfessional?.name || 'Hugo Andres Ricoy'}
            </span>
            <span className="text-[10px] font-mono text-stone-500 font-bold bg-stone-100 px-1 py-0.2 rounded shrink-0">
              {activeProfessional?.cro || 'CRO'}
            </span>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-stone-500 truncate max-w-[170px] sm:max-w-[210px]">
            <Building2 className="w-3 h-3 text-[#d4a373] shrink-0" />
            <span className="truncate">
              {activeClinic?.name || 'Unidade Principal'}
            </span>
          </div>
        </div>

        <ChevronDown className={`w-3.5 h-3.5 text-stone-400 group-hover:text-stone-600 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* DROPDOWN POPOVER */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white border border-[#e5e5d1] rounded-2xl shadow-xl z-50 p-4 space-y-4 text-[#2c2c2c] animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#e5e5d1] pb-2.5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#d4a373]" />
              <span className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                Dentista & Unidade de Atendimento
              </span>
            </div>
            <span className="text-[10.5px] font-semibold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Lock className="w-3 h-3 text-stone-400" /> Protegido
            </span>
          </div>

          {/* Section 1: Cirurgião-Dentista */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-stone-600 uppercase tracking-wider flex items-center gap-1">
                <Stethoscope className="w-3.5 h-3.5 text-[#5a5a40]" />
                1. Selecionar Cirurgião-Dentista
              </label>
              <span className="text-[10px] text-stone-400">Senha necessária ao trocar</span>
            </div>

            <div className="max-h-48 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
              {professionals.map((prof) => {
                const isSelected = prof.id === activeProfessionalId;
                const worksInClinics = clinics.filter(c => prof.clinicIds && prof.clinicIds.includes(c.id));
                return (
                  <button
                    key={prof.id}
                    type="button"
                    onClick={() => handleSelectProfessional(prof.id)}
                    className={`w-full text-left p-2.5 rounded-xl border transition flex items-center justify-between gap-2 cursor-pointer ${
                      isSelected 
                        ? 'bg-[#5a5a40]/10 border-[#5a5a40] text-[#2c2c2c]' 
                        : 'bg-white border-stone-200/70 hover:bg-stone-50 text-stone-700'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold truncate">{prof.name}</span>
                        {isSelected && (
                          <span className="text-[9.5px] font-bold bg-[#5a5a40] text-white px-1.5 py-0.2 rounded shrink-0">
                            Ativo
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[10.5px] text-stone-500 pt-0.5">
                        <span className="font-mono font-semibold">{prof.cro}</span>
                        <span>•</span>
                        <span className="truncate">{prof.specialty}</span>
                      </div>
                      {worksInClinics.length > 0 && (
                        <div className="text-[9.5px] text-stone-400 truncate pt-0.5">
                          Atende em: {worksInClinics.map(c => c.name.replace('DentisPro - ', '')).join(', ')}
                        </div>
                      )}
                    </div>

                    {isSelected ? (
                      <Check className="w-4 h-4 text-[#5a5a40] shrink-0" />
                    ) : (
                      <Lock className="w-3.5 h-3.5 text-stone-300 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Unidade / Clínica onde trabalha */}
          <div className="space-y-1.5 pt-2 border-t border-[#e5e5d1]">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-stone-600 uppercase tracking-wider flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-[#d4a373]" />
                2. Unidade de Atendimento Ativa
              </label>
              <span className="text-[10px] text-stone-400">Onde está atendendo hoje</span>
            </div>

            <div className="space-y-1">
              <button
                type="button"
                onClick={() => handleSelectClinic('todas')}
                className={`w-full text-left px-3 py-2 rounded-xl border text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                  activeClinicId === 'todas'
                    ? 'bg-[#5a5a40]/10 border-[#5a5a40] text-[#5a5a40]'
                    : 'bg-white border-stone-200/70 hover:bg-stone-50 text-stone-700'
                }`}
              >
                <span>Todas as Unidades (Visão Consolidada)</span>
                {activeClinicId === 'todas' && <Check className="w-3.5 h-3.5" />}
              </button>

              {clinics.map((clinic) => {
                const isSelected = clinic.id === activeClinicId;
                const isLinkedToProf = activeProfessional?.clinicIds?.includes(clinic.id);
                return (
                  <button
                    key={clinic.id}
                    type="button"
                    onClick={() => handleSelectClinic(clinic.id)}
                    className={`w-full text-left px-3 py-2 rounded-xl border transition flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-[#5a5a40]/10 border-[#5a5a40] text-stone-900'
                        : 'bg-white border-stone-200/70 hover:bg-stone-50 text-stone-700'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold truncate">{clinic.name}</span>
                        {isLinkedToProf && (
                          <span className="text-[9px] font-bold text-[#6c4e28] bg-[#d4a373]/20 px-1 py-0.2 rounded shrink-0">
                            Vínculo
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-stone-400 truncate">
                        <MapPin className="w-2.5 h-2.5 shrink-0" />
                        <span>{clinic.city || 'São Paulo - SP'}</span>
                      </div>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#5a5a40] shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-stone-50 border border-stone-200/70 p-2 rounded-xl text-[10.5px] text-stone-500 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Documentos, receituários e laudos utilizam automaticamente os dados do dentista e clínica ativos.</span>
          </div>
        </div>
      )}
    </div>
  );
};
