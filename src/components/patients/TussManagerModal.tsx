import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TUSSProcedure, PriceTable, ProcedureMaterialRequirement } from '../../types';
import { REGION_LEGENDS, formatRegionDisplay } from '../../data/regionData';
import { RegionSelector } from './RegionSelector';
import { AutocompleteInput } from '../common/AutocompleteInput';
import { SpecialtyInputSelector } from '../common/SpecialtyInputSelector';
import { 
  X, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  Save, 
  DollarSign, 
  Layers, 
  Check, 
  ShieldCheck, 
  FileText,
  Building2,
  List,
  Download,
  Users,
  Phone,
  PackageCheck,
  Package,
  ChevronDown,
  ChevronUp,
  Boxes
} from 'lucide-react';

interface TussManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TussManagerModal: React.FC<TussManagerModalProps> = ({ isOpen, onClose }) => {
  const { 
    tussProcedures, 
    addTussProcedure, 
    updateTussProcedure, 
    deleteTussProcedure,
    priceTables,
    addPriceTable,
    updatePriceTable,
    deletePriceTable,
    patients,
    inventory
  } = useApp();

  const [activeTab, setActiveTab] = useState<'procedimentos' | 'pacientes' | 'convenios' | 'regioes'>('procedimentos');
  const [searchTerm, setSearchTerm] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('todas');
  const [patientSearch, setPatientSearch] = useState('');

  // Expand procedure row for materials view
  const [expandedProcCode, setExpandedProcCode] = useState<string | null>(null);

  // Edit Procedure state
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<TUSSProcedure>>({});

