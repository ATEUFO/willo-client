import { getDrizzleDb } from '../database'
import { appointments } from '../database/schema'
import { eq, asc } from 'drizzle-orm'

export interface Appointment {
  id: string
  patientId: string
  patientName: string
  doctorName: string
  department: string
  date: string
  time: string
  type: string
  status: 'Scheduled' | 'Completed' | 'Cancelled'
  createdAt?: string
}

export class AppointmentModel {
  /**
   * Gets all scheduled appointments from local SQLite DB.
   */
  static getAll(): Appointment[] {
    const db = getDrizzleDb()
    const rows = db
      .select()
      .from(appointments)
      .orderBy(asc(appointments.date), asc(appointments.time))
      .all()
    return rows.map((r) => ({
      ...r,
      status: r.status as Appointment['status']
    }))
  }

  /**
   * Gets appointments by Patient ID.
   */
  static getByPatientId(patientId: string): Appointment[] {
    const db = getDrizzleDb()
    const rows = db
      .select()
      .from(appointments)
      .where(eq(appointments.patientId, patientId))
      .orderBy(asc(appointments.date), asc(appointments.time))
      .all()
    return rows.map((r) => ({
      ...r,
      status: r.status as Appointment['status']
    }))
  }

  /**
   * Creates a new appointment.
   */
  static create(app: Omit<Appointment, 'createdAt'>): Appointment {
    const db = getDrizzleDb()
    db.insert(appointments)
      .values({
        id: app.id,
        patientId: app.patientId,
        patientName: app.patientName,
        doctorName: app.doctorName,
        department: app.department,
        date: app.date,
        time: app.time,
        type: app.type,
        status: app.status
      })
      .run()
    return app
  }

  /**
   * Updates appointment status (Scheduled -> Completed / Cancelled).
   */
  static updateStatus(id: string, status: Appointment['status']): void {
    const db = getDrizzleDb()
    db.update(appointments)
      .set({ status })
      .where(eq(appointments.id, id))
      .run()
  }
}
