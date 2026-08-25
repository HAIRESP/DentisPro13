import { Patient, Appointment, InventoryItem, FinancialTransaction, Prescription, WhatsAppTemplate, ToothCondition, OdontogramSnapshot, ClinicalEvolutionEntry, ClinicUnit, Professional, TUSSProcedure, TreatmentPlan, PatientPayment, PriceTable, DentistCommissionRecord, InsuranceGuide, SavedClinicDocument } from '../types';

export const INITIAL_CLINICS: ClinicUnit[] = [
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
    id: 'cli-3',
    name: 'DentisPro - Unidade Vila Mariana / Sul',
    address: 'Rua Vergueiro, 2200 - Conjunto 81 - Vila Mariana',
    phone: '(11) 5084-1100',
    city: 'São Paulo - SP'
  },
  {
    id: 'cli-4',
    name: 'DentisPro - Unidade Tatuapé / Zona Leste',
    address: 'Rua Tuiuti, 1800 - Sala 405 - Tatuapé',
    phone: '(11) 2091-7700',
    city: 'São Paulo - SP'
  }
];

export const INITIAL_PROFESSIONALS: Professional[] = [
  {
    id: 'prof-hugo',
    name: 'Dr. Hugo Andres Iglesias Ricoy',
    cro: 'CRO/CE 5925',
    cpf: '879.750.253-72',
    specialty: 'Implantodontia, Prótese & Clínica Geral',
    clinicIds: ['cli-marv', 'cli-1', 'cli-2', 'cli-3', 'cli-4']
  },
  {
    id: 'prof-1',
    name: 'Dr. Lucas Mendes',
    cro: 'CRO/SP 123456',
    specialty: 'Implantodontia & Prótese',
    clinicIds: ['cli-1', 'cli-2', 'cli-3']
  },
  {
    id: 'prof-2',
    name: 'Dra. Camila Alves',
    cro: 'CRO/SP 654321',
    specialty: 'Ortodontia & Estética Dental',
    clinicIds: ['cli-1', 'cli-2', 'cli-4']
  },
  {
    id: 'prof-3',
    name: 'Dr. Roberto Fonseca',
    cro: 'CRO/SP 789012',
    specialty: 'Endodontia & Cirurgia Bucomaxilofacial',
    clinicIds: ['cli-2', 'cli-3', 'cli-4']
  },
  {
    id: 'prof-4',
    name: 'Dra. Juliana Costa',
    cro: 'CRO/SP 345678',
    specialty: 'Odontopediatria & Pacientes com Necessidades Especiais',
    clinicIds: ['cli-1', 'cli-3']
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


export const INITIAL_FINANCIAL: FinancialTransaction[] = [];

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

export const INITIAL_PRESCRIPTIONS: Prescription[] = [];

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

export const INITIAL_ODONTOGRAM_DATA: Record<string, ToothCondition[]> = {};

export const INITIAL_ODONTOGRAM_SNAPSHOTS: Record<string, OdontogramSnapshot[]> = {};

export const INITIAL_CLINICAL_EVOLUTION: ClinicalEvolutionEntry[] = [];

export const DEFAULT_PRICE_TABLES: PriceTable[] = [
  { id: 'particular', name: 'Particular', description: 'Tabela Padrão Atendimento Particular', isDefault: true },
  { id: 'convenio1', name: 'Convênio 1 (Bradesco / Amil)', description: 'Tabela Praticada para Convênio Nível 1' },
  { id: 'convenio2', name: 'Convênio 2 (Unimed / SulAmérica)', description: 'Tabela Praticada para Convênio Nível 2' },
];

export const INITIAL_TUSS_PROCEDURES: TUSSProcedure[] = [
  // Dentística & Estética
  {
    code: '81000030',
    description: 'Restauração de 1 Face em Resina Composta',
    faces: 'O',
    specialty: 'Dentística & Estética',
    suggestedCost: 220,
    prices: { particular: 220, convenio1: 170, convenio2: 150 },
    defaultRegion: 'Dente Específico',
    fullDescription: 'Procedimento cirúrgico-restaurador indicado para remoção de tecido cariado ou substituição de restauração com fratura em uma superfície dentária (oclusal, vestibular, lingual/palatina, mesial ou distal). Inclui anestesia local, isolamento do campo operatório, preparo cavitário, condicionamento ácido fotopolimerizável, sistema adesivo de última geração, inserção estratificada de resina composta nanoparticulada, ajuste oclusal milimétrico e polimento de alto brilho.',
    requiredMaterials: [
      { id: 'req-r1-1', materialName: 'Anestésico Lidocaína 2% com Epinefrina', quantityNeeded: 1, unit: 'tubete' },
      { id: 'req-r1-2', materialName: 'Agulha Gengival Descartável', quantityNeeded: 1, unit: 'unidade' },
      { id: 'req-r1-3', materialName: 'Resina Composta Nanoparticulada (A2/A3)', quantityNeeded: 1, unit: 'seringa (0.5g)' },
      { id: 'req-r1-4', materialName: 'Ácido Fosfórico 37%', quantityNeeded: 1, unit: 'aplicação' },
      { id: 'req-r1-5', materialName: 'Adesivo Dental Fotopolimerizável Single Bond', quantityNeeded: 1, unit: 'gota' },
      { id: 'req-r1-6', materialName: 'Sugador Odontológico Descartável', quantityNeeded: 2, unit: 'unidade' },
      { id: 'req-r1-7', materialName: 'Luvas de Procedimento Nitrílicas', quantityNeeded: 1, unit: 'par' }
    ],
    professionalGuidance: 'Preferencialmente trabalhe sob isolamento absoluto com dique de borracha. Verifique contatos oclusais prévios com papel carbono antes de anestesiar. Realize a remoção seletiva da dentina cariada próxima à polpa para preservar a vitalidade pulpar. Fotopolimerize em incrementos de no máximo 2mm com fotopolimerizador aferido (>1000 mW/cm²). Ajuste rigorosamente a oclusão nos movimentos de máxima intercuspidação habitual (MIC) e guias operatórias.',
    patientInstructions: 'Evite mastigar alimentos duros ou pegajosos enquanto durar o efeito da anestesia local (aproximadamente 2 a 3 horas) para prevenir mordidas acidentais em lábios, bochechas ou língua. É normal uma ligeira sensibilidade térmica ao frio nos primeiros 3 a 5 dias. Caso sinta o dente "alto" ao morder ou dor persistente, retorne ao consultório para um rápido ajuste de oclusão.'
  },
  {
    code: '81000048',
    description: 'Restauração de 2 Faces em Resina Composta',
    faces: 'M/O',
    specialty: 'Dentística & Estética',
    suggestedCost: 280,
    prices: { particular: 280, convenio1: 220, convenio2: 190 },
    defaultRegion: 'Dente Específico',
    fullDescription: 'Remoção de lesão cariosa ou reconstrução de estrutura dentária perdida envolvendo duas superfícies conectadas (ex: Ocluso-Mesial ou Ocluso-Distal). Realizado sob isolamento absoluto, utilização de matrizes seccionadas e anéis de retenção para reconstrução do ponto de contato interproximal anatomizado, impedindo retenção de alimentos e garantindo saúde periodontal.',
    requiredMaterials: [
      { id: 'req-r2-1', materialName: 'Anestésico Lidocaína 2% com Epinefrina', quantityNeeded: 1, unit: 'tubete' },
      { id: 'req-r2-2', materialName: 'Agulha Gengival Descartável', quantityNeeded: 1, unit: 'unidade' },
      { id: 'req-r2-3', materialName: 'Resina Composta Nanoparticulada (A2/A3)', quantityNeeded: 1, unit: 'seringa (1g)' },
      { id: 'req-r2-4', materialName: 'Matriz Seccionada & Anel de Retenção', quantityNeeded: 1, unit: 'kit/unidade' },
      { id: 'req-r2-5', materialName: 'Cunha de Madeira Anatômica', quantityNeeded: 1, unit: 'unidade' },
      { id: 'req-r2-6', materialName: 'Ácido Fosfórico 37%', quantityNeeded: 1, unit: 'aplicação' },
      { id: 'req-r2-7', materialName: 'Adesivo Dental Fotopolimerizável', quantityNeeded: 1, unit: 'gota' },
      { id: 'req-r2-8', materialName: 'Sugador Odontológico Descartável', quantityNeeded: 2, unit: 'unidade' }
    ],
    professionalGuidance: 'Utilize matrizes seccionadas metálicas e anel de retenção para garantir ponto de contato firme e vedamento marginal cervical impecável. Proteja o dente vizinho com fita de teflon ou matriz de aço durante a preparação cavitária. Passe fio dental ao final para atestar a ausência de degraus ou excessos de resina no espaço interdental.',
    patientInstructions: 'Realize o uso diário de fio dental entre os dentes restaurados para manter a gengiva saudável. Evite mastigar alimentos excessivamente duros com o dente recém-restaurado durante as primeiras 24 horas. Se sentir desconforto com alimentos presos ou sensibilidade ao mastigar, consulte seu cirurgião-dentista.'
  },
  {
    code: '81000056',
    description: 'Restauração de 3 Faces ou Reconstrução Coronária',
    faces: 'M/O/D',
    specialty: 'Dentística & Estética',
    suggestedCost: 350,
    prices: { particular: 350, convenio1: 270, convenio2: 240 },
    defaultRegion: 'Dente Específico',
    fullDescription: 'Procedimento complexo de reconstrução direta em resina composta para elementos com grande perda de estrutura dental envolvendo três ou mais faces (ex: Mesio-Ocluso-Distal - MOD). Inclui reforço de cúspides, fotopolimerização em camadas e escultura anatômica detalhada dos sulcos e vertentes.',
    requiredMaterials: [
      { id: 'req-r3-1', materialName: 'Anestésico Lidocaína 2% com Epinefrina', quantityNeeded: 2, unit: 'tubete' },
      { id: 'req-r3-2', materialName: 'Agulha Gengival Descartável', quantityNeeded: 1, unit: 'unidade' },
      { id: 'req-r3-3', materialName: 'Resina Composta Bulk-Fill / Nanoparticulada', quantityNeeded: 1, unit: 'seringa (1.5g)' },
      { id: 'req-r3-4', materialName: 'Matriz Seccionada & Cunha Interdental', quantityNeeded: 2, unit: 'unidade' },
      { id: 'req-r3-5', materialName: 'Ácido Fosfórico 37%', quantityNeeded: 1, unit: 'aplicação' },
      { id: 'req-r3-6', materialName: 'Adesivo Dental Autocondicionante', quantityNeeded: 1, unit: 'gota' },
      { id: 'req-r3-7', materialName: 'Sugador Odontológico Descartável', quantityNeeded: 3, unit: 'unidade' }
    ],
    professionalGuidance: 'Avalie a espessura das cúspides remanescentes. Cúspides com espessura inferior a 2mm devem ter indicação de recobrimento de cúspide (overlay/onlay) para evitar fratura longitudinal catastrófica. Inicie a reconstrução transformando a cavidade complexa em cavidade de classe I utilizando técnica de restauração progressiva de cristas marginais.',
    patientInstructions: 'Como grande parte da estrutura do dente foi reconstruída, evite morder alimentos extremamente duros (ex: osso, caranguejo, gelo, sementes de pipoca). Siga corretamente a higienização com escova de cerdas macias e fio dental.'
  },
  {
    code: '81000080',
    description: 'Clareamento Dental Caseiro Supervisado / Consultório',
    faces: 'V/O',
    specialty: 'Dentística & Estética',
    suggestedCost: 850,
    prices: { particular: 850, convenio1: 680, convenio2: 600 },
    defaultRegion: 'ASAI',
    fullDescription: 'Tratamento estético para remoção de pigmentações e escurecimento do esmalte e dentina. Envolve confecção de moldeiras de acetato sob medida, aplicação de gel clareador de Peróxido de Carbamida/Hidrogênio em concentrações controladas, barreira gengival protetora e sessões de acompanhamento semanal.',
    requiredMaterials: [
      { id: 'req-cl-1', materialName: 'Gel Clareador Peróxido de Carbamida 16%', quantityNeeded: 1, unit: 'kit/bisnaga' },
      { id: 'req-cl-2', materialName: 'Barreira Gengival Fotopolimerizável Topdam', quantityNeeded: 1, unit: 'seringa' },
      { id: 'req-cl-3', materialName: 'Afastador Labial com Descanso', quantityNeeded: 1, unit: 'unidade' },
      { id: 'req-cl-4', materialName: 'Placa de Acetato para Moldeira 1mm', quantityNeeded: 2, unit: 'placa' },
      { id: 'req-cl-5', materialName: 'Sugador Odontológico Descartável', quantityNeeded: 2, unit: 'unidade' }
    ],
    professionalGuidance: 'Realize profilaxia rigorosa antes de iniciar. Instrua o paciente sobre a quantidade exata de gel por dente (uma gota pequena no terço médio/incisal das bolhas da moldeira). Aplique dessensibilizante à base de nitrato de potássio e fluoreto de sódio 2% em pacientes com histórico de hipersensibilidade dentinária.',
    patientInstructions: 'Não consuma alimentos e bebidas fortemente pigmentados (café, vinho tinto, refrigerantes de cola, molho de tomate, xadrez) nem utilize produtos com tabaco durante o tratamento. Caso sinta sensibilidade ao frio, utilize creme dental dessensibilizante e pule um dia na aplicação do gel clareador.'
  },

  // Endodontia
  {
    code: '82000018',
    description: 'Tratamento Endodôntico Unirradicular (Tratamento de Canal)',
    faces: 'O',
    specialty: 'Endodontia',
    suggestedCost: 650,
    prices: { particular: 650, convenio1: 520, convenio2: 450 },
    defaultRegion: 'RCSD',
    fullDescription: 'Desinfecção e obturação do sistema de canais radiculares em dentes com apenas uma raiz (incisivos e caninos). Envolve acesso coronário, odontometria eletrônica de precisão com localizador apical, instrumentação rotatória/reciprocante em níquel-titânio, irrigação abundante com Hipoclorito de Sódio e obturação tridimensional com guta-percha e cimento endodôntico biocerâmico.',
    requiredMaterials: [
      { id: 'req-end1-1', materialName: 'Anestésico Articaína 4%', quantityNeeded: 2, unit: 'tubete' },
      { id: 'req-end1-2', materialName: 'Lençol de Borracha & Grampo para Isolação Absoluta', quantityNeeded: 1, unit: 'conjunto' },
      { id: 'req-end1-3', materialName: 'Kit de Limas Endodônticas Rotatórias NiTi', quantityNeeded: 1, unit: 'jogo' },
      { id: 'req-end1-4', materialName: 'Hipoclorito de Sódio 2.5%', quantityNeeded: 20, unit: 'ml' },
      { id: 'req-end1-5', materialName: 'Cones de Guta-Percha Principal & Acessórios', quantityNeeded: 5, unit: 'unidade' },
      { id: 'req-end1-6', materialName: 'Cimento Endodôntico Biocerâmico', quantityNeeded: 1, unit: 'dose' },
      { id: 'req-end1-7', materialName: 'Sugador Odontológico Endodôntico', quantityNeeded: 2, unit: 'unidade' }
    ],
    professionalGuidance: 'Isolamento absoluto estrito obrigatório em todos os casos de endodontia. Estabeleça o Comprimento Real de Trabalho (CRT) com localizador apical eletrônico e confirmação radiográfica. Irrigue copiosamente com hipoclorito de sódio 2,5% a cada troca de lima. Utilize EDTA 17% por 3 minutos ativado sonoramente para remoção do smear layer antes do selamento final.',
    patientInstructions: 'Sensibilidade leve a moderada ao morder é comum nos primeiros 2 a 5 dias após o tratamento do canal. Tome os analgésicos e anti-inflamatórios prescritos rigorosamente no horário. O dente encontra-se com curativo provisório; não mastigue alimentos duros até realizar a restauração definitiva.'
  },
  {
    code: '82000026',
    description: 'Tratamento Endodôntico Birradicular',
    faces: 'O',
    specialty: 'Endodontia',
    suggestedCost: 800,
    prices: { particular: 800, convenio1: 640, convenio2: 560 },
    defaultRegion: 'RPSD',
    fullDescription: 'Tratamento de canal completo para elementos dentários birradiculares (pré-molares). Inclui debridamento Químico-Mecânico detalhado de ambos os condutos, sanificação bacteriana rigorosa e selamento hermético para prevenção de reinfecções periapicais.',
    requiredMaterials: [
      { id: 'req-end2-1', materialName: 'Anestésico Articaína 4%', quantityNeeded: 2, unit: 'tubete' },
      { id: 'req-end2-2', materialName: 'Lençol de Borracha & Isolação Absoluta', quantityNeeded: 1, unit: 'conjunto' },
      { id: 'req-end2-3', materialName: 'Kit Limas Rotatórias / Reciprocantes', quantityNeeded: 1, unit: 'jogo' },
      { id: 'req-end2-4', materialName: 'Hipoclorito de Sódio 2.5% & EDTA 17%', quantityNeeded: 30, unit: 'ml' },
      { id: 'req-end2-5', materialName: 'Cones de Guta-Percha', quantityNeeded: 8, unit: 'unidade' },
      { id: 'req-end2-6', materialName: 'Cimento Endodôntico Biocerâmico', quantityNeeded: 1, unit: 'dose' }
    ],
    professionalGuidance: 'Atente-se para a presença de istmos e ramificações nos pré-molares superiores e inferiores. Realize a desinfecção promovendo a agitação do irrigante com insertos ultrassônicos. Realize a restauração de vedamento coronário provisório com cimento de ionômero de vidro para evitar infiltração salivar.',
    patientInstructions: 'Mantenha a medicação prescrita no horário. Caso ocorra dor pulsátil contínua ou inchaço no local, entre em contato imediatamente com o cirurgião-dentista.'
  },
  {
    code: '82000034',
    description: 'Tratamento Endodôntico Multirradicular (Molares)',
    faces: 'O',
    specialty: 'Endodontia',
    suggestedCost: 1100,
    prices: { particular: 1100, convenio1: 880, convenio2: 780 },
    defaultRegion: 'RMSD',
    fullDescription: 'Tratamento de canal de alta complexidade em molares superiores ou inferiores (3 a 4 canais radiculares). Utiliza magnificação óptica, localização anatômica de canais extras (ex: MV2), preparo mecanizado e obturação termoplástica.',
    requiredMaterials: [
      { id: 'req-end3-1', materialName: 'Anestésico Articaína 4% com Epinefrina', quantityNeeded: 3, unit: 'tubete' },
      { id: 'req-end3-2', materialName: 'Lençol de Borracha & Kit Isolação Absoluta', quantityNeeded: 1, unit: 'conjunto' },
      { id: 'req-end3-3', materialName: 'Limas Endodônticas Especiais Molares', quantityNeeded: 1, unit: 'jogo' },
      { id: 'req-end3-4', materialName: 'Hipoclorito de Sódio 2.5%', quantityNeeded: 40, unit: 'ml' },
      { id: 'req-end3-5', materialName: 'EDTA 17% Solução Irrigante', quantityNeeded: 10, unit: 'ml' },
      { id: 'req-end3-6', materialName: 'Cones de Guta-Percha Biocerâmicos', quantityNeeded: 12, unit: 'unidade' },
      { id: 'req-end3-7', materialName: 'Cimento Endodôntico Sealer Plus', quantityNeeded: 1, unit: 'dose' }
    ],
    professionalGuidance: 'Procure ativamente por canais suplementares como MV2 nos primeiros molares superiores utilizando inserções de broca LN e ultrassom sob magnificação com microscópio cirúrgico ou lupas operatórias.',
    patientInstructions: 'Evite mastigar no lado tratado até a confecção do núcleo e restauração protética final. O dente tratado de canal perde a sua sensibilidade nervosa interna, mas o ligamento ao redor da raiz pode ficar sensível por alguns dias.'
  },

  // Implantodontia
  {
    code: '83000010',
    description: 'Instalação de Implante Osseointegrado de Titânio',
    faces: 'O',
    specialty: 'Implantodontia',
    suggestedCost: 2200,
    prices: { particular: 2200, convenio1: 1800, convenio2: 1600 },
    defaultRegion: 'RMID',
    fullDescription: 'Procedimento cirúrgico de precisão para posicionamento de fixação aloplástica de titânio de grau médico no tecido ósseo maxilar ou mandibular. Requer planejamento reabilitador reverso, osteotomicamente preparado sob irrigação copiosa resfriada, instalação do implante com torque primário ideal e sutura cirúrgica.',
    requiredMaterials: [
      { id: 'req-imp-1', materialName: 'Implante Cirúrgico de Titânio Osseointegrável', quantityNeeded: 1, unit: 'unidade' },
      { id: 'req-imp-2', materialName: 'Kit Campo Cirúrgico Estéril Descartável', quantityNeeded: 1, unit: 'kit' },
      { id: 'req-imp-3', materialName: 'Anestésico Mepivacaína 3% sem Vasoconstritor / Lidocaína', quantityNeeded: 3, unit: 'tubete' },
      { id: 'req-imp-4', materialName: 'Fio de Sutura Náilon 4-0 com Agulha', quantityNeeded: 1, unit: 'envelope' },
      { id: 'req-imp-5', materialName: 'Soro Fisiológico Estéril 0.9% 500ml', quantityNeeded: 1, unit: 'frasco' },
      { id: 'req-imp-6', materialName: 'Lâmina de Bisturi nº 15C Estéril', quantityNeeded: 1, unit: 'unidade' },
      { id: 'req-imp-7', materialName: 'Gaze Estéril 13 Fios', quantityNeeded: 1, unit: 'pacote' }
    ],
    professionalGuidance: 'Mantenha irrigação copiosa com soro fisiológico estéril resfriado durante todas as etapas da fresagem para não ultrapassar 47°C e prevenir necrose térmica óssea. Verifique o torque de inserção (meta entre 32 Ncm e 45 Ncm para carga imediata ou cicatrizador). Preserve pelo menos 1.5mm de osso peri-implantar e 3mm de distância de dentes vizinhos.',
    patientInstructions: 'Nas primeiras 24 horas: aplique bolsa de gelo no lado externo do rosto (20 minutos de gelo por 10 minutos de intervalo). Alimente-se estritamente com comidas frias, líquidas ou pastosas. Não faça bochechos, cusparadas ou sucção com canudo. Mantenha repouso físico e evite exposição ao sol por 7 dias. Tome rigorosamente os antibióticos e anti-inflamatórios prescritos.'
  },

  // Periodontia
  {
    code: '84000010',
    description: 'Raspagem Supra e Subgengival / Polimento Coronário',
    faces: 'M/D/O/V/L',
    specialty: 'Periodontia',
    suggestedCost: 320,
    prices: { particular: 320, convenio1: 250, convenio2: 210 },
    defaultRegion: 'ASAI',
    allowedRegions: ['ASAI', 'AS', 'AI', 'HASD', 'HASE', 'HAIE', 'HAID'],
    allowedRegionsByPriceTable: {
      particular: ['ASAI', 'AS', 'AI', 'HASD', 'HASE', 'HAIE', 'HAID'],
      convenio1: ['HASD', 'HASE', 'HAIE', 'HAID'],
      convenio2: ['AS', 'AI', 'HASD', 'HASE', 'HAIE', 'HAID']
    },
    regionRulesNote: 'Regras de Execução: Seleção configurada para ASAI (Arcadas Sup/Inf), AS (Arcada Superior), AI (Arcada Inferior) ou Hemi-Arcos (HASD, HASE, HAIE, HAID).',
    fullDescription: 'Procedimento periodontal para remoção de biofilme calcificado (cálculo/tártaro) e placa bacteriana supra e subgengival em todos os sextantes. Utiliza ultrassom piroelétrico de alta frequência, curetas de Gracey afiadas, jato de bicarbonato de sódio e polimento com pasta profilática fluoretada.',
    requiredMaterials: [
      { id: 'req-[#per1-1', materialName: 'Pasta Profilática Fluorada Menta', quantityNeeded: 1, unit: 'dose' },
      { id: 'req-[#per1-2', materialName: 'Taça de Borracha para Profilaxia', quantityNeeded: 1, unit: 'unidade' },
      { id: 'req-[#per1-3', materialName: 'Bicarbonato de Sódio Profilático', quantityNeeded: 1, unit: 'sachê' },
      { id: 'req-[#per1-4', materialName: 'Pontas de Ultrassom Perio Steril', quantityNeeded: 1, unit: 'unidade' },
      { id: 'req-[#per1-5', materialName: 'Sugador Odontológico Descartável', quantityNeeded: 2, unit: 'unidade' }
    ]
  },

  // Radiologia
  {
    code: '85000010',
    description: 'Radiografia Periapical / Interproximal Digital',
    faces: 'M/D/O/V/L',
    specialty: 'Radiologia & Diagnóstico',
    suggestedCost: 60,
    prices: { particular: 60, convenio1: 45, convenio2: 35 },
    defaultRegion: 'RMSD',
    fullDescription: 'Exame radiográfico intraoral de alta resolução utilizando sensor digital de fósforo/CMOS. Proporciona visualização clara do elemento dental, câmara pulpar, espaço do ligamento periodontal e cristas ósseas alveolares com baixíssima dose de radiação.',
    requiredMaterials: [
      { id: 'req-rad-1', materialName: 'Plástico Protetor para Sensor Digital', quantityNeeded: 1, unit: 'unidade' },
      { id: 'req-rad-2', materialName: 'Posicionador Radiográfico Autoclavável', quantityNeeded: 1, unit: 'unidade' }
    ]
  },
  {
    code: '83000028',
    description: 'Enxerto Ósseo Alveolar / Levantamento de Seio Maxilar',
    faces: 'V/P',
    specialty: 'Implantodontia',
    suggestedCost: 1800,
    prices: { particular: 1800, convenio1: 1500, convenio2: 1350 },
    defaultRegion: 'SM',
    fullDescription: 'Reconstrução de volume ósseo deficitário em altura ou espessura utilizando biomaterial ósseo sintético ou liofilizado protegido por membrana de colágeno reabsorvível. Essencial para criar leito receptáculo ideal para instalação segura de implantes.',
    requiredMaterials: [
      { id: 'req-enx-1', materialName: 'Biomaterial Ósseo Liofilizado (Bio-Oss / GenPhos)', quantityNeeded: 1, unit: 'frasco (0.5g)' },
      { id: 'req-enx-2', materialName: 'Membrana de Colágeno Reabsorvível', quantityNeeded: 1, unit: 'unidade' },
      { id: 'req-enx-3', materialName: 'Campo Cirúrgico Estéril', quantityNeeded: 1, unit: 'kit' },
      { id: 'req-enx-4', materialName: 'Soro Fisiológico Estéril', quantityNeeded: 1, unit: 'frasco' },
      { id: 'req-enx-5', materialName: 'Fio de Sutura Seda / Náilon 4-0', quantityNeeded: 1, unit: 'envelope' }
    ]
  },

  // Ortodontia
  {
    code: '84000012',
    description: 'Documentação Ortodôntica Completa & Planejamento 3D',
    faces: 'V/L',
    specialty: 'Ortodontia',
    suggestedCost: 450,
    fullDescription: 'Exame diagnóstico completo para correção oclusal e estética do sorriso. Abrange radiografia panorâmica, telerradiografia lateral com traçado cefalométrico, fotografias intra e extra-orais profissionais e escaneamento digital 3D das arcadas.',
    requiredMaterials: [
      { id: 'req-doc-1', materialName: 'Afastador Labial Fotográfico Transparente', quantityNeeded: 1, unit: 'par' },
      { id: 'req-doc-2', materialName: 'Ponteira Escaneamento Intraoral 3D', quantityNeeded: 1, unit: 'unidade' }
    ]
  },
  {
    code: '84000020',
    description: 'Instalação de Aparelho Ortodôntico Fixo Metálico / Estético',
    faces: 'V',
    specialty: 'Ortodontia',
    suggestedCost: 900,
    fullDescription: 'Montagem de aparelho ortodôntico corretivo em ambas as arcadas dentárias. Envolve profilaxia, condicionamento ácido do esmalte, colagem direta de braquetes de alta precisão com resina ortodôntica e inserção do primeiro arco inicial de Níquel-Titânio (NiTi).',
    requiredMaterials: [
      { id: 'req-ort-1', materialName: 'Kit de Braquetes Ortodônticos Metálicos/Estéticos 0.022', quantityNeeded: 1, unit: 'jogo (20 dentes)' },
      { id: 'req-ort-2', materialName: 'Resina Ortodôntica de Colagem Fotopolimerizável', quantityNeeded: 1, unit: 'seringa' },
      { id: 'req-ort-3', materialName: 'Ácido Fosfórico 37%', quantityNeeded: 1, unit: 'aplicação' },
      { id: 'req-ort-4', materialName: 'Arco Ortodôntico NiTi 0.014 Superior e Inferior', quantityNeeded: 2, unit: 'unidade' },
      { id: 'req-ort-5', materialName: 'Elásticos Ortodônticos Módulos (Bolinhas)', quantityNeeded: 1, unit: 'bengala' }
    ]
  },
  {
    code: '84000046',
    description: 'Tratamento com Alinhadores Invisíveis Transparentes',
    specialty: 'Ortodontia',
    suggestedCost: 6500,
    fullDescription: 'Ortodontia digital moderna sem fios ou braquetes metálicos. Consiste em um planejamento virtual computadorizado (ClinCheck/Setup) e sequência de placas alinhadoras termoplásticas transparentes sob medida trocadas periodicamente.',
    requiredMaterials: [
      { id: 'req-ali-1', materialName: 'Kit Alinhadores Transparentes Termoplásticos', quantityNeeded: 1, unit: 'kit completo' },
      { id: 'req-ali-2', materialName: 'Resina Fluid / Flow para Attachments', quantityNeeded: 1, unit: 'seringa' }
    ]
  },

  // Periodontia
  {
    code: '85000015',
    description: 'Raspagem e Aplanamento Radicular por Quadrante / Hemi-Arco',
    specialty: 'Periodontia',
    suggestedCost: 320,
    defaultRegion: 'HASD',
    allowedRegions: ['HASD', 'HASE', 'HAIE', 'HAID', 'AS', 'AI', 'ASAI'],
    allowedRegionsByPriceTable: {
      particular: ['HASD', 'HASE', 'HAIE', 'HAID', 'ASAI'],
      convenio1: ['HASD', 'HASE', 'HAIE', 'HAID'],
      convenio2: ['HASD', 'HASE', 'HAIE', 'HAID', 'AS', 'AI']
    },
    regionRulesNote: 'Regras de Execução: Seleção por Hemi-Arco/Quadrante (HASD, HASE, HAIE, HAID) ou Arcada conforme autorização.',
    fullDescription: 'Tratamento periodontal não cirúrgico para remoção profunda de cálculo dental (tártaro) e placa bacteriana aderida abaixo da margem gengival. Utiliza ultrassom ultrassônico e curetas periodontais de Gracey para descontaminação da raiz e reabsorção de bolsas periodontais.',
    requiredMaterials: [
      { id: 'req-ras-1', materialName: 'Anestésico Lidocaína 2%', quantityNeeded: 2, unit: 'tubete' },
      { id: 'req-ras-2', materialName: 'Curetas Gracey Periodontais (1/2, 5/6, 7/8, 11/12, 13/14)', quantityNeeded: 1, unit: 'jogo' },
      { id: 'req-ras-3', materialName: 'Clorexidina 0.12% Irrigação Subgengival', quantityNeeded: 20, unit: 'ml' },
      { id: 'req-ras-4', materialName: 'Sugador Odontológico Descartável', quantityNeeded: 2, unit: 'unidade' }
    ]
  },

  // Prótese Dentária
  {
    code: '86000018',
    description: 'Coroa Total em Cerâmica Pura / Zircônia sobre Dente',
    specialty: 'Prótese Dentária',
    suggestedCost: 1950,
    fullDescription: 'Reabilitação de elemento dentário destruído através de coroa protética fixa livre de metal (Metal-Free). Inclui preparo protético com término em ombro, moldagem de alta precisão em silicone de adição, confecção de provisório e cimentação resinosa adesiva.',
    requiredMaterials: [
      { id: 'req-cor-1', materialName: 'Silicone de Adição (Fluida e Pesada) para Moldagem', quantityNeeded: 1, unit: 'dose/kit' },
      { id: 'req-cor-2', materialName: 'Fio Retrator Gengival 000 / 00', quantityNeeded: 1, unit: 'centímetro' },
      { id: 'req-cor-3', materialName: 'Resina Acrílica Autopolimerizável para Provisório', quantityNeeded: 1, unit: 'dose' },
      { id: 'req-cor-4', materialName: 'Cimento Resinoso Dual (Allcem / RelyX)', quantityNeeded: 1, unit: 'dose' },
      { id: 'req-cor-5', materialName: 'Anestésico Lidocaína 2%', quantityNeeded: 1, unit: 'tubete' }
    ]
  },
  {
    code: '86000042',
    description: 'Lente de Contato Dental / Faceta em Cerâmica',
    specialty: 'Prótese Dentária',
    suggestedCost: 2100,
    fullDescription: 'Lâmina cerâmica de altíssima fidelidade estética e mínima espessura (0,3mm a 0,5mm) cimentada na face anterior do dente. Indicada para correção permanente de formato, alinhamento, fechamento de diastemas e alteração de cor do sorriso.',
    requiredMaterials: [
      { id: 'req-len-1', materialName: 'Silicone de Adição de Alta Precisão', quantityNeeded: 1, unit: 'dose' },
      { id: 'req-len-2', materialName: 'Cimento Resinoso Fotopolimerizável Veneer (Try-in)', quantityNeeded: 1, unit: 'dose' },
      { id: 'req-len-3', materialName: 'Ácido Fluorídrico 10% para Condicionamento da Cerâmica', quantityNeeded: 1, unit: 'gota' },
      { id: 'req-len-4', materialName: 'Silano Agente de União', quantityNeeded: 1, unit: 'gota' }
    ]
  },

  // Cirurgia Bocheco-Maxilo
  {
    code: '87000028',
    description: 'Exodorectomia / Exodontia de Terceiro Molar Incluso (Siso)',
    specialty: 'Cirurgia Bocheco-Maxilo',
    suggestedCost: 750,
    fullDescription: 'Procedimento cirúrgico para remoção de dente do siso não irrompido ou impactado em osso. Envolve osteotomia de alívio, odontossecção para preservação das estruturas nobres adjacentes (Nervo Alveolar Inferior) e sutura atraumática.',
    requiredMaterials: [
      { id: 'req-sis-1', materialName: 'Anestésico Articaína 4% com Epinefrina 1:100.000', quantityNeeded: 3, unit: 'tubete' },
      { id: 'req-sis-2', materialName: 'Agulha Gengival Longa Descartável', quantityNeeded: 1, unit: 'unidade' },
      { id: 'req-sis-3', materialName: 'Lâmina de Bisturi nº 15C Estéril', quantityNeeded: 1, unit: 'unidade' },
      { id: 'req-sis-4', materialName: 'Broca Cirúrgica Zecrya / 702 para Peça Reta', quantityNeeded: 1, unit: 'unidade' },
      { id: 'req-sis-5', materialName: 'Fio de Sutura Náilon 3-0 ou 4-0', quantityNeeded: 1, unit: 'envelope' },
      { id: 'req-sis-6', materialName: 'Gaze Estéril 13 Fios', quantityNeeded: 2, unit: 'pacote' },
      { id: 'req-sis-7', materialName: 'Soro Fisiológico Estéril 0.9%', quantityNeeded: 1, unit: 'frasco (250ml)' }
    ]
  }
];

export const INITIAL_TREATMENT_PLANS: TreatmentPlan[] = [];

export const INITIAL_PATIENT_PAYMENTS: PatientPayment[] = [];

export const INITIAL_COMMISSIONS: DentistCommissionRecord[] = [];

export const INITIAL_INSURANCE_GUIDES: InsuranceGuide[] = [];

export const INITIAL_SAVED_DOCUMENTS: SavedClinicDocument[] = [];


