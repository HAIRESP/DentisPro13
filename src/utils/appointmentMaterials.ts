import type { Appointment, InventoryItem, ProcedureMaterialRequirement, TUSSProcedure } from '../types';

export type MaterialTemplates = Record<string, ProcedureMaterialRequirement[]>;
export type MaterialSaveScope = 'appointment' | 'procedure';
const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/\s+/g, ' ');

export function materialTemplateKey(appointment: Appointment): string {
  return JSON.stringify([
    appointment.clinicId || normalize(appointment.clinicName || ''),
    appointment.professionalId || normalize(appointment.dentistName || ''),
    appointment.tussCode || normalize(appointment.procedure || '')
  ]);
}

export function findMaterialProcedure(appointment: Appointment, procedures: TUSSProcedure[]) {
  // A code is authoritative. Substring matches can silently select another procedure.
  return appointment.tussCode
    ? procedures.find(proc => proc.code === appointment.tussCode)
    : procedures.find(proc => normalize(proc.description) === normalize(appointment.procedure));
}

export function isMaterialInScope(item: InventoryItem, appointment: Appointment): boolean {
  if (item.ownerScope === 'clinica') {
    return item.clinicId ? item.clinicId === appointment.clinicId
      : Boolean(item.clinicName && item.clinicName === appointment.clinicName);
  }
  if (item.ownerScope === 'profissional') {
    return item.professionalId ? item.professionalId === appointment.professionalId
      : Boolean(item.professionalName && item.professionalName === appointment.dentistName);
  }
  return true;
}

export function isReusableMaterial(item: InventoryItem): boolean {
  return item.itemType === 'instrumental' || item.itemType === 'equipamento' ||
    item.category === 'Instrumentais' || item.category === 'Equipamentos' || item.requiresSterilization === true;
}

export function materialCandidates(requirement: ProcedureMaterialRequirement, inventory: InventoryItem[]) {
  const name = normalize(requirement.materialName);
  // Suggestions only: even a single candidate requires explicit selection for consumption.
  return [...inventory].sort((a, b) => {
    const score = (item: InventoryItem) => {
      const itemName = normalize(item.name);
      return (item.id === requirement.inventoryItemId ? 100 : 0) +
        (itemName === name ? 50 : 0) +
        (name.split(/\W+/).filter(word => word.length > 3 && itemName.includes(word)).length * 5) +
        (item.category === requirement.category ? 2 : 0);
    };
    return score(b) - score(a) || a.name.localeCompare(b.name, 'pt-BR');
  });
}

export function validateMaterialRequirements(materials: ProcedureMaterialRequirement[], inventory: InventoryItem[], appointment: Appointment) {
  const ids = new Set<string>();
  for (const req of materials) {
    if (!req.id || ids.has(req.id) || !req.materialName.trim() || !req.unit.trim() || !Number.isFinite(req.quantityNeeded) || req.quantityNeeded <= 0) {
      throw new Error('Informe nomes, unidades e quantidades positivas para todos os materiais.');
    }
    ids.add(req.id);
    if (req.inventoryItemId) {
      const item = inventory.find(entry => entry.id === req.inventoryItemId);
      if (!item || !isMaterialInScope(item, appointment)) {
        throw new Error(`${req.materialName}: produto não encontrado no estoque desta clínica/profissional.`);
      }
    }
  }
}
