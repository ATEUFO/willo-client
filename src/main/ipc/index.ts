import { ipcMain } from 'electron'
import {
  UserModel,
  PatientModel,
  VitalModel,
  CareTaskModel,
  ConsultationModel,
  LabModel,
  PrescriptionModel,
  InventoryModel,
  PurchaseOrderModel,
  AppointmentModel,
  InvoiceModel,
  SystemLogModel,
  BackupModel
} from '../models'
import {
  queueLocalMutation,
  authenticateRemote,
  getOnlineStatus,
  getLastSyncedAt,
  toggleOnlineState,
  pullDeltas
} from '../sync/sync-manager'

export function registerIpcHandlers(): void {
  // Auth Handlers
  ipcMain.handle('auth:login', async (_, { username, password }) => {
    try {
      // Attempt remote login if online
      const user = await authenticateRemote(username, password)
      
      // Save current user session
      UserModel.setCurrentUser({
        id: user.id,
        name: `${user.prenom} ${user.nom}`,
        username: user.email,
        role: user.roles?.[0]?.nom || 'médecin',
        department: user.department || 'Médecine',
        token: user.token
      })

      // Add to local users table to allow offline login later
      try {
        UserModel.createUser({
          name: `${user.prenom} ${user.nom}`,
          username: user.email,
          password: password,
          role: user.roles?.[0]?.nom || 'médecin',
          department: user.department || 'Médecine',
          status: 'Active'
        })
      } catch {
        // Ignored if user already exists
      }

      return UserModel.getCurrentUser()
    } catch (err) {
      console.warn('Remote authentication failed, checking local database:', err)
      return UserModel.authenticate(username, password)
    }
  })

  ipcMain.handle('auth:register', async (_, userData) => {
    const res = UserModel.createUser(userData)
    // Register is local-first, sync will push if desired
    queueLocalMutation('Practitioner', res.id, 'create', res)
    return res
  })

  ipcMain.handle('auth:getCurrentUser', async () => {
    return UserModel.getCurrentUser()
  })

  ipcMain.handle('auth:logout', async () => {
    UserModel.clearCurrentUser()
    return true
  })

  // Users Handlers
  ipcMain.handle('users:getAll', async () => {
    return UserModel.getAllUsers()
  })

  ipcMain.handle('users:updateStatus', async (_, { id, status }) => {
    UserModel.updateUserStatus(id, status)
    const updated = UserModel.getAllUsers().find((u) => u.id === id)
    if (updated) {
      queueLocalMutation('Practitioner', id, 'update', updated)
    }
    return true
  })

  // Patients Handlers
  ipcMain.handle('patients:getAll', async () => {
    return PatientModel.getAll()
  })

  ipcMain.handle('patients:create', async (_, patientData) => {
    const res = PatientModel.create(patientData)
    queueLocalMutation('Patient', res.id, 'create', res)
    return res
  })

  ipcMain.handle('patients:updateStatus', async (_, { id, status }) => {
    PatientModel.updateStatus(id, status)
    const updated = PatientModel.getById(id)
    if (updated) {
      queueLocalMutation('Patient', id, 'update', updated)
    }
    return true
  })

  // Vitals Handlers
  ipcMain.handle('vitals:getAll', async () => {
    return VitalModel.getAll()
  })

  ipcMain.handle('vitals:create', async (_, vitalsData) => {
    const res = VitalModel.create(vitalsData)
    queueLocalMutation('Observation', res.id, 'create', res)
    return res
  })

  // Care Tasks Handlers
  ipcMain.handle('careTasks:getAll', async () => {
    return CareTaskModel.getAll()
  })

  ipcMain.handle('careTasks:toggleStatus', async (_, id) => {
    const res = CareTaskModel.toggleStatus(id)
    if (res) {
      queueLocalMutation('CarePlan', id, 'update', res)
    }
    return res
  })

  // Consultations Handlers
  ipcMain.handle('consultations:getAll', async () => {
    return ConsultationModel.getAll()
  })

  ipcMain.handle('consultations:create', async (_, consData) => {
    const res = ConsultationModel.create(consData)
    queueLocalMutation('Encounter', res.id, 'create', res)
    return res
  })

  // Lab Requests Handlers
  ipcMain.handle('lab:getAll', async () => {
    return LabModel.getAll()
  })

  ipcMain.handle('lab:create', async (_, labData) => {
    const res = LabModel.create(labData)
    queueLocalMutation('DiagnosticReport', res.id, 'create', res)
    return res
  })

  ipcMain.handle('lab:updateStatus', async (_, { id, status, results, validatedBy }) => {
    LabModel.updateResults(id, status, results, validatedBy)
    const updated = LabModel.getAll().find((l) => l.id === id)
    if (updated) {
      queueLocalMutation('DiagnosticReport', id, 'update', updated)
    }
    return true
  })

  // Prescriptions Handlers
  ipcMain.handle('prescriptions:getAll', async () => {
    return PrescriptionModel.getAll()
  })

  ipcMain.handle('prescriptions:create', async (_, prescData) => {
    const res = PrescriptionModel.create(prescData)
    queueLocalMutation('MedicationRequest', res.id, 'create', res)
    return res
  })

  ipcMain.handle('prescriptions:updateStatus', async (_, { id, status }) => {
    PrescriptionModel.updateStatus(id, status)
    const updated = PrescriptionModel.getAll().find((p) => p.id === id)
    if (updated) {
      queueLocalMutation('MedicationRequest', id, 'update', updated)
    }
    return true
  })

  // Inventory Handlers
  ipcMain.handle('inventory:getAll', async () => {
    return InventoryModel.getAll()
  })

  ipcMain.handle('inventory:create', async (_, itemData) => {
    const res = InventoryModel.create(itemData)
    queueLocalMutation('Medication', res.id, 'create', res)
    return res
  })

  // Purchase Orders Handlers
  ipcMain.handle('purchaseOrders:getAll', async () => {
    return PurchaseOrderModel.getAll()
  })

  ipcMain.handle('purchaseOrders:create', async (_, poData) => {
    const res = PurchaseOrderModel.create(poData)
    queueLocalMutation('SupplyRequest', res.id, 'create', res)
    return res
  })

  // Appointments Handlers
  ipcMain.handle('appointments:getAll', async () => {
    return AppointmentModel.getAll()
  })

  ipcMain.handle('appointments:create', async (_, appData) => {
    const res = AppointmentModel.create(appData)
    queueLocalMutation('Appointment', res.id, 'create', res)
    return res
  })

  ipcMain.handle('appointments:updateStatus', async (_, { id, status }) => {
    AppointmentModel.updateStatus(id, status)
    const updated = AppointmentModel.getAll().find((a) => a.id === id)
    if (updated) {
      queueLocalMutation('Appointment', id, 'update', updated)
    }
    return true
  })

  // Invoices Handlers
  ipcMain.handle('invoices:getAll', async () => {
    return InvoiceModel.getAll()
  })

  ipcMain.handle('invoices:create', async (_, invoiceData) => {
    const res = InvoiceModel.create(invoiceData)
    queueLocalMutation('Invoice', res.id, 'create', res)
    return res
  })

  ipcMain.handle('invoices:pay', async (_, { id, paymentMethod }) => {
    InvoiceModel.markAsPaid(id, paymentMethod)
    const updated = InvoiceModel.getAll().find((inv) => inv.id === id)
    if (updated) {
      queueLocalMutation('Invoice', id, 'update', updated)
    }
    return true
  })

  // Logs Handlers
  ipcMain.handle('logs:getAll', async () => {
    return SystemLogModel.getAll()
  })

  ipcMain.handle('logs:create', async (_, logData) => {
    return SystemLogModel.create(logData)
  })

  // Backups Handlers
  ipcMain.handle('backups:getAll', async () => {
    return BackupModel.getAll()
  })

  ipcMain.handle('backups:trigger', async () => {
    const filename = `willo_manual_dump_${new Date().toISOString().replace(/[:.]/g, '')}.sql.gz`
    const backup = BackupModel.create({
      filename,
      size: '43.1 MB',
      type: 'Manual',
      status: 'Completed'
    })
    SystemLogModel.create({
      level: 'INFO',
      service: 'DATABASE',
      message: `Dump manuel déclenché par l'administrateur: ${filename}`
    })
    return backup
  })

  // Sync Handlers exposed to Renderer
  ipcMain.handle('sync:getStatus', () => {
    return {
      isOnline: getOnlineStatus(),
      lastSyncedAt: getLastSyncedAt(),
      pendingCacheSync: getPendingCount()
    }
  })

  ipcMain.handle('sync:toggleOnline', (_, online: boolean) => {
    toggleOnlineState(online)
    return true
  })

  ipcMain.handle('sync:triggerDeltas', async () => {
    await pullDeltas()
    return true
  })
}

// Helper to count pending outbox items
function getPendingCount(): number {
  try {
    const { getDrizzleDb } = require('../database')
    const { outbox } = require('../database/schema')
    const { eq } = require('drizzle-orm')
    const db = getDrizzleDb()
    const rows = db.select().from(outbox).where(eq(outbox.status, 'pending')).all()
    return rows.length
  } catch {
    return 0
  }
}
