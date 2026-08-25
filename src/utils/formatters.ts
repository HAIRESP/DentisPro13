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
