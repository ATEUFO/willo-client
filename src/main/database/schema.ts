import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

// 1. Users
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  role: text('role').notNull(),
  department: text('department').notNull(),
  status: text('status').notNull().default('Active'),
  lastLogin: text('last_login'),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`)
})

// 2. Current User (Active Session)
export const currentUser = sqliteTable('current_user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  username: text('username').notNull(),
  role: text('role').notNull(),
  department: text('department').notNull(),
  token: text('token'),
  lastLogin: text('last_login')
})

// 3. Patients
export const patients = sqliteTable('patients', {
  id: text('id').primaryKey(),
  patientCode: text('patient_code').notNull().unique(),
  name: text('name').notNull(),
  age: integer('age').notNull(),
  gender: text('gender').notNull(),
  phone: text('phone').notNull(),
  address: text('address'),
  bloodType: text('blood_type'),
  emergencyContact: text('emergency_contact'),
  assignedDoctor: text('assigned_doctor'),
  queueNumber: text('queue_number'),
  arrivalTime: text('arrival_time'),
  status: text('status').notNull().default('Waiting'),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`)
})

// 4. Vitals
export const vitals = sqliteTable('vitals', {
  id: text('id').primaryKey(),
  patientId: text('patient_id').notNull().references(() => patients.id, { onDelete: 'cascade' }),
  patientName: text('patient_name').notNull(),
  systolic: integer('systolic').notNull(),
  diastolic: integer('diastolic').notNull(),
  temperature: real('temperature').notNull(),
  pulse: integer('pulse').notNull(),
  weight: real('weight').notNull(),
  spO2: integer('sp_o2').notNull(),
  isAbnormal: integer('is_abnormal').notNull().default(0),
  nurseNotes: text('nurse_notes'),
  timestamp: text('timestamp').notNull().default(sql`CURRENT_TIMESTAMP`)
})

// 5. Care Tasks
export const careTasks = sqliteTable('care_tasks', {
  id: text('id').primaryKey(),
  patientId: text('patient_id').notNull().references(() => patients.id, { onDelete: 'cascade' }),
  patientName: text('patient_name').notNull(),
  bedNumber: text('bed_number').notNull(),
  type: text('type').notNull(),
  description: text('description').notNull(),
  prescribedBy: text('prescribed_by').notNull(),
  timeScheduled: text('time_scheduled').notNull(),
  status: text('status').notNull().default('Pending'),
  administeredAt: text('administered_at'),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`)
})

// 6. Consultations
export const consultations = sqliteTable('consultations', {
  id: text('id').primaryKey(),
  patientId: text('patient_id').notNull().references(() => patients.id, { onDelete: 'cascade' }),
  patientName: text('patient_name').notNull(),
  doctorName: text('doctor_name').notNull(),
  chiefComplaint: text('chief_complaint').notNull(),
  clinicalNotes: text('clinical_notes'),
  diagnoses: text('diagnoses'), // JSON array
  prescriptions: text('prescriptions'), // JSON array
  labOrders: text('lab_orders'), // JSON array
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`)
})

// 7. Lab Requests
export const labRequests = sqliteTable('lab_requests', {
  id: text('id').primaryKey(),
  requestCode: text('request_code').notNull().unique(),
  patientId: text('patient_id').notNull().references(() => patients.id, { onDelete: 'cascade' }),
  patientName: text('patient_name').notNull(),
  testName: text('test_name').notNull(),
  category: text('category').notNull(),
  requestedBy: text('requested_by').notNull(),
  dateRequested: text('date_requested').notNull(),
  status: text('status').notNull().default('To Do'),
  validatedBy: text('validated_by'),
  results: text('results'), // JSON array
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`)
})

// 8. Prescriptions
export const prescriptions = sqliteTable('prescriptions', {
  id: text('id').primaryKey(),
  prescriptionCode: text('prescription_code').notNull().unique(),
  patientId: text('patient_id').notNull(),
  patientName: text('patient_name').notNull(),
  doctorName: text('doctor_name').notNull(),
  items: text('items').notNull(), // JSON array
  status: text('status').notNull().default('Pending'),
  totalAmount: real('total_amount').notNull().default(0),
  dispensedAt: text('dispensed_at'),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`)
})

