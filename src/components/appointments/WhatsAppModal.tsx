import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { getThemeStyles } from '../../utils/themeUtils';
import { Appointment, WhatsAppTemplate } from '../../types';
import { MessageSquare, ExternalLink, Copy, Check, X, Send, Sparkles } from 'lucide-react';

interface WhatsAppModalProps {
  appointment: Appointment | null;
  onClose: () => void;
}

export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({ appointment, onClose }) => {
  const { whatsAppTemplates, clinicInfo, updateAppointmentStatus, layoutTheme } = useApp();
  const t = getThemeStyles(layoutTheme);
  
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(whatsAppTemplates[0]?.id || '');
  const [copied, setCopied] = useState(false);

  if (!appointment) return null;

  // Format date nicely (DD/MM/YYYY)
  const formatDateBR = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  const currentTemplate = whatsAppTemplates.find(t => t.id === selectedTemplateId) || whatsAppTemplates[0];

  // Replace variables in template
  const generateMessage = (rawText: string) => {
    if (!rawText) return '';
    const clinicNameStr = appointment.clinicName || clinicInfo.name;
    return rawText
      .replace(/{nome}/g, appointment.patientName)
      .replace(/{dentista}/g, appointment.dentistName || clinicInfo.dentistName)
      .replace(/{clinica}/g, clinicNameStr)
      .replace(/{data}/g, formatDateBR(appointment.date))
      .replace(/{horario}/g, appointment.time)
      .replace(/{procedimento}/g, appointment.procedure);
  };

  const [customText, setCustomText] = useState(() => generateMessage(currentTemplate?.message || ''));

  const handleSelectTemplate = (template: WhatsAppTemplate) => {
    setSelectedTemplateId(template.id);
    setCustomText(generateMessage(template.message));
  };

  // Clean phone number for wa.me URL (remove non-digits, ensure 55 country code)
  const getFormattedPhone = (phoneStr: string) => {
    const digitsOnly = phoneStr.replace(/\D/g, '');
    if (!digitsOnly.startsWith('55') && digitsOnly.length <= 11) {
      return `55${digitsOnly}`;
    }
    return digitsOnly;
  };

  const cleanPhone = getFormattedPhone(appointment.patientPhone);
  const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(customText)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(customText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenWhatsApp = () => {
    window.open(waUrl, '_blank', 'noopener,noreferrer');
    // Optionally mark appointment as confirmed or updated
    if (appointment.status === 'agendado') {
      updateAppointmentStatus(appointment.id, 'confirmado');
    }
    onClose();
  };

  return (
    <div className={`fixed inset-0 z-50 ${t.overlayBg} flex items-center justify-center p-4`}>
      <div className={`${t.modalBg} border ${t.modalBorder} rounded-[32px] max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]`}>
        {/* Modal Header */}
        <div className={`p-5 ${t.cardBg} border-b ${t.modalBorder} flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl ${t.inputBg} border ${t.inputBorder} flex items-center justify-center`}>
              <MessageSquare className="w-5 h-5 text-[#d4a373]" />
            </div>
            <div>
              <h3 className={`text-lg font-bold ${t.modalText} flex items-center gap-2`}>
                Enviar Lembrete por WhatsApp
              </h3>
              <p className={`text-xs ${t.modalMutedText}`}>Paciente: <strong className={t.modalText}>{appointment.patientName}</strong> ({appointment.patientPhone})</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className={`p-1.5 ${t.modalMutedText} hover:opacity-100 rounded-xl`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Appointment Quick Context Pill */}
          <div className="bg-[#fbfbf9] rounded-2xl p-3.5 border border-[#e5e5d1] text-xs flex items-center justify-between">
            <div>
              <p className="text-gray-400">Procedimento / Data:</p>
              <p className="text-[#2c2c2c] font-medium">{appointment.procedure} • {formatDateBR(appointment.date)} às {appointment.time}</p>
            </div>
            <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-[#f0f0e8] text-[#5a5a40] border border-[#e5e5d1]">
              {appointment.status.toUpperCase()}
            </span>
          </div>

          {/* Template Switcher Buttons */}
          <div>
            <label className="block text-xs font-semibold text-[#5a5a40] mb-2">Escolha o Modelo de Mensagem:</label>
            <div className="grid grid-cols-2 gap-2">
              {whatsAppTemplates.map(tmpl => (
                <button
                  key={tmpl.id}
                  onClick={() => handleSelectTemplate(tmpl)}
                  className={`
                    p-3 rounded-2xl text-left text-xs font-medium border transition-all
                    ${selectedTemplateId === tmpl.id 
                      ? 'bg-[#f0f0e8] border-[#5a5a40] text-[#5a5a40] font-bold' 
                      : 'bg-[#fbfbf9] border-[#e5e5d1] text-gray-600 hover:bg-[#f0f0e8]'}
                  `}
                >
                  <div className="flex items-center gap-1.5 font-semibold text-[#2c2c2c] mb-0.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#d4a373]" />
                    <span className="truncate">{tmpl.title}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Editable Text Area Preview */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-[#5a5a40]">Mensagem Formatada (Editável):</label>
              <button 
                onClick={handleCopy}
                className="text-xs text-[#5a5a40] hover:text-[#4a4a35] flex items-center gap-1 font-medium"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-[#d4a373]" />}
                {copied ? 'Copiado!' : 'Copiar Texto'}
              </button>
            </div>
            <textarea
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              rows={6}
              className="w-full bg-[#fbfbf9] border border-[#e5e5d1] rounded-2xl p-3.5 text-xs text-[#2c2c2c] font-sans focus:outline-none focus:border-[#5a5a40] leading-relaxed"
            />
            <p className="text-[11px] text-gray-400 mt-1">Dica: Asteriscos *texto* deixam o texto em negrito no WhatsApp.</p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#fbfbf9] border-t border-[#e5e5d1] flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-2xl text-xs font-medium text-gray-500 hover:text-[#2c2c2c] hover:bg-[#f0f0e8] transition"
          >
            Cancelar
          </button>
          
          <button
            onClick={handleOpenWhatsApp}
            className={`px-5 py-2.5 ${t.btnPrimaryBg} ${t.btnPrimaryText} font-medium text-xs rounded-2xl shadow-xs flex items-center gap-2 transition cursor-pointer`}
          >
            <Send className="w-4 h-4" />
            Abrir no WhatsApp
            <ExternalLink className="w-3.5 h-3.5 opacity-80" />
          </button>
        </div>
      </div>
    </div>
  );
};
