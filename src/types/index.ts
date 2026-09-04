export type Gender = 'cisgenero' | 'transgenero' | 'nao_binario' | 'masculino' | 'feminino' | 'outro' | string;

export interface ClinicUnit {
  id: string;
  name: string;
  address: string;
  phone: string;
  city: string;
  email?: string;
  cep?: string;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  state?: string;
  cnpj?: string;
  technicalManager?: string;
  croTechnicalManager?: string;
  epaoNumber?: string;
  epaoUf?: string;
}

export interface Professional {
  id: string;
  name: string;
  cro: string;
  specialty: string;
  clinicIds: string[]; // Clinics where this professional is available
  cpf?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  cep?: string;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  state?: string;
  croNumber?: string;
  croUf?: string;
  govBrPassword?: string;
}

export interface Anamnesis {
  // === 1. Identificação e Dados Demográficos (Vigilância & Suscetibilidade) ===
  gender?: Gender;
  ageAndBiologicalSexNotes?: string; // Observações sobre suscetibilidade por idade e sexo biológico (ex: cardiovasculares, câncer de próstata/colo do útero)
  ethnicity?: 'branca' | 'preta' | 'parda' | 'amarela' | 'indigena' | 'outra'; // Raça/Etnia (predisposições genéticas como anemia falciforme)
  ethnicityDetails?: string;
  profession?: string; // Profissão/Ocupação (riscos de agentes químicos, físicos ou biológicos no trabalho)
  occupationalRisks?: string;
  currentResidence?: string; // Local de residência atual
  previousResidence?: string; // Residência anterior (mapeamento de áreas endêmicas de dengue, malária, poluição)
  endemicAreaExposure?: string;

  // === 2. Histórico Clínico e Imunológico ===
  vaccinationStatus?: string; // Status vacinal: Registro de vacinas ao longo da vida (COVID-19, Tétano, Hepatite B, Febre Amarela, etc.)
  vaccinationDetails?: string;
  hasVaccinationUpToDate?: boolean;
  comorbiditiesSummary?: string; // Comorbidades: Doenças crônicas preexistentes (diabetes, hipertensão, asma, imunodeficiências)
  previousInfectionsHistory?: string; // Histórico de infecções anteriores (Covid-19, catapora, dengue, etc. - imunidade ou sequelas)

  // === 3. Exposição e Comportamento (Vigilância) ===
  travelHistory?: string; // Histórico de viagens nos últimos meses (cidades, estados, países - identificar doenças importadas)
  closeContactsInfectious?: boolean; // Convivência com pessoas que testaram positivo para doenças infectocontagiosas
  closeContactsDetails?: string;
  lifestyleDiet?: string; // Estilo de vida: Dieta e hábitos nutricionais
  physicalActivityLevel?: 'sedentario' | 'leve' | 'moderado' | 'intenso'; // Atividade física
  sexualHealthBehavior?: string; // Comportamento de saúde e prevenção
  environmentalExposure?: boolean; // Exposição ambiental (água contaminada, vetores mosquitos/barbeiros, animais silvestres, esgoto aberto)
  environmentalExposureDetails?: string;

  // === 4. Dados Genéticos e Familiares ===
  geneticMarkers?: boolean; // Marcadores genéticos / predisposição a mutações e condições específicas
  geneticMarkersDetails?: string;

