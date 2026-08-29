import { getDrizzleDb } from '../database'
import { patients } from '../database/schema'
import { eq, desc, sql } from 'drizzle-orm'

export interface Patient {
  id: string
  patientCode: string
  name: string
  age: number
  gender: 'M' | 'F'
  phone: string
  address: string
  bloodType: string
  emergencyContact: string
  assignedDoctor: string
  queueNumber: string
  arrivalTime: string
  status: 'Waiting' | 'Vitals Taken' | 'In Consultation' | 'Completed' | 'Lab Pending' | 'Pharmacy Pending'
  createdAt?: string
  updatedAt?: string
}

export class PatientModel {
  /**
   * Returns all patients from local SQLite database.
   */
  static getAll(): Patient[] {
    const db = getDrizzleDb()
    return db
      .select()
      .from(patients)
      .orderBy(desc(patients.arrivalTime))
      .all() as Patient[]
  }

  /**
   * Finds a patient by ID.
   */
  static getById(id: string): Patient | null {
    const db = getDrizzleDb()
    const row = db.select().from(patients).where(eq(patients.id, id)).get()
    return (row as Patient) || null
  }

  /**
   * Creates a new patient record in local SQLite database.
   */
  static create(patient: Omit<Patient, 'createdAt' | 'updatedAt'>): Patient {
    const db = getDrizzleDb()
    db.insert(patients)
      .values({
        id: patient.id,
        patientCode: patient.patientCode,
        name: patient.name,
        age: patient.age,
        gender: patient.gender,
        phone: patient.phone,
        address: patient.address,
        bloodType: patient.bloodType,
        emergencyContact: patient.emergencyContact,
        assignedDoctor: patient.assignedDoctor,
        queueNumber: patient.queueNumber,
        arrivalTime: patient.arrivalTime,
        status: patient.status
      })
      .run()
    return this.getById(patient.id)!
  }

  /**
   * Updates patient status.
   */
  static updateStatus(id: string, status: Patient['status']): void {
    const db = getDrizzleDb()
    db.update(patients)
      .set({
        status,
        updatedAt: sql`CURRENT_TIMESTAMP`
      })
      .where(eq(patients.id, id))
      .run()
  }

  /**
   * Deletes a patient record by ID.
   */
  static delete(id: string): void {
    const db = getDrizzleDb()
    db.delete(patients).where(eq(patients.id, id)).run()
  }
}
