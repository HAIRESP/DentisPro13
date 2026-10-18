import assert from 'node:assert/strict';
import { test } from 'node:test';
import { registerHooks } from 'node:module';

// Test-only readiness substitute; real sterilization/expiry policy is NOT tested here.
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.endsWith('/inventoryReadiness')) {
      return { url: 'data:text/javascript,export function getItemReadinessInfo(item) { return {isReady: item.testReady !== false}; }', shortCircuit: true };
    }
    if (specifier.startsWith('.') && context.parentURL?.endsWith('.ts') && !/\.[a-z]+$/i.test(specifier)) {
      return nextResolve(specifier + '.ts', context);
    }
    return nextResolve(specifier, context);
  }
});
const { resolveStockUsage, normalizeStockUnit } = await import('../src/utils/stockUnits.ts');
const { createAppointmentStockStore, APPOINTMENT_STOCK_KEY } = await import('../src/utils/appointmentStockStore.ts');
const { prepareAppointmentStockDeduction } = await import('../src/utils/appointmentStockDeduction.ts');

const needle = (overrides = {}) => ({ id:'needle', name:'Agulha longa', itemType:'insumo', category:'Descartáveis', quantity:40, minQuantity:10, unit:'caixa', unitCost:44, consumptionUnit:'unidade', unitsPerStockUnit:100, ...overrides });
const appointment = id => ({ id, patientId:'test', patientName:'Teste', patientPhone:'', dentistName:'Teste', date:'2026-10-01', time:'10:00', durationMinutes:30, procedure:'Teste', status:'agendado', value:0 });
const snapshot = (items=[needle()]) => ({version:1, inventory:items, appointments:[appointment('a'),appointment('b')]});
const request = (qty=1, unit='unidade', item=needle()) => {
  const conversion = resolveStockUsage(item,qty,unit);
  assert.equal(conversion.ok, true);
  return {itemId:item.id, qty:conversion.quantity, stockUnit:item.unit, consumption:{quantity:qty,unit}};
};
const memory = () => {
  const values=new Map();
  return {values, fail:false, getItem(key) {return values.get(key) ?? null;}, setItem(key,value) {if(this.fail) throw new Error('storage-full'); values.set(key,value);}};
};
const serialLock = () => {
  let queue=Promise.resolve();
  return fn => {const next=queue.then(fn); queue=next.catch(()=>{}); return next;};
};
const setup = (defaults=snapshot(), storage=memory(), lock=serialLock()) => ({storage,lock, store:createAppointmentStockStore(storage,lock,defaults)});

