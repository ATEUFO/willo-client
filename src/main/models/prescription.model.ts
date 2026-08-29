import { getDrizzleDb } from '../database'
import { prescriptions } from '../database/schema'
import { eq, desc } from 'drizzle-orm'

export interface PrescriptionItem {
  drugName: string
  dosage: string
  frequency: string
  duration: string
  quantity: number
  unitPrice?: number
}

export interface Prescription {
  id: string
  prescriptionCode: string
  patientId: string
  patientName: string
  doctorName: string
  items: PrescriptionItem[]
  status: 'Pending' | 'Dispensed' | 'Cancelled'
  totalAmount: number
  createdAt?: string
}

export class PrescriptionModel {
  /**
   * Gets all prescriptions from local SQLite DB.
   */
  static getAll(): Prescription[] {
    const db = getDrizzleDb()
    const rows = db
      .select()
      .from(prescriptions)
      .orderBy(desc(prescriptions.createdAt))
      .all()
    return rows.map((r) => ({
      ...r,
      status: r.status as Prescription['status'],
      items: JSON.parse(r.items)
    }))
  }

  /**
   * Gets prescriptions by Patient ID.
   */
  static getByPatientId(patientId: string): Prescription[] {
    const db = getDrizzleDb()
    const rows = db
      .select()
      .from(prescriptions)
      .where(eq(prescriptions.patientId, patientId))
      .orderBy(desc(prescriptions.createdAt))
      .all()
    return rows.map((r) => ({
      ...r,
      status: r.status as Prescription['status'],
      items: JSON.parse(r.items)
    }))
  }

  /**
   * Creates a new electronic prescription.
   */
  static create(prescription: Omit<Prescription, 'createdAt'>): Prescription {
    const db = getDrizzleDb()
    db.insert(prescriptions)
      .values({
        id: prescription.id,
        prescriptionCode: prescription.prescriptionCode,
        patientId: prescription.patientId,
        patientName: prescription.patientName,
        doctorName: prescription.doctorName,
        items: JSON.stringify(prescription.items),
        status: prescription.status,
        totalAmount: prescription.totalAmount
      })
      .run()
    return prescription
  }

  /**
   * Updates prescription status.
   */
  static updateStatus(id: string, status: Prescription['status']): void {
    const db = getDrizzleDb()
    db.update(prescriptions)
      .set({ status })
      .where(eq(prescriptions.id, id))
      .run()
  }
}
