import { ToothSurface } from '../types';

export interface ToothFaceDefinition {
  code: 'M' | 'D' | 'O' | 'I' | 'V' | 'L' | 'P';
  key: ToothSurface;
  label: string;
  fullName: string;
  description: string;
  appliesToArch: 'superior' | 'inferior' | 'ambos';
  appliesToToothType: 'anterior' | 'posterior' | 'ambos';
}

/**
 * BANCO DE DADOS UNIFICADO DE FACES ODONTOLÓGICAS - DENTISPRO
 * Cobre estritamente as 7 faces anatômicas padronizadas:
 * - M: Mesial
 * - D: Distal
 * - O: Oclusal (Molares / Pré-molares)
 * - I: Incisal (Incisivos / Caninos)
 * - V: Vestibular
 * - L: Lingual (Exclusivo para a arcada inferior)
 * - P: Palatina (Exclusivo para a arcada superior)
 */
export const CANONICAL_FACES: ToothFaceDefinition[] = [
  {
    code: 'M',
    key: 'mesial',
    label: 'Mesial',
    fullName: 'M - Mesial',
    description: 'Face voltada para a linha média da arcada dental',
    appliesToArch: 'ambos',
    appliesToToothType: 'ambos',
  },
  {
    code: 'D',
    key: 'distal',
    label: 'Distal',
    fullName: 'D - Distal',
    description: 'Face voltada para a parte posterior (distante da linha média)',
    appliesToArch: 'ambos',
    appliesToToothType: 'ambos',
  },
  {
    code: 'O',
    key: 'oclusal',
    label: 'Oclusal',
    fullName: 'O - Oclusal (Molares / Pré-molares)',
    description: 'Superfície mastigatória exclusiva para dentes posteriores (Pré-molares e Molares)',
    appliesToArch: 'ambos',
    appliesToToothType: 'posterior',
  },
  {
    code: 'I',
    key: 'incisal',
    label: 'Incisal',
    fullName: 'I - Incisal (Incisivos / Caninos)',
    description: 'Borda cortante exclusiva para dentes anteriores (Incisivos e Caninos)',
    appliesToArch: 'ambos',
    appliesToToothType: 'anterior',
  },
  {
    code: 'V',
    key: 'vestibular',
    label: 'Vestibular',
    fullName: 'V - Vestibular',
    description: 'Face voltada para os lábios ou bochechas',
    appliesToArch: 'ambos',
    appliesToToothType: 'ambos',
  },
  {
    code: 'L',
    key: 'lingual',
    label: 'Lingual',
    fullName: 'L - Lingual (Exclusivo para a arcada inferior)',
    description: 'Face voltada para a língua, de uso exclusivo para a arcada inferior',
    appliesToArch: 'inferior',
    appliesToToothType: 'ambos',
  },
  {
    code: 'P',
    key: 'palatina',
    label: 'Palatina',
    fullName: 'P - Palatina (Exclusivo para a arcada superior)',
    description: 'Face voltada para o palato (céu da boca), de uso exclusivo para a arcada superior',
    appliesToArch: 'superior',
    appliesToToothType: 'ambos',
  },
];

/**
 * Retorna se um dente é da arcada superior
 */
export const isUpperArchTooth = (toothNumber: number): boolean => {
  return (toothNumber >= 11 && toothNumber <= 28) || (toothNumber >= 51 && toothNumber <= 65);
};

/**
 * Retorna se um dente é anterior (Incisivos / Caninos)
 */
export const isAnteriorTooth = (toothNumber: number): boolean => {
  const anteriorNumbers = [
    11, 12, 13, 21, 22, 23, 31, 32, 33, 41, 42, 43,
    51, 52, 53, 61, 62, 63, 71, 72, 73, 81, 82, 83
  ];
  return anteriorNumbers.includes(toothNumber);
};

/**
 * Filtra as faces válidas para um determinado número de dente FDI
 */
export const getValidFacesForTooth = (toothNumber: number): ToothFaceDefinition[] => {
  const isUpper = isUpperArchTooth(toothNumber);
  const isAnt = isAnteriorTooth(toothNumber);

  return CANONICAL_FACES.filter(face => {
    // Validação de Arcada
    if (face.appliesToArch === 'superior' && !isUpper) return false;
    if (face.appliesToArch === 'inferior' && isUpper) return false;

    // Validação de Tipo Dental
    if (face.appliesToToothType === 'anterior' && !isAnt) return false;
    if (face.appliesToToothType === 'posterior' && isAnt) return false;

    return true;
  });
};

/**
 * Mapeamento rápido de siglas/códigos para objeto completo
 */
export const getFaceByCode = (code: string): ToothFaceDefinition | undefined => {
  const upper = code.trim().toUpperCase();
  return CANONICAL_FACES.find(f => f.code === upper || f.key.toUpperCase() === upper);
};

/**
 * Mapeia array de superfícies para string legível de siglas (ex: ["mesial", "oclusal"] -> "M/O")
 */
export const formatFaceCodes = (surfaces: ToothSurface[]): string => {
  if (!surfaces || surfaces.length === 0) return '';
  const codes: string[] = [];
  for (const surf of surfaces) {
    const found = CANONICAL_FACES.find(f => f.key === surf);
    if (found) codes.push(found.code);
  }
  return codes.join('/');
};

export interface RestorationSuggestion {
  tussCode: string;
  description: string;
  faceCount: number;
  formattedFaces: string;
  suggestedCostParticular: number;
  specialty: string;
}

/**
 * Correlaciona as faces anatômicas selecionadas (do odontograma ou pré-configuração)
 * com o procedimento TUSS de restauração correspondente (1 face, 2 faces, 3+ faces / reconstrução)
 */
export const getRestorationSuggestion = (
  toothNumber: number,
  surfaces: ToothSurface[]
): RestorationSuggestion | null => {
  if (!surfaces || surfaces.length === 0) return null;
  const count = surfaces.length;
  const formattedFaces = formatFaceCodes(surfaces);

  if (count === 1) {
    return {
      tussCode: '81000030',
      description: `Restauração de 1 Face em Resina Composta (${formattedFaces})`,
      faceCount: 1,
      formattedFaces,
      suggestedCostParticular: 220,
      specialty: 'Dentística & Estética'
    };
  } else if (count === 2) {
    return {
      tussCode: '81000048',
      description: `Restauração de 2 Faces em Resina Composta (${formattedFaces})`,
      faceCount: 2,
      formattedFaces,
      suggestedCostParticular: 280,
      specialty: 'Dentística & Estética'
    };
  } else {
    return {
      tussCode: '81000056',
      description: `Restauração de ${count >= 4 ? '4 ou mais Faces' : '3 Faces'} / Reconstrução Coronária (${formattedFaces})`,
      faceCount: count,
      formattedFaces,
      suggestedCostParticular: 350,
      specialty: 'Dentística & Estética'
    };
  }
};
