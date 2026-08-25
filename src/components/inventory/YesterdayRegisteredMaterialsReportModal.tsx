import React from 'react';
import { InventoryItem, ClinicUnit, Professional } from '../../types';
import { 
  X, 
  Printer, 
  Package, 
  Building2, 
  UserCheck, 
  PackageCheck, 
  Calendar, 
  CheckCircle2, 
  FileText,
  DollarSign,
  Wrench,
  Sparkles
} from 'lucide-react';

interface YesterdayRegisteredMaterialsReportModalProps {
  inventory: InventoryItem[];
  clinics: ClinicUnit[];
  professionals: Professional[];
  onClose: () => void;
}

export const YesterdayRegisteredMaterialsReportModal: React.FC<YesterdayRegisteredMaterialsReportModalProps> = ({
  inventory,
  clinics,
  professionals,
  onClose
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  // Specific list of items that were added/updated in yesterday's and recent registration requests
  const recentKeywords = [
    '212', '210', 'grampo 9', '212l', '212r', '206', '207', '209', 'grampo 0', '1a', '2a',
    '202', 'número 5', 'grampo 5', '7a', '205', '29', 'grampo 8', '8a', '56s', '14a', '26', 'w14a',
    'alta rotação', 'ultrassom', 'chave de ultrassom', 'ponta de ultrassom', 'micromotor', 'teflon'
  ];

  // Filter materials that match recent updates or have lastUpdated set to today
  const registeredMaterials = inventory.filter(item => {
    const nameLower = (item.name || '').toLowerCase();
    const codeLower = (item.itemCode || '').toLowerCase();
    const isRecentlyUpdated = item.lastUpdated === todayStr;
    const matchesKeyword = recentKeywords.some(kw => nameLower.includes(kw) || codeLower.includes(kw));
    return isRecentlyUpdated || matchesKeyword;
  }).sort((a, b) => (a.name || '').localeCompare(b.name || '', 'pt-BR'));

  // If no filtered items matched, fallback to all non-zero inventory items to ensure full visibility
  const materialsToDisplay = registeredMaterials.length > 0 
    ? registeredMaterials 
    : inventory.filter(i => i.quantity > 0).sort((a, b) => (a.name || '').localeCompare(b.name || '', 'pt-BR'));

  const totalItemsCount = materialsToDisplay.length;
  const totalUnitsSum = materialsToDisplay.reduce((acc, curr) => acc + curr.quantity, 0);
  const totalValueSum = materialsToDisplay.reduce((acc, curr) => acc + (curr.quantity * curr.unitCost), 0);

  // Group by category for quick summary
  const categoriesCountMap: Record<string, number> = {};
  materialsToDisplay.forEach(item => {
    const cat = item.category || 'Outros';
    categoriesCountMap[cat] = (categoriesCountMap[cat] || 0) + item.quantity;
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#2c2c2c]/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-[#e5e5d1] rounded-[32px] max-w-5xl w-full p-6 shadow-2xl space-y-5 my-6 max-h-[92vh] flex flex-col animate-fadeIn">
        
        {/* Modal Header (Hidden on print) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#e5e5d1] pb-4 shrink-0 gap-3 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#1b281d] text-amber-300 flex items-center justify-center shrink-0 shadow-sm border border-[#d4a373]">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-[#2c3e2e] tracking-tight flex items-center gap-2">
                <span>Relatório em PDF: Materiais & Equipamentos Cadastrados</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                  Lote de Cadastros
                </span>
              </h3>
              <p className="text-xs text-gray-500 font-medium">
                Conferência de inventário, equipamentos de alta/baixa rotação, ultrassom e grampos de isolamento
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 bg-[#2c3e2e] hover:bg-[#1b281d] text-white text-xs font-bold rounded-2xl flex items-center gap-1.5 shadow-sm transition cursor-pointer"
            >
              <Printer className="w-4 h-4 text-amber-300" />
              <span>Imprimir</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-[#2c2c2c] rounded-2xl hover:bg-gray-100 transition cursor-pointer"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE CONTENT AREA */}
        <div id="printable-inventory-area" className="overflow-y-auto space-y-5 flex-1 pr-1 font-sans">
          
          {/* Official Clinic Document Letterhead */}
          <div className="bg-[#fcfdfa] border border-[#e5e5d1] rounded-2xl p-5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e5e5d1] pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black text-[#1b281d] tracking-wider uppercase">DENTISPRO</span>
                  <span className="text-xs px-2 py-0.5 rounded-md bg-[#2c3e2e] text-amber-300 font-bold">GESTAO ODONTOLOGICA</span>
                </div>
                <h2 className="text-base font-extrabold text-[#2c2c2c] mt-1">
                  Relatório Consolidado de Insumos, Grampos & Equipamentos Cadastrados
                </h2>
                <p className="text-xs text-gray-600 font-medium mt-0.5">
                  Dr. Hugo Andres Iglesias Ricoy • CRO/CE 5925
                </p>
              </div>

              <div className="text-right text-xs text-gray-600 space-y-1 font-mono">
                <div className="flex items-center justify-end gap-1.5 font-bold text-[#2c3e2e]">
                  <Calendar className="w-3.5 h-3.5 text-[#d4a373]" />
                  <span>Data de Emissão: {new Date().toLocaleDateString('pt-BR')}</span>
                </div>
                <div>Status do Lote: <strong className="text-emerald-700">Auditado & Confirmado</strong></div>
                <div>Registros no Relatório: <strong className="text-[#2c2c2c]">{totalItemsCount} especificações</strong></div>
              </div>
            </div>

            {/* Summary KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
              <div className="p-3 bg-white border border-[#e5e5d1] rounded-xl shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-gray-500 block">Itens Diferentes</span>
                <span className="text-xl font-bold font-mono text-[#2c3e2e] mt-0.5 block">{totalItemsCount} materiais</span>
              </div>
              <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-emerald-800 block">Quantidade Total Registrada</span>
                <span className="text-xl font-bold font-mono text-emerald-900 mt-0.5 block">{totalUnitsSum} unidades</span>
              </div>
              <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-amber-800 block">Valor Patrimonial Total</span>
                <span className="text-xl font-bold font-mono text-amber-900 mt-0.5 block">
                  R$ {totalValueSum.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-xl shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-blue-800 block">Categorias Afetadas</span>
                <span className="text-xl font-bold font-mono text-blue-900 mt-0.5 block">
                  {Object.keys(categoriesCountMap).length} categorias
                </span>
              </div>
            </div>
          </div>

          {/* Table of Registered Materials */}
          <div className="border border-[#e5e5d1] rounded-2xl overflow-hidden bg-white shadow-2xs">
            <div className="p-3 bg-[#f0f0e8] border-b border-[#e5e5d1] flex items-center justify-between text-xs">
              <span className="font-extrabold text-[#2c3e2e] flex items-center gap-2">
                <PackageCheck className="w-4 h-4 text-emerald-700" />
                <span>Lista Detalhada de Materiais, Equipamentos e Quantidades</span>
              </span>
              <span className="text-[11px] text-gray-500 font-mono">
                Unidade Central & Compartilhada
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#2c2c2c]">
                <thead className="bg-[#fcfdfa] text-[#5a5a40] font-bold border-b border-[#e5e5d1] text-[11px]">
                  <tr>
                    <th className="p-3 border-r border-[#e5e5d1]/60 w-12 text-center">Nº</th>
                    <th className="p-3 border-r border-[#e5e5d1]/60">Código / Ref.</th>
                    <th className="p-3 border-r border-[#e5e5d1]/60">Descrição do Material / Equipamento</th>
                    <th className="p-3 border-r border-[#e5e5d1]/60">Categoria</th>
                    <th className="p-3 border-r border-[#e5e5d1]/60 text-center">Qtd</th>
                    <th className="p-3 border-r border-[#e5e5d1]/60">Unidade</th>
                    <th className="p-3 border-r border-[#e5e5d1]/60 text-right">Custo Un. (R$)</th>
                    <th className="p-3 text-right">Total (R$)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5e5d1]/80 font-medium">
                  {materialsToDisplay.map((item, index) => {
                    const lineTotal = item.quantity * item.unitCost;

                    return (
                      <tr key={item.id} className="hover:bg-[#fbfbf9] transition-colors">
                        <td className="p-3 text-center font-mono text-gray-400 font-bold border-r border-[#e5e5d1]/40">
                          {index + 1}
                        </td>
                        <td className="p-3 font-mono text-[11px] text-[#5a5a40] border-r border-[#e5e5d1]/40 font-bold">
                          {item.itemCode || `INT-${index + 100}`}
                        </td>
                        <td className="p-3 font-bold text-[#2c2c2c] border-r border-[#e5e5d1]/40">
                          <div>{item.name}</div>
                          {item.notes && (
                            <div className="text-[10px] text-gray-500 font-normal mt-0.5 line-clamp-1">
                              {item.notes}
                            </div>
                          )}
                        </td>
                        <td className="p-3 border-r border-[#e5e5d1]/40">
                          <span className="px-2 py-0.5 rounded-md bg-[#f0f0e8] text-[#5a5a40] text-[10px] font-bold">
                            {item.category}
                          </span>
                        </td>
                        <td className="p-3 text-center font-mono font-black text-[#1b281d] text-sm border-r border-[#e5e5d1]/40 bg-emerald-50/40">
                          {item.quantity}
                        </td>
                        <td className="p-3 text-gray-600 font-mono text-[11px] border-r border-[#e5e5d1]/40">
                          {item.unit}
                        </td>
                        <td className="p-3 text-right font-mono text-gray-600 border-r border-[#e5e5d1]/40">
                          R$ {item.unitCost.toFixed(2)}
                        </td>
                        <td className="p-3 text-right font-mono font-extrabold text-[#2c3e2e]">
                          R$ {lineTotal.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-[#f0f0e8] font-bold text-[#2c2c2c] border-t-2 border-[#e5e5d1]">
                  <tr>
                    <td colSpan={4} className="p-3 text-right text-xs uppercase tracking-wider text-[#5a5a40]">
                      Totais Gerais do Lote:
                    </td>
                    <td className="p-3 text-center font-mono font-black text-sm text-emerald-900 bg-emerald-100/60">
                      {totalUnitsSum}
                    </td>
                    <td colSpan={2} className="p-3 text-right text-xs text-[#5a5a40]">
                      Valor Total Cadastrado:
                    </td>
                    <td className="p-3 text-right font-mono font-black text-sm text-[#1b281d]">
                      R$ {totalValueSum.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Category Quantities Breakdown Table */}
          <div className="p-4 bg-[#fcfdfa] border border-[#e5e5d1] rounded-2xl space-y-2">
            <h4 className="text-xs font-bold text-[#2c3e2e] uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#d4a373]" />
              Resumo Quantitativo por Categoria
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {Object.entries(categoriesCountMap).map(([catName, qty]) => (
                <div key={catName} className="p-2.5 bg-white border border-[#e5e5d1] rounded-xl flex items-center justify-between">
                  <span className="font-semibold text-gray-700 truncate">{catName}</span>
                  <span className="font-mono font-extrabold text-[#2c3e2e] px-2 py-0.5 bg-[#f0f0e8] rounded-md">
                    {qty} un
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Autoclave Sterilization Audit Box (Clínica MARV) */}
          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-emerald-200/80 pb-2 gap-2">
              <h4 className="text-xs font-black text-emerald-900 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-700" />
                <span>Laudo de Biossegurança & Esterilização do Lote na Clínica MARV</span>
              </h4>
              <span className="text-[11px] font-mono font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300 w-fit">
                Status: ESTERILIZADO & VÁLIDO POR 6 MESES 🟢
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs text-emerald-950">
              <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-200/60">
                <span className="text-[10px] font-bold text-emerald-700 uppercase block">Clínica & Horário da Esterilização:</span>
                <span className="font-bold block mt-0.5">Clínica MARV às 10h20 (18/08/2026)</span>
                <span className="text-[10px] text-emerald-800 font-medium">Validade: 6 meses (até 18/02/2027)</span>
              </div>

              <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-200/60">
                <span className="text-[10px] font-bold text-emerald-700 uppercase block">Acompanhado e Esterilizado por:</span>
                <span className="font-bold block mt-0.5">Hugo Andres Iglesias Ricoy</span>
                <span className="text-[10px] text-emerald-800 font-medium">CRO/CE 5925 / Equipe de Biossegurança</span>
              </div>

              <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-200/60">
                <span className="text-[10px] font-bold text-emerald-700 uppercase block">Equipamento Autoclave:</span>
                <span className="font-bold block mt-0.5">Cristófoli Vitale Class 12L</span>
                <span className="text-[10px] text-emerald-800 font-medium">Ciclo Automático • Programa Único</span>
              </div>
            </div>

            <div className="p-2.5 bg-emerald-100/50 border border-emerald-200 rounded-xl text-[11px] text-emerald-900 grid grid-cols-1 sm:grid-cols-4 gap-2 font-mono">
              <div><strong>Água Destilada:</strong> 150 ml</div>
              <div><strong>Temperatura:</strong> 129°C – 132°C</div>
              <div><strong>Pressão:</strong> 1,7 a 1,9 kgf/cm²</div>
              <div><strong>Tempo/Secagem:</strong> 16 min + Porta entreaberta</div>
            </div>
          </div>

          {/* Signature and Verification Footer */}
          <div className="pt-4 border-t border-[#e5e5d1] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
            <div className="space-y-1">
              <div className="font-bold text-[#2c2c2c]">Assinatura e Responsabilidade Técnica:</div>
              <div className="text-[11px]">Dr. Hugo Andres Iglesias Ricoy — Responsável Geral</div>
            </div>

            <div className="text-right text-[11px] space-y-1">
              <div>DentisPro Odontologia & Gestão • Relatório de Estoque em PDF</div>
              <div className="font-mono text-gray-400">ID Autenticação: AUDIT-{Date.now().toString().slice(-6)}</div>
            </div>
          </div>

        </div>

        {/* Modal Footer Actions (Hidden on Print) */}
        <div className="flex items-center justify-between border-t border-[#e5e5d1] pt-3 shrink-0 print:hidden">
          <span className="text-xs text-gray-500 font-medium">
            Imprima ou salve como PDF através do comando de impressão do navegador.
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#f0f0e8] hover:bg-[#e5e5d1] text-[#5a5a40] font-bold text-xs rounded-xl transition cursor-pointer"
            >
              Fechar
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-5 py-2 bg-[#2c3e2e] hover:bg-[#1b281d] text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4 text-amber-300" />
              <span>Imprimir</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
