import React, {useEffect,useRef,useState} from 'react';
import {useApp} from '../../context/AppContext';
import type {ClinicalExam,Patient,ToothCondition} from '../../types';
import {getSessionToken} from '../../utils/authenticatedFetch';
import {buildClinicalPanelPdf} from '../../utils/clinicalPanelPdf';
import {clinicalPanelRows} from '../../utils/clinicalPanelRecord';
import {loadServerOdontogram,odontogramRequest,odontogramPatientPath,saveServerOdontogram,OdontogramRequestError} from '../../utils/odontogramServerClient';
import {OdontogramCanvas,type OdontogramProps} from './Odontogram';

export function OdontogramStorageBoundary(props: OdontogramProps) {
  const [mode,setMode]=useState<any>(null);
  const [error,setError]=useState('');
  useEffect(()=>{
    let alive=true;
    odontogramRequest('/api/odontogram-mode').then(value=>{
      if(typeof value.enabled!=='boolean')throw Error('Modo de armazenamento não confirmado.');
      if(alive)setMode(value);
    }).catch(e=>{if(alive)setError(e.message);});
    const expired=()=>{setMode(null);setError('Sessão encerrada. Entre novamente.');};
    window.addEventListener('dentispro-session-expired',expired);
    return()=>{alive=false;window.removeEventListener('dentispro-session-expired',expired);};
  },[]);
  if(error)return <p role="alert" className="p-4 text-red-700">{error}</p>;
  if(!mode)return <p className="p-4">Conferindo armazenamento do odontograma…</p>;
  return mode.enabled ? <SqliteWorkspace key={props.patientId} {...props} actor={mode.actor} source={mode.source || 'review'} /> : <OdontogramCanvas {...props} />;
}

