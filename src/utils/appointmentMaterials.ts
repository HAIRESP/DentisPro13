import type { Appointment, InventoryItem, ProcedureMaterialRequirement } from '../types';

export function materialTemplateKey(appointment: Appointment): string {
  if (!appointment.tussCode || !appointment.clinicId || !appointment.professionalId) {
    throw new Error('Para salvar um padrão, vincule o atendimento ao código do procedimento, à clínica e ao profissional.');
  }
  return JSON.stringify([appointment.tussCode, appointment.clinicId, appointment.professionalId]);
}
export function isMaterialInScope(item: InventoryItem, appointment: Appointment): boolean {
  if (item.ownerScope === 'clinica') return Boolean(item.clinicId && item.clinicId === appointment.clinicId);
  if (item.ownerScope === 'profissional') return Boolean(item.professionalId
    ? item.professionalId === appointment.professionalId
    : item.professionalName && item.professionalName === appointment.dentistName);
  return true;
}
export function validateAppointmentMaterials(materials: ProcedureMaterialRequirement[], inventory: InventoryItem[], appointment: Appointment): void {
  const ids = new Set<string>();
  const productIds = new Set<string>();
  for (const requirement of materials) {
    if (!requirement.id || ids.has(requirement.id)) throw new Error('Há linhas de materiais repetidas. Reabra a lista.');
    ids.add(requirement.id);
    if (!requirement.materialName.trim() || !requirement.unit.trim() || !Number.isFinite(requirement.quantityNeeded) || requirement.quantityNeeded <= 0) {
      throw new Error('Informe o nome, uma quantidade maior que zero e a unidade de cada material.');
    }
    if (requirement.inventoryItemId) {
      if (productIds.has(requirement.inventoryItemId)) throw new Error('Este produto já está incluído na lista. Remova a linha repetida e ajuste a quantidade na linha existente.');
      productIds.add(requirement.inventoryItemId);
      const item = inventory.find(entry => entry.id === requirement.inventoryItemId);
      if (!item || !isMaterialInScope(item, appointment)) throw new Error('Um produto foi removido ou pertence a outra clínica/profissional. Revise a associação.');
    }
  }
}
export function selectConsumptionRows<T extends { requirement: ProcedureMaterialRequirement; isReusable: boolean }>(rows: T[], selected: Record<string, boolean>): T[] {
  return rows.filter(row => selected[row.requirement.id] && !row.isReusable);
}
