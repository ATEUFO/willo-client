import { getDatabase } from '../database'

export interface Consultation {
  id: string
  patientId: string
  patientName: string
  doctorName: string
  chiefComplaint: string
  clinicalNotes: string
  diagnoses: string[]
  prescriptions?: string[]
  labOrders?: string[]
  createdAt?: string
}

export class ConsultationModel {
  /**
   * Gets all medical consultations from local SQLite DB.
   */
  static getAll(): Consultation[] {
    const db = getDatabase()
    const stmt = db.prepare(`
      SELECT 
        id, patient_id as patientId, patient_name as patientName,
        doctor_name as doctorName, chief_complaint as chiefComplaint,
        clinical_notes as clinicalNotes, diagnoses, prescriptions, lab_orders as labOrders,
        created_at as createdAt
      FROM consultations 
      ORDER BY created_at DESC
    `)
    const rows = stmt.all() as (Omit<Consultation, 'diagnoses' | 'prescriptions' | 'labOrders'> & {
      diagnoses: string | null
      prescriptions: string | null
      labOrders: string | null
    })[]
    return rows.map((r) => ({
      ...r,
      diagnoses: r.diagnoses ? JSON.parse(r.diagnoses) : [],
      prescriptions: r.prescriptions ? JSON.parse(r.prescriptions) : [],
      labOrders: r.labOrders ? JSON.parse(r.labOrders) : []
    }))
  }

  /**
   * Gets consultations by Patient ID.
   */
  static getByPatientId(patientId: string): Consultation[] {
    const db = getDatabase()
    const stmt = db.prepare(`
      SELECT 
        id, patient_id as patientId, patient_name as patientName,
        doctor_name as doctorName, chief_complaint as chiefComplaint,
        clinical_notes as clinicalNotes, diagnoses, prescriptions, lab_orders as labOrders,
        created_at as createdAt
      FROM consultations 
      WHERE patient_id = ?
      ORDER BY created_at DESC
    `)
    const rows = stmt.all(patientId) as (Omit<Consultation, 'diagnoses' | 'prescriptions' | 'labOrders'> & {
      diagnoses: string | null
      prescriptions: string | null
      labOrders: string | null
    })[]
    return rows.map((r) => ({
      ...r,
      diagnoses: r.diagnoses ? JSON.parse(r.diagnoses) : [],
      prescriptions: r.prescriptions ? JSON.parse(r.prescriptions) : [],
      labOrders: r.labOrders ? JSON.parse(r.labOrders) : []
    }))
  }

  /**
   * Creates a new consultation record.
   */
  static create(consultation: Omit<Consultation, 'createdAt'>): Consultation {
    const db = getDatabase()
    const stmt = db.prepare(`
      INSERT INTO consultations (
        id, patient_id, patient_name, doctor_name, chief_complaint,
        clinical_notes, diagnoses, prescriptions, lab_orders
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    stmt.run(
      consultation.id,
      consultation.patientId,
      consultation.patientName,
      consultation.doctorName,
      consultation.chiefComplaint,
      consultation.clinicalNotes,
      JSON.stringify(consultation.diagnoses || []),
      JSON.stringify(consultation.prescriptions || []),
      JSON.stringify(consultation.labOrders || [])
    )
    return consultation
  }
}
