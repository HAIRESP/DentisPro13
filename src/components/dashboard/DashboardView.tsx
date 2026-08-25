import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { getThemeStyles } from '../../utils/themeUtils';
import { 
  Users, 
  Calendar, 
  TrendingUp, 
  MessageSquare, 
  Clock, 
  AlertTriangle, 
  Smile, 
  ArrowRight,
  FileText,
  DollarSign,
  Stethoscope,
  Bot,
  Package,
  Settings,
  Database,
  CheckCircle2,
  Download,
  Sparkles
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const { 
    patients, 
    appointments, 
    inventory, 
    financials, 
    setActiveTab, 
    openPatientProfile, 
    openWhatsAppForAppointment,
    clinicInfo,
    createDatabaseCheckpoint,
    exportDatabaseBackupJSON,
    lastCheckpointTime,
    layoutTheme
  } = useApp();

  const t = getThemeStyles(layoutTheme);

  const [checkpointStatus, setCheckpointStatus] = useState<string | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter(a => a.date === todayStr);
  const lowStockItems = inventory.filter(i => i.quantity <= i.minQuantity).sort((a, b) => (a.name || '').localeCompare(b.name || '', 'pt-BR'));

  const totalReceita = financials.filter(f => f.type === 'receita' && f.status === 'pago').reduce((a, c) => a + c.amount, 0);

  const handleQuickCheckpoint = () => {
    const result = createDatabaseCheckpoint();
    setCheckpointStatus(`✅ Checkpoint salvo às ${result.timestamp}! (${result.summary})`);
    setTimeout(() => setCheckpointStatus(null), 5000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome Banner Header */}
      <div className={`${t.bannerBg} rounded-[32px] p-6 shadow-md border ${t.bannerBorder} relative overflow-hidden transition-colors duration-300`}>
        <div className="relative z-10 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/10 border border-white/10 flex items-center gap-1.5">
                <Sparkles className={`w-3 h-3 ${t.bannerAccentText}`} />
                Gestão Odontológica DentisPro
              </span>
              <span className={`text-xs ${t.bannerSubtext}`}>
                {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>

            {/* Checkpoint & Data Backup Controls */}
            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              <button
                type="button"
                onClick={handleQuickCheckpoint}
                className="px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold text-xs rounded-2xl shadow-sm transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                title="Criar um ponto de restauração/checkpoint do banco de dados agora"
              >
                <Database className="w-4 h-4 text-amber-900" />
                Criar Checkpoint
              </button>

              <button
                type="button"
                onClick={exportDatabaseBackupJSON}
                className="px-3 py-2 bg-white/15 hover:bg-white/25 text-white font-bold text-xs rounded-2xl border border-white/20 transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                title="Baixar arquivo JSON com backup completo de dados e configurações"
              >
                <Download className={`w-4 h-4 ${t.bannerAccentText}`} />
                Baixar Backup
              </button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-wide">
                Bem-vindo(a), <span className={t.bannerAccentText}>{clinicInfo.dentistName}</span>
              </h1>
              <p className={`text-xs sm:text-sm ${t.bannerSubtext} max-w-2xl leading-relaxed mt-1`}>
                Selecione uma das seções principais abaixo para gerenciar perfis de pacientes, agenda de consultas, relatórios ou automações do seu consultório.
              </p>
            </div>

            {lastCheckpointTime && (
              <div className="bg-white/10 border border-white/15 rounded-2xl px-3.5 py-2 text-right shrink-0">
                <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider block">Último Checkpoint Salvo:</span>
                <span className="text-xs font-mono font-bold text-white">{lastCheckpointTime}</span>
              </div>
            )}
          </div>

          {/* Alert Checkpoint Message */}
          {checkpointStatus && (
            <div className="bg-emerald-900/60 border border-emerald-400/40 rounded-2xl px-4 py-2.5 text-xs text-emerald-100 flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
              <span className="font-semibold">{checkpointStatus}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Section Navigation Hub - Interactive Buttons for Profile, Agenda, Report and More */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className={`text-lg font-bold ${t.headingText} flex items-center gap-2`}>
            <Sparkles className={`w-5 h-5 ${t.accentText}`} />
            Seções do Sistema (Clique para Abrir)
          </h2>
          <span className="text-xs text-gray-500 font-medium">
            Selecione qualquer opção abaixo
          </span>
        </div>

        {/* Featured Big Section Buttons: Profile, Agenda, Or Report */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* PROFILE / PACIENTES */}
          <button
            type="button"
            onClick={() => setActiveTab('pacientes')}
            className="group relative bg-gradient-to-br from-white to-[#fbfbf7] border-2 border-[#d4a373]/30 hover:border-[#d4a373] p-6 rounded-[32px] shadow-sm hover:shadow-md transition-all duration-200 text-left cursor-pointer flex flex-col justify-between overflow-hidden"
          >
            <div className="space-y-3 relative z-10">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-[#d4a373]/15 text-[#8c5a2b] flex items-center justify-center font-bold group-hover:scale-110 transition">
                  <Users className="w-6 h-6 text-[#8c5a2b]" />
                </div>
                <span className="bg-[#d4a373]/20 text-[#8c5a2b] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Seção Principal
                </span>
              </div>

              <div>
                <h3 className="text-xl font-serif italic font-bold text-[#2c2c2c] group-hover:text-[#8c5a2b] transition">
                  Pacientes
                </h3>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                  Prontuário completo, fichas de anamnese, histórico clínico, fotos e dados cadastrais.
                </p>
              </div>
            </div>

            <div className="pt-4 mt-2 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-[#8c5a2b]">
              <span>{patients.length} Pacientes Cadastrados</span>
              <span className="flex items-center gap-1 group-hover:translate-x-1 transition">
                Acessar Perfil <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </button>

          {/* AGENDA */}
          <button
            type="button"
            onClick={() => setActiveTab('agendamento')}
            className="group relative bg-gradient-to-br from-white to-[#f0f9ff] border-2 border-sky-200 hover:border-sky-500 p-6 rounded-[32px] shadow-sm hover:shadow-md transition-all duration-200 text-left cursor-pointer flex flex-col justify-between overflow-hidden"
          >
            <div className="space-y-3 relative z-10">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold group-hover:scale-110 transition">
                  <Calendar className="w-6 h-6 text-sky-700" />
                </div>
                <span className="bg-sky-100 text-sky-800 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Seção Principal
                </span>
              </div>

              <div>
                <h3 className="text-xl font-serif italic font-bold text-[#2c2c2c] group-hover:text-sky-700 transition">
                  Agenda
                </h3>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                  Agendamento de consultas, calendário semanal/mensal e confirmações automáticas por WhatsApp.
                </p>
              </div>
            </div>

            <div className="pt-4 mt-2 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-sky-800">
              <span>{todayAppointments.length} Consultas Hoje</span>
              <span className="flex items-center gap-1 group-hover:translate-x-1 transition">
                Abrir Agenda <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </button>

          {/* OR REPORT / RELATÓRIOS */}
          <button
            type="button"
            onClick={() => setActiveTab('relatorios')}
            className="group relative bg-gradient-to-br from-white to-[#f0fdf4] border-2 border-emerald-200 hover:border-emerald-500 p-6 rounded-[32px] shadow-sm hover:shadow-md transition-all duration-200 text-left cursor-pointer flex flex-col justify-between overflow-hidden"
          >
            <div className="space-y-3 relative z-10">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold group-hover:scale-110 transition">
                  <TrendingUp className="w-6 h-6 text-emerald-700" />
                </div>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Seção Principal
                </span>
              </div>

              <div>
                <h3 className="text-xl font-serif italic font-bold text-[#2c2c2c] group-hover:text-emerald-700 transition">
                  Relatórios
                </h3>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                  Relatórios financeiros, métricas de crescimento, faturamento mensal e indicadores de desempenho.
                </p>
              </div>
            </div>

            <div className="pt-4 mt-2 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-emerald-800">
              <span>Relatórios Gerenciais Ativos</span>
              <span className="flex items-center gap-1 group-hover:translate-x-1 transition">
                Ver Relatórios <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </button>

        </div>

        {/* Secondary Section Buttons Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
          
          <button
            type="button"
            onClick={() => setActiveTab('documentos')}
            className="bg-white border border-gray-200 hover:border-[#4a4a35] p-4 rounded-2xl shadow-xs hover:shadow-sm transition cursor-pointer text-left group space-y-2"
          >
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center group-hover:scale-105 transition">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-800 group-hover:text-[#4a4a35] transition">Documentos</h4>
              <p className="text-[10px] text-gray-500">Contratos & Termos</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('triagem')}
            className="bg-white border border-gray-200 hover:border-[#25d366] p-4 rounded-2xl shadow-xs hover:shadow-sm transition cursor-pointer text-left group space-y-2"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-[#25d366] flex items-center justify-center group-hover:scale-105 transition">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-800 group-hover:text-[#25d366] transition">WhatsApp</h4>
              <p className="text-[10px] text-gray-500">Triagem 24h & Webhook</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('exame_clinico')}
            className="bg-white border border-gray-200 hover:border-amber-500 p-4 rounded-2xl shadow-xs hover:shadow-sm transition cursor-pointer text-left group space-y-2"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center group-hover:scale-105 transition">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-800 group-hover:text-amber-700 transition">Odontograma</h4>
              <p className="text-[10px] text-gray-500">Exames & Dentes</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('estoque')}
            className="bg-white border border-gray-200 hover:border-amber-500 p-4 rounded-2xl shadow-xs hover:shadow-sm transition cursor-pointer text-left group space-y-2"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center group-hover:scale-105 transition">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-800 group-hover:text-amber-800 transition">Estoque</h4>
              <p className="text-[10px] text-gray-500">{lowStockItems.length} Alertas de Baixa</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('financeiro')}
            className="bg-white border border-gray-200 hover:border-emerald-500 p-4 rounded-2xl shadow-xs hover:shadow-sm transition cursor-pointer text-left group space-y-2"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center group-hover:scale-105 transition">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-800 group-hover:text-emerald-800 transition">Financeiro</h4>
              <p className="text-[10px] text-gray-500">Caixa & TUSS Guias</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('configuracoes')}
            className="bg-white border border-gray-200 hover:border-slate-700 p-4 rounded-2xl shadow-xs hover:shadow-sm transition cursor-pointer text-left group space-y-2"
          >
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center group-hover:scale-105 transition">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-800 group-hover:text-slate-700 transition">Configurações</h4>
              <p className="text-[10px] text-gray-500">Backup & Unidades</p>
            </div>
          </button>

        </div>
      </div>

      {/* KPI Overview Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pacientes Card */}
        <div 
          onClick={() => setActiveTab('pacientes')}
          className="bg-white border border-[#e5e5d1] hover:border-[#5a5a40] p-6 rounded-[28px] shadow-xs transition cursor-pointer group space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500">Total pacientes</span>
            <div className="w-9 h-9 rounded-2xl bg-[#f0f0e8] text-[#5a5a40] flex items-center justify-center group-hover:scale-105 transition">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-serif text-[#5a5a40]">{patients.length} cadastrados</p>
          <p className="text-[11px] text-[#5a5a40] font-medium flex items-center gap-1 pt-1">
            Ver cadastro e prontuário <ArrowRight className="w-3 h-3 text-[#d4a373]" />
          </p>
        </div>

        {/* Consultas Hoje Card */}
        <div 
          onClick={() => setActiveTab('agendamento')}
          className="bg-white border border-[#e5e5d1] hover:border-[#5a5a40] p-6 rounded-[28px] shadow-xs transition cursor-pointer group space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500">Consultas de hoje</span>
            <div className="w-9 h-9 rounded-2xl bg-[#d4a373]/20 text-[#8c5a2b] flex items-center justify-center group-hover:scale-105 transition">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-serif text-[#5a5a40]">{todayAppointments.length} agendadas</p>
          <p className="text-[11px] text-[#8c5a2b] font-medium flex items-center gap-1 pt-1">
            Abrir agenda e WhatsApp <ArrowRight className="w-3 h-3 text-[#d4a373]" />
          </p>
        </div>

        {/* Estoque Alertas Card */}
        <div 
          onClick={() => setActiveTab('estoque')}
          className={`bg-white border p-6 rounded-[28px] shadow-xs transition cursor-pointer group space-y-2 ${lowStockItems.length > 0 ? 'border-amber-300 bg-amber-50/30' : 'border-[#e5e5d1] hover:border-[#5a5a40]'}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500">Estoque mínimo</span>
            <div className="w-9 h-9 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center group-hover:scale-105 transition">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <p className={`text-2xl font-serif ${lowStockItems.length > 0 ? 'text-amber-800' : 'text-[#5a5a40]'}`}>
            {lowStockItems.length} insumos baixos
          </p>
          <p className="text-[11px] text-amber-700 font-medium flex items-center gap-1 pt-1">
            Gerenciar insumos <ArrowRight className="w-3 h-3 text-amber-600" />
          </p>
        </div>

        {/* Financeiro Card */}
        <div 
          onClick={() => setActiveTab('financeiro')}
          className="bg-white border border-[#e5e5d1] hover:border-[#5a5a40] p-6 rounded-[28px] shadow-xs transition cursor-pointer group space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500">Faturamento do mês</span>
            <div className="w-9 h-9 rounded-2xl bg-[#5a5a40]/10 text-[#5a5a40] flex items-center justify-center group-hover:scale-105 transition">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-serif text-[#5a5a40]">
            R$ {totalReceita.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-[#5a5a40] font-medium flex items-center gap-1 pt-1">
            Ver relatórios automáticos <ArrowRight className="w-3 h-3 text-[#d4a373]" />
          </p>
        </div>
      </div>

      {/* Main Column 1: Today's Appointments Timeline & Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Today's Schedule */}
        <div className="lg:col-span-8 bg-white border border-[#e5e5d1] rounded-[32px] p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-[#e5e5d1] pb-4">
            <h2 className="text-xl font-serif italic text-[#5a5a40] flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#d4a373]" />
              Consultas de Hoje ({todayAppointments.length})
            </h2>
            <button
              type="button"
              onClick={() => setActiveTab('agendamento')}
              className="text-xs text-[#5a5a40] hover:text-[#4a4a35] font-semibold flex items-center gap-1"
            >
              Ver Agenda Completa →
            </button>
          </div>

          <div className="space-y-3">
            {todayAppointments.length === 0 ? (
              <p className="text-xs text-gray-400 py-8 text-center">Nenhuma consulta agendada para o dia de hoje.</p>
            ) : (
              todayAppointments.map(apt => (
                <div key={apt.id} className="bg-[#fbfbf9] p-4 rounded-2xl border border-[#f0f0e8] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-start gap-4">
                    <div className="w-14 text-center font-serif text-[#5a5a40] shrink-0">
                      <p className="text-sm font-bold">{apt.time}</p>
                    </div>
                    <div className="h-8 w-[2px] bg-[#d4a373] hidden sm:block"></div>
                    <div>
                      <h4 
                        onClick={() => openPatientProfile(apt.patientId)}
                        className="font-medium text-[#2c2c2c] hover:text-[#5a5a40] cursor-pointer text-sm"
                      >
                        {apt.patientName}
                      </h4>
                      <p className="text-xs text-gray-500">{apt.procedure} • {apt.durationMinutes} min</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <span className="px-3 py-1 rounded-lg text-[10px] font-bold bg-[#f0f0e8] text-[#5a5a40] border border-[#e5e5d1]">
                      {apt.status.toUpperCase()}
                    </span>
                    <button
                      type="button"
                      onClick={() => openWhatsAppForAppointment(apt)}
                      className="px-3 py-1.5 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-[10px] rounded-lg flex items-center gap-1.5 shadow-2xs transition"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      WHATSAPP
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Low Inventory Warning Box & Quick Patient List */}
        <div className="lg:col-span-4 space-y-6">
          {/* Low Stock Banner */}
          <div className="bg-white border border-[#e5e5d1] rounded-[32px] p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#e5e5d1] pb-3">
              <h3 className="text-xs font-bold text-gray-500 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Alertas de estoque
              </h3>
              <button type="button" onClick={() => setActiveTab('estoque')} className="text-[11px] text-[#5a5a40] hover:underline">
                Estoque →
              </button>
            </div>

            <div className="space-y-2.5">
              {lowStockItems.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-2">Todos os insumos estão em nível ideal.</p>
              ) : (
                lowStockItems.slice(0, 4).map(item => (
                  <div key={item.id} className="bg-amber-50/60 p-3 rounded-2xl border border-amber-200/60 text-xs flex items-center justify-between">
                    <div>
                      <p className="font-bold text-gray-800 truncate max-w-[150px]">{item.name}</p>
                      <p className="text-[10px] text-amber-700 font-semibold">{item.category}</p>
                    </div>
                    <span className="font-mono font-bold text-amber-800 text-xs">
                      {item.quantity} {item.unit}s
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Patient Quick Access */}
          <div className="bg-white border border-[#e5e5d1] rounded-[32px] p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#e5e5d1] pb-3">
              <h3 className="text-xs font-bold text-gray-500">Pacientes recentes</h3>
              <button type="button" onClick={() => setActiveTab('pacientes')} className="text-[11px] text-[#5a5a40] hover:underline">
                Ver todos →
              </button>
            </div>

            <div className="space-y-2">
              {patients.slice(0, 4).map(p => (
                <div 
                  key={p.id} 
                  onClick={() => openPatientProfile(p.id)}
                  className="bg-[#fbfbf9] p-3 rounded-2xl border border-[#f0f0e8] hover:border-[#d4a373] transition cursor-pointer flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-8 h-8 rounded-full bg-[#d4a373] text-white font-bold flex items-center justify-center shrink-0">
                      {p.name.charAt(0)}
                    </div>
                    <span className="font-medium text-[#2c2c2c] truncate">{p.name}</span>
                  </div>
                  <Smile className="w-4 h-4 text-gray-400" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
