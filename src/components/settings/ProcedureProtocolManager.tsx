import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TUSSProcedure, ProcedureMaterialRequirement } from '../../types';
import { REGION_LEGENDS, TOOTH_DICTIONARY, getRegionByCode } from '../../data/regionData';
import { parseCsvProcedures, parsePdfProcedures, ImportedProcedureRow } from '../../utils/procedureImportUtils';
import { 
  Stethoscope, 
  Search, 
  Plus, 
  Trash2, 
  Save, 
  Check, 
  Package, 
  UserCheck, 
  HeartHandshake, 
  FileText, 
  Sparkles,
  Info,
  BookOpen,
  Layers,
  ShieldCheck,
  Zap,
  RotateCcw,
  Building2,
  DollarSign,
  HelpCircle,
  CheckCircle2,
  Download,
  Printer,
  Copy,
  Percent,
  Sliders,
  ArrowRight,
  FileSpreadsheet,
  X,
  CheckSquare,
  Square,
  Filter,
  Camera,
  FileCheck,
  Clock,
  AlertCircle,
  UploadCloud,
  FileUp
} from 'lucide-react';

export const ProcedureProtocolManager: React.FC = () => {
  const { 
    tussProcedures, 
    addTussProcedure, 
    updateTussProcedure, 
    deleteTussProcedure, 
    inventory, 
    priceTables,
    addPriceTable,
    updatePriceTable,
    deletePriceTable
  } = useApp();

  const [selectedCode, setSelectedCode] = useState<string>(tussProcedures[0]?.code || '84000010');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSpecialtyFilter, setSelectedSpecialtyFilter] = useState<string>('todas');
  const [activeTab, setActiveTab] = useState<'materiais' | 'regioes' | 'geral' | 'profissional' | 'paciente'>('regioes');
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Convênio / Price Table Management State
  const [isAddingTable, setIsAddingTable] = useState<boolean>(false);
  const [newTableName, setNewTableName] = useState<string>('');
  const [newTableDesc, setNewTableDesc] = useState<string>('');

  const [editingTableId, setEditingTableId] = useState<string | null>(null);
  const [editingTableName, setEditingTableName] = useState<string>('');
  const [editingTableDesc, setEditingTableDesc] = useState<string>('');

  // Selected Convênio Card & Procedure List State
  const [selectedConvenioForDirective, setSelectedConvenioForDirective] = useState<string>('particular');
  const [selectedConvenioCardId, setSelectedConvenioCardId] = useState<string>('particular');
  const [selectedConvenioSearch, setSelectedConvenioSearch] = useState<string>('');

  // PDF / CSV Import Modal State
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [importingConvenioId, setImportingConvenioId] = useState<string | null>(null);
  const [importingFileName, setImportingFileName] = useState<string | null>(null);
  const [importPreviewRows, setImportPreviewRows] = useState<ImportedProcedureRow[]>([]);
  const [isParsingImportFile, setIsParsingImportFile] = useState<boolean>(false);
  const [importSuccessMessage, setImportSuccessMessage] = useState<string | null>(null);

  // Replicate & Bulk Adjustment State
  const [isReplicateModalOpen, setIsReplicateModalOpen] = useState<boolean>(false);
  const [replicateSourceTableId, setReplicateSourceTableId] = useState<string>('particular');
  const [replicateTargetTableIds, setReplicateTargetTableIds] = useState<string[]>([]);
  const [replicateMultiplier, setReplicateMultiplier] = useState<number>(100);
  const [replicateScope, setReplicateScope] = useState<'current' | 'specialty' | 'selected' | 'all'>('current');
  const [replicateSelectedCodes, setReplicateSelectedCodes] = useState<string[]>([]);
  const [replicateSearchQuery, setReplicateSearchQuery] = useState<string>('');

  // Active procedure object
  const activeProcedure = tussProcedures.find(p => p.code === selectedCode) || tussProcedures[0];

  // Local editing state for procedure form
  const [code, setCode] = useState<string>(activeProcedure?.code || '');
  const [tissCode, setTissCode] = useState<string>(activeProcedure?.tissCode || '');
  const [description, setDescription] = useState<string>(activeProcedure?.description || '');
  const [specialty, setSpecialty] = useState<string>(activeProcedure?.specialty || 'Dentística & Estética');
  const [suggestedCost, setSuggestedCost] = useState<number>(activeProcedure?.suggestedCost || 0);
  const [prices, setPrices] = useState<Record<string, number>>(activeProcedure?.prices || {});
  const [fullDescription, setFullDescription] = useState<string>(activeProcedure?.fullDescription || '');
  const [professionalGuidance, setProfessionalGuidance] = useState<string>(activeProcedure?.professionalGuidance || '');
  const [patientInstructions, setPatientInstructions] = useState<string>(activeProcedure?.patientInstructions || '');
  const [materialsList, setMaterialsList] = useState<ProcedureMaterialRequirement[]>(activeProcedure?.requiredMaterials || []);

  // Technical TUSS guidelines state
  const [requiresToothNumber, setRequiresToothNumber] = useState<boolean>(activeProcedure?.requiresToothNumber ?? true);
  const [toothFacesCount, setToothFacesCount] = useState<'1_face' | '2_faces' | '3_faces' | '4_ou_mais_faces' | 'nao_aplica'>(activeProcedure?.toothFacesCount || '1_face');
  const [anatomicalScope, setAnatomicalScope] = useState<'dente' | 'intra_oral' | 'extra_oral' | 'buco_maxilo_facial' | 'arcada_sextante'>(activeProcedure?.anatomicalScope || 'dente');

  // Audit and compliance guidelines state
  const [requiresInitialXRay, setRequiresInitialXRay] = useState<boolean>(activeProcedure?.requiresInitialXRay ?? false);
  const [requiresFinalXRay, setRequiresFinalXRay] = useState<boolean>(activeProcedure?.requiresFinalXRay ?? false);
  const [requiresClinicalPhoto, setRequiresClinicalPhoto] = useState<boolean>(activeProcedure?.requiresClinicalPhoto ?? false);
  const [recurrenceLimitMonths, setRecurrenceLimitMonths] = useState<number>(activeProcedure?.recurrenceLimitMonths || 0);
  const [auditNotes, setAuditNotes] = useState<string>(activeProcedure?.auditNotes || '');

  // Regional application rules state
  const [defaultRegion, setDefaultRegion] = useState<string>(activeProcedure?.defaultRegion || '');
  const [allowedRegions, setAllowedRegions] = useState<string[]>(activeProcedure?.allowedRegions || []);
  const [allowedRegionsByPriceTable, setAllowedRegionsByPriceTable] = useState<Record<string, string[]>>(activeProcedure?.allowedRegionsByPriceTable || {});
  const [regionRulesNote, setRegionRulesNote] = useState<string>(activeProcedure?.regionRulesNote || '');

  // Material addition inputs
  const [newMaterialName, setNewMaterialName] = useState<string>('');
  const [newMaterialQty, setNewMaterialQty] = useState<number>(1);
  const [newMaterialUnit, setNewMaterialUnit] = useState<string>('unidade');

  // Category filter for region matrix in settings
  const [regionCategoryFilter, setRegionCategoryFilter] = useState<'todos' | 'dentes' | 'Tecido Duro' | 'Periodontia' | 'Tecido Mole' | 'Radiografia Periapical'>('todos');

  // Sync state when selecting procedure
  const handleSelectProcedure = (proc: TUSSProcedure) => {
    setSelectedCode(proc.code);
    setCode(proc.code);
    setTissCode(proc.tissCode || '');
    setDescription(proc.description);
    setSpecialty(proc.specialty);
    setSuggestedCost(proc.suggestedCost);
    setPrices(proc.prices || {});
    setFullDescription(proc.fullDescription || '');
    setProfessionalGuidance(proc.professionalGuidance || '');
    setPatientInstructions(proc.patientInstructions || '');
    setMaterialsList(proc.requiredMaterials || []);
    
    // Sync TUSS technical guidelines
    setRequiresToothNumber(proc.requiresToothNumber ?? true);
    setToothFacesCount(proc.toothFacesCount || 'nao_aplica');
    setAnatomicalScope(proc.anatomicalScope || 'dente');
    setRequiresInitialXRay(proc.requiresInitialXRay ?? false);
    setRequiresFinalXRay(proc.requiresFinalXRay ?? false);
    setRequiresClinicalPhoto(proc.requiresClinicalPhoto ?? false);
    setRecurrenceLimitMonths(proc.recurrenceLimitMonths || 0);
    setAuditNotes(proc.auditNotes || '');

    // Sync regional rules
    setDefaultRegion(proc.defaultRegion || '');
    setAllowedRegions(proc.allowedRegions || []);
    setAllowedRegionsByPriceTable(proc.allowedRegionsByPriceTable || {});
    setRegionRulesNote(proc.regionRulesNote || '');
  };

  // Save procedure changes
  const handleSaveProcedure = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!code || !description) return;

    const updatedData: TUSSProcedure = {
      code,
      tissCode,
      description,
      specialty,
      suggestedCost,
      prices,
      defaultRegion,
      allowedRegions,
      allowedRegionsByPriceTable,
      regionRulesNote,
      fullDescription,
      requiresToothNumber,
      toothFacesCount,
      anatomicalScope,
      requiresInitialXRay,
      requiresFinalXRay,
      requiresClinicalPhoto,
      recurrenceLimitMonths,
      auditNotes,
      professionalGuidance,
      patientInstructions,
      requiredMaterials: materialsList
    };

    if (tussProcedures.some(p => p.code === code)) {
      updateTussProcedure(code, updatedData);
    } else {
      addTussProcedure(updatedData);
    }

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  // Add new procedure template
  const handleCreateNewProcedure = () => {
    const newCode = `84${Math.floor(100000 + Math.random() * 900000)}`;
    const newProc: TUSSProcedure = {
      code: newCode,
      description: 'Novo Procedimento Odontológico',
      specialty: 'Periodontia',
      suggestedCost: 320,
      defaultRegion: 'ASAI',
      allowedRegions: ['ASAI', 'AS', 'AI', 'HASD', 'HASE', 'HAIE', 'HAID'],
      regionRulesNote: 'Regras de Execução: Seleção configurada para ASAI, Arcadas (AS, AI) ou Hemi-Arcos.',
      fullDescription: 'Descrição detalhada do protocolo clínico do novo procedimento.',
      professionalGuidance: 'Instruções operatórias e cirúrgicas para o cirurgião-dentista.',
      patientInstructions: 'Orientações pré e pós-operatórias para o paciente.',
      requiredMaterials: [
        { id: `mat-${Date.now()}-1`, materialName: 'Anestésico Lidocaína 2%', quantityNeeded: 2, unit: 'tubete' },
        { id: `mat-${Date.now()}-2`, materialName: 'Pasta Profilática', quantityNeeded: 1, unit: 'dose' }
      ]
    };

    addTussProcedure(newProc);
    handleSelectProcedure(newProc);
  };

  // Quick Preset Helper for Regions
  const handleApplyPresetRegions = (type: 'raspagem' | 'periodontia' | 'todas' | 'limpar') => {
    if (type === 'raspagem') {
      setAllowedRegions(['ASAI', 'AS', 'AI', 'HASD', 'HASE', 'HAIE', 'HAID']);
      setDefaultRegion('ASAI');
      setRegionRulesNote('Regras de Execução: Raspagem Supra-gengival configurada para ASAI (Arcadas Superior e Inferior), Arcadas ou Hemi-Arcos.');
    } else if (type === 'periodontia') {
      setAllowedRegions(['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'HASD', 'HASE', 'HAIE', 'HAID']);
      setDefaultRegion('S1');
      setRegionRulesNote('Regras de Execução: Procedimento periodontal configurado por Sextantes (S1-S6) e Hemi-Arcos.');
    } else if (type === 'todas') {
      setAllowedRegions(REGION_LEGENDS.map(r => r.code));
    } else if (type === 'limpar') {
      setAllowedRegions([]);
      setDefaultRegion('');
    }
  };

  // Toggle single region code in allowedRegions
  const toggleRegionPermission = (regionCode: string) => {
    setAllowedRegions(prev => {
      if (prev.includes(regionCode)) {
        return prev.filter(c => c !== regionCode);
      } else {
        return [...prev, regionCode];
      }
    });
  };

  // Toggle ALL regions in matrix (Select All / Deselect All)
  const handleToggleSelectAllRegions = (selectAll: boolean) => {
    if (selectAll) {
      const allLegendCodes = REGION_LEGENDS.map(r => r.code);
      const toothCodes = TOOTH_DICTIONARY.map(t => String(t.number));
      setAllowedRegions(Array.from(new Set([...allLegendCodes, ...toothCodes])));
    } else {
      setAllowedRegions([]);
    }
  };

  // PDF and CSV File Import Handler
  const handleFileUploadForImport = async (file: File, convenioId: string) => {
    setIsParsingImportFile(true);
    setImportingConvenioId(convenioId);
    setImportingFileName(file.name);
    setImportSuccessMessage(null);

    try {
      let rows: ImportedProcedureRow[] = [];
      if (file.name.toLowerCase().endsWith('.pdf')) {
        const arrayBuffer = await file.arrayBuffer();
        rows = await parsePdfProcedures(arrayBuffer);
      } else {
        const text = await file.text();
        rows = parseCsvProcedures(text);
      }
      setImportPreviewRows(rows);
      setIsImportModalOpen(true);
    } catch (err) {
      console.error('Erro ao ler arquivo para importação:', err);
      alert('Ocorreu um erro ao ler o arquivo. Certifique-se de que é um PDF ou CSV com tabela de procedimentos TUSS.');
    } finally {
      setIsParsingImportFile(false);
    }
  };

  // Confirm PDF/CSV Import into target Convênio
  const handleConfirmImport = () => {
    if (!importingConvenioId) return;

    const selectedRows = importPreviewRows.filter(r => r.selected !== false);
    let updatedCount = 0;

    selectedRows.forEach(row => {
      const existingProc = tussProcedures.find(p => p.code === row.code);
      if (existingProc) {
        const newPrices = { ...(existingProc.prices || {}), [importingConvenioId]: row.price };
        updateTussProcedure(row.code, { 
          prices: newPrices,
          ...(row.specialty ? { specialty: row.specialty } : {})
        });
        updatedCount++;
      } else {
        addTussProcedure({
          code: row.code,
          description: row.description,
          specialty: row.specialty || 'Dentística & Estética',
          suggestedCost: row.price,
          prices: { [importingConvenioId]: row.price },
          requiresToothNumber: true
        });
        updatedCount++;
      }
    });

    const targetName = priceTables.find(t => t.id === importingConvenioId)?.name || 'Convênio';
    setImportSuccessMessage(`Sucesso! ${updatedCount} procedimento(s) importados / atualizados para a tabela ${targetName}.`);
    setTimeout(() => setImportSuccessMessage(null), 5000);
    setIsImportModalOpen(false);
    setImportPreviewRows([]);
  };

  // Toggle allowed region for a specific price table
  const togglePriceTableRegionPermission = (priceTableId: string, regionCode: string) => {
    setAllowedRegionsByPriceTable(prev => {
      const currentList = prev[priceTableId] || allowedRegions;
      const exists = currentList.includes(regionCode);
      const nextList = exists ? currentList.filter(c => c !== regionCode) : [...currentList, regionCode];
      return {
        ...prev,
        [priceTableId]: nextList
      };
    });
  };

  // Convênio & Price Table Handlers
  const handleCreateConvenio = (customName?: string, customDesc?: string) => {
    const nameToUse = customName || newTableName;
    const descToUse = customDesc || newTableDesc;
    if (!nameToUse.trim()) return;

    const created = addPriceTable({
      name: nameToUse.trim(),
      description: descToUse.trim() || 'Tabela de Convênio Credenciado'
    });

    // Initialize custom region rules for this new table inheriting default allowed regions
    setAllowedRegionsByPriceTable(prev => ({
      ...prev,
      [created.id]: [...allowedRegions]
    }));

    setNewTableName('');
    setNewTableDesc('');
    setIsAddingTable(false);
  };

  const handleSaveEditConvenio = (id: string) => {
    if (!editingTableName.trim()) return;
    updatePriceTable(id, {
      name: editingTableName.trim(),
      description: editingTableDesc.trim()
    });
    setEditingTableId(null);
  };

  const handleDeleteConvenio = (id: string, name: string) => {
    if (id === 'particular') {
      alert('A tabela "Particular" é a principal do sistema e não pode ser excluída.');
      return;
    }
    if (confirm(`Deseja realmente remover o convênio "${name}"?`)) {
      deletePriceTable(id);
      const next = { ...allowedRegionsByPriceTable };
      delete next[id];
      setAllowedRegionsByPriceTable(next);
    }
  };

  const handleApplyConvenioPreset = (priceTableId: string, type: 'hemi' | 'sextante' | 'arcada' | 'todas' | 'limpar') => {
    let newRegions: string[] = [];
    if (type === 'hemi') newRegions = ['HASD', 'HASE', 'HAIE', 'HAID'];
    else if (type === 'sextante') newRegions = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6'];
    else if (type === 'arcada') newRegions = ['ASAI', 'AS', 'AI'];
    else if (type === 'todas') newRegions = REGION_LEGENDS.map(r => r.code);
    else if (type === 'limpar') newRegions = [];

    setAllowedRegionsByPriceTable(prev => ({
      ...prev,
      [priceTableId]: newRegions
    }));
  };

  // Replicate & Export Handlers
  const handleOpenReplicateModal = () => {
    setReplicateSourceTableId('particular');
    setReplicateTargetTableIds(priceTables.filter(t => t.id !== 'particular').map(t => t.id));
    setReplicateMultiplier(100);
    setReplicateScope('current');
    setReplicateSelectedCodes([activeProcedure.code]);
    setReplicateSearchQuery('');
    setIsReplicateModalOpen(true);
  };

  const handleConfirmReplication = () => {
    if (replicateTargetTableIds.length === 0) {
      alert('Selecione pelo menos uma tabela de destino para replicar.');
      return;
    }

    let codesToUpdate: string[] = [];

    if (replicateScope === 'current') {
      codesToUpdate = [activeProcedure.code];
    } else if (replicateScope === 'specialty') {
      codesToUpdate = tussProcedures.filter(p => p.specialty === activeProcedure.specialty).map(p => p.code);
    } else if (replicateScope === 'selected') {
      codesToUpdate = replicateSelectedCodes;
    } else if (replicateScope === 'all') {
      codesToUpdate = tussProcedures.map(p => p.code);
    }

    if (codesToUpdate.length === 0) {
      alert('Nenhum procedimento selecionado para replicação.');
      return;
    }

    let updatedCount = 0;

    codesToUpdate.forEach(code => {
      const proc = tussProcedures.find(p => p.code === code);
      if (!proc) return;

      // Determine source price
      const sourcePrice = replicateSourceTableId === 'particular' 
        ? proc.suggestedCost 
        : (proc.prices?.[replicateSourceTableId] ?? proc.suggestedCost);

      const calculatedPrice = Math.round((sourcePrice * (replicateMultiplier / 100)) * 100) / 100;

      const existingPrices = { ...(proc.prices || {}) };
      replicateTargetTableIds.forEach(targetId => {
        existingPrices[targetId] = calculatedPrice;
      });

      // Save in context
      updateTussProcedure(code, { prices: existingPrices });

      // If active procedure is among updated, update local editing state
      if (code === activeProcedure.code) {
        setPrices(existingPrices);
      }

      updatedCount++;
    });

    setIsReplicateModalOpen(false);
    alert(`Sucesso! Os valores foram replicados para ${updatedCount} procedimento(s) em ${replicateTargetTableIds.length} tabela(s) de convênio.`);
  };

  const handleExportCSV = () => {
    const headers = [
      'Código TUSS',
      'Procedimento',
      'Especialidade',
      'Faces',
      'Preço Particular Base (R$)',
      ...priceTables.map(t => `Preço ${t.name} (R$)`)
    ];

    const rows = tussProcedures.map(p => {
      const pricesList = priceTables.map(t => (p.prices?.[t.id] ?? p.suggestedCost).toFixed(2));
      return [
        `"${p.code}"`,
        `"${p.description.replace(/"/g, '""')}"`,
        `"${p.specialty.replace(/"/g, '""')}"`,
        `"${(p.faces || '').replace(/"/g, '""')}"`,
        p.suggestedCost.toFixed(2),
        ...pricesList
      ].join(';');
    });

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `tabela_honorarios_convenios_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    const win = window.open('', '_blank', 'width=1000,height=800');
    if (!win) {
      alert('Por favor, permita pop-ups no seu navegador para gerar a impressão / PDF.');
      return;
    }

    const currentDateStr = new Date().toLocaleDateString('pt-BR');
    const currentTimeStr = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    const tableHeadersHtml = priceTables.map(t => `<th style="padding: 8px; border: 1px solid #ddd; background: #f4f4f0; text-align: right; font-size: 11px; font-weight: bold;">${t.name}</th>`).join('');

    const rowsHtml = tussProcedures.map((proc, idx) => {
      const priceCells = priceTables.map(t => {
        const price = proc.prices?.[t.id] ?? proc.suggestedCost;
        return `<td style="padding: 6px 8px; border: 1px solid #ddd; text-align: right; font-size: 11px; font-weight: bold; color: #15803d;">R$ ${price.toFixed(2)}</td>`;
      }).join('');

      return `
        <tr style="background: ${idx % 2 === 0 ? '#ffffff' : '#fcfcf8'};">
          <td style="padding: 6px 8px; border: 1px solid #ddd; font-family: monospace; font-weight: bold; font-size: 11px;">${proc.code}</td>
          <td style="padding: 6px 8px; border: 1px solid #ddd; font-size: 11px; font-weight: 600; color: #2c2c2c;">${proc.description}</td>
          <td style="padding: 6px 8px; border: 1px solid #ddd; font-size: 10px; color: #666;">${proc.specialty}</td>
          <td style="padding: 6px 8px; border: 1px solid #ddd; text-align: right; font-size: 11px; font-weight: bold; color: #b45309;">R$ ${proc.suggestedCost.toFixed(2)}</td>
          ${priceCells}
        </tr>
      `;
    }).join('');

    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Tabela de Honorários e Convênios - DentisPro</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 20px; color: #333; }
            h1 { font-size: 18px; margin: 0 0 4px 0; color: #1c1c1c; }
            p { font-size: 12px; margin: 0 0 16px 0; color: #666; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            .header-box { border-bottom: 2px solid #5a5a40; padding-bottom: 10px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: flex-end; }
            .footer { margin-top: 20px; font-size: 10px; color: #888; border-top: 1px solid #eee; padding-top: 8px; text-align: center; }
            @media print {
              body { margin: 10mm; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header-box">
            <div>
              <h1>Tabela Geral de Honorários e Convênios Credenciados</h1>
              <p>Relatório de Precificação e Tabelas de Repasse - Catálogo TUSS</p>
            </div>
            <div style="text-align: right; font-size: 11px; color: #555;">
              <strong>Emissão:</strong> ${currentDateStr} às ${currentTimeStr}<br>
              <strong>Total de Procedimentos:</strong> ${tussProcedures.length} • <strong>Tabelas:</strong> ${priceTables.length}
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="padding: 8px; border: 1px solid #ddd; background: #5a5a40; color: white; text-align: left; font-size: 11px;">Código TUSS</th>
                <th style="padding: 8px; border: 1px solid #ddd; background: #5a5a40; color: white; text-align: left; font-size: 11px;">Procedimento</th>
                <th style="padding: 8px; border: 1px solid #ddd; background: #5a5a40; color: white; text-align: left; font-size: 11px;">Especialidade</th>
                <th style="padding: 8px; border: 1px solid #ddd; background: #d4a373; color: white; text-align: right; font-size: 11px;">Particular (R$)</th>
                ${tableHeadersHtml}
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>

          <div class="footer">
            DentisPro - Sistema de Gestão Odontológica • Documento Gerado em ${currentDateStr}
          </div>

          <script>
            setTimeout(function() { window.print(); }, 400);
          </script>
        </body>
      </html>
    `);
    win.document.close();
  };

  // Material helpers
  const handleAddMaterial = () => {
    if (!newMaterialName.trim()) return;
    const newItem: ProcedureMaterialRequirement = {
      id: `req-${Date.now()}`,
      materialName: newMaterialName.trim(),
      quantityNeeded: Number(newMaterialQty) || 1,
      unit: newMaterialUnit || 'unidade'
    };
    setMaterialsList(prev => [...prev, newItem]);
    setNewMaterialName('');
    setNewMaterialQty(1);
  };

  const handleRemoveMaterial = (id: string) => {
    setMaterialsList(prev => prev.filter(m => m.id !== id));
  };

  // Specialty list extraction
  const specialties = Array.from(new Set(tussProcedures.map(p => p.specialty)));

  // Filtered procedures list
  const filteredProcedures = tussProcedures.filter(p => {
    const matchesSearch = p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.code.includes(searchQuery) ||
                          p.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialty = selectedSpecialtyFilter === 'todas' || p.specialty === selectedSpecialtyFilter;
    return matchesSearch && matchesSpecialty;
  });

  // Filtered region legends for the grid
  const displayedRegionLegends = regionCategoryFilter === 'todos' 
    ? REGION_LEGENDS 
    : REGION_LEGENDS.filter(r => r.category === regionCategoryFilter);

  const currentDefaultInfo = defaultRegion ? getRegionByCode(defaultRegion) : undefined;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#2c2c2c] to-[#3a4a38] text-white p-6 rounded-[28px] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-[#d4a373] text-[#2c2c2c] text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full tracking-wider">
              Módulo de Configuração de Procedimentos
            </span>
            <span className="text-xs text-amber-200/80 font-medium">• Regras de Região, Protocolos & Materiais</span>
          </div>
          <h2 className="text-xl font-bold flex items-center gap-2 tracking-tight">
            <BookOpen className="w-6 h-6 text-[#d4a373]" />
            Configuração de Procedimentos, Regiões e Protocolos
          </h2>
          <p className="text-xs text-gray-300 max-w-2xl leading-relaxed">
            Mapeie a região anatômica de execução (ASAI, AS, AI, HASD, HASE, HAIE, HAID, Sextantes), configure exceções por convênio, vincule insumos de estoque e defina recomendações pré e pós-operatórias.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleCreateNewProcedure}
            className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer border border-white/20"
          >
            <Plus className="w-4 h-4 text-[#d4a373]" />
            Novo Procedimento
          </button>
          <button
            type="button"
            onClick={handleSaveProcedure}
            className="px-4 py-2 bg-[#d4a373] hover:bg-[#c29263] text-[#2c2c2c] text-xs font-extrabold rounded-xl flex items-center gap-2 transition cursor-pointer shadow-md"
          >
            {saveSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-950" />
                Regras Salvas!
              </>
            ) : (
              <>
                <Save className="w-4 h-4 text-emerald-950" />
                Salvar Regras do Procedimento
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Procedure List */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-white border border-[#e5e5d1] rounded-[24px] p-4 shadow-sm space-y-3">
            <div className="space-y-2">
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por código ou nome..."
                  className="w-full bg-[#fbfbf9] border border-[#e5e5d1] rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#5a5a40]/20"
                />
              </div>

              {/* Specialty Filter */}
              <select
                value={selectedSpecialtyFilter}
                onChange={(e) => setSelectedSpecialtyFilter(e.target.value)}
                className="w-full bg-[#fbfbf9] border border-[#e5e5d1] rounded-xl px-3 py-1.5 text-xs font-medium text-gray-700"
              >
                <option value="todas">Todas as Especialidades ({tussProcedures.length})</option>
                {specialties.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* List */}
            <div className="space-y-2 max-h-[620px] overflow-y-auto pr-1 custom-scrollbar">
              {filteredProcedures.map((proc) => {
                const isSelected = proc.code === selectedCode;
                const matCount = proc.requiredMaterials?.length || 0;
                const regCount = proc.allowedRegions?.length || (proc.defaultRegion ? 1 : 0);
                return (
                  <button
                    key={proc.code}
                    type="button"
                    onClick={() => handleSelectProcedure(proc)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition cursor-pointer relative ${
                      isSelected 
                        ? 'bg-[#5a5a40] text-white border-[#5a5a40] shadow-sm' 
                        : 'bg-[#fbfbf9] text-[#2c2c2c] border-[#e5e5d1] hover:border-[#d4a373] hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                        isSelected ? 'bg-amber-400 text-black' : 'bg-[#e5e5d1] text-[#5a5a40]'
                      }`}>
                        TUSS: {proc.code}
                      </span>
                      <span className={`text-[11px] font-extrabold ${isSelected ? 'text-amber-200' : 'text-[#d4a373]'}`}>
                        R$ {proc.suggestedCost.toFixed(2)}
                      </span>
                    </div>

                    <h4 className={`text-xs font-bold mt-1 line-clamp-2 ${isSelected ? 'text-white' : 'text-[#2c2c2c]'}`}>
                      {proc.description}
                    </h4>

                    <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-black/10">
                      <span className={`text-[10px] ${isSelected ? 'text-gray-200' : 'text-gray-500'}`}>
                        {proc.specialty}
                      </span>
                      <div className="flex items-center gap-2">
                        {proc.defaultRegion && (
                          <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${
                            isSelected ? 'bg-emerald-800 text-emerald-100' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            Reg: {proc.defaultRegion}
                          </span>
                        )}
                        <span className={`text-[10px] font-bold flex items-center gap-1 ${
                          isSelected ? 'text-amber-200' : 'text-[#5a5a40]'
                        }`}>
                          <Package className="w-3 h-3" />
                          {matCount}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Procedure Configuration Modules */}
        <div className="lg:col-span-8 space-y-4">
          {/* Sub-tab Navigation */}
          <div className="flex flex-wrap items-center gap-1.5 border-b border-[#e5e5d1] pb-3">
            <button
              type="button"
              onClick={() => setActiveTab('regioes')}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition cursor-pointer ${
                activeTab === 'regioes' 
                  ? 'bg-[#2d6a4f] text-white shadow-xs' 
                  : 'bg-[#fbfbf9] text-gray-700 hover:bg-white border border-[#e5e5d1]'
              }`}
            >
              <Layers className="w-4 h-4 text-emerald-300" />
              Módulo 1: Regras de Aplicação e Regiões ({allowedRegions.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('materiais')}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition cursor-pointer ${
                activeTab === 'materiais' 
                  ? 'bg-[#5a5a40] text-white shadow-xs' 
                  : 'bg-[#fbfbf9] text-gray-700 hover:bg-white border border-[#e5e5d1]'
              }`}
            >
              <Package className="w-4 h-4 text-[#d4a373]" />
              Módulo 2: Insumos & Estoque ({materialsList.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('geral')}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition cursor-pointer ${
                activeTab === 'geral' 
                  ? 'bg-[#5a5a40] text-white shadow-xs' 
                  : 'bg-[#fbfbf9] text-gray-700 hover:bg-white border border-[#e5e5d1]'
              }`}
            >
              <FileText className="w-4 h-4" />
              Módulo 3: Dados Gerais & Preços
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('profissional')}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition cursor-pointer ${
                activeTab === 'profissional' 
                  ? 'bg-[#5a5a40] text-white shadow-xs' 
                  : 'bg-[#fbfbf9] text-gray-700 hover:bg-white border border-[#e5e5d1]'
              }`}
            >
              <UserCheck className="w-4 h-4 text-emerald-400" />
              Módulo 4: Orientações ao Cirurgião
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('paciente')}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition cursor-pointer ${
                activeTab === 'paciente' 
                  ? 'bg-[#5a5a40] text-white shadow-xs' 
                  : 'bg-[#fbfbf9] text-gray-700 hover:bg-white border border-[#e5e5d1]'
              }`}
            >
              <HeartHandshake className="w-4 h-4 text-amber-400" />
              Módulo 5: Recomendações ao Paciente
            </button>
          </div>

          {/* MODULE 1: REGRAS DE APLICAÇÃO E MAPEAMENTO DE REGIÕES */}
          {activeTab === 'regioes' && (
            <div className="bg-white border border-[#e5e5d1] rounded-[24px] p-5 shadow-sm space-y-5">
              <div className="border-b border-[#e5e5d1] pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-[#2c3e2e] flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    Regras de Execução TUSS, Dentes/Faces & Regiões Anatômicas
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Defina especificações do procedimento TUSS, convênio relacionado, região anatômica, auditoria e restrições de dentes e sextantes.
                  </p>
                </div>

                <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl shrink-0">
                  <span className="text-[11px] font-bold text-emerald-900">
                    {allowedRegions.length} Região(ões) Autorizada(s)
                  </span>
                </div>
              </div>

              {importSuccessMessage && (
                <div className="bg-emerald-50 border border-emerald-300 p-3 rounded-2xl flex items-center gap-2 text-xs text-emerald-900 font-bold animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{importSuccessMessage}</span>
                </div>
              )}

              {/* DIRETRIZES TÉCNICAS TUSS & VALIDAÇÃO DE DENTE, FACES E REGIÃO ANATÔMICA */}
              <div className="bg-[#fcfbf7] border border-[#e2e2cb] p-4.5 rounded-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-[#e5e5d1] pb-2">
                  <h4 className="text-xs font-extrabold text-[#2c3e2e] uppercase tracking-wider flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    Diretrizes Técnicas TUSS & Validação de Dente, Faces e Região Anatômica
                  </h4>
                  <span className="text-[10px] bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold px-2 py-0.5 rounded-lg">
                    Padrão TUSS ANS
                  </span>
                </div>

                {/* ITEM PRINCIPAL: PROCEDIMENTO E CONVÊNIO RELACIONADO (CHAVE ESTRANGEIRA) */}
                <div className="bg-white p-3.5 rounded-xl border border-emerald-200 shadow-2xs space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                    <div className="md:col-span-7">
                      <label className="block text-xs font-bold text-[#2c3e2e] uppercase tracking-wider mb-1">
                        1. Procedimento:
                      </label>
                      <div className="flex items-center gap-2 bg-[#f4f7f4] border border-emerald-300 rounded-xl p-2.5">
                        <span className="text-xs font-mono font-extrabold bg-emerald-800 text-white px-2 py-0.5 rounded-md">
                          {activeProcedure?.code}
                        </span>
                        <span className="text-xs font-bold text-gray-900 truncate">
                          {activeProcedure?.description}
                        </span>
                      </div>
                    </div>

                    <div className="md:col-span-5">
                      <label className="block text-xs font-bold text-[#2c3e2e] uppercase tracking-wider mb-1">
                        2. Convênio Relacionado:
                      </label>
                      <select
                        value={selectedConvenioForDirective}
                        onChange={(e) => setSelectedConvenioForDirective(e.target.value)}
                        className="w-full bg-white border border-emerald-300 rounded-xl p-2 text-xs font-bold text-emerald-950 focus:ring-2 focus:ring-emerald-500/20"
                      >
                        {priceTables.map(tbl => (
                          <option key={tbl.id} value={tbl.id}>
                            {tbl.name} {tbl.id === 'particular' ? '(Tabela Base)' : '(Convênio Credenciado)'}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* 1. ESPECIFICAÇÃO DE DENTE (FDI) */}
                  <div className="bg-white p-3 rounded-xl border border-[#e5e5d1] space-y-2">
                    <label className="flex items-center justify-between text-xs font-bold text-[#2c2c2c] cursor-pointer">
                      <span>Exige Dente Específico:</span>
                      <input
                        type="checkbox"
                        checked={requiresToothNumber}
                        onChange={(e) => setRequiresToothNumber(e.target.checked)}
                        className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500 cursor-pointer"
                      />
                    </label>
                    <p className="text-[11px] text-gray-500 leading-tight">
                      {requiresToothNumber 
                        ? 'Obriga indicação do dente exato (FDI 11-48 ou 51-85) no odontograma.' 
                        : 'Procedimento realizado por arcada, sextante ou região anatômica ampla.'}
                    </p>
                  </div>

                  {/* 2. FACES */}
                  <div className="bg-white p-3 rounded-xl border border-[#e5e5d1] space-y-1.5">
                    <label className="block text-xs font-bold text-[#2c2c2c]">Faces:</label>
                    <select
                      value={toothFacesCount}
                      onChange={(e) => setToothFacesCount(e.target.value as any)}
                      className="w-full bg-[#fbfbf9] border border-[#e5e5d1] rounded-lg p-1.5 text-xs font-medium text-gray-800 cursor-pointer"
                    >
                      <option value="nao_aplica">Não se aplica / N/A</option>
                      <option value="1_face">1 Face (M, D, O, I, V, L, P)</option>
                      <option value="2_faces">2 Faces (ex: MO, OD, VP)</option>
                      <option value="3_faces">3 Faces (ex: MOD, VLP)</option>
                      <option value="4_ou_mais_faces">4 ou mais Faces / Reconstrução</option>
                    </select>
                    <p className="text-[10px] text-gray-500">
                      Critérios: M (Mesial), D (Distal), O (Oclusal), I (Incisal), V (Vestibular), L (Lingual - Inf), P (Palatina - Sup).
                    </p>
                  </div>

                  {/* 3. REGIÃO ANATÔMICA (ÚNICA E ATUALIZÁVEL NO SOFTWARE) */}
                  <div className="bg-white p-3 rounded-xl border border-[#e5e5d1] space-y-1.5">
                    <label className="block text-xs font-bold text-[#2c2c2c]">Região Anatômica:</label>
                    <select
                      value={anatomicalScope}
                      onChange={(e) => setAnatomicalScope(e.target.value as any)}
                      className="w-full bg-[#fbfbf9] border border-[#e5e5d1] rounded-lg p-1.5 text-xs font-medium text-gray-800"
                    >
                      <option value="dente">Dentes (Elemento Dental FDI)</option>
                      <option value="arcada_sextante">Sextantes (S1-S6) / Arcadas / Hemi-arcos</option>
                      <option value="intra_oral">ASAI (Arcadas Superiores e Inferiores Geral)</option>
                      <option value="extra_oral">Tecido Mole (Mucosa Jugal, Palato, Assoalho, Úvula)</option>
                      <option value="buco_maxilo_facial">Região Buco-Maxilo-Facial Ampla</option>
                    </select>
                    <p className="text-[10px] text-gray-400">Tabela única e unificada de regiões em todo o software DentisPro.</p>
                  </div>
                </div>

                {/* COMPROVAÇÃO DE AUDITORIA & RECORRÊNCIA */}
                <div className="bg-amber-50/60 border border-amber-200 p-3.5 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                      <FileCheck className="w-4 h-4 text-amber-700" />
                      Exigências de Comprovação e Auditoria de Convênio (Prevenção de Glosa)
                    </span>
                    <span className="text-[10px] font-mono text-amber-800 bg-amber-100 px-2 py-0.5 rounded font-bold">
                      Evitamento de Glosas
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <label className="flex items-center gap-2 p-2 bg-white rounded-lg border border-amber-200 text-xs font-bold text-gray-800 cursor-pointer hover:bg-amber-50/50">
                      <input
                        type="checkbox"
                        checked={requiresInitialXRay}
                        onChange={(e) => setRequiresInitialXRay(e.target.checked)}
                        className="w-4 h-4 text-amber-600 rounded border-gray-300 focus:ring-amber-500"
                      />
                      <Camera className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                      <span>Radiografia Inicial</span>
                    </label>

                    <label className="flex items-center gap-2 p-2 bg-white rounded-lg border border-amber-200 text-xs font-bold text-gray-800 cursor-pointer hover:bg-amber-50/50">
                      <input
                        type="checkbox"
                        checked={requiresFinalXRay}
                        onChange={(e) => setRequiresFinalXRay(e.target.checked)}
                        className="w-4 h-4 text-amber-600 rounded border-gray-300 focus:ring-amber-500"
                      />
                      <Camera className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                      <span>Radiografia Final</span>
                    </label>

                    <label className="flex items-center gap-2 p-2 bg-white rounded-lg border border-amber-200 text-xs font-bold text-gray-800 cursor-pointer hover:bg-amber-50/50">
                      <input
                        type="checkbox"
                        checked={requiresClinicalPhoto}
                        onChange={(e) => setRequiresClinicalPhoto(e.target.checked)}
                        className="w-4 h-4 text-amber-600 rounded border-gray-300 focus:ring-amber-500"
                      />
                      <Camera className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                      <span>Foto Clínica Intra-oral</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-1">
                    <div className="md:col-span-4">
                      <label className="block text-xs font-bold text-amber-950 mb-1 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-700" />
                        Periodicidade Mínima (Meses):
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="60"
                        value={recurrenceLimitMonths}
                        onChange={(e) => setRecurrenceLimitMonths(parseInt(e.target.value) || 0)}
                        className="w-full bg-white border border-amber-300 rounded-lg p-2 text-xs font-bold text-amber-950"
                        placeholder="0 = Sem restrição"
                      />
                      <p className="text-[10px] text-amber-800 mt-0.5">Tempo mínimo em meses antes de permitir novo faturamento.</p>
                    </div>

                    <div className="md:col-span-8">
                      <label className="block text-xs font-bold text-amber-950 mb-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
                        Observações da Auditoria do Convênio (Guia TUSS):
                      </label>
                      <input
                        type="text"
                        value={auditNotes}
                        onChange={(e) => setAuditNotes(e.target.value)}
                        placeholder="Ex: Anexar radiografia periapical inicial com laudo comprovando lesão cariosa..."
                        className="w-full bg-white border border-amber-300 rounded-lg p-2 text-xs text-gray-800"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* MATRIZ DE REGIÕES AUTORIZADAS PARA ESTE PROCEDIMENTO */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#f0f0e4] pb-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="block text-xs font-bold text-[#2c2c2c] flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      Matriz de Regiões Autorizadas para este Procedimento:
                    </label>

                    {/* CAIXA DE SELEÇÃO PARA SELECIONAR TODAS */}
                    <label className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg cursor-pointer hover:bg-emerald-100 transition">
                      <input
                        type="checkbox"
                        checked={allowedRegions.length >= REGION_LEGENDS.length}
                        onChange={(e) => handleToggleSelectAllRegions(e.target.checked)}
                        className="w-4 h-4 text-emerald-700 rounded border-emerald-300 focus:ring-emerald-500 cursor-pointer"
                      />
                      <span>Selecionar Todas</span>
                    </label>
                  </div>

                  {/* Filter Dropdown Select */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-600 hidden sm:inline">Filtrar Categoria:</span>
                    <select
                      value={regionCategoryFilter}
                      onChange={(e) => setRegionCategoryFilter(e.target.value as any)}
                      className="bg-white border border-[#e5e5d1] rounded-xl px-3 py-1.5 text-xs font-bold text-[#2c3e2e] focus:ring-2 focus:ring-emerald-500/20 cursor-pointer shadow-2xs"
                    >
                      <option value="todos">🌐 Todas as Regiões ({REGION_LEGENDS.length})</option>
                      <option value="Tecido Duro">🦴 Arcadas / Hemi-arcos</option>
                      <option value="Periodontia">📊 Sextantes (S1 a S6)</option>
                      <option value="Tecido Mole">👄 Tecido Mole (Lábios, Língua, Palato)</option>
                      <option value="Radiografia Periapical">📷 Radiografia Periapical</option>
                      <option value="dentes">🦷 Seleção de Dentes (FDI Decíduos e Permanentes)</option>
                    </select>
                  </div>
                </div>

                {/* VISUALIZAÇÃO DA SELEÇÃO DE DENTES POR QUADRANTES (ODONTOGRAMA CONFORME ESQUEMA ANEXADO) */}
                {regionCategoryFilter === 'dentes' ? (
                  <div className="bg-[#fcfbf7] border border-[#e5e5d1] rounded-2xl p-4 space-y-6">
                    <div className="flex items-center justify-between border-b border-[#e5e5d1] pb-2">
                      <span className="text-xs font-bold text-[#2c3e2e] flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-amber-600" />
                        Seleção de Dentes por Quadrantes (Matriz Odontológica FDI)
                      </span>
                      <span className="text-[10px] text-gray-500 font-mono">
                        {allowedRegions.filter(r => !isNaN(Number(r))).length} dente(s) selecionado(s)
                      </span>
                    </div>

                    {/* 1. DENTES DECÍDUOS (INFANTIS - 51 a 85) PRIMEIRA SEÇÃO */}
                    <div className="bg-amber-50/60 border border-amber-200/90 rounded-2xl p-3.5 space-y-3">
                      <div className="flex items-center justify-between border-b border-amber-200/80 pb-2">
                        <span className="text-xs font-extrabold text-amber-950 flex items-center gap-1.5">
                          👶 1. Dentes Decíduos (Dentes de Leite - FDI 51 a 85):
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const deciduousCodes = TOOTH_DICTIONARY.filter(t => t.isDeciduous).map(t => String(t.number));
                            setAllowedRegions(prev => Array.from(new Set([...prev, ...deciduousCodes])));
                          }}
                          className="text-[10px] font-bold text-amber-900 bg-white border border-amber-300 px-2.5 py-1 rounded-lg hover:bg-amber-100 transition cursor-pointer shadow-2xs"
                        >
                          + Selecionar Todos Decíduos
                        </button>
                      </div>

                      {/* Tabela Odontograma Decíduo - Conforme Esquema Gráfico */}
                      <div className="bg-white border border-amber-200 rounded-xl overflow-hidden shadow-2xs">
                        {/* Header Row: Superior Direito | Superior Esquerdo */}
                        <div className="grid grid-cols-2 bg-amber-100/70 border-b border-amber-200 text-center py-1 text-[11px] font-bold text-amber-900">
                          <div className="border-r border-amber-200">Superior Direito (Q5)</div>
                          <div>Superior Esquerdo (Q6)</div>
                        </div>

                        {/* Top Teeth Row: Arcada Superior Decídua (55-51 e 61-65) */}
                        <div className="grid grid-cols-2 border-b border-amber-200 p-2 gap-2 text-center bg-amber-50/20">
                          {/* Q5: 55, 54, 53, 52, 51 */}
                          <div className="flex items-center justify-end gap-1 pr-1 border-r border-amber-200">
                            {[55, 54, 53, 52, 51].map(num => {
                              const code = String(num);
                              const isSel = allowedRegions.includes(code);
                              const toothObj = TOOTH_DICTIONARY.find(t => t.number === num);
                              return (
                                <button
                                  key={num}
                                  type="button"
                                  onClick={() => toggleRegionPermission(code)}
                                  title={`${num} - ${toothObj?.name}`}
                                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg border text-xs font-bold font-mono transition cursor-pointer flex items-center justify-center ${
                                    isSel ? 'bg-amber-700 text-white border-amber-800 shadow-2xs scale-105' : 'bg-white text-amber-950 border-amber-200 hover:bg-amber-100'
                                  }`}
                                >
                                  {num}
                                </button>
                              );
                            })}
                          </div>
                          {/* Q6: 61, 62, 63, 64, 65 */}
                          <div className="flex items-center justify-start gap-1 pl-1">
                            {[61, 62, 63, 64, 65].map(num => {
                              const code = String(num);
                              const isSel = allowedRegions.includes(code);
                              const toothObj = TOOTH_DICTIONARY.find(t => t.number === num);
                              return (
                                <button
                                  key={num}
                                  type="button"
                                  onClick={() => toggleRegionPermission(code)}
                                  title={`${num} - ${toothObj?.name}`}
                                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg border text-xs font-bold font-mono transition cursor-pointer flex items-center justify-center ${
                                    isSel ? 'bg-amber-700 text-white border-amber-800 shadow-2xs scale-105' : 'bg-white text-amber-950 border-amber-200 hover:bg-amber-100'
                                  }`}
                                >
                                  {num}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Bottom Teeth Row: Arcada Inferior Decídua (85-81 e 71-75) */}
                        <div className="grid grid-cols-2 border-b border-amber-200 p-2 gap-2 text-center bg-amber-50/20">
                          {/* Q8: 85, 84, 83, 82, 81 */}
                          <div className="flex items-center justify-end gap-1 pr-1 border-r border-amber-200">
                            {[85, 84, 83, 82, 81].map(num => {
                              const code = String(num);
                              const isSel = allowedRegions.includes(code);
                              const toothObj = TOOTH_DICTIONARY.find(t => t.number === num);
                              return (
                                <button
                                  key={num}
                                  type="button"
                                  onClick={() => toggleRegionPermission(code)}
                                  title={`${num} - ${toothObj?.name}`}
                                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg border text-xs font-bold font-mono transition cursor-pointer flex items-center justify-center ${
                                    isSel ? 'bg-amber-700 text-white border-amber-800 shadow-2xs scale-105' : 'bg-white text-amber-950 border-amber-200 hover:bg-amber-100'
                                  }`}
                                >
                                  {num}
                                </button>
                              );
                            })}
                          </div>
                          {/* Q7: 71, 72, 73, 74, 75 */}
                          <div className="flex items-center justify-start gap-1 pl-1">
                            {[71, 72, 73, 74, 75].map(num => {
                              const code = String(num);
                              const isSel = allowedRegions.includes(code);
                              const toothObj = TOOTH_DICTIONARY.find(t => t.number === num);
                              return (
                                <button
                                  key={num}
                                  type="button"
                                  onClick={() => toggleRegionPermission(code)}
                                  title={`${num} - ${toothObj?.name}`}
                                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg border text-xs font-bold font-mono transition cursor-pointer flex items-center justify-center ${
                                    isSel ? 'bg-amber-700 text-white border-amber-800 shadow-2xs scale-105' : 'bg-white text-amber-950 border-amber-200 hover:bg-amber-100'
                                  }`}
                                >
                                  {num}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Footer Row: Inferior Direito | Inferior Esquerdo */}
                        <div className="grid grid-cols-2 bg-amber-100/70 text-center py-1 text-[11px] font-bold text-amber-900">
                          <div className="border-r border-amber-200">Inferior Direito (Q8)</div>
                          <div>Inferior Esquerdo (Q7)</div>
                        </div>
                      </div>
                    </div>

                    {/* 2. DENTES PERMANENTES (ADULTOS - 11 a 48) SEGUNDA SEÇÃO */}
                    <div className="bg-emerald-50/60 border border-emerald-200/90 rounded-2xl p-3.5 space-y-3">
                      <div className="flex items-center justify-between border-b border-emerald-200/80 pb-2">
                        <span className="text-xs font-extrabold text-emerald-950 flex items-center gap-1.5">
                          🦷 2. Dentes Permanentes (Dentição Adulta - FDI 11 a 48):
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const permCodes = TOOTH_DICTIONARY.filter(t => !t.isDeciduous).map(t => String(t.number));
                            setAllowedRegions(prev => Array.from(new Set([...prev, ...permCodes])));
                          }}
                          className="text-[10px] font-bold text-emerald-900 bg-white border border-emerald-300 px-2.5 py-1 rounded-lg hover:bg-emerald-100 transition cursor-pointer shadow-2xs"
                        >
                          + Selecionar Todos Permanentes
                        </button>
                      </div>

                      {/* Tabela Odontograma Permanente - Conforme Esquema Gráfico */}
                      <div className="bg-white border border-emerald-200 rounded-xl overflow-hidden shadow-2xs">
                        {/* Header Row: Superior Direito | Superior Esquerdo */}
                        <div className="grid grid-cols-2 bg-emerald-100/70 border-b border-emerald-200 text-center py-1 text-[11px] font-bold text-emerald-900">
                          <div className="border-r border-emerald-200">Superior Direito (Q1)</div>
                          <div>Superior Esquerdo (Q2)</div>
                        </div>

                        {/* Top Teeth Row: Arcada Superior Permanente (18-11 e 21-28) */}
                        <div className="grid grid-cols-2 border-b border-emerald-200 p-2 gap-2 text-center bg-emerald-50/20 overflow-x-auto">
                          {/* Q1: 18, 17, 16, 15, 14, 13, 12, 11 */}
                          <div className="flex items-center justify-end gap-0.5 sm:gap-1 pr-1 border-r border-emerald-200 shrink-0">
                            {[18, 17, 16, 15, 14, 13, 12, 11].map(num => {
                              const code = String(num);
                              const isSel = allowedRegions.includes(code);
                              const toothObj = TOOTH_DICTIONARY.find(t => t.number === num);
                              return (
                                <button
                                  key={num}
                                  type="button"
                                  onClick={() => toggleRegionPermission(code)}
                                  title={`${num} - ${toothObj?.name}`}
                                  className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg border text-[11px] font-bold font-mono transition cursor-pointer flex items-center justify-center ${
                                    isSel ? 'bg-emerald-800 text-white border-emerald-900 shadow-2xs scale-105' : 'bg-white text-gray-800 border-gray-200 hover:bg-emerald-50'
                                  }`}
                                >
                                  {num}
                                </button>
                              );
                            })}
                          </div>
                          {/* Q2: 21, 22, 23, 24, 25, 26, 27, 28 */}
                          <div className="flex items-center justify-start gap-0.5 sm:gap-1 pl-1 shrink-0">
                            {[21, 22, 23, 24, 25, 26, 27, 28].map(num => {
                              const code = String(num);
                              const isSel = allowedRegions.includes(code);
                              const toothObj = TOOTH_DICTIONARY.find(t => t.number === num);
                              return (
                                <button
                                  key={num}
                                  type="button"
                                  onClick={() => toggleRegionPermission(code)}
                                  title={`${num} - ${toothObj?.name}`}
                                  className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg border text-[11px] font-bold font-mono transition cursor-pointer flex items-center justify-center ${
                                    isSel ? 'bg-emerald-800 text-white border-emerald-900 shadow-2xs scale-105' : 'bg-white text-gray-800 border-gray-200 hover:bg-emerald-50'
                                  }`}
                                >
                                  {num}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Bottom Teeth Row: Arcada Inferior Permanente (48-41 e 31-38) */}
                        <div className="grid grid-cols-2 border-b border-emerald-200 p-2 gap-2 text-center bg-emerald-50/20 overflow-x-auto">
                          {/* Q4: 48, 47, 46, 45, 44, 43, 42, 41 */}
                          <div className="flex items-center justify-end gap-0.5 sm:gap-1 pr-1 border-r border-emerald-200 shrink-0">
                            {[48, 47, 46, 45, 44, 43, 42, 41].map(num => {
                              const code = String(num);
                              const isSel = allowedRegions.includes(code);
                              const toothObj = TOOTH_DICTIONARY.find(t => t.number === num);
                              return (
                                <button
                                  key={num}
                                  type="button"
                                  onClick={() => toggleRegionPermission(code)}
                                  title={`${num} - ${toothObj?.name}`}
                                  className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg border text-[11px] font-bold font-mono transition cursor-pointer flex items-center justify-center ${
                                    isSel ? 'bg-emerald-800 text-white border-emerald-900 shadow-2xs scale-105' : 'bg-white text-gray-800 border-gray-200 hover:bg-emerald-50'
                                  }`}
                                >
                                  {num}
                                </button>
                              );
                            })}
                          </div>
                          {/* Q3: 31, 32, 33, 34, 35, 36, 37, 38 */}
                          <div className="flex items-center justify-start gap-0.5 sm:gap-1 pl-1 shrink-0">
                            {[31, 32, 33, 34, 35, 36, 37, 38].map(num => {
                              const code = String(num);
                              const isSel = allowedRegions.includes(code);
                              const toothObj = TOOTH_DICTIONARY.find(t => t.number === num);
                              return (
                                <button
                                  key={num}
                                  type="button"
                                  onClick={() => toggleRegionPermission(code)}
                                  title={`${num} - ${toothObj?.name}`}
                                  className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg border text-[11px] font-bold font-mono transition cursor-pointer flex items-center justify-center ${
                                    isSel ? 'bg-emerald-800 text-white border-emerald-900 shadow-2xs scale-105' : 'bg-white text-gray-800 border-gray-200 hover:bg-emerald-50'
                                  }`}
                                >
                                  {num}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Footer Row: Inferior Direito | Inferior Esquerdo */}
                        <div className="grid grid-cols-2 bg-emerald-100/70 text-center py-1 text-[11px] font-bold text-emerald-900">
                          <div className="border-r border-emerald-200">Inferior Direito (Q4)</div>
                          <div>Inferior Esquerdo (Q3)</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-72 overflow-y-auto p-1 bg-[#fbfbf9] border border-[#e5e5d1] rounded-2xl custom-scrollbar">
                    {displayedRegionLegends.map((reg) => {
                      const isChecked = allowedRegions.includes(reg.code);
                      return (
                        <button
                          key={reg.code}
                          type="button"
                          onClick={() => toggleRegionPermission(reg.code)}
                          className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex items-start justify-between gap-2 ${
                            isChecked
                              ? 'bg-emerald-50 border-emerald-400 text-emerald-950 shadow-2xs'
                              : 'bg-white border-[#e5e5d1] hover:bg-gray-50 text-gray-700'
                          }`}
                        >
                          <div className="space-y-0.5 overflow-hidden">
                            <div className="flex items-center gap-1.5">
                              <span className={`text-[11px] font-mono font-bold px-1.5 py-0.2 rounded ${
                                isChecked ? 'bg-emerald-700 text-white' : 'bg-gray-200 text-gray-800'
                              }`}>
                                {reg.code}
                              </span>
                              <span className="text-[10px] font-medium text-gray-500 truncate">
                                {reg.category}
                              </span>
                            </div>
                            <p className="text-xs font-bold leading-tight line-clamp-1">{reg.name}</p>
                            {reg.teeth.length > 0 && (
                              <p className="text-[9px] text-gray-400 font-mono">
                                Dentes: {reg.teeth.join(', ')}
                              </p>
                            )}
                          </div>

                          <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 ${
                            isChecked ? 'bg-[#075e54] border-[#075e54] text-white' : 'border-gray-300 bg-white'
                          }`}>
                            {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* REGRAS DE REGIÃO PERSONALIZADAS POR CONVÊNIO / TABELA DE PREÇO (CARDS INTERATIVOS E LISTA DE PROCEDIMENTOS) */}
              <div className="bg-[#fcfaf5] border border-amber-200/80 p-5 rounded-3xl space-y-5 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-200/60 pb-3">
                  <div>
                    <h4 className="text-sm font-bold text-amber-950 flex items-center gap-2">
                      <Building2 className="w-4.5 h-4.5 text-amber-600" />
                      Regras de Região Personalizadas por Convênio / Tabela de Preço
                    </h4>
                    <p className="text-xs text-amber-800/90 mt-0.5">
                      Selecione um card de convênio para visualizar ou importar sua tabela de procedimentos e preços via PDF/CSV.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsAddingTable(!isAddingTable)}
                    className="px-3.5 py-2 bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition cursor-pointer shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{isAddingTable ? 'Fechar Form' : 'Adicionar Convênio / Tabela'}</span>
                  </button>
                </div>

                {/* FORM PARA ADICIONAR NOVO CONVÊNIO OU TABELA */}
                {isAddingTable && (
                  <div className="bg-white border-2 border-amber-300 rounded-2xl p-4 shadow-md space-y-3">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                      <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-amber-600" />
                        Cadastrar Novo Convênio ou Tabela de Preço
                      </span>
                      <span className="text-[10px] text-gray-500 font-medium">Integração Instantânea ao Sistema</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Nome do Convênio / Tabela:</label>
                        <input
                          type="text"
                          value={newTableName}
                          onChange={(e) => setNewTableName(e.target.value)}
                          placeholder="Ex: Bradesco Dental, Amil, OdontoPrev"
                          className="w-full bg-[#fbfbf9] border border-gray-300 rounded-xl px-3 py-1.5 text-xs font-bold text-gray-900 focus:outline-none focus:border-amber-600"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Descrição / Categoria:</label>
                        <input
                          type="text"
                          value={newTableDesc}
                          onChange={(e) => setNewTableDesc(e.target.value)}
                          placeholder="Ex: Tabela de Coparticipação, Rede Credenciada Nível 2"
                          className="w-full bg-[#fbfbf9] border border-gray-300 rounded-xl px-3 py-1.5 text-xs text-gray-800 focus:outline-none focus:border-amber-600"
                        />
                      </div>
                    </div>

                    {/* Quick Presets for Popular Convênios */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                        Atalhos de Convênios Populares (Clique para Adicionar):
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { name: 'Bradesco Dental', desc: 'Plano Odontológico Bradesco Saúde' },
                          { name: 'Amil Dental', desc: 'Rede Credenciada Amil' },
                          { name: 'OdontoPrev', desc: 'Plano OdontoPrev Corporativo' },
                          { name: 'Unimed Odonto', desc: 'Tabela Unimed Odontologia' },
                          { name: 'SulAmérica Odonto', desc: 'Tabela SulAmérica Executivo' },
                          { name: 'MetLife Dental', desc: 'Plano MetLife Odontológico' },
                          { name: 'Porto Seguro Dental', desc: 'Porto Seguro Odonto' },
                          { name: 'INPAO Dental', desc: 'Convênio INPAO Dental' }
                        ].map(preset => (
                          <button
                            key={preset.name}
                            type="button"
                            onClick={() => handleCreateConvenio(preset.name, preset.desc)}
                            className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 text-[11px] font-semibold rounded-lg border border-amber-200 transition cursor-pointer flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3 text-amber-700" />
                            <span>{preset.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                      <button
                        type="button"
                        onClick={() => setIsAddingTable(false)}
                        className="px-3 py-1.5 bg-gray-100 text-gray-600 hover:bg-gray-200 text-xs font-bold rounded-xl transition cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCreateConvenio()}
                        className="px-4 py-1.5 bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Salvar Convênio
                      </button>
                    </div>
                  </div>
                )}

                {/* GRID DE CARDS INTERATIVOS DE CONVÊNIOS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {priceTables.map(tbl => {
                    const isCardSelected = selectedConvenioCardId === tbl.id;
                    const countProcedures = tussProcedures.filter(p => p.prices && p.prices[tbl.id] !== undefined).length;

                    return (
                      <button
                        key={tbl.id}
                        type="button"
                        onClick={() => setSelectedConvenioCardId(tbl.id)}
                        className={`p-4 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between space-y-2 ${
                          isCardSelected
                            ? 'bg-amber-100/90 border-amber-500 ring-2 ring-amber-400/30 shadow-md scale-[1.02]'
                            : 'bg-white border-gray-200 hover:border-amber-300 hover:bg-amber-50/30 shadow-xs'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                              tbl.id === 'particular'
                                ? 'bg-amber-700 text-white'
                                : 'bg-emerald-700 text-white'
                            }`}>
                              {tbl.id === 'particular' ? '💎' : '🏥'}
                            </div>
                            <div>
                              <h5 className="font-bold text-xs text-gray-900 line-clamp-1">{tbl.name}</h5>
                              <p className="text-[10px] text-gray-500 line-clamp-1">
                                {tbl.description || 'Plano de Atendimento'}
                              </p>
                            </div>
                          </div>

                          {isCardSelected && (
                            <span className="text-[10px] bg-amber-700 text-white font-bold px-1.5 py-0.5 rounded-md shrink-0">
                              Ativo
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between border-t border-amber-200/50 pt-2 text-[10.5px]">
                          <span className="text-gray-600 font-medium">
                            {countProcedures} procedimento(s)
                          </span>
                          <span className="font-bold text-amber-900 underline">
                            Ver Lista & Preços →
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* PAINEL INFERIOR: PROCEDIMENTOS DO CONVÊNIO SELECIONADO & BOTÃO DE IMPORTAÇÃO DE PDF/CSV */}
                {selectedConvenioCardId && (() => {
                  const currentConvenio = priceTables.find(t => t.id === selectedConvenioCardId) || priceTables[0];
                  const filteredProcedures = tussProcedures.filter(p => 
                    p.code.toLowerCase().includes(selectedConvenioSearch.toLowerCase()) ||
                    p.description.toLowerCase().includes(selectedConvenioSearch.toLowerCase())
                  );

                  return (
                    <div className="bg-white border border-amber-200 rounded-2xl p-4.5 space-y-4 shadow-sm">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-5 h-5 text-amber-700 shrink-0" />
                          <div>
                            <h5 className="text-xs font-extrabold text-amber-950 uppercase tracking-wider">
                              Procedimentos e Tabela de Preço: {currentConvenio.name}
                            </h5>
                            <p className="text-[11px] text-gray-500">
                              Ajuste os valores ou importe tabelas completas de procedimentos em PDF/CSV para este convênio.
                            </p>
                          </div>
                        </div>

                        {/* BOTÃO DE IMPORTAÇÃO DE PDF OU CSV */}
                        <div className="flex items-center gap-2 shrink-0">
                          <label className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition cursor-pointer">
                            <UploadCloud className="w-4 h-4" />
                            <span>Importar PDF / CSV</span>
                            <input
                              type="file"
                              accept=".csv, .pdf, application/pdf, text/csv"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleFileUploadForImport(file, currentConvenio.id);
                                e.target.value = '';
                              }}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>

                      {/* BARRA DE PESQUISA DENTRO DO CONVÊNIO */}
                      <div className="flex items-center gap-2 bg-[#fbfbf9] border border-gray-200 rounded-xl px-3 py-1.5">
                        <Search className="w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          value={selectedConvenioSearch}
                          onChange={(e) => setSelectedConvenioSearch(e.target.value)}
                          placeholder={`Buscar procedimento em ${currentConvenio.name}...`}
                          className="w-full text-xs bg-transparent border-none focus:outline-none text-gray-800"
                        />
                      </div>

                      {/* TABELA DE PROCEDIMENTOS DO CONVÊNIO */}
                      <div className="border border-gray-200 rounded-xl overflow-hidden max-h-72 overflow-y-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-amber-50/80 border-b border-amber-200 text-[10px] font-bold text-amber-950 uppercase tracking-wider">
                              <th className="p-2.5">Código TUSS</th>
                              <th className="p-2.5">Procedimento</th>
                              <th className="p-2.5 text-right">Preço Particular (Base)</th>
                              <th className="p-2.5 text-right">Preço Convênio ({currentConvenio.name})</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 text-xs">
                            {filteredProcedures.map((proc) => {
                              const convPrice = proc.prices?.[currentConvenio.id] ?? proc.suggestedCost;

                              return (
                                <tr key={proc.code} className="hover:bg-amber-50/30 transition">
                                  <td className="p-2.5 font-mono font-bold text-emerald-900">{proc.code}</td>
                                  <td className="p-2.5 font-bold text-gray-900">{proc.description}</td>
                                  <td className="p-2.5 text-right font-mono text-gray-500">
                                    R$ {proc.suggestedCost.toFixed(2)}
                                  </td>
                                  <td className="p-2.5 text-right">
                                    <input
                                      type="number"
                                      step="0.01"
                                      value={convPrice}
                                      onChange={(e) => {
                                        const newVal = parseFloat(e.target.value) || 0;
                                        const updatedPrices = { ...(proc.prices || {}), [currentConvenio.id]: newVal };
                                        updateTussProcedure(proc.code, { prices: updatedPrices });
                                      }}
                                      className="w-28 bg-white border border-amber-300 rounded-lg p-1 text-xs font-bold text-emerald-900 text-right focus:ring-2 focus:ring-amber-500/20"
                                    />
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* INSTRUÇÕES E NOTAS DE REGRA OPERACIONAL */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#5a5a40] flex items-center gap-1">
                  <Info className="w-4 h-4 text-[#d4a373]" />
                  Instruções e Observações das Regras Regionais (Orientação para Recepção e Dentistas):
                </label>
                <textarea
                  value={regionRulesNote}
                  onChange={(e) => setRegionRulesNote(e.target.value)}
                  rows={3}
                  className="w-full bg-[#fbfbf9] border border-[#e5e5d1] rounded-2xl p-3 text-xs focus:ring-2 focus:ring-emerald-500/20 text-gray-800"
                  placeholder="Exemplo: Raspagem Supra-gengival em ASAI cobre ambas as arcadas simultaneamente. No caso de convênios específicos, realizar lançamento individualizado dos Hemi-arcos (HASD, HASE, HAIE, HAID)..."
                />
              </div>

              {/* BARRA DE SALVAMENTO DE REGRAS E DIRETRIZES DO PROCEDIMENTO */}
              <div className="pt-4 border-t border-[#e5e5d1] flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  {saveSuccess && (
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 animate-fadeIn">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                      Regras e diretrizes salvas com sucesso!
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleSaveProcedure}
                  className="w-full sm:w-auto px-6 py-2.5 bg-[#2c3e2e] hover:bg-[#1f2d21] text-white text-xs font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer shrink-0"
                >
                  <Save className="w-4 h-4 text-amber-300" />
                  <span>Salvar Regras e Diretrizes do Procedimento</span>
                </button>
              </div>
            </div>
          )}

          {/* MODULE 2: MATERIAIS NECESSÁRIOS */}
          {activeTab === 'materiais' && (
            <div className="bg-white border border-[#e5e5d1] rounded-[24px] p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-[#e5e5d1] pb-2">
                <div>
                  <h3 className="text-sm font-bold text-[#2c2c2c] flex items-center gap-2">
                    <Package className="w-4 h-4 text-[#d4a373]" />
                    Lista de Materiais e Insumos do Procedimento
                  </h3>
                  <p className="text-xs text-gray-500">Mapeamento para controle de estoque e preparação da mesa clínica.</p>
                </div>
                <span className="text-xs bg-[#f4f4ec] text-[#5a5a40] font-bold px-3 py-1 rounded-full border border-[#e5e5d1]">
                  Total: {materialsList.length} itens
                </span>
              </div>

              {/* Add Material Input */}
              <div className="bg-[#fbfbf9] p-3.5 rounded-2xl border border-[#e5e5d1] space-y-2">
                <span className="text-xs font-bold text-[#5a5a40] block">Adicionar Material à Lista:</span>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                  <div className="sm:col-span-6">
                    <input
                      type="text"
                      value={newMaterialName}
                      onChange={(e) => setNewMaterialName(e.target.value)}
                      placeholder="Nome do material (ex: Resina A2, Agulha, Gaze...)"
                      className="w-full bg-white border border-[#e5e5d1] rounded-xl px-3 py-1.5 text-xs"
                      list="inventory-suggestions"
                    />
                    <datalist id="inventory-suggestions">
                      {inventory.map(inv => (
                        <option key={inv.id} value={inv.name} />
                      ))}
                    </datalist>
                  </div>

                  <div className="sm:col-span-2">
                    <input
                      type="number"
                      step="0.1"
                      value={newMaterialQty}
                      onChange={(e) => setNewMaterialQty(parseFloat(e.target.value) || 1)}
                      className="w-full bg-white border border-[#e5e5d1] rounded-xl px-3 py-1.5 text-xs text-center font-bold"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <select
                      value={newMaterialUnit}
                      onChange={(e) => setNewMaterialUnit(e.target.value)}
                      className="w-full bg-white border border-[#e5e5d1] rounded-xl px-2 py-1.5 text-xs font-bold"
                    >
                      <option value="unidade">unidade</option>
                      <option value="tubete">tubete</option>
                      <option value="par">par</option>
                      <option value="envelope">envelope</option>
                      <option value="dose">dose</option>
                      <option value="ml">ml</option>
                      <option value="pacote">pacote</option>
                      <option value="frasco">frasco</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <button
                      type="button"
                      onClick={handleAddMaterial}
                      className="w-full bg-[#5a5a40] hover:bg-[#4a4a38] text-white text-xs font-bold py-1.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-1 shadow-2xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Incluir
                    </button>
                  </div>
                </div>
              </div>

              {/* Table of Materials */}
              <div className="overflow-x-auto rounded-2xl border border-[#e5e5d1]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#f4f4ec] text-[#5a5a40] uppercase text-[10px] tracking-wider font-extrabold">
                    <tr>
                      <th className="p-3">Material / Insumo</th>
                      <th className="p-3 text-center">Qtd. Necessária</th>
                      <th className="p-3 text-center">Unidade</th>
                      <th className="p-3 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e5e5d1]">
                    {materialsList.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-6 text-center text-gray-400 italic">
                          Nenhum material cadastrado para este procedimento.
                        </td>
                      </tr>
                    ) : (
                      materialsList.map((m) => (
                        <tr key={m.id} className="hover:bg-[#fcfcf8]">
                          <td className="p-3 font-bold text-[#2c2c2c]">{m.materialName}</td>
                          <td className="p-3 text-center font-bold text-[#d4a373]">{m.quantityNeeded}</td>
                          <td className="p-3 text-center text-gray-600">{m.unit}</td>
                          <td className="p-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleRemoveMaterial(m.id)}
                              className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition cursor-pointer"
                              title="Remover da lista"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* MODULE 3: DADOS GERAIS E VALORES */}
          {activeTab === 'geral' && (
            <div className="bg-white border border-[#e5e5d1] rounded-[24px] p-5 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-[#2c2c2c] border-b border-[#e5e5d1] pb-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#d4a373]" />
                Informações Principais e Tabela TUSS
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#5a5a40] mb-1">Código TUSS / TISS:</label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full bg-[#fbfbf9] border border-[#e5e5d1] rounded-xl px-3 py-2 text-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#5a5a40] mb-1">Especialidade:</label>
                  <input
                    type="text"
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    className="w-full bg-[#fbfbf9] border border-[#e5e5d1] rounded-xl px-3 py-2 text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#5a5a40] mb-1">Valor Particular (R$):</label>
                  <input
                    type="number"
                    step="0.01"
                    value={suggestedCost}
                    onChange={(e) => setSuggestedCost(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#fbfbf9] border border-[#e5e5d1] rounded-xl px-3 py-2 text-xs font-bold text-[#d4a373]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5a5a40] mb-1">Nome / Descrição Curta do Procedimento:</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#fbfbf9] border border-[#e5e5d1] rounded-xl px-3 py-2 text-xs font-bold text-[#2c2c2c]"
                />
              </div>

              {/* Preços por Tabela de Preço / Convênio (Lista Estruturada Interativa com Ferramentas em Massa) */}
              <div className="bg-[#fbfbf9] p-4 rounded-2xl border border-[#e5e5d1] space-y-3">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-[#e5e5d1] pb-3">
                  <div>
                    <span className="text-xs font-bold text-[#5a5a40] flex items-center gap-1.5">
                      <DollarSign className="w-4 h-4 text-[#d4a373]" />
                      Tabelas de Preço & Honorários por Convênio ({priceTables.length})
                    </span>
                    <p className="text-[11px] text-gray-500">
                      Defina os valores cobrados para cada convênio credenciado, aplique reajustes e exporte relatórios.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    {/* Botão de Replicação em Massa Avançada */}
                    <button
                      type="button"
                      onClick={handleOpenReplicateModal}
                      className="px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                      title="Replicar valores de um convênio/tabela para outros ou alterar em massa"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>Replicar / Ajustar em Massa...</span>
                    </button>

                    {/* Quick Replicate Particular Button */}
                    <button
                      type="button"
                      onClick={() => {
                        const updated: Record<string, number> = {};
                        priceTables.forEach(t => {
                          updated[t.id] = suggestedCost;
                        });
                        setPrices(updated);
                      }}
                      className="text-[10.5px] font-bold text-emerald-800 hover:underline cursor-pointer bg-white px-2.5 py-1.5 rounded-xl border border-[#e5e5d1]"
                      title="Replicar valor particular neste procedimento"
                    >
                      ⚡ Particular → Todas
                    </button>

                    {/* Botões de Extração de Dados */}
                    <button
                      type="button"
                      onClick={handleExportCSV}
                      className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-bold rounded-xl border border-emerald-200 transition cursor-pointer flex items-center gap-1"
                      title="Exportar planilha CSV da tabela de preços"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
                      <span>CSV</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleExportPDF}
                      className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-900 text-xs font-bold rounded-xl border border-blue-200 transition cursor-pointer flex items-center gap-1"
                      title="Imprimir ou gerar PDF formatado da tabela de preços"
                    >
                      <Printer className="w-3.5 h-3.5 text-blue-700" />
                      <span>PDF</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  {priceTables.map(tbl => {
                    const currentPrice = prices[tbl.id] !== undefined ? prices[tbl.id] : suggestedCost;
                    const diff = currentPrice - suggestedCost;
                    const isParticular = tbl.id === 'particular';

                    return (
                      <div 
                        key={tbl.id} 
                        className="bg-white border border-[#e5e5d1] rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs hover:border-amber-300 transition"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs shrink-0 ${
                            isParticular ? 'bg-amber-100 text-amber-900 font-bold' : 'bg-emerald-100 text-emerald-900'
                          }`}>
                            {isParticular ? '💎' : '🏥'}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-gray-900 block">{tbl.name}</span>
                            {tbl.description ? (
                              <span className="text-[10.5px] text-gray-500 block">{tbl.description}</span>
                            ) : (
                              <span className="text-[10.5px] text-gray-400 block">{isParticular ? 'Valor base da clínica' : 'Convênio credenciado'}</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          {/* Diff badge */}
                          {!isParticular && suggestedCost > 0 && (
                            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                              diff === 0 
                                ? 'bg-gray-100 text-gray-600' 
                                : diff < 0 
                                  ? 'bg-rose-100 text-rose-800' 
                                  : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {diff === 0 
                                ? 'Mesmo Valor Base' 
                                : diff < 0 
                                  ? `- R$ ${Math.abs(diff).toFixed(2)}` 
                                  : `+ R$ ${diff.toFixed(2)}`}
                            </span>
                          )}

                          <div className="flex items-center gap-1">
                            <span className="text-xs font-bold text-gray-500">R$</span>
                            <input
                              type="number"
                              step="0.01"
                              value={currentPrice}
                              onChange={(e) => setPrices({ ...prices, [tbl.id]: parseFloat(e.target.value) || 0 })}
                              className="w-28 bg-[#fbfbf9] border border-[#e5e5d1] focus:border-amber-500 rounded-xl px-2.5 py-1.5 text-xs font-bold text-emerald-900 focus:outline-none text-right"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5a5a40] mb-1">Descrição Técnica / Protocolo Detalhado:</label>
                <textarea
                  value={fullDescription}
                  onChange={(e) => setFullDescription(e.target.value)}
                  rows={5}
                  className="w-full bg-[#fbfbf9] border border-[#e5e5d1] rounded-2xl p-3.5 text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#5a5a40]/20"
                  placeholder="Detalhe as etapas operatórias e cirúrgicas do procedimento..."
                />
              </div>
            </div>
          )}

          {/* MODULE 4: ORIENTAÇÕES AO PROFISSIONAL */}
          {activeTab === 'profissional' && (
            <div className="bg-white border border-[#e5e5d1] rounded-[24px] p-5 shadow-sm space-y-4">
              <div className="border-b border-[#e5e5d1] pb-2">
                <h3 className="text-sm font-bold text-[#2c2c2c] flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  Recomendações e Orientações Técnicas ao Cirurgião-Dentista
                </h3>
                <p className="text-xs text-gray-500">
                  Guia operatório técnico, técnicas de isolamento, irrigação, anestesia e boas práticas operatórias.
                </p>
              </div>

              <textarea
                value={professionalGuidance}
                onChange={(e) => setProfessionalGuidance(e.target.value)}
                rows={10}
                className="w-full bg-[#fbfbf9] border border-[#e5e5d1] rounded-2xl p-4 text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-medium text-[#2c2c2c]"
                placeholder="Insira as recomendações cirúrgicas/clínicas para o profissional..."
              />
            </div>
          )}

          {/* MODULE 5: RECOMENDAÇÕES AO PACIENTE */}
          {activeTab === 'paciente' && (
            <div className="bg-white border border-[#e5e5d1] rounded-[24px] p-5 shadow-sm space-y-4">
              <div className="border-b border-[#e5e5d1] pb-2">
                <h3 className="text-sm font-bold text-[#2c2c2c] flex items-center gap-2">
                  <HeartHandshake className="w-4 h-4 text-amber-600" />
                  Recomendações e Cuidados ao Paciente (Pré e Pós-Operatório)
                </h3>
                <p className="text-xs text-gray-500">
                  Instruções impressas para o paciente sobre alimentação, repouso, medicação e higiene pós-procedimento.
                </p>
              </div>

              <textarea
                value={patientInstructions}
                onChange={(e) => setPatientInstructions(e.target.value)}
                rows={10}
                className="w-full bg-[#fbfbf9] border border-[#e5e5d1] rounded-2xl p-4 text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-amber-500/20 font-medium text-[#2c2c2c]"
                placeholder="Insira as orientações pré e pós-operatórias para o paciente..."
              />
            </div>
          )}
        </div>
      </div>

      {/* MODAL DE REPLICAÇÃO E AJUSTE DE VALORES EM MASSA */}
      {isReplicateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-amber-200 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-150 my-8">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-900 font-bold shrink-0">
                  <Zap className="w-5 h-5 text-amber-700" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    Replicação & Ajuste de Honorários em Massa
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Copie ou aplique percentuais de tabela entre convênios e procedimentos.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsReplicateModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-xl hover:bg-gray-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Content */}
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">

              {/* 1. SELEÇÃO DA TABELA DE ORIGEM */}
              <div className="bg-[#fbfbf9] border border-gray-200 rounded-2xl p-4 space-y-2">
                <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-amber-700 text-white font-bold text-[10px] flex items-center justify-center">1</span>
                  Tabela de Origem (Copiar Valores De):
                </label>
                <select
                  value={replicateSourceTableId}
                  onChange={(e) => {
                    const src = e.target.value;
                    setReplicateSourceTableId(src);
                    setReplicateTargetTableIds(prev => prev.filter(id => id !== src));
                  }}
                  className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs font-bold text-gray-900 focus:outline-none focus:border-amber-600 cursor-pointer"
                >
                  {priceTables.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.id === 'particular' ? '💎 Particular (Valor Base Sugerido)' : `🏥 ${t.name}`}
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. SELEÇÃO DAS TABELAS DE DESTINO */}
              <div className="bg-[#fbfbf9] border border-gray-200 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-amber-700 text-white font-bold text-[10px] flex items-center justify-center">2</span>
                    Tabelas de Destino (Aplicar Valores Para):
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const otherTables = priceTables.filter(t => t.id !== replicateSourceTableId).map(t => t.id);
                      if (replicateTargetTableIds.length === otherTables.length) {
                        setReplicateTargetTableIds([]);
                      } else {
                        setReplicateTargetTableIds(otherTables);
                      }
                    }}
                    className="text-[11px] font-bold text-amber-800 hover:underline cursor-pointer"
                  >
                    {replicateTargetTableIds.length === priceTables.length - 1 ? 'Desmarcar Todas' : 'Marcar Todas as Outras'}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {priceTables.filter(t => t.id !== replicateSourceTableId).map(tbl => {
                    const isChecked = replicateTargetTableIds.includes(tbl.id);
                    return (
                      <button
                        key={tbl.id}
                        type="button"
                        onClick={() => {
                          if (isChecked) {
                            setReplicateTargetTableIds(replicateTargetTableIds.filter(id => id !== tbl.id));
                          } else {
                            setReplicateTargetTableIds([...replicateTargetTableIds, tbl.id]);
                          }
                        }}
                        className={`p-2.5 rounded-xl border text-left text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                          isChecked 
                            ? 'bg-amber-50 border-amber-400 text-amber-950 shadow-2xs' 
                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-amber-700 shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-gray-400 shrink-0" />
                        )}
                        <span className="truncate">{tbl.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. FATOR DE REAJUSTE / PORCENTAGEM */}
              <div className="bg-[#fbfbf9] border border-gray-200 rounded-2xl p-4 space-y-2">
                <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-amber-700 text-white font-bold text-[10px] flex items-center justify-center">3</span>
                  Fator de Reajuste (% do Valor da Origem):
                </label>

                <div className="flex flex-wrap items-center gap-2">
                  {[
                    { label: '100% (Copiar Exato)', val: 100 },
                    { label: '90% (-10%)', val: 90 },
                    { label: '80% (-20%)', val: 80 },
                    { label: '70% (-30%)', val: 70 },
                    { label: '110% (+10%)', val: 110 },
                  ].map(p => (
                    <button
                      key={p.val}
                      type="button"
                      onClick={() => setReplicateMultiplier(p.val)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                        replicateMultiplier === p.val
                          ? 'bg-amber-700 text-white border-amber-700 shadow-2xs'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-amber-50'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}

                  <div className="flex items-center gap-1 ml-auto">
                    <span className="text-xs font-bold text-gray-600">Outro %:</span>
                    <input
                      type="number"
                      value={replicateMultiplier}
                      onChange={(e) => setReplicateMultiplier(parseFloat(e.target.value) || 100)}
                      className="w-20 bg-white border border-gray-300 focus:border-amber-600 rounded-xl px-2 py-1 text-xs font-bold text-right"
                    />
                  </div>
                </div>
              </div>

              {/* 4. ESCOPO DOS PROCEDIMENTOS */}
              <div className="bg-[#fbfbf9] border border-gray-200 rounded-2xl p-4 space-y-3">
                <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-amber-700 text-white font-bold text-[10px] flex items-center justify-center">4</span>
                  Quais Procedimentos Serão Atualizados?
                </label>

                <div className="space-y-2">
                  {/* Current Procedure Option */}
                  <label className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition ${
                    replicateScope === 'current' ? 'bg-amber-50/80 border-amber-400 font-bold text-amber-950' : 'bg-white border-gray-200 text-gray-700'
                  }`}>
                    <input
                      type="radio"
                      name="replicateScope"
                      checked={replicateScope === 'current'}
                      onChange={() => setReplicateScope('current')}
                      className="text-amber-700 focus:ring-amber-500 cursor-pointer"
                    />
                    <div>
                      <span className="text-xs block font-bold">🎯 Apenas o Procedimento Selecionado</span>
                      <span className="text-[10.5px] text-gray-500 block font-normal">
                        Código {activeProcedure.code} - {activeProcedure.description}
                      </span>
                    </div>
                  </label>

                  {/* Specialty Option */}
                  <label className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition ${
                    replicateScope === 'specialty' ? 'bg-amber-50/80 border-amber-400 font-bold text-amber-950' : 'bg-white border-gray-200 text-gray-700'
                  }`}>
                    <input
                      type="radio"
                      name="replicateScope"
                      checked={replicateScope === 'specialty'}
                      onChange={() => setReplicateScope('specialty')}
                      className="text-amber-700 focus:ring-amber-500 cursor-pointer"
                    />
                    <div>
                      <span className="text-xs block font-bold">📁 Todos os Procedimentos da Especialidade "{activeProcedure.specialty}"</span>
                      <span className="text-[10.5px] text-gray-500 block font-normal">
                        Aplica a {tussProcedures.filter(p => p.specialty === activeProcedure.specialty).length} procedimento(s) desta categoria.
                      </span>
                    </div>
                  </label>

                  {/* Selected Procedures Option */}
                  <label className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition ${
                    replicateScope === 'selected' ? 'bg-amber-50/80 border-amber-400 font-bold text-amber-950' : 'bg-white border-gray-200 text-gray-700'
                  }`}>
                    <input
                      type="radio"
                      name="replicateScope"
                      checked={replicateScope === 'selected'}
                      onChange={() => setReplicateScope('selected')}
                      className="text-amber-700 focus:ring-amber-500 mt-0.5 cursor-pointer"
                    />
                    <div className="w-full">
                      <span className="text-xs block font-bold">📑 Selecionar Alguns Procedimentos Específicos</span>
                      <span className="text-[10.5px] text-gray-500 block font-normal">
                        Escolha manualmente na lista abaixo ({replicateSelectedCodes.length} selecionados).
                      </span>

                      {replicateScope === 'selected' && (
                        <div className="mt-3 bg-white border border-gray-200 rounded-xl p-3 space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-gray-400" />
                              <input
                                type="text"
                                placeholder="Buscar código ou nome..."
                                value={replicateSearchQuery}
                                onChange={(e) => setReplicateSearchQuery(e.target.value)}
                                className="w-full bg-[#fbfbf9] border border-gray-300 rounded-lg pl-8 pr-2 py-1 text-xs font-normal"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                if (replicateSelectedCodes.length === tussProcedures.length) {
                                  setReplicateSelectedCodes([]);
                                } else {
                                  setReplicateSelectedCodes(tussProcedures.map(p => p.code));
                                }
                              }}
                              className="text-[10.5px] font-bold text-amber-800 hover:underline cursor-pointer shrink-0"
                            >
                              {replicateSelectedCodes.length === tussProcedures.length ? 'Desmarcar Todos' : 'Marcar Todos'}
                            </button>
                          </div>

                          <div className="max-h-40 overflow-y-auto space-y-1 pr-1 border-t border-gray-100 pt-2">
                            {tussProcedures
                              .filter(p => 
                                p.code.toLowerCase().includes(replicateSearchQuery.toLowerCase()) ||
                                p.description.toLowerCase().includes(replicateSearchQuery.toLowerCase())
                              )
                              .map(p => {
                                const isSel = replicateSelectedCodes.includes(p.code);
                                return (
                                  <button
                                    key={p.code}
                                    type="button"
                                    onClick={() => {
                                      if (isSel) {
                                        setReplicateSelectedCodes(replicateSelectedCodes.filter(c => c !== p.code));
                                      } else {
                                        setReplicateSelectedCodes([...replicateSelectedCodes, p.code]);
                                      }
                                    }}
                                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between font-normal transition ${
                                      isSel ? 'bg-amber-100/70 text-amber-950 font-bold' : 'hover:bg-gray-100 text-gray-700'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2 truncate">
                                      {isSel ? <CheckSquare className="w-3.5 h-3.5 text-amber-800 shrink-0" /> : <Square className="w-3.5 h-3.5 text-gray-400 shrink-0" />}
                                      <span className="font-mono text-[11px] font-bold">{p.code}</span>
                                      <span className="truncate">{p.description}</span>
                                    </div>
                                    <span className="text-[10px] text-amber-800 font-bold shrink-0 ml-2">
                                      R$ {p.suggestedCost.toFixed(2)}
                                    </span>
                                  </button>
                                );
                              })}
                          </div>
                        </div>
                      )}
                    </div>
                  </label>

                  {/* All Procedures Option */}
                  <label className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition ${
                    replicateScope === 'all' ? 'bg-amber-50/80 border-amber-400 font-bold text-amber-950' : 'bg-white border-gray-200 text-gray-700'
                  }`}>
                    <input
                      type="radio"
                      name="replicateScope"
                      checked={replicateScope === 'all'}
                      onChange={() => setReplicateScope('all')}
                      className="text-amber-700 focus:ring-amber-500 cursor-pointer"
                    />
                    <div>
                      <span className="text-xs block font-bold">🌐 Todos os Procedimentos do Catálogo TUSS</span>
                      <span className="text-[10.5px] text-gray-500 block font-normal">
                        Aplica a todos os {tussProcedures.length} procedimentos cadastrados no sistema.
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* SUMMARY BOX */}
              <div className="bg-amber-100/60 border border-amber-300 rounded-2xl p-3.5 text-xs text-amber-950 space-y-1">
                <span className="font-bold flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-700" />
                  Resumo da Replicação:
                </span>
                <p className="text-[11.5px] text-amber-900 leading-relaxed">
                  Os valores da tabela <strong className="underline">{priceTables.find(t => t.id === replicateSourceTableId)?.name}</strong> serão multiplicados por <strong>{replicateMultiplier}%</strong> e aplicados nas tabelas de destino para <strong>
                    {replicateScope === 'current' && '1 procedimento'}
                    {replicateScope === 'specialty' && `${tussProcedures.filter(p => p.specialty === activeProcedure.specialty).length} procedimentos da especialidade ${activeProcedure.specialty}`}
                    {replicateScope === 'selected' && `${replicateSelectedCodes.length} procedimentos selecionados`}
                    {replicateScope === 'all' && `todos os ${tussProcedures.length} procedimentos`}
                  </strong>.
                </p>
              </div>

            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
              <button
                type="button"
                onClick={() => setIsReplicateModalOpen(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmReplication}
                className="px-5 py-2 bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5"
              >
                <Zap className="w-4 h-4" />
                <span>Aplicar Replicação de Preços</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL DE IMPORTAÇÃO DE PROCEDIMENTOS (PDF / CSV) */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-emerald-200 space-y-4 animate-scaleUp max-h-[90vh] flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-700" />
                  <h3 className="text-sm font-extrabold text-[#2c3e2e]">
                    Pré-visualização da Importação ({importingFileName})
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-gray-600">
                Identificamos os seguintes procedimentos no arquivo. Desmarque os itens que não deseja importar para a tabela <strong className="text-emerald-900">{priceTables.find(t => t.id === importingConvenioId)?.name}</strong>:
              </p>

              <div className="border border-gray-200 rounded-2xl max-h-72 overflow-y-auto custom-scrollbar p-2 space-y-1.5 bg-[#fbfbf9]">
                {importPreviewRows.map((row, idx) => (
                  <label
                    key={idx}
                    className="p-2.5 bg-white border border-gray-200 rounded-xl flex items-center justify-between gap-3 cursor-pointer hover:bg-emerald-50/50 transition"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <input
                        type="checkbox"
                        checked={row.selected !== false}
                        onChange={(e) => {
                          const updated = [...importPreviewRows];
                          updated[idx].selected = e.target.checked;
                          setImportPreviewRows(updated);
                        }}
                        className="w-4 h-4 text-emerald-700 rounded border-gray-300 focus:ring-emerald-500 cursor-pointer shrink-0"
                      />
                      <span className="text-xs font-mono font-bold bg-emerald-100 text-emerald-900 px-1.5 py-0.5 rounded shrink-0">
                        {row.code}
                      </span>
                      {row.specialty && (
                        <span className="text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200 px-1.5 py-0.2 rounded-md shrink-0">
                          {row.specialty}
                        </span>
                      )}
                      <span className="text-xs font-bold text-gray-800 line-clamp-1">
                        {row.description}
                      </span>
                    </div>

                    <span className="text-xs font-mono font-bold text-emerald-900 shrink-0">
                      R$ {row.price.toFixed(2)}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-gray-100 pt-3">
              <span className="text-xs font-bold text-gray-500">
                Total selecionado: {importPreviewRows.filter(r => r.selected !== false).length} de {importPreviewRows.length} item(ns)
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-600 hover:bg-gray-200 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmImport}
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Confirmar Importação</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
