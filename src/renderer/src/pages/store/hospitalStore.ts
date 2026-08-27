import { create } from 'zustand'

export type Role =
  | 'admin'
  | 'reception'
  | 'nursing'
  | 'consultation'
  | 'laboratory'
  | 'pharmacy'
  | 'billing'
  | 'management'

export interface UserAccount {
  id: string
  name: string
  username: string
  role: Role
  department: string
  status: 'Active' | 'Inactive'
  lastLogin: string
}

export interface SystemLog {
  id: string
  level: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL'
  service: string
  message: string
  timestamp: string
}

export interface BackupRecord {
  id: string
  filename: string
  size: string
  timestamp: string
  type: 'Automatic' | 'Manual'
  status: 'Completed' | 'Failed' | 'In Progress'
}

export interface Patient {
  id: string
  patientCode: string
  name: string
  age: number
  gender: 'M' | 'F'
  phone: string
  address: string
  bloodType: string
  emergencyContact: string
  status: 'Waiting' | 'Vitals Taken' | 'In Consultation' | 'Lab Pending' | 'Pharmacy Pending' | 'Completed'
  queueNumber: string
  arrivalTime: string
  assignedDoctor: string
}

export interface Appointment {
  id: string
  patientId: string
  patientName: string
  doctorName: string
  date: string
  time: string
  department: string
  type: 'Consultation' | 'Suivi' | 'Urgence' | 'Contrôle'
  status: 'Scheduled' | 'Confirmed' | 'Completed' | 'Cancelled'
}

export interface VitalsRecord {
  id: string
  patientId: string
  patientName: string
  timestamp: string
  systolic: number
  diastolic: number
  temperature: number
  pulse: number
  weight: number
  spO2: number
  isAbnormal: boolean
  nurseNotes: string
}

export interface CareTask {
  id: string
  patientId: string
  patientName: string
  bedNumber: string
  type: 'Injection' | 'Pansement' | 'Médicament' | 'Perfusoion'
  description: string
  prescribedBy: string
  timeScheduled: string
  status: 'Pending' | 'Administered'
  administeredAt?: string
}

export interface ConsultationRecord {
  id: string
  patientId: string
  patientName: string
  doctorName: string
  date: string
  chiefComplaint: string
  clinicalNotes: string
  diagnoses: string[]
  prescriptions: { drugName: string; dosage: string; frequency: string; duration: string }[]
  labOrders: string[]
}

export interface LabResultItem {
  param: string
  value: string
  unit: string
  refRange: string
  isAbnormal: boolean
}

export interface LabRequest {
  id: string
  requestCode: string
  patientId: string
  patientName: string
  testName: string
  category: 'Hématologie' | 'Biochimie' | 'Microbiologie' | 'Immunologie'
  requestedBy: string
  status: 'To Do' | 'In Progress' | 'Pending Validation' | 'Completed'
  dateRequested: string
  results: LabResultItem[]
  validatedBy?: string
}

export interface StockItem {
  id: string
  code: string
  name: string
  category: 'Antibiotique' | 'Antalgique' | 'Anti-inflammatoire' | 'Matériel Médical' | 'Vaccin'
  stockQuantity: number
  minQuantity: number
  unitPrice: number
  expiryDate: string
  batchNumber: string
  status: 'Normal' | 'Expiring Soon' | 'Low Stock' | 'Out of Stock'
}

export interface PrescriptionDispense {
  id: string
  prescriptionCode: string
  patientName: string
  prescribedBy: string
  date: string
  items: { drugName: string; quantity: number; unitPrice: number }[]
  totalAmount: number
  status: 'Pending' | 'Dispensed'
  dispensedAt?: string
}

export interface PurchaseOrder {
  id: string
  orderCode: string
  supplier: string
  items: { drugName: string; quantity: number; estimatedCost: number }[]
  totalCost: number
  dateCreated: string
  status: 'Draft' | 'Sent' | 'Received'
}

export interface InvoiceItem {
  description: string
  category: 'Consultation' | 'Laboratoire' | 'Pharmacie' | 'Soins'
  amount: number
}

