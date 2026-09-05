import { ToothCondition, ToothConditionType } from '../types';

export type SeverityLevel = 'critico' | 'alto' | 'moderado' | 'baixo';

export const SEVERITY_WEIGHT: Record<SeverityLevel, number> = {
  critico: 4,
  alto: 3,
  moderado: 2,
  baixo: 1
};

export const SEVERITY_CONFIG: Record<SeverityLevel, {
  label: string;
  shortLabel: string;
  badgeClass: string;
  iconName: 'AlertTriangle' | 'AlertCircle' | 'HelpCircle' | 'CheckCircle2';
  color: string;
  dot: string;
  description: string;
}> = {
  critico: {
    label: 'Crítico (Urgência / Risco de Perda)',
    shortLabel: 'Crítico',
    badgeClass: 'bg-red-100 text-red-800 border-red-300 font-bold',
    iconName: 'AlertTriangle',
    color: 'bg-red-50 text-red-800 border-red-300',
    dot: 'bg-red-600',
    description: 'Quadro infeccioso agudo, abscesso, dor severa, necrose pulpar ou risco iminente de perda do elemento dentário.'
  },
  alto: {
    label: 'Alto Risco (Intervenção Imediata)',
    shortLabel: 'Alto',
    badgeClass: 'bg-orange-100 text-orange-800 border-orange-300 font-bold',
    iconName: 'AlertCircle',
    color: 'bg-orange-50 text-orange-800 border-orange-300',
    dot: 'bg-orange-600',
    description: 'Lesões cariosas profundas, necessidade cirúrgica/extração, perda óssea periodontal moderada/severa ou lesões ativas.'
  },
  moderado: {
    label: 'Moderado (Reabilitação Necessária)',
    shortLabel: 'Moderado',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-300 font-bold',
    iconName: 'HelpCircle',
    color: 'bg-amber-50 text-amber-800 border-amber-300',
    dot: 'bg-amber-500',
    description: 'Restaurações insatisfatórias, cárie inicial/coronária, substituição protética ou gengivite.'
  },
  baixo: {
    label: 'Baixo Risco (Preventivo / Eletivo)',
    shortLabel: 'Baixo',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold',
    iconName: 'CheckCircle2',
    color: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    dot: 'bg-emerald-600',
    description: 'Procedimentos preventivos, profilaxia, raspagem supragengival, aplicação tópica de flúor ou clareamento dental.'
  }
};

/**
 * Normaliza e traduz termos odontológicos populares para nomenclatura técnica oficial
 */
export const formatTechnicalDentalTerm = (text?: string): string => {
  if (!text) return '';
  return text
    .replace(/\btratamento de canal\b/gi, 'Tratamento Endodôntico')
    .replace(/\bcanal\b/gi, 'Tratamento Endodôntico')
    .replace(/\bsio\b/gi, 'Hígido (Íntegro)');
};

/**
 * Converte códigos técnicos de condições do odontograma para descrição em português formal
 */
export const getConditionTechnicalLabel = (condition?: string): string => {
  if (!condition) return 'Hígido (Íntegro)';
  const lower = condition.toLowerCase().trim();
  if (lower === 'sio' || lower === '') return 'Hígido (Íntegro)';
  if (lower === 'canal') return 'Tratamento Endodôntico Indicado';
  if (lower === 'carie') return 'Lesão Cariosa Ativa';
  if (lower === 'restauracao') return 'Restauração Satisfatória';
  if (lower === 'restauracao_insatisfatoria') return 'Restauração Insatisfatória';
  if (lower === 'necessidade_endodontica') return 'Necessidade de Tratamento Endodôntico';
  if (lower === 'endodontia_insatisfatoria') return 'Endodontia Insatisfatória';
  if (lower === 'endodontia_satisfatoria') return 'Endodontia Satisfatória';
  if (lower === 'extracao_indicada') return 'Extração Indicada';
  if (lower === 'ausente') return 'Elemento Ausente / Extraído';
  if (lower === 'implante') return 'Implante Osseointegrado';
  if (lower === 'protese') return 'Prótese / Coroa Protetora';
  if (lower === 'calculo_supragengival') return 'Cálculo Supragengival';
  if (lower === 'calculo_subgengival') return 'Cálculo Subgengival';
  if (lower === 'girovertido') return 'Dente Girovertido';
  return formatTechnicalDentalTerm(condition);
};

export interface ConsolidatedToothFinding {
  toothNumber: number;
  label: string;
  isHigido: boolean;
  hasIntervention: boolean;
}

/**
 * Consolida as condições de um dente específico, eliminando duplicidades de "Hígido (Íntegro)"
 * originadas por múltiplas faces com código 'sio' ou múltiplos registros no odontograma.
 */
