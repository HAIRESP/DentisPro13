import { useApp } from '../../context/AppContext';
import { isMaterialInScope, materialTemplateKey, selectConsumptionRows } from '../../utils/appointmentMaterials';
import type { StockDeductionRequest } from '../../utils/stockUnits';
import React, { useRef, useState } from 'react';
import { 
  Appointment, 
  InventoryItem, 
  TUSSProcedure, 
  ClinicUnit, 
  Professional, 
  ProcedureMaterialRequirement 
} from '../../types';
import { printDocumentWithTitle } from '../../utils/printUtils';
import { getItemReadinessInfo } from '../../utils/inventoryReadiness';
import { resolveStockUsage } from '../../utils/stockUnits';
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
  onDeductStock?: (itemsToDeduct: StockDeductionRequest[], expectedMaterials?: ProcedureMaterialRequirement[]) => Promise<void>;
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
  const { materialTemplates, saveAppointmentMaterials } = useApp();
  let templateKey: string | undefined;
  try { templateKey = materialTemplateKey(appointment); } catch { /* No permanent template without an exact scope. */ }
  const [draft, setDraft] = useState<ProcedureMaterialRequirement[] | null>(null);
  const [expectedMaterials, setExpectedMaterials] = useState(appointment.customRequiredMaterials);
  const [expectedTemplate, setExpectedTemplate] = useState(templateKey ? materialTemplates?.[templateKey] : undefined);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [permanent, setPermanent] = useState(false);
  const [copied, setCopied] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const stockDeducted = Boolean(appointment.stockDeduction);
  const [deducting, setDeducting] = useState(false);
  const [deductionError, setDeductionError] = useState('');
  const deductionInFlight = useRef(false);

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
    { id: 'req-6', materialName: 'Kit Clínico reutilizável (bandeja, espelho, pinça e explorador)', category: 'Instrumentais', quantityNeeded: 1, unit: 'conjunto' },
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
    (templateKey && materialTemplates?.[templateKey]) ||
    (matchingTuss?.requiredMaterials && matchingTuss.requiredMaterials.length > 0
      ? matchingTuss.requiredMaterials
      : [...defaultProcedureMaterials, ...specificRequirements]);

  // 2. Strict Scoping Logic
  // Filter inventory items allowed for this clinic & professional
  const scopedInventory = inventory.filter(item => isMaterialInScope(item, appointment));
  const requirements = draft ?? baseRequirementsList;
  const busy = saving || deducting;
  const changeMaterials = (next: ProcedureMaterialRequirement[]) => {
    setDraft(next);
    setCheckedItems({});
    setSaveMessage('');
    setDeductionError('');
  };
  const selectedProductIds = new Set(requirements.map(row => row.inventoryItemId).filter(Boolean));
  const updateMaterial = (id: string, patch: Partial<ProcedureMaterialRequirement>) => {
    if (patch.inventoryItemId && requirements.some(row => row.id !== id && row.inventoryItemId === patch.inventoryItemId)) {
      setDeductionError('Este produto já está incluído. Ajuste a quantidade na linha existente.');
      return;
    }
    changeMaterials(requirements.map(row => row.id === id ? { ...row, ...patch } : row));
  };
  const handleSaveMaterials = async () => {
    if (deductionInFlight.current || stockDeducted) return;
    deductionInFlight.current = true;
    setSaving(true);
    setDeductionError('');
    try {
      await saveAppointmentMaterials(appointment.id, requirements, {
        permanent, expectedMaterials, expectedTemplate
      });
      setExpectedMaterials(requirements);
      if (permanent) setExpectedTemplate(requirements);
      setDraft(null);
      setSaveMessage(permanent ? 'Lista salva no atendimento e como padrão deste procedimento, profissional e clínica.' : 'Lista salva somente neste atendimento. O estoque não foi alterado.');
    } catch (error) {
      setDeductionError(error instanceof Error ? error.message : 'Não foi possível salvar a lista.');
    } finally {
      deductionInFlight.current = false;
      setSaving(false);
    }
  };

  // 3. Match required items against scoped inventory
  const resolvedMaterialsReport = requirements.map(req => {
    const isClinicalKit = req.materialName.toLowerCase().includes('bandeja') &&
      req.materialName.toLowerCase().includes('espelho') &&
      req.materialName.toLowerCase().includes('pinça');
    const linkedItem = req.inventoryItemId
      ? scopedInventory.find(item => item.id === req.inventoryItemId)
      : undefined;
    // Only a product explicitly linked by its ID can be used for consumption.
    const matchedItems: InventoryItem[] = linkedItem ? [linkedItem] : [];

    const matchedItem = matchedItems[0];
    const availableQty = isClinicalKit && matchedItems.length > 1
      ? Math.min(...matchedItems.map(item => item.quantity))
      : matchedItem?.quantity || 0;
    let itemOwnerLabel = 'Produto ainda não associado';
    if (matchedItem) {
      if (isClinicalKit && matchedItems.length > 1) {
        itemOwnerLabel = `Kit composto por ${matchedItems.length} instrumental(is) reutilizável(is)`;
      } else if (matchedItem.ownerScope === 'clinica') {
        itemOwnerLabel = `🏥 Clínica (${matchedItem.clinicName || targetClinic.name})`;
      } else if (matchedItem.ownerScope === 'profissional') {
        itemOwnerLabel = `👨‍⚕️ Profissional (${matchedItem.professionalName || targetProf.name})`;
      } else {
        itemOwnerLabel = '🌐 Compartilhado (Estoque Geral)';
      }
    }

    const readiness = matchedItems.map(item => ({ item, info: getItemReadinessInfo(item) }));
    const isReady = matchedItems.length > 0 && readiness.every(entry => entry.info.isReady);
    const isReusable = matchedItems.some(item => item.itemType === 'instrumental' || item.itemType === 'equipamento' || item.category === 'Equipamentos' || item.category === 'Instrumentais' || item.requiresSterilization === true);
    const conversion = matchedItem && !isReusable
      ? resolveStockUsage(matchedItem, req.quantityNeeded, req.unit)
      : undefined;
    const conversionError = conversion && conversion.ok === false ? conversion.error : '';
    const stockQuantityNeeded = conversion?.ok ? conversion.quantity : req.quantityNeeded;
    const hasQuantity = isClinicalKit && matchedItems.length > 1
      ? matchedItems.length === 4 && matchedItems.every(item => item.quantity >= 1)
      : availableQty >= stockQuantityNeeded;
    const isAvailable = hasQuantity && isReady && !conversionError;

    return {
      requirement: req,
      matchedItem,
      matchedItems,
      availableQty,
      itemOwnerLabel,
      readiness,
      isAvailable,
      isReusable,
      conversionError,
      stockQuantityNeeded,
      status: !matchedItems.length ? 'missing' : conversionError ? 'unit_mismatch' : !hasQuantity ? 'low' : !isReady ? 'not_ready' : 'available'
    };
  }).sort((a, b) => a.requirement.materialName.localeCompare(b.requirement.materialName, 'pt-BR'));

  const selectedConsumption = selectConsumptionRows(resolvedMaterialsReport, checkedItems);
  const unitMismatchMaterials = selectedConsumption.filter(r => r.conversionError);
  const availableCount = resolvedMaterialsReport.filter(r => r.isAvailable).length;
  const unavailableMaterials = resolvedMaterialsReport.filter(r => !r.isAvailable);

  const toggleCheck = (id: string) => {
    if (busy || stockDeducted) return;
    setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handlePrint = () => {
    printDocumentWithTitle({
      docTitle: 'Checklist_Materiais_Atendimento',
      patientName: appointment?.patientName,
      date: appointment?.date || new Date()
    });
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
        const statusText = m.conversionError ? `⚠️ ${m.conversionError}` : m.isAvailable ? '✅ Disp.' : `⚠️ Indisponível (Estoque: ${m.availableQty} ${m.matchedItem?.unit || ''})`;
        return `${checkMark} ${idx + 1}. ${m.requirement.materialName} — Produto: ${m.matchedItem?.name || "não associado"} - Qtd: ${m.requirement.quantityNeeded} ${m.requirement.unit} (${m.itemOwnerLabel}) - ${statusText}`;
      }),
      `--------------------------------------------------`,
      `✨ *Instruções ASB:* Favor montar a bandeja cirúrgica/restauradora 15 minutos antes do horário agendado.`
    ];

    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 3500);
  };

  const handleConfirmDeduct = async () => {
  if (!onDeductStock || stockDeducted || deductionInFlight.current) return;

  if (JSON.stringify(expectedMaterials) !== JSON.stringify(appointment.customRequiredMaterials)) {
    setDeductionError('A lista foi alterada em outra janela. Feche e reabra antes de confirmar o consumo.');
    return;
  }
  if (draft || !appointment.customRequiredMaterials) {
    setDeductionError('Salve a lista do atendimento antes de registrar o consumo.');
    return;
  }
  if (selectedConsumption.some(row => !row.matchedItem || !row.isAvailable)) {
    setDeductionError('Revise os produtos usados: há associação, saldo, disponibilidade ou conversão pendente. Nenhum material foi descontado.');
    return;
  }
  const itemsToDeduct = selectedConsumption.map(r => ({
    itemId: r.matchedItem!.id,
    qty: r.stockQuantityNeeded,
    stockUnit: r.matchedItem!.unit,
    consumption: { quantity: r.requirement.quantityNeeded, unit: r.requirement.unit }
  }));

  if (itemsToDeduct.length === 0) {
    setDeductionError('Marque os consumíveis realmente usados antes de registrar o consumo.');
    return;
  }

  deductionInFlight.current = true;
  setDeducting(true);
  setDeductionError('');
  try {
    await onDeductStock(itemsToDeduct, appointment.customRequiredMaterials);
  } catch (error) {
    setDeductionError(error instanceof Error ? error.message : 'Não foi possível salvar a baixa.');
  } finally {
    deductionInFlight.current = false;
    setDeducting(false);
  }
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
                <h3 className="text-lg font-serif font-bold text-[#2c2c2c]">Materiais do atendimento</h3>
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
            disabled={busy}
              onClick={() => { if (!draft || window.confirm("Há alterações na lista ainda não salvas. Deseja descartá-las?")) onClose(); }}
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

        {/* Required Materials Checklist Table */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-[#2c2c2c]">
            <span>Insumos & Instrumentais da Bandeja</span>
            <span className="text-[11px] font-normal text-gray-500">Marque somente os consumíveis realmente usados</span>
          </div>

          <div className="border border-[#e5e5d1] rounded-2xl overflow-hidden max-h-60 overflow-y-auto divide-y divide-[#e5e5d1]/60 bg-white">
            {resolvedMaterialsReport.map((item, idx) => {
              const isChecked = !!checkedItems[item.requirement.id];
              return (
                <div 
                  key={item.requirement.id || idx}
                  
                  className={`p-3 flex items-center justify-between gap-3 transition cursor-pointer ${
                    isChecked ? 'bg-emerald-50/40' : 'hover:bg-[#fcfdfa]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleCheck(item.requirement.id)}
                      disabled={busy || stockDeducted || item.isReusable}
                      aria-label={`Usado: ${item.requirement.materialName}`}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-gray-300 cursor-pointer"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold ${isChecked ? 'text-emerald-800' : 'text-[#2c2c2c]'}`}>
                          {item.requirement.materialName}
                        </span>
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                          {item.requirement.quantityNeeded} {item.requirement.unit}
                        </span>
                      </div>
                      {!stockDeducted && <fieldset disabled={busy} className="space-y-2 mt-2">
                        <label className="block text-xs">Produto do estoque
                          <select aria-label={`Produto para ${item.requirement.materialName}`} value={item.requirement.inventoryItemId || ''}
                            className="block w-full max-w-sm border rounded p-2 bg-white"
                            onChange={event => updateMaterial(item.requirement.id, { inventoryItemId: event.target.value || undefined })}>
                            <option value="">Escolha o produto utilizado</option>
                            {scopedInventory.map(product => <option key={product.id} value={product.id}
                              disabled={product.id !== item.requirement.inventoryItemId && selectedProductIds.has(product.id)}>
                              {product.name} — {product.quantity} {product.unit}{product.id !== item.requirement.inventoryItemId && selectedProductIds.has(product.id) ? ' (já incluído)' : ''}
                            </option>)}
                          </select>
                        </label>
                        <div className="flex flex-wrap gap-2">
                          <label className="text-xs">Quantidade usada / prevista
                            <input aria-label={`Quantidade de ${item.requirement.materialName}`} type="number" min="0.000001" step="any"
                              value={Number.isFinite(item.requirement.quantityNeeded) ? item.requirement.quantityNeeded : ''}
                              onChange={event => updateMaterial(item.requirement.id, { quantityNeeded: event.target.value === '' ? NaN : Number(event.target.value) })}
                              className="block w-24 border rounded p-2" />
                          </label>
                          <label className="text-xs">Unidade de consumo
                            <input aria-label={`Unidade de ${item.requirement.materialName}`} value={item.requirement.unit}
                              onChange={event => updateMaterial(item.requirement.id, { unit: event.target.value })}
                              className="block w-28 border rounded p-2" />
                          </label>
                          <button type="button" className="text-xs underline" onClick={() => changeMaterials(requirements.filter(row => row.id !== item.requirement.id))}>Remover da lista</button>
                        </div>
                      </fieldset>}
                      <div className="text-[10px] text-gray-500 flex items-center gap-2 mt-0.5">
                        <span className="font-semibold text-emerald-800">{item.itemOwnerLabel}</span>
                        {item.matchedItem && (
                          <span>&bull; Disp. no estoque: <strong>{item.availableQty} {item.matchedItem.unit}</strong></span>
                        )}
                      </div>
                      {item.matchedItems.length > 0 && (
                        <p className="text-[10px] text-gray-600 mt-1 break-words">
                          Cadastro no estoque: {item.matchedItems.map(material => `${material.name} [${material.itemCode || material.id}]`).join('; ')}
                        </p>
                      )}
                      {item.matchedItem && !item.isReusable && (
                        <p className={`text-[10px] mt-1 ${item.conversionError ? 'text-rose-700' : 'text-emerald-800'}`}>
                          {item.conversionError || `Baixa prevista: ${item.stockQuantityNeeded} ${item.matchedItem.unit} para ${item.requirement.quantityNeeded} ${item.requirement.unit}.`}
                        </p>
                      )}
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
                        {item.status === 'unit_mismatch' ? 'Conversão pendente' : item.status === 'not_ready' ? 'Indisponível para uso' : 'Associe um produto'}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {!stockDeducted && <fieldset disabled={busy} className="space-y-3 border rounded-xl p-3">
          <details className="rounded-lg border p-3">
            <summary className="cursor-pointer text-sm font-bold">Selecionar materiais ({selectedProductIds.size} selecionados)</summary>
            <p className="text-xs my-2">Os produtos já associados estão marcados. Marque para incluir ou desmarque para remover da lista. Para usar mais do mesmo produto, ajuste a quantidade na linha existente.</p>
            <div role="group" aria-label="Seleção múltipla de materiais" className="max-h-52 overflow-y-auto space-y-2">
              {scopedInventory.map(product => <label key={product.id} className="flex items-center gap-2 text-xs p-2 rounded hover:bg-emerald-50">
                <input type="checkbox" aria-label={`Incluir na lista: ${product.name}`}
                  checked={selectedProductIds.has(product.id)}
                  onChange={event => {
                    if (event.target.checked) {
                      if (selectedProductIds.has(product.id)) return;
                      changeMaterials([...requirements, { id: crypto.randomUUID(), inventoryItemId: product.id, materialName: product.name, category: product.category, quantityNeeded: 1, unit: product.consumptionUnit || product.unit }]);
                    } else {
                      changeMaterials(requirements.filter(row => row.inventoryItemId !== product.id));
                    }
                  }} />
                <span>{product.name} — {product.quantity} {product.unit}</span>
              </label>)}
              {scopedInventory.length === 0 && <p className="text-xs">Nenhum material cadastrado disponível para este atendimento.</p>}
            </div>
          </details>
          <label className="flex gap-2 text-xs"><input type="checkbox" checked={permanent} disabled={!templateKey}
            onChange={event => setPermanent(event.target.checked)} />Usar esta lista também como padrão deste procedimento para este profissional nesta clínica</label>
          {!templateKey && <p className="text-xs">O padrão exige código do procedimento, clínica e profissional vinculados ao atendimento.</p>}
          <p className="text-xs">Salvar a lista não dá baixa. Após salvar, marque os consumíveis usados. Instrumentais e equipamentos não são consumidos.</p>
          <button type="button" onClick={handleSaveMaterials} className="rounded-lg bg-emerald-700 text-white px-4 py-2 text-xs">{saving ? 'Salvando...' : 'Salvar lista'}</button>
        </fieldset>}
        {saveMessage && <p role="status" className="text-xs text-emerald-800">{saveMessage}</p>}
        {/* Stock Deduction Action Box */}
        {unitMismatchMaterials.length > 0 && !stockDeducted && <p role="alert" className="text-sm text-rose-700">Baixa bloqueada: há materiais com unidades diferentes sem conversão cadastrada. Configure o conteúdo da embalagem no estoque e reabra este checklist.</p>}
        {deductionError && <p role="alert" className="text-sm text-red-700">{deductionError}</p>}
        {stockDeducted && (
          <div className="text-xs text-emerald-800 space-y-1">
            <p>Baixa registrada para este atendimento.</p>
            {appointment.stockDeduction?.items.map(receipt => (
              <p key={receipt.itemId}>{inventory.find(entry => entry.id === receipt.itemId)?.name || receipt.itemId}: {receipt.qty} {receipt.stockUnit || '(unidade não registrada no comprovante antigo)'}
                {receipt.consumptions?.length ? ` — consumo: ${receipt.consumptions.map(entry => `${entry.quantity} ${entry.unit}`).join(' + ')}` : ''}
              </p>
            ))}
          </div>
        )}
        {onDeductStock && (
          <div className="bg-[#f0f0e8]/50 border border-[#e5e5d1] rounded-2xl p-3.5 flex items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-[#2c2c2c]">Registrar consumo deste atendimento</div>
              <div className="text-[11px] text-gray-500">Desconta somente os consumíveis marcados como usados. Confira produto, quantidade e unidade antes de confirmar.</div>
            </div>
            <button
              type="button"
              disabled={stockDeducted || busy || Boolean(draft) || !appointment.customRequiredMaterials || selectedConsumption.length === 0}
              onClick={handleConfirmDeduct}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl border transition shrink-0 flex items-center gap-1.5 ${
                stockDeducted 
                  ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
                  : 'bg-white hover:bg-emerald-50 text-emerald-700 border-emerald-300 shadow-2xs'
              }`}
            >
              {deducting ? 'Salvando baixa...' : stockDeducted ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  Baixa Efetuada!
                </>
              ) : (
                <>
                  <MinusCircle className="w-4 h-4 text-emerald-600" />
                  Confirmar consumo selecionado
                </>
              )}
            </button>
          </div>
        )}

        {/* Actions Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-[#e5e5d1]">
          <button
            type="button"
            disabled={busy}
              onClick={() => { if (!draft || window.confirm("Há alterações na lista ainda não salvas. Deseja descartá-las?")) onClose(); }}
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
// DentisPro: correcao-associacao-v1
