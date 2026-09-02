import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { getThemeStyles } from '../../utils/themeUtils';
import { Patient, TreatmentPlan, TreatmentConsentAttachment } from '../../types';
import { formatCPF, formatPhone } from '../../utils/formatters';
import { DocumentSignatureFooter } from '../common/DocumentSignatureFooter';
import {
  X,
  Printer,
  FileCheck2,
  DollarSign,
  Calendar,
  CheckCircle2,
  Upload,
  Camera,
  Trash2,
  FileText,
  ShieldCheck,
  Building2,
  User,
  Plus,
  ArrowLeft,
  Check,
  Paperclip,
  Eye,
  AlertCircle
} from 'lucide-react';

interface TreatmentPlanConsentModalProps {
  patient: Patient;
  isOpen: boolean;
  onClose: () => void;
  initialPlanId?: string;
}

export const TreatmentPlanConsentModal: React.FC<TreatmentPlanConsentModalProps> = ({
  patient,
  isOpen,
  onClose,
  initialPlanId
}) => {
  const {
    treatmentPlans,
    updateTreatmentPlan,
    clinicInfo,
    activeClinic,
    activeProfessional,
    layoutTheme
  } = useApp();

  const t = getThemeStyles(layoutTheme);
  const patientPlans = treatmentPlans.filter(p => p.patientId === patient.id);

  const [selectedPlanId, setSelectedPlanId] = useState<string>(
    initialPlanId || patientPlans[0]?.id || ''
  );

  const currentPlan = patientPlans.find(p => p.id === selectedPlanId) || patientPlans[0] || null;

  // Selected Option state
  const [selectedOptionTitle, setSelectedOptionTitle] = useState<string>(() => {
    return currentPlan?.consentSelectedOptionTitle || 'Opção Principal (Plano Aprovado)';
  });

  // Financial acceptance terms
  const [paymentMethod, setPaymentMethod] = useState<string>(() => {
    return currentPlan?.consentFinancialSummary?.paymentMethod || currentPlan?.paymentConditions || 'Cartão de Crédito / Parcelado';
  });

  const [installments, setInstallments] = useState<number>(() => {
    return currentPlan?.consentFinancialSummary?.installments || 1;
  });

  const [discountAgreed, setDiscountAgreed] = useState<number>(() => {
    return currentPlan?.consentFinancialSummary?.discount || currentPlan?.discountValue || 0;
  });

  const [financialNotes, setFinancialNotes] = useState<string>(() => {
    return currentPlan?.consentFinancialSummary?.notes || currentPlan?.notes || '';
  });

  // Acceptance status
  const [isAccepted, setIsAccepted] = useState<boolean>(() => {
    return currentPlan?.consentAccepted ?? (currentPlan?.status === 'aprovado' || currentPlan?.status === 'em_andamento' || currentPlan?.status === 'concluido');
  });

  const [signatureType, setSignatureType] = useState<'presencial' | 'digital' | 'manual_upload'>(() => {
    return currentPlan?.consentSignatureType || 'manual_upload';
  });

  const [attachments, setAttachments] = useState<TreatmentConsentAttachment[]>(() => {
    return currentPlan?.consentAttachments || [];
  });

  // Camera capture modal state
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const [saveFeedback, setSaveFeedback] = useState<boolean>(false);

  if (!isOpen) return null;

  // Calculations
  const rawTotal = currentPlan ? currentPlan.totalValue || currentPlan.items.reduce((acc, i) => acc + (i.cost || i.finalCost || 0), 0) : 0;
  const finalTotal = Math.max(0, rawTotal - discountAgreed);
  const installmentVal = installments > 0 ? finalTotal / installments : finalTotal;

  // File upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          const newAtt: TreatmentConsentAttachment = {
            id: `att-${Date.now()}`,
            name: file.name,
            fileUrl: reader.result,
            fileType: file.type.includes('pdf') ? 'pdf' : 'image',
            uploadedAt: new Date().toISOString(),
            signedByPatient: true,
            signatureDate: new Date().toISOString().split('T')[0]
          };
          const updated = [...attachments, newAtt];
          setAttachments(updated);
          setIsAccepted(true);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Web Camera start
  const startCamera = async () => {
    setIsCameraActive(true);
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: any) {
      setCameraError('Não foi possível acessar a câmera. Verifique as permissões.');
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setIsCameraActive(false);
  };

  const captureCameraPhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        const newAtt: TreatmentConsentAttachment = {
          id: `att-${Date.now()}`,
          name: `Foto_Assinatura_${new Date().toISOString().split('T')[0]}.jpg`,
          fileUrl: dataUrl,
          fileType: 'image',
          uploadedAt: new Date().toISOString(),
          signedByPatient: true,
          signatureDate: new Date().toISOString().split('T')[0]
        };
        setAttachments(prev => [...prev, newAtt]);
        setIsAccepted(true);
      }
    }
    stopCamera();
  };

  const handleRemoveAttachment = (attId: string) => {
    setAttachments(prev => prev.filter(a => a.id !== attId));
  };

  const handleSaveConsent = () => {
    if (!currentPlan) return;

    updateTreatmentPlan(currentPlan.id, {
      status: isAccepted ? 'aprovado' : currentPlan.status,
      consentAccepted: isAccepted,
      consentAcceptedAt: isAccepted ? (currentPlan.consentAcceptedAt || new Date().toISOString()) : undefined,
      consentSignatureType: signatureType,
      consentSelectedOptionTitle: selectedOptionTitle,
      consentAttachments: attachments,
      consentSignedDocumentUrl: attachments[0]?.fileUrl || undefined,
      consentFinancialSummary: {
        totalBudget: rawTotal,
        discount: discountAgreed,
        finalAgreed: finalTotal,
        paymentMethod: paymentMethod,
        installments: installments,
        installmentValue: installmentVal,
        notes: financialNotes
      }
    });

    setSaveFeedback(true);
    setTimeout(() => setSaveFeedback(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full p-5 sm:p-7 shadow-2xl border border-slate-200 space-y-6 max-h-[92vh] overflow-y-auto my-auto">
        
        {/* Modal Top Bar (Hidden on Print) */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#4a4a35] text-[#d4a373] flex items-center justify-center font-bold shadow-xs">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-serif font-bold text-slate-900 flex items-center gap-2">
                Laudo de Opções & Aceite do Plano de Tratamento
              </h2>
              <p className="text-xs text-slate-500">
                Formalização das opções de conduta, escolha do tratamento e aceite financeiro com anexo assinado.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3.5 py-2 bg-[#4a4a35] hover:bg-[#3b3b2a] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
              title="Imprimir laudo de aceite para assinatura física"
            >
              <Printer className="w-4 h-4 text-[#d4a373]" />
              <span>Imprimir</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE A4 CONTENT */}
        <div id="consent-report-print-area" className="space-y-6 text-slate-800 bg-white">
          
          {/* Header */}
          <div className="flex items-start justify-between pb-4 border-b-2 border-slate-800 gap-4">
            <div className="space-y-1">
              <h3 className="text-lg font-bold font-serif text-slate-900">
                {clinicInfo.name || activeClinic.name || 'DentisPro Odontologia Integrada'}
              </h3>
              <p className="text-xs text-slate-600">
                {clinicInfo.address || activeClinic.address || 'Av. Santos Dumont, 2800 - Aldeota'} • {clinicInfo.city || 'Fortaleza - CE'}
              </p>
              <p className="text-xs text-slate-600">
                Cirurgião-Dentista: <strong>{activeProfessional.name || clinicInfo.dentistName || 'Dr. Dentista Responsável'}</strong> ({activeProfessional.cro || clinicInfo.cro || 'CRO/CE 5925'})
              </p>
            </div>
            <div className="text-right space-y-1 shrink-0">
              <span className="px-3 py-1 bg-slate-100 text-slate-800 font-mono text-xs font-bold rounded-md border border-slate-300 inline-block">
                LAUDO DE ACEITE & PLANO
              </span>
              <p className="text-[11px] text-slate-500">
                Data: <strong>{new Date().toLocaleDateString('pt-BR')}</strong>
              </p>
            </div>
          </div>

          {/* Patient Header Block */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <span className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider block">Paciente:</span>
              <strong className="text-sm text-slate-900">{patient.name}</strong>
            </div>
            <div>
              <span className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider block">CPF / Documento:</span>
              <span className="font-mono text-slate-800 font-semibold">{formatCPF(patient.cpf)}</span>
            </div>
            <div>
              <span className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider block">Telefone / Convênio:</span>
              <span>{formatPhone(patient.phone)}</span> • <strong className="text-amber-800">{patient.healthInsurance || 'Particular'}</strong>
            </div>
          </div>

          {/* Section 1: Opções de Tratamento & Tratamento Escolhido */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#4a4a35] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#d4a373]" />
                1. Opções de Tratamento Apresentadas & Plano Escolhido
              </h4>
              {patientPlans.length > 1 && (
                <div className="print:hidden flex items-center gap-1.5 text-xs">
                  <span className="text-slate-500 font-medium">Plano:</span>
                  <select
                    value={selectedPlanId}
                    onChange={(e) => setSelectedPlanId(e.target.value)}
                    className="bg-white border border-slate-300 text-slate-800 text-xs font-bold rounded-lg px-2 py-1"
                  >
                    {patientPlans.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.title} ({p.date}) - R$ {(p.finalValue || p.totalValue).toFixed(2)}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {currentPlan ? (
              <div className="space-y-3">
                {/* Opção Escolhida Pill */}
                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="text-xs font-bold text-slate-900">
                      Conduta Selecionada: <strong>{currentPlan.title}</strong>
                    </span>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-amber-950 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
                    Status: {currentPlan.status.toUpperCase()}
                  </span>
                </div>

                {/* Tabela de Procedimentos do Plano Escolhido */}
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-2.5">Cód. TUSS</th>
                        <th className="p-2.5">Procedimento Proposto</th>
                        <th className="p-2.5">Especialidade / Região</th>
                        <th className="p-2.5">Dente / Face</th>
                        <th className="p-2.5 text-right">Investimento</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {currentPlan.items.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-2.5 font-mono text-[11px] text-slate-500">{item.tussCode || '---'}</td>
                          <td className="p-2.5 font-bold text-slate-900">{item.procedureName}</td>
                          <td className="p-2.5 text-slate-600">{item.specialty}</td>
                          <td className="p-2.5 font-mono text-slate-800">
                            {item.toothNumber ? `#${item.toothNumber}` : 'Geral'} {item.toothSurface ? `(${item.toothSurface})` : ''}
                          </td>
                          <td className="p-2.5 text-right font-mono font-bold text-slate-900">
                            R$ {(item.finalCost || item.cost || 0).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-center text-xs text-slate-500">
                Nenhum plano de tratamento cadastrado para este paciente. Crie um plano primeiro na aba "Plano de Tratamento".
              </div>
            )}
          </div>

          {/* Section 2: Seção Financeira & Condições de Pagamento */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#4a4a35] flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
              <DollarSign className="w-4 h-4 text-[#d4a373]" />
              2. Seção Financeira & Condições Acordadas
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                <span className="text-[10.5px] font-bold text-slate-500 block">Valor Bruto</span>
                <strong className="text-sm font-mono text-slate-800">
                  R$ {rawTotal.toFixed(2)}
                </strong>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                <span className="text-[10.5px] font-bold text-slate-500 block">Desconto / Bonificação</span>
                <strong className="text-sm font-mono text-amber-800">
                  - R$ {discountAgreed.toFixed(2)}
                </strong>
              </div>

              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-center">
                <span className="text-[10.5px] font-bold text-emerald-800 block">Total Final Acordado</span>
                <strong className="text-base font-mono font-bold text-emerald-900">
                  R$ {finalTotal.toFixed(2)}
                </strong>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                <span className="text-[10.5px] font-bold text-slate-500 block">Forma / Parcelas</span>
                <strong className="text-xs font-medium text-slate-900 block truncate">
                  {installments > 1 ? `${installments}x de R$ ${installmentVal.toFixed(2)}` : 'À vista'}
                </strong>
                <span className="text-[10px] text-slate-500">{paymentMethod}</span>
              </div>
            </div>

            {/* Controles de edição financeira (Ocultos na impressão) */}
            <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs print:hidden">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Forma de Pagamento:</label>
                <input
                  type="text"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  placeholder="Ex: Cartão de Crédito 6x sem juros"
                  className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Qtd. de Parcelas:</label>
                <input
                  type="number"
                  min="1"
                  max="48"
                  value={installments}
                  onChange={(e) => setInstallments(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-mono font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Desconto Concedido (R$):</label>
                <input
                  type="number"
                  min="0"
                  value={discountAgreed}
                  onChange={(e) => setDiscountAgreed(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-mono font-bold text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Termo de Consentimento Livre e Esclarecido */}
          <div className="space-y-3 bg-slate-50/60 p-4 rounded-2xl border border-slate-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#4a4a35] flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-[#d4a373]" />
              3. Declaração de Aceite e Consentimento do Paciente
            </h4>
            
            <p className="text-xs text-slate-700 leading-relaxed text-justify">
              Eu, <strong>{patient.name}</strong>, inscrito(a) no CPF <strong>{formatCPF(patient.cpf)}</strong>, declaro que me foram explicadas detalhadamente as opções de tratamento, benefícios, riscos, alternativas terapêuticas e o cronograma do plano de tratamento acima descrito. Declaro concordar com o tratamento odontológico proposto e com as condições financeiras e formas de pagamento especificadas neste documento.
            </p>
          </div>

          {/* Section 4: Anexos de Arquivo ou Foto com Assinatura do Paciente */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#4a4a35] flex items-center gap-1.5">
                <Paperclip className="w-4 h-4 text-[#d4a373]" />
                4. Anexo do Laudo Assinado pelo Paciente (Arquivo / Foto)
              </h4>
              <span className="text-[11px] font-mono text-slate-500">
                {attachments.length} anexo(s)
              </span>
            </div>

            {/* Upload Buttons (Ocultos na impressão) */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-dashed border-slate-300 space-y-3 print:hidden">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-slate-800">
                    Anexar comprovante assinado física ou digitalmente
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Tire uma foto do laudo assinado ou faça upload do documento escaneado (PDF/JPG/PNG).
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {/* Foto pela Câmera */}
                  <button
                    type="button"
                    onClick={startCamera}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                  >
                    <Camera className="w-4 h-4 text-amber-400" />
                    <span>Tirar Foto</span>
                  </button>

                  {/* Upload de Arquivo */}
                  <label className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-2xs">
                    <Upload className="w-4 h-4" />
                    <span>Upload Arquivo</span>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Camera Preview Modal View */}
              {isCameraActive && (
                <div className="p-3 bg-black/90 rounded-2xl space-y-3 text-center">
                  <p className="text-xs text-white font-medium">Aponte a câmera para o documento assinado:</p>
                  {cameraError ? (
                    <p className="text-xs text-rose-400">{cameraError}</p>
                  ) : (
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full max-h-64 object-contain rounded-xl bg-black mx-auto"
                    />
                  )}
                  <div className="flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={captureCameraPhoto}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-md cursor-pointer"
                    >
                      Capturar Foto
                    </button>
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white text-xs font-bold rounded-xl cursor-pointer"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* List of Uploaded Attachments */}
            {attachments.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {attachments.map(att => (
                  <div
                    key={att.id}
                    className="p-3 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2 flex flex-col justify-between"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate">{att.name}</p>
                          <p className="text-[10.5px] text-slate-500">
                            Anexado em {new Date(att.uploadedAt).toLocaleDateString('pt-BR')} • {att.fileType.toUpperCase()}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveAttachment(att.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded-lg transition print:hidden cursor-pointer"
                        title="Remover anexo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Image Preview Thumbnail */}
                    {att.fileType === 'image' && (
                      <div className="w-full h-32 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 flex items-center justify-center">
                        <img
                          src={att.fileUrl}
                          alt="Assinatura do Paciente"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100 text-emerald-800 font-semibold">
                      <span>✓ Formalizado com Assinatura</span>
                      <a
                        href={att.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#4a4a35] underline flex items-center gap-0.5 print:hidden"
                      >
                        <Eye className="w-3 h-3" /> Ver Original
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center text-xs text-slate-500">
                Nenhum comprovante assinado anexado ainda. Utilize os botões acima para fotografar ou enviar o arquivo.
              </div>
            )}
          </div>

          {/* Section 5: Assinaturas */}
          <div className="pt-6 border-t-2 border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-8 items-end">
            <div className="text-center space-y-1">
              <div className="w-64 mx-auto border-b border-slate-800 pb-1" />
              <strong className="text-xs font-bold text-slate-900 block">{patient.name}</strong>
              <span className="text-[10px] text-slate-500">Assinatura do(a) Paciente / Responsável Legal</span>
            </div>

            <div className="text-center space-y-1">
              <DocumentSignatureFooter
                dentistName={activeProfessional.name || clinicInfo.dentistName}
                cro={activeProfessional.cro || clinicInfo.cro}
                specialty={activeProfessional.specialty || clinicInfo.specialty}
                clinicName={clinicInfo.name || activeClinic.name}
              />
            </div>
          </div>

        </div>

        {/* Modal Bottom Actions (Hidden on Print) */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200 print:hidden">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
          >
            Fechar
          </button>

          <div className="flex items-center gap-2">
            {saveFeedback && (
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 animate-fadeIn">
                ✓ Aceite do plano salvo com sucesso!
              </span>
            )}

            <button
              type="button"
              onClick={handleSaveConsent}
              className={`px-5 py-2.5 ${t.btnPrimaryBg} ${t.btnPrimaryText} font-bold text-xs rounded-xl flex items-center gap-1.5 transition shadow-sm cursor-pointer`}
            >
              <Check className="w-4 h-4" />
              <span>Salvar Formalização do Laudo</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