export const getConsolidatedToothFinding = (cond: ToothCondition): ConsolidatedToothFinding => {
  const toothNumber = cond.toothNumber;

  const surfaceEntries = Object.entries(cond.surfaces || {});
  const activeSurfaces = surfaceEntries.filter(([_, type]) => type && type !== 'sio');
  const allRecordedSurfacesAreSio = surfaceEntries.length > 0 && surfaceEntries.every(([_, type]) => !type || type === 'sio');

  const wholeCond = cond.wholeToothCondition;
  const isWholeSio = !wholeCond || wholeCond === 'sio';

  // Se a condição global for 'sio'/vazia E não houver superfícies ativas que não sejam 'sio'
  if (isWholeSio && (activeSurfaces.length === 0 || allRecordedSurfacesAreSio)) {
    return {
      toothNumber,
      label: 'Hígido (Íntegro)',
      isHigido: true,
      hasIntervention: false
    };
  }

  const conditionLabels: string[] = [];

  // Condição de dente inteiro
  if (wholeCond && wholeCond !== 'sio') {
    conditionLabels.push(getConditionTechnicalLabel(wholeCond));
  }

  // Agrupa superfícies ativas por condição para evitar repetições
  const conditionFacesMap: Record<string, string[]> = {};
  activeSurfaces.forEach(([face, type]) => {
    const faceName = face.charAt(0).toUpperCase() + face.slice(1);
    if (!conditionFacesMap[type]) conditionFacesMap[type] = [];
    conditionFacesMap[type].push(faceName);
  });

  Object.entries(conditionFacesMap).forEach(([type, faces]) => {
    const techLabel = getConditionTechnicalLabel(type);
    const facesText = ` (${faces.join(', ')})`;
    // Evita duplicar se já incluído como condição de dente inteiro
    if (!conditionLabels.some(l => l.toLowerCase().includes(techLabel.toLowerCase()))) {
      conditionLabels.push(`${techLabel}${facesText}`);
    }
  });

  if (cond.isGirovertido && !conditionLabels.some(l => l.includes('Girovertido'))) {
    conditionLabels.push('Dente Girovertido');
  }
  if (cond.hasCalculoSupra && !conditionLabels.some(l => l.includes('Supragengival'))) {
    conditionLabels.push('Cálculo Supragengival');
  }
  if (cond.hasCalculoSub && !conditionLabels.some(l => l.includes('Subgengival'))) {
    conditionLabels.push('Cálculo Subgengival');
  }

  const finalLabel = conditionLabels.length > 0
    ? conditionLabels.join(' • ')
    : 'Hígido (Íntegro)';

  return {
    toothNumber,
    label: finalLabel,
    isHigido: finalLabel === 'Hígido (Íntegro)',
    hasIntervention: finalLabel !== 'Hígido (Íntegro)'
  };
};

/**
 * Deduplica e consolida uma lista inteira de condições de odontograma por dente,
 * garantindo que cada elemento dentário apareça no máximo uma vez, sem repetições
 * de 'Hígido (Íntegro)' ou múltiplos blocos idênticos.
 */
export const consolidateOdontogramConditions = (conditions: ToothCondition[]): ConsolidatedToothFinding[] => {
  if (!Array.isArray(conditions) || conditions.length === 0) return [];

  // Mapeia dentes consolidando superfícies e estados
  const toothMap = new Map<number, ToothCondition>();

  conditions.forEach((c) => {
    if (!c || !c.toothNumber) return;
    const existing = toothMap.get(c.toothNumber);
    if (!existing) {
      toothMap.set(c.toothNumber, { ...c });
    } else {
      // Mescla superfícies
      toothMap.set(c.toothNumber, {
        ...existing,
        wholeToothCondition: (existing.wholeToothCondition && existing.wholeToothCondition !== 'sio') 
          ? existing.wholeToothCondition 
          : c.wholeToothCondition,
        surfaces: {
          ...(existing.surfaces || {}),
          ...(c.surfaces || {})
        },
        isGirovertido: existing.isGirovertido || c.isGirovertido,
        hasCalculoSupra: existing.hasCalculoSupra || c.hasCalculoSupra,
        hasCalculoSub: existing.hasCalculoSub || c.hasCalculoSub
      });
    }
  });

  const consolidated: ConsolidatedToothFinding[] = [];
  toothMap.forEach((cond) => {
    consolidated.push(getConsolidatedToothFinding(cond));
  });

  // Ordena por número do dente (notação FDI)
  return consolidated.sort((a, b) => a.toothNumber - b.toothNumber);
};

/**
 * Determina o nível de gravidade clínica de qualquer procedimento, necessidade ou achado
 */
export const getProcedureSeverity = (
  procedureName?: string, 
  specialty?: string, 
  findingCondition?: string
): SeverityLevel => {
  const corpus = `${procedureName || ''} ${specialty || ''} ${findingCondition || ''}`.toLowerCase();

  // Crítico: urgência, dor aguda, infecção, endodontia ativa / necrose, abscesso
  if (
    corpus.includes('endodont') || 
    corpus.includes('abscesso') || 
    corpus.includes('urgência') || 
    corpus.includes('infecc') || 
    corpus.includes('dor aguda') || 
    corpus.includes('canal') ||
    corpus.includes('necrose') ||
    corpus.includes('drenagem')
  ) {
    return 'critico';
  }

  // Alto: cirurgias, extrações, cárie profunda, periodontite moderada/severa, implantes
  if (
    corpus.includes('cirurgia') || 
    corpus.includes('extração') || 
    corpus.includes('exodontia') || 
    corpus.includes('cárie profunda') || 
    corpus.includes('periodontite') || 
    corpus.includes('enxerto') || 
    corpus.includes('implante') ||
    corpus.includes('lesão') ||
    corpus.includes('cisto') ||
    corpus.includes('subgengival')
  ) {
    return 'alto';
  }

  // Moderado: restaurações, cárie ativa coronária, prótese, troca restauradora, oclusão
  if (
    corpus.includes('restauração') || 
    corpus.includes('cárie') || 
    corpus.includes('gengivite') || 
    corpus.includes('prótese') || 
    corpus.includes('coroa') || 
    corpus.includes('ajuste oclusal') || 
    corpus.includes('clareamento') ||
    corpus.includes('girovertido')
  ) {
    return 'moderado';
  }

  // Baixo: profilaxia, prevenção, flúor, raspagem preventiva, exame
  return 'baixo';
};
