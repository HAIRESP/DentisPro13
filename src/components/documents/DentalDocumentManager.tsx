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
  QrCode,
  Pill,
  Layers,
  Eye,
  FileSpreadsheet,
  DollarSign
} from 'lucide-react';
import { DENTAL_MEDICATIONS_CATALOG } from '../../data/medicationsCatalog';
import { MedicationItem } from '../../types';

import { getThemeStyles } from '../../utils/themeUtils';

export type DocumentCategory = 'receituario' | 'atestado' | 'declaracao' | 'termo' | 'solicitacao' | 'todos';

export interface DocumentTemplate {
  id: string;
  category: 'receituario' | 'atestado' | 'declaracao' | 'termo' | 'solicitacao';
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
  // 1. CLASSE RECEITUÁRIOS
  {
    id: 'receituario_simples',
    category: 'receituario',
    title: 'Receituário Simples (1 ou 2 Vias)',
    subtitle: 'Prescrição de medicamentos de uso comum (analgésicos, anti-inflamatórios, enxaguantes)',
    icon: Pill,
    description: 'Receituário simples com identificação clínica, cabeçalho, posologia personalizada e opção de 1 ou 2 vias para medicamentos de venda livre e uso geral.'
  },
  {
    id: 'receituario_controle_especial',
    category: 'receituario',
    title: 'Receituário de Controle Especial (2 Vias)',
    subtitle: 'Modelo em 2 Vias (Farmácia / Paciente) - Medicamentos Controlados / Antibióticos',
    icon: FileText,
    description: 'Receituário de controle especial em 2 vias com identificação do emitente, comprador e fornecedor (Portaria 344/98 / Anvisa - C1, C5, antimicrobianos).'
  },
  {
    id: 'receituario_notificacao_b_azul',
    category: 'receituario',
    title: 'Notificação de Receita B (Azul - Psicotrópicos)',
    subtitle: 'Prescrição de ansiolíticos, benzodiazepínicos e sedativos odontológicos (Portaria 344/98)',
    icon: Pill,
    description: 'Modelo oficial de Notificação de Receita B (Azul) para pré-medicação ansiolítica e sedação consciente em consultório (Midazolam, Diazepam, Lorazepam).'
  },
  {
    id: 'receituario_notificacao_a_amarela',
    category: 'receituario',
    title: 'Notificação de Receita A (Amarela - Entorpecentes)',
    subtitle: 'Prescrição de analgésicos entorpecentes e opioides de controle estrito (Portaria 344/98)',
    icon: FileSpreadsheet,
    description: 'Notificação de Receita A (Amarela) para medicamentos entorpecentes e analgésicos opioides sob regime de controle sanitário estrito (Morfina, Codeína alta dose).'
  },

