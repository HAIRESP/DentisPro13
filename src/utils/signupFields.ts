export function readSignupFields(data: FormData) {
  const name = String(data.get('new-user-name') || '').trim();
  const email = String(data.get('new-user-email') || '').trim();
  const password = String(data.get('new-user-password') || '');
  const confirmation = String(data.get('new-user-confirmation') || '');
  const role = String(data.get('new-user-role') || 'dentist');
  if (!name || !email || !password) throw new Error('Preencha nome, e-mail e senha da nova conta.');
  if (password !== confirmation) throw new Error('As senhas não coincidem. Confira a confirmação.');
  if (!['admin', 'dentist', 'receptionist'].includes(role)) throw new Error('Selecione um perfil válido.');
  return { name, email, password, role, cro: String(data.get('new-user-cro') || '').replace(/\D/g, '').slice(0, 8), specialty: String(data.get('new-user-specialty') || '').trim() };
}