export interface Invoice {
  id: string
  invoiceCode: string
  patientId: string
  patientName: string
  date: string
  items: InvoiceItem[]
  subtotal: number
  insuranceName: string
  insuranceCoveragePercent: number
  insuranceAmount: number
  patientShare: number
  status: 'Unpaid' | 'Paid'
  paymentMethod?: 'Espèces' | 'Carte Bancaire' | 'Mobile Money'
  paidAt?: string
}

interface HospitalState {
  currentRole: Role
  isOnline: boolean
  lastSyncedAt: string
  pendingCacheSync: number
  
  // Data State
  users: UserAccount[]
  systemLogs: SystemLog[]
  backups: BackupRecord[]
  hospitalSettings: {
    name: string
    code: string
    address: string
    phone: string
    email: string
    totalBeds: number
    occupiedBeds: number
    departments: string[]
    specialties: string[]
  }
  patients: Patient[]
  appointments: Appointment[]
  vitals: VitalsRecord[]
  careTasks: CareTask[]
  consultations: ConsultationRecord[]
  labRequests: LabRequest[]
  inventory: StockItem[]
  dispenses: PrescriptionDispense[]
  purchaseOrders: PurchaseOrder[]
  invoices: Invoice[]
  dailyClosure: {
    date: string
    cashTotal: number
    cardTotal: number
    mobileTotal: number
    grandTotal: number
    status: 'Open' | 'Closed'
  }

  // Actions
  setRole: (role: Role) => void
  toggleOnline: () => void
  triggerBackup: () => void
  addUser: (user: Omit<UserAccount, 'id' | 'lastLogin'>) => void
  updateUserStatus: (id: string, status: 'Active' | 'Inactive') => void
  addPatient: (patient: Omit<Patient, 'id' | 'patientCode' | 'status' | 'queueNumber' | 'arrivalTime'>) => Patient
  updatePatientStatus: (id: string, status: Patient['status']) => void
  addAppointment: (app: Omit<Appointment, 'id' | 'status'>) => void
  cancelAppointment: (id: string) => void
  addVitals: (vitals: Omit<VitalsRecord, 'id' | 'timestamp'>) => void
  toggleCareTaskStatus: (id: string) => void
  addConsultation: (cons: Omit<ConsultationRecord, 'id' | 'date'>) => void
  updateLabRequestStatus: (id: string, status: LabRequest['status'], results?: LabResultItem[]) => void
  dispensePrescription: (id: string) => void
  addStockItem: (item: Omit<StockItem, 'id' | 'status'>) => void
  createPurchaseOrder: (po: Omit<PurchaseOrder, 'id' | 'orderCode' | 'dateCreated' | 'status'>) => void
  payInvoice: (id: string, method: 'Espèces' | 'Carte Bancaire' | 'Mobile Money') => void
  closeDailyRegister: () => void
}

const initialUsers: UserAccount[] = [
  { id: 'usr-1', name: 'Dr. Sarah Kouassi', username: 'skouassi', role: 'consultation', department: 'Médecine Générale', status: 'Active', lastLogin: '2026-08-27 08:30' },
  { id: 'usr-2', name: 'Inf. Marc Dubois', username: 'mdubois', role: 'nursing', department: 'Soins Intensifs', status: 'Active', lastLogin: '2026-08-27 07:45' },
  { id: 'usr-3', name: 'Awa Diop', username: 'adiop', role: 'reception', department: 'Accueil', status: 'Active', lastLogin: '2026-08-27 08:00' },
  { id: 'usr-4', name: 'Tech. Jean Mendy', username: 'jmendy', role: 'laboratory', department: 'Laboratoire Central', status: 'Active', lastLogin: '2026-08-27 08:15' },
  { id: 'usr-5', name: 'Pharm. Fatou Ndiaye', username: 'fndiaye', role: 'pharmacy', department: 'Pharmacie', status: 'Active', lastLogin: '2026-08-27 08:10' },
  { id: 'usr-6', name: 'Caissier Paul Yao', username: 'pyao', role: 'billing', department: 'Caisse', status: 'Active', lastLogin: '2026-08-27 08:05' },
  { id: 'usr-7', name: 'Dir. Emmanuel Mensah', username: 'emensah', role: 'management', department: 'Direction', status: 'Active', lastLogin: '2026-08-27 09:00' },
  { id: 'usr-8', name: 'Admin Syst. Lucas K.', username: 'admin', role: 'admin', department: 'Informatique', status: 'Active', lastLogin: '2026-08-27 07:30' },
]

