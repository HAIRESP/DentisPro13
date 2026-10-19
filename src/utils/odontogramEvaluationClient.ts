import { authenticatedFetch } from './authenticatedFetch';

export type EvaluationInput = {
  patientId: string;
  requestId: string;
  expectedVersion: number;
  conditions: unknown[];
  date: string;
  title: string;
  description: string;
  pdfBase64: string;
  filename: string;
};

export async function submitCompletedOdontogramEvaluation(input: EvaluationInput): Promise<{
  id: string; documentId: string; evolutionId: string; version: number; alreadySaved: boolean;
}> {
  if (!input.patientId || !input.requestId || !Number.isSafeInteger(input.expectedVersion) || input.expectedVersion < 0 ||
      !Array.isArray(input.conditions) || !input.date || !input.title.trim() || !input.filename.endsWith('.pdf') ||
      !input.pdfBase64.startsWith('JVBERi0')) {
    throw new Error('Confira os dados e o PDF da avaliação antes de salvar.');
  }
  const { patientId, ...payload } = input;
  const response = await authenticatedFetch(`/api/odontogram/patients/${encodeURIComponent(patientId)}/evaluations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const result = await response.json().catch(() => null);
  if (!response.ok) throw new Error(typeof result?.error === 'string' ? result.error : 'A avaliação não foi arquivada no servidor.');
  if (typeof result?.id !== 'string' || typeof result?.documentId !== 'string' ||
      typeof result?.evolutionId !== 'string' || !Number.isSafeInteger(result?.version)) {
    throw new Error('O servidor não confirmou todos os registros. Consulte o histórico antes de tentar novamente.');
  }
  return result;
}
