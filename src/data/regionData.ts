export interface RegionInfo {
  code: string;
  name: string;
  category: 'Radiografia Periapical' | 'Radiografia Interproximal' | 'Tecido Mole' | 'Tecido Duro' | 'Periodontia';
  teeth: number[]; // Correlated FDI tooth numbers
  description?: string;
}

export interface ToothInfo {
  number: number;
  name: string;
  isDeciduous?: boolean;
}

export const TOOTH_DICTIONARY: ToothInfo[] = [
  // Permanentes
  { number: 11, name: 'Incisivo Central Superior Direito' },
  { number: 12, name: 'Incisivo Lateral Superior Direito' },
  { number: 13, name: 'Canino Superior Direito' },
  { number: 14, name: 'Primeiro Pré-Molar Superior Direito' },
  { number: 15, name: 'Segundo Pré-Molar Superior Direito' },
  { number: 16, name: 'Primeiro Molar Superior Direito' },
  { number: 17, name: 'Segundo Molar Superior Direito' },
  { number: 18, name: 'Terceiro Molar Superior Direito' },
  { number: 21, name: 'Incisivo Central Superior Esquerdo' },
  { number: 22, name: 'Incisivo Lateral Superior Esquerdo' },
  { number: 23, name: 'Canino Superior Esquerdo' },
  { number: 24, name: 'Primeiro Pré-Molar Superior Esquerdo' },
  { number: 25, name: 'Segundo Pré-Molar Superior Esquerdo' },
  { number: 26, name: 'Primeiro Molar Superior Esquerdo' },
  { number: 27, name: 'Segundo Molar Superior Esquerdo' },
  { number: 28, name: 'Terceiro Molar Superior Esquerdo' },
  { number: 31, name: 'Incisivo Central Inferior Esquerdo' },
  { number: 32, name: 'Incisivo Lateral Inferior Esquerdo' },
  { number: 33, name: 'Canino Inferior Esquerdo' },
  { number: 34, name: 'Primeiro Pré-Molar Inferior Esquerdo' },
  { number: 35, name: 'Segundo Pré-Molar Inferior Esquerdo' },
  { number: 36, name: 'Primeiro Molar Inferior Esquerdo' },
  { number: 37, name: 'Segundo Molar Inferior Esquerdo' },
  { number: 38, name: 'Terceiro Molar Inferior Esquerdo' },
  { number: 41, name: 'Incisivo Central Inferior Direito' },
  { number: 42, name: 'Incisivo Lateral Inferior Direito' },
  { number: 43, name: 'Canino Inferior Direito' },
  { number: 44, name: 'Primeiro Pré-Molar Inferior Direito' },
  { number: 45, name: 'Segundo Pré-Molar Inferior Direito' },
  { number: 46, name: 'Primeiro Molar Inferior Direito' },
  { number: 47, name: 'Segundo Molar Inferior Direito' },
  { number: 48, name: 'Terceiro Molar Inferior Direito' },
  // Decíduos
  { number: 51, name: 'Incisivo Central Superior Direito Decíduo', isDeciduous: true },
  { number: 52, name: 'Incisivo Lateral Superior Direito Decíduo', isDeciduous: true },
  { number: 53, name: 'Canino Superior Direito Decíduo', isDeciduous: true },
  { number: 54, name: 'Primeiro Molar Superior Direito Decíduo', isDeciduous: true },
  { number: 55, name: 'Segundo Molar Superior Direito Decíduo', isDeciduous: true },
  { number: 61, name: 'Incisivo Central Superior Esquerdo Decíduo', isDeciduous: true },
  { number: 62, name: 'Incisivo Lateral Superior Esquerdo Decíduo', isDeciduous: true },
  { number: 63, name: 'Canino Superior Esquerdo Decíduo', isDeciduous: true },
  { number: 64, name: 'Primeiro Molar Superior Esquerdo Decíduo', isDeciduous: true },
  { number: 65, name: 'Segundo Molar Superior Esquerdo Decíduo', isDeciduous: true },
  { number: 71, name: 'Incisivo Central Inferior Esquerdo Decíduo', isDeciduous: true },
  { number: 72, name: 'Incisivo Lateral Inferior Esquerdo Decíduo', isDeciduous: true },
  { number: 73, name: 'Canino Inferior Esquerdo Decíduo', isDeciduous: true },
  { number: 74, name: 'Primeiro Molar Inferior Esquerdo Decíduo', isDeciduous: true },
  { number: 75, name: 'Segundo Molar Inferior Esquerdo Decíduo', isDeciduous: true },
  { number: 81, name: 'Incisivo Central Inferior Direito Decíduo', isDeciduous: true },
  { number: 82, name: 'Incisivo Lateral Inferior Direito Decíduo', isDeciduous: true },
  { number: 83, name: 'Canino Inferior Direito Decíduo', isDeciduous: true },
  { number: 84, name: 'Primeiro Molar Inferior Direito Decíduo', isDeciduous: true },
  { number: 85, name: 'Segundo Molar Inferior Direito Decíduo', isDeciduous: true },
];

