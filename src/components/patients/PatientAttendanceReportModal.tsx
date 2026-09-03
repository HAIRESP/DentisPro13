import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { getThemeStyles } from '../../utils/themeUtils';
import { Patient } from '../../types';
import { formatCPF } from '../../utils/formatters';
import { DocumentSignatureFooter } from '../common/DocumentSignatureFooter';
import { 
  Printer, 
  X, 
  FileText, 
  DollarSign, 
  Calendar, 
  Stethoscope, 
  CheckCircle2, 
  Clock, 
  User, 
  Building2, 
  Sparkles, 
  ShieldCheck, 
  Send,
  MessageSquare,
  ChevronRight,
  TrendingUp,
  FileCheck2,
  ArrowLeft
} from 'lucide-react';

export interface AttendanceReportEvent {
  id: string;
  type: 'evolution' | 'financial' | 'treatment_plan' | 'appointment' | 'document' | 'file';
  date: string;
  timestamp: number;
  title: string;
  subtitle?: string;
  details?: string;
  amount?: number;
  status?: string;
  toothNumber?: number;
  professionalName?: string;
  categoryTag: string;
  imageUrl?: string;
}

interface PatientAttendanceReportModalProps {
  patient: Patient;
  isOpen: boolean;
  onClose: () => void;
}

