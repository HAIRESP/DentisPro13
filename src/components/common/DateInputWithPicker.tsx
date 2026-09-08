import React, { useState, useEffect, useRef } from 'react';
import { Calendar } from 'lucide-react';

interface DateInputWithPickerProps {
  value?: string; // Expects 'YYYY-MM-DD' or 'DD/MM/YYYY'
  onChange: (isoValue: string) => void; // Emits 'YYYY-MM-DD'
  className?: string;
  required?: boolean;
  id?: string;
  name?: string;
  placeholder?: string;
  autoFocus?: boolean;
  disabled?: boolean;
}

// Convert ISO (YYYY-MM-DD) or other representations to Brazilian display (DD/MM/AAAA)
function toDisplayDate(val?: string): string {
  if (!val) return '';
  const clean = val.trim();
  if (clean.includes('-')) {
    const parts = clean.split('-');
    if (parts.length === 3 && parts[0].length === 4) {
      // YYYY-MM-DD -> DD/MM/YYYY
      const [y, m, d] = parts;
      return `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
    }
  }
  if (clean.includes('/')) {
    const parts = clean.split('/');
    if (parts.length === 3) {
      const [d, m, y] = parts;
      return `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
    }
  }
  return clean;
}

// Convert display date (DD/MM/AAAA) or raw pasted date to ISO (YYYY-MM-DD)
function parseToIso(text: string): string | null {
  if (!text) return null;
  const clean = text.trim();

  // Pattern 1: YYYY-MM-DD
  const isoMatch = clean.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
  if (isoMatch) {
    const y = parseInt(isoMatch[1], 10);
    const m = parseInt(isoMatch[2], 10);
    const d = parseInt(isoMatch[3], 10);
    if (y >= 1900 && y <= 2100 && m >= 1 && m <= 12 && d >= 1 && d <= 31) {
      return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    }
  }

  // Pattern 2: DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY
  const brMatch = clean.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (brMatch) {
    const d = parseInt(brMatch[1], 10);
    const m = parseInt(brMatch[2], 10);
    const y = parseInt(brMatch[3], 10);
    if (y >= 1900 && y <= 2100 && m >= 1 && m <= 12 && d >= 1 && d <= 31) {
      return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    }
  }

  // Pattern 3: 8 raw digits (DDMMYYYY or YYYYMMDD)
  const digits = clean.replace(/\D/g, '');
  if (digits.length === 8) {
    // If starts with 19XX or 20XX, might be YYYYMMDD
    const firstFour = parseInt(digits.slice(0, 4), 10);
    if (firstFour >= 1900 && firstFour <= 2100) {
      const y = firstFour;
      const m = parseInt(digits.slice(4, 6), 10);
      const d = parseInt(digits.slice(6, 8), 10);
      if (m >= 1 && m <= 12 && d >= 1 && d <= 31) {
        return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      }
    }
    // Default to DDMMYYYY
    const d = parseInt(digits.slice(0, 2), 10);
    const m = parseInt(digits.slice(2, 4), 10);
    const y = parseInt(digits.slice(4, 8), 10);
    if (y >= 1900 && y <= 2100 && m >= 1 && m <= 12 && d >= 1 && d <= 31) {
      return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    }
  }

  return null;
}