export const REGION_LEGENDS: RegionInfo[] = [
  // Radiografia Periapical
  { code: 'RMSD', name: 'Região Molar Superior Direito', category: 'Radiografia Periapical', teeth: [18, 17, 16] },
  { code: 'RPSD', name: 'Região Pré-Molar Superior Direito', category: 'Radiografia Periapical', teeth: [14, 15] },
  { code: 'RCSD', name: 'Região Canino Superior Direito', category: 'Radiografia Periapical', teeth: [13] },
  { code: 'RIS', name: 'Região Incisivo Superior', category: 'Radiografia Periapical', teeth: [12, 11, 21, 22] },
  { code: 'RCSE', name: 'Região Canino Superior Esquerdo', category: 'Radiografia Periapical', teeth: [23] },
  { code: 'RPSE', name: 'Região Pré-Molar Superior Esquerdo', category: 'Radiografia Periapical', teeth: [24, 25] },
  { code: 'RMSE', name: 'Região Molar Superior Esquerdo', category: 'Radiografia Periapical', teeth: [26, 27, 28] },
  { code: 'RMID', name: 'Região Molar Inferior Direito', category: 'Radiografia Periapical', teeth: [48, 47, 46] },
  { code: 'RPID', name: 'Região Pré-Molar Inferior Direito', category: 'Radiografia Periapical', teeth: [45, 44] },
  { code: 'RCID', name: 'Região Canino Inferior Direito', category: 'Radiografia Periapical', teeth: [43] },
  { code: 'RII', name: 'Região Incisivo Inferior', category: 'Radiografia Periapical', teeth: [42, 41, 31, 32] },
  { code: 'RCIE', name: 'Região Canino Inferior Esquerdo', category: 'Radiografia Periapical', teeth: [33] },
  { code: 'RPIE', name: 'Região Pré-Molar Inferior Esquerdo', category: 'Radiografia Periapical', teeth: [34, 35] },
  { code: 'RMIE', name: 'Região Molar Inferior Esquerdo', category: 'Radiografia Periapical', teeth: [36, 37, 38] },

  // Radiografia Interproximal
  { code: 'RMD', name: 'Região Molar Direito', category: 'Radiografia Interproximal', teeth: [18, 17, 16, 48, 47, 46] },
  { code: 'RPD', name: 'Região Pré-Molar Direito', category: 'Radiografia Interproximal', teeth: [15, 14, 45, 44] },
  { code: 'RME', name: 'Região Molar Esquerdo', category: 'Radiografia Interproximal', teeth: [28, 27, 26, 38, 37, 36] },
  { code: 'RPE', name: 'Região Pré-Molar Esquerdo', category: 'Radiografia Interproximal', teeth: [25, 24, 35, 34] },

  // Tecido Mole
  { code: 'AB', name: 'Assoalho de boca', category: 'Tecido Mole', teeth: [] },
  { code: 'ASAI', name: 'Arcadas Superiores e Inferiores (Ambas as Arcadas)', category: 'Tecido Duro', teeth: [11, 12, 13, 14, 15, 16, 17, 18, 21, 22, 23, 24, 25, 26, 27, 28, 31, 32, 33, 34, 35, 36, 37, 38, 41, 42, 43, 44, 45, 46, 47, 48] },
  { code: 'CL', name: 'Comissura labial', category: 'Tecido Mole', teeth: [] },
  { code: 'FLA', name: 'Freios labiais', category: 'Tecido Mole', teeth: [] },
  { code: 'FLI', name: 'Freio lingual', category: 'Tecido Mole', teeth: [] },
  { code: 'GI', name: 'Gengiva inserida', category: 'Tecido Mole', teeth: [] },
  { code: 'MA', name: 'Mucosa alveolar', category: 'Tecido Mole', teeth: [] },
  { code: 'MJ', name: 'Mucosa jugal', category: 'Tecido Mole', teeth: [] },
  { code: 'PA', name: 'Palato', category: 'Tecido Mole', teeth: [] },
  { code: 'PD', name: 'Palato duro', category: 'Tecido Mole', teeth: [] },
  { code: 'PI', name: 'Papila incisiva', category: 'Tecido Mole', teeth: [] },
  { code: 'PM', name: 'Palato mole', category: 'Tecido Mole', teeth: [] },
  { code: 'PP', name: 'Pregas palatinas', category: 'Tecido Mole', teeth: [] },
  { code: 'PT', name: 'Parótida', category: 'Tecido Mole', teeth: [] },
  { code: 'RM', name: 'Região retromolar', category: 'Tecido Mole', teeth: [] },
  { code: 'RP', name: 'Região palatina', category: 'Tecido Mole', teeth: [] },
  { code: 'RV', name: 'Região vestibular', category: 'Tecido Mole', teeth: [] },
  { code: 'SI', name: 'Região de Sínfise', category: 'Tecido Mole', teeth: [] },
  { code: 'SM', name: 'Região do assoalho do seio maxilar', category: 'Tecido Mole', teeth: [] },
  { code: 'TP', name: 'Tonsilas palatinas', category: 'Tecido Mole', teeth: [] },
  { code: 'TU', name: 'Região do Túber', category: 'Tecido Mole', teeth: [] },
  { code: 'UV', name: 'Úvula', category: 'Tecido Mole', teeth: [] },
  { code: 'LG', name: 'Língua', category: 'Tecido Mole', teeth: [] },
  { code: 'RSL', name: 'Região Sub-Lingual', category: 'Tecido Mole', teeth: [] },
  { code: 'RSMD', name: 'Região Sub-Mandibular Direita', category: 'Tecido Mole', teeth: [] },
  { code: 'RSME', name: 'Região Sub-Mandibular Esquerda', category: 'Tecido Mole', teeth: [] },
  { code: 'LI', name: 'Lábio Inferior', category: 'Tecido Mole', teeth: [] },
  { code: 'LS', name: 'Lábio Superior', category: 'Tecido Mole', teeth: [] },
  { code: 'RMID_TM', name: 'Região Molar Inferior Direito', category: 'Tecido Mole', teeth: [46, 47, 48] },
  { code: 'RMIE_TM', name: 'Região Molar Inferior Esquerdo', category: 'Tecido Mole', teeth: [36, 37, 38] },

  // Tecido Duro
  { code: 'AI', name: 'Arcada Inferior', category: 'Tecido Duro', teeth: [31, 32, 33, 34, 35, 36, 37, 38, 41, 42, 43, 44, 45, 46, 47, 48] },
  { code: 'AS', name: 'Arcada Superior', category: 'Tecido Duro', teeth: [11, 12, 13, 14, 15, 16, 17, 18, 21, 22, 23, 24, 25, 26, 27, 28] },
  { code: 'HASD', name: 'Hemi- Arco Superior Direito', category: 'Tecido Duro', teeth: [11, 12, 13, 14, 15, 16, 17, 18] },
  { code: 'HASE', name: 'Hemi- Arco Superior Esquerdo', category: 'Tecido Duro', teeth: [21, 22, 23, 24, 25, 26, 27, 28] },
  { code: 'HAID', name: 'Hemi- Arco Inferior Direito', category: 'Tecido Duro', teeth: [41, 42, 43, 44, 45, 46, 47, 48] },
  { code: 'HAIE', name: 'Hemi- Arco Inferior Esquerdo', category: 'Tecido Duro', teeth: [31, 32, 33, 34, 35, 36, 37, 38] },

  // Periodontia
  { code: 'S1', name: 'Sextante superior posterior direito', category: 'Periodontia', teeth: [18, 17, 16, 15, 14] },
  { code: 'S2', name: 'Sextante superior anterior', category: 'Periodontia', teeth: [13, 12, 11, 21, 22, 23] },
  { code: 'S3', name: 'Sextante superior posterior esquerdo', category: 'Periodontia', teeth: [24, 25, 26, 27, 28] },
  { code: 'S4', name: 'Sextante inferior posterior esquerdo', category: 'Periodontia', teeth: [38, 37, 36, 35, 34] },
  { code: 'S5', name: 'Sextante inferior anterior', category: 'Periodontia', teeth: [33, 32, 31, 41, 42, 43] },
  { code: 'S6', name: 'Sextante inferior posterior direito', category: 'Periodontia', teeth: [44, 45, 46, 47, 48] },
];

