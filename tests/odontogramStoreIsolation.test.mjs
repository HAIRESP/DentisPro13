import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync,existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {DatabaseSync} from 'node:sqlite';
import {openOdontogramStore} from '../server/odontogramStore.mjs';
function fixture(t){
 const dir=mkdtempSync(join(tmpdir(),'dentispro-odontogram-'));const dbPath=join(dir,'test.sqlite');
 const users={dentist:{uid:'d1',role:'dentist',professionalId:'pr1'},other:{uid:'d2',role:'dentist',professionalId:'pr2'},admin:{uid:'a',role:'admin'}};
 const access=new Set(['d1:p1']);
 const store=openOdontogramStore(dbPath,{resolveSession:t=>{if(!users[t])throw Error('invalid');return users[t];},authorizePatient:(a,id)=>access.has(`${a.uid}:${id}`)});
 t.after(()=>{store.close();rmSync(dir,{recursive:true,force:true});});return {store,dbPath,access};
}
const tooth=[{toothNumber:16,surfaces:{mesial:'carie'}}];
const code=n=>e=>e.status===n;
test('refuses existing database and refuses missing validation callbacks',t=>{
 const {dbPath}=fixture(t);
 assert.throws(()=>openOdontogramStore(dbPath,{resolveSession:()=>{},authorizePatient:()=>true}),/NOVO/);
});
test('deny by default for unauthenticated, admin, unlinked dentist and other patient',t=>{
 const {store}=fixture(t);
 for(const token of ['invalid','admin','other'])assert.throws(()=>store.save(token,'p1',{expectedVersion:0,conditions:tooth}),code(token==='invalid'?401:403));
 assert.throws(()=>store.read('dentist','p2'),code(403));
 assert.throws(()=>store.archive('dentist','p2',{expectedVersion:1,date:'2026-10-19',title:'Avaliação'}),code(403));
});
test('current save is versioned and creates no historical snapshot',t=>{
 const {store}=fixture(t);
 assert.deepEqual(store.read('dentist','p1'),{version:0,conditions:[]});
 assert.equal(store.save('dentist','p1',{expectedVersion:0,conditions:tooth}).version,1);
 assert.equal(store.history('dentist','p1').length,0);
 assert.deepEqual(store.read('dentist','p1').conditions,tooth);
 assert.throws(()=>store.save('dentist','p1',{expectedVersion:0,conditions:[]}),code(409));
 assert.deepEqual(store.read('dentist','p1').conditions,tooth);
});
test('archive is explicit, read-only and does not change current odontogram',t=>{
 const {store,dbPath}=fixture(t);
 store.save('dentist','p1',{expectedVersion:0,conditions:tooth});
 const snap=store.archive('dentist','p1',{expectedVersion:1,date:'2026-10-19',title:'Avaliação'});
 store.save('dentist','p1',{expectedVersion:1,conditions:[{toothNumber:17}]});
 assert.deepEqual(store.history('dentist','p1')[0].conditions,tooth);
 assert.equal(store.read('dentist','p1').version,2);
 assert.throws(()=>store.archive('dentist','p1',{expectedVersion:1,date:'2026-10-19',title:'Repetição'}),code(409));
 const db=new DatabaseSync(dbPath);try{assert.throws(()=>db.exec(`DELETE FROM odontogram_history`),/Immutable history/);assert.throws(()=>db.exec(`DELETE FROM odontogram_events`),/Immutable audit/);}finally{db.close();}
 assert.ok(snap.id);
});
test('revoke blocks reads and writes immediately',t=>{
 const {store,access}=fixture(t);store.save('dentist','p1',{expectedVersion:0,conditions:tooth});access.clear();
 assert.throws(()=>store.read('dentist','p1'),code(403));assert.throws(()=>store.save('dentist','p1',{expectedVersion:1,conditions:[]}),code(403));
});
test('invalid tooth, duplicate tooth and date refuse changes',t=>{
 const {store}=fixture(t);
 for(const conditions of [[{toothNumber:99}],[{toothNumber:16},{toothNumber:16}],'x'])assert.throws(()=>store.save('dentist','p1',{expectedVersion:0,conditions}),code(400));
 store.save('dentist','p1',{expectedVersion:0,conditions:tooth});
 assert.throws(()=>store.archive('dentist','p1',{expectedVersion:1,date:'2026-02-30',title:'Teste'}),code(400));
 assert.equal(store.history('dentist','p1').length,0);
});
