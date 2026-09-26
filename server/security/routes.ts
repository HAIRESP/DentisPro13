import { Router, json } from 'express';
import { ClinicalSecurity } from './service';
import { createFirebaseStore } from './store';
import { AccessError, requireThat } from './policy';

let runtime: ReturnType<typeof createFirebaseStore> | undefined;
function getRuntime() { return runtime ||= createFirebaseStore(); }
function service() {
  const {store} = getRuntime();
  return new ClinicalSecurity(store, process.env.DENTISPRO_CLINIC_ID!, process.env.DENTISPRO_CODE_SECRET!, process.env.DENTISPRO_PUBLIC_URL!);
}
export function securityRouter() {
  const router = Router();
  router.use((_req, res, next) => { res.setHeader('Cache-Control', 'no-store'); res.setHeader('Referrer-Policy', 'no-referrer'); next(); });
  router.use(json({limit: '25mb'}));
  // Bearer credentials only; no cookie authentication or CORS wildcard.
  router.post('/command', async (req, res) => {
    const started = performance.now();
    try {
      const match = /^Bearer ([^\s]+)$/i.exec(req.headers.authorization || '');
      requireThat(match, 401, 'Entre na sua conta.');
      const runtime = getRuntime();
      let decoded: any;
      try { decoded = await runtime.verify(match[1]); } catch { throw new AccessError(401, 'Sessão inválida. Entre novamente.'); }
      await runtime.assertClientIsolation(match[1]);
      const api = service();
      const actor = await api.actor(decoded.uid, decoded.auth_time, process.env.DENTISPRO_BOOTSTRAP_ADMIN_UID!);
      if (['access.exception', 'migration.import'].includes(req.body.action)) requireThat(decoded.firebase?.sign_in_provider === 'password', 403, 'Confirme sua senha de acesso antes de continuar.');
      requireThat(typeof req.body.action === 'string', 400, 'Operação inválida.');
      const result = await api.run(actor, req.body.action, req.body.patientId, req.body.input);
      res.setHeader('Server-Timing', `secure;dur=${(performance.now() - started).toFixed(1)}`);
      res.json(result);
    } catch (error) {
      const known = error instanceof AccessError;
      res.status(known ? error.status : 503).json({error: known ? error.message : 'Não foi possível concluir com segurança. Verifique a conexão e a configuração do servidor. Se estava salvando, consulte a versão antes de repetir.'});
    }
  });
  return router;
}
export function patientPortalRouter() {
  const router = Router();
  router.use((_req, res, next) => { res.setHeader('Cache-Control', 'no-store'); res.setHeader('Referrer-Policy', 'no-referrer'); next(); });
  router.use(json({limit: '4kb'}));
  // Limits unauthenticated random-token probing; OTP attempts are additionally transactional.
  const hits = new Map<string, {count: number; until: number}>();
  router.post('/', async (req, res) => {
    try {
      const now = Date.now(), ip = req.ip || 'unknown';
      for (const [key, value] of hits) if (value.until <= now) hits.delete(key);
      const entry = hits.get(ip) || {count: 0, until: now + 60000};
      requireThat(entry.count++ < 30 && hits.size < 10000, 429, 'Aguarde um minuto antes de tentar novamente.'); hits.set(ip, entry);
      res.json(await service().portal(req.body.token, req.body.action, req.body.code, req.body.targetUid));
    } catch (error) {
      res.status(error instanceof AccessError ? error.status : 503).json({error: error instanceof AccessError ? error.message : 'Serviço indisponível. Tente novamente com a clínica.'});
    }
  });
  return router;
}

// Existing AI/tools routes use the same clinic membership and audit boundaries.
export function protectedLegacyApi(): import('express').RequestHandler {
  return async (req, res, next) => {
    try {
      const route = `${req.method} ${req.path}`;
      const action = ({
        'POST /gemini/parse-document': 'intake.ocr',
        'POST /gemini/parse-voice-odontogram': 'clinical.ai',
        'GET /sql/tuss-schema': 'admin.tools',
        'GET /sql/tuss-export': 'admin.tools',
      } as Record<string,string>)[route];
      requireThat(action, 403, 'Integração indisponível no atendimento protegido.');
      const match = /^Bearer ([^\s]+)$/i.exec(req.headers.authorization || '');
      requireThat(match, 401, 'Entre na sua conta.');
      const runtime = getRuntime();
      let token: any;
      try {token = await runtime.verify(match[1]);} catch {throw new AccessError(401, 'Sessão inválida.');}
      await runtime.assertClientIsolation(match[1]);
      const api = service(), actor = await api.actor(token.uid, token.auth_time, process.env.DENTISPRO_BOOTSTRAP_ADMIN_UID!);
      const patientId = action === 'admin.tools' ? undefined : req.get('X-Patient-Id');
      if (action !== 'admin.tools') requireThat(patientId, 400, 'Selecione um paciente autorizado.');
      await api.run(actor, action, patientId);
      const send = res.json.bind(res);
      let responding = false;
      res.json = ((body: unknown) => {
        if (responding) return res;
        responding = true;
        void runtime.store.audit({action: 'integration.result', route, clinic: process.env.DENTISPRO_CLINIC_ID, actorUid: actor.uid, patientId: patientId || null, status: res.statusCode}).then(() => send(body)).catch(() => {res.status(503); send({error:'Não foi possível registrar a operação. Resultado não liberado.'});});
        return res;
      }) as typeof res.json;
      next();
    } catch (error) {res.status(error instanceof AccessError ? error.status : 503).json({error: error instanceof AccessError ? error.message : 'Não foi possível verificar a autorização.'});}
  };
}
