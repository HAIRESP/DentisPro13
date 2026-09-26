import { activePatientId } from './workspaceActions';
import { auth } from '../lib/firebase';

export async function authenticatedFetch(path: string, init: RequestInit = {}) {
  if (!path.startsWith('/api/')) throw new Error('Destino de API inválido.');
  const user = auth.currentUser;
  if (!user) throw new Error('Entre na sua conta para continuar.');
  const token = await user.getIdToken();
  if (auth.currentUser?.uid !== user.uid) throw new Error('A sessão foi alterada. Tente novamente.');
  const headers = new Headers(init.headers);
  headers.set('Authorization', `Bearer ${token}`);
  const patientId = activePatientId();
  if (patientId && path !== '/api/secure/command') headers.set('X-Patient-Id', patientId);
  const response = await fetch(path, { ...init, headers, redirect: 'error' });
  if (auth.currentUser?.uid !== user.uid) throw new Error('A sessão foi alterada.');
  return response;
}
