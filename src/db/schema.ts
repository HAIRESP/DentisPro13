import { relations } from 'drizzle-orm';
import {
  boolean,
  integer,
  numeric,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
  jsonb
} from 'drizzle-orm/pg-core';

// 1. Users Table (Linked to Firebase Auth UID)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: varchar('uid', { length: 255 }).notNull().unique(), // Firebase Auth UID
  email: varchar('email', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }),
  role: varchar('role', { length: 50 }).default('dentist'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// 2. Clinic Units
export const clinicUnits = pgTable('clinic_units', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 50 }),
  email: varchar('email', { length: 255 }),
  cnpj: varchar('cnpj', { length: 30 }),
  street: varchar('street', { length: 255 }),
  number: varchar('number', { length: 50 }),
  complement: varchar('complement', { length: 100 }),
  neighborhood: varchar('neighborhood', { length: 100 }),
  city: varchar('city', { length: 100 }),
  state: varchar('state', { length: 10 }),
  cep: varchar('cep', { length: 20 }),
  technicalManager: varchar('technical_manager', { length: 255 }),
  croTechnicalManager: varchar('cro_technical_manager', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow()
});

// 3. Professionals (Dentists / Specialists)
export const professionals = pgTable('professionals', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  cro: varchar('cro', { length: 50 }).notNull(),
  specialty: varchar('specialty', { length: 255 }).notNull(),
  clinicIds: jsonb('clinic_ids').default([]), // List of associated clinic IDs
  createdAt: timestamp('created_at').defaultNow()
});