const initialLogs: SystemLog[] = [
  { id: 'log-1', level: 'INFO', service: 'AUTH', message: 'Connexion de l\'utilisateur skouassi réussie', timestamp: '2026-08-27 08:30:12' },
  { id: 'log-2', level: 'WARNING', service: 'SYNC', message: 'Délai d\'attente de synchronisation du serveur distant (300ms) - Mode cache activé', timestamp: '2026-08-27 08:25:44' },
  { id: 'log-3', level: 'INFO', service: 'DATABASE', message: 'Sauvegarde automatique en arrière-plan effectuée avec succès', timestamp: '2026-08-27 04:00:00' },
  { id: 'log-4', level: 'ERROR', service: 'PRINTER', message: 'Imprimante de reçus Caisse-01 hors ligne', timestamp: '2026-08-27 07:50:11' },
]

const initialBackups: BackupRecord[] = [
  { id: 'bk-101', filename: 'willo_db_dump_20260827_0400.sql.gz', size: '42.8 MB', timestamp: '2026-08-27 04:00:00', type: 'Automatic', status: 'Completed' },
  { id: 'bk-100', filename: 'willo_db_dump_20260826_0400.sql.gz', size: '41.5 MB', timestamp: '2026-08-26 04:00:00', type: 'Automatic', status: 'Completed' },
  { id: 'bk-099', filename: 'willo_manual_before_update.sql.gz', size: '41.2 MB', timestamp: '2026-08-25 18:30:00', type: 'Manual', status: 'Completed' },
]

const initialPatients: Patient[] = [
  { id: 'pat-1', patientCode: 'PAT-2026-001', name: 'Amadou Diallo', age: 34, gender: 'M', phone: '+221 77 123 45 67', address: 'Dakar, Plateau', bloodType: 'O+', emergencyContact: '+221 77 987 65 43', status: 'Waiting', queueNumber: 'A-001', arrivalTime: '08:10', assignedDoctor: 'Dr. Sarah Kouassi' },
  { id: 'pat-2', patientCode: 'PAT-2026-002', name: 'Aminata Sow', age: 28, gender: 'F', phone: '+221 78 456 78 90', address: 'Dakar, Mermoz', bloodType: 'A+', emergencyContact: '+221 77 321 65 98', status: 'Vitals Taken', queueNumber: 'A-002', arrivalTime: '08:20', assignedDoctor: 'Dr. Sarah Kouassi' },
  { id: 'pat-3', patientCode: 'PAT-2026-003', name: 'Koffi Mensah', age: 45, gender: 'M', phone: '+225 07 11 22 33', address: 'Abidjan, Cocody', bloodType: 'B+', emergencyContact: '+225 05 44 55 66', status: 'In Consultation', queueNumber: 'A-003', arrivalTime: '08:35', assignedDoctor: 'Dr. Sarah Kouassi' },
  { id: 'pat-4', patientCode: 'PAT-2026-004', name: 'Grace Banza', age: 52, gender: 'F', phone: '+243 81 999 88 77', address: 'Kinshasa, Gombe', bloodType: 'AB+', emergencyContact: '+243 82 111 22 33', status: 'Lab Pending', queueNumber: 'A-004', arrivalTime: '08:40', assignedDoctor: 'Dr. Sarah Kouassi' },
  { id: 'pat-5', patientCode: 'PAT-2026-005', name: 'Moussa Traoré', age: 19, gender: 'M', phone: '+223 66 55 44 33', address: 'Bamako, Niaréla', bloodType: 'O-', emergencyContact: '+223 76 11 22 33', status: 'Pharmacy Pending', queueNumber: 'A-005', arrivalTime: '08:50', assignedDoctor: 'Dr. Sarah Kouassi' },
]

