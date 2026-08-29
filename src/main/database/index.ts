import Database from 'better-sqlite3'
import path from 'node:path'
import fs from 'node:fs'
import { app } from 'electron'
import { drizzle, BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import * as schema from './schema'

let dbInstance: Database.Database | null = null
let drizzleDbInstance: BetterSQLite3Database<typeof schema> | null = null

/**
 * Resolves the SQLite database file path.
 * Uses Electron's app.getPath('userData') when running under Electron,
 * or defaults to local directory if app is not ready.
 */
export function getDatabasePath(): string {
  let dbDir: string
  try {
    dbDir = app && app.getPath ? app.getPath('userData') : path.join(process.cwd(), 'data')
  } catch {
    dbDir = path.join(process.cwd(), 'data')
  }

  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true })
  }

  return path.join(dbDir, 'willo_local.db')
}

/**
 * Returns the singleton SQLite Database instance using better-sqlite3.
 * Automatically initializes tables and default seed data if not already initialized.
 */
export function getDatabase(): Database.Database {
  if (!dbInstance) {
    const dbPath = getDatabasePath()
    dbInstance = new Database(dbPath)
    dbInstance.pragma('foreign_keys = ON')
    dbInstance.pragma('journal_mode = WAL')
    initDatabaseSchema(dbInstance)
    seedDatabaseIfEmpty(dbInstance)
  }
  return dbInstance
}

/**
 * Returns the singleton Drizzle ORM Database instance.
 */
export function getDrizzleDb(): BetterSQLite3Database<typeof schema> {
  getDatabase() // Ensure SQLite connection is initialized
  if (!drizzleDbInstance) {
    drizzleDbInstance = drizzle(dbInstance!, { schema })
  }
  return drizzleDbInstance
}

/**
 * Initializes the SQLite database schema for Willo Client.
 */
export function initDatabaseSchema(db: Database.Database): void {
  db.exec(`
    -- All Registered System Users (For authentication and role management)
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL,
      department TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Active',
      last_login TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    -- Current Logged-in User Info (Local Active Session)
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

    -- Care Tasks (Nursing)
    CREATE TABLE IF NOT EXISTS care_tasks (
      id TEXT PRIMARY KEY,
      patient_id TEXT NOT NULL,
      patient_name TEXT NOT NULL,
      bed_number TEXT NOT NULL,
      type TEXT NOT NULL,
      description TEXT NOT NULL,
      prescribed_by TEXT NOT NULL,
      time_scheduled TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Pending',
      administered_at TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
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

    -- Laboratory Requests & Results
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

    -- Electronic Prescriptions / Dispenses
    CREATE TABLE IF NOT EXISTS prescriptions (
      id TEXT PRIMARY KEY,
      prescription_code TEXT NOT NULL UNIQUE,
      patient_id TEXT NOT NULL,
      patient_name TEXT NOT NULL,
      doctor_name TEXT NOT NULL,
      items TEXT NOT NULL, -- JSON array of items
      status TEXT NOT NULL DEFAULT 'Pending',
      total_amount REAL NOT NULL DEFAULT 0,
      dispensed_at TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
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

    -- Purchase Orders (Pharmacy Procurement)
    CREATE TABLE IF NOT EXISTS purchase_orders (
      id TEXT PRIMARY KEY,
      order_code TEXT NOT NULL UNIQUE,
      supplier TEXT NOT NULL,
      items TEXT NOT NULL, -- JSON array
      total_cost REAL NOT NULL DEFAULT 0,
      date_created TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Draft'
    );

    -- Appointments
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

    -- Invoices & Billing
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

    -- System Logs
    CREATE TABLE IF NOT EXISTS system_logs (
      id TEXT PRIMARY KEY,
      level TEXT NOT NULL,
      service TEXT NOT NULL,
      message TEXT NOT NULL,
      timestamp TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    -- Backups
    CREATE TABLE IF NOT EXISTS backups (
      id TEXT PRIMARY KEY,
      filename TEXT NOT NULL,
      size TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      type TEXT NOT NULL,
      status TEXT NOT NULL
    );

    -- Outbox for tracking offline mutations
    CREATE TABLE IF NOT EXISTS outbox (
      id TEXT PRIMARY KEY,
      resource_type TEXT NOT NULL,
      resource_id TEXT NOT NULL,
      action TEXT NOT NULL,
      payload TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      error_message TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    -- AI Diagnoses
    CREATE TABLE IF NOT EXISTS ai_diagnoses (
      id TEXT PRIMARY KEY,
      patient_id TEXT NOT NULL,
      symptoms TEXT NOT NULL,
      suggestions TEXT NOT NULL,
      alerts TEXT,
      model_version TEXT NOT NULL DEFAULT '1.0.0-onnx',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
    );
  `)
}

