import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer accessing better-sqlite3 via IPC
const api = {
  auth: {
    login: (credentials: { username: string; password: string }) => ipcRenderer.invoke('auth:login', credentials),
    register: (userData: any) => ipcRenderer.invoke('auth:register', userData),
    getCurrentUser: () => ipcRenderer.invoke('auth:getCurrentUser'),
    logout: () => ipcRenderer.invoke('auth:logout')
  },
  users: {
    getAll: () => ipcRenderer.invoke('users:getAll'),
    updateStatus: (id: string, status: string) => ipcRenderer.invoke('users:updateStatus', { id, status })
  },
  patients: {
    getAll: () => ipcRenderer.invoke('patients:getAll'),
    create: (patientData: any) => ipcRenderer.invoke('patients:create', patientData),
    updateStatus: (id: string, status: string) => ipcRenderer.invoke('patients:updateStatus', { id, status })
  },
  vitals: {
    getAll: () => ipcRenderer.invoke('vitals:getAll'),
    create: (vitalsData: any) => ipcRenderer.invoke('vitals:create', vitalsData)
  },
  careTasks: {
    getAll: () => ipcRenderer.invoke('careTasks:getAll'),
    toggleStatus: (id: string) => ipcRenderer.invoke('careTasks:toggleStatus', id)
  },
  consultations: {
    getAll: () => ipcRenderer.invoke('consultations:getAll'),
    create: (consData: any) => ipcRenderer.invoke('consultations:create', consData)
  },
  lab: {
    getAll: () => ipcRenderer.invoke('lab:getAll'),
    create: (labData: any) => ipcRenderer.invoke('lab:create', labData),
    updateStatus: (id: string, status: string, results?: any[], validatedBy?: string) =>
      ipcRenderer.invoke('lab:updateStatus', { id, status, results, validatedBy })
  },
  prescriptions: {
    getAll: () => ipcRenderer.invoke('prescriptions:getAll'),
    create: (prescData: any) => ipcRenderer.invoke('prescriptions:create', prescData),
    updateStatus: (id: string, status: string) => ipcRenderer.invoke('prescriptions:updateStatus', { id, status })
  },
  inventory: {
    getAll: () => ipcRenderer.invoke('inventory:getAll'),
    create: (itemData: any) => ipcRenderer.invoke('inventory:create', itemData),
    updateStock: (id: string, newQuantity: number) => ipcRenderer.invoke('inventory:updateStock', { id, newQuantity })
  },
  purchaseOrders: {
    getAll: () => ipcRenderer.invoke('purchaseOrders:getAll'),
    create: (poData: any) => ipcRenderer.invoke('purchaseOrders:create', poData)
  },
  appointments: {
    getAll: () => ipcRenderer.invoke('appointments:getAll'),
    create: (appData: any) => ipcRenderer.invoke('appointments:create', appData),
    updateStatus: (id: string, status: string) => ipcRenderer.invoke('appointments:updateStatus', { id, status })
  },
  invoices: {
    getAll: () => ipcRenderer.invoke('invoices:getAll'),
    create: (invoiceData: any) => ipcRenderer.invoke('invoices:create', invoiceData),
    pay: (id: string, paymentMethod: string) => ipcRenderer.invoke('invoices:pay', { id, paymentMethod })
  },
  logs: {
    getAll: () => ipcRenderer.invoke('logs:getAll')
  },
  backups: {
    getAll: () => ipcRenderer.invoke('backups:getAll'),
    trigger: () => ipcRenderer.invoke('backups:trigger')
  },
  sync: {
    getStatus: () => ipcRenderer.invoke('sync:getStatus'),
    toggleOnline: (online: boolean) => ipcRenderer.invoke('sync:toggleOnline', online),
    triggerDeltas: () => ipcRenderer.invoke('sync:triggerDeltas'),
    getServerConfig: () => ipcRenderer.invoke('sync:getServerConfig'),
    updateServerConfig: (config: { host: string; port: string }) => ipcRenderer.invoke('sync:updateServerConfig', config),
    testConnection: (config: { host: string; port: string }) => ipcRenderer.invoke('sync:testConnection', config)
  },
  discovery: {
    discover: (timeoutMs?: number) => ipcRenderer.invoke('discovery:discover', timeoutMs),
    scanSubnet: () => ipcRenderer.invoke('discovery:scanSubnet')
  },
  terminalLog: (message: string, data?: any) => ipcRenderer.send('terminal:log', message, data),
  windowControls: {
    isMac: process.platform === 'darwin',
    minimize: () => ipcRenderer.invoke('window:minimize'),
    maximize: () => ipcRenderer.invoke('window:maximize'),
    close: () => ipcRenderer.invoke('window:close'),
    isMaximized: () => ipcRenderer.invoke('window:isMaximized'),
    onMaximizedStateChange: (callback: (maximized: boolean) => void) => {
      const subscription = (_: any, state: boolean) => callback(state)
      ipcRenderer.on('window:maximized-state', subscription)
      return () => {
        ipcRenderer.off('window:maximized-state', subscription)
      }
    }
  }
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore
  window.electron = electronAPI
  // @ts-ignore
  window.api = api
}
