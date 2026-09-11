import axios from 'axios'
import Store from 'electron-store'
import crypto from 'node:crypto'
import { eq, and, asc } from 'drizzle-orm'
import { getDrizzleDb } from '../database'
import {
  patients,
  vitals,
  careTasks,
  consultations,
  labRequests,
  prescriptions,
  inventory,
  purchaseOrders,
  appointments,
  invoices,
  outbox
} from '../database/schema'
import { UserModel } from '../models/user.model'
import { BrowserWindow } from 'electron'
import { discoverServers } from '../discovery/find-server'
import { scanSubnetForServer } from '../discovery/subnet-scan'

// Global HTTP Request/Response Debug Interceptors
axios.interceptors.request.use((config) => {
  const method = (config.method || 'GET').toUpperCase()
  const url = config.url || ''
  console.log(`📡 [HTTP REQUEST] ${method} ${url}`, config.data ? { payload: config.data } : '')
  ;(config as any).meta = { startTime: performance.now() }
  return config
}, (error) => {
  console.error(`❌ [HTTP REQUEST ERROR]`, error)
  return Promise.reject(error)
})

axios.interceptors.response.use((response) => {
  const startTime = (response.config as any).meta?.startTime || performance.now()
  const latency = Math.round(performance.now() - startTime)
  const method = (response.config.method || 'GET').toUpperCase()
  const url = response.config.url || ''
  console.log(`✅ [HTTP RESPONSE ${response.status}] ${method} ${url} (${latency}ms)`, response.data)
  return response
}, (error) => {
  const config = error.config || {}
  const startTime = (config as any).meta?.startTime || performance.now()
  const latency = Math.round(performance.now() - startTime)
  const method = (config.method || 'GET').toUpperCase()
  const url = config.url || ''
  const status = error.response?.status ? `HTTP ${error.response.status}` : 'NETWORK_ERROR'
  console.error(`❌ [HTTP RESPONSE ERROR - ${status}] ${method} ${url} (${latency}ms):`, error.response?.data || error.message)
  return Promise.reject(error)
})

const store = new Store()

let accessToken: string | null = null
let refreshToken: string | null = null
let isOnline: boolean = true
let lastSyncedAt: string = (store.get('lastSyncedAt') as string) || ''
let websocket: WebSocket | null = null
let reconnectTimer: NodeJS.Timeout | null = null
let reconnectDelay = 1000
let flushTimer: NodeJS.Timeout | null = null

// Dynamic server settings loaded from electron-store, falling back to process.env or defaults
let serverHost: string = (store.get('serverHost') as string) || process.env.SERVER_HOST || '127.0.0.1'
let serverPort: string = (store.get('serverPort') as string) || process.env.SERVER_PORT || '5030'
let serverBaseUrl = `http://${serverHost}:${serverPort}`

// Generate or retrieve unique posteId for workstation identification/traceability
let posteId: string = (store.get('posteId') as string) || ''
if (!posteId) {
  posteId = crypto.randomUUID()
  store.set('posteId', posteId)
}

export function getServerConfig() {
  return {
    host: serverHost,
    port: serverPort,
    posteId
  }
}

export function updateServerConfig(host: string, port: string): void {
  serverHost = host
  serverPort = port
  serverBaseUrl = `http://${host}:${port}`
  store.set('serverHost', host)
  store.set('serverPort', port)

  console.log(`⚙️ Server config updated dynamically to: ${serverBaseUrl}`)

  // Reconnect WebSocket to the new address if we are online
  if (isOnline) {
    connectWebSocket()
  }
  broadcastSyncStatus()
}

export async function testServerConnection(host: string, port: string): Promise<{ success: boolean; siteName?: string; error?: string }> {
  try {
    const response = await axios.get(`http://${host}:${port}/discovery`, { timeout: 2000 })
    if (response.data && response.data.service === 'willo-server') {
      return { success: true, siteName: response.data.siteName || 'Willo Server' }
    }
    return { success: false, error: 'Réponse invalide du serveur (non-Willo)' }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return { success: false, error: `Erreur de connexion: ${msg}` }
  }
}

