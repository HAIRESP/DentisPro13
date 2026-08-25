import React, { useState } from 'react';
import { 
  Appointment, 
  InventoryItem, 
  TUSSProcedure, 
  ClinicUnit, 
  Professional 
} from '../../types';
import { 
  X, 
  Printer, 
  Copy, 
  Building2, 
  UserCheck, 
  PackageCheck, 
  Calendar, 
  Check, 
  Filter, 
  FileSpreadsheet,
  AlertTriangle
} from 'lucide-react';

interface DailyClinicMaterialsReportModalProps {
  appointments: Appointment[];
  inventory: InventoryItem[];
  tussProcedures: TUSSProcedure[];
  clinics: ClinicUnit[];
  professionals: Professional[];
  onClose: () => void;
}

export const DailyClinicMaterialsReportModal: React.FC<DailyClinicMaterialsReportModalProps> = ({
  appointments,
  inventory,
  tussProcedures,
  clinics,
  professionals,
  onClose
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedClinicId, setSelectedClinicId] = useState<string>('todas');
  const [selectedProfId, setSelectedProfId] = useState<string>('todos');
  const [copied, setCopied] = useState(false);

  // Filter appointments for date, clinic, professional
  const filteredAppointments = appointments.filter(apt => {
    const matchesDate = apt.date === selectedDate;
    const matchesClinic = selectedClinicId === 'todas' || apt.clinicId === selectedClinicId;
    const matchesProf = selectedProfId === 'todos' || apt.professionalId === selectedProfId || apt.dentistName.includes(selectedProfId);
    return matchesDate && matchesClinic && matchesProf;
  });

  // Calculate aggregated requirements for all filtered appointments
  interface AggregatedRequirement {
    materialName: string;
    totalQuantityNeeded: number;
    unit: string;
    ownerScopeTag: string;
    scopedStockQty: number;
    isSufficient: boolean;
    appointmentsCount: number;
  }

  const aggregatedMap: Record<string, AggregatedRequirement> = {};

  filteredAppointments.forEach(apt => {
    // Determine procedure requirement list
    const procLower = apt.procedure.toLowerCase();
    const matchingTuss = tussProcedures.find(t => 
      t.code === apt.tussCode || 
      t.description.toLowerCase().includes(procLower) ||
      procLower.includes(t.description.toLowerCase())
    );

    const baseList = apt.customRequiredMaterials || (matchingTuss?.requiredMaterials && matchingTuss.requiredMaterials.length > 0 ? matchingTuss.requiredMaterials : []);

    // Fallback if no specific list found
    const listToUse = baseList.length > 0 ? baseList : [
      { id: 'def-1', materialName: 'Anestésico Local', quantityNeeded: 1, unit: 'tubete' },
      { id: 'def-2', materialName: 'Agulha Gengival', quantityNeeded: 1, unit: 'unidade' },
      { id: 'def-3', materialName: 'Sugador Odontológico Descartável', quantityNeeded: 2, unit: 'unidade' },
      { id: 'def-4', materialName: 'Luvas de Procedimento', quantityNeeded: 1, unit: 'par' },
    ];

    listToUse.forEach(req => {
      const key = req.materialName.toLowerCase().trim();

      // Scoped stock check for this specific material
      const matchingInventory = inventory.filter(i => {
        // Strict scope check
        if (i.ownerScope === 'clinica' && apt.clinicId && i.clinicId && i.clinicId !== apt.clinicId) return false;
        if (i.ownerScope === 'profissional' && apt.professionalId && i.professionalId && i.professionalId !== apt.professionalId) return false;
        return i.name.toLowerCase().includes(key) || key.includes(i.name.toLowerCase());
      });

      const scopedStockQty = matchingInventory.reduce((acc, curr) => acc + curr.quantity, 0);

      if (!aggregatedMap[key]) {
        let ownerTag = 'Geral';
        if (selectedClinicId !== 'todas') {
          const cName = clinics.find(c => c.id === selectedClinicId)?.name || 'Clínica Selecionada';
          ownerTag = `Clínica (${cName})`;
        } else if (selectedProfId !== 'todos') {
          const pName = professionals.find(p => p.id === selectedProfId)?.name || 'Profissional Selecionado';
          ownerTag = `Profissional (${pName})`;
        }

        aggregatedMap[key] = {
          materialName: req.materialName,
          totalQuantityNeeded: 0,
          unit: req.unit,
          ownerScopeTag: ownerTag,
          scopedStockQty,
          isSufficient: true,
          appointmentsCount: 0
        };
      }

      aggregatedMap[key].totalQuantityNeeded += req.quantityNeeded;
      aggregatedMap[key].appointmentsCount += 1;
      aggregatedMap[key].isSufficient = aggregatedMap[key].scopedStockQty >= aggregatedMap[key].totalQuantityNeeded;
    });
  });

  const aggregatedList = Object.values(aggregatedMap).sort((a, b) => a.materialName.localeCompare(b.materialName, 'pt-BR'));

  const handleCopyReport = () => {
    const clinicLabel = selectedClinicId === 'todas' ? 'Todas as Clínicas' : (clinics.find(c => c.id === selectedClinicId)?.name || 'Clínica');
    const profLabel = selectedProfId === 'todos' ? 'Todos os Profissionais' : (professionals.find(p => p.id === selectedProfId)?.name || 'Profissional');

    const lines = [
      `📊 *REPORT GERAL DE MATERIAIS PARA O DIA (${selectedDate})*`,
      `--------------------------------------------------`,
      `🏥 *Unidade:* ${clinicLabel}`,
      `👨‍⚕️ *Profissional:* ${profLabel}`,
      `📅 *Total de Atendimentos Agendados:* ${filteredAppointments.length}`,
      `--------------------------------------------------`,
      `📦 *CONSOLIDAÇÃO DE MATERIAIS NECESSÁRIOS:*`,
      ...aggregatedList.map((m, idx) => {
        const statusText = m.isSufficient ? '✅ Estoque OK' : `⚠️ Estoque Insuficiente (Disponível: ${m.scopedStockQty})`;
        return `${idx + 1}. ${m.materialName}: ${m.totalQuantityNeeded} ${m.unit} (Atende ${m.appointmentsCount} consultas) -> ${statusText}`;
      }),
      `--------------------------------------------------`,
      `✨ *DentisPro Odontologia - Gestão Inteligente de Estoque e Bandejas*`
    ];

    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#2c2c2c]/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white border border-[#e5e5d1] rounded-[32px] max-w-3xl w-full p-5 sm:p-7 shadow-2xl space-y-5 animate-scaleUp my-auto">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#e5e5d1] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 shadow-xs">
              <FileSpreadsheet className="w-6 h-6 text-amber-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-serif font-bold text-[#2c2c2c]">Report Consolidado da Clínica & Profissional</h3>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                  Agenda de Atendimentos
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Necessidade agregada de materiais com isolamento estrito de clínicas e dentistas
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-gray-100 text-gray-400 hover:text-gray-700 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters Bar */}
        <div className="bg-[#fcfdfa] border border-[#e5e5d1] rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-gray-600 mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#5a5a40]" /> Data do Atendimento
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#e5e5d1] rounded-xl font-bold text-[#2c2c2c]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-600 mb-1 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-[#5a5a40]" /> Clínica / Unidade
            </label>
            <select
              value={selectedClinicId}
              onChange={(e) => setSelectedClinicId(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#e5e5d1] rounded-xl font-bold text-[#2c2c2c]"
            >
              <option value="todas">Todas as Clínicas</option>
              {clinics.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-600 mb-1 flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5 text-[#5a5a40]" /> Profissional / Dentista
            </label>
            <select
              value={selectedProfId}
              onChange={(e) => setSelectedProfId(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#e5e5d1] rounded-xl font-bold text-[#2c2c2c]"
            >
              <option value="todos">Todos os Profissionais</option>
              {professionals.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Scheduled Appointments Pills */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-[#2c2c2c]">
            <span>Consultas Filtradas para a Data ({filteredAppointments.length})</span>
            <span className="text-[11px] text-gray-500 font-normal">Data: {selectedDate}</span>
          </div>

          {filteredAppointments.length === 0 ? (
            <div className="bg-gray-50 border border-dashed border-gray-200 rounded-2xl p-6 text-center text-xs text-gray-500">
              Nenhuma consulta agendada encontrada para os filtros selecionados nesta data.
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-1">
              {filteredAppointments.map(apt => (
                <div key={apt.id} className="bg-emerald-50 border border-emerald-200 text-emerald-950 px-3 py-1.5 rounded-xl text-[11px] flex items-center gap-2">
                  <span className="font-bold">{apt.time}</span>
                  <span>&bull;</span>
                  <span className="font-semibold">{apt.patientName}</span>
                  <span className="text-emerald-700 bg-white px-2 py-0.5 rounded-lg border border-emerald-100 text-[10px]">
                    {apt.procedure}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Aggregated Materials Needed */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-[#2c2c2c]">
            <span>Necessidade Consolidada de Insumos</span>
            <span className="text-[11px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
              {aggregatedList.length} tipos de materiais necessários
            </span>
          </div>

          <div className="border border-[#e5e5d1] rounded-2xl overflow-hidden max-h-56 overflow-y-auto divide-y divide-[#e5e5d1]/60 bg-white">
            {aggregatedList.length === 0 ? (
              <div className="p-4 text-center text-xs text-gray-400">
                Selecione uma data com atendimentos para gerar a consolidação.
              </div>
            ) : (
              aggregatedList.map((item, idx) => (
                <div key={idx} className="p-3 flex items-center justify-between gap-3 hover:bg-[#fcfdfa] transition text-xs">
                  <div>
                    <div className="font-bold text-[#2c2c2c]">{item.materialName}</div>
                    <div className="text-[10px] text-gray-500">
                      Requisitado em <strong>{item.appointmentsCount} consulta(s)</strong> &bull; Categoria: {item.ownerScopeTag}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-right">
                    <div>
                      <div className="font-extrabold text-[#2c2c2c]">
                        {item.totalQuantityNeeded} {item.unit}
                      </div>
                      <div className="text-[10px] text-gray-500">
                        Disponível: {item.scopedStockQty}
                      </div>
                    </div>

                    {item.isSufficient ? (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 shrink-0">
                        ✅ Estoque OK
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200 shrink-0 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-rose-600" />
                        Repor
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-2 pt-3 border-t border-[#e5e5d1]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#f0f0e8] hover:bg-[#e5e5d1] text-[#5a5a40] font-bold text-xs rounded-xl transition"
          >
            Fechar
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyReport}
              className="px-3.5 py-2 bg-white hover:bg-gray-50 text-[#2c2c2c] border border-[#e5e5d1] font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-2xs"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-gray-500" />}
              {copied ? 'Copiado!' : 'Copiar Report'}
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition shadow-xs flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              Imprimir
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
