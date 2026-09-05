import React from 'react';
import { useApp } from '../../context/AppContext';

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
  align = 'right'
}) => {
  const { clinicInfo, activeProfessional } = useApp();

  const dentistName = customDentistName || propDentistName || activeProfessional?.name || clinicInfo.dentistName || 'Hugo Andres Iglesias Ricoy';
  const cro = customCro || propCro || activeProfessional?.cro || clinicInfo.cro || 'CRO/CE 5925';
  
  const effectiveStampUrl = activeProfessional?.stampImageUrl || clinicInfo.stampImageUrl;
  const effectiveSigUrl = activeProfessional?.signatureImageUrl || clinicInfo.signatureImageUrl;

  const effectiveAlign = align || clinicInfo.signatureAlignment || 'right';

  return (
    <div className={`space-y-2 ${compact ? 'pt-2 text-[10px]' : 'pt-5 text-xs'} text-center font-sans print:pt-3`}>
      {/* ASSINATURA E CARIMBO UNIFICADOS NUMA SÓ PEÇA (Carimbo a 12,5° para a esquerda) */}
      {!hideStampAndManualSignature && (
        <div className={`w-full flex flex-col ${
          effectiveAlign === 'right' 
            ? 'items-end justify-end text-right ml-auto' 
            : effectiveAlign === 'center' 
            ? 'items-center justify-center text-center mx-auto' 
            : 'items-start justify-start text-left mr-auto'
        } space-y-1`}>

          {/* Unidade Única Integrada: Carimbo por baixo com rotação de -12,5° e Assinatura Manual por cima */}
          <div className={`relative ${compact ? 'w-64 min-h-[82px]' : 'w-72 min-h-[98px]'} ${
            effectiveAlign === 'right' ? 'ml-auto' : effectiveAlign === 'center' ? 'mx-auto' : 'mr-auto'
          }`}>
            {/* Carimbo Profissional (Por baixo da assinatura, rotacionado a 12,5° para a esquerda) */}
            {(clinicInfo.showStampImage ?? true) && (
              <div 
                className={`absolute ${effectiveAlign === 'right' ? 'right-0' : effectiveAlign === 'center' ? 'left-1/2 -translate-x-1/2' : 'left-0'} z-10`}
                style={{ 
                  top: compact ? '20px' : '26px', 
                  transform: effectiveAlign === 'center' ? 'translateX(-50%) rotate(-12.5deg)' : 'rotate(-12.5deg)', 
                  transformOrigin: 'center center' 
                }}
              >
                {effectiveStampUrl ? (
                  <img
                    src={effectiveStampUrl}
                    alt="Carimbo Profissional"
                    className={`${compact ? 'h-12 max-w-[130px]' : 'h-15 max-w-[155px]'} object-contain border border-stone-200/90 rounded-lg p-0.5 bg-transparent mix-blend-multiply filter contrast-110`}
                  />
                ) : (
                  <div className={`border border-dashed border-stone-300 text-stone-600 rounded-xl ${compact ? 'px-2.5 py-1 min-w-[140px]' : 'px-3 py-1.5 min-w-[160px]'} bg-transparent text-left uppercase tracking-tight flex flex-col justify-center`}>
                    <span className={`font-bold ${compact ? 'text-[8.5px]' : 'text-[9.5px]'} block leading-tight text-stone-800`}>{dentistName}</span>
                    <span className={`${compact ? 'text-[7.5px]' : 'text-[8.5px]'} font-mono block leading-tight text-stone-600`}>{cro}</span>
                    <span className={`${compact ? 'text-[7px]' : 'text-[8px]'} font-sans text-stone-500 block`}>Cirurgião-Dentista</span>
                  </div>
                )}
              </div>
            )}

            {/* Assinatura Manual (Por cima do carimbo) */}
            {(clinicInfo.showSignatureImage ?? true) && (
              <div className={`absolute ${effectiveAlign === 'right' ? 'right-4' : effectiveAlign === 'center' ? 'left-1/2 -translate-x-1/2' : 'left-4'} top-0 z-20 pointer-events-none`}>
                {effectiveSigUrl ? (
                  <img
                    src={effectiveSigUrl}
                    alt="Assinatura Manual"
                    className={`${compact ? 'h-12 max-w-[170px]' : 'h-15 max-w-[200px]'} object-contain filter contrast-125 drop-shadow-xs -rotate-2`}
                  />
                ) : (
                  <div className={`relative ${compact ? 'h-12 w-44' : 'h-15 w-52'} flex items-center justify-start -rotate-2`}>
                    <svg className="w-full h-full text-indigo-950 opacity-95" viewBox="0 0 240 60" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M 10 35 C 30 10, 45 50, 60 25 C 70 10, 80 40, 95 30 C 110 20, 115 45, 130 25 C 145 10, 160 50, 180 20 C 195 10, 210 35, 230 30" />
                      <path d="M 30 45 C 70 48, 120 40, 200 42" strokeWidth="1.8" />
                    </svg>
                  </div>
                )}
              </div>
            )}
          </div>

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
              <p className="font-bold text-stone-900 text-xs">{clinicInfo.signatureLabel || `${dentistName} • ${cro}`}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
