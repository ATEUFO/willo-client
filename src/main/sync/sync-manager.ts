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

const store = new Store()

let accessToken: string | null = null
let refreshToken: string | null = null
let isOnline: boolean = true
let lastSyncedAt: string = (store.get('lastSyncedAt') as string) || ''
let websocket: WebSocket | null = null
let reconnectTimer: NodeJS.Timeout | null = null
let reconnectDelay = 1000
let flushTimer: NodeJS.Timeout | null = null

// Server settings constructed from .env
const serverHost = process.env.SERVER_HOST || '127.0.0.1'
const serverPort = process.env.SERVER_PORT || '5030'
const serverBaseUrl = `http://${serverHost}:${serverPort}` // In production, this can be https

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
function getPendingCount(): number {
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
    const response = await axios.post(`${serverBaseUrl}/api/auth/login`, { email, password })
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
    const response = await axios.post(`${serverBaseUrl}/api/auth/refresh`, { refreshToken: storedRefresh })
    accessToken = response.data.accessToken
    isOnline = true
    return accessToken
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.warn('Session refresh failed:', message)
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
      headers: { Authorization: `Bearer ${token}` }
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
        headers: { Authorization: `Bearer ${token}` }
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
          'X-Client-Mutation-Id': mutation.id
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

  const token = await ensureFreshToken()
  if (!token) {
    scheduleReconnect()
    return
  }

  const wsProtocol = serverBaseUrl.startsWith('https') ? 'wss:' : 'ws:'
  const wsUrl = `${wsProtocol}//${serverHost}:${serverPort}/ws`

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

// Schedule WebSocket reconnection with exponential backoff + jitter
function scheduleReconnect() {
  if (reconnectTimer) clearTimeout(reconnectTimer)
  
  const jitter = Math.random() * 1000
  const delay = Math.min(30000, reconnectDelay) + jitter
  reconnectDelay = reconnectDelay * 2

  console.log(`🔌 Scheduling WebSocket reconnect in ${Math.round(delay)}ms...`)
  reconnectTimer = setTimeout(() => {
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

