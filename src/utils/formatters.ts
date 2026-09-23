import { Professional } from '../types';

/**
 * Formats a string to standard Brazilian CPF format: 000.000.000-00
 */
export function formatCPF(value: string | undefined | null): string {
  if (!value) return '';
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
}

/**
 * Formats a string to standard Brazilian CNPJ format: 00.000.000/0000-00
 */
export function formatCNPJ(value: string | undefined | null): string {
  if (!value) return '';
  const digits = value.replace(/\D/g, '').slice(0, 14);
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12, 14)}`;
}

/**
 * Formats EPAO as an integer with max 5 digits
 */
export function formatEPAO(value: string | undefined | null): string {
  if (!value) return '';
  return value.replace(/\D/g, '').slice(0, 5);
}

/**
 * Formats CRO as an integer with max 8 digits
 */
export function formatCRO(value: string | undefined | null): string {
  if (!value) return '';
  return value.replace(/\D/g, '').slice(0, 8);
}

/**
 * Formats a string to standard Brazilian CEP format: 00.000-00 (or 00.000-000)
 */
export function formatCEP(value: string | undefined | null): string {
  if (!value) return '';
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}-${digits.slice(5)}`;
}

/**
 * Formats a string to standard Brazilian Date format: DD/MM/AAAA
 */
export function formatDateMask(value: string | undefined | null): string {
  if (!value) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [y, m, d] = value.split('-');
    return `${d}/${m}/${y}`;
  }
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
}

/**
 * Formats a phone number to standard Brazilian format: (00) 00000-0000 or (00) 0000-0000
 */
export function formatPhone(value: string | undefined | null): string {
  if (!value) return '';
  let digits = value.replace(/\D/g, '');
  if (digits.startsWith('55') && digits.length > 11) {
    digits = digits.slice(2);
  }
  digits = digits.slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

/**
 * Validates email format x@y.z
 */
export function isValidEmail(email: string | undefined | null): boolean {
  if (!email) return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.trim());
}

/**
 * Validates date string (either DD/MM/AAAA or YYYY-MM-DD)
 */
export function isValidDateStr(dateStr: string | undefined | null): boolean {
  if (!dateStr) return false;
  const trimmed = dateStr.trim();
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(trimmed)) {
    const [d, m, y] = trimmed.split('/').map(Number);
    if (m < 1 || m > 12) return false;
    if (d < 1 || d > 31) return false;
    if (y < 1900 || y > 2100) return false;
    return true;
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const [y, m, d] = trimmed.split('-').map(Number);
    if (m < 1 || m > 12) return false;
    if (d < 1 || d > 31) return false;
    if (y < 1900 || y > 2100) return false;
    return true;
  }
  return false;
}

/**
 * Assinatura caligráfica oficial pré-cadastrada do Dr. Hugo Andres Iglesias Ricoy
 */
export const DEFAULT_DR_HUGO_SIGNATURE = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 80" width="280" height="80">
  <path d="M 20 48 Q 28 18 36 32 Q 44 48 52 24 Q 60 52 75 36 Q 90 20 105 45 Q 120 30 140 38 Q 160 25 180 40 Q 200 18 220 35 Q 235 22 255 30" fill="none" stroke="#1a365d" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M 32 30 Q 30 65 38 68 Q 45 70 55 45" fill="none" stroke="#1a365d" stroke-width="2.2" stroke-linecap="round"/>
  <path d="M 85 36 Q 100 48 115 42 Q 130 35 145 44" fill="none" stroke="#1a365d" stroke-width="1.8" stroke-linecap="round"/>
  <path d="M 38 64 C 90 60 160 56 248 50" fill="none" stroke="#1a365d" stroke-width="1.6" stroke-linecap="round"/>
</svg>
`.trim())}`;

/**
 * Carimbo profissional oficial pré-cadastrado do Dr. Hugo Andres Iglesias Ricoy
 */
export const DEFAULT_DR_HUGO_STAMP = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 85" width="240" height="85">
  <rect x="2" y="2" width="236" height="81" rx="6" ry="6" fill="#f8fafc" stroke="#1e3a8a" stroke-width="2.2" opacity="0.95"/>
  <rect x="6" y="6" width="228" height="73" rx="4" ry="4" fill="none" stroke="#1e3a8a" stroke-width="0.9" opacity="0.6"/>
  <text x="120" y="25" font-family="'Segoe UI', Helvetica, Arial, sans-serif" font-size="11" font-weight="900" fill="#1e3a8a" text-anchor="middle" letter-spacing="0.5">DR. HUGO ANDRES IGLESIAS RICOY</text>
  <text x="120" y="42" font-family="'Segoe UI', Helvetica, Arial, sans-serif" font-size="9.5" font-weight="700" fill="#1e40af" text-anchor="middle" letter-spacing="1">CRO/CE 5925</text>
  <text x="120" y="58" font-family="'Segoe UI', Helvetica, Arial, sans-serif" font-size="8" font-weight="600" fill="#334155" text-anchor="middle">CIRURGIÃO-DENTISTA</text>
  <text x="120" y="71" font-family="'Segoe UI', Helvetica, Arial, sans-serif" font-size="7" font-weight="500" fill="#64748b" text-anchor="middle" letter-spacing="0.3">IMPLANTODONTIA &amp; CLÍNICA GERAL</text>
