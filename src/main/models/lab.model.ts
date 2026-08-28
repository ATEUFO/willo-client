import { getDatabase } from '../database'

export interface LabResultItem {
  parameter: string
  value: string
  unit: string
  referenceRange: string
  isAbnormal?: boolean
}

export interface LabRequest {
  id: string
  requestCode: string
  patientId: string
  patientName: string
  testName: string
  category: string
  requestedBy: string
  dateRequested: string
  status: 'To Do' | 'In Progress' | 'Validated'
  validatedBy?: string
  results?: LabResultItem[]
  createdAt?: string
}

export class LabModel {
  /**
   * Gets all laboratory requests from local SQLite DB.
   */
  static getAll(): LabRequest[] {
    const db = getDatabase()
    const stmt = db.prepare(`
      SELECT 
        id, request_code as requestCode, patient_id as patientId,
        patient_name as patientName, test_name as testName, category,
        requested_by as requestedBy, date_requested as dateRequested,
        status, validated_by as validatedBy, results, created_at as createdAt
      FROM lab_requests 
      ORDER BY date_requested DESC
    `)
    const rows = stmt.all() as (Omit<LabRequest, 'results'> & { results: string | null })[]
    return rows.map((r) => ({
      ...r,
      results: r.results ? JSON.parse(r.results) : undefined
    }))
  }

  /**
   * Gets lab requests by Patient ID.
   */
  static getByPatientId(patientId: string): LabRequest[] {
    const db = getDatabase()
    const stmt = db.prepare(`
      SELECT 
        id, request_code as requestCode, patient_id as patientId,
        patient_name as patientName, test_name as testName, category,
        requested_by as requestedBy, date_requested as dateRequested,
        status, validated_by as validatedBy, results, created_at as createdAt
      FROM lab_requests 
      WHERE patient_id = ?
      ORDER BY date_requested DESC
    `)
    const rows = stmt.all(patientId) as (Omit<LabRequest, 'results'> & { results: string | null })[]
    return rows.map((r) => ({
      ...r,
      results: r.results ? JSON.parse(r.results) : undefined
    }))
  }

  /**
   * Creates a new lab request order.
   */
  static create(request: Omit<LabRequest, 'createdAt'>): LabRequest {
    const db = getDatabase()
    const stmt = db.prepare(`
      INSERT INTO lab_requests (
        id, request_code, patient_id, patient_name, test_name,
        category, requested_by, date_requested, status, validated_by, results
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    stmt.run(
      request.id,
      request.requestCode,
      request.patientId,
      request.patientName,
      request.testName,
      request.category,
      request.requestedBy,
      request.dateRequested,
      request.status,
      request.validatedBy || null,
      request.results ? JSON.stringify(request.results) : null
    )
    return request
  }

  /**
   * Updates lab request status and submits validated test results.
   */
  static updateResults(
    id: string,
    status: LabRequest['status'],
    results: LabResultItem[],
    validatedBy: string
  ): void {
    const db = getDatabase()
    const stmt = db.prepare(`
      UPDATE lab_requests 
      SET status = ?, results = ?, validated_by = ? 
      WHERE id = ?
    `)
    stmt.run(status, JSON.stringify(results), validatedBy, id)
  }
}
