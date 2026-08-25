import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FinancialReports } from '../finance/FinancialReports';
import { InventoryManager } from '../inventory/InventoryManager';
import { getThemeStyles } from '../../utils/themeUtils';
import { 
  BarChart3, 
  TrendingUp, 
  Package, 
  Users, 
  FileText, 
  Calendar, 
  DollarSign,
  PieChart,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { patients, appointments, inventory, prescriptions, treatmentPlans, financials, layoutTheme } = useApp();
  const t = getThemeStyles(layoutTheme);
  const [activeReportTab, setActiveReportTab] = useState<'financeiro' | 'estoque' | 'atendimentos'>('financeiro');

  // Stats
  const totalPatients = patients.length;
  const totalAppointments = appointments.length;
  const completedApts = appointments.filter(a => a.status === 'concluido').length;
  const lowStockCount = inventory.filter(i => i.quantity <= i.minQuantity).length;
  const totalPrescriptions = prescriptions.length;
  const totalPlans = treatmentPlans.length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${t.headingText} flex items-center gap-2 tracking-tight`}>
            <BarChart3 className={`w-7 h-7 ${t.accentText}`} />
            Relatório e Indicador da Clínica
          </h1>
          <p className="text-xs text-gray-500">Acompanhe métricas financeiras, controle de estoque e desempenho dos atendimentos.</p>
        </div>

        {/* Sub-tabs selector for reports */}
        <div className={`${t.btnSecondaryBg} p-1 rounded-2xl border ${t.cardBorder} flex items-center gap-1 text-xs self-start sm:self-auto`}>
          <button
            onClick={() => setActiveReportTab('financeiro')}
            className={`px-4 py-2 rounded-xl font-medium transition flex items-center gap-1.5 cursor-pointer ${
              activeReportTab === 'financeiro' 
                ? `${t.btnPrimaryBg} ${t.btnPrimaryText} font-bold shadow-xs` 
                : `${t.btnSecondaryText} opacity-70 hover:opacity-100`
            }`}
          >
            <TrendingUp className={`w-4 h-4 ${activeReportTab === 'financeiro' ? t.btnPrimaryText : t.accentText}`} />
            Relatório Financeiro
          </button>
          <button
            onClick={() => setActiveReportTab('estoque')}
            className={`px-4 py-2 rounded-xl font-medium transition flex items-center gap-1.5 cursor-pointer ${
              activeReportTab === 'estoque' 
                ? `${t.btnPrimaryBg} ${t.btnPrimaryText} font-bold shadow-xs` 
                : `${t.btnSecondaryText} opacity-70 hover:opacity-100`
            }`}
          >
            <Package className={`w-4 h-4 ${activeReportTab === 'estoque' ? t.btnPrimaryText : t.accentText}`} />
            Relatório de Estoque ({lowStockCount > 0 ? `${lowStockCount} Alertas` : 'OK'})
          </button>
          <button
            onClick={() => setActiveReportTab('atendimentos')}
            className={`px-4 py-2 rounded-xl font-medium transition flex items-center gap-1.5 cursor-pointer ${
              activeReportTab === 'atendimentos' 
                ? `${t.btnPrimaryBg} ${t.btnPrimaryText} font-bold shadow-xs` 
                : `${t.btnSecondaryText} opacity-70 hover:opacity-100`
            }`}
          >
            <Users className={`w-4 h-4 ${activeReportTab === 'atendimentos' ? t.btnPrimaryText : t.accentText}`} />
            Métricas de Atendimento
          </button>
        </div>
      </div>

      {/* Summary Stat Cards Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className={`${t.cardBg} border ${t.cardBorder} rounded-2xl p-4 shadow-2xs space-y-1`}>
          <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Total de Pacientes</span>
          <p className={`text-2xl font-bold ${t.headingText}`}>{totalPatients}</p>
          <p className="text-[10px] text-emerald-600 font-medium">Cadastrados no sistema</p>
        </div>

        <div className={`${t.cardBg} border ${t.cardBorder} rounded-2xl p-4 shadow-2xs space-y-1`}>
          <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Consultas Realizadas</span>
          <p className={`text-2xl font-bold ${t.headingText}`}>{completedApts} <span className="text-xs font-sans text-gray-400">/ {totalAppointments}</span></p>
          <p className="text-[10px] text-gray-500 font-medium">Agendamentos totais</p>
        </div>

        <div className={`${t.cardBg} border ${t.cardBorder} rounded-2xl p-4 shadow-2xs space-y-1`}>
          <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Planos de Tratamento</span>
          <p className={`text-2xl font-bold ${t.headingText}`}>{totalPlans}</p>
          <p className="text-[10px] text-gray-500 font-medium">Planos registrados</p>
        </div>

        <div className={`${t.cardBg} border ${t.cardBorder} rounded-2xl p-4 shadow-2xs space-y-1`}>
          <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Receitas Emitidas</span>
          <p className={`text-2xl font-bold ${t.headingText}`}>{totalPrescriptions}</p>
          <p className="text-[10px] text-gray-500 font-medium">Prescrições emitidas</p>
        </div>
      </div>

      {/* Tab Content Display */}
      {activeReportTab === 'financeiro' && <FinancialReports />}
      {activeReportTab === 'estoque' && <InventoryManager />}
      {activeReportTab === 'atendimentos' && (
        <div className="bg-white border border-[#e5e5d1] rounded-[32px] p-6 shadow-sm space-y-6">
          <h3 className="text-sm font-bold text-[#5a5a40] flex items-center gap-2 uppercase tracking-wider">
            <Users className="w-4 h-4 text-[#d4a373]" /> Resumo de Atendimento e Consulta
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#fbfbf9] p-5 rounded-2xl border border-[#e5e5d1] space-y-3">
              <h4 className="text-xs font-bold text-[#5a5a40]">Status dos Agendamentos</h4>
              <div className="space-y-2 text-xs">
                {['agendado', 'confirmado', 'em_atendimento', 'concluido', 'cancelado'].map(st => {
                  const count = appointments.filter(a => a.status === st).length;
                  return (
                    <div key={st} className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-[#e5e5d1]">
                      <span className="capitalize font-medium text-gray-700">{st.replace('_', ' ')}</span>
                      <span className="font-mono font-bold text-[#5a5a40]">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-[#fbfbf9] p-5 rounded-2xl border border-[#e5e5d1] space-y-3">
              <h4 className="text-xs font-bold text-[#5a5a40]">Últimas Consultas Registradas</h4>
              <div className="space-y-2 text-xs">
                {appointments.slice(0, 5).map(apt => (
                  <div key={apt.id} className="bg-white p-3 rounded-xl border border-[#e5e5d1] flex justify-between items-center">
                    <div>
                      <p className="font-bold text-[#2c2c2c]">{apt.patientName}</p>
                      <p className="text-[11px] text-gray-500">{apt.procedure} • {apt.date} às {apt.time}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#f0f0e8] text-[#5a5a40]">
                      {apt.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
