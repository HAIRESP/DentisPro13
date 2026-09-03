import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Patient, Gender } from '../../types';
import { formatCPF, isValidEmail, isValidDateStr } from '../../utils/formatters';
import { CameraModal } from '../common/CameraModal';
import { 
  Users, 
  Search, 
  Plus, 
  Phone, 
  Mail, 
  FileText, 
  Smile, 
  Calendar, 
  MessageSquare, 
  ChevronRight, 
  AlertTriangle,
  UserCheck,
  Filter,
  X,
  FileCheck2,
  Stethoscope,
  DollarSign,
  Receipt,
  Camera,
  Image as ImageIcon,
  Bot,
  Upload,
  Printer,
  Send,
  Lock,
  ShieldCheck,
  Sparkles,
  Check,
  Edit2,
  Pencil,
  ArrowLeft
} from 'lucide-react';
import { Odontogram } from './Odontogram';
import { ClinicalEvolution } from './ClinicalEvolution';
import { TreatmentPlanManager } from './TreatmentPlanManager';
import { ClinicalExamView } from './ClinicalExamView';
import { ImageGalleryWithEditor } from '../common/ImageGalleryWithEditor';
import { AnamnesisModal } from './AnamnesisModal';
import { PatientFinancialsTab } from './PatientFinancialsTab';
import { PatientAttendanceReportModal } from './PatientAttendanceReportModal';
import { AddressFields, AddressData, formatFullAddress } from '../common/AddressFields';
import { PhoneInputWithDDI, formatPhoneWithDDI } from '../common/PhoneInputWithDDI';
import { getThemeStyles } from '../../utils/themeUtils';

