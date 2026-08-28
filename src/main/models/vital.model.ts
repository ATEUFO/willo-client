import { getDatabase } from '../database'

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
    const db = getDatabase()
    const stmt = db.prepare(`
      SELECT 
        id, patient_id as patientId, patient_name as patientName,
        systolic, diastolic, temperature, pulse, weight, sp_o2 as spO2,
        is_abnormal as isAbnormal, nurse_notes as nurseNotes, timestamp
      FROM vitals 
      ORDER BY timestamp DESC
    `)
    const rows = stmt.all() as (Omit<Vital, 'isAbnormal'> & { isAbnormal: number })[]
    return rows.map((r) => ({ ...r, isAbnormal: Boolean(r.isAbnormal) }))
  }

  /**
   * Returns vitals by patient ID.
   */
  static getByPatientId(patientId: string): Vital[] {
    const db = getDatabase()
    const stmt = db.prepare(`
      SELECT 
        id, patient_id as patientId, patient_name as patientName,
        systolic, diastolic, temperature, pulse, weight, sp_o2 as spO2,
        is_abnormal as isAbnormal, nurse_notes as nurseNotes, timestamp
      FROM vitals 
      WHERE patient_id = ?
      ORDER BY timestamp DESC
    `)
    const rows = stmt.all(patientId) as (Omit<Vital, 'isAbnormal'> & { isAbnormal: number })[]
    return rows.map((r) => ({ ...r, isAbnormal: Boolean(r.isAbnormal) }))
  }

  /**
   * Creates a new vital signs record.
   */
  static create(vital: Omit<Vital, 'timestamp'>): Vital {
    const db = getDatabase()
    const stmt = db.prepare(`
      INSERT INTO vitals (
        id, patient_id, patient_name, systolic, diastolic, temperature,
        pulse, weight, sp_o2, is_abnormal, nurse_notes, timestamp
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    const timestamp = new Date().toISOString()
    stmt.run(
      vital.id,
      vital.patientId,
      vital.patientName,
      vital.systolic,
      vital.diastolic,
      vital.temperature,
      vital.pulse,
      vital.weight,
      vital.spO2,
      vital.isAbnormal ? 1 : 0,
      vital.nurseNotes || null,
      timestamp
    )
    return { ...vital, timestamp }
  }
}
