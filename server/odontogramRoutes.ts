import express from 'express';
import { OdontogramStoreError } from './odontogramStore.mjs';
import type { openOdontogramStore } from './odontogramStore.mjs';

/** Isolated routes; deliberately NOT mounted in server.ts. Requires verified store callbacks. */
export function odontogramRoutes(store: ReturnType<typeof openOdontogramStore>) {
  const router = express.Router();
  router.use((_req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    next();
  });
  router.use(express.json({ limit: '3mb', strict: true }));
  const token = (req: express.Request) => /^Bearer ([^\s]+)$/i.exec(req.headers.authorization || '')?.[1] || '';
  const respond = (fn: (req: express.Request) => unknown): express.RequestHandler => (req, res, next) => {
    try { res.json(fn(req)); } catch (error) { next(error); }
  };
  router.get('/patients/:patientId/current', respond(req => store.read(token(req), req.params.patientId)));
  router.put('/patients/:patientId/current', respond(req => store.save(token(req), req.params.patientId, req.body)));
  router.post('/patients/:patientId/evaluations', respond(req => store.completeEvaluation(token(req), req.params.patientId, req.body)));
  router.get('/patients/:patientId/evaluations/:archiveId/document', respond(req => store.evaluationDocument(token(req),req.params.patientId,req.params.archiveId)));
  router.get('/patients/:patientId/evaluations/:archiveId/evolution', respond(req => store.evaluationEvolution(token(req),req.params.patientId,req.params.archiveId)));
  router.get('/patients/:patientId/history', respond(req => store.history(token(req), req.params.patientId)));
  router.use((_req, res) => res.status(404).json({error:'Rota não disponível.'}));
  router.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    if (error instanceof OdontogramStoreError) { res.status(error.status).json({error:error.message}); return; }
    if ((error as {type?:string})?.type === 'entity.too.large') { res.status(413).json({error:'Solicitação excede o limite.'}); return; }
    if ((error as {type?:string})?.type === 'entity.parse.failed') { res.status(400).json({error:'JSON inválido.'}); return; }
    res.status(400).json({error:'Requisição inválida.'});
  });
  return router;
}