// Map FHIR resource types to their Drizzle table schema objects
const TABLE_MAPPING: Record<string, any> = {
  Patient: patients,
  Observation: vitals,
  CarePlan: careTasks,
  Encounter: consultations,
  DiagnosticReport: labRequests,
  MedicationRequest: prescriptions,
  Medication: inventory,
  SupplyRequest: purchaseOrders,
  Appointment: appointments,
  Invoice: invoices
}

// Convert a DB row to a FHIR-like resource JSON payload for the server
function mapRowToResource(resourceType: string, row: any): any {
  const resource: any = {
    resourceType,
    id: row.id,
    status: row.status
  }

  // Set FHIR-specific indexes
  if (row.patientId) {
    resource.patientId = row.patientId
  }

  // Include all other columns
  Object.keys(row).forEach((key) => {
    if (key !== 'id' && key !== 'status' && key !== 'patientId') {
      let value = row[key]
      // Detect and parse JSON strings so the server receives actual JSON
      if (typeof value === 'string' && (value.startsWith('[') || value.startsWith('{'))) {
        try {
          value = JSON.parse(value)
        } catch {
          // Keep string if it's not valid JSON
        }
      }
      resource[key] = value
    }
  })

  return resource
}

// Map incoming FHIR resource properties back to SQLite schema values
function mapResourceToRow(_resourceType: string, resource: any): any {
  const row: any = {
    id: resource.id,
    status: resource.status
  }

  if (resource.patientId) {
    row.patientId = resource.patientId
  }

  // Drizzle schemas define camelCase keys. We extract other keys from resource.
  Object.keys(resource).forEach((key) => {
    if (key !== 'resourceType' && key !== 'id' && key !== 'status' && key !== 'patientId' && key !== 'meta') {
      let value = resource[key]
      if (typeof value === 'object' && value !== null) {
        value = JSON.stringify(value)
      }
      row[key] = value
    }
  })

  return row
}

// Save a synced resource into the local SQLite database
function saveResourceToLocal(resourceType: string, resource: any): void {
  const table = TABLE_MAPPING[resourceType]
  if (!table) return

  const db = getDrizzleDb()
  const rowValues = mapResourceToRow(resourceType, resource)

  db.insert(table)
    .values(rowValues)
    .onConflictDoUpdate({
      target: table.id,
      set: rowValues
    })
    .run()
}

// Notify all windows in the Electron process of sync status updates
function broadcastSyncStatus() {
  const payload = {
    isOnline,
    lastSyncedAt,
    pendingCacheSync: getPendingCount()
  }
  BrowserWindow.getAllWindows().forEach((win) => {
    win.webContents.send('sync:status-changed', payload)
  })
}

// Check count of pending mutations in the outbox
export function getPendingCount(): number {
  try {
    const db = getDrizzleDb()
    const rows = db.select({ id: outbox.id }).from(outbox).where(eq(outbox.status, 'pending')).all()
    return rows.length
  } catch {
    return 0
  }
}

// Remote Authentication & Session refresh
export async function authenticateRemote(email: string, password: string): Promise<any> {
  try {
    const response = await axios.post(
      `${serverBaseUrl}/api/auth/login`,
      { email, password, posteId },
      { headers: { 'X-Poste-Id': posteId } }
    )
    const { tokens, user } = response.data
    accessToken = tokens.accessToken
    refreshToken = tokens.refreshToken
    
    // Save credentials securely (electron-store fallback)
    store.set('refreshToken', refreshToken)
    store.set('activeUserEmail', email)

    isOnline = true
    broadcastSyncStatus()
    
    // Trigger Sync immediately
    bootstrapSync()

    return user
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('Remote authentication failed:', message)
    throw err
  }
}

