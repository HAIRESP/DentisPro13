import { Patient, Appointment, InventoryItem, FinancialTransaction, Prescription, WhatsAppTemplate, ToothCondition, OdontogramSnapshot, ClinicalEvolutionEntry, ClinicUnit, Professional, TUSSProcedure, TreatmentPlan, PatientPayment, PriceTable, DentistCommissionRecord, InsuranceGuide, SavedClinicDocument } from '../types';
import { OFFICIAL_ANS_TUSS_PROCEDURES } from './tussCatalog';

export const INITIAL_CLINICS: ClinicUnit[] = [
  {
    id: 'cli-online',
    name: 'Atendimento Online',
    address: 'Teleodontologia / Plataforma Digital',
    phone: '(85) 98684-6424',
    city: 'Online / Brasil',
    email: 'contato@dentispro.com.br'
  },
  {
    id: 'cli-marv',
    name: 'Clínica MARV',
    address: 'Av. Santos Dumont, 2800 - Aldeota',
    phone: '(85) 3261-9000',
    city: 'Fortaleza - CE'
  },
  {
    id: 'cli-1',
    name: 'DentisPro - Unidade Centro / Paulista',
    address: 'Av. Paulista, 1500 - Conjunto 304 - Bela Vista',
    phone: '(11) 3251-4000',
    city: 'São Paulo - SP'
  },
  {
    id: 'cli-2',
    name: 'DentisPro - Unidade Jardins',
    address: 'Rua Oscar Freire, 920 - Sala 12 - Cerqueira César',
    phone: '(11) 3088-2200',
    city: 'São Paulo - SP'
  },
  {
    id: 'cli-4',
    name: 'DentisPro - Unidade Tatuapé / Zona Leste',
    address: 'Rua Tuiuti, 1800 - Sala 405 - Tatuapé',
    phone: '(11) 2091-7700',
    city: 'São Paulo - SP'
  },
  {
    id: 'cli-3',
    name: 'DentisPro - Unidade Vila Mariana / Sul',
    address: 'Rua Vergueiro, 2200 - Conjunto 81 - Vila Mariana',
    phone: '(11) 5084-1100',
    city: 'São Paulo - SP'
  }
];

export const INITIAL_PROFESSIONALS: Professional[] = [
  {
    id: 'prof-2',
    name: 'Dra. Camila Alves',
    cro: 'CRO/SP 654321',
    specialty: 'Ortodontia & Estética Dental',
    clinicIds: ['cli-online', 'cli-1', 'cli-2', 'cli-4']
  },
  {
    id: 'prof-hugo',
    name: 'Dr. Hugo Andres Iglesias Ricoy',
    cro: 'CRO/CE 5925',
    cpf: '879.750.253-72',
    specialty: 'Implantodontia, Prótese & Clínica Geral',
    clinicIds: ['cli-online', 'cli-marv', 'cli-1', 'cli-2', 'cli-3', 'cli-4']
  },
  {
    id: 'prof-4',
    name: 'Dra. Juliana Costa',
    cro: 'CRO/SP 345678',
    specialty: 'Odontopediatria & Pacientes com Necessidades Especiais',
    clinicIds: ['cli-online', 'cli-1', 'cli-3']
  },
  {
    id: 'prof-1',
    name: 'Dr. Lucas Mendes',
    cro: 'CRO/SP 123456',
    specialty: 'Implantodontia & Prótese',
    clinicIds: ['cli-online', 'cli-1', 'cli-2', 'cli-3']
  },
  {
    id: 'prof-3',
    name: 'Dr. Roberto Fonseca',
    cro: 'CRO/SP 789012',
    specialty: 'Endodontia & Cirurgia Bucomaxilofacial',
    clinicIds: ['cli-online', 'cli-2', 'cli-3', 'cli-4']
  }
];

export const INITIAL_PATIENTS: Patient[] = [
  {
    id: 'pat-1',
    name: 'Ana Silva Santos',
    cpf: '123.456.789-00',
    rg: '12.345.678-9',
    birthDate: '1992-05-14',
    gender: 'feminino',
    phone: '5511987654321',
    email: 'ana.silva@email.com',
    preferredClinicId: 'cli-1',
    preferredClinicName: 'DentisPro - Unidade Centro / Paulista',
    preferredDentistName: 'Dr. Lucas Mendes',
    address: {
      street: 'Av. Paulista',
      number: '1500',
      neighborhood: 'Bela Vista',
      city: 'São Paulo',
      state: 'SP',
      cep: '01310-200'
    },
    healthInsurance: 'Unimed Odonto',
    insuranceNumber: '88776655',
    anamnesis: {
      hasAllergies: true,
      allergyDetails: 'Alergia a Penicilina',
      hasHeartDisease: false,
      hasDiabetes: false,
      hasHypertension: false,
      isPregnant: false,
      continuousMedication: '',
      bleedingDisorder: false,
      notes: 'Paciente relata sensibilidade no dente 26 ao tomar bebidas geladas.'
    },
    status: 'ativo',
    createdAt: '2025-01-10',
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=800&auto=format&fit=crop&q=80'
    ]
  },
  {
    id: 'pat-6',
    name: 'Beatriz Mendonça Rocha',
    cpf: '678.901.234-55',
    rg: '45.678.901-2',
    birthDate: '2000-03-18',
    gender: 'feminino',
    phone: '5511932109876',
    email: 'beatriz.rocha@email.com',
    profession: 'Arquiteta & Designer',
    ethnicity: 'branca',
    preferredClinicId: 'cli-2',
    preferredClinicName: 'DentisPro - Unidade Jardins',
    preferredDentistName: 'Dra. Camila Alves',
    address: {
      street: 'Rua Oscar Freire',
      number: '950',
      neighborhood: 'Cerqueira César',
      city: 'São Paulo',
      state: 'SP',
      cep: '01426-001'
    },
    healthInsurance: 'Particular',
    anamnesis: {
      hasAllergies: true,
      allergyDetails: 'Alergia alimentar a camarão e frutos do mar',
      hasHeartDisease: false,
      hasDiabetes: false,
      hasHypertension: false,
      bleedingDisorder: false,
      isPregnant: false,
      hasBruxism: true,
      orthodonticTreatment: true,
      notes: 'Queixa principal: apinhamento anteroinferior e estética do sorriso. Tratamento planejado com alinhadores ortodônticos invisíveis e clareamento dental supervisionado.'
    },
    status: 'ativo',
    createdAt: '2025-02-10',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'pat-2',
    name: 'Carlos Eduardo Oliveira',
    cpf: '234.567.890-11',
    birthDate: '1985-11-20',
    gender: 'masculino',
    phone: '5511976543210',
    email: 'carlos.eduardo@email.com',
    preferredClinicId: 'cli-2',
    preferredClinicName: 'DentisPro - Unidade Jardins',
    preferredDentistName: 'Dra. Camila Alves',
    address: {
      street: 'Rua Augusta',
      number: '420',
      neighborhood: 'Consolação',
      city: 'São Paulo',
      state: 'SP',
      cep: '01304-000'
    },
    healthInsurance: 'Amil Dental',
    anamnesis: {
      hasAllergies: false,
      hasHeartDisease: false,
      hasDiabetes: true,
      hasHypertension: true,
      isPregnant: false,
      continuousMedication: 'Metformina 850mg, Losartana 50mg',
      bleedingDisorder: false,
      notes: 'Monitorar pressão arterial antes de procedimentos com anestésico.'
    },
    status: 'ativo',
    createdAt: '2025-02-01'
  },
  {
    id: 'pat-7',
    name: 'Fernando Henrique Silveira',
    cpf: '789.012.345-66',
    rg: '56.789.012-3',
    birthDate: '1988-09-10',
    gender: 'masculino',
    phone: '5511921098765',
    email: 'fh.silveira@email.com',
    profession: 'Engenheiro de Software',
    ethnicity: 'parda',
    preferredClinicId: 'cli-3',
    preferredClinicName: 'DentisPro - Unidade Vila Mariana / Sul',
    preferredDentistName: 'Dr. Roberto Fonseca',
    address: {
      street: 'Rua Bela Cintra',
      number: '1450',
      neighborhood: 'Consolação',
      city: 'São Paulo',
      state: 'SP',
      cep: '01415-001'
    },
    healthInsurance: 'SulAmérica Odonto',
    insuranceNumber: '99887711',
    anamnesis: {
      hasAllergies: true,
      allergyDetails: 'ALERGIA GRAVE A DIPIRONA E SULFAS (Contraindicação absoluta de Dipirona/Novalgina)',
      hasHeartDisease: false,
      hasDiabetes: false,
      hasHypertension: false,
      bleedingDisorder: false,
      isPregnant: false,
      notes: 'Urgência odontológica com dor aguda pulsátil no dente 46 (molar inferior direito). Diagnóstico de pulpite irreversível sintomática. Necessidade de tratamento endodôntico, pino de fibra e coroa em Zircônia.'
    },
    status: 'ativo',
    createdAt: '2025-02-25',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'pat-8',
    name: 'Juliana Martins Pereira',
    cpf: '890.123.456-77',
    rg: '67.890.123-4',
    birthDate: '2003-12-05',
    gender: 'feminino',
    phone: '5511910987654',
    email: 'juliana.martins@email.com',
    profession: 'Estudante Universitária',
    ethnicity: 'branca',
    preferredClinicId: 'cli-4',
    preferredClinicName: 'DentisPro - Unidade Tatuapé / Zona Leste',
    preferredDentistName: 'Dr. Roberto Fonseca',
    address: {
      street: 'Av. Brigadeiro Luís Antônio',
      number: '3100',
      neighborhood: 'Jardim Paulista',
      city: 'São Paulo',
      state: 'SP',
      cep: '01402-000'
    },
    healthInsurance: 'Porto Seguro Odontológico',
    insuranceNumber: '55443322',
    anamnesis: {
      hasAllergies: false,
      hasHeartDisease: false,
      hasDiabetes: false,
      hasHypertension: false,
      bleedingDisorder: false,
      isPregnant: false,
      hasFaceOrAtmPainLastMonth: true,
      painEvaScore: 5,
      notes: 'Avaliação para exodontia cirúrgica dos terceiros molares inclusos (sisos 18, 28, 38 e 48). Histórico recente de pericoronarite no dente 38 tratado com bochechos antissépticos.'
    },
    status: 'ativo',
    createdAt: '2025-03-05',
    photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'pat-4',
    name: 'Lucas Ferreira Gabriel (Infantil)',
    cpf: '456.789.012-33',
    birthDate: '2018-04-12',
    gender: 'masculino',
    phone: '5511954321098',
    email: 'mae.lucas@email.com',
    preferredClinicId: 'cli-1',
    preferredClinicName: 'DentisPro - Unidade Centro / Paulista',
    preferredDentistName: 'Dra. Juliana Costa',
    address: {
      street: 'Rua Vergueiro',
      number: '2000',
      neighborhood: 'Paraíso',
      city: 'São Paulo',
      state: 'SP',
      cep: '04102-000'
    },
    healthInsurance: 'Bradesco Dental',
    anamnesis: {
      hasAllergies: false,
      hasHeartDisease: false,
      hasDiabetes: false,
      hasHypertension: false,
      isPregnant: false,
      bleedingDisorder: false,
      notes: 'Odontopediatria. Paciente em fase de dentição decídua e mista.'
    },
    status: 'ativo',
    createdAt: '2025-03-01'
  },
  {
    id: 'pat-3',
    name: 'Mariana Costa Lima',
    cpf: '345.678.901-22',
    birthDate: '1998-08-03',
    gender: 'feminino',
    phone: '5511965432109',
    email: 'mariana.costa@email.com',
    preferredClinicId: 'cli-3',
    preferredClinicName: 'DentisPro - Unidade Vila Mariana / Sul',
    preferredDentistName: 'Dr. Roberto Fonseca',
    address: {
      street: 'Rua Domingos de Morais',
      number: '880',
      neighborhood: 'Vila Mariana',
      city: 'São Paulo',
      state: 'SP',
      cep: '04010-100'
    },
    healthInsurance: 'Particular',
    anamnesis: {
      hasAllergies: false,
      hasHeartDisease: false,
      hasDiabetes: false,
      hasHypertension: false,
      isPregnant: true,
      continuousMedication: 'Vitaminas pré-natais',
      bleedingDisorder: false,
      notes: 'Gestante no 2º trimestre. Evitar radiografias desnecessárias.'
    },
    status: 'ativo',
    createdAt: '2025-02-15'
  },
  {
    id: 'pat-5',
    name: 'Roberto Albuquerque Prado',
    cpf: '567.890.123-44',
    rg: '34.567.890-1',
    birthDate: '1964-07-22',
    gender: 'masculino',
    phone: '5511943210987',
    email: 'roberto.prado@email.com',
    profession: 'Engenheiro Civil Aposentado',
    ethnicity: 'branca',
    preferredClinicId: 'cli-marv',
    preferredClinicName: 'Clínica MARV',
    preferredDentistName: 'Dr. Hugo Andres Iglesias Ricoy',
    address: {
      street: 'Alameda Santos',
      number: '1200',
      neighborhood: 'Cerqueira César',
      city: 'São Paulo',
      state: 'SP',
      cep: '01418-100'
    },
    healthInsurance: 'Bradesco Dental',
    insuranceNumber: '77665544',
    anamnesis: {
      hasAllergies: false,
      hasHeartDisease: true,
      hasDiabetes: false,
      hasHypertension: true,
      isPregnant: false,
      continuousMedication: 'AAS 100mg (antiagregante), Enalapril 20mg',
      bleedingDisorder: false,
      usesDentalProsthesis: true,
      notes: 'Cardiopata controlado (stent coronário há 3 anos). Monitorar pressão. Avaliar hemostasia com cardiologista antes de cirurgias ósseas. Planejamento de implantes osteointegráveis nos dentes 14 e 15.'
    },
    status: 'ativo',
    createdAt: '2025-01-20',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80'
  }
];

// Generate dates relative to today for dynamic testing
const today = new Date().toISOString().split('T')[0];

