import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  auth, 
  UserProfile, 
  UserRole, 
  ROLE_PERMISSIONS, 
  DEMO_USERS, 
  getUserProfileFromFirestore, 
  saveUserProfileToFirestore,
  fetchAllUsersFromFirestore
} from '../lib/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  onAuthStateChanged 
} from 'firebase/auth';

interface AuthContextType {
  currentUser: UserProfile | null;
  isAuthenticated: boolean;
  userRole: UserRole;
  userPermissions: typeof ROLE_PERMISSIONS['admin'];
  allUsers: UserProfile[];
  loadingAuth: boolean;
  loginWithDemoUser: (role: UserRole) => void;
  loginWithEmail: (email: string, pass: string) => Promise<boolean>;
  signupNewUser: (email: string, pass: string, name: string, role: UserRole, cro?: string, specialty?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUserRoleAndProfile: (uid: string, updates: Partial<UserProfile>) => Promise<void>;
  updateUserPassword: (uid: string, newPassword: string) => Promise<boolean>;
  verifyPasswordForProfessionalOrUser: (targetProfIdOrEmail: string, inputPassword: string) => boolean;
  refreshUsersList: () => Promise<void>;
  checkTabPermission: (tab: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'dentispro_current_session_v1';
const LEGACY_AUTH_STORAGE_KEY = 'planetodonto_current_session_v1';
const ALL_USERS_STORAGE_KEY = 'dentispro_all_users_v2';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize current user from localStorage or default to Admin demo user
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY) || localStorage.getItem(LEGACY_AUTH_STORAGE_KEY);
      return saved ? JSON.parse(saved) : DEMO_USERS[0];
    } catch {
      return DEMO_USERS[0];
    }
  });

  const [allUsers, setAllUsers] = useState<UserProfile[]>(() => {
    try {
      const saved = localStorage.getItem(ALL_USERS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge with DEMO_USERS to ensure any new demo properties are kept
          const map = new Map<string, UserProfile>();
          DEMO_USERS.forEach(u => map.set(u.uid, u));
          parsed.forEach((u: UserProfile) => {
            const existing = map.get(u.uid);
            map.set(u.uid, { ...existing, ...u });
          });
          return Array.from(map.values());
        }
      }
    } catch (e) {
      console.warn('Error loading cached users', e);
    }
    return DEMO_USERS;
  });

  const [loadingAuth, setLoadingAuth] = useState<boolean>(true);

  // Sync users to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(ALL_USERS_STORAGE_KEY, JSON.stringify(allUsers));
    } catch (e) {
      console.warn('Error saving all users to local storage', e);
    }
  }, [allUsers]);

  // Sync to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(currentUser));
      localStorage.setItem(LEGACY_AUTH_STORAGE_KEY, JSON.stringify(currentUser));
      // Only sync to Firestore if user is an authenticated Firebase user
      if (auth.currentUser && auth.currentUser.uid === currentUser.uid) {
        saveUserProfileToFirestore(currentUser);
      }
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(LEGACY_AUTH_STORAGE_KEY);
    }
  }, [currentUser]);

  // Firebase Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const profile = await getUserProfileFromFirestore(fbUser.uid);
        if (profile) {
          setCurrentUser(profile);
        } else {
          // Create basic profile if not exists
          const newProfile: UserProfile = {
            uid: fbUser.uid,
            email: fbUser.email || '',
            name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Usuário',
            role: 'dentist',
            createdAt: new Date().toISOString()
          };
          setCurrentUser(newProfile);
          await saveUserProfileToFirestore(newProfile);
        }
      }
      setLoadingAuth(false);
    });

    refreshUsersList();

    return () => unsubscribe();
  }, []);

  const refreshUsersList = async () => {
    const users = await fetchAllUsersFromFirestore();
    if (users && users.length > 0) {
      // Merge with demo users to ensure demo profiles exist
      const mergedMap = new Map<string, UserProfile>();
      DEMO_USERS.forEach(u => mergedMap.set(u.uid, u));
      users.forEach(u => mergedMap.set(u.uid, u));
      setAllUsers(Array.from(mergedMap.values()));
    } else {
      setAllUsers(DEMO_USERS);
    }
  };

  const loginWithDemoUser = (role: UserRole) => {
    const found = DEMO_USERS.find(u => u.role === role) || DEMO_USERS[0];
    setCurrentUser(found);
  };

  const loginWithEmail = async (email: string, pass: string): Promise<boolean> => {
    try {
      const res = await signInWithEmailAndPassword(auth, email, pass);
      const profile = await getUserProfileFromFirestore(res.user.uid);
      if (profile) {
        setCurrentUser(profile);
      }
      return true;
    } catch (err) {
      console.error('Login error:', err);
      // Fallback check against DEMO_USERS
      const demo = DEMO_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (demo) {
        setCurrentUser(demo);
        return true;
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
    try {
      const res = await createUserWithEmailAndPassword(auth, email, pass);
      const newProfile: UserProfile = {
        uid: res.user.uid,
        email,
        name,
        role,
        cro,
        specialty,
        createdAt: new Date().toISOString()
      };
      await saveUserProfileToFirestore(newProfile);
      setCurrentUser(newProfile);
      await refreshUsersList();
      return true;
    } catch (err) {
      console.error('Signup error:', err);
      // Local fallback profile creation
      const localProfile: UserProfile = {
        uid: `user_local_${Date.now()}`,
        email,
        name,
        role,
        cro,
        specialty,
        createdAt: new Date().toISOString()
      };
      setCurrentUser(localProfile);
      setAllUsers(prev => [...prev, localProfile]);
      return true;
    }
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (e) {
      console.warn('Signout error', e);
    }
    setCurrentUser(null);
  };

  const updateUserRoleAndProfile = async (uid: string, updates: Partial<UserProfile>) => {
    const updatedUsers = allUsers.map(u => {
      if (u.uid === uid) {
        const newProf = { ...u, ...updates, updatedAt: new Date().toISOString() };
        saveUserProfileToFirestore(newProf);
        if (currentUser?.uid === uid) {
          setCurrentUser(newProf);
        }
        return newProf;
      }
      return u;
    });
    setAllUsers(updatedUsers);
  };

  const updateUserPassword = async (uid: string, newPassword: string): Promise<boolean> => {
    try {
      const updatedUsers = allUsers.map(u => {
        if (u.uid === uid) {
          const updated = { ...u, password: newPassword, updatedAt: new Date().toISOString() };
          saveUserProfileToFirestore(updated);
          if (currentUser?.uid === uid) {
            setCurrentUser(updated);
          }
          return updated;
        }
        return u;
      });
      setAllUsers(updatedUsers);
      return true;
    } catch (err) {
      console.error('Error updating user password:', err);
      return false;
    }
  };

  const verifyPasswordForProfessionalOrUser = (targetProfIdOrEmail: string, inputPassword: string): boolean => {
    if (!inputPassword) return false;
    const trimmedInput = inputPassword.trim();

    // 1. Check against master admin passwords (admin123 or current active admin's password)
    const adminUser = allUsers.find(u => u.role === 'admin' || u.uid === 'demo_admin_01');
    if (adminUser?.password && adminUser.password === trimmedInput) {
      return true;
    }
    if (trimmedInput === 'admin123') {
      return true;
    }

    // 2. Find matching user profile by professionalId, uid, or email
    const targetUser = allUsers.find(u => 
      u.professionalId === targetProfIdOrEmail ||
      u.uid === targetProfIdOrEmail ||
      u.email.toLowerCase() === targetProfIdOrEmail.toLowerCase()
    );

    if (targetUser) {
      // If user has a set password, verify
      if (targetUser.password && targetUser.password === trimmedInput) {
        return true;
      }
      // Default fallback passwords for demo accounts
      if (targetUser.role === 'admin' && trimmedInput === 'admin123') return true;
      if (targetUser.role === 'dentist' && (trimmedInput === '123456' || trimmedInput === 'dentista123')) return true;
      if (targetUser.role === 'receptionist' && trimmedInput === 'recepcao123') return true;
    }

    // 3. Fallback generic dentist password for quick development / demo
    if (trimmedInput === '123456') {
      return true;
    }

    return false;
  };

  const userRole: UserRole = currentUser?.role || 'admin';
  const userPermissions = ROLE_PERMISSIONS[userRole] || ROLE_PERMISSIONS.admin;

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
      loginWithDemoUser,
      loginWithEmail,
      signupNewUser,
      logout,
      updateUserRoleAndProfile,
      updateUserPassword,
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
