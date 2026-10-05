import assert from 'node:assert/strict';
import {test} from 'node:test';
import {registerHooks} from 'node:module';

// Apenas o formato do comprovante e a persistencia sao testados aqui.
registerHooks({resolve(specifier,context,nextResolve){
  if(specifier.endsWith('/inventoryReadiness')) return {url:'data:text/javascript,export function getItemReadinessInfo(){return {isReady:true}}',shortCircuit:true};
  if(specifier.startsWith('.')&&context.parentURL?.endsWith('.ts')&&!/\.[a-z]+$/i.test(specifier)) return nextResolve(specifier+'.ts',context);
  return nextResolve(specifier,context);
}});
const {createAppointmentStockStore,APPOINTMENT_STOCK_KEY}=await import('../src/utils/appointmentStockStore.ts');
function setup(extra={}) {
  const values=new Map();
  const storage={getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value)};
  const defaults={version:1,appointments:[{id:'a'}],inventory:[{id:'needle',name:'Agulha',itemType:'insumo',quantity:40,...extra}]};
  const lock=async action=>{action();};
  return {storage,defaults,lock,store:createAppointmentStockStore(storage,lock,defaults)};
}
test('pedido antigo conserva comprovante sem lista vazia; reabrir bloqueia repeticao',async()=>{
  const {store,storage,defaults,lock}=setup();
  await store.deduct('a',[{itemId:'needle',qty:1}]);
  const saved=JSON.parse(storage.getItem(APPOINTMENT_STOCK_KEY));
  assert.deepEqual(saved.appointments[0].stockDeduction.items,[{itemId:'needle',qty:1}]);
  assert.equal(saved.inventory[0].quantity,39);
  assert.equal(Object.hasOwn(store.getSnapshot().appointments[0].stockDeduction.items[0],'consumptions'),false);
  const reopened=createAppointmentStockStore(storage,lock,defaults);
  await assert.rejects(reopened.deduct('a',[{itemId:'needle',qty:1}]),/baixa registrada/);
  assert.equal(reopened.getSnapshot().inventory[0].quantity,39);
});
test('pedido convertido conserva quantidade consumida, unidade e fator',async()=>{
  const {store,storage}=setup({unit:'caixa',consumptionUnit:'unidade',unitsPerStockUnit:100});
  await store.deduct('a',[{itemId:'needle',qty:0.01,stockUnit:'caixa',consumption:{quantity:1,unit:'unidade'}}]);
  const saved=JSON.parse(storage.getItem(APPOINTMENT_STOCK_KEY));
  assert.equal(saved.inventory[0].quantity,39.99);
  assert.deepEqual(saved.appointments[0].stockDeduction.items,[{itemId:'needle',qty:0.01,stockUnit:'caixa',consumptionUnit:'unidade',unitsPerStockUnit:100,consumptions:[{quantity:1,unit:'unidade'}]}]);
});
