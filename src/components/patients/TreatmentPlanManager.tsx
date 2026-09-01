import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { getPatientAgeAndBirthDate } from '../../utils/patientUtils';
import { DocumentSignatureFooter } from '../common/DocumentSignatureFooter';
import { TreatmentPlan, TreatmentPlanItem, TUSSProcedure, CorrelationRule, ToothConditionType } from '../../types';
import { TussManagerModal } from './TussManagerModal';
import { RegionSelector } from './RegionSelector';
import { ProcedureModulesModal } from '../common/ProcedureModulesModal';
import { formatRegionDisplay, REGION_LEGENDS } from '../../data/regionData';
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
  X
} from 'lucide-react';

import { getThemeStyles } from '../../utils/themeUtils';

interface TreatmentPlanManagerProps {
  patientId: string;
}

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

const DEFAULT_CORRELATION_RULES: CorrelationRule[] = [
  {
    id: 'rule-carie-1',
    conditionType: 'carie',
    minSurfaces: 1,
    maxSurfaces: 1,
    tussCode: '81000030',
    procedureDescription: 'Restauração de 1 Face em Resina Composta',
    specialty: 'Dentística & Estética',
    suggestedCost: 220,
    regionCode: 'Dente'
  },
  {
    id: 'rule-carie-2',
    conditionType: 'carie',
    minSurfaces: 2,
    maxSurfaces: 2,
    tussCode: '81000048',
    procedureDescription: 'Restauração de 2 Faces em Resina Composta',
    specialty: 'Dentística & Estética',
    suggestedCost: 280,
    regionCode: 'Dente'
  },
  {
    id: 'rule-carie-3',
    conditionType: 'carie',
    minSurfaces: 3,
    maxSurfaces: 5,
    tussCode: '81000056',
    procedureDescription: 'Restauração de 3 Faces ou Reconstrução Coronária',
    specialty: 'Dentística & Estética',
    suggestedCost: 350,
    regionCode: 'Dente'
  },
  {
    id: 'rule-rest-insat-1',
    conditionType: 'restauracao_insatisfatoria',
    minSurfaces: 1,
    maxSurfaces: 2,
    tussCode: '81000030',
    procedureDescription: 'Substituição de restauração insatisfatória em resina',
    specialty: 'Dentística & Estética',
    suggestedCost: 250,
    regionCode: 'Dente'
  },
  {
    id: 'rule-rest-insat-2',
    conditionType: 'restauracao_insatisfatoria',
    minSurfaces: 3,
    maxSurfaces: 5,
    tussCode: '86000018',
    procedureDescription: 'Reconstrução dentária / Inlay / Onlay em porcelana',
    specialty: 'Dentística & Estética',
    suggestedCost: 650,
    regionCode: 'RMSD'
  },
  {
    id: 'rule-girovertido',
    conditionType: 'girovertido',
    minSurfaces: 0,
    maxSurfaces: 5,
    tussCode: '84000020',
    procedureDescription: 'Alinhamento ortodôntico / Correção de giroversão',
    specialty: 'Ortodontia',
    suggestedCost: 450,
    regionCode: 'AS'
  },
  {
    id: 'rule-canal',
    conditionType: 'canal',
    minSurfaces: 0,
    maxSurfaces: 5,
    tussCode: '82000034',
    procedureDescription: 'Tratamento de canal (Endodontia)',
    specialty: 'Endodontia',
    suggestedCost: 600,
    regionCode: 'RMID'
  },
  {
    id: 'rule-extracao',
    conditionType: 'extracao_indicada',
    minSurfaces: 0,
    maxSurfaces: 5,
    tussCode: '87000028',
    procedureDescription: 'Exodontia simples / dente permanente',
    specialty: 'Cirurgia Bocheco-Maxilo',
    suggestedCost: 220,
    regionCode: 'Dente'
  },
  {
    id: 'rule-ausente',
    conditionType: 'ausente',
    minSurfaces: 0,
    maxSurfaces: 5,
    tussCode: '83000010',
    procedureDescription: 'Implante dental osseointegrado / Prótese fixa',
    specialty: 'Implantodontia',
    suggestedCost: 1800,
    regionCode: 'RMID'
  },
  {
    id: 'rule-protese',
    conditionType: 'protese',
    minSurfaces: 0,
    maxSurfaces: 5,
    tussCode: '86000018',
    procedureDescription: 'Confecção e cimentação de coroa total zircônia / e-Max',
    specialty: 'Prótese Dentária',
    suggestedCost: 1200,
    regionCode: 'RMSD'
  },
  {
    id: 'rule-calculo-supra',
    conditionType: 'calculo_supragengival',
    minSurfaces: 0,
    maxSurfaces: 5,
    tussCode: '84000010',
    procedureDescription: 'Raspagem Supra-gengival e Polimento Coronário',
    specialty: 'Periodontia',
    suggestedCost: 320,
    regionCode: 'ASAI'
  },
  {
    id: 'rule-calculo-sub',
    conditionType: 'calculo_subgengival',
    minSurfaces: 0,
    maxSurfaces: 5,
    tussCode: '85000015',
    procedureDescription: 'Raspagem Subgengival e Aplanamento Radicular',
    specialty: 'Periodontia',
    suggestedCost: 380,
    regionCode: 'HASD'
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
  const [activePrintPlan, setActivePrintPlan] = useState<TreatmentPlan | null>(null);
  const [addedNotice, setAddedNotice] = useState<string | null>(null);

  // TUSS Manager Modal State
  const [isTussManagerOpen, setIsTussManagerOpen] = useState(false);
  const [selectedPriceTableId, setSelectedPriceTableId] = useState<string>('particular');

  // Correlation Rules State
  const [correlationRules, setCorrelationRules] = useState<CorrelationRule[]>(() => {
    const saved = localStorage.getItem('clinic_correlation_rules');
    return saved ? JSON.parse(saved) : DEFAULT_CORRELATION_RULES;
  });
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);

  // New Rule Form State
  const [newRuleCond, setNewRuleCond] = useState<ToothConditionType>('carie');
  const [newRuleMinSurf, setNewRuleMinSurf] = useState('1');
  const [newRuleMaxSurf, setNewRuleMaxSurf] = useState('2');
  const [newRuleTussCode, setNewRuleTussCode] = useState('');
  const [newRuleDesc, setNewRuleDesc] = useState('');
  const [newRuleSpec, setNewRuleSpec] = useState('Dentística & Estética');
  const [newRuleCost, setNewRuleCost] = useState('250');
  const [newRuleRegionCode, setNewRuleRegionCode] = useState('Dente');
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('clinic_correlation_rules', JSON.stringify(correlationRules));
  }, [correlationRules]);

  const resetRuleForm = () => {
    setEditingRuleId(null);
    setNewRuleCond('carie');
    setNewRuleMinSurf('1');
    setNewRuleMaxSurf('2');
    setNewRuleTussCode('');
    setNewRuleDesc('');
    setNewRuleSpec('Dentística & Estética');
    setNewRuleCost('250');
    setNewRuleRegionCode('Dente');
  };

  const handleStartEditRule = (rule: CorrelationRule) => {
    setEditingRuleId(rule.id);
    setNewRuleCond(rule.conditionType);
    setNewRuleMinSurf((rule.minSurfaces ?? 0).toString());
    setNewRuleMaxSurf((rule.maxSurfaces ?? 5).toString());
    setNewRuleTussCode(rule.tussCode || '');
    setNewRuleDesc(rule.procedureDescription);
    setNewRuleSpec(rule.specialty);
    setNewRuleCost((rule.suggestedCost ?? 0).toString());
    setNewRuleRegionCode(rule.regionCode || 'Dente');

    const formEl = document.getElementById('correlation-rules-form-container');
    if (formEl) {
      formEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleSaveRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleDesc.trim()) return;

    if (editingRuleId) {
      setCorrelationRules(prev => prev.map(r => {
        if (r.id === editingRuleId) {
          return {
            ...r,
            conditionType: newRuleCond,
            minSurfaces: parseInt(newRuleMinSurf) || 0,
            maxSurfaces: parseInt(newRuleMaxSurf) || 5,
            tussCode: newRuleTussCode || undefined,
            procedureDescription: newRuleDesc.trim(),
            specialty: newRuleSpec,
            suggestedCost: parseFloat(newRuleCost) || 200,
            regionCode: newRuleRegionCode || 'Dente'
          };
        }
        return r;
      }));
      resetRuleForm();
    } else {
      const rule: CorrelationRule = {
        id: `rule-${Date.now()}`,
        conditionType: newRuleCond,
        minSurfaces: parseInt(newRuleMinSurf) || 0,
        maxSurfaces: parseInt(newRuleMaxSurf) || 5,
        tussCode: newRuleTussCode || undefined,
        procedureDescription: newRuleDesc.trim(),
        specialty: newRuleSpec,
        suggestedCost: parseFloat(newRuleCost) || 200,
        regionCode: newRuleRegionCode || 'Dente'
      };
      setCorrelationRules(prev => [...prev, rule]);
      setNewRuleDesc('');
      setNewRuleTussCode('');
    }
  };

  const handleDeleteRule = (id: string) => {
    if (editingRuleId === id) {
      resetRuleForm();
    }
    setCorrelationRules(prev => prev.filter(r => r.id !== id));
  };

  const handleExportRulesCSV = () => {
    const headers = ['ID', 'Condição Clínica', 'Código TUSS', 'Procedimento Sugerido', 'Região / Dente', 'Mín. Faces', 'Máx. Faces', 'Especialidade', 'Valor Sugerido (R$)'];
    const rows = correlationRules.map(r => {
      return [
        `"${r.id}"`,
        `"${r.conditionType}"`,
        `"${r.tussCode || ''}"`,
        `"${r.procedureDescription.replace(/"/g, '""')}"`,
        `"${r.regionCode || 'Dente'}"`,
        r.minSurfaces ?? 0,
        r.maxSurfaces ?? 5,
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

  // Add Item Dialog State
  const [isProcedureModalOpen, setIsProcedureModalOpen] = useState(false);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('todas');
  const [searchTuss, setSearchTuss] = useState('');
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
    customRules: CorrelationRule[]
  ): CorrelatedProcedureOption[] => {
    const result: CorrelatedProcedureOption[] = [];

    // 1. User-configured rules match
    const matchedCustom = customRules.filter(r => 
      r.conditionType === conditionType &&
      surfaceCount >= (r.minSurfaces ?? 0) &&
      surfaceCount <= (r.maxSurfaces ?? 5)
    );

    matchedCustom.forEach(rule => {
      result.push({
        id: rule.id,
        tussCode: rule.tussCode || 'CORR-ODONTO',
        procedureName: rule.procedureDescription,
        specialty: rule.specialty,
        suggestedCost: rule.suggestedCost ?? 200,
        regionCode: rule.regionCode || 'Dente'
      });
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

  // Batch Add Multiple Correlated Procedures for Selected Teeth into Treatment Plan
  const handleAddMultipleCorrelatedProceduresToPlan = (
    teethToApply: number[],
    proceduresToApply: CorrelatedProcedureOption[]
  ) => {
    if (teethToApply.length === 0 || proceduresToApply.length === 0) return;

    const newItems: TreatmentPlanItem[] = [];

    teethToApply.forEach(toothNum => {
      const toothData = activeConditions.find(c => c.toothNumber === toothNum);
      const activeSurfaces = toothData?.surfaces 
        ? Object.entries(toothData.surfaces).filter(([_, type]) => type && type !== 'sio').map(s => s[0]).join(', ')
        : 'Geral';

      proceduresToApply.forEach(proc => {
        newItems.push({
          id: `item-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
          tussCode: proc.tussCode || 'CORR-ODONTO',
          procedureName: proc.procedureName,
          specialty: proc.specialty,
          toothNumber: toothNum,
          toothSurface: activeSurfaces || 'Geral',
          regionCode: proc.regionCode || 'Dente',
          regionDescription: proc.regionCode || 'Dente',
          cost: proc.suggestedCost,
          discountPercentage: 0,
          finalCost: proc.suggestedCost,
          notes: `Sugerido automaticamente via Odontograma (Dente #${toothNum})`,
          status: 'pendente'
        });
      });
    });

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

    setAddedNotice(`✓ ${newItems.length} procedimento(s) incluído(s) no Plano para ${teethToApply.length} dente(s) com sucesso!`);
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

    const newItem: TreatmentPlanItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      tussCode: selectedTuss.code,
      procedureName: selectedTuss.description,
      specialty: selectedTuss.specialty,
      toothNumber: customToothNumber ? parseInt(customToothNumber) : undefined,
      toothSurface: customSurface || undefined,
      regionCode: customRegionCode || selectedTuss.defaultRegion,
      regionDescription: customRegionDesc || customRegionCode || selectedTuss.defaultRegion,
      cost: costNum,
      discountPercentage: 0,
      finalCost: costNum,
      notes: customItemNotes,
      fullProcedureDetails: selectedTuss.fullDescription,
      status: 'pendente'
    };

    setItems(prev => [...prev, newItem]);

    // Reset selection modal
    setSelectedTuss(null);
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

  const handleSavePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0 || !patient) return;

    const total = items.reduce((acc, curr) => acc + curr.cost, 0);
    const finalVal = items.reduce((acc, curr) => acc + curr.finalCost, 0);

    const activeTable = priceTables.find(t => t.id === selectedPriceTableId);

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
      discountValue: total - finalVal,
      finalValue: finalVal,
      paymentConditions,
      notes
    });

    setIsCreating(false);
    setItems([]);
  };

  const calculatePlanTotals = (planItems: TreatmentPlanItem[]) => {
    const total = planItems.reduce((acc, curr) => acc + (curr.cost || 0), 0);
    const finalVal = planItems.reduce((acc, curr) => acc + (curr.finalCost || 0), 0);
    return { total, finalVal, discount: total - finalVal };
  };

  const filteredTussList = tussProcedures.filter(proc => {
    const matchesSpecialty = selectedSpecialty === 'todas' || proc.specialty === selectedSpecialty;
    const matchesSearch = proc.description.toLowerCase().includes(searchTuss.toLowerCase()) ||
                          proc.code.includes(searchTuss) ||
                          proc.specialty.toLowerCase().includes(searchTuss.toLowerCase());
    return matchesSpecialty && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b ${t.cardBorder} pb-4`}>
        <div>
          <h2 className={`text-lg font-bold ${t.headingText} flex items-center gap-2`}>
            <FileCheck2 className={`w-5 h-5 ${t.accentText}`} />
            Plano de Tratamento
          </h2>
          <p className="text-xs opacity-75">Crie propostas terapêuticas com tabela TUSS por especialidade e laudo técnico detalhado em PDF.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsRulesModalOpen(true)}
            className={`px-3.5 py-2 ${t.btnSecondaryBg} ${t.btnSecondaryText} border ${t.cardBorder} font-bold text-xs rounded-2xl flex items-center gap-1.5 transition cursor-pointer`}
          >
            <Settings className={`w-4 h-4 ${t.accentText}`} />
            <span>Regras de Correlação</span>
          </button>

          {!isCreating && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setIsTussManagerOpen(true)}
                className={`px-3 py-2 ${t.btnSecondaryBg} ${t.btnSecondaryText} border ${t.cardBorder} font-bold text-xs rounded-2xl flex items-center gap-1.5 transition cursor-pointer`}
              >
                <Building2 className={`w-4 h-4 ${t.accentText}`} />
                <span>Catálogo TUSS & Convênios</span>
              </button>

              <button
                onClick={() => setIsCreating(true)}
                className={`px-4 py-2 ${t.btnPrimaryBg} ${t.btnPrimaryText} font-bold text-xs rounded-2xl flex items-center gap-2 shadow-xs transition cursor-pointer`}
              >
                <Plus className="w-4 h-4" />
                Novo Plano de Tratamento
              </button>
            </div>
          )}
        </div>
      </div>

      {addedNotice && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-2xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{addedNotice}</span>
        </div>
      )}

      {/* REGISTRO DE ACHADOS NO ODONTOGRAMA (Correlated procedure suggestions & Multi-tooth selection helper) */}
      <div className="bg-[#fbfbf9] p-5 rounded-3xl border border-[#e5e5d1] space-y-4 shadow-2xs">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#e5e5d1] pb-3">
          <div>
            <h3 className="text-sm font-bold text-[#5a5a40] flex items-center gap-2">
              <Smile className="w-4 h-4 text-[#d4a373]" />
              Registro de Achados & Procedimentos Correlacionados
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Selecione dentes individuais ou múltiplos para incluir até 3 procedimentos correlacionados diretamente no plano de tratamento.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode Switcher */}
            <div className="bg-white p-1 rounded-xl border border-[#e5e5d1] flex items-center gap-1 shadow-2xs">
              <button
                type="button"
                onClick={() => setFindingsViewMode('grouped')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition flex items-center gap-1 cursor-pointer ${
                  findingsViewMode === 'grouped' 
                    ? 'bg-[#5a5a40] text-white shadow-2xs' 
                    : 'text-gray-600 hover:bg-[#f0f0e8]'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Agrupado por Achado</span>
              </button>
              <button
                type="button"
                onClick={() => setFindingsViewMode('individual')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition flex items-center gap-1 cursor-pointer ${
                  findingsViewMode === 'individual' 
                    ? 'bg-[#5a5a40] text-white shadow-2xs' 
                    : 'text-gray-600 hover:bg-[#f0f0e8]'
                }`}
              >
                <ListFilter className="w-3.5 h-3.5" />
                <span>Dentes Individuais</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsRulesModalOpen(true)}
              className="px-3 py-1.5 bg-white border border-[#e5e5d1] hover:bg-[#f0f0e8] text-[#5a5a40] font-bold text-[11px] rounded-xl flex items-center gap-1.5 transition shrink-0"
            >
              <Settings className="w-3.5 h-3.5 text-[#d4a373]" />
              <span>Configurar Regras</span>
            </button>
          </div>
        </div>

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

                    const costPerTooth = chosenProcedures.reduce((acc, p) => acc + p.suggestedCost, 0);
                    const totalCostForGroup = costPerTooth * selectedTeethInGroup.length;

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
                              Procedimentos Correlacionados Sugeridos (Selecione 1 ou mais):
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
                                          {proc.procedureName}
                                        </p>
                                        <div className="flex items-center gap-2 text-[10px] text-stone-500 mt-0.5">
                                          <span className="font-mono text-gray-400">TUSS: {proc.tussCode}</span>
                                          <span>•</span>
                                          <span className="font-semibold text-[#5a5a40]">{proc.specialty}</span>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                      <span className="font-mono font-bold text-xs text-[#2c2c2c]">
                                        R$ {proc.suggestedCost.toFixed(2)}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setViewingModulesProcedure({
                                            code: proc.tussCode,
                                            name: proc.procedureName,
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
                            <span>{chosenProcedures.length} procedimento(s) × {selectedTeethInGroup.length} dente(s)</span>
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
                              Incluir {chosenProcedures.length * selectedTeethInGroup.length} procedimento(s) em {selectedTeethInGroup.length} dente(s)
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

                  const suggestions = get3CorrelatedProcedures(mainCondType, surfaceCount, correlationRules);
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
                                  <div className="flex items-center gap-1.5 min-w-0">
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={() => {}}
                                      className="rounded text-amber-600 focus:ring-amber-400 cursor-pointer"
                                    />
                                    <span className="truncate">{proc.procedureName}</span>
                                  </div>

                                  <span className="font-mono font-bold text-[11px] shrink-0">
                                    R$ {proc.suggestedCost.toFixed(2)}
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
              <label className="block text-xs font-semibold text-[#5a5a40] mb-1">Tabela de Preço / Convênio Aplicado</label>
              <select
                value={selectedPriceTableId}
                onChange={(e) => setSelectedPriceTableId(e.target.value)}
                className="w-full bg-white border border-[#e5e5d1] rounded-2xl px-3.5 py-2 text-xs text-[#2c2c2c] focus:outline-none focus:border-[#5a5a40] font-bold"
              >
                {priceTables.map(tbl => (
                  <option key={tbl.id} value={tbl.id}>
                    {tbl.name} {tbl.isDefault ? '(Padrão)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#5a5a40] mb-1">Condições de Pagamento / Parcelamento</label>
              <input
                type="text"
                value={paymentConditions}
                onChange={(e) => setPaymentConditions(e.target.value)}
                className="w-full bg-white border border-[#e5e5d1] rounded-2xl px-3.5 py-2 text-xs text-[#2c2c2c] focus:outline-none focus:border-[#5a5a40]"
              />
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
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="font-mono text-[10px] text-gray-400 block">TUSS: {item.tussCode}</span>
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
                          <span className="font-bold text-[#2c2c2c]">{item.procedureName}</span>
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
                          R$ {item.finalCost.toFixed(2)}
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
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 bg-[#f0f0e8] hover:bg-[#e5e5d1] text-[#5a5a40] text-xs font-medium rounded-2xl"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={items.length === 0}
                className={`px-5 py-2 ${t.btnPrimaryBg} ${t.btnPrimaryText} disabled:opacity-50 text-xs font-bold rounded-2xl shadow-xs cursor-pointer`}
              >
                Salvar Plano de Tratamento
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
            <p className="text-[11px] text-gray-400">Clique em "Novo Plano de Tratamento" para adicionar e gerar o PDF completo.</p>
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
                  <div className="flex items-center gap-2">
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
                    placeholder="Ex: Restauração, Implante, Canal..."
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

            {/* Options when TUSS selected */}
            {selectedTuss && (
              <div className="bg-[#f0f0e8] p-3.5 rounded-2xl border border-[#e5e5d1] space-y-3 shrink-0">
                <div className="text-xs font-bold text-[#5a5a40] flex items-center justify-between">
                  <span>Opções do Procedimento: {selectedTuss.description}</span>
                  <span className="font-mono text-[#d4a373]">TUSS {selectedTuss.code}</span>
                </div>

                {/* Region & Tooth Selector */}
                <RegionSelector
                  selectedRegionCode={customRegionCode}
                  selectedToothNumber={customToothNumber ? parseInt(customToothNumber) : undefined}
                  allowedRegions={selectedTuss.allowedRegionsByPriceTable?.[selectedPriceTableId] || selectedTuss.allowedRegions}
                  regionRulesNote={selectedTuss.regionRulesNote}
                  procedureName={selectedTuss.description}
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
                      className="w-full bg-white border border-[#e5e5d1] rounded-xl px-2.5 py-1.5 font-mono text-xs font-bold"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddItemToPlan}
                  className={`w-full py-2 ${t.btnPrimaryBg} ${t.btnPrimaryText} font-bold text-xs rounded-xl shadow-xs cursor-pointer`}
                >
                  Adicionar ao Plano de Tratamento
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
                  onClick={() => window.print()}
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
                onClick={() => window.print()}
                className={`px-5 py-2.5 ${t.btnPrimaryBg} ${t.btnPrimaryText} font-bold text-xs rounded-xl flex items-center gap-2 shadow-2xs cursor-pointer transition`}
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: CONFIGURAR REGRAS DE CORRELAÇÃO DO ODONTOGRAMA */}
      {isRulesModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#2c2c2c]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#e5e5d1] rounded-[32px] max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#e5e5d1] pb-3">
              <div>
                <h3 className="text-base font-serif italic text-[#5a5a40] flex items-center gap-2">
                  <Settings className="w-5 h-5 text-[#d4a373]" />
                  Configurar Regras de Correlação de Odontograma
                </h3>
                <p className="text-xs text-gray-500">
                  Ensine ao sistema quais procedimentos sugerir automaticamente para cada achado clínico no Odontograma.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportRulesCSV}
                  className="px-3 py-1.5 bg-[#2c3e2e] hover:bg-[#1b2a1d] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-2xs"
                  title="Exportar tabela de regras em formato CSV / Excel"
                >
                  <Download className="w-3.5 h-3.5 text-[#d4a373]" />
                  <span>Exportar CSV</span>
                </button>
                <button onClick={() => setIsRulesModalOpen(false)} className="text-gray-400 hover:text-[#2c2c2c] p-1">✕</button>
              </div>
            </div>

            {/* Form to Add / Edit Correlation Rule */}
            <form 
              id="correlation-rules-form-container"
              onSubmit={handleSaveRule} 
              className={`p-4 rounded-2xl border transition space-y-3 ${
                editingRuleId 
                  ? 'bg-amber-50/70 border-amber-300 shadow-sm' 
                  : 'bg-[#fbfbf9] border-[#e5e5d1]'
              }`}
            >
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-[#5a5a40] uppercase tracking-wider flex items-center gap-1.5">
                  {editingRuleId ? (
                    <>
                      <Edit2 className="w-3.5 h-3.5 text-amber-700" />
                      <span>Modificar Regra de Correlação</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5 text-[#d4a373]" />
                      <span>Adicionar Nova Regra de Correlação</span>
                    </>
                  )}
                </h4>
                {editingRuleId && (
                  <button
                    type="button"
                    onClick={resetRuleForm}
                    className="text-[11px] text-amber-800 hover:text-amber-950 underline font-semibold"
                  >
                    Cancelar Edição
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-[#5a5a40] mb-1">Achado / Condição</label>
                  <select
                    value={newRuleCond}
                    onChange={(e) => setNewRuleCond(e.target.value as ToothConditionType)}
                    className="w-full bg-white border border-[#e5e5d1] rounded-xl p-2 text-xs font-bold text-[#5a5a40]"
                  >
                    <option value="carie">Cárie</option>
                    <option value="restauracao_insatisfatoria">Restauração Insatisfatória</option>
                    <option value="girovertido">Dente Girovertido</option>
                    <option value="canal">Endodontia / Tratam. Canal</option>
                    <option value="extracao_indicada">Extração Indicada</option>
                    <option value="ausente">Dente Ausente / Pérdida</option>
                    <option value="implante">Implante</option>
                    <option value="protese">Prótese / Coroa</option>
                    <option value="calculo_supragengival">Cálculo Supragengival</option>
                    <option value="calculo_subgengival">Cálculo Subgengival</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#5a5a40] mb-1">Mín. Faces Afetadas</label>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    value={newRuleMinSurf}
                    onChange={(e) => setNewRuleMinSurf(e.target.value)}
                    className="w-full bg-white border border-[#e5e5d1] rounded-xl p-2 text-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#5a5a40] mb-1">Máx. Faces Afetadas</label>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    value={newRuleMaxSurf}
                    onChange={(e) => setNewRuleMaxSurf(e.target.value)}
                    className="w-full bg-white border border-[#e5e5d1] rounded-xl p-2 text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-[#5a5a40] mb-1">
                    Procedimento Sugerido (Tabela TUSS) *
                  </label>
                  <select
                    value={newRuleTussCode}
                    onChange={(e) => {
                      const code = e.target.value;
                      setNewRuleTussCode(code);
                      const proc = tussProcedures.find(p => p.code === code);
                      if (proc) {
                        setNewRuleDesc(proc.description);
                        setNewRuleSpec(proc.specialty);
                        const tableCost = proc.prices?.[selectedPriceTableId] ?? proc.suggestedCost;
                        setNewRuleCost(tableCost.toString());
                        if (proc.defaultRegion) {
                          setNewRuleRegionCode(proc.defaultRegion);
                        }
                      }
                    }}
                    className="w-full bg-white border border-[#e5e5d1] rounded-xl p-2 text-xs font-bold text-[#2c2c2c] focus:outline-none focus:border-[#5a5a40]"
                  >
                    <option value="">-- Selecione um procedimento TUSS --</option>
                    {tussProcedures.map(proc => (
                      <option key={proc.code} value={proc.code}>
                        [{proc.code}] {proc.description} ({proc.specialty})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#5a5a40] mb-1">
                    Região / Dente (Abreviação)
                  </label>
                  <select
                    value={newRuleRegionCode}
                    onChange={(e) => setNewRuleRegionCode(e.target.value)}
                    className="w-full bg-white border border-[#e5e5d1] rounded-xl p-2 text-xs font-bold text-[#5a5a40] focus:outline-none"
                  >
                    <option value="Dente">Dente (#Dente)</option>
                    {REGION_LEGENDS.map(r => (
                      <option key={r.code} value={r.code}>
                        {r.code} - {r.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-[#5a5a40] mb-1">Descrição Personalizada</label>
                  <input
                    type="text"
                    required
                    placeholder="Descrição da regra..."
                    value={newRuleDesc}
                    onChange={(e) => setNewRuleDesc(e.target.value)}
                    className="w-full bg-white border border-[#e5e5d1] rounded-xl p-2 text-xs font-bold text-[#2c2c2c]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#5a5a40] mb-1">Valor Sugerido (R$)</label>
                  <input
                    type="number"
                    required
                    value={newRuleCost}
                    onChange={(e) => setNewRuleCost(e.target.value)}
                    className="w-full bg-white border border-[#e5e5d1] rounded-xl p-2 text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                {editingRuleId && (
                  <button
                    type="button"
                    onClick={resetRuleForm}
                    className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold text-xs rounded-xl transition"
                  >
                    Cancelar
                  </button>
                )}
                <button
                  type="submit"
                  className={`px-4 py-2 font-bold text-xs rounded-xl flex items-center gap-1.5 transition shadow-2xs text-white cursor-pointer ${
                    editingRuleId 
                      ? 'bg-amber-800 hover:bg-amber-900' 
                      : `${t.btnPrimaryBg}`
                  }`}
                >
                  {editingRuleId ? (
                    <>
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Atualizar Regra</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5 text-[#d4a373]" />
                      <span>Salvar Regra</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* List of Registered Correlation Rules */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-[#5a5a40] uppercase tracking-wider">
                Regras de Correlação Ativas ({correlationRules.length})
              </h4>

              <div className="overflow-x-auto border border-[#e5e5d1] rounded-2xl bg-white">
                <table className="w-full text-left text-xs text-[#2c2c2c]">
                  <thead className="bg-[#f0f0e8] text-[#5a5a40] font-mono text-[10px] uppercase">
                    <tr>
                      <th className="p-2.5">Condição</th>
                      <th className="p-2.5">Procedimento Sugerido</th>
                      <th className="p-2.5">Região/Dente</th>
                      <th className="p-2.5">Faces</th>
                      <th className="p-2.5">Especialidade</th>
                      <th className="p-2.5">Valor</th>
                      <th className="p-2.5 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e5e5d1]">
                    {correlationRules.map(rule => {
                      const regionDisplay = rule.regionCode 
                        ? formatRegionDisplay(rule.regionCode)
                        : 'Dente';
                      const regionAbbrev = rule.regionCode || 'Dente';
                      const isBeingEdited = rule.id === editingRuleId;

                      return (
                        <tr 
                          key={rule.id} 
                          className={`transition ${
                            isBeingEdited 
                              ? 'bg-amber-50/80 font-semibold' 
                              : 'hover:bg-[#fbfbf9]'
                          }`}
                        >
                          <td className="p-2.5 font-bold capitalize text-[#5a5a40] whitespace-nowrap">
                            {rule.conditionType.replace('_', ' ')}
                          </td>
                          <td className="p-2.5 font-bold text-[#2c2c2c]">
                            <div className="flex flex-col">
                              <span>{rule.procedureDescription}</span>
                              {rule.tussCode && (
                                <span className="text-[10px] font-mono text-[#d4a373]">
                                  TUSS: {rule.tussCode}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-2.5 font-mono text-xs font-bold text-[#2c3e2e]">
                            <span 
                              className="px-2 py-0.5 bg-[#f0f0e8] border border-[#e5e5d1] rounded-md inline-block shadow-2xs" 
                              title={regionDisplay}
                            >
                              {regionAbbrev}
                            </span>
                          </td>
                          <td className="p-2.5 font-mono text-gray-500 whitespace-nowrap">
                            {rule.minSurfaces === rule.maxSurfaces ? `${rule.minSurfaces} face` : `${rule.minSurfaces} a ${rule.maxSurfaces} faces`}
                          </td>
                          <td className="p-2.5 text-gray-600 whitespace-nowrap">
                            {rule.specialty}
                          </td>
                          <td className="p-2.5 font-mono font-bold text-amber-900 whitespace-nowrap">
                            R$ {(rule.suggestedCost ?? 0).toFixed(2)}
                          </td>
                          <td className="p-2.5 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => handleStartEditRule(rule)}
                                className={`p-1.5 rounded transition ${
                                  isBeingEdited 
                                    ? 'bg-amber-200 text-amber-900 font-bold' 
                                    : 'text-[#5a5a40] hover:bg-[#e5e5d1] hover:text-[#2c2c2c]'
                                }`}
                                title="Modificar / Editar Regra"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteRule(rule.id)}
                                className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"
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

            <div className="flex items-center justify-between pt-3 border-t border-[#e5e5d1]">
              <button
                type="button"
                onClick={() => setCorrelationRules(DEFAULT_CORRELATION_RULES)}
                className="text-xs text-gray-500 hover:text-[#5a5a40] font-medium"
              >
                Restaurar Padrões de Fábrica
              </button>

              <button
                type="button"
                onClick={() => setIsRulesModalOpen(false)}
                className={`px-5 py-2 ${t.btnPrimaryBg} ${t.btnPrimaryText} text-xs font-bold rounded-xl cursor-pointer`}
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
    </div>
  );
};
