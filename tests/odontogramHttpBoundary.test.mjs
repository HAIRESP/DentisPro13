import { test } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { openOdontogramStore } from '../server/odontogramStore.mjs';
import { odontogramRoutes } from '../server/odontogramRoutes.ts';

async function setup(t) {
 const dir=mkdtempSync(join(tmpdir(),'dentispro-http-'));
 const allowed=new Set(['d1:p1']);
 const users={d1:{uid:'d1',role:'dentist',professionalId:'pr1'},d2:{uid:'d2',role:'dentist',professionalId:'pr2'},a:{uid:'a',role:'admin'}};
 const store=openOdontogramStore(join(dir,'only-test.sqlite'), {resolveSession:key=>{if(!users[key])throw Error('invalid');return users[key];},authorizePatient:(actor,patientId)=>allowed.has(`${actor.uid}:${patientId}`)});
 const app=express();app.use('/api/odontogram',odontogramRoutes(store));
 const server=app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));
 t.after(async()=>{await new Promise(r=>{server.close(r);server.closeAllConnections();});store.close();rmSync(dir,{force:true,recursive:true});});
 const base=`http://127.0.0.1:${server.address().port}/api/odontogram`;
 const request=(route,method='GET',actor='d1',body)=>fetch(base+route,{method,headers:{...(actor?{Authorization:`Bearer ${actor}`}:{}) ,...(body!==undefined?{'Content-Type':'application/json'}:{})},...(body!==undefined?{body:JSON.stringify(body)}:{})});
 return {request,allowed};
}
const tooth=[{toothNumber:16,surfaces:{mesial:'carie'}}];
const current='/patients/p1/current',history='/patients/p1/history';
test('HTTP denies unauthenticated, admin, other dentist and other patient', async t=>{
 const {request}=await setup(t);
 for(const [route,actor,status] of [[current,'',401],[current,'a',403],[current,'d2',403],['/patients/p2/current','d1',403]]) {
  assert.equal((await request(route,'GET',actor)).status,status);
 }
});
test('HTTP draft save is versioned and legacy archive without PDF is forbidden',async t=>{
 const {request}=await setup(t);
 let res=await request(current,'PUT','d1',{expectedVersion:0,conditions:tooth});assert.equal(res.status,200);assert.equal((await res.json()).version,1);
 res=await request(history);assert.equal(res.status,200);assert.deepEqual(await res.json(),[]);
 res=await request(current,'PUT','d1',{expectedVersion:0,conditions:[]});assert.equal(res.status,409);
 res=await request(current);assert.deepEqual((await res.json()).conditions,tooth);
 res=await request(history,'POST','d1',{expectedVersion:1,date:'2026-10-19',title:'Avaliação'});assert.equal(res.status,404);
 res=await request(history);assert.equal((await res.json()).length,0);
});
test('HTTP disallows extra methods and forged authorization',async t=>{
 const {request}=await setup(t);
 for(const method of ['DELETE','PATCH','POST'])assert.equal((await request(current,method,'d1',{})).status,404);
 assert.equal((await request(current,'PUT','a',{expectedVersion:0,conditions:tooth})).status,403);
 assert.equal((await request(current,'PUT','d2',{expectedVersion:0,conditions:tooth})).status,403);
});
test('revoked grant blocks HTTP reads and writes immediately',async t=>{
 const {request,allowed}=await setup(t);
 assert.equal((await request(current,'PUT','d1',{expectedVersion:0,conditions:tooth})).status,200);
 allowed.clear();
 assert.equal((await request(current)).status,403);
 assert.equal((await request(current,'PUT','d1',{expectedVersion:1,conditions:[]})).status,403);
 assert.equal((await request(history)).status,403);
});
test('invalid payload cannot mutate current record; response disables cache',async t=>{
 const {request}=await setup(t);
 const bad=await request(current,'PUT','d1',{expectedVersion:0,conditions:[{toothNumber:99}]});assert.equal(bad.status,400);assert.equal(bad.headers.get('cache-control'),'no-store');
 const res=await request(current);assert.equal((await res.json()).version,0);
});
