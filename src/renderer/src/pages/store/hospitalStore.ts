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
  | 'ai-diagnostic'

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
  // Auth & Session
  currentUser: UserAccount | null
  isAuthenticated: boolean
  isLoadingSession: boolean
  currentRole: Role

  // Connection & Sync
  isOnline: boolean
  lastSyncedAt: string
  pendingCacheSync: number
  showConnectionsModal: boolean
  showSettingsModal: boolean

  // Data State loaded from better-sqlite3 DB
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

  // Auth & DB Actions
  checkAuthSession: () => Promise<boolean>
  login: (username: string, password: string) => Promise<{ success: boolean; message?: string }>
  logout: () => Promise<void>
  register: (userData: Omit<UserAccount, 'id' | 'lastLogin'> & { password?: string }) => Promise<{ success: boolean; message?: string }>
  loadAllData: () => Promise<void>
  setRole: (role: Role) => void
  toggleOnline: () => void
  setShowConnectionsModal: (show: boolean) => void
  setShowSettingsModal: (show: boolean) => void
  triggerBackup: () => Promise<void>
  addUser: (user: Omit<UserAccount, 'id' | 'lastLogin'> & { password?: string }) => Promise<void>
  updateUserStatus: (id: string, status: 'Active' | 'Inactive') => Promise<void>
  addPatient: (patient: Omit<Patient, 'id' | 'patientCode' | 'status' | 'queueNumber' | 'arrivalTime'>) => Promise<Patient>
  updatePatientStatus: (id: string, status: Patient['status']) => Promise<void>
  addAppointment: (app: Omit<Appointment, 'id' | 'status'>) => Promise<void>
  cancelAppointment: (id: string) => Promise<void>
  addVitals: (vitals: Omit<VitalsRecord, 'id' | 'timestamp'>) => Promise<void>
  toggleCareTaskStatus: (id: string) => Promise<void>
  addConsultation: (cons: Omit<ConsultationRecord, 'id' | 'date'>) => Promise<void>
  updateLabRequestStatus: (id: string, status: LabRequest['status'], results?: LabResultItem[]) => Promise<void>
  dispensePrescription: (id: string) => Promise<void>
  addStockItem: (item: Omit<StockItem, 'id' | 'status'>) => Promise<void>
  createPurchaseOrder: (po: Omit<PurchaseOrder, 'id' | 'orderCode' | 'dateCreated' | 'status'>) => Promise<void>
  addInvoice: (invoice: Omit<Invoice, 'id' | 'invoiceCode' | 'status' | 'date'>) => Promise<void>
  payInvoice: (id: string, method: 'Espèces' | 'Carte Bancaire' | 'Mobile Money') => Promise<void>
  closeDailyRegister: () => void
}