</svg>
`.trim())}`;

/**
 * Identifica com precisão se um profissional ou nome corresponde ao Dr. Hugo Andres Iglesias Ricoy
 * (Responsável Técnico e Titular da Clínica).
 * Normaliza acentuações, prefixos (Dr., Dra.) e variações de maiúsculas/minúsculas.
 */
export function isDrHugoRicoy(
  prof?: { id?: string; name?: string } | null,
  customName?: string,
  clinicDentistName?: string
): boolean {
  if (prof?.id === 'prof-hugo') return true;

  const norm = (str?: string) => (str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/^(dr|dra)\.?\s+/i, '')
    .trim();

  const profNorm = norm(prof?.name);
  const customNorm = norm(customName);
  const clinicNorm = norm(clinicDentistName);

  if (profNorm && (profNorm.includes('hugo andres') || profNorm.includes('iglesias ricoy'))) {
    return true;
  }
  if (customNorm && (customNorm.includes('hugo andres') || customNorm.includes('iglesias ricoy'))) {
    return true;
  }
  if (clinicNorm && (clinicNorm.includes('hugo andres') || clinicNorm.includes('iglesias ricoy'))) {
    if (profNorm && profNorm === clinicNorm) return true;
    if (customNorm && customNorm === clinicNorm) return true;
  }

  return false;
}

export interface ProfessionalVerificationResult {
  hasProfessionalSelected: boolean;
  isVerifiedInDatabase: boolean;
  hasSignature: boolean;
  hasStamp: boolean;
  signatureUrl?: string;
  stampUrl?: string;
  professional?: Professional;
  dentistName: string;
  dentistCro: string;
  dentistSpecialty: string;
  isClinicOwner: boolean;
  signatureLineText: string;
  statusMessage: string;
}

/**
 * Remove qualquer menção a "Responsável Técnico" ou variações de textos de assinatura
 */
export function cleanSignatureText(text?: string): string {
  if (!text) return '';
  return text
    .replace(/\s*[-–—•]?\s*responsável\s+técnico/gi, '')
    .replace(/\s*[-–—•]?\s*cirurgião-dentista\s+responsável/gi, '')
    .replace(/\s*responsável\s+técnico/gi, '')
    .trim();
}

/**
 * Função de verificação centralizada do gerenciador de documentos que valida
 * a existência e integridade dos arquivos de assinatura e carimbo do profissional
 * no banco de dados antes da renderização ou impressão.
 *
 * Regra estrita de negócio:
 * 1. Cada documento utiliza exclusivamente a assinatura e carimbo cadastrados para o profissional selecionado.
 * 2. Se o profissional escolhido não possuir assinatura ou carimbo cadastrado, o sistema NÃO insere imagens
 *    de outros profissionais ou da clínica, mantendo apenas o campo formal com o nome e CRO para assinatura física manual a caneta.
 * 3. Se não houver profissional selecionado, deixa o texto da linha de assinatura em branco.
 * 4. Remove qualquer menção às palavras "- Responsável Técnico".
 */
