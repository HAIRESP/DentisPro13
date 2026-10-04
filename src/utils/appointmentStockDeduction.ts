import type { Appointment, InventoryItem } from '../types';
import { getItemReadinessInfo } from './inventoryReadiness';
import { roundStockQuantity } from './stockUnits';

export function prepareAppointmentStockDeduction(
  appointment: Appointment,
  inventory: InventoryItem[],
  requestedItems: Array<{ itemId: string; qty: number }>
) {
  if (appointment.stockDeduction) {
    throw new Error('Este atendimento já possui uma baixa registrada.');
  }

  if (requestedItems.length === 0) {
    throw new Error('Nenhum material foi informado para a baixa.');
  }

  const quantities = new Map<string, number>();

  for (const { itemId, qty } of requestedItems) {
    if (!itemId || !Number.isFinite(qty) || qty <= 0 || roundStockQuantity(qty) <= 0) {
      throw new Error('Material ou quantidade inválida.');
    }

    const total = roundStockQuantity((quantities.get(itemId) ?? 0) + qty);

    if (!Number.isFinite(total)) {
      throw new Error('Quantidade total inválida.');
    }

    quantities.set(itemId, total);
  }

  for (const [itemId, qty] of quantities) {
    const item = inventory.find(entry => entry.id === itemId);

    if (!item) {
      throw new Error('Um dos materiais não existe mais no estoque.');
    }

    if (item.ownerScope === 'clinica' && (
      (item.clinicId && item.clinicId !== appointment.clinicId) ||
      (!item.clinicId && item.clinicName && item.clinicName !== appointment.clinicName)
    )) {
      throw new Error(`${item.name}: material de outra clínica.`);
    }
    if (item.ownerScope === 'profissional' && (
      (item.professionalId && item.professionalId !== appointment.professionalId) ||
      (!item.professionalId && item.professionalName && item.professionalName !== appointment.dentistName)
    )) {
      throw new Error(`${item.name}: material de outro profissional.`);
    }

    const reusable =
      item.itemType === 'instrumental' ||
      item.itemType === 'equipamento' ||
      item.category === 'Instrumentais' ||
      item.category === 'Equipamentos' ||
      item.requiresSterilization === true;

    if (reusable) {
      throw new Error(`${item.name}: item reutilizável não pode ser consumido.`);
    }

    if (!Number.isFinite(item.quantity) || item.quantity < qty) {
      throw new Error(`${item.name}: quantidade insuficiente em estoque.`);
    }

    if (!getItemReadinessInfo(item).isReady) {
      throw new Error(`${item.name}: material indisponível para uso.`);
    }
  }

  const completedAt = new Date().toISOString();
  const items = Array.from(quantities, ([itemId, qty]) => ({
    itemId,
    qty
  }));

  const updatedInventory = inventory.map(item => {
    const qty = quantities.get(item.id);

    return qty === undefined
      ? item
      : {
          ...item,
          quantity: roundStockQuantity(item.quantity - qty),
          lastUpdated: completedAt.split('T')[0]
        };
  });

  const updatedAppointment: Appointment = {
    ...appointment,
    stockDeduction: { completedAt, items }
  };

  return { updatedInventory, updatedAppointment };
}