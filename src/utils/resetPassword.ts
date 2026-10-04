export async function resetPasswordWithConfirmation(
  password: string, confirmation: string,
  validate: (password: string) => Promise<boolean>,
  confirm: (password: string) => Promise<void>
) {
  if (!password) throw new Error('Informe a nova senha.');
  if (password !== confirmation) throw new Error('As senhas não coincidem. Digite novamente.');
  if (!await validate(password)) throw new Error('A senha não atende aos requisitos de segurança da conta. Use uma senha mais forte.');
  await confirm(password);
}