test('1 agulha em caixa de 100 converte para 0.01 caixa',()=>assert.deepEqual(resolveStockUsage(needle(),1,'unidade'),{ok:true,quantity:0.01,stockUnit:'caixa'}));
test('mesma unidade continua descontando a quantidade solicitada',()=>assert.equal(resolveStockUsage(needle(),2,'caixas').quantity,2));
test('aliases conhecidos aceitam plural sem tratar par como unidade',()=>{assert.equal(normalizeStockUnit('Unidades'),'unidade'); assert.equal(normalizeStockUnit('Peças'),'peca'); assert.equal(resolveStockUsage(needle(),1,'par').ok,false);});
test('nao deduz embalagem por nome ou observacoes',()=>assert.equal(resolveStockUsage(needle({consumptionUnit:undefined,unitsPerStockUnit:undefined,notes:'Caixa com 100 unidades'}),1,'unidade').ok,false));
test('fator invalido bloqueia a conversao',()=>{for(const factor of [0,-1,NaN,Infinity,undefined]) assert.equal(resolveStockUsage(needle({unitsPerStockUnit:factor}),1,'unidade').ok,false);});
test('quantidade invalida e unidade ausente bloqueiam',()=>{for(const qty of [0,-1,NaN,Infinity]) assert.equal(resolveStockUsage(needle(),qty,'unidade').ok,false); assert.equal(resolveStockUsage(needle(),1,'').ok,false);});
test('ml e tubetes exigem fatores explicitos',()=>{assert.equal(resolveStockUsage(needle({consumptionUnit:'ml',unitsPerStockUnit:500,unit:'frasco'}),5,'ml').quantity,0.01); assert.equal(resolveStockUsage(needle({consumptionUnit:'tubete',unitsPerStockUnit:50}),1,'tubete').quantity,0.02);});
test('quantidade abaixo da precisao suportada bloqueia',()=>assert.equal(resolveStockUsage(needle({unitsPerStockUnit:1e15}),1,'unidade').ok,false));
test('baixa grava 39.99 caixas e comprovante de 1 unidade juntos',async()=>{const {store,storage}=setup();await store.deduct('a',[request()]);const saved=JSON.parse(storage.getItem(APPOINTMENT_STOCK_KEY));assert.equal(saved.inventory[0].quantity,39.99);const receipt=saved.appointments[0].stockDeduction.items[0];assert.equal(receipt.qty,0.01);assert.equal(receipt.stockUnit,'caixa');assert.equal(receipt.unitsPerStockUnit,100);assert.deepEqual(receipt.consumptions,[{quantity:1,unit:'unidade'}]);});
test('reabrir bloqueia nova baixa para o mesmo atendimento',async()=>{const {store,storage,lock}=setup();await store.deduct('a',[request()]);const reopened=createAppointmentStockStore(storage,lock,snapshot());await assert.rejects(reopened.deduct('a',[request()]),/já possui/);assert.equal(reopened.getSnapshot().inventory[0].quantity,39.99);});
test('falha de gravacao preserva saldo e comprovante',async()=>{const {store,storage}=setup();storage.fail=true;await assert.rejects(store.deduct('a',[request()]),/storage-full/);assert.equal(store.getSnapshot().inventory[0].quantity,40);assert.equal(storage.getItem(APPOINTMENT_STOCK_KEY),null);assert.equal(store.getSnapshot().appointments[0].stockDeduction,undefined);storage.fail=false;await store.deduct('a',[request()]);assert.equal(store.getSnapshot().inventory[0].quantity,39.99);});
test('duas abas com lock compartilhado registram a baixa uma vez',async()=>{const {store,storage,lock}=setup();const other=createAppointmentStockStore(storage,lock,snapshot());const results=await Promise.allSettled([store.deduct('a',[request()]),other.deduct('a',[request()])]);assert.equal(results.filter(r=>r.status==='fulfilled').length,1);assert.equal(JSON.parse(storage.getItem(APPOINTMENT_STOCK_KEY)).inventory[0].quantity,39.99);});
test('atendimentos diferentes usam saldo atual',async()=>{const {store,storage,lock}=setup();const other=createAppointmentStockStore(storage,lock,snapshot());await store.deduct('a',[request()]);await other.deduct('b',[request()]);assert.equal(other.getSnapshot().inventory[0].quantity,39.98);});
test('fator alterado depois do checklist bloqueia sem gravar',async()=>{const {store,storage}=setup();const stale=request();await store.setInventory(items=>items.map(i=>({...i,unitsPerStockUnit:50})));const before=storage.getItem(APPOINTMENT_STOCK_KEY);await assert.rejects(store.deduct('a',[stale]),/conversão foi alterada/);assert.equal(storage.getItem(APPOINTMENT_STOCK_KEY),before);});
test('unidade de estoque alterada mesmo com fator igual bloqueia',async()=>{const {store,storage}=setup();await store.setInventory(items=>items.map(i=>({...i,unit:'pacote'})));const before=storage.getItem(APPOINTMENT_STOCK_KEY);await assert.rejects(store.deduct('a',[request()]),/conversão foi alterada/);assert.equal(storage.getItem(APPOINTMENT_STOCK_KEY),before);});
test('remover configuracao depois do checklist bloqueia',async()=>{const {store}=setup();await store.setInventory(items=>items.map(i=>({...i,unitsPerStockUnit:undefined})));await assert.rejects(store.deduct('a',[request()]),/Conversão pendente/);});
test('duplicatas convertem e somam antes de validar saldo',async()=>{const {store}=setup(snapshot([needle({quantity:0.015})]));await assert.rejects(store.deduct('a',[request(),request()]),/insuficiente/);assert.equal(store.getSnapshot().inventory[0].quantity,0.015);});
test('100 linhas de 1 unidade zeram 1 caixa sem ruido decimal',async()=>{const {store}=setup(snapshot([needle({quantity:1})]));await store.deduct('a',Array.from({length:100},()=>request()));assert.equal(store.getSnapshot().inventory[0].quantity,0);assert.equal(store.getSnapshot().appointments[0].stockDeduction.items[0].qty,1);});
test('soma decimal 0.1 + 0.2 pode consumir saldo 0.3',()=>{const result=prepareAppointmentStockDeduction(appointment('a'),[needle({quantity:0.3})],[{itemId:'needle',qty:0.1},{itemId:'needle',qty:0.2}]);assert.equal(result.updatedInventory[0].quantity,0);});
test('migra saldo 37 sem repor demonstracao e nao cria chave ao ler',()=>{const storage=memory();storage.setItem('dentispro_inventory_v2',JSON.stringify([needle({quantity:37})]));const {store}=setup(snapshot(),storage);assert.equal(store.getSnapshot().inventory[0].quantity,37);assert.equal(storage.getItem(APPOINTMENT_STOCK_KEY),null);});
test('instrumental reutilizavel e material indisponivel continuam bloqueados',async()=>{for(const changes of [{itemType:'instrumental'},{testReady:false}]) {const {store}=setup(snapshot([needle(changes)]));await assert.rejects(store.deduct('a',[request()]));assert.equal(store.getSnapshot().inventory[0].quantity,40);}});
test('dados corrompidos nao carregam demonstracao',()=>{const storage=memory();storage.values.set(APPOINTMENT_STOCK_KEY,'{broken');assert.throws(()=>setup(snapshot(),storage));});
test('editar embalagem depois da baixa preserva fator no comprovante',async()=>{const {store}=setup();await store.deduct('a',[request()]);await store.setInventory(items=>items.map(i=>({...i,unitsPerStockUnit:50})));assert.equal(store.getSnapshot().appointments[0].stockDeduction.items[0].unitsPerStockUnit,100);});
test('quantidade menor que a precisao nao gera comprovante de consumo zero',()=>assert.throws(()=>prepareAppointmentStockDeduction(appointment('a'),[needle()],[{itemId:'needle',qty:1e-15}]),/inválida/));

test('material de outra clinica ou profissional bloqueia sem gravar',async()=>{
  for(const changes of [
    {ownerScope:'clinica',clinicId:'outra'},
    {ownerScope:'clinica',clinicName:'Outra clinica'},
    {ownerScope:'profissional',professionalId:'outro'},
    {ownerScope:'profissional',professionalName:'Outro profissional'}
  ]) {
    const {store,storage}=setup(snapshot([needle(changes)]));
    await assert.rejects(store.deduct('a',[request()]),/material de outr/);
    assert.equal(store.getSnapshot().inventory[0].quantity,40);
    assert.equal(storage.getItem(APPOINTMENT_STOCK_KEY),null);
  }
});
test('material da mesma clinica e profissional pode consumir',async()=>{
  for(const changes of [{ownerScope:'clinica',clinicId:'clinica-a'},{ownerScope:'profissional',professionalId:'prof-a'}]) {
    const defaults=snapshot([needle(changes)]);
    defaults.appointments[0]={...defaults.appointments[0],clinicId:'clinica-a',professionalId:'prof-a'};
    const {store}=setup(defaults);
    await store.deduct('a',[request()]);
    assert.equal(store.getSnapshot().inventory[0].quantity,39.99);
  }
});