export const useHospitalStore = create<HospitalState>((set, get) => ({
  currentUser: null,
  isAuthenticated: false,
  isLoadingSession: true,
  currentRole: 'admin',
  isOnline: true,
  lastSyncedAt: new Date().toLocaleTimeString(),
  pendingCacheSync: 0,
  showConnectionsModal: false,
  showSettingsModal: false,

  users: [],
  systemLogs: [],
  backups: [],
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
  patients: [],
  appointments: [],
  vitals: [],
  careTasks: [],
  consultations: [],
  labRequests: [],
  inventory: [],
  dispenses: [],
  purchaseOrders: [],
  invoices: [],
  dailyClosure: {
    date: new Date().toISOString().split('T')[0],
    cashTotal: 0,
    cardTotal: 0,
    mobileTotal: 0,
    grandTotal: 0,
    status: 'Open'
  },

  checkAuthSession: async () => {
    try {
      set({ isLoadingSession: true })
      if (window.api && window.api.auth) {
        const sessionUser = await window.api.auth.getCurrentUser()
        if (sessionUser) {
          set({
            currentUser: sessionUser,
            isAuthenticated: true,
            currentRole: sessionUser.role as Role,
            isLoadingSession: false
          })
          await get().loadAllData()
          return true
        }
      }
    } catch (err) {
      console.error('Failed to check auth session:', err)
    }
    set({ currentUser: null, isAuthenticated: false, isLoadingSession: false })
    return false
  },

  login: async (username: string, password: string) => {
    try {
      if (!window.api || !window.api.auth) {
        return { success: false, message: 'IPC Bridge non disponible' }
      }
      const user = await window.api.auth.login({ username, password })
      if (user) {
        set({
          currentUser: user,
          isAuthenticated: true,
          currentRole: user.role as Role
        })
        await get().loadAllData()
        return { success: true }
      } else {
        return { success: false, message: 'Identifiant ou mot de passe incorrect' }
      }
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : (err as { message?: string })?.message || 'Erreur lors de la connexion'
      return { success: false, message }
    }
  },

  logout: async () => {
    try {
      if (window.api && window.api.auth) {
        await window.api.auth.logout()
      }
    } catch (err) {
      console.error('Failed to logout:', err)
    }
    set({
      currentUser: null,
      isAuthenticated: false
    })
  },

  register: async (userData) => {
    try {
      if (!window.api || !window.api.auth) {
        return { success: false, message: 'IPC Bridge non disponible' }
      }
      const newUser = await window.api.auth.register(userData)
      if (newUser) {
        await get().loadAllData()
        return { success: true }
      }
      return { success: false, message: 'Impossible de créer le compte' }
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : (err as { message?: string })?.message || 'Erreur lors de la création du compte'
      return { success: false, message }
    }
  },

  loadAllData: async () => {
    try {
      if (!window.api) return

      const [
        usersData,
        patientsData,
        vitalsData,
        careTasksData,
        consultationsData,
        labData,
        prescriptionsData,
        inventoryData,
        poData,
        appointmentsData,
        invoicesData,
        logsData,
        backupsData
      ] = await Promise.all([
        window.api.users.getAll().catch(() => []),
        window.api.patients.getAll().catch(() => []),
        window.api.vitals.getAll().catch(() => []),
        window.api.careTasks.getAll().catch(() => []),
        window.api.consultations.getAll().catch(() => []),
        window.api.lab.getAll().catch(() => []),
        window.api.prescriptions.getAll().catch(() => []),
        window.api.inventory.getAll().catch(() => []),
        window.api.purchaseOrders.getAll().catch(() => []),
        window.api.appointments.getAll().catch(() => []),
        window.api.invoices.getAll().catch(() => []),
        window.api.logs.getAll().catch(() => []),
        window.api.backups.getAll().catch(() => [])
      ])

      // Map prescriptions to dispenses format for pharmacy page compatibility
      const dispensesData: PrescriptionDispense[] = (prescriptionsData || []).map((p) => ({
        id: p.id,
        prescriptionCode: p.prescriptionCode || p.prescription_code,
        patientName: p.patientName || p.patient_name,
        prescribedBy: p.doctorName || p.doctor_name,
        date: p.createdAt || p.created_at || new Date().toLocaleString(),
        items: typeof p.items === 'string' ? JSON.parse(p.items) : p.items || [],
        totalAmount: p.totalAmount || p.total_amount || 0,
        status: (p.status === 'Dispensed' ? 'Dispensed' : 'Pending') as 'Pending' | 'Dispensed',
        dispensedAt: p.dispensedAt
      }))

      let isOnlineState = get().isOnline
      let syncTime = get().lastSyncedAt
      let pendingCount = get().pendingCacheSync

      if (window.api && window.api.sync) {
        try {
          const status = await window.api.sync.getStatus()
          isOnlineState = status.isOnline
          syncTime = status.lastSyncedAt || syncTime
          pendingCount = status.pendingCacheSync
        } catch (err) {
          console.warn('Failed to query sync status:', err)
        }
      }

      set({
        users: usersData || [],
        patients: patientsData || [],
        vitals: vitalsData || [],
        careTasks: careTasksData || [],
        consultations: consultationsData || [],
        labRequests: labData || [],
        dispenses: dispensesData,
        inventory: inventoryData || [],
        purchaseOrders: poData || [],
        appointments: appointmentsData || [],
        invoices: invoicesData || [],
        systemLogs: logsData || [],
        backups: backupsData || [],
        isOnline: isOnlineState,
        lastSyncedAt: syncTime,
        pendingCacheSync: pendingCount
      })
    } catch (err) {
      console.error('Failed to load all data from SQLite:', err)
    }
  },

  setRole: (role) => set({ currentRole: role }),

  setShowConnectionsModal: (show) => set({ showConnectionsModal: show }),

  setShowSettingsModal: (show) => set({ showSettingsModal: show }),

  toggleOnline: async () => {
    const nextOnline = !get().isOnline
    set({ isOnline: nextOnline })
    if (window.api && window.api.sync) {
      try {
        await window.api.sync.toggleOnline(nextOnline)
      } catch (err) {
        console.warn('Failed to toggle sync status:', err)
      }
    }
  },

  triggerBackup: async () => {
    if (window.api && window.api.backups) {
      await window.api.backups.trigger()
      await get().loadAllData()
    }
  },

  addUser: async (userData) => {
    if (window.api && window.api.auth) {
      await window.api.auth.register(userData)
      await get().loadAllData()
    }
  },

  updateUserStatus: async (id, status) => {
    if (window.api && window.api.users) {
      await window.api.users.updateStatus(id, status)
      await get().loadAllData()
    }
  },

  addPatient: async (patientData) => {
    const count = get().patients.length + 1
    const newPat: Patient = {
      ...patientData,
      id: `pat-${Date.now()}`,
      patientCode: `PAT-2026-${String(count).padStart(3, '0')}`,
      status: 'Waiting',
      queueNumber: `A-${String(count).padStart(3, '0')}`,
      arrivalTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    if (window.api && window.api.patients) {
      await window.api.patients.create(newPat)
      await get().loadAllData()
    }
    return newPat
  },

  updatePatientStatus: async (id, status) => {
    if (window.api && window.api.patients) {
      await window.api.patients.updateStatus(id, status)
      await get().loadAllData()
    }
  },

  addAppointment: async (appData) => {
    const newApp: Appointment = {
      ...appData,
      id: `app-${Date.now()}`,
      status: 'Confirmed'
    }
    if (window.api && window.api.appointments) {
      await window.api.appointments.create(newApp)
      await get().loadAllData()
    }
  },

  cancelAppointment: async (id) => {
    if (window.api && window.api.appointments) {
      await window.api.appointments.updateStatus(id, 'Cancelled')
      await get().loadAllData()
    }
  },

  addVitals: async (vitalsData) => {
    const newVit: VitalsRecord = {
      ...vitalsData,
      id: `vit-${Date.now()}`,
      timestamp: new Date().toLocaleString()
    }
    if (window.api && window.api.vitals) {
      await window.api.vitals.create(newVit)
      if (window.api.patients) {
        await window.api.patients.updateStatus(vitalsData.patientId, 'Vitals Taken')
      }
      await get().loadAllData()
    }
  },

  toggleCareTaskStatus: async (id) => {
    if (window.api && window.api.careTasks) {
      await window.api.careTasks.toggleStatus(id)
      await get().loadAllData()
    }
  },

  addConsultation: async (consData) => {
    const newCons: ConsultationRecord = {
      ...consData,
      id: `cons-${Date.now()}`,
      date: new Date().toLocaleString()
    }
    if (window.api && window.api.consultations) {
      await window.api.consultations.create(newCons)
      if (window.api.patients) {
        await window.api.patients.updateStatus(consData.patientId, 'Pharmacy Pending')
      }
      await get().loadAllData()
    }
  },

  updateLabRequestStatus: async (id, status, results) => {
    if (window.api && window.api.lab) {
      await window.api.lab.updateStatus(id, status, results, status === 'Completed' ? 'Tech. Lab' : undefined)
      await get().loadAllData()
    }
  },

  dispensePrescription: async (id) => {
    if (window.api && window.api.prescriptions) {
      await window.api.prescriptions.updateStatus(id, 'Dispensed')
      await get().loadAllData()
    }
  },

  addStockItem: async (itemData) => {
    const newItem: StockItem = {
      ...itemData,
      id: `stk-${Date.now()}`,
      status: itemData.stockQuantity <= 0 ? 'Out of Stock' : itemData.stockQuantity <= itemData.minQuantity ? 'Low Stock' : 'Normal'
    }
    if (window.api && window.api.inventory) {
      await window.api.inventory.create(newItem)
      await get().loadAllData()
    }
  },

  createPurchaseOrder: async (poData) => {
    if (window.api && window.api.purchaseOrders) {
      await window.api.purchaseOrders.create(poData)
      await get().loadAllData()
    }
  },

  addInvoice: async (invoiceData) => {
    const newInv: Invoice = {
      ...invoiceData,
      id: `inv-${Date.now()}`,
      invoiceCode: `FAC-2026-${String(Math.floor(1000 + Math.random() * 9000))}`,
      status: 'Unpaid',
      date: new Date().toISOString().slice(0, 10) + ' ' + new Date().toTimeString().slice(0, 5)
    }
    if (window.api && window.api.invoices) {
      await window.api.invoices.create(newInv)
      await get().loadAllData()
    }
  },

  payInvoice: async (id, method) => {
    if (window.api && window.api.invoices) {
      await window.api.invoices.pay(id, method)
      await get().loadAllData()
    }
  },

  closeDailyRegister: () => {
    set((state) => ({
      dailyClosure: { ...state.dailyClosure, status: 'Closed' }
    }))
  }
}))

if (window.electron && window.electron.ipcRenderer) {
  window.electron.ipcRenderer.on(
    'sync:status-changed',
    (
      _,
      status: {
        isOnline: boolean
        lastSyncedAt: string
        pendingCacheSync: number
      }
    ) => {
      useHospitalStore.setState({
        isOnline: status.isOnline,
        lastSyncedAt: status.lastSyncedAt,
        pendingCacheSync: status.pendingCacheSync
      })
    }
  )

  window.electron.ipcRenderer.on('sync:data-updated', () => {
    useHospitalStore.getState().loadAllData()
  })
}
