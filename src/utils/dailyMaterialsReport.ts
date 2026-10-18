import type { Appointment, InventoryItem, ProcedureMaterialRequirement, TUSSProcedure } from '../types';
import { getAppointmentRequirements } from './appointmentRequirements';
import { isMaterialInScope } from './appointmentMaterials';
import { getItemReadinessInfo } from './inventoryReadiness';
import { normalizeStockUnit, resolveStockUsage, roundStockQuantity } from './stockUnits';

export const needsMaterialPlanning = (appointment: Appointment) =>
  !['cancelado', 'faltou', 'concluido'].includes(appointment.status) && !appointment.stockDeduction;

export interface DailyMaterialRow {
  key: string;
  materialName: string;
  requestedUsage: string;
  totalQuantityNeeded: number;
  unit: string;
  ownerScopeTag: string;
  scopedStockQty: number;
  isSufficient: boolean;
  appointmentsCount: number;
  note: string;
}

export function buildDailyMaterialsReport(appointments: Appointment[], inventory: InventoryItem[], procedures: TUSSProcedure[], templates: Record<string, ProcedureMaterialRequirement[]> = {}): DailyMaterialRow[] {
  const grouped = new Map<string, DailyMaterialRow & { appointmentIds: Set<string>; usage: Map<string, number>; reusable: boolean }>();
  for (const appointment of appointments.filter(needsMaterialPlanning)) {
    for (const requirement of getAppointmentRequirements(appointment, procedures, templates)) {
      const candidate = inventory.find(item => item.id === requirement.inventoryItemId);
      const item = candidate && isMaterialInScope(candidate, appointment) ? candidate : undefined;
      // Unlinked rows are never merged with an assumed product, even if their names match.
      const key = item ? item.id : JSON.stringify(['unlinked', appointment.id, requirement.id]);
      const reusable = Boolean(item && (item.itemType === 'instrumental' || item.itemType === 'equipamento' || item.category === 'Instrumentais' || item.category === 'Equipamentos' || item.requiresSterilization));
      let row = grouped.get(key);
      if (!row) {
        row = { key, materialName: item?.name || requirement.materialName, requestedUsage: '', totalQuantityNeeded: 0,
          unit: item?.unit || requirement.unit, ownerScopeTag: item?.ownerScope === 'profissional' ? 'Profissional' : item?.ownerScope === 'clinica' ? 'Clínica' : 'Compartilhado',
          scopedStockQty: item?.quantity || 0, isSufficient: false, appointmentsCount: 0, note: '', appointmentIds: new Set(), usage: new Map(), reusable };
        grouped.set(key, row);
      }
      row.appointmentIds.add(appointment.id);
      const unit = normalizeStockUnit(requirement.unit || '');
      if (!Number.isFinite(requirement.quantityNeeded) || requirement.quantityNeeded <= 0 || !unit) {
        row.note = 'Revise quantidade e unidade no atendimento.';
        continue;
      }
      row.usage.set(unit, roundStockQuantity((row.usage.get(unit) || 0) + requirement.quantityNeeded));
      if (!item) { row.note = 'Associe um produto disponível para este atendimento.'; continue; }
      if (reusable) { row.note = 'Reutilizável: conferir quantidade e preparo por atendimento; sem baixa de consumo.'; continue; }
      const conversion = resolveStockUsage(item, requirement.quantityNeeded, requirement.unit);
      if (conversion.ok === false) { row.note = conversion.error; continue; }
      row.totalQuantityNeeded = roundStockQuantity(row.totalQuantityNeeded + conversion.quantity);
      const readiness = getItemReadinessInfo(item);
      if (!readiness.isReady) row.note = readiness.badgeText;
      if (!Number.isFinite(item.quantity) || item.quantity < 0) row.note = 'Saldo inválido: confira o cadastro.';
    }
  }
  return [...grouped.values()].map(({ appointmentIds, usage, reusable, ...row }) => ({
    ...row,
    requestedUsage: [...usage].map(([unit, quantity]) => `${quantity} ${unit}`).join(' + ') || 'Quantidade pendente',
    appointmentsCount: appointmentIds.size,
    isSufficient: !row.note && !reusable && row.scopedStockQty >= row.totalQuantityNeeded,
    note: row.note || (row.scopedStockQty < row.totalQuantityNeeded ? 'Estoque insuficiente' : '')
  })).sort((a, b) => a.materialName.localeCompare(b.materialName, 'pt-BR'));
}
