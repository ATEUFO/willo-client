import { ipcMain, BrowserWindow, dialog, app } from 'electron'
import os from 'node:os'
import fs from 'node:fs'
import path from 'node:path'
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
  BackupModel,
  hashPassword
} from '../models'
import { getDrizzleDb, getDatabasePath } from '../database'
import { users } from '../database/schema'
import { eq } from 'drizzle-orm'
import {
  queueLocalMutation,
  authenticateRemote,
  getOnlineStatus,
  getLastSyncedAt,
  toggleOnlineState,
  pullDeltas,
  getServerConfig,
  updateServerConfig,
  testServerConnection,
  getPendingCount
} from '../sync/sync-manager'
import { discoverServers } from '../discovery/find-server'
import { scanSubnetForServer } from '../discovery/subnet-scan'

export function registerIpcHandlers(): void {
  // Ensure default demo test users are present & all stored passwords are hashed
  UserModel.seedDefaultUsers()

  // System Metrics Handler (real CPU, RAM, database cache size, connected session user)
  ipcMain.handle('system:getMetrics', async () => {
    const totalMem = os.totalmem()
    const freeMem = os.freemem()
    const usedMem = Math.max(0, totalMem - freeMem)
    const ramPercent = Math.round((usedMem / totalMem) * 100)
    const usedRamGB = (usedMem / (1024 * 1024 * 1024)).toFixed(1)
    const totalRamGB = (totalMem / (1024 * 1024 * 1024)).toFixed(1)

    // Calculate CPU usage percentage
    const cpus = os.cpus()
    let idleSum = 0
    let totalSum = 0
    for (const cpu of cpus) {
      for (const type in cpu.times) {
        totalSum += cpu.times[type as keyof typeof cpu.times]
      }
      idleSum += cpu.times.idle
    }
    const cpuPercent = totalSum > 0 ? Math.min(100, Math.max(1, Math.round(100 - (idleSum / totalSum) * 100))) : 15

    // Get SQLite DB file size
    let dbSizeMB = '0 MB'
    try {
      const dbPath = getDatabasePath()
      if (fs.existsSync(dbPath)) {
        const bytes = fs.statSync(dbPath).size
        dbSizeMB = (bytes / (1024 * 1024)).toFixed(1) + ' MB'
      }
    } catch {}

    const currentSession = UserModel.getCurrentUser()
    const allUsers = UserModel.getAllUsers()
    const activeUsersCount = allUsers.filter((u) => u.status === 'Active').length

    return {
      cpuPercent,
      ramPercent,
      usedRamGB,
      totalRamGB,
      dbSizeMB,
      connectedCount: currentSession ? 1 : 0,
      currentSessionUser: currentSession ? currentSession.name : null,
      totalUsers: allUsers.length,
      activeUsers: activeUsersCount,
      uptimeSeconds: Math.floor(process.uptime())
    }
  })

  // Terminal Logger handler for forwarding renderer logs to main process terminal
  ipcMain.on('terminal:log', (_, message: string, data?: any) => {
    if (data !== undefined) {
      console.log(message, typeof data === 'object' ? JSON.stringify(data, null, 2) : data)
    } else {
      console.log(message)
    }
  })

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
        // If user already exists, update local hashed password to match latest remote login password
        const existing = UserModel.getUserByUsername(user.email)
        if (existing) {
          const hashedPassword = hashPassword(password)
          const db = getDrizzleDb()
          db.update(users)
            .set({ password: hashedPassword })
            .where(eq(users.id, existing.id))
            .run()
        }
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
    let sizeStr = '43.1 MB'
    try {
      const dbPath = getDatabasePath()
      if (fs.existsSync(dbPath)) {
        const bytes = fs.statSync(dbPath).size
        sizeStr = (bytes / (1024 * 1024)).toFixed(1) + ' MB'
      }
    } catch {}

    const filename = `willo_manual_dump_${new Date().toISOString().replace(/[:.]/g, '')}.sql.gz`
    const backup = BackupModel.create({
      filename,
      size: sizeStr,
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

  ipcMain.handle('backups:download', async (_, backupId: string) => {
    const backupList = BackupModel.getAll()
    const backup = backupList.find((b) => b.id === backupId)
    const filename = backup ? backup.filename : `willo_db_dump_${Date.now()}.sql`

    const win = BrowserWindow.getFocusedWindow() || BrowserWindow.getAllWindows()[0]
    const { filePath, canceled } = await dialog.showSaveDialog(win, {
      title: 'Enregistrer la sauvegarde de la base de données',
      defaultPath: path.join(app.getPath('downloads'), filename),
      filters: [
        { name: 'Fichier Dump / Base de Données', extensions: ['sql', 'gz', 'db'] },
        { name: 'Tous les fichiers', extensions: ['*'] }
      ]
    })

    if (canceled || !filePath) {
      return { success: false, canceled: true }
    }

    try {
      const dbPath = getDatabasePath()
      if (fs.existsSync(dbPath)) {
        fs.copyFileSync(dbPath, filePath)
      } else {
        const dumpContent = `-- WILLO DATABASE DUMP\n-- Exported At: ${new Date().toISOString()}\n`
        fs.writeFileSync(filePath, dumpContent, 'utf-8')
      }

      SystemLogModel.create({
        level: 'INFO',
        service: 'DATABASE',
        message: `Sauvegarde ${filename} téléchargée et enregistrée sous: ${filePath}`
      })

      return { success: true, filePath }
    } catch (err) {
      console.error('Backup download export error:', err)
      throw err
    }
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

  ipcMain.handle('sync:getServerConfig', () => {
    return getServerConfig()
  })

  ipcMain.handle('sync:updateServerConfig', (_, { host, port }) => {
    updateServerConfig(host, port)
    return true
  })

  ipcMain.handle('sync:testConnection', async (_, { host, port }) => {
    return testServerConnection(host, port)
  })

  ipcMain.handle('discovery:discover', async (_, timeoutMs?: number) => {
    return discoverServers(timeoutMs)
  })

  ipcMain.handle('discovery:scanSubnet', async () => {
    return scanSubnetForServer()
  })

  // Window Control Handlers
  ipcMain.handle('window:minimize', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (win) win.minimize()
  })

  ipcMain.handle('window:maximize', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (win) {
      if (win.isMaximized()) {
        win.unmaximize()
      } else {
        win.maximize()
      }
      return win.isMaximized()
    }
    return false
  })

  ipcMain.handle('window:close', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (win) win.close()
  })

  ipcMain.handle('window:isMaximized', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    return win ? win.isMaximized() : false
  })
}
