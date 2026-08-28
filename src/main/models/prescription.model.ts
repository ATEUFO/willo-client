import { getDatabase } from '../database'

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
    const db = getDatabase()
    const stmt = db.prepare(`
      SELECT 
        id, prescription_code as prescriptionCode, patient_id as patientId,
        patient_name as patientName, doctor_name as doctorName, items,
        status, total_amount as totalAmount, created_at as createdAt
      FROM prescriptions 
      ORDER BY created_at DESC
    `)
    const rows = stmt.all() as (Omit<Prescription, 'items'> & { items: string })[]
    return rows.map((r) => ({
      ...r,
      items: JSON.parse(r.items)
    }))
  }

  /**
   * Gets prescriptions by Patient ID.
   */
  static getByPatientId(patientId: string): Prescription[] {
    const db = getDatabase()
    const stmt = db.prepare(`
      SELECT 
        id, prescription_code as prescriptionCode, patient_id as patientId,
        patient_name as patientName, doctor_name as doctorName, items,
        status, total_amount as totalAmount, created_at as createdAt
      FROM prescriptions 
      WHERE patient_id = ?
      ORDER BY created_at DESC
    `)
    const rows = stmt.all(patientId) as (Omit<Prescription, 'items'> & { items: string })[]
    return rows.map((r) => ({
      ...r,
      items: JSON.parse(r.items)
    }))
  }

  /**
   * Creates a new electronic prescription.
   */
  static create(prescription: Omit<Prescription, 'createdAt'>): Prescription {
    const db = getDatabase()
    const stmt = db.prepare(`
      INSERT INTO prescriptions (
        id, prescription_code, patient_id, patient_name, doctor_name,
        items, status, total_amount
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `)
    stmt.run(
      prescription.id,
      prescription.prescriptionCode,
      prescription.patientId,
      prescription.patientName,
      prescription.doctorName,
      JSON.stringify(prescription.items),
      prescription.status,
      prescription.totalAmount
    )
    return prescription
  }

  /**
   * Updates prescription status (e.g. Pending -> Dispensed).
   */
  static updateStatus(id: string, status: Prescription['status']): void {
    const db = getDatabase()
    const stmt = db.prepare('UPDATE prescriptions SET status = ? WHERE id = ?')
    stmt.run(status, id)
  }
}
