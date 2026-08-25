import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { getThemeStyles } from '../../utils/themeUtils';
import { UserRole, ROLE_PERMISSIONS, UserProfile } from '../../lib/firebase';
import { 
  ShieldCheck, 
  Users, 
  Stethoscope, 
  UserPlus, 
  Edit3, 
  Check, 
  Lock, 
  KeyRound, 
  CheckCircle2, 
  X,
  ShieldAlert,
  Save
} from 'lucide-react';

export const UserManagementSection: React.FC = () => {
  const { allUsers, userRole, updateUserRoleAndProfile, signupNewUser, refreshUsersList } = useAuth();
  const { layoutTheme } = useApp();
  const t = getThemeStyles(layoutTheme);
  
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [editingUid, setEditingUid] = useState<string | null>(null);
  
  // New User Form State
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPass, setNewPass] = useState('123456');
  const [newRole, setNewRole] = useState<UserRole>('dentist');
  const [newCro, setNewCro] = useState('');
  const [newSpecialty, setNewSpecialty] = useState('');
  
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail) return;

    await signupNewUser(newEmail, newPass, newName, newRole, newCro, newSpecialty);
    setShowAddUserModal(false);
    setStatusFeedback('Novo usuário cadastrado e permissões vinculadas com sucesso!');
    setTimeout(() => setStatusFeedback(null), 3500);

    // Reset Form
    setNewName('');
    setNewEmail('');
    setNewCro('');
    setNewSpecialty('');
  };

  const handleRoleChange = async (uid: string, targetRole: UserRole) => {
    await updateUserRoleAndProfile(uid, { role: targetRole });
    setStatusFeedback('Permissão do usuário atualizada e salva no banco de dados!');
    setTimeout(() => setStatusFeedback(null), 3000);
  };

  return (
    <div className="bg-white rounded-2xl border border-[#e5e5d1] p-5 sm:p-6 space-y-5 shadow-2xs">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e5e5d1] pb-4">
        <div>
          <h3 className={`font-bold text-base ${t.headingText} flex items-center gap-2`}>
            <ShieldCheck className="w-5 h-5 text-amber-600" />
            <span>Gestão de Usuários, Perfis e Permissões de Acesso</span>
          </h3>
          <p className="text-xs text-stone-500 font-medium mt-0.5">
            Defina papéis (Administrador, Dentista, Recepcionista) para restringir acessos a parâmetros da clínica e finanças
          </p>
        </div>

        {userRole === 'admin' ? (
          <button
            type="button"
            onClick={() => setShowAddUserModal(true)}
            className={`px-4 py-2 ${t.btnPrimaryBg} ${t.btnPrimaryText} text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-2xs`}
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Novo Usuário</span>
          </button>
        ) : (
          <div className="px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold rounded-lg flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-amber-600" />
            <span>Somente Administrador pode alterar usuários</span>
          </div>
        )}
      </div>

      {statusFeedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{statusFeedback}</span>
        </div>
      )}

      {/* Role Definitions Legend */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {(['admin', 'dentist', 'receptionist'] as UserRole[]).map((r) => {
          const perm = ROLE_PERMISSIONS[r];
          return (
            <div key={r} className="p-3 bg-[#fbfbf9] border border-[#e5e5d1] rounded-xl space-y-1">
              <div className="flex items-center gap-1.5">
                {r === 'admin' && <ShieldCheck className="w-4 h-4 text-amber-600" />}
                {r === 'dentist' && <Stethoscope className="w-4 h-4 text-sky-600" />}
                {r === 'receptionist' && <Users className="w-4 h-4 text-emerald-600" />}
                <span className="font-bold text-xs text-[#2c2c2c]">{perm.label}</span>
              </div>
              <p className="text-[11px] text-stone-500 font-medium leading-tight">{perm.description}</p>
            </div>
          );
        })}
      </div>

      {/* Registered Users Table / List */}
      <div className="space-y-3 pt-2">
        <h4 className={`font-bold text-xs ${t.headingText} uppercase tracking-wide`}>
          Usuários Cadastrados no Sistema ({allUsers.length}):
        </h4>

        <div className="divide-y divide-[#e5e5d1] border border-[#e5e5d1] rounded-xl overflow-hidden bg-white">
          {allUsers.map((usr) => {
            const rolePerm = ROLE_PERMISSIONS[usr.role || 'dentist'];

            return (
              <div key={usr.uid} className="p-3.5 flex flex-wrap items-center justify-between gap-3 hover:bg-[#fbfbf9] transition">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full ${t.btnPrimaryBg} ${t.btnPrimaryText} flex items-center justify-center font-bold text-xs shrink-0`}>
                    {usr.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-xs text-[#2c2c2c] flex items-center gap-2">
                      <span>{usr.name}</span>
                      {usr.cro && <span className="text-[10.5px] font-semibold text-stone-500">({usr.cro})</span>}
                    </p>
                    <p className="text-[11px] text-stone-500 font-medium">{usr.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    disabled={userRole !== 'admin'}
                    value={usr.role}
                    onChange={(e) => handleRoleChange(usr.uid, e.target.value as UserRole)}
                    className="bg-[#f0f0e8] border border-[#e5e5d1] rounded-lg px-2.5 py-1 text-xs font-bold text-[#2c2c2c] focus:outline-none focus:border-[#5a5a40] disabled:opacity-75 cursor-pointer"
                  >
                    <option value="admin">👑 Administrador(a)</option>
                    <option value="dentist">🩺 Dentista / Profissional</option>
                    <option value="receptionist">📋 Recepcionista</option>
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CREATE NEW USER MODAL */}
      {showAddUserModal && (
        <div className={`fixed inset-0 z-50 ${t.overlayBg} flex items-center justify-center p-4`}>
          <div className={`${t.modalBg} border ${t.modalBorder} rounded-2xl shadow-2xl max-w-md w-full p-5 space-y-4`}>
            <div className={`flex items-center justify-between pb-3 border-b ${t.modalBorder}`}>
              <div className={`flex items-center gap-2 ${t.headingText}`}>
                <UserPlus className="w-5 h-5" />
                <h3 className={`font-bold text-base ${t.modalText}`}>Cadastrar Novo Usuário</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddUserModal(false)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className={`block text-[11px] font-bold ${t.modalMutedText} mb-1`}>Nome Completo:</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ex: Dr. Lucas Mendes"
                  className={`w-full ${t.inputBg} rounded-xl px-3 py-2 text-xs focus:outline-none`}
                />
              </div>

              <div>
                <label className={`block text-[11px] font-bold ${t.modalMutedText} mb-1`}>E-mail de Acesso:</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="lucas@clinica.com.br"
                  className={`w-full ${t.inputBg} rounded-xl px-3 py-2 text-xs focus:outline-none`}
                />
              </div>

              <div>
                <label className={`block text-[11px] font-bold ${t.modalMutedText} mb-1`}>Senha Inicial:</label>
                <input
                  type="password"
                  required
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full ${t.inputBg} rounded-xl px-3 py-2 text-xs focus:outline-none`}
                />
              </div>

              <div>
                <label className={`block text-[11px] font-bold ${t.modalMutedText} mb-1`}>Perfil de Permissão:</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as UserRole)}
                  className={`w-full ${t.inputBg} rounded-xl px-3 py-2 text-xs font-bold focus:outline-none`}
                >
                  <option value="dentist">🩺 Dentista / Profissional Clínico</option>
                  <option value="receptionist">📋 Recepcionista / Atendente</option>
                  <option value="admin">👑 Administrador(a) Geral</option>
                </select>
              </div>

              <div>
                <label className={`block text-[11px] font-bold ${t.modalMutedText} mb-1`}>CRO (opcional):</label>
                <input
                  type="text"
                  value={newCro}
                  onChange={(e) => setNewCro(e.target.value)}
                  placeholder="Ex: CRO-CE 33221"
                  className={`w-full ${t.inputBg} rounded-xl px-3 py-2 text-xs focus:outline-none`}
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className={`px-4 py-2 ${t.btnSecondaryBg} ${t.btnSecondaryText} font-bold rounded-xl text-xs transition cursor-pointer`}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className={`px-4 py-2 ${t.btnPrimaryBg} ${t.btnPrimaryText} font-bold rounded-xl text-xs transition cursor-pointer flex items-center gap-1.5`}
                >
                  <Save className="w-4 h-4" />
                  <span>Salvar Usuário</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
