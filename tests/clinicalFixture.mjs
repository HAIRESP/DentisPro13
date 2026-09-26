import assert from 'node:assert/strict';
import {ClinicalSecurity} from '../server/security/service.ts';
export function fixture() {
  let now = 1800000000000, failAudit = false, failDelivery = false;
  const docs = new Map(), blobs = new Map(), logs = [], messages = [];
  let serial = Promise.resolve();
  const clone = v => v === undefined ? undefined : structuredClone(v);
  const store = {
    transaction(fn) {
      const work = serial.then(async () => {
        const next = new Map([...docs].map(([k,v]) => [k,clone(v)]));
        let wrote = false;
        const result = await fn({
          get: async p => {assert.equal(wrote, false, 'Firestore disallows reads after writes'); return clone(next.get(p) || null);},
          set: (p,v) => {wrote = true; next.set(p,clone(v));},
          create: (p,v) => {wrote = true; assert.equal(next.has(p), false, 'create may not overwrite'); next.set(p,clone(v));},
        });
        docs.clear(); for (const [k,v] of next) docs.set(k,v); return result;
      }); serial = work.catch(() => {}); return work;
    },
    list: async (path, limit = 100, after) => [...docs].filter(([k]) => k.startsWith(path + '/') && k.split('/').length === path.split('/').length+1).map(([k,v]) => ({...clone(v), id:k.split('/').at(-1)})).sort((a,b) => a.id.localeCompare(b.id)).filter(v => !after || v.id > after).slice(0,limit),
    putBlob: async v => {const k = 'blob-'+blobs.size; blobs.set(k,clone(v)); return k;},
    getBlob: async k => clone(blobs.get(k)),
    audit: async event => {if(failAudit) throw Error('audit offline'); logs.push(clone(event)); return 'audit-'+logs.length;},
    deliver: async (destination,message) => {if(failDelivery) throw Error('delivery offline'); messages.push({destination,message});},
    account: async uid => ({uid,name:uid,email:uid+'@test.invalid'}),
    createAccount: async () => 'new-account', activateAccount: async () => {},
  };
  const api = new ClinicalSecurity(store,'clinic','a'.repeat(32),'http://localhost:3000', () => now);
  const actors = Object.fromEntries(['owner','other','admin','reception'].map(uid => [uid,{uid,name:uid,role:uid === 'admin' ? 'admin' : uid === 'reception' ? 'receptionist' : 'dentist',authTime:now/1000}]));
  for (const actor of Object.values(actors)) docs.set(api.path('members',actor.uid),{...actor,active:true});
  const create = () => api.run(actors.reception,'patients.create',undefined,{ownerUid:'owner',demographics:{name:'Patient',email:'patient@test.invalid'}});
  const token = () => messages.at(-1).message.match(/patient-access#([\w-]+)/)[1];
  const otp = () => messages.at(-1).message.match(/Código: (\d{6})/)[1];
  return {api, actors, docs, logs, messages, create, otp, token, store, advance: n => {now+=n;}, failAudit: () => {failAudit=true;}, failDelivery: () => {failDelivery=true;}};
}

