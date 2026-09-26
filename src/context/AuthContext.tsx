import { initializeApp, deleteApp } from 'firebase/app';
import config from '../../firebase-applet-config.json';
import { provisionUser } from '../utils/provisionUser';
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  auth,
  db,
  UserProfile,
  UserRole,
  ROLE_PERMISSIONS,
  saveUserProfileToFirestore,
  fetchAllUsersFromFirestore
} from '../lib/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword, initializeAuth, inMemoryPersistence, deleteUser,
  signOut as firebaseSignOut,
  onAuthStateChanged, EmailAuthProvider, reauthenticateWithCredential, sendPasswordResetEmail
} from 'firebase/auth';
import { doc, getDocFromServer } from 'firebase/firestore';
import { withDeadline, validateSessionProfile, canSelectProfessional } from '../utils/authSession';

interface AuthContextType {
  currentUser: UserProfile | null;
  isAuthenticated: boolean;
  userRole: UserRole;
  userPermissions: typeof ROLE_PERMISSIONS['admin'];
  allUsers: UserProfile[];
  loadingAuth: boolean;
  authError: string | null;
  loginWithDemoUser: (role: UserRole) => void;
  loginWithEmail: (email: string, pass: string) => Promise<boolean>;
  signupNewUser: (email: string, pass: string, name: string, role: UserRole, cro?: string, specialty?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUserRoleAndProfile: (uid: string, updates: Partial<UserProfile>) => Promise<void>;
  requestPasswordReset: () => Promise<boolean>;
  verifyPasswordForProfessionalOrUser: (targetProfIdOrEmail: string, inputPassword: string) => Promise<boolean>;
  refreshUsersList: () => Promise<void>;
  checkTabPermission: (tab: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'dentispro_current_session_v1';
const LEGACY_AUTH_STORAGE_KEY = 'planetodonto_current_session_v1';
const ALL_USERS_STORAGE_KEY = 'dentispro_all_users_v2';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Firebase, not a cached profile, determines whether a session exists.
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const profileRequests = useRef(new Map<string, Promise<UserProfile>>());
  const sessionVersion = useRef(0);
  const provisioning = useRef(false);

  const resolveProfile = (user: { uid: string; email: string | null }) => {
    const existing = profileRequests.current.get(user.uid);
    if (existing) return existing;
    const request = withDeadline(
      getDocFromServer(doc(db, 'users', user.uid)),
      15000
    ).then(snapshot => validateSessionProfile(user, snapshot.exists() ? snapshot.data() : null) as UserProfile);
    profileRequests.current.set(user.uid, request);
    const clear = () => {
      if (profileRequests.current.get(user.uid) === request) profileRequests.current.delete(user.uid);
    };
    request.then(clear, clear);
    return request;
  };

  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [loadingAuth, setLoadingAuth] = useState<boolean>(true);

  // Remove only obsolete session caches; never modify clinical data here.
  useEffect(() => {
    try {
      localStorage.removeItem(ALL_USERS_STORAGE_KEY);
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(LEGACY_AUTH_STORAGE_KEY);
    } catch { /* Browser storage may be unavailable. */ }
  }, []);

  useEffect(() => {
    let disposed = false;
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      const version = ++sessionVersion.current;
      setCurrentUser(null);
      setAuthError(null);
      setLoadingAuth(Boolean(fbUser));
      if (!fbUser) return;
      try {
        const profile = await resolveProfile(fbUser);
        if (!disposed && version === sessionVersion.current && auth.currentUser?.uid === fbUser.uid) {
          setCurrentUser(profile);
        }
      } catch {
        if (!disposed && version === sessionVersion.current) {
          setAuthError('Não foi possível confirmar seu perfil. Confira a conexão e tente entrar novamente.');
        }
      } finally {
        if (!disposed && version === sessionVersion.current) setLoadingAuth(false);
      }
    }, () => {
      if (!disposed) {
        setCurrentUser(null);
        setLoadingAuth(false);
        setAuthError('Não foi possível verificar a sessão. Tente novamente.');
      }
    });
    return () => { disposed = true; ++sessionVersion.current; unsubscribe(); };
  }, []);

  useEffect(() => {
    if (currentUser) void refreshUsersList();
  }, [currentUser?.uid, currentUser?.role]);

  const refreshUsersList = async () => {
    const user = auth.currentUser;
    const version = sessionVersion.current;
    if (!user || !currentUser) { setAllUsers([]); return; }
    if (currentUser.role !== 'admin') { setAllUsers([currentUser]); return; }
    const users = await fetchAllUsersFromFirestore();
    if (version === sessionVersion.current && auth.currentUser?.uid === user.uid) setAllUsers(users);
  };

  const loginWithDemoUser = (_role: UserRole) => {
    // Kept for API compatibility; demo identities must never open a session.
    setAuthError('Entre com uma conta cadastrada usando e-mail e senha.');
  };

  const loginWithEmail = async (email: string, pass: string): Promise<boolean> => {
    setAuthError(null);
    let signedInUser;
    try {
      signedInUser = (await signInWithEmailAndPassword(auth, email.trim(), pass)).user;
    } catch {
      setAuthError('Não foi possível entrar. Confira o e-mail, a senha e a conexão. Se o navegador preencheu outra conta, substitua os dois campos.');
      return false;
    }
    const version = sessionVersion.current;
    try {
      const profile = await resolveProfile(signedInUser);
      if (version !== sessionVersion.current || auth.currentUser?.uid !== signedInUser.uid) return false;
      setCurrentUser(profile);
      return true;
    } catch {
      if (auth.currentUser?.uid === signedInUser.uid) {
        setCurrentUser(null);
        setAuthError(`E-mail e senha aceitos, mas o perfil de acesso não pôde ser confirmado. Confira a conexão e o documento users/${signedInUser.uid} no Firestore (uid e role).`);
      }
      return false;
    }
  };

