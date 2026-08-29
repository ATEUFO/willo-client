import { getDrizzleDb } from '../database'
import { consultations } from '../database/schema'
import { eq, desc } from 'drizzle-orm'

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
    const db = getDrizzleDb()
    const rows = db
      .select()
      .from(consultations)
      .orderBy(desc(consultations.createdAt))
      .all()
    return rows.map((r) => ({
      ...r,
      diagnoses: r.diagnoses ? JSON.parse(r.diagnoses) : [],
      prescriptions: r.prescriptions ? JSON.parse(r.prescriptions) : [],
      labOrders: r.labOrders ? JSON.parse(r.labOrders) : []
    })) as Consultation[]
  }

  /**
   * Gets consultations by Patient ID.
   */
  static getByPatientId(patientId: string): Consultation[] {
    const db = getDrizzleDb()
    const rows = db
      .select()
      .from(consultations)
      .where(eq(consultations.patientId, patientId))
      .orderBy(desc(consultations.createdAt))
      .all()
    return rows.map((r) => ({
      ...r,
      diagnoses: r.diagnoses ? JSON.parse(r.diagnoses) : [],
      prescriptions: r.prescriptions ? JSON.parse(r.prescriptions) : [],
      labOrders: r.labOrders ? JSON.parse(r.labOrders) : []
    })) as Consultation[]
  }

  /**
   * Creates a new consultation record.
   */
  static create(consultation: Omit<Consultation, 'createdAt'>): Consultation {
    const db = getDrizzleDb()
    db.insert(consultations)
      .values({
        id: consultation.id,
        patientId: consultation.patientId,
        patientName: consultation.patientName,
        doctorName: consultation.doctorName,
        chiefComplaint: consultation.chiefComplaint,
        clinicalNotes: consultation.clinicalNotes,
        diagnoses: JSON.stringify(consultation.diagnoses || []),
        prescriptions: JSON.stringify(consultation.prescriptions || []),
        labOrders: JSON.stringify(consultation.labOrders || [])
      })
      .run()
    return consultation
  }
}
