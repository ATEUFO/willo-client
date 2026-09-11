import { ElectronAPI } from '@electron-toolkit/preload'

export interface WilloAPI {
  auth: {
    login: (credentials: { username: string; password: string }) => Promise<any>
    register: (userData: any) => Promise<any>
    getCurrentUser: () => Promise<any>
    logout: () => Promise<boolean>
  }
  users: {
    getAll: () => Promise<any[]>
    updateStatus: (id: string, status: string) => Promise<boolean>
  }
  patients: {
    getAll: () => Promise<any[]>
    create: (patientData: any) => Promise<any>
    updateStatus: (id: string, status: string) => Promise<boolean>
  }
  vitals: {
    getAll: () => Promise<any[]>
    create: (vitalsData: any) => Promise<any>
  }
  careTasks: {
    getAll: () => Promise<any[]>
    toggleStatus: (id: string) => Promise<any>
  }
  consultations: {
    getAll: () => Promise<any[]>
    create: (consData: any) => Promise<any>
  }
  lab: {
    getAll: () => Promise<any[]>
    create: (labData: any) => Promise<any>
    updateStatus: (id: string, status: string, results?: any[], validatedBy?: string) => Promise<boolean>
  }
  prescriptions: {
    getAll: () => Promise<any[]>
    create: (prescData: any) => Promise<any>
    updateStatus: (id: string, status: string) => Promise<boolean>
  }
  inventory: {
    getAll: () => Promise<any[]>
    create: (itemData: any) => Promise<any>
    updateStock: (id: string, newQuantity: number) => Promise<boolean>
  }
  purchaseOrders: {
    getAll: () => Promise<any[]>
    create: (poData: any) => Promise<any>
  }
  appointments: {
    getAll: () => Promise<any[]>
    create: (appData: any) => Promise<any>
    updateStatus: (id: string, status: string) => Promise<boolean>
  }
  invoices: {
    getAll: () => Promise<any[]>
    create: (invoiceData: any) => Promise<any>
    pay: (id: string, paymentMethod: string) => Promise<boolean>
  }
  logs: {
    getAll: () => Promise<any[]>
  }
  backups: {
    getAll: () => Promise<any[]>
    trigger: () => Promise<any>
    download: (id: string) => Promise<{ success: boolean; filePath?: string; canceled?: boolean }>
  }
  system: {
    getMetrics: () => Promise<{
      cpuPercent: number
      ramPercent: number
      usedRamGB: string
      totalRamGB: string
      dbSizeMB: string
      connectedCount: number
      currentSessionUser: string | null
      totalUsers: number
      activeUsers: number
      uptimeSeconds: number
    }>
  }
  sync: {
    getStatus: () => Promise<{ isOnline: boolean; lastSyncedAt: string; pendingCacheSync: number }>
    toggleOnline: (online: boolean) => Promise<boolean>
    triggerDeltas: () => Promise<boolean>
    getServerConfig: () => Promise<{ host: string; port: string; posteId: string }>
    updateServerConfig: (config: { host: string; port: string }) => Promise<boolean>
    testConnection: (config: { host: string; port: string }) => Promise<{ success: boolean; siteName?: string; error?: string }>
    autoDiscover: () => Promise<boolean>
  }
  discovery: {
    discover: (timeoutMs?: number) => Promise<Array<{ name: string; host: string; port: number; caFingerprint: string }>>
    scanSubnet: () => Promise<Array<{ name: string; host: string; port: number; caFingerprint: string }>>
  }
  outbox: {
    getMutations: () => Promise<Array<{
      id: string
      resourceType: string
      resourceId: string
      action: string
      payload: string
      status: 'pending' | 'sent' | 'failed' | 'conflict'
      errorMessage?: string
      createdAt: string
    }>>
    deleteMutation: (id: string) => Promise<boolean>
    retryMutation: (id: string) => Promise<boolean>
    resolveConflict: (id: string, resolution: 'force_client' | 'accept_server') => Promise<boolean>
    clearSent: () => Promise<boolean>
  }
  ai: {
    checkHealth: () => Promise<any>
    getModels: () => Promise<any[]>
    predict: (payload: any) => Promise<any>
  }
  terminalLog: (message: string, data?: any) => void
  windowControls: {
    isMac: boolean
    minimize: () => Promise<void>
    maximize: () => Promise<boolean>
    close: () => Promise<void>
    isMaximized: () => Promise<boolean>
    onMaximizedStateChange: (callback: (maximized: boolean) => void) => () => void
  }
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: WilloAPI
  }
}
