import { DatabaseSync } from 'node:sqlite';
import { randomBytes, randomUUID, scrypt as scryptCallback, timingSafeEqual, createHash } from 'node:crypto';
import { promisify } from 'node:util';
const scrypt = promisify(scryptCallback);
const digest = (value: string) => createHash('sha256').update(value).digest('hex');
const roles = ['admin', 'dentist', 'receptionist'];
export type LocalProfile = { uid: string; email: string; name: string; role: string; professionalId?: string; cro?: string; specialty?: string; createdAt: string };
export function validPassword(value: unknown): value is string { return typeof value === 'string' && value.length >= 12 && value.length <= 256; }
async function hashPassword(password: string) {
  if (!validPassword(password)) throw Error('A senha deve ter de 12 a 256 caracteres.');
  const salt = randomBytes(16).toString('hex');
  return `${salt}:${(await scrypt(password, salt, 64) as Buffer).toString('hex')}`;
}
async function matchesPassword(password: string, encoded: string) {
  const [salt, hash] = encoded.split(':');
  const actual = await scrypt(password, salt, 64) as Buffer;
  return actual.length === Buffer.from(hash, 'hex').length && timingSafeEqual(actual, Buffer.from(hash, 'hex'));
}
export function createLocalAuthStore(filename: string, now: () => number = Date.now) {
  const db = new DatabaseSync(filename);
  db.exec(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;
    CREATE TABLE IF NOT EXISTS accounts(uid TEXT PRIMARY KEY,email TEXT UNIQUE NOT NULL,password_hash TEXT NOT NULL,profile TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS sessions(token_hash TEXT PRIMARY KEY,uid TEXT NOT NULL REFERENCES accounts(uid) ON DELETE CASCADE,expires INTEGER NOT NULL,last_seen INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS auth_events(id INTEGER PRIMARY KEY,occurred_at INTEGER NOT NULL,actor TEXT NOT NULL,action TEXT NOT NULL,target TEXT);
  `);
  const event = (actor: string, action: string, target = actor) => db.prepare('INSERT INTO auth_events(occurred_at,actor,action,target) VALUES(?,?,?,?)').run(now(), actor, action, target);
  const getAccount = (uid: string) => db.prepare('SELECT * FROM accounts WHERE uid=?').get(uid) as {uid:string;email:string;password_hash:string;profile:string} | undefined;
  const profile = (uid: string): LocalProfile => { const a = getAccount(uid); if (!a) throw Error('Conta não encontrada.'); return JSON.parse(a.profile); };
  const hasUsers = () => Number(db.prepare('SELECT COUNT(*) AS count FROM accounts').get()!.count) > 0;
  const session = (token: string) => {
    if (!token || token.length > 200) throw Error('Sessão inválida.');
    const saved = db.prepare('SELECT * FROM sessions WHERE token_hash=?').get(digest(token)) as {uid:string;expires:number;last_seen:number} | undefined;
    if (!saved || saved.expires <= now() || saved.last_seen + 20 * 60_000 <= now()) throw Error('Sessão expirada. Entre novamente.');
    db.prepare('UPDATE sessions SET last_seen=? WHERE token_hash=?').run(now(), digest(token));
    return profile(saved.uid);
  };
  const requireAdmin = (token: string) => { const p = session(token); if (p.role !== 'admin') throw Error('Acesso restrito ao administrador.'); return p; };
  const createUser = async (data: Record<string, unknown>, actorToken?: string) => {
    const actor = actorToken ? requireAdmin(actorToken) : undefined;
    if (!actor && hasUsers()) throw Error('A configuração inicial já foi concluída.');
    const email = typeof data.email === 'string' ? data.email.trim().toLowerCase() : '';
    const name = typeof data.name === 'string' ? data.name.trim() : '';
    const role = actor ? String(data.role) : 'admin';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 || !name || name.length > 200 || !roles.includes(role)) throw Error('Confira nome, e-mail e perfil.');
    const passwordHash = await hashPassword(data.password as string);
    // Recheck privileges after asynchronous hashing, then commit synchronously.
    if (actorToken) requireAdmin(actorToken);
    db.exec('BEGIN IMMEDIATE');
    try {
      if (!actor && hasUsers()) throw Error('A configuração inicial já foi concluída.');
      const p: LocalProfile = {uid:randomUUID(),email,name,role,createdAt:new Date(now()).toISOString()};
      for (const key of ['professionalId','cro','specialty'] as const) if (typeof data[key] === 'string') p[key] = String(data[key]).slice(0,200);
      db.prepare('INSERT INTO accounts VALUES(?,?,?,?)').run(p.uid,email,passwordHash,JSON.stringify(p));
      event(actor?.uid || p.uid,'account-created',p.uid); db.exec('COMMIT'); return p;
    } catch (error) { db.exec('ROLLBACK'); throw error; }
  };
  return {
    close: () => db.close(), hasUsers, session, createUser,
    listUsers: (token: string) => { requireAdmin(token); return db.prepare('SELECT profile FROM accounts ORDER BY email').all().map(a=>JSON.parse(a.profile as string) as LocalProfile); },
    login: async (email: string, password: string) => {
      if (typeof email !== 'string' || typeof password !== 'string' || password.length > 256) throw Error('E-mail ou senha inválidos.');
      const a = db.prepare('SELECT * FROM accounts WHERE email=?').get(email.trim().toLowerCase()) as {uid:string;password_hash:string} | undefined;
      // Unknown accounts also perform a password derivation.
      const valid = await matchesPassword(password, a?.password_hash || `${'0'.repeat(32)}:${'0'.repeat(128)}`);
      if (!a || !valid || getAccount(a.uid)?.password_hash !== a.password_hash) throw Error('E-mail ou senha inválidos.');
      const token = randomBytes(32).toString('hex');
      db.prepare('DELETE FROM sessions WHERE expires<=? OR last_seen<=?').run(now(),now()-20*60_000);
      db.prepare('INSERT INTO sessions VALUES(?,?,?,?)').run(digest(token),a.uid,now()+8*60*60_000,now());
      event(a.uid,'login'); return {token,profile:profile(a.uid)};
    },
    logout: (token: string) => { db.prepare('DELETE FROM sessions WHERE token_hash=?').run(digest(token)); },
    verify: async (token: string, password: string) => { const p = session(token); const a = getAccount(p.uid)!; if (typeof password !== 'string' || password.length > 256 || !await matchesPassword(password,a.password_hash)) throw Error('Senha inválida.'); session(token); return p; },
    updateUser: (token: string, uid: string, updates: Record<string, unknown>) => {
      const actor = requireAdmin(token); const p = profile(uid);
      if ('role' in updates && (typeof updates.role !== 'string' || !roles.includes(updates.role) || actor.uid === uid && updates.role !== 'admin')) throw Error('Alteração de perfil não permitida.');
      const next = {...p};
      for (const key of ['name','role','professionalId','cro','specialty'] as const) if (typeof updates[key] === 'string') next[key] = String(updates[key]).slice(0,200);
      db.exec('BEGIN IMMEDIATE');
      try { db.prepare('UPDATE accounts SET profile=? WHERE uid=?').run(JSON.stringify(next),uid); if (next.role !== p.role || next.professionalId !== p.professionalId) db.prepare('DELETE FROM sessions WHERE uid=?').run(uid); event(actor.uid,'profile-updated',uid); db.exec('COMMIT'); } catch(e) {db.exec('ROLLBACK');throw e;}
      return next;
    },
    changePassword: async (token: string, oldPassword: string, password: string) => {
      const p = session(token);const a = getAccount(p.uid)!;
      if (typeof oldPassword !== 'string' || oldPassword.length>256 || !await matchesPassword(oldPassword,a.password_hash)) throw Error('Senha atual inválida.');
      const next = await hashPassword(password);session(token);
      if (getAccount(p.uid)?.password_hash !== a.password_hash) throw Error('A senha mudou em outra sessão. Entre novamente.');
      db.exec('BEGIN IMMEDIATE');try {db.prepare('UPDATE accounts SET password_hash=? WHERE uid=?').run(next,p.uid);db.prepare('DELETE FROM sessions WHERE uid=?').run(p.uid);event(p.uid,'password-changed');db.exec('COMMIT');}catch(e){db.exec('ROLLBACK');throw e;}
    },
    // Recovery is only available to the operator holding filesystem access to this server.
    recoverAdmin: async (email: string, password: string) => {
      const a=db.prepare('SELECT uid,profile FROM accounts WHERE email=?').get(email.trim().toLowerCase());
      if (!a || JSON.parse(a.profile as string).role !== 'admin') throw Error('Administrador não encontrado.');
      const hash=await hashPassword(password);db.exec('BEGIN IMMEDIATE');try{db.prepare('UPDATE accounts SET password_hash=? WHERE uid=?').run(hash,a.uid);db.prepare('DELETE FROM sessions WHERE uid=?').run(a.uid);event('server-operator','admin-recovery',a.uid as string);db.exec('COMMIT');}catch(e){db.exec('ROLLBACK');throw e;}
    }
  };
}
