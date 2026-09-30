import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,copyFileSync,readFileSync,writeFileSync,rmSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {join} from 'node:path';

test('schema check accepts Windows checkout line endings but still rejects changed contracts',()=>{
 const dir=mkdtempSync(join(process.cwd(),'.schema-test-'));
 try {
  for(const p of ['scripts','src/types','server/security'])mkdirSync(join(dir,p),{recursive:true});
  copyFileSync('scripts/clinical-schema.mjs',join(dir,'scripts/clinical-schema.mjs'));
  for(const p of ['src/types/index.ts','server/security/clinical-schema.json'])writeFileSync(join(dir,p),readFileSync(p,'utf8').replace(/\r?\n/g,'\r\n'));
  const run=()=>execFileSync(process.execPath,[join(dir,'scripts/clinical-schema.mjs'),'--check'],{stdio:'pipe'});
  assert.doesNotThrow(run);
  const target=join(dir,'server/security/clinical-schema.json');
  const schema=JSON.parse(readFileSync(target,'utf8'));schema.version=999;
  writeFileSync(target,JSON.stringify(schema,null,2).replace(/\n/g,'\r\n')+'\r\n');
  assert.throws(run,/Clinical schema is stale/);
 }finally{rmSync(dir,{recursive:true,force:true});}
});

test('Firestore telemetry is an explicit runtime dependency and can load',async()=>{
 const pkg=JSON.parse(readFileSync('package.json','utf8'));
 const lock=JSON.parse(readFileSync('package-lock.json','utf8'));
 assert.ok(pkg.dependencies['@opentelemetry/api']);
 assert.equal(lock.packages[''].dependencies['@opentelemetry/api'],pkg.dependencies['@opentelemetry/api']);
 assert.notEqual(lock.packages['node_modules/@opentelemetry/api'].optional,true);
 const api=await import('@opentelemetry/api');assert.ok(api.trace);
 const firestore=await import('firebase-admin/firestore');assert.equal(typeof firestore.getFirestore,'function');
});
