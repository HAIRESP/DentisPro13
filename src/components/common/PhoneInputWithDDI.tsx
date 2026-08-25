import React, { useState, useEffect } from 'react';
import { Phone, ChevronDown } from 'lucide-react';

export interface DDICountry {
  code: string; // e.g. "+55"
  country: string; // e.g. "Brasil"
  flag: string; // e.g. "🇧🇷"
  mask: string; // placeholder/mask
}

export const POPULAR_DDIS: DDICountry[] = [
  { code: '+55', country: 'Brasil', flag: '🇧🇷', mask: '(85) 99999-9999' },
  { code: '+1', country: 'Estados Unidos / Canadá', flag: '🇺🇸', mask: '(555) 000-0000' },
  { code: '+351', country: 'Portugal', flag: '🇵🇹', mask: '912 345 678' },
  { code: '+34', country: 'Espanha', flag: '🇪🇸', mask: '612 34 56 78' },
  { code: '+54', country: 'Argentina', flag: '🇦🇷', mask: '11 1234-5678' },
  { code: '+598', country: 'Uruguai', flag: '🇺🇾', mask: '99 123 456' },
  { code: '+595', country: 'Paraguai', flag: '🇵🇾', mask: '981 123456' },
  { code: '+56', country: 'Chile', flag: '🇨🇱', mask: '9 1234 5678' },
  { code: '+57', country: 'Colômbia', flag: '🇨🇴', mask: '300 1234567' },
  { code: '+52', country: 'México', flag: '🇲🇽', mask: '55 1234 5678' },
  { code: '+44', country: 'Reino Unido', flag: '🇬🇧', mask: '7123 456789' },
  { code: '+33', country: 'França', flag: '🇫🇷', mask: '6 12 34 56 78' },
  { code: '+39', country: 'Itália', flag: '🇮🇹', mask: '312 345 6789' },
  { code: '+49', country: 'Alemanha', flag: '🇩🇪', mask: '151 12345678' },
];

interface PhoneInputWithDDIProps {
  value: string;
  onChange: (val: string) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
  id?: string;
  disabled?: boolean;
}

// Format local Brazilian digits into (XX) XXXXX-XXXX
export function formatLocalNumberBR(digits: string): string {
  const clean = digits.replace(/\D/g, '');
  if (clean.length === 0) return '';
  if (clean.length <= 2) return `(${clean}`;
  if (clean.length <= 6) return `(${clean.slice(0, 2)}) ${clean.slice(2)}`;
  if (clean.length <= 10) return `(${clean.slice(0, 2)}) ${clean.slice(2, 6)}-${clean.slice(6)}`;
  return `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7, 11)}`;
}

// Helper to format any stored string with DDI for display
export function formatPhoneWithDDI(rawPhone: string): string {
  if (!rawPhone) return '';
  const trimmed = rawPhone.trim();
  if (trimmed.startsWith('+')) return trimmed;

  const cleanDigits = trimmed.replace(/\D/g, '');
  if (cleanDigits.startsWith('55') && cleanDigits.length >= 12) {
    const local = cleanDigits.slice(2);
    return `+55 ${formatLocalNumberBR(local)}`;
  }

  if (cleanDigits.length >= 10 && cleanDigits.length <= 11) {
    return `+55 ${formatLocalNumberBR(cleanDigits)}`;
  }

  return rawPhone;
}

export const PhoneInputWithDDI: React.FC<PhoneInputWithDDIProps> = ({
  value = '',
  onChange,
  label,
  placeholder,
  required = false,
  className = '',
  id,
  disabled = false,
}) => {
  // Parse initial DDI and number
  const parseValue = (raw: string) => {
    let selectedDDI = '+55';
    let localNum = raw || '';

    const matchedDDI = POPULAR_DDIS.find(d => raw.startsWith(d.code));
    if (matchedDDI) {
      selectedDDI = matchedDDI.code;
      localNum = raw.slice(matchedDDI.code.length).trim();
    } else if (raw.startsWith('+')) {
      const parts = raw.split(' ');
      selectedDDI = parts[0];
      localNum = parts.slice(1).join(' ');
    } else if (raw.replace(/\D/g, '').startsWith('55') && raw.replace(/\D/g, '').length >= 12) {
      selectedDDI = '+55';
      const clean = raw.replace(/\D/g, '').slice(2);
      localNum = formatLocalNumberBR(clean);
    } else if (raw) {
      selectedDDI = '+55';
      localNum = formatLocalNumberBR(raw);
    }

    return { selectedDDI, localNum };
  };

  const parsed = parseValue(value);
  const [ddi, setDdi] = useState<string>(parsed.selectedDDI);
  const [localNumber, setLocalNumber] = useState<string>(parsed.localNum);

  useEffect(() => {
    const updated = parseValue(value);
    setDdi(updated.selectedDDI);
    setLocalNumber(updated.localNum);
  }, [value]);

  const handleDdiChange = (newDdi: string) => {
    setDdi(newDdi);
    emitChange(newDdi, localNumber);
  };

  const handleLocalNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputVal = e.target.value;
    if (ddi === '+55') {
      inputVal = formatLocalNumberBR(inputVal);
    }
    setLocalNumber(inputVal);
    emitChange(ddi, inputVal);
  };

  const emitChange = (currentDdi: string, currentLocal: string) => {
    if (!currentLocal.trim()) {
      onChange('');
      return;
    }
    onChange(`${currentDdi} ${currentLocal}`.trim());
  };

  const activeCountry = POPULAR_DDIS.find(c => c.code === ddi) || {
    code: ddi,
    country: 'Internacional',
    flag: '🌐',
    mask: 'Número com DDI',
  };

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label htmlFor={id} className="block text-xs font-bold text-[#5a5a40] uppercase tracking-wider flex items-center gap-1.5">
          <Phone className="w-3.5 h-3.5 text-[#d4a373]" />
          {label}
        </label>
      )}

      <div className="flex items-center rounded-xl border border-gray-300 bg-white overflow-hidden focus-within:ring-2 focus-within:ring-[#5a5a40] transition shadow-2xs">
        {/* DDI Dropdown Selector */}
        <div className="relative border-r border-gray-200 bg-[#fbfbf9] hover:bg-[#f0f0e8] transition shrink-0">
          <div className="flex items-center gap-1 px-2.5 py-2 text-xs font-bold text-[#2c2c2c] cursor-pointer">
            <span className="text-base leading-none">{activeCountry.flag}</span>
            <span className="font-mono text-xs">{ddi}</span>
            <ChevronDown className="w-3 h-3 text-gray-500 ml-0.5" />
          </div>
          <select
            value={ddi}
            disabled={disabled}
            onChange={(e) => handleDdiChange(e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer text-xs"
            title="Selecionar Código Internacional DDI"
          >
            {POPULAR_DDIS.map((item) => (
              <option key={item.code} value={item.code}>
                {item.flag} {item.code} ({item.country})
              </option>
            ))}
          </select>
        </div>

        {/* Local Number Input */}
        <input
          id={id}
          type="tel"
          disabled={disabled}
          required={required}
          value={localNumber}
          onChange={handleLocalNumberChange}
          placeholder={placeholder || activeCountry.mask}
          className="w-full bg-transparent px-3 py-2 text-xs text-gray-900 focus:outline-none placeholder-gray-400 font-mono"
        />
      </div>
    </div>
  );
};