function SqliteWorkspace({patientId,readOnly=false,actor,source}:OdontogramProps & {actor:{uid:string;professionalId:string;name:string;cro?:string};source:'clinic'|'review'}) {
  const app=useApp();
  const localPatient=app.patients.find(p=>p.id===patientId);
  const [needsLink,setNeedsLink]=useState(false);
  const [record,setRecord]=useState<any>(null);
  const [conditions,setConditions]=useState<ToothCondition[]>([]);
  const [ready,setReady]=useState(false);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const [blocked,setBlocked]=useState(false);
  const [message,setMessage]=useState('');
  const [revision,setRevision]=useState(0);
  const [evolution,setEvolution]=useState('');
  const saving=useRef(false);
  const alive=useRef(true);
  const pending=useRef<{fingerprint:string;payload:any}|null>(null);
  const lastSaved=useRef('');
  const session=useRef(getSessionToken());
  const valid=()=>alive.current && getSessionToken()===session.current;
  const fail=(e:any)=>{
    if(!alive.current)return;
    if(e instanceof OdontogramRequestError && [401,403].includes(e.status)){setBlocked(true);setRecord(null);setEvolution('');}
    setError(e.message || 'Falha ao acessar o servidor.');
  };
  useEffect(()=>{
    alive.current=true;
    loadServerOdontogram(patientId,source).then(value=>{
      if(!valid())return;
      if(source==='clinic' && localPatient && (value.patient.name!==localPatient.name.trim() || (value.patient.birthDate || '')!==(localPatient.birthDate || '')))throw Error('O cadastro do navegador diverge do SQLite. Confira nome e nascimento antes de editar.');
      setRecord(value);setConditions(value.current.conditions);setReady(value.current.version>0);
      if(value.current.version>0 && value.current.date && value.current.title){
        lastSaved.current=JSON.stringify({date:value.current.date,title:value.current.title,conditions:value.current.conditions,
          notes:value.current.details?.notes || '',vitalSigns:value.current.details?.vitalSigns || {}});
      }
    }).catch(e=>{if(valid() && source==='clinic' && e instanceof OdontogramRequestError && e.status===404)setNeedsLink(true);else fail(e);});
    return()=>{alive.current=false;};
  },[patientId]);
  useEffect(()=>{
    if(!ready)return;
    const warn=(e:BeforeUnloadEvent)=>{
      if(pending.current || saving.current || JSON.stringify(conditions)!==JSON.stringify(record?.current.conditions)){
        e.preventDefault();e.returnValue='';
      }
    };
    window.addEventListener('beforeunload',warn);return()=>window.removeEventListener('beforeunload',warn);
  },[ready,conditions,record]);

  const save:ReturnType<typeof useApp>['saveOdontogramSnapshot']=async(id,data)=>{
    if(id!==patientId || !valid() || blocked || readOnly)throw Error('Reabra o paciente e confira sua autorização.');
    if(saving.current)throw Error('Aguarde o salvamento em andamento.');
    const fingerprint=JSON.stringify(data);
    if(fingerprint===lastSaved.current){setMessage('Esta avaliação já está salva no servidor.');return;}
    if(pending.current && pending.current.fingerprint!==fingerprint)throw Error('Há uma solicitação sem confirmação. Use “Repetir confirmação” antes de alterar o exame.');
    saving.current=true;setBusy(true);setError('');setMessage('');
    try {
      if(!pending.current){
        const linked=app.professionals.find(p=>p.id===actor.professionalId);
        const professional={...linked,id:actor.professionalId,name:actor.name,cro:actor.cro || linked?.cro || '',specialty:linked?.specialty || '',clinicIds:linked?.clinicIds || []};
        const {pdf,filename}=await buildClinicalPanelPdf({patient:record.patient as Patient,panel:'odontogram',date:data.date,data,clinic:app.clinicInfo,professional});
        if(!valid())throw Error('A sessão mudou durante a geração do PDF.');
        pending.current={fingerprint,payload:{requestId:crypto.randomUUID(),expectedVersion:record.current.version,
          conditions:data.conditions,date:data.date,title:data.title,
          description:clinicalPanelRows('odontogram',data).map(r=>`${r.section} — ${r.label}: ${r.answer}`).join('\n'),
          pdfBase64:pdf.output('datauristring').split(',')[1],filename,
          details:{notes:data.notes || '',vitalSigns:data.vitalSigns || {}}}};
      }
      await confirmPending();
    } catch(e) {fail(e);throw e;}
    finally{saving.current=false;if(alive.current)setBusy(false);}
  };
  async function confirmPending(){
    const request=pending.current;
    if(!request || !valid())throw Error('Solicitação indisponível nesta sessão.');
    const result=await saveServerOdontogram(patientId,request.payload);
    if(!valid())throw Error('A sessão mudou após o envio. Reabra o paciente para conferir o salvamento.');
    lastSaved.current=request.fingerprint;pending.current=null;
    const p=request.payload;
    // The acknowledgement is authoritative even if the later history refresh fails.
    setRecord((old:any)=>({...old,current:{version:result.version,conditions:p.conditions,date:p.date,title:p.title,details:p.details},
      history:[{id:result.id,version:result.version,date:p.date,title:p.title,conditions:p.conditions,details:p.details,dentistName:actor.name,createdAt:Date.now()},...old.history.filter((h:any)=>h.id!==result.id)]}));
    setConditions(p.conditions);setRevision(n=>n+1);setMessage('Avaliação, PDF e evolução salvos no servidor.');setError('');
  }
  const retry=async()=>{
    if(saving.current)return;saving.current=true;setBusy(true);
    try{await confirmPending();}catch(e){fail(e);}finally{saving.current=false;if(alive.current)setBusy(false);}
  };
  const showArchive=async(archiveId:string,kind:'document'|'evolution')=>{
    setError('');
    try{
      const value=await odontogramRequest(`${odontogramPatientPath(patientId)}/evaluations/${encodeURIComponent(archiveId)}/${kind}`);
      if(!valid())return;
      if(kind==='evolution'){setEvolution(`${value.date}\n${value.description}`);return;}
      if(typeof value.pdfBase64!=='string' || !value.pdfBase64.startsWith('JVBERi0'))throw Error('PDF inválido.');
      const bytes=Uint8Array.from(atob(value.pdfBase64),c=>c.charCodeAt(0));
      const url=URL.createObjectURL(new Blob([bytes],{type:'application/pdf'}));
      const link=document.createElement('a');link.href=url;link.download=value.filename;link.click();
      setTimeout(()=>URL.revokeObjectURL(url),30000);
    }catch(e){fail(e);}
  };
  if(blocked)return <p role="alert" className="p-4 text-red-700">{error}</p>;
  if(needsLink && localPatient)return <section className="p-4 border rounded-xl space-y-3"><p>Vincular <strong>{localPatient.name}</strong> ao odontograma SQLite?</p><p>O nome, nascimento e identificador serão registrados. Os odontogramas anteriores do navegador serão preservados.</p>{error && <p role="alert">{error}</p>}<button disabled={busy || readOnly} className="border rounded-lg p-2" onClick={async()=>{setBusy(true);setError('');try{await odontogramRequest(`${odontogramPatientPath(patientId)}/record`,{id:patientId,name:localPatient.name,birthDate:localPatient.birthDate || ''});const value=await loadServerOdontogram(patientId,source);if(!valid())return;setRecord(value);setConditions(value.current.conditions);setReady(value.current.version>0);setNeedsLink(false);}catch(e){fail(e);}finally{if(alive.current)setBusy(false);}}}>Confirmar vínculo e abrir odontograma</button></section>;
  if(!record)return <p role={error?'alert':undefined} className="p-4">{error || 'Carregando odontograma autorizado…'}</p>;
  const localConditions=app.odontograms[patientId] || [];
  if(!ready)return <div className="p-4 space-y-3 border rounded-xl">
    <p><strong>{record.patient.name}</strong>: ainda não há odontograma salvo neste repositório SQLite.</p>
    <p>Os registros anteriores continuam preservados no navegador. O histórico antigo não é transferido nesta operação.</p>
    {localConditions.length>0 && <button className="border rounded-lg p-2" onClick={()=>{setConditions(structuredClone(localConditions));setReady(true);}}>Preparar cópia dos {localConditions.length} dentes deste navegador</button>}
    <button className="border rounded-lg p-2 ml-2" onClick={()=>{setConditions([]);setReady(true);}}>Abrir avaliação vazia</button>
    <p>A cópia só será gravada no servidor quando você salvar a avaliação.</p>
  </div>;
  const snapshots=record.history.map((h:any)=>({id:h.id,patientId,date:h.date,title:h.title,conditions:h.conditions,notes:h.details?.notes,createdAt:new Date(h.createdAt).toISOString()}));
  const exam={patientId,updatedAt:'',extraoral:{},intraoral:{},odontogramExamDate:record.current.date,odontogramVitalSigns:record.current.details?.vitalSigns || {}} as ClinicalExam;
  return <div className="space-y-4">
    <p className="text-sm">{source==='clinic'?'Odontograma SQLite':'Conferência SQLite'} — {record.patient.name}. Alterações são gravadas ao salvar a avaliação.</p>
    {error && <p role="alert" className="text-red-700">{error}</p>}
    {message && <p role="status" className="text-green-700">{message}</p>}
    {pending.current && !busy && <button className="border rounded-lg p-2" onClick={retry}>Repetir confirmação do mesmo salvamento</button>}
    <OdontogramCanvas key={`${patientId}:${revision}`} patientId={patientId} readOnly={readOnly || busy || !!pending.current} serverMode initialNotes={record.current.details?.notes || ''}
      dataSource={{patients:[record.patient],odontograms:{[patientId]:conditions},odontogramSnapshots:{[patientId]:snapshots},
        saveOdontogramSnapshot:save,getClinicalExam:()=>exam,
        updateClinicalExam:()=>{throw Error('Salve a avaliação completa para registrar os dados no servidor.');},
        updatePatient:()=>{throw Error('Anexos antigos estão somente para consulta nesta conferência.');},
        updateToothCondition:(id,condition)=>{
          if(id!==patientId || readOnly || busy || pending.current)return;
          setConditions(prev=>{const old=prev.find(t=>t.toothNumber===condition.toothNumber);
            const next=old?{...old,...condition,surfaces:{...old.surfaces,...condition.surfaces}}:condition;
            return old?prev.map(t=>t.toothNumber===condition.toothNumber?next:t):[...prev,next];});
        }}} />
    <section className="p-4 border rounded-xl space-y-3">
      <h3 className="font-semibold">PDFs e evoluções arquivados no servidor</h3>
      <p className="text-sm">Até 100 avaliações recentes. Os acessos são registrados com a conta autenticada.</p>
      {record.history.length===0 && <p>Nenhuma avaliação arquivada.</p>}
      {record.history.map((h:any)=><div key={h.id} className="flex gap-3 flex-wrap items-center border-b py-2">
        <span>{h.date.split('-').reverse().join('/')} — {h.title} — {h.dentistName || h.dentistUid || 'Profissional registrado'}</span>
        <button className="underline" onClick={()=>showArchive(h.id,'document')}>Baixar PDF</button>
        <button className="underline" onClick={()=>showArchive(h.id,'evolution')}>Ver evolução</button>
      </div>)}
      {evolution && <div><button className="underline" onClick={()=>setEvolution('')}>Fechar evolução</button><pre className="whitespace-pre-wrap font-sans">{evolution}</pre></div>}
    </section>
  </div>;
}
