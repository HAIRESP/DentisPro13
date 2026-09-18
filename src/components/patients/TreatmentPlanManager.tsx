import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { getPatientAgeAndBirthDate } from '../../utils/patientUtils';
import { DocumentSignatureFooter } from '../common/DocumentSignatureFooter';
import { printDocumentWithTitle } from '../../utils/printUtils';
import { 
  TreatmentPlan, 
  TreatmentPlanItem, 
  TUSSProcedure, 
  CorrelationRule, 
  ToothConditionType, 
  RegionAggregationMode,
  CorrelationScopeType,
  ToothSurface
} from '../../types';
import { 
  DEFAULT_CORRELATION_RULES, 
  TEETH_GROUP_DEFINITIONS, 
  ALL_SURFACES_LIST, 
  REGIONS_LIST 
} from '../../data/correlationRulesData';
import { TussManagerModal } from './TussManagerModal';
import { RegionSelector } from './RegionSelector';
import { ProcedureModulesModal } from '../common/ProcedureModulesModal';
import { 
  formatRegionDisplay, 
  REGION_LEGENDS, 
  getHemiArcoForTooth, 
  getSextanteForTooth, 
  getArcadaForTooth, 
  groupTeethByHemiArco, 
  groupTeethBySextante, 
  groupTeethByArcada 
} from '../../data/regionData';
import { TreatmentPlanConsentModal } from '../laudos/TreatmentPlanConsentModal';
import { 
  FileCheck2, 
  Plus, 
  Printer, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  Search, 
  ShieldCheck, 
  User, 
  Sparkles, 
  Building2, 
  DollarSign,
  ChevronDown,
  Edit2,
  FileText,
  Settings,
  Lightbulb,
  Smile,
  Check,
  Download,
  BookOpen,
  Info,
  Layers,
  CheckSquare,
  Square,
  ListFilter,
  ArrowLeft,
  X,
  Hash,
  Copy,
  RefreshCw,
  Filter,
  Pencil
} from 'lucide-react';

import { getThemeStyles } from '../../utils/themeUtils';

interface TreatmentPlanManagerProps {
  patientId: string;
}

export type PlanInclusionMode = 'convenio' | 'tuss' | 'procedimento' | 'regiao';

export interface CorrelatedProcedureOption {
  id: string;
  tussCode: string;
  procedureName: string;
  specialty: string;
  suggestedCost: number;
  regionCode?: string;
}

// Dictionary mapping clinical condition types to up to 3 correlated procedures
const DEFAULT_PROCEDURE_SUGGESTIONS_MAP: Record<ToothConditionType, CorrelatedProcedureOption[]> = {
  sio: [
    {
      id: 'proc-sio-1',
      tussCode: '81000001',
      procedureName: 'Profilaxia e Aplicação Tópica de Flúor (Dente Hígido)',
      specialty: 'Prevenção / Odontopediatria',
      suggestedCost: 150,
      regionCode: 'Boca'
    }
  ],
  canal: [
    {
      id: 'proc-canal-1',
      tussCode: '82000034',
      procedureName: 'Retratamento Endodôntico (Endodontia Insatisfatória)',
      specialty: 'Endodontia',
      suggestedCost: 750,
      regionCode: 'RMID'
    },
    {
      id: 'proc-canal-2',
      tussCode: '86000018',
      procedureName: 'Remoção de Núcleo / Retentor Intra-radicular',
      specialty: 'Prótese / Dentística',
      suggestedCost: 280,
      regionCode: 'Dente'
    },
    {
      id: 'proc-canal-3',
      tussCode: '81000030',
      procedureName: 'Reconstrução Coronária / Selamento Provisório',
      specialty: 'Dentística & Estética',
      suggestedCost: 280,
      regionCode: 'Dente'
    }
  ],
  endodontia_insatisfatoria: [
    {
      id: 'proc-eins-1',
      tussCode: '82000034',
      procedureName: 'Retratamento Endodôntico Especializado',
      specialty: 'Endodontia',
      suggestedCost: 780,
      regionCode: 'RMID'
    },
    {
      id: 'proc-eins-2',
      tussCode: '86000018',
      procedureName: 'Remoção de Retentor / Pino Intra-radicular',
      specialty: 'Prótese / Endodontia',
      suggestedCost: 290,
      regionCode: 'Dente'
    },
    {
      id: 'proc-eins-3',
      tussCode: '81000030',
      procedureName: 'Restauração Coronária Pós-Retratamento',
      specialty: 'Dentística & Estética',
      suggestedCost: 280,
      regionCode: 'Dente'
    }
  ],
  necessidade_endodontica: [
    {
      id: 'proc-nendo-1',
      tussCode: '82000030',
      procedureName: 'Tratamento Endodôntico Unirradicular / Multirradicular',
      specialty: 'Endodontia',
      suggestedCost: 650,
      regionCode: 'Dente'
    },
    {
      id: 'proc-nendo-2',
      tussCode: '82000010',
      procedureName: 'Pulpotomia / Curativo de Demora Biocompatível',
      specialty: 'Endodontia / Urgência',
      suggestedCost: 220,
      regionCode: 'Dente'
    },
    {
      id: 'proc-nendo-3',
      tussCode: '86000018',
      procedureName: 'Instalação de Pino de Fibra de Vidro e Núcleo de Preenchimento',
      specialty: 'Prótese Dentária',
      suggestedCost: 380,
      regionCode: 'Dente'
    }
  ],
  endodontia_satisfatoria: [
    {
      id: 'proc-esat-1',
      tussCode: '81000030',
      procedureName: 'Restauração Definitiva / Blindagem Coronária Pós-Endo',
      specialty: 'Dentística & Estética',
      suggestedCost: 320,
      regionCode: 'Dente'
    },
    {
      id: 'proc-esat-2',
      tussCode: '81000040',
      procedureName: 'Acompanhamento Radiográfico Periapical / Proservação',
      specialty: 'Radiologia / Endodontia',
      suggestedCost: 90,
      regionCode: 'Dente'
    },
    {
      id: 'proc-esat-3',
      tussCode: '86000018',
      procedureName: 'Coroa Protética / Onlay de Proteção Cuspídea',
      specialty: 'Prótese Dentária',
      suggestedCost: 950,
      regionCode: 'RMSD'
    }
  ],
  girovertido: [
    {
      id: 'proc-giro-1',
      tussCode: '88000010',
      procedureName: 'Alinhamento / Desgiro Ortodôntico Corretivo',
      specialty: 'Ortodontia',
      suggestedCost: 450,
      regionCode: 'Dente'
    },
    {
      id: 'proc-giro-2',
      tussCode: '81000040',
      procedureName: 'Ajuste Oclusal por Desgaste Seletivo',
      specialty: 'Dentística & Oclusão',
      suggestedCost: 140,
      regionCode: 'Dente'
    }
  ],
  implante: [
    {
      id: 'proc-imp-1',
      tussCode: '83000010',
      procedureName: 'Instalação de Implante Dental Titânio / Zircônia',
      specialty: 'Implantodontia',
      suggestedCost: 1900,
      regionCode: 'RMID'
    },
    {
      id: 'proc-imp-2',
      tussCode: '86000018',
      procedureName: 'Coroa sobre Implante Aparafusada / Cimentada',
      specialty: 'Prótese sobre Implante',
      suggestedCost: 1300,
      regionCode: 'RMID'
    }
  ],
  carie: [
    {
      id: 'proc-carie-1',
      tussCode: '81000030',
      procedureName: 'Restauração em Resina Composta',
      specialty: 'Dentística & Estética',
      suggestedCost: 250,
      regionCode: 'Dente'
    },
    {
      id: 'proc-carie-2',
      tussCode: '81000010',
      procedureName: 'Proteção Pulpar Direta/Indireta / Forramento',
      specialty: 'Dentística & Estética',
      suggestedCost: 120,
      regionCode: 'Dente'
    },
    {
      id: 'proc-carie-3',
      tussCode: '81000040',
      procedureName: 'Polimento Coronário / Ajuste Oclusal',
      specialty: 'Dentística & Estética',
      suggestedCost: 90,
      regionCode: 'Dente'
    }
  ],
  restauracao_insatisfatoria: [
    {
      id: 'proc-rest-1',
      tussCode: '81000030',
      procedureName: 'Substituição de Restauração Insatisfatória em Resina',
      specialty: 'Dentística & Estética',
      suggestedCost: 280,
      regionCode: 'Dente'
    },
    {
      id: 'proc-rest-2',
      tussCode: '86000018',
      procedureName: 'Bloco Inlay / Onlay / Overlay em Cerâmica / e-Max',
      specialty: 'Dentística & Prótese',
      suggestedCost: 850,
      regionCode: 'RMSD'
    },
    {
      id: 'proc-rest-3',
      tussCode: '81000040',
      procedureName: 'Polimento / Adequação do Meio Bucal',
      specialty: 'Dentística & Estética',
      suggestedCost: 110,
      regionCode: 'Dente'
    }
  ],
  extracao_indicada: [
    {
      id: 'proc-ext-1',
      tussCode: '87000028',
      procedureName: 'Exodontia Simples de Dente Permanente',
      specialty: 'Cirurgia Buco-Maxilo',
      suggestedCost: 220,
      regionCode: 'Dente'
    },
    {
      id: 'proc-ext-2',
      tussCode: '87000010',
      procedureName: 'Sutura e Curativo Cirúrgico Pós-Exodontia',
      specialty: 'Cirurgia Buco-Maxilo',
      suggestedCost: 90,
      regionCode: 'Dente'
    },
    {
      id: 'proc-ext-3',
      tussCode: '83000020',
      procedureName: 'Preservação Alveolar / Enxerto Ósseo Pós-Exodôntico',
      specialty: 'Implantodontia',
      suggestedCost: 450,
      regionCode: 'Dente'
    }
  ],
  ausente: [
    {
      id: 'proc-aus-1',
      tussCode: '83000010',
      procedureName: 'Implante Dental Osseointegrado',
      specialty: 'Implantodontia',
      suggestedCost: 1800,
      regionCode: 'RMID'
    },
    {
      id: 'proc-aus-2',
      tussCode: '86000010',
      procedureName: 'Prótese Provisória sobre Implante',
      specialty: 'Prótese Dentária',
      suggestedCost: 450,
      regionCode: 'RMID'
    },
    {
      id: 'proc-aus-3',
      tussCode: '86000018',
      procedureName: 'Coroa Definitiva Zircônia / Cerâmica sobre Implante',
      specialty: 'Prótese Dentária',
      suggestedCost: 1200,
      regionCode: 'RMID'
    }
  ],
  protese: [
    {
      id: 'proc-prot-1',
      tussCode: '86000018',
      procedureName: 'Coroa Total Zircônia / e-Max',
      specialty: 'Prótese Dentária',
      suggestedCost: 1200,
      regionCode: 'RMSD'
    },
    {
      id: 'proc-prot-2',
      tussCode: '86000012',
      procedureName: 'Núcleo Metálico Fundido / Pino de Fibra',
      specialty: 'Prótese Dentária',
      suggestedCost: 380,
      regionCode: 'Dente'
    },
    {
      id: 'proc-prot-3',
      tussCode: '86000010',
      procedureName: 'Coroa Total Provisória em Resina Acrílica',
      specialty: 'Prótese Dentária',
      suggestedCost: 250,
      regionCode: 'Dente'
    }
  ],
  calculo_supragengival: [
    {
      id: 'proc-csup-1',
      tussCode: '84000010',
      procedureName: 'Raspagem Supra-gengival e Polimento Coronário',
      specialty: 'Periodontia',
      suggestedCost: 320,
      regionCode: 'ASAI'
    },
    {
      id: 'proc-csup-2',
      tussCode: '84000012',
      procedureName: 'Profilaxia com Jato de Bicarbonato',
      specialty: 'Periodontia',
      suggestedCost: 150,
      regionCode: 'ASAI'
    },
    {
      id: 'proc-csup-3',
      tussCode: '81000020',
      procedureName: 'Aplicação Tópica de Flúor / Dessensibilização',
      specialty: 'Preventiva',
      suggestedCost: 90,
      regionCode: 'ASAI'
    }
  ],
  calculo_subgengival: [
    {
      id: 'proc-csub-1',
      tussCode: '85000015',
      procedureName: 'Raspagem Subgengival e Aplanamento Radicular',
      specialty: 'Periodontia',
      suggestedCost: 380,
      regionCode: 'HASD'
    },
    {
      id: 'proc-csub-2',
      tussCode: '85000020',
      procedureName: 'Irrigação Subgengival com Clorexidina',
      specialty: 'Periodontia',
      suggestedCost: 180,
      regionCode: 'HASD'
    },
    {
      id: 'proc-csub-3',
      tussCode: '84000010',
      procedureName: 'Instrução de Higiene Oral e Polimento Radicular',
      specialty: 'Periodontia',
      suggestedCost: 120,
      regionCode: 'HASD'
    }
  ],
  restauracao: [
    {
      id: 'proc-r-1',
      tussCode: '81000040',
      procedureName: 'Polimento / Recontorno Estético da Restauração',
      specialty: 'Dentística & Estética',
      suggestedCost: 120,
      regionCode: 'Dente'
    },
    {
      id: 'proc-r-2',
      tussCode: '81000035',
      procedureName: 'Selamento de Margem Restauradora',
      specialty: 'Dentística & Estética',
      suggestedCost: 90,
      regionCode: 'Dente'
    },
    {
      id: 'proc-r-3',
      tussCode: '81000020',
      procedureName: 'Aplicação Tópica de Flúor',
      specialty: 'Preventiva',
      suggestedCost: 80,
      regionCode: 'Dente'
    }
  ]
};

export const PAYMENT_CONDITIONS_CATEGORIES = [
  {
    category: 'À Vista com Desconto / Bonificação',
    options: [
      'À vista com 10% de desconto no PIX / Transferência Bancária',
      'À vista com 10% de desconto em Dinheiro (Espécie)',
      'À vista com 5% de desconto no PIX / Cartão de Débito',
      'À vista no Cartão de Débito (valor integral)',
    ]
  },
  {
    category: 'Cartão de Crédito sem Juros',
    options: [
      'Cartão de Crédito 1x (À vista sem juros)',
      'Cartão de Crédito em até 2x sem juros',
      'Cartão de Crédito em até 3x sem juros',
      'Cartão de Crédito em até 4x sem juros',
      'Cartão de Crédito em até 5x sem juros',
      'Cartão de Crédito em até 6x sem juros',
      'Cartão de Crédito em até 8x sem juros',
      'Cartão de Crédito em até 10x sem juros',
      'Cartão de Crédito em até 12x sem juros',
    ]
  },
  {
    category: 'Cartão de Crédito Parcelado (com Juros da Operadora)',
    options: [
      'Cartão de Crédito em até 14x (com juros da operadora)',
      'Cartão de Crédito em até 18x (com juros da operadora)',
      'Cartão de Crédito em até 21x (com juros da operadora)',
      'Cartão de Crédito em até 24x (com juros da operadora)',
    ]
  },
  {
    category: 'Entrada + Parcelamento no Cartão',
    options: [
      'Entrada de 20% no PIX/Débito + Saldo em até 4x no Cartão de Crédito',
      'Entrada de 30% no PIX/Débito + Saldo em até 6x no Cartão de Crédito',
      'Entrada de 40% no PIX/Débito + Saldo em até 8x no Cartão de Crédito',
      'Entrada de 50% no PIX/Débito + Saldo em até 10x no Cartão de Crédito',
      'Entrada de 50% no Início + 50% na Entrega / Conclusão dos Procedimentos',
    ]
  },
  {
    category: 'Boleto Bancário / Carnê / Financiamento Odontológico',
    options: [
      'Boleto Bancário em até 3x (aprovação cadastral prévia)',
      'Boleto Bancário em até 6x (aprovação cadastral prévia)',
      'Boleto Bancário / Carnê da Clínica em até 12x (Financiamento Odontológico)',
      'Boleto Bancário / Carnê da Clínica em até 24x (Financiamento Odontológico)',
      'Financiamento Odontológico Bancário em até 36x (crédito sujeito a análise)',
    ]
  },
  {
    category: 'Convênio, Coparticipação & Pagamento por Sessão',
    options: [
      'Pagamento por Procedimento Realizado (ao término de cada sessão clínica)',
      'Convênio Odontológico (cobertura integral conforme plano contratado)',
      'Coparticipação: Cobertura Convênio Odonto + Coparticipação Particular',
      'Personalizado / Condições Especiais negociadas com a Recepção',
    ]
  }
];