const initialAppointments: Appointment[] = [
  { id: 'app-1', patientId: 'pat-1', patientName: 'Amadou Diallo', doctorName: 'Dr. Sarah Kouassi', date: '2026-08-27', time: '09:00', department: 'Médecine Générale', type: 'Consultation', status: 'Confirmed' },
  { id: 'app-2', patientId: 'pat-2', patientName: 'Aminata Sow', doctorName: 'Dr. Sarah Kouassi', date: '2026-08-27', time: '09:30', department: 'Médecine Générale', type: 'Suivi', status: 'Confirmed' },
  { id: 'app-3', patientId: 'pat-3', patientName: 'Koffi Mensah', doctorName: 'Dr. Sarah Kouassi', date: '2026-08-27', time: '10:00', department: 'Cardiologie', type: 'Consultation', status: 'Scheduled' },
  { id: 'app-4', patientId: 'pat-4', patientName: 'Grace Banza', doctorName: 'Dr. Sarah Kouassi', date: '2026-08-27', time: '10:30', department: 'Gynécologie', type: 'Contrôle', status: 'Scheduled' },
]

const initialVitals: VitalsRecord[] = [
  { id: 'vit-1', patientId: 'pat-2', patientName: 'Aminata Sow', timestamp: '2026-08-27 08:30', systolic: 155, diastolic: 98, temperature: 38.8, pulse: 104, weight: 64.5, spO2: 97, isAbnormal: true, nurseNotes: 'Tension élevée et fièvre modérée. Patiente signale céphalées.' },
  { id: 'vit-2', patientId: 'pat-3', patientName: 'Koffi Mensah', timestamp: '2026-08-27 08:40', systolic: 120, diastolic: 80, temperature: 36.8, pulse: 72, weight: 82.0, spO2: 99, isAbnormal: false, nurseNotes: 'Constantes normales.' },
]

const initialCareTasks: CareTask[] = [
  { id: 'task-1', patientId: 'pat-2', patientName: 'Aminata Sow', bedNumber: 'Lit 102', type: 'Injection', description: 'Paracétamol 1g IV en perfusion rapide', prescribedBy: 'Dr. Sarah Kouassi', timeScheduled: '09:15', status: 'Pending' },
  { id: 'task-2', patientId: 'pat-4', patientName: 'Grace Banza', bedNumber: 'Lit 105', type: 'Pansement', description: 'Réfection du pansement abdominal stérile', prescribedBy: 'Dr. Sarah Kouassi', timeScheduled: '10:00', status: 'Pending' },
  { id: 'task-3', patientId: 'pat-1', patientName: 'Amadou Diallo', bedNumber: 'Ambulatoire', type: 'Médicament', description: 'Administration de 2 comp. Ibuprofène 400mg', prescribedBy: 'Dr. Sarah Kouassi', timeScheduled: '08:45', status: 'Administered', administeredAt: '08:50' },
]

const initialConsultations: ConsultationRecord[] = [
  {
    id: 'cons-1',
    patientId: 'pat-3',
    patientName: 'Koffi Mensah',
    doctorName: 'Dr. Sarah Kouassi',
    date: '2026-08-27 08:50',
    chiefComplaint: 'Douleurs thoraciques atypiques et essoufflement à l\'effort depuis 3 jours.',
    clinicalNotes: 'Auscultation cardiaque régulier sans souffle. Râles crépitants modérés aux deux bases pulmonaires. Pas d\'œdème des membres inférieurs.',
    diagnoses: ['I10 - Hypertension artérielle essentielle', 'J44.9 - BPCO sans précision'],
    prescriptions: [
      { drugName: 'Amlodipine 10mg', dosage: '1 comprimé par jour', frequency: 'Matin', duration: '30 jours' },
      { drugName: 'Salbutamol Inhalateur 100µg', dosage: '2 bouffées si besoin', frequency: 'À la demande', duration: '15 jours' }
    ],
    labOrders: ['NFS Complète', 'Glycémie à jeun', 'Ionogramme sanguin', 'ECG Repos']
  }
]

