import React, {useState, useEffect} from 'react';
import {useApp} from '../../context/AppContext';
import {applyConsentContent, consentContent, proceduresForConsent, type TcleProcedure} from '../../utils/tclePlan';

export function TclePlanEditor({patientId, onChange}: {patientId:string; onChange:(planId:string, procedures:TcleProcedure[])=>void}) {
  const {treatmentPlans, tussProcedures, updateTreatmentPlan, updateTussProcedure} = useApp();
  useEffect(() => { onChange('', []); }, []);
  const [planId,setPlanId] = useState('');
  const [rows,setRows] = useState<TcleProcedure[]>([]);
  const [included,setIncluded] = useState<string[]>([]);
  const [reuse,setReuse] = useState(false);
  const [message,setMessage] = useState('');
  const plans = treatmentPlans.filter(p=>p.patientId===patientId && p.status!=='cancelado' && p.status!=='concluido');
  const inputClass = 'w-full border border-[#e5e5d1] rounded-xl p-3 text-sm bg-white';
  const publish = (next:TcleProcedure[], ids:string[]) => onChange(planId, next.filter(p=>ids.includes(p.itemId)));
  const edit = (id:string,key:keyof TcleProcedure,value:string) => {
    const next=rows.map(p=>p.itemId===id?{...p,[key]:value}:p);
    setRows(next);setMessage('');publish(next,included);
  };
  const save = () => {
    const plan=plans.find(p=>p.id===planId);
    if(!plan)return;
    if(reuse) {
      const seen=new Map<string,string>();
      for(const row of rows) {
        if(!row.code || !tussProcedures.some(p=>p.code===row.code)) continue;
        const content=JSON.stringify({...consentContent(row),fullDescription:row.technicalDescription});
        if(seen.has(row.code)&&seen.get(row.code)!==content){setMessage('Há textos diferentes para o mesmo código. Desmarque o reaproveitamento para salvar apenas neste plano.');return;}
        seen.set(row.code,content);
      }
    }
    updateTreatmentPlan(plan.id,{items:plan.items.map(item=>{
      const row=rows.find(p=>p.itemId===item.id);return row?applyConsentContent(item,row):item;
    })});
    if(reuse) for(const row of rows) {
      if(row.code && tussProcedures.some(p=>p.code===row.code)) updateTussProcedure(row.code,{...consentContent(row),fullDescription:row.technicalDescription});
    }
    setMessage(reuse?'Textos salvos no plano e nos procedimentos cadastrados com esses códigos.':'Textos salvos neste plano de tratamento.');
  };
  return <div className="space-y-3">
    <label className="block text-xs font-bold text-[#5a5a40]">Plano de tratamento do paciente</label>
    <select className={inputClass} value={planId} onChange={e=>{
      const id=e.target.value;const plan=plans.find(p=>p.id===id);
      const next=plan?proceduresForConsent(plan,tussProcedures):[];
      setPlanId(id);setRows(next);setIncluded(next.map(p=>p.itemId));setMessage('');setReuse(false);onChange(id,next);
    }}><option value="">Selecione o plano</option>{plans.map(p=><option key={p.id} value={p.id}>{p.title} — {p.date}</option>)}</select>
    {!plans.length && <p className="text-sm">Cadastre um plano de tratamento para este paciente.</p>}
    {planId && !rows.length && <p className="text-sm">Este plano não possui procedimentos pendentes selecionados.</p>}
    {rows.map(row=><div key={row.itemId} className="border border-[#e5e5d1] rounded-xl p-3 space-y-2">
      <label className="flex gap-2 text-sm font-bold"><input type="checkbox" checked={included.includes(row.itemId)} onChange={e=>{
        const ids=e.target.checked?[...included,row.itemId]:included.filter(id=>id!==row.itemId);setIncluded(ids);publish(rows,ids);
      }}/>{row.name}</label>
      <p className="text-xs">Código: {row.code || 'Não informado'} · {row.region || 'Dente/região não informado'} · {row.value.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}</p>
      {([['technicalDescription','Descrição técnica'],['professionalDescription','Descrição ao profissional'],['patientDescription','Descrição ao paciente'],['risks','Riscos'],['benefits','Benefícios']] as const).map(([key,label])=><label key={key} className="block text-xs font-semibold">{label}<textarea rows={3} className={inputClass} value={row[key] || ''} onChange={e=>edit(row.itemId,key,e.target.value)} /></label>)}
    </div>)}
    {rows.length>0 && <>
      <p className="text-xs">Nome, código, dente/região e valor são trazidos do plano e podem ser alterados no Planejamento de Tratamento. A descrição ao profissional fica no cadastro; o TCLE apresenta a descrição ao paciente.</p>
      <label className="flex gap-2 text-xs"><input type="checkbox" checked={reuse} onChange={e=>setReuse(e.target.checked)}/>Usar também estas descrições, riscos e benefícios como padrão dos procedimentos cadastrados para novos planos.</label>
      <button type="button" onClick={save} className="px-4 py-2 bg-[#5a5a40] text-white rounded-xl text-sm font-semibold">Salvar textos dos procedimentos</button>
    </>}
    {message && <p role="status" className="text-sm">{message}</p>}
  </div>;
}
