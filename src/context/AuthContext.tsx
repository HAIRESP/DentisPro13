import React, {createContext,useContext,useState,useEffect,useRef} from 'react';
import {UserProfile,UserRole,ROLE_PERMISSIONS} from '../lib/authProfile';
import {authRequest,setSessionToken,getSessionToken} from '../utils/authenticatedFetch';
import {canSelectProfessional} from '../utils/authSession';
interface AuthContextType {
 currentUser:UserProfile|null;isAuthenticated:boolean;userRole:UserRole;userPermissions:typeof ROLE_PERMISSIONS['admin'];allUsers:UserProfile[];loadingAuth:boolean;authError:string|null;setupRequired:boolean;
 setupAdmin:(data:{name:string;email:string;password:string;confirmation:string;setupCode:string})=>Promise<boolean>;
 loginWithDemoUser:(role:UserRole)=>void;loginWithEmail:(email:string,pass:string)=>Promise<boolean>;
 signupNewUser:(email:string,pass:string,name:string,role:UserRole,cro?:string,specialty?:string)=>Promise<boolean>;
 logout:()=>Promise<void>;updateUserRoleAndProfile:(uid:string,updates:Partial<UserProfile>)=>Promise<void>;
 requestPasswordReset:()=>Promise<boolean>;verifyPasswordForProfessionalOrUser:(target:string,password:string)=>Promise<boolean>;
 refreshUsersList:()=>Promise<void>;checkTabPermission:(tab:string)=>boolean;
}
const AuthContext=createContext<AuthContextType|undefined>(undefined);
export const AuthProvider:React.FC<{children:React.ReactNode}>=({children})=>{
 const [currentUser,setCurrentUser]=useState<UserProfile|null>(null);
 const [allUsers,setAllUsers]=useState<UserProfile[]>([]);
 const [loadingAuth,setLoadingAuth]=useState(true);
 const [authError,setAuthError]=useState<string|null>(null);
 const [setupRequired,setSetupRequired]=useState(false);
 const version=useRef(0);const pending=useRef(false);
 const clear=()=>{++version.current;setSessionToken('');setCurrentUser(null);setAllUsers([]);};
 useEffect(()=>{
   let active=true;
   for(const key of ['dentispro_current_session_v1','planetodonto_current_session_v1','dentispro_all_users_v2']) localStorage.removeItem(key);
   const expired=()=>{clear();setAuthError('Sessão expirada. Entre novamente.');};
   window.addEventListener('dentispro-session-expired',expired);
   void(async()=>{try{const status=await authRequest('/status');if(!active)return;setSetupRequired(status.setupRequired);if(getSessionToken()){const data=await authRequest('/me');if(active)setCurrentUser(data.profile);}}catch(e){if(active)setAuthError(e instanceof Error?e.message:'Servidor indisponível.');}finally{if(active)setLoadingAuth(false);}})();
   return()=>{active=false;window.removeEventListener('dentispro-session-expired',expired);};
 },[]);
 useEffect(()=>{
   if(!currentUser)return;
   let timer:ReturnType<typeof setTimeout>;
   const reset=()=>{clearTimeout(timer);timer=setTimeout(()=>{void logout();setAuthError('Sessão encerrada por inatividade.');},20*60_000);};
   const events=['pointerdown','keydown','scroll'];events.forEach(e=>window.addEventListener(e,reset));reset();
   return()=>{clearTimeout(timer);events.forEach(e=>window.removeEventListener(e,reset));};
 },[currentUser?.uid]);
 const refreshUsersList=async()=>{if(!currentUser){setAllUsers([]);return;}const v=version.current;if(currentUser.role!=='admin'){setAllUsers([currentUser]);return;}const data=await authRequest('/users');if(v===version.current)setAllUsers(data.users);};
 useEffect(()=>{void refreshUsersList().catch(e=>setAuthError(e.message));},[currentUser?.uid,currentUser?.role]);
 const loginWithEmail=async(email:string,password:string)=>{
   if(pending.current)return false;pending.current=true;setAuthError(null);const v=++version.current;
   try{const data=await authRequest('/login',{email,password});if(v!==version.current)return false;setSessionToken(data.token);setCurrentUser(data.profile);return true;}catch(e){setAuthError(e instanceof Error?e.message:'Não foi possível entrar.');return false;}finally{pending.current=false;}
 };
 const setupAdmin:AuthContextType['setupAdmin']=async data=>{if(pending.current)return false;pending.current=true;try{await authRequest('/setup',data);setSetupRequired(false);setAuthError('Conta criada. Entre com a nova senha.');return true;}catch(e){setAuthError(e instanceof Error?e.message:'Falha na configuração.');return false;}finally{pending.current=false;}};
 const logout=async()=>{const request=authRequest('/logout');clear();try{await request;}catch{/* Local token has already been discarded. */}};
 const signupNewUser:AuthContextType['signupNewUser']=async(email,password,name,role,cro,specialty)=>{
   if(pending.current)return false;pending.current=true;try{await authRequest('/users',{email,password,name,role,cro,specialty});await refreshUsersList();return true;}catch(e){setAuthError(e instanceof Error?e.message:'Falha ao cadastrar.');return false;}finally{pending.current=false;}
 };
 const updateUserRoleAndProfile:AuthContextType['updateUserRoleAndProfile']=async(uid,updates)=>{const data=await authRequest(`/users/${encodeURIComponent(uid)}`,updates,'PATCH');setAllUsers(users=>users.map(u=>u.uid===uid?data.profile:u));if(currentUser?.uid===uid)setCurrentUser(data.profile);};
 const verifyPasswordForProfessionalOrUser=async(target:string,password:string)=>{try{const {profile}=await authRequest('/verify',{password});return canSelectProfessional(profile,target);}catch{return false;}};
 const requestPasswordReset=async()=>{window.location.assign('/auth/action');return true;};
 const userRole=currentUser?.role||'receptionist';
 const userPermissions=currentUser?ROLE_PERMISSIONS[userRole]:{label:'Não autenticado',description:'',allowedTabs:[],canManageSettings:false,canViewFinancial:false,canManageUsers:false};
 return <AuthContext.Provider value={{currentUser,isAuthenticated:!!currentUser,userRole,userPermissions,allUsers,loadingAuth,authError,setupRequired,setupAdmin,loginWithDemoUser:()=>setAuthError('Use uma conta cadastrada.'),loginWithEmail,signupNewUser,logout,updateUserRoleAndProfile,requestPasswordReset,verifyPasswordForProfessionalOrUser,refreshUsersList,checkTabPermission:tab=>userPermissions.allowedTabs.includes(tab)}}>{children}</AuthContext.Provider>;
};
export function useAuth(){const context=useContext(AuthContext);if(!context)throw Error('useAuth must be used within AuthProvider');return context;}