const initialLabRequests: LabRequest[] = [
  {
    id: 'lab-1',
    requestCode: 'LAB-2026-088',
    patientId: 'pat-4',
    patientName: 'Grace Banza',
    testName: 'Glycémie à jeun + Bilan Lipidique',
    category: 'Biochimie',
    requestedBy: 'Dr. Sarah Kouassi',
    status: 'In Progress',
    dateRequested: '2026-08-27 08:45',
    results: [
      { param: 'Glycémie à jeun', value: '1.45', unit: 'g/L', refRange: '0.70 - 1.10', isAbnormal: true },
      { param: 'Cholestérol Total', value: '2.40', unit: 'g/L', refRange: '< 2.00', isAbnormal: true },
      { param: 'Triglycérides', value: '1.30', unit: 'g/L', refRange: '0.40 - 1.50', isAbnormal: false }
    ]
  },
  {
    id: 'lab-2',
    requestCode: 'LAB-2026-089',
    patientId: 'pat-3',
    patientName: 'Koffi Mensah',
    testName: 'NFS (Numération Formule Sanguine)',
    category: 'Hématologie',
    requestedBy: 'Dr. Sarah Kouassi',
    status: 'Pending Validation',
    dateRequested: '2026-08-27 08:55',
    results: [
      { param: 'Hémoglobine', value: '13.8', unit: 'g/dL', refRange: '13.0 - 17.0', isAbnormal: false },
      { param: 'Leucocytes', value: '11.5', unit: '10^3/µL', refRange: '4.0 - 10.0', isAbnormal: true },
      { param: 'Plaquettes', value: '250', unit: '10^3/µL', refRange: '150 - 400', isAbnormal: false }
    ]
  }
]

const initialInventory: StockItem[] = [
  { id: 'stk-1', code: 'MED-PAR-500', name: 'Paracétamol 500mg (Boîte de 20)', category: 'Antalgique', stockQuantity: 450, minQuantity: 50, unitPrice: 1500, expiryDate: '2027-11-30', batchNumber: 'LOT-2024-A12', status: 'Normal' },
  { id: 'stk-2', code: 'MED-AMO-1G', name: 'Amoxicilline 1g (Boîte de 14)', category: 'Antibiotique', stockQuantity: 12, minQuantity: 30, unitPrice: 3200, expiryDate: '2026-09-15', batchNumber: 'LOT-2024-B88', status: 'Low Stock' },
  { id: 'stk-3', code: 'MED-IBU-400', name: 'Ibuprofène 400mg (Boîte de 30)', category: 'Anti-inflammatoire', stockQuantity: 180, minQuantity: 40, unitPrice: 2100, expiryDate: '2026-09-01', batchNumber: 'LOT-2024-C03', status: 'Expiring Soon' },
  { id: 'stk-4', code: 'MAT-SER-10ML', name: 'Seringues Stériles 10ml (Boîte de 100)', category: 'Matériel Médical', stockQuantity: 0, minQuantity: 20, unitPrice: 8500, expiryDate: '2028-05-20', batchNumber: 'LOT-2025-S09', status: 'Out of Stock' },
]

const initialDispenses: PrescriptionDispense[] = [
  {
    id: 'disp-1',
    prescriptionCode: 'ORD-2026-042',
    patientName: 'Moussa Traoré',
    prescribedBy: 'Dr. Sarah Kouassi',
    date: '2026-08-27 08:50',
    items: [
      { drugName: 'Paracétamol 500mg', quantity: 2, unitPrice: 1500 },
      { drugName: 'Amoxicilline 1g', quantity: 1, unitPrice: 3200 }
    ],
    totalAmount: 6200,
    status: 'Pending'
  }
]

const initialPurchaseOrders: PurchaseOrder[] = [
  {
    id: 'po-1',
    orderCode: 'PO-2026-014',
    supplier: 'Pharmacie Centrale de Distribution',
    items: [
      { drugName: 'Amoxicilline 1g', quantity: 100, estimatedCost: 320000 },
      { drugName: 'Seringues Stériles 10ml', quantity: 50, estimatedCost: 425000 }
    ],
    totalCost: 745000,
    dateCreated: '2026-08-27 07:30',
    status: 'Sent'
  }
]

const initialInvoices: Invoice[] = [
  {
    id: 'inv-1',
    invoiceCode: 'FAC-2026-091',
    patientId: 'pat-1',
    patientName: 'Amadou Diallo',
    date: '2026-08-27 08:15',
    items: [
      { description: 'Consultation Médecine Générale', category: 'Consultation', amount: 15000 },
      { description: 'Prise de constantes & Fiche', category: 'Soins', amount: 3000 }
    ],
    subtotal: 18000,
    insuranceName: 'NSIA Assurance (80%)',
    insuranceCoveragePercent: 80,
    insuranceAmount: 14400,
    patientShare: 3600,
    status: 'Unpaid'
  },
  {
    id: 'inv-2',
    invoiceCode: 'FAC-2026-090',
    patientId: 'pat-5',
    patientName: 'Moussa Traoré',
    date: '2026-08-27 08:00',
    items: [
      { description: 'Consultation Urgence', category: 'Consultation', amount: 20000 },
      { description: 'Médicaments Ordonnance', category: 'Pharmacie', amount: 6200 }
    ],
    subtotal: 26200,
    insuranceName: 'Sans Assurance',
    insuranceCoveragePercent: 0,
    insuranceAmount: 0,
    patientShare: 26200,
    status: 'Paid',
    paymentMethod: 'Mobile Money',
    paidAt: '2026-08-27 08:22'
  }
]

