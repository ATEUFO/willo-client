import { DatabaseSync } from 'node:sqlite'
import path from 'node:path'
import fs from 'node:fs'
import { app } from 'electron'

let dbInstance: DatabaseSync | null = null

/**
 * Resolves the SQLite database file path.
 * Uses Electron's app.getPath('userData') when running under Electron,
 * or defaults to local directory if app is not ready.
 */
export function getDatabasePath(): string {
  let dbDir: string
  try {
    dbDir = app ? app.getPath('userData') : path.join(process.cwd(), 'data')
  } catch {
    dbDir = path.join(process.cwd(), 'data')
  }

  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true })
  }

  return path.join(dbDir, 'willo_local.db')
}

/**
 * Returns the singleton SQLite DatabaseSync connection.
 * Automatically initializes tables if not already initialized.
 */
export function getDatabase(): DatabaseSync {
  if (!dbInstance) {
    const dbPath = getDatabasePath()
    dbInstance = new DatabaseSync(dbPath)
    dbInstance.exec('PRAGMA foreign_keys = ON;')
    initDatabaseSchema(dbInstance)
  }
  return dbInstance
}

/**
 * Initializes the SQLite database schema for the local user machine.
 * Note: Does NOT create general user/authentication/role tables.
 * Contains ONLY `current_user` (to store current logged-in user profile info)
 * and domain entities (Patients, Lab, Consultations, Vitals, Inventory, etc.).
 */
export function initDatabaseSchema(db: DatabaseSync): void {
  db.exec(`
    -- Current Logged-in User Info (Local Profile Cache Only)
    CREATE TABLE IF NOT EXISTS current_user (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      username TEXT NOT NULL,
      role TEXT NOT NULL,
      department TEXT NOT NULL,
      token TEXT,
      last_login TEXT
    );

    -- Patients (Identito-vigilance & Demographics)
    CREATE TABLE IF NOT EXISTS patients (
      id TEXT PRIMARY KEY,
      patient_code TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      age INTEGER NOT NULL,
      gender TEXT NOT NULL,
      phone TEXT NOT NULL,
      address TEXT,
      blood_type TEXT,
      emergency_contact TEXT,
      assigned_doctor TEXT,
      queue_number TEXT,
      arrival_time TEXT,
      status TEXT NOT NULL DEFAULT 'Waiting',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    -- Vitals / Observations
    CREATE TABLE IF NOT EXISTS vitals (
      id TEXT PRIMARY KEY,
      patient_id TEXT NOT NULL,
      patient_name TEXT NOT NULL,
      systolic INTEGER NOT NULL,
      diastolic INTEGER NOT NULL,
      temperature REAL NOT NULL,
      pulse INTEGER NOT NULL,
      weight REAL NOT NULL,
      sp_o2 INTEGER NOT NULL,
      is_abnormal INTEGER NOT NULL DEFAULT 0,
      nurse_notes TEXT,
      timestamp TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
    );

    -- Consultations (Clinical Records)
    CREATE TABLE IF NOT EXISTS consultations (
      id TEXT PRIMARY KEY,
      patient_id TEXT NOT NULL,
      patient_name TEXT NOT NULL,
      doctor_name TEXT NOT NULL,
      chief_complaint TEXT NOT NULL,
      clinical_notes TEXT,
      diagnoses TEXT, -- JSON array of CIM-10 diagnoses
      prescriptions TEXT, -- JSON array of prescribed drugs
      lab_orders TEXT, -- JSON array of lab tests
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
    );

    -- Laboratory Requests & Results (Biologie Clinique)
    CREATE TABLE IF NOT EXISTS lab_requests (
      id TEXT PRIMARY KEY,
      request_code TEXT NOT NULL UNIQUE,
      patient_id TEXT NOT NULL,
      patient_name TEXT NOT NULL,
      test_name TEXT NOT NULL,
      category TEXT NOT NULL,
      requested_by TEXT NOT NULL,
      date_requested TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'To Do',
      validated_by TEXT,
      results TEXT, -- JSON array of LabResultItem
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
    );

    -- Electronic Prescriptions (MedicationRequest)
    CREATE TABLE IF NOT EXISTS prescriptions (
      id TEXT PRIMARY KEY,
      prescription_code TEXT NOT NULL UNIQUE,
      patient_id TEXT NOT NULL,
      patient_name TEXT NOT NULL,
      doctor_name TEXT NOT NULL,
      items TEXT NOT NULL, -- JSON array of prescription items
      status TEXT NOT NULL DEFAULT 'Pending',
      total_amount REAL NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
    );

    -- Pharmacy Inventory (Stock & Batch tracking)
    CREATE TABLE IF NOT EXISTS inventory (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      stock_quantity INTEGER NOT NULL DEFAULT 0,
      min_quantity INTEGER NOT NULL DEFAULT 10,
      unit_price REAL NOT NULL DEFAULT 0,
      batch_number TEXT,
      expiry_date TEXT,
      status TEXT NOT NULL DEFAULT 'Normal',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    -- Appointments (Planning Multi-praticiens)
    CREATE TABLE IF NOT EXISTS appointments (
      id TEXT PRIMARY KEY,
      patient_id TEXT NOT NULL,
      patient_name TEXT NOT NULL,
      doctor_name TEXT NOT NULL,
      department TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      type TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Scheduled',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
    );

    -- Invoices & Billing (Tiers-payant / Mutuelles)
    CREATE TABLE IF NOT EXISTS invoices (
      id TEXT PRIMARY KEY,
      invoice_code TEXT NOT NULL UNIQUE,
      patient_id TEXT NOT NULL,
      patient_name TEXT NOT NULL,
      insurance_name TEXT,
      insurance_coverage_percent REAL NOT NULL DEFAULT 0,
      subtotal REAL NOT NULL DEFAULT 0,
      insurance_amount REAL NOT NULL DEFAULT 0,
      patient_share REAL NOT NULL DEFAULT 0,
      payment_method TEXT,
      status TEXT NOT NULL DEFAULT 'Unpaid',
      paid_at TEXT,
      items TEXT NOT NULL, -- JSON array of invoice items
      date TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
    );

    -- AI Diagnostic Support Records (RiskAssessment / ONNX Runtime trace)
    CREATE TABLE IF NOT EXISTS ai_diagnoses (
      id TEXT PRIMARY KEY,
      patient_id TEXT NOT NULL,
      symptoms TEXT NOT NULL,
      suggestions TEXT NOT NULL, -- JSON array of AI suggestions with confidence score
      alerts TEXT, -- JSON array of clinical interaction alerts
      model_version TEXT NOT NULL DEFAULT '1.0.0-onnx',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
    );
  `)
}

/**
 * Closes the SQLite database connection safely.
 */
export function closeDatabase(): void {
  if (dbInstance) {
    dbInstance.close()
    dbInstance = null
  }
}
