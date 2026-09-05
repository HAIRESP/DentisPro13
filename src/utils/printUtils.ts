/**
 * DentisPro - Utilitário de Impressão e Nomenclatura Padronizada de Documentos
 * 
 * Configura o document.title dinamicamente antes do disparo de window.print()
 * através dos eventos 'beforeprint' e 'afterprint', garantindo que o diálogo
 * nativo do navegador sugira o nome correto e higienizado para salvamento em PDF.
 */

/**
 * Sanitiza uma string para uso seguro como nome de arquivo no Windows, macOS e Linux.
 * Remove acentuações, caracteres proibidos (\ / : * ? " < > |), espaços duplicados e pontuações inadequadas.
 */
export function formatSafeFilename(
  documentTitle: string,
  patientName?: string,
  dateInput?: string | Date
): string {
  // Limpar e normalizar acentos
  const normalizeText = (text: string): string => {
    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // remove acentos
      .replace(/[^\w\s-]/g, '') // remove pontuações especiais
      .trim();
  };

  // Formatar data em YYYY-MM-DD
  let datePart = '';
  if (dateInput) {
    if (typeof dateInput === 'string') {
      const brMatch = dateInput.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
      if (brMatch) {
        datePart = `${brMatch[3]}-${brMatch[2].padStart(2, '0')}-${brMatch[1].padStart(2, '0')}`;
      } else {
        const isoMatch = dateInput.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
        if (isoMatch) {
          datePart = `${isoMatch[1]}-${isoMatch[2].padStart(2, '0')}-${isoMatch[3].padStart(2, '0')}`;
        }
      }
    } else if (dateInput instanceof Date && !isNaN(dateInput.getTime())) {
      const y = dateInput.getFullYear();
      const m = String(dateInput.getMonth() + 1).padStart(2, '0');
      const d = String(dateInput.getDate()).padStart(2, '0');
      datePart = `${y}-${m}-${d}`;
    }
  }

  if (!datePart) {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    datePart = `${y}-${m}-${d}`;
  }

  const cleanDocTitle = normalizeText(documentTitle || 'Documento_Odontologico')
    .replace(/\s+/g, '_');

  const cleanPatient = patientName && patientName.trim().length > 0 && patientName !== 'Paciente Não Informado' && patientName !== 'Paciente Selecionado'
    ? normalizeText(patientName).replace(/\s+/g, '_')
    : '';

  // Montar nome seguro
  let finalName = '';
  if (cleanPatient) {
    finalName = `${cleanDocTitle}_${cleanPatient}_${datePart}`;
  } else {
    finalName = `${cleanDocTitle}_${datePart}`;
  }

  // Garantir remoção de caracteres proibidos em SOs e duplicidades
  return finalName
    .replace(/[\\/:*?"<>|]/g, '')
    .replace(/_+/g, '_')
    .substring(0, 120); // Limite prudente para caminho de arquivos
}

/**
 * Dispara a impressão nativa gerenciando o nome do arquivo sugerido
 * via eventos 'beforeprint' e 'afterprint' do navegador.
 * 
 * @param filenameOrConfig Nome do arquivo sanitizado ou opções detalhadas
 * @param printCallback Callback de disparo customizado (opcional, padrão window.print)
 */
export function printDocumentWithTitle(
  filenameOrConfig: string | { docTitle: string; patientName?: string; date?: string | Date },
  printCallback?: () => void
): void {
  const originalTitle = document.title;
  
  let targetFilename = '';
  if (typeof filenameOrConfig === 'string') {
    targetFilename = formatSafeFilename(filenameOrConfig);
  } else {
    targetFilename = formatSafeFilename(
      filenameOrConfig.docTitle,
      filenameOrConfig.patientName,
      filenameOrConfig.date
    );
  }

  let isRestored = false;
  const restoreOriginalTitle = () => {
    if (!isRestored) {
      isRestored = true;
      document.title = originalTitle;
      window.removeEventListener('beforeprint', handleBeforePrint);
      window.removeEventListener('afterprint', handleAfterPrint);
    }
  };

  const handleBeforePrint = () => {
    document.title = targetFilename;
  };

  const handleAfterPrint = () => {
    restoreOriginalTitle();
  };

  // Registra listeners de beforeprint e afterprint
  window.addEventListener('beforeprint', handleBeforePrint);
  window.addEventListener('afterprint', handleAfterPrint);

  // Define antecipadamente o título para compatibilidade síncrona do Chromium
  document.title = targetFilename;

  try {
    if (printCallback) {
      printCallback();
    } else {
      window.print();
    }
  } catch (err) {
    console.warn('Erro ao disparar impressão de documento:', err);
    restoreOriginalTitle();
  }

  // Salvaguarda caso afterprint não seja emitido (ex: fechamento abrupto ou sandbox)
  setTimeout(() => {
    if (document.title === targetFilename) {
      restoreOriginalTitle();
    }
  }, 3500);
}
