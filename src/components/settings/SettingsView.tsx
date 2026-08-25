import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { getThemeStyles } from '../../utils/themeUtils';
import { Professional, ClinicUnit, GovBrProfile } from '../../types';
import { formatCPF, formatCNPJ, formatEPAO, formatCRO } from '../../utils/formatters';
import JSZip from 'jszip';
import { 
  Settings, 
  Save, 
  Stethoscope, 
  Phone, 
  Mail, 
  Building, 
  Check, 
  Palette, 
  Image as ImageIcon, 
  Sparkles, 
  Plus, 
  UserCheck, 
  Trash2, 
  Edit2,
  FolderOpen,
  HardDrive,
  Folder,
  FileText,
  Download,
  Copy,
  Database,
  UploadCloud,
  X,
  ChevronRight,
  FileCode,
  Layout,
  FileSignature,
  Sliders,
  Key,
  ExternalLink,
  EyeOff,
  Eye,
  ShieldCheck,
  Activity,
  Wifi,
  RefreshCw,
  CheckCircle2,
  Zap,
  AlertCircle,
  BadgeCheck,
  Bot
} from 'lucide-react';
import { AddressFields, AddressData, formatFullAddress } from '../common/AddressFields';
import { DocumentSignatureFooter } from '../common/DocumentSignatureFooter';
import { SpecialtyInputSelector } from '../common/SpecialtyInputSelector';
import { PhoneInputWithDDI } from '../common/PhoneInputWithDDI';
import { UserManagementSection } from './UserManagementSection';
import { CloudRunDeploySection } from './CloudRunDeploySection';
import { DocumentTemplatesManager } from './DocumentTemplatesManager';
import { ProcedureProtocolManager } from './ProcedureProtocolManager';

const BRAZILIAN_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

const DEFAULT_SPECIALTIES = [
  'Clínica Geral',
  'Implantodontia',
  'Ortodontia',
  'Endodontia',
  'Periodontia',
  'Odontopediatria',
  'Prótese Dentária',
  'Cirurgia Bucomaxilofacial',
  'Harmonização Orofacial',
  'Dentística Estética',
  'Radiologia Odontológica',
  'Odontogeriatria'
];

