import { authorizationEmail } from './emailTemplate';
import { applicationDefault, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';
import config from '../../firebase-applet-config.json' with { type: 'json' };
import { AccessError, digest, identifier, requireThat } from './policy';
import { randomUUID } from 'node:crypto';

export type Document = Record<string, any>;
export interface UnitOfWork {
  get(path: string): Promise<Document | null>;
  set(path: string, data: Document): void;
  create(path: string, data: Document): void;
}
export interface SecureStore {
  transaction<T>(fn: (tx: UnitOfWork) => Promise<T>): Promise<T>;
  list(collection: string, limit?: number, after?: string): Promise<Array<Document & {id: string}>>;
  putBlob(data: Document): Promise<string>;
  getBlob(key: string): Promise<Document>;
  audit(event: Document): Promise<string>;
  deliver(destination: string, message: string): Promise<void>;
  createAccount(email: string, password: string, name: string): Promise<string>;
  activateAccount(uid: string): Promise<void>;
  account(uid: string): Promise<{uid: string; name: string; email: string}>;
}

export function createFirebaseStore(): { store: SecureStore; verify: (token: string) => Promise<any>; assertClientIsolation: (token: string) => Promise<void> } {
  for (const name of ['DENTISPRO_CLINIC_ID', 'DENTISPRO_BOOTSTRAP_ADMIN_UID', 'DENTISPRO_AUDIT_BUCKET', 'DENTISPRO_AUDIT_RETENTION_SECONDS', 'DENTISPRO_CLINICAL_BUCKET', 'DENTISPRO_CODE_SECRET', 'DENTISPRO_DELIVERY_URL', 'DENTISPRO_DELIVERY_TOKEN', 'DENTISPRO_PUBLIC_URL']) {
    requireThat(process.env[name], 503, `Configuração pendente no servidor: ${name}.`);
  }
  identifier(process.env.DENTISPRO_CLINIC_ID);
  requireThat(process.env.DENTISPRO_CODE_SECRET!.length >= 32, 503, 'A chave dos códigos precisa ter pelo menos 32 caracteres aleatórios.');
  const publicUrl = new URL(process.env.DENTISPRO_PUBLIC_URL!);
  requireThat(publicUrl.protocol === 'https:' || (publicUrl.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(publicUrl.hostname)), 503, 'O portal do paciente requer HTTPS; localhost é apenas para teste.');
  const delivery = new URL(process.env.DENTISPRO_DELIVERY_URL!);
  requireThat(delivery.protocol === 'https:', 503, 'O serviço de mensagens deve usar HTTPS.');
  const app = getApps().find(a => a.name === 'clinical-security') || initializeApp({ credential: applicationDefault(), projectId: config.projectId }, 'clinical-security');
  const db = getFirestore(app, config.firestoreDatabaseId || '(default)');
  const bucket = getStorage(app).bucket(process.env.DENTISPRO_CLINICAL_BUCKET);
  const auditBucket = getStorage(app).bucket(process.env.DENTISPRO_AUDIT_BUCKET);
  requireThat(bucket.name !== auditBucket.name, 503, 'Separe o armazenamento clínico da auditoria.');
  const prefix = `clinics/${process.env.DENTISPRO_CLINIC_ID}`;
  async function lockedAudit() {
    const [meta] = await auditBucket.getMetadata();
    requireThat(meta.retentionPolicy?.isLocked && Number(process.env.DENTISPRO_AUDIT_RETENTION_SECONDS) > 0 && Number(meta.retentionPolicy.retentionPeriod) >= Number(process.env.DENTISPRO_AUDIT_RETENTION_SECONDS), 503,
      'A auditoria exige um bucket com retenção bloqueada. A duração deve ser definida antes da ativação.');
    requireThat(meta.iamConfiguration?.publicAccessPrevention === 'enforced', 503, 'Bloqueie o acesso público ao bucket de auditoria.');
  }
  const store: SecureStore = {
    transaction: fn => db.runTransaction(async tx => fn({
      get: async p => { const s = await tx.get(db.doc(p)); return s.exists ? s.data()! : null; },
      set: (p,d) => { tx.set(db.doc(p), d); },
      create: (p,d) => { tx.create(db.doc(p), d); },
    })),
    list: async (collection, limit = 100, after) => {
      let q = db.collection(collection).orderBy('__name__').limit(Math.min(limit, 100));
      if (after) q = q.startAfter(after);
      return (await q.get()).docs.map(d => ({...d.data(), id: d.id}));
    },
    putBlob: async data => {
      const [meta] = await bucket.getMetadata();
      requireThat(meta.iamConfiguration?.publicAccessPrevention === 'enforced', 503, 'Bloqueie o acesso público ao armazenamento clínico.');
      const key = `${prefix}/versions/${randomUUID()}.json`;
      await bucket.file(key).save(JSON.stringify(data), { resumable: false, contentType: 'application/json', preconditionOpts: {ifGenerationMatch: 0}, metadata: {cacheControl: 'no-store'} });
      return key;
    },
    getBlob: async key => {
      requireThat(key.startsWith(`${prefix}/versions/`) && !key.includes('..'), 500, 'Referência de prontuário inválida.');
      const [buffer] = await bucket.file(key).download();
      return JSON.parse(buffer.toString('utf8'));
    },
    audit: async event => {
      await lockedAudit();
      const id = `${Date.now()}-${randomUUID()}`;
      const body = JSON.stringify({...event, eventId: id, recordedAt: new Date().toISOString()});
      await auditBucket.file(`${prefix}/audit/${id}.json`).save(body, {
        resumable: false, contentType: 'application/json', preconditionOpts: {ifGenerationMatch: 0},
        metadata: {cacheControl: 'no-store', metadata: {sha256: digest(body)}},
      });
      await db.collection(`secure_clinics/${process.env.DENTISPRO_CLINIC_ID}/audit_index`).doc(id).create({...event, eventId: id, recordedAt: new Date().toISOString()});
      return id;
    },
    deliver: async (destination, message) => {
      // No payload logging: the delivery service receives codes; it must not log them.
      const response = await fetch(delivery, {
        method: 'POST', redirect: 'error', signal: AbortSignal.timeout(10000),
        headers: {'Content-Type': 'application/json', Authorization: `Bearer ${process.env.DENTISPRO_DELIVERY_TOKEN}`},
        body: JSON.stringify({channel: 'email', destination, subject: 'DentisPro — autorização de acesso', message, html: authorizationEmail(message)}),
      });
      if (!response.ok) throw new AccessError(503, 'Não foi possível enviar a mensagem ao paciente. Nenhum acesso foi liberado.');
    },
    createAccount: async (email, password, name) => (await getAuth(app).createUser({email, password, displayName: name, disabled: true})).uid,
    activateAccount: async uid => {await getAuth(app).updateUser(uid, {disabled: false});},
    account: async uid => { const user = await getAuth(app).getUser(uid); requireThat(!user.disabled && user.email, 400, 'Conta indisponível.'); return {uid, email: user.email!, name: user.displayName || user.email!}; },
  };
  return {
    store, verify: token => getAuth(app).verifyIdToken(token, true),
    assertClientIsolation: async token => {
      const database = config.firestoreDatabaseId || '(default)';
      const url = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(config.projectId)}/databases/${encodeURIComponent(database)}/documents/secure_clinics/${encodeURIComponent(process.env.DENTISPRO_CLINIC_ID!)}/privacyProbe/denyClientRead`;
      const response = await fetch(url, {headers: {Authorization: `Bearer ${token}`}, signal: AbortSignal.timeout(10000)});
      requireThat(response.status === 403, 503, 'As regras do Firestore precisam bloquear o acesso direto aos prontuários, inclusive para administradores. Publique e valide as regras antes de ativar.');
    },
  };
}
