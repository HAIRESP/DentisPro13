import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, Lock, Eye, EyeOff, X, ArrowRight, UserCheck, Stethoscope, Building2, AlertCircle } from 'lucide-react';

export const SwitchProfessionalModal: React.FC = () => {
  const { 
    professionals, 
    clinics, 
    activeProfessional, 
    activeClinic, 
    switchRequest, 
    cancelSwitchProfessional, 
    applySwitchProfessional 
  } = useApp();

  const { verifyPasswordForProfessionalOrUser, allUsers } = useAuth();

  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const requestRef = useRef(switchRequest);
  requestRef.current = switchRequest;
  useEffect(() => () => { requestRef.current = null; }, []);

  // Reset state on open
  useEffect(() => {
    if (switchRequest) {
      setPasswordInput('');
      setShowPassword(false);
      setErrorMessage(null);
      setIsSubmitting(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [switchRequest]);

  if (!switchRequest) return null;

  const targetProf = professionals.find(p => p.id === switchRequest.targetProfId);
  if (!targetProf) return null;

  // Determine target clinic
  let targetClinic = clinics.find(c => c.id === switchRequest.targetClinicId);
  if (!targetClinic) {
    if (targetProf.primaryClinicId) {
      targetClinic = clinics.find(c => c.id === targetProf.primaryClinicId);
    } else if (targetProf.clinicIds && targetProf.clinicIds.length > 0) {
      targetClinic = clinics.find(c => c.id === targetProf.clinicIds[0]);
    }
  }

  // Linked user account info if exists
  const targetUser = allUsers.find(u => 
    u.professionalId === targetProf.id || 
    u.email.toLowerCase() === targetProf.email?.toLowerCase()
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!passwordInput) {
      setErrorMessage('Por favor, informe a senha de acesso.');
      inputRef.current?.focus();
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    // Verify password against professional / target user or admin password
    const request = switchRequest;
    const isValid = await verifyPasswordForProfessionalOrUser(targetProf.id, passwordInput);
    if (requestRef.current !== request) return;

    if (isValid) {
      applySwitchProfessional(targetProf.id, targetClinic?.id);
    } else {
      setErrorMessage('Não foi possível autorizar a troca. Confira sua senha, a conexão e o vínculo com o profissional.');
      setIsSubmitting(false);
      inputRef.current?.select();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="switch-prof-title"
    >
      <div className="bg-white border border-[#e5e5d1] rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-5 text-[#2c2c2c] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#e5e5d1] pb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#5a5a40]/10 flex items-center justify-center text-[#5a5a40]">
              <Lock className="w-5 h-5 text-[#d4a373]" />
            </div>
            <div>
              <h3 id="switch-prof-title" className="text-base font-bold text-[#2c2c2c] flex items-center gap-1.5">
                Troca de Profissional
              </h3>
              <p className="text-xs text-stone-500">
                Confirmação de segurança e credencial de acesso
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={cancelSwitchProfessional}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition cursor-pointer"
            aria-label="Cancelar troca"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Transition Summary Banner: Current -> Target */}
        <div className="bg-[#fbfbf9] border border-[#e5e5d1] rounded-2xl p-4 space-y-3">
          <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-[#5a5a40]" />
            <span>Transição de Perfil Operador</span>
          </div>

          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-xs">
            {/* Current */}
            <div className="p-2.5 rounded-xl bg-white border border-stone-200/70 space-y-0.5">
              <span className="text-[10px] font-bold text-stone-400 block uppercase">Atual</span>
              <p className="font-bold text-stone-800 line-clamp-1 text-xs">
                {activeProfessional?.name || 'Profissional'}
              </p>
              <p className="text-[10.5px] text-stone-500 font-mono">
                {activeProfessional?.cro}
              </p>
              <p className="text-[10px] text-stone-500 line-clamp-1">
                {activeClinic?.name || 'Clínica Principal'}
              </p>
            </div>

            {/* Arrow */}
            <div className="flex items-center justify-center text-[#5a5a40]">
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </div>

            {/* Target */}
            <div className="p-2.5 rounded-xl bg-[#5a5a40]/5 border border-[#5a5a40]/30 space-y-0.5">
              <span className="text-[10px] font-bold text-[#5a5a40] block uppercase">Destino</span>
              <p className="font-bold text-[#2c2c2c] line-clamp-1 text-xs">
                {targetProf.name}
              </p>
              <p className="text-[10.5px] text-[#5a5a40] font-mono font-bold">
                {targetProf.cro}
              </p>
              <p className="text-[10px] text-stone-600 line-clamp-1">
                {targetClinic?.name || 'Unidade Principal'}
              </p>
            </div>
          </div>

          {targetClinic && (
            <div className="flex items-center gap-1.5 text-[11px] text-stone-600 pt-1">
              <Building2 className="w-3.5 h-3.5 text-[#d4a373] shrink-0" />
              <span>Unidade vinculada: <strong className="text-stone-800">{targetClinic.name}</strong></span>
            </div>
          )}
        </div>

        {/* Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-stone-700">
              Senha da sua conta conectada *
            </label>
            <div className="relative">
              <input
                ref={inputRef}
                type={showPassword ? 'text' : 'password'}
                required
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="Digite a senha da sua conta"
                className="w-full bg-white border border-[#e5e5d1] rounded-xl px-3.5 py-2.5 pr-10 text-xs text-[#2c2c2c] font-medium focus:outline-none focus:border-[#5a5a40] focus:ring-2 focus:ring-[#5a5a40]/20 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 transition cursor-pointer p-1"
                aria-label={showPassword ? 'Ocultar senha' : 'Exibir senha'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="flex items-start gap-1.5 text-xs text-rose-600 font-medium bg-rose-50 border border-rose-200 p-2.5 rounded-xl animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>

          <div className="bg-stone-50 border border-stone-200/80 rounded-xl p-3 text-[11px] text-stone-600 space-y-1 leading-relaxed">
            <p className="flex items-center gap-1 font-semibold text-stone-800">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Proteção e Rastreabilidade</span>
            </p>
            <p>
              Ao alternar de profissional, o prontuário, as assinaturas e a emissão de documentos serão atualizados para o nome e registro de <strong>{targetProf.name}</strong>.
            </p>
            <p className="text-[10.5px] text-stone-500 pt-0.5">
              Administradores podem selecionar profissionais. Dentistas precisam estar vinculados ao profissional escolhido. A senha é confirmada pelo Firebase.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#e5e5d1]">
            <button
              type="button"
              onClick={cancelSwitchProfessional}
              className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-[#5a5a40] hover:bg-[#4a4a35] text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              <UserCheck className="w-3.5 h-3.5 text-[#d4a373]" />
              <span>Confirmar Acesso</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