  // --- Saúde Geral & Histórico Médico ---
  hasGoodHealth?: boolean; // Você goza de boa saúde?
  isUndergoingMedicalTreatment?: boolean; // Está atualmente fazendo qualquer tratamento médico?
  medicalTreatmentDetails?: string;
  hasAllergies: boolean;
  allergyDetails?: string; // Ex: Penicilina, anestésicos, látex, AINEs
  bloodPressureStatus?: 'normal' | 'alta' | 'baixa' | 'controlada_medicamento'; // Pressão arterial
  hasHeartDisease: boolean; // Doença do coração / infarto / sopro
  hasRheumaticFever?: boolean; // Febre reumática
  hasAsthma?: boolean; // Asma
  hasArthritis?: boolean; // Artrite
  hasFaintingSpells?: boolean; // Desmaios frequentes / síncope
  hasSinusitis?: boolean; // Sinusite
  hasHepatitis?: boolean; // Hepatite
  hasOtherInfections?: boolean; // Outras infecções
  otherInfectionsDetails?: string;
  hasRadiationTherapyFaceJaw?: boolean; // Tratamento pelos raios-X na face ou nos maxilares
  hasFaceJawTrauma?: boolean; // Traumatismo na face ou nos maxilares
  faceJawTraumaDetails?: string;
  hasAdverseDentalReaction?: boolean; // Reação desfavorável ao tratamento dentário
  adverseDentalReactionDetails?: string;
  hasOtherUnlistedDiseases?: boolean; // Qualquer enfermidade não-relacionada
  otherUnlistedDiseasesDetails?: string;
  hasPacemaker?: boolean; // Marca-passo ou próteses cardíacas/valvulares
  hasShortnessOfBreath?: boolean; // Sente falta de ar com frequência / dispneia
  hasDiabetes: boolean;
  diabetesType?: 'tipo1' | 'tipo2' | 'gestacional' | 'controlada';
  hasHypertension: boolean;
  bleedingDisorder: boolean; // Distúrbios de coagulação / hemorragia
  bleedingType?: 'normal' | 'excessivo'; // Sangramento ao corte
  healingType?: 'normal' | 'complicada'; // Cicatrização
  usesAnticoagulants?: boolean; // Uso de AAS, Marevan, Xarelto, Clopidogrel
  hasRespiratoryDisease?: boolean; // Asma, bronquite, rinite, sinusite, DPOC
  hasRenalOrHepatic?: boolean; // Problemas renais ou hepáticos
  hasThyroidDisorder?: boolean; // Hipotireoidismo / Hipertireoidismo
  hasSeizures?: boolean; // Convulsões / Epilepsia / AVC
  hasCancerHistory?: boolean; // Neoplasia, quimioterapia, radioterapia
  usesBisphosphonates?: boolean; // Bisfosfonatos (Alendronato, Zometa - risco de osteonecrose)
  hasHadSurgery?: boolean; // Já realizou alguma cirurgia
  surgeryDetails?: string;
  pastHealthProblems?: string; // Outros problemas de saúde e internações
  isPregnant: boolean;
  pregnancyWeeks?: string; // Semanas ou trimestre da gestação
  isBreastfeeding?: boolean; // Amamentando
  climactericOrMenopause?: 'nenhum' | 'climaterio' | 'menopausa' | 'pos_menopausa';
  hasAndropause?: boolean; // Andropausa / Climatério masculino / DAEM
  andropauseStatus?: 'nenhum' | 'andropausa' | 'reposicao_hormonal_trh';
  andropauseDetails?: string; // Detalhes ou sintomas da andropausa / reposição hormonal
  continuousMedication?: string; // Medicamentos de uso contínuo (nome, dosagem)
  usesHerbalOrSupplements?: boolean; // Uso de chás, fitoterápicos ou suplementos
  herbalDetails?: string;
  familyMedicalHistory?: boolean; // Histórico familiar de doenças graves
  familyHistoryDetails?: string;
  generalHealthRating?: 'excelente' | 'muito_boa' | 'boa' | 'razoavel' | 'precaria';

  // --- Hábitos, Estilo de Vida & Sono ---
  waterIntakeFrequency?: 'baixa' | 'normal' | 'alta'; // Ingestão diária de água (baixa, normal, alta)
  isSmoker?: boolean; // Tabagismo
  smokingFrequency?: 'social' | 'diario_ate_10' | 'diario_10_20' | 'diario_mais_20' | 'vape_eletronico' | 'ex_fumante';
  smokingDetails?: string; // Quantidade de cigarros/dia ou tempo de fumo
  usesRecreationalDrugs?: boolean; // Uso de drogas ou substâncias recreativas
  drugUsageFrequency?: 'ocasional_social' | 'semanal' | 'diario' | 'ex_usuario';
  drugDetails?: string; // Tipo de substância / detalhes
  drugUsageNotes?: string; // Observações do profissional sobre impacto cirúrgico/anestésico
  habitsNotes?: string; // Observações gerais sobre hábitos
  consumesAlcohol?: boolean; // Consumo frequente de bebidas alcoólicas
  hasBruxism?: boolean; // Bruxismo ou apertamento dental
  nailBitingOrHabits?: string; // Onicofagia, roer objetos, morder lábios/bochecha/caneta
  breathingType?: 'nasal' | 'bucal' | 'mista'; // Via respiratória principal (nasal, bucal, mista)
  respiratoryPattern?: 'diafragmatica' | 'toracica_apical' | 'mista_nao_avaliado'; // Padrão muscular / mecânica respiratória
  sleepingPosture?: 'decubito_dorsal' | 'decubito_lateral' | 'decubito_ventral' | 'mudanca_decubito_nao_sabe'; // Postura ao dormir
  sleepQuality?: 'reparador' | 'nao_reparador' | 'insonia' | 'sono_leve'; // Padrão de sono
  hasSnoringOrApnea?: boolean; // Ronco ou apnéia do sono
  sleepHoursPerNight?: string; // Média de horas de sono
  usesNightGuardOrCpap?: boolean; // Placa de mordida ou aparelho para ronco / CPAP
  psychologicalState?: string; // Estado comportamental recente (estresse, ansiedade, etc)

