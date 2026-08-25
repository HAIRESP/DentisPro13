import { db } from './index.js';
import { users } from './schema.js';
import { eq } from 'drizzle-orm';

export async function getOrCreateUser(uid: string, email: string, name?: string) {
  const result = await db
    .insert(users)
    .values({
      uid,
      email,
      name: name || 'Usuário DentisPro'
    })
    .onConflictDoUpdate({
      target: users.uid,
      set: {
        email,
        name: name || 'Usuário DentisPro',
        updatedAt: new Date()
      }
    })
    .returning();

  return result[0];
}

export async function getUserByUid(uid: string) {
  const result = await db.select().from(users).where(eq(users.uid, uid));
  return result[0] || null;
}
