import {test} from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import {createLocalAuthStore} from '../server/localAuthStore.ts';
import {localAuthRoutes} from '../server/localAuthRoutes.ts';
const admin={email:'admin@example.test',name:'Administrador',password:'test-password-123',role:'admin'};
const setup=async t=>{let now=Date.now();const store=createLocalAuthStore(':memory:',()=>now);t.after(()=>store.close());await store.createUser(admin);const session=await store.login(admin.email,admin.password);return{store,session,advance:ms=>{now+=ms;}};};
test('first administrator is created only once and no password hash is exposed',async t=>{
 const {store,session}=await setup(t);assert.equal(session.profile.role,'admin');assert.equal(session.profile.password,undefined);assert.equal(session.profile.password_hash,undefined);
 await assert.rejects(store.createUser({...admin,email:'second@example.test'}),/já foi concluída/);
 await assert.rejects(store.login(admin.email,'wrong-password'),/inválidos/);
 await assert.rejects(store.login('unknown@example.test','wrong-password'),/inválidos/);
});
test('two concurrent first-account requests cannot create two administrators',async t=>{
 const store=createLocalAuthStore(':memory:');t.after(()=>store.close());
 const results=await Promise.allSettled([store.createUser(admin),store.createUser({...admin,email:'other@example.test'})]);assert.equal(results.filter(r=>r.status==='fulfilled').length,1);
});
test('dentist cannot list users, create admins or modify own role',async t=>{
 const {store,session}=await setup(t);const p=await store.createUser({...admin,email:'dentist@example.test',role:'dentist'},session.token);const dentist=await store.login(p.email,admin.password);
 assert.throws(()=>store.listUsers(dentist.token),/administrador/);await assert.rejects(store.createUser({...admin,email:'escalation@example.test'},dentist.token),/administrador/);assert.throws(()=>store.updateUser(dentist.token,p.uid,{role:'admin'}),/administrador/);
});
test('logout and inactivity invalidate access',async t=>{
 const {store,session,advance}=await setup(t);store.logout(session.token);assert.throws(()=>store.session(session.token));
 const fresh=await store.login(admin.email,admin.password);advance(21*60_000);assert.throws(()=>store.session(fresh.token),/expirada/);
});
test('role change invalidates existing sessions',async t=>{
 const {store,session}=await setup(t);const p=await store.createUser({...admin,email:'dentist@example.test',role:'dentist'},session.token);const dentist=await store.login(p.email,admin.password);store.updateUser(session.token,p.uid,{role:'receptionist'});assert.throws(()=>store.session(dentist.token));
});
test('password change requires current password and invalidates all sessions',async t=>{
 const {store,session}=await setup(t);const second=await store.login(admin.email,admin.password);
 await assert.rejects(store.changePassword(session.token,'wrong', 'new-strong-password'),/atual inválida/);
 await store.changePassword(session.token,admin.password,'new-strong-password');assert.throws(()=>store.session(second.token));await assert.rejects(store.login(admin.email,admin.password));assert.ok((await store.login(admin.email,'new-strong-password')).token);
});
test('filesystem recovery restores administrator access and revokes sessions',async t=>{
 const {store,session}=await setup(t);await store.recoverAdmin(admin.email,'recovered-password');assert.throws(()=>store.session(session.token));assert.ok((await store.login(admin.email,'recovered-password')).token);
});
test('HTTP setup requires setup code; user listing requires server-side admin role',async t=>{
 const store=createLocalAuthStore(':memory:');t.after(()=>store.close());const app=express();app.use('/api/auth',localAuthRoutes(store,'setup-test-secret'));
 const server=app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));t.after(()=>new Promise(r=>{server.close(r);server.closeAllConnections();}));
 const base=`http://127.0.0.1:${server.address().port}/api/auth`;
 const post=(url,body,token)=>fetch(base+url,{method:'POST',headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{})},body:JSON.stringify(body)});
 assert.equal((await post('/setup',{...admin,confirmation:admin.password,setupCode:'wrong'})).status,403);
 assert.equal((await post('/setup',{...admin,confirmation:'different',setupCode:'setup-test-secret'})).status,400);
 assert.equal((await post('/setup',{...admin,confirmation:admin.password,setupCode:'setup-test-secret'})).status,201);
 assert.equal((await fetch(base+'/users')).status,401);
 const login=await(await post('/login',admin)).json();assert.equal((await fetch(base+'/users',{headers:{Authorization:`Bearer ${login.token}`}})).status,200);
 assert.equal((await post('/setup',{...admin,confirmation:admin.password,setupCode:'setup-test-secret'})).status,403);
});

test('administrator cannot store an empty or unknown role',async t=>{const {store,session}=await setup(t);for(const role of ['',null,'owner'])assert.throws(()=>store.updateUser(session.token,session.profile.uid,{role}));assert.equal(store.session(session.token).role,'admin');});
