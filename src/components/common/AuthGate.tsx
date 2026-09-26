import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export const AuthGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, loadingAuth, authError, loginWithEmail } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    const data = new FormData(event.currentTarget);
    setSubmitting(true);
    setError(null);
    try {
      const success = await loginWithEmail(String(data.get('username') || ''), String(data.get('password') || ''));
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
        <h1 className="text-2xl font-bold text-[#5a5a40]">Entrar no DentisPro</h1>
        <p className="text-sm text-stone-600">Use o e-mail e a senha da sua conta.</p>
        {(authError || error) && <p role="alert" className="text-sm text-red-700">{authError || error}</p>}
        {loadingAuth && <p role="status" className="text-sm text-stone-600">Verificando sua sessão…</p>}
        <form id="dentispro-entry-login" autoComplete="on" onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="entry-email" className="block text-sm mb-1">E-mail</label>
            <input id="entry-email" name="username" type="email" autoComplete="username" autoCapitalize="none" spellCheck={false} required className="w-full rounded-lg border border-stone-300 p-3" />
          </div>
          <div>
            <label htmlFor="entry-password" className="block text-sm mb-1">Senha</label>
            <input id="entry-password" name="password" type="password" autoComplete="current-password" required className="w-full rounded-lg border border-stone-300 p-3" />
          </div>
          <button type="submit" disabled={submitting || loadingAuth} className="w-full bg-[#5a5a40] text-white rounded-lg p-3 font-bold disabled:opacity-60">
            {submitting ? 'Entrando…' : 'Entrar'}
          </button>
        </form>
      </section>
    </main>
  );
};
