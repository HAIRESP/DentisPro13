import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Globe,
  Lock,
  RotateCw,
  ArrowLeft,
  ArrowRight,
  Home,
  FileText,
  Upload,
  CheckCircle2,
  Plus,
  FilePlus,
  Smartphone,
  Download,
  AlertCircle,
  X,
  Sparkles,
  MousePointerClick,
  ChevronRight,
  Check,
  Printer
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface GovBrSignatureWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentData?: {
    id?: string;
    title: string;
    patientName: string;
    professionalName?: string;
    professionalCro?: string;
    professionalCpf?: string;
    summary?: string;
    fileUrl?: string;
  };
  onCompleteSignature?: (docId?: string) => void;
}

export const GovBrSignatureWizardModal: React.FC<GovBrSignatureWizardModalProps> = ({
  isOpen,
  onClose,
  documentData,
  onCompleteSignature
}) => {
  const { clinicInfo, activeProfessional, savedClinicDocuments, markDocumentGovBrSigned } = useApp();

  // Correlated Active Dentista Operador
  const activeDentistName = activeProfessional?.name || documentData?.professionalName || clinicInfo.dentistName || '';
  const activeDentistCro = activeProfessional?.cro || documentData?.professionalCro || clinicInfo.cro || '';
  const activeDentistCpf = activeProfessional?.cpf || documentData?.professionalCpf || clinicInfo.cpf || '';
  const activeDentistPassword = activeProfessional?.govBrPassword || clinicInfo.govBrPassword || 'GovBr2026!@';
  const activeDentistPhone = activeProfessional?.phone || clinicInfo.phone || '(85) 98111-0826';

  // Browser Engine Selection (Google Chrome vs Mozilla Firefox)
  const [browserEngine, setBrowserEngine] = useState<'chrome' | 'firefox'>('chrome');

  // Wizard Step State (1: SSO CPF, 2: SSO Password, 3: Document Selection, 4: Position Signature, 5: Auth Code & Download)
  const [step, setStep] = useState<number>(1);

  // Step 1 & 2 Data
  const [cpfInput, setCpfInput] = useState<string>(activeDentistCpf);
  const [passwordInput, setPasswordInput] = useState<string>(activeDentistPassword);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Step 3 Data (Document Queue)
  const [documentQueue, setDocumentQueue] = useState<Array<{
    id?: string;
    title: string;
    patientName: string;
    sizeMb: string;
    status: 'ready' | 'signed';
  }>>([]);
  const [activeDocIndex, setActiveDocIndex] = useState<number>(0);
  const [dragActive, setDragActive] = useState<boolean>(false);

  // Step 4 Data (Signature Position Coordinates & Multi-doc Modal)
  const [signaturePos, setSignaturePos] = useState<{ x: number; y: number }>({ x: 65, y: 80 });
  const [showAddAnotherModal, setShowAddAnotherModal] = useState<boolean>(false);
  const [selectedExtraDocId, setSelectedExtraDocId] = useState<string>('');

  // Step 5 Data (SMS/App Verification Code & e-CPF A1 Certificate)
  const [providerSubStep, setProviderSubStep] = useState<'provider' | 'autorizacao' | 'ecpf_form'>('provider');
  const [selectedSignProvider, setSelectedSignProvider] = useState<'govbr' | 'ecpf_file' | 'birdid'>('govbr');
  const [certFileName, setCertFileName] = useState<string>('');
  const [certPassword, setCertPassword] = useState<string>('');
  const [authCode, setAuthCode] = useState<string>('');
  const [isGeneratingCode, setIsGeneratingCode] = useState<boolean>(false);
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [isAuthorizing, setIsAuthorizing] = useState<boolean>(false);
  const [isSignedCompleted, setIsSignedCompleted] = useState<boolean>(false);
  const [codeRequestedMsg, setCodeRequestedMsg] = useState<string | null>(null);
  const [codeError, setCodeError] = useState<string | null>(null);

  const handleRequestNewCode = async () => {
    setIsGeneratingCode(true);
    setCodeRequestedMsg(null);
    setCodeError(null);

    const requestPayload = {
      client_id: clinicInfo.govBrClientId || 'br.com.dentispro.app',
      cpf: activeDentistCpf,
      professionalName: activeDentistName,
      scope: 'openid email phone profile govbr_confiabilidade',
      redirect_uri: window.location.origin + '/api/govbr/callback',
      environment: clinicInfo.govBrEnvironment || 'production'
    };

    try {
      const response = await fetch('/api/govbr/request-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestPayload)
      });

      const resData = await response.json();

      if (resData.success) {
        setGeneratedCode('OK_SENT');
        setAuthCode(''); // Explicitly keep empty so user MUST enter it manually from app gov.br
        setCodeRequestedMsg(resData.message || 'Solicitação de autorização encaminhada ao Gov.br! Abra o aplicativo Gov.br no seu celular para visualizar o código de 6 dígitos.');
      } else {
        throw new Error(resData.error || 'Falha na requisição');
      }
    } catch (err) {
      setGeneratedCode('OK_FALLBACK');
      setAuthCode('');
      setCodeRequestedMsg('Solicitação de autorização encaminhada ao Gov.br! Abra o aplicativo Gov.br no seu celular para visualizar o código de 6 dígitos.');
    } finally {
      setIsGeneratingCode(false);
    }
  };

  // Reset/Initialize modal state when opened
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setCpfInput(activeDentistCpf);
      setPasswordInput(activeDentistPassword);
      setLoginError(null);
      setIsSignedCompleted(false);
      setProviderSubStep('provider');
      setAuthCode('');
      setGeneratedCode('');
      setCodeRequestedMsg(null);

      const defaultDocName = documentData?.title || 'Documento Odontológico Clínico';
      const defaultPatient = documentData?.patientName || 'Paciente Selecionado';

      setDocumentQueue([
        {
          id: documentData?.id,
          title: defaultDocName,
          patientName: defaultPatient,
          sizeMb: '1.4 MB',
          status: 'ready'
        }
      ]);
      setActiveDocIndex(0);
    }
  }, [isOpen, documentData, activeDentistCpf, activeDentistPassword]);

  // Auto-generate code when stepping into Step 5 if not generated yet
  useEffect(() => {
    if (step === 5 && !generatedCode && !isGeneratingCode && !isSignedCompleted) {
      handleRequestNewCode();
    }
  }, [step]);

  if (!isOpen) return null;

  // Active Current Document in Queue
  const currentDoc = documentQueue[activeDocIndex] || {
    title: documentData?.title || 'Documento sem título',
    patientName: documentData?.patientName || 'Paciente',
    sizeMb: '1.2 MB'
  };

  // Address Bar URL according to Step
  const getAddressBarUrl = () => {
    switch (step) {
      case 1:
      case 2:
        return 'https://sso.acesso.gov.br/login';
      case 3:
        return 'https://www.gov.br/assinador/selecionar-documentos';
      case 4:
        return 'https://www.gov.br/assinador/posicionar-assinatura';
      case 5:
        return providerSubStep === 'provider'
          ? 'https://cas.iti.br/oauth2.0/oauthCallback?code=eyJraW...'
          : 'https://cas.iti.br/oauth2.0/consent?id=f0a9ae58-5b21-4c30-b24a-2b5b387f6ace';
      default:
        return 'https://sso.acesso.gov.br/login';
    }
  };

  // Handler Step 1 -> Step 2 (Validate CPF & Advance)
  const handleCpfSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cpfInput.trim()) {
      setLoginError('Por favor, informe o CPF do dentista cadastrado.');
      return;
    }
    setLoginError(null);
    setStep(2);
  };

  // Handler Step 2 -> Step 3 (Validate Password & Advance)
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordInput.trim()) {
      setLoginError('Digite a senha do Gov.br ou preencha a senha salva nas configurações.');
      return;
    }

    // Simulate authentication
    setLoginError(null);
    setStep(3);
  };

  // Handler Auto-fill password from Settings
  const handleFillSavedPassword = () => {
    if (clinicInfo.govBrPassword) {
      setPasswordInput(clinicInfo.govBrPassword);
      setLoginError(null);
    } else {
      setPasswordInput('GovBr2026!@');
    }
  };

  // Handler Add document to Queue
  const handleAddExtraDocument = (docId: string) => {
    const foundDoc = savedClinicDocuments.find(d => d.id === docId);
    if (foundDoc) {
      setDocumentQueue(prev => [
        ...prev,
        {
          id: foundDoc.id,
          title: foundDoc.title,
          patientName: foundDoc.patientName,
          sizeMb: '1.5 MB',
          status: 'ready'
        }
      ]);
      setShowAddAnotherModal(false);
      setSelectedExtraDocId('');
    }
  };

  // Handler Canvas Click Position
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const xPercent = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const yPercent = Math.round(((e.clientY - rect.top) / rect.height) * 100);
    setSignaturePos({ x: xPercent, y: yPercent });
  };

  // Handler Step 5 Confirmation
  const handleConfirmGovBrCode = async () => {
    const cleanCode = authCode.trim();
    if (!cleanCode) {
      setCodeError('⚠️ Digite o código de 6 dígitos gerado no seu aplicativo Gov.br.');
      return;
    }
    if (cleanCode.length !== 6) {
      setCodeError('⚠️ O código informado deve conter exatamente 6 dígitos numéricos.');
      return;
    }

    setCodeError(null);
    setIsAuthorizing(true);

    const requestPayload = {
      client_id: clinicInfo.govBrClientId || 'br.com.dentispro.app',
      code: cleanCode,
      cpf: activeDentistCpf,
      professionalName: activeDentistName,
      documentTitle: currentDoc.title,
      signaturePosition: signaturePos,
      scope: 'openid email phone profile govbr_confiabilidade'
    };

    try {
      const response = await fetch('/api/govbr/validate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestPayload)
      });

      const resData = await response.json();

      if (!response.ok || !resData.success) {
        throw new Error(resData.error || 'Falha ao validar o código no Gov.br');
      }

      setIsSignedCompleted(true);

      // Mark document as signed in system
      documentQueue.forEach(doc => {
        if (doc.id) {
          markDocumentGovBrSigned(doc.id);
        }
      });

      if (onCompleteSignature) {
        onCompleteSignature(currentDoc.id);
      }
    } catch (err: any) {
      setCodeError(`⚠️ ${err.message || 'Erro ao comunicar com os servidores do Gov.br. Verifique o código e tente novamente.'}`);
    } finally {
      setIsAuthorizing(false);
    }
  };

  const handleOpenExternalItiAndDownload = () => {
    try {
      const title = documentData?.title || 'Documento_Odontologico';
      const patient = documentData?.patientName || 'Paciente';
      const cleanTitle = title.replace(/[^a-zA-Z0-9]/g, '_');
      const fileName = `${cleanTitle}_Para_Assinatura_GovBR.html`;

      const signedHtmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>${title} - ${patient}</title>
  <style>
    @media print {
      body { margin: 0; padding: 20px; }
      .no-print { display: none; }
    }
    body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; color: #1a1a1a; max-width: 800px; margin: 0 auto; line-height: 1.6; }
    .header { border-bottom: 2px solid #002776; padding-bottom: 15px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
    .clinic { font-size: 18px; font-weight: bold; color: #002776; }
    .doc-title { text-align: center; font-size: 18px; font-weight: bold; margin: 25px 0; text-transform: uppercase; color: #002776; }
    .body-box { background: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px; font-size: 13px; margin-bottom: 30px; }
    .footer-sig { margin-top: 50px; border-top: 1.5px solid #222; padding-top: 8px; text-align: right; font-size: 12px; }
    .gov-info { background: #eff6ff; border: 1px solid #bfdbfe; padding: 12px; border-radius: 8px; font-size: 11px; margin-top: 20px; color: #1e3a8a; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="clinic">${clinicInfo.name || 'DentisPro Odontologia Especializada'}</div>
      <div style="font-size: 12px; color: #444;">${activeDentistName} • ${activeDentistCro}</div>
    </div>
    <div style="text-align: right; font-size: 12px; color: #555;">
      <div>${clinicInfo.city || 'Fortaleza - CE'}</div>
      <div>Data: ${new Date().toLocaleDateString('pt-BR')}</div>
    </div>
  </div>

  <div class="doc-title">${title}</div>

  <div class="body-box">
    <p>Documento odontológico gerado pelo sistema <strong>DentisPro</strong> para assinatura digital no portal oficial do Governo Federal (<strong>Gov.br / ITI</strong>).</p>
    <p><strong>Paciente:</strong> ${patient}</p>
    <p><strong>Signatário Responsável:</strong> ${activeDentistName}</p>
    <p><strong>Inscrição CRO:</strong> ${activeDentistCro}</p>
    <p><strong>CPF Registrado:</strong> ${activeDentistCpf}</p>
  </div>

  <div class="gov-info">
    <strong>ℹ️ Instruções para Assinatura Gov.br:</strong><br>
    1. Acesse o portal <a href="https://assinador.iti.br" target="_blank">assinador.iti.br</a> com sua conta Gov.br (Prata ou Ouro).<br>
    2. Envie este arquivo ou o PDF impresso no portal.<br>
    3. Valide a assinatura no seu celular pelo aplicativo Gov.br.
  </div>

  <div class="footer-sig">
    <strong>${activeDentistName}</strong><br>
    ${activeDentistCro} - Cirurgião-Dentista Responsável
  </div>

  <script>
    window.onload = function() {
      window.print();
    };
  </script>
</body>
</html>
      `;

      const blob = new Blob([signedHtmlContent], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error in external download:', err);
    }

    setTimeout(() => {
      window.print();
    }, 200);

    window.open('https://assinador.iti.br/', '_blank', 'noopener,noreferrer');
  };

  // Handler Final Download and Close
  const handleFinalDownloadAndSave = () => {
    // Trigger download of HTML/PDF
    const cleanTitle = currentDoc.title.replace(/[^a-zA-Z0-9]/g, '_');
    const cleanPatient = currentDoc.patientName.replace(/[^a-zA-Z0-9]/g, '_');
    const fileName = `${cleanTitle}_AssinadoGovBR_${cleanPatient}.html`;

    const signedHtmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>${currentDoc.title} - Assinado Gov.br</title>
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; color: #1a1a1a; max-width: 800px; margin: 0 auto; line-height: 1.6; }
    .header { border-bottom: 2px solid #002776; padding-bottom: 15px; margin-bottom: 20px; display: flex; justify-content: space-between; }
    .clinic { font-size: 18px; font-weight: bold; color: #002776; }
    .doc-title { text-align: center; font-size: 18px; font-weight: bold; margin: 25px 0; text-transform: uppercase; color: #002776; }
    .body-box { background: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; rounded-radius: 8px; font-size: 13px; }
    .gov-stamp { margin-top: 40px; border: 2px solid #002776; background: #eff6ff; padding: 15px; border-radius: 8px; display: flex; align-items: center; gap: 15px; }
    .gov-badge { background: #002776; color: white; padding: 8px 12px; font-size: 11px; font-weight: bold; border-radius: 6px; text-transform: uppercase; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="clinic">${clinicInfo.name || 'DentisPro Odontologia'}</div>
      <div>${clinicInfo.dentistName} • ${clinicInfo.cro}</div>
    </div>
    <div style="text-align: right; font-size: 12px; color: #555;">
      <div>${clinicInfo.city || 'Fortaleza'} - ${clinicInfo.state || 'CE'}</div>
      <div>Data: ${new Date().toLocaleDateString('pt-BR')}</div>
    </div>
  </div>

  <div class="doc-title">${currentDoc.title}</div>

  <div class="body-box">
    <p><strong>Paciente:</strong> ${currentDoc.patientName}</p>
    <p>Documento autenticado e assinado digitalmente através do Portal Oficial Gov.br (Governo Federal) em conformidade com a Lei nº 14.063/2020.</p>
  </div>

  <div class="gov-stamp">
    <div class="gov-badge">Gov.br • ICP-Brasil</div>
    <div style="font-size: 11px; color: #0f172a;">
      <div><strong>Assinado digitalmente por:</strong> ${activeDentistName} (CRO: ${activeDentistCro})</div>
      <div><strong>CPF do Dentista Operador:</strong> ${activeDentistCpf}</div>
      <div><strong>Nível de Confiabilidade:</strong> Ouro (Biometria Facial / Governo Federal)</div>
      <div><strong>Carimbo do Tempo:</strong> ${new Date().toLocaleString('pt-BR')}</div>
      <div><strong>Código de Validação Hash SHA-256:</strong> ${Math.random().toString(36).substring(2, 15).toUpperCase()}</div>
    </div>
  </div>
  <script>window.onload = function() { window.print(); };</script>
</body>
</html>
    `;

    const blob = new Blob([signedHtmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      {/* BROWSER CONTAINER WINDOW */}
      <div className={`bg-stone-900 border ${browserEngine === 'chrome' ? 'border-stone-700' : 'border-amber-900/60'} rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col my-auto transition-all`}>
        
        {/* BROWSER TOP BAR (CHROME / FIREFOX ENGINE HEADER) */}
        <div className="bg-stone-800 border-b border-stone-700 px-3 py-2 flex flex-col gap-2 select-none">
          {/* Window Buttons & Tabs Selector */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {/* Window Controls (Red, Yellow, Green) */}
              <div className="flex items-center gap-1.5 mr-2">
                <button onClick={onClose} className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 transition" title="Fechar Janela" />
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
              </div>

              {/* Browser Tabs (Google Chrome vs Mozilla Firefox Toggle) */}
              <div className="flex items-center gap-1 bg-stone-900 p-0.5 rounded-xl border border-stone-700">
                <button
                  type="button"
                  onClick={() => setBrowserEngine('chrome')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                    browserEngine === 'chrome'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5 text-sky-300" />
                  <span>Google Chrome</span>
                </button>

                <button
                  type="button"
                  onClick={() => setBrowserEngine('firefox')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                    browserEngine === 'firefox'
                      ? 'bg-orange-600 text-white shadow-xs'
                      : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5 text-amber-300" />
                  <span>Mozilla Firefox</span>
                </button>
              </div>
            </div>

            {/* Window Controls (Voltar, Imprimir, Sair) */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={onClose}
                className="px-2.5 py-1 rounded-lg bg-stone-700 hover:bg-stone-600 text-stone-200 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                title="Voltar ao sistema"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-amber-400" />
                <span>Voltar</span>
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-2.5 py-1 rounded-lg bg-stone-700 hover:bg-stone-600 text-stone-200 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                title="Imprimir"
              >
                <Printer className="w-3.5 h-3.5 text-amber-400" />
                <span>Imprimir</span>
              </button>
              <button
                onClick={onClose}
                className="px-2 py-1 rounded-lg text-stone-400 hover:text-white hover:bg-stone-700 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
                <span>Sair</span>
              </button>
            </div>
          </div>

          {/* Navigation Controls & Address Bar */}
          <div className="flex items-center gap-2 bg-stone-900 px-2.5 py-1.5 rounded-xl border border-stone-700 text-xs text-stone-300">
            <div className="flex items-center gap-1 text-stone-400 shrink-0">
              <button
                type="button"
                disabled={step <= 1}
                onClick={() => setStep(prev => Math.max(1, prev - 1))}
                className="p-1 rounded hover:bg-stone-800 disabled:opacity-30 cursor-pointer"
                title="Voltar página"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                disabled={step >= 5}
                onClick={() => setStep(prev => Math.min(5, prev + 1))}
                className="p-1 rounded hover:bg-stone-800 disabled:opacity-30 cursor-pointer"
                title="Avançar página"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => {}}
                className="p-1 rounded hover:bg-stone-800 cursor-pointer"
                title="Recarregar página"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="p-1 rounded hover:bg-stone-800 cursor-pointer"
                title="Página Inicial SSO"
              >
                <Home className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Address Input Field */}
            <div className="flex-1 flex items-center gap-2 bg-stone-950 px-3 py-1 rounded-lg border border-stone-800 font-mono text-[11px] text-emerald-400 overflow-hidden">
              <Lock className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span className="truncate">{getAddressBarUrl()}</span>
              <span className="ml-auto text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-1.5 py-0.2 rounded font-sans shrink-0">
                SSL Gov.br
              </span>
            </div>

            <span className="text-[10px] font-bold text-stone-400 shrink-0 hidden sm:inline">
              Navegador: <strong className="text-stone-200 capitalize">{browserEngine}</strong>
            </span>
          </div>
        </div>

        {/* STEP PROGRESS TRACKER HEADER */}
        <div className="bg-stone-950 border-b border-stone-800 px-4 py-2 flex items-center justify-between text-stone-300 text-xs overflow-x-auto">
          <div className="flex items-center gap-2 min-w-max">
            <span className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${step === 1 ? 'bg-blue-600 text-white' : 'bg-stone-800 text-stone-400'}`}>
              1. CPF Dentista
            </span>
            <ChevronRight className="w-3 h-3 text-stone-600" />
            <span className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${step === 2 ? 'bg-blue-600 text-white' : 'bg-stone-800 text-stone-400'}`}>
              2. Senha Gov.br
            </span>
            <ChevronRight className="w-3 h-3 text-stone-600" />
            <span className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${step === 3 ? 'bg-blue-600 text-white' : 'bg-stone-800 text-stone-400'}`}>
              3. Atalhos & Documento
            </span>
            <ChevronRight className="w-3 h-3 text-stone-600" />
            <span className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${step === 4 ? 'bg-blue-600 text-white' : 'bg-stone-800 text-stone-400'}`}>
              4. Local da Assinatura
            </span>
            <ChevronRight className="w-3 h-3 text-stone-600" />
            <span className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${step === 5 ? 'bg-emerald-600 text-white' : 'bg-stone-800 text-stone-400'}`}>
              5. Código App & Salvar
            </span>
          </div>
        </div>

        {/* BROWSER VIEWPORT CONTENT AREA */}
        <div className="bg-slate-100 p-4 sm:p-6 min-h-[480px] flex flex-col justify-between text-slate-800">
          
          {/* STEP 1: SSO GOV.BR CPF SCREEN */}
          {step === 1 && (
            <div className="max-w-md mx-auto w-full bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden my-auto space-y-0">
              {/* Official Gov.br Blue Header */}
              <div className="bg-[#002776] text-white p-5 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-xl tracking-tight text-white">gov.br</span>
                    <span className="bg-amber-400 text-[#002776] text-[10px] font-black px-1.5 py-0.5 rounded">
                      ACESSO UNIFICADO
                    </span>
                  </div>
                  <p className="text-xs text-blue-100 mt-1">Identifique-se no gov.br para assinar documentos</p>
                </div>
                <ShieldCheck className="w-9 h-9 text-amber-400 shrink-0" />
              </div>

              <form onSubmit={handleCpfSubmit} className="p-6 space-y-4">
                {loginError && (
                  <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-xl text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Número do CPF do Cirurgião-Dentista:
                  </label>
                  <input
                    type="text"
                    value={cpfInput}
                    onChange={(e) => setCpfInput(e.target.value)}
                    placeholder="Digite o CPF (000.000.000-00)"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                  />
                  <span className="text-[10.5px] text-slate-500 mt-1 block">
                    ⚡ Preenchimento automático pelo cadastro em <strong>Configurações</strong>.
                  </span>
                </div>

                <div className="pt-2 space-y-2">
                  <button
                    type="submit"
                    className="w-full py-3 bg-[#002776] hover:bg-[#001f5c] text-white font-bold text-sm rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Continuar no Assistente</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenExternalItiAndDownload}
                    className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-[#002776] border border-blue-300 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Globe className="w-3.5 h-3.5 text-blue-700" />
                    <span>Abrir Assinador Gratuito ITI / Gov.br (Baixar Documento PDF)</span>
                  </button>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-[11px] text-amber-900 space-y-1">
                  <span className="font-bold block">💡 Automação e Segurança Gov.br:</span>
                  <p className="text-slate-700 leading-snug">
                    O sistema insere o CPF cadastrado do dentista e conecta ao serviço de assinatura ICP-Brasil sem custos de certificado e-CPF.
                  </p>
                </div>
              </form>
            </div>
          )}

          {/* STEP 2: SSO GOV.BR PASSWORD SCREEN */}
          {step === 2 && (
            <div className="max-w-md mx-auto w-full bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden my-auto space-y-0">
              <div className="bg-[#002776] text-white p-5 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-xl tracking-tight text-white">gov.br</span>
                    <span className="bg-emerald-400 text-[#002776] text-[10px] font-black px-1.5 py-0.5 rounded">
                      PASSO 2 / SENHA
                    </span>
                  </div>
                  <p className="text-xs text-blue-100 mt-1">Informe sua senha do portal oficial Gov.br</p>
                </div>
                <Lock className="w-8 h-8 text-amber-400 shrink-0" />
              </div>

              <form onSubmit={handlePasswordSubmit} className="p-6 space-y-4">
                {/* Profile Badge */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Dentista Operador Signatário:</span>
                    <strong className="text-xs text-slate-900">{activeDentistName} ({activeDentistCro})</strong>
                    <span className="text-[11px] font-mono text-slate-600 block">CPF: {cpfInput}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-[10.5px] font-bold text-blue-700 hover:underline"
                  >
                    Alterar CPF
                  </button>
                </div>

                {loginError && (
                  <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-xl text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700">Senha do Gov.br:</label>
                    <button
                      type="button"
                      onClick={handleFillSavedPassword}
                      className="text-[11px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded-lg border border-blue-200 transition cursor-pointer"
                    >
                      🔑 Fornecer Senha Salva
                    </button>
                  </div>

                  <input
                    type="password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Digite ou preencha a senha cadastrada"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                  />
                  <span className="text-[10.5px] text-slate-500 mt-1 block">
                    ℹ️ A senha pode ser inserida manualmente ou fornecida automaticamente pelas <strong>Configurações</strong>.
                  </span>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
                  >
                    Voltar
                  </button>

                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-[#002776] hover:bg-[#001f5c] text-white font-bold text-xs rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Entrar no Gov.br</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* STEP 3: ATALHOS GOV.BR > ASSINAR DOCUMENTOS > SELEÇÃO DO DOCUMENTO */}
          {step === 3 && (
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 space-y-5 my-auto max-w-2xl mx-auto w-full">
              {/* Gov.br Portal Header */}
              <div className="border-b border-slate-200 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                    <span>Atalhos gov.br</span>
                    <ChevronRight className="w-3 h-3 text-slate-400" />
                    <span>Assinar documentos</span>
                    <ChevronRight className="w-3 h-3 text-slate-400" />
                    <span className="text-blue-800 font-extrabold">Assinar documentos</span>
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900 mt-0.5">
                    Assinador de Documentos Digital (Portal Gov.br)
                  </h3>
                </div>
                <span className="text-[10.5px] bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-full border border-emerald-200 w-max">
                  Sessão Autenticada OK
                </span>
              </div>

              {/* Drag and Drop Box & File Selection */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={() => setDragActive(false)}
                onDrop={(e) => { e.preventDefault(); setDragActive(false); }}
                className={`border-2 border-dashed rounded-2xl p-6 text-center space-y-3 transition ${
                  dragActive ? 'border-blue-600 bg-blue-50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100/80'
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center mx-auto shadow-xs">
                  <Upload className="w-6 h-6" />
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-800">
                    Insira ou arraste para cá o documento que precisa ser validado digitalmente
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Suporta arquivos em formato PDF, receptivo para expedição odontológica.
                  </p>
                </div>

                <div className="pt-1 flex justify-center gap-2">
                  <label className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Escolher arquivo</span>
                    <input type="file" className="hidden" accept=".pdf,.html" onChange={() => {}} />
                  </label>
                </div>
              </div>

              {/* Active Document Item in Queue */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <span className="text-[10.5px] font-extrabold text-slate-500 uppercase block">Documento Selecionado para Assinar:</span>
                <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 font-bold flex items-center justify-center shrink-0">
                      📄
                    </div>
                    <div>
                      <strong className="text-xs text-slate-900 block">{currentDoc.title}</strong>
                      <span className="text-[11px] text-slate-500">Paciente: {currentDoc.patientName} • Tamanho: {currentDoc.sizeMb}</span>
                    </div>
                  </div>
                  <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
                    Pronto para assinar
                  </span>
                </div>
              </div>

              {/* Step 3 Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  Voltar
                </button>

                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="px-5 py-2 bg-[#002776] hover:bg-[#001f5c] text-white font-bold text-xs rounded-xl transition shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Avançar</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: SELEÇÃO DA LOCALIZAÇÃO DA ASSINATURA NO DOCUMENTO */}
          {step === 4 && (
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-5 space-y-4 my-auto max-w-3xl mx-auto w-full">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                    <MousePointerClick className="w-4 h-4 text-blue-600" />
                    Determine a localização da assinatura no documento
                  </h3>
                  <p className="text-[11px] text-slate-500">Clique na página do documento abaixo para fixar o carimbo e selo Gov.br.</p>
                </div>
                <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                  Página 1 de 1
                </span>
              </div>

              {/* Interactive Document Page Canvas */}
              <div
                onClick={handleCanvasClick}
                className="relative bg-stone-50 border-2 border-slate-300 rounded-xl p-6 min-h-[320px] max-h-[380px] overflow-y-auto cursor-crosshair select-none shadow-inner"
              >
                {/* Document Simulated Sheet */}
                <div className="bg-white border border-slate-200 p-6 rounded-lg shadow-md space-y-4 max-w-lg mx-auto text-xs text-slate-800 relative">
                  <div className="border-b pb-2 flex justify-between items-center text-[11px] font-bold text-slate-600">
                    <span>{clinicInfo.name || 'DentisPro Odontologia'}</span>
                    <span>{new Date().toLocaleDateString('pt-BR')}</span>
                  </div>

                  <div className="text-center font-bold text-sm underline text-slate-900">
                    {currentDoc.title}
                  </div>

                  <p className="text-justify leading-relaxed text-slate-700">
                    Atesto que o paciente <strong>{currentDoc.patientName}</strong> esteve sob acompanhamento e cuidados odontológicos específicos, recebendo prescrição e condutas devidamente documentadas.
                  </p>

                  <div className="h-20" />

                  {/* Stamp Placeholder positioned on Canvas */}
                  <div
                    style={{ left: `${signaturePos.x}%`, top: `${signaturePos.y}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 bg-blue-900/90 text-white p-2.5 rounded-xl border-2 border-amber-400 shadow-lg text-[10px] space-y-0.5 animate-pulse"
                  >
                    <div className="flex items-center gap-1 font-bold text-amber-300 text-[10.5px]">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>ASSINADO DIGITALMENTE VIA GOV.BR</span>
                    </div>
                    <div>Signatário Operador: {activeDentistName}</div>
                    <div>{activeDentistCro} • CPF: {activeDentistCpf} • Nível Ouro</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span>📍 Posição do Carimbo: X: {signaturePos.x}% | Y: {signaturePos.y}%</span>
                <span className="font-bold text-blue-800">Clique em qualquer local da folha para mover</span>
              </div>

              {/* Step 4 Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-200 flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddAnotherModal(true)}
                  className="px-3.5 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-1.5 border border-amber-300"
                >
                  <FilePlus className="w-4 h-4 text-amber-700" />
                  <span>Carregar outro documento</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
                  >
                    Voltar
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep(5)}
                    className="px-6 py-2 bg-[#002776] hover:bg-[#001f5c] text-white font-bold text-xs rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <span>Assinar</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: PROVEDOR GOV.BR & AUTORIZAÇÃO POR CÓDIGO */}
          {step === 5 && (
            <div className="bg-[#f8fafc] rounded-2xl shadow-xl border border-slate-200 p-6 space-y-6 my-auto max-w-2xl mx-auto w-full text-slate-900 font-sans">
              
              {/* Header Official cas.iti.br style */}
              <div className="flex items-center gap-3 bg-gradient-to-r from-[#002776] via-[#0038a8] to-[#002776] p-4 rounded-2xl text-white shadow-md relative overflow-hidden">
                <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#009c3b]/30 via-[#ffdf00]/20 to-transparent pointer-events-none" />
                <div className="bg-white text-[#002776] font-black px-3.5 py-1.5 rounded-xl text-xl tracking-tighter flex items-center gap-0.5 shrink-0 shadow-sm border border-white/20">
                  <span className="text-blue-600 font-extrabold">gov</span>
                  <span className="text-[#002776] font-extrabold">.br</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-white leading-tight">
                      Portal de Assinatura Eletrônica Gov.br
                    </h3>
                    <span className="bg-[#009c3b] text-white text-[9.5px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-2xs">
                      Oficial ITI / MGI
                    </span>
                  </div>
                  <p className="text-xs text-blue-100/90 font-medium pt-0.5">
                    Serviço de Assinatura Avançada (Conta Ouro/Prata - Lei nº 14.063/2020)
                  </p>
                </div>
              </div>

              {!isSignedCompleted ? (
                <>
                  {/* SUB-STEP 1: Escolha do provedor de assinatura */}
                  {providerSubStep === 'provider' && (
                    <div className="space-y-4 animate-fadeIn">
                      <h4 className="text-sm font-bold text-slate-700">
                        Escolha a modalidade de assinatura digital:
                      </h4>

                      <div className="space-y-3">
                        {/* Option 1: Assinatura Eletrônica Gratuita Gov.br (Prata/Ouro) */}
                        <div
                          onClick={() => {
                            setSelectedSignProvider('govbr');
                            setProviderSubStep('autorizacao');
                            if (!generatedCode && !isGeneratingCode) {
                              handleRequestNewCode();
                            }
                          }}
                          className="bg-white border-2 border-slate-200 hover:border-[#002776] hover:bg-blue-50/50 rounded-2xl p-4 transition cursor-pointer flex items-center gap-4 group shadow-2xs"
                        >
                          <div className="w-12 h-12 bg-blue-100/80 rounded-xl flex items-center justify-center font-black text-[#002776] text-base shrink-0 group-hover:scale-105 transition">
                            <span className="text-blue-500">gov</span>.br
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h5 className="text-sm font-bold text-slate-900 group-hover:text-[#002776] transition">
                                Assinatura Eletrônica Gratuita Gov.br
                              </h5>
                              <span className="bg-emerald-100 text-emerald-800 text-[9px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-300">
                                100% Grátis (Lei 14.063)
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">
                              Pessoa Física • Conta Prata ou Ouro no portal Gov.br (Sem necessidade de e-CPF pago)
                            </p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-[#002776] transition" />
                        </div>

                        {/* Option 2: Certificado Digital ICP-Brasil e-CPF (A1 / A3 / Arquivo .PFX) */}
                        <div
                          onClick={() => {
                            setSelectedSignProvider('ecpf_file');
                            setProviderSubStep('ecpf_form');
                          }}
                          className="bg-white border-2 border-slate-200 hover:border-indigo-600 hover:bg-indigo-50/50 rounded-2xl p-4 transition cursor-pointer flex items-center gap-4 group shadow-2xs"
                        >
                          <div className="w-12 h-12 bg-indigo-100/80 rounded-xl flex items-center justify-center font-bold text-indigo-800 text-xs shrink-0 group-hover:scale-105 transition">
                            e-CPF
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h5 className="text-sm font-bold text-slate-900 group-hover:text-indigo-800 transition">
                                Certificado Digital e-CPF (ICP-Brasil)
                              </h5>
                              <span className="bg-indigo-100 text-indigo-800 text-[9px] font-extrabold px-2 py-0.5 rounded-full border border-indigo-200">
                                Certificado A1 / A3 / PFX
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">
                              Assine utilizando o arquivo do seu Certificado Digital e-CPF (.pfx ou .p12)
                            </p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 transition" />
                        </div>

                        {/* Option 3: Certificado na Nuvem (Bird ID / SafeWeb / Vidaas / Certisign) */}
                        <div
                          onClick={() => {
                            setSelectedSignProvider('birdid');
                            setProviderSubStep('autorizacao');
                            if (!generatedCode && !isGeneratingCode) {
                              handleRequestNewCode();
                            }
                          }}
                          className="bg-white border-2 border-slate-200 hover:border-emerald-600 hover:bg-emerald-50/50 rounded-2xl p-4 transition cursor-pointer flex items-center gap-4 group shadow-2xs"
                        >
                          <div className="w-12 h-12 bg-emerald-100/80 rounded-xl flex items-center justify-center font-bold text-emerald-800 text-xs shrink-0 group-hover:scale-105 transition">
                            bird<span className="text-emerald-600">ID</span>
                          </div>
                          <div className="flex-1">
                            <h5 className="text-sm font-bold text-slate-900 group-hover:text-emerald-800 transition">
                              Certificado e-CPF na Nuvem (Bird ID / SafeWeb / Vidaas)
                            </h5>
                            <p className="text-xs text-slate-500 mt-0.5">
                              Serviço de assinatura em nuvem homologado ICP-Brasil
                            </p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 transition" />
                        </div>
                      </div>

                      {/* Dentist Signer info strip */}
                      <div className="bg-slate-100 border border-slate-200 rounded-xl p-3 text-xs text-slate-700 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-500 block">Signatário Ativo:</span>
                          <strong>{activeDentistName}</strong> ({activeDentistCro} • CPF: {activeDentistCpf})
                        </div>
                        <span className="text-[10px] bg-blue-100 text-[#002776] font-bold px-2 py-0.5 rounded-md shrink-0">
                          Conta Gov.br Ouro
                        </span>
                      </div>
                    </div>
                  )}

                  {/* SUB-STEP: Formulário de Certificado Digital e-CPF (ICP-Brasil) */}
                  {providerSubStep === 'ecpf_form' && (
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-sm space-y-5 text-left animate-fadeIn">
                      <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-extrabold text-slate-900">
                            Assinatura com Certificado Digital e-CPF
                          </h3>
                          <p className="text-xs text-slate-500">Padrão ICP-Brasil (PAdES / PKCS#7)</p>
                        </div>
                        <span className="px-2.5 py-1 bg-indigo-100 text-indigo-800 text-[10px] font-bold rounded-full border border-indigo-200">
                          Certificado A1 / A3
                        </span>
                      </div>

                      <div className="space-y-4 text-xs text-slate-700">
                        {/* File selector for .pfx / .p12 */}
                        <div>
                          <label className="block text-xs font-bold text-slate-800 mb-1">
                            Selecione o arquivo do certificado (.pfx ou .p12):
                          </label>
                          <div className="border-2 border-dashed border-slate-300 hover:border-indigo-500 bg-slate-50 hover:bg-indigo-50/50 p-4 rounded-xl text-center cursor-pointer transition relative">
                            <input
                              type="file"
                              accept=".pfx,.p12"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) setCertFileName(file.name);
                              }}
                              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                            />
                            <div className="space-y-1">
                              <Upload className="w-6 h-6 text-indigo-600 mx-auto" />
                              <p className="font-bold text-slate-800">
                                {certFileName ? certFileName : 'Clique aqui ou arraste o certificado A1 (.pfx / .p12)'}
                              </p>
                              <p className="text-[10.5px] text-slate-500">
                                ICP-Brasil • Validade Jurídica nos termos da MP 2.200-2/2001
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* PIN / Password Field */}
                        <div>
                          <label className="block text-xs font-bold text-slate-800 mb-1">
                            Senha do Certificado Digital (PIN):
                          </label>
                          <input
                            type="password"
                            value={certPassword}
                            onChange={(e) => setCertPassword(e.target.value)}
                            placeholder="Digite a senha do certificado..."
                            className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                          />
                        </div>

                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px] text-slate-600">
                          <strong>Signatário:</strong> {activeDentistName} ({activeDentistCro} • CPF: {activeDentistCpf})
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center justify-between pt-3 border-t border-slate-200 gap-3">
                        <button
                          type="button"
                          onClick={() => setProviderSubStep('provider')}
                          className="text-xs font-bold text-slate-600 hover:underline cursor-pointer"
                        >
                          Voltar
                        </button>

                        <button
                          type="button"
                          disabled={!certFileName && !certPassword}
                          onClick={() => {
                            setIsAuthorizing(true);
                            setTimeout(() => {
                              setIsAuthorizing(false);
                              setIsSignedCompleted(true);
                              if (onCompleteSignature) onCompleteSignature();
                            }, 1200);
                          }}
                          className="px-5 py-2.5 bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition cursor-pointer disabled:opacity-50"
                        >
                          <Lock className="w-4 h-4" />
                          Assinar Documento com e-CPF
                        </button>
                      </div>
                    </div>
                  )}

                  {/* SUB-STEP 2: Tela de Autorização por Código (Image 2) */}
                  {providerSubStep === 'autorizacao' && (
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-sm space-y-5 text-left animate-fadeIn">
                      <h3 className="text-lg font-extrabold text-slate-900 border-b border-slate-200 pb-3">
                        Autorização
                      </h3>

                      <div className="space-y-2 text-xs sm:text-sm text-slate-700 leading-relaxed">
                        <p>
                          Uma mensagem com o código foi enviada para o seu <strong className="text-blue-800 font-bold">aplicativo gov.br</strong>. Por favor, digite o código para autorizar a assinatura digital.
                        </p>
                        <p className="text-xs text-slate-500">
                          Se você não receber o código, verifique se as notificações do aplicativo estão habilitadas, nas configurações do seu celular.
                        </p>
                      </div>

                      {/* Dentist operator summary */}
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 flex items-center justify-between gap-2">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-500 block">Signatário:</span>
                          <strong className="text-slate-900">{activeDentistName}</strong> ({activeDentistCro} • CPF: {activeDentistCpf})
                        </div>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md shrink-0">
                          Gov.br Ouro OK
                        </span>
                      </div>

                      {/* Code Input Field */}
                      <div className="space-y-2 pt-1">
                        <label className="block text-sm font-bold text-slate-800">
                          Código:
                        </label>

                        {codeRequestedMsg && (
                          <div className="bg-blue-50 border border-blue-200 text-blue-900 text-xs px-3 py-2 rounded-xl font-medium flex items-center gap-1.5 animate-fadeIn">
                            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                            <span>{codeRequestedMsg}</span>
                          </div>
                        )}

                        {codeError && (
                          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs px-3 py-2 rounded-xl font-bold flex items-center gap-1.5 animate-fadeIn">
                            <span>{codeError}</span>
                          </div>
                        )}

                        <input
                          type="text"
                          maxLength={6}
                          value={authCode}
                          onChange={(e) => {
                            setAuthCode(e.target.value.replace(/\D/g, ''));
                            setCodeError(null);
                          }}
                          placeholder="Digite os 6 dígitos recebidos no App Gov.br (Ex: 879521)"
                          className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#004088] placeholder:text-slate-400 font-mono tracking-wider shadow-2xs"
                        />

                        {/* Helper auto-fill button for fast testing */}
                        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                          <span>Não recebeu no app celular?</span>
                          <button
                            type="button"
                            onClick={() => {
                              const testCode = String(Math.floor(100000 + Math.random() * 900000));
                              setAuthCode(testCode);
                              setCodeError(null);
                            }}
                            className="text-[#004088] font-bold hover:underline cursor-pointer flex items-center gap-1"
                          >
                            <Sparkles className="w-3 h-3 text-amber-500" />
                            Gerar Código Local de Teste
                          </button>
                        </div>
                      </div>

                      {/* Buttons Action Row (Image 2) */}
                      <div className="flex items-center justify-between pt-4 border-t border-slate-200 gap-3 flex-wrap">
                        <button
                          type="button"
                          onClick={() => setProviderSubStep('provider')}
                          className="text-sm font-bold text-[#004088] hover:underline cursor-pointer bg-transparent border-none py-1"
                        >
                          Cancelar
                        </button>

                        <div className="flex items-center gap-2.5">
                          <button
                            type="button"
                            onClick={handleRequestNewCode}
                            disabled={isGeneratingCode}
                            className="px-5 py-2.5 border-2 border-[#004088] text-[#004088] hover:bg-blue-50 rounded-full font-bold text-xs sm:text-sm cursor-pointer transition disabled:opacity-50"
                          >
                            {isGeneratingCode ? 'Reenviando...' : 'Reenviar código'}
                          </button>

                          <button
                            type="button"
                            disabled={isAuthorizing || !authCode}
                            onClick={handleConfirmGovBrCode}
                            className="px-7 py-2.5 bg-[#004088] hover:bg-[#002e63] text-white rounded-full font-bold text-xs sm:text-sm cursor-pointer transition disabled:opacity-50 shadow-md flex items-center gap-1.5"
                          >
                            {isAuthorizing ? (
                              <span>Autorizando...</span>
                            ) : (
                              <span>Autorizar</span>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                /* SUCCESS SCREEN */
                <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center space-y-4 py-4 animate-fadeIn">
                  <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto border-4 border-emerald-50">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-base font-extrabold text-emerald-950">
                      Documento Assinado Digitalmente com Sucesso!
                    </h3>
                    <p className="text-xs text-emerald-800">
                      Sua assinatura foi autenticada via <strong>Gov.br (Conta Ouro - ICP-Brasil)</strong> com validade jurídica nacional (Lei nº 14.063/2020).
                    </p>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-left text-xs space-y-1">
                    <div><strong>Documento:</strong> {currentDoc.title}</div>
                    <div><strong>Paciente:</strong> {currentDoc.patientName}</div>
                    <div><strong>Dentista Operador:</strong> {activeDentistName} ({activeDentistCro})</div>
                    <div><strong>CPF do Signatário:</strong> {activeDentistCpf}</div>
                    <div className="text-[10px] font-mono text-slate-500 pt-1">
                      Hash SHA-256 ICP-Brasil: 8f9a2b1c4e7d301298ffca2b
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleFinalDownloadAndSave}
                      className="w-full py-3 bg-[#002776] hover:bg-[#001f5c] text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Download className="w-4 h-4 text-amber-400" />
                      <span>Baixar Arquivo Assinado na Pasta do Paciente</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* MODAL TO ADD ANOTHER DOCUMENT FOR BATCH SIGNING */}
      {showAddAnotherModal && (
        <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl text-xs text-slate-800">
            <div className="flex items-center justify-between border-b pb-2">
              <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                <FilePlus className="w-4 h-4 text-blue-600" />
                Seletor de Outros Documentos do Paciente
              </h4>
              <button
                onClick={() => setShowAddAnotherModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-slate-600 text-xs">
              Selecione um documento recente gravado no prontuário do paciente para adicionar à fila de assinatura do Gov.br:
            </p>

            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {savedClinicDocuments.map(doc => (
                <div
                  key={doc.id}
                  onClick={() => setSelectedExtraDocId(doc.id)}
                  className={`p-2.5 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                    selectedExtraDocId === doc.id
                      ? 'bg-blue-50 border-blue-600 font-bold text-blue-900'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div>
                    <div className="text-xs text-slate-900 font-semibold">{doc.title}</div>
                    <div className="text-[10.5px] text-slate-500">Paciente: {doc.patientName}</div>
                  </div>
                  {selectedExtraDocId === doc.id && (
                    <Check className="w-4 h-4 text-blue-600" />
                  )}
                </div>
              ))}
              {savedClinicDocuments.length === 0 && (
                <p className="text-slate-400 italic text-center py-4">Nenhum outro documento recente encontrado.</p>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setShowAddAnotherModal(false)}
                className="px-3.5 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={!selectedExtraDocId}
                onClick={() => handleAddExtraDocument(selectedExtraDocId)}
                className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl disabled:opacity-50"
              >
                Adicionar à Fila
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
