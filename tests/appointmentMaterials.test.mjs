import { registerHooks } from 'node:module';
import { test } from 'node:test';
import assert from 'node:assert/strict';
registerHooks({ resolve(specifier, context, next) {
  return next(specifier.startsWith('.') && !/\.[a-z]+$/i.test(specifier) ? specifier + '.ts' : specifier, context);
}});
const { createAppointmentStockStore, APPOINTMENT_STOCK_KEY } = await import('../src/utils/appointmentStockStore.ts');
const { materialTemplateKey, findMaterialProcedure, isMaterialInScope, materialCandidates } = await import('../src/utils/appointmentMaterials.ts');
const appointment = { id:'a', clinicId:'c', professionalId:'p', dentistName:'Profissional', procedure:'Restauração', tussCode:'123' };
const needle = { id:'n', name:'Agulha teste', category:'Descartáveis', itemType:'insumo', quantity:2, unit:'caixa', unitsPerStockUnit:100, consumptionUnit:'unidade', ownerScope:'compartilhado' };
const requirements = [{ id:'r', inventoryItemId:'n', materialName:'Agulha', quantityNeeded:1, unit:'unidade' }];
function fixture() {
  const values = new Map();
  const disk = { fail:false, getItem:k=>values.get(k)??null, setItem(k,v){if(this.fail) throw Error('quota');values.set(k,v);} };
  let tail = Promise.resolve();
  const lock = action => { const run=tail.then(action);tail=run.catch(()=>{});return run; };
  const defaults = {version:1, appointments:[appointment,{...appointment,id:'b'}], inventory:[needle]};
  return { disk, lock, defaults, store:createAppointmentStockStore(disk,lock,defaults) };
}
const initialRevision = JSON.stringify([undefined,undefined]);
function revision(store) { const s=store.getSnapshot();return JSON.stringify([s.appointments[0].customRequiredMaterials,s.materialTemplates?.[materialTemplateKey(appointment)]]); }
test('save only appointment persists after reopen without modifying inventory or other appointments', async()=>{
  const {disk,lock,defaults,store}=fixture();
  await store.saveMaterials('a', requirements,'appointment',initialRevision);
  const reopened=createAppointmentStockStore(disk,lock,defaults).getSnapshot();
  assert.deepEqual(reopened.appointments[0].customRequiredMaterials,requirements);
  assert.equal(reopened.appointments[1].customRequiredMaterials,undefined);
  assert.equal(reopened.materialTemplates,undefined);
  assert.deepEqual(reopened.inventory,[needle]);
});
test('permanent list and appointment save together and template survives deduction',async()=>{
  const {disk,lock,defaults,store}=fixture();
  await store.saveMaterials('a',requirements,'procedure',initialRevision);
  await store.deduct('a',[{itemId:'n',qty:0.01,stockUnit:'caixa',consumption:{quantity:1,unit:'unidade'}}]);
  const saved=createAppointmentStockStore(disk,lock,defaults).getSnapshot();
  assert.deepEqual(saved.materialTemplates[materialTemplateKey(appointment)],requirements);
  assert.equal(saved.inventory[0].quantity,1.99);
  assert.equal(saved.appointments[0].stockDeduction.items[0].consumptions[0].quantity,1);
  await assert.rejects(store.saveMaterials('a',[],'appointment',revision(store)),/já possui/);
});
test('failed save changes neither list nor template nor inventory and can be retried',async()=>{
  const {disk,store}=fixture();const before=store.getSnapshot();disk.fail=true;
  await assert.rejects(store.saveMaterials('a',requirements,'procedure',initialRevision),/quota/);
  assert.equal(store.getSnapshot(),before);assert.equal(disk.getItem(APPOINTMENT_STOCK_KEY),null);
  disk.fail=false;await store.saveMaterials('a',requirements,'procedure',initialRevision);
  assert.deepEqual(store.getSnapshot().appointments[0].customRequiredMaterials,requirements);
});
test('concurrent saves reject stale lists without overwriting the first writer',async()=>{
  const {disk,lock,defaults,store}=fixture();const other=createAppointmentStockStore(disk,lock,defaults);
  const results=await Promise.allSettled([store.saveMaterials('a',requirements,'procedure',initialRevision),other.saveMaterials('a',[],'procedure',initialRevision)]);
  assert.equal(results.filter(r=>r.status==='fulfilled').length,1);
  assert.match(results.find(r=>r.status==='rejected').reason.message,/outra janela/);
});
test('empty list is intentional and is preserved as a permanent override',async()=>{
  const {store}=fixture();await store.saveMaterials('a',[],'procedure',initialRevision);
  assert.deepEqual(store.getSnapshot().materialTemplates[materialTemplateKey(appointment)],[]);
});
test('templates are isolated by clinic, professional and exact procedure',()=>{
  for(const update of [{clinicId:'other'},{professionalId:'other'},{tussCode:'456'}]) assert.notEqual(materialTemplateKey(appointment),materialTemplateKey({...appointment,...update}));
  const procedures=[{code:'other',description:'Restauração em resina'},{code:'123',description:'Restauração'}];
  assert.equal(findMaterialProcedure(appointment,procedures).code,'123');
  assert.equal(findMaterialProcedure({...appointment,tussCode:undefined,procedure:'Restauração em'},procedures),undefined);
});
test('scope validation rejects another clinic/professional and ambiguous ownership',async()=>{
  for(const ownership of [{ownerScope:'clinica',clinicId:'other'},{ownerScope:'profissional',professionalId:'other'},{ownerScope:'clinica'}]) {
    const {store}=fixture();await store.setInventory([{...needle,...ownership}]);
    await assert.rejects(store.saveMaterials('a',requirements,'appointment',initialRevision),/não encontrado/);
    assert.equal(isMaterialInScope({...needle,...ownership},appointment),false);
  }
});
test('invalid quantities, duplicate row IDs and removed products are rejected without writing',async()=>{
  for(const list of [[{...requirements[0],quantityNeeded:0}],[{...requirements[0],quantityNeeded:NaN}],[{...requirements[0],unit:''}],[requirements[0],requirements[0]],[{...requirements[0],inventoryItemId:'removed'}]]) {
    const {disk,store}=fixture();await assert.rejects(store.saveMaterials('a',list,'appointment',initialRevision));assert.equal(disk.getItem(APPOINTMENT_STOCK_KEY),null);
  }
});
test('suggestions retain all choices without selecting or mutating requirements',()=>{
  const products=[{...needle,id:'other',name:'Luva teste'},needle];
  assert.deepEqual(materialCandidates(requirements[0],products).map(p=>p.id),['n','other']);
  assert.equal(products[0].id,'other');
});
test('saving a list merges with the latest inventory instead of restoring stale balances',async()=>{
  const {disk,lock,defaults,store}=fixture();const other=createAppointmentStockStore(disk,lock,defaults);
  await other.deduct('b',[{itemId:'n',qty:1}]);
  await store.saveMaterials('a',requirements,'appointment',initialRevision);
  assert.equal(store.getSnapshot().inventory[0].quantity,1);
  assert.ok(store.getSnapshot().appointments[1].stockDeduction);
});
test('deduction rejects a list changed in another window before consuming stock',async()=>{
  const {store}=fixture();await store.saveMaterials('a',requirements,'appointment',initialRevision);
  await assert.rejects(store.deduct('a',[{itemId:'n',qty:1}],initialRevision),/outra janela/);
  assert.equal(store.getSnapshot().inventory[0].quantity,2);
  assert.equal(store.getSnapshot().appointments[0].stockDeduction,undefined);
});
test('deduction freezes a procedure template on the attended appointment',async()=>{
  const {store}=fixture();await store.saveMaterials('a',requirements,'procedure',initialRevision);
  const templateRevision=JSON.stringify([undefined,requirements]);
  await store.deduct('b',[{itemId:'n',qty:1}],templateRevision);
  await store.saveMaterials('a',[],'procedure',revision(store));
  assert.deepEqual(store.getSnapshot().appointments[1].customRequiredMaterials,requirements);
});
