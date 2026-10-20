const PARTICULAS_NOME = new Set(['de', 'da', 'do', 'das', 'dos', 'e']);

function limparTexto(texto: string): string {
  return texto.normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9\s_-]/g, '')
    .trim();
}

export function iniciaisPaciente(nome: string): string {
  const palavras = limparTexto(nome).split(/\s+/).filter(Boolean);
  return palavras
    .filter((palavra) => !PARTICULAS_NOME.has(palavra.toLowerCase()))
    .map((palavra) => palavra[0].toUpperCase())
    .join('') || 'PAC';
}

export function formatClinicalPdfFilename(
  tituloDocumento: string,
  nomePaciente: string,
  dataSalvamento: Date = new Date()
): string {
  if (!Number.isFinite(dataSalvamento.getTime())) {
    throw new Error('Data de salvamento invalida.');
  }

  const documento = limparTexto(tituloDocumento || 'Documento_Odontologico')
    .replace(/[\s-]+/g, '_') || 'Documento_Odontologico';
  const iniciais = iniciaisPaciente(nomePaciente);
  const partes = [
    dataSalvamento.getFullYear(),
    String(dataSalvamento.getMonth() + 1).padStart(2, '0'),
    String(dataSalvamento.getDate()).padStart(2, '0')
  ];
  const hora = String(dataSalvamento.getHours()).padStart(2, '0');
  const minuto = String(dataSalvamento.getMinutes()).padStart(2, '0');

  return `${documento}_${iniciais}_${partes.join('')}_${hora}${minuto}.pdf`;
}
