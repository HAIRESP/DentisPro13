import html2canvas from 'html2canvas';

// Capture the panel itself (including content below the fold), not the browser chrome.
export async function captureClinicalPanel(source: HTMLElement): Promise<HTMLCanvasElement> {
  if (!source.isConnected) throw Error('A aba foi fechada antes de gerar o PDF.');
  await document.fonts.ready;
  const canvas = await html2canvas(source, {
    backgroundColor: '#ffffff', scale: Math.min(1.5, 1600 / Math.max(1, source.scrollWidth)),
    useCORS: true, allowTaint: false, logging: false, imageTimeout: 10000,
    onclone: (doc, cloned) => {
      const colorCanvas = doc.createElement('canvas'); colorCanvas.width = 1; colorCanvas.height = 1;
      const ctx = colorCanvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) throw Error('Captura de cores indisponível.');
      const cache = new Map<string, string>();
      const rgb = (value: string) => {
        if (cache.has(value)) return cache.get(value)!;
        ctx.clearRect(0, 0, 1, 1); ctx.fillStyle = value; ctx.fillRect(0, 0, 1, 1);
        const [r,g,b,a] = ctx.getImageData(0, 0, 1, 1).data;
        const converted = `rgba(${r},${g},${b},${a / 255})`; cache.set(value, converted); return converted;
      };
      for (const el of [cloned, ...Array.from(cloned.querySelectorAll<HTMLElement>('*'))]) {
        const node = el as HTMLElement;
        const computed = doc.defaultView!.getComputedStyle(node);
        if (node.hasAttribute('data-pdf-ignore') || (node !== cloned && computed.position === 'fixed')) {
          node.style.setProperty('display', 'none', 'important'); continue;
        }
        // Tailwind 4 uses oklch/oklab; canvas gives equivalent sRGB for html2canvas.
        for (const prop of ['color','background-color','background-image','border-top-color','border-right-color','border-bottom-color','border-left-color','outline-color','text-decoration-color','box-shadow','fill','stroke']) {
          const value = computed.getPropertyValue(prop);
          if (/oklch\(|oklab\(|\blab\(|\blch\(|\bcolor\(/.test(value))
            node.style.setProperty(prop, value.replace(/(?:oklch|oklab|lab|lch|color)\([^)]*\)/g, rgb), 'important');
        }
        node.style.setProperty('animation', 'none', 'important');
        node.style.setProperty('transition', 'none', 'important');
      }
      for (const field of Array.from(cloned.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>('input,textarea,select'))) {
        if (field.tagName === 'INPUT' && ['checkbox','radio','range','file','hidden'].includes((field as HTMLInputElement).type)) continue;
        const text = doc.createElement('div');
        const style = doc.defaultView!.getComputedStyle(field);
        for (const prop of Array.from(style)) text.style.setProperty(prop, style.getPropertyValue(prop));
        text.style.whiteSpace = 'pre-wrap'; text.style.overflow = 'visible'; text.style.height = 'auto';
        text.style.minHeight = `${field.getBoundingClientRect().height}px`;
        text.style.display = 'block';
        text.textContent = field.tagName === 'SELECT'
          ? (field as HTMLSelectElement).selectedOptions[0]?.textContent || ''
          : field.tagName === 'INPUT' && (field as HTMLInputElement).type === 'date'
            ? field.value.split('-').reverse().join('/') : field.value;
        field.replaceWith(text);
      }
    }
  });
  if (!canvas.width || !canvas.height) throw Error('A captura da aba ficou vazia.');
  return canvas;
}

export function ageAtExam(birthDate: string | undefined, examDate: string): string {
  if (!birthDate || !/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) return 'Idade não informada';
  const [by,bm,bd] = birthDate.split('-').map(Number);
  const [ey,em,ed] = examDate.split('-').map(Number);
  const valid = new Date(Date.UTC(by,bm-1,bd));
  if (valid.getUTCFullYear() !== by || valid.getUTCMonth() !== bm-1 || valid.getUTCDate() !== bd) return 'Idade não informada';
  let months = (ey-by)*12 + em-bm - (ed < bd ? 1 : 0);
  if (months < 0) return 'Idade não informada';
  const years = Math.floor(months / 12); months %= 12;
  return `${years} ${years === 1 ? 'ano' : 'anos'} e ${months} ${months === 1 ? 'mês' : 'meses'}`;
}
