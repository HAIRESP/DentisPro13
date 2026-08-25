import React, { useState } from 'react';
import { 
  Appointment, 
  InventoryItem, 
  TUSSProcedure, 
  ClinicUnit, 
  Professional, 
  ProcedureMaterialRequirement 
} from '../../types';
import { 
  X, 
  Printer, 
  Copy, 
  CheckCircle2, 
  AlertTriangle, 
  Building2, 
  UserCheck, 
  PackageCheck, 
  Sparkles, 
  Calendar, 
  Clock, 
  FileText,
  Check,
  MinusCircle
} from 'lucide-react';

interface AppointmentMaterialsReportModalProps {
  appointment: Appointment;
  inventory: InventoryItem[];
  tussProcedures: TUSSProcedure[];
  clinics: ClinicUnit[];
  professionals: Professional[];
  onClose: () => void;
  onDeductStock?: (itemsToDeduct: Array<{ itemId: string; qty: number }>) => void;
}

export const AppointmentMaterialsReportModal: React.FC<AppointmentMaterialsReportModalProps> = ({
  appointment,
  inventory,
  tussProcedures,
  clinics,
  professionals,
  onClose,
  onDeductStock
}) => {
  const [copied, setCopied] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [stockDeducted, setStockDeducted] = useState(false);

  // Identify Clinic and Professional objects
  const targetClinic = clinics.find(c => c.id === appointment.clinicId) || {
    id: appointment.clinicId || 'default-clinic',
    name: appointment.clinicName || 'Clínica Principal',
    address: 'Consultório Principal',
    phone: '',
    city: 'São Paulo'
  };

  const targetProf = professionals.find(p => p.id === appointment.professionalId || p.name === appointment.dentistName) || {
    id: appointment.professionalId || 'default-prof',
    name: appointment.dentistName,
    cro: 'CRO/SP',
    specialty: 'Odontologia Geral',
    clinicIds: []
  };

  // 1. Resolve required materials for the appointment's procedure
  const matchingTuss = tussProcedures.find(t => 
    t.code === appointment.tussCode || 
    t.description.toLowerCase().includes(appointment.procedure.toLowerCase()) ||
    appointment.procedure.toLowerCase().includes(t.description.toLowerCase())
  );

  // Default procedural kit fallback if no requiredMaterials explicitly configured
  const defaultProcedureMaterials: ProcedureMaterialRequirement[] = [
    { id: 'req-1', materialName: 'Anestésico Local (Lidocaína / Mepivacaína)', category: 'Anestésicos', quantityNeeded: 1, unit: 'tubete' },
    { id: 'req-2', materialName: 'Agulha Gengival Descartável', category: 'Descartáveis', quantityNeeded: 1, unit: 'unidade' },
    { id: 'req-3', materialName: 'Sugador Odontológico Descartável', category: 'Descartáveis', quantityNeeded: 2, unit: 'unidade' },
    { id: 'req-4', materialName: 'Gaze Estéril Dobrada', category: 'Descartáveis', quantityNeeded: 1, unit: 'pacote' },
    { id: 'req-5', materialName: 'Luvas de Procedimento Nitrílicas/Látex', category: 'Descartáveis', quantityNeeded: 1, unit: 'par' },
    { id: 'req-6', materialName: 'Bandeja & Espelho / Sonda / Pinça Клиnica', category: 'Instrumentais', quantityNeeded: 1, unit: 'conjunto' },
  ];

  // Specific additions based on procedure category
  let specificRequirements: ProcedureMaterialRequirement[] = [];
  const procLower = appointment.procedure.toLowerCase();

  if (procLower.includes('resina') || procLower.includes('restauração')) {
    specificRequirements = [
      { id: 'req-res-1', materialName: 'Resina Composta Nanoparticulada (A2/A3)', category: 'Resinas & Adesivos', quantityNeeded: 1, unit: 'unidade' },
      { id: 'req-res-2', materialName: 'Sistema Adesivo Fotopolimerizável', category: 'Resinas & Adesivos', quantityNeeded: 1, unit: 'frasco' },
      { id: 'req-res-3', materialName: 'Ácido Fosfórico 37%', category: 'Resinas & Adesivos', quantityNeeded: 1, unit: 'unidade' },
      { id: 'req-res-4', materialName: 'Matriz / Tira de Poliéster & Cunha de Madeira', category: 'Descartáveis', quantityNeeded: 1, unit: 'unidade' },
      { id: 'req-res-5', materialName: 'Discos e Pasta de Polimento', category: 'Descartáveis', quantityNeeded: 1, unit: 'kit' },
    ];
  } else if (procLower.includes('canal') || procLower.includes('endodont')) {
    specificRequirements = [
      { id: 'req-endo-1', materialName: 'Isolamento Absoluto (Lençol de Borracha + Grampo)', category: 'Endodontia', quantityNeeded: 1, unit: 'conjunto' },
      { id: 'req-endo-2', materialName: 'Jogo de Limas Endodônticas NiTi', category: 'Endodontia', quantityNeeded: 1, unit: 'kit' },
      { id: 'req-endo-3', materialName: 'Solução Irrigante Hipoclorito de Sódio 2.5%', category: 'Endodontia', quantityNeeded: 1, unit: 'frasco' },
      { id: 'req-endo-4', materialName: 'Cones de Guta-Percha & Cimento Endodôntico Biocerâmico', category: 'Endodontia', quantityNeeded: 1, unit: 'caixa' },
    ];
  } else if (procLower.includes('limpeza') || procLower.includes('profilaxia') || procLower.includes('raspagem')) {
    specificRequirements = [
      { id: 'req-prof-1', materialName: 'Pasta Profilática Fluoretada', category: 'Higiene', quantityNeeded: 1, unit: 'unidade' },
      { id: 'req-prof-2', materialName: 'Taça de Borracha / Escova Robinson', category: 'Descartáveis', quantityNeeded: 1, unit: 'unidade' },
      { id: 'req-prof-3', materialName: 'Ponta de Ultrassom Perio / Curetas Gracey', category: 'Instrumentais', quantityNeeded: 1, unit: 'conjunto' },
      { id: 'req-prof-4', materialName: 'Flúor Gel / Verniz Fluoretado', category: 'Higiene', quantityNeeded: 1, unit: 'unidade' },
    ];
  } else if (procLower.includes('extração') || procLower.includes('exodontia') || procLower.includes('cirurgia') || procLower.includes('implante')) {
    specificRequirements = [
      { id: 'req-cir-1', materialName: 'Campo Cirúrgico Estéril & Babador Impermeável', category: 'Cirurgia', quantityNeeded: 1, unit: 'pacote' },
      { id: 'req-cir-2', materialName: 'Fio de Sutura Nylon/Seda 4-0 com Agulha', category: 'Cirurgia', quantityNeeded: 1, unit: 'unidade' },
      { id: 'req-cir-3', materialName: 'Lâmina de Bisturi nº 15 / Kit Fórceps & Alavancas', category: 'Cirurgia', quantityNeeded: 1, unit: 'conjunto' },
      { id: 'req-cir-4', materialName: 'Soro Fisiológico Estéril 0.9% para Irrigação', category: 'Cirurgia', quantityNeeded: 1, unit: 'frasco' },
    ];
  }

  const baseRequirementsList = appointment.customRequiredMaterials || 
    (matchingTuss?.requiredMaterials && matchingTuss.requiredMaterials.length > 0
      ? matchingTuss.requiredMaterials
      : [...defaultProcedureMaterials, ...specificRequirements]);

  // 2. Strict Scoping Logic
  // Filter inventory items allowed for this clinic & professional
  const scopedInventory = inventory.filter(item => {
    // Exclude materials owned explicitly by OTHER clinics
    if (item.ownerScope === 'clinica') {
      if (item.clinicId && item.clinicId !== appointment.clinicId) {
        return false; // NO MIXING FROM OTHER CLINIC!
      }
    }

    // Exclude materials owned explicitly by OTHER professionals
    if (item.ownerScope === 'profissional') {
      if (item.professionalId && item.professionalId !== appointment.professionalId) {
        return false; // NO MIXING FROM OTHER DOCTOR!
      }
      if (!item.professionalId && item.professionalName && item.professionalName !== appointment.dentistName) {
        return false;
      }
    }

    return true; // Compartilhado or matching clinic / professional!
  });

  // 3. Match required items against scoped inventory
  const resolvedMaterialsReport = baseRequirementsList.map(req => {
    // Find best match in scoped inventory by name or category
    const exactNameMatch = scopedInventory.find(i => 
      i.name.toLowerCase().includes(req.materialName.toLowerCase()) ||
      req.materialName.toLowerCase().includes(i.name.toLowerCase())
    );

    const categoryMatch = !exactNameMatch && req.category 
      ? scopedInventory.find(i => i.category.toLowerCase() === req.category?.toLowerCase())
      : null;

    const matchedItem = exactNameMatch || categoryMatch;

    let availableQty = 0;
    let itemOwnerLabel = 'Não Cadastrado';
    let matchedItemId: string | undefined = undefined;

    if (matchedItem) {
      availableQty = matchedItem.quantity;
      matchedItemId = matchedItem.id;
      if (matchedItem.ownerScope === 'clinica') {
        itemOwnerLabel = `🏥 Clínica (${matchedItem.clinicName || targetClinic.name})`;
      } else if (matchedItem.ownerScope === 'profissional') {
        itemOwnerLabel = `👨‍⚕️ Profissional (${matchedItem.professionalName || targetProf.name})`;
      } else {
        itemOwnerLabel = '🌐 Compartilhado (Estoque Geral)';
      }
    }

    const isAvailable = availableQty >= req.quantityNeeded;

    return {
      requirement: req,
      matchedItem,
      matchedItemId,
      availableQty,
      itemOwnerLabel,
      isAvailable,
      status: isAvailable ? 'available' : (availableQty > 0 ? 'low' : 'missing')
    };
  }).sort((a, b) => a.materialName.localeCompare(b.materialName, 'pt-BR'));

  const availableCount = resolvedMaterialsReport.filter(r => r.isAvailable).length;
  const missingCount = resolvedMaterialsReport.filter(r => r.status === 'missing').length;

  const toggleCheck = (id: string) => {
    setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyChecklist = () => {
    const lines = [
      `📋 *CHECKLIST DE MATERIAIS PARA ATENDIMENTO (REQUISITORIA DE BANDEJA)*`,
      `--------------------------------------------------`,
      `👤 *Paciente:* ${appointment.patientName}`,
      `📅 *Data & Horário:* ${appointment.date} às ${appointment.time}`,
      `🏥 *Clínica:* ${targetClinic.name}`,
      `👨‍⚕️ *Cirurgião-Dentista:* ${targetProf.name} (${targetProf.cro})`,
      `🦷 *Procedimento:* ${appointment.procedure}`,
      `--------------------------------------------------`,
      `📦 *LISTA DE MATERIAIS REQUISITADOS:*`,
      ...resolvedMaterialsReport.map((m, idx) => {
        const checkMark = checkedItems[m.requirement.id] ? '[X]' : '[ ]';
        const statusText = m.isAvailable ? '✅ Disp.' : `⚠️ Falta (Estoque: ${m.availableQty})`;
        return `${checkMark} ${idx + 1}. ${m.requirement.materialName} - Qtd: ${m.requirement.quantityNeeded} ${m.requirement.unit} (${m.itemOwnerLabel}) - ${statusText}`;
      }),
      `--------------------------------------------------`,
      `✨ *Instruções ASB:* Favor montar a bandeja cirúrgica/restauradora 15 minutos antes do horário agendado.`
    ];

    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 3500);
  };

  const handleConfirmDeduct = () => {
    if (!onDeductStock) return;
    const itemsToDeduct = resolvedMaterialsReport
      .filter(r => r.matchedItemId && r.requirement.quantityNeeded > 0)
      .map(r => ({
        itemId: r.matchedItemId!,
        qty: r.requirement.quantityNeeded
      }));

    onDeductStock(itemsToDeduct);
    setStockDeducted(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#2c2c2c]/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white border border-[#e5e5d1] rounded-[32px] max-w-2xl w-full p-5 sm:p-7 shadow-2xl space-y-5 animate-scaleUp my-auto">
        
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-[#e5e5d1] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 shadow-xs">
              <PackageCheck className="w-6 h-6 text-emerald-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-serif font-bold text-[#2c2c2c]">Report de Materiais do Atendimento</h3>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Montagem de Bandeja
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Seleção automatizada de insumos da clínica e do profissional agendado
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

        {/* Appointment Context Summary Card */}
        <div className="bg-[#fcfdfa] border border-[#e5e5d1] rounded-2xl p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-[#5a5a40] shrink-0" />
              <span className="text-gray-500">Paciente:</span>
              <strong className="text-[#2c2c2c]">{appointment.patientName}</strong>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#5a5a40] shrink-0" />
              <span className="text-gray-500">Data/Hora:</span>
              <strong className="text-[#2c2c2c]">{appointment.date} às {appointment.time} ({appointment.durationMinutes} min)</strong>
            </div>

            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#5a5a40] shrink-0" />
              <span className="text-gray-500">Unidade:</span>
              <strong className="text-emerald-800 font-semibold">{targetClinic.name}</strong>
            </div>

            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#5a5a40] shrink-0" />
              <span className="text-gray-500">Dentista:</span>
              <strong className="text-[#2c2c2c]">{targetProf.name}</strong>
            </div>
          </div>

          <div className="pt-2 border-t border-[#e5e5d1]/60 flex items-center justify-between text-xs">
            <div>
              <span className="text-gray-500">Procedimento Requisitado:</span>
              <span className="ml-1.5 font-bold text-[#2c2c2c] bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200">
                {appointment.procedure}
              </span>
            </div>
            <div className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">
              {availableCount} de {resolvedMaterialsReport.length} prontos em estoque
            </div>
          </div>
        </div>

        {/* Isolation Rules Banner */}
        <div className="bg-sky-50/80 border border-sky-200 rounded-2xl p-3 text-[11px] text-sky-900 flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
          <div>
            <strong>Regra de Filtragem Ativa:</strong> A lista de materiais foi gerada priorizando os itens cadastrados especificamente para a <strong>{targetClinic.name}</strong> e para o(a) <strong>{targetProf.name}</strong>, além de itens compartilhados gerais. Materiais de outras clínicas ou de outros profissionais foram estritamente isolados.
          </div>
        </div>

        {/* Required Materials Checklist Table */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-[#2c2c2c]">
            <span>Insumos & Instrumentais da Bandeja</span>
            <span className="text-[11px] font-normal text-gray-500">Clique na caixa para marcar item preparado</span>
          </div>

          <div className="border border-[#e5e5d1] rounded-2xl overflow-hidden max-h-60 overflow-y-auto divide-y divide-[#e5e5d1]/60 bg-white">
            {resolvedMaterialsReport.map((item, idx) => {
              const isChecked = !!checkedItems[item.requirement.id];
              return (
                <div 
                  key={item.requirement.id || idx}
                  onClick={() => toggleCheck(item.requirement.id)}
                  className={`p-3 flex items-center justify-between gap-3 transition cursor-pointer ${
                    isChecked ? 'bg-emerald-50/40' : 'hover:bg-[#fcfdfa]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}} // handled by div click
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-gray-300 cursor-pointer"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold ${isChecked ? 'line-through text-gray-400' : 'text-[#2c2c2c]'}`}>
                          {item.requirement.materialName}
                        </span>
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                          {item.requirement.quantityNeeded} {item.requirement.unit}
                        </span>
                      </div>
                      <div className="text-[10px] text-gray-500 flex items-center gap-2 mt-0.5">
                        <span className="font-semibold text-emerald-800">{item.itemOwnerLabel}</span>
                        {item.matchedItem && (
                          <span>&bull; Disp. no estoque: <strong>{item.availableQty}</strong></span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Availability Badge */}
                  <div>
                    {item.isAvailable ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Disponível
                      </span>
                    ) : item.status === 'low' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                        Estoque Baixo ({item.availableQty})
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                        <AlertTriangle className="w-3 h-3 text-rose-600" />
                        Sem Estoque
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stock Deduction Action Box */}
        {onDeductStock && (
          <div className="bg-[#f0f0e8]/50 border border-[#e5e5d1] rounded-2xl p-3.5 flex items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-[#2c2c2c]">Dar Baixa Automática no Estoque</div>
              <div className="text-[11px] text-gray-500">Desconta a quantidade dos materiais utilizados na bandeja do estoque da clínica/profissional.</div>
            </div>
            <button
              type="button"
              disabled={stockDeducted}
              onClick={handleConfirmDeduct}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl border transition shrink-0 flex items-center gap-1.5 ${
                stockDeducted 
                  ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
                  : 'bg-white hover:bg-emerald-50 text-emerald-700 border-emerald-300 shadow-2xs'
              }`}
            >
              {stockDeducted ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  Baixa Efetuada!
                </>
              ) : (
                <>
                  <MinusCircle className="w-4 h-4 text-emerald-600" />
                  Dar Baixa nos Materiais
                </>
              )}
            </button>
          </div>
        )}

        {/* Actions Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-[#e5e5d1]">
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
              onClick={handleCopyChecklist}
              className="px-3.5 py-2 bg-white hover:bg-gray-50 text-[#2c2c2c] border border-[#e5e5d1] font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-2xs"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-gray-500" />}
              {copied ? 'Copiado p/ WhatsApp!' : 'Copiar Requisitória'}
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition shadow-xs flex items-center gap-1.5"
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
