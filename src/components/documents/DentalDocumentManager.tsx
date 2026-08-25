import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DocumentSignatureFooter } from '../common/DocumentSignatureFooter';
import { GovBrSignatureWizardModal } from '../common/GovBrSignatureWizardModal';
import { getPatientAgeAndBirthDate } from '../../utils/patientUtils';
import { formatCPF, formatCNPJ, formatCEP } from '../../utils/formatters';
import { 
  FileText, 
  FileCheck, 
  FilePlus, 
  Printer, 
  Send, 
  Search, 
  User, 
  UserCheck,
  Calendar, 
  Clock, 
  Activity, 
  Stethoscope, 
  Sparkles, 
  Check, 
  X, 
  AlertCircle,
  AlertTriangle,
  Info,
  BookOpen,
  Scissors,
  CheckCircle2,
  Share2,
  ChevronRight,
  Filter,
  Plus,
  Download,
  ExternalLink,
  Trash2,
  FolderOpen,
  ShieldCheck,
  Globe,
  Mail,
  Phone,
  Star,
  SlidersHorizontal,
  Bookmark,
  Save,
  ArrowLeft,
  Home,
  Copy,
  Lock,
  QrCode
} from 'lucide-react';
import { DENTAL_MEDICATIONS_CATALOG } from '../../data/medicationsCatalog';
import { MedicationItem } from '../../types';

import { getThemeStyles } from '../../utils/themeUtils';

export type DocumentCategory = 'declaracao' | 'atestado' | 'solicitacao' | 'todos';

export interface DocumentTemplate {
  id: string;
  category: 'declaracao' | 'atestado' | 'solicitacao';
  title: string;
  subtitle: string;
  icon: React.FC<{ className?: string }>;
  description: string;
}

// Complete Dental & Stomatological CID-10 Catalog (OMS / CFO / SUS)
export const COMMON_DENTAL_CIDS = [
  // K00 - Desenvolvimento e Erupção
  { code: 'K00.0', label: 'K00.0 - Anodontia (Ausência congênita de dentes)' },
  { code: 'K00.1', label: 'K00.1 - Dentes supernumerários (Mesiodens / Quarto molar)' },
  { code: 'K00.2', label: 'K00.2 - Anomalias do tamanho e da forma dos dentes (Microdontia / Taurodontismo)' },
  { code: 'K00.3', label: 'K00.3 - Dentes manchados / Fluorose dentária' },
  { code: 'K00.4', label: 'K00.4 - Distúrbios na formação dos dentes (Hipoplasia de esmalte)' },
  { code: 'K00.5', label: 'K00.5 - Anomalias hereditárias da estrutura (Amelogênese / Dentinogênese imperfeita)' },
  { code: 'K00.6', label: 'K00.6 - Distúrbios da erupção dentária (Retenção / Erupção precoce)' },
  { code: 'K00.7', label: 'K00.7 - Síndrome da erupção dentária (Dentição decídua dolorosa)' },

  // K01 - Inclusos e Impactados
  { code: 'K01.0', label: 'K01.0 - Dentes inclusos (Sem espaço para erupção)' },
  { code: 'K01.1', label: 'K01.1 - Dentes impactados / Sisos retidos (3º Molares)' },

  // K02 - Cáries
  { code: 'K02.0', label: 'K02.0 - Cárie limitada ao esmalte' },
  { code: 'K02.1', label: 'K02.1 - Cárie da dentina' },
  { code: 'K02.2', label: 'K02.2 - Cárie do cemento / raiz' },
  { code: 'K02.3', label: 'K02.3 - Cárie dentária arrestada / paralisada' },
  { code: 'K02.4', label: 'K02.4 - Odontoclasia (Melanodontia infantil)' },
  { code: 'K02.8', label: 'K02.8 - Outras cáries dentárias' },
  { code: 'K02.9', label: 'K02.9 - Cárie dentária, não especificada' },

  // K03 - Tecidos Duros dos Dentes
  { code: 'K03.0', label: 'K03.0 - Atrição excessiva dos dentes (Bruxismo / Desgaste oclusal)' },
  { code: 'K03.1', label: 'K03.1 - Abrasão dentária (Escovação inadequada / Lesão cervical não cariosa)' },
  { code: 'K03.2', label: 'K03.2 - Erosão dentária (Ácida / Bulimia / Refluxo)' },
  { code: 'K03.3', label: 'K03.3 - Reabsorção patológica dos dentes (Interna / Externa)' },
  { code: 'K03.4', label: 'K03.4 - Hipercementose' },
  { code: 'K03.5', label: 'K03.5 - Anquilose dentária' },
  { code: 'K03.6', label: 'K03.6 - Depósitos nos dentes (Cálculo dentário / Tártaro supra e subgengival)' },
  { code: 'K03.7', label: 'K03.7 - Alterações de cor dos tecidos duros pós-erupção (Manchamento por tetraciclina/trauma)' },
  { code: 'K03.8', label: 'K03.8 - Sensibilidade dentinária / Hipersensibilidade' },

  // K04 - Polpa e Periápice
  { code: 'K04.0', label: 'K04.0 - Pulpite (Inflamação aguda ou crônica da polpa dentária)' },
  { code: 'K04.1', label: 'K04.1 - Necrose da polpa dentária' },
  { code: 'K04.2', label: 'K04.2 - Degeneração da polpa (Nódulos pulpares / Calcificação)' },
  { code: 'K04.4', label: 'K04.4 - Periodontite apical aguda de origem pulpar' },
  { code: 'K04.5', label: 'K04.5 - Periodontite apical crônica (Granuloma periapical)' },
  { code: 'K04.6', label: 'K04.6 - Abscesso periapical com fístula (Drenagem ativa)' },
  { code: 'K04.7', label: 'K04.7 - Abscesso periapical sem fístula (Inchaço e dor aguda)' },
  { code: 'K04.8', label: 'K04.8 - Cisto radicular / periapical' },

  // K05 - Periodontia e Gengiva
  { code: 'K05.0', label: 'K05.0 - Gengivite aguda (GUNA / Ulcerativa)' },
  { code: 'K05.1', label: 'K05.1 - Gengivite crônica (Biofilme indutor)' },
  { code: 'K05.2', label: 'K05.2 - Periodontite agressiva / aguda' },
  { code: 'K05.3', label: 'K05.3 - Periodontite crônica (Bolsa periodontal / Perda óssea)' },
  { code: 'K05.4', label: 'K05.4 - Periodontose' },
  { code: 'K05.5', label: 'K05.5 - Abscesso periodontal' },

  // K06 - Outros Transtornos da Gengiva e Rebordo
  { code: 'K06.0', label: 'K06.0 - Retração gengival / Recessão' },
  { code: 'K06.1', label: 'K06.1 - Hiperplasia gengival (Medicamentosa / Inflamatória)' },
  { code: 'K06.2', label: 'K06.2 - Lesões do rebordo alveolar por traumatismo/prótese' },

  // K07 - Anomalias Dentofaciais, Oclusão e DTM/ATM
  { code: 'K07.0', label: 'K07.0 - Macrognatia / Micrognatia (Anomalias do tamanho dos maxilares)' },
  { code: 'K07.1', label: 'K07.1 - Prognatismo / Retrognatismo (Relação da base do crânio)' },
  { code: 'K07.2', label: 'K07.2 - Má oclusão Classe II / III / Mordida Cruzada / Aberta' },
  { code: 'K07.3', label: 'K07.3 - Anomalias da posição dos dentes (Apinhamento / Diastemas)' },
  { code: 'K07.5', label: 'K07.5 - Anormalidades funcionais (Respiração bucal / Deglutição atípica)' },
  { code: 'K07.6', label: 'K07.6 - Transtornos da articulação temporomandibular (DTM / ATM / Estalido)' },

  // K08 - Perda Dentária e Rebordo
  { code: 'K08.0', label: 'K08.0 - Exfoliação prévia de dentes' },
  { code: 'K08.1', label: 'K08.1 - Perda de dentes por acidente, extração ou doença periodontal' },
  { code: 'K08.2', label: 'K08.2 - Atrofia do rebordo alveolar reabsorvido' },
  { code: 'K08.3', label: 'K08.3 - Raiz dentária retida' },
  { code: 'K08.8', label: 'K08.8 - Fratura coronária ou radicular do dente' },

  // K09/K10 - Cistos e Maxilares
  { code: 'K09.0', label: 'K09.0 - Cisto odontogênico (Queratocisto / Dentígero)' },
  { code: 'K10.0', label: 'K10.0 - Torus palatino / Torus mandibular' },
  { code: 'K10.2', label: 'K10.2 - Osteomielite dos maxilares / Osteorradionecrose' },
  { code: 'K10.3', label: 'K10.3 - Alveolite seca pós-exodontia' },

  // K11 - Glândulas Salivares
  { code: 'K11.2', label: 'K11.2 - Sialadenite (Infecção de glândula salivar)' },
  { code: 'K11.5', label: 'K11.5 - Sialolitíase (Cálculo salivar)' },
  { code: 'K11.6', label: 'K11.6 - Mucocele / Rânula' },
  { code: 'K11.7', label: 'K11.7 - Xerostomia (Boca seca)' },

  // K12/K13/K14 - Estomatologia e Língua
  { code: 'K12.0', label: 'K12.0 - Aftas bucais recorrentes (Estomatite aftosa)' },
  { code: 'K12.1', label: 'K12.1 - Estomatite protética' },
  { code: 'K12.2', label: 'K12.2 - Celulite e abscesso bucal / Angina de Ludwig' },
  { code: 'K13.0', label: 'K13.0 - Queilite angular / Queilite actínica' },
  { code: 'K13.2', label: 'K13.2 - Leucoplasia / Eritroplasia bucal' },
  { code: 'K14.0', label: 'K14.0 - Glossite' },
  { code: 'K14.1', label: 'K14.1 - Língua geográfica' },
  { code: 'K14.5', label: 'K14.5 - Língua plicada / fissurada' },
  { code: 'K14.6', label: 'K14.6 - Glossodinia (Síndrome da ardência bucal)' },

  // Traumas, Implantes e Preventiva
  { code: 'S02.5', label: 'S02.5 - Fratura do dente / Trauma alveolodentário' },
  { code: 'S03.2', label: 'S03.2 - Luxação / Avulsão de dente' },
  { code: 'R51', label: 'R51 - Dor orofacial / Cefaleia' },
  { code: 'Z01.2', label: 'Z01.2 - Exame odontológico de rotina / Avaliação clínica' },
  { code: 'Z46.3', label: 'Z46.3 - Colocação e ajustamento de prótese dentária ou aparelho ortodôntico' },
  { code: 'Z96.5', label: 'Z96.5 - Presença de implantes de dente e de mandíbula / Implante dentário' }
];

export const DENTAL_DOCUMENT_TEMPLATES: DocumentTemplate[] = [
  // ATESTADOS & RECEITUÁRIOS
  {
    id: 'receituario_controle_especial',
    category: 'atestado',
    title: 'Receituário de Controle Especial (2 Vias)',
    subtitle: 'Modelo em 2 Vias (Farmácia / Paciente) - Medicamentos Controlados / Antibióticos',
    icon: FileText,
    description: 'Receituário de controle especial em 2 vias com identificação do emitente, comprador e fornecedor (Portaria 344/98 / Anvisa).'
  },
  {
    id: 'atestado_padrao',
    category: 'atestado',
    title: 'Atestado Odontológico com CID',
    subtitle: 'Afastamento de atividades / Atendimento operatório ou consulta',
    icon: FileText,
    description: 'Atestado formal com CID, data, horário, período e dias de afastamento das atividades laborais/escolares.'
  },
  {
    id: 'atestado_comparecimento',
    category: 'atestado',
    title: 'Atestado de Horas de Comparecimento',
    subtitle: 'Comprovação de presença no consultório',
    icon: Clock,
    description: 'Comprova o horário de entrada e saída do paciente no atendimento odontológico para fins empregatícios.'
  },

  // DECLARAÇÕES & TERMOS
  {
    id: 'declaracao_comparecimento',
    category: 'declaracao',
    title: 'Declaração de Atendimento Odontológico',
    subtitle: 'Declaração simples de consulta',
    icon: FileCheck,
    description: 'Declaração formal de prestação de serviço e tratamento odontológico realizado.'
  },
  {
    id: 'tcle_endodontia',
    category: 'declaracao',
    title: 'TCLE - Tratamento de Endodontia (Canal)',
    subtitle: 'Termo de Consentimento Livre e Esclarecido',
    icon: Stethoscope,
    description: 'Termo detalhando procedimento endodôntico, fratura de instrumentos, retratamento e cuidados.'
  },
  {
    id: 'tcle_protese_pino',
    category: 'declaracao',
    title: 'TCLE - Remoção de Prótese / Pino Intrarradicular',
    subtitle: 'Termo de consentimento para remoção',
    icon: FileText,
    description: 'Esclarecimento de riscos na remoção de blocos, próteses e pinos pré-existentes.'
  },
  {
    id: 'tcle_raspagem',
    category: 'declaracao',
    title: 'TCLE - Raspagem Supra-Gengival / Periodontia',
    subtitle: 'Consentimento de tratamento periodontal',
    icon: Activity,
    description: 'Termo de consentimento informado para procedimentos de raspagem, profilaxia e ultrassom.'
  },
  {
    id: 'termo_responsabilidade_cirurgico',
    category: 'declaracao',
    title: 'Termo de Responsabilidade Cirúrgica',
    subtitle: 'Cirurgias e extrações de dentes inclusos/sisos',
    icon: Scissors,
    description: 'Termo de responsabilidade para cirurgias orais maiores, dentes siso e guias de convênio.'
  },
  {
    id: 'descricao_cirurgica',
    category: 'declaracao',
    title: 'Descrição Cirúrgica (Formulário de Contingência)',
    subtitle: 'Relatório completo de ato cirúrgico',
    icon: Activity,
    description: 'Formulário detalhado com equipe cirúrgica, início/fim, caráter (eletiva/urgência), OPME e descrição.'
  },
  {
    id: 'relatorio_paio_pos_procedimento',
    category: 'declaracao',
    title: 'Protocolo de Anestesia Intra-Oral (PAIO)',
    subtitle: 'Atendimento clínico, anestesia tópica, anestesia injetável e registro pós-procedimento',
    icon: Stethoscope,
    description: 'Relatório clínico unificado contendo o protocolo de anestesia intra-oral (tópica e tubetes injetáveis), procedimento realizado, intercorrências e orientações.'
  },

  // SOLICITAÇÕES
  {
    id: 'solicitacao_sangue',
    category: 'solicitacao',
    title: 'Solicitação de Exames de Sangue (Pré-Operatório)',
    subtitle: 'Hemograma, Coagulograma, Glicemia, etc.',
    icon: Activity,
    description: 'Solicitação completa de exames laboratoriais hematológicos, bioquímicos e sorológicos pré-cirúrgicos.'
  },
  {
    id: 'solicitacao_tomografia',
    category: 'solicitacao',
    title: 'Solicitação de Tomografia Cone Beam (CBCT)',
    subtitle: 'Maxila e Mandíbula / Rebordo ósseo',
    icon: FilePlus,
    description: 'Pedido de tomografia cone beam (CBCT) para avaliação de volume ósseo, implantes e dentes inclusos.'
  },
  {
    id: 'solicitacao_ressonancia_atm',
    category: 'solicitacao',
    title: 'Solicitação de Ressonância Magnética das ATMs',
    subtitle: 'Articulações temporomandibulares direita e esquerda',
    icon: Stethoscope,
    description: 'Pedido de ressonância magnética com cortes sagital e coronal em boca aberta e fechada.'
  },
  {
    id: 'solicitacao_escaneamento_3d',
    category: 'solicitacao',
    title: 'Solicitação de Escaneamento Intraoral 3D',
    subtitle: 'Arcada superior/inferior para planejamento 3D',
    icon: Sparkles,
    description: 'Pedido de escaneamento digital 3D de dentes e mucosas com indicação de clínicas de radiologia.'
  },
  {
    id: 'solicitacao_parecer_especialista',
    category: 'solicitacao',
    title: 'Solicitação de Parecer',
    subtitle: 'Encaminhamento para especialidades odontológicas',
    icon: User,
    description: 'Carta de encaminhamento formal para cirurgiões bucomaxilofaciais ou outras especialidades odontológicas.'
  },
  {
    id: 'justificativa_clinica',
    category: 'solicitacao',
    title: 'Justificativa Clínica para Convênios / Guia TUSS',
    subtitle: 'Justificativa de procedimentos odontológicos',
    icon: CheckCircle2,
    description: 'Laudo justificando procedimentos como aumento de coroa, imobilização ou próteses para convênios.'
  }
];

