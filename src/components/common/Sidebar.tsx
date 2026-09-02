import React, { useState } from 'react';
import { useApp, ActiveTab } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { UserSessionModal } from './UserSessionModal';
import { ClinicListModal } from './ClinicListModal';
import { 
  Users, 
  Calendar, 
  TrendingUp, 
  Settings, 
  LayoutDashboard, 
  Menu,
  X,
  Stethoscope,
  Bot,
  MessageCircle,
  FileText,
  FileCheck2,
  ShieldCheck,
  KeyRound,
  Lock,
  Boxes,
  UserPlus,
  ClipboardList,
  Edit2,
  Check,
  Building2
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    inventory, 
    clinicInfo, 
    updateClinicInfo,
    professionals, 
    activeProfessionalId, 
    setActiveProfessionalId,
    activeProfessional,
    clinics,
    activeClinicId,
    setActiveClinicId,
    activeClinic,
    layoutTheme
  } = useApp();
  const { currentUser, userRole, userPermissions, checkTabPermission } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showClinicListModal, setShowClinicListModal] = useState(false);

  // Brand Name Editing State
  const [isEditingBrand, setIsEditingBrand] = useState(false);
  const [brandTitleInput, setBrandTitleInput] = useState(clinicInfo.headerTitle || clinicInfo.name || 'DentisPro');

  const currentBrandDisplay = clinicInfo.name || clinicInfo.headerTitle || 'DentisPro';

  // Check low stock count
  const lowStockCount = inventory.filter(i => i.quantity <= i.minQuantity).length;

  // Determine dynamic theme styling for Sidebar
  let sidebarBg = "bg-[#4a4a35] text-[#d1d1c1] border-[#5a5a40]";
  let mobileBarBg = "bg-[#4a4a35]";
  let touchBarBg = "bg-[#3b3b2a]/95 border-white/20";
  let brandAccent = "text-[#d4a373]";
  let cardBg = "bg-[#5a5a40]/80";
  let iconActive = "text-[#d4a373]";
  let badgeActive = "bg-[#d4a373] text-white";
  let selectBg = "bg-[#4a4a35]";
  let supportCardBg = "bg-[#3b3b2a]";

  if (layoutTheme === 'dental-clean') {
    sidebarBg = "bg-[#0f4c81] text-[#e0f2fe] border-[#0284c7]";
    mobileBarBg = "bg-[#0f4c81]";
    touchBarBg = "bg-[#075985]/95 border-sky-300/30";
    brandAccent = "text-[#38bdf8]";
    cardBg = "bg-[#0284c7]/40";
    iconActive = "text-[#38bdf8]";
    badgeActive = "bg-[#38bdf8] text-[#0f4c81]";
    selectBg = "bg-[#0f4c81]";
    supportCardBg = "bg-[#075985]";
  } else if (layoutTheme === 'dark-executive') {
    sidebarBg = "bg-[#18181b] text-[#a1a1aa] border-[#27272a]";
    mobileBarBg = "bg-[#18181b]";
    touchBarBg = "bg-[#09090b]/95 border-zinc-700";
    brandAccent = "text-[#f59e0b]";
    cardBg = "bg-[#27272a]/90";
    iconActive = "text-[#f59e0b]";
    badgeActive = "bg-[#f59e0b] text-black";
    selectBg = "bg-[#18181b]";
    supportCardBg = "bg-[#27272a]";
  } else if (layoutTheme === 'soft-pink') {
    sidebarBg = "bg-[#881337] text-[#fbcfe8] border-[#9f1239]";
    mobileBarBg = "bg-[#881337]";
    touchBarBg = "bg-[#710e2b]/95 border-pink-300/30";
    brandAccent = "text-[#f43f5e]";
    cardBg = "bg-[#9f1239]/80";
    iconActive = "text-[#f43f5e]";
    badgeActive = "bg-[#f43f5e] text-white";
    selectBg = "bg-[#881337]";
    supportCardBg = "bg-[#710e2b]";
  }

  const menuItems: { id: ActiveTab; label: string; icon: React.FC<{ className?: string }>; badge?: number }[] = [
    { id: 'dashboard', label: 'Painel', icon: LayoutDashboard },
    { id: 'pacientes', label: 'Pacientes', icon: Users },
    { id: 'agendamento', label: 'Agenda', icon: Calendar },
    { id: 'documentos', label: 'Documentos', icon: FileText },
    { id: 'laudos', label: 'Laudos', icon: FileCheck2 },
    { id: 'triagem', label: 'WhatsApp', icon: Bot },
    { id: 'estoque', label: 'Estoque', icon: Boxes, badge: lowStockCount > 0 ? lowStockCount : undefined },
    { id: 'relatorios', label: 'Relatórios', icon: TrendingUp },
    { id: 'configuracoes', label: 'Configurações', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Bar Top */}
      <div className={`lg:hidden ${mobileBarBg} text-white px-4 py-3 flex items-center justify-between sticky top-0 z-40 shadow-md transition-colors duration-200`}>
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg ${brandAccent} bg-white/10 flex items-center justify-center font-bold`}>
            <Stethoscope className="w-5 h-5 text-white" />
          </div>
          <span className="font-serif italic text-lg text-white">
            {currentBrandDisplay.toLowerCase() === 'dentispro' ? (
              <>Dentis<span className={brandAccent}>Pro</span></>
            ) : (
              currentBrandDisplay
            )}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowClinicListModal(true)}
            className="p-1.5 rounded-xl text-xs font-bold bg-white/15 text-white hover:bg-white/25 transition flex items-center gap-1 cursor-pointer"
            title="Lista de Clínicas Cadastradas"
          >
            <Building2 className="w-4 h-4 text-[#d4a373]" />
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('documentos')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'documentos' ? 'bg-[#d4a373] text-white' : 'bg-white/15 text-white hover:bg-white/25'
            }`}
          >
            <FileText className="w-4 h-4 text-[#d4a373]" />
            Documentos
          </button>

          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-white/80 hover:text-white rounded-lg hover:bg-white/10 cursor-pointer"
            title="Abrir Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Touch Bar for Mobile & Tablet (Bottom Action Navigation Bar) */}
      <div className={`lg:hidden fixed bottom-0 left-0 right-0 z-40 ${touchBarBg} text-white flex items-center justify-around px-1 py-1.5 shadow-2xl backdrop-blur-md border-t`}>
        <button
          type="button"
          onClick={() => setActiveTab('dashboard')}
          className={`min-h-[48px] flex-1 flex flex-col items-center justify-center text-[10px] font-bold rounded-xl transition cursor-pointer active:scale-95 ${
            activeTab === 'dashboard' ? 'bg-white/20 text-white' : 'text-white/70 hover:text-white'
          }`}
        >
          <LayoutDashboard className={`w-5 h-5 ${activeTab === 'dashboard' ? brandAccent : ''}`} />
          <span>Painel</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('pacientes')}
          className={`min-h-[48px] flex-1 flex flex-col items-center justify-center text-[10px] font-bold rounded-xl transition cursor-pointer active:scale-95 ${
            activeTab === 'pacientes' ? 'bg-white/20 text-white' : 'text-white/70 hover:text-white'
          }`}
        >
          <Users className={`w-5 h-5 ${activeTab === 'pacientes' ? brandAccent : ''}`} />
          <span>Pacientes</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('agendamento')}
          className={`min-h-[48px] flex-1 flex flex-col items-center justify-center text-[10px] font-bold rounded-xl transition cursor-pointer active:scale-95 ${
            activeTab === 'agendamento' ? 'bg-white/20 text-white' : 'text-white/70 hover:text-white'
          }`}
        >
          <Calendar className={`w-5 h-5 ${activeTab === 'agendamento' ? brandAccent : ''}`} />
          <span>Agenda</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('documentos')}
          className={`min-h-[48px] flex-1 flex flex-col items-center justify-center text-[10px] font-bold rounded-xl transition cursor-pointer active:scale-95 ${
            activeTab === 'documentos' ? 'bg-[#d4a373] text-white shadow-xs' : 'text-white/70 hover:text-white'
          }`}
        >
          <FileText className={`w-5 h-5 ${activeTab === 'documentos' ? 'text-white' : brandAccent}`} />
          <span>Documentos</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('laudos')}
          className={`min-h-[48px] flex-1 flex flex-col items-center justify-center text-[10px] font-bold rounded-xl transition cursor-pointer active:scale-95 ${
            activeTab === 'laudos' ? 'bg-[#d4a373] text-white shadow-xs' : 'text-white/70 hover:text-white'
          }`}
        >
          <FileCheck2 className={`w-5 h-5 ${activeTab === 'laudos' ? 'text-white' : brandAccent}`} />
          <span>Laudos</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('triagem')}
          className={`min-h-[48px] flex-1 flex flex-col items-center justify-center text-[10px] font-bold rounded-xl transition cursor-pointer active:scale-95 ${
            activeTab === 'triagem' ? 'bg-white/20 text-white' : 'text-white/70 hover:text-white'
          }`}
        >
          <Bot className={`w-5 h-5 ${activeTab === 'triagem' ? 'text-[#25d366]' : ''}`} />
          <span>WhatsApp</span>
        </button>

        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className={`min-h-[48px] flex-1 flex flex-col items-center justify-center text-[10px] font-bold rounded-xl transition cursor-pointer active:scale-95 ${
            mobileMenuOpen ? 'bg-white/30 text-white' : 'text-white/70 hover:text-white'
          }`}
        >
          <Menu className="w-5 h-5" />
          <span>Mais</span>
        </button>
      </div>

      {/* Sidebar Desktop & Mobile Overlay */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 ${sidebarBg} flex flex-col justify-between border-r transition-all duration-300
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div>
          {/* Logo Brand Header */}
          <div 
            onClick={() => {
              if (!isEditingBrand) {
                setActiveTab('dashboard');
                setMobileMenuOpen(false);
              }
            }}
            className={`p-3 mx-3 my-3 rounded-2xl border flex items-center justify-between transition shadow-xs group relative ${
              activeTab === 'dashboard' && !isEditingBrand
                ? 'bg-white/20 border-white/40 ring-2 ring-white/30 shadow-md' 
                : 'bg-white/5 border-white/10 hover:bg-white/10'
            }`}
            title="Ir para o Painel Principal"
          >
            {isEditingBrand ? (
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const trimmed = brandTitleInput.trim();
                  if (trimmed) {
                    updateClinicInfo({ name: trimmed, headerTitle: trimmed });
                  }
                  setIsEditingBrand(false);
                }}
                onClick={(e) => e.stopPropagation()}
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
                  className="w-full bg-white/20 text-white font-serif italic text-base px-2 py-1 rounded-xl border border-white/40 focus:outline-none focus:ring-2 focus:ring-white/50"
                  placeholder="Nome do Sistema / Clínica"
                />
                <button
                  type="submit"
                  className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition shrink-0 cursor-pointer shadow-xs"
                  title="Salvar Nome"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setBrandTitleInput(currentBrandDisplay);
                    setIsEditingBrand(false);
                  }}
                  className="p-1.5 bg-white/10 hover:bg-white/20 text-white/80 hover:text-white rounded-lg transition shrink-0 cursor-pointer"
                  title="Cancelar"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </form>
            ) : (
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className={`w-8 h-8 rounded-xl ${brandAccent} bg-white/10 flex items-center justify-center font-bold shadow-xs shrink-0`}>
                    <LayoutDashboard className="w-5 h-5 text-white" />
                  </div>
                  <h1 className="text-white text-2xl font-serif italic tracking-wide truncate">
                    {currentBrandDisplay.toLowerCase() === 'dentispro' ? (
                      <>Dentis<span className={brandAccent}>Pro</span></>
                    ) : (
                      currentBrandDisplay
                    )}
                  </h1>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setBrandTitleInput(currentBrandDisplay);
                      setIsEditingBrand(true);
                    }}
                    className="p-1.5 text-white/50 hover:text-white hover:bg-white/15 rounded-lg transition opacity-80 group-hover:opacity-100 cursor-pointer"
                    title="Editar nome do sistema / clínica"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  {mobileMenuOpen && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setMobileMenuOpen(false);
                      }} 
                      className="lg:hidden text-white/70 hover:text-white p-1 rounded-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Session & Role Card */}
          <div className={`mx-4 my-3 p-3 rounded-2xl ${cardBg} border border-white/10 space-y-2.5 transition-colors duration-200`}>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-white font-bold text-xs shrink-0">
                  {currentUser ? currentUser.name.substring(0, 2).toUpperCase() : 'US'}
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-white truncate">{currentUser?.name || 'Sessão Ativa'}</p>
                  <p className={`text-[10px] font-semibold truncate ${brandAccent}`}>
                    {userPermissions.label}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowSessionModal(true)}
                className="px-2 py-1 bg-white/15 hover:bg-white/25 text-white text-[10.5px] font-bold rounded-lg transition shrink-0 cursor-pointer flex items-center gap-1 border border-white/20"
                title="Trocar Perfil / Iniciar Sessão"
              >
                <KeyRound className="w-3 h-3 text-[#d4a373]" />
                <span>Sessão</span>
              </button>
            </div>

            <div className="grid grid-cols-1 gap-1.5 pt-1 border-t border-white/10">
              {professionals.length > 0 && (
                <div>
                  <span className="text-[9px] text-white/70 block mb-0.5">Dentista Operador:</span>
                  <select
                    value={activeProfessionalId}
                    onChange={(e) => setActiveProfessionalId(e.target.value)}
                    className={`w-full ${selectBg} text-white border border-white/20 rounded-xl px-2 py-1 text-[11px] font-medium focus:outline-none focus:border-white cursor-pointer`}
                    title="Trocar Dentista Operador"
                  >
                    {professionals.map(p => (
                      <option key={p.id} value={p.id} className={`${selectBg} text-white`}>
                        {p.name} ({p.cro})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {clinics.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[9px] text-white/70 block">Unidade / Consultório:</span>
                    <button
                      type="button"
                      onClick={() => setShowClinicListModal(true)}
                      className="text-[9px] font-bold text-[#d4a373] hover:text-white transition flex items-center gap-0.5 cursor-pointer underline decoration-dotted"
                      title="Ver e gerenciar todas as clínicas cadastradas"
                    >
                      <Building2 className="w-2.5 h-2.5" />
                      <span>Ver Lista ({clinics.length})</span>
                    </button>
                  </div>
                  <select
                    value={activeClinicId}
                    onChange={(e) => setActiveClinicId(e.target.value)}
                    className={`w-full ${selectBg} text-white border border-white/20 rounded-xl px-2 py-1 text-[11px] font-medium focus:outline-none focus:border-white cursor-pointer`}
                    title="Trocar Unidade Ativa"
                  >
                    <option value="todas" className={`${selectBg} text-white`}>Todas as Unidades ({clinics.length})</option>
                    {clinics.map(c => (
                      <option key={c.id} value={c.id} className={`${selectBg} text-white`}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="px-3 py-1 space-y-1">
            {menuItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`
                    w-full flex items-center justify-between px-3.5 py-3 rounded-2xl font-medium text-xs transition-all duration-150 cursor-pointer
                    ${isActive 
                      ? 'bg-white/20 text-white font-semibold shadow-xs' 
                      : 'text-white/80 hover:text-white hover:bg-white/10'}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? iconActive : 'opacity-80'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className={`
                      px-2 py-0.5 text-[10px] font-bold rounded-full
                      ${isActive ? badgeActive : 'bg-white/20 text-white'}
                    `}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer info & Support Card */}
        <div className="p-4 border-t border-white/10 space-y-3">
          {/* Quick Partner & Session Button */}
          <button
            type="button"
            onClick={() => setShowSessionModal(true)}
            className="w-full bg-amber-400/20 hover:bg-amber-400/30 text-amber-200 border border-amber-400/30 p-2.5 rounded-2xl text-xs font-bold transition flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-300" />
              <span>Acesso & Link de Parceiros</span>
            </div>
            <KeyRound className="w-3.5 h-3.5 text-amber-300" />
          </button>

          <div className={`${supportCardBg} p-4 rounded-2xl border border-white/10 text-xs space-y-2 transition-colors duration-200`}>
            <div className="flex items-center justify-between">
              <p className="text-[11px] text-white/80 uppercase font-bold tracking-wider flex items-center gap-1.5">
                <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                Suporte WhatsApp
              </p>
              <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" title="Atendimento Online" />
            </div>

            <p className="text-white font-mono font-bold text-xs">
              +55 (85) 98111-0826
            </p>

            <button 
              type="button"
              onClick={() => {
                window.open('https://wa.me/5585981110826?text=Ol%C3%A1%2C%20preciso%20de%20suporte%20no%20DentisPro', '_blank');
              }}
              className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white py-2.5 rounded-xl text-xs font-bold shadow-sm transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <MessageCircle className="w-4 h-4 fill-white text-[#25D366]" />
              Falar no WhatsApp
            </button>
          </div>
          <p className="text-[10px] text-center text-white/50">DentisPro • Suporte Técnico</p>
        </div>
      </aside>

      {/* User Session & Login Modal */}
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

      {/* Backdrop for mobile menu */}
      {mobileMenuOpen && (
        <div 
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-[#2c2c2c]/50 backdrop-blur-xs z-40 lg:hidden"
        />
      )}
    </>
  );
};
