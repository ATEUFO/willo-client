import { getDrizzleDb } from '../database'
import { careTasks } from '../database/schema'
import { eq, desc } from 'drizzle-orm'

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
    const db = getDrizzleDb()
    const rows = db
      .select()
      .from(careTasks)
      .orderBy(desc(careTasks.createdAt))
      .all()
    return rows.map((r) => ({
      ...r,
      administeredAt: r.administeredAt || undefined,
      type: r.type as CareTask['type'],
      status: r.status as CareTask['status']
    }))
  }

  static create(task: Omit<CareTask, 'id' | 'status'>): CareTask {
    const db = getDrizzleDb()
    const id = `task-${Date.now()}`
    db.insert(careTasks)
      .values({
        id,
        patientId: task.patientId,
        patientName: task.patientName,
        bedNumber: task.bedNumber,
        type: task.type,
        description: task.description,
        prescribedBy: task.prescribedBy,
        timeScheduled: task.timeScheduled,
        status: 'Pending'
      })
      .run()
    return { id, ...task, status: 'Pending' }
  }

  static toggleStatus(id: string): CareTask | null {
    const db = getDrizzleDb()
    const task = db
      .select()
      .from(careTasks)
      .where(eq(careTasks.id, id))
      .get()
    if (!task) return null

    const newStatus = task.status === 'Pending' ? 'Administered' : 'Pending'
    const administeredAt = newStatus === 'Administered' ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null

    db.update(careTasks)
      .set({
        status: newStatus,
        administeredAt
      })
      .where(eq(careTasks.id, id))
      .run()

    return {
      ...task,
      type: task.type as CareTask['type'],
      status: newStatus,
      administeredAt: administeredAt || undefined
    }
  }
}
