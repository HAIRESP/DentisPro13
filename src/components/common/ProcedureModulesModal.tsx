import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TUSSProcedure } from '../../types';
import { printDocumentWithTitle, formatSafeFilename } from '../../utils/printUtils';
import { 
  X, 
  FileText, 
  Package, 
  UserCheck, 
  HeartHandshake, 
  BookOpen, 
  Copy, 
  Check, 
  Printer, 
  Sparkles,
  Stethoscope,
  Info,
  DollarSign,
  Tag,
  Globe,
  Mail,
  Phone,
  CheckSquare,
  Square
} from 'lucide-react';

interface ProcedureModulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  procedureCode?: string;
  procedureName?: string;
  specialty?: string;
  customProcedureData?: Partial<TUSSProcedure>;
}

export const ProcedureModulesModal: React.FC<ProcedureModulesModalProps> = ({
  isOpen,
  onClose,
  procedureCode,
  procedureName,
  specialty,
  customProcedureData
}) => {
  const { tussProcedures, clinicInfo, activeProfessional } = useApp();
  // Sequence requested: Módulo 1 (Materiais), Módulo 2 (Protocolo Técnico), Módulo 3 (Profissional), Módulo 4 (Paciente)
  const [activeTab, setActiveTab] = useState<'modulo1' | 'modulo2' | 'modulo3' | 'modulo4'>('modulo1');
  const [copiedPatientText, setCopiedPatientText] = useState(false);

  // Print selection options
  const [printSelection, setPrintSelection] = useState<{
    modulo1: boolean;
    modulo2: boolean;
    modulo3: boolean;
    modulo4: boolean;
  }>({
    modulo1: true,
    modulo2: true,
    modulo3: true,
    modulo4: true
  });

  const [showPrintOptions, setShowPrintOptions] = useState(false);

  if (!isOpen) return null;

  // Find matching procedure in TUSS database
  const matchedProcedure = tussProcedures.find(
    p => (procedureCode && p.code === procedureCode) ||
         (procedureName && p.description.toLowerCase() === procedureName.toLowerCase())
  ) || tussProcedures.find(p => procedureName && p.description.toLowerCase().includes(procedureName.toLowerCase())) || customProcedureData;

  const code = matchedProcedure?.code || procedureCode || '81000030';
  const name = matchedProcedure?.description || procedureName || 'Procedimento Odontológico';
  const spec = matchedProcedure?.specialty || specialty || 'Clínica Geral';
  const cost = matchedProcedure?.suggestedCost || 0;

  const module1MaterialsList = matchedProcedure?.requiredMaterials || [
    { id: 'm1', materialName: 'Kit de Diagnóstico Clínico Estéril (Espelho, Sonda, Pinça)', quantityNeeded: 1, unit: 'kit' },
    { id: 'm2', materialName: 'Anestésico Odontológico e Agulha Gengival', quantityNeeded: 1, unit: 'tubete' },
    { id: 'm3', materialName: 'Luvas e Máscara de Proteção Individual', quantityNeeded: 1, unit: 'par' }
  ];

  const module2ProtocolText = matchedProcedure?.fullDescription || 
    `Protocolo clínico padrão para o procedimento de ${name}. Realização das etapas de diagnóstico, preparo cavitário/cirúrgico, assepsia, aplicação dos materiais indicados e restauração da anatomia funcional e estética.`;

  const module3ProfessionalGuidance = matchedProcedure?.professionalGuidance || 
    `Certifique-se do correto isolamento do campo operatório (relativo ou absoluto). Siga criteriosamente os tempos de fotopolimerização, condicionamento ácido, biossegurança e irrigação conforme o fabricante. Avalie o oclusograma com carbono ao término.`;

  const module4PatientInstructions = matchedProcedure?.patientInstructions || 
    `Mantenha boa higienização com escovação suave e fio dental. Evite alimentos muito duros ou pigmentados nas primeiras horas após o procedimento. Em caso de desconforto persistente ou sensibilidade aumentada, entre em contato com a clínica.`;

  const handleCopyPatientInstructions = () => {
    const header = `ORIENTAÇÕES E CUIDADOS AO PACIENTE\nProcedimento: ${name}\nClínica: ${clinicInfo.name}\n${'-'.repeat(40)}\n\n`;
    navigator.clipboard.writeText(header + module4PatientInstructions);
    setCopiedPatientText(true);
    setTimeout(() => setCopiedPatientText(false), 2500);
  };

  const togglePrintModule = (mod: 'modulo1' | 'modulo2' | 'modulo3' | 'modulo4') => {
    setPrintSelection(prev => ({ ...prev, [mod]: !prev[mod] }));
  };

  const handleSelectAllPrint = (select: boolean) => {
    setPrintSelection({
      modulo1: select,
      modulo2: select,
      modulo3: select,
      modulo4: select
    });
  };

  const handleExecutePrint = (selectedOnly: boolean = false) => {
    const printM1 = selectedOnly ? (activeTab === 'modulo1') : printSelection.modulo1;
    const printM2 = selectedOnly ? (activeTab === 'modulo2') : printSelection.modulo2;
    const printM3 = selectedOnly ? (activeTab === 'modulo3') : printSelection.modulo3;
    const printM4 = selectedOnly ? (activeTab === 'modulo4') : printSelection.modulo4;

    const materialsRows = module1MaterialsList.map(m => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e5e5d1; font-weight: bold;">${m.materialName}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e5d1; text-align: center; color: #d4a373; font-weight: bold;">${m.quantityNeeded}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e5d1; text-align: center;">${m.unit}</td>
      </tr>
    `).join('');

    const docTitle = formatSafeFilename(`Guia_Procedimento_${name}`);

    try {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>${docTitle}</title>
              <style>
                @media print {
                  body { padding: 0; }
                  .no-print { display: none !important; }
                }
                body { font-family: system-ui, -apple-system, sans-serif; padding: 30px; color: #2c2c2c; line-height: 1.5; font-size: 13px; }
                .header { border-bottom: 2px solid #5a5a40; padding-bottom: 12px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-start; }
                .title { font-size: 18px; font-weight: bold; color: #5a5a40; }
                .subtitle { font-size: 12px; color: #666; margin-top: 2px; }
                .proc-badge { background: #f4f4ec; border: 1px solid #e5e5d1; padding: 12px; border-radius: 12px; margin-bottom: 20px; font-size: 12px; }
                .module-card { border: 1px solid #e5e5d1; background: #fbfbf9; border-radius: 12px; padding: 16px; margin-bottom: 16px; page-break-inside: avoid; }
                .module-title { font-size: 13px; font-weight: bold; color: #5a5a40; border-bottom: 1px solid #e5e5d1; padding-bottom: 6px; margin-bottom: 10px; display: flex; align-items: center; gap: 6px; }
                table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 12px; }
                th { background: #f4f4ec; color: #5a5a40; text-align: left; padding: 8px; font-weight: bold; text-transform: uppercase; font-size: 10px; border-bottom: 1px solid #e5e5d1; }
                .footer { margin-top: 40px; font-size: 11px; color: #666; border-top: 1px solid #e5e5d1; padding-top: 15px; text-align: center; }
                .signature-block { margin-top: 40px; text-align: center; page-break-inside: avoid; }
                a { color: #5a5a40; text-decoration: none; font-weight: bold; }
              </style>
              <script>
                const tituloOriginal = document.title;
                window.addEventListener('beforeprint', function() {
                  document.title = "${docTitle}";
                });
                window.addEventListener('afterprint', function() {
                  document.title = tituloOriginal;
                });
              </script>
            </head>
            <body>
              <div class="header">
                <div>
                  <div class="title">${clinicInfo.name}</div>
                  <div class="subtitle">Guia e Protocolo Clínico do Procedimento</div>
                </div>
                <div style="text-align: right; font-size: 11px; color: #555;">
                  <strong>Cirurgião-Dentista:</strong> ${activeProfessional?.name || clinicInfo.dentistName}<br/>
                  CRO: ${activeProfessional?.cro || clinicInfo.cro}
                </div>
              </div>

              <div class="proc-badge">
                <strong style="font-size: 14px; color: #2c2c2c;">${name}</strong><br/>
                <span>Código TUSS: <strong>${code}</strong> | Especialidade: <strong>${spec}</strong></span>
                ${cost > 0 ? `<span style="float: right; color: #d4a373; font-weight: bold;">Valor Ref: R$ ${cost.toFixed(2)}</span>` : ''}
              </div>

              ${printM1 ? `
                <div class="module-card">
                  <div class="module-title">Módulo 1 — Lista de Materiais e Insumos do Estoque</div>
                  <table>
                    <thead>
                      <tr>
                        <th>Material / Insumo Requerido</th>
                        <th style="text-align: center;">Quantidade</th>
                        <th style="text-align: center;">Unidade</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${materialsRows}
                    </tbody>
                  </table>
                </div>
              ` : ''}

              ${printM2 ? `
                <div class="module-card">
                  <div class="module-title">Módulo 2 — Descrição Geral & Protocolo Técnico</div>
                  <p style="white-space: pre-line; margin: 0; line-height: 1.6;">${module2ProtocolText}</p>
                </div>
              ` : ''}

              ${printM3 ? `
                <div class="module-card" style="border-color: #a7f3d0; background: #ecfdf5;">
                  <div class="module-title" style="color: #065f46; border-color: #6ee7b7;">Módulo 3 — Orientações Técnicas ao Profissional</div>
                  <p style="white-space: pre-line; margin: 0; line-height: 1.6; color: #064e3b;">${module3ProfessionalGuidance}</p>
                </div>
              ` : ''}

              ${printM4 ? `
                <div class="module-card" style="border-color: #fde68a; background: #fffbeb;">
                  <div class="module-title" style="color: #92400e; border-color: #fcd34d;">Módulo 4 — Recomendações e Cuidados ao Paciente (Pré e Pós-Operatório)</div>
                  <p style="white-space: pre-line; margin: 0; line-height: 1.6; color: #78350f;">${module4PatientInstructions}</p>
                </div>
              ` : ''}

              <div class="signature-block">
                <p>____________________________________________________</p>
                <p><strong>${activeProfessional?.name || clinicInfo.dentistName}</strong></p>
                <p style="font-size: 11px; color: #666;">CRO: ${activeProfessional?.cro || clinicInfo.cro}</p>
              </div>

              <div class="footer">
                <span>${clinicInfo.address}</span> • 
                <a href="tel:${clinicInfo.phone}">${clinicInfo.phone}</a> • 
                <a href="mailto:${clinicInfo.email || 'contato@dentispro.com.br'}">${clinicInfo.email || 'contato@dentispro.com.br'}</a> • 
                <a href="https://dentispro.com.br" target="_blank">dentispro.com.br</a>
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
        }, 500);
        return;
      }
    } catch (err) {
      console.warn('Pop-up window blocked, falling back to window.print():', err);
    }

    // Direct fallback for iframe/sandboxed popup block
    printDocumentWithTitle({
      docTitle: `Guia_Procedimento_${name}`,
      date: new Date()
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#2c2c2c]/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white border border-[#e5e5d1] rounded-[32px] max-w-3xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#e5e5d1] pb-4 shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-[#5a5a40] text-white text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                TUSS: {code}
              </span>
              <span className="bg-[#f4f4ec] text-[#5a5a40] text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-[#e5e5d1]">
                {spec}
              </span>
              {cost > 0 && (
                <span className="text-[#d4a373] text-xs font-extrabold font-mono">
                  R$ {cost.toFixed(2)}
                </span>
              )}
            </div>
            <h3 className="text-base font-bold text-[#2c2c2c] flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#d4a373]" />
              {name}
            </h3>
            <p className="text-xs text-gray-500">
              Protocolo clínico completo estruturado em 4 módulos.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowPrintOptions(!showPrintOptions)}
              className="px-3 py-1.5 bg-[#5a5a40] hover:bg-[#4a4a38] text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <Printer className="w-4 h-4 text-[#d4a373]" />
              Imprimir
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-black hover:bg-gray-100 rounded-full transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Print Configuration Drawer / Panel */}
        {showPrintOptions && (
          <div className="bg-[#f4f4ec] border border-[#e5e5d1] p-4 rounded-2xl space-y-3 shrink-0 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-[#e5e5d1] pb-2">
              <span className="text-xs font-bold text-[#5a5a40] flex items-center gap-1.5">
                <Printer className="w-4 h-4 text-[#d4a373]" />
                Opções de Impressão (Todos os Módulos ou Seleção Personalizada):
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSelectAllPrint(true)}
                  className="text-[10px] text-[#5a5a40] font-bold underline cursor-pointer hover:text-black"
                >
                  Selecionar Todos
                </button>
                <span className="text-gray-300">•</span>
                <button
                  type="button"
                  onClick={() => handleSelectAllPrint(false)}
                  className="text-[10px] text-gray-500 font-bold underline cursor-pointer hover:text-black"
                >
                  Limpar
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <button
                type="button"
                onClick={() => togglePrintModule('modulo1')}
                className={`p-2.5 rounded-xl border text-left font-bold transition flex items-center gap-2 cursor-pointer ${
                  printSelection.modulo1
                    ? 'bg-white border-[#5a5a40] text-[#5a5a40] shadow-2xs'
                    : 'bg-white/50 border-gray-200 text-gray-400'
                }`}
              >
                {printSelection.modulo1 ? <CheckSquare className="w-4 h-4 text-[#5a5a40]" /> : <Square className="w-4 h-4" />}
                Módulo 1 (Materiais)
              </button>

              <button
                type="button"
                onClick={() => togglePrintModule('modulo2')}
                className={`p-2.5 rounded-xl border text-left font-bold transition flex items-center gap-2 cursor-pointer ${
                  printSelection.modulo2
                    ? 'bg-white border-[#5a5a40] text-[#5a5a40] shadow-2xs'
                    : 'bg-white/50 border-gray-200 text-gray-400'
                }`}
              >
                {printSelection.modulo2 ? <CheckSquare className="w-4 h-4 text-[#5a5a40]" /> : <Square className="w-4 h-4" />}
                Módulo 2 (Protocolo)
              </button>

              <button
                type="button"
                onClick={() => togglePrintModule('modulo3')}
                className={`p-2.5 rounded-xl border text-left font-bold transition flex items-center gap-2 cursor-pointer ${
                  printSelection.modulo3
                    ? 'bg-white border-emerald-600 text-emerald-900 shadow-2xs'
                    : 'bg-white/50 border-gray-200 text-gray-400'
                }`}
              >
                {printSelection.modulo3 ? <CheckSquare className="w-4 h-4 text-emerald-600" /> : <Square className="w-4 h-4" />}
                Módulo 3 (Profissional)
              </button>

              <button
                type="button"
                onClick={() => togglePrintModule('modulo4')}
                className={`p-2.5 rounded-xl border text-left font-bold transition flex items-center gap-2 cursor-pointer ${
                  printSelection.modulo4
                    ? 'bg-white border-amber-600 text-amber-900 shadow-2xs'
                    : 'bg-white/50 border-gray-200 text-gray-400'
                }`}
              >
                {printSelection.modulo4 ? <CheckSquare className="w-4 h-4 text-amber-600" /> : <Square className="w-4 h-4" />}
                Módulo 4 (Paciente)
              </button>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleExecutePrint(true)}
                className="px-3 py-1.5 bg-white hover:bg-gray-100 text-[#5a5a40] text-xs font-bold rounded-xl border border-[#e5e5d1] transition cursor-pointer flex items-center gap-1"
              >
                Imprimir Apenas Módulo Atual
              </button>
              <button
                type="button"
                onClick={() => handleExecutePrint(false)}
                className="px-4 py-1.5 bg-[#5a5a40] hover:bg-[#4a4a38] text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
              >
                <Printer className="w-4 h-4 text-[#d4a373]" />
                Imprimir
              </button>
            </div>
          </div>
        )}

        {/* Module Tab Switcher in Sequence: Módulo 1, Módulo 2, Módulo 3, Módulo 4 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#f4f4ec] p-1.5 rounded-2xl border border-[#e5e5d1] shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('modulo1')}
            className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
              activeTab === 'modulo1' 
                ? 'bg-[#5a5a40] text-white shadow-xs' 
                : 'text-[#5a5a40] hover:bg-white/60'
            }`}
          >
            <Package className="w-3.5 h-3.5 text-[#d4a373]" />
            Módulo 1: Materiais ({module1MaterialsList.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('modulo2')}
            className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
              activeTab === 'modulo2' 
                ? 'bg-[#5a5a40] text-white shadow-xs' 
                : 'text-[#5a5a40] hover:bg-white/60'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-[#d4a373]" />
            Módulo 2: Protocolo Técnico
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('modulo3')}
            className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
              activeTab === 'modulo3' 
                ? 'bg-[#5a5a40] text-white shadow-xs' 
                : 'text-[#5a5a40] hover:bg-white/60'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
            Módulo 3: Profissional
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('modulo4')}
            className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
              activeTab === 'modulo4' 
                ? 'bg-[#5a5a40] text-white shadow-xs' 
                : 'text-[#5a5a40] hover:bg-white/60'
            }`}
          >
            <HeartHandshake className="w-3.5 h-3.5 text-amber-400" />
            Módulo 4: Paciente
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto flex-1 pr-1 custom-scrollbar space-y-4">
          {/* MÓDULO 1 — LISTA DE MATERIAIS E INSUMOS */}
          {activeTab === 'modulo1' && (
            <div className="bg-[#fbfbf9] border border-[#e5e5d1] rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-[#e5e5d1] pb-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[#5a5a40]">
                  <Package className="w-4 h-4 text-[#d4a373]" />
                  MÓDULO 1: Lista de Materiais e Insumos do Estoque
                </div>
                <span className="text-[10px] bg-[#f4f4ec] text-[#5a5a40] font-bold px-2.5 py-0.5 rounded-full border border-[#e5e5d1]">
                  Total: {module1MaterialsList.length} itens
                </span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-[#e5e5d1] bg-white">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#f4f4ec] text-[#5a5a40] uppercase text-[10px] tracking-wider font-extrabold">
                    <tr>
                      <th className="p-3">Material / Insumo Requerido</th>
                      <th className="p-3 text-center">Quantidade</th>
                      <th className="p-3 text-center">Unidade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e5e5d1]">
                    {module1MaterialsList.map((m, idx) => (
                      <tr key={idx} className="hover:bg-[#fcfcf8]">
                        <td className="p-3 font-bold text-[#2c2c2c]">{m.materialName}</td>
                        <td className="p-3 text-center font-bold text-[#d4a373]">{m.quantityNeeded}</td>
                        <td className="p-3 text-center text-gray-600">{m.unit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* MÓDULO 2 — DESCRIÇÃO GERAL & PROTOCOLO TÉCNICO */}
          {activeTab === 'modulo2' && (
            <div className="bg-[#fbfbf9] border border-[#e5e5d1] rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#5a5a40] border-b border-[#e5e5d1] pb-2">
                <FileText className="w-4 h-4 text-[#d4a373]" />
                MÓDULO 2: Descrição Geral & Protocolo Técnico
              </div>
              <p className="text-xs text-[#2c2c2c] leading-relaxed whitespace-pre-line font-serif bg-white p-4 rounded-xl border border-[#e5e5d1]">
                {module2ProtocolText}
              </p>
            </div>
          )}

          {/* MÓDULO 3 — ORIENTAÇÕES TÉCNICAS AO PROFISSIONAL */}
          {activeTab === 'modulo3' && (
            <div className="bg-[#fbfbf9] border border-[#e5e5d1] rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 border-b border-[#e5e5d1] pb-2">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                MÓDULO 3: Orientações Técnicas ao Profissional
              </div>
              <div className="bg-emerald-50/60 border border-emerald-200/80 p-4 rounded-xl text-xs text-emerald-950 leading-relaxed whitespace-pre-line font-medium">
                {module3ProfessionalGuidance}
              </div>
            </div>
          )}

          {/* MÓDULO 4 — RECOMENDAÇÕES E CUIDADOS AO PACIENTE */}
          {activeTab === 'modulo4' && (
            <div className="bg-[#fbfbf9] border border-[#e5e5d1] rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-[#e5e5d1] pb-2">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                  <HeartHandshake className="w-4 h-4 text-amber-600" />
                  MÓDULO 4: Recomendações e Cuidados ao Paciente (Pré e Pós-Operatório)
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyPatientInstructions}
                    className="px-2.5 py-1 bg-white hover:bg-amber-100 text-amber-900 text-[11px] font-bold rounded-lg border border-amber-200 transition cursor-pointer flex items-center gap-1"
                  >
                    {copiedPatientText ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-amber-700" />
                        Copiar
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExecutePrint(true)}
                    className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold rounded-lg transition cursor-pointer flex items-center gap-1 shadow-2xs"
                  >
                    <Printer className="w-3 h-3" />
                    Imprimir
                  </button>
                </div>
              </div>

              <div className="bg-amber-50/80 border border-amber-200/80 p-4 rounded-xl text-xs text-amber-950 leading-relaxed whitespace-pre-line font-medium">
                {module4PatientInstructions}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-[#e5e5d1] shrink-0">
          <div className="text-[11px] text-gray-500 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-[#d4a373]" />
            Catálogo DentisPro • TUSS / Particular
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleExecutePrint(false)}
              className="px-4 py-2 bg-[#f4f4ec] hover:bg-[#e5e5d1] text-[#5a5a40] text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 border border-[#e5e5d1]"
            >
              <Printer className="w-3.5 h-3.5 text-[#d4a373]" />
              Imprimir Selecionados
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 bg-[#5a5a40] hover:bg-[#4a4a38] text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-2xs"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