  // --- DTM, Dor Facial & Articulação ---
  hasFaceOrAtmPainLastMonth?: boolean; // Dor na face, maxilares ou têmporas no último mês
  hasAtmLocking?: boolean; // Travamento na articulação (ATM)
  atmLockingDetails?: 'aberta' | 'fechada' | 'ambas';
  hasAtmPainOrClicking?: boolean; // Estalos ou ruídos ao mastigar/abrir a boca
  hasTinnitusOrEarRinging?: boolean; // Zumbidos ou apitos no ouvido
  entEvaluated?: boolean; // Avaliado por Otorrinolaringologista
  hasJawFatigueWakingUp?: boolean; // Mandíbula cansada ou dolorida ao acordar
  hasOcclusalDiscomfort?: boolean; // Desconforto ao encaixar os dentes
  painEvaScore?: number; // Escala Visual de Dor (0 a 10)

  // --- Histórico Clínico Completo ---
  chiefComplaint?: string; // Motivo principal da consulta / queixa
  lastDentalVisit?: string; // Última consulta
  oralHealthRating?: 'excelente' | 'muito_boa' | 'boa' | 'razoavel' | 'precaria';
  hasAnesthesiaReaction?: boolean; // Complicação ou mal-estar prévio com anestésico local
  anesthesiaReactionDetails?: string;
  hasGingivalBleeding?: boolean; // Sangramento na gengiva ao escovar ou passar fio
  hasToothSensitivity?: boolean; // Sensibilidade ao frio, quente ou doce
  hasLooseTeeth?: boolean; // Dentes moles ou mobilidade dental
  dryMouthOrBadTaste?: boolean; // Sensação de boca seca (xerostomia) ou gosto ruim
  hasFaceOrLipSores?: boolean; // Feridas ou bolhas frequentes nos lábios/boca
  usesDentalProsthesis?: boolean; // Uso de prótese removível ou fixa
  orthodonticTreatment?: boolean; // Aparelho ortodôntico
  brushingFrequency?: string; // Escovação diária
  usesDentalFloss?: boolean; // Uso de fio dental
  notes?: string; // Observações gerais do cirurgião-dentista
}

export interface PatientPayment {
  id: string;
  patientId: string;
  patientName: string;
  date: string; // YYYY-MM-DD
  amount: number;
  paymentMethod: 'pix' | 'cartao_credito' | 'cartao_debito' | 'dinheiro' | 'boleto' | 'convenio';
  description: string;
  treatmentPlanId?: string;
  treatmentPlanTitle?: string;
  receiptNumber?: string;
  clinicId?: string;
  clinicName?: string;
  notes?: string;
}

export interface Patient {
  id: string;
  name: string;
  cpf: string;
  rg?: string;
  birthDate: string;
  gender: Gender;
  phone: string;
  email: string;
  profession?: string;
  ethnicity?: 'branca' | 'preta' | 'parda' | 'amarela' | 'indigena' | 'outra';
  previousResidence?: string;
  address: {
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
    cep: string;
    complement?: string;
  };
  healthInsurance?: string;
  insuranceNumber?: string;
  anamnesis: Anamnesis;
  status: 'ativo' | 'inativo';
  createdAt: string;
  avatarUrl?: string;
  photoUrl?: string;
  images?: string[]; // Galeria unificada de mídia do prontuário (radiografias, fotos clínicas, exames)
  preferredClinicId?: string;
  preferredClinicName?: string;
  preferredDentistName?: string;
}

