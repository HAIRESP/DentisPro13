import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { getThemeStyles } from '../../utils/themeUtils';
import { Patient, ClinicalEvolutionEntry, Appointment, Prescription } from '../../types';
import { formatCPF, formatPhone } from '../../utils/formatters';
import { DocumentSignatureFooter } from '../common/DocumentSignatureFooter';
import { 
  FileCheck2, 
  Printer, 
  Search, 
  User, 
  Calendar, 
  Clock, 
  Stethoscope, 
  Building2, 
  Share2, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Pill, 
  Sparkles, 
  Send, 
  Copy, 
  Check, 
  ChevronRight, 
  Eye, 
  ExternalLink,
  Filter,
  PlusCircle,
  Activity,
  ShieldCheck,
  RotateCcw,
  ArrowLeft
} from 'lucide-react';

interface PatientAttendanceReport {
  id: string;
  patientId: string;
  patient: Patient;
  dentistName: string;
  professionalId?: string;
  clinicName?: string;
  clinicId?: string;
  date: string;
  time?: string;
  mainProcedure: string;
  toothNumber?: number;
  status: 'concluido' | 'em_atendimento' | 'agendado';
  evolutions: ClinicalEvolutionEntry[];
  appointment?: Appointment;
  prescriptions: Prescription[];
  diagnosis?: string;
  chiefComplaint?: string;
  recommendations?: string;
}

