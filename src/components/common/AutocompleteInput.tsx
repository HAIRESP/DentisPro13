import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Sparkles } from 'lucide-react';

interface AutocompleteInputProps {
  value: string;
  onChange: (val: string) => void;
  onSelectSuggestion?: (item: { name: string; category?: string; unitCost?: number; supplier?: string; unit?: string }) => void;
  suggestions: Array<{ label: string; subLabel?: string; data?: any }>;
  placeholder?: string;
  className?: string;
  required?: boolean;
  type?: string;
}

export const AutocompleteInput: React.FC<AutocompleteInputProps> = ({
  value,
  onChange,
  onSelectSuggestion,
  suggestions,
  placeholder = 'Digite para buscar ou cadastrar...',
  className = '',
  required = false,
  type = 'text'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = suggestions.filter(s => 
    s.label.toLowerCase().includes((value || '').toLowerCase()) ||
    (s.subLabel && s.subLabel.toLowerCase().includes((value || '').toLowerCase()))
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={containerRef}>
      <div className="relative flex items-center">
        <input
          type={type}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className={`w-full bg-[#fbfbf9] border border-[#e5e5d1] rounded-2xl px-3.5 py-2.5 text-xs text-[#2c2c2c] focus:outline-none focus:border-[#5a5a40] font-medium pr-8 ${className}`}
          required={required}
        />
        <div className="absolute right-2.5 flex items-center gap-1 text-gray-400 pointer-events-none">
          <Sparkles className="w-3.5 h-3.5 text-[#d4a373]" />
          <ChevronDown className="w-3.5 h-3.5" />
        </div>
      </div>

      {isOpen && filtered.length > 0 && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-[#e5e5d1] rounded-2xl shadow-xl max-h-60 overflow-y-auto p-1.5 animate-fadeIn">
          <div className="px-2 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center justify-between">
            <span>Sugestões (Banco de Dados & Catálogo Dental)</span>
            <span>{filtered.length} opções</span>
          </div>
          {filtered.map((s, idx) => (
            <button
              type="button"
              key={idx}
              onClick={() => {
                onChange(s.label);
                if (onSelectSuggestion && s.data) {
                  onSelectSuggestion(s.data);
                }
                setIsOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#f5f5ee] transition flex flex-col gap-0.5 group"
            >
              <div className="text-xs font-bold text-[#2c3e2e] group-hover:text-[#1b281d]">
                {s.label}
              </div>
              {s.subLabel && (
                <div className="text-[10px] text-gray-500 font-normal">
                  {s.subLabel}
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
