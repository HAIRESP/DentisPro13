import React, {useRef, useState} from 'react';
export function PatientAccessPage() {
  const [token] = useState(() => {
    const value = window.location.hash.slice(1);
    window.history.replaceState({}, '', '/patient-access'); return value;
  });
  const [data, setData] = useState<any>(null), [error, setError] = useState(''), [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const lock = useRef(false);
  async function act(action: string, extra = {}) {
    if (lock.current) return;
    lock.current = true; setBusy(true); setError(''); setNotice('');
    try {
      const send = async (action: string, extra = {}) => {
        const r = await fetch('/api/patient-access', {method: 'POST', cache: 'no-store', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({token, action, ...extra}), signal: AbortSignal.timeout(30000)});
        const value = await r.json(); if (!r.ok) throw Error(value.error); return value;
      };
      const value = await send(action, extra);
      if (action === 'renew') {setNotice(value.message); return;}
      setData(action === 'view' ? value : await send('view'));
    } catch (e: any) { setError(e.message); }
    finally {lock.current = false; setBusy(false);}
  }
  return <main className="min-h-screen bg-stone-100 p-6"><section className="max-w-lg mx-auto bg-white rounded-xl p-6 space-y-4">
    <h1 className="text-xl font-bold">DentisPro · Suas autorizações</h1>
    <p>Você decide quais profissionais podem consultar seu prontuário. O link não mostra informações clínicas.</p>
    <p className="text-sm">Este link vale por 24 horas. O prazo de acesso do profissional é separado e aparece abaixo.</p>
    {notice && <p role="status">{notice}</p>}
    {error && <p role="alert" className="text-red-700">{error}</p>}
    {!data && <button disabled={busy} onClick={() => act('view')}>Consultar solicitação</button>}
    {data && <>{data.purpose === 'management' ? <p>Confirme sua identidade para consultar e suspender autorizações. Isso não libera nem prolonga acesso de profissionais.</p> : <><p>Profissional: <strong>{data.professional}</strong></p><p>Período: {data.duration === 'visit' ? '8 horas' : data.duration === 'month' ? 'um mês a partir da sua confirmação, sem renovação automática' : 'até você suspender'}.</p></>}
      {data.status === 'pending' && <form onSubmit={e => {e.preventDefault(); const f = new FormData(e.currentTarget); void act('confirm', {code: f.get('code')});}} className="space-y-3">
        <label>Código recebido <input name="code" required inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} className="border p-2 w-full" /></label>
        <button disabled={busy} className="bg-stone-700 text-white p-3 rounded">{data.purpose === 'management' ? 'Confirmar gerenciamento de autorizações' : 'Autorizo o acesso ao meu prontuário'}</button>
      </form>}
      {data.grants?.map((g: any) => <div key={g.uid} className="border rounded p-3"><p>{g.name} · {g.status === 'none' ? 'Sem autorização comum' : g.status === 'suspended' ? 'Suspenso' : g.expiresAt && g.expiresAt <= Date.now() ? 'Expirado' : 'Autorizado'}</p>
        {g.expiresAt && <p>Prazo: {new Date(g.expiresAt).toLocaleString('pt-BR', {timeZone: 'America/Fortaleza'})} (horário de Fortaleza).</p>}
        {g.exception && <p>Acesso excepcional somente leitura até {new Date(g.exception.expiresAt).toLocaleString('pt-BR', {timeZone: 'America/Fortaleza'})}. Motivo: {g.exception.reason}</p>}
        {(g.exception || (g.status === 'active' && (!g.expiresAt || g.expiresAt > Date.now()))) && <button disabled={busy} onClick={() => act('suspend', {targetUid: g.uid})}>Suspender acesso</button>}</div>)}
      <p className="text-sm">Para liberar novamente, solicite um novo código à clínica. A suspensão impede novas consultas; documentos já recebidos não podem ser recolhidos. Acesso excepcional da administração exige justificativa e gera notificação e auditoria.</p>
    </>}
    <button disabled={busy || !token} className="border rounded p-2" onClick={() => act('renew')}>Renovar link de gerenciamento por e-mail</button>
    <p className="text-sm">Se o link venceu, use este botão. O novo link será enviado somente ao contato confirmado e não estenderá o acesso de nenhum profissional. Se fechou esta página, reabra o link no e-mail.</p>
  </section></main>;
}
