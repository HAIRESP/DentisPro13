export const clinicalKeys = [
  'dentispro_patients_v2', 'dentispro_prescriptions_v2', 'dentispro_odontograms_v2',
  'dentispro_odontogram_snapshots_v2', 'dentispro_evolutions_v2', 'dentispro_clinical_exams_v2',
  'dentispro_treatment_plans_v2', 'dentispro_patient_payments_v2', 'dentispro_financial_v2',
  'dentispro_insurance_guides_v2', 'dentispro_saved_documents_v2',
];
export const clinicKeys = [
  'dentispro_clinic_info_v1', 'dentispro_clinics_v1', 'dentispro_professionals_v1',
  'dentispro_inventory_v2', 'dental_autoclave_logs_v1', 'dentispro_tuss_procedures_v1',
  'dentispro_price_tables_v1', 'dentispro_document_templates_v1', 'dentispro_layout_theme_v1',
  'dentispro_custom_med_templates', 'clinic_correlation_rules',
];
export type SecureWorkspaceSession = {
  mode?: 'clinical' | 'administration';
  patientId: string;
  initialStorage: Record<string, any>;
  onChange: (workspace: Record<string, any>) => void;
};
export function memoryWorkspace(session: SecureWorkspaceSession) {
  const values = new Map(Object.entries(session.initialStorage).map(([k,v]) => [k, JSON.stringify(v)]));
  let pending = false;
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value);
      if (!pending) {pending = true; queueMicrotask(() => {
        pending = false;
        session.onChange(Object.fromEntries([...values].filter(([k]) => (session.mode === 'administration' ? clinicKeys : clinicalKeys).includes(k)).map(([k,v]) => [k, JSON.parse(v)])));
      });}
    },
    clear: () => {throw new Error('A limpeza do prontuário protegido não é permitida.');},
  };
}
