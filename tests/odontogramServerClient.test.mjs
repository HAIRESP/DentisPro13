import {test,afterEach} from 'node:test';
import assert from 'node:assert/strict';
import {loadServerOdontogram,saveServerOdontogram,odontogramRequest} from '../src/utils/odontogramServerClient.ts';
const originalFetch=globalThis.fetch;
const oldStorage=Object.getOwnPropertyDescriptor(globalThis,'sessionStorage');
let token='session-1';
Object.defineProperty(globalThis,'sessionStorage',{configurable:true,value:{getItem:()=>token,setItem:(_k,v)=>{token=v;},removeItem:()=>{token='';}}});
afterEach(()=>{globalThis.fetch=originalFetch;token='session-1';});
const json=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json'}});
const fixture=(patient='p1')=>async path=>json(path.endsWith('/current')?{version:1,conditions:[]} : path.endsWith('/history')?[]:{patient:{id:patient,name:'Paciente teste'}});
test('client loads matching current, history and patient using authenticated requests',async()=>{
  const calls=[];const mock=fixture();globalThis.fetch=async(path,init)=>{calls.push({path,init});return mock(path);};
  const result=await loadServerOdontogram('p1');assert.equal(result.patient.id,'p1');assert.equal(calls.length,3);
  for(const call of calls){assert.equal(call.init.headers.get('Authorization'),'Bearer session-1');assert.ok(call.init.signal);}
});
test('client rejects a mismatched patient identity',async()=>{
  globalThis.fetch=fixture('p2');await assert.rejects(loadServerOdontogram('p1'),/não correspondem/);
});
test('network failure is surfaced instead of claiming a local save',async()=>{
  globalThis.fetch=async()=>{throw Error('offline');};await assert.rejects(saveServerOdontogram('p1',{}),/offline/);
});
test('missing session blocks requests before fetch',async()=>{
  token='';globalThis.fetch=async()=>{assert.fail('fetch must not run');};
  await assert.rejects(odontogramRequest('/api/odontogram-mode'),e=>e.status===401);
});
test('incomplete acknowledgement is not accepted as a saved evaluation',async()=>{
  globalThis.fetch=async()=>json({id:'archive',version:1,alreadySaved:false});
  await assert.rejects(saveServerOdontogram('p1',{}),/Confirmação incompleta/);
});
test('response from an earlier session is discarded',async()=>{
  globalThis.fetch=async()=>{token='session-2';return json({enabled:true});};
  await assert.rejects(odontogramRequest('/api/odontogram-mode'),e=>e.status===401);
});
test('server denial preserves HTTP status for clearing the protected view',async()=>{
  globalThis.fetch=async()=>json({error:'Acesso revogado'},403);
  await assert.rejects(odontogramRequest('/api/odontogram/patients/p1/current'),e=>e.status===403 && e.message==='Acesso revogado');
});
process.on('exit',()=>{if(oldStorage)Object.defineProperty(globalThis,'sessionStorage',oldStorage);else delete globalThis.sessionStorage;});
