import { materialTemplateKey, validateMaterialRequirements } from './appointmentMaterials';
import type { MaterialTemplates, MaterialSaveScope } from './appointmentMaterials';
import type { Appointment, InventoryItem, ProcedureMaterialRequirement } from '../types';
import { prepareAppointmentStockDeduction } from './appointmentStockDeduction';
import { normalizeStockUnit, resolveStockUsage } from './stockUnits';
import type { StockDeductionRequest } from './stockUnits';

export const APPOINTMENT_STOCK_KEY = 'dentispro_appointment_stock_v1';
export const APPOINTMENT_STOCK_LOCK = 'dentispro_appointment_stock_write_v1';
export interface StockSnapshot {
  version: 1;
  appointments: Appointment[];
  inventory: InventoryItem[];
  materialTemplates?: MaterialTemplates;
}
type StoragePort = Pick<Storage, 'getItem' | 'setItem'>;
export type ExclusiveLock = (action: () => void) => Promise<void>;
type Update<T> = T | ((previous: T) => T);

function parseList<T>(raw: string): T[] {
  const value: unknown = JSON.parse(raw);
  if (!Array.isArray(value)) throw new Error('Dados locais inválidos. A operação foi bloqueada.');
  return value as T[];
}

export function readStockSnapshot(storage: StoragePort, defaults: StockSnapshot): StockSnapshot {
  const raw = storage.getItem(APPOINTMENT_STOCK_KEY);
  if (raw !== null) {
    const value = JSON.parse(raw) as StockSnapshot;
    if (!value || value.version !== 1 || !Array.isArray(value.appointments) || !Array.isArray(value.inventory)) {
      throw new Error('Registro local de estoque inválido. Não foi substituído por dados de demonstração.');
    }
    if (value.materialTemplates !== undefined && (!value.materialTemplates || Array.isArray(value.materialTemplates) || typeof value.materialTemplates !== 'object' || Object.values(value.materialTemplates).some(list => !Array.isArray(list)))) {
      throw new Error('Listas de materiais inválidas.');
    }
    return value;
  }
  const readLegacy = <T>(key: string, fallback: T[]): T[] => {
    const saved = storage.getItem(key) ?? storage.getItem(key.replace('dentispro_', 'planetodonto_'));
    return saved === null ? fallback : parseList<T>(saved);
  };
  return {
    version: 1,
    appointments: readLegacy('dentispro_appointments_v2', defaults.appointments),
    inventory: readLegacy('dentispro_inventory_v2', defaults.inventory)
  };
}

