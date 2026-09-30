import type { RequestHandler } from 'express';

export type ApiIdentity = { uid: string; role: string };
export const API_ROLES: Record<string, string[]> = {
  'POST /gemini/parse-document': ['admin', 'dentist', 'receptionist'],
  'POST /gemini/parse-voice-odontogram': ['admin', 'dentist'],
  'POST /whatsapp/send': ['admin', 'receptionist'],
  'POST /whatsapp/auto-reply': ['admin', 'receptionist'],
  'GET /whatsapp/status': ['admin', 'dentist', 'receptionist'],
  'GET /sql/tuss-schema': ['admin'],
  'GET /sql/tuss-export': ['admin'],
};

export function apiAccess(resolveIdentity: (token: string) => Promise<ApiIdentity>): RequestHandler {
  return async (req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    const match = /^Bearer ([^\s]+)$/i.exec(req.headers.authorization || '');
    if (!match) { res.status(401).json({ error: 'Entre na sua conta para continuar.' }); return; }
    let identity: ApiIdentity;
    try { identity = await resolveIdentity(match[1]); }
    catch { res.status(401).json({ error: 'Não foi possível validar a sessão. Entre novamente.' }); return; }
    if (!identity.uid || !API_ROLES[`${req.method} ${req.path}`]?.includes(identity.role)) {
      res.status(403).json({ error: 'Sua conta não tem permissão para esta operação.' }); return;
    }
    res.locals.identity = identity;
    next();
  };
}
