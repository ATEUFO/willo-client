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

export function registerIpcHandlers(): void {
  // Auth Handlers
  ipcMain.handle('auth:login', async (_, { username, password }) => {
    return UserModel.authenticate(username, password)
  })

  ipcMain.handle('auth:register', async (_, userData) => {
    return UserModel.createUser(userData)
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
    return true
  })

  // Patients Handlers
  ipcMain.handle('patients:getAll', async () => {
    return PatientModel.getAll()
  })

  ipcMain.handle('patients:create', async (_, patientData) => {
    return PatientModel.create(patientData)
  })

  ipcMain.handle('patients:updateStatus', async (_, { id, status }) => {
    PatientModel.updateStatus(id, status)
    return true
  })

  // Vitals Handlers
  ipcMain.handle('vitals:getAll', async () => {
    return VitalModel.getAll()
  })

  ipcMain.handle('vitals:create', async (_, vitalsData) => {
    return VitalModel.create(vitalsData)
  })

  // Care Tasks Handlers
  ipcMain.handle('careTasks:getAll', async () => {
    return CareTaskModel.getAll()
  })

  ipcMain.handle('careTasks:toggleStatus', async (_, id) => {
    return CareTaskModel.toggleStatus(id)
  })

  // Consultations Handlers
  ipcMain.handle('consultations:getAll', async () => {
    return ConsultationModel.getAll()
  })

  ipcMain.handle('consultations:create', async (_, consData) => {
    return ConsultationModel.create(consData)
  })

  // Lab Requests Handlers
  ipcMain.handle('lab:getAll', async () => {
    return LabModel.getAll()
  })

  ipcMain.handle('lab:create', async (_, labData) => {
    return LabModel.create(labData)
  })

  ipcMain.handle('lab:updateStatus', async (_, { id, status, results, validatedBy }) => {
    LabModel.updateResults(id, status, results, validatedBy)
    return true
  })

  // Prescriptions Handlers
  ipcMain.handle('prescriptions:getAll', async () => {
    return PrescriptionModel.getAll()
  })

  ipcMain.handle('prescriptions:create', async (_, prescData) => {
    return PrescriptionModel.create(prescData)
  })

  ipcMain.handle('prescriptions:updateStatus', async (_, { id, status }) => {
    PrescriptionModel.updateStatus(id, status)
    return true
  })

  // Inventory Handlers
  ipcMain.handle('inventory:getAll', async () => {
    return InventoryModel.getAll()
  })

  ipcMain.handle('inventory:create', async (_, itemData) => {
    return InventoryModel.create(itemData)
  })

  ipcMain.handle('inventory:updateStock', async (_, { id, newQuantity }) => {
    InventoryModel.updateStock(id, newQuantity)
    return true
  })

  // Purchase Orders Handlers
  ipcMain.handle('purchaseOrders:getAll', async () => {
    return PurchaseOrderModel.getAll()
  })

  ipcMain.handle('purchaseOrders:create', async (_, poData) => {
    return PurchaseOrderModel.create(poData)
  })

  // Appointments Handlers
  ipcMain.handle('appointments:getAll', async () => {
    return AppointmentModel.getAll()
  })

  ipcMain.handle('appointments:create', async (_, appData) => {
    return AppointmentModel.create(appData)
  })

  ipcMain.handle('appointments:updateStatus', async (_, { id, status }) => {
    AppointmentModel.updateStatus(id, status)
    return true
  })

  // Invoices Handlers
  ipcMain.handle('invoices:getAll', async () => {
    return InvoiceModel.getAll()
  })

  ipcMain.handle('invoices:create', async (_, invoiceData) => {
    return InvoiceModel.create(invoiceData)
  })

  ipcMain.handle('invoices:pay', async (_, { id, paymentMethod }) => {
    InvoiceModel.markAsPaid(id, paymentMethod)
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
}
