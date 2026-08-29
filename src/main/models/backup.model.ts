import { getDrizzleDb } from '../database'
import { backups } from '../database/schema'
import { desc } from 'drizzle-orm'

export interface BackupRecord {
  id: string
  filename: string
  size: string
  timestamp: string
  type: 'Automatic' | 'Manual'
  status: 'Completed' | 'Failed' | 'In Progress'
}

export class BackupModel {
  static getAll(): BackupRecord[] {
    const db = getDrizzleDb()
    const rows = db
      .select()
      .from(backups)
      .orderBy(desc(backups.timestamp))
      .all()
    return rows as BackupRecord[]
  }

  static create(backup: Omit<BackupRecord, 'id' | 'timestamp'>): BackupRecord {
    const db = getDrizzleDb()
    const id = `bk-${Date.now()}`
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19)
    db.insert(backups)
      .values({
        id,
        filename: backup.filename,
        size: backup.size,
        timestamp,
        type: backup.type,
        status: backup.status
      })
      .run()
    return { id, ...backup, timestamp }
  }
}