export const PatientAttendanceReportModal: React.FC<PatientAttendanceReportModalProps> = ({
  patient,
  isOpen,
  onClose
}) => {
  const { 
    clinicalEvolutions, 
    patientPayments, 
    treatmentPlans, 
    appointments, 
    savedClinicDocuments, 
    clinicInfo,
    layoutTheme 
  } = useApp();

  const t = getThemeStyles(layoutTheme);
  const [activeFilter, setActiveFilter] = useState<string>('todos');
  const [reportStage, setReportStage] = useState<'inicial' | 'final' | 'unificado'>('inicial');
  const [customJustificationNote, setCustomJustificationNote] = useState<string>('');

  // Compute patient age
  const age = useMemo(() => {
    if (!patient.birthDate) return 'N/A';
    const birth = new Date(patient.birthDate);
    const now = new Date();
    let ageVal = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
      ageVal--;
    }
    return `${ageVal} anos`;
  }, [patient.birthDate]);

  // Merge and deduplicate all patient instances in reverse chronological order
  const { timelineEvents, financialMetrics } = useMemo(() => {
    const patientEvolutions = clinicalEvolutions.filter(e => e.patientId === patient.id);
    const myPayments = patientPayments.filter(p => p.patientId === patient.id);
    const myPlans = treatmentPlans.filter(p => p.patientId === patient.id);
    const myAppointments = appointments.filter(a => a.patientId === patient.id);
    const myDocs = savedClinicDocuments.filter(d => d.patientId === patient.id);

    // Financial Metrics
    const totalBudget = myPlans
      .filter(p => p.status !== 'cancelado')
      .reduce((acc, p) => acc + (p.finalValue || p.totalValue || 0), 0);
    const totalPaid = myPayments.reduce((acc, p) => acc + p.amount, 0);
    const balanceDue = Math.max(0, totalBudget - totalPaid);

    const eventMap = new Map<string, AttendanceReportEvent>();

    const parseTimestamp = (dateStr?: string) => {
      if (!dateStr) return 0;
      const ts = new Date(dateStr).getTime();
      return isNaN(ts) ? 0 : ts;
    };

    // 1. Clinical Evolutions
    patientEvolutions.forEach(evo => {
      const key = `evo_${evo.id}`;
      eventMap.set(key, {
        id: key,
        type: 'evolution',
        date: evo.date,
        timestamp: parseTimestamp(evo.date),
        title: evo.procedure,
        subtitle: evo.toothNumber ? `Dente #${evo.toothNumber}` : undefined,
        details: evo.description,
        amount: evo.cost,
        status: evo.status,
        professionalName: evo.dentistName,
        toothNumber: evo.toothNumber,
        categoryTag: 'Evolução Clínica'
      });
    });

    // 2. Financial Payments
    myPayments.forEach(pay => {
      const key = `pay_${pay.id}`;
      if (!eventMap.has(key)) {
        eventMap.set(key, {
          id: key,
          type: 'financial',
          date: pay.date,
          timestamp: parseTimestamp(pay.date),
          title: `Lançamento Financeiro: ${pay.description}`,
          subtitle: `Forma de Pagamento: ${(pay.paymentMethod || 'PIX').toUpperCase()}`,
          details: pay.notes ? `Observações: ${pay.notes}` : undefined,
          amount: pay.amount,
          status: 'pago',
          professionalName: pay.clinicName,
          categoryTag: 'Financeiro'
        });
      }
    });

    // 3. Treatment Plans
    myPlans.forEach(plan => {
      const key = `plan_${plan.id}`;
      if (!eventMap.has(key)) {
        const planDate = plan.date || plan.createdAt || new Date().toISOString().split('T')[0];
        const itemDetails = plan.items && plan.items.length > 0 
          ? plan.items.map(i => `• ${i.procedureName} ${i.toothNumber ? `(Dente #${i.toothNumber})` : ''} - Status: ${i.status}`).join('\n')
          : undefined;

        eventMap.set(key, {
          id: key,
          type: 'treatment_plan',
          date: planDate,
          timestamp: parseTimestamp(planDate),
          title: `Plano de Tratamento: ${plan.title}`,
          subtitle: `Orçamento Total: R$ ${(plan.finalValue || plan.totalValue || 0).toFixed(2)}`,
          details: plan.notes ? `${plan.notes}\n${itemDetails || ''}` : itemDetails,
          amount: plan.finalValue || plan.totalValue,
          status: plan.status,
          categoryTag: 'Plano de Tratamento'
        });
      }
    });

    // 4. Appointments
    myAppointments.forEach(apt => {
      const key = `apt_${apt.id}`;
      if (!eventMap.has(key)) {
        eventMap.set(key, {
          id: key,
          type: 'appointment',
          date: apt.date,
          timestamp: parseTimestamp(`${apt.date}T${apt.time || '00:00'}`),
          title: `Consulta / Agendamento: ${apt.procedure || 'Atendimento Odontológico'}`,
          subtitle: `Horário: ${apt.time || 'N/A'} • Status: ${(apt.status || '').toUpperCase()}`,
          details: apt.notes,
          status: apt.status,
          professionalName: apt.dentistName,
          categoryTag: 'Consulta'
        });
      }
    });

    // 5. Saved Documents
    myDocs.forEach(doc => {
      const key = `doc_${doc.id}`;
      if (!eventMap.has(key)) {
        const docDate = doc.date || doc.createdAt || new Date().toISOString().split('T')[0];
        eventMap.set(key, {
          id: key,
          type: 'document',
          date: docDate,
          timestamp: parseTimestamp(docDate),
          title: `Documento Emitido: ${doc.title}`,
          subtitle: doc.subtitle || `Categoria: ${doc.category}`,
          details: doc.summary || doc.content,
          professionalName: doc.professionalName,
          categoryTag: 'Documento'
        });
      }
    });

    // 6. Arquivos e Mídias / Imagens do Prontuário
    (patient.images || []).forEach((imgUrl, idx) => {
      const key = `img_${idx}_${imgUrl.slice(-10)}`;
      if (!eventMap.has(key)) {
        const todayDate = new Date().toISOString().split('T')[0];
        eventMap.set(key, {
          id: key,
          type: 'file',
          date: todayDate,
          timestamp: parseTimestamp(todayDate) - idx * 1000,
          title: `Arquivo / Foto #${idx + 1}`,
          subtitle: 'Arquivo anexado ao prontuário clínico',
          categoryTag: 'Arquivo',
          imageUrl: imgUrl
        });
      }
    });

    // Sort strictly in DESCENDING CHRONOLOGICAL ORDER (newest to oldest)
    const sorted = Array.from(eventMap.values()).sort((a, b) => b.timestamp - a.timestamp);

    return {
      timelineEvents: sorted,
      financialMetrics: {
        totalBudget,
        totalPaid,
        balanceDue
      }
    };
  }, [patient.id, patient.images, clinicalEvolutions, patientPayments, treatmentPlans, appointments, savedClinicDocuments]);

  if (!isOpen) return null;

  const filteredEvents = timelineEvents.filter(ev => {
    if (activeFilter === 'todos') return true;
    return ev.type === activeFilter;
  });

  const handlePrint = () => {
    window.print();
  };

  const getReportTitle = () => {
    if (reportStage === 'inicial') return 'Relatório de Atendimento Inicial';
    if (reportStage === 'final') return 'Relatório de Atendimento Final';
    return 'Relatório de Atendimento Unificado';
  };

  const handleSendWhatsApp = () => {
    const phone = patient.phone ? patient.phone.replace(/\D/g, '') : '';
    let msg = `*${getReportTitle().toUpperCase()} - ${clinicInfo.name || 'CLÍNICA DENTISPRO'}*\n\n`;
    msg += `👤 *Paciente:* ${patient.name}\n`;
    msg += `📄 *CPF:* ${patient.cpf || 'N/A'}\n`;
    msg += `📅 *Data da Emissão:* ${new Date().toLocaleDateString('pt-BR')}\n\n`;
    msg += `💰 *RESUMO FINANCEIRO*\n`;
    msg += `• Orçamento Total: R$ ${financialMetrics.totalBudget.toFixed(2)}\n`;
    msg += `• Total Quitado: R$ ${financialMetrics.totalPaid.toFixed(2)}\n`;
    msg += `• Saldo Devedor: R$ ${financialMetrics.balanceDue.toFixed(2)}\n\n`;
    msg += `📋 *HISTÓRICO CRONOLÓGICO DE ATENDIMENTOS*\n`;

    timelineEvents.slice(0, 8).forEach(ev => {
      msg += `\n• *[${ev.date}]* ${ev.title}\n`;
      if (ev.subtitle) msg += `  _${ev.subtitle}_\n`;
      if (ev.amount) msg += `  Valor: R$ ${ev.amount.toFixed(2)}\n`;
    });

    msg += `\n\n📌 *INFORMAÇÕES E ESCLARECIMENTOS AO PACIENTE ASSISTIDO*\n`;
    msg += `Ficam prestadas as informações aos pacientes assistidos que justifiquem a recusa do atendimento, a interrupção do tratamento ou o tempo mais longo para a conclusão do tratamento, em razão da complexidade do caso, da finalidade pedagógica, do estágio de formação em que o profissional se encontre em relação às habilidades e aos conhecimentos que o caso clínico demande, ou mesmo delonga em razão de casos fortuitos que forçam a paralisação dos atendimentos nas clínicas da instituição.\n`;

    if (customJustificationNote) {
      msg += `\n*Observação Complementar:* ${customJustificationNote}\n`;
    }

    msg += `\nPara mais informações, entre em contato com nossa equipe.`;
    const targetUrl = phone 
      ? `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`
      : `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(targetUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white print:static print:inset-auto">
      <div className="bg-white border border-[#e5e5d1] rounded-[32px] max-w-4xl w-full p-6 shadow-2xl space-y-6 my-6 print:border-none print:shadow-none print:rounded-none print:max-w-none print:w-full print:p-0">
        
        {/* Modal Action Header (Hidden in Print) */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e5e5d1] pb-4 print:hidden">
          <div>
            <h2 className="text-lg font-serif italic font-bold text-[#5a5a40] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#d4a373]" />
              {getReportTitle()}
            </h2>
            <p className="text-xs text-gray-500">
              Histórico cronológico consolidado (Evoluções, Financeiro, Consultas e Documentos) com justificativas institucionais e pedagógicas.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs rounded-2xl flex items-center gap-1.5 shadow-xs transition cursor-pointer border border-[#e5e5d1]"
              title="Voltar"
            >
              <ArrowLeft className="w-4 h-4 text-[#5a5a40]" />
              <span>Voltar</span>
            </button>

            <button
              type="button"
              onClick={handleSendWhatsApp}
              className="px-4 py-2 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs rounded-2xl flex items-center gap-1.5 shadow-xs transition cursor-pointer"
              title="Enviar resumo do relatório para o WhatsApp do paciente"
            >
              <Send className="w-4 h-4 text-white" />
              <span>Enviar no WhatsApp</span>
            </button>

            {/* YELLOW PRINT BUTTON */}
            <button
              type="button"
              onClick={handlePrint}
              className="px-5 py-2 bg-amber-400 hover:bg-amber-500 text-stone-900 font-bold text-xs rounded-2xl flex items-center gap-1.5 shadow-xs transition cursor-pointer border border-amber-500/30"
              title="Acionar janela nativa de impressão"
            >
              <Printer className="w-4 h-4 text-stone-900" />
              <span>Imprimir</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-stone-800 rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Phase Selector & Controls (Hidden in Print) */}
        <div className="bg-[#fbfbf9] border border-[#e5e5d1] rounded-2xl p-3.5 space-y-3 print:hidden">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold text-[#5a5a40] uppercase tracking-wider flex items-center gap-1.5">
              <FileCheck2 className="w-4 h-4 text-[#d4a373]" />
              Tipo / Fase do Relatório:
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'inicial', label: 'Atendimento Inicial' },
                { id: 'final', label: 'Atendimento Final' },
                { id: 'unificado', label: 'Unificado / Geral' }
              ].map(stg => (
                <button
                  key={stg.id}
                  type="button"
                  onClick={() => setReportStage(stg.id as any)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    reportStage === stg.id 
                      ? 'bg-amber-400 text-stone-950 shadow-xs border border-amber-500/40' 
                      : 'bg-white text-stone-700 hover:bg-[#f0f0e8] border border-[#e5e5d1]'
                  }`}
                >
                  {stg.label}
                </button>
              ))}
            </div>
          </div>

          {/* Optional custom note field */}
          <div className="pt-2 border-t border-[#e5e5d1]">
            <label className="text-[11px] font-bold text-stone-600 block mb-1">
              Observação Complementar do Relatório (opcional):
            </label>
            <input
              type="text"
              value={customJustificationNote}
              onChange={(e) => setCustomJustificationNote(e.target.value)}
              placeholder="Ex: Tratamento realizado em ambiente clínico-escola com supervisão docente; paciente orientado sobre etapas."
              className="w-full text-xs p-2.5 bg-white border border-[#e5e5d1] rounded-xl text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#5a5a40]"
            />
          </div>
        </div>

        {/* PRINTABLE DOCUMENT BODY */}
        <div id="printable-attendance-report" className="space-y-6 text-[#2c2c2c]">
          
          {/* Clinic Header */}
          <div className="border-b-2 border-[#5a5a40] pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-serif font-bold text-[#5a5a40] tracking-wide">
                {clinicInfo.name || 'DentisPro Odontologia'}
              </h1>
              <p className="text-xs font-medium text-stone-600 mt-0.5">
                {clinicInfo.dentistName || 'Dr. Hugo Andres Iglesias Ricoy'} • {clinicInfo.cro || 'CRO/CE 5925'}
              </p>
              <p className="text-[11px] text-stone-500 mt-0.5">
                {clinicInfo.city || 'Fortaleza'} - {clinicInfo.state || 'CE'} • CEP: 60.160-110 • Tel: {clinicInfo.phone || '(85) 99999-9999'}
              </p>
            </div>

            <div className="text-right sm:text-right border-l-2 sm:border-l-0 sm:border-r-2 border-[#d4a373] pl-3 sm:pl-0 sm:pr-3">
              <span className="px-3 py-1 bg-[#f0f0e8] text-[#5a5a40] text-xs font-bold font-mono rounded-lg border border-[#e5e5d1] block uppercase">
                {getReportTitle().toUpperCase()}
              </span>
              <span className="text-[10px] text-stone-500 mt-1 block">
                Emissão: {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}
              </span>
            </div>
          </div>

          {/* Patient Header Details (Identificação Completa: Nome, Idade, Raça/Etnia, Gênero, CPF, Convênio) */}
          <div className="bg-[#fbfbf9] border border-[#e5e5d1] rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 text-xs">
            <div>
              <span className="text-[10px] font-bold text-[#5a5a40] uppercase tracking-wider block">Nome do Paciente:</span>
              <strong className="text-sm text-stone-900 block">{patient.name}</strong>
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#5a5a40] uppercase tracking-wider block">Idade / Nascimento:</span>
              <span className="font-semibold text-stone-800">{age}</span>
              {patient.birthDate && (
                <span className="text-stone-500 ml-1.5 text-[11px]">
                  ({new Date(patient.birthDate + 'T12:00:00').toLocaleDateString('pt-BR')})
                </span>
              )}
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#5a5a40] uppercase tracking-wider block">Raça / Etnia:</span>
              <span className="font-semibold text-stone-800 capitalize">
                {(() => {
                  const eth = patient.ethnicity || patient.anamnesis?.ethnicity;
                  const details = patient.anamnesis?.ethnicityDetails;
                  if (!eth) return 'Não declarada';
                  const labels: Record<string, string> = {
                    branca: 'Branca',
                    preta: 'Preta',
                    parda: 'Parda',
                    amarela: 'Amarela',
                    indigena: 'Indígena',
                    outra: 'Outra'
                  };
                  const label = labels[eth] || eth;
                  return details ? `${label} (${details})` : label;
                })()}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#5a5a40] uppercase tracking-wider block">Identificação de Gênero:</span>
              <span className="text-stone-800 font-semibold">
                {(() => {
                  const g = patient.gender;
                  if (!g) return 'Não informado';
                  if (g === 'cisgenero') return 'Cisgênero';
                  if (g === 'transgenero') return 'Transgênero';
                  if (g === 'nao_binario') return 'Não-binário';
                  if (g === 'masculino') return 'Masculino';
                  if (g === 'feminino') return 'Feminino';
                  return g;
                })()}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#5a5a40] uppercase tracking-wider block">Documento CPF:</span>
              <span className="font-mono text-stone-800 font-medium">{formatCPF(patient.cpf)}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#5a5a40] uppercase tracking-wider block">Telefone / Convênio:</span>
              <span className="text-stone-800">{patient.phone || 'N/A'}</span> • <span className="font-semibold text-amber-700">{patient.healthInsurance || 'Particular'}</span>
            </div>
          </div>

          {/* Financial Metrics Summary Bar */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-blue-50/60 border border-blue-200 rounded-2xl p-3">
              <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block">Total Orçamentos</span>
              <strong className="text-sm text-blue-900 font-mono">
                R$ {financialMetrics.totalBudget.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </strong>
            </div>
            <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-3">
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">Total Quitado</span>
              <strong className="text-sm text-emerald-900 font-mono">
                R$ {financialMetrics.totalPaid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </strong>
            </div>
            <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-3">
              <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">Saldo Restante</span>
              <strong className="text-sm text-amber-900 font-mono">
                R$ {financialMetrics.balanceDue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </strong>
            </div>
          </div>

          {/* Category Filter Pills (Hidden in Print) */}
          <div className="flex flex-wrap items-center gap-1.5 border-b border-[#e5e5d1] pb-3 print:hidden text-xs">
            <span className="text-xs font-bold text-[#5a5a40] mr-2">Filtrar Categoria:</span>
            {[
              { id: 'todos', label: `Todos (${timelineEvents.length})` },
              { id: 'evolution', label: `Evoluções (${timelineEvents.filter(e => e.type === 'evolution').length})` },
              { id: 'financial', label: `Financeiro (${timelineEvents.filter(e => e.type === 'financial').length})` },
              { id: 'treatment_plan', label: `Planos (${timelineEvents.filter(e => e.type === 'treatment_plan').length})` },
              { id: 'appointment', label: `Consultas (${timelineEvents.filter(e => e.type === 'appointment').length})` },
              { id: 'document', label: `Documentos (${timelineEvents.filter(e => e.type === 'document').length})` },
              { id: 'file', label: `Arquivos (${timelineEvents.filter(e => e.type === 'file').length})` }
            ].map(btn => (
              <button
                key={btn.id}
                type="button"
                onClick={() => setActiveFilter(btn.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeFilter === btn.id 
                    ? 'bg-[#5a5a40] text-white shadow-2xs' 
                    : 'bg-[#f0f0e8] text-stone-700 hover:bg-[#e5e5d1]'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          {/* Chronological Timeline List (Ordem Cronológica Decrescente) */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-[#5a5a40] uppercase tracking-wider flex items-center justify-between border-b border-[#e5e5d1] pb-2">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#d4a373]" />
                Histórico do Atendimento (Ordem Cronológica Decrescente)
              </span>
              <span className="text-[10px] font-mono font-normal text-stone-500">
                {filteredEvents.length} registro(s) unificado(s)
              </span>
            </h3>

            {filteredEvents.length === 0 ? (
              <div className="p-8 text-center bg-[#fbfbf9] rounded-2xl border border-dashed border-[#e5e5d1] text-gray-400 text-xs">
                Nenhum registro encontrado para a seleção atual.
              </div>
            ) : (
              <div className="relative border-l-2 border-[#e5e5d1] ml-4 space-y-4 print:ml-2">
                {filteredEvents.map((ev) => (
                  <div key={ev.id} className="relative pl-6 print:pl-4 print:break-inside-avoid">
                    
                    {/* Timeline Dot Icon */}
                    <div className={`absolute -left-[9px] top-1.5 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center text-[9px] text-white ${
                      ev.type === 'evolution' ? 'bg-emerald-600' :
                      ev.type === 'financial' ? 'bg-amber-500' :
                      ev.type === 'treatment_plan' ? 'bg-blue-600' :
                      ev.type === 'appointment' ? 'bg-purple-600' :
                      ev.type === 'file' ? 'bg-teal-600' :
                      'bg-stone-600'
                    }`} />

                    <div className="bg-[#fbfbf9] border border-[#e5e5d1] rounded-2xl p-3.5 space-y-2 text-xs shadow-2xs print:border-stone-300 print:bg-white">
                      
                      {/* Event Header */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#e5e5d1] pb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-stone-900 text-xs">{ev.title}</span>
                          
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                            ev.type === 'evolution' ? 'bg-emerald-100 text-emerald-800' :
                            ev.type === 'financial' ? 'bg-amber-100 text-amber-800' :
                            ev.type === 'treatment_plan' ? 'bg-blue-100 text-blue-800' :
                            ev.type === 'appointment' ? 'bg-purple-100 text-purple-800' :
                            ev.type === 'file' ? 'bg-teal-100 text-teal-800' :
                            'bg-stone-200 text-stone-800'
                          }`}>
                            {ev.categoryTag}
                          </span>

                          {ev.toothNumber && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#f0f0e8] text-[#5a5a40] border border-[#e5e5d1]">
                              Dente #{ev.toothNumber}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-[11px] text-stone-500 font-mono">
                          <span className="flex items-center gap-1 font-bold text-stone-800">
                            <Calendar className="w-3 h-3 text-[#d4a373]" /> {ev.date}
                          </span>
                          {ev.professionalName && (
                            <span className="text-stone-600">({ev.professionalName})</span>
                          )}
                        </div>
                      </div>

                      {/* Image Preview if type is file */}
                      {ev.imageUrl && (
                        <div className="mt-2 rounded-xl overflow-hidden border border-[#e5e5d1] max-w-xs bg-black/5">
                          <img
                            src={ev.imageUrl}
                            alt={ev.title}
                            className="w-full max-h-48 object-cover rounded-xl"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      )}

                      {/* Subtitle & Details */}
                      {ev.subtitle && (
                        <p className="text-[11px] font-medium text-amber-800 italic">
                          {ev.subtitle}
                        </p>
                      )}

                      {ev.details && (
                        <p className="text-xs text-stone-700 leading-relaxed whitespace-pre-wrap bg-white p-2.5 rounded-xl border border-[#e5e5d1]">
                          {ev.details}
                        </p>
                      )}

                      {/* Amount Footer if present */}
                      {ev.amount !== undefined && ev.amount > 0 && (
                        <div className="text-right pt-1">
                          <span className="text-xs font-mono font-bold text-stone-800 bg-[#f0f0e8] px-3 py-1 rounded-full border border-[#e5e5d1]">
                            Valor: R$ {ev.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* INFORMAÇÕES E JUSTIFICATIVAS AO PACIENTE ASSISTIDO */}
          <div className="bg-[#fbfbf9] border border-[#e5e5d1] rounded-2xl p-4 space-y-2.5 text-xs shadow-2xs print:border-stone-300 print:bg-white print:break-inside-avoid">
            <div className="flex items-center gap-2 text-[#5a5a40] font-bold uppercase tracking-wider text-[11px] border-b border-[#e5e5d1] pb-2">
              <ShieldCheck className="w-4 h-4 text-[#d4a373] shrink-0" />
              <span>Informações aos Pacientes Assistidos e Justificativas de Atendimento</span>
            </div>
            
            <p className="text-stone-700 leading-relaxed text-xs text-justify bg-white p-3 rounded-xl border border-[#e5e5d1] print:border-none print:p-0 whitespace-pre-wrap">
              {clinicInfo.patientAssistedJustificationText || 'Ficam prestadas as informações aos pacientes assistidos que justifiquem a recusa do atendimento, a interrupção do tratamento ou o tempo mais longo para a conclusão do tratamento, em razão da complexidade do caso, da finalidade pedagógica, do estágio de formação em que o profissional se encontre em relação às habilidades e aos conhecimentos que o caso clínico demande, ou mesmo delonga em razão de casos fortuitos que forçam a paralisação dos atendimentos nas clínicas da instituição.'}
            </p>

            {customJustificationNote && (
              <div className="bg-[#f0f0e8] p-2.5 rounded-xl border border-[#e5e5d1] text-xs text-stone-800">
                <strong className="font-semibold text-[#5a5a40]">Observação Complementar:</strong> {customJustificationNote}
              </div>
            )}
          </div>

          {/* Document Footer Signature Component */}
          <div className="pt-6 border-t-2 border-[#5a5a40] print:break-inside-avoid">
            <DocumentSignatureFooter documentTitle={getReportTitle()} />
          </div>
        </div>
      </div>
    </div>
  );
};