export function verifyProfessionalSignatureAndStamp(
  profRef: { id?: string; name?: string; cro?: string; specialty?: string; signatureImageUrl?: string; stampImageUrl?: string } | string | null | undefined,
  professionals: Professional[],
  clinicInfo?: {
    dentistName?: string;
    cro?: string;
    specialty?: string;
    signatureImageUrl?: string;
    stampImageUrl?: string;
    showSignatureImage?: boolean;
    showStampImage?: boolean;
    signatureLabel?: string;
  },
  autoInsertEnabled: boolean = true
): ProfessionalVerificationResult {
  const norm = (str?: string) => (str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/^(dr|dra)\.?\s+/i, '')
    .trim();

  // Verifica se uma referência válida a profissional foi passada
  const hasValidRef = Boolean(
    profRef &&
    (typeof profRef === 'string' ? profRef.trim().length > 0 : Boolean(profRef.id || profRef.name))
  );

  if (!hasValidRef) {
    return {
      hasProfessionalSelected: false,
      isVerifiedInDatabase: false,
      hasSignature: false,
      hasStamp: false,
      signatureUrl: undefined,
      stampUrl: undefined,
      professional: undefined,
      dentistName: '',
      dentistCro: '',
      dentistSpecialty: '',
      isClinicOwner: false,
      signatureLineText: '',
      statusMessage: 'Nenhum profissional selecionado. O campo de assinatura permanece em branco para assinatura física manual.'
    };
  }

  let targetId = typeof profRef === 'string' ? profRef : profRef?.id;
  let targetName = typeof profRef === 'object' && profRef ? profRef.name : (typeof profRef === 'string' && !profRef.startsWith('prof-') ? profRef : undefined);

  // 1. Busca profissional no banco de dados (professionals)
  let matchedProf: Professional | undefined;

  if (targetId) {
    matchedProf = professionals.find(p => p.id === targetId);
  }

  if (!matchedProf && targetName) {
    const targetNorm = norm(targetName);
    matchedProf = professionals.find(p => norm(p.name) === targetNorm);
  }

  // Se o profissional informado for explicitamente o Dr. Hugo Andres Iglesias Ricoy e não achou por ID direto
  const isTargetExplicitlyHugo = Boolean(
    targetId === 'prof-hugo' || 
    (targetName && norm(targetName).includes('hugo andres')) ||
    (typeof profRef === 'object' && profRef?.id === 'prof-hugo')
  );

  if (!matchedProf && isTargetExplicitlyHugo) {
    matchedProf = professionals.find(p => p.id === 'prof-hugo' || norm(p.name).includes('hugo andres'));
  }

  const isVerifiedInDatabase = Boolean(matchedProf);
  const dentistName = matchedProf?.name || targetName || '';
  const dentistCro = matchedProf?.cro || (typeof profRef === 'object' && profRef?.cro) || '';
  const dentistSpecialty = matchedProf?.specialty || (typeof profRef === 'object' && profRef?.specialty) || '';
  const isClinicOwner = isDrHugoRicoy(matchedProf, dentistName, clinicInfo?.dentistName);

  // Validador estrito de existência de arquivo (evita strings vazias, nulas ou placeholders inválidos)
  const isValidFileString = (val?: string) => Boolean(val && typeof val === 'string' && val.trim().length > 15);

  let rawSignatureUrl: string | undefined;
  if (matchedProf && isValidFileString(matchedProf.signatureImageUrl)) {
    rawSignatureUrl = matchedProf.signatureImageUrl!.trim();
  } else if (isClinicOwner && isTargetExplicitlyHugo && isValidFileString(clinicInfo?.signatureImageUrl)) {
    rawSignatureUrl = clinicInfo!.signatureImageUrl!.trim();
  }

  let rawStampUrl: string | undefined;
  if (matchedProf && isValidFileString(matchedProf.stampImageUrl)) {
    rawStampUrl = matchedProf.stampImageUrl!.trim();
  } else if (isClinicOwner && isTargetExplicitlyHugo && isValidFileString(clinicInfo?.stampImageUrl)) {
    rawStampUrl = clinicInfo!.stampImageUrl!.trim();
  }

  const hasSignature = Boolean(rawSignatureUrl);
  const hasStamp = Boolean(rawStampUrl);

  const allowSigByConfig = clinicInfo?.showSignatureImage ?? true;
  const allowStampByConfig = clinicInfo?.showStampImage ?? true;

  // Se autoInsertEnabled for falso ou desabilitado na clínica, omitir estritamente qualquer imagem
  const effectiveSig = (autoInsertEnabled && allowSigByConfig && hasSignature) ? rawSignatureUrl : undefined;
  const effectiveStamp = (autoInsertEnabled && allowStampByConfig && hasStamp) ? rawStampUrl : undefined;

  const signatureLineText = dentistName
    ? cleanSignatureText(`${dentistName}${dentistCro ? ` • ${dentistCro}` : ''}`)
    : '';

  let statusMessage = 'Profissional com assinatura e carimbo validados no banco de dados.';
  if (!autoInsertEnabled) {
    statusMessage = 'Inserção automática de assinatura/carimbo desativada pelo usuário. O campo de assinatura permanece limpo para assinatura física manual a caneta.';
  } else if (!hasSignature && !hasStamp) {
    statusMessage = 'Assinatura e carimbo não constam no cadastro do profissional. Imagens omitidas automaticamente, mantendo a identificação formal para assinatura física a caneta.';
  } else if (!hasSignature) {
    statusMessage = 'Assinatura não localizada no cadastro do profissional. Imagem da assinatura omitida, mantendo o carimbo e a identificação formal.';
  } else if (!hasStamp) {
    statusMessage = 'Carimbo não localizado no cadastro do profissional. Imagem do carimbo omitida, mantendo a assinatura cadastrada.';
  }

  return {
    hasProfessionalSelected: Boolean(dentistName),
    isVerifiedInDatabase,
    hasSignature,
    hasStamp,
    signatureUrl: effectiveSig,
    stampUrl: effectiveStamp,
    professional: matchedProf,
    dentistName,
    dentistCro,
    dentistSpecialty,
    isClinicOwner,
    signatureLineText,
    statusMessage
  };
}

