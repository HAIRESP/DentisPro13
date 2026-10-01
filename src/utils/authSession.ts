export function withDeadline<T>(operation: Promise<T>, milliseconds: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('profile-timeout')), milliseconds);
    operation.then(
      value => { clearTimeout(timer); resolve(value); },
      error => { clearTimeout(timer); reject(error); }
    );
  });
}

export function validateSessionProfile(
  user: { uid: string; email: string | null },
  profile: Record<string, unknown> | null
) {
  if (!profile || profile.uid !== user.uid ||
      !['admin', 'dentist', 'receptionist'].includes(String(profile.role)) ||
      typeof profile.name !== 'string') {
    throw new Error('invalid-session-profile');
  }
  // Identity comes from Firebase Auth. Legacy plaintext passwords are not session data.
  const { password: _password, ...safeProfile } = profile;
  return { ...safeProfile, uid: user.uid, email: user.email || '' };
}

// A professional selection never changes the authenticated account or its role.
export function canSelectProfessional(profile: { role: string; professionalId?: string }, target: string): boolean {
  return Boolean(target) && (profile.role === 'admin' ||
    (profile.role === 'dentist' && profile.professionalId === target));
}

export function sanitizeProfileWrite(profile: Record<string, unknown>) {
  return Object.fromEntries(Object.entries(profile).filter(([key, value]) => key !== 'password' && value !== undefined));
}


export type LoginFailureKind = 'credentials' | 'network' | 'service' | 'unknown';

export function classifyLoginFailure(error: unknown): LoginFailureKind {
  const code = typeof error === 'object' && error !== null && 'code' in error
    ? String((error as { code?: unknown }).code || '')
    : '';

  if (['auth/invalid-credential', 'auth/invalid-login-credentials', 'auth/wrong-password', 'auth/user-not-found'].includes(code)) {
    return 'credentials';
  }
  if (code === 'auth/network-request-failed') return 'network';
  if (['auth/too-many-requests', 'auth/internal-error'].includes(code)) return 'service';
  return 'unknown';
}


export type ProfileFailureKind = 'timeout' | 'invalid-profile' | 'permission' | 'network' | 'unknown';

export function classifyProfileFailure(error: unknown): ProfileFailureKind {
  const message = error instanceof Error ? error.message : '';
  const code = typeof error === 'object' && error !== null && 'code' in error
    ? String((error as { code?: unknown }).code || '')
    : '';

  if (message === 'profile-timeout') return 'timeout';
  if (message === 'invalid-session-profile') return 'invalid-profile';
  if (code === 'permission-denied' || code === 'firestore/permission-denied') return 'permission';
  if (code === 'unavailable' || code === 'firestore/unavailable') return 'network';
  return 'unknown';
}


export async function fetchUserListSafely<T>(fetchUsers: () => Promise<T[]>): Promise<{ ok: true; users: T[] } | { ok: false }> {
  try {
    return { ok: true, users: await fetchUsers() };
  } catch {
    return { ok: false };
  }
}
