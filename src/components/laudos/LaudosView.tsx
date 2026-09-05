import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  FileCheck2, 
  ArrowLeft, 
  Search, 
  Printer, 
  Share2, 
  Copy, 
  Check, 
  Building, 
  Stethoscope, 
  User, 
  Calendar, 
  Filter, 
  Plus, 
  AlertCircle, 
  AlertTriangle,
  HelpCircle,
  Phone, 
  FileSignature, 
  Scan, 
  Activity, 
  CheckCircle2,
  Sparkles,
  ChevronDown,
  HeartPulse,
  ShieldAlert,
  FileText,
  Pill,
  Clock,
  Eye,
  CheckCircle,
  MapPin,
  Mail,
  Globe
} from 'lucide-react';
import { Patient, ClinicUnit, Professional, ClinicalEvolutionEntry, ToothCondition, TreatmentPlan } from '../../types';
import { formatCPF, formatCEP } from '../../utils/formatters';
import { 
  LaudoAttendanceCard, 
  ConsolidatedAttendanceData
} from './LaudoAttendanceCard';
import { 
  SeverityLevel,
  SEVERITY_WEIGHT,
  SEVERITY_CONFIG,
  formatTechnicalDentalTerm,
  getConditionTechnicalLabel,
  consolidateOdontogramConditions,
  getProcedureSeverity,
  ConsolidatedToothFinding
} from '../../utils/dentalConditions';
import { LaudoStampSignature } from './LaudoStampSignature';
import { TreatmentPlanConsentModal } from './TreatmentPlanConsentModal';

// Calculate age helper
const calculateAge = (birthDateString?: string): string => {
  if (!birthDateString) return '';
  try {
    const parts = birthDateString.includes('/') 
      ? birthDateString.split('/') 
      : birthDateString.split('-');
    let birthDate: Date;
    if (birthDateString.includes('/')) {
      birthDate = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
    } else {
      birthDate = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    }
    if (isNaN(birthDate.getTime())) return '';
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return `${age} anos`;
  } catch {
    return '';
  }
};

