import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export const AuthGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, loadingAuth, authError, loginWithEmail, setupRequired, setupAdmin } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    const data = new FormData(event.currentTarget);
    setSubmitting(true);
    setError(null);
    try {
      const success = setupRequired ? await setupAdmin({name:String(data.get('name')||''),email:String(data.get('username')||''),password:String(data.get('password')||''),confirmation:String(data.get('confirmation')||''),setupCode:String(data.get('setupCode')||'')}) : await loginWithEmail(String(data.get('username') || ''), String(data.get('password') || ''));
      if (!success) setError('Não foi possível entrar. Confira suas credenciais e a conexão.');
    } catch {
      setError('Não foi possível concluir o login. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  if (currentUser && !loadingAuth) return <>{children}</>;

  return (
    <main className="min-h-screen bg-[#f5f5f0] flex items-center justify-center p-6">
      <section className="w-full max-w-md rounded-2xl bg-white border border-stone-200 p-8 shadow-sm space-y-5">
        <h1 className="text-2xl font-bold text-[#5a5a40]">{setupRequired?'Ativar administrador do DentisPro':'Entrar no DentisPro'}</h1>
        <p className="text-sm text-stone-600">{setupRequired?'Crie a conta deste servidor. O código de instalação aparece no PowerShell onde ele foi iniciado.':'Use o e-mail e a senha da sua conta neste servidor.'}</p>
        {(authError || error) && <p role="alert" className="text-sm text-red-700">{authError || error}</p>}
        {loadingAuth && <p role="status" className="text-sm text-stone-600">Verificando sua sessão…</p>}
        <form id="dentispro-entry-login" autoComplete="on" onSubmit={handleSubmit} className="space-y-4">
          {setupRequired && <><label className="block">Seu nome<input name="name" required className="w-full border rounded p-3" /></label><label className="block">Código de instalação<input name="setupCode" type="password" required autoComplete="off" className="w-full border rounded p-3" /></label></>}
          <div>
            <label htmlFor="entry-email" className="block text-sm mb-1">E-mail</label>
            <input id="entry-email" name="username" type="email" autoComplete="username" autoCapitalize="none" spellCheck={false} required className="w-full rounded-lg border border-stone-300 p-3" />
          </div>
          <div>
            <label htmlFor="entry-password" className="block text-sm mb-1">Senha</label>
            <input id="entry-password" name="password" type="password" autoComplete={setupRequired?"new-password":"current-password"} minLength={setupRequired?12:undefined} maxLength={256} required className="w-full rounded-lg border border-stone-300 p-3" />
          </div>
          {setupRequired && <label className="block">Confirme a senha<input name="confirmation" type="password" required minLength={12} maxLength={256} autoComplete="new-password" className="w-full border rounded p-3" /></label>}
          <button type="submit" disabled={submitting || loadingAuth} className="w-full bg-[#5a5a40] text-white rounded-lg p-3 font-bold disabled:opacity-60">
            {submitting ? 'Aguarde…' : setupRequired?'Criar administrador':'Entrar'}
          </button>
        </form>
      </section>
    </main>
  );
};
