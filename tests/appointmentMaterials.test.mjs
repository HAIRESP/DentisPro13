import { test } from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
registerHooks({ resolve(specifier, context, next) {
  if (specifier.endsWith('/inventoryReadiness')) return {url:'data:text/javascript,export function getItemReadinessInfo(){return {isReady:true}}',shortCircuit:true};
  if (specifier.startsWith('.') && !/\.[a-z]+$/i.test(specifier)) return next(specifier+'.ts',context);
  return next(specifier,context);
}});
const { createAppointmentStockStore } = await import('../src/utils/appointmentStockStore.ts');
const { materialTemplateKey, selectConsumptionRows } = await import('../src/utils/appointmentMaterials.ts');
const apt = {id:'a',tussCode:'123',clinicId:'clinic',professionalId:'dentist',dentistName:'Dentista'};
const material = {id:'r',inventoryItemId:'needle',materialName:'Agulha',quantityNeeded:1,unit:'unidade'};
const defaults = () => ({version:1,appointments:[{...apt},{...apt,id:'b'}],inventory:[{id:'needle',name:'Agulha',unit:'unidade',quantity:40,itemType:'insumo',category:'Descartáveis',ownerScope:'compartilhado'}]});
const options = (extra={}) => ({permanent:false,expectedMaterials:undefined,expectedTemplate:undefined,...extra});
function setup() {
 const values=new Map(); const storage={fail:false,getItem:k=>values.get(k)??null,setItem(k,v){if(this.fail)throw Error('quota');values.set(k,v)}};
 let queue=Promise.resolve();const lock=fn=>{const next=queue.then(fn);queue=next.catch(()=>{});return next};
 return {storage,lock,store:createAppointmentStockStore(storage,lock,defaults())};
}
test('only checked consumables are selected; instruments never consume',()=>{
 const rows=[{requirement:material,isReusable:false},{requirement:{...material,id:'other'},isReusable:false},{requirement:{...material,id:'kit'},isReusable:true}];
 assert.deepEqual(selectConsumptionRows(rows,{r:true,kit:true}),[rows[0]]);
 assert.deepEqual(selectConsumptionRows(rows,{}),[]);
});
test('save appointment list and reopen without reducing stock or changing another appointment',async()=>{
 const {store,storage,lock}=setup();await store.saveMaterials('a',[material],options());
 const saved=createAppointmentStockStore(storage,lock,defaults()).getSnapshot();
 assert.deepEqual(saved.appointments[0].customRequiredMaterials,[material]);assert.equal(saved.inventory[0].quantity,40);assert.equal(saved.appointments[1].customRequiredMaterials,undefined);assert.equal(saved.materialTemplates,undefined);
});
test('permanent template and appointment save atomically and survive consumption',async()=>{
 const {store}=setup();await store.saveMaterials('a',[material],options({permanent:true}));
 await store.deduct('a',[{itemId:'needle',qty:1}],[material]);
 assert.deepEqual(store.getSnapshot().materialTemplates[materialTemplateKey(apt)],[material]);assert.equal(store.getSnapshot().inventory[0].quantity,39);
});
test('failed permanent save does not change either template, list or stock',async()=>{
 const {store,storage}=setup();const before=store.getSnapshot();storage.fail=true;
 await assert.rejects(store.saveMaterials('a',[material],options({permanent:true})),/quota/);assert.equal(store.getSnapshot(),before);
});
test('concurrent edits cannot silently overwrite the first saved list',async()=>{
 const {store,storage,lock}=setup();const other=createAppointmentStockStore(storage,lock,defaults());
 const results=await Promise.allSettled([store.saveMaterials('a',[material],options()),other.saveMaterials('a',[{...material,quantityNeeded:2}],options())]);
 assert.equal(results.filter(r=>r.status==='fulfilled').length,1);
});
test('concurrent template changes from different appointments are rejected',async()=>{
 const {store}=setup();await store.saveMaterials('a',[material],options({permanent:true}));
 await assert.rejects(store.saveMaterials('b',[material],options({permanent:true})),/padrão foi alterado/);
 assert.equal(store.getSnapshot().appointments[1].customRequiredMaterials,undefined);
});
test('consumption rejects a changed list before deducting stock',async()=>{
 const {store}=setup();await store.saveMaterials('a',[material],options());
 await assert.rejects(store.deduct('a',[{itemId:'needle',qty:1}],[{...material,quantityNeeded:2}]),/lista mudou/);
 assert.equal(store.getSnapshot().inventory[0].quantity,40);
});
test('a list with completed consumption cannot be edited',async()=>{
 const {store}=setup();await store.deduct('a',[{itemId:'needle',qty:1}]);
 await assert.rejects(store.saveMaterials('a',[material],options()),/já foi registrada/);
});
test('invalid quantities and missing associations are rejected without writes',async()=>{
 for(const patch of [{quantityNeeded:0},{quantityNeeded:NaN},{unit:''},{inventoryItemId:'removed'}]) {
 const {store}=setup();const before=store.getSnapshot();await assert.rejects(store.saveMaterials('a',[{...material,...patch}],options()));assert.equal(store.getSnapshot(),before);
 }
});
test('materials belonging to another professional cannot be associated',async()=>{
 const {store}=setup();await store.setInventory(items=>items.map(i=>({...i,ownerScope:'profissional',professionalId:'other'})));
 await assert.rejects(store.saveMaterials('a',[material],options()),/outra clínica/);
});
test('template scope isolates professionals and clinics, and requires exact procedure code',()=>{
 assert.notEqual(materialTemplateKey(apt),materialTemplateKey({...apt,professionalId:'other'}));
 assert.notEqual(materialTemplateKey(apt),materialTemplateKey({...apt,clinicId:'other'}));
 assert.throws(()=>materialTemplateKey({...apt,tussCode:undefined}));
});
test('empty list is saved explicitly; no automatic materials reappear',async()=>{
 const {store}=setup();await store.saveMaterials('a',[],options({permanent:true}));assert.deepEqual(store.getSnapshot().appointments[0].customRequiredMaterials,[]);assert.deepEqual(store.getSnapshot().materialTemplates[materialTemplateKey(apt)],[]);
});
test('stock backup replacement carries material templates together with appointments',async()=>{
 const {store}=setup();const templates={[materialTemplateKey(apt)]:[material]};
 await store.replaceData({appointments:[{...apt,customRequiredMaterials:[material]}],materialTemplates:templates});
 assert.deepEqual(store.getSnapshot().materialTemplates,templates);
});

test('the same inventory product cannot be saved twice even with different row names and IDs',async()=>{
 const {store}=setup();const before=store.getSnapshot();
 await assert.rejects(store.saveMaterials('a',[material,{...material,id:'second',materialName:'Outra descrição'}],options({permanent:true})),/já está incluído/);
 assert.equal(store.getSnapshot(),before);
});