// A single setItem commits both quantities and the receipt. No React updater performs I/O.
export function createAppointmentStockStore(storage: StoragePort, lock: ExclusiveLock, defaults: StockSnapshot) {
  let snapshot = readStockSnapshot(storage, defaults);
  const listeners = new Set<() => void>();
  const publish = (next: StockSnapshot) => {
    snapshot = next;
    listeners.forEach(listener => listener());
  };
  const transact = async (change: (current: StockSnapshot) => StockSnapshot): Promise<void> => {
    await lock(() => {
      const current = readStockSnapshot(storage, defaults);
      const next = change(current);
      // If serialization or storage fails, neither the stored snapshot nor the UI changes.
      storage.setItem(APPOINTMENT_STOCK_KEY, JSON.stringify(next));
      publish(next);
    });
  };
  const resolve = <T>(update: Update<T>, previous: T): T =>
    typeof update === 'function' ? (update as (value: T) => T)(previous) : update;

  return {
    getSnapshot: () => snapshot,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
    refresh: () => publish(readStockSnapshot(storage, defaults)),
    setAppointments: (update: Update<Appointment[]>) => transact(current => ({
      ...current, appointments: resolve(update, current.appointments)
    })),
    setInventory: (update: Update<InventoryItem[]>) => transact(current => ({
      ...current, inventory: resolve(update, current.inventory)
    })),
    replaceData: (data: Partial<Pick<StockSnapshot, 'appointments' | 'inventory' | 'materialTemplates'>>) =>
      transact(current => ({ ...current, ...data, version: 1 })),
    saveMaterials: (appointmentId: string, materials: ProcedureMaterialRequirement[], scope: MaterialSaveScope, expected: string) => transact(current => {
      const appointment = current.appointments.find(entry => entry.id === appointmentId);
      if (!appointment) throw new Error('Atendimento não encontrado.');
      if (appointment.stockDeduction) throw new Error('Este atendimento já possui uma baixa registrada. A lista está bloqueada.');
      const key = materialTemplateKey(appointment);
      const revision = JSON.stringify([appointment.customRequiredMaterials, current.materialTemplates?.[key]]);
      if (revision !== expected) throw new Error('A lista foi alterada em outra janela. Feche e reabra para conferir os dados atuais.');
      validateMaterialRequirements(materials, current.inventory, appointment);
      const saved = structuredClone(materials);
      return {
        ...current,
        appointments: current.appointments.map(entry => entry.id === appointmentId ? { ...entry, customRequiredMaterials: saved } : entry),
        ...(scope === 'procedure' ? { materialTemplates: { ...current.materialTemplates, [key]: saved } } : {})
      };
    }),
    deduct: (appointmentId: string, items: StockDeductionRequest[], expectedMaterials?: string) => transact(current => {
      const appointment = current.appointments.find(entry => entry.id === appointmentId);
      if (!appointment) throw new Error('Atendimento não encontrado.');
      const template = current.materialTemplates?.[materialTemplateKey(appointment)];
      if (expectedMaterials !== undefined && JSON.stringify([appointment.customRequiredMaterials, template]) !== expectedMaterials) {
        throw new Error('A lista foi alterada em outra janela. Feche e reabra antes de dar baixa.');
      }
      // Revalidate units against the latest data while holding the same write lock.
      const validatedItems = items.map(request => {
        if (!request.consumption) return { itemId: request.itemId, qty: request.qty };
        const item = current.inventory.find(entry => entry.id === request.itemId);
        if (!item) throw new Error('Um dos materiais não existe mais no estoque.');
        const conversion = resolveStockUsage(item, request.consumption.quantity, request.consumption.unit);
        if (conversion.ok === false) throw new Error(`${item.name}: ${conversion.error}`);
        if (!request.stockUnit || normalizeStockUnit(request.stockUnit) !== normalizeStockUnit(item.unit) ||
            !Number.isFinite(request.qty) || Math.abs(conversion.quantity - request.qty) > 1e-12) {
          throw new Error(`${item.name}: a conversão foi alterada. Reabra o checklist antes de dar baixa.`);
        }
        return { itemId: request.itemId, qty: conversion.quantity };
      });
      const { updatedInventory, updatedAppointment } = prepareAppointmentStockDeduction(appointment, current.inventory, validatedItems);
      if (!updatedAppointment.customRequiredMaterials && template) {
        updatedAppointment.customRequiredMaterials = structuredClone(template);
      }
      updatedAppointment.stockDeduction = {
        ...updatedAppointment.stockDeduction!,
        items: updatedAppointment.stockDeduction!.items.map(receipt => {
          const item = current.inventory.find(entry => entry.id === receipt.itemId)!;
          const consumptions = items.filter(request => request.itemId === receipt.itemId && request.consumption)
            .map(request => ({ ...request.consumption! }));
          return {
            ...receipt,
            stockUnit: item.unit,
            unitsPerStockUnit: item.unitsPerStockUnit,
            consumptionUnit: item.consumptionUnit,
            ...(consumptions.length > 0 ? { consumptions } : {})
          };
        })
      };
      return {
        ...current,
        version: 1,
        inventory: updatedInventory,
        appointments: current.appointments.map(entry => entry.id === appointmentId ? updatedAppointment : entry)
      };
    })
  };
}
// DentisPro: correcao-comprovante-v1