export const DateInputWithPicker: React.FC<DateInputWithPickerProps> = ({
  value,
  onChange,
  className = '',
  required = false,
  id,
  name,
  placeholder = 'DD/MM/AAAA',
  autoFocus = false,
  disabled = false
}) => {
  const [displayValue, setDisplayValue] = useState<string>(() => toDisplayDate(value));
  const hiddenDateInputRef = useRef<HTMLInputElement>(null);
  const textInputRef = useRef<HTMLInputElement>(null);

  // Sync from prop changes (e.g. modal opened with existing patient data)
  useEffect(() => {
    const formatted = toDisplayDate(value);
    setDisplayValue(formatted);
  }, [value]);

  // Handle typing with progressive masking
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputVal = e.target.value;

    // Allow user to completely delete with Backspace or Ctrl+A + Delete
    if (!inputVal.trim()) {
      setDisplayValue('');
      onChange('');
      return;
    }

    // Only allow numbers and slashes
    const rawNums = inputVal.replace(/\D/g, '').slice(0, 8);
    let masked = '';
    if (rawNums.length > 0) {
      masked = rawNums.slice(0, 2);
    }
    if (rawNums.length >= 3) {
      masked += '/' + rawNums.slice(2, 4);
    }
    if (rawNums.length >= 5) {
      masked += '/' + rawNums.slice(4, 8);
    }

    setDisplayValue(masked);

    // If fully typed (DD/MM/AAAA), validate and propagate ISO
    if (rawNums.length === 8) {
      const iso = parseToIso(masked);
      if (iso) {
        onChange(iso);
      }
    } else {
      // Incomplete typing: emit empty or partial
      onChange('');
    }
  };

  // Handle Pasting full date (supports DD/MM/YYYY, YYYY-MM-DD, DDMMYYYY, etc.)
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    if (!pastedText) return;

    const iso = parseToIso(pastedText);
    if (iso) {
      const display = toDisplayDate(iso);
      setDisplayValue(display);
      onChange(iso);
    } else {
      // If unable to parse strictly as ISO, extract digits and apply mask
      const digits = pastedText.replace(/\D/g, '').slice(0, 8);
      let masked = '';
      if (digits.length > 0) masked = digits.slice(0, 2);
      if (digits.length >= 3) masked += '/' + digits.slice(2, 4);
      if (digits.length >= 5) masked += '/' + digits.slice(4, 8);

      setDisplayValue(masked);
      const parsedIso = parseToIso(masked);
      if (parsedIso) {
        onChange(parsedIso);
      }
    }
  };

  // Handle native calendar picker selection
  const handleNativeDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawIso = e.target.value; // 'YYYY-MM-DD'
    if (rawIso) {
      const display = toDisplayDate(rawIso);
      setDisplayValue(display);
      onChange(rawIso);
    }
  };

  const openCalendarPicker = () => {
    if (hiddenDateInputRef.current) {
      if (typeof (hiddenDateInputRef.current as any).showPicker === 'function') {
        try {
          (hiddenDateInputRef.current as any).showPicker();
        } catch {
          hiddenDateInputRef.current.focus();
        }
      } else {
        hiddenDateInputRef.current.focus();
        hiddenDateInputRef.current.click();
      }
    }
  };

  // Get ISO value for the hidden picker
  const currentIso = parseToIso(displayValue) || (value?.includes('-') ? value : '');

  return (
    <div className="relative flex items-center w-full">
      <input
        ref={textInputRef}
        type="text"
        id={id}
        name={name}
        required={required}
        disabled={disabled}
        autoFocus={autoFocus}
        placeholder={placeholder}
        value={displayValue}
        onChange={handleInputChange}
        onPaste={handlePaste}
        maxLength={10}
        inputMode="numeric"
        autoComplete="bday"
        className={`w-full pr-9 select-all ${className}`}
        title="Digite ou cole a data de nascimento completa (DD/MM/AAAA ou YYYY-MM-DD)"
      />

      {/* Button to trigger native calendar modal picker */}
      <button
        type="button"
        tabIndex={-1}
        onClick={openCalendarPicker}
        disabled={disabled}
        title="Abrir calendário para selecionar a data"
        className="absolute right-2.5 p-1 text-stone-400 hover:text-stone-700 transition cursor-pointer flex items-center justify-center rounded-lg hover:bg-stone-100"
      >
        <Calendar className="w-4 h-4" />
      </button>

      {/* Hidden native date input synchronized for calendar popup support */}
      <input
        ref={hiddenDateInputRef}
        type="date"
        tabIndex={-1}
        aria-hidden="true"
        value={currentIso}
        onChange={handleNativeDateChange}
        className="sr-only pointer-events-none"
      />
    </div>
  );
};
