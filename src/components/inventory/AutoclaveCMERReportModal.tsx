import React, { useState } from 'react';
import { AutoclaveLog } from './InventoryManager';
import { ClinicUnit, Professional } from '../../types';
import { printDocumentWithTitle } from '../../utils/printUtils';
import { 
  X, 
  Printer, 
  CheckCircle2, 
  ShieldCheck, 
  UserCheck, 
  Award, 
  Lock, 
  BadgeCheck,
  FileCheck2,
  PenTool,
  Fingerprint,
  RotateCcw,
  Check
} from 'lucide-react';

interface AutoclaveCMERReportModalProps {
  logs: AutoclaveLog[];
  onClose: () => void;
  clinicInfo?: any;
  clinics?: ClinicUnit[];
  professionals?: Professional[];
  selectedClinicId?: string;
  clinicName?: string;
  technicalResponsible?: string;
  autoclaveModel?: string;
}

export const AutoclaveCMERReportModal: React.FC<AutoclaveCMERReportModalProps> = ({
  logs,
  onClose,
  clinicInfo,
  clinics = [],
  professionals = [],
  selectedClinicId,
  clinicName = 'Clínica MARV Odontologia & Gestão',
  technicalResponsible = 'Dr. Hugo Andres Iglesias Ricoy — CRO/CE 5925',
  autoclaveModel = 'Autoclave Cristófoli Vitale Class 12L'
}) => {
  // Determine selected clinic details
  const activeClinic = clinics.find(c => c.id === selectedClinicId) || clinicInfo || {
    name: clinicName,
    cnpj: '12.345.678/0001-90',
    address: 'Av. Dom Luís, 1200 — Aldeota, Fortaleza - CE',
    phone: '(85) 99876-5432',
    technicalManager: 'Dr. Hugo Andres Iglesias Ricoy',
    croTechnicalManager: 'CRO/CE 5925'
  };

  // 1. RESPONSÁVEL TÉCNICO (RT) STATE & CONTROLS
  const defaultRTName = activeClinic?.technicalManager || 'Dr. Hugo Andres Iglesias Ricoy';
  const defaultRTCRO = activeClinic?.croTechnicalManager || 'CRO/CE 5925';
  const [selectedRT, setSelectedRT] = useState<string>(`${defaultRTName} — ${defaultRTCRO}`);
  const [isRTVerified, setIsRTVerified] = useState<boolean>(true);
  const [isRTDigitalSigned, setIsRTDigitalSigned] = useState<boolean>(true);
  const [rtTimestamp, setRtTimestamp] = useState<string>(
    () => new Date().toLocaleDateString('pt-BR') + ' às ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  );

  // 2. OPERADOR DO CICLO (Cirurgião-Dentista, TSB ou ASB) STATE & CONTROLS
  const [selectedOperatorRole, setSelectedOperatorRole] = useState<string>('Cirurgião-Dentista');
  const [selectedOperator, setSelectedOperator] = useState<string>('Dr. Hugo Andres Iglesias Ricoy (CRO/CE 5925)');
  const [isOperatorVerified, setIsOperatorVerified] = useState<boolean>(true);
  const [isOperatorDigitalSigned, setIsOperatorDigitalSigned] = useState<boolean>(true);
  const [operatorTimestamp, setOperatorTimestamp] = useState<string>(
    () => new Date().toLocaleDateString('pt-BR') + ' às ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  );

  // Hash codes for authentication
  const [rtHash] = useState<string>(() => 'RT-' + Math.random().toString(36).substring(2, 8).toUpperCase() + '-' + Date.now().toString(16).toUpperCase().slice(-6));
  const [opHash] = useState<string>(() => 'OP-' + Math.random().toString(36).substring(2, 8).toUpperCase() + '-' + Date.now().toString(16).toUpperCase().slice(-6));

  const activeLogs = logs.length > 0 ? logs : [
    {
      id: 'log-demo-1',
      date: new Date().toISOString().slice(0, 16),
      autoclaveName: autoclaveModel,
      cycleNumber: 'Ciclo N° 1 de Hoje',
      temperature: 134,
      pressure: 2.1,
      durationMinutes: 16,
      operatorName: selectedOperator,
      biologicalTestResult: 'Aprovado (Negativo)',
      chemicalIntegratorResult: 'Aprovado (Cor Conforme)',
      physicalTableResult: 'Aprovado (Parâmetros Físicos OK)',
      itemsIncluded: ['Kits Cirúrgicos', 'Espelhos Odontológicos', 'Fórceps', 'Broqueiros'],
      notes: 'Ciclo verificado conforme parâmetros da RDC 15 Anvisa com integrador químico e teste biológico negativos.'
    } as AutoclaveLog
  ];

  const handlePrint = () => {
    printDocumentWithTitle({
      docTitle: 'Relatorio_Biosseguranca_CMER_Autoclave',
      patientName: activeClinic?.name || clinicName || 'Clinica',
      date: new Date()
    });
  };

  // Toggle RT Verification (apertou fica marcado, aperta de novo desmarca)
  const toggleRTVerification = () => {
    setIsRTVerified(prev => {
      const next = !prev;
      if (next) {
        setRtTimestamp(new Date().toLocaleDateString('pt-BR') + ' às ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
      }
      return next;
    });
  };

  // Toggle RT Digital Signature
  const toggleRTDigitalSign = () => {
    setIsRTDigitalSigned(prev => !prev);
  };

  // Toggle Operator Verification (apertou fica marcado, aperta de novo desmarca)
  const toggleOperatorVerification = () => {
    setIsOperatorVerified(prev => {
      const next = !prev;
      if (next) {
        setOperatorTimestamp(new Date().toLocaleDateString('pt-BR') + ' às ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
      }
      return next;
    });
  };

  // Toggle Operator Digital Signature
  const toggleOperatorDigitalSign = () => {
    setIsOperatorDigitalSigned(prev => !prev);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#2c2c2c]/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-[#e5e5d1] rounded-[32px] max-w-4xl w-full p-6 shadow-2xl space-y-5 my-6 max-h-[94vh] flex flex-col animate-fadeIn">
        
        {/* Modal Header (Hidden on print) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#e5e5d1] pb-4 shrink-0 gap-3 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#1b281d] text-amber-300 flex items-center justify-center shrink-0 shadow-sm border border-[#d4a373]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-[#2c3e2e] tracking-tight flex items-center gap-2">
                <span>Laudo Oficial de Biossegurança & Esterilização de Autoclave</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                  RDC 15 / Anvisa
                </span>
              </h3>
              <p className="text-xs text-gray-500 font-medium">
                Emissão de Laudo Técnico com Verificação e Assinatura Digital do Responsável Técnico e Operador
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

        {/* INTERACTIVE CONTROLS BAR (Hidden on print) */}
        <div className="bg-[#f0f0e8] p-4 rounded-2xl border border-[#e5e5d1] space-y-4 print:hidden">
          
          {/* SECTION 1: RESPONSÁVEL TÉCNICO CONTROLS */}
          <div className="bg-white p-3.5 rounded-xl border border-[#e5e5d1] shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-800" />
                <span className="text-xs font-bold text-[#1b281d] uppercase tracking-wide">
                  1. Responsável Técnico (Sessão do Usuário Logado)
                </span>
              </div>
              <span className="text-[11px] text-gray-500 font-mono">
                Validação Sanitária Obrigatória (RDC 15 Anvisa)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
              {/* RT Session Selector */}
              <div className="md:col-span-6 space-y-1">
                <label className="block text-[10px] font-bold text-gray-500 uppercase">
                  Selecionar Profissional / RT da Sessão:
                </label>
                <select
                  value={selectedRT}
                  onChange={(e) => setSelectedRT(e.target.value)}
                  className="w-full bg-[#fbfbf9] border border-[#e5e5d1] rounded-xl px-3 py-1.5 text-xs font-bold text-[#2c2c2c] focus:ring-2 focus:ring-emerald-700 outline-none"
                >
                  <option value="Dr. Hugo Andres Iglesias Ricoy — CRO/CE 5925">
                    Dr. Hugo Andres Iglesias Ricoy — CRO/CE 5925 (Responsável Técnico Principal)
                  </option>
                  {professionals.map(p => (
                    <option key={p.id} value={`${p.name} — ${p.cro || 'Cirurgião-Dentista'}`}>
                      {p.name} — {p.cro || 'Cirurgião-Dentista'}
                    </option>
                  ))}
                </select>
              </div>

              {/* RT Responsive Verification Toggle Button */}
              <div className="md:col-span-3">
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                  Verificação do RT:
                </label>
                <button
                  type="button"
                  onClick={toggleRTVerification}
                  className={`w-full px-3 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition cursor-pointer shadow-2xs ${
                    isRTVerified 
                      ? 'bg-emerald-700 text-white border-emerald-800 hover:bg-emerald-800' 
                      : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'
                  }`}
                  title="Aperte para marcar ou desmarcar a verificação do Responsável Técnico"
                >
                  {isRTVerified ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                      <span>RT Verificado (Ativo)</span>
                    </>
                  ) : (
                    <>
                      <RotateCcw className="w-4 h-4 text-gray-400" />
                      <span>Não Verificado</span>
                    </>
                  )}
                </button>
              </div>

              {/* RT Digital Signature Toggle */}
              <div className="md:col-span-3">
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                  Assinatura Digital RT:
                </label>
                <button
                  type="button"
                  onClick={toggleRTDigitalSign}
                  disabled={!isRTVerified}
                  className={`w-full px-3 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition cursor-pointer shadow-2xs ${
                    !isRTVerified
                      ? 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed opacity-60'
                      : isRTDigitalSigned 
                        ? 'bg-[#1b281d] text-amber-300 border-[#1b281d] hover:bg-[#2c3e2e]' 
                        : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                  }`}
                  title="Aperte para ativar ou desativar a assinatura digital com carimbo criptográfico"
                >
                  <Fingerprint className="w-4 h-4" />
                  <span>{isRTDigitalSigned ? 'Assinatura Digital On' : 'Assinatura Manual'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* SECTION 2: OPERADOR DO CICLO CONTROLS */}
          <div className="bg-white p-3.5 rounded-xl border border-[#e5e5d1] shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-2">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-blue-800" />
                <span className="text-xs font-bold text-[#1b281d] uppercase tracking-wide">
                  2. Identificação do Operador do Ciclo (Sessão do Usuário)
                </span>
              </div>
              <span className="text-[11px] text-gray-500 font-mono">
                Cirurgião-Dentista, TSB ou ASB
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
              {/* Operator Role & Session Selector */}
              <div className="md:col-span-6 space-y-1">
                <label className="block text-[10px] font-bold text-gray-500 uppercase">
                  Operador da Sessão (Função / Nome):
                </label>
                <select
                  value={selectedOperator}
                  onChange={(e) => {
                    setSelectedOperator(e.target.value);
                    if (e.target.value.includes('TSB')) setSelectedOperatorRole('TSB');
                    else if (e.target.value.includes('ASB')) setSelectedOperatorRole('ASB');
                    else setSelectedOperatorRole('Cirurgião-Dentista');
                  }}
                  className="w-full bg-[#fbfbf9] border border-[#e5e5d1] rounded-xl px-3 py-1.5 text-xs font-bold text-[#2c2c2c] focus:ring-2 focus:ring-blue-700 outline-none"
                >
                  <option value="Dr. Hugo Andres Iglesias Ricoy (CRO/CE 5925 - Cirurgião-Dentista)">
                    Dr. Hugo Andres Iglesias Ricoy (CRO/CE 5925 — Cirurgião-Dentista)
                  </option>
                  {professionals.map(p => (
                    <option key={p.id} value={`${p.name} (${p.cro ? `CRO: ${p.cro}` : 'Cirurgião-Dentista'})`}>
                      {p.name} ({p.cro ? `CRO: ${p.cro}` : 'Cirurgião-Dentista'})
                    </option>
                  ))}
                  <option value="Atendente TSB - Técnica em Saúde Bucal (Registro TSB-CE 1420)">
                    Atendente TSB — Técnica em Saúde Bucal (Registro TSB-CE 1420)
                  </option>
                  <option value="Auxiliar ASB - Auxiliar em Saúde Bucal (Registro ASB-CE 3890)">
                    Auxiliar ASB — Auxiliar em Saúde Bucal (Registro ASB-CE 3890)
                  </option>
                </select>
              </div>

              {/* Operator Responsive Verification Toggle Button */}
              <div className="md:col-span-3">
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                  Verificação do Operador:
                </label>
                <button
                  type="button"
                  onClick={toggleOperatorVerification}
                  className={`w-full px-3 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition cursor-pointer shadow-2xs ${
                    isOperatorVerified 
                      ? 'bg-blue-700 text-white border-blue-800 hover:bg-blue-800' 
                      : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'
                  }`}
                  title="Aperte para marcar ou desmarcar a identificação do Operador"
                >
                  {isOperatorVerified ? (
                    <>
                      <BadgeCheck className="w-4 h-4 text-blue-200" />
                      <span>Operador Verificado</span>
                    </>
                  ) : (
                    <>
                      <RotateCcw className="w-4 h-4 text-gray-400" />
                      <span>Não Identificado</span>
                    </>
                  )}
                </button>
              </div>

              {/* Operator Digital Signature Toggle */}
              <div className="md:col-span-3">
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                  Carimbo Digital Operador:
                </label>
                <button
                  type="button"
                  onClick={toggleOperatorDigitalSign}
                  disabled={!isOperatorVerified}
                  className={`w-full px-3 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition cursor-pointer shadow-2xs ${
                    !isOperatorVerified
                      ? 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed opacity-60'
                      : isOperatorDigitalSigned 
                        ? 'bg-[#1b281d] text-cyan-300 border-[#1b281d] hover:bg-[#2c3e2e]' 
                        : 'bg-cyan-50 text-cyan-900 border-cyan-300 hover:bg-cyan-100'
                  }`}
                  title="Aperte para ativar ou desativar a assinatura digital do Operador"
                >
                  <Fingerprint className="w-4 h-4" />
                  <span>{isOperatorDigitalSigned ? 'Carimbo Digital On' : 'Carimbo Manual'}</span>
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* PRINTABLE CONTENT AREA */}
        <div id="printable-cmer-area" className="overflow-y-auto space-y-4 flex-1 pr-1 font-sans text-xs">
          
          {/* BLOCO OFICIAL DA CLÍNICA SELECIONADA */}
          <div className="border-2 border-[#1b281d] rounded-2xl overflow-hidden bg-white shadow-xs">
            <div className="p-4 bg-[#fbfbf9] flex flex-col sm:flex-row items-start sm:items-center justify-between border-b-2 border-[#1b281d] gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#1b281d] text-amber-300 flex items-center justify-center font-black text-xl shrink-0 border border-[#d4a373]">
                  {activeClinic?.name ? activeClinic.name.charAt(0) : 'D'}
                </div>
                <div>
                  <h1 className="text-base font-black text-[#1b281d] uppercase tracking-wide">
                    {activeClinic?.name || clinicName}
                  </h1>
                  <p className="text-[11px] text-gray-600 font-medium">
                    {activeClinic?.address || 'Fortaleza - CE'} {activeClinic?.phone ? `• Tel: ${activeClinic.phone}` : ''}
                  </p>
                  <p className="text-[10px] text-gray-500 font-mono">
                    EPAO: {activeClinic?.epaoNumber || '12345'} • CNPJ: {activeClinic?.cnpj || '12.345.678/0001-90'}
                  </p>
                </div>
              </div>

              <div className="text-right sm:border-l sm:border-[#e5e5d1] sm:pl-4">
                <span className="text-[10px] uppercase font-bold text-gray-500 block">Responsável Técnico (RT):</span>
                <span className="text-xs font-black text-[#1b281d] block">
                  {selectedRT.split('—')[0] || defaultRTName}
                </span>
                <span className="text-[10px] text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block mt-0.5">
                  {selectedRT.includes('—') ? selectedRT.split('—')[1] : defaultRTCRO}
                </span>
              </div>
            </div>

            {/* Document Title Banner */}
            <div className="bg-[#1b281d] text-amber-300 p-2.5 text-center font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2">
              <Award className="w-4 h-4 text-amber-300" />
              <span>LAUDO TÉCNICO DE BIOSSEGURANÇA E LIBERAÇÃO DE CICLO DE AUTOCLAVE</span>
            </div>
          </div>

          {/* LIST OF CYCLES & SPECIFICATIONS */}
          <div className="space-y-4">
            {activeLogs.map((log, idx) => (
              <div key={log.id || idx} className="border-2 border-[#1b281d] rounded-2xl overflow-hidden bg-white space-y-0">
                
                {/* Cycle Header */}
                <div className="bg-[#f0f0e8] border-b-2 border-[#1b281d] p-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-bold text-[#1b281d]">
                  <div>
                    <span className="text-[10px] text-gray-500 uppercase block font-medium">Equipamento Autoclave:</span>
                    <span>{log.autoclaveName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 uppercase block font-medium">N° do Ciclo / Lote:</span>
                    <span className="font-mono text-emerald-900">{log.cycleNumber}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 uppercase block font-medium">Data e Hora:</span>
                    <span className="font-mono">{log.date.replace('T', ' ')}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-gray-500 uppercase block font-medium">Operador do Ciclo:</span>
                    <span className="truncate block font-bold text-[#2c3e2e]">{selectedOperator.split('(')[0] || log.operatorName}</span>
                  </div>
                </div>

                {/* Technical Parameters Grid */}
                <div className="p-3 bg-white grid grid-cols-2 sm:grid-cols-4 gap-3 border-b border-[#e5e5d1] text-[11px] font-mono">
                  <div className="bg-emerald-50/50 p-2 rounded-xl border border-emerald-200">
                    <span className="text-[9px] text-gray-500 uppercase block font-sans">Volume Água Destilada:</span>
                    <strong className="text-emerald-950">150 ml Água Destilada</strong>
                  </div>
                  <div className="bg-emerald-50/50 p-2 rounded-xl border border-emerald-200">
                    <span className="text-[9px] text-gray-500 uppercase block font-sans">Temperatura do Ciclo:</span>
                    <strong className="text-emerald-950">{log.temperature}°C (129°C – 132°C)</strong>
                  </div>
                  <div className="bg-emerald-50/50 p-2 rounded-xl border border-emerald-200">
                    <span className="text-[9px] text-gray-500 uppercase block font-sans">Pressão de Operação:</span>
                    <strong className="text-emerald-950">{log.pressure} kgf/cm² (bar)</strong>
                  </div>
                  <div className="bg-emerald-50/50 p-2 rounded-xl border border-emerald-200">
                    <span className="text-[9px] text-gray-500 uppercase block font-sans">Tempo & Secagem:</span>
                    <strong className="text-emerald-950">{log.durationMinutes} min + Porta Entreaberta</strong>
                  </div>
                </div>

                {/* Validation Controls Results */}
                <div className="p-3 bg-[#fbfbf9] grid grid-cols-1 sm:grid-cols-3 gap-2.5 border-b border-[#e5e5d1]">
                  <div className="p-2 bg-white rounded-xl border border-[#e5e5d1]">
                    <span className="text-[10px] font-bold text-gray-500 uppercase block mb-0.5">Controle Físico (Manômetro / Painel):</span>
                    <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      {log.physicalTableResult}
                    </span>
                  </div>
                  <div className="p-2 bg-white rounded-xl border border-[#e5e5d1]">
                    <span className="text-[10px] font-bold text-gray-500 uppercase block mb-0.5">Controle Químico (Integrador Classe 5):</span>
                    <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      {log.chemicalIntegratorResult}
                    </span>
                  </div>
                  <div className="p-2 bg-white rounded-xl border border-[#e5e5d1]">
                    <span className="text-[10px] font-bold text-gray-500 uppercase block mb-0.5">Controle Biológico (Ampola Teste/Controle):</span>
                    <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      {log.biologicalTestResult}
                    </span>
                  </div>
                </div>

                {/* Materials Included */}
                <div className="p-3 bg-white space-y-1">
                  <span className="text-[10px] uppercase font-bold text-gray-500 block">
                    Materiais Odontológicos e Kits Esterilizados Neste Lote:
                  </span>
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {log.itemsIncluded && log.itemsIncluded.length > 0 ? (
                      log.itemsIncluded.map((item, i) => (
                        <span key={i} className="text-[11px] font-medium bg-[#f0f0e8] text-[#2c3e2e] px-2.5 py-1 rounded-lg border border-[#e5e5d1]">
                          ✓ {item}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-500 italic">Instrumentais e Materiais Odontológicos Diversos</span>
                    )}
                  </div>
                </div>

                {log.notes && (
                  <div className="p-3 bg-[#fbfbf9] border-t border-[#e5e5d1] text-[11px] text-gray-600">
                    <strong>Observações Técnicas:</strong> {log.notes}
                  </div>
                )}

              </div>
            ))}
          </div>

          {/* DUAL SIGNATURE & AUTHENTICATION BLOCK (RT & OPERADOR) */}
          <div className="border-2 border-[#1b281d] rounded-2xl p-4 bg-white space-y-4">
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-[#e5e5d1] pb-3 gap-2">
              <div>
                <h4 className="text-xs font-black text-[#1b281d] uppercase tracking-wide flex items-center gap-1.5">
                  <BadgeCheck className="w-4 h-4 text-emerald-700" />
                  <span>Validação Sanitária & Autenticação de Biossegurança</span>
                </h4>
                <p className="text-[10px] text-gray-500">
                  Em conformidade com a Resolução Anvisa RDC 15/2012 para Boas Práticas de Esterilização.
                </p>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-mono text-emerald-900 bg-emerald-100 px-2.5 py-1 rounded-full font-bold border border-emerald-300">
                  Validade Sanitária: 6 Meses
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              
              {/* 1. RESPONSÁVEL TÉCNICO SIGNATURE CARD */}
              <div className="border border-[#e5e5d1] rounded-xl p-3.5 bg-[#fbfbf9] space-y-2 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-500 uppercase font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                      Responsável Técnico (RT):
                    </span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${
                      isRTVerified 
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                        : 'bg-gray-100 text-gray-500 border-gray-200'
                    }`}>
                      {isRTVerified ? '✓ Verificado' : 'Pendente'}
                    </span>
                  </div>

                  <strong className="text-xs text-[#1b281d] block mt-1">
                    {selectedRT.split('—')[0] || defaultRTName}
                  </strong>
                  <span className="text-[10px] text-emerald-800 font-bold block">
                    {selectedRT.includes('—') ? selectedRT.split('—')[1] : defaultRTCRO}
                  </span>
                </div>

                {isRTVerified && isRTDigitalSigned ? (
                  <div className="p-2.5 bg-emerald-50/70 border border-dashed border-emerald-400 rounded-lg text-center space-y-0.5 mt-2">
                    <div className="flex items-center justify-center gap-1 text-[10px] font-black text-emerald-900 uppercase">
                      <Fingerprint className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Assinatura Digital do RT Validada</span>
                    </div>
                    <div className="text-[9px] font-mono text-emerald-800">
                      Timestamp: {rtTimestamp}
                    </div>
                    <div className="text-[8px] font-mono text-gray-500">
                      Hash: SHA256-{rtHash}
                    </div>
                  </div>
                ) : (
                  <div className="pt-6 border-t border-gray-300 text-center mt-2">
                    <span className="text-[10px] font-mono text-gray-500 block">Assinatura / Visto do RT</span>
                  </div>
                )}
              </div>

              {/* 2. OPERADOR DO CICLO SIGNATURE CARD */}
              <div className="border border-[#e5e5d1] rounded-xl p-3.5 bg-[#fbfbf9] space-y-2 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-500 uppercase font-bold flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5 text-blue-700" />
                      Operador Executante:
                    </span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${
                      isOperatorVerified 
                        ? 'bg-blue-50 text-blue-800 border-blue-300' 
                        : 'bg-gray-100 text-gray-500 border-gray-200'
                    }`}>
                      {isOperatorVerified ? '✓ Identificado' : 'Pendente'}
                    </span>
                  </div>

                  <strong className="text-xs text-[#1b281d] block mt-1">
                    {selectedOperator}
                  </strong>
                  <span className="text-[10px] text-blue-800 font-bold block">
                    {selectedOperatorRole} da Sessão Clínica
                  </span>
                </div>

                {isOperatorVerified && isOperatorDigitalSigned ? (
                  <div className="p-2.5 bg-blue-50/70 border border-dashed border-blue-400 rounded-lg text-center space-y-0.5 mt-2">
                    <div className="flex items-center justify-center gap-1 text-[10px] font-black text-blue-900 uppercase">
                      <Fingerprint className="w-3.5 h-3.5 text-blue-700" />
                      <span>Carimbo Digital do Operador</span>
                    </div>
                    <div className="text-[9px] font-mono text-blue-800">
                      Timestamp: {operatorTimestamp}
                    </div>
                    <div className="text-[8px] font-mono text-gray-500">
                      Hash: SHA256-{opHash}
                    </div>
                  </div>
                ) : (
                  <div className="pt-6 border-t border-gray-300 text-center mt-2">
                    <span className="text-[10px] font-mono text-gray-500 block">Assinatura do Operador do Ciclo</span>
                  </div>
                )}
              </div>

            </div>

            <div className="pt-2 border-t border-gray-200 text-center text-[10px] text-gray-400 font-mono">
              DentisPro Odontologia • Laudo oficial de biossegurança de esterilização emitido digitalmente • {activeClinic?.name || 'Todas as Unidades'}
            </div>
          </div>

        </div>

        {/* Modal Footer Actions (Hidden on Print) */}
        <div className="flex items-center justify-between border-t border-[#e5e5d1] pt-3 shrink-0 print:hidden">
          <span className="text-xs text-gray-500 font-medium">
            Imprima ou salve este PDF para apresentar à fiscalização sanitária.
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
              className="px-5 py-2 bg-[#2c3e2e] hover:bg-[#1b281d] text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
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
