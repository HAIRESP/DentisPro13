import React, { useState } from 'react';
import { useApp, ActiveTab } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { UserSessionModal } from './UserSessionModal';
import { ClinicListModal } from './ClinicListModal';
import { 
  ArrowLeft, 
  LayoutDashboard, 
  Users, 
  Calendar, 
  FileText, 
  Bot, 
  Boxes, 
  TrendingUp, 
  Settings, 
  KeyRound,
  Stethoscope,
  Building2,
  ChevronRight,
  FileCheck2
} from 'lucide-react';

const TAB_CONFIG: Record<string, { label: string; icon: React.FC<{ className?: string }> }> = {
  dashboard: { label: 'Painel', icon: LayoutDashboard },
  pacientes: { label: 'Pacientes & Prontuários', icon: Users },
  agendamento: { label: 'Agenda & Consultas', icon: Calendar },
  documentos: { label: 'Documentos Odontológicos', icon: FileText },
  laudos: { label: 'Laudos Clínicos & Atendimentos', icon: FileCheck2 },
  triagem: { label: 'WhatsApp & Triagem IA', icon: Bot },
  estoque: { label: 'Estoque & Insumos', icon: Boxes },
  relatorios: { label: 'Relatórios Gerenciais', icon: TrendingUp },
  financeiro: { label: 'Financeiro & DRE', icon: TrendingUp },
  configuracoes: { label: 'Configurações', icon: Settings },
  exame_clinico: { label: 'Exame Clínico & Odontograma', icon: Stethoscope },
  odontograma: { label: 'Odontograma', icon: Stethoscope },
};

export const SectionHeaderBar: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    activeProfessional, 
    clinicInfo,
    activeClinic,
    layoutTheme 
  } = useApp();

  const { currentUser, userPermissions } = useAuth();
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showClinicListModal, setShowClinicListModal] = useState(false);

  const currentTabInfo = TAB_CONFIG[activeTab] || { label: activeTab, icon: LayoutDashboard };
  const CurrentIcon = currentTabInfo.icon;

  let barBg = "bg-white border-[#e5e5d1] text-[#2c2c2c]";
  let btnBack = "bg-[#4a4a35] hover:bg-[#3b3b2a] text-white";
  let brandColor = "text-[#4a4a35]";

  if (layoutTheme === 'dental-clean') {
    barBg = "bg-white border-sky-100 text-slate-800";
    btnBack = "bg-[#0f4c81] hover:bg-[#075985] text-white";
    brandColor = "text-[#0f4c81]";
  } else if (layoutTheme === 'dark-executive') {
    barBg = "bg-[#18181b] border-zinc-800 text-zinc-100";
    btnBack = "bg-[#27272a] hover:bg-zinc-700 text-amber-400";
    brandColor = "text-[#f59e0b]";
  } else if (layoutTheme === 'soft-pink') {
    barBg = "bg-white border-rose-100 text-[#4c0519]";
    btnBack = "bg-[#881337] hover:bg-[#710e2b] text-white";
    brandColor = "text-[#881337]";
  }

  return (
    <>
      <div className={`w-full ${barBg} border-b shadow-xs py-3 px-4 sm:px-6 mb-5 rounded-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 transition-colors duration-200 print:hidden`}>
        {/* Left Side: Back to Dashboard Button & Breadcrumb */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-xs active:scale-95 ${btnBack}`}
            title="Voltar para a tela inicial do Painel"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar para Tela Inicial</span>
          </button>

          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-stone-500">
            <span 
              onClick={() => setActiveTab('dashboard')} 
              className="hover:text-stone-800 cursor-pointer flex items-center gap-1 transition"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              Painel
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
            <span className={`font-bold flex items-center gap-1.5 ${brandColor}`}>
              <CurrentIcon className="w-3.5 h-3.5" />
              {currentTabInfo.label}
            </span>
          </div>
        </div>

        {/* Right Side: Quick info & Session Access */}
        <div className="flex items-center justify-end gap-2 text-xs">
          {/* Active Unit / Clinic */}
          {activeClinic && (
            <button
              type="button"
              onClick={() => setShowClinicListModal(true)}
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium transition cursor-pointer"
              title="Ver unidades cadastradas"
            >
              <Building2 className="w-3.5 h-3.5 text-[#d4a373]" />
              <span className="truncate max-w-[130px]">{activeClinic.name}</span>
            </button>
          )}

          {/* Active Dentist */}
          {activeProfessional && (
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-stone-100 text-stone-700 font-medium">
              <Stethoscope className="w-3.5 h-3.5 text-emerald-600" />
              <span className="truncate max-w-[140px]">{activeProfessional.name}</span>
            </div>
          )}

          {/* User Profile Card & Switch button */}
          <div className="flex items-center gap-2 pl-2 border-l border-stone-200">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold leading-tight text-stone-800">
                {currentUser?.name || 'Hugo Andres'}
              </p>
              <p className="text-[10px] text-stone-500 font-medium">
                {userPermissions.label || 'Administrador'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowSessionModal(true)}
              className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer border border-stone-200 shadow-2xs"
              title="Trocar Perfil / Iniciar Sessão"
            >
              <KeyRound className="w-3.5 h-3.5 text-[#d4a373]" />
              <span>Sessão</span>
            </button>
          </div>
        </div>
      </div>

      {/* User Session Modal */}
      <UserSessionModal 
        isOpen={showSessionModal} 
        onClose={() => setShowSessionModal(false)} 
      />

      {/* Clinic List Modal */}
      <ClinicListModal
        isOpen={showClinicListModal}
        onClose={() => setShowClinicListModal(false)}
        onOpenSettingsClinic={(clinicId) => {
          setActiveTab('configuracoes');
        }}
      />
    </>
  );
};
