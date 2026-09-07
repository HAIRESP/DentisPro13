import React, { useMemo, useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  User, 
  Building, 
  Stethoscope, 
  FileText, 
  Pill, 
  AlertTriangle, 
  AlertCircle,
  CheckCircle2, 
  HelpCircle,
  Sparkles, 
  Info, 
  ShieldAlert, 
  ChevronRight, 
  Printer,
  Edit3,
  Check
} from 'lucide-react';
import { Appointment, ClinicalEvolutionEntry, Prescription, TreatmentPlan, ToothCondition } from '../../types';
import {
  SeverityLevel,
  SEVERITY_WEIGHT,
  SEVERITY_CONFIG,
  formatTechnicalDentalTerm,
  getConditionTechnicalLabel,
  consolidateOdontogramConditions,
  getProcedureSeverity
} from '../../utils/dentalConditions';

export type { SeverityLevel };
export { formatTechnicalDentalTerm };

export interface ConsolidatedAttendanceData {
  id: string;
  date: string;
  time?: string;
  status: 'concluido' | 'em_atendimento' | 'agendado' | 'confirmado';
  dentistName: string;
  dentistCro?: string;
  dentistSpecialty?: string;
  clinicName: string;
  clinicAddress?: string;
  clinicPhone?: string;
  clinicEmail?: string;
  procedureTitle: string;
  toothNumber?: number;
  evolutions: ClinicalEvolutionEntry[];
  prescriptions: Prescription[];
  treatmentPlan?: TreatmentPlan | null;
  odontogramConditions?: ToothCondition[];
  anamnesisHighlights?: string[];
  clinicalExamNotes?: string;
  postCareGuidance?: string;
  initialSeverity?: SeverityLevel;
}

interface LaudoAttendanceCardProps {
  attendance: ConsolidatedAttendanceData;
  isSelectedForPrint: boolean;
  onToggleSelectPrint: (id: string) => void;
  severity: SeverityLevel;
  onSeverityChange: (id: string, level: SeverityLevel) => void;
  onUpdatePostCareGuidance?: (id: string, text: string) => void;
}