  const signupNewUser = async (
    email: string,
    pass: string,
    name: string,
    role: UserRole,
    cro?: string,
    specialty?: string
  ): Promise<boolean> => {
    if (provisioning.current || !name.trim() || !email.trim() || !pass) return false;
    setAuthError(null);
    const admin = auth.currentUser;
    if (!admin || currentUser?.role !== 'admin' || !['admin', 'dentist', 'receptionist'].includes(role)) return false;
    provisioning.current = true;
    const secondary = initializeApp(config, `provision-${crypto.randomUUID()}`);
    const secondaryAuth = initializeAuth(secondary, { persistence: inMemoryPersistence });
    try {
      const profile = await resolveProfile(admin);
      if (profile.role !== 'admin' || auth.currentUser?.uid !== admin.uid) return false;
      await provisionUser({
        create: async () => (await createUserWithEmailAndPassword(secondaryAuth, email.trim(), pass)).user,
        save: async user => {
          if (auth.currentUser?.uid !== admin.uid) throw new Error('session-changed');
          await saveUserProfileToFirestore({
            uid: user.uid, email: user.email || email.trim(), name: name.trim(), role,
            cro, specialty, createdAt: new Date().toISOString()
          });
        },
        rollback: user => deleteUser(user),
      });
      await refreshUsersList();
      return true;
    } catch (error) {
      setAuthError(error instanceof Error && error.message === 'provision-cleanup-required'
        ? 'Cadastro incompleto. Confira a conta em Authentication antes de tentar novamente.'
        : 'Não foi possível cadastrar a conta. Confira os dados, a conexão e as permissões.');
      return false;
    } finally {
      try { await firebaseSignOut(secondaryAuth); }
      catch { /* deleteApp below disposes this isolated in-memory session. */ }
      finally {
        try { await deleteApp(secondary); } finally { provisioning.current = false; }
      }
    }
  };

  const logout = async () => {
    ++sessionVersion.current;
    setCurrentUser(null);
    setAllUsers([]);
    setLoadingAuth(false);
    try {
      await firebaseSignOut(auth);
    } catch (e) {
      console.warn('Signout error', e);
    }
    setCurrentUser(null);
  };

  const updateUserRoleAndProfile = async (uid: string, updates: Partial<UserProfile>) => {
    const user = auth.currentUser;
    if (!user || currentUser?.role !== 'admin') throw new Error('Acesso restrito ao administrador.');
    const actor = await resolveProfile(user);
    if (actor.role !== 'admin' || auth.currentUser?.uid !== user.uid) throw new Error('Sessão inválida.');
    const target = allUsers.find(u => u.uid === uid);
    if (!target) throw new Error('Usuário não encontrado.');
    if (updates.role && !['admin', 'dentist', 'receptionist'].includes(updates.role)) throw new Error('Perfil inválido.');
    if (uid === user.uid && updates.role && updates.role !== 'admin') throw new Error('Use outro administrador para alterar seu perfil.');
    const { password: _password, uid: _uid, email: _email, ...allowed } = updates;
    const newProfile = { ...target, ...allowed, uid: target.uid, email: target.email };
    await saveUserProfileToFirestore(newProfile);
    if (auth.currentUser?.uid !== user.uid) return;
    setAllUsers(users => users.map(u => u.uid === uid ? newProfile : u));
    if (uid === user.uid) setCurrentUser(newProfile);
  };

  const requestPasswordReset = async (): Promise<boolean> => {
    const user = auth.currentUser;
    if (!user?.email || user.uid !== currentUser?.uid) return false;
    try {
      await sendPasswordResetEmail(auth, user.email);
      return true;
    } catch { return false; }
  };

  const verifyPasswordForProfessionalOrUser = async (target: string, password: string): Promise<boolean> => {
    const user = auth.currentUser;
    const version = sessionVersion.current;
    if (!user?.email || !password || currentUser?.uid !== user.uid) return false;
    try {
      await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email, password));
      const profile = await resolveProfile(user);
      return version === sessionVersion.current && auth.currentUser?.uid === user.uid &&
        canSelectProfessional(profile, target);
    } catch {
      return false;
    }
  };

  const userRole: UserRole = currentUser?.role || 'receptionist';
  const userPermissions = currentUser ? ROLE_PERMISSIONS[userRole] : {
    label: 'Não autenticado', description: '', allowedTabs: [],
    canManageSettings: false, canViewFinancial: false, canManageUsers: false
  };

  const checkTabPermission = (tab: string): boolean => {
    return userPermissions.allowedTabs.includes(tab);
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      isAuthenticated: !!currentUser,
      userRole,
      userPermissions,
      allUsers,
      loadingAuth,
      authError,
      loginWithDemoUser,
      loginWithEmail,
      signupNewUser,
      logout,
      updateUserRoleAndProfile,
      requestPasswordReset,
      verifyPasswordForProfessionalOrUser,
      refreshUsersList,
      checkTabPermission
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
