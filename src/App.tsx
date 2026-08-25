import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/common/Sidebar';
import { DashboardView } from './components/dashboard/DashboardView';
import { PatientList } from './components/patients/PatientList';
import { AppointmentCalendar } from './components/appointments/AppointmentCalendar';
import { ClinicalExamView } from './components/patients/ClinicalExamView';
import { InventoryManager } from './components/inventory/InventoryManager';
import { FinancialReports } from './components/finance/FinancialReports';
import { SettingsView } from './components/settings/SettingsView';
import { ReportsView } from './components/reports/ReportsView';
import { WhatsAppBotView } from './components/whatsapp/WhatsAppBotView';
import { DentalDocumentManager } from './components/documents/DentalDocumentManager';
import { UserSessionModal } from './components/common/UserSessionModal';
import { Lock, ShieldAlert, KeyRound } from 'lucide-react';

const MainContent: React.FC = () => {
  const { activeTab, layoutTheme } = useApp();
  const { userPermissions, checkTabPermission } = useAuth();
  const [showModalFromAccessBlock, setShowModalFromAccessBlock] = useState(false);

  let themeBg = "bg-[#f5f5f0] text-[#2c2c2c]";
  if (layoutTheme === 'dental-clean') {
    themeBg = "bg-[#f0f9ff] text-slate-900";
  } else if (layoutTheme === 'dark-executive') {
    themeBg = "bg-[#09090b] text-zinc-100";
  } else if (layoutTheme === 'soft-pink') {
    themeBg = "bg-[#fff1f2] text-[#4c0519]";
  }

  const isAllowed = checkTabPermission(activeTab);

  if (!isAllowed) {
    return (
      <div className={`flex-1 min-w-0 ${themeBg} p-6 lg:p-12 overflow-y-auto flex items-center justify-center`}>
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-[#e5e5d1] shadow-xl text-center space-y-4">
          <div className="w-16 h-16 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-center mx-auto text-rose-600 shadow-2xs">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-lg font-bold text-[#2c2c2c]">Acesso Restrito ao Módulo</h2>
            <p className="text-xs text-stone-600 leading-relaxed">
              O seu perfil atual (<strong>{userPermissions.label}</strong>) não possui permissão para acessar o módulo de <strong>{activeTab.toUpperCase()}</strong>.
            </p>
          </div>

          <div className="p-3.5 bg-[#fbfbf9] rounded-2xl border border-[#e5e5d1] text-xs text-stone-500 font-medium">
            Para acessar ou alterar parâmetros restritos do sistema, inicie uma sessão com uma conta de <strong>Administrador</strong>.
          </div>

          <button
            type="button"
            onClick={() => setShowModalFromAccessBlock(true)}
            className="w-full py-3 bg-[#5a5a40] hover:bg-[#4a4a35] text-white font-bold text-xs rounded-xl transition cursor-pointer shadow-2xs flex items-center justify-center gap-2"
          >
            <KeyRound className="w-4 h-4 text-[#d4a373]" />
            <span>Trocar Usuário ou Fazer Login</span>
          </button>

          <UserSessionModal 
            isOpen={showModalFromAccessBlock} 
            onClose={() => setShowModalFromAccessBlock(false)} 
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`flex-1 min-w-0 ${themeBg} p-4 sm:p-6 lg:p-8 overflow-y-auto transition-colors duration-300`}>
      {activeTab === 'dashboard' && <DashboardView />}
      {activeTab === 'pacientes' && <PatientList />}
      {activeTab === 'agendamento' && <AppointmentCalendar />}
      {activeTab === 'triagem' && <WhatsAppBotView />}
      {activeTab === 'relatorios' && <ReportsView />}
      {activeTab === 'configuracoes' && <SettingsView />}
      {activeTab === 'exame_clinico' && <ClinicalExamView />}
      {activeTab === 'odontograma' && <ClinicalExamView />}
      {activeTab === 'estoque' && <InventoryManager />}
      {activeTab === 'financeiro' && <ReportsView />}
      {activeTab === 'documentos' && <DentalDocumentManager />}
    </div>
  );
};

const AppShell: React.FC = () => {
  const { layoutTheme } = useApp();

  let shellBg = "bg-[#f5f5f0] selection:bg-[#d4a373] selection:text-white";
  if (layoutTheme === 'dental-clean') {
    shellBg = "bg-[#f0f9ff] selection:bg-[#0284c7] selection:text-white";
  } else if (layoutTheme === 'dark-executive') {
    shellBg = "bg-[#09090b] selection:bg-[#f59e0b] selection:text-black";
  } else if (layoutTheme === 'soft-pink') {
    shellBg = "bg-[#fff1f2] selection:bg-[#f43f5e] selection:text-white";
  }

  return (
    <div className={`min-h-screen ${shellBg} flex flex-col lg:flex-row font-sans transition-colors duration-300`} data-theme={layoutTheme}>
      <Sidebar />
      <MainContent />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppShell />
      </AppProvider>
    </AuthProvider>
  );
}
