import React from 'react';
import { useApp } from '../../context/AppContext';
import { Professional, ClinicUnit } from '../../types';
import { DocumentSignatureFooter } from '../common/DocumentSignatureFooter';
import { Globe, Mail, Phone } from 'lucide-react';

interface LaudoStampSignatureProps {
  professional?: Professional | null;
  clinic?: ClinicUnit | null;
  emissionDate?: string;
  documentTitle?: string;
}

export const LaudoStampSignature: React.FC<LaudoStampSignatureProps> = ({
  professional,
  clinic,
  emissionDate,
  documentTitle = 'Laudo Odontológico Consolidado'
}) => {
  const { clinicInfo, activeProfessional, activeClinic } = useApp();

  const effectiveProfessional = professional || activeProfessional;
  const effectiveClinic = clinic || activeClinic || {
    name: clinicInfo.name || 'DentisPro Odontologia Especializada',
    address: clinicInfo.address || 'Av. Santos Dumont, 2800 - Aldeota',
    phone: clinicInfo.phone || '(85) 3261-9000',
    city: clinicInfo.city || 'Fortaleza - CE',
    email: clinicInfo.email || 'contato@dentispro.com.br'
  };

  const dentistName = effectiveProfessional?.name || clinicInfo.dentistName || 'Dr. Hugo Andres Iglesias Ricoy';
  const cro = effectiveProfessional?.cro || clinicInfo.cro || 'CRO/CE 5925';
  const specialty = effectiveProfessional?.specialty || clinicInfo.specialty || 'Cirurgião-Dentista';
  const clinicEmail = effectiveClinic.email || clinicInfo.email || 'contato@dentispro.com.br';
  const clinicPhone = effectiveClinic.phone || clinicInfo.phone || '(85) 3261-9000';
  const clinicWebsite = 'https://dentispro.com.br';

  const dateFormatted = emissionDate || new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div id="laudo-signature-block" className="mt-8 pt-6 border-t border-stone-200 print:border-stone-400 space-y-4 break-inside-avoid">
      {/* City and Date on Right */}
      <div className="flex justify-end text-xs text-stone-700 font-sans print:text-stone-800">
        <p>
          <span className="font-semibold">{effectiveClinic.city || 'Fortaleza - CE'}</span>, {dateFormatted}
        </p>
      </div>

      {/* Standard Document Signature and Stamp Component */}
      <div className="space-y-3 text-center relative z-10">
        <DocumentSignatureFooter
          customDentistName={dentistName}
          customCro={cro}
          specialty={specialty}
          clinicName={effectiveClinic.name}
          documentTitle={documentTitle}
          compact={false}
          align="right"
        />
      </div>

      {/* Interactive Footer Links (Website, E-mail, Phone) - Conforming with AGENTS.md Rule 4 */}
      <div 
        id="laudo-interactive-footer" 
        className="pt-4 border-t-2 border-stone-800 print:border-stone-400 text-xs text-stone-900 print:text-[10px] font-sans"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1">
          {/* Left Column: Website & Phone */}
          <div className="space-y-1 text-left">
            <div className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-[#5a5a40] shrink-0" />
              <a
                href={clinicWebsite}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-900 hover:text-blue-950 underline font-medium text-[11px] sm:text-xs"
              >
                dentispro.com.br
              </a>
            </div>
            <div className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[#5a5a40] shrink-0" />
              <a
                href={`tel:${clinicPhone.replace(/[^0-9]/g, '')}`}
                className="text-stone-800 hover:text-blue-900 hover:underline font-medium text-[11px] sm:text-xs font-mono"
              >
                {clinicPhone}
              </a>
            </div>
          </div>

          {/* Right Column: Email & System Designation */}
          <div className="space-y-1 text-left sm:text-right">
            <div className="flex items-center sm:justify-end gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#5a5a40] shrink-0" />
              <a
                href={`mailto:${clinicEmail}`}
                className="text-stone-800 hover:text-blue-900 hover:underline font-medium text-[11px] sm:text-xs"
              >
                {clinicEmail}
              </a>
            </div>
            <div className="text-[10px] text-stone-500">
              Prontuário Odontológico Digital Oficial • DentisPro
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
