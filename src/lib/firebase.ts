import { sanitizeProfileWrite } from '../utils/authSession';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  getDocs, 
  updateDoc,
  deleteDoc,
  onSnapshot
} from 'firebase/firestore';
import firebaseConfigData from '../../firebase-applet-config.json';

const app = !getApps().length ? initializeApp(firebaseConfigData) : getApp();

export const auth = getAuth(app);
auth.languageCode = 'pt-BR';
export const db = getFirestore(app, firebaseConfigData.firestoreDatabaseId || undefined);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): void {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.warn('Firestore Operation Notice: ', JSON.stringify(errInfo));
}

export type UserRole = 'admin' | 'dentist' | 'receptionist';

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  cro?: string;
  specialty?: string;
  phone?: string;
  activeClinicId?: string;
  password?: string; // Senha cadastrada do usuário/profissional
  professionalId?: string; // ID do profissional correspondente em professionals (ex: prof-hugo)
  createdAt?: string;
  updatedAt?: string;
}

export const ROLE_PERMISSIONS: Record<UserRole, { label: string; description: string; allowedTabs: string[]; canManageSettings: boolean; canViewFinancial: boolean; canManageUsers: boolean }> = {
  admin: {
    label: 'Administrador(a)',
    description: 'Gestão da clínica e da equipe. Dados clínicos exigem autorização do paciente ou acesso excepcional auditado.',
    allowedTabs: ['dashboard', 'pacientes', 'agendamento', 'relatorios', 'documentos', 'laudos', 'triagem', 'exame_clinico', 'odontograma', 'estoque', 'financeiro', 'configuracoes'],
    canManageSettings: true,
    canViewFinancial: true,
    canManageUsers: true
  },
  dentist: {
    label: 'Dentista / Profissional',
    description: 'Acesso a atendimento clínico, agenda, pacientes, exames, evolução e documentos.',
    allowedTabs: ['dashboard', 'pacientes', 'agendamento', 'relatorios', 'documentos', 'laudos', 'triagem', 'exame_clinico', 'odontograma', 'estoque'],
    canManageSettings: false,
    canViewFinancial: false,
    canManageUsers: false
  },
  receptionist: {
    label: 'Recepcionista / Atendente',
    description: 'Acesso à gestão de agenda, cadastro de pacientes, envio de WhatsApp e recepção.',
    allowedTabs: ['dashboard', 'pacientes', 'agendamento'],
    canManageSettings: false,
    canViewFinancial: false,
    canManageUsers: false
  }
};

// Save or sync user profile in Firestore
export async function saveUserProfileToFirestore(profile: UserProfile): Promise<void> {
  if (!profile || !profile.uid) return;
  const path = `users/${profile.uid}`;
  try {
    const userRef = doc(db, 'users', profile.uid);
    await setDoc(userRef, {
      ...sanitizeProfileWrite({ ...profile }),
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
    throw err;
  }
}

// Get user profile from Firestore
export async function getUserProfileFromFirestore(uid: string): Promise<UserProfile | null> {
  if (!uid) return null;
  const path = `users/${uid}`;
  try {
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
  }
  return null;
}

// Fetch all users for Admin User Management
export async function fetchAllUsersFromFirestore(): Promise<UserProfile[]> {
  const path = 'users';
  try {
    const colRef = collection(db, 'users');
    const snap = await getDocs(colRef);
    const users: UserProfile[] = [];
    snap.forEach((docSnap) => {
      const { password: _password, ...profile } = docSnap.data();
      users.push(profile as UserProfile);
    });
    return users;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
    return [];
  }
}

// Save global clinic parameters in Firestore
export async function saveClinicParametersToFirestore(params: any): Promise<void> {
  const path = 'clinic_parameters/global';
  try {
    const paramRef = doc(db, 'clinic_parameters', 'global');
    await setDoc(paramRef, {
      ...params,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

// Load global clinic parameters from Firestore
export async function loadClinicParametersFromFirestore(): Promise<any | null> {
  const path = 'clinic_parameters/global';
  try {
    const paramRef = doc(db, 'clinic_parameters', 'global');
    const snap = await getDoc(paramRef);
    if (snap.exists()) {
      return snap.data();
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
  }
  return null;
}