export type AppointmentStatus = 'agendado' | 'confirmado' | 'em_atendimento' | 'concluido' | 'cancelado' | 'faltou';

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  dentistName: string;
  professionalId?: string; // ID do profissional/dentista responsável
  clinicId?: string;
  clinicName?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  durationMinutes: number;
  procedure: string;
  tussCode?: string; // Código TUSS do procedimento agendado
  status: AppointmentStatus;
  notes?: string;
  value: number;
  whatsappSentAt?: string;
  customRequiredMaterials?: ProcedureMaterialRequirement[]; // Materiais específicos/personalizados para este atendimento
}

export type ToothSurface = 'mesial' | 'distal' | 'oclusal' | 'incisal' | 'vestibular' | 'lingual' | 'palatina';

export type ToothConditionType = 
  | 'sio' // Sem alteração / hígido
  | 'carie' // Cárie (Vermelho)
  | 'restauracao' // Restauração satisfatória (Azul)
  | 'restauracao_insatisfatoria' // Restauração insatisfatória (Verde claro)
  | 'girovertido' // Dente girovertido (Laranja)
  | 'canal' // Endodontia insatisfatória (Laranja / Âmbar)
  | 'endodontia_insatisfatoria' // Endodontia insatisfatória
  | 'necessidade_endodontica' // Necessidade Endodôntica (Amarelo claro)
  | 'endodontia_satisfatoria' // Endodontia satisfatória (Azul marinho escuro)
  | 'extracao_indicada' // Extração Indicada (Roxo)
  | 'ausente' // Ausente / Extraído (Cinza)
  | 'implante' // Implante (Verde)
  | 'protese' // Prótese / Coroa (Ciano)
  | 'calculo_supragengival' // Cálculo Supragengival (Âmbar)
  | 'calculo_subgengival'; // Cálculo Subgengival (Marrom)

export type RegionAggregationMode = 'dente' | 'hemiarco' | 'sextante' | 'arcada' | 'ambas_arcadas' | 'face';

export interface CorrelationRule {
  id: string;
  conditionType: ToothConditionType;
  minSurfaces?: number;
  maxSurfaces?: number;
  tussCode?: string;
  procedureDescription: string;
  specialty: string;
  suggestedCost?: number;
  regionCode?: string;
  aggregationMode?: RegionAggregationMode;
  priceTableId?: string;
}

export interface ToothCondition {
  toothNumber: number; // e.g. 18 to 48 or 55 to 85
  surfaces?: Partial<Record<ToothSurface, ToothConditionType>>;
  wholeToothCondition?: ToothConditionType;
  isGirovertido?: boolean;
  hasCalculoSupra?: boolean;
  hasCalculoSub?: boolean;
  notes?: string;
  isDeciduous?: boolean; // Deciduous/primary tooth indicator
}

export interface OdontogramSnapshot {
  id: string;
  patientId: string;
  date: string;
  title: string;
  conditions: ToothCondition[];
  notes?: string;
  dentistName?: string;
  createdAt?: string;
}

export interface ClinicalEvolutionEntry {
  id: string;
  patientId: string;
  date: string;
  dentistName: string;
  clinicName?: string;
  toothNumber?: number;
  procedure: string;
  description: string;
  cost?: number;
  images?: string[]; // URLs or base64 data for photos/radiographs
  status?: 'pendente' | 'em_andamento' | 'concluido' | 'encaminhado';
  treatmentPlanId?: string;
  treatmentItemId?: string;
}

export type InventoryItemType = 'insumo' | 'equipamento' | 'instrumental';

export type InventoryOwnerScope = 'clinica' | 'profissional' | 'compartilhado';

