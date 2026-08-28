import { getDatabase } from '../database'

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
    const db = getDatabase()
    const stmt = db.prepare(`
      SELECT 
        id, patient_id as patientId, symptoms, suggestions, alerts,
        model_version as modelVersion, created_at as createdAt
      FROM ai_diagnoses 
      WHERE patient_id = ?
      ORDER BY created_at DESC
    `)
    const rows = stmt.all(patientId) as (Omit<AIDiagnosis, 'suggestions' | 'alerts'> & {
      suggestions: string
      alerts: string | null
    })[]
    return rows.map((r) => ({
      ...r,
      suggestions: JSON.parse(r.suggestions),
      alerts: r.alerts ? JSON.parse(r.alerts) : []
    }))
  }

  /**
   * Saves an AI diagnostic inference result (ONNX Runtime trace / RiskAssessment).
   */
  static save(record: Omit<AIDiagnosis, 'createdAt'>): AIDiagnosis {
    const db = getDatabase()
    const stmt = db.prepare(`
      INSERT INTO ai_diagnoses (
        id, patient_id, symptoms, suggestions, alerts, model_version
      ) VALUES (?, ?, ?, ?, ?, ?)
    `)
    stmt.run(
      record.id,
      record.patientId,
      record.symptoms,
      JSON.stringify(record.suggestions),
      record.alerts ? JSON.stringify(record.alerts) : null,
      record.modelVersion || '1.0.0-onnx'
    )
    return record
  }
}
