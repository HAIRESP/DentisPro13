import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import {securityRouter,patientPortalRouter} from '../server/security/routes.ts';
import {authorizationEmail} from '../server/security/emailTemplate.ts';
import {memoryWorkspace} from '../src/utils/secureWorkspace.ts';

test('security HTTP fails closed without credentials and marks responses no-store', async t=>{
 const app=express();app.use('/api/secure',securityRouter());app.use('/api/patient-access',patientPortalRouter());
 const server=app.listen(0,'127.0.0.1');await new Promise(r=>server.on('listening',r));t.after(()=>server.close());
 const url=`http://127.0.0.1:${server.address().port}`;
 const response=await fetch(url+'/api/secure/command',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'clinical.read',patientId:'patient'})});
 assert.equal(response.status,401);assert.equal(response.headers.get('cache-control'),'no-store');
 const missing=await fetch(url+'/api/secure/command',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer invalid'},body:JSON.stringify({action:'session'})});
 assert.equal(missing.status,503);assert.match((await missing.json()).error,/Configuração pendente/);
});
test('HTML e-mail escapes untrusted names and contains Portuguese content',()=>{
 const html=authorizationEmail('<script>alert(1)</script> & a code');assert.ok(!html.includes('<script>'));assert.match(html,/&lt;script&gt;/);assert.match(html,/lang="pt-BR"/);
});
test('workspace never reads browser storage, separates scopes and forbids destructive reset',async()=>{
 const events=[];
 const storage=memoryWorkspace({patientId:'p',initialStorage:{dentispro_patients_v2:[{id:'p'}]},onChange:value=>events.push(value)});
 storage.setItem('dentispro_inventory_v2','[{"id":"stock"}]');storage.setItem('dentispro_prescriptions_v2','[]');
 await new Promise(r=>queueMicrotask(r));assert.equal(events.length,1);assert.equal(events[0].dentispro_inventory_v2,undefined);assert.deepEqual(events[0].dentispro_patients_v2,[{id:'p'}]);assert.throws(()=>storage.clear(),/não é permitida/);
});