export interface InventoryItem {
  id: string;
  itemCode?: string; // Código/Número do Item de Material Odontológico (Ref. Catálogo)
  name: string;
  category: 'Anestésicos' | 'Descartáveis' | 'Resinas & Adesivos' | 'Endodontia' | 'Cirurgia' | 'Ortodontia' | 'Higiene' | 'Equipamentos' | 'Instrumentais' | 'Outros' | string;
  itemType?: InventoryItemType;
  quantity: number;
  minQuantity: number;
  unit: 'caixa' | 'unidade' | 'frasco' | 'pacote' | 'tubete' | 'kit' | 'peça' | 'conjunto' | string;
  unitCost: number;
  manufacturingDate?: string;
  expirationDate?: string;
  supplier?: string;
  notes?: string;
  lastUpdated: string;
  imageUrl?: string;
  photoUrl?: string;
  images?: string[]; // Multiple identification images for material / equipment
  serialNumber?: string;
  isSterilized?: boolean; // Se o material/instrumental está esterilizado e pronto para uso
  sterilizationDate?: string; // Data do último ciclo de autoclave / esterilização
  requiresSterilization?: boolean; // Controle ativado/desativado se o material necessita de autoclave
  sterilizedBy?: string; // Nome da pessoa / profissional / atendente responsável que esterilizou e acompanhou o ciclo
  autoclaveModel?: string; // Modelo da autoclave utilizada (ex: Autoclave Cristófoli Vitale Class 12L)
  autoclaveWaterVolume?: string; // Consumo de água destilada do ciclo (ex: 150 ml)
  autoclaveTemperature?: string; // Temperatura de operação (ex: 129°C – 132°C)
  autoclavePressure?: string; // Pressão de operação (ex: 1,7 a 1,9 kgf/cm²)
  autoclaveSterilizationTime?: string; // Tempo de esterilização (ex: 16 minutos)
  autoclaveDryingMode?: string; // Etapa de secagem (ex: Secagem com a porta entreaberta)
  autoclaveCycleType?: string; // Tipo de ciclo (ex: Automático - Programa Único)
  maintenanceDate?: string;
  requiresMaintenance?: boolean;
  maintenanceFrequencyDays?: number;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  maintenanceNotes?: string;
  maintenanceHistory?: Array<{
    id: string;
    date: string;
    description: string;
    cost?: number;
    technician?: string;
  }>;

  // Ownership & Scoping for multi-clinic / multi-professional isolation:
  ownerScope?: InventoryOwnerScope; // 'clinica' | 'profissional' | 'compartilhado'
  clinicId?: string; // ID da unidade de clínica proprietária
  clinicName?: string; // Nome da clínica proprietária
  professionalId?: string; // ID do profissional/dentista proprietário
  professionalName?: string; // Nome do profissional proprietário
}

export interface FinancialTransaction {
  id: string;
  type: 'receita' | 'despesa';
  category: string; // Ex: 'Atendimento', 'Material', 'Aluguel', 'Salários', 'Comissões', 'Manutenção'
  description: string;
  amount: number;
  date: string; // YYYY-MM-DD
  patientId?: string;
  clinicId?: string;
  clinicName?: string;
  paymentMethod: 'pix' | 'cartao_credito' | 'cartao_debito' | 'dinheiro' | 'boleto' | 'convenio';
  status: 'pago' | 'pendente';
}

export interface DentistCommissionRule {
  professionalId: string;
  professionalName: string;
  defaultPercentage: number; // e.g. 50%
  cro?: string;
  specialty?: string;
}

export interface DentistCommissionRecord {
  id: string;
  professionalId: string;
  professionalName: string;
  patientName: string;
  procedureName: string;
  date: string; // YYYY-MM-DD
  procedureValue: number;
  commissionRate: number; // Percentage e.g. 50
  commissionAmount: number; // Absolute value
  status: 'pendente' | 'pago' | 'cancelado';
  paymentDate?: string;
  notes?: string;
}

export interface InsuranceGuide {
  id: string;
  guideNumber: string; // Número da Guia TISS
  insuranceName: string; // e.g. 'Unimed Odonto', 'Amil Dental', 'Bradesco Dental', 'SulAmérica', 'OdontoPrev'
  patientName: string;
  procedureName: string;
  tussCode?: string;
  submissionDate: string; // YYYY-MM-DD
  valueClaimed: number; // Valor Solicitado
  valueApproved: number; // Valor Aprovado
  disallowanceValue: number; // Valor Glosado
  status: 'enviada' | 'aprovada' | 'glosada' | 'paga';
  disallowanceReason?: string;
  notes?: string;
}

export interface MedicationItem {
  id?: string;
  name: string;
  dosage: string;
  instructions: string;
  quantity: string;
  presentation?: string; // Forma de apresentação (Comprimido, Suspensão, Gotas, Gel, Elixir, etc)
  interval?: string; // Intervalo entre doses (6/6h, 8/8h, 12/12h, 24/24h, etc)
  duration?: string; // Período/Tempo de tratamento (3 dias, 5 dias, 7 dias, 10 dias, etc)
  condition?: string; // Condição de tomada (Antes da cirurgia, Durante as refeições, Ao deitar, etc)
  category?: string; // Categoria (Antibióticos, Analgésicos, AINEs, Benzodiazepínicos, Antivirais, etc)
  contraindications?: string; // CONTRAINDICAÇÕES
  interactions?: string; // INTERAÇÕES MEDICAMENTOSAS
  tips?: string; // DICAS E ORIENTAÇÕES CLÍNICAS
}

