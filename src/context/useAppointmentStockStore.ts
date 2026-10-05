import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import type { SetStateAction } from 'react';
import type { Appointment, InventoryItem } from '../types';
import { APPOINTMENT_STOCK_KEY, APPOINTMENT_STOCK_LOCK, createAppointmentStockStore } from '../utils/appointmentStockStore';

export function useAppointmentStockStore(defaultAppointments: Appointment[], defaultInventory: InventoryItem[]) {
  const [store] = useState(() => createAppointmentStockStore(
    window.localStorage,
    async action => {
      if (!navigator.locks) throw new Error('Este navegador não permite proteger a gravação. Abra o sistema no Chrome em localhost ou HTTPS.');
      await navigator.locks.request(APPOINTMENT_STOCK_LOCK, action);
    },
    { version: 1, appointments: defaultAppointments, inventory: defaultInventory }
  ));
  const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot);
  const reportError = useCallback((error: unknown) => {
    window.alert(error instanceof Error ? error.message : 'Não foi possível salvar o estoque.');
  }, []);
  useEffect(() => {
    const refresh = (event: StorageEvent) => {
      if (event.key === APPOINTMENT_STOCK_KEY || event.key === null) {
        try { store.refresh(); } catch (error) { reportError(error); }
      }
    };
    window.addEventListener('storage', refresh);
    return () => window.removeEventListener('storage', refresh);
  }, [store, reportError]);
  const setAppointments = useCallback((update: SetStateAction<Appointment[]>) => {
    void store.setAppointments(update).catch(reportError);
  }, [store, reportError]);
  const setInventory = useCallback((update: SetStateAction<InventoryItem[]>) => {
    void store.setInventory(update).catch(reportError);
  }, [store, reportError]);
  return {
    ...snapshot, setAppointments, setInventory,
    deductAppointmentStock: store.deduct,
    saveAppointmentMaterials: store.saveMaterials,
    replaceStockData: (data: Parameters<typeof store.replaceData>[0]) => {
      void store.replaceData(data).catch(reportError);
    }
  };
}