/**
 * Seeds initial default records if the database tables are empty.
 */
export function seedDatabaseIfEmpty(db: Database.Database): void {
  // Check users count
  const userCount = (db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number }).count
  if (userCount === 0) {
    const insertUser = db.prepare(`
      INSERT INTO users (id, name, username, password, role, department, status, last_login)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `)

    const defaultUsers = [
      ['usr-1', 'Dr. Sarah Kouassi', 'skouassi', 'password123', 'consultation', 'Médecine Générale', 'Active', '2026-08-27 08:30'],
      ['usr-2', 'Inf. Marc Dubois', 'mdubois', 'password123', 'nursing', 'Soins Intensifs', 'Active', '2026-08-27 07:45'],
      ['usr-3', 'Awa Diop', 'adiop', 'password123', 'reception', 'Accueil', 'Active', '2026-08-27 08:00'],
      ['usr-4', 'Tech. Jean Mendy', 'jmendy', 'password123', 'laboratory', 'Laboratoire Central', 'Active', '2026-08-27 08:15'],
      ['usr-5', 'Pharm. Fatou Ndiaye', 'fndiaye', 'password123', 'pharmacy', 'Pharmacie', 'Active', '2026-08-27 08:10'],
      ['usr-6', 'Caissier Paul Yao', 'pyao', 'password123', 'billing', 'Caisse', 'Active', '2026-08-27 08:05'],
      ['usr-7', 'Dir. Emmanuel Mensah', 'emensah', 'password123', 'management', 'Direction', 'Active', '2026-08-27 09:00'],
      ['usr-8', 'Admin Syst. Lucas K.', 'admin', 'password123', 'admin', 'Informatique', 'Active', '2026-08-27 07:30']
    ]

    for (const user of defaultUsers) {
      insertUser.run(...user)
    }
  }

  // Check patients count
  const patientCount = (db.prepare('SELECT COUNT(*) as count FROM patients').get() as { count: number }).count
  if (patientCount === 0) {
    const insertPat = db.prepare(`
      INSERT INTO patients (id, patient_code, name, age, gender, phone, address, blood_type, emergency_contact, status, queue_number, arrival_time, assigned_doctor)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    const defaultPatients = [
      ['pat-1', 'PAT-2026-001', 'Amadou Diallo', 34, 'M', '+221 77 123 45 67', 'Dakar, Plateau', 'O+', '+221 77 987 65 43', 'Waiting', 'A-001', '08:10', 'Dr. Sarah Kouassi'],
      ['pat-2', 'PAT-2026-002', 'Aminata Sow', 28, 'F', '+221 78 456 78 90', 'Dakar, Mermoz', 'A+', '+221 77 321 65 98', 'Vitals Taken', 'A-002', '08:20', 'Dr. Sarah Kouassi'],
      ['pat-3', 'PAT-2026-003', 'Koffi Mensah', 45, 'M', '+225 07 11 22 33', 'Abidjan, Cocody', 'B+', '+225 05 44 55 66', 'In Consultation', 'A-003', '08:35', 'Dr. Sarah Kouassi'],
      ['pat-4', 'PAT-2026-004', 'Grace Banza', 52, 'F', '+243 81 999 88 77', 'Kinshasa, Gombe', 'AB+', '+243 82 111 22 33', 'Lab Pending', 'A-004', '08:40', 'Dr. Sarah Kouassi'],
      ['pat-5', 'PAT-2026-005', 'Moussa Traoré', 19, 'M', '+223 66 55 44 33', 'Bamako, Niaréla', 'O-', '+223 76 11 22 33', 'Pharmacy Pending', 'A-005', '08:50', 'Dr. Sarah Kouassi']
    ]

    for (const pat of defaultPatients) {
      insertPat.run(...pat)
    }
  }

  // Check vitals count
  const vitalsCount = (db.prepare('SELECT COUNT(*) as count FROM vitals').get() as { count: number }).count
  if (vitalsCount === 0) {
    const insertVit = db.prepare(`
      INSERT INTO vitals (id, patient_id, patient_name, timestamp, systolic, diastolic, temperature, pulse, weight, sp_o2, is_abnormal, nurse_notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    insertVit.run('vit-1', 'pat-2', 'Aminata Sow', '2026-08-27 08:30', 155, 98, 38.8, 104, 64.5, 97, 1, 'Tension élevée et fièvre modérée. Patiente signale céphalées.')
    insertVit.run('vit-2', 'pat-3', 'Koffi Mensah', '2026-08-27 08:40', 120, 80, 36.8, 72, 82.0, 99, 0, 'Constantes normales.')
  }

  // Check consultations count
  const consultationCount = (db.prepare('SELECT COUNT(*) as count FROM consultations').get() as { count: number }).count
  if (consultationCount === 0) {
    const insertCons = db.prepare(`
      INSERT INTO consultations (id, patient_id, patient_name, doctor_name, chief_complaint, clinical_notes, diagnoses, prescriptions, lab_orders, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    insertCons.run(
      'cons-1',
      'pat-3',
      'Koffi Mensah',
      'Dr. Sarah Kouassi',
      "Douleurs thoraciques atypiques et essoufflement à l'effort depuis 3 jours.",
      "Auscultation cardiaque régulier sans souffle. Râles crépitants modérés aux deux bases pulmonaires. Pas d'œdème des membres inférieurs.",
      JSON.stringify(['I10 - Hypertension artérielle essentielle', 'J44.9 - BPCO sans précision']),
      JSON.stringify([
        { drugName: 'Amlodipine 10mg', dosage: '1 comprimé par jour', frequency: 'Matin', duration: '30 jours' },
        { drugName: 'Salbutamol Inhalateur 100µg', dosage: '2 bouffées si besoin', frequency: 'À la demande', duration: '15 jours' }
      ]),
      JSON.stringify(['NFS Complète', 'Glycémie à jeun', 'Ionogramme sanguin', 'ECG Repos']),
      '2026-08-27 08:50'
    )
  }

  // Check lab_requests count
  const labCount = (db.prepare('SELECT COUNT(*) as count FROM lab_requests').get() as { count: number }).count
  if (labCount === 0) {
    const insertLab = db.prepare(`
      INSERT INTO lab_requests (id, request_code, patient_id, patient_name, test_name, category, requested_by, status, date_requested, results)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    insertLab.run(
      'lab-1',
      'LAB-2026-088',
      'pat-4',
      'Grace Banza',
      'Glycémie à jeun + Bilan Lipidique',
      'Biochimie',
      'Dr. Sarah Kouassi',
      'In Progress',
      '2026-08-27 08:45',
      JSON.stringify([
        { param: 'Glycémie à jeun', value: '1.45', unit: 'g/L', refRange: '0.70 - 1.10', isAbnormal: true },
        { param: 'Cholestérol Total', value: '2.40', unit: 'g/L', refRange: '< 2.00', isAbnormal: true },
        { param: 'Triglycérides', value: '1.30', unit: 'g/L', refRange: '0.40 - 1.50', isAbnormal: false }
      ])
    )

    insertLab.run(
      'lab-2',
      'LAB-2026-089',
      'pat-3',
      'Koffi Mensah',
      'NFS (Numération Formule Sanguine)',
      'Hématologie',
      'Dr. Sarah Kouassi',
      'Pending Validation',
      '2026-08-27 08:55',
      JSON.stringify([
        { param: 'Hémoglobine', value: '13.8', unit: 'g/dL', refRange: '13.0 - 17.0', isAbnormal: false },
        { param: 'Leucocytes', value: '11.5', unit: '10^3/µL', refRange: '4.0 - 10.0', isAbnormal: true },
        { param: 'Plaquettes', value: '250', unit: '10^3/µL', refRange: '150 - 400', isAbnormal: false }
      ])
    )
  }

  // Check inventory count
  const invCount = (db.prepare('SELECT COUNT(*) as count FROM inventory').get() as { count: number }).count
  if (invCount === 0) {
    const insertInv = db.prepare(`
      INSERT INTO inventory (id, code, name, category, stock_quantity, min_quantity, unit_price, expiry_date, batch_number, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    insertInv.run('stk-1', 'MED-PAR-500', 'Paracétamol 500mg (Boîte de 20)', 'Antalgique', 450, 50, 1500, '2027-11-30', 'LOT-2024-A12', 'Normal')
    insertInv.run('stk-2', 'MED-AMO-1G', 'Amoxicilline 1g (Boîte de 14)', 'Antibiotique', 12, 30, 3200, '2026-09-15', 'LOT-2024-B88', 'Low Stock')
    insertInv.run('stk-3', 'MED-IBU-400', 'Ibuprofène 400mg (Boîte de 30)', 'Anti-inflammatoire', 180, 40, 2100, '2026-09-01', 'LOT-2024-C03', 'Expiring Soon')
    insertInv.run('stk-4', 'MAT-SER-10ML', 'Seringues Stériles 10ml (Boîte de 100)', 'Matériel Médical', 0, 20, 8500, '2028-05-20', 'LOT-2025-S09', 'Out of Stock')
  }

  // Check prescriptions count
  const prescCount = (db.prepare('SELECT COUNT(*) as count FROM prescriptions').get() as { count: number }).count
  if (prescCount === 0) {
    const insertPresc = db.prepare(`
      INSERT INTO prescriptions (id, prescription_code, patient_id, patient_name, doctor_name, items, status, total_amount, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    insertPresc.run(
      'disp-1',
      'ORD-2026-042',
      'pat-5',
      'Moussa Traoré',
      'Dr. Sarah Kouassi',
      JSON.stringify([
        { drugName: 'Paracétamol 500mg', quantity: 2, unitPrice: 1500 },
        { drugName: 'Amoxicilline 1g', quantity: 1, unitPrice: 3200 }
      ]),
      'Pending',
      6200,
      '2026-08-27 08:50'
    )
  }

  // Check appointments count
  const apptCount = (db.prepare('SELECT COUNT(*) as count FROM appointments').get() as { count: number }).count
  if (apptCount === 0) {
    const insertAppt = db.prepare(`
      INSERT INTO appointments (id, patient_id, patient_name, doctor_name, date, time, department, type, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    insertAppt.run('app-1', 'pat-1', 'Amadou Diallo', 'Dr. Sarah Kouassi', '2026-08-27', '09:00', 'Médecine Générale', 'Consultation', 'Confirmed')
    insertAppt.run('app-2', 'pat-2', 'Aminata Sow', 'Dr. Sarah Kouassi', '2026-08-27', '09:30', 'Médecine Générale', 'Suivi', 'Confirmed')
    insertAppt.run('app-3', 'pat-3', 'Koffi Mensah', 'Dr. Sarah Kouassi', '2026-08-27', '10:00', 'Cardiologie', 'Consultation', 'Scheduled')
    insertAppt.run('app-4', 'pat-4', 'Grace Banza', 'Dr. Sarah Kouassi', '2026-08-27', '10:30', 'Gynécologie', 'Contrôle', 'Scheduled')
  }

  // Check invoices count
  const invcCount = (db.prepare('SELECT COUNT(*) as count FROM invoices').get() as { count: number }).count
  if (invcCount === 0) {
    const insertInvc = db.prepare(`
      INSERT INTO invoices (id, invoice_code, patient_id, patient_name, date, items, subtotal, insurance_name, insurance_coverage_percent, insurance_amount, patient_share, status, payment_method, paid_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    insertInvc.run(
      'inv-1',
      'FAC-2026-091',
      'pat-1',
      'Amadou Diallo',
      '2026-08-27 08:15',
      JSON.stringify([
        { description: 'Consultation Médecine Générale', category: 'Consultation', amount: 15000 },
        { description: 'Prise de constantes & Fiche', category: 'Soins', amount: 3000 }
      ]),
      18000,
      'NSIA Assurance (80%)',
      80,
      14400,
      3600,
      'Unpaid',
      null,
      null
    )

    insertInvc.run(
      'inv-2',
      'FAC-2026-090',
      'pat-5',
      'Moussa Traoré',
      '2026-08-27 08:00',
      JSON.stringify([
        { description: 'Consultation Urgence', category: 'Consultation', amount: 20000 },
        { description: 'Médicaments Ordonnance', category: 'Pharmacie', amount: 6200 }
      ]),
      26200,
      'Sans Assurance',
      0,
      0,
      26200,
      'Paid',
      'Mobile Money',
      '2026-08-27 08:22'
    )
  }

  // Check system_logs count
  const logsCount = (db.prepare('SELECT COUNT(*) as count FROM system_logs').get() as { count: number }).count
  if (logsCount === 0) {
    const insertLog = db.prepare(`
      INSERT INTO system_logs (id, level, service, message, timestamp)
      VALUES (?, ?, ?, ?, ?)
    `)

    insertLog.run('log-1', 'INFO', 'AUTH', "Connexion de l'utilisateur skouassi réussie", '2026-08-27 08:30:12')
    insertLog.run('log-2', 'WARNING', 'SYNC', "Délai d'attente de synchronisation du serveur distant (300ms) - Mode cache activé", '2026-08-27 08:25:44')
    insertLog.run('log-3', 'INFO', 'DATABASE', 'Sauvegarde automatique en arrière-plan effectuée avec succès', '2026-08-27 04:00:00')
    insertLog.run('log-4', 'ERROR', 'PRINTER', 'Imprimante de reçus Caisse-01 hors ligne', '2026-08-27 07:50:11')
  }

  // Check backups count
  const backupsCount = (db.prepare('SELECT COUNT(*) as count FROM backups').get() as { count: number }).count
  if (backupsCount === 0) {
    const insertBk = db.prepare(`
      INSERT INTO backups (id, filename, size, timestamp, type, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `)

    insertBk.run('bk-101', 'willo_db_dump_20260827_0400.sql.gz', '42.8 MB', '2026-08-27 04:00:00', 'Automatic', 'Completed')
    insertBk.run('bk-100', 'willo_db_dump_20260826_0400.sql.gz', '41.5 MB', '2026-08-26 04:00:00', 'Automatic', 'Completed')
    insertBk.run('bk-099', 'willo_manual_before_update.sql.gz', '41.2 MB', '2026-08-25 18:30:00', 'Manual', 'Completed')
  }
}

/**
 * Closes the SQLite database connection safely.
 */
export function closeDatabase(): void {
  if (dbInstance) {
    dbInstance.close()
    dbInstance = null
    drizzleDbInstance = null
  }
}
