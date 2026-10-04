import { findMaterialProcedure, isMaterialInScope, isReusableMaterial, materialCandidates, materialTemplateKey } from '../../utils/appointmentMaterials';
import type { MaterialSaveScope, MaterialTemplates } from '../../utils/appointmentMaterials';
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
  materialTemplates: MaterialTemplates;
  onSaveMaterials: (materials: ProcedureMaterialRequirement[], scope: MaterialSaveScope, expected: string) => Promise<void>;
  onDeductStock?: (itemsToDeduct: Array<{ itemId: string; qty: number }>, expectedMaterials: string) => Promise<void>;
}

export const AppointmentMaterialsReportModal: React.FC<AppointmentMaterialsReportModalProps> = ({
  appointment,
  inventory,
  tussProcedures,
  clinics,
  professionals,
  onClose,
  materialTemplates,
  onSaveMaterials,
  onDeductStock
}) => {
  const [copied, setCopied] = useState(false);
  const [usedItems, setUsedItems] = useState<Record<string, boolean>>({});
  const [saveScope, setSaveScope] = useState<MaterialSaveScope>('appointment');
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [dirty, setDirty] = useState(false);
  const [addItemId, setAddItemId] = useState('');
  const saveInFlight = useRef(false);
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
  const matchingTuss = findMaterialProcedure(appointment, tussProcedures);

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

  const initialRequirements = appointment.customRequiredMaterials ?? materialTemplates[materialTemplateKey(appointment)] ??
    (matchingTuss?.requiredMaterials && matchingTuss.requiredMaterials.length > 0
      ? matchingTuss.requiredMaterials
      : [...defaultProcedureMaterials, ...specificRequirements]);

  const [baseRequirementsList, setRequirements] = useState<ProcedureMaterialRequirement[]>(() => structuredClone(initialRequirements));
  const revision = useRef(JSON.stringify([appointment.customRequiredMaterials, materialTemplates[materialTemplateKey(appointment)]]));
  const locked = stockDeducted || saving || deducting;
  const scopedInventory = inventory.filter(item => isMaterialInScope(item, appointment));
  const changeRequirements = (next: ProcedureMaterialRequirement[]) => {
    setRequirements(next);
    setDirty(true);
    setSaveMessage('');
    setDeductionError('');
  };
  const updateRequirement = (id: string, update: Partial<ProcedureMaterialRequirement>) => {
    changeRequirements(baseRequirementsList.map(req => req.id === id ? { ...req, ...update } : req));
    setUsedItems(prev => ({ ...prev, [id]: false }));
  };
  const handleSave = async () => {
    if (locked || saveInFlight.current) return;
    saveInFlight.current = true;
    setSaving(true);
    setDeductionError('');
    try {
      await onSaveMaterials(baseRequirementsList, saveScope, revision.current);
      revision.current = JSON.stringify([baseRequirementsList, saveScope === 'procedure' ? baseRequirementsList : materialTemplates[materialTemplateKey(appointment)]]);
      setDirty(false);
      setSaveMessage(saveScope === 'procedure' ? 'Lista salva neste atendimento e como padrão para os próximos atendimentos deste procedimento, clínica e profissional.' : 'Lista salva somente neste atendimento.');
    } catch (error) {
      setDeductionError(error instanceof Error ? error.message : 'Não foi possível salvar a lista.');
    } finally {
      saveInFlight.current = false;
      setSaving(false);
    }
  };

  // 3. Match required items against scoped inventory
  const resolvedMaterialsReport = baseRequirementsList.map(req => {
    const isClinicalKit = req.materialName.toLowerCase().includes('bandeja') &&
      req.materialName.toLowerCase().includes('espelho') &&
      req.materialName.toLowerCase().includes('pinça');
    const linkedItem = req.inventoryItemId
      ? scopedInventory.find(item => item.id === req.inventoryItemId)
      : undefined;
    const exactNameMatch = linkedItem;

    let matchedItems: InventoryItem[] = exactNameMatch ? [exactNameMatch] : [];
    if (!req.inventoryItemId && !exactNameMatch && isClinicalKit) {
      const kitItem = scopedInventory.find(item => /kit.*(cl[ií]nic|odont)|conjunto.*(cl[ií]nic|odont)/i.test(item.name));
      if (kitItem) {
        matchedItems = [kitItem];
      } else {
        const componentMatchers = [
          (name: string) => name.includes('bandeja'),
          (name: string) => name.includes('espelho') && (name.includes('clin') || name.includes('bucal')),
          (name: string) => name.includes('pinça') || name.includes('pinca'),
          (name: string) => name.includes('explorador') || name.includes('sonda exploradora')
        ];
        matchedItems = componentMatchers
          .map(matches => scopedInventory.find(item => matches(item.name.toLowerCase())))
          .filter((item): item is InventoryItem => Boolean(item));
      }
    }

    // Categoria sozinha nao identifica um material para consumo.

    const matchedItem = matchedItems[0];
    const availableQty = isClinicalKit && matchedItems.length > 1
      ? Math.min(...matchedItems.map(item => item.quantity))
      : matchedItem?.quantity || 0;
    let itemOwnerLabel = 'Não Cadastrado';
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
    const isReusable = matchedItems.some(isReusableMaterial);
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

  const unitMismatchMaterials = resolvedMaterialsReport.filter(r => usedItems[r.requirement.id] && r.matchedItem && !r.isReusable && r.conversionError);
  const availableCount = resolvedMaterialsReport.filter(r => r.isAvailable).length;
  const unavailableMaterials = resolvedMaterialsReport.filter(r => !r.isAvailable);

  const toggleCheck = (id: string) => {
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
        return `${checkMark} ${idx + 1}. ${m.requirement.materialName} - Qtd: ${m.requirement.quantityNeeded} ${m.requirement.unit} (${m.itemOwnerLabel}) - ${statusText}`;
      }),
      `--------------------------------------------------`,
      `✨ *Instruções ASB:* Favor montar a bandeja cirúrgica/restauradora 15 minutos antes do horário agendado.`
    ];

    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 3500);
  };

  const handleConfirmDeduct = async () => {
  if (!onDeductStock || locked || dirty || deductionInFlight.current || saveInFlight.current) return;

  if (unitMismatchMaterials.length > 0) {
    setDeductionError('Baixa bloqueada: configure a conversão de unidades dos materiais indicados antes de continuar.');
    return;
  }
  if (resolvedMaterialsReport.some(r => usedItems[r.requirement.id] && (!r.isAvailable || r.isReusable || !r.requirement.inventoryItemId))) {
    setDeductionError('Confira os materiais marcados como usados: há item indisponível ou sem associação.');
    return;
  }
  const itemsToDeduct = resolvedMaterialsReport.flatMap(r => {
    if (
      !usedItems[r.requirement.id] ||
      !r.requirement.inventoryItemId ||
      !r.matchedItem ||
      r.isReusable ||
      !r.isAvailable ||
      !Number.isFinite(r.requirement.quantityNeeded) ||
      r.requirement.quantityNeeded <= 0
    ) {
      return [];
    }

    return [{
      itemId: r.matchedItem.id,
      qty: r.stockQuantityNeeded,
      stockUnit: r.matchedItem.unit,
      consumption: { quantity: r.requirement.quantityNeeded, unit: r.requirement.unit }
    }];
  });

  if (itemsToDeduct.length === 0) {
    setDeductionError('Marque os produtos realmente usados antes de dar baixa.');
    return;
  }

  if (!window.confirm('Confirmar baixa somente dos materiais usados?\n' + resolvedMaterialsReport.filter(r => usedItems[r.requirement.id]).map(r => `${r.matchedItem?.name}: ${r.requirement.quantityNeeded} ${r.requirement.unit}`).join('\n'))) return;

  deductionInFlight.current = true;
  setDeducting(true);
  setDeductionError('');
  try {
    await onDeductStock(itemsToDeduct, revision.current);
  } catch (error) {
    setDeductionError(error instanceof Error ? error.message : 'Não foi possível salvar a baixa.');
  } finally {
    deductionInFlight.current = false;
    setDeducting(false);
  }
};

  return (
    <div className="fixed inset-0 z-50 bg-[#2c2c2c]/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white border border-[#e5e5d1] rounded-[32px] max-w-4xl w-full max-h-[95vh] overflow-y-auto p-5 sm:p-7 shadow-2xl space-y-5 animate-scaleUp my-auto">
        
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-[#e5e5d1] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 shadow-xs">
              <PackageCheck className="w-6 h-6 text-emerald-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-serif font-bold text-[#2c2c2c]">Materiais do Atendimento</h3>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Montagem de Bandeja
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Escolha os produtos e confirme os materiais realmente usados
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={saving || deducting}
            onClick={() => { if (!dirty || window.confirm('Descartar as alterações não salvas da lista?')) onClose(); }}
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
            <span className="text-[11px] font-normal text-gray-500">Preparado = bandeja · Usado = baixa de estoque</span>
          </div>

          <div className="border border-[#e5e5d1] rounded-2xl overflow-hidden max-h-96 overflow-y-auto divide-y divide-[#e5e5d1]/60 bg-white">
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
                      aria-label={`Preparado: ${item.requirement.materialName}`}
                      onChange={() => toggleCheck(item.requirement.id)}
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
                          <span>&bull; Disp. no estoque: <strong>{item.availableQty} {item.matchedItem.unit}</strong></span>
                        )}
                      </div>
                      {!stockDeducted && (
                        <div className="mt-2 space-y-2 text-xs print:hidden">
                          <label className="block">Produto do estoque
                            <select aria-label={`Produto: ${item.requirement.materialName}`} disabled={locked} value={item.requirement.inventoryItemId || ''}
                              onChange={event => updateRequirement(item.requirement.id, { inventoryItemId: event.target.value || undefined })}
                              className="block w-full max-w-md border rounded p-1.5 bg-white">
                              <option value="">Selecione o produto utilizado</option>
                              {item.requirement.inventoryItemId && !item.matchedItem && <option value={item.requirement.inventoryItemId}>Produto indisponível — selecione outro</option>}
                              {materialCandidates(item.requirement, scopedInventory).map(product => <option key={product.id} value={product.id}>{product.name} [{product.itemCode || product.id}] — {product.quantity} {product.unit}</option>)}
                            </select>
                          </label>
                          <div className="flex flex-wrap gap-2 items-end">
                            <label>Quantidade
                              <input aria-label={`Quantidade: ${item.requirement.materialName}`} type="number" min="0.000001" step="any" disabled={locked} value={item.requirement.quantityNeeded}
                                onChange={event => updateRequirement(item.requirement.id, { quantityNeeded: Number(event.target.value) })} className="block border rounded p-1 w-24" />
                            </label>
                            <label>Unidade de uso
                              <input aria-label={`Unidade: ${item.requirement.materialName}`} disabled={locked} value={item.requirement.unit}
                                onChange={event => updateRequirement(item.requirement.id, { unit: event.target.value })} className="block border rounded p-1 w-24" />
                            </label>
                            <button type="button" disabled={locked} onClick={() => changeRequirements(baseRequirementsList.filter(req => req.id !== item.requirement.id))} className="text-rose-700 p-1">Remover da lista</button>
                          </div>
                          {item.isReusable ? <p>Reutilizável: conferência de preparo, sem consumo de estoque.</p> : <label className="flex gap-2 items-center font-semibold">
                            <input type="checkbox" aria-label={`Usado: ${item.requirement.materialName}`} disabled={locked || !item.requirement.inventoryItemId || !item.isAvailable} checked={!!usedItems[item.requirement.id]}
                              onChange={event => setUsedItems(prev => ({ ...prev, [item.requirement.id]: event.target.checked }))} />
                            Usado neste atendimento — incluir na baixa
                          </label>}
                        </div>
                      )}
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
                        {item.status === 'unit_mismatch' ? 'Conversão pendente' : item.status === 'not_ready' ? 'Indisponível para uso' : 'Selecione / confira o produto'}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {!stockDeducted && <div className="space-y-3 border rounded-2xl p-3 text-xs print:hidden">
          <label className="block font-semibold">Adicionar material cadastrado
            <select aria-label="Adicionar material cadastrado" disabled={locked} value={addItemId} onChange={event => setAddItemId(event.target.value)} className="block w-full border rounded p-2 mt-1">
              <option value="">Escolha um produto</option>
              {scopedInventory.map(product => <option key={product.id} value={product.id}>{product.name} [{product.itemCode || product.id}]</option>)}
            </select>
          </label>
          <button type="button" disabled={locked || !addItemId} onClick={() => {
            const product = scopedInventory.find(entry => entry.id === addItemId);
            if (!product) return;
            changeRequirements([...baseRequirementsList, { id: crypto.randomUUID(), inventoryItemId: product.id, materialName: product.name, category: product.category, quantityNeeded: 1, unit: product.consumptionUnit || product.unit }]);
            setAddItemId('');
          }} className="border rounded px-3 py-2">Adicionar à lista</button>
          <label className="block">Onde salvar a lista?
            <select aria-label="Onde salvar a lista" disabled={locked} value={saveScope} onChange={event => setSaveScope(event.target.value as MaterialSaveScope)} className="block w-full border rounded p-2 mt-1">
              <option value="appointment">Somente neste atendimento</option>
              <option value="procedure">Neste atendimento e como padrão do procedimento</option>
            </select>
          </label>
          <p>O padrão vale para próximos atendimentos do mesmo procedimento, clínica e profissional. Listas já personalizadas são preservadas. Marque “Usado” novamente em cada atendimento.</p>
          <button type="button" disabled={locked} onClick={handleSave} className="bg-emerald-700 text-white rounded px-3 py-2">{saving ? 'Salvando lista...' : 'Salvar lista de materiais'}</button>
          {dirty && <p className="text-amber-800">Salve a lista antes de confirmar a baixa.</p>}
          {saveMessage && <p role="status" className="text-emerald-800">{saveMessage}</p>}
        </div>}

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
              <div className="text-xs font-bold text-[#2c2c2c]">Confirmar materiais usados</div>
              <div className="text-[11px] text-gray-500">Desconta somente os produtos marcados como usados, uma única vez por atendimento. Confira quantidades e unidades antes de confirmar.</div>
            </div>
            <button
              type="button"
              disabled={locked || dirty || unitMismatchMaterials.length > 0}
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
            disabled={saving || deducting}
            onClick={() => { if (!dirty || window.confirm('Descartar as alterações não salvas da lista?')) onClose(); }}
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