export interface Prescription {
  id: string;
  patientId: string;
  patientName: string;
  patientCpf?: string;
  date: string;
  medications: MedicationItem[];
  type: 'simples' | 'controlada';
  observations?: string;
  dentistName: string;
  dentistCro: string;
  clinicName?: string;
  clinicLogoUrl?: string;
}

export interface WhatsAppTemplate {
  id: string;
  title: string;
  message: string;
}

export interface PriceTable {
  id: string; // e.g. 'particular', 'convenio1', 'convenio2'
  name: string; // e.g. 'Particular', 'Convênio 1 (Bradesco)', 'Convênio 2 (Unimed)'
  description?: string;
  isDefault?: boolean;
}

export interface ProcedureMaterialRequirement {
  id: string;
  materialName: string; // Ex: "Anestésico Lidocaína 2%", "Resina Composta Filtek", "Gaze Estéril", "Sugador Descartável"
  category?: string;
  quantityNeeded: number; // Ex: 1, 2, 0.5
  unit: string; // Ex: "unidade", "tubete", "caixa", "pacote", "frasco"
  notes?: string;
}

export interface TUSSProcedure {
  id?: string; // ID interno único
  code: string; // TUSS code e.g. "81000030"
  tissCode?: string; // Código TISS correspondente
  description: string;
  faces?: string; // e.g. "Mesial / Distal", "Oclusal", "M / D / O", etc.
  specialty: string;
  suggestedCost: number; // Particular / Default cost
  prices?: Record<string, number>; // Prices per priceTableId e.g. { particular: 220, convenio1: 180, convenio2: 150 }
  defaultRegion?: string; // e.g. 'RMSD', 'S1', 'MJ', 'ASAI', or tooth number
  allowedRegions?: string[]; // e.g. ['ASAI', 'AS', 'AI', 'HASD', 'HASE', 'HAIE', 'HAID']
  allowedRegionsByPriceTable?: Record<string, string[]>; // Regiões permitidas específicas por tabela/convênio e.g. { particular: ['ASAI'], convenio1: ['HASD', 'HASE'] }
  regionRulesNote?: string; // Observações de regras operacionais de regiões por convênio
  fullDescription: string; // Comprehensive procedural description for patient reports & PDF

  // Diretrizes Técnicas TUSS (Dente, Faces, Região Anatômica)
  requiresToothNumber?: boolean; // Exige indicação do dente exato (FDI 11-48 / 51-85)
  toothFacesCount?: '1_face' | '2_faces' | '3_faces' | '4_ou_mais_faces' | 'nao_aplica'; // Faces TUSS
  anatomicalScope?: 'dente' | 'intra_oral' | 'extra_oral' | 'buco_maxilo_facial' | 'arcada_sextante'; // Região anatômica da intervenção TUSS

  // Diretrizes ANS / TUSS Rol
  rolAns?: boolean; // Cobertura obrigatória pelo ROL ANS (true = SIM, false = NÃO)
  ansRolCurrent?: boolean; // Indicador de Rol Vigente da ANS
  rolAnsDescription?: string; // Nomenclatura no ROL ANS (RN 211/2010 alt RN 262/2011)
  odontoGrouping?: string; // Agrupamento Odontológico ANS (ex: Cirurgia Odontológica, Dentística, Endodontia)
  coverageLevel?: string; // Nível de cobertura contratual ANS
  vigenciaAns?: string; // Informações de vigência regulatória ANS
  tissRefGroup?: string; // Referência no grupo TISS
  subgroup?: string; // Subgrupo da Tabela 22 (ex: BOCA, LÁBIO, LÍNGUA, MANDÍBULA E MAXILA, RADIOGRAFIAS, etc.)
  group?: string; // Grupo da Tabela 22 (ex: CABEÇA E PESCOÇO, MÉTODOS DIAGNÓSTICOS)
  chapter?: string; // Capítulo da Tabela 22 (ex: PROCEDIMENTOS ODONTOLÓGICOS)
  dut?: string; // Diretriz de Utilização (DUT) da ANS
  segmentation?: string; // Segmentação (ex: OD, AMB, HCO, HSO, PAC)