export const useHospitalStore = create<HospitalState>((set, get) => ({
  currentRole: 'admin',
  isOnline: true,
  lastSyncedAt: new Date().toLocaleTimeString(),
  pendingCacheSync: 0,

  users: initialUsers,
  systemLogs: initialLogs,
  backups: initialBackups,
  hospitalSettings: {
    name: 'Centre Hospitalier Universitaire Willo',
    code: 'CHU-WIL-2026',
    address: 'Avenue de la Santé, Dakar, Sénégal',
    phone: '+221 33 800 00 00',
    email: 'contact@chu-willo.org',
    totalBeds: 250,
    occupiedBeds: 184,
    departments: ['Accueil & Triage', 'Urgences', 'Médecine Générale', 'Cardiologie', 'Laboratoire', 'Pharmacie', 'Radiologie', 'Soins Intensifs'],
    specialties: ['Cardiologie', 'Pédiatrie', 'Gynécologie-Obstétrique', 'Chirurgie Générale', 'Pneumologie', 'Neurologie']
  },
  patients: initialPatients,
  appointments: initialAppointments,
  vitals: initialVitals,
  careTasks: initialCareTasks,
  consultations: initialConsultations,
  labRequests: initialLabRequests,
  inventory: initialInventory,
  dispenses: initialDispenses,
  purchaseOrders: initialPurchaseOrders,
  invoices: initialInvoices,
  dailyClosure: {
    date: new Date().toISOString().split('T')[0],
    cashTotal: 45000,
    cardTotal: 120000,
    mobileTotal: 85000,
    grandTotal: 250000,
    status: 'Open'
  },

  setRole: (role) => set({ currentRole: role }),

  toggleOnline: () => set((state) => ({ isOnline: !state.isOnline })),

  triggerBackup: () => {
    const newBackup: BackupRecord = {
      id: `bk-${Date.now()}`,
      filename: `willo_manual_dump_${new Date().toISOString().replace(/[:.]/g, '')}.sql.gz`,
      size: '43.1 MB',
      timestamp: new Date().toLocaleString(),
      type: 'Manual',
      status: 'Completed'
    }
    const newLog: SystemLog = {
      id: `log-${Date.now()}`,
      level: 'INFO',
      service: 'DATABASE',
      message: `Dump manuel déclenché par l'administrateur: ${newBackup.filename}`,
      timestamp: new Date().toLocaleString()
    }
    set((state) => ({
      backups: [newBackup, ...state.backups],
      systemLogs: [newLog, ...state.systemLogs]
    }))
  },

  addUser: (userData) => {
    const newUser: UserAccount = {
      ...userData,
      id: `usr-${Date.now()}`,
      lastLogin: 'Jamais'
    }
    set((state) => ({ users: [...state.users, newUser] }))
  },

  updateUserStatus: (id, status) => {
    set((state) => ({
      users: state.users.map((u) => (u.id === id ? { ...u, status } : u))
    }))
  },

  addPatient: (patientData) => {
    const count = get().patients.length + 1
    const newPat: Patient = {
      ...patientData,
      id: `pat-${Date.now()}`,
      patientCode: `PAT-2026-${String(count).padStart(3, '0')}`,
      status: 'Waiting',
      queueNumber: `A-${String(count).padStart(3, '0')}`,
      arrivalTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    set((state) => ({ patients: [newPat, ...state.patients] }))
    return newPat
  },

  updatePatientStatus: (id, status) => {
    set((state) => ({
      patients: state.patients.map((p) => (p.id === id ? { ...p, status } : p))
    }))
  },

  addAppointment: (appData) => {
    const newApp: Appointment = {
      ...appData,
      id: `app-${Date.now()}`,
      status: 'Confirmed'
    }
    set((state) => ({ appointments: [...state.appointments, newApp] }))
  },

  cancelAppointment: (id) => {
    set((state) => ({
      appointments: state.appointments.map((a) => (a.id === id ? { ...a, status: 'Cancelled' } : a))
    }))
  },

  addVitals: (vitalsData) => {
    const newVit: VitalsRecord = {
      ...vitalsData,
      id: `vit-${Date.now()}`,
      timestamp: new Date().toLocaleString()
    }
    set((state) => ({
      vitals: [newVit, ...state.vitals],
      patients: state.patients.map((p) => (p.id === vitalsData.patientId ? { ...p, status: 'Vitals Taken' } : p))
    }))
  },

  toggleCareTaskStatus: (id) => {
    set((state) => ({
      careTasks: state.careTasks.map((t) =>
        t.id === id
          ? {
              ...t,
              status: t.status === 'Pending' ? 'Administered' : 'Pending',
              administeredAt: t.status === 'Pending' ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined
            }
          : t
      )
    }))
  },

  addConsultation: (consData) => {
    const newCons: ConsultationRecord = {
      ...consData,
      id: `cons-${Date.now()}`,
      date: new Date().toLocaleString()
    }

    // Also update patient status
    set((state) => ({
      consultations: [newCons, ...state.consultations],
      patients: state.patients.map((p) => (p.id === consData.patientId ? { ...p, status: 'Pharmacy Pending' } : p))
    }))
  },

  updateLabRequestStatus: (id, status, results) => {
    set((state) => ({
      labRequests: state.labRequests.map((req) =>
        req.id === id
          ? {
              ...req,
              status,
              results: results || req.results,
              validatedBy: status === 'Completed' ? 'Tech. Lab' : req.validatedBy
            }
          : req
      )
    }))
  },

  dispensePrescription: (id) => {
    set((state) => ({
      dispenses: state.dispenses.map((d) =>
        d.id === id ? { ...d, status: 'Dispensed', dispensedAt: new Date().toLocaleTimeString() } : d
      )
    }))
  },

  addStockItem: (itemData) => {
    const newItem: StockItem = {
      ...itemData,
      id: `stk-${Date.now()}`,
      status: itemData.stockQuantity <= 0 ? 'Out of Stock' : itemData.stockQuantity <= itemData.minQuantity ? 'Low Stock' : 'Normal'
    }
    set((state) => ({ inventory: [newItem, ...state.inventory] }))
  },

  createPurchaseOrder: (poData) => {
    const totalCost = poData.items.reduce((acc, curr) => acc + curr.estimatedCost, 0)
    const newPO: PurchaseOrder = {
      ...poData,
      id: `po-${Date.now()}`,
      orderCode: `PO-2026-${String(get().purchaseOrders.length + 1).padStart(3, '0')}`,
      dateCreated: new Date().toLocaleString(),
      totalCost,
      status: 'Sent'
    }
    set((state) => ({ purchaseOrders: [newPO, ...state.purchaseOrders] }))
  },

  payInvoice: (id, method) => {
    set((state) => {
      const inv = state.invoices.find((i) => i.id === id)
      const amount = inv ? inv.patientShare : 0

      let cashAdd = 0
      let cardAdd = 0
      let mobileAdd = 0
      if (method === 'Espèces') cashAdd = amount
      else if (method === 'Carte Bancaire') cardAdd = amount
      else if (method === 'Mobile Money') mobileAdd = amount

      return {
        invoices: state.invoices.map((i) =>
          i.id === id ? { ...i, status: 'Paid', paymentMethod: method, paidAt: new Date().toLocaleTimeString() } : i
        ),
        dailyClosure: {
          ...state.dailyClosure,
          cashTotal: state.dailyClosure.cashTotal + cashAdd,
          cardTotal: state.dailyClosure.cardTotal + cardAdd,
          mobileTotal: state.dailyClosure.mobileTotal + mobileAdd,
          grandTotal: state.dailyClosure.grandTotal + amount
        }
      }
    })
  },

  closeDailyRegister: () => {
    set((state) => ({
      dailyClosure: { ...state.dailyClosure, status: 'Closed' }
    }))
  }
}))