  // New Procedure modal form
  const [isAddingProc, setIsAddingProc] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newTissCode, setNewTissCode] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newFaces, setNewFaces] = useState('');
  const [newSpec, setNewSpec] = useState('Dentística & Estética');
  const [newFullDesc, setNewFullDesc] = useState('');
  const [newRegion, setNewRegion] = useState('');
  const [newPrices, setNewPrices] = useState<Record<string, number>>({});
  const [newReqMaterials, setNewReqMaterials] = useState<ProcedureMaterialRequirement[]>([]);
  const [newImages, setNewImages] = useState<string[]>([]);
  const [newVideos, setNewVideos] = useState<string[]>([]);
  const [tempImageUrl, setTempImageUrl] = useState('');
  const [tempVideoUrl, setTempVideoUrl] = useState('');

  // Temporary inputs for adding material requirement to new or edited procedure
  const [tempMatName, setTempMatName] = useState('');
  const [tempMatQty, setTempMatQty] = useState<number>(1);
  const [tempMatUnit, setTempMatUnit] = useState('unidade');

  // New Price Table form
  const [newTableName, setNewTableName] = useState('');
  const [newTableDesc, setNewTableDesc] = useState('');

  // Edit Price Table state
  const [editingTableId, setEditingTableId] = useState<string | null>(null);
  const [editTableName, setEditTableName] = useState('');
  const [editTableDesc, setEditTableDesc] = useState('');

  const handleStartEditTable = (tbl: PriceTable) => {
    setEditingTableId(tbl.id);
    setEditTableName(tbl.name);
    setEditTableDesc(tbl.description || '');
  };

  const handleSaveEditTable = (id: string) => {
    if (!editTableName.trim()) return;
    updatePriceTable(id, {
      name: editTableName.trim(),
      description: editTableDesc.trim()
    });
    setEditingTableId(null);
  };

  if (!isOpen) return null;

  const specialties = Array.from(new Set(tussProcedures.map(p => p.specialty)));

  const filteredProcedures = tussProcedures.filter(proc => {
    const matchesSearch = proc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          proc.code.includes(searchTerm) ||
                          (proc.tissCode && proc.tissCode.includes(searchTerm)) ||
                          (proc.subgroup && proc.subgroup.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (proc.odontoGrouping && proc.odontoGrouping.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (proc.faces && proc.faces.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (proc.defaultRegion && proc.defaultRegion.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (proc.requiredMaterials && proc.requiredMaterials.some(m => m.materialName.toLowerCase().includes(searchTerm.toLowerCase())));
    const matchesSpec = specialtyFilter === 'todas' || proc.specialty === specialtyFilter;
    return matchesSearch && matchesSpec;
  });

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(patientSearch.toLowerCase()) || 
    p.phone.includes(patientSearch)
  );

  const handleStartEdit = (proc: TUSSProcedure) => {
    setEditingCode(proc.code);
    setEditFormData({
      ...proc,
      prices: { ...proc.prices },
      requiredMaterials: proc.requiredMaterials ? [...proc.requiredMaterials] : []
    });
  };

  const handleSaveEdit = () => {
    if (!editingCode) return;
    updateTussProcedure(editingCode, editFormData);
    setEditingCode(null);
  };

  const handleAddProc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim() || !newDesc.trim()) return;

    const baseCost = newPrices['particular'] || newPrices[priceTables[0]?.id] || 200;

    const proc: TUSSProcedure = {
      id: `proc-${Date.now()}`,
      code: newCode.trim(),
      tissCode: newTissCode.trim() || undefined,
      description: newDesc.trim(),
      faces: newFaces.trim() || undefined,
      specialty: newSpec,
      suggestedCost: baseCost,
      prices: { ...newPrices },
      defaultRegion: newRegion || 'Dente Específico',
      fullDescription: newFullDesc.trim() || newDesc.trim(),
      requiredMaterials: newReqMaterials,
      images: newImages,
      videos: newVideos
    };

    addTussProcedure(proc);
    setIsAddingProc(false);
    setNewCode('');
    setNewTissCode('');
    setNewDesc('');
    setNewFaces('');
    setNewFullDesc('');
    setNewPrices({});
    setNewReqMaterials([]);
    setNewImages([]);
    setNewVideos([]);
  };

  const handleAddTable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTableName.trim()) return;
    addPriceTable({
      name: newTableName.trim(),
      description: newTableDesc.trim()
    });
    setNewTableName('');
    setNewTableDesc('');
  };

  const handleExportCSV = () => {
    if (activeTab === 'procedimentos') {
      const headers = ['Código TUSS', 'Descrição', 'Face', 'Especialidade', 'Região Padrão', 'Custo Sugerido (R$)', ...priceTables.map(t => `Preço ${t.name} (R$)`)];
      const rows = filteredProcedures.map(p => {
        const prices = priceTables.map(t => (p.prices?.[t.id] ?? p.suggestedCost).toFixed(2));
        return [
          `"${p.code}"`,
          `"${p.description.replace(/"/g, '""')}"`,
          `"${(p.faces || '').replace(/"/g, '""')}"`,
          `"${p.specialty.replace(/"/g, '""')}"`,
          `"${p.defaultRegion || ''}"`,
          p.suggestedCost.toFixed(2),
          ...prices
        ].join(';');
      });

      const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `tabela_procedimentos_${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (activeTab === 'pacientes') {
      const headers = ['Paciente', 'Telefone'];
      const rows = filteredPatients.map(p => [
        `"${p.name.replace(/"/g, '""')}"`,
        `"${p.phone}"`
      ].join(';'));

      const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `tabela_pacientes_${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (activeTab === 'convenios') {
      const headers = ['ID Tabela', 'Nome do Convênio / Tabela', 'Descrição'];
      const rows = priceTables.map(t => [
        `"${t.id}"`,
        `"${t.name.replace(/"/g, '""')}"`,
        `"${(t.description || '').replace(/"/g, '""')}"`
      ].join(';'));

      const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `tabelas_de_convenios_${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (activeTab === 'regioes') {
      const headers = ['Abreviação / Código', 'Nome da Região', 'Categoria', 'Dentes Relacionados'];
      const rows = REGION_LEGENDS.map(r => [
        `"${r.code}"`,
        `"${r.name.replace(/"/g, '""')}"`,
        `"${r.category}"`,
        `"${r.teeth.join(', ')}"`
      ].join(';'));

      const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `tabela_regioes_dentes_${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#fcfcf9] rounded-2xl border border-[#e5e5d1] shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-4 bg-[#2c3e2e] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#3d523f] rounded-lg">
              <ShieldCheck className="w-6 h-6 text-[#d4a373]" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Catálogo de Procedimentos, Pacientes & Tabelas de Preço</h2>
              <p className="text-xs text-gray-300">Gerencie a lista de procedimentos, pacientes, adequação de preços por convênio e regiões</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[#3d523f] text-gray-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-[#e5e5d1]">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab('procedimentos')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'procedimentos'
                  ? 'bg-[#2c3e2e] text-white shadow-sm'
                  : 'bg-[#f4f4eb] text-[#5a5a40] hover:bg-[#e8e8db]'
              }`}
            >
              <FileText className="w-4 h-4 text-[#d4a373]" />
              Procedimentos ({tussProcedures.length})
            </button>
            <button
              onClick={() => setActiveTab('pacientes')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'pacientes'
                  ? 'bg-[#2c3e2e] text-white shadow-sm'
                  : 'bg-[#f4f4eb] text-[#5a5a40] hover:bg-[#e8e8db]'
              }`}
            >
              <Users className="w-4 h-4 text-[#d4a373]" />
              Pacientes ({patients.length})
            </button>
            <button
              onClick={() => setActiveTab('convenios')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'convenios'
                  ? 'bg-[#2c3e2e] text-white shadow-sm'
                  : 'bg-[#f4f4eb] text-[#5a5a40] hover:bg-[#e8e8db]'
              }`}
            >
              <Building2 className="w-4 h-4 text-[#d4a373]" />
              Tabelas de Convênios ({priceTables.length})
            </button>
            <button
              onClick={() => setActiveTab('regioes')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'regioes'
                  ? 'bg-[#2c3e2e] text-white shadow-sm'
                  : 'bg-[#f4f4eb] text-[#5a5a40] hover:bg-[#e8e8db]'
              }`}
            >
              <Layers className="w-4 h-4 text-[#d4a373]" />
              Legenda de Regiões / Dentes ({REGION_LEGENDS.length})
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f4f4eb] hover:bg-[#e8e8db] text-[#5a5a40] border border-[#e5e5d1] rounded-lg text-xs font-bold transition-colors shadow-2xs"
              title="Exportar esta tabela em formato CSV / Excel"
            >
              <Download className="w-4 h-4 text-[#d4a373]" />
              <span>Exportar CSV</span>
            </button>

            {activeTab === 'procedimentos' && (
              <button
                onClick={() => setIsAddingProc(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-[#2d6a4f] text-white rounded-lg text-xs font-bold hover:bg-[#1b4332] transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Novo Procedimento
              </button>
            )}
          </div>
        </div>

        {/* TAB 1: PROCEDURES & PRICE MATRIX */}
        {activeTab === 'procedimentos' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-3 rounded-xl border border-[#e5e5d1]">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar por código TUSS, nome, face ou região..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-[#fdfdf9] border border-[#e5e5d1] rounded-lg text-xs focus:ring-2 focus:ring-[#d4a373]"
                />
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs font-bold text-[#5a5a40] shrink-0">Especialidade:</span>
                <select
                  value={specialtyFilter}
                  onChange={(e) => setSpecialtyFilter(e.target.value)}
                  className="bg-[#fdfdf9] border border-[#e5e5d1] rounded-lg text-xs p-2 focus:ring-2 focus:ring-[#d4a373]"
                >
                  <option value="todas">Todas as Especialidades</option>
                  {specialties.map(spec => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Procedures Table */}
            <div className="bg-white border border-[#e5e5d1] rounded-xl overflow-x-auto shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f4f4eb] border-b border-[#e5e5d1] text-[#5a5a40] uppercase font-bold">
                  <tr>
                    <th className="p-3">Código TUSS</th>
                    <th className="p-3">Descrição & Materiais Necessários</th>
                    <th className="p-3">Face</th>
                    <th className="p-3">Especialidade</th>
                    <th className="p-3">Região Padrão</th>
                    {priceTables.map(tbl => (
                      <th key={tbl.id} className="p-3 text-right bg-[#eaeae0]/50">
                        Preço ({tbl.name})
                      </th>
                    ))}
                    <th className="p-3 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5e5d1]">
                  {filteredProcedures.map(proc => {
                    const isEditing = editingCode === proc.code;
                    const isExpanded = expandedProcCode === proc.code;
                    const matCount = proc.requiredMaterials?.length || 0;

                    if (isEditing) {
                      const editMats = editFormData.requiredMaterials || [];
                      return (
                        <tr key={proc.code} className="bg-[#fefce8]">
                          <td colSpan={6 + priceTables.length} className="p-4 space-y-3">
                            <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                              <span className="font-mono font-bold text-amber-900 text-sm">
                                Editando Procedimento TUSS: {proc.code}
                              </span>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => setEditingCode(null)}
                                  className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-xs font-bold"
                                >
                                  Cancelar
                                </button>
                                <button
                                  type="button"
                                  onClick={handleSaveEdit}
                                  className="px-3 py-1 bg-[#2d6a4f] hover:bg-[#1b4332] text-white rounded-lg text-xs font-bold flex items-center gap-1"
                                >
                                  <Save className="w-3.5 h-3.5" />
                                  Salvar Alterações
                                </button>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                              <div>
                                <label className="block font-bold text-gray-700 mb-1">Descrição</label>
                                <input
                                  type="text"
                                  value={editFormData.description || ''}
                                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                                  className="w-full p-2 border border-amber-300 rounded-lg bg-white text-xs font-medium"
                                />
                              </div>

                              <div>
                                <label className="block font-bold text-gray-700 mb-1">Faces (Critérios: M, D, O, I, V, L [Inf], P [Sup])</label>
                                <input
                                  type="text"
                                  placeholder="ex: O, M/O, M/O/D, V, P"
                                  value={editFormData.faces || ''}
                                  onChange={(e) => setEditFormData({ ...editFormData, faces: e.target.value.toUpperCase() })}
                                  className="w-full p-2 border border-amber-300 rounded-lg bg-white text-xs font-mono uppercase"
                                />
                              </div>

                              <div>
                                <SpecialtyInputSelector
                                  value={editFormData.specialty || 'Dentística & Estética'}
                                  onChange={(val) => setEditFormData({ ...editFormData, specialty: val })}
                                />
                              </div>

                              <div>
                                <label className="block font-bold text-gray-700 mb-1">Região Padrão</label>
                                <input
                                  type="text"
                                  placeholder="ex: ASAI, HASD, S1"
                                  value={editFormData.defaultRegion || ''}
                                  onChange={(e) => setEditFormData({ ...editFormData, defaultRegion: e.target.value })}
                                  className="w-full p-2 border border-amber-300 rounded-lg bg-white text-xs font-mono"
                                />
                              </div>
                            </div>

                            {/* Allowed Regions Selector for Execution */}
                            <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-300 space-y-2">
                              <div className="flex items-center justify-between">
                                <label className="block font-bold text-amber-900 text-xs flex items-center gap-1.5">
                                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                  Regiões de Execução Autorizadas (Ex: Raspagem Supra-gengival ASAI / Arcadas / Hemi-Arcos)
                                </label>
                                <span className="text-[10px] text-amber-800 font-medium">
                                  Clique para alternar permissão das regiões
                                </span>
                              </div>

                              <div className="flex flex-wrap gap-1.5">
                                {['ASAI', 'AS', 'AI', 'HASD', 'HASE', 'HAIE', 'HAID', 'S1', 'S2', 'S3', 'S4', 'S5', 'S6'].map(code => {
                                  const allowed = editFormData.allowedRegions || [];
                                  const isChecked = allowed.includes(code);
                                  return (
                                    <button
                                      key={code}
                                      type="button"
                                      onClick={() => {
                                        const next = isChecked
                                          ? allowed.filter(c => c !== code)
                                          : [...allowed, code];
                                        setEditFormData({ ...editFormData, allowedRegions: next });
                                      }}
                                      className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition cursor-pointer flex items-center gap-1 ${
                                        isChecked
                                          ? 'bg-[#075e54] text-white border-[#075e54] shadow-xs'
                                          : 'bg-white text-gray-700 border-amber-200 hover:bg-amber-100'
                                      }`}
                                    >
                                      {isChecked && <Check className="w-3 h-3 text-white" />}
                                      <span>{code}</span>
                                    </button>
                                  );
                                })}
                              </div>

                              <div>
                                <label className="block font-bold text-amber-900 text-[11px] mb-1">
                                  Observações de Regras de Região (Regras por Convênio)
                                </label>
                                <input
                                  type="text"
                                  placeholder="Ex: Permite ASAI em particular; Hemi-arcos em convênios."
                                  value={editFormData.regionRulesNote || ''}
                                  onChange={(e) => setEditFormData({ ...editFormData, regionRulesNote: e.target.value })}
                                  className="w-full p-2 border border-amber-300 rounded-lg bg-white text-xs"
                                />
                              </div>
                            </div>

                            {/* Prices edit */}
                            <div>
                              <label className="block font-bold text-gray-700 mb-1">Preços por Tabela</label>
                              <div className="flex flex-wrap gap-3">
                                {priceTables.map(tbl => (
                                  <div key={tbl.id} className="flex items-center gap-1.5 bg-white p-2 border border-amber-200 rounded-lg">
                                    <span className="text-[11px] font-medium text-gray-600">{tbl.name}: R$</span>
                                    <input
                                      type="number"
                                      step="1"
                                      value={editFormData.prices?.[tbl.id] ?? proc.suggestedCost ?? 0}
                                      onChange={(e) => {
                                        const val = parseFloat(e.target.value) || 0;
                                        setEditFormData({
                                          ...editFormData,
                                          prices: {
                                            ...editFormData.prices,
                                            [tbl.id]: val
                                          }
                                        });
                                      }}
                                      className="w-24 p-1 border border-amber-300 rounded bg-white text-xs text-right font-bold"
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Required Materials Editor Section */}
                            <div className="bg-white border border-amber-300 rounded-xl p-3 space-y-2">
                              <div className="flex items-center justify-between">
                                <label className="block font-bold text-[#2c3e2e] flex items-center gap-1.5 text-xs">
                                  <PackageCheck className="w-4 h-4 text-emerald-600" />
                                  Materiais / Equipamentos Necessários para Execução ({editMats.length})
                                </label>
                                <span className="text-[11px] text-gray-400">Vínculo direto com Estoque</span>
                              </div>

                              {/* Material list */}
                              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                                {editMats.length === 0 ? (
                                  <p className="text-[11px] text-gray-400 italic">Nenhum material vinculado a este procedimento.</p>
                                ) : (
                                  editMats.map((mat, idx) => (
                                    <div key={mat.id || idx} className="flex items-center gap-2 bg-[#fdfdf9] p-1.5 rounded-lg border border-gray-200">
                                      <span className="text-xs font-semibold text-gray-800 flex-1">{mat.materialName}</span>
                                      <div className="flex items-center gap-1">
                                        <span className="text-[11px] text-gray-500">Qtd:</span>
                                        <input
                                          type="number"
                                          step="0.1"
                                          min="0.1"
                                          value={mat.quantityNeeded}
                                          onChange={(e) => {
                                            const val = parseFloat(e.target.value) || 1;
                                            const updated = [...editMats];
                                            updated[idx] = { ...updated[idx], quantityNeeded: val };
                                            setEditFormData({ ...editFormData, requiredMaterials: updated });
                                          }}
                                          className="w-16 p-1 border border-gray-300 rounded text-center text-xs font-bold"
                                        />
                                        <input
                                          type="text"
                                          value={mat.unit}
                                          onChange={(e) => {
                                            const updated = [...editMats];
                                            updated[idx] = { ...updated[idx], unit: e.target.value };
                                            setEditFormData({ ...editFormData, requiredMaterials: updated });
                                          }}
                                          className="w-20 p-1 border border-gray-300 rounded text-center text-xs"
                                        />
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const updated = editMats.filter((_, i) => i !== idx);
                                            setEditFormData({ ...editFormData, requiredMaterials: updated });
                                          }}
                                          className="p-1 text-red-500 hover:bg-red-50 rounded"
                                        >
                                          <X className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </div>
                                  ))
                                )}
                              </div>

                              {/* Add Material row */}
                              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100">
                                <select
                                  value={tempMatName}
                                  onChange={(e) => setTempMatName(e.target.value)}
                                  className="flex-1 p-1.5 bg-[#fefefe] border border-gray-300 rounded-lg text-xs"
                                >
                                  <option value="">-- Selecionar do Estoque ou Digitar Abaixo --</option>
                                  {[...inventory].sort((a, b) => (a.name || '').localeCompare(b.name || '', 'pt-BR')).map(item => (
                                    <option key={item.id} value={item.name}>
                                      {item.name} ({item.category} - Est: {item.quantity} {item.unit})
                                    </option>
                                  ))}
                                </select>

                                <input
                                  type="text"
                                  placeholder="Ou digite o nome do material/equipamento..."
                                  value={tempMatName}
                                  onChange={(e) => setTempMatName(e.target.value)}
                                  className="flex-1 p-1.5 border border-gray-300 rounded-lg text-xs"
                                />

                                <input
                                  type="number"
                                  step="0.5"
                                  min="0.1"
                                  value={tempMatQty}
                                  onChange={(e) => setTempMatQty(parseFloat(e.target.value) || 1)}
                                  className="w-16 p-1.5 border border-gray-300 rounded-lg text-xs font-bold text-center"
                                />

                                <input
                                  type="text"
                                  placeholder="unidade / tubete"
                                  value={tempMatUnit}
                                  onChange={(e) => setTempMatUnit(e.target.value)}
                                  className="w-24 p-1.5 border border-gray-300 rounded-lg text-xs text-center"
                                />

                                <button
                                  type="button"
                                  onClick={() => {
                                    if (!tempMatName.trim()) return;
                                    const newMat: ProcedureMaterialRequirement = {
                                      id: 'req-' + Date.now(),
                                      materialName: tempMatName.trim(),
                                      quantityNeeded: tempMatQty,
                                      unit: tempMatUnit.trim() || 'unidade'
                                    };
                                    setEditFormData({
                                      ...editFormData,
                                      requiredMaterials: [...editMats, newMat]
                                    });
                                    setTempMatName('');
                                    setTempMatQty(1);
                                  }}
                                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shrink-0"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                  Vincular Material
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    }

                    return (
                      <React.Fragment key={proc.code}>
                        <tr className="hover:bg-[#fcfdf9] transition-colors">
                          <td className="p-3 font-mono font-bold text-[#d4a373]">
                            <div>{proc.code}</div>
                            {proc.tissCode && proc.tissCode !== proc.code && (
                              <span className="text-[10px] text-gray-400 font-normal">TISS: {proc.tissCode}</span>
                            )}
                          </td>
                          <td className="p-3 font-semibold text-gray-800">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span>{proc.description}</span>
                              {proc.ansRolCurrent && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-900 border border-amber-200" title="Procedimento integrante do Rol de Procedimentos e Eventos em Saúde da ANS">
                                  Rol ANS
                                </span>
                              )}
                              {proc.odontoGrouping && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-blue-50 text-blue-800 border border-blue-200">
                                  {proc.odontoGrouping}
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={() => setExpandedProcCode(isExpanded ? null : proc.code)}
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 transition ${
                                  matCount > 0 
                                    ? 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200' 
                                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                }`}
                                title="Clique para ver a lista de materiais do procedimento"
                              >
                                <PackageCheck className="w-3 h-3 text-emerald-700" />
                                <span>{matCount} {matCount === 1 ? 'material' : 'materiais'}</span>
                                {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                              </button>
                            </div>
                            {proc.fullDescription && proc.fullDescription !== proc.description && (
                              <p className="text-[10px] text-gray-400 font-normal line-clamp-1 mt-0.5">{proc.fullDescription}</p>
                            )}
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 bg-[#f4f4eb] text-[#2c3e2e] border border-[#e5e5d1] rounded text-[11px] font-mono font-medium">
                              {proc.faces || '-'}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 bg-[#f0f0e4] text-[#5a5a40] rounded text-[10px] font-medium">
                              {proc.specialty}
                            </span>
                          </td>
                          <td className="p-3 font-mono text-[11px] text-gray-600">
                            {formatRegionDisplay(proc.defaultRegion)}
                          </td>
                          {priceTables.map(tbl => {
                            const tableCost = proc.prices?.[tbl.id] ?? proc.suggestedCost;
                            return (
                              <td key={tbl.id} className="p-3 text-right font-bold font-mono text-gray-800">
                                R$ {tableCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </td>
                            );
                          })}
                          <td className="p-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => handleStartEdit(proc)}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                                title="Editar preços, dados e lista de materiais"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => deleteTussProcedure(proc.code)}
                                className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                                title="Excluir procedimento"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* Expanded Material Details Row */}
                        {isExpanded && (
                          <tr className="bg-emerald-50/60 border-b border-emerald-200">
                            <td colSpan={6 + priceTables.length} className="p-3 pl-8">
                              <div className="bg-white border border-emerald-200 rounded-xl p-3 space-y-2 shadow-2xs">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                                    <PackageCheck className="w-4 h-4 text-emerald-600" />
                                    Lista Completa de Materiais & Equipamentos ({proc.description})
                                  </span>
                                  <button
                                    onClick={() => handleStartEdit(proc)}
                                    className="text-[11px] text-blue-700 font-bold hover:underline flex items-center gap-1"
                                  >
                                    <Edit2 className="w-3 h-3" /> Editar Vincúlos
                                  </button>
                                </div>

                                {(!proc.requiredMaterials || proc.requiredMaterials.length === 0) ? (
                                  <p className="text-xs text-gray-500 italic">Nenhum material vinculado a este procedimento. Clique em Editar para vincular.</p>
                                ) : (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                    {proc.requiredMaterials.map((mat, i) => (
                                      <div key={mat.id || i} className="bg-[#fcfdfa] border border-[#e5e5d1] rounded-lg p-2 flex items-center justify-between text-xs">
                                        <span className="font-semibold text-gray-800">{mat.materialName}</span>
                                        <span className="font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded text-[11px]">
                                          {mat.quantityNeeded} {mat.unit}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: PACIENTES */}
        {activeTab === 'pacientes' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-3 rounded-xl border border-[#e5e5d1]">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar paciente por nome ou telefone..."
                  value={patientSearch}
                  onChange={(e) => setPatientSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-[#fdfdf9] border border-[#e5e5d1] rounded-lg text-xs focus:ring-2 focus:ring-[#d4a373]"
                />
              </div>
              <span className="text-xs text-[#5a5a40] font-bold">Total: {filteredPatients.length} paciente(s)</span>
            </div>

            <div className="bg-white border border-[#e5e5d1] rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f4f4eb] border-b border-[#e5e5d1] text-[#5a5a40] uppercase font-bold">
                  <tr>
                    <th className="p-3">Paciente</th>
                    <th className="p-3">Telefone</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5e5d1]">
                  {filteredPatients.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="p-8 text-center text-gray-400 text-xs">
                        Nenhum paciente encontrado com esse termo.
                      </td>
                    </tr>
                  ) : (
                    filteredPatients.map(p => (
                      <tr key={p.id} className="hover:bg-[#fcfdf9] transition-colors">
                        <td className="p-3 font-semibold text-[#2c3e2e] flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-[#f0f0e4] text-[#2c3e2e] flex items-center justify-center font-bold text-xs border border-[#e5e5d1]">
                            {p.name.slice(0, 1).toUpperCase()}
                          </div>
                          <span>{p.name}</span>
                        </td>
                        <td className="p-3 font-mono text-gray-700">
                          <span className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-emerald-600" />
                            {p.phone}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: PRICE TABLES / CONVÊNIOS */}
        {activeTab === 'convenios' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="bg-white p-5 rounded-xl border border-[#e5e5d1] shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-[#2c3e2e] flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#d4a373]" />
                Adicionar Nova Tabela de Preço ou Convênio
              </h3>
              <form onSubmit={handleAddTable} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#5a5a40] mb-1">Nome da Tabela / Convênio</label>
                  <input
                    type="text"
                    placeholder="ex: Convênio Bradesco / Unimed"
                    value={newTableName}
                    onChange={(e) => setNewTableName(e.target.value)}
                    className="w-full p-2 bg-[#fdfdf9] border border-[#e5e5d1] rounded-lg text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#5a5a40] mb-1">Descrição do Convênio</label>
                  <input
                    type="text"
                    placeholder="ex: Tabela especial com desconto de 20%"
                    value={newTableDesc}
                    onChange={(e) => setNewTableDesc(e.target.value)}
                    className="w-full p-2 bg-[#fdfdf9] border border-[#e5e5d1] rounded-lg text-xs"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full p-2 bg-[#2d6a4f] text-white rounded-lg text-xs font-bold hover:bg-[#1b4332] transition-colors"
                  >
                    + Criar Tabela de Preço
                  </button>
                </div>
              </form>
            </div>

            <div className="bg-white border border-[#e5e5d1] rounded-xl overflow-hidden shadow-sm">
              <div className="p-4 bg-[#f4f4eb] border-b border-[#e5e5d1] font-bold text-xs text-[#2c3e2e]">
                Tabelas de Preço Ativas na Clínica ({priceTables.length})
              </div>
              <div className="divide-y divide-[#e5e5d1]">
                {priceTables.map(tbl => {
                  const isEditing = editingTableId === tbl.id;

                  if (isEditing) {
                    return (
                      <div key={tbl.id} className="p-4 bg-[#fefce8] space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-[#5a5a40] mb-1">Nome da Tabela / Convênio</label>
                            <input
                              type="text"
                              value={editTableName}
                              onChange={(e) => setEditTableName(e.target.value)}
                              className="w-full p-2 border border-amber-300 rounded-lg bg-white text-xs font-bold text-gray-800"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-[#5a5a40] mb-1">Descrição</label>
                            <input
                              type="text"
                              value={editTableDesc}
                              onChange={(e) => setEditTableDesc(e.target.value)}
                              className="w-full p-2 border border-amber-300 rounded-lg bg-white text-xs text-gray-800"
                            />
                          </div>
                        </div>
                        <div className="flex items-center justify-end gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => setEditingTableId(null)}
                            className="px-3 py-1.5 border border-[#e5e5d1] text-gray-600 rounded-lg text-xs font-bold hover:bg-white"
                          >
                            Cancelar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveEditTable(tbl.id)}
                            className="px-3 py-1.5 bg-[#2d6a4f] text-white rounded-lg text-xs font-bold hover:bg-[#1b4332] flex items-center gap-1 shadow-sm"
                          >
                            <Save className="w-3.5 h-3.5" />
                            Salvar Alterações
                          </button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={tbl.id} className="p-4 flex items-center justify-between hover:bg-[#fcfdf9]">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-[#2c3e2e]">{tbl.name}</span>
                          {tbl.isDefault && (
                            <span className="px-2 py-0.5 text-[10px] bg-[#d4a373]/20 text-[#2c3e2e] rounded font-bold">
                              Padrão
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{tbl.description || 'Sem descrição cadastrada'}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleStartEditTable(tbl)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Editar nome e descrição da tabela"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {!tbl.isDefault && (
                          <button
                            onClick={() => deletePriceTable(tbl.id)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                            title="Excluir tabela"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: REGION LEGEND REFERENCE */}
        {activeTab === 'regioes' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="bg-white p-4 rounded-xl border border-[#e5e5d1] shadow-sm">
              <h3 className="text-xs font-bold text-[#2c3e2e] mb-1">Legendas e Mapeamento de Regiões Anatômicas</h3>
              <p className="text-xs text-gray-500">
                Abaixo estão listadas todas as abreviações de regiões para radiografias, tecidos moles, tecidos duros e periodontia correlacionadas com os dentes correspondentes.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {['Radiografia Periapical', 'Radiografia Interproximal', 'Tecido Mole', 'Tecido Duro', 'Periodontia'].map(cat => {
                const regs = REGION_LEGENDS.filter(r => r.category === cat);
                return (
                  <div key={cat} className="bg-white border border-[#e5e5d1] rounded-xl overflow-hidden shadow-sm">
                    <div className="p-3 bg-[#f4f4eb] border-b border-[#e5e5d1] font-bold text-xs text-[#2c3e2e]">
                      {cat} ({regs.length})
                    </div>
                    <div className="p-3 max-h-60 overflow-y-auto divide-y divide-[#f0f0e4]">
                      {regs.map(reg => (
                        <div key={reg.code} className="py-2 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-bold text-[#d4a373] font-mono mr-2">[{reg.code}]</span>
                            <span className="text-gray-800 font-medium">{reg.name}</span>
                          </div>
                          {reg.teeth.length > 0 && (
                            <span className="text-[10px] font-mono bg-[#e8f5e9] text-[#2d6a4f] px-2 py-0.5 rounded font-bold">
                              Dentes: {reg.teeth.join('/')}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Modal footer */}
        <div className="p-4 bg-white border-t border-[#e5e5d1] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#2c3e2e] text-white rounded-lg text-xs font-bold hover:bg-[#1b2e1e] transition-colors"
          >
            Concluir / Fechar
          </button>
        </div>

      </div>

      {/* SUB-MODAL: Add New Procedure */}
      {isAddingProc && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-[#e5e5d1] shadow-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#e5e5d1] pb-3">
              <h3 className="text-sm font-bold text-[#2c3e2e]">Novo Procedimento</h3>
              <button onClick={() => setIsAddingProc(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddProc} className="space-y-3 text-xs max-h-[80vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#5a5a40] mb-1">Código TUSS (8 dígitos)</label>
                  <input
                    type="text"
                    placeholder="ex: 81000099"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    className="w-full p-2 bg-[#fdfdf9] border border-[#e5e5d1] rounded-lg font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#5a5a40] mb-1">Código TISS (Opcional)</label>
                  <input
                    type="text"
                    placeholder="ex: TISS-5521"
                    value={newTissCode}
                    onChange={(e) => setNewTissCode(e.target.value)}
                    className="w-full p-2 bg-[#fdfdf9] border border-[#e5e5d1] rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#5a5a40] mb-1">Nome / Descrição do Procedimento</label>
                <AutocompleteInput
                  value={newDesc}
                  onChange={setNewDesc}
                  suggestions={tussProcedures.map(p => ({
                    label: p.description,
                    subLabel: `TUSS: ${p.code} • ${p.specialty}`,
                    data: { code: p.code, specialty: p.specialty }
                  })).concat([
                    { label: 'Consulta Inicial / Diagnóstico e Plano de Tratamento', subLabel: 'TUSS: 81000030 • Diagnóstico' },
                    { label: 'Profilaxia / Remoção de placa e tártaro', subLabel: 'TUSS: 81000188 • Periodontia' },
                    { label: 'Restauração em Resina Composta (1 face)', subLabel: 'TUSS: 85100030 • Dentística' },
                    { label: 'Restauração em Resina Composta (2 faces)', subLabel: 'TUSS: 85100048 • Dentística' },
                    { label: 'Tratamento Endodôntico Unirradicular (Canal)', subLabel: 'TUSS: 85200010 • Endodontia' },
                    { label: 'Exodontia Simples de Dente Permanente', subLabel: 'TUSS: 85300015 • Cirurgia' },
                    { label: 'Coroa Total em Porcelana / Zircônia', subLabel: 'TUSS: 85500019 • Prótese' },
                    { label: 'Clareamento Dental a Laser no Consultório', subLabel: 'TUSS: 85600011 • Estética' }
                  ])}
                  onSelectSuggestion={(s) => {
                    if (s && (s as any).code && !newCode) {
                      setNewCode((s as any).code);
                    }
                    if (s && (s as any).specialty) {
                      setNewSpec((s as any).specialty);
                    }
                  }}
                  placeholder="ex: Restauração de Resina 1 Face ou digite..."
                  required
                />
              </div>

              {/* Images & Videos Input Section */}
              <div className="bg-[#fcfcf7] p-3 rounded-xl border border-[#e5e5d1] space-y-2">
                <label className="font-bold text-[#2c3e2e] block">Entrada de Imagens e/ou Vídeos Demonstrativos</label>
                
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="URL da Imagem (ex: https://.../foto.jpg)"
                    value={tempImageUrl}
                    onChange={(e) => setTempImageUrl(e.target.value)}
                    className="flex-1 p-1.5 bg-white border border-gray-300 rounded text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!tempImageUrl.trim()) return;
                      setNewImages([...newImages, tempImageUrl.trim()]);
                      setTempImageUrl('');
                    }}
                    className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-bold shrink-0"
                  >
                    + Imagem
                  </button>
                </div>

                {newImages.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {newImages.map((img, idx) => (
                      <div key={idx} className="relative group w-16 h-16 bg-gray-100 rounded-lg border overflow-hidden">
                        <img src={img} alt="Procedimento" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <button
                          type="button"
                          onClick={() => setNewImages(newImages.filter((_, i) => i !== idx))}
                          className="absolute top-0.5 right-0.5 bg-red-600 text-white rounded-full p-0.5 text-[10px]"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <input
                    type="url"
                    placeholder="URL do Vídeo / YouTube (ex: https://youtube.com/...)"
                    value={tempVideoUrl}
                    onChange={(e) => setTempVideoUrl(e.target.value)}
                    className="flex-1 p-1.5 bg-white border border-gray-300 rounded text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!tempVideoUrl.trim()) return;
                      setNewVideos([...newVideos, tempVideoUrl.trim()]);
                      setTempVideoUrl('');
                    }}
                    className="px-3 py-1.5 bg-amber-600 text-white rounded text-xs font-bold shrink-0"
                  >
                    + Vídeo
                  </button>
                </div>

                {newVideos.length > 0 && (
                  <div className="space-y-1 pt-1">
                    {newVideos.map((vid, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-white p-1.5 rounded border text-[11px]">
                        <span className="truncate text-blue-700 font-mono flex-1">{vid}</span>
                        <button
                          type="button"
                          onClick={() => setNewVideos(newVideos.filter((_, i) => i !== idx))}
                          className="text-red-500 hover:text-red-700 ml-2"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-[#5a5a40] mb-1">Faces (M=Mesial, D=Distal, O=Oclusal [Molares/Pré], I=Incisal [Incisivos/Caninos], V=Vestibular, L=Lingual [Inf], P=Palatina [Sup])</label>
                <input
                  type="text"
                  placeholder="ex: O, M/O, M/O/D, V, P"
                  value={newFaces}
                  onChange={(e) => setNewFaces(e.target.value.toUpperCase())}
                  className="w-full p-2 bg-[#fdfdf9] border border-[#e5e5d1] rounded-lg font-mono uppercase text-xs"
                />
              </div>

              <div>
                <SpecialtyInputSelector
                  value={newSpec}
                  onChange={(val) => setNewSpec(val)}
                />
              </div>

              <div>
                <label className="block font-bold text-[#5a5a40] mb-1">Região Padrão / Dente</label>
                <input
                  type="text"
                  placeholder="ex: RMSD, S1, MJ, ou Dente Específico"
                  value={newRegion}
                  onChange={(e) => setNewRegion(e.target.value)}
                  className="w-full p-2 bg-[#fdfdf9] border border-[#e5e5d1] rounded-lg font-mono"
                />
              </div>

              <div className="space-y-2 pt-1 border-t border-[#f0f0e4]">
                <label className="block font-bold text-[#2c3e2e]">Valores por Tabela de Preço (R$)</label>
                <div className="grid grid-cols-2 gap-2">
                  {priceTables.map(tbl => (
                    <div key={tbl.id}>
                      <span className="block text-[11px] text-gray-500 mb-0.5">{tbl.name}</span>
                      <input
                        type="number"
                        placeholder="R$ 0,00"
                        value={newPrices[tbl.id] || ''}
                        onChange={(e) => setNewPrices({ ...newPrices, [tbl.id]: parseFloat(e.target.value) || 0 })}
                        className="w-full p-2 bg-[#fdfdf9] border border-[#e5e5d1] rounded-lg text-right font-bold"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#5a5a40] mb-1">Descrição Laudo Técnico (PDF)</label>
                <textarea
                  rows={2}
                  placeholder="Descrição cirúrgico-restauradora completa para laudo ao paciente..."
                  value={newFullDesc}
                  onChange={(e) => setNewFullDesc(e.target.value)}
                  className="w-full p-2 bg-[#fdfdf9] border border-[#e5e5d1] rounded-lg"
                />
              </div>

              {/* Required Materials for New Procedure */}
              <div className="bg-[#f0f4ee] p-3 rounded-xl border border-[#d2dfd0] space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-[#2c3e2e] flex items-center gap-1.5 text-xs">
                    <PackageCheck className="w-4 h-4 text-emerald-600" />
                    Materiais / Equipamentos Necessários ({newReqMaterials.length})
                  </label>
                  <span className="text-[10px] text-gray-500">Baixa automática em consultas</span>
                </div>

                {newReqMaterials.length > 0 && (
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {newReqMaterials.map((mat, i) => (
                      <div key={mat.id || i} className="flex items-center justify-between bg-white p-1.5 rounded border border-gray-200 text-xs">
                        <span className="font-medium text-gray-800">{mat.materialName}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-emerald-700">{mat.quantityNeeded} {mat.unit}</span>
                          <button
                            type="button"
                            onClick={() => setNewReqMaterials(newReqMaterials.filter((_, idx) => idx !== i))}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <select
                    value={tempMatName}
                    onChange={(e) => setTempMatName(e.target.value)}
                    className="flex-1 p-1.5 bg-white border border-gray-300 rounded text-xs"
                  >
                    <option value="">-- Selecionar do Estoque --</option>
                    {[...inventory].sort((a, b) => (a.name || '').localeCompare(b.name || '', 'pt-BR')).map(item => (
                      <option key={item.id} value={item.name}>
                        {item.name} ({item.category})
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    step="0.5"
                    min="0.1"
                    value={tempMatQty}
                    onChange={(e) => setTempMatQty(parseFloat(e.target.value) || 1)}
                    className="w-14 p-1.5 bg-white border border-gray-300 rounded text-xs font-bold text-center"
                  />

                  <input
                    type="text"
                    placeholder="unid"
                    value={tempMatUnit}
                    onChange={(e) => setTempMatUnit(e.target.value)}
                    className="w-16 p-1.5 bg-white border border-gray-300 rounded text-xs text-center"
                  />

                  <button
                    type="button"
                    onClick={() => {
                      if (!tempMatName.trim()) return;
                      const mat: ProcedureMaterialRequirement = {
                        id: 'req-' + Date.now(),
                        materialName: tempMatName.trim(),
                        quantityNeeded: tempMatQty,
                        unit: tempMatUnit.trim() || 'unidade'
                      };
                      setNewReqMaterials([...newReqMaterials, mat]);
                      setTempMatName('');
                      setTempMatQty(1);
                    }}
                    className="px-2.5 py-1.5 bg-emerald-700 text-white rounded text-xs font-bold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Adicionar
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#e5e5d1]">
                <button
                  type="button"
                  onClick={() => setIsAddingProc(false)}
                  className="px-4 py-2 border border-[#e5e5d1] rounded-lg text-gray-600 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#2d6a4f] text-white rounded-lg font-bold hover:bg-[#1b4332]"
                >
                  Salvar Procedimento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