export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt-1',
    patientId: 'pat-1',
    patientName: 'Ana Silva Santos',
    patientPhone: '5511987654321',
    dentistName: 'Dr. Lucas Mendes (CRO/SP 123456)',
    clinicId: 'cli-1',
    clinicName: 'DentisPro - Unidade Centro / Paulista',
    date: today,
    time: '09:00',
    durationMinutes: 45,
    procedure: 'Restauração em Resina (Dente 26)',
    status: 'confirmado',
    value: 280,
    notes: 'Paciente confirmou presença via WhatsApp.',
    whatsappSentAt: '2026-07-21T18:00:00Z'
  },
  {
    id: 'apt-2',
    patientId: 'pat-2',
    patientName: 'Carlos Eduardo Oliveira',
    patientPhone: '5511976543210',
    dentistName: 'Dra. Camila Alves (CRO/SP 654321)',
    clinicId: 'cli-2',
    clinicName: 'DentisPro - Unidade Jardins',
    date: today,
    time: '10:30',
    durationMinutes: 60,
    procedure: 'Raspagem e Profilaxia (Limpeza)',
    status: 'agendado',
    value: 220,
    notes: 'Checar pressão arterial antes do procedimento.'
  },
  {
    id: 'apt-3',
    patientId: 'pat-3',
    patientName: 'Mariana Costa Lima',
    patientPhone: '5511965432109',
    dentistName: 'Dr. Roberto Fonseca (CRO/SP 789012)',
    clinicId: 'cli-3',
    clinicName: 'DentisPro - Unidade Vila Mariana / Sul',
    date: today,
    time: '14:00',
    durationMinutes: 60,
    procedure: 'Avaliação Inicial & Clareamento Caseiro',
    status: 'confirmado',
    value: 650,
    notes: 'Moldagem para moldeira de clareamento.'
  },
  {
    id: 'apt-4',
    patientId: 'pat-4',
    patientName: 'Lucas Ferreira Gabriel (Infantil)',
    patientPhone: '5511954321098',
    dentistName: 'Dra. Juliana Costa (CRO/SP 345678)',
    clinicId: 'cli-1',
    clinicName: 'DentisPro - Unidade Centro / Paulista',
    date: today,
    time: '16:00',
    durationMinutes: 30,
    procedure: 'Aplicação Tópica de Flúor & Selantes',
    status: 'agendado',
    value: 180,
    notes: 'Odontopediatria. Trazer brinde infantil ao final.'
  },
  {
    id: 'apt-5',
    patientId: 'pat-5',
    patientName: 'Roberto Albuquerque Prado',
    patientPhone: '5511943210987',
    dentistName: 'Dr. Hugo Andres Iglesias Ricoy (CRO/CE 5925)',
    clinicId: 'cli-marv',
    clinicName: 'Clínica MARV',
    date: today,
    time: '11:00',
    durationMinutes: 60,
    procedure: 'Avaliação Tomográfica & Planejamento de Implantes (14 e 15)',
    status: 'confirmado',
    value: 350,
    notes: 'Trazer exames laboratoriais (coagulograma) e laudo tomográfico.'
  },
  {
    id: 'apt-6',
    patientId: 'pat-6',
    patientName: 'Beatriz Mendonça Rocha',
    patientPhone: '5511932109876',
    dentistName: 'Dra. Camila Alves (CRO/SP 654321)',
    clinicId: 'cli-2',
    clinicName: 'DentisPro - Unidade Jardins',
    date: today,
    time: '15:00',
    durationMinutes: 45,
    procedure: 'Manutenção Ortodôntica & Entrega de Alinhadores',
    status: 'confirmado',
    value: 320,
    notes: 'Troca da série de alinhadores transparentes 03 e 04.'
  },
  {
    id: 'apt-7',
    patientId: 'pat-7',
    patientName: 'Fernando Henrique Silveira',
    patientPhone: '5511921098765',
    dentistName: 'Dr. Roberto Fonseca (CRO/SP 789012)',
    clinicId: 'cli-3',
    clinicName: 'DentisPro - Unidade Vila Mariana / Sul',
    date: today,
    time: '17:00',
    durationMinutes: 60,
    procedure: 'Endodontia Molar (Canal Dente 46 - Sessão 2)',
    status: 'agendado',
    value: 680,
    notes: 'Alergia a Dipirona. Instrumentação rotatória e obturação termoplastificada.'
  },
  {
    id: 'apt-8',
    patientId: 'pat-8',
    patientName: 'Juliana Martins Pereira',
    patientPhone: '5511910987654',
    dentistName: 'Dr. Roberto Fonseca (CRO/SP 789012)',
    clinicId: 'cli-4',
    clinicName: 'DentisPro - Unidade Tatuapé / Zona Leste',
    date: today,
    time: '08:30',
    durationMinutes: 90,
    procedure: 'Exodontia Cirúrgica de Dente Incluso (Sisos 38 e 48)',
    status: 'confirmado',
    value: 900,
    notes: 'Paciente em jejum relativo. Medicação pré-operatória administrada na clínica.'
  }
];

