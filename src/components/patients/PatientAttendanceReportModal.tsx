import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { getThemeStyles } from '../../utils/themeUtils';
import { Patient } from '../../types';
import { formatCPF } from '../../utils/formatters';
import { DocumentSignatureFooter } from '../common/DocumentSignatureFooter';
import { printDocumentWithTitle } from '../../utils/printUtils';
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
  ArrowLeft,
  Share2,
  AlertTriangle,
  Heart,
  Activity,
  Pill,
  Moon,
  Shield,
  HelpCircle,
  Thermometer,
  Zap,
  Info
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

    // 0. Prontuário Médico e Anamnese Integrada
    if (patient.anamnesis) {
      const anamDate = patient.createdAt ? patient.createdAt.split('T')[0] : new Date().toISOString().split('T')[0];
      const key = `anam_${patient.id}`;
      const anam = patient.anamnesis;
      
      const alertsSummary = [
        anam.hasAllergies && `Alergias: ${anam.allergyDetails || 'Presente'}`,
        anam.takesContinuousMedication && `Medicações: ${anam.continuousMedicationDetails || 'Em uso'}`,
        anam.takesBisphosphonates && 'Uso de Bisfosfonatos (Alerta Risco de Osteonecrose)',
        anam.takesAnticoagulants && 'Uso de Anticoagulantes (Risco Hemorrágico)',
        anam.hasHypertension && 'Hipertensão Arterial',
        anam.hasDiabetes && 'Diabetes Mellitus',
        anam.hasHeartDisease && 'Cardiopatia / Risco Cardíaco',
        anam.hasPacemaker && 'Portador de Marca-passo Cardíaco',
        anam.hasBleedingTendency && 'Tendência a Sangramento Prolongado',
        anam.hasAnesthesiaReaction && `Reação Anestésica: ${anam.anesthesiaReactionDetails || 'Relatada'}`,
        anam.isSmoker && `Ex-fumante / Tabagista (${anam.smokingFrequency || 'Registrado'})`,
        anam.usesRecreationalDrugs && `Substâncias Recreativas: ${anam.drugDetails || 'Registrado'} (${anam.drugUsageFrequency || ''})`
      ].filter(Boolean).join(' • ');

      eventMap.set(key, {
        id: key,
        type: 'document',
        date: anamDate,
        timestamp: parseTimestamp(patient.createdAt || anamDate) + 500,
        title: 'Prontuário Médico e Histórico Clínico Completo',
        subtitle: 'Anamnese Geral, Condições Sistêmicas, Alertas e Hábitos',
        details: alertsSummary ? `Alertas Clínicos: ${alertsSummary}` : 'Prontuário médico e histórico clínico completo cadastrado.',
        professionalName: clinicInfo.dentistName || 'Dr. Hugo Andres',
        categoryTag: 'Prontuário / Anamnese'
      });
    }

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
    printDocumentWithTitle({
      docTitle: getReportTitle(),
      patientName: patient.name,
      date: new Date()
    });
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

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 z-50 bg-stone-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto print:p-0 print:bg-white print:static print:inset-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white border border-[#e5e5d1] rounded-[32px] max-w-4xl w-full p-6 shadow-2xl space-y-6 my-auto print:border-none print:shadow-none print:rounded-none print:max-w-none print:w-full print:p-0 relative">
        
        {/* Modal Action Header (Sticky at top of modal, Hidden in Print) */}
        <div className="sticky -top-6 z-30 bg-white/95 backdrop-blur-md -mt-6 -mx-6 px-6 pt-5 pb-4 border-b border-[#e5e5d1] rounded-t-[32px] flex flex-wrap items-center justify-between gap-3 print:hidden shadow-xs">
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
              className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs rounded-2xl flex items-center gap-1.5 shadow-xs transition cursor-pointer border border-[#e5e5d1] active:scale-95"
              title="Voltar para a ficha do paciente"
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
              className="p-2 text-gray-400 hover:text-stone-800 rounded-xl transition cursor-pointer"
              title="Fechar janela"
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
              { id: 'prontuario', label: `Prontuário / Anamnese (${timelineEvents.filter(e => e.categoryTag === 'Prontuário / Anamnese').length})` },
              { id: 'evolution', label: `Evoluções (${timelineEvents.filter(e => e.type === 'evolution').length})` },
              { id: 'financial', label: `Financeiro (${timelineEvents.filter(e => e.type === 'financial').length})` },
              { id: 'treatment_plan', label: `Planos (${timelineEvents.filter(e => e.type === 'treatment_plan').length})` },
              { id: 'appointment', label: `Consultas (${timelineEvents.filter(e => e.type === 'appointment').length})` },
              { id: 'document', label: `Documentos (${timelineEvents.filter(e => e.type === 'document' && e.categoryTag !== 'Prontuário / Anamnese').length})` },
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

          {/* PRONTUÁRIO MÉDICO E HISTÓRICO CLÍNICO COMPLETO (ANAMNESE INTEGRADA) */}
          {patient.anamnesis && (activeFilter === 'todos' || activeFilter === 'prontuario') && (
            <div className="bg-[#fbfbf9] border border-[#e5e5d1] rounded-2xl p-4.5 space-y-4 text-xs shadow-2xs print:border-stone-300 print:bg-white print:break-inside-avoid">
              <div className="flex items-center justify-between border-b border-[#e5e5d1] pb-2.5">
                <h3 className="text-xs font-bold text-[#5a5a40] uppercase tracking-wider flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-[#d4a373]" />
                  Prontuário Médico e Histórico Clínico Completo (Anamnese Odontológica)
                </h3>
                <span className="text-[10px] font-mono bg-[#f0f0e8] text-[#5a5a40] px-2.5 py-0.5 rounded-full font-bold border border-[#e5e5d1]">
                  Registro Clínico Ativo
                </span>
              </div>

              {/* 1. QUADRO DE ALERTAS CRÍTICOS & RISCO CIRÚRGICO/ANESTÉSICO */}
              <div className="space-y-2">
                <span className="text-[10.5px] font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  Alertas Sistêmicos, Alergias e Riscos Clínicos:
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {/* Alergias */}
                  <div className={`p-2.5 rounded-xl border ${patient.anamnesis.hasAllergies ? 'bg-rose-50/80 border-rose-200 text-rose-900' : 'bg-white border-[#e5e5d1] text-stone-700'}`}>
                    <strong className="block text-[11px]">Alergias / Intolerâncias:</strong>
                    <span className="text-[11.5px] font-medium">
                      {patient.anamnesis.hasAllergies ? `SIM: ${patient.anamnesis.allergyDetails || 'Presente'}` : 'Não relatadas'}
                    </span>
                  </div>

                  {/* Bisfosfonatos */}
                  <div className={`p-2.5 rounded-xl border ${patient.anamnesis.takesBisphosphonates ? 'bg-rose-50/80 border-rose-200 text-rose-900 font-bold' : 'bg-white border-[#e5e5d1] text-stone-700'}`}>
                    <strong className="block text-[11px]">Uso de Bisfosfonatos:</strong>
                    <span className="text-[11.5px] font-medium">
                      {patient.anamnesis.takesBisphosphonates ? `SIM (Risco de Osteonecrose): ${patient.anamnesis.bisphosphonatesDetails || 'Em uso'}` : 'Não faz uso'}
                    </span>
                  </div>

                  {/* Anticoagulantes */}
                  <div className={`p-2.5 rounded-xl border ${patient.anamnesis.takesAnticoagulants ? 'bg-amber-50 border-amber-200 text-amber-900 font-bold' : 'bg-white border-[#e5e5d1] text-stone-700'}`}>
                    <strong className="block text-[11px]">Uso de Anticoagulantes:</strong>
                    <span className="text-[11.5px] font-medium">
                      {patient.anamnesis.takesAnticoagulants ? `SIM (Risco Hemorrágico): ${patient.anamnesis.anticoagulantsDetails || 'Em uso'}` : 'Não faz uso'}
                    </span>
                  </div>

                  {/* Hipertensão & Diabetes */}
                  <div className="bg-white p-2.5 rounded-xl border border-[#e5e5d1] text-stone-700">
                    <strong className="block text-[11px]">Condições Cardiovasculares e Metabólicas:</strong>
                    <span className="text-[11.5px] font-medium">
                      {[
                        patient.anamnesis.hasHypertension ? 'Hipertensão Arterial' : null,
                        patient.anamnesis.hasDiabetes ? 'Diabetes Mellitus' : null,
                        patient.anamnesis.hasHeartDisease ? 'Cardiopatia' : null,
                        patient.anamnesis.hasPacemaker ? 'Marca-passo' : null
                      ].filter(Boolean).join(', ') || 'Nenhuma alteração relatada'}
                    </span>
                  </div>

                  {/* Reações a Anestésicos */}
                  <div className={`p-2.5 rounded-xl border ${patient.anamnesis.hasAnesthesiaReaction ? 'bg-rose-50/80 border-rose-200 text-rose-900 font-bold' : 'bg-white border-[#e5e5d1] text-stone-700'}`}>
                    <strong className="block text-[11px]">Reação a Anestésicos Locais:</strong>
                    <span className="text-[11.5px] font-medium">
                      {patient.anamnesis.hasAnesthesiaReaction ? `SIM: ${patient.anamnesis.anesthesiaReactionDetails || 'Relatada'}` : 'Nenhuma reação adversa'}
                    </span>
                  </div>

                  {/* Medicamentos de Uso Contínuo */}
                  <div className="bg-white p-2.5 rounded-xl border border-[#e5e5d1] text-stone-700">
                    <strong className="block text-[11px]">Medicações Contínuas:</strong>
                    <span className="text-[11.5px] font-medium">
                      {patient.anamnesis.takesContinuousMedication ? patient.anamnesis.continuousMedicationDetails || 'Em uso' : 'Nenhuma medicação contínua'}
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. HÁBITOS, EX-TABAGISMO E SUBSTÂNCIAS RECREATIVAS */}
              <div className="space-y-2 pt-2 border-t border-[#e5e5d1]">
                <span className="text-[10.5px] font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Moon className="w-3.5 h-3.5 text-indigo-600" />
                  Hábitos, Substâncias, Padrão de Sono e Respiração:
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {/* Bloco Ex-fumante / Tabagismo */}
                  <div className={`p-3 rounded-xl border ${patient.anamnesis.isSmoker ? 'bg-amber-50/60 border-amber-200' : 'bg-white border-[#e5e5d1]'}`}>
                    <div className="flex items-center justify-between">
                      <strong className="text-xs text-stone-900">É ex-fumante / ex-tabagista?</strong>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${patient.anamnesis.isSmoker ? 'bg-amber-200 text-amber-900' : 'bg-emerald-100 text-emerald-800'}`}>
                        {patient.anamnesis.isSmoker ? 'SIM' : 'NÃO'}
                      </span>
                    </div>
                    {patient.anamnesis.isSmoker && (
                      <div className="mt-2 text-[11.5px] space-y-1 text-stone-800">
                        <p><strong>Padrão / Frequência:</strong> {
                          patient.anamnesis.smokingFrequency === 'social' ? 'Socialmente / Ocasional' :
                          patient.anamnesis.smokingFrequency === 'diario_ate_10' ? 'Diário (até 10 cigarros/dia)' :
                          patient.anamnesis.smokingFrequency === 'diario_10_20' ? 'Diário (10 a 20 cigarros/dia)' :
                          patient.anamnesis.smokingFrequency === 'diario_mais_20' ? 'Diário (mais de 20 cigarros/dia - Carga alta)' :
                          patient.anamnesis.smokingFrequency === 'vape_eletronico' ? 'Pod / Vape / Cigarro Eletrônico' :
                          patient.anamnesis.smokingFrequency === 'ex_fumante' ? 'Ex-fumante' :
                          patient.anamnesis.smokingFrequency || 'Não especificado'
                        }</p>
                        {patient.anamnesis.smokingDetails && (
                          <p><strong>Detalhes / Tempo:</strong> {patient.anamnesis.smokingDetails}</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Bloco Uso de Drogas / Substâncias Recreativas */}
                  <div className={`p-3 rounded-xl border ${patient.anamnesis.usesRecreationalDrugs ? 'bg-rose-50/70 border-rose-200' : 'bg-white border-[#e5e5d1]'}`}>
                    <div className="flex items-center justify-between">
                      <strong className="text-xs text-stone-900">Uso de Drogas / Substâncias Recreativas:</strong>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${patient.anamnesis.usesRecreationalDrugs ? 'bg-rose-600 text-white' : 'bg-emerald-100 text-emerald-800'}`}>
                        {patient.anamnesis.usesRecreationalDrugs ? 'SIM (Registrado)' : 'NÃO'}
                      </span>
                    </div>
                    {patient.anamnesis.usesRecreationalDrugs && (
                      <div className="mt-2 text-[11.5px] space-y-1 text-stone-800">
                        <p>
                          <strong>Substância(s) utilizada(s):</strong>{' '}
                          <span className="font-semibold text-rose-900">{patient.anamnesis.drugDetails || 'Não detalhadas'}</span>
                        </p>
                        <p>
                          <strong>Frequência do Uso:</strong>{' '}
                          <span className="capitalize">{
                            patient.anamnesis.drugUsageFrequency === 'ocasional_social' ? 'Ocasional / Social' :
                            patient.anamnesis.drugUsageFrequency === 'semanal' ? 'Uso Semanal' :
                            patient.anamnesis.drugUsageFrequency === 'diario' ? 'Uso Diário / Frequente' :
                            patient.anamnesis.drugUsageFrequency === 'ex_usuario' ? 'Ex-usuário' :
                            patient.anamnesis.drugUsageFrequency || 'Não especificada'
                          }</span>
                        </p>
                        {patient.anamnesis.drugUsageNotes && (
                          <p className="text-rose-900 font-medium">
                            <strong>Observações / Risco Anestésico:</strong> {patient.anamnesis.drugUsageNotes}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Sono, Água e DTM */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-1">
                  <div className="bg-white p-2 rounded-lg border border-[#e5e5d1]">
                    <span className="text-stone-500 block text-[10px]">Ingestão Hídrica:</span>
                    <strong className="text-stone-800 capitalize">{patient.anamnesis.waterIntakeFrequency || 'Normal'}</strong>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-[#e5e5d1]">
                    <span className="text-stone-500 block text-[10px]">Sono / Respiração:</span>
                    <strong className="text-stone-800">{patient.anamnesis.sleepHoursPerNight || '8'}h / {patient.anamnesis.breathingType || 'Nasal'}</strong>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-[#e5e5d1]">
                    <span className="text-stone-500 block text-[10px]">Bruxismo / Parafunção:</span>
                    <strong className="text-stone-800">{patient.anamnesis.hasBruxism ? 'SIM' : 'NÃO'}</strong>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-[#e5e5d1]">
                    <span className="text-stone-500 block text-[10px]">Escala EVA de Dor:</span>
                    <strong className="text-stone-800 font-mono font-bold">{patient.anamnesis.painEvaScore ?? 0} / 10</strong>
                  </div>
                </div>
              </div>

              {/* 3. HISTÓRICO ODONTOLÓGICO, QUEIXA PRINCIPAL E ORIENTAÇÕES */}
              <div className="space-y-2 pt-2 border-t border-[#e5e5d1]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11.5px]">
                  <div className="bg-white p-2.5 rounded-xl border border-[#e5e5d1]">
                    <strong className="text-[#5a5a40] block mb-1">Queixa Principal / Motivo da Consulta:</strong>
                    <p className="text-stone-800 italic">
                      "{patient.anamnesis.chiefComplaint || 'Atendimento odontológico de rotina e avaliação clínica.'}"
                    </p>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-[#e5e5d1]">
                    <strong className="text-[#5a5a40] block mb-1">Higiene Bucal & Hábitos Odontológicos:</strong>
                    <p className="text-stone-800">
                      Escovação: <strong>{patient.anamnesis.brushingFrequency || '2 a 3 vezes/dia'}</strong> • Fio Dental: <strong>{patient.anamnesis.usesDentalFloss ? 'Sim' : 'Não'}</strong> • Prótese/Aparelho: <strong>{patient.anamnesis.usesDentalProsthesis ? 'Prótese' : (patient.anamnesis.orthodonticTreatment ? 'Ortodontia' : 'Nenhum')}</strong>
                    </p>
                  </div>
                </div>

                {patient.anamnesis.notes && (
                  <div className="bg-[#f0f0e8] p-2.5 rounded-xl border border-[#e5e5d1] text-xs text-stone-800">
                    <strong className="font-semibold text-[#5a5a40]">Orientações e Conduta Clínica Registrada:</strong> {patient.anamnesis.notes}
                  </div>
                )}
              </div>
            </div>
          )}

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

          {/* BOTTOM ACTIONS BAR (HIDDEN IN PRINT) */}
          <div className="pt-6 border-t border-[#e5e5d1] flex flex-wrap items-center justify-between gap-3 print:hidden">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs rounded-2xl flex items-center gap-2 shadow-xs transition cursor-pointer border border-[#e5e5d1] active:scale-95"
            >
              <ArrowLeft className="w-4 h-4 text-[#5a5a40]" />
              <span>Voltar ao Prontuário</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSendWhatsApp}
                className="px-4 py-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs rounded-2xl flex items-center gap-1.5 shadow-xs transition cursor-pointer"
              >
                <Send className="w-4 h-4 text-white" />
                <span>Enviar no WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="px-5 py-2.5 bg-amber-400 hover:bg-amber-500 text-stone-900 font-bold text-xs rounded-2xl flex items-center gap-1.5 shadow-xs transition cursor-pointer border border-amber-500/30 active:scale-95"
              >
                <Printer className="w-4 h-4 text-stone-900" />
                <span>Imprimir</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
