import express from 'express';
import { timingSafeEqual, createHash } from 'node:crypto';
import type { createLocalAuthStore } from './localAuthStore';
export function localAuthRoutes(store: ReturnType<typeof createLocalAuthStore>, setupCode: string) {
  const router = express.Router();
  router.use(express.json({limit:'16kb'}));
  router.use((_req,res,next)=>{res.setHeader('Cache-Control','no-store');next();});
  const attempts = new Map<string,{count:number;until:number}>();
  router.use((req,res,next)=>{
    if (req.method === 'GET') return next();
    const key=req.ip || 'unknown'; const now=Date.now();
    for(const [ip,value] of attempts) if(value.until<=now) attempts.delete(ip);
    const bucket=attempts.get(key)||{count:0,until:now+15*60_000};
    if(++bucket.count>30) {res.status(429).json({error:'Muitas tentativas. Aguarde 15 minutos.'});return;}
    attempts.set(key,bucket);next();
  });
  const token=(req:express.Request)=>/^Bearer ([^\s]+)$/i.exec(req.headers.authorization||'')?.[1]||'';
  router.get('/status',(_req,res)=>res.json({setupRequired:!store.hasUsers()}));
  router.post('/setup',async(req,res)=>{
    try{
      const hash=(s:string)=>createHash('sha256').update(s).digest();
      if(store.hasUsers() || typeof req.body.setupCode!=='string' || !timingSafeEqual(hash(req.body.setupCode),hash(setupCode))) {res.status(403).json({error:'Código de instalação inválido ou configuração concluída.'});return;}
      if(req.body.password!==req.body.confirmation) throw Error('As senhas não coincidem.');
      await store.createUser(req.body);res.status(201).json({success:true});
    }catch(e){res.status(400).json({error:e instanceof Error?e.message:'Não foi possível criar a conta.'});}
  });
  router.post('/login',async(req,res)=>{try{res.json(await store.login(req.body.email,req.body.password));}catch{res.status(401).json({error:'E-mail ou senha inválidos.'});}});
  router.post('/logout',(req,res)=>{store.logout(token(req));res.json({success:true});});
  router.use((req,res,next)=>{try{res.locals.profile=store.session(token(req));next();}catch{res.status(401).json({error:'Sessão expirada. Entre novamente.'});}});
  router.get('/me',(_req,res)=>res.json({profile:res.locals.profile}));
  router.get('/users',(req,res)=>{try{res.json({users:store.listUsers(token(req))});}catch{res.status(403).json({error:'Acesso restrito ao administrador.'});}});
  router.post('/users',async(req,res)=>{try{res.status(201).json({profile:await store.createUser(req.body,token(req))});}catch(e){res.status(400).json({error:e instanceof Error?e.message:'Falha no cadastro.'});}});
  router.patch('/users/:uid',(req,res)=>{try{res.json({profile:store.updateUser(token(req),req.params.uid,req.body)});}catch(e){res.status(403).json({error:e instanceof Error?e.message:'Alteração negada.'});}});
  router.post('/verify',async(req,res)=>{try{res.json({profile:await store.verify(token(req),req.body.password)});}catch{res.status(403).json({error:'Senha inválida.'});}});
  router.post('/password',async(req,res)=>{try{if(req.body.password!==req.body.confirmation)throw Error('As senhas não coincidem.');await store.changePassword(token(req),req.body.currentPassword,req.body.password);res.json({success:true});}catch(e){res.status(400).json({error:e instanceof Error?e.message:'Falha ao alterar senha.'});}});
  return router;
}