export const TreatmentPlanManager: React.FC<TreatmentPlanManagerProps> = ({ patientId }) => {
  const { 
    patients, 
    treatmentPlans, 
    addTreatmentPlan, 
    updateTreatmentPlan, 
    deleteTreatmentPlan, 
    tussProcedures, 
    priceTables,
    addPriceTable,
    clinicInfo,
    odontograms,
    activeProfessional,
    layoutTheme
  } = useApp();

  const t = getThemeStyles(layoutTheme);

  const patient = patients.find(p => p.id === patientId);
  const patientPlans = treatmentPlans.filter(p => p.patientId === patientId);
  const activeConditions = odontograms[patientId] || [];

  const [isCreating, setIsCreating] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [activePrintPlan, setActivePrintPlan] = useState<TreatmentPlan | null>(null);
  const [activeConsentPlanId, setActiveConsentPlanId] = useState<string | null>(null);
  const [addedNotice, setAddedNotice] = useState<string | null>(null);
  const [customProcOverrides, setCustomProcOverrides] = useState<Record<string, { tussCode?: string; procedureName?: string; suggestedCost?: number }>>({});

  // Quick Add Convênio State
  const [isAddingNewConvenio, setIsAddingNewConvenio] = useState(false);
  const [newConvenioName, setNewConvenioName] = useState('');
  const [newConvenioDesc, setNewConvenioDesc] = useState('');

  // TUSS Manager Modal State
  const [isTussManagerOpen, setIsTussManagerOpen] = useState(false);
  const [selectedPriceTableId, setSelectedPriceTableId] = useState<string>('particular');

  // Strategy for Adding Procedures into Treatment Plan ('convenio' | 'tuss' | 'procedimento' | 'regiao')
  const [planInclusionMode, setPlanInclusionMode] = useState<PlanInclusionMode>('convenio');

  // Correlation Rules State
  const [correlationRules, setCorrelationRules] = useState<CorrelationRule[]>(() => {
    const saved = localStorage.getItem('clinic_correlation_rules');
    if (!saved) return DEFAULT_CORRELATION_RULES;
    try {
      const parsed: CorrelationRule[] = JSON.parse(saved);
      // Merge defaults to ensure all newly structured rules are available
      const existingIds = new Set(parsed.map(r => r.id));
      const missingDefaults = DEFAULT_CORRELATION_RULES.filter(d => !existingIds.has(d.id));
      const combined = [...parsed, ...missingDefaults];
      return combined.sort((a, b) => (a.procedureDescription || '').localeCompare(b.procedureDescription || '', 'pt-BR', { sensitivity: 'base' }));
    } catch {
      return DEFAULT_CORRELATION_RULES;
    }
  });
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);

  // Filters for Rules Table
  const [ruleSearchQuery, setRuleSearchQuery] = useState('');
  const [ruleFilterPriceTable, setRuleFilterPriceTable] = useState<string>('todos');
  const [ruleFilterScope, setRuleFilterScope] = useState<string>('todos');
  const [ruleFilterCondition, setRuleFilterCondition] = useState<string>('todas');

  // New Rule Form State (Full customization: TUSS, Convênio, Scope, Specific Faces, Teeth, Regions)
  const [newRuleCond, setNewRuleCond] = useState<ToothConditionType>('carie');
  const [newRuleScopeType, setNewRuleScopeType] = useState<CorrelationScopeType>('face');
  const [newRuleMinSurf, setNewRuleMinSurf] = useState('1');
  const [newRuleMaxSurf, setNewRuleMaxSurf] = useState('2');
  const [newRuleApplicableFaces, setNewRuleApplicableFaces] = useState<ToothSurface[]>(['oclusal']);
  const [newRuleTeethGroup, setNewRuleTeethGroup] = useState<string>('todos');
  const [newRuleApplicableTeeth, setNewRuleApplicableTeeth] = useState<string>('');
  const [newRuleApplicableRegions, setNewRuleApplicableRegions] = useState<string[]>([]);
  const [newRuleTussCode, setNewRuleTussCode] = useState('');
  const [newRuleDesc, setNewRuleDesc] = useState('');
  const [newRuleSpec, setNewRuleSpec] = useState('Dentística & Estética');
  const [newRuleCost, setNewRuleCost] = useState('250');
  const [newRuleRegionCode, setNewRuleRegionCode] = useState('Dente');
  const [newRuleAggregationMode, setNewRuleAggregationMode] = useState<RegionAggregationMode>('dente');
  const [newRulePriceTableId, setNewRulePriceTableId] = useState<string>('particular');
  const [newRuleNotes, setNewRuleNotes] = useState<string>('');
  const [tussDropdownSearch, setTussDropdownSearch] = useState('');
  const [isTussDropdownOpen, setIsTussDropdownOpen] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('clinic_correlation_rules', JSON.stringify(correlationRules));
  }, [correlationRules]);

  const resetRuleForm = () => {
    setEditingRuleId(null);
    setNewRuleCond('carie');
    setNewRuleScopeType('face');
    setNewRuleMinSurf('1');
    setNewRuleMaxSurf('2');
    setNewRuleApplicableFaces(['oclusal']);
    setNewRuleTeethGroup('todos');
    setNewRuleApplicableTeeth('');
    setNewRuleApplicableRegions([]);
    setNewRuleTussCode('');
    setNewRuleDesc('');
    setNewRuleSpec('Dentística & Estética');
    setNewRuleCost('250');
    setNewRuleRegionCode('Dente');
    setNewRuleAggregationMode('dente');
    setNewRulePriceTableId('particular');
    setNewRuleNotes('');
    setTussDropdownSearch('');
    setIsTussDropdownOpen(false);
  };

  const handleStartEditRule = (rule: CorrelationRule) => {
    setEditingRuleId(rule.id);
    setNewRuleCond(rule.conditionType);
    const resolvedScope: CorrelationScopeType = rule.scopeType 
      ? rule.scopeType 
      : (rule.aggregationMode && rule.aggregationMode !== 'dente')
        ? 'area'
        : (rule.applicableFaces && rule.applicableFaces.length > 0) || (rule.minSurfaces !== undefined && rule.minSurfaces > 0)
          ? 'face'
          : 'dente';

    setNewRuleScopeType(resolvedScope);
    setNewRuleMinSurf((rule.minSurfaces ?? 0).toString());
    setNewRuleMaxSurf((rule.maxSurfaces ?? 5).toString());
    setNewRuleApplicableFaces(rule.applicableFaces || (rule.minSurfaces && rule.minSurfaces > 0 ? ['oclusal'] : []));
    setNewRuleTeethGroup(rule.teethGroup || 'todos');
    setNewRuleApplicableTeeth(rule.applicableTeeth ? rule.applicableTeeth.join(', ') : '');
    setNewRuleApplicableRegions(rule.applicableRegions || (rule.regionCode && rule.regionCode !== 'Dente' ? [rule.regionCode] : []));
    setNewRuleTussCode(rule.tussCode || '');
    setNewRuleDesc(rule.procedureDescription);
    setNewRuleSpec(rule.specialty);
    setNewRuleCost((rule.suggestedCost ?? 0).toString());
    setNewRuleRegionCode(rule.regionCode || 'Dente');
    setNewRuleAggregationMode(rule.aggregationMode || 'dente');
    setNewRulePriceTableId(rule.priceTableId || 'particular');
    setNewRuleNotes(rule.notes || '');
    setTussDropdownSearch(rule.tussCode ? `[${rule.tussCode}] ${rule.procedureDescription}` : '');
    setIsTussDropdownOpen(false);

    const formEl = document.getElementById('correlation-rules-form-container');
    if (formEl) {
      formEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleQuickAddConvenio = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newConvenioName.trim();
    if (!trimmed) return;

    // Check if table with same name already exists
    const existing = priceTables.find(p => p.name.toLowerCase() === trimmed.toLowerCase());
    if (existing) {
      setNewRulePriceTableId(existing.id);
      setSelectedPriceTableId(existing.id);
      setIsAddingNewConvenio(false);
      setNewConvenioName('');
      setNewConvenioDesc('');
      setAddedNotice(`Convênio "${existing.name}" já consta na lista e foi selecionado!`);
      setTimeout(() => setAddedNotice(null), 4000);
      return;
    }

    const created = addPriceTable({
      name: trimmed,
      description: newConvenioDesc.trim() || `Tabela praticada para o convênio ${trimmed}`,
      isDefault: false
    });
    setNewRulePriceTableId(created.id);
    setSelectedPriceTableId(created.id);
    setIsAddingNewConvenio(false);
    setNewConvenioName('');
    setNewConvenioDesc('');
    setAddedNotice(`✓ Convênio "${created.name}" cadastrado e selecionado com sucesso!`);
    setTimeout(() => setAddedNotice(null), 4000);
  };

  const handleDuplicateRule = (rule: CorrelationRule) => {
    const duplicated: CorrelationRule = {
      ...rule,
      id: `rule-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      procedureDescription: `${rule.procedureDescription} (Personalizado)`
    };
    setCorrelationRules(prev => [duplicated, ...prev]);
    handleStartEditRule(duplicated);
  };

  const toggleFaceSelection = (face: ToothSurface) => {
    setNewRuleApplicableFaces(prev => 
      prev.includes(face) ? prev.filter(f => f !== face) : [...prev, face]
    );
  };

  const toggleRegionSelection = (code: string) => {
    setNewRuleApplicableRegions(prev => 
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  const handleSaveRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleDesc.trim()) return;

    const parsedTeeth = newRuleApplicableTeeth
      ? newRuleApplicableTeeth
          .split(/[\s,;]+/)
          .map(s => parseInt(s.trim()))
          .filter(n => !isNaN(n) && n > 0)
      : undefined;

    const updatedRule: CorrelationRule = {
      id: editingRuleId || `rule-${Date.now()}`,
      conditionType: newRuleCond,
      scopeType: newRuleScopeType,
      minSurfaces: newRuleScopeType === 'face' ? (parseInt(newRuleMinSurf) || 0) : 0,
      maxSurfaces: newRuleScopeType === 'face' ? (parseInt(newRuleMaxSurf) || 5) : 5,
      applicableFaces: newRuleScopeType === 'face' && newRuleApplicableFaces.length > 0 ? newRuleApplicableFaces : undefined,
      teethGroup: newRuleScopeType === 'dente' ? (newRuleTeethGroup as any) : undefined,
      applicableTeeth: newRuleScopeType === 'dente' && parsedTeeth && parsedTeeth.length > 0 ? parsedTeeth : undefined,
      applicableRegions: newRuleScopeType === 'area' && newRuleApplicableRegions.length > 0 ? newRuleApplicableRegions : undefined,
      tussCode: newRuleTussCode.trim() || undefined,
      procedureDescription: newRuleDesc.trim(),
      specialty: newRuleSpec,
      suggestedCost: parseFloat(newRuleCost) || 200,
      regionCode: newRuleScopeType === 'area' && newRuleApplicableRegions.length > 0 ? newRuleApplicableRegions[0] : (newRuleRegionCode || 'Dente'),
      aggregationMode: newRuleScopeType === 'area' ? newRuleAggregationMode : 'dente',
      priceTableId: newRulePriceTableId,
      notes: newRuleNotes.trim() || undefined
    };

    if (editingRuleId) {
      setCorrelationRules(prev => prev.map(r => r.id === editingRuleId ? updatedRule : r));
      resetRuleForm();
    } else {
      setCorrelationRules(prev => [updatedRule, ...prev]);
      resetRuleForm();
    }
  };

  const handleDeleteRule = (id: string) => {
    if (editingRuleId === id) {
      resetRuleForm();
    }
    setCorrelationRules(prev => prev.filter(r => r.id !== id));
  };

  const handleExportRulesCSV = () => {
    const headers = [
      'ID', 
      'Condição Clínica', 
      'Código TUSS', 
      'Procedimento Sugerido', 
      'Modalidade / Convênio', 
      'Escopo', 
      'Faces Aplicáveis', 
      'Dentes Aplicáveis / Grupo', 
      'Regiões / Área', 
      'Especialidade', 
      'Valor Sugerido (R$)'
    ];
    const rows = correlationRules.map(r => {
      const tableName = priceTables.find(t => t.id === r.priceTableId)?.name || (r.priceTableId === 'particular' || !r.priceTableId ? 'Particular' : r.priceTableId);
      const scopeLabel = r.scopeType === 'face' ? 'Por Face' : r.scopeType === 'dente' ? 'Por Dente' : r.scopeType === 'area' ? 'Por Área/Região' : 'Dente';
      const facesStr = r.applicableFaces ? r.applicableFaces.join(', ') : (r.minSurfaces ? `${r.minSurfaces} a ${r.maxSurfaces} faces` : '-');
      const teethStr = r.applicableTeeth ? r.applicableTeeth.join(', ') : (r.teethGroup || '-');
      const regionsStr = r.applicableRegions ? r.applicableRegions.join(', ') : (r.regionCode || '-');

      return [
        `"${r.id}"`,
        `"${r.conditionType}"`,
        `"${r.tussCode || ''}"`,
        `"${r.procedureDescription.replace(/"/g, '""')}"`,
        `"${tableName}"`,
        `"${scopeLabel}"`,
        `"${facesStr}"`,
        `"${teethStr}"`,
        `"${regionsStr}"`,
        `"${r.specialty.replace(/"/g, '""')}"`,
        (r.suggestedCost ?? 0).toFixed(2)
      ].join(';');
    });

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `regras_de_correlacao_odontograma_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // New Plan Form State
  const [planTitle, setPlanTitle] = useState('Plano de Tratamento Personalizado');
  const [paymentConditions, setPaymentConditions] = useState('Entrada de 30% + Saldo em até 6x no cartão de crédito');
  const [notes, setNotes] = useState('Plano sujeito a reavaliação após conclusão da fase inicial.');
  const [items, setItems] = useState<TreatmentPlanItem[]>([]);

  // Add Item Dialog State (Separation of TUSS Code and Procedure Name)
  const [isProcedureModalOpen, setIsProcedureModalOpen] = useState(false);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('todas');
  const [searchTuss, setSearchTuss] = useState('');
  const [customTussCode, setCustomTussCode] = useState('');
  const [customProcedureName, setCustomProcedureName] = useState('');
  const [customToothNumber, setCustomToothNumber] = useState('');
  const [customSurface, setCustomSurface] = useState('');
  const [customRegionCode, setCustomRegionCode] = useState('');
  const [customRegionDesc, setCustomRegionDesc] = useState('');
  const [customItemCost, setCustomItemCost] = useState('');
  const [customItemNotes, setCustomItemNotes] = useState('');

  // Selected TUSS procedure for addition
  const [selectedTuss, setSelectedTuss] = useState<TUSSProcedure | null>(null);

  // Findings View & Batch Selection States
  const [findingsViewMode, setFindingsViewMode] = useState<'grouped' | 'individual'>('grouped');
  const [selectedTeethForBatch, setSelectedTeethForBatch] = useState<number[]>([]);
  const [selectedProcedureOptionIds, setSelectedProcedureOptionIds] = useState<Record<string, string[]>>({});

  // Helper to retrieve up to 3 correlated procedures for a condition
  const get3CorrelatedProcedures = (
    conditionType: ToothConditionType,
    surfaceCount: number,
    customRules: CorrelationRule[],
    toothNumber?: number,
    surfaces?: ToothSurface[]
  ): CorrelatedProcedureOption[] => {
    const result: CorrelatedProcedureOption[] = [];

    // 1. User-configured rules match (respecting faces, teeth group, specific teeth, and condition)
    const matchedCustom = customRules.filter(r => {
      if (r.conditionType !== conditionType) return false;

      // Surface count bounds if defined
      if (r.minSurfaces !== undefined && r.minSurfaces > 0 && surfaceCount < r.minSurfaces) return false;
      if (r.maxSurfaces !== undefined && r.maxSurfaces > 0 && surfaceCount > r.maxSurfaces) return false;

      // Specific tooth check
      if (toothNumber && r.applicableTeeth && r.applicableTeeth.length > 0) {
        if (!r.applicableTeeth.includes(toothNumber)) return false;
      }

      // Teeth group check
      if (toothNumber && r.teethGroup && r.teethGroup !== 'todos' && TEETH_GROUP_DEFINITIONS[r.teethGroup]) {
        if (!TEETH_GROUP_DEFINITIONS[r.teethGroup].teeth.includes(toothNumber)) return false;
      }

      // Faces check
      if (surfaces && surfaces.length > 0 && r.applicableFaces && r.applicableFaces.length > 0) {
        const matchesFace = surfaces.some(sf => r.applicableFaces!.includes(sf));
        if (!matchesFace) return false;
      }

      return true;
    });

    matchedCustom.forEach(rule => {
      if (!result.some(existing => existing.procedureName.toLowerCase() === rule.procedureDescription.toLowerCase())) {
        result.push({
          id: rule.id,
          tussCode: rule.tussCode || 'CORR-ODONTO',
          procedureName: rule.procedureDescription,
          specialty: rule.specialty,
          suggestedCost: rule.suggestedCost ?? 200,
          regionCode: rule.regionCode || 'Dente'
        });
      }
    });

    // 2. Default suggestions fill up to 3 options
    const defaults = DEFAULT_PROCEDURE_SUGGESTIONS_MAP[conditionType] || DEFAULT_PROCEDURE_SUGGESTIONS_MAP.carie;
    defaults.forEach(def => {
      if (result.length < 3 && !result.some(r => r.procedureName.toLowerCase() === def.procedureName.toLowerCase())) {
        result.push(def);
      }
    });

    return result.slice(0, 3);
  };

  // Smart Calculation of Treatment Plan Items from Odontogram Findings respecting Mode ('convenio' | 'tuss' | 'procedimento' | 'regiao')
  const calculatePlanItemsForTeethAndProcedure = (
    teeth: number[],
    proc: CorrelatedProcedureOption,
    modeOverride?: PlanInclusionMode
  ): TreatmentPlanItem[] => {
    if (teeth.length === 0) return [];

    const effectiveMode = modeOverride || planInclusionMode;
    const matchedRule = correlationRules.find(r => r.id === proc.id || (r.tussCode && r.tussCode === proc.tussCode));
    let mode: RegionAggregationMode = matchedRule?.aggregationMode || 'dente';

    const lowerName = proc.procedureName.toLowerCase();
    const regCode = (proc.regionCode || matchedRule?.regionCode || '').toUpperCase();

    // Auto-detect mode if not explicitly specified on rule
    if (!matchedRule?.aggregationMode) {
      if (['HASD', 'HASE', 'HAIE', 'HAID'].includes(regCode) || lowerName.includes('hemi-arco') || lowerName.includes('hemiarco') || lowerName.includes('quadrante') || lowerName.includes('subgengival')) {
        mode = 'hemiarco';
      } else if (['S1', 'S2', 'S3', 'S4', 'S5', 'S6'].includes(regCode) || lowerName.includes('sextante')) {
        mode = 'sextante';
      } else if (['AS', 'AI'].includes(regCode) || lowerName.includes('por arcada')) {
        mode = 'arcada';
      } else if (regCode === 'ASAI' || lowerName.includes('ambas as arcadas') || lowerName.includes('boca toda') || lowerName.includes('supragengival')) {
        mode = 'ambas_arcadas';
      }
    }

    // Resolve price according to active price table if in convenio mode or matching rule
    let itemCost = proc.suggestedCost;
    if (effectiveMode === 'convenio') {
      const activeTussObj = tussProcedures.find(t => t.code === proc.tussCode);
      if (activeTussObj?.prices?.[selectedPriceTableId]) {
        itemCost = activeTussObj.prices[selectedPriceTableId];
      }
    }

    // Format procedure title based on active inclusion mode
    const formatTitle = (rawName: string, regionSuffix?: string) => {
      if (effectiveMode === 'tuss') {
        return proc.tussCode && proc.tussCode !== 'CORR-ODONTO' ? `[TUSS ${proc.tussCode}] ${rawName}` : rawName;
      }
      if (effectiveMode === 'convenio') {
        return regionSuffix ? `${rawName} (${regionSuffix})` : rawName;
      }
      if (effectiveMode === 'procedimento') {
        return rawName;
      }
      // 'regiao'
      return rawName;
    };

    // If 'regiao' mode is active or rule is strictly 'dente', force tooth-by-tooth with detailed surfaces
    if (effectiveMode === 'regiao' || (effectiveMode !== 'convenio' && mode === 'dente')) {
      return teeth.map(toothNum => {
        const toothData = activeConditions.find(c => c.toothNumber === toothNum);
        const activeSurfaces = toothData?.surfaces 
          ? Object.entries(toothData.surfaces).filter(([_, type]) => type && type !== 'sio').map(s => s[0]).join(', ')
          : 'Geral';

        const surfaceLabel = activeSurfaces || 'Geral';
        const formattedTitle = formatTitle(proc.procedureName);

        return {
          id: `item-${Date.now()}-${Math.floor(Math.random() * 1000000)}-${toothNum}`,
          tussCode: proc.tussCode || 'CORR-ODONTO',
          procedureName: formattedTitle,
          specialty: proc.specialty,
          toothNumber: toothNum,
          toothSurface: surfaceLabel,
          regionCode: 'Dente',
          regionDescription: `Dente #${toothNum}${surfaceLabel !== 'Geral' ? ` (Faces: ${surfaceLabel})` : ''}`,
          cost: itemCost,
          discountPercentage: 0,
          finalCost: itemCost,
          notes: effectiveMode === 'tuss'
            ? `TUSS ANS ${proc.tussCode} • Dente #${toothNum} • Faces: ${surfaceLabel}`
            : effectiveMode === 'procedimento'
            ? `Procedimento Clínico • Dente #${toothNum} • Faces: ${surfaceLabel}`
            : `Cobrança Dente a Dente • Dente #${toothNum} • Faces: ${surfaceLabel}`,
          status: 'pendente' as const
        };
      });
    }

    // Hemi-Arco Aggregation (HASD, HASE, HAIE, HAID) in 'convenio' or 'tuss' mode
    if (mode === 'hemiarco') {
      const grouped = groupTeethByHemiArco(teeth);
      return Object.entries(grouped).map(([code, teethInHemi]) => {
        const { name } = getHemiArcoForTooth(teethInHemi[0]);
        const formattedTitle = formatTitle(proc.procedureName, `${code} - ${name}`);
        return {
          id: `item-${Date.now()}-${Math.floor(Math.random() * 1000000)}-${code}`,
          tussCode: proc.tussCode || 'CORR-ODONTO',
          procedureName: formattedTitle,
          specialty: proc.specialty,
          toothNumber: undefined,
          toothSurface: undefined,
          regionCode: code,
          regionDescription: `${code} - ${name}`,
          cost: itemCost,
          discountPercentage: 0,
          finalCost: itemCost,
          notes: effectiveMode === 'convenio'
            ? `Convênio / Região • ${name} (${code}) • Dentes: ${teethInHemi.map(t => `#${t}`).join(', ')}`
            : `TUSS ANS ${proc.tussCode} • ${name} (${code}) • Dentes: ${teethInHemi.map(t => `#${t}`).join(', ')}`,
          status: 'pendente' as const
        };
      });
    }

    // Sextante Aggregation (S1..S6)
    if (mode === 'sextante') {
      const grouped = groupTeethBySextante(teeth);
      return Object.entries(grouped).map(([code, teethInSext]) => {
        const { name } = getSextanteForTooth(teethInSext[0]);
        const formattedTitle = formatTitle(proc.procedureName, `${code} - ${name}`);
        return {
          id: `item-${Date.now()}-${Math.floor(Math.random() * 1000000)}-${code}`,
          tussCode: proc.tussCode || 'CORR-ODONTO',
          procedureName: formattedTitle,
          specialty: proc.specialty,
          toothNumber: undefined,
          toothSurface: undefined,
          regionCode: code,
          regionDescription: `${code} - ${name}`,
          cost: itemCost,
          discountPercentage: 0,
          finalCost: itemCost,
          notes: effectiveMode === 'convenio'
            ? `Convênio / Região • ${name} (${code}) • Dentes: ${teethInSext.map(t => `#${t}`).join(', ')}`
            : `TUSS ANS ${proc.tussCode} • ${name} (${code}) • Dentes: ${teethInSext.map(t => `#${t}`).join(', ')}`,
          status: 'pendente' as const
        };
      });
    }

    // Arcada Aggregation (AS, AI)
    if (mode === 'arcada') {
      const grouped = groupTeethByArcada(teeth);
      return Object.entries(grouped).map(([code, teethInArcada]) => {
        const { name } = getArcadaForTooth(teethInArcada[0]);
        const formattedTitle = formatTitle(proc.procedureName, `${code} - ${name}`);
        return {
          id: `item-${Date.now()}-${Math.floor(Math.random() * 1000000)}-${code}`,
          tussCode: proc.tussCode || 'CORR-ODONTO',
          procedureName: formattedTitle,
          specialty: proc.specialty,
          toothNumber: undefined,
          toothSurface: undefined,
          regionCode: code,
          regionDescription: `${code} - ${name}`,
          cost: itemCost,
          discountPercentage: 0,
          finalCost: itemCost,
          notes: effectiveMode === 'convenio'
            ? `Convênio / Região • ${name} (${code}) • Dentes: ${teethInArcada.map(t => `#${t}`).join(', ')}`
            : `TUSS ANS ${proc.tussCode} • ${name} (${code}) • Dentes: ${teethInArcada.map(t => `#${t}`).join(', ')}`,
          status: 'pendente' as const
        };
      });
    }

    // Ambas as Arcadas (ASAI / Boca Toda)
    if (mode === 'ambas_arcadas') {
      const formattedTitle = formatTitle(proc.procedureName, `ASAI - Ambas as Arcadas`);
      return [{
        id: `item-${Date.now()}-${Math.floor(Math.random() * 1000000)}-ASAI`,
        tussCode: proc.tussCode || 'CORR-ODONTO',
        procedureName: formattedTitle,
        specialty: proc.specialty,
        toothNumber: undefined,
        toothSurface: undefined,
        regionCode: 'ASAI',
        regionDescription: `ASAI - Ambas as Arcadas (Boca Toda)`,
        cost: itemCost,
        discountPercentage: 0,
        finalCost: itemCost,
        notes: effectiveMode === 'convenio'
          ? `Convênio / Região • Ambas as Arcadas (Boca Toda) • Dentes: ${teeth.map(t => `#${t}`).join(', ')}`
          : `TUSS ANS ${proc.tussCode} • Ambas as Arcadas (Boca Toda) • Dentes: ${teeth.map(t => `#${t}`).join(', ')}`,
        status: 'pendente' as const
      }];
    }

    // Default fallback to tooth-by-tooth
    return teeth.map(toothNum => {
      const toothData = activeConditions.find(c => c.toothNumber === toothNum);
      const activeSurfaces = toothData?.surfaces 
        ? Object.entries(toothData.surfaces).filter(([_, type]) => type && type !== 'sio').map(s => s[0]).join(', ')
        : 'Geral';

      return {
        id: `item-${Date.now()}-${Math.floor(Math.random() * 1000000)}-${toothNum}`,
        tussCode: proc.tussCode || 'CORR-ODONTO',
        procedureName: formatTitle(proc.procedureName),
        specialty: proc.specialty,
        toothNumber: toothNum,
        toothSurface: activeSurfaces || 'Geral',
        regionCode: 'Dente',
        regionDescription: `Dente #${toothNum}`,
        cost: itemCost,
        discountPercentage: 0,
        finalCost: itemCost,
        notes: `Sugerido via Odontograma • Dente #${toothNum}`,
        status: 'pendente' as const
      };
    });
  };

  // Toggle procedure selection inside a card or group
  const toggleProcedureOptionForCard = (cardKey: string, procId: string, allAvailable: CorrelatedProcedureOption[]) => {
    setSelectedProcedureOptionIds(prev => {
      const current = prev[cardKey] || [allAvailable[0]?.id];
      if (current.includes(procId)) {
        // Keep at least 1 selected unless toggling off explicitly
        const filtered = current.filter(id => id !== procId);
        return { ...prev, [cardKey]: filtered };
      } else {
        return { ...prev, [cardKey]: [...current, procId] };
      }
    });
  };

  // Toggle single tooth for batch addition
  const toggleToothForBatch = (toothNum: number) => {
    setSelectedTeethForBatch(prev => 
      prev.includes(toothNum) ? prev.filter(t => t !== toothNum) : [...prev, toothNum]
    );
  };

  // Select or Clear All Teeth for batch
  const selectAllTeethForBatch = (allTeeth: number[]) => {
    setSelectedTeethForBatch(allTeeth);
  };
  const clearTeethForBatch = () => {
    setSelectedTeethForBatch([]);
  };

  // Batch Add Multiple Correlated Procedures for Selected Teeth into Treatment Plan respecting Selected Mode
  const handleAddMultipleCorrelatedProceduresToPlan = (
    teethToApply: number[],
    proceduresToApply: CorrelatedProcedureOption[]
  ) => {
    if (teethToApply.length === 0 || proceduresToApply.length === 0) return;

    const newItems: TreatmentPlanItem[] = [];

    proceduresToApply.forEach(proc => {
      const effectiveProc: CorrelatedProcedureOption = {
        ...proc,
        tussCode: customProcOverrides[proc.id]?.tussCode ?? proc.tussCode,
        procedureName: customProcOverrides[proc.id]?.procedureName ?? proc.procedureName,
        suggestedCost: customProcOverrides[proc.id]?.suggestedCost ?? proc.suggestedCost
      };
      const generated = calculatePlanItemsForTeethAndProcedure(teethToApply, effectiveProc, planInclusionMode);
      newItems.push(...generated);
    });

    if (newItems.length === 0) return;

    if (isCreating) {
      setItems(prev => [...prev, ...newItems]);
    } else {
      const activePlan = patientPlans.find(p => p.status === 'proposto' || p.status === 'em_andamento') || patientPlans[0];
      if (activePlan) {
        const updated = [...activePlan.items, ...newItems];
        const newTotal = updated.reduce((a, c) => a + c.finalCost, 0);
        updateTreatmentPlan(activePlan.id, {
          items: updated,
          totalValue: newTotal,
          finalValue: Math.max(0, newTotal - (activePlan.discountValue || 0))
        });
      } else {
        addTreatmentPlan({
          patientId,
          patientName: patient?.name || 'Paciente',
          title: 'Plano de Tratamento (Odontograma)',
          date: new Date().toISOString().split('T')[0],
          dentistName: activeProfessional?.name || clinicInfo.dentistName,
          status: 'proposto',
          items: newItems,
          totalValue: newItems.reduce((a, c) => a + c.finalCost, 0),
          discountValue: 0,
          finalValue: newItems.reduce((a, c) => a + c.finalCost, 0)
        });
      }
    }

    const uniqueRegions = Array.from(new Set(newItems.map(i => i.regionCode || `Dente #${i.toothNumber}`)));
    const modeLabel = planInclusionMode === 'convenio' ? 'Convênio' : planInclusionMode === 'tuss' ? 'Número TUSS' : planInclusionMode === 'procedimento' ? 'Procedimento' : 'Região/Dente';
    setAddedNotice(`✓ ${newItems.length} item(s) incluído(s) no Plano [Modo: ${modeLabel}] abrangendo ${teethToApply.length} dente(s) [${uniqueRegions.slice(0, 3).join(', ')}${uniqueRegions.length > 3 ? '...' : ''}]!`);
    setTimeout(() => setAddedNotice(null), 4000);
  };

  // Procedure Modules View Modal State
  const [viewingModulesProcedure, setViewingModulesProcedure] = useState<{
    code?: string;
    name?: string;
    specialty?: string;
  } | null>(null);

  // Quick add finding from odontogram correlation tip directly into plan
  const handleAddCorrelatedProcedureToPlan = (toothNum: number, surfaceLabel: string, procDesc: string, specialty: string, cost: number) => {
    const newItem: TreatmentPlanItem = {
      id: `item-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      tussCode: 'CORR-ODONTO',
      procedureName: procDesc,
      specialty,
      toothNumber: toothNum,
      toothSurface: surfaceLabel,
      cost,
      discountPercentage: 0,
      finalCost: cost,
      notes: `Sugerido automaticamente via Odontograma (Dente #${toothNum})`,
      status: 'pendente'
    };

    if (isCreating) {
      setItems(prev => [...prev, newItem]);
    } else {
      const activePlan = patientPlans.find(p => p.status === 'proposto' || p.status === 'em_andamento') || patientPlans[0];
      if (activePlan) {
        const updated = [...activePlan.items, newItem];
        const newTotal = updated.reduce((a, c) => a + c.finalCost, 0);
        updateTreatmentPlan(activePlan.id, {
          items: updated,
          totalValue: newTotal,
          finalValue: Math.max(0, newTotal - (activePlan.discountValue || 0))
        });
      } else {
        addTreatmentPlan({
          patientId,
          patientName: patient?.name || 'Paciente',
          title: 'Plano de Tratamento (Odontograma)',
          date: new Date().toISOString().split('T')[0],
          dentistName: activeProfessional?.name || clinicInfo.dentistName,
          status: 'proposto',
          items: [newItem],
          totalValue: cost,
          discountValue: 0,
          finalValue: cost
        });
      }
    }

    setAddedNotice(`✓ Procedimento "${procDesc}" do Dente #${toothNum} incluído no Plano!`);
    setTimeout(() => setAddedNotice(null), 4000);
  };

  const handleSelectTuss = (proc: TUSSProcedure) => {
    setSelectedTuss(proc);
    setCustomTussCode(proc.code);
    setCustomProcedureName(proc.description);
    const tableCost = proc.prices?.[selectedPriceTableId] ?? proc.suggestedCost;
    setCustomItemCost(tableCost.toString());
    const allowed = proc.allowedRegionsByPriceTable?.[selectedPriceTableId] || proc.allowedRegions;
    if (proc.defaultRegion) {
      setCustomRegionCode(proc.defaultRegion);
      setCustomRegionDesc(proc.defaultRegion);
    } else if (allowed && allowed.length > 0) {
      setCustomRegionCode(allowed[0]);
      setCustomRegionDesc(allowed[0]);
    } else {
      setCustomRegionCode('');
      setCustomRegionDesc('');
    }
  };

  const handleAddItemToPlan = () => {
    if (!selectedTuss) return;

    const tableCost = selectedTuss.prices?.[selectedPriceTableId] ?? selectedTuss.suggestedCost;
    const costNum = parseFloat(customItemCost) || tableCost;
    const finalTuss = customTussCode.trim() || selectedTuss.code;
    const finalProcName = customProcedureName.trim() || selectedTuss.description;

    const activeTableName = priceTables.find(t => t.id === selectedPriceTableId)?.name || 'Particular';

    const newItem: TreatmentPlanItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      tussCode: finalTuss,
      procedureName: finalProcName,
      specialty: selectedTuss.specialty,
      toothNumber: customToothNumber ? parseInt(customToothNumber) : undefined,
      toothSurface: customSurface || undefined,
      regionCode: customRegionCode || selectedTuss.defaultRegion,
      regionDescription: customRegionDesc || customRegionCode || selectedTuss.defaultRegion,
      cost: costNum,
      discountPercentage: 0,
      finalCost: costNum,
      notes: customItemNotes ? `${customItemNotes} (Tabela: ${activeTableName})` : `Tabela: ${activeTableName}`,
      fullProcedureDetails: selectedTuss.fullDescription,
      status: 'pendente'
    };

    setItems(prev => [...prev, newItem]);

    // Reset selection modal
    setSelectedTuss(null);
    setCustomTussCode('');
    setCustomProcedureName('');
    setCustomToothNumber('');
    setCustomSurface('');
    setCustomRegionCode('');
    setCustomRegionDesc('');
    setCustomItemCost('');
    setCustomItemNotes('');
    setIsProcedureModalOpen(false);
  };

  const handleRemoveItem = (itemId: string) => {
    setItems(prev => prev.filter(i => i.id !== itemId));
  };

  const handleUpdateItem = (itemId: string, patch: Partial<TreatmentPlanItem>) => {
    setItems(prev => prev.map(item => {
      if (item.id !== itemId) return item;
      const updated = { ...item, ...patch };
      if ('cost' in patch && !('finalCost' in patch)) {
        updated.finalCost = patch.cost ?? item.finalCost;
      }
      return updated;
    }));
  };

  const handleSavePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0 || !patient) return;

    const total = items.reduce((acc, curr) => acc + (curr.cost || curr.finalCost || 0), 0);
    const finalVal = items.reduce((acc, curr) => acc + (curr.finalCost || 0), 0);

    const activeTable = priceTables.find(t => t.id === selectedPriceTableId);

    if (editingPlanId) {
      updateTreatmentPlan(editingPlanId, {
        title: planTitle,
        priceTableId: selectedPriceTableId,
        priceTableName: activeTable?.name || 'Particular',
        items,
        totalValue: total,
        discountValue: Math.max(0, total - finalVal),
        finalValue: finalVal,
        paymentConditions,
        notes
      });
      setEditingPlanId(null);
      setAddedNotice('✓ Plano de tratamento e procedimentos TUSS atualizados com sucesso!');
      setTimeout(() => setAddedNotice(null), 4000);
    } else {
      addTreatmentPlan({
        patientId,
        patientName: patient.name,
        title: planTitle,
        date: new Date().toISOString().split('T')[0],
        dentistName: clinicInfo.dentistName,
        clinicId: patient.preferredClinicId,
        clinicName: patient.preferredClinicName || clinicInfo.name,
        status: 'proposto',
        priceTableId: selectedPriceTableId,
        priceTableName: activeTable?.name || 'Particular',
        items,
        totalValue: total,
        discountValue: Math.max(0, total - finalVal),
        finalValue: finalVal,
        paymentConditions,
        notes
      });
      setAddedNotice('✓ Novo plano de tratamento cadastrado com sucesso!');
      setTimeout(() => setAddedNotice(null), 4000);
    }

    setIsCreating(false);
    setItems([]);
  };

  const calculatePlanTotals = (planItems: TreatmentPlanItem[]) => {
    const total = planItems.reduce((acc, curr) => acc + (curr.cost || 0), 0);
    const finalVal = planItems.reduce((acc, curr) => acc + (curr.finalCost || 0), 0);
    return { total, finalVal, discount: total - finalVal };
  };

  const filteredTussList = tussProcedures
    .filter(proc => {
      const matchesSpecialty = selectedSpecialty === 'todas' || proc.specialty === selectedSpecialty;
      const matchesSearch = proc.description.toLowerCase().includes(searchTuss.toLowerCase()) ||
                            proc.code.includes(searchTuss) ||
                            proc.specialty.toLowerCase().includes(searchTuss.toLowerCase());
      return matchesSpecialty && matchesSearch;
    })
    .sort((a, b) => a.description.localeCompare(b.description, 'pt-BR', { sensitivity: 'base' }));

  return (
    <div className="space-y-6">
      {/* SEÇÃO UNIFICADA E RESPONSIVA: PLANO DE TRATAMENTO & REGISTRO DE ACHADOS */}
      <div className="bg-[#fbfbf9] p-4 sm:p-5 rounded-3xl border border-[#e5e5d1] space-y-4 shadow-2xs">
        {/* Header Unificado & Responsivo */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#e5e5d1] pb-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#5a5a40] flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-[#d4a373]" />
              Plano de Tratamento & Registro de Achados
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Procedimentos correlacionados aos achados do odontograma, propostas terapêuticas e orçamentos clínicos.
            </p>
          </div>

          {/* Barra de Controles: Somente botões Agrupado e Individual, e Ações Rápidas */}
          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode Switcher - Apenas Agrupado e Individual */}
            <div className="bg-white p-1 rounded-2xl border border-[#e5e5d1] flex items-center gap-1 shadow-2xs">
              <button
                type="button"
                onClick={() => setFindingsViewMode('grouped')}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
                  findingsViewMode === 'grouped' 
                    ? 'bg-[#5a5a40] text-white shadow-2xs' 
                    : 'text-gray-600 hover:bg-[#f0f0e8]'
                }`}
                title="Visualização Agrupada por Tipo de Diagnóstico Clínico"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Agrupado</span>
              </button>
              <button
                type="button"
                onClick={() => setFindingsViewMode('individual')}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
                  findingsViewMode === 'individual' 
                    ? 'bg-[#5a5a40] text-white shadow-2xs' 
                    : 'text-gray-600 hover:bg-[#f0f0e8]'
                }`}
                title="Visualização Individual Dente a Dente"
              >
                <ListFilter className="w-3.5 h-3.5" />
                <span>Individual</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsRulesModalOpen(true)}
              className="px-3 py-1.5 bg-white hover:bg-[#f0f0e8] text-[#5a5a40] border border-[#e5e5d1] font-bold text-xs rounded-2xl flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
            >
              <Settings className="w-3.5 h-3.5 text-[#d4a373]" />
              <span>Regras de Correlação</span>
            </button>

            <button
              type="button"
              onClick={() => setIsTussManagerOpen(true)}
              className="px-3 py-1.5 bg-white hover:bg-[#f0f0e8] text-[#5a5a40] border border-[#e5e5d1] font-bold text-xs rounded-2xl flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
            >
              <Building2 className="w-3.5 h-3.5 text-[#d4a373]" />
              <span>Catálogo TUSS</span>
            </button>

            {!isCreating && (
              <button
                type="button"
                onClick={() => {
                  setIsCreating(true);
                  setEditingPlanId(null);
                  setItems([]);
                  setPlanTitle('Plano de Tratamento Personalizado');
                }}
                className={`px-3.5 py-1.5 ${t.btnPrimaryBg} ${t.btnPrimaryText} font-bold text-xs rounded-2xl flex items-center gap-1.5 shadow-xs transition cursor-pointer`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Novo Plano</span>
              </button>
            )}
          </div>
        </div>

        {addedNotice && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-2xs animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{addedNotice}</span>
          </div>
        )}

        {activeConditions.length === 0 ? (
          <div className="text-center py-6 border-2 border-dashed border-[#e5e5d1] rounded-2xl text-xs text-gray-400 bg-white">
            Nenhum achado registrado no Odontograma. Os diagnósticos assinalados no Odontograma serão correlacionados aqui.
          </div>
        ) : (
          <div className="space-y-4">
            {/* Multi-tooth Batch Selection Top Bar */}
            <div className="bg-amber-50/80 border border-amber-200/90 rounded-2xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-amber-950 flex items-center gap-1">
                  <CheckSquare className="w-4 h-4 text-amber-600" />
                  Seleção de Dentes em Lote:
                </span>
                {selectedTeethForBatch.length > 0 ? (
                  <span className="bg-amber-200 text-amber-900 font-extrabold px-2 py-0.5 rounded-lg text-[11px]">
                    {selectedTeethForBatch.length} dente(s) selecionado(s) ({selectedTeethForBatch.map(t => `#${t}`).join(', ')})
                  </span>
                ) : (
                  <span className="text-amber-800 text-[11px]">
                    Clique nas caixas de seleção dos dentes para aplicar o mesmo tratamento em múltiplos dentes.
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {selectedTeethForBatch.length > 0 ? (
                  <button
                    type="button"
                    onClick={clearTeethForBatch}
                    className="px-2.5 py-1 bg-white hover:bg-rose-50 text-rose-700 font-bold rounded-xl text-[11px] border border-rose-200 transition cursor-pointer"
                  >
                    Desmarcar
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      const allTeethList = activeConditions.map(c => c.toothNumber);
                      selectAllTeethForBatch(allTeethList);
                    }}
                    className="px-2.5 py-1 bg-white hover:bg-amber-100 text-amber-900 font-bold rounded-xl text-[11px] border border-amber-300 transition cursor-pointer"
                  >
                    Selecionar Todos
                  </button>
                )}
              </div>
            </div>

            {/* MODE 1: GROUPED BY CLINICAL FINDING */}
            {findingsViewMode === 'grouped' ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {(() => {
                  // Group active conditions by main condition type
                  const groupsMap: Record<string, {
                    conditionType: ToothConditionType;
                    teeth: number[];
                    surfaceCount: number;
                    notes: string[];
                  }> = {};

                  activeConditions.forEach(cond => {
                    const activeSurfaces = cond.surfaces 
                      ? Object.entries(cond.surfaces).filter(([_, type]) => type && type !== 'sio')
                      : [];
                    
                    const hasWhole = cond.wholeToothCondition && cond.wholeToothCondition !== 'sio';
                    const hasGiro = cond.isGirovertido || cond.wholeToothCondition === 'girovertido';
                    const hasSupra = cond.hasCalculoSupra || cond.wholeToothCondition === 'calculo_supragengival';
                    const hasSub = cond.hasCalculoSub || cond.wholeToothCondition === 'calculo_subgengival';

                    if (activeSurfaces.length === 0 && !hasWhole && !hasGiro && !hasSupra && !hasSub && !cond.notes) {
                      return;
                    }

                    const findingsToRegister: { condType: ToothConditionType; surfCount: number }[] = [];

                    if (hasWhole && cond.wholeToothCondition !== 'girovertido' && cond.wholeToothCondition !== 'calculo_supragengival' && cond.wholeToothCondition !== 'calculo_subgengival') {
                      findingsToRegister.push({ condType: cond.wholeToothCondition!, surfCount: activeSurfaces.length });
                    }
                    if (hasGiro) {
                      findingsToRegister.push({ condType: 'girovertido', surfCount: 0 });
                    }
                    if (hasSupra) {
                      findingsToRegister.push({ condType: 'calculo_supragengival', surfCount: 0 });
                    }
                    if (hasSub) {
                      findingsToRegister.push({ condType: 'calculo_subgengival', surfCount: 0 });
                    }

                    // Surface-specific conditions (e.g. cárie, restauração)
                    const surfaceConds = Array.from(new Set(activeSurfaces.map(([_, type]) => type as ToothConditionType)));
                    surfaceConds.forEach(sCond => {
                      const countForThisCond = activeSurfaces.filter(([_, type]) => type === sCond).length;
                      findingsToRegister.push({ condType: sCond, surfCount: countForThisCond });
                    });

                    // If only notes exist
                    if (findingsToRegister.length === 0 && cond.notes) {
                      findingsToRegister.push({ condType: 'carie', surfCount: 1 });
                    }

                    findingsToRegister.forEach(f => {
                      if (!groupsMap[f.condType]) {
                        groupsMap[f.condType] = {
                          conditionType: f.condType,
                          teeth: [],
                          surfaceCount: f.surfCount,
                          notes: []
                        };
                      }
                      if (!groupsMap[f.condType].teeth.includes(cond.toothNumber)) {
                        groupsMap[f.condType].teeth.push(cond.toothNumber);
                      }
                      if (cond.notes && !groupsMap[f.condType].notes.some(n => n.startsWith(`Dente #${cond.toothNumber}:`))) {
                        groupsMap[f.condType].notes.push(`Dente #${cond.toothNumber}: ${cond.notes}`);
                      }
                    });
                  });

                  const groupEntries = Object.entries(groupsMap);

                  if (groupEntries.length === 0) return null;

                  return groupEntries.map(([condTypeKey, group]) => {
                    const condType = group.conditionType;
                    const suggestions = get3CorrelatedProcedures(condType, group.surfaceCount, correlationRules);

                    const groupCardKey = `group-${condType}`;
                    const selectedProcIds = selectedProcedureOptionIds[groupCardKey] || [suggestions[0]?.id];
                    const chosenProcedures = suggestions.filter(s => selectedProcIds.includes(s.id));

                    // Filter selected teeth in this group
                    const selectedTeethInGroup = group.teeth.filter(t => selectedTeethForBatch.length === 0 || selectedTeethForBatch.includes(t));
                    const isAllGroupTeethSelected = group.teeth.every(t => selectedTeethForBatch.includes(t));

                    // Calculate real items respecting regions & grouping
                    const simulatedItems: TreatmentPlanItem[] = [];
                    chosenProcedures.forEach(proc => {
                      simulatedItems.push(...calculatePlanItemsForTeethAndProcedure(selectedTeethInGroup, proc, planInclusionMode));
                    });
                    const totalCostForGroup = simulatedItems.reduce((acc, item) => acc + item.finalCost, 0);

                    return (
                      <div key={condTypeKey} className="bg-white p-4 rounded-2xl border border-[#e5e5d1] shadow-2xs space-y-3 flex flex-col justify-between">
                        <div className="space-y-3">
                          {/* Group Header */}
                          <div className="flex items-center justify-between border-b border-[#e5e5d1] pb-2">
                            <div className="flex items-center gap-2">
                              <span className="p-1.5 bg-amber-100 text-amber-900 rounded-xl font-bold text-xs uppercase tracking-wider border border-amber-300">
                                {condType.replace('_', ' ')}
                              </span>
                              <span className="text-xs font-bold text-stone-700">
                                ({group.teeth.length} {group.teeth.length === 1 ? 'dente' : 'dentes'})
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                if (isAllGroupTeethSelected) {
                                  setSelectedTeethForBatch(prev => prev.filter(t => !group.teeth.includes(t)));
                                } else {
                                  setSelectedTeethForBatch(prev => Array.from(new Set([...prev, ...group.teeth])));
                                }
                              }}
                              className="text-[11px] font-bold text-[#5a5a40] hover:text-[#d4a373] underline cursor-pointer"
                            >
                              {isAllGroupTeethSelected ? 'Desmarcar Grupo' : 'Selecionar Todo o Grupo'}
                            </button>
                          </div>

                          {/* Teeth List Badges */}
                          <div className="flex flex-wrap gap-1.5">
                            {group.teeth.map(toothNum => {
                              const isSelected = selectedTeethForBatch.includes(toothNum);
                              return (
                                <button
                                  type="button"
                                  key={toothNum}
                                  onClick={() => toggleToothForBatch(toothNum)}
                                  className={`px-2.5 py-1 rounded-xl font-mono text-xs font-bold border transition flex items-center gap-1 cursor-pointer ${
                                    isSelected 
                                      ? 'bg-amber-400 text-amber-950 border-amber-500 shadow-xs ring-2 ring-amber-300' 
                                      : 'bg-[#f0f0e8] text-[#5a5a40] border-[#e5e5d1] hover:bg-amber-100'
                                  }`}
                                >
                                  {isSelected ? <CheckSquare className="w-3 h-3 text-amber-950" /> : <Square className="w-3 h-3 text-stone-400" />}
                                  <span>Dente #{toothNum}</span>
                                </button>
                              );
                            })}
                          </div>

                          {/* Correlated Procedures List (Up to 3 options) */}
                          <div className="space-y-1.5 pt-1">
                            <label className="text-[11px] font-extrabold text-[#5a5a40] uppercase tracking-wider flex items-center gap-1">
                              <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                              Procedimentos Correlacionados Sugeridos:
                            </label>

                            <div className="space-y-1.5">
                              {suggestions.map((proc) => {
                                const isChecked = selectedProcIds.includes(proc.id);
                                return (
                                  <div
                                    key={proc.id}
                                    onClick={() => toggleProcedureOptionForCard(groupCardKey, proc.id, suggestions)}
                                    className={`p-2.5 rounded-xl border text-xs transition cursor-pointer flex items-center justify-between gap-2 ${
                                      isChecked 
                                        ? 'bg-amber-50/90 border-amber-300 text-amber-950 font-bold shadow-2xs' 
                                        : 'bg-[#fbfbf9] border-[#e5e5d1] text-stone-600 opacity-75 hover:opacity-100'
                                    }`}
                                  >
                                    <div className="flex items-start gap-2 min-w-0">
                                      <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={() => {}}
                                        className="mt-0.5 rounded text-amber-600 focus:ring-amber-400 cursor-pointer"
                                      />
                                      <div className="min-w-0">
                                        <p className="font-bold text-[#2c2c2c] truncate text-[11px]">
                                          {customProcOverrides[proc.id]?.procedureName ?? proc.procedureName}
                                        </p>
                                        <div className="flex flex-wrap items-center gap-2 text-[10px] text-stone-500 mt-1">
                                          <div className="flex items-center gap-1">
                                            <span className="font-mono text-[9px] font-bold text-gray-500">TUSS:</span>
                                            <input
                                              type="text"
                                              value={customProcOverrides[proc.id]?.tussCode ?? proc.tussCode}
                                              onClick={(e) => e.stopPropagation()}
                                              onChange={(e) => {
                                                e.stopPropagation();
                                                const val = e.target.value;
                                                setCustomProcOverrides(prev => ({
                                                  ...prev,
                                                  [proc.id]: { ...prev[proc.id], tussCode: val }
                                                }));
                                              }}
                                              className="font-mono text-[10px] font-bold text-[#5a5a40] bg-white border border-[#e5e5d1] rounded px-1.5 py-0.5 focus:border-[#5a5a40] focus:ring-1 focus:ring-[#5a5a40] outline-none w-28 shadow-2xs"
                                              placeholder="TUSS"
                                              title="Código TUSS (editável)"
                                            />
                                          </div>
                                          <span>•</span>
                                          <span className="font-semibold text-[#5a5a40]">{proc.specialty}</span>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                      <span className="font-mono font-bold text-xs text-[#2c2c2c]">
                                        R$ {(customProcOverrides[proc.id]?.suggestedCost ?? proc.suggestedCost).toFixed(2)}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setViewingModulesProcedure({
                                            code: customProcOverrides[proc.id]?.tussCode ?? proc.tussCode,
                                            name: customProcOverrides[proc.id]?.procedureName ?? proc.procedureName,
                                            specialty: proc.specialty
                                          });
                                        }}
                                        className="p-1 text-gray-400 hover:text-[#d4a373] transition cursor-pointer"
                                        title="Ver 4 Módulos do Procedimento"
                                      >
                                        <BookOpen className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        {/* Card Action */}
                        <div className="pt-2 border-t border-[#e5e5d1] space-y-2">
                          <div className="flex items-center justify-between text-[11px] text-stone-600 font-medium">
                            <span>
                              {simulatedItems.length} item(ns) ({chosenProcedures.length} proc. em {selectedTeethInGroup.length} dente(s))
                            </span>
                            <span className="font-mono font-bold text-xs text-[#2c2c2c]">
                              Total: R$ {totalCostForGroup.toFixed(2)}
                            </span>
                          </div>

                          <button
                            type="button"
                            disabled={selectedTeethInGroup.length === 0 || chosenProcedures.length === 0}
                            onClick={() => handleAddMultipleCorrelatedProceduresToPlan(selectedTeethInGroup, chosenProcedures)}
                            className={`w-full py-2 ${t.btnPrimaryBg} ${t.btnPrimaryText} disabled:opacity-50 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition shadow-2xs cursor-pointer`}
                          >
                            <Plus className="w-4 h-4" />
                            <span>
                              Incluir {simulatedItems.length} item(ns) no Plano ({selectedTeethInGroup.length} dentes)
                            </span>
                          </button>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            ) : (
              /* MODE 2: INDIVIDUAL TOOTH CARDS */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {activeConditions.map(cond => {
                  const activeSurfaces = cond.surfaces 
                    ? Object.entries(cond.surfaces).filter(([_, type]) => type && type !== 'sio')
                    : [];
                  
                  if (activeSurfaces.length === 0 && (!cond.wholeToothCondition || cond.wholeToothCondition === 'sio') && !cond.notes) {
                    return null;
                  }

                  const mainCondType: ToothConditionType = (cond.wholeToothCondition && cond.wholeToothCondition !== 'sio') 
                    ? cond.wholeToothCondition 
                    : (activeSurfaces[0]?.[1] as ToothConditionType) || 'carie';

                  const surfaceCount = activeSurfaces.length;
                  const surfaceNames = activeSurfaces.map(s => s[0]).join(', ');

                  const suggestions = get3CorrelatedProcedures(
                    mainCondType, 
                    surfaceCount, 
                    correlationRules, 
                    cond.toothNumber, 
                    activeSurfaces.map(s => s[0] as ToothSurface)
                  );
                  const cardKey = `tooth-${cond.toothNumber}`;
                  const selectedProcIds = selectedProcedureOptionIds[cardKey] || [suggestions[0]?.id];
                  const chosenProcedures = suggestions.filter(s => selectedProcIds.includes(s.id));

                  const isToothSelectedInBatch = selectedTeethForBatch.includes(cond.toothNumber);

                  return (
                    <div 
                      key={cond.toothNumber} 
                      className={`bg-white p-3.5 rounded-2xl border transition shadow-2xs space-y-2 flex flex-col justify-between ${
                        isToothSelectedInBatch ? 'border-amber-400 ring-2 ring-amber-300' : 'border-[#e5e5d1]'
                      }`}
                    >
                      <div className="space-y-2">
                        {/* Tooth Header with Checkbox */}
                        <div className="flex items-center justify-between border-b border-[#e5e5d1] pb-1.5">
                          <label className="flex items-center gap-1.5 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={isToothSelectedInBatch}
                              onChange={() => toggleToothForBatch(cond.toothNumber)}
                              className="rounded text-amber-600 focus:ring-amber-400 cursor-pointer"
                            />
                            <span className="font-mono font-bold text-xs bg-[#f0f0e8] text-[#5a5a40] px-2 py-0.5 rounded-lg border border-[#e5e5d1]">
                              Dente #{cond.toothNumber}
                            </span>
                          </label>

                          <span className="text-[10px] font-bold text-amber-800 uppercase bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                            {mainCondType.replace('_', ' ')}
                          </span>
                        </div>

                        {cond.notes && (
                          <p className="text-[11px] text-gray-500 italic">"{cond.notes}"</p>
                        )}

                        {/* Correlated Procedures List (Up to 3) */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1">
                            <Lightbulb className="w-3 h-3 text-amber-600" /> Procedimentos Recomendados:
                          </label>

                          <div className="space-y-1">
                            {suggestions.map((proc) => {
                              const isChecked = selectedProcIds.includes(proc.id);
                              return (
                                <div
                                  key={proc.id}
                                  onClick={() => toggleProcedureOptionForCard(cardKey, proc.id, suggestions)}
                                  className={`p-2 rounded-xl border text-[11px] transition cursor-pointer flex items-center justify-between gap-1.5 ${
                                    isChecked 
                                      ? 'bg-amber-50 border-amber-300 text-amber-950 font-bold' 
                                      : 'bg-[#fbfbf9] border-[#e5e5d1] text-gray-600 opacity-80'
                                  }`}
                                >
                                  <div className="flex items-start gap-1.5 min-w-0 flex-1">
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={() => {}}
                                      className="mt-0.5 rounded text-amber-600 focus:ring-amber-400 cursor-pointer"
                                    />
                                    <div className="flex flex-col min-w-0 flex-1">
                                      <span className="truncate font-medium text-stone-800 text-[11px]">
                                        {customProcOverrides[proc.id]?.procedureName ?? proc.procedureName}
                                      </span>
                                      <div className="flex items-center gap-1 mt-0.5">
                                        <span className="text-[9px] font-mono font-bold text-gray-400">TUSS:</span>
                                        <input
                                          type="text"
                                          value={customProcOverrides[proc.id]?.tussCode ?? proc.tussCode}
                                          onClick={(e) => e.stopPropagation()}
                                          onChange={(e) => {
                                            e.stopPropagation();
                                            const val = e.target.value;
                                            setCustomProcOverrides(prev => ({
                                              ...prev,
                                              [proc.id]: { ...prev[proc.id], tussCode: val }
                                            }));
                                          }}
                                          className="font-mono text-[10px] font-bold text-[#5a5a40] bg-white border border-[#e5e5d1] rounded px-1.5 py-0.5 focus:border-[#5a5a40] outline-none w-24 shadow-2xs"
                                          placeholder="TUSS"
                                          title="Código TUSS (editável)"
                                        />
                                      </div>
                                    </div>
                                  </div>

                                  <span className="font-mono font-bold text-[11px] shrink-0">
                                    R$ {(customProcOverrides[proc.id]?.suggestedCost ?? proc.suggestedCost).toFixed(2)}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Card Action Button */}
                      <button
                        type="button"
                        disabled={chosenProcedures.length === 0}
                        onClick={() => handleAddMultipleCorrelatedProceduresToPlan([cond.toothNumber], chosenProcedures)}
                        className={`w-full mt-2 py-1.5 ${t.btnPrimaryBg} ${t.btnPrimaryText} disabled:opacity-50 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition shadow-2xs cursor-pointer`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ Incluir {chosenProcedures.length} no Plano</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* CREATE NEW TREATMENT PLAN FORM */}
      {isCreating && (
        <form onSubmit={handleSavePlan} className="bg-[#fbfbf9] border border-[#e5e5d1] rounded-3xl p-5 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-[#e5e5d1] pb-3">
            <h3 className="text-sm font-bold text-[#5a5a40]">Criar Proposta de Tratamento</h3>
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="text-xs text-gray-400 hover:text-gray-700"
            >
              Cancelar
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#5a5a40] mb-1">Título do Plano de Tratamento *</label>
              <input
                type="text"
                required
                value={planTitle}
                onChange={(e) => setPlanTitle(e.target.value)}
                className="w-full bg-white border border-[#e5e5d1] rounded-2xl px-3.5 py-2 text-xs text-[#2c2c2c] focus:outline-none focus:border-[#5a5a40] font-bold"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-[#5a5a40] flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-[#d4a373]" />
                  Convênio Aplicado
                </label>
                <button
                  type="button"
                  onClick={() => setIsAddingNewConvenio(true)}
                  className="text-[10px] font-bold text-[#5a5a40] hover:text-[#2c2c2c] flex items-center gap-1 bg-[#f0f0e8] hover:bg-[#e5e5d1] px-2 py-0.5 rounded-lg border border-[#e5e5d1] transition cursor-pointer"
                  title="Incluir novo convênio à lista"
                >
                  <Plus className="w-3 h-3 text-[#d4a373]" />
                  <span>+ Novo Convênio</span>
                </button>
              </div>
              <select
                value={selectedPriceTableId}
                onChange={(e) => {
                  if (e.target.value === '__novo_convenio__') {
                    setIsAddingNewConvenio(true);
                  } else {
                    setSelectedPriceTableId(e.target.value);
                  }
                }}
                className="w-full bg-white border border-[#e5e5d1] rounded-2xl px-3.5 py-2 text-xs text-[#2c2c2c] focus:outline-none focus:border-[#5a5a40] font-bold"
              >
                {priceTables.map(tbl => (
                  <option key={tbl.id} value={tbl.id}>
                    {tbl.name} {tbl.isDefault ? '(Padrão / Particular)' : ''}
                  </option>
                ))}
                <option value="__novo_convenio__" className="font-bold text-[#5a5a40] bg-amber-50">
                  ➕ + Incluir Novo Convênio...
                </option>
              </select>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-[#5a5a40]">Condições de Pagamento / Parcelamento</label>
                <span className="text-[10px] text-stone-500 italic">Selecione ou personalize</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <select
                  value={
                    PAYMENT_CONDITIONS_CATEGORIES.some(c => c.options.includes(paymentConditions))
                      ? paymentConditions
                      : ''
                  }
                  onChange={(e) => {
                    if (e.target.value) {
                      setPaymentConditions(e.target.value);
                    }
                  }}
                  className="w-full bg-white border border-[#e5e5d1] rounded-2xl px-3 py-2 text-xs text-[#2c2c2c] focus:outline-none focus:border-[#5a5a40]"
                >
                  <option value="">-- Escolha uma Opção Pré-definida --</option>
                  {PAYMENT_CONDITIONS_CATEGORIES.map((cat, catIdx) => (
                    <optgroup key={catIdx} label={cat.category}>
                      {cat.options.map((opt, optIdx) => (
                        <option key={optIdx} value={opt}>{opt}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>

                <input
                  type="text"
                  value={paymentConditions}
                  onChange={(e) => setPaymentConditions(e.target.value)}
                  placeholder="Ou digite termos personalizados..."
                  className="w-full bg-white border border-[#e5e5d1] rounded-2xl px-3.5 py-2 text-xs text-[#2c2c2c] focus:outline-none focus:border-[#5a5a40]"
                />
              </div>

              {/* Botões Rápidos de 1-Clique */}
              <div className="flex flex-wrap gap-1 items-center pt-0.5">
                <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mr-1">Rápidos:</span>
                {[
                  { label: 'PIX (-10%)', val: 'À vista com 10% de desconto no PIX / Transferência Bancária' },
                  { label: 'Cartão 3x s/ juros', val: 'Cartão de Crédito em até 3x sem juros' },
                  { label: 'Cartão 6x s/ juros', val: 'Cartão de Crédito em até 6x sem juros' },
                  { label: 'Cartão 12x s/ juros', val: 'Cartão de Crédito em até 12x sem juros' },
                  { label: 'Entrada 30% + 6x', val: 'Entrada de 30% no PIX/Débito + Saldo em até 6x no Cartão de Crédito' },
                  { label: '50% Início + 50% Conclusão', val: 'Entrada de 50% no Início + 50% na Entrega / Conclusão dos Procedimentos' },
                  { label: 'Boleto 12x', val: 'Boleto Bancário / Carnê da Clínica em até 12x (Financiamento Odontológico)' },
                  { label: 'Por Sessão', val: 'Pagamento por Procedimento Realizado (ao término de cada sessão clínica)' }
                ].map((chip, chipIdx) => (
                  <button
                    key={chipIdx}
                    type="button"
                    onClick={() => setPaymentConditions(chip.val)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-medium border transition cursor-pointer ${
                      paymentConditions === chip.val
                        ? 'bg-[#5a5a40] text-white border-[#5a5a40] font-bold'
                        : 'bg-[#fbfbf9] text-[#5a5a40] border-[#e5e5d1] hover:bg-[#f0f0e8]'
                    }`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>

              {/* Simulação em tempo real do parcelamento quando houver procedimentos */}
              {items.length > 0 && (() => {
                const total = items.reduce((acc, curr) => acc + (curr.finalCost || 0), 0);
                if (total <= 0) return null;

                const matchTimes = paymentConditions.match(/(\d+)x/i);
                const matchEntrada = paymentConditions.match(/entrada de (\d+)%/i);

                let calcNote = '';
                if (paymentConditions.includes('10% de desconto')) {
                  const discounted = total * 0.9;
                  const saved = total * 0.1;
                  calcNote = `Valor com 10% OFF: R$ ${discounted.toFixed(2)} (Economia de R$ ${saved.toFixed(2)})`;
                } else if (paymentConditions.includes('5% de desconto')) {
                  const discounted = total * 0.95;
                  const saved = total * 0.05;
                  calcNote = `Valor com 5% OFF: R$ ${discounted.toFixed(2)} (Economia de R$ ${saved.toFixed(2)})`;
                } else if (matchEntrada && matchTimes) {
                  const perc = parseInt(matchEntrada[1], 10);
                  const inst = parseInt(matchTimes[1], 10);
                  const entradaVal = total * (perc / 100);
                  const saldoVal = total - entradaVal;
                  const parcelaVal = saldoVal / inst;
                  calcNote = `Entrada: R$ ${entradaVal.toFixed(2)} (${perc}%) + ${inst}x de R$ ${parcelaVal.toFixed(2)}`;
                } else if (matchTimes) {
                  const inst = parseInt(matchTimes[1], 10);
                  const parcelaVal = total / inst;
                  calcNote = `${inst}x de R$ ${parcelaVal.toFixed(2)} no cartão`;
                }

                if (!calcNote) return null;

                return (
                  <div className="p-1.5 px-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-900 font-semibold flex items-center gap-1.5">
                    <span className="text-emerald-700">✓ Simulação Financeira:</span>
                    <span>{calcNote}</span>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Table of Included Items */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#5a5a40]">Procedimentos TUSS Selecionados ({items.length})</label>
              <button
                type="button"
                onClick={() => setIsProcedureModalOpen(true)}
                className="px-3 py-1.5 bg-[#f0f0e8] hover:bg-[#e5e5d1] text-[#5a5a40] text-xs font-bold rounded-xl flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5 text-[#d4a373]" /> + Adicionar do Catálogo TUSS
              </button>
            </div>

            {items.length === 0 ? (
              <div className="text-center py-6 border-2 border-dashed border-[#e5e5d1] rounded-2xl text-xs text-gray-400 bg-white">
                Nenhum procedimento incluído no plano. Clique no botão acima para selecionar procedimentos por especialidade.
              </div>
            ) : (
              <div className="overflow-x-auto border border-[#e5e5d1] rounded-2xl bg-white shadow-xs">
                <table className="w-full text-left text-xs text-[#2c2c2c]">
                  <thead className="bg-[#f0f0e8] text-[#5a5a40] uppercase font-mono text-[10px]">
                    <tr>
                      <th className="p-3">Código TUSS / Procedimento</th>
                      <th className="p-3">Especialidade</th>
                      <th className="p-3">Dente / Face</th>
                      <th className="p-3">Região / Localização</th>
                      <th className="p-3">Valor (R$)</th>
                      <th className="p-3 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e5e5d1]">
                    {items.map((item) => (
                      <tr key={item.id} className="hover:bg-[#fbfbf9]">
                        <td className="p-3">
                          <div className="flex flex-wrap items-center gap-1.5 mb-1">
                            <span className="font-mono text-[10px] font-bold text-gray-500">TUSS:</span>
                            <input
                              type="text"
                              value={item.tussCode}
                              onChange={(e) => handleUpdateItem(item.id, { tussCode: e.target.value })}
                              className="font-mono text-[11px] font-bold text-[#5a5a40] bg-white border border-[#e5e5d1] rounded-lg px-2 py-0.5 focus:border-[#5a5a40] focus:ring-1 focus:ring-[#5a5a40] outline-none w-28 shadow-2xs"
                              placeholder="Código TUSS"
                              title="Código TUSS (editável)"
                            />
                            <button
                              type="button"
                              onClick={() => setViewingModulesProcedure({
                                code: item.tussCode,
                                name: item.procedureName,
                                specialty: item.specialty
                              })}
                              className="text-[10px] text-[#5a5a40] hover:text-[#d4a373] font-bold flex items-center gap-1 bg-[#f4f4ec] px-1.5 py-0.5 rounded border border-[#e5e5d1] cursor-pointer"
                            >
                              <BookOpen className="w-3 h-3 text-[#d4a373]" /> 4 Módulos
                            </button>
                          </div>
                          <input
                            type="text"
                            value={item.procedureName}
                            onChange={(e) => handleUpdateItem(item.id, { procedureName: e.target.value })}
                            className="font-bold text-[#2c2c2c] text-xs bg-white border border-transparent hover:border-[#e5e5d1] focus:border-[#5a5a40] rounded px-1.5 py-0.5 w-full outline-none"
                            placeholder="Descrição do procedimento"
                          />
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#f0f0e8] text-[#5a5a40] font-semibold border border-[#e5e5d1]">
                            {item.specialty}
                          </span>
                        </td>
                        <td className="p-3 font-mono font-bold text-[#5a5a40]">
                          {item.toothNumber ? `#${item.toothNumber}` : 'Geral'} {item.toothSurface ? `(${item.toothSurface})` : ''}
                        </td>
                        <td className="p-3 font-mono text-[11px] text-[#2c3e2e]">
                          {formatRegionDisplay(item.regionCode || item.regionDescription)}
                        </td>
                        <td className="p-3 font-mono font-bold text-[#2c2c2c]">
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-500">R$</span>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={item.finalCost}
                              onChange={(e) => handleUpdateItem(item.id, { finalCost: parseFloat(e.target.value) || 0, cost: parseFloat(e.target.value) || 0 })}
                              className="font-mono font-bold text-xs text-[#2c2c2c] bg-white border border-[#e5e5d1] rounded px-1.5 py-0.5 w-24 outline-none focus:border-[#5a5a40]"
                            />
                          </div>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.id)}
                            className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#5a5a40] mb-1">Observações Gerais / Recomendações Terapêuticas</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-white border border-[#e5e5d1] rounded-2xl p-3 text-xs text-[#2c2c2c] focus:outline-none"
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-[#e5e5d1]">
            <div className="text-xs">
              <span className="text-gray-500">Valor Total do Plano: </span>
              <span className="font-mono font-bold text-base text-[#5a5a40]">
                R$ {items.reduce((a, b) => a + b.finalCost, 0).toFixed(2)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsCreating(false);
                  setEditingPlanId(null);
                  setItems([]);
                }}
                className="px-4 py-2 bg-[#f0f0e8] hover:bg-[#e5e5d1] text-[#5a5a40] text-xs font-medium rounded-2xl cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={items.length === 0}
                className={`px-5 py-2 ${t.btnPrimaryBg} ${t.btnPrimaryText} disabled:opacity-50 text-xs font-bold rounded-2xl shadow-xs cursor-pointer`}
              >
                {editingPlanId ? 'Salvar Alterações do Plano' : 'Salvar Plano de Tratamento'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* LIST OF EXISTING TREATMENT PLANS */}
      <div className="space-y-4">
        {patientPlans.length === 0 && !isCreating ? (
          <div className="text-center py-12 bg-[#fbfbf9] rounded-3xl border border-[#e5e5d1] space-y-2">
            <FileCheck2 className="w-10 h-10 mx-auto text-[#d4a373]" />
            <p className="text-xs font-bold text-[#5a5a40]">Nenhum plano de tratamento cadastrado para este paciente.</p>
            <p className="text-[11px] text-gray-400">Clique em "Novo Plano" para adicionar e gerar o PDF completo.</p>
          </div>
        ) : (
          patientPlans.map(plan => {
            const totals = calculatePlanTotals(plan.items);
            return (
              <div key={plan.id} className="bg-white border border-[#e5e5d1] rounded-3xl p-5 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e5e5d1] pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-[#5a5a40]">{plan.title}</h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        plan.status === 'aprovado' ? 'bg-emerald-100 text-emerald-800' :
                        plan.status === 'em_andamento' ? 'bg-amber-100 text-amber-800' :
                        plan.status === 'concluido' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {plan.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400 font-mono mt-0.5">
                      Data: {plan.date} • Resp: {plan.dentistName}
                    </p>
                  </div>

                  {/* Actions: Change Status & Print PDF */}
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={plan.status}
                      onChange={(e) => updateTreatmentPlan(plan.id, { status: e.target.value as any })}
                      className="bg-[#f0f0e8] border border-[#e5e5d1] text-[11px] font-bold text-[#5a5a40] rounded-xl px-2.5 py-1.5 focus:outline-none"
                    >
                      <option value="proposto">Proposto</option>
                      <option value="aprovado">Aprovado</option>
                      <option value="em_andamento">Em Andamento</option>
                      <option value="concluido">Concluído</option>
                      <option value="cancelado">Cancelado</option>
                    </select>

                    {/* Botão de Laudo de Aceite & Formalização */}
                    <button
                      onClick={() => setActiveConsentPlanId(plan.id)}
                      className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-2xs cursor-pointer"
                      title="Laudo de Aceite, Seção Financeira e Anexo Assinado pelo Paciente"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                      <span>Laudo de Aceite {plan.consentAccepted ? '✓' : ''}</span>
                    </button>

                    {/* Botão Editar Plano e Códigos TUSS */}
                    <button
                      type="button"
                      onClick={() => {
                        setEditingPlanId(plan.id);
                        setPlanTitle(plan.title);
                        setSelectedPriceTableId(plan.priceTableId || 'particular');
                        setItems(plan.items ? JSON.parse(JSON.stringify(plan.items)) : []);
                        setPaymentConditions(plan.paymentConditions || '');
                        setNotes(plan.notes || '');
                        setIsCreating(true);
                      }}
                      className="px-3 py-1.5 bg-[#f0f0e8] hover:bg-[#e5e5d1] text-[#5a5a40] border border-[#e5e5d1] text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
                      title="Editar Plano de Tratamento e Códigos TUSS"
                    >
                      <Pencil className="w-3.5 h-3.5 text-[#5a5a40]" />
                      <span>Editar</span>
                    </button>

                    <button
                      onClick={() => setActivePrintPlan(plan)}
                      className={`px-3 py-1.5 ${t.btnPrimaryBg} ${t.btnPrimaryText} text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-2xs cursor-pointer`}
                      title="Imprimir Plano de Tratamento e Descrição Completa"
                    >
                      <Printer className="w-3.5 h-3.5" /> Imprimir
                    </button>

                    <button
                      onClick={() => deleteTreatmentPlan(plan.id)}
                      className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Plan Procedures List */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-[#5a5a40] uppercase tracking-wider block">
                    Procedimentos Inclusos ({plan.items.length})
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {plan.items.map((item, idx) => (
                      <div key={idx} className="bg-[#fbfbf9] p-3 rounded-2xl border border-[#e5e5d1] flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-[10px] bg-white px-1.5 py-0.5 rounded border border-[#e5e5d1] text-gray-500">{item.tussCode}</span>
                            <span className="text-xs font-bold text-[#2c2c2c]">{item.procedureName}</span>
                          </div>
                          <p className="text-[10px] text-gray-500 mt-1 flex items-center gap-2">
                            <span>{item.specialty} • {item.toothNumber ? `Dente #${item.toothNumber}` : 'Arcada Geral'}</span>
                            <button
                              type="button"
                              onClick={() => setViewingModulesProcedure({
                                code: item.tussCode,
                                name: item.procedureName,
                                specialty: item.specialty
                              })}
                              className="text-[10px] text-[#5a5a40] hover:text-[#d4a373] font-bold underline cursor-pointer flex items-center gap-0.5"
                            >
                              <BookOpen className="w-3 h-3 text-[#d4a373]" /> Ver 4 Módulos
                            </button>
                          </p>
                        </div>
                        <span className="font-mono font-bold text-xs text-[#5a5a40] shrink-0">
                          R$ {item.finalCost.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between text-xs pt-2 border-t border-[#e5e5d1] text-gray-500">
                  <span><strong>Condições:</strong> {plan.paymentConditions || 'A combinar'}</span>
                  <div className="font-mono text-sm font-bold text-[#5a5a40]">
                    Total: R$ {totals.finalVal.toFixed(2)}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL 1: SELECT PROCEDURES FROM TUSS DATABASE */}
      {isProcedureModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#2c2c2c]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#e5e5d1] rounded-[32px] max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-[#e5e5d1] pb-3 shrink-0">
              <h3 className="text-base font-serif italic text-[#5a5a40] flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#d4a373]" />
                Catálogo TUSS de Procedimentos por Especialidade
              </h3>
              <button onClick={() => setIsProcedureModalOpen(false)} className="text-gray-400 hover:text-black">✕</button>
            </div>

            {/* Filter Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 shrink-0">
              <div>
                <label className="block text-[11px] font-bold text-[#5a5a40] mb-1">Filtrar por Especialidade</label>
                <select
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                  className="w-full bg-[#fbfbf9] border border-[#e5e5d1] rounded-xl px-3 py-2 text-xs text-[#2c2c2c] focus:outline-none"
                >
                  <option value="todas">Todas as Especialidades</option>
                  <option value="Dentística & Estética">Dentística & Estética</option>
                  <option value="Endodontia">Endodontia</option>
                  <option value="Implantodontia">Implantodontia</option>
                  <option value="Ortodontia">Ortodontia</option>
                  <option value="Periodontia">Periodontia</option>
                  <option value="Prótese Dentária">Prótese Dentária</option>
                  <option value="Cirurgia Bocheco-Maxilo">Cirurgia Bocheco-Maxilo</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#5a5a40] mb-1">Buscar por Nome ou Código TUSS</label>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Ex: Restauração, Implante, Endodontia..."
                    value={searchTuss}
                    onChange={(e) => setSearchTuss(e.target.value)}
                    className="w-full bg-[#fbfbf9] border border-[#e5e5d1] rounded-xl pl-8 pr-3 py-2 text-xs focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* List of TUSS Items */}
            <div className="overflow-y-auto space-y-2 flex-1 pr-1 border-y border-[#e5e5d1] py-3">
              {filteredTussList.map(proc => {
                const isSelected = selectedTuss?.code === proc.code;
                const procCost = proc.prices?.[selectedPriceTableId] ?? proc.suggestedCost;

                return (
                  <div
                    key={proc.code}
                    onClick={() => handleSelectTuss(proc)}
                    className={`p-3.5 rounded-2xl border transition cursor-pointer flex flex-col gap-1.5 ${
                      isSelected 
                        ? 'border-[#5a5a40] bg-[#f0f0e8] ring-2 ring-[#5a5a40]/20' 
                        : 'border-[#e5e5d1] bg-[#fbfbf9] hover:bg-[#f0f0e8]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold bg-white px-2 py-0.5 rounded border border-[#e5e5d1] text-[#5a5a40]">
                          TUSS: {proc.code}
                        </span>
                        <span className="text-xs font-bold text-[#2c2c2c]">{proc.description}</span>
                      </div>
                      <span className="font-mono text-xs font-bold text-[#2d6a4f]">
                        R$ {procCost.toFixed(2)}
                      </span>
                    </div>

                    <p className="text-[11px] text-gray-600 line-clamp-2 leading-relaxed">
                      {proc.fullDescription}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1">
                      <span className="font-semibold text-[#d4a373]">
                        Especialidade: {proc.specialty} {proc.defaultRegion ? `• Região: ${formatRegionDisplay(proc.defaultRegion)}` : ''}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setViewingModulesProcedure({
                              code: proc.code,
                              name: proc.description,
                              specialty: proc.specialty
                            });
                          }}
                          className="px-2 py-0.5 bg-white hover:bg-[#5a5a40] hover:text-white text-[#5a5a40] font-bold text-[10px] rounded-lg border border-[#e5e5d1] transition flex items-center gap-1 cursor-pointer"
                        >
                          <BookOpen className="w-3 h-3 text-[#d4a373]" /> Ver 4 Módulos
                        </button>
                        {isSelected && <span className="font-bold text-[#5a5a40]">✓ Selecionado</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Options when TUSS selected with dedicated separation of Número TUSS and Procedimento TUSS */}
            {selectedTuss && (
              <div className="bg-[#f0f0e8] p-4 rounded-2xl border border-[#e5e5d1] space-y-3.5 shrink-0">
                <div className="flex items-center justify-between border-b border-[#e5e5d1] pb-2">
                  <span className="text-xs font-bold text-[#5a5a40] flex items-center gap-1.5">
                    <Edit2 className="w-3.5 h-3.5 text-[#d4a373]" />
                    <span>Configuração do Procedimento para Inclusão</span>
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white text-[#5a5a40] border border-[#e5e5d1]">
                    Especialidade: {selectedTuss.specialty}
                  </span>
                </div>

                {/* Separation: Convênio / Particular Price Table Selector */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[10px] font-bold text-[#5a5a40] flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-[#d4a373]" />
                        Convênio
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsAddingNewConvenio(true)}
                        className="text-[9px] font-bold text-[#5a5a40] hover:text-[#2c2c2c] flex items-center gap-0.5 bg-white hover:bg-stone-100 px-1.5 py-0.5 rounded border border-[#e5e5d1] transition cursor-pointer"
                        title="Incluir novo convênio à lista"
                      >
                        <Plus className="w-2.5 h-2.5 text-[#d4a373]" />
                        <span>Novo</span>
                      </button>
                    </div>
                    <select
                      value={selectedPriceTableId}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '__novo_convenio__') {
                          setIsAddingNewConvenio(true);
                        } else {
                          setSelectedPriceTableId(val);
                          const tableCost = selectedTuss.prices?.[val] ?? selectedTuss.suggestedCost;
                          setCustomItemCost(tableCost.toString());
                        }
                      }}
                      className="w-full bg-white border border-[#e5e5d1] rounded-xl px-2.5 py-1.5 text-xs font-bold text-[#2c2c2c] focus:outline-none focus:border-[#5a5a40]"
                    >
                      {priceTables.map(tbl => (
                        <option key={tbl.id} value={tbl.id}>
                          {tbl.name} {tbl.isDefault ? '(Padrão / Particular)' : ''}
                        </option>
                      ))}
                      <option value="__novo_convenio__" className="font-bold text-[#5a5a40] bg-amber-50">
                        ➕ + Incluir Novo Convênio...
                      </option>
                    </select>
                  </div>

                  {/* Dedicated Field 1: Número TUSS (Código ANS) */}
                  <div>
                    <label className="block text-[10px] font-bold text-[#5a5a40] mb-1 flex items-center gap-1">
                      <Hash className="w-3 h-3 text-[#d4a373]" />
                      Número TUSS (Código ANS) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: 85100010"
                      value={customTussCode}
                      onChange={(e) => setCustomTussCode(e.target.value)}
                      className="w-full bg-white border border-[#e5e5d1] rounded-xl px-2.5 py-1.5 font-mono text-xs font-bold text-[#2c2c2c] focus:outline-none focus:border-[#5a5a40]"
                    />
                  </div>

                  {/* Dedicated Field 2: Procedimento TUSS (Descrição / Nome) */}
                  <div>
                    <label className="block text-[10px] font-bold text-[#5a5a40] mb-1 flex items-center gap-1">
                      <FileText className="w-3 h-3 text-[#d4a373]" />
                      Procedimento TUSS (Descrição) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Nome do procedimento..."
                      value={customProcedureName}
                      onChange={(e) => setCustomProcedureName(e.target.value)}
                      className="w-full bg-white border border-[#e5e5d1] rounded-xl px-2.5 py-1.5 text-xs font-bold text-[#2c2c2c] focus:outline-none focus:border-[#5a5a40]"
                    />
                  </div>
                </div>

                {/* Region & Tooth Selector */}
                <RegionSelector
                  selectedRegionCode={customRegionCode}
                  selectedToothNumber={customToothNumber ? parseInt(customToothNumber) : undefined}
                  allowedRegions={selectedTuss.allowedRegionsByPriceTable?.[selectedPriceTableId] || selectedTuss.allowedRegions}
                  regionRulesNote={selectedTuss.regionRulesNote}
                  procedureName={customProcedureName || selectedTuss.description}
                  onSelectRegion={(code, desc, cat, teeth) => {
                    setCustomRegionCode(code);
                    setCustomRegionDesc(desc);
                    if (teeth && teeth.length === 1) {
                      setCustomToothNumber(teeth[0].toString());
                    }
                  }}
                  onSelectTooth={(num) => {
                    if (num) setCustomToothNumber(num.toString());
                  }}
                />

                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold text-[#5a5a40] mb-0.5">Dente # (11 a 48, 51 a 85)</label>
                    <input
                      type="number"
                      placeholder="Ex: 26"
                      value={customToothNumber}
                      onChange={(e) => setCustomToothNumber(e.target.value)}
                      className="w-full bg-white border border-[#e5e5d1] rounded-xl px-2.5 py-1.5 font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#5a5a40] mb-0.5">Face (M, D, O, V, L)</label>
                    <input
                      type="text"
                      placeholder="Ex: MOD"
                      value={customSurface}
                      onChange={(e) => setCustomSurface(e.target.value)}
                      className="w-full bg-white border border-[#e5e5d1] rounded-xl px-2.5 py-1.5 uppercase text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#5a5a40] mb-0.5">Valor Proposto (R$)</label>
                    <input
                      type="number"
                      value={customItemCost}
                      onChange={(e) => setCustomItemCost(e.target.value)}
                      className="w-full bg-white border border-[#e5e5d1] rounded-xl px-2.5 py-1.5 font-mono text-xs font-bold text-[#2d6a4f]"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddItemToPlan}
                  className={`w-full py-2.5 ${t.btnPrimaryBg} ${t.btnPrimaryText} font-bold text-xs rounded-xl shadow-xs cursor-pointer flex items-center justify-center gap-1.5`}
                >
                  <Plus className="w-4 h-4" />
                  <span>Adicionar Procedimento ao Plano de Tratamento</span>
                </button>
              </div>
            )}

            <div className="flex items-center justify-end shrink-0 pt-2 border-t border-[#e5e5d1]">
              <button
                type="button"
                onClick={() => setIsProcedureModalOpen(false)}
                className="px-4 py-2 bg-[#f0f0e8] hover:bg-[#e5e5d1] text-[#5a5a40] font-medium text-xs rounded-xl"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: A4 PRINT / PDF PREVIEW OF TREATMENT PLAN & PROCEDURE DESCRIPTIONS */}
      {activePrintPlan && patient && (
        <div 
          onClick={(e) => { if (e.target === e.currentTarget) setActivePrintPlan(null); }}
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex justify-center items-start p-3 sm:p-6 overflow-y-auto print:p-0 print:static print:bg-transparent"
        >
          <div className="bg-white rounded-[28px] max-w-4xl w-full p-6 sm:p-10 shadow-2xl space-y-6 my-4 sm:my-8 font-sans border border-[#e5e5d1] print:shadow-none print:border-none print:p-0 print:my-0 print:rounded-none">
            {/* Modal Controls Header */}
            <div className="flex items-center justify-between border-b border-[#e5e5d1] pb-4 print:hidden shrink-0">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActivePrintPlan(null)}
                  className="px-3.5 py-2 bg-[#f0f0e8] hover:bg-[#e5e5d1] text-[#5a5a40] font-bold text-xs rounded-xl flex items-center gap-2 transition cursor-pointer shadow-2xs"
                  title="Voltar ao Plano de Tratamento"
                >
                  <ArrowLeft className="w-4 h-4 text-[#d4a373]" />
                  <span>Voltar</span>
                </button>
                <h3 className="text-sm font-bold text-[#5a5a40] flex items-center gap-2">
                  <Printer className="w-4 h-4 text-[#d4a373]" />
                  Relatório e Descrição Completa do Plano de Tratamento
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => printDocumentWithTitle({
                    docTitle: 'Plano_de_Tratamento',
                    patientName: patient?.name,
                    date: activePrintPlan?.createdAt || new Date()
                  })}
                  className={`px-4 py-2 ${t.btnPrimaryBg} ${t.btnPrimaryText} text-xs font-bold rounded-xl flex items-center gap-2 shadow-2xs cursor-pointer transition`}
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimir</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActivePrintPlan(null)}
                  className="p-2 text-stone-400 hover:text-stone-800 hover:bg-stone-100 rounded-full transition cursor-pointer"
                  title="Fechar visualização"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* PRINTABLE A4 CONTENT */}
            <div className="relative overflow-visible space-y-6 text-[#2c2c2c] text-xs font-sans p-2 sm:p-4 print:p-0">
              {/* Centered Watermark Image (Non-intrusive z-0 layer with grayscale and gentle opacity) */}
              {(clinicInfo.showWatermark ?? true) && (clinicInfo.watermarkUrl || clinicInfo.logoUrl) && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-8 z-0 overflow-hidden">
                  <img
                    src={clinicInfo.watermarkUrl || clinicInfo.logoUrl}
                    alt="Marca d'Água"
                    className="w-[400px] h-[400px] max-w-[80%] max-h-[80%] object-contain mix-blend-multiply filter grayscale"
                    style={{ 
                      opacity: Math.min(0.08, ((clinicInfo.watermarkOpacity ?? 15) / 100) * 0.4) 
                    }}
                  />
                </div>
              )}

              {/* Header with Clinic & Dentist Info */}
              <div className="relative z-10 bg-white/95 backdrop-blur-[1px] border-b-2 border-[#5a5a40] pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  {clinicInfo.logoUrl && (
                    <img src={clinicInfo.logoUrl} alt="Logo" className="w-16 h-16 object-contain rounded-2xl border border-[#e5e5d1] p-1 shrink-0 bg-white" />
                  )}
                  <div>
                    <h1 className="text-base sm:text-lg font-bold text-[#5a5a40] uppercase tracking-tight">{clinicInfo.name}</h1>
                    <p className="text-xs text-stone-800 font-bold">{clinicInfo.dentistName} • CRO {clinicInfo.cro}</p>
                    <p className="text-[11px] text-stone-600">{clinicInfo.specialty} • {clinicInfo.address} • {clinicInfo.city}</p>
                    <p className="text-[11px] text-stone-600">Tel/WhatsApp: {clinicInfo.phone} • Email: {clinicInfo.email}</p>
                  </div>
                </div>

                <div className="text-right sm:text-right shrink-0">
                  <span className="inline-block px-3 py-1 bg-[#f0f0e8] text-[#5a5a40] font-bold text-[10px] uppercase tracking-wider rounded-lg border border-[#e5e5d1]">
                    Documento Oficial de Orçamento
                  </span>
                  <p className="font-mono text-[11px] text-stone-500 mt-1">Data: {activePrintPlan.date}</p>
                </div>
              </div>

              {/* Document Title & Patient Header */}
              <div className="relative z-10 bg-white/95 backdrop-blur-[1px] p-4 rounded-2xl border border-[#e5e5d1] space-y-3 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-[#e5e5d1] pb-2">
                  <h2 className="text-sm font-bold text-[#5a5a40] uppercase tracking-wide">{activePrintPlan.title}</h2>
                  <span className="text-[11px] font-semibold text-stone-600">
                    Status: <span className="uppercase text-amber-800 font-bold">{activePrintPlan.status}</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-xs">
                  <div><strong className="text-stone-700">Paciente:</strong> <span className="font-semibold text-stone-900">{patient.name}</span></div>
                  <div><strong className="text-stone-700">CPF:</strong> <span className="font-mono">{patient.cpf || 'Não informado'}</span></div>
                  <div><strong className="text-stone-700">Convênio:</strong> <span>{patient.healthInsurance || 'Particular'}</span></div>
                  <div className="sm:col-span-2 text-[11px] text-stone-700 bg-[#fbfbf9] p-2 rounded-xl border border-[#e5e5d1]">
                    <strong>Data de nascimento:</strong> {getPatientAgeAndBirthDate(patient.birthDate).birthDateFormatted} • <strong>Idade e meses:</strong> {getPatientAgeAndBirthDate(patient.birthDate).ageText}
                  </div>
                  <div><strong className="text-stone-700">Profissional:</strong> {activePrintPlan.dentistName}</div>
                </div>
              </div>

              {/* Treatment Plan Summary Table */}
              <div className="relative z-10 bg-white/95 backdrop-blur-[1px] space-y-3">
                <h3 className="text-xs font-bold text-[#5a5a40] uppercase tracking-wider border-b border-[#e5e5d1] pb-1 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#d4a373]" />
                  Resumo do Plano de Tratamento e Cronograma Proposto
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse border border-[#e5e5d1]">
                    <thead>
                      <tr className="bg-[#f0f0e8] text-[#5a5a40] text-[10px] uppercase font-mono">
                        <th className="p-2 border border-[#e5e5d1]">Cód. TUSS</th>
                        <th className="p-2 border border-[#e5e5d1]">Procedimento</th>
                        <th className="p-2 border border-[#e5e5d1]">Especialidade</th>
                        <th className="p-2 border border-[#e5e5d1]">Dente/Face</th>
                        <th className="p-2 border border-[#e5e5d1]">Região</th>
                        <th className="p-2 border border-[#e5e5d1] text-right">Valor Final</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activePrintPlan.items.map((item, idx) => (
                        <tr key={idx} className={`border-b border-[#e5e5d1] ${idx % 2 === 0 ? 'bg-white' : 'bg-[#fbfbf9]'}`}>
                          <td className="p-2 border border-[#e5e5d1] font-mono text-[10px] text-stone-600">{item.tussCode || '---'}</td>
                          <td className="p-2 border border-[#e5e5d1] font-bold text-stone-900">{item.procedureName}</td>
                          <td className="p-2 border border-[#e5e5d1] text-stone-600 text-[11px]">{item.specialty}</td>
                          <td className="p-2 border border-[#e5e5d1] font-mono text-stone-800">{item.toothNumber ? `#${item.toothNumber}` : 'Geral'} {item.toothSurface || ''}</td>
                          <td className="p-2 border border-[#e5e5d1] font-mono text-[10px] text-stone-600">{formatRegionDisplay(item.regionCode || item.regionDescription)}</td>
                          <td className="p-2 border border-[#e5e5d1] text-right font-mono font-bold text-stone-900">R$ {item.finalCost.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-between items-center bg-[#f0f0e8] p-3.5 rounded-xl border border-[#e5e5d1] font-mono font-bold text-stone-800">
                  <span>VALOR TOTAL INVESTIDO:</span>
                  <span className="text-base text-[#5a5a40] font-extrabold">R$ {activePrintPlan.finalValue.toFixed(2)}</span>
                </div>
                {activePrintPlan.paymentConditions && (
                  <p className="text-[11px] text-stone-700 bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                    <strong>Condições de Pagamento:</strong> {activePrintPlan.paymentConditions}
                  </p>
                )}
              </div>

              {/* DETAILED PROCEDURAL DESCRIPTIONS FOR EACH ITEM */}
              <div className="relative z-10 bg-white/95 backdrop-blur-[1px] space-y-4 pt-4 border-t-2 border-[#5a5a40]">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-[#5a5a40] uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-[#d4a373]" />
                    Descrição Técnica e Protocolo Clínico dos Procedimentos
                  </h3>
                  <span className="text-[10px] text-stone-500 font-mono">
                    {activePrintPlan.items.length} item(ns) detalhado(s)
                  </span>
                </div>

                <div className="space-y-3">
                  {activePrintPlan.items.map((item, idx) => (
                    <div 
                      key={idx} 
                      className="bg-white p-4 rounded-2xl border border-[#e5e5d1] shadow-2xs space-y-2 relative z-10"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-1 border-b border-[#e5e5d1] pb-2">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-[#f0f0e8] text-[#5a5a40] font-bold text-[10px] flex items-center justify-center shrink-0 border border-[#e5e5d1]">
                            {idx + 1}
                          </span>
                          <span className="font-bold text-[#5a5a40] text-xs">
                            {item.procedureName} {item.toothNumber ? `(Dente #${item.toothNumber})` : ''}
                          </span>
                        </div>
                        <span className="font-mono text-[10px] font-bold bg-[#f0f0e8] text-[#5a5a40] px-2 py-0.5 rounded-md border border-[#e5e5d1]">
                          TUSS: {item.tussCode || 'S/N'}
                        </span>
                      </div>

                      <p className="text-[11px] text-stone-800 leading-relaxed text-justify font-sans pt-0.5">
                        {item.fullProcedureDetails || 'Procedimento odontológico especializado executado sob rigoroso protocolo asséptico e anestésico quando indicado, visando à restauração estética e funcional do elemento dental.'}
                      </p>

                      {item.notes && (
                        <div className="text-[10px] text-amber-900 bg-amber-50/90 p-2.5 rounded-xl border border-amber-200/90 mt-1">
                          <strong className="text-amber-950">Observação Técnica do Cirurgião:</strong> {item.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Patient Signature & Digital Certification Block */}
              <div className="relative z-10 bg-white/95 backdrop-blur-[1px] pt-6 border-t border-[#e5e5d1] space-y-5">
                <p className="text-[10px] text-stone-600 text-justify leading-relaxed bg-[#fbfbf9] p-3 rounded-xl border border-[#e5e5d1]">
                  Declaro ter sido devidamente informado(a) pelo cirurgião-dentista responsável sobre a natureza do plano de tratamento proposto, etapas clínicas, valores, prazos estimados, formas de pagamento e condutas pós-procedimento para manutenção da saúde bucal.
                </p>

                <div className="pt-3 grid grid-cols-1 sm:grid-cols-2 gap-6 items-end">
                  <div className="text-center">
                    <div className="w-56 mx-auto border-t border-stone-800 pt-1">
                      <p className="font-bold text-xs text-[#5a5a40]">{patient.name}</p>
                      <span className="text-[10px] text-stone-500">Assinatura do Paciente / Responsável</span>
                    </div>
                  </div>

                  <div className="text-center">
                    <DocumentSignatureFooter customDentistName={activePrintPlan.dentistName} />
                  </div>
                </div>

                {clinicInfo.footerText && (
                  <p className="text-[9px] text-stone-500 text-center leading-tight pt-2 border-t border-stone-200">{clinicInfo.footerText}</p>
                )}
              </div>
            </div>

            {/* Modal Bottom Action Controls (Hidden on Print) */}
            <div className="flex items-center justify-between pt-4 border-t border-[#e5e5d1] print:hidden shrink-0">
              <button
                type="button"
                onClick={() => setActivePrintPlan(null)}
                className="px-4 py-2 bg-[#f0f0e8] hover:bg-[#e5e5d1] text-[#5a5a40] font-bold text-xs rounded-xl flex items-center gap-2 transition cursor-pointer shadow-2xs"
              >
                <ArrowLeft className="w-4 h-4 text-[#d4a373]" />
                <span>Voltar ao Plano de Tratamento</span>
              </button>

              <button
                type="button"
                onClick={() => printDocumentWithTitle({
                  docTitle: 'Plano_de_Tratamento',
                  patientName: patient?.name,
                  date: activePrintPlan?.createdAt || new Date()
                })}
                className={`px-5 py-2.5 ${t.btnPrimaryBg} ${t.btnPrimaryText} font-bold text-xs rounded-xl flex items-center gap-2 shadow-2xs cursor-pointer transition`}
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: CONFIGURAR REGRAS DE CORRELAÇÃO DO ODONTOGRAMA & PROCEDIMENTOS TUSS */}
      {isRulesModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#2c2c2c]/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white border border-[#e5e5d1] rounded-[28px] max-w-6xl w-full p-4 sm:p-6 shadow-2xl space-y-5 my-auto max-h-[92vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e5e5d1] pb-3 shrink-0">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    resetRuleForm();
                    setIsRulesModalOpen(false);
                  }}
                  className="px-3.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 border border-[#e5e5d1] shadow-2xs shrink-0"
                  title="Voltar para a tela anterior"
                >
                  <ArrowLeft className="w-4 h-4 text-[#5a5a40]" />
                  <span>Voltar</span>
                </button>
                <div>
                  <h3 className="text-base sm:text-lg font-serif italic text-[#5a5a40] flex items-center gap-2">
                    <Settings className="w-5 h-5 text-[#d4a373]" />
                    Gerenciador de Regras de Correlação, TUSS & Convênios
                  </h3>
                  <p className="text-xs text-gray-500">
                    Personalize cada procedimento sugerido: código TUSS, convênio, se é por Face (e quais faces), por Dente (e quais dentes) ou por Área/Região (e quais regiões).
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Deseja restaurar todas as regras para os padrões de fábrica do sistema? Suas regras personalizadas serão resetadas.')) {
                      setCorrelationRules(DEFAULT_CORRELATION_RULES);
                      resetRuleForm();
                    }
                  }}
                  className="px-3 py-1.5 bg-[#f0f0e8] hover:bg-[#e5e5d1] text-[#5a5a40] rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                  title="Restaurar padrões de catálogo e regras clínicas"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-[#5a5a40]" />
                  <span className="hidden sm:inline">Restaurar Padrões</span>
                </button>
                <button
                  type="button"
                  onClick={handleExportRulesCSV}
                  className="px-3 py-1.5 bg-[#2c3e2e] hover:bg-[#1b2a1d] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
                  title="Exportar tabela de regras em formato CSV / Excel"
                >
                  <Download className="w-3.5 h-3.5 text-[#d4a373]" />
                  <span>Exportar CSV</span>
                </button>
                <button 
                  onClick={() => {
                    resetRuleForm();
                    setIsRulesModalOpen(false);
                  }} 
                  className="text-gray-400 hover:text-[#2c2c2c] p-1.5 rounded-lg hover:bg-stone-100 transition cursor-pointer"
                  title="Fechar janela"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="overflow-y-auto space-y-5 pr-1 flex-1">
              {/* Form to Add / Edit Correlation Rule */}
              <form 
                id="correlation-rules-form-container"
                onSubmit={handleSaveRule} 
                className={`p-4 sm:p-5 rounded-2xl border transition space-y-4 ${
                  editingRuleId 
                    ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-200/60 shadow-md' 
                    : 'bg-[#fbfbf9] border-[#e5e5d1] shadow-2xs'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#e5e5d1]/70 pb-2">
                  <div className="flex items-center gap-2">
                    <span className={`p-1.5 rounded-lg ${editingRuleId ? 'bg-amber-200 text-amber-900' : 'bg-[#e5e5d1] text-[#5a5a40]'}`}>
                      {editingRuleId ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4 text-[#d4a373]" />}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-[#5a5a40] uppercase tracking-wider">
                        {editingRuleId ? 'Editando Procedimento & Regra de Correlação' : 'Adicionar / Personalizar Novo Procedimento'}
                      </h4>
                      <p className="text-[11px] text-gray-500">
                        {editingRuleId ? 'Ajuste os parâmetros abaixo e clique em Atualizar Regra para salvar as alterações.' : 'Preencha os campos abaixo para criar uma regra de correlação personalizada para qualquer convênio.'}
                      </p>
                    </div>
                  </div>

                  {editingRuleId && (
                    <button
                      type="button"
                      onClick={resetRuleForm}
                      className="px-2.5 py-1 bg-white hover:bg-stone-100 text-stone-700 text-xs font-bold rounded-lg border border-stone-300 transition cursor-pointer"
                    >
                      Cancelar Edição
                    </button>
                  )}
                </div>

                {/* Rol TUSS Search & Auto-complete */}
                <div className="relative">
                  <label className="block text-[11px] font-bold text-[#5a5a40] mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Search className="w-3.5 h-3.5 text-[#d4a373]" />
                      Localizar no Catálogo TUSS / ANS Oficial (Preenchimento Rápido)
                    </span>
                    <span className="text-[10px] text-gray-400 font-normal">
                      Opcional: selecione para preencher código, nome e especialidade automaticamente
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Pesquise por código TUSS, nome do procedimento ou especialidade..."
                      value={tussDropdownSearch}
                      onChange={(e) => {
                        setTussDropdownSearch(e.target.value);
                        setIsTussDropdownOpen(true);
                      }}
                      onFocus={() => setIsTussDropdownOpen(true)}
                      className="w-full bg-white border border-[#e5e5d1] rounded-xl pl-8 pr-8 py-2 text-xs font-bold text-[#2c2c2c] focus:outline-none focus:border-[#5a5a40] shadow-2xs"
                    />
                    <Search className="w-4 h-4 text-stone-400 absolute left-2.5 top-2.5" />
                    {tussDropdownSearch && (
                      <button
                        type="button"
                        onClick={() => {
                          setTussDropdownSearch('');
                          setIsTussDropdownOpen(false);
                        }}
                        className="absolute right-2.5 top-2.5 text-stone-400 hover:text-stone-600 cursor-pointer"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {isTussDropdownOpen && (
                    <div className="absolute z-30 left-0 right-0 mt-1 bg-white border border-[#e5e5d1] rounded-2xl shadow-xl max-h-56 overflow-y-auto divide-y divide-[#f0f0e8]">
                      {tussProcedures
                        .filter(proc => {
                          if (!tussDropdownSearch.trim()) return true;
                          const q = tussDropdownSearch.toLowerCase();
                          return (
                            proc.code.toLowerCase().includes(q) ||
                            proc.description.toLowerCase().includes(q) ||
                            proc.specialty.toLowerCase().includes(q)
                          );
                        })
                        .slice(0, 25)
                        .map(proc => (
                          <div
                            key={proc.code}
                            onClick={() => {
                              setNewRuleTussCode(proc.code);
                              setNewRuleDesc(proc.description);
                              setNewRuleSpec(proc.specialty);
                              const tableCost = proc.prices?.[newRulePriceTableId] ?? proc.suggestedCost;
                              setNewRuleCost(tableCost.toString());
                              if (proc.defaultRegion) {
                                setNewRuleRegionCode(proc.defaultRegion);
                              }
                              // Auto-detect scope type
                              const descLower = proc.description.toLowerCase();
                              if (descLower.includes('face') || descLower.includes('restauração')) {
                                setNewRuleScopeType('face');
                              } else if (descLower.includes('arcada') || descLower.includes('hemiarco') || descLower.includes('quadrante') || descLower.includes('sextante') || descLower.includes('raspagem')) {
                                setNewRuleScopeType('area');
                              } else {
                                setNewRuleScopeType('dente');
                              }
                              setTussDropdownSearch(`[${proc.code}] ${proc.description}`);
                              setIsTussDropdownOpen(false);
                            }}
                            className="p-2.5 hover:bg-amber-50 cursor-pointer text-xs flex items-center justify-between gap-2 transition"
                          >
                            <div className="min-w-0">
                              <p className="font-bold text-[#2c2c2c] text-[11px] truncate">{proc.description}</p>
                              <p className="text-[10px] text-stone-500 font-mono">TUSS: {proc.code} • {proc.specialty}</p>
                            </div>
                            <span className="font-mono font-bold text-xs text-[#5a5a40] shrink-0">
                              R$ {(proc.prices?.[newRulePriceTableId] ?? proc.suggestedCost).toFixed(2)}
                            </span>
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                {/* Basic Procedure Fields: TUSS, Descrição, Especialidade, Condição */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
                  <div className="sm:col-span-3">
                    <label className="block text-[11px] font-bold text-[#5a5a40] mb-1 flex items-center gap-1">
                      <Hash className="w-3 h-3 text-[#d4a373]" />
                      Número TUSS (Código ANS) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: 81000030"
                      value={newRuleTussCode}
                      onChange={(e) => setNewRuleTussCode(e.target.value)}
                      className="w-full bg-white border border-[#e5e5d1] rounded-xl p-2 text-xs font-mono font-bold text-[#2c2c2c] focus:outline-none focus:border-[#5a5a40]"
                    />
                  </div>

                  <div className="sm:col-span-5">
                    <label className="block text-[11px] font-bold text-[#5a5a40] mb-1 flex items-center gap-1">
                      <FileText className="w-3 h-3 text-[#d4a373]" />
                      Descrição do Procedimento *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Nome do procedimento odontológico..."
                      value={newRuleDesc}
                      onChange={(e) => setNewRuleDesc(e.target.value)}
                      className="w-full bg-white border border-[#e5e5d1] rounded-xl p-2 text-xs font-bold text-[#2c2c2c] focus:outline-none focus:border-[#5a5a40]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-[#5a5a40] mb-1">Especialidade</label>
                    <input
                      type="text"
                      placeholder="Dentística, Periodontia..."
                      value={newRuleSpec}
                      onChange={(e) => setNewRuleSpec(e.target.value)}
                      className="w-full bg-white border border-[#e5e5d1] rounded-xl p-2 text-xs font-bold text-[#2c2c2c] focus:outline-none focus:border-[#5a5a40]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-[#5a5a40] mb-1">Achado Clínico</label>
                    <select
                      value={newRuleCond}
                      onChange={(e) => setNewRuleCond(e.target.value as ToothConditionType)}
                      className="w-full bg-white border border-[#e5e5d1] rounded-xl p-2 text-xs font-bold text-[#5a5a40] focus:outline-none focus:border-[#5a5a40]"
                    >
                      <option value="carie">Cárie</option>
                      <option value="restauracao_insatisfatoria">Restauração Insatisfatória</option>
                      <option value="canal">Endodontia / Canal</option>
                      <option value="extracao_indicada">Extração Indicada</option>
                      <option value="ausente">Dente Ausente</option>
                      <option value="implante">Implante</option>
                      <option value="protese">Prótese / Coroa</option>
                      <option value="calculo_supragengival">Cálculo Supragengival</option>
                      <option value="calculo_subgengival">Cálculo Subgengival</option>
                      <option value="girovertido">Giroversão / Ortodontia</option>
                    </select>
                  </div>
                </div>

                {/* Convênio & Valor */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
                  <div className="sm:col-span-4">
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-bold text-[#5a5a40] flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-[#d4a373]" />
                        Convênio
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsAddingNewConvenio(true)}
                        className="text-[10px] font-bold text-[#5a5a40] hover:text-[#2c2c2c] flex items-center gap-1 bg-[#f0f0e8] hover:bg-[#e5e5d1] px-2 py-0.5 rounded-lg border border-[#e5e5d1] transition cursor-pointer"
                        title="Cadastrar e incluir novo convênio à lista"
                      >
                        <Plus className="w-3 h-3 text-[#d4a373]" />
                        <span>+ Novo Convênio</span>
                      </button>
                    </div>
                    <select
                      value={newRulePriceTableId}
                      onChange={(e) => {
                        if (e.target.value === '__novo_convenio__') {
                          setIsAddingNewConvenio(true);
                        } else {
                          setNewRulePriceTableId(e.target.value);
                        }
                      }}
                      className="w-full bg-white border border-[#e5e5d1] rounded-xl p-2 text-xs font-bold text-[#5a5a40] focus:outline-none focus:border-[#5a5a40]"
                    >
                      {priceTables.map(tbl => (
                        <option key={tbl.id} value={tbl.id}>
                          {tbl.name} {tbl.isDefault ? '(Padrão / Particular)' : ''}
                        </option>
                      ))}
                      <option value="__novo_convenio__" className="font-bold text-[#5a5a40] bg-amber-50">
                        ➕ + Incluir Novo Convênio...
                      </option>
                    </select>
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-[11px] font-bold text-[#5a5a40] mb-1 flex items-center gap-1">
                      <DollarSign className="w-3 h-3 text-emerald-600" />
                      Valor Sugerido (R$) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={newRuleCost}
                      onChange={(e) => setNewRuleCost(e.target.value)}
                      className="w-full bg-white border border-[#e5e5d1] rounded-xl p-2 text-xs font-mono font-bold text-amber-900 focus:outline-none focus:border-[#5a5a40]"
                    />
                  </div>

                  <div className="sm:col-span-5">
                    <label className="block text-[11px] font-bold text-[#5a5a40] mb-1">
                      Notas Clínicas / Protocolo (Opcional)
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Anestesia local infiltrativa + isolamento absoluto..."
                      value={newRuleNotes}
                      onChange={(e) => setNewRuleNotes(e.target.value)}
                      className="w-full bg-white border border-[#e5e5d1] rounded-xl p-2 text-xs text-stone-700 focus:outline-none focus:border-[#5a5a40]"
                    />
                  </div>
                </div>

                {/* ESCOPO DE APLICAÇÃO: POR FACE, POR DENTE OU POR ÁREA / REGIÃO */}
                <div className="p-3.5 bg-white rounded-xl border border-[#e5e5d1] space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-[#5a5a40] uppercase tracking-wider flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-[#d4a373]" />
                      Tipo de Cobrança / Escopo de Aplicação:
                    </span>

                    {/* Scope Selector Pills */}
                    <div className="flex items-center gap-1 bg-[#f0f0e8] p-1 rounded-xl border border-[#e5e5d1]">
                      <button
                        type="button"
                        onClick={() => setNewRuleScopeType('face')}
                        className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                          newRuleScopeType === 'face'
                            ? 'bg-amber-600 text-white shadow-2xs'
                            : 'text-stone-600 hover:text-stone-900'
                        }`}
                      >
                        💎 Por Face(s)
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewRuleScopeType('dente')}
                        className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                          newRuleScopeType === 'dente'
                            ? 'bg-amber-600 text-white shadow-2xs'
                            : 'text-stone-600 hover:text-stone-900'
                        }`}
                      >
                        🦷 Por Dente / Grupo
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewRuleScopeType('area')}
                        className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                          newRuleScopeType === 'area'
                            ? 'bg-amber-600 text-white shadow-2xs'
                            : 'text-stone-600 hover:text-stone-900'
                        }`}
                      >
                        📐 Por Área / Região
                      </button>
                    </div>
                  </div>

                  {/* 1. SELETOR DETALHADO POR FACE */}
                  {newRuleScopeType === 'face' && (
                    <div className="p-3 bg-amber-50/40 rounded-xl border border-amber-200/70 space-y-2.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs font-bold text-amber-950">
                          Configuração de Faces Anatômicas:
                        </span>
                        
                        {/* Quick Selection Buttons */}
                        <div className="flex flex-wrap items-center gap-1">
                          <span className="text-[10px] text-gray-500 font-medium mr-1">Atalhos rápidos:</span>
                          <button
                            type="button"
                            onClick={() => {
                              setNewRuleMinSurf('1');
                              setNewRuleMaxSurf('5');
                              setNewRuleApplicableFaces(['oclusal', 'mesial', 'distal', 'vestibular', 'lingual']);
                            }}
                            className="px-2 py-0.5 text-[10px] font-bold bg-white hover:bg-amber-100 text-stone-700 rounded border border-stone-200 cursor-pointer"
                          >
                            Qualquer Face
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setNewRuleMinSurf('1');
                              setNewRuleMaxSurf('1');
                              setNewRuleApplicableFaces(['oclusal']);
                            }}
                            className="px-2 py-0.5 text-[10px] font-bold bg-white hover:bg-amber-100 text-stone-700 rounded border border-stone-200 cursor-pointer"
                          >
                            1 Face (Oclusal)
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setNewRuleMinSurf('2');
                              setNewRuleMaxSurf('2');
                              setNewRuleApplicableFaces(['mesial', 'oclusal']);
                            }}
                            className="px-2 py-0.5 text-[10px] font-bold bg-white hover:bg-amber-100 text-stone-700 rounded border border-stone-200 cursor-pointer"
                          >
                            2 Faces (MO)
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setNewRuleMinSurf('3');
                              setNewRuleMaxSurf('3');
                              setNewRuleApplicableFaces(['mesial', 'oclusal', 'distal']);
                            }}
                            className="px-2 py-0.5 text-[10px] font-bold bg-white hover:bg-amber-100 text-stone-700 rounded border border-stone-200 cursor-pointer"
                          >
                            3 Faces (MOD)
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                        <div className="sm:col-span-3 flex items-center gap-2">
                          <div>
                            <label className="block text-[10px] font-bold text-gray-600 mb-0.5">Mín. Faces</label>
                            <input
                              type="number"
                              min="0"
                              max="5"
                              value={newRuleMinSurf}
                              onChange={(e) => setNewRuleMinSurf(e.target.value)}
                              className="w-full bg-white border border-[#e5e5d1] rounded-lg p-1.5 text-xs font-mono font-bold text-center"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-gray-600 mb-0.5">Máx. Faces</label>
                            <input
                              type="number"
                              min="0"
                              max="5"
                              value={newRuleMaxSurf}
                              onChange={(e) => setNewRuleMaxSurf(e.target.value)}
                              className="w-full bg-white border border-[#e5e5d1] rounded-lg p-1.5 text-xs font-mono font-bold text-center"
                            />
                          </div>
                        </div>

                        {/* Interactive Face Badges */}
                        <div className="sm:col-span-9">
                          <label className="block text-[10px] font-bold text-gray-600 mb-1">
                            Selecione as Faces Permitidas / Aplicáveis para este Procedimento:
                          </label>
                          <div className="flex flex-wrap items-center gap-1.5">
                            {ALL_SURFACES_LIST.map(face => {
                              const isSelected = newRuleApplicableFaces.includes(face.surface);
                              return (
                                <button
                                  key={face.surface}
                                  type="button"
                                  onClick={() => toggleFaceSelection(face.surface)}
                                  className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition flex items-center gap-1 cursor-pointer ${
                                    isSelected 
                                      ? 'bg-amber-600 text-white border-amber-700 shadow-2xs' 
                                      : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                                  }`}
                                >
                                  <span>{face.label}</span>
                                  <span className={`text-[10px] px-1 py-0.2 rounded font-mono ${isSelected ? 'bg-amber-800 text-amber-100' : 'bg-stone-100 text-stone-500'}`}>
                                    {face.abbrev}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 2. SELETOR DETALHADO POR DENTE OU GRUPO */}
                  {newRuleScopeType === 'dente' && (
                    <div className="p-3 bg-emerald-50/40 rounded-xl border border-emerald-200/70 space-y-2.5">
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                        <div className="sm:col-span-6">
                          <label className="block text-[10px] font-bold text-emerald-950 mb-1">
                            Grupo Anatômico de Dentes:
                          </label>
                          <select
                            value={newRuleTeethGroup}
                            onChange={(e) => {
                              const groupKey = e.target.value;
                              setNewRuleTeethGroup(groupKey);
                              if (groupKey !== 'custom' && TEETH_GROUP_DEFINITIONS[groupKey]) {
                                setNewRuleApplicableTeeth(TEETH_GROUP_DEFINITIONS[groupKey].teeth.join(', '));
                              }
                            }}
                            className="w-full bg-white border border-[#e5e5d1] rounded-xl p-2 text-xs font-bold text-[#5a5a40]"
                          >
                            {Object.entries(TEETH_GROUP_DEFINITIONS).map(([key, def]) => (
                              <option key={key} value={key}>
                                {def.label}
                              </option>
                            ))}
                            <option value="custom">✍️ Dentes Específicos (Personalizado)</option>
                          </select>
                        </div>

                        <div className="sm:col-span-6">
                          <label className="block text-[10px] font-bold text-emerald-950 mb-1">
                            Dentes Aplicáveis (Separados por vírgula ou espaço):
                          </label>
                          <input
                            type="text"
                            placeholder="Ex: 18, 28, 38, 48 ou deixe em branco para todos"
                            value={newRuleApplicableTeeth}
                            onChange={(e) => {
                              setNewRuleApplicableTeeth(e.target.value);
                              setNewRuleTeethGroup('custom');
                            }}
                            className="w-full bg-white border border-[#e5e5d1] rounded-xl p-2 text-xs font-mono font-bold text-[#2c2c2c] focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Quick Teeth Suggestion Chips */}
                      <div className="flex flex-wrap items-center gap-1 pt-1">
                        <span className="text-[10px] text-gray-500 font-medium">Exemplos rápidos:</span>
                        <button
                          type="button"
                          onClick={() => {
                            setNewRuleTeethGroup('sisos');
                            setNewRuleApplicableTeeth('18, 28, 38, 48');
                          }}
                          className="px-2 py-0.5 text-[10px] font-bold bg-white hover:bg-emerald-100 text-stone-700 rounded border border-stone-200 cursor-pointer"
                        >
                          Sisos (18, 28, 38, 48)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setNewRuleTeethGroup('molares');
                            setNewRuleApplicableTeeth('16, 17, 18, 26, 27, 28, 36, 37, 38, 46, 47, 48');
                          }}
                          className="px-2 py-0.5 text-[10px] font-bold bg-white hover:bg-emerald-100 text-stone-700 rounded border border-stone-200 cursor-pointer"
                        >
                          Molares
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setNewRuleTeethGroup('anteriores');
                            setNewRuleApplicableTeeth('11, 12, 13, 21, 22, 23, 31, 32, 33, 41, 42, 43');
                          }}
                          className="px-2 py-0.5 text-[10px] font-bold bg-white hover:bg-emerald-100 text-stone-700 rounded border border-stone-200 cursor-pointer"
                        >
                          Anteriores
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setNewRuleTeethGroup('todos');
                            setNewRuleApplicableTeeth('');
                          }}
                          className="px-2 py-0.5 text-[10px] font-bold bg-white hover:bg-emerald-100 text-stone-700 rounded border border-stone-200 cursor-pointer"
                        >
                          Todos os Dentes
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 3. SELETOR DETALHADO POR ÁREA OU REGIÃO */}
                  {newRuleScopeType === 'area' && (
                    <div className="p-3 bg-blue-50/40 rounded-xl border border-blue-200/70 space-y-2.5">
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                        <div className="sm:col-span-6">
                          <label className="block text-[10px] font-bold text-blue-950 mb-1">
                            Tipo de Agrupamento Regional:
                          </label>
                          <select
                            value={newRuleAggregationMode}
                            onChange={(e) => {
                              const mode = e.target.value as RegionAggregationMode;
                              setNewRuleAggregationMode(mode);
                              if (mode === 'hemiarco') setNewRuleApplicableRegions(['HASD', 'HASE', 'HAID', 'HAIE']);
                              else if (mode === 'sextante') setNewRuleApplicableRegions(['S1', 'S2', 'S3', 'S4', 'S5', 'S6']);
                              else if (mode === 'arcada') setNewRuleApplicableRegions(['AS', 'AI']);
                              else if (mode === 'ambas_arcadas') setNewRuleApplicableRegions(['ASAI']);
                            }}
                            className="w-full bg-white border border-[#e5e5d1] rounded-xl p-2 text-xs font-bold text-[#5a5a40]"
                          >
                            <option value="hemiarco">📐 Hemi-Arco / Quadrante (HASD, HASE, HAID, HAIE)</option>
                            <option value="sextante">🔢 Sextante (S1 a S6)</option>
                            <option value="arcada">🌐 Arcada Individual (Superior AS / Inferior AI)</option>
                            <option value="ambas_arcadas">✨ Ambas as Arcadas (ASAI / Boca Toda)</option>
                          </select>
                        </div>

                        <div className="sm:col-span-6">
                          <label className="block text-[10px] font-bold text-blue-950 mb-1">
                            Região Padrão / Código TUSS:
                          </label>
                          <select
                            value={newRuleRegionCode}
                            onChange={(e) => setNewRuleRegionCode(e.target.value)}
                            className="w-full bg-white border border-[#e5e5d1] rounded-xl p-2 text-xs font-bold text-[#5a5a40]"
                          >
                            <option value="Dente">Dente Individual (#Dente)</option>
                            {REGION_LEGENDS.map(r => (
                              <option key={r.code} value={r.code}>
                                {r.code} - {r.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Interactive Region Chips */}
                      <div>
                        <label className="block text-[10px] font-bold text-blue-950 mb-1">
                          Selecione as Regiões Específicas onde este Procedimento se Aplica:
                        </label>
                        <div className="flex flex-wrap items-center gap-1.5">
                          {REGIONS_LIST
                            .filter(r => {
                              if (newRuleAggregationMode === 'hemiarco') return r.type === 'hemiarco';
                              if (newRuleAggregationMode === 'sextante') return r.type === 'sextante';
                              if (newRuleAggregationMode === 'arcada') return r.type === 'arcada';
                              if (newRuleAggregationMode === 'ambas_arcadas') return r.type === 'ambas_arcadas';
                              return true;
                            })
                            .map(reg => {
                              const isSelected = newRuleApplicableRegions.includes(reg.code);
                              return (
                                <button
                                  key={reg.code}
                                  type="button"
                                  onClick={() => toggleRegionSelection(reg.code)}
                                  className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition flex items-center gap-1.5 cursor-pointer ${
                                    isSelected 
                                      ? 'bg-blue-600 text-white border-blue-700 shadow-2xs' 
                                      : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                                  }`}
                                >
                                  <span className="font-mono">{reg.code}</span>
                                  <span className="text-[10px] opacity-90">{reg.name}</span>
                                </button>
                              );
                            })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Form Buttons */}
                <div className="flex items-center justify-end gap-2 pt-1">
                  {editingRuleId ? (
                    <button
                      type="button"
                      onClick={resetRuleForm}
                      className="px-3.5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold text-xs rounded-xl transition cursor-pointer"
                    >
                      Cancelar Edição
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={resetRuleForm}
                      className="px-3 py-2 text-stone-500 hover:text-stone-800 text-xs font-medium cursor-pointer"
                    >
                      Limpar Campos
                    </button>
                  )}
                  <button
                    type="submit"
                    className={`px-5 py-2 font-bold text-xs rounded-xl flex items-center gap-1.5 transition shadow-2xs text-white cursor-pointer ${
                      editingRuleId 
                        ? 'bg-amber-800 hover:bg-amber-900' 
                        : `${t.btnPrimaryBg}`
                    }`}
                  >
                    {editingRuleId ? (
                      <>
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Atualizar Procedimento / Regra</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5 text-[#d4a373]" />
                        <span>Salvar Novo Procedimento</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* FILTROS AVANÇADOS DA TABELA DE REGRAS */}
              <div className="bg-[#fbfbf9] p-3.5 rounded-2xl border border-[#e5e5d1] space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-[#d4a373]" />
                    <h4 className="text-xs font-bold text-[#5a5a40] uppercase tracking-wider">
                      Procedimentos & Regras Cadastradas ({correlationRules.length})
                    </h4>
                  </div>

                  <span className="text-[11px] text-gray-500 font-medium">
                    Exibindo {correlationRules.filter(rule => {
                      if (ruleSearchQuery.trim()) {
                        const q = ruleSearchQuery.toLowerCase();
                        const matchesDesc = (rule.procedureDescription || '').toLowerCase().includes(q);
                        const matchesCond = (rule.conditionType || '').toLowerCase().includes(q);
                        const matchesTuss = (rule.tussCode || '').toLowerCase().includes(q);
                        const matchesSpec = (rule.specialty || '').toLowerCase().includes(q);
                        const matchesAgg = (rule.aggregationMode || '').toLowerCase().includes(q);
                        const matchesRegion = (rule.regionCode || '').toLowerCase().includes(q);
                        const matchesFaces = (rule.applicableFaces || []).some(f => f.toLowerCase().includes(q));
                        const matchesTeeth = (rule.applicableTeeth || []).some(t => t.toString().includes(q));
                        const matchesGroup = (rule.teethGroup || '').toLowerCase().includes(q);
                        if (!matchesDesc && !matchesCond && !matchesTuss && !matchesSpec && !matchesAgg && !matchesRegion && !matchesFaces && !matchesTeeth && !matchesGroup) return false;
                      }
                      if (ruleFilterPriceTable !== 'todos') {
                        const ruleTable = rule.priceTableId || 'particular';
                        if (ruleTable !== ruleFilterPriceTable) return false;
                      }
                      if (ruleFilterScope !== 'todos') {
                        const effectiveScope = rule.scopeType || (rule.aggregationMode && rule.aggregationMode !== 'dente' ? 'area' : (rule.applicableFaces && rule.applicableFaces.length > 0) || (rule.minSurfaces && rule.minSurfaces > 0) ? 'face' : 'dente');
                        if (effectiveScope !== ruleFilterScope) return false;
                      }
                      if (ruleFilterCondition !== 'todas') {
                        if (rule.conditionType !== ruleFilterCondition) return false;
                      }
                      return true;
                    }).length} de {correlationRules.length} procedimentos
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                  {/* Text Search */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Pesquisar TUSS, nome, face..."
                      value={ruleSearchQuery}
                      onChange={(e) => setRuleSearchQuery(e.target.value)}
                      className="w-full bg-white border border-[#e5e5d1] rounded-xl pl-8 pr-2 py-1.5 text-xs text-[#2c2c2c] focus:outline-none focus:border-[#5a5a40]"
                    />
                    <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
                    {ruleSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setRuleSearchQuery('')}
                        className="absolute right-2 top-2 text-stone-400 hover:text-stone-600 text-xs"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Filter by Convênio / Tabela */}
                  <div>
                    <select
                      value={ruleFilterPriceTable}
                      onChange={(e) => setRuleFilterPriceTable(e.target.value)}
                      className="w-full bg-white border border-[#e5e5d1] rounded-xl p-1.5 text-xs font-bold text-[#5a5a40]"
                    >
                      <option value="todos">Todos os Convênios</option>
                      {priceTables.map(tbl => (
                        <option key={tbl.id} value={tbl.id}>
                          {tbl.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Filter by Scope */}
                  <div>
                    <select
                      value={ruleFilterScope}
                      onChange={(e) => setRuleFilterScope(e.target.value)}
                      className="w-full bg-white border border-[#e5e5d1] rounded-xl p-1.5 text-xs font-bold text-[#5a5a40]"
                    >
                      <option value="todos">Todos os Escopos (Face, Dente, Área)</option>
                      <option value="face">💎 Por Face</option>
                      <option value="dente">🦷 Por Dente / Grupo</option>
                      <option value="area">📐 Por Área / Região</option>
                    </select>
                  </div>

                  {/* Filter by Condition */}
                  <div>
                    <select
                      value={ruleFilterCondition}
                      onChange={(e) => setRuleFilterCondition(e.target.value)}
                      className="w-full bg-white border border-[#e5e5d1] rounded-xl p-1.5 text-xs font-bold text-[#5a5a40]"
                    >
                      <option value="todas">Todas as Condições Clínicas</option>
                      <option value="carie">Cárie</option>
                      <option value="restauracao_insatisfatoria">Restauração Insatisfatória</option>
                      <option value="canal">Endodontia / Canal</option>
                      <option value="extracao_indicada">Extração Indicada</option>
                      <option value="ausente">Dente Ausente</option>
                      <option value="implante">Implante</option>
                      <option value="protese">Prótese / Coroa</option>
                      <option value="calculo_supragengival">Cálculo Supragengival</option>
                      <option value="calculo_subgengival">Cálculo Subgengival</option>
                      <option value="girovertido">Giroversão / Ortodontia</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* TABELA DE PROCEDIMENTOS & REGRAS */}
              <div className="overflow-x-auto border border-[#e5e5d1] rounded-2xl bg-white shadow-2xs">
                <table className="w-full text-left text-xs text-[#2c2c2c]">
                  <thead className="bg-[#f0f0e8] text-[#5a5a40] font-mono text-[10px] uppercase border-b border-[#e5e5d1]">
                    <tr>
                      <th className="p-3">TUSS & Procedimento</th>
                      <th className="p-3">Achado Clínico</th>
                      <th className="p-3">Convênio / Tabela</th>
                      <th className="p-3">Tipo de Escopo & Especificação</th>
                      <th className="p-3">Especialidade</th>
                      <th className="p-3">Valor Sugerido</th>
                      <th className="p-3 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e5e5d1]">
                    {correlationRules
                      .filter(rule => {
                        // 1. Text Search
                        if (ruleSearchQuery.trim()) {
                          const q = ruleSearchQuery.toLowerCase();
                          const matchesDesc = (rule.procedureDescription || '').toLowerCase().includes(q);
                          const matchesCond = (rule.conditionType || '').toLowerCase().includes(q);
                          const matchesTuss = (rule.tussCode || '').toLowerCase().includes(q);
                          const matchesSpec = (rule.specialty || '').toLowerCase().includes(q);
                          const matchesAgg = (rule.aggregationMode || '').toLowerCase().includes(q);
                          const matchesRegion = (rule.regionCode || '').toLowerCase().includes(q);
                          const matchesFaces = (rule.applicableFaces || []).some(f => f.toLowerCase().includes(q));
                          const matchesTeeth = (rule.applicableTeeth || []).some(t => t.toString().includes(q));
                          const matchesGroup = (rule.teethGroup || '').toLowerCase().includes(q);
                          if (!matchesDesc && !matchesCond && !matchesTuss && !matchesSpec && !matchesAgg && !matchesRegion && !matchesFaces && !matchesTeeth && !matchesGroup) {
                            return false;
                          }
                        }

                        // 2. Convênio Filter
                        if (ruleFilterPriceTable !== 'todos') {
                          const ruleTable = rule.priceTableId || 'particular';
                          if (ruleTable !== ruleFilterPriceTable) return false;
                        }

                        // 3. Scope Filter
                        if (ruleFilterScope !== 'todos') {
                          const effectiveScope = rule.scopeType || (rule.aggregationMode && rule.aggregationMode !== 'dente' ? 'area' : (rule.applicableFaces && rule.applicableFaces.length > 0) || (rule.minSurfaces && rule.minSurfaces > 0) ? 'face' : 'dente');
                          if (effectiveScope !== ruleFilterScope) return false;
                        }

                        // 4. Condition Filter
                        if (ruleFilterCondition !== 'todas') {
                          if (rule.conditionType !== ruleFilterCondition) return false;
                        }

                        return true;
                      })
                      .sort((a, b) => (a.procedureDescription || '').localeCompare(b.procedureDescription || '', 'pt-BR', { sensitivity: 'base' }))
                      .map(rule => {
                        const isBeingEdited = rule.id === editingRuleId;
                        const tableName = priceTables.find(t => t.id === rule.priceTableId)?.name || (rule.priceTableId === 'particular' || !rule.priceTableId ? 'Particular' : rule.priceTableId);
                        const effectiveScope = rule.scopeType || (rule.aggregationMode && rule.aggregationMode !== 'dente' ? 'area' : (rule.applicableFaces && rule.applicableFaces.length > 0) || (rule.minSurfaces && rule.minSurfaces > 0) ? 'face' : 'dente');

                        return (
                          <tr 
                            key={rule.id} 
                            className={`transition ${
                              isBeingEdited 
                                ? 'bg-amber-50/90 font-semibold ring-1 ring-amber-300' 
                                : 'hover:bg-[#fbfbf9]'
                            }`}
                          >
                            {/* TUSS & Procedimento */}
                            <td className="p-3">
                              <div className="flex flex-col gap-0.5 max-w-xs sm:max-w-sm">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-900 border border-blue-200 text-[10px] font-bold tracking-tight shrink-0" title="Chave Primária SQL Relacional (Primary Key ID)">
                                    PK #{rule.id}
                                  </span>
                                  {rule.tussCode && (
                                    <span className="text-[10px] font-mono font-bold bg-[#f0f0e8] text-[#5a5a40] px-1.5 py-0.5 rounded border border-[#e5e5d1]">
                                      {rule.tussCode}
                                    </span>
                                  )}
                                  <span className="font-bold text-[#2c2c2c] text-xs truncate" title={rule.procedureDescription}>
                                    {rule.procedureDescription}
                                  </span>
                                </div>
                                {rule.notes && (
                                  <span className="text-[10px] text-gray-500 italic truncate" title={rule.notes}>
                                    {rule.notes}
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Condição */}
                            <td className="p-3 whitespace-nowrap">
                              <span className="px-2 py-0.5 bg-amber-50 border border-amber-200 rounded-md font-bold text-[10px] text-amber-800 capitalize">
                                {rule.conditionType.replace('_', ' ')}
                              </span>
                            </td>

                            {/* Convênio / Tabela */}
                            <td className="p-3 whitespace-nowrap">
                              <span className="px-2 py-0.5 bg-stone-100 border border-stone-200 rounded-md font-medium text-[10px] text-stone-700">
                                {tableName}
                              </span>
                            </td>

                            {/* Scope & Especificação Granular */}
                            <td className="p-3">
                              {effectiveScope === 'face' && (
                                <div className="flex flex-col gap-1">
                                  <div className="flex items-center gap-1">
                                    <span className="px-1.5 py-0.5 bg-amber-100 text-amber-900 border border-amber-200 rounded text-[10px] font-bold">
                                      💎 Por Face
                                    </span>
                                    <span className="text-[10px] font-mono text-gray-600">
                                      {rule.minSurfaces === rule.maxSurfaces ? `${rule.minSurfaces} face` : `${rule.minSurfaces ?? 1} a ${rule.maxSurfaces ?? 5} faces`}
                                    </span>
                                  </div>
                                  {rule.applicableFaces && rule.applicableFaces.length > 0 && (
                                    <div className="flex flex-wrap gap-0.5">
                                      {rule.applicableFaces.map(f => (
                                        <span key={f} className="text-[9px] px-1 py-0.2 bg-stone-100 border border-stone-200 rounded text-stone-600 uppercase font-mono">
                                          {f.slice(0, 1)}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}

                              {effectiveScope === 'dente' && (
                                <div className="flex flex-col gap-1">
                                  <div className="flex items-center gap-1">
                                    <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-900 border border-emerald-200 rounded text-[10px] font-bold">
                                      🦷 Por Dente
                                    </span>
                                    {rule.teethGroup && rule.teethGroup !== 'todos' && rule.teethGroup !== 'custom' && (
                                      <span className="text-[10px] text-emerald-800 font-medium">
                                        {rule.teethGroup === 'molares' ? 'Molares' : rule.teethGroup === 'anteriores' ? 'Anteriores' : rule.teethGroup === 'pre_molares' ? 'Pré-molares' : rule.teethGroup === 'sisos' ? 'Sisos' : 'Odontopediatria'}
                                      </span>
                                    )}
                                  </div>
                                  {rule.applicableTeeth && rule.applicableTeeth.length > 0 && (
                                    <span className="text-[10px] font-mono text-gray-600 truncate max-w-[140px]" title={rule.applicableTeeth.join(', ')}>
                                      #{rule.applicableTeeth.slice(0, 4).join(', ')}{rule.applicableTeeth.length > 4 ? '...' : ''}
                                    </span>
                                  )}
                                </div>
                              )}

                              {effectiveScope === 'area' && (
                                <div className="flex flex-col gap-1">
                                  <div className="flex items-center gap-1">
                                    <span className="px-1.5 py-0.5 bg-blue-100 text-blue-900 border border-blue-200 rounded text-[10px] font-bold">
                                      📐 Por Área
                                    </span>
                                    <span className="text-[10px] text-blue-800 font-medium">
                                      {rule.aggregationMode === 'hemiarco' ? 'Hemi-Arco' : rule.aggregationMode === 'sextante' ? 'Sextante' : rule.aggregationMode === 'arcada' ? 'Arcada' : 'Boca Toda'}
                                    </span>
                                  </div>
                                  <span className="text-[10px] font-mono text-gray-600">
                                    {rule.applicableRegions && rule.applicableRegions.length > 0 
                                      ? rule.applicableRegions.slice(0, 3).join(', ') + (rule.applicableRegions.length > 3 ? '...' : '')
                                      : (rule.regionCode || 'Dente')}
                                  </span>
                                </div>
                              )}
                            </td>

                            {/* Especialidade */}
                            <td className="p-3 text-gray-600 whitespace-nowrap">
                              {rule.specialty}
                            </td>

                            {/* Valor Sugerido */}
                            <td className="p-3 font-mono font-bold text-amber-900 whitespace-nowrap">
                              R$ {(rule.suggestedCost ?? 0).toFixed(2)}
                            </td>

                            {/* Ações: Editar 1 a 1, Duplicar, Excluir */}
                            <td className="p-3 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleStartEditRule(rule)}
                                  className={`p-1.5 rounded-lg transition cursor-pointer flex items-center gap-1 text-xs ${
                                    isBeingEdited 
                                      ? 'bg-amber-200 text-amber-950 font-bold' 
                                      : 'text-[#5a5a40] hover:bg-[#e5e5d1] hover:text-[#2c2c2c]'
                                  }`}
                                  title="Editar 1 a 1 este procedimento e seus parâmetros"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                  <span className="hidden sm:inline">Editar</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDuplicateRule(rule)}
                                  className="p-1.5 text-stone-500 hover:text-amber-800 hover:bg-amber-50 rounded-lg transition cursor-pointer"
                                  title="Duplicar regra para outro convênio ou região"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (window.confirm(`Remover a regra para "${rule.procedureDescription}"?`)) {
                                      handleDeleteRule(rule.id);
                                    }
                                  }}
                                  className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                                  title="Remover Regra"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Bottom Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-[#e5e5d1] shrink-0">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    resetRuleForm();
                    setIsRulesModalOpen(false);
                  }}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer border border-[#e5e5d1] shadow-2xs"
                  title="Voltar para a tela anterior"
                >
                  <ArrowLeft className="w-4 h-4 text-[#5a5a40]" />
                  <span>Voltar</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Deseja restaurar todas as regras de correlação para os valores padrão de fábrica?')) {
                      setCorrelationRules(DEFAULT_CORRELATION_RULES);
                      resetRuleForm();
                    }
                  }}
                  className="text-xs text-gray-500 hover:text-[#5a5a40] font-medium flex items-center gap-1.5 cursor-pointer px-3 py-2 rounded-xl hover:bg-stone-100 transition"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Restaurar Padrões de Fábrica</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  resetRuleForm();
                  setIsRulesModalOpen(false);
                }}
                className={`px-6 py-2 ${t.btnPrimaryBg} ${t.btnPrimaryText} text-xs font-bold rounded-xl cursor-pointer shadow-2xs`}
              >
                Concluído
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: CATÁLOGO TUSS & TABELAS DE CONVÊNIO MANAGER */}
      <TussManagerModal
        isOpen={isTussManagerOpen}
        onClose={() => setIsTussManagerOpen(false)}
      />

      {/* MODAL 5: VISUALIZADOR DE MÓDULOS CLÍNICOS DO PROCEDIMENTO (4 MÓDULOS ESTRUTURADOS) */}
      <ProcedureModulesModal
        isOpen={!!viewingModulesProcedure}
        onClose={() => setViewingModulesProcedure(null)}
        procedureCode={viewingModulesProcedure?.code}
        procedureName={viewingModulesProcedure?.name}
        specialty={viewingModulesProcedure?.specialty}
      />

      {/* MODAL 6: LAUDO DE ACEITE, SEÇÃO FINANCEIRA E ANEXO ASSINADO */}
      {activeConsentPlanId && patient && (
        <TreatmentPlanConsentModal
          patient={patient}
          isOpen={!!activeConsentPlanId}
          onClose={() => setActiveConsentPlanId(null)}
          initialPlanId={activeConsentPlanId}
        />
      )}

      {/* MODAL 7: CADASTRO RÁPIDO DE NOVO CONVÊNIO */}
      {isAddingNewConvenio && (
        <div className="fixed inset-0 z-[70] bg-[#2c2c2c]/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#e5e5d1] rounded-[24px] max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#e5e5d1] pb-3">
              <div className="flex items-center gap-2.5">
                <span className="p-2 bg-amber-100 text-amber-900 rounded-xl">
                  <Building2 className="w-5 h-5 text-[#d4a373]" />
                </span>
                <div>
                  <h3 className="font-bold text-[#2c2c2c] text-sm">Cadastrar Novo Convênio</h3>
                  <p className="text-[11px] text-stone-500">Adicione uma nova operadora ou tabela de preços</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsAddingNewConvenio(false);
                  setNewConvenioName('');
                  setNewConvenioDesc('');
                }}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleQuickAddConvenio} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#5a5a40] mb-1">
                  Nome do Convênio *
                </label>
                <input
                  type="text"
                  autoFocus
                  required
                  placeholder="Ex: Hapvida Odonto, MetLife, GNDI Dental..."
                  value={newConvenioName}
                  onChange={(e) => setNewConvenioName(e.target.value)}
                  className="w-full bg-white border border-[#e5e5d1] rounded-xl px-3.5 py-2 text-xs font-bold text-[#2c2c2c] focus:outline-none focus:border-[#5a5a40] focus:ring-1 focus:ring-[#5a5a40]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5a5a40] mb-1">
                  Descrição / Registro ANS (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Tabela corporativa, código ANS ou observações"
                  value={newConvenioDesc}
                  onChange={(e) => setNewConvenioDesc(e.target.value)}
                  className="w-full bg-white border border-[#e5e5d1] rounded-xl px-3.5 py-2 text-xs text-[#2c2c2c] focus:outline-none focus:border-[#5a5a40]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#e5e5d1]">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingNewConvenio(false);
                    setNewConvenioName('');
                    setNewConvenioDesc('');
                  }}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!newConvenioName.trim()}
                  className={`px-5 py-2 ${t.btnPrimaryBg} ${t.btnPrimaryText} disabled:opacity-50 text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-2xs`}
                >
                  <Check className="w-4 h-4" />
                  <span>Cadastrar e Selecionar</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
