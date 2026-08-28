import { getDatabase } from '../database'

export interface CareTask {
  id: string
  patientId: string
  patientName: string
  bedNumber: string
  type: 'Injection' | 'Pansement' | 'Médicament' | 'Perfusoion'
  description: string
  prescribedBy: string
  timeScheduled: string
  status: 'Pending' | 'Administered'
  administeredAt?: string
}

export class CareTaskModel {
  static getAll(): CareTask[] {
    const db = getDatabase()
    const stmt = db.prepare(`
      SELECT 
        id, patient_id as patientId, patient_name as patientName,
        bed_number as bedNumber, type, description, prescribed_by as prescribedBy,
        time_scheduled as timeScheduled, status, administered_at as administeredAt
      FROM care_tasks 
      ORDER BY created_at DESC
    `)
    return stmt.all() as CareTask[]
  }

  static create(task: Omit<CareTask, 'id' | 'status'>): CareTask {
    const db = getDatabase()
    const id = `task-${Date.now()}`
    const stmt = db.prepare(`
      INSERT INTO care_tasks (id, patient_id, patient_name, bed_number, type, description, prescribed_by, time_scheduled, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    stmt.run(id, task.patientId, task.patientName, task.bedNumber, task.type, task.description, task.prescribedBy, task.timeScheduled, 'Pending')
    return { id, ...task, status: 'Pending' }
  }

  static toggleStatus(id: string): CareTask | null {
    const db = getDatabase()
    const stmtSelect = db.prepare(`
      SELECT id, patient_id as patientId, patient_name as patientName,
             bed_number as bedNumber, type, description, prescribed_by as prescribedBy,
             time_scheduled as timeScheduled, status, administered_at as administeredAt
      FROM care_tasks WHERE id = ?
    `)
    const task = stmtSelect.get(id) as CareTask | undefined
    if (!task) return null

    const newStatus = task.status === 'Pending' ? 'Administered' : 'Pending'
    const administeredAt = newStatus === 'Administered' ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null

    db.prepare('UPDATE care_tasks SET status = ?, administered_at = ? WHERE id = ?').run(newStatus, administeredAt, id)
    return { ...task, status: newStatus, administeredAt: administeredAt || undefined }
  }
}
