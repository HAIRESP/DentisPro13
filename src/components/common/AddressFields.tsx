import React, { useState } from 'react';
import { MapPin, Search, Loader2, CheckCircle2, Navigation } from 'lucide-react';
import { formatCEP } from '../../utils/formatters';

export interface AddressData {
  cep: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
}

interface AddressFieldsProps {
  address: AddressData;
  onChange: (updated: AddressData) => void;
  compact?: boolean;
  className?: string;
  theme?: 'green' | 'olive' | 'neutral';
}

export const AddressFields: React.FC<AddressFieldsProps> = ({
  address,
  onChange,
  compact = false,
  className = '',
  theme = 'olive'
}) => {
  const [loading, setLoading] = useState(false);
  const [cepSuccess, setCepSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Clean numeric CEP with format 00.000-00 (or 00.000-000)
  const formatCep = (val: string) => formatCEP(val);

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCep(e.target.value);
    onChange({ ...address, cep: formatted });
    setCepSuccess(false);
    setErrorMsg('');

    // If 8 digits completed, auto-trigger CEP lookup
    const rawNums = formatted.replace(/\D/g, '');
    if (rawNums.length === 8) {
      lookupCep(rawNums);
    }
  };

  const lookupCep = async (rawCep?: string) => {
    const cepToFetch = (rawCep || address.cep).replace(/\D/g, '');
    if (cepToFetch.length !== 8) {
      setErrorMsg('Digite um CEP válido com 8 dígitos.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setCepSuccess(false);

    try {
      // 1. Fetch via ViaCEP for ultra-fast, accurate Brazilian postal data
      const response = await fetch(`https://viacep.com.br/ws/${cepToFetch}/json/`);
      const data = await response.json();

      if (data.erro) {
        setErrorMsg('CEP não encontrado. Preencha os campos manualmente.');
        setLoading(false);
        return;
      }

      // Clean city name to ensure only the city name appears (e.g., FORTALEZA)
      const rawCity = data.localidade || address.city || '';
      const cleanCity = rawCity.split('/')[0].split('-')[0].trim().toUpperCase();

      onChange({
        ...address,
        cep: formatCep(cepToFetch),
        street: data.logradouro || address.street,
        neighborhood: data.bairro || address.neighborhood,
        city: cleanCity,
        state: (data.uf || address.state || '').toUpperCase(),
      });

      setCepSuccess(true);
      setTimeout(() => setCepSuccess(false), 3000);
    } catch (err) {
      console.error('Erro na consulta de CEP:', err);
      setErrorMsg('Falha ao conectar com serviço de CEP. Preencha manualmente.');
    } finally {
      setLoading(false);
    }
  };

  // Color classes based on theme
  const focusBorderClass = 
    theme === 'green' ? 'focus:border-[#075e54] focus:ring-[#075e54]/20' :
    theme === 'olive' ? 'focus:border-[#5a5a40] focus:ring-[#5a5a40]/20' :
    'focus:border-blue-500 focus:ring-blue-500/20';

  const badgeBgClass =
    theme === 'green' ? 'bg-emerald-100 text-[#075e54]' :
    theme === 'olive' ? 'bg-[#f0f0e8] text-[#5a5a40]' :
    'bg-blue-100 text-blue-800';

  const buttonBgClass =
    theme === 'green' ? 'bg-[#075e54] hover:bg-[#128c7e] text-white' :
    theme === 'olive' ? 'bg-[#5a5a40] hover:bg-[#4a4a35] text-white' :
    'bg-blue-600 hover:bg-blue-700 text-white';

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Top Banner with CEP Search */}
      <div className="bg-[#fcfbf9] p-3 rounded-2xl border border-gray-200 space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#d4a373]" />
            Busca Automática de Endereço via CEP
          </label>
          {cepSuccess && (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${badgeBgClass}`}>
              <CheckCircle2 className="w-3 h-3" /> Endereço Localizado
            </span>
          )}
        </div>

        <div className="relative">
          <input
            type="text"
            value={address.cep}
            onChange={handleCepChange}
            onBlur={() => {
              const raw = address.cep.replace(/\D/g, '');
              if (raw.length === 8 && !cepSuccess) lookupCep(raw);
            }}
            placeholder="00.000-00 (ex: 60.160-110)"
            maxLength={10}
            className={`w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs font-mono text-gray-900 focus:outline-none focus:ring-2 ${focusBorderClass}`}
          />
          {loading ? (
            <Loader2 className="w-4 h-4 text-[#5a5a40] animate-spin absolute right-3 top-2.5" />
          ) : (
            <Search className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-3 pointer-events-none" />
          )}
        </div>

        {errorMsg && (
          <p className="text-[10px] font-semibold text-rose-600 pl-1">{errorMsg}</p>
        )}
      </div>

      {/* Structured Address Breakdown Fields */}
      <div className={`grid grid-cols-1 ${compact ? 'sm:grid-cols-2' : 'sm:grid-cols-12'} gap-2.5`}>
        {/* Endereço / Rua */}
        <div className={compact ? 'sm:col-span-2' : 'sm:col-span-7'}>
          <label className="block text-[10px] font-bold uppercase text-gray-700 mb-0.5">
            Endereço (Logradouro / Rua) *
          </label>
          <input
            type="text"
            value={address.street}
            onChange={(e) => onChange({ ...address, street: e.target.value })}
            placeholder="Ex: Av. Paulista, Rua Oscar Freire..."
            className={`w-full bg-white border border-gray-300 rounded-xl px-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:ring-2 ${focusBorderClass}`}
          />
        </div>

        {/* Número */}
        <div className={compact ? 'sm:col-span-1' : 'sm:col-span-2'}>
          <label className="block text-[10px] font-bold uppercase text-gray-700 mb-0.5">
            Número *
          </label>
          <input
            type="text"
            value={address.number}
            onChange={(e) => onChange({ ...address, number: e.target.value })}
            placeholder="Ex: 1000, S/N"
            className={`w-full bg-white border border-gray-300 rounded-xl px-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:ring-2 ${focusBorderClass}`}
          />
        </div>

        {/* Complemento */}
        <div className={compact ? 'sm:col-span-1' : 'sm:col-span-3'}>
          <label className="block text-[10px] font-bold uppercase text-gray-700 mb-0.5">
            Complemento
          </label>
          <input
            type="text"
            value={address.complement}
            onChange={(e) => onChange({ ...address, complement: e.target.value })}
            placeholder="Ex: Apt 42, Sala 10..."
            className={`w-full bg-white border border-gray-300 rounded-xl px-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:ring-2 ${focusBorderClass}`}
          />
        </div>

        {/* Bairro */}
        <div className={compact ? 'sm:col-span-1' : 'sm:col-span-5'}>
          <label className="block text-[10px] font-bold uppercase text-gray-700 mb-0.5">
            Bairro (Auto via CEP)
          </label>
          <input
            type="text"
            value={address.neighborhood}
            onChange={(e) => onChange({ ...address, neighborhood: e.target.value })}
            placeholder="Ex: Bela Vista, Jardins..."
            className={`w-full bg-white border border-gray-300 rounded-xl px-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:ring-2 ${focusBorderClass}`}
          />
        </div>

        {/* Cidade */}
        <div className={compact ? 'sm:col-span-1' : 'sm:col-span-5'}>
          <label className="block text-[10px] font-bold uppercase text-gray-700 mb-0.5">
            Cidade (Auto via CEP)
          </label>
          <input
            type="text"
            value={address.city ? address.city.split('/')[0].split('-')[0].trim().toUpperCase() : ''}
            onChange={(e) => onChange({ ...address, city: e.target.value.toUpperCase() })}
            placeholder="Ex: FORTALEZA"
            className={`w-full bg-white border border-gray-300 rounded-xl px-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:ring-2 ${focusBorderClass}`}
          />
        </div>

        {/* Estado / UF */}
        <div className={compact ? 'sm:col-span-2' : 'sm:col-span-2'}>
          <label className="block text-[10px] font-bold uppercase text-gray-700 mb-0.5">
            UF / Estado
          </label>
          <input
            type="text"
            value={address.state}
            onChange={(e) => onChange({ ...address, state: e.target.value.toUpperCase() })}
            placeholder="Ex: SP"
            maxLength={2}
            className={`w-full bg-white border border-gray-300 rounded-xl px-3 py-1.5 text-xs uppercase font-mono text-gray-900 focus:outline-none focus:ring-2 ${focusBorderClass}`}
          />
        </div>
      </div>
    </div>
  );
};

export const formatFullAddress = (addr: Partial<AddressData> | string): string => {
  if (typeof addr === 'string') return addr;
  if (!addr) return '';

  const parts = [];
  if (addr.street) {
    let streetPart = addr.street;
    if (addr.number) streetPart += `, ${addr.number}`;
    if (addr.complement) streetPart += ` (${addr.complement})`;
    parts.push(streetPart);
  }

  if (addr.neighborhood) parts.push(addr.neighborhood);

  let cityState = '';
  if (addr.city) cityState += addr.city;
  if (addr.state) cityState += (cityState ? ' - ' : '') + addr.state;
  if (cityState) parts.push(cityState);

  if (addr.cep) parts.push(`CEP ${addr.cep}`);

  return parts.join(' - ');
};
