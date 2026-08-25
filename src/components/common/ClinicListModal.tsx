import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { getThemeStyles } from '../../utils/themeUtils';
import { ClinicUnit, Professional } from '../../types';
import { 
  Building2, 
  X, 
  Search, 
  Plus, 
  MapPin, 
  Phone, 
  Mail, 
  Stethoscope, 
  CheckCircle2, 
  Edit3, 
  ShieldCheck, 
  FileText, 
  ExternalLink,
  Trash2,
  Building,
  UserCheck,
  Users,
  Award,
  Calendar
} from 'lucide-react';

interface ClinicListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSettingsClinic?: (clinicId: string) => void;
}

export const ClinicListModal: React.FC<ClinicListModalProps> = ({
  isOpen,
  onClose,
  onOpenSettingsClinic
}) => {
  const { 
    clinics, 
    activeClinicId, 
    setActiveClinicId, 
    professionals, 
    activeProfessionalId,
    setActiveProfessionalId,
    layoutTheme,
    setActiveTab,
    addClinic,
    deleteClinic,
    deleteProfessional
  } = useApp();

  const t = getThemeStyles(layoutTheme);
  const [activeViewMode, setActiveViewMode] = useState<'clinics' | 'professionals'>('clinics');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [clinicToDelete, setClinicToDelete] = useState<ClinicUnit | null>(null);
  const [profToDelete, setProfToDelete] = useState<Professional | null>(null);

  // New clinic form state
  const [newName, setNewName] = useState('');
  const [newCity, setNewCity] = useState('São Paulo - SP');
  const [newAddress, setNewAddress] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newTechnicalManager, setNewTechnicalManager] = useState('');
  const [newEpaoNumber, setNewEpaoNumber] = useState('');

  if (!isOpen) return null;

  const filteredClinics = clinics.filter(c => {
    const term = searchTerm.toLowerCase();
    return (
      c.name.toLowerCase().includes(term) ||
      (c.city && c.city.toLowerCase().includes(term)) ||
      (c.address && c.address.toLowerCase().includes(term)) ||
      (c.technicalManager && c.technicalManager.toLowerCase().includes(term)) ||
      (c.id && c.id.toLowerCase().includes(term))
    );
  });

  const filteredProfessionals = professionals.filter(p => {
    const term = searchTerm.toLowerCase();
    return (
      p.name.toLowerCase().includes(term) ||
      p.cro.toLowerCase().includes(term) ||
      p.specialty.toLowerCase().includes(term) ||
      (p.email && p.email.toLowerCase().includes(term)) ||
      (p.phone && p.phone.toLowerCase().includes(term))
    );
  });

  const handleSelectClinic = (id: string) => {
    setActiveClinicId(id);
    onClose();
  };

  const handleSelectProfessional = (id: string) => {
    setActiveProfessionalId(id);
    onClose();
  };

  const handleConfirmDeleteClinic = () => {
    if (clinicToDelete) {
      deleteClinic(clinicToDelete.id);
      setClinicToDelete(null);
    }
  };

  const handleConfirmDeleteProf = () => {
    if (profToDelete) {
      deleteProfessional(profToDelete.id);
      setProfToDelete(null);
    }
  };

  const handleEditClinic = (id: string) => {
    if (onOpenSettingsClinic) {
      onOpenSettingsClinic(id);
    } else {
      setActiveTab('configuracoes');
    }
    onClose();
  };

  const handleCreateClinic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const created = addClinic({
      name: newName.trim(),
      city: newCity.trim(),
      address: newAddress.trim(),
      phone: newPhone.trim(),
      email: newEmail.trim() || undefined,
      technicalManager: newTechnicalManager.trim() || undefined,
      epaoNumber: newEpaoNumber.trim() || undefined
    });

    setActiveClinicId(created.id);
    setShowAddForm(false);
    setNewName('');
    setNewAddress('');
    setNewPhone('');
    setNewEmail('');
    setNewTechnicalManager('');
    setNewEpaoNumber('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#fcfdfa] border border-[#e5e5d1] rounded-3xl w-full max-w-4xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-[#e5e5d1] bg-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#5a5a40]/10 border border-[#5a5a40]/20 flex items-center justify-center text-[#5a5a40]">
              {activeViewMode === 'clinics' ? (
                <Building2 className="w-5 h-5 text-[#d4a373]" />
              ) : (
                <Users className="w-5 h-5 text-[#d4a373]" />
              )}
            </div>
            <div>
              <h2 className="text-base font-bold text-[#2c3e2e] flex items-center gap-2">
                {activeViewMode === 'clinics' ? 'Clínicas e Consultórios' : 'Profissionais e Corpo Clínico'}
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#5a5a40]/10 text-[#5a5a40] font-semibold font-mono">
                  {activeViewMode === 'clinics' 
                    ? `${clinics.length} ${clinics.length === 1 ? 'unidade' : 'unidades'}`
                    : `${professionals.length} ${professionals.length === 1 ? 'profissional' : 'profissionais'}`
                  }
                </span>
              </h2>
              <p className="text-xs text-gray-500">
                {activeViewMode === 'clinics' 
                  ? 'Gerencie e alterne entre as unidades, endereços e responsáveis técnicos'
                  : 'Consulte dentistas, especialidades, registros de CRO e vínculos de atendimento'
                }
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activeViewMode === 'clinics' && (
              <button
                type="button"
                onClick={() => setShowAddForm(!showAddForm)}
                className="px-3 py-1.5 bg-[#5a5a40] hover:bg-[#4a4a35] text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{showAddForm ? 'Ver Lista' : 'Nova Clínica'}</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition cursor-pointer"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* View Switcher Tabs & Search */}
        <div className="px-5 pt-4 pb-2 bg-[#fcfdfa] border-b border-[#e5e5d1] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center bg-[#e5e5d1]/50 p-1 rounded-2xl w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setActiveViewMode('clinics')}
              className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                activeViewMode === 'clinics'
                  ? 'bg-white text-[#2c3e2e] shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-[#d4a373]" />
              <span>Unidades ({clinics.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveViewMode('professionals')}
              className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                activeViewMode === 'professionals'
                  ? 'bg-white text-[#2c3e2e] shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-[#d4a373]" />
              <span>Profissionais ({professionals.length})</span>
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={activeViewMode === 'clinics' ? "Buscar clínica, cidade, endereço..." : "Buscar dentista, CRO, especialidade..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-8 py-1.5 bg-white border border-[#e5e5d1] rounded-2xl text-xs font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#5a5a40]"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {activeViewMode === 'clinics' && (
              <button
                type="button"
                onClick={() => handleSelectClinic('todas')}
                className={`px-3 py-1.5 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 border shrink-0 cursor-pointer ${
                  activeClinicId === 'todas'
                    ? 'bg-[#5a5a40] text-white border-[#5a5a40] shadow-xs'
                    : 'bg-white text-gray-700 border-[#e5e5d1] hover:bg-gray-50'
                }`}
                title="Visualizar agenda e relatórios de todas as unidades consolidadas"
              >
                <Building className="w-3.5 h-3.5 text-[#d4a373]" />
                <span>Todas</span>
              </button>
            )}
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          
          {/* Add New Clinic Form (Collapsible) */}
          {activeViewMode === 'clinics' && showAddForm && (
            <form onSubmit={handleCreateClinic} className="bg-white border border-[#d4a373]/40 rounded-2xl p-4 shadow-xs space-y-3.5 animate-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between border-b border-[#e5e5d1] pb-2">
                <span className="text-xs font-bold text-[#2c3e2e] flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-[#d4a373]" />
                  Cadastrar Nova Unidade / Consultório
                </span>
                <span className="text-[11px] text-gray-400">* Campos obrigatórios</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-[#5a5a40] mb-1">Nome da Clínica / Unidade *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: DentisPro - Unidade Centro / Paulista"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full bg-[#fcfdfa] border border-[#e5e5d1] rounded-xl px-3 py-2 text-xs font-semibold text-gray-800 focus:outline-none focus:border-[#5a5a40]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5a5a40] mb-1">Cidade / UF *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: São Paulo - SP"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    className="w-full bg-[#fcfdfa] border border-[#e5e5d1] rounded-xl px-3 py-2 text-xs font-semibold text-gray-800 focus:outline-none focus:border-[#5a5a40]"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-[#5a5a40] mb-1">Endereço Completo</label>
                  <input
                    type="text"
                    placeholder="Ex: Av. Paulista, 1500 - Conjunto 304 - Bela Vista"
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    className="w-full bg-[#fcfdfa] border border-[#e5e5d1] rounded-xl px-3 py-2 text-xs font-medium text-gray-800 focus:outline-none focus:border-[#5a5a40]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5a5a40] mb-1">Telefone / WhatsApp</label>
                  <input
                    type="text"
                    placeholder="Ex: (11) 3251-4000"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full bg-[#fcfdfa] border border-[#e5e5d1] rounded-xl px-3 py-2 text-xs font-medium text-gray-800 focus:outline-none focus:border-[#5a5a40]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5a5a40] mb-1">Responsável Técnico</label>
                  <select
                    value={newTechnicalManager}
                    onChange={(e) => setNewTechnicalManager(e.target.value)}
                    className="w-full bg-[#fcfdfa] border border-[#e5e5d1] rounded-xl px-3 py-2 text-xs font-medium text-gray-800 focus:outline-none focus:border-[#5a5a40]"
                  >
                    <option value="">(Selecione ou deixe em branco)</option>
                    {professionals.map(p => (
                      <option key={p.id} value={p.name}>
                        {p.name} ({p.cro})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5a5a40] mb-1">EPAO (Registro de Clínica)</label>
                  <input
                    type="text"
                    maxLength={5}
                    placeholder="Ex: 1234"
                    value={newEpaoNumber}
                    onChange={(e) => setNewEpaoNumber(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-[#fcfdfa] border border-[#e5e5d1] rounded-xl px-3 py-2 text-xs font-mono text-gray-800 focus:outline-none focus:border-[#5a5a40]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5a5a40] mb-1">E-mail de Contato</label>
                  <input
                    type="email"
                    placeholder="contato@dentispro.com.br"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full bg-[#fcfdfa] border border-[#e5e5d1] rounded-xl px-3 py-2 text-xs font-medium text-gray-800 focus:outline-none focus:border-[#5a5a40]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#e5e5d1]">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#5a5a40] hover:bg-[#4a4a35] text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#d4a373]" />
                  <span>Salvar Nova Unidade</span>
                </button>
              </div>
            </form>
          )}

          {/* ===================== CLÍNICAS VIEW ===================== */}
          {activeViewMode === 'clinics' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
              {filteredClinics.map((clinic) => {
                const isActive = activeClinicId === clinic.id;
                // Linked professionals for this clinic
                const linkedProfs = professionals.filter(p => p.clinicIds && p.clinicIds.includes(clinic.id));

                return (
                  <div
                    key={clinic.id}
                    onClick={() => handleSelectClinic(clinic.id)}
                    className={`border rounded-2xl p-4 transition-all duration-150 flex flex-col justify-between relative cursor-pointer group ${
                      isActive
                        ? 'bg-[#f5f5e9] border-[#5a5a40] ring-2 ring-[#5a5a40]/30 shadow-md'
                        : 'bg-white border-[#e5e5d1] hover:border-[#5a5a40]/50 hover:shadow-md hover:bg-[#fafaf6]'
                    }`}
                    title="Clique para selecionar e ativar esta clínica"
                  >
                    {isActive && (
                      <div className="absolute top-3 right-3 px-2 py-0.5 bg-[#5a5a40] text-white text-[10px] font-bold rounded-full flex items-center gap-1 shadow-2xs">
                        <CheckCircle2 className="w-3 h-3 text-[#d4a373]" />
                        <span>Unidade Ativa</span>
                      </div>
                    )}

                    <div className="space-y-2.5 pr-16">
                      <div className="flex items-start gap-2.5">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                          isActive ? 'bg-[#5a5a40] text-[#d4a373]' : 'bg-[#5a5a40]/10 text-[#5a5a40]'
                        }`}>
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-mono font-bold text-gray-400 bg-gray-100 px-1.5 py-0.2 rounded">
                              {clinic.id}
                            </span>
                            <h3 className="text-xs font-bold text-[#2c3e2e] leading-snug group-hover:text-[#5a5a40] transition-colors">
                              {clinic.name}
                            </h3>
                          </div>
                          <p className="text-[11px] font-medium text-gray-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-[#d4a373] shrink-0" />
                            <span>{clinic.city || 'São Paulo - SP'}</span>
                          </p>
                        </div>
                      </div>

                      <div className="space-y-1 text-[11px] text-gray-600 pl-1">
                        {clinic.address && (
                          <p className="line-clamp-2">
                            <strong className="text-gray-700">Endereço:</strong> {clinic.address}
                          </p>
                        )}
                        {clinic.phone && (
                          <p className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-gray-400 shrink-0" />
                            <strong className="text-gray-700">Tel:</strong> {clinic.phone}
                          </p>
                        )}
                        {clinic.technicalManager && (
                          <p className="flex items-center gap-1">
                            <Stethoscope className="w-3 h-3 text-[#d4a373] shrink-0" />
                            <strong className="text-gray-700">Resp. Técnico:</strong> {clinic.technicalManager}
                          </p>
                        )}
                        {clinic.epaoNumber && (
                          <p className="text-[10px] font-mono text-gray-500">
                            <strong>EPAO:</strong> {clinic.epaoNumber} {clinic.epaoUf ? `/${clinic.epaoUf}` : ''}
                          </p>
                        )}
                      </div>

                      {/* Profissionais Vinculados */}
                      <div className="pt-2 border-t border-[#e5e5d1]/60">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                          Corpo Clínico Vinculado ({linkedProfs.length}):
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {linkedProfs.map(lp => (
                            <span 
                              key={lp.id} 
                              className="text-[10px] px-2 py-0.5 rounded-md bg-[#5a5a40]/10 text-[#5a5a40] font-semibold flex items-center gap-1"
                              title={`${lp.name} - ${lp.specialty} (${lp.cro})`}
                            >
                              <UserCheck className="w-2.5 h-2.5 text-[#d4a373]" />
                              {lp.name}
                            </span>
                          ))}
                          {linkedProfs.length === 0 && (
                            <span className="text-[10px] text-gray-400 italic">Nenhum profissional vinculado</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-[#e5e5d1]/80">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditClinic(clinic.id);
                          }}
                          className="px-2.5 py-1 text-[11px] font-semibold text-[#5a5a40] hover:text-[#2c3e2e] hover:bg-[#5a5a40]/15 rounded-lg transition flex items-center gap-1 cursor-pointer"
                          title="Editar cadastro desta clínica"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-[#d4a373]" />
                          <span>Editar</span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setClinicToDelete(clinic);
                          }}
                          className="px-2 py-1 text-[11px] font-semibold text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition flex items-center gap-1 cursor-pointer"
                          title="Excluir esta clínica"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                          <span>Excluir</span>
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectClinic(clinic.id);
                        }}
                        className={`px-3 py-1 text-[11px] font-bold rounded-xl transition flex items-center gap-1 cursor-pointer ${
                          isActive
                            ? 'bg-[#5a5a40] text-white shadow-xs'
                            : 'bg-white hover:bg-[#5a5a40] text-[#5a5a40] hover:text-white border border-[#5a5a40]/30 shadow-2xs'
                        }`}
                      >
                        {isActive ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#d4a373]" />
                            <span>Selecionada</span>
                          </>
                        ) : (
                          <span>Selecionar Clínica</span>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ===================== PROFISSIONAIS VIEW ===================== */}
          {activeViewMode === 'professionals' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
              {filteredProfessionals.map((prof) => {
                const isActiveProf = activeProfessionalId === prof.id;
                // Linked clinics
                const linkedClinics = clinics.filter(c => prof.clinicIds && prof.clinicIds.includes(c.id));

                return (
                  <div
                    key={prof.id}
                    onClick={() => handleSelectProfessional(prof.id)}
                    className={`border rounded-2xl p-4 transition-all duration-150 flex flex-col justify-between relative cursor-pointer group ${
                      isActiveProf
                        ? 'bg-[#f5f5e9] border-[#5a5a40] ring-2 ring-[#5a5a40]/30 shadow-md'
                        : 'bg-white border-[#e5e5d1] hover:border-[#5a5a40]/50 hover:shadow-md hover:bg-[#fafaf6]'
                    }`}
                    title="Clique para selecionar este dentista"
                  >
                    {isActiveProf && (
                      <div className="absolute top-3 right-3 px-2 py-0.5 bg-[#5a5a40] text-white text-[10px] font-bold rounded-full flex items-center gap-1 shadow-2xs">
                        <CheckCircle2 className="w-3 h-3 text-[#d4a373]" />
                        <span>Profissional Ativo</span>
                      </div>
                    )}

                    <div className="space-y-2.5 pr-16">
                      <div className="flex items-start gap-2.5">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                          isActiveProf ? 'bg-[#5a5a40] text-[#d4a373]' : 'bg-[#5a5a40]/10 text-[#5a5a40]'
                        }`}>
                          <Stethoscope className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className="text-xs font-bold text-[#2c3e2e] leading-snug group-hover:text-[#5a5a40] transition-colors">
                              {prof.name}
                            </h3>
                          </div>
                          <p className="text-[11px] font-bold text-[#5a5a40] font-mono mt-0.5">
                            {prof.cro}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-1 text-[11px] text-gray-600 pl-1">
                        <p>
                          <strong className="text-gray-700">Especialidades:</strong> {prof.specialty}
                        </p>
                        {prof.phone && (
                          <p className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-gray-400 shrink-0" />
                            <strong className="text-gray-700">Tel:</strong> {prof.phone}
                          </p>
                        )}
                        {prof.email && (
                          <p className="flex items-center gap-1">
                            <Mail className="w-3 h-3 text-gray-400 shrink-0" />
                            <strong className="text-gray-700">E-mail:</strong> {prof.email}
                          </p>
                        )}
                      </div>

                      {/* Vínculo de Unidades */}
                      <div className="pt-2 border-t border-[#e5e5d1]/60">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                          Vínculo de Atendimento ({linkedClinics.length} unidades):
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {linkedClinics.map(lc => (
                            <span 
                              key={lc.id} 
                              className="text-[10px] px-2 py-0.5 rounded-md bg-[#d4a373]/15 text-[#6c4e28] font-semibold flex items-center gap-1"
                              title={`${lc.name} - ${lc.address}`}
                            >
                              <Building2 className="w-2.5 h-2.5 text-[#d4a373]" />
                              {lc.name.replace('DentisPro - ', '')}
                            </span>
                          ))}
                          {linkedClinics.length === 0 && (
                            <span className="text-[10px] text-gray-400 italic">Sem vínculos registrados</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-[#e5e5d1]/80">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveTab('configuracoes');
                            onClose();
                          }}
                          className="px-2.5 py-1 text-[11px] font-semibold text-[#5a5a40] hover:text-[#2c3e2e] hover:bg-[#5a5a40]/15 rounded-lg transition flex items-center gap-1 cursor-pointer"
                          title="Editar cadastro do profissional em Configurações"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-[#d4a373]" />
                          <span>Configurar</span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setProfToDelete(prof);
                          }}
                          className="px-2 py-1 text-[11px] font-semibold text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition flex items-center gap-1 cursor-pointer"
                          title="Excluir este profissional"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                          <span>Excluir</span>
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectProfessional(prof.id);
                        }}
                        className={`px-3 py-1 text-[11px] font-bold rounded-xl transition flex items-center gap-1 cursor-pointer ${
                          isActiveProf
                            ? 'bg-[#5a5a40] text-white shadow-xs'
                            : 'bg-white hover:bg-[#5a5a40] text-[#5a5a40] hover:text-white border border-[#5a5a40]/30 shadow-2xs'
                        }`}
                      >
                        {isActiveProf ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#d4a373]" />
                            <span>Ativo no Sistema</span>
                          </>
                        ) : (
                          <span>Selecionar Dentista</span>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {((activeViewMode === 'clinics' && filteredClinics.length === 0) ||
            (activeViewMode === 'professionals' && filteredProfessionals.length === 0)) && (
            <div className="text-center py-8 bg-white border border-dashed border-[#e5e5d1] rounded-2xl p-6">
              <Building2 className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-xs font-semibold text-gray-600">Nenhum registro encontrado para a busca "{searchTerm}"</p>
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="mt-2 text-xs font-bold text-[#5a5a40] hover:underline"
              >
                Limpar busca
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#e5e5d1] bg-white flex items-center justify-between">
          <span className="text-[11px] text-gray-500">
            Total: <strong>{clinics.length}</strong> clínicas e <strong>{professionals.length}</strong> profissionais no sistema DentisPro
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl transition cursor-pointer"
          >
            Fechar
          </button>
        </div>

      </div>

      {/* Confirmation Dialog for Deleting Clinic */}
      {clinicToDelete && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-[#e5e5d1] rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900">Confirmar Exclusão de Clínica</h4>
                <p className="text-xs text-gray-500">Esta ação é irreversível</p>
              </div>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Deseja realmente remover a clínica <strong className="text-gray-900 font-semibold">{clinicToDelete.name}</strong> ({clinicToDelete.city || 'São Paulo - SP'}) do sistema?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setClinicToDelete(null)}
                className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteClinic}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Excluir Clínica</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog for Deleting Professional */}
      {profToDelete && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-[#e5e5d1] rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900">Confirmar Exclusão de Profissional</h4>
                <p className="text-xs text-gray-500">Esta ação é irreversível</p>
              </div>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Deseja realmente remover o profissional <strong className="text-gray-900 font-semibold">{profToDelete.name}</strong> ({profToDelete.cro}) do sistema?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setProfToDelete(null)}
                className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteProf}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Excluir Dentista</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
