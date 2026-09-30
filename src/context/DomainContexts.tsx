import React, { createContext, useContext, useMemo } from 'react';
import { useApp, AppContextType } from './AppContext';

type DocumentDomain = Pick<
  AppContextType,
  'documentTemplates' | 'updateDocumentTemplate' | 'resetDocumentTemplates'
>;

type ClinicDomain = Pick<
  AppContextType,
  | 'clinicInfo'
  | 'activeClinic'
  | 'clinics'
  | 'professionals'
  | 'activeProfessional'
  | 'activeProfessionalId'
  | 'activeClinicId'
  | 'layoutTheme'
  | 'setActiveProfessionalId'
  | 'setActiveClinicId'
  | 'setLayoutTheme'
  | 'selectProfessionalAndClinic'
  | 'updateClinicInfo'
  | 'addClinic'
  | 'updateClinic'
  | 'deleteClinic'
  | 'addProfessional'
  | 'updateProfessional'
  | 'deleteProfessional'
>;

type PatientDomain = Pick<
  AppContextType,
  | 'patients'
  | 'selectedPatientId'
  | 'setSelectedPatientId'
  | 'openPatientProfile'
  | 'addPatient'
  | 'updatePatient'
  | 'deletePatient'
  | 'odontograms'
  | 'updateToothCondition'
  | 'odontogramSnapshots'
  | 'saveOdontogramSnapshot'
  | 'deleteOdontogramSnapshot'
  | 'restoreOdontogramSnapshot'
  | 'clinicalEvolutions'
  | 'addClinicalEvolution'
  | 'updateClinicalEvolution'
  | 'deleteClinicalEvolution'
  | 'clinicalExams'
  | 'getClinicalExam'
  | 'updateClinicalExam'
>;

type AppointmentDomain = Pick<
  AppContextType,
  | 'appointments'
  | 'addAppointment'
  | 'updateAppointmentStatus'
  | 'deleteAppointment'
  | 'openWhatsAppForAppointment'
  | 'whatsAppModalAppointment'
  | 'setWhatsAppModalAppointment'
>;

type InventoryDomain = Pick<
  AppContextType,
  | 'inventory'
  | 'addInventoryItem'
  | 'importInventoryBatch'
  | 'updateInventoryItem'
  | 'adjustStockQuantity'
  | 'deleteInventoryItem'
  | 'clearInventory'
>;

type FinanceDomain = Pick<
  AppContextType,
  | 'financials'
  | 'addTransaction'
  | 'deleteTransaction'
  | 'commissions'
  | 'addCommission'
  | 'payCommission'
  | 'insuranceGuides'
  | 'addInsuranceGuide'
  | 'updateInsuranceGuideStatus'
  | 'patientPayments'
  | 'addPatientPayment'
  | 'deletePatientPayment'
>;

type TussDomain = Pick<
  AppContextType,
  | 'tussProcedures'
  | 'addTussProcedure'
  | 'updateTussProcedure'
  | 'deleteTussProcedure'
  | 'priceTables'
  | 'addPriceTable'
  | 'updatePriceTable'
  | 'deletePriceTable'
>;

const DocumentDomainContext = createContext<DocumentDomain | undefined>(undefined);
const ClinicDomainContext = createContext<ClinicDomain | undefined>(undefined);
const PatientDomainContext = createContext<PatientDomain | undefined>(undefined);
const AppointmentDomainContext = createContext<AppointmentDomain | undefined>(undefined);
const InventoryDomainContext = createContext<InventoryDomain | undefined>(undefined);
const FinanceDomainContext = createContext<FinanceDomain | undefined>(undefined);
const TussDomainContext = createContext<TussDomain | undefined>(undefined);