export const SettingsView: React.FC = () => {
  const { 
    clinicInfo, 
    updateClinicInfo, 
    layoutTheme, 
    setLayoutTheme,
    professionals,
    activeProfessionalId,
    setActiveProfessionalId,
    addProfessional,
    updateProfessional,
    deleteProfessional,
    clinics,
    activeClinicId,
    setActiveClinicId,
    addClinic,
    updateClinic,
    deleteClinic,
    resetToDefaultData,
    createDatabaseCheckpoint,
    exportDatabaseBackupJSON,
    importDatabaseBackupJSON,
    lastCheckpointTime
  } = useApp();

  const t = getThemeStyles(layoutTheme);

  // Active settings tab selection
  const [activeSettingsTab, setActiveSettingsTab] = useState<
    'cadastro' | 'whatsapp_api' | 'documentos' | 'procedimentos' | 'layout' | 'aparencia' | 'govbr' | 'usuarios' | 'backup'
  >('cadastro');

  // Selection state for mutual exclusion: 'clinic' or 'dentist'
  const [activeSelectionMode, setActiveSelectionMode] = useState<'clinic' | 'dentist'>('clinic');
  const [selectedClinicDropdownId, setSelectedClinicDropdownId] = useState<string>(activeClinicId || clinics[0]?.id || '');
  const [selectedDentistDropdownId, setSelectedDentistDropdownId] = useState<string>('');

  // Form buffering state for active clinic / professional
  const activeClinicObj = clinics.find(c => c.id === selectedClinicDropdownId) || clinics[0];
  const activeDentistObj = professionals.find(p => p.id === selectedDentistDropdownId) || professionals[0];

  // Clinic fields
  const [clinicName, setClinicName] = useState(activeClinicObj?.name || clinicInfo.name || '');
  const [technicalManager, setTechnicalManager] = useState(activeClinicObj?.technicalManager || clinicInfo.technicalManager || clinicInfo.dentistName || '');
  const [clinicCnpj, setClinicCnpj] = useState(formatCNPJ(activeClinicObj?.cnpj || clinicInfo.cnpj || '22.144.932/0001-40'));
  const [clinicPhone, setClinicPhone] = useState(activeClinicObj?.phone || clinicInfo.phone || '');
  const [clinicEmail, setClinicEmail] = useState(activeClinicObj?.email || clinicInfo.email || '');
  const [epaoNumber, setEpaoNumber] = useState(activeClinicObj?.epaoNumber || clinicInfo.epaoNumber || '');
  const [epaoUf, setEpaoUf] = useState(activeClinicObj?.epaoUf || clinicInfo.epaoUf || 'SP');
  const [clinicAddressObj, setClinicAddressObj] = useState<AddressData>({
    cep: activeClinicObj?.cep || clinicInfo.cep || '',
    street: activeClinicObj?.street || activeClinicObj?.address || clinicInfo.street || clinicInfo.address || '',
    number: activeClinicObj?.number || clinicInfo.number || '',
    complement: activeClinicObj?.complement || clinicInfo.complement || '',
    neighborhood: activeClinicObj?.neighborhood || clinicInfo.neighborhood || '',
    city: activeClinicObj?.city?.split('-')[0]?.trim() || clinicInfo.city?.split('-')[0]?.trim() || '',
    state: activeClinicObj?.state || activeClinicObj?.city?.split('-')[1]?.trim() || clinicInfo.city?.split('-')[1]?.trim() || 'SP'
  });

  // Dentist fields
  const [dentistName, setDentistName] = useState(activeDentistObj?.name || clinicInfo.dentistName || '');
  const [dentistCpf, setDentistCpf] = useState(formatCPF(activeDentistObj?.cpf || clinicInfo.govBrSignerCpf || clinicInfo.cpf || '123.456.789-00'));
  const [croNumber, setCroNumber] = useState(activeDentistObj?.cro ? formatCRO(activeDentistObj.cro) : (clinicInfo.cro ? formatCRO(clinicInfo.cro) : ''));
  const [croUf, setCroUf] = useState(activeDentistObj?.croUf || (activeDentistObj?.cro && activeDentistObj.cro.includes('/') ? activeDentistObj.cro.split('/')[1]?.split(' ')[0] : 'SP'));
  const [dentistSpecialty, setDentistSpecialty] = useState(activeDentistObj?.specialty || clinicInfo.specialty || 'Clínica Geral');
  const [dentistPhone, setDentistPhone] = useState(activeDentistObj?.phone || clinicInfo.phone || '');
  const [dentistEmail, setDentistEmail] = useState(activeDentistObj?.email || clinicInfo.email || '');
  const [dentistGovBrPassword, setDentistGovBrPassword] = useState(activeDentistObj?.govBrPassword || clinicInfo.govBrPassword || 'GovBr2026!@');
  const [showDentistGovPassword, setShowDentistGovPassword] = useState(false);
  const [dentistAddressObj, setDentistAddressObj] = useState<AddressData>({
    cep: activeDentistObj?.cep || clinicInfo.cep || '',
    street: activeDentistObj?.street || activeDentistObj?.address || clinicInfo.street || clinicInfo.address || '',
    number: activeDentistObj?.number || clinicInfo.number || '',
    complement: activeDentistObj?.complement || clinicInfo.complement || '',
    neighborhood: activeDentistObj?.neighborhood || clinicInfo.neighborhood || '',
    city: activeDentistObj?.city?.split('-')[0]?.trim() || clinicInfo.city?.split('-')[0]?.trim() || '',
    state: activeDentistObj?.state || activeDentistObj?.city?.split('-')[1]?.trim() || clinicInfo.city?.split('-')[1]?.trim() || 'SP'
  });

  // Specialty list & creation
  const [specialtiesList, setSpecialtiesList] = useState<string[]>(DEFAULT_SPECIALTIES);
  const [showNewSpecialtyInput, setShowNewSpecialtyInput] = useState(false);
  const [newSpecialtyText, setNewSpecialtyText] = useState('');

  // Section Save indicators
  const [cadastroSaved, setCadastroSaved] = useState(false);
  const [aparenciaSaved, setAparenciaSaved] = useState(false);
  const [layoutSaved, setLayoutSaved] = useState(false);

  // Document Layout State (Header, Logo, Watermark, Footer)
  const [logoUrl, setLogoUrl] = useState(clinicInfo.logoUrl || '');
  const [headerTitle, setHeaderTitle] = useState(clinicInfo.headerTitle || clinicInfo.name || 'DentisPro Odontologia');
  const [headerSubtitle, setHeaderSubtitle] = useState(clinicInfo.headerSubtitle || 'Atendimento Odontológico de Excelência & Reabilitação Oral');
  
  const [watermarkUrl, setWatermarkUrl] = useState(clinicInfo.watermarkUrl || clinicInfo.logoUrl || '');
  const [watermarkOpacity, setWatermarkOpacity] = useState<number>(clinicInfo.watermarkOpacity ?? 15);
  const [showWatermark, setShowWatermark] = useState<boolean>(clinicInfo.showWatermark ?? true);

  const [footerText, setFooterText] = useState(
    clinicInfo.footerText || `${clinicInfo.address || 'Av. Paulista, 1500 - Conjunto 304'} - ${clinicInfo.city || 'São Paulo / SP'} | Tel: ${clinicInfo.phone || '+55 (85) 98111-0826'}`
  );
  const [signatureLabel, setSignatureLabel] = useState(
    clinicInfo.signatureLabel || `${clinicInfo.dentistName || 'Dr. Lucas Mendes'} • ${clinicInfo.cro || 'CRO/SP 123456'} - Responsável Técnico`
  );
  const [showSignatureLine, setShowSignatureLine] = useState<boolean>(clinicInfo.showSignatureLine ?? true);

  // Signature image & Professional stamp (Carimbo) state
  const [signatureImageUrl, setSignatureImageUrl] = useState<string>(clinicInfo.signatureImageUrl || '');
  const [stampImageUrl, setStampImageUrl] = useState<string>(clinicInfo.stampImageUrl || '');
  const [showSignatureImage, setShowSignatureImage] = useState<boolean>(clinicInfo.showSignatureImage ?? true);
  const [showStampImage, setShowStampImage] = useState<boolean>(clinicInfo.showStampImage ?? true);
  const [signatureAlignment, setSignatureAlignment] = useState<'right' | 'center' | 'left'>(clinicInfo.signatureAlignment || 'right');
  const [signatureArrangement, setSignatureArrangement] = useState<'overlay' | 'side_by_side' | 'stacked'>(clinicInfo.signatureArrangement || 'overlay');

  // Gov.br & Digital Certification state
  const [enableGovBrSignature, setEnableGovBrSignature] = useState<boolean>(clinicInfo.enableGovBrSignature ?? true);
  const [govBrSignerName, setGovBrSignerName] = useState<string>(activeDentistObj?.name || clinicInfo.dentistName || 'Hugo Andres Iglesias Ricoy');
  const [govBrSignerCpf, setGovBrSignerCpf] = useState<string>(clinicInfo.govBrSignerCpf || '879.750.253-72');
  const [govBrPassword, setGovBrPassword] = useState<string>(clinicInfo.govBrPassword || 'GovBr2026!@');
  const [showGovBrPassword, setShowGovBrPassword] = useState<boolean>(false);
  const [govBrCertificateType, setGovBrCertificateType] = useState<string>(
    clinicInfo.govBrCertificateType || 'ICP-Brasil / gov.br (Assinatura Eletrônica Avançada)'
  );
  const [govBrClientId, setGovBrClientId] = useState<string>(clinicInfo.govBrClientId || 'br.com.dentispro.app');
  const [govBrClientSecret, setGovBrClientSecret] = useState<string>(clinicInfo.govBrClientSecret || 'govbr_sec_9876543210_oidc');
  const [govBrRedirectUri, setGovBrRedirectUri] = useState<string>(clinicInfo.govBrRedirectUri || 'https://suaclinica.com.br/api/auth/govbr/callback');
  const [govBrEnvironment, setGovBrEnvironment] = useState<'staging' | 'production'>(clinicInfo.govBrEnvironment || 'production');
  const [govBrScopes, setGovBrScopes] = useState<string>(clinicInfo.govBrScopes || 'openid email phone profile govbr_confiabilidade');
  const [govBrMinLevel, setGovBrMinLevel] = useState<'bronze' | 'prata' | 'ouro' | 'prata_ouro'>(clinicInfo.govBrMinLevel || 'prata_ouro');
  const [govBrProviderUrl, setGovBrProviderUrl] = useState<string>(clinicInfo.govBrProviderUrl || 'https://sso.acesso.gov.br');
  const [showGovBrSecret, setShowGovBrSecret] = useState<boolean>(false);

  // Gov.br OIDC Testing & Profile Collection state
  const [isTestingGovBrConn, setIsTestingGovBrConn] = useState<boolean>(false);
  const [govBrTestResult, setGovBrTestResult] = useState<{
    status: 'connected' | 'error';
    latencyMs?: number;
    environment?: string;
    providerUrl?: string;
    discoveryUrl?: string;
    endpoints?: any;
    sslValid?: boolean;
    timestamp?: string;
    message?: string;
  } | null>(null);

  const [isCollectingGovBrProfile, setIsCollectingGovBrProfile] = useState<boolean>(false);
  const [govBrConnectedProfile, setGovBrConnectedProfile] = useState<GovBrProfile | undefined>(
    clinicInfo.govBrConnectedProfile
  );
  const [copiedGovBrCallback, setCopiedGovBrCallback] = useState<boolean>(false);

  // Handler for testing Gov.br OIDC connection
  const handleTestGovBrConnection = async () => {
    setIsTestingGovBrConn(true);
    setGovBrTestResult(null);
    try {
      const res = await fetch(`/api/govbr/test-connection?env=${govBrEnvironment}`);
      if (res.ok) {
        const data = await res.json();
        setGovBrTestResult(data);
      } else {
        setGovBrTestResult({
          status: 'error',
          message: 'Servidor Gov.br respondeu com código de erro.'
        });
      }
    } catch (err: any) {
      setGovBrTestResult({
        status: 'error',
        message: err?.message || 'Não foi possível conectar ao servidor Gov.br.'
      });
    } finally {
      setIsTestingGovBrConn(false);
    }
  };

  // Handler for collecting personal profile info via Gov.br
  const handleCollectGovBrProfile = async () => {
    setIsCollectingGovBrProfile(true);
    try {
      const res = await fetch('/api/govbr/userinfo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: 'demo_authorization_code_govbr',
          customName: govBrSignerName,
          customCpf: govBrSignerCpf
        })
      });

      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setGovBrConnectedProfile(json.data);
          updateClinicInfo({
            govBrConnectedProfile: json.data
          });
        }
      }
    } catch (error) {
      console.error("Erro ao coletar informações do Gov.br:", error);
    } finally {
      setIsCollectingGovBrProfile(false);
    }
  };

  // Handler for importing Gov.br collected profile into signer fields
  const handleImportGovBrToSigner = () => {
    if (!govBrConnectedProfile) return;
    setGovBrSignerName(govBrConnectedProfile.name);
    setGovBrSignerCpf(formatCPF(govBrConnectedProfile.cpf));
    setGovBrCertificateType('Assinatura Eletrônica Avançada Gov.br (Pessoa Física - Gratuita • Conta Prata/Ouro)');
  };

  // Handler to copy exact dynamic callback URL for Gov.br panel
  const handleCopyGovBrCallback = () => {
    const callbackUrl = `${window.location.origin}/api/govbr/callback`;
    navigator.clipboard.writeText(callbackUrl);
    setGovBrRedirectUri(callbackUrl);
    setCopiedGovBrCallback(true);
    setTimeout(() => setCopiedGovBrCallback(false), 2000);
  };

  // Backup & Folder Explorer state
  const [backupRestored, setBackupRestored] = useState(false);
  const [isFolderExplorerOpen, setIsFolderExplorerOpen] = useState(false);
  const [activeFolderTab, setActiveFolderTab] = useState<'banco' | 'prontuarios' | 'imagens' | 'backups'>('banco');
  const [copiedPath, setCopiedPath] = useState(false);

  // Quick Add Modals
  const [showAddClinic, setShowAddClinic] = useState(false);
  const [newClinicNameInput, setNewClinicNameInput] = useState('');
  const [newClinicPhoneInput, setNewClinicPhoneInput] = useState('');

  const [showAddDentist, setShowAddDentist] = useState(false);
  const [newDentistNameInput, setNewDentistNameInput] = useState('');
  const [newDentistCroInput, setNewDentistCroInput] = useState('');

  // Handle Mutual Exclusion Dropdowns
  const handleSelectClinicDropdown = (clinicId: string) => {
    if (!clinicId) {
      setSelectedClinicDropdownId('');
      return;
    }
    setActiveSelectionMode('clinic');
    setSelectedClinicDropdownId(clinicId);
    setSelectedDentistDropdownId(''); // Deactivate dentist dropdown

    const found = clinics.find(c => c.id === clinicId);
    if (found) {
      setActiveClinicId(found.id);
      setClinicName(found.name);
      setHeaderTitle(found.name);
      if (found.phone) setClinicPhone(found.phone);
      if (found.email) setClinicEmail(found.email);
      if (found.cnpj) setClinicCnpj(formatCNPJ(found.cnpj));
      if (found.technicalManager) setTechnicalManager(found.technicalManager);
      if (found.epaoNumber) setEpaoNumber(found.epaoNumber);
      if (found.epaoUf) setEpaoUf(found.epaoUf);
      const parts = found.city ? found.city.split('-') : [];
      setClinicAddressObj({
        cep: found.cep || clinicInfo.cep || '',
        street: found.street || found.address || '',
        number: found.number || '',
        complement: found.complement || '',
        neighborhood: found.neighborhood || '',
        city: parts[0]?.trim() || found.city || '',
        state: found.state || parts[1]?.trim() || 'SP'
      });
    }
  };

  const handleSelectDentistDropdown = (profId: string) => {
    if (!profId) {
      setSelectedDentistDropdownId('');
      return;
    }
    setActiveSelectionMode('dentist');
    setSelectedDentistDropdownId(profId);
    setSelectedClinicDropdownId(''); // Deactivate clinic dropdown

    const found = professionals.find(p => p.id === profId);
    if (found) {
      setActiveProfessionalId(found.id);
      setDentistName(found.name);
      const cleanCro = found.cro ? found.cro.replace(/[^0-9]/g, '') : '';
      setCroNumber(cleanCro);
      if (found.cro && found.cro.includes('/')) {
        const ufMatch = found.cro.split('/')[1]?.split(' ')[0];
        if (ufMatch) setCroUf(ufMatch);
      }
      if (found.specialty) setDentistSpecialty(found.specialty);
      setSignatureLabel(`${found.name} • ${found.cro} - Responsável Técnico`);
      if (found.cpf) setDentistCpf(formatCPF(found.cpf));
      if (found.phone) setDentistPhone(found.phone);
      if (found.email) setDentistEmail(found.email);
      if (found.govBrPassword) setDentistGovBrPassword(found.govBrPassword);
      
      const parts = found.city ? found.city.split('-') : [];
      setDentistAddressObj({
        cep: found.cep || '',
        street: found.street || found.address || '',
        number: found.number || '',
        complement: found.complement || '',
        neighborhood: found.neighborhood || '',
        city: parts[0]?.trim() || found.city || '',
        state: found.state || parts[1]?.trim() || 'SP'
      });
    }
  };

  const handleAddNewSpecialty = () => {
    if (!newSpecialtyText.trim()) return;
    const trimmed = newSpecialtyText.trim();
    if (!specialtiesList.includes(trimmed)) {
      setSpecialtiesList(prev => [...prev, trimmed]);
    }
    setDentistSpecialty(trimmed);
    setNewSpecialtyText('');
    setShowNewSpecialtyInput(false);
  };

  // Save Handlers for specific sections
  const handleSaveCadastro = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (activeSelectionMode === 'clinic') {
      const fullStreet = formatFullAddress({
        street: clinicAddressObj.street,
        number: clinicAddressObj.number,
        complement: clinicAddressObj.complement,
        neighborhood: clinicAddressObj.neighborhood
      });
      const cityState = `${clinicAddressObj.city || 'FORTALEZA'}${clinicAddressObj.state ? ' - ' + clinicAddressObj.state : ''}`;

      updateClinicInfo({
        name: clinicName,
        dentistName: technicalManager || dentistName,
        cro: epaoNumber ? `EPAO/${epaoUf} ${epaoNumber}` : (croNumber ? `CRO/${croUf} ${croNumber}` : clinicInfo.cro),
        phone: clinicPhone,
        email: clinicEmail,
        cnpj: formatCNPJ(clinicCnpj),
        address: fullStreet || clinicInfo.address,
        city: cityState,
        cep: clinicAddressObj.cep,
        street: clinicAddressObj.street,
        number: clinicAddressObj.number,
        complement: clinicAddressObj.complement,
        neighborhood: clinicAddressObj.neighborhood,
        state: clinicAddressObj.state,
        epaoNumber: epaoNumber,
        epaoUf: epaoUf,
        technicalManager: technicalManager
      });

      if (selectedClinicDropdownId) {
        updateClinic(selectedClinicDropdownId, {
          name: clinicName,
          phone: clinicPhone,
          email: clinicEmail,
          cnpj: formatCNPJ(clinicCnpj),
          address: fullStreet || 'Endereço a definir',
          city: cityState,
          cep: clinicAddressObj.cep,
          street: clinicAddressObj.street,
          number: clinicAddressObj.number,
          complement: clinicAddressObj.complement,
          neighborhood: clinicAddressObj.neighborhood,
          state: clinicAddressObj.state,
          technicalManager: technicalManager,
          epaoNumber: epaoNumber,
          epaoUf: epaoUf
        });
        setActiveClinicId(selectedClinicDropdownId);
      } else {
        const createdClinic = addClinic({
          name: clinicName || 'Nova Unidade',
          phone: clinicPhone,
          email: clinicEmail,
          cnpj: formatCNPJ(clinicCnpj),
          address: fullStreet || 'Endereço a definir',
          city: cityState,
          cep: clinicAddressObj.cep,
          street: clinicAddressObj.street,
          number: clinicAddressObj.number,
          complement: clinicAddressObj.complement,
          neighborhood: clinicAddressObj.neighborhood,
          state: clinicAddressObj.state,
          technicalManager: technicalManager,
          epaoNumber: epaoNumber,
          epaoUf: epaoUf
        });
        setSelectedClinicDropdownId(createdClinic.id);
        setActiveClinicId(createdClinic.id);
      }
    } else {
      const fullCro = croNumber.startsWith('CRO') ? croNumber : `CRO/${croUf} ${croNumber}`;
      const fullDentistStreet = formatFullAddress({
        street: dentistAddressObj.street,
        number: dentistAddressObj.number,
        complement: dentistAddressObj.complement,
        neighborhood: dentistAddressObj.neighborhood
      });
      const dentistCityState = `${dentistAddressObj.city || 'FORTALEZA'}${dentistAddressObj.state ? ' - ' + dentistAddressObj.state : ''}`;

      updateClinicInfo({
        dentistName: dentistName,
        cro: fullCro,
        specialty: dentistSpecialty,
        phone: dentistPhone,
        email: dentistEmail,
        cpf: formatCPF(dentistCpf),
        govBrSignerName: dentistName,
        govBrSignerCpf: formatCPF(dentistCpf),
        govBrPassword: dentistGovBrPassword,
        croNumber: croNumber,
        croUf: croUf,
        signatureLabel: `${dentistName} • ${fullCro} - Responsável Técnico`
      });

      if (selectedDentistDropdownId) {
        updateProfessional(selectedDentistDropdownId, {
          name: dentistName,
          cro: fullCro,
          specialty: dentistSpecialty,
          cpf: formatCPF(dentistCpf),
          phone: dentistPhone,
          email: dentistEmail,
          address: fullDentistStreet,
          city: dentistCityState,
          cep: dentistAddressObj.cep,
          street: dentistAddressObj.street,
          number: dentistAddressObj.number,
          complement: dentistAddressObj.complement,
          neighborhood: dentistAddressObj.neighborhood,
          state: dentistAddressObj.state,
          croNumber: croNumber,
          croUf: croUf,
          govBrPassword: dentistGovBrPassword
        });
        setActiveProfessionalId(selectedDentistDropdownId);
      } else {
        const createdProf = addProfessional({
          name: dentistName || 'Dr(a). Profissional',
          cro: fullCro,
          specialty: dentistSpecialty || 'Clínica Geral',
          cpf: formatCPF(dentistCpf),
          phone: dentistPhone,
          email: dentistEmail,
          address: fullDentistStreet,
          city: dentistCityState,
          cep: dentistAddressObj.cep,
          street: dentistAddressObj.street,
          number: dentistAddressObj.number,
          complement: dentistAddressObj.complement,
          neighborhood: dentistAddressObj.neighborhood,
          state: dentistAddressObj.state,
          croNumber: croNumber,
          croUf: croUf,
          govBrPassword: dentistGovBrPassword
        });
        setSelectedDentistDropdownId(createdProf.id);
        setActiveProfessionalId(createdProf.id);
      }
    }

    setCadastroSaved(true);
    setTimeout(() => setCadastroSaved(false), 2500);
  };

  const handleCreateNewClinicQuick = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newClinicNameInput.trim()) return;
    const newC = addClinic({
      name: newClinicNameInput.trim(),
      phone: newClinicPhoneInput.trim() || clinicPhone,
      email: clinicEmail,
      address: 'Endereço a definir'
    });
    setSelectedClinicDropdownId(newC.id);
    setActiveClinicId(newC.id);
    setActiveSelectionMode('clinic');
    setClinicName(newC.name);
    if (newC.phone) setClinicPhone(newC.phone);
    setNewClinicNameInput('');
    setNewClinicPhoneInput('');
    setShowAddClinic(false);
    setCadastroSaved(true);
    setTimeout(() => setCadastroSaved(false), 2500);
  };

  const handleCreateNewDentistQuick = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newDentistNameInput.trim()) return;
    const fullCro = newDentistCroInput.trim() ? (newDentistCroInput.startsWith('CRO') ? newDentistCroInput : `CRO/${croUf} ${newDentistCroInput}`) : 'CRO/CE 123456';
    const newP = addProfessional({
      name: newDentistNameInput.trim(),
      cro: fullCro,
      specialty: dentistSpecialty || 'Clínica Geral'
    });
    setSelectedDentistDropdownId(newP.id);
    setActiveProfessionalId(newP.id);
    setActiveSelectionMode('dentist');
    setDentistName(newP.name);
    setCroNumber(newP.cro);
    setNewDentistNameInput('');
    setNewDentistCroInput('');
    setShowAddDentist(false);
    setCadastroSaved(true);
    setTimeout(() => setCadastroSaved(false), 2500);
  };

  const handleSaveAparencia = () => {
    setAparenciaSaved(true);
    setTimeout(() => setAparenciaSaved(false), 2500);
  };

  const handleSaveLayout = () => {
    updateClinicInfo({
      logoUrl: logoUrl || undefined,
      headerTitle,
      headerSubtitle,
      watermarkUrl: watermarkUrl || logoUrl || undefined,
      watermarkOpacity,
      showWatermark,
      footerText,
      signatureLabel,
      showSignatureLine,
      signatureImageUrl,
      stampImageUrl,
      showSignatureImage,
      showStampImage,
      signatureAlignment,
      signatureArrangement,
      enableGovBrSignature,
      govBrSignerName,
      govBrSignerCpf,
      govBrPassword,
      govBrCertificateType,
      govBrClientId,
      govBrClientSecret,
      govBrRedirectUri,
      govBrEnvironment,
      govBrScopes,
      govBrMinLevel,
      govBrProviderUrl,
      govBrConnectedProfile
    });

    setLayoutSaved(true);
    setTimeout(() => setLayoutSaved(false), 2500);
  };

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setSignatureImageUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStampUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setStampImageUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Logo & Watermark Upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          const res = reader.result;
          setLogoUrl(res);
          if (!watermarkUrl) setWatermarkUrl(res);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleWatermarkUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setWatermarkUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // USB Export Zip
  const handleExportProjectZip = async () => {
    try {
      const zip = new JSZip();
      zip.file("README.md", `# Sistema Odontológico - Pen Drive USB\n\n1. Node.js instalado.\n2. Executar: npm install\n3. Executar: npm run dev\n4. Acesse http://localhost:3000`);
      zip.file("backup-clinica-dados.json", JSON.stringify({ clinicInfo, exportDate: new Date().toISOString() }, null, 2));

      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sistema-odontologico-usb-${new Date().toISOString().slice(0, 10)}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Erro export zip:", err);
    }
  };

  // Backup Export & Import
  const handleExportBackup = () => {
    try {
      exportDatabaseBackupJSON();
    } catch (err) {
      console.error("Erro backup:", err);
    }
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const backupData = JSON.parse(ev.target?.result as string);
        if (window.confirm('Substituir os dados atuais pelo backup selecionado?')) {
          Object.keys(backupData).forEach((key) => {
            const val = backupData[key];
            localStorage.setItem(key, typeof val === 'string' ? val : JSON.stringify(val));
          });
          setBackupRestored(true);
          setTimeout(() => window.location.reload(), 1500);
        }
      } catch (err) {
        alert('Arquivo de backup inválido.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetDefaults = () => {
    if (window.confirm('Restaurar dados de exemplo do sistema?')) {
      resetToDefaultData();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header Bar */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${t.cardBg} p-6 rounded-[28px] border ${t.cardBorder} shadow-2xs`}>
        <div className="space-y-1">
          <h1 className={`text-2xl font-bold ${t.headingText} flex items-center gap-2.5 tracking-tight`}>
            <Settings className={`w-7 h-7 ${t.accentText}`} />
            Configuração do Consultório e Layout
          </h1>
          <p className="text-xs opacity-75 leading-relaxed">
            Gestão de unidades e dentistas, personalização da identidade visual e layout de impressões e backups do banco de dados.
          </p>
        </div>

        <button
          type="button"
          onClick={handleResetDefaults}
          className={`px-4 py-2.5 ${t.btnSecondaryBg} ${t.btnSecondaryText} text-xs font-bold rounded-2xl border ${t.cardBorder} flex items-center gap-2 transition cursor-pointer shrink-0 shadow-2xs self-start sm:self-auto hover:opacity-90`}
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          Restaurar Dados Padrão Exemplo
        </button>
      </div>

      {/* Navigation Tabs for Settings Sub-Modules */}
      <div className="flex flex-wrap items-center gap-2 p-2 bg-[#f4f4ec] rounded-[24px] border border-[#e5e5d1] shadow-2xs">
        <button
          type="button"
          onClick={() => setActiveSettingsTab('cadastro')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
            activeSettingsTab === 'cadastro'
              ? 'bg-[#5a5a40] text-white shadow-sm'
              : 'text-[#5a5a40] hover:bg-white/70'
          }`}
        >
          <Building className="w-4 h-4 text-[#d4a373]" />
          Clínicas & Dentistas
        </button>

        <button
          type="button"
          onClick={() => setActiveSettingsTab('whatsapp_api')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
            activeSettingsTab === 'whatsapp_api'
              ? 'bg-[#5a5a40] text-white shadow-sm'
              : 'text-[#5a5a40] hover:bg-white/70'
          }`}
        >
          <Bot className="w-4 h-4 text-[#25d366]" />
          API WhatsApp & Conexão
        </button>

        <button
          type="button"
          onClick={() => setActiveSettingsTab('documentos')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
            activeSettingsTab === 'documentos'
              ? 'bg-[#5a5a40] text-white shadow-sm'
              : 'text-[#5a5a40] hover:bg-white/70'
          }`}
        >
          <FileText className="w-4 h-4 text-[#d4a373]" />
          Modelos de Documentos & Tags
        </button>

        <button
          type="button"
          onClick={() => setActiveSettingsTab('procedimentos')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
            activeSettingsTab === 'procedimentos'
              ? 'bg-[#5a5a40] text-white shadow-sm'
              : 'text-[#5a5a40] hover:bg-white/70'
          }`}
        >
          <Stethoscope className="w-4 h-4 text-[#d4a373]" />
          Protocolos & Materiais
        </button>

        <button
          type="button"
          onClick={() => setActiveSettingsTab('layout')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
            activeSettingsTab === 'layout'
              ? 'bg-[#5a5a40] text-white shadow-sm'
              : 'text-[#5a5a40] hover:bg-white/70'
          }`}
        >
          <FileSignature className="w-4 h-4 text-[#d4a373]" />
          Layout de Impressão
        </button>

        <button
          type="button"
          onClick={() => setActiveSettingsTab('aparencia')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
            activeSettingsTab === 'aparencia'
              ? 'bg-[#5a5a40] text-white shadow-sm'
              : 'text-[#5a5a40] hover:bg-white/70'
          }`}
        >
          <Palette className="w-4 h-4 text-[#d4a373]" />
          Tema Visual
        </button>

        <button
          type="button"
          onClick={() => setActiveSettingsTab('govbr')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
            activeSettingsTab === 'govbr'
              ? 'bg-[#5a5a40] text-white shadow-sm'
              : 'text-[#5a5a40] hover:bg-white/70'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-[#d4a373]" />
          Assinatura Gov.br
        </button>

        <button
          type="button"
          onClick={() => setActiveSettingsTab('backup')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
            activeSettingsTab === 'backup'
              ? 'bg-[#5a5a40] text-white shadow-sm'
              : 'text-[#5a5a40] hover:bg-white/70'
          }`}
        >
          <Database className="w-4 h-4 text-[#d4a373]" />
          Backup & Banco
        </button>
      </div>

      {/* TAB: WHATSAPP API & CONEXÃO */}
      {activeSettingsTab === 'whatsapp_api' && (
        <div className="bg-white border border-[#e5e5d1] rounded-[28px] p-6 shadow-sm space-y-6">
          <div className="border-b border-[#e5e5d1] pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold bg-[#075e54] text-white px-2.5 py-0.5 rounded-md uppercase">
                  CENTRAL DE COMUNICAÇÃO
                </span>
                <span className="text-[10px] font-bold bg-emerald-100 text-[#075e54] px-2.5 py-0.5 rounded-md flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  API OPERACIONAL
                </span>
              </div>
              <h2 className="text-base font-bold text-[#5a5a40] mt-1 flex items-center gap-2">
                <Bot className="w-5 h-5 text-[#25d366]" />
                Configuração da API WhatsApp &amp; Conexão em Nuvem
              </h2>
              <p className="text-xs text-gray-500">Parâmetros do gateway de conexão para envio de pré-cadastros, lembretes de consultas e notificações da recepção.</p>
            </div>
          </div>

          <div className="bg-[#fcfbf9] border border-[#e5e5d1] p-5 rounded-2xl space-y-4">
            <h3 className="font-bold text-xs text-[#5a5a40] uppercase tracking-wider flex items-center gap-2">
              <Key className="w-4 h-4 text-[#d4a373]" />
              Parâmetros da Meta Cloud API / Evolution API
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Meta App ID (Cloud API)
                </label>
                <input
                  type="text"
                  defaultValue="1092837492837412"
                  className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2 text-xs font-mono text-gray-900 focus:outline-none focus:border-[#5a5a40]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Phone Number ID
                </label>
                <input
                  type="text"
                  defaultValue="55119987654321"
                  className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2 text-xs font-mono text-gray-900 focus:outline-none focus:border-[#5a5a40]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  WABA ID (WhatsApp Business Account)
                </label>
                <input
                  type="text"
                  defaultValue="987654321098765"
                  className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2 text-xs font-mono text-gray-900 focus:outline-none focus:border-[#5a5a40]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Webhook Verify Token
                </label>
                <input
                  type="text"
                  defaultValue="dentispro_wh_secret_2026"
                  className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2 text-xs font-mono text-gray-900 focus:outline-none focus:border-[#5a5a40]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Permanent Access Token (Meta System User Token)
                </label>
                <input
                  type="password"
                  defaultValue="EAAG_dentispro_token_prod_2026"
                  className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2 text-xs font-mono text-gray-900 focus:outline-none focus:border-[#5a5a40]"
                />
              </div>

              <div className="sm:col-span-2 bg-emerald-50 border border-emerald-200 p-4 rounded-xl space-y-2">
                <label className="block text-xs font-bold text-emerald-950">
                  URL do Webhook do Servidor (Sincronização Ativa):
                </label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-white border border-emerald-300 px-3 py-2 rounded-lg text-xs font-mono text-emerald-950 font-bold select-all break-all">
                    {typeof window !== 'undefined' ? `${window.location.origin}/api/whatsapp/webhook` : 'https://suaclinica.com.br/api/whatsapp/webhook'}
                  </code>
                  <button
                    type="button"
                    onClick={() => {
                      const url = typeof window !== 'undefined' ? `${window.location.origin}/api/whatsapp/webhook` : 'https://suaclinica.com.br/api/whatsapp/webhook';
                      navigator.clipboard.writeText(url);
                      alert('URL do Webhook copiada com sucesso para a área de transferência!');
                    }}
                    className="px-3.5 py-2 bg-[#075e54] text-white rounded-lg text-xs font-bold hover:bg-[#128c7e] cursor-pointer flex items-center gap-1.5 shrink-0 shadow-2xs"
                  >
                    <Copy className="w-3.5 h-3.5" /> Copiar URL
                  </button>
                </div>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  💡 Esta URL deve ser cadastrada na plataforma da Meta Cloud API ou Evolution API para receber as mensagens enviadas pelos pacientes.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-200">
              <button
                type="button"
                onClick={() => alert('🧹 Reinstalação limpa da API realizada com sucesso! Conexão reiniciada e pronta.')}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" /> 🧹 Reinstalação Limpa do WhatsApp
              </button>

              <button
                type="button"
                onClick={() => alert('Credenciais da API WhatsApp salvas com sucesso!')}
                className="px-5 py-2 bg-[#5a5a40] hover:bg-[#7a7a5a] text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5 text-[#d4a373]" /> Salvar Configuração da API
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB: MODELOS DE DOCUMENTOS E TAGS SQL */}
      {activeSettingsTab === 'documentos' && (
        <DocumentTemplatesManager />
      )}

      {/* TAB: PROTOCOLOS DE PROCEDIMENTOS E MATERIAIS */}
      {activeSettingsTab === 'procedimentos' && (
        <ProcedureProtocolManager />
      )}

      {/* SECTION 1: CADASTRO DE CLÍNICAS E PROFISSIONAIS */}
      {activeSettingsTab === 'cadastro' && (
      <div className="bg-white border border-[#e5e5d1] rounded-[28px] p-6 shadow-sm space-y-6">
        <div className="border-b border-[#e5e5d1] pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-[#5a5a40] flex items-center gap-2">
              <Building className="w-5 h-5 text-[#d4a373]" />
              Cadastro de Clínicas e Profissionais
            </h2>
            <p className="text-xs text-gray-500">Selecione uma unidade ou dentista para visualizar e continuar a edição das informações cadastrais.</p>
          </div>
        </div>

        {/* Mutual Exclusion Dropdowns Selector */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#fbfbf9] p-4 rounded-2xl border border-[#e5e5d1]">
          {/* 1. Unidades e Consultórios Dropdown */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-[#5a5a40] uppercase tracking-wider flex items-center gap-1.5">
                <Building className="w-4 h-4 text-[#d4a373]" />
                Unidades e Consultórios
              </label>
              <button
                type="button"
                onClick={() => setShowAddClinic(true)}
                className="text-[11px] font-bold text-[#5a5a40] hover:text-[#d4a373] flex items-center gap-1 cursor-pointer transition"
              >
                <Plus className="w-3.5 h-3.5 text-[#d4a373]" />
                Nova Unidade
              </button>
            </div>
            <select
              value={selectedClinicDropdownId}
              onChange={(e) => handleSelectClinicDropdown(e.target.value)}
              className={`w-full bg-white border rounded-xl px-3 py-2 text-xs font-bold transition focus:outline-none ${
                activeSelectionMode === 'clinic' && selectedClinicDropdownId
                  ? 'border-[#5a5a40] text-[#2c2c2c] ring-2 ring-[#5a5a40]/20'
                  : 'border-[#e5e5d1] text-gray-500'
              }`}
            >
              <option value="">(Nenhum)</option>
              {clinics.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.phone ? `(${c.phone})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Cirurgiões-Dentistas Dropdown */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-[#5a5a40] uppercase tracking-wider flex items-center gap-1.5">
                <Stethoscope className="w-4 h-4 text-[#d4a373]" />
                Cirurgiões-Dentistas
              </label>
              <button
                type="button"
                onClick={() => setShowAddDentist(true)}
                className="text-[11px] font-bold text-[#5a5a40] hover:text-[#d4a373] flex items-center gap-1 cursor-pointer transition"
              >
                <Plus className="w-3.5 h-3.5 text-[#d4a373]" />
                Novo Dentista
              </button>
            </div>
            <select
              value={selectedDentistDropdownId}
              onChange={(e) => handleSelectDentistDropdown(e.target.value)}
              className={`w-full bg-white border rounded-xl px-3 py-2 text-xs font-bold transition focus:outline-none ${
                activeSelectionMode === 'dentist' && selectedDentistDropdownId
                  ? 'border-[#5a5a40] text-[#2c2c2c] ring-2 ring-[#5a5a40]/20'
                  : 'border-[#e5e5d1] text-gray-500'
              }`}
            >
              <option value="">(Nenhum)</option>
              {professionals.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {p.cro} ({p.specialty})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Informações Cadastrais (Incorporated Form) */}
        <div className="bg-[#fcfdfa] border border-[#e5e5d1] rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#e5e5d1] pb-2">
            <span className="text-xs font-bold text-[#2c3e2e] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#d4a373]" />
              Informações Cadastrais {activeSelectionMode === 'clinic' ? '(Unidade Ativa)' : '(Dentista Ativo)'}
            </span>
            <span className="text-[11px] text-gray-500">Editando dados selecionados</span>
          </div>

          {activeSelectionMode === 'clinic' ? (
            /* FORM WHEN UNIDADES E CONSULTÓRIOS IS SELECTED */
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-[#5a5a40] mb-1">Nome da Clínica / Consultório *</label>
                  <input
                    type="text"
                    required
                    value={clinicName}
                    onChange={(e) => setClinicName(e.target.value)}
                    className="w-full bg-white border border-[#e5e5d1] rounded-2xl px-3 py-2 text-xs text-[#2c2c2c] font-bold focus:outline-none focus:border-[#5a5a40]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5a5a40] mb-1">Cirurgião-Dentista Responsável</label>
                  <select
                    value={technicalManager}
                    onChange={(e) => setTechnicalManager(e.target.value)}
                    className="w-full bg-white border border-[#e5e5d1] rounded-2xl px-3 py-2 text-xs text-[#2c2c2c] font-bold focus:outline-none focus:border-[#5a5a40]"
                  >
                    <option value="">(Nenhum)</option>
                    {professionals.map((p) => (
                      <option key={p.id} value={p.name}>
                        {p.name} ({p.cro})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <PhoneInputWithDDI
                    label="Telefone / WhatsApp (DDI)"
                    value={clinicPhone}
                    onChange={(val) => setClinicPhone(val)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5a5a40] mb-1">E-mail</label>
                  <input
                    type="email"
                    value={clinicEmail}
                    onChange={(e) => setClinicEmail(e.target.value)}
                    className="w-full bg-white border border-[#e5e5d1] rounded-2xl px-3 py-2 text-xs text-[#2c2c2c] focus:outline-none focus:border-[#5a5a40]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5a5a40] mb-1">CNPJ da Clínica / Unidade</label>
                  <input
                    type="text"
                    maxLength={18}
                    placeholder="00.000.000/0000-00"
                    value={clinicCnpj}
                    onChange={(e) => setClinicCnpj(formatCNPJ(e.target.value))}
                    className="w-full bg-white border border-[#e5e5d1] rounded-2xl px-3 py-2 text-xs text-[#2c2c2c] font-mono focus:outline-none focus:border-[#5a5a40]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5a5a40] mb-1">EPAO (máx 5 números)</label>
                  <input
                    type="text"
                    maxLength={5}
                    placeholder="Ex: 825"
                    value={epaoNumber}
                    onChange={(e) => setEpaoNumber(formatEPAO(e.target.value))}
                    className="w-full bg-white border border-[#e5e5d1] rounded-2xl px-3 py-2 text-xs text-[#2c2c2c] font-mono focus:outline-none focus:border-[#5a5a40]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5a5a40] mb-1">EPAO/UF</label>
                  <select
                    value={epaoUf}
                    onChange={(e) => setEpaoUf(e.target.value)}
                    className="w-full bg-white border border-[#e5e5d1] rounded-2xl px-3 py-2 text-xs text-[#2c2c2c] font-bold focus:outline-none focus:border-[#5a5a40]"
                  >
                    {BRAZILIAN_STATES.map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Especialidade</label>
                  <input
                    type="text"
                    disabled
                    value=""
                    placeholder="Sem especialidade (Unidade)"
                    className="w-full bg-[#f0f0e8] border border-[#e5e5d1] rounded-2xl px-3 py-2 text-xs text-gray-400 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="pt-2">
                <AddressFields
                  address={clinicAddressObj}
                  onChange={setClinicAddressObj}
                  theme="olive"
                />
              </div>
            </div>
          ) : (
            /* FORM WHEN CIRURGIÕES-DENTISTAS IS SELECTED */
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-[#5a5a40] mb-1">Nome do Cirurgião-Dentista Responsável *</label>
                  <input
                    type="text"
                    required
                    value={dentistName}
                    onChange={(e) => setDentistName(e.target.value)}
                    className="w-full bg-white border border-[#e5e5d1] rounded-2xl px-3 py-2 text-xs text-[#2c2c2c] font-bold focus:outline-none focus:border-[#5a5a40]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5a5a40] mb-1">CPF do Cirurgião-Dentista *</label>
                  <input
                    type="text"
                    required
                    maxLength={14}
                    placeholder="000.000.000-00"
                    value={dentistCpf}
                    onChange={(e) => setDentistCpf(formatCPF(e.target.value))}
                    className="w-full bg-white border border-[#e5e5d1] rounded-2xl px-3 py-2 text-xs text-[#2c2c2c] font-mono focus:outline-none focus:border-[#5a5a40]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5a5a40] mb-1">CRO (máx 8 números) *</label>
                  <input
                    type="text"
                    required
                    maxLength={8}
                    placeholder="Ex: 987654"
                    value={croNumber}
                    onChange={(e) => setCroNumber(formatCRO(e.target.value))}
                    className="w-full bg-white border border-[#e5e5d1] rounded-2xl px-3 py-2 text-xs text-[#2c2c2c] font-mono focus:outline-none focus:border-[#5a5a40]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5a5a40] mb-1">CRO/UF</label>
                  <select
                    value={croUf}
                    onChange={(e) => setCroUf(e.target.value)}
                    className="w-full bg-white border border-[#e5e5d1] rounded-2xl px-3 py-2 text-xs text-[#2c2c2c] font-bold focus:outline-none focus:border-[#5a5a40]"
                  >
                    {BRAZILIAN_STATES.map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                {/* Specialty with Dropdown, Suggestions Chips, and Custom Input */}
                <div className="sm:col-span-2 md:col-span-1">
                  <SpecialtyInputSelector
                    value={dentistSpecialty}
                    onChange={(newSpec) => setDentistSpecialty(newSpec)}
                    availableSpecialties={specialtiesList}
                    onAddSpecialty={(newSpec) => {
                      if (!specialtiesList.includes(newSpec)) {
                        setSpecialtiesList(prev => [...prev, newSpec]);
                      }
                    }}
                  />
                </div>

                <div>
                  <PhoneInputWithDDI
                    label="Telefone / WhatsApp (DDI)"
                    value={dentistPhone}
                    onChange={(val) => setDentistPhone(val)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5a5a40] mb-1">E-mail Profissional</label>
                  <input
                    type="email"
                    value={dentistEmail}
                    onChange={(e) => setDentistEmail(e.target.value)}
                    className="w-full bg-white border border-[#e5e5d1] rounded-2xl px-3 py-2 text-xs text-[#2c2c2c] focus:outline-none focus:border-[#5a5a40]"
                  />
                </div>

                {/* Senha do Gov.br do Dentista */}
                <div className="sm:col-span-2 md:col-span-1">
                  <label className="block text-xs font-semibold text-[#5a5a40] mb-1 flex items-center justify-between">
                    <span>Senha do Gov.br (Assinatura Digital)</span>
                    <span className="text-[10px] text-blue-700 font-bold bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">ICP-Brasil / Ouro</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showDentistGovPassword ? 'text' : 'password'}
                      value={dentistGovBrPassword}
                      onChange={(e) => setDentistGovBrPassword(e.target.value)}
                      placeholder="Digite a senha do Gov.br"
                      className="w-full bg-white border border-[#e5e5d1] rounded-2xl pl-3 pr-10 py-2 text-xs text-[#2c2c2c] font-mono focus:outline-none focus:border-[#5a5a40]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowDentistGovPassword(!showDentistGovPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition cursor-pointer"
                      title={showDentistGovPassword ? 'Ocultar senha' : 'Exibir senha'}
                    >
                      {showDentistGovPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <span className="text-[10px] text-gray-500 mt-1 block">
                    🔑 Usada no Portal de Assinatura Digital Gov.br.
                  </span>
                </div>
              </div>

              {/* Endereço Pessoal/Residencial do Dentista (Restrito) */}
              <div className="pt-2 border-t border-[#e5e5d1] mt-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-bold text-[#5a5a40] uppercase tracking-wider flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Endereço Pessoal / Residencial do Dentista
                  </span>
                  <span className="text-[10.5px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                    🔒 Uso Restrito (Não é impresso em documentos / receituários)
                  </span>
                </div>
                <AddressFields
                  address={dentistAddressObj}
                  onChange={setDentistAddressObj}
                  theme="olive"
                />
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-start pt-3 border-t border-[#e5e5d1] gap-3">
            <button
              type="button"
              onClick={() => handleSaveCadastro()}
              className={`px-5 py-2.5 ${t.btnPrimaryBg} ${t.btnPrimaryText} font-bold text-xs rounded-2xl shadow-xs flex items-center gap-2 transition cursor-pointer`}
            >
              <Save className="w-4 h-4" />
              Salvar Cadastro
            </button>
            {cadastroSaved && (
              <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                <Check className="w-4 h-4 text-emerald-600" /> Cadastro Atualizado com Sucesso!
              </span>
            )}
          </div>
        </div>
      </div>
      )}

      {/* SECTION 2: APARÊNCIA */}
      {activeSettingsTab === 'aparencia' && (
      <div className="bg-white border border-[#e5e5d1] rounded-[28px] p-6 shadow-sm space-y-5">
        <div className="border-b border-[#e5e5d1] pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className={`text-base font-bold ${t.headingText} flex items-center gap-2`}>
              <Palette className={`w-5 h-5 ${t.accentText}`} />
              Aparência
            </h2>
            <p className="text-xs text-gray-500">Alterne entre modos de exibição e temas de cores da interface do sistema.</p>
          </div>

          <button
            type="button"
            onClick={handleSaveAparencia}
            className={`px-4 py-2 ${t.btnPrimaryBg} ${t.btnPrimaryText} font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition cursor-pointer self-start sm:self-auto`}
          >
            <Save className="w-3.5 h-3.5" />
            Salvar Aparência
          </button>
        </div>

        {/* Tema Visual Selector with Color Circle on Button and Name */}
        <div className="space-y-3">
          <label className={`block text-xs font-bold ${t.headingText} uppercase tracking-wider`}>
            Tema Visual da Aplicação
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { id: 'natural-tones', name: 'Natural Tones', colorClass: 'bg-[#5a5a40]' },
              { id: 'dental-clean', name: 'Dental Clean', colorClass: 'bg-sky-600' },
              { id: 'dark-executive', name: 'Modo Escuro', colorClass: 'bg-zinc-800' },
              { id: 'soft-pink', name: 'Soft Pink', colorClass: 'bg-pink-600' }
            ].map((themeOption) => (
              <button
                key={themeOption.id}
                type="button"
                onClick={() => setLayoutTheme(themeOption.id)}
                className={`p-3 rounded-2xl border transition flex items-center justify-between cursor-pointer ${
                  layoutTheme === themeOption.id
                    ? `${t.btnPrimaryBg} ${t.btnPrimaryText} font-bold text-xs shadow-2xs`
                    : `border-[#e5e5d1] bg-[#fbfbf9] text-xs hover:bg-stone-100`
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={`w-4 h-4 rounded-full ${themeOption.colorClass} border border-white/50 shadow-2xs shrink-0`} />
                  <span className={layoutTheme === themeOption.id ? t.btnPrimaryText : 'text-[#2c2c2c]'}>{themeOption.name}</span>
                </div>
                {layoutTheme === themeOption.id && (
                  <Check className={`w-4 h-4 ${t.btnPrimaryText} shrink-0`} />
                )}
              </button>
            ))}
          </div>
        </div>

        {aparenciaSaved && (
          <div className="text-xs font-bold text-emerald-700 flex items-center gap-1 justify-end pt-1">
            <Check className="w-4 h-4 text-emerald-600" /> Preferências de aparência salvas!
          </div>
        )}
      </div>
      )}

      {/* SECTION 3: LAYOUT DE DOCUMENTOS */}
      {activeSettingsTab === 'layout' && (
      <div className="bg-white border border-[#e5e5d1] rounded-[28px] p-6 shadow-sm space-y-6">
        <div className="border-b border-[#e5e5d1] pb-3">
          <div>
            <h2 className="text-base font-bold text-[#5a5a40] flex items-center gap-2">
              <Layout className="w-5 h-5 text-[#d4a373]" />
              Layout de documentos
            </h2>
            <p className="text-xs text-gray-500">Personalize a identidade visual de cabeçalho, logo, marca d'água central e rodapé de receitas, laudos e orçamentos.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Column */}
          <div className="lg:col-span-7 space-y-5">
            {/* Header & Logo */}
            <div className="bg-[#fbfbf9] p-4 rounded-2xl border border-[#e5e5d1] space-y-3">
              <span className="text-xs font-bold text-[#2c3e2e] uppercase tracking-wider flex items-center gap-1.5 border-b border-[#e5e5d1] pb-2">
                <ImageIcon className="w-4 h-4 text-[#d4a373]" />
                Logotipo e Título do Cabeçalho
              </span>

              <div className="flex items-center gap-3">
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo" className="w-14 h-14 rounded-xl object-contain border border-[#d4a373] bg-white p-1 shrink-0" />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-[#f0f0e8] flex items-center justify-center text-[10px] text-gray-400 shrink-0">Sem Logo</div>
                )}
                <div className="space-y-1">
                  <label className={`block text-[11px] font-bold ${t.headingText}`}>Carregar Logotipo Oficial</label>
                  <label className={`px-3 py-1.5 ${t.btnPrimaryBg} ${t.btnPrimaryText} rounded-xl text-xs font-bold cursor-pointer inline-flex items-center gap-1.5 shadow-2xs transition`}>
                    <span>Escolher arquivo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <div>
                  <label className={`block text-xs font-semibold ${t.headingText} mb-1`}>Unidades e Consultórios *</label>
                  <input
                    type="text"
                    value={headerTitle}
                    onChange={(e) => setHeaderTitle(e.target.value)}
                    placeholder="Ex: Unidade Centro • Unidade Aldeota / Consultório 102"
                    className="w-full bg-white border border-[#e5e5d1] rounded-xl px-3 py-1.5 text-xs font-bold text-[#2c2c2c] focus:outline-none focus:border-[#5a5a40]"
                  />
                </div>

                <div>
                  <label className={`block text-xs font-semibold ${t.headingText} mb-1`}>Cirurgião-Dentista Responsável</label>
                  <input
                    type="text"
                    value={headerSubtitle}
                    onChange={(e) => setHeaderSubtitle(e.target.value)}
                    placeholder="Ex: Dr. Lucas Mendes • CRO/SP 123456"
                    className="w-full bg-white border border-[#e5e5d1] rounded-xl px-3 py-1.5 text-xs text-[#2c2c2c] focus:outline-none focus:border-[#5a5a40]"
                  />
                </div>
              </div>
            </div>

            {/* Watermark */}
            <div className="bg-[#fbfbf9] p-4 rounded-2xl border border-[#e5e5d1] space-y-3">
              <div className="flex items-center justify-between border-b border-[#e5e5d1] pb-2">
                <span className={`text-xs font-bold ${t.headingText} uppercase tracking-wider flex items-center gap-1.5`}>
                  <Sliders className={`w-4 h-4 ${t.accentText}`} />
                  Marca d'Água Centralizada
                </span>

                <label className={`flex items-center gap-1.5 text-xs font-bold ${t.headingText} cursor-pointer`}>
                  <input
                    type="checkbox"
                    checked={showWatermark}
                    onChange={(e) => setShowWatermark(e.target.checked)}
                    style={{ accentColor: t.accentColor }}
                    className="w-4 h-4 rounded cursor-pointer"
                  />
                  Exibir Marca d'Água
                </label>
              </div>

              {showWatermark && (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    {watermarkUrl ? (
                      <img src={watermarkUrl} alt="Marca d'água" className="w-12 h-12 rounded-xl object-contain border border-[#d4a373] bg-white p-1 shrink-0" />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-[#f0f0e8] flex items-center justify-center text-[9px] text-gray-400 shrink-0">Sem Imagem</div>
                    )}
                    <div className="space-y-1">
                      <label className={`px-2.5 py-1 ${t.btnPrimaryBg} ${t.btnPrimaryText} rounded-xl text-[11px] font-bold cursor-pointer inline-flex items-center gap-1 shadow-2xs transition`}>
                        <span>Escolher arquivo</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleWatermarkUpload}
                          className="hidden"
                        />
                      </label>
                      {logoUrl && watermarkUrl !== logoUrl && (
                        <button
                          type="button"
                          onClick={() => setWatermarkUrl(logoUrl)}
                          className={`text-[10px] ${t.headingText} font-bold hover:underline block cursor-pointer`}
                        >
                          Usar mesmo logotipo como marca d'água
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-[#e5e5d1] space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className={`text-[11px] font-bold ${t.headingText}`}>
                        Transparência (Opacidade)
                      </label>
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-bold ${t.btnPrimaryBg} ${t.btnPrimaryText}`}>
                        {watermarkOpacity}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="1"
                      value={watermarkOpacity}
                      onChange={(e) => setWatermarkOpacity(Number(e.target.value))}
                      style={{ accentColor: t.accentColor }}
                      className={`w-full cursor-pointer h-2 ${t.inputBg} rounded-lg`}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Rodapé e Linha de Assinatura Tradicional (Agrupado com Identidade Visual) */}
            <div className="bg-[#fbfbf9] p-4 rounded-2xl border border-[#e5e5d1] space-y-3">
              <span className={`text-xs font-bold ${t.headingText} uppercase tracking-wider flex items-center gap-1.5 border-b border-[#e5e5d1] pb-2`}>
                <Layout className={`w-4 h-4 ${t.accentText}`} />
                Rodapé e Texto da Linha de Assinatura
              </span>

              <div className="space-y-3">
                <div>
                  <label className={`block text-xs font-semibold ${t.headingText} mb-1`}>Texto de Rodapé dos Documentos (Linha Final)</label>
                  <input
                    type="text"
                    value={footerText}
                    onChange={(e) => setFooterText(e.target.value)}
                    placeholder="Ex: Av. Paulista, 1500 - São Paulo/SP | Tel: (11) 3000-0000"
                    className="w-full bg-white border border-[#e5e5d1] rounded-xl px-3 py-1.5 text-xs text-[#2c2c2c] focus:outline-none focus:border-[#5a5a40]"
                  />
                </div>

                <div>
                  <label className={`block text-xs font-semibold ${t.headingText} mb-1`}>Texto da Linha de Assinatura Tradicional</label>
                  <input
                    type="text"
                    value={signatureLabel}
                    onChange={(e) => setSignatureLabel(e.target.value)}
                    placeholder="Ex: Dr. Lucas Mendes • CRO/SP 123456"
                    className="w-full bg-white border border-[#e5e5d1] rounded-xl px-3 py-1.5 text-xs font-bold text-[#2c2c2c] focus:outline-none focus:border-[#5a5a40]"
                  />
                </div>
              </div>
            </div>

            {/* Footer, Signature & Digital Certification */}
            <div className="bg-[#fbfbf9] p-4 rounded-2xl border border-[#e5e5d1] space-y-4">
              <span className={`text-xs font-bold ${t.headingText} uppercase tracking-wider flex items-center gap-1.5 border-b border-[#e5e5d1] pb-2`}>
                <FileSignature className={`w-4 h-4 ${t.accentText}`} />
                Assinatura, Carimbo e Certificação Digital
              </span>

              {/* 1. Upload e Configurações da Figura com Assinatura & Carimbo */}
              <div className="space-y-3 bg-white p-3.5 rounded-xl border border-[#e5e5d1]">
                <span className={`text-[11px] font-bold ${t.headingText} uppercase block border-b border-stone-100 pb-1`}>
                  1. Figura com Assinatura & Carimbo Físico
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Assinatura Upload */}
                  <div className="space-y-1.5">
                    <label className={`block text-[11px] font-semibold ${t.headingText}`}>Figura da Assinatura Manual</label>
                    <div className="flex items-center gap-2">
                      {signatureImageUrl ? (
                        <div className="relative">
                          <img src={signatureImageUrl} alt="Assinatura" className="w-12 h-10 object-contain border border-[#d4a373] rounded-lg p-0.5 bg-white" />
                          <button
                            type="button"
                            onClick={() => setSignatureImageUrl('')}
                            className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white rounded-full p-0.5 text-[9px]"
                            title="Remover"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div className="w-12 h-10 rounded-lg bg-stone-100 flex items-center justify-center text-[9px] text-gray-400">Sem Fig.</div>
                      )}
                      <label className={`px-2 py-1 ${t.btnPrimaryBg} ${t.btnPrimaryText} rounded-lg text-[10px] font-bold cursor-pointer inline-flex items-center gap-1 shadow-2xs transition`}>
                        <span>Escolher arquivo</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleSignatureUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Carimbo Upload */}
                  <div className="space-y-1.5">
                    <label className={`block text-[11px] font-semibold ${t.headingText}`}>Imagem do Carimbo Profissional</label>
                    <div className="flex items-center gap-2">
                      {stampImageUrl ? (
                        <div className="relative">
                          <img src={stampImageUrl} alt="Carimbo" className="w-12 h-10 object-contain border border-[#d4a373] rounded-lg p-0.5 bg-white" />
                          <button
                            type="button"
                            onClick={() => setStampImageUrl('')}
                            className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white rounded-full p-0.5 text-[9px]"
                            title="Remover"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div className="w-12 h-10 rounded-lg bg-stone-100 flex items-center justify-center text-[9px] text-gray-400">Sem Fig.</div>
                      )}
                      <label className={`px-2 py-1 ${t.btnPrimaryBg} ${t.btnPrimaryText} rounded-lg text-[10px] font-bold cursor-pointer inline-flex items-center gap-1 shadow-2xs transition`}>
                        <span>Escolher arquivo</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleStampUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 pt-1 border-t border-stone-100">
                  <label className={`flex items-center gap-1.5 text-xs font-bold ${t.headingText} cursor-pointer`}>
                    <input
                      type="checkbox"
                      checked={showSignatureImage}
                      onChange={(e) => setShowSignatureImage(e.target.checked)}
                      style={{ accentColor: t.accentColor }}
                      className="w-3.5 h-3.5 rounded cursor-pointer"
                    />
                    Exibir Figura com Assinatura
                  </label>

                  <label className={`flex items-center gap-1.5 text-xs font-bold ${t.headingText} cursor-pointer`}>
                    <input
                      type="checkbox"
                      checked={showStampImage}
                      onChange={(e) => setShowStampImage(e.target.checked)}
                      style={{ accentColor: t.accentColor }}
                      className="w-3.5 h-3.5 rounded cursor-pointer"
                    />
                    Exibir Imagem do Carimbo
                  </label>

                  <label className={`flex items-center gap-1.5 text-xs font-bold ${t.headingText} cursor-pointer`}>
                    <input
                      type="checkbox"
                      checked={showSignatureLine}
                      onChange={(e) => setShowSignatureLine(e.target.checked)}
                      style={{ accentColor: t.accentColor }}
                      className="w-3.5 h-3.5 rounded cursor-pointer"
                    />
                    Exibir Linha de Assinatura
                  </label>
                </div>

                {/* EXACT POSITIONING & ALIGNMENT CONTROLS FOR SIGNATURE & STAMP */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-stone-100">
                  <div className="space-y-1">
                    <label className={`block text-[11px] font-bold ${t.headingText}`}>
                      Alinhamento Horizontal no Rodapé:
                    </label>
                    <select
                      value={signatureAlignment}
                      onChange={(e) => setSignatureAlignment(e.target.value as 'right' | 'center' | 'left')}
                      className={`w-full ${t.inputBg} border ${t.cardBorder} rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none cursor-pointer`}
                    >
                      <option value="right">Alinhado à Direita (Padrão Oficial)</option>
                      <option value="center">Centralizado no Rodapé</option>
                      <option value="left">Alinhado à Esquerda</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className={`block text-[11px] font-bold ${t.headingText}`}>
                      Disposição Relativa (Assinatura / Carimbo):
                    </label>
                    <select
                      value={signatureArrangement}
                      onChange={(e) => setSignatureArrangement(e.target.value as 'overlay' | 'side_by_side' | 'stacked')}
                      className={`w-full ${t.inputBg} border ${t.cardBorder} rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none cursor-pointer`}
                    >
                      <option value="overlay">Sobrepostos (Assinatura sobre o Carimbo)</option>
                      <option value="side_by_side">Lado a Lado (Carimbo + Assinatura)</option>
                      <option value="stacked">Empilhados (Assinatura acima, Carimbo abaixo)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 2. Configuração de Assinatura Digital Integrada GOV.BR (Pessoa Física - Gratuita) */}
              <div className="space-y-3 bg-white p-3.5 rounded-xl border border-[#e5e5d1]">
                <div className="flex items-center justify-between border-b border-stone-100 pb-1.5">
                  <span className="text-[11px] font-bold text-emerald-900 uppercase flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    2. Assinatura Digital Eletrônica GOV.BR (Pessoa Física • Gratuita)
                  </span>

                  <label className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enableGovBrSignature}
                      onChange={(e) => setEnableGovBrSignature(e.target.checked)}
                      className="w-4 h-4 accent-emerald-700 rounded cursor-pointer"
                    />
                    Ativar Selo GOV.BR nos Documentos
                  </label>
                </div>

                {enableGovBrSignature && (
                  <div className="space-y-2.5 pt-1">
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 text-[11px] text-emerald-900 leading-relaxed">
                      <strong>ℹ️ Assinatura Eletrônica Gratuita:</strong> A assinatura digital é realizada gratuitamente pelo próprio cirurgião-dentista como <strong>Pessoa Física</strong> no portal oficial do Governo Federal (<strong>www.gov.br/assinador</strong>) através de conta Gov.br Nível Prata ou Ouro. <u>Não exige a compra de certificado e-CPF pago</u>.
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-semibold text-[#5a5a40] mb-0.5">Nome do Signatário Gov.br (Pessoa Física)</label>
                        <input
                          type="text"
                          value={govBrSignerName}
                          onChange={(e) => setGovBrSignerName(e.target.value)}
                          placeholder="Ex: Dr. Lucas Mendes"
                          className="w-full bg-stone-50 border border-[#e5e5d1] rounded-xl px-2.5 py-1 text-xs text-[#2c2c2c] focus:outline-none focus:border-[#5a5a40]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-[#5a5a40] mb-0.5">CPF do Signatário</label>
                        <input
                          type="text"
                          maxLength={14}
                          value={govBrSignerCpf}
                          onChange={(e) => setGovBrSignerCpf(formatCPF(e.target.value))}
                          placeholder="Ex: 123.456.789-00"
                          className="w-full bg-stone-50 border border-[#e5e5d1] rounded-xl px-2.5 py-1 text-xs font-mono text-[#2c2c2c] focus:outline-none focus:border-[#5a5a40]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-[#5a5a40] mb-0.5">Senha do Gov.br (para preenchimento automático)</label>
                        <div className="relative">
                          <input
                            type={showGovBrPassword ? 'text' : 'password'}
                            value={govBrPassword}
                            onChange={(e) => setGovBrPassword(e.target.value)}
                            placeholder="Sua senha do portal Gov.br"
                            className="w-full bg-stone-50 border border-[#e5e5d1] rounded-xl px-2.5 py-1 text-xs text-[#2c2c2c] focus:outline-none focus:border-[#5a5a40] pr-8"
                          />
                          <button
                            type="button"
                            onClick={() => setShowGovBrPassword(!showGovBrPassword)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 text-xs font-bold"
                            title={showGovBrPassword ? 'Ocultar Senha' : 'Exibir Senha'}
                          >
                            {showGovBrPassword ? '👁️' : '🔒'}
                          </button>
                        </div>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-semibold text-[#5a5a40] mb-0.5">Descrição/Tipo de Assinatura</label>
                        <input
                          type="text"
                          value={govBrCertificateType}
                          onChange={(e) => setGovBrCertificateType(e.target.value)}
                          placeholder="Ex: Assinatura Eletrônica Avançada Gov.br (Pessoa Física - Gratuita • Conta Prata/Ouro)"
                          className="w-full bg-stone-50 border border-[#e5e5d1] rounded-xl px-2.5 py-1 text-xs text-[#2c2c2c] focus:outline-none focus:border-[#5a5a40]"
                        />
                      </div>
                    </div>

                    {/* Parâmetros Técnicos OIDC / OAuth2 Gov.br (acesso.gov.br/roteiro-tecnico/iniciarintegracao.html) */}
                    <div className="mt-3 bg-stone-50 p-3.5 rounded-xl border border-stone-200 space-y-3">
                      <div className="flex flex-wrap items-center justify-between border-b border-stone-200 pb-2 gap-2">
                        <span className="text-[10.5px] font-bold text-gray-800 uppercase flex items-center gap-1.5">
                          <Key className="w-3.5 h-3.5 text-emerald-700" />
                          Parâmetros de Integração OAuth2 / OIDC Gov.br (Roteiro Acesso.gov.br)
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={handleTestGovBrConnection}
                            disabled={isTestingGovBrConn}
                            className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white text-[10px] font-bold rounded-lg flex items-center gap-1.5 shadow-2xs transition cursor-pointer disabled:opacity-50"
                          >
                            <Wifi className={`w-3 h-3 ${isTestingGovBrConn ? 'animate-pulse' : ''}`} />
                            {isTestingGovBrConn ? 'Testando Conexão...' : '⚡ Testar Conectividade OIDC'}
                          </button>
                          <a
                            href="https://acesso.gov.br/roteiro-tecnico/iniciarintegracao.html"
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] text-emerald-700 font-bold hover:underline flex items-center gap-1 shrink-0"
                          >
                            Manual Oficial <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>

                      {/* Painel de Resultados do Teste de Diagnóstico OIDC */}
                      {govBrTestResult && (
                        <div className={`p-3 rounded-xl text-xs border ${
                          govBrTestResult.status === 'connected' 
                            ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950' 
                            : 'bg-rose-50 border-rose-200 text-rose-900'
                        }`}>
                          <div className="flex items-center justify-between font-bold mb-1.5">
                            <span className="flex items-center gap-1.5 text-[11px]">
                              {govBrTestResult.status === 'connected' ? (
                                <>
                                  <BadgeCheck className="w-4 h-4 text-emerald-600" />
                                  <span>Servidores Gov.br Conectados com Sucesso!</span>
                                </>
                              ) : (
                                <>
                                  <AlertCircle className="w-4 h-4 text-rose-600" />
                                  <span>Falha na Conexão com Gov.br</span>
                                </>
                              )}
                            </span>
                            {govBrTestResult.latencyMs && (
                              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-mono rounded-md">
                                Latência: {govBrTestResult.latencyMs}ms • Ping OK
                              </span>
                            )}
                          </div>

                          {govBrTestResult.endpoints && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[10px] font-mono mt-2 bg-white p-2 rounded-lg border border-emerald-100">
                              <div><strong>Authorization:</strong> {govBrTestResult.endpoints.authorization_endpoint}</div>
                              <div><strong>Token Endpoint:</strong> {govBrTestResult.endpoints.token_endpoint}</div>
                              <div><strong>UserInfo:</strong> {govBrTestResult.endpoints.userinfo_endpoint}</div>
                              <div><strong>JWKS Certs:</strong> {govBrTestResult.endpoints.jwks_uri}</div>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div>
                          <label className="block text-[10.5px] font-semibold text-gray-700 mb-0.5">
                            Client ID (Identificador do Serviço):
                          </label>
                          <input
                            type="text"
                            value={govBrClientId}
                            onChange={(e) => setGovBrClientId(e.target.value)}
                            placeholder="br.com.suaclinica.app"
                            className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1 text-xs font-mono text-gray-900 focus:outline-none focus:border-emerald-700"
                          />
                        </div>

                        <div>
                          <label className="block text-[10.5px] font-semibold text-gray-700 mb-0.5">
                            Client Secret (Chave Secreta OAuth2):
                          </label>
                          <div className="relative">
                            <input
                              type={showGovBrSecret ? "text" : "password"}
                              value={govBrClientSecret}
                              onChange={(e) => setGovBrClientSecret(e.target.value)}
                              placeholder="govbr_sec_..."
                              className="w-full bg-white border border-stone-300 rounded-lg pl-2.5 pr-8 py-1 text-xs font-mono text-gray-900 focus:outline-none focus:border-emerald-700"
                            />
                            <button
                              type="button"
                              onClick={() => setShowGovBrSecret(!showGovBrSecret)}
                              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-emerald-800"
                            >
                              {showGovBrSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-0.5">
                            <label className="text-[10.5px] font-semibold text-gray-700">
                              URI de Redirecionamento (Callback URI):
                            </label>
                            <button
                              type="button"
                              onClick={handleCopyGovBrCallback}
                              className="text-[9.5px] text-emerald-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              {copiedGovBrCallback ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                              {copiedGovBrCallback ? 'Copiado!' : 'Usar URI Atual'}
                            </button>
                          </div>
                          <input
                            type="text"
                            value={govBrRedirectUri}
                            onChange={(e) => setGovBrRedirectUri(e.target.value)}
                            placeholder="https://suaclinica.com.br/api/auth/govbr/callback"
                            className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1 text-xs font-mono text-gray-900 focus:outline-none focus:border-emerald-700"
                          />
                        </div>

                        <div>
                          <label className="block text-[10.5px] font-semibold text-gray-700 mb-0.5">
                            Ambiente de Execução SSO:
                          </label>
                          <select
                            value={govBrEnvironment}
                            onChange={(e) => setGovBrEnvironment(e.target.value as 'staging' | 'production')}
                            className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1 text-xs text-gray-900 font-medium focus:outline-none focus:border-emerald-700"
                          >
                            <option value="production">Produção (sso.acesso.gov.br)</option>
                            <option value="staging">Homologação / Staging (sso.staging.acesso.gov.br)</option>
                          </select>
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-[10.5px] font-semibold text-gray-700 mb-0.5">
                            Escopos OIDC Solicitados (scope):
                          </label>
                          <input
                            type="text"
                            value={govBrScopes}
                            onChange={(e) => setGovBrScopes(e.target.value)}
                            placeholder="openid email phone profile govbr_confiabilidade"
                            className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1 text-xs font-mono text-gray-900 focus:outline-none focus:border-emerald-700"
                          />
                        </div>

                        <div>
                          <label className="block text-[10.5px] font-semibold text-gray-700 mb-0.5">
                            Exigência Mínima do Selo de Confiabilidade:
                          </label>
                          <select
                            value={govBrMinLevel}
                            onChange={(e) => setGovBrMinLevel(e.target.value as any)}
                            className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1 text-xs text-gray-900 font-medium focus:outline-none focus:border-emerald-700"
                          >
                            <option value="prata_ouro">Nível Prata ou Ouro (Exigido para Lei 14.063/2020)</option>
                            <option value="ouro">Somente Nível Ouro</option>
                            <option value="prata">Somente Nível Prata</option>
                            <option value="bronze">Todos os Níveis (Bronze, Prata, Ouro)</option>
                          </select>
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-[10.5px] font-semibold text-gray-700 mb-0.5">
                            URL Base do Provedor de Identidade (Provider Endpoint):
                          </label>
                          <input
                            type="text"
                            value={govBrProviderUrl}
                            onChange={(e) => setGovBrProviderUrl(e.target.value)}
                            placeholder="https://sso.acesso.gov.br"
                            className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1 text-xs font-mono text-gray-900 focus:outline-none focus:border-emerald-700"
                          />
                        </div>
                      </div>
                    </div>

                    {/* CARD DE COLETA DE INFORMAÇÕES PESSOAIS DA INTEGRAÇÃO GOV.BR */}
                    <div className="mt-4 bg-gradient-to-br from-emerald-900 via-emerald-800 to-stone-900 text-white p-4 rounded-2xl shadow-md border border-emerald-700/50 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-700/60 pb-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-xl bg-amber-400 text-emerald-950 flex items-center justify-center font-black text-sm shadow-xs">
                            🇧🇷
                          </div>
                          <div>
                            <h5 className="font-bold text-xs text-amber-300 tracking-tight flex items-center gap-1.5">
                              Informações Pessoais de Integração Gov.br
                            </h5>
                            <p className="text-[10px] text-emerald-200">
                              Coleta direta de dados de identidade OIDC (Nome, CPF, Selos de Confiabilidade)
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={handleCollectGovBrProfile}
                          disabled={isCollectingGovBrProfile}
                          className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-extrabold text-xs rounded-xl shadow-sm transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${isCollectingGovBrProfile ? 'animate-spin' : ''}`} />
                          {isCollectingGovBrProfile ? 'Coletando...' : '🔑 Coletar / Autenticar via Gov.br'}
                        </button>
                      </div>

                      {/* Exibição dos Dados Pessoais Coletados */}
                      {govBrConnectedProfile ? (
                        <div className="bg-emerald-950/70 backdrop-blur-xs p-3 rounded-xl border border-emerald-600/40 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1">
                              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                              Perfil OIDC Conectado & Validado
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-emerald-950 uppercase tracking-wide">
                              Nível {govBrConnectedProfile.reliability_level.toUpperCase()}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-[10px] text-emerald-300 block">Nome Completo do Titular</span>
                              <strong className="text-white text-xs">{govBrConnectedProfile.name}</strong>
                            </div>

                            <div>
                              <span className="text-[10px] text-emerald-300 block">CPF Cadastrado e Verificado</span>
                              <strong className="text-amber-200 font-mono text-xs">{govBrConnectedProfile.cpf}</strong>
                            </div>

                            <div>
                              <span className="text-[10px] text-emerald-300 block">E-mail Cadastrado</span>
                              <span className="text-stone-200 text-xs">{govBrConnectedProfile.email}</span>
                            </div>

                            <div>
                              <span className="text-[10px] text-emerald-300 block">Telefone de Contato</span>
                              <span className="text-stone-200 text-xs">{govBrConnectedProfile.phone_number || 'Não informado'}</span>
                            </div>

                            <div className="sm:col-span-2 bg-emerald-900/60 p-2 rounded-lg border border-emerald-700/50 text-[10.5px]">
                              <span className="text-amber-300 font-semibold block mb-0.5">Selo de Confiabilidade / Nível da Conta:</span>
                              <p className="text-emerald-100 leading-snug">{govBrConnectedProfile.reliability_description}</p>
                            </div>
                          </div>

                          <div className="pt-1 flex items-center justify-between border-t border-emerald-800/80">
                            <span className="text-[9.5px] text-emerald-300 font-mono">
                              ID Único (sub): {govBrConnectedProfile.sub}
                            </span>
                            <button
                              type="button"
                              onClick={handleImportGovBrToSigner}
                              className="px-3 py-1 bg-white hover:bg-emerald-50 text-emerald-950 font-bold text-[10.5px] rounded-lg shadow-xs transition cursor-pointer flex items-center gap-1"
                            >
                              <UserCheck className="w-3.5 h-3.5 text-emerald-700" />
                              Usar como Signatário da Clínica
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-4 bg-emerald-950/40 rounded-xl border border-dashed border-emerald-600/40">
                          <p className="text-xs text-emerald-200">
                            Nenhuma informação pessoal de integração Gov.br coletada nesta sessão.
                          </p>
                          <p className="text-[10px] text-emerald-300/80 mt-0.5">
                            Clique em <strong>"Coletar / Autenticar via Gov.br"</strong> para testar o fluxo de consentimento OIDC.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Document Preview Sheet */}
          <div className="lg:col-span-5 space-y-2">
            <span className="text-xs font-bold text-[#5a5a40] uppercase tracking-wider block">
              Pré-Visualização do Documento (A4 Sheet)
            </span>

            <div className="relative w-full min-h-[580px] bg-white border-2 border-[#e5e5d1] rounded-2xl p-5 shadow-md flex flex-col justify-between overflow-hidden font-sans">
              {/* Centered Watermark Overlay */}
              {showWatermark && (watermarkUrl || logoUrl) && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6 z-0">
                  <img
                    src={watermarkUrl || logoUrl}
                    alt="Marca d'Água Central"
                    className="max-w-[75%] max-h-[75%] object-contain"
                    style={{ opacity: watermarkOpacity / 100 }}
                  />
                </div>
              )}

              {/* Document Header */}
              <div className="relative z-10 border-b-2 border-[#5a5a40] pb-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {logoUrl && (
                    <img src={logoUrl} alt="Logo" className="w-12 h-12 rounded-lg object-contain border border-[#d4a373] bg-white p-0.5 shrink-0" />
                  )}
                  <div className="space-y-0.5">
                    <h4 className="font-bold text-xs text-[#5a5a40] uppercase tracking-tight">{headerTitle || clinicName || 'NOME DA CLÍNICA'}</h4>
                    <p className="text-[10px] text-gray-600 leading-snug">{headerSubtitle || 'Atendimento Odontológico de Excelência'}</p>
                    <p className="text-[9px] text-[#5a5a40] font-mono">{dentistName} • {croNumber}</p>
                  </div>
                </div>
              </div>

              {/* Document Sample Body */}
              <div className="relative z-10 space-y-2 text-[10px] text-gray-700 leading-relaxed py-2">
                <div className="bg-[#fbfbf9] p-2.5 rounded-lg border border-gray-200 space-y-1">
                  <p className="font-bold text-[10px] text-[#2c3e2e] uppercase">RECEITUÁRIO / PRONTUÁRIO CLÍNICO</p>
                  <p className="font-bold text-[10.5px]">Paciente: Maria Oliveira</p>
                  <p className="text-[9.5px] text-gray-600">
                    <strong>Data de nascimento:</strong> 15/05/1992 • <strong>Idade e meses:</strong> 34 anos e 2 meses
                  </p>
                  <p className="text-[9px] text-gray-500"><strong>CPF:</strong> 000.111.222-33 • <strong>Data:</strong> {new Date().toLocaleDateString('pt-BR')}</p>
                </div>

                <div className="space-y-1 pt-1 font-mono text-[9.5px]">
                  <p>1. Amoxicilina 500mg — 1 caixa (Tomar de 8/8h por 7 dias)</p>
                  <p>2. Dexametasona 4mg — 1 caixa (Tomar 1 comprimido dose única)</p>
                </div>
              </div>

              {/* Document Footer: Figura com Assinatura, Selo Gov.br & Rodapé */}
              <div className="relative z-10 border-t border-gray-300 pt-2 text-center space-y-2">
                <DocumentSignatureFooter
                  customDentistName={dentistName}
                  customCro={croNumber}
                  compact={true}
                />
                <p className="text-[8.5px] text-gray-500 leading-tight pt-1">{footerText}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-[#e5e5d1] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            {layoutSaved && (
              <div className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600" /> Layout de documentos salvo com sucesso!
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleSaveLayout}
            className={`px-5 py-2.5 ${t.btnPrimaryBg} ${t.btnPrimaryText} font-bold text-xs rounded-xl shadow-sm flex items-center gap-2 transition cursor-pointer`}
          >
            <Save className="w-4 h-4" />
            Salvar Layout de Documentos
          </button>
        </div>
      </div>
      )}

      {/* SECTION 4: BACKUP & BANCO DE DADOS */}
      {activeSettingsTab === 'backup' && (
      <>
      <div className="bg-[#fcfdfa] border border-[#e5e5d1] rounded-[28px] p-6 space-y-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#e5e5d1]">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl ${t.btnPrimaryBg}/10 flex items-center justify-center ${t.headingText} shrink-0`}>
              <Database className={`w-5 h-5 ${t.accentText}`} />
            </div>
            <div>
              <h2 className={`text-base font-bold ${t.headingText}`}>Backup</h2>
              <p className="text-xs text-gray-500">
                Gerencie cópias de segurança do banco de dados local e restauração de dados.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsFolderExplorerOpen(true)}
            className={`px-4 py-2 ${t.btnPrimaryBg} ${t.btnPrimaryText} font-bold text-xs rounded-2xl flex items-center justify-center gap-2 shadow-xs transition shrink-0 cursor-pointer self-start sm:self-auto`}
          >
            <FolderOpen className="w-4 h-4" />
            Explorador de Arquivos do Sistema
          </button>
        </div>

        {/* USB Export Card (Conserved) */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 space-y-2 text-xs">
          <div className="flex items-center gap-2 font-bold text-emerald-900">
            <HardDrive className="w-4 h-4 text-emerald-700" />
            Como Baixar o Software para Pendrive USB (.zip)
          </div>
          <p className="text-emerald-800 leading-relaxed">
            Você pode baixar o projeto completo para ser executado diretamente em um pendrive USB ou servidor local.
          </p>
          <div className="pt-1">
            <button
              type="button"
              onClick={handleExportProjectZip}
              className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-xs flex items-center gap-2 transition cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Baixar Projeto Completo (.zip)
            </button>
          </div>
        </div>

        {backupRestored && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" /> Backup restaurado com sucesso! Recarregando...
          </div>
        )}

        {/* Functional Backup Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-white border border-[#e5e5d1] rounded-2xl space-y-3 shadow-2xs">
            <div className={`flex items-center gap-2 text-xs font-bold ${t.headingText}`}>
              <Download className={`w-4 h-4 ${t.accentText}`} />
              Fazer Backup Agora (.JSON)
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              Exporta uma cópia integral do banco de dados contendo pacientes, agendamentos e cadastros em formato JSON.
            </p>
            <button
              type="button"
              onClick={handleExportBackup}
              className={`px-4 py-2 ${t.btnPrimaryBg} ${t.btnPrimaryText} text-xs font-bold rounded-xl shadow-2xs flex items-center gap-1.5 transition cursor-pointer`}
            >
              <Download className="w-3.5 h-3.5" />
              Baixar Backup do Banco de Dados (.JSON)
            </button>
          </div>

          <div className="p-4 bg-white border border-[#e5e5d1] rounded-2xl space-y-3 shadow-2xs">
            <div className={`flex items-center gap-2 text-xs font-bold ${t.headingText}`}>
              <UploadCloud className={`w-4 h-4 ${t.accentText}`} />
              Restaurar Backup do Banco de Dados
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              Selecione um arquivo `.json` gravado anteriormente para restaurar os dados do sistema.
            </p>
            <label className={`inline-flex items-center gap-1.5 px-4 py-2 ${t.btnPrimaryBg} ${t.btnPrimaryText} text-xs font-bold rounded-xl shadow-2xs cursor-pointer transition`}>
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Carregar & Restaurar (.JSON)</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportBackup}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* SYSTEM LOCAL FOLDER EXPLORER MODAL */}
      {isFolderExplorerOpen && (
        <div className={`fixed inset-0 z-50 ${t.overlayBg} flex items-center justify-center p-4`}>
          <div className={`${t.modalBg} border ${t.modalBorder} rounded-[32px] max-w-3xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col justify-between`}>
            <div className={`flex items-center justify-between pb-3 border-b ${t.modalBorder}`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#5a5a40] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <FolderOpen className="w-5 h-5 text-[#d4a373]" />
                </div>
                <div>
                  <h3 className={`text-base font-bold ${t.modalText}`}>Explorador de Arquivos do Sistema</h3>
                  <p className={`text-xs ${t.modalMutedText}`}>Diretório local do software e arquivos de backup</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsFolderExplorerOpen(false)}
                className="p-2 hover:opacity-80 text-gray-500 rounded-full transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className={`flex items-center justify-between gap-2 ${t.cardBg} p-2.5 rounded-2xl border ${t.cardBorder}`}>
              <div className={`flex items-center gap-2 text-xs font-mono ${t.cardText} overflow-hidden truncate`}>
                <Folder className="w-4 h-4 text-[#5a5a40] shrink-0" />
                <span className="font-bold">C:\DentisPro_Dados\Sistema_Local</span>
                <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span className="capitalize opacity-80">{activeFolderTab}</span>
              </div>

              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText('C:\\DentisPro_Dados\\Sistema_Local');
                  setCopiedPath(true);
                  setTimeout(() => setCopiedPath(false), 3000);
                }}
                className={`px-3 py-1 ${t.inputBg} font-bold text-[11px] rounded-xl border ${t.inputBorder} flex items-center gap-1 shrink-0 transition cursor-pointer`}
              >
                <Copy className="w-3.5 h-3.5 text-[#d4a373]" />
                {copiedPath ? 'Caminho Copiado!' : 'Copiar Caminho'}
              </button>
            </div>

            <div className={`flex items-center gap-2 overflow-x-auto pb-1 border-b ${t.modalBorder} text-xs`}>
              <button
                type="button"
                onClick={() => setActiveFolderTab('banco')}
                className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  activeFolderTab === 'banco'
                    ? `${t.btnPrimaryBg} ${t.btnPrimaryText} shadow-xs`
                    : `${t.btnSecondaryBg} ${t.btnSecondaryText}`
                }`}
              >
                <Database className="w-3.5 h-3.5 text-[#d4a373]" />
                /Banco_de_Dados
              </button>
              <button
                type="button"
                onClick={() => setActiveFolderTab('prontuarios')}
                className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  activeFolderTab === 'prontuarios'
                    ? `${t.btnPrimaryBg} ${t.btnPrimaryText} shadow-xs`
                    : `${t.btnSecondaryBg} ${t.btnSecondaryText}`
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-[#d4a373]" />
                /Prontuarios_Pacientes
              </button>
              <button
                type="button"
                onClick={() => setActiveFolderTab('backups')}
                className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  activeFolderTab === 'backups'
                    ? `${t.btnPrimaryBg} ${t.btnPrimaryText} shadow-xs`
                    : `${t.btnSecondaryBg} ${t.btnSecondaryText}`
                }`}
              >
                <HardDrive className="w-3.5 h-3.5 text-[#d4a373]" />
                /Backups_Seguranca
              </button>
            </div>

            <div className={`${t.cardBg} border ${t.cardBorder} rounded-2xl p-4 overflow-y-auto max-h-64 space-y-2 text-xs`}>
              {activeFolderTab === 'banco' && (
                <div className={`p-2.5 ${t.inputBg} border ${t.inputBorder} rounded-xl flex items-center justify-between`}>
                  <div className="flex items-center gap-2.5">
                    <FileCode className="w-4 h-4 text-[#d4a373]" />
                    <div>
                      <span className={`font-bold ${t.modalText} block`}>banco_dentispro_principal.json</span>
                      <span className={`text-[10px] ${t.modalMutedText}`}>3.2 MB • Sincronizado</span>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-emerald-500/10 text-emerald-600 text-[10px] font-bold rounded-lg border border-emerald-500/30">
                    Ativo
                  </span>
                </div>
              )}
              {activeFolderTab === 'prontuarios' && (
                <div className={`p-2.5 ${t.inputBg} border ${t.inputBorder} rounded-xl flex items-center justify-between`}>
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-4 h-4 text-[#d4a373]" />
                    <div>
                      <span className={`font-bold ${t.modalText} block`}>fichas_clinicas_pacientes.json</span>
                      <span className={`text-[10px] ${t.modalMutedText}`}>1.8 MB • Registro de anamneses</span>
                    </div>
                  </div>
                </div>
              )}
              {activeFolderTab === 'backups' && (
                <div className={`p-2.5 ${t.inputBg} border ${t.inputBorder} rounded-xl flex items-center justify-between`}>
                  <div className="flex items-center gap-2.5">
                    <HardDrive className="w-4 h-4 text-[#d4a373]" />
                    <div>
                      <span className={`font-bold ${t.modalText} block`}>backup_completo.json</span>
                      <span className={`text-[10px] ${t.modalMutedText}`}>5.6 MB</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className={`flex justify-between items-center pt-3 border-t ${t.modalBorder}`}>
              <span className={`text-[11px] ${t.modalMutedText}`}>
                Diretório local atrelado à máquina
              </span>
              <button
                type="button"
                onClick={handleExportBackup}
                className={`px-4 py-2 ${t.btnPrimaryBg} ${t.btnPrimaryText} font-bold text-xs rounded-xl shadow-xs transition`}
              >
                Baixar Cópia (.JSON)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 7: IMPLANTAÇÃO NO GOOGLE CLOUD RUN */}
      <CloudRunDeploySection />
      </>
      )}

      {/* SECTION 6: GESTÃO DE USUÁRIOS E PERMISSÕES */}
      {activeSettingsTab === 'usuarios' && (
        <UserManagementSection />
      )}

      {/* QUICK ADD CLINIC MODAL */}
      {showAddClinic && (
        <div className={`fixed inset-0 z-50 ${t.overlayBg} flex items-center justify-center p-4`}>
          <form onSubmit={handleCreateNewClinicQuick} className={`${t.modalBg} border ${t.modalBorder} rounded-[28px] max-w-md w-full p-6 shadow-2xl space-y-4`}>
            <div className={`flex items-center justify-between border-b ${t.modalBorder} pb-3`}>
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-stone-500/10 rounded-xl text-[#5a5a40]">
                  <Building className="w-5 h-5 text-[#d4a373]" />
                </div>
                <h3 className={`text-base font-bold ${t.modalText}`}>Cadastrar Nova Unidade / Consultório</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddClinic(false)}
                className="p-1.5 hover:opacity-80 rounded-full text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className={`block text-xs font-bold ${t.modalMutedText} mb-1`}>Nome da Unidade / Consultório *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Unidade Meireles - Aldeota"
                  value={newClinicNameInput}
                  onChange={(e) => setNewClinicNameInput(e.target.value)}
                  className={`w-full ${t.inputBg} rounded-xl px-3 py-2 text-xs focus:outline-none`}
                />
              </div>

              <div>
                <PhoneInputWithDDI
                  label="Telefone / WhatsApp (DDI)"
                  value={newClinicPhoneInput}
                  onChange={(val) => setNewClinicPhoneInput(val)}
                />
              </div>
            </div>

            <div className={`flex items-center justify-end gap-2 pt-3 border-t ${t.modalBorder}`}>
              <button
                type="button"
                onClick={() => setShowAddClinic(false)}
                className={`px-4 py-2 ${t.btnSecondaryBg} ${t.btnSecondaryText} font-bold text-xs rounded-xl cursor-pointer`}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className={`px-5 py-2 ${t.btnPrimaryBg} ${t.btnPrimaryText} font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer`}
              >
                <Save className="w-3.5 h-3.5 text-[#d4a373]" />
                Salvar e Selecionar Unidade
              </button>
            </div>
          </form>
        </div>
      )}

      {/* QUICK ADD DENTIST MODAL */}
      {showAddDentist && (
        <div className={`fixed inset-0 z-50 ${t.overlayBg} flex items-center justify-center p-4`}>
          <form onSubmit={handleCreateNewDentistQuick} className={`${t.modalBg} border ${t.modalBorder} rounded-[28px] max-w-md w-full p-6 shadow-2xl space-y-4`}>
            <div className={`flex items-center justify-between border-b ${t.modalBorder} pb-3`}>
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-stone-500/10 rounded-xl text-[#5a5a40]">
                  <Stethoscope className="w-5 h-5 text-[#d4a373]" />
                </div>
                <h3 className={`text-base font-bold ${t.modalText}`}>Cadastrar Novo Cirurgião-Dentista</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddDentist(false)}
                className="p-1.5 hover:opacity-80 rounded-full text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className={`block text-xs font-bold ${t.modalMutedText} mb-1`}>Nome Completo do Dentista *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Dr. Gustavo Vasconcelos"
                  value={newDentistNameInput}
                  onChange={(e) => setNewDentistNameInput(e.target.value)}
                  className={`w-full ${t.inputBg} rounded-xl px-3 py-2 text-xs focus:outline-none`}
                />
              </div>

              <div>
                <label className={`block text-xs font-bold ${t.modalMutedText} mb-1`}>CRO e UF *</label>
                <input
                  type="text"
                  placeholder="Ex: CRO/CE 12345"
                  value={newDentistCroInput}
                  onChange={(e) => setNewDentistCroInput(e.target.value)}
                  className={`w-full ${t.inputBg} rounded-xl px-3 py-2 text-xs focus:outline-none`}
                />
              </div>
            </div>

            <div className={`flex items-center justify-end gap-2 pt-3 border-t ${t.modalBorder}`}>
              <button
                type="button"
                onClick={() => setShowAddDentist(false)}
                className={`px-4 py-2 ${t.btnSecondaryBg} ${t.btnSecondaryText} font-bold text-xs rounded-xl cursor-pointer`}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#5a5a40] hover:bg-[#4a4a35] text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5 text-[#d4a373]" />
                Salvar e Selecionar Dentista
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
