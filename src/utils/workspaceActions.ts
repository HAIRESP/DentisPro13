import {secureApi} from './secureApi';
let context: {patientId?: string; mode: 'clinical' | 'clinic'} | null = null;
export function setWorkspaceActionContext(value: typeof context) {context = value;}
export function activePatientId() {return context?.mode === 'clinical' ? context.patientId : undefined;}
export async function authorizeWorkspaceAction(action: 'print' | 'export', resourceId?: string) {
  const initial = context;
  if (!initial) throw Error('Abra um atendimento protegido antes desta operação.');
  await secureApi(`${initial.mode}.${action}`, initial.patientId, {resourceId});
  if (context !== initial) throw Error('O atendimento foi alterado. Repita a operação.');
}
