import { normalizePatientRecord } from '../utils/clinicalRecordSummary';
import { WorkspaceStorageContext } from './WorkspaceStorage';
import { memoryWorkspace, SecureWorkspaceSession } from '../utils/secureWorkspace';
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { 
  Patient, 
  Appointment, 
  InventoryItem, 
  FinancialTransaction, 
  Prescription, 
  ToothCondition, 
  OdontogramSnapshot,
  ClinicalEvolutionEntry,
  AppointmentStatus,
  WhatsAppTemplate,
  ClinicUnit,
  Professional,
  TUSSProcedure,
  PriceTable,
  TreatmentPlan,
  ClinicalExam,
  PatientPayment,
  DentistCommissionRecord,
  InsuranceGuide,
  SavedClinicDocument,
  CustomDocumentTemplate
} from '../types';
import { WHATSAPP_TEMPLATES, INITIAL_TUSS_PROCEDURES, DEFAULT_PRICE_TABLES } from '../data/mockData';
import { INITIAL_DOCUMENT_TEMPLATES } from '../data/documentTemplatesCatalog';
import { DEFAULT_DR_HUGO_SIGNATURE, DEFAULT_DR_HUGO_STAMP, cleanSignatureText } from '../utils/formatters';

export type ActiveTab = 'dashboard' | 'pacientes' | 'agendamento' | 'relatorios' | 'configuracoes' | 'exame_clinico' | 'odontograma' | 'estoque' | 'financeiro' | 'triagem' | 'documentos' | 'laudos';

export interface ClinicInfo {
  name: string;
  dentistName: string;
  cro: string;
  specialty: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  cep?: string;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  state?: string;
  cnpj?: string;
  cpf?: string;
  epaoNumber?: string;
  epaoUf?: string;
  croNumber?: string;
  croUf?: string;
  technicalManager?: string;
  website?: string;
  logoUrl?: string;
  headerTitle?: string;
  headerSubtitle?: string;
  watermarkUrl?: string;
  watermarkOpacity?: number; // percentage 0 to 100
  showWatermark?: boolean;
  footerText?: string;
  patientAssistedJustificationText?: string;
  signatureLabel?: string;
  showSignatureLine?: boolean;
  signatureImageUrl?: string;
  stampImageUrl?: string;
  showSignatureImage?: boolean;
  showStampImage?: boolean;
  signatureAlignment?: 'right' | 'center' | 'left';
}

export interface AppContextType {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  
  // Clinics & Professionals
  clinics: ClinicUnit[];
  activeClinic: ClinicUnit | undefined;
  addClinic: (clinic: Omit<ClinicUnit, 'id'>) => ClinicUnit;
  updateClinic: (id: string, clinic: Partial<ClinicUnit>) => void;
  deleteClinic: (id: string) => void;
  professionals: Professional[];
  activeProfessionalId: string;
  setActiveProfessionalId: (id: string) => void;
  activeProfessional: Professional | undefined;
  addProfessional: (prof: Omit<Professional, 'id'>) => Professional;
  updateProfessional: (id: string, prof: Partial<Professional>) => void;
  deleteProfessional: (id: string) => void;
  activeClinicId: string;
  setActiveClinicId: (id: string) => void;
  layoutTheme: string;
  setLayoutTheme: (theme: string) => void;

  // Unified Professional & Clinic Selection with Password Authentication
  selectProfessionalAndClinic: (profId: string, clinicId?: string) => void;
  switchRequest: { targetProfId: string; targetClinicId?: string } | null;
  requestSwitchProfessional: (targetProfId: string, targetClinicId?: string) => void;
  cancelSwitchProfessional: () => void;
  applySwitchProfessional: (targetProfId: string, targetClinicId?: string) => void;
  
  // Patients
  patients: Patient[];
  selectedPatientId: string | null;
  setSelectedPatientId: (id: string | null) => void;
  openPatientProfile: (id: string) => void;
  addPatient: (patient: Omit<Patient, 'id' | 'createdAt'>) => Patient;
  updatePatient: (id: string, patient: Partial<Patient>) => void;
  deletePatient: (id: string) => void;
  
  // Appointments
  appointments: Appointment[];
  addAppointment: (apt: Omit<Appointment, 'id'>) => Appointment;
  updateAppointmentStatus: (id: string, status: AppointmentStatus) => void;
  deleteAppointment: (id: string) => void;
  
  // Inventory
  inventory: InventoryItem[];
  addInventoryItem: (item: Omit<InventoryItem, 'id' | 'lastUpdated'>) => void;
  importInventoryBatch: (items: Omit<InventoryItem, 'id' | 'lastUpdated'>[]) => void;
  updateInventoryItem: (id: string, item: Partial<InventoryItem>) => void;
  adjustStockQuantity: (id: string, delta: number, reason?: string) => void;
  deleteInventoryItem: (id: string) => void;
  clearInventory: () => void;
  