export const DomainProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const app = useApp();

  const documentDomain = useMemo<DocumentDomain>(() => ({
    documentTemplates: app.documentTemplates,
    updateDocumentTemplate: app.updateDocumentTemplate,
    resetDocumentTemplates: app.resetDocumentTemplates
  }), [app.documentTemplates]);

  const clinicDomain = useMemo<ClinicDomain>(() => ({
    clinicInfo: app.clinicInfo,
    activeClinic: app.activeClinic,
    clinics: app.clinics,
    professionals: app.professionals,
    activeProfessional: app.activeProfessional,
    activeProfessionalId: app.activeProfessionalId,
    activeClinicId: app.activeClinicId,
    layoutTheme: app.layoutTheme,
    setActiveProfessionalId: app.setActiveProfessionalId,
    setActiveClinicId: app.setActiveClinicId,
    setLayoutTheme: app.setLayoutTheme,
    selectProfessionalAndClinic: app.selectProfessionalAndClinic,
    updateClinicInfo: app.updateClinicInfo,
    addClinic: app.addClinic,
    updateClinic: app.updateClinic,
    deleteClinic: app.deleteClinic,
    addProfessional: app.addProfessional,
    updateProfessional: app.updateProfessional,
    deleteProfessional: app.deleteProfessional
  }), [
    app.clinicInfo,
    app.activeClinic,
    app.clinics,
    app.professionals,
    app.activeProfessional,
    app.activeProfessionalId,
    app.activeClinicId,
    app.layoutTheme
  ]);

  const patientDomain = useMemo<PatientDomain>(() => ({
    patients: app.patients,
    selectedPatientId: app.selectedPatientId,
    setSelectedPatientId: app.setSelectedPatientId,
    openPatientProfile: app.openPatientProfile,
    addPatient: app.addPatient,
    updatePatient: app.updatePatient,
    deletePatient: app.deletePatient,
    odontograms: app.odontograms,
    updateToothCondition: app.updateToothCondition,
    odontogramSnapshots: app.odontogramSnapshots,
    saveOdontogramSnapshot: app.saveOdontogramSnapshot,
    deleteOdontogramSnapshot: app.deleteOdontogramSnapshot,
    restoreOdontogramSnapshot: app.restoreOdontogramSnapshot,
    clinicalEvolutions: app.clinicalEvolutions,
    addClinicalEvolution: app.addClinicalEvolution,
    updateClinicalEvolution: app.updateClinicalEvolution,
    deleteClinicalEvolution: app.deleteClinicalEvolution,
    clinicalExams: app.clinicalExams,
    getClinicalExam: app.getClinicalExam,
    updateClinicalExam: app.updateClinicalExam
  }), [
    app.patients,
    app.selectedPatientId,
    app.odontograms,
    app.odontogramSnapshots,
    app.clinicalEvolutions,
    app.clinicalExams
  ]);

  const appointmentDomain = useMemo<AppointmentDomain>(() => ({
    appointments: app.appointments,
    addAppointment: app.addAppointment,
    updateAppointmentStatus: app.updateAppointmentStatus,
    deleteAppointment: app.deleteAppointment,
    openWhatsAppForAppointment: app.openWhatsAppForAppointment,
    whatsAppModalAppointment: app.whatsAppModalAppointment,
    setWhatsAppModalAppointment: app.setWhatsAppModalAppointment
  }), [app.appointments, app.whatsAppModalAppointment]);

  const inventoryDomain = useMemo<InventoryDomain>(() => ({
    inventory: app.inventory,
    addInventoryItem: app.addInventoryItem,
    importInventoryBatch: app.importInventoryBatch,
    updateInventoryItem: app.updateInventoryItem,
    adjustStockQuantity: app.adjustStockQuantity,
    deleteInventoryItem: app.deleteInventoryItem,
    clearInventory: app.clearInventory
  }), [app.inventory]);

  const financeDomain = useMemo<FinanceDomain>(() => ({
    financials: app.financials,
    addTransaction: app.addTransaction,
    deleteTransaction: app.deleteTransaction,
    commissions: app.commissions,
    addCommission: app.addCommission,
    payCommission: app.payCommission,
    insuranceGuides: app.insuranceGuides,
    addInsuranceGuide: app.addInsuranceGuide,
    updateInsuranceGuideStatus: app.updateInsuranceGuideStatus,
    patientPayments: app.patientPayments,
    addPatientPayment: app.addPatientPayment,
    deletePatientPayment: app.deletePatientPayment
  }), [app.financials, app.commissions, app.insuranceGuides, app.patientPayments]);

  const tussDomain = useMemo<TussDomain>(() => ({
    tussProcedures: app.tussProcedures,
    addTussProcedure: app.addTussProcedure,
    updateTussProcedure: app.updateTussProcedure,
    deleteTussProcedure: app.deleteTussProcedure,
    priceTables: app.priceTables,
    addPriceTable: app.addPriceTable,
    updatePriceTable: app.updatePriceTable,
    deletePriceTable: app.deletePriceTable
  }), [app.tussProcedures, app.priceTables]);

  return (
    <DocumentDomainContext.Provider value={documentDomain}>
      <ClinicDomainContext.Provider value={clinicDomain}>
        <PatientDomainContext.Provider value={patientDomain}>
          <AppointmentDomainContext.Provider value={appointmentDomain}>
            <InventoryDomainContext.Provider value={inventoryDomain}>
              <FinanceDomainContext.Provider value={financeDomain}>
                <TussDomainContext.Provider value={tussDomain}>
                  {children}
                </TussDomainContext.Provider>
              </FinanceDomainContext.Provider>
            </InventoryDomainContext.Provider>
          </AppointmentDomainContext.Provider>
        </PatientDomainContext.Provider>
      </ClinicDomainContext.Provider>
    </DocumentDomainContext.Provider>
  );
};

export const useDocumentDomain = (): DocumentDomain => {
  const context = useContext(DocumentDomainContext);
  if (!context) {
    throw new Error('useDocumentDomain must be used within DomainProviders');
  }
  return context;
};

export const useClinicDomain = (): ClinicDomain => {
  const context = useContext(ClinicDomainContext);
  if (!context) {
    throw new Error('useClinicDomain must be used within DomainProviders');
  }
  return context;
};

export const usePatientDomain = (): PatientDomain => {
  const context = useContext(PatientDomainContext);
  if (!context) throw new Error('usePatientDomain must be used within DomainProviders');
  return context;
};

export const useAppointmentDomain = (): AppointmentDomain => {
  const context = useContext(AppointmentDomainContext);
  if (!context) throw new Error('useAppointmentDomain must be used within DomainProviders');
  return context;
};

export const useInventoryDomain = (): InventoryDomain => {
  const context = useContext(InventoryDomainContext);
  if (!context) throw new Error('useInventoryDomain must be used within DomainProviders');
  return context;
};

export const useFinanceDomain = (): FinanceDomain => {
  const context = useContext(FinanceDomainContext);
  if (!context) throw new Error('useFinanceDomain must be used within DomainProviders');
  return context;
};

export const useTussDomain = (): TussDomain => {
  const context = useContext(TussDomainContext);
  if (!context) throw new Error('useTussDomain must be used within DomainProviders');
  return context;
};