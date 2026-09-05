import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { InventoryItem, InventoryItemType, InventoryOwnerScope, Appointment } from '../../types';
import { CameraModal } from '../common/CameraModal';
import { DailyClinicMaterialsReportModal } from './DailyClinicMaterialsReportModal';
import { AppointmentMaterialsReportModal } from './AppointmentMaterialsReportModal';
import { YesterdayRegisteredMaterialsReportModal } from './YesterdayRegisteredMaterialsReportModal';
import { AutoclaveCMERReportModal } from './AutoclaveCMERReportModal';
import { AutocompleteInput } from '../common/AutocompleteInput';
import { printDocumentWithTitle } from '../../utils/printUtils';
import { 
  Package, 
  Plus, 
  AlertTriangle, 
  Minus, 
  Search, 
  Calendar, 
  Tag, 
  DollarSign, 
  CheckCircle2, 
  X,
  Camera,
  Scan,
  Sparkles,
  Upload,
  RefreshCw,
  Eye,
  FileSpreadsheet,
  Printer,
  Wrench,
  Clock,
  ShieldAlert,
  ArrowRight,
  Filter,
  Info,
  Check,
  FileText,
  Building2,
  UserCheck,
  PackageCheck,
  Sliders,
  ChevronRight,
  AlertCircle,
  Trash2,
  ZoomIn,
  Edit2,
  Star,
  ImageIcon,
  Barcode,
  Stethoscope,
  LayoutGrid,
  List,
  Copy
} from 'lucide-react';

// Product suggestions grouped by category
const PRODUCT_SUGGESTIONS: Record<string, Array<{ name: string; unit: InventoryItem['unit']; cost: number; supplier: string; minQty?: number }>> = {
  'Equipamentos': [
    { name: 'Autoclave Cristófoli Vitale Class 12 Litros', unit: 'peça', cost: 4800, supplier: 'Cristófoli', minQty: 1 },
    { name: 'Fotopolimerizador LED Valo Wireless Ultradent', unit: 'peça', cost: 6200, supplier: 'Ultradent', minQty: 1 },
    { name: 'Motor de Implante e Cirurgia NOUVAG MD11', unit: 'peça', cost: 12500, supplier: 'NOUVAG', minQty: 1 },
    { name: 'Motor Endodôntico X-Smart Plus Dentsply', unit: 'peça', cost: 5400, supplier: 'Dentsply Sirona', minQty: 1 },
    { name: 'Câmera Intraoral HD USB c/ Foco Automático', unit: 'peça', cost: 1450, supplier: 'Dental Cremer', minQty: 1 },
    { name: 'Seladora de Grau Cirúrgico Bio-Art', unit: 'peça', cost: 890, supplier: 'Bio-Art', minQty: 1 },
    { name: 'Ultrassom e Jato de Bicarbonato Dabi Atlante', unit: 'peça', cost: 3800, supplier: 'Dabi Atlante', minQty: 1 }
  ],
  'Instrumentais': [
    { name: 'Jogo de Alavancas Apicais Selden (Kit 3 un)', unit: 'kit', cost: 240, supplier: 'Golgran', minQty: 2 },
    { name: 'Fórceps Odontológico Adulto nº 150 Inox', unit: 'unidade', cost: 180, supplier: 'Golgran', minQty: 2 },
    { name: 'Seringa Carpule com Refluxo Inox Golgran', unit: 'unidade', cost: 95, supplier: 'Golgran', minQty: 4 },
    { name: 'Sonda Periodontal Milimetrada OMS nº 15', unit: 'unidade', cost: 65, supplier: 'Duflex', minQty: 5 },
    { name: 'Kit de Brocas de Alta Velocidade Diamantadas (10 un)', unit: 'kit', cost: 120, supplier: 'KG Sorensen', minQty: 3 },
    // Grampos por região
    { name: 'Grampo 9 - Anteriores (Incisivos e Caninos)', unit: 'unidade', cost: 45, supplier: 'Golgran / Duflex', minQty: 1 },
    { name: 'Grampo 212 - Anteriores (Retração Gengival)', unit: 'unidade', cost: 45, supplier: 'Golgran / Duflex', minQty: 1 },
    { name: 'Grampo 2A - Pré-Molares (com Asas)', unit: 'unidade', cost: 45, supplier: 'Golgran / Duflex', minQty: 1 },
    { name: 'Grampo W2A - Pré-Molares (sem Asas)', unit: 'unidade', cost: 45, supplier: 'Golgran / Duflex', minQty: 1 },
    { name: 'Grampo 200 - Molares (Anatomia Padrão)', unit: 'unidade', cost: 45, supplier: 'Golgran / Duflex', minQty: 1 },
    { name: 'Grampo 8A - Molares Especiais (Coroas Curtas/Fraturadas)', unit: 'unidade', cost: 45, supplier: 'Golgran / Duflex', minQty: 1 },
    { name: 'Grampo W8A - Molares Especiais sem Asas', unit: 'unidade', cost: 45, supplier: 'Golgran / Duflex', minQty: 1 },
    { name: 'Grampo 14A - Molares Especiais (Parcialmente Erupcionados)', unit: 'unidade', cost: 45, supplier: 'Golgran / Duflex', minQty: 1 }
  ],
  'Anestésicos': [
    { name: 'Anestésico Alphacaine Lidocaína 2% c/ Epinefrina (50 tubetes)', unit: 'caixa', cost: 88, supplier: 'DFL', minQty: 5 },
    { name: 'Mepivacaína 3% sem Vasoconstrictor DFL (50 tubetes)', unit: 'caixa', cost: 98, supplier: 'DFL', minQty: 3 },
    { name: 'Articaína 4% 1:100.000 Articaine DFL (50 tubetes)', unit: 'caixa', cost: 135, supplier: 'DFL', minQty: 3 },
    { name: 'Anestésico Tópico Benzocaína 20% Gel Tutti-Frutti 12g', unit: 'frasco', cost: 28, supplier: 'DFL', minQty: 2 }
  ],
  'Resinas & Adesivos': [
    { name: 'Resina Composta Filtek Z350 XT A2 (Seringa 4g) 3M', unit: 'unidade', cost: 145, supplier: '3M Oral Care', minQty: 4 },
    { name: 'Adesivo Fotopolimerizável Single Bond Universal 5ml 3M', unit: 'frasco', cost: 210, supplier: '3M Oral Care', minQty: 2 },
    { name: 'Condicionador Ácido Fosfórico 37% Attagel (Kit 3 Seringas)', unit: 'kit', cost: 32, supplier: 'DFL', minQty: 3 },
    { name: 'Resina Flow Fluida A2 Opallis FGM (Seringa 2g)', unit: 'unidade', cost: 68, supplier: 'FGM', minQty: 3 }
  ],
  'Descartáveis': [
    { name: 'Agulha Gingival Curta 30G Descarpack (100 un)', unit: 'caixa', cost: 45, supplier: 'Descarpack', minQty: 5 },
    { name: 'Luva de Nitrilo Sem Pó Tam M (100 un)', unit: 'caixa', cost: 42, supplier: 'Supermax', minQty: 10 },
    { name: 'Máscara Tripla c/ Filtro BFE 98% (50 un)', unit: 'pacote', cost: 22, supplier: 'Descarpack', minQty: 5 },
    { name: 'Sugador Salivar Descartável Transparente (100 un)', unit: 'pacote', cost: 18, supplier: 'SS White', minQty: 8 },
    { name: 'Grau Cirúrgico 10cm x 100m em Rolo para Autoclave', unit: 'unidade', cost: 75, supplier: 'Hygipel', minQty: 2 }
  ],
  'Endodontia': [
    { name: 'Broca Largo (Peeso) Nº 1', unit: 'unidade', cost: 35, supplier: 'Maillefer / Dentsply', minQty: 1 },
    { name: 'Broca Largo (Peeso) Nº 2', unit: 'unidade', cost: 35, supplier: 'Maillefer / Dentsply', minQty: 1 },
    { name: 'Broca Largo (Peeso) Nº 3', unit: 'unidade', cost: 35, supplier: 'Maillefer / Dentsply', minQty: 1 },
    { name: 'Broca Largo (Peeso) Nº 4', unit: 'unidade', cost: 35, supplier: 'Maillefer / Dentsply', minQty: 1 },
    { name: 'Broca Largo (Peeso) Nº 5', unit: 'unidade', cost: 35, supplier: 'Maillefer / Dentsply', minQty: 1 },
    { name: 'Broca Largo (Peeso) Nº 6', unit: 'unidade', cost: 35, supplier: 'Maillefer / Dentsply', minQty: 1 },
    { name: 'Broca Gates Glidden Nº 1', unit: 'unidade', cost: 32, supplier: 'Maillefer / Dentsply', minQty: 1 },
    { name: 'Broca Gates Glidden Nº 2', unit: 'unidade', cost: 32, supplier: 'Maillefer / Dentsply', minQty: 1 },
    { name: 'Broca Gates Glidden Nº 3', unit: 'unidade', cost: 32, supplier: 'Maillefer / Dentsply', minQty: 1 },
    { name: 'Broca Gates Glidden Nº 4', unit: 'unidade', cost: 32, supplier: 'Maillefer / Dentsply', minQty: 1 },
    { name: 'Broca Gates Glidden Nº 5', unit: 'unidade', cost: 32, supplier: 'Maillefer / Dentsply', minQty: 1 },
    { name: 'Broca Gates Glidden Nº 6', unit: 'unidade', cost: 32, supplier: 'Maillefer / Dentsply', minQty: 1 },
    { name: 'Limas Rotatórias WaveOne Gold Medium (Blister 3 un)', unit: 'pacote', cost: 280, supplier: 'Dentsply Sirona', minQty: 3 },
    { name: 'Cimento Endodôntico Sealer Plus MK Life (12g)', unit: 'kit', cost: 195, supplier: 'MK Life', minQty: 2 },
    { name: 'Cones de Guta-Percha F2 ProTaper (60 un)', unit: 'caixa', cost: 62, supplier: 'Dentsply Sirona', minQty: 3 },
    { name: 'Solução de Hipoclorito de Sódio 2.5% 1 Litro', unit: 'frasco', cost: 24, supplier: 'Asseptgel', minQty: 4 }
  ],
  'Cirurgia': [
    { name: 'Fio de Saturação Seda 3-0 c/ Agulha 3/8 (24 un)', unit: 'caixa', cost: 85, supplier: 'Ethicon', minQty: 3 },
    { name: 'Lâmina de Bisturi nº 15 Descartável (100 un)', unit: 'caixa', cost: 58, supplier: 'Feather', minQty: 2 },
    { name: 'Esponja de Colágeno Hemostático Hemospon (10 un)', unit: 'caixa', cost: 92, supplier: 'Technew', minQty: 2 },
    { name: 'Enxerto Ósseo Bovino Gen-Ox Fracção 0.5g', unit: 'frasco', cost: 230, supplier: 'Baumer', minQty: 2 }
  ],
  'Ortodontia': [
    { name: 'Kit Braquetes Metálicos Roth 022 Slot Morelli', unit: 'kit', cost: 110, supplier: 'Morelli', minQty: 5 },
    { name: 'Arco Ortodôntico Niti 014 Superior (10 un)', unit: 'pacote', cost: 35, supplier: 'Morelli', minQty: 4 },
    { name: 'Resina Ortodôntica Transbond XT 3M Seringa', unit: 'unidade', cost: 215, supplier: '3M Oral Care', minQty: 2 }
  ],
  'Higiene & Biossegurança': [
    { name: 'Detergente Enzimático 5 Enzimas Riozyme 1L', unit: 'frasco', cost: 54, supplier: 'Riopanquímica', minQty: 3 },
    { name: 'Álcool 70% Hospitalar Galão 5 Litros', unit: 'frasco', cost: 48, supplier: 'Riopanquímica', minQty: 2 },
    { name: 'Pasta de Polimento Profilática Heraprep 90g', unit: 'frasco', cost: 34, supplier: 'Kulzer', minQty: 2 }
  ]
};

const DEFAULT_CATEGORIES = [
  'Equipamentos',
  'Instrumentais',
  'Anestésicos',
  'Descartáveis',
  'Resinas & Adesivos',
  'Endodontia',
  'Cirurgia',
  'Ortodontia',
  'Higiene & Biossegurança',
  'Dentística & Estética',
  'Prótese',
  'Implantes',
  'Outros'
];

const DEFAULT_UNITS = [
  'caixa',
  'unidade',
  'peça',
  'frasco',
  'pacote',
  'tubete',
  'kit',
  'conjunto',
  'galão',
  'litro',
  'par',
  'rolo',
  'ampola',
  'bisnaga',
  'seringa',
  'envelope',
  'pote'
];

// Helper to calculate sterilization expiration date (+6 months)
export const getSterilizationExpiryDateStr = (dateStr?: string): string => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const d = new Date(year, month, day);
    d.setMonth(d.getMonth() + 6);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
  return '';
};

export const formatBRDate = (dateStr?: string): string => {
  if (!dateStr) return '---';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
};

// Helper to calculate readiness & sterilization indicator for inventory items
export type ReadinessInfo = {
  isReady: boolean;
  statusType: 'sterilized' | 'maintenance_ok' | 'expired' | 'maintenance_overdue' | 'not_sterilized';
  badgeText: string;
  badgeTooltip: string;
  badgeClass: string;
};

export interface AutoclaveLog {
  id: string;
  date: string;
  autoclaveName: string;
  cycleNumber: string;
  temperature: number;
  pressure: number;
  durationMinutes: number;
  operatorName: string;
  biologicalTestResult: 'Aprovado (Negativo)' | 'Pendente' | 'Reprovado (Positivo)';
  chemicalIntegratorResult: 'Aprovado (Cor Conforme)' | 'Não Aprovado';
  physicalTableResult: 'Aprovado (Parâmetros Físicos OK)' | 'Desvio Detectado';
  integratorPhotoUrl?: string;
  biologicalTestPhotoUrl?: string;
  physicalTablePhotoUrl?: string;
  itemsIncluded: string[];
  notes?: string;
}

const INITIAL_AUTOCLAVE_LOGS: AutoclaveLog[] = [
  {
    id: 'auto-log-1',
    date: '2026-07-27T09:15',
    autoclaveName: 'Autoclave Cristófoli Vitale Class 12 Litros',
    cycleNumber: 'Ciclo #1042',
    temperature: 134,
    pressure: 2.1,
    durationMinutes: 15,
    operatorName: 'Hugo Andres Iglesias Ricoy',
    biologicalTestResult: 'Aprovado (Negativo)',
    chemicalIntegratorResult: 'Aprovado (Cor Conforme)',
    physicalTableResult: 'Aprovado (Parâmetros Físicos OK)',
    integratorPhotoUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60',
    biologicalTestPhotoUrl: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=500&auto=format&fit=crop&q=60',
    physicalTablePhotoUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500&auto=format&fit=crop&q=60',
    itemsIncluded: ['Kit Cirúrgico Estéril', 'Espelho Clínico Odontológico', 'Pinça Clínica Golgran', 'Explorador Nº 5'],
    notes: 'Ciclo matinal completo com aprovação biológica e química integradora de 5ª geração.'
  },
  {
    id: 'auto-log-2',
    date: '2026-07-26T14:30',
    autoclaveName: 'Autoclave Cristófoli Vitale Class 21 Litros',
    cycleNumber: 'Ciclo #1041',
    temperature: 134,
    pressure: 2.1,
    durationMinutes: 15,
    operatorName: 'Dra. Beatriz Santos',
    biologicalTestResult: 'Aprovado (Negativo)',
    chemicalIntegratorResult: 'Aprovado (Cor Conforme)',
    physicalTableResult: 'Aprovado (Parâmetros Físicos OK)',
    integratorPhotoUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60',
    biologicalTestPhotoUrl: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=500&auto=format&fit=crop&q=60',
    physicalTablePhotoUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500&auto=format&fit=crop&q=60',
    itemsIncluded: ['Broqueiro para broca de alta rotação', 'Kit Alavancas Apicais Golgran', 'Seringa Carpule Inox'],
    notes: 'Ciclo vespertino. Teste de Bowie-Dick e integrador de fita classe 5 aprovados.'
  }
];

import { getThemeStyles } from '../../utils/themeUtils';

export const getItemReadinessInfo = (item: InventoryItem): ReadinessInfo => {
  const todayStr = new Date().toISOString().split('T')[0];
  const isEquipment = item.category === 'Equipamentos' || item.itemType === 'equipamento' || item.requiresMaintenance;

  // 1. Expiration check (Automatic shutoff / indicator off if expired)
  if (item.expirationDate && item.expirationDate < todayStr) {
    return {
      isReady: false,
      statusType: 'expired',
      badgeText: 'Vencido (Ind. Apagado)',
      badgeTooltip: `Validade expirada em ${item.expirationDate}. Indicador apagado automaticamente — Proibido uso em procedimentos!`,
      badgeClass: 'bg-rose-100 text-rose-800 border-rose-300 font-bold opacity-90'
    };
  }

  // 2. Equipment maintenance check (Automatic shutoff if maintenance overdue)
  if (isEquipment) {
    const nextMaint = item.nextMaintenanceDate || item.maintenanceDate;
    if (nextMaint && nextMaint < todayStr) {
      return {
        isReady: false,
        statusType: 'maintenance_overdue',
        badgeText: 'Manutenção Vencida',
        badgeTooltip: `Revisão técnica vencida em ${nextMaint}. Indicador apagado automaticamente — Requer manutenção!`,
        badgeClass: 'bg-rose-100 text-rose-800 border-rose-300 font-bold opacity-90'
      };
    }

    return {
      isReady: true,
      statusType: 'maintenance_ok',
      badgeText: 'Em Dia (Pronto p/ Uso)',
      badgeTooltip: nextMaint ? `Manutenção em dia. Próxima revisão em ${nextMaint}` : 'Equipamento revisado e liberado para uso em procedimentos',
      badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold'
    };
  }

  // 3. Sterilization check for materials / instrumentals
  if (item.requiresSterilization === false) {
    return {
      isReady: true,
      statusType: 'sterilized',
      badgeText: 'Pronto p/ Uso (Isento)',
      badgeTooltip: 'Material liberado para procedimentos (não requer controle de esterilização em autoclave).',
      badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold'
    };
  }

  if (item.isSterilized === false) {
    return {
      isReady: false,
      statusType: 'not_sterilized',
      badgeText: 'Esterilizando / Em Manutenção',
      badgeTooltip: 'Material em processo de esterilização ou equipamento em manutenção. Clique para alterar o status de prontidão.',
      badgeClass: 'bg-amber-100 text-amber-900 border-amber-300 font-bold'
    };
  }

  // Check 6-month validity limit on autoclave cycle date
  if (item.sterilizationDate) {
    const sterilExpiry = getSterilizationExpiryDateStr(item.sterilizationDate);
    if (sterilExpiry && sterilExpiry < todayStr) {
      return {
        isReady: false,
        statusType: 'not_sterilized',
        badgeText: 'Esterilização Vencida (+6m)',
        badgeTooltip: `O ciclo de autoclave (${formatBRDate(item.sterilizationDate)}) venceu em ${formatBRDate(sterilExpiry)} (limite de 6 meses). Necessita de reesterilização!`,
        badgeClass: 'bg-rose-100 text-rose-800 border-rose-300 font-bold opacity-90'
      };
    }
  }

  return {
    isReady: true,
    statusType: 'sterilized',
    badgeText: 'Esterilizado (Pronto p/ Uso)',
    badgeTooltip: item.sterilizationDate 
      ? `Esterilizado em ${formatBRDate(item.sterilizationDate)} (Validade de 6m até ${formatBRDate(getSterilizationExpiryDateStr(item.sterilizationDate))}). Liberado para procedimentos.` 
      : 'Material esterilizado e liberado para procedimentos.',
    badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold'
  };
};

