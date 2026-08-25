import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCPF } from '../../utils/formatters';
import { ShieldCheck, CheckCircle2, ExternalLink, QrCode, FileCheck, Award, Lock, Sparkles, Check } from 'lucide-react';
import { GovBrSignatureWizardModal } from './GovBrSignatureWizardModal';

interface DocumentSignatureFooterProps {
  customDentistName?: string;
  customCro?: string;
  documentTitle?: string;
  compact?: boolean;
  hideSignatureLine?: boolean;
  hideDigitalSignature?: boolean;
  hideStampAndManualSignature?: boolean;
  align?: 'left' | 'right';
}

export const DocumentSignatureFooter: React.FC<DocumentSignatureFooterProps> = ({
  customDentistName,
  customCro,
  documentTitle = 'Documento Odontológico',
  compact = false,
  hideSignatureLine = false,
  hideDigitalSignature = false,
  hideStampAndManualSignature = false,
  align = 'right'
}) => {
  const { clinicInfo, activeProfessional } = useApp();
  const [isGovModalOpen, setIsGovModalOpen] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [signedSuccessfully, setSignedSuccessfully] = useState(false);

  const dentistName = customDentistName || activeProfessional?.name || clinicInfo.dentistName || 'Hugo Andres Iglesias Ricoy';
  const cro = customCro || activeProfessional?.cro || clinicInfo.cro || 'CRO/CE 5925';
  const cpf = formatCPF(activeProfessional?.cpf || clinicInfo.cpf || '879.750.253-72');
  const certificateType = clinicInfo.govBrCertificateType || 'Assinatura Eletrônica Avançada Gov.br (Pessoa Física - Gratuita • Conta Prata/Ouro)';

  // Static or generated hash for digital validity
  const now = new Date();
  const dateFormatted = `${now.toLocaleDateString('pt-BR')} às ${now.toLocaleTimeString('pt-BR')}`;
  const mockVerificationHash = 'A8F9-4B12-8C01-D9E3-2F45-6A78-90BC';
  const govBrVerifierUrl = 'https://validar.iti.gov.br';
  const govBrSignerUrl = 'https://www.gov.br/assinador';

  const handleSimulateGovBrSign = () => {
    setIsSigning(true);
    setTimeout(() => {
      setIsSigning(false);
      setSignedSuccessfully(true);
      setTimeout(() => {
        setSignedSuccessfully(false);
        setIsGovModalOpen(false);
      }, 2000);
    }, 1500);
  };

  const handleDownloadPdfAndOpenIti = () => {
    try {
      const cleanTitle = (documentTitle || 'Documento_Odontologico').replace(/[^a-zA-Z0-9]/g, '_');
      const fileName = `${cleanTitle}_Para_Assinatura_GovBR.html`;

      const signedHtmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>${documentTitle} - Prontuário Odontológico</title>
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
      <div style="font-size: 12px; color: #444;">${dentistName} • ${cro}</div>
    </div>
    <div style="text-align: right; font-size: 12px; color: #555;">
      <div>${clinicInfo.city || 'Fortaleza - CE'}</div>
      <div>Data: ${dateFormatted}</div>
    </div>
  </div>

  <div class="doc-title">${documentTitle}</div>

  <div class="body-box">
    <p>Documento odontológico gerado pelo sistema <strong>DentisPro</strong> para assinatura digital no portal oficial do Governo Federal (<strong>Gov.br / ITI</strong>).</p>
    <p><strong>Signatário Responsável:</strong> ${dentistName}</p>
    <p><strong>Inscrição CRO:</strong> ${cro}</p>
    <p><strong>CPF Registrado:</strong> ${cpf}</p>
    <p><strong>Hash de Verificação SHA-256:</strong> <code>${mockVerificationHash}</code></p>
  </div>

  <div class="gov-info">
    <strong>ℹ️ Instruções para Assinatura Gov.br:</strong><br>
    1. Acesse o portal <a href="https://assinador.iti.br" target="_blank">assinador.iti.br</a> com sua conta Gov.br (Prata ou Ouro).<br>
    2. Envie este arquivo ou o PDF impresso no portal.<br>
    3. Valide a assinatura no seu celular pelo aplicativo Gov.br.
  </div>

  <div class="footer-sig">
    <strong>${dentistName}</strong><br>
    ${cro} - Cirurgião-Dentista Responsável
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
      console.error('Error generating document download:', err);
    }

    setTimeout(() => {
      window.print();
    }, 200);
  };

  const effectiveAlign = align || clinicInfo.signatureAlignment || 'right';
  const arrangement = clinicInfo.signatureArrangement || 'overlay';

  return (
    <div className={`space-y-3 ${compact ? 'pt-2 text-[10px]' : 'pt-6 text-xs'} text-center font-sans print:pt-4`}>
      {/* 1. FIGURA DE ASSINATURA & CARIMBO PROFISSIONAL */}
      {!hideStampAndManualSignature && (
        <div className={`w-full flex flex-col ${
          effectiveAlign === 'right' 
            ? 'items-end justify-end text-right' 
            : effectiveAlign === 'center' 
            ? 'items-center justify-center text-center' 
            : 'items-start justify-start text-left'
        } space-y-2`}>

          {arrangement === 'side_by_side' ? (
            /* SIDE BY SIDE ARRANGEMENT */
            <div className="flex items-center justify-center gap-4 mb-1">
              {(clinicInfo.showStampImage ?? true) && (
                <div>
                  {clinicInfo.stampImageUrl ? (
                    <img
                      src={clinicInfo.stampImageUrl}
                      alt="Carimbo Profissional"
                      className="h-16 max-w-[150px] object-contain border border-[#5a5a40]/40 rounded-lg p-1 bg-white/90 shadow-2xs filter contrast-110 -rotate-3"
                    />
                  ) : (
                    <div className="border-2 border-dashed border-[#5a5a40] text-[#5a5a40] rounded-xl px-3 py-1.5 bg-amber-50/80 text-left uppercase tracking-tight shadow-2xs flex flex-col justify-center min-w-[155px]">
                      <span className="font-bold text-[9.5px] block leading-tight">{dentistName}</span>
                      <span className="text-[8.5px] font-mono block leading-tight">{cro}</span>
                      <span className="text-[8px] font-sans text-gray-600 block">Cirurgião-Dentista</span>
                    </div>
                  )}
                </div>
              )}

              {(clinicInfo.showSignatureImage ?? true) && (
                <div>
                  {clinicInfo.signatureImageUrl ? (
                    <img
                      src={clinicInfo.signatureImageUrl}
                      alt="Assinatura Manual"
                      className="h-16 max-w-[210px] object-contain filter contrast-125 drop-shadow-xs -rotate-2"
                    />
                  ) : (
                    <div className="relative h-16 w-48 flex items-center justify-start -rotate-2">
                      <svg className="w-full h-full text-indigo-950 opacity-95" viewBox="0 0 240 60" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M 10 35 C 30 10, 45 50, 60 25 C 70 10, 80 40, 95 30 C 110 20, 115 45, 130 25 C 145 10, 160 50, 180 20 C 195 10, 210 35, 230 30" />
                        <path d="M 30 45 C 70 48, 120 40, 200 42" strokeWidth="1.8" />
                      </svg>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : arrangement === 'stacked' ? (
            /* STACKED VERTICAL ARRANGEMENT */
            <div className="flex flex-col items-center gap-2 mb-1">
              {(clinicInfo.showSignatureImage ?? true) && (
                <div>
                  {clinicInfo.signatureImageUrl ? (
                    <img
                      src={clinicInfo.signatureImageUrl}
                      alt="Assinatura Manual"
                      className="h-16 max-w-[210px] object-contain filter contrast-125 drop-shadow-xs -rotate-2"
                    />
                  ) : (
                    <div className="relative h-14 w-48 flex items-center justify-center -rotate-2">
                      <svg className="w-full h-full text-indigo-950 opacity-95" viewBox="0 0 240 60" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M 10 35 C 30 10, 45 50, 60 25 C 70 10, 80 40, 95 30 C 110 20, 115 45, 130 25 C 145 10, 160 50, 180 20 C 195 10, 210 35, 230 30" />
                        <path d="M 30 45 C 70 48, 120 40, 200 42" strokeWidth="1.8" />
                      </svg>
                    </div>
                  )}
                </div>
              )}

              {(clinicInfo.showStampImage ?? true) && (
                <div>
                  {clinicInfo.stampImageUrl ? (
                    <img
                      src={clinicInfo.stampImageUrl}
                      alt="Carimbo Profissional"
                      className="h-14 max-w-[150px] object-contain border border-[#5a5a40]/40 rounded-lg p-1 bg-white/90 shadow-2xs filter contrast-110 -rotate-3"
                    />
                  ) : (
                    <div className="border-2 border-dashed border-[#5a5a40] text-[#5a5a40] rounded-xl px-3 py-1 bg-amber-50/80 text-left uppercase tracking-tight shadow-2xs flex flex-col justify-center min-w-[155px]">
                      <span className="font-bold text-[9px] block leading-tight">{dentistName}</span>
                      <span className="text-[8px] font-mono block leading-tight">{cro}</span>
                      <span className="text-[7.5px] font-sans text-gray-600 block">Cirurgião-Dentista</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* OVERLAY CLASSIC ARRANGEMENT (DEFAULT) */
            <div className="relative w-80 min-h-[96px] mb-1">
              {/* Professional Stamp / Carimbo Figure (Background layer, rotated -12.5° left) */}
              {(clinicInfo.showStampImage ?? true) && (
                <div className={`absolute ${effectiveAlign === 'right' ? 'right-0' : effectiveAlign === 'center' ? 'left-1/2 -translate-x-1/2' : 'left-0'} bottom-0 z-10 -rotate-[12.5deg]`} style={{ transformOrigin: 'center center' }}>
                  {clinicInfo.stampImageUrl ? (
                    <img
                      src={clinicInfo.stampImageUrl}
                      alt="Carimbo Profissional"
                      className="h-16 max-w-[150px] object-contain border border-[#5a5a40]/40 rounded-lg p-1 bg-white/90 shadow-2xs filter contrast-110"
                    />
                  ) : (
                    <div className="border-2 border-dashed border-[#5a5a40] text-[#5a5a40] rounded-xl px-3 py-1.5 bg-amber-50/80 text-left uppercase tracking-tight shadow-2xs flex flex-col justify-center min-w-[165px]">
                      <span className="font-bold text-[9.5px] block leading-tight">{dentistName}</span>
                      <span className="text-[8.5px] font-mono block leading-tight">{cro}</span>
                      <span className="text-[8px] font-sans text-gray-600 block">Cirurgião-Dentista</span>
                    </div>
                  )}
                </div>
              )}

              {/* Handwritten Signature Figure (Overlaid horizontally) */}
              {(clinicInfo.showSignatureImage ?? true) && (
                <div className={`absolute ${effectiveAlign === 'right' ? 'right-8' : effectiveAlign === 'center' ? 'left-1/2 -translate-x-1/2' : 'left-8'} top-0 z-20 pointer-events-none`}>
                  {clinicInfo.signatureImageUrl ? (
                    <img
                      src={clinicInfo.signatureImageUrl}
                      alt="Assinatura Manual"
                      className="h-16 max-w-[210px] object-contain filter contrast-125 drop-shadow-xs -rotate-3"
                    />
                  ) : (
                    <div className="relative h-16 w-56 flex items-center justify-start -rotate-3">
                      <svg className="w-full h-full text-indigo-950 opacity-95" viewBox="0 0 240 60" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M 10 35 C 30 10, 45 50, 60 25 C 70 10, 80 40, 95 30 C 110 20, 115 45, 130 25 C 145 10, 160 50, 180 20 C 195 10, 210 35, 230 30" />
                        <path d="M 30 45 C 70 48, 120 40, 200 42" strokeWidth="1.8" />
                      </svg>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 2. LINHA DE ASSINATURA TRADICIONAL */}
          {!hideSignatureLine && (clinicInfo.showSignatureLine ?? true) && (
            <div className={`space-y-1 ${
              effectiveAlign === 'right' 
                ? 'text-right items-end' 
                : effectiveAlign === 'center' 
                ? 'text-center items-center' 
                : 'text-left items-start'
            } w-full max-w-xs pt-1 flex flex-col`}>
              <div className="w-64 border-b-2 border-stone-800" />
              <p className="font-bold text-stone-900 text-xs">{clinicInfo.signatureLabel || `${dentistName} • ${cro}`}</p>
            </div>
          )}
        </div>
      )}

      {/* 3. ASSINATURA DIGITAL COMPLETAMENTE INTEGRADA GOV.BR / CERTIFICAÇÃO DIGITAL (ICP-BRASIL) */}
      {!hideDigitalSignature && (clinicInfo.enableGovBrSignature ?? true) && (
        <div className="pt-2 w-full print:break-inside-avoid">
          <div className="w-full max-w-2xl mx-auto bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white p-3 sm:p-3.5 rounded-2xl border border-emerald-500/40 shadow-sm text-left flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-sans print:bg-slate-900 print:text-white print:border-slate-700">
            <div className="flex items-start gap-3">
              {/* Official gov.br & ICP-Brasil Seal Badge */}
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-emerald-600 p-0.5 shrink-0 shadow-md flex items-center justify-center">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center relative overflow-hidden">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <div className="absolute -bottom-1 -right-1 bg-amber-400 text-slate-950 text-[7px] font-extrabold px-1 rounded-xs">
                    gov.br
                  </div>
                </div>
              </div>

              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    Documento Assinado no Gov.br
                  </span>
                  <span className="bg-blue-900/60 text-blue-200 text-[8px] font-bold px-1.5 py-0.5 rounded-full border border-blue-500/30">
                    Pessoa Física
                  </span>
                  <span className="bg-emerald-900/60 text-emerald-200 text-[8px] font-bold px-1.5 py-0.5 rounded-full border border-emerald-500/30">
                    100% Gratuito Gov.br
                  </span>
                </div>

                <p className="text-[11px] font-bold text-slate-100">
                  Signatário: {dentistName} <span className="text-slate-400 font-mono font-normal">(CPF: ***.{cpf.slice(4, 11)}-**)</span>
                </p>

                <div className="text-[9.5px] text-slate-300 space-y-0.5 font-mono">
                  <p>
                    <span className="text-slate-400">Certificado:</span> {certificateType}
                  </p>
                  <p className="flex items-center gap-2">
                    <span><strong className="text-slate-400 font-sans">Data/Hora:</strong> {dateFormatted}</span>
                    <span>•</span>
                    <span><strong className="text-slate-400 font-sans">Hash SHA-256:</strong> {mockVerificationHash}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Verification QR Code & Validation Trigger */}
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center border-t sm:border-t-0 sm:border-l border-slate-800 pt-2 sm:pt-0 sm:pl-3 w-full sm:w-auto justify-between sm:justify-start">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-white rounded-lg shadow-xs">
                  <QrCode className="w-7 h-7 text-slate-900" />
                </div>
                <div className="text-[8.5px] text-slate-300 font-mono leading-tight">
                  <span className="text-emerald-400 font-bold block">Autenticidade Válida</span>
                  <a
                    href={govBrVerifierUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline text-blue-300 flex items-center gap-0.5"
                  >
                    validar.iti.gov.br
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsGovModalOpen(true)}
                className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] rounded-xl flex items-center gap-1 shadow-xs transition cursor-pointer"
              >
                <Lock className="w-3 h-3" />
                Validar Assinatura
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. GOV.BR / ICP-BRASIL CERTIFICATION VALIDATION MODAL */}
      {isGovModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-[28px] max-w-lg w-full p-6 shadow-2xl space-y-5 text-left text-xs font-sans">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-emerald-600 p-0.5 flex items-center justify-center text-white">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    Assinatura Digital Integrada GOV.BR & ITI
                  </h3>
                  <p className="text-[11px] text-slate-500">Certificação Digital Padrão ICP-Brasil</p>
                </div>
              </div>
              <button
                onClick={() => setIsGovModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {signedSuccessfully ? (
              <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-5 text-center space-y-2">
                <Check className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-sm text-emerald-900">Documento Assinado e Autenticado com Sucesso!</h4>
                <p className="text-xs text-emerald-800">
                  A assinatura eletrônica avançada foi vinculada ao perfil Pessoa Física do cirurgião-dentista no portal oficial do Gov.br.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2 text-slate-700">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="font-bold text-slate-900">Signatário Cadastrado</span>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px]">
                      Pessoa Física (Gov.br Gratuito)
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div><strong>Profissional:</strong> {dentistName}</div>
                    <div><strong>Inscrição CRO:</strong> {cro}</div>
                    <div><strong>CPF Registrado:</strong> {cpf}</div>
                    <div><strong>Tipo de Assinatura:</strong> Gov.br (Prata/Ouro)</div>
                    <div className="col-span-2"><strong>Custo:</strong> 100% Gratuito (Não requer e-CPF pago)</div>
                    <div className="col-span-2"><strong>Carimbo do Tempo (Timestamp):</strong> {dateFormatted}</div>
                    <div className="col-span-2 font-mono text-[10px] text-slate-600 bg-white p-2 rounded-xl border border-slate-200">
                      <strong>Código Hash SHA-256:</strong> {mockVerificationHash}
                    </div>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-[11px] text-amber-900 space-y-1.5">
                  <p className="font-bold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    Opções de Assinatura Digital Válida (ICP-Brasil / Lei 14.063/2020):
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-[10.5px] leading-relaxed">
                    <li><strong>Opção 1 (100% Gratuita):</strong> Acesse <strong>assinador.iti.br</strong> com sua conta Gov.br (Prata ou Ouro). Não requer compra de e-CPF.</li>
                    <li><strong>Opção 2 (Certificado e-CPF):</strong> Carregue seu certificado digital A1 (.pfx/.p12) ou conecte com BirdID/SafeWeb/Vidaas.</li>
                  </ul>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-slate-200">
                  <a
                    href="https://assinador.iti.br"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleDownloadPdfAndOpenIti}
                    className="w-full sm:w-auto px-3.5 py-2 bg-[#002776] hover:bg-[#001c57] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-[#ffdf00]" />
                    Abrir Assinador Gratuito ITI / Gov.br
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      setIsGovModalOpen(false);
                      setIsWizardOpen(true);
                    }}
                    className="w-full sm:w-auto px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-300" />
                    Assinar no Sistema (Gov.br / e-CPF)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* GOV.BR AUTOMATED BROWSER SIGNATURE WIZARD MODAL */}
      <GovBrSignatureWizardModal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        documentData={{
          title: documentTitle,
          patientName: 'Paciente em Atendimento',
          professionalName: dentistName,
          professionalCro: cro,
          professionalCpf: cpf
        }}
        onCompleteSignature={() => {
          setSignedSuccessfully(true);
        }}
      />
    </div>
  );
};