export const DentalDocumentManager: React.FC = () => {
  const { 
    patients, 
    clinicInfo, 
    activeProfessional, 
    activeClinic,
    savedClinicDocuments, 
    addSavedClinicDocument, 
    deleteSavedClinicDocument, 
    markDocumentGovBrSigned,
    selectedPatientId: globalSelectedPatientId,
    layoutTheme,
    tussProcedures
  } = useApp();

  const effectiveClinicName = (activeClinic && activeClinic.id !== 'todas') ? activeClinic.name : (clinicInfo.headerTitle || clinicInfo.name || 'DentisPro');
  const effectiveClinicAddress = (activeClinic && activeClinic.id !== 'todas') ? activeClinic.address : (clinicInfo.address || 'Rua Visconde de Mauá 2600');
  const effectiveClinicCity = (activeClinic && activeClinic.id !== 'todas') ? activeClinic.city : (clinicInfo.city || 'Fortaleza - CE');
  const effectiveClinicPhone = (activeClinic && activeClinic.id !== 'todas') ? activeClinic.phone : (clinicInfo.phone || '(85) 98684-6424');
  const effectiveClinicEmail = (activeClinic && activeClinic.id !== 'todas') ? activeClinic.email : (clinicInfo.email || 'contato@dentispro.com.br');

  const effectiveDentistName = activeProfessional?.name || clinicInfo.dentistName || 'Hugo Andres Iglesias Ricoy';
  const effectiveDentistCro = activeProfessional?.cro || clinicInfo.cro || 'CRO/CE 5925';
  const effectiveDentistSpecialty = activeProfessional?.specialty || clinicInfo.specialty || 'Cirurgião-Dentista';

  const t = getThemeStyles(layoutTheme);

  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory>('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [showRecentsSection, setShowRecentsSection] = useState(true);
  const [showAllPatientsDocs, setShowAllPatientsDocs] = useState(false);
  const [selectedRecentPatient, setSelectedRecentPatient] = useState<{ id?: string; name: string } | null>(null);
  const [recentsSearchQuery, setRecentsSearchQuery] = useState('');

  // Digital Signature Validity & Hash ITI Verification States
  const [copiedHashToast, setCopiedHashToast] = useState<boolean>(false);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState<boolean>(false);

  const handleCopyDocumentHash = (hashStr?: string) => {
    const codeToCopy = hashStr || 'A8F9-4B12-8C01-D9E3-2F45-6A78-90BC-4E11';
    if (navigator.clipboard) {
      navigator.clipboard.writeText(codeToCopy);
    }
    setCopiedHashToast(true);
    setTimeout(() => setCopiedHashToast(false), 2200);
  };

  const handleVerifyHashOnGovernmentPortal = () => {
    window.open('https://validar.iti.gov.br', '_blank', 'noopener,noreferrer');
    setIsVerificationModalOpen(true);
  };

  // Selected template & parameters modal state
  const [activeTemplate, setActiveTemplate] = useState<DocumentTemplate | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<string>(globalSelectedPatientId || patients[0]?.id || '');
  const [customPatientName, setCustomPatientName] = useState<string>('');
  const [customPatientAgeYears, setCustomPatientAgeYears] = useState<string>('36');
  const [customPatientAgeMonths, setCustomPatientAgeMonths] = useState<string>('0');

  // Synchronize with global selectedPatientId when navigating from patient profile
  React.useEffect(() => {
    if (globalSelectedPatientId) {
      setSelectedPatientId(globalSelectedPatientId);
      setCustomPatientName('');
    }
  }, [globalSelectedPatientId]);
  
  // Parameters for Atestado
  const [atendimentoType, setAtendimentoType] = useState<string>('operatório');
  const [procedureDetail, setProcedureDetail] = useState<string>('');
  const [cidCode, setCidCode] = useState<string>('K08.1');
  const [customCid, setCustomCid] = useState<string>('');
  const [isManualCid, setIsManualCid] = useState<boolean>(false);
  const [cidSearchQuery, setCidSearchQuery] = useState<string>('');
  const [docDate, setDocDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [docTime, setDocTime] = useState<string>('14:00');
  const [periodoStr, setPeriodoStr] = useState<string>('Integral');
  const [afastamentoDias, setAfastamentoDias] = useState<string>('1');

  // Helper function to clean CEP from city string
  const cleanCityName = (cityStr?: string) => {
    if (!cityStr) return 'Fortaleza - CE';
    return cityStr
      .replace(/\s*\([^)]*CEP[^)]*\)/gi, '')
      .replace(/\s*,?\s*CEP:?\s*[\d.-]+/gi, '')
      .replace(/\s*,?\s*CEP:?\s*[^\s,]+/gi, '')
      .replace(/\b\d{2}\.?\d{3}-?\d{3}\b/g, '')
      .replace(/\s*-\s*CE\s*-\s*CE/gi, ' - CE')
      .trim();
  };

  // Helper function to format City only (without UF or CEP)
  const formatCityOnly = (cityStr?: string) => {
    if (!cityStr) return 'Fortaleza';
    return cityStr
      .replace(/\s*\([^)]*CEP[^)]*\)/gi, '')
      .replace(/\s*,?\s*CEP:?\s*[\d.-]+/gi, '')
      .replace(/\s*,?\s*CEP:?\s*[^\s,]+/gi, '')
      .replace(/\b\d{2}\.?\d{3}-?\d{3}\b/g, '')
      .replace(/\s*-\s*[A-Z]{2}\b/gi, '')
      .replace(/\s*\/[A-Z]{2}\b/gi, '')
      .trim();
  };

  // Helper function to open native system print dialog
  const handlePrintSystemWindow = (doc: { id?: string; title: string; patientName: string; professionalName?: string; formattedDateStr?: string; summary?: string }) => {
    const isSpecialPrescription = doc.id === 'receituario_controle_especial' || doc.title.toLowerCase().includes('controle especial');
    const isTomography = doc.id === 'solicitacao_tomografia' || doc.title.toLowerCase().includes('tomografia');
    const cleanCity = cleanCityName(effectiveClinicCity);
    const cityOnly = formatCityOnly(effectiveClinicCity);
    const cepFormatted = formatCEP(clinicInfo.cep || '60.160-110');
    const docDateStr = doc.formattedDateStr || formattedFormattedDate || new Date().toLocaleDateString('pt-BR');
    const dentistName = doc.professionalName || effectiveDentistName;
    const dentistCro = effectiveDentistCro;

    const sigAlign = clinicInfo.signatureAlignment || 'right';
    const sigArrangement = clinicInfo.signatureArrangement || 'overlay';
    const showSigImg = (clinicInfo.showSignatureImage ?? true) && clinicInfo.signatureImageUrl;
    const showStampImg = (clinicInfo.showStampImage ?? true) && clinicInfo.stampImageUrl;

    const signatureBlockHtml = `
      <div style="margin-top: 15px; display: flex; flex-direction: column; align-items: ${sigAlign === 'right' ? 'flex-end' : sigAlign === 'center' ? 'center' : 'flex-start'}; text-align: ${sigAlign};">
        ${sigArrangement === 'side_by_side' ? `
          <div style="display: flex; align-items: center; justify-content: center; gap: 15px; margin-bottom: 5px;">
            ${showStampImg ? `<img src="${clinicInfo.stampImageUrl}" style="height: 60px; max-width: 150px; object-fit: contain;" alt="Carimbo" />` : ''}
            ${showSigImg ? `<img src="${clinicInfo.signatureImageUrl}" style="height: 60px; max-width: 200px; object-fit: contain;" alt="Assinatura" />` : ''}
          </div>
        ` : sigArrangement === 'stacked' ? `
          <div style="display: flex; flex-direction: column; align-items: center; gap: 8px; margin-bottom: 5px;">
            ${showSigImg ? `<img src="${clinicInfo.signatureImageUrl}" style="height: 60px; max-width: 200px; object-fit: contain;" alt="Assinatura" />` : ''}
            ${showStampImg ? `<img src="${clinicInfo.stampImageUrl}" style="height: 60px; max-width: 150px; object-fit: contain;" alt="Carimbo" />` : ''}
          </div>
        ` : `
          <div style="position: relative; width: 280px; min-height: 75px; margin-bottom: 5px;">
            ${showStampImg ? `<div style="position: absolute; ${sigAlign === 'right' ? 'right: 0' : sigAlign === 'center' ? 'left: 50%; transform: translateX(-50%);' : 'left: 0'}; bottom: 0; z-index: 1;"><img src="${clinicInfo.stampImageUrl}" style="height: 65px; max-width: 150px; object-fit: contain;" alt="Carimbo" /></div>` : ''}
            ${showSigImg ? `<div style="position: absolute; ${sigAlign === 'right' ? 'right: 20px' : sigAlign === 'center' ? 'left: 50%; transform: translateX(-50%);' : 'left: 20px'}; top: 0; z-index: 2;"><img src="${clinicInfo.signatureImageUrl}" style="height: 65px; max-width: 210px; object-fit: contain;" alt="Assinatura" /></div>` : ''}
          </div>
        `}
        ${(clinicInfo.showSignatureLine ?? true) ? `
          <div style="width: 250px; border-top: 1.5px solid #222; margin-top: 5px; padding-top: 4px; font-weight: bold; font-size: 11px;">
            ${clinicInfo.signatureLabel || `${dentistName} • ${dentistCro}`}
          </div>
        ` : ''}
      </div>
    `;

    const printWindow = window.open('', '_blank', 'width=850,height=950');
    if (!printWindow) {
      window.print();
      return;
    }

    let htmlContent = '';

    if (isSpecialPrescription) {
      const prescriptionText = (doc.summary && !doc.summary.includes('gerado para o(a) paciente'))
        ? doc.summary
        : (specialPrescriptionText || 'Amoxicilina 500mg + Clavulanato de Potássio 125mg ---------------- 1 caixa\nTomar 1 comprimido por via oral a cada 8 horas durante 7 dias.');

      htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>${doc.title} - ${doc.patientName}</title>
  <style>
    @page { size: A4 portrait; margin: 1.5cm; }
    * { box-sizing: border-box; }
    body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1a1a1a; padding: 0; margin: 0 auto; background: #fff; line-height: 1.4; }
    .top-rectangles { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px; }
    .rect-box { border: 1.5px solid #222; border-radius: 6px; padding: 10px 12px; font-size: 10.5px; min-height: 155px; display: flex; flex-direction: column; justify-content: space-between; background: #fff; }
    .box-title { font-size: 10.5px; font-weight: bold; text-transform: uppercase; border-bottom: 1px solid #ccc; padding-bottom: 3px; margin-bottom: 5px; color: #2c3e2e; }
    .emitente-name { font-size: 11.5px; font-weight: bold; color: #000; }
    .emitente-phone { font-size: 10.5px; font-weight: 600; color: #444; }
    .clinic-title { font-size: 11px; font-weight: bold; text-transform: uppercase; margin-top: 4px; }
    .clinic-addr { font-size: 10px; color: #555; }
    .patient-box { background: #fafafa; border: 1px solid #ccc; border-radius: 6px; padding: 12px; margin-bottom: 12px; }
    .patient-name { font-size: 13px; font-weight: bold; text-decoration: underline; }
    .prescription-title { font-size: 11px; font-weight: bold; text-transform: uppercase; margin-top: 10px; color: #333; }
    .prescription-body { background: #fff; border: 1px solid #ddd; border-radius: 4px; padding: 10px; font-size: 11.5px; white-space: pre-line; margin-top: 4px; font-family: inherit; line-height: 1.5; }
    .date-line { text-align: right; font-size: 11px; font-weight: 600; margin-top: 10px; color: #444; }
    .grid-bottom { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .bottom-box { border: 1.5px solid #222; border-radius: 6px; padding: 10px 12px; font-size: 10.5px; line-height: 1.7; min-height: 135px; display: flex; flex-direction: column; justify-content: space-between; background: #fff; }
    .bottom-title { font-size: 10.5px; font-weight: bold; text-transform: uppercase; border-bottom: 1px solid #ccc; padding-bottom: 3px; margin-bottom: 5px; color: #2c3e2e; }
    @media print {
      body { padding: 0; margin: 0; }
      .rect-box, .bottom-box { border: 1.5px solid #000 !important; }
      .patient-box { border-color: #888 !important; }
    }
  </style>
</head>
<body>
  <div class="top-rectangles">
    <div class="rect-box">
      <div>
        <div class="box-title">IDENTIFICAÇÃO DO EMITENTE</div>
        <div class="emitente-name">${dentistName} • ${dentistCro}</div>
        <div class="emitente-phone">Telefones: ${effectiveClinicPhone}</div>
      </div>
      <div style="border-top: 1px solid #eee; margin-top: 4px; padding-top: 4px;">
        ${effectiveClinicName ? `<div class="clinic-title">${effectiveClinicName}</div>` : ''}
        <div class="clinic-addr">${effectiveClinicAddress}</div>
        <div class="clinic-addr">${cityOnly} - CE • CEP: ${cepFormatted}</div>
      </div>
    </div>

    <div class="rect-box">
      <div>
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #ccc; padding-bottom: 3px; margin-bottom: 4px;">
          <span class="box-title" style="border-bottom: none; margin-bottom: 0; padding-bottom: 0;">ASSINATURA DO EMITENTE</span>
          <div style="display: flex; gap: 4px;">
            <span style="font-size: 8.5px; font-weight: bold; background: #f0f0f0; border: 1px solid #ccc; padding: 1px 4px; border-radius: 3px;">1ª Via Farmácia</span>
            <span style="font-size: 8.5px; font-weight: bold; background: #fafafa; border: 1px solid #ddd; padding: 1px 4px; border-radius: 3px; color: #666;">2ª Via Paciente</span>
          </div>
        </div>
        <div style="margin: 4px 0; min-height: 64px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px;">
          ${showSigImg ? `<div style="display: flex; align-items: center; justify-content: center; transform: rotate(-1deg);"><img src="${clinicInfo.signatureImageUrl}" style="height: 32px; max-width: 130px; object-fit: contain;" alt="Assinatura" /></div>` : ''}
          ${showStampImg ? `<div style="display: flex; align-items: center; justify-content: center; transform: rotate(-2deg);"><img src="${clinicInfo.stampImageUrl}" style="height: 30px; max-width: 110px; object-fit: contain; border: 1px solid #999; padding: 1px; background: #fff;" alt="Carimbo" /></div>` : ''}
          ${!showStampImg && !showSigImg ? `<span style="font-size: 9px; color: #888;">(Assinatura / Carimbo do Emitente)</span>` : ''}
        </div>
      </div>
      <div style="border-top: 1px solid #444; padding-top: 2px; text-align: center;">
        <div style="font-size: 9.5px; font-weight: bold; color: #000;">${dentistName}</div>
        <div style="font-size: 8.5px; font-family: monospace; color: #555;">${dentistCro} • Cirurgião-Dentista</div>
      </div>
    </div>
  </div>

  <div class="patient-box">
    <div style="font-size: 12px;"><strong>Paciente:</strong> <span class="patient-name">${doc.patientName}</span></div>
    <div class="prescription-title">Prescrição</div>
    <div style="font-size: 10px; font-style: italic; color: #666;">Uso interno (via oral)</div>
    <div class="prescription-body">• ${prescriptionText}</div>
    <div class="date-line">${cityOnly}, ${docDateStr}</div>
  </div>

  <div class="grid-bottom">
    <div class="bottom-box">
      <div>
        <div class="bottom-title">IDENTIFICAÇÃO DO COMPRADOR</div>
        <div><strong>Nome:</strong> ___________________________________</div>
        <div><strong>Ident Órg. Emissor:</strong> ________________________</div>
        <div><strong>End:</strong> ____________________________________</div>
        <div><strong>Telefone:</strong> ________________________________</div>
        <div><strong>Cidade:</strong> ______________________ <strong>UF:</strong> _____</div>
      </div>
    </div>
    <div class="bottom-box">
      <div>
        <div class="bottom-title">IDENTIFICAÇÃO DO FORNECEDOR</div>
      </div>
      <div style="text-align: center; margin-top: 15px;">
        <div style="border-top: 1px solid #666; padding-top: 3px; font-size: 9.5px; font-weight: 600;">Assinatura / Carimbo Farmacêutico</div>
        <div style="font-size: 10px; margin-top: 6px;"><strong>Data:</strong> ____ / ____ / ________</div>
      </div>
    </div>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() { window.print(); }, 300);
    };
  </script>
</body>
</html>
      `;
    } else if (isTomography) {
      const selectedRegionsList = getSelectedTomographyRegions();
      const selectedIndicationsList = getSelectedTomographyIndications();
      const selectedDeliveryList = getSelectedTomographyDelivery();
      const fovLabel = TOMOGRAPHY_FOV_LABELS[tomographyFov] || tomographyFov;

      htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>${doc.title} - ${doc.patientName}</title>
  <style>
    @page { size: A4 portrait; margin: 1.5cm; }
    * { box-sizing: border-box; }
    body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 0; color: #222; line-height: 1.4; margin: 0 auto; background: #fff; overflow-x: hidden; }
    .header { border-bottom: 2px solid #2c3e2e; padding-bottom: 10px; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: flex-start; }
    .clinic-info { display: flex; align-items: center; gap: 10px; }
    .clinic-logo { height: 48px; width: 48px; object-fit: contain; }
    .dentist-name { font-size: 13px; font-weight: bold; color: #1b281d; }
    .dentist-cro { font-size: 10px; color: #555; font-family: monospace; }
    .dentist-sub { font-size: 9.5px; color: #666; }
    .clinic-right { text-align: right; max-width: 280px; }
    .clinic-title { font-size: 14px; font-weight: bold; color: #1b281d; text-transform: uppercase; line-height: 1.2; }
    .clinic-detail { font-size: 10px; color: #555; margin-top: 1px; }
    .title-box { text-align: center; margin: 12px 0 10px; }
    .title { font-size: 16px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; color: #1b281d; border-bottom: 1.5px solid #1b281d; display: inline-block; padding-bottom: 2px; }
    .title-sub { font-size: 9.5px; color: #666; font-weight: 600; text-transform: uppercase; margin-top: 2px; }
    .patient-card { background: #fbfbf8; border: 1px solid #dcdccb; border-radius: 6px; padding: 8px 12px; margin-bottom: 10px; font-size: 11.5px; display: flex; justify-content: space-between; align-items: center; }
    .section-card { background: #fff; border: 1px solid #e0e0d5; border-radius: 6px; padding: 10px 12px; margin-bottom: 10px; }
    .section-title { font-size: 10.5px; font-weight: bold; text-transform: uppercase; color: #2c3e2e; border-bottom: 1px solid #ebebe0; padding-bottom: 3px; margin-bottom: 6px; display: flex; align-items: center; justify-content: space-between; }
    .regions-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 5px; font-size: 10.5px; }
    .region-item { background: #f7f7f2; border: 1px solid #e3e3d6; border-radius: 4px; padding: 4px 7px; font-weight: 600; color: #222; }
    .indications-list { margin: 0; padding-left: 16px; font-size: 10.5px; line-height: 1.5; }
    .indications-list li { margin-bottom: 2px; font-weight: 500; }
    .tech-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 10.5px; }
    .tech-box { background: #fafaf6; border: 1px solid #e6e6dc; border-radius: 4px; padding: 6px 8px; }
    .tech-label { font-size: 9.5px; font-weight: bold; text-transform: uppercase; color: #555; margin-bottom: 2px; }
    .notes-box { font-size: 10.5px; background: #fffef7; border: 1px solid #e9e4be; border-radius: 4px; padding: 6px 8px; line-height: 1.4; color: #333; }
    .date-row { text-align: right; font-size: 10.5px; font-weight: 600; color: #2c3e2e; margin-top: 12px; margin-bottom: 8px; text-transform: uppercase; }
    .footer { margin-top: 12px; }
    @media print {
      body { padding: 0; margin: 0; background: none; }
      .patient-card, .section-card, .region-item, .tech-box, .notes-box { border-color: #777 !important; background: none !important; }
      img { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="clinic-info">
      ${clinicInfo.logoUrl ? `<img src="${clinicInfo.logoUrl}" class="clinic-logo" alt="Logo" />` : ''}
      <div>
        <div class="dentist-name">${dentistName}</div>
        <div class="dentist-cro">Cirurgião-Dentista ${dentistCro}</div>
        <div class="dentist-sub">EPAO: ${clinicInfo.epao || '825 CE'} • CNPJ: ${formatCNPJ(clinicInfo.cnpj || '22.144.932/0001-40')}</div>
      </div>
    </div>
    <div class="clinic-right">
      <div class="clinic-title">${effectiveClinicName || clinicInfo.name || 'DentisPro'}</div>
      <div class="clinic-detail">${effectiveClinicAddress}</div>
      <div class="clinic-detail">${cityOnly} - CE • CEP: ${cepFormatted}</div>
      <div class="clinic-detail">Tel: ${effectiveClinicPhone}</div>
    </div>
  </div>

  <div class="title-box">
    <div class="title">SOLICITAÇÃO DE TOMOGRAFIA CONE BEAM (CBCT)</div>
    <div class="title-sub">EXAME RADIOLÓGICO TRIDIMENSIONAL DE FEIXE CÔNICO</div>
  </div>

  <div class="patient-card">
    <div><strong>Paciente:</strong> <span style="font-size: 12.5px; font-weight: bold; text-decoration: underline;">${doc.patientName}</span></div>
    <div><strong>Idade:</strong> ${patientAge}</div>
  </div>

  <div class="section-card">
    <div class="section-title">
      <span>1. REGIÕES ANATÔMICAS SOLICITADAS</span>
      <span style="font-size: 9px; font-weight: bold; background: #e8e8d8; padding: 2px 6px; border-radius: 4px;">${selectedRegionsList.length} Região(ões) Selecionada(s)</span>
    </div>
    <div class="regions-grid">
      ${selectedRegionsList.map(r => `<div class="region-item">☑ ${r}</div>`).join('')}
    </div>
  </div>

  <div class="section-card">
    <div class="section-title">2. FINALIDADE CLÍNICA E INDICAÇÕES DO EXAME</div>
    <ul class="indications-list">
      ${selectedIndicationsList.map(ind => `<li><strong>•</strong> ${ind}</li>`).join('')}
    </ul>
  </div>

  <div class="section-card">
    <div class="section-title">3. ESPECIFICAÇÕES TÉCNICAS E FORMATO DE ENTREGA</div>
    <div class="tech-grid">
      <div class="tech-box">
        <div class="tech-label">Campo de Visão (FOV):</div>
        <div style="font-weight: bold; color: #1b281d;">${fovLabel}</div>
      </div>
      <div class="tech-box">
        <div class="tech-label">Formatos Solicitados:</div>
        <div style="font-weight: 600;">${selectedDeliveryList.map(d => `• ${d}`).join('<br/>')}</div>
      </div>
    </div>
  </div>

  ${tomographyNotes ? `
  <div class="section-card">
    <div class="section-title">4. OBSERVAÇÕES E ORIENTAÇÕES CLÍNICAS</div>
    <div class="notes-box">${tomographyNotes}</div>
  </div>
  ` : ''}

  <div class="date-row">
    ${cityOnly}, ${docDateStr}
  </div>

  <div class="footer">
    ${signatureBlockHtml}
    <p style="font-size: 9px; color: #777; margin-top: 10px; text-align: center;">Documento emitido e registrado no sistema DentisPro (https://dentispro.com.br)</p>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() { window.print(); }, 300);
    };
  </script>
</body>
</html>
      `;
    } else {
      htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>${doc.title} - ${doc.patientName}</title>
  <style>
    @page { size: A4 portrait; margin: 1.5cm; }
    * { box-sizing: border-box; }
    body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 0; color: #2c2c2c; line-height: 1.5; margin: 0 auto; background: #fff; overflow-x: hidden; }
    .header { border-bottom: 2px solid #2c3e2e; padding-bottom: 12px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-start; }
    .clinic-info { display: flex; align-items: center; gap: 10px; }
    .clinic-logo { height: 48px; width: 48px; object-fit: contain; }
    .dentist-name { font-size: 13px; font-weight: bold; color: #1b281d; }
    .dentist-cro { font-size: 10px; color: #555; font-family: monospace; }
    .dentist-sub { font-size: 9.5px; color: #666; }
    .clinic-right { text-align: right; max-width: 280px; }
    .clinic-title { font-size: 14px; font-weight: bold; color: #2c3e2e; text-transform: uppercase; line-height: 1.2; }
    .clinic-detail { font-size: 10px; color: #555; margin-top: 1px; }
    .title { text-align: center; font-size: 18px; font-weight: bold; margin: 20px 0 15px; text-transform: uppercase; letter-spacing: 0.5px; color: #1b281d; text-decoration: underline; }
    .body-content { font-size: 13px; margin: 20px 0; text-align: justify; line-height: 1.8; background: #fafafa; padding: 20px; border-radius: 8px; border: 1px solid #eee; }
    .date-row { text-align: right; font-size: 10.5px; font-weight: 600; color: #2c3e2e; margin-top: 20px; text-transform: uppercase; }
    .footer { margin-top: 20px; }
    @media print {
      body { padding: 0; margin: 0; background: none; }
      .body-content { background: none; border: none; padding: 0; }
      img { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="clinic-info">
      ${clinicInfo.logoUrl ? `<img src="${clinicInfo.logoUrl}" class="clinic-logo" alt="Logo" />` : ''}
      <div>
        <div class="dentist-name">${dentistName}</div>
        <div class="dentist-cro">Cirurgião-Dentista ${dentistCro}</div>
        <div class="dentist-sub">EPAO: ${clinicInfo.epao || '825 CE'} • CNPJ: ${formatCNPJ(clinicInfo.cnpj || '22.144.932/0001-40')}</div>
      </div>
    </div>
    <div class="clinic-right">
      <div class="clinic-title">${effectiveClinicName || clinicInfo.name || 'DentisPro'}</div>
      <div class="clinic-detail">${effectiveClinicAddress}</div>
      <div class="clinic-detail">${cityOnly} - CE • CEP: ${cepFormatted}</div>
      <div class="clinic-detail">Tel: ${effectiveClinicPhone}</div>
    </div>
  </div>

  <div class="title">${doc.title}</div>

  <div class="body-content">
    <p style="margin-bottom: 12px;"><strong>Paciente:</strong> ${doc.patientName}</p>
    <p>${doc.summary || 'Documento emitido e registrado no sistema odontológico para fins de prontuário e acompanhamento clínico.'}</p>
  </div>

  <div class="date-row">
    ${cityOnly}, ${docDateStr}
  </div>

  <div class="footer">
    ${signatureBlockHtml}
    <p style="font-size: 9.5px; color: #777; margin-top: 15px; text-align: center;">Documento emitido e registrado no sistema DentisPro (https://dentispro.com.br)</p>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() { window.print(); }, 300);
    };
  </script>
</body>
</html>
      `;
    }

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  // Helper function to download PDF/HTML and open Gov.br Assinador
  const handleDownloadPdfForGovBr = (doc: { id?: string; title: string; patientName: string; professionalName?: string; formattedDateStr?: string; summary?: string }, openGovBr: boolean = false) => {
    const isSpecialPrescription = doc.id === 'receituario_controle_especial' || doc.title.toLowerCase().includes('controle especial');
    const cleanCity = cleanCityName(clinicInfo.city);
    const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>${doc.title} - ${doc.patientName}</title>
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; color: #2c2c2c; line-height: 1.6; max-width: 800px; margin: 0 auto; }
    .header { border-bottom: 2px solid #2c3e2e; padding-bottom: 15px; margin-bottom: 25px; display: flex; justify-content: space-between; }
    .clinic { font-size: 18px; font-weight: bold; color: #2c3e2e; }
    .subtitle { font-size: 11px; color: #555; }
    .title { text-align: center; font-size: 18px; font-weight: bold; margin: 25px 0; text-transform: uppercase; letter-spacing: 0.5px; color: #1b281d; text-decoration: underline; }
    .body-content { font-size: 13px; margin: 30px 0; text-align: justify; line-height: 1.8; background: #fafafa; padding: 20px; border-radius: 8px; border: 1px solid #eee; }
    .footer { margin-top: 60px; text-align: center; border-top: 1px solid #ccc; padding-top: 15px; font-size: 11px; }
    @media print { body { padding: 0; } .body-content { background: none; border: none; padding: 0; } }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div style="font-size: 13px; font-weight: bold; color: #1b281d;">${doc.professionalName || clinicInfo.dentistName}</div>
      <div class="subtitle">Cirurgião-Dentista • ${clinicInfo.cro}</div>
      <div class="subtitle">EPAO: ${clinicInfo.epao || '825 CE'}${isSpecialPrescription ? '' : ` • CNPJ: ${formatCNPJ(clinicInfo.cnpj || '22.144.932/0001-40')}`}</div>
    </div>
    <div style="text-align: right;" class="subtitle">
      <div class="clinic" style="font-size: 14px; text-transform: uppercase;">${effectiveClinicName || clinicInfo.name || 'DentisPro'}</div>
      <div>${effectiveClinicAddress}</div>
      <div>${cleanCity} - CE • CEP: ${formatCEP(clinicInfo.cep || '60.160-110')}</div>
      <div>Tel: ${effectiveClinicPhone}</div>
    </div>
  </div>

  <div class="title">${doc.id === 'solicitacao_tomografia' ? 'SOLICITAÇÃO DE TOMOGRAFIA CONE BEAM (CBCT)' : doc.title}</div>

  <div class="body-content">
    <p style="margin-bottom: 12px;"><strong>Paciente:</strong> ${doc.patientName}</p>
    <p>${doc.summary || 'Documento emitido e registrado no sistema odontológico para fins de prontuário e acompanhamento clínico.'}</p>
  </div>

  <div style="text-align: right; font-size: 11px; font-weight: 600; color: #2c3e2e; margin-top: 20px; text-transform: uppercase;">
    ${cleanCity}, ${doc.formattedDateStr || new Date().toLocaleDateString('pt-BR')}
  </div>

  <div class="footer">
    <p><strong>${doc.professionalName || clinicInfo.dentistName}</strong></p>
    <p>Cirurgião-Dentista • ${clinicInfo.cro}</p>
    <p style="font-size: 10px; color: #777; margin-top: 5px;">Documento assinado digitalmente no portal oficial Gov.br (www.gov.br/assinador)</p>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() { window.print(); }, 400);
    };
  </script>
</body>
</html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${doc.title.replace(/[^a-zA-Z0-9]/g, '_')}_${doc.patientName.replace(/[^a-zA-Z0-9]/g, '_')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    if (doc.id && !openGovBr) {
      markDocumentGovBrSigned(doc.id);
    }

    if (openGovBr) {
      setGovBrWizardDoc({
        ...doc,
        professionalName: doc.professionalName || effectiveDentistName,
        professionalCro: effectiveDentistCro,
        professionalCpf: activeProfessional?.cpf || clinicInfo.govBrSignerCpf || clinicInfo.cpf
      });
      setIsGovBrWizardOpen(true);
    }
  };
  
  // Parameters for Solicitação de Exames
  const [bloodExams, setBloodExams] = useState({
    hemograma: true,
    coagulograma: true,
    vitaminaD: true,
    ca153: false,
    creatinina: true,
    fosfataseAlcalina: true,
    calcioIonico: true,
    glicemiaJejum: true,
    sumarioUrina: true,
    t4: false,
    tsh: false,
    hiv: true,
    hbsag: true,
    antiHcv: true,
    vrdl: true
  });

  // Parameters for Solicitação de Tomografia Computadorizada (Cone Beam / TCFC)
  const [tomographyRegions, setTomographyRegions] = useState({
    maxilaTotal: true,
    mandibulaTotal: true,
    hemiarcadaSupDir: false,
    hemiarcadaSupEsq: false,
    hemiarcadaInfDir: false,
    hemiarcadaInfEsq: false,
    regiaoAnteriorSup: false,
    regiaoAnteriorInf: false,
    regiaoPosteriorSupDir: false,
    regiaoPosteriorSupEsq: false,
    regiaoPosteriorInfDir: false,
    regiaoPosteriorInfEsq: false,
    atmBilateral: false,
    atmDireita: false,
    atmEsquerda: false,
    seiosMaxilares: false,
    tercoMedioFace: false,
    regiaoDentes: false
  });

  const [tomographyTeethInput, setTomographyTeethInput] = useState('18, 28, 38, 48');

  const [tomographyIndications, setTomographyIndications] = useState({
    implantes: true,
    dentesInclusos: true,
    volumeOsseo: true,
    endodontia: false,
    patologias: false,
    periodontia: false,
    atm: false,
    seiosParanasais: false,
    ortodontia: false
  });

  const [tomographyCustomIndication, setTomographyCustomIndication] = useState('');

  const [tomographyFov, setTomographyFov] = useState<'total' | 'maxila' | 'mandibula' | 'localizado' | 'estendido'>('total');

  const [tomographyDelivery, setTomographyDelivery] = useState({
    dicom: true,
    cortesImpressos: true,
    reconstrucao3d: true,
    guiaCirurgico: false
  });

  const [tomographyNotes, setTomographyNotes] = useState(
    'Determinar a quantidade, qualidade e inclinação do rebordo ósseo alveolar para planejamento cirúrgico e instalação de implantes com margem de segurança.'
  );

  const TOMOGRAPHY_REGION_LABELS: Record<string, string> = {
    maxilaTotal: 'Maxila Total (Arcada Superior)',
    mandibulaTotal: 'Mandíbula Total (Arcada Inferior)',
    hemiarcadaSupDir: 'Hemiarcada Superior Direita',
    hemiarcadaSupEsq: 'Hemiarcada Superior Esquerda',
    hemiarcadaInfDir: 'Hemiarcada Inferior Direita',
    hemiarcadaInfEsq: 'Hemiarcada Inferior Esquerda',
    regiaoAnteriorSup: 'Região Anterior Superior (Incisivos/Caninos)',
    regiaoAnteriorInf: 'Região Anterior Inferior (Incisivos/Caninos)',
    regiaoPosteriorSupDir: 'Região Posterior Sup. Direita (Pré-molares/Molares)',
    regiaoPosteriorSupEsq: 'Região Posterior Sup. Esquerda (Pré-molares/Molares)',
    regiaoPosteriorInfDir: 'Região Posterior Inf. Direita (Pré-molares/Molares)',
    regiaoPosteriorInfEsq: 'Região Posterior Inf. Esquerda (Pré-molares/Molares)',
    atmBilateral: 'Articulações Temporomandibulares (ATMs - Bilateral)',
    atmDireita: 'ATM Direita',
    atmEsquerda: 'ATM Esquerda',
    seiosMaxilares: 'Seios Maxilares / Vias Aéreas Superiores',
    tercoMedioFace: 'Terço Médio da Face / Complexo Maxilofacial',
    regiaoDentes: 'Dentes Específicos / Região Localizada'
  };

  const TOMOGRAPHY_INDICATION_LABELS: Record<string, string> = {
    implantes: 'Planejamento e avaliação para Implantes Dentários / Guia Cirúrgico',
    dentesInclusos: 'Pesquisa e localização de Dentes Inclusos / Impactados e relação com estruturas nobres (Nervo Alveolar / Seio Maxilar)',
    volumeOsseo: 'Avaliação tridimensional da espessura, altura e qualidade do Rebordo Ósseo Residual (Enxerto / Levantamento de Seio)',
    endodontia: 'Avaliação Endodôntica: pesquisa de fratura radicular, perfurações, canais acessórios e reabsorções',
    patologias: 'Diagnóstico e delimitação de Lesões Ósseas, Cistos, Tumores e alterações periapicais',
    periodontia: 'Avaliação Periodontal: defeitos infraósseos, perdas ósseas e envolvimento de furca',
    atm: 'Avaliação morfológica e estrutural das Articulações Temporomandibulares (ATMs)',
    seiosParanasais: 'Avaliação de Seios Maxilares: integridade do assoalho sinusal, espessamento mucoso e sinusopatias',
    ortodontia: 'Planejamento Ortodôntico / Cirurgia Ortognática / Tracionamento Dentário de Inclusos'
  };

  const TOMOGRAPHY_FOV_LABELS: Record<string, string> = {
    total: 'FOV Grande / Estendido (Maxila e Mandíbula / Face Total)',
    maxila: 'FOV Médio (Arcada Superior / Maxila)',
    mandibula: 'FOV Médio (Arcada Inferior / Mandíbula)',
    localizado: 'FOV Pequeno (Foco Localizado / Endodôntico / Alta Resolução)',
    estendido: 'FOV Ampliado / Crânio-Maxilofacial'
  };

  const TOMOGRAPHY_DELIVERY_LABELS: Record<string, string> = {
    dicom: 'Arquivo Digital DICOM (.dcm) para software 3D de planejamento',
    cortesImpressos: 'Cortes Tomográficos impressos com Laudo Radiológico',
    reconstrucao3d: 'Reconstruções Tridimensionais (Volume Rendering 3D VR)',
    guiaCirurgico: 'Aquisição tomográfica com Guia Cirúrgico / Prótese em posição'
  };

  const handleSelectAllTomographyRegions = () => {
    setTomographyRegions({
      maxilaTotal: true,
      mandibulaTotal: true,
      hemiarcadaSupDir: true,
      hemiarcadaSupEsq: true,
      hemiarcadaInfDir: true,
      hemiarcadaInfEsq: true,
      regiaoAnteriorSup: true,
      regiaoAnteriorInf: true,
      regiaoPosteriorSupDir: true,
      regiaoPosteriorSupEsq: true,
      regiaoPosteriorInfDir: true,
      regiaoPosteriorInfEsq: true,
      atmBilateral: true,
      atmDireita: true,
      atmEsquerda: true,
      seiosMaxilares: true,
      tercoMedioFace: true,
      regiaoDentes: true
    });
  };

  const handleDeselectAllTomographyRegions = () => {
    setTomographyRegions({
      maxilaTotal: false,
      mandibulaTotal: false,
      hemiarcadaSupDir: false,
      hemiarcadaSupEsq: false,
      hemiarcadaInfDir: false,
      hemiarcadaInfEsq: false,
      regiaoAnteriorSup: false,
      regiaoAnteriorInf: false,
      regiaoPosteriorSupDir: false,
      regiaoPosteriorSupEsq: false,
      regiaoPosteriorInfDir: false,
      regiaoPosteriorInfEsq: false,
      atmBilateral: false,
      atmDireita: false,
      atmEsquerda: false,
      seiosMaxilares: false,
      tercoMedioFace: false,
      regiaoDentes: false
    });
  };

  const handleSelectBothArches = () => {
    setTomographyRegions(prev => ({
      ...prev,
      maxilaTotal: true,
      mandibulaTotal: true
    }));
    setTomographyFov('total');
  };

  const handleSelectMaxilaOnly = () => {
    setTomographyRegions(prev => ({
      ...prev,
      maxilaTotal: true,
      mandibulaTotal: false
    }));
    setTomographyFov('maxila');
  };

  const handleSelectMandibulaOnly = () => {
    setTomographyRegions(prev => ({
      ...prev,
      maxilaTotal: false,
      mandibulaTotal: true
    }));
    setTomographyFov('mandibula');
  };

  const handleSelectAtmsAndSinuses = () => {
    setTomographyRegions(prev => ({
      ...prev,
      atmBilateral: true,
      atmDireita: true,
      atmEsquerda: true,
      seiosMaxilares: true
    }));
  };

  const getSelectedTomographyRegions = () => {
    const selectedKeys = Object.entries(tomographyRegions)
      .filter(([_, checked]) => checked)
      .map(([key]) => key);
    
    if (selectedKeys.length === 0) {
      return ['Maxila Total e Mandíbula Total (Ambas as Arcadas)'];
    }

    const totalKeysCount = Object.keys(tomographyRegions).length;
    if (selectedKeys.length === totalKeysCount) {
      return [
        'Todas as Regiões Anatômicas Possíveis (Maxila Total, Mandíbula Total, Hemiarcadas, Regiões Anteriores e Posteriores, ATMs Bilateral, Seios Maxilares, Terço Médio e Dentes Específicos)'
      ];
    }

    return selectedKeys.map(k => {
      if (k === 'regiaoDentes' && tomographyTeethInput.trim()) {
        return `${TOMOGRAPHY_REGION_LABELS[k] || k} (Dentes: ${tomographyTeethInput.trim()})`;
      }
      return TOMOGRAPHY_REGION_LABELS[k] || k;
    });
  };

  const getSelectedTomographyIndications = () => {
    const list = Object.entries(tomographyIndications)
      .filter(([_, checked]) => checked)
      .map(([key]) => TOMOGRAPHY_INDICATION_LABELS[key] || key);
    
    if (tomographyCustomIndication && tomographyCustomIndication.trim()) {
      list.push(tomographyCustomIndication.trim());
    }
    
    if (list.length === 0) {
      return ['Planejamento e avaliação para Implantes Dentários / Guia Cirúrgico', 'Avaliação tridimensional do Rebordo Ósseo Residual'];
    }
    return list;
  };

  const getSelectedTomographyDelivery = () => {
    const list = Object.entries(tomographyDelivery)
      .filter(([_, checked]) => checked)
      .map(([key]) => TOMOGRAPHY_DELIVERY_LABELS[key] || key);
    
    if (list.length === 0) {
      return ['Arquivo Digital DICOM (.dcm)', 'Cortes Tomográficos com Laudo Radiológico'];
    }
    return list;
  };

  const buildFormattedTomographySummary = () => {
    const regions = getSelectedTomographyRegions().join('; ');
    const indications = getSelectedTomographyIndications().join('; ');
    const delivery = getSelectedTomographyDelivery().join('; ');
    const fovLabel = TOMOGRAPHY_FOV_LABELS[tomographyFov] || tomographyFov;

    return `Solicitação de Tomografia Cone Beam (CBCT) para o(a) paciente ${patientDisplayName}.\n• Regiões Solicitadas: ${regions}.\n• Finalidade Clínica: ${indications}.\n• FOV: ${fovLabel}.\n• Formato de Entrega: ${delivery}.${tomographyNotes ? `\n• Observações: ${tomographyNotes}` : ''}`;
  };

  // Helper to build formatted prescription text from MedicationItems
  const buildFormattedPrescriptionText = (items: MedicationItem[]) => {
    if (!items || items.length === 0) return '';
    return items.map((med, idx) => {
      const prefix = items.length > 1 ? `${idx + 1}) ` : '';
      let header = `${prefix}${med.name}`;
      if (med.dosage && med.dosage.trim()) header += ` ${med.dosage.trim()}`;
      if (med.presentation && med.presentation.trim()) header += ` (${med.presentation.trim()})`;
      if (med.quantity && med.quantity.trim()) header += ` ------------ Qtd: ${med.quantity.trim()}`;
      
      const usage = `   Uso/Posologia: ${med.instructions || 'Tomar conforme orientação.'}`;
      return `${header}\n${usage}`;
    }).join('\n\n');
  };

  // Custom Saved Prescription Templates state (persisted in localStorage)
  const [customSavedTemplates, setCustomSavedTemplates] = useState<MedicationItem[]>(() => {
    try {
      const saved = localStorage.getItem('dentispro_custom_med_templates') || localStorage.getItem('planetodonto_custom_med_templates');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [showManageTemplatesModal, setShowManageTemplatesModal] = useState<boolean>(false);
  const [savedModelToastIndex, setSavedModelToastIndex] = useState<number | null>(null);
  const [activeAutocompleteIndex, setActiveAutocompleteIndex] = useState<number | null>(null);

  // Helper state for Posology dropdown selections per item index
  interface PosologyDropdowns {
    condition?: string;
    dose?: string;
    interval?: string;
    duration?: string;
  }
  const [posologyState, setPosologyState] = useState<Record<number, PosologyDropdowns>>({});

  // Posology Dropdown Options Catalog
  const CONDITION_MOMENTO_OPTIONS = [
    'Tomar 1 hora antes da refeição',
    'Tomar 2 horas após a refeição',
    'Tomar 1 hora antes da refeição ou 2 horas após a refeição',
    'No mesmo horário diariamente',
    'Tomar no início das refeições principais',
    'Tomar 1 hora antes de realizar a cirurgia / procedimento',
    'Em jejum ao acordar',
    'Ao deitar à noite (ao ir dormir)',
    'Logo após as refeições',
    'Em caso de dor ou febre',
    'Em caso de dor intensa pós-operatória',
    'Bochechar por 1 minuto de 12/12h',
    'Aplicar camada fina sobre a lesão'
  ];

  const DOSE_TOMADA_OPTIONS = [
    '1 comprimido',
    '2 comprimidos',
    '1 cápsula',
    '2 cápsulas',
    '1 drágea',
    '1 colher de sopa (15 mL)',
    '10 mL em seringa dosadora',
    '20 a 40 gotas',
    '1 gota por kg de peso corporal',
    '5 mL'
  ];

  const INTERVALO_OPTIONS = [
    'de 4 em 4 horas (de 4/4h)',
    'de 6 em 6 horas (de 6/6h)',
    'de 8 em 8 horas (de 8/8h)',
    'de 12 em 12 horas (de 12/12h)',
    '1 vez ao dia (de 24/24 horas)',
    'em dose única',
    'em dose única 1 hora antes do procedimento'
  ];

  const DURACAO_OPTIONS = [
    'durante 3 dias consecutivos',
    'durante 5 dias consecutivos',
    'durante 7 dias consecutivos',
    'durante 10 dias consecutivos',
    'durante 14 dias',
    'até a remissão dos sintomas',
    'por 5 dias consecutivos'
  ];

  const PRESENTATION_DROPDOWN_OPTIONS = [
    'Comprimido',
    'Comprimidos',
    'Cápsula',
    'Cápsulas',
    'Drágea',
    'Drágeas',
    'Comprimidos revestidos',
    'Comprimidos efervescentes',
    'Comprimidos mastigáveis',
    'Frasco',
    'Suspensão oral',
    'Gotas',
    'Bisnaga',
    'Gel tópico',
    'Creme / Pomada',
    'Ampola',
    'Sachê',
    'Solução oral',
    'Spray bucal',
    'Enxaguatório / Colutório',
    'Adesivo'
  ];

  const DOSAGE_DROPDOWN_OPTIONS = [
    '500 mg',
    '875 mg',
    '500 mg + 125 mg',
    '875 mg + 125 mg',
    '1 g (1000 mg)',
    '300 mg',
    '600 mg',
    '250 mg',
    '400 mg',
    '100 mg',
    '50 mg',
    '15 mg',
    '10 mg',
    '5 mg',
    '4 mg',
    '1 mg',
    '0,5 mg',
    '400 mg/5 mL',
    '250 mg/5 mL',
    '200 mg/5 mL',
    '100 mg/mL',
    '0,12%'
  ];

  const QUANTITY_DROPDOWN_OPTIONS = [
    '12 comprimidos',
    '14 comprimidos',
    '18 comprimidos',
    '20 comprimidos',
    '21 comprimidos',
    '30 comprimidos',
    '12 cápsulas',
    '14 cápsulas',
    '18 cápsulas',
    '20 cápsulas',
    '21 cápsulas',
    '30 cápsulas',
    '12 drágeas',
    '14 drágeas',
    '18 drágeas',
    '20 drágeas',
    '21 drágeas',
    '30 drágeas',
    '1 caixa (12 comprimidos)',
    '1 caixa (14 comprimidos)',
    '1 caixa (18 comprimidos)',
    '1 caixa (20 comprimidos)',
    '1 caixa (21 comprimidos)',
    '1 caixa (30 comprimidos)',
    '1 caixa (12 cápsulas)',
    '1 caixa (14 cápsulas)',
    '1 caixa (18 cápsulas)',
    '1 caixa (20 cápsulas)',
    '1 caixa (21 cápsulas)',
    '1 caixa (30 cápsulas)',
    '1 caixa',
    '2 caixas',
    '3 caixas',
    '1 frasco',
    '2 frascos',
    '3 frascos',
    '1 frasco (70 mL)',
    '1 frasco (100 mL)',
    '1 frasco (150 mL)',
    '1 bisnaga',
    '2 bisnagas',
    '1 ampola',
    '1 sachê'
  ];

  // Parameters for Receituário de Controle Especial (Multi-medication list)
  // Ordenação padronizada: 1º Anti-inflamatório, 2º Antibiótico, 3º Analgésico
  const initialMedications: MedicationItem[] = [
    { ...(DENTAL_MEDICATIONS_CATALOG.find(m => m.id === 'ibuprofeno_600_comp') || DENTAL_MEDICATIONS_CATALOG[16]), id: 'med_init_1' }, // 1. Anti-inflamatório (Ibuprofeno 600mg)
    { ...(DENTAL_MEDICATIONS_CATALOG.find(m => m.id === 'amoxicilina_500_cap') || DENTAL_MEDICATIONS_CATALOG[5]), id: 'med_init_2' }, // 2. Antibiótico (Amoxicilina 500mg)
    { ...(DENTAL_MEDICATIONS_CATALOG.find(m => m.id === 'dipirona_500_comp') || DENTAL_MEDICATIONS_CATALOG[10]), id: 'med_init_3' } // 3. Analgésico (Dipirona Sódica 500mg)
  ];

  const [specialPrescriptionItems, setSpecialPrescriptionItems] = useState<MedicationItem[]>(initialMedications);
  const [activeAlertModalItem, setActiveAlertModalItem] = useState<{ item: MedicationItem; index: number } | null>(null);
  const [savedMedicationIndex, setSavedMedicationIndex] = useState<number | null>(null);

  // New Tool Modals State
  const [isAnestheticCalcOpen, setIsAnestheticCalcOpen] = useState(false);
  const [isTherapeuticGuideOpen, setIsTherapeuticGuideOpen] = useState(false);
  const [therapeuticGuideSearch, setTherapeuticGuideSearch] = useState('');
  const [isCidMatrixOpen, setIsCidMatrixOpen] = useState(false);
  const [isGovBrWizardOpen, setIsGovBrWizardOpen] = useState(false);
  const [govBrWizardDoc, setGovBrWizardDoc] = useState<{
    id?: string;
    title: string;
    patientName: string;
    professionalName?: string;
    professionalCro?: string;
    professionalCpf?: string;
    summary?: string;
  } | undefined>(undefined);

  // PAIO - Protocolo de Anestesia Intra-Oral State
  const [isPaioActive, setIsPaioActive] = useState<boolean>(true);
  const [paioAnesthesiaSites, setPaioAnesthesiaSites] = useState<string[]>([
    'Bloqueio do Nervo Alveolar Inferior e Lingual (Região Posterior Mandibular Esquerda)',
    'Infiltração Nervo Bucal'
  ]);
  const [paioCustomSiteInput, setPaioCustomSiteInput] = useState<string>('');
  const [topicalAnesthetics, setTopicalAnesthetics] = useState<{ [key: string]: boolean }>({
    'Benzocaína 20% Pomada/Gel': true,
    'Lidocaína Spray 10%': false,
    'Prilocaína + Lidocaína Tópica (EMLA)': false,
    'Gel Anestésico Tópico de Tetracaína': false,
  });

  const [injectableTubetes, setInjectableTubetes] = useState<{ [key: string]: number }>({
    'Lidocaína 2% c/ Epinefrina 1:100.000': 2,
    'Mepivacaína 2% c/ Epinefrina 1:100.000': 0,
    'Mepivacaína 3% Sem Vasoconstritor': 0,
    'Articaína 4% c/ Epinefrina 1:100.000': 0,
    'Prilocaína 3% c/ Felipressina 0,03 UI/ml': 0,
    'Bupivacaína 0,5% c/ Epinefrina 1:200.000': 0,
  });

  const [paioProcedure, setPaioProcedure] = useState<string>('Exodontia de Dente Incluso / Cirurgia Oral');
  const [paioToothRegion, setPaioToothRegion] = useState<string>('Dente 38 (Região Posterior Mandibular Esquerda)');
  const [paioTechnique, setPaioTechnique] = useState<string>('Anestesia Tópica + Bloqueio Regional do Nervo Alveolar Inferior e Lingual');
  const [paioBloodPressure, setPaioBloodPressure] = useState<string>('120x80 mmHg');
  const [paioHeartRate, setPaioHeartRate] = useState<string>('76 bpm');
  const [paioComplications, setPaioComplications] = useState<string>('Ato cirúrgico executado sem intercorrências. Hemostasia cirúrgica mantida e sutura realizada.');
  const [paioPostOpInstructions, setPaioPostOpInstructions] = useState<string>('Compressas frias de gelo por 24h, repouso físico de 48h, alimentos frios e macios. Manter rigor na higienização bucal e uso da medicação prescrita.');

  // Anesthetic Calc State
  const [anestheticWeight, setAnestheticWeight] = useState<number>(70);
  const [anestheticType, setAnestheticType] = useState<'lido_epi' | 'mepi_epi' | 'mepi_sem' | 'arti_epi' | 'prilo_feli'>('lido_epi');
  const [isCardiacRisk, setIsCardiacRisk] = useState<boolean>(false);
  const [copiedAnestheticToast, setCopiedAnestheticToast] = useState(false);

  // Helper calculation for Anesthetic cartridges
  const calculateAnestheticDose = () => {
    let solutionName = 'Lidocaína 2% c/ Epinefrina 1:100.000';
    let maxMgPerKg = 4.4;
    let maxAbsMg = 300;
    let mgPerCartridge = 36;
    let hasVaso = true;

    if (anestheticType === 'mepi_epi') {
      solutionName = 'Mepivacaína 2% c/ Epinefrina 1:100.000';
      maxMgPerKg = 4.4;
      maxAbsMg = 300;
      mgPerCartridge = 36;
      hasVaso = true;
    } else if (anestheticType === 'mepi_sem') {
      solutionName = 'Mepivacaína 3% Sem Vasoconstritor';
      maxMgPerKg = 4.4;
      maxAbsMg = 300;
      mgPerCartridge = 54;
      hasVaso = false;
    } else if (anestheticType === 'arti_epi') {
      solutionName = 'Articaína 4% c/ Epinefrina 1:100.000';
      maxMgPerKg = 7.0;
      maxAbsMg = 500;
      mgPerCartridge = 72;
      hasVaso = true;
    } else if (anestheticType === 'prilo_feli') {
      solutionName = 'Prilocaína 3% c/ Felipressina 0,03 UI/ml';
      maxMgPerKg = 6.0;
      maxAbsMg = 400;
      mgPerCartridge = 54;
      hasVaso = true;
    }

    const calculatedMg = Math.min((anestheticWeight || 70) * maxMgPerKg, maxAbsMg);
    let calculatedCartridges = Math.floor((calculatedMg / mgPerCartridge) * 10) / 10;

    let cardiacWarning = '';
    if (isCardiacRisk && hasVaso && anestheticType !== 'prilo_feli' && anestheticType !== 'mepi_sem') {
      if (calculatedCartridges > 2.2) {
        calculatedCartridges = 2.2;
        cardiacWarning = 'Risco Cardíaco/Hipertensão: Dose máxima de Epinefrina limitada a 0,04 mg (máx. 2,2 tubetes).';
      }
    }

    return {
      solutionName,
      maxMgPerKg,
      maxAbsMg,
      mgPerCartridge,
      calculatedMg,
      calculatedCartridges,
      cardiacWarning
    };
  };

  const [specialPrescriptionText, setSpecialPrescriptionText] = useState(() => {
    return buildFormattedPrescriptionText(initialMedications);
  });

  // Handlers for posology dropdowns & assembling instructions
  const handleSelectPosologyDropdown = (index: number, field: keyof PosologyDropdowns, val: string) => {
    const updatedState = {
      ...posologyState,
      [index]: {
        ...(posologyState[index] || {}),
        [field]: val
      }
    };
    setPosologyState(updatedState);

    const p = updatedState[index] || {};
    const parts: string[] = [];
    if (p.condition) parts.push(p.condition);
    if (p.dose) parts.push(p.dose);
    if (p.interval) parts.push(p.interval);
    if (p.duration) parts.push(p.duration);

    if (parts.length > 0) {
      const generated = parts.join(', ') + '.';
      handleUpdateMedicationItem(index, 'instructions', generated);
    }
  };

  const handleAppendPosologyText = (index: number) => {
    const p = posologyState[index] || {};
    const parts: string[] = [];
    if (p.condition) parts.push(p.condition);
    if (p.dose) parts.push(p.dose);
    if (p.interval) parts.push(p.interval);
    if (p.duration) parts.push(p.duration);

    if (parts.length === 0) return;

    const addition = parts.join(', ');
    const current = specialPrescriptionItems[index]?.instructions || '';
    const newText = current ? `${current} ${addition}.` : `${addition}.`;
    handleUpdateMedicationItem(index, 'instructions', newText);
  };

  const handleClearPosologyText = (index: number) => {
    handleUpdateMedicationItem(index, 'instructions', '');
    setPosologyState(prev => ({ ...prev, [index]: { condition: '', dose: '', interval: '', duration: '' } }));
  };

  // Handlers for saving and deleting custom prescription models
  const handleSaveAsCustomTemplate = (medItem: MedicationItem) => {
    const newTemplate: MedicationItem = {
      ...medItem,
      id: `custom_tpl_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      category: 'Modelo Personalizado'
    };
    const updated = [newTemplate, ...customSavedTemplates.filter(t => !(t.name === newTemplate.name && t.dosage === newTemplate.dosage))];
    setCustomSavedTemplates(updated);
    try {
      localStorage.setItem('dentispro_custom_med_templates', JSON.stringify(updated));
    } catch (e) {}
  };

  const handleDeleteCustomTemplate = (templateId: string) => {
    const updated = customSavedTemplates.filter(t => t.id !== templateId);
    setCustomSavedTemplates(updated);
    try {
      localStorage.setItem('dentispro_custom_med_templates', JSON.stringify(updated));
    } catch (e) {}
  };

  // Handlers for managing prescription items
  const handleSelectMedicationForIndex = (index: number, catalogId: string) => {
    const foundMed = customSavedTemplates.find(m => m.id === catalogId) || DENTAL_MEDICATIONS_CATALOG.find(m => m.id === catalogId);
    if (!foundMed) return;
    const updated = [...specialPrescriptionItems];
    updated[index] = {
      ...foundMed,
      id: updated[index].id || `med_${Date.now()}`
    };
    setSpecialPrescriptionItems(updated);
    setSpecialPrescriptionText(buildFormattedPrescriptionText(updated));
  };

  const handleSelectAutocompleteMedication = (index: number, selectedMed: MedicationItem) => {
    const updated = [...specialPrescriptionItems];
    updated[index] = {
      ...selectedMed,
      id: updated[index].id || `med_${Date.now()}`
    };
    setSpecialPrescriptionItems(updated);
    setSpecialPrescriptionText(buildFormattedPrescriptionText(updated));
    setActiveAutocompleteIndex(null);
  };

  const handleAddCustomMedication = () => {
    const newItem: MedicationItem = {
      id: `med_custom_${Date.now()}`,
      name: 'Novo Fármaco / Medicamento',
      dosage: '500 mg',
      presentation: 'Comprimido',
      quantity: '1 caixa',
      instructions: 'Tomar 1 comprimido de 8 em 8 horas após a refeição durante 5 dias consecutivos.',
      contraindications: 'Preencher contraindicações se houver.',
      interactions: 'Preencher interações medicamentosas.',
      tips: 'Orientações clínicas gerais.'
    };
    const updated = [...specialPrescriptionItems, newItem];
    setSpecialPrescriptionItems(updated);
    setSpecialPrescriptionText(buildFormattedPrescriptionText(updated));
  };

  const handleSaveMedicationItem = (index: number) => {
    setSpecialPrescriptionText(buildFormattedPrescriptionText(specialPrescriptionItems));
    setSavedMedicationIndex(index);
    setTimeout(() => setSavedMedicationIndex(null), 2500);
  };

  const handleUpdateMedicationItem = (index: number, field: keyof MedicationItem, value: string) => {
    const updated = [...specialPrescriptionItems];
    updated[index] = { ...updated[index], [field]: value };
    setSpecialPrescriptionItems(updated);
    setSpecialPrescriptionText(buildFormattedPrescriptionText(updated));

    if (field === 'presentation') {
      const lowerVal = value.toLowerCase();
      let matchedDose = '';
      if (lowerVal.includes('cápsula') || lowerVal.includes('capsula')) {
        matchedDose = '1 cápsula';
      } else if (lowerVal.includes('drágea') || lowerVal.includes('dragea')) {
        matchedDose = '1 drágea';
      } else if (lowerVal.includes('comprimido')) {
        matchedDose = '1 comprimido';
      }
      if (matchedDose) {
        setPosologyState(prev => ({
          ...prev,
          [index]: {
            ...(prev[index] || {}),
            dose: matchedDose
          }
        }));
      }
    }
  };

  const handleRemoveMedicationItem = (index: number) => {
    const updated = specialPrescriptionItems.filter((_, i) => i !== index);
    setSpecialPrescriptionItems(updated);
    setSpecialPrescriptionText(buildFormattedPrescriptionText(updated));
  };

  // Dental specialties list
  const DENTAL_SPECIALTIES = [
    'Cirurgia e Traumatologia Bucomaxilofacial',
    'Ortodontia e Ortopedia Facial',
    'Endodontia',
    'Periodontia',
    'Implantodontia',
    'Odontopediatria',
    'Prótese Dentária',
    'Dentística Restauradora e Estética',
    'Disfunção Temporomandibular e Dor Orofacial (DTM)',
    'Estomatologia',
    'Radiologia Odontológica e Imaginologia',
    'Odontologia para Pacientes com Necessidades Especiais',
    'Odontogeriatria',
    'Harmonização Orofacial (HOF)',
    'Patologia Oral e Maxilofacial'
  ];

  // Parameters for Solicitação Especializada / Encaminhamento
  const [specialistSpecialty, setSpecialistSpecialty] = useState<string>('Cirurgia e Traumatologia Bucomaxilofacial');
  const [specialistRecipient, setSpecialistRecipient] = useState('Caro(a) colega cirurgião bucomaxilofacial');
  const [specialistRequestText, setSpecialistRequestText] = useState(
    'Solicito avaliação e parecer especializado referente ao quadro clínico do paciente.'
  );

  // Parameters for Justificativa Clínica
  const [tussCodeInput, setTussCodeInput] = useState('8.20.00.212');
  const [tussDescInput, setTussDescInput] = useState('Aumento de coroa clínica');
  const [toothInput, setToothInput] = useState('Dente 45');
  const [clinicalJustificationText, setClinicalJustificationText] = useState('Ausência de espaço periodontal.');

  // Parameters for Descrição Cirúrgica
  const [surgicalType, setSurgicalType] = useState<'ELETIVA' | 'URGÊNCIA' | 'EMERGÊNCIA' | 'ENCAIXE'>('ELETIVA');
  const [surgicalStartTime, setSurgicalStartTime] = useState('09:00');
  const [surgicalEndTime, setSurgicalEndTime] = useState('11:30');
  const [surgicalDiagnosis, setSurgicalDiagnosis] = useState('Dente 38 e 48 Inclusos e Impactados');
  const [surgicalProcedures, setSurgicalProcedures] = useState('Exodontia de dente incluso por osteotomia e seccionamento');
  const [surgeonsTeam, setSurgeonsTeam] = useState({
    mainSurgeon: activeProfessional?.name || clinicInfo.dentistName,
    anesthetist: 'Dr. Marcus Vinícius',
    auxiliary1: 'Dra. Camila Santos',
    instrumentist: 'TDB Maria Oliveira'
  });

  // Print & Render State
  const [isRenderModalOpen, setIsRenderModalOpen] = useState(false);

  const selectedPatient = patients.find(p => p.id === selectedPatientId);
  const patientDisplayName = customPatientName || selectedPatient?.name || 'Nome do Paciente';

  // Automatically sync patient age when selecting a registered patient
  React.useEffect(() => {
    if (selectedPatientId) {
      const p = patients.find(patient => patient.id === selectedPatientId);
      if (p && p.birthDate) {
        const details = getPatientAgeAndBirthDate(p.birthDate);
        setCustomPatientAgeYears(String(details.ageYears));
        setCustomPatientAgeMonths(String(details.ageMonths));
      }
    }
  }, [selectedPatientId, patients]);

  const formattedAgeDisplay = () => {
    const y = parseInt(customPatientAgeYears) || 0;
    const m = parseInt(customPatientAgeMonths) || 0;
    
    if (y > 0 && m > 0) {
      return `${y} ${y === 1 ? 'ano' : 'anos'} e ${m} ${m === 1 ? 'mês' : 'meses'}`;
    } else if (y > 0) {
      return `${y} ${y === 1 ? 'ano' : 'anos'}`;
    } else if (m > 0) {
      return `${m} ${m === 1 ? 'mês' : 'meses'}`;
    } else {
      return '0 anos';
    }
  };

  const patientAge = formattedAgeDisplay();

  const filteredTemplates = DENTAL_DOCUMENT_TEMPLATES.filter(t => {
    const matchesCategory = selectedCategory === 'todos' || t.category === selectedCategory;
    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.subtitle.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleOpenParametersModal = (template: DocumentTemplate) => {
    setActiveTemplate(template);
    setIsRenderModalOpen(false);
  };

  const handleSyncPatientAndQuickDoc = (
    patientId?: string, 
    patientName?: string, 
    docCategory?: 'atestado' | 'declaracao' | 'termo' | 'receituario' | 'solicitacao'
  ) => {
    // 1. Synchronize patient across the application
    if (patientId) {
      setSelectedPatientId(patientId);
      setCustomPatientName('');
      const pObj = patients.find(p => p.id === patientId);
      if (pObj) {
        setSelectedRecentPatient({ id: pObj.id, name: pObj.name });
      }
    } else if (patientName) {
      const matched = patients.find(p => p.name.toLowerCase().trim() === patientName.toLowerCase().trim());
      if (matched) {
        setSelectedPatientId(matched.id);
        setCustomPatientName('');
        setSelectedRecentPatient({ id: matched.id, name: matched.name });
      } else {
        setSelectedPatientId('');
        setCustomPatientName(patientName);
        setSelectedRecentPatient({ name: patientName });
      }
    }

    if (!docCategory) return;

    // 2. Open quick template modal or category tab
    let targetTemplate: DocumentTemplate | undefined;

    if (docCategory === 'atestado') {
      targetTemplate = DENTAL_DOCUMENT_TEMPLATES.find(t => t.id === 'atestado_comparecimento') || DENTAL_DOCUMENT_TEMPLATES.find(t => t.category === 'atestado');
    } else if (docCategory === 'declaracao') {
      targetTemplate = DENTAL_DOCUMENT_TEMPLATES.find(t => t.id === 'declaracao_comparecimento') || DENTAL_DOCUMENT_TEMPLATES.find(t => t.category === 'declaracao');
    } else if (docCategory === 'termo') {
      targetTemplate = DENTAL_DOCUMENT_TEMPLATES.find(t => t.id === 'tcle_endodontia') || DENTAL_DOCUMENT_TEMPLATES.find(t => t.title.toLowerCase().includes('termo') || t.subtitle.toLowerCase().includes('tcle'));
    } else if (docCategory === 'receituario') {
      targetTemplate = DENTAL_DOCUMENT_TEMPLATES.find(t => t.id === 'receituario_controle_especial');
    } else if (docCategory === 'solicitacao') {
      targetTemplate = DENTAL_DOCUMENT_TEMPLATES.find(t => t.category === 'solicitacao');
    }

    if (targetTemplate) {
      handleOpenParametersModal(targetTemplate);
    } else {
      if (docCategory === 'atestado' || docCategory === 'declaracao' || docCategory === 'solicitacao') {
        setSelectedCategory(docCategory);
      }
      window.scrollTo({ top: 400, behavior: 'smooth' });
    }
  };

  const handleGenerateDocument = () => {
    if (activeTemplate) {
      addSavedClinicDocument({
        title: activeTemplate.title,
        subtitle: activeTemplate.subtitle,
        category: activeTemplate.category,
        patientId: selectedPatientId,
        patientName: patientDisplayName,
        professionalName: activeProfessional?.name || clinicInfo.dentistName,
        cidCode: activeTemplate.category === 'atestado' ? (isManualCid ? customCid : cidCode) : undefined,
        summary: `${activeTemplate.title} gerado para o(a) paciente ${patientDisplayName} (${patientAge}) em ${formattedFormattedDate}.`
      });
    }
    setIsRenderModalOpen(true);
  };

  const formattedFormattedDate = new Date(docDate + 'T12:00:00').toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const cityFormattedDate = `${cleanCityName(clinicInfo.city)}, ${formattedFormattedDate}`;

  // Helper to build full formatted text of the document for WhatsApp sharing
  const buildWhatsAppDocumentText = () => {
    const dentist = activeProfessional?.name || clinicInfo.dentistName || 'Dr(a). Cirurgião-Dentista';
    const cro = activeProfessional?.cro || clinicInfo.cro || 'CRO';
    const clinic = effectiveClinicName || clinicInfo.name || 'DentisPro';
    const dateStr = formattedFormattedDate;

    let bodyText = '';

    if (activeTemplate.id === 'solicitacao_tomografia') {
      const regions = getSelectedTomographyRegions().map(r => `☑ ${r}`).join('\n');
      const indications = getSelectedTomographyIndications().map(i => `• ${i}`).join('\n');
      const delivery = getSelectedTomographyDelivery().map(d => `• ${d}`).join('\n');
      const fovLabel = TOMOGRAPHY_FOV_LABELS[tomographyFov] || tomographyFov;

      bodyText = `*1. REGIÕES ANATÔMICAS SOLICITADAS:*\n${regions}\n\n*2. FINALIDADE CLÍNICA E INDICAÇÕES:*\n${indications}\n\n*3. ESPECIFICAÇÕES TÉCNICAS E ENTREGA:*\n• *Campo de Visão (FOV):* ${fovLabel}\n• *Formato de Entrega:*\n${delivery}`;
      if (tomographyNotes) {
        bodyText += `\n\n*4. OBSERVAÇÕES E ORIENTAÇÕES CLÍNICAS:*\n${tomographyNotes}`;
      }
    } else if (activeTemplate.category === 'receituario') {
      const isControlSpecial = activeTemplate.id === 'receituario_controle_especial';
      if (isControlSpecial) {
        bodyText = `*RECEITUÁRIO DE CONTROLE ESPECIAL*\n\n${specialPrescriptionText}`;
      } else {
        const medsText = specialPrescriptionItems.map((med, idx) => {
          let line = `*${idx + 1}. ${med.name}*`;
          if (med.presentation) line += ` (${med.presentation})`;
          if (med.instructions) line += `\n   *Posologia:* ${med.instructions}`;
          if (med.quantity) line += `\n   *Quantidade:* ${med.quantity}`;
          return line;
        }).join('\n\n');

        bodyText = `*PRESCRIÇÃO MEDICAMENTOSA*\n\n${medsText || buildFormattedPrescriptionText(specialPrescriptionItems)}`;
      }
    } else if (activeTemplate.category === 'atestado') {
      bodyText = `*ATESTADO ODONTOLÓGICO*\n\nAtesto, para os devidos fins, que ${patientDisplayName}, submeteu-se a atendimento odontológico ${atendimentoType} ${procedureDetail ? `(${procedureDetail})` : ''}, CID: ${isManualCid ? customCid : cidCode}, no dia ${dateStr} às ${docTime}, período ${periodoStr}, devendo se afastar de suas atividades pelo período de ${afastamentoDias} dia(s) por estar sob meus cuidados e responsabilidade neste período.`;
    } else if (activeTemplate.id === 'declaracao_comparecimento') {
      bodyText = `*DECLARAÇÃO DE COMPARECIMENTO*\n\nDeclaro, para os devidos fins de direito, que o(a) Sr(a). ${patientDisplayName} esteve presente neste consultório odontológico no dia ${dateStr}, durante o período de ${docTime} (${periodoStr}), submetendo-se a tratamento e acompanhamento clínico odontológico.`;
    } else if (activeTemplate.id === 'solicitacao_sangue') {
      const selectedExams = Object.entries(bloodExams).filter(([_, v]) => v).map(([k]) => k);
      const examsList = selectedExams.map((e, idx) => `• ${e}`).join('\n');
      bodyText = `*SOLICITAÇÃO DE EXAMES DE SANGUE PRÉ-OPERATÓRIOS*\n\nSolicito para o(a) paciente ${patientDisplayName} a realização dos seguintes exames pré-operatórios:\n\n${examsList || '• Hemograma Completo\n• Coagulograma\n• Glicemia em Jejum'}`;
    } else if (activeTemplate.id === 'relatorio_paio_pos_procedimento') {
      bodyText = `*PROTOCOLO DE ANESTESIA INTRA-ORAL & RELATÓRIO PÓS-PROCEDIMENTO (PAIO)*\n\n• *Procedimento:* ${paioProcedure}\n• *Região:* ${paioToothRegion}\n• *Anestesia Tópica:* ${Object.entries(topicalAnesthetics).filter(([_, v]) => v).map(([k]) => k).join(', ') || 'Nenhuma'}\n• *Locais de Aplicação:* ${paioAnesthesiaSites.join(' • ') || 'Não discriminado'}\n• *Tubetes Consumidos:* ${Object.entries(injectableTubetes).filter(([_, q]) => Number(q) > 0).map(([k, q]) => `${k}: ${q} tubete(s)`).join(', ') || '0'}\n\n*Orientações Pós-Operatórias:*\n${paioPostOpInstructions}`;
    } else {
      bodyText = activeTemplate.description || 'Documento emitido e registrado no sistema odontológico para fins de prontuário e acompanhamento clínico.';
    }

    const header = `📋 *${activeTemplate.title.toUpperCase()}*\n🏥 *${clinic}*\n🩺 *${dentist}* (${cro})\n👤 *Paciente:* ${patientDisplayName}\n📅 *Data:* ${dateStr}\n\n────────────────\n\n`;
    const footer = `\n\n────────────────\nDocumento emitido via DentisPro (https://dentispro.com.br)`;

    return `${header}${bodyText}${footer}`;
  };

  const getWhatsAppTargetUrl = () => {
    const docText = buildWhatsAppDocumentText();
    const targetPatient = selectedPatientId ? patients.find(p => p.id === selectedPatientId) : null;
    const phone = targetPatient?.phone || '';
    const cleanPhone = phone.replace(/\D/g, '');
    const formattedPhone = cleanPhone ? (cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`) : '';

    if (formattedPhone) {
      return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(docText)}`;
    }
    return `https://wa.me/?text=${encodeURIComponent(docText)}`;
  };

  return (
    <div className="space-y-6 pb-24 md:pb-8 font-sans">
      {/* Top Header & Search Bar */}
      <div className={`${t.cardBg} border ${t.cardBorder} rounded-3xl p-5 md:p-6 shadow-xs space-y-4`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl ${t.btnPrimaryBg} ${t.btnPrimaryText} flex items-center justify-center font-bold shadow-xs shrink-0`}>
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`bg-amber-500/10 ${t.accentText} text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider`}>
                  Documentos
                </span>
              </div>
              <h1 className={`text-xl md:text-2xl font-bold ${t.headingText} mt-0.5`}>
                Produção de Declarações, Atestados & Solicitações
              </h1>
              <p className="text-xs opacity-75">
                Selecione o modelo desejado para abrir o modal de parâmetros internos (Data, CID, Período, Paciente).
              </p>
            </div>
          </div>

          {/* Quick Search */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar modelo de documento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full ${t.inputBg} rounded-2xl pl-9 pr-3 py-2.5 text-xs font-semibold focus:outline-none`}
            />
          </div>
        </div>

        {/* Category Filter Tabs - Touch Friendly */}
        <div className={`flex items-center gap-2 overflow-x-auto pb-1 pt-2 border-t ${t.cardBorder} scrollbar-none`}>
          <button
            type="button"
            onClick={() => setSelectedCategory('todos')}
            className={`min-h-[44px] px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 shrink-0 cursor-pointer active:scale-95 ${
              selectedCategory === 'todos'
                ? `${t.btnPrimaryBg} ${t.btnPrimaryText} shadow-xs`
                : `${t.btnSecondaryBg} ${t.btnSecondaryText}`
            }`}
          >
            <Filter className={`w-4 h-4 ${t.accentText}`} />
            Todos
          </button>

          <button
            type="button"
            onClick={() => setSelectedCategory('atestado')}
            className={`min-h-[44px] px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 shrink-0 cursor-pointer active:scale-95 ${
              selectedCategory === 'atestado'
                ? `${t.btnPrimaryBg} ${t.btnPrimaryText} shadow-xs`
                : `${t.btnSecondaryBg} ${t.btnSecondaryText}`
            }`}
          >
            <FileText className="w-4 h-4 text-amber-500" />
            Atestados ({DENTAL_DOCUMENT_TEMPLATES.filter(t => t.category === 'atestado').length})
          </button>

          <button
            type="button"
            onClick={() => setSelectedCategory('declaracao')}
            className={`min-h-[44px] px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 shrink-0 cursor-pointer active:scale-95 ${
              selectedCategory === 'declaracao'
                ? `${t.btnPrimaryBg} ${t.btnPrimaryText} shadow-xs`
                : `${t.btnSecondaryBg} ${t.btnSecondaryText}`
            }`}
          >
            <FileCheck className="w-4 h-4 text-emerald-500" />
            Declarações & Termos ({DENTAL_DOCUMENT_TEMPLATES.filter(t => t.category === 'declaracao').length})
          </button>

          <button
            type="button"
            onClick={() => setSelectedCategory('solicitacao')}
            className={`min-h-[44px] px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 shrink-0 cursor-pointer active:scale-95 ${
              selectedCategory === 'solicitacao'
                ? `${t.btnPrimaryBg} ${t.btnPrimaryText} shadow-xs`
                : `${t.btnSecondaryBg} ${t.btnSecondaryText}`
            }`}
          >
            <FilePlus className="w-4 h-4 text-sky-500" />
            Solicitações ({DENTAL_DOCUMENT_TEMPLATES.filter(t => t.category === 'solicitacao').length})
          </button>
        </div>
      </div>

      {/* FERRAMENTAS & ASSISTENTES CLÍNICOS ODONTOLÓGICOS - EXPANÇÃO DO CONHECIMENTO */}
      <div className={`p-4 rounded-3xl border ${t.cardBorder} ${t.cardBg} space-y-3 shadow-2xs`}>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
            <span className={`text-xs font-bold ${t.headingText} uppercase tracking-wider`}>
              Ferramentas Clínicas Interativas e Suporte de Decisão Odontológica
            </span>
          </div>
          <span className="text-[10px] bg-amber-500/10 text-amber-700 font-bold px-2.5 py-0.5 rounded-full border border-amber-300/40">
            Conforme Diretrizes CFO / Anvisa
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => setIsAnestheticCalcOpen(true)}
            className="p-3.5 bg-gradient-to-r from-amber-500/10 to-amber-600/5 hover:from-amber-500/20 hover:to-amber-600/15 border border-amber-300/60 rounded-2xl text-left transition items-center gap-3 cursor-pointer group shadow-2xs flex"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-bold text-xs text-amber-950 flex items-center justify-between group-hover:text-amber-800">
                <span>Calculadora Anestésica</span>
                <ChevronRight className="w-4 h-4 text-amber-600 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <p className="text-[10.5px] text-amber-800/80 truncate mt-0.5">
                Dose máx. em tubetes & risco cardiopata
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setIsTherapeuticGuideOpen(true)}
            className="p-3.5 bg-gradient-to-r from-emerald-500/10 to-emerald-600/5 hover:from-emerald-500/20 hover:to-emerald-600/15 border border-emerald-300/60 rounded-2xl text-left transition items-center gap-3 cursor-pointer group shadow-2xs flex"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-bold text-xs text-emerald-950 flex items-center justify-between group-hover:text-emerald-800">
                <span>Guia Terapêutico Rápido</span>
                <ChevronRight className="w-4 h-4 text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <p className="text-[10.5px] text-emerald-800/80 truncate mt-0.5">
                Posologia, AINEs & Antibióticos
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setIsCidMatrixOpen(true)}
            className="p-3.5 bg-gradient-to-r from-sky-500/10 to-sky-600/5 hover:from-sky-500/20 hover:to-sky-600/15 border border-sky-300/60 rounded-2xl text-left transition items-center gap-3 cursor-pointer group shadow-2xs flex"
          >
            <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-bold text-xs text-sky-950 flex items-center justify-between group-hover:text-sky-800">
                <span>Matriz CID-10 & Atestados</span>
                <ChevronRight className="w-4 h-4 text-sky-600 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <p className="text-[10.5px] text-sky-800/80 truncate mt-0.5">
                Afastamentos por cirurgia e canal
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* BANNER VISUAL DE STATUS DE VALIDADE DA ASSINATURA DIGITAL & VERIFICADOR DE HASH ITI GOV.BR */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-teal-950 text-white p-4 sm:p-5 rounded-3xl border border-emerald-500/40 shadow-md space-y-3 font-sans">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-emerald-800/50 pb-3">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center shrink-0">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-0.5 flex items-center justify-center shadow-md">
                <ShieldCheck className="w-6 h-6 text-slate-950" />
              </div>
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Status da Assinatura Digital: VÁLIDA
                </span>
                <span className="bg-emerald-900/80 text-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/40">
                  ICP-Brasil / ITI / Gov.br
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Signatário: <strong>{activeProfessional?.name || clinicInfo.dentistName}</strong> ({activeProfessional?.cro || clinicInfo.cro})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-end flex-wrap">
            <button
              type="button"
              onClick={() => handleCopyDocumentHash('A8F9-4B12-8C01-D9E3-2F45-6A78-90BC-4E11')}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              {copiedHashToast ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Hash Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-teal-400" />
                  <span>Copiar Hash SHA-256</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleVerifyHashOnGovernmentPortal}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-md active:scale-95"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Verificar no Portal ITI (validar.iti.gov.br)</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="bg-slate-950/60 p-2.5 rounded-2xl border border-slate-800/80">
            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Algoritmo de Hash & Criptografia</span>
            <span className="font-mono text-emerald-300 font-bold text-[11px]">SHA-256 / RSA 2048 bits</span>
          </div>

          <div className="bg-slate-950/60 p-2.5 rounded-2xl border border-slate-800/80">
            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Código Hash SHA-256 do Documento</span>
            <span className="font-mono text-slate-200 text-[10.5px] truncate block" title="A8F9-4B12-8C01-D9E3-2F45-6A78-90BC-4E11">
              A8F9-4B12-8C01-D9E3-2F45-6A78-90BC-4E11
            </span>
          </div>

          <div className="bg-slate-950/60 p-2.5 rounded-2xl border border-slate-800/80">
            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Validação do Governo Federal</span>
            <a
              href="https://validar.iti.gov.br"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:underline font-bold text-[11px] flex items-center gap-1"
            >
              <span>validar.iti.gov.br</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Arquivos Recentes & Assinatura Digital Gov.br - Acesso Rápido */}
      <div className={`${t.cardBg} border ${t.cardBorder} rounded-3xl p-5 md:p-6 shadow-xs space-y-4`}>
        <div className={`flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b ${t.cardBorder}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2.5 ${t.btnSecondaryBg} rounded-2xl ${t.headingText}`}>
              <FolderOpen className={`w-6 h-6 ${t.accentText}`} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className={`text-lg font-bold ${t.headingText}`}>
                  Arquivos Recentes (Prontuário & Documentos Gerados)
                </h2>
                <span className={`${t.btnPrimaryBg} ${t.btnPrimaryText} text-xs font-bold px-2.5 py-0.5 rounded-full`}>
                  {(() => {
                    const selPatientObj = patients.find(p => p.id === selectedPatientId);
                    const list = savedClinicDocuments.filter(doc => {
                      if (showAllPatientsDocs || !selectedPatientId) return true;
                      return doc.patientId === selectedPatientId ||
                        (selPatientObj && doc.patientName && doc.patientName.toLowerCase().trim() === selPatientObj.name.toLowerCase().trim());
                    });
                    return list.length;
                  })()} doc(s)
                </span>
                {selectedPatientId && (
                  <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 animate-fadeIn">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Sincronizado: {patients.find(p => p.id === selectedPatientId)?.name || customPatientName || 'Paciente'}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Alterne ou selecione o paciente para sincronizar com os geradores de atestados, declarações, termos e receituários.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* Quick Synchronized Patient Selector Dropdown */}
            <div className="flex items-center gap-1.5 bg-stone-100/90 p-1.5 rounded-2xl border border-stone-200 shrink-0">
              <User className="w-4 h-4 text-amber-700 ml-1.5 shrink-0" />
              <select
                value={selectedPatientId}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val) {
                    handleSyncPatientAndQuickDoc(val, undefined);
                  } else {
                    setSelectedPatientId('');
                    setSelectedRecentPatient(null);
                    setShowAllPatientsDocs(true);
                  }
                }}
                className="bg-white text-stone-800 text-xs font-bold px-2.5 py-1.5 rounded-xl border border-stone-200 focus:outline-none cursor-pointer max-w-[180px] sm:max-w-[220px] truncate"
              >
                <option value="">-- Selecionar / Sincronizar Paciente --</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedPatientId && (
              <button
                type="button"
                onClick={() => {
                  setShowAllPatientsDocs(!showAllPatientsDocs);
                  if (!showAllPatientsDocs) {
                    setSelectedRecentPatient(null);
                  }
                }}
                className={`px-3 py-2 text-xs font-bold rounded-2xl transition cursor-pointer border shrink-0 ${
                  showAllPatientsDocs 
                    ? `${t.btnPrimaryBg} ${t.btnPrimaryText} border-transparent` 
                    : `${t.btnSecondaryBg} ${t.btnSecondaryText} ${t.cardBorder}`
                }`}
              >
                {showAllPatientsDocs ? 'Filtrar Selecionado' : 'Ver Todos os Pacientes'}
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowRecentsSection(!showRecentsSection)}
              className={`px-3.5 py-2 ${t.btnSecondaryBg} ${t.btnSecondaryText} border ${t.cardBorder} text-xs font-bold rounded-2xl transition shrink-0 cursor-pointer`}
            >
              {showRecentsSection ? 'Ocultar' : 'Mostrar Recentes'}
            </button>
          </div>
        </div>

        {showRecentsSection && (
          <div className="space-y-4">
            {/* Search filter inside Arquivos Recentes */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-stone-50/80 p-3 rounded-2xl border border-stone-200/80">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  value={recentsSearchQuery}
                  onChange={(e) => setRecentsSearchQuery(e.target.value)}
                  placeholder="Buscar por paciente ou documento em arquivos recentes..."
                  className="w-full bg-white border border-stone-200 rounded-xl pl-9 pr-8 py-1.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
                {recentsSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setRecentsSearchQuery('')}
                    className="absolute right-2.5 top-2 text-stone-400 hover:text-stone-600 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 shrink-0">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Sincronizado com Prontuário & Emissão de Documentos</span>
              </div>
            </div>

            {(() => {
              const selPatientObj = patients.find(p => p.id === selectedPatientId);

              // 1. Filter documents based on current patient filter if active
              const filteredDocs = savedClinicDocuments.filter(doc => {
                if (showAllPatientsDocs || !selectedPatientId) return true;
                return doc.patientId === selectedPatientId ||
                  (selPatientObj && doc.patientName && doc.patientName.toLowerCase().trim() === selPatientObj.name.toLowerCase().trim());
              });

              // 2. Group documents by patient
              const groupedPatientsMap = new Map<string, {
                patientId?: string;
                patientName: string;
                docs: typeof savedClinicDocuments;
                lastDate?: string;
                categories: Set<string>;
              }>();

              filteredDocs.forEach(doc => {
                const nameKey = (doc.patientName || 'Paciente sem Nome').toLowerCase().trim();
                if (!groupedPatientsMap.has(nameKey)) {
                  groupedPatientsMap.set(nameKey, {
                    patientId: doc.patientId,
                    patientName: doc.patientName || 'Paciente sem Nome',
                    docs: [],
                    lastDate: doc.formattedDateStr,
                    categories: new Set()
                  });
                }
                const entry = groupedPatientsMap.get(nameKey)!;
                entry.docs.push(doc);
                if (doc.category) entry.categories.add(doc.category);
              });

              let patientCardsList = Array.from(groupedPatientsMap.values()).sort((a, b) => {
                const timeA = new Date(a.docs[0]?.createdAt || 0).getTime();
                const timeB = new Date(b.docs[0]?.createdAt || 0).getTime();
                return timeB - timeA;
              });

              // Apply search filter
              if (recentsSearchQuery.trim()) {
                const q = recentsSearchQuery.toLowerCase().trim();
                patientCardsList = patientCardsList.filter(pCard => {
                  const nameMatch = pCard.patientName.toLowerCase().includes(q);
                  const docMatch = pCard.docs.some(d => d.title.toLowerCase().includes(q) || (d.summary && d.summary.toLowerCase().includes(q)));
                  return nameMatch || docMatch;
                });
              }

              if (patientCardsList.length === 0) {
                return (
                  <div className={`p-6 text-center text-xs opacity-75 ${t.cardBg} rounded-2xl border border-dashed ${t.cardBorder}`}>
                    {selectedPatientId && !showAllPatientsDocs
                      ? `Nenhum documento gerado para o paciente ${selPatientObj?.name || 'selecionado'}.`
                      : 'Nenhum paciente ou documento encontrado. Selecione um paciente no menu acima para iniciar ou emitir novos documentos.'}
                  </div>
                );
              }

              // LEVEL 2: A PATIENT CARD HAS BEEN CLICKED -> SHOW THE CARDS OF PAPÉIS DO EXPEDIENTE FOR THIS PATIENT
              if (selectedRecentPatient) {
                const selectedPatientKey = selectedRecentPatient.name.toLowerCase().trim();
                const patientDocs = savedClinicDocuments
                  .filter(doc => (doc.patientName || '').toLowerCase().trim() === selectedPatientKey || (doc.patientId && doc.patientId === selectedRecentPatient.id))
                  .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

                const matchedPatientObj = patients.find(p => p.id === selectedRecentPatient.id || p.name.toLowerCase().trim() === selectedPatientKey);

                return (
                  <div className="space-y-4">
                    {/* Header bar with ← Voltar, Quick Actions for generating docs, and 🏠 Ao Início */}
                    <div className={`p-4 ${t.cardBg} border ${t.cardBorder} rounded-2xl space-y-3`}>
                      <div className="flex items-center justify-between flex-wrap gap-3">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setSelectedRecentPatient(null)}
                            className={`px-3.5 py-2 ${t.btnSecondaryBg} ${t.btnSecondaryText} border ${t.cardBorder} text-xs font-bold rounded-xl flex items-center gap-1.5 hover:opacity-90 transition cursor-pointer`}
                            title="Voltar para a lista de pacientes recentes"
                          >
                            <ArrowLeft className="w-4 h-4" />
                            Voltar
                          </button>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className={`text-sm font-bold ${t.headingText}`}>
                                Prontuário & Papéis do Expediente: <span className={t.accentText}>{selectedRecentPatient.name}</span>
                              </h3>
                              <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-amber-300">
                                {patientDocs.length} documento(s)
                              </span>
                              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
                                <UserCheck className="w-3 h-3 text-emerald-600" />
                                Paciente Sincronizado
                              </span>
                            </div>
                            <p className="text-[11px] opacity-70 mt-0.5">
                              {matchedPatientObj?.phone ? `Telefone: ${matchedPatientObj.phone} | ` : ''}
                              Selecione ou imprima qualquer papel emitido ou crie novos atestados, declarações, termos e receituários abaixo.
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedRecentPatient(null)}
                            className={`px-3 py-2 ${t.btnSecondaryBg} ${t.btnSecondaryText} border ${t.cardBorder} text-xs font-bold rounded-xl flex items-center gap-1.5 hover:opacity-90 transition cursor-pointer`}
                            title="Voltar para a lista de pacientes"
                          >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            Lista de Pacientes
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedRecentPatient(null);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className={`px-3 py-2 ${t.btnPrimaryBg} ${t.btnPrimaryText} text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-2xs`}
                            title="Voltar ao início da página"
                          >
                            <Home className="w-3.5 h-3.5" />
                            Ao Início
                          </button>
                        </div>
                      </div>

                      {/* QUICK ACTION BAR TO GENERATE NEW DOCUMENTS FOR THIS PATIENT */}
                      <div className="pt-3 border-t border-stone-200/80 flex items-center justify-between gap-2 flex-wrap">
                        <span className="text-xs font-bold text-stone-700 flex items-center gap-1">
                          <Plus className="w-4 h-4 text-amber-600" />
                          Gerar Novo Documento para {selectedRecentPatient.name}:
                        </span>
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            type="button"
                            onClick={() => handleSyncPatientAndQuickDoc(selectedRecentPatient.id, selectedRecentPatient.name, 'atestado')}
                            className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 text-xs font-bold rounded-xl flex items-center gap-1 transition cursor-pointer active:scale-95"
                          >
                            <FileText className="w-3.5 h-3.5 text-amber-600" />
                            + Novo Atestado
                          </button>

                          <button
                            type="button"
                            onClick={() => handleSyncPatientAndQuickDoc(selectedRecentPatient.id, selectedRecentPatient.name, 'declaracao')}
                            className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold rounded-xl flex items-center gap-1 transition cursor-pointer active:scale-95"
                          >
                            <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                            + Nova Declaração
                          </button>

                          <button
                            type="button"
                            onClick={() => handleSyncPatientAndQuickDoc(selectedRecentPatient.id, selectedRecentPatient.name, 'termo')}
                            className="px-2.5 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-300 text-xs font-bold rounded-xl flex items-center gap-1 transition cursor-pointer active:scale-95"
                          >
                            <BookOpen className="w-3.5 h-3.5 text-teal-600" />
                            + Novo Termo (TCLE)
                          </button>

                          <button
                            type="button"
                            onClick={() => handleSyncPatientAndQuickDoc(selectedRecentPatient.id, selectedRecentPatient.name, 'receituario')}
                            className="px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-300 text-xs font-bold rounded-xl flex items-center gap-1 transition cursor-pointer active:scale-95"
                          >
                            <Stethoscope className="w-3.5 h-3.5 text-purple-600" />
                            + Novo Receituário
                          </button>

                          <button
                            type="button"
                            onClick={() => handleSyncPatientAndQuickDoc(selectedRecentPatient.id, selectedRecentPatient.name, 'solicitacao')}
                            className="px-2.5 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-300 text-xs font-bold rounded-xl flex items-center gap-1 transition cursor-pointer active:scale-95"
                          >
                            <FilePlus className="w-3.5 h-3.5 text-sky-600" />
                            + Nova Solicitação
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Grid of Papéis do Expediente for this patient */}
                    {patientDocs.length === 0 ? (
                      <div className={`p-6 text-center text-xs opacity-75 ${t.cardBg} rounded-2xl border border-dashed ${t.cardBorder}`}>
                        Nenhum papel do expediente encontrado para este paciente. Clique nos botões acima para gerar um atestado, declaração, termo ou receituário.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {patientDocs.map((doc) => (
                          <div
                            key={doc.id}
                            onClick={() => handlePrintSystemWindow(doc)}
                            className={`p-4 ${t.cardBg} border-2 ${t.cardBorder} hover:border-[#d4a373] rounded-2xl transition-all space-y-3 flex flex-col justify-between cursor-pointer group shadow-2xs hover:shadow-md`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wide ${
                                    doc.category === 'atestado' ? 'bg-amber-100 text-amber-800' :
                                    doc.category === 'receita' ? 'bg-purple-100 text-purple-800' :
                                    doc.category === 'declaracao' ? 'bg-emerald-100 text-emerald-800' :
                                    'bg-sky-100 text-sky-800'
                                  }`}>
                                    {doc.category === 'atestado' ? 'Atestado' : doc.category === 'declaracao' ? 'Declaração' : doc.category === 'receita' ? 'Receituário' : 'Solicitação'}
                                  </span>
                                  <span className="text-[11px] opacity-60">
                                    {doc.formattedDateStr}
                                  </span>
                                </div>
                                <h3 className={`text-sm font-bold ${t.headingText} group-hover:${t.accentText} transition leading-snug`}>
                                  {doc.title}
                                </h3>
                                {doc.cidCode && (
                                  <p className="text-xs text-amber-800 font-mono bg-amber-50 px-2 py-0.5 rounded-md inline-block">
                                    CID: {doc.cidCode}
                                  </p>
                                )}
                              </div>

                              <div className="shrink-0 text-right">
                                {doc.status === 'assinado_govbr' ? (
                                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 border border-emerald-300">
                                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                                    Gov.br Assinado
                                  </span>
                                ) : (
                                  <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-1 rounded-full">
                                    Aguardando Assinatura
                                  </span>
                                )}
                              </div>
                            </div>

                            <p className={`text-xs opacity-80 line-clamp-2 ${t.cardBg} p-2 rounded-xl border ${t.cardBorder}`}>
                              {doc.summary}
                            </p>

                            {/* Action buttons inside document card */}
                            <div
                              className={`flex items-center gap-2 pt-2 border-t ${t.cardBorder} flex-wrap`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                type="button"
                                onClick={() => handlePrintSystemWindow(doc)}
                                className={`flex-1 min-h-[38px] px-3 py-1.5 ${t.btnPrimaryBg} ${t.btnPrimaryText} text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer shadow-2xs`}
                                title="Imprimir documento"
                              >
                                <Printer className="w-3.5 h-3.5" />
                                Imprimir
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDownloadPdfForGovBr(doc, true)}
                                className="flex-1 min-h-[38px] px-3 py-1.5 bg-[#002776] hover:bg-[#001f5c] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer shadow-2xs"
                                title="Assinar digitalmente no Gov.br"
                              >
                                <ExternalLink className="w-3.5 h-3.5 text-[#ffdf00]" />
                                Assinar Gov.br
                              </button>

                              <button
                                type="button"
                                onClick={() => deleteSavedClinicDocument(doc.id)}
                                className="min-h-[38px] px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-xl transition cursor-pointer"
                                title="Excluir este papel do expediente"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Bottom Navigation for Level 2 */}
                    <div className="flex items-center justify-between gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setSelectedRecentPatient(null)}
                        className={`px-4 py-2 ${t.btnSecondaryBg} ${t.btnSecondaryText} border ${t.cardBorder} text-xs font-bold rounded-xl flex items-center gap-2 hover:opacity-90 transition cursor-pointer`}
                      >
                        <ArrowLeft className="w-4 h-4" />
                        Voltar para Pacientes Recentes
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedRecentPatient(null);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className={`px-4 py-2 ${t.btnPrimaryBg} ${t.btnPrimaryText} text-xs font-bold rounded-xl flex items-center gap-2 transition cursor-pointer shadow-2xs`}
                      >
                        <Home className="w-4 h-4" />
                        Ao Início
                      </button>
                    </div>
                  </div>
                );
              }

              // LEVEL 1: LIST OF RECENT PATIENT CARDS WHO HAVE PRESCRIBED SOLICITAÇÕES / ATESTADOS / DOCUMENTS
              return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {patientCardsList.map((pCard, pIdx) => {
                    const matchedPatient = patients.find(p => p.id === pCard.patientId || p.name.toLowerCase().trim() === pCard.patientName.toLowerCase().trim());
                    const isCurrentlyActive = selectedPatientId && (selectedPatientId === pCard.patientId || (matchedPatient && matchedPatient.id === selectedPatientId));

                    return (
                      <div
                        key={pIdx}
                        className={`p-4 ${t.cardBg} border-2 ${isCurrentlyActive ? 'border-amber-500 shadow-sm' : t.cardBorder} hover:border-[#d4a373] rounded-2xl transition-all space-y-3 flex flex-col justify-between group shadow-2xs hover:shadow-md`}
                      >
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${t.btnPrimaryBg} ${t.btnPrimaryText} shadow-2xs shrink-0`}>
                                {pCard.patientName.charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <h3 className={`text-sm font-bold ${t.headingText} group-hover:${t.accentText} transition truncate`}>
                                  {pCard.patientName}
                                </h3>
                                {matchedPatient?.phone && (
                                  <p className="text-[11px] opacity-60 truncate">
                                    📞 {matchedPatient.phone}
                                  </p>
                                )}
                              </div>
                            </div>

                            {isCurrentlyActive && (
                              <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                                <UserCheck className="w-3 h-3 text-emerald-600" />
                                Ativo
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 flex-wrap">
                            {Array.from(pCard.categories).map((cat, cIdx) => (
                              <span
                                key={cIdx}
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                                  cat === 'atestado' ? 'bg-amber-100 text-amber-800' :
                                  cat === 'receita' ? 'bg-purple-100 text-purple-800' :
                                  cat === 'declaracao' ? 'bg-emerald-100 text-emerald-800' :
                                  'bg-sky-100 text-sky-800'
                                }`}
                              >
                                {cat === 'atestado' ? 'Atestado' : cat === 'declaracao' ? 'Declaração' : cat === 'receita' ? 'Receituário' : 'Solicitação'}
                              </span>
                            ))}
                          </div>

                          <div className={`p-2 rounded-xl border ${t.cardBorder} bg-stone-50/60 flex items-center justify-between text-xs`}>
                            <span className="font-semibold text-stone-600">Papéis do Expediente:</span>
                            <span className={`font-bold ${t.accentText} text-xs bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200`}>
                              {pCard.docs.length} doc(s)
                            </span>
                          </div>
                        </div>

                        {/* Interactive Action Shortcuts for this patient */}
                        <div className="space-y-2 pt-2 border-t border-stone-200/60">
                          {/* Speed dial buttons to directly create Atestado, Declaração, Termo, Receituário */}
                          <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                            <button
                              type="button"
                              onClick={() => handleSyncPatientAndQuickDoc(pCard.patientId, pCard.patientName, 'atestado')}
                              className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg font-bold transition flex items-center justify-center gap-1 cursor-pointer active:scale-95"
                              title={`Gerar Novo Atestado para ${pCard.patientName}`}
                            >
                              <FileText className="w-3 h-3 text-amber-600" />
                              + Atestado
                            </button>

                            <button
                              type="button"
                              onClick={() => handleSyncPatientAndQuickDoc(pCard.patientId, pCard.patientName, 'declaracao')}
                              className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg font-bold transition flex items-center justify-center gap-1 cursor-pointer active:scale-95"
                              title={`Gerar Nova Declaração para ${pCard.patientName}`}
                            >
                              <FileCheck className="w-3 h-3 text-emerald-600" />
                              + Declaração
                            </button>

                            <button
                              type="button"
                              onClick={() => handleSyncPatientAndQuickDoc(pCard.patientId, pCard.patientName, 'termo')}
                              className="px-2 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-lg font-bold transition flex items-center justify-center gap-1 cursor-pointer active:scale-95"
                              title={`Gerar Termo TCLE para ${pCard.patientName}`}
                            >
                              <BookOpen className="w-3 h-3 text-teal-600" />
                              + Termo TCLE
                            </button>

                            <button
                              type="button"
                              onClick={() => handleSyncPatientAndQuickDoc(pCard.patientId, pCard.patientName, 'receituario')}
                              className="px-2 py-1 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 rounded-lg font-bold transition flex items-center justify-center gap-1 cursor-pointer active:scale-95"
                              title={`Gerar Receituário para ${pCard.patientName}`}
                            >
                              <Stethoscope className="w-3 h-3 text-purple-600" />
                              + Receituário
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleSyncPatientAndQuickDoc(pCard.patientId, pCard.patientName)}
                            className={`w-full py-1.5 ${t.btnPrimaryBg} ${t.btnPrimaryText} rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs active:scale-95`}
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            Sincronizar & Ver Prontuário
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* Templates Grid - Touch-Screen Friendly & Fully Interactive */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map((template) => {
          const Icon = template.icon;
          return (
            <div
              key={template.id}
              onClick={() => handleOpenParametersModal(template)}
              className={`${t.cardBg} border-2 ${t.cardBorder} hover:border-[#d4a373] rounded-3xl p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group cursor-pointer active:scale-[0.99]`}
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-2xl flex items-center justify-center ${
                    template.category === 'atestado' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                    template.category === 'declaracao' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                    'bg-sky-50 text-sky-700 border border-sky-200'
                  }`}>
                    <Icon className="w-6 h-6" />
                  </div>

                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                    template.category === 'atestado' ? 'bg-amber-100 text-amber-800' :
                    template.category === 'declaracao' ? 'bg-emerald-100 text-emerald-800' :
                    'bg-sky-100 text-sky-800'
                  }`}>
                    {template.category === 'atestado' ? 'Atestado' : template.category === 'declaracao' ? 'Declaração' : 'Solicitação'}
                  </span>
                </div>

                <div>
                  <h3 className={`font-bold text-sm ${t.headingText} group-hover:${t.accentText} transition`}>
                    {template.title}
                  </h3>
                  <p className={`text-[11px] font-semibold ${t.accentText}`}>
                    {template.subtitle}
                  </p>
                </div>

                <p className="text-xs opacity-75 leading-relaxed line-clamp-3">
                  {template.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* PARAMETERS CONFIGURATION MODAL */}
      {activeTemplate && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 md:p-6 overflow-y-auto">
          <div className={`${t.modalBg} border-2 ${t.cardBorder} rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden my-auto animate-fadeIn max-h-[90vh] flex flex-col`}>
            {/* Modal Header */}
            <div className={`${t.modalHeaderBg} ${t.modalHeaderTitle} p-4 md:p-5 flex items-center justify-between shrink-0`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] opacity-80 uppercase font-bold tracking-wider block">
                    Parâmetros do Documento
                  </span>
                  <h3 className={`text-base font-bold ${t.modalHeaderTitle}`}>{activeTemplate.title}</h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveTemplate(null)}
                className="p-2 text-white/70 hover:text-white rounded-xl hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Scrollable Content - Form Parameters */}
            <div className="p-4 md:p-6 space-y-5 overflow-y-auto flex-1 font-sans text-xs">
              {/* 1. SELEÇÃO DO PACIENTE & IDADE/MESES */}
              <div className={`${t.cardBg} p-4 rounded-2xl border ${t.cardBorder} space-y-3`}>
                <span className={`text-xs font-bold ${t.headingText} uppercase tracking-wider flex items-center gap-1.5 border-b ${t.cardBorder} pb-2`}>
                  <User className={`w-4 h-4 ${t.accentText}`} />
                  1. Dados do Paciente (Paciente Cadastrado, Nome e Idade/Meses)
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="sm:col-span-1 md:col-span-2">
                    <label className={`block text-xs font-semibold ${t.headingText} mb-1`}>
                      Selecionar Paciente Cadastrado:
                    </label>
                    <select
                      value={selectedPatientId}
                      onChange={(e) => {
                        setSelectedPatientId(e.target.value);
                        if (e.target.value) {
                          setCustomPatientName('');
                        }
                      }}
                      className={`w-full ${t.inputBg} border ${t.cardBorder} rounded-xl px-3 py-2 text-xs font-bold focus:outline-none`}
                    >
                      <option value="">-- Selecionar Paciente da Clínica --</option>
                      {patients.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} (CPF: {p.cpf})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-1 md:col-span-2">
                    <label className={`block text-xs font-semibold ${t.headingText} mb-1`}>
                      Ou Digite o Nome do Paciente (Avulso):
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Francisco Márcio Bezerra"
                      value={customPatientName}
                      onChange={(e) => {
                        setCustomPatientName(e.target.value);
                        if (e.target.value) {
                          setSelectedPatientId('');
                        }
                      }}
                      className={`w-full ${t.inputBg} border ${t.cardBorder} rounded-xl px-3 py-2 text-xs font-bold focus:outline-none`}
                    />
                  </div>

                  <div>
                    <label className={`block text-xs font-semibold ${t.headingText} mb-1`}>
                      Idade (Anos):
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="120"
                      value={customPatientAgeYears}
                      onChange={(e) => setCustomPatientAgeYears(e.target.value)}
                      className={`w-full ${t.inputBg} border ${t.cardBorder} rounded-xl px-3 py-2 text-xs font-bold focus:outline-none`}
                    />
                  </div>

                  <div>
                    <label className={`block text-xs font-semibold ${t.headingText} mb-1`}>
                      Idade (Meses):
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="11"
                      value={customPatientAgeMonths}
                      onChange={(e) => setCustomPatientAgeMonths(e.target.value)}
                      className={`w-full ${t.inputBg} border ${t.cardBorder} rounded-xl px-3 py-2 text-xs font-bold focus:outline-none`}
                    />
                  </div>

                  <div className={`sm:col-span-2 md:col-span-2 ${t.btnSecondaryBg} p-2.5 rounded-xl border ${t.cardBorder} flex items-center justify-between`}>
                    <span className={`text-[11px] font-semibold ${t.headingText}`}>Idade para o Documento:</span>
                    <span className={`text-xs font-bold ${t.btnPrimaryBg} ${t.btnPrimaryText} px-2.5 py-1 rounded-lg`}>
                      {formattedAgeDisplay()}
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. PARÂMETROS DE DATA, HORA & PERÍODO */}
              <div className={`${t.cardBg} p-4 rounded-2xl border ${t.cardBorder} space-y-3`}>
                <span className={`text-xs font-bold ${t.headingText} uppercase tracking-wider flex items-center gap-1.5 border-b ${t.cardBorder} pb-2`}>
                  <Calendar className={`w-4 h-4 ${t.accentText}`} />
                  2. Parâmetros de Data, Hora e Período
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className={`block text-xs font-semibold ${t.headingText} mb-1`}>Data do Documento:</label>
                    <input
                      type="date"
                      value={docDate}
                      onChange={(e) => setDocDate(e.target.value)}
                      className={`w-full ${t.inputBg} border ${t.cardBorder} rounded-xl px-3 py-2 text-xs font-bold focus:outline-none`}
                    />
                  </div>

                  <div>
                    <label className={`block text-xs font-semibold ${t.headingText} mb-1`}>Horário do Atendimento (às):</label>
                    <input
                      type="time"
                      value={docTime}
                      onChange={(e) => setDocTime(e.target.value)}
                      className={`w-full ${t.inputBg} border ${t.cardBorder} rounded-xl px-3 py-2 text-xs font-bold focus:outline-none`}
                    />
                  </div>

                  <div>
                    <label className={`block text-xs font-semibold ${t.headingText} mb-1`}>Período:</label>
                    <select
                      value={periodoStr}
                      onChange={(e) => setPeriodoStr(e.target.value)}
                      className={`w-full ${t.inputBg} border ${t.cardBorder} rounded-xl px-3 py-2 text-xs font-bold focus:outline-none`}
                    >
                      <option value="Integral">Integral</option>
                      <option value="Manhã">Manhã</option>
                      <option value="Tarde">Tarde</option>
                      <option value="Noturno">Noturno</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 3. PARÂMETROS ESPECÍFICOS: RECEITUÁRIO DE CONTROLE ESPECIAL */}
              {activeTemplate.id === 'receituario_controle_especial' && (
                <div className={`${t.cardBg} p-4 sm:p-5 rounded-2xl border ${t.cardBorder} space-y-4 shadow-2xs`}>
                  <div className={`flex flex-wrap items-center justify-between gap-2 border-b ${t.cardBorder} pb-3`}>
                    <span className={`text-xs font-bold ${t.headingText} uppercase tracking-wider flex items-center gap-1.5`}>
                      <FileText className={`w-4 h-4 ${t.accentText}`} />
                      3. Prescrição de Controle Especial (Anvisa Portaria 344/98 - 2 Vias)
                    </span>
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => setIsTherapeuticGuideOpen(true)}
                        className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                        title="Ver todo o catálogo e banco de dados completo de medicamentos e posologias"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Banco de Dados de Medicamentos</span>
                      </button>
                      <span className={`text-[11px] font-semibold ${t.cardText} opacity-75 ${t.btnSecondaryBg} px-2.5 py-0.5 rounded-full`}>
                        {specialPrescriptionItems.length} medicamento(s) na receita
                      </span>
                      <button
                        type="button"
                        onClick={handleAddCustomMedication}
                        className={`px-3 py-1.5 ${t.btnPrimaryBg} ${t.btnPrimaryText} text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-xs`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Adicionar Medicamento</span>
                      </button>
                    </div>
                  </div>

                  {/* LIST OF ADDED MEDICATIONS */}
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <label className={`block text-xs font-bold ${t.headingText} uppercase tracking-wide`}>
                        Itens de Medicamentos e Posologia:
                      </label>
                      
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setShowManageTemplatesModal(true)}
                          className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-800 text-xs font-bold rounded-lg flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                          title="Gerenciar modelos de prescrição salvos no seu catálogo pessoal"
                        >
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                          <span>Meus Modelos Salvos ({customSavedTemplates.length})</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleAddCustomMedication}
                          className={`text-xs font-bold ${t.headingText} hover:underline flex items-center gap-1 cursor-pointer`}
                        >
                          <Plus className={`w-3.5 h-3.5 ${t.accentText}`} />
                          <span>+ Novo Medicamento</span>
                        </button>
                      </div>
                    </div>

                    {specialPrescriptionItems.length === 0 ? (
                      <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-xl text-center text-xs text-amber-900 font-medium space-y-2">
                        <p>Nenhum medicamento na receita de controle especial.</p>
                        <button
                          type="button"
                          onClick={handleAddCustomMedication}
                          className={`px-3 py-1.5 ${t.btnPrimaryBg} ${t.btnPrimaryText} text-xs font-bold rounded-xl inline-flex items-center gap-1 cursor-pointer`}
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Adicionar Medicamento</span>
                        </button>
                      </div>
                    ) : (
                      specialPrescriptionItems.map((med, idx) => (
                        <div 
                          key={med.id || idx} 
                          className={`${t.cardBg} p-3.5 sm:p-4 rounded-xl border ${t.cardBorder} space-y-3 shadow-2xs transition`}
                        >
                          {/* Card Header */}
                          <div className={`flex flex-wrap items-center justify-between gap-2 border-b ${t.cardBorder} pb-2`}>
                            <span className={`font-bold text-xs ${t.headingText} flex items-center gap-1.5`}>
                              <span className={`w-5 h-5 rounded-full ${t.btnPrimaryBg} ${t.btnPrimaryText} text-[11px] flex items-center justify-center font-mono`}>
                                {idx + 1}
                              </span>
                              {med.name}
                            </span>

                            <div className="flex flex-wrap items-center gap-1.5">
                              {/* Save as Custom Model Template */}
                              <button
                                type="button"
                                onClick={() => {
                                  handleSaveAsCustomTemplate(med);
                                  setSavedModelToastIndex(idx);
                                  setTimeout(() => setSavedModelToastIndex(null), 2500);
                                }}
                                className={`px-2.5 py-1 text-xs font-bold rounded-lg flex items-center gap-1 transition cursor-pointer ${
                                  savedModelToastIndex === idx
                                    ? 'bg-amber-600 text-white'
                                    : 'bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-800'
                                }`}
                                title="Salvar este medicamento como modelo reutilizável"
                              >
                                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                                <span>{savedModelToastIndex === idx ? 'Modelo Salvo!' : 'Salvar Modelo'}</span>
                              </button>

                              {/* Save Medication Button */}
                              <button
                                type="button"
                                onClick={() => handleSaveMedicationItem(idx)}
                                className={`px-2.5 py-1 text-xs font-bold rounded-lg flex items-center gap-1 transition cursor-pointer ${
                                  savedMedicationIndex === idx
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800'
                                }`}
                                title="Atualizar este item na receita impressa"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>{savedMedicationIndex === idx ? 'Salvo!' : 'Salvar Item'}</span>
                              </button>

                              {/* Alert & Bulas Modal Trigger */}
                              <button
                                type="button"
                                onClick={() => setActiveAlertModalItem({ item: { ...med }, index: idx })}
                                className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 border border-amber-300 text-amber-900 font-bold text-xs rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                                title="Ver / Editar Contraindicações, Interações e Dicas deste Fármaco"
                              >
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                                <span className="hidden sm:inline">Alertas & Bulas</span>
                                <span className="sm:hidden">Alertas</span>
                              </button>

                              {/* Delete button */}
                              <button
                                type="button"
                                onClick={() => handleRemoveMedicationItem(idx)}
                                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                                title="Remover medicamento da receita"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Editable Grid Fields */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-xs">
                            {/* Nome do Fármaco - Merged Searchable Autocomplete Combobox */}
                            <div className="md:col-span-2 space-y-1 relative">
                              <div className="flex flex-wrap items-center justify-between gap-1">
                                <label className={`block text-[11px] font-semibold ${t.headingText}`}>
                                  Nome do Fármaco / Medicamento (Busca Inteligente):
                                </label>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] opacity-60 font-normal hidden sm:inline">
                                    Digite para buscar no catálogo
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => setShowManageTemplatesModal(true)}
                                    className="text-[10px] font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 px-1.5 py-0.5 rounded border border-amber-300 transition cursor-pointer"
                                    title="Gerenciar modelos salvos"
                                  >
                                    ⭐ Meus Modelos
                                  </button>
                                </div>
                              </div>

                              <div className="relative">
                                <input
                                  type="text"
                                  value={med.name}
                                  onFocus={() => setActiveAutocompleteIndex(idx)}
                                  onChange={(e) => {
                                    handleUpdateMedicationItem(idx, 'name', e.target.value);
                                    setActiveAutocompleteIndex(idx);
                                  }}
                                  placeholder="Digite ou selecione no catálogo (ex: Amoxicilina, Ibuprofeno, Dipirona)..."
                                  className={`w-full ${t.inputBg} border ${t.cardBorder} rounded-lg pl-8 pr-8 py-1.5 font-bold focus:outline-none transition`}
                                />
                                <Search className="w-4 h-4 opacity-50 absolute left-2.5 top-2.5 pointer-events-none" />
                                {med.name && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      handleUpdateMedicationItem(idx, 'name', '');
                                      setActiveAutocompleteIndex(idx);
                                    }}
                                    className="absolute right-2.5 top-2.5 opacity-50 hover:opacity-100 cursor-pointer"
                                    title="Limpar campo"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                )}

                                {/* Autocomplete Suggestions Menu */}
                                {activeAutocompleteIndex === idx && (() => {
                                  const query = (med.name || '').trim().toLowerCase();
                                  const filteredTemplates = customSavedTemplates.filter(t =>
                                    !query ||
                                    t.name.toLowerCase().includes(query) ||
                                    (t.category && t.category.toLowerCase().includes(query)) ||
                                    (t.dosage && t.dosage.toLowerCase().includes(query))
                                  );
                                  const filteredCatalog = DENTAL_MEDICATIONS_CATALOG.filter(c =>
                                    !query ||
                                    c.name.toLowerCase().includes(query) ||
                                    (c.category && c.category.toLowerCase().includes(query)) ||
                                    (c.dosage && c.dosage.toLowerCase().includes(query))
                                  );

                                  const totalFound = filteredTemplates.length + filteredCatalog.length;

                                  return (
                                    <>
                                      <div
                                        className="fixed inset-0 z-30"
                                        onClick={() => setActiveAutocompleteIndex(null)}
                                      />
                                      <div
                                        className={`absolute z-40 left-0 right-0 top-full mt-1 ${t.cardBg} border ${t.cardBorder} rounded-xl shadow-2xl max-h-64 overflow-y-auto divide-y divide-stone-100`}
                                        onMouseDown={(e) => e.preventDefault()}
                                      >
                                        {totalFound === 0 ? (
                                          <div className="p-3 text-center text-xs opacity-70">
                                            Nenhum medicamento pré-cadastrado encontrado para "<strong>{med.name}</strong>".
                                            <p className="text-[10.5px] opacity-50 mt-0.5">Você pode continuar digitando este nome normalmente.</p>
                                          </div>
                                        ) : (
                                          <>
                                            {filteredTemplates.length > 0 && (
                                              <div className="p-1">
                                                <div className="px-2 py-1 text-[10px] font-bold text-amber-800 bg-amber-50 rounded-md mb-1 flex items-center gap-1">
                                                  <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                                                  <span>MEUS MODELOS SALVOS</span>
                                                </div>
                                                {filteredTemplates.map((tpl) => (
                                                  <button
                                                    key={tpl.id}
                                                    type="button"
                                                    onClick={() => handleSelectAutocompleteMedication(idx, tpl)}
                                                    className="w-full text-left px-2.5 py-1.5 hover:bg-amber-50/60 rounded-lg transition text-xs flex items-center justify-between gap-2 cursor-pointer group"
                                                  >
                                                    <div className="truncate">
                                                      <span className="font-bold group-hover:text-amber-900">{tpl.name}</span>
                                                      <span className="text-[11px] opacity-75 ml-1.5">{tpl.dosage} ({tpl.presentation})</span>
                                                    </div>
                                                    <span className="text-[10px] font-semibold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded shrink-0">
                                                      Usar Modelo
                                                    </span>
                                                  </button>
                                                ))}
                                              </div>
                                            )}

                                            {filteredCatalog.length > 0 && (
                                              <div className="p-1">
                                                <div className={`px-2 py-1 text-[10px] font-bold ${t.headingText} ${t.btnSecondaryBg} rounded-md mb-1 flex items-center gap-1`}>
                                                  <BookOpen className="w-3 h-3" />
                                                  <span>CATÁLOGO ODONTOLÓGICO</span>
                                                </div>
                                                {filteredCatalog.map((catMed) => (
                                                  <button
                                                    key={catMed.id}
                                                    type="button"
                                                    onClick={() => handleSelectAutocompleteMedication(idx, catMed)}
                                                    className={`w-full text-left px-2.5 py-1.5 ${t.btnSecondaryBg} rounded-lg transition text-xs flex items-center justify-between gap-2 cursor-pointer group`}
                                                  >
                                                    <div className="truncate">
                                                      <span className={`font-bold ${t.headingText}`}>{catMed.name}</span>
                                                      <span className="text-[11px] opacity-75 ml-1.5">{catMed.dosage} ({catMed.presentation})</span>
                                                    </div>
                                                    <span className={`text-[10px] opacity-60 ${t.headingText} font-medium shrink-0`}>
                                                      [{catMed.category || 'Geral'}]
                                                    </span>
                                                  </button>
                                                ))}
                                              </div>
                                            )}
                                          </>
                                        )}
                                      </div>
                                    </>
                                  );
                                })()}
                              </div>
                            </div>

                            {/* Apresentação (Campo Único: Dropdown + Digitação Livre) - OPCIONAL */}
                            <div>
                              <label className={`block text-[11px] font-semibold ${t.headingText} mb-0.5`}>
                                Apresentação <span className="font-normal opacity-70">(Opcional)</span>:
                              </label>
                              <input
                                type="text"
                                list={`presentation-datalist-${idx}`}
                                value={med.presentation || ''}
                                onChange={(e) => handleUpdateMedicationItem(idx, 'presentation', e.target.value)}
                                placeholder="Selecione no menu ou digite (ex: Comprimido, Cápsula)..."
                                className={`w-full ${t.inputBg} border ${t.cardBorder} rounded-lg px-2.5 py-1.5 text-xs font-medium focus:outline-none`}
                              />
                              <datalist id={`presentation-datalist-${idx}`}>
                                {PRESENTATION_DROPDOWN_OPTIONS.map((opt, oIdx) => (
                                  <option key={oIdx} value={opt} />
                                ))}
                              </datalist>
                            </div>

                            {/* Dosagem / Concentração */}
                            <div>
                              <label className={`block text-[11px] font-semibold ${t.headingText} mb-0.5`}>
                                Dosagem / Concentração <span className="font-normal opacity-70">(Opcional)</span>:
                              </label>
                              <input
                                type="text"
                                list={`dosage-datalist-${idx}`}
                                value={med.dosage || ''}
                                onChange={(e) => handleUpdateMedicationItem(idx, 'dosage', e.target.value)}
                                placeholder="Selecione no menu ou digite (ex: 500 mg, 875 mg)..."
                                className={`w-full ${t.inputBg} border ${t.cardBorder} rounded-lg px-2.5 py-1.5 text-xs font-medium focus:outline-none`}
                              />
                              <datalist id={`dosage-datalist-${idx}`}>
                                {DOSAGE_DROPDOWN_OPTIONS.map((opt, oIdx) => (
                                  <option key={oIdx} value={opt} />
                                ))}
                              </datalist>
                            </div>

                            {/* Quantidade Prescrita (Campo Único: Dropdown + Digitação Livre) - OPCIONAL */}
                            <div className="md:col-span-2">
                              <label className={`block text-[11px] font-semibold ${t.headingText} mb-0.5`}>
                                Quantidade Prescrita <span className="font-normal opacity-70">(Opcional)</span>:
                              </label>
                              <input
                                type="text"
                                list={`quantity-datalist-${idx}`}
                                value={med.quantity || ''}
                                onChange={(e) => handleUpdateMedicationItem(idx, 'quantity', e.target.value)}
                                placeholder="Selecione no menu ou digite (ex: 1 caixa, 2 frascos)..."
                                className={`w-full ${t.inputBg} border ${t.cardBorder} rounded-lg px-2.5 py-1.5 text-xs font-medium focus:outline-none`}
                              />
                              <datalist id={`quantity-datalist-${idx}`}>
                                {QUANTITY_DROPDOWN_OPTIONS.map((opt, oIdx) => (
                                  <option key={oIdx} value={opt} />
                                ))}
                              </datalist>
                            </div>
                          </div>

                          {/* POSOLOGY ASSISTANT WITH DROPDOWN MENUS */}
                          <div className={`${t.btnSecondaryBg} p-3 rounded-xl border ${t.cardBorder} space-y-2.5`}>
                            <div className="flex items-center justify-between">
                              <span className={`text-[11px] font-bold ${t.headingText} flex items-center gap-1.5`}>
                                <SlidersHorizontal className={`w-3.5 h-3.5 ${t.accentText}`} />
                                Assistente de Posologia (Menus Suspensos de Instrução):
                              </span>
                              <span className="text-[10px] opacity-75 font-medium hidden sm:inline">
                                Selecione as opções nos menus para gerar o texto de Uso/Posologia
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
                              {/* 1. Condição / Momento */}
                              <div>
                                <label className={`block text-[10px] font-semibold ${t.headingText} mb-0.5`}>Condição (Evento/Momento):</label>
                                <select
                                  value={posologyState[idx]?.condition || ''}
                                  onChange={(e) => handleSelectPosologyDropdown(idx, 'condition', e.target.value)}
                                  className={`w-full ${t.inputBg} border ${t.cardBorder} rounded-lg px-2 py-1 text-[11px] font-medium focus:outline-none`}
                                >
                                  <option value="">-- Momento / Condição --</option>
                                  {CONDITION_MOMENTO_OPTIONS.map((opt, oIdx) => (
                                    <option key={oIdx} value={opt}>{opt}</option>
                                  ))}
                                </select>
                              </div>

                              {/* 2. Dose / Tomada */}
                              <div>
                                <label className={`block text-[10px] font-semibold ${t.headingText} mb-0.5`}>Dose / Tomada:</label>
                                <select
                                  value={posologyState[idx]?.dose || ''}
                                  onChange={(e) => handleSelectPosologyDropdown(idx, 'dose', e.target.value)}
                                  className={`w-full ${t.inputBg} border ${t.cardBorder} rounded-lg px-2 py-1 text-[11px] font-medium focus:outline-none`}
                                >
                                  <option value="">-- Dose / Tomada --</option>
                                  {DOSE_TOMADA_OPTIONS.map((opt, oIdx) => (
                                    <option key={oIdx} value={opt}>{opt}</option>
                                  ))}
                                </select>
                              </div>

                              {/* 3. Intervalo entre Doses */}
                              <div>
                                <label className={`block text-[10px] font-semibold ${t.headingText} mb-0.5`}>Intervalo entre Doses:</label>
                                <select
                                  value={posologyState[idx]?.interval || ''}
                                  onChange={(e) => handleSelectPosologyDropdown(idx, 'interval', e.target.value)}
                                  className={`w-full ${t.inputBg} border ${t.cardBorder} rounded-lg px-2 py-1 text-[11px] font-medium focus:outline-none`}
                                >
                                  <option value="">-- Intervalo entre Doses --</option>
                                  {INTERVALO_OPTIONS.map((opt, oIdx) => (
                                    <option key={oIdx} value={opt}>{opt}</option>
                                  ))}
                                </select>
                              </div>

                              {/* 4. Período / Tempo de Tratamento */}
                              <div>
                                <label className={`block text-[10px] font-semibold ${t.headingText} mb-0.5`}>Período / Tempo:</label>
                                <select
                                  value={posologyState[idx]?.duration || ''}
                                  onChange={(e) => handleSelectPosologyDropdown(idx, 'duration', e.target.value)}
                                  className={`w-full ${t.inputBg} border ${t.cardBorder} rounded-lg px-2 py-1 text-[11px] font-medium focus:outline-none`}
                                >
                                  <option value="">-- Tempo de Tratamento --</option>
                                  {DURACAO_OPTIONS.map((opt, oIdx) => (
                                    <option key={oIdx} value={opt}>{opt}</option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            {/* Quick Action Buttons for Posology */}
                            <div className={`flex flex-wrap items-center justify-between gap-2 pt-1 border-t ${t.cardBorder}`}>
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleAppendPosologyText(idx)}
                                  className={`px-2.5 py-1 ${t.btnSecondaryBg} border ${t.cardBorder} ${t.btnSecondaryText} text-[10.5px] font-bold rounded-lg flex items-center gap-1 transition cursor-pointer`}
                                  title="Anexar opções selecionadas ao texto da posologia"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>+ Anexar Texto</span>
                                </button>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleClearPosologyText(idx)}
                                className="text-[10.5px] font-semibold text-rose-500 hover:text-rose-700 transition cursor-pointer"
                              >
                                Limpar Posologia
                              </button>
                            </div>
                          </div>

                          {/* UNIFIED USAGE / POSOLOGY FIELD */}
                          <div className="space-y-1">
                            <label className={`block text-[11px] font-bold ${t.headingText} flex items-center justify-between`}>
                              <span>Uso / Posologia (Texto Impresso na Receita):</span>
                              <span className="text-[10px] opacity-60 font-normal">
                                Instruções completas
                              </span>
                            </label>
                            <textarea
                              rows={2.5}
                              value={med.instructions}
                              onChange={(e) => handleUpdateMedicationItem(idx, 'instructions', e.target.value)}
                              className={`w-full ${t.inputBg} border ${t.cardBorder} rounded-lg p-2.5 text-xs font-medium focus:outline-none`}
                              placeholder="Ex: Tomar 1 hora antes da refeição ou 2 horas após a refeição, no mesmo horário diariamente 1 comprimido de 500 mg 1 vez ao dia (de 24/24 horas) durante 3 dias consecutivos."
                            />
                          </div>
                        </div>
                      ))
                    )}

                    {/* Bottom Action bar */}
                    <div className={`flex flex-wrap items-center justify-between gap-2 pt-2 border-t ${t.cardBorder}`}>
                      <button
                        type="button"
                        onClick={handleAddCustomMedication}
                        className={`px-3.5 py-2 ${t.btnSecondaryBg} border ${t.cardBorder} ${t.btnSecondaryText} text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-2xs`}
                      >
                        <Plus className="w-4 h-4" />
                        <span>Adicionar Novo Medicamento na Receita</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSpecialPrescriptionText(buildFormattedPrescriptionText(specialPrescriptionItems));
                          setSavedMedicationIndex(999);
                          setTimeout(() => setSavedMedicationIndex(null), 2500);
                        }}
                        className={`px-4 py-2 ${t.btnPrimaryBg} ${t.btnPrimaryText} text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-xs`}
                      >
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>{savedMedicationIndex === 999 ? 'Todos Medicamentos Salvos!' : 'Salvar Todos Medicamentos na Receita'}</span>
                      </button>
                    </div>
                  </div>

                  {/* COMBINED PRINT TEXT PREVIEW & MANUAL OVERRIDE */}
                  <div className={`pt-2 border-t ${t.cardBorder} space-y-1.5`}>
                    <div className="flex items-center justify-between">
                      <label className={`block text-xs font-bold ${t.headingText}`}>
                        Texto Final Formatado (Impresso na Receita de Controle Especial):
                      </label>
                      <button
                        type="button"
                        onClick={() => setSpecialPrescriptionText(buildFormattedPrescriptionText(specialPrescriptionItems))}
                        className={`text-[11px] font-bold ${t.headingText} hover:underline flex items-center gap-1 cursor-pointer`}
                      >
                        <Sparkles className={`w-3 h-3 ${t.accentText}`} />
                        <span>Sincronizar com Itens</span>
                      </button>
                    </div>
                    <textarea
                      rows={4}
                      value={specialPrescriptionText}
                      onChange={(e) => setSpecialPrescriptionText(e.target.value)}
                      className={`w-full ${t.inputBg} border ${t.cardBorder} rounded-xl p-3 text-xs font-medium focus:outline-none`}
                      placeholder="Texto impresso na receita..."
                    />
                  </div>
                </div>
              )}

              {/* 3. PARÂMETROS ESPECÍFICOS: ATESTADOS (CID & AFASTAMENTO) */}
              {activeTemplate.category === 'atestado' && activeTemplate.id !== 'receituario_controle_especial' && !activeTemplate.id.includes('receituario') && (
                <div className={`${t.cardBg} p-4 rounded-2xl border ${t.cardBorder} space-y-3`}>
                  <span className={`text-xs font-bold ${t.headingText} uppercase tracking-wider flex items-center gap-1.5 border-b ${t.cardBorder} pb-2`}>
                    <Activity className={`w-4 h-4 ${t.accentText}`} />
                    3. Parâmetros do Atestado (Atendimento, CID e Dias de Afastamento)
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className={`block text-xs font-semibold ${t.headingText} mb-1`}>Tipo de Atendimento:</label>
                      <input
                        type="text"
                        list="atendimento-type-list"
                        value={atendimentoType}
                        onChange={(e) => setAtendimentoType(e.target.value)}
                        placeholder="Selecione no menu ou digite (ex: operatório)..."
                        className={`w-full ${t.inputBg} border ${t.cardBorder} rounded-xl px-3 py-2 text-xs font-bold focus:outline-none`}
                      />
                      <datalist id="atendimento-type-list">
                        <option value="operatório" />
                        <option value="consulta clínica" />
                        <option value="urgência / emergência" />
                        <option value="procedimento cirúrgico" />
                        <option value="avaliação preventiva" />
                      </datalist>
                    </div>

                    <div>
                      <label className={`block text-xs font-semibold ${t.headingText} mb-1`}>Detalhamento do Procedimento:</label>
                      <input
                        type="text"
                        placeholder="Ex: Exodontia de dente incluso #38"
                        value={procedureDetail}
                        onChange={(e) => setProcedureDetail(e.target.value)}
                        className={`w-full ${t.inputBg} border ${t.cardBorder} rounded-xl px-3 py-2 text-xs font-bold focus:outline-none`}
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className={`block text-xs font-semibold ${t.headingText}`}>
                          Código CID-10 Odontológico:
                        </label>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] opacity-70 font-mono hidden sm:inline">
                            {COMMON_DENTAL_CIDS.length} CIDs
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setIsManualCid(!isManualCid);
                              if (!isManualCid && !customCid) {
                                setCustomCid('K08.1');
                              }
                            }}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer active:scale-95 ${
                              isManualCid 
                                ? `${t.btnPrimaryBg} ${t.btnPrimaryText}` 
                                : `${t.btnSecondaryBg} ${t.btnSecondaryText} border ${t.cardBorder}`
                            }`}
                            title={isManualCid ? "Voltar à lista de CIDs" : "Digitar CID Manualmente"}
                          >
                            <Plus className="w-3.5 h-3.5" />
                            {isManualCid ? 'Usar Lista' : 'Adicionar CID Manual'}
                          </button>
                        </div>
                      </div>

                      {isManualCid ? (
                        <div className="bg-amber-50/80 p-3 rounded-2xl border border-amber-300 space-y-1.5 animate-fadeIn">
                          <div className="flex items-center justify-between">
                            <label className="block text-[11px] font-bold text-amber-900">
                              ➕ Código CID Digitado Manualmente:
                            </label>
                            <button
                              type="button"
                              onClick={() => setIsManualCid(false)}
                              className="text-amber-800 hover:text-amber-950 text-[10px] font-bold underline cursor-pointer"
                            >
                              Voltar para Busca
                            </button>
                          </div>
                          <input
                            type="text"
                            placeholder="Digite o código ou nome do CID (Ex: K04.0 / Perda Dentária)..."
                            value={customCid}
                            onChange={(e) => setCustomCid(e.target.value)}
                            className="w-full bg-white border border-amber-400 rounded-xl px-3 py-2 text-xs font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                          />
                        </div>
                      ) : (
                        <select
                          value={cidCode}
                          onChange={(e) => setCidCode(e.target.value)}
                          className={`w-full ${t.inputBg} border ${t.cardBorder} rounded-xl px-3 py-2 text-xs font-bold focus:outline-none`}
                        >
                          {COMMON_DENTAL_CIDS.map((c) => (
                            <option key={c.code} value={c.code}>
                              {c.label}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>

                    <div>
                      <label className={`block text-xs font-semibold ${t.headingText} mb-1`}>Dias de Afastamento das Atividades:</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          max="30"
                          value={afastamentoDias}
                          onChange={(e) => setAfastamentoDias(e.target.value)}
                          className={`w-24 ${t.inputBg} border ${t.cardBorder} rounded-xl px-3 py-2 text-xs font-bold focus:outline-none`}
                        />
                        <span className="text-xs font-bold opacity-80">dia(s) de afastamento</span>
                      </div>
                      <div className="flex gap-1.5 mt-2">
                        {['1', '2', '3', '5', '7', '14'].map((d) => (
                          <button
                            key={d}
                            type="button"
                            onClick={() => setAfastamentoDias(d)}
                            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition cursor-pointer ${
                              afastamentoDias === d ? `${t.btnPrimaryBg} ${t.btnPrimaryText} border-transparent` : `${t.btnSecondaryBg} ${t.btnSecondaryText} ${t.cardBorder}`
                            }`}
                          >
                            {d}d
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 4. PARÂMETROS ESPECÍFICOS: SOLICITAÇÃO DE EXAMES DE SANGUE */}
              {activeTemplate.id === 'solicitacao_sangue' && (
                <div className={`${t.cardBg} p-4 rounded-2xl border ${t.cardBorder} space-y-3`}>
                  <span className={`text-xs font-bold ${t.headingText} uppercase tracking-wider flex items-center gap-1.5 border-b ${t.cardBorder} pb-2`}>
                    <Activity className={`w-4 h-4 ${t.accentText}`} />
                    3. Exames de Sangue e Laboratoriais Solicitados
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {Object.entries(bloodExams).map(([key, val]) => (
                      <label key={key} className={`flex items-center gap-2 p-2 ${t.btnSecondaryBg} rounded-xl border ${t.cardBorder} cursor-pointer`}>
                        <input
                          type="checkbox"
                          checked={val}
                          onChange={(e) => setBloodExams(prev => ({ ...prev, [key]: e.target.checked }))}
                          className="w-4 h-4 rounded"
                        />
                        <span className={`text-xs font-semibold ${t.headingText} capitalize`}>
                          {key === 'ca153' ? 'CA 15-3' : key === 'hiv' ? 'HIV / HBSAg / Anti HCV' : key.replace(/([A-Z])/g, ' $1')}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* 4.1. PARÂMETROS ESPECÍFICOS: SOLICITAÇÃO DE TOMOGRAFIA CONE BEAM (CBCT) */}
              {activeTemplate.id === 'solicitacao_tomografia' && (
                <div className={`${t.cardBg} p-4 rounded-2xl border ${t.cardBorder} space-y-4`}>
                  <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b ${t.cardBorder} pb-2`}>
                    <span className={`text-xs font-bold ${t.headingText} uppercase tracking-wider flex items-center gap-1.5`}>
                      <FilePlus className={`w-4 h-4 ${t.accentText}`} />
                      3. Parâmetros da Solicitação de Tomografia Cone Beam (CBCT)
                    </span>
                    <span className="text-[10px] bg-amber-500/10 text-amber-800 font-bold px-2.5 py-0.5 rounded-full border border-amber-300/40">
                      Reconstrução 3D • FOV & Regiões
                    </span>
                  </div>

                  {/* A. REGIÕES ANATÔMICAS SOLICITADAS COM SELEÇÃO TOTAL E ATALHOS */}
                  <div className="space-y-2.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <label className={`block text-xs font-bold ${t.headingText}`}>
                        A. Regiões Anatômicas de Interesse (Selecione uma ou mais regiões):
                      </label>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <button
                          type="button"
                          onClick={handleSelectAllTomographyRegions}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white transition flex items-center gap-1 cursor-pointer shadow-2xs"
                          title="Marcar todas as regiões anatômicas possíveis"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Selecionar Todas as Regiões Possíveis
                        </button>
                        <button
                          type="button"
                          onClick={handleDeselectAllTomographyRegions}
                          className={`px-2 py-1 rounded-lg text-[11px] font-bold ${t.btnSecondaryBg} ${t.btnSecondaryText} border ${t.cardBorder} hover:bg-stone-200 transition cursor-pointer`}
                        >
                          Desmarcar Todas
                        </button>
                      </div>
                    </div>

                    {/* Atalhos Rápidos */}
                    <div className="flex flex-wrap gap-1 items-center p-2 bg-amber-500/5 rounded-xl border border-amber-300/40">
                      <span className="text-[10.5px] font-bold text-amber-950 mr-1">Atalhos Frequentes:</span>
                      <button
                        type="button"
                        onClick={handleSelectBothArches}
                        className={`text-[11px] px-2.5 py-0.5 rounded-md font-bold transition border cursor-pointer ${
                          tomographyRegions.maxilaTotal && tomographyRegions.mandibulaTotal
                            ? 'bg-amber-700 text-white border-amber-800 shadow-2xs'
                            : `${t.btnSecondaryBg} ${t.btnSecondaryText} border-stone-300`
                        }`}
                      >
                        Maxila + Mandíbula (Ambas)
                      </button>
                      <button
                        type="button"
                        onClick={handleSelectMaxilaOnly}
                        className={`text-[11px] px-2.5 py-0.5 rounded-md font-bold transition border cursor-pointer ${
                          tomographyRegions.maxilaTotal && !tomographyRegions.mandibulaTotal
                            ? 'bg-amber-700 text-white border-amber-800 shadow-2xs'
                            : `${t.btnSecondaryBg} ${t.btnSecondaryText} border-stone-300`
                        }`}
                      >
                        Apenas Maxila
                      </button>
                      <button
                        type="button"
                        onClick={handleSelectMandibulaOnly}
                        className={`text-[11px] px-2.5 py-0.5 rounded-md font-bold transition border cursor-pointer ${
                          !tomographyRegions.maxilaTotal && tomographyRegions.mandibulaTotal
                            ? 'bg-amber-700 text-white border-amber-800 shadow-2xs'
                            : `${t.btnSecondaryBg} ${t.btnSecondaryText} border-stone-300`
                        }`}
                      >
                        Apenas Mandíbula
                      </button>
                      <button
                        type="button"
                        onClick={handleSelectAtmsAndSinuses}
                        className={`text-[11px] px-2.5 py-0.5 rounded-md font-bold transition border cursor-pointer ${
                          tomographyRegions.atmBilateral && tomographyRegions.seiosMaxilares
                            ? 'bg-amber-700 text-white border-amber-800 shadow-2xs'
                            : `${t.btnSecondaryBg} ${t.btnSecondaryText} border-stone-300`
                        }`}
                      >
                        ATMs + Seios Maxilares
                      </button>
                    </div>

                    {/* Grid de Checkboxes de Regiões */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-1">
                      {Object.entries(TOMOGRAPHY_REGION_LABELS).map(([key, label]) => {
                        const isChecked = tomographyRegions[key as keyof typeof tomographyRegions];
                        return (
                          <label
                            key={key}
                            className={`flex items-center gap-2 p-2.5 rounded-xl border transition cursor-pointer ${
                              isChecked
                                ? 'bg-amber-500/15 border-amber-400/80 shadow-2xs'
                                : `${t.inputBg} ${t.cardBorder} hover:border-amber-300`
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => setTomographyRegions(prev => ({ ...prev, [key]: e.target.checked }))}
                              className="w-4 h-4 text-amber-600 rounded cursor-pointer"
                            />
                            <span className={`text-xs font-semibold ${isChecked ? 'text-amber-950 font-bold' : t.headingText}`}>
                              {label}
                            </span>
                          </label>
                        );
                      })}
                    </div>

                    {/* Especificação de Dentes Específicos se marcado */}
                    {tomographyRegions.regiaoDentes && (
                      <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-300/60 space-y-1 mt-2">
                        <label className="block text-xs font-bold text-amber-950">
                          Dentes ou Regiões Localizadas de Interesse (Ex: 18, 28, 38, 48 / Dente 11 e 21):
                        </label>
                        <input
                          type="text"
                          value={tomographyTeethInput}
                          onChange={(e) => setTomographyTeethInput(e.target.value)}
                          placeholder="Ex: 18, 28, 38, 48 (Terceiros Molares) ou Região do dente 21"
                          className={`w-full ${t.inputBg} border border-amber-300 rounded-xl px-3 py-2 text-xs font-bold text-amber-950 focus:outline-none`}
                        />
                      </div>
                    )}
                  </div>

                  {/* B. FINALIDADE CLÍNICA E INDICAÇÕES DO EXAME */}
                  <div className="space-y-2 pt-2 border-t border-stone-200">
                    <div className="flex items-center justify-between">
                      <label className={`block text-xs font-bold ${t.headingText}`}>
                        B. Finalidade Clínica / Indicações do Exame:
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const allTrue = Object.keys(tomographyIndications).reduce((acc, k) => ({ ...acc, [k]: true }), {});
                          setTomographyIndications(allTrue as any);
                        }}
                        className={`text-[11px] font-bold text-amber-800 hover:underline cursor-pointer`}
                      >
                        + Marcar Todas as Indicações
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {Object.entries(TOMOGRAPHY_INDICATION_LABELS).map(([key, label]) => {
                        const isChecked = tomographyIndications[key as keyof typeof tomographyIndications];
                        return (
                          <label
                            key={key}
                            className={`flex items-start gap-2 p-2 rounded-xl border transition cursor-pointer ${
                              isChecked
                                ? 'bg-amber-500/10 border-amber-400/60'
                                : `${t.inputBg} ${t.cardBorder}`
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => setTomographyIndications(prev => ({ ...prev, [key]: e.target.checked }))}
                              className="w-4 h-4 text-amber-600 rounded mt-0.5 cursor-pointer"
                            />
                            <span className={`text-[11.5px] leading-snug ${isChecked ? 'font-bold text-amber-950' : t.headingText}`}>
                              {label}
                            </span>
                          </label>
                        );
                      })}
                    </div>

                    <div>
                      <label className={`block text-[11px] font-semibold ${t.headingText} mb-1`}>
                        Outra Indicação Clínica / Justificativa Adicional:
                      </label>
                      <input
                        type="text"
                        value={tomographyCustomIndication}
                        onChange={(e) => setTomographyCustomIndication(e.target.value)}
                        placeholder="Ex: Avaliação de fratura no terço médio, fenestração óssea, etc..."
                        className={`w-full ${t.inputBg} border ${t.cardBorder} rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none`}
                      />
                    </div>
                  </div>

                  {/* C. ESPECIFICAÇÕES TÉCNICAS E FORMATO DE ENTREGA */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-stone-200">
                    <div>
                      <label className={`block text-xs font-bold ${t.headingText} mb-1.5`}>
                        C1. Campo de Visão Solicitado (FOV):
                      </label>
                      <select
                        value={tomographyFov}
                        onChange={(e) => setTomographyFov(e.target.value as any)}
                        className={`w-full ${t.inputBg} border ${t.cardBorder} rounded-xl p-2 text-xs font-bold ${t.headingText} focus:outline-none cursor-pointer`}
                      >
                        {Object.entries(TOMOGRAPHY_FOV_LABELS).map(([fovKey, fovLabel]) => (
                          <option key={fovKey} value={fovKey}>{fovLabel}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className={`block text-xs font-bold ${t.headingText} mb-1.5`}>
                        C2. Formato de Entrega e Exportação:
                      </label>
                      <div className="space-y-1.5">
                        {Object.entries(TOMOGRAPHY_DELIVERY_LABELS).map(([key, label]) => (
                          <label key={key} className="flex items-center gap-2 text-xs cursor-pointer">
                            <input
                              type="checkbox"
                              checked={tomographyDelivery[key as keyof typeof tomographyDelivery]}
                              onChange={(e) => setTomographyDelivery(prev => ({ ...prev, [key]: e.target.checked }))}
                              className="w-3.5 h-3.5 text-amber-600 rounded"
                            />
                            <span className={`text-[11px] font-semibold ${t.headingText}`}>{label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* D. OBSERVAÇÕES E NOTAS CLÍNICAS */}
                  <div className="space-y-1.5 pt-2 border-t border-stone-200">
                    <label className={`block text-xs font-bold ${t.headingText}`}>
                      D. Observações e Orientações Clínicas ao Centro de Radiologia:
                    </label>
                    <textarea
                      rows={2}
                      value={tomographyNotes}
                      onChange={(e) => setTomographyNotes(e.target.value)}
                      placeholder="Orientações específicas para o laudo e cortes..."
                      className={`w-full ${t.inputBg} border ${t.cardBorder} rounded-xl p-2.5 text-xs font-semibold focus:outline-none`}
                    />
                  </div>
                </div>
              )}

              {/* 5. PARÂMETROS ESPECÍFICOS: SOLICITAÇÃO DE PARECER */}
              {activeTemplate.id === 'solicitacao_parecer_especialista' && (
                <div className={`${t.cardBg} p-4 rounded-2xl border ${t.cardBorder} space-y-3`}>
                  <span className={`text-xs font-bold ${t.headingText} uppercase tracking-wider flex items-center gap-1.5 border-b ${t.cardBorder} pb-2`}>
                    <Stethoscope className={`w-4 h-4 ${t.accentText}`} />
                    3. Conteúdo da Solicitação de Parecer
                  </span>

                  <div className="space-y-3">
                    <div>
                      <label className={`block text-xs font-semibold ${t.headingText} mb-1`}>Especialidade Odontológica Destino:</label>
                      <select
                        value={specialistSpecialty}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSpecialistSpecialty(val);
                          setSpecialistRecipient(`Caro(a) colega especialista em ${val}`);
                        }}
                        className={`w-full ${t.inputBg} border ${t.cardBorder} rounded-xl px-3 py-2 text-xs font-bold focus:outline-none cursor-pointer`}
                      >
                        {DENTAL_SPECIALTIES.map(spec => (
                          <option key={spec} value={spec}>{spec}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className={`block text-xs font-semibold ${t.headingText} mb-1`}>Destinatário / Saudação:</label>
                      <input
                        type="text"
                        value={specialistRecipient}
                        onChange={(e) => setSpecialistRecipient(e.target.value)}
                        className={`w-full ${t.inputBg} border ${t.cardBorder} rounded-xl px-3 py-2 text-xs font-bold focus:outline-none`}
                      />
                    </div>

                    <div>
                      <label className={`block text-xs font-semibold ${t.headingText} mb-1`}>Descrição do Pedido / Quadro Clínico:</label>
                      <textarea
                        rows={3}
                        value={specialistRequestText}
                        onChange={(e) => setSpecialistRequestText(e.target.value)}
                        className={`w-full ${t.inputBg} border ${t.cardBorder} rounded-xl p-3 text-xs font-semibold focus:outline-none`}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 6. PARÂMETROS ESPECÍFICOS: JUSTIFICATIVA CLÍNICA */}
              {activeTemplate.id === 'justificativa_clinica' && (
                <div className={`${t.cardBg} p-4 rounded-2xl border ${t.cardBorder} space-y-3`}>
                  <span className={`text-xs font-bold ${t.headingText} uppercase tracking-wider flex items-center gap-1.5 border-b ${t.cardBorder} pb-2`}>
                    <CheckCircle2 className={`w-4 h-4 ${t.accentText}`} />
                    3. Parâmetros da Justificativa Clínica para Guia TUSS
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className={`block text-xs font-semibold ${t.headingText} mb-1`}>Código TUSS:</label>
                      <input
                        type="text"
                        value={tussCodeInput}
                        onChange={(e) => setTussCodeInput(e.target.value)}
                        className={`w-full ${t.inputBg} border ${t.cardBorder} rounded-xl px-3 py-2 text-xs font-bold`}
                      />
                    </div>

                    <div>
                      <label className={`block text-xs font-semibold ${t.headingText} mb-1`}>Descrição do Procedimento:</label>
                      <input
                        type="text"
                        value={tussDescInput}
                        onChange={(e) => setTussDescInput(e.target.value)}
                        className={`w-full ${t.inputBg} border ${t.cardBorder} rounded-xl px-3 py-2 text-xs font-bold`}
                      />
                    </div>

                    <div>
                      <label className={`block text-xs font-semibold ${t.headingText} mb-1`}>Dente / Região:</label>
                      <input
                        type="text"
                        value={toothInput}
                        onChange={(e) => setToothInput(e.target.value)}
                        className={`w-full ${t.inputBg} border ${t.cardBorder} rounded-xl px-3 py-2 text-xs font-bold`}
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className={`block text-xs font-semibold ${t.headingText} mb-1`}>Justificativa Clínica Detalhada:</label>
                      <textarea
                        rows={2}
                        value={clinicalJustificationText}
                        onChange={(e) => setClinicalJustificationText(e.target.value)}
                        className={`w-full ${t.inputBg} border ${t.cardBorder} rounded-xl p-3 text-xs font-semibold`}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 7. PARÂMETROS ESPECÍFICOS: PROTOCOLO DE ANESTESIA INTRA-ORAL (PAIO) */}
              {activeTemplate.id === 'relatorio_paio_pos_procedimento' && (
                <div className={`${t.cardBg} p-4 rounded-2xl border ${t.cardBorder} space-y-4`}>
                  <span className={`text-xs font-bold ${t.headingText} uppercase tracking-wider flex items-center justify-between border-b ${t.cardBorder} pb-2`}>
                    <span className="flex items-center gap-1.5">
                      <Stethoscope className={`w-4 h-4 ${t.accentText}`} />
                      3. Protocolo de Anestesia Intra-Oral (PAIO)
                    </span>
                    <span className="text-[10px] bg-amber-500/10 text-amber-700 font-bold px-2 py-0.5 rounded-full border border-amber-300/40">
                      Opcional • Limite Máx: 12 Tubetes
                    </span>
                  </span>

                  {/* Toggle Ativo / Inativo */}
                  <div className="flex items-center justify-between p-3 bg-amber-500/10 rounded-xl border border-amber-300/60">
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-amber-950 block">Status do Protocolo Anestésico:</span>
                      <span className="text-[11px] text-amber-900/80">
                        {isPaioActive 
                          ? 'Protocolo ATIVO — Preencha a anestesia tópica e os tubetes consumidos.' 
                          : 'Protocolo INATIVO — Nenhum anestésico local ou tubete será registrado no relatório.'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsPaioActive(!isPaioActive)}
                      className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                        isPaioActive
                          ? 'bg-emerald-700 text-white shadow-xs hover:bg-emerald-800'
                          : 'bg-stone-300 text-stone-700 hover:bg-stone-400'
                      }`}
                    >
                      {isPaioActive ? 'Ativo' : 'Inativo (Opcional)'}
                    </button>
                  </div>

                  {isPaioActive ? (
                    <>
                      {/* Anestesia Tópica - Checkboxes */}
                      <div className="space-y-1.5">
                        <label className={`block text-xs font-bold ${t.headingText}`}>
                          A. Anestesia Tópica Aplicada (Selecione uma ou mais opções):
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {Object.entries(topicalAnesthetics).map(([topicalName, isChecked]) => (
                            <label key={topicalName} className={`flex items-center gap-2 p-2.5 ${t.inputBg} rounded-xl border ${t.cardBorder} cursor-pointer hover:border-amber-400 transition`}>
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => setTopicalAnesthetics(prev => ({ ...prev, [topicalName]: e.target.checked }))}
                                className="w-4 h-4 text-amber-600 rounded"
                              />
                              <span className="text-xs font-semibold text-stone-800">{topicalName}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* B. Locais de Anestesia (Múltiplos Locais com Adição) */}
                      <div className="space-y-2 pt-2 border-t border-stone-200">
                        <div className="flex items-center justify-between">
                          <label className={`block text-xs font-bold ${t.headingText}`}>
                            B. Locais da Anestesia (Adicione um ou mais locais de aplicação):
                          </label>
                          <span className="text-[10px] text-amber-800 font-bold bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
                            {paioAnesthesiaSites.length} local(ais)
                          </span>
                        </div>

                        {/* List of active sites */}
                        <div className="flex flex-wrap gap-1.5 min-h-[36px] p-2 bg-amber-500/5 rounded-xl border border-amber-300/40 items-center">
                          {paioAnesthesiaSites.length === 0 ? (
                            <span className="text-xs text-stone-400 italic">Nenhum local selecionado. Escolha nos atalhos ou digite abaixo.</span>
                          ) : (
                            paioAnesthesiaSites.map((site, sIdx) => (
                              <span
                                key={sIdx}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-100 text-amber-950 font-bold text-xs border border-amber-300 shadow-2xs"
                              >
                                <span>📍 {site}</span>
                                <button
                                  type="button"
                                  onClick={() => setPaioAnesthesiaSites(prev => prev.filter((_, i) => i !== sIdx))}
                                  className="text-amber-800 hover:text-red-700 font-extrabold ml-1 cursor-pointer text-sm"
                                  title="Remover este local"
                                >
                                  ×
                                </button>
                              </span>
                            ))
                          )}
                        </div>

                        {/* Preset quick buttons */}
                        <div className="space-y-1">
                          <span className="text-[10.5px] font-bold text-stone-600 block">Atalhos de Locais Frequentes (Clique para adicionar/remover):</span>
                          <div className="flex flex-wrap gap-1">
                            {[
                              'Nervo Alveolar Inferior (Esq.)',
                              'Nervo Alveolar Inferior (Dir.)',
                              'Nervo Lingual',
                              'Nervo Bucal',
                              'Nervo Mentoniano / Incisivo',
                              'Nervo Infraorbitário',
                              'Nervo Alveolar Sup. Posterior',
                              'Nervo Alveolar Sup. Médio',
                              'Nervo Alveolar Sup. Anterior',
                              'Nervo Nasopalatino',
                              'Nervo Palatino Maior',
                              'Infiltrativa Periapical (Ves.)',
                              'Infiltrativa Palatina / Lingual',
                              'Intraligamentar',
                              'Intrapulpar',
                              'Interdental / Papilar'
                            ].map((presetSite) => {
                              const isAdded = paioAnesthesiaSites.includes(presetSite);
                              return (
                                <button
                                  key={presetSite}
                                  type="button"
                                  onClick={() => {
                                    if (isAdded) {
                                      setPaioAnesthesiaSites(prev => prev.filter(s => s !== presetSite));
                                    } else {
                                      setPaioAnesthesiaSites(prev => [...prev, presetSite]);
                                    }
                                  }}
                                  className={`text-[10.5px] px-2 py-0.5 rounded-md border font-medium transition cursor-pointer ${
                                    isAdded
                                      ? 'bg-amber-700 text-white border-amber-800 font-bold shadow-2xs'
                                      : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                                  }`}
                                >
                                  {isAdded ? '✓ ' : '+ '}{presetSite}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Input for custom site */}
                        <div className="flex gap-2 pt-1">
                          <input
                            type="text"
                            placeholder="Digite outro local de anestesia personalizado..."
                            value={paioCustomSiteInput}
                            onChange={(e) => setPaioCustomSiteInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                if (paioCustomSiteInput.trim()) {
                                  setPaioAnesthesiaSites(prev => [...prev, paioCustomSiteInput.trim()]);
                                  setPaioCustomSiteInput('');
                                }
                              }
                            }}
                            className={`flex-1 ${t.inputBg} border ${t.cardBorder} rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none`}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (paioCustomSiteInput.trim()) {
                                setPaioAnesthesiaSites(prev => [...prev, paioCustomSiteInput.trim()]);
                                setPaioCustomSiteInput('');
                              }
                            }}
                            className="px-3.5 py-1.5 bg-amber-700 text-white font-bold text-xs rounded-xl hover:bg-amber-800 transition cursor-pointer shadow-xs"
                          >
                            + Adicionar Local
                          </button>
                        </div>
                      </div>

                      {/* C. Anestésicos Injetáveis - Volume Geral Consumido */}
                      <div className="space-y-2 pt-2 border-t border-stone-200">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <div>
                            <label className={`block text-xs font-bold ${t.headingText}`}>
                              C. Volume Geral de Anestésico Injetado (Consumo Total no Procedimento):
                            </label>
                            <span className="text-[10.5px] text-amber-900 font-medium block">
                              ℹ️ Este é o <strong>volume geral total em tubetes</strong> usado no atendimento (não é dividido por local).
                            </span>
                          </div>
                          {(() => {
                            const total = (Object.values(injectableTubetes) as number[]).reduce((a: number, b: number) => a + Number(b || 0), 0);
                            return (
                              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border shrink-0 ${
                                total > 12 ? 'bg-red-100 text-red-800 border-red-300' : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              }`}>
                                Total Geral: {total} Tubete(s) ({ (total * 1.8).toFixed(1) } mL)
                              </span>
                            );
                          })()}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {Object.entries(injectableTubetes).map(([anestName, count]) => (
                            <div key={anestName} className={`p-2.5 ${t.inputBg} rounded-xl border ${t.cardBorder} flex items-center justify-between gap-2`}>
                              <span className="text-[11px] font-bold text-stone-800 leading-tight flex-1">
                                {anestName}
                              </span>
                              <div className="flex items-center gap-1 shrink-0">
                                <input
                                  type="number"
                                  min="0"
                                  max="12"
                                  value={count}
                                  onChange={(e) => {
                                    const val = Math.min(12, Math.max(0, parseInt(e.target.value) || 0));
                                    setInjectableTubetes(prev => ({ ...prev, [anestName]: val }));
                                  }}
                                  className="w-16 p-1.5 bg-white border border-stone-300 rounded-lg text-center font-bold text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                                />
                                <span className="text-[10px] font-bold text-stone-500">tub.</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="p-3 bg-stone-100/80 rounded-xl border border-stone-200 text-center text-xs text-stone-600 font-medium">
                      ℹ️ O Protocolo de Anestesia Intra-Oral está inativo para este procedimento. O relatório final registrará a ausência de anestésico local.
                    </div>
                  )}

                  {/* Atendimento Operatório & Sinais Vitais */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-stone-200">
                    <div className="sm:col-span-2 bg-amber-500/10 p-3 rounded-xl border border-amber-300/60 space-y-1">
                      <label className={`block text-xs font-bold text-amber-950`}>
                        Carregar Protocolo Cadastrado (Sincronização Módulo 4 - Orientações ao Paciente):
                      </label>
                      <select
                        onChange={(e) => {
                          const proc = tussProcedures.find(p => p.code === e.target.value);
                          if (proc) {
                            setPaioProcedure(proc.description);
                            if (proc.patientInstructions) {
                              setPaioPostOpInstructions(proc.patientInstructions);
                            }
                          }
                        }}
                        className={`w-full ${t.inputBg} border border-amber-300 rounded-xl p-2 text-xs font-bold text-amber-950 focus:outline-none`}
                      >
                        <option value="">-- Selecione o procedimento para carregar Orientações Pós-Operatórias --</option>
                        {tussProcedures.map(p => (
                          <option key={p.code} value={p.code}>
                            {p.description} ({p.specialty})
                          </option>
                        ))}
                      </select>
                      <p className="text-[10.5px] text-amber-800/80 italic">
                        Ao selecionar um procedimento, a descrição e o Módulo 4 (Orientações ao Paciente) do protocolo correspondente serão importados automaticamente.
                      </p>
                    </div>

                    <div>
                      <label className={`block text-xs font-semibold ${t.headingText} mb-1`}>Procedimento Realizado:</label>
                      <input
                        type="text"
                        value={paioProcedure}
                        onChange={(e) => setPaioProcedure(e.target.value)}
                        className={`w-full ${t.inputBg} border ${t.cardBorder} rounded-xl px-3 py-2 text-xs font-bold`}
                      />
                    </div>

                    <div>
                      <label className={`block text-xs font-semibold ${t.headingText} mb-1`}>Dentes / Região Operada:</label>
                      <input
                        type="text"
                        value={paioToothRegion}
                        onChange={(e) => setPaioToothRegion(e.target.value)}
                        className={`w-full ${t.inputBg} border ${t.cardBorder} rounded-xl px-3 py-2 text-xs font-bold`}
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className={`block text-xs font-semibold ${t.headingText} mb-1`}>Técnica Anestésica Aplicada:</label>
                      <input
                        type="text"
                        value={paioTechnique}
                        onChange={(e) => setPaioTechnique(e.target.value)}
                        className={`w-full ${t.inputBg} border ${t.cardBorder} rounded-xl px-3 py-2 text-xs font-bold`}
                      />
                    </div>

                    <div>
                      <label className={`block text-xs font-semibold ${t.headingText} mb-1`}>Pressão Arterial (PA):</label>
                      <input
                        type="text"
                        value={paioBloodPressure}
                        onChange={(e) => setPaioBloodPressure(e.target.value)}
                        className={`w-full ${t.inputBg} border ${t.cardBorder} rounded-xl px-3 py-2 text-xs font-bold`}
                      />
                    </div>

                    <div>
                      <label className={`block text-xs font-semibold ${t.headingText} mb-1`}>Frequência Cardíaca (FC):</label>
                      <input
                        type="text"
                        value={paioHeartRate}
                        onChange={(e) => setPaioHeartRate(e.target.value)}
                        className={`w-full ${t.inputBg} border ${t.cardBorder} rounded-xl px-3 py-2 text-xs font-bold`}
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className={`block text-xs font-semibold ${t.headingText} mb-1`}>Intercorrências / Descrição Operatória:</label>
                      <textarea
                        rows={2}
                        value={paioComplications}
                        onChange={(e) => setPaioComplications(e.target.value)}
                        className={`w-full ${t.inputBg} border ${t.cardBorder} rounded-xl p-2.5 text-xs font-semibold`}
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className={`block text-xs font-semibold ${t.headingText} mb-1`}>Instruções e Orientações Pós-Operatórias:</label>
                      <textarea
                        rows={2}
                        value={paioPostOpInstructions}
                        onChange={(e) => setPaioPostOpInstructions(e.target.value)}
                        className={`w-full ${t.inputBg} border ${t.cardBorder} rounded-xl p-2.5 text-xs font-semibold`}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className={`p-4 ${t.cardBg} border-t ${t.cardBorder} flex items-center justify-between gap-3 shrink-0`}>
              <button
                type="button"
                onClick={() => setActiveTemplate(null)}
                className={`px-4 py-2.5 ${t.btnSecondaryBg} ${t.btnSecondaryText} border ${t.cardBorder} font-bold text-xs rounded-2xl transition cursor-pointer`}
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleGenerateDocument}
                className={`px-6 py-2.5 ${t.btnPrimaryBg} ${t.btnPrimaryText} font-bold text-xs rounded-2xl shadow-sm transition flex items-center gap-2 cursor-pointer active:scale-95`}
              >
                <Sparkles className="w-4 h-4" />
                Gerar e Visualizar Documento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RENDERED A4 DOCUMENT PREVIEW MODAL */}
      {isRenderModalOpen && activeTemplate && (
        <div className="fixed inset-0 z-50 bg-[#2c2c2c]/70 backdrop-blur-xs flex items-center justify-center p-2 md:p-6 overflow-y-auto print:p-0 print:static print:bg-white print:block">
          <div className="bg-white border-2 border-[#e5e5d1] rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden my-auto animate-fadeIn max-h-[96vh] flex flex-col print:max-h-none print:shadow-none print:border-none print:w-full print:rounded-none">
            {/* Control Bar Top */}
            <div className="bg-[#2c3e2e] text-white p-4 flex flex-wrap items-center justify-between gap-3 shrink-0 print:hidden">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span className="font-bold text-xs md:text-sm">
                  Documento Pronto: {activeTemplate.title}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    let summaryText = '';
                    if (activeTemplate.id === 'receituario_controle_especial' || activeTemplate.title.toLowerCase().includes('controle especial')) {
                      summaryText = specialPrescriptionText;
                    } else if (activeTemplate.category === 'atestado') {
                      summaryText = `Atesto, para os devidos fins, que ${patientDisplayName}, submeteu-se a atendimento odontológico ${atendimentoType} ${procedureDetail ? `(${procedureDetail})` : ''}, CID: ${isManualCid ? customCid : cidCode}, no dia ${formattedFormattedDate} às ${docTime}, período ${periodoStr}, devendo se afastar de suas atividades pelo período de ${afastamentoDias} dia(s) por estar sob meus cuidados e responsabilidade neste período.`;
                    } else if (activeTemplate.id === 'declaracao_comparecimento') {
                      summaryText = `Declaro, para os devidos fins de direito, que o(a) Sr(a). ${patientDisplayName} esteve presente neste consultório odontológico no dia ${formattedFormattedDate}, durante o período de ${docTime} (${periodoStr}), submetendo-se a tratamento e acompanhamento clínico odontológico.`;
                    } else if (activeTemplate.id === 'tcle_endodontia') {
                      summaryText = `Pelo presente instrumento, eu ${patientDisplayName} declaro que fui suficientemente esclarecido(a) pelo cirurgião-dentista sobre a necessidade de tratamento endodôntico (canal). Estou ciente de que existe índice de insucesso de 5 a 10% nos tratamentos endodônticos.`;
                    } else if (activeTemplate.id === 'solicitacao_sangue') {
                      const selectedExams = Object.entries(bloodExams).filter(([_, v]) => v).map(([k]) => k).join(', ');
                      summaryText = `Solicito para o(a) paciente ${patientDisplayName} a realização dos exames de sangue pré-operatórios odontológicos: ${selectedExams || 'Hemograma completo, Coagulograma, Glicemia em jejum'}.`;
                    } else if (activeTemplate.id === 'solicitacao_tomografia') {
                      summaryText = buildFormattedTomographySummary();
                    } else {
                      summaryText = activeTemplate.description || 'Documento emitido e registrado no sistema odontológico para fins de prontuário e acompanhamento clínico.';
                    }

                    handlePrintSystemWindow({
                      id: activeTemplate.id,
                      title: activeTemplate.title,
                      patientName: patientDisplayName,
                      professionalName: activeProfessional?.name || clinicInfo.dentistName,
                      formattedDateStr: formattedFormattedDate,
                      summary: summaryText
                    });
                  }}
                  className="px-3.5 py-2 bg-[#d4a373] hover:bg-[#c29363] text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  Imprimir
                </button>

                <a
                  href={getWhatsAppTargetUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 bg-[#25d366] hover:bg-[#20bd5a] text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                  title="Enviar documento completo via WhatsApp"
                >
                  <Send className="w-4 h-4" />
                  Enviar no WhatsApp
                </a>

                <button
                  type="button"
                  onClick={() => setIsRenderModalOpen(false)}
                  className="p-2 text-white/70 hover:text-white rounded-xl hover:bg-white/10 transition cursor-pointer"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Document Printable Sheet A4 Format */}
            <div className="p-3 md:p-6 bg-stone-100 overflow-y-auto flex-1 flex justify-center print:p-0 print:bg-white">
              <div className="w-full max-w-[760px] bg-white border border-stone-300 shadow-xl rounded-xl p-5 md:p-7 space-y-3 font-sans text-[#2c2c2c] min-h-[800px] flex flex-col justify-between relative print:shadow-none print:border-none print:w-full overflow-hidden print:overflow-visible print:p-0 box-border">
                
                {/* Background Watermark (Marca d'Água) */}
                {(clinicInfo.showWatermark ?? true) && (clinicInfo.watermarkUrl || clinicInfo.logoUrl) && (
                  <div
                    className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0"
                    style={{ opacity: (clinicInfo.watermarkOpacity ?? 15) / 100 }}
                  >
                    <img src={clinicInfo.watermarkUrl || clinicInfo.logoUrl} alt="Marca d'água" className="w-80 h-80 object-contain filter grayscale opacity-80" />
                  </div>
                )}

                {/* 1. Header - Hidden for Receituário de Controle Especial */}
                {activeTemplate.id !== 'receituario_controle_especial' && (
                  <div className="border-b-2 border-stone-800 pb-3 flex items-start justify-between gap-4 relative z-10">
                    <div className="flex items-center gap-3">
                      {clinicInfo.logoUrl ? (
                        <img src={clinicInfo.logoUrl} alt="Logo" className="w-14 h-14 object-contain" />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-[#5a5a40] text-white flex items-center justify-center font-bold text-lg shrink-0">
                          P
                        </div>
                      )}
                      <div>
                        <p className="text-xs font-bold text-[#5a5a40]">
                          {effectiveDentistName}
                        </p>
                        <p className="text-[10px] text-stone-600 font-mono">
                          Cirurgião-Dentista {effectiveDentistCro} {effectiveDentistSpecialty ? `• ${effectiveDentistSpecialty}` : ''}
                        </p>
                        {clinicInfo.epao && (
                          <p className="text-[9.5px] text-stone-500 font-mono">EPAO: {clinicInfo.epao}</p>
                        )}
                        {clinicInfo.cnpj && (
                          <p className="text-[9.5px] text-stone-500">CNPJ: {formatCNPJ(clinicInfo.cnpj)}</p>
                        )}
                      </div>
                    </div>

                    <div className="text-right space-y-0.5 max-w-[280px]">
                      <p className="text-sm font-bold uppercase tracking-wider text-stone-900 leading-tight">
                        {effectiveClinicName || clinicInfo.name || 'DentisPro'}
                      </p>
                      <p className="text-[10px] text-stone-600 font-semibold">{effectiveClinicAddress}</p>
                      <p className="text-[10px] text-stone-600">
                        {formatCityOnly(effectiveClinicCity)} - CE • CEP: {formatCEP(clinicInfo.cep || '60.160-110')}
                      </p>
                      <p className="text-[10px] text-stone-600 font-medium">Tel: {effectiveClinicPhone}</p>
                    </div>
                  </div>
                )}

                {/* 2. Document Title - Hidden for Receituário de Controle Especial */}
                {activeTemplate.id !== 'receituario_controle_especial' && (
                  <div className="text-center space-y-1 relative z-10 pt-1">
                    <h2 className="text-xl font-bold tracking-wider text-stone-900 uppercase">
                      {activeTemplate.id === 'solicitacao_tomografia' 
                        ? 'SOLICITAÇÃO DE TOMOGRAFIA CONE BEAM (CBCT)' 
                        : activeTemplate.title.toUpperCase().split(' (')[0]}
                    </h2>
                    {activeTemplate.subtitle && (
                      <p className="text-[11px] font-semibold text-stone-500 uppercase tracking-wide">
                        {activeTemplate.subtitle}
                      </p>
                    )}
                  </div>
                )}

                {/* 3. Document Body Content (Template Dependent) */}
                <div className="space-y-5 text-sm text-stone-800 leading-relaxed min-h-[280px] relative z-10">
                  
                  {/* MODEL 0: RECEITUÁRIO DE CONTROLE ESPECIAL (2 VIAS CONFORME UPLOAD) */}
                  {activeTemplate.id === 'receituario_controle_especial' && (
                    <div className="space-y-4 font-sans text-[#1a1a1a]">
                      {/* TOP BAR / EMITENTE E ASSINATURA: DOIS RETÂNGULOS IGUAIS */}
                      <div className="grid grid-cols-2 gap-3">
                        {/* RETÂNGULO 1: IDENTIFICAÇÃO DO EMITENTE */}
                        <div className="border-2 border-stone-800 rounded-lg p-3 space-y-1.5 text-xs bg-white flex flex-col justify-between min-h-[160px] box-border">
                          <p className="font-bold text-xs uppercase tracking-wider border-b border-stone-300 pb-1 text-[#2c3e2e]">
                            IDENTIFICAÇÃO DO EMITENTE
                          </p>
                          <div className="space-y-0.5">
                            <p className="font-bold text-xs text-stone-900">
                              {effectiveDentistName} • {effectiveDentistCro}
                            </p>
                            <p className="text-[11px] text-stone-700 font-semibold">
                              Telefones: {effectiveClinicPhone}
                            </p>
                          </div>
                          <div className="pt-1.5 border-t border-stone-200 mt-1 space-y-0.5">
                            {effectiveClinicName && (
                              <p className="font-bold text-[11.5px] text-stone-900 uppercase tracking-tight">
                                {effectiveClinicName}
                              </p>
                            )}
                            <p className="text-[10.5px] text-stone-600">{effectiveClinicAddress}</p>
                            <p className="text-[10.5px] text-stone-600">
                              {formatCityOnly(effectiveClinicCity)} - CE • CEP: {formatCEP(clinicInfo.cep || '60.160-110')}
                            </p>
                          </div>
                        </div>

                        {/* RETÂNGULO 2: ASSINATURA DO EMITENTE & CONTROLE DE VIAS */}
                        <div className="border-2 border-stone-800 rounded-lg p-3 space-y-1.5 text-xs bg-white flex flex-col justify-between min-h-[160px] box-border">
                          <div className="flex items-center justify-between border-b border-stone-300 pb-1">
                            <span className="font-bold text-xs uppercase tracking-wider text-[#2c3e2e]">
                              ASSINATURA DO EMITENTE
                            </span>
                            <div className="flex items-center gap-1 font-bold">
                              <span className="px-1.5 py-0.5 bg-stone-100 rounded border border-stone-300 text-[8.5px] text-stone-900">1ª Via Farmácia</span>
                              <span className="px-1.5 py-0.5 bg-stone-50 rounded border border-stone-200 text-stone-600 text-[8.5px]">2ª Via Paciente</span>
                            </div>
                          </div>

                          {/* Assinatura e Carimbo do Dentista Emitente (Assinatura em cima, Carimbo embaixo) */}
                          <div className="flex flex-col items-center justify-center my-1 space-y-1 w-full flex-1">
                            {/* Assinatura Manual (Em cima) */}
                            {(clinicInfo.showSignatureImage ?? true) && (
                              <div className="flex items-center justify-center -rotate-1 h-8">
                                {clinicInfo.signatureImageUrl ? (
                                  <img
                                    src={clinicInfo.signatureImageUrl}
                                    alt="Assinatura"
                                    className="h-8 max-w-[130px] object-contain filter contrast-125"
                                  />
                                ) : (
                                  <div className="relative h-8 w-28 flex items-center justify-center">
                                    <svg className="w-full h-full text-indigo-950 opacity-90" viewBox="0 0 240 60" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M 10 35 C 30 10, 45 50, 60 25 C 70 10, 80 40, 95 30 C 110 20, 115 45, 130 25 C 145 10, 160 50, 180 20 C 195 10, 210 35, 230 30" />
                                      <path d="M 30 45 C 70 48, 120 40, 200 42" strokeWidth="1.8" />
                                    </svg>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Carimbo Profissional (Embaixo) */}
                            {(clinicInfo.showStampImage ?? true) && (
                              <div className="flex items-center justify-center -rotate-2">
                                {clinicInfo.stampImageUrl ? (
                                  <img
                                    src={clinicInfo.stampImageUrl}
                                    alt="Carimbo"
                                    className="h-8 max-w-[110px] object-contain border border-stone-400 rounded bg-white/95 p-0.5"
                                  />
                                ) : (
                                  <div className="border border-dashed border-stone-600 rounded px-2 py-0.5 bg-amber-50/90 text-center uppercase text-[7.5px] leading-tight">
                                    <span className="font-bold block text-stone-900">{activeProfessional?.name || clinicInfo.dentistName}</span>
                                    <span className="block text-[7px] font-mono text-stone-700">{activeProfessional?.cro || clinicInfo.cro} • Cirurgião-Dentista</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="w-full border-t border-stone-400 pt-0.5 text-center">
                            <p className="text-[9.5px] font-bold text-stone-900 leading-tight">
                              {activeProfessional?.name || clinicInfo.dentistName}
                            </p>
                            <p className="text-[8px] text-stone-600 font-mono leading-tight">
                              {activeProfessional?.cro || clinicInfo.cro} • Cirurgião-Dentista
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* PATIENT & PRESCRIPTION */}
                      <div className="space-y-3 bg-stone-50/70 p-4 rounded-lg border border-stone-300">
                        <p className="text-sm">
                          <strong>Paciente:</strong> <span className="font-bold underline text-stone-900">{patientDisplayName}</span>
                        </p>

                        <div className="space-y-1">
                          <p className="text-xs font-bold uppercase tracking-wide text-stone-800">Prescrição</p>
                          <p className="text-xs font-semibold italic text-stone-600">Uso interno(via oral)</p>
                          <div className="bg-white p-3 rounded border border-stone-300 text-xs font-medium leading-relaxed whitespace-pre-line text-stone-900">
                            • {specialPrescriptionText}
                          </div>
                        </div>

                        {/* Cidade alinhada à direita sem dado UF */}
                        <div className="text-right text-xs font-semibold text-stone-700 pt-2">
                          {formatCityOnly(clinicInfo.city)}, {formattedFormattedDate}
                        </div>
                      </div>

                      {/* BOTTOM GRID: COMPRADOR & FORNECEDOR */}
                      <div className="grid grid-cols-2 gap-3 pt-1">
                        {/* IDENTIFICAÇÃO DO COMPRADOR */}
                        <div className="border-2 border-stone-800 rounded-lg p-3 text-[11px] space-y-1.5 bg-white min-h-[140px] flex flex-col justify-between box-border">
                          <p className="font-bold uppercase tracking-wider text-xs border-b border-stone-300 pb-1 text-stone-900">
                            IDENTIFICAÇÃO DO COMPRADOR
                          </p>
                          <div className="space-y-1">
                            <p><strong>Nome:</strong> ___________________________________</p>
                            <p><strong>Ident Órg. Emissor:</strong> ________________________</p>
                            <p><strong>End:</strong> ____________________________________</p>
                            <p><strong>Telefone:</strong> ________________________________</p>
                            <p><strong>Cidade:</strong> ______________________ <strong>UF:</strong> _____</p>
                          </div>
                        </div>

                        {/* IDENTIFICAÇÃO DO FORNECEDOR */}
                        <div className="border-2 border-stone-800 rounded-lg p-3 text-[11px] space-y-3 flex flex-col justify-between bg-white min-h-[140px] box-border">
                          <div>
                            <p className="font-bold uppercase tracking-wider text-xs border-b border-stone-300 pb-1 text-stone-900">
                              IDENTIFICAÇÃO DO FORNECEDOR
                            </p>
                          </div>
                          <div className="space-y-2 text-center pt-2">
                            <div className="border-t border-stone-400 pt-1 text-[10px] font-semibold text-stone-700">
                              Assinatura / Carimbo Farmacêutico
                            </div>
                            <p className="text-[11px]"><strong>Data:</strong> ____ / ____ / ________</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* MODEL 1: ATESTADO ODONTOLÓGICO */}
                  {activeTemplate.category === 'atestado' && activeTemplate.id !== 'receituario_controle_especial' && (
                    <div className="space-y-6 pt-4 text-justify">
                      <p className="text-base leading-loose">
                        Atesto, para os devidos fins, que <strong className="font-bold underline">{patientDisplayName}</strong>, submeteu-se a atendimento odontológico <strong className="font-semibold">{atendimentoType}</strong> {procedureDetail ? `(${procedureDetail})` : ''}, CID: <strong className="font-mono font-bold">{isManualCid ? customCid : cidCode}</strong>, no dia <strong className="font-bold">{formattedFormattedDate}</strong> às <strong className="font-bold">{docTime}</strong>, período <strong className="font-bold">{periodoStr}</strong>, devendo se afastar de suas atividades pelo período de <strong className="font-bold text-base underline">{afastamentoDias} dia(s)</strong> por estar sob meus cuidados e responsabilidade neste período.
                      </p>
                    </div>
                  )}

                  {/* MODEL 2: DECLARAÇÃO DE COMPARECIMENTO */}
                  {activeTemplate.id === 'declaracao_comparecimento' && (
                    <div className="space-y-6 pt-4 text-justify">
                      <p className="text-base leading-loose">
                        Declaro, para os devidos fins de direito, que o(a) Sr(a). <strong className="font-bold underline">{patientDisplayName}</strong> esteve presente neste consultório odontológico no dia <strong className="font-bold">{formattedFormattedDate}</strong>, durante o período de <strong className="font-bold">{docTime}</strong> ({periodoStr}), submetendo-se a tratamento e acompanhamento clínico odontológico.
                      </p>
                    </div>
                  )}

                  {/* MODEL 3: TCLE ENDODONTIA */}
                  {activeTemplate.id === 'tcle_endodontia' && (
                    <div className="space-y-4 text-xs text-justify">
                      <p className="font-bold text-center text-sm uppercase">TERMO DE CONSENTIMENTO LIVRE E ESCLARECIDO PARA ENDODONTIA</p>
                      <p>
                        Pelo presente instrumento, eu <strong className="underline">{patientDisplayName}</strong> declaro que fui suficientemente esclarecido(a) pelo cirurgião-dentista sobre a necessidade de tratamento endodôntico (canal).
                      </p>
                      <ul className="list-disc pl-5 space-y-1 text-[11px] text-stone-700">
                        <li>Estou ciente de que existe índice de insucesso de 5 a 10% nos tratamentos endodônticos.</li>
                        <li>Se ocorrer fratura de instrumentos no canal radicular, o dentista avaliará a melhor conduta cirúrgica.</li>
                        <li>O dente tratado de canal é desidratado e mais propenso a fraturas, necessitando de reabilitação posterior.</li>
                      </ul>
                    </div>
                  )}

                  {/* MODEL 4: SOLICITAÇÃO DE EXAMES DE SANGUE */}
                  {activeTemplate.id === 'solicitacao_sangue' && (
                    <div className="space-y-4">
                      <div className="border-b border-stone-200 pb-2">
                        <p className="font-bold">Para o(a) Sr(a).: {patientDisplayName}</p>
                        <p className="text-xs text-stone-600">Idade: {patientAge} • Dados clínicos: Pré-operatório Odontológico</p>
                      </div>

                      <p className="font-bold uppercase text-xs">Solicito a realização dos seguintes exames:</p>

                      <div className="grid grid-cols-2 gap-2 text-xs font-semibold pl-4">
                        {bloodExams.hemograma && <p>1. Hemograma Completo;</p>}
                        {bloodExams.coagulograma && <p>2. Coagulograma;</p>}
                        {bloodExams.vitaminaD && <p>3. Vitamina D;</p>}
                        {bloodExams.creatinina && <p>4. Creatinina;</p>}
                        {bloodExams.glicemiaJejum && <p>5. Glicemia em Jejum;</p>}
                        {bloodExams.calcioIonico && <p>6. Cálcio Iônico;</p>}
                        {bloodExams.fosfataseAlcalina && <p>7. Fosfatase Alcalina;</p>}
                        {bloodExams.sumarioUrina && <p>8. Sumário de Urina;</p>}
                        {bloodExams.hiv && <p>9. HIV / HBSAg / Anti-HCV / VDRL.</p>}
                      </div>
                    </div>
                  )}

                  {/* MODEL 5: SOLICITAÇÃO DE TOMOGRAFIA CONE BEAM (CBCT) */}
                  {activeTemplate.id === 'solicitacao_tomografia' && (
                    <div className="space-y-3 text-xs font-sans text-stone-800">
                      <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between text-xs font-semibold">
                        <div>
                          <span className="text-stone-500 text-[10px] uppercase font-bold mr-1.5">Paciente:</span>
                          <span className="text-stone-900 font-bold underline">{patientDisplayName}</span>
                        </div>
                        <div>
                          <span className="text-stone-500 text-[10px] uppercase font-bold mr-1.5">Idade:</span>
                          <span className="text-stone-800 font-semibold">{patientAge}</span>
                        </div>
                      </div>

                      {/* 1. Regiões Anatômicas Selecionadas */}
                      <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                        <div className="flex items-center justify-between border-b border-stone-200 pb-1">
                          <span className="font-bold text-[11px] text-stone-900 uppercase">
                            1. Regiões Anatômicas Solicitadas
                          </span>
                          <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                            {getSelectedTomographyRegions().length} Região(ões)
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                          {getSelectedTomographyRegions().map((region, idx) => (
                            <div key={idx} className="flex items-center gap-1.5 text-[11.5px] font-semibold text-stone-800 bg-white p-1.5 rounded-lg border border-stone-200">
                              <span className="text-emerald-700 font-bold">☑</span>
                              <span>{region}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 2. Finalidade Clínica e Indicações */}
                      <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1.5">
                        <span className="font-bold text-[11px] text-stone-900 uppercase block border-b border-stone-200 pb-1">
                          2. Finalidade Clínica e Indicações do Exame
                        </span>
                        <ul className="space-y-1 pt-1">
                          {getSelectedTomographyIndications().map((ind, idx) => (
                            <li key={idx} className="flex items-start gap-1.5 text-[11.5px] font-medium text-stone-800">
                              <span className="text-amber-800 font-bold">•</span>
                              <span>{ind}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* 3. Especificações Técnicas & Entrega */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
                          <span className="font-bold text-[10.5px] text-stone-700 uppercase block">
                            Campo de Visão (FOV)
                          </span>
                          <p className="text-xs font-bold text-stone-900">
                            {TOMOGRAPHY_FOV_LABELS[tomographyFov] || tomographyFov}
                          </p>
                        </div>
                        <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
                          <span className="font-bold text-[10.5px] text-stone-700 uppercase block">
                            Formato de Entrega
                          </span>
                          <div className="space-y-0.5 text-[11px] font-semibold text-stone-800">
                            {getSelectedTomographyDelivery().map((del, idx) => (
                              <div key={idx}>• {del}</div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* 4. Observações Clínicas */}
                      {tomographyNotes && (
                        <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/80 space-y-1">
                          <span className="font-bold text-[10.5px] text-amber-950 uppercase block">
                            Observações e Orientações Clínicas
                          </span>
                          <p className="text-xs text-stone-800 leading-relaxed font-medium">
                            {tomographyNotes}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* MODEL 6: SOLICITAÇÃO DE RESSONÂNCIA ATM */}
                  {activeTemplate.id === 'solicitacao_ressonancia_atm' && (
                    <div className="space-y-6 pt-4 text-justify">
                      <p className="font-bold">Paciente: {patientDisplayName}</p>
                      <p className="text-base leading-relaxed">
                        Solicito <strong className="font-bold underline">Ressonância Magnética das Articulações Temporomandibulares (direita e esquerda)</strong>, com cortes nos planos sagital e coronal, em boca fechada e aberta, para avaliação de disco articular, tecidos moles e possíveis processos inflamatórios.
                      </p>
                    </div>
                  )}

                  {/* MODEL 7: SOLICITAÇÃO DE ESCANEAMENTO 3D */}
                  {activeTemplate.id === 'solicitacao_escaneamento_3d' && (
                    <div className="space-y-6 pt-4 text-justify">
                      <p className="font-bold">Paciente: {patientDisplayName}</p>
                      <p className="text-base leading-relaxed">
                        Solicito <strong className="font-bold underline">Escaneamento Intraoral 3D completo</strong> da arcada superior e da arcada inferior com e sem próteses para determinar a topografia 3D dos dentes e mucosas.
                      </p>
                      <p className="text-xs text-stone-600 italic">
                        Favor encaminhar e-mail com as imagens para {clinicInfo.email || 'contato@dentispro.com.br'}.
                      </p>
                    </div>
                  )}

                  {/* MODEL 8: SOLICITAÇÃO DE PARECER ESPECIALIZADO */}
                  {activeTemplate.id === 'solicitacao_parecer_especialista' && (
                    <div className="space-y-6 pt-4 text-justify">
                      <p className="font-bold">{specialistRecipient},</p>
                      <div className="p-3 bg-stone-50 border border-stone-200 rounded-lg text-xs font-bold text-stone-800">
                        Especialidade Odontológica Solicitada: <span className="text-[#5a5a40] uppercase tracking-wide">{specialistSpecialty}</span>
                      </div>
                      <p className="text-base leading-relaxed">
                        {specialistRequestText}
                      </p>
                      <p className="text-xs text-stone-600">
                        Paciente: <strong>{patientDisplayName}</strong> ({patientAge})
                      </p>
                    </div>
                  )}

                  {/* MODEL 9: JUSTIFICATIVA CLÍNICA */}
                  {activeTemplate.id === 'justificativa_clinica' && (
                    <div className="space-y-4 pt-2">
                      <p className="font-bold text-center text-base uppercase">JUSTIFICATIVA CLÍNICA</p>
                      <p className="text-xs">Credenciado: {formatCNPJ(clinicInfo.cnpj || '22.144.932/0001-40')} – {clinicInfo.dentistName}</p>
                      <p className="text-xs font-bold">Associado / Paciente: {patientDisplayName}</p>

                      <div className="border border-stone-800 p-3 rounded-lg text-xs space-y-1">
                        <p><strong>Procedimento TUSS:</strong> {tussCodeInput} – {tussDescInput}</p>
                        <p><strong>Região / Dente:</strong> {toothInput}</p>
                      </div>

                      <div className="space-y-1">
                        <p className="font-bold text-xs uppercase">Justificativa Clínica:</p>
                        <p className="text-xs text-justify bg-stone-50 p-3 rounded-lg border border-stone-200">
                          {clinicalJustificationText}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* MODEL 10: RELATÓRIO PAIO - PROTOCOLO DE ANESTESIA INTRA-ORAL E PÓS-PROCEDIMENTO */}
                  {activeTemplate.id === 'relatorio_paio_pos_procedimento' && (
                    <div className="space-y-4 pt-2 font-sans">
                      <div className="text-center border-b border-stone-800 pb-2">
                        <p className="font-bold text-base uppercase tracking-tight">PROTOCOLO DE ANESTESIA INTRA-ORAL & RELATÓRIO PÓS-PROCEDIMENTO (PAIO)</p>
                        <p className="text-[11px] text-stone-600">Consolidação em Folha Única de Anestesia Local, Insumos Consumidos, Atendimento Operatório e Orientações</p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs bg-stone-50 p-3 rounded-lg border border-stone-300">
                        <p><strong>Paciente:</strong> {patientDisplayName} ({patientAge})</p>
                        <p><strong>Cirurgião-Dentista:</strong> {clinicInfo.dentistName}</p>
                        <p><strong>Procedimento:</strong> {paioProcedure}</p>
                        <p><strong>Dente / Região:</strong> {paioToothRegion}</p>
                      </div>

                      {/* Anestesia Tópica e Injetável */}
                      <div className="border border-stone-800 p-3 rounded-lg space-y-2 text-xs">
                        <div className="flex items-center justify-between border-b border-stone-300 pb-1">
                          <p className="font-bold uppercase text-[11px] text-stone-900">
                            1. Protocolo de Anestesia Intra-Oral & Tubetes Utilizados
                          </p>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                            isPaioActive ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-stone-200 text-stone-700 border-stone-300'
                          }`}>
                            {isPaioActive ? 'PROTOCOLO ATIVO' : 'INATIVO / NÃO APLICADO'}
                          </span>
                        </div>
                        
                        {isPaioActive ? (
                          <>
                            <div>
                              <span className="font-bold">Anestesia Tópica: </span>
                              <span>
                                {Object.entries(topicalAnesthetics).filter(([_, v]) => v).map(([k]) => k).join(', ') || 'Nenhuma anestesia tópica aplicada'}
                              </span>
                            </div>

                            <div>
                              <span className="font-bold">Locais de Aplicação Anestésica: </span>
                              <span>
                                {paioAnesthesiaSites.length > 0 
                                  ? paioAnesthesiaSites.join(' • ') 
                                  : 'Nenhum local específico discriminado'}
                              </span>
                            </div>

                            <div>
                              <span className="font-bold block mb-1">Volume Geral Injetado (Consumo Total no Procedimento):</span>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pl-2">
                                {Object.entries(injectableTubetes).filter(([_, qty]) => Number(qty) > 0).map(([name, qty]) => (
                                  <div key={name} className="flex justify-between items-center bg-stone-100 p-1.5 rounded border border-stone-200">
                                    <span>{name}</span>
                                    <span className="font-bold text-stone-900">{qty} tubete(s) (aprox. {(Number(qty) * 1.8).toFixed(1)} mL)</span>
                                  </div>
                                ))}
                                {(Object.values(injectableTubetes) as number[]).every(v => Number(v) === 0) && (
                                  <span className="italic text-stone-500">Nenhum anestésico injetável registrado.</span>
                                )}
                              </div>
                            </div>

                            <div className="pt-1 text-[11px] font-bold text-right text-stone-800">
                              Volume Geral Consumido: {(Object.values(injectableTubetes) as number[]).reduce((a: number, b: number) => a + Number(b || 0), 0)} tubete(s) / {((Object.values(injectableTubetes) as number[]).reduce((a: number, b: number) => a + Number(b || 0), 0) * 1.8).toFixed(1)} mL (Volume geral acumulado no atendimento)
                            </div>
                          </>
                        ) : (
                          <p className="italic text-stone-600 py-1">
                            O Protocolo de Anestesia Intra-Oral foi mantido <strong>INATIVO</strong> para este procedimento. Nenhum anestésico local ou tubete foi administrado.
                          </p>
                        )}
                      </div>

                      {/* Atendimento Operatório & Sinais Vitais */}
                      <div className="border border-stone-800 p-3 rounded-lg space-y-2 text-xs">
                        <p className="font-bold uppercase text-[11px] border-b border-stone-300 pb-1 text-stone-900">
                          2. Técnica Anestésica & Parâmetros Fisiológicos
                        </p>
                        <p><strong>Técnica Anestésica:</strong> {paioTechnique}</p>
                        <p><strong>Sinais Vitais Pré/Pós-Procedimento:</strong> PA: {paioBloodPressure} • Frequência Cardíaca: {paioHeartRate}</p>
                      </div>

                      {/* Intercorrências & Pós-Operatório */}
                      <div className="border border-stone-800 p-3 rounded-lg space-y-2 text-xs">
                        <p className="font-bold uppercase text-[11px] border-b border-stone-300 pb-1 text-stone-900">
                          3. Descrição Operatória & Orientações Pós-Procedimento
                        </p>
                        <div>
                          <strong>Descrição / Intercorrências:</strong>
                          <p className="bg-stone-50 p-2 rounded border border-stone-200 mt-1">{paioComplications}</p>
                        </div>
                        <div>
                          <strong>Orientações Pós-Operatórias Ministradas:</strong>
                          <p className="bg-stone-50 p-2 rounded border border-stone-200 mt-1">{paioPostOpInstructions}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Date line (Hidden for Receituário de Controle Especial, which has its own right-aligned city date) */}
                  {activeTemplate.id !== 'receituario_controle_especial' && (
                    <div className="pt-4 pb-2 text-right font-semibold text-[#5a5a40]">
                      {cityFormattedDate}
                    </div>
                  )}
                </div>

                {/* 4. Signature & Digital Verification (Lifted higher up for standard documents to keep footer fully visible) */}
                <div className={`space-y-3 text-center relative z-10 ${activeTemplate.id !== 'receituario_controle_especial' ? 'mb-8 pb-4' : 'pt-2'}`}>
                  <DocumentSignatureFooter
                    customDentistName={effectiveDentistName}
                    customCro={effectiveDentistCro}
                    compact={true}
                    hideSignatureLine={activeTemplate.id === 'receituario_controle_especial'}
                    hideStampAndManualSignature={activeTemplate.id === 'receituario_controle_especial'}
                    align="right"
                  />
                </div>

                {/* 5. Bottom Clinic Footer (Hidden for Receituário de Controle Especial) */}
                {activeTemplate.id !== 'receituario_controle_especial' && (
                  <div className="border-t-2 border-stone-800 pt-3 text-xs text-stone-900 relative z-10 print:text-[10px] font-sans">
                    <div className="grid grid-cols-2 gap-x-8 gap-y-1">
                      {/* Coluna Esquerda: Site & WhatsApps/Telefones */}
                      <div className="space-y-1 text-left">
                        <div className="flex items-center gap-1.5">
                          <Globe className="w-3.5 h-3.5 text-[#5a5a40] shrink-0" />
                          <a
                            href="https://dentispro.com.br"
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
                            href="tel:5585986846424"
                            className="text-blue-900 hover:text-blue-950 underline font-medium text-[11px] sm:text-xs"
                          >
                            (85) 98684 6424
                          </a>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {/* WhatsApp Green Icon */}
                          <svg className="w-4 h-4 text-[#25D366] fill-current shrink-0" viewBox="0 0 24 24">
                            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/>
                          </svg>
                          <a
                            href="https://wa.me/5585996755202"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-900 hover:text-blue-950 underline font-medium text-[11px] sm:text-xs"
                          >
                            (85) 99675 5202
                          </a>
                        </div>
                      </div>

                      {/* Coluna Direita: E-mail, Facebook & Instagram */}
                      <div className="space-y-1 text-left sm:pl-6">
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-[#5a5a40] shrink-0" />
                          <a
                            href="mailto:contato@dentispro.com.br"
                            className="text-blue-900 hover:text-blue-950 underline font-medium text-[11px] sm:text-xs"
                          >
                            contato@dentispro.com.br
                          </a>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <a
                            href="https://www.facebook.com/drhugoandres"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-900 hover:text-blue-950 underline font-medium text-[11px] sm:text-xs"
                          >
                            www.facebook.com/drhugoandres
                          </a>
                          {/* Facebook Blue Icon */}
                          <svg className="w-4 h-4 text-[#1877F2] fill-current shrink-0" viewBox="0 0 24 24">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                          </svg>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <a
                            href="https://www.instagram.com/hugoandresiglesias/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-900 hover:text-blue-950 underline font-medium text-[11px] sm:text-xs"
                          >
                            www.instagram.com/hugoandresiglesias
                          </a>
                          {/* Instagram Gradient/Pink Icon */}
                          <svg className="w-4 h-4 text-[#E4405F] fill-current shrink-0" viewBox="0 0 24 24">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>
      )}
      {/* MODAL DE ALERTAS E BULAS DO MEDICAMENTO (CONTRAINDICAÇÕES, INTERAÇÕES E DICAS) */}
      {activeAlertModalItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#e5e5d1] rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in duration-200">
            {/* Modal Header */}
            <div className="bg-[#2c3e2e] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="text-sm font-bold leading-tight">
                    Alertas Clínicos e Informações do Fármaco
                  </h3>
                  <p className="text-xs text-stone-300 font-medium">
                    {activeAlertModalItem.item.name} ({activeAlertModalItem.item.dosage})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveAlertModalItem(null)}
                className="text-stone-300 hover:text-white p-1 rounded-lg transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body - Editable Textareas */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 leading-relaxed font-medium">
                <strong>Orientações Anvisa / Manual de Prescrição Odontológica:</strong> Estas informações auxiliam no uso seguro do medicamento. Você pode editar o conteúdo abaixo conforme a anamnese e necessidades específicas do seu paciente.
              </div>

              {/* 1. CONTRAINDICAÇÕES */}
              <div className="space-y-1.5">
                <label className="font-bold text-rose-800 uppercase tracking-wide flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-600 inline-block"></span>
                  Contraindicações:
                </label>
                <textarea
                  rows={3}
                  value={activeAlertModalItem.item.contraindications || ''}
                  onChange={(e) => setActiveAlertModalItem({
                    ...activeAlertModalItem,
                    item: { ...activeAlertModalItem.item, contraindications: e.target.value }
                  })}
                  className="w-full bg-[#fbfbf9] border border-rose-200 focus:border-rose-500 rounded-xl p-3 text-stone-800 font-medium focus:outline-none"
                  placeholder="Ex: Alergia a penicilinas, insuficiência renal grave..."
                />
              </div>

              {/* 2. INTERAÇÕES MEDICAMENTOSAS */}
              <div className="space-y-1.5">
                <label className="font-bold text-amber-800 uppercase tracking-wide flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-600 inline-block"></span>
                  Interações Medicamentosas:
                </label>
                <textarea
                  rows={3}
                  value={activeAlertModalItem.item.interactions || ''}
                  onChange={(e) => setActiveAlertModalItem({
                    ...activeAlertModalItem,
                    item: { ...activeAlertModalItem.item, interactions: e.target.value }
                  })}
                  className="w-full bg-[#fbfbf9] border border-amber-200 focus:border-amber-500 rounded-xl p-3 text-stone-800 font-medium focus:outline-none"
                  placeholder="Ex: Anticoagulantes orais, álcool, antiácidos..."
                />
              </div>

              {/* 3. DICAS E RECOMENDAÇÕES CLÍNICAS */}
              <div className="space-y-1.5">
                <label className={`font-bold ${t.headingText} uppercase tracking-wide flex items-center gap-1.5`}>
                  <span className={`w-2 h-2 rounded-full ${t.btnPrimaryBg} inline-block`}></span>
                  Dicas e Recomendações Clínicas:
                </label>
                <textarea
                  rows={4}
                  value={activeAlertModalItem.item.tips || ''}
                  onChange={(e) => setActiveAlertModalItem({
                    ...activeAlertModalItem,
                    item: { ...activeAlertModalItem.item, tips: e.target.value }
                  })}
                  className={`w-full ${t.inputBg} border ${t.cardBorder} rounded-xl p-3 font-medium focus:outline-none`}
                  placeholder="Ex: Administrar no início das refeições para reduzir irritação gástrica..."
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-stone-50 border-t border-[#e5e5d1] p-3.5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setActiveAlertModalItem(null)}
                className="px-4 py-2 bg-white border border-[#e5e5d1] hover:bg-stone-100 text-stone-700 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  const idx = activeAlertModalItem.index;
                  const updated = [...specialPrescriptionItems];
                  updated[idx] = activeAlertModalItem.item;
                  setSpecialPrescriptionItems(updated);
                  setActiveAlertModalItem(null);
                }}
                className="px-4 py-2 bg-[#2c3e2e] hover:bg-[#1f2d21] text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Salvar Alertas do Fármaco</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE GERENCIAMENTO DE MODELOS SALVOS DE PRESCRIÇÃO */}
      {showManageTemplatesModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-5 border border-[#e5e5d1] space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[#e5e5d1]">
              <div className="flex items-center gap-2 text-[#5a5a40]">
                <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
                <h3 className="font-bold text-base text-[#2c2c2c]">Gerenciador de Modelos Salvos de Prescrição</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowManageTemplatesModal(false)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {customSavedTemplates.length === 0 ? (
                <div className="text-center py-8 text-stone-500 space-y-2">
                  <Bookmark className="w-10 h-10 mx-auto text-stone-300" />
                  <p className="font-medium text-sm text-[#2c2c2c]">Nenhum modelo personalizado salvo ainda.</p>
                  <p className="text-xs text-stone-500 max-w-sm mx-auto">
                    Ao preencher um medicamento na receita, clique em <strong className="text-[#5a5a40]">"Salvar Modelo"</strong> para reutilizá-lo rapidamente em atendimentos futuros.
                  </p>
                </div>
              ) : (
                customSavedTemplates.map((tpl) => (
                  <div key={tpl.id} className="p-3 bg-[#fbfbf9] border border-[#e5e5d1] rounded-xl flex items-start justify-between gap-3 hover:border-[#5a5a40]/60 transition">
                    <div className="space-y-1.5 text-xs flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-[#2c2c2c] text-sm">{tpl.name}</span>
                        {tpl.dosage && <span className="bg-[#e5e5d1] px-2 py-0.5 rounded-md font-semibold text-[10.5px] text-[#5a5a40]">{tpl.dosage}</span>}
                        {tpl.presentation && <span className="text-stone-500 text-[11px]">({tpl.presentation})</span>}
                      </div>
                      {tpl.quantity && <p className="text-stone-600 font-medium">Qtd: {tpl.quantity}</p>}
                      <p className="text-[#5a5a40] bg-white p-2 rounded-lg border border-[#e5e5d1]/80 text-[11.5px] font-medium leading-relaxed">
                        <strong>Uso/Posologia:</strong> {tpl.instructions || 'Não informada'}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteCustomTemplate(tpl.id)}
                      className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-lg border border-rose-200 flex items-center gap-1 transition cursor-pointer shrink-0"
                      title="Excluir este modelo de prescrição"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Excluir</span>
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-[#e5e5d1] flex justify-end">
              <button
                type="button"
                onClick={() => setShowManageTemplatesModal(false)}
                className={`px-4 py-2 ${t.btnPrimaryBg} ${t.btnPrimaryText} text-xs font-bold rounded-xl transition cursor-pointer`}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE VALIDAÇÃO DE HASH NO PORTAL GOV.BR / ITI */}
      {isVerificationModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-[28px] max-w-lg w-full p-6 shadow-2xl space-y-5 text-left text-xs font-sans animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 p-0.5 flex items-center justify-center text-white shadow-md">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    Validação de Assinatura no Portal ITI / Gov.br
                  </h3>
                  <p className="text-[11px] text-slate-500">Instituto Nacional de Tecnologia da Informação</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsVerificationModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <h4 className="font-bold text-sm text-emerald-950">Assinatura Eletrônica Avançada / Qualificada VÁLIDA</h4>
              </div>
              <p className="text-xs text-emerald-900 leading-relaxed">
                A hash SHA-256 informada foi verificada de acordo com o padrão oficial de conformidade do ITI (ICP-Brasil / Governo Federal - Lei 14.063/2020).
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2.5 text-slate-700 text-[11px]">
              <div className="flex justify-between border-b border-slate-200 pb-1.5 font-semibold">
                <span>Signatário Registrado:</span>
                <span className="font-bold text-slate-900">{activeProfessional?.name || clinicInfo.dentistName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1.5 font-semibold">
                <span>Inscrição Profissional:</span>
                <span className="font-bold text-slate-900">{activeProfessional?.cro || clinicInfo.cro}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1.5 font-semibold">
                <span>Certificado Emissor:</span>
                <span className="font-bold text-emerald-800">Gov.br (Conta Prata/Ouro - Pessoa Física)</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1.5 font-semibold">
                <span>Criptografia:</span>
                <span className="font-mono text-slate-800">SHA-256 com Chave Privada RSA</span>
              </div>
              <div>
                <span className="block text-slate-500 font-medium mb-0.5">Código Hash SHA-256 Verificado:</span>
                <div className="font-mono text-[10.5px] bg-white p-2 rounded-xl border border-slate-300 text-slate-900 break-all select-all">
                  A8F9-4B12-8C01-D9E3-2F45-6A78-90BC-4E11
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <a
                href="https://validar.iti.gov.br"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Acessar Portal Oficial ITI
              </a>

              <button
                type="button"
                onClick={() => setIsVerificationModalOpen(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: CALCULADORA CLÍNICO-ANESTÉSICA ODONTOLÓGICA */}
      {isAnestheticCalcOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 md:p-6 overflow-y-auto">
          <div className={`${t.modalBg} border-2 ${t.cardBorder} rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden my-auto animate-fadeIn space-y-4 p-5 font-sans`}>
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-md">
                  <SlidersHorizontal className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={`text-base font-bold ${t.headingText}`}>
                    Calculadora Clínico-Anestésica Odontológica
                  </h3>
                  <p className="text-[11px] opacity-75">
                    Cálculo automatizado de dose máxima e limite seguro de tubetes (Malamed)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAnestheticCalcOpen(false)}
                className="p-1.5 rounded-xl hover:bg-stone-200/60 transition cursor-pointer"
              >
                <X className="w-5 h-5 text-stone-500" />
              </button>
            </div>

            {/* Inputs Form */}
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Peso do Paciente (kg):</label>
                  <input
                    type="number"
                    min="5"
                    max="200"
                    value={anestheticWeight}
                    onChange={(e) => setAnestheticWeight(Number(e.target.value))}
                    className={`w-full p-2.5 ${t.inputBg} rounded-xl border ${t.cardBorder} font-bold text-sm focus:outline-none`}
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Risco Sistêmico / Vaso:</label>
                  <label className="flex items-center gap-2 p-2.5 bg-stone-100 rounded-xl border border-stone-200 cursor-pointer font-bold text-stone-800 text-[11px] mt-0.5">
                    <input
                      type="checkbox"
                      checked={isCardiacRisk}
                      onChange={(e) => setIsCardiacRisk(e.target.checked)}
                      className="w-4 h-4 text-amber-600 rounded"
                    />
                    <span>Cardiopata / Hipertenso</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Solução Anestésica:</label>
                <select
                  value={anestheticType}
                  onChange={(e) => setAnestheticType(e.target.value as any)}
                  className={`w-full p-2.5 ${t.inputBg} rounded-xl border ${t.cardBorder} font-bold text-xs focus:outline-none`}
                >
                  <option value="lido_epi">Lidocaína 2% c/ Epinefrina 1:100.000 (4.4 mg/kg - máx 300mg)</option>
                  <option value="mepi_epi">Mepivacaína 2% c/ Epinefrina 1:100.000 (4.4 mg/kg - máx 300mg)</option>
                  <option value="mepi_sem">Mepivacaína 3% Sem Vasoconstritor (4.4 mg/kg - máx 300mg)</option>
                  <option value="arti_epi">Articaína 4% c/ Epinefrina 1:100.000 (7.0 mg/kg - máx 500mg)</option>
                  <option value="prilo_feli">Prilocaína 3% c/ Felipressina 0,03 UI/ml (6.0 mg/kg - máx 400mg)</option>
                </select>
              </div>

              {/* Results Display Box */}
              {(() => {
                const calc = calculateAnestheticDose();
                return (
                  <div className="bg-amber-500/10 border-2 border-amber-400/60 p-4 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-950 uppercase tracking-wide text-[11px]">
                        {calc.solutionName}
                      </span>
                      <span className="bg-amber-500 text-white font-black text-xs px-2.5 py-1 rounded-full shadow-xs">
                        {calc.calculatedCartridges} Tubete(s) MÁXIMO
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] text-amber-900 font-semibold">
                      <div className="bg-white/80 p-2 rounded-xl border border-amber-200">
                        <span className="block text-[10px] text-stone-500 uppercase">Dose Máxima Absoluta:</span>
                        <span className="font-bold text-stone-900">{calc.calculatedMg} mg</span>
                      </div>
                      <div className="bg-white/80 p-2 rounded-xl border border-amber-200">
                        <span className="block text-[10px] text-stone-500 uppercase">Mg por Tubete (1,8 ml):</span>
                        <span className="font-bold text-stone-900">{calc.mgPerCartridge} mg</span>
                      </div>
                    </div>

                    {calc.cardiacWarning && (
                      <div className="p-2.5 bg-red-100 text-red-900 rounded-xl border border-red-300 text-[11px] font-bold flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                        <span>{calc.cardiacWarning}</span>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-200">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const calc = calculateAnestheticDose();
                    const note = `PAIO (Protocolo Anestésico Intra-Oral - Malamed):\n• Solução: ${calc.solutionName}\n• Paciente: Peso ${anestheticWeight}kg\n• Dose Máxima: ${calc.calculatedMg}mg\n• Limite Seguro: ${calc.calculatedCartridges} tubete(s) de 1,8ml\n• Alerta Cardíaco/Vascular: ${calc.cardiacWarning || 'Nenhum'}\n• Vias: Bloqueio Regional / Infiltração Supraperióstea Intra-Oral.`;
                    navigator.clipboard.writeText(note);
                    setCopiedAnestheticToast(true);
                    setTimeout(() => setCopiedAnestheticToast(false), 2500);
                  }}
                  className={`px-3 py-2 ${t.btnPrimaryBg} ${t.btnPrimaryText} font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs`}
                >
                  {copiedAnestheticToast ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                  <span>Copiar Parecer PAIO (Intra-Oral)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const calc = calculateAnestheticDose();
                    const note = `PAEO (Protocolo Anestésico Extra-Oral - Cirurgia / Estomatologia):\n• Solução: ${calc.solutionName}\n• Paciente: Peso ${anestheticWeight}kg\n• Dose Máxima: ${calc.calculatedMg}mg\n• Limite Seguro: ${calc.calculatedCartridges} tubete(s) de 1,8ml\n• Alerta Cardíaco/Vascular: ${calc.cardiacWarning || 'Nenhum'}\n• Vias: Bloqueio Extra-Oral (Infra-Orbitário / Mentoniano / Mandibular) ou Infiltração Facial/Perioral.`;
                    navigator.clipboard.writeText(note);
                    setCopiedAnestheticToast(true);
                    setTimeout(() => setCopiedAnestheticToast(false), 2500);
                  }}
                  className="px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copiar Parecer PAEO (Extra-Oral)</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setIsAnestheticCalcOpen(false)}
                className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: GUIA TERAPÊUTICO RÁPIDO & PRESETS DE POSOLOGIA */}
      {isTherapeuticGuideOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 md:p-6 overflow-y-auto">
          <div className={`${t.modalBg} border-2 ${t.cardBorder} rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden my-auto animate-fadeIn space-y-4 p-5 font-sans max-h-[90vh] flex flex-col`}>
            <div className="flex items-center justify-between border-b border-stone-200 pb-3 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-md">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={`text-base font-bold ${t.headingText}`}>
                    Guia Terapêutico e Posologias Odontológicas
                  </h3>
                  <p className="text-[11px] opacity-75">
                    Selecione uma medicação para adicionar diretamente ao receituário de controle especial
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsTherapeuticGuideOpen(false)}
                className="p-1.5 rounded-xl hover:bg-stone-200/60 transition cursor-pointer"
              >
                <X className="w-5 h-5 text-stone-500" />
              </button>
            </div>

            {/* Search Input for Guia Terapêutico */}
            <div className="relative">
              <input
                type="text"
                value={therapeuticGuideSearch}
                onChange={(e) => setTherapeuticGuideSearch(e.target.value)}
                placeholder="Buscar medicação (ex: Amoxicilina, Clindamicina, Ibuprofeno, Dexametasona)..."
                className={`w-full ${t.inputBg} border ${t.cardBorder} rounded-xl pl-9 pr-8 py-2 text-xs font-semibold focus:outline-none`}
              />
              <Search className="w-4 h-4 opacity-50 absolute left-3 top-2.5 pointer-events-none" />
              {therapeuticGuideSearch && (
                <button
                  type="button"
                  onClick={() => setTherapeuticGuideSearch('')}
                  className="absolute right-3 top-2.5 opacity-50 hover:opacity-100 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5 text-stone-500" />
                </button>
              )}
            </div>

            {/* List of Dental Medications Presets */}
            <div className="overflow-y-auto space-y-3 pr-1 flex-1 text-xs">
              {DENTAL_MEDICATIONS_CATALOG.filter(m => {
                if (!therapeuticGuideSearch.trim()) return true;
                const q = therapeuticGuideSearch.toLowerCase().trim();
                return (
                  m.name.toLowerCase().includes(q) ||
                  m.dosage.toLowerCase().includes(q) ||
                  m.presentation.toLowerCase().includes(q) ||
                  (m.category && m.category.toLowerCase().includes(q))
                );
              }).map((med, idx) => (
                <div
                  key={med.id || idx}
                  className={`p-3.5 ${t.cardBg} rounded-2xl border ${t.cardBorder} hover:border-emerald-400 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group`}
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-stone-900 group-hover:text-emerald-700 transition">
                        {med.name}
                      </span>
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-md">
                        {med.category || 'Odontológico'}
                      </span>
                      <span className="text-[11px] font-semibold text-stone-500">
                        {med.dosage} • {med.presentation}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-600 font-medium">
                      <strong className="text-stone-800">Posologia:</strong> {med.instructions}
                    </p>
                    {med.tips && (
                      <p className="text-[10.5px] text-emerald-800 bg-emerald-50/60 p-1.5 rounded-lg border border-emerald-100">
                        💡 <strong>Dica Clínica:</strong> {med.tips}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const newMed: MedicationItem = {
                        ...med,
                        id: `med_guide_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`
                      };
                      setSpecialPrescriptionItems([newMed, ...specialPrescriptionItems]);
                      setIsTherapeuticGuideOpen(false);
                      const tpl = DENTAL_DOCUMENT_TEMPLATES.find(t => t.id === 'receituario_controle_especial');
                      if (tpl) handleOpenParametersModal(tpl);
                    }}
                    className={`px-3.5 py-2 ${t.btnPrimaryBg} ${t.btnPrimaryText} font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition shrink-0 cursor-pointer shadow-xs active:scale-95`}
                  >
                    <Plus className="w-4 h-4" />
                    <span>Usar na Receita</span>
                  </button>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2 border-t border-stone-200 shrink-0">
              <button
                type="button"
                onClick={() => setIsTherapeuticGuideOpen(false)}
                className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Fechar Guia
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: MATRIZ DE CID-10 & GERADOR DE ATESTADOS POR PROCEDIMENTO */}
      {isCidMatrixOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 md:p-6 overflow-y-auto">
          <div className={`${t.modalBg} border-2 ${t.cardBorder} rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden my-auto animate-fadeIn space-y-4 p-5 font-sans max-h-[90vh] flex flex-col`}>
            <div className="flex items-center justify-between border-b border-stone-200 pb-3 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-sky-600 text-white flex items-center justify-center font-bold shadow-md">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={`text-base font-bold ${t.headingText}`}>
                    Matriz de CID-10 & Atestados por Procedimento
                  </h3>
                  <p className="text-[11px] opacity-75">
                    Selecione o procedimento realizado para carregar o CID-10 e período de afastamento ideal
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCidMatrixOpen(false)}
                className="p-1.5 rounded-xl hover:bg-stone-200/60 transition cursor-pointer"
              >
                <X className="w-5 h-5 text-stone-500" />
              </button>
            </div>

            {/* Grid of Procedure CID Matrix Cards */}
            <div className="overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-3 pr-1 flex-1 text-xs">
              {[
                { title: 'Exodontia de 3º Molar Incluso', cid: 'K01.1', days: '2 a 3 dias', desc: 'Sisos impactados com osteotomia e sutura.' },
                { title: 'Pulpite Aguda / Tratamento de Canal', cid: 'K04.0', days: '1 dia', desc: 'Urgência endodôntica com pulpectomia.' },
                { title: 'Abscesso Periapical com Inchaço', cid: 'K04.7', days: '2 dias', desc: 'Infeccioso agudo, drenagem e antibioticoterapia.' },
                { title: 'Cirurgia Periodontal / Enxerto', cid: 'K05.3', days: '2 a 3 dias', desc: 'Procedimento cirúrgico resectivo/regenerativo.' },
                { title: 'Instalação de Implante Dentário', cid: 'K08.1', days: '1 a 2 dias', desc: 'Reabilitação cirúrgica prévia ou imediata.' },
                { title: 'Traumatismo / Fratura Dental', cid: 'K08.8', days: '1 a 2 dias', desc: 'Trauma bucomaxilofacial ou dental agudo.' }
              ].map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setCidCode(item.cid);
                    setIsManualCid(false);
                    setIsCidMatrixOpen(false);
                    const tpl = DENTAL_DOCUMENT_TEMPLATES.find(t => t.id === 'atestado_medico_odontologico');
                    if (tpl) handleOpenParametersModal(tpl);
                  }}
                  className={`p-4 ${t.cardBg} rounded-2xl border-2 ${t.cardBorder} hover:border-sky-500 transition-all cursor-pointer space-y-2 group shadow-2xs hover:shadow-md active:scale-[0.99]`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-stone-900 group-hover:text-sky-700 transition">
                      {item.title}
                    </span>
                    <span className="bg-sky-100 text-sky-800 text-[10px] font-bold px-2 py-0.5 rounded-md font-mono">
                      CID: {item.cid}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-600 line-clamp-2">{item.desc}</p>
                  <div className="flex items-center justify-between pt-2 border-t border-stone-200 text-[11px]">
                    <span className="font-bold text-amber-800">Afastamento Sugerido: {item.days}</span>
                    <span className="text-sky-700 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Emitir Atestado →
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2 border-t border-stone-200 shrink-0">
              <button
                type="button"
                onClick={() => setIsCidMatrixOpen(false)}
                className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GOV.BR SIGNATURE WIZARD BROWSER MODAL */}
      <GovBrSignatureWizardModal
        isOpen={isGovBrWizardOpen}
        onClose={() => setIsGovBrWizardOpen(false)}
        documentData={govBrWizardDoc}
      />
    </div>
  );
};