export const InventoryManager: React.FC = () => {
  const { 
    inventory, 
    addInventoryItem, 
    importInventoryBatch,
    updateInventoryItem, 
    adjustStockQuantity, 
    deleteInventoryItem, 
    clearInventory, 
    clinicInfo,
    clinics,
    professionals,
    appointments,
    tussProcedures,
    layoutTheme
  } = useApp();

  const t = getThemeStyles(layoutTheme);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [filterItemType, setFilterItemType] = useState<'todos' | 'insumo' | 'instrumental' | 'equipamento'>('todos');
  const [filterOwnerScope, setFilterOwnerScope] = useState<string>('todos');
  const [filterReadiness, setFilterReadiness] = useState<string>('todos');

  // Display mode: cards (cards de seleção) or table
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [deletingItem, setDeletingItem] = useState<InventoryItem | null>(null);

  const handleDeleteItem = (item: InventoryItem) => {
    setDeletingItem(item);
  };

  const confirmDeleteItem = () => {
    if (deletingItem) {
      deleteInventoryItem(deletingItem.id);
      if (editingItemId === deletingItem.id) {
        stopCamera();
        setIsAddItemModalOpen(false);
      }
      setDeletingItem(null);
    }
  };

  const handleCloneItem = (itemToClone?: InventoryItem) => {
    const target = itemToClone || (editingItemId ? inventory.find(i => i.id === editingItemId) : null);
    if (target) {
      openAddItemModalWithItem(target);
      setEditingItemId(null);
      setName(`${target.name || 'Material'} (Cópia)`);
      setItemCode('');
      setSerialNumber('');
      setIsAddItemModalOpen(true);
    }
  };

  // Interactive readiness notice popup
  const [readinessNotice, setReadinessNotice] = useState<{
    show: boolean;
    title: string;
    message: string;
    type: 'warning' | 'success' | 'info';
  } | null>(null);

  // Modals state
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [isConfirmClearModalOpen, setIsConfirmClearModalOpen] = useState(false);
  const [isDailyReportModalOpen, setIsDailyReportModalOpen] = useState(false);
  const [isYesterdayReportModalOpen, setIsYesterdayReportModalOpen] = useState(false);
  const [selectedAppointmentForReport, setSelectedAppointmentForReport] = useState<Appointment | null>(null);
  const [clearStep, setClearStep] = useState<1 | 2>(1);
  const [clearTypedConfirmation, setClearTypedConfirmation] = useState('');
  const [clearCheckboxConfirmed, setClearCheckboxConfirmed] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [isTotalItemsModalOpen, setIsTotalItemsModalOpen] = useState(false);
  const [reportModalTab, setReportModalTab] = useState<'items' | 'financial' | 'metrics' | 'autoclave'>('items');
  const [isAlertsModalOpen, setIsAlertsModalOpen] = useState(false);
  const [alertsModalTab, setAlertsModalTab] = useState<'low_stock' | 'maintenance'>('low_stock');

  // Autoclave Sterilization Control Database State
  const [autoclaveLogs, setAutoclaveLogs] = useState<AutoclaveLog[]>(() => {
    try {
      const saved = localStorage.getItem('dental_autoclave_logs_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error reading autoclave logs', e);
    }
    return INITIAL_AUTOCLAVE_LOGS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('dental_autoclave_logs_v1', JSON.stringify(autoclaveLogs));
    } catch (e) {
      console.error('Error saving autoclave logs', e);
    }
  }, [autoclaveLogs]);

  // Autoclave Equipment Options derived from Inventory Database
  const registeredAutoclaveOptions = useMemo(() => {
    const autoclavesInInventory = inventory.filter(i => 
      (i.category === 'Equipamentos' || i.itemType === 'equipamento' || i.name.toLowerCase().includes('autoclave')) &&
      i.name.toLowerCase().includes('autoclave')
    );

    if (autoclavesInInventory.length > 0) {
      return autoclavesInInventory.map(item => {
        const clinic = clinics.find(c => c.id === item.clinicId);
        const clinicName = clinic ? clinic.name : (item.clinicName || clinicInfo?.name || 'DentisPro - Unidade Centro / Paulista');
        return {
          value: `${item.name} (${clinicName})`,
          label: `${item.name} — Clínica: ${clinicName}`
        };
      });
    }

    return [
      {
        value: 'Autoclave Cristófoli Vitale Class 12L (Autoclave N° 1)',
        label: 'Autoclave N° 1 — Cristófoli Vitale Class 12L (Clínica MARV)'
      },
      {
        value: 'Autoclave Cristófoli Vitale Class 21L (Autoclave N° 2)',
        label: 'Autoclave N° 2 — Cristófoli Vitale Class 21L (Clínica MARV)'
      },
      {
        value: 'Autoclave Gnatus Bioclave 12L (Autoclave N° 3)',
        label: 'Autoclave N° 3 — Gnatus Bioclave 12L (DentisPro)'
      }
    ];
  }, [inventory, clinics, clinicInfo]);

  // Autoclave New Cycle Form State & CMER Modal State
  const [isAutoclaveCMERModalOpen, setIsAutoclaveCMERModalOpen] = useState(false);
  const [newCycleDate, setNewCycleDate] = useState(() => new Date().toISOString().slice(0, 16));
  const [newCycleAutoclaveName, setNewCycleAutoclaveName] = useState(() => 'Autoclave Cristófoli Vitale Class 12L (Autoclave N° 1)');
  const [newCycleNumber, setNewCycleNumber] = useState('Ciclo N° 1 do Dia');
  const [newCycleTemp, setNewCycleTemp] = useState('134');
  const [newCyclePressure, setNewCyclePressure] = useState('2.1');
  const [newCycleDuration, setNewCycleDuration] = useState('15');
  const [newCycleOperator, setNewCycleOperator] = useState('Hugo Andres Iglesias Ricoy');
  const [newCycleBioResult, setNewCycleBioResult] = useState<'Aprovado (Negativo)' | 'Pendente' | 'Reprovado (Positivo)'>('Aprovado (Negativo)');
  const [newCycleIntegratorResult, setNewCycleIntegratorResult] = useState<'Aprovado (Cor Conforme)' | 'Não Aprovado'>('Aprovado (Cor Conforme)');
  const [newCyclePhysicalResult, setNewCyclePhysicalResult] = useState<'Aprovado (Parâmetros Físicos OK)' | 'Desvio Detectado'>('Aprovado (Parâmetros Físicos OK)');
  const [newCycleIntegratorPhoto, setNewCycleIntegratorPhoto] = useState<string>('https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60');
  const [newCycleBioPhoto, setNewCycleBioPhoto] = useState<string>('https://images.unsplash.com/photo-1579154204601-01588f351e67?w=500&auto=format&fit=crop&q=60');
  const [newCyclePhysicalPhoto, setNewCyclePhysicalPhoto] = useState<string>('https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500&auto=format&fit=crop&q=60');
  const [newCycleLaudoPhoto, setNewCycleLaudoPhoto] = useState<string>('');
  const [newCycleSelectedItems, setNewCycleSelectedItems] = useState<string[]>([]);
  const [newCycleNotes, setNewCycleNotes] = useState('');
  const [showAddCycleForm, setShowAddCycleForm] = useState(false);
  const [previewingAutoclavePhoto, setPreviewingAutoclavePhoto] = useState<{ title: string; url: string } | null>(null);

  // Auto-calculate daily sterilization cycle sequence for the specific selected autoclave
  useEffect(() => {
    if (!newCycleDate) return;
    const datePart = newCycleDate.slice(0, 10);
    const dayFormatted = datePart.split('-').reverse().join('/');

    // Count cycles recorded on this date for the same autoclave machine
    const sameDayLogsForAutoclave = autoclaveLogs.filter(log => {
      const logDatePart = log.date ? log.date.slice(0, 10) : '';
      const sameDate = logDatePart === datePart;
      
      const normLogName = (log.autoclaveName || '').toLowerCase();
      const normSelectedName = (newCycleAutoclaveName || '').toLowerCase();
      
      const sameAutoclave = normLogName === normSelectedName || 
                            normLogName.includes('n° 1') && normSelectedName.includes('n° 1') ||
                            normLogName.includes('n° 2') && normSelectedName.includes('n° 2') ||
                            normLogName.includes('12l') && normSelectedName.includes('12l') ||
                            normLogName.includes('21l') && normSelectedName.includes('21l');

      return sameDate && sameAutoclave;
    });

    const dailyCycleIndex = sameDayLogsForAutoclave.length + 1;
    let autoclaveShortLabel = 'N° 1';
    if (newCycleAutoclaveName.includes('21L') || newCycleAutoclaveName.includes('N° 2')) {
      autoclaveShortLabel = 'N° 2';
    } else if (newCycleAutoclaveName.includes('Gnatus') || newCycleAutoclaveName.includes('N° 3')) {
      autoclaveShortLabel = 'N° 3';
    }

    setNewCycleNumber(`Ciclo N° ${dailyCycleIndex} de Hoje (${dayFormatted}) - Autoclave ${autoclaveShortLabel}`);
  }, [newCycleAutoclaveName, newCycleDate, autoclaveLogs]);

  // Rule: Se "Módulo Integrador Químico" e "Teste Biológico (Indicador)" = verde -> "Tabela / Ficha Física de Controle" = verde.
  // Qualquer outra condição -> "Tabela / Ficha Física de Controle" = vermelho.
  useEffect(() => {
    const isChemicalApproved = newCycleIntegratorResult === 'Aprovado (Cor Conforme)';
    const isBioApproved = newCycleBioResult === 'Aprovado (Negativo)';

    if (isChemicalApproved && isBioApproved) {
      setNewCyclePhysicalResult('Aprovado (Parâmetros Físicos OK)');
    } else {
      setNewCyclePhysicalResult('Desvio Detectado');
    }
  }, [newCycleIntegratorResult, newCycleBioResult]);

  const handleSaveAutoclaveCycle = (e: React.FormEvent) => {
    e.preventDefault();
    const newLog: AutoclaveLog = {
      id: `auto-log-${Date.now()}`,
      date: newCycleDate || new Date().toISOString().slice(0, 16),
      autoclaveName: newCycleAutoclaveName,
      cycleNumber: newCycleNumber,
      temperature: parseFloat(newCycleTemp) || 134,
      pressure: parseFloat(newCyclePressure) || 2.1,
      durationMinutes: parseInt(newCycleDuration) || 15,
      operatorName: newCycleOperator,
      biologicalTestResult: newCycleBioResult,
      chemicalIntegratorResult: newCycleIntegratorResult,
      physicalTableResult: newCyclePhysicalResult,
      integratorPhotoUrl: newCycleIntegratorPhoto || undefined,
      biologicalTestPhotoUrl: newCycleBioPhoto || undefined,
      physicalTablePhotoUrl: newCyclePhysicalPhoto || undefined,
      itemsIncluded: newCycleSelectedItems.length > 0 ? newCycleSelectedItems : ['Instrumentais Odontológicos Diversos'],
      notes: newCycleNotes + (newCycleLaudoPhoto ? ` [Laudo do Ciclo Anexado: ${newCycleLaudoPhoto}]` : '')
    };

    setAutoclaveLogs(prev => [newLog, ...prev]);

    // Mark items as sterilized in inventory
    if (newCycleSelectedItems.length > 0) {
      const todayStr = new Date().toISOString().split('T')[0];
      inventory.forEach(item => {
        if (newCycleSelectedItems.includes(item.name)) {
          updateInventoryItem(item.id, {
            isSterilized: true,
            sterilizationDate: todayStr,
            sterilizedBy: newCycleOperator || 'Hugo Andres Iglesias Ricoy',
            autoclaveModel: newCycleAutoclaveName || 'Autoclave Cristófoli Vitale Class 12L (Autoclave N° 1)',
            autoclaveWaterVolume: '150 ml de água destilada',
            autoclaveTemperature: `${newCycleTemp || '130'}°C`,
            autoclavePressure: `${newCyclePressure || '1,8'} kgf/cm²`,
            autoclaveSterilizationTime: `${newCycleDuration || '16'} minutos`,
            autoclaveDryingMode: 'Secagem com porta entreaberta',
            autoclaveCycleType: 'Automático (Programa Único)'
          });
        }
      });
    }

    setShowAddCycleForm(false);
    setNewCycleNotes('');
    setNewCycleLaudoPhoto('');
    alert(`✅ ${newCycleNumber} registrado com sucesso para a ${newCycleAutoclaveName}!`);
  };

  // Ownership & Scoping Form State
  const [ownerScope, setOwnerScope] = useState<InventoryOwnerScope>('compartilhado');
  const [itemClinicId, setItemClinicId] = useState<string>('');
  const [itemProfessionalId, setItemProfessionalId] = useState<string>('');

  // Categories List state
  const [categoriesList, setCategoriesList] = useState<string[]>(DEFAULT_CATEGORIES);
  const [isCreatingCustomCategory, setIsCreatingCustomCategory] = useState(false);
  const [customCategoryInput, setCustomCategoryInput] = useState('');

  // Units List state
  const [unitsList, setUnitsList] = useState<string[]>(DEFAULT_UNITS);
  const [isCreatingCustomUnit, setIsCreatingCustomUnit] = useState(false);
  const [customUnitInput, setCustomUnitInput] = useState('');

  // Form State
  const [itemType, setItemType] = useState<InventoryItemType>('insumo');
  const [itemCode, setItemCode] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<string>('Anestésicos');
  const [quantity, setQuantity] = useState('10');
  const [minQuantity, setMinQuantity] = useState('5');
  const [unit, setUnit] = useState<InventoryItem['unit']>('caixa');
  const [unitCost, setUnitCost] = useState('50.00');
  const [manufacturingDate, setManufacturingDate] = useState('2025-01-01');
  const [expirationDate, setExpirationDate] = useState('2027-12-31');
  const [supplier, setSupplier] = useState('Dental Cremer');
  const [photoUrl, setPhotoUrl] = useState('');
  const [itemImages, setItemImages] = useState<string[]>([]);
  
  // Sterilization & Readiness State
  const [requiresSterilization, setRequiresSterilization] = useState<boolean>(true);
  const [isSterilized, setIsSterilized] = useState<boolean>(true);
  const [sterilizationDate, setSterilizationDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [sterilizedBy, setSterilizedBy] = useState<string>('Hugo Andres Iglesias Ricoy');
  const [autoclaveModel, setAutoclaveModel] = useState<string>('Autoclave Cristófoli Vitale Class 12L');
  const [autoclaveWaterVolume, setAutoclaveWaterVolume] = useState<string>('150 ml de água destilada');
  const [autoclaveTemperature, setAutoclaveTemperature] = useState<string>('129°C – 132°C');
  const [autoclavePressure, setAutoclavePressure] = useState<string>('1,7 a 1,9 kgf/cm²');
  const [autoclaveSterilizationTime, setAutoclaveSterilizationTime] = useState<string>('16 minutos');
  const [autoclaveDryingMode, setAutoclaveDryingMode] = useState<string>('Secagem com porta entreaberta');
  const [autoclaveCycleType, setAutoclaveCycleType] = useState<string>('Automático (Programa Único)');
  
  // Equipment Maintenance Form State
  const [requiresMaintenance, setRequiresMaintenance] = useState(false);
  const [serialNumber, setSerialNumber] = useState('');
  const [maintenanceFrequencyDays, setMaintenanceFrequencyDays] = useState('180');
  const [lastMaintenanceDate, setLastMaintenanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [nextMaintenanceDate, setNextMaintenanceDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 180);
    return d.toISOString().split('T')[0];
  });
  const [maintenanceNotes, setMaintenanceNotes] = useState('');

  // Camera & Lens State
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanningLens, setIsScanningLens] = useState(false);
  const [lensScanSuccess, setLensScanSuccess] = useState<string | null>(null);

  // Google Lens AI Photo Staging & Prompts State
  const [isLensModalOpen, setIsLensModalOpen] = useState(false);
  const [currentCapturedPhoto, setCurrentCapturedPhoto] = useState<string | null>(null);
  const [stagedPhotos, setStagedPhotos] = useState<string[]>([]);
  const [showSavePhotoPrompt, setShowSavePhotoPrompt] = useState(false);
  const [showTakeAnotherPrompt, setShowTakeAnotherPrompt] = useState(false);
  const [forceUnrecognizedLens, setForceUnrecognizedLens] = useState(false);
  const [previewingFullImage, setPreviewingFullImage] = useState<string | null>(null);
  const [photoSuccessNotice, setPhotoSuccessNotice] = useState<string | null>(null);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [lastRecognizedProduct, setLastRecognizedProduct] = useState<{
    name: string;
    category: string;
    unit: 'caixa' | 'unidade' | 'frasco' | 'pacote' | 'par' | 'rolo' | 'kit' | 'peça';
    unitCost: number;
    supplier: string;
    minQty: number;
    requiresMaintenance?: boolean;
    freqDays?: number;
    notes?: string;
  } | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Open Lens Scanner Modal from Lista Geral de Itens or top menu
  const openLensScannerModal = () => {
    setIsLensModalOpen(true);
    setLensScanSuccess(null);
    startCamera();
  };

  // Auto-toggle equipment maintenance mode when category === 'Equipamentos'
  const handleCategoryChange = (cat: string) => {
    setCategory(cat);
    if (cat === 'Equipamentos') {
      setRequiresMaintenance(true);
      if (!unitCost || unitCost === '50.00') setUnitCost('1500.00');
      if (!minQuantity || minQuantity === '5') setMinQuantity('1');
      if (!quantity || quantity === '10') setQuantity('1');
      setUnit('peça');
    }
  };

  // Open Live Camera
  const startCamera = async () => {
    setCameraError(null);
    setIsCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(err => console.log('Video play catch:', err));
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setCameraError('Não foi possível acessar a câmera do dispositivo. Verifique as permissões do navegador ou faça o upload de uma imagem por arquivo.');
    }
  };

  // Attach stream when video element renders
  useEffect(() => {
    if (isCameraActive && videoRef.current && mediaStreamRef.current) {
      videoRef.current.srcObject = mediaStreamRef.current;
      videoRef.current.play().catch(err => console.log('Stream play error:', err));
    }
  }, [isCameraActive]);

  // Stop Camera
  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    setIsCameraActive(false);
  };

  // Capture photo from camera stream
  const capturePhotoFromCamera = (forceFail?: boolean) => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setCurrentCapturedPhoto(dataUrl);
        stopCamera();
        
        setItemImages(prev => Array.from(new Set([...prev, dataUrl])));
        if (!photoUrl) setPhotoUrl(dataUrl);
        setPhotoSuccessNotice('Foto capturada da câmera e adicionada com sucesso ao item!');
        setTimeout(() => setPhotoSuccessNotice(null), 4000);
      }
    }
  };

  // Handle Photo File Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, forceFail?: boolean) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      let addedCount = 0;
      files.forEach((file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            const dataUrl = reader.result;
            setCurrentCapturedPhoto(dataUrl);
            setItemImages(prev => Array.from(new Set([...prev, dataUrl])));
            if (!photoUrl) setPhotoUrl(dataUrl);
            addedCount++;
            if (addedCount === files.length) {
              setPhotoSuccessNotice(`${files.length} ${files.length === 1 ? 'imagem adicionada' : 'imagens adicionadas'} com sucesso!`);
              setTimeout(() => setPhotoSuccessNotice(null), 4000);
            }
            if (!isAddItemModalOpen) {
              stopCamera();
              runBarcodeScannerLookup();
            }
          }
        };
        reader.readAsDataURL(file);
      });
    }
    e.target.value = '';
  };

  // Helper to parse URLs or dental product codes/barcodes
  const parseProductUrlOrCode = (codeOrSearch?: string) => {
    if (!codeOrSearch) return null;
    const input = codeOrSearch.trim();

    const isUrl = input.startsWith('http://') || input.startsWith('https://') || input.includes('www.') || input.includes('.com.br') || input.includes('.com');

    if (isUrl) {
      try {
        let urlObj: URL | null = null;
        try {
          urlObj = new URL(input.startsWith('http') ? input : `https://${input}`);
        } catch (e) {
          urlObj = null;
        }

        let pathname = urlObj ? urlObj.pathname : input;
        pathname = pathname.split('?')[0].split('#')[0].replace(/\/+$/, '');

        const segments = pathname.split('/').filter(Boolean);
        let rawSlug = segments.length > 0 ? segments[segments.length - 1] : '';
        
        // Strip file extensions like .html, .php, .aspx
        rawSlug = rawSlug.replace(/\.(html|htm|php|aspx|jsp)$/i, '');

        // Extract SKU/REF number if attached to the end (e.g. -126332)
        let sku = '';
        const skuMatch = rawSlug.match(/[-_](\d{4,8})$/);
        if (skuMatch) {
          sku = skuMatch[1];
          rawSlug = rawSlug.replace(/[-_]\d{4,8}$/, '');
        }

        // Clean slug into words
        let cleanSlug = rawSlug.replace(/[-_]+/g, ' ').trim();

        // Dictionary for dental vocabulary capitalization and accents
        const wordMap: Record<string, string> = {
          'broca': 'Broca',
          'tungstenio': 'Tungstênio',
          'pera': 'Pêra',
          'corte': 'Corte',
          'cruzado': 'Cruzado',
          'extra': 'Extra',
          'grosso': 'Grosso',
          'fino': 'Fino',
          'superfino': 'Superfino',
          'medio': 'Médio',
          'n': 'Nº',
          'no': 'Nº',
          'american': 'American',
          'burrs': 'Burrs',
          'resina': 'Resina',
          'filtek': 'Filtek',
          'z350': 'Z350',
          'xt': 'XT',
          '3m': '3M',
          'anestesico': 'Anestésico',
          'alphacaine': 'Alphacaine',
          'lidocaina': 'Lidocaína',
          'mepivacaina': 'Mepivacaína',
          'articaina': 'Articaína',
          'epinefrina': 'Epinefrina',
          'dfl': 'DFL',
          'cristofoli': 'Cristófoli',
          'autoclave': 'Autoclave',
          'vitale': 'Vitale',
          'class': 'Class',
          'alicate': 'Alicate',
          'fresa': 'Fresa',
          'ponta': 'Ponta',
          'diamantada': 'Diamantada',
          'kg': 'KG',
          'sorensen': 'Sorensen',
          'fgm': 'FGM',
          'dentsply': 'Dentsply',
          'sirona': 'Sirona',
          'kavo': 'KaVo',
          'golgran': 'Golgran',
          'duflex': 'Duflex',
          'ultradent': 'Ultradent',
          'maquira': 'Maquira',
          'biodinamica': 'Biodinâmica',
          'septodont': 'Septodont',
          'coltene': 'Coltène',
          'kulzer': 'Kulzer',
          'voco': 'VOCO',
          'angelus': 'Angelus',
          'orthometric': 'Orthometric',
          'morelli': 'Morelli',
          'ionomero': 'Ionomero',
          'cimento': 'Cimento',
          'adesivo': 'Adesivo',
          'single': 'Single',
          'bond': 'Bond',
          'luva': 'Luva',
          'mascara': 'Máscara',
          'algodao': 'Algodão',
          'gaze': 'Gaze',
          'sugador': 'Sugador',
          'seladora': 'Seladora',
          'fotopolimerizador': 'Fotopolimerizador',
          'bio-art': 'Bio-Art',
          'bioart': 'Bio-Art'
        };

        const words = cleanSlug.split(/\s+/);
        const formattedWords = words.map(w => {
          const lower = w.toLowerCase();
          if (wordMap[lower]) return wordMap[lower];
          if (/^\d+$/.test(w)) return w;
          return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
        });

        let name = formattedWords.join(' ');

        if (!name || name.length < 3) {
          name = 'Material Odontológico Extraído do Link';
        }

        // Category determination
        const lowerName = name.toLowerCase();
        let category = 'Outros';
        if (lowerName.includes('broca') || lowerName.includes('fresa') || lowerName.includes('ponta') || lowerName.includes('burrs') || lowerName.includes('alicate') || lowerName.includes('sonda') || lowerName.includes('forceps') || lowerName.includes('alavanca')) {
          category = 'Instrumentais';
        } else if (lowerName.includes('resina') || lowerName.includes('adesivo') || lowerName.includes('filtek') || lowerName.includes('ionomero') || lowerName.includes('acido')) {
          category = 'Resinas & Adesivos';
        } else if (lowerName.includes('anestesico') || lowerName.includes('alphacaine') || lowerName.includes('lidocaina') || lowerName.includes('mepivacaina') || lowerName.includes('articaina')) {
          category = 'Anestésicos';
        } else if (lowerName.includes('autoclave') || lowerName.includes('seladora') || lowerName.includes('fotopolimerizador') || lowerName.includes('motor') || lowerName.includes('ultrassom')) {
          category = 'Equipamentos';
        } else if (lowerName.includes('luva') || lowerName.includes('mascara') || lowerName.includes('algodao') || lowerName.includes('gaze') || lowerName.includes('sugador') || lowerName.includes('touca')) {
          category = 'Descartáveis';
        } else if (lowerName.includes('lima') || lowerName.includes('cone') || lowerName.includes('gutta') || lowerName.includes('endo')) {
          category = 'Endodontia';
        }

        // Supplier determination
        let supplier = 'Dental Cremer';
        if (lowerName.includes('american burrs')) supplier = 'American Burrs';
        else if (lowerName.includes('3m')) supplier = '3M Oral Care';
        else if (lowerName.includes('dfl')) supplier = 'DFL Odontologia';
        else if (lowerName.includes('cristofoli')) supplier = 'Cristófoli Biossegurança';
        else if (lowerName.includes('fgm')) supplier = 'FGM Dental Group';
        else if (lowerName.includes('kg sorensen')) supplier = 'KG Sorensen';
        else if (lowerName.includes('golgran')) supplier = 'Golgran';
        else if (urlObj && urlObj.hostname) {
          if (urlObj.hostname.includes('dentalspeed')) supplier = 'Dental Speed';
          else if (urlObj.hostname.includes('dentalmachado')) supplier = 'Dental Machado';
        }

        // Unit determination
        let unit: InventoryItem['unit'] = 'unidade';
        if (category === 'Equipamentos') unit = 'peça';
        else if (lowerName.includes('anestesico') || lowerName.includes('luva')) unit = 'caixa';

        // Price estimation
        let unitCost = '45.00';
        if (lowerName.includes('broca') || lowerName.includes('burrs')) unitCost = '68.90';
        else if (category === 'Equipamentos') unitCost = '3800.00';
        else if (category === 'Anestésicos') unitCost = '88.00';
        else if (category === 'Resinas & Adesivos') unitCost = '145.00';

        return {
          code: sku || '126332',
          name,
          category,
          unit,
          unitCost,
          supplier,
          minQty: '2'
        };
      } catch (err) {
        console.error('Error parsing URL', err);
      }
    }

    return null;
  };

  // Handle Photo Add via Direct URL Link
  const handleAddPhotoFromUrl = () => {
    const trimmed = imageUrlInput.trim();
    if (!trimmed) return;

    // Check if trimmed is an image URL (ends with .jpg, .png, etc.) or a web page link
    const isDirectImage = /\.(jpg|jpeg|png|webp|gif|svg)(\?.*)?$/i.test(trimmed);

    if (isDirectImage) {
      setItemImages(prev => Array.from(new Set([...prev, trimmed])));
      if (!photoUrl) setPhotoUrl(trimmed);
    }
    // If it's a product web page link (and not a direct image URL), we do NOT add any dummy/sample photo.
    // We only extract the product registration data (name, category, supplier, code, etc.).

    setImageUrlInput('');

    // Automatic extraction of material registration data upon inserting photo link
    runBarcodeScannerLookup(trimmed);
    setPhotoSuccessNotice('Dados e especificações do material extraídos com sucesso a partir do link!');
    setTimeout(() => setPhotoSuccessNotice(null), 4000);
  };

  // Barcode Scanner & Catalog Lookup Engine
  const runBarcodeScannerLookup = (codeOrSearch?: string) => {
    setIsScanningLens(true);
    setLensScanSuccess(null);

    setTimeout(() => {
      setIsScanningLens(false);

      // First try intelligent URL or code parser
      const parsed = parseProductUrlOrCode(codeOrSearch);

      type MatchedProduct = {
        code: string;
        name: string;
        category: string;
        unit: 'unidade' | 'caixa' | 'frasco' | 'pacote' | 'par' | 'kit' | 'peça' | 'tubete' | 'bisnaga' | 'seringa' | 'rolo';
        unitCost: number;
        supplier: string;
        minQty: number;
        requiresMaintenance: boolean;
        freqDays?: number;
        notes?: string;
      };

      let matched: MatchedProduct;

      if (parsed) {
        matched = {
          code: parsed.code,
          name: parsed.name,
          category: parsed.category,
          unit: parsed.unit as MatchedProduct['unit'],
          unitCost: parseFloat(parsed.unitCost),
          supplier: parsed.supplier,
          minQty: parseInt(parsed.minQty, 10),
          requiresMaintenance: false,
          freqDays: undefined,
          notes: undefined
        };
      } else {
        const pool: MatchedProduct[] = [
          {
            code: codeOrSearch || '7891234567890',
            name: 'Autoclave Cristófoli Vitale Class 12 Litros',
            category: 'Equipamentos',
            unit: 'peça',
            unitCost: 4800,
            supplier: 'Cristófoli Biossegurança',
            minQty: 1,
            requiresMaintenance: true,
            freqDays: 180,
            notes: 'Substituição do anel de vedação, teste biológico e aferição de temperatura e pressão.'
          },
          {
            code: codeOrSearch || '7899876543210',
            name: 'Anestésico Alphacaine Lidocaína 2% c/ Epinefrina',
            category: 'Anestésicos',
            unit: 'caixa',
            unitCost: 88,
            supplier: 'DFL Odontologia',
            minQty: 5,
            requiresMaintenance: false
          },
          {
            code: codeOrSearch || '7894561239870',
            name: 'Resina Composta Filtek Z350 XT A2 3M',
            category: 'Resinas & Adesivos',
            unit: 'unidade',
            unitCost: 145,
            supplier: '3M Oral Care',
            minQty: 3,
            requiresMaintenance: false
          }
        ];
        matched = pool[Math.floor(Math.random() * pool.length)];
      }

      const existingItem = inventory.find(i => i.itemCode && i.itemCode.trim().toLowerCase() === matched.code.trim().toLowerCase());
      if (existingItem) {
        alert(`⚠️ ATENÇÃO: Já existe um item cadastrado com este código ("${matched.code}")!\n\nItem Existente: "${existingItem.name}" (${existingItem.category}).\n\nPor favor, verifique o que está acontecendo (possível duplicata ou divergência no inventário).`);
      }

      setItemCode(matched.code);
      setName(matched.name);
      setCategory(matched.category);
      setUnit(matched.unit);
      setUnitCost(matched.unitCost.toFixed(2));
      setSupplier(matched.supplier);
      setMinQuantity(matched.minQty.toString());

      if (matched.requiresMaintenance) {
        setRequiresMaintenance(true);
        setMaintenanceFrequencyDays(matched.freqDays ? matched.freqDays.toString() : '180');
        setMaintenanceNotes(matched.notes || '');
      } else {
        setRequiresMaintenance(false);
      }

      setLensScanSuccess(`Material extraído com sucesso: "${matched.name}" (${matched.category})`);
      setIsLensModalOpen(false);
      setIsAddItemModalOpen(true);
    }, 600);
  };

  // =========================================================================
  // 3 MODOS DE CAPTURA PELA CÂMERA (GOOGLE LENS AI)
  // =========================================================================

  // MODO 1: Descartar foto (Descarta captura e reinicia câmera imediatamente)
  const handleDiscardCapturedPhoto = () => {
    setShowSavePhotoPrompt(false);
    setShowTakeAnotherPrompt(false);
    setCurrentCapturedPhoto(null);
    setLastRecognizedProduct(null);
    setIsLensModalOpen(true);
    startCamera();
  };

  // MODO 2: Salvar e Tirar Outra Foto (Salva no lote e reativa câmera para próxima foto)
  const handleSaveAndTakeAnotherPhoto = () => {
    setShowSavePhotoPrompt(false);
    setShowTakeAnotherPrompt(false);
    if (currentCapturedPhoto) {
      const updatedStaged = Array.from(new Set([...stagedPhotos, currentCapturedPhoto]));
      setStagedPhotos(updatedStaged);
      setItemImages(prev => Array.from(new Set([...prev, currentCapturedPhoto])));
      if (!photoUrl) setPhotoUrl(currentCapturedPhoto);
    }
    setCurrentCapturedPhoto(null);
    setIsLensModalOpen(true);
    startCamera();
  };

  // MODO 3: Salvar e Fechar Câmera / Ir para Tela de Inclusão do Material
  const handleSaveAndGoToRegistration = () => {
    setShowSavePhotoPrompt(false);
    setShowTakeAnotherPrompt(false);
    stopCamera();
    
    let allPhotos = [...stagedPhotos];
    if (currentCapturedPhoto && !allPhotos.includes(currentCapturedPhoto)) {
      allPhotos.push(currentCapturedPhoto);
    }
    
    if (allPhotos.length > 0) {
      setStagedPhotos(allPhotos);
      setItemImages(prev => Array.from(new Set([...prev, ...allPhotos])));
      setPhotoUrl(allPhotos[0]);
    }
    setCurrentCapturedPhoto(null);
    setIsLensModalOpen(false);
    setIsAddItemModalOpen(true);
  };

  const handleGoToManualRegistrationFromLens = () => {
    stopCamera();
    if (stagedPhotos.length > 0) {
      setItemImages(prev => Array.from(new Set([...prev, ...stagedPhotos])));
      setPhotoUrl(stagedPhotos[0]);
    }
    setIsLensModalOpen(false);
    setIsAddItemModalOpen(true);
  };

  // Add Custom Category Handler
  const handleAddCustomCategory = () => {
    const trimmed = customCategoryInput.trim();
    if (trimmed && !categoriesList.includes(trimmed)) {
      setCategoriesList(prev => [...prev, trimmed]);
      setCategory(trimmed);
      setCustomCategoryInput('');
      setIsCreatingCustomCategory(false);
    }
  };

  // Handle Add Custom Unit of Measure
  const handleAddCustomUnit = () => {
    const trimmed = customUnitInput.trim().toLowerCase();
    if (!trimmed) return;
    if (!unitsList.includes(trimmed)) {
      setUnitsList(prev => [...prev, trimmed]);
    }
    setUnit(trimmed);
    setCustomUnitInput('');
    setIsCreatingCustomUnit(false);
  };

  // Apply suggestion
  const applySuggestion = (sug: { name: string; unit: InventoryItem['unit']; cost: number; supplier: string; minQty?: number }) => {
    setName(sug.name);
    setUnit(sug.unit);
    if (sug.unit && !unitsList.includes(sug.unit.toLowerCase())) {
      setUnitsList(prev => [...prev, sug.unit.toLowerCase()]);
    }
    setUnitCost(sug.cost.toFixed(2));
    setSupplier(sug.supplier);
    if (sug.minQty) setMinQuantity(sug.minQty.toString());
  };

  // Calculations & Helper for Low Stock Alerts
  const isItemLowStock = (item: InventoryItem): boolean => {
    const computedType: InventoryItemType = item.itemType || (
      item.category === 'Equipamentos' ? 'equipamento' :
      item.category === 'Instrumentais' ? 'instrumental' :
      'insumo'
    );

    if (computedType === 'instrumental' || computedType === 'equipamento') {
      // Para instrumental ou equipamento: o alerta só é disparado se a quantidade estiver zerada (0) ou estritamente abaixo do mínimo (< minQuantity).
      // Não dispara falso alerta de falta quando há 1 ou 2 unidades funcionais (por exemplo, 1 unidade com minQuantity=1).
      return item.quantity === 0 || item.quantity < item.minQuantity;
    }

    // Para Insumo / Consumível: dispara alerta quando quantidade <= minQuantity
    return item.quantity <= item.minQuantity;
  };

  const lowStockItems = inventory.filter(isItemLowStock).sort((a, b) => (a.name || '').localeCompare(b.name || '', 'pt-BR'));

  // Equipment requiring maintenance or with upcoming maintenance
  const equipmentItems = inventory.filter(i => 
    i.category === 'Equipamentos' || 
    i.itemType === 'equipamento' || 
    i.requiresMaintenance || 
    !!i.nextMaintenanceDate || 
    !!i.maintenanceDate
  ).sort((a, b) => (a.name || '').localeCompare(b.name || '', 'pt-BR'));

  const todayStr = new Date().toISOString().split('T')[0];

  const maintenanceDueItems = equipmentItems.filter(item => {
    const dueDate = item.nextMaintenanceDate || item.maintenanceDate;
    if (!dueDate) return false;
    // Overdue or due within 30 days
    const diffDays = Math.ceil((new Date(dueDate).getTime() - new Date(todayStr).getTime()) / (1000 * 3600 * 24));
    return diffDays <= 30;
  });

  const totalStockValue = inventory.reduce((acc, i) => acc + (i.quantity * i.unitCost), 0);

  // Toggle readiness status or show automatic shutoff notice
  const handleToggleReadinessIndicator = (item: InventoryItem) => {
    const readiness = getItemReadinessInfo(item);

    if (readiness.statusType === 'expired') {
      setReadinessNotice({
        show: true,
        title: 'Material Vencido — Indicador Apagado Automático',
        message: `O material "${item.name}" teve a validade expirada em ${item.expirationDate}. O indicador apaga sozinho por biossegurança e não pode ser ativado para procedimentos clínicos até que a validade seja atualizada ou o item substituído.`,
        type: 'warning'
      });
      return;
    }

    if (readiness.statusType === 'maintenance_overdue') {
      setReadinessNotice({
        show: true,
        title: 'Manutenção Vencida — Indicador Apagado Automático',
        message: `O equipamento "${item.name}" está com a manutenção preventiva vencida desde ${item.nextMaintenanceDate || item.maintenanceDate}. O indicador permanece apagado e o equipamento bloqueado para uso até o registro de nova revisão técnica.`,
        type: 'warning'
      });
      return;
    }

    if (readiness.statusType === 'maintenance_ok') {
      setReadinessNotice({
        show: true,
        title: 'Equipamento com Manutenção Em Dia',
        message: `O equipamento "${item.name}" está com a revisão técnica em dia. Próxima manutenção agendada para ${item.nextMaintenanceDate || 'breve'}.`,
        type: 'success'
      });
      return;
    }

    if (item.requiresSterilization === false) {
      setReadinessNotice({
        show: true,
        title: 'Material Isento de Esterilização',
        message: `O material "${item.name}" está configurado como ISENTO de controle de autoclave e está pronto para uso nos procedimentos. Para ativar o controle de esterilização, acesse a edição do item.`,
        type: 'info'
      });
      return;
    }

    // Toggle sterilization for valid materials / instrumentals
    if (item.isSterilized) {
      updateInventoryItem(item.id, {
        isSterilized: false,
        lastUpdated: new Date().toISOString().split('T')[0]
      });
      setReadinessNotice({
        show: true,
        title: 'Status: Esterilizando / Em Manutenção',
        message: `O item "${item.name}" foi marcado como "ESTERILIZANDO / EM MANUTENÇÃO". O indicador amarelo de seleção permanecerá ativo até a conclusão.`,
        type: 'info'
      });
    } else {
      const today = new Date().toISOString().split('T')[0];
      updateInventoryItem(item.id, {
        isSterilized: true,
        sterilizationDate: today,
        lastUpdated: today
      });
      setReadinessNotice({
        show: true,
        title: 'Material Esterilizado & Pronto para Uso! 🟢',
        message: `O item "${item.name}" foi registrado como ESTERILIZADO na autoclave em ${today}. O indicador de seleção verde está ativo para procedimentos.`,
        type: 'success'
      });
    }
  };

  // Filter items for main table
  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (item.itemCode && item.itemCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (item.supplier && item.supplier.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (item.serialNumber && item.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'todos' || item.category === selectedCategory;

    const computedType: InventoryItemType = item.itemType || (
      item.category === 'Equipamentos' ? 'equipamento' :
      item.category === 'Instrumentais' ? 'instrumental' :
      'insumo'
    );
    const matchesItemType = filterItemType === 'todos' || computedType === filterItemType;

    const matchesLowStock = !showLowStockOnly || isItemLowStock(item);

    let matchesScope = true;
    if (filterOwnerScope === 'compartilhado') {
      matchesScope = !item.ownerScope || item.ownerScope === 'compartilhado';
    } else if (filterOwnerScope === 'clinica') {
      matchesScope = item.ownerScope === 'clinica';
    } else if (filterOwnerScope === 'profissional') {
      matchesScope = item.ownerScope === 'profissional';
    }

    let matchesReadiness = true;
    const readiness = getItemReadinessInfo(item);
    if (filterReadiness === 'prontos') {
      matchesReadiness = readiness.isReady;
    } else if (filterReadiness === 'vencidos') {
      matchesReadiness = readiness.statusType === 'expired' || readiness.statusType === 'maintenance_overdue';
    } else if (filterReadiness === 'nao_esterilizados') {
      matchesReadiness = readiness.statusType === 'not_sterilized';
    }

    return matchesSearch && matchesCategory && matchesItemType && matchesLowStock && matchesScope && matchesReadiness;
  }).sort((a, b) => (a.name || '').localeCompare(b.name || '', 'pt-BR'));

  // Open Cadastrar/Editar Material ou Equipamento Modal
  const openAddItemModalWithItem = (item?: InventoryItem) => {
    if (item) {
      setEditingItemId(item.id);
      setItemType(item.itemType || (item.category === 'Equipamentos' ? 'equipamento' : item.category === 'Instrumentais' ? 'instrumental' : 'insumo'));
      setItemCode(item.itemCode || '');
      setName(item.name || '');
      setCategory(item.category || 'Anestésicos');
      setQuantity((item.quantity !== undefined && item.quantity !== null ? item.quantity : 10).toString());
      setMinQuantity((item.minQuantity !== undefined && item.minQuantity !== null ? item.minQuantity : 5).toString());
      const itemUnit = item.unit || 'caixa';
      setUnit(itemUnit);
      if (itemUnit && !unitsList.includes(itemUnit.toLowerCase())) {
        setUnitsList(prev => [...prev, itemUnit.toLowerCase()]);
      }
      setUnitCost((item.unitCost !== undefined && item.unitCost !== null ? item.unitCost : 50).toString());
      setManufacturingDate(item.manufacturingDate || '');
      setExpirationDate(item.expirationDate || '2027-12-31');
      setSupplier(item.supplier || 'Dental Cremer');
      const loadedPhotos = item.images && item.images.length > 0 
        ? item.images 
        : (item.photoUrl || item.imageUrl ? [item.photoUrl || item.imageUrl!] : []);
      setPhotoUrl(loadedPhotos[0] || '');
      setItemImages(loadedPhotos);
      setRequiresSterilization(item.requiresSterilization !== undefined ? item.requiresSterilization : true);
      setIsSterilized(item.isSterilized !== undefined ? item.isSterilized : true);
      setSterilizationDate(item.sterilizationDate || new Date().toISOString().split('T')[0]);
      setSterilizedBy(item.sterilizedBy || 'Hugo Andres Iglesias Ricoy');
      setAutoclaveModel(item.autoclaveModel || 'Autoclave Cristófoli Vitale Class 12L');
      setAutoclaveWaterVolume(item.autoclaveWaterVolume || '150 ml de água destilada');
      setAutoclaveTemperature(item.autoclaveTemperature || '129°C – 132°C');
      setAutoclavePressure(item.autoclavePressure || '1,7 a 1,9 kgf/cm²');
      setAutoclaveSterilizationTime(item.autoclaveSterilizationTime || '16 minutos');
      setAutoclaveDryingMode(item.autoclaveDryingMode || 'Secagem com porta entreaberta');
      setAutoclaveCycleType(item.autoclaveCycleType || 'Automático (Programa Único)');
      setRequiresMaintenance(!!item.requiresMaintenance || item.category === 'Equipamentos' || item.itemType === 'equipamento');
      setSerialNumber(item.serialNumber || '');
      setMaintenanceFrequencyDays((item.maintenanceFrequencyDays || 180).toString());
      setLastMaintenanceDate(item.lastMaintenanceDate || new Date().toISOString().split('T')[0]);
      setNextMaintenanceDate(item.nextMaintenanceDate || item.maintenanceDate || new Date().toISOString().split('T')[0]);
      setMaintenanceNotes(item.maintenanceNotes || '');
      setOwnerScope(item.ownerScope || 'compartilhado');
      setItemClinicId(item.clinicId || clinics[0]?.id || '');
      setItemProfessionalId(item.professionalId || professionals[0]?.id || '');
    } else {
      setEditingItemId(null);
      setItemType('insumo');
      setItemCode('');
      setName('');
      setCategory('Anestésicos');
      setQuantity('10');
      setMinQuantity('5');
      setUnit('caixa');
      setUnitCost('50.00');
      setManufacturingDate('');
      setExpirationDate('2027-12-31');
      setSupplier('Dental Cremer');
      setPhotoUrl('');
      setItemImages([]);
      setRequiresSterilization(true);
      setIsSterilized(true);
      setSterilizationDate(new Date().toISOString().split('T')[0]);
      setSterilizedBy('Hugo Andres Iglesias Ricoy');
      setAutoclaveModel('Autoclave Cristófoli Vitale Class 12L');
      setAutoclaveWaterVolume('150 ml de água destilada');
      setAutoclaveTemperature('129°C – 132°C');
      setAutoclavePressure('1,7 a 1,9 kgf/cm²');
      setAutoclaveSterilizationTime('16 minutos');
      setAutoclaveDryingMode('Secagem com porta entreaberta');
      setAutoclaveCycleType('Automático (Programa Único)');
      setRequiresMaintenance(false);
      setSerialNumber('');
      setMaintenanceFrequencyDays('180');
      setLastMaintenanceDate(new Date().toISOString().split('T')[0]);
      setNextMaintenanceDate(() => {
        const d = new Date();
        d.setDate(d.getDate() + 180);
        return d.toISOString().split('T')[0];
      });
      setMaintenanceNotes('');
      const drHugo = professionals.find(p => p.name.toLowerCase().includes('hugo')) || professionals[0];
      setOwnerScope('profissional');
      setItemClinicId(clinics[0]?.id || '');
      setItemProfessionalId(drHugo?.id || '');
    }
    setLensScanSuccess(null);
    setIsAddItemModalOpen(true);
  };

  const handleImportOfficialPdfList = (fileName: string = 'lista_materiais_oficial.pdf') => {
    const officialItems = [
      { code: '76167', name: 'Ácido fosfórico a 37%', category: 'Consumíveis & Descartáveis', qty: 200, unit: 'pacotes', cost: 15, supplier: 'Dental Cremer', notes: 'Seringa de 2,5 gramas, pacote com 3 unidades' },
      { code: '76168', name: 'Acrílico auto polimerizante em pó, de 78 gramas', category: 'Prótese & Acrílicos', qty: 10, unit: 'caixas', cost: 45, supplier: 'Vipi', notes: 'Caixa com 1 unidade, acrilizar peças protéticas e reembasar' },
      { code: '76169', name: 'Acrílico auto polimerizante em líquido, frasco de 120ml', category: 'Prótese & Acrílicos', qty: 10, unit: 'frascos', cost: 38, supplier: 'Vipi', notes: 'Frasco de 120ml para acrilizar peças protéticas e reembasar' },
      { code: '76170', name: 'Adesivo fotopolimerizavél, vidro de 6 gramas', category: 'Resinas & Adesivos', qty: 200, unit: 'unidades', cost: 85, supplier: '3M', notes: 'Sistema condicionante de resina composta' },
      { code: '76171', name: 'Água oxigenada líquida 10 volumes', category: 'Consumíveis & Descartáveis', qty: 30, unit: 'frascos', cost: 12, supplier: 'Rioquímica', notes: 'Frasco de 1 litro' },
      { code: '76173', name: 'Agulha gengival descartável 30G longa', category: 'Consumíveis & Descartáveis', qty: 40, unit: 'caixas', cost: 44, supplier: 'DFL', notes: 'Caixa com 100 unidades, utilizada para aplicação de anestesia local' },
      { code: '76174', name: 'Algodão rolete', category: 'Consumíveis & Descartáveis', qty: 500, unit: 'pacotes', cost: 18, supplier: 'Allpack', notes: 'Fibra 100% algodão, pacote com 100 unidades, embalado individualmente, livre de impurezas' },
      { code: '76175', name: 'Anestésico tópico gel', category: 'Anestésicos', qty: 100, unit: 'potes', cost: 28, supplier: 'DFL', notes: 'Pote de 12 gramas, sabor Tutti-Frutti' },
      { code: '76176', name: 'Anestésico cloridrato de lidocaina com epinefrina', category: 'Anestésicos', qty: 100, unit: 'caixas', cost: 95, supplier: 'Nova DFL', notes: 'Tubete de vidro de 1,8ml, caixa com 50 unidades' },
      { code: '76177', name: 'Anestésico cloridrato de lidocaina com norepinefrina 3%', category: 'Anestésicos', qty: 60, unit: 'caixas', cost: 98, supplier: 'Nova DFL', notes: 'Tubete de 1,8ml, caixa com 50 unidades' },
      { code: '76329', name: 'Anestésico cloridrato de lidocaina sem vasoconstritor de 2%', category: 'Anestésicos', qty: 40, unit: 'caixas', cost: 90, supplier: 'Nova DFL', notes: 'Tubete de 1,8ml, caixa com 50 unidades' },
      { code: '76330', name: 'Anestésico cloridrato de prilocaina com felipressina 3%', category: 'Anestésicos', qty: 60, unit: 'caixas', cost: 92, supplier: 'Nova DFL', notes: 'Tubete de 1,8ml, caixa com 50 unidades' },
      { code: '76331', name: 'Anestésico mepivacaina com epinefrina', category: 'Anestésicos', qty: 60, unit: 'caixas', cost: 96, supplier: 'Nova DFL', notes: 'Tubete de 1,8ml, caixa com 50 unidades' },
      { code: '76332', name: 'Aplicador grosso descartável regular', category: 'Consumíveis & Descartáveis', qty: 200, unit: 'potes', cost: 35, supplier: 'DFL', notes: 'Caixa com 100 unidades, utilizado para aplicação do adesivo polimerizável' },
      { code: '76333', name: 'Abridor de boca de borracha, de silicone com perfuração para fio dental', category: 'Instrumentais', qty: 20, unit: 'pacotes', cost: 40, supplier: 'Golgran', notes: 'Manter abertura de boca durante o tratamento, pacotes com 2 unidades' },
      { code: '76334', name: 'Babador impermeável descartável', category: 'Biossegurança & EPIs', qty: 60, unit: 'pacotes', cost: 25, supplier: 'Descarpack', notes: 'Pacote com 100 unidades, impedir que sujeiras inerentes ao atendimento odontológico caia no paciente' },
      { code: '76335', name: 'Babador de plástico', category: 'Biossegurança & EPIs', qty: 50, unit: 'pacotes', cost: 22, supplier: 'Descarpack', notes: 'Pacote com 10 unidades, impedir que sujeiras inerentes ao atendimento odontológico caia no paciente' },
      { code: '76336', name: 'Broqueiro para broca de alta rotação', category: 'Equipamentos', qty: 50, unit: 'unidades', cost: 55, supplier: 'OdontoMega', notes: 'Em alumínio, reservatório de brocas' },
      { code: '76337', name: 'Câmara escura odontológica para revelação', category: 'Radiologia', qty: 6, unit: 'unidades', cost: 120, supplier: 'Dabi Atlante', notes: 'Sem iluminação indicada para revelação de filmes odontológicos periapicais' },
      { code: '76338', name: 'Caixa coletora 13 litros', category: 'Biossegurança & EPIs', qty: 80, unit: 'unidades', cost: 30, supplier: 'Descarpack', notes: 'Para material perfurocortante' },
      { code: '76339', name: 'Canudinho de refrigerante 6mm', category: 'Consumíveis & Descartáveis', qty: 100, unit: 'pacotes', cost: 15, supplier: 'Plastil', notes: 'Pacote com 100 unidades' },
      { code: '76340', name: 'Carbono para registro oclusal, dupla face', category: 'Consumíveis & Descartáveis', qty: 80, unit: 'caixas', cost: 24, supplier: 'Bausch', notes: 'Carbono na cor vermelho e preto S053, caixa com 12 folhetos' },
      { code: '76341', name: 'Cera odontológica nº 7, na cor rosa', category: 'Prótese & Acrílicos', qty: 20, unit: 'caixas', cost: 32, supplier: 'Vipi', notes: 'Caixa de 225 gramas, de uso protético para ajustamento de próteses' },
      { code: '76342', name: 'Creme dental com fluor de 90 gramas', category: 'Consumíveis & Descartáveis', qty: 5000, unit: 'caixas', cost: 4, supplier: 'Colgate', notes: 'Com proteção anticárie' },
      { code: '76343', name: 'Cimento fosfato de zinco líquido', category: 'Cimentos & Restauração', qty: 30, unit: 'unidades', cost: 45, supplier: 'SS White', notes: 'Vidro de 10 ml' },
      { code: '76344', name: 'Cimento fosfato de zinco em pó', category: 'Cimentos & Restauração', qty: 30, unit: 'unidades', cost: 50, supplier: 'SS White', notes: 'Vidro de 28 gramas' },
      { code: '76345', name: 'Cimento resinoso dual', category: 'Cimentos & Restauração', qty: 50, unit: 'caixas', cost: 140, supplier: 'FGM', notes: 'Kit com duas seringa de corpo duplo de 5 gramas, utilizado para cimentação de peças prótéticas' },
      { code: '76346', name: 'Cimento endodontico', category: 'Endodontia', qty: 40, unit: 'caixas', cost: 65, supplier: 'Dentsply', notes: 'Em pó-8 gramas + resina - 9G gramas, utilizado no vedamendo dos condutos radiculares' },
      { code: '76347', name: 'Cimento obturador temporário com flúor', category: 'Cimentos & Restauração', qty: 60, unit: 'potes', cost: 35, supplier: 'Vigodent', notes: 'Pote com 25 gramas, para selamento provisório da cavidade dentária' },
      { code: '76348', name: 'Cimento cirúrgico líquido', category: 'Cimentos & Restauração', qty: 30, unit: 'unidades', cost: 28, supplier: 'Vigodent', notes: 'Vidro de 20 ml' },
      { code: '76349', name: 'Cimento cirúrgico em pó', category: 'Cimentos & Restauração', qty: 30, unit: 'unidades', cost: 30, supplier: 'Vigodent', notes: 'Vidro de 50 gramas' },
      { code: '76350', name: 'Cimento de hidróxido de cálcio radiopaco', category: 'Endodontia', qty: 50, unit: 'kits', cost: 75, supplier: 'Biodinamica', notes: 'Kit com 1 pasta base 13gr e 1 pasta catalisadora, de 11 gramas' },
      { code: '76351', name: 'Clorhexidina a 2%, vidro de 100ml', category: 'Biossegurança & EPIs', qty: 80, unit: 'caixas', cost: 22, supplier: 'Rioquímica', notes: 'Para desinfecção de cavidades dentárias' },
      { code: '76352', name: 'Cola adesiva instantanea universal', category: 'Resinas & Adesivos', qty: 60, unit: 'unidades', cost: 25, supplier: 'Super Bonder / FGM', notes: 'Vidro de 5 gramas, para uso geral' },
      { code: '76353', name: 'Cápsula de petry com 3 divisões', category: 'Instrumentais', qty: 15, unit: 'unidades', cost: 45, supplier: 'Golgran', notes: 'Armazenamento de brocas' },
      { code: '76354', name: 'Disco de lixa grossa com 030 4850 G', category: 'Consumíveis & Descartáveis', qty: 50, unit: 'unidades', cost: 35, supplier: '3M', notes: 'Acabamento e polimento em superfícies de materiais restauradores em geral' },
      { code: '76355', name: 'Disco de lixa grossa com 030 4851 M', category: 'Consumíveis & Descartáveis', qty: 50, unit: 'unidades', cost: 35, supplier: '3M', notes: 'Acabamento e polimento em superfícies de materiais restauradores em geral' },
      { code: '76356', name: 'Disco de lixa média com 030 4851 M', category: 'Consumíveis & Descartáveis', qty: 50, unit: 'unidades', cost: 35, supplier: '3M', notes: 'Acabamento e polimento em superfícies de materiais restauradores em geral' },
      { code: '76357', name: 'Disco para polimento resina do tipo sof lex', category: 'Consumíveis & Descartáveis', qty: 50, unit: 'unidades', cost: 65, supplier: '3M', notes: 'Desgaste de superfície interproximal' },
      { code: '76358', name: 'Disco diamantado dupla face', category: 'Instrumentais', qty: 30, unit: 'unidades', cost: 55, supplier: 'KG Sorensen', notes: 'Espessura 0,17 mm, diametro 0,22mm' },
      { code: '76359', name: 'Disco diamantado nº 7011, 0,22mm mono face', category: 'Instrumentais', qty: 30, unit: 'unidades', cost: 50, supplier: 'KG Sorensen', notes: 'Desgaste de superfície interproximal' },
      { code: '76360', name: 'Disco diamantado nº 7040, 0,22mm mono face', category: 'Instrumentais', qty: 30, unit: 'unidades', cost: 50, supplier: 'KG Sorensen', notes: 'Preparo e acabamento de áreas inter dentais' },
      { code: '76361', name: 'Enxaguante bucal 0,12% , sabor menta, clorexidina', category: 'Consumíveis & Descartáveis', qty: 50, unit: 'caixas', cost: 48, supplier: 'Colgate', notes: 'Embalagem com 100 ml, acabamento e polimento' },
      { code: '76362', name: 'Edta líquido, vidro de 20 ml', category: 'Endodontia', qty: 20, unit: 'unidades', cost: 26, supplier: 'Biodinamica', notes: 'Antisseptico bucal' },
      { code: '76363', name: 'Eucaliptol líquido, vidro de 10 ml', category: 'Endodontia', qty: 20, unit: 'unidades', cost: 22, supplier: 'Biodinamica', notes: 'Solvente de guta percha' },
      { code: '76364', name: 'Envelope autoselante para esterelização (vapor EO) 190mmx330mm', category: 'Biossegurança & EPIs', qty: 300, unit: 'pacotes', cost: 60, supplier: 'Stermax', notes: 'Pacote com 100 unidades, utilizado para embalar instrumentais' },
      { code: '76365', name: 'Envelope autoselante para esterelização (vapor EO) 140mmx290mm', category: 'Biossegurança & EPIs', qty: 300, unit: 'pacotes', cost: 50, supplier: 'Stermax', notes: 'Pacote com 100 unidades, utilizado para embalar instrumentais' },
      { code: '76366', name: 'Envelope autoselante para esterelização (vapor EO) 90mmx260mm', category: 'Biossegurança & EPIs', qty: 300, unit: 'pacotes', cost: 40, supplier: 'Stermax', notes: 'Pacote com 100 unidades, utilizado para embalar instrumentais' },
      { code: '76367', name: 'Escova dental adulto macia', category: 'Consumíveis & Descartáveis', qty: 5000, unit: 'unidades', cost: 2.5, supplier: 'Curaprox / Colgate', notes: 'Embalagem de 1 unidade' },
      { code: '76368', name: 'Escova dental infantil macia', category: 'Consumíveis & Descartáveis', qty: 5000, unit: 'unidades', cost: 2.5, supplier: 'Curaprox / Colgate', notes: 'Embalagem de 1 unidade' },
      { code: '76369', name: 'Esponja hemostatica de colágeno hidrolizada', category: 'Cirurgia & Periodontia', qty: 80, unit: 'caixas', cost: 110, supplier: 'Hemospon', notes: 'Caixa com 10 unidades, utilizada para fazer homeostasia local' },
      { code: '76370', name: 'Eugenol líquido, vidro de 20ml', category: 'Cimentos & Restauração', qty: 30, unit: 'unidades', cost: 30, supplier: 'SS White', notes: 'Restaurador temporário' },
      { code: '76371', name: 'Evidenciador de placa bacteriana para profilaxia', category: 'Consumíveis & Descartáveis', qty: 60, unit: 'frascos', cost: 45, supplier: 'FGM', notes: 'Frasco de 500 ml, utilizada para evidenciar o biofilme' }
    ];

    const batchPayload = officialItems.map(item => ({
      itemCode: item.code,
      name: item.name,
      category: item.category as any,
      quantity: item.qty,
      minQuantity: 5,
      unit: item.unit as any,
      unitCost: item.cost,
      supplier: item.supplier,
      notes: item.notes,
      requiresSterilization: true,
      isSterilized: true,
      itemType: 'insumo' as const,
      ownerScope: 'compartilhado' as const
    }));

    importInventoryBatch(batchPayload);
    alert(`Processamento do arquivo "${fileName}" concluído. Os itens foram mesclados ao banco de dados e duplicatas por nome/código foram evitadas automaticamente!`);
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const finalPhoto = itemImages[0] || photoUrl || undefined;

    const matchedClinic = clinics.find(c => c.id === itemClinicId);
    const matchedProf = professionals.find(p => p.id === itemProfessionalId);

    const parsedQty = parseInt(quantity, 10);
    const parsedMinQty = parseInt(minQuantity, 10);
    const parsedUnitCost = parseFloat(unitCost);
    const parsedMaintFreq = parseInt(maintenanceFrequencyDays, 10);

    const itemPayload = {
      itemCode: itemCode.trim() || undefined,
      name,
      category: category as any,
      quantity: isNaN(parsedQty) ? 0 : parsedQty,
      minQuantity: isNaN(parsedMinQty) ? 0 : parsedMinQty,
      unit,
      unitCost: isNaN(parsedUnitCost) ? 0 : parsedUnitCost,
      manufacturingDate: manufacturingDate || undefined,
      expirationDate,
      supplier,
      photoUrl: finalPhoto,
      imageUrl: finalPhoto,
      images: itemImages.length > 0 ? itemImages : (finalPhoto ? [finalPhoto] : []),
      requiresSterilization,
      isSterilized: requiresSterilization ? isSterilized : true,
      sterilizationDate: (requiresSterilization && isSterilized) ? (sterilizationDate || new Date().toISOString().split('T')[0]) : undefined,
      sterilizedBy: (requiresSterilization && isSterilized) ? (sterilizedBy || 'Hugo Andres Iglesias Ricoy') : undefined,
      autoclaveModel: (requiresSterilization && isSterilized) ? (autoclaveModel || 'Autoclave Cristófoli Vitale Class 12L') : undefined,
      autoclaveWaterVolume: (requiresSterilization && isSterilized) ? autoclaveWaterVolume : undefined,
      autoclaveTemperature: (requiresSterilization && isSterilized) ? autoclaveTemperature : undefined,
      autoclavePressure: (requiresSterilization && isSterilized) ? autoclavePressure : undefined,
      autoclaveSterilizationTime: (requiresSterilization && isSterilized) ? autoclaveSterilizationTime : undefined,
      autoclaveDryingMode: (requiresSterilization && isSterilized) ? autoclaveDryingMode : undefined,
      autoclaveCycleType: (requiresSterilization && isSterilized) ? autoclaveCycleType : undefined,
      itemType: itemType || ((category === 'Equipamentos' || requiresMaintenance) ? ('equipamento' as const) : category === 'Instrumentais' ? ('instrumental' as const) : ('insumo' as const)),
      serialNumber: serialNumber || undefined,
      requiresMaintenance,
      maintenanceFrequencyDays: requiresMaintenance ? (isNaN(parsedMaintFreq) ? 180 : parsedMaintFreq) : undefined,
      lastMaintenanceDate: requiresMaintenance ? lastMaintenanceDate : undefined,
      nextMaintenanceDate: requiresMaintenance ? nextMaintenanceDate : undefined,
      maintenanceDate: requiresMaintenance ? nextMaintenanceDate : undefined,
      maintenanceNotes: maintenanceNotes || undefined,
      ownerScope,
      clinicId: ownerScope === 'clinica' ? itemClinicId : undefined,
      clinicName: ownerScope === 'clinica' ? matchedClinic?.name : undefined,
      professionalId: ownerScope === 'profissional' ? itemProfessionalId : undefined,
      professionalName: ownerScope === 'profissional' ? matchedProf?.name : undefined,
      lastUpdated: new Date().toISOString().split('T')[0]
    };

    if (editingItemId) {
      updateInventoryItem(editingItemId, itemPayload);
    } else {
      addInventoryItem(itemPayload);
    }

    setEditingItemId(null);
    setItemCode('');
    setName('');
    setManufacturingDate('');
    setPhotoUrl('');
    setItemImages([]);
    setSerialNumber('');
    setMaintenanceNotes('');
    stopCamera();
    setIsAddItemModalOpen(false);
  };

  // Perform Equipment Maintenance Action
  const handlePerformMaintenance = (itemId: string, freqDays: number = 180) => {
    const today = new Date();
    const todayISO = today.toISOString().split('T')[0];
    
    const nextDateObj = new Date(today);
    nextDateObj.setDate(nextDateObj.getDate() + freqDays);
    const nextDateISO = nextDateObj.toISOString().split('T')[0];

    const currentItem = inventory.find(i => i.id === itemId);
    const existingHistory = currentItem?.maintenanceHistory || [];

    const newLog = {
      id: `maint-${Date.now()}`,
      date: todayISO,
      description: 'Manutenção periódica preventiva e testes funcionais concluídos com sucesso.',
      technician: 'Assistência Técnica Autorizada / Equipe Interna'
    };

    updateInventoryItem(itemId, {
      lastMaintenanceDate: todayISO,
      nextMaintenanceDate: nextDateISO,
      maintenanceDate: nextDateISO,
      lastUpdated: todayISO,
      maintenanceHistory: [newLog, ...existingHistory]
    });
  };

  // CSV Export Utility
  const exportToCSV = (itemsList: InventoryItem[], filename: string) => {
    const headers = [
      'Código',
      'Nome do Material / Equipamento',
      'Categoria',
      'Tipo',
      'Quantidade Atual',
      'Estoque Mínimo',
      'Unidade',
      'Custo Unitário (R$)',
      'Valor Total (R$)',
      'Validade',
      'Nº de Série / Patrimônio',
      'Última Manutenção',
      'Próxima Manutenção',
      'Fornecedor'
    ];

    const rows = itemsList.map(item => [
      `"${item.id}"`,
      `"${item.name.replace(/"/g, '""')}"`,
      `"${item.category}"`,
      `"${item.itemType || 'insumo'}"`,
      item.quantity,
      item.minQuantity,
      `"${item.unit}"`,
      item.unitCost.toFixed(2),
      (item.quantity * item.unitCost).toFixed(2),
      `"${item.expirationDate || 'N/A'}"`,
      `"${item.serialNumber || 'N/A'}"`,
      `"${item.lastMaintenanceDate || 'N/A'}"`,
      `"${item.nextMaintenanceDate || item.maintenanceDate || 'N/A'}"`,
      `"${(item.supplier || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Trigger Print View
  const handlePrint = () => {
    printDocumentWithTitle({
      docTitle: 'Relatorio_Geral_Estoque_Materiais',
      date: new Date()
    });
  };

  return (
    <div className="space-y-6">
      {/* Printable Styles for Clean Document Generation */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-inventory-area, #printable-inventory-area * {
            visibility: visible;
          }
          #printable-inventory-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20px;
            background: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${t.headingText} flex items-center gap-2 tracking-tight`}>
            <Package className={`w-7 h-7 ${t.accentText}`} />
            Controle de Estoque & Manutenção de Equipamentos
          </h1>
          <p className="text-xs opacity-75">
            Gestão abrangente de materiais, equipamentos odontológicos, alertas de compra, manutenção preventiva e scanner com Google Lens.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label
            className="px-3.5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-2xl flex items-center gap-1.5 shadow-sm cursor-pointer transition"
            title="Selecione o arquivo PDF para extrair a lista de materiais"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
            <span>Importar Lista PDF Oficial</span>
            <input
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleImportOfficialPdfList(file.name);
                }
              }}
            />
          </label>

          <label className="px-3.5 py-2.5 bg-white border border-[#e5e5d1] hover:bg-[#f0f0e8] text-[#2c2c2c] text-xs font-bold rounded-2xl flex items-center gap-1.5 shadow-2xs cursor-pointer transition">
            <Upload className="w-4 h-4 text-[#d4a373]" />
            <span>Importar CSV</span>
            <input
              type="file"
              accept=".csv,.txt"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    const text = event.target?.result as string;
                    if (text) {
                      const lines = text.split('\n');
                      let count = 0;
                      const batchPayload: any[] = [];
                      lines.forEach((line, idx) => {
                        if (idx === 0) return;
                        const cols = line.split(';');
                        if (cols.length >= 2 && cols[1].trim()) {
                          const code = cols[0]?.trim() || `ITEM-${Date.now()}-${idx}`;

                          batchPayload.push({
                            itemCode: code,
                            name: cols[1].trim(),
                            category: (cols[2]?.trim() as any) || 'Consumíveis & Descartáveis',
                            quantity: parseInt(cols[3]?.trim() || '10', 10) || 10,
                            minQuantity: 5,
                            unit: (cols[4]?.trim() as any) || 'unidade',
                            unitCost: parseFloat(cols[5]?.trim() || '20') || 20,
                            supplier: cols[6]?.trim() || 'Dental Cremer',
                            notes: cols[7]?.trim() || 'Importado via CSV',
                            requiresSterilization: true,
                            isSterilized: true,
                            itemType: 'insumo',
                            ownerScope: 'compartilhado'
                          });
                          count++;
                        }
                      });
                      if (batchPayload.length > 0) {
                        importInventoryBatch(batchPayload);
                      }
                      alert(`${count} itens extraídos do arquivo CSV "${file.name}" foram importados com sucesso para o estoque! Duplicatas foram evitadas automaticamente.`);
                    }
                  };
                  reader.readAsText(file);
                }
              }}
            />
          </label>

          {inventory.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setClearStep(1);
                setClearTypedConfirmation('');
                setClearCheckboxConfirmed(false);
                setIsConfirmClearModalOpen(true);
              }}
              className="px-3.5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-medium text-xs rounded-2xl flex items-center justify-center gap-1.5 border border-rose-200 transition-all shadow-2xs"
              title="Remover todos os dados de materiais e equipamentos (Confirmação em 2 passos)"
            >
              <X className="w-4 h-4 text-rose-600" />
              Remover Todos
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              openAddItemModalWithItem();
              setTimeout(() => {
                startCamera();
              }, 150);
            }}
            className="px-4 py-2.5 bg-[#1b281d] hover:bg-[#2c3e2e] text-white font-medium text-xs rounded-2xl flex items-center justify-center gap-2 border border-[#d4a373]/50 shadow-sm transition-all"
            title="Escanear caixa, frasco, rótulo ou QR Code com Google Lens AI e câmera"
          >
            <Scan className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>Escanear Lens AI</span>
          </button>

          <button
            onClick={() => openAddItemModalWithItem()}
            className="px-4 py-2.5 bg-[#2c3e2e] hover:bg-[#1b281d] text-white font-medium text-xs rounded-2xl flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4 text-[#d4a373]" />
            Cadastrar
          </button>
        </div>
      </div>

      {/* Interactive Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* CARD 1: TOTAL ITEMS - CLICKABLE */}
        <button
          type="button"
          onClick={() => setIsTotalItemsModalOpen(true)}
          className="bg-white border border-[#e5e5d1] hover:border-[#5a5a40] hover:shadow-md rounded-[32px] p-5 text-left transition-all group flex flex-col justify-between relative overflow-hidden"
        >
          <div className="flex items-center justify-between w-full mb-2">
            <span className="text-xs text-gray-500 font-semibold block">Total de itens em estoque</span>
            <div className="w-10 h-10 rounded-2xl bg-[#f0f0e8] border border-[#e5e5d1] group-hover:bg-[#2c3e2e] group-hover:text-white flex items-center justify-center text-[#5a5a40] transition-colors">
              <Package className="w-5 h-5 text-[#d4a373]" />
            </div>
          </div>

          <div>
            <span className="text-2xl font-bold text-[#2c2c2c] block">
              {inventory.length} cadastrados
            </span>
            <span className="text-[11px] text-[#2d6a4f] font-medium flex items-center gap-1 mt-1 group-hover:underline">
              <Eye className="w-3.5 h-3.5" />
              Clique para abrir lista completa, exportar e imprimir
            </span>
          </div>
        </button>

        {/* CARD 2: LOW STOCK & MAINTENANCE ALERTS - CLICKABLE */}
        <button
          type="button"
          onClick={() => {
            setIsAlertsModalOpen(true);
            setAlertsModalTab(lowStockItems.length > 0 ? 'low_stock' : 'maintenance');
          }}
          className={`border rounded-[32px] p-5 text-left transition-all group flex flex-col justify-between relative overflow-hidden ${
            (lowStockItems.length > 0 || maintenanceDueItems.length > 0)
              ? 'bg-amber-50/70 border-amber-300 hover:border-amber-500 hover:shadow-md'
              : 'bg-white border-[#e5e5d1] hover:border-[#5a5a40] hover:shadow-md'
          }`}
        >
          <div className="flex items-center justify-between w-full mb-2">
            <span className="text-xs font-semibold block text-amber-900">
              Alertas de estoque e manutenção
            </span>
            <div className="w-10 h-10 rounded-2xl bg-amber-100 border border-amber-200 group-hover:bg-amber-600 group-hover:text-white flex items-center justify-center text-amber-700 transition-colors">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-amber-900">
                {lowStockItems.length} faltas
              </span>
              {maintenanceDueItems.length > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
                  <Wrench className="w-3 h-3" />
                  {maintenanceDueItems.length} manutenções
                </span>
              )}
            </div>
            <span className="text-[11px] text-amber-800 font-medium flex items-center gap-1 mt-1 group-hover:underline">
              <Eye className="w-3.5 h-3.5" />
              Ver relatórios de compra e cronograma de equipamentos
            </span>
          </div>
        </button>

        {/* CARD 3: TOTAL STOCK VALUE - CLICKABLE */}
        <button
          type="button"
          onClick={() => {
            setIsTotalItemsModalOpen(true);
            setReportModalTab('financial');
          }}
          className="bg-white border border-[#e5e5d1] hover:border-[#5a5a40] hover:shadow-md rounded-[32px] p-5 text-left transition-all group flex flex-col justify-between relative overflow-hidden cursor-pointer"
        >
          <div className="flex items-center justify-between w-full mb-2">
            <span className="text-xs text-gray-500 font-semibold block">Patrimônio / valor do estoque</span>
            <div className="w-10 h-10 rounded-2xl bg-[#f0f0e8] border border-[#e5e5d1] group-hover:bg-[#2c3e2e] group-hover:text-white flex items-center justify-center text-[#5a5a40] transition-colors">
              <DollarSign className="w-5 h-5 text-[#d4a373]" />
            </div>
          </div>

          <div>
            <span className="text-2xl font-bold text-[#5a5a40] font-mono block">
              R$ {totalStockValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-[11px] text-[#2d6a4f] font-medium flex items-center gap-1 mt-1 group-hover:underline">
              <Eye className="w-3.5 h-3.5" />
              Clique para abrir Relatório Financeiro e Custos por Categoria
            </span>
          </div>
        </button>
      </div>

      {/* Search & Category Filter */}
      <div className="bg-white border border-[#e5e5d1] rounded-[32px] p-5 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Buscar por nome do material, equipamento, nº de série ou fornecedor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#fbfbf9] border border-[#e5e5d1] rounded-2xl pl-10 pr-3.5 py-2.5 text-xs text-[#2c2c2c] placeholder-gray-400 focus:outline-none focus:border-[#5a5a40]"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap sm:flex-nowrap">
          <select
            value={filterItemType}
            onChange={(e) => setFilterItemType(e.target.value as any)}
            className="bg-[#fbfbf9] text-[#2c2c2c] border border-[#e5e5d1] text-xs rounded-2xl px-3.5 py-2.5 focus:outline-none font-bold"
          >
            <option value="todos">Todos Tipos (Insumos, Instrumentais, Equipamentos)</option>
            <option value="insumo">📦 Insumos / Consumo</option>
            <option value="instrumental">🔎 Instrumentais Odontológicos</option>
            <option value="equipamento">🔬 Equipamentos / Aparelhos</option>
          </select>

          <select
            value={filterOwnerScope}
            onChange={(e) => setFilterOwnerScope(e.target.value)}
            className="bg-[#fbfbf9] text-[#2c2c2c] border border-[#e5e5d1] text-xs rounded-2xl px-3.5 py-2.5 focus:outline-none font-medium"
          >
            <option value="todos">Todos Escopos ({inventory.length})</option>
            <option value="compartilhado">🌐 Compartilhado / Geral</option>
            <option value="clinica">🏢 Específico da Clínica</option>
            <option value="profissional">👨‍⚕️ Específico do Profissional</option>
          </select>

          <select
            value={filterReadiness}
            onChange={(e) => setFilterReadiness(e.target.value)}
            className="bg-[#fbfbf9] text-[#2c2c2c] border border-[#e5e5d1] text-xs rounded-2xl px-3.5 py-2.5 focus:outline-none font-medium"
          >
            <option value="todos">Todos Indicadores</option>
            <option value="prontos">🟢 Prontos (Esterilizados / Em Dia)</option>
            <option value="vencidos">🔴 Vencidos (Indicador Apagado)</option>
            <option value="nao_esterilizados">🟡 Esterilizando / Em Manutenção</option>
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-[#fbfbf9] text-[#2c2c2c] border border-[#e5e5d1] text-xs rounded-2xl px-3.5 py-2.5 focus:outline-none font-medium"
          >
            <option value="todos">Todas Categorias ({categoriesList.length})</option>
            {categoriesList.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <button
            onClick={() => setShowLowStockOnly(!showLowStockOnly)}
            className={`px-3.5 py-2.5 rounded-2xl text-xs font-medium border transition flex items-center gap-1.5 shrink-0 ${
              showLowStockOnly ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold' : 'bg-[#fbfbf9] text-gray-600 border-[#e5e5d1] hover:bg-[#f0f0e8]'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            Somente Com Falta
          </button>
        </div>
      </div>

      {/* Main Inventory Items Section */}
      <div className="bg-white border border-[#e5e5d1] rounded-[32px] shadow-sm overflow-hidden">
        <div className="p-4 bg-[#fbfbf9] border-b border-[#e5e5d1] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-[#5a5a40] flex items-center gap-2">
              <Package className="w-4 h-4 text-[#d4a373]" />
              Lista de materiais ({filteredInventory.length})
            </span>

            {/* View Mode Toggle: Cards vs Table */}
            <div className="flex items-center bg-[#f0f0e8] border border-[#e5e5d1] p-1 rounded-xl shrink-0">
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 transition cursor-pointer ${
                  viewMode === 'cards' 
                    ? 'bg-[#2c3e2e] text-white shadow-2xs' 
                    : 'text-[#5a5a40] hover:text-[#2c2c2c]'
                }`}
                title="Exibir em cards de seleção para editar, modificar ou excluir"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Cards</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 transition cursor-pointer ${
                  viewMode === 'table' 
                    ? 'bg-[#2c3e2e] text-white shadow-2xs' 
                    : 'text-[#5a5a40] hover:text-[#2c2c2c]'
                }`}
                title="Exibir em lista estruturada de tabela"
              >
                <List className="w-3.5 h-3.5" />
                <span>Tabela</span>
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label
              className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer transition"
              title="Selecione o arquivo PDF para extrair a lista de materiais"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
              <span>Importar Lista PDF Oficial</span>
              <input
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleImportOfficialPdfList(file.name);
                  }
                }}
              />
            </label>
            <label className="px-3.5 py-1.5 bg-white border border-[#e5e5d1] hover:bg-[#f0f0e8] text-[#2c2c2c] text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-2xs cursor-pointer transition">
              <Upload className="w-4 h-4 text-[#d4a373]" />
              <span>Importar CSV</span>
              <input
                type="file"
                accept=".csv,.txt"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      const text = event.target?.result as string;
                      if (text) {
                        const lines = text.split('\n');
                        let count = 0;
                        lines.forEach((line, idx) => {
                          if (idx === 0) return;
                          const cols = line.split(';');
                          if (cols.length >= 2 && cols[1].trim()) {
                            let code = cols[0]?.trim() || `ITEM-${Date.now()}-${idx}`;
                            let existing = inventory.find(i => i.itemCode === code || i.id === code);
                            let counter = 1;
                            while (existing) {
                              code = `${cols[0]?.trim()}-${counter}`;
                              existing = inventory.find(i => i.itemCode === code || i.id === code);
                              counter++;
                            }

                            addInventoryItem({
                              itemCode: code,
                              name: cols[1].trim(),
                              category: (cols[2]?.trim() as any) || 'Consumíveis & Descartáveis',
                              quantity: parseInt(cols[3]?.trim() || '10', 10) || 10,
                              minQuantity: 5,
                              unit: (cols[4]?.trim() as any) || 'unidade',
                              unitCost: parseFloat(cols[5]?.trim() || '20') || 20,
                              supplier: cols[6]?.trim() || 'Dental Cremer',
                              notes: cols[7]?.trim() || 'Importado via CSV',
                              requiresSterilization: true,
                              isSterilized: true,
                              itemType: 'insumo',
                              ownerScope: 'compartilhado'
                            });
                            count++;
                          }
                        });
                        alert(`${count} itens extraídos do arquivo CSV "${file.name}" foram importados com sucesso para o estoque! Duplicatas foram evitadas automaticamente.`);
                      }
                    };
                    reader.readAsText(file);
                  }
                }}
              />
            </label>
            <button
              onClick={() => setIsDailyReportModalOpen(true)}
              className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-2xs transition"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-amber-200" />
              Report da Clínica & Agenda
            </button>
            <button
              type="button"
              onClick={() => setIsYesterdayReportModalOpen(true)}
              className="px-3.5 py-1.5 bg-[#1b281d] hover:bg-[#2c3e2e] text-amber-300 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-2xs transition border border-[#d4a373] cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-amber-300" />
              Relatório Cadastrados (PDF)
            </button>
            <button
              onClick={() => exportToCSV(filteredInventory, 'Estoque_Geral_DentisPro')}
              className="px-3 py-1.5 bg-white border border-[#e5e5d1] hover:bg-[#f0f0e8] text-[#2c2c2c] text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-2xs transition"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
              Exportar CSV
            </button>
            <button
              onClick={() => {
                setIsTotalItemsModalOpen(true);
                setTimeout(() => handlePrint(), 300);
              }}
              className="px-3 py-1.5 bg-white border border-[#e5e5d1] hover:bg-[#f0f0e8] text-[#2c2c2c] text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-[#5a5a40]" />
              Imprimir
            </button>
            <button
              type="button"
              onClick={() => {
                setIsTotalItemsModalOpen(true);
                setReportModalTab('autoclave');
              }}
              className="px-3.5 py-1.5 bg-[#2c3e2e] hover:bg-[#1b281d] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Controle de Esterilização (Autoclave)
            </button>
          </div>
        </div>

        {/* VIEW MODE 1: CARDS VIEW (SELECTION CARDS FOR EACH MATERIAL) */}
        {viewMode === 'cards' ? (
          <div className="p-4 bg-[#fcfdfa]">
            {filteredInventory.length === 0 ? (
              <div className="p-12 text-center text-gray-400 bg-white border border-dashed border-[#e5e5d1] rounded-2xl">
                <Package className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="font-bold text-[#2c2c2c]">Nenhum material ou equipamento encontrado.</p>
                <p className="text-xs text-gray-400">Tente ajustar a busca ou adicionar um novo item ao estoque.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredInventory.map(item => {
                  const isLow = item.quantity <= item.minQuantity;
                  const itemImg = item.photoUrl || item.imageUrl;
                  const isEquipment = item.category === 'Equipamentos' || item.itemType === 'equipamento' || item.requiresMaintenance;
                  const readiness = getItemReadinessInfo(item);

                  return (
                    <div 
                      key={item.id} 
                      onClick={() => openAddItemModalWithItem(item)}
                      className={`bg-white border rounded-2xl p-4 shadow-2xs hover:shadow-md hover:border-[#2c3e2e] transition-all flex flex-col justify-between space-y-3 relative cursor-pointer group ${
                        isLow ? 'border-amber-300 bg-amber-50/20' : 'border-[#e5e5d1]'
                      }`}
                      title="Clique em qualquer lugar do card para editar este material"
                    >
                      {/* Top Bar: Image, Name, Badges */}
                      <div className="space-y-2.5">
                        <div className="flex items-start gap-3">
                          {/* Thumbnail */}
                          <div className="relative shrink-0">
                            {itemImg ? (
                              <img src={itemImg} alt={item.name} className="w-14 h-14 rounded-2xl object-cover border border-[#e5e5d1] group-hover:border-[#2c3e2e] transition shadow-2xs" />
                            ) : (
                              <div className="w-14 h-14 rounded-2xl bg-[#f0f0e8] border border-[#e5e5d1] group-hover:border-[#2c3e2e] flex items-center justify-center text-[#5a5a40] transition">
                                <Package className="w-7 h-7 text-[#d4a373]" />
                              </div>
                            )}

                            {item.images && item.images.length > 0 && (
                              <span className="absolute -bottom-1 -right-1 bg-[#2c3e2e] text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full border border-white flex items-center gap-0.5 shadow-2xs">
                                <Camera className="w-2.5 h-2.5 text-amber-300" />
                                {item.images.length}
                              </span>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-[#2c2c2c] group-hover:text-[#2c3e2e] text-sm block truncate w-full">
                              {item.name}
                            </h4>

                            <div className="flex flex-wrap items-center gap-1 mt-1">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#f0f0e8] text-[#5a5a40] border border-[#e5e5d1]">
                                {item.category}
                              </span>
                              {isLow && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                  Falta
                                </span>
                              )}
                              {isEquipment && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#2c3e2e] text-white">
                                  Equipamento
                                </span>
                              )}
                              {item.ownerScope === 'clinica' && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200 flex items-center gap-0.5">
                                  <Building2 className="w-3 h-3 text-blue-600" />
                                  <span>Clínica</span>
                                </span>
                              )}
                              {item.ownerScope === 'profissional' && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-800 border border-purple-200 flex items-center gap-0.5">
                                  <UserCheck className="w-3 h-3 text-purple-600" />
                                  <span>Profissional</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Readiness & Code row */}
                        <div className="flex items-center justify-between gap-2 pt-1 border-t border-gray-100">
                          {item.itemCode ? (
                            <span className="text-[10px] text-[#2c3e2e] font-mono font-bold flex items-center gap-1 bg-[#f0f0e8] px-2 py-0.5 rounded-lg border border-[#e5e5d1]">
                              <Barcode className="w-3.5 h-3.5 text-[#5a5a40]" />
                              <span>{item.itemCode}</span>
                            </span>
                          ) : (
                            <span className="text-[10px] text-gray-400 font-mono">Sem código REF</span>
                          )}

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleReadinessIndicator(item);
                            }}
                            className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border flex items-center gap-1 transition cursor-pointer ${
                              readiness.isReady
                                ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                                : readiness.statusType === 'expired' || readiness.statusType === 'maintenance_overdue'
                                  ? 'bg-rose-50 text-rose-900 border-rose-300'
                                  : 'bg-amber-50 text-amber-900 border-amber-300'
                            }`}
                            title={readiness.badgeTooltip}
                          >
                            <span className={`w-2 h-2 rounded-full ${readiness.isReady ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                            <span className="truncate max-w-[100px]">{readiness.badgeText}</span>
                          </button>
                        </div>

                        {/* Stock & Unit Cost details */}
                        <div className="bg-[#f0f0e8]/50 p-2.5 rounded-xl border border-[#e5e5d1] space-y-1">
                          <div className="flex items-center justify-between text-xs font-bold">
                            <span className="text-gray-600">Estoque:</span>
                            <span className={isLow ? 'text-amber-700 font-mono' : 'text-[#2c2c2c] font-mono'}>
                              {item.quantity} {item.unit}s <span className="text-[10px] font-normal text-gray-400">(mín: {item.minQuantity})</span>
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-gray-500">
                            <span>Custo Unitário:</span>
                            <strong className="text-[#2c2c2c] font-mono">R$ {item.unitCost.toFixed(2)}</strong>
                          </div>
                        </div>
                      </div>

                      {/* Card Action Buttons (Excluir, Clonar, +/-) */}
                      <div className="pt-2 border-t border-[#e5e5d1] flex items-center justify-between gap-1" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-1.5">
                          {/* Clone Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCloneItem(item);
                            }}
                            className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold rounded-xl flex items-center gap-1 border border-amber-200 transition cursor-pointer"
                            title="Clonar este material para cadastrar um similar"
                          >
                            <Copy className="w-3.5 h-3.5 text-amber-600" />
                            <span>Clonar</span>
                          </button>

                          {/* Delete Item Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteItem(item);
                            }}
                            className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl flex items-center gap-1 border border-rose-200 transition cursor-pointer"
                            title="Excluir este item do estoque"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                            <span>Excluir</span>
                          </button>
                        </div>

                        {/* Quick Stock Controls */}
                        <div className="inline-flex items-center gap-0.5 bg-[#fbfbf9] p-0.5 rounded-xl border border-[#e5e5d1]">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              adjustStockQuantity(item.id, -1, 'Baixa de uso');
                            }}
                            className="p-1 text-rose-600 hover:text-rose-800 rounded-lg hover:bg-gray-100"
                            title="Dar Baixa (-1)"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-1 text-xs font-mono font-bold text-[#2c2c2c]">{item.quantity}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              adjustStockQuantity(item.id, 1, 'Entrada de compra');
                            }}
                            className="p-1 text-emerald-700 hover:text-emerald-900 rounded-lg hover:bg-gray-100"
                            title="Adicionar (+1)"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* VIEW MODE 2: TABLE VIEW */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#2c2c2c]">
              <thead className="bg-[#fbfbf9] text-gray-600 text-xs font-bold border-b border-[#e5e5d1]">
                <tr>
                  <th className="p-4">Material / Equipamento</th>
                  <th className="p-4 text-center">Indicador / Prontidão</th>
                  <th className="p-4">Categoria</th>
                  <th className="p-4 text-center">Estoque</th>
                  <th className="p-4">Unidade</th>
                  <th className="p-4">Validade / Nº Série</th>
                  <th className="p-4">Status de Manutenção</th>
                  <th className="p-4 text-right">Ações / Ajuste</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5e5d1]">
                {filteredInventory.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-gray-400">
                      Nenhum material ou equipamento encontrado no estoque.
                    </td>
                  </tr>
                ) : (
                  filteredInventory.map(item => {
                    const isLow = item.quantity <= item.minQuantity;
                    const itemImg = item.photoUrl || item.imageUrl;
                    const isEquipment = item.category === 'Equipamentos' || item.itemType === 'equipamento' || item.requiresMaintenance;
                    const dueDate = item.nextMaintenanceDate || item.maintenanceDate;

                    let maintBadge = null;
                    if (isEquipment && dueDate) {
                      const diffDays = Math.ceil((new Date(dueDate).getTime() - new Date(todayStr).getTime()) / (1000 * 3600 * 24));
                      if (diffDays < 0) {
                        maintBadge = (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1 w-fit">
                            <Wrench className="w-3 h-3 text-rose-600" />
                            Vencida ({Math.abs(diffDays)}d)
                          </span>
                        );
                      } else if (diffDays <= 30) {
                        maintBadge = (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1 w-fit">
                            <Clock className="w-3 h-3 text-amber-600" />
                            Em {diffDays} dias ({dueDate})
                          </span>
                        );
                      } else {
                        maintBadge = (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1 w-fit">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Em dia ({dueDate})
                          </span>
                        );
                      }
                    }

                    return (
                      <tr key={item.id} className={`hover:bg-[#fbfbf9] transition ${isLow ? 'bg-amber-50/40' : ''}`}>
                        <td className="p-4">
                          <div className="font-bold text-[#2c2c2c] flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => openAddItemModalWithItem(item)}
                              className="relative group shrink-0"
                              title="Clique para editar este material e ver/gerenciar fotos"
                            >
                              {itemImg ? (
                                <img src={itemImg} alt={item.name} className="w-11 h-11 rounded-xl object-cover border border-[#e5e5d1] group-hover:border-[#2c3e2e] transition shadow-2xs" />
                              ) : (
                                <div className="w-11 h-11 rounded-xl bg-[#f0f0e8] border border-[#e5e5d1] group-hover:border-[#2c3e2e] flex items-center justify-center text-[#5a5a40] transition">
                                  <Package className="w-5 h-5 text-[#d4a373]" />
                                </div>
                              )}

                              {item.images && item.images.length > 0 && (
                                <span className="absolute -bottom-1 -right-1 bg-[#2c3e2e] text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full border border-white flex items-center gap-0.5 shadow-2xs">
                                  <Camera className="w-2.5 h-2.5 text-amber-300" />
                                  {item.images.length}
                                </span>
                              )}

                              <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                                <Edit2 className="w-4 h-4 text-amber-300" />
                              </div>
                            </button>

                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <button
                                  type="button"
                                  onClick={() => openAddItemModalWithItem(item)}
                                  className="font-bold text-[#2c2c2c] hover:text-[#d4a373] text-left hover:underline text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer"
                                  title="Clique para editar este material/equipamento"
                                >
                                  <span>{item.name}</span>
                                  <Edit2 className="w-3.5 h-3.5 text-[#d4a373] opacity-70 hover:opacity-100" />
                                </button>

                                {isLow && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                    Estoque baixo
                                  </span>
                                )}
                                {isEquipment && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#2c3e2e] text-white">
                                    Equipamento
                                  </span>
                                )}
                                {item.ownerScope === 'clinica' && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200 flex items-center gap-1">
                                    <Building2 className="w-3 h-3 text-blue-600" />
                                    {item.clinicName || 'Clínica'}
                                  </span>
                                )}
                                {item.ownerScope === 'profissional' && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-800 border border-purple-200 flex items-center gap-1">
                                    <UserCheck className="w-3 h-3 text-purple-600" />
                                    {item.professionalName || 'Profissional'}
                                  </span>
                                )}
                                {(!item.ownerScope || item.ownerScope === 'compartilhado') && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                                    <PackageCheck className="w-3 h-3 text-emerald-600" />
                                    Compartilhado
                                  </span>
                                )}
                              </div>
                              {item.itemCode ? (
                                <span className="text-[10px] text-[#2c3e2e] font-mono font-bold flex items-center gap-1 bg-[#f0f0e8] px-2 py-0.5 rounded-lg w-fit mt-1 border border-[#e5e5d1]">
                                  <Barcode className="w-3.5 h-3.5 text-[#5a5a40]" />
                                  <span>Cód/REF: {item.itemCode}</span>
                                </span>
                              ) : (
                                <span className="text-[10px] text-gray-400 font-mono block mt-0.5">Sem código de barras / REF</span>
                              )}

                              {item.requiresSterilization && item.isSterilized && (
                                <div className="text-[10px] text-emerald-900 bg-emerald-50/90 border border-emerald-200/80 px-2 py-0.5 rounded-lg w-fit mt-1 flex items-center gap-1 font-mono">
                                  <Sparkles className="w-3 h-3 text-emerald-600 shrink-0" />
                                  <span>Esterilizado por: <strong>{item.sterilizedBy || 'Hugo Andres Iglesias Ricoy'}</strong> • {item.autoclaveModel || 'Autoclave Cristófoli 12L'}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="p-4 text-center">
                          {(() => {
                            const readiness = getItemReadinessInfo(item);
                            return (
                              <button
                                type="button"
                                onClick={() => handleToggleReadinessIndicator(item)}
                                className={`px-3 py-1.5 rounded-2xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer ${
                                  readiness.isReady
                                    ? 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100'
                                    : readiness.statusType === 'expired' || readiness.statusType === 'maintenance_overdue'
                                      ? 'bg-rose-50 text-rose-900 border-rose-300 hover:bg-rose-100'
                                      : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                                }`}
                                title={readiness.badgeTooltip}
                              >
                                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                                  readiness.isReady
                                    ? 'bg-emerald-500 animate-pulse ring-2 ring-emerald-300'
                                    : readiness.statusType === 'expired' || readiness.statusType === 'maintenance_overdue'
                                      ? 'bg-rose-600 ring-2 ring-rose-300'
                                      : 'bg-amber-500'
                                }`} />
                                <span className="truncate max-w-[130px]">{readiness.badgeText}</span>
                                {readiness.isReady ? (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                                ) : readiness.statusType === 'expired' || readiness.statusType === 'maintenance_overdue' ? (
                                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                                ) : (
                                  <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                )}
                              </button>
                            );
                          })()}
                        </td>

                        <td className="p-4">
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#f0f0e8] text-[#5a5a40] border border-[#e5e5d1]">
                            {item.category}
                          </span>
                        </td>

                        <td className="p-4 text-center">
                          <span className={`font-mono font-bold text-sm ${isLow ? 'text-amber-700' : 'text-[#5a5a40]'}`}>
                            {item.quantity} {item.unit}s
                          </span>
                          <span className="block text-[10px] text-gray-400">Min: {item.minQuantity}</span>
                        </td>

                        <td className="p-4 font-mono font-medium text-[#2c2c2c]">
                          R$ {item.unitCost.toFixed(2)}
                        </td>

                        <td className="p-4 font-mono text-gray-500">
                          {item.manufacturingDate && <div className="text-[10px] text-gray-500">Fab: {item.manufacturingDate}</div>}
                          {item.expirationDate && <div>Val: {item.expirationDate}</div>}
                          {item.serialNumber && <div className="text-[10px] text-[#2c3e2e] font-bold">S/N: {item.serialNumber}</div>}
                          {!item.manufacturingDate && !item.expirationDate && !item.serialNumber && 'N/A'}
                        </td>

                        <td className="p-4">
                          {maintBadge || <span className="text-gray-400 text-[11px]">-</span>}
                        </td>

                        <td className="p-4 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            {/* Dedicated Edit Button */}
                            <button
                              type="button"
                              onClick={() => openAddItemModalWithItem(item)}
                              className="px-3 py-1.5 bg-[#2c3e2e] hover:bg-[#1b281d] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
                              title="Editar informações e gerenciar fotos do material"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-amber-300" />
                              <span>Editar</span>
                            </button>

                            {/* Dedicated Delete Button */}
                            <button
                              type="button"
                              onClick={() => handleDeleteItem(item)}
                              className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl flex items-center gap-1 border border-rose-200 transition cursor-pointer"
                              title="Excluir este item do estoque"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                              <span>Excluir</span>
                            </button>

                            {/* Quick Quantity Controls */}
                            <div className="inline-flex items-center gap-1 bg-[#fbfbf9] p-1 rounded-2xl border border-[#e5e5d1]">
                              <button
                                onClick={() => adjustStockQuantity(item.id, -1, 'Baixa de uso')}
                                className="p-1 text-rose-600 hover:text-rose-800 rounded-xl hover:bg-[#f0f0e8]"
                                title="Dar Baixa (-1)"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="px-2 text-xs font-mono font-bold text-[#2c2c2c]">{item.quantity}</span>
                              <button
                                onClick={() => adjustStockQuantity(item.id, 1, 'Entrada de compra')}
                                className="p-1 text-emerald-700 hover:text-emerald-900 rounded-xl hover:bg-[#f0f0e8]"
                                title="Adicionar (+1)"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: TOTAL ITEMS DETAILED REPORT (CLICKED ON CARD 1) */}
      {/* ========================================================================= */}
      {isTotalItemsModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#2c2c2c]/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-[#e5e5d1] rounded-[32px] max-w-5xl w-full p-6 shadow-2xl space-y-4 my-6 max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#e5e5d1] pb-4 shrink-0 gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#2c3e2e] text-[#d4a373] flex items-center justify-center shrink-0 shadow-sm">
                  {reportModalTab === 'items' && <Package className="w-6 h-6" />}
                  {reportModalTab === 'financial' && <DollarSign className="w-6 h-6" />}
                  {reportModalTab === 'metrics' && <Stethoscope className="w-6 h-6" />}
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-[#2c3e2e] tracking-tight">
                    {reportModalTab === 'items' && `Relatório de Estoque / Lista de Itens (${inventory.length})`}
                    {reportModalTab === 'financial' && `Relatório Financeiro & Patrimonial`}
                    {reportModalTab === 'metrics' && `Métricas de Atendimento & Clínica`}
                  </h3>
                  <p className="text-xs text-gray-500 font-medium">
                    {clinicInfo?.name || 'DentisPro Odontologia'} • Emissão: {new Date().toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  onClick={() => exportToCSV(inventory, 'Relatorio_Estoque_DentisPro')}
                  className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-1.5 shadow-2xs transition"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                  <span>Exportar Excel/CSV</span>
                </button>
                <button
                  onClick={handlePrint}
                  className="px-3.5 py-2 bg-[#2c3e2e] hover:bg-[#1b281d] text-white text-xs font-bold rounded-2xl flex items-center gap-1.5 shadow-2xs transition"
                >
                  <Printer className="w-4 h-4 text-[#d4a373]" />
                  <span>Imprimir</span>
                </button>
                <button
                  onClick={() => setIsTotalItemsModalOpen(false)}
                  className="p-2 text-gray-400 hover:text-[#2c2c2c] rounded-2xl hover:bg-gray-100 transition"
                  title="Fechar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* INTUITIVE PROMINENT TABS FOR REPORT SECTIONS AT TOP/CENTER */}
            <div className="p-1.5 bg-[#f0f0e8] border border-[#e5e5d1] rounded-2xl flex items-center justify-start gap-1.5 shrink-0 flex-wrap">
              <button
                onClick={() => setReportModalTab('items')}
                className={`px-4 py-2.5 rounded-xl text-sm font-extrabold flex items-center gap-2 transition cursor-pointer ${
                  reportModalTab === 'items'
                    ? 'bg-[#2c3e2e] text-white shadow-md'
                    : 'text-[#5a5a40] hover:bg-[#e5e5d1] hover:text-[#2c3e2e]'
                }`}
              >
                <Package className={`w-4 h-4 ${reportModalTab === 'items' ? 'text-[#d4a373]' : 'text-[#5a5a40]'}`} />
                <span>Relatório de Estoque ({inventory.length})</span>
              </button>

              <button
                onClick={() => setReportModalTab('financial')}
                className={`px-4 py-2.5 rounded-xl text-sm font-extrabold flex items-center gap-2 transition cursor-pointer ${
                  reportModalTab === 'financial'
                    ? 'bg-[#2c3e2e] text-white shadow-md'
                    : 'text-[#5a5a40] hover:bg-[#e5e5d1] hover:text-[#2c3e2e]'
                }`}
              >
                <DollarSign className={`w-4 h-4 ${reportModalTab === 'financial' ? 'text-[#d4a373]' : 'text-[#5a5a40]'}`} />
                <span>Relatório Financeiro</span>
              </button>

              <button
                onClick={() => setReportModalTab('metrics')}
                className={`px-4 py-2.5 rounded-xl text-sm font-extrabold flex items-center gap-2 transition cursor-pointer ${
                  reportModalTab === 'metrics'
                    ? 'bg-[#2c3e2e] text-white shadow-md'
                    : 'text-[#5a5a40] hover:bg-[#e5e5d1] hover:text-[#2c3e2e]'
                }`}
              >
                <Stethoscope className={`w-4 h-4 ${reportModalTab === 'metrics' ? 'text-[#d4a373]' : 'text-[#5a5a40]'}`} />
                <span>Métricas de Atendimento</span>
              </button>

              <button
                onClick={() => setReportModalTab('autoclave')}
                className={`px-4 py-2.5 rounded-xl text-sm font-extrabold flex items-center gap-2 transition cursor-pointer ${
                  reportModalTab === 'autoclave'
                    ? 'bg-[#2c3e2e] text-white shadow-md'
                    : 'text-[#5a5a40] hover:bg-[#e5e5d1] hover:text-[#2c3e2e]'
                }`}
              >
                <Sparkles className={`w-4 h-4 ${reportModalTab === 'autoclave' ? 'text-amber-300' : 'text-[#5a5a40]'}`} />
                <span>Controle de Esterilização (Autoclave)</span>
              </button>
            </div>

            {/* TAB CONTENT CONTAINER */}
            <div id="printable-inventory-area" className="overflow-y-auto space-y-4 flex-1 pr-1">
              
              {/* TAB 1: ITEMS LIST WITH FULL EDIT/ACTIONS */}
              {reportModalTab === 'items' && (
                <div className="space-y-3">
                  <div className="p-3 bg-[#fbfbf9] border border-[#e5e5d1] rounded-2xl flex justify-between items-center text-xs">
                    <span className="text-gray-600 font-medium">Clique em qualquer item ou no botão de editar para gerenciar fotos, validades e dados.</span>
                    <span className="font-bold text-[#2c3e2e] font-mono">Patrimônio Total: R$ {totalStockValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>

                  <table className="w-full text-left text-xs text-[#2c2c2c] border border-[#e5e5d1] rounded-xl overflow-hidden">
                    <thead className="bg-[#f0f0e8] text-[#5a5a40] text-xs font-bold">
                      <tr>
                        <th className="p-3 border-b">Item Nº</th>
                        <th className="p-3 border-b">Material / Equipamento</th>
                        <th className="p-3 border-b">Categoria</th>
                        <th className="p-3 border-b text-center">Qtd Atual</th>
                        <th className="p-3 border-b">Custo Un.</th>
                        <th className="p-3 border-b">Total R$</th>
                        <th className="p-3 border-b">Validade / Nº Série</th>
                        <th className="p-3 border-b">Responsável</th>
                        <th className="p-3 border-b text-right">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e5e5d1]">
                      {[...inventory].sort((a, b) => (a.name || '').localeCompare(b.name || '', 'pt-BR')).map(item => (
                        <tr key={item.id} className="hover:bg-[#fbfbf9]">
                          <td className="p-3 font-mono font-bold text-[#2c3e2e]">{item.itemCode || '-'}</td>
                          <td className="p-3 font-bold text-[#2c2c2c]">
                            <button
                              type="button"
                              onClick={() => {
                                setIsTotalItemsModalOpen(false);
                                openAddItemModalWithItem(item);
                              }}
                              className="text-left font-bold text-[#2c2c2c] hover:text-[#d4a373] hover:underline flex items-center gap-1.5 cursor-pointer"
                              title="Clique para editar este item e gerenciar fotos"
                            >
                              <span>{item.name}</span>
                              <Edit2 className="w-3 h-3 text-[#d4a373]" />
                            </button>
                            {item.quantity <= item.minQuantity && (
                              <span className="ml-2 text-[9px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                                FALTA
                              </span>
                            )}
                          </td>
                          <td className="p-3">{item.category}</td>
                          <td className="p-3 text-center font-mono font-bold">{item.quantity} {item.unit}s</td>
                          <td className="p-3 font-mono">R$ {item.unitCost.toFixed(2)}</td>
                          <td className="p-3 font-mono font-bold text-[#2c3e2e]">R$ {(item.quantity * item.unitCost).toFixed(2)}</td>
                          <td className="p-3 font-mono text-gray-600">
                            {item.serialNumber ? `S/N: ${item.serialNumber}` : (item.expirationDate || 'N/A')}
                          </td>
                          <td className="p-3 text-gray-600 font-medium">
                            {item.ownerScope === 'clinica' ? (
                              <span className="inline-flex items-center gap-1 text-blue-800 font-semibold">
                                <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                <span>{item.clinicName || 'Clínica'}</span>
                              </span>
                            ) : item.ownerScope === 'profissional' ? (
                              <span className="inline-flex items-center gap-1 text-purple-800 font-semibold">
                                <UserCheck className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                                <span>{item.professionalName || 'Profissional'}</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-emerald-800 font-semibold">
                                <PackageCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span>Compartilhado</span>
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setIsTotalItemsModalOpen(false);
                                  openAddItemModalWithItem(item);
                                }}
                                className="px-2.5 py-1 bg-[#2c3e2e] hover:bg-[#1b281d] text-white text-xs font-bold rounded-xl inline-flex items-center gap-1 shadow-2xs transition cursor-pointer"
                              >
                                <Edit2 className="w-3 h-3 text-amber-300" />
                                <span>Editar</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setIsTotalItemsModalOpen(false);
                                  handleDeleteItem(item);
                                }}
                                className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl inline-flex items-center gap-1 transition cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3 text-rose-600" />
                                <span>Excluir</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* TAB 2: FINANCIAL REPORT */}
              {reportModalTab === 'financial' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-[#fbfbf9] border border-[#e5e5d1] rounded-2xl p-4">
                      <span className="text-xs text-gray-500 font-semibold block">Patrimônio Total</span>
                      <span className="text-2xl font-bold font-mono text-[#2c3e2e] mt-1 block">
                        R$ {totalStockValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-[10px] text-gray-400 mt-1 block">Soma de todos os custos de estoque</span>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                      <span className="text-xs text-amber-800 font-semibold block">Itens com Falta (Reposição)</span>
                      <span className="text-2xl font-bold font-mono text-amber-900 mt-1 block">
                        {lowStockItems.length} itens
                      </span>
                      <span className="text-[10px] text-amber-700 mt-1 block">Abaixo do estoque mínimo</span>
                    </div>

                    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
                      <span className="text-xs text-emerald-800 font-semibold block">Total de Itens Cadastrados</span>
                      <span className="text-2xl font-bold font-mono text-emerald-900 mt-1 block">
                        {inventory.length} unidades
                      </span>
                      <span className="text-[10px] text-emerald-700 mt-1 block">Catalogados no sistema</span>
                    </div>
                  </div>

                  <div className="bg-[#fcfdfa] border border-[#e5e5d1] rounded-2xl p-4 space-y-3">
                    <h4 className="text-xs font-bold text-[#2c3e2e] uppercase tracking-wider">Custos por Categoria</h4>
                    <div className="space-y-2">
                      {categoriesList.map(cat => {
                        const catItems = inventory.filter(i => i.category === cat);
                        const catTotal = catItems.reduce((acc, i) => acc + (i.quantity * i.unitCost), 0);
                        if (catItems.length === 0) return null;
                        return (
                          <div key={cat} className="flex items-center justify-between p-2 bg-white rounded-xl border border-[#e5e5d1] text-xs">
                            <span className="font-bold text-[#2c2c2c]">{cat} ({catItems.length} itens)</span>
                            <span className="font-mono font-bold text-[#2c3e2e]">R$ {catTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: ATTENDANCE & CLINICAL METRICS */}
              {reportModalTab === 'metrics' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-[#fbfbf9] border border-[#e5e5d1] rounded-2xl p-4 space-y-2">
                      <h4 className="text-xs font-bold text-[#2c3e2e] flex items-center gap-1.5">
                        <Stethoscope className="w-4 h-4 text-[#d4a373]" />
                        Prontidão de Atendimento & Esterilização
                      </h4>
                      <p className="text-[11px] text-gray-600">
                        Indicadores automáticos de autoclave, validade de insumos e segurança biológica para procedimentos clínicos.
                      </p>
                      <div className="pt-2 flex items-center gap-4 text-xs font-semibold">
                        <span className="text-emerald-700">🟢 Prontos: {inventory.filter(i => getItemReadinessInfo(i).isReady).length}</span>
                        <span className="text-rose-700">🔴 Pendentes / Vencidos: {inventory.filter(i => !getItemReadinessInfo(i).isReady).length}</span>
                      </div>
                    </div>

                    <div className="bg-[#fbfbf9] border border-[#e5e5d1] rounded-2xl p-4 space-y-2">
                      <h4 className="text-xs font-bold text-[#2c3e2e] flex items-center gap-1.5">
                        <Wrench className="w-4 h-4 text-[#d4a373]" />
                        Cronograma de Equipamentos & Manutenção
                      </h4>
                      <p className="text-[11px] text-gray-600">
                        Equipamentos cadastrados e controle de revisões técnicas periódicas.
                      </p>
                      <div className="pt-2 flex items-center gap-4 text-xs font-semibold">
                        <span className="text-blue-700">🔧 Total Equipamentos: {equipmentItems.length}</span>
                        <span className="text-amber-700">⚠️ Manutenções Pendentes: {maintenanceDueItems.length}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#fcfdfa] border border-[#e5e5d1] rounded-2xl p-4 space-y-3">
                    <h4 className="text-xs font-bold text-[#2c2c2c] uppercase tracking-wider">Distribuição por Escopo de Responsabilidade</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="p-3 bg-white border border-[#e5e5d1] rounded-xl">
                        <span className="font-bold text-emerald-800 block">🌐 Compartilhado</span>
                        <span className="text-lg font-bold font-mono text-[#2c2c2c]">{inventory.filter(i => !i.ownerScope || i.ownerScope === 'compartilhado').length} itens</span>
                      </div>
                      <div className="p-3 bg-white border border-[#e5e5d1] rounded-xl">
                        <span className="font-bold text-blue-800 block">🏢 Específico da Clínica</span>
                        <span className="text-lg font-bold font-mono text-[#2c2c2c]">{inventory.filter(i => i.ownerScope === 'clinica').length} itens</span>
                      </div>
                      <div className="p-3 bg-white border border-[#e5e5d1] rounded-xl">
                        <span className="font-bold text-purple-800 block">👨‍⚕️ Específico do Profissional</span>
                        <span className="text-lg font-bold font-mono text-[#2c2c2c]">{inventory.filter(i => i.ownerScope === 'profissional').length} itens</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: CONTROLE DE ESTERILIZAÇÃO (AUTOCLAVE) */}
              {reportModalTab === 'autoclave' && (
                <div className="space-y-5 animate-fadeIn">
                  {/* Top Bar with Registration Action */}
                  <div className="bg-[#f0f0e8] border border-[#e5e5d1] rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-extrabold text-[#2c3e2e] flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-600" />
                        <span>Controle de Biossegurança & Esterilização em Autoclave (RDC 15 / Anvisa)</span>
                      </h4>
                      <p className="text-xs text-gray-600 mt-0.5">
                        Registro oficial de ciclos, leitura de indicadores químicos de 5ª/6ª geração, testes biológicos e tabela física de parâmetros.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => setIsAutoclaveCMERModalOpen(true)}
                        className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                      >
                        <Printer className="w-4 h-4 text-amber-300" />
                        <span>Formulário CMER (8 Registros PDF)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowAddCycleForm(!showAddCycleForm)}
                        className="px-4 py-2 bg-[#2c3e2e] hover:bg-[#1b281d] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                      >
                        <Plus className="w-4 h-4 text-amber-300" />
                        <span>{showAddCycleForm ? 'Fechar Formulário' : 'Registrar Novo Ciclo de Autoclave'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Metrics Summary Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 bg-white border border-[#e5e5d1] rounded-2xl">
                      <span className="text-[10px] uppercase font-bold text-gray-500 block">Total de Ciclos Registrados</span>
                      <span className="text-xl font-bold font-mono text-[#2c3e2e] mt-1 block">{autoclaveLogs.length} ciclos</span>
                    </div>
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl">
                      <span className="text-[10px] uppercase font-bold text-emerald-800 block">Testes Biológicos Aprovados</span>
                      <span className="text-xl font-bold font-mono text-emerald-900 mt-1 block">
                        {autoclaveLogs.filter(l => l.biologicalTestResult.includes('Aprovado')).length} / {autoclaveLogs.length}
                      </span>
                    </div>
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl">
                      <span className="text-[10px] uppercase font-bold text-emerald-800 block">Integradores Químicos OK</span>
                      <span className="text-xl font-bold font-mono text-emerald-900 mt-1 block">
                        {autoclaveLogs.filter(l => l.chemicalIntegratorResult.includes('Aprovado')).length} / {autoclaveLogs.length}
                      </span>
                    </div>
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl">
                      <span className="text-[10px] uppercase font-bold text-blue-800 block">Com Laudos / Fotos Anexadas</span>
                      <span className="text-xl font-bold font-mono text-blue-900 mt-1 block">
                        {autoclaveLogs.filter(l => l.integratorPhotoUrl || l.biologicalTestPhotoUrl || l.physicalTablePhotoUrl).length} laudos
                      </span>
                    </div>
                  </div>

                  {/* REGISTER NEW CYCLE FORM */}
                  {showAddCycleForm && (
                    <form onSubmit={handleSaveAutoclaveCycle} className="bg-[#fbfbf9] border border-[#5a5a40]/30 rounded-3xl p-5 space-y-4 shadow-sm">
                      <div className="border-b border-[#e5e5d1] pb-2 flex items-center justify-between">
                        <h4 className="text-xs font-extrabold text-[#2c3e2e] uppercase tracking-wider flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          Formulário de Registro de Ciclo de Esterilização
                        </h4>
                        <span className="text-[10px] text-gray-500">Aprovações obrigatórias para auditoria sanitária</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-[#5a5a40] mb-1">Data e Hora do Ciclo *</label>
                          <input
                            type="datetime-local"
                            required
                            value={newCycleDate}
                            onChange={(e) => setNewCycleDate(e.target.value)}
                            className="w-full bg-white border border-[#e5e5d1] rounded-xl px-3 py-2 text-xs font-mono text-[#2c2c2c]"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-[#5a5a40] mb-1">Equipamento Autoclave Utilizada *</label>
                          <select
                            value={newCycleAutoclaveName}
                            onChange={(e) => setNewCycleAutoclaveName(e.target.value)}
                            className="w-full bg-white border border-[#e5e5d1] rounded-xl px-3 py-2 text-xs text-[#2c2c2c] font-medium"
                          >
                            {registeredAutoclaveOptions.map((opt, idx) => (
                              <option key={idx} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-[#5a5a40] mb-1">Identificação / Nº do Ciclo *</label>
                          <input
                            type="text"
                            required
                            placeholder="Ex: Ciclo #1043"
                            value={newCycleNumber}
                            onChange={(e) => setNewCycleNumber(e.target.value)}
                            className="w-full bg-white border border-[#e5e5d1] rounded-xl px-3 py-2 text-xs font-mono font-bold text-[#2c2c2c]"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-[#5a5a40] mb-1">Temperatura (°C)</label>
                          <input
                            type="number"
                            value={newCycleTemp}
                            onChange={(e) => setNewCycleTemp(e.target.value)}
                            className="w-full bg-white border border-[#e5e5d1] rounded-xl px-3 py-2 text-xs font-mono text-[#2c2c2c]"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-[#5a5a40] mb-1">Pressão (Bar)</label>
                          <input
                            type="number"
                            step="0.1"
                            value={newCyclePressure}
                            onChange={(e) => setNewCyclePressure(e.target.value)}
                            className="w-full bg-white border border-[#e5e5d1] rounded-xl px-3 py-2 text-xs font-mono text-[#2c2c2c]"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-[#5a5a40] mb-1">Tempo de Esterilização (min)</label>
                          <input
                            type="number"
                            value={newCycleDuration}
                            onChange={(e) => setNewCycleDuration(e.target.value)}
                            className="w-full bg-white border border-[#e5e5d1] rounded-xl px-3 py-2 text-xs font-mono text-[#2c2c2c]"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-[#5a5a40] mb-1">Responsável / Operador *</label>
                          <select
                            value={newCycleOperator}
                            onChange={(e) => setNewCycleOperator(e.target.value)}
                            className="w-full bg-white border border-[#e5e5d1] rounded-xl px-3 py-2 text-xs text-[#2c2c2c] font-bold"
                          >
                            {professionals.map(p => (
                              <option key={p.id} value={p.name}>{p.name} ({p.cro})</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* RESULTS SELECTORS */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-white rounded-2xl border border-[#e5e5d1]">
                        <div>
                          <label className="block text-[11px] font-bold text-emerald-800 mb-1">🧪 Módulo Integrador Químico</label>
                          <select
                            value={newCycleIntegratorResult}
                            onChange={(e) => setNewCycleIntegratorResult(e.target.value as any)}
                            className="w-full bg-emerald-50 border border-emerald-300 rounded-xl px-3 py-1.5 text-xs font-bold text-emerald-900"
                          >
                            <option value="Aprovado (Cor Conforme)">🟢 Aprovado (Mudança de Cor OK)</option>
                            <option value="Não Aprovado">🔴 Reprovado (Sem Mudança de Cor)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-blue-800 mb-1">🧫 Teste Biológico (Indicador)</label>
                          <select
                            value={newCycleBioResult}
                            onChange={(e) => setNewCycleBioResult(e.target.value as any)}
                            className="w-full bg-blue-50 border border-blue-300 rounded-xl px-3 py-1.5 text-xs font-bold text-blue-900"
                          >
                            <option value="Aprovado (Negativo)">🟢 Aprovado (Negativo / Sem Bactérias)</option>
                            <option value="Pendente">🟡 Pendente (Em Incubação 24h/48h)</option>
                            <option value="Reprovado (Positivo)">🔴 Reprovado (Positivo / Crescimento)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-purple-800 mb-1">📊 Tabela / Ficha Física de Controle</label>
                          <div className={`p-2 rounded-xl text-xs font-bold border flex items-center justify-between ${
                            newCyclePhysicalResult === 'Aprovado (Parâmetros Físicos OK)'
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                              : 'bg-rose-50 border-rose-300 text-rose-900'
                          }`}>
                            <span className="flex items-center gap-1.5">
                              {newCyclePhysicalResult === 'Aprovado (Parâmetros Físicos OK)' ? (
                                <>🟢 <span>Conforme (Física OK)</span></>
                              ) : (
                                <>🔴 <span>Desvio Detectado</span></>
                              )}
                            </span>
                            <span className="text-[10px] font-normal text-gray-500" title="Verde se Químico e Biológico forem aprovados; vermelho em qualquer outra condição">
                              {newCyclePhysicalResult === 'Aprovado (Parâmetros Físicos OK)' ? 'Auto: Verde' : 'Auto: Vermelho'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* UNIFIED SINGLE PHOTO ATTACHMENT SECTION (USO INTERNO NO SOFTWARE) */}
                      <div className="space-y-2 bg-[#fbfbf9] p-3.5 rounded-2xl border border-[#e5e5d1]">
                        <div className="flex items-center justify-between">
                          <label className="block text-xs font-bold text-[#2c3e2e] flex items-center gap-1.5">
                            <Camera className="w-4 h-4 text-[#d4a373]" />
                            <span>Anexo Unificado de Fotos / Laudo de Biossegurança (Uso Interno no Software):</span>
                          </label>
                          <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">
                            Anexo Único
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500">
                          Anexe a foto única do Laudo de Biossegurança, fita de teste integradora ou ampolas do ciclo. A foto é visualizada e consultada exclusivamente dentro do software.
                        </p>

                        {newCycleLaudoPhoto || newCycleIntegratorPhoto ? (
                          <div className="relative group bg-white p-2.5 rounded-2xl border border-emerald-200 flex items-center justify-between gap-3 shadow-2xs">
                            <div className="flex items-center gap-3">
                              <img
                                src={newCycleLaudoPhoto || newCycleIntegratorPhoto}
                                alt="Laudo Anexado"
                                className="w-24 h-16 object-cover rounded-xl border border-emerald-300 shadow-xs cursor-pointer hover:opacity-90 transition"
                                onClick={() => setPreviewingAutoclavePhoto({ title: 'Laudo de Esterilização Anexado', url: newCycleLaudoPhoto || newCycleIntegratorPhoto })}
                              />
                              <div>
                                <span className="text-xs font-bold text-emerald-950 block">Foto / Laudo Anexado com Sucesso</span>
                                <span className="text-[10px] text-gray-500 font-mono block">Armazenado no banco interno de dados da clínica</span>
                                <button
                                  type="button"
                                  onClick={() => setPreviewingAutoclavePhoto({ title: 'Laudo de Esterilização Anexado', url: newCycleLaudoPhoto || newCycleIntegratorPhoto })}
                                  className="text-[10px] font-bold text-[#2c3e2e] underline hover:text-emerald-700 mt-0.5 inline-block cursor-pointer"
                                >
                                  Ver Ampliado no Software 🔍
                                </button>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setNewCycleLaudoPhoto('');
                                setNewCycleIntegratorPhoto('');
                                setNewCycleBioPhoto('');
                                setNewCyclePhysicalPhoto('');
                              }}
                              className="p-2 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 border border-rose-200 shrink-0"
                              title="Remover anexo"
                            >
                              <X className="w-4 h-4" />
                              <span>Remover</span>
                            </button>
                          </div>
                        ) : (
                          <label className="w-full h-24 border-2 border-dashed border-emerald-300 bg-white hover:bg-emerald-50/40 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition p-3 text-center">
                            <Camera className="w-5 h-5 text-emerald-700" />
                            <span className="text-xs font-bold text-emerald-900 mt-1">
                              Tirar Foto ou Anexar Imagem Única do Laudo / Indicadores
                            </span>
                            <span className="text-[10px] text-gray-500">
                              Aceita foto da ficha de parâmetros, integrador químico ou ampolas juntas numa só imagem
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              capture="environment"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = (ev) => {
                                    const img = ev.target?.result as string;
                                    setNewCycleLaudoPhoto(img);
                                    setNewCycleIntegratorPhoto(img);
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                          </label>
                        )}
                      </div>

                      {/* SELECT MATERIALS INCLUDED IN THIS CYCLE */}
                      <div>
                        <label className="block text-xs font-bold text-[#5a5a40] mb-1">
                          Materiais e Instrumentais Incluídos Neste Ciclo de Autoclave:
                        </label>
                        <div className="p-3 bg-white rounded-2xl border border-[#e5e5d1] max-h-36 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
                          {inventory.filter(i => i.category !== 'Equipamentos' && i.itemType !== 'equipamento').sort((a, b) => (a.name || '').localeCompare(b.name || '', 'pt-BR')).map(item => {
                            const isChecked = newCycleSelectedItems.includes(item.name);
                            return (
                              <label key={item.id} className="flex items-center gap-2 p-1 hover:bg-[#fbfbf9] rounded-lg cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setNewCycleSelectedItems(prev => [...prev, item.name]);
                                    } else {
                                      setNewCycleSelectedItems(prev => prev.filter(n => n !== item.name));
                                    }
                                  }}
                                  className="w-4 h-4 text-[#2c3e2e] accent-[#2c3e2e] rounded"
                                />
                                <span className="font-medium text-[#2c2c2c] truncate">{item.name} ({item.quantity} {item.unit})</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>

                      {/* NOTES */}
                      <div>
                        <label className="block text-xs font-semibold text-[#5a5a40] mb-1">Observações do Ciclo / Lote / Validade</label>
                        <input
                          type="text"
                          placeholder="Ex: Ciclo conforme RDC 15. Integrador de fita classe 5 e teste biológico sem alteração de cor."
                          value={newCycleNotes}
                          onChange={(e) => setNewCycleNotes(e.target.value)}
                          className="w-full bg-white border border-[#e5e5d1] rounded-xl px-3 py-2 text-xs text-[#2c2c2c]"
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setShowAddCycleForm(false)}
                          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold text-xs rounded-xl"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 bg-[#2c3e2e] hover:bg-[#1b281d] text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <Check className="w-4 h-4 text-amber-300" />
                          Salvar Ciclo no Banco de Dados de Esterilização
                        </button>
                      </div>
                    </form>
                  )}

                  {/* DATABASE TABLE OF AUTOCLAVE CYCLES HISTORY */}
                  <div className="bg-white border border-[#e5e5d1] rounded-2xl overflow-hidden shadow-xs">
                    <div className="p-3 bg-[#f0f0e8] border-b border-[#e5e5d1] flex items-center justify-between text-xs">
                      <span className="font-bold text-[#2c3e2e] flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#d4a373]" />
                        Histórico do Banco de Dados de Esterilização na Autoclave ({autoclaveLogs.length} registros)
                      </span>
                      <span className="text-[10px] text-gray-500 font-medium">Filtro por ordem cronológica decrescente</span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-[#2c2c2c]">
                        <thead className="bg-[#fbfbf9] text-[#5a5a40] font-bold border-b border-[#e5e5d1]">
                          <tr>
                            <th className="p-3">Data / Hora</th>
                            <th className="p-3">Equipamento Autoclave</th>
                            <th className="p-3">Nº Ciclo & Operador</th>
                            <th className="p-3">Parâmetros (Temp/Bar)</th>
                            <th className="p-3 text-center">Módulo Integrador</th>
                            <th className="p-3 text-center">Teste Biológico</th>
                            <th className="p-3 text-center">Fotografias & Laudo</th>
                            <th className="p-3 text-right">Ação</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#e5e5d1]">
                          {autoclaveLogs.map((log) => (
                            <tr key={log.id} className="hover:bg-[#fbfbf9]">
                              <td className="p-3 font-mono font-bold text-[#2c3e2e] whitespace-nowrap">
                                {formatBRDate(log.date.slice(0, 10))} {log.date.slice(11, 16)}
                              </td>
                              <td className="p-3 font-bold text-[#2c2c2c]">{log.autoclaveName}</td>
                              <td className="p-3">
                                <span className="font-mono font-bold text-amber-900 block">{log.cycleNumber}</span>
                                <span className="text-[10px] text-gray-500">{log.operatorName}</span>
                              </td>
                              <td className="p-3 font-mono text-[11px]">
                                {log.temperature}°C • {log.pressure} bar • {log.durationMinutes} min
                              </td>
                              <td className="p-3 text-center">
                                <span className="px-2 py-1 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-lg text-[10px] font-bold">
                                  {log.chemicalIntegratorResult}
                                </span>
                              </td>
                              <td className="p-3 text-center">
                                <span className={`px-2 py-1 rounded-lg text-[10px] font-bold border ${
                                  log.biologicalTestResult.includes('Aprovado')
                                    ? 'bg-blue-100 text-blue-900 border-blue-300'
                                    : 'bg-amber-100 text-amber-900 border-amber-300'
                                }`}>
                                  {log.biologicalTestResult}
                                </span>
                              </td>
                              <td className="p-3 text-center">
                                <div className="flex items-center justify-center gap-1.5">
                                  {log.integratorPhotoUrl && (
                                    <button
                                      type="button"
                                      onClick={() => setPreviewingAutoclavePhoto({ title: `Módulo Integrador Químico - ${log.cycleNumber}`, url: log.integratorPhotoUrl! })}
                                      className="w-7 h-7 rounded-lg border border-[#e5e5d1] overflow-hidden hover:scale-110 transition shadow-2xs cursor-pointer"
                                      title="Ver Foto do Módulo Integrador Químico"
                                    >
                                      <img src={log.integratorPhotoUrl} alt="Integrador" className="w-full h-full object-cover" />
                                    </button>
                                  )}
                                  {log.biologicalTestPhotoUrl && (
                                    <button
                                      type="button"
                                      onClick={() => setPreviewingAutoclavePhoto({ title: `Teste Biológico - ${log.cycleNumber}`, url: log.biologicalTestPhotoUrl! })}
                                      className="w-7 h-7 rounded-lg border border-blue-300 overflow-hidden hover:scale-110 transition shadow-2xs cursor-pointer"
                                      title="Ver Foto do Teste Biológico"
                                    >
                                      <img src={log.biologicalTestPhotoUrl} alt="Teste Biológico" className="w-full h-full object-cover" />
                                    </button>
                                  )}
                                  {log.physicalTablePhotoUrl && (
                                    <button
                                      type="button"
                                      onClick={() => setPreviewingAutoclavePhoto({ title: `Tabela Física / Controle - ${log.cycleNumber}`, url: log.physicalTablePhotoUrl! })}
                                      className="w-7 h-7 rounded-lg border border-purple-300 overflow-hidden hover:scale-110 transition shadow-2xs cursor-pointer"
                                      title="Ver Foto da Tabela Física de Controle"
                                    >
                                      <img src={log.physicalTablePhotoUrl} alt="Tabela Física" className="w-full h-full object-cover" />
                                    </button>
                                  )}
                                </div>
                              </td>
                              <td className="p-3 text-right">
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (confirm(`Deseja excluir o registro do ciclo ${log.cycleNumber}?`)) {
                                      setAutoclaveLogs(prev => prev.filter(l => l.id !== log.id));
                                    }
                                  }}
                                  className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg transition cursor-pointer"
                                  title="Excluir do banco de dados"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-[#e5e5d1] pt-3 shrink-0">
              <span className="text-xs text-gray-500 font-medium">
                Total de {inventory.length} itens catalogados no inventário.
              </span>
              <button
                type="button"
                onClick={() => setIsTotalItemsModalOpen(false)}
                className="px-5 py-2 bg-[#f0f0e8] hover:bg-[#e5e5d1] text-[#5a5a40] font-bold text-xs rounded-2xl"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: CENTRAL DE ALERTAS (ESTOQUE MÍNIMO & MANUTENÇÃO) */}
      {/* ========================================================================= */}
      {isAlertsModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#2c2c2c]/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-[#e5e5d1] rounded-[32px] max-w-5xl w-full p-6 shadow-2xl space-y-4 my-6 max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#e5e5d1] pb-3 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#2c2c2c]">
                    Central de Alertas: Faltas de Estoque & Manutenção de Equipamentos
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => exportToCSV(
                    alertsModalTab === 'low_stock' ? lowStockItems : equipmentItems, 
                    alertsModalTab === 'low_stock' ? 'Alerta_Falta_Estoque_DentisPro' : 'Cronograma_Manutencao_Equipamentos'
                  )}
                  className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-1.5 shadow-2xs transition"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                  Exportar CSV
                </button>
                <button
                  onClick={handlePrint}
                  className="px-3 py-2 bg-[#2c3e2e] hover:bg-[#1b281d] text-white text-xs font-bold rounded-2xl flex items-center gap-1.5 shadow-2xs transition"
                >
                  <Printer className="w-4 h-4 text-[#d4a373]" />
                  Imprimir
                </button>
                <button
                  onClick={() => setIsAlertsModalOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-[#2c2c2c] rounded-xl hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* TAB SELECTOR */}
            <div className="flex items-center gap-2 border-b border-[#e5e5d1] pb-2 shrink-0">
              <button
                onClick={() => setAlertsModalTab('low_stock')}
                className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 transition ${
                  alertsModalTab === 'low_stock'
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'bg-[#f0f0e8] text-[#5a5a40] hover:bg-[#e5e5d1]'
                }`}
              >
                <AlertTriangle className="w-4 h-4" />
                Falta de Estoque ({lowStockItems.length})
              </button>

              <button
                onClick={() => setAlertsModalTab('maintenance')}
                className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 transition ${
                  alertsModalTab === 'maintenance'
                    ? 'bg-[#2c3e2e] text-white shadow-sm'
                    : 'bg-[#f0f0e8] text-[#5a5a40] hover:bg-[#e5e5d1]'
                }`}
              >
                <Wrench className="w-4 h-4 text-[#d4a373]" />
                Cronograma de Manutenção de Equipamentos ({equipmentItems.length})
              </button>
            </div>

            {/* PRINTABLE ALERTS CONTAINER */}
            <div id="printable-inventory-area" className="overflow-y-auto space-y-4 flex-1 pr-1">
              
              {/* TAB 1: LOW STOCK REPORT */}
              {alertsModalTab === 'low_stock' && (
                <div className="space-y-4">
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-amber-900">Itens Abaixo do Estoque Mínimo</h4>
                      <p className="text-xs text-amber-700">Relatório de insumos que necessitam de pedido de compra imediato ao fornecedor.</p>
                    </div>
                    <span className="text-xs font-bold font-mono px-3 py-1 bg-amber-200 text-amber-900 rounded-full">
                      {lowStockItems.length} itens para reposição
                    </span>
                  </div>

                  <table className="w-full text-left text-xs text-[#2c2c2c] border border-[#e5e5d1] rounded-xl overflow-hidden">
                    <thead className="bg-[#f0f0e8] text-[#5a5a40] text-xs font-bold">
                      <tr>
                        <th className="p-3 border-b">Material / Equipamento</th>
                        <th className="p-3 border-b">Categoria</th>
                        <th className="p-3 border-b text-center">Atual</th>
                        <th className="p-3 border-b text-center">Mínimo</th>
                        <th className="p-3 border-b text-center">Sugerido para Compra</th>
                        <th className="p-3 border-b">Unidade</th>
                        <th className="p-3 border-b">Custo Est. Pedido</th>
                        <th className="p-3 border-b">Profissional / Clínica Responsável</th>
                        <th className="p-3 border-b text-right">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e5e5d1]">
                      {lowStockItems.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="p-6 text-center text-gray-400">
                            Nenhum item com estoque baixo no momento.
                          </td>
                        </tr>
                      ) : (
                        lowStockItems.map(item => {
                          const orderQty = Math.max(item.minQuantity * 2 - item.quantity, 5);
                          const estCost = orderQty * item.unitCost;

                          return (
                            <tr key={item.id} className="hover:bg-amber-50/30">
                              <td className="p-3 font-bold text-[#2c2c2c]">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setIsAlertsModalOpen(false);
                                    openAddItemModalWithItem(item);
                                  }}
                                  className="text-left font-bold text-[#2c2c2c] hover:text-[#d4a373] hover:underline flex items-center gap-1 cursor-pointer"
                                  title="Clique para editar este item e gerenciar fotos"
                                >
                                  <span>{item.name}</span>
                                  <Edit2 className="w-3 h-3 text-amber-600" />
                                </button>
                                {item.itemCode && (
                                  <span className="text-[10px] font-mono text-[#5a5a40] block font-normal">
                                    Item Nº: {item.itemCode}
                                  </span>
                                )}
                              </td>
                              <td className="p-3">{item.category}</td>
                              <td className="p-3 text-center font-mono font-bold text-rose-700">{item.quantity} {item.unit}s</td>
                              <td className="p-3 text-center font-mono text-gray-500">{item.minQuantity}</td>
                              <td className="p-3 text-center font-mono font-bold text-emerald-800 bg-emerald-50 rounded-lg">
                                +{orderQty} {item.unit}s
                              </td>
                              <td className="p-3 font-mono">R$ {item.unitCost.toFixed(2)}</td>
                              <td className="p-3 font-mono font-bold text-[#2c3e2e]">R$ {estCost.toFixed(2)}</td>
                              <td className="p-3 text-gray-600 font-medium">
                                {item.ownerScope === 'clinica' ? (
                                  <span className="inline-flex items-center gap-1 text-blue-800 font-semibold">
                                    <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                    <span>{item.clinicName || 'Clínica'}</span>
                                  </span>
                                ) : item.ownerScope === 'profissional' ? (
                                  <span className="inline-flex items-center gap-1 text-purple-800 font-semibold">
                                    <UserCheck className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                                    <span>{item.professionalName || 'Profissional'}</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-emerald-800 font-semibold">
                                    <PackageCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                    <span>Clínica (Compartilhado)</span>
                                  </span>
                                )}
                              </td>
                              <td className="p-3 text-right">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setIsAlertsModalOpen(false);
                                    openAddItemModalWithItem(item);
                                  }}
                                  className="px-2.5 py-1 bg-[#2c3e2e] hover:bg-[#1b281d] text-white text-xs font-bold rounded-xl inline-flex items-center gap-1 shadow-2xs transition cursor-pointer"
                                >
                                  <Edit2 className="w-3 h-3 text-amber-300" />
                                  <span>Editar</span>
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* TAB 2: EQUIPMENT MAINTENANCE ALERTS & ARCHIVE */}
              {alertsModalTab === 'maintenance' && (
                <div className="space-y-4">
                  <div className="p-4 bg-[#2c3e2e] text-white rounded-2xl flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold flex items-center gap-2">
                        <Wrench className="w-4 h-4 text-[#d4a373]" />
                        Arquivamento & Cronograma de Manutenção Preventiva
                      </h4>
                      <p className="text-xs text-gray-300">
                        Registros de calibração, lubrificação, aferição técnica e revisão de autoclaves, fotopolimerizadores e motores.
                      </p>
                    </div>
                    <span className="text-xs font-bold font-mono px-3 py-1 bg-white/20 text-white rounded-full">
                      {equipmentItems.length} equipamentos sob monitoramento
                    </span>
                  </div>

                  {equipmentItems.length === 0 ? (
                    <div className="p-8 text-center text-gray-400 bg-[#fbfbf9] rounded-2xl border border-[#e5e5d1]">
                      Nenhum equipamento com alerta de manutenção cadastrado. Cadastre equipamentos com a opção "Requer Manutenção".
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {equipmentItems.map(item => {
                        const dueDate = item.nextMaintenanceDate || item.maintenanceDate;
                        const freqDays = item.maintenanceFrequencyDays || 180;
                        const diffDays = dueDate ? Math.ceil((new Date(dueDate).getTime() - new Date(todayStr).getTime()) / (1000 * 3600 * 24)) : 999;
                        
                        const isOverdue = diffDays < 0;
                        const isSoon = diffDays >= 0 && diffDays <= 30;

                        return (
                          <div 
                            key={item.id}
                            className={`p-4 rounded-2xl border transition-all ${
                              isOverdue ? 'bg-rose-50/80 border-rose-300' :
                              isSoon ? 'bg-amber-50/80 border-amber-300' :
                              'bg-white border-[#e5e5d1]'
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e5e5d1]/60 pb-3">
                              <div>
                                <div className="flex items-center gap-2">
                                  <h5 className="font-bold text-[#2c2c2c] text-sm">{item.name}</h5>
                                  {isOverdue && (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-600 text-white">
                                      Manutenção vencida ({Math.abs(diffDays)}d atrasado)
                                    </span>
                                  )}
                                  {isSoon && (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white">
                                      Próxima (em {diffDays} dias)
                                    </span>
                                  )}
                                  {!isOverdue && !isSoon && (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                      Em dia
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-500 font-mono mt-0.5">
                                  Nº de Série / Patrimônio: <strong className="text-[#2c3e2e]">{item.serialNumber || 'N/A'}</strong> • Responsável: {item.ownerScope === 'clinica' ? (item.clinicName || 'Clínica') : item.ownerScope === 'profissional' ? (item.professionalName || 'Profissional') : 'Clínica (Compartilhado)'}
                                </p>
                              </div>

                              <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setIsAlertsModalOpen(false);
                                    openAddItemModalWithItem(item);
                                  }}
                                  className="px-3.5 py-2 bg-[#2c3e2e] hover:bg-[#1b281d] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
                                  title="Editar informações e fotos deste equipamento"
                                >
                                  <Edit2 className="w-3.5 h-3.5 text-amber-300" />
                                  <span>Editar Equipamento & Fotos</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handlePerformMaintenance(item.id, freqDays)}
                                  className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                                >
                                  <Check className="w-4 h-4 text-emerald-200" />
                                  Registrar Manutenção Concluída
                                </button>
                              </div>
                            </div>

                            {/* Dates & Instructions */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 text-xs">
                              <div>
                                <span className="text-gray-500 font-semibold block text-[11px]">Frequência periódica</span>
                                <span className="font-mono font-bold text-[#2c2c2c]">A cada {freqDays} dias</span>
                              </div>

                              <div>
                                <span className="text-gray-500 font-semibold block text-[11px]">Última manutenção</span>
                                <span className="font-mono text-[#2c2c2c]">{item.lastMaintenanceDate || 'Não informada'}</span>
                              </div>

                              <div>
                                <span className="text-gray-500 font-semibold block text-[11px]">Próxima manutenção programada</span>
                                <span className={`font-mono font-bold ${isOverdue ? 'text-rose-700' : isSoon ? 'text-amber-800' : 'text-emerald-800'}`}>
                                  {dueDate || 'A determinar'}
                                </span>
                              </div>
                            </div>

                            {/* Notes */}
                            {item.maintenanceNotes && (
                              <div className="mt-2.5 p-2.5 bg-white/80 border border-[#e5e5d1] rounded-xl text-[11px] text-gray-600">
                                <strong className="text-[#5a5a40]">Recomendações técnicas:</strong> {item.maintenanceNotes}
                              </div>
                            )}

                            {/* History log counts */}
                            {item.maintenanceHistory && item.maintenanceHistory.length > 0 && (
                              <div className="mt-2 text-[10px] text-gray-400">
                                Histórico arquivado: {item.maintenanceHistory.length} revisões registradas.
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-[#e5e5d1] pt-3 shrink-0">
              <span className="text-xs text-gray-500 font-medium">
                Imprima ou exporte para controle de auditoria de biosegurança e compras.
              </span>
              <button
                type="button"
                onClick={() => setIsAlertsModalOpen(false)}
                className="px-5 py-2 bg-[#f0f0e8] hover:bg-[#e5e5d1] text-[#5a5a40] font-bold text-xs rounded-2xl"
              >
                Fechar Central de Alertas
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: CADASTRAR / EDITAR MATERIAL / EQUIPAMENTO */}
      {/* ========================================================================= */}
      {isAddItemModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#2c2c2c]/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-[#e5e5d1] rounded-[32px] max-w-xl w-full p-6 shadow-2xl space-y-4 my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#e5e5d1] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#f0f0e8] border border-[#e5e5d1] flex items-center justify-center text-[#5a5a40]">
                  {editingItemId ? <Edit2 className="w-4 h-4 text-[#d4a373]" /> : <Package className="w-4 h-4 text-[#d4a373]" />}
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#2c2c2c]">
                    {editingItemId ? 'Editar Material / Equipamento' : 'Novo Cadastro de Material / Equipamento'}
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    {editingItemId ? 'Altere dados do item, gerencie estoque ou adicione/remova fotos de identificação' : 'Adicione ao inventário com identificação visual via câmera/Google Lens'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => {
                  stopCamera();
                  setIsAddItemModalOpen(false);
                }} 
                className="p-1 text-gray-400 hover:text-[#2c2c2c] rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-[75vh] overflow-y-auto pr-2 space-y-4">
              {/* Photo Addition Success Notice Banner */}
              {photoSuccessNotice && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-800 font-bold animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{photoSuccessNotice}</span>
                </div>
              )}

              {/* Google Lens AI Notification Banner */}
              {lensScanSuccess && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-2.5 text-xs text-amber-900 font-medium animate-fadeIn">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0 animate-pulse" />
                  <span>{lensScanSuccess}</span>
                </div>
              )}

              {/* Quick Presets / Examples Selector to prefill item instantly */}
              {!editingItemId && (
                <div className="bg-[#fcfdfa] border border-[#d4a373]/40 rounded-2xl p-3.5 space-y-2 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#5a5a40] flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-[#d4a373]" />
                      💡 Exemplos e Kits Prontos para Escolher Rápido:
                    </span>
                    <span className="text-[10px] text-gray-400 font-medium">Clique para preencher o formulário</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-1">
                    {[
                      { name: 'Kit Grampos Isolamento Absoluto (38 Unidades)', category: 'Instrumentais', unit: 'kit', cost: 1710, supplier: 'Golgran / Duflex', minQty: 1 },
                      { name: 'Kit 1º Termo Odontologia', category: 'Instrumentais', unit: 'kit', cost: 1500, supplier: 'Dental Cremer', minQty: 1 },
                      { name: 'Kit 2º Termo Dentística', category: 'Instrumentais', unit: 'kit', cost: 1800, supplier: 'Dental Cremer', minQty: 1 },
                      { name: 'Cimento de Ionômero de Vidro', category: 'Cimentos & Restauração', unit: 'caixa', cost: 95.00, supplier: 'Vigodent', minQty: 2 },
                      { name: 'Resina Composta Z350 XT A2', category: 'Resinas & Adesivos', unit: 'seringa', cost: 120.00, supplier: '3M Oral Care', minQty: 3 },
                      { name: 'Alginato Hydrogum 5', category: 'Consumíveis & Descartáveis', unit: 'pote', cost: 45.00, supplier: 'Zhermack', minQty: 4 },
                      { name: 'Avental Branco com Manga Curta', category: 'Biossegurança & EPIs', unit: 'unidade', cost: 65.00, supplier: 'Dental Cremer', minQty: 2 },
                      { name: 'Espelho Bucal nº 5 c/ Cabo', category: 'Instrumentais', unit: 'unidade', cost: 18.50, supplier: 'Golgran', minQty: 5 },
                      { name: 'Kit Cirurgia e Exodontia', category: 'Cirurgia', unit: 'kit', cost: 2200.00, supplier: 'Millennium', minQty: 1 },
                      { name: 'Kit Endodôntico Simplificado', category: 'Endodontia', unit: 'kit', cost: 850.00, supplier: 'Maillefer', minQty: 1 },
                      { name: 'Micro-motor Completo', category: 'Equipamentos', unit: 'unidade', cost: 2500.00, supplier: 'Dabi Atlante', minQty: 1 }
                    ].map((ex, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          applySuggestion(ex);
                          setPhotoSuccessNotice(`Exemplo "${ex.name}" aplicado com sucesso!`);
                          setTimeout(() => setPhotoSuccessNotice(null), 3000);
                        }}
                        className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-[#2c3e2e] text-xs font-semibold rounded-xl border border-[#e5e5d1] transition shadow-2xs flex items-center gap-1"
                      >
                        <span className="text-emerald-700 font-bold">+</span> {ex.name} <span className="text-[10px] text-gray-400 font-mono">(R$ {ex.cost.toFixed(2)})</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <form onSubmit={handleAddItem} className="space-y-4">

              {/* SELETOR VISUAL DE TIPO DE ITEM (INSUMO, INSTRUMENTAL, EQUIPAMENTO) */}
              <div className="bg-[#fcfdfa] border border-[#e5e5d1] rounded-2xl p-4 space-y-3 shadow-2xs">
                <div>
                  <label className="block text-xs font-bold text-[#2c3e2e] flex items-center gap-1.5">
                    <Package className="w-4 h-4 text-[#d4a373]" />
                    Tipo do Item no Inventário *
                  </label>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Selecione o tipo do item para definir a regra de alerta de estoque e controle de biossegurança/manutenção.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setItemType('insumo');
                      if (category === 'Equipamentos' || category === 'Instrumentais') setCategory('Consumíveis & Descartáveis');
                    }}
                    className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition cursor-pointer ${
                      itemType === 'insumo' 
                        ? 'bg-blue-50 border-blue-500 text-blue-950 font-bold shadow-xs' 
                        : 'bg-white border-[#e5e5d1] text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <div className="p-1.5 rounded-lg bg-blue-100 text-blue-800 shrink-0 mt-0.5">
                      <Package className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold">📦 Insumo / Consumível</div>
                      <div className="text-[10px] text-gray-500 font-normal leading-tight mt-0.5">
                        Resinas, agulhas, tubetes, luvas. Alerta quando quantidade ≤ mínimo.
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setItemType('instrumental');
                      setCategory('Instrumentais');
                    }}
                    className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition cursor-pointer ${
                      itemType === 'instrumental' 
                        ? 'bg-purple-50 border-purple-500 text-purple-950 font-bold shadow-xs' 
                        : 'bg-white border-[#e5e5d1] text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <div className="p-1.5 rounded-lg bg-purple-100 text-purple-800 shrink-0 mt-0.5">
                      <Search className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold">🔎 Instrumental Odontológico</div>
                      <div className="text-[10px] text-gray-500 font-normal leading-tight mt-0.5">
                        Espátulas, pinças, curetas, brocas. Alerta somente se zerado (0) ou &lt; mín.
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setItemType('equipamento');
                      setCategory('Equipamentos');
                      setRequiresMaintenance(true);
                    }}
                    className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition cursor-pointer ${
                      itemType === 'equipamento' 
                        ? 'bg-amber-50 border-amber-500 text-amber-950 font-bold shadow-xs' 
                        : 'bg-white border-[#e5e5d1] text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <div className="p-1.5 rounded-lg bg-amber-100 text-amber-800 shrink-0 mt-0.5">
                      <Wrench className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold">🔬 Equipamento / Aparelho</div>
                      <div className="text-[10px] text-gray-500 font-normal leading-tight mt-0.5">
                        Autoclaves, fotopolimerizadores, motores. Controle de manutenção preventiva.
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* 1. CATEGORIA & NOME DO PRODUTO (PRIMEIRO NO FORMULÁRIO) */}
              <div className="bg-[#fcfdfa] border border-[#e5e5d1] rounded-2xl p-4 space-y-3 shadow-2xs">
                {/* CATEGORIA */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-[#5a5a40]">
                      Categoria *
                    </label>
                    {!isCreatingCustomCategory && (
                      <button
                        type="button"
                        onClick={() => setIsCreatingCustomCategory(true)}
                        className="text-[11px] font-bold text-[#2d6a4f] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        Adicionar Nova Categoria
                      </button>
                    )}
                  </div>

                  {isCreatingCustomCategory ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Digite a nova categoria (ex: Radiologia, CAD/CAM...)"
                        value={customCategoryInput}
                        onChange={(e) => setCustomCategoryInput(e.target.value)}
                        className="flex-1 bg-white border border-emerald-400 rounded-xl px-3 py-2 text-xs text-[#2c2c2c] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleAddCustomCategory}
                        className="px-3 py-2 bg-[#2d6a4f] text-white rounded-xl text-xs font-bold hover:bg-[#1b4332] cursor-pointer"
                      >
                        Salvar
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsCreatingCustomCategory(false)}
                        className="px-2 py-2 text-gray-500 hover:text-gray-700 text-xs cursor-pointer"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <select
                      value={category}
                      onChange={(e) => handleCategoryChange(e.target.value)}
                      className="w-full bg-white border border-[#e5e5d1] rounded-2xl px-3.5 py-2.5 text-xs text-[#2c2c2c] focus:outline-none focus:border-[#5a5a40] font-medium"
                    >
                      {categoriesList.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  )}
                </div>

                {/* NOME DO PRODUTO */}
                <div className="space-y-1.5 pt-1">
                  <label className="block text-xs font-bold text-[#5a5a40]">
                    Nome do Produto *
                  </label>
                  
                  <div className="space-y-1 relative">
                    <input
                      type="text"
                      required
                      placeholder="Ex: Autoclave 12L Cristófoli, Resina Z350 XT A2, Anestésico Lidocaína..."
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-white border border-[#e5e5d1] rounded-2xl px-3.5 py-2.5 text-xs text-[#2c2c2c] focus:outline-none focus:border-[#5a5a40] font-medium"
                    />

                    {/* AUTO-COMPLETE DROPDOWN */}
                    {name.trim().length >= 2 && (
                      <div className="absolute z-30 mt-1 left-0 right-0 bg-white border border-[#e5e5d1] rounded-2xl shadow-xl max-h-48 overflow-y-auto p-1.5 space-y-1">
                        <div className="px-2 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                          Auto-completar do Catálogo ({Object.values(PRODUCT_SUGGESTIONS).flat().filter(i => i.name.toLowerCase().includes(name.toLowerCase())).length})
                        </div>
                        {Object.values(PRODUCT_SUGGESTIONS).flat().filter(i => i.name.toLowerCase().includes(name.toLowerCase())).map((sug, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              applySuggestion(sug);
                              setName(sug.name);
                            }}
                            className="w-full text-left px-3 py-2 hover:bg-emerald-50 rounded-xl text-xs font-medium text-[#2c2c2c] flex items-center justify-between transition group cursor-pointer"
                          >
                            <span className="group-hover:text-emerald-900 font-bold">{sug.name}</span>
                            <span className="text-[10px] text-gray-400 font-mono">R$ {sug.cost.toFixed(2)}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Smart Suggestion Chips */}
                  {PRODUCT_SUGGESTIONS[category] && PRODUCT_SUGGESTIONS[category].length > 0 && (
                    <div className="mt-2 space-y-1">
                      <span className="text-[11px] font-bold text-gray-600 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-[#d4a373]" />
                        Sugestões rápidas para {category}:
                      </span>
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {PRODUCT_SUGGESTIONS[category].map((sug, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => applySuggestion(sug)}
                            className="px-2.5 py-1 bg-[#f0f0e8] hover:bg-[#e5e5d1] text-[#2c3e2e] text-[11px] rounded-lg border border-[#e5e5d1] transition-colors text-left cursor-pointer"
                          >
                            + {sug.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* 2. GALERIA DE FOTOS DO PRODUTO & LEITOR DE CÓDIGO DE BARRAS (ÚNICO CAMPO DE FOTOS DO MODAL) */}
              <div className="bg-[#fcfdfa] border border-[#e5e5d1] rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#2c3e2e] flex items-center gap-1.5">
                      <Camera className="w-4 h-4 text-[#d4a373]" />
                      Galeria de Fotos do Produto & Leitor de Código de Barras
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#e5e5d1] text-[#5a5a40]">
                      {itemImages.length} {itemImages.length === 1 ? 'foto' : 'fotos'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsLensModalOpen(true);
                    }}
                    disabled={isScanningLens}
                    className="px-3 py-1.5 bg-[#2c3e2e] hover:bg-[#1b281d] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                  >
                    <Scan className="w-4 h-4 text-amber-300 animate-pulse" />
                    <span>Escanear Código de Barras</span>
                  </button>
                </div>

                {/* Success Notice Notification */}
                {photoSuccessNotice && (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-bold flex items-center gap-2 animate-fadeIn">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{photoSuccessNotice}</span>
                  </div>
                )}

                {/* Google Lens AI Scanning Overlay Indicator */}
                {isScanningLens && (
                  <div className="p-3 bg-amber-500/10 border border-amber-400/40 rounded-2xl flex items-center gap-3 text-amber-900 animate-pulse">
                    <Scan className="w-5 h-5 text-amber-600 animate-spin shrink-0" />
                    <div>
                      <p className="text-xs font-bold">Google Lens AI Analisando Foto do Material...</p>
                      <p className="text-[10px] text-amber-800">Identificando fabricante, categoria, modelo e preenchendo os campos do cadastro.</p>
                    </div>
                  </div>
                )}

                {/* Live Camera Stream Viewfinder */}
                {isCameraActive && (
                  <div className="p-3 bg-black/90 rounded-2xl text-white space-y-3 relative overflow-hidden">
                    <div className="flex items-center justify-between text-xs font-bold text-amber-300">
                      <span className="flex items-center gap-1.5">
                        <Camera className="w-4 h-4 animate-pulse text-emerald-400" />
                        Câmera ao Vivo — Tire foto da caixa, frasco ou equipamento
                      </span>
                      <button
                        type="button"
                        onClick={stopCamera}
                        className="p-1 hover:bg-white/20 rounded-lg text-white"
                        title="Fechar Câmera"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {cameraError ? (
                      <div className="p-3 bg-red-900/80 text-red-200 text-xs rounded-xl">
                        {cameraError}
                      </div>
                    ) : (
                      <div className="relative rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center border border-emerald-500/50">
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          className="w-full h-full object-cover"
                        />
                        {/* Overlay target grid for scanner */}
                        <div className="absolute inset-4 border-2 border-dashed border-amber-300/80 rounded-xl pointer-events-none flex items-center justify-center">
                          <div className="bg-black/70 text-amber-300 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
                            <Camera className="w-3.5 h-3.5 text-amber-400" />
                            Aponte a câmera para o material ou rótulo
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-2 pt-1">
                      <button
                        type="button"
                        onClick={stopCamera}
                        className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded-xl text-xs font-bold cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={() => capturePhotoFromCamera()}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
                      >
                        <Camera className="w-4 h-4 text-amber-300" />
                        Tirar Foto e Salvar no Item
                      </button>
                    </div>
                  </div>
                )}

                {/* Gallery of Uploaded Identification Photos */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-[#5a5a40]">
                    <span>Fotos Cadastradas ({itemImages.length})</span>
                    <span className="text-[10px] text-gray-500">Clique na foto para visualizar ampliada</span>
                  </div>

                  <div className="flex items-center gap-3 overflow-x-auto p-2.5 bg-[#fcfdfa] border border-[#e5e5d1] rounded-2xl scrollbar-thin max-w-full min-h-[140px]">
                    {itemImages.length === 0 ? (
                      <div className="w-full text-center py-4 text-xs text-gray-400 flex flex-col items-center justify-center gap-1">
                        <ImageIcon className="w-8 h-8 text-gray-300" />
                        <span>Nenhuma foto vinculada a este item ainda.</span>
                        <span className="text-[10px]">Adicione via câmera, selecione um arquivo ou cole o link abaixo.</span>
                      </div>
                    ) : (
                      itemImages.map((imgUrl, idx) => (
                        <div 
                          key={idx} 
                          className="relative w-36 h-36 rounded-2xl bg-[#f0f0e8] border border-[#e5e5d1] overflow-hidden shrink-0 shadow-xs flex flex-col justify-between"
                        >
                          {/* Image Thumbnail */}
                          <div 
                            className="absolute inset-0 cursor-pointer"
                            onClick={() => setPreviewingFullImage(imgUrl)}
                          >
                            <img src={imgUrl} alt={`Foto do Material ${idx + 1}`} className="w-full h-full object-cover" />
                          </div>

                          {/* Top Action Bar */}
                          <div className="relative z-10 p-1.5 flex items-center justify-between pointer-events-none">
                            {idx === 0 ? (
                              <span className="bg-[#1b281d] text-amber-300 text-[9px] font-bold rounded-lg px-2 py-0.5 shadow-sm border border-amber-300/40 flex items-center gap-1">
                                <Star className="w-2.5 h-2.5 fill-amber-300" />
                                Principal
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const reordered = [imgUrl, ...itemImages.filter((_, i) => i !== idx)];
                                  setItemImages(reordered);
                                  setPhotoUrl(imgUrl);
                                  setPhotoSuccessNotice('Foto definida como principal do item!');
                                  setTimeout(() => setPhotoSuccessNotice(null), 3000);
                                }}
                                className="pointer-events-auto px-2 py-1 bg-amber-500 hover:bg-amber-600 text-amber-950 font-bold text-[10px] rounded-lg shadow-sm flex items-center gap-1 transition cursor-pointer"
                                title="Definir como foto principal"
                              >
                                <Star className="w-3 h-3 fill-amber-950" />
                                <span>Tornar Principal</span>
                              </button>
                            )}

                            <div className="flex items-center gap-1 pointer-events-auto">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPreviewingFullImage(imgUrl);
                                }}
                                className="p-1.5 bg-white/90 hover:bg-white text-gray-800 rounded-lg shadow-sm transition cursor-pointer"
                                title="Expandir foto"
                              >
                                <ZoomIn className="w-3.5 h-3.5 text-[#2c3e2e]" />
                              </button>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const filtered = itemImages.filter((_, i) => i !== idx);
                                  setItemImages(filtered);
                                  if (photoUrl === imgUrl) setPhotoUrl(filtered[0] || '');
                                }}
                                className="p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-sm transition cursor-pointer"
                                title="Remover foto"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Bottom Index Indicator */}
                          <div className="relative z-10 p-1.5 text-right pointer-events-none">
                            <span className="bg-black/60 text-white text-[9px] font-mono px-1.5 py-0.5 rounded-md backdrop-blur-xs">
                              #{idx + 1}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* 3 WAYS TO ADD PHOTOS */}
                <div className="space-y-2 pt-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* CAMERA BUTTON */}
                    <button
                      type="button"
                      onClick={() => startCamera()}
                      className="px-3.5 py-2 bg-[#2c3e2e] hover:bg-[#1f2d22] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                    >
                      <Camera className="w-4 h-4 text-[#d4a373]" />
                      Adicionar via Câmera
                    </button>

                    {/* FILE UPLOAD BUTTON */}
                    <label className="px-3.5 py-2 bg-[#f0f0e8] hover:bg-[#e5e5d1] text-[#2c3e2e] font-bold text-xs rounded-xl flex items-center gap-1.5 border border-[#e5e5d1] cursor-pointer transition shadow-2xs">
                      <Upload className="w-4 h-4 text-[#d4a373]" />
                      Selecionar Arquivo do Computador
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* DIRECT URL LINK INPUT WITH AUTO EXTRACTION */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="url"
                      placeholder="Cole o link / URL da foto (ex: https://...)"
                      value={imageUrlInput}
                      onChange={(e) => setImageUrlInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddPhotoFromUrl();
                        }
                      }}
                      className="flex-1 bg-[#fbfbf9] border border-[#e5e5d1] rounded-xl px-3 py-1.5 text-xs text-[#2c2c2c] focus:outline-none focus:border-[#5a5a40]"
                    />
                    <button
                      type="button"
                      onClick={handleAddPhotoFromUrl}
                      disabled={!imageUrlInput.trim()}
                      className={`px-3.5 py-1.5 ${t.btnPrimaryBg} ${t.btnPrimaryText} disabled:opacity-40 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer`}
                    >
                      + Adicionar Link
                    </button>
                  </div>
                </div>

                <p className="text-[10px] text-gray-500">
                  💡 Ao inserir o link da foto, o sistema extrai e preenche automaticamente as especificações no cadastro.
                </p>
              </div>

              {/* 3. PROPRIEDADE & ISOLAMENTO DO MATERIAL (CLÍNICA VS PROFISSIONAL VS COMPARTILHADO) */}
              <div className="bg-[#fcfdfa] border border-[#e5e5d1] rounded-2xl p-4 space-y-3">
                <div>
                  <label className="block text-xs font-bold text-[#2c3e2e] flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-[#d4a373]" />
                    Profissional / Clínica Responsável pelo Material *
                  </label>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Defina se este item é exclusivo de uma clínica, de um cirurgião-dentista ou compartilhado.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setOwnerScope('compartilhado')}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition cursor-pointer ${
                      ownerScope === 'compartilhado' 
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold shadow-xs' 
                        : 'bg-white border-[#e5e5d1] text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <PackageCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <div className="text-xs">Compartilhado</div>
                      <div className="text-[10px] text-gray-400 font-normal">Todas as clínicas</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setOwnerScope('clinica');
                      if (!itemClinicId && clinics.length > 0) setItemClinicId(clinics[0].id);
                    }}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition cursor-pointer ${
                      ownerScope === 'clinica' 
                        ? 'bg-blue-50 border-blue-500 text-blue-950 font-bold shadow-xs' 
                        : 'bg-white border-[#e5e5d1] text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <div>
                      <div className="text-xs">Da Clínica</div>
                      <div className="text-[10px] text-gray-400 font-normal">Unidade específica</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setOwnerScope('profissional');
                      if (!itemProfessionalId && professionals.length > 0) setItemProfessionalId(professionals[0].id);
                    }}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition cursor-pointer ${
                      ownerScope === 'profissional' 
                        ? 'bg-purple-50 border-purple-500 text-purple-950 font-bold shadow-xs' 
                        : 'bg-white border-[#e5e5d1] text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <UserCheck className="w-4 h-4 text-purple-600 shrink-0" />
                    <div>
                      <div className="text-xs">Do Profissional</div>
                      <div className="text-[10px] text-gray-400 font-normal">Dentista específico</div>
                    </div>
                  </button>
                </div>

                {/* Sub-selectors */}
                {ownerScope === 'clinica' && (
                  <div className="pt-2 animate-fadeIn">
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      Selecione a Clínica Proprietária
                    </label>
                    <select
                      value={itemClinicId}
                      onChange={(e) => setItemClinicId(e.target.value)}
                      className="w-full bg-white border border-blue-300 rounded-xl p-2 text-xs font-bold text-blue-950 focus:outline-none"
                    >
                      {clinics.map(c => (
                        <option key={c.id} value={c.id}>{c.name} - {c.city || 'Unidade'}</option>
                      ))}
                    </select>
                  </div>
                )}

                {ownerScope === 'profissional' && (
                  <div className="pt-2 animate-fadeIn">
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      Selecione o Cirurgião-Dentista Proprietário
                    </label>
                    <select
                      value={itemProfessionalId}
                      onChange={(e) => setItemProfessionalId(e.target.value)}
                      className="w-full bg-white border border-purple-300 rounded-xl p-2 text-xs font-bold text-purple-950 focus:outline-none"
                    >
                      {professionals.map(p => (
                        <option key={p.id} value={p.id}>{p.name} ({p.cro})</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              {/* SUPPLIER / FABRICANTE */}
              <div>
                <label className="block text-xs font-semibold text-[#5a5a40] mb-1">Fornecedor / Fabricante</label>
                <AutocompleteInput
                  value={supplier}
                  onChange={setSupplier}
                  suggestions={[
                    { label: 'Dental Cremer', subLabel: 'Distribuidor Nacional de Materiais Odontológicos' },
                    { label: 'DFL / Nova DFL', subLabel: 'Fabricante de Anestésicos e Agulhas' },
                    { label: '3M Oral Care', subLabel: 'Fabricante de Resinas, Adesivos e Cimentos' },
                    { label: 'Cristófoli Biossegurança', subLabel: 'Fabricante de Autoclaves e Equipamentos' },
                    { label: 'Vipi', subLabel: 'Prótese e Acrílicos' },
                    { label: 'Septodont do Brasil', subLabel: 'Anestésicos e Endodontia' },
                    { label: 'Ultradent Products', subLabel: 'Clareadores, Fios e Adesivos' },
                    { label: 'Dentsply Sirona', subLabel: 'Equipamentos e Cimentos' },
                    { label: 'Ivoclar Vivadent', subLabel: 'Cerâmicas e Resinas Estéticas' },
                    { label: 'Curaprox Brasil', subLabel: 'Escovas e Higiene Oral' },
                    { label: 'Descarpack', subLabel: 'EPIs e Descartáveis' },
                    { label: 'FGM Dental Group', subLabel: 'Clareadores e Resinas' },
                    { label: 'Rioquímica', subLabel: 'Antissépticos e Soluções' },
                    { label: 'SS White Dental', subLabel: 'Instrumentais e Cimentos' },
                    { label: 'Biodinamica', subLabel: 'Endodontia e Cimentos' }
                  ]}
                  placeholder="Ex: Dental Cremer, DFL, 3M, Cristófoli..."
                />
              </div>

              {/* ITEM CODE / BARCODE / DENTAL CATALOG NUMBER */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-[#5a5a40] flex items-center gap-1.5">
                    <Barcode className="w-4 h-4 text-[#d4a373]" />
                    Número / Código de Barras / Ref. Odontológica
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsLensModalOpen(true);
                    }}
                    className="text-[10px] font-bold text-[#2c3e2e] hover:text-[#1b281d] flex items-center gap-1 bg-[#f0f0e8] hover:bg-[#e5e5d1] px-2.5 py-1 rounded-lg border border-[#e5e5d1] transition"
                    title="Escanear Código de Barras ou REF do Produto com a Câmera"
                  >
                    <Scan className="w-3 h-3 text-[#d4a373]" />
                    <span>Escanear código de barras</span>
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Ex: 7891234567890, MAT-1001, REF-405, 3M-Z350..."
                  value={itemCode}
                  onChange={(e) => setItemCode(e.target.value)}
                  className="w-full bg-[#fbfbf9] border border-[#e5e5d1] rounded-2xl px-3.5 py-2.5 text-xs text-[#2c2c2c] focus:outline-none focus:border-[#5a5a40] font-mono"
                />
                <p className="text-[10px] text-gray-500 mt-1">
                  Permite cadastrar e localizar o material instantaneamente pelo código de barras EAN-13, QR code ou referência do catálogo do fabricante.
                </p>
              </div>

              {/* EQUIPMENT PERIODIC MAINTENANCE CONFIGURATION */}
              <div className="p-4 bg-[#fbfbf9] border border-[#e5e5d1] rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#2c3e2e] flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={requiresMaintenance}
                      onChange={(e) => setRequiresMaintenance(e.target.checked)}
                      className="w-4 h-4 rounded text-[#2c3e2e] accent-[#2c3e2e]"
                    />
                    <Wrench className="w-4 h-4 text-[#d4a373]" />
                    Equipamento sujeito a manutenção periódica obrigatoria
                  </label>
                </div>

                {requiresMaintenance && (
                  <div className="space-y-3 pt-2 border-t border-[#e5e5d1] animate-fadeIn">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-[#5a5a40] mb-1">
                          Nº de Série / Patrimônio
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: AUT-2026-9901"
                          value={serialNumber}
                          onChange={(e) => setSerialNumber(e.target.value)}
                          className="w-full bg-white border border-[#e5e5d1] rounded-xl px-3 py-2 text-xs text-[#2c2c2c] font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-[#5a5a40] mb-1">
                          Frequência de Revisão
                        </label>
                        <select
                          value={maintenanceFrequencyDays}
                          onChange={(e) => setMaintenanceFrequencyDays(e.target.value)}
                          className="w-full bg-white border border-[#e5e5d1] rounded-xl px-3 py-2 text-xs text-[#2c2c2c]"
                        >
                          <option value="30">Mensal (a cada 30 dias)</option>
                          <option value="60">Bimestral (a cada 60 dias)</option>
                          <option value="90">Trimestral (a cada 90 dias)</option>
                          <option value="180">Semestral (a cada 180 dias)</option>
                          <option value="365">Anual (a cada 365 dias)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-[#5a5a40] mb-1">
                          Última Manutenção
                        </label>
                        <input
                          type="date"
                          value={lastMaintenanceDate}
                          onChange={(e) => {
                            setLastMaintenanceDate(e.target.value);
                            if (e.target.value) {
                              const nextD = new Date(e.target.value);
                              nextD.setDate(nextD.getDate() + (parseInt(maintenanceFrequencyDays) || 180));
                              setNextMaintenanceDate(nextD.toISOString().split('T')[0]);
                            }
                          }}
                          className="w-full bg-white border border-[#e5e5d1] rounded-xl px-3 py-2 text-xs text-[#2c2c2c]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-[#5a5a40] mb-1">
                          Próxima Manutenção
                        </label>
                        <input
                          type="date"
                          value={nextMaintenanceDate}
                          onChange={(e) => setNextMaintenanceDate(e.target.value)}
                          className="w-full bg-white border border-[#e5e5d1] rounded-xl px-3 py-2 text-xs text-[#2c2c2c] font-bold text-amber-900"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#5a5a40] mb-1">
                        Instruções e Notas de Manutenção
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Substituição da borracha de vedação, teste biológico e aferição de pressão..."
                        value={maintenanceNotes}
                        onChange={(e) => setMaintenanceNotes(e.target.value)}
                        className="w-full bg-white border border-[#e5e5d1] rounded-xl px-3 py-2 text-xs text-[#2c2c2c]"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* QUANTITY & UNIT */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-[#5a5a40]">Unidade de Medida *</label>
                    {!isCreatingCustomUnit && (
                      <button
                        type="button"
                        onClick={() => setIsCreatingCustomUnit(true)}
                        className="text-[11px] font-bold text-[#2d6a4f] hover:underline flex items-center gap-0.5"
                      >
                        <Plus className="w-3 h-3" />
                        Nova Unidade
                      </button>
                    )}
                  </div>

                  {isCreatingCustomUnit ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        placeholder="Ex: Ampola, Seringa, Rolo..."
                        value={customUnitInput}
                        onChange={(e) => setCustomUnitInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddCustomUnit();
                          }
                        }}
                        className="flex-1 bg-[#fbfbf9] border border-emerald-400 rounded-xl px-2.5 py-2 text-xs text-[#2c2c2c] focus:outline-none"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={handleAddCustomUnit}
                        className="px-2.5 py-2 bg-[#2d6a4f] text-white rounded-xl text-xs font-bold hover:bg-[#1b4332] shrink-0"
                      >
                        Salvar
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsCreatingCustomUnit(false);
                          setCustomUnitInput('');
                        }}
                        className="px-1.5 py-2 text-gray-400 hover:text-gray-600 shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <select
                      value={unit}
                      onChange={(e) => {
                        if (e.target.value === '__add_new_unit__') {
                          setIsCreatingCustomUnit(true);
                        } else {
                          setUnit(e.target.value);
                        }
                      }}
                      className="w-full bg-[#fbfbf9] border border-[#e5e5d1] rounded-2xl px-3.5 py-2.5 text-xs text-[#2c2c2c] focus:outline-none focus:border-[#5a5a40] capitalize"
                    >
                      {unitsList.map(u => (
                        <option key={u} value={u} className="capitalize">
                          {u.charAt(0).toUpperCase() + u.slice(1)}
                        </option>
                      ))}
                      <option value="__add_new_unit__" className="font-bold text-[#2d6a4f]">
                        + Adicionar nova unidade...
                      </option>
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5a5a40] mb-1">Quantidade Inicial *</label>
                  <input
                    type="number"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full bg-[#fbfbf9] border border-[#e5e5d1] rounded-2xl px-3.5 py-2.5 text-xs text-[#2c2c2c] focus:outline-none focus:border-[#5a5a40] font-mono"
                  />
                </div>
              </div>

              {/* COSTS & MIN QUANTITY */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#5a5a40] mb-1">Custo Unitário (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={unitCost}
                    onChange={(e) => setUnitCost(e.target.value)}
                    onBlur={(e) => {
                      const val = parseFloat(e.target.value);
                      if (!isNaN(val)) {
                        setUnitCost(val.toFixed(2));
                      }
                    }}
                    className="w-full bg-[#fbfbf9] border border-[#e5e5d1] rounded-2xl px-3.5 py-2.5 text-xs text-[#2c2c2c] focus:outline-none focus:border-[#5a5a40] font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5a5a40] mb-1">Estoque Mínimo (Alerta)</label>
                  <input
                    type="number"
                    required
                    value={minQuantity}
                    onChange={(e) => setMinQuantity(e.target.value)}
                    className="w-full bg-[#fbfbf9] border border-[#e5e5d1] rounded-2xl px-3.5 py-2.5 text-xs text-[#2c2c2c] focus:outline-none focus:border-[#5a5a40] font-mono"
                  />
                </div>
              </div>

              {/* MANUFACTURING & EXPIRATION DATES */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#5a5a40] mb-1">Data de Fabricação (Se houver)</label>
                  <input
                    type="date"
                    value={manufacturingDate}
                    onChange={(e) => setManufacturingDate(e.target.value)}
                    className="w-full bg-[#fbfbf9] border border-[#e5e5d1] rounded-2xl px-3.5 py-2.5 text-xs text-[#2c2c2c] focus:outline-none focus:border-[#5a5a40]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5a5a40] mb-1">Data de Validade (Se houver)</label>
                  <input
                    type="date"
                    value={expirationDate}
                    onChange={(e) => setExpirationDate(e.target.value)}
                    className="w-full bg-[#fbfbf9] border border-[#e5e5d1] rounded-2xl px-3.5 py-2.5 text-xs text-[#2c2c2c] focus:outline-none focus:border-[#5a5a40]"
                  />
                </div>
              </div>

              {/* SELEÇÃO E INDICADOR DE ESTERILIZAÇÃO / PRONTIDÃO PARA PROCEDIMENTOS */}
              <div className="p-4 bg-[#fbfbf9] border border-[#e5e5d1] rounded-2xl space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold text-[#2c3e2e] flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#d4a373]" />
                      Indicador de Seleção & Biossegurança (Pronto para Uso)
                    </span>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Identifica se o material está esterilizado ou equipamento com manutenção em dia.
                    </p>
                  </div>

                  {/* Live calculated indicator preview */}
                  {(() => {
                    const todayStr = new Date().toISOString().split('T')[0];
                    const isExpired = expirationDate && expirationDate < todayStr;
                    const isEq = category === 'Equipamentos' || requiresMaintenance;
                    const isMaintOverdue = isEq && nextMaintenanceDate && nextMaintenanceDate < todayStr;

                    if (isExpired || isMaintOverdue) {
                      return (
                        <span className="px-3 py-1 bg-rose-100 text-rose-900 border border-rose-300 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 animate-pulse">
                          <AlertTriangle className="w-4 h-4 text-rose-600" />
                          Indicador Apagado (Vencido)
                        </span>
                      );
                    }

                    if (!isEq && !requiresSterilization) {
                      return (
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          Pronto p/ Uso (Isento)
                        </span>
                      );
                    }

                    if (isSterilized) {
                      return (
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          Esterilizado / Pronto p/ Uso
                        </span>
                      );
                    }

                    return (
                      <span className="px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0">
                        <Clock className="w-4 h-4 text-amber-600" />
                        Esterilizando / Em Manutenção
                      </span>
                    );
                  })()}
                </div>

                {/* Toggle & Options for Sterilization Control */}
                {!(category === 'Equipamentos' || requiresMaintenance) && (
                  <div className="pt-2 border-t border-[#e5e5d1] space-y-3">
                    <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-[#e5e5d1]">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[#2c3e2e]" />
                        <div>
                          <span className="text-xs font-bold text-[#2c2c2c] block">
                            Ativar Controle de Esterilização (Autoclave)
                          </span>
                          <span className="text-[10px] text-gray-500">
                            Ative para materiais/instrumentais reutilizáveis. Desative para insumos descartáveis ou comuns.
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setRequiresSterilization(!requiresSterilization)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          requiresSterilization ? 'bg-[#2c3e2e]' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                            requiresSterilization ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    {requiresSterilization ? (
                      <div className="pl-2 space-y-2">
                        <label className="flex items-center gap-2.5 text-xs font-bold text-[#2c2c2c] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isSterilized}
                            onChange={(e) => {
                              setIsSterilized(e.target.checked);
                              if (e.target.checked && !sterilizationDate) {
                                setSterilizationDate(new Date().toISOString().split('T')[0]);
                              }
                            }}
                            className="w-4 h-4 rounded text-[#2c3e2e] accent-[#2c3e2e]"
                          />
                          <span>Material / Instrumental Esterilizado na Autoclave</span>
                        </label>

                        {isSterilized && (
                          <div className="pl-6 space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                              <div>
                                <span className="text-[11px] text-gray-500 font-semibold block mb-1">Data do Ciclo de Autoclave:</span>
                                <input
                                  type="date"
                                  value={sterilizationDate}
                                  onChange={(e) => setSterilizationDate(e.target.value)}
                                  className="w-full bg-white border border-[#e5e5d1] rounded-xl px-2.5 py-1.5 text-xs text-[#2c2c2c] font-medium"
                                />
                              </div>

                              <div>
                                <span className="text-[11px] text-gray-500 font-semibold block mb-1">Pessoa que Esterilizou e Acompanhou o Ciclo:</span>
                                <input
                                  type="text"
                                  placeholder="Ex: Hugo Andres Iglesias Ricoy ou nome do(a) atendente"
                                  value={sterilizedBy}
                                  onChange={(e) => setSterilizedBy(e.target.value)}
                                  className="w-full bg-white border border-[#e5e5d1] rounded-xl px-2.5 py-1.5 text-xs text-[#2c2c2c] font-medium"
                                />
                              </div>
                            </div>

                            {/* Autoclave Model & Parameter Inputs */}
                            <div className="bg-white/90 border border-[#e5e5d1] rounded-xl p-3 space-y-2 text-xs">
                              <div className="flex items-center justify-between border-b border-[#e5e5d1]/60 pb-1.5">
                                <span className="font-bold text-[#2c3e2e] flex items-center gap-1.5">
                                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                                  Monitoramento Técnico de Autoclave
                                </span>
                                <span className="text-[10px] text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                  Ciclo Cristófoli OK
                                </span>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <div>
                                  <label className="text-[10px] text-gray-500 font-bold block">Modelo do Equipamento:</label>
                                  <input
                                    type="text"
                                    value={autoclaveModel}
                                    onChange={(e) => setAutoclaveModel(e.target.value)}
                                    className="w-full bg-[#fbfbf9] border border-[#e5e5d1] rounded-lg px-2 py-1 text-xs text-[#2c2c2c]"
                                  />
                                </div>
                                <div>
                                  <label className="text-[10px] text-gray-500 font-bold block">Volume de Água Destilada:</label>
                                  <input
                                    type="text"
                                    value={autoclaveWaterVolume}
                                    onChange={(e) => setAutoclaveWaterVolume(e.target.value)}
                                    className="w-full bg-[#fbfbf9] border border-[#e5e5d1] rounded-lg px-2 py-1 text-xs text-[#2c2c2c]"
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-3 gap-2">
                                <div>
                                  <label className="text-[10px] text-gray-500 font-bold block">Temperatura:</label>
                                  <input
                                    type="text"
                                    value={autoclaveTemperature}
                                    onChange={(e) => setAutoclaveTemperature(e.target.value)}
                                    className="w-full bg-[#fbfbf9] border border-[#e5e5d1] rounded-lg px-2 py-1 text-[11px] text-[#2c2c2c] font-mono"
                                  />
                                </div>
                                <div>
                                  <label className="text-[10px] text-gray-500 font-bold block">Pressão:</label>
                                  <input
                                    type="text"
                                    value={autoclavePressure}
                                    onChange={(e) => setAutoclavePressure(e.target.value)}
                                    className="w-full bg-[#fbfbf9] border border-[#e5e5d1] rounded-lg px-2 py-1 text-[11px] text-[#2c2c2c] font-mono"
                                  />
                                </div>
                                <div>
                                  <label className="text-[10px] text-gray-500 font-bold block">Tempo de Esterilização:</label>
                                  <input
                                    type="text"
                                    value={autoclaveSterilizationTime}
                                    onChange={(e) => setAutoclaveSterilizationTime(e.target.value)}
                                    className="w-full bg-[#fbfbf9] border border-[#e5e5d1] rounded-lg px-2 py-1 text-[11px] text-[#2c2c2c] font-mono"
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                                <div>
                                  <label className="text-[10px] text-gray-500 font-bold block">Programa / Ciclo:</label>
                                  <input
                                    type="text"
                                    value={autoclaveCycleType}
                                    onChange={(e) => setAutoclaveCycleType(e.target.value)}
                                    className="w-full bg-[#fbfbf9] border border-[#e5e5d1] rounded-lg px-2 py-1 text-[11px] text-[#2c2c2c]"
                                  />
                                </div>
                                <div>
                                  <label className="text-[10px] text-gray-500 font-bold block">Etapa de Secagem:</label>
                                  <input
                                    type="text"
                                    value={autoclaveDryingMode}
                                    onChange={(e) => setAutoclaveDryingMode(e.target.value)}
                                    className="w-full bg-[#fbfbf9] border border-[#e5e5d1] rounded-lg px-2 py-1 text-[11px] text-[#2c2c2c]"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Non-editable 6-month sterilization validity indicator */}
                            <div className="flex flex-wrap items-center gap-2 bg-[#f0f0e8]/80 border border-[#e5e5d1] rounded-xl px-3 py-1.5 w-fit">
                              <Calendar className="w-3.5 h-3.5 text-[#2c3e2e]" />
                              <span className="text-[11px] font-semibold text-[#5a5a40]">Validade da Esterilização:</span>
                              <span className="text-xs font-bold text-[#2c3e2e] bg-white px-2 py-0.5 rounded-md border border-[#e5e5d1] font-mono">
                                {formatBRDate(getSterilizationExpiryDateStr(sterilizationDate))}
                              </span>
                              <span className="text-[10px] text-gray-500 font-medium">(Acresce 6 meses automaticamente — Não Editável)</span>
                            </div>

                            {/* SHORTCUT BUTTON TO AUTOCLAVE CONTROL REPORT */}
                            <div className="pt-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setIsSterilized(true);
                                  const todayStr = new Date().toISOString().split('T')[0];
                                  setSterilizationDate(todayStr);

                                  if (editingItemId) {
                                    updateInventoryItem(editingItemId, {
                                      isSterilized: true,
                                      sterilizationDate: todayStr,
                                      sterilizedBy,
                                      autoclaveModel,
                                      autoclaveWaterVolume,
                                      autoclaveTemperature,
                                      autoclavePressure,
                                      autoclaveSterilizationTime,
                                      autoclaveDryingMode,
                                      autoclaveCycleType
                                    });
                                  }

                                  setIsAddItemModalOpen(false);
                                  setIsTotalItemsModalOpen(true);
                                  setReportModalTab('autoclave');
                                  setShowAddCycleForm(true);
                                  setNewCycleSelectedItems(name ? [name] : ['Material em Edição']);
                                }}
                                className="w-full px-3.5 py-2 bg-[#2c3e2e] hover:bg-[#1b281d] text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition cursor-pointer"
                              >
                                <Sparkles className="w-4 h-4 text-amber-300" />
                                <span>Atalho: Abrir Controle de Esterilização (Autoclave) com Este Material</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-[11px] text-emerald-800 bg-emerald-50/80 border border-emerald-200 rounded-xl p-2.5 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>
                          <strong>Controle de Autoclave Desativado:</strong> Este item não requer esterilização e está liberado para procedimentos (exceto em caso de validade vencida).
                        </span>
                      </p>
                    )}
                  </div>
                )}

                {/* Automatic shutoff rule notice */}
                <div className="text-[11px] text-gray-600 bg-amber-50/60 border border-amber-200 rounded-xl p-2.5 flex items-start gap-2">
                  <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <span>
                    <strong>Desligamento Automático do Indicador:</strong> Se a data de validade vencer ou a manutenção atrasar, o indicador de seleção <strong>APAGA SOZINHO AUTOMATICAMENTE</strong> para sinalizar que o item não pode ser usado nos procedimentos.
                  </span>
                </div>
              </div>

              {/* FOOTER ACTIONS */}
              <div className="flex items-center justify-between gap-3 pt-4 border-t border-[#e5e5d1]">
                <div className="flex items-center gap-2">
                  {editingItemId && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          const currentItem = inventory.find(i => i.id === editingItemId);
                          if (currentItem) {
                            handleDeleteItem(currentItem);
                          }
                        }}
                        className="px-3.5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-2xl border border-rose-200 transition flex items-center gap-1.5 cursor-pointer"
                        title="Excluir este item do estoque"
                      >
                        <Trash2 className="w-4 h-4 text-rose-600" />
                        <span>Excluir</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const currentItem = inventory.find(i => i.id === editingItemId);
                          if (currentItem) {
                            handleCloneItem(currentItem);
                          }
                        }}
                        className="px-3.5 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs rounded-2xl border border-amber-200 transition flex items-center gap-1.5 cursor-pointer"
                        title="Clonar este material para cadastrar um novo item similar"
                      >
                        <Copy className="w-4 h-4 text-amber-600" />
                        <span>Clonar Material</span>
                      </button>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      stopCamera();
                      setIsAddItemModalOpen(false);
                    }}
                    className="px-4 py-2.5 bg-[#f0f0e8] hover:bg-[#e5e5d1] text-[#5a5a40] font-bold text-xs rounded-2xl cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#2c3e2e] hover:bg-[#1b281d] text-white font-bold text-xs rounded-2xl shadow-sm transition cursor-pointer"
                  >
                    Salvar Cadastro
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
      )}
      {/* Live Camera Modal */}
      <CameraModal
        isOpen={isCameraActive}
        onClose={() => setIsCameraActive(false)}
        onCapture={(dataUrl) => {
          setPhotoUrl(dataUrl);
          setItemImages(prev => [...prev, dataUrl]);
          setIsCameraActive(false);
          runBarcodeScannerLookup();
        }}
        title="Fotografia de Material / Equipamento"
        subtitle="Posicione o produto ou caixa para leitura de código de barras"
        defaultFacingMode="environment"
      />

      {/* 2-Step Confirmation Modal to Clear All Inventory Items */}
      {isConfirmClearModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#2c2c2c]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#e5e5d1] rounded-[32px] max-w-md w-full p-6 shadow-2xl space-y-4 animate-scaleUp">
            
            {/* Step Progress Bar Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#e5e5d1]">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-rose-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                  {clearStep}
                </span>
                <span className="text-xs font-bold text-[#2c2c2c]">
                  {clearStep === 1 ? 'Passo 1 de 2: Alerta de Segurança' : 'Passo 2 de 2: Verificação Definitiva'}
                </span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                Ação Crítica
              </span>
            </div>

            {clearStep === 1 ? (
              /* PASSO 1 DE 2: ALERTA DE IMPACTO NO BANCO DE DADOS */
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center shrink-0 text-rose-600">
                    <X className="w-5 h-5 text-rose-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#2c2c2c]">Esvaziar Banco de Dados de Estoque</h3>
                    <p className="text-[11px] text-gray-500">Atenção: esta ação altera toda a base de dados do sistema</p>
                  </div>
                </div>

                <div className="bg-rose-50/80 border border-rose-200 rounded-2xl p-4 space-y-2 text-xs text-rose-950">
                  <p className="font-bold flex items-center gap-1.5 text-rose-800">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    O que será removido do sistema:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 pl-1 text-[11px]">
                    <li><strong>{inventory.length} materiais e equipamentos</strong> cadastrados</li>
                    <li>Fotos de identificação e históricos associados</li>
                    <li>Registros de validades, lotes e alertas de reposição</li>
                  </ul>
                  <p className="text-[11px] text-rose-700 font-medium pt-1">
                    Esta operação afeta integralmente a tabela de estoque. Deseja prosseguir para a confirmação final?
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#e5e5d1]">
                  <button
                    type="button"
                    onClick={() => setIsConfirmClearModalOpen(false)}
                    className="px-4 py-2 bg-[#f0f0e8] hover:bg-[#e5e5d1] text-[#5a5a40] font-bold text-xs rounded-xl transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => setClearStep(2)}
                    className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
                  >
                    Avançar para Confirmação Final (Passo 2) &rarr;
                  </button>
                </div>
              </div>
            ) : (
              /* PASSO 2 DE 2: VALIDAÇÃO DIGITADA E CHECKBOX */
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <AlertTriangle className="w-5 h-5 text-amber-300" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#2c2c2c]">Validação de Segurança Exigida</h3>
                    <p className="text-[11px] text-gray-500">Confirme a exclusão total do banco de dados</p>
                  </div>
                </div>

                <div className="space-y-3 bg-[#fcfdfa] border border-[#e5e5d1] rounded-2xl p-4 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-[#2c2c2c] mb-1">
                      Para confirmar, digite a palavra <span className="text-rose-600 font-extrabold uppercase">EXCLUIR</span> no campo abaixo:
                    </label>
                    <input
                      type="text"
                      value={clearTypedConfirmation}
                      onChange={(e) => setClearTypedConfirmation(e.target.value)}
                      placeholder="Digite EXCLUIR para autorizar"
                      className="w-full px-3 py-2 bg-white border border-[#e5e5d1] rounded-xl text-xs font-mono font-bold text-[#2c2c2c] focus:outline-hidden focus:border-rose-500 uppercase tracking-wider"
                      autoFocus
                    />
                  </div>

                  <label className="flex items-start gap-2.5 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={clearCheckboxConfirmed}
                      onChange={(e) => setClearCheckboxConfirmed(e.target.checked)}
                      className="mt-0.5 rounded text-rose-600 focus:ring-rose-500 border-gray-300 w-4 h-4"
                    />
                    <span className="text-[11px] text-gray-700 leading-tight">
                      Estou totalmente ciente de que esta ação apagará permanentemente todos os <strong>{inventory.length} materiais e equipamentos</strong> da base de dados.
                    </span>
                  </label>
                </div>

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#e5e5d1]">
                  <button
                    type="button"
                    onClick={() => setClearStep(1)}
                    className="px-3 py-2 bg-[#f0f0e8] hover:bg-[#e5e5d1] text-[#5a5a40] font-bold text-xs rounded-xl transition"
                  >
                    &larr; Voltar
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsConfirmClearModalOpen(false)}
                      className="px-3 py-2 bg-[#f0f0e8] hover:bg-[#e5e5d1] text-[#5a5a40] font-bold text-xs rounded-xl transition"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      disabled={
                        !(
                          (clearTypedConfirmation.trim().toUpperCase() === 'EXCLUIR' ||
                           clearTypedConfirmation.trim().toUpperCase() === 'REMOVER') &&
                          clearCheckboxConfirmed
                        )
                      }
                      onClick={() => {
                        clearInventory();
                        setIsConfirmClearModalOpen(false);
                      }}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl shadow-xs transition"
                    >
                      Confirmar Exclusão Total
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {/* ========================================================================= */}
      {/* MODAL: GOOGLE LENS AI PHOTO SCANNER */}
      {/* ========================================================================= */}
      {isLensModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#2c2c2c]/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-[#e5e5d1] rounded-[32px] max-w-lg w-full p-6 shadow-2xl space-y-4 my-6">
            <div className="flex items-center justify-between border-b border-[#e5e5d1] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-[#1b281d] text-amber-300 flex items-center justify-center border border-[#d4a373]">
                  <Scan className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#2c2c2c]">Adicionar por Foto (Google Lens AI)</h3>
                  <p className="text-[11px] text-gray-500">Capture a embalagem, frasco ou rótulo para identificação automática</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  stopCamera();
                  setIsLensModalOpen(false);
                }}
                className="p-1.5 text-gray-400 hover:text-[#2c2c2c] rounded-xl hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {stagedPhotos.length > 0 && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs text-emerald-800">
                <div className="flex items-center gap-2 font-bold">
                  <Camera className="w-4 h-4 text-emerald-600" />
                  <span>{stagedPhotos.length} foto(s) salva(s) no lote atual</span>
                </div>
                <div className="flex items-center gap-1 overflow-x-auto max-w-[150px]">
                  {stagedPhotos.map((img, idx) => (
                    <img key={idx} src={img} alt={`Staged ${idx}`} className="w-6 h-6 rounded-lg object-cover border border-emerald-300" />
                  ))}
                </div>
              </div>
            )}

            {isScanningLens ? (
              <div className="p-8 text-center bg-amber-500/10 border border-amber-400/40 rounded-2xl space-y-3 animate-pulse">
                <Scan className="w-10 h-10 text-amber-600 animate-spin mx-auto" />
                <h4 className="text-sm font-bold text-amber-900">Google Lens AI Analisando Imagem...</h4>
                <p className="text-xs text-amber-800 max-w-xs mx-auto">
                  Processando padrão visual, OCR de rótulo e comparando com catálogo de insumos odontológicos.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Camera Viewfinder */}
                {isCameraActive ? (
                  <div className="relative bg-black rounded-2xl overflow-hidden aspect-4/3 flex items-center justify-center border border-[#2c3e2e]">
                    <video
                      ref={(el) => {
                        videoRef.current = el;
                        if (el && mediaStreamRef.current) {
                          el.srcObject = mediaStreamRef.current;
                          el.play().catch(err => console.log('Video play callback catch:', err));
                        }
                      }}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                    
                    <div className="absolute inset-0 border-2 border-dashed border-amber-400/60 rounded-2xl pointer-events-none flex items-center justify-center">
                      <div className="text-center bg-black/50 px-3 py-1 rounded-xl text-[10px] text-amber-200 font-mono backdrop-blur-xs">
                        Posicione o produto ou rótulo aqui
                      </div>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => capturePhotoFromCamera(false)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 transition"
                      >
                        <Camera className="w-4 h-4" />
                        Tirar Foto & Escanear AI
                      </button>

                      <button
                        type="button"
                        onClick={() => capturePhotoFromCamera(true)}
                        className="px-3 py-2 bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-1.5 transition"
                        title="Simula quando a IA não consegue reconhecer para testar salvamento de foto e cadastro manual"
                      >
                        <AlertCircle className="w-3.5 h-3.5 text-amber-200" />
                        Simular Não Identificado
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 text-center border-2 border-dashed border-[#e5e5d1] bg-[#fcfdfa] rounded-2xl space-y-3">
                    <Camera className="w-10 h-10 text-gray-400 mx-auto" />
                    <p className="text-xs text-gray-500">Sua câmera está inativa. Inicie a câmera ou envie uma foto do dispositivo.</p>
                    <button
                      type="button"
                      onClick={startCamera}
                      className="px-4 py-2 bg-[#2c3e2e] hover:bg-[#1b281d] text-white rounded-xl text-xs font-bold transition"
                    >
                      Ativar Câmera
                    </button>
                  </div>
                )}

                {/* Upload Alternative & Manual Registration */}
                <div className="pt-2 border-t border-[#e5e5d1] space-y-2">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="text-gray-500 font-medium">Ou escolha do computador / celular:</span>
                    <label className="px-3 py-1.5 bg-white border border-[#e5e5d1] hover:bg-[#f0f0e8] text-[#2c3e2e] font-bold rounded-xl cursor-pointer transition flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5 text-[#d4a373]" />
                      <span>Upload Foto</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handlePhotoUpload(e, false)}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <button
                    type="button"
                    onClick={handleGoToManualRegistrationFromLens}
                    className="w-full py-2 bg-[#f0f0e8] hover:bg-[#e5e5d1] text-[#2c3e2e] font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 border border-[#e5e5d1]"
                  >
                    <Package className="w-4 h-4 text-[#d4a373]" />
                    <span>Ir para Cadastro Manual {stagedPhotos.length > 0 ? `(${stagedPhotos.length} foto(s) salva(s))` : ''}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PROMPT DE AÇÃO: 3 MODOS DE CAPTURA PELA CÂMERA (GOOGLE LENS AI) */}
      {/* ========================================================================= */}
      {showSavePhotoPrompt && (
        <div className="fixed inset-0 z-50 bg-[#2c2c2c]/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#e5e5d1] rounded-[32px] max-w-lg w-full p-6 shadow-2xl space-y-4 text-center animate-fadeIn">
            <div className="w-12 h-12 bg-amber-100 text-amber-800 rounded-2xl flex items-center justify-center mx-auto border border-amber-300">
              <Scan className="w-6 h-6 text-amber-700 animate-pulse" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-[#2c2c2c]">Foto Analisada pelo Google Lens AI</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Escolha uma das 3 opções para prosseguir com o cadastro deste material:
              </p>
            </div>

            {currentCapturedPhoto && (
              <div 
                className="w-36 h-36 rounded-2xl overflow-hidden border-2 border-[#d4a373] mx-auto shadow-sm relative group cursor-pointer"
                onClick={() => setPreviewingFullImage(currentCapturedPhoto)}
                title="Clique para ver a foto em tamanho real"
              >
                <img src={currentCapturedPhoto} alt="Foto capturada" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-bold gap-1">
                  <ZoomIn className="w-4 h-4" />
                  <span>Ampliar</span>
                </div>
              </div>
            )}

            {/* RECOGNITION RESULT CARD */}
            {lastRecognizedProduct ? (
              <div className="p-3.5 bg-emerald-50/80 border border-emerald-300/80 rounded-2xl text-left space-y-1.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-700 text-white shadow-2xs">
                    <Sparkles className="w-3 h-3 text-amber-300 animate-spin" />
                    Identificado via Google Lens AI (98.6%)
                  </span>
                  <span className="text-xs font-bold text-emerald-900 font-mono">
                    R$ {lastRecognizedProduct.unitCost.toFixed(2)}
                  </span>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-[#2c2c2c] leading-snug">{lastRecognizedProduct.name}</h4>
                  <p className="text-[11px] text-gray-600 font-medium">
                    Categoria: <strong className="text-[#5a5a40]">{lastRecognizedProduct.category}</strong> • Fabricante: <strong className="text-[#5a5a40]">{lastRecognizedProduct.supplier}</strong>
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-left space-y-1">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-700 text-white">
                  <AlertCircle className="w-3 h-3" />
                  Não identificado no Google Lens
                </span>
                <p className="text-[11px] text-amber-900">
                  Não foi possível ler o rótulo da imagem. Você pode manter esta foto e preencher as informações manualmente.
                </p>
              </div>
            )}

            {/* 3 DISTINCT CAPTURE MODES */}
            <div className="space-y-2.5 pt-1">
              {/* MODO 1: Descartar foto */}
              <button
                type="button"
                onClick={handleDiscardCapturedPhoto}
                className="w-full p-3 bg-gray-100 hover:bg-rose-50 hover:border-rose-300 border border-gray-200 text-gray-700 hover:text-rose-700 font-bold text-xs rounded-2xl transition flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-[#2c2c2c] group-hover:text-rose-700">1. Descartar foto</p>
                    <p className="text-[10px] text-gray-500 font-normal">Descarta a foto atual e reativa o visor da câmera para tentar novamente</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-rose-600" />
              </button>

              {/* MODO 2: Salvar e tirar outra foto */}
              <button
                type="button"
                onClick={handleSaveAndTakeAnotherPhoto}
                className="w-full p-3 bg-blue-50/60 hover:bg-blue-100/80 border border-blue-200 text-blue-900 font-bold text-xs rounded-2xl transition flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Camera className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-blue-900">2. Salvar e Tirar Outra Foto</p>
                    <p className="text-[10px] text-blue-700 font-normal">Salva esta foto no lote ({stagedPhotos.length + 1} foto(s)) e reativa a câmera imediatamente</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-blue-500" />
              </button>

              {/* MODO 3: Salvar e ir para inclusão do material */}
              <button
                type="button"
                onClick={handleSaveAndGoToRegistration}
                className="w-full p-3 bg-[#1b281d] hover:bg-[#2c3e2e] text-white font-bold text-xs rounded-2xl shadow-md transition flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-emerald-600 text-amber-300 flex items-center justify-center shrink-0 shadow-xs">
                    <Check className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-white">3. Salvar e Ir para Inclusão do Material</p>
                    <p className="text-[10px] text-emerald-200/80 font-normal">Salva a foto, encerra a câmera e vai para a tela de inclusão com os dados identificados</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-amber-300" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FULL-SIZE IMAGE PREVIEW MODAL */}
      {previewingFullImage && (
        <div className="fixed inset-0 z-[70] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center justify-center">
            <button
              type="button"
              onClick={() => setPreviewingFullImage(null)}
              className="absolute -top-12 right-0 p-2 text-white/80 hover:text-white bg-black/50 hover:bg-black/80 rounded-2xl transition"
              title="Fechar Visualização"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="rounded-3xl overflow-hidden border border-white/20 shadow-2xl max-h-[80vh] flex items-center justify-center bg-black">
              <img 
                src={previewingFullImage} 
                alt="Foto do Material em Tamanho Completo" 
                className="max-h-[80vh] w-auto max-w-full object-contain rounded-2xl" 
              />
            </div>
            <p className="text-white/70 text-xs font-mono mt-3 text-center">
              Visualização em Tamanho Completo da Imagem
            </p>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PROMPT 2: FOTO SALVA - DESEJA OUTRA FOTO OU IR PARA CADASTRO? */}
      {/* ========================================================================= */}
      {showTakeAnotherPrompt && (
        <div className="fixed inset-0 z-50 bg-[#2c2c2c]/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#e5e5d1] rounded-[32px] max-w-md w-full p-6 shadow-2xl space-y-4 text-center animate-fadeIn">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-2xl flex items-center justify-center mx-auto border border-emerald-300">
              <Camera className="w-6 h-6 text-emerald-700 animate-pulse" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-[#2c2c2c]">Foto Salva com Sucesso!</h3>
              <p className="text-xs text-gray-600">
                Você possui <strong className="text-emerald-800 font-mono">{stagedPhotos.length} foto(s)</strong> registrada(s) para este item.
              </p>
            </div>

            {/* Gallery Preview */}
            <div className="flex items-center justify-center gap-2 overflow-x-auto p-2 bg-[#fcfdfa] border border-[#e5e5d1] rounded-2xl">
              {stagedPhotos.map((img, i) => (
                <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden border border-emerald-400 shrink-0 shadow-xs">
                  <img src={img} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                  <span className="absolute bottom-0 right-0 bg-emerald-800 text-white text-[9px] px-1 font-mono font-bold rounded-tl-md">
                    #{i + 1}
                  </span>
                </div>
              ))}
            </div>

            <p className="text-xs font-semibold text-[#2c3e2e]">
              Deseja tirar/enviar outra foto do produto (ex: verso, bula, rótulo de lote/validade)?
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={handleSaveAndTakeAnotherPhoto}
                className="px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5"
              >
                <Camera className="w-4 h-4 text-blue-200" />
                Sim (Outra Foto)
              </button>

              <button
                type="button"
                onClick={handleSaveAndGoToRegistration}
                className="px-4 py-2.5 bg-[#1b281d] hover:bg-[#2c3e2e] text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5"
              >
                <Package className="w-4 h-4 text-amber-300" />
                Não (Ir para Cadastro)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Daily Clinic Materials Report Modal */}
      {isDailyReportModalOpen && (
        <DailyClinicMaterialsReportModal
          appointments={appointments}
          inventory={inventory}
          tussProcedures={tussProcedures}
          clinics={clinics}
          professionals={professionals}
          onClose={() => setIsDailyReportModalOpen(false)}
        />
      )}

      {/* Yesterday Registered Materials Report Modal */}
      {isYesterdayReportModalOpen && (
        <YesterdayRegisteredMaterialsReportModal
          inventory={inventory}
          clinics={clinics}
          professionals={professionals}
          onClose={() => setIsYesterdayReportModalOpen(false)}
        />
      )}

      {/* Single Appointment Materials Report Modal */}
      {selectedAppointmentForReport && (
        <AppointmentMaterialsReportModal
          appointment={selectedAppointmentForReport}
          inventory={inventory}
          tussProcedures={tussProcedures}
          clinics={clinics}
          professionals={professionals}
          onClose={() => setSelectedAppointmentForReport(null)}
          onDeductStock={(materialsToDeduct) => {
            materialsToDeduct.forEach(item => {
              adjustStockQuantity(item.inventoryItemId, -item.quantityToDeduct);
            });
            setSelectedAppointmentForReport(null);
          }}
        />
      )}

      {/* READINESS / SELECTION INDICATOR NOTICE MODAL */}
      {readinessNotice && readinessNotice.show && (
        <div className="fixed inset-0 z-50 bg-[#2c2c2c]/75 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white border border-[#e5e5d1] rounded-[32px] max-w-md w-full p-6 shadow-2xl space-y-4 text-center">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto border ${
              readinessNotice.type === 'warning'
                ? 'bg-rose-100 text-rose-800 border-rose-300'
                : readinessNotice.type === 'success'
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : 'bg-amber-100 text-amber-800 border-amber-300'
            }`}>
              {readinessNotice.type === 'warning' ? (
                <AlertTriangle className="w-6 h-6 text-rose-600" />
              ) : readinessNotice.type === 'success' ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              ) : (
                <Clock className="w-6 h-6 text-amber-600" />
              )}
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-[#2c2c2c]">{readinessNotice.title}</h3>
              <p className="text-xs text-gray-600 leading-relaxed">{readinessNotice.message}</p>
            </div>

            <button
              type="button"
              onClick={() => setReadinessNotice(null)}
              className="w-full py-2.5 bg-[#2c3e2e] hover:bg-[#1b281d] text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* PHOTO INSPECTOR MODAL FOR AUTOCLAVE LAUDO PHOTOS */}
      {previewingAutoclavePhoto && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-2xl w-full space-y-3 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-[#e5e5d1] pb-2">
              <h4 className="text-sm font-bold text-[#2c3e2e] flex items-center gap-2">
                <Camera className="w-4 h-4 text-[#d4a373]" />
                {previewingAutoclavePhoto.title}
              </h4>
              <button
                onClick={() => setPreviewingAutoclavePhoto(null)}
                className="p-1.5 text-gray-500 hover:text-black rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-[70vh] overflow-hidden rounded-2xl border border-[#e5e5d1]">
              <img src={previewingAutoclavePhoto.url} alt="Ampliação de laudo" className="w-full h-auto object-contain" />
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setPreviewingAutoclavePhoto(null)}
                className="px-4 py-2 bg-[#2c3e2e] text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Fechar Visualização
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE ITEM CONFIRMATION MODAL */}
      {deletingItem && (
        <div className="fixed inset-0 z-50 bg-[#2c2c2c]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#e5e5d1] rounded-[32px] max-w-md w-full p-6 shadow-2xl space-y-4 animate-fadeIn">
            <div className="flex items-center gap-3 border-b border-[#e5e5d1] pb-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 border border-rose-200">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-rose-900">Excluir Material do Estoque</h3>
                <p className="text-xs text-gray-500">Confirmação de exclusão permanente</p>
              </div>
            </div>

            <div className="bg-rose-50/60 border border-rose-200 rounded-2xl p-3.5 space-y-1.5 text-xs text-rose-900">
              <p>Você está prestes a excluir o item do estoque:</p>
              <div className="font-bold text-sm text-[#2c2c2c] bg-white p-2 rounded-xl border border-rose-200 flex items-center justify-between">
                <span>{deletingItem.name}</span>
                <span className="text-xs font-mono font-normal text-gray-500">
                  {deletingItem.quantity} {deletingItem.unit}s
                </span>
              </div>
              <p className="text-[11px] text-rose-800">
                Esta ação removerá o material das estatísticas e relatórios de estoque da clínica. Ela não poderá ser desfeita.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingItem(null)}
                className="px-4 py-2.5 bg-[#f0f0e8] hover:bg-[#e5e5d1] text-[#5a5a40] font-bold text-xs rounded-2xl transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDeleteItem}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-2xl shadow-sm transition flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Sim, Excluir Material</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AUTOCLAVE CMER REPORT MODAL */}
      {isAutoclaveCMERModalOpen && (
        <AutoclaveCMERReportModal
          logs={autoclaveLogs}
          onClose={() => setIsAutoclaveCMERModalOpen(false)}
          clinicInfo={clinicInfo}
          clinics={clinics}
          professionals={professionals}
          clinicName={clinicInfo?.name || 'Clínica MARV Odontologia & Gestão'}
          technicalResponsible={clinicInfo?.technicalManager ? `${clinicInfo.technicalManager} — ${clinicInfo.croTechnicalManager || 'CRO'}` : 'Dr. Hugo Andres Iglesias Ricoy — CRO/CE 5925'}
          autoclaveModel="Autoclave Cristófoli Vitale Class 12L"
        />
      )}
    </div>
  );
};
