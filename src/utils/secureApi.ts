import { authenticatedFetch } from './authenticatedFetch';
export async function secureApi(action: string, patientId?: string, input: any = {}) {
  const response = await authenticatedFetch('/api/secure/command', {
    method: 'POST', headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({action, patientId, input}), cache: 'no-store',
    signal: AbortSignal.timeout(45000),
  });
  const result = await response.json();
  if (!response.ok) throw Object.assign(new Error(result.error || 'Operação não concluída.'), {status: response.status});
  return result;
}