// 4. Patients
export const patients = pgTable('patients', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  cpf: varchar('cpf', { length: 20 }),
  rg: varchar('rg', { length: 30 }),
  birthDate: varchar('birth_date', { length: 20 }),
  gender: varchar('gender', { length: 20 }),
  phone: varchar('phone', { length: 50 }),
  email: varchar('email', { length: 255 }),
  street: varchar('street', { length: 255 }),
  number: varchar('number', { length: 50 }),
  neighborhood: varchar('neighborhood', { length: 100 }),
  city: varchar('city', { length: 100 }),
  state: varchar('state', { length: 10 }),
  cep: varchar('cep', { length: 20 }),
  healthInsurance: varchar('health_insurance', { length: 255 }),
  insuranceNumber: varchar('insurance_number', { length: 100 }),
  status: varchar('status', { length: 20 }).default('ativo'),
  preferredClinicId: integer('preferred_clinic_id').references(() => clinicUnits.id),
  anamnesisData: jsonb('anamnesis_data'),
  galleryImages: jsonb('gallery_images').default([]),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// 5. Appointments
export const appointments = pgTable('appointments', {
  id: serial('id').primaryKey(),
  patientId: integer('patient_id').references(() => patients.id).notNull(),
  patientName: varchar('patient_name', { length: 255 }).notNull(),
  patientPhone: varchar('patient_phone', { length: 50 }),
  dentistName: varchar('dentist_name', { length: 255 }),
  professionalId: integer('professional_id').references(() => professionals.id),
  clinicId: integer('clinic_id').references(() => clinicUnits.id),
  date: varchar('date', { length: 20 }).notNull(), // YYYY-MM-DD
  time: varchar('time', { length: 10 }).notNull(), // HH:mm
  durationMinutes: integer('duration_minutes').default(30),
  procedureName: text('procedure_name'),
  tussCode: varchar('tuss_code', { length: 50 }),
  status: varchar('status', { length: 50 }).default('agendado'),
  value: numeric('value', { precision: 10, scale: 2 }).default('0.00'),
  notes: text('notes'),
  whatsappSentAt: timestamp('whatsapp_sent_at'),
  createdAt: timestamp('created_at').defaultNow()
});

// 6. Clinical Evolutions
export const clinicalEvolutions = pgTable('clinical_evolutions', {
  id: serial('id').primaryKey(),
  patientId: integer('patient_id').references(() => patients.id).notNull(),
  date: varchar('date', { length: 20 }).notNull(),
  toothNumber: varchar('tooth_number', { length: 20 }),
  procedureName: text('procedure_name').notNull(),
  notes: text('notes'),
  dentistName: varchar('dentist_name', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow()
});

// 7. Treatment Plans
export const treatmentPlans = pgTable('treatment_plans', {
  id: serial('id').primaryKey(),
  patientId: integer('patient_id').references(() => patients.id).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  status: varchar('status', { length: 50 }).default('em_andamento'),
  totalAmount: numeric('total_amount', { precision: 10, scale: 2 }).default('0.00'),
  items: jsonb('items').default([]),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow()
});

// 8. Inventory Items
export const inventoryItems = pgTable('inventory_items', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  category: varchar('category', { length: 100 }),
  quantity: integer('quantity').notNull().default(0),
  minQuantity: integer('min_quantity').notNull().default(5),
  unitPrice: numeric('unit_price', { precision: 10, scale: 2 }).default('0.00'),
  supplier: varchar('supplier', { length: 255 }),
  batchNumber: varchar('batch_number', { length: 100 }),
  expirationDate: varchar('expiration_date', { length: 20 }),
  createdAt: timestamp('created_at').defaultNow()
});

// 9. Financial Transactions (Fluxo de Caixa)
export const financialTransactions = pgTable('financial_transactions', {
  id: serial('id').primaryKey(),
  type: varchar('type', { length: 20 }).notNull(), // 'receita' | 'despesa'
  category: varchar('category', { length: 100 }),
  description: text('description').notNull(),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  date: varchar('date', { length: 20 }).notNull(),
  paymentMethod: varchar('payment_method', { length: 50 }),
  status: varchar('status', { length: 20 }).default('pago'),
  patientId: integer('patient_id').references(() => patients.id),
  clinicId: integer('clinic_id').references(() => clinicUnits.id),
  createdAt: timestamp('created_at').defaultNow()
});

// 10. Medications Catalog (Antibiotics, Analgesics, Anti-inflammatories)
export const medications = pgTable('medications', {
  id: varchar('id', { length: 100 }).primaryKey(), // unique string identifier e.g. 'amoxicilina_500_cap'
  name: varchar('name', { length: 255 }).notNull(),
  dosage: varchar('dosage', { length: 255 }).notNull(),
  presentation: varchar('presentation', { length: 255 }).notNull(),
  quantity: varchar('quantity', { length: 255 }),
  category: varchar('category', { length: 100 }),
  instructions: text('instructions'),
  contraindications: text('contraindications'),
  interactions: text('interactions'),
  tips: text('tips'),
  createdAt: timestamp('created_at').defaultNow()
});

// 11. Procedimentos TUSS (Elemento Principal do Banco de Dados TUSS com Chave Primária)
export const tussProcedures = pgTable('tuss_procedures', {
  id: serial('id').primaryKey(), // CHAVE PRIMÁRIA (Padrão SQL Relacional)
  code: varchar('code', { length: 50 }).notNull().unique(), // Código TUSS/ANS único
  tissCode: varchar('tiss_code', { length: 50 }), // Código TISS correspondente
  description: text('description').notNull(), // NOME/DESCRIÇÃO DO PROCEDIMENTO (ELEMENTO PRINCIPAL)
  fullDescription: text('full_description'), // Detalhamento técnico completo
  specialty: varchar('specialty', { length: 150 }).notNull(), // Especialidade Odontológica
  category: varchar('category', { length: 100 }), // Categoria clínica
  faces: varchar('faces', { length: 100 }), // Faces afetadas
  scopeType: varchar('scope_type', { length: 50 }).default('dente'), // 'face' | 'dente' | 'area'
  anatomicalScope: varchar('anatomical_scope', { length: 100 }), // Escopo anatômico
  toothFacesCount: varchar('tooth_faces_count', { length: 50 }), // '1_face' | '2_faces' | '3_faces' | '4_ou_mais_faces'
  defaultRegion: varchar('default_region', { length: 50 }), // Região padrão
  suggestedCost: numeric('suggested_cost', { precision: 10, scale: 2 }).default('0.00').notNull(), // Custo sugerido particular
  rolAns: boolean('rol_ans').default(false), // Cobertura obrigatória pelo Rol da ANS
  ansRolCurrent: boolean('ans_rol_current').default(true),
  odontoGrouping: varchar('odonto_grouping', { length: 150 }), // Agrupamento Odontológico ANS
  subgroup: varchar('subgroup', { length: 150 }), // Subgrupo da Tabela 22 ANS
  requiredMaterials: jsonb('required_materials').default([]), // Insumos necessários vinculados
  images: jsonb('images').default([]), // Imagens ilustrativas
  videos: jsonb('videos').default([]), // Vídeos demonstrativos
  active: boolean('active').default(true), // Status de ativação
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// 12. Tabelas de Preço & Convênios (Entidade Relacional)
export const priceTables = pgTable('price_tables', {
  id: serial('id').primaryKey(), // CHAVE PRIMÁRIA
  code: varchar('code', { length: 50 }).notNull().unique(), // Código identificador ('particular', 'amil', 'bradesco', etc.)
  name: varchar('name', { length: 255 }).notNull(), // Nome de exibição
  description: text('description'),
  isDefault: boolean('is_default').default(false),
  discountPercent: numeric('discount_percent', { precision: 5, scale: 2 }).default('0.00'),
  ansRegistration: varchar('ans_registration', { length: 50 }), // Registro ANS da operadora
  cnpj: varchar('cnpj', { length: 30 }),
  active: boolean('active').default(true),
  createdAt: timestamp('created_at').defaultNow()
});

// 13. Preços por Procedimento e Convênio (Tabela Relacional - Junção N:N com Chave Primária e Chaves Estrangeiras)
export const procedurePrices = pgTable('procedure_prices', {
  id: serial('id').primaryKey(), // CHAVE PRIMÁRIA
  procedureId: integer('procedure_id').references(() => tussProcedures.id, { onDelete: 'cascade' }).notNull(), // FK referenciando o Procedimento (Elemento Principal)
  priceTableId: integer('price_table_id').references(() => priceTables.id, { onDelete: 'cascade' }).notNull(), // FK referenciando a Tabela de Preço/Convênio
  price: numeric('price', { precision: 10, scale: 2 }).notNull(), // Valor acordado na tabela
  coPayment: numeric('co_payment', { precision: 10, scale: 2 }).default('0.00'), // Coparticipação do paciente se houver
  authorized: boolean('authorized').default(true), // Procedimento autorizado para a tabela
  coverageNotes: text('coverage_notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// 14. Regras de Correlação Odontograma -> Procedimento (Chave Primária com FK referenciando o Procedimento)
export const correlationRulesTable = pgTable('correlation_rules', {
  id: serial('id').primaryKey(), // CHAVE PRIMÁRIA
  procedureId: integer('procedure_id').references(() => tussProcedures.id, { onDelete: 'cascade' }), // FK referenciando o Procedimento (Elemento Principal)
  procedureDescription: text('procedure_description').notNull(), // Descrição do procedimento
  tussCode: varchar('tuss_code', { length: 50 }), // Código TUSS
  conditionType: varchar('condition_type', { length: 50 }).notNull(), // Achado clínico ('carie', 'canal', etc.)
  priceTableId: integer('price_table_id').references(() => priceTables.id, { onDelete: 'set null' }), // FK para convênio
  scopeType: varchar('scope_type', { length: 50 }).default('dente'), // 'face' | 'dente' | 'area'
  minSurfaces: integer('min_surfaces').default(0),
  maxSurfaces: integer('max_surfaces').default(5),
  applicableFaces: jsonb('applicable_faces').default([]), // ['oclusal', 'mesial', etc.]
  teethGroup: varchar('teeth_group', { length: 50 }).default('todos'), // 'todos', 'molares', 'sisos', etc.
  applicableTeeth: jsonb('applicable_teeth').default([]), // [18, 28, etc.]
  aggregationMode: varchar('aggregation_mode', { length: 50 }).default('dente'), // 'hemiarco', 'sextante', etc.
  applicableRegions: jsonb('applicable_regions').default([]), // ['HASD', 'S1', 'AS', etc.]
  regionCode: varchar('region_code', { length: 50 }),
  suggestedCost: numeric('suggested_cost', { precision: 10, scale: 2 }),
  specialty: varchar('specialty', { length: 150 }),
  notes: text('notes'),
  active: boolean('active').default(true),
  createdAt: timestamp('created_at').defaultNow()
});

// Relationships
export const usersRelations = relations(users, () => ({}));

export const patientsRelations = relations(patients, ({ many }) => ({
  appointments: many(appointments),
  evolutions: many(clinicalEvolutions),
  treatmentPlans: many(treatmentPlans),
  transactions: many(financialTransactions)
}));

export const appointmentsRelations = relations(appointments, ({ one }) => ({
  patient: one(patients, {
    fields: [appointments.patientId],
    references: [patients.id]
  }),
  clinic: one(clinicUnits, {
    fields: [appointments.clinicId],
    references: [clinicUnits.id]
  }),
  professional: one(professionals, {
    fields: [appointments.professionalId],
    references: [professionals.id]
  })
}));

// Relações do Banco de Dados TUSS com Procedimento como Elemento Principal
export const tussProceduresRelations = relations(tussProcedures, ({ many }) => ({
  prices: many(procedurePrices),
  correlationRules: many(correlationRulesTable)
}));

export const priceTablesRelations = relations(priceTables, ({ many }) => ({
  procedurePrices: many(procedurePrices),
  correlationRules: many(correlationRulesTable)
}));

export const procedurePricesRelations = relations(procedurePrices, ({ one }) => ({
  procedure: one(tussProcedures, {
    fields: [procedurePrices.procedureId],
    references: [tussProcedures.id]
  }),
  priceTable: one(priceTables, {
    fields: [procedurePrices.priceTableId],
    references: [priceTables.id]
  })
}));

export const correlationRulesTableRelations = relations(correlationRulesTable, ({ one }) => ({
  procedure: one(tussProcedures, {
    fields: [correlationRulesTable.procedureId],
    references: [tussProcedures.id]
  }),
  priceTable: one(priceTables, {
    fields: [correlationRulesTable.priceTableId],
    references: [priceTables.id]
  })
}));