export const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: 'inv-1',
    itemCode: 'MAT-101',
    name: 'Kit Instrumental Cirúrgico de Inox (Espelho, Pinça, Sonda, Alavanca)',
    category: 'Instrumentais',
    itemType: 'instrumental',
    quantity: 15,
    minQuantity: 5,
    unit: 'kit',
    unitCost: 180.00,
    expirationDate: '2028-12-31',
    supplier: 'Dental Cremer',
    lastUpdated: today,
    isSterilized: true,
    sterilizationDate: today,
    photoUrl: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=300&auto=format&fit=crop&q=80',
    images: ['https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=300&auto=format&fit=crop&q=80'],
    ownerScope: 'compartilhado'
  },
  {
    id: 'inv-2',
    itemCode: 'RES-202',
    name: 'Resina Filtek Z350 XT A2 Body 3M (Seringa 4g)',
    category: 'Resinas & Adesivos',
    itemType: 'insumo',
    quantity: 8,
    minQuantity: 3,
    unit: 'seringa',
    unitCost: 145.00,
    expirationDate: '2027-10-15',
    supplier: 'Dental Speed',
    lastUpdated: today,
    isSterilized: true,
    photoUrl: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=300&auto=format&fit=crop&q=80',
    ownerScope: 'compartilhado'
  },
  {
    id: 'inv-3',
    itemCode: 'EQP-301',
    name: 'Motor de Implante Surgic Pro NSK com Contra-Ângulo 20:1',
    category: 'Equipamentos',
    itemType: 'equipamento',
    quantity: 2,
    minQuantity: 1,
    unit: 'unidade',
    unitCost: 12500.00,
    serialNumber: 'NSK-99281-BR',
    requiresMaintenance: true,
    maintenanceFrequencyDays: 180,
    lastMaintenanceDate: '2026-03-01',
    nextMaintenanceDate: '2026-09-01',
    supplier: 'NSK Brasil',
    lastUpdated: today,
    photoUrl: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=300&auto=format&fit=crop&q=80',
    ownerScope: 'clinica',
    clinicId: 'cli-1'
  },
  {
    id: 'inv-autoclave-1',
    itemCode: 'EQP-AUT-01',
    name: 'Autoclave Cristófoli Vitale Class 12 Litros Inox',
    category: 'Equipamentos',
    itemType: 'equipamento',
    quantity: 1,
    minQuantity: 1,
    unit: 'unidade',
    unitCost: 6800.00,
    serialNumber: 'CRIST-12L-9982',
    requiresMaintenance: true,
    maintenanceFrequencyDays: 180,
    lastMaintenanceDate: '2026-02-15',
    nextMaintenanceDate: '2026-08-15',
    supplier: 'Cristófoli Biossegurança',
    lastUpdated: today,
    photoUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&auto=format&fit=crop&q=80',
    ownerScope: 'clinica',
    clinicId: 'cli-1'
  },
  {
    id: 'inv-autoclave-2',
    itemCode: 'EQP-AUT-02',
    name: 'Autoclave Cristófoli Vitale Class 21 Litros Digital',
    category: 'Equipamentos',
    itemType: 'equipamento',
    quantity: 1,
    minQuantity: 1,
    unit: 'unidade',
    unitCost: 8900.00,
    serialNumber: 'CRIST-21L-7741',
    requiresMaintenance: true,
    maintenanceFrequencyDays: 180,
    lastMaintenanceDate: '2026-01-10',
    nextMaintenanceDate: '2026-07-10',
    supplier: 'Cristófoli Biossegurança',
    lastUpdated: today,
    photoUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&auto=format&fit=crop&q=80',
    ownerScope: 'clinica',
    clinicId: 'cli-2'
  },
  {
    id: 'inv-4',
    itemCode: 'DES-401',
    name: 'Agulha Gengival Descartável DFL 30G Curta (Caixa 100un)',
    category: 'Descartáveis',
    itemType: 'insumo',
    quantity: 12,
    minQuantity: 4,
    unit: 'caixa',
    unitCost: 48.00,
    expirationDate: '2025-02-10', // VENCIDO / EXPIRADO!
    supplier: 'DFL Indústria',
    lastUpdated: today,
    isSterilized: false, // Apagado automaticamente por estar vencido
    photoUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&auto=format&fit=crop&q=80',
    ownerScope: 'compartilhado'
  },
  {
    id: 'inv-5',
    itemCode: 'EQP-302',
    name: 'Fotopolimerizador Valo Cordless Ultradent',
    category: 'Equipamentos',
    itemType: 'equipamento',
    quantity: 3,
    minQuantity: 1,
    unit: 'unidade',
    unitCost: 3800.00,
    serialNumber: 'VALO-77341-USA',
    requiresMaintenance: true,
    maintenanceFrequencyDays: 180,
    lastMaintenanceDate: '2025-06-10',
    nextMaintenanceDate: '2025-12-10', // MANUTENÇÃO VENCIDA / ATRASADA!
    supplier: 'Ultradent',
    lastUpdated: today,
    photoUrl: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=300&auto=format&fit=crop&q=80',
    ownerScope: 'clinica'
  },
  {
    id: 'inv-6',
    itemCode: 'CIR-501',
    name: 'Fio de Suture Seda 3-0 com Agulha (Caixa 24un)',
    category: 'Cirurgia',
    itemType: 'insumo',
    quantity: 10,
    minQuantity: 3,
    unit: 'caixa',
    unitCost: 92.00,
    expirationDate: '2028-06-30',
    supplier: 'Dental Cremer',
    lastUpdated: today,
    isSterilized: true,
    sterilizationDate: today,
    ownerScope: 'compartilhado'
  },
  // Official PDF List Items
  { id: 'inv-76167', itemCode: '76167', name: 'Ácido fosfórico a 37%', category: 'Consumíveis & Descartáveis', itemType: 'insumo', quantity: 200, minQuantity: 5, unit: 'pacote', unitCost: 15, supplier: 'Dental Cremer', notes: 'Seringa de 2,5 gramas, pacote com 3 unidades', isSterilized: true, ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-76168', itemCode: '76168', name: 'Acrílico auto polimerizante em pó, de 78 gramas', category: 'Prótese & Acrílicos', itemType: 'insumo', quantity: 10, minQuantity: 3, unit: 'caixa', unitCost: 45, supplier: 'Vipi', notes: 'Caixa com 1 unidade, acrilizar peças protéticas e reembasar', isSterilized: true, ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-76169', itemCode: '76169', name: 'Acrílico auto polimerizante em líquido, frasco de 120ml', category: 'Prótese & Acrílicos', itemType: 'insumo', quantity: 10, minQuantity: 3, unit: 'frasco', unitCost: 38, supplier: 'Vipi', notes: 'Frasco de 120ml para acrilizar peças protéticas e reembasar', isSterilized: true, ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-76170', itemCode: '76170', name: 'Adesivo fotopolimerizavél, vidro de 6 gramas', category: 'Resinas & Adesivos', itemType: 'insumo', quantity: 200, minQuantity: 10, unit: 'unidade', unitCost: 85, supplier: '3M', notes: 'Sistema condicionante de resina composta', isSterilized: true, ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-76171', itemCode: '76171', name: 'Água oxigenada líquida 10 volumes', category: 'Consumíveis & Descartáveis', itemType: 'insumo', quantity: 30, minQuantity: 5, unit: 'frasco', unitCost: 12, supplier: 'Rioquímica', notes: 'Frasco de 1 litro', isSterilized: true, ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-76173', itemCode: '76173', name: 'Agulha gengival descartável 30G longa', category: 'Consumíveis & Descartáveis', itemType: 'insumo', quantity: 40, minQuantity: 10, unit: 'caixa', unitCost: 44, supplier: 'DFL', notes: 'Caixa com 100 unidades, utilizada para aplicação de anestesia local', isSterilized: true, ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-76174', itemCode: '76174', name: 'Algodão rolete', category: 'Consumíveis & Descartáveis', itemType: 'insumo', quantity: 500, minQuantity: 50, unit: 'pacote', unitCost: 18, supplier: 'Allpack', notes: 'Fibra 100% algodão, pacote com 100 unidades, embalado individualmente, livre de impurezas', isSterilized: true, ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-76175', itemCode: '76175', name: 'Anestésico tópico gel', category: 'Anestésicos', itemType: 'insumo', quantity: 100, minQuantity: 10, unit: 'pote', unitCost: 28, supplier: 'DFL', notes: 'Pote de 12 gramas, sabor Tutti-Frutti', isSterilized: true, ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-76176', itemCode: '76176', name: 'Anestésico cloridrato de lidocaina com epinefrina', category: 'Anestésicos', itemType: 'insumo', quantity: 100, minQuantity: 20, unit: 'caixa', unitCost: 95, supplier: 'Nova DFL', notes: 'Tubete de vidro de 1,8ml, caixa com 50 unidades', isSterilized: true, ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-76177', itemCode: '76177', name: 'Anestésico cloridrato de lidocaina com norepinefrina 3%', category: 'Anestésicos', itemType: 'insumo', quantity: 60, minQuantity: 15, unit: 'caixa', unitCost: 98, supplier: 'Nova DFL', notes: 'Tubete de 1,8ml, caixa com 50 unidades', isSterilized: true, ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-76329', itemCode: '76329', name: 'Anestésico cloridrato de lidocaina sem vasoconstritor de 2%', category: 'Anestésicos', itemType: 'insumo', quantity: 40, minQuantity: 10, unit: 'caixa', unitCost: 90, supplier: 'Nova DFL', notes: 'Tubete de 1,8ml, caixa com 50 unidades', isSterilized: true, ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-76330', itemCode: '76330', name: 'Anestésico cloridrato de prilocaina com felipressina 3%', category: 'Anestésicos', itemType: 'insumo', quantity: 60, minQuantity: 15, unit: 'caixa', unitCost: 92, supplier: 'Nova DFL', notes: 'Tubete de 1,8ml, caixa com 50 unidades', isSterilized: true, ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-76331', itemCode: '76331', name: 'Anestésico mepivacaina com epinefrina', category: 'Anestésicos', itemType: 'insumo', quantity: 60, minQuantity: 15, unit: 'caixa', unitCost: 96, supplier: 'Nova DFL', notes: 'Tubete de 1,8ml, caixa com 50 unidades', isSterilized: true, ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-76332', itemCode: '76332', name: 'Aplicador grosso descartável regular', category: 'Consumíveis & Descartáveis', itemType: 'insumo', quantity: 200, minQuantity: 5, unit: 'pote', unitCost: 35, supplier: 'DFL', notes: 'Caixa com 100 unidades, utilizado para aplicação do adesivo polimerizável', isSterilized: true, ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-76333', itemCode: '76333', name: 'Abridor de boca de borracha, de silicone com perfuração para fio dental', category: 'Instrumentais', itemType: 'instrumental', quantity: 20, minQuantity: 5, unit: 'pacote', unitCost: 40, supplier: 'Golgran', notes: 'Manter abertura de boca durante o tratamento, pacotes com 2 unidades', isSterilized: true, ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-76334', itemCode: '76334', name: 'Babador impermeável descartável', category: 'Biossegurança & EPIs', itemType: 'insumo', quantity: 60, minQuantity: 10, unit: 'pacote', unitCost: 25, supplier: 'Descarpack', notes: 'Pacote com 100 unidades', isSterilized: true, ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-76335', itemCode: '76335', name: 'Babador de plástico', category: 'Biossegurança & EPIs', itemType: 'insumo', quantity: 50, minQuantity: 10, unit: 'pacote', unitCost: 22, supplier: 'Descarpack', notes: 'Pacote com 10 unidades', isSterilized: true, ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-76336', itemCode: '76336', name: 'Broqueiro para broca de alta rotação', category: 'Equipamentos', itemType: 'equipamento', quantity: 50, minQuantity: 5, unit: 'unidade', unitCost: 55, supplier: 'OdontoMega', notes: 'Em alumínio, reservatório de brocas', isSterilized: true, ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-76337', itemCode: '76337', name: 'Câmara escura odontológica para revelação', category: 'Radiologia', itemType: 'equipamento', quantity: 6, minQuantity: 2, unit: 'unidade', unitCost: 120, supplier: 'Dabi Atlante', notes: 'Sem iluminação indicada para revelação de filmes odontológicos periapicais', isSterilized: true, ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-76338', itemCode: '76338', name: 'Caixa coletora 13 litros', category: 'Biossegurança & EPIs', itemType: 'insumo', quantity: 80, minQuantity: 10, unit: 'unidade', unitCost: 30, supplier: 'Descarpack', notes: 'Para material perfurocortante', isSterilized: true, ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-76339', itemCode: '76339', name: 'Canudinho de refrigerante 6mm', category: 'Consumíveis & Descartáveis', itemType: 'insumo', quantity: 100, minQuantity: 10, unit: 'pacote', unitCost: 15, supplier: 'Plastil', notes: 'Pacote com 100 unidades', isSterilized: true, ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-76340', itemCode: '76340', name: 'Carbono para registro oclusal, dupla face', category: 'Consumíveis & Descartáveis', itemType: 'insumo', quantity: 80, minQuantity: 10, unit: 'caixa', unitCost: 24, supplier: 'Bausch', notes: 'Carbono na cor vermelho e preto S053, caixa com 12 folhetos', isSterilized: true, ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-76341', itemCode: '76341', name: 'Cera odontológica nº 7, na cor rosa', category: 'Prótese & Acrílicos', itemType: 'insumo', quantity: 20, minQuantity: 5, unit: 'caixa', unitCost: 32, supplier: 'Vipi', notes: 'Caixa de 225 gramas, de uso protético para ajustamento de próteses', isSterilized: true, ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-76342', itemCode: '76342', name: 'Creme dental com fluor de 90 gramas', category: 'Consumíveis & Descartáveis', itemType: 'insumo', quantity: 500, minQuantity: 50, unit: 'caixa', unitCost: 4, supplier: 'Colgate', notes: 'Com proteção anticárie', isSterilized: true, ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-76343', itemCode: '76343', name: 'Cimento fosfato de zinco líquido', category: 'Cimentos & Restauração', itemType: 'insumo', quantity: 30, minQuantity: 5, unit: 'unidade', unitCost: 45, supplier: 'SS White', notes: 'Vidro de 10 ml', isSterilized: true, ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-76344', itemCode: '76344', name: 'Cimento fosfato de zinco em pó', category: 'Cimentos & Restauração', itemType: 'insumo', quantity: 30, minQuantity: 5, unit: 'unidade', unitCost: 50, supplier: 'SS White', notes: 'Vidro de 28 gramas', isSterilized: true, ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-76345', itemCode: '76345', name: 'Cimento resinoso dual', category: 'Cimentos & Restauração', itemType: 'insumo', quantity: 50, minQuantity: 10, unit: 'caixa', unitCost: 140, supplier: 'FGM', notes: 'Kit com duas seringa de corpo duplo de 5 gramas', isSterilized: true, ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-76346', itemCode: '76346', name: 'Cimento endodontico', category: 'Endodontia', itemType: 'insumo', quantity: 40, minQuantity: 5, unit: 'caixa', unitCost: 65, supplier: 'Dentsply', notes: 'Em pó 8g + resina 9g', isSterilized: true, ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-76347', itemCode: '76347', name: 'Cimento obturador temporário com flúor', category: 'Cimentos & Restauração', itemType: 'insumo', quantity: 60, minQuantity: 10, unit: 'pote', unitCost: 35, supplier: 'Vigodent', notes: 'Pote com 25 gramas', isSterilized: true, ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-76348', itemCode: '76348', name: 'Cimento cirúrgico líquido', category: 'Cimentos & Restauração', itemType: 'insumo', quantity: 30, minQuantity: 5, unit: 'unidade', unitCost: 28, supplier: 'Vigodent', notes: 'Vidro de 20 ml', isSterilized: true, ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-76349', itemCode: '76349', name: 'Cimento cirúrgico em pó', category: 'Cimentos & Restauração', itemType: 'insumo', quantity: 30, minQuantity: 5, unit: 'unidade', unitCost: 30, supplier: 'Vigodent', notes: 'Vidro de 50 gramas', isSterilized: true, ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-76350', itemCode: '76350', name: 'Cimento de hidróxido de cálcio radiopaco', category: 'Endodontia', itemType: 'insumo', quantity: 50, minQuantity: 10, unit: 'kit', unitCost: 75, supplier: 'Biodinamica', notes: 'Kit 1 pasta base e 1 catalisadora', isSterilized: true, ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-76351', itemCode: '76351', name: 'Clorhexidina a 2%, vidro de 100ml', category: 'Biossegurança & EPIs', itemType: 'insumo', quantity: 80, minQuantity: 10, unit: 'caixa', unitCost: 22, supplier: 'Rioquímica', notes: 'Para desinfecção de cavidades', isSterilized: true, ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-76352', itemCode: '76352', name: 'Cola adesiva instantanea universal', category: 'Resinas & Adesivos', itemType: 'insumo', quantity: 60, minQuantity: 10, unit: 'unidade', unitCost: 25, supplier: 'Super Bonder / FGM', notes: 'Vidro de 5 gramas', isSterilized: true, ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-76353', itemCode: '76353', name: 'Cápsula de petry com 3 divisões', category: 'Instrumentais', itemType: 'instrumental', quantity: 15, minQuantity: 3, unit: 'unidade', unitCost: 45, supplier: 'Golgran', notes: 'Armazenamento de brocas', isSterilized: true, ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-76354', itemCode: '76354', name: 'Disco de lixa grossa com 030 4850 G', category: 'Consumíveis & Descartáveis', itemType: 'insumo', quantity: 50, minQuantity: 10, unit: 'unidade', unitCost: 35, supplier: '3M', notes: 'Acabamento e polimento', isSterilized: true, ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-76355', itemCode: '76355', name: 'Disco de lixa grossa com 030 4851 M', category: 'Consumíveis & Descartáveis', itemType: 'insumo', quantity: 50, minQuantity: 10, unit: 'unidade', unitCost: 35, supplier: '3M', notes: 'Acabamento e polimento', isSterilized: true, ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-76356', itemCode: '76356', name: 'Disco de lixa média com 030 4851 M', category: 'Consumíveis & Descartáveis', itemType: 'insumo', quantity: 50, minQuantity: 10, unit: 'unidade', unitCost: 35, supplier: '3M', notes: 'Acabamento e polimento', isSterilized: true, ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-76357', itemCode: '76357', name: 'Disco para polimento resina do tipo sof lex', category: 'Consumíveis & Descartáveis', itemType: 'insumo', quantity: 50, minQuantity: 10, unit: 'unidade', unitCost: 65, supplier: '3M', notes: 'Desgaste interproximal', isSterilized: true, ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-76358', itemCode: '76358', name: 'Disco diamantado dupla face', category: 'Instrumentais', itemType: 'instrumental', quantity: 30, minQuantity: 5, unit: 'unidade', unitCost: 55, supplier: 'KG Sorensen', notes: 'Espessura 0,17 mm', isSterilized: true, ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-76359', itemCode: '76359', name: 'Disco diamantado nº 7011, 0,22mm mono face', category: 'Instrumentais', itemType: 'instrumental', quantity: 30, minQuantity: 5, unit: 'unidade', unitCost: 50, supplier: 'KG Sorensen', notes: 'Desgaste interproximal', isSterilized: true, ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-76360', itemCode: '76360', name: 'Disco diamantado nº 7040, 0,22mm mono face', category: 'Instrumentais', itemType: 'instrumental', quantity: 30, minQuantity: 5, unit: 'unidade', unitCost: 50, supplier: 'KG Sorensen', notes: 'Preparo interdental', isSterilized: true, ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-76361', itemCode: '76361', name: 'Enxaguante bucal 0,12% , sabor menta, clorexidina', category: 'Consumíveis & Descartáveis', itemType: 'insumo', quantity: 50, minQuantity: 10, unit: 'caixa', unitCost: 48, supplier: 'Colgate', notes: 'Embalagem com 100 ml', isSterilized: true, ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-76362', itemCode: '76362', name: 'Edta líquido, vidro de 20 ml', category: 'Endodontia', itemType: 'insumo', quantity: 20, minQuantity: 5, unit: 'unidade', unitCost: 26, supplier: 'Biodinamica', notes: 'Antisséptico bucal', isSterilized: true, ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-76363', itemCode: '76363', name: 'Eucaliptol líquido, vidro de 10 ml', category: 'Endodontia', itemType: 'insumo', quantity: 20, minQuantity: 5, unit: 'unidade', unitCost: 22, supplier: 'Biodinamica', notes: 'Solvente de guta percha', isSterilized: true, ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-76364', itemCode: '76364', name: 'Envelope autoselante para esterelização (vapor EO) 190mmx330mm', category: 'Biossegurança & EPIs', itemType: 'insumo', quantity: 300, minQuantity: 50, unit: 'pacote', unitCost: 60, supplier: 'Stermax', notes: 'Pacote com 100 unidades', isSterilized: true, ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-76365', itemCode: '76365', name: 'Envelope autoselante para esterelização (vapor EO) 140mmx290mm', category: 'Biossegurança & EPIs', itemType: 'insumo', quantity: 300, minQuantity: 50, unit: 'pacote', unitCost: 50, supplier: 'Stermax', notes: 'Pacote com 100 unidades', isSterilized: true, ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-76366', itemCode: '76366', name: 'Envelope autoselante para esterelização (vapor EO) 90mmx260mm', category: 'Biossegurança & EPIs', itemType: 'insumo', quantity: 300, minQuantity: 50, unit: 'pacote', unitCost: 40, supplier: 'Stermax', notes: 'Pacote com 100 unidades', isSterilized: true, ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-76367', itemCode: '76367', name: 'Escova dental adulto macia', category: 'Consumíveis & Descartáveis', itemType: 'insumo', quantity: 500, minQuantity: 50, unit: 'unidade', unitCost: 2.5, supplier: 'Curaprox / Colgate', notes: 'Embalagem de 1 unidade', isSterilized: true, ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-76368', itemCode: '76368', name: 'Escova dental infantil macia', category: 'Consumíveis & Descartáveis', itemType: 'insumo', quantity: 500, minQuantity: 50, unit: 'unidade', unitCost: 2.5, supplier: 'Curaprox / Colgate', notes: 'Embalagem de 1 unidade', isSterilized: true, ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-76369', itemCode: '76369', name: 'Esponja hemostatica de colágeno hidrolizada', category: 'Cirurgia & Periodontia', itemType: 'insumo', quantity: 80, minQuantity: 20, unit: 'caixa', unitCost: 110, supplier: 'Hemospon', notes: 'Caixa com 10 unidades', isSterilized: true, ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-76370', itemCode: '76370', name: 'Eugenol líquido, vidro de 20ml', category: 'Cimentos & Restauração', itemType: 'insumo', quantity: 30, minQuantity: 5, unit: 'unidade', unitCost: 30, supplier: 'SS White', notes: 'Restaurador temporário', isSterilized: true, ownerScope: 'compartilhado', lastUpdated: today },
  // Listas de Materiais de Ensino e Prática Clínica
  { id: 'inv-acd-01', itemCode: 'ACD-01', name: 'Avental branco com manga curta', category: 'Biossegurança & EPIs', itemType: 'insumo', quantity: 1, minQuantity: 0, unit: 'unidade', unitCost: 0, supplier: 'Dental Cremer', notes: 'Laboratórios e aulas práticas', isSterilized: true, ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-acd-02', itemCode: 'ACD-02', name: 'Bloco papel plastificado grande', category: 'Consumíveis & Descartáveis', itemType: 'insumo', quantity: 1, minQuantity: 0, unit: 'bloco', unitCost: 0, supplier: 'Allpack', notes: 'Laboratórios e clínicas', isSterilized: true, ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-acd-03', itemCode: 'ACD-03', name: 'Bloco papel plastificado pequeno', category: 'Consumíveis & Descartáveis', itemType: 'insumo', quantity: 1, minQuantity: 0, unit: 'bloco', unitCost: 0, supplier: 'Allpack', notes: 'Laboratórios e clínicas', isSterilized: true, ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-acd-04', itemCode: 'ACD-04', name: 'Caneta 4 cores', category: 'Consumíveis & Descartáveis', itemType: 'insumo', quantity: 1, minQuantity: 0, unit: 'unidade', unitCost: 0, supplier: 'BIC', notes: 'Uso geral', isSterilized: true, ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-acd-05', itemCode: 'ACD-05', name: 'Colgadura para radiografia', category: 'Radiologia', itemType: 'instrumental', quantity: 1, minQuantity: 0, unit: 'unidade', unitCost: 0, supplier: 'Golgran', notes: 'Revelação radiográfica', isSterilized: true, ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-acd-06', itemCode: 'ACD-06', name: 'Fotografia 3X4', category: 'Consumíveis & Descartáveis', itemType: 'insumo', quantity: 1, minQuantity: 0, unit: 'unidade', unitCost: 0, supplier: 'Estúdio', notes: 'Identificação de prontuário', isSterilized: true, ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-acd-07', itemCode: 'ACD-07', name: 'Isqueiro ou Fósforo', category: 'Consumíveis & Descartáveis', itemType: 'insumo', quantity: 1, minQuantity: 0, unit: 'unidade', unitCost: 0, supplier: 'Comum', notes: 'Acendimento de lamparina', isSterilized: true, ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-acd-08', itemCode: 'ACD-08', name: 'Lápis ou Lapiseira 0,7', category: 'Consumíveis & Descartáveis', itemType: 'insumo', quantity: 1, minQuantity: 0, unit: 'unidade', unitCost: 0, supplier: 'Pentel', notes: 'Desenho e escultura dental', isSterilized: true, ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-acd-09', itemCode: 'ACD-09', name: 'Plástico branco de bancada', category: 'Biossegurança & EPIs', itemType: 'insumo', quantity: 1, minQuantity: 0, unit: 'metro', unitCost: 0, supplier: 'Allpack', notes: 'Proteção de bancada', isSterilized: true, ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-acd-10', itemCode: 'ACD-10', name: 'Prancheta de acrílico', category: 'Consumíveis & Descartáveis', itemType: 'insumo', quantity: 1, minQuantity: 0, unit: 'unidade', unitCost: 0, supplier: 'Acrilex', notes: 'Apoio de anotações', isSterilized: true, ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-acd-11', itemCode: 'ACD-11', name: 'Régua Milimetrada flexível', category: 'Instrumentais', itemType: 'instrumental', quantity: 1, minQuantity: 0, unit: 'unidade', unitCost: 0, supplier: 'Jon', notes: 'Medições clínicas', isSterilized: true, ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-acd-12', itemCode: 'ACD-12', name: 'Manual de desenho e escultura dental', category: 'Consumíveis & Descartáveis', itemType: 'insumo', quantity: 1, minQuantity: 0, unit: 'unidade', unitCost: 0, supplier: 'Editora Dental', notes: 'Anatomia funcional dos dentes', isSterilized: true, ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-acd-13', itemCode: 'ACD-13', name: 'Alicate 139 Rocky Mountain', category: 'Instrumentais', itemType: 'instrumental', quantity: 1, minQuantity: 0, unit: 'unidade', unitCost: 0, supplier: 'Rocky Mountain', notes: 'Biomateriais odontológicos indiretos', isSterilized: true, ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-acd-14', itemCode: 'ACD-14', name: 'Anel p/ fundição nº 4082 + base de silicone', category: 'Prótese & Acrílicos', itemType: 'insumo', quantity: 1, minQuantity: 0, unit: 'conjunto', unitCost: 0, supplier: 'Bio-Art', notes: 'Fundição protética', isSterilized: true, ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-acd-15', itemCode: 'ACD-15', name: 'Esculpidor Hollenback 3S', category: 'Instrumentais', itemType: 'instrumental', quantity: 1, minQuantity: 0, unit: 'unidade', unitCost: 0, supplier: 'Golgran', notes: 'Escultura em cera e resina', isSterilized: true, ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-acd-16', itemCode: 'ACD-16', name: 'Gral de borracha', category: 'Instrumentais', itemType: 'instrumental', quantity: 1, minQuantity: 0, unit: 'unidade', unitCost: 0, supplier: 'Nova OGP', notes: 'Manipulação de gesso e alginato', isSterilized: true, ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-acd-17', itemCode: 'ACD-17', name: 'Manequim para Biomateriais Marília', category: 'Equipamentos', itemType: 'equipamento', quantity: 1, minQuantity: 0, unit: 'unidade', unitCost: 0, supplier: 'Marília', notes: 'Treinamento prático', isSterilized: true, ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-acd-18', itemCode: 'ACD-18', name: 'Micro-motor completo', category: 'Equipamentos', itemType: 'equipamento', quantity: 1, minQuantity: 0, unit: 'unidade', unitCost: 0, supplier: 'Dabi Atlante', notes: 'Peça de mão e micromotor', isSterilized: true, ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-eqp-altarot-led', itemCode: 'EQP-AR-LED', name: 'Alta Rotação com LED (Push Button)', category: 'Equipamentos', itemType: 'equipamento', quantity: 1, minQuantity: 1, unit: 'unidade', unitCost: 450.00, supplier: 'Dabi Atlante / KaVo / Schuster', notes: 'Peça de mão de alta rotação com iluminação LED integrada e sistema Push Button • Esterilizado na Clínica MARV em 18/08/2026 às 10h20 (Validade: 6 meses - Val. 18/02/2027)', requiresSterilization: true, isSterilized: true, sterilizationDate: '2026-08-18', clinicId: 'cli-marv', ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-eqp-altarot-semled', itemCode: 'EQP-AR-SLED', name: 'Alta Rotação sem LED (Push Button / Borden)', category: 'Equipamentos', itemType: 'equipamento', quantity: 2, minQuantity: 1, unit: 'unidade', unitCost: 380.00, supplier: 'Dabi Atlante / KaVo / NSK', notes: 'Peça de mão de alta rotação sem LED com encaixe Borden e sistema Push Button • Esterilizado na Clínica MARV em 18/08/2026 às 10h20 (Validade: 6 meses - Val. 18/02/2027)', requiresSterilization: true, isSterilized: true, sterilizationDate: '2026-08-18', clinicId: 'cli-marv', ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-eqp-micromotor-baixa', itemCode: 'EQP-MM-BAIXA', name: 'Micromotor de Baixa Rotação', category: 'Equipamentos', itemType: 'equipamento', quantity: 2, minQuantity: 1, unit: 'unidade', unitCost: 320.00, supplier: 'Dabi Atlante / KaVo / NSK', notes: 'Micromotor pneumático de baixa rotação com refrigeração e acoplamento universal intra • Esterilizado na Clínica MARV em 18/08/2026 às 10h20 (Validade: 6 meses - Val. 18/02/2027)', requiresSterilization: true, isSterilized: true, sterilizationDate: '2026-08-18', clinicId: 'cli-marv', ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-eqp-ultrassom-pneu', itemCode: 'EQP-US-PNEU', name: 'Ultrassom Pneumático', category: 'Equipamentos', itemType: 'equipamento', quantity: 1, minQuantity: 1, unit: 'unidade', unitCost: 890.00, supplier: 'Dabi Atlante / Schuster / W&H', notes: 'Aparelho de ultrassom odontológico pneumático acoplável ao equipo para profilaxia e periodontia • Esterilizado na Clínica MARV em 18/08/2026 às 10h20 (Validade: 6 meses - Val. 18/02/2027)', requiresSterilization: true, isSterilized: true, sterilizationDate: '2026-08-18', clinicId: 'cli-marv', ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-ins-chave-ultrassom', itemCode: 'INS-CHV-US', name: 'Chave de Torque para Ultrassom', category: 'Instrumentais', itemType: 'instrumental', quantity: 1, minQuantity: 1, unit: 'unidade', unitCost: 65.00, supplier: 'Dabi Atlante / Schuster / Woodpecker', notes: 'Chave esterilizável para aperto e fixação segura de pontas/insertos de ultrassom • Esterilizado na Clínica MARV em 18/08/2026 às 10h20 (Validade: 6 meses - Val. 18/02/2027)', requiresSterilization: true, isSterilized: true, sterilizationDate: '2026-08-18', clinicId: 'cli-marv', ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-ins-ponta-ultrassom', itemCode: 'INS-PNT-US', name: 'Ponta / Inserto de Ultrassom', category: 'Instrumentais', itemType: 'instrumental', quantity: 1, minQuantity: 1, unit: 'unidade', unitCost: 85.00, supplier: 'Dabi Atlante / Schuster / Woodpecker', notes: 'Ponta de ultrassom esterilizável para remoção de tártaro e raspagem periodontal • Esterilizado na Clínica MARV em 18/08/2026 às 10h20 (Validade: 6 meses - Val. 18/02/2027)', requiresSterilization: true, isSterilized: true, sterilizationDate: '2026-08-18', clinicId: 'cli-marv', ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-acd-19', itemCode: 'ACD-19', name: 'Caneta hidrocor verde/verm/preto', category: 'Consumíveis & Descartáveis', itemType: 'insumo', quantity: 1, minQuantity: 0, unit: 'kit', unitCost: 0, supplier: 'Faber-Castell', notes: 'Odontologia em saúde coletiva', isSterilized: true, ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-acd-20', itemCode: 'ACD-20', name: 'Modelo ensino escovação par', category: 'Equipamentos', itemType: 'equipamento', quantity: 1, minQuantity: 0, unit: 'par', unitCost: 0, supplier: 'Orais', notes: 'Educação em saúde bucal', isSterilized: true, ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-acd-21', itemCode: 'ACD-21', name: 'Brunidor nº 29', category: 'Instrumentais', itemType: 'instrumental', quantity: 1, minQuantity: 0, unit: 'unidade', unitCost: 0, supplier: 'Golgran', notes: 'Biomateriais diretos', isSterilized: true, ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-acd-22', itemCode: 'ACD-22', name: 'Condensador p/ Am nº 1 Ward', category: 'Instrumentais', itemType: 'instrumental', quantity: 1, minQuantity: 0, unit: 'unidade', unitCost: 0, supplier: 'Golgran', notes: 'Condensação de amálgama', isSterilized: true, ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-acd-23', itemCode: 'ACD-23', name: 'Condensador p/ Am nº 2 Ward', category: 'Instrumentais', itemType: 'instrumental', quantity: 1, minQuantity: 0, unit: 'unidade', unitCost: 0, supplier: 'Golgran', notes: 'Condensação de amálgama', isSterilized: true, ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-acd-24', itemCode: 'ACD-24', name: 'Condensador p/ Am nº 4 Ward', category: 'Instrumentais', itemType: 'instrumental', quantity: 1, minQuantity: 0, unit: 'unidade', unitCost: 0, supplier: 'Golgran', notes: 'Condensação de amálgama', isSterilized: true, ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-acd-25', itemCode: 'ACD-25', name: 'Condensador p/ Am nº 6 Ward', category: 'Instrumentais', itemType: 'instrumental', quantity: 1, minQuantity: 0, unit: 'unidade', unitCost: 0, supplier: 'Golgran', notes: 'Condensação de amálgama', isSterilized: true, ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-acd-26', itemCode: 'ACD-26', name: 'Instrumento PKT nº 2 gotejador duplo', category: 'Instrumentais', itemType: 'instrumental', quantity: 1, minQuantity: 0, unit: 'unidade', unitCost: 0, supplier: 'Kota', notes: 'Escultura e ceroplastia', isSterilized: true, ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-acd-27', itemCode: 'ACD-27', name: 'Articulador semi ajustável + arco facial Bioart 4000S', category: 'Equipamentos', itemType: 'equipamento', quantity: 1, minQuantity: 0, unit: 'unidade', unitCost: 0, supplier: 'Bio-Art', notes: 'Fisiologia do sistema estomatognático', isSterilized: true, ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-acd-28', itemCode: 'ACD-28', name: 'Kit de periodontia referência 9281', category: 'Instrumentais', itemType: 'instrumental', quantity: 1, minQuantity: 0, unit: 'kit', unitCost: 0, supplier: 'Millennium', notes: 'Periodontia clínica', isSterilized: true, ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-acd-29', itemCode: 'ACD-29', name: 'Curetas Gracey 5/6 - 7/8 - 11/12 - 13/14', category: 'Instrumentais', itemType: 'instrumental', quantity: 1, minQuantity: 0, unit: 'kit', unitCost: 0, supplier: 'Millennium', notes: 'Raspagem periodontal', isSterilized: true, ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-acd-30', itemCode: 'ACD-30', name: 'Kit Endodôntico Simplificado', category: 'Endodontia', itemType: 'instrumental', quantity: 1, minQuantity: 0, unit: 'kit', unitCost: 0, supplier: 'Maillefer', notes: 'Endodontia pré-clínica', isSterilized: true, ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-acd-31', itemCode: 'ACD-31', name: 'IRM (Cimento OZE temporário)', category: 'Cimentos & Restauração', itemType: 'insumo', quantity: 1, minQuantity: 0, unit: 'frasco', unitCost: 0, supplier: 'Dentsply', notes: 'Restauração provisória', isSterilized: true, ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-acd-32', itemCode: 'ACD-32', name: 'Jogo de silicona (Denso, fluido e catalisador)', category: 'Prótese & Acrílicos', itemType: 'insumo', quantity: 1, minQuantity: 0, unit: 'jogo', unitCost: 0, supplier: 'Zhermack', notes: 'Moldagem de precisão', isSterilized: true, ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-acd-33', itemCode: 'ACD-33', name: 'Cimento de ionômero de vidro autopolimerizável', category: 'Cimentos & Restauração', itemType: 'insumo', quantity: 1, minQuantity: 0, unit: 'caixa', unitCost: 0, supplier: 'Vigodent', notes: 'Restauração e selamento', isSterilized: true, ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-acd-35', itemCode: 'ACD-35', name: 'Verniz fluoretado', category: 'Consumíveis & Descartáveis', itemType: 'insumo', quantity: 1, minQuantity: 0, unit: 'frasco', unitCost: 0, supplier: 'FGM', notes: 'Prevenção de cárie', isSterilized: true, ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-acd-36', itemCode: 'ACD-36', name: 'Verniz cavitário', category: 'Cimentos & Restauração', itemType: 'insumo', quantity: 1, minQuantity: 0, unit: 'frasco', unitCost: 0, supplier: 'SS White', notes: 'Proteção dentinária', isSterilized: true, ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-acd-37', itemCode: 'ACD-37', name: 'Selante fotopolimerizável', category: 'Resinas & Adesivos', itemType: 'insumo', quantity: 1, minQuantity: 0, unit: 'seringa', unitCost: 0, supplier: 'FGM', notes: 'Selamento de fóssulas e fissuras', isSterilized: true, ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-acd-38', itemCode: 'ACD-38', name: 'Pasta zinquenólica', category: 'Prótese & Acrílicos', itemType: 'insumo', quantity: 1, minQuantity: 0, unit: 'tubo', unitCost: 0, supplier: 'Lysanda', notes: 'Moldagem em desdentados', isSterilized: true, ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-acd-39', itemCode: 'ACD-39', name: 'Medidor de água para alginato', category: 'Instrumentais', itemType: 'instrumental', quantity: 1, minQuantity: 0, unit: 'unidade', unitCost: 0, supplier: 'Dentsply', notes: 'Proporção de alginato', isSterilized: true, ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-acd-40', itemCode: 'ACD-40', name: 'Placa de vidro - média e grossa', category: 'Instrumentais', itemType: 'instrumental', quantity: 1, minQuantity: 0, unit: 'conjunto', unitCost: 0, supplier: 'Golgran', notes: 'Espatulação de cimentos', isSterilized: true, ownerScope: 'compartilhado', lastUpdated: today },


  // Grampos para Isolamento Absoluto Separados por Região
  // Região 1: Anteriores (Incisivos e Caninos)
  { id: 'inv-grp-9', itemCode: 'GRP-009', name: 'Grampo 9 - Anteriores (Incisivos e Caninos)', category: 'Instrumentais', itemType: 'instrumental', quantity: 1, minQuantity: 1, unit: 'unidade', unitCost: 45.00, supplier: 'Golgran / Duflex', notes: 'Grampo para Isolamento Absoluto • Região: Anteriores (Incisivos e Caninos) • Esterilizado na Clínica MARV em 18/08/2026 às 10h20 (Val. 18/02/2027)', requiresSterilization: true, isSterilized: true, sterilizationDate: '2026-08-18', sterilizedBy: 'Hugo Andres Iglesias Ricoy', autoclaveModel: 'Autoclave Cristófoli Vitale Class 12L', autoclaveWaterVolume: '150 ml de água destilada', autoclaveTemperature: '129°C – 132°C', autoclavePressure: '1,7 a 1,9 kgf/cm²', autoclaveSterilizationTime: '16 minutos', autoclaveDryingMode: 'Secagem com porta entreaberta', autoclaveCycleType: 'Automático (Programa Único)', clinicId: 'cli-marv', ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-grp-210', itemCode: 'GRP-210', name: 'Grampo 210 - Anteriores (Incisivos e Caninos)', category: 'Instrumentais', itemType: 'instrumental', quantity: 2, minQuantity: 1, unit: 'unidade', unitCost: 45.00, supplier: 'Golgran / Duflex', notes: 'Grampo para Isolamento Absoluto • Região: Anteriores (Incisivos e Caninos) • Esterilizado na Clínica MARV em 18/08/2026 às 10h20 (Val. 18/02/2027)', requiresSterilization: true, isSterilized: true, sterilizationDate: '2026-08-18', sterilizedBy: 'Hugo Andres Iglesias Ricoy', autoclaveModel: 'Autoclave Cristófoli Vitale Class 12L', autoclaveWaterVolume: '150 ml de água destilada', autoclaveTemperature: '129°C – 132°C', autoclavePressure: '1,7 a 1,9 kgf/cm²', autoclaveSterilizationTime: '16 minutos', autoclaveDryingMode: 'Secagem com porta entreaberta', autoclaveCycleType: 'Automático (Programa Único)', clinicId: 'cli-marv', ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-grp-211', itemCode: 'GRP-211', name: 'Grampo 211 - Anteriores (Incisivos e Caninos)', category: 'Instrumentais', itemType: 'instrumental', quantity: 0, minQuantity: 1, unit: 'unidade', unitCost: 45.00, supplier: 'Golgran / Duflex', notes: 'Grampo para Isolamento Absoluto • Região: Anteriores (Incisivos e Caninos)', requiresSterilization: true, isSterilized: true, sterilizedBy: 'Hugo Andres Iglesias Ricoy', autoclaveModel: 'Autoclave Cristófoli Vitale Class 12L', ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-grp-212', itemCode: 'GRP-212', name: 'Grampo 212 - Anteriores (Incisivos e Caninos)', category: 'Instrumentais', itemType: 'instrumental', quantity: 2, minQuantity: 1, unit: 'unidade', unitCost: 45.00, supplier: 'Golgran / Duflex', notes: 'Grampo para Isolamento Absoluto • Região: Anteriores (Incisivos e Caninos - Retração Gengival) • Esterilizado na Clínica MARV em 18/08/2026 às 10h20 (Val. 18/02/2027)', requiresSterilization: true, isSterilized: true, sterilizationDate: '2026-08-18', sterilizedBy: 'Hugo Andres Iglesias Ricoy', autoclaveModel: 'Autoclave Cristófoli Vitale Class 12L', autoclaveWaterVolume: '150 ml de água destilada', autoclaveTemperature: '129°C – 132°C', autoclavePressure: '1,7 a 1,9 kgf/cm²', autoclaveSterilizationTime: '16 minutos', autoclaveDryingMode: 'Secagem com porta entreaberta', autoclaveCycleType: 'Automático (Programa Único)', clinicId: 'cli-marv', ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-grp-212l', itemCode: 'GRP-212L', name: 'Grampo 212L - Anteriores (Incisivos e Caninos - Esquerdo)', category: 'Instrumentais', itemType: 'instrumental', quantity: 2, minQuantity: 1, unit: 'unidade', unitCost: 45.00, supplier: 'Golgran / Duflex', notes: 'Grampo para Isolamento Absoluto • Região: Anteriores (Incisivos e Caninos - Modificado Esquerdo) • Esterilizado na Clínica MARV em 18/08/2026 às 10h20 (Val. 18/02/2027)', requiresSterilization: true, isSterilized: true, sterilizationDate: '2026-08-18', sterilizedBy: 'Hugo Andres Iglesias Ricoy', autoclaveModel: 'Autoclave Cristófoli Vitale Class 12L', autoclaveWaterVolume: '150 ml de água destilada', autoclaveTemperature: '129°C – 132°C', autoclavePressure: '1,7 a 1,9 kgf/cm²', autoclaveSterilizationTime: '16 minutos', autoclaveDryingMode: 'Secagem com porta entreaberta', autoclaveCycleType: 'Automático (Programa Único)', clinicId: 'cli-marv', ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-grp-212r', itemCode: 'GRP-212R', name: 'Grampo 212R - Anteriores (Incisivos e Caninos - Direito)', category: 'Instrumentais', itemType: 'instrumental', quantity: 1, minQuantity: 1, unit: 'unidade', unitCost: 45.00, supplier: 'Golgran / Duflex', notes: 'Grampo para Isolamento Absoluto • Região: Anteriores (Incisivos e Caninos - Modificado Direito) • Esterilizado na Clínica MARV em 18/08/2026 às 10h20 (Val. 18/02/2027)', requiresSterilization: true, isSterilized: true, sterilizationDate: '2026-08-18', sterilizedBy: 'Hugo Andres Iglesias Ricoy', autoclaveModel: 'Autoclave Cristófoli Vitale Class 12L', autoclaveWaterVolume: '150 ml de água destilada', autoclaveTemperature: '129°C – 132°C', autoclavePressure: '1,7 a 1,9 kgf/cm²', autoclaveSterilizationTime: '16 minutos', autoclaveDryingMode: 'Secagem com porta entreaberta', autoclaveCycleType: 'Automático (Programa Único)', clinicId: 'cli-marv', ownerScope: 'compartilhado', lastUpdated: today },

  // Região 2: Pré-Molares (e Odontopediatria)
  { id: 'inv-grp-0', itemCode: 'GRP-000', name: 'Grampo 0 - Pré-Molares e Odontopediatria', category: 'Instrumentais', itemType: 'instrumental', quantity: 1, minQuantity: 1, unit: 'unidade', unitCost: 45.00, supplier: 'Golgran / Duflex', notes: 'Grampo para Isolamento Absoluto • Região: Pré-Molares (e Odontopediatria) • Esterilizado na Clínica MARV em 18/08/2026 às 10h20 (Val. 18/02/2027)', requiresSterilization: true, isSterilized: true, sterilizationDate: '2026-08-18', clinicId: 'cli-marv', ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-grp-00', itemCode: 'GRP-0000', name: 'Grampo 00 - Pré-Molares e Odontopediatria', category: 'Instrumentais', itemType: 'instrumental', quantity: 0, minQuantity: 1, unit: 'unidade', unitCost: 45.00, supplier: 'Golgran / Duflex', notes: 'Grampo para Isolamento Absoluto • Região: Pré-Molares (e Odontopediatria - Dentes Pequenos/Caninos)', requiresSterilization: true, isSterilized: true, ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-grp-1', itemCode: 'GRP-001', name: 'Grampo 1 - Pré-Molares e Odontopediatria', category: 'Instrumentais', itemType: 'instrumental', quantity: 0, minQuantity: 1, unit: 'unidade', unitCost: 45.00, supplier: 'Golgran / Duflex', notes: 'Grampo para Isolamento Absoluto • Região: Pré-Molares (e Odontopediatria)', requiresSterilization: true, isSterilized: true, ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-grp-1a', itemCode: 'GRP-001A', name: 'Grampo 1A - Pré-Molares e Odontopediatria (com Asas)', category: 'Instrumentais', itemType: 'instrumental', quantity: 2, minQuantity: 1, unit: 'unidade', unitCost: 45.00, supplier: 'Golgran / Duflex', notes: 'Grampo para Isolamento Absoluto com Asas • Região: Pré-Molares (e Odontopediatria) • Esterilizado na Clínica MARV em 18/08/2026 às 10h20 (Val. 18/02/2027)', requiresSterilization: true, isSterilized: true, sterilizationDate: '2026-08-18', clinicId: 'cli-marv', ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-grp-2', itemCode: 'GRP-002', name: 'Grampo 2 - Pré-Molares e Odontopediatria', category: 'Instrumentais', itemType: 'instrumental', quantity: 0, minQuantity: 1, unit: 'unidade', unitCost: 45.00, supplier: 'Golgran / Duflex', notes: 'Grampo para Isolamento Absoluto • Região: Pré-Molares (e Odontopediatria)', requiresSterilization: true, isSterilized: true, ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-grp-2a', itemCode: 'GRP-002A', name: 'Grampo 2A - Pré-Molares e Odontopediatria (com Asas)', category: 'Instrumentais', itemType: 'instrumental', quantity: 2, minQuantity: 1, unit: 'unidade', unitCost: 45.00, supplier: 'Golgran / Duflex', notes: 'Grampo para Isolamento Absoluto com Asas • Região: Pré-Molares (e Odontopediatria) • Esterilizado na Clínica MARV em 18/08/2026 às 10h20 (Val. 18/02/2027)', requiresSterilization: true, isSterilized: true, sterilizationDate: '2026-08-18', clinicId: 'cli-marv', ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-grp-w2', itemCode: 'GRP-W2', name: 'Grampo W2 - Pré-Molares e Odontopediatria (sem Asas)', category: 'Instrumentais', itemType: 'instrumental', quantity: 0, minQuantity: 1, unit: 'unidade', unitCost: 45.00, supplier: 'Golgran / Duflex', notes: 'Grampo para Isolamento Absoluto sem Asas • Região: Pré-Molares (e Odontopediatria)', requiresSterilization: true, isSterilized: true, ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-grp-w2a', itemCode: 'GRP-W2A', name: 'Grampo W2A - Pré-Molares e Odontopediatria (sem Asas)', category: 'Instrumentais', itemType: 'instrumental', quantity: 0, minQuantity: 1, unit: 'unidade', unitCost: 45.00, supplier: 'Golgran / Duflex', notes: 'Grampo para Isolamento Absoluto sem Asas • Região: Pré-Molares (e Odontopediatria)', requiresSterilization: true, isSterilized: true, ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-grp-206', itemCode: 'GRP-206', name: 'Grampo 206 - Pré-Molares e Odontopediatria', category: 'Instrumentais', itemType: 'instrumental', quantity: 1, minQuantity: 1, unit: 'unidade', unitCost: 45.00, supplier: 'Golgran / Duflex', notes: 'Grampo para Isolamento Absoluto • Região: Pré-Molares (e Odontopediatria) • Esterilizado na Clínica MARV em 18/08/2026 às 10h20 (Val. 18/02/2027)', requiresSterilization: true, isSterilized: true, sterilizationDate: '2026-08-18', clinicId: 'cli-marv', ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-grp-207', itemCode: 'GRP-207', name: 'Grampo 207 - Pré-Molares e Odontopediatria', category: 'Instrumentais', itemType: 'instrumental', quantity: 2, minQuantity: 1, unit: 'unidade', unitCost: 45.00, supplier: 'Golgran / Duflex', notes: 'Grampo para Isolamento Absoluto • Região: Pré-Molares (e Odontopediatria) • Esterilizado na Clínica MARV em 18/08/2026 às 10h20 (Val. 18/02/2027)', requiresSterilization: true, isSterilized: true, sterilizationDate: '2026-08-18', clinicId: 'cli-marv', ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-grp-208', itemCode: 'GRP-208', name: 'Grampo 208 - Pré-Molares e Odontopediatria', category: 'Instrumentais', itemType: 'instrumental', quantity: 0, minQuantity: 1, unit: 'unidade', unitCost: 45.00, supplier: 'Golgran / Duflex', notes: 'Grampo para Isolamento Absoluto • Região: Pré-Molares (e Odontopediatria)', requiresSterilization: true, isSterilized: true, ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-grp-209', itemCode: 'GRP-209', name: 'Grampo 209 - Pré-Molares e Odontopediatria', category: 'Instrumentais', itemType: 'instrumental', quantity: 3, minQuantity: 1, unit: 'unidade', unitCost: 45.00, supplier: 'Golgran / Duflex', notes: 'Grampo para Isolamento Absoluto • Região: Pré-Molares (e Odontopediatria) • Esterilizado na Clínica MARV em 18/08/2026 às 10h20 (Val. 18/02/2027)', requiresSterilization: true, isSterilized: true, sterilizationDate: '2026-08-18', clinicId: 'cli-marv', ownerScope: 'compartilhado', lastUpdated: today },

  // Região 3: Molares (Anatomia Padrão)
  { id: 'inv-grp-3', itemCode: 'GRP-003', name: 'Grampo 3 - Molares (Anatomia Padrão)', category: 'Instrumentais', itemType: 'instrumental', quantity: 0, minQuantity: 1, unit: 'unidade', unitCost: 45.00, supplier: 'Golgran / Duflex', notes: 'Grampo para Isolamento Absoluto • Região: Molares (Anatomia Padrão)', requiresSterilization: true, isSterilized: true, ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-grp-5', itemCode: 'GRP-005', name: 'Grampo 5 - Molares (Anatomia Padrão)', category: 'Instrumentais', itemType: 'instrumental', quantity: 1, minQuantity: 1, unit: 'unidade', unitCost: 45.00, supplier: 'Golgran / Duflex', notes: 'Grampo para Isolamento Absoluto • Região: Molares (Anatomia Padrão) • Esterilizado na Clínica MARV em 18/08/2026 às 10h20 (Val. 18/02/2027)', requiresSterilization: true, isSterilized: true, sterilizationDate: '2026-08-18', clinicId: 'cli-marv', ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-grp-7', itemCode: 'GRP-007', name: 'Grampo 7 - Molares (Anatomia Padrão)', category: 'Instrumentais', itemType: 'instrumental', quantity: 0, minQuantity: 1, unit: 'unidade', unitCost: 45.00, supplier: 'Golgran / Duflex', notes: 'Grampo para Isolamento Absoluto • Região: Molares (Anatomia Padrão)', requiresSterilization: true, isSterilized: true, ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-grp-7a', itemCode: 'GRP-007A', name: 'Grampo 7A - Molares (Anatomia Padrão com Asas)', category: 'Instrumentais', itemType: 'instrumental', quantity: 1, minQuantity: 1, unit: 'unidade', unitCost: 45.00, supplier: 'Golgran / Duflex', notes: 'Grampo para Isolamento Absoluto com Asas • Região: Molares (Anatomia Padrão) • Esterilizado na Clínica MARV em 18/08/2026 às 10h20 (Val. 18/02/2027)', requiresSterilization: true, isSterilized: true, sterilizationDate: '2026-08-18', clinicId: 'cli-marv', ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-grp-8', itemCode: 'GRP-008', name: 'Grampo 8 - Molares Superiores (Anatomia Padrão)', category: 'Instrumentais', itemType: 'instrumental', quantity: 2, minQuantity: 1, unit: 'unidade', unitCost: 45.00, supplier: 'Golgran / Duflex', notes: 'Grampo para Isolamento Absoluto • Região: Molares Superiores (Anatomia Padrão) • Esterilizado na Clínica MARV em 18/08/2026 às 10h20 (Val. 18/02/2027)', requiresSterilization: true, isSterilized: true, sterilizationDate: '2026-08-18', clinicId: 'cli-marv', ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-grp-200', itemCode: 'GRP-200', name: 'Grampo 200 - Molares (Anatomia Padrão)', category: 'Instrumentais', itemType: 'instrumental', quantity: 0, minQuantity: 1, unit: 'unidade', unitCost: 45.00, supplier: 'Golgran / Duflex', notes: 'Grampo para Isolamento Absoluto • Região: Molares (Anatomia Padrão)', requiresSterilization: true, isSterilized: true, ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-grp-201', itemCode: 'GRP-201', name: 'Grampo 201 - Molares (Anatomia Padrão)', category: 'Instrumentais', itemType: 'instrumental', quantity: 0, minQuantity: 1, unit: 'unidade', unitCost: 45.00, supplier: 'Golgran / Duflex', notes: 'Grampo para Isolamento Absoluto • Região: Molares (Anatomia Padrão)', requiresSterilization: true, isSterilized: true, ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-grp-202', itemCode: 'GRP-202', name: 'Grampo 202 - Molares (Anatomia Padrão)', category: 'Instrumentais', itemType: 'instrumental', quantity: 1, minQuantity: 1, unit: 'unidade', unitCost: 45.00, supplier: 'Golgran / Duflex', notes: 'Grampo para Isolamento Absoluto • Região: Molares (Anatomia Padrão) • Esterilizado na Clínica MARV em 18/08/2026 às 10h20 (Val. 18/02/2027)', requiresSterilization: true, isSterilized: true, sterilizationDate: '2026-08-18', clinicId: 'cli-marv', ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-grp-203', itemCode: 'GRP-203', name: 'Grampo 203 - Molares (Anatomia Padrão)', category: 'Instrumentais', itemType: 'instrumental', quantity: 0, minQuantity: 1, unit: 'unidade', unitCost: 45.00, supplier: 'Golgran / Duflex', notes: 'Grampo para Isolamento Absoluto • Região: Molares (Anatomia Padrão)', requiresSterilization: true, isSterilized: true, ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-grp-204', itemCode: 'GRP-204', name: 'Grampo 204 - Molares (Anatomia Padrão)', category: 'Instrumentais', itemType: 'instrumental', quantity: 0, minQuantity: 1, unit: 'unidade', unitCost: 45.00, supplier: 'Golgran / Duflex', notes: 'Grampo para Isolamento Absoluto • Região: Molares (Anatomia Padrão)', requiresSterilization: true, isSterilized: true, ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-grp-205', itemCode: 'GRP-205', name: 'Grampo 205 - Molares (Anatomia Padrão)', category: 'Instrumentais', itemType: 'instrumental', quantity: 2, minQuantity: 1, unit: 'unidade', unitCost: 45.00, supplier: 'Golgran / Duflex', notes: 'Grampo para Isolamento Absoluto • Região: Molares (Anatomia Padrão) • Esterilizado na Clínica MARV em 18/08/2026 às 10h20 (Val. 18/02/2027)', requiresSterilization: true, isSterilized: true, sterilizationDate: '2026-08-18', clinicId: 'cli-marv', ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-grp-teflon-molar', itemCode: 'GRP-TEF-MOL', name: 'Grampo de Teflon para Molares (Radiotransparente / Não Metálico)', category: 'Instrumentais', itemType: 'instrumental', quantity: 1, minQuantity: 1, unit: 'unidade', unitCost: 65.00, supplier: 'Kerr / Hu-Friedy / Polydentia', notes: 'Grampo em Teflon/polímero para isolamento absoluto em molares (radiotransparente, biocompatível e sem risco de danos ao esmalte/cerâmica) • Esterilizado na Clínica MARV em 18/08/2026 às 10h20 (Val. 18/02/2027)', requiresSterilization: true, isSterilized: true, sterilizationDate: '2026-08-18', clinicId: 'cli-marv', ownerScope: 'compartilhado', lastUpdated: today },

  // Região 4: Molares Especiais (Coroas Curtas, Fraturadas ou Parcialmente Erupcionados)
  { id: 'inv-grp-8a', itemCode: 'GRP-008A', name: 'Grampo 8A - Molares Especiais (Coroas Curtas/Fraturadas)', category: 'Instrumentais', itemType: 'instrumental', quantity: 1, minQuantity: 1, unit: 'unidade', unitCost: 45.00, supplier: 'Golgran / Duflex', notes: 'Grampo para Isolamento Absoluto • Região: Molares Especiais (Coroas Curtas, Fraturadas ou Parcialmente Erupcionados) • Esterilizado na Clínica MARV em 18/08/2026 às 10h20 (Val. 18/02/2027)', requiresSterilization: true, isSterilized: true, sterilizationDate: '2026-08-18', clinicId: 'cli-marv', ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-grp-w8a', itemCode: 'GRP-W8A', name: 'Grampo W8A - Molares Especiais sem Asas (Coroas Curtas/Fraturadas)', category: 'Instrumentais', itemType: 'instrumental', quantity: 0, minQuantity: 1, unit: 'unidade', unitCost: 45.00, supplier: 'Golgran / Duflex', notes: 'Grampo para Isolamento Absoluto sem Asas • Região: Molares Especiais (Coroas Curtas, Fraturadas ou Parcialmente Erupcionados)', requiresSterilization: true, isSterilized: true, ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-grp-12a', itemCode: 'GRP-012A', name: 'Grampo 12A - Molares Especiais (Coroas Curtas/Fraturadas)', category: 'Instrumentais', itemType: 'instrumental', quantity: 0, minQuantity: 1, unit: 'unidade', unitCost: 45.00, supplier: 'Golgran / Duflex', notes: 'Grampo para Isolamento Absoluto Serrilhado • Região: Molares Especiais (Coroas Curtas, Fraturadas ou Parcialmente Erupcionados)', requiresSterilization: true, isSterilized: true, ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-grp-13a', itemCode: 'GRP-013A', name: 'Grampo 13A - Molares Especiais (Coroas Curtas/Fraturadas)', category: 'Instrumentais', itemType: 'instrumental', quantity: 0, minQuantity: 1, unit: 'unidade', unitCost: 45.00, supplier: 'Golgran / Duflex', notes: 'Grampo para Isolamento Absoluto Serrilhado • Região: Molares Especiais (Coroas Curtas, Fraturadas ou Parcialmente Erupcionados)', requiresSterilization: true, isSterilized: true, ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-grp-14', itemCode: 'GRP-014', name: 'Grampo 14 - Molares Especiais (Coroas Parcialmente Erupcionadas)', category: 'Instrumentais', itemType: 'instrumental', quantity: 0, minQuantity: 1, unit: 'unidade', unitCost: 45.00, supplier: 'Golgran / Duflex', notes: 'Grampo para Isolamento Absoluto • Região: Molares Especiais (Coroas Curtas, Fraturadas ou Parcialmente Erupcionados)', requiresSterilization: true, isSterilized: true, ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-grp-14a', itemCode: 'GRP-014A', name: 'Grampo 14A - Molares Especiais (Coroas Curtas/Erupcionadas)', category: 'Instrumentais', itemType: 'instrumental', quantity: 2, minQuantity: 1, unit: 'unidade', unitCost: 45.00, supplier: 'Golgran / Duflex', notes: 'Grampo para Isolamento Absoluto • Região: Molares Especiais (Coroas Curtas, Fraturadas ou Parcialmente Erupcionados) • Esterilizado na Clínica MARV em 18/08/2026 às 10h20 (Val. 18/02/2027)', requiresSterilization: true, isSterilized: true, sterilizationDate: '2026-08-18', clinicId: 'cli-marv', ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-grp-w14a', itemCode: 'GRP-W14A', name: 'Grampo W14A - Molares Especiais sem Asas (Coroas Curtas/Erupcionadas)', category: 'Instrumentais', itemType: 'instrumental', quantity: 1, minQuantity: 1, unit: 'unidade', unitCost: 45.00, supplier: 'Golgran / Duflex', notes: 'Grampo para Isolamento Absoluto sem Asas • Região: Molares Especiais (Coroas Curtas, Fraturadas ou Parcialmente Erupcionados) • Esterilizado na Clínica MARV em 18/08/2026 às 10h20 (Val. 18/02/2027)', requiresSterilization: true, isSterilized: true, sterilizationDate: '2026-08-18', clinicId: 'cli-marv', ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-grp-26', itemCode: 'GRP-026', name: 'Grampo 26 - Molares Especiais (Sem Asas)', category: 'Instrumentais', itemType: 'instrumental', quantity: 1, minQuantity: 1, unit: 'unidade', unitCost: 45.00, supplier: 'Golgran / Duflex', notes: 'Grampo para Isolamento Absoluto • Região: Molares Especiais (Coroas Curtas, Fraturadas ou Parcialmente Erupcionados) • Esterilizado na Clínica MARV em 18/08/2026 às 10h20 (Val. 18/02/2027)', requiresSterilization: true, isSterilized: true, sterilizationDate: '2026-08-18', clinicId: 'cli-marv', ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-grp-27', itemCode: 'GRP-027', name: 'Grampo 27 - Molares Especiais', category: 'Instrumentais', itemType: 'instrumental', quantity: 0, minQuantity: 1, unit: 'unidade', unitCost: 45.00, supplier: 'Golgran / Duflex', notes: 'Grampo para Isolamento Absoluto • Região: Molares Especiais (Coroas Curtas, Fraturadas ou Parcialmente Erupcionados)', requiresSterilization: true, isSterilized: true, ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-grp-28', itemCode: 'GRP-028', name: 'Grampo 28 - Molares Especiais', category: 'Instrumentais', itemType: 'instrumental', quantity: 0, minQuantity: 1, unit: 'unidade', unitCost: 45.00, supplier: 'Golgran / Duflex', notes: 'Grampo para Isolamento Absoluto • Região: Molares Especiais (Coroas Curtas, Fraturadas ou Parcialmente Erupcionados)', requiresSterilization: true, isSterilized: true, ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-grp-29', itemCode: 'GRP-029', name: 'Grampo 29 - Molares Especiais', category: 'Instrumentais', itemType: 'instrumental', quantity: 3, minQuantity: 1, unit: 'unidade', unitCost: 45.00, supplier: 'Golgran / Duflex', notes: 'Grampo para Isolamento Absoluto • Região: Molares Especiais (Coroas Curtas, Fraturadas ou Parcialmente Erupcionados) • Esterilizado na Clínica MARV em 18/08/2026 às 10h20 (Val. 18/02/2027)', requiresSterilization: true, isSterilized: true, sterilizationDate: '2026-08-18', clinicId: 'cli-marv', ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-grp-56', itemCode: 'GRP-056', name: 'Grampo 56 - Molares Especiais', category: 'Instrumentais', itemType: 'instrumental', quantity: 0, minQuantity: 1, unit: 'unidade', unitCost: 45.00, supplier: 'Golgran / Duflex', notes: 'Grampo para Isolamento Absoluto • Região: Molares Especiais (Coroas Curtas, Fraturadas ou Parcialmente Erupcionados)', requiresSterilization: true, isSterilized: true, ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-grp-56s', itemCode: 'GRP-056S', name: 'Grampo 56S - Molares Especiais (Serrilhado / Universal)', category: 'Instrumentais', itemType: 'instrumental', quantity: 1, minQuantity: 1, unit: 'unidade', unitCost: 45.00, supplier: 'Golgran / Duflex', notes: 'Grampo para Isolamento Absoluto Serrilhado • Região: Molares Especiais (Coroas Curtas, Fraturadas ou Parcialmente Erupcionados) • Esterilizado na Clínica MARV em 18/08/2026 às 10h20 (Val. 18/02/2027)', requiresSterilization: true, isSterilized: true, sterilizationDate: '2026-08-18', clinicId: 'cli-marv', ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-grp-w56', itemCode: 'GRP-W56', name: 'Grampo W56 - Molares Especiais sem Asas', category: 'Instrumentais', itemType: 'instrumental', quantity: 0, minQuantity: 1, unit: 'unidade', unitCost: 45.00, supplier: 'Golgran / Duflex', notes: 'Grampo para Isolamento Absoluto sem Asas • Região: Molares Especiais (Coroas Curtas, Fraturadas ou Parcialmente Erupcionados)', requiresSterilization: true, isSterilized: true, ownerScope: 'compartilhado', lastUpdated: today },

  // Brocas Largo (Peeso) - N° 1 a N° 6 (1 item para cada)
  { id: 'inv-largo-1', itemCode: 'LRG-001', name: 'Broca Largo (Peeso) Nº 1', category: 'Endodontia', itemType: 'instrumental', quantity: 1, minQuantity: 1, unit: 'unidade', unitCost: 35.00, supplier: 'Maillefer / Dentsply', notes: 'Broca Largo (Peeso) Nº 1 (0.70mm) para preparo e desobstrução de conduto radicular', requiresSterilization: true, isSterilized: true, ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-largo-2', itemCode: 'LRG-002', name: 'Broca Largo (Peeso) Nº 2', category: 'Endodontia', itemType: 'instrumental', quantity: 1, minQuantity: 1, unit: 'unidade', unitCost: 35.00, supplier: 'Maillefer / Dentsply', notes: 'Broca Largo (Peeso) Nº 2 (0.90mm) para preparo e desobstrução de conduto radicular', requiresSterilization: true, isSterilized: true, ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-largo-3', itemCode: 'LRG-003', name: 'Broca Largo (Peeso) Nº 3', category: 'Endodontia', itemType: 'instrumental', quantity: 1, minQuantity: 1, unit: 'unidade', unitCost: 35.00, supplier: 'Maillefer / Dentsply', notes: 'Broca Largo (Peeso) Nº 3 (1.10mm) para preparo e desobstrução de conduto radicular', requiresSterilization: true, isSterilized: true, ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-largo-4', itemCode: 'LRG-004', name: 'Broca Largo (Peeso) Nº 4', category: 'Endodontia', itemType: 'instrumental', quantity: 1, minQuantity: 1, unit: 'unidade', unitCost: 35.00, supplier: 'Maillefer / Dentsply', notes: 'Broca Largo (Peeso) Nº 4 (1.30mm) para preparo e desobstrução de conduto radicular', requiresSterilization: true, isSterilized: true, ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-largo-5', itemCode: 'LRG-005', name: 'Broca Largo (Peeso) Nº 5', category: 'Endodontia', itemType: 'instrumental', quantity: 1, minQuantity: 1, unit: 'unidade', unitCost: 35.00, supplier: 'Maillefer / Dentsply', notes: 'Broca Largo (Peeso) Nº 5 (1.50mm) para preparo e desobstrução de conduto radicular', requiresSterilization: true, isSterilized: true, ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-largo-6', itemCode: 'LRG-006', name: 'Broca Largo (Peeso) Nº 6', category: 'Endodontia', itemType: 'instrumental', quantity: 1, minQuantity: 1, unit: 'unidade', unitCost: 35.00, supplier: 'Maillefer / Dentsply', notes: 'Broca Largo (Peeso) Nº 6 (1.70mm) para preparo e desobstrução de conduto radicular', requiresSterilization: true, isSterilized: true, ownerScope: 'compartilhado', lastUpdated: today },

  // Brocas Gates Glidden - N° 1 a N° 6 (1 item para cada)
  { id: 'inv-gates-1', itemCode: 'GTS-001', name: 'Broca Gates Glidden Nº 1', category: 'Endodontia', itemType: 'instrumental', quantity: 1, minQuantity: 1, unit: 'unidade', unitCost: 32.00, supplier: 'Maillefer / Dentsply', notes: 'Broca Gates Glidden Nº 1 (0.50mm) para preparo e alagamento do terço cervical', requiresSterilization: true, isSterilized: true, ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-gates-2', itemCode: 'GTS-002', name: 'Broca Gates Glidden Nº 2', category: 'Endodontia', itemType: 'instrumental', quantity: 1, minQuantity: 1, unit: 'unidade', unitCost: 32.00, supplier: 'Maillefer / Dentsply', notes: 'Broca Gates Glidden Nº 2 (0.70mm) para preparo e alagamento do terço cervical', requiresSterilization: true, isSterilized: true, ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-gates-3', itemCode: 'GTS-003', name: 'Broca Gates Glidden Nº 3', category: 'Endodontia', itemType: 'instrumental', quantity: 1, minQuantity: 1, unit: 'unidade', unitCost: 32.00, supplier: 'Maillefer / Dentsply', notes: 'Broca Gates Glidden Nº 3 (0.90mm) para preparo e alagamento do terço cervical', requiresSterilization: true, isSterilized: true, ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-gates-4', itemCode: 'GTS-004', name: 'Broca Gates Glidden Nº 4', category: 'Endodontia', itemType: 'instrumental', quantity: 1, minQuantity: 1, unit: 'unidade', unitCost: 32.00, supplier: 'Maillefer / Dentsply', notes: 'Broca Gates Glidden Nº 4 (1.10mm) para preparo e alagamento do terço cervical', requiresSterilization: true, isSterilized: true, ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-gates-5', itemCode: 'GTS-005', name: 'Broca Gates Glidden Nº 5', category: 'Endodontia', itemType: 'instrumental', quantity: 1, minQuantity: 1, unit: 'unidade', unitCost: 32.00, supplier: 'Maillefer / Dentsply', notes: 'Broca Gates Glidden Nº 5 (1.30mm) para preparo e alagamento do terço cervical', requiresSterilization: true, isSterilized: true, ownerScope: 'compartilhado', lastUpdated: today },
  { id: 'inv-gates-6', itemCode: 'GTS-006', name: 'Broca Gates Glidden Nº 6', category: 'Endodontia', itemType: 'instrumental', quantity: 1, minQuantity: 1, unit: 'unidade', unitCost: 32.00, supplier: 'Maillefer / Dentsply', notes: 'Broca Gates Glidden Nº 6 (1.50mm) para preparo e alagamento do terço cervical', requiresSterilization: true, isSterilized: true, ownerScope: 'compartilhado', lastUpdated: today }
];


export const INITIAL_FINANCIAL: FinancialTransaction[] = [
  {
    id: 'fin-1',
    type: 'receita',
    category: 'Atendimento',
    description: 'Restauração Resina (Dente 26) - Ana Silva Santos',
    amount: 320,
    date: today,
    patientId: 'pat-1',
    clinicId: 'cli-marv',
    clinicName: 'Clínica MARV',
    paymentMethod: 'pix',
    status: 'pago'
  },
  {
    id: 'fin-2',
    type: 'receita',
    category: 'Atendimento',
    description: 'Raspagem e Profilaxia - Carlos Eduardo Oliveira',
    amount: 250,
    date: today,
    patientId: 'pat-2',
    clinicId: 'cli-2',
    clinicName: 'DentisPro - Unidade Jardins',
    paymentMethod: 'cartao_credito',
    status: 'pago'
  },
  {
    id: 'fin-3',
    type: 'receita',
    category: 'Atendimento',
    description: 'Planejamento Cirúrgico & Tomografia - Roberto Albuquerque Prado',
    amount: 350,
    date: today,
    patientId: 'pat-5',
    clinicId: 'cli-marv',
    clinicName: 'Clínica MARV',
    paymentMethod: 'cartao_debito',
    status: 'pago'
  },
  {
    id: 'fin-4',
    type: 'receita',
    category: 'Atendimento',
    description: 'Manutenção Ortodôntica & Alinhadores - Beatriz Mendonça Rocha',
    amount: 320,
    date: today,
    patientId: 'pat-6',
    clinicId: 'cli-2',
    clinicName: 'DentisPro - Unidade Jardins',
    paymentMethod: 'pix',
    status: 'pago'
  },
  {
    id: 'fin-5',
    type: 'despesa',
    category: 'Material',
    description: 'Reposição de Resinas Z350 XT e Adesivo Universal - Dental Cremer',
    amount: 450,
    date: today,
    clinicId: 'cli-marv',
    clinicName: 'Clínica MARV',
    paymentMethod: 'boleto',
    status: 'pago'
  }
];

export const WHATSAPP_TEMPLATES: WhatsAppTemplate[] = [
  {
    id: 'tmpl-1',
    title: 'Confirmação de Consulta',
    message: 'Olá *{nome}*! Confirmamos sua consulta com {dentista} para o dia *{data}* às *{horario}* na clínica DentisPro.\n\nProcedimento: *{procedimento}*.\nPor favor, responda com SIM para confirmar ou avisar caso precise remarcar.'
  },
  {
    id: 'tmpl-2',
    title: 'Lembrete de Véspera (24h)',
    message: 'Olá *{nome}*! Passando para lembrar da sua consulta amanhã (*{data}*) às *{horario}* na clínica DentisPro.\n\nEndereço: Av. Paulista, 1500 - Conj. 304.\nEm caso de imprevisto, entre em contato com antecedência. Esperamos por você!'
  },
  {
    id: 'tmpl-3',
    title: 'Agradecimento & Cuidados Pós-Procedimento',
    message: 'Olá *{nome}*! Agradecemos sua visita à DentisPro hoje.\nLembre-se de seguir as orientações do dentista para sua recuperação rápida. Qualquer dúvida ou desconforto, estamos à disposição por aqui!'
  },
  {
    id: 'tmpl-4',
    title: 'Lembrete de Retorno Preventivo (6 meses)',
    message: 'Olá *{nome}*! Já faz 6 meses desde sua última limpeza e avaliação na DentisPro.\nA prevenção é o melhor caminho para manter seu sorriso saudável! Vamos agendar seu retorno?'
  }
];

export const INITIAL_PRESCRIPTIONS: Prescription[] = [
  {
    id: 'presc-1',
    patientId: 'pat-1',
    patientName: 'Ana Silva Santos',
    patientCpf: '123.456.789-00',
    date: today,
    dentistName: 'Dr. Hugo Andres Iglesias Ricoy',
    dentistCro: 'CRO/CE 5925',
    clinicName: 'Clínica MARV',
    type: 'simples',
    observations: 'Manter higienização cuidadosa na região posterior superior direita.',
    medications: [
      {
        name: 'Ibuprofeno 600mg',
        dosage: 'Comprimido',
        quantity: '1 caixa (10 comprimidos)',
        instructions: 'Tomar 1 comprimido a cada 8 horas por 3 dias em caso de dor ou sensibilidade mastigatória.',
        interval: '8/8h',
        duration: '3 dias'
      },
      {
        name: 'Clorexidina 0,12%',
        dosage: 'Solução Bucal',
        quantity: '1 frasco (250ml)',
        instructions: 'Bochechar 15ml puro durante 1 minuto, 2 vezes ao dia, 30 min após escovação por 5 dias.',
        interval: '12/12h',
        duration: '5 dias'
      }
    ]
  },
  {
    id: 'presc-2',
    patientId: 'pat-7',
    patientName: 'Fernando Henrique Silveira',
    patientCpf: '789.012.345-66',
    date: today,
    dentistName: 'Dr. Roberto Fonseca',
    dentistCro: 'CRO/SP 789012',
    clinicName: 'DentisPro - Unidade Vila Mariana / Sul',
    type: 'simples',
    observations: 'ATENÇÃO: Paciente com alergia grave a DIPIRONA e SULFAS. Prescrição adaptada.',
    medications: [
      {
        name: 'Amoxicilina 500mg',
        dosage: 'Cápsula',
        quantity: '1 caixa (21 cápsulas)',
        instructions: 'Tomar 1 cápsula de 8 em 8 horas rigorosamente por 7 dias.',
        interval: '8/8h',
        duration: '7 dias'
      },
      {
        name: 'Ibuprofeno 600mg',
        dosage: 'Comprimido',
        quantity: '1 caixa (10 comprimidos)',
        instructions: 'Tomar 1 comprimido de 8 em 8 horas durante 3 dias após as refeições.',
        interval: '8/8h',
        duration: '3 dias'
      }
    ]
  },
  {
    id: 'presc-3',
    patientId: 'pat-8',
    patientName: 'Juliana Martins Pereira',
    patientCpf: '890.123.456-77',
    date: today,
    dentistName: 'Dr. Roberto Fonseca',
    dentistCro: 'CRO/SP 789012',
    clinicName: 'DentisPro - Unidade Tatuapé / Zona Leste',
    type: 'simples',
    observations: 'Protocolo cirúrgico pré e pós-operatório para extração de terceiros molares inclusos.',
    medications: [
      {
        name: 'Dexametasona 4mg',
        dosage: 'Comprimido',
        quantity: '1 caixa (10 comprimidos)',
        instructions: 'Tomar 1 comprimido (4mg) 1 hora antes do procedimento cirúrgico.',
        interval: 'Dose única prévia',
        duration: '1 dia'
      },
      {
        name: 'Nimesulida 100mg',
        dosage: 'Comprimido',
        quantity: '1 caixa (12 comprimidos)',
        instructions: 'Tomar 1 comprimido de 12 em 12 horas por 3 dias.',
        interval: '12/12h',
        duration: '3 dias'
      },
      {
        name: 'Paracetamol 750mg',
        dosage: 'Comprimido',
        quantity: '1 caixa (20 comprimidos)',
        instructions: 'Tomar 1 comprimido a cada 6 horas somente se houver dor moderada.',
        interval: '6/6h se dor',
        duration: '3 dias'
      },
      {
        name: 'Clorexidina 0,12%',
        dosage: 'Solução Bucal',
        quantity: '1 frasco (250mL)',
        instructions: 'Bochechos suaves por 1 minuto a cada 12 horas a partir de 24h após a cirurgia por 5 dias.',
        interval: '12/12h',
        duration: '5 dias'
      }
    ]
  }
];

export const DEFAULT_MEDICATION_CATALOG = [
  {
    name: 'Amoxicilina 500mg',
    dosage: 'Cápsula',
    defaultQty: '1 caixa (21 cápsulas)',
    defaultInstructions: 'Tomar 1 cápsula de 8 em 8 horas por 7 dias contínuos.'
  },
  {
    name: 'Amoxicilina + Clavulanato de Potássio 875mg + 125mg',
    dosage: 'Comprimido Revestido',
    defaultQty: '1 caixa (14 comprimidos)',
    defaultInstructions: 'Tomar 1 comprimido de 12 em 12 horas por 7 dias.'
  },
  {
    name: 'Ibuprofeno 600mg',
    dosage: 'Comprimido',
    defaultQty: '1 caixa (10 comprimidos)',
    defaultInstructions: 'Tomar 1 comprimido de 8 em 8 horas por 3 dias se houver dor ou inchaço.'
  },
  {
    name: 'Nimesulida 100mg',
    dosage: 'Comprimido',
    defaultQty: '1 caixa (12 comprimidos)',
    defaultInstructions: 'Tomar 1 comprimido de 12 em 12 horas após as refeições por 3 a 5 dias.'
  },
  {
    name: 'Dexametasona 4mg',
    dosage: 'Comprimido',
    defaultQty: '1 caixa (10 comprimidos)',
    defaultInstructions: 'Tomar 1 comprimido 1 hora antes do procedimento cirúrgico, ou conforme orientação.'
  },
  {
    name: 'Paracetamol 750mg',
    dosage: 'Comprimido',
    defaultQty: '1 caixa (20 comprimidos)',
    defaultInstructions: 'Tomar 1 comprimido de 6 em 6 horas em caso de dor ou febre.'
  },
  {
    name: 'Clorexidina 0,12% (PerioGard / Periogard sem álcool)',
    dosage: 'Solução Bucal',
    defaultQty: '1 frasco (250mL)',
    defaultInstructions: 'Bochechar 15mL puro durante 1 minuto, de 12 em 12 horas, após a escovação por 7 dias.'
  },
  {
    name: 'Azitromicina 500mg',
    dosage: 'Comprimido Revestido',
    defaultQty: '1 caixa (3 comprimidos)',
    defaultInstructions: 'Tomar 1 comprimido por dia, no mesmo horário, por 3 dias (Para alérgicos à Penicilina).'
  }
];

export const INITIAL_ODONTOGRAM_DATA: Record<string, ToothCondition[]> = {
  'pat-1': [
    { toothNumber: 16, surfaces: { oclusal: 'restauracao' } },
    { toothNumber: 26, surfaces: { oclusal: 'carie', mesial: 'carie' }, wholeToothCondition: 'carie' },
    { toothNumber: 36, wholeToothCondition: 'endodontia_satisfatoria' },
    { toothNumber: 46, surfaces: { oclusal: 'restauracao_insatisfatoria' } }
  ],
  'pat-2': [
    { toothNumber: 11, wholeToothCondition: 'sio' },
    { toothNumber: 31, surfaces: { lingual: 'calculo_supragengival' }, wholeToothCondition: 'calculo_supragengival' },
    { toothNumber: 41, surfaces: { lingual: 'calculo_supragengival' }, wholeToothCondition: 'calculo_supragengival' },
    { toothNumber: 46, surfaces: { oclusal: 'restauracao' } },
    { toothNumber: 47, surfaces: { oclusal: 'carie' }, wholeToothCondition: 'carie' }
  ],
  'pat-3': [
    { toothNumber: 14, surfaces: { oclusal: 'restauracao' } },
    { toothNumber: 24, surfaces: { oclusal: 'restauracao' } },
    { toothNumber: 36, surfaces: { oclusal: 'restauracao' } },
    { toothNumber: 11, wholeToothCondition: 'sio' },
    { toothNumber: 21, wholeToothCondition: 'sio' }
  ],
  'pat-4': [
    { toothNumber: 54, surfaces: { oclusal: 'carie' }, wholeToothCondition: 'carie' },
    { toothNumber: 55, surfaces: { oclusal: 'restauracao' } },
    { toothNumber: 65, surfaces: { oclusal: 'restauracao' } },
    { toothNumber: 75, surfaces: { oclusal: 'restauracao' } },
    { toothNumber: 85, surfaces: { oclusal: 'carie' }, wholeToothCondition: 'carie' }
  ],
  'pat-5': [
    { toothNumber: 14, wholeToothCondition: 'ausente' },
    { toothNumber: 15, wholeToothCondition: 'ausente' },
    { toothNumber: 24, wholeToothCondition: 'protese' },
    { toothNumber: 25, wholeToothCondition: 'protese' },
    { toothNumber: 26, wholeToothCondition: 'protese' },
    { toothNumber: 36, wholeToothCondition: 'implante' },
    { toothNumber: 46, wholeToothCondition: 'protese' }
  ],
  'pat-6': [
    { toothNumber: 11, surfaces: { vestibular: 'restauracao' } },
    { toothNumber: 21, surfaces: { vestibular: 'restauracao' } },
    { toothNumber: 31, wholeToothCondition: 'girovertido' },
    { toothNumber: 32, wholeToothCondition: 'girovertido' },
    { toothNumber: 41, wholeToothCondition: 'girovertido' },
    { toothNumber: 42, wholeToothCondition: 'girovertido' },
    { toothNumber: 36, surfaces: { oclusal: 'restauracao' } },
    { toothNumber: 46, surfaces: { oclusal: 'restauracao' } }
  ],
  'pat-7': [
    { toothNumber: 46, surfaces: { oclusal: 'carie', distal: 'carie' }, wholeToothCondition: 'endodontia_insatisfatoria' },
    { toothNumber: 37, surfaces: { oclusal: 'restauracao' } },
    { toothNumber: 16, surfaces: { oclusal: 'restauracao', mesial: 'restauracao' } },
    { toothNumber: 26, surfaces: { oclusal: 'restauracao' } }
  ],
  'pat-8': [
    { toothNumber: 18, wholeToothCondition: 'extracao_indicada' },
    { toothNumber: 28, wholeToothCondition: 'extracao_indicada' },
    { toothNumber: 38, wholeToothCondition: 'extracao_indicada' },
    { toothNumber: 48, wholeToothCondition: 'extracao_indicada' },
    { toothNumber: 37, surfaces: { oclusal: 'restauracao' } },
    { toothNumber: 47, surfaces: { oclusal: 'restauracao' } }
  ]
};

export const INITIAL_ODONTOGRAM_SNAPSHOTS: Record<string, OdontogramSnapshot[]> = {};

export const INITIAL_CLINICAL_EVOLUTION: ClinicalEvolutionEntry[] = [
  {
    id: 'evo-1',
    patientId: 'pat-1',
    date: today,
    dentistName: 'Dr. Hugo Andres Iglesias Ricoy',
    clinicName: 'Clínica MARV',
    toothNumber: 26,
    procedure: 'Restauração Classe II em Resina Composta (OD)',
    description: 'Anestesia infiltrativa com Articaína 4% 1:100.000. Isolamento absoluto com grampo 26. Remoção de tecido cariado com broca esférica em baixa rotação. Condicionamento ácido seletivo em esmalte por 30s. Sistema adesivo universal fotopolimerizado por 20s. Restauração incremental com Resina Composta Z350 XT cor A2. Ajuste oclusal em máxima intercuspidação e desoclusão lateral. Acabamento e polimento com discos abrasivos.',
    cost: 320,
    status: 'concluido'
  },
  {
    id: 'evo-2',
    patientId: 'pat-1',
    date: '2026-08-15',
    dentistName: 'Dr. Hugo Andres Iglesias Ricoy',
    clinicName: 'Clínica MARV',
    toothNumber: 16,
    procedure: 'Profilaxia e Aplicação Tópica de Flúor',
    description: 'Remoção de biofilme e cálculo supragengival com ultrassom e ponta universal. Jato de bicarbonato de sódio para polimento coronário. Aplicação tópica de flúor gel neutro 2%. Orientações de higiene bucal e uso correto do fio dental.',
    cost: 180,
    status: 'concluido'
  },
  {
    id: 'evo-3',
    patientId: 'pat-2',
    date: today,
    dentistName: 'Dra. Camila Alves',
    clinicName: 'DentisPro - Unidade Jardins',
    toothNumber: 46,
    procedure: 'Raspagem e Alisamento Radicular por Sextante',
    description: 'Sessão inicial de instrumentação periodontal nos sextantes inferiores. Anestesia infiltrativa tópica. Remoção de cálculo subgengival com curetas Gracey 11/12 e 13/14. Irrigação com soro fisiológico e aplicação de clorexidina tópica.',
    cost: 250,
    status: 'concluido'
  },
  {
    id: 'evo-4',
    patientId: 'pat-3',
    date: today,
    dentistName: 'Dr. Roberto Fonseca',
    clinicName: 'DentisPro - Unidade Vila Mariana / Sul',
    toothNumber: 11,
    procedure: 'Profilaxia Suave e Moldagem para Clareamento Supervisionado',
    description: 'Profilaxia suave com pasta profilática sem agentes abrasivos fortes (paciente gestante no 2º trimestre). Tomada de cor inicial escala VITA (A3). Moldagem das arcadas superior e inferior com silicone de condensação para confecção de moldeiras individuais.',
    cost: 650,
    status: 'concluido'
  },
  {
    id: 'evo-5',
    patientId: 'pat-4',
    date: today,
    dentistName: 'Dra. Juliana Costa',
    clinicName: 'DentisPro - Unidade Centro / Paulista',
    toothNumber: 65,
    procedure: 'Profilaxia Infantil e Aplicação de Selante Fotopolimerizável',
    description: 'Condicionamento comportamental lúdico (Diga-Mostre-Faça). Remoção de placa bacteriana com taça de borracha e pasta Tutti-Frutti. Isolamento relativo com roletes de algodão. Condicionamento ácido por 15s na oclusal do 65 e 75. Aplicação de selante resinoso fotopolimerizado por 20s.',
    cost: 180,
    status: 'concluido'
  },
  {
    id: 'evo-6',
    patientId: 'pat-5',
    date: today,
    dentistName: 'Dr. Hugo Andres Iglesias Ricoy',
    clinicName: 'Clínica MARV',
    toothNumber: 14,
    procedure: 'Avaliação Tomográfica & Planejamento Virtual de Implantes (14 e 15)',
    description: 'Análise detalhada de CBCT (Tomografia Computadorizada de Feixe Cônico) da maxila superior direita. Altura óssea remanescente de 11.2mm no dente 14 e 9.8mm no dente 15 (assoalho do seio maxilar íntegro). Planejamento de implantes cone morse 3.75 x 10mm. Coagulograma dentro dos padrões aceitáveis.',
    cost: 350,
    status: 'concluido'
  },
  {
    id: 'evo-7',
    patientId: 'pat-6',
    date: today,
    dentistName: 'Dra. Camila Alves',
    clinicName: 'DentisPro - Unidade Jardins',
    toothNumber: 31,
    procedure: 'Instalação de Attachments e Entrega dos Alinhadores 01 a 03',
    description: 'Condicionamento ácido do esmalte vestibular dos dentes 14, 13, 23, 34 e 44 com template guia. Aplicação de resina composta fluida para confecção dos attachments estéticos. Checagem de retenção dos alinhadores ortodônticos. Entrega das 3 primeiras fases e chewies de assentamento.',
    cost: 320,
    status: 'concluido'
  },
  {
    id: 'evo-8',
    patientId: 'pat-7',
    date: today,
    dentistName: 'Dr. Roberto Fonseca',
    clinicName: 'DentisPro - Unidade Vila Mariana / Sul',
    toothNumber: 46,
    procedure: 'Urgência Endodôntica: Abertura e Instrumentação Rotatória Dente 46',
    description: 'Anestesia por bloqueio do nervo alveolar inferior direito com Mepivacaína 2% 1:100.000. Isolamento absoluto com grampo 205. Abertura coronária e remoção de polpa coronária inflamada. Odontometria eletrônica foraminal dos canais MV (21mm), ML (21mm), DV (20mm) e DL (20.5mm). Instrumentação até lima #25.04. Curativo com hidróxido de cálcio.',
    cost: 680,
    status: 'concluido'
  },
  {
    id: 'evo-9',
    patientId: 'pat-8',
    date: today,
    dentistName: 'Dr. Roberto Fonseca',
    clinicName: 'DentisPro - Unidade Tatuapé / Zona Leste',
    toothNumber: 38,
    procedure: 'Exodontia Cirúrgica dos Terceiros Molares Inclusos (38 e 48)',
    description: 'Anestesia troncular do nervo alveolar inferior e lingual bilateral. Incisão intrasulcular com alívio relaxante na linha oblíqua externa. Descolamento mucoperiosteal total. Osteotomia vestibular com broca 702 sob irrigação abundante com soro fisiológico 0,9%. Odontossecção da coroa e raízes. Curetagem e sutura oclusal com fio seda 3-0.',
    cost: 900,
    status: 'concluido'
  }
];

export const DEFAULT_PRICE_TABLES: PriceTable[] = [
  { id: 'particular', name: 'Particular', description: 'Tabela Padrão Atendimento Particular', isDefault: true },
  { id: 'amil-dental', name: 'Amil Dental', description: 'Tabela Praticada Convênio Amil Dental' },
  { id: 'bradesco-dental', name: 'Bradesco Dental', description: 'Tabela Praticada Bradesco Saúde Dental' },
  { id: 'odontoprev', name: 'OdontoPrev', description: 'Tabela Praticada Rede OdontoPrev Nacional' },
  { id: 'sulamerica-odonto', name: 'SulAmérica Odonto', description: 'Tabela Praticada SulAmérica Odontológico' },
  { id: 'unimed-odonto', name: 'Unimed Odonto', description: 'Tabela Praticada Sistema Unimed Odonto' },
  { id: 'porto-seguro-odonto', name: 'Porto Seguro Odontológico', description: 'Tabela Praticada Porto Seguro Saúde & Odonto' },
  { id: 'metlife-dental', name: 'MetLife Dental', description: 'Tabela Praticada MetLife Dental Care' },
  { id: 'interodonto', name: 'Interodonto (NotreDame Intermédica)', description: 'Tabela GNDI / Interodonto' },
  { id: 'hapvida-odonto', name: 'Hapvida Odonto', description: 'Tabela Praticada Rede Hapvida / Notredame' },
  { id: 'dental-uni', name: 'Dental Uni', description: 'Tabela Praticada Cooperativa Odontológica Dental Uni' },
  { id: 'inpao-dental', name: 'INPAO Dental', description: 'Tabela Praticada INPAO Dental' },
  { id: 'primavida', name: 'PrimaVida Dental', description: 'Tabela Praticada PrimaVida Odontologia de Grupo' },
  { id: 'care-plus', name: 'Care Plus Dental', description: 'Tabela Praticada Care Plus Dental Max' },
  { id: 'bb-dental', name: 'BB Dental (Brasildental)', description: 'Tabela Praticada BB Dental / Banco do Brasil' },
  { id: 'caixa-seguradora-odonto', name: 'Caixa Seguradora Odonto', description: 'Tabela Praticada Caixa Seguros Odontológico' },
  { id: 'golden-cross-odonto', name: 'Golden Cross Odonto', description: 'Tabela Praticada Golden Cross Odontologia' },
  { id: 'prodent', name: 'Prodent', description: 'Tabela Praticada Prodent Assistência Odontológica' },
  { id: 'allianz-odonto', name: 'Allianz Odonto', description: 'Tabela Praticada Allianz Saúde Dental' },
  { id: 'sao-cristovao-dental', name: 'São Cristóvão Dental', description: 'Tabela Praticada Grupo São Cristóvão Saúde' },
  { id: 'convenio1', name: 'Convênio 1 (Bradesco / Amil)', description: 'Tabela Praticada para Convênio Nível 1' },
  { id: 'convenio2', name: 'Convênio 2 (Unimed / SulAmérica)', description: 'Tabela Praticada para Convênio Nível 2' },
];

export const INITIAL_TUSS_PROCEDURES: TUSSProcedure[] = OFFICIAL_ANS_TUSS_PROCEDURES;

export const INITIAL_TREATMENT_PLANS: TreatmentPlan[] = [
  {
    id: 'plan-pat1',
    patientId: 'pat-1',
    patientName: 'Ana Silva Santos',
    title: 'Plano Restaurador Integral & Manutenção Periodontal',
    date: today,
    dentistName: 'Dr. Hugo Andres Iglesias Ricoy',
    clinicId: 'cli-marv',
    clinicName: 'Clínica MARV',
    status: 'aprovado',
    items: [
      {
        id: 'item-1',
        tussCode: '85100049',
        procedureName: 'Restauração Resina Fotopolimerizável 2 Faces',
        specialty: 'Dentística Restauradora',
        toothNumber: 26,
        toothSurface: 'M/O',
        regionCode: 'Dente 26',
        cost: 320,
        finalCost: 320,
        status: 'concluido',
        selectedForPlan: true,
        notes: 'Prevenção de infiltração bacteriana e risco endodôntico.'
      },
      {
        id: 'item-2',
        tussCode: '85100197',
        procedureName: 'Profilaxia e Raspagem Supragengival',
        specialty: 'Periodontia',
        regionCode: 'ASAI',
        cost: 220,
        finalCost: 200,
        status: 'concluido',
        selectedForPlan: true,
        notes: 'Remoção de tártaro e biofilme bacteriano.'
      },
      {
        id: 'item-3',
        tussCode: '85100049',
        procedureName: 'Substituição de Restauração Insatisfatória',
        specialty: 'Dentística Restauradora',
        toothNumber: 46,
        toothSurface: 'O/D',
        regionCode: 'Dente 46',
        cost: 300,
        finalCost: 300,
        status: 'pendente',
        selectedForPlan: true,
        notes: 'Recidiva de cárie sob margem ocluso-distal.'
      }
    ],
    totalValue: 840,
    discountValue: 20,
    finalValue: 820,
    consentAccepted: true,
    consentAcceptedAt: today
  },
  {
    id: 'plan-pat2',
    patientId: 'pat-2',
    patientName: 'Carlos Eduardo Oliveira',
    title: 'Tratamento Periodontal & Controle de Biofilme',
    date: today,
    dentistName: 'Dra. Camila Alves',
    clinicId: 'cli-2',
    clinicName: 'DentisPro - Unidade Jardins',
    status: 'aprovado',
    items: [
      {
        id: 'item-p2-1',
        tussCode: '85100200',
        procedureName: 'Raspagem e Alisamento Subgengival por Sextante',
        specialty: 'Periodontia',
        toothNumber: 46,
        regionCode: 'S4',
        regionDescription: 'Sextante 4 (Inferior Posterior Direito)',
        cost: 250,
        finalCost: 250,
        status: 'concluido',
        selectedForPlan: true,
        notes: 'Sessão 1 nos sextantes inferiores.'
      },
      {
        id: 'item-p2-2',
        tussCode: '85100197',
        procedureName: 'Profilaxia e Polimento Coronário a Jato de Bicarbonato',
        specialty: 'Periodontia',
        regionCode: 'ASAI',
        cost: 180,
        finalCost: 180,
        status: 'pendente',
        selectedForPlan: true
      }
    ],
    totalValue: 430,
    discountValue: 0,
    finalValue: 430,
    consentAccepted: true,
    consentAcceptedAt: today
  },
  {
    id: 'plan-pat3',
    patientId: 'pat-3',
    patientName: 'Mariana Costa Lima',
    title: 'Clareamento Dental Supervisionado & Profilaxia',
    date: today,
    dentistName: 'Dr. Roberto Fonseca',
    clinicId: 'cli-3',
    clinicName: 'DentisPro - Unidade Vila Mariana / Sul',
    status: 'aprovado',
    items: [
      {
        id: 'item-p3-1',
        procedureName: 'Clareamento Dentário Caseiro Supervisionado com Moldeiras',
        specialty: 'Dentística Restauradora',
        cost: 650,
        finalCost: 600,
        status: 'concluido',
        selectedForPlan: true,
        notes: 'Gel Peróxido de Carbamida 10% suave.'
      }
    ],
    totalValue: 650,
    discountValue: 50,
    finalValue: 600,
    consentAccepted: true,
    consentAcceptedAt: today
  },
  {
    id: 'plan-pat4',
    patientId: 'pat-4',
    patientName: 'Lucas Ferreira Gabriel (Infantil)',
    title: 'Prevenção Odontopediátrica e Selamento de Fissuras',
    date: today,
    dentistName: 'Dra. Juliana Costa',
    clinicId: 'cli-1',
    clinicName: 'DentisPro - Unidade Centro / Paulista',
    status: 'aprovado',
    items: [
      {
        id: 'item-p4-1',
        procedureName: 'Aplicação Tópica de Flúor e Selante Fotopolimerizável',
        specialty: 'Odontopediatria',
        toothNumber: 65,
        cost: 180,
        finalCost: 180,
        status: 'concluido',
        selectedForPlan: true
      }
    ],
    totalValue: 180,
    discountValue: 0,
    finalValue: 180,
    consentAccepted: true,
    consentAcceptedAt: today
  },
  {
    id: 'plan-pat5',
    patientId: 'pat-5',
    patientName: 'Roberto Albuquerque Prado',
    title: 'Reabilitação com Implantes Osseointegrados Dentes 14 e 15',
    date: today,
    dentistName: 'Dr. Hugo Andres Iglesias Ricoy',
    clinicId: 'cli-marv',
    clinicName: 'Clínica MARV',
    status: 'aprovado',
    items: [
      {
        id: 'item-p5-1',
        procedureName: 'Instalação Cirúrgica de Implante Dentário Osteointegrável (Dente 14)',
        specialty: 'Implantodontia',
        toothNumber: 14,
        cost: 1800,
        finalCost: 1650,
        status: 'pendente',
        selectedForPlan: true,
        notes: 'Implante Cone Morse Titânio Grau 4.'
      },
      {
        id: 'item-p5-2',
        procedureName: 'Instalação Cirúrgica de Implante Dentário Osteointegrável (Dente 15)',
        specialty: 'Implantodontia',
        toothNumber: 15,
        cost: 1800,
        finalCost: 1650,
        status: 'pendente',
        selectedForPlan: true
      },
      {
        id: 'item-p5-3',
        procedureName: 'Tomografia Cone Beam & Guia Cirúrgico Prototipado',
        specialty: 'Radiologia Odontológica',
        cost: 500,
        finalCost: 450,
        status: 'concluido',
        selectedForPlan: true
      }
    ],
    totalValue: 4100,
    discountValue: 350,
    finalValue: 3750,
    consentAccepted: true,
    consentAcceptedAt: today
  },
  {
    id: 'plan-pat6',
    patientId: 'pat-6',
    patientName: 'Beatriz Mendonça Rocha',
    title: 'Tratamento Ortodôntico Estético com Alinhadores Invisíveis',
    date: today,
    dentistName: 'Dra. Camila Alves',
    clinicId: 'cli-2',
    clinicName: 'DentisPro - Unidade Jardins',
    status: 'aprovado',
    items: [
      {
        id: 'item-p6-1',
        procedureName: 'Tratamento com Alinhadores Ortodônticos Invisíveis (Fase Completa)',
        specialty: 'Ortodontia',
        cost: 6500,
        finalCost: 6000,
        status: 'pendente',
        selectedForPlan: true,
        notes: 'Kit de 18 pares de alinhadores com trocas quinzenais.'
      },
      {
        id: 'item-p6-2',
        procedureName: 'Manutenção e Instalação de Attachments',
        specialty: 'Ortodontia',
        cost: 320,
        finalCost: 320,
        status: 'concluido',
        selectedForPlan: true
      }
    ],
    totalValue: 6820,
    discountValue: 500,
    finalValue: 6320,
    consentAccepted: true,
    consentAcceptedAt: today
  },
  {
    id: 'plan-pat7',
    patientId: 'pat-7',
    patientName: 'Fernando Henrique Silveira',
    title: 'Tratamento de Canal Molar (46), Pino de Fibra e Coroa em Zircônia',
    date: today,
    dentistName: 'Dr. Roberto Fonseca',
    clinicId: 'cli-3',
    clinicName: 'DentisPro - Unidade Vila Mariana / Sul',
    status: 'aprovado',
    items: [
      {
        id: 'item-p7-1',
        procedureName: 'Tratamento Endodôntico de Dente com Mais de Três Condutos (Dente 46)',
        specialty: 'Endodontia',
        toothNumber: 46,
        cost: 950,
        finalCost: 900,
        status: 'concluido',
        selectedForPlan: true
      },
      {
        id: 'item-p7-2',
        procedureName: 'Núcleo / Pino de Fibra de Vidro Cimentado',
        specialty: 'Prótese Dentária',
        toothNumber: 46,
        cost: 450,
        finalCost: 400,
        status: 'pendente',
        selectedForPlan: true
      },
      {
        id: 'item-p7-3',
        procedureName: 'Coroa Total em Zircônia Pura Translúcida',
        specialty: 'Prótese Dentária',
        toothNumber: 46,
        cost: 1600,
        finalCost: 1500,
        status: 'pendente',
        selectedForPlan: true
      }
    ],
    totalValue: 3000,
    discountValue: 200,
    finalValue: 2800,
    consentAccepted: true,
    consentAcceptedAt: today
  },
  {
    id: 'plan-pat8',
    patientId: 'pat-8',
    patientName: 'Juliana Martins Pereira',
    title: 'Exodontia Cirúrgica Múltipla de Terceiros Molares Inclusos (Sisos)',
    date: today,
    dentistName: 'Dr. Roberto Fonseca',
    clinicId: 'cli-4',
    clinicName: 'DentisPro - Unidade Tatuapé / Zona Leste',
    status: 'aprovado',
    items: [
      {
        id: 'item-p8-1',
        procedureName: 'Exodontia de Dente Incluso / Impactado (Dente 38)',
        specialty: 'Cirurgia e Traumatologia Bucomaxilofacial',
        toothNumber: 38,
        cost: 500,
        finalCost: 450,
        status: 'concluido',
        selectedForPlan: true
      },
      {
        id: 'item-p8-2',
        procedureName: 'Exodontia de Dente Incluso / Impactado (Dente 48)',
        specialty: 'Cirurgia e Traumatologia Bucomaxilofacial',
        toothNumber: 48,
        cost: 500,
        finalCost: 450,
        status: 'concluido',
        selectedForPlan: true
      }
    ],
    totalValue: 1000,
    discountValue: 100,
    finalValue: 900,
    consentAccepted: true,
    consentAcceptedAt: today
  }
];

export const INITIAL_PATIENT_PAYMENTS: PatientPayment[] = [
  {
    id: 'pay-1',
    patientId: 'pat-1',
    patientName: 'Ana Silva Santos',
    date: today,
    amount: 320,
    paymentMethod: 'pix',
    description: 'Pagamento Parcial Plano Restaurador (Dente 26)',
    treatmentPlanId: 'plan-pat1',
    treatmentPlanTitle: 'Plano Restaurador Integral & Manutenção Periodontal',
    receiptNumber: 'REC-2026-001',
    clinicId: 'cli-marv',
    clinicName: 'Clínica MARV'
  },
  {
    id: 'pay-2',
    patientId: 'pat-2',
    patientName: 'Carlos Eduardo Oliveira',
    date: today,
    amount: 250,
    paymentMethod: 'cartao_credito',
    description: 'Sessão Periodontal Inicial (Dente 46)',
    treatmentPlanId: 'plan-pat2',
    treatmentPlanTitle: 'Tratamento Periodontal & Controle de Biofilme',
    receiptNumber: 'REC-2026-002',
    clinicId: 'cli-2',
    clinicName: 'DentisPro - Unidade Jardins'
  },
  {
    id: 'pay-3',
    patientId: 'pat-5',
    patientName: 'Roberto Albuquerque Prado',
    date: today,
    amount: 350,
    paymentMethod: 'cartao_debito',
    description: 'Tomografia e Guia de Planejamento de Implantes',
    treatmentPlanId: 'plan-pat5',
    treatmentPlanTitle: 'Reabilitação com Implantes Osseointegrados Dentes 14 e 15',
    receiptNumber: 'REC-2026-003',
    clinicId: 'cli-marv',
    clinicName: 'Clínica MARV'
  },
  {
    id: 'pay-4',
    patientId: 'pat-6',
    patientName: 'Beatriz Mendonça Rocha',
    date: today,
    amount: 320,
    paymentMethod: 'pix',
    description: 'Instalação de Attachments e Entrega Alinhadores',
    treatmentPlanId: 'plan-pat6',
    treatmentPlanTitle: 'Tratamento Ortodôntico Estético com Alinhadores Invisíveis',
    receiptNumber: 'REC-2026-004',
    clinicId: 'cli-2',
    clinicName: 'DentisPro - Unidade Jardins'
  }
];

export const INITIAL_COMMISSIONS: DentistCommissionRecord[] = [];

export const INITIAL_INSURANCE_GUIDES: InsuranceGuide[] = [];

export const INITIAL_SAVED_DOCUMENTS: SavedClinicDocument[] = [];



