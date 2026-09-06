import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { getThemeStyles } from '../../utils/themeUtils';
import { UserRole, ROLE_PERMISSIONS, DEMO_USERS } from '../../lib/firebase';
import { printDocumentWithTitle } from '../../utils/printUtils';
import { 
  UserCheck, 
  ShieldCheck, 
  Stethoscope, 
  Users, 
  Lock, 
  LogOut, 
  X, 
  Check, 
  Plus, 
  KeyRound, 
  Mail, 
  UserPlus,
  Building,
  CheckCircle2,
  AlertCircle,
  Share2,
  Copy,
  ExternalLink,
  Globe,
  ArrowLeft,
  Printer
} from 'lucide-react';

interface UserSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserSessionModal: React.FC<UserSessionModalProps> = ({ isOpen, onClose }) => {
  const { layoutTheme } = useApp();
  const t = getThemeStyles(layoutTheme);

  const { 
    currentUser, 
    userRole, 
    userPermissions, 
    loginWithDemoUser, 
    loginWithEmail, 
    signupNewUser, 
    logout 
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'profile' | 'switch' | 'login' | 'signup' | 'partners'>('switch');
  const [copiedLink, setCopiedLink] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [roleInput, setRoleInput] = useState<UserRole>('dentist');
  const [croInput, setCroInput] = useState('');
  const [specialtyInput, setSpecialtyInput] = useState('');
  
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleCustomLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedbackMsg(null);

    const success = await loginWithEmail(emailInput, passwordInput);
    setIsSubmitting(false);

    if (success) {
      setFeedbackMsg({ type: 'success', text: 'Sessão iniciada com sucesso!' });
      setTimeout(() => {
        onClose();
      }, 1000);
    } else {
      setFeedbackMsg({ type: 'error', text: 'E-mail ou senha incorretos. Verifique suas credenciais.' });
    }
  };