// 9. Inventory
export const inventory = sqliteTable('inventory', {
  id: text('id').primaryKey(),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  category: text('category').notNull(),
  stockQuantity: integer('stock_quantity').notNull().default(0),
  minQuantity: integer('min_quantity').notNull().default(10),
  unitPrice: real('unit_price').notNull().default(0),
  batchNumber: text('batch_number'),
  expiryDate: text('expiry_date'),
  status: text('status').notNull().default('Normal'),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`)
})

// 10. Purchase Orders
export const purchaseOrders = sqliteTable('purchase_orders', {
  id: text('id').primaryKey(),
  orderCode: text('order_code').notNull().unique(),
  supplier: text('supplier').notNull(),
  items: text('items').notNull(), // JSON array
  totalCost: real('total_cost').notNull().default(0),
  dateCreated: text('date_created').notNull(),
  status: text('status').notNull().default('Draft')
})

// 11. Appointments
export const appointments = sqliteTable('appointments', {
  id: text('id').primaryKey(),
  patientId: text('patient_id').notNull().references(() => patients.id, { onDelete: 'cascade' }),
  patientName: text('patient_name').notNull(),
  doctorName: text('doctor_name').notNull(),
  department: text('department').notNull(),
  date: text('date').notNull(),
  time: text('time').notNull(),
  type: text('type').notNull(),
  status: text('status').notNull().default('Scheduled'),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`)
})

// 12. Invoices
export const invoices = sqliteTable('invoices', {
  id: text('id').primaryKey(),
  invoiceCode: text('invoice_code').notNull().unique(),
  patientId: text('patient_id').notNull().references(() => patients.id, { onDelete: 'cascade' }),
  patientName: text('patient_name').notNull(),
  insuranceName: text('insurance_name'),
  insuranceCoveragePercent: real('insurance_coverage_percent').notNull().default(0),
  subtotal: real('subtotal').notNull().default(0),
  insuranceAmount: real('insurance_amount').notNull().default(0),
  patientShare: real('patient_share').notNull().default(0),
  paymentMethod: text('payment_method'),
  status: text('status').notNull().default('Unpaid'),
  paidAt: text('paid_at'),
  items: text('items').notNull(), // JSON array
  date: text('date').notNull(),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`)
})

// 13. System Logs
export const systemLogs = sqliteTable('system_logs', {
  id: text('id').primaryKey(),
  level: text('level').notNull(),
  service: text('service').notNull(),
  message: text('message').notNull(),
  timestamp: text('timestamp').notNull().default(sql`CURRENT_TIMESTAMP`)
})

// 14. Backups
export const backups = sqliteTable('backups', {
  id: text('id').primaryKey(),
  filename: text('filename').notNull(),
  size: text('size').notNull(),
  timestamp: text('timestamp').notNull(),
  type: text('type').notNull(),
  status: text('status').notNull()
})

// 15. Outbox for Sync Mutations
export const outbox = sqliteTable('outbox', {
  id: text('id').primaryKey(), // clientMutationId UUID
  resourceType: text('resource_type').notNull(),
  resourceId: text('resource_id').notNull(),
  action: text('action').notNull(), // 'create' | 'update' | 'delete'
  payload: text('payload').notNull(), // Full JSON of the resource
  status: text('status').notNull().default('pending'), // 'pending' | 'sent' | 'failed'
  errorMessage: text('error_message'),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`)
})

// 16. AI Diagnoses
export const aiDiagnoses = sqliteTable('ai_diagnoses', {
  id: text('id').primaryKey(),
  patientId: text('patient_id').notNull().references(() => patients.id, { onDelete: 'cascade' }),
  symptoms: text('symptoms').notNull(),
  suggestions: text('suggestions').notNull(), // JSON array
  alerts: text('alerts'), // JSON array
  modelVersion: text('model_version').notNull().default('1.0.0-onnx'),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`)
})

