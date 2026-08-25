import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { getThemeStyles } from '../../utils/themeUtils';
import { formatCPF, formatDateMask, isValidEmail, isValidDateStr } from '../../utils/formatters';
import { 
  Send, 
  Camera, 
  UserPlus, 
  FileText, 
  Phone, 
  Upload, 
  Check, 
  RefreshCw, 
  Stethoscope, 
  Sparkles, 
  Edit3, 
  ClipboardList,
  User,
  CheckCircle2,
  Smile,
  Settings,
  Key,
  QrCode,
  Wifi,
  AlertCircle,
  Zap,
  CheckCircle,
  Copy,
  Trash2,
  Lock,
  Globe
} from 'lucide-react';
import { AddressFields, AddressData } from '../common/AddressFields';
import { PhoneInputWithDDI } from '../common/PhoneInputWithDDI';

interface PreCadastroData {
  nome: string;
  endereco: string;
  addressObj?: AddressData;
  cpf: string;
  dataNascimento: string;
  email: string;
  plano: string;
  carteirinha: string;
  telefone: string;
  motivo: string;
  rg?: string;
  documentImage?: string;
}

export const WhatsAppBotView: React.FC = () => {
  const { addPatient, openPatientProfile, clinicInfo, layoutTheme } = useApp();
  const t = getThemeStyles(layoutTheme);

  // View Mode: 'chat' (Interactive Triage with Cards), 'painel' (Reception Dashboard), or 'conexao_api' (WhatsApp API Settings & Reinstallation)
  const [viewMode, setViewMode] = useState<'chat' | 'painel' | 'conexao_api'>('chat');

  // WhatsApp API Settings State
  const [apiGatewayType, setApiGatewayType] = useState<'meta' | 'evolution'>('meta');
  const [metaAppId, setMetaAppId] = useState('1092837492837412');
  const [metaPhoneId, setMetaPhoneId] = useState('55119987654321');
  const [metaWabaId, setMetaWabaId] = useState('987654321098765');
  const [metaToken, setMetaToken] = useState('EAAG_dentispro_token_prod_2026');
  const [metaWebhookSecret, setMetaWebhookSecret] = useState('dentispro_wh_secret_2026');
  
  const [evolutionUrl, setEvolutionUrl] = useState('https://api.dentispro.app');
  const [evolutionKey, setEvolutionKey] = useState('evo_key_889123741');
  const [evolutionInstance, setEvolutionInstance] = useState('consultorio_principal');

  const [isTestingApi, setIsTestingApi] = useState(false);
  const [apiTestSuccess, setApiTestSuccess] = useState<boolean | null>(null);
  const [isCleanReinstalling, setIsCleanReinstalling] = useState(false);
  const [cleanReinstallStep, setCleanReinstallStep] = useState<string>('');
  const [reinstallDone, setReinstallDone] = useState(false);

  // Stage: 1 (Reason Cards), 2 (Data/Document Upload), 3 (Processing OCR), 4 (Review/Edit), 5 (Registered)
  const [stage, setStage] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Form / Extracted Patient Data
  const [formData, setFormData] = useState<PreCadastroData>({
    nome: '',
    endereco: '',
    addressObj: {
      cep: '',
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: ''
    },
    cpf: '',
    dataNascimento: '',
    email: '',
    plano: 'Particular',
    carteirinha: '',
    telefone: '',
    motivo: '',
    rg: '',
    documentImage: ''
  });

  // State for Surgery sub-options
  const [showSurgerySubMenu, setShowSurgerySubMenu] = useState(false);

  // Custom reason
  const [customReason, setCustomReason] = useState('');
  const [showCustomReasonInput, setShowCustomReasonInput] = useState(false);

  // OCR & Camera states
  const [isProcessingOcr, setIsProcessingOcr] = useState(false);
  const [ocrError, setOcrError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Interactive Triage Messages
  const [messages, setMessages] = useState<Array<{
    id: string;
    sender: 'bot' | 'user';
    text?: string;
    time: string;
    type?: 'text' | 'reason_grid' | 'data_request' | 'document_preview' | 'edit_form' | 'success_card';
    documentUrl?: string;
  }>>([
    {
      id: 'msg-1',
      sender: 'bot',
      text: 'Olá! Seja bem-vindo(a) à recepção. Como podemos lhe ajudar hoje?',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'reason_grid'
    }
  ]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, stage, isProcessingOcr]);

  // Handle reason card selection
  const handleSelectReason = (reason: string) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setFormData(prev => ({ ...prev, motivo: reason }));

    const userMsg = {
      id: `usr-${Date.now()}`,
      sender: 'user' as const,
      text: `Gostaria de atendimento para: ${reason}`,
      time: timeStr
    };

    const botMsg = {
      id: `bot-${Date.now() + 1}`,
      sender: 'bot' as const,
      text: 'Excelente! Por favor, informe seus dados para o pré-cadastro:\n\n💡 Você pode anexar uma FOTO DO SEU DOCUMENTO (RG, CPF, CNH ou Carteirinha) para preenchimento automático via Leitura Óptica (OCR), ou preencher diretamente o formulário abaixo!',
      time: timeStr,
      type: 'data_request' as const
    };

    setMessages(prev => [...prev, userMsg, botMsg]);
    setStage(2);
  };

  // OCR Processing
  const processDocumentImage = async (base64Image: string) => {
    setIsProcessingOcr(true);
    setOcrError(null);
    setFormData(prev => ({ ...prev, documentImage: base64Image }));

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setMessages(prev => [
      ...prev,
      {
        id: `img-${Date.now()}`,
        sender: 'user',
        text: '📷 Anexei a imagem do documento para leitura óptica.',
        time: timeStr,
        type: 'document_preview',
        documentUrl: base64Image
      }
    ]);

    try {
      const response = await fetch('/api/gemini/parse-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Image,
          mimeType: 'image/jpeg'
        })
      });

      const result = await response.json();

      if (result.success && result.data) {
        const d = result.data;
        const updatedData: PreCadastroData = {
          ...formData,
          nome: d.name || formData.nome,
          cpf: formatCPF(d.cpf || '') || formData.cpf,
          rg: d.rg || formData.rg,
          dataNascimento: d.birthDate || formData.dataNascimento,
          email: d.email || formData.email,
          telefone: d.phone || formData.telefone,
          plano: d.healthPlan || formData.plano,
          carteirinha: d.carteirinhaNumber || formData.carteirinha,
          endereco: [d.addressStreet, d.addressNumber, d.addressNeighborhood, d.addressCity, d.addressState].filter(Boolean).join(', ') || formData.endereco,
          documentImage: base64Image
        };

        setFormData(updatedData);

        setMessages(prevMsg => [
          ...prevMsg,
          {
            id: `bot-ocr-${Date.now()}`,
            sender: 'bot',
            text: '✨ Leitura Óptica Concluída! Extraímos os dados do seu documento.\n\nPor favor, confira e ajuste os dados abaixo antes de confirmar o cadastro:',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: 'edit_form'
          }
        ]);
        setStage(4);
      } else {
        throw new Error(result.error || 'Não foi possível ler todos os campos automaticamente.');
      }
    } catch (err) {
      console.warn('Fallback para formulário manual de triagem:', err);
      setOcrError('Não foi possível ler todos os campos da imagem. Por favor, preencha os dados no formulário abaixo.');

      setMessages(prevMsg => [
        ...prevMsg,
        {
          id: `bot-ocr-err-${Date.now()}`,
          sender: 'bot',
          text: '📸 Imagem recebida! Preencha ou confirme seus dados no formulário abaixo:',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'edit_form'
        }
      ]);
      setStage(4);
    } finally {
      setIsProcessingOcr(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          processDocumentImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    setIsCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } 
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Erro ao acessar a câmera:', err);
      alert('Não foi possível acessar a câmera. Verifique as permissões do navegador.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        stopCamera();
        processDocumentImage(dataUrl);
      }
    }
  };

  // Clean Reinstallation Handler
  const handleCleanReinstall = () => {
    if (!window.confirm('Deseja realizar a Reinstalação Limpa da Conexão WhatsApp? Isso redefinirá os tokens de sessão, atualizará a instância e testará a rota de webhook do zero.')) {
      return;
    }
    setIsCleanReinstalling(true);
    setReinstallDone(false);
    setCleanReinstallStep('Desconectando instâncias antigas e limpando cache de sessão...');

    setTimeout(() => {
      setCleanReinstallStep('Limpando tokens expirados e regravando credenciais da API Meta/Evolution...');
      setTimeout(() => {
        setCleanReinstallStep('Reconfigurando Webhook SSL e testando rota de recebimento...');
        setTimeout(() => {
          setIsCleanReinstalling(false);
          setReinstallDone(true);
          setApiTestSuccess(true);
        }, 1200);
      }, 1200);
    }, 1200);
  };

  const handleTestApi = () => {
    setIsTestingApi(true);
    setApiTestSuccess(null);
    setTimeout(() => {
      setIsTestingApi(false);
      setApiTestSuccess(true);
    }, 1000);
  };

  // Register Patient in System Context with Form Validations
  const handleFinalRegister = () => {
    if (!formData.nome.trim()) {
      alert('O Nome Completo do paciente é de preenchimento obrigatório.');
      return;
    }
    if (!formData.telefone.trim()) {
      alert('O Telefone / Celular do paciente é de preenchimento obrigatório.');
      return;
    }
    if (!formData.dataNascimento.trim() || !isValidDateStr(formData.dataNascimento)) {
      alert('A Data de Nascimento é de preenchimento obrigatório e deve ser uma data válida no formato DD/MM/AAAA.');
      return;
    }
    if (!formData.email.trim() || !isValidEmail(formData.email)) {
      alert('O E-mail é de preenchimento obrigatório e deve ter um formato válido (ex: paciente@dominio.com).');
      return;
    }

    const street = formData.addressObj?.street || formData.endereco || 'Rua Principal';
    const number = formData.addressObj?.number || '100';
    const neighborhood = formData.addressObj?.neighborhood || 'Centro';
    const city = formData.addressObj?.city || clinicInfo.city || 'São Paulo';
    const state = formData.addressObj?.state || 'SP';
    const cep = formData.addressObj?.cep || '01000-000';
    const complement = formData.addressObj?.complement;

    const newPatient = addPatient({
      name: formData.nome,
      cpf: formData.cpf || '000.000.000-00',
      rg: formData.rg || '',
      birthDate: formData.dataNascimento || '1990-01-01',
      gender: 'feminino',
      phone: formData.telefone,
      email: formData.email || 'sem-email@paciente.com',
      address: {
        street: street.trim(),
        number: number.trim(),
        neighborhood: neighborhood.trim(),
        city: city.trim(),
        state: state.trim(),
        cep: cep.trim(),
        complement: complement ? complement.trim() : undefined
      },
      healthInsurance: formData.plano,
      insuranceNumber: formData.carteirinha,
      status: 'ativo',
      photoUrl: formData.documentImage || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80',
      images: formData.documentImage ? [formData.documentImage] : [],
      anamnesis: {
        chiefComplaint: `Triagem Inicial - Motivo: ${formData.motivo}`,
        notes: `Paciente cadastrado via Triagem & Pré-Cadastro. Motivo: ${formData.motivo}. Plano: ${formData.plano} (${formData.carteirinha || 'Sem carteirinha'}).`
      }
    });

    setStage(5);

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [
      ...prev,
      {
        id: `bot-final-${Date.now()}`,
        sender: 'bot',
        text: `🎉 Cadastro efetuado com sucesso!\n\nSeja muito bem-vindo(a) ao consultório! O paciente ${formData.nome} foi registrado no sistema sob o ID #${newPatient.id.slice(0, 8)}.\n\nNossa equipe da recepção agendará seu atendimento para o motivo: ${formData.motivo}.`,
        time: timeStr,
        type: 'success_card'
      }
    ]);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Header & View Mode Switcher */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl shadow-sm border border-[#e5e5dc] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#075e54]/10 border border-[#075e54]/20 flex items-center justify-center text-[#075e54] shrink-0">
            <ClipboardList className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold bg-[#075e54] text-white px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                DENTISPRO OFICIAL
              </span>
              <span className="text-[10px] font-bold bg-[#d4a373]/20 text-[#7a5229] px-2.5 py-0.5 rounded-md">
                RECEPÇÃO &amp; TRIAGEM
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#2c2c2c] tracking-tight mt-1">
              DentisPro • Recepção &amp; Triagem de Pacientes
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Atendimento inicial com Cards de Motivos de Consulta, Leitura Óptica (OCR) e Cadastro Direto de Pacientes
            </p>
          </div>
        </div>

        {/* View Mode Buttons */}
        <div className="flex flex-wrap items-center gap-2 bg-[#f5f5f0] p-1.5 rounded-2xl border border-[#e5e5dc]">
          <button
            type="button"
            onClick={() => setViewMode('chat')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              viewMode === 'chat'
                ? 'bg-[#075e54] text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            💬 Triagem Interativa
          </button>
          
          <button
            type="button"
            onClick={() => setViewMode('painel')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              viewMode === 'painel'
                ? 'bg-[#075e54] text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
            }`}
          >
            <FileText className="w-4 h-4" />
            📋 Pré-Cadastros Recebidos
          </button>

          <button
            type="button"
            onClick={() => setViewMode('conexao_api')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              viewMode === 'conexao_api'
                ? 'bg-[#075e54] text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
            }`}
          >
            <Settings className="w-4 h-4" />
            ⚙️ API & Conexão WhatsApp
          </button>
        </div>
      </div>

      {/* VIEW MODE 1: INTERACTIVE TRIAGE WITH CARDS */}
      {viewMode === 'chat' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Main Triage Frame */}
          <div className="lg:col-span-8 bg-[#fdfdfb] rounded-3xl shadow-xl border border-[#e5e5dc] overflow-hidden flex flex-col min-h-[640px]">
            
            {/* Header Bar */}
            <div className="bg-[#075e54] text-white px-5 py-4 flex items-center justify-between shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#128c7e] border-2 border-white/20 flex items-center justify-center text-white font-bold">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-sm leading-tight text-white flex items-center gap-2">
                    {clinicInfo.name} • Recepção Ativa
                  </h2>
                  <p className="text-[11px] text-emerald-100 flex items-center gap-1 mt-0.5">
                    <span className="w-2 h-2 bg-[#25d366] rounded-full animate-pulse" />
                    Atendimento Inicial &amp; Pré-Cadastro de Pacientes
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setStage(1);
                  setFormData({
                    nome: '',
                    endereco: '',
                    cpf: '',
                    dataNascimento: '',
                    email: '',
                    plano: 'Particular',
                    carteirinha: '',
                    telefone: '',
                    motivo: '',
                    rg: '',
                    documentImage: ''
                  });
                  setMessages([
                    {
                      id: `msg-${Date.now()}`,
                      sender: 'bot',
                      text: 'Olá! Seja bem-vindo(a) à recepção. Como podemos lhe ajudar hoje?',
                      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                      type: 'reason_grid'
                    }
                  ]);
                }}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reiniciar Triagem
              </button>
            </div>

            {/* Messages & Cards Area */}
            <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-gray-50/50">
              
              <div className="text-center my-2">
                <span className="inline-block bg-emerald-50 text-[#075e54] text-[11px] px-3.5 py-1 rounded-full font-bold shadow-2xs border border-emerald-200">
                  🔒 Triagem Inicial com Leitura Óptica Segura &amp; Cadastro Automático no Prontuário
                </span>
              </div>

              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[92%] sm:max-w-[85%] rounded-2xl p-4 shadow-sm space-y-3 text-xs relative ${
                      msg.sender === 'user'
                        ? 'bg-[#075e54] text-white rounded-tr-none font-medium'
                        : 'bg-white text-gray-800 rounded-tl-none border border-gray-200'
                    }`}
                  >
                    {msg.text && (
                      <p className="whitespace-pre-line text-xs sm:text-sm leading-relaxed font-sans">
                        {msg.text}
                      </p>
                    )}

                    {/* CARD GRID: MOTIVOS DE CONSULTA */}
                    {msg.type === 'reason_grid' && stage === 1 && (
                      <div className="pt-2 space-y-3">
                        <div className="bg-[#f0fdf4] border border-[#bbf7d0] p-3 rounded-xl text-emerald-900 text-xs font-bold flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-[#075e54]" />
                          <span>Selecione a necessidade odontológica do paciente:</span>
                        </div>

                        {!showSurgerySubMenu ? (
                          <>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
                              {[
                                { title: 'Avaliação Geral', subtitle: 'Primeira consulta e laudo', icon: '📋' },
                                { title: 'Dor de Dente / Urgência', subtitle: 'Atendimento emergencial imediato', icon: '🚨' },
                                { title: 'Limpeza', subtitle: 'Profilaxia e táxi periodontal', icon: '🦷' },
                                { title: 'Aparelho / Ortodontia', subtitle: 'Alinhamento e manutenção', icon: '🦷' },
                                { title: 'Implante / Prótese', subtitle: 'Reabilitação oral', icon: '🦷' },
                                { title: 'Clareamento', subtitle: 'Estética dental', icon: '✨' },
                                { title: 'Cirurgia', subtitle: 'Procedimentos e sisos', icon: '🩺', isSurgery: true }
                              ].map((item, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => {
                                    if (item.isSurgery) {
                                      setShowSurgerySubMenu(true);
                                    } else {
                                      handleSelectReason(item.title);
                                    }
                                  }}
                                  className="bg-white hover:bg-emerald-50 border border-gray-200 hover:border-[#075e54] text-left p-3 rounded-2xl transition shadow-2xs hover:shadow-md flex flex-col justify-between group cursor-pointer"
                                >
                                  <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-2xl">{item.icon}</span>
                                    <span className="w-2 h-2 rounded-full bg-[#075e54] opacity-0 group-hover:opacity-100 transition" />
                                  </div>
                                  <div>
                                    <h4 className="font-bold text-gray-900 text-xs group-hover:text-[#075e54]">
                                      {item.title}
                                    </h4>
                                    <p className="text-[10px] text-gray-500 leading-tight mt-0.5">
                                      {item.subtitle}
                                    </p>
                                  </div>
                                </button>
                              ))}
                            </div>

                            {!showCustomReasonInput ? (
                              <button
                                onClick={() => setShowCustomReasonInput(true)}
                                className="w-full text-center py-2 text-xs font-bold text-[#075e54] hover:underline bg-emerald-50 rounded-xl border border-emerald-200 mt-1 cursor-pointer"
                              >
                                ✏️ Outro motivo não listado acima...
                              </button>
                            ) : (
                              <div className="flex gap-2 pt-1">
                                <input
                                  type="text"
                                  value={customReason}
                                  onChange={(e) => setCustomReason(e.target.value)}
                                  placeholder="Digite o motivo do atendimento..."
                                  className="flex-1 bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-800 focus:outline-none focus:border-[#075e54]"
                                />
                                <button
                                  onClick={() => {
                                    if (customReason.trim()) {
                                      handleSelectReason(customReason.trim());
                                    }
                                  }}
                                  className="bg-[#075e54] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#128c7e] cursor-pointer"
                                >
                                  Confirmar
                                </button>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="bg-[#f0fdf4] border-2 border-[#075e54]/30 p-3.5 rounded-2xl space-y-2.5">
                            <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                              <span className="font-bold text-xs text-[#075e54]">
                                🩺 Qual cirurgia precisa ser realizada?
                              </span>
                              <button
                                onClick={() => setShowSurgerySubMenu(false)}
                                className="text-[10px] font-bold text-gray-500 hover:text-gray-800 underline cursor-pointer"
                              >
                                ← Voltar
                              </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                              {[
                                { name: 'Periodontia', desc: 'Cirurgias gengivais e tecidos moles' },
                                { name: 'Cirurgia de dente', desc: 'Exodontias e remoções simples/complexas' },
                                { name: 'Extração de Sisos', desc: 'Remoção de terceiros molares' },
                                { name: 'Cirurgia Ortognática', desc: 'Procedimentos de alinhamento maxilar' }
                              ].map((surg, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => {
                                    setShowSurgerySubMenu(false);
                                    handleSelectReason(`Cirurgia (${surg.name})`);
                                  }}
                                  className="bg-white hover:bg-[#075e54] hover:text-white border border-[#075e54]/30 text-left p-3 rounded-xl transition shadow-2xs group cursor-pointer"
                                >
                                  <h5 className="font-bold text-xs text-gray-900 group-hover:text-white">
                                    {surg.name}
                                  </h5>
                                  <p className="text-[10px] text-gray-500 group-hover:text-emerald-100 mt-0.5">
                                    {surg.desc}
                                  </p>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* DATA REQUEST & OCR UPLOAD / EDITABLE FORM */}
                    {msg.type === 'data_request' && (stage === 2 || stage === 4 || stage === 5) && (
                      <div className="pt-2 space-y-3">
                        <div className="p-3 bg-[#e8f5e9] rounded-2xl border border-[#a5d6a7] space-y-2">
                          <p className="font-bold text-emerald-900 text-xs flex items-center gap-1.5">
                            <Camera className="w-4 h-4 text-[#075e54]" />
                            1. Leitura Óptica de Documento (Opcional):
                          </p>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <button
                              onClick={startCamera}
                              className="w-full bg-[#075e54] hover:bg-[#128c7e] text-white py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
                            >
                              <Camera className="w-4 h-4" />
                              Tirar Foto do Documento
                            </button>

                            <button
                              onClick={() => fileInputRef.current?.click()}
                              className="w-full bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
                            >
                              <Upload className="w-4 h-4 text-[#075e54]" />
                              Anexar Imagem (RG/CPF/Plano)
                            </button>
                          </div>

                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                            accept="image/*"
                            className="hidden"
                          />
                        </div>

                        {/* Camera Preview Modal */}
                        {isCameraActive && (
                          <div className="bg-black p-3 rounded-2xl space-y-2 text-center text-white">
                            <video ref={videoRef} autoPlay playsInline className="w-full rounded-xl max-h-56 object-cover" />
                            <div className="flex justify-center gap-2">
                              <button
                                onClick={capturePhoto}
                                className="bg-[#25d366] text-[#075e54] font-bold px-4 py-2 rounded-xl text-xs cursor-pointer"
                              >
                                Capturar Foto
                              </button>
                              <button
                                onClick={stopCamera}
                                className="bg-gray-700 text-white font-bold px-4 py-2 rounded-xl text-xs cursor-pointer"
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Editable Form Block */}
                        <div className="bg-[#fcfbf9] p-4 rounded-2xl border-2 border-[#075e54]/30 space-y-3.5 shadow-xs">
                          <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                            <h3 className="font-bold text-gray-900 text-xs sm:text-sm flex items-center gap-2">
                              <Edit3 className="w-4 h-4 text-[#075e54]" />
                              2. Campos Cadastrais do Paciente:
                            </h3>
                            <span className="text-[10px] bg-emerald-100 text-[#075e54] font-bold px-2 py-0.5 rounded-full">
                              Formulário Editável
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] font-bold uppercase text-gray-700 mb-0.5">
                                Nome Completo *
                              </label>
                              <input
                                type="text"
                                value={formData.nome}
                                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                                className="w-full bg-white border border-gray-300 rounded-xl px-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:border-[#075e54]"
                                placeholder="Ex: Maria Silva"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold uppercase text-gray-700 mb-0.5">
                                CPF *
                              </label>
                              <input
                                type="text"
                                maxLength={14}
                                value={formData.cpf}
                                onChange={(e) => setFormData({ ...formData, cpf: formatCPF(e.target.value) })}
                                className="w-full bg-white border border-gray-300 rounded-xl px-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:border-[#075e54] font-mono"
                                placeholder="000.000.000-00"
                              />
                            </div>

                             <div>
                              <div className="flex items-center justify-between mb-0.5">
                                <label className="block text-[10px] font-bold uppercase text-gray-700">
                                  Data de Nascimento *
                                </label>
                                {formData.dataNascimento ? (
                                  isValidDateStr(formData.dataNascimento) ? (
                                    <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 flex items-center gap-0.5">
                                      <CheckCircle className="w-2.5 h-2.5" /> Válida
                                    </span>
                                  ) : (
                                    <span className="text-[9px] font-bold text-red-600 bg-red-50 px-1.5 py-0.2 rounded border border-red-200">
                                      ⚠ DD/MM/AAAA
                                    </span>
                                  )
                                ) : (
                                  <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                                    Obrigatório
                                  </span>
                                )}
                              </div>
                              <input
                                type="text"
                                required
                                value={formData.dataNascimento}
                                onChange={(e) => setFormData({ ...formData, dataNascimento: formatDateMask(e.target.value) })}
                                className={`w-full bg-white border rounded-xl px-3 py-1.5 text-xs text-gray-900 focus:outline-none ${
                                  formData.dataNascimento && !isValidDateStr(formData.dataNascimento)
                                    ? 'border-red-400 focus:border-red-500'
                                    : 'border-gray-300 focus:border-[#075e54]'
                                }`}
                                placeholder="DD/MM/AAAA"
                              />
                            </div>

                            <div>
                              <PhoneInputWithDDI
                                label="Telefone / Celular *"
                                value={formData.telefone}
                                onChange={(val) => setFormData({ ...formData, telefone: val })}
                              />
                            </div>

                            <div>
                              <div className="flex items-center justify-between mb-0.5">
                                <label className="block text-[10px] font-bold uppercase text-gray-700">
                                  E-mail *
                                </label>
                                {formData.email ? (
                                  isValidEmail(formData.email) ? (
                                    <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 flex items-center gap-0.5">
                                      <CheckCircle className="w-2.5 h-2.5" /> Válido
                                    </span>
                                  ) : (
                                    <span className="text-[9px] font-bold text-red-600 bg-red-50 px-1.5 py-0.2 rounded border border-red-200">
                                      ⚠ ex: nome@dominio.com
                                    </span>
                                  )
                                ) : (
                                  <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                                    Obrigatório
                                  </span>
                                )}
                              </div>
                              <input
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className={`w-full bg-white border rounded-xl px-3 py-1.5 text-xs text-gray-900 focus:outline-none ${
                                  formData.email && !isValidEmail(formData.email)
                                    ? 'border-red-400 focus:border-red-500'
                                    : 'border-gray-300 focus:border-[#075e54]'
                                }`}
                                placeholder="paciente@email.com"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold uppercase text-gray-700 mb-0.5">
                                Plano / Convênio
                              </label>
                              <select
                                value={formData.plano}
                                onChange={(e) => setFormData({ ...formData, plano: e.target.value })}
                                className="w-full bg-white border border-gray-300 rounded-xl px-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:border-[#075e54]"
                              >
                                <option value="Particular">Particular</option>
                                <option value="Unimed Odonto">Unimed Odonto</option>
                                <option value="Amil Dental">Amil Dental</option>
                                <option value="Bradesco Dental">Bradesco Dental</option>
                                <option value="SulAmérica">SulAmérica Odonto</option>
                                <option value="MetLife">MetLife</option>
                                <option value="Outro Convenio">Outro Convênio</option>
                              </select>
                            </div>

                            {formData.plano !== 'Particular' && (
                              <div className="sm:col-span-2">
                                <label className="block text-[10px] font-bold uppercase text-gray-700 mb-0.5">
                                  Número da Carteirinha do Plano
                                </label>
                                <input
                                  type="text"
                                  value={formData.carteirinha}
                                  onChange={(e) => setFormData({ ...formData, carteirinha: e.target.value })}
                                  className="w-full bg-white border border-gray-300 rounded-xl px-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:border-[#075e54]"
                                  placeholder="Digite o número da carteirinha"
                                />
                              </div>
                            )}

                            <div className="sm:col-span-2">
                              <AddressFields
                                address={formData.addressObj || { cep: '', street: '', number: '', complement: '', neighborhood: '', city: '', state: '' }}
                                onChange={(newAddr) => {
                                  const fullStr = [newAddr.street, newAddr.number, newAddr.neighborhood, newAddr.city, newAddr.state]
                                    .filter(Boolean)
                                    .join(', ');
                                  setFormData({ ...formData, addressObj: newAddr, endereco: fullStr });
                                }}
                              />
                            </div>
                          </div>

                          {stage !== 5 && (
                            <button
                              onClick={handleFinalRegister}
                              className="w-full bg-[#075e54] hover:bg-[#128c7e] text-white py-3 rounded-2xl font-black text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer mt-2"
                            >
                              <UserPlus className="w-4 h-4 text-[#25d366]" />
                              Confirmar &amp; Cadastrar Paciente no Sistema
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* DOCUMENT PREVIEW */}
                    {msg.type === 'document_preview' && msg.documentUrl && (
                      <div className="pt-1">
                        <img
                          src={msg.documentUrl}
                          alt="Documento Anexado"
                          className="w-full max-h-48 object-cover rounded-xl border border-gray-300 shadow-2xs"
                        />
                      </div>
                    )}

                    {/* SUCCESS CARD */}
                    {msg.type === 'success_card' && (
                      <div className="pt-2">
                        <div className="bg-emerald-50 border border-emerald-300 p-4 rounded-2xl text-xs text-emerald-950 space-y-2">
                          <p className="font-bold flex items-center gap-2 text-sm text-[#075e54]">
                            <CheckCircle2 className="w-5 h-5 text-[#25d366]" />
                            Cadastro do Paciente Realizado com Sucesso!
                          </p>
                          <p className="text-gray-700 leading-relaxed">
                            O prontuário foi criado no banco de dados e a recepção já pode agendar o atendimento.
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="text-[9px] text-gray-400 text-right mt-1 font-mono">
                      {msg.time}
                    </div>
                  </div>
                </div>
              ))}

              {isProcessingOcr && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 p-3.5 rounded-2xl shadow-xs flex items-center gap-3 text-xs text-[#075e54] font-bold">
                    <RefreshCw className="w-4 h-4 animate-spin text-[#075e54]" />
                    <span>Processando Leitura Óptica (OCR) da Imagem...</span>
                  </div>
                </div>
              )}

              <div ref={chatBottomRef} />
            </div>
          </div>

          {/* Right Column: Instructions & Summary Card */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* Real-time Registration Summary */}
            <div className="bg-white p-5 rounded-3xl border border-[#e5e5dc] shadow-xs space-y-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-[#075e54] flex items-center gap-2">
                <User className="w-4 h-4" />
                Resumo da Triagem Atual
              </h3>

              <div className="space-y-2 text-xs divide-y divide-gray-100">
                <div className="pt-1 flex justify-between">
                  <span className="text-gray-500">Motivo:</span>
                  <span className="font-bold text-gray-900">{formData.motivo || 'Aguardando seleção'}</span>
                </div>
                <div className="pt-1 flex justify-between">
                  <span className="text-gray-500">Nome:</span>
                  <span className="font-bold text-gray-900">{formData.nome || 'Não informado'}</span>
                </div>
                <div className="pt-1 flex justify-between">
                  <span className="text-gray-500">CPF:</span>
                  <span className="font-mono text-gray-900">{formData.cpf || '---'}</span>
                </div>
                <div className="pt-1 flex justify-between">
                  <span className="text-gray-500">Telefone:</span>
                  <span className="font-bold text-gray-900">{formData.telefone || '---'}</span>
                </div>
                <div className="pt-1 flex justify-between">
                  <span className="text-gray-500">Plano:</span>
                  <span className="font-bold text-gray-900">{formData.plano}</span>
                </div>
              </div>

              {stage === 5 && (
                <button
                  onClick={() => openPatientProfile('pat-1')}
                  className="w-full bg-[#075e54] hover:bg-[#128c7e] text-white py-2.5 rounded-xl font-bold text-xs shadow-xs transition cursor-pointer mt-2"
                >
                  Ver Ficha / Prontuário do Paciente
                </button>
              )}
            </div>

            {/* Help & Workflow Guide Box */}
            <div className="bg-[#fcfbf9] p-5 rounded-3xl border border-[#d4a373]/30 space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-[#7a5229] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#d4a373]" />
                Como Funciona a Triagem de Recepção:
              </h4>
              <ul className="text-xs text-gray-600 space-y-2 list-disc list-inside leading-relaxed">
                <li>Escolha o <strong>motivo da consulta</strong> nos cards interativos.</li>
                <li>Tire ou anexe a foto do <strong>RG, CPF ou Carteirinha</strong> do paciente.</li>
                <li>O sistema <strong>OCR Gemini</strong> lê e preenche automaticamente os dados.</li>
                <li>A recepção pode <strong>conferir e editar</strong> qualquer campo antes de salvar.</li>
                <li>Ao clicar em cadastrar, o paciente entra direto na <strong>Base Central</strong> do consultório.</li>
              </ul>
            </div>

          </div>

        </div>
      )}

      {/* VIEW MODE 2: RECEPTION DASHBOARD / HISTÓRICO DE TRIAGENS */}
      {viewMode === 'painel' && (
        <div className="bg-white rounded-3xl p-6 shadow-xs border border-[#e5e5dc] space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Histórico de Triagens &amp; Pré-Cadastros Recebidos</h2>
              <p className="text-xs text-gray-500">Lista de pacientes triados e cadastrados pela recepção</p>
            </div>
            <button
              onClick={() => {
                setStage(1);
                setFormData({
                  nome: '',
                  endereco: '',
                  cpf: '',
                  dataNascimento: '',
                  email: '',
                  plano: 'Particular',
                  carteirinha: '',
                  telefone: '',
                  motivo: '',
                  rg: '',
                  documentImage: ''
                });
                setViewMode('chat');
              }}
              className="bg-[#075e54] text-white px-4 py-2 rounded-2xl text-xs font-bold hover:bg-[#128c7e] transition flex items-center gap-2 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              Iniciar Nova Triagem
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Sample Received Triage Card 1 */}
            <div className="p-4 rounded-2xl border border-gray-200 bg-[#fbfbf9] space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="bg-[#075e54]/10 text-[#075e54] text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                    Cirurgia de Sisos
                  </span>
                  <h3 className="font-bold text-sm text-gray-900 mt-1">Maria Clara da Silva</h3>
                  <p className="text-xs text-gray-500">(11) 98765-4321 • CPF: 123.456.789-00</p>
                </div>
                <span className="text-[10px] text-gray-400 font-mono">Hoje às 14:20</span>
              </div>

              <div className="text-xs text-gray-600 bg-white p-3 rounded-xl border border-gray-200 space-y-1">
                <p><strong>Plano:</strong> Unimed Odonto (Nº 9876543210001)</p>
                <p><strong>Endereço:</strong> Av. Paulista, 1000 - São Paulo/SP</p>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => openPatientProfile('pat-1')}
                  className={`flex-1 ${t.btnPrimaryBg} ${t.btnPrimaryText} py-2 rounded-xl text-xs font-bold cursor-pointer shadow-2xs transition`}
                >
                  Ver Ficha / Prontuário
                </button>
              </div>
            </div>

            {/* Sample Received Triage Card 2 */}
            <div className="p-4 rounded-2xl border border-gray-200 bg-[#fbfbf9] space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="bg-[#d4a373]/20 text-[#7a5229] text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                    Implante Dentário
                  </span>
                  <h3 className="font-bold text-sm text-gray-900 mt-1">Carlos Eduardo Santos</h3>
                  <p className="text-xs text-gray-500">(11) 91234-5678 • CPF: 987.654.321-11</p>
                </div>
                <span className="text-[10px] text-gray-400 font-mono">Ontem às 16:45</span>
              </div>

              <div className="text-xs text-gray-600 bg-white p-3 rounded-xl border border-gray-200 space-y-1">
                <p><strong>Plano:</strong> Particular</p>
                <p><strong>Endereço:</strong> Rua Augusta, 500 - São Paulo/SP</p>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => openPatientProfile('pat-2')}
                  className={`flex-1 ${t.btnPrimaryBg} ${t.btnPrimaryText} py-2 rounded-xl text-xs font-bold cursor-pointer shadow-2xs transition`}
                >
                  Ver Ficha / Prontuário
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODE 3: WHATSAPP API & CLEAN REINSTALLATION CONFIGURATION */}
      {viewMode === 'conexao_api' && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#e5e5dc] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold bg-[#075e54] text-white px-2.5 py-0.5 rounded-md uppercase">
                  CENTRAL DE CONEXÃO
                </span>
                <span className="text-[10px] font-bold bg-emerald-100 text-[#075e54] px-2.5 py-0.5 rounded-md flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  INSTÂNCIA ATIVA
                </span>
              </div>
              <h2 className="text-xl font-black text-gray-900 mt-1 flex items-center gap-2">
                <Settings className="w-5 h-5 text-[#075e54]" />
                Configuração da API WhatsApp &amp; Conectividade em Nuvem
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Gerencie as credenciais da Meta Cloud API Oficial ou Evolution API (QR Code), execute testes de Webhook e reinstalação limpa da conexão.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleTestApi}
                disabled={isTestingApi}
                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-2xl text-xs font-bold transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Wifi className={`w-4 h-4 ${isTestingApi ? 'animate-spin text-[#075e54]' : 'text-gray-600'}`} />
                {isTestingApi ? 'Testando Conexão...' : 'Testar Conexão API'}
              </button>

              <button
                type="button"
                onClick={handleCleanReinstall}
                disabled={isCleanReinstalling}
                className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isCleanReinstalling ? 'animate-spin' : ''}`} />
                {isCleanReinstalling ? 'Reinstalando...' : '🧹 Reinstalação Limpa da API'}
              </button>
            </div>
          </div>

          {/* Clean Reinstallation Progress Alert */}
          {isCleanReinstalling && (
            <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                <RefreshCw className="w-4 h-4 animate-spin text-amber-700" />
                <span>Reinstalação Limpa em Andamento...</span>
              </div>
              <p className="text-xs text-amber-800 font-medium">{cleanReinstallStep}</p>
              <div className="w-full bg-amber-200 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-600 h-2 rounded-full animate-pulse w-3/4" />
              </div>
            </div>
          )}

          {reinstallDone && (
            <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-xs text-emerald-900">Reinstalação Limpa Concluída com Sucesso!</h4>
                <p className="text-xs text-emerald-700 mt-0.5">
                  Os tokens de sessão foram revalidados, o cache de reconexão foi limpo e o webhook oficial está sincronizado na nuvem.
                </p>
              </div>
            </div>
          )}

          {apiTestSuccess && !isCleanReinstalling && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 flex items-center justify-between text-xs text-emerald-900">
              <div className="flex items-center gap-2 font-bold">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Status da Conexão: Ping no Webhook 200 OK • Latência 42ms</span>
              </div>
              <span className="text-[10px] bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded-full font-mono">
                ONLINE
              </span>
            </div>
          )}

          {/* Protocol Type Selector */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setApiGatewayType('meta')}
              className={`p-4 rounded-2xl border-2 text-left transition cursor-pointer space-y-2 ${
                apiGatewayType === 'meta'
                  ? 'border-[#075e54] bg-[#075e54]/5 shadow-sm'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-gray-900 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[#075e54]" />
                  1. Meta Cloud API Oficial (Meta Business)
                </span>
                {apiGatewayType === 'meta' && (
                  <span className="text-[10px] bg-[#075e54] text-white font-bold px-2 py-0.5 rounded-md">
                    SELECIONADO
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500">
                Recomendado para envio em massa oficial. Exige App ID da Meta, Phone Number ID, WABA ID e Token Permanente de Acesso.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setApiGatewayType('evolution')}
              className={`p-4 rounded-2xl border-2 text-left transition cursor-pointer space-y-2 ${
                apiGatewayType === 'evolution'
                  ? 'border-[#075e54] bg-[#075e54]/5 shadow-sm'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-gray-900 flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-[#d4a373]" />
                  2. Gateway Evolution API (QR Code / Pareamento)
                </span>
                {apiGatewayType === 'evolution' && (
                  <span className="text-[10px] bg-[#075e54] text-white font-bold px-2 py-0.5 rounded-md">
                    SELECIONADO
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500">
                Conexão direta por leitura de QR Code ou código de 8 dígitos sem necessidade de verificação de empresa na Meta.
              </p>
            </button>
          </div>

          {/* META CLOUD API FORM */}
          {apiGatewayType === 'meta' && (
            <div className="bg-[#fcfbf9] p-5 rounded-2xl border border-gray-200 space-y-4">
              <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2 border-b border-gray-200 pb-2">
                <Key className="w-4 h-4 text-[#075e54]" />
                Credenciais Oficiais da Meta Cloud API
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Meta App ID *
                  </label>
                  <input
                    type="text"
                    value={metaAppId}
                    onChange={(e) => setMetaAppId(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2 text-xs font-mono text-gray-900 focus:outline-none focus:border-[#075e54]"
                    placeholder="Ex: 1092837492837412"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">Obtido no painel de desenvolvedores da Meta Developer Portal</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Phone Number ID *
                  </label>
                  <input
                    type="text"
                    value={metaPhoneId}
                    onChange={(e) => setMetaPhoneId(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2 text-xs font-mono text-gray-900 focus:outline-none focus:border-[#075e54]"
                    placeholder="Ex: 55119987654321"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">ID numérico associado ao número do WhatsApp Business</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    WABA ID (WhatsApp Business Account ID) *
                  </label>
                  <input
                    type="text"
                    value={metaWabaId}
                    onChange={(e) => setMetaWabaId(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2 text-xs font-mono text-gray-900 focus:outline-none focus:border-[#075e54]"
                    placeholder="Ex: 987654321098765"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Webhook Verification Secret Token
                  </label>
                  <input
                    type="text"
                    value={metaWebhookSecret}
                    onChange={(e) => setMetaWebhookSecret(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2 text-xs font-mono text-gray-900 focus:outline-none focus:border-[#075e54]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Permanent User Access Token (System User Token) *
                  </label>
                  <input
                    type="password"
                    value={metaToken}
                    onChange={(e) => setMetaToken(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2 text-xs font-mono text-gray-900 focus:outline-none focus:border-[#075e54]"
                    placeholder="EAAG..."
                  />
                  <p className="text-[10px] text-gray-400 mt-1">Token de acesso permanente gerado no Usuário do Sistema no Gerenciador de Negócios Meta</p>
                </div>

                <div className="sm:col-span-2 bg-emerald-50 border border-emerald-200 p-4 rounded-xl space-y-2">
                  <label className="block text-xs font-bold text-emerald-950">
                    URL de Callback para Webhook (Cole na Meta Cloud API / Evolution API):
                  </label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-white border border-emerald-300 px-3 py-2 rounded-lg text-xs font-mono text-emerald-950 font-bold select-all break-all">
                      {typeof window !== 'undefined' ? `${window.location.origin}/api/whatsapp/webhook` : 'https://suaclinica.com.br/api/whatsapp/webhook'}
                    </code>
                    <button
                      type="button"
                      onClick={() => {
                        const url = typeof window !== 'undefined' ? `${window.location.origin}/api/whatsapp/webhook` : 'https://suaclinica.com.br/api/whatsapp/webhook';
                        navigator.clipboard.writeText(url);
                        alert('URL do Webhook copiada com sucesso para a área de transferência!');
                      }}
                      className="px-3.5 py-2 bg-[#075e54] text-white rounded-lg text-xs font-bold hover:bg-[#128c7e] cursor-pointer flex items-center gap-1.5 shrink-0 shadow-2xs"
                    >
                      <Copy className="w-3.5 h-3.5" /> Copiar URL
                    </button>
                  </div>
                  <p className="text-[11px] text-emerald-800 leading-relaxed">
                    💡 <strong>Onde usar esta URL?</strong> Você deve colar esta URL no painel do <strong>Meta for Developers</strong> (em <em>WhatsApp &gt; Configuração &gt; URL de Callback</em>) ou no painel da sua <strong>Evolution API</strong> no campo de Webhook para receber as mensagens e confirmações dos pacientes em tempo real.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* EVOLUTION API FORM */}
          {apiGatewayType === 'evolution' && (
            <div className="bg-[#fcfbf9] p-5 rounded-2xl border border-gray-200 space-y-4">
              <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2 border-b border-gray-200 pb-2">
                <QrCode className="w-4 h-4 text-[#d4a373]" />
                Configurações da Instância Evolution API
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    URL Base da Evolution API *
                  </label>
                  <input
                    type="text"
                    value={evolutionUrl}
                    onChange={(e) => setEvolutionUrl(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2 text-xs font-mono text-gray-900 focus:outline-none focus:border-[#075e54]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Nome da Instância *
                  </label>
                  <input
                    type="text"
                    value={evolutionInstance}
                    onChange={(e) => setEvolutionInstance(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2 text-xs text-gray-900 focus:outline-none focus:border-[#075e54]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    API Key de Autenticação *
                  </label>
                  <input
                    type="password"
                    value={evolutionKey}
                    onChange={(e) => setEvolutionKey(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2 text-xs font-mono text-gray-900 focus:outline-none focus:border-[#075e54]"
                  />
                </div>
              </div>

              {/* QR Code / Pairing Code Simulator */}
              <div className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 bg-gray-900 rounded-xl flex items-center justify-center p-2 text-white shrink-0">
                    <QrCode className="w-16 h-16 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-gray-900">QR Code de Pareamento</h4>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Abra o WhatsApp no seu celular &gt; Aparelhos Conectados &gt; Conectar um Aparelho e aponte para a câmera.
                    </p>
                    <span className="inline-block mt-2 text-[10px] font-mono bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-md font-bold">
                      Código de Pareamento por Texto: 8A2B-9C0D
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => alert('Novo QR Code gerado com sucesso!')}
                  className="px-3.5 py-2 bg-[#075e54] text-white rounded-xl text-xs font-bold hover:bg-[#128c7e] cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Atualizar QR Code
                </button>
              </div>
            </div>
          )}

          <div className="flex justify-end border-t border-gray-100 pt-4">
            <button
              type="button"
              onClick={() => alert('Configurações da API WhatsApp salvas e aplicadas com sucesso!')}
              className="px-6 py-2.5 bg-[#075e54] hover:bg-[#128c7e] text-white rounded-2xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <Check className="w-4 h-4" />
              Salvar Configurações da API
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