  // Diretrizes de Auditoria e Comprovação do Convênio (Evitamento de Glosas)
  requiresInitialXRay?: boolean; // Exige Radiografia Inicial (Pré-Operatória)
  requiresFinalXRay?: boolean; // Exige Radiografia Final (Pós-Operatória)
  requiresClinicalPhoto?: boolean; // Exige Fotografia Clínica Intra-oral
  recurrenceLimitMonths?: number; // Limite de Recorrência / Periodicidade Mínima (em meses, ex: 6)
  auditNotes?: string; // Diretrizes de auditoria, documentos exigidos e regras de repetição

  requiredMaterials?: ProcedureMaterialRequirement[]; // Lista de materiais/kits necessários para este procedimento
  professionalGuidance?: string; // Recomendações e orientações técnicas ao cirurgião-dentista
  patientInstructions?: string; // Recomendações e orientações de cuidados ao paciente (pré e pós-operatório)
  images?: string[]; // URLs de imagens ilustrativas ou fotos clínicas
  videos?: string[]; // URLs de vídeos explicativos / YouTube / demonstração
}

export interface DocumentVariableDefinition {
  placeholder: string; // e.g. '{{NOME_PACIENTE}}'
  label: string; // e.g. 'Nome do Paciente'
  dbPath: string; // e.g. 'patients.name'
  category: 'paciente' | 'profissional' | 'clinica' | 'atendimento' | 'documento';
  description: string;
  exampleValue: string;
}

export interface CustomDocumentTemplate {
  id: string; // e.g. 'atestado_medico', 'declaracao_comparecimento'
  category: 'declaracao' | 'atestado' | 'solicitacao' | 'receita' | 'outro';
  title: string;
  subtitle: string;
  description: string;
  templateText: string;
  fieldReplacements?: Record<string, string>; // Manual overrides for placeholders
  updatedAt?: string;
}

export type TreatmentPlanStatus = 'proposto' | 'aprovado' | 'em_andamento' | 'concluido' | 'cancelado';

export interface TreatmentPlanItem {
  id: string;
  tussCode?: string;
  procedureName: string;
  specialty: string;
  toothNumber?: number;
  toothSurface?: string;
  regionCode?: string; // e.g. 'RMSD', 'S1', 'MJ', 'HAID'
  regionDescription?: string; // e.g. 'Região Molar Superior Direito (18/17/16)'
  cost: number;
  discountPercentage?: number;
  finalCost: number;
  notes?: string;
  fullProcedureDetails?: string;
  status: 'pendente' | 'em_andamento' | 'concluido';
  selectedForPlan?: boolean; // Whether the patient/dentist chose this option in the final plan
  alternativeOptions?: string[]; // Alternative treatment options considered
}

export interface TreatmentConsentAttachment {
  id: string;
  name: string;
  fileUrl: string; // Base64 data URI or storage URL
  fileType: 'image' | 'pdf' | 'document';
  uploadedAt: string;
  notes?: string;
  signedByPatient?: boolean;
  signatureDate?: string;
}

export interface TreatmentPlan {
  id: string;
  patientId: string;
  patientName: string;
  title: string;
  date: string;
  dentistName: string;
  clinicId?: string;
  clinicName?: string;
  priceTableId?: string; // e.g. 'particular', 'convenio1', 'convenio2'
  priceTableName?: string; // e.g. 'Particular', 'Convênio 1', 'Convênio 2'
  status: TreatmentPlanStatus;
  items: TreatmentPlanItem[];
  totalValue: number;
  discountValue: number;
  finalValue: number;
  paymentConditions?: string;
  notes?: string;
  // Patient Formal Acceptance & Consent (Laudo de Aceite e Formalização de Tratamento)
  consentAccepted?: boolean;
  consentAcceptedAt?: string;
  consentSignatureType?: 'digital' | 'manual_upload' | 'presencial';
  consentSignedDocumentUrl?: string; // Attached photo / document with patient signature
  consentAttachments?: TreatmentConsentAttachment[];
  consentSelectedOptionTitle?: string;
  consentFinancialSummary?: {
    totalBudget: number;
    discount: number;
    finalAgreed: number;
    paymentMethod: string;
    installments?: number;
    installmentValue?: number;
    notes?: string;
  };
}

