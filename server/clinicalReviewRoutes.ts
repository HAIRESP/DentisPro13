import express from 'express';
import { ClinicalReviewError } from './clinicalReviewStore.mjs';
import type { openClinicalReviewStore } from './clinicalReviewStore.mjs';
import type { createLocalAuthStore } from './localAuthStore';

export function clinicalReviewRoutes(
  store: ReturnType<typeof openClinicalReviewStore>, auth: ReturnType<typeof createLocalAuthStore>,
) {
  const router = express.Router();
  const attempts = new Map<string, { count: number; until: number }>();
  const token = (req: express.Request) => /^Bearer ([^\s]+)$/i.exec(req.headers.authorization || '')?.[1] || '';
  router.use((_req, res, next) => { res.setHeader('Cache-Control', 'no-store'); res.setHeader('X-Content-Type-Options', 'nosniff'); next(); });
  router.use((req, res, next) => {
    try { res.locals.profile = auth.session(token(req)); next(); }
    catch { res.status(401).json({ error: 'Sessão inválida. Entre novamente.' }); }
  });
  router.use(express.json({ limit: '16kb' }));
  const run = (handler: (req: express.Request) => unknown): express.RequestHandler => (req, res, next) => {
    try { res.json(handler(req)); } catch (error) { next(error); }
  };
  const after = (req: express.Request) => req.query.after === undefined ? '' : typeof req.query.after === 'string' ? req.query.after : null;
  const limit = (req: express.Request) => req.query.limit === undefined ? 50 : typeof req.query.limit === 'string' && /^\d+$/.test(req.query.limit) ? Number(req.query.limit) : NaN;
  router.get('/status', run(req => store.status(token(req))));
  router.get('/patients', run(req => store.patientList(token(req), after(req), limit(req))));
  router.get('/patients/:patientId/demographics', run(req => store.demographics(token(req), req.params.patientId)));
  router.get('/patients/:patientId/appointments', run(req => store.appointments(token(req), req.params.patientId)));
  router.get('/patients/:patientId/record', run(req => store.record(token(req), req.params.patientId)));
  router.get('/patients/:patientId/access', run(req => store.grants(token(req), req.params.patientId)));
  router.get('/procedures', run(req => store.catalog(token(req), after(req), limit(req))));
  router.get('/audit', run(req => store.events(token(req), req.query.after === undefined ? 0 :
    typeof req.query.after === 'string' && /^\d+$/.test(req.query.after) ? Number(req.query.after) : NaN)));
  const reauthenticate: express.RequestHandler = async (req, res, next) => {
    if (res.locals.profile.role !== 'admin') {
      try { store.deniedMutation(token(req), req.params.patientId); } catch (error) { next(error); return; }
      res.status(403).json({ error: 'Acesso restrito ao administrador.' }); return;
    }
    const now = Date.now();
    for (const [uid, bucket] of attempts) if (bucket.until <= now) attempts.delete(uid);
    const uid = res.locals.profile.uid;
    const bucket = attempts.get(uid) ?? { count: 0, until: now + 15 * 60_000 };
    attempts.set(uid, bucket);
    if (++bucket.count > 10) { res.status(429).json({ error: 'Muitas tentativas. Aguarde 15 minutos.' }); return; }
    try { await auth.verify(token(req), req.body?.currentPassword); next(); }
    catch {
      try { store.deniedMutation(token(req), req.params.patientId); } catch { /* session may have expired */ }
      res.status(403).json({ error: 'Confirme sua senha atual para alterar a autorização.' });
    }
  };
  router.post('/patients/:patientId/access', reauthenticate, run(req => store.grant(token(req), req.params.patientId, req.body)));
  router.post('/patients/:patientId/access/revoke', reauthenticate, run(req => store.revoke(token(req), req.params.patientId, req.body)));
  router.use((_req, res) => { res.status(404).json({ error: 'Operação de conferência não disponível.' }); });
  router.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    if (error instanceof ClinicalReviewError) { res.status(error.status).json({ error: error.message }); return; }
    const type = (error as { type?: string })?.type;
    if (type === 'entity.too.large') { res.status(413).json({ error: 'Solicitação muito grande.' }); return; }
    if (type === 'entity.parse.failed') { res.status(400).json({ error: 'JSON inválido.' }); return; }
    res.status(503).json({ error: 'Não foi possível concluir a conferência. Tente novamente.' });
  });
  return router;
}
