// Node 24. Readiness is explicitly stubbed: these tests cover the transaction,
// persistence and quantity rules, not the project's separate readiness policy.
import { registerHooks } from 'node:module';
import { test } from 'node:test';
import assert from 'node:assert/strict';
registerHooks({
  resolve(specifier, context, next) {
    if (specifier.endsWith('/inventoryReadiness')) {
      return { url: 'data:text/javascript,export function getItemReadinessInfo(item){return {isReady:item.notes!=="TEST_NOT_READY"}}', shortCircuit: true };
    }
    if (specifier.startsWith('.') && !/\.[a-z]+$/i.test(specifier)) {
      return next(specifier + '.ts', context);
    }
    return next(specifier, context);
  }
});
const { createAppointmentStockStore, APPOINTMENT_STOCK_KEY } = await import('../src/utils/appointmentStockStore.ts');
const { prepareAppointmentStockDeduction } = await import('../src/utils/appointmentStockDeduction.ts');
function fixtures() {
  const appointment = { id:'appt-test', clinicId:'clinic-test', patientId:'patient-test', dentistName:'Teste' };
  const item = { id:'needle', name:'Agulha de teste', quantity:37, itemType:'insumo', category:'Descartáveis', ownerScope:'compartilhado' };
  return { version:1, appointments:[appointment], inventory:[item] };
}
function storage() {
  const values = new Map();
  return { values, fail:false, getItem(k) { return values.get(k) ?? null; }, setItem(k,v) { if(this.fail) throw new Error('quota'); values.set(k,v); } };
}
function mutex() {
  let tail = Promise.resolve();
  return action => {
    const run = tail.then(action);
    tail = run.catch(()=>{});
    return run;
  };
}
const deduction = [{itemId:'needle',qty:1}];
test('commit writes quantity and receipt in one snapshot; reopen/reload blocks repeat', async () => {
  const disk=storage(), lock=mutex();
  const first=createAppointmentStockStore(disk,lock,fixtures());
  await first.deduct('appt-test',deduction);
  const saved=JSON.parse(disk.getItem(APPOINTMENT_STOCK_KEY));
  assert.equal(saved.inventory[0].quantity,36);
  assert.deepEqual(saved.appointments[0].stockDeduction.items,deduction);
  const reopened=createAppointmentStockStore(disk,lock,fixtures());
  await assert.rejects(reopened.deduct('appt-test',deduction),/já possui/);
  assert.equal(reopened.getSnapshot().inventory[0].quantity,36);
});
test('failed storage leaves both memory and disk unchanged; retry commits once',async()=>{
  const disk=storage(), store=createAppointmentStockStore(disk,mutex(),fixtures());
  const before=store.getSnapshot(); disk.fail=true;
  await assert.rejects(store.deduct('appt-test',deduction),/quota/);
  assert.equal(store.getSnapshot(),before);
  assert.equal(disk.getItem(APPOINTMENT_STOCK_KEY),null);
  disk.fail=false; await store.deduct('appt-test',deduction);
  assert.equal(store.getSnapshot().inventory[0].quantity,36);
});
test('two stores/tabs sharing exclusive lock cannot deduct same appointment twice',async()=>{
  const disk=storage(), lock=mutex();
  const a=createAppointmentStockStore(disk,lock,fixtures()), b=createAppointmentStockStore(disk,lock,fixtures());
  const results=await Promise.allSettled([a.deduct('appt-test',deduction),b.deduct('appt-test',deduction)]);
  assert.equal(results.filter(r=>r.status==='fulfilled').length,1);
  assert.equal(JSON.parse(disk.getItem(APPOINTMENT_STOCK_KEY)).inventory[0].quantity,36);
});
test('two different appointments consume from latest persisted inventory',async()=>{
  const disk=storage(), lock=mutex(), defaults=fixtures();
  defaults.appointments.push({...defaults.appointments[0],id:'second'});
  const a=createAppointmentStockStore(disk,lock,defaults),b=createAppointmentStockStore(disk,lock,defaults);
  await Promise.all([a.deduct('appt-test',deduction),b.deduct('second',deduction)]);
  assert.equal(JSON.parse(disk.getItem(APPOINTMENT_STOCK_KEY)).inventory[0].quantity,35);
});
test('legacy quantity 37 and empty lists are preserved; no demo replenishment',()=>{
  const disk=storage(); disk.setItem('dentispro_inventory_v2',JSON.stringify(fixtures().inventory));
  disk.setItem('dentispro_appointments_v2','[]');
  const defaults=fixtures(); defaults.inventory[0].quantity=40;
  const store=createAppointmentStockStore(disk,mutex(),defaults);
  assert.equal(store.getSnapshot().inventory[0].quantity,37);
  assert.deepEqual(store.getSnapshot().appointments,[]);
});
test('corrupt saved snapshot fails closed instead of loading demo defaults',()=>{
  const disk=storage(); disk.setItem(APPOINTMENT_STOCK_KEY,'{');
  assert.throws(()=>createAppointmentStockStore(disk,mutex(),fixtures()));
});
test('duplicate item rows aggregate before insufficient-stock validation',()=>{
  const f=fixtures(); f.inventory[0].quantity=1;
  assert.throws(()=>prepareAppointmentStockDeduction(f.appointments[0],f.inventory,[...deduction,...deduction]),/insuficiente/);
  assert.equal(f.inventory[0].quantity,1);
});
test('valid duplicate rows produce one receipt item with total quantity',()=>{
  const f=fixtures(); const next=prepareAppointmentStockDeduction(f.appointments[0],f.inventory,[...deduction,...deduction]);
  assert.equal(next.updatedInventory[0].quantity,35);
  assert.deepEqual(next.updatedAppointment.stockDeduction.items,[{itemId:'needle',qty:2}]);
  assert.equal(f.inventory[0].quantity,37);
});
test('available reusable instruments and equipment cannot be consumed',()=>{
  for(const itemType of ['instrumental','equipamento']) {
    const f=fixtures(); f.inventory[0].itemType=itemType;
    assert.throws(()=>prepareAppointmentStockDeduction(f.appointments[0],f.inventory,deduction),/reutilizável/);
  }
});
test('invalid quantities, missing items, empty request and unavailable items reject',()=>{
  const f=fixtures();
  for(const qty of [0,-1,NaN,Infinity,38]) assert.throws(()=>prepareAppointmentStockDeduction(f.appointments[0],f.inventory,[{itemId:'needle',qty}]));
  assert.throws(()=>prepareAppointmentStockDeduction(f.appointments[0],f.inventory,[]));
  assert.throws(()=>prepareAppointmentStockDeduction(f.appointments[0],f.inventory,[{itemId:'missing',qty:1}]));
  f.inventory[0].notes='TEST_NOT_READY';
  assert.throws(()=>prepareAppointmentStockDeduction(f.appointments[0],f.inventory,deduction),/indisponível/);
});
test('ordinary stock edits preserve receipt; imported pair is written together',async()=>{
  const disk=storage(), store=createAppointmentStockStore(disk,mutex(),fixtures());
  await store.deduct('appt-test',deduction);
  await store.setInventory(items=>items.map(i=>({...i,quantity:35})));
  await store.setAppointments(items=>items.map(i=>({...i,status:'concluido'})));
  assert.ok(store.getSnapshot().appointments[0].stockDeduction);
  const backup=JSON.parse(disk.getItem(APPOINTMENT_STOCK_KEY));
  await store.replaceData({appointments:[],inventory:[]});
  await store.replaceData(backup);
  await assert.rejects(store.deduct('appt-test',deduction),/já possui/);
});
