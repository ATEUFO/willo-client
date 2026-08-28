import { getDatabase } from '../database'

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
  status: 'Waiting' | 'Vitals Taken' | 'In Consultation' | 'Completed'
  createdAt?: string
  updatedAt?: string
}

export class PatientModel {
  /**
   * Returns all patients from local SQLite database.
   */
  static getAll(): Patient[] {
    const db = getDatabase()
    const stmt = db.prepare(`
      SELECT 
        id, patient_code as patientCode, name, age, gender, phone, 
        address, blood_type as bloodType, emergency_contact as emergencyContact, 
        assigned_doctor as assignedDoctor, queue_number as queueNumber, 
        arrival_time as arrivalTime, status, created_at as createdAt, updated_at as updatedAt 
      FROM patients 
      ORDER BY arrival_time DESC
    `)
    return (stmt.all() as unknown[]) as Patient[]
  }

  /**
   * Finds a patient by ID.
   */
  static getById(id: string): Patient | null {
    const db = getDatabase()
    const stmt = db.prepare(`
      SELECT 
        id, patient_code as patientCode, name, age, gender, phone, 
        address, blood_type as bloodType, emergency_contact as emergencyContact, 
        assigned_doctor as assignedDoctor, queue_number as queueNumber, 
        arrival_time as arrivalTime, status, created_at as createdAt, updated_at as updatedAt 
      FROM patients 
      WHERE id = ?
    `)
    const row = stmt.get(id) as Patient | undefined
    return row || null
  }

  /**
   * Creates a new patient record in local SQLite database.
   */
  static create(patient: Omit<Patient, 'createdAt' | 'updatedAt'>): Patient {
    const db = getDatabase()
    const stmt = db.prepare(`
      INSERT INTO patients (
        id, patient_code, name, age, gender, phone, address, 
        blood_type, emergency_contact, assigned_doctor, queue_number, arrival_time, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    stmt.run(
      patient.id,
      patient.patientCode,
      patient.name,
      patient.age,
      patient.gender,
      patient.phone,
      patient.address,
      patient.bloodType,
      patient.emergencyContact,
      patient.assignedDoctor,
      patient.queueNumber,
      patient.arrivalTime,
      patient.status
    )
    return this.getById(patient.id)!
  }

  /**
   * Updates patient status (e.g., Waiting -> Vitals Taken -> In Consultation -> Completed).
   */
  static updateStatus(id: string, status: Patient['status']): void {
    const db = getDatabase()
    const stmt = db.prepare(`
      UPDATE patients 
      SET status = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `)
    stmt.run(status, id)
  }

  /**
   * Deletes a patient record by ID.
   */
  static delete(id: string): void {
    const db = getDatabase()
    const stmt = db.prepare('DELETE FROM patients WHERE id = ?')
    stmt.run(id)
  }
}
