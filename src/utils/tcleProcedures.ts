import type { TcleProcedure } from './tclePlan';
export interface TcleProceduresData {
  planId?: string;
  procedures?: TcleProcedure[];
  patientName: string;
  document: string;
  birthDate: string;
  legalGuardian: string;
  professionalName: string;
  professionalCro: string;
  city: string;
  date: string;
}
export const escapeTcle = (text: unknown) => String(text ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
const field = (value: string) => escapeTcle(value || '________________________________');
export function renderTcleProceduresBody(data: TcleProceduresData): string {
  const heading = (text: string) => `<h3 style="font-size:12px;font-weight:700;margin:10px 0 5px;break-after:avoid">${text}</h3>`;
  const list = (items: string[]) => `<ul style="display:block;list-style:disc;padding-left:20px;margin:6px 0">${items.map(item=>`<li style="display:list-item;margin-bottom:4px">${item}</li>`).join('')}</ul>`;
  return `<div style="font-family:Arial,sans-serif;font-size:11px;line-height:1.4;color:#222;text-align:justify">
  <h2 style="font-size:14px;font-weight:700;text-align:center;margin:10px 0">TERMO DE CONSENTIMENTO LIVRE E ESCLARECIDO (TCLE)</h2>
  <p style="text-align:center;font-weight:700">PROCEDIMENTOS ODONTOLÓGICOS</p>
  ${heading('1. IDENTIFICAÇÃO DO PACIENTE E RESPONSÁVEL')}
  ${list([`<strong>Nome do Paciente:</strong> ${field(data.patientName)}`,`<strong>Documento (RG/CPF):</strong> ${field(data.document)}`,`<strong>Data de Nascimento:</strong> ${field(data.birthDate)}`,`<strong>Nome do Responsável Legal (se aplicável):</strong> ${field(data.legalGuardian)}`])}
  ${heading('2. IDENTIFICAÇÃO DO PROFISSIONAL')}
  ${list([`<strong>Cirurgião-Dentista:</strong> ${field(data.professionalName)}`,`<strong>Inscrição:</strong> ${field(data.professionalCro)}`])}
  ${heading('3. PROCEDIMENTOS PROPOSTOS')}
  <p>Declaro que fui informado(a) detalhadamente sobre a necessidade, a natureza e os objetivos dos seguintes procedimentos indicados para o meu caso clínico:</p>
  ${data.procedures !== undefined ? list(data.procedures.map(p => `<strong>${escapeTcle(p.name)}${p.code ? ` (Código: ${escapeTcle(p.code)})` : ''}</strong><br>Dente/região: ${field(p.region)}<br>${field(p.patientDescription || '')}<br>Valor: ${escapeTcle(p.value.toLocaleString('pt-BR', {style:'currency',currency:'BRL'}))}`)) : list([
    '<strong>Consulta odontológica inicial (Código: 8.10.00.065):</strong> Avaliação clínica completa da boca, dentes e tecidos adjacentes para diagnóstico e planejamento do tratamento.',
    '<strong>Atividade educativa em saúde bucal (Código: 8.40.00.139):</strong> Orientações personalizadas sobre técnicas de escovação, uso do fio dental e hábitos alimentares para prevenção de doenças.',
    '<strong>Raspagem supra-gengival (Código: 8.53.00.047):</strong> Remoção mecânica de tártaro (cálculo dentário) e placa bacteriana localizados acima da linha da gengiva para o tratamento e prevenção de gengivite.'
  ])}
  ${heading('4. RISCOS, DESCONFORTOS E EFEITOS COLATERAIS')}
  ${data.procedures === undefined ? '<p>Fui esclarecido(a) de que os procedimentos são rotineiros e seguros, mas que podem apresentar alguns desconfortos temporários, tais como:</p>' : ''}
  ${data.procedures !== undefined ? list(data.procedures.map(p=>`<strong>${escapeTcle(p.name)}:</strong> ${field(p.risks || '')}`)) : list([
    '<strong>Sensibilidade dentária</strong> ao frio ou calor logo após a raspagem.',
    '<strong>Leve sangramento</strong> ou sensibilidade na gengiva durante ou após a remoção do tártaro.',
    'Necessidade de anestesia local (se houver hipersensibilidade extrema), com riscos mínimos associados ao anestésico.'
  ])}
  ${heading('5. BENEFÍCIOS ESPERADOS')}
  ${data.procedures !== undefined ? list(data.procedures.map(p=>`<strong>${escapeTcle(p.name)}:</strong> ${field(p.benefits || '')}`)) : list(['Diagnóstico precoce de cáries ou lesões bucais.','Redução da inflamação, do sangramento gengival e do mau hálito.','Aprendizado de hábitos que evitam tratamentos mais complexos e invasivos no futuro.'])}
  ${heading('6. DECLARAÇÃO DE CONSENTIMENTO')}
  <p>Confirmo que o cirurgião-dentista explicou de forma clara e em linguagem acessível todos os pontos acima. Tive a oportunidade de fazer perguntas, as quais foram respondidas satisfatoriamente. Compreendo que posso revogar este consentimento a qualquer momento antes da realização dos atos, sem qualquer penalidade.</p>
  <p style="margin-top:8px">Sendo assim, manifesto livremente minha <strong>vontade e consentimento</strong> para a realização dos procedimentos listados.</p>
  </div>`;
}
export function renderTclePatientSignature(data: TcleProceduresData): string {
  return `<div style="break-inside:avoid;break-after:avoid;margin-top:16px;font-family:Arial,sans-serif;font-size:11.5px;color:#222"><p style="text-align:right">${field(data.city)}, ${field(data.date)}.</p><div style="border-top:1px solid #222;margin:32px auto 8px;width:80%;text-align:center;padding-top:6px">Assinatura do Paciente ou Responsável Legal</div></div>`;
}
