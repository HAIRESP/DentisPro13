import * as pdfjsLib from 'pdfjs-dist';

// Configure pdfjs worker in browser environment
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.10.38'}/pdf.worker.min.mjs`;
}

export interface ImportedProcedureRow {
  code: string;
  description: string;
  price: number;
  specialty?: string;
  selected?: boolean;
}

const SPECIALTY_MAP: { [key: string]: string } = {
  'DIAGNÓSTICO': 'Diagnóstico',
  'DIAGNOSTICO': 'Diagnóstico',
  'URGÊNCIA/EMERGÊNCIA': 'Urgência & Emergência',
  'URGENCIA/EMERGENCIA': 'Urgência & Emergência',
  'URGÊNCIA': 'Urgência & Emergência',
  'URGENCIA': 'Urgência & Emergência',
  'CONDICIONAMENTO': 'Odontopediatria',
  'EXAMES': 'Exames & Diagnóstico',
  'RADIOLOGIA': 'Radiologia & Imaginologia',
  'PREVENÇÃO': 'Prevenção & Profilaxia',
  'PREVENCAO': 'Prevenção & Profilaxia',
  'DENTÍSTICA': 'Dentística & Estética',
  'DENTISTICA': 'Dentística & Estética',
  'ENDODONTIA': 'Endodontia',
  'PERIODONTIA': 'Periodontia',
  'PROTESE': 'Prótese Dentária',
  'PRÓTESE': 'Prótese Dentária',
  'CIRURGIA': 'Cirurgia Bucomaxilofacial',
  'ORTODONTIA': 'Ortodontia',
  'IMPLANTODONTIA': 'Implantodontia',
  'AUDITORIA': 'Auditoria',
  'DTM': 'DTM & Dor Orofacial',
  'ATM': 'DTM & Dor Orofacial'
};

/**
 * Parses Brazilian numeric currency/number format:
 * - 1.509 -> 1509
 * - 3.207 -> 3207
 * - 1.509,00 -> 1509
 * - 1509,50 -> 1509.5
 * - 65 -> 65
 */
export function parseBrazilianPrice(rawStr: string): number {
  if (!rawStr) return 0;
  let str = rawStr.trim().replace(/R\$\s*/gi, '');

  // If contains both '.' and ',' (e.g. 1.509,50)
  if (str.includes('.') && str.includes(',')) {
    str = str.replace(/\./g, '').replace(',', '.');
    const val = parseFloat(str);
    return isNaN(val) ? 0 : val;
  }

  // If contains only ',' (e.g. 1509,50 or 65,00)
  if (str.includes(',')) {
    str = str.replace(',', '.');
    const val = parseFloat(str);
    return isNaN(val) ? 0 : val;
  }

  // If contains only '.' (e.g. 1.509 or 3.207 or 1.000)
  if (str.includes('.')) {
    const parts = str.split('.');
    // Brazilian thousand separator format: 1.509 or 10.500
    if (parts.length === 2 && parts[1].length === 3) {
      str = str.replace('.', '');
      const val = parseFloat(str);
      return isNaN(val) ? 0 : val;
    }
  }

  const val = parseFloat(str);
  return isNaN(val) ? 0 : val;
}

/**
 * Detects if a text string represents a section/specialty header line
 */
function detectSpecialtyHeader(text: string): string | null {
  const clean = text.trim().toUpperCase().replace(/[^A-ZÁÉÍÓÚÃÕÂÊÔÇ/ ]/g, '');
  if (!clean || clean.length < 3) return null;

  for (const [key, val] of Object.entries(SPECIALTY_MAP)) {
    if (clean === key || clean.startsWith(key + ' ') || clean.endsWith(' ' + key)) {
      return val;
    }
  }
  return null;
}

/**
 * Parses a CSV or TXT file text containing procedures, specialties, and prices.
 */
export function parseCsvProcedures(csvText: string): ImportedProcedureRow[] {
  const lines = csvText.split(/\r?\n/).filter(l => l.trim().length > 0);
  const items: ImportedProcedureRow[] = [];
  const seenCodes = new Set<string>();
  let currentSpecialty = 'Dentística & Estética';

  for (const line of lines) {
    const headerSpecialty = detectSpecialtyHeader(line);
    if (headerSpecialty) {
      currentSpecialty = headerSpecialty;
      continue;
    }

    // Skip header lines
    if (line.toLowerCase().includes('código') && line.toLowerCase().includes('descrição')) {
      continue;
    }

    const parts = line.split(/[;,|\t]/).map(p => p.trim().replace(/^"(.*)"$/, '$1'));
    
    // Find 8-digit TUSS code
    const codeIdx = parts.findIndex(p => /^\d{8}$/.test(p));
    if (codeIdx !== -1) {
      const code = parts[codeIdx];
      let description = parts[codeIdx + 1] || parts[0] || `Procedimento ${code}`;
      if (description === code) description = parts[0] || `Procedimento ${code}`;

      let price = 0;

      // Search remaining columns for price
      for (let j = 0; j < parts.length; j++) {
        if (j === codeIdx) continue;
        const parsed = parseBrazilianPrice(parts[j]);
        if (parsed > 0 && parsed < 100000) {
          price = parsed;
        }
      }

      if (code && !seenCodes.has(code)) {
        seenCodes.add(code);
        items.push({
          code,
          description: description.slice(0, 120),
          price,
          specialty: currentSpecialty,
          selected: true
        });
      }
    }
  }

  return items;
}

