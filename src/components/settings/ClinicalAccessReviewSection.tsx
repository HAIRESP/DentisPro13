import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authenticatedFetch } from '../../utils/authenticatedFetch';

type Patient = { id: string; name: string };
type Grant = { account_uid: string; professional_id: string; permission: 'read' | 'write'; expires_at: number; version: number };
async function request(path: string, body?: unknown, signal?: AbortSignal) {
  const response = await authenticatedFetch(`/api/clinical-review${path}`, {
    signal, ...(body === undefined ? {} : { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }),
  });
  const data = await response.json();
  if (!response.ok) throw Error(data.error || 'Não foi possível concluir a operação.');
  return data;
}

export function ClinicalAccessReviewSection() {
  const { userRole, allUsers } = useAuth();
  const [enabled, setEnabled] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [next, setNext] = useState<string | null>(null);
  const [patientId, setPatientId] = useState('');
  const [accountUid, setAccountUid] = useState('');
  const [grants, setGrants] = useState<Grant[]>([]);
  const [loadedPatient, setLoadedPatient] = useState('');
  const [reference, setReference] = useState('');
  const [days, setDays] = useState(30);
  const [confirmed, setConfirmed] = useState(false);
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState('');
  const dentists = allUsers.filter(user => user.role === 'dentist' && user.professionalId);
  const errorText = (error: unknown) => error instanceof Error ? error.message : 'Não foi possível concluir a operação.';

  useEffect(() => {
    setGrants([]); setLoadedPatient(''); setPassword(''); setConfirmed(false); setReference('');
    if (!patientId || !enabled) return;
    const controller = new AbortController();
    request(`/patients/${encodeURIComponent(patientId)}/access`, undefined, controller.signal)
      .then(data => { if (!controller.signal.aborted) { setGrants(data); setLoadedPatient(patientId); } })
      .catch(error => { if (!controller.signal.aborted) setFeedback(errorText(error)); });
    return () => controller.abort();
  }, [patientId, enabled]);

  if (userRole !== 'admin') return null;
  async function loadPatients(more = false) {
    setBusy(true); setFeedback('');
    try {
      await request('/status');
      const data = await request(`/patients?limit=100${more && next ? `&after=${encodeURIComponent(next)}` : ''}`);
      setPatients(previous => more ? [...previous, ...data.patients] : data.patients);
      setNext(data.next); setEnabled(true);
      if (!more) { setPatientId(''); setGrants([]); setLoadedPatient(''); }
      if (!data.patients.length) setFeedback('Nenhum paciente nesta página da cópia de conferência.');
    } catch (error) { setFeedback(errorText(error)); }
    finally { setBusy(false); }
  }
  async function mutate(revoke?: Grant) {
    if (!patientId || loadedPatient !== patientId || !password || busy) return;
    setBusy(true); setFeedback('');
    try {
      const base = `/patients/${encodeURIComponent(patientId)}/access`;
      if (revoke) {
        await request(`${base}/revoke`, { accountUid: revoke.account_uid, expectedVersion: revoke.version, currentPassword: password });
      } else {
        const current = grants.find(grant => grant.account_uid === accountUid);
        await request(base, { accountUid, expectedVersion: current?.version ?? 0, permission: 'read',
          patientConfirmed: confirmed, confirmationMethod: 'in_person', consentReference: reference,
          validForDays: days, currentPassword: password });
      }
      setFeedback(revoke ? 'Acesso revogado na cópia de conferência.' : 'Autorização de consulta registrada na cópia de conferência.');
    } catch (error) { setFeedback(errorText(error)); }
    finally {
      setPassword(''); setConfirmed(false);
      // Refresh versions after success or conflict. A failed refresh disables further mutations.
      setLoadedPatient('');
      try { setGrants(await request(`/patients/${encodeURIComponent(patientId)}/access`)); setLoadedPatient(patientId); }
      catch { setFeedback('Não foi possível atualizar as autorizações. Reabra a conferência antes de continuar.'); }
      setBusy(false);
    }
  }
  const ready = !busy && loadedPatient === patientId && !!patientId;
  return <section className="bg-white rounded-2xl border border-stone-200 p-5 space-y-4">
    <div>
      <h3 className="font-bold text-stone-800">Autorizações da cópia de conferência</h3>
      <p className="text-sm text-stone-600 mt-1">Consulte pacientes importados e registre autorizações temporárias para dentistas. Esta etapa não altera o prontuário em uso nas telas atuais.</p>
    </div>
    <button type="button" disabled={busy} onClick={() => loadPatients()} className="px-4 py-2 rounded-lg bg-stone-800 text-white disabled:opacity-50">
      {busy ? 'Aguarde…' : 'Abrir conferência'}
    </button>
    <p className="text-sm text-stone-600">Se a conferência ainda não estiver habilitada no servidor, esta consulta ficará indisponível.</p>
    {feedback && <p role="status" className="p-3 bg-amber-50 text-amber-900 rounded-lg">{feedback}</p>}
    {enabled && <>
      <label className="block text-sm font-medium">Paciente da cópia de conferência
        <select value={patientId} disabled={busy} onChange={event => { setPatientId(event.target.value); setFeedback(''); }} className="block w-full border rounded-lg p-2 mt-1">
          <option value="">Selecione o paciente</option>
          {patients.map(patient => <option key={patient.id} value={patient.id}>{patient.name} — {patient.id}</option>)}
        </select>
      </label>
      {next && <button type="button" disabled={busy} onClick={() => loadPatients(true)} className="underline text-sm">Carregar mais pacientes</button>}
      {patientId && <>
        <form onSubmit={event => { event.preventDefault(); void mutate(); }} className="space-y-3">
          <label className="block text-sm font-medium">Dentista autorizado
            <select required value={accountUid} disabled={!ready} onChange={event => { setAccountUid(event.target.value); setConfirmed(false); }} className="block w-full border rounded-lg p-2 mt-1">
              <option value="">Selecione uma conta de dentista</option>
              {dentists.map(user => <option key={user.uid} value={user.uid}>{user.name} — {user.email}</option>)}
            </select>
          </label>
          {!dentists.length && <p className="text-sm text-stone-600">Cadastre uma conta de dentista vinculada ao profissional antes de autorizar.</p>}
          <label className="block text-sm font-medium">Validade em dias (1 a 30)
            <input type="number" required min={1} max={30} value={days} disabled={!ready} onChange={event => setDays(Number(event.target.value))} className="block border rounded-lg p-2 mt-1" />
          </label>
          <label className="block text-sm font-medium">Referência da confirmação presencial
            <input required minLength={5} maxLength={500} value={reference} disabled={!ready} onChange={event => setReference(event.target.value)} placeholder="Número do termo ou registro da confirmação" className="block w-full border rounded-lg p-2 mt-1" />
          </label>
          <p className="text-xs text-stone-600">Informe a referência do consentimento, sem descrição clínica. A declaração deve corresponder a uma confirmação efetivamente realizada com o paciente.</p>
          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" required checked={confirmed} disabled={!ready} onChange={event => setConfirmed(event.target.checked)} className="mt-1" />
            O paciente confirmou presencialmente o acesso deste dentista pelo prazo informado.
          </label>
          <label className="block text-sm font-medium">Sua senha atual de administrador
            <input type="password" required autoComplete="current-password" value={password} disabled={!ready} onChange={event => setPassword(event.target.value)} className="block w-full border rounded-lg p-2 mt-1" />
          </label>
          <button type="submit" disabled={!ready || !confirmed || !accountUid || !password} className="px-4 py-2 rounded-lg bg-stone-800 text-white disabled:opacity-50">Registrar autorização de consulta</button>
        </form>
        <div className="space-y-2">
          <h4 className="font-semibold">Autorizações registradas</h4>
          {loadedPatient !== patientId ? <p>Carregando autorizações…</p> : !grants.length ? <p>Nenhuma autorização registrada.</p> : grants.map(grant => {
            const active = grant.expires_at > Date.now();
            return <div key={grant.account_uid} className="flex flex-wrap items-center justify-between gap-2 border rounded-lg p-3">
              <p className="text-sm">{allUsers.find(user => user.uid === grant.account_uid)?.name || grant.account_uid} — {active ? `Validade: ${new Date(grant.expires_at).toLocaleString('pt-BR')}` : 'Revogada ou expirada'}</p>
              <button type="button" disabled={!ready || !active || !password} onClick={() => mutate(grant)} className="text-red-700 underline disabled:opacity-50">Revogar acesso</button>
            </div>;
          })}
          <p className="text-xs text-stone-600">Para revogar, preencha sua senha acima. A revogação passa a valer na próxima consulta ao servidor.</p>
        </div>
      </>}
    </>}
  </section>;
}
