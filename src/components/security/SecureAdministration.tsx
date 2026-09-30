import { useAuditedSharing } from './useAuditedSharing';
import { setWorkspaceActionContext, authorizeWorkspaceAction } from '../../utils/workspaceActions';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {AppProvider} from '../../context/AppContext';
import {DomainProviders} from '../../context/DomainContexts';
import {SettingsView} from '../settings/SettingsView';
import {InventoryManager} from '../inventory/InventoryManager';
import {secureApi} from '../../utils/secureApi';
const button = 'px-4 py-2 rounded bg-stone-700 text-white disabled:opacity-50';
export function SecureAdministration({onClose}: {onClose: () => void}) {
  const [bundle, setBundle] = useState<any>(null), [tab,setTab] = useState('settings'), [error,setError] = useState(''), [busy,setBusy] = useState(false), [dirty,setDirty] = useState(false);
  const baseline = useRef(''), workspace = useRef<Record<string,any>>({}), lock = useRef(false);
  useAuditedSharing(Boolean(bundle), setError);
  const changed = useCallback((value: Record<string,any>) => {workspace.current = value; const serialized = JSON.stringify(value); if (!baseline.current) baseline.current = serialized; setDirty(serialized !== baseline.current);},[]);
  useEffect(() => {let active=true; secureApi('clinic.read').then(value => {if(active) setBundle(value);}).catch(e=>{if(active) setError(e.message);}); return()=>{active=false;};},[]);
  useEffect(() => {
    setWorkspaceActionContext({mode:'clinic'});
    let permitted: HTMLAnchorElement | null = null;
    const download = (e: MouseEvent) => {
      const link=(e.target as Element)?.closest?.('a[download]') as HTMLAnchorElement|null;
      if(!link || link===permitted) return;
      e.preventDefault(); e.stopImmediatePropagation();
      const content = link.href.startsWith('blob:') ? fetch(link.href).then(r=>r.blob()) : null;
      void authorizeWorkspaceAction('export').then(async()=>{const url=content?URL.createObjectURL(await content):null;if(url)link.href=url;permitted=link;link.click();permitted=null;if(url)setTimeout(()=>URL.revokeObjectURL(url),60000);}).catch(e=>setError(e.message));
    };
    document.addEventListener('click',download,true);
    return()=>{setWorkspaceActionContext(null); document.removeEventListener('click',download,true);};
  },[]);
  useEffect(()=>{const warn=(e:BeforeUnloadEvent)=>{if(dirty){e.preventDefault();e.returnValue='';}}; window.addEventListener('beforeunload',warn);return()=>window.removeEventListener('beforeunload',warn);},[dirty]);
  return <section className="bg-white rounded p-4 space-y-3">
    <div className="flex gap-2 print:hidden"><button className={button} disabled={busy} onClick={()=>{if(!dirty||confirm('Descartar alterações administrativas não salvas?'))onClose();}}>Voltar aos pacientes</button><button className={button} onClick={()=>setTab('settings')}>Configurações e documentos</button><button className={button} onClick={()=>setTab('inventory')}>Estoque e esterilização</button></div>
    {error&&<p role="alert" className="text-red-700">{error}</p>}
    {bundle&&<><form className="sticky top-0 z-40 bg-amber-50 p-3 flex flex-wrap gap-2 print:hidden" onSubmit={async e=>{e.preventDefault();if(lock.current)return;lock.current=true;setBusy(true);setError('');const f=e.currentTarget;try{const result=await secureApi('clinic.save',undefined,{workspace:workspace.current,revision:bundle.revision,reason:new FormData(f).get('reason')});baseline.current='';setBundle(result);setDirty(false);f.reset();}catch(e:any){setError(e.message);}finally{lock.current=false;setBusy(false);}}}>
      <strong>{dirty?'Alterações pendentes':'Configuração carregada do servidor'}</strong><input name="reason" minLength={5} required className="border rounded p-2 grow" placeholder="Motivo da alteração"/><button className={button} disabled={!dirty||busy}>Salvar versão no servidor</button>
    </form><fieldset disabled={busy}><AppProvider key={bundle.revision} secure={{mode:'administration',patientId:'administration',initialStorage:bundle.workspace,onChange:changed}}><DomainProviders>{tab==='settings'?<SettingsView/>:<InventoryManager/>}</DomainProviders></AppProvider></fieldset></>}
  </section>;
}
