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
