import {test} from 'node:test';
import assert from 'node:assert/strict';
import {documentFingerprint} from '../src/utils/documentFingerprint.ts';
test('same clinical document yields identical digest regardless of object key order',async()=>{
 const a=await documentFingerprint({patientId:'p',panel:'odontogram',date:'2026-10-19',data:{conditions:[{toothNumber:16}],vitalSigns:{examTime:'14:30'}}});
 const b=await documentFingerprint({data:{vitalSigns:{examTime:'14:30'},conditions:[{toothNumber:16}]},date:'2026-10-19',panel:'odontogram',patientId:'p'});
 assert.equal(a,b);assert.match(a,/^[0-9a-f]{64}$/);
});
test('changed examination time or tooth is a new version',async()=>{
 const a=await documentFingerprint({date:'2026-10-19',time:'14:30',tooth:16});
 assert.notEqual(a,await documentFingerprint({date:'2026-10-19',time:'14:31',tooth:16}));
 assert.notEqual(a,await documentFingerprint({date:'2026-10-19',time:'14:30',tooth:26}));
});
