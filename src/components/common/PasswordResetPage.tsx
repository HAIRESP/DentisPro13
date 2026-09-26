import React, { useEffect, useRef, useState } from 'react';
import { verifyPasswordResetCode, confirmPasswordReset, validatePassword } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { resetPasswordWithConfirmation } from '../../utils/resetPassword';

export function PasswordResetPage() {
  const [action] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return { mode: params.get('mode'), code: params.get('oobCode') || '' };
  });
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const pending = useRef(false);

  useEffect(() => {
    let cancelled = false;
    // Remove the one-time token from the address bar and subsequent navigation.
    window.history.replaceState(null, '', '/auth/action');
    if (action.mode !== 'resetPassword' || !action.code) {
      setError('Este link não é válido para redefinir a senha. Solicite um novo e-mail.');
      setLoading(false);
      return;
    }
    verifyPasswordResetCode(auth, action.code).then(value => {
      if (!cancelled) setEmail(value);
    }).catch(() => {
      if (!cancelled) setError('O link expirou, já foi utilizado ou não pôde ser validado. Solicite um novo e-mail e confira a conexão.');
    }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [action]);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending.current || !email || done) return;
    const form = event.currentTarget;
    const fields = new FormData(form);
    pending.current = true;
    setBusy(true);
    setError('');
    try {
      await resetPasswordWithConfirmation(
        String(fields.get('password') || ''), String(fields.get('confirmation') || ''),
        async password => (await validatePassword(auth, password)).isValid,
        password => confirmPasswordReset(auth, action.code, password)
      );
      form.reset();
      setDone(true);
    } catch (failure) {
      const sdkCode = (failure as { code?: string })?.code;
      setError(sdkCode
        ? 'Não foi possível alterar a senha. Confira a conexão, os requisitos da senha ou solicite outro link.'
        : failure instanceof Error ? failure.message : 'Não foi possível alterar a senha.');
    } finally { pending.current = false; setBusy(false); }
  };

  return <main className="min-h-screen bg-[#f5f5f0] flex items-center justify-center p-5">
    <section className="w-full max-w-md rounded-2xl overflow-hidden bg-white shadow-lg border border-[#e5e5d1]">
      <header className="bg-[#4c4d37] p-7 text-white"><p className="text-2xl font-bold">DentisPro</p><p className="text-sm mt-1">Segurança da sua conta</p></header>
      <div className="p-7 space-y-5">
        <h1 className="text-xl font-bold">{done ? 'Senha alterada' : 'Escolha uma nova senha'}</h1>
        {loading && <p role="status">Verificando seu link…</p>}
        {error && <p role="alert" className="bg-rose-50 p-3 rounded-lg text-rose-800">{error}</p>}
        {done ? <p role="status">Sua nova senha foi salva. Volte ao sistema e entre com ela.</p> : email && <form onSubmit={submit} className="space-y-4">
          <p className="text-sm">Conta: {email}</p>
          <input type="hidden" name="username" autoComplete="username" value={email} />
          <div><label htmlFor="new-password" className="block mb-1">Nova senha</label><input id="new-password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" required disabled={busy} className="w-full border rounded-lg p-3" /></div>
          <div><label htmlFor="confirm-password" className="block mb-1">Confirme a nova senha</label><input id="confirm-password" name="confirmation" type={showPassword ? 'text' : 'password'} autoComplete="new-password" required disabled={busy} className="w-full border rounded-lg p-3" /></div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={showPassword} onChange={e => setShowPassword(e.target.checked)} />Mostrar senhas</label>
          <button disabled={busy} className="w-full bg-[#4c4d37] text-white p-3 rounded-lg disabled:opacity-50">{busy ? 'Salvando…' : 'Salvar nova senha'}</button>
        </form>}
        <a href="/" className="block text-sm underline text-[#4c4d37]">Voltar ao DentisPro</a>
      </div>
    </section>
  </main>;
}
