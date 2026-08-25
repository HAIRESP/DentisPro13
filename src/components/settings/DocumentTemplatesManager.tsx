import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { RELATIONAL_DOCUMENT_VARIABLES } from '../../data/documentTemplatesCatalog';
import { CustomDocumentTemplate } from '../../types';
import { 
  FileText, 
  Database, 
  Copy, 
  Check, 
  RotateCcw, 
  Save, 
  Info, 
  Edit3, 
  Sliders, 
  Sparkles,
  Eye,
  FileCheck2,
  Tag,
  Code,
  Plus
} from 'lucide-react';

export const DocumentTemplatesManager: React.FC = () => {
  const { documentTemplates, updateDocumentTemplate, resetDocumentTemplates } = useApp();
  
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(documentTemplates[0]?.id || 'atestado_medico');
  const activeTemplate = documentTemplates.find(t => t.id === selectedTemplateId) || documentTemplates[0];

  const [templateText, setTemplateText] = useState<string>(activeTemplate?.templateText || '');
  const [copiedTag, setCopiedTag] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'dictionary' | 'overrides'>('editor');
  const [searchVarQuery, setSearchVarQuery] = useState<string>('');

  // Sync state when template selection changes
  const handleSelectTemplate = (id: string) => {
    setSelectedTemplateId(id);
    const tpl = documentTemplates.find(t => t.id === id);
    if (tpl) {
      setTemplateText(tpl.templateText);
    }
  };

  // Insert variable tag into editor
  const handleInsertTag = (placeholder: string) => {
    setTemplateText(prev => prev + ' ' + placeholder + ' ');
  };

  // Copy tag to clipboard
  const handleCopyTag = (placeholder: string) => {
    navigator.clipboard.writeText(placeholder);
    setCopiedTag(placeholder);
    setTimeout(() => setCopiedTag(null), 2000);
  };

  // Save changes
  const handleSave = () => {
    if (!activeTemplate) return;
    updateDocumentTemplate(activeTemplate.id, templateText);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  // Reset all templates
  const handleReset = () => {
    if (window.confirm('Deseja restaurar todos os modelos de documentos para os textos padrões iniciais do sistema?')) {
      resetDocumentTemplates();
      const first = documentTemplates[0];
      if (first) {
        setTemplateText(first.templateText);
      }
    }
  };

  // Filter variables
  const filteredVariables = RELATIONAL_DOCUMENT_VARIABLES.filter(v => 
    v.placeholder.toLowerCase().includes(searchVarQuery.toLowerCase()) ||
    v.label.toLowerCase().includes(searchVarQuery.toLowerCase()) ||
    v.dbPath.toLowerCase().includes(searchVarQuery.toLowerCase()) ||
    v.description.toLowerCase().includes(searchVarQuery.toLowerCase())
  );

  // Preview live replacement with sample data
  const getLivePreviewText = () => {
    let result = templateText;
    RELATIONAL_DOCUMENT_VARIABLES.forEach(v => {
      const regex = new RegExp(v.placeholder.replace(/[{()}]/g, '\\$&'), 'g');
      result = result.replace(regex, v.exampleValue);
    });
    return result;
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#2c2c2c] to-[#4a4a38] text-white p-6 rounded-[24px] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-bold flex items-center gap-2 tracking-tight">
            <FileText className="w-6 h-6 text-[#d4a373]" />
            Gerenciador de Modelos de Documentos
          </h2>
          <p className="text-xs text-gray-300 max-w-2xl leading-relaxed">
            Configure e personalize os textos de atestados, declarações, receituários e laudos da clínica. O sistema substitui automaticamente as variáveis entre chaves <code className="bg-black/30 px-1.5 py-0.5 rounded text-amber-300 font-mono">{"{{TAG}}"}</code> pelos dados reais cadastrados no banco de dados relacional.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleReset}
            className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer border border-white/20"
            title="Restaurar modelos padrão de fábrica"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Restaurar Padrões
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 bg-[#d4a373] hover:bg-[#c29263] text-[#2c2c2c] text-xs font-extrabold rounded-xl flex items-center gap-2 transition cursor-pointer shadow-md"
          >
            {saveSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-950" />
                Salvo com Sucesso!
              </>
            ) : (
              <>
                <Save className="w-4 h-4 text-emerald-950" />
                Salvar Modelo Atual
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Template Selector List */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-white border border-[#e5e5d1] rounded-[24px] p-4 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#5a5a40] flex items-center gap-1.5 pb-2 border-b border-[#e5e5d1]">
              <FileCheck2 className="w-4 h-4 text-[#d4a373]" />
              Modelos de Documentos
            </h3>

            <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1 custom-scrollbar">
              {documentTemplates.map((tpl) => {
                const isSelected = tpl.id === selectedTemplateId;
                return (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => handleSelectTemplate(tpl.id)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition cursor-pointer relative ${
                      isSelected 
                        ? 'bg-[#5a5a40] text-white border-[#5a5a40] shadow-sm' 
                        : 'bg-[#fbfbf9] text-[#2c2c2c] border-[#e5e5d1] hover:border-[#d4a373] hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-xs font-extrabold truncate ${isSelected ? 'text-white' : 'text-[#2c2c2c]'}`}>
                        {tpl.title}
                      </span>
                      <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        isSelected ? 'bg-amber-400 text-black' : 'bg-[#e5e5d1] text-[#5a5a40]'
                      }`}>
                        {tpl.category}
                      </span>
                    </div>

                    <p className={`text-[11px] mt-1 line-clamp-2 ${isSelected ? 'text-gray-200' : 'text-gray-500'}`}>
                      {tpl.subtitle}
                    </p>

                    {tpl.updatedAt && (
                      <span className={`text-[9px] block mt-2 ${isSelected ? 'text-amber-200/80' : 'text-gray-400'}`}>
                        Editado em: {new Date(tpl.updatedAt).toLocaleDateString('pt-BR')}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Info Box */}
          <div className="bg-amber-50 border border-amber-200/80 rounded-[20px] p-4 text-xs text-amber-900 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-amber-950">
              <Info className="w-4 h-4 text-amber-600 shrink-0" />
              Substituição Automática no Prontuário
            </div>
            <p className="text-[11px] leading-relaxed opacity-90">
              Ao gerar um documento na aba <strong>Documentos / Prontuário</strong>, o sistema puxa as variáveis do paciente selecionado e imprime o texto exato configurado neste modelo.
            </p>
          </div>
        </div>

        {/* Right Column: Template Editor & Variables Dictionary */}
        <div className="lg:col-span-8 space-y-4">
          {/* Sub-tab Switcher */}
          <div className="flex items-center gap-2 border-b border-[#e5e5d1] pb-3">
            <button
              type="button"
              onClick={() => setActiveTab('editor')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition cursor-pointer ${
                activeTab === 'editor' 
                  ? 'bg-[#5a5a40] text-white shadow-xs' 
                  : 'bg-[#fbfbf9] text-gray-600 hover:bg-white border border-[#e5e5d1]'
              }`}
            >
              <Edit3 className="w-4 h-4" />
              Editor de Texto do Modelo
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('dictionary')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition cursor-pointer ${
                activeTab === 'dictionary' 
                  ? 'bg-[#5a5a40] text-white shadow-xs' 
                  : 'bg-[#fbfbf9] text-gray-600 hover:bg-white border border-[#e5e5d1]'
              }`}
            >
              <Database className="w-4 h-4" />
              Dicionário de Variáveis do Banco de Dados
              <span className="ml-1 bg-amber-400 text-black text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {RELATIONAL_DOCUMENT_VARIABLES.length}
              </span>
            </button>
          </div>

          {/* Tab 1: Editor */}
          {activeTab === 'editor' && (
            <div className="bg-white border border-[#e5e5d1] rounded-[24px] p-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#e5e5d1] pb-3">
                <div>
                  <h3 className="text-sm font-bold text-[#2c2c2c]">{activeTemplate.title}</h3>
                  <p className="text-xs text-gray-500">{activeTemplate.description}</p>
                </div>
                <span className="text-xs bg-[#f4f4ec] text-[#5a5a40] font-bold px-3 py-1 rounded-xl border border-[#e5e5d1] self-start sm:self-auto">
                  ID: <code className="font-mono text-[#d4a373]">{activeTemplate.id}</code>
                </span>
              </div>

              {/* Tag Quick Bar */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold uppercase text-gray-500 tracking-wider flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-[#d4a373]" />
                  Inserir Variável no Ponto de Inserção:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {RELATIONAL_DOCUMENT_VARIABLES.slice(0, 10).map((v) => (
                    <button
                      key={v.placeholder}
                      type="button"
                      onClick={() => handleInsertTag(v.placeholder)}
                      className="px-2.5 py-1 bg-[#f4f4ec] hover:bg-[#e5e5d1] text-[#5a5a40] text-[11px] font-mono font-bold rounded-lg border border-[#e5e5d1] transition cursor-pointer flex items-center gap-1 hover:scale-105"
                      title={v.description}
                    >
                      <Plus className="w-3 h-3 text-[#d4a373]" />
                      {v.placeholder}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setActiveTab('dictionary')}
                    className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 text-[11px] font-bold rounded-lg transition cursor-pointer"
                  >
                    Ver todas (+{RELATIONAL_DOCUMENT_VARIABLES.length - 10})
                  </button>
                </div>
              </div>

              {/* Textarea Editor */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#5a5a40] flex items-center gap-1.5">
                  <Code className="w-4 h-4 text-[#d4a373]" />
                  Corpo do Documento (Edite o texto mantendo as tags{" {{TAG}} "}):
                </label>
                <textarea
                  value={templateText}
                  onChange={(e) => setTemplateText(e.target.value)}
                  rows={14}
                  className="w-full bg-[#fbfbf9] border border-[#e5e5d1] rounded-2xl p-4 text-xs font-mono text-[#2c2c2c] leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#5a5a40]/30 focus:border-[#5a5a40] custom-scrollbar shadow-inner"
                  placeholder="Digite o texto do modelo..."
                />
              </div>

              {/* Real-time Document Preview */}
              <div className="space-y-2 pt-2 border-t border-[#e5e5d1]">
                <h4 className="text-xs font-bold text-[#5a5a40] flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-[#d4a373]" />
                  Pré-visualização do Documento com Dados do Banco Exemplo:
                </h4>
                <div className="bg-[#fcfcf8] border border-dashed border-[#d4a373] rounded-2xl p-5 text-xs text-gray-800 leading-relaxed font-serif whitespace-pre-line shadow-xs">
                  {getLivePreviewText()}
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Variables Dictionary Table */}
          {activeTab === 'dictionary' && (
            <div className="bg-white border border-[#e5e5d1] rounded-[24px] p-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e5e5d1] pb-3">
                <div>
                  <h3 className="text-sm font-bold text-[#2c2c2c] flex items-center gap-2">
                    <Database className="w-4 h-4 text-[#d4a373]" />
                    Mapeamento Relacional de Variáveis do Banco de Dados
                  </h3>
                  <p className="text-xs text-gray-500">
                    Consulte as tags disponíveis, o caminho no schema SQL e o valor de exemplo renderizado.
                  </p>
                </div>

                <div className="w-full sm:w-64">
                  <input
                    type="text"
                    value={searchVarQuery}
                    onChange={(e) => setSearchVarQuery(e.target.value)}
                    placeholder="Buscar variável ou campo..."
                    className="w-full bg-[#fbfbf9] border border-[#e5e5d1] rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#5a5a40]/20"
                  />
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto rounded-2xl border border-[#e5e5d1]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#5a5a40] text-white uppercase text-[10px] tracking-wider font-extrabold">
                    <tr>
                      <th className="p-3">Tag / Variável</th>
                      <th className="p-3">Nome / Descrição</th>
                      <th className="p-3">Caminho SQL / Schema</th>
                      <th className="p-3">Exemplo no Prontuário</th>
                      <th className="p-3 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e5e5d1]">
                    {filteredVariables.map((v) => (
                      <tr key={v.placeholder} className="hover:bg-[#fcfcf8] transition">
                        <td className="p-3 font-mono font-bold text-[#d4a373] whitespace-nowrap">
                          {v.placeholder}
                        </td>
                        <td className="p-3">
                          <span className="font-bold text-[#2c2c2c] block">{v.label}</span>
                          <span className="text-[11px] text-gray-500">{v.description}</span>
                        </td>
                        <td className="p-3 font-mono text-[11px] text-gray-600 bg-gray-50/50">
                          {v.dbPath}
                        </td>
                        <td className="p-3 text-[#5a5a40] font-semibold">
                          {v.exampleValue}
                        </td>
                        <td className="p-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleCopyTag(v.placeholder)}
                            className="px-2.5 py-1 bg-[#f4f4ec] hover:bg-[#5a5a40] hover:text-white text-[#5a5a40] text-[11px] font-bold rounded-lg border border-[#e5e5d1] transition cursor-pointer inline-flex items-center gap-1"
                          >
                            {copiedTag === v.placeholder ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-600" />
                                Copiado
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3 text-[#d4a373]" />
                                Copiar
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