/**
 * Parses a PDF ArrayBuffer extracting procedure codes, descriptions, specialties, and prices.
 */
export async function parsePdfProcedures(arrayBuffer: ArrayBuffer): Promise<ImportedProcedureRow[]> {
  try {
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdfDoc = await loadingTask.promise;
    const items: ImportedProcedureRow[] = [];
    const seenCodes = new Set<string>();
    let currentSpecialty = 'Dentística & Estética';

    for (let i = 1; i <= pdfDoc.numPages; i++) {
      const page = await pdfDoc.getPage(i);
      const textContent = await page.getTextContent();
      
      // Group text items by Y-coordinate (lines)
      const lineMap = new Map<number, { x: number; text: string }[]>();

      for (const item of textContent.items as any[]) {
        if (!item.str || !item.str.trim()) continue;
        const x = item.transform ? item.transform[4] : 0;
        const y = item.transform ? Math.round(item.transform[5] / 4.0) * 4 : 0;

        if (!lineMap.has(y)) {
          lineMap.set(y, []);
        }
        lineMap.get(y)!.push({ x, text: item.str.trim() });
      }

      // Sort lines top-to-bottom (Y descending)
      const sortedY = Array.from(lineMap.keys()).sort((a, b) => b - a);
      let orphanTextBuffer = '';

      for (const y of sortedY) {
        const rowItems = lineMap.get(y)!;
        // Sort items left-to-right (X ascending)
        rowItems.sort((a, b) => a.x - b.x);
        const lineText = rowItems.map(r => r.text).join(' ');

        // Check if line is a specialty/category header
        const headerSpecialty = detectSpecialtyHeader(lineText);
        if (headerSpecialty) {
          currentSpecialty = headerSpecialty;
          orphanTextBuffer = '';
          continue;
        }

        // Search for 8-digit TUSS code
        const codeMatch = lineText.match(/\b([1-8]\d{7})\b/);
        if (codeMatch) {
          const code = codeMatch[1];
          if (seenCodes.has(code)) {
            orphanTextBuffer = '';
            continue;
          }

          // Price is usually at the end of row (last number)
          const numberTokens = lineText.match(/(?:R\$\s*)?(\d{1,3}(?:\.\d{3})*(?:,\d{2})?|\d+(?:,\d{2})?|\d{1,5})/g) || [];
          let price = 0;

          // Find price from rightmost number tokens excluding the code itself
          for (let k = numberTokens.length - 1; k >= 0; k--) {
            const tok = numberTokens[k];
            if (tok.includes(code)) continue;
            const p = parseBrazilianPrice(tok);
            if (p > 0 && p < 100000) {
              price = p;
              break;
            }
          }

          // Clean description
          let desc = (orphanTextBuffer ? orphanTextBuffer + ' ' : '') + lineText;
          orphanTextBuffer = '';

          desc = desc
            .replace(code, '')
            .replace(/\b(8100\d{4}|8200\d{4}|8300\d{4}|8400\d{4}|8500\d{4}|8700\d{4}|3010\d{4}|4140\d{4})\b/g, '')
            .replace(/R\$/gi, '')
            .replace(/Anexo II RN|465|NOMENCLATURA|PROCEDIMENTO|Diretriz de|Utilização|CÓDIGO|TUSS|RAIO X|USO/gi, '')
            .replace(/[-:;|*]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();

          // Remove trailing/leading standalone numbers from auxiliary columns
          desc = desc.replace(/^\d+\s+/, '').replace(/\s+\d+$/, '').trim();

          if (!desc || desc.length < 2) {
            desc = `Procedimento TUSS ${code}`;
          }

          seenCodes.add(code);
          items.push({
            code,
            description: desc.slice(0, 140),
            price,
            specialty: currentSpecialty,
            selected: true
          });
        } else {
          // Accumulate line into orphan text buffer if it looks like part of a procedure title
          if (lineText.length > 5 && !lineText.toLowerCase().includes('tabela de procedimentos') && !lineText.toLowerCase().includes('edição')) {
            orphanTextBuffer = (orphanTextBuffer + ' ' + lineText).trim();
          }
        }
      }
    }

    return items;
  } catch (err) {
    console.error('Erro ao processar arquivo PDF de convênio:', err);
    return [];
  }
}

