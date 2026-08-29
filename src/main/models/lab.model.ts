import { getDrizzleDb } from '../database'
import { labRequests } from '../database/schema'
import { eq, desc } from 'drizzle-orm'

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
  status: 'To Do' | 'In Progress' | 'Validated' | 'Completed' | 'Pending Validation'
  validatedBy?: string
  results?: LabResultItem[]
  createdAt?: string
}

export class LabModel {
  /**
   * Gets all laboratory requests from local SQLite DB.
   */
  static getAll(): LabRequest[] {
    const db = getDrizzleDb()
    const rows = db
      .select()
      .from(labRequests)
      .orderBy(desc(labRequests.dateRequested))
      .all()
    return rows.map((r) => ({
      ...r,
      status: r.status as LabRequest['status'],
      results: r.results ? JSON.parse(r.results) : undefined,
      validatedBy: r.validatedBy || undefined
    })) as LabRequest[]
  }

  /**
   * Gets lab requests by Patient ID.
   */
  static getByPatientId(patientId: string): LabRequest[] {
    const db = getDrizzleDb()
    const rows = db
      .select()
      .from(labRequests)
      .where(eq(labRequests.patientId, patientId))
      .orderBy(desc(labRequests.dateRequested))
      .all()
    return rows.map((r) => ({
      ...r,
      status: r.status as LabRequest['status'],
      results: r.results ? JSON.parse(r.results) : undefined,
      validatedBy: r.validatedBy || undefined
    })) as LabRequest[]
  }

  /**
   * Creates a new lab request order.
   */
  static create(request: Omit<LabRequest, 'createdAt'>): LabRequest {
    const db = getDrizzleDb()
    db.insert(labRequests)
      .values({
        id: request.id,
        requestCode: request.requestCode,
        patientId: request.patientId,
        patientName: request.patientName,
        testName: request.testName,
        category: request.category,
        requestedBy: request.requestedBy,
        dateRequested: request.dateRequested,
        status: request.status,
        validatedBy: request.validatedBy || null,
        results: request.results ? JSON.stringify(request.results) : null
      })
      .run()
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
    const db = getDrizzleDb()
    db.update(labRequests)
      .set({
        status,
        results: JSON.stringify(results),
        validatedBy
      })
      .where(eq(labRequests.id, id))
      .run()
  }
}
