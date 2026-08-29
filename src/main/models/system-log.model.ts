import { getDrizzleDb } from '../database'
import { systemLogs } from '../database/schema'
import { desc } from 'drizzle-orm'

export interface SystemLog {
  id: string
  level: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL'
  service: string
  message: string
  timestamp: string
}

export class SystemLogModel {
  static getAll(): SystemLog[] {
    const db = getDrizzleDb()
    const rows = db
      .select()
      .from(systemLogs)
      .orderBy(desc(systemLogs.timestamp))
      .all()
    return rows as SystemLog[]
  }

  static create(log: Omit<SystemLog, 'id' | 'timestamp'>): SystemLog {
    const db = getDrizzleDb()
    const id = `log-${Date.now()}`
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19)
    db.insert(systemLogs)
      .values({
        id,
        level: log.level,
        service: log.service,
        message: log.message,
        timestamp
      })
      .run()
    return { id, ...log, timestamp }
  }
}
