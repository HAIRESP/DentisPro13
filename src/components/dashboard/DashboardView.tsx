import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { getThemeStyles } from '../../utils/themeUtils';
import { UserSessionModal } from '../common/UserSessionModal';
import { ClinicListModal } from '../common/ClinicListModal';
import { 
  Users, 
  Calendar, 
  TrendingUp, 
  LayoutDashboard,
  FileText,
  FileCheck2,
  Bot,
  Boxes,
  Settings,
  ArrowRight,
  Sparkles,
  Building2,
  KeyRound,
  Edit2,
  Check,
  X
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const { 
    patients, 
    appointments, 
    inventory, 
    setActiveTab, 
    activeProfessional,
    clinicInfo,
    updateClinicInfo,
    professionals,
    activeProfessionalId,
    setActiveProfessionalId,
    clinics,
    activeClinicId,
    setActiveClinicId,
    layoutTheme
  } = useApp();

  const { currentUser, userPermissions } = useAuth();
  const t = getThemeStyles(layoutTheme);

  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showClinicListModal, setShowClinicListModal] = useState(false);
  const [isEditingBrand, setIsEditingBrand] = useState(false);
  const [brandTitleInput, setBrandTitleInput] = useState(clinicInfo.headerTitle || clinicInfo.name || 'DentisPro');

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter(a => a.date === todayStr);
  const lowStockItems = inventory.filter(i => i.quantity <= i.minQuantity);

  const currentDentistName = activeProfessional?.name || clinicInfo.dentistName || 'Dr(a). Cirurgião-Dentista';
  const currentBrandDisplay = clinicInfo.name || clinicInfo.headerTitle || 'DentisPro';

  // Dynamic styling for the TOPO integrated block inside the Banner
  let brandAccent = "text-[#d4a373]";
  let selectBg = "bg-[#3b3b2a]";
  let cardBg = "bg-white/10";

  if (layoutTheme === 'dental-clean') {
    brandAccent = "text-[#38bdf8]";
    selectBg = "bg-[#075985]";
    cardBg = "bg-white/15";
  } else if (layoutTheme === 'dark-executive') {
    brandAccent = "text-[#f59e0b]";
    selectBg = "bg-[#27272a]";
    cardBg = "bg-zinc-800/90";
  } else if (layoutTheme === 'soft-pink') {
    brandAccent = "text-[#f43f5e]";
    selectBg = "bg-[#710e2b]";
    cardBg = "bg-white/15";
  }

  // 8 Main Interactive Hub Cards organized in 2 rows × 4 columns
  const mainCards = [
    {
      id: 'pacientes' as const,
      title: 'Pacientes',
      subtitle: 'Prontuário & Fichas Clínicas',
      description: 'Prontuário completo, fichas de anamnese, histórico clínico, fotos, anexos e dados cadastrais.',
      stat: `${patients.length} Pacientes Cadastrados`,
      actionText: 'Acessar Pacientes',
      icon: Users,
      color: 'amber',
      iconBg: 'bg-amber-100 text-amber-800',
      borderHover: 'hover:border-amber-500',
      badgeColor: 'bg-amber-50 text-amber-800 border-amber-200'
    },
    {
      id: 'agendamento' as const,
      title: 'Agenda',
      subtitle: 'Consultas & Calendário',
      description: 'Agendamento de consultas, calendário semanal/mensal e confirmações automáticas por WhatsApp.',
      stat: `${todayAppointments.length} Consultas Hoje`,
      actionText: 'Abrir Agenda',
      icon: Calendar,
      color: 'blue',
      iconBg: 'bg-blue-100 text-blue-700',
      borderHover: 'hover:border-blue-500',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200'
    },
    {
      id: 'documentos' as const,
      title: 'Documentos',
      subtitle: 'Contratos, Termos & Receitas',
      description: 'Emissão de atestados, receitas comuns e de controle especial, laudos, consentimentos e termos clínicos.',
      stat: 'Modelos Prontos & Certificados',
      actionText: 'Acessar Documentos',
      icon: FileText,
      color: 'purple',
      iconBg: 'bg-purple-100 text-purple-700',
      borderHover: 'hover:border-purple-500',
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200'
    },
    {
      id: 'laudos' as const,
      title: 'Laudos',
      subtitle: 'Laudos Clínicos & Atendimentos',
      description: 'Laudo completo dos últimos pacientes atendidos pelo cirurgião-dentista, histórico clínico, procedimentos e diagnóstico.',
      stat: 'Últimos pacientes atendidos',
      actionText: 'Acessar Laudos',
      icon: FileCheck2,
      color: 'sky',
      iconBg: 'bg-sky-100 text-sky-700',
      borderHover: 'hover:border-sky-500',
      badgeColor: 'bg-sky-50 text-sky-700 border-sky-200'
    },
    {
      id: 'triagem' as const,
      title: 'WhatsApp',
      subtitle: 'Triagem 24h & Assistente IA',
      description: 'Triagem inteligente 24h, agendamentos automáticos, disparo de lembretes e integração oficial via Webhook.',
      stat: 'Triagem & Confirmações Ativas',
      actionText: 'Abrir WhatsApp',
      icon: Bot,
      color: 'emerald',
      iconBg: 'bg-emerald-100 text-[#25D366]',
      borderHover: 'hover:border-[#25D366]',
      badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200'
    },
    {
      id: 'estoque' as const,
      title: 'Estoque',
      subtitle: 'Insumos & Alertas de Baixa',
      description: 'Controle de materiais, entradas, saídas, rastreabilidade de lotes e alertas de reposição mínima.',
      stat: `${lowStockItems.length} Alertas de Baixa`,
      actionText: 'Gerenciar Estoque',
      icon: Boxes,
      color: 'amber',
      iconBg: 'bg-amber-100 text-amber-700',
      borderHover: 'hover:border-amber-600',
      badgeColor: lowStockItems.length > 0 ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold' : 'bg-slate-100 text-slate-700 border-slate-200',
      alertBadge: lowStockItems.length > 0 ? lowStockItems.length : undefined
    },
    {
      id: 'relatorios' as const,
      title: 'Relatórios',
      subtitle: 'Financeiro & Indicadores',
      description: 'Relatórios financeiros, métricas de crescimento, faturamento mensal e indicadores de desempenho clínico.',
      stat: 'Métricas & DRE Gerencial',
      actionText: 'Ver Relatórios',
      icon: TrendingUp,
      color: 'teal',
      iconBg: 'bg-teal-100 text-teal-700',
      borderHover: 'hover:border-teal-500',
      badgeColor: 'bg-teal-50 text-teal-800 border-teal-200'
    },
    {
      id: 'configuracoes' as const,
      title: 'Configurações',
      subtitle: 'Clínica, Dentistas & Unidades',
      description: 'Cadastro de clínicas, gestão de dentistas operadores, permissões, parâmetros e segurança.',
      stat: 'Sistema & Unidades',
      actionText: 'Abrir Configurações',
      icon: Settings,
      color: 'slate',
      iconBg: 'bg-slate-100 text-slate-700',
      borderHover: 'hover:border-slate-600',
      badgeColor: 'bg-slate-100 text-slate-700 border-slate-200'
    }
  ];

  return (
    <div className="space-y-2.5 w-full max-w-[1700px] mx-auto pb-2">
      {/* Banner Superior Ultra-Compacto com TOPO Integrado em Linha na Parte Superior */}
      <div className={`${t.bannerBg} rounded-xl px-3 py-2 sm:px-3.5 sm:py-2.5 shadow-xs border ${t.bannerBorder} relative overflow-hidden transition-colors duration-300`}>
        <div className="relative z-10 space-y-1.5">
          
          {/* TOPO EM LINHA ÚNICA: Logotipo/Marca, Sessão, Dentista Operador e Unidade */}
          <div className="bg-black/25 backdrop-blur-md rounded-lg px-2.5 py-1.5 border border-white/20 shadow-xs flex flex-wrap xl:flex-nowrap items-center justify-between gap-2.5">
            
            {/* 1. Logotipo e Marca com edição rápida de nome */}
            <div className="flex items-center min-w-[180px] max-w-[240px]">
              {isEditingBrand ? (
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    const trimmed = brandTitleInput.trim();
                    if (trimmed) {
                      updateClinicInfo({ name: trimmed, headerTitle: trimmed });
                    }
                    setIsEditingBrand(false);
                  }}
                  className="flex items-center gap-1.5 w-full"
                >
                  <input
                    type="text"
                    autoFocus
                    value={brandTitleInput}
                    onChange={(e) => setBrandTitleInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        setBrandTitleInput(currentBrandDisplay);
                        setIsEditingBrand(false);
                      }
                    }}
                    className="flex-1 min-w-0 bg-white/20 text-white font-serif italic text-xs px-2 py-0.5 rounded border border-white/40 focus:outline-none focus:ring-1 focus:ring-white/60"
                    placeholder="Nome da Clínica"
                  />
                  <button
                    type="submit"
                    className="p-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded transition shrink-0 cursor-pointer shadow-xs"
                    title="Salvar Nome"
                  >
                    <Check className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setBrandTitleInput(currentBrandDisplay);
                      setIsEditingBrand(false);
                    }}
                    className="p-1 bg-white/10 hover:bg-white/20 text-white/80 hover:text-white rounded transition shrink-0 cursor-pointer border border-white/20"
                    title="Cancelar"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </form>
              ) : (
                <div className="flex items-center justify-between w-full gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <div className={`w-6 h-6 rounded-md ${brandAccent} bg-white/10 flex items-center justify-center font-bold shadow-xs shrink-0 border border-white/15`}>
                      <LayoutDashboard className="w-3.5 h-3.5 text-white" />
                    </div>
                    <h1 className="text-white text-base font-serif italic tracking-wide truncate">
                      {currentBrandDisplay.toLowerCase() === 'dentispro' ? (
                        <>Dentis<span className={brandAccent}>Pro</span></>
                      ) : (
                        currentBrandDisplay
                      )}
                    </h1>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setBrandTitleInput(currentBrandDisplay);
                      setIsEditingBrand(true);
                    }}
                    className="p-0.5 text-white/70 hover:text-white hover:bg-white/20 rounded transition cursor-pointer shrink-0"
                    title="Editar nome do sistema / clínica"
                  >
                    <Edit2 className="w-2.5 h-2.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Divisor Vertical */}
            <div className="hidden xl:block w-px h-5 bg-white/15" />

            {/* 2. Card de Identificação do Usuário Logado */}
            <div className={`flex items-center gap-2 px-2 py-0.5 rounded-md ${cardBg} border border-white/15 min-w-[160px]`}>
              <div className="w-5 h-5 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-white font-bold text-[9px] shrink-0">
                {currentUser ? currentUser.name.substring(0, 2).toUpperCase() : 'HA'}
              </div>
              <div className="overflow-hidden text-left min-w-0 flex-1">
                <p className="text-[10.5px] font-bold text-white truncate leading-tight">
                  {currentUser?.name || 'Hugo Andres'}
                </p>
                <p className={`text-[9px] font-semibold truncate ${brandAccent} leading-tight`}>
                  {userPermissions.label || 'Administrador'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowSessionModal(true)}
                className="px-1.5 py-0.5 bg-white/15 hover:bg-white/25 text-white text-[10px] font-bold rounded transition shrink-0 cursor-pointer flex items-center gap-1 border border-white/20 shadow-2xs active:scale-95"
                title="Trocar Perfil / Iniciar Sessão"
              >
                <KeyRound className="w-2.5 h-2.5 text-[#d4a373]" />
                <span>Sessão</span>
              </button>
            </div>

            {/* Divisor Vertical */}
            <div className="hidden xl:block w-px h-5 bg-white/15" />

            {/* 3. Seleção em Dropdown do Dentista Operador */}
            {professionals.length > 0 && (
              <div className="flex items-center gap-1.5 min-w-[190px] flex-1 max-w-[240px]">
                <label className="text-[10px] font-semibold text-white/90 whitespace-nowrap shrink-0">
                  Dentista:
                </label>
                <select
                  value={activeProfessionalId}
                  onChange={(e) => setActiveProfessionalId(e.target.value)}
                  className={`w-full ${selectBg} text-white border border-white/25 rounded-md px-2 py-0.5 text-xs font-medium focus:outline-none focus:border-white cursor-pointer shadow-2xs`}
                  title="Selecionar Dentista Operador"
                >
                  {professionals.map(p => (
                    <option key={p.id} value={p.id} className={`${selectBg} text-white`}>
                      {p.name} ({p.cro})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Divisor Vertical */}
            <div className="hidden xl:block w-px h-5 bg-white/15" />

            {/* 4. Seleção em Dropdown da Unidade / Consultório ativa */}
            {clinics.length > 0 && (
              <div className="flex items-center gap-1.5 min-w-[200px] flex-1 max-w-[260px]">
                <label className="text-[10px] font-semibold text-white/90 whitespace-nowrap shrink-0">
                  Unidade:
                </label>
                <select
                  value={activeClinicId}
                  onChange={(e) => setActiveClinicId(e.target.value)}
                  className={`w-full ${selectBg} text-white border border-white/25 rounded-md px-2 py-0.5 text-xs font-medium focus:outline-none focus:border-white cursor-pointer shadow-2xs`}
                  title="Selecionar Unidade Ativa"
                >
                  <option value="todas" className={`${selectBg} text-white`}>Todas ({clinics.length})</option>
                  {clinics.map(c => (
                    <option key={c.id} value={c.id} className={`${selectBg} text-white`}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowClinicListModal(true)}
                  className="text-[10px] font-bold text-[#d4a373] hover:text-white transition flex items-center gap-0.5 cursor-pointer whitespace-nowrap px-1.5 py-0.5 rounded bg-white/10 hover:bg-white/20 border border-white/15 shrink-0"
                  title="Ver e gerenciar todas as clínicas cadastradas"
                >
                  <Building2 className="w-2.5 h-2.5" />
                  <span>Ver</span>
                </button>
              </div>
            )}

          </div>

          {/* Linha Inferior do Banner: Boas-Vindas e Data em 1 linha compacta */}
          <div className="flex flex-wrap items-center justify-between gap-1.5 px-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[9.5px] font-bold uppercase tracking-wider bg-white/10 border border-white/15 flex items-center gap-1 text-white shadow-2xs">
                <Sparkles className={`w-2.5 h-2.5 ${t.bannerAccentText}`} />
                DentisPro
              </span>
              <p className="text-[11.5px] text-white font-medium">
                Bem-vindo(a), <strong className={t.bannerAccentText}>{currentDentistName}</strong>
              </p>
            </div>

            <span className={`text-[10.5px] ${t.bannerSubtext} font-medium`}>
              {new Date().toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>

        </div>
      </div>

      {/* Grade dos 8 Módulos Principais: 2 Linhas × 4 Colunas Compactas */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between px-1">
          <h2 className={`text-xs sm:text-sm font-bold ${t.headingText} flex items-center gap-1.5`}>
            <Sparkles className={`w-3.5 h-3.5 ${t.accentText}`} />
            Módulos do Sistema
          </h2>
          <span className="text-[10.5px] text-gray-500 font-medium">
            Clique no módulo desejado
          </span>
        </div>

        {/* 2 Linhas × 4 Colunas Grid Amplo (Cards com o dobro de altura e design expandido) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 items-stretch auto-rows-fr">
          {mainCards.map((card) => {
            const Icon = card.icon;
            return (
              <button
                key={card.id}
                type="button"
                onClick={() => setActiveTab(card.id)}
                className={`group relative bg-white border border-slate-200/90 ${card.borderHover} p-5 sm:p-6 rounded-2xl shadow-xs hover:shadow-xl transition-all duration-200 text-left cursor-pointer flex flex-col justify-between overflow-hidden active:scale-[0.99] w-full h-full min-h-[290px] sm:min-h-[310px]`}
              >
                {/* Background Decorator Accent */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-slate-50 to-transparent rounded-bl-full pointer-events-none -z-0 group-hover:scale-110 transition-transform duration-300" />

                <div className="space-y-3 relative z-10 w-full flex-1 flex flex-col justify-start">
                  {/* Cabeçalho do Card Expandido com Ícone Grande */}
                  <div className="flex items-start justify-between gap-3 shrink-0">
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl ${card.iconBg} flex items-center justify-center font-bold group-hover:scale-110 group-hover:shadow-md transition-all shrink-0 shadow-xs`}>
                        <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-[#4a4a35] transition leading-tight">
                          {card.title}
                        </h3>
                        <p className="text-xs sm:text-sm font-semibold text-slate-500 pt-0.5">
                          {card.subtitle}
                        </p>
                      </div>
                    </div>

                    {card.alertBadge !== undefined && (
                      <span className="bg-amber-500 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-xs shrink-0 animate-pulse">
                        {card.alertBadge}
                      </span>
                    )}
                  </div>

                  {/* Descrição Completa e Clara, sem truncamento excessivo */}
                  <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed pt-2 flex-1">
                    {card.description}
                  </p>
                </div>

                {/* Rodapé Expandido com Botão de Ação Destacado */}
                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs w-full shrink-0">
                  <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border truncate max-w-[70%] ${card.badgeColor}`}>
                    {card.stat}
                  </span>
                  <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800 group-hover:text-[#4a4a35] transition shrink-0 bg-slate-50 group-hover:bg-[#d4a373]/15 px-2.5 py-1 rounded-lg border border-slate-200/60">
                    <span className="hidden sm:inline">{card.actionText}</span>
                    <ArrowRight className="w-4 h-4 text-[#d4a373] group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </button>
            );
          })}
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
          setActiveClinicId(clinicId);
          setActiveTab('configuracoes');
        }}
      />
    </div>
  );
};