export interface ExtraoralExam {
  faceSymmetry?: string;
  neckLymphNodes?: string;
  atmJoints?: string;
  lipsAndProfile?: string;
  skinObservations?: string;
  andropauseOrHormonalObs?: string;
  substanceUsageObs?: string;
  images?: string[];
  notes?: string;
}

export interface IntraoralExam {
  buccalMucosa?: string;
  tongueAndFloor?: string;
  palateHardSoft?: string;
  gingivaPeriodontum?: string;
  alveolarRidge?: string;
  oropharynx?: string;
  smokingOralImpact?: string;
  substanceOralImpact?: string;
  images?: string[];
  notes?: string;
}

export type ExamCategoryType = 'rotina' | 'urgencia';

export type SplitSignValue = '' | '+' | '++' | '+++' | '-' | '--' | '---';

export type MobilityClass = '0' | '1' | '2' | '3' | '';
export type PocketDepth = '0' | '1' | '2' | '3' | '';

export interface PainCharacteristics {
  provocada?: boolean;
  espontanea?: boolean;
  intermitente?: boolean;
  intensa?: boolean;
  moderada?: boolean;
  precipitadaFrio?: boolean;
  precipitadaCalor?: boolean;
  precipitadaMastigacao?: boolean;
}

export interface SwellingEvaluation {
  localizacao?: string;
  duracao?: string;
  consistencia?: string;
}

export interface AffectedAreaEvaluation {
  inspecaoSign?: SplitSignValue;
  inspecaoNotes?: string;
  percussaoSign?: SplitSignValue;
  percussaoNotes?: string;
  palpacaoSign?: SplitSignValue;
  palpacaoNotes?: string;
  mobilidadeClasse?: MobilityClass;
  mobilidadeNotes?: string;
  outrosAchados?: string;
}

export interface SupplementaryExams {
  radiografia?: string;
  outrosSolicitados?: string;
}

export interface ToothPainSummaryItem {
  id: string;
  toothNumber: number;
  calor?: boolean;
  frio?: boolean;
  sensibilidadePulpar?: boolean;
  percussao?: boolean;
  palpacao?: boolean;
  mobilidade?: MobilityClass;
  bolsaV?: boolean;
  bolsaM?: boolean;
  bolsaD?: boolean;
  bolsaL?: boolean;
  bolsaProfundidade?: PocketDepth;
  fratura?: boolean;
  carie?: boolean;
  fistula?: boolean;
  notes?: string;
}

export interface PainEvaluationExam {
  id?: string;
  patientId: string;
  examType: ExamCategoryType; // 'rotina' | 'urgencia'
  examDate: string;
  chiefComplaint?: string;
  painCharacteristics: PainCharacteristics;
  swelling: SwellingEvaluation;
  hda: string;
  affectedArea: AffectedAreaEvaluation;
  supplementary: SupplementaryExams;
  toothSummaries: ToothPainSummaryItem[];
  diagnostico?: string;
  tratamentoUrgenciaProposto?: string;
  tratamentoExecutado?: string;
  updatedAt?: string;
}

export interface ClinicalExam {
  patientId: string;
  updatedAt: string;
  extraoral: ExtraoralExam;
  intraoral: IntraoralExam;
  painExam?: PainEvaluationExam;
  odontogramImages?: string[];
  generalNotes?: string;
}

export interface SavedClinicDocument {
  id: string;
  createdAt: string; // ISO date string
  formattedDateStr: string;
  title: string;
  subtitle?: string;
  category: 'atestado' | 'declaracao' | 'solicitacao' | 'receita' | 'outro';
  patientId?: string;
  patientName: string;
  professionalName: string;
  cidCode?: string;
  summary: string;
  status: 'gerado' | 'assinado_govbr' | 'impresso';
  govBrSignedAt?: string;
  templateId?: string;
  templateData?: Record<string, any>;
  htmlSnapshot?: string;
}

export interface GovBrProfile {
  sub: string;
  name: string;
  cpf: string;
  email: string;
  phone_number?: string;
  reliability_level: 'bronze' | 'prata' | 'ouro';
  reliability_description: string;
  connectedAt: string;
  token_type?: string;
  issuer?: string;
}