export const PatientList: React.FC = () => {
  const { 
    patients, 
    clinics,
    professionals,
    selectedPatientId, 
    setSelectedPatientId, 
    addPatient, 
    updatePatient, 
    appointments, 
    prescriptions, 
    savedClinicDocuments,
    clinicInfo, 
    openWhatsAppForAppointment,
    setActiveTab,
    layoutTheme,
    saveOdontogramSnapshot,
    odontograms
  } = useApp();

  const t = getThemeStyles(layoutTheme);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterInsurance, setFilterInsurance] = useState<string>('todos');
  const [isNewPatientModalOpen, setIsNewPatientModalOpen] = useState(false);
  const [isAnamnesisModalOpen, setIsAnamnesisModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [activeProfileTab, setActiveProfileTab] = useState<'info' | 'exame_clinico' | 'plano' | 'evolucao' | 'financeiro' | 'consultas' | 'documentos' | 'galeria'>('info');

  // Form state for new patient
  const [isPatientCameraOpen, setIsPatientCameraOpen] = useState(false);
  const [patientCameraTarget, setPatientCameraTarget] = useState<'selected' | 'new'>('selected');

  const [newName, setNewName] = useState('');
  const [newCpf, setNewCpf] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newBirthDate, setNewBirthDate] = useState('');
  const [newGender, setNewGender] = useState<Gender>('masculino');
  const [newInsurance, setNewInsurance] = useState('Particular');
  const [newInsuranceNumber, setNewInsuranceNumber] = useState('');
  const [newClinicId, setNewClinicId] = useState(clinics[0]?.id || 'cli-1');
  const [newDentistName, setNewDentistName] = useState(professionals[0]?.name || clinicInfo.dentistName);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newAddress, setNewAddress] = useState<AddressData>({
    cep: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: ''
  });
  const [hasAllergies, setHasAllergies] = useState(false);
  const [allergyDetails, setAllergyDetails] = useState('');
  const [hasDiabetes, setHasDiabetes] = useState(false);
  const [hasHypertension, setHasHypertension] = useState(false);
  const [isPregnant, setIsPregnant] = useState(false);
  const [anamnesisNotes, setAnamnesisNotes] = useState('');

  const [availableInsurances, setAvailableInsurances] = useState<string[]>([
    'Particular',
    'Unimed Odonto',
    'Amil Dental',
    'Bradesco Dental',
    'OdontoPrev',
    'Porto Seguro Odonto',
    'SulAmérica Odonto',
    'Intermédica',
    'INPASGO',
    'Ipasgo Saúde',
    'Samp Odonto',
    'MetLife'
  ]);
  const [isAddInsuranceModalOpen, setIsAddInsuranceModalOpen] = useState(false);
  const [newInsuranceNameInput, setNewInsuranceNameInput] = useState('');
  const [editingCarteirinha, setEditingCarteirinha] = useState(false);
  const [carteirinhaInput, setCarteirinhaInput] = useState('');

  // Edit patient modal state
  const [isEditPatientModalOpen, setIsEditPatientModalOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editCpf, setEditCpf] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editBirthDate, setEditBirthDate] = useState('');
  const [editGender, setEditGender] = useState<Gender>('masculino');
  const [editInsurance, setEditInsurance] = useState('Particular');
  const [editInsuranceNumber, setEditInsuranceNumber] = useState('');
  const [editClinicId, setEditClinicId] = useState('');
  const [editDentistName, setEditDentistName] = useState('');
  const [editStatus, setEditStatus] = useState<'ativo' | 'inativo'>('ativo');
  const [editPhotoUrl, setEditPhotoUrl] = useState('');
  const [editAddress, setEditAddress] = useState<AddressData>({
    cep: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: ''
  });

  const openEditPatientModal = (patient: Patient) => {
    setEditName(patient.name || '');
    setEditCpf(patient.cpf || '');
    setEditPhone(patient.phone || '');
    setEditEmail(patient.email || '');
    setEditBirthDate(patient.birthDate || '');
    setEditGender(patient.gender || 'masculino');
    setEditInsurance(patient.healthInsurance || 'Particular');
    setEditInsuranceNumber(patient.insuranceNumber || '');
    setEditClinicId(patient.preferredClinicId || clinics[0]?.id || '');
    setEditDentistName(patient.preferredDentistName || professionals[0]?.name || '');
    setEditStatus(patient.status || 'ativo');
    setEditPhotoUrl(patient.photoUrl || '');
    setEditAddress({
      cep: patient.address?.cep || '',
      street: patient.address?.street || '',
      number: patient.address?.number || '',
      complement: patient.address?.complement || '',
      neighborhood: patient.address?.neighborhood || '',
      city: patient.address?.city || '',
      state: patient.address?.state || ''
    });
    setIsEditPatientModalOpen(true);
  };

  const handleUpdatePatientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;
    if (!editName.trim()) {
      alert('O Nome Completo é de preenchimento obrigatório.');
      return;
    }
    if (!editPhone.trim()) {
      alert('O Telefone/WhatsApp é de preenchimento obrigatório.');
      return;
    }
    if (!editBirthDate) {
      alert('A Data de Nascimento é de preenchimento obrigatório.');
      return;
    }

    const selectedClinic = clinics.find(c => c.id === editClinicId);
    const isParticular = !editInsurance || editInsurance === 'Particular';

    updatePatient(selectedPatient.id, {
      name: editName,
      cpf: formatCPF(editCpf) || selectedPatient.cpf,
      phone: editPhone,
      email: editEmail,
      birthDate: editBirthDate,
      gender: editGender,
      healthInsurance: editInsurance || 'Particular',
      insuranceNumber: isParticular ? '' : editInsuranceNumber.trim(),
      status: editStatus,
      photoUrl: editPhotoUrl || undefined,
      preferredClinicId: selectedClinic?.id,
      preferredClinicName: selectedClinic?.name,
      preferredDentistName: editDentistName,
      address: {
        street: editAddress.street || '',
        number: editAddress.number || '',
        neighborhood: editAddress.neighborhood || '',
        city: editAddress.city || '',
        state: editAddress.state || '',
        cep: editAddress.cep || '',
        complement: editAddress.complement || undefined
      }
    });

    setIsEditPatientModalOpen(false);
  };

  // Handle Photo File Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, callback: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          callback(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Filtered patients list
  const filteredPatients = patients.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.cpf.includes(searchTerm) ||
                          p.phone.includes(searchTerm);
    const matchesInsurance = filterInsurance === 'todos' || 
                             (filterInsurance === 'particular' && (!p.healthInsurance || p.healthInsurance === 'Particular')) ||
                             (filterInsurance === 'convenio' && p.healthInsurance && p.healthInsurance !== 'Particular');
    return matchesSearch && matchesInsurance;
  });

  const selectedPatient = patients.find(p => p.id === selectedPatientId);

  const handleCreatePatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      alert('O Nome Completo é de preenchimento obrigatório.');
      return;
    }
    if (!newPhone.trim()) {
      alert('O Telefone/WhatsApp é de preenchimento obrigatório.');
      return;
    }
    if (!newBirthDate) {
      alert('A Data de Nascimento é de preenchimento obrigatório.');
      return;
    }
    if (!newEmail.trim() || !isValidEmail(newEmail)) {
      alert('Por favor, informe um E-mail válido (ex: paciente@dominio.com). O campo é obrigatório.');
      return;
    }

    const selectedClinic = clinics.find(c => c.id === newClinicId);
    const isParticular = !newInsurance || newInsurance === 'Particular';

    const created = addPatient({
      name: newName,
      cpf: formatCPF(newCpf) || '000.000.000-00',
      phone: newPhone,
      email: newEmail,
      birthDate: newBirthDate || '1990-01-01',
      gender: newGender,
      healthInsurance: newInsurance || 'Particular',
      insuranceNumber: isParticular ? '' : newInsuranceNumber.trim(),
      photoUrl: newPhotoUrl || undefined,
      preferredClinicId: selectedClinic?.id,
      preferredClinicName: selectedClinic?.name,
      preferredDentistName: newDentistName,
      address: {
        street: newAddress.street || 'Rua Principal',
        number: newAddress.number || '100',
        neighborhood: newAddress.neighborhood || 'Centro',
        city: newAddress.city || 'São Paulo',
        state: newAddress.state || 'SP',
        cep: newAddress.cep || '01000-000',
        complement: newAddress.complement || undefined
      },
      anamnesis: {
        hasAllergies,
        allergyDetails: hasAllergies ? allergyDetails : undefined,
        hasHeartDisease: false,
        hasDiabetes,
        hasHypertension,
        isPregnant,
        bleedingDisorder: false,
        notes: anamnesisNotes
      },
      status: 'ativo'
    });

    // Reset form
    setNewName('');
    setNewCpf('');
    setNewPhone('');
    setNewEmail('');
    setNewBirthDate('');
    setNewInsurance('Particular');
    setNewInsuranceNumber('');
    setNewPhotoUrl('');
    setNewAddress({
      cep: '',
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: ''
    });
    setHasAllergies(false);
    setAllergyDetails('');
    setHasDiabetes(false);
    setHasHypertension(false);
    setIsPregnant(false);
    setAnamnesisNotes('');
    setIsNewPatientModalOpen(false);

    // Select new patient
    setSelectedPatientId(created.id);
  };

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return '';
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return `${age} anos`;
  };

  // Filter patient appointments and documents
  const patientAppointments = appointments.filter(a => a.patientId === selectedPatientId);
  const patientPrescriptions = prescriptions.filter(r => r.patientId === selectedPatientId);
  const patientDocs = savedClinicDocuments ? savedClinicDocuments.filter(doc => 
    doc.patientId === selectedPatientId || 
    (selectedPatient && doc.patientName && doc.patientName.toLowerCase().trim() === selectedPatient.name.toLowerCase().trim())
  ).sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()) : [];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${t.headingText} flex items-center gap-2 tracking-wide`}>
            <Users className={`w-7 h-7 ${t.accentText}`} />
            Pacientes & Prontuário Clínico
          </h1>
          <p className="text-xs opacity-75">Gerencie ficha cadastral, história médica, odontograma e histórico de atendimento.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Cadastrar Novo Paciente as the First Button */}
          <button
            onClick={() => setIsNewPatientModalOpen(true)}
            className={`px-5 py-2.5 ${t.btnPrimaryBg} ${t.btnPrimaryText} font-bold text-xs rounded-2xl flex items-center justify-center gap-2 shadow-xs transition cursor-pointer`}
          >
            <Plus className="w-4 h-4" />
            Cadastrar Novo Paciente
          </button>

          {/* Yellow Print Button for Relatório de Atendimento */}
          <button
            type="button"
            onClick={() => {
              if (selectedPatient) {
                setIsReportModalOpen(true);
              } else if (patients.length > 0) {
                setSelectedPatientId(patients[0].id);
                setIsReportModalOpen(true);
              } else {
                alert('Nenhum paciente cadastrado.');
              }
            }}
            className="px-4 py-2.5 bg-amber-400 hover:bg-amber-500 text-stone-900 font-bold text-xs rounded-2xl flex items-center justify-center gap-2 shadow-xs transition cursor-pointer border border-amber-500/30"
            title="Imprimir Relatório de Atendimento Unificado em ordem cronológica decrescente"
          >
            <Printer className="w-4 h-4 text-stone-900" />
            <span>Imprimir Relatório de Atendimento</span>
          </button>

          <button
            onClick={() => setActiveTab('triagem')}
            className="px-4 py-2.5 bg-[#25d366] hover:bg-[#20bd5a] text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
          >
            <Bot className="w-4 h-4 text-white" />
            WhatsApp
          </button>

          <label className={`px-4 py-2.5 ${t.btnSecondaryBg} ${t.btnSecondaryText} hover:opacity-90 font-bold text-xs rounded-2xl flex items-center gap-2 shadow-xs cursor-pointer transition border ${t.cardBorder}`}>
            <Upload className={`w-4 h-4 ${t.accentText}`} />
            Importar CSV
            <input
              type="file"
              accept=".csv,.txt"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    const text = event.target?.result as string;
                    if (text) {
                      const lines = text.split('\n');
                      let count = 0;
                      lines.forEach((line, idx) => {
                        if (idx === 0) return;
                        const cols = line.split(';');
                        if (cols.length >= 2 && cols[0].trim()) {
                          addPatient({
                            name: cols[0].trim(),
                            cpf: cols[1]?.trim() || '000.000.000-00',
                            phone: cols[2]?.trim() || '(11) 99999-9999',
                            email: cols[3]?.trim() || 'paciente@email.com',
                            birthDate: '1990-01-01',
                            gender: 'masculino',
                            healthInsurance: 'Particular',
                            address: { street: 'Rua', number: '100', neighborhood: 'Centro', city: 'São Paulo', state: 'SP', cep: '01000-000' },
                            anamnesis: { hasAllergies: false, hasHeartDisease: false, hasDiabetes: false, hasHypertension: false, bleedingDisorder: false },
                            status: 'ativo'
                          });
                          count++;
                        }
                      });
                      alert(`${count} pacientes importados com sucesso via CSV!`);
                    }
                  };
                  reader.readAsText(file);
                }
              }}
            />
          </label>
        </div>
      </div>

      {/* Main Grid View (Left: Patient List, Right: Patient Profile / Odontogram) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Patient Directory Sidebar / List */}
        <div className={`lg:col-span-4 ${t.cardBg} border ${t.cardBorder} rounded-[32px] p-5 shadow-sm space-y-4`}>
          {/* Search & Filter */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Buscar por nome, CPF ou telefone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full ${t.inputBg} rounded-2xl pl-9 pr-3 py-2.5 text-xs placeholder-gray-400 focus:outline-none`}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500 px-1">
              <span>{filteredPatients.length} pacientes encontrados</span>
              <div className="flex items-center gap-1">
                <Filter className={`w-3 h-3 ${t.accentText}`} />
                <select 
                  value={filterInsurance} 
                  onChange={(e) => setFilterInsurance(e.target.value)}
                  className={`${t.inputBg} text-[11px] rounded-lg px-2 py-0.5 focus:outline-none`}
                >
                  <option value="todos">Todos</option>
                  <option value="particular">Particular</option>
                  <option value="convenio">Convênio</option>
                </select>
              </div>
            </div>
          </div>

          {/* List items */}
          <div className="space-y-2 max-h-[700px] overflow-y-auto pr-1">
            {filteredPatients.map(p => {
              const isSelected = selectedPatientId === p.id;
              const hasAlert = p.anamnesis?.hasAllergies || p.anamnesis?.isPregnant || p.anamnesis?.hasHeartDisease;

              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedPatientId(p.id)}
                  className={`
                    p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3
                    ${isSelected 
                      ? `${t.btnPrimaryBg} ${t.btnPrimaryText} shadow-xs border-transparent` 
                      : `${t.cardBg} ${t.cardBorder} ${t.cardText} hover:opacity-90`}
                  `}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    {p.photoUrl ? (
                      <img src={p.photoUrl} alt={p.name} className="w-10 h-10 rounded-full object-cover border border-amber-500 shrink-0" />
                    ) : (
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${isSelected ? 'bg-amber-500 text-white' : `${t.btnSecondaryBg} ${t.btnSecondaryText}`}`}>
                        {p.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="overflow-hidden">
                      <div className="flex items-center gap-1.5">
                        <h4 className={`font-bold text-xs truncate ${isSelected ? 'text-white' : t.headingText}`}>{p.name}</h4>
                        {hasAlert && <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" title="Alerta em Anamnese!" />}
                      </div>
                      <p className={`text-[11px] font-mono truncate ${isSelected ? 'opacity-90' : 'text-gray-500'}`}>
                        {p.phone} • {p.preferredClinicName || p.healthInsurance || 'Particular'}
                      </p>
                    </div>
                  </div>

                  <ChevronRight className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : 'text-gray-400'}`} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Patient Record & Detailed View */}
        <div className="lg:col-span-8 space-y-6">
          {selectedPatient ? (
            <>
              {/* Patient Profile Card Header */}
              <div className={`${t.cardBg} border ${t.cardBorder} rounded-[32px] p-6 shadow-sm space-y-4`}>
                <div className={`flex flex-col md:flex-row items-start justify-between gap-6 border-b ${t.cardBorder} pb-5`}>
                  {/* Left Column: Photo & Complete Patient Data Column */}
                  <div className="flex flex-col sm:flex-row items-start gap-4 flex-1">
                    {/* Patient Photo */}
                    <div className="relative group shrink-0">
                      {selectedPatient.photoUrl ? (
                        <img src={selectedPatient.photoUrl} alt={selectedPatient.name} className="w-20 h-20 rounded-2xl object-cover border-2 border-amber-500 shadow-xs" />
                      ) : (
                        <div className={`w-20 h-20 rounded-2xl ${t.btnPrimaryBg} flex items-center justify-center text-white font-bold text-3xl shadow-xs`}>
                          {selectedPatient.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="absolute -bottom-1 -right-1 flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setPatientCameraTarget('selected');
                            setIsPatientCameraOpen(true);
                          }}
                          className="bg-stone-800 text-white p-1 rounded-full shadow-xs hover:bg-stone-900 transition cursor-pointer"
                          title="Tirar foto com câmera"
                        >
                          <Camera className="w-3.5 h-3.5 text-amber-400" />
                        </button>
                        <label className={`p-1 rounded-full shadow-xs cursor-pointer ${t.btnSecondaryBg} ${t.btnSecondaryText} border ${t.cardBorder} transition`} title="Carregar foto de arquivo">
                          <Users className="w-3.5 h-3.5" />
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handlePhotoUpload(e, (url) => updatePatient(selectedPatient.id, { photoUrl: url }))}
                          />
                        </label>
                      </div>
                    </div>

                    {/* Patient Data Column (All Requested Fields in Harmonic Order) */}
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Nome Completo:</span>
                        <h2 className={`text-lg font-bold ${t.headingText}`}>{selectedPatient.name}</h2>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${t.btnSecondaryBg} ${t.btnSecondaryText} border ${t.cardBorder}`}>
                          {selectedPatient.status}
                        </span>
                      </div>

                      <div className="text-xs space-y-1 text-stone-700">
                        <p className="flex flex-wrap items-baseline gap-1">
                          <span className="font-bold text-stone-600">Endereço Completo:</span>
                          <span>{formatFullAddress(selectedPatient.address) || 'Não informado'}</span>
                        </p>

                        <p className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-stone-600">CPF:</span>
                          <span className="font-mono">{formatCPF(selectedPatient.cpf)}</span>
                        </p>

                        <p className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-stone-600">Data de Nascimento:</span>
                          <span>
                            {selectedPatient.birthDate ? new Date(selectedPatient.birthDate + 'T00:00:00').toLocaleDateString('pt-BR') : 'Não informada'}
                            {' '}(<strong>Idade:</strong> {calculateAge(selectedPatient.birthDate)})
                          </span>
                        </p>

                        <p className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-stone-600">E-mail:</span>
                          <span>{selectedPatient.email || 'Não informado'}</span>
                        </p>

                        {/* Plano (Exibição Limpa e Protegida) */}
                        <p className="flex flex-wrap items-center gap-2 pt-0.5">
                          <span className="font-bold text-stone-600">Plano:</span>
                          <span className="font-bold text-[#5a5a40] bg-[#f0f0e8] px-2.5 py-0.5 rounded-lg border border-[#e5e5d1]">
                            {selectedPatient.healthInsurance || 'Particular'}
                          </span>
                        </p>

                        {/* Carteirinha (Exibição Limpa e Protegida) */}
                        <p className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-stone-600">Carteirinha:</span>
                          {(!selectedPatient.healthInsurance || selectedPatient.healthInsurance === 'Particular') ? (
                            <span className="text-xs text-stone-400 italic bg-stone-100 dark:bg-stone-800/40 px-2.5 py-0.5 rounded-lg border border-stone-200 dark:border-stone-700 select-none">
                              Não aplicável (Particular)
                            </span>
                          ) : (
                            <span className="font-mono text-xs text-stone-700 font-bold bg-[#fbfbf9] px-2.5 py-0.5 rounded-lg border border-[#e5e5d1]">
                              {selectedPatient.insuranceNumber || 'Não informada'}
                            </span>
                          )}
                        </p>

                        <p className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-stone-600">Telefone:</span>
                          <span>{formatPhoneWithDDI(selectedPatient.phone)}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right Action Buttons: Interactive Pencil Edit & Single Document Button */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
                    {/* Interactive Patient Edit Button */}
                    <button
                      type="button"
                      onClick={() => openEditPatientModal(selectedPatient)}
                      className="px-4 py-2 bg-stone-800 hover:bg-stone-900 text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-2 shadow-2xs transition cursor-pointer"
                      title="Editar ficha e dados do paciente"
                    >
                      <Pencil className="w-4 h-4 text-amber-400" />
                      <span>Editar</span>
                    </button>

                    {/* Single Document Emit Button */}
                    <button
                      onClick={() => {
                        if (selectedPatient) {
                          setSelectedPatientId(selectedPatient.id);
                        }
                        setActiveTab('documentos');
                      }}
                      className={`px-4 py-2 ${t.btnPrimaryBg} ${t.btnPrimaryText} font-bold text-xs rounded-2xl flex items-center justify-center gap-2 shadow-2xs transition cursor-pointer`}
                    >
                      <FileText className="w-4 h-4 text-white" />
                      <span>Emitir Documento</span>
                    </button>
                  </div>
                </div>

                {/* Profile Tabs Navigation */}
                <div className={`flex items-center gap-2 overflow-x-auto border-b ${t.cardBorder} pb-2 text-xs`}>
                  <button
                    onClick={() => setActiveProfileTab('info')}
                    className={`px-4 py-2 rounded-2xl font-bold transition cursor-pointer ${activeProfileTab === 'info' ? `${t.btnPrimaryBg} ${t.btnPrimaryText}` : `${t.btnSecondaryBg} ${t.btnSecondaryText} hover:opacity-80`}`}
                  >
                    Ficha e Anamnese
                  </button>
                  <button
                    onClick={() => setActiveProfileTab('exame_clinico')}
                    className={`px-4 py-2 rounded-2xl font-bold transition flex items-center gap-1.5 cursor-pointer ${activeProfileTab === 'exame_clinico' ? `${t.btnPrimaryBg} ${t.btnPrimaryText}` : `${t.btnSecondaryBg} ${t.btnSecondaryText} hover:opacity-80`}`}
                  >
                    <Stethoscope className="w-4 h-4" />
                    Exame Clínico
                  </button>
                  <button
                    onClick={() => setActiveProfileTab('plano')}
                    className={`px-4 py-2 rounded-2xl font-bold transition flex items-center gap-1.5 cursor-pointer ${activeProfileTab === 'plano' ? `${t.btnPrimaryBg} ${t.btnPrimaryText}` : `${t.btnSecondaryBg} ${t.btnSecondaryText} hover:opacity-80`}`}
                  >
                    <FileCheck2 className="w-4 h-4" />
                    Plano de Tratamento
                  </button>
                  <button
                    onClick={() => setActiveProfileTab('evolucao')}
                    className={`px-4 py-2 rounded-2xl font-bold transition flex items-center gap-1.5 cursor-pointer ${activeProfileTab === 'evolucao' ? `${t.btnPrimaryBg} ${t.btnPrimaryText}` : `${t.btnSecondaryBg} ${t.btnSecondaryText} hover:opacity-80`}`}
                  >
                    <FileText className="w-4 h-4" />
                    Evolução Clínica
                  </button>
                  <button
                    onClick={() => setActiveProfileTab('financeiro')}
                    className={`px-4 py-2 rounded-2xl font-bold transition flex items-center gap-1.5 cursor-pointer ${activeProfileTab === 'financeiro' ? `${t.btnPrimaryBg} ${t.btnPrimaryText}` : `${t.btnSecondaryBg} ${t.btnSecondaryText} hover:opacity-80`}`}
                  >
                    <DollarSign className="w-4 h-4" />
                    Financeiro
                  </button>
                  <button
                    onClick={() => setActiveProfileTab('consultas')}
                    className={`px-4 py-2 rounded-2xl font-bold transition flex items-center gap-1.5 cursor-pointer ${activeProfileTab === 'consultas' ? `${t.btnPrimaryBg} ${t.btnPrimaryText}` : `${t.btnSecondaryBg} ${t.btnSecondaryText} hover:opacity-80`}`}
                  >
                    <Calendar className="w-4 h-4" />
                    Consulta ({patientAppointments.length})
                  </button>
                  <button
                    onClick={() => setActiveProfileTab('documentos')}
                    className={`px-4 py-2 rounded-2xl font-bold transition flex items-center gap-1.5 cursor-pointer ${activeProfileTab === 'documentos' ? `${t.btnPrimaryBg} ${t.btnPrimaryText}` : `${t.btnSecondaryBg} ${t.btnSecondaryText} hover:opacity-80`}`}
                  >
                    <FileText className="w-4 h-4" />
                    Receitas & Documentos ({patientDocs.length})
                  </button>
                  <button
                    onClick={() => setActiveProfileTab('galeria')}
                    className={`px-4 py-2 rounded-2xl font-bold transition flex items-center gap-1.5 cursor-pointer ${activeProfileTab === 'galeria' ? `${t.btnPrimaryBg} ${t.btnPrimaryText}` : `${t.btnSecondaryBg} ${t.btnSecondaryText} hover:opacity-80`}`}
                  >
                    <ImageIcon className="w-4 h-4" />
                    Fotos & Mídia ({(selectedPatient.images || []).length})
                  </button>
                </div>

                {/* Tab Content 1: Ficha & Anamnese */}
                {activeProfileTab === 'info' && (
                  <div className="space-y-5 pt-2">
                    {/* Comprehensive Medical and Dental Anamnesis Box */}
                    <div className={`${t.cardBg} p-5 rounded-3xl border ${t.cardBorder} space-y-4 shadow-2xs`}>
                      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b ${t.cardBorder} pb-3`}>
                        <div>
                          <h3 className={`text-sm font-bold ${t.headingText} uppercase tracking-wider flex items-center gap-2`}>
                            <Stethoscope className={`w-4 h-4 ${t.accentText}`} />
                            Prontuário médico
                          </h3>
                          <p className="text-xs opacity-75">Estado de saúde geral, hábitos e queixas específicas do paciente.</p>
                        </div>

                        <button
                          onClick={() => setIsAnamnesisModalOpen(true)}
                          className={`px-4 py-2 ${t.btnPrimaryBg} ${t.btnPrimaryText} text-xs font-bold rounded-2xl flex items-center gap-1.5 shadow-2xs transition cursor-pointer self-start sm:self-auto`}
                        >
                          <Stethoscope className="w-4 h-4" />
                          Preencher / Editar Prontuário Médico
                        </button>
                      </div>
                      
                      {/* Safety Alerts Summary */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        <div className={`p-2.5 rounded-xl border ${selectedPatient.anamnesis?.hasAllergies ? 'bg-rose-50 border-rose-200 text-rose-800 font-bold' : `${t.cardBg} ${t.cardBorder} ${t.cardText}`}`}>
                          Alergias: <strong>{selectedPatient.anamnesis?.hasAllergies ? 'SIM' : 'Não'}</strong>
                        </div>
                        <div className={`p-2.5 rounded-xl border ${selectedPatient.anamnesis?.usesBisphosphonates ? 'bg-rose-50 border-rose-300 text-rose-900 font-bold' : `${t.cardBg} ${t.cardBorder} ${t.cardText}`}`}>
                          Bisfosfonatos: <strong>{selectedPatient.anamnesis?.usesBisphosphonates ? 'SIM' : 'Não'}</strong>
                        </div>
                        <div className={`p-2.5 rounded-xl border ${selectedPatient.anamnesis?.hasDiabetes ? 'bg-amber-50 border-amber-200 text-amber-800 font-bold' : `${t.cardBg} ${t.cardBorder} ${t.cardText}`}`}>
                          Diabetes: <strong>{selectedPatient.anamnesis?.hasDiabetes ? 'SIM' : 'Não'}</strong>
                        </div>
                        <div className={`p-2.5 rounded-xl border ${selectedPatient.anamnesis?.hasHypertension ? 'bg-amber-50 border-amber-200 text-amber-800 font-bold' : `${t.cardBg} ${t.cardBorder} ${t.cardText}`}`}>
                          Hipertensão: <strong>{selectedPatient.anamnesis?.hasHypertension ? 'SIM' : 'Não'}</strong>
                        </div>
                      </div>

                      {/* Detail Badges for Medical, Dental, and Epidemiological History */}
                      <div className="space-y-2 text-xs">
                        {selectedPatient.anamnesis?.allergyDetails && (
                          <p className="text-rose-800 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                            ⚠️ Alergias Informadas: <strong>{selectedPatient.anamnesis.allergyDetails}</strong>
                          </p>
                        )}

                        {selectedPatient.anamnesis?.continuousMedication && (
                          <p className={`p-2.5 rounded-xl border ${t.cardBg} ${t.cardBorder} ${t.cardText}`}>
                            💊 Medicamentos de Uso Contínuo: <strong>{selectedPatient.anamnesis.continuousMedication}</strong>
                          </p>
                        )}

                        {/* 4 Pillars Summary Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                          {/* 1. Identificação e Demografia */}
                          {(selectedPatient.anamnesis?.ethnicity || selectedPatient.anamnesis?.profession || selectedPatient.anamnesis?.occupationalRisks || selectedPatient.anamnesis?.endemicAreaExposure) && (
                            <div className="p-3 rounded-xl bg-white border border-[#e5e5d1] space-y-1 text-gray-700">
                              <span className="text-[10px] font-bold text-[#5a5a40] uppercase tracking-wider block">
                                📍 Demografia & Ocupação
                              </span>
                              {selectedPatient.anamnesis.ethnicity && (
                                <p className="text-[11px]">Etnia: <strong className="capitalize">{selectedPatient.anamnesis.ethnicity}</strong> {selectedPatient.anamnesis.ethnicityDetails && `(${selectedPatient.anamnesis.ethnicityDetails})`}</p>
                              )}
                              {selectedPatient.anamnesis.profession && (
                                <p className="text-[11px]">Profissão: <strong>{selectedPatient.anamnesis.profession}</strong></p>
                              )}
                              {selectedPatient.anamnesis.occupationalRisks && (
                                <p className="text-[11px] text-amber-800">Risco Ocupacional: {selectedPatient.anamnesis.occupationalRisks}</p>
                              )}
                              {selectedPatient.anamnesis.endemicAreaExposure && (
                                <p className="text-[11px] text-amber-800">Áreas Endêmicas: {selectedPatient.anamnesis.endemicAreaExposure}</p>
                              )}
                            </div>
                          )}

                          {/* 2. Histórico Clínico & Imunológico */}
                          {(selectedPatient.anamnesis?.vaccinationDetails || selectedPatient.anamnesis?.comorbiditiesSummary || selectedPatient.anamnesis?.previousInfectionsHistory) && (
                            <div className="p-3 rounded-xl bg-white border border-[#e5e5d1] space-y-1 text-gray-700">
                              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                                💉 Imunização & Comorbidades
                              </span>
                              {selectedPatient.anamnesis.vaccinationDetails && (
                                <p className="text-[11px]">Vacinas: <strong>{selectedPatient.anamnesis.vaccinationDetails}</strong></p>
                              )}
                              {selectedPatient.anamnesis.comorbiditiesSummary && (
                                <p className="text-[11px]">Comorbidades: <strong>{selectedPatient.anamnesis.comorbiditiesSummary}</strong></p>
                              )}
                              {selectedPatient.anamnesis.previousInfectionsHistory && (
                                <p className="text-[11px]">Infecções Prévias: <strong>{selectedPatient.anamnesis.previousInfectionsHistory}</strong></p>
                              )}
                            </div>
                          )}

                          {/* 3. Exposição & Comportamento */}
                          {(selectedPatient.anamnesis?.travelHistory || selectedPatient.anamnesis?.closeContactsInfectious || selectedPatient.anamnesis?.lifestyleDiet || selectedPatient.anamnesis?.environmentalExposure) && (
                            <div className="p-3 rounded-xl bg-white border border-[#e5e5d1] space-y-1 text-gray-700">
                              <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">
                                ✈️ Exposição & Vigilância
                              </span>
                              {selectedPatient.anamnesis.travelHistory && (
                                <p className="text-[11px]">Viagens Recentes: <strong>{selectedPatient.anamnesis.travelHistory}</strong></p>
                              )}
                              {selectedPatient.anamnesis.closeContactsInfectious && (
                                <p className="text-[11px] text-rose-700 font-semibold">Contato Infectocontagioso: {selectedPatient.anamnesis.closeContactsDetails || 'Sim'}</p>
                              )}
                              {selectedPatient.anamnesis.environmentalExposure && (
                                <p className="text-[11px] text-amber-800">Exposição Ambiental: {selectedPatient.anamnesis.environmentalExposureDetails || 'Sim'}</p>
                              )}
                              {selectedPatient.anamnesis.lifestyleDiet && (
                                <p className="text-[11px]">Dieta / Estilo de Vida: {selectedPatient.anamnesis.lifestyleDiet}</p>
                              )}
                            </div>
                          )}

                          {/* 4. Dados Genéticos e Familiares */}
                          {(selectedPatient.anamnesis?.familyMedicalHistory || selectedPatient.anamnesis?.geneticMarkers) && (
                            <div className="p-3 rounded-xl bg-white border border-[#e5e5d1] space-y-1 text-gray-700">
                              <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block">
                                🧬 Genética & Histórico Familiar
                              </span>
                              {selectedPatient.anamnesis.familyMedicalHistory && (
                                <p className="text-[11px]">Histórico Familiar (1º grau): <strong>{selectedPatient.anamnesis.familyHistoryDetails || 'Sim'}</strong></p>
                              )}
                              {selectedPatient.anamnesis.geneticMarkers && (
                                <p className="text-[11px] text-purple-900 font-semibold">Marcadores Genéticos: {selectedPatient.anamnesis.geneticMarkersDetails || 'Sim'}</p>
                              )}
                            </div>
                          )}
                        </div>

                        {selectedPatient.anamnesis?.chiefComplaint && (
                          <p className={`p-2.5 rounded-xl border ${t.cardBg} ${t.cardBorder} ${t.headingText}`}>
                            🦷 Queixa Principal: <strong>"{selectedPatient.anamnesis.chiefComplaint}"</strong>
                          </p>
                        )}

                        {selectedPatient.anamnesis?.notes && (
                          <p className={`italic p-2.5 rounded-xl border ${t.cardBg} ${t.cardBorder} opacity-80`}>
                            Observações do Cirurgião-Dentista: "{selectedPatient.anamnesis.notes}"
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Contact & Personal Data */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                      <div className={`${t.cardBg} p-4 rounded-2xl border ${t.cardBorder} space-y-2`}>
                        <span className="opacity-60 font-bold uppercase tracking-wider block text-[10px]">Contato</span>
                        <p className={`flex items-center gap-2 ${t.cardText}`}><Phone className={`w-3.5 h-3.5 ${t.accentText}`} /> {formatPhoneWithDDI(selectedPatient.phone)}</p>
                        <p className={`flex items-center gap-2 ${t.cardText}`}><Mail className={`w-3.5 h-3.5 ${t.accentText}`} /> {selectedPatient.email || 'Não informado'}</p>
                      </div>

                      <div className={`${t.cardBg} p-4 rounded-2xl border ${t.cardBorder} space-y-2`}>
                        <span className="opacity-60 font-bold uppercase tracking-wider block text-[10px]">Endereço</span>
                        <p className={t.cardText}>
                          {selectedPatient.address?.street || 'Rua não informada'}, {selectedPatient.address?.number || 'S/N'} - {selectedPatient.address?.neighborhood || ''}
                        </p>
                        <p className="opacity-75">{selectedPatient.address?.city || 'Cidade não informada'} - {selectedPatient.address?.state || ''} ({selectedPatient.address?.cep || ''})</p>
                      </div>

                      <div className={`${t.cardBg} p-4 rounded-2xl border ${t.cardBorder} space-y-2`}>
                        <span className="opacity-60 font-bold uppercase tracking-wider block text-[10px]">Plano & Convênio</span>
                        <p className={`font-bold ${t.headingText}`}>{selectedPatient.healthInsurance || 'Particular'}</p>
                        <p className="opacity-75">
                          Carteirinha: <span className="font-mono">{(!selectedPatient.healthInsurance || selectedPatient.healthInsurance === 'Particular') ? 'Não aplicável (Particular)' : (selectedPatient.insuranceNumber || 'Não informada')}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab Content 1.2: Exame Clínico */}
                {activeProfileTab === 'exame_clinico' && (
                  <ClinicalExamView patientIdOverride={selectedPatient.id} />
                )}

                {/* Tab Content 1.5: Plano de Tratamento */}
                {activeProfileTab === 'plano' && (
                  <TreatmentPlanManager patientId={selectedPatient.id} />
                )}

                {/* Tab Content 3: Evolução Clínica */}
                {activeProfileTab === 'evolucao' && (
                  <ClinicalEvolution 
                    patientId={selectedPatient.id} 
                    onOpenReport={() => setIsReportModalOpen(true)}
                  />
                )}

                {/* Tab Content 4: Consultas */}
                {activeProfileTab === 'consultas' && (
                  <div className="space-y-3 pt-2">
                    {patientAppointments.length === 0 ? (
                      <p className="text-xs text-gray-400 py-4 text-center">Nenhuma consulta cadastrada para este paciente.</p>
                    ) : (
                      patientAppointments.map(apt => (
                        <div key={apt.id} className={`${t.cardBg} p-3.5 rounded-2xl border ${t.cardBorder} flex items-center justify-between gap-3 text-xs`}>
                          <div>
                            <p className={`font-bold ${t.cardText}`}>{apt.procedure}</p>
                            <p className="opacity-75">{apt.date} às {apt.time} • {apt.dentistName}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${t.btnSecondaryBg} ${t.btnSecondaryText} border ${t.cardBorder}`}>
                              {apt.status.toUpperCase()}
                            </span>
                            <button
                              onClick={() => openWhatsAppForAppointment(apt)}
                              className="p-2 bg-[#25D366] text-white rounded-xl hover:bg-[#20bd5a] transition"
                              title="WhatsApp"
                            >
                              <MessageSquare className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Tab Content 5: Financeiro & Pagamentos */}
                {activeProfileTab === 'financeiro' && (
                  <div className="pt-2">
                    <PatientFinancialsTab patient={selectedPatient} />
                  </div>
                )}

                {/* Tab Content 6: Receitas e Documentos Emitidos */}
                {activeProfileTab === 'documentos' && (
                  <div className="space-y-4 pt-2">
                    <div className={`flex items-center justify-between pb-2 border-b ${t.cardBorder}`}>
                      <h3 className={`text-xs font-bold ${t.headingText} uppercase tracking-wider`}>Histórico de Receitas e Documentos Emitidos</h3>
                      <button
                        onClick={() => {
                          if (selectedPatient) {
                            setSelectedPatientId(selectedPatient.id);
                          }
                          setActiveTab('documentos');
                        }}
                        className={`px-4 py-2 ${t.btnPrimaryBg} ${t.btnPrimaryText} font-bold text-xs rounded-2xl flex items-center gap-1.5 shadow-xs transition cursor-pointer`}
                      >
                        <Plus className="w-4 h-4" />
                        Emitir Novo Documento / Receita
                      </button>
                    </div>

                    {patientDocs.length === 0 ? (
                      <div className={`${t.cardBg} p-8 rounded-2xl border ${t.cardBorder} text-center space-y-3`}>
                        <FileText className={`w-10 h-10 ${t.accentText} mx-auto opacity-60`} />
                        <p className="text-xs opacity-75 font-medium">Nenhum documento ou receita foi emitido para este paciente ainda.</p>
                        <button
                          onClick={() => {
                            if (selectedPatient) {
                              setSelectedPatientId(selectedPatient.id);
                            }
                            setActiveTab('documentos');
                          }}
                          className={`px-4 py-2 ${t.btnPrimaryBg} ${t.btnPrimaryText} font-bold text-xs rounded-2xl inline-flex items-center gap-1.5 shadow-xs transition cursor-pointer`}
                        >
                          <Plus className="w-4 h-4" />
                          Emitir Novo Documento
                        </button>
                      </div>
                    ) : (
                      patientDocs.map(doc => {
                        const dateStr = doc.formattedDateStr || doc.createdAt?.split('T')[0] || '';
                        
                        const handleWhatsApp = (e: React.MouseEvent) => {
                          e.stopPropagation();
                          const phoneDigits = selectedPatient?.phone ? selectedPatient.phone.replace(/\D/g, '') : '';
                          const cleanPhone = phoneDigits.length === 11 || phoneDigits.length === 10 ? `55${phoneDigits}` : phoneDigits;
                          
                          const msgText = `Olá ${selectedPatient?.name || ''}, segue a sua ${doc.title} emitida em ${dateStr}.\n\n📄 *Documento:* ${doc.title}\n👨‍⚕️ *Profissional:* ${doc.professionalName || ''}\n📝 *Resumo:* ${doc.summary || doc.subtitle || ''}\n\n📌 *Arquivo Anexo:* ${doc.title.replace(/\s+/g, '_')}.pdf`;
                          
                          const waUrl = cleanPhone 
                            ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msgText)}`
                            : `https://wa.me/?text=${encodeURIComponent(msgText)}`;

                          // Generate downloadable file attachment for WhatsApp
                          try {
                            const fileContent = `DOCUMENTO ODONTOLÓGICO - DENTISPRO\n\nDocumento: ${doc.title}\nData: ${dateStr}\nPaciente: ${selectedPatient?.name || doc.patientName}\nProfissional: ${doc.professionalName}\n\nRESUMO / CONTEÚDO:\n${doc.summary || doc.subtitle}\n\nSincronizado via DentisPro`;
                            const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
                            const fileUrl = URL.createObjectURL(blob);
                            const downloadLink = document.createElement('a');
                            downloadLink.href = fileUrl;
                            downloadLink.download = `${doc.title.replace(/\s+/g, '_')}_${selectedPatient?.name.replace(/\s+/g, '_') || 'documento'}.txt`;
                            document.body.appendChild(downloadLink);
                            downloadLink.click();
                            document.body.removeChild(downloadLink);
                          } catch (err) {
                            console.error('Erro ao preparar anexo:', err);
                          }

                          window.open(waUrl, '_blank');
                        };

                        const handlePrint = (e: React.MouseEvent) => {
                          e.stopPropagation();
                          if (selectedPatient) {
                            setSelectedPatientId(selectedPatient.id);
                          }
                          setActiveTab('documentos');
                          setTimeout(() => {
                            window.print();
                          }, 300);
                        };

                        const handleOpenDocShortcut = () => {
                          if (selectedPatient) {
                            setSelectedPatientId(selectedPatient.id);
                          }
                          setActiveTab('documentos');
                        };

                        return (
                          <div 
                            key={doc.id} 
                            onClick={handleOpenDocShortcut}
                            className={`${t.cardBg} p-4 rounded-2xl border ${t.cardBorder} space-y-3 text-xs transition cursor-pointer shadow-2xs hover:shadow-md group`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className={`font-bold ${t.headingText} flex items-center gap-2 text-sm transition`}>
                                <FileText className={`w-4 h-4 ${t.accentText}`} />
                                {doc.title} • <span className="text-xs font-normal opacity-60 font-mono">{dateStr}</span>
                              </span>
                              <span className={`text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full font-bold ${t.btnSecondaryBg} ${t.btnSecondaryText}`}>
                                {doc.category}
                              </span>
                            </div>

                            <div className="pl-3 border-l-2 border-amber-500 space-y-1">
                              <p className={`${t.cardText} font-medium leading-relaxed`}>{doc.summary || doc.subtitle}</p>
                              {doc.professionalName && (
                                <p className="text-[11px] opacity-75">Profissional: <span className="font-semibold">{doc.professionalName}</span></p>
                              )}
                            </div>

                            {/* Direct Action Buttons for Print and WhatsApp */}
                            <div className={`flex items-center justify-between pt-2 border-t ${t.cardBorder}`}>
                              <span className={`text-[11px] font-semibold ${t.headingText} group-hover:underline flex items-center gap-1`}>
                                Clique para abrir na aba Documentos →
                              </span>

                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={handlePrint}
                                  className={`px-3 py-1.5 ${t.btnSecondaryBg} ${t.btnSecondaryText} border ${t.cardBorder} font-bold text-xs rounded-xl flex items-center gap-1.5 transition shadow-2xs cursor-pointer`}
                                  title="Imprimir este documento"
                                >
                                  <Printer className="w-3.5 h-3.5" />
                                  <span>Imprimir</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={handleWhatsApp}
                                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                                  title="Enviar documento via WhatsApp com anexo preenchido"
                                >
                                  <Send className="w-3.5 h-3.5 text-white" />
                                  <span>WhatsApp</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}

                {/* Tab Content 7: Galeria Unificada de Fotos & Mídia do Prontuário */}
                {activeProfileTab === 'galeria' && (
                  <div className="space-y-4 pt-2">
                    <ImageGalleryWithEditor
                      title="Galeria Unificada do Prontuário"
                      description="Banco de imagens centralizado deste paciente. Fotos de exames clínicos (extraoral, intraoral, odontograma), radiografias e procedimentos realizados são compartilhados e persistem neste prontuário."
                      images={selectedPatient.images || []}
                      onUpdateImages={(newImgs) => updatePatient(selectedPatient.id, { images: newImgs })}
                    />
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="bg-white border border-[#e5e5d1] rounded-[32px] p-12 text-center text-gray-400 space-y-2 shadow-sm">
              <Users className="w-10 h-10 mx-auto text-[#d4a373]" />
              <p className="text-sm font-semibold text-[#5a5a40]">Selecione um paciente na lista para visualizar seu prontuário</p>
              <p className="text-xs text-gray-400">Ou clique em "Cadastrar Novo Paciente" para adicionar um registro.</p>
            </div>
          )}
        </div>
      </div>

      {/* NEW PATIENT REGISTRATION MODAL */}
      {isNewPatientModalOpen && (
        <div className={`fixed inset-0 z-50 ${t.overlayBg} flex items-center justify-center p-4`}>
          <div className={`${t.modalBg} border ${t.modalBorder} rounded-[32px] max-w-xl w-full p-6 shadow-2xl overflow-y-auto max-h-[90vh] space-y-5`}>
            <div className={`flex items-center justify-between border-b ${t.modalBorder} pb-3`}>
              <h3 className={`text-lg font-bold ${t.modalText} flex items-center gap-2`}>
                <Plus className={`w-5 h-5 ${t.accentText}`} />
                Cadastrar Novo Paciente
              </h3>
              <button onClick={() => setIsNewPatientModalOpen(false)} className={`${t.modalMutedText} hover:opacity-100`}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePatient} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className={`block text-xs font-semibold ${t.modalMutedText} mb-1`}>Nome Completo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Maria de Souza Ribeiro"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className={`w-full ${t.inputBg} rounded-2xl px-3.5 py-2.5 text-xs focus:outline-none`}
                  />
                </div>

                <div>
                  <PhoneInputWithDDI
                    label="Telefone / WhatsApp (DDI) *"
                    required
                    value={newPhone}
                    onChange={(val) => setNewPhone(val)}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-semibold ${t.modalMutedText} mb-1`}>CPF</label>
                  <input
                    type="text"
                    placeholder="000.000.000-00"
                    maxLength={14}
                    value={newCpf}
                    onChange={(e) => setNewCpf(formatCPF(e.target.value))}
                    className={`w-full ${t.inputBg} rounded-2xl px-3.5 py-2.5 text-xs focus:outline-none font-mono`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-semibold ${t.modalMutedText} mb-1`}>Data de Nascimento *</label>
                  <input
                    type="date"
                    required
                    value={newBirthDate}
                    onChange={(e) => setNewBirthDate(e.target.value)}
                    className={`w-full ${t.inputBg} rounded-2xl px-3.5 py-2.5 text-xs focus:outline-none`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-semibold ${t.modalMutedText} mb-1`}>E-mail (Para Notificações) *</label>
                  <input
                    type="email"
                    required
                    placeholder="paciente@email.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className={`w-full ${t.inputBg} rounded-2xl px-3.5 py-2.5 text-xs focus:outline-none`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-semibold ${t.modalMutedText} mb-1`}>Plano / Convênio de Saúde</label>
                  <select
                    value={newInsurance}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === 'NEW_PLAN') {
                        setIsAddInsuranceModalOpen(true);
                      } else {
                        setNewInsurance(val);
                        if (val === 'Particular') {
                          setNewInsuranceNumber('');
                        }
                      }
                    }}
                    className={`w-full ${t.inputBg} rounded-2xl px-3.5 py-2.5 text-xs focus:outline-none font-bold`}
                  >
                    {Array.from(new Set([...availableInsurances, 'Particular'])).map(plan => (
                      <option key={plan} value={plan}>{plan}</option>
                    ))}
                    <option value="NEW_PLAN">+ Cadastrar Novo Convênio...</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-xs font-semibold ${t.modalMutedText} mb-1`}>Número da Carteirinha</label>
                  <input
                    type="text"
                    disabled={!newInsurance || newInsurance === 'Particular'}
                    placeholder={(!newInsurance || newInsurance === 'Particular') ? 'Não aplicável para Particular' : 'Digite o número da carteirinha'}
                    value={(!newInsurance || newInsurance === 'Particular') ? '' : newInsuranceNumber}
                    onChange={(e) => setNewInsuranceNumber(e.target.value)}
                    className={`w-full ${t.inputBg} rounded-2xl px-3.5 py-2.5 text-xs focus:outline-none font-mono ${
                      (!newInsurance || newInsurance === 'Particular') ? 'opacity-50 cursor-not-allowed bg-stone-100 dark:bg-stone-800 select-none' : ''
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-semibold ${t.modalMutedText} mb-1`}>Unidade / Clínica Preferencial</label>
                  <select
                    value={newClinicId}
                    onChange={(e) => setNewClinicId(e.target.value)}
                    className={`w-full ${t.inputBg} rounded-2xl px-3.5 py-2.5 text-xs focus:outline-none`}
                  >
                    {clinics.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-xs font-semibold ${t.modalMutedText} mb-1`}>Dentista Preferencial</label>
                  <select
                    value={newDentistName}
                    onChange={(e) => setNewDentistName(e.target.value)}
                    className={`w-full ${t.inputBg} rounded-2xl px-3.5 py-2.5 text-xs focus:outline-none`}
                  >
                    {professionals.map(p => (
                      <option key={p.id} value={p.name}>{p.name} ({p.specialty})</option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className={`block text-xs font-semibold ${t.modalMutedText} mb-1`}>Foto / Imagem do Paciente</label>
                  <div className="flex flex-wrap items-center gap-3">
                    {newPhotoUrl ? (
                      <img src={newPhotoUrl} alt="Preview" className={`w-10 h-10 rounded-full object-cover border ${t.cardBorder}`} />
                    ) : (
                      <div className={`w-10 h-10 rounded-full ${t.inputBg} flex items-center justify-center text-xs opacity-60`}>Sem Foto</div>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setPatientCameraTarget('new');
                        setIsPatientCameraOpen(true);
                      }}
                      className={`px-3 py-1.5 ${t.btnPrimaryBg} ${t.btnPrimaryText} font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer`}
                    >
                      <Camera className={`w-3.5 h-3.5 ${t.accentText}`} /> Tirar Foto com Câmera
                    </button>

                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handlePhotoUpload(e, (url) => setNewPhotoUrl(url))}
                      className="text-xs opacity-75 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:bg-stone-500/10 hover:file:opacity-80 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Patient Address Fields with CEP Auto-lookup */}
              <div className={`${t.cardBg} p-4 rounded-2xl border ${t.cardBorder} space-y-2`}>
                <h4 className={`text-xs font-bold ${t.modalText} uppercase tracking-wider`}>Endereço Residencial do Paciente</h4>
                <AddressFields
                  address={newAddress}
                  onChange={setNewAddress}
                  theme="olive"
                  compact
                />
              </div>

              {/* Anamnesis Quick Toggles */}
              <div className={`${t.cardBg} p-4 rounded-2xl border ${t.cardBorder} space-y-3`}>
                <h4 className={`text-xs font-bold ${t.modalText} uppercase tracking-wider`}>Anamnese de Saúde Rápida</h4>
                
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasAllergies}
                      onChange={(e) => setHasAllergies(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <span>Possui Alergia a Medicamentos?</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasDiabetes}
                      onChange={(e) => setHasDiabetes(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <span>Diabetes?</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasHypertension}
                      onChange={(e) => setHasHypertension(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <span>Hipertensão / Pressão Alta?</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isPregnant}
                      onChange={(e) => setIsPregnant(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <span>Gestante?</span>
                  </label>
                </div>

                {hasAllergies && (
                  <input
                    type="text"
                    placeholder="Especifique a alergia (Ex: Penicilina, Anestésico com Epinefrina...)"
                    value={allergyDetails}
                    onChange={(e) => setAllergyDetails(e.target.value)}
                    className="w-full bg-rose-500/10 border border-rose-500/30 rounded-2xl px-3.5 py-2 text-xs text-rose-500 focus:outline-none"
                  />
                )}
              </div>

              <div className={`flex items-center justify-between gap-3 pt-3 border-t ${t.modalBorder} flex-wrap`}>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsNewPatientModalOpen(false)}
                    className={`px-4 py-2 border ${t.cardBorder} text-xs font-semibold ${t.btnSecondaryText} ${t.btnSecondaryBg} rounded-2xl transition cursor-pointer flex items-center gap-1.5`}
                  >
                    <ArrowLeft className="w-4 h-4" /> Voltar
                  </button>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-2xl transition cursor-pointer flex items-center gap-1.5 border border-[#e5e5d1]"
                  >
                    <Printer className="w-4 h-4 text-[#5a5a40]" /> Imprimir
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsNewPatientModalOpen(false)}
                    className={`px-4 py-2 ${t.btnSecondaryBg} ${t.btnSecondaryText} font-bold text-xs rounded-2xl cursor-pointer`}
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    className={`px-5 py-2 ${t.btnPrimaryBg} ${t.btnPrimaryText} font-bold text-xs rounded-2xl shadow-xs cursor-pointer`}
                  >
                    Salvar Paciente
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Anamnesis Medical and Dental Questionnaire Modal */}
      {selectedPatient && (
        <AnamnesisModal
          patient={selectedPatient}
          isOpen={isAnamnesisModalOpen}
          onClose={() => setIsAnamnesisModalOpen(false)}
          onSave={(updatedAnamnesis) => {
            updatePatient(selectedPatient.id, {
              anamnesis: updatedAnamnesis
            });
          }}
        />
      )}
      {/* Patient Photo Camera Modal */}
      <CameraModal
        isOpen={isPatientCameraOpen}
        onClose={() => setIsPatientCameraOpen(false)}
        onCapture={(dataUrl) => {
          if (patientCameraTarget === 'selected' && selectedPatient) {
            updatePatient(selectedPatient.id, { photoUrl: dataUrl });
          } else {
            setNewPhotoUrl(dataUrl);
          }
          setIsPatientCameraOpen(false);
        }}
        title="Fotografia de Perfil do Paciente"
        subtitle="Fotografe o paciente em um ambiente bem iluminado"
        defaultFacingMode="user"
      />

      {/* Unified Patient Attendance Report Modal */}
      {selectedPatient && (
        <PatientAttendanceReportModal
          patient={selectedPatient}
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
        />
      )}

      {/* Modal para Cadastro de Novo Convênio */}
      {isAddInsuranceModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-[#e5e5d1]">
            <div className="flex items-center justify-between border-b border-[#e5e5d1] pb-3">
              <h3 className="text-sm font-bold text-[#2c3e2e] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#d4a373]" />
                Cadastrar Novo Convênio / Plano de Saúde
              </h3>
              <button
                type="button"
                onClick={() => setIsAddInsuranceModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#5a5a40] mb-1">
                  Nome do Convênio / Plano *
                </label>
                <input
                  type="text"
                  value={newInsuranceNameInput}
                  onChange={(e) => setNewInsuranceNameInput(e.target.value)}
                  placeholder="Ex: Bradesco Saúde, SulAmérica, etc."
                  className="w-full bg-white border border-[#e5e5d1] rounded-2xl px-3 py-2 text-xs font-bold text-[#2c2c2c] focus:outline-none focus:border-[#5a5a40]"
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#e5e5d1] flex-wrap">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddInsuranceModalOpen(false)}
                  className="px-3 py-2 text-xs font-bold text-gray-700 bg-stone-100 hover:bg-stone-200 rounded-xl cursor-pointer flex items-center gap-1 border border-stone-300"
                >
                  <ArrowLeft className="w-4 h-4" /> Voltar
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-2 text-xs font-bold text-stone-800 bg-stone-100 hover:bg-stone-200 rounded-xl cursor-pointer flex items-center gap-1 border border-[#e5e5d1]"
                >
                  <Printer className="w-4 h-4 text-[#5a5a40]" /> Imprimir
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddInsuranceModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-500 hover:bg-stone-100 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!newInsuranceNameInput.trim()) {
                      alert('Por favor, informe o nome do convênio.');
                      return;
                    }
                    const name = newInsuranceNameInput.trim();
                    if (!availableInsurances.includes(name)) {
                      setAvailableInsurances(prev => [...prev, name]);
                    }
                    if (selectedPatient) {
                      updatePatient(selectedPatient.id, { healthInsurance: name });
                    }
                    setNewInsuranceNameInput('');
                    setIsAddInsuranceModalOpen(false);
                  }}
                  className="px-5 py-2 bg-[#5a5a40] hover:bg-[#2c3e2e] text-white font-bold text-xs rounded-xl cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  Cadastrar e Selecionar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para Edição do Paciente */}
      {isEditPatientModalOpen && selectedPatient && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className={`${t.modalBg} border ${t.modalBorder} rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto`}>
            <div className={`flex items-center justify-between border-b ${t.modalBorder} pb-3`}>
              <h3 className={`text-sm font-bold ${t.modalText} flex items-center gap-2`}>
                <Pencil className="w-4 h-4 text-amber-500" />
                Editar Ficha e Dados do Paciente
              </h3>
              <button
                type="button"
                onClick={() => setIsEditPatientModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdatePatientSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="sm:col-span-2">
                  <label className={`block text-xs font-semibold ${t.modalMutedText} mb-1`}>Nome Completo *</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className={`w-full ${t.inputBg} rounded-2xl px-3.5 py-2.5 text-xs focus:outline-none font-bold`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-semibold ${t.modalMutedText} mb-1`}>CPF</label>
                  <input
                    type="text"
                    maxLength={14}
                    value={editCpf}
                    onChange={(e) => setEditCpf(formatCPF(e.target.value))}
                    className={`w-full ${t.inputBg} rounded-2xl px-3.5 py-2.5 text-xs focus:outline-none font-mono`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-semibold ${t.modalMutedText} mb-1`}>Data de Nascimento *</label>
                  <input
                    type="date"
                    required
                    value={editBirthDate}
                    onChange={(e) => setEditBirthDate(e.target.value)}
                    className={`w-full ${t.inputBg} rounded-2xl px-3.5 py-2.5 text-xs focus:outline-none`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-semibold ${t.modalMutedText} mb-1`}>Gênero</label>
                  <select
                    value={editGender}
                    onChange={(e) => setEditGender(e.target.value as Gender)}
                    className={`w-full ${t.inputBg} rounded-2xl px-3.5 py-2.5 text-xs focus:outline-none`}
                  >
                    <option value="masculino">Masculino</option>
                    <option value="feminino">Feminino</option>
                    <option value="outro">Outro</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-xs font-semibold ${t.modalMutedText} mb-1`}>Telefone / WhatsApp *</label>
                  <input
                    type="text"
                    required
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className={`w-full ${t.inputBg} rounded-2xl px-3.5 py-2.5 text-xs focus:outline-none font-mono`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-semibold ${t.modalMutedText} mb-1`}>E-mail</label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className={`w-full ${t.inputBg} rounded-2xl px-3.5 py-2.5 text-xs focus:outline-none`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-semibold ${t.modalMutedText} mb-1`}>Plano / Convênio de Saúde</label>
                  <select
                    value={editInsurance}
                    onChange={(e) => {
                      const val = e.target.value;
                      setEditInsurance(val);
                      if (val === 'Particular') {
                        setEditInsuranceNumber('');
                      }
                    }}
                    className={`w-full ${t.inputBg} rounded-2xl px-3.5 py-2.5 text-xs focus:outline-none font-bold`}
                  >
                    {Array.from(new Set([...availableInsurances, editInsurance])).map(plan => (
                      <option key={plan} value={plan}>{plan}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-xs font-semibold ${t.modalMutedText} mb-1`}>Número da Carteirinha</label>
                  <input
                    type="text"
                    disabled={!editInsurance || editInsurance === 'Particular'}
                    placeholder={(!editInsurance || editInsurance === 'Particular') ? 'Não aplicável para Particular' : 'Digite o número da carteirinha'}
                    value={(!editInsurance || editInsurance === 'Particular') ? '' : editInsuranceNumber}
                    onChange={(e) => setEditInsuranceNumber(e.target.value)}
                    className={`w-full ${t.inputBg} rounded-2xl px-3.5 py-2.5 text-xs focus:outline-none font-mono ${
                      (!editInsurance || editInsurance === 'Particular') ? 'opacity-50 cursor-not-allowed bg-stone-100 dark:bg-stone-800 select-none' : ''
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-semibold ${t.modalMutedText} mb-1`}>Status do Cadastro</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as 'ativo' | 'inativo')}
                    className={`w-full ${t.inputBg} rounded-2xl px-3.5 py-2.5 text-xs focus:outline-none font-bold`}
                  >
                    <option value="ativo">Ativo</option>
                    <option value="inativo">Inativo</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-xs font-semibold ${t.modalMutedText} mb-1`}>Unidade Preferencial</label>
                  <select
                    value={editClinicId}
                    onChange={(e) => setEditClinicId(e.target.value)}
                    className={`w-full ${t.inputBg} rounded-2xl px-3.5 py-2.5 text-xs focus:outline-none`}
                  >
                    {clinics.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-xs font-semibold ${t.modalMutedText} mb-1`}>Dentista Responsável</label>
                  <select
                    value={editDentistName}
                    onChange={(e) => setEditDentistName(e.target.value)}
                    className={`w-full ${t.inputBg} rounded-2xl px-3.5 py-2.5 text-xs focus:outline-none`}
                  >
                    {professionals.map(p => (
                      <option key={p.id} value={p.name}>{p.name} ({p.specialty})</option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className={`block text-xs font-semibold ${t.modalMutedText} mb-1`}>Foto / Imagem do Paciente</label>
                  <div className="flex flex-wrap items-center gap-3">
                    {editPhotoUrl ? (
                      <img src={editPhotoUrl} alt="Preview" className={`w-10 h-10 rounded-full object-cover border ${t.cardBorder}`} />
                    ) : (
                      <div className={`w-10 h-10 rounded-full ${t.inputBg} flex items-center justify-center text-xs opacity-60`}>Sem Foto</div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handlePhotoUpload(e, (url) => setEditPhotoUrl(url))}
                      className="text-xs opacity-75 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:bg-stone-500/10 hover:file:opacity-80 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Patient Address Fields */}
              <div className={`${t.cardBg} p-4 rounded-2xl border ${t.cardBorder} space-y-2`}>
                <h4 className={`text-xs font-bold ${t.modalText} uppercase tracking-wider`}>Endereço Residencial do Paciente</h4>
                <AddressFields
                  address={editAddress}
                  onChange={setEditAddress}
                  theme="olive"
                  compact
                />
              </div>

              <div className={`flex items-center justify-between gap-3 pt-3 border-t ${t.modalBorder} flex-wrap`}>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditPatientModalOpen(false)}
                    className={`px-4 py-2 border ${t.cardBorder} text-xs font-semibold ${t.btnSecondaryText} ${t.btnSecondaryBg} rounded-2xl transition cursor-pointer flex items-center gap-1.5`}
                  >
                    <ArrowLeft className="w-4 h-4" /> Voltar
                  </button>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-2xl transition cursor-pointer flex items-center gap-1.5 border border-[#e5e5d1]"
                  >
                    <Printer className="w-4 h-4 text-[#5a5a40]" /> Imprimir
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditPatientModalOpen(false)}
                    className={`px-4 py-2 ${t.btnSecondaryBg} ${t.btnSecondaryText} font-bold text-xs rounded-2xl cursor-pointer`}
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    className={`px-5 py-2 ${t.btnPrimaryBg} ${t.btnPrimaryText} font-bold text-xs rounded-2xl shadow-xs cursor-pointer flex items-center gap-1.5`}
                  >
                    <Check className="w-4 h-4" />
                    Salvar Alterações
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
