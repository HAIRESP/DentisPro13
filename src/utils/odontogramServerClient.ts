import { authenticatedFetch, getSessionToken } from './authenticatedFetch.ts';

export class OdontogramRequestError extends Error {
  status: number;
  constructor(message: string, status = 0) { super(message); this.status = status; }
}
export async function odontogramRequest(path: string, body?: unknown) {
  const session = getSessionToken();
  if (!session) throw new OdontogramRequestError('Entre novamente para acessar o odontograma.', 401);
  const response = await authenticatedFetch(path, {
    signal: AbortSignal.timeout(30000),
    ...(body === undefined ? {} : {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}),
  });
  const data = await response.json().catch(() => null);
  if (getSessionToken() !== session) throw new OdontogramRequestError('A sessão mudou. Reabra o paciente.', 401);
  if (!response.ok) throw new OdontogramRequestError(data?.error || 'Não foi possível consultar o servidor.', response.status);
  if (!data || typeof data !== 'object') throw new OdontogramRequestError('Resposta inválida do servidor.');
  return data;
}
export const odontogramPatientPath = (id: string) => `/api/odontogram/patients/${encodeURIComponent(id)}`;
export async function loadServerOdontogram(patientId: string, source: 'clinic' | 'review' = 'review') {
  const path=odontogramPatientPath(patientId);
  const [current,history,record] = await Promise.all([
    odontogramRequest(`${path}/current`), odontogramRequest(`${path}/history`),
    odontogramRequest(source === 'clinic' ? `${path}/record` : `/api/clinical-review/patients/${encodeURIComponent(patientId)}/record`),
  ]);
  if (!Number.isSafeInteger(current.version) || current.version < 0 || !Array.isArray(current.conditions) ||
      !Array.isArray(history) || record.patient?.id !== patientId || typeof record.patient.name !== 'string') {
    throw new OdontogramRequestError('Os dados recebidos não correspondem ao paciente solicitado.');
  }
  return {current,history,patient:record.patient};
}
export async function saveServerOdontogram(patientId: string, payload: unknown) {
  const result = await odontogramRequest(`${odontogramPatientPath(patientId)}/evaluations`,payload);
  if (![result.id,result.documentId,result.evolutionId].every(x=>typeof x==='string' && x.length>0) ||
      !Number.isSafeInteger(result.version) || result.version < 1 || typeof result.alreadySaved !== 'boolean') {
    throw new OdontogramRequestError('Confirmação incompleta. Repita a mesma solicitação para conferir o salvamento.');
  }
  return result;
}
