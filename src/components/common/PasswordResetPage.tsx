import React,{useState} from 'react';
import {authRequest,getSessionToken,setSessionToken} from '../../utils/authenticatedFetch';
export function PasswordResetPage(){
 const [error,setError]=useState('');const [busy,setBusy]=useState(false);const [done,setDone]=useState(false);
 return <main className="min-h-screen bg-stone-100 flex items-center justify-center p-6"><section className="bg-white rounded-xl p-8 max-w-md w-full space-y-4">
 <h1 className="text-xl font-bold">Alterar senha do DentisPro</h1>
 {!getSessionToken()&&!done?<p>Entre na conta para alterar sua senha. Se perdeu o acesso de administrador, use a recuperação no computador servidor, conforme o guia de instalação.</p>:!done?<form className="space-y-3" onSubmit={async e=>{e.preventDefault();if(busy)return;const data=new FormData(e.currentTarget);setBusy(true);setError('');try{await authRequest('/password',{currentPassword:data.get('currentPassword'),password:data.get('password'),confirmation:data.get('confirmation')});setSessionToken('');setDone(true);}catch(e){setError(e instanceof Error?e.message:'Falha ao alterar senha.');}finally{setBusy(false);}}}>
 <label className="block">Senha atual<input className="border rounded p-2 w-full" name="currentPassword" type="password" autoComplete="current-password" required/></label>
 <label className="block">Nova senha (mínimo 12 caracteres)<input className="border rounded p-2 w-full" name="password" type="password" autoComplete="new-password" minLength={12} maxLength={256} required/></label>
 <label className="block">Confirme a nova senha<input className="border rounded p-2 w-full" name="confirmation" type="password" autoComplete="new-password" minLength={12} maxLength={256} required/></label>
 <button className="bg-emerald-800 text-white rounded p-3" disabled={busy}>{busy?'Salvando…':'Alterar senha'}</button></form>:<p role="status">Senha alterada. Entre novamente com a nova senha.</p>}
 {error&&<p role="alert">{error}</p>}<a className="underline" href="/">Voltar ao sistema</a></section></main>;
}
