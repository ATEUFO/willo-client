import React, { useState, useEffect, useMemo } from 'react'
import { Copy, Plus, Check, AlertTriangle } from 'lucide-react'
import { useHospitalStore } from '../store/hospitalStore'
import {
  aiDiagnosticService,
  AIModelId,
  AIPredictionRequest,
  AIPredictionResponse,
  HealthStatusResponse
} from '../../services/aiDiagnosticService'
import { AIHeader } from './components/ai/AIHeader'
import { AIModelSelector } from './components/ai/AIModelSelector'
import { AIPatientSelector } from './components/ai/AIPatientSelector'
import { AIFeatureForm } from './components/ai/AIFeatureForm'
import { AIRiskBanner } from './components/ai/AIRiskBanner'
import { AIFactorsTable } from './components/ai/AIFactorsTable'
import { AIRecommendations } from './components/ai/AIRecommendations'
import { AIFhirDrawer } from './components/ai/AIFhirDrawer'
import { AILoadingState } from './components/ai/AILoadingState'
import { AIEmptyState } from './components/ai/AIEmptyState'
import { AIHistoryTable } from './components/ai/AIHistoryTable'

export const AIDiagnosticPage: React.FC = () => {
  const {
    patients,
    vitals,
    currentUser,
    addConsultation
  } = useHospitalStore()

  // Navigation state
  const [activeTab, setActiveTab] = useState<'predict' | 'history'>('predict')

  // Selected AI Model
  const [selectedModelId, setSelectedModelId] = useState<AIModelId>('sepsis-risk-v1')

  // Selected Patient
  const [selectedPatientId, setSelectedPatientId] = useState<string>(patients[0]?.id || '')

  const [prevPatientsCount, setPrevPatientsCount] = useState<number>(patients.length)

  useEffect(() => {
    if (patients.length > prevPatientsCount) {
      // Newly created patient added -> select newest patient
      const newest = patients[patients.length - 1]
      if (newest) setSelectedPatientId(newest.id)
      setPrevPatientsCount(patients.length)
    } else if (!selectedPatientId && patients.length > 0) {
      setSelectedPatientId(patients[0].id)
    }
  }, [patients, selectedPatientId, prevPatientsCount])

  const selectedPatient = useMemo(() => {
    return patients.find((p) => p.id === selectedPatientId) || null
  }, [patients, selectedPatientId])

  // Patient Vitals from store
  const patientVitals = useMemo(() => {
    if (!selectedPatient) return null
    const list = vitals
      .filter((v) => v.patientId === selectedPatient.id)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    return list[0] || null
  }, [vitals, selectedPatient])

  // Features State
  const [features, setFeatures] = useState<Record<string, number>>({
    temperature: 38.9,
    pressionSystolique: 90,
    pressionDiastolique: 60,
    frequenceCardiaque: 115,
    frequenceRespiratoire: 24,
    saturationO2: 93,
    leucocytes: 14500,
    lactate: 3.2,
    scoreGlasgow: 14,
    age: 54,
    sexe: 1.0, // 1.0 = Masculin, 0.0 = Féminin
    tdrMalaria: 1.0,
    dureeSymptomesJours: 4,
    plaquettes: 110000,
    hemoglobine: 10.2,
    nbHospitalisationsRecentes: 2,
    dureeSejourJours: 5,
    comorbiditesCount: 2,
    autonomie: 75,
    bmi: 28.4,
    cholesterol: 5.4,
    diabete: 0,
    tabagisme: 1,
    creatinine: 145.0,
    bilirubine: 38.0,
    crp: 72.0,
    potassium: 4.5,
    natremie: 137.0
  })

  // Pre-fill features when patient or vitals change
  useEffect(() => {
    if (selectedPatient) {
      const sexeVal = selectedPatient.gender === 'F' ? 0.0 : 1.0
      setFeatures((prev) => ({
        ...prev,
        age: selectedPatient.age || 45,
        sexe: sexeVal,
        temperature: patientVitals?.temperature || prev.temperature || 37.2,
        pressionSystolique: patientVitals?.systolic || prev.pressionSystolique || 120,
        pressionDiastolique: patientVitals?.diastolic || prev.pressionDiastolique || 80,
        frequenceCardiaque: patientVitals?.pulse || prev.frequenceCardiaque || 78,
        saturationO2: patientVitals?.spO2 || prev.saturationO2 || 97
      }))
    }
  }, [selectedPatient, patientVitals])

  // Component state
  const [isLoading, setIsLoading] = useState(false)
  const [loadingStep, setLoadingStep] = useState(0)
  const [predictionResult, setPredictionResult] = useState<AIPredictionResponse | null>(null)
  const [predictionHistory, setPredictionHistory] = useState<AIPredictionResponse[]>([])
  const [healthStatus, setHealthStatus] = useState<HealthStatusResponse | null>(null)
  const [copiedSuccess, setCopiedSuccess] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  // Service check on load
  useEffect(() => {
    const checkServer = async () => {
      try {
        const status = await aiDiagnosticService.checkHealth()
        setHealthStatus(status)
      } catch (err) {
        console.error('System health status error:', err)
      }
    }
    checkServer()
  }, [])

  const handleFeatureChange = (key: string, value: number) => {
    setFeatures((prev) => ({ ...prev, [key]: value }))
  }

  // Execute AI Prediction
  const handleRunPrediction = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!selectedPatient) return

    setIsLoading(true)
    setLoadingStep(1)
    setApiError(null)

    const t1 = setTimeout(() => setLoadingStep(2), 400)
    const t2 = setTimeout(() => setLoadingStep(3), 900)

    try {
      const payload: AIPredictionRequest = {
        nomModele: selectedModelId,
        patientId: selectedPatient.id,
        encounterId: `enc-${selectedPatient.id.substring(0, 8)}`,
        features
      }

      const result = await aiDiagnosticService.predict(payload)

      clearTimeout(t1)
      clearTimeout(t2)
      setLoadingStep(4)

      setTimeout(() => {
        setPredictionResult(result)
        setPredictionHistory((prev) => [result, ...prev])
        setIsLoading(false)
        setLoadingStep(0)
      }, 300)
    } catch (err: any) {
      console.error('Diagnostic inference execution error:', err)
      clearTimeout(t1)
      clearTimeout(t2)
      setIsLoading(false)
      setLoadingStep(0)
      setApiError(err?.message || 'Erreur lors de la communication avec le serveur d\'analyse.')
    }
  }

  // Save AI Result to Patient Record
  const handleSaveToMedicalRecord = () => {
    if (!selectedPatient || !predictionResult) return

    const p = predictionResult.prediction

    addConsultation({
      patientId: selectedPatient.id,
      patientName: selectedPatient.name,
      doctorName: currentUser?.name || 'Dr. Médecin Référent',
      chiefComplaint: `[Analyse Clinique ${p.intituleDiagnostic}] Risque: ${p.niveauRisque}`,
      clinicalNotes: `Modèle pathologique: ${predictionResult.nomModele} (v${predictionResult.modelVersion})\nProbabilité: ${Math.round(p.scoreProbabilite * 100)}%\n\nFacteurs contributifs:\n${p.facteursContributifs.map((f) => `- ${f.feature}: ${f.valeur} (${f.explication})`).join('\n')}`,
      diagnoses: [`Evaluation Pathologique: ${p.intituleDiagnostic} (${Math.round(p.scoreProbabilite * 100)}% probabilité)`],
      prescriptions: [],
      labOrders: p.recommandations || []
    })

    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 3000)
  }

  // Copy report
  const handleCopyReport = () => {
    if (!predictionResult) return
    const p = predictionResult.prediction
    const text = `--- WILLO HEALTH - RAPPORT D'ÉVALUATION CLINIQUE ---
Modèle Pathologique: ${predictionResult.nomModele}
Patient: ${selectedPatient?.name || predictionResult.patientId}
Horodatage: ${predictionResult.timestamp}
Diagnostic: ${p.intituleDiagnostic}
Niveau de Risque: ${p.niveauRisque}
Probabilité: ${Math.round(p.scoreProbabilite * 100)}%

FACTEURS CONTRIBUTIFS:
${p.facteursContributifs.map((f) => `- ${f.feature} (${f.valeur}): [${f.impact}] ${f.explication}`).join('\n')}

RECOMMANDATIONS CLINIQUES:
${p.recommandations.map((r) => `- ${r}`).join('\n')}
`
    navigator.clipboard.writeText(text)
    setCopiedSuccess(true)
    setTimeout(() => setCopiedSuccess(false), 2000)
  }

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto animate-fade-in">
      <AIHeader
        healthStatus={healthStatus}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        historyCount={predictionHistory.length}
      />

      {activeTab === 'predict' ? (
        <div className="space-y-6">
          <AIModelSelector
            selectedModelId={selectedModelId}
            setSelectedModelId={setSelectedModelId}
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* LEFT COLUMN: Patient & Feature Form (5 Cols) */}
            <div className="lg:col-span-5 space-y-6">
              <AIPatientSelector
                patients={patients}
                selectedPatientId={selectedPatientId}
                setSelectedPatientId={setSelectedPatientId}
                selectedPatient={selectedPatient}
              />

              <AIFeatureForm
                selectedModelId={selectedModelId}
                features={features}
                handleFeatureChange={handleFeatureChange}
                handleRunPrediction={handleRunPrediction}
                isLoading={isLoading}
                loadingStep={loadingStep}
                hasSelectedPatient={!!selectedPatient}
              />
            </div>

            {/* RIGHT COLUMN: Results Dashboard (7 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              {apiError && (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center gap-3 text-rose-800 text-xs font-semibold animate-fade-in">
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                  <span>{apiError}</span>
                </div>
              )}

              {isLoading ? (
                <AILoadingState
                  selectedModelId={selectedModelId}
                  loadingStep={loadingStep}
                />
              ) : predictionResult ? (
                <div className="space-y-6 animate-fade-in">
                  <AIRiskBanner predictionResult={predictionResult} />

                  <AIFactorsTable
                    facteursContributifs={predictionResult.prediction.facteursContributifs}
                  />

                  <AIRecommendations
                    recommandations={predictionResult.prediction.recommandations}
                  />

                  <AIFhirDrawer
                    fhirResource={predictionResult.fhirResource}
                  />

                  {/* Action Toolbar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                    <button
                      type="button"
                      onClick={handleCopyReport}
                      className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      {copiedSuccess ? 'Rapport Copié !' : 'Copier le Rapport Textuel'}
                    </button>

                    <div className="flex items-center gap-3">
                      {saveSuccess && (
                        <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 animate-fade-in">
                          <Check className="w-4 h-4" /> Enregistré au dossier patient !
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={handleSaveToMedicalRecord}
                        className="px-5 py-2.5 bg-medical-primary hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        Archiver au Dossier Médical Patient
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <AIEmptyState />
              )}
            </div>
          </div>
        </div>
      ) : (
        <AIHistoryTable predictionHistory={predictionHistory} />
      )}
    </div>
  )
}
