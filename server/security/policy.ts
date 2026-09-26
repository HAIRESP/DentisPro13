import { createHash, createHmac, randomInt, randomBytes, timingSafeEqual } from 'node:crypto';

export type Role = 'admin' | 'dentist' | 'receptionist';
export type Actor = { uid: string; name: string; role: Role; authTime: number };
export type Grant = { status: 'active' | 'suspended'; expiresAt: number | null; authorizedAt: number };
export type PatientAccess = { ownerUid: string; grants: Record<string, Grant>; exceptions: Record<string, {expiresAt: number; reason: string}> };
export class AccessError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
export function requireThat(condition: unknown, status: number, message: string): asserts condition {
  if (!condition) throw new AccessError(status, message);
}
export function canRead(patient: PatientAccess, actor: Actor, now: number, write = false) {
  if (actor.role === 'receptionist') return false;
  const grant = patient.grants[actor.uid];
  // An explicit suspension also overrides the initial responsible professional.
  const normal = grant ? grant.status === 'active' && (grant.expiresAt === null || grant.expiresAt > now) : patient.ownerUid === actor.uid;
  if (normal) return true;
  return !write && actor.role === 'admin' && (patient.exceptions[actor.uid]?.expiresAt || 0) > now;
}
export function requireRecentPassword(actor: Actor, now: number) {
  requireThat(actor.authTime > 0 && now - actor.authTime * 1000 >= 0 && now - actor.authTime * 1000 <= 120000,
    403, 'Confirme novamente sua senha para o acesso excepcional.');
}
export function digest(value: string) { return createHash('sha256').update(value).digest('hex'); }
export function secret() { return randomBytes(32).toString('base64url'); }
export function code() { return String(randomInt(0, 1000000)).padStart(6, '0'); }
export function codeDigest(key: string, id: string, value: string) { return createHmac('sha256', key).update(`${id}:${value}`).digest('hex'); }
export function equalDigest(a: string, b: string) {
  return a.length === 64 && b.length === 64 && timingSafeEqual(Buffer.from(a, 'hex'), Buffer.from(b, 'hex'));
}
export function identifier(value: unknown) {
  requireThat(typeof value === 'string' && /^[A-Za-z0-9_-]{1,128}$/.test(value), 400, 'Identificador inválido.');
  return value;
}
export function textField(value: unknown, max = 300, min = 1) {
  requireThat(typeof value === 'string' && value.trim().length >= min && value.length <= max, 400, 'Preencha os campos obrigatórios corretamente.');
  return value.trim();
}
export function validateDemographics(input: any) {
  requireThat(input && typeof input === 'object' && !Array.isArray(input), 400, 'Cadastro inválido.');
  // Explicit allowlist: no free-text clinical notes, diagnosis or anamnesis for reception.
  return {
    name: textField(input.name, 160), email: textField(input.email, 254),
    phone: textField(input.phone || '', 40, 0), birthDate: textField(input.birthDate || '', 10, 0),
    cpf: textField(input.cpf || '', 20, 0),
  };
}
export const CLINICAL_KEYS = [
  'dentispro_patients_v2', 'dentispro_prescriptions_v2', 'dentispro_odontograms_v2',
  'dentispro_odontogram_snapshots_v2', 'dentispro_evolutions_v2', 'dentispro_clinical_exams_v2',
  'dentispro_treatment_plans_v2', 'dentispro_patient_payments_v2', 'dentispro_financial_v2',
  'dentispro_insurance_guides_v2', 'dentispro_saved_documents_v2',
];
export function validateWorkspace(input: any, patientId: string, previous?: Record<string, any>) {
  requireThat(input && typeof input === 'object' && !Array.isArray(input), 400, 'Prontuário inválido.');
  const result: Record<string, any> = {};
  for (const key of Object.keys(input)) {
    requireThat(CLINICAL_KEYS.includes(key), 400, 'Conteúdo fora do prontuário.');
    const value = input[key];
    if (['dentispro_odontograms_v2', 'dentispro_odontogram_snapshots_v2', 'dentispro_clinical_exams_v2'].includes(key)) {
      requireThat(value && typeof value === 'object' && !Array.isArray(value) && Object.keys(value).every(id => id === patientId), 400, 'Dados de outro paciente.');
    } else {
      requireThat(Array.isArray(value) && value.every(row => row && (key === 'dentispro_patients_v2' ? row.id === patientId : row.patientId === patientId)), 400, 'Dados de outro paciente.');
      requireThat(new Set(value.map(row => row.id)).size === value.length, 400, 'Registros duplicados.');
    }
    result[key] = value;
  }
  requireThat(result.dentispro_patients_v2?.length === 1, 400, 'O prontuário deve conter exatamente um paciente.');
  // Every previously saved evolution is final. Corrections are new signed entries.
  for (const old of previous?.dentispro_evolutions_v2 || []) {
    const current = result.dentispro_evolutions_v2?.find((row: any) => row.id === old.id);
    requireThat(current && JSON.stringify(current) === JSON.stringify(old), 409, 'Evolução finalizada: acrescente um complemento; o registro original é preservado.');
  }
  return result;
}

export const CLINIC_KEYS = [
  'dentispro_clinic_info_v1', 'dentispro_clinics_v1', 'dentispro_professionals_v1',
  'dentispro_inventory_v2', 'dental_autoclave_logs_v1', 'dentispro_tuss_procedures_v1',
  'dentispro_price_tables_v1', 'dentispro_document_templates_v1', 'dentispro_layout_theme_v1',
  'dentispro_custom_med_templates', 'clinic_correlation_rules',
];
export function validateClinicWorkspace(value: any) {
  requireThat(value && typeof value === 'object' && !Array.isArray(value) && Object.keys(value).every(k => CLINIC_KEYS.includes(k)), 400, 'Configuração inválida.');
  // Legacy passwords are never carried into configuration storage.
  for (const p of value.dentispro_professionals_v1 || []) requireThat(!p.password, 400, 'Remova senhas antigas dos cadastros de profissionais.');
  return value;
}

/** One calendar month in the clinic's Fortaleza timezone, clamped at month end. */
export function treatmentMonthExpiresAt(now: number) {
  const offset = 3 * 60 * 60 * 1000;
  const local = new Date(now - offset), day = local.getUTCDate();
  local.setUTCDate(1);
  local.setUTCMonth(local.getUTCMonth() + 1);
  const lastDay = new Date(Date.UTC(local.getUTCFullYear(), local.getUTCMonth() + 1, 0)).getUTCDate();
  local.setUTCDate(Math.min(day, lastDay));
  return local.getTime() + offset;
}