  const handleCustomSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !passwordInput || !nameInput) {
      setFeedbackMsg({ type: 'error', text: 'Preencha os campos obrigatórios (E-mail, Senha e Nome).' });
      return;
    }

    setIsSubmitting(true);
    setFeedbackMsg(null);

    const success = await signupNewUser(emailInput, passwordInput, nameInput, roleInput, croInput, specialtyInput);
    setIsSubmitting(false);

    if (success) {
      setFeedbackMsg({ type: 'success', text: 'Usuário cadastrado com sucesso e sessão iniciada!' });
      setTimeout(() => {
        onClose();
      }, 1000);
    } else {
      setFeedbackMsg({ type: 'error', text: 'Erro ao cadastrar usuário. Tente novamente.' });
    }
  };

  return (
    <div className={`fixed inset-0 z-50 ${t.overlayBg} flex items-center justify-center p-4`}>
      <div className={`${t.modalBg} rounded-2xl shadow-2xl max-w-xl w-full border ${t.modalBorder} overflow-hidden flex flex-col max-h-[90vh]`}>
        {/* Header */}
        <div className={`${t.modalHeaderBg} p-4.5 flex items-center justify-between shrink-0`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6 text-[#d4a373]" />
            </div>
            <div>
              <h3 className={`font-bold text-base ${t.modalHeaderTitle}`}>Sessão de Usuário & Permissões</h3>
              <p className={`text-xs ${t.modalHeaderSubtitle}`}>Múltiplos Perfis com Restrição de Acesso por Função</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Active User Banner */}
        {currentUser && (
          <div className={`${t.cardBg} px-5 py-3 border-b ${t.modalBorder} flex items-center justify-between flex-wrap gap-2 shrink-0`}>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#5a5a40] text-white flex items-center justify-center font-bold text-xs">
                {currentUser.name.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <p className={`text-xs font-bold ${t.cardText}`}>{currentUser.name}</p>
                <p className={`text-[11px] ${t.modalMutedText} font-medium`}>{currentUser.email}</p>
              </div>
            </div>

            <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
              userRole === 'admin' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
              userRole === 'dentist' ? 'bg-sky-100 text-sky-900 border border-sky-300' :
              'bg-emerald-100 text-emerald-900 border border-emerald-300'
            }`}>
              {userRole === 'admin' && <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />}
              {userRole === 'dentist' && <Stethoscope className="w-3.5 h-3.5 text-sky-600" />}
              {userRole === 'receptionist' && <Users className="w-3.5 h-3.5 text-emerald-600" />}
              <span>{userPermissions.label}</span>
            </span>
          </div>
        )}

        {/* Modal Navigation Tabs */}
        <div className={`flex border-b ${t.modalBorder} ${t.cardBg} px-4 pt-2 gap-1 text-xs font-bold shrink-0`}>
          <button
            type="button"
            onClick={() => setActiveTab('switch')}
            className={`px-3 py-2 rounded-t-lg transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'switch' ? `${t.modalBg} border-t-2 border-t-[#d4a373] ${t.modalText} shadow-2xs` : `${t.modalMutedText} hover:opacity-80`
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Trocar Perfil Rápido</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('login')}
            className={`px-3 py-2 rounded-t-lg transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'login' ? `${t.modalBg} border-t-2 border-t-[#d4a373] ${t.modalText} shadow-2xs` : `${t.modalMutedText} hover:opacity-80`
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Login com E-mail</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('signup')}
            className={`px-3 py-2 rounded-t-lg transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'signup' ? `${t.modalBg} border-t-2 border-t-[#d4a373] ${t.modalText} shadow-2xs` : `${t.modalMutedText} hover:opacity-80`
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Novo Usuário</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('partners')}
            className={`px-3 py-2 rounded-t-lg transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'partners' ? `${t.modalBg} border-t-2 border-t-[#d4a373] ${t.modalText} shadow-2xs` : `${t.modalMutedText} hover:opacity-80`
            }`}
          >
            <Share2 className="w-3.5 h-3.5 text-amber-600" />
            <span>Link para Parceiros</span>
          </button>
        </div>

        {/* Feedback Message Banner */}
        {feedbackMsg && (
          <div className={`mx-5 mt-4 p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
            feedbackMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}>
            {feedbackMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" /> : <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />}
            <span>{feedbackMsg.text}</span>
          </div>
        )}

        {/* Modal Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* TAB 1: QUICK SWITCH */}
          {activeTab === 'switch' && (
            <div className="space-y-4">
              <p className="text-xs text-stone-600 leading-relaxed font-medium">
                Alterne instantaneamente a sessão ativa para testar e validar o comportamento do software de acordo com as restrições e parâmetros de cada usuário:
              </p>

              <div className="grid grid-cols-1 gap-3">
                {DEMO_USERS.map((demo) => {
                  const isCurrent = currentUser?.uid === demo.uid || currentUser?.email === demo.email;
                  const rolePerm = ROLE_PERMISSIONS[demo.role];

                  return (
                    <div
                      key={demo.uid}
                      onClick={() => {
                        loginWithDemoUser(demo.role);
                        setFeedbackMsg({ type: 'success', text: `Sessão alterada para ${demo.name} (${rolePerm.label})` });
                      }}
                      className={`p-3.5 rounded-xl border transition cursor-pointer flex items-start justify-between gap-3 ${
                        isCurrent 
                          ? 'bg-[#f7f7f0] border-[#5a5a40] shadow-2xs ring-1 ring-[#5a5a40]' 
                          : 'bg-white border-[#e5e5d1] hover:border-[#5a5a40]/60 hover:bg-[#fbfbf9]'
                      }`}
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-[#2c2c2c]">{demo.name}</span>
                          <span className={`px-2 py-0.5 rounded text-[10.5px] font-bold ${
                            demo.role === 'admin' ? 'bg-amber-100 text-amber-900' :
                            demo.role === 'dentist' ? 'bg-sky-100 text-sky-900' :
                            'bg-emerald-100 text-emerald-900'
                          }`}>
                            {rolePerm.label}
                          </span>
                        </div>

                        <p className="text-xs text-stone-500 font-medium">{demo.email} {demo.cro ? `• ${demo.cro}` : ''}</p>

                        <div className="text-[11px] text-stone-600 bg-[#f0f0e8] p-2 rounded-lg border border-[#e5e5d1]">
                          <strong className="text-[#5a5a40]">Permissões:</strong> {rolePerm.description}
                        </div>
                      </div>

                      {isCurrent ? (
                        <span className="px-2.5 py-1 bg-[#5a5a40] text-white text-xs font-bold rounded-lg shrink-0 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          <span>Ativo</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          className="px-3 py-1.5 bg-stone-100 hover:bg-[#5a5a40] hover:text-white text-stone-700 text-xs font-bold rounded-lg transition shrink-0 cursor-pointer"
                        >
                          Entrar
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: EMAIL LOGIN */}
          {activeTab === 'login' && (
            <form onSubmit={handleCustomLogin} className="space-y-3.5 text-xs">
              <p className="text-xs text-stone-600 font-medium">
                Inicie uma sessão com suas credenciais do Firebase Authentication para salvar seus parâmetros de clínica na nuvem:
              </p>

              <div>
                <label className="block text-[11px] font-bold text-[#5a5a40] mb-1">E-mail do Usuário:</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="seu.email@clinica.com.br"
                    className="w-full bg-[#fbfbf9] border border-[#e5e5d1] rounded-xl pl-9 pr-3 py-2 text-xs text-[#2c2c2c] focus:outline-none focus:border-[#5a5a40]"
                  />
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-2.5 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#5a5a40] mb-1">Senha de Acesso:</label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#fbfbf9] border border-[#e5e5d1] rounded-xl pl-9 pr-3 py-2 text-xs text-[#2c2c2c] focus:outline-none focus:border-[#5a5a40]"
                  />
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-2.5 pointer-events-none" />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-5 py-2.5 ${t.btnPrimaryBg} ${t.btnPrimaryText} font-bold rounded-xl transition cursor-pointer shadow-2xs flex items-center gap-1.5`}
                >
                  <KeyRound className="w-4 h-4" />
                  <span>{isSubmitting ? 'Iniciando Sessão...' : 'Entrar na Conta'}</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: SIGNUP NEW USER */}
          {activeTab === 'signup' && (
            <form onSubmit={handleCustomSignup} className="space-y-3 text-xs">
              <p className="text-xs text-stone-600 font-medium">
                Cadastre um novo usuário (Dentista, Recepcionista ou Administrador) com credenciais e restrição de acesso:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-[#5a5a40] mb-1">Nome Completo do Profissional:</label>
                  <input
                    type="text"
                    required
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="Ex: Dra. Juliana Santos"
                    className="w-full bg-[#fbfbf9] border border-[#e5e5d1] rounded-xl px-3 py-2 text-xs text-[#2c2c2c] focus:outline-none focus:border-[#5a5a40]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#5a5a40] mb-1">E-mail:</label>
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="juliana@clinica.com.br"
                    className="w-full bg-[#fbfbf9] border border-[#e5e5d1] rounded-xl px-3 py-2 text-xs text-[#2c2c2c] focus:outline-none focus:border-[#5a5a40]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#5a5a40] mb-1">Senha:</label>
                  <input
                    type="password"
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#fbfbf9] border border-[#e5e5d1] rounded-xl px-3 py-2 text-xs text-[#2c2c2c] focus:outline-none focus:border-[#5a5a40]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#5a5a40] mb-1">Função / Perfil de Acesso:</label>
                  <select
                    value={roleInput}
                    onChange={(e) => setRoleInput(e.target.value as UserRole)}
                    className="w-full bg-[#fbfbf9] border border-[#e5e5d1] rounded-xl px-3 py-2 text-xs font-bold text-[#2c2c2c] focus:outline-none focus:border-[#5a5a40]"
                  >
                    <option value="dentist">🩺 Dentista / Profissional Clínico</option>
                    <option value="receptionist">📋 Recepcionista / Atendente</option>
                    <option value="admin">👑 Administrador(a) Geral</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#5a5a40] mb-1">CRO (se aplicável):</label>
                  <input
                    type="text"
                    value={croInput}
                    onChange={(e) => setCroInput(e.target.value)}
                    placeholder="Ex: CRO-CE 98765"
                    className="w-full bg-[#fbfbf9] border border-[#e5e5d1] rounded-xl px-3 py-2 text-xs text-[#2c2c2c] focus:outline-none focus:border-[#5a5a40]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-[#5a5a40] mb-1">Especialidade Principal:</label>
                  <input
                    type="text"
                    value={specialtyInput}
                    onChange={(e) => setSpecialtyInput(e.target.value)}
                    placeholder="Ex: Endodontia, Odontopediatria..."
                    className="w-full bg-[#fbfbf9] border border-[#e5e5d1] rounded-xl px-3 py-2 text-xs text-[#2c2c2c] focus:outline-none focus:border-[#5a5a40]"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-5 py-2.5 ${t.btnPrimaryBg} ${t.btnPrimaryText} font-bold rounded-xl transition cursor-pointer shadow-2xs flex items-center gap-1.5`}
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{isSubmitting ? 'Cadastrando...' : 'Criar Conta e Iniciar Sessão'}</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 4: PARTNERS & ACCESS SHARING */}
          {activeTab === 'partners' && (
            <div className="space-y-4">
              <div className="bg-[#f0f0e8] border border-[#e5e5d1] p-3.5 rounded-2xl space-y-2">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[#5a5a40]" />
                  <h4 className="text-xs font-bold text-[#2c2c2c] uppercase tracking-wider">
                    Link Direto de Acesso ao Software
                  </h4>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed font-medium">
                  Este link público permite que parceiros (dentistas consultores, protéticos, radiologistas ou recepção externa) acessem o software em tempo real via navegador em qualquer computador, tablet ou celular.
                </p>

                {/* URL Display Box */}
                <div className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-[#e5e5d1]">
                  <input
                    type="text"
                    readOnly
                    value={window.location.href}
                    className="flex-1 bg-transparent text-xs text-stone-700 font-mono focus:outline-none select-all"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      setCopiedLink(true);
                      setTimeout(() => setCopiedLink(false), 3000);
                    }}
                    className="px-3 py-1.5 bg-[#5a5a40] hover:bg-[#4a4a35] text-white font-bold text-xs rounded-lg transition flex items-center gap-1 cursor-pointer shrink-0 shadow-2xs"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'Copiado!' : 'Copiar Link'}</span>
                  </button>
                  <a
                    href={window.location.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg transition"
                    title="Abrir em nova aba"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Shareable Invite Template */}
              <div className="space-y-2">
                <span className="block text-xs font-bold text-[#5a5a40] uppercase tracking-wider">
                  Mensagem Pronta de Convite (WhatsApp / E-mail):
                </span>
                <div className="bg-white border border-[#e5e5d1] p-3 rounded-xl space-y-2">
                  <p className="text-xs text-stone-700 font-mono leading-relaxed bg-[#fbfbf9] p-2.5 rounded-lg border border-stone-200">
                    "Olá! Segue o link de acesso direto ao sistema DentisPro da nossa clínica para acompanhamento dos atendimentos e documentação de pacientes: {window.location.href}"
                  </p>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        const msg = `Olá! Segue o link de acesso direto ao sistema DentisPro da nossa clínica para acompanhamento dos atendimentos e documentação de pacientes: ${window.location.href}`;
                        navigator.clipboard.writeText(msg);
                        setCopiedLink(true);
                        setTimeout(() => setCopiedLink(false), 3000);
                      }}
                      className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5 text-[#5a5a40]" />
                      <span>Copiar Mensagem Completa</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Instructions and Future Restrictions */}
              <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl space-y-1.5 text-xs text-amber-900">
                <div className="flex items-center gap-1.5 font-bold">
                  <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>Restrições e Controle de Acesso por Função:</span>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed font-medium">
                  Atualmente, cada parceiro pode navegar utilizando o perfil adequado (Dentista, Recepção ou Administrador). As restrições de aba por função garantem que recepcionistas não vejam o financeiro e dentistas vejam a parte clínica. Travas de acesso e senhas avançadas por parceiro podem ser ajustadas no módulo de <strong>Configurações</strong>.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#fbfbf9] border-t border-[#e5e5d1] flex items-center justify-between shrink-0 text-xs flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 border border-[#e5e5d1]"
            >
              <ArrowLeft className="w-4 h-4 text-[#5a5a40]" />
              <span>Voltar</span>
            </button>
            <button
              type="button"
              onClick={() => printDocumentWithTitle({
                docTitle: 'Ficha_Sessao_Usuario',
                patientName: currentUser?.displayName || currentUser?.email || 'Usuario',
                date: new Date()
              })}
              className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 border border-[#e5e5d1]"
            >
              <Printer className="w-4 h-4 text-[#5a5a40]" />
              <span>Imprimir</span>
            </button>

            {currentUser && (
              <button
                type="button"
                onClick={() => {
                  logout();
                  setFeedbackMsg({ type: 'success', text: 'Sessão encerrada.' });
                }}
                className="text-rose-700 hover:text-rose-900 font-bold flex items-center gap-1 cursor-pointer ml-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Sair da Sessão</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