// Ensure the JWT access token is fresh before making requests
export async function ensureFreshToken(): Promise<string | null> {
  // If we already have a valid token, return it
  if (accessToken) {
    // Simple JWT expiration check (15 mins lifespan)
    try {
      const payload = JSON.parse(Buffer.from(accessToken.split('.')[1], 'base64').toString())
      const now = Date.now() / 1000
      if (payload.exp - now > 60) {
        return accessToken
      }
    } catch {
      // Fall through to refresh
    }
  }

  // Attempt token refresh
  const storedRefresh = refreshToken || (store.get('refreshToken') as string)
  if (!storedRefresh) return null

  try {
    const response = await axios.post(
      `${serverBaseUrl}/api/auth/refresh`,
      { refreshToken: storedRefresh },
      { headers: { 'X-Poste-Id': posteId } }
    )
    accessToken = response.data.accessToken
    isOnline = true
    return accessToken
  } catch (err: any) {
    const status = err.response?.status
    if (status === 401 || status === 403 || status === 404) {
      console.warn('🔑 Jeton de rafraîchissement expiré ou invalide. Réinitialisation de la session.')
      store.delete('refreshToken')
      refreshToken = null
      accessToken = null
    } else {
      const message = err instanceof Error ? err.message : String(err)
      console.warn('Session refresh network failure:', message)
    }
    isOnline = false
    broadcastSyncStatus()
    return null
  }
}

// Trigger bootstrap sync (initial rapatriation of data depending on the role)
export async function bootstrapSync(): Promise<void> {
  const token = await ensureFreshToken()
  if (!token) return

  try {
    const response = await axios.get(`${serverBaseUrl}/api/fhir/sync/bootstrap`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'X-Poste-Id': posteId
      }
    })
    const { timestamp, items } = response.data

    // Save all returned items
    const db = getDrizzleDb()
    db.transaction((tx) => {
      for (const item of items) {
        const table = TABLE_MAPPING[item.resourceType]
        if (table) {
          const rowValues = mapResourceToRow(item.resourceType, item)
          tx.insert(table)
            .values(rowValues)
            .onConflictDoUpdate({
              target: table.id,
              set: rowValues
            })
            .run()
        }
      }
    })

    lastSyncedAt = timestamp
    store.set('lastSyncedAt', lastSyncedAt)
    store.set('bootstrapped', true)
    broadcastSyncStatus()

    // Flush any pending mutations
    flushOutbox()
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('Bootstrap sync failed:', message)
  }
}

// Incremental sync (pull changes since lastSyncedAt)
export async function pullDeltas(): Promise<void> {
  const token = await ensureFreshToken()
  if (!token) return

  try {
    const user = UserModel.getCurrentUser()
    if (!user) return

    // In a production environment, scope is determined by the user's role.
    // For local sync safety, we sync all clinical resource types.
    const resourceTypes = ['Patient', 'Appointment', 'Encounter', 'Observation', 'CarePlan', 'DiagnosticReport', 'MedicationRequest', 'Medication', 'SupplyRequest', 'Invoice']
    const syncTimestamp = new Date().toISOString()

    for (const type of resourceTypes) {
      const url = lastSyncedAt 
        ? `${serverBaseUrl}/api/fhir/${type}?_lastUpdated=gt${lastSyncedAt}`
        : `${serverBaseUrl}/api/fhir/${type}`

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          'X-Poste-Id': posteId
        }
      })

      const bundle = response.data
      if (bundle && bundle.entry) {
        const db = getDrizzleDb()
        db.transaction((tx) => {
          for (const entry of bundle.entry) {
            const resource = entry.resource
            // Check if there is a pending mutation for this resource in the outbox
            const pending = tx
              .select({ id: outbox.id })
              .from(outbox)
              .where(and(eq(outbox.resourceId, resource.id), eq(outbox.status, 'pending')))
              .get()

            if (!pending) {
              const table = TABLE_MAPPING[type]
              if (table) {
                const rowValues = mapResourceToRow(type, resource)
                tx.insert(table)
                  .values(rowValues)
                  .onConflictDoUpdate({
                    target: table.id,
                    set: rowValues
                  })
                  .run()
              }
            }
          }
        })
      }
    }

    lastSyncedAt = syncTimestamp
    store.set('lastSyncedAt', lastSyncedAt)
    broadcastSyncStatus()
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('Delta sync failed:', message)
  }
}

