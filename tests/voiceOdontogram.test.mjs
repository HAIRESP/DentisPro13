import {test} from 'node:test';
import assert from 'node:assert/strict';
import {parseLocalDentalVoiceCommand as parse,parseDentalVoiceCommandWithAI,buildVoiceToothUpdates as updates} from '../src/utils/voiceOdontogramParser.ts';
test('unknown, negative and uncertain phrases never paint a lesion',()=>{
 for(const text of ['boa noite','não há cárie no dente 16','sem cárie no dente 16','possível cárie no dente 16 mesial','suspeita de cárie no dente 16 mesial']){
  const r=parse(text);assert.equal(r.action,'needs_review',text);assert.deepEqual(updates(r,[]),[]);
 }
});
test('no invented tooth, face or condition',()=>{
 for(const text of ['cárie oclusal','dente 16','cárie no dente 16','canal no dente 16','cálculo no dente 16'])assert.equal(parse(text).action,'needs_review',text);
 assert.deepEqual(parse('cárie mesial',[16]).teeth,[16]);
});
test('spoken FDI numbers use longest full words, including digit pairs',()=>{
 assert.deepEqual(parse('cárie mesial no dente vinte e um').teeth,[21]);
 assert.deepEqual(parse('cárie oclusal no dente quarenta e seis').teeth,[46]);
 assert.deepEqual(parse('cárie oclusal no dente um seis').teeth,[16]);
 assert.equal(parse('cárie mesial no dente 19').action,'needs_review');
 assert.equal(parse('selecionar dentes 11 a 21').action,'needs_review');
});
test('tooth groups distinguish premolars and arches, deciduous teeth and ranges',()=>{
 assert.deepEqual(parse('selecionar pré-molares superiores').teeth,[14,15,24,25]);
 assert.deepEqual(parse('selecionar dentes 11 a 13').teeth,[11,12,13]);
 assert.deepEqual(parse('selecionar dentes de leite superiores').teeth,[51,52,53,54,55,61,62,63,64,65]);
});
test('anatomical faces are validated before updating and no aliases are invented',()=>{
 assert.equal(parse('cárie oclusal no dente 11').action,'needs_review');
 assert.equal(parse('cárie lingual no dente 16').action,'needs_review');
 const u=updates(parse('cárie palatina no dente 16'),[])[0];
 assert.deepEqual(u.surfaces,{palatina:'carie'});
 assert.equal(parse('cárie incisal nos dentes 11 e 16').action,'needs_review');
});
test('coexisting findings survive a surface update',()=>{
 const prior={toothNumber:16,wholeToothCondition:'canal',hasCalculoSupra:true,surfaces:{distal:'restauracao'},notes:'anterior'};
 const result=updates(parse('cárie mesial no dente 16'),[prior])[0];
 assert.equal(result.surfaces.distal,'restauracao');assert.equal(result.surfaces.mesial,'carie');assert.equal(result.notes,'anterior');assert.equal(result.hasCalculoSupra,true);assert.equal(result.wholeToothCondition,'canal');
});
test('notes append without changing conditions and numerical doses do not select other teeth',()=>{
 const p={toothNumber:21,surfaces:{mesial:'restauracao'},notes:'anterior'};
 const r=parse('anotar no dente 21: relata uso de 16 mg');assert.equal(r.action,'add_notes');assert.deepEqual(r.teeth,[21]);
 const result=updates(r,[p])[0];assert.deepEqual(result.surfaces,p.surfaces);assert.ok(result.notes.startsWith('anterior\n'));
});
test('mixed conditions and partial erase commands demand review',()=>{
 assert.equal(parse('dente 16 cárie mesial e dente 21 restauração distal').action,'needs_review');
 assert.equal(parse('limpar cárie mesial no dente 16').action,'needs_review');
});
test('reset clears all legacy face keys and all flags',()=>{
 const r=parse('limpar dente 11');assert.equal(r.action,'clear_teeth');
 const p={toothNumber:11,surfaces:{incisal:'carie',palatina:'carie'},hasCalculoSupra:true,isGirovertido:true,notes:'antiga'};
 const u=updates(r,[p])[0];assert.equal(u.surfaces.incisal,'sio');assert.equal(u.surfaces.palatina,'sio');assert.equal(u.notes,'');assert.equal(u.hasCalculoSupra,false);
});
test('local deterministic interpretation does not call remote AI or invent its response',async()=>{
 const original=globalThis.fetch;globalThis.fetch=()=>{throw Error('Network must not be called');};
 try{assert.equal((await parseDentalVoiceCommandWithAI('boa noite',[],'deepseek')).action,'needs_review');}finally{globalThis.fetch=original;}
});
test('planned procedures and ambiguous extraction are not recorded as existing findings',()=>{
 for(const s of ['necessita implante no dente 16','extração no dente 16','exodontia no dente 16','planejar coroa no dente 16'])assert.equal(parse(s).action,'needs_review',s);
 assert.equal(parse('extração indicada no dente 16').conditionType,'extracao_indicada');
 assert.equal(parse('extração realizada no dente 16').conditionType,'ausente');
 assert.equal(parse('limpar mesial do dente 16').action,'needs_review');
});
