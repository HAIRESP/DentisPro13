import React, { useId, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../lib/firebase';
import { readSignupFields } from '../../utils/signupFields';

export function NewUserForm({ onSuccess }: { onSuccess?: () => void }) {
  const { signupNewUser, userRole, currentUser } = useAuth();
  const id = useId();
  const lock = useRef(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  if (userRole !== 'admin') return <p>Somente administradores podem cadastrar contas.</p>;
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (lock.current) return;
    const form = event.currentTarget;
    setMessage('');
    try {
      const data = readSignupFields(new FormData(form));
      if (data.email.toLowerCase() === currentUser?.email.toLowerCase()) throw new Error('Use o e-mail da nova conta; este já pertence à conta conectada.');
      lock.current = true; setBusy(true);
      const ok = await signupNewUser(data.email, data.password, data.name, data.role as UserRole, data.cro, data.specialty);
      if (!ok) { setMessage('Não foi possível cadastrar. Confira a mensagem da sessão e se esse e-mail já possui uma conta.'); return; }
      form.reset(); setShowPassword(false);
      setMessage('Conta criada. A sessão do administrador foi mantida. Para testar, saia e entre com o e-mail da nova conta.');
      onSuccess?.();
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Não foi possível concluir o cadastro.'); }
    finally { lock.current = false; setBusy(false); }
  };
  const inputStyle = 'w-full border border-stone-300 rounded-lg p-2 text-sm';
  return <form onSubmit={submit} autoComplete="off" className="space-y-4">
    <p className="text-sm">Você está conectado como <strong>{currentUser?.email}</strong>. Preencha abaixo os dados da <strong>nova conta</strong>.</p>
    {message && <p role="status" className="text-sm p-3 bg-stone-100 rounded-lg">{message}</p>}
    <fieldset disabled={busy} className="space-y-3">
      <div><label htmlFor={`${id}-name`}>Nome da nova conta</label><input id={`${id}-name`} name="new-user-name" required autoComplete="off" className={inputStyle} /></div>
      <div><label htmlFor={`${id}-email`}>E-mail da nova conta</label><input id={`${id}-email`} name="new-user-email" type="email" required autoComplete="off" autoCapitalize="none" spellCheck={false} className={inputStyle} /></div>
      <div><label htmlFor={`${id}-password`}>Senha da nova conta</label><input id={`${id}-password`} name="new-user-password" type={showPassword ? 'text' : 'password'} required autoComplete="section-new-user new-password" className={inputStyle} /></div>
      <div><label htmlFor={`${id}-confirmation`}>Confirme a senha da nova conta</label><input id={`${id}-confirmation`} name="new-user-confirmation" type={showPassword ? 'text' : 'password'} required autoComplete="section-new-user new-password" className={inputStyle} /></div>
      <label className="flex gap-2 text-sm"><input type="checkbox" checked={showPassword} onChange={e => setShowPassword(e.target.checked)} />Mostrar senhas</label>
      <div><label htmlFor={`${id}-role`}>Perfil de acesso</label><select id={`${id}-role`} name="new-user-role" defaultValue="dentist" className={inputStyle}><option value="dentist">Dentista</option><option value="receptionist">Recepcionista</option><option value="admin">Administrador</option></select></div>
      <div><label htmlFor={`${id}-cro`}>CRO (opcional)</label><input id={`${id}-cro`} name="new-user-cro" inputMode="numeric" maxLength={8} onInput={e => { e.currentTarget.value = e.currentTarget.value.replace(/\D/g, '').slice(0, 8); }} className={inputStyle} /></div>
      <div><label htmlFor={`${id}-specialty`}>Especialidade (opcional)</label><input id={`${id}-specialty`} name="new-user-specialty" className={inputStyle} /></div>
      <button className="bg-[#5a5a40] text-white px-4 py-2 rounded-lg" type="submit">{busy ? 'Cadastrando…' : 'Criar nova conta'}</button>
    </fieldset>
  </form>;
}
