import { getDrizzleDb } from '../database'
import { aiDiagnoses } from '../database/schema'
import { eq, desc } from 'drizzle-orm'

export interface AISuggestionItem {
  diseaseName: string
  confidencePercent: number
  recommendedExams: string[]
  riskLevel: 'Faible' | 'Modéré' | 'Élevé' | 'Critique'
}

export interface AIDiagnosis {
  id: string
  patientId: string
  symptoms: string
  suggestions: AISuggestionItem[]
  alerts?: string[]
  modelVersion?: string
  createdAt?: string
}

export class AIDiagnosisModel {
  /**
   * Gets AI diagnosis history by Patient ID.
   */
  static getByPatientId(patientId: string): AIDiagnosis[] {
    const db = getDrizzleDb()
    const rows = db
      .select()
      .from(aiDiagnoses)
      .where(eq(aiDiagnoses.patientId, patientId))
      .orderBy(desc(aiDiagnoses.createdAt))
      .all()
    return rows.map((r) => ({
      ...r,
      suggestions: JSON.parse(r.suggestions),
      alerts: r.alerts ? JSON.parse(r.alerts) : [],
      modelVersion: r.modelVersion || undefined
    })) as AIDiagnosis[]
  }

  /**
   * Saves an AI diagnostic inference result (ONNX Runtime trace / RiskAssessment).
   */
  static save(record: Omit<AIDiagnosis, 'createdAt'>): AIDiagnosis {
    const db = getDrizzleDb()
    db.insert(aiDiagnoses)
      .values({
        id: record.id,
        patientId: record.patientId,
        symptoms: record.symptoms,
        suggestions: JSON.stringify(record.suggestions),
        alerts: record.alerts ? JSON.stringify(record.alerts) : null,
        modelVersion: record.modelVersion || '1.0.0-onnx'
      })
      .run()
    return record
  }
}
