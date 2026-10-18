import { STORAGE_KEYS as K } from './storageKeys';
import { APPOINTMENT_STOCK_KEY } from './appointmentStockStore';

type StoragePort = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
const lists: Record<string, string> = {
  patients: K.PATIENTS, appointments: K.APPOINTMENTS, inventory: K.INVENTORY,
  financials: K.FINANCIAL, prescriptions: K.PRESCRIPTIONS, clinicalEvolutions: K.EVOLUTIONS,
  tussProcedures: K.TUSS_PROCEDURES, priceTables: K.PRICE_TABLES, treatmentPlans: K.TREATMENT_PLANS,
  patientPayments: K.PATIENT_PAYMENTS, commissions: K.COMMISSIONS, insuranceGuides: K.INSURANCE_GUIDES,
  documentTemplates: K.DOCUMENT_TEMPLATES, savedClinicDocuments: K.SAVED_DOCUMENTS,
  clinics: K.CLINICS, professionals: K.PROFESSIONALS
};
const maps: Record<string, string> = {
  odontograms: K.ODONTOGRAMS, odontogramSnapshots: K.ODONTOGRAM_SNAPSHOTS,
  clinicalExams: K.CLINICAL_EXAMS, clinicInfo: K.CLINIC_INFO
};
const isObject = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value);

// Only the app's JSON export is accepted. Unknown fields can never write storage/session keys.
export function prepareBackupRestore(json: string): Map<string, string> {
  const data: unknown = JSON.parse(json);
  if (!isObject(data) || data.app !== 'DentisPro Dental Management System') {
    throw new Error('Selecione um backup JSON exportado pelo DentisPro.');
  }
  for (const field of ['patients', 'appointments', 'inventory']) {
    if (!Array.isArray(data[field])) throw new Error(`Backup incompleto: falta ${field}. Nenhum dado foi alterado.`);
  }
  const writes = new Map<string, string>();
  for (const [field, key] of Object.entries(lists)) {
    if (!(field in data)) continue; // Older exports lack documents: preserve them, never silently erase.
    const value = data[field];
    if (!Array.isArray(value) || !value.every(isObject)) throw new Error(`Lista inválida no backup: ${field}.`);
    const identity = field === 'tussProcedures' ? 'code' : 'id';
    const ids = value.map(entry => entry[identity]);
    if (ids.some(id => typeof id !== 'string' || !id.trim()) || new Set(ids).size !== ids.length) {
      throw new Error(`Identificadores ausentes ou repetidos no backup: ${field}.`);
    }
    writes.set(key, JSON.stringify(value));
  }
  for (const [field, key] of Object.entries(maps)) {
    if (!(field in data)) continue;
    if (!isObject(data[field])) throw new Error(`Campo inválido no backup: ${field}.`);
    writes.set(key, JSON.stringify(data[field]));
  }
  if ('layoutTheme' in data) {
    if (typeof data.layoutTheme !== 'string') throw new Error('Tema inválido no backup.');
    writes.set(K.LAYOUT_THEME, JSON.stringify(data.layoutTheme));
  }
  const materialTemplates = data.materialTemplates ?? {};
  if (!isObject(materialTemplates) || !Object.values(materialTemplates).every(value => Array.isArray(value) && value.every(isObject))) {
    throw new Error('Modelos de materiais inválidos no backup.');
  }
  writes.set(APPOINTMENT_STOCK_KEY, JSON.stringify({
    version: 1, appointments: data.appointments, inventory: data.inventory, materialTemplates
  }));
  return writes;
}

// Call under the stock writer lock with other DentisPro tabs closed. This compensates
// synchronous storage errors; localStorage is NOT crash-atomic across different keys.
export function restoreDatabaseBackup(storage: StoragePort, json: string): void {
  const writes = prepareBackupRestore(json);
  const previous = new Map([...writes.keys()].map(key => [key, storage.getItem(key)]));
  const changed: string[] = [];
  try {
    for (const [key, value] of writes) {
      storage.setItem(key, value);
      changed.push(key);
    }
  } catch {
    let rollbackFailed = false;
    for (const key of changed.reverse()) {
      try {
        const value = previous.get(key)!;
        if (value === null) storage.removeItem(key); else storage.setItem(key, value);
      } catch { rollbackFailed = true; }
    }
    throw new Error(rollbackFailed
      ? 'Falha ao restaurar e ao desfazer parte da gravação. Pare de editar e preserve o backup para recuperação.'
      : 'Não foi possível gravar o backup. As alterações desta tentativa foram desfeitas. Verifique o espaço disponível.');
  }
}
