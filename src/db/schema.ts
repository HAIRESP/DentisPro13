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
