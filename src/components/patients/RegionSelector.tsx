import React, { useState } from 'react';
import { REGION_LEGENDS, RegionInfo, getRegionByCode, getRegionsForTooth } from '../../data/regionData';
import { Layers, ChevronDown, ShieldCheck, Check, Sparkles, Info } from 'lucide-react';

interface RegionSelectorProps {
  selectedRegionCode?: string;
  selectedToothNumber?: number;
  onSelectRegion: (code: string, description: string, category: string, teeth?: number[]) => void;
  onSelectTooth?: (toothNumber?: number) => void;
  allowedRegions?: string[];
  regionRulesNote?: string;
  procedureName?: string;
}

export const RegionSelector: React.FC<RegionSelectorProps> = ({
  selectedRegionCode,
  selectedToothNumber,
  onSelectRegion,
  onSelectTooth,
  allowedRegions,
  regionRulesNote,
  procedureName
}) => {
  const [activeCategory, setActiveCategory] = useState<string>(allowedRegions && allowedRegions.length > 0 ? 'permitidas' : 'dente');
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const categories = [
    ...(allowedRegions && allowedRegions.length > 0 ? [{ id: 'permitidas', label: '⭐ Regiões Autorizadas' }] : []),
    { id: 'dente', label: '🦷 Dente Específico' },
    { id: 'Tecido Duro', label: '🦴 Tecido Duro (Arcadas / Hemi)' },
    { id: 'Periodontia', label: '📊 Periodontia (Sextantes)' },
    { id: 'Tecido Mole', label: '👄 Tecido Mole' },
    { id: 'Radiografia Periapical', label: '📷 Periapical' },
    { id: 'Radiografia Interproximal', label: '🎞️ Interproximal' },
  ];

  const allowedRegionInfos = (allowedRegions || [])
    .map(code => getRegionByCode(code))
    .filter((r): r is RegionInfo => r !== undefined);

  const filteredRegions = activeCategory === 'permitidas'
    ? allowedRegionInfos
    : REGION_LEGENDS.filter(r => r.category === activeCategory);

  const currentRegion = selectedRegionCode ? getRegionByCode(selectedRegionCode) : undefined;
  
  // Teeth correlated to selected tooth if any
  const correlatedRegionsForTooth = selectedToothNumber ? getRegionsForTooth(selectedToothNumber) : [];

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-[#5a5a40] flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-[#d4a373]" />
          Região / Dente do Procedimento
        </label>
        {selectedToothNumber && (
          <span className="text-[11px] text-[#2d6a4f] bg-[#e8f5e9] px-2 py-0.5 rounded font-medium">
            Dente selecionado: #{selectedToothNumber}
          </span>
        )}
      </div>

      {/* QUICK CHIPS FOR ALLOWED REGIONS (ASAI, AS, AI, HASD, HASE, HAIE, HAID, etc.) */}
      {allowedRegions && allowedRegions.length > 0 && (
        <div className="bg-[#f0f7f4] border border-emerald-200 p-2.5 rounded-xl space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Regiões Autorizadas para este Procedimento:
            </span>
            <span className="text-[9px] bg-emerald-200 text-emerald-800 px-1.5 py-0.2 rounded font-mono font-bold">
              {allowedRegions.length} Opções
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {allowedRegions.map(code => {
              const regInfo = getRegionByCode(code);
              const isSelected = selectedRegionCode?.toUpperCase() === code.toUpperCase();

              return (
                <button
                  key={code}
                  type="button"
                  onClick={() => {
                    const reg = getRegionByCode(code);
                    onSelectRegion(
                      code,
                      reg ? reg.name : code,
                      reg ? reg.category : 'Região Autorizada',
                      reg ? reg.teeth : []
                    );
                  }}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition cursor-pointer flex items-center gap-1 ${
                    isSelected
                      ? 'bg-[#075e54] text-white border-[#075e54] shadow-xs'
                      : 'bg-white text-emerald-900 border-emerald-300 hover:bg-emerald-100 hover:border-emerald-400'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 text-white shrink-0" />}
                  <span>{code}</span>
                  {regInfo && <span className="text-[9px] opacity-80 font-normal">({regInfo.name.split(' ')[0]})</span>}
                </button>
              );
            })}
          </div>

          {regionRulesNote && (
            <p className="text-[10px] text-emerald-800 mt-1 flex items-start gap-1 font-medium bg-emerald-100/60 p-1.5 rounded-lg">
              <Info className="w-3 h-3 text-emerald-700 shrink-0 mt-0.5" />
              <span>{regionRulesNote}</span>
            </p>
          )}
        </div>
      )}

      {/* Selected summary button */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between p-2.5 bg-white border border-[#e5e5d1] rounded-lg text-left text-xs font-medium text-gray-800 hover:border-[#d4a373] transition-colors shadow-sm cursor-pointer"
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <Layers className="w-4 h-4 text-[#d4a373] shrink-0" />
            <span className="truncate">
              {currentRegion ? (
                <>
                  <span className="font-bold text-[#2c3e2e] mr-1">[{currentRegion.code}]</span>
                  <span>{currentRegion.name}</span>
                  {currentRegion.teeth.length > 0 && (
                    <span className="text-gray-400 font-mono text-[10px] ml-1">
                      ({currentRegion.teeth.join('/')})
                    </span>
                  )}
                </>
              ) : selectedRegionCode ? (
                <span className="font-bold text-[#2c3e2e]">{selectedRegionCode}</span>
              ) : selectedToothNumber ? (
                `Dente #${selectedToothNumber}`
              ) : (
                <span className="text-gray-400">Clique para selecionar Região ou Dente...</span>
              )}
            </span>
          </div>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-[#e5e5d1] rounded-xl shadow-xl overflow-hidden p-3 space-y-3">
            {/* Category Tabs */}
            <div className="flex flex-wrap gap-1 border-b border-[#f0f0e4] pb-2">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors cursor-pointer ${
                    activeCategory === cat.id
                      ? 'bg-[#2c3e2e] text-white font-bold'
                      : 'bg-[#f4f4eb] text-[#5a5a40] hover:bg-[#e8e8db]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Content per Category */}
            {activeCategory === 'dente' ? (
              <div className="space-y-2">
                <p className="text-[11px] text-gray-500">Selecione o número do dente FDI (11 a 48, 51 a 85):</p>
                <div className="grid grid-cols-8 gap-1 max-h-48 overflow-y-auto p-1 bg-[#f9f9f6] rounded-lg">
                  {[
                    // Upper Quadrants
                    18,17,16,15,14,13,12,11,
                    21,22,23,24,25,26,27,28,
                    // Lower Quadrants
                    48,47,46,45,44,43,42,41,
                    31,32,33,34,35,36,37,38,
                    // Deciduous
                    55,54,53,52,51,61,62,63,64,65,
                    85,84,83,82,81,71,72,73,74,75
                  ].map(num => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => {
                        if (onSelectTooth) onSelectTooth(num);
                        onSelectRegion(`Dente ${num}`, `Dente ${num}`, 'Dente', [num]);
                        setIsOpen(false);
                      }}
                      className={`p-1.5 text-[11px] font-mono font-bold rounded text-center transition-all cursor-pointer ${
                        selectedToothNumber === num
                          ? 'bg-[#d4a373] text-white shadow'
                          : 'bg-white border border-[#e5e5d1] text-gray-700 hover:bg-[#e8f5e9]'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="max-h-52 overflow-y-auto space-y-1 p-1">
                {filteredRegions.length === 0 ? (
                  <p className="text-xs text-gray-400 p-2 text-center">Nenhuma região encontrada nesta categoria.</p>
                ) : (
                  filteredRegions.map(reg => (
                    <button
                      key={reg.code}
                      type="button"
                      onClick={() => {
                        onSelectRegion(reg.code, reg.name, reg.category, reg.teeth);
                        setIsOpen(false);
                      }}
                      className={`w-full text-left p-2 rounded-lg text-xs flex items-center justify-between border transition-all cursor-pointer ${
                        selectedRegionCode?.toUpperCase() === reg.code.toUpperCase()
                          ? 'bg-[#e8f5e9] border-[#2d6a4f] text-[#2d6a4f] font-bold'
                          : 'bg-white border-[#e5e5d1] hover:bg-[#f9f9f4] text-gray-700'
                      }`}
                    >
                      <div>
                        <span className="font-bold mr-2 text-[#2c3e2e]">[{reg.code}]</span>
                        <span>{reg.name}</span>
                      </div>
                      {reg.teeth.length > 0 && (
                        <span className="text-[10px] font-mono bg-[#f0f0e4] px-1.5 py-0.5 rounded text-gray-600">
                          Dentes: {reg.teeth.join('/')}
                        </span>
                      )}
                    </button>
                  ))
                )}
              </div>
            )}

            {/* Quick Correlations if tooth is selected */}
            {correlatedRegionsForTooth.length > 0 && (
              <div className="border-t border-[#f0f0e4] pt-2">
                <span className="text-[10px] font-bold text-[#5a5a40] block mb-1">
                  Regiões Correlacionadas ao Dente #{selectedToothNumber}:
                </span>
                <div className="flex flex-wrap gap-1">
                  {correlatedRegionsForTooth.map(reg => (
                    <button
                      key={reg.code}
                      type="button"
                      onClick={() => {
                        onSelectRegion(reg.code, reg.name, reg.category, reg.teeth);
                        setIsOpen(false);
                      }}
                      className="text-[10px] bg-[#fdfaf6] border border-[#e5e5d1] hover:border-[#d4a373] px-2 py-0.5 rounded text-[#2c3e2e] font-mono cursor-pointer"
                    >
                      {reg.code} ({reg.name})
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
