import config from '../firebase-applet-config.json' with { type: 'json' };
import type { ApiIdentity } from './apiAccess';

// User tokens are checked by Firebase itself; Firestore reads also use that token
// and are subject to the published rules. No service-account key in the browser.
export async function resolveFirebaseIdentity(token: string, request: typeof fetch = fetch): Promise<ApiIdentity> {
  const response = await request(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(config.apiKey)}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken: token }), signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error('invalid-session');
  const account = (await response.json()).users?.[0];
  if (!account?.localId || account.disabled) throw new Error('invalid-session');
  const uid = account.localId;
  const database = config.firestoreDatabaseId || '(default)';
  const profileResponse = await request(`https://firestore.googleapis.com/v1/projects/${encodeURIComponent(config.projectId)}/databases/${encodeURIComponent(database)}/documents/users/${encodeURIComponent(uid)}`, {
    headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(10000),
  });
  if (!profileResponse.ok) throw new Error('invalid-profile');
  const fields = (await profileResponse.json()).fields;
  if (fields?.uid?.stringValue !== uid) throw new Error('invalid-profile');
  const role = fields?.role?.stringValue;
  if (!['admin', 'dentist', 'receptionist'].includes(role)) throw new Error('invalid-role');
  return { uid, role };
}
