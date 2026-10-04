// Compensates for a failed profile write without changing the administrator session.
export async function provisionUser<T>(steps: {
  create: () => Promise<T>;
  save: (account: T) => Promise<void>;
  rollback: (account: T) => Promise<void>;
}): Promise<T> {
  const account = await steps.create();
  try { await steps.save(account); }
  catch (error) {
    try { await steps.rollback(account); }
    catch { throw new Error('provision-cleanup-required'); }
    throw error;
  }
  return account;
}