export const LaudosView: React.FC = () => {
  const { 
    patients, 
    clinicalEvolutions, 
    appointments, 
    prescriptions,
    clinicalExams,
    professionals, 
    clinics,
    activeProfessionalId,
    setActiveProfessionalId,
    activeClinicId,
    setActiveClinicId,
    activeProfessional,
    activeClinic,
    clinicInfo,
    layoutTheme,
    setActiveTab,
    setSelectedPatient
  } = useApp();

  const { currentUser } = useAuth();
  const t = getThemeStyles(layoutTheme);

  // States
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'concluido' | 'em_andamento' | 'agendado'>('todos');
  const [dateRangeFilter, setDateRangeFilter] = useState<'todos' | 'hoje' | '7dias' | '30dias'>('todos');
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [copiedSuccess, setCopiedSuccess] = useState<boolean>(false);

  // Generate attendance records for the reports
  const attendanceReports = useMemo(() => {
    const list: PatientAttendanceReport[] = [];
    const patientMap = new Map<string, Patient>();
    patients.forEach(p => patientMap.set(p.id, p));

    // 1. Extract from clinical evolutions
    clinicalEvolutions.forEach(evo => {
      const patient = patientMap.get(evo.patientId);
      if (!patient) return;

      const matchingPrescriptions = prescriptions.filter(p => 
        p.patientId === evo.patientId && p.date === evo.date
      );

      const matchingAppt = appointments.find(a => 
        a.patientId === evo.patientId && a.date === evo.date
      );

      const matchingExam = clinicalExams.find(e => e.patientId === evo.patientId);

      list.push({
        id: `rep-evo-${evo.id}`,
        patientId: evo.patientId,
        patient,
        dentistName: evo.dentistName || activeProfessional.name,
        clinicName: evo.clinicName || activeClinic.name,
        date: evo.date,
        time: matchingAppt?.time || '14:30',
        mainProcedure: evo.procedure || 'Procedimento Clínico Odontológico',
        toothNumber: evo.toothNumber,
        status: (evo.status === 'concluido' || evo.status === 'em_andamento') ? evo.status : 'concluido',
        evolutions: [evo],
        appointment: matchingAppt,
        prescriptions: matchingPrescriptions,
        diagnosis: matchingExam?.painExam?.diagnostico || 'Avaliação clínica e conduta restauradora',
        chiefComplaint: matchingExam?.painExam?.chiefComplaint || patient.anamnesis?.chiefComplaint || 'Consulta de rotina / queixa odontológica',
        recommendations: 'Manter higiene bucal rigorosa, escovação 3x ao dia com fio dental e retorno conforme plano.'
      });
    });

    // 2. Extract from completed / in-progress appointments that might not have evolution yet
    appointments.forEach(appt => {
      const alreadyExists = list.some(r => r.patientId === appt.patientId && r.date === appt.date);
      if (alreadyExists) return;

      const patient = patientMap.get(appt.patientId);
      if (!patient) return;

      const matchingPrescriptions = prescriptions.filter(p => 
        p.patientId === appt.patientId && p.date === appt.date
      );

      const matchingEvolutions = clinicalEvolutions.filter(e => 
        e.patientId === appt.patientId && e.date === appt.date
      );

      const matchingExam = clinicalExams.find(e => e.patientId === appt.patientId);

      let reportStatus: 'concluido' | 'em_atendimento' | 'agendado' = 'concluido';
      if (appt.status === 'em_atendimento') reportStatus = 'em_atendimento';
      else if (appt.status === 'agendado' || appt.status === 'confirmado') reportStatus = 'agendado';

      list.push({
        id: `rep-appt-${appt.id}`,
        patientId: appt.patientId,
        patient,
        dentistName: appt.dentistName || activeProfessional.name,
        clinicName: appt.clinicName || activeClinic.name,
        date: appt.date,
        time: appt.time,
        mainProcedure: appt.procedure || 'Consulta e Avaliação Odontológica',
        status: reportStatus,
        evolutions: matchingEvolutions,
        appointment: appt,
        prescriptions: matchingPrescriptions,
        diagnosis: matchingExam?.painExam?.diagnostico || 'Diagnóstico em acompanhamento clínico',
        chiefComplaint: appt.notes || patient.anamnesis?.chiefComplaint || 'Atendimento agendado',
        recommendations: 'Seguir orientações preventivas e realizar retornos periódicos semestrais.'
      });
    });

    // Sort by date descending (most recent first)
    list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return list;
  }, [patients, clinicalEvolutions, appointments, prescriptions, clinicalExams, activeProfessional.name, activeClinic.name]);

  // Filtered reports
  const filteredReports = useMemo(() => {
    return attendanceReports.filter(rep => {
      // 1. Filter by Professional/Dentist
      if (activeProfessionalId && activeProfessionalId !== 'todos') {
        const prof = professionals.find(p => p.id === activeProfessionalId);
        if (prof) {
          const matchDentist = rep.dentistName.toLowerCase().includes(prof.name.toLowerCase()) ||
                               prof.name.toLowerCase().includes(rep.dentistName.toLowerCase());
          if (!matchDentist) return false;
        }
      }

      // 2. Filter by Clinic Unit
      if (activeClinicId && activeClinicId !== 'todas') {
        const clinic = clinics.find(c => c.id === activeClinicId);
        if (clinic) {
          const matchClinic = rep.clinicName?.toLowerCase().includes(clinic.name.toLowerCase()) ||
                              clinic.name.toLowerCase().includes(rep.clinicName || '');
          if (!matchClinic) return false;
        }
      }

      // 3. Status filter
      if (statusFilter !== 'todos' && rep.status !== statusFilter) {
        return false;
      }

      // 4. Date range filter
      if (dateRangeFilter !== 'todos') {
        const today = new Date().toISOString().split('T')[0];
        const repDate = rep.date;
        if (dateRangeFilter === 'hoje' && repDate !== today) return false;
        if (dateRangeFilter === '7dias') {
          const diffDays = (new Date(today).getTime() - new Date(repDate).getTime()) / (1000 * 3600 * 24);
          if (diffDays > 7 || diffDays < 0) return false;
        }
        if (dateRangeFilter === '30dias') {
          const diffDays = (new Date(today).getTime() - new Date(repDate).getTime()) / (1000 * 3600 * 24);
          if (diffDays > 30 || diffDays < 0) return false;
        }
      }

      // 5. Search filter
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchName = rep.patient.name.toLowerCase().includes(query);
        const matchCpf = rep.patient.cpf?.toLowerCase().includes(query);
        const matchProc = rep.mainProcedure.toLowerCase().includes(query);
        const matchDiag = rep.diagnosis?.toLowerCase().includes(query);
        const matchTooth = rep.toothNumber?.toString() === query;

        if (!matchName && !matchCpf && !matchProc && !matchDiag && !matchTooth) {
          return false;
        }
      }

      return true;
    });
  }, [attendanceReports, activeProfessionalId, activeClinicId, statusFilter, dateRangeFilter, searchTerm, professionals, clinics]);

  // Selected report
  const selectedReport = useMemo(() => {
    if (selectedReportId) {
      const found = filteredReports.find(r => r.id === selectedReportId);
      if (found) return found;
    }
    return filteredReports[0] || null;
  }, [filteredReports, selectedReportId]);

  // Print function (adhering strictly to rule 2 in AGENTS.md)
  const handlePrint = () => {
    window.print();
  };

  // Copy full report text
  const handleCopyReportText = () => {
    if (!selectedReport) return;
    const text = `
===================================================
LAUDO CLÍNICO ODONTOLÓGICO & RESUMO DE ATENDIMENTO
${clinicInfo.name || activeClinic.name}
Dentista: ${selectedReport.dentistName} (${clinicInfo.cro || activeProfessional.cro})
===================================================

PACIENTE: ${selectedReport.patient.name}
CPF: ${selectedReport.patient.cpf || 'Não informado'}
DATA DO ATENDIMENTO: ${new Date(selectedReport.date).toLocaleDateString('pt-BR')} às ${selectedReport.time || '14:00'}
UNIDADE: ${selectedReport.clinicName || activeClinic.name}

1. QUEIXA PRINCIPAL / MOTIVO DA CONSULTA:
${selectedReport.chiefComplaint || 'Avaliação clínica odontológica'}

2. HIPÓTESE DIAGNÓSTICA:
${selectedReport.diagnosis || 'Condição clínica avaliada e tratada'}

3. PROCEDIMENTO PRINCIPAL REALIZADO:
- ${selectedReport.mainProcedure} ${selectedReport.toothNumber ? `(Dente ${selectedReport.toothNumber})` : ''}
${selectedReport.evolutions.map(e => `  * Conduta: ${e.description}`).join('\n')}

4. CONDUTAS & PRESCRIÇÕES:
${selectedReport.prescriptions.length > 0 ? selectedReport.prescriptions.map(p => p.medications.map(m => `  * ${m.name} ${m.dosage} - ${m.instructions} (${m.duration || ''})`).join('\n')).join('\n') : 'Sem necessidade de prescrição medicamentosa nesta sessão.'}

5. ORIENTAÇÕES PÓS-ATENDIMENTO:
${selectedReport.recommendations || 'Manter higienização oral e retornos semestrais preventivos.'}

Emitido eletronicamente via DentisPro em ${new Date().toLocaleDateString('pt-BR')}.
`.trim();

    navigator.clipboard.writeText(text);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 2500);
  };

  // Send via WhatsApp
  const handleSendWhatsApp = () => {
    if (!selectedReport) return;
    const phone = selectedReport.patient.phone.replace(/\D/g, '');
    const cleanPhone = phone.startsWith('55') ? phone : `55${phone}`;
    const msg = `Olá *${selectedReport.patient.name}*, aqui é da clínica *${clinicInfo.name || activeClinic.name}*.\n\nSeguem as informações e orientações do seu atendimento odontológico realizado com *${selectedReport.dentistName}* em *${new Date(selectedReport.date).toLocaleDateString('pt-BR')}*:\n\n📋 *Procedimento:* ${selectedReport.mainProcedure} ${selectedReport.toothNumber ? `(Dente ${selectedReport.toothNumber})` : ''}\n💡 *Orientações:* ${selectedReport.recommendations || 'Higiene e cuidados preventivos.'}\n\nQualquer dúvida estamos à disposição!`;
    const url = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  // Navigate to patient file
  const handleOpenPatientFile = () => {
    if (!selectedReport) return;
    setSelectedPatient(selectedReport.patient);
    setActiveTab('pacientes');
  };

  return (
    <div className="space-y-4 w-full max-w-[1700px] mx-auto pb-8">
      
      {/* 1. Header Superior & Filtros Rápidos (Ocultos na impressão) */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-4 print:hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Título e Identificação do Módulo */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#4a4a35] text-[#d4a373] flex items-center justify-center font-bold shadow-xs shrink-0">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                Laudos Clínicos & Atendimentos
                <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200">
                  {filteredReports.length} {filteredReports.length === 1 ? 'paciente' : 'pacientes'}
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Laudo completo dos últimos pacientes atendidos pelo Cirurgião-Dentista, condutas clínicas e prescrições.
              </p>
            </div>
          </div>

          {/* Seleção do Dentista Operador e Unidade */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Dentista */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 shadow-2xs">
              <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span className="text-[11px] font-semibold text-slate-600 whitespace-nowrap">Dentista:</span>
              <select
                value={activeProfessionalId}
                onChange={(e) => setActiveProfessionalId(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer pr-1"
                title="Filtrar por Dentista Operador"
              >
                <option value="todos">Todos os Dentistas ({professionals.length})</option>
                {professionals.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* Unidade */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 shadow-2xs">
              <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span className="text-[11px] font-semibold text-slate-600 whitespace-nowrap">Unidade:</span>
              <select
                value={activeClinicId}
                onChange={(e) => setActiveClinicId(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer pr-1"
                title="Filtrar por Unidade / Consultório"
              >
                <option value="todas">Todas as Unidades ({clinics.length})</option>
                {clinics.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

        </div>

        {/* Linha de Busca e Filtros de Estado */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
          
          {/* Campo de Busca */}
          <div className="relative w-full sm:w-80 lg:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por paciente, CPF, procedimento..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4a4a35]/20 focus:border-[#4a4a35] transition"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                ×
              </button>
            )}
          </div>

          {/* Filtros de Status e Período */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-start sm:justify-end">
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setStatusFilter('todos')}
                className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${statusFilter === 'todos' ? 'bg-white text-slate-800 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Todos
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('concluido')}
                className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${statusFilter === 'concluido' ? 'bg-white text-emerald-700 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Concluídos
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('em_andamento')}
                className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${statusFilter === 'em_andamento' ? 'bg-white text-blue-700 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Em Andamento
              </button>
            </div>

            <select
              value={dateRangeFilter}
              onChange={(e) => setDateRangeFilter(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer"
            >
              <option value="todos">Todo o período</option>
              <option value="hoje">Hoje</option>
              <option value="7dias">Últimos 7 dias</option>
              <option value="30dias">Últimos 30 dias</option>
            </select>
          </div>

        </div>
      </div>

      {/* 2. Área Principal: Grade com Lista de Pacientes (Esquerda) e Laudo Completo (Direita) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Coluna da Esquerda: Lista dos Últimos Pacientes Atendidos (Oculta na impressão) */}
        <div className="lg:col-span-4 space-y-2.5 print:hidden">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Últimos Atendimentos ({filteredReports.length})
            </h2>
            <span className="text-[11px] text-slate-400">
              Selecione para ver o laudo
            </span>
          </div>

          {filteredReports.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <FileText className="w-6 h-6" />
              </div>
              <p className="text-xs font-semibold text-slate-600">Nenhum laudo ou atendimento encontrado com os filtros atuais.</p>
              <button
                type="button"
                onClick={() => { setSearchTerm(''); setStatusFilter('todos'); setDateRangeFilter('todos'); }}
                className="text-xs font-bold text-[#4a4a35] underline cursor-pointer"
              >
                Limpar filtros de busca
              </button>
            </div>
          ) : (
            <div className="space-y-2 max-h-[720px] overflow-y-auto pr-1">
              {filteredReports.map(rep => {
                const isSelected = selectedReport?.id === rep.id;
                return (
                  <button
                    key={rep.id}
                    type="button"
                    onClick={() => setSelectedReportId(rep.id)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-2 relative ${
                      isSelected 
                        ? 'bg-slate-900 text-white border-slate-800 shadow-md ring-2 ring-[#d4a373]' 
                        : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {rep.patient.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <h3 className={`text-xs font-bold truncate leading-tight ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                            {rep.patient.name}
                          </h3>
                          <p className={`text-[10.5px] truncate ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                            CPF: {formatCPF(rep.patient.cpf)}
                          </p>
                        </div>
                      </div>

                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        rep.status === 'concluido' 
                          ? (isSelected ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-emerald-50 text-emerald-700 border border-emerald-200')
                          : (isSelected ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'bg-blue-50 text-blue-700 border border-blue-200')
                      }`}>
                        {rep.status === 'concluido' ? 'Concluído' : 'Em Andamento'}
                      </span>
                    </div>

                    <div className="pt-1.5 border-t border-slate-200/40 flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-1.5 truncate">
                        <Stethoscope className={`w-3 h-3 shrink-0 ${isSelected ? 'text-[#d4a373]' : 'text-slate-400'}`} />
                        <span className={`truncate font-medium ${isSelected ? 'text-slate-200' : 'text-slate-700'}`}>
                          {rep.mainProcedure} {rep.toothNumber ? `(D${rep.toothNumber})` : ''}
                        </span>
                      </div>
                      
                      <div className={`flex items-center gap-1 font-semibold shrink-0 text-[10.5px] ${isSelected ? 'text-slate-400' : 'text-slate-500'}`}>
                        <Calendar className="w-2.5 h-2.5" />
                        <span>{new Date(rep.date).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Coluna da Direita: Visualizador do Laudo Completo */}
        <div className="lg:col-span-8">
          {selectedReport ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              
              {/* Barra de Ações Rápidas do Laudo (Oculta na impressão) */}
              <div className="bg-slate-50 px-4 sm:px-6 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 print:hidden">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold text-slate-700">
                    Laudo Clínico nº {selectedReport.id.replace('rep-', '').toUpperCase()}
                  </span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs text-slate-500 font-medium">
                    Atendido por <strong>{selectedReport.dentistName}</strong>
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Voltar aos Pacientes */}
                  <button
                    type="button"
                    onClick={handleOpenPatientFile}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-2xs border border-slate-200 active:scale-95"
                    title="Voltar / Abrir prontuário do paciente"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 text-[#4a4a35]" />
                    <span>Voltar ao Prontuário</span>
                  </button>

                  {/* Botão de Impressão nativa estrita (Regra 2 do AGENTS.md: rotulagem sucinta "Imprimir") */}
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-500 text-stone-900 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-2xs active:scale-95 border border-amber-500/30"
                    title="Imprimir laudo em folha timbrada A4"
                  >
                    <Printer className="w-3.5 h-3.5 text-stone-900" />
                    <span>Imprimir</span>
                  </button>

                  {/* Enviar via WhatsApp */}
                  <button
                    type="button"
                    onClick={handleSendWhatsApp}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-2xs active:scale-95"
                    title="Enviar laudo / resumo para o WhatsApp do paciente"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>

                  {/* Copiar Texto */}
                  <button
                    type="button"
                    onClick={handleCopyReportText}
                    className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                    title="Copiar texto do laudo"
                  >
                    {copiedSuccess ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                        <span>Copiar</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Documento do Laudo em Formato Timbrado A4 */}
              <div className="p-6 sm:p-8 space-y-6 text-slate-800 bg-white" id="laudo-print-area">
                
                {/* Cabeçalho da Clínica & Cirurgião Dentista */}
                <div className="flex items-start justify-between pb-5 border-b-2 border-slate-800 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-[#4a4a35] text-[#d4a373] flex items-center justify-center font-bold text-xs">
                        <Stethoscope className="w-4 h-4" />
                      </div>
                      <h2 className="text-xl font-bold font-serif tracking-tight text-slate-900">
                        {clinicInfo.name || activeClinic.name || 'DentisPro Odontologia Integrada'}
                      </h2>
                    </div>
                    <p className="text-xs text-slate-600">
                      {clinicInfo.address || activeClinic.address || 'Av. Santos Dumont, 2800 - Aldeota'} • {clinicInfo.city || activeClinic.city || 'Fortaleza - CE'}
                    </p>
                    <p className="text-xs text-slate-600">
                      Telefone: {clinicInfo.phone || activeClinic.phone || '(85) 3261-9000'} • E-mail: {clinicInfo.email || 'contato@dentispro.com.br'}
                    </p>
                  </div>

                  <div className="text-right space-y-0.5 shrink-0">
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-800 font-mono text-[11px] font-bold rounded-md border border-slate-300 inline-block">
                      LAUDO ODONTOLÓGICO
                    </span>
                    <p className="text-[11px] text-slate-500 pt-1">
                      Data: <strong>{new Date(selectedReport.date).toLocaleDateString('pt-BR')}</strong>
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Horário: <strong>{selectedReport.time || '14:30'}</strong>
                    </p>
                  </div>
                </div>

                {/* Bloco 1: Identificação do Paciente */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#4a4a35] flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    1. Identificação do Paciente
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-slate-500 block text-[11px]">Nome do Paciente:</span>
                      <strong className="text-slate-900 text-sm font-bold">{selectedReport.patient.name}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">CPF:</span>
                      <strong className="text-slate-800">{formatCPF(selectedReport.patient.cpf)}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Telefone / WhatsApp:</span>
                      <strong className="text-slate-800">{formatPhone(selectedReport.patient.phone)}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Convênio / Plano:</span>
                      <strong className="text-slate-800">{selectedReport.patient.healthInsurance || 'Particular'}</strong>
                    </div>
                  </div>
                </div>

                {/* Bloco 2: Queixa Principal & Hipótese Diagnóstica */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#4a4a35] flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
                    <Activity className="w-3.5 h-3.5" />
                    2. Queixa Principal & Hipótese Diagnóstica
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                        Queixa Relatada pelo Paciente
                      </span>
                      <p className="text-slate-800 font-medium leading-relaxed">
                        {selectedReport.chiefComplaint || 'Paciente compareceu para avaliação clínica de rotina e acompanhamento odontológico.'}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                        Diagnóstico Odontológico / Avaliação
                      </span>
                      <p className="text-slate-800 font-medium leading-relaxed">
                        {selectedReport.diagnosis || 'Condição clínica favorável, necessidade de intervenção preventiva e restauradora direta.'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bloco 3: Procedimentos Realizados & Evolução Clínica */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#4a4a35] flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
                    <Stethoscope className="w-3.5 h-3.5" />
                    3. Procedimentos Odontológicos Realizados & Conduta
                  </h3>

                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                        <tr>
                          <th className="p-2.5">Procedimento / Intervenção</th>
                          <th className="p-2.5">Dente / Região</th>
                          <th className="p-2.5">Cirurgião-Dentista</th>
                          <th className="p-2.5 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        <tr className="bg-white">
                          <td className="p-2.5 font-bold text-slate-900">
                            {selectedReport.mainProcedure}
                          </td>
                          <td className="p-2.5 text-slate-700 font-semibold">
                            {selectedReport.toothNumber ? `Dente FDI ${selectedReport.toothNumber}` : 'Arcada Geral'}
                          </td>
                          <td className="p-2.5 text-slate-700">
                            {selectedReport.dentistName}
                          </td>
                          <td className="p-2.5 text-right">
                            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold rounded-md border border-emerald-200 text-[11px]">
                              {selectedReport.status === 'concluido' ? 'Concluído' : 'Em Andamento'}
                            </span>
                          </td>
                        </tr>
                        {selectedReport.evolutions.length > 0 && (
                          <tr className="bg-slate-50/50">
                            <td colSpan={4} className="p-3 text-xs text-slate-700 space-y-1">
                              <span className="font-bold text-slate-800 block">Descrição Detalhada da Conduta Clínica:</span>
                              <p className="leading-relaxed bg-white p-2.5 rounded-lg border border-slate-200">
                                {selectedReport.evolutions[0].description || 'Realizada antissepsia, isolamento do campo operatório, preparo cavitário, condicionamento ácido, aplicação de sistema adesivo e restauração em resina composta com fotoativação. Ajuste oclusal e acabamento estético satisfatórios.'}
                              </p>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Bloco 4: Medicamentos Prescritos (se houver) */}
                {selectedReport.prescriptions.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#4a4a35] flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
                      <Pill className="w-3.5 h-3.5" />
                      4. Prescrição Medicamentosa Vinculada
                    </h3>
                    <div className="space-y-2">
                      {selectedReport.prescriptions.map((presc, idx) => (
                        <div key={idx} className="p-3 bg-amber-50/50 border border-amber-200 rounded-xl space-y-1.5">
                          <span className="text-[11px] font-bold text-amber-900 block">
                            Receituário emitido em {new Date(presc.date).toLocaleDateString('pt-BR')} ({presc.type === 'controlada' ? 'Controle Especial' : 'Receita Simples'})
                          </span>
                          <ul className="list-disc list-inside text-xs text-slate-800 space-y-1">
                            {presc.medications.map((med, mIdx) => (
                              <li key={mIdx} className="leading-relaxed">
                                <strong>{med.name}</strong> ({med.dosage}) — {med.instructions} {med.duration ? `• Duração: ${med.duration}` : ''}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bloco 5: Orientações Pós-Atendimento & Retorno */}
                <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#4a4a35] flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    5. Orientações Pós-Atendimento & Cuidados
                  </h3>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {selectedReport.recommendations || 'Manter higienização oral com escovação suave após as refeições e uso correto do fio dental. Evitar alimentos excessivamente duros ou pigmentados nas primeiras 24 horas. Retornar à clínica caso observe qualquer sintoma incomum ou desconforto.'}
                  </p>
                </div>

                {/* Bloco 6: Assinatura do Cirurgião-Dentista & Rodapé com Links (Regra 4 do AGENTS.md) */}
                <div className="pt-6 border-t border-slate-200 space-y-6">
                  
                  {/* Carimbo e Assinatura */}
                  <div className="flex flex-col items-center justify-center text-center space-y-1.5 pt-4">
                    <div className="w-64 border-b border-slate-800 pb-1" />
                    <strong className="text-sm font-bold text-slate-900">
                      {selectedReport.dentistName}
                    </strong>
                    <p className="text-xs text-slate-600">
                      Cirurgião-Dentista • {activeProfessional.cro || clinicInfo.cro || 'CRO/CE 5925'}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {activeProfessional.specialty || clinicInfo.specialty || 'Implantodontia, Prótese & Clínica Geral'}
                    </p>
                  </div>

                  {/* Rodapé Interativo Conforme Regra 4 de AGENTS.md */}
                  <DocumentSignatureFooter 
                    dentistName={selectedReport.dentistName}
                    cro={activeProfessional.cro || clinicInfo.cro || 'CRO/CE 5925'}
                    specialty={activeProfessional.specialty || clinicInfo.specialty || 'Cirurgião-Dentista'}
                    clinicName={clinicInfo.name || activeClinic.name}
                  />

                </div>

              </div>

              {/* Bottom Actions Bar (Hidden in Print) */}
              <div className="bg-slate-50 border-t border-slate-200 p-4 flex flex-wrap items-center justify-between gap-3 print:hidden">
                <button
                  type="button"
                  onClick={handleOpenPatientFile}
                  className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs rounded-xl flex items-center gap-2 shadow-2xs border border-slate-300 transition cursor-pointer active:scale-95"
                >
                  <ArrowLeft className="w-4 h-4 text-[#4a4a35]" />
                  <span>Voltar ao Prontuário</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSendWhatsApp}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-2xs transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePrint}
                    className="px-5 py-2 bg-amber-400 hover:bg-amber-500 text-stone-900 font-bold text-xs rounded-xl shadow-2xs transition flex items-center gap-1.5 cursor-pointer border border-amber-500/30 active:scale-95"
                  >
                    <Printer className="w-4 h-4 text-stone-900" />
                    <span>Imprimir</span>
                  </button>
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <FileCheck2 className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-800">Selecione um paciente para ver o laudo</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Escolha qualquer paciente atendido na lista à esquerda para carregar o histórico de atendimento, condutas e prescrições.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