  // Financial
  financials: FinancialTransaction[];
  addTransaction: (transaction: Omit<FinancialTransaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  
  // Dentist Commissions
  commissions: DentistCommissionRecord[];
  addCommission: (commission: Omit<DentistCommissionRecord, 'id'>) => void;
  payCommission: (id: string) => void;
  
  // Insurance / Convênios Guias
  insuranceGuides: InsuranceGuide[];
  addInsuranceGuide: (guide: Omit<InsuranceGuide, 'id'>) => void;
  updateInsuranceGuideStatus: (id: string, status: InsuranceGuide['status'], disallowanceReason?: string, disallowanceValue?: number) => void;
  
  // Prescriptions
  prescriptions: Prescription[];
  addPrescription: (rx: Omit<Prescription, 'id'>) => Prescription;
  deletePrescription: (id: string) => void;
  
  // Odontogram
  odontograms: Record<string, ToothCondition[]>;
  updateToothCondition: (patientId: string, condition: ToothCondition) => void;
  odontogramSnapshots: Record<string, OdontogramSnapshot[]>;
  saveOdontogramSnapshot: (patientId: string, snapshotData: { date: string; title: string; conditions: ToothCondition[]; notes?: string }) => void;
  deleteOdontogramSnapshot: (patientId: string, snapshotId: string) => void;
  restoreOdontogramSnapshot: (patientId: string, snapshotId: string) => void;
  
  // Clinical Evolutions
  clinicalEvolutions: ClinicalEvolutionEntry[];
  addClinicalEvolution: (evo: Omit<ClinicalEvolutionEntry, 'id'>) => void;
  updateClinicalEvolution: (id: string, updatedData: Partial<ClinicalEvolutionEntry>) => void;
  deleteClinicalEvolution: (id: string) => void;
  
  // Clinical Exam (Extraoral & Intraoral & Odontogram Photos)
  clinicalExams: Record<string, ClinicalExam>;
  getClinicalExam: (patientId: string) => ClinicalExam;
  updateClinicalExam: (patientId: string, examData: Partial<ClinicalExam>) => void;
  
  // TUSS Database & Price Tables & Treatment Plans
  tussProcedures: TUSSProcedure[];
  addTussProcedure: (proc: TUSSProcedure) => void;
  updateTussProcedure: (code: string, updatedProc: Partial<TUSSProcedure>) => void;
  deleteTussProcedure: (code: string) => void;
  priceTables: PriceTable[];
  addPriceTable: (table: Omit<PriceTable, 'id'>) => PriceTable;
  updatePriceTable: (id: string, updatedTable: Partial<PriceTable>) => void;
  deletePriceTable: (id: string) => void;
  treatmentPlans: TreatmentPlan[];
  addTreatmentPlan: (plan: Omit<TreatmentPlan, 'id'>) => TreatmentPlan;
  updateTreatmentPlan: (id: string, plan: Partial<TreatmentPlan>) => void;
  deleteTreatmentPlan: (id: string) => void;
  
  // Patient Financial Control & Payments
  patientPayments: PatientPayment[];
  addPatientPayment: (payment: Omit<PatientPayment, 'id' | 'receiptNumber'>) => PatientPayment;
  deletePatientPayment: (id: string) => void;
  
  // Clinic Info & WhatsApp
  clinicInfo: ClinicInfo;
  updateClinicInfo: (info: Partial<ClinicInfo>) => void;
  whatsAppTemplates: WhatsAppTemplate[];
  resetToDefaultData: () => void;
  
  // Saved Clinic Documents (Arquivos Recentes)
  savedClinicDocuments: SavedClinicDocument[];
  addSavedClinicDocument: (doc: Omit<SavedClinicDocument, 'id' | 'createdAt' | 'formattedDateStr' | 'status'>) => SavedClinicDocument;
  deleteSavedClinicDocument: (id: string) => void;

  // Custom Document Templates & Relational Variable Engine
  documentTemplates: CustomDocumentTemplate[];
  updateDocumentTemplate: (id: string, templateText: string, fieldReplacements?: Record<string, string>) => void;
  resetDocumentTemplates: () => void;

  // Database Checkpoint & Backup Management
  createDatabaseCheckpoint: () => { timestamp: string; summary: string };
  exportDatabaseBackupJSON: () => void;
  importDatabaseBackupJSON: (jsonString: string) => boolean;
  lastCheckpointTime: string | null;

  // WhatsApp Action Modal Helper
  whatsAppModalAppointment: Appointment | null;
  setWhatsAppModalAppointment: (apt: Appointment | null) => void;
  openWhatsAppForAppointment: (apt: Appointment) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PATIENTS: 'dentispro_patients_v2',
  APPOINTMENTS: 'dentispro_appointments_v2',
  INVENTORY: 'dentispro_inventory_v2',
  FINANCIAL: 'dentispro_financial_v2',
  PRESCRIPTIONS: 'dentispro_prescriptions_v2',
  ODONTOGRAMS: 'dentispro_odontograms_v2',
  ODONTOGRAM_SNAPSHOTS: 'dentispro_odontogram_snapshots_v2',
  EVOLUTIONS: 'dentispro_evolutions_v2',
  CLINICAL_EXAMS: 'dentispro_clinical_exams_v2',
  TREATMENT_PLANS: 'dentispro_treatment_plans_v2',
  PATIENT_PAYMENTS: 'dentispro_patient_payments_v2',
  TUSS_PROCEDURES: 'dentispro_tuss_procedures_v1',
  PRICE_TABLES: 'dentispro_price_tables_v1',
  CLINIC_INFO: 'dentispro_clinic_info_v1',
  CLINICS: 'dentispro_clinics_v1',
  PROFESSIONALS: 'dentispro_professionals_v1',
  ACTIVE_CLINIC: 'dentispro_active_clinic_v1',
  LAYOUT_THEME: 'dentispro_layout_theme_v1',
  COMMISSIONS: 'dentispro_commissions_v2',
  INSURANCE_GUIDES: 'dentispro_insurance_guides_v2',
  SAVED_DOCUMENTS: 'dentispro_saved_documents_v2',
  DOCUMENT_TEMPLATES: 'dentispro_document_templates_v1',
};

export const AppProvider: React.FC<{ children: React.ReactNode; secure: SecureWorkspaceSession }> = ({ children, secure }) => {
  const storageRef = useRef<ReturnType<typeof memoryWorkspace> | null>(null);
  if (!storageRef.current) storageRef.current = memoryWorkspace(secure);
  const storage = storageRef.current;
  const INITIAL_PATIENTS: Patient[] = [];
  const INITIAL_APPOINTMENTS: Appointment[] = [];
  const INITIAL_INVENTORY: InventoryItem[] = [];
  const INITIAL_FINANCIAL: FinancialTransaction[] = [];
  const INITIAL_PRESCRIPTIONS: Prescription[] = [];
  const INITIAL_CLINICAL_EVOLUTION: ClinicalEvolutionEntry[] = [];
  const INITIAL_CLINICS: ClinicUnit[] = [];
  const INITIAL_PROFESSIONALS: Professional[] = [];
  const INITIAL_TREATMENT_PLANS: TreatmentPlan[] = [];
  const INITIAL_PATIENT_PAYMENTS: PatientPayment[] = [];
  const INITIAL_COMMISSIONS: DentistCommissionRecord[] = [];
  const INITIAL_INSURANCE_GUIDES: InsuranceGuide[] = [];
  const INITIAL_SAVED_DOCUMENTS: SavedClinicDocument[] = [];
  const INITIAL_ODONTOGRAM_DATA: Record<string, ToothCondition[]> = {};
  const INITIAL_ODONTOGRAM_SNAPSHOTS: Record<string, OdontogramSnapshot[]> = {};

  const [activeTab, setActiveTab] = useState<ActiveTab>('pacientes');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(secure.patientId);
  const [whatsAppModalAppointment, setWhatsAppModalAppointment] = useState<Appointment | null>(null);

  // Helper load state with fallback (checks current key, then legacy planetodonto_ key)
  const loadInitial = <T,>(key: string, fallback: T): T => {
    try {
      const item = storage.getItem(key);
      if (item) return JSON.parse(item);
      const legacyKey = key.replace('dentispro_', 'planetodonto_');
      const legacyItem = storage.getItem(legacyKey);
      return legacyItem ? JSON.parse(legacyItem) : fallback;
    } catch {
      return fallback;
    }
  };

  const [clinics, setClinics] = useState<ClinicUnit[]>(() => {
    const loaded = loadInitial<ClinicUnit[]>(STORAGE_KEYS.CLINICS, INITIAL_CLINICS);
    const hasOnline = true;
    const list = hasOnline ? [...loaded] : [
      {
        id: 'cli-online',
        name: 'Atendimento Online',
        address: 'Teleodontologia / Plataforma Digital',
        phone: '(85) 98684-6424',
        city: 'Online / Brasil',
        email: 'contato@dentispro.com.br'
      },
      ...loaded
    ];
    return list.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  });

  const [professionals, setProfessionals] = useState<Professional[]>(() => {
    const loaded = loadInitial<Professional[]>(STORAGE_KEYS.PROFESSIONALS, INITIAL_PROFESSIONALS);
    const normalized = loaded.map(p => {
      if (p.id === 'prof-hugo' || p.name.includes('Hugo Andres')) {
        const hasAllOldClinics = p.clinicIds && p.clinicIds.length >= 6;
        return {
          ...p,
          primaryClinicId: p.primaryClinicId || 'cli-marv',
          clinicIds: hasAllOldClinics ? ['cli-marv', 'cli-online'] : (p.clinicIds || ['cli-marv', 'cli-online']),
          signatureImageUrl: p.signatureImageUrl !== undefined ? p.signatureImageUrl : '',
          stampImageUrl: p.stampImageUrl !== undefined ? p.stampImageUrl : ''
        };
      }
      return p;
    });
    return normalized.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  });
  const [activeProfessionalId, setActiveProfessionalIdState] = useState<string>(() => {
    const loaded = loadInitial('dentispro_active_prof_v1', '');
    const currentProfs = loadInitial<Professional[]>(STORAGE_KEYS.PROFESSIONALS, INITIAL_PROFESSIONALS);
    if (loaded && currentProfs.some(p => p.id === loaded)) return loaded;
    const hugo = currentProfs.find(p => p.id === 'prof-hugo' || p.name.includes('Hugo Andres'));
    return hugo?.id || currentProfs[0]?.id || '';
  });
  const [activeClinicId, setActiveClinicId] = useState<string>(() => loadInitial(STORAGE_KEYS.ACTIVE_CLINIC, 'todas'));
  const [layoutTheme, setLayoutTheme] = useState<string>(() => loadInitial(STORAGE_KEYS.LAYOUT_THEME, 'natural'));

  const [patients, setPatients] = useState<Patient[]>(() => {
    const list = loadInitial<Patient[]>(STORAGE_KEYS.PATIENTS, INITIAL_PATIENTS);
    const existingIds = new Set(list.map(p => p.id));
    const missing = INITIAL_PATIENTS.filter(p => !existingIds.has(p.id));
    const merged = missing.length > 0 ? [...list, ...missing] : list;
    return merged.map(normalizePatientRecord).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' }));
  });
  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const list = loadInitial<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, INITIAL_APPOINTMENTS);
    const existingIds = new Set(list.map(a => a.id));
    const missing = INITIAL_APPOINTMENTS.filter(a => !existingIds.has(a.id));
    const merged = missing.length > 0 ? [...list, ...missing] : list;
    return merged.sort((a, b) => `${b.date} ${b.time || ''}`.localeCompare(`${a.date} ${a.time || ''}`));
  });
  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const loaded = loadInitial<InventoryItem[]>(STORAGE_KEYS.INVENTORY, INITIAL_INVENTORY);
    const seenNames = new Set<string>();
    const seenCodes = new Set<string>();
    const idsToRemove = new Set(['inv-76172', 'inv-puc-34']);
    const clean: InventoryItem[] = [];

    const cleanItem = (item: InventoryItem): InventoryItem => {
      let id = item.id;
      if (id && id.startsWith('inv-puc-')) {
        id = id.replace('inv-puc-', 'inv-acd-');
      }
      let itemCode = item.itemCode || '';
      if (itemCode.toUpperCase().startsWith('PUC-')) {
        itemCode = itemCode.replace(/PUC-/i, 'ACD-');
      }
      let supplier = item.supplier || '';
      if (supplier.toUpperCase().includes('PUC')) {
        supplier = supplier.replace(/PUC\s*(Campinas|Academic)?/gi, 'Dental Cremer').trim();
      }
      let notes = item.notes || '';
      if (notes.toUpperCase().includes('PUC')) {
        notes = notes.replace(/PUC\s*(Campinas|Academic)?/gi, '').trim();
      }
      let name = item.name || '';
      if (name.toUpperCase().includes('PUC')) {
        name = name.replace(/PUC\s*(Campinas|Academic)?/gi, '').trim();
      }
      return {
        ...item,
        id,
        itemCode,
        supplier,
        notes,
        name
      };
    };

    const initialMap = new Map<string, InventoryItem>();
    INITIAL_INVENTORY.forEach(item => {
      if (item.id) initialMap.set(item.id, item);
      if (item.itemCode) initialMap.set(item.itemCode, item);
    });

    const processItem = (rawItem: InventoryItem) => {
      if (!rawItem) return;
      const item = cleanItem(rawItem);
      if (idsToRemove.has(item.id) || idsToRemove.has(item.itemCode || '')) return;
      if (item.id && item.id.startsWith('inv-off-')) return;

      if (item.id && initialMap.has(item.id)) {
        const initItem = initialMap.get(item.id)!;
        if (initItem.quantity > 0) {
          item.quantity = Math.max(item.quantity, initItem.quantity);
        }
      }

      const normName = (item.name || '').trim().toLowerCase();
      const normCode = (item.itemCode || '').trim().toLowerCase();

      if (normName && seenNames.has(normName)) return;
      if (normCode && seenCodes.has(normCode)) return;

      if (normName) seenNames.add(normName);
      if (normCode) seenCodes.add(normCode);
      clean.push(item);
    };

    loaded.forEach(processItem);
    INITIAL_INVENTORY.forEach(processItem);
    return clean.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'pt-BR'));
  });
  const [financials, setFinancials] = useState<FinancialTransaction[]>(() => {
    const list = loadInitial<FinancialTransaction[]>(STORAGE_KEYS.FINANCIAL, INITIAL_FINANCIAL);
    const existingIds = new Set(list.map(f => f.id));
    const missing = INITIAL_FINANCIAL.filter(f => !existingIds.has(f.id));
    const merged = missing.length > 0 ? [...list, ...missing] : list;
    return merged.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  });
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(() => {
    const list = loadInitial<Prescription[]>(STORAGE_KEYS.PRESCRIPTIONS, INITIAL_PRESCRIPTIONS);
    const existingIds = new Set(list.map(p => p.id));
    const missing = INITIAL_PRESCRIPTIONS.filter(p => !existingIds.has(p.id));
    const merged = missing.length > 0 ? [...list, ...missing] : list;
    return merged.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  });
  const [odontograms, setOdontograms] = useState<Record<string, ToothCondition[]>>(() => {
    const loaded = loadInitial<Record<string, ToothCondition[]>>(STORAGE_KEYS.ODONTOGRAMS, INITIAL_ODONTOGRAM_DATA);
    return { ...INITIAL_ODONTOGRAM_DATA, ...loaded };
  });
  const [odontogramSnapshots, setOdontogramSnapshots] = useState<Record<string, OdontogramSnapshot[]>>(() => loadInitial(STORAGE_KEYS.ODONTOGRAM_SNAPSHOTS, INITIAL_ODONTOGRAM_SNAPSHOTS));
  const [clinicalEvolutions, setClinicalEvolutions] = useState<ClinicalEvolutionEntry[]>(() => {
    const list = loadInitial<ClinicalEvolutionEntry[]>(STORAGE_KEYS.EVOLUTIONS, INITIAL_CLINICAL_EVOLUTION);
    const existingIds = new Set(list.map(e => e.id));
    const missing = INITIAL_CLINICAL_EVOLUTION.filter(e => !existingIds.has(e.id));
    const merged = missing.length > 0 ? [...list, ...missing] : list;
    return merged.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  });
  const [clinicalExams, setClinicalExams] = useState<Record<string, ClinicalExam>>(() => loadInitial(STORAGE_KEYS.CLINICAL_EXAMS, {}));
  const [tussProcedures, setTussProcedures] = useState<TUSSProcedure[]>(() => {
    const loaded = loadInitial<TUSSProcedure[]>(STORAGE_KEYS.TUSS_PROCEDURES, INITIAL_TUSS_PROCEDURES);
    const officialMap = new Map(INITIAL_TUSS_PROCEDURES.map(p => [p.code, p]));
    const result: TUSSProcedure[] = [];
    const seenCodes = new Set<string>();

    loaded.forEach(item => {
      if (!item || !item.code) return;
      seenCodes.add(item.code);
      const official = officialMap.get(item.code);
      if (official) {
        result.push({
          ...official,
          ...item,
          subgroup: item.subgroup || official.subgroup,
          odontoGrouping: item.odontoGrouping || official.odontoGrouping,
          coverageLevel: item.coverageLevel || official.coverageLevel,
          ansRolCurrent: official.ansRolCurrent ?? item.ansRolCurrent,
          vigenciaAns: official.vigenciaAns || item.vigenciaAns,
          specialty: item.specialty || official.specialty,
          allowedRegions: item.allowedRegions || official.allowedRegions,
          defaultRegion: item.defaultRegion || official.defaultRegion,
        });
      } else {
        result.push(item);
      }
    });

    INITIAL_TUSS_PROCEDURES.forEach(official => {
      if (!seenCodes.has(official.code)) {
        result.push(official);
        seenCodes.add(official.code);
      }
    });

    return result.sort((a, b) => a.description.localeCompare(b.description, 'pt-BR', { sensitivity: 'base' }));
  });
  const [priceTables, setPriceTables] = useState<PriceTable[]>(() => {
    const loaded = loadInitial<PriceTable[]>(STORAGE_KEYS.PRICE_TABLES, DEFAULT_PRICE_TABLES);
    const existingIds = new Set(loaded.map(t => t.id));
    const missing = DEFAULT_PRICE_TABLES.filter(t => !existingIds.has(t.id));
    const merged = missing.length > 0 ? [...loaded, ...missing] : loaded;
    return [...merged].sort((a, b) => {
      if (a.isDefault) return -1;
      if (b.isDefault) return 1;
      return (a.name || '').localeCompare(b.name || '', 'pt-BR');
    });
  });
  const [treatmentPlans, setTreatmentPlans] = useState<TreatmentPlan[]>(() => {
    const list = loadInitial<TreatmentPlan[]>(STORAGE_KEYS.TREATMENT_PLANS, INITIAL_TREATMENT_PLANS);
    const existingIds = new Set(list.map(p => p.id));
    const missing = INITIAL_TREATMENT_PLANS.filter(p => !existingIds.has(p.id));
    const merged = missing.length > 0 ? [...list, ...missing] : list;
    return merged.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  });
  const [patientPayments, setPatientPayments] = useState<PatientPayment[]>(() => {
    const list = loadInitial<PatientPayment[]>(STORAGE_KEYS.PATIENT_PAYMENTS, INITIAL_PATIENT_PAYMENTS);
    const existingIds = new Set(list.map(p => p.id));
    const missing = INITIAL_PATIENT_PAYMENTS.filter(p => !existingIds.has(p.id));
    const merged = missing.length > 0 ? [...list, ...missing] : list;
    return merged.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  });
  const [commissions, setCommissions] = useState<DentistCommissionRecord[]>(() => loadInitial(STORAGE_KEYS.COMMISSIONS, INITIAL_COMMISSIONS));
  const [insuranceGuides, setInsuranceGuides] = useState<InsuranceGuide[]>(() => loadInitial(STORAGE_KEYS.INSURANCE_GUIDES, INITIAL_INSURANCE_GUIDES));
  const [savedClinicDocuments, setSavedClinicDocuments] = useState<SavedClinicDocument[]>(() => {
    const loaded = loadInitial<SavedClinicDocument[]>(STORAGE_KEYS.SAVED_DOCUMENTS, INITIAL_SAVED_DOCUMENTS);
    return [...loaded].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  });
  
  const [clinicInfo, setClinicInfo] = useState<ClinicInfo>(() => {
    const defaultObj: ClinicInfo = {name: 'DentisPro', dentistName: '', cro: '', specialty: '', phone: '', email: '', address: '', city: '', showSignatureImage: false, showStampImage: false};
    const loaded = loadInitial<ClinicInfo>(STORAGE_KEYS.CLINIC_INFO, defaultObj);
    const withDefaults: ClinicInfo = {
      ...loaded,
      headerSubtitle: cleanSignatureText(loaded.headerSubtitle) || defaultObj.headerSubtitle,
      signatureLabel: cleanSignatureText(loaded.signatureLabel) || defaultObj.signatureLabel,
      signatureImageUrl: loaded.signatureImageUrl !== undefined ? loaded.signatureImageUrl : '',
      stampImageUrl: loaded.stampImageUrl !== undefined ? loaded.stampImageUrl : '',
      name: (loaded && loaded.name && loaded.name.trim().toUpperCase() === 'MARV') ? 'DentisPro' : loaded.name
    };
    return withDefaults;
  });

  const [documentTemplates, setDocumentTemplates] = useState<CustomDocumentTemplate[]>(() => {
    const loaded = loadInitial<CustomDocumentTemplate[]>(STORAGE_KEYS.DOCUMENT_TEMPLATES, INITIAL_DOCUMENT_TEMPLATES);
    return [...loaded].sort((a, b) => (a.title || '').localeCompare(b.title || '', 'pt-BR', { sensitivity: 'base' }));
  });

  const updateDocumentTemplate = (id: string, templateText: string, fieldReplacements?: Record<string, string>) => {
    setDocumentTemplates(prev => prev.map(tpl => {
      if (tpl.id === id) {
        return {
          ...tpl,
          templateText,
          fieldReplacements: fieldReplacements !== undefined ? fieldReplacements : tpl.fieldReplacements,
          updatedAt: new Date().toISOString()
        };
      }
      return tpl;
    }));
  };

  const resetDocumentTemplates = () => {
    setDocumentTemplates([...INITIAL_DOCUMENT_TEMPLATES].sort((a, b) => a.title.localeCompare(b.title, 'pt-BR', { sensitivity: 'base' })));
  };

  // Sync only to the in-memory workspace; the parent explicitly saves a server version.
  useEffect(() => { storage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(patients)); }, [patients]);
  useEffect(() => { storage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments)); }, [appointments]);
  useEffect(() => { storage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(inventory)); }, [inventory]);
  useEffect(() => { storage.setItem(STORAGE_KEYS.FINANCIAL, JSON.stringify(financials)); }, [financials]);
  useEffect(() => { storage.setItem(STORAGE_KEYS.PRESCRIPTIONS, JSON.stringify(prescriptions)); }, [prescriptions]);
  useEffect(() => { storage.setItem(STORAGE_KEYS.ODONTOGRAMS, JSON.stringify(odontograms)); }, [odontograms]);
  useEffect(() => { storage.setItem(STORAGE_KEYS.ODONTOGRAM_SNAPSHOTS, JSON.stringify(odontogramSnapshots)); }, [odontogramSnapshots]);
  useEffect(() => { storage.setItem(STORAGE_KEYS.EVOLUTIONS, JSON.stringify(clinicalEvolutions)); }, [clinicalEvolutions]);
  useEffect(() => { storage.setItem(STORAGE_KEYS.CLINICAL_EXAMS, JSON.stringify(clinicalExams)); }, [clinicalExams]);
  useEffect(() => { storage.setItem(STORAGE_KEYS.TREATMENT_PLANS, JSON.stringify(treatmentPlans)); }, [treatmentPlans]);
  useEffect(() => { storage.setItem(STORAGE_KEYS.PATIENT_PAYMENTS, JSON.stringify(patientPayments)); }, [patientPayments]);
  useEffect(() => { storage.setItem(STORAGE_KEYS.TUSS_PROCEDURES, JSON.stringify(tussProcedures)); }, [tussProcedures]);
  useEffect(() => { storage.setItem(STORAGE_KEYS.PRICE_TABLES, JSON.stringify(priceTables)); }, [priceTables]);
  useEffect(() => { storage.setItem(STORAGE_KEYS.COMMISSIONS, JSON.stringify(commissions)); }, [commissions]);
  useEffect(() => { storage.setItem(STORAGE_KEYS.INSURANCE_GUIDES, JSON.stringify(insuranceGuides)); }, [insuranceGuides]);
  useEffect(() => { storage.setItem(STORAGE_KEYS.SAVED_DOCUMENTS, JSON.stringify(savedClinicDocuments)); }, [savedClinicDocuments]);
  useEffect(() => { storage.setItem(STORAGE_KEYS.DOCUMENT_TEMPLATES, JSON.stringify(documentTemplates)); }, [documentTemplates]);
  useEffect(() => { storage.setItem(STORAGE_KEYS.CLINICS, JSON.stringify(clinics)); }, [clinics]);
  useEffect(() => { storage.setItem(STORAGE_KEYS.PROFESSIONALS, JSON.stringify(professionals)); }, [professionals]);
  useEffect(() => { storage.setItem(STORAGE_KEYS.ACTIVE_CLINIC, JSON.stringify(activeClinicId)); }, [activeClinicId]);
  useEffect(() => { 
    storage.setItem(STORAGE_KEYS.LAYOUT_THEME, JSON.stringify(layoutTheme));
    document.documentElement.setAttribute('data-theme', layoutTheme);
    if (layoutTheme === 'dark-executive') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [layoutTheme]);

  // Saved Clinic Documents Handlers
  const addSavedClinicDocument = (docData: Omit<SavedClinicDocument, 'id' | 'createdAt' | 'formattedDateStr' | 'status'>) => {
    const now = new Date();
    const formattedDateStr = `${now.toLocaleDateString('pt-BR')} ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    const newDoc: SavedClinicDocument = {
      ...docData,
      id: `doc-saved-${Date.now()}`,
      createdAt: now.toISOString(),
      formattedDateStr,
      status: 'gerado'
    };
    setSavedClinicDocuments(prev => [newDoc, ...prev]);
    return newDoc;
  };

  const deleteSavedClinicDocument = (id: string) => {
    setSavedClinicDocuments(prev => prev.filter(d => d.id !== id));
  };
  useEffect(() => { storage.setItem(STORAGE_KEYS.CLINIC_INFO, JSON.stringify(clinicInfo)); }, [clinicInfo]);

  // Dentist Commissions Handlers
  const addCommission = (commData: Omit<DentistCommissionRecord, 'id'>) => {
    const newComm: DentistCommissionRecord = {
      ...commData,
      id: `com-${Date.now()}`
    };
    setCommissions(prev => [newComm, ...prev]);
  };

  const payCommission = (id: string) => {
    setCommissions(prev => prev.map(c => {
      if (c.id === id) {
        const paidComm = { ...c, status: 'pago' as const, paymentDate: new Date().toISOString().split('T')[0] };
        // Optionally generate a financial expense automatically
        addTransaction({
          type: 'despesa',
          category: 'Comissões',
          description: `Repasse de Comissão - ${c.professionalName} (${c.procedureName})`,
          amount: c.commissionAmount,
          date: new Date().toISOString().split('T')[0],
          paymentMethod: 'pix',
          status: 'pago'
        });
        return paidComm;
      }
      return c;
    }));
  };

  // Insurance Guides Handlers
  const addInsuranceGuide = (guideData: Omit<InsuranceGuide, 'id'>) => {
    const newGuide: InsuranceGuide = {
      ...guideData,
      id: `gui-${Date.now()}`
    };
    setInsuranceGuides(prev => [newGuide, ...prev]);
  };

  const updateInsuranceGuideStatus = (
    id: string, 
    status: InsuranceGuide['status'], 
    disallowanceReason?: string, 
    disallowanceValue?: number
  ) => {
    setInsuranceGuides(prev => prev.map(g => {
      if (g.id === id) {
        return {
          ...g,
          status,
          ...(disallowanceReason ? { disallowanceReason } : {}),
          ...(disallowanceValue !== undefined ? { disallowanceValue } : {})
        };
      }
      return g;
    }));
  };

  // TUSS Procedures Handlers
  const addTussProcedure = (proc: TUSSProcedure) => {
    setTussProcedures(prev => [proc, ...prev.filter(p => p.code !== proc.code)]);
  };

  const updateTussProcedure = (code: string, updatedProc: Partial<TUSSProcedure>) => {
    setTussProcedures(prev => prev.map(p => p.code === code ? { ...p, ...updatedProc } : p));
  };

  const deleteTussProcedure = (code: string) => {
    setTussProcedures(prev => prev.filter(p => p.code !== code));
  };

  // Price Tables Handlers
  const addPriceTable = (tableData: Omit<PriceTable, 'id'>): PriceTable => {
    const newTable: PriceTable = {
      ...tableData,
      id: `price-table-${Date.now()}`
    };
    setPriceTables(prev => [...prev, newTable]);
    return newTable;
  };

  const updatePriceTable = (id: string, updatedTable: Partial<PriceTable>) => {
    setPriceTables(prev => prev.map(t => t.id === id ? { ...t, ...updatedTable } : t));
  };

  const deletePriceTable = (id: string) => {
    setPriceTables(prev => prev.filter(t => t.id !== id));
  };
  useEffect(() => { storage.setItem(STORAGE_KEYS.CLINICS, JSON.stringify(clinics)); }, [clinics]);
  useEffect(() => { storage.setItem(STORAGE_KEYS.PROFESSIONALS, JSON.stringify(professionals)); }, [professionals]);
  useEffect(() => { storage.setItem(STORAGE_KEYS.ACTIVE_CLINIC, JSON.stringify(activeClinicId)); }, [activeClinicId]);
  useEffect(() => { storage.setItem(STORAGE_KEYS.LAYOUT_THEME, JSON.stringify(layoutTheme)); }, [layoutTheme]);

  // Open Patient Profile helper
  const openPatientProfile = (id: string) => {
    setSelectedPatientId(id);
    setActiveTab('pacientes');
  };

  // Add Patient
  const addPatient = (patientData: Omit<Patient, 'id' | 'createdAt'>): Patient => {
    const newPatient: Patient = {
      ...patientData,
      id: `pat-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setPatients(prev => [...prev, newPatient].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' })));
    return newPatient;
  };

  // Update Patient
  const updatePatient = (id: string, updatedData: Partial<Patient>) => {
    setPatients(prev => prev.map(p => p.id === id ? { ...p, ...updatedData } : p).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' })));
  };

  // Delete Patient
  const deletePatient = (id: string) => {
    setPatients(prev => prev.filter(p => p.id !== id));
    if (selectedPatientId === id) setSelectedPatientId(null);
  };

  // Add Appointment
  const addAppointment = (aptData: Omit<Appointment, 'id'>): Appointment => {
    const newApt: Appointment = {
      ...aptData,
      id: `apt-${Date.now()}`
    };
    setAppointments(prev => [newApt, ...prev].sort((a, b) => `${b.date} ${b.time || ''}`.localeCompare(`${a.date} ${a.time || ''}`)));

    // Automatically log financial entry if value > 0
    if (newApt.value > 0) {
      addTransaction({
        type: 'receita',
        category: 'Atendimento Clínico',
        description: `${newApt.procedure} - ${newApt.patientName}`,
        amount: newApt.value,
        date: newApt.date,
        patientId: newApt.patientId,
        clinicId: newApt.clinicId,
        clinicName: newApt.clinicName,
        paymentMethod: 'pix',
        status: newApt.status === 'concluido' ? 'pago' : 'pendente'
      });
    }

    return newApt;
  };

  // Update Appointment Status
  const updateAppointmentStatus = (id: string, status: AppointmentStatus) => {
    setAppointments(prev => prev.map(apt => {
      if (apt.id === id) {
        return { ...apt, status };
      }
      return apt;
    }));
  };

  // Delete Appointment
  const deleteAppointment = (id: string) => {
    setAppointments(prev => prev.filter(apt => apt.id !== id));
  };

  // Add Inventory Item
  const addInventoryItem = (itemData: Omit<InventoryItem, 'id' | 'lastUpdated'>) => {
    const newItem: InventoryItem = {
      ...itemData,
      id: `inv-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    setInventory(prev => [...prev, newItem].sort((a, b) => (a.name || '').localeCompare(b.name || '', 'pt-BR')));
  };

  const importInventoryBatch = (itemsData: Omit<InventoryItem, 'id' | 'lastUpdated'>[]) => {
    const today = new Date().toISOString().split('T')[0];
    setInventory(prev => {
      const existingNames = new Set(prev.map(i => (i.name || '').trim().toLowerCase()));
      const existingCodes = new Set(prev.map(i => (i.itemCode || '').trim().toLowerCase()));
      
      const newItems: InventoryItem[] = [];
      itemsData.forEach((item, idx) => {
        const nameKey = (item.name || '').trim().toLowerCase();
        const codeKey = (item.itemCode || '').trim().toLowerCase();

        if ((nameKey && existingNames.has(nameKey)) || (codeKey && existingCodes.has(codeKey))) {
          return; // Skip duplicate
        }
        if (nameKey) existingNames.add(nameKey);
        if (codeKey) existingCodes.add(codeKey);

        newItems.push({
          ...item,
          id: `inv-batch-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 4)}`,
          lastUpdated: today
        });
      });

      return [...prev, ...newItems].sort((a, b) => (a.name || '').localeCompare(b.name || '', 'pt-BR'));
    });
  };

  // Update Inventory Item
  const updateInventoryItem = (id: string, itemData: Partial<InventoryItem>) => {
    setInventory(prev => prev.map(item => item.id === id ? { 
      ...item, 
      ...itemData, 
      lastUpdated: new Date().toISOString().split('T')[0] 
    } : item).sort((a, b) => (a.name || '').localeCompare(b.name || '', 'pt-BR')));
  };

  // Adjust Stock Quantity
  const adjustStockQuantity = (id: string, delta: number, reason?: string) => {
    setInventory(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.quantity + delta);
        return {
          ...item,
          quantity: newQty,
          lastUpdated: new Date().toISOString().split('T')[0]
        };
      }
      return item;
    }));
  };

  // Delete Inventory Item
  const deleteInventoryItem = (id: string) => {
    setInventory(prev => prev.filter(item => item.id !== id));
  };

  // Clear All Inventory Items
  const clearInventory = () => {
    setInventory([]);
  };

  // Add Financial Transaction
  const addTransaction = (tData: Omit<FinancialTransaction, 'id'>) => {
    const newTransaction: FinancialTransaction = {
      ...tData,
      id: `fin-${Date.now()}`
    };
    setFinancials(prev => [newTransaction, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  // Delete Financial Transaction
  const deleteTransaction = (id: string) => {
    setFinancials(prev => prev.filter(t => t.id !== id));
  };

  // Add Prescription
  const addPrescription = (rxData: Omit<Prescription, 'id'>): Prescription => {
    const newRx: Prescription = {
      ...rxData,
      id: `rx-${Date.now()}`
    };
    setPrescriptions(prev => [newRx, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    return newRx;
  };

  // Delete Prescription
  const deletePrescription = (id: string) => {
    setPrescriptions(prev => prev.filter(rx => rx.id !== id));
  };

  // Update Odontogram Condition for a tooth
  const updateToothCondition = (patientId: string, condition: ToothCondition) => {
    setOdontograms(prev => {
      const patientConditions = prev[patientId] || [];
      const existingIndex = patientConditions.findIndex(c => c.toothNumber === condition.toothNumber);
      
      let updatedList: ToothCondition[];
      if (existingIndex >= 0) {
        updatedList = [...patientConditions];
        updatedList[existingIndex] = {
          ...updatedList[existingIndex],
          ...condition,
          surfaces: {
            ...(updatedList[existingIndex].surfaces || {}),
            ...(condition.surfaces || {})
          }
        };
      } else {
        updatedList = [...patientConditions, condition];
      }

      return {
        ...prev,
        [patientId]: updatedList
      };
    });
  };

  const saveOdontogramSnapshot = (patientId: string, snapshotData: { date: string; title: string; conditions: ToothCondition[]; notes?: string }) => {
    const newSnapshot: OdontogramSnapshot = {
      id: `snap-${Date.now()}`,
      patientId,
      date: snapshotData.date,
      title: snapshotData.title,
      conditions: snapshotData.conditions,
      notes: snapshotData.notes,
      dentistName: activeProfessional?.name || clinicInfo.dentistName,
      createdAt: new Date().toISOString()
    };
    setOdontogramSnapshots(prev => ({
      ...prev,
      [patientId]: [newSnapshot, ...(prev[patientId] || [])]
    }));
  };

  const deleteOdontogramSnapshot = (patientId: string, snapshotId: string) => {
    setOdontogramSnapshots(prev => ({
      ...prev,
      [patientId]: (prev[patientId] || []).filter(s => s.id !== snapshotId)
    }));
  };

  const restoreOdontogramSnapshot = (patientId: string, snapshotId: string) => {
    const list = odontogramSnapshots[patientId] || [];
    const target = list.find(s => s.id === snapshotId);
    if (target) {
      setOdontograms(prev => ({
        ...prev,
        [patientId]: JSON.parse(JSON.stringify(target.conditions))
      }));
    }
  };

  // Add Clinical Evolution
  const addClinicalEvolution = (evoData: Omit<ClinicalEvolutionEntry, 'id'>) => {
    const newEvo: ClinicalEvolutionEntry = {
      ...evoData,
      id: `evo-${Date.now()}`
    };
    setClinicalEvolutions(prev => [newEvo, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));

    // Sync any evolution photos into the patient's central media database
    if (newEvo.images && newEvo.images.length > 0) {
      setPatients(prevPatients => prevPatients.map(p => {
        if (p.id === newEvo.patientId) {
          const currentImgs = p.images || [];
          const combined = Array.from(new Set([...currentImgs, ...(newEvo.images || [])]));
          return { ...p, images: combined };
        }
        return p;
      }));
    }
  };

  const updateClinicalEvolution = (id: string, updatedData: Partial<ClinicalEvolutionEntry>) => {
    if (secure.initialStorage.dentispro_evolutions_v2?.some((entry: ClinicalEvolutionEntry) => entry.id === id)) {
      alert('Evolução finalizada. Registre um novo complemento para preservar o histórico.'); return;
    }
    setClinicalEvolutions(prev => prev.map(evo => evo.id === id ? { ...evo, ...updatedData } : evo).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  const deleteClinicalEvolution = (id: string) => {
    if (secure.initialStorage.dentispro_evolutions_v2?.some((entry: ClinicalEvolutionEntry) => entry.id === id)) {
      alert('Evolução finalizada. Registre um novo complemento para preservar o histórico.'); return;
    }
    setClinicalEvolutions(prev => prev.filter(evo => evo.id !== id));
  };

  // Treatment Plans CRUD
  const addTreatmentPlan = (planData: Omit<TreatmentPlan, 'id'>): TreatmentPlan => {
    const newPlan: TreatmentPlan = {
      ...planData,
      id: `plan-${Date.now()}`
    };
    setTreatmentPlans(prev => [newPlan, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    return newPlan;
  };

  const updateTreatmentPlan = (id: string, updatedData: Partial<TreatmentPlan>) => {
    setTreatmentPlans(prev => prev.map(plan => plan.id === id ? { ...plan, ...updatedData } : plan).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  const deleteTreatmentPlan = (id: string) => {
    setTreatmentPlans(prev => prev.filter(plan => plan.id !== id));
  };

  // Professional Handlers
  const activeProfessional = professionals.find(p => p.id === activeProfessionalId) || professionals[0];

  const [switchRequest, setSwitchRequest] = useState<{ targetProfId: string; targetClinicId?: string } | null>(null);

  const selectProfessionalAndClinic = (profId: string, clinicId?: string) => {
    setActiveProfessionalIdState(profId);
    storage.setItem('dentispro_active_prof_v1', JSON.stringify(profId));
    
    const prof = professionals.find(p => p.id === profId);
    let chosenClinicId = clinicId;
    if (!chosenClinicId) {
      if (prof?.primaryClinicId && clinics.some(c => c.id === prof.primaryClinicId)) {
        chosenClinicId = prof.primaryClinicId;
      } else if (prof?.clinicIds && prof.clinicIds.length > 0 && clinics.some(c => c.id === prof.clinicIds[0])) {
        chosenClinicId = prof.clinicIds[0];
      } else {
        chosenClinicId = activeClinicId;
      }
    }

    if (chosenClinicId) {
      setActiveClinicId(chosenClinicId);
      storage.setItem(STORAGE_KEYS.ACTIVE_CLINIC, JSON.stringify(chosenClinicId));
    }

    if (prof) {
      const selectedClinic = clinics.find(c => c.id === chosenClinicId);
      setClinicInfo(prev => ({
        ...prev,
        dentistName: prof.name,
        cro: prof.cro,
        specialty: prof.specialty,
        phone: prof.phone || selectedClinic?.phone || prev.phone,
        email: prof.email || selectedClinic?.email || prev.email,
        address: selectedClinic?.address || prev.address,
        city: selectedClinic?.city || prev.city,
        name: selectedClinic?.name || prev.name
      }));
    }
  };

  const requestSwitchProfessional = (targetProfId: string, targetClinicId?: string) => {
    if (targetProfId === activeProfessionalId) {
      if (targetClinicId && targetClinicId !== activeClinicId) {
        setActiveClinicId(targetClinicId);
        storage.setItem(STORAGE_KEYS.ACTIVE_CLINIC, JSON.stringify(targetClinicId));
      }
      return;
    }
    setSwitchRequest({ targetProfId, targetClinicId });
  };

  const cancelSwitchProfessional = () => {
    setSwitchRequest(null);
  };

  const applySwitchProfessional = (targetProfId: string, targetClinicId?: string) => {
    selectProfessionalAndClinic(targetProfId, targetClinicId);
    setSwitchRequest(null);
  };

  const setActiveProfessionalId = (id: string) => {
    selectProfessionalAndClinic(id);
  };

  const addProfessional = (profData: Omit<Professional, 'id'>): Professional => {
    const newProf: Professional = {
      ...profData,
      id: `prof-${Date.now()}`
    };
    setProfessionals(prev => [...prev, newProf].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')));
    return newProf;
  };

  const updateProfessional = (id: string, updated: Partial<Professional>) => {
    setProfessionals(prev => prev.map(p => p.id === id ? { ...p, ...updated } : p).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')));
  };

  const deleteProfessional = (id: string) => {
    setProfessionals(prev => {
      const remaining = prev.filter(p => p.id !== id);
      if (activeProfessionalId === id) {
        if (remaining.length > 0) {
          setActiveProfessionalId(remaining[0].id);
        }
      }
      return remaining;
    });
  };

  // Clinics Management Handlers
  const activeClinic = clinics.find(c => c.id === activeClinicId);

  const addClinic = (clinicData: Omit<ClinicUnit, 'id'>): ClinicUnit => {
    const newClinic: ClinicUnit = {
      ...clinicData,
      id: `cli-${Date.now()}`
    };
    setClinics(prev => [...prev, newClinic].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')));
    return newClinic;
  };

  const updateClinic = (id: string, updated: Partial<ClinicUnit>) => {
    setClinics(prev => prev.map(c => c.id === id ? { ...c, ...updated } : c).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')));
  };

  const deleteClinic = (id: string) => {
    setClinics(prev => {
      const remaining = prev.filter(c => c.id !== id);
      if (activeClinicId === id) {
        setActiveClinicId(remaining.length > 0 ? remaining[0].id : 'todas');
      }
      return remaining;
    });
    // Remove deleted clinic from professionals' clinic associations
    setProfessionals(prev => prev.map(p => ({
      ...p,
      clinicIds: p.clinicIds ? p.clinicIds.filter(cid => cid !== id) : []
    })));
  };

  // Update Clinic Info
  const updateClinicInfo = (info: Partial<ClinicInfo>) => {
    setClinicInfo(prev => ({ ...prev, ...info }));
  };

  // Clinical Exam Handlers
  const getClinicalExam = (pId: string): ClinicalExam => {
    const p = patients.find(patient => patient.id === pId);
    const patientMedia = p?.images || [];

    const existing = clinicalExams[pId];
    if (existing) {
      const unifiedImages = patientMedia.length > 0 ? patientMedia : (existing.odontogramImages || []);
      return {
        ...existing,
        odontogramImages: unifiedImages,
        extraoral: { ...existing.extraoral, images: unifiedImages },
        intraoral: { ...existing.intraoral, images: unifiedImages }
      };
    }

    return {
      patientId: pId,
      updatedAt: new Date().toISOString(),
      extraoral: { images: patientMedia },
      intraoral: { images: patientMedia },
      odontogramImages: patientMedia
    };
  };

  const updateClinicalExam = (pId: string, examData: Partial<ClinicalExam>) => {
    const newImgs = examData.odontogramImages !== undefined 
      ? examData.odontogramImages 
      : examData.extraoral?.images !== undefined 
        ? examData.extraoral.images 
        : examData.intraoral?.images !== undefined 
          ? examData.intraoral.images 
          : undefined;

    if (newImgs !== undefined) {
      setPatients(prevList => prevList.map(p => p.id === pId ? { ...p, images: newImgs } : p));
    }

    setClinicalExams(prev => {
      const existing = getClinicalExam(pId);
      const updatedImages = newImgs !== undefined ? newImgs : (existing.odontogramImages || []);

      const updated: ClinicalExam = {
        ...existing,
        ...examData,
        extraoral: {
          ...existing.extraoral,
          ...(examData.extraoral || {}),
          images: updatedImages
        },
        intraoral: {
          ...existing.intraoral,
          ...(examData.intraoral || {}),
          images: updatedImages
        },
        odontogramImages: updatedImages,
        updatedAt: new Date().toISOString()
      };
      return { ...prev, [pId]: updated };
    });
  };

  // Patient Payments Handlers
  const addPatientPayment = (paymentData: Omit<PatientPayment, 'id' | 'receiptNumber'>): PatientPayment => {
    const seq = patientPayments.length + 1;
    const newPayment: PatientPayment = {
      ...paymentData,
      id: `pay-${Date.now()}`,
      receiptNumber: `REC-${new Date().getFullYear()}-${String(seq).padStart(3, '0')}`
    };
    setPatientPayments(prev => [newPayment, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));

    // Automatically record matching revenue in global clinic financial transactions
    addTransaction({
      type: 'receita',
      category: 'Atendimento',
      description: `Pagamento de Paciente: ${paymentData.description}`,
      amount: paymentData.amount,
      date: paymentData.date,
      patientId: paymentData.patientId,
      clinicId: paymentData.clinicId,
      clinicName: paymentData.clinicName,
      paymentMethod: paymentData.paymentMethod,
      status: 'pago'
    });

    return newPayment;
  };

  const deletePatientPayment = (id: string) => {
    setPatientPayments(prev => prev.filter(p => p.id !== id));
  };

  // Open WhatsApp Modal helper
  const openWhatsAppForAppointment = (apt: Appointment) => {
    setWhatsAppModalAppointment(apt);
  };

  const resetToDefaultData = () => {
    storage.clear();
    setClinics([...INITIAL_CLINICS].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')));
    setProfessionals([...INITIAL_PROFESSIONALS].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')));
    setActiveProfessionalIdState(INITIAL_PROFESSIONALS[0]?.id || 'prof-1');
    setActiveClinicId('todas');
    setLayoutTheme('natural');
    setPatients([...INITIAL_PATIENTS].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' })));
    setAppointments([...INITIAL_APPOINTMENTS].sort((a, b) => `${b.date} ${b.time || ''}`.localeCompare(`${a.date} ${a.time || ''}`)));
    setInventory([...INITIAL_INVENTORY].sort((a, b) => (a.name || '').localeCompare(b.name || '', 'pt-BR')));
    setFinancials([...INITIAL_FINANCIAL].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    setPrescriptions([...INITIAL_PRESCRIPTIONS].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    setOdontograms(INITIAL_ODONTOGRAM_DATA);
    setOdontogramSnapshots(INITIAL_ODONTOGRAM_SNAPSHOTS);
    setClinicalEvolutions([...INITIAL_CLINICAL_EVOLUTION].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    setClinicalExams({});
    setTussProcedures([...INITIAL_TUSS_PROCEDURES].sort((a, b) => a.description.localeCompare(b.description, 'pt-BR', { sensitivity: 'base' })));
    setPriceTables([...DEFAULT_PRICE_TABLES].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')));
    setTreatmentPlans([...INITIAL_TREATMENT_PLANS].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    setPatientPayments([...INITIAL_PATIENT_PAYMENTS].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    setDocumentTemplates([...INITIAL_DOCUMENT_TEMPLATES].sort((a, b) => a.title.localeCompare(b.title, 'pt-BR', { sensitivity: 'base' })));
    setClinicInfo({
      name: 'DentisPro Odontologia Especializada',
      dentistName: 'Dr. Lucas Mendes',
      cro: 'CRO/SP 123456',
      specialty: 'Implantodontia & Estética Dental',
      phone: '5511987654321',
      email: 'contato@dentispro.com.br',
      address: 'Av. Paulista, 1500 - Conjunto 304',
      city: 'São Paulo - SP',
      logoUrl: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=150&auto=format&fit=crop&q=80',
      watermarkUrl: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=150&auto=format&fit=crop&q=80',
      watermarkOpacity: 15,
      showWatermark: true
    });
  };

  // State for tracking checkpoint
  const [lastCheckpointTime, setLastCheckpointTime] = useState<string | null>(() => {
    return storage.getItem('dentispro_last_checkpoint_timestamp');
  });

  // Create Checkpoint Function
  const createDatabaseCheckpoint = () => {
    const nowISO = new Date().toISOString();
    const formattedDate = new Date().toLocaleString('pt-BR');

    const backupPayload = {
      app: 'DentisPro Dental Management System',
      version: '2.5.0',
      checkpointCreatedAt: nowISO,
      formattedDate,
      clinicInfo,
      clinics,
      professionals,
      patients,
      appointments,
      inventory,
      financials,
      prescriptions,
      odontograms,
      odontogramSnapshots,
      clinicalEvolutions,
      clinicalExams,
      tussProcedures,
      priceTables,
      treatmentPlans,
      patientPayments,
      commissions,
      insuranceGuides,
      layoutTheme
    };

    const jsonStr = JSON.stringify(backupPayload, null, 2);
    storage.setItem('dentispro_latest_checkpoint_data', jsonStr);
    storage.setItem('dentispro_last_checkpoint_timestamp', formattedDate);
    setLastCheckpointTime(formattedDate);

    const summary = `${patients.length} pacientes, ${appointments.length} consultas, ${inventory.length} itens de estoque, ${financials.length} transações financeiras.`;
    return { timestamp: formattedDate, summary };
  };

  // Export JSON Backup File
  const exportDatabaseBackupJSON = () => {
    const checkpoint = createDatabaseCheckpoint();
    const jsonStr = storage.getItem('dentispro_latest_checkpoint_data') || '{}';
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const dateSlug = new Date().toISOString().slice(0,10);
    link.download = `dentispro_backup_checkpoint_${dateSlug}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Import JSON Backup File
  const importDatabaseBackupJSON = (_jsonString: string): boolean => false;

  return (
    <WorkspaceStorageContext.Provider value={storage}><AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        clinics,
        activeClinic,
        addClinic,
        updateClinic,
        deleteClinic,
        professionals,
        activeProfessionalId,
        setActiveProfessionalId,
        activeProfessional,
        addProfessional,
        updateProfessional,
        deleteProfessional,
        activeClinicId,
        setActiveClinicId,
        layoutTheme,
        setLayoutTheme,
        selectProfessionalAndClinic,
        switchRequest,
        requestSwitchProfessional,
        cancelSwitchProfessional,
        applySwitchProfessional,
        patients,
        selectedPatientId,
        setSelectedPatientId,
        openPatientProfile,
        addPatient,
        updatePatient,
        deletePatient,
        appointments,
        addAppointment,
        updateAppointmentStatus,
        deleteAppointment,
        inventory,
        addInventoryItem,
        importInventoryBatch,
        updateInventoryItem,
        adjustStockQuantity,
        deleteInventoryItem,
        clearInventory,
        financials,
        addTransaction,
        deleteTransaction,
        commissions,
        addCommission,
        payCommission,
        insuranceGuides,
        addInsuranceGuide,
        updateInsuranceGuideStatus,
        savedClinicDocuments,
        addSavedClinicDocument,
        deleteSavedClinicDocument,
        documentTemplates,
        updateDocumentTemplate,
        resetDocumentTemplates,
        prescriptions,
        addPrescription,
        deletePrescription,
        odontograms,
        updateToothCondition,
        odontogramSnapshots,
        saveOdontogramSnapshot,
        deleteOdontogramSnapshot,
        restoreOdontogramSnapshot,
        clinicalEvolutions,
        addClinicalEvolution,
        updateClinicalEvolution,
        deleteClinicalEvolution,
        clinicalExams,
        getClinicalExam,
        updateClinicalExam,
        tussProcedures,
        addTussProcedure,
        updateTussProcedure,
        deleteTussProcedure,
        priceTables,
        addPriceTable,
        updatePriceTable,
        deletePriceTable,
        treatmentPlans,
        addTreatmentPlan,
        updateTreatmentPlan,
        deleteTreatmentPlan,
        patientPayments,
        addPatientPayment,
        deletePatientPayment,
        clinicInfo,
        updateClinicInfo,
        whatsAppTemplates: WHATSAPP_TEMPLATES,
        whatsAppModalAppointment,
        setWhatsAppModalAppointment,
        openWhatsAppForAppointment,
        resetToDefaultData,
        createDatabaseCheckpoint,
        exportDatabaseBackupJSON,
        importDatabaseBackupJSON,
        lastCheckpointTime
      }}
    >
      {children}
    </AppContext.Provider></WorkspaceStorageContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