export const LaudoAttendanceCard: React.FC<LaudoAttendanceCardProps> = ({
  attendance,
  isSelectedForPrint,
  onToggleSelectPrint,
  severity,
  onSeverityChange,
  onUpdatePostCareGuidance
}) => {
  const [isEditingPostCare, setIsEditingPostCare] = useState(false);
  const [postCareDraft, setPostCareDraft] = useState(attendance.postCareGuidance || '');

  useEffect(() => {
    setPostCareDraft(attendance.postCareGuidance || '');
  }, [attendance.postCareGuidance]);
  const dateFormatted = new Date(attendance.date + 'T12:00:00').toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  const currentSeverity = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.baixo;

  // Consolidate odontogram conditions to deduplicate teeth and eliminate multiple "Hígido (Íntegro)" labels
  const consolidatedToothFindings = useMemo(() => {
    if (!attendance.odontogramConditions || attendance.odontogramConditions.length === 0) {
      return [];
    }
    return consolidateOdontogramConditions(attendance.odontogramConditions);
  }, [attendance.odontogramConditions]);

  // Sort treatment plan items in strict descending order of severity: Crítico -> Alto -> Moderado -> Baixo
  const sortedPlanItems = useMemo(() => {
    if (!attendance.treatmentPlan?.items || attendance.treatmentPlan.items.length === 0) {
      return [];
    }
    return [...attendance.treatmentPlan.items].sort((a, b) => {
      const sevA = getProcedureSeverity(a.procedureName, a.specialty);
      const sevB = getProcedureSeverity(b.procedureName, b.specialty);
      return (SEVERITY_WEIGHT[sevB] || 1) - (SEVERITY_WEIGHT[sevA] || 1);
    });
  }, [attendance.treatmentPlan]);

  return (
    <div 
      id={`attendance-card-${attendance.id}`}
      className={`relative rounded-2xl border transition-all duration-200 overflow-hidden ${
        isSelectedForPrint 
          ? 'bg-white border-stone-200 shadow-xs' 
          : 'bg-stone-50/70 border-stone-200 opacity-60 print:hidden'
      } print:border-stone-300 print:shadow-none print:break-inside-avoid print:mb-4`}
    >
      {/* 
        CAIXA PRÉ-SELECIONADA PARA IMPRESSÃO 
        Exibida na tela para controle de inclusão na impressão
      */}
      <div className="bg-stone-50 border-b border-stone-200 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 print:hidden">
        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={isSelectedForPrint}
            onChange={() => onToggleSelectPrint(attendance.id)}
            className="w-4 h-4 rounded-md text-[#4a4a35] accent-[#4a4a35] cursor-pointer"
          />
          <span className="text-xs font-bold text-stone-800">
            {isSelectedForPrint ? (
              <span className="text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Incluído na Impressão do Laudo
              </span>
            ) : (
              <span className="text-stone-400">
                (Omitido na Impressão do Laudo)
              </span>
            )}
          </span>
        </label>

        <div className="flex items-center gap-2 text-[11px] text-stone-500">
          <span className="font-mono bg-white px-2 py-0.5 rounded-md border border-stone-200">
            Ref: {attendance.id}
          </span>
          <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${
            attendance.status === 'concluido'
              ? 'bg-emerald-100 text-emerald-800'
              : attendance.status === 'em_atendimento'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-stone-200 text-stone-700'
          }`}>
            {attendance.status === 'concluido' ? 'Concluído' : attendance.status === 'em_atendimento' ? 'Em Atendimento' : 'Agendado'}
          </span>
        </div>
      </div>

      <div className="p-4 sm:p-5 space-y-4">
        
        {/* CABEÇALHO DO ATENDIMENTO: Horário, Status, Profissional Operador, Unidade Clínica */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-3 border-b border-stone-100">
          
          {/* Dados do Agendamento & Unidade */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-stone-800">
              <Calendar className="w-4 h-4 text-[#d4a373] shrink-0" />
              <span className="font-bold text-sm text-stone-900">
                Data do Atendimento: {dateFormatted}
              </span>
              {attendance.time && (
                <span className="text-xs text-stone-500 flex items-center gap-1 font-mono">
                  <Clock className="w-3 h-3" />
                  {attendance.time}
                </span>
              )}
            </div>

            <div className="text-xs text-stone-600 space-y-0.5 pl-6">
              <p className="font-semibold text-stone-800 flex items-center gap-1">
                <Building className="w-3.5 h-3.5 text-stone-400" />
                {attendance.clinicName}
              </p>
              {attendance.clinicAddress && (
                <p className="text-[11px] text-stone-500">
                  {attendance.clinicAddress}
                </p>
              )}
              {attendance.clinicPhone && (
                <p className="text-[11px] text-stone-500">
                  Tel: {attendance.clinicPhone} {attendance.clinicEmail ? `• E-mail: ${attendance.clinicEmail}` : ''}
                </p>
              )}
            </div>
          </div>

          {/* Dados do Cirurgião-Dentista Operador */}
          <div className="space-y-1 bg-stone-50/60 p-2.5 rounded-xl border border-stone-100">
            <div className="flex items-center gap-1.5 text-stone-800 font-bold text-xs">
              <User className="w-4 h-4 text-[#4a4a35]" />
              <span>Cirurgião-Dentista Operador:</span>
            </div>
            <div className="text-xs text-stone-700 pl-5 space-y-0.5">
              <p className="font-bold text-stone-900">
                {attendance.dentistName}
              </p>
              {attendance.dentistCro && (
                <p className="text-[11px] font-mono text-[#4a4a35] font-semibold">
                  Inscrição: {attendance.dentistCro}
                </p>
              )}
              {attendance.dentistSpecialty && (
                <p className="text-[10px] text-stone-500">
                  Especialidade: {attendance.dentistSpecialty}
                </p>
              )}
            </div>
          </div>

        </div>

        {/* EXAME CLÍNICO */}
        {(attendance.clinicalExamNotes || (attendance.odontogramConditions && attendance.odontogramConditions.length > 0)) && (
          <div className="bg-blue-50/40 border border-blue-100 rounded-xl p-3 space-y-2">
            <h4 className="text-xs font-bold text-blue-950 flex items-center gap-1.5 uppercase tracking-wide">
              <Stethoscope className="w-3.5 h-3.5 text-blue-700" />
              Exame Clínico
            </h4>

            {attendance.clinicalExamNotes && (
              <p className="text-xs text-blue-900/90 leading-relaxed pl-5">
                {attendance.clinicalExamNotes}
              </p>
            )}

            {/* Dentes Avaliados / Odontograma Registrado (1 coluna no mobile, 2 colunas em telas maiores, sem repetição de 'Dente/Região') */}
            {consolidatedToothFindings.length > 0 && (
              <div className="pl-5 pt-1 space-y-1.5">
                <p className="text-[11px] font-semibold text-blue-900">
                  Achados Clínicos no Odontograma (Dente / Região e Condição):
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  {consolidatedToothFindings.map((finding) => (
                    <div 
                      key={finding.toothNumber}
                      className="bg-white p-2 rounded-lg border border-blue-200 flex items-center gap-2 shadow-2xs"
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
        )}

        {/* 
          PLANO DE TRATAMENTO COM SELETOR DE GRAVIDADE (VERDE A VERMELHO) 
          Permite ao paciente entender o nível de risco e prevenção de intercorrências
        */}
        <div className="bg-stone-50/80 rounded-xl p-3.5 border border-stone-200 space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h4 className="text-xs font-bold text-stone-800 flex items-center gap-1.5 uppercase tracking-wide">
              <ShieldAlert className="w-3.5 h-3.5 text-[#d4a373]" />
              Plano de Tratamento
            </h4>

            {/* Severity Level Indicator and Switcher (Inverted Classification Order: Crítico -> Alto -> Moderado -> Baixo) */}
            <div className="flex items-center gap-1.5 print:hidden">
              <span className="text-[10px] text-stone-500 font-semibold">Classificação:</span>
              <div className="inline-flex rounded-lg border border-stone-200 p-0.5 bg-white shadow-2xs">
                {(['critico', 'alto', 'moderado', 'baixo'] as SeverityLevel[]).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => onSeverityChange(attendance.id, lvl)}
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition cursor-pointer ${
                      severity === lvl
                        ? lvl === 'critico'
                          ? 'bg-red-600 text-white shadow-2xs'
                          : lvl === 'alto'
                          ? 'bg-orange-600 text-white shadow-2xs'
                          : lvl === 'moderado'
                          ? 'bg-amber-500 text-white shadow-2xs'
                          : 'bg-emerald-600 text-white shadow-2xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    {lvl.charAt(0).toUpperCase() + lvl.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Severity Banner */}
          <div className={`p-2.5 rounded-xl border flex items-start gap-2.5 ${currentSeverity.color}`}>
            <span className={`w-2.5 h-2.5 rounded-full mt-0.5 shrink-0 ${currentSeverity.dot}`} />
            <div className="text-xs space-y-0.5">
              <span className="font-bold block">
                {currentSeverity.label}
              </span>
              <p className="text-[11px] opacity-90 leading-normal">
                {currentSeverity.description}
              </p>
            </div>
          </div>

          {/* Treatment plan items if present */}
          {sortedPlanItems.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold text-stone-700">
                  Procedimentos Propostos / Executados:
                </p>
                <span className="text-[10px] text-stone-500 font-medium">
                  {sortedPlanItems.length} procedimento(s)
                </span>
              </div>
              <div className="divide-y divide-stone-100 border border-stone-200 rounded-lg bg-white overflow-hidden text-xs">
                {sortedPlanItems.map((item, idx) => (
                  <div key={idx} className="p-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#4a4a35] shrink-0" />
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-semibold text-stone-900">
                          {formatTechnicalDentalTerm(item.procedureName)}
                        </span>
                        {item.toothNumber && (
                          <span className="font-mono font-bold text-stone-900 text-xs">
                            • Dente {item.toothNumber}
                          </span>
                        )}
                        <span className="text-[10px] text-stone-400">
                          • {item.specialty}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                        item.status === 'concluido' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {item.status === 'concluido' ? 'Executado' : 'Proposto'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* EVOLUÇÃO CLÍNICA & CONDUTA OPERATÓRIA */}
        {attendance.evolutions && attendance.evolutions.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-stone-800 flex items-center gap-1.5 uppercase tracking-wide">
              <FileText className="w-3.5 h-3.5 text-[#4a4a35]" />
              Evolução Clínica & Conduta Operatória Detalhada
            </h4>

            <div className="space-y-2">
              {attendance.evolutions.map((evo) => (
                <div 
                  key={evo.id} 
                  className="bg-stone-50/70 border border-stone-200 rounded-xl p-3 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-stone-900">
                        {formatTechnicalDentalTerm(evo.procedure)}
                      </span>
                      {evo.toothNumber && (
                        <span className="font-mono font-bold text-stone-900 text-xs">
                          • Dente {evo.toothNumber}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-stone-500 font-mono">
                      Operador: {evo.dentistName}
                    </span>
                  </div>

                  <p className="text-stone-700 text-xs leading-relaxed whitespace-pre-wrap">
                    {formatTechnicalDentalTerm(evo.description)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PRESCRIÇÕES MEDICAMENTOSAS DA DATA */}
        {attendance.prescriptions && attendance.prescriptions.length > 0 && (
          <div className="bg-amber-50/40 border border-amber-200/80 rounded-xl p-3 space-y-2">
            <h4 className="text-xs font-bold text-amber-950 flex items-center gap-1.5 uppercase tracking-wide">
              <Pill className="w-3.5 h-3.5 text-amber-700" />
              Prescrição Medicamentosa Associada
            </h4>

            <div className="space-y-1.5 pl-5">
              {attendance.prescriptions.map((presc) => (
                <div key={presc.id} className="space-y-1">
                  {presc.medications.map((med, mIdx) => (
                    <div key={mIdx} className="bg-white p-2 rounded-lg border border-amber-200 text-xs space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-stone-900">
                          {med.name} {med.dosage ? `(${med.dosage})` : ''}
                        </span>
                        <span className="text-[11px] text-amber-800 font-bold">
                          Qtd: {med.quantity}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-600">
                        <strong>Posologia:</strong> {med.instructions}
                      </p>
                    </div>
                  ))}
                  {presc.observations && (
                    <p className="text-[11px] text-amber-900 italic pt-0.5">
                      Obs: {presc.observations}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ORIENTAÇÕES PÓS-ATENDIMENTO & RECOMENDAÇÕES */}
        {(attendance.postCareGuidance || isEditingPostCare) && (
          <div className="bg-emerald-50/40 border border-emerald-200/80 rounded-xl p-3 space-y-1.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-emerald-950 flex items-center gap-1.5 uppercase tracking-wide">
                <Info className="w-3.5 h-3.5 text-emerald-700" />
                Orientações Pós-Atendimento ao Paciente
              </h4>
              <button
                type="button"
                id={`btn-editar-pos-cuidado-${attendance.id}`}
                onClick={() => {
                  if (!isEditingPostCare) setPostCareDraft(attendance.postCareGuidance || '');
                  setIsEditingPostCare(!isEditingPostCare);
                }}
                className="text-[11px] font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 px-2 py-0.5 rounded-md hover:bg-emerald-100/60 transition print:hidden cursor-pointer"
                title="Editar informações e recomendações pós-atendimento"
              >
                <Edit3 className="w-3 h-3" />
                <span>{isEditingPostCare ? 'Cancelar' : 'Editar Orientações'}</span>
              </button>
            </div>

            {isEditingPostCare ? (
              <div className="space-y-2 pt-1 print:hidden">
                <textarea
                  id={`textarea-pos-cuidado-${attendance.id}`}
                  value={postCareDraft}
                  onChange={(e) => setPostCareDraft(e.target.value)}
                  rows={3}
                  className="w-full text-xs p-2.5 rounded-lg border border-emerald-300 bg-white text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-sans"
                  placeholder="Digite as recomendações e orientações pós-atendimento para este paciente..."
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingPostCare(false);
                      setPostCareDraft(attendance.postCareGuidance || '');
                    }}
                    className="px-2.5 py-1 text-stone-600 hover:text-stone-800 text-xs font-semibold rounded-lg hover:bg-emerald-100/50 transition cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingPostCare(false);
                      onUpdatePostCareGuidance?.(attendance.id, postCareDraft);
                    }}
                    className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg shadow-2xs transition flex items-center gap-1 cursor-pointer active:scale-95"
                  >
                    <Check className="w-3 h-3" />
                    <span>Salvar Orientações</span>
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-emerald-900 pl-5 leading-relaxed">
                {attendance.postCareGuidance}
              </p>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