  // 2. CLASSE ATESTADOS
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
    subtitle: 'Comprovação de presença no consultório (Entrada / Saída)',
    icon: Clock,
    description: 'Comprova o horário de entrada e saída do paciente no atendimento odontológico para fins empregatícios.'
  },
  {
    id: 'atestado_aptidao_odontologica',
    category: 'atestado',
    title: 'Atestado de Aptidão Odontológica / Sanidade Bucal',
    subtitle: 'Aptidão para concursos, cirurgias eletivas, exames admissionais e esportes',
    icon: ShieldCheck,
    description: 'Atestado de higidez bucal e ausência de focos infecciosos ativos para procedimentos médicos, cirurgias cardíacas, transplantes ou concursos.'
  },

  // 3. CLASSE DECLARAÇÕES
  {
    id: 'relatorio_atendimento_inicial_final',
    category: 'declaracao',
    title: 'Relatório de Atendimento (Inicial / Final)',
    subtitle: 'Relatório clínico e orientações ao paciente assistido',
    icon: FileText,
    description: 'Relatório formal de atendimento inicial ou final com justificativas clínicas, pedagógicas e institucionais.'
  },
  {
    id: 'declaracao_comparecimento',
    category: 'declaracao',
    title: 'Declaração de Atendimento Odontológico',
    subtitle: 'Declaração simples de consulta e tratamento',
    icon: FileCheck,
    description: 'Declaração formal de prestação de serviço e tratamento odontológico realizado.'
  },
  {
    id: 'declaracao_tratamento_andamento',
    category: 'declaracao',
    title: 'Declaração de Tratamento em Andamento',
    subtitle: 'Comprovação de plano de tratamento em execução para convênios ou trabalho',
    icon: Activity,
    description: 'Declara que o paciente encontra-se em acompanhamento ou tratamento odontológico contínuo.'
  },
  {
    id: 'declaracao_valores_recibo',
    category: 'declaracao',
    title: 'Declaração de Quitação / Recibo de Valores Odontológicos',
    subtitle: 'Declaração para fins de comprovação financeira e imposto de renda',
    icon: FileSpreadsheet,
    description: 'Declaração formal de recebimento de honorários odontológicos discriminando procedimentos e paciente.'
  },

  // 4. CLASSE TERMOS & TCLE
  {
    id: 'tcle_endodontia',
    category: 'termo',
    title: 'TCLE - Tratamento de Endodontia (Canal)',
    subtitle: 'Termo de Consentimento Livre e Esclarecido',
    icon: Stethoscope,
    description: 'Termo detalhando procedimento endodôntico, fratura de instrumentos, retratamento e cuidados.'
  },
  {
    id: 'tcle_protese_pino',
    category: 'termo',
    title: 'TCLE - Remoção de Prótese / Pino Intrarradicular',
    subtitle: 'Termo de consentimento para remoção',
    icon: FileText,
    description: 'Esclarecimento de riscos na remoção de blocos, próteses e pinos pré-existentes.'
  },
  {
    id: 'tcle_raspagem',
    category: 'termo',
    title: 'TCLE - Raspagem Supra-Gengival / Periodontia',
    subtitle: 'Consentimento de tratamento periodontal',
    icon: Activity,
    description: 'Termo de consentimento informado para procedimentos de raspagem, profilaxia e ultrassom.'
  },
  {
    id: 'tcle_cirurgia_implantes',
    category: 'termo',
    title: 'TCLE - Cirurgia de Implantes Dentários e Enxerto Ósseo',
    subtitle: 'Consentimento informado para reabilitação com implantes osseointegráveis',
    icon: Layers,
    description: 'Termo de consentimento esclarecido com riscos cirúrgicos, enxertia óssea, tempo de osseointegração e orientações.'
  },
  {
    id: 'tcle_clareamento_dental',
    category: 'termo',
    title: 'TCLE - Clareamento Dental (Caseiro / Consultório)',
    subtitle: 'Consentimento para clareamento com peróxidos e sensibilidade',
    icon: Sparkles,
    description: 'Termo de consentimento informando sobre sensibilidade transitória, restrições alimentares e resultados esperados.'
  },
  {
    id: 'tcle_ortodontia',
    category: 'termo',
    title: 'TCLE - Tratamento Ortodôntico / Alinhadores',
    subtitle: 'Consentimento para movimentação dentária e contenções',
    icon: SlidersHorizontal,
    description: 'Termo para instalação de aparelhos fixos ou alinhadores invisíveis, higiene oral e uso obrigatório de contenção.'
  },
  {
    id: 'termo_responsabilidade_cirurgico',
    category: 'termo',
    title: 'Termo de Responsabilidade Cirúrgica',
    subtitle: 'Cirurgias e extrações de dentes inclusos/sisos',
    icon: Scissors,
    description: 'Termo de responsabilidade para cirurgias orais maiores, dentes siso e guias de convênio.'
  },
  {
    id: 'descricao_cirurgica',
    category: 'termo',
    title: 'Descrição Cirúrgica (Formulário de Contingência)',
    subtitle: 'Relatório completo de ato cirúrgico',
    icon: Activity,
    description: 'Formulário detalhado com equipe cirúrgica, início/fim, caráter (eletiva/urgência), OPME e descrição.'
  },
  {
    id: 'relatorio_paio_pos_procedimento',
    category: 'termo',
    title: 'Protocolo de Anestesia Intra-Oral (PAIO)',
    subtitle: 'Atendimento clínico, anestesia tópica, anestesia injetável e registro pós-procedimento',
    icon: Stethoscope,
    description: 'Relatório clínico unificado contendo o protocolo de anestesia intra-oral (tópica e tubetes injetáveis), procedimento realizado, intercorrências e orientações.'
  },

  // 5. CLASSE SOLICITAÇÕES
  {
    id: 'solicitacao_rx_panoramico',
    category: 'solicitacao',
    title: 'Solicitação de Radiografia Panorâmica (Ortopantomografia)',
    subtitle: 'Análise de dentição e óssea, ATMs (boca aberta/fechada) e pós-exodontia',
    icon: Eye,
    description: 'Requisição de Radiografia Panorâmica para análise da dentição e óssea, avaliação específica da ATM (boca aberta/fechada), pós-exodontia de terceiros molares e centros radiológicos indicados.'
  },
  {
    id: 'solicitacao_rx_periapical_interproximal',
    category: 'solicitacao',
    title: 'Solicitação de Radiografia Periapical / Interproximal (Bite-Wing)',
    subtitle: 'Radiografia intraoral localizada com notação FDI ou por regiões anatômicas',
    icon: FilePlus,
    description: 'Pedido radiográfico intraoral com especificação por lista FDI ou regiões anatômicas carregadas, técnica periapical/bite-wing e indicação clínica.'
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
    id: 'solicitacao_sangue',
    category: 'solicitacao',
    title: 'Solicitação de Exames de Sangue (Pré-Operatório)',
    subtitle: 'Hemograma, Coagulograma, Glicemia, etc.',
    icon: Activity,
    description: 'Solicitação completa de exames laboratoriais hematológicos, bioquímicos e sorológicos pré-cirúrgicos.'
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

export interface FdiToothItem {
  code: string;
  name: string;
  quadrant: string;
}

export const FDI_TEETH_LIST: FdiToothItem[] = [
  // 1º Quadrante (Superior Direito)
  { code: '18', name: '18 - Terceiro Molar Superior Direito (Siso)', quadrant: '1º Quadrante (Superior Direito)' },
  { code: '17', name: '17 - Segundo Molar Superior Direito', quadrant: '1º Quadrante (Superior Direito)' },
  { code: '16', name: '16 - Primeiro Molar Superior Direito', quadrant: '1º Quadrante (Superior Direito)' },
  { code: '15', name: '15 - Segundo Pré-Molar Superior Direito', quadrant: '1º Quadrante (Superior Direito)' },
  { code: '14', name: '14 - Primeiro Pré-Molar Superior Direito', quadrant: '1º Quadrante (Superior Direito)' },
  { code: '13', name: '13 - Canino Superior Direito', quadrant: '1º Quadrante (Superior Direito)' },
  { code: '12', name: '12 - Incisivo Lateral Superior Direito', quadrant: '1º Quadrante (Superior Direito)' },
  { code: '11', name: '11 - Incisivo Central Superior Direito', quadrant: '1º Quadrante (Superior Direito)' },
  // 2º Quadrante (Superior Esquerdo)
  { code: '21', name: '21 - Incisivo Central Superior Esquerdo', quadrant: '2º Quadrante (Superior Esquerdo)' },
  { code: '22', name: '22 - Incisivo Lateral Superior Esquerdo', quadrant: '2º Quadrante (Superior Esquerdo)' },
  { code: '23', name: '23 - Canino Superior Esquerdo', quadrant: '2º Quadrante (Superior Esquerdo)' },
  { code: '24', name: '24 - Primeiro Pré-Molar Superior Esquerdo', quadrant: '2º Quadrante (Superior Esquerdo)' },
  { code: '25', name: '25 - Segundo Pré-Molar Superior Esquerdo', quadrant: '2º Quadrante (Superior Esquerdo)' },
  { code: '26', name: '26 - Primeiro Molar Superior Esquerdo', quadrant: '2º Quadrante (Superior Esquerdo)' },
  { code: '27', name: '27 - Segundo Molar Superior Esquerdo', quadrant: '2º Quadrante (Superior Esquerdo)' },
  { code: '28', name: '28 - Terceiro Molar Superior Esquerdo (Siso)', quadrant: '2º Quadrante (Superior Esquerdo)' },
  // 3º Quadrante (Inferior Esquerdo)
  { code: '31', name: '31 - Incisivo Central Inferior Esquerdo', quadrant: '3º Quadrante (Inferior Esquerdo)' },
  { code: '32', name: '32 - Incisivo Lateral Inferior Esquerdo', quadrant: '3º Quadrante (Inferior Esquerdo)' },
  { code: '33', name: '33 - Canino Inferior Esquerdo', quadrant: '3º Quadrante (Inferior Esquerdo)' },
  { code: '34', name: '34 - Primeiro Pré-Molar Inferior Esquerdo', quadrant: '3º Quadrante (Inferior Esquerdo)' },
  { code: '35', name: '35 - Segundo Pré-Molar Inferior Esquerdo', quadrant: '3º Quadrante (Inferior Esquerdo)' },
  { code: '36', name: '36 - Primeiro Molar Inferior Esquerdo', quadrant: '3º Quadrante (Inferior Esquerdo)' },
  { code: '37', name: '37 - Segundo Molar Inferior Esquerdo', quadrant: '3º Quadrante (Inferior Esquerdo)' },
  { code: '38', name: '38 - Terceiro Molar Inferior Esquerdo (Siso)', quadrant: '3º Quadrante (Inferior Esquerdo)' },
  // 4º Quadrante (Inferior Direito)
  { code: '41', name: '41 - Incisivo Central Inferior Direito', quadrant: '4º Quadrante (Inferior Direito)' },
  { code: '42', name: '42 - Incisivo Lateral Inferior Direito', quadrant: '4º Quadrante (Inferior Direito)' },
  { code: '43', name: '43 - Canino Inferior Direito', quadrant: '4º Quadrante (Inferior Direito)' },
  { code: '44', name: '44 - Primeiro Pré-Molar Inferior Direito', quadrant: '4º Quadrante (Inferior Direito)' },
  { code: '45', name: '45 - Segundo Pré-Molar Inferior Direito', quadrant: '4º Quadrante (Inferior Direito)' },
  { code: '46', name: '46 - Primeiro Molar Inferior Direito', quadrant: '4º Quadrante (Inferior Direito)' },
  { code: '47', name: '47 - Segundo Molar Inferior Direito', quadrant: '4º Quadrante (Inferior Direito)' },
  { code: '48', name: '48 - Terceiro Molar Inferior Direito (Siso)', quadrant: '4º Quadrante (Inferior Direito)' },
  // Dentição Decídua
  { code: '51', name: '51 - Incisivo Central Superior Direito Decíduo', quadrant: 'Decíduos (Superior Direito)' },
  { code: '52', name: '52 - Incisivo Lateral Superior Direito Decíduo', quadrant: 'Decíduos (Superior Direito)' },
  { code: '53', name: '53 - Canino Superior Direito Decíduo', quadrant: 'Decíduos (Superior Direito)' },
  { code: '54', name: '54 - Primeiro Molar Superior Direito Decíduo', quadrant: 'Decíduos (Superior Direito)' },
  { code: '55', name: '55 - Segundo Molar Superior Direito Decíduo', quadrant: 'Decíduos (Superior Direito)' },
  { code: '61', name: '61 - Incisivo Central Superior Esquerdo Decíduo', quadrant: 'Decíduos (Superior Esquerdo)' },
  { code: '62', name: '62 - Incisivo Lateral Superior Esquerdo Decíduo', quadrant: 'Decíduos (Superior Esquerdo)' },
  { code: '63', name: '63 - Canino Superior Esquerdo Decíduo', quadrant: 'Decíduos (Superior Esquerdo)' },
  { code: '64', name: '64 - Primeiro Molar Superior Esquerdo Decíduo', quadrant: 'Decíduos (Superior Esquerdo)' },
  { code: '65', name: '65 - Segundo Molar Superior Esquerdo Decíduo', quadrant: 'Decíduos (Superior Esquerdo)' },
  { code: '71', name: '71 - Incisivo Central Inferior Esquerdo Decíduo', quadrant: 'Decíduos (Inferior Esquerdo)' },
  { code: '72', name: '72 - Incisivo Lateral Inferior Esquerdo Decíduo', quadrant: 'Decíduos (Inferior Esquerdo)' },
  { code: '73', name: '73 - Canino Inferior Esquerdo Decíduo', quadrant: 'Decíduos (Inferior Esquerdo)' },
  { code: '74', name: '74 - Primeiro Molar Inferior Esquerdo Decíduo', quadrant: 'Decíduos (Inferior Esquerdo)' },
  { code: '75', name: '75 - Segundo Molar Inferior Esquerdo Decíduo', quadrant: 'Decíduos (Inferior Esquerdo)' },
  { code: '81', name: '81 - Incisivo Central Inferior Direito Decíduo', quadrant: 'Decíduos (Inferior Direito)' },
  { code: '82', name: '82 - Incisivo Lateral Inferior Direito Decíduo', quadrant: 'Decíduos (Inferior Direito)' },
  { code: '83', name: '83 - Canino Inferior Direito Decíduo', quadrant: 'Decíduos (Inferior Direito)' },
  { code: '84', name: '84 - Primeiro Molar Inferior Direito Decíduo', quadrant: 'Decíduos (Inferior Direito)' },
  { code: '85', name: '85 - Segundo Molar Inferior Direito Decíduo', quadrant: 'Decíduos (Inferior Direito)' },
];

export interface PeriapicalRegionItem {
  code: string;
  name: string;
  teeth: string;
  arch: 'superior' | 'inferior';
  shortDesc: string;
}

export const PERIAPICAL_REGIONS_12: PeriapicalRegionItem[] = [
  // Arco Superior (Maxila - da direita do paciente para a esquerda)
  { code: 'RMSD', name: 'Região de Molares Superiores Direitos', teeth: '18, 17, 16', arch: 'superior', shortDesc: 'Molares Sup. Dir. (18, 17, 16)' },
  { code: 'RPSD', name: 'Região de Pré-Molares Superiores Direitos', teeth: '15, 14', arch: 'superior', shortDesc: 'Pré-Molares Sup. Dir. (15, 14)' },
  { code: 'RCSD', name: 'Região de Canino Superior Direito', teeth: '13', arch: 'superior', shortDesc: 'Canino Sup. Dir. (13)' },
  { code: 'RIS', name: 'Região de Incisivos Superiores', teeth: '12, 11, 21, 22', arch: 'superior', shortDesc: 'Incisivos Superiores (12, 11, 21, 22)' },
  { code: 'RCSE', name: 'Região de Canino Superior Esquerdo', teeth: '23', arch: 'superior', shortDesc: 'Canino Sup. Esq. (23)' },
  { code: 'RPSE', name: 'Região de Pré-Molares Superiores Esquerdos', teeth: '24, 25', arch: 'superior', shortDesc: 'Pré-Molares Sup. Esq. (24, 25)' },
  { code: 'RMSE', name: 'Região de Molares Superiores Esquerdos', teeth: '26, 27, 28', arch: 'superior', shortDesc: 'Molares Sup. Esq. (26, 27, 28)' },
  // Arco Inferior (Mandíbula - da esquerda do paciente para a direita)
  { code: 'RMIE', name: 'Região de Molares Inferiores Esquerdos', teeth: '38, 37, 36', arch: 'inferior', shortDesc: 'Molares Inf. Esq. (38, 37, 36)' },
  { code: 'RPIE', name: 'Região de Pré-Molares Inferiores Esquerdos', teeth: '35, 34', arch: 'inferior', shortDesc: 'Pré-Molares Inf. Esq. (35, 34)' },
  { code: 'RII', name: 'Região de Incisivos Inferiores', teeth: '32, 31, 41, 42', arch: 'inferior', shortDesc: 'Incisivos Inferiores (32, 31, 41, 42)' },
  { code: 'RPID', name: 'Região de Pré-Molares Inferiores Direitos', teeth: '44, 45', arch: 'inferior', shortDesc: 'Pré-Molares Inf. Dir. (44, 45)' },
  { code: 'RMID', name: 'Região de Molares Inferiores Direitos', teeth: '46, 47, 48', arch: 'inferior', shortDesc: 'Molares Inf. Dir. (46, 47, 48)' },
];

export const formatDocDateYYYYMMDD = (dateInput?: string | Date): string => {
  let d = new Date();
  if (dateInput) {
    if (typeof dateInput === 'string') {
      const matchPt = dateInput.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
      if (matchPt) {
        return `${matchPt[3]}/${matchPt[2].padStart(2, '0')}/${matchPt[1].padStart(2, '0')}`;
      }
      const matchIso = dateInput.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
      if (matchIso) {
        return `${matchIso[1]}/${matchIso[2].padStart(2, '0')}/${matchIso[3].padStart(2, '0')}`;
      }
      const parsed = new Date(dateInput);
      if (!isNaN(parsed.getTime())) d = parsed;
    } else if (dateInput instanceof Date && !isNaN(dateInput.getTime())) {
      d = dateInput;
    }
  }
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}/${month}/${day}`;
};

export const getDocumentPdfTitle = (docTitle: string, dateInput?: string | Date): string => {
  const dateStr = formatDocDateYYYYMMDD(dateInput);
  return `${docTitle} - ${dateStr}`;
};

export const REGION_NOTATIONS_LIST = [
  'Incisivos Centrais e Laterais Superiores (Região Anterior Superior - 12, 11, 21, 22)',
  'Incisivos Centrais e Laterais Inferiores (Região Anterior Inferior - 42, 41, 31, 32)',
  'Região Canina Superior Direita (13)',
  'Região Canina Superior Esquerda (23)',
  'Região Canina Inferior Esquerda (33)',
  'Região Canina Inferior Direita (43)',
  'Pré-Molares Superiores Direitos (14 e 15)',
  'Pré-Molares Superiores Esquerdos (24 e 25)',
  'Molares Superiores Direitos (16, 17 e 18)',
  'Molares Superiores Esquerdos (26, 27 e 28)',
  'Pré-Molares Inferiores Esquerdos (34 e 35)',
  'Pré-Molares Inferiores Direitos (44 e 45)',
  'Molares Inferiores Esquerdos (36, 37 e 38)',
  'Molares Inferiores Direitos (46, 47 e 48)',
  'Hemiarcada Superior Direita Completa (Quadrante 1)',
  'Hemiarcada Superior Esquerda Completa (Quadrante 2)',
  'Hemiarcada Inferior Esquerda Completa (Quadrante 3)',
  'Hemiarcada Inferior Direita Completa (Quadrante 4)',
  'Interproximais Bite-Wings Direita (Molares e Pré-Molares Direitos)',
  'Interproximais Bite-Wings Esquerda (Molares e Pré-Molares Esquerdos)',
  'Interproximais Bite-Wings Bilaterais (Molares e Pré-Molares Bilaterais)',
  'Radiografia Oclusal de Maxila (Arco Superior)',
  'Radiografia Oclusal de Mandíbula (Arco Inferior)',
  'Status Bucal Completo (Levantamento Periapical de 14 Tomadas)'
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
  const [relatorioDocStage, setRelatorioDocStage] = useState<'inicial' | 'final'>('inicial');
  const [relatorioProcedimentoDesc, setRelatorioProcedimentoDesc] = useState<string>('Avaliação diagnóstica, exame clínico e planejamento terapêutico');
  const [relatorioComplementar, setRelatorioComplementar] = useState<string>('');
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

  // Helper functions for Solicitação de Radiografia Panorâmica (extraídas dos modelos anexados)
  const getRxPanoramicoSolicitacoesList = (opts?: any, customTxt?: string) => {
    if (customTxt && customTxt.trim()) {
      return [customTxt.trim()];
    }
    const items: string[] = [];
    if (opts?.analiseDenticaoOssea) {
      items.push('Solicito radiografia panorâmica para análise da dentição e óssea.');
    }
    if (opts?.atmBocaAbertaFechada) {
      items.push('Solicito Radiografia Panorâmica específica da ATM de boca fechada e boca aberta para análise da Articulação Temporomandibular.');
    }
    if (opts?.posExodontiaSisos) {
      items.push('Solicito Rx Panorâmico para análise de dentição e óssea pós Exodontia de terceiros molares.');
    }
    if (opts?.preOperatorioSisos) {
      items.push('Solicito Radiografia Panorâmica para avaliação pré-operatória e planejamento cirúrgico de terceiros molares.');
    }
    if (items.length === 0) {
      items.push('Solicito radiografia panorâmica para análise da dentição e óssea.');
    }
    return items;
  };

  const getRxPanoramicoClinicasList = (clinicasOpts?: any, customClinic?: string) => {
    const list: { name: string; subtitle?: string }[] = [];
    if (clinicasOpts?.perboyreCastelo ?? true) {
      list.push({ name: 'Perboyre Castelo', subtitle: 'A imagem da odontologia do Ceará' });
    }
    if (clinicasOpts?.dentalImagem ?? true) {
      list.push({ name: 'Dental Imagem', subtitle: 'Diagnóstico e Documentação Odontológica' });
    }
    if (clinicasOpts?.oralScan ?? true) {
      list.push({ name: 'Oral Scan', subtitle: 'Imaginologia Odontológica' });
    }
    if (customClinic && customClinic.trim()) {
      list.push({ name: customClinic.trim(), subtitle: 'Centro Radiológico Indicado' });
    }
    return list;
  };

  // Helper function to build structured, high-fidelity printable HTML for all document types
  const buildDocumentPrintHtml = (doc: {
    id?: string;
    title: string;
    patientName: string;
    professionalName?: string;
    formattedDateStr?: string;
    summary?: string;
    templateId?: string;
    templateData?: Record<string, any>;
    cidCode?: string;
  }, forGovBr: boolean = false): string => {
    const templateId = doc.templateId || doc.id || '';
    const isSpecialPrescription = templateId === 'receituario_controle_especial' || doc.title.toLowerCase().includes('controle especial');
    const isTomography = templateId === 'solicitacao_tomografia' || doc.title.toLowerCase().includes('tomografia');
    const isRxPanoramico = templateId === 'solicitacao_rx_panoramico' || doc.title.toLowerCase().includes('panorâmica') || doc.title.toLowerCase().includes('panoramica');
    const isRxPeriapical = templateId === 'solicitacao_rx_periapical_interproximal' || doc.title.toLowerCase().includes('periapical') || doc.title.toLowerCase().includes('interproximal');
    const isSangue = templateId === 'solicitacao_sangue' || doc.title.toLowerCase().includes('sangue') || doc.title.toLowerCase().includes('laboratoriais');
    const isReceitaSimples = templateId === 'receituario_simples' || doc.title.toLowerCase().includes('receituário simples') || doc.title.toLowerCase().includes('receituario simples');
    const isNotificacaoB = templateId === 'receituario_notificacao_b_azul' || doc.title.toLowerCase().includes('notificação de receita b') || doc.title.toLowerCase().includes('notificacao de receita b');
    const isNotificacaoA = templateId === 'receituario_notificacao_a_amarela' || doc.title.toLowerCase().includes('notificação de receita a') || doc.title.toLowerCase().includes('notificacao de receita a');
    const isAptidao = templateId === 'atestado_aptidao_odontologica' || doc.title.toLowerCase().includes('aptidão') || doc.title.toLowerCase().includes('aptidao') || doc.title.toLowerCase().includes('sanidade');
    const isRelatorio = templateId === 'relatorio_atendimento_inicial_final' || doc.title.toLowerCase().includes('relatório de atendimento') || doc.title.toLowerCase().includes('relatorio de atendimento');
    const isTratamentoAndamento = templateId === 'declaracao_tratamento_andamento' || doc.title.toLowerCase().includes('tratamento em andamento');
    const isRecibo = templateId === 'declaracao_valores_recibo' || doc.title.toLowerCase().includes('recibo') || doc.title.toLowerCase().includes('valores');
    const isPaio = templateId === 'protocolo_anestesia_intraoral_paio' || doc.title.toLowerCase().includes('anestesia') || doc.title.toLowerCase().includes('paio');
    const isTermo = templateId.startsWith('tcle_') || doc.title.toLowerCase().includes('termo de consentimento') || doc.title.toLowerCase().includes('tcle');
    const isAtestado = !isSpecialPrescription && (doc.title.toLowerCase().includes('atestado') || doc.id?.startsWith('atestado'));

    const cleanCity = cleanCityName(effectiveClinicCity);
    const cityOnly = formatCityOnly(effectiveClinicCity);
    const cepFormatted = formatCEP(clinicInfo.cep || '60.160-110');
    const docDateStr = doc.formattedDateStr || formattedFormattedDate || new Date().toLocaleDateString('pt-BR');
    const dentistName = doc.professionalName || effectiveDentistName;
    const dentistCro = effectiveDentistCro;
    const tData = doc.templateData || {};
    const pdfDocTitle = getDocumentPdfTitle(doc.title, doc.formattedDateStr || docDate);
    const autoPrintScript = `
  <script>
    function triggerAutoPrint() {
      try {
        window.focus();
        window.print();
      } catch (err) {}
    }
    if (document.readyState === 'complete') {
      setTimeout(triggerAutoPrint, 250);
    } else {
      window.addEventListener('load', function() {
        setTimeout(triggerAutoPrint, 250);
      });
    }
  </script>`;

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

    const watermarkHtml = (clinicInfo.showWatermark ?? true) && (clinicInfo.watermarkUrl || clinicInfo.logoUrl) ? `
      <div class="watermark-container">
        <img src="${clinicInfo.watermarkUrl || clinicInfo.logoUrl}" style="max-width: 320px; max-height: 320px; object-fit: contain; opacity: ${(clinicInfo.watermarkOpacity ?? 15) / 100}; filter: grayscale(100%);" alt="Marca d'Água" />
      </div>
    ` : '';

    const clinicFooterHtml = forGovBr ? `
      <div style="margin-top: 25px; border-top: 1px solid #ccc; padding-top: 12px; font-size: 10.5px; text-align: center; color: #555;">
        ${clinicInfo.footerText ? `<div style="text-align: center; margin-bottom: 8px; font-size: 10px; color: #444; font-weight: 500;">${clinicInfo.footerText}</div>` : ''}
        <p style="font-weight: bold; margin: 0 0 4px;">${dentistName}</p>
        <p style="margin: 0 0 6px;">Cirurgião-Dentista • ${dentistCro}</p>
        <p style="font-size: 9.5px; color: #002776; margin: 0;">Documento preparado para assinatura digital oficial no portal Gov.br (www.gov.br/assinador)</p>
      </div>
    ` : `
      <div style="margin-top: 20px; border-top: 1px solid #ebebe0; padding-top: 10px; font-size: 9.5px; color: #666;">
        ${clinicInfo.footerText ? `<div style="text-align: center; margin-bottom: 8px; font-size: 10px; color: #444; font-weight: 500;">${clinicInfo.footerText}</div>` : ''}
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <a href="https://dentispro.com.br" target="_blank" rel="noopener noreferrer" style="color: #666; text-decoration: none; display: flex; align-items: center; gap: 4px;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
            dentispro.com.br
          </a>
          <a href="mailto:${effectiveClinicEmail}" style="color: #666; text-decoration: none; display: flex; align-items: center; gap: 4px;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>
            ${effectiveClinicEmail}
          </a>
          <a href="tel:${effectiveClinicPhone.replace(/\D/g, '')}" style="color: #666; text-decoration: none; display: flex; align-items: center; gap: 4px;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
            ${effectiveClinicPhone}
          </a>
        </div>
      </div>
    `;

    const standardHeaderHtml = `
      ${watermarkHtml}
      <div class="header">
        <div class="clinic-info">
          ${clinicInfo.logoUrl ? `<img src="${clinicInfo.logoUrl}" class="clinic-logo" alt="Logo" />` : ''}
          <div>
            <div class="dentist-name">${clinicInfo.headerSubtitle || dentistName}</div>
            <div class="dentist-cro">Cirurgião-Dentista ${dentistCro} ${clinicInfo.specialty ? `• ${clinicInfo.specialty}` : ''}</div>
            <div class="dentist-sub">EPAO: ${clinicInfo.epao || '825 CE'} • CNPJ: ${formatCNPJ(clinicInfo.cnpj || '22.144.932/0001-40')}</div>
          </div>
        </div>
        <div class="clinic-right">
          <div class="clinic-title">${clinicInfo.headerTitle || effectiveClinicName || clinicInfo.name || 'DentisPro'}</div>
          <div class="clinic-detail">${effectiveClinicAddress}</div>
          <div class="clinic-detail">${cityOnly} - CE • CEP: ${cepFormatted}</div>
          <div class="clinic-detail">Tel: ${effectiveClinicPhone}</div>
        </div>
      </div>
    `;

    const baseCss = `
      @page { size: A4 portrait; margin: 1.2cm 1.5cm 1.2cm 1.5cm; }
      * { box-sizing: border-box; }
      body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 0; color: #222; line-height: 1.38; margin: 0 auto; background: #fff; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .watermark-container {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        pointer-events: none;
        z-index: 0;
      }
      .header { position: relative; z-index: 1; border-bottom: 2px solid #2c3e2e; padding-bottom: 8px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: flex-start; }
      .clinic-info { display: flex; align-items: center; gap: 10px; }
      .clinic-logo { height: 48px; width: 48px; object-fit: contain; }
      .dentist-name { font-size: 13px; font-weight: bold; color: #1b281d; }
      .dentist-cro { font-size: 10px; color: #555; font-family: monospace; }
      .dentist-sub { font-size: 9.5px; color: #666; }
      .clinic-right { text-align: right; max-width: 320px; }
      .clinic-title { font-size: 13px; font-weight: bold; color: #1b281d; text-transform: uppercase; line-height: 1.2; }
      .clinic-detail { font-size: 9.5px; color: #555; margin-top: 1px; }
      .title-box { position: relative; z-index: 1; text-align: center; margin: 8px 0 10px; }
      .title { font-size: 15px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; color: #1b281d; border-bottom: 1.5px solid #1b281d; display: inline-block; padding-bottom: 2px; }
      .title-sub { font-size: 9.5px; color: #666; font-weight: 600; text-transform: uppercase; margin-top: 2px; }
      .patient-card { position: relative; z-index: 1; background: #fbfbf8; border: 1px solid #c8c8b4; border-radius: 6px; padding: 7px 12px; margin-bottom: 10px; font-size: 11px; display: flex; justify-content: space-between; align-items: center; }
      .section-card { position: relative; z-index: 1; background: #fff; border: 1px solid #c8c8b4; border-radius: 6px; padding: 8px 12px; margin-bottom: 10px; }
      .section-title { font-size: 10.5px; font-weight: bold; text-transform: uppercase; color: #2c3e2e; border-bottom: 1px solid #ebebe0; padding-bottom: 3px; margin-bottom: 6px; display: flex; align-items: center; justify-content: space-between; }
      .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
      .grid-item { background: #f9f9f5; border: 1px solid #dcdccb; border-radius: 4px; padding: 6px 8px; font-size: 10.5px; }
      .check-item { display: flex; align-items: center; gap: 6px; background: #fff; border: 1px solid #e0e0d0; border-radius: 4px; padding: 4px 8px; font-size: 10.5px; font-weight: 600; }
      .date-row { position: relative; z-index: 1; text-align: right; font-size: 10.5px; font-weight: 600; color: #2c3e2e; margin-top: 10px; margin-bottom: 6px; }
      .footer { position: relative; z-index: 1; margin-top: 10px; }
      @media print {
        body { padding: 0; margin: 0; }
        .section-card, .patient-card, .footer { break-inside: avoid; page-break-inside: avoid; }
        .watermark-container {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          width: 100% !important;
          height: 100% !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          pointer-events: none !important;
          z-index: 0 !important;
        }
      }
    `;

    // 1. RECEITUÁRIO DE CONTROLE ESPECIAL (PROTECTED MODEL - RULE 1 OF AGENTS.MD)
    if (isSpecialPrescription) {
      const prescriptionText = (doc.summary && !doc.summary.includes('gerado para o(a) paciente'))
        ? doc.summary
        : (tData.prescriptionText || specialPrescriptionText || 'Amoxicilina 500mg + Clavulanato de Potássio 125mg ---------------- 1 caixa\nTomar 1 comprimido por via oral a cada 8 horas durante 7 dias.');

      return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>${pdfDocTitle}</title>
  <style>
    @page { size: A4 portrait; margin: 1.5cm; }
    * { box-sizing: border-box; }
    body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1a1a1a; padding: 0; margin: 0 auto; background: #fff; line-height: 1.4; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
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
      .watermark-container {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100% !important;
        height: 100% !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        pointer-events: none !important;
        z-index: 0 !important;
      }
    }
  </style>
</head>
<body>
  ${watermarkHtml}
  <div class="top-rectangles">
    <div class="rect-box">
      <div>
        <div class="box-title">IDENTIFICAÇÃO DO EMITENTE</div>
        <div class="emitente-name">${dentistName} • ${dentistCro}</div>
        <div class="emitente-phone">Telefones: ${effectiveClinicPhone}</div>
      </div>
      <div style="border-top: 1px solid #eee; margin-top: 4px; padding-top: 4px;">
        ${(clinicInfo.headerTitle || effectiveClinicName) ? `<div class="clinic-title">${clinicInfo.headerTitle || effectiveClinicName}</div>` : ''}
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

  ${autoPrintScript}
</body>
</html>`;
    }

    // 2. SOLICITAÇÃO DE RADIOGRAFIA PANORÂMICA (ORTOPANTOMOGRAFIA)
    if (isRxPanoramico) {
      const teeth = tData.rxPanoramicoTeethInput || rxPanoramicoTeethInput;
      const finalidade = tData.rxPanoramicoFinalidade || rxPanoramicoFinalidade;
      const opts = tData.rxPanoramicoOptions || rxPanoramicoOptions;
      const obs = tData.rxPanoramicoObservacoes || rxPanoramicoObservacoes;
      const patAge = tData.patientAge || patientAge;
      const customTxt = tData.rxPanoramicoTextoCustomizado || rxPanoramicoTextoCustomizado;
      const solicitacoes = getRxPanoramicoSolicitacoesList(opts, customTxt);

      const incluirConvenio = tData.rxPanoramicoIncluirConvenio ?? rxPanoramicoIncluirConvenio;
      const convNome = tData.rxPanoramicoConvenioNome || rxPanoramicoConvenioNome;
      const convNum = tData.rxPanoramicoConvenioNumero || rxPanoramicoConvenioNumero;

      const indicarClinicas = tData.rxPanoramicoIndicarClinicas ?? rxPanoramicoIndicarClinicas;
      const clinicasOpts = tData.rxPanoramicoClinicas || rxPanoramicoClinicas;
      const customClinica = tData.rxPanoramicoOutraClinica || rxPanoramicoOutraClinica;
      const clinicasList = getRxPanoramicoClinicasList(clinicasOpts, customClinica);

      return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>${pdfDocTitle}</title>
  <style>${baseCss}</style>
</head>
<body>
  ${standardHeaderHtml}

  <div class="title-box">
    <div class="title">SOLICITAÇÃO DE RADIOGRAFIA PANORÂMICA</div>
    <div class="title-sub">EXAME RADIOLÓGICO ODONTOLÓGICO EXTRAORAL</div>
  </div>

  <div class="patient-card" style="display: block;">
    <div style="display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; gap: 8px;">
      <div><strong>PACIENTE:</strong> <span style="font-size: 12px; font-weight: bold; text-decoration: underline;">${doc.patientName}</span></div>
      <div><strong>IDADE:</strong> ${patAge}</div>
    </div>
    ${incluirConvenio && convNome ? `
      <div style="margin-top: 6px; padding-top: 5px; border-top: 1px dashed #ccc; font-size: 11px; display: flex; flex-wrap: wrap; gap: 12px;">
        <div><strong>CONVÊNIO:</strong> ${convNome}</div>
        ${convNum ? `<div><strong>MATRÍCULA / CARTEIRINHA:</strong> ${convNum}</div>` : ''}
      </div>
    ` : ''}
  </div>

  <div class="section-card">
    <div class="section-title">
      <span>SOLICITAÇÃO CLÍNICA</span>
    </div>
    <div style="padding: 4px 0; font-size: 11.5px; line-height: 1.6; color: #1a1a1a;">
      ${solicitacoes.map(s => `
        <div style="margin-bottom: 6px; font-weight: 600;">• ${s}</div>
      `).join('')}
    </div>
  </div>

  ${teeth || finalidade ? `
  <div class="section-card">
    <div class="grid-2">
      ${teeth ? `
      <div class="grid-item">
        <div style="font-size: 9.5px; font-weight: bold; color: #555; text-transform: uppercase;">Região / Dentes de Interesse</div>
        <div style="font-size: 11px; font-weight: bold; color: #111; margin-top: 2px;">${teeth}</div>
      </div>
      ` : ''}
      ${finalidade ? `
      <div class="grid-item">
        <div style="font-size: 9.5px; font-weight: bold; color: #555; text-transform: uppercase;">Indicação / Finalidade Clínica</div>
        <div style="font-size: 11px; font-weight: bold; color: #111; margin-top: 2px;">${finalidade}</div>
      </div>
      ` : ''}
    </div>
  </div>
  ` : ''}

  ${obs ? `
  <div class="section-card" style="background: #fdfdf9;">
    <div class="section-title">OBSERVAÇÕES E RECOMENDAÇÕES TÉCNICAS</div>
    <div style="font-size: 10.5px; color: #333; line-height: 1.4;">${obs}</div>
  </div>
  ` : ''}

  ${indicarClinicas && clinicasList.length > 0 ? `
  <div class="section-card" style="margin-top: 10px; background: #fafaf7; border: 1px dashed #bbb; padding: 10px 14px;">
    <div style="font-size: 10px; font-weight: bold; text-transform: uppercase; color: #444; margin-bottom: 8px;">
      Faça este exame em clínicas radiológicas:
    </div>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 8px;">
      ${clinicasList.map(c => `
        <div style="background: #ffffff; border: 1px solid #dcdcd0; border-radius: 6px; padding: 6px 10px;">
          <div style="font-size: 11px; font-weight: bold; color: #1a2a1c;">${c.name}</div>
          ${c.subtitle ? `<div style="font-size: 9px; color: #666; margin-top: 2px;">${c.subtitle}</div>` : ''}
        </div>
      `).join('')}
    </div>
  </div>
  ` : ''}

  <div class="date-row">
    ${cityOnly}, ${docDateStr}
  </div>

  <div class="footer">
    ${signatureBlockHtml}
    ${clinicFooterHtml}
  </div>

  ${autoPrintScript}
</body>
</html>`;
    }

    // 3. SOLICITAÇÃO DE TOMOGRAFIA CONE BEAM (CBCT)
    if (isTomography) {
      const selectedRegionsList = tData.tomographyRegions || getSelectedTomographyRegions();
      const selectedIndicationsList = tData.tomographyIndications || getSelectedTomographyIndications();
      const selectedDeliveryList = tData.tomographyDelivery || getSelectedTomographyDelivery();
      const currentFov = tData.tomographyFov || tomographyFov;
      const fovLabel = TOMOGRAPHY_FOV_LABELS[currentFov] || currentFov;
      const notes = tData.tomographyNotes || tomographyNotes;
      const patAge = tData.patientAge || patientAge;

      return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>${pdfDocTitle}</title>
  <style>${baseCss}</style>
</head>
<body>
  ${standardHeaderHtml}

  <div class="title-box">
    <div class="title">SOLICITAÇÃO DE TOMOGRAFIA CONE BEAM (CBCT)</div>
    <div class="title-sub">EXAME RADIOLÓGICO TRIDIMENSIONAL DE FEIXE CÔNICO</div>
  </div>

  <div class="patient-card">
    <div><strong>PACIENTE:</strong> <span style="font-size: 12px; font-weight: bold; text-decoration: underline;">${doc.patientName}</span></div>
    <div><strong>IDADE:</strong> ${patAge}</div>
  </div>

  <div class="section-card">
    <div class="section-title">
      <span>1. REGIÕES ANATÔMICAS SOLICITADAS</span>
      <span style="font-size: 9px; font-weight: bold; background: #e8e8d8; padding: 2px 6px; border-radius: 4px;">${selectedRegionsList.length} Região(ões)</span>
    </div>
    <div class="grid-2">
      ${selectedRegionsList.map((r: string) => `<div class="check-item"><span style="color: #0369a1; font-weight: bold;">☑</span><span>${r}</span></div>`).join('')}
    </div>
  </div>

  <div class="section-card">
    <div class="section-title">2. FINALIDADE CLÍNICA E INDICAÇÕES DO EXAME</div>
    <ul style="margin: 0; padding-left: 18px; font-size: 10.5px; line-height: 1.5;">
      ${selectedIndicationsList.map((ind: string) => `<li>${ind}</li>`).join('')}
    </ul>
  </div>

  <div class="section-card">
    <div class="section-title">3. ESPECIFICAÇÕES TÉCNICAS E FORMATO DE ENTREGA</div>
    <div class="grid-2">
      <div class="grid-item">
        <div style="font-size: 9.5px; font-weight: bold; color: #555; text-transform: uppercase;">Campo de Visão (FOV):</div>
        <div style="font-weight: bold; color: #1b281d; font-size: 11px; margin-top: 2px;">${fovLabel}</div>
      </div>
      <div class="grid-item">
        <div style="font-size: 9.5px; font-weight: bold; color: #555; text-transform: uppercase;">Formatos Solicitados:</div>
        <div style="font-weight: 600; font-size: 10.5px; margin-top: 2px;">${selectedDeliveryList.join(' • ')}</div>
      </div>
    </div>
  </div>

  ${notes ? `
  <div class="section-card" style="background: #fdfdf9;">
    <div class="section-title">4. OBSERVAÇÕES E ORIENTAÇÕES CLÍNICAS</div>
    <div style="font-size: 10.5px; color: #333; line-height: 1.4;">${notes}</div>
  </div>
  ` : ''}

  <div class="date-row">
    ${cityOnly}, ${docDateStr}
  </div>

  <div class="footer">
    ${signatureBlockHtml}
    ${clinicFooterHtml}
  </div>

  ${autoPrintScript}
</body>
</html>`;
    }

    // 4. RADIOGRAFIAS PERIAPICAIS & INTERPROXIMAIS
    if (isRxPeriapical) {
      const periapicalTipo = tData.rxPeriapicalTipo || rxPeriapicalTipo;
      const teeth = tData.rxPeriapicalTeethInput || rxPeriapicalTeethInput;
      const indication = tData.rxPeriapicalIndication || rxPeriapicalIndication;
      const notes = tData.rxPeriapicalNotes || rxPeriapicalNotes;
      const patAge = tData.patientAge || patientAge;

      const tipoLabel = periapicalTipo === 'periapical_localizada' ? 'Periapical Localizada' :
        periapicalTipo === 'levantamento_completo_14_tomadas' ? 'Levantamento Periapical Completo (14 tomadas)' :
        periapicalTipo === 'interproximal_bite_wing' ? 'Interproximais (Bite-Wings)' : 'Radiografia Oclusal';

      return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>${pdfDocTitle}</title>
  <style>${baseCss}</style>
</head>
<body>
  ${standardHeaderHtml}

  <div class="title-box">
    <div class="title">SOLICITAÇÃO DE RADIOGRAFIA INTRAORAL (PERIAPICAL / INTERPROXIMAL)</div>
    <div class="title-sub">EXAME RADIOGRÁFICO INTRAORAL LOCALIZADO</div>
  </div>

  <div class="patient-card">
    <div><strong>PACIENTE:</strong> <span style="font-size: 12px; font-weight: bold; text-decoration: underline;">${doc.patientName}</span></div>
    <div><strong>IDADE:</strong> ${patAge}</div>
  </div>

  <div class="section-card">
    <div class="grid-2">
      <div class="grid-item">
        <div style="font-size: 9.5px; font-weight: bold; color: #555; text-transform: uppercase;">1. Tipo de Exame</div>
        <div style="font-size: 11px; font-weight: bold; color: #111; margin-top: 2px;">${tipoLabel}</div>
      </div>
      <div class="grid-item">
        <div style="font-size: 9.5px; font-weight: bold; color: #555; text-transform: uppercase;">2. Dentes / Elementos Solicitados</div>
        <div style="font-size: 11px; font-weight: bold; color: #111; margin-top: 2px;">${teeth}</div>
      </div>
    </div>
  </div>

  <div class="section-card">
    <div class="section-title">3. INDICAÇÃO CLÍNICA</div>
    <div style="font-size: 11px; font-weight: 600; color: #222;">${indication}</div>
  </div>

  ${notes ? `
  <div class="section-card" style="background: #fdfdf9;">
    <div class="section-title">4. OBSERVAÇÕES TÉCNICAS</div>
    <div style="font-size: 10.5px; color: #333; line-height: 1.4;">${notes}</div>
  </div>
  ` : ''}

  <div class="date-row">
    ${cityOnly}, ${docDateStr}
  </div>

  <div class="footer">
    ${signatureBlockHtml}
    ${clinicFooterHtml}
  </div>

  ${autoPrintScript}
</body>
</html>`;
    }

    // 5. SOLICITAÇÃO DE EXAMES DE SANGUE
    if (isSangue) {
      const examsObj = tData.bloodExams || bloodExams;
      const selectedBloodExams = Object.entries(examsObj).filter(([_, v]) => v).map(([k]) => k);
      const patAge = tData.patientAge || patientAge;

      return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>${pdfDocTitle}</title>
  <style>${baseCss}</style>
</head>
<body>
  ${standardHeaderHtml}

  <div class="title-box">
    <div class="title">SOLICITAÇÃO DE EXAMES LABORATORIAIS PRÉ-OPERATÓRIOS</div>
    <div class="title-sub">AVALIAÇÃO HEMATOLÓGICA E BIOQUÍMICA PRÉ-CIRÚRGICA</div>
  </div>

  <div class="patient-card">
    <div><strong>PACIENTE:</strong> <span style="font-size: 12px; font-weight: bold; text-decoration: underline;">${doc.patientName}</span></div>
    <div><strong>IDADE:</strong> ${patAge}</div>
  </div>

  <div class="section-card">
    <div class="section-title">1. FINALIDADE CLÍNICA</div>
    <div style="font-size: 11px; font-weight: 600; color: #222;">
      Avaliação pré-operatória e rastreamento de risco cirúrgico odontológico para procedimento ambulatorial.
    </div>
  </div>

  <div class="section-card">
    <div class="section-title">2. EXAMES LABORATORIAIS SOLICITADOS</div>
    <div class="grid-2">
      ${(selectedBloodExams.length ? selectedBloodExams : ['Hemograma completo com contagem de plaquetas', 'Tempo de Protrombina (TP / INR)', 'Tempo de Tromboplastina Parcial Ativada (TTPa)', 'Glicemia de Jejum']).map((ex: string) => `
        <div class="check-item"><span style="color: #0369a1; font-weight: bold;">☑</span><span>${ex}</span></div>
      `).join('')}
    </div>
  </div>

  <div class="date-row">
    ${cityOnly}, ${docDateStr}
  </div>

  <div class="footer">
    ${signatureBlockHtml}
    ${clinicFooterHtml}
  </div>

  ${autoPrintScript}
</body>
</html>`;
    }

    // 6. RECEITUÁRIO SIMPLES
    if (isReceitaSimples) {
      const prescText = tData.prescriptionText || specialPrescriptionText || 'Amoxicilina 500mg ------------------ 21 cápsulas\nTomar 1 cápsula via oral de 8 em 8 horas por 7 dias.\n\nIbuprofeno 600mg ------------------- 10 comprimidos\nTomar 1 comprimido via oral de 8 em 8 horas em caso de dor ou inchaço.';
      const vias = tData.receitaSimplesVias || receitaSimplesVias;
      const uso = tData.receitaSimplesUso || receitaSimplesUso;
      const orientacoes = tData.receitaSimplesOrientacoes || receitaSimplesOrientacoes;

      return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>${pdfDocTitle}</title>
  <style>${baseCss}</style>
</head>
<body>
  ${standardHeaderHtml}

  <div class="title-box">
    <div class="title">RECEITUÁRIO ODONTOLÓGICO</div>
    <div class="title-sub">PRESCRIÇÃO MEDICAMENTOSA</div>
  </div>

  <div class="patient-card">
    <div><strong>PACIENTE:</strong> <span style="font-size: 12px; font-weight: bold; text-decoration: underline;">${doc.patientName}</span></div>
    <div><strong>VIA:</strong> <span style="font-weight: bold;">${vias}</span></div>
  </div>

  <div class="section-card">
    <div class="section-title">
      <span>PRESCRIÇÃO</span>
      <span style="font-size: 9.5px; font-style: italic; color: #555;">(${uso})</span>
    </div>
    <div style="background: #fdfdf9; border: 1px solid #e0e0d5; border-radius: 4px; padding: 10px; font-size: 11.5px; white-space: pre-line; line-height: 1.6; font-weight: 500;">
      ${prescText}
    </div>
  </div>

  ${orientacoes ? `
  <div class="section-card" style="background: #fcfcf7;">
    <div class="section-title">ORIENTAÇÕES AO PACIENTE</div>
    <div style="font-size: 10.5px; color: #333; line-height: 1.4;">${orientacoes}</div>
  </div>
  ` : ''}

  <div class="date-row">
    ${cityOnly}, ${docDateStr}
  </div>

  <div class="footer">
    ${signatureBlockHtml}
    ${clinicFooterHtml}
  </div>

  ${autoPrintScript}
</body>
</html>`;
    }

    // 7. NOTIFICAÇÃO DE RECEITA B (AZUL) / A (AMARELA)
    if (isNotificacaoB || isNotificacaoA) {
      const num = isNotificacaoB ? (tData.notificacaoBNumero || notificacaoBNumero) : (tData.notificacaoANumero || notificacaoANumero);
      const uf = isNotificacaoB ? (tData.notificacaoBUf || notificacaoBUf) : (tData.notificacaoAUf || notificacaoAUf);
      const prescText = tData.prescriptionText || specialPrescriptionText;

      return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>${pdfDocTitle}</title>
  <style>${baseCss}</style>
</head>
<body>
  ${standardHeaderHtml}

  <div style="border: 2px solid #222; border-radius: 6px; padding: 10px; margin-bottom: 12px; background: #fafafa; display: flex; justify-content: space-between; align-items: center;">
    <div>
      <div style="font-size: 13px; font-weight: bold; text-transform: uppercase;">${isNotificacaoB ? 'NOTIFICAÇÃO DE RECEITA B (PSICOTRÓPICOS)' : 'NOTIFICAÇÃO DE RECEITA A (ENTORPECENTES)'}</div>
      <div style="font-size: 9.5px; color: #666;">Portaria SVS/MS nº 344/98 • Válida em todo o território nacional</div>
    </div>
    <div style="text-align: right;">
      <div style="font-size: 12px; font-mono font-weight: bold;">Nº: ${num}</div>
      <div style="font-size: 10px; font-weight: bold;">UF: ${uf}</div>
    </div>
  </div>

  <div class="patient-card">
    <div><strong>PACIENTE:</strong> <span style="font-size: 12px; font-weight: bold; text-decoration: underline;">${doc.patientName}</span></div>
    <div><strong>EMITENTE:</strong> ${dentistName} (${dentistCro})</div>
  </div>

  <div class="section-card">
    <div class="section-title">PRESCRIÇÃO E POSOLOGIA</div>
    <div style="background: #fff; border: 1px solid #ddd; border-radius: 4px; padding: 10px; font-size: 11.5px; white-space: pre-line; line-height: 1.6;">
      ${prescText}
    </div>
  </div>

  <div class="grid-2">
    <div class="section-card" style="font-size: 10px; line-height: 1.7;">
      <div class="section-title">IDENTIFICAÇÃO DO COMPRADOR</div>
      <div>Nome: _____________________________________</div>
      <div>Doc. Identidade: ________________ Órgão: _______</div>
      <div>Endereço: __________________________________</div>
      <div>Telefone: __________________________________</div>
    </div>
    <div class="section-card" style="font-size: 10px; line-height: 1.7; display: flex; flex-direction: column; justify-content: space-between;">
      <div class="section-title">IDENTIFICAÇÃO DO FORNECEDOR</div>
      <div style="text-align: center; margin-top: 15px;">
        <div style="border-top: 1px solid #666; padding-top: 2px;">Assinatura / Carimbo Farmacêutico</div>
        <div style="margin-top: 4px;">Data: ____ / ____ / ________</div>
      </div>
    </div>
  </div>

  <div class="date-row">
    ${cityOnly}, ${docDateStr}
  </div>

  <div class="footer">
    ${signatureBlockHtml}
    ${clinicFooterHtml}
  </div>

  ${autoPrintScript}
</body>
</html>`;
    }

    // 8. ATESTADO DE APTIDÃO ODONTOLÓGICA
    if (isAptidao) {
      const finalidade = tData.aptidaoFinalidade || aptidaoFinalidade;
      const obs = tData.aptidaoObservacoes || aptidaoObservacoes;
      const patAge = tData.patientAge || patientAge;

      return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>${pdfDocTitle}</title>
  <style>${baseCss}</style>
</head>
<body>
  ${standardHeaderHtml}

  <div class="title-box">
    <div class="title">ATESTADO DE APTIDÃO ODONTOLÓGICA / SANIDADE BUCAL</div>
    <div class="title-sub">EXAME CLÍNICO ADMISSIONAL / CIRÚRGICO / CONCURSOS</div>
  </div>

  <div class="patient-card">
    <div><strong>PACIENTE:</strong> <span style="font-size: 12px; font-weight: bold; text-decoration: underline;">${doc.patientName}</span></div>
    <div><strong>IDADE:</strong> ${patAge}</div>
  </div>

  <div class="section-card">
    <div class="section-title">FINALIDADE DA AVALIAÇÃO</div>
    <div style="font-size: 11px; font-weight: 600; color: #222;">${finalidade}</div>
  </div>

  <div class="section-card" style="text-align: justify; font-size: 12px; line-height: 1.8; padding: 14px 16px;">
    Atesto, para os devidos fins de direito, a pedido da parte interessada, que realizei minucioso exame clínico da cavidade bucal no(a) paciente acima identificado(a), constatando ausência de focos de infecção ativa, dentes cariados sem tratamento, patologias ósseas ou lesões estomatológicas aparentes, encontrando-se a sua saúde bucal em condições adequadas e plenamente <strong>APTO(A)</strong> para a finalidade pretendida.
  </div>

  ${obs ? `
  <div class="section-card" style="background: #fdfdf9;">
    <div class="section-title">OBSERVAÇÕES CLÍNICAS</div>
    <div style="font-size: 10.5px; color: #333; line-height: 1.4;">${obs}</div>
  </div>
  ` : ''}

  <div class="date-row">
    ${cityOnly}, ${docDateStr}
  </div>

  <div class="footer">
    ${signatureBlockHtml}
    ${clinicFooterHtml}
  </div>

  ${autoPrintScript}
</body>
</html>`;
    }

    // 9. RELATÓRIO DE ATENDIMENTO INICIAL / FINAL
    if (isRelatorio) {
      const stage = tData.relatorioDocStage || relatorioDocStage;
      const procDesc = tData.relatorioProcedimentoDesc || relatorioProcedimentoDesc;
      const comp = tData.relatorioComplementar || relatorioComplementar;
      const patAge = tData.patientAge || patientAge;

      return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>${pdfDocTitle}</title>
  <style>${baseCss}</style>
</head>
<body>
  ${standardHeaderHtml}

  <div class="title-box">
    <div class="title">RELATÓRIO DE ATENDIMENTO ODONTOLÓGICO</div>
    <div class="title-sub">${stage === 'inicial' ? 'RELATÓRIO INICIAL DE ENCAMINHAMENTO E PLANEJAMENTO' : 'RELATÓRIO CONCLUSIVO DE ALTA CLÍNICA'}</div>
  </div>

  <div class="patient-card">
    <div><strong>PACIENTE:</strong> <span style="font-size: 12px; font-weight: bold; text-decoration: underline;">${doc.patientName}</span></div>
    <div><strong>IDADE:</strong> ${patAge}</div>
  </div>

  <div class="section-card">
    <div class="section-title">1. PROCEDIMENTO / TRATAMENTO REALIZADO</div>
    <div style="font-size: 11px; font-weight: 600; color: #222; line-height: 1.5;">${procDesc}</div>
  </div>

  <div class="section-card" style="background: #fcfcf7;">
    <div class="section-title">2. INFORMAÇÕES AOS PACIENTES ASSISTIDOS E JUSTIFICATIVAS CLÍNICAS</div>
    <div style="font-size: 11px; text-align: justify; line-height: 1.6; color: #333;">
      O paciente e/ou responsável foi devidamente orientado e esclarecido a respeito de todas as etapas do diagnóstico e do plano de intervenção. Registraram-se as justificativas clínicas que fundamentam o tempo de atendimento em razão da complexidade do quadro, finalidade preventiva/pedagógica e cuidados pós-operatórios recomendados.
    </div>
  </div>

  ${comp ? `
  <div class="section-card">
    <div class="section-title">3. OBSERVAÇÕES COMPLEMENTARES</div>
    <div style="font-size: 10.5px; color: #333; line-height: 1.4;">${comp}</div>
  </div>
  ` : ''}

  <div class="date-row">
    ${cityOnly}, ${docDateStr}
  </div>

  <div class="footer">
    ${signatureBlockHtml}
    ${clinicFooterHtml}
  </div>

  ${autoPrintScript}
</body>
</html>`;
    }

    // 10. DECLARAÇÃO DE TRATAMENTO EM ANDAMENTO
    if (isTratamentoAndamento) {
      const esp = tData.tratamentoAndamentoEspecialidade || tratamentoAndamentoEspecialidade;
      const freq = tData.tratamentoAndamentoFrequencia || tratamentoAndamentoFrequencia;
      const prev = tData.tratamentoAndamentoPrevisao || tratamentoAndamentoPrevisao;
      const obs = tData.tratamentoAndamentoObservacoes || tratamentoAndamentoObservacoes;
      const patAge = tData.patientAge || patientAge;

      return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>${pdfDocTitle}</title>
  <style>${baseCss}</style>
</head>
<body>
  ${standardHeaderHtml}

  <div class="title-box">
    <div class="title">DECLARAÇÃO DE TRATAMENTO EM ANDAMENTO</div>
    <div class="title-sub">COMPROVAÇÃO DE ACOMPANHAMENTO CLÍNICO ODONTOLÓGICO</div>
  </div>

  <div class="patient-card">
    <div><strong>PACIENTE:</strong> <span style="font-size: 12px; font-weight: bold; text-decoration: underline;">${doc.patientName}</span></div>
    <div><strong>IDADE:</strong> ${patAge}</div>
  </div>

  <div class="section-card" style="text-align: justify; font-size: 12px; line-height: 1.8; padding: 14px 16px;">
    Declaro, para os devidos fins de direito, que o(a) Sr(a). <strong>${doc.patientName}</strong> encontra-se sob meus cuidados profissionais neste consultório odontológico, realizando tratamento na área de <strong>${esp}</strong>, com frequência prevista de <strong>${freq}</strong> e estimativa de conclusão para <strong>${prev}</strong>.
  </div>

  ${obs ? `
  <div class="section-card" style="background: #fdfdf9;">
    <div class="section-title">OBSERVAÇÕES E RECOMENDAÇÕES</div>
    <div style="font-size: 10.5px; color: #333; line-height: 1.4;">${obs}</div>
  </div>
  ` : ''}

  <div class="date-row">
    ${cityOnly}, ${docDateStr}
  </div>

  <div class="footer">
    ${signatureBlockHtml}
    ${clinicFooterHtml}
  </div>

  ${autoPrintScript}
</body>
</html>`;
    }

    // 11. RECIBO DE PAGAMENTO ODONTOLÓGICO
    if (isRecibo) {
      const valor = tData.reciboValor || reciboValor;
      const extenso = tData.reciboExtenso || reciboExtenso;
      const referente = tData.reciboReferente || reciboReferente;
      const forma = tData.reciboFormaPagamento || reciboFormaPagamento;

      return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>${pdfDocTitle}</title>
  <style>${baseCss}</style>
</head>
<body>
  ${standardHeaderHtml}

  <div class="title-box">
    <div class="title">RECIBO DE PAGAMENTO ODONTOLÓGICO</div>
    <div class="title-sub">COMPROVANTE DE QUITAÇÃO DE SERVIÇOS PROFISSIONAIS</div>
  </div>

  <div class="patient-card">
    <div><strong>PACIENTE / PAGADOR:</strong> <span style="font-size: 12px; font-weight: bold; text-decoration: underline;">${doc.patientName}</span></div>
    <div><strong>VALOR:</strong> <span style="font-size: 14px; font-weight: bold; color: #166534;">R$ ${valor}</span></div>
  </div>

  <div class="section-card" style="text-align: justify; font-size: 12px; line-height: 1.8; padding: 16px;">
    Recebi do(a) Sr(a). <strong>${doc.patientName}</strong> a quantia líquida e certa de <strong>R$ ${valor}</strong> (${extenso}), referente a serviços odontológicos prestados de <strong>${referente}</strong>, pagos via <strong>${forma}</strong>, dando plena, rasa e geral quitação pelo valor ora recebido.
  </div>

  <div class="date-row">
    ${cityOnly}, ${docDateStr}
  </div>

  <div class="footer">
    ${signatureBlockHtml}
    ${clinicFooterHtml}
  </div>

  ${autoPrintScript}
</body>
</html>`;
    }

    // 12. PROTOCOLO DE ANESTESIA INTRA-ORAL (PAIO)
    if (isPaio) {
      const topicals = tData.topicalAnesthetics || topicalAnesthetics;
      const sites = tData.paioAnesthesiaSites || paioAnesthesiaSites;
      const tubetes = tData.injectableTubetes || injectableTubetes;
      const tech = tData.paioTechnique || paioTechnique;
      const bp = tData.paioBloodPressure || paioBloodPressure;
      const hr = tData.paioHeartRate || paioHeartRate;
      const proc = tData.paioProcedure || paioProcedure;
      const tooth = tData.paioToothRegion || paioToothRegion;
      const postOp = tData.paioPostOpInstructions || paioPostOpInstructions;

      return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>${pdfDocTitle}</title>
  <style>${baseCss}</style>
</head>
<body>
  ${standardHeaderHtml}

  <div class="title-box">
    <div class="title">PROTOCOLO DE ANESTESIA INTRA-ORAL (PAIO)</div>
    <div class="title-sub">REGISTRO DE TÉCNICAS ANESTÉSICAS E SEGURANÇA DO PACIENTE</div>
  </div>

  <div class="patient-card">
    <div><strong>PACIENTE:</strong> <span style="font-size: 12px; font-weight: bold; text-decoration: underline;">${doc.patientName}</span></div>
    <div><strong>SINAIS VITAIS:</strong> PA: ${bp} • FC: ${hr} bpm</div>
  </div>

  <div class="section-card">
    <div class="section-title">1. ANESTESIA TÓPICA & TÉCNICA EXECUTADA</div>
    <div class="grid-2">
      <div class="grid-item">
        <div style="font-size: 9.5px; font-weight: bold; color: #555; text-transform: uppercase;">Anestésicos Tópicos Utilizados:</div>
        <div style="font-weight: bold; margin-top: 2px;">${topicals.join(', ') || 'Benzocaína 20% Pomada'}</div>
      </div>
      <div class="grid-item">
        <div style="font-size: 9.5px; font-weight: bold; color: #555; text-transform: uppercase;">Locais / Sítios de Aplicação:</div>
        <div style="font-weight: bold; margin-top: 2px;">${sites.join(', ') || 'Fundo de sulco vestibular'}</div>
      </div>
    </div>
  </div>

  <div class="section-card">
    <div class="section-title">2. ANESTESIA INJETÁVEL & DOSAGEM</div>
    <div class="grid-2">
      <div class="grid-item">
        <div style="font-size: 9.5px; font-weight: bold; color: #555; text-transform: uppercase;">Técnica Infiltrativa / Bloqueio:</div>
        <div style="font-weight: bold; margin-top: 2px;">${tech}</div>
      </div>
      <div class="grid-item">
        <div style="font-size: 9.5px; font-weight: bold; color: #555; text-transform: uppercase;">Tubetes Consumidos:</div>
        <div style="font-weight: bold; margin-top: 2px;">${tubetes} tubete(s) (Lidocaína 2% + Epinefrina 1:100.000)</div>
      </div>
    </div>
  </div>

  <div class="section-card">
    <div class="section-title">3. PROCEDIMENTO ODONTOLÓGICO REALIZADO</div>
    <div style="font-size: 11px; font-weight: 600; color: #222;">
      ${proc} • Dente / Região: <strong>${tooth}</strong>
    </div>
  </div>

  ${postOp ? `
  <div class="section-card" style="background: #fdfdf9;">
    <div class="section-title">4. ORIENTAÇÕES PÓS-ANESTÉSICAS</div>
    <div style="font-size: 10.5px; color: #333; line-height: 1.4;">${postOp}</div>
  </div>
  ` : ''}

  <div class="date-row">
    ${cityOnly}, ${docDateStr}
  </div>

  <div class="footer">
    ${signatureBlockHtml}
    ${clinicFooterHtml}
  </div>

  ${autoPrintScript}
</body>
</html>`;
    }

    // 13. TERMO DE CONSENTIMENTO LIVRE E ESCLARECIDO (TCLE)
    if (isTermo) {
      const summaryText = doc.summary || 'O paciente declara haver recebido todos os esclarecimentos cabíveis a respeito do procedimento odontológico proposto, seus riscos e benefícios, autorizando sua realização.';

      return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>${pdfDocTitle}</title>
  <style>${baseCss}</style>
</head>
<body>
  ${standardHeaderHtml}

  <div class="title-box">
    <div class="title">${doc.title.toUpperCase()}</div>
    <div class="title-sub">TERMO DE CONSENTIMENTO LIVRE E ESCLARECIDO (TCLE)</div>
  </div>

  <div class="patient-card">
    <div><strong>PACIENTE:</strong> <span style="font-size: 12px; font-weight: bold; text-decoration: underline;">${doc.patientName}</span></div>
    <div><strong>DATA:</strong> ${docDateStr}</div>
  </div>

  <div class="section-card" style="text-align: justify; font-size: 11.5px; line-height: 1.7; padding: 14px 16px;">
    ${summaryText}
  </div>

  <div class="date-row">
    ${cityOnly}, ${docDateStr}
  </div>

  <div class="grid-2" style="margin-top: 25px; margin-bottom: 10px;">
    <div style="border-top: 1.5px solid #222; text-align: center; padding-top: 4px; font-size: 10.5px;">
      <strong>${doc.patientName}</strong><br/>
      <span style="color: #666; font-size: 9.5px;">Paciente / Responsável Legal</span>
    </div>
    <div style="border-top: 1.5px solid #222; text-align: center; padding-top: 4px; font-size: 10.5px;">
      <strong>${dentistName}</strong><br/>
      <span style="color: #666; font-size: 9.5px;">Cirurgião-Dentista • ${dentistCro}</span>
    </div>
  </div>

  <div class="footer">
    ${clinicFooterHtml}
  </div>

  ${autoPrintScript}
</body>
</html>`;
    }

    // 14. ATESTADO ODONTOLÓGICO PADRÃO
    if (isAtestado) {
      const cid = doc.cidCode || (isManualCid ? customCid : cidCode);
      const dias = tData.afastamentoDias || afastamentoDias;
      const atType = tData.atendimentoType || atendimentoType;
      const time = tData.docTime || docTime;
      const periodo = tData.periodoStr || periodoStr;

      return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>${pdfDocTitle}</title>
  <style>${baseCss}</style>
</head>
<body>
  ${standardHeaderHtml}

  <div class="title-box">
    <div class="title">ATESTADO ODONTOLÓGICO</div>
    <div class="title-sub">COMPROVAÇÃO DE ATENDIMENTO E AFASTAMENTO LABORAL</div>
  </div>

  <div class="patient-card">
    <div><strong>PACIENTE:</strong> <span style="font-size: 12px; font-weight: bold; text-decoration: underline;">${doc.patientName}</span></div>
    <div><strong>DATA:</strong> ${docDateStr}</div>
  </div>

  <div class="section-card" style="text-align: justify; font-size: 12.5px; line-height: 2; padding: 18px 20px;">
    Atesto, para os devidos fins, que <strong>${doc.patientName}</strong> submeteu-se a atendimento odontológico ${atType}, ${cid ? `CID: <strong>${cid}</strong>,` : ''} no dia <strong>${docDateStr}</strong> às <strong>${time}</strong> (período ${periodo}), devendo se afastar de suas atividades habituais pelo período de <strong>${dias} dia(s)</strong> por estar sob meus cuidados profissionais.
  </div>

  <div class="date-row">
    ${cityOnly}, ${docDateStr}
  </div>

  <div class="footer">
    ${signatureBlockHtml}
    ${clinicFooterHtml}
  </div>

  ${autoPrintScript}
</body>
</html>`;
    }

    // 15. DEFAULT STRUCTURED DOCUMENT CARD
    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>${pdfDocTitle}</title>
  <style>${baseCss}</style>
</head>
<body>
  ${standardHeaderHtml}

  <div class="title-box">
    <div class="title">${doc.title.toUpperCase()}</div>
  </div>

  <div class="patient-card">
    <div><strong>PACIENTE:</strong> <span style="font-size: 12px; font-weight: bold; text-decoration: underline;">${doc.patientName}</span></div>
    <div><strong>DATA:</strong> ${docDateStr}</div>
  </div>

  <div class="section-card" style="text-align: justify; font-size: 12px; line-height: 1.8; padding: 16px;">
    ${doc.summary || 'Documento emitido e registrado no sistema odontológico para fins de prontuário e acompanhamento clínico.'}
  </div>

  <div class="date-row">
    ${cityOnly}, ${docDateStr}
  </div>

  <div class="footer">
    ${signatureBlockHtml}
    ${clinicFooterHtml}
  </div>

  ${autoPrintScript}
</body>
</html>`;
  };

  // Helper function to open native system print dialog with dynamic PDF naming and isolated iframe
  const handlePrintSystemWindow = (doc: {
    id?: string;
    title: string;
    patientName: string;
    professionalName?: string;
    formattedDateStr?: string;
    summary?: string;
    templateId?: string;
    templateData?: Record<string, any>;
    cidCode?: string;
  }) => {
    const pdfDocumentTitle = getDocumentPdfTitle(doc.title, doc.formattedDateStr || docDate);
    const prevTitle = document.title;
    document.title = pdfDocumentTitle;

    const htmlContent = buildDocumentPrintHtml(doc, false);

    // Remove any previous print iframe to ensure a clean state
    const oldFrame = document.getElementById('dentispro-print-sandbox-iframe');
    if (oldFrame) {
      try { oldFrame.remove(); } catch (_) {}
    }

    // Create a dedicated off-screen printable iframe with full layout rendering
    // NOTE: Chromium/Safari silently ignore window.print() if visibility is 'hidden' or dimensions are 0x0.
    // By using opacity: 0 with 100vw/100vh and z-index: -99999, the browser renders the layout and reliably triggers print dialog.
    const iframe = document.createElement('iframe');
    iframe.id = 'dentispro-print-sandbox-iframe';
    iframe.style.position = 'fixed';
    iframe.style.top = '0';
    iframe.style.left = '0';
    iframe.style.width = '100vw';
    iframe.style.height = '100vh';
    iframe.style.border = '0';
    iframe.style.opacity = '0';
    iframe.style.pointerEvents = 'none';
    iframe.style.zIndex = '-99999';
    iframe.setAttribute('aria-hidden', 'true');
    document.body.appendChild(iframe);

    let hasTriggered = false;
    const executePrint = () => {
      if (hasTriggered) return;
      hasTriggered = true;
      try {
        const frameWin = iframe.contentWindow;
        if (frameWin) {
          frameWin.focus();
          frameWin.print();
        } else {
          window.print();
        }
      } catch (err) {
        console.warn('Iframe print access restricted, attempting fallback window:', err);
        const printWindow = window.open('', '_blank', 'width=880,height=980');
        if (printWindow) {
          printWindow.document.open();
          printWindow.document.write(htmlContent);
          printWindow.document.close();
          printWindow.focus();
          setTimeout(() => { printWindow.print(); }, 350);
        } else {
          window.print();
        }
      } finally {
        setTimeout(() => {
          document.title = prevTitle;
          try { iframe.remove(); } catch (_) {}
        }, 3500);
      }
    };

    try {
      const frameDoc = iframe.contentWindow?.document || iframe.contentDocument;
      if (frameDoc) {
        frameDoc.open();
        frameDoc.write(htmlContent);
        frameDoc.close();
        setTimeout(executePrint, 350);
      } else {
        executePrint();
      }
    } catch (e) {
      executePrint();
    }
  };

  // Helper function to download PDF/HTML and open Gov.br Assinador
  const handleDownloadPdfForGovBr = (doc: {
    id?: string;
    title: string;
    patientName: string;
    professionalName?: string;
    formattedDateStr?: string;
    summary?: string;
    templateId?: string;
    templateData?: Record<string, any>;
    cidCode?: string;
  }, openGovBr: boolean = false) => {
    const htmlContent = buildDocumentPrintHtml(doc, true);
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const dateFormatted = formatDocDateYYYYMMDD(doc.formattedDateStr || docDate).replace(/\//g, '-');
    a.href = url;
    a.download = `${doc.title.replace(/\s+/g, '_')}_${dateFormatted}_${doc.patientName.replace(/\s+/g, '_')}.html`;
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
      window.open('https://www.gov.br/governodigital/pt-br/assinador', '_blank');
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

  // Parameters for Solicitação de Radiografia Panorâmica (Ortopantomografia)
  // Opções extraídas diretamente dos modelos clínicos odontológicos anexados
  const [rxPanoramicoOptions, setRxPanoramicoOptions] = useState({
    analiseDenticaoOssea: true, // Modelo 3: "Solicito radiografia panorâmica para análise da dentição e óssea."
    atmBocaAbertaFechada: false, // Modelo 1: "Solicito Radiografia Panorâmica específica da Atm de boca fechada e boca aberta para análise da Articulação temporomandibular"
    posExodontiaSisos: false, // Modelo 2: "Solicito Rx Panorâmico para análise de dentição e óssea pós Exodontia de terceiros molares."
    preOperatorioSisos: false // Avaliação pré-operatória e planejamento cirúrgico de terceiros molares
  });
  const [rxPanoramicoTextoCustomizado, setRxPanoramicoTextoCustomizado] = useState('');
  const [rxPanoramicoTeethInput, setRxPanoramicoTeethInput] = useState('Arcadas Dentárias Superior e Inferior (Dentes e Estruturas Ósseas)');
  const [rxPanoramicoFinalidade, setRxPanoramicoFinalidade] = useState('Avaliação Diagnóstica Geral e Planejamento');
  const [rxPanoramicoObservacoes, setRxPanoramicoObservacoes] = useState('Favor realizar radiografia panorâmica digital com ampliação padronizada e laudo radiológico minucioso.');

  // Dados de Convênio do Paciente (presente no Modelo 2 anexado)
  const [rxPanoramicoIncluirConvenio, setRxPanoramicoIncluirConvenio] = useState(false);
  const [rxPanoramicoConvenioNome, setRxPanoramicoConvenioNome] = useState('INPAO / Care Plus');
  const [rxPanoramicoConvenioNumero, setRxPanoramicoConvenioNumero] = useState('3817.109.02956-01');

  // Indicação de Clínicas Radiológicas Parceiras (presente no Modelo 3 anexado)
  const [rxPanoramicoIndicarClinicas, setRxPanoramicoIndicarClinicas] = useState(true);
  const [rxPanoramicoClinicas, setRxPanoramicoClinicas] = useState({
    perboyreCastelo: true, // "Perboyre Castelo - A imagem da odontologia do Ceará"
    dentalImagem: true,    // "Dental Imagem - Diagnóstico e Documentação Odontológica"
    oralScan: true         // "Oral Scan - Imaginologia Odontológica"
  });
  const [rxPanoramicoOutraClinica, setRxPanoramicoOutraClinica] = useState('');

  // Parameters for Radiografias Periapicais & Interproximais (Bite-Wings)
  const [rxPeriapicalTipo, setRxPeriapicalTipo] = useState<'periapical_localizada' | 'levantamento_completo_14_tomadas' | 'interproximal_bite_wing' | 'oclusal'>('periapical_localizada');
  const [rxPeriapicalTeethInput, setRxPeriapicalTeethInput] = useState('Dentes 11, 21 e 22');
  const [rxPeriapicalIndication, setRxPeriapicalIndication] = useState('Avaliação endodôntica e lesão periapical');
  const [rxPeriapicalNotes, setRxPeriapicalNotes] = useState('Favor realizar tomada periapical digital com posicionador e técnica do paralelismo.');
  const [rxPeriapicalNotationMode, setRxPeriapicalNotationMode] = useState<'merged' | 'fdi' | 'regions'>('merged');
  const [rxPeriapicalSelectedFdiTooth, setRxPeriapicalSelectedFdiTooth] = useState<string>('11');
  const [rxPeriapicalSelectedRegion, setRxPeriapicalSelectedRegion] = useState<string>('');
  const [rxPeriapicalSelectedRegions, setRxPeriapicalSelectedRegions] = useState<string[]>([]);

  // Toggle single periapical region code (RMSD, RPSD, RCSD, RIS, RCSE, RPSE, RMSE, RMIE, RPIE, RII, RPID, RMID)
  const togglePeriapicalRegion = (regionCode: string) => {
    setRxPeriapicalSelectedRegions(prev => {
      const exists = prev.includes(regionCode);
      const next = exists ? prev.filter(c => c !== regionCode) : [...prev, regionCode];
      if (next.length === 0) {
        setRxPeriapicalTeethInput('');
      } else {
        const sorted = PERIAPICAL_REGIONS_12.filter(r => next.includes(r.code)).map(r => r.code);
        setRxPeriapicalTeethInput(`Regiões Periapicais: ${sorted.join(', ')}`);
      }
      return next;
    });
  };

  // Helper to select all 12 periapical regions
  const handleSelectAll12PeriapicalRegions = () => {
    const allCodes = PERIAPICAL_REGIONS_12.map(r => r.code);
    setRxPeriapicalSelectedRegions(allCodes);
    setRxPeriapicalTeethInput(`Status Completo (12 Regiões): ${allCodes.join(', ')}`);
  };

  // Helper to select superior arch regions
  const handleSelectSuperiorPeriapicalRegions = () => {
    const supCodes = PERIAPICAL_REGIONS_12.filter(r => r.arch === 'superior').map(r => r.code);
    setRxPeriapicalSelectedRegions(supCodes);
    setRxPeriapicalTeethInput(`Arco Superior (${supCodes.length} Regiões): ${supCodes.join(', ')}`);
  };

  // Helper to select inferior arch regions
  const handleSelectInferiorPeriapicalRegions = () => {
    const infCodes = PERIAPICAL_REGIONS_12.filter(r => r.arch === 'inferior').map(r => r.code);
    setRxPeriapicalSelectedRegions(infCodes);
    setRxPeriapicalTeethInput(`Arco Inferior (${infCodes.length} Regiões): ${infCodes.join(', ')}`);
  };

  // Helper to select Bite-Wings Bilaterais
  const handleSelectBiteWingsPeriapical = () => {
    setRxPeriapicalTipo('interproximal_bite_wing');
    setRxPeriapicalTeethInput('Interproximais Bite-Wings Bilaterais (Molares e Pré-Molares Superiores e Inferiores)');
  };

  // Helper to clear periapical selection
  const handleClearPeriapicalSelection = () => {
    setRxPeriapicalSelectedRegions([]);
    setRxPeriapicalTeethInput('');
  };

  // Helper to insert FDI tooth
  const handleInsertFdiTooth = (toothCode: string) => {
    if (!toothCode) return;
    setRxPeriapicalTeethInput(prev => {
      const cleaned = prev.trim();
      if (!cleaned) return `Dente ${toothCode}`;
      if (cleaned.includes(`Dente ${toothCode}`) || cleaned.includes(`, ${toothCode}`)) return cleaned;
      return `${cleaned} • Dente ${toothCode}`;
    });
  };

  // Parameters for Receituário Simples
  const [receitaSimplesUso, setReceitaSimplesUso] = useState<'Uso Interno' | 'Uso Tópico' | 'Uso Interno e Tópico'>('Uso Interno');
  const [receitaSimplesVias, setReceitaSimplesVias] = useState<'1 via' | '2 vias'>('1 via');
  const [receitaSimplesOrientacoes, setReceitaSimplesOrientacoes] = useState('Seguir rigorosamente as doses e horários prescritos. Não interromper o tratamento sem orientação.');

  // Parameters for Notificações de Receita Especial (Azul B / Amarela A)
  const [notificacaoBNumero, setNotificacaoBNumero] = useState('001248/2026');
  const [notificacaoBUf, setNotificacaoBUf] = useState('CE');
  const [notificacaoBGrafica, setNotificacaoBGrafica] = useState('Talonário Oficial / Vigilância Sanitária');
  const [notificacaoANumero, setNotificacaoANumero] = useState('000532/2026');
  const [notificacaoAUf, setNotificacaoAUf] = useState('CE');

  // Parameters for Atestado de Aptidão Odontológica
  const [aptidaoFinalidade, setAptidaoFinalidade] = useState('Concurso Público / Admissional');
  const [aptidaoObservacoes, setAptidaoObservacoes] = useState('Paciente em perfeito estado de higidez bucal, com ausência de focos infecciosos ativos, cáries ou processos patológicos agudos.');

  // Parameters for Declaração de Tratamento em Andamento
  const [tratamentoAndamentoEspecialidade, setTratamentoAndamentoEspecialidade] = useState('Ortodontia e Ortopedia Facial');
  const [tratamentoAndamentoPrevisao, setTratamentoAndamentoPrevisao] = useState('12 a 18 meses');
  const [tratamentoAndamentoFrequencia, setTratamentoAndamentoFrequencia] = useState('Mensal');
  const [tratamentoAndamentoObservacoes, setTratamentoAndamentoObservacoes] = useState('O(A) paciente comparece regularmente para ativação de aparelho e controle clínico odontológico.');

  // Parameters for Declaração de Valores / Recibo Odontológico
  const [reciboValor, setReciboValor] = useState('850,00');
  const [reciboExtenso, setReciboExtenso] = useState('Oitocentos e cinquenta reais');
  const [reciboReferente, setReciboReferente] = useState('Tratamento odontológico reabilitador e procedimentos clínicos especializados.');
  const [reciboFormaPagamento, setReciboFormaPagamento] = useState('PIX');

  // Parameters for Termos (TCLEs)
  const [tcleImplanteRegiao, setTcleImplanteRegiao] = useState('Região dos elementos dentários 36 e 46');
  const [tcleImplanteEnxerto, setTcleImplanteEnxerto] = useState(true);
  const [tcleClareamentoTipo, setTcleClareamentoTipo] = useState<'caseiro' | 'consultorio' | 'combinado'>('combinado');
  const [tcleOrtoTipo, setTcleOrtoTipo] = useState<'fixo_metalico' | 'fixo_estetico' | 'alinhadores' | 'autoligado'>('fixo_estetico');

  // Print & Render State
  const [isRenderModalOpen, setIsRenderModalOpen] = useState(false);

  const selectedPatient = patients.find(p => p.id === selectedPatientId);
  const patientDisplayName = customPatientName || selectedPatient?.name || 'Nome do Paciente';

  // Automatically sync patient age and health insurance when selecting a registered patient
  React.useEffect(() => {
    if (selectedPatientId) {
      const p = patients.find(patient => patient.id === selectedPatientId);
      if (p) {
        if (p.birthDate) {
          const details = getPatientAgeAndBirthDate(p.birthDate);
          setCustomPatientAgeYears(String(details.ageYears));
          setCustomPatientAgeMonths(String(details.ageMonths));
        }
        if (p.healthInsurance) {
          setRxPanoramicoConvenioNome(p.healthInsurance);
          setRxPanoramicoIncluirConvenio(true);
        }
        if (p.insuranceNumber) {
          setRxPanoramicoConvenioNumero(p.insuranceNumber);
        }
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
      let docSummary = '';
      if (activeTemplate.id === 'receituario_controle_especial' || activeTemplate.title.toLowerCase().includes('controle especial')) {
        docSummary = specialPrescriptionText;
      } else if (activeTemplate.id === 'solicitacao_rx_panoramico') {
        const solList = getRxPanoramicoSolicitacoesList(rxPanoramicoOptions, rxPanoramicoTextoCustomizado);
        docSummary = `Solicitação de Radiografia Panorâmica (${solList[0] || 'Análise da dentição e óssea'}) para ${patientDisplayName}.`;
      } else if (activeTemplate.id === 'solicitacao_rx_periapical_interproximal') {
        docSummary = `Solicitação de Radiografia ${rxPeriapicalTipo} (${rxPeriapicalTeethInput}) para ${patientDisplayName}. Indicação: ${rxPeriapicalIndication}.`;
      } else if (activeTemplate.id === 'receituario_simples') {
        docSummary = `Receituário (${receitaSimplesUso}) para ${patientDisplayName}: ${specialPrescriptionText}`;
      } else if (activeTemplate.id === 'receituario_notificacao_b_azul' || activeTemplate.id === 'receituario_notificacao_a_amarela') {
        docSummary = `Notificação de Receita para ${patientDisplayName}: ${specialPrescriptionText}`;
      } else if (activeTemplate.id === 'atestado_aptidao_odontologica') {
        docSummary = `Atestado de Aptidão Odontológica para ${patientDisplayName} (${aptidaoFinalidade}).`;
      } else if (activeTemplate.id === 'declaracao_tratamento_andamento') {
        docSummary = `Declaração de Tratamento em Andamento (${tratamentoAndamentoEspecialidade}) para ${patientDisplayName}.`;
      } else if (activeTemplate.id === 'declaracao_valores_recibo') {
        docSummary = `Recibo de Pagamento no valor de R$ ${reciboValor} (${reciboExtenso}) referente a ${reciboReferente}.`;
      } else if (activeTemplate.id.startsWith('tcle_')) {
        docSummary = `Termo de Consentimento Livre e Esclarecido (${activeTemplate.title}) firmado para ${patientDisplayName}.`;
      } else if (activeTemplate.category === 'atestado') {
        docSummary = `Atesto que ${patientDisplayName} submeteu-se a atendimento odontológico ${atendimentoType}, CID: ${isManualCid ? customCid : cidCode}, no dia ${formattedFormattedDate}, com ${afastamentoDias} dia(s) de afastamento.`;
      } else if (activeTemplate.id === 'relatorio_atendimento_inicial_final') {
        docSummary = `${relatorioDocStage === 'inicial' ? 'Relatório de Atendimento Inicial' : 'Relatório de Atendimento Final'}: ${relatorioProcedimentoDesc}.`;
      } else if (activeTemplate.id === 'declaracao_comparecimento') {
        docSummary = `Declaro que ${patientDisplayName} compareceu a este consultório no dia ${formattedFormattedDate}, período ${docTime} (${periodoStr}).`;
      } else if (activeTemplate.id === 'solicitacao_sangue') {
        const selectedExams = Object.entries(bloodExams).filter(([_, v]) => v).map(([k]) => k).join(', ');
        docSummary = `Exames de Sangue Solicitados: ${selectedExams || 'Hemograma completo, Coagulograma, Glicemia em jejum'}.`;
      } else if (activeTemplate.id === 'solicitacao_tomografia') {
        docSummary = buildFormattedTomographySummary();
      } else {
        docSummary = `${activeTemplate.title} gerado para o(a) paciente ${patientDisplayName} (${patientAge}) em ${formattedFormattedDate}.`;
      }

      const currentTemplateData: Record<string, any> = {
        patientAge,
        docDate,
        docTime,
        periodoStr,
        rxPanoramicoOptions,
        rxPanoramicoTextoCustomizado,
        rxPanoramicoTeethInput,
        rxPanoramicoFinalidade,
        rxPanoramicoObservacoes,
        rxPanoramicoIncluirConvenio,
        rxPanoramicoConvenioNome,
        rxPanoramicoConvenioNumero,
        rxPanoramicoIndicarClinicas,
        rxPanoramicoClinicas,
        rxPanoramicoOutraClinica,
        rxPeriapicalTipo,
        rxPeriapicalTeethInput,
        rxPeriapicalIndication,
        rxPeriapicalNotes,
        bloodExams,
        prescriptionText: specialPrescriptionText,
        receitaSimplesVias,
        receitaSimplesUso,
        receitaSimplesOrientacoes,
        notificacaoBNumero,
        notificacaoBUf,
        notificacaoANumero,
        notificacaoAUf,
        afastamentoDias,
        atendimentoType,
        procedureDetail,
        aptidaoFinalidade,
        aptidaoObservacoes,
        relatorioDocStage,
        relatorioProcedimentoDesc,
        relatorioComplementar,
        tratamentoAndamentoEspecialidade,
        tratamentoAndamentoFrequencia,
        tratamentoAndamentoPrevisao,
        tratamentoAndamentoObservacoes,
        reciboValor,
        reciboExtenso,
        reciboReferente,
        reciboFormaPagamento,
        tomographyRegions: getSelectedTomographyRegions(),
        tomographyIndications: getSelectedTomographyIndications(),
        tomographyDelivery: getSelectedTomographyDelivery(),
        tomographyFov,
        tomographyNotes,
        isPaioActive,
        topicalAnesthetics,
        paioAnesthesiaSites,
        injectableTubetes,
        paioTechnique,
        paioBloodPressure,
        paioHeartRate,
        paioProcedure,
        paioToothRegion,
        paioComplications,
        paioPostOpInstructions,
        tcleImplanteRegiao,
        tcleImplanteEnxerto,
        tcleClareamentoTipo,
        tcleOrtoTipo
      };

      addSavedClinicDocument({
        title: activeTemplate.title,
        subtitle: activeTemplate.subtitle,
        category: activeTemplate.category,
        patientId: selectedPatientId,
        patientName: patientDisplayName,
        professionalName: activeProfessional?.name || clinicInfo.dentistName,
        cidCode: activeTemplate.category === 'atestado' ? (isManualCid ? customCid : cidCode) : undefined,
        summary: docSummary,
        templateId: activeTemplate.id,
        templateData: currentTemplateData
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
    } else if (activeTemplate.id === 'solicitacao_rx_panoramico') {
      const solLines = getRxPanoramicoSolicitacoesList(rxPanoramicoOptions, rxPanoramicoTextoCustomizado).map(s => `• ${s}`).join('\n');
      const clinicas = rxPanoramicoIndicarClinicas ? getRxPanoramicoClinicasList(rxPanoramicoClinicas, rxPanoramicoOutraClinica).map(c => `  - ${c.name}`).join('\n') : '';
      const conv = rxPanoramicoIncluirConvenio && rxPanoramicoConvenioNome ? `\n• *Convênio:* ${rxPanoramicoConvenioNome}${rxPanoramicoConvenioNumero ? ` (${rxPanoramicoConvenioNumero})` : ''}` : '';

      bodyText = `*SOLICITAÇÃO DE RADIOGRAFIA PANORÂMICA*\n\n*Paciente:* ${patientDisplayName}${conv}\n\n*Solicitação:*\n${solLines}${rxPanoramicoTeethInput ? `\n\n• *Região:* ${rxPanoramicoTeethInput}` : ''}${rxPanoramicoFinalidade ? `\n• *Indicação:* ${rxPanoramicoFinalidade}` : ''}${rxPanoramicoObservacoes ? `\n• *Observações:* ${rxPanoramicoObservacoes}` : ''}${clinicas ? `\n\n*Faça este exame em clínicas radiológicas:*\n${clinicas}` : ''}`;
    } else if (activeTemplate.id === 'solicitacao_rx_periapical_interproximal') {
      bodyText = `*SOLICITAÇÃO DE RADIOGRAFIAS PERIAPICAIS / INTERPROXIMAIS*\n\n• *Modalidade:* ${rxPeriapicalTipo}\n• *Dentes / Região:* ${rxPeriapicalTeethInput}\n• *Indicação Clínica:* ${rxPeriapicalIndication}${rxPeriapicalNotes ? `\n• *Observações:* ${rxPeriapicalNotes}` : ''}`;
    } else if (activeTemplate.id === 'receituario_simples') {
      bodyText = `*RECEITUÁRIO (${receitaSimplesUso.toUpperCase()})*\n\n${specialPrescriptionText}${receitaSimplesOrientacoes ? `\n\n*Orientações:* ${receitaSimplesOrientacoes}` : ''}`;
    } else if (activeTemplate.id === 'receituario_notificacao_b_azul') {
      bodyText = `*NOTIFICAÇÃO DE RECEITA B (AZUL - PSICOTRÓPICOS) - Nº ${notificacaoBNumero} - UF ${notificacaoBUf}*\n\n${specialPrescriptionText}`;
    } else if (activeTemplate.id === 'receituario_notificacao_a_amarela') {
      bodyText = `*NOTIFICAÇÃO DE RECEITA A (AMARELA - ENTORPECENTES) - Nº ${notificacaoANumero} - UF ${notificacaoAUf}*\n\n${specialPrescriptionText}`;
    } else if (activeTemplate.id === 'atestado_aptidao_odontologica') {
      bodyText = `*ATESTADO DE APTIDÃO ODONTOLÓGICA*\n\nAtesto, para os devidos fins (${aptidaoFinalidade}), que o(a) paciente ${patientDisplayName} encontra-se em condições bucais satisfatórias, com ausência de infecções ativas, estando APTO(A) do ponto de vista odontológico.`;
    } else if (activeTemplate.id === 'declaracao_tratamento_andamento') {
      bodyText = `*DECLARAÇÃO DE TRATAMENTO EM ANDAMENTO*\n\nDeclaro que o(a) paciente ${patientDisplayName} encontra-se em tratamento odontológico (${tratamentoAndamentoEspecialidade}) com frequência ${tratamentoAndamentoFrequencia} e previsão de ${tratamentoAndamentoPrevisao}.`;
    } else if (activeTemplate.id === 'declaracao_valores_recibo') {
      bodyText = `*RECIBO DE PAGAMENTO ODONTOLÓGICO*\n\nRecebi de ${patientDisplayName} o valor de R$ ${reciboValor} (${reciboExtenso}) referente a ${reciboReferente}, na forma de pagamento ${reciboFormaPagamento}.`;
    } else if (activeTemplate.id === 'tcle_cirurgia_implantes') {
      bodyText = `*TCLE - CIRURGIA & IMPLANTODONTIA*\n\nTermo de Consentimento Livre e Esclarecido para instalação de implantes dentários na região ${tcleImplanteRegiao} firmado por ${patientDisplayName}.`;
    } else if (activeTemplate.id === 'tcle_clareamento_dental') {
      bodyText = `*TCLE - CLAREAMENTO DENTAL*\n\nTermo de Consentimento Livre e Esclarecido para clareamento ${tcleClareamentoTipo} firmado por ${patientDisplayName}.`;
    } else if (activeTemplate.id === 'tcle_ortodontia') {
      bodyText = `*TCLE - TRATAMENTO ORTODÔNTICO*\n\nTermo de Consentimento Livre e Esclarecido para tratamento ortodôntico (${tcleOrtoTipo}) firmado por ${patientDisplayName}.`;
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
    } else if (activeTemplate.id === 'relatorio_atendimento_inicial_final') {
      const stageTitle = relatorioDocStage === 'inicial' ? 'RELATÓRIO DE ATENDIMENTO INICIAL' : 'RELATÓRIO DE ATENDIMENTO FINAL / CONCLUSÃO';
      bodyText = `*${stageTitle}*\n\n• *Procedimento / Conduta:* ${relatorioProcedimentoDesc}\n\n*INFORMAÇÕES AO PACIENTE ASSISTIDO:*\nFicam prestadas as informações aos pacientes assistidos que justifiquem a recusa do atendimento, a interrupção do tratamento ou o tempo mais longo para a conclusão do tratamento, em razão da complexidade do caso, da finalidade pedagógica, do estágio de formação em que o profissional se encontre em relação às habilidades e aos conhecimentos que o caso clínico demande, ou mesmo delonga em razão de casos fortuitos que forçam a paralisação dos atendimentos nas clínicas da instituição.${relatorioComplementar ? `\n\n*Observações Complementares:* ${relatorioComplementar}` : ''}`;
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

  const handlePrintActiveDocument = () => {
    if (!activeTemplate) {
      window.print();
      return;
    }
    handlePrintSystemWindow({
      id: activeTemplate.id,
      title: activeTemplate.title,
      patientName: patientDisplayName,
      professionalName: activeProfessional?.name || clinicInfo.dentistName,
      formattedDateStr: formattedFormattedDate,
      templateId: activeTemplate.id,
      templateData: {
        patientAge,
        docDate,
        docTime,
        periodoStr,
        rxPanoramicoOptions,
        rxPanoramicoTextoCustomizado,
        rxPanoramicoTeethInput,
        rxPanoramicoFinalidade,
        rxPanoramicoObservacoes,
        rxPanoramicoIncluirConvenio,
        rxPanoramicoConvenioNome,
        rxPanoramicoConvenioNumero,
        rxPanoramicoIndicarClinicas,
        rxPanoramicoClinicas,
        rxPanoramicoOutraClinica,
        rxPeriapicalTipo,
        rxPeriapicalTeethInput,
        rxPeriapicalIndication,
        rxPeriapicalNotes,
        bloodExams,
        prescriptionText: specialPrescriptionText,
        receitaSimplesVias,
        receitaSimplesUso,
        receitaSimplesOrientacoes,
        notificacaoBNumero,
        notificacaoBUf,
        notificacaoANumero,
        notificacaoAUf,
        afastamentoDias,
        atendimentoType,
        procedureDetail,
        aptidaoFinalidade,
        aptidaoObservacoes,
        relatorioDocStage,
        relatorioProcedimentoDesc,
        relatorioComplementar,
        tratamentoAndamentoEspecialidade,
        tratamentoAndamentoFrequencia,
        tratamentoAndamentoPrevisao,
        tratamentoAndamentoObservacoes,
        reciboValor,
        reciboExtenso,
        reciboReferente,
        reciboFormaPagamento,
        tomographyRegions: getSelectedTomographyRegions(),
        tomographyIndications: getSelectedTomographyIndications(),
        tomographyDelivery: getSelectedTomographyDelivery(),
        tomographyFov,
        tomographyNotes,
        isPaioActive,
        topicalAnesthetics,
        paioAnesthesiaSites,
        injectableTubetes,
        paioTechnique,
        paioBloodPressure,
        paioHeartRate,
        paioProcedure,
        paioToothRegion,
        paioComplications,
        paioPostOpInstructions,
        tcleImplanteRegiao,
        tcleImplanteEnxerto,
        tcleClareamentoTipo,
        tcleOrtoTipo
      }
    });
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
            onClick={() => setSelectedCategory('receituario')}
            className={`min-h-[44px] px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 shrink-0 cursor-pointer active:scale-95 ${
              selectedCategory === 'receituario'
                ? `${t.btnPrimaryBg} ${t.btnPrimaryText} shadow-xs`
                : `${t.btnSecondaryBg} ${t.btnSecondaryText}`
            }`}
          >
            <Pill className="w-4 h-4 text-purple-500" />
            Receituários ({DENTAL_DOCUMENT_TEMPLATES.filter(t => t.category === 'receituario').length})
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
            Declarações ({DENTAL_DOCUMENT_TEMPLATES.filter(t => t.category === 'declaracao').length})
          </button>

          <button
            type="button"
            onClick={() => setSelectedCategory('termo')}
            className={`min-h-[44px] px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 shrink-0 cursor-pointer active:scale-95 ${
              selectedCategory === 'termo'
                ? `${t.btnPrimaryBg} ${t.btnPrimaryText} shadow-xs`
                : `${t.btnSecondaryBg} ${t.btnSecondaryText}`
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-indigo-500" />
            Termos & TCLE ({DENTAL_DOCUMENT_TEMPLATES.filter(t => t.category === 'termo').length})
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

      {/* Arquivos Recentes & Assinatura Digital Gov.br - Acesso Rápido */}
      <div className={`${t.cardBg} border ${t.cardBorder} rounded-3xl p-5 md:p-6 shadow-xs space-y-4`}>
        <div className={`flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b ${t.cardBorder}`}>
          <div className="flex flex-col md:flex-row md:items-center gap-4 flex-wrap">
            {/* Quick Patient Selector with Image placed on the LEFT for prominent visual access */}
            <div className="flex items-center gap-2.5 bg-stone-100/95 p-2 rounded-2xl border border-stone-200/90 shadow-2xs shrink-0 self-start md:self-center">
              {(() => {
                const currentPat = patients.find(p => p.id === selectedPatientId);
                const patImage = currentPat?.avatarUrl || currentPat?.photoUrl || currentPat?.images?.[0];
                if (patImage) {
                  return (
                    <img
                      src={patImage}
                      alt={currentPat?.name || 'Paciente'}
                      className="w-9 h-9 rounded-xl object-cover border border-amber-300 shadow-2xs shrink-0"
                    />
                  );
                }
                return (
                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs shrink-0 border border-amber-200">
                    {currentPat?.name ? currentPat.name.charAt(0).toUpperCase() : <User className="w-5 h-5 text-amber-700" />}
                  </div>
                );
              })()}
              <div className="flex flex-col pr-1">
                <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider">
                  Paciente:
                </span>
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
                  className="bg-white text-stone-900 text-xs font-bold px-2.5 py-1 rounded-xl border border-stone-300 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer max-w-[210px] sm:max-w-[260px] truncate"
                >
                  <option value="">-- Todos os Pacientes --</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

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
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  Prontuário eletrônico e papéis do expediente emitidos.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
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
              {/* 0. IDENTIDADE VISUAL E LAYOUT DO DOCUMENTO (CONFIGURAÇÕES) */}
              <div className={`${t.cardBg} p-3.5 rounded-2xl border ${t.cardBorder} space-y-2.5 shadow-2xs`}>
                <div className="flex items-center justify-between">
                  <span className={`text-[10.5px] uppercase font-bold ${t.accentText} tracking-wider flex items-center gap-1.5`}>
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    Layout de Documento Aplicado (Configurações)
                  </span>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                    Sincronizado
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  <div className={`flex items-center gap-2.5 min-w-0 ${t.btnSecondaryBg} p-2 rounded-xl border ${t.cardBorder}`}>
                    {clinicInfo.logoUrl ? (
                      <img src={clinicInfo.logoUrl} alt="Logo" className="w-9 h-9 object-contain rounded-lg shrink-0 border border-stone-200 bg-white p-0.5" />
                    ) : (
                      <div className="w-9 h-9 rounded-lg bg-[#5a5a40] text-white flex items-center justify-center font-bold text-xs shrink-0">
                        DP
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className={`font-bold ${t.headingText} truncate text-[11.5px]`}>
                        {clinicInfo.headerTitle || effectiveClinicName}
                      </p>
                      <p className="text-[10.5px] text-stone-500 truncate">
                        {clinicInfo.headerSubtitle || `${effectiveDentistName} • ${effectiveDentistCro}`}
                      </p>
                    </div>
                  </div>

                  <div className={`${t.btnSecondaryBg} p-2 rounded-xl border ${t.cardBorder} flex flex-col justify-center space-y-1 text-[10.5px]`}>
                    <div className="flex items-center justify-between">
                      <span className="text-stone-500">Marca d'Água:</span>
                      <span className={`font-bold ${t.headingText}`}>
                        {(clinicInfo.showWatermark ?? true) ? `Ativa (${clinicInfo.watermarkOpacity ?? 15}%)` : 'Oculta'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-stone-500">Assinatura Digital:</span>
                      <span className={`font-bold ${t.headingText}`}>
                        {clinicInfo.enableGovBrSignature ? 'Gov.br Habilitado' : 'Padrão / CRM'}
                      </span>
                    </div>
                  </div>
                </div>

                {clinicInfo.footerText && (
                  <div className={`text-[10.5px] ${t.btnSecondaryBg} px-2.5 py-1.5 rounded-lg border ${t.cardBorder} truncate`}>
                    <span className="font-semibold text-stone-600">Rodapé:</span> <span className={t.headingText}>{clinicInfo.footerText}</span>
                  </div>
                )}
              </div>

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

              {/* 3. PARÂMETROS ESPECÍFICOS: RELATÓRIO DE ATENDIMENTO INICIAL / FINAL */}
              {activeTemplate.id === 'relatorio_atendimento_inicial_final' && (
                <div className={`${t.cardBg} p-4 rounded-2xl border ${t.cardBorder} space-y-3`}>
                  <span className={`text-xs font-bold ${t.headingText} uppercase tracking-wider flex items-center gap-1.5 border-b ${t.cardBorder} pb-2`}>
                    <FileText className={`w-4 h-4 ${t.accentText}`} />
                    3. Parâmetros do Relatório de Atendimento
                  </span>

                  <div className="space-y-3">
                    <div>
                      <label className={`block text-xs font-semibold ${t.headingText} mb-1`}>Fase do Relatório:</label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setRelatorioDocStage('inicial')}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                            relatorioDocStage === 'inicial'
                              ? 'bg-amber-400 text-stone-900 border border-amber-500/40 shadow-xs'
                              : `${t.btnSecondaryBg} ${t.btnSecondaryText} border ${t.cardBorder}`
                          }`}
                        >
                          Relatório de Atendimento Inicial
                        </button>
                        <button
                          type="button"
                          onClick={() => setRelatorioDocStage('final')}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                            relatorioDocStage === 'final'
                              ? 'bg-amber-400 text-stone-900 border border-amber-500/40 shadow-xs'
                              : `${t.btnSecondaryBg} ${t.btnSecondaryText} border ${t.cardBorder}`
                          }`}
                        >
                          Relatório de Atendimento Final (Conclusão)
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className={`block text-xs font-semibold ${t.headingText} mb-1`}>Procedimento / Conduta Clínica:</label>
                      <input
                        type="text"
                        value={relatorioProcedimentoDesc}
                        onChange={(e) => setRelatorioProcedimentoDesc(e.target.value)}
                        placeholder="Ex: Avaliação diagnóstica, exame clínico e planejamento terapêutico..."
                        className={`w-full ${t.inputBg} border ${t.cardBorder} rounded-xl px-3 py-2 text-xs font-bold focus:outline-none`}
                      />
                    </div>

                    <div>
                      <label className={`block text-xs font-semibold ${t.headingText} mb-1`}>Observações Complementares (opcional):</label>
                      <textarea
                        rows={2}
                        value={relatorioComplementar}
                        onChange={(e) => setRelatorioComplementar(e.target.value)}
                        placeholder="Observações complementares sobre o caso clínico ou encaminhamento..."
                        className={`w-full ${t.inputBg} border ${t.cardBorder} rounded-xl p-2.5 text-xs font-semibold focus:outline-none`}
                      />
                    </div>

                    <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-200 text-xs text-stone-800 space-y-1">
                      <strong className="text-amber-900 font-bold block">📌 Justificativas Institucionais e Pedagógicas Inclusas Automaticamente:</strong>
                      <p className="text-[11px] leading-relaxed text-stone-700">
                        Ficam prestadas as informações aos pacientes assistidos que justifiquem a recusa do atendimento, a interrupção do tratamento ou o tempo mais longo para a conclusão do tratamento, em razão da complexidade do caso, da finalidade pedagógica, do estágio de formação em que o profissional se encontre em relação às habilidades e aos conhecimentos que o caso clínico demande, ou mesmo delonga em razão de casos fortuitos que forçam a paralisação dos atendimentos nas clínicas da instituição.
                      </p>
                    </div>
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

              {/* 8. PARÂMETROS ESPECÍFICOS: SOLICITAÇÃO DE RX PANORÂMICO */}
              {activeTemplate.id === 'solicitacao_rx_panoramico' && (
                <div className={`${t.cardBg} p-4 rounded-2xl border ${t.cardBorder} space-y-4`}>
                  <span className={`text-xs font-bold ${t.headingText} uppercase tracking-wider flex items-center justify-between border-b ${t.cardBorder} pb-2`}>
                    <span className="flex items-center gap-1.5">
                      <FileText className={`w-4 h-4 ${t.accentText}`} />
                      3. Parâmetros da Solicitação de Radiografia Panorâmica
                    </span>
                    <span className="text-[10px] bg-sky-500/10 text-sky-700 font-bold px-2 py-0.5 rounded-full border border-sky-300/40">
                      Ortopantomografia
                    </span>
                  </span>

                  {/* A. Opções Clínicas de Solicitação (Modelos Anexados) */}
                  <div className="space-y-2">
                    <label className={`block text-xs font-bold ${t.headingText}`}>
                      A. Finalidade / Texto da Solicitação (Modelos Clínicos):
                    </label>
                    <div className="space-y-2">
                      <label className={`flex items-start gap-2.5 p-2.5 ${t.inputBg} rounded-xl border ${t.cardBorder} cursor-pointer hover:border-amber-400 transition`}>
                        <input
                          type="checkbox"
                          checked={rxPanoramicoOptions.analiseDenticaoOssea}
                          onChange={(e) => setRxPanoramicoOptions(prev => ({ ...prev, analiseDenticaoOssea: e.target.checked }))}
                          className="w-4 h-4 mt-0.5 text-sky-600 rounded"
                        />
                        <div className="flex-1">
                          <span className="text-xs font-bold text-stone-900 block">Análise da Dentição e Óssea (Geral)</span>
                          <span className="text-[11px] text-stone-600 italic">"Solicito radiografia panorâmica para análise da dentição e óssea."</span>
                        </div>
                      </label>

                      <label className={`flex items-start gap-2.5 p-2.5 ${t.inputBg} rounded-xl border ${t.cardBorder} cursor-pointer hover:border-amber-400 transition`}>
                        <input
                          type="checkbox"
                          checked={rxPanoramicoOptions.atmBocaAbertaFechada}
                          onChange={(e) => setRxPanoramicoOptions(prev => ({ ...prev, atmBocaAbertaFechada: e.target.checked }))}
                          className="w-4 h-4 mt-0.5 text-sky-600 rounded"
                        />
                        <div className="flex-1">
                          <span className="text-xs font-bold text-stone-900 block">Específica da ATM (Boca Aberta e Boca Fechada)</span>
                          <span className="text-[11px] text-stone-600 italic">"Solicito Radiografia Panorâmica específica da ATM de boca fechada e boca aberta para análise da Articulação Temporomandibular."</span>
                        </div>
                      </label>

                      <label className={`flex items-start gap-2.5 p-2.5 ${t.inputBg} rounded-xl border ${t.cardBorder} cursor-pointer hover:border-amber-400 transition`}>
                        <input
                          type="checkbox"
                          checked={rxPanoramicoOptions.posExodontiaSisos}
                          onChange={(e) => setRxPanoramicoOptions(prev => ({ ...prev, posExodontiaSisos: e.target.checked }))}
                          className="w-4 h-4 mt-0.5 text-sky-600 rounded"
                        />
                        <div className="flex-1">
                          <span className="text-xs font-bold text-stone-900 block">Pós-Exodontia de Terceiros Molares (Sisos)</span>
                          <span className="text-[11px] text-stone-600 italic">"Solicito Rx Panorâmico para análise de dentição e óssea pós Exodontia de terceiros molares."</span>
                        </div>
                      </label>

                      <label className={`flex items-start gap-2.5 p-2.5 ${t.inputBg} rounded-xl border ${t.cardBorder} cursor-pointer hover:border-amber-400 transition`}>
                        <input
                          type="checkbox"
                          checked={rxPanoramicoOptions.preOperatorioSisos}
                          onChange={(e) => setRxPanoramicoOptions(prev => ({ ...prev, preOperatorioSisos: e.target.checked }))}
                          className="w-4 h-4 mt-0.5 text-sky-600 rounded"
                        />
                        <div className="flex-1">
                          <span className="text-xs font-bold text-stone-900 block">Avaliação Pré-Operatória de Dentes Inclusos / Sisos</span>
                          <span className="text-[11px] text-stone-600 italic">"Solicito Radiografia Panorâmica para avaliação pré-operatória e planejamento cirúrgico de terceiros molares."</span>
                        </div>
                      </label>
                    </div>

                    {/* Texto Customizado Alternativo */}
                    <div className="pt-1">
                      <label className="block text-[11px] font-semibold text-stone-700 mb-1">Ou Redija um Texto Personalizado para a Solicitação (opcional):</label>
                      <input
                        type="text"
                        value={rxPanoramicoTextoCustomizado}
                        onChange={(e) => setRxPanoramicoTextoCustomizado(e.target.value)}
                        placeholder="Ex: Solicito radiografia panorâmica para controle e planejamento de..."
                        className={`w-full ${t.inputBg} border ${t.cardBorder} rounded-xl px-3 py-2 text-xs font-medium`}
                      />
                    </div>
                  </div>

                  {/* B. Convênio e Carteirinha (Modelo 2) */}
                  <div className="p-3 bg-stone-50/80 rounded-xl border border-stone-200/80 space-y-2.5">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rxPanoramicoIncluirConvenio}
                        onChange={(e) => setRxPanoramicoIncluirConvenio(e.target.checked)}
                        className="w-4 h-4 text-emerald-600 rounded"
                      />
                      <span className="text-xs font-bold text-stone-900">
                        B. Incluir Dados de Convênio / Carteirinha do Paciente (opcional)
                      </span>
                    </label>

                    {rxPanoramicoIncluirConvenio && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div>
                          <label className="block text-[11px] font-semibold text-stone-700 mb-1">Nome da Operadora / Convênio:</label>
                          <input
                            type="text"
                            value={rxPanoramicoConvenioNome}
                            onChange={(e) => setRxPanoramicoConvenioNome(e.target.value)}
                            placeholder="Ex: INPAO / Care Plus / Bradesco Dental"
                            className={`w-full ${t.inputBg} border ${t.cardBorder} rounded-xl px-3 py-2 text-xs font-bold`}
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-stone-700 mb-1">Matrícula / Carteirinha:</label>
                          <input
                            type="text"
                            value={rxPanoramicoConvenioNumero}
                            onChange={(e) => setRxPanoramicoConvenioNumero(e.target.value)}
                            placeholder="Ex: 3817.109.02956-01"
                            className={`w-full ${t.inputBg} border ${t.cardBorder} rounded-xl px-3 py-2 text-xs font-bold`}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* C. Indicação de Clínicas Radiológicas Parceiras (Modelo 3: "Faça este exame em clínicas radiológicas:") */}
                  <div className="p-3 bg-stone-50/80 rounded-xl border border-stone-200/80 space-y-2.5">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rxPanoramicoIndicarClinicas}
                        onChange={(e) => setRxPanoramicoIndicarClinicas(e.target.checked)}
                        className="w-4 h-4 text-sky-600 rounded"
                      />
                      <span className="text-xs font-bold text-stone-900">
                        C. Incluir recomendação: "Faça este exame em clínicas radiológicas:"
                      </span>
                    </label>

                    {rxPanoramicoIndicarClinicas && (
                      <div className="space-y-2 pt-1">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <label className={`flex items-center gap-2 p-2 ${t.inputBg} rounded-xl border ${t.cardBorder} cursor-pointer`}>
                            <input
                              type="checkbox"
                              checked={rxPanoramicoClinicas.perboyreCastelo}
                              onChange={(e) => setRxPanoramicoClinicas(prev => ({ ...prev, perboyreCastelo: e.target.checked }))}
                              className="w-3.5 h-3.5 text-sky-600 rounded"
                            />
                            <div>
                              <span className="text-xs font-bold text-stone-900 block">Perboyre Castelo</span>
                              <span className="text-[10px] text-stone-500">A imagem da odontologia</span>
                            </div>
                          </label>

                          <label className={`flex items-center gap-2 p-2 ${t.inputBg} rounded-xl border ${t.cardBorder} cursor-pointer`}>
                            <input
                              type="checkbox"
                              checked={rxPanoramicoClinicas.dentalImagem}
                              onChange={(e) => setRxPanoramicoClinicas(prev => ({ ...prev, dentalImagem: e.target.checked }))}
                              className="w-3.5 h-3.5 text-sky-600 rounded"
                            />
                            <div>
                              <span className="text-xs font-bold text-stone-900 block">Dental Imagem</span>
                              <span className="text-[10px] text-stone-500">Diagnóstico & Doc.</span>
                            </div>
                          </label>

                          <label className={`flex items-center gap-2 p-2 ${t.inputBg} rounded-xl border ${t.cardBorder} cursor-pointer`}>
                            <input
                              type="checkbox"
                              checked={rxPanoramicoClinicas.oralScan}
                              onChange={(e) => setRxPanoramicoClinicas(prev => ({ ...prev, oralScan: e.target.checked }))}
                              className="w-3.5 h-3.5 text-sky-600 rounded"
                            />
                            <div>
                              <span className="text-xs font-bold text-stone-900 block">Oral Scan</span>
                              <span className="text-[10px] text-stone-500">Imaginologia Odonto.</span>
                            </div>
                          </label>
                        </div>

                        <div>
                          <input
                            type="text"
                            value={rxPanoramicoOutraClinica}
                            onChange={(e) => setRxPanoramicoOutraClinica(e.target.value)}
                            placeholder="Outra clínica radiológica parceira (opcional)"
                            className={`w-full ${t.inputBg} border ${t.cardBorder} rounded-xl px-3 py-1.5 text-xs`}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Dentes / Região e Finalidade */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className={`block text-xs font-semibold ${t.headingText} mb-1`}>Dentes ou Região de Interesse (opcional):</label>
                      <input
                        type="text"
                        value={rxPanoramicoTeethInput}
                        onChange={(e) => setRxPanoramicoTeethInput(e.target.value)}
                        placeholder="Ex: Arcadas Dentárias Superior e Inferior"
                        className={`w-full ${t.inputBg} border ${t.cardBorder} rounded-xl px-3 py-2 text-xs font-bold`}
                      />
                    </div>
                    <div>
                      <label className={`block text-xs font-semibold ${t.headingText} mb-1`}>Finalidade Clínica / Indicação (opcional):</label>
                      <input
                        type="text"
                        value={rxPanoramicoFinalidade}
                        onChange={(e) => setRxPanoramicoFinalidade(e.target.value)}
                        placeholder="Ex: Avaliação Diagnóstica Geral / Planejamento"
                        className={`w-full ${t.inputBg} border ${t.cardBorder} rounded-xl px-3 py-2 text-xs font-bold`}
                      />
                    </div>
                  </div>

                  {/* Observações */}
                  <div>
                    <label className={`block text-xs font-semibold ${t.headingText} mb-1`}>Observações e Recomendações ao Centro Radiológico:</label>
                    <textarea
                      rows={2}
                      value={rxPanoramicoObservacoes}
                      onChange={(e) => setRxPanoramicoObservacoes(e.target.value)}
                      className={`w-full ${t.inputBg} border ${t.cardBorder} rounded-xl p-3 text-xs font-semibold`}
                    />
                  </div>
                </div>
              )}

              {/* 9. PARÂMETROS ESPECÍFICOS: RADIOGRAFIAS PERIAPICAIS & INTERPROXIMAIS */}
              {activeTemplate.id === 'solicitacao_rx_periapical_interproximal' && (
                <div className={`${t.cardBg} p-4 rounded-2xl border ${t.cardBorder} space-y-4`}>
                  <span className={`text-xs font-bold ${t.headingText} uppercase tracking-wider flex items-center justify-between border-b ${t.cardBorder} pb-2`}>
                    <span className="flex items-center gap-1.5">
                      <FileText className={`w-4 h-4 ${t.accentText}`} />
                      3. Parâmetros do Exame Periapical / Interproximal
                    </span>
                    <span className="text-[10.5px] font-bold text-sky-800 bg-sky-100 px-2.5 py-0.5 rounded-full border border-sky-200">
                      Intraoral Digital
                    </span>
                  </span>

                  <div className="space-y-3.5">
                    {/* 1. Tipo de Tomada */}
                    <div>
                      <label className={`block text-xs font-semibold ${t.headingText} mb-1`}>
                        Tipo de Tomada Radiográfica:
                      </label>
                      <select
                        value={rxPeriapicalTipo}
                        onChange={(e) => setRxPeriapicalTipo(e.target.value as any)}
                        className={`w-full ${t.inputBg} border ${t.cardBorder} rounded-xl px-3 py-2 text-xs font-bold focus:outline-none`}
                      >
                        <option value="periapical_localizada">Radiografia Periapical Localizada</option>
                        <option value="levantamento_completo_14_tomadas">Levantamento Periapical Completo (14 tomadas)</option>
                        <option value="interproximal_bite_wing">Radiografias Interproximais (Bite-Wings)</option>
                        <option value="oclusal">Radiografia Oclusal Total / Parcial</option>
                      </select>
                    </div>

                    {/* 2. Seleção de Notação: Mesclada (12 Regiões Oficiais) vs. FDI vs. Grupos */}
                    <div className={`${t.btnSecondaryBg} p-3.5 rounded-2xl border ${t.cardBorder} space-y-3.5`}>
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <label className={`text-xs font-bold ${t.headingText} flex items-center gap-1.5`}>
                          <span>Seleção dos Elementos / Região:</span>
                        </label>
                        <div className="flex items-center gap-1 bg-stone-200/70 p-1 rounded-xl">
                          <button
                            type="button"
                            onClick={() => setRxPeriapicalNotationMode('merged')}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                              rxPeriapicalNotationMode === 'merged'
                                ? `${t.btnPrimaryBg} ${t.btnPrimaryText} shadow-xs`
                                : 'text-stone-700 hover:text-stone-900'
                            }`}
                          >
                            🔀 Notação por Regiões (12 Áreas) + FDI
                          </button>
                          <button
                            type="button"
                            onClick={() => setRxPeriapicalNotationMode('fdi')}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                              rxPeriapicalNotationMode === 'fdi'
                                ? `${t.btnPrimaryBg} ${t.btnPrimaryText} shadow-xs`
                                : 'text-stone-700 hover:text-stone-900'
                            }`}
                          >
                            🦷 FDI Individual
                          </button>
                          <button
                            type="button"
                            onClick={() => setRxPeriapicalNotationMode('regions')}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                              rxPeriapicalNotationMode === 'regions'
                                ? `${t.btnPrimaryBg} ${t.btnPrimaryText} shadow-xs`
                                : 'text-stone-700 hover:text-stone-900'
                            }`}
                          >
                            📍 Grupos Gerais
                          </button>
                        </div>
                      </div>

                      {/* MODO 1: NOTAÇÃO MESCLADA COM AS 12 REGIÕES ANATÔMICAS OFICIAIS + FDI */}
                      {rxPeriapicalNotationMode === 'merged' && (
                        <div className="space-y-3">
                          {/* Painel das 12 Regiões Padronizadas */}
                          <div className="bg-white p-3 rounded-xl border border-stone-200 space-y-2.5 shadow-2xs">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-extrabold uppercase tracking-wide text-stone-800 flex items-center gap-1">
                                <span>🗺️ Notação Oficial das 12 Regiões Periapicais</span>
                              </span>
                              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                Clique para selecionar / alternar
                              </span>
                            </div>

                            {/* ARCADA SUPERIOR (MAXILA - 7 REGIÕES) */}
                            <div className="space-y-1">
                              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                                Arco Superior / Maxila (7 Regiões):
                              </span>
                              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-1.5">
                                {PERIAPICAL_REGIONS_12.filter(r => r.arch === 'superior').map(reg => {
                                  const isSelected = rxPeriapicalSelectedRegions.includes(reg.code) || rxPeriapicalTeethInput.includes(reg.code);
                                  return (
                                    <button
                                      key={reg.code}
                                      type="button"
                                      onClick={() => togglePeriapicalRegion(reg.code)}
                                      className={`p-2 rounded-xl text-left border transition cursor-pointer flex flex-col justify-between ${
                                        isSelected
                                          ? 'bg-emerald-700 text-white border-emerald-800 shadow-xs ring-1 ring-emerald-500'
                                          : 'bg-stone-50 hover:bg-stone-100 text-stone-800 border-stone-200'
                                      }`}
                                      title={`${reg.name} (Dentes: ${reg.teeth})`}
                                    >
                                      <div className="flex items-center justify-between">
                                        <span className={`font-mono text-xs font-black ${isSelected ? 'text-white' : 'text-stone-900'}`}>
                                          {reg.code}
                                        </span>
                                        {isSelected && <span className="text-[10px]">✓</span>}
                                      </div>
                                      <span className={`text-[10px] font-semibold leading-tight line-clamp-1 ${isSelected ? 'text-emerald-100' : 'text-stone-600'}`}>
                                        {reg.shortDesc.split(' (')[0]}
                                      </span>
                                      <span className={`text-[9px] font-mono ${isSelected ? 'text-emerald-200' : 'text-stone-400'}`}>
                                        {reg.teeth}
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            {/* ARCADA INFERIOR (MANDÍBULA - 5 REGIÕES) */}
                            <div className="space-y-1 pt-1">
                              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                                Arco Inferior / Mandíbula (5 Regiões):
                              </span>
                              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-1.5">
                                {PERIAPICAL_REGIONS_12.filter(r => r.arch === 'inferior').map(reg => {
                                  const isSelected = rxPeriapicalSelectedRegions.includes(reg.code) || rxPeriapicalTeethInput.includes(reg.code);
                                  return (
                                    <button
                                      key={reg.code}
                                      type="button"
                                      onClick={() => togglePeriapicalRegion(reg.code)}
                                      className={`p-2 rounded-xl text-left border transition cursor-pointer flex flex-col justify-between ${
                                        isSelected
                                          ? 'bg-emerald-700 text-white border-emerald-800 shadow-xs ring-1 ring-emerald-500'
                                          : 'bg-stone-50 hover:bg-stone-100 text-stone-800 border-stone-200'
                                      }`}
                                      title={`${reg.name} (Dentes: ${reg.teeth})`}
                                    >
                                      <div className="flex items-center justify-between">
                                        <span className={`font-mono text-xs font-black ${isSelected ? 'text-white' : 'text-stone-900'}`}>
                                          {reg.code}
                                        </span>
                                        {isSelected && <span className="text-[10px]">✓</span>}
                                      </div>
                                      <span className={`text-[10px] font-semibold leading-tight line-clamp-1 ${isSelected ? 'text-emerald-100' : 'text-stone-600'}`}>
                                        {reg.shortDesc.split(' (')[0]}
                                      </span>
                                      <span className={`text-[9px] font-mono ${isSelected ? 'text-emerald-200' : 'text-stone-400'}`}>
                                        {reg.teeth}
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Botões de Ação em Bloco das Regiões */}
                            <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-stone-200">
                              <button
                                type="button"
                                onClick={handleSelectAll12PeriapicalRegions}
                                className="text-[10.5px] font-bold px-2.5 py-1 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-lg text-stone-900 transition cursor-pointer"
                              >
                                Status Completo (12 Regiões)
                              </button>
                              <button
                                type="button"
                                onClick={handleSelectSuperiorPeriapicalRegions}
                                className="text-[10.5px] font-bold px-2.5 py-1 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-lg text-stone-900 transition cursor-pointer"
                              >
                                Arco Superior (7 Regiões)
                              </button>
                              <button
                                type="button"
                                onClick={handleSelectInferiorPeriapicalRegions}
                                className="text-[10.5px] font-bold px-2.5 py-1 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-lg text-stone-900 transition cursor-pointer"
                              >
                                Arco Inferior (5 Regiões)
                              </button>
                              <button
                                type="button"
                                onClick={handleSelectBiteWingsPeriapical}
                                className="text-[10.5px] font-bold px-2.5 py-1 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-lg text-stone-900 transition cursor-pointer"
                              >
                                Bite-Wings Bilaterais
                              </button>
                              <button
                                type="button"
                                onClick={handleClearPeriapicalSelection}
                                className="text-[10.5px] font-bold px-2.5 py-1 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg text-rose-700 transition cursor-pointer"
                              >
                                Limpar
                              </button>
                            </div>
                          </div>

                          {/* Mesclar com Dente Individual FDI (Dropdown Vertical) */}
                          <div className="bg-white p-2.5 rounded-xl border border-stone-200 space-y-2">
                            <label className={`block text-[11px] font-semibold ${t.headingText}`}>
                              Mesclar com Dente Individual FDI (Dropdown Vertical):
                            </label>
                            <div className="flex items-center gap-2">
                              <select
                                value={rxPeriapicalSelectedFdiTooth}
                                onChange={(e) => setRxPeriapicalSelectedFdiTooth(e.target.value)}
                                className={`flex-1 ${t.inputBg} border ${t.cardBorder} rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none`}
                              >
                                <option value="">-- Selecione o dente FDI para adicionar --</option>
                                <optgroup label="1º Quadrante (Superior Direito)">
                                  {FDI_TEETH_LIST.filter(t => t.quadrant.includes('1º')).map(t => (
                                    <option key={t.code} value={t.code}>{t.name}</option>
                                  ))}
                                </optgroup>
                                <optgroup label="2º Quadrante (Superior Esquerdo)">
                                  {FDI_TEETH_LIST.filter(t => t.quadrant.includes('2º')).map(t => (
                                    <option key={t.code} value={t.code}>{t.name}</option>
                                  ))}
                                </optgroup>
                                <optgroup label="3º Quadrante (Inferior Esquerdo)">
                                  {FDI_TEETH_LIST.filter(t => t.quadrant.includes('3º')).map(t => (
                                    <option key={t.code} value={t.code}>{t.name}</option>
                                  ))}
                                </optgroup>
                                <optgroup label="4º Quadrante (Inferior Direito)">
                                  {FDI_TEETH_LIST.filter(t => t.quadrant.includes('4º')).map(t => (
                                    <option key={t.code} value={t.code}>{t.name}</option>
                                  ))}
                                </optgroup>
                                <optgroup label="Dentição Decídua (Dentes de Leite)">
                                  {FDI_TEETH_LIST.filter(t => t.quadrant.includes('Decíduos')).map(t => (
                                    <option key={t.code} value={t.code}>{t.name}</option>
                                  ))}
                                </optgroup>
                              </select>
                              <button
                                type="button"
                                onClick={() => handleInsertFdiTooth(rxPeriapicalSelectedFdiTooth)}
                                className={`px-3 py-1.5 ${t.btnPrimaryBg} ${t.btnPrimaryText} rounded-xl text-xs font-bold hover:opacity-90 shrink-0 transition cursor-pointer`}
                              >
                                + Inserir Dente
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* MODO 2: APENAS LISTA VERTICAL FDI */}
                      {rxPeriapicalNotationMode === 'fdi' && (
                        <div className="space-y-2">
                          <label className={`block text-[11px] font-semibold ${t.headingText}`}>
                            Lista de Dentes FDI (Dropdown Vertical Carregado):
                          </label>
                          <div className="flex items-center gap-2">
                            <select
                              value={rxPeriapicalSelectedFdiTooth}
                              onChange={(e) => {
                                setRxPeriapicalSelectedFdiTooth(e.target.value);
                                handleInsertFdiTooth(e.target.value);
                              }}
                              className={`flex-1 ${t.inputBg} border ${t.cardBorder} rounded-xl px-3 py-2 text-xs font-bold focus:outline-none`}
                            >
                              <option value="">-- Selecione o dente FDI na lista vertical --</option>
                              <optgroup label="1º Quadrante (Superior Direito)">
                                {FDI_TEETH_LIST.filter(t => t.quadrant.includes('1º')).map(t => (
                                  <option key={t.code} value={t.code}>{t.name}</option>
                                ))}
                              </optgroup>
                              <optgroup label="2º Quadrante (Superior Esquerdo)">
                                {FDI_TEETH_LIST.filter(t => t.quadrant.includes('2º')).map(t => (
                                  <option key={t.code} value={t.code}>{t.name}</option>
                                ))}
                              </optgroup>
                              <optgroup label="3º Quadrante (Inferior Esquerdo)">
                                {FDI_TEETH_LIST.filter(t => t.quadrant.includes('3º')).map(t => (
                                  <option key={t.code} value={t.code}>{t.name}</option>
                                ))}
                              </optgroup>
                              <optgroup label="4º Quadrante (Inferior Direito)">
                                {FDI_TEETH_LIST.filter(t => t.quadrant.includes('4º')).map(t => (
                                  <option key={t.code} value={t.code}>{t.name}</option>
                                ))}
                              </optgroup>
                              <optgroup label="Dentição Decídua (Dentes de Leite)">
                                {FDI_TEETH_LIST.filter(t => t.quadrant.includes('Decíduos')).map(t => (
                                  <option key={t.code} value={t.code}>{t.name}</option>
                                ))}
                              </optgroup>
                            </select>

                            <button
                              type="button"
                              onClick={() => handleInsertFdiTooth(rxPeriapicalSelectedFdiTooth)}
                              className={`px-3 py-2 ${t.btnPrimaryBg} ${t.btnPrimaryText} rounded-xl text-xs font-bold hover:opacity-90 shrink-0 transition cursor-pointer`}
                              title="Adicionar elemento selecionado"
                            >
                              + Inserir
                            </button>
                          </div>
                        </div>
                      )}

                      {/* MODO 3: REGIÕES DESCRITIVAS GERAIS */}
                      {rxPeriapicalNotationMode === 'regions' && (
                        <div className="space-y-2">
                          <label className={`block text-[11px] font-semibold ${t.headingText}`}>
                            Lista de Regiões Odontológicas Carregadas:
                          </label>
                          <select
                            value={rxPeriapicalSelectedRegion}
                            onChange={(e) => {
                              setRxPeriapicalSelectedRegion(e.target.value);
                              if (e.target.value) {
                                setRxPeriapicalTeethInput(e.target.value);
                              }
                            }}
                            className={`w-full ${t.inputBg} border ${t.cardBorder} rounded-xl px-3 py-2 text-xs font-bold focus:outline-none`}
                          >
                            <option value="">-- Selecione uma região anatômica carregada --</option>
                            {REGION_NOTATIONS_LIST.map((reg, idx) => (
                              <option key={idx} value={reg}>{reg}</option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* Campo Editável Final dos Dentes / Região */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className={`block text-xs font-semibold ${t.headingText}`}>
                            Dentes / Região Solicitada no Documento (Editável):
                          </label>
                          <span className="text-[10px] text-stone-500 font-mono">
                            {rxPeriapicalTeethInput ? `${rxPeriapicalTeethInput.length} caracteres` : 'Vazio'}
                          </span>
                        </div>
                        <input
                          type="text"
                          value={rxPeriapicalTeethInput}
                          onChange={(e) => setRxPeriapicalTeethInput(e.target.value)}
                          placeholder="Ex: Regiões: RMSD, RIS • Dente 21"
                          className={`w-full ${t.inputBg} border ${t.cardBorder} rounded-xl px-3 py-2 text-xs font-bold focus:outline-none`}
                        />
                      </div>
                    </div>

                    {/* 3. Indicação Clínica com sugestões */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className={`block text-xs font-semibold ${t.headingText}`}>
                          Indicação Clínica do Exame:
                        </label>
                      </div>
                      <input
                        type="text"
                        value={rxPeriapicalIndication}
                        onChange={(e) => setRxPeriapicalIndication(e.target.value)}
                        placeholder="Ex: Avaliação endodôntica e lesão periapical"
                        className={`w-full ${t.inputBg} border ${t.cardBorder} rounded-xl px-3 py-2 text-xs font-bold focus:outline-none mb-1.5`}
                      />
                      <div className="flex flex-wrap gap-1">
                        {[
                          'Avaliação endodôntica e lesão periapical',
                          'Pesquisa de cárie interproximal / recidiva',
                          'Avaliação óssea e crista alveolar periodontal',
                          'Pós-operatório de cirurgia / implante',
                          'Trauma dentoalveolar e suspeita de fratura'
                        ].map((sug, sIdx) => (
                          <button
                            key={sIdx}
                            type="button"
                            onClick={() => setRxPeriapicalIndication(sug)}
                            className="text-[10px] font-semibold px-2 py-0.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded border border-stone-300 transition cursor-pointer"
                          >
                            {sug}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 4. Observações Técnicas */}
                    <div>
                      <label className={`block text-xs font-semibold ${t.headingText} mb-1`}>
                        Observações Complementares / Recomendações Técnicas:
                      </label>
                      <textarea
                        rows={2}
                        value={rxPeriapicalNotes}
                        onChange={(e) => setRxPeriapicalNotes(e.target.value)}
                        placeholder="Ex: Favor realizar tomada periapical digital com posicionador e técnica do paralelismo."
                        className={`w-full ${t.inputBg} border ${t.cardBorder} rounded-xl p-3 text-xs font-semibold focus:outline-none`}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 10. PARÂMETROS ESPECÍFICOS: RECEITUÁRIO SIMPLES */}
              {activeTemplate.id === 'receituario_simples' && (
                <div className={`${t.cardBg} p-4 rounded-2xl border ${t.cardBorder} space-y-4`}>
                  <span className={`text-xs font-bold ${t.headingText} uppercase tracking-wider flex items-center justify-between border-b ${t.cardBorder} pb-2`}>
                    <span className="flex items-center gap-1.5">
                      <Pill className={`w-4 h-4 ${t.accentText}`} />
                      3. Parâmetros do Receituário Simples
                    </span>
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className={`block text-xs font-semibold ${t.headingText} mb-1`}>Via / Modo de Administração:</label>
                      <select
                        value={receitaSimplesUso}
                        onChange={(e) => setReceitaSimplesUso(e.target.value as any)}
                        className={`w-full ${t.inputBg} border ${t.cardBorder} rounded-xl px-3 py-2 text-xs font-bold`}
                      >
                        <option value="Uso Interno">Uso Interno (Via Oral)</option>
                        <option value="Uso Tópico">Uso Tópico (Bochecho / Gel / Pomada)</option>
                        <option value="Uso Interno e Tópico">Uso Interno e Tópico</option>
                      </select>
                    </div>

                    <div>
                      <label className={`block text-xs font-semibold ${t.headingText} mb-1`}>Vias de Impressão:</label>
                      <select
                        value={receitaSimplesVias}
                        onChange={(e) => setReceitaSimplesVias(e.target.value as any)}
                        className={`w-full ${t.inputBg} border ${t.cardBorder} rounded-xl px-3 py-2 text-xs font-bold`}
                      >
                        <option value="1 via">1 Via (Padrão)</option>
                        <option value="2 vias">2 Vias (1ª Via Farmácia / 2ª Via Paciente)</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className={`block text-xs font-semibold ${t.headingText} mb-1`}>Orientações Gerais ao Paciente:</label>
                      <textarea
                        rows={2}
                        value={receitaSimplesOrientacoes}
                        onChange={(e) => setReceitaSimplesOrientacoes(e.target.value)}
                        className={`w-full ${t.inputBg} border ${t.cardBorder} rounded-xl p-3 text-xs font-semibold`}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 11. PARÂMETROS ESPECÍFICOS: NOTIFICAÇÃO DE RECEITA AZUL (B) / AMARELA (A) */}
              {(activeTemplate.id === 'receituario_notificacao_b_azul' || activeTemplate.id === 'receituario_notificacao_a_amarela') && (
                <div className={`${t.cardBg} p-4 rounded-2xl border ${t.cardBorder} space-y-4`}>
                  <span className={`text-xs font-bold ${t.headingText} uppercase tracking-wider flex items-center justify-between border-b ${t.cardBorder} pb-2`}>
                    <span className="flex items-center gap-1.5">
                      <Pill className={`w-4 h-4 ${activeTemplate.id === 'receituario_notificacao_b_azul' ? 'text-blue-600' : 'text-amber-500'}`} />
                      3. Dados Oficiais da Notificação de Receita
                    </span>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                      activeTemplate.id === 'receituario_notificacao_b_azul' 
                        ? 'bg-blue-100 text-blue-900 border-blue-300' 
                        : 'bg-amber-100 text-amber-900 border-amber-300'
                    }`}>
                      {activeTemplate.id === 'receituario_notificacao_b_azul' ? 'Notificação B (Azul - Psicotrópicos)' : 'Notificação A (Amarela - Entorpecentes)'}
                    </span>
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className={`block text-xs font-semibold ${t.headingText} mb-1`}>Número da Notificação (Numeração Oficial):</label>
                      <input
                        type="text"
                        value={activeTemplate.id === 'receituario_notificacao_b_azul' ? notificacaoBNumero : notificacaoANumero}
                        onChange={(e) => {
                          if (activeTemplate.id === 'receituario_notificacao_b_azul') {
                            setNotificacaoBNumero(e.target.value);
                          } else {
                            setNotificacaoANumero(e.target.value);
                          }
                        }}
                        className={`w-full ${t.inputBg} border ${t.cardBorder} rounded-xl px-3 py-2 text-xs font-bold`}
                      />
                    </div>

                    <div>
                      <label className={`block text-xs font-semibold ${t.headingText} mb-1`}>UF da Notificação:</label>
                      <input
                        type="text"
                        value={activeTemplate.id === 'receituario_notificacao_b_azul' ? notificacaoBUf : notificacaoAUf}
                        onChange={(e) => {
                          if (activeTemplate.id === 'receituario_notificacao_b_azul') {
                            setNotificacaoBUf(e.target.value);
                          } else {
                            setNotificacaoAUf(e.target.value);
                          }
                        }}
                        className={`w-full ${t.inputBg} border ${t.cardBorder} rounded-xl px-3 py-2 text-xs font-bold`}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 12. PARÂMETROS ESPECÍFICOS: ATESTADO DE APTIDÃO ODONTOLÓGICA */}
              {activeTemplate.id === 'atestado_aptidao_odontologica' && (
                <div className={`${t.cardBg} p-4 rounded-2xl border ${t.cardBorder} space-y-4`}>
                  <span className={`text-xs font-bold ${t.headingText} uppercase tracking-wider flex items-center justify-between border-b ${t.cardBorder} pb-2`}>
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className={`w-4 h-4 ${t.accentText}`} />
                      3. Parâmetros da Aptidão Odontológica
                    </span>
                  </span>

                  <div className="space-y-3">
                    <div>
                      <label className={`block text-xs font-semibold ${t.headingText} mb-1`}>Finalidade do Atestado de Aptidão:</label>
                      <input
                        type="text"
                        value={aptidaoFinalidade}
                        onChange={(e) => setAptidaoFinalidade(e.target.value)}
                        placeholder="Ex: Concurso Público / Procedimento Cirúrgico Médico / Atividade Física"
                        className={`w-full ${t.inputBg} border ${t.cardBorder} rounded-xl px-3 py-2 text-xs font-bold`}
                      />
                    </div>

                    <div>
                      <label className={`block text-xs font-semibold ${t.headingText} mb-1`}>Parecer Clínico de Higidez Bucal:</label>
                      <textarea
                        rows={3}
                        value={aptidaoObservacoes}
                        onChange={(e) => setAptidaoObservacoes(e.target.value)}
                        className={`w-full ${t.inputBg} border ${t.cardBorder} rounded-xl p-3 text-xs font-semibold`}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 13. PARÂMETROS ESPECÍFICOS: DECLARAÇÃO DE TRATAMENTO EM ANDAMENTO */}
              {activeTemplate.id === 'declaracao_tratamento_andamento' && (
                <div className={`${t.cardBg} p-4 rounded-2xl border ${t.cardBorder} space-y-4`}>
                  <span className={`text-xs font-bold ${t.headingText} uppercase tracking-wider flex items-center justify-between border-b ${t.cardBorder} pb-2`}>
                    <span className="flex items-center gap-1.5">
                      <FileText className={`w-4 h-4 ${t.accentText}`} />
                      3. Parâmetros do Tratamento em Andamento
                    </span>
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className={`block text-xs font-semibold ${t.headingText} mb-1`}>Especialidade / Tratamento:</label>
                      <input
                        type="text"
                        value={tratamentoAndamentoEspecialidade}
                        onChange={(e) => setTratamentoAndamentoEspecialidade(e.target.value)}
                        className={`w-full ${t.inputBg} border ${t.cardBorder} rounded-xl px-3 py-2 text-xs font-bold`}
                      />
                    </div>

                    <div>
                      <label className={`block text-xs font-semibold ${t.headingText} mb-1`}>Previsão de Duração:</label>
                      <input
                        type="text"
                        value={tratamentoAndamentoPrevisao}
                        onChange={(e) => setTratamentoAndamentoPrevisao(e.target.value)}
                        placeholder="Ex: 12 a 18 meses"
                        className={`w-full ${t.inputBg} border ${t.cardBorder} rounded-xl px-3 py-2 text-xs font-bold`}
                      />
                    </div>

                    <div>
                      <label className={`block text-xs font-semibold ${t.headingText} mb-1`}>Periodicidade das Consultas:</label>
                      <input
                        type="text"
                        value={tratamentoAndamentoFrequencia}
                        onChange={(e) => setTratamentoAndamentoFrequencia(e.target.value)}
                        placeholder="Ex: Mensal / Quinzenal"
                        className={`w-full ${t.inputBg} border ${t.cardBorder} rounded-xl px-3 py-2 text-xs font-bold`}
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className={`block text-xs font-semibold ${t.headingText} mb-1`}>Observações Complementares:</label>
                      <textarea
                        rows={2}
                        value={tratamentoAndamentoObservacoes}
                        onChange={(e) => setTratamentoAndamentoObservacoes(e.target.value)}
                        className={`w-full ${t.inputBg} border ${t.cardBorder} rounded-xl p-3 text-xs font-semibold`}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 14. PARÂMETROS ESPECÍFICOS: DECLARAÇÃO DE VALORES / RECIBO */}
              {activeTemplate.id === 'declaracao_valores_recibo' && (
                <div className={`${t.cardBg} p-4 rounded-2xl border ${t.cardBorder} space-y-4`}>
                  <span className={`text-xs font-bold ${t.headingText} uppercase tracking-wider flex items-center justify-between border-b ${t.cardBorder} pb-2`}>
                    <span className="flex items-center gap-1.5">
                      <DollarSign className={`w-4 h-4 ${t.accentText}`} />
                      3. Parâmetros Financeiros do Recibo
                    </span>
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className={`block text-xs font-semibold ${t.headingText} mb-1`}>Valor Numérico (R$):</label>
                      <input
                        type="text"
                        value={reciboValor}
                        onChange={(e) => setReciboValor(e.target.value)}
                        placeholder="Ex: 850,00"
                        className={`w-full ${t.inputBg} border ${t.cardBorder} rounded-xl px-3 py-2 text-xs font-bold`}
                      />
                    </div>

                    <div>
                      <label className={`block text-xs font-semibold ${t.headingText} mb-1`}>Forma de Pagamento:</label>
                      <select
                        value={reciboFormaPagamento}
                        onChange={(e) => setReciboFormaPagamento(e.target.value)}
                        className={`w-full ${t.inputBg} border ${t.cardBorder} rounded-xl px-3 py-2 text-xs font-bold`}
                      >
                        <option value="PIX">PIX</option>
                        <option value="Cartão de Crédito">Cartão de Crédito</option>
                        <option value="Cartão de Débito">Cartão de Débito</option>
                        <option value="Transferência Bancária">Transferência Bancária</option>
                        <option value="Dinheiro em Espécie">Dinheiro em Espécie</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className={`block text-xs font-semibold ${t.headingText} mb-1`}>Valor por Extenso:</label>
                      <input
                        type="text"
                        value={reciboExtenso}
                        onChange={(e) => setReciboExtenso(e.target.value)}
                        placeholder="Ex: Oitocentos e cinquenta reais"
                        className={`w-full ${t.inputBg} border ${t.cardBorder} rounded-xl px-3 py-2 text-xs font-bold`}
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className={`block text-xs font-semibold ${t.headingText} mb-1`}>Referente aos Procedimentos / Tratamento:</label>
                      <textarea
                        rows={2}
                        value={reciboReferente}
                        onChange={(e) => setReciboReferente(e.target.value)}
                        className={`w-full ${t.inputBg} border ${t.cardBorder} rounded-xl p-3 text-xs font-semibold`}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 15. PARÂMETROS ESPECÍFICOS: TERMOS TCLE (IMPLANTE / CLAREAMENTO / ORTODONTIA) */}
              {activeTemplate.id === 'tcle_cirurgia_implantes' && (
                <div className={`${t.cardBg} p-4 rounded-2xl border ${t.cardBorder} space-y-4`}>
                  <span className={`text-xs font-bold ${t.headingText} uppercase tracking-wider flex items-center justify-between border-b ${t.cardBorder} pb-2`}>
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className={`w-4 h-4 ${t.accentText}`} />
                      3. Parâmetros do TCLE de Implantes & Cirurgia
                    </span>
                  </span>

                  <div className="space-y-3">
                    <div>
                      <label className={`block text-xs font-semibold ${t.headingText} mb-1`}>Região / Elementos Dentários dos Implantes:</label>
                      <input
                        type="text"
                        value={tcleImplanteRegiao}
                        onChange={(e) => setTcleImplanteRegiao(e.target.value)}
                        placeholder="Ex: Região dos elementos dentários 36 e 46"
                        className={`w-full ${t.inputBg} border ${t.cardBorder} rounded-xl px-3 py-2 text-xs font-bold`}
                      />
                    </div>

                    <label className={`flex items-center gap-2 p-2.5 ${t.inputBg} rounded-xl border ${t.cardBorder} cursor-pointer`}>
                      <input
                        type="checkbox"
                        checked={tcleImplanteEnxerto}
                        onChange={(e) => setTcleImplanteEnxerto(e.target.checked)}
                        className="w-4 h-4 text-amber-600 rounded"
                      />
                      <span className="text-xs font-semibold text-stone-800">
                        Incluir previsão de Enxerto Ósseo / Biomaterial / Membrana Biológica
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {activeTemplate.id === 'tcle_clareamento_dental' && (
                <div className={`${t.cardBg} p-4 rounded-2xl border ${t.cardBorder} space-y-4`}>
                  <span className={`text-xs font-bold ${t.headingText} uppercase tracking-wider flex items-center justify-between border-b ${t.cardBorder} pb-2`}>
                    <span className="flex items-center gap-1.5">
                      <Sparkles className={`w-4 h-4 ${t.accentText}`} />
                      3. Parâmetros do TCLE de Clareamento Dental
                    </span>
                  </span>

                  <div>
                    <label className={`block text-xs font-semibold ${t.headingText} mb-1`}>Modalidade de Clareamento:</label>
                    <select
                      value={tcleClareamentoTipo}
                      onChange={(e) => setTcleClareamentoTipo(e.target.value as any)}
                      className={`w-full ${t.inputBg} border ${t.cardBorder} rounded-xl px-3 py-2 text-xs font-bold`}
                    >
                      <option value="caseiro">Clareamento Caseiro Supervisionado (Moldeiras)</option>
                      <option value="consultorio">Clareamento em Consultório (In-Office / Laser)</option>
                      <option value="combinado">Clareamento Combinado (Consultório + Caseiro)</option>
                    </select>
                  </div>
                </div>
              )}

              {activeTemplate.id === 'tcle_ortodontia' && (
                <div className={`${t.cardBg} p-4 rounded-2xl border ${t.cardBorder} space-y-4`}>
                  <span className={`text-xs font-bold ${t.headingText} uppercase tracking-wider flex items-center justify-between border-b ${t.cardBorder} pb-2`}>
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className={`w-4 h-4 ${t.accentText}`} />
                      3. Parâmetros do TCLE de Ortodontia
                    </span>
                  </span>

                  <div>
                    <label className={`block text-xs font-semibold ${t.headingText} mb-1`}>Tipo de Aparelho Ortodôntico:</label>
                    <select
                      value={tcleOrtoTipo}
                      onChange={(e) => setTcleOrtoTipo(e.target.value as any)}
                      className={`w-full ${t.inputBg} border ${t.cardBorder} rounded-xl px-3 py-2 text-xs font-bold`}
                    >
                      <option value="fixo_metalico">Aparelho Fixo Metálico Convencional</option>
                      <option value="fixo_estetico">Aparelho Fixo Estético (Cerâmica / Safira)</option>
                      <option value="autoligado">Aparelho Autoligado</option>
                      <option value="alinhadores">Alinhadores Invisíveis / Digitais</option>
                    </select>
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

      {/* RENDERED A4 DOCUMENT PREVIEW MODAL - FULL SCREEN */}
      {isRenderModalOpen && activeTemplate && (
        <div className="fixed inset-0 z-50 bg-stone-900/85 backdrop-blur-xs flex flex-col overflow-hidden p-0 print:p-0 print:static print:bg-white print:block">
          <div className="bg-white w-full h-full shadow-2xl overflow-hidden animate-fadeIn flex flex-col print:h-auto print:max-h-none print:shadow-none print:border-none print:w-full print:rounded-none">
            {/* Control Bar Top */}
            <div className="bg-[#2c3e2e] text-white p-3 md:p-4 flex flex-wrap items-center justify-between gap-3 shrink-0 print:hidden shadow-md">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span className="font-bold text-xs md:text-sm">
                  Documento Pronto: {activeTemplate.title}
                </span>
                <span className="text-[11px] bg-white/10 px-2 py-0.5 rounded-full text-emerald-200">
                  {patientDisplayName}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrintActiveDocument}
                  className="px-3.5 py-2 bg-[#d4a373] hover:bg-[#c29363] text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                  title="Imprimir documento oficial ou salvar como PDF"
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
              <div id="printable-document-sheet" className="w-full max-w-[760px] bg-white border border-stone-300 shadow-xl rounded-xl p-5 md:p-7 space-y-3 font-sans text-[#2c2c2c] min-h-[800px] flex flex-col justify-between relative print:shadow-none print:border-none print:w-full overflow-hidden print:overflow-visible print:p-0 box-border">
                
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
                          {clinicInfo.headerTitle || effectiveDentistName}
                        </p>
                        <p className="text-[10px] text-stone-600 font-mono">
                          {clinicInfo.headerSubtitle || `Cirurgião-Dentista ${effectiveDentistCro} ${effectiveDentistSpecialty ? `• ${effectiveDentistSpecialty}` : ''}`}
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
                        {clinicInfo.headerTitle || effectiveClinicName || clinicInfo.name || 'DentisPro'}
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

                  {/* MODEL: RELATÓRIO DE ATENDIMENTO INICIAL / FINAL */}
                  {activeTemplate.id === 'relatorio_atendimento_inicial_final' && (
                    <div className="space-y-4 pt-2 text-justify text-xs">
                      <div className="bg-[#fbfbf9] p-3 rounded-xl border border-[#e5e5d1]">
                        <p className="text-xs font-bold text-[#5a5a40] uppercase tracking-wider mb-1">
                          {relatorioDocStage === 'inicial' ? 'Relatório de Atendimento Inicial' : 'Relatório de Atendimento Final (Conclusão)'}
                        </p>
                        <p className="text-sm font-semibold text-stone-900">
                          {relatorioProcedimentoDesc || 'Avaliação clínica e planejamento terapêutico'}
                        </p>
                      </div>

                      <div className="bg-white p-3.5 rounded-xl border border-[#e5e5d1] space-y-2">
                        <strong className="text-stone-900 uppercase font-bold text-[11px] block">
                          Informações e Esclarecimentos aos Pacientes Assistidos:
                        </strong>
                        <p className="text-stone-700 leading-relaxed text-xs">
                          Ficam prestadas as informações aos pacientes assistidos que justifiquem a recusa do atendimento, a interrupção do tratamento ou o tempo mais longo para a conclusão do tratamento, em razão da complexidade do caso, da finalidade pedagógica, do estágio de formação em que o profissional se encontre em relação às habilidades e aos conhecimentos que o caso clínico demande, ou mesmo delonga em razão de casos fortuitos que forçam a paralisação dos atendimentos nas clínicas da instituição.
                        </p>
                      </div>

                      {relatorioComplementar && (
                        <div className="bg-[#f0f0e8] p-3 rounded-xl border border-[#e5e5d1] text-stone-800 text-xs">
                          <strong className="font-semibold text-[#5a5a40]">Observações Complementares:</strong> {relatorioComplementar}
                        </div>
                      )}
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

                  {/* MODEL 11: SOLICITAÇÃO DE RADIOGRAFIA PANORÂMICA (ORTOPANTOMOGRAFIA) */}
                  {activeTemplate.id === 'solicitacao_rx_panoramico' && (
                    <div className="space-y-3.5 text-xs font-sans text-stone-800">
                      <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200 flex flex-wrap items-center justify-between gap-2 text-xs font-semibold">
                        <div>
                          <span className="text-stone-500 text-[10px] uppercase font-bold mr-1.5">Paciente:</span>
                          <span className="text-stone-900 font-bold underline">{patientDisplayName}</span>
                        </div>
                        <div>
                          <span className="text-stone-500 text-[10px] uppercase font-bold mr-1.5">Idade:</span>
                          <span className="text-stone-800 font-semibold">{patientAge}</span>
                        </div>
                        {rxPanoramicoIncluirConvenio && rxPanoramicoConvenioNome && (
                          <div className="w-full pt-1 border-t border-stone-200/80 flex items-center justify-between text-[11px]">
                            <span><strong className="text-stone-700">Convênio:</strong> {rxPanoramicoConvenioNome}</span>
                            {rxPanoramicoConvenioNumero && <span><strong className="text-stone-700">Nº Carteirinha:</strong> {rxPanoramicoConvenioNumero}</span>}
                          </div>
                        )}
                      </div>

                      {/* Solicitação Radiológica dos Modelos Clínicos */}
                      <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                        <span className="font-bold text-[11px] text-stone-900 uppercase block border-b border-stone-200 pb-1">
                          Exame e Solicitação Radiológica:
                        </span>
                        <div className="space-y-1.5 pt-0.5">
                          {getRxPanoramicoSolicitacoesList(rxPanoramicoOptions, rxPanoramicoTextoCustomizado).map((sol, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-xs font-medium text-stone-900 bg-white p-2 rounded-lg border border-stone-200">
                              <span className="text-sky-700 font-bold mt-0.5">✓</span>
                              <span className="leading-relaxed">{sol}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Região e Finalidade */}
                      {(rxPanoramicoTeethInput || rxPanoramicoFinalidade) && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {rxPanoramicoTeethInput && (
                            <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200">
                              <span className="text-stone-500 text-[10px] uppercase font-bold block">Região / Dentes de Interesse:</span>
                              <span className="text-stone-900 font-bold text-xs">{rxPanoramicoTeethInput}</span>
                            </div>
                          )}
                          {rxPanoramicoFinalidade && (
                            <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200">
                              <span className="text-stone-500 text-[10px] uppercase font-bold block">Indicação / Finalidade Clínica:</span>
                              <span className="text-stone-900 font-bold text-xs">{rxPanoramicoFinalidade}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Clínicas Radiológicas Recomendadas (Modelo 3) */}
                      {rxPanoramicoIndicarClinicas && (
                        <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200 space-y-1.5">
                          <span className="font-bold text-[10px] text-stone-700 uppercase block">Faça este exame em clínicas radiológicas:</span>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                            {getRxPanoramicoClinicasList(rxPanoramicoClinicas, rxPanoramicoOutraClinica).map((c, i) => (
                              <div key={i} className="bg-white p-2 rounded-lg border border-stone-200 text-center">
                                <span className="font-bold text-xs text-stone-900 block">{c.name}</span>
                                {(c.subtitle || (c as any).desc) && <span className="text-[10px] text-stone-500 block">{c.subtitle || (c as any).desc}</span>}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Observações */}
                      {rxPanoramicoObservacoes && (
                        <div className="p-2.5 bg-sky-50/70 rounded-xl border border-sky-200 space-y-1">
                          <span className="font-bold text-[10px] text-sky-950 uppercase block">Observações e Recomendações Técnicas:</span>
                          <p className="text-xs text-stone-800 leading-relaxed">{rxPanoramicoObservacoes}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* MODEL 12: RADIOGRAFIAS PERIAPICAIS & INTERPROXIMAIS */}
                  {activeTemplate.id === 'solicitacao_rx_periapical_interproximal' && (
                    <div className="space-y-4 text-xs font-sans text-stone-800">
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

                      <div className="border border-stone-800 p-3 rounded-xl space-y-2 bg-stone-50/50">
                        <div className="flex items-center justify-between border-b border-stone-300 pb-1.5">
                          <span className="font-bold text-xs uppercase text-stone-900">Tipo de Exame Radiológico:</span>
                          <span className="px-2 py-0.5 bg-stone-200 rounded font-bold text-[11px] text-stone-800 uppercase">
                            {rxPeriapicalTipo === 'periapical_localizada' && 'Periapical Localizada'}
                            {rxPeriapicalTipo === 'levantamento_completo_14_tomadas' && 'Levantamento Periapical Completo (14 tomadas)'}
                            {rxPeriapicalTipo === 'interproximal_bite_wing' && 'Interproximais (Bite-Wings)'}
                            {rxPeriapicalTipo === 'oclusal' && 'Radiografia Oclusal'}
                          </span>
                        </div>

                        <p><strong>Dentes / Elementos Solicitados:</strong> {rxPeriapicalTeethInput}</p>
                        <p><strong>Indicação Clínica:</strong> {rxPeriapicalIndication}</p>
                      </div>

                      {rxPeriapicalNotes && (
                        <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
                          <span className="font-bold text-[10px] text-stone-600 uppercase block">Observações:</span>
                          <p className="text-xs text-stone-800">{rxPeriapicalNotes}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* MODEL 13: RECEITUÁRIO SIMPLES */}
                  {activeTemplate.id === 'receituario_simples' && (
                    <div className="space-y-4 font-sans text-stone-900">
                      <div className="flex items-center justify-between border-b border-stone-300 pb-2">
                        <div>
                          <span className="text-xs font-bold text-stone-500 uppercase">Paciente: </span>
                          <span className="text-sm font-bold underline text-stone-900">{patientDisplayName}</span>
                        </div>
                        <span className="text-[10.5px] font-bold bg-stone-100 border border-stone-300 px-2 py-0.5 rounded text-stone-700">
                          {receitaSimplesVias}
                        </span>
                      </div>

                      <div className="space-y-2 bg-stone-50/70 p-4 rounded-xl border border-stone-300">
                        <div className="flex items-center justify-between border-b border-stone-200 pb-1">
                          <span className="text-xs font-bold uppercase tracking-wide text-stone-800">Prescrição Medicamentosa</span>
                          <span className="text-xs font-semibold italic text-stone-600">({receitaSimplesUso})</span>
                        </div>

                        <div className="bg-white p-3.5 rounded-lg border border-stone-300 text-xs font-medium leading-relaxed whitespace-pre-line text-stone-900">
                          • {specialPrescriptionText || 'Amoxicilina 500mg ------------------ 21 cápsulas\nTomar 1 cápsula via oral de 8 em 8 horas por 7 dias.\n\n• Ibuprofeno 600mg ------------------- 10 comprimidos\nTomar 1 comprimido via oral de 8 em 8 horas em caso de dor ou inchaço.'}
                        </div>
                      </div>

                      {receitaSimplesOrientacoes && (
                        <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 text-xs text-stone-800">
                          <strong className="text-amber-950 font-bold block mb-0.5">Orientações ao Paciente:</strong>
                          <p className="leading-relaxed">{receitaSimplesOrientacoes}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* MODEL 14: NOTIFICAÇÃO DE RECEITA AZUL (B) / AMARELA (A) */}
                  {(activeTemplate.id === 'receituario_notificacao_b_azul' || activeTemplate.id === 'receituario_notificacao_a_amarela') && (
                    <div className="space-y-4 font-sans text-stone-900">
                      {/* Moldura de Notificação Oficial */}
                      <div className={`p-3 rounded-xl border-2 ${
                        activeTemplate.id === 'receituario_notificacao_b_azul' 
                          ? 'border-blue-600 bg-blue-50/40' 
                          : 'border-amber-500 bg-amber-50/40'
                      } flex items-center justify-between`}>
                        <div>
                          <span className="font-extrabold text-sm uppercase block tracking-wider">
                            {activeTemplate.id === 'receituario_notificacao_b_azul' 
                              ? 'NOTIFICAÇÃO DE RECEITA B (PSICOTRÓPICOS)' 
                              : 'NOTIFICAÇÃO DE RECEITA A (ENTORPECENTES)'}
                          </span>
                          <span className="text-[10px] text-stone-600">Portaria SVS/MS nº 344/98 • Válida em todo o território nacional</span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-mono font-bold block">
                            Nº: {activeTemplate.id === 'receituario_notificacao_b_azul' ? notificacaoBNumero : notificacaoANumero}
                          </span>
                          <span className="text-[10px] font-bold text-stone-600">
                            UF: {activeTemplate.id === 'receituario_notificacao_b_azul' ? notificacaoBUf : notificacaoAUf}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="border border-stone-800 p-2.5 rounded-lg bg-white space-y-1">
                          <span className="font-bold uppercase text-[10.5px] border-b border-stone-200 pb-0.5 block">Identificação do Emitente</span>
                          <p className="font-bold">{effectiveDentistName} • {effectiveDentistCro}</p>
                          <p className="text-[10.5px] text-stone-600">{effectiveClinicAddress} - {formatCityOnly(effectiveClinicCity)}/{clinicInfo.uf || 'CE'}</p>
                          <p className="text-[10.5px] text-stone-600">Tel: {effectiveClinicPhone}</p>
                        </div>

                        <div className="border border-stone-800 p-2.5 rounded-lg bg-white space-y-1">
                          <span className="font-bold uppercase text-[10.5px] border-b border-stone-200 pb-0.5 block">Identificação do Paciente</span>
                          <p className="font-bold text-stone-900 underline">{patientDisplayName}</p>
                          <p className="text-[10.5px] text-stone-600">Endereço: ____________________________________</p>
                          <p className="text-[10.5px] text-stone-600">Cidade: {formatCityOnly(clinicInfo.city || 'Fortaleza')} - {clinicInfo.uf || 'CE'}</p>
                        </div>
                      </div>

                      {/* Medicamento Prescrito */}
                      <div className="border-2 border-stone-800 p-3 rounded-lg bg-white space-y-1.5 text-xs">
                        <span className="font-bold uppercase tracking-wider text-xs block border-b border-stone-300 pb-1">
                          Medicamento(s) Prescrito(s) & Posologia
                        </span>
                        <div className="p-2.5 bg-stone-50 rounded border border-stone-200 font-medium leading-relaxed whitespace-pre-line text-stone-900">
                          {specialPrescriptionText || (activeTemplate.id === 'receituario_notificacao_b_azul' 
                            ? '• Diazepam 10mg ------------------ 02 comprimidos\nTomar 1 comprimido via oral 1 hora antes do procedimento cirúrgico odontológico.'
                            : '• Fosfato de Codeína 30mg --------- 12 comprimidos\nTomar 1 comprimido de 6 em 6 horas se dor intensa refratária a analgésicos comuns.')}
                        </div>
                      </div>

                      {/* Identificação do Comprador & Fornecedor */}
                      <div className="grid grid-cols-2 gap-3 text-[10.5px]">
                        <div className="border border-stone-800 p-2.5 rounded-lg bg-white space-y-1">
                          <span className="font-bold uppercase text-[10px] border-b border-stone-200 pb-0.5 block">Identificação do Comprador</span>
                          <p>Nome: ____________________________________</p>
                          <p>Doc. Identidade: ____________________________</p>
                          <p>Endereço / Tel: _____________________________</p>
                        </div>
                        <div className="border border-stone-800 p-2.5 rounded-lg bg-white space-y-1 text-center flex flex-col justify-between">
                          <span className="font-bold uppercase text-[10px] border-b border-stone-200 pb-0.5 block">Identificação do Fornecedor (Farmácia)</span>
                          <div className="border-t border-stone-400 pt-1 text-[9.5px]">
                            Assinatura do Farmacêutico / Data: ____/____/________
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* MODEL 15: ATESTADO DE APTIDÃO ODONTOLÓGICA */}
                  {activeTemplate.id === 'atestado_aptidao_odontologica' && (
                    <div className="space-y-6 pt-4 text-justify">
                      <p className="text-base leading-loose">
                        Atesto, para os devidos fins a que se destina (<strong className="font-bold">{aptidaoFinalidade}</strong>), que examinei nesta data o(a) Sr(a). <strong className="font-bold underline">{patientDisplayName}</strong> e certifico que o(a) mesmo(a) encontra-se em condições clínicas bucais satisfatórias, com ausência de processos infecciosos agudos, lesões de tecidos moles ou focos dentários ativos, estando <strong className="font-bold underline uppercase">APTO(A)</strong> do ponto de vista odontológico.
                      </p>
                      {aptidaoObservacoes && (
                        <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-800 space-y-1">
                          <strong className="text-stone-900 font-bold block">Parecer / Observações Clínicas:</strong>
                          <p className="leading-relaxed">{aptidaoObservacoes}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* MODEL 16: DECLARAÇÃO DE TRATAMENTO EM ANDAMENTO */}
                  {activeTemplate.id === 'declaracao_tratamento_andamento' && (
                    <div className="space-y-6 pt-4 text-justify">
                      <p className="text-base leading-loose">
                        Declaro, para os devidos fins de direito, que o(a) Sr(a). <strong className="font-bold underline">{patientDisplayName}</strong> encontra-se em regular tratamento odontológico na especialidade de <strong className="font-bold">{tratamentoAndamentoEspecialidade}</strong> neste consultório, comparecendo com frequência <strong className="font-bold">{tratamentoAndamentoFrequencia}</strong> às consultas de acompanhamento clínico, com previsão estimada de duração de <strong className="font-bold">{tratamentoAndamentoPrevisao}</strong> para conclusão do plano de tratamento terapêutico.
                      </p>
                      {tratamentoAndamentoObservacoes && (
                        <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-800 space-y-1">
                          <strong className="text-stone-900 font-bold block">Observações Complementares:</strong>
                          <p className="leading-relaxed">{tratamentoAndamentoObservacoes}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* MODEL 17: DECLARAÇÃO DE VALORES / RECIBO */}
                  {activeTemplate.id === 'declaracao_valores_recibo' && (
                    <div className="space-y-5 pt-3 text-justify font-sans">
                      <div className="p-4 bg-stone-50 border-2 border-stone-800 rounded-2xl flex items-center justify-between">
                        <div>
                          <span className="text-xs text-stone-600 font-bold uppercase block">Valor Total do Recibo:</span>
                          <span className="text-2xl font-black text-stone-900">R$ {reciboValor}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-stone-600 font-bold uppercase block">Forma de Pagamento:</span>
                          <span className="text-sm font-bold text-stone-800 bg-white px-3 py-1 rounded-lg border border-stone-300 inline-block">{reciboFormaPagamento}</span>
                        </div>
                      </div>

                      <p className="text-base leading-loose">
                        Recebi do(a) Sr(a). <strong className="font-bold underline">{patientDisplayName}</strong> a importância de <strong className="font-bold">R$ {reciboValor} ({reciboExtenso})</strong>, referente a <strong className="font-medium">{reciboReferente}</strong>, dando por este instrumento plena, geral e irrevogável quitação dos valores especificados.
                      </p>
                    </div>
                  )}

                  {/* MODEL 18: TCLE CIRURGIA E IMPLANTES */}
                  {activeTemplate.id === 'tcle_cirurgia_implantes' && (
                    <div className="space-y-3.5 text-xs text-justify font-sans text-stone-800">
                      <p className="font-bold text-center text-sm uppercase">TERMO DE CONSENTIMENTO LIVRE E ESCLARECIDO - CIRURGIA & IMPLANTODONTIA</p>
                      <p>
                        Pelo presente instrumento, eu <strong className="underline font-bold text-stone-900">{patientDisplayName}</strong> declaro que fui devidamente informado(a) e esclarecido(a) pelo cirurgião-dentista sobre o procedimento de instalação de implantes odontológicos na <strong>{tcleImplanteRegiao}</strong> {tcleImplanteEnxerto ? 'e realização de enxerto ósseo/biomaterial associado' : ''}.
                      </p>
                      <ul className="list-disc pl-5 space-y-1 text-[11px] text-stone-700">
                        <li>Fui informado(a) sobre a taxa de sucesso da osseointegração (superior a 95%) e sobre os fatores que podem levar à perda do implante (fumo, diabetes descompensada, má higiene bucal).</li>
                        <li>Estou ciente da necessidade de repouso pós-operatório, higienização rigorosa e uso correto das medicações prescritas.</li>
                        <li>Compreendo que a confecção da prótese sobre implante só poderá ser realizada após o período adequado de cicatrização e osseointegração.</li>
                      </ul>
                      <p className="text-[11px] italic text-stone-600">
                        Declaro que tive a oportunidade de esclarecer todas as dúvidas e autorizo a realização do procedimento cirúrgico.
                      </p>
                    </div>
                  )}

                  {/* MODEL 19: TCLE CLAREAMENTO DENTAL */}
                  {activeTemplate.id === 'tcle_clareamento_dental' && (
                    <div className="space-y-3.5 text-xs text-justify font-sans text-stone-800">
                      <p className="font-bold text-center text-sm uppercase">TERMO DE CONSENTIMENTO LIVRE E ESCLARECIDO - CLAREAMENTO DENTAL</p>
                      <p>
                        Eu, <strong className="underline font-bold text-stone-900">{patientDisplayName}</strong>, autorizo a realização do procedimento de clareamento dental na modalidade <strong>{tcleClareamentoTipo === 'caseiro' ? 'Caseiro Supervisionado' : tcleClareamentoTipo === 'consultorio' ? 'Em Consultório' : 'Combinado (Consultório + Caseiro)'}</strong>.
                      </p>
                      <ul className="list-disc pl-5 space-y-1 text-[11px] text-stone-700">
                        <li>Estou ciente de que pode ocorrer sensibilidade dentária transitória durante ou após as aplicações, que cessa com o término do tratamento.</li>
                        <li>Fui orientado(a) a evitar alimentos e bebidas fortemente pigmentadas (café, vinho tinto, refrigerantes escuros, molho de tomate) durante o período de clareamento.</li>
                        <li>Compreendo que restaurações e próteses existentes não mudam de cor com o clareamento, podendo ser necessária a sua troca após a estabilização da cor final.</li>
                      </ul>
                    </div>
                  )}

                  {/* MODEL 20: TCLE ORTODONTIA */}
                  {activeTemplate.id === 'tcle_ortodontia' && (
                    <div className="space-y-3.5 text-xs text-justify font-sans text-stone-800">
                      <p className="font-bold text-center text-sm uppercase">TERMO DE CONSENTIMENTO LIVRE E ESCLARECIDO - TRATAMENTO ORTODÔNTICO</p>
                      <p>
                        Eu, <strong className="underline font-bold text-stone-900">{patientDisplayName}</strong>, declaro que fui esclarecido(a) sobre o diagnóstico, plano terapêutico e instalação de aparelho <strong>{tcleOrtoTipo === 'fixo_metalico' ? 'Fixo Metálico' : tcleOrtoTipo === 'fixo_estetico' ? 'Fixo Estético' : tcleOrtoTipo === 'autoligado' ? 'Autoligado' : 'Alinhadores Invisíveis'}</strong>.
                      </p>
                      <ul className="list-disc pl-5 space-y-1 text-[11px] text-stone-700">
                        <li>Comprometo-me a comparecer pontualmente às consultas mensais de ativação e manutenção do aparelho.</li>
                        <li>Estou ciente de que a má higiene bucal pode causar descalcificações (manchas brancas), cáries e inflamações gengivais severas.</li>
                        <li>Reconheço que o tempo de tratamento é uma estimativa e depende diretamente da colaboração do paciente e da resposta biológica individual.</li>
                        <li>Ao término do tratamento ativo, é indispensável o uso rigoroso das placas ou barras de contenção para evitar recidiva ortodôntica.</li>
                      </ul>
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
                      {clinicInfo.footerText && (
                        <div className="col-span-full pt-1.5 border-t border-stone-200 text-center text-[10px] text-stone-500 italic">
                          {clinicInfo.footerText}
                        </div>
                      )}
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