// Queue a local mutation to the outbox
export function queueLocalMutation(resourceType: string, resourceId: string, action: string, payload: any): void {
  const db = getDrizzleDb()
  const mutationId = crypto.randomUUID()

  db.insert(outbox)
    .values({
      id: mutationId,
      resourceType,
      resourceId,
      action,
      payload: JSON.stringify(payload),
      status: 'pending'
    })
    .run()

  broadcastSyncStatus()

  // Attempt immediate flush
  flushOutbox()
}

// Flush outbox mutations to the central server
export async function flushOutbox(): Promise<void> {
  if (flushTimer) clearTimeout(flushTimer)

  const token = await ensureFreshToken()
  if (!token) {
    // Retry in 10 seconds if offline
    flushTimer = setTimeout(flushOutbox, 10000)
    return
  }

  const db = getDrizzleDb()
  const pendingMutations = db
    .select()
    .from(outbox)
    .where(eq(outbox.status, 'pending'))
    .orderBy(asc(outbox.createdAt))
    .all()

  if (pendingMutations.length === 0) return

  for (const mutation of pendingMutations) {
    try {
      const payloadObj = JSON.parse(mutation.payload)
      const resourcePayload = mapRowToResource(mutation.resourceType, payloadObj)
      
      // Include UUID for idempotency
      resourcePayload.clientMutationId = mutation.id

      await axios.post(`${serverBaseUrl}/api/fhir/${mutation.resourceType}`, resourcePayload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'X-Client-Mutation-Id': mutation.id,
          'X-Poste-Id': posteId
        }
      })

      // Mark mutation as sent
      db.update(outbox)
        .set({ status: 'sent' })
        .where(eq(outbox.id, mutation.id))
        .run()

    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      console.error(`Mutation ${mutation.id} push failed:`, message)
      const axiosError = err as { response?: { status?: number } }
      const status = axiosError.response && axiosError.response.status
      if (status === 409) {
        // Conflict - Mark as failed for manual arbitrage
        db.update(outbox)
          .set({ status: 'failed', errorMessage: 'Version Conflict (409)' })
          .where(eq(outbox.id, mutation.id))
          .run()
      } else if (status === 400) {
        // Validation error - Mark failed permanently
        db.update(outbox)
          .set({ status: 'failed', errorMessage: `Validation Error: ${message}` })
          .where(eq(outbox.id, mutation.id))
          .run()
      } else {
        // Network/Server temporary error - Keep pending and retry later
        break
      }
    }
  }

  broadcastSyncStatus()

  // Schedule next check in case more mutations are queued
  const remaining = getPendingCount()
  if (remaining > 0) {
    flushTimer = setTimeout(flushOutbox, 10000)
  }
}

// WebSocket connection and real-time subscription
export async function connectWebSocket(): Promise<void> {
  if (websocket) {
    try {
      websocket.close()
    } catch {
      // Ignored
    }
  }

  const storedRefresh = refreshToken || (store.get('refreshToken') as string)
  if (!storedRefresh) {
    // User is not authenticated yet. Reconnection will start automatically upon login.
    isOnline = false
    broadcastSyncStatus()
    return
  }

  const token = await ensureFreshToken()
  if (!token) {
    scheduleReconnect()
    return
  }

  const wsProtocol = serverBaseUrl.startsWith('https') ? 'wss:' : 'ws:'
  const wsUrl = `${wsProtocol}//${serverHost}:${serverPort}/ws/`

  console.log(`🔗 Connecting WebSocket to: ${wsUrl}`)
  const ws = new WebSocket(wsUrl)
  websocket = ws

  ws.onopen = () => {
    console.log('🔌 WebSocket Connected, sending auth token...')
    ws.send(JSON.stringify({ type: 'auth', token }))
  }

  ws.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data.toString())

      if (msg.type === 'auth.ok') {
        console.log('✅ WebSocket Authenticated. Channels:', msg.channels)
        isOnline = true
        reconnectDelay = 1000 // Reset backoff
        broadcastSyncStatus()

        // Pull missed events and flush outbox
        pullDeltas()
        flushOutbox()
      } else if (msg.type === 'resource.updated') {
        const { resourceType, resource } = msg.payload
        
        // Skip if this message originated from this client and we've already processed it
        const db = getDrizzleDb()
        const pending = db
          .select({ id: outbox.id })
          .from(outbox)
          .where(and(eq(outbox.resourceId, resource.id), eq(outbox.status, 'pending')))
          .get()

        if (!pending) {
          console.log(`📥 Received remote resource update: ${resourceType}/${resource.id}`)
          saveResourceToLocal(resourceType, resource)
          
          // Notify renderer window to refresh data views
          BrowserWindow.getAllWindows().forEach((win) => {
            win.webContents.send('sync:data-updated', { resourceType, resourceId: resource.id })
          })
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      console.error('Failed to parse WebSocket message:', message)
    }
  }

  ws.onclose = () => {
    console.warn('🔌 WebSocket Disconnected')
    isOnline = false
    broadcastSyncStatus()
    scheduleReconnect()
  }

  ws.onerror = (err) => {
    console.error('🔌 WebSocket Error:', err)
  }
}

