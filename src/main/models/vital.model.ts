import { getDrizzleDb } from '../database'
import { vitals } from '../database/schema'
import { eq, desc } from 'drizzle-orm'

export interface Vital {
  id: string
  patientId: string
  patientName: string
  systolic: number
  diastolic: number
  temperature: number
  pulse: number
  weight: number
  spO2: number
  isAbnormal: boolean
  nurseNotes?: string
  timestamp?: string
}

export class VitalModel {
  /**
   * Returns all vital signs records from local SQLite DB.
   */
  static getAll(): Vital[] {
    const db = getDrizzleDb()
    const rows = db
      .select()
      .from(vitals)
      .orderBy(desc(vitals.timestamp))
      .all()
    return rows.map((r) => ({
      ...r,
      isAbnormal: Boolean(r.isAbnormal),
      nurseNotes: r.nurseNotes || undefined,
      timestamp: r.timestamp || undefined
    })) as Vital[]
  }

  /**
   * Returns vitals by patient ID.
   */
  static getByPatientId(patientId: string): Vital[] {
    const db = getDrizzleDb()
    const rows = db
      .select()
      .from(vitals)
      .where(eq(vitals.patientId, patientId))
      .orderBy(desc(vitals.timestamp))
      .all()
    return rows.map((r) => ({
      ...r,
      isAbnormal: Boolean(r.isAbnormal),
      nurseNotes: r.nurseNotes || undefined,
      timestamp: r.timestamp || undefined
    })) as Vital[]
  }

  /**
   * Creates a new vital signs record.
   */
  static create(vital: Omit<Vital, 'timestamp'>): Vital {
    const db = getDrizzleDb()
    const timestamp = new Date().toISOString()
    db.insert(vitals)
      .values({
        id: vital.id,
        patientId: vital.patientId,
        patientName: vital.patientName,
        systolic: vital.systolic,
        diastolic: vital.diastolic,
        temperature: vital.temperature,
        pulse: vital.pulse,
        weight: vital.weight,
        spO2: vital.spO2,
        isAbnormal: vital.isAbnormal ? 1 : 0,
        nurseNotes: vital.nurseNotes || null,
        timestamp
      })
      .run()
    return { ...vital, timestamp }
  }
}
