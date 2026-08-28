import { getDatabase } from '../database'

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
    const db = getDatabase()
    const stmt = db.prepare('SELECT id, filename, size, timestamp, type, status FROM backups ORDER BY timestamp DESC')
    return stmt.all() as BackupRecord[]
  }

  static create(backup: Omit<BackupRecord, 'id' | 'timestamp'>): BackupRecord {
    const db = getDatabase()
    const id = `bk-${Date.now()}`
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19)
    const stmt = db.prepare('INSERT INTO backups (id, filename, size, timestamp, type, status) VALUES (?, ?, ?, ?, ?, ?)')
    stmt.run(id, backup.filename, backup.size, timestamp, backup.type, backup.status)
    return { id, ...backup, timestamp }
  }
}