let isAutoDiscovering = false

export async function autoDiscoverServer(): Promise<boolean> {
  if (isAutoDiscovering) return false
  isAutoDiscovering = true
  console.log('🔍 Tentative de découverte automatique du serveur Willo sur le réseau local...')

  try {
    // 1. Try Bonjour mDNS
    const mDnsServers = await discoverServers(3500)
    if (mDnsServers.length > 0) {
      const server = mDnsServers[0]
      console.log(`✅ Serveur Willo auto-détecté via Bonjour/mDNS : ${server.host}:${server.port}`)
      updateServerConfig(server.host, String(server.port))
      isAutoDiscovering = false
      return true
    }

    // 2. Try Subnet Scan fallback
    const subnetServers = await scanSubnetForServer()
    if (subnetServers.length > 0) {
      const server = subnetServers[0]
      console.log(`✅ Serveur Willo auto-détecté via Scan Réseau : ${server.host}:${server.port}`)
      updateServerConfig(server.host, String(server.port))
      isAutoDiscovering = false
      return true
    }
  } catch (err) {
    console.warn('⚠️ La découverte automatique du serveur a échoué :', err)
  } finally {
    isAutoDiscovering = false
  }

  return false
}

// Schedule WebSocket reconnection with exponential backoff + jitter
function scheduleReconnect() {
  if (reconnectTimer) clearTimeout(reconnectTimer)

  const storedRefresh = refreshToken || (store.get('refreshToken') as string)
  if (!storedRefresh) {
    console.log('🔌 Aucune session active. Attente d\'authentification utilisateur pour la connexion WebSocket.')
    return
  }
  
  const jitter = Math.random() * 1000
  const delay = Math.min(30000, reconnectDelay) + jitter
  reconnectDelay = reconnectDelay * 2

  console.log(`🔌 Planification de reconnexion WebSocket dans ${Math.round(delay)}ms...`)
  reconnectTimer = setTimeout(async () => {
    // Try auto-discovery if current host connection is failing and host is default local
    if (!isOnline && (serverHost === '127.0.0.1' || serverHost === 'localhost')) {
      await autoDiscoverServer()
    }
    connectWebSocket()
  }, delay)
}

// Manual online/offline toggle
export function toggleOnlineState(online: boolean): void {
  isOnline = online
  if (isOnline) {
    connectWebSocket()
  } else {
    if (websocket) {
      try {
        websocket.close()
      } catch {
        // Ignored
      }
      websocket = null
    }
    if (reconnectTimer) clearTimeout(reconnectTimer)
    broadcastSyncStatus()
  }
}

// Periodically run delta sync (every 5 minutes as safety net)
setInterval(() => {
  if (isOnline) {
    pullDeltas()
  }
}, 5 * 60 * 1000)

export function getOnlineStatus(): boolean {
  return isOnline
}

export function getLastSyncedAt(): string {
  return lastSyncedAt
}

