import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Appointment, AppointmentStatus } from '../../types';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Clock, 
  User, 
  MessageSquare, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Filter,
  Search,
  ExternalLink,
  DollarSign,
  Building2,
  UserCheck,
  PackageCheck,
  FileSpreadsheet,
  BellRing,
  ShieldAlert,
  RotateCcw,
  CalendarCheck,
  Sparkles
} from 'lucide-react';
import { WhatsAppModal } from './WhatsAppModal';
import { AppointmentMaterialsReportModal } from '../inventory/AppointmentMaterialsReportModal';
import { DailyClinicMaterialsReportModal } from '../inventory/DailyClinicMaterialsReportModal';

import { getThemeStyles } from '../../utils/themeUtils';

export const AppointmentCalendar: React.FC = () => {
  const { 
    appointments, 
    patients, 
    clinics,
    professionals,
    inventory,
    tussProcedures,
    clinicalEvolutions,
    adjustStockQuantity,
    activeClinicId,
    setActiveClinicId,
    addAppointment, 
    updateAppointmentStatus, 
    openWhatsAppForAppointment,
    whatsAppModalAppointment,
    setWhatsAppModalAppointment,
    clinicInfo,
    openPatientProfile,
    layoutTheme
  } = useApp();

  const t = getThemeStyles(layoutTheme);

  const [viewMode, setViewMode] = useState<'hoje' | 'todos' | 'retornos'>('hoje');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('todos');
  const [selectedClinicFilter, setSelectedClinicFilter] = useState<string>(activeClinicId || 'todas');
  const [selectedDentistFilter, setSelectedDentistFilter] = useState<string>('todos');
  const [isNewAppointmentModalOpen, setIsNewAppointmentModalOpen] = useState(false);

  // Material Report Modal states
  const [selectedAptForReport, setSelectedAptForReport] = useState<Appointment | null>(null);
  const [isDailyReportOpen, setIsDailyReportOpen] = useState(false);

  // Calculate Patient Recall Alerts & TUSS Recurrence Locks
  const recallAlerts = React.useMemo(() => {
    const alerts: Array<{
      id: string;
      patientId: string;
      patientName: string;
      patientPhone: string;
      procedureName: string;
      tussCode?: string;
      toothNumber?: number;
      lastDate: string;
      monthsElapsed: number;
      recurrenceLimitMonths: number;
      dueDate: string;
      isOverdue: boolean;
      isLockedForInsurance: boolean;
    }> = [];

    const now = new Date();

    patients.forEach(pat => {
      const patEvolutions = (clinicalEvolutions[pat.id] || []).filter(e => e.status === 'concluido' || !e.status);
      const patApts = appointments.filter(a => a.patientId === pat.id && a.status === 'concluido');

      // Combine finished procedures
      const history = [
        ...patEvolutions.map(e => ({ date: e.date, procedure: e.procedure, tooth: e.toothNumber })),
        ...patApts.map(a => ({ date: a.date, procedure: a.procedure, tooth: undefined }))
      ];

      // Track procedures with recurrence rules
      history.forEach((item, idx) => {
        const matchedTuss = tussProcedures.find(t => 
          t.description.toLowerCase().includes(item.procedure.toLowerCase()) || 
          item.procedure.toLowerCase().includes(t.description.toLowerCase())
        );

        const limitMonths = matchedTuss?.recurrenceLimitMonths || (
          item.procedure.toLowerCase().includes('limpeza') || 
          item.procedure.toLowerCase().includes('profilaxia') ||
          item.procedure.toLowerCase().includes('raspagem') ? 6 : 0
        );

        if (limitMonths > 0 && item.date) {
          const execDate = new Date(item.date);
          const dueDateObj = new Date(execDate);
          dueDateObj.setMonth(dueDateObj.getMonth() + limitMonths);

          const diffTime = Math.abs(now.getTime() - execDate.getTime());
          const monthsElapsed = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 30.4375));

          const isOverdue = now >= dueDateObj;
          const isLockedForInsurance = now < dueDateObj;

          alerts.push({
            id: `alert-${pat.id}-${idx}`,
            patientId: pat.id,
            patientName: pat.name,
            patientPhone: pat.phone,
            procedureName: item.procedure,
            tussCode: matchedTuss?.code,
            toothNumber: item.tooth,
            lastDate: item.date,
            monthsElapsed,
            recurrenceLimitMonths: limitMonths,
            dueDate: dueDateObj.toISOString().split('T')[0],
            isOverdue,
            isLockedForInsurance
          });
        }
      });
    });

    return alerts.sort((a, b) => b.monthsElapsed - a.monthsElapsed);
  }, [patients, clinicalEvolutions, appointments, tussProcedures]);

  const overdueAlertsCount = recallAlerts.filter(a => a.isOverdue).length;

  // Form for New Appointment
  const todayStr = new Date().toISOString().split('T')[0];
  const [patientId, setPatientId] = useState(patients[0]?.id || '');
  const [clinicId, setClinicId] = useState(clinics[0]?.id || 'cli-1');
  const [dentistName, setDentistName] = useState(professionals[0]?.name || clinicInfo.dentistName);
  const [date, setDate] = useState(todayStr);
  const [time, setTime] = useState('09:00');
  const [duration, setDuration] = useState('45');
  const [procedure, setProcedure] = useState('Restauração em Resina');
  const [value, setValue] = useState('250');
  const [notes, setNotes] = useState('');

  // Auto-fill patient preferred clinic & dentist on patient selection
  useEffect(() => {
    const p = patients.find(pat => pat.id === patientId);
    if (p) {
      if (p.preferredClinicId) setClinicId(p.preferredClinicId);
      if (p.preferredDentistName) setDentistName(p.preferredDentistName);
    }
  }, [patientId, patients]);

  // Format date BR
  const formatDateBR = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  // Filter Appointments
  const filteredAppointments = appointments.filter(apt => {
    const matchesView = 
      viewMode === 'todos' || 
      (viewMode === 'hoje' && apt.date === todayStr);

    const matchesSearch = 
      apt.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.procedure.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = 
      selectedStatusFilter === 'todos' || apt.status === selectedStatusFilter;

    const matchesClinic = 
      selectedClinicFilter === 'todas' || apt.clinicId === selectedClinicFilter;

    const matchesDentist = 
      selectedDentistFilter === 'todos' || apt.dentistName.includes(selectedDentistFilter);

    return matchesView && matchesSearch && matchesStatus && matchesClinic && matchesDentist;
  }).sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.time.localeCompare(b.time);
  });

  const handleCreateAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    const patientObj = patients.find(p => p.id === patientId);
    const clinicObj = clinics.find(c => c.id === clinicId);
    if (!patientObj) return;

    addAppointment({
      patientId: patientObj.id,
      patientName: patientObj.name,
      patientPhone: patientObj.phone,
      dentistName,
      clinicId: clinicObj?.id,
      clinicName: clinicObj?.name || 'Unidade Principal',
      date,
      time,
      durationMinutes: parseInt(duration) || 45,
      procedure,
      status: 'agendado',
      value: parseFloat(value) || 0,
      notes
    });

    setIsNewAppointmentModalOpen(false);
  };

  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case 'agendado':
        return <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-500/20 text-amber-700 border border-amber-500/30">AGENDADO</span>;
      case 'confirmado':
        return <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-500/20 text-emerald-800 border border-emerald-500/30">CONFIRMADO VIA WHATS</span>;
      case 'em_atendimento':
        return <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-500/20 text-blue-800 border border-blue-500/30 animate-pulse">EM ATENDIMENTO</span>;
      case 'concluido':
        return <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-200 text-slate-700 border border-slate-300">CONCLUÍDO</span>;
      case 'cancelado':
        return <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-rose-500/20 text-rose-800 border border-rose-500/30">CANCELADO</span>;
      case 'faltou':
        return <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-purple-500/20 text-purple-800 border border-purple-500/30">FALTOU</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${t.headingText} flex items-center gap-2 tracking-tight`}>
            <CalendarIcon className={`w-7 h-7 ${t.accentText}`} />
            Agendamento Multiclínica e Notificação
          </h1>
          <p className="text-xs opacity-75">Gerencie a agenda dividida por unidades clínicas e cirurgiões-dentistas responsáveis.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsDailyReportOpen(true)}
            className={`px-4 py-2.5 ${t.btnSecondaryBg} ${t.btnSecondaryText} border ${t.cardBorder} hover:opacity-90 font-bold text-xs rounded-2xl flex items-center justify-center gap-2 shadow-xs transition cursor-pointer`}
          >
            <FileSpreadsheet className={`w-4 h-4 ${t.accentText}`} />
            Report Consolidado da Clínica
          </button>

          <button
            onClick={() => setIsNewAppointmentModalOpen(true)}
            className={`px-4 py-2.5 ${t.btnPrimaryBg} ${t.btnPrimaryText} font-bold text-xs rounded-2xl flex items-center justify-center gap-2 shadow-xs transition cursor-pointer`}
          >
            <Plus className="w-4 h-4" />
            Agendar Nova Consulta
          </button>
        </div>
      </div>

      {/* Filter Bar & Tabs */}
      <div className={`${t.cardBg} border ${t.cardBorder} rounded-[32px] p-5 shadow-sm space-y-4`}>
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          {/* View Mode Buttons */}
          <div className={`${t.btnSecondaryBg} p-1 rounded-2xl border ${t.cardBorder} flex items-center text-xs w-full lg:w-auto overflow-x-auto`}>
            <button
              onClick={() => setViewMode('hoje')}
              className={`flex-1 lg:flex-initial px-4 py-2 rounded-xl font-medium transition cursor-pointer whitespace-nowrap ${
                viewMode === 'hoje' 
                  ? `${t.btnPrimaryBg} ${t.btnPrimaryText} shadow-xs` 
                  : `${t.btnSecondaryText} opacity-70 hover:opacity-100`
              }`}
            >
              Consultas de Hoje
            </button>
            <button
              onClick={() => setViewMode('todos')}
              className={`flex-1 lg:flex-initial px-4 py-2 rounded-xl font-medium transition cursor-pointer whitespace-nowrap ${
                viewMode === 'todos' 
                  ? `${t.btnPrimaryBg} ${t.btnPrimaryText} shadow-xs` 
                  : `${t.btnSecondaryText} opacity-70 hover:opacity-100`
              }`}
            >
              Todas as Consultas
            </button>
            <button
              onClick={() => setViewMode('retornos')}
              className={`flex-1 lg:flex-initial px-4 py-2 rounded-xl font-bold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                viewMode === 'retornos' 
                  ? 'bg-amber-500 text-slate-950 shadow-xs' 
                  : 'text-amber-600 hover:bg-amber-100/50'
              }`}
            >
              <BellRing className="w-3.5 h-3.5 shrink-0" />
              <span>Central de Retornos & Recorrência TUSS</span>
              {overdueAlertsCount > 0 && (
                <span className="ml-1 bg-amber-950 text-amber-200 text-[10px] font-mono px-1.5 py-0.5 rounded-full font-bold">
                  {overdueAlertsCount}
                </span>
              )}
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full lg:w-72">
            <Search className={`w-4 h-4 ${t.accentText} opacity-60 absolute left-3 top-2.5`} />
            <input
              type="text"
              placeholder="Buscar por paciente ou procedimento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full ${t.inputBg} border ${t.cardBorder} rounded-2xl pl-9 pr-3.5 py-2 text-xs focus:outline-none`}
            />
          </div>
        </div>

        {/* Multi-Clinic & Professional Filters */}
        <div className={`grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t ${t.cardBorder}`}>
          <div>
            <label className={`block text-[11px] font-bold ${t.headingText} uppercase tracking-wider mb-1 flex items-center gap-1`}>
              <Building2 className={`w-3.5 h-3.5 ${t.accentText}`} /> Unidade / Clínica:
            </label>
            <select
              value={selectedClinicFilter}
              onChange={(e) => {
                setSelectedClinicFilter(e.target.value);
                setActiveClinicId(e.target.value);
              }}
              className={`w-full ${t.inputBg} border ${t.cardBorder} text-xs rounded-xl px-3 py-2 focus:outline-none font-medium cursor-pointer`}
            >
              <option value="todas">Todas as Clínicas ({clinics.length})</option>
              {clinics.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={`block text-[11px] font-bold ${t.headingText} uppercase tracking-wider mb-1 flex items-center gap-1`}>
              <UserCheck className={`w-3.5 h-3.5 ${t.accentText}`} /> Profissional Dentista:
            </label>
            <select
              value={selectedDentistFilter}
              onChange={(e) => setSelectedDentistFilter(e.target.value)}
              className={`w-full ${t.inputBg} border ${t.cardBorder} text-xs rounded-xl px-3 py-2 focus:outline-none font-medium cursor-pointer`}
            >
              <option value="todos">Todos os Dentistas</option>
              {professionals.map(p => (
                <option key={p.id} value={p.name}>{p.name} ({p.specialty})</option>
              ))}
            </select>
          </div>

          <div>
            <label className={`block text-[11px] font-bold ${t.headingText} uppercase tracking-wider mb-1 flex items-center gap-1`}>
              <Filter className={`w-3.5 h-3.5 ${t.accentText}`} /> Status do Agendamento:
            </label>
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className={`w-full ${t.inputBg} border ${t.cardBorder} text-xs rounded-xl px-3 py-2 focus:outline-none font-medium cursor-pointer`}
            >
              <option value="todos">Todos Status</option>
              <option value="agendado">Agendado</option>
              <option value="confirmado">Confirmado</option>
              <option value="em_atendimento">Em Atendimento</option>
              <option value="concluido">Concluído</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Appointments Grid/List or Central de Retornos */}
      {viewMode === 'retornos' ? (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent border border-amber-300/40 p-5 rounded-[28px] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 font-bold shadow-xs">
                <BellRing className="w-5 h-5" />
              </div>
              <div>
                <h3 className={`text-base font-extrabold ${t.headingText} flex items-center gap-2`}>
                  Central de Alertas de Retorno Preventivo & Recorrência TUSS
                  <span className="text-xs bg-amber-200 text-amber-950 font-mono px-2 py-0.5 rounded-full font-bold">
                    {recallAlerts.length} registros
                  </span>
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Monitoramento automático do intervalo mínimo (meses) para faturamento TUSS sem glosas e busca ativa de pacientes para retorno.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-100/80 dark:bg-amber-950/60 border border-amber-300/50 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                {overdueAlertsCount} Pacientes Elegíveis para Retorno
              </span>
            </div>
          </div>

          {recallAlerts.length === 0 ? (
            <div className={`${t.cardBg} border ${t.cardBorder} rounded-[32px] p-12 text-center text-gray-400 space-y-2`}>
              <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500" />
              <p className={`text-sm font-semibold ${t.headingText}`}>Nenhum alerta de retorno registrado no momento.</p>
              <p className="text-xs opacity-60">Os retornos são calculados automaticamente conforme a evolução clínica concluída e regras TUSS dos convênios.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recallAlerts.map(alert => (
                <div 
                  key={alert.id}
                  className={`${t.cardBg} border ${alert.isOverdue ? 'border-amber-400/60 shadow-xs' : t.cardBorder} rounded-[28px] p-5 space-y-3.5 transition`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-mono uppercase font-bold text-gray-400 tracking-wider block mb-0.5">
                        Paciente
                      </span>
                      <h4 
                        onClick={() => openPatientProfile(alert.patientId)}
                        className={`text-sm font-bold ${t.headingText} hover:underline cursor-pointer flex items-center gap-1.5`}
                      >
                        <User className={`w-3.5 h-3.5 ${t.accentText}`} />
                        {alert.patientName}
                      </h4>
                      <span className="text-xs text-gray-500 font-mono">{alert.patientPhone}</span>
                    </div>

                    {alert.isOverdue ? (
                      <span className="bg-amber-100 text-amber-900 border border-amber-300/80 px-2.5 py-1 rounded-full text-[10px] font-extrabold flex items-center gap-1">
                        <RotateCcw className="w-3 h-3 text-amber-700 animate-spin" />
                        Retorno Vencido (Há {alert.monthsElapsed} meses)
                      </span>
                    ) : (
                      <span className="bg-slate-100 text-slate-700 border border-slate-300 px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1">
                        <ShieldAlert className="w-3 h-3 text-slate-500" />
                        Carência TUSS Ativa (Faltam {alert.recurrenceLimitMonths - alert.monthsElapsed} mes(es))
                      </span>
                    )}
                  </div>

                  <div className="bg-[#fcfcf9] dark:bg-slate-900/50 border border-[#e5e5d1] dark:border-slate-800 rounded-2xl p-3 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-700 dark:text-gray-300">Procedimento Executado:</span>
                      <span className="font-mono text-gray-500">{alert.tussCode ? `TUSS: ${alert.tussCode}` : ''}</span>
                    </div>
                    <p className={`font-semibold ${t.headingText}`}>
                      {alert.procedureName} {alert.toothNumber ? `(Dente ${alert.toothNumber})` : ''}
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1 border-t border-gray-200/60 dark:border-slate-800">
                      <span>Último Atendimento: <strong className="font-mono">{alert.lastDate}</strong></span>
                      <span>Periodicidade TUSS: <strong className="font-mono">{alert.recurrenceLimitMonths} meses</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        openWhatsAppForAppointment({
                          id: alert.id,
                          patientId: alert.patientId,
                          patientName: alert.patientName,
                          clinicId: clinics[0]?.id || 'cli-1',
                          dentistName: professionals[0]?.name || clinicInfo.dentistName,
                          date: todayStr,
                          time: '09:00',
                          durationMinutes: 30,
                          procedure: `Retorno Preventivo / Avaliação (${alert.procedureName})`,
                          status: 'agendado',
                          value: 0,
                          notes: `Mensagem de Retorno Preventivo TUSS (${alert.recurrenceLimitMonths} meses da última consulta).`
                        });
                      }}
                      className="px-3 py-1.5 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold text-xs rounded-xl border border-emerald-300 hover:bg-emerald-100 flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                      Chamar WhatsApp
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setPatientId(alert.patientId);
                        setProcedure(`Retorno Preventivo - ${alert.procedureName}`);
                        setIsNewAppointmentModalOpen(true);
                      }}
                      className={`px-3.5 py-1.5 ${t.btnPrimaryBg} ${t.btnPrimaryText} font-bold text-xs rounded-xl shadow-2xs flex items-center gap-1.5 transition cursor-pointer`}
                    >
                      <CalendarCheck className="w-3.5 h-3.5" />
                      Agendar Consulta
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
      /* Appointments Grid/List */
      <div className="space-y-3">
        {filteredAppointments.length === 0 ? (
          <div className={`${t.cardBg} border ${t.cardBorder} rounded-[32px] p-12 text-center text-gray-400 space-y-2`}>
            <Clock className={`w-10 h-10 mx-auto ${t.accentText}`} />
            <p className={`text-sm font-semibold ${t.headingText}`}>Nenhuma consulta agendada para os filtros selecionados.</p>
            <p className="text-xs opacity-60">Tente alterar o filtro de clínica ou cirurgião-dentista.</p>
          </div>
        ) : (
          filteredAppointments.map(apt => (
            <div 
              key={apt.id}
              className={`${t.cardBg} border ${t.cardBorder} rounded-[32px] p-5 shadow-xs transition flex flex-col md:flex-row md:items-center justify-between gap-4`}
            >
              {/* Left Patient & Procedure Details */}
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-2xl ${t.btnSecondaryBg} border ${t.cardBorder} flex flex-col items-center justify-center shrink-0`}>
                  <span className={`text-xs font-mono font-bold ${t.headingText}`}>{apt.time}</span>
                  <span className="text-[10px] opacity-60">{apt.durationMinutes}m</span>
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 
                      onClick={() => openPatientProfile(apt.patientId)}
                      className={`text-base font-bold ${t.cardText} hover:underline cursor-pointer transition`}
                    >
                      {apt.patientName}
                    </h3>
                    {getStatusBadge(apt.status)}

                    {apt.clinicName && (
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${t.btnSecondaryBg} ${t.btnSecondaryText} border ${t.cardBorder} flex items-center gap-1`}>
                        <Building2 className={`w-3 h-3 ${t.accentText}`} />
                        {apt.clinicName}
                      </span>
                    )}
                  </div>

                  <p className={`text-xs ${t.headingText} font-medium`}>{apt.procedure}</p>
                  <p className="text-xs opacity-75 font-mono mt-0.5">
                    Data: <strong className={t.cardText}>{formatDateBR(apt.date)}</strong> • Dentista: <strong className={t.headingText}>{apt.dentistName}</strong> • R$ {apt.value.toFixed(2)}
                  </p>
                  {apt.notes && <p className="text-[11px] opacity-60 italic mt-0.5">"{apt.notes}"</p>}
                </div>
              </div>

              {/* Right Action Workflow Controls */}
              <div className={`flex flex-wrap items-center gap-2 border-t md:border-t-0 ${t.cardBorder} pt-3 md:pt-0`}>
                {/* Status Switcher Dropdown */}
                <select
                  value={apt.status}
                  onChange={(e) => updateAppointmentStatus(apt.id, e.target.value as AppointmentStatus)}
                  className={`${t.inputBg} border ${t.cardBorder} text-xs rounded-xl px-3 py-2 focus:outline-none font-medium cursor-pointer`}
                >
                  <option value="agendado">Status: Agendado</option>
                  <option value="confirmado">Status: Confirmado</option>
                  <option value="em_atendimento">Status: Em Atendimento</option>
                  <option value="concluido">Status: Concluído</option>
                  <option value="faltou">Status: Faltou</option>
                  <option value="cancelado">Status: Cancelado</option>
                </select>

                {/* Materiais do Atendimento Button */}
                <button
                  onClick={() => setSelectedAptForReport(apt)}
                  className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 font-bold text-xs rounded-xl flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
                  title="Ver lista de materiais necessários e dar baixa no estoque"
                >
                  <PackageCheck className="w-4 h-4 text-emerald-700" />
                  Materiais do Atendimento
                </button>

                {/* WhatsApp Action Button */}
                <button
                  onClick={() => openWhatsAppForAppointment(apt)}
                  className={`px-3.5 py-2 ${t.btnSecondaryBg} ${t.btnSecondaryText} border ${t.cardBorder} font-medium text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer`}
                >
                  <MessageSquare className={`w-4 h-4 ${t.accentText}`} />
                  Enviar WhatsApp
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      )}

      {/* WHATSAPP ACTION MODAL */}
      <WhatsAppModal
        appointment={whatsAppModalAppointment}
        onClose={() => setWhatsAppModalAppointment(null)}
      />

      {/* NEW APPOINTMENT MODAL */}
      {isNewAppointmentModalOpen && (
        <div className={`fixed inset-0 z-50 ${t.overlayBg} flex items-center justify-center p-4`}>
          <div className={`${t.modalBg} border ${t.modalBorder} rounded-[32px] max-w-lg w-full p-6 shadow-2xl space-y-4`}>
            <div className={`flex items-center justify-between border-b ${t.modalBorder} pb-3`}>
              <h3 className={`text-lg font-bold ${t.headingText} flex items-center gap-2`}>
                <Plus className={`w-5 h-5 ${t.accentText}`} />
                Agendar Consulta
              </h3>
              <button onClick={() => setIsNewAppointmentModalOpen(false)} className="opacity-60 hover:opacity-100 cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleCreateAppointment} className="space-y-3">
              <div>
                <label className={`block text-xs font-semibold ${t.headingText} mb-1`}>Selecione o Paciente *</label>
                <select
                  required
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  className={`w-full ${t.inputBg} border ${t.cardBorder} rounded-2xl px-3.5 py-2.5 text-xs focus:outline-none`}
                >
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs font-semibold ${t.headingText} mb-1`}>Unidade / Clínica *</label>
                  <select
                    required
                    value={clinicId}
                    onChange={(e) => setClinicId(e.target.value)}
                    className={`w-full ${t.inputBg} border ${t.cardBorder} rounded-2xl px-3.5 py-2.5 text-xs focus:outline-none`}
                  >
                    {clinics.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-xs font-semibold ${t.headingText} mb-1`}>Profissional Dentista *</label>
                  <select
                    required
                    value={dentistName}
                    onChange={(e) => setDentistName(e.target.value)}
                    className={`w-full ${t.inputBg} border ${t.cardBorder} rounded-2xl px-3.5 py-2.5 text-xs focus:outline-none`}
                  >
                    {professionals.map(prof => (
                      <option key={prof.id} value={prof.name}>
                        {prof.name} ({prof.specialty})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs font-semibold ${t.headingText} mb-1`}>Data da Consulta *</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className={`w-full ${t.inputBg} border ${t.cardBorder} rounded-2xl px-3.5 py-2.5 text-xs focus:outline-none`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-semibold ${t.headingText} mb-1`}>Horário *</label>
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className={`w-full ${t.inputBg} border ${t.cardBorder} rounded-2xl px-3.5 py-2.5 text-xs font-mono focus:outline-none`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs font-semibold ${t.headingText} mb-1`}>Procedimento *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Restauração, Extração, Profilaxia..."
                    value={procedure}
                    onChange={(e) => setProcedure(e.target.value)}
                    className={`w-full ${t.inputBg} border ${t.cardBorder} rounded-2xl px-3.5 py-2.5 text-xs focus:outline-none`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-semibold ${t.headingText} mb-1`}>Valor Estimado (R$)</label>
                  <input
                    type="number"
                    placeholder="250.00"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className={`w-full ${t.inputBg} border ${t.cardBorder} rounded-2xl px-3.5 py-2.5 text-xs font-mono focus:outline-none`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-xs font-semibold ${t.headingText} mb-1`}>Anotações / Recomendações</label>
                <input
                  type="text"
                  placeholder="Ex: Paciente apreensivo, verificar anamnese..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className={`w-full ${t.inputBg} border ${t.cardBorder} rounded-2xl px-3.5 py-2.5 text-xs focus:outline-none`}
                />
              </div>

              <div className={`flex items-center justify-end gap-3 pt-3 border-t ${t.modalBorder}`}>
                <button
                  type="button"
                  onClick={() => setIsNewAppointmentModalOpen(false)}
                  className={`px-4 py-2.5 ${t.btnSecondaryBg} ${t.btnSecondaryText} font-medium text-xs rounded-2xl border ${t.cardBorder} cursor-pointer`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2.5 ${t.btnPrimaryBg} ${t.btnPrimaryText} font-medium text-xs rounded-2xl shadow-xs cursor-pointer`}
                >
                  Confirmar Agendamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Daily Clinic Materials Report Modal */}
      {isDailyReportOpen && (
        <DailyClinicMaterialsReportModal
          appointments={appointments}
          inventory={inventory}
          tussProcedures={tussProcedures}
          clinics={clinics}
          professionals={professionals}
          onClose={() => setIsDailyReportOpen(false)}
        />
      )}

      {/* Single Appointment Materials Report Modal */}
      {selectedAptForReport && (
        <AppointmentMaterialsReportModal
          appointment={selectedAptForReport}
          inventory={inventory}
          tussProcedures={tussProcedures}
          clinics={clinics}
          professionals={professionals}
          onClose={() => setSelectedAptForReport(null)}
          onDeductStock={(materialsToDeduct) => {
            materialsToDeduct.forEach(item => {
              adjustStockQuantity(item.inventoryItemId, -item.quantityToDeduct);
            });
            setSelectedAptForReport(null);
          }}
        />
      )}
    </div>
  );
};

