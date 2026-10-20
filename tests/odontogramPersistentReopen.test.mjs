import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { openOdontogramStore } from '../server/odontogramStore.mjs';

const pdfBase64=Buffer.from('%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\nstartxref\n0\n%%EOF').toString('base64');
function setup(t) {
 const directory=mkdtempSync(join(tmpdir(),'dentispro-persistent-'));
 t.after(()=>rmSync(directory,{recursive:true,force:true}));
 return {filename:join(directory,'odontogram.sqlite'),directory,
   callbacks:{resolveSession:token=>{if(token!=='valid')throw Error('invalid');return {uid:'u1',role:'dentist',professionalId:'prof1'}},authorizePatient:(actor,id,permission)=>id==='p1'&&actor.uid==='u1'&&['read','write'].includes(permission)}};
}
test('reopen preserves evaluation PDF, history, evolution and current version',t=>{
 const {filename,callbacks}=setup(t);
 const first=openOdontogramStore(filename,callbacks);
 const result=first.completeEvaluation('valid','p1',{requestId:'run1',expectedVersion:0,conditions:[{toothNumber:16}],date:'2026-10-19',title:'Teste',description:'Evolução teste',pdfBase64,filename:'Teste.pdf'});
 first.close();
 const reopened=openOdontogramStore(filename,{...callbacks,allowExisting:true});
 try {
  assert.equal(reopened.read('valid','p1').version,1);
  assert.equal(reopened.history('valid','p1')[0].id,result.id);
  assert.equal(reopened.evaluationDocument('valid','p1',result.id).pdfBase64,pdfBase64);
  assert.equal(reopened.evaluationEvolution('valid','p1',result.id).description,'Evolução teste');
  assert.throws(()=>reopened.read('valid','p2'),e=>e.status===403);
 }finally{reopened.close()}
});
test('persistent mode refuses arbitrary preexisting files without overwriting',t=>{
 const {filename,callbacks}=setup(t);
 writeFileSync(filename,'this is not sqlite');
 assert.throws(()=>openOdontogramStore(filename,{...callbacks,allowExisting:true}));
});
test('default isolated mode still refuses existing database',t=>{
 const {filename,callbacks}=setup(t);
 const store=openOdontogramStore(filename,callbacks);store.close();
 assert.throws(()=>openOdontogramStore(filename,callbacks),/NOVO/);
});