export const LaudosView: React.FC = () => {
  const { 
    clinics, 
    professionals, 
    patients, 
    appointments, 
    clinicalEvolutions, 
    prescriptions, 
    treatmentPlans, 
    clinicalExams, 
    odontograms, 
    clinicInfo, 
    activeClinicId, 
    activeProfessionalId,
    setActiveTab,
    addClinicalEvolution
  } = useApp();

  // 1. FILTERS & SELECTION STATE
  const [selectedClinicId, setSelectedClinicId] = useState<string>('todas');
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<string>('todos');
  const [selectedPatientId, setSelectedPatientId] = useState<string>(() => patients[0]?.id || '');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'concluido' | 'em_atendimento'>('todos');
  const [periodFilter, setPeriodFilter] = useState<'todos' | 'hoje' | '7dias' | '30dias'>('todos');

  // Mode: Full Detailed Report (Default) or Summary
  const [viewMode, setViewMode] = useState<'completo' | 'resumido'>('completo');

  // Print selection state (Pre-selected true for each attendance ID)
  const [selectedAttendanceForPrint, setSelectedAttendanceForPrint] = useState<Record<string, boolean>>({});
  
  // Severity overrides state per attendance
  const [severities, setSeverities] = useState<Record<string, SeverityLevel>>({});

  // UI Modals & Actions state
  const [isConsentModalOpen, setIsConsentModalOpen] = useState(false);
  const [isAddEvolutionModalOpen, setIsAddEvolutionModalOpen] = useState(false);
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  // New quick attendance form state
  const [newProcedure, setNewProcedure] = useState('');
  const [newToothNumber, setNewToothNumber] = useState<number | ''>('');
  const [newDescription, setNewDescription] = useState('');

  // 2. SORTED CLINICS & PROFESSIONALS (Alphabetical order guaranteed)
  const sortedClinics = useMemo(() => {
    return [...clinics].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  }, [clinics]);

  const sortedProfessionals = useMemo(() => {
    return [...professionals].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  }, [professionals]);

  // 3. FILTERED PATIENTS LIST
  // When clinic is selected, show patients attended by that clinic (or all if 'todas')
  // When professional is selected, show patients attended by that professional
  const filteredPatients = useMemo(() => {
    return patients.filter((patient) => {
      // Check clinic filter
      if (selectedClinicId !== 'todas') {
        const hasApptAtClinic = appointments.some(
          (a) => a.patientId === patient.id && a.clinicId === selectedClinicId
        );
        const hasPrefClinic = patient.preferredClinicId === selectedClinicId;
        const hasEvoAtClinic = clinicalEvolutions.some(
          (e) => e.patientId === patient.id && e.clinicName?.toLowerCase().includes(
            (clinics.find(c => c.id === selectedClinicId)?.name || '').toLowerCase()
          )
        );
        if (!hasApptAtClinic && !hasPrefClinic && !hasEvoAtClinic) return false;
      }

      // Check professional filter
      if (selectedProfessionalId !== 'todos') {
        const hasApptWithProf = appointments.some(
          (a) => a.patientId === patient.id && (a.professionalId === selectedProfessionalId || a.dentistName?.toLowerCase().includes(
            (professionals.find(p => p.id === selectedProfessionalId)?.name || '').toLowerCase()
          ))
        );
        const hasEvoWithProf = clinicalEvolutions.some(
          (e) => e.patientId === patient.id && e.dentistName?.toLowerCase().includes(
            (professionals.find(p => p.id === selectedProfessionalId)?.name || '').toLowerCase()
          )
        );
        if (!hasApptWithProf && !hasEvoWithProf) return false;
      }

      return true;
    });
  }, [patients, selectedClinicId, selectedProfessionalId, appointments, clinicalEvolutions, clinics, professionals]);

  // Active patient object
  const activePatient = useMemo(() => {
    const found = patients.find((p) => p.id === selectedPatientId);
    return found || filteredPatients[0] || patients[0] || null;
  }, [patients, selectedPatientId, filteredPatients]);

  // Active Clinic Unit
  const activeClinicEntity = useMemo(() => {
    if (selectedClinicId !== 'todas') {
      return clinics.find(c => c.id === selectedClinicId) || null;
    }
    if (activeClinicId) {
      return clinics.find(c => c.id === activeClinicId) || null;
    }
    return clinics[0] || null;
  }, [selectedClinicId, activeClinicId, clinics]);

  // Active Professional
  const activeProfessionalEntity = useMemo(() => {
    if (selectedProfessionalId !== 'todos') {
      return professionals.find(p => p.id === selectedProfessionalId) || null;
    }
    if (activeProfessionalId) {
      return professionals.find(p => p.id === activeProfessionalId) || null;
    }
    return professionals[0] || null;
  }, [selectedProfessionalId, activeProfessionalId, professionals]);

  // Patient Odontogram Findings
  const patientOdontogramFindings = useMemo(() => {
    if (!activePatient || !odontograms) return [];
    const conditions = odontograms[activePatient.id];
    return Array.isArray(conditions) ? conditions : [];
  }, [activePatient, odontograms]);

  // Patient Comprehensive Treatment Plan
  const patientActivePlan = useMemo(() => {
    if (!activePatient || !Array.isArray(treatmentPlans)) return null;
    return treatmentPlans.find(tp => tp.patientId === activePatient.id) || null;
  }, [activePatient, treatmentPlans]);

  // Patient Clinical Exam
  const patientExam = useMemo(() => {
    if (!activePatient || !clinicalExams) return null;
    return clinicalExams[activePatient.id] || null;
  }, [activePatient, clinicalExams]);

  // Data da última intervenção do paciente ativo
  const lastInterventionDate = useMemo(() => {
    if (!activePatient) return null;
    const dates: string[] = [];

    if (Array.isArray(clinicalEvolutions)) {
      clinicalEvolutions
        .filter(e => e.patientId === activePatient.id && e.date)
        .forEach(e => dates.push(e.date));
    }
    if (Array.isArray(appointments)) {
      appointments
        .filter(a => a.patientId === activePatient.id && a.date && a.status === 'concluido')
        .forEach(a => dates.push(a.date));
    }
    if (Array.isArray(treatmentPlans)) {
      treatmentPlans
        .filter(tp => tp.patientId === activePatient.id && tp.date)
        .forEach(tp => dates.push(tp.date));
    }

    if (dates.length === 0) return null;
    dates.sort((a, b) => b.localeCompare(a));
    const mostRecent = dates[0];
    try {
      const parts = mostRecent.split('-');
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
      return mostRecent;
    } catch {
      return mostRecent;
    }
  }, [activePatient, clinicalEvolutions, appointments, treatmentPlans]);

  // Tratamentos realizados consolidados (sem duplicações de hígido, agrupado por dente)
  const consolidatedTreatments = useMemo(() => {
    if (!patientOdontogramFindings || patientOdontogramFindings.length === 0) {
      return [];
    }
    return consolidateOdontogramConditions(patientOdontogramFindings);
  }, [patientOdontogramFindings]);

  // Consolidação integral de todas as necessidades em ordem decrescente de severidade
  const consolidatedTreatmentNeeds = useMemo(() => {
    if (!activePatient) return [];

    interface NeedItem {
      id: string;
      toothNumber?: number;
      procedureName: string;
      specialty: string;
      tussCode?: string;
      severity: SeverityLevel;
      status: 'concluido' | 'proposto' | 'em_andamento';
      cost?: number;
    }

    const needs: NeedItem[] = [];
    const registeredToothNumbers = new Set<number>();

    // 1. Procedimentos do plano de tratamento ativo
    if (patientActivePlan && Array.isArray(patientActivePlan.items)) {
      patientActivePlan.items.forEach((item, idx) => {
        const sev = getProcedureSeverity(item.procedureName, item.specialty);
        if (item.toothNumber) registeredToothNumbers.add(item.toothNumber);
        needs.push({
          id: item.id || `plan-item-${idx}`,
          toothNumber: item.toothNumber,
          procedureName: formatTechnicalDentalTerm(item.procedureName),
          specialty: item.specialty || 'Clínica Geral',
          tussCode: item.tussCode || '81000030',
          severity: sev,
          status: item.status || 'proposto',
          cost: item.finalCost || item.cost
        });
      });
    }

    // 2. Achados patológicos do odontograma que requerem intervenção
    if (Array.isArray(patientOdontogramFindings)) {
      patientOdontogramFindings.forEach((finding) => {
        const tooth = finding.toothNumber;
        if (!tooth || registeredToothNumbers.has(tooth)) return;

        const whole = finding.wholeToothCondition;
        const surfaces = Object.entries(finding.surfaces || {}).filter(([_, type]) => type && type !== 'sio');

        if (whole === 'carie' || surfaces.some(([_, type]) => type === 'carie')) {
          needs.push({
            id: `odonto-need-carie-${tooth}`,
            toothNumber: tooth,
            procedureName: 'Restauração em Resina Composta Fotopolimerizável',
            specialty: 'Dentística Restauradora',
            tussCode: '85100049',
            severity: 'moderado',
            status: 'proposto'
          });
          registeredToothNumbers.add(tooth);
        } else if (whole === 'necessidade_endodontica' || whole === 'canal' || whole === 'endodontia_insatisfatoria') {
          needs.push({
            id: `odonto-need-endo-${tooth}`,
            toothNumber: tooth,
            procedureName: 'Tratamento Endodôntico de Elemento Dentário',
            specialty: 'Endodontia',
            tussCode: '85200027',
            severity: 'critico',
            status: 'proposto'
          });
          registeredToothNumbers.add(tooth);
        } else if (whole === 'extracao_indicada') {
          needs.push({
            id: `odonto-need-extra-${tooth}`,
            toothNumber: tooth,
            procedureName: 'Exodontia de Dente Permanente / Cirurgia Oral Menor',
            specialty: 'Cirurgia',
            tussCode: '85400018',
            severity: 'alto',
            status: 'proposto'
          });
          registeredToothNumbers.add(tooth);
        } else if (whole === 'restauracao_insatisfatoria' || surfaces.some(([_, type]) => type === 'restauracao_insatisfatoria')) {
          needs.push({
            id: `odonto-need-rest-insat-${tooth}`,
            toothNumber: tooth,
            procedureName: 'Substituição de Restauração Insatisfatória',
            specialty: 'Dentística Restauradora',
            tussCode: '85100049',
            severity: 'moderado',
            status: 'proposto'
          });
          registeredToothNumbers.add(tooth);
        } else if (finding.hasCalculoSub) {
          needs.push({
            id: `odonto-need-perio-${tooth}`,
            toothNumber: tooth,
            procedureName: 'Raspagem e Alisamento Coronorradicular / Terapia Periodontal',
            specialty: 'Periodontia',
            tussCode: '85300013',
            severity: 'alto',
            status: 'proposto'
          });
          registeredToothNumbers.add(tooth);
        }
      });
    }

    // Ordenar em ordem decrescente de severidade: Crítico (4) -> Alto (3) -> Moderado (2) -> Baixo (1)
    return needs.sort((a, b) => {
      const weightDiff = (SEVERITY_WEIGHT[b.severity] || 1) - (SEVERITY_WEIGHT[a.severity] || 1);
      if (weightDiff !== 0) return weightDiff;
      return (a.toothNumber || 99) - (b.toothNumber || 99);
    });
  }, [activePatient, patientActivePlan, patientOdontogramFindings]);

  // 4. CONSOLIDATED ATTENDANCES BUILDER (Sequential Chronological Engine)
  const consolidatedAttendances = useMemo(() => {
    if (!activePatient) return [];

    // Filter patient specific data safely
    const patientAppts = Array.isArray(appointments) ? appointments.filter(a => a.patientId === activePatient.id) : [];
    const patientEvos = Array.isArray(clinicalEvolutions) ? clinicalEvolutions.filter(e => e.patientId === activePatient.id) : [];
    const patientPrescs = Array.isArray(prescriptions) ? prescriptions.filter(p => p.patientId === activePatient.id) : [];
    const patientPlans = Array.isArray(treatmentPlans) ? treatmentPlans.filter(tp => tp.patientId === activePatient.id) : [];
    const patientExamRecord = clinicalExams ? clinicalExams[activePatient.id] : null;
    const patientOdonto = (odontograms && Array.isArray(odontograms[activePatient.id])) ? odontograms[activePatient.id] : [];

    // Group items by date (YYYY-MM-DD)
    const datesMap = new Map<string, {
      appts: typeof patientAppts;
      evos: typeof patientEvos;
      prescs: typeof patientPrescs;
      exam?: typeof patientExamRecord;
    }>();

    // Helper to add item to date bucket
    const addToDate = (dateStr: string, itemType: 'appts' | 'evos' | 'prescs' | 'exam', item: any) => {
      if (!dateStr) return;
      const normalizedDate = dateStr.slice(0, 10);
      if (!datesMap.has(normalizedDate)) {
        datesMap.set(normalizedDate, { appts: [], evos: [], prescs: [] });
      }
      const entry = datesMap.get(normalizedDate)!;
      if (itemType === 'appts') entry.appts.push(item);
      else if (itemType === 'evos') entry.evos.push(item);
      else if (itemType === 'prescs') entry.prescs.push(item);
      else if (itemType === 'exam') entry.exam = item;
    };

    // Populate map with patient events
    patientAppts.forEach(a => addToDate(a.date, 'appts', a));
    patientEvos.forEach(e => addToDate(e.date, 'evos', e));
    patientPrescs.forEach(p => addToDate(p.date, 'prescs', p));
    if (patientExamRecord && patientExamRecord.date) {
      addToDate(patientExamRecord.date, 'exam', patientExamRecord);
    }

    // If patient has zero recorded events, create an initial entry
    if (datesMap.size === 0) {
      const todayStr = new Date().toISOString().split('T')[0];
      datesMap.set(todayStr, {
        appts: [{
          id: `appt-init-${activePatient.id}`,
          patientId: activePatient.id,
          patientName: activePatient.name,
          patientPhone: activePatient.phone,
          dentistName: activeProfessionalEntity?.name || 'Dr. Hugo Andres Iglesias Ricoy',
          clinicName: activeClinicEntity?.name || 'DentisPro Odontologia Especializada',
          date: todayStr,
          time: '09:00',
          durationMinutes: 45,
          procedure: 'Consulta Inicial / Diagnóstico e Plano de Tratamento',
          status: 'concluido'
        }],
        evos: [{
          id: `evo-init-${activePatient.id}`,
          patientId: activePatient.id,
          date: todayStr,
          dentistName: activeProfessionalEntity?.name || 'Dr. Hugo Andres Iglesias Ricoy',
          clinicName: activeClinicEntity?.name || 'DentisPro Odontologia Especializada',
          procedure: 'Anamnese Completa e Exame Clínico Odontológico',
          description: 'Realizada anamnese detalhada, inspeção extra e intraoral de tecidos moles e duros. Paciente orientado sobre o plano de tratamento proposto.',
          status: 'concluido'
        }],
        prescs: []
      });
    }

    // Build consolidated list
    const list: ConsolidatedAttendanceData[] = [];

    datesMap.forEach((data, dateKey) => {
      const primaryAppt = data.appts[0];
      const primaryEvo = data.evos[0];

      // Resolved dentist and clinic details
      const dentistName = primaryEvo?.dentistName || primaryAppt?.dentistName || activeProfessionalEntity?.name || 'Dr. Hugo Andres Iglesias Ricoy';
      const clinicName = primaryEvo?.clinicName || primaryAppt?.clinicName || activeClinicEntity?.name || 'DentisPro Odontologia Especializada';

      const foundProf = professionals.find(p => p.name.toLowerCase() === dentistName.toLowerCase()) || activeProfessionalEntity;
      const foundClinic = clinics.find(c => c.name.toLowerCase().includes(clinicName.toLowerCase())) || activeClinicEntity;

      // Status
      let status: ConsolidatedAttendanceData['status'] = 'concluido';
      if (primaryAppt?.status) {
        if (primaryAppt.status === 'concluido') status = 'concluido';
        else if (primaryAppt.status === 'em_atendimento') status = 'em_atendimento';
        else if (primaryAppt.status === 'confirmado') status = 'confirmado';
        else status = 'agendado';
      }

      // Anamnesis highlights
      const highlights: string[] = [];
      if (activePatient?.anamnesis?.hasAllergies) highlights.push(`Alergia relatada: ${activePatient.anamnesis.allergyDetails || 'Presente'}`);
      if (activePatient?.anamnesis?.hasHypertension) highlights.push('Hipertensão arterial sistêmica');
      if (activePatient?.anamnesis?.hasDiabetes) highlights.push('Diabetes Mellitus');
      if (activePatient?.anamnesis?.continuousMedication) highlights.push(`Medicação contínua: ${activePatient.anamnesis.continuousMedication}`);

      // Exam notes
      let examNotes = '';
      if (data.exam) {
        examNotes = `Inspeção clínica de tecidos moles e mucosas íntegras. Higiene bucal: ${data.exam.oralHygiene || 'Adequada'}. Oclusão: ${data.exam.occlusion || 'Classe I'}. Risco periodontal: ${data.exam.periodontalRisk || 'Baixo'}.`;
      } else {
        examNotes = 'Exame intraoral e extraoral executado. Tecidos moles normocorados e sem lesões visíveis. Higiene oral supervisionada.';
      }

      // Associated Treatment plan
      const associatedPlan = patientPlans.find(p => p.date === dateKey) || patientPlans[0] || null;

      // Recommended post-care
      const postCare = primaryEvo?.procedure?.toLowerCase().includes('cirurgia') || primaryEvo?.procedure?.toLowerCase().includes('extração')
        ? 'Repouso relativo por 24-48 horas. Dieta líquida/pastosa e fria. Aplicação de gelo local por 20 minutos intercalados. Higienização cuidadosa sem bochechos vigorosos. Tomar os medicamentos prescritos rigorosamente nos horários indicados.'
        : 'Manter escovação dental com cerdas macias e uso diário do fio dental. Evitar alimentos excessivamente pigmentados nas próximas 24h. Em caso de sensibilidade ou qualquer dúvida, entrar em contato imediato pelo WhatsApp da clínica.';

      // Determine initial severity based on procedure or exam (Inverted scale: Crítico -> Alto -> Moderado -> Baixo)
      let initialSeverity: SeverityLevel = 'baixo';
      const textCorpus = `${primaryAppt?.procedure || ''} ${data.evos.map(e => e.procedure + ' ' + e.description).join(' ')}`.toLowerCase();
      if (textCorpus.includes('endodont') || textCorpus.includes('abscesso') || textCorpus.includes('urgência') || textCorpus.includes('infecc')) {
        initialSeverity = 'critico';
      } else if (textCorpus.includes('cárie profunda') || textCorpus.includes('periodontite') || textCorpus.includes('cirurgia') || textCorpus.includes('enxerto')) {
        initialSeverity = 'alto';
      } else if (textCorpus.includes('restauração') || textCorpus.includes('gengivite')) {
        initialSeverity = 'moderado';
      }

      list.push({
        id: `att-${dateKey}`,
        date: dateKey,
        time: primaryAppt?.time || '10:00',
        status,
        dentistName,
        dentistCro: foundProf?.cro || clinicInfo.cro || 'CRO/CE 5925',
        dentistSpecialty: foundProf?.specialty || 'Cirurgião-Dentista',
        clinicName,
        clinicAddress: foundClinic?.address || clinicInfo.address || 'Av. Santos Dumont, 2800 - Aldeota',
        clinicPhone: foundClinic?.phone || clinicInfo.phone || '(85) 3261-9000',
        clinicEmail: foundClinic?.email || clinicInfo.email || 'contato@dentispro.com.br',
        procedureTitle: formatTechnicalDentalTerm(primaryAppt?.procedure || primaryEvo?.procedure || 'Consulta de Avaliação e Procedimento Clínico'),
        toothNumber: primaryEvo?.toothNumber,
        evolutions: data.evos,
        prescriptions: data.prescs,
        treatmentPlan: associatedPlan,
        odontogramConditions: patientOdonto.length > 0 ? patientOdonto : undefined,
        anamnesisHighlights: highlights,
        clinicalExamNotes: examNotes,
        postCareGuidance: postCare,
        initialSeverity
      });
    });

    // Sort chronologically (most recent first for visual reading)
    return list.sort((a, b) => b.date.localeCompare(a.date));
  }, [
    activePatient, 
    appointments, 
    clinicalEvolutions, 
    prescriptions, 
    treatmentPlans, 
    clinicalExams, 
    odontograms, 
    professionals, 
    clinics, 
    activeClinicEntity, 
    activeProfessionalEntity, 
    clinicInfo
  ]);

  // Filtered attendances based on search term, status filter, and period
  const displayAttendances = useMemo(() => {
    let result = [...consolidatedAttendances];

    // Global search: patient name, CPF, procedure, tooth, date
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter((att) => {
        const matchesDate = att.date.includes(term);
        const matchesProc = att.procedureTitle.toLowerCase().includes(term);
        const matchesDentist = att.dentistName.toLowerCase().includes(term);
        const matchesTooth = att.toothNumber ? String(att.toothNumber).includes(term) : false;
        const matchesEvo = att.evolutions.some(
          (e) => e.procedure.toLowerCase().includes(term) || e.description.toLowerCase().includes(term) || String(e.toothNumber).includes(term)
        );
        const matchesPatientName = activePatient?.name.toLowerCase().includes(term);
        const matchesPatientCpf = activePatient?.cpf.includes(term);
        return matchesDate || matchesProc || matchesDentist || matchesTooth || matchesEvo || matchesPatientName || matchesPatientCpf;
      });
    }

    // Status filter
    if (statusFilter !== 'todos') {
      result = result.filter((att) => {
        if (statusFilter === 'concluido') return att.status === 'concluido';
        if (statusFilter === 'em_atendimento') return att.status === 'em_atendimento' || att.status === 'confirmado' || att.status === 'agendado';
        return true;
      });
    }

    // Period filter
    if (periodFilter !== 'todos') {
      const now = new Date();
      result = result.filter((att) => {
        const attDate = new Date(att.date + 'T12:00:00');
        const diffDays = Math.floor((now.getTime() - attDate.getTime()) / (1000 * 60 * 60 * 24));
        if (periodFilter === 'hoje') return diffDays <= 0;
        if (periodFilter === '7dias') return diffDays <= 7;
        if (periodFilter === '30dias') return diffDays <= 30;
        return true;
      });
    }

    return result;
  }, [consolidatedAttendances, searchTerm, statusFilter, periodFilter, activePatient]);

  // Handle toggling selection for printing
  const handleToggleSelectPrint = (id: string) => {
    setSelectedAttendanceForPrint((prev) => ({
      ...prev,
      [id]: !(prev[id] ?? true)
    }));
  };

  // Handle changing severity for an attendance
  const handleSeverityChange = (id: string, level: SeverityLevel) => {
    setSeverities((prev) => ({
      ...prev,
      [id]: level
    }));
  };

  // Print Action (Standard Window Print adhering to Rule 2 of AGENTS.md)
  const handlePrint = () => {
    window.print();
  };

  // WhatsApp Action: generate structured text and open WhatsApp
  const handleShareWhatsApp = () => {
    if (!activePatient) return;

    const cleanPhone = activePatient.phone.replace(/\D/g, '');
    const phoneWithDDI = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;

    let message = `*LAUDO ODONTOLÓGICO CONSOLIDADO - DENTISPRO*\n`;
    message += `*Paciente:* ${activePatient.name}\n`;
    message += `*CPF:* ${formatCPF(activePatient.cpf)}\n`;
    message += `*Unidade:* ${activeClinicEntity?.name || 'DentisPro Odontologia Especializada'}\n`;
    message += `*Cirurgião-Dentista:* ${activeProfessionalEntity?.name || 'Dr. Hugo Andres Iglesias Ricoy'} (${activeProfessionalEntity?.cro || 'CRO/CE 5925'})\n\n`;

    message += `*HISTÓRICO DE PROCEDIMENTOS E EVOLUÇÃO CLÍNICA:*\n`;
    displayAttendances.forEach((att) => {
      message += `📅 *Data:* ${att.date} (${att.status.toUpperCase()})\n`;
      message += `🦷 *Procedimento:* ${formatTechnicalDentalTerm(att.procedureTitle)}\n`;
      if (att.evolutions.length > 0) {
        att.evolutions.forEach((evo) => {
          message += `• ${formatTechnicalDentalTerm(evo.procedure)} ${evo.toothNumber ? `(Dente ${evo.toothNumber})` : ''}\n`;
        });
      }
      if (att.prescriptions.length > 0) {
        message += `💊 *Prescrições:* `;
        const meds = att.prescriptions.flatMap(p => p.medications.map(m => `${m.name} (${m.instructions})`));
        message += `${meds.join('; ')}\n`;
      }
      message += `\n`;
    });

    message += `*Orientações Clínicas ao Paciente:*\n`;
    message += `Para dúvidas, intercorrências ou orientações pós-atendimento, estamos à disposição.\n`;
    message += `DentisPro Odontologia Especializada • https://dentispro.com.br`;

    const encodedMsg = encodeURIComponent(message);
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${phoneWithDDI}&text=${encodedMsg}`;
    window.open(whatsappUrl, '_blank');
  };

  // Copy structured text action
  const handleCopyText = () => {
    if (!activePatient) return;

    let text = `==========================================================\n`;
    text += `LAUDO ODONTOLÓGICO CONSOLIDADO - DENTISPRO\n`;
    text += `==========================================================\n`;
    text += `Clínica: ${activeClinicEntity?.name || 'DentisPro Odontologia Especializada'}\n`;
    text += `Endereço: ${activeClinicEntity?.address || 'Av. Santos Dumont, 2800'}\n`;
    text += `Cirurgião-Dentista: ${activeProfessionalEntity?.name || 'Dr. Hugo Andres Iglesias Ricoy'} (${activeProfessionalEntity?.cro || 'CRO/CE 5925'})\n\n`;

    text += `DADOS DO PACIENTE:\n`;
    text += `Nome: ${activePatient.name}\n`;
    text += `CPF: ${formatCPF(activePatient.cpf)}\n`;
    text += `Data de Nascimento: ${activePatient.birthDate} (${calculateAge(activePatient.birthDate)})\n`;
    text += `Sexo: ${activePatient.gender === 'masculino' ? 'Masculino' : activePatient.gender === 'feminino' ? 'Feminino' : 'Outro'}\n`;
    text += `Telefone: ${activePatient.phone}\n`;
    text += `E-mail: ${activePatient.email || 'Não informado'}\n`;
    const addrStreet = activePatient.address?.street ? `${activePatient.address.street}, ${activePatient.address.number || 'S/N'}` : 'Não informado';
    const addrCep = activePatient.address?.cep ? ` - CEP: ${formatCEP(activePatient.address.cep)}` : '';
    text += `Endereço: ${addrStreet}${addrCep}\n`;
    text += `Convênio Odontológico: ${activePatient.healthInsurance || 'Particular'}\n\n`;

    if (viewMode === 'completo') {
      text += `ANAMNESE & HISTÓRICO CLÍNICO-SISTÊMICO:\n`;
      text += `Queixa Principal: ${activePatient.anamnesis?.chiefComplaint || 'Consulta de rotina / avaliação geral'}\n`;
      text += `Alergias: ${activePatient.anamnesis?.hasAllergies ? `Sim (${activePatient.anamnesis.allergyDetails || 'Presente'})` : 'Nenhuma alergia conhecida'}\n`;
      text += `Hipertensão: ${activePatient.anamnesis?.hasHypertension ? 'Sim' : 'Não'}\n`;
      text += `Diabetes: ${activePatient.anamnesis?.hasDiabetes ? 'Sim' : 'Não'}\n`;
      text += `Medicação Contínua: ${activePatient.anamnesis?.continuousMedication || 'Nenhum medicamento de uso contínuo'}\n\n`;
    }

    text += `HISTÓRICO CRONOLÓGICO DE ATENDIMENTOS:\n`;
    displayAttendances.forEach((att, idx) => {
      text += `----------------------------------------------------------\n`;
      text += `Atendimento #${idx + 1} - Data: ${att.date} às ${att.time}\n`;
      text += `Cirurgião-Dentista: ${att.dentistName} (${att.dentistCro})\n`;
      text += `Procedimento: ${formatTechnicalDentalTerm(att.procedureTitle)}\n`;
      if (att.evolutions.length > 0) {
        text += `Evoluções Clínicas:\n`;
        att.evolutions.forEach((evo) => {
          text += `  - [Dente ${evo.toothNumber || 'Geral'}] ${formatTechnicalDentalTerm(evo.procedure)}: ${formatTechnicalDentalTerm(evo.description)}\n`;
        });
      }
      if (att.prescriptions.length > 0) {
        text += `Prescrições Médicas:\n`;
        att.prescriptions.forEach((p) => {
          p.medications.forEach((m) => {
            text += `  - ${m.name} ${m.dosage}: ${m.instructions} (Qtd: ${m.quantity})\n`;
          });
        });
      }
    });

    text += `\n==========================================================\n`;
    text += `Emissão: ${new Date().toLocaleDateString('pt-BR')} • DentisPro Odontologia\n`;
    text += `https://dentispro.com.br\n`;

    navigator.clipboard.writeText(text);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 2500);
  };

  // Add new clinical evolution entry
  const handleAddNewEvolution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePatient || !newProcedure.trim()) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const newEntry: ClinicalEvolutionEntry = {
      id: `evo-${Date.now()}`,
      patientId: activePatient.id,
      date: todayStr,
      dentistName: activeProfessionalEntity?.name || 'Dr. Hugo Andres Iglesias Ricoy',
      clinicName: activeClinicEntity?.name || 'DentisPro Odontologia Especializada',
      toothNumber: newToothNumber ? Number(newToothNumber) : undefined,
      procedure: formatTechnicalDentalTerm(newProcedure),
      description: formatTechnicalDentalTerm(newDescription || 'Procedimento executado conforme diretrizes clínicas.'),
      status: 'concluido'
    };

    addClinicalEvolution(newEntry);
    setNewProcedure('');
    setNewToothNumber('');
    setNewDescription('');
    setIsAddEvolutionModalOpen(false);
  };

  return (
    <div id="laudos-module-root" className="space-y-6 pb-12">
      
      {/* 1. BARRA SUPERIOR & CABEÇALHO DO MÓDULO */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          {/* Botão Voltar ao Painel */}
          <button
            type="button"
            id="btn-voltar-painel"
            onClick={() => setActiveTab('dashboard')}
            className="px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-stone-200 active:scale-95 shrink-0"
            title="Voltar ao Painel Principal"
          >
            <ArrowLeft className="w-4 h-4 text-[#4a4a35]" />
            <span>Voltar ao Painel</span>
          </button>

          <div className="w-10 h-10 rounded-xl bg-[#4a4a35] text-[#d4a373] flex items-center justify-center font-bold shadow-xs shrink-0">
            <FileCheck2 className="w-5 h-5" />
          </div>

          <div>
            <h1 className="text-base sm:text-lg font-bold text-stone-900 tracking-tight flex items-center gap-2">
              <span>Módulo de Laudos & Relatórios Clínicos</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                Consolidação Ativa
              </span>
            </h1>
            <p className="text-xs text-stone-500">
              Prontuário consolidado em folha timbrada, escala de gravidade e assinaturas oficiais
            </p>
          </div>
        </div>

        {/* Ações de Impressão, Compartilhamento e Modo de Exibição */}
        <div className="flex items-center gap-2 flex-wrap">
          
          {/* Alternador de Modo: Laudo Completo (Integral) vs Resumido */}
          <div className="inline-flex rounded-xl border border-stone-200 p-0.5 bg-stone-100 shadow-2xs">
            <button
              type="button"
              id="btn-modo-laudo-completo"
              onClick={() => setViewMode('completo')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                viewMode === 'completo'
                  ? 'bg-[#4a4a35] text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Laudo Completo (Integral)</span>
            </button>
            <button
              type="button"
              id="btn-modo-laudo-resumido"
              onClick={() => setViewMode('resumido')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                viewMode === 'resumido'
                  ? 'bg-[#4a4a35] text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <span>Resumido</span>
            </button>
          </div>

          <button
            type="button"
            id="btn-novo-atendimento-laudo"
            onClick={() => setIsAddEvolutionModalOpen(true)}
            className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl flex items-center gap-1.5 border border-stone-300 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-[#d4a373]" />
            <span>Novo Atendimento</span>
          </button>

          <button
            type="button"
            id="btn-copiar-laudo"
            onClick={handleCopyText}
            className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl flex items-center gap-1.5 border border-stone-300 transition cursor-pointer"
            title="Copiar texto do laudo completo"
          >
            {copiedSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-stone-600" />
                <span>Copiar</span>
              </>
            )}
          </button>

          <button
            type="button"
            id="btn-whatsapp-laudo"
            onClick={handleShareWhatsApp}
            className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
            title="Enviar resumo e orientações via WhatsApp"
          >
            <Share2 className="w-3.5 h-3.5 text-emerald-700" />
            <span>WhatsApp</span>
          </button>

          {/* Botão estritamente rotulado como "Imprimir" conforme AGENTS.md Rule 2 */}
          <button
            type="button"
            id="btn-imprimir-laudo"
            onClick={handlePrint}
            className="px-4 py-2 bg-[#4a4a35] hover:bg-[#3d3d2c] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition cursor-pointer active:scale-95"
          >
            <Printer className="w-4 h-4 text-[#d4a373]" />
            <span>Imprimir</span>
          </button>
        </div>
      </div>

      {/* 2. SELETOR DE CLÍNICA, CIRURGIÃO-DENTISTA E PACIENTE */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-xs space-y-4 print:hidden">
        <div className="flex items-center justify-between pb-2 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#d4a373]" />
            <h2 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
              Seleção de Consultório, Operador e Paciente
            </h2>
          </div>
          <span className="text-[11px] text-stone-500 font-medium">
            {filteredPatients.length} paciente(s) disponível(is)
          </span>
        </div>

        {/* 3 Dropdowns em Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          
          {/* Dropdown 1: Unidades e Consultórios (Ordem Alfabética) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#5a5a40] uppercase tracking-wider flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-[#d4a373]" />
              Unidade / Consultório
            </label>
            <select
              id="select-unidade-laudos"
              value={selectedClinicId}
              onChange={(e) => setSelectedClinicId(e.target.value)}
              className="w-full bg-[#fbfbf9] border border-stone-300 rounded-xl px-3 py-2 text-xs font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#4a4a35]/20"
            >
              <option value="todas">★ Todas as Unidades & Consultórios</option>
              {sortedClinics.map((clinic) => (
                <option key={clinic.id} value={clinic.id}>
                  {clinic.name} {clinic.city ? `(${clinic.city})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Dropdown 2: Cirurgiões-Dentistas (Ordem Alfabética) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#5a5a40] uppercase tracking-wider flex items-center gap-1.5">
              <Stethoscope className="w-3.5 h-3.5 text-[#d4a373]" />
              Cirurgião-Dentista Operador
            </label>
            <select
              id="select-dentista-laudos"
              value={selectedProfessionalId}
              onChange={(e) => setSelectedProfessionalId(e.target.value)}
              className="w-full bg-[#fbfbf9] border border-stone-300 rounded-xl px-3 py-2 text-xs font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#4a4a35]/20"
            >
              <option value="todos">★ Todos os Cirurgiões-Dentistas</option>
              {sortedProfessionals.map((prof) => (
                <option key={prof.id} value={prof.id}>
                  {prof.name} ({prof.cro})
                </option>
              ))}
            </select>
          </div>

          {/* Dropdown 3: Paciente Selecionado */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#5a5a40] uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#d4a373]" />
              Paciente
            </label>
            <select
              id="select-paciente-laudos"
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="w-full bg-[#fbfbf9] border border-stone-300 rounded-xl px-3 py-2 text-xs font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#4a4a35]/20"
            >
              {filteredPatients.map((pat) => (
                <option key={pat.id} value={pat.id}>
                  {pat.name} • CPF: {formatCPF(pat.cpf)}
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* Barra de Filtros Rápidos & Busca Global */}
        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
          
          {/* Campo de Busca Global */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              id="input-busca-global-laudos"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Busca global: nome, CPF, data, procedimento ou dente tratado..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-800 placeholder:text-stone-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4a4a35]/20 transition"
            />
          </div>

          {/* Filtro por Status */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[11px] font-bold text-stone-500">Status:</span>
            <div className="inline-flex rounded-xl border border-stone-200 p-0.5 bg-stone-50">
              <button
                type="button"
                onClick={() => setStatusFilter('todos')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  statusFilter === 'todos' ? 'bg-[#4a4a35] text-white shadow-2xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Todos
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('concluido')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  statusFilter === 'concluido' ? 'bg-[#4a4a35] text-white shadow-2xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Concluídos
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('em_atendimento')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  statusFilter === 'em_atendimento' ? 'bg-[#4a4a35] text-white shadow-2xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Em Andamento
              </button>
            </div>
          </div>

          {/* Filtro por Período */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[11px] font-bold text-stone-500">Período:</span>
            <div className="inline-flex rounded-xl border border-stone-200 p-0.5 bg-stone-50">
              <button
                type="button"
                onClick={() => setPeriodFilter('todos')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  periodFilter === 'todos' ? 'bg-[#4a4a35] text-white shadow-2xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Todo Histórico
              </button>
              <button
                type="button"
                onClick={() => setPeriodFilter('30dias')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  periodFilter === '30dias' ? 'bg-[#4a4a35] text-white shadow-2xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Últimos 30 dias
              </button>
            </div>
          </div>

        </div>

        {/* Links Rápidos para Outros Módulos Relacionados */}
        <div className="pt-2 border-t border-stone-100 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-2 text-stone-600 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-[#d4a373]" />
            <span>Módulos integrados do sistema:</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <button
              type="button"
              id="btn-link-aceite-plano"
              onClick={() => setIsConsentModalOpen(true)}
              className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 font-semibold border border-amber-200 transition cursor-pointer flex items-center gap-1"
            >
              <FileSignature className="w-3 h-3 text-amber-700" />
              <span>Laudo de Aceite do Plano de Tratamento</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('documentos')}
              className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold transition cursor-pointer flex items-center gap-1"
            >
              <Scan className="w-3 h-3 text-blue-600" />
              <span>Laudos Radiológicos / CBCT</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('estoque')}
              className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold transition cursor-pointer flex items-center gap-1"
            >
              <Activity className="w-3 h-3 text-emerald-600" />
              <span>Laudo CME / Autoclave</span>
            </button>
          </div>
        </div>
      </div>

      {/* 
        3. ESTRUTURA SEQUENCIAL EM COLUNA ÚNICA (PADRÃO A4 TIMBRADO)
        max-w-4xl centralizado na tela com layout completo e profissional
      */}
      {activePatient ? (
        <div 
          id="laudo-folha-a4-timbrada"
          className="max-w-4xl mx-auto bg-white rounded-2xl sm:rounded-3xl border border-stone-200 shadow-md p-6 sm:p-10 space-y-6 print:max-w-none print:border-0 print:shadow-none print:p-0 print:m-0"
        >
          
          {/* CABEÇALHO TIMBRADO DA CLÍNICA */}
          <div className="pb-6 border-b-2 border-stone-800 print:border-black flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#4a4a35] text-[#d4a373] flex items-center justify-center font-bold text-sm shrink-0">
                  DP
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-stone-900 tracking-tight uppercase">
                    {activeClinicEntity?.name || clinicInfo.name || 'DentisPro Odontologia Especializada'}
                  </h2>
                  <p className="text-xs text-stone-600">
                    {activeClinicEntity?.address || clinicInfo.address || 'Av. Santos Dumont, 2800 - Aldeota'} • {activeClinicEntity?.city || clinicInfo.city || 'Fortaleza - CE'} • CEP: {formatCEP(activeClinicEntity?.cep || clinicInfo.cep || '60160110')}
                  </p>
                </div>
              </div>
              <p className="text-[11px] text-stone-500 pl-12">
                Telefone: {activeClinicEntity?.phone || clinicInfo.phone || '(85) 3261-9000'} • E-mail: {activeClinicEntity?.email || clinicInfo.email || 'contato@dentispro.com.br'}
              </p>
            </div>

            <div className="text-left sm:text-right space-y-0.5 border-t sm:border-t-0 pt-2 sm:pt-0 border-stone-200 shrink-0">
              <span className="px-2 py-0.5 rounded-md bg-[#4a4a35] text-white text-[10px] font-bold uppercase tracking-wider inline-block">
                Laudo Odontológico Consolidado
              </span>
              <p className="text-xs font-bold text-stone-800 font-mono">
                Emitido em: {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </p>
              <p className="text-[10px] text-stone-400 font-mono">
                Autenticação: DP-{activePatient.id.toUpperCase()}-{Date.now().toString().slice(-6)}
              </p>
            </div>
          </div>

          {/* IDENTIFICAÇÃO CADASTRAL COMPLETA DO PACIENTE */}
          <div id="secao-paciente" className="bg-stone-50/90 rounded-2xl p-4 sm:p-5 border border-stone-200 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-stone-200">
              <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-4 h-4 text-[#d4a373]" />
                Identificação Cadastral Completa do Paciente
              </h3>
              <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded-md border border-stone-200 text-stone-600">
                Prontuário: #{activePatient.id}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs text-stone-800">
              <div>
                <span className="text-stone-500 font-medium block text-[11px]">Nome Completo:</span>
                <strong className="text-sm text-stone-900">{activePatient.name}</strong>
              </div>

              <div>
                <span className="text-stone-500 font-medium block text-[11px]">CPF Registrado:</span>
                <span className="font-mono font-bold text-stone-900">{formatCPF(activePatient.cpf)}</span>
              </div>

              <div>
                <span className="text-stone-500 font-medium block text-[11px]">RG / Órgão Expedidor:</span>
                <span className="font-mono font-medium">{activePatient.rg || 'Não informado'}</span>
              </div>

              <div>
                <span className="text-stone-500 font-medium block text-[11px]">Data de Nascimento / Idade:</span>
                <span className="font-medium">
                  {activePatient.birthDate} {calculateAge(activePatient.birthDate) ? `(${calculateAge(activePatient.birthDate)})` : ''}
                </span>
              </div>

              <div>
                <span className="text-stone-500 font-medium block text-[11px]">Sexo Biológico:</span>
                <span className="capitalize">{activePatient.gender || 'Não informado'}</span>
              </div>

              <div>
                <span className="text-stone-500 font-medium block text-[11px]">Profissão / Ocupação:</span>
                <span>{activePatient.profession || activePatient.anamnesis?.profession || 'Não informada'}</span>
              </div>

              <div>
                <span className="text-stone-500 font-medium block text-[11px]">Telefone / WhatsApp:</span>
                <span className="font-mono">{activePatient.phone}</span>
              </div>

              <div>
                <span className="text-stone-500 font-medium block text-[11px]">E-mail:</span>
                <span className="text-stone-700">{activePatient.email || 'Não informado'}</span>
              </div>

              <div>
                <span className="text-stone-500 font-medium block text-[11px]">Convênio / Plano Odontológico:</span>
                <span className="font-bold text-[#4a4a35]">
                  {activePatient.healthInsurance || 'Particular'} {activePatient.insuranceNumber ? `(Matrícula: ${activePatient.insuranceNumber})` : ''}
                </span>
              </div>

              <div className="sm:col-span-2 lg:col-span-3">
                <span className="text-stone-500 font-medium block text-[11px]">Endereço Residencial Completo:</span>
                <span className="text-xs">
                  {activePatient.address?.street ? (
                    <>
                      {activePatient.address.street}, {activePatient.address.number || 'S/N'}
                      {activePatient.address.complement ? ` - ${activePatient.address.complement}` : ''}
                      {activePatient.address.neighborhood ? `, Bairro ${activePatient.address.neighborhood}` : ''}
                      {` - ${activePatient.address.city || 'Fortaleza'} - ${activePatient.address.state || 'CE'}`}
                      {activePatient.address.cep ? ` • CEP: ${formatCEP(activePatient.address.cep)}` : ''}
                    </>
                  ) : (
                    'Endereço não cadastrado'
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* 
            SE FOR LAUDO COMPLETO: RENDERIZA ANAMNESE INTEGRAL, EXAME CLÍNICO E ODONTOGRAMA
          */}
          {viewMode === 'completo' && (
            <>
              {/* ANAMNESE & HISTÓRICO CLÍNICO-SISTÊMICO INTEGRAL */}
              <div id="secao-anamnese" className="bg-amber-50/40 rounded-2xl p-4 sm:p-5 border border-amber-200/70 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-amber-200">
                  <h3 className="text-xs font-bold text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                    <HeartPulse className="w-4 h-4 text-amber-700" />
                    Anamnese & Histórico Clínico-Sistêmico Integral
                  </h3>
                  <span className="text-[10px] font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                    Triagem Sistêmica Completa
                  </span>
                </div>

                {/* Queixa Principal */}
                <div className="bg-white/80 p-3 rounded-xl border border-amber-100 text-xs">
                  <span className="font-bold text-stone-800 block mb-0.5">Queixa Principal & Motivo da Consulta:</span>
                  <p className="text-stone-700 leading-relaxed">
                    {activePatient.anamnesis?.chiefComplaint || 'Consulta para diagnóstico global, profilaxia e planejamento de reabilitação odontológica.'}
                  </p>
                </div>

                {/* Grid de Avaliação Sistêmica */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                  
                  {/* Alergias */}
                  <div className={`p-2.5 rounded-xl border ${
                    activePatient.anamnesis?.hasAllergies ? 'bg-red-50 border-red-200 text-red-900' : 'bg-white border-amber-100 text-stone-800'
                  }`}>
                    <span className="font-bold block text-[11px]">Alergias Medicamentosas / Materiais:</span>
                    <p className="mt-0.5">
                      {activePatient.anamnesis?.hasAllergies 
                        ? `Alérgico(a) a: ${activePatient.anamnesis.allergyDetails || 'Medicamentos ou látex'}`
                        : 'Nenhuma alergia conhecida relatada pelo paciente.'}
                    </p>
                  </div>

                  {/* Condições Cardiovasculares & Pressão */}
                  <div className="p-2.5 rounded-xl bg-white border border-amber-100 text-stone-800">
                    <span className="font-bold block text-[11px]">Sistema Cardiovascular:</span>
                    <p className="mt-0.5">
                      {activePatient.anamnesis?.hasHypertension ? 'Hipertensão Arterial Sistêmica diagnosticada' : 'Sem histórico de hipertensão'}.
                      {activePatient.anamnesis?.hasHeartDisease ? ' Possui histórico cardiológico.' : ' Sem cardiopatias prévias.'}
                    </p>
                  </div>

                  {/* Doenças Metabólicas & Endócrinas */}
                  <div className="p-2.5 rounded-xl bg-white border border-amber-100 text-stone-800">
                    <span className="font-bold block text-[11px]">Metabolismo & Endócrino:</span>
                    <p className="mt-0.5">
                      {activePatient.anamnesis?.hasDiabetes ? `Diabetes Mellitus (${activePatient.anamnesis.diabetesType || 'Tipo 2'})` : 'Sem diagnóstico de diabetes'}.
                      {activePatient.anamnesis?.hasThyroidDisorder ? ' Alteração tireoidiana.' : ''}
                    </p>
                  </div>

                  {/* Coagulação & Cicatrização */}
                  <div className="p-2.5 rounded-xl bg-white border border-amber-100 text-stone-800">
                    <span className="font-bold block text-[11px]">Coagulação & Hemorragia:</span>
                    <p className="mt-0.5">
                      {activePatient.anamnesis?.bleedingDisorder ? 'Histórico de sangramento excessivo / coagulopatia' : 'Padrão de coagulação e hemostasia normal'}.
                      {activePatient.anamnesis?.usesAnticoagulants ? ' Faz uso regular de anticoagulante oral.' : ''}
                    </p>
                  </div>

                  {/* Medicações de Uso Contínuo */}
                  <div className="p-2.5 rounded-xl bg-white border border-amber-100 text-stone-800">
                    <span className="font-bold block text-[11px]">Medicamentos de Uso Contínuo:</span>
                    <p className="mt-0.5 font-medium">
                      {activePatient.anamnesis?.continuousMedication || 'Nenhum medicamento contínuo relatado.'}
                    </p>
                  </div>

                  {/* Hábitos & DTM */}
                  <div className="p-2.5 rounded-xl bg-white border border-amber-100 text-stone-800">
                    <span className="font-bold block text-[11px]">Hábitos Orais & Articulação (ATM):</span>
                    <p className="mt-0.5">
                      {activePatient.anamnesis?.hasBruxism ? 'Bruxismo / apertamento dental presente' : 'Sem relato de bruxismo'}.
                      {activePatient.anamnesis?.hasAtmPainOrClicking ? ' Estalos ou dor em ATM.' : ' ATM sem ruídos ou queixas.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* EXAME CLÍNICO EXTRAORAL E INTRAORAL */}
              <div id="secao-exame-clinico" className="bg-blue-50/40 rounded-2xl p-4 sm:p-5 border border-blue-200/70 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-blue-200">
                  <h3 className="text-xs font-bold text-blue-950 uppercase tracking-wider flex items-center gap-1.5">
                    <Stethoscope className="w-4 h-4 text-blue-700" />
                    Exame Clínico Extraoral, Intraoral e Periodontal
                  </h3>
                  <span className="text-[10px] font-semibold text-blue-800 bg-blue-100 px-2 py-0.5 rounded-md">
                    Inspeção Tecidual Completa
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  {/* Tecidos Moles */}
                  <div className="bg-white p-3 rounded-xl border border-blue-100 space-y-1">
                    <span className="font-bold text-blue-950 block text-[11px]">1. Tecidos Moles e Mucosas:</span>
                    <p className="text-stone-700 leading-relaxed text-[11px]">
                      Lábios, mucosa jugal, assoalho bucal, palato duro e mole e língua sem alterações patológicas, feridas ou lesões suspeitas detectadas.
                    </p>
                  </div>

                  {/* Condição Periodontal */}
                  <div className="bg-white p-3 rounded-xl border border-blue-100 space-y-1">
                    <span className="font-bold text-blue-950 block text-[11px]">2. Periodontia e Higiene Oral:</span>
                    <p className="text-stone-700 leading-relaxed text-[11px]">
                      Índice de placa: {patientExam?.oralHygiene || 'Adequado'}. Sangramento à sondagem pontual. Ausência de bolsas periodontais profundas generalizadas.
                    </p>
                  </div>

                  {/* Oclusão e Mastigação */}
                  <div className="bg-white p-3 rounded-xl border border-blue-100 space-y-1">
                    <span className="font-bold text-blue-950 block text-[11px]">3. Oclusão e Relação Intermaxilar:</span>
                    <p className="text-stone-700 leading-relaxed text-[11px]">
                      {patientExam?.occlusion ? `Relação oclusal: ${patientExam.occlusion}.` : 'Relação canina e molar Classe I de Angle.'} Guia canina funcional, sem interferências excêntricas graves.
                    </p>
                  </div>
                </div>
              </div>

              {/* TRATAMENTOS REALIZADOS */}
              <div id="secao-tratamentos-realizados" className="bg-stone-50/80 rounded-2xl p-4 sm:p-5 border border-stone-200 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                  <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-700" />
                    Tratamentos Realizados
                  </h3>
                  <span className="text-[10px] font-semibold text-stone-700 bg-white px-2.5 py-1 rounded-md border border-stone-200 shadow-2xs">
                    {lastInterventionDate ? `Última intervenção: ${lastInterventionDate}` : 'Última intervenção: Consulta Inicial'}
                  </span>
                </div>

                {consolidatedTreatments.length === 0 ? (
                  <div className="p-3 bg-white rounded-xl border border-stone-200 text-xs text-stone-700">
                    <p className="font-medium text-emerald-800 flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      Todos os elementos dentários avaliados apresentam-se <strong>Hígidos (Íntegros)</strong>, sem alterações patológicas ativas no exame atual.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-[11px] text-stone-600 font-medium">
                      Elementos dentários com intervenção ou histórico clínico registrado (Dente / Região e Condição):
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
                      {consolidatedTreatments.map((finding) => (
                        <div 
                          key={finding.toothNumber} 
                          className="bg-white p-2.5 rounded-xl border border-stone-200 flex items-center gap-2 shadow-2xs"
                        >
                          <span className="font-mono font-bold text-stone-900 text-xs shrink-0 min-w-[24px] text-center">
                            {finding.toothNumber}
                          </span>
                          <span className="text-stone-300 select-none">•</span>
                          <span className="text-xs font-semibold text-stone-800 truncate" title={finding.label}>
                            {finding.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* PLANO DE TRATAMENTO */}
              <div id="secao-plano-integral" className="bg-stone-50/80 rounded-2xl p-4 sm:p-5 border border-stone-200 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                  <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-[#d4a373]" />
                    Plano de Tratamento
                  </h3>
                  <span className="text-[10px] font-semibold text-stone-700 bg-white px-2.5 py-1 rounded-md border border-stone-200 shadow-2xs">
                    {consolidatedTreatmentNeeds.length} procedimento(s) planejado(s)
                  </span>
                </div>

                {consolidatedTreatmentNeeds.length > 0 ? (
                  <div className="space-y-3">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border border-stone-200 rounded-xl overflow-hidden bg-white">
                        <thead className="bg-stone-100/80 text-stone-700 font-bold border-b border-stone-200 text-[11px]">
                          <tr>
                            <th className="p-2.5 text-center w-28">Dente / Região</th>
                            <th className="p-2.5">Código TUSS</th>
                            <th className="p-2.5">Procedimento Clínico Proposto</th>
                            <th className="p-2.5">Especialidade</th>
                            <th className="p-2.5 text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100 text-stone-800 text-[11px]">
                          {consolidatedTreatmentNeeds.map((item, idx) => (
                            <tr key={idx} className="hover:bg-stone-50/50">
                              <td className="p-2.5 font-mono font-bold text-stone-900 whitespace-nowrap text-center">
                                {item.toothNumber ? item.toothNumber : 'Arcada Geral'}
                              </td>
                              <td className="p-2.5 font-mono text-stone-500 whitespace-nowrap">{item.tussCode || '81000030'}</td>
                              <td className="p-2.5 font-medium">{item.procedureName}</td>
                              <td className="p-2.5 text-stone-500 whitespace-nowrap">{item.specialty}</td>
                              <td className="p-2.5 text-right whitespace-nowrap">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                  item.status === 'concluido' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
                                }`}>
                                  {item.status === 'concluido' ? 'Executado' : 'Proposto'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-white rounded-xl border border-stone-200 text-xs text-stone-600">
                    Nenhum procedimento pendente no momento. Procedimentos executados registrados na cronologia abaixo.
                  </div>
                )}
              </div>
            </>
          )}

          {/* CRONOLOGIA SEQUENCIAL DE ATENDIMENTOS (Com Caixa Pré-Selecionada para Impressão) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-1 border-b border-stone-200">
              <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-2">
                <span>Histórico Cronológico Consolidado de Atendimentos</span>
                <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 text-[10px] font-mono">
                  {displayAttendances.length} sessão(ões)
                </span>
              </h3>
              <p className="text-[11px] text-stone-500 hidden sm:block print:hidden">
                (Marque ou desmarque os atendimentos desejados para a impressão)
              </p>
            </div>

            {displayAttendances.length === 0 ? (
              <div className="p-8 text-center bg-stone-50 rounded-2xl border border-dashed border-stone-300 text-stone-500 space-y-2">
                <Activity className="w-8 h-8 text-stone-400 mx-auto" />
                <p className="text-xs font-bold">Nenhum atendimento encontrado para os filtros selecionados.</p>
                <p className="text-[11px]">Altere os filtros de busca ou cadastre uma nova evolução clínica.</p>
              </div>
            ) : (
              displayAttendances.map((attendance) => (
                <LaudoAttendanceCard
                  key={attendance.id}
                  attendance={attendance}
                  isSelectedForPrint={selectedAttendanceForPrint[attendance.id] ?? true}
                  onToggleSelectPrint={handleToggleSelectPrint}
                  severity={severities[attendance.id] || attendance.initialSeverity || 'baixo'}
                  onSeverityChange={handleSeverityChange}
                />
              ))
            )}
          </div>

          {/* TERMO DE CIÊNCIA E ESCLARECIMENTO (No Laudo Completo) */}
          {viewMode === 'completo' && (
            <div id="secao-termo-ciencia" className="bg-stone-50/60 rounded-2xl p-4 border border-stone-200 text-xs text-stone-700 space-y-2">
              <h4 className="font-bold text-stone-900 uppercase tracking-wide text-[11px] flex items-center gap-1.5">
                <FileCheck2 className="w-3.5 h-3.5 text-[#4a4a35]" />
                Termo de Responsabilidade Técnica e Ciência do Paciente
              </h4>
              <p className="text-[11px] leading-relaxed text-justify">
                Declaro que o presente Laudo Odontológico Consolidado expressa fidedignamente o quadro clínico, diagnósticos, evolução operatória e terapêuticas instituídas ao(à) paciente <strong>{activePatient.name}</strong>, de acordo com o prontuário odontológico sob custódia desta clínica e as normas éticas do Conselho Federal de Odontologia (CFO). O(A) paciente e/ou responsável foi suficientemente informado(a) sobre a conduta clínica e orientações preventivas.
              </p>
            </div>
          )}

          {/* ASSINATURA E CARIMBO (PADRÃO DOS DOCUMENTOS COM INTERACTIVE FOOTER) */}
          <LaudoStampSignature
            professional={activeProfessionalEntity}
            clinic={activeClinicEntity}
            documentTitle="Laudo Odontológico Consolidado"
          />

        </div>
      ) : (
        <div className="p-12 text-center bg-white rounded-2xl border border-stone-200 text-stone-500 space-y-3">
          <User className="w-10 h-10 text-stone-300 mx-auto" />
          <p className="text-sm font-bold">Selecione um paciente para carregar o laudo clínico.</p>
        </div>
      )}

      {/* 4. MODAL: LAUDO DE ACEITE & FORMALIZAÇÃO DO PLANO DE TRATAMENTO */}
      {activePatient && (
        <TreatmentPlanConsentModal
          patient={activePatient}
          isOpen={isConsentModalOpen}
          onClose={() => setIsConsentModalOpen(false)}
        />
      )}

      {/* 5. MODAL: REGISTRO RÁPIDO DE NOVO ATENDIMENTO / EVOLUÇÃO */}
      {isAddEvolutionModalOpen && activePatient && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-stone-200 max-w-lg w-full p-6 shadow-2xl space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#4a4a35] text-[#d4a373] flex items-center justify-center font-bold">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-stone-900">Novo Atendimento / Evolução Clínica</h3>
                  <p className="text-[11px] text-stone-500">Paciente: {activePatient.name}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddEvolutionModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddNewEvolution} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Procedimento Clínico Realizado *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Restauração em Resina Composta, Tratamento Endodôntico, Profilaxia..."
                  value={newProcedure}
                  onChange={(e) => setNewProcedure(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#4a4a35]/20"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Elemento Dentário (Notação FDI - Opcional)</label>
                <input
                  type="number"
                  min="11"
                  max="85"
                  placeholder="Ex: 11, 21, 36, 46..."
                  value={newToothNumber}
                  onChange={(e) => setNewToothNumber(e.target.value ? Number(e.target.value) : '')}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#4a4a35]/20"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Conduta Operatória Detalhada & Evolução</label>
                <textarea
                  rows={3}
                  placeholder="Descreva a técnica aplicada, anestésico, isolamento e observações clínicas..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#4a4a35]/20"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsAddEvolutionModalOpen(false)}
                  className="px-3 py-2 rounded-xl text-stone-600 hover:bg-stone-100 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#4a4a35] hover:bg-[#3d3d2c] text-white font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  Salvar Atendimento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
