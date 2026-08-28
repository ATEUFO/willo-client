import { getDatabase } from '../database'

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
    const db = getDatabase()
    const stmt = db.prepare(`
      SELECT 
        id, patient_id as patientId, patient_name as patientName,
        doctor_name as doctorName, department, date, time, type, status,
        created_at as createdAt
      FROM appointments 
      ORDER BY date ASC, time ASC
    `)
    return (stmt.all() as unknown[]) as Appointment[]
  }

  /**
   * Gets appointments by Patient ID.
   */
  static getByPatientId(patientId: string): Appointment[] {
    const db = getDatabase()
    const stmt = db.prepare(`
      SELECT 
        id, patient_id as patientId, patient_name as patientName,
        doctor_name as doctorName, department, date, time, type, status,
        created_at as createdAt
      FROM appointments 
      WHERE patient_id = ?
      ORDER BY date ASC, time ASC
    `)
    return (stmt.all(patientId) as unknown[]) as Appointment[]
  }

  /**
   * Creates a new appointment.
   */
  static create(app: Omit<Appointment, 'createdAt'>): Appointment {
    const db = getDatabase()
    const stmt = db.prepare(`
      INSERT INTO appointments (
        id, patient_id, patient_name, doctor_name, department, date, time, type, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    stmt.run(
      app.id,
      app.patientId,
      app.patientName,
      app.doctorName,
      app.department,
      app.date,
      app.time,
      app.type,
      app.status
    )
    return app
  }

  /**
   * Updates appointment status (Scheduled -> Completed / Cancelled).
   */
  static updateStatus(id: string, status: Appointment['status']): void {
    const db = getDatabase()
    const stmt = db.prepare('UPDATE appointments SET status = ? WHERE id = ?')
    stmt.run(status, id)
  }
}
