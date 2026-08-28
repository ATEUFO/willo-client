import { getDatabase } from '../database'

export interface SystemLog {
  id: string
  level: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL'
  service: string
  message: string
  timestamp: string
}

export class SystemLogModel {
  static getAll(): SystemLog[] {
    const db = getDatabase()
    const stmt = db.prepare('SELECT id, level, service, message, timestamp FROM system_logs ORDER BY timestamp DESC')
    return stmt.all() as SystemLog[]
  }

  static create(log: Omit<SystemLog, 'id' | 'timestamp'>): SystemLog {
    const db = getDatabase()
    const id = `log-${Date.now()}`
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19)
    const stmt = db.prepare('INSERT INTO system_logs (id, level, service, message, timestamp) VALUES (?, ?, ?, ?, ?)')
    stmt.run(id, log.level, log.service, log.message, timestamp)
    return { id, ...log, timestamp }
  }
}
