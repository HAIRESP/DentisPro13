import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const route=readFileSync(new URL('../server/odontogramRoutes.ts',import.meta.url),'utf8');
const client=readFileSync(new URL('../src/utils/odontogramEvaluationClient.ts',import.meta.url),'utf8');
test('legacy HTTP history creation without PDF/evolution is disabled',()=>{
 assert.doesNotMatch(route,/router\.post\('\/patients\/:patientId\/history'/);
 assert.match(route,/router\.post\('\/patients\/:patientId\/evaluations'/);
});
test('clinical client submits one completed evaluation and checks server acknowledgement',()=>{
 assert.match(client,/authenticatedFetch/);
 assert.match(client,/method: 'POST'/);
 assert.match(client,/documentId/);
 assert.match(client,/evolutionId/);
 assert.match(client,/alreadySaved/);
});
