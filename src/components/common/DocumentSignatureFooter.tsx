import React from 'react';
import { useApp } from '../../context/AppContext';
import { cleanSignatureText, verifyProfessionalSignatureAndStamp } from '../../utils/formatters';

interface DocumentSignatureFooterProps {
  customDentistName?: string;
  dentistName?: string;
  customCro?: string;
  cro?: string;
  specialty?: string;
  clinicName?: string;
  documentTitle?: string;
  compact?: boolean;
  hideSignatureLine?: boolean;
  hideDigitalSignature?: boolean; // Deprecated, preserved for prop compatibility
  hideStampAndManualSignature?: boolean;
  align?: 'left' | 'right' | 'center';
  professionalId?: string;
  customSignatureImageUrl?: string;
  customStampImageUrl?: string;
}

export const DocumentSignatureFooter: React.FC<DocumentSignatureFooterProps> = ({
  customDentistName,
  dentistName: propDentistName,
  customCro,
  cro: propCro,
  specialty: _propSpecialty,
  clinicName: _propClinicName,
  documentTitle: _documentTitle = 'Documento Odontológico',
  compact = false,
  hideSignatureLine = false,
  hideDigitalSignature: _hideDigitalSignature = false,
  hideStampAndManualSignature = false,
  align = 'right',
  professionalId,
  customSignatureImageUrl,
  customStampImageUrl
}) => {
  const { clinicInfo, activeProfessional, professionals } = useApp();

  // 1. Resolve and verify professional credentials and files in database
  const explicitEmpty = professionalId === '' || (customDentistName !== undefined && customDentistName.trim() === '');
  const targetProfRef = explicitEmpty 
    ? undefined 
    : (professionalId || customDentistName || propDentistName || activeProfessional);

  const verification = verifyProfessionalSignatureAndStamp(
    targetProfRef,
    professionals,
    clinicInfo,
    !hideStampAndManualSignature
  );

  const hasProf = Boolean(targetProfRef && verification.hasProfessionalSelected);
  const dentistName = hasProf ? (customDentistName || propDentistName || verification.dentistName) : '';
  const cro = hasProf ? (customCro || propCro || verification.dentistCro) : '';

  // 2. Strict file existence validation:
  // If files do not exist in database for this professional, they are strictly omitted.
  const effectiveStampUrl = hideStampAndManualSignature ? undefined : (
    customStampImageUrl !== undefined
      ? (customStampImageUrl || undefined)
      : verification.stampUrl
  );

  const effectiveSigUrl = hideStampAndManualSignature ? undefined : (
    customSignatureImageUrl !== undefined
      ? (customSignatureImageUrl || undefined)
      : verification.signatureUrl
  );

  const effectiveAlign = align || clinicInfo.signatureAlignment || 'right';

  const showSig = !hideStampAndManualSignature && (clinicInfo.showSignatureImage ?? true) && Boolean(effectiveSigUrl);
  const showStamp = !hideStampAndManualSignature && (clinicInfo.showStampImage ?? true) && Boolean(effectiveStampUrl);
  const hasGraphic = showSig || showStamp;

  const signatureLineText = hasProf
    ? cleanSignatureText(`${dentistName}${cro ? ` • ${cro}` : ''}`)
    : '';

  return (
    <div className={`space-y-2 ${compact ? 'pt-2 text-[10px]' : 'pt-5 text-xs'} text-center font-sans print:pt-3`}>
      {/* ASSINATURA E CARIMBO UNIFICADOS DO PROFISSIONAL SELECIONADO */}
      <div className={`w-full flex flex-col ${
        effectiveAlign === 'right' 
          ? 'items-end justify-end text-right ml-auto' 
          : effectiveAlign === 'center' 
          ? 'items-center justify-center text-center mx-auto' 
          : 'items-start justify-start text-left mr-auto'
      } space-y-1`}>

        {hasGraphic && !hideStampAndManualSignature ? (
          /* Unidade Única Integrada: Carimbo por baixo com rotação de -12,5° e Assinatura Manual por cima */
          <div className={`relative ${compact ? 'w-64 min-h-[76px]' : 'w-72 min-h-[92px]'} ${
            effectiveAlign === 'right' ? 'ml-auto' : effectiveAlign === 'center' ? 'mx-auto' : 'mr-auto'
          }`}>
            {/* Carimbo Profissional (Por baixo da assinatura, rotacionado a 12,5° para a esquerda) */}
            {showStamp && effectiveStampUrl && (
              <div 
                className={`absolute ${effectiveAlign === 'right' ? 'right-0' : effectiveAlign === 'center' ? 'left-1/2 -translate-x-1/2' : 'left-0'} z-10`}
                style={{ 
                  top: compact ? '16px' : '22px', 
                  transform: effectiveAlign === 'center' ? 'translateX(-50%) rotate(-12.5deg)' : 'rotate(-12.5deg)', 
                  transformOrigin: 'center center' 
                }}
              >
                <img
                  src={effectiveStampUrl}
                  alt="Carimbo Profissional"
                  className={`${compact ? 'h-12 max-w-[130px]' : 'h-15 max-w-[155px]'} object-contain border border-stone-200/90 rounded-lg p-0.5 bg-transparent mix-blend-multiply filter contrast-110`}
                />
              </div>
            )}

            {/* Assinatura Manual (Por cima do carimbo) */}
            {showSig && effectiveSigUrl && (
              <div className={`absolute ${effectiveAlign === 'right' ? 'right-4' : effectiveAlign === 'center' ? 'left-1/2 -translate-x-1/2' : 'left-4'} top-0 z-20 pointer-events-none`}>
                <img
                  src={effectiveSigUrl}
                  alt="Assinatura Manual"
                  className={`${compact ? 'h-12 max-w-[170px]' : 'h-15 max-w-[200px]'} object-contain filter contrast-125 drop-shadow-xs -rotate-2`}
                />
              </div>
            )}
          </div>
        ) : (
          /* Espaço limpo e sem artefatos para profissionais sem assinatura digital/carimbo ou com inserção manual a caneta */
          <div className={`w-full ${compact ? 'h-7' : 'h-10'}`} />
        )}

        {/* Linha de Assinatura Tradicional */}
        {!hideSignatureLine && (clinicInfo.showSignatureLine ?? true) && (
          <div className={`space-y-1 ${
            effectiveAlign === 'right' 
              ? 'text-right items-end ml-auto' 
              : effectiveAlign === 'center' 
              ? 'text-center items-center mx-auto' 
              : 'text-left items-start mr-auto'
          } w-full max-w-xs pt-1 flex flex-col`}>
            <div className="w-64 border-b-2 border-stone-800" />
            <p className="font-bold text-stone-900 text-xs min-h-[16px]">
              {signatureLineText}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