export const getRegionByCode = (code: string): RegionInfo | undefined => {
  return REGION_LEGENDS.find(r => r.code.toUpperCase() === code.toUpperCase() || (r.code.startsWith(code.toUpperCase()) && r.code.includes('_')));
};

export const getRegionsByCategory = (category: RegionInfo['category']): RegionInfo[] => {
  return REGION_LEGENDS.filter(r => r.category === category);
};

export const getRegionsForTooth = (toothNumber: number): RegionInfo[] => {
  return REGION_LEGENDS.filter(r => r.teeth.includes(toothNumber));
};

export const formatRegionDisplay = (regionCodeOrTooth?: string | number): string => {
  if (!regionCodeOrTooth) return 'Não especificado';
  const str = String(regionCodeOrTooth).trim();
  
  // Check if it's a known tooth number
  const toothNum = Number(str);
  if (!isNaN(toothNum) && toothNum >= 11 && toothNum <= 85) {
    const foundTooth = TOOTH_DICTIONARY.find(t => t.number === toothNum);
    if (foundTooth) {
      return `Dente #${foundTooth.number} (${foundTooth.name})`;
    }
    return `Dente #${toothNum}`;
  }

  const foundRegion = getRegionByCode(str);
  if (foundRegion) {
    const teethStr = foundRegion.teeth.length > 0 ? ` (${foundRegion.teeth.join('/')})` : '';
    const cleanCode = foundRegion.code.replace('_TM', '');
    return `${cleanCode} - ${foundRegion.name}${teethStr}`;
  }

  return str;
};
