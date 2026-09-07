import React, { useState, useEffect, useMemo } from 'react'
import {
  Brain,
  Sparkles,
  Stethoscope,
  Activity,
  AlertTriangle,
  CheckCircle2,
  FileText,
  RefreshCw,
  Sliders,
  ShieldCheck,
  Zap,
  Check,
  Copy,
  Plus,
  Database,
  Pill,
  History
} from 'lucide-react'
import { useHospitalStore } from '../store/hospitalStore'
import {
  aiDiagnosticService,
  AIDiagnosisRequest,
  AIDiagnosisResponse,
  HealthStatusResponse
} from '../../services/aiDiagnosticService'

const PRESET_SYMPTOMS = [
  'Douleur rétrosternale',
  'Dyspnée à l\'effort',
  'Fièvre (T° > 38.5°C)',
  'Toux sèche',
  'Toux productive',
  'Céphalées occipitales',
  'Vertiges & Malaises',
  'Asthénie intense',
  'Pyrosis & Brûlures d\'estomac',
  'Nausées & Vomissements',
  'Tachycardie / Palpitations',
  'Sueurs profuses'
]

export const AIDiagnosticPage: React.FC = () => {
  const {
    patients,
    vitals,
    currentUser,
    addConsultation
  } = useHospitalStore()

  // Navigation & View State
  const [activeTab, setActiveTab] = useState<'generate' | 'history'>('generate')

  // Patient Selection
  const [selectedPatientId, setSelectedPatientId] = useState<string>(patients[0]?.id || '')

  useEffect(() => {
    if (!selectedPatientId && patients.length > 0) {
      setSelectedPatientId(patients[0].id)
    }
  }, [patients, selectedPatientId])

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

  // Form Inputs
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([
    'Douleur rétrosternale',
    'Dyspnée à l\'effort',
    'Céphalées occipitales'
  ])
  const [customSymptomInput, setCustomSymptomInput] = useState('')
  const [chiefComplaint, setChiefComplaint] = useState('Douleur rétro-sternale constrictive irradiant parfois vers le bras gauche avec dyspnée à l\'effort.')
  const [clinicalNotes, setClinicalNotes] = useState('Patient suivi pour HTA. Auscultation pulmonaire libre, bruits du cœur réguliers sans souffle.')
  const [labInput, setLabInput] = useState('Glycémie: 1.15 g/L, Créatinine: 11 mg/L')
  const [medicationsInput, setMedicationsInput] = useState('Amlodipine 10mg, Aspirine 100mg')

  // Axios HTTP Request & AI State
  const [isLoading, setIsLoading] = useState(false)
  const [loadingStep, setLoadingStep] = useState(0)
  const [diagnosisResult, setDiagnosisResult] = useState<AIDiagnosisResponse | null>(null)
  const [diagnosticHistory, setDiagnosticHistory] = useState<AIDiagnosisResponse[]>([])
  const [healthStatus, setHealthStatus] = useState<HealthStatusResponse | null>(null)
  const [showAxiosPayload, setShowAxiosPayload] = useState(false)
  const [copiedSuccess, setCopiedSuccess] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Check Axios Backend Health on load
  useEffect(() => {
    const checkServer = async () => {
      const status = await aiDiagnosticService.checkHealth()
      setHealthStatus(status)
    }
    checkServer()
  }, [])

  // Toggle Symptom Tag
  const toggleSymptom = (symptom: string) => {
    if (selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms(selectedSymptoms.filter((s) => s !== symptom))
    } else {
      setSelectedSymptoms([...selectedSymptoms, symptom])
    }
  }

  // Add custom symptom
  const handleAddCustomSymptom = () => {
    if (!customSymptomInput.trim()) return
    if (!selectedSymptoms.includes(customSymptomInput.trim())) {
      setSelectedSymptoms([...selectedSymptoms, customSymptomInput.trim()])
    }
    setCustomSymptomInput('')
  }

  // Execute AI Diagnosis via Axios HTTP
  const handleRunAIDiagnosis = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!selectedPatient) return

    setIsLoading(true)
    setLoadingStep(1)

    // Simulate multi-step progress indicators
    const t1 = setTimeout(() => setLoadingStep(2), 500)
    const t2 = setTimeout(() => setLoadingStep(3), 1100)

    try {
      const payload: AIDiagnosisRequest = {
        patientId: selectedPatient.id,
        patientName: selectedPatient.name,
        age: selectedPatient.age,
        gender: selectedPatient.gender,
        symptoms: selectedSymptoms,
        chiefComplaint,
        clinicalNotes,
        vitals: patientVitals
          ? {
              systolic: patientVitals.systolic,
              diastolic: patientVitals.diastolic,
              temperature: patientVitals.temperature,
              pulse: patientVitals.pulse,
              spO2: patientVitals.spO2,
              weight: patientVitals.weight
            }
          : undefined,
        labData: labInput ? labInput.split(',').map((s) => s.trim()) : [],
        currentMedications: medicationsInput ? medicationsInput.split(',').map((s) => s.trim()) : [],
        medicalHistory: [selectedPatient.bloodType ? `Groupe sanguin: ${selectedPatient.bloodType}` : '']
      }

      // Axios HTTP Post Call
      const result = await aiDiagnosticService.generateDiagnosis(payload)

      clearTimeout(t1)
      clearTimeout(t2)
      setLoadingStep(4)

      setTimeout(() => {
        setDiagnosisResult(result)
        setDiagnosticHistory((prev) => [result, ...prev])
        setIsLoading(false)
        setLoadingStep(0)
      }, 300)
    } catch (err) {
      console.error('Error generating AI diagnosis via Axios:', err)
      setIsLoading(false)
      setLoadingStep(0)
    }
  }

  // Save AI Result to Patient Record in SQLite/Store
  const handleSaveToMedicalRecord = () => {
    if (!selectedPatient || !diagnosisResult) return

    const primary = diagnosisResult.primaryDiagnoses[0]
    const diagnosesList = diagnosisResult.primaryDiagnoses.map(
      (d) => `${d.icd10} - ${d.name} (${d.confidence}%)`
    )

    const prescriptionsList = (primary?.suggestedTreatments || []).map((t) => ({
      drugName: t,
      dosage: 'Selon avis médical',
      frequency: 'Par jour',
      duration: '7 jours'
    }))

    addConsultation({
      patientId: selectedPatient.id,
      patientName: selectedPatient.name,
      doctorName: currentUser?.name || 'Dr. Médecin Référent',
      chiefComplaint: `[Analyse IA ${diagnosisResult.timestamp}] ${chiefComplaint}`,
      clinicalNotes: `${clinicalNotes}\n\nJustification IA: ${primary?.justification || ''}`,
      diagnoses: diagnosesList,
      prescriptions: prescriptionsList,
      labOrders: primary?.recommendedExams || []
    })

    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 3000)
  }

  // Copy diagnostic text
  const handleCopyReport = () => {
    if (!diagnosisResult) return
    const text = `--- RAPPORT DE DIAGNOSTIC IA (WILLO-HEALTH) ---
Patient: ${diagnosisResult.patientName}
Date/Heure: ${diagnosisResult.timestamp}
Niveau de Risque: ${diagnosisResult.riskLevel}
Confiance IA: ${diagnosisResult.aiConfidenceOverall}%

DIAGNOSTICS PRINCIPAUX :
${diagnosisResult.primaryDiagnoses
  .map((d, i) => `${i + 1}. [${d.icd10}] ${d.name} (Confiance: ${d.confidence}%)`)
  .join('\n')}

EXAMENS RECOMMANDÉS :
${diagnosisResult.primaryDiagnoses[0]?.recommendedExams.map((e) => `- ${e}`).join('\n') || 'Aucun'}

ALERTES PHARMACOLOGIQUES :
${diagnosisResult.drugInteractionAlerts.map((a) => `- ${a}`).join('\n')}
`
    navigator.clipboard.writeText(text)
    setCopiedSuccess(true)
    setTimeout(() => setCopiedSuccess(false), 2000)
  }

  // Risk styling helpers
  const getRiskBadge = (risk: 'Faible' | 'Modéré' | 'Élevé' | 'Critique') => {
    switch (risk) {
      case 'Critique':
        return 'bg-rose-500/10 text-rose-500 border-rose-500/30 font-bold'
      case 'Élevé':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/30 font-bold'
      case 'Modéré':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/30 font-semibold'
      default:
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30 font-semibold'
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto animate-fade-in">
      {/* Top Header & Connection Bar */}
      <div className="bg-gradient-to-r from-[#0A192F] via-[#0F2A4A] to-[#0A192F] rounded-2xl p-6 text-white shadow-xl border border-slate-700/60 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
              <Brain className="w-8 h-8 text-slate-950 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-black tracking-tight text-white">Diagnostic Médical Assisté par IA</h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-400" /> WilloMed-AI v3.5
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                Module clinique de prédiction diagnostique, classification ICD-10 et aide aux décisions médicales alimenté par requêtes HTTP Axios.
              </p>
            </div>
          </div>

          {/* HTTP Axios Live Status & Action Controls */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="px-3 py-2 bg-slate-900/80 rounded-xl border border-slate-700/80 flex items-center gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full animate-ping ${healthStatus?.online ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                <span className="font-semibold text-slate-200">Axios HTTP Engine</span>
              </div>
              <div className="h-4 w-px bg-slate-700" />
              <span className="text-[11px] font-mono text-emerald-400">
                {healthStatus?.online ? `HTTP 200 OK (${healthStatus.latencyMs}ms)` : 'Mode Local / Fallback API'}
              </span>
            </div>

            {/* Tab Navigation */}
            <div className="flex bg-slate-900/90 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setActiveTab('generate')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'generate'
                    ? 'bg-medical-primary text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Zap className="w-3.5 h-3.5" /> Analyse Clinique
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'history'
                    ? 'bg-medical-primary text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <History className="w-3.5 h-3.5" /> Historique ({diagnosticHistory.length})
              </button>
            </div>
          </div>
        </div>
      </div>

      {activeTab === 'generate' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT COLUMN: Input Form & Clinical Context (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Patient Card & Vitals Summary */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-medical-primary" /> Sélection du Patient
                </h2>
                <span className="text-xs font-semibold text-slate-500">
                  {patients.length} patients inscrits
                </span>
              </div>

              {/* Patient Selector */}
              <select
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.patientCode} - {p.name} ({p.age} ans, {p.gender === 'M' ? 'Homme' : 'Femme'})
                  </option>
                ))}
              </select>

              {/* Active Patient Quick Card */}
              {selectedPatient && (
                <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{selectedPatient.name}</p>
                      <p className="text-[11px] text-slate-500">
                        N° file: <span className="font-bold text-emerald-600">{selectedPatient.queueNumber}</span> | Médecin assigné: {selectedPatient.assignedDoctor || 'Non assigné'}
                      </p>
                    </div>
                    <span className="px-2 py-1 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded-lg">
                      {selectedPatient.status}
                    </span>
                  </div>

                  {/* Vitals preview */}
                  {patientVitals ? (
                    <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-200/60 text-center">
                      <div className="bg-white p-2 rounded-lg border border-slate-200">
                        <p className="text-[10px] text-slate-500 font-medium">Tension</p>
                        <p className="text-xs font-black text-slate-800">
                          {patientVitals.systolic}/{patientVitals.diastolic}
                        </p>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-slate-200">
                        <p className="text-[10px] text-slate-500 font-medium">T° Celcius</p>
                        <p className={`text-xs font-black ${patientVitals.temperature > 38 ? 'text-rose-600' : 'text-slate-800'}`}>
                          {patientVitals.temperature}°C
                        </p>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-slate-200">
                        <p className="text-[10px] text-slate-500 font-medium">Pouls</p>
                        <p className="text-xs font-black text-slate-800">{patientVitals.pulse} bpm</p>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-slate-200">
                        <p className="text-[10px] text-slate-500 font-medium">SpO2</p>
                        <p className={`text-xs font-black ${patientVitals.spO2 < 95 ? 'text-amber-600' : 'text-slate-800'}`}>
                          {patientVitals.spO2}%
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-[11px] text-slate-500 italic text-center py-1">
                      Aucune constante récente enregistrée pour ce patient.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Symptom Selection & Clinical Context */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-500" /> Symptômes & Tableau Clinique
                </h2>
                <span className="text-[11px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                  {selectedSymptoms.length} sélectionné(s)
                </span>
              </div>

              {/* Preset Symptom Tags Grid */}
              <div className="flex flex-wrap gap-2">
                {PRESET_SYMPTOMS.map((symptom) => {
                  const isSelected = selectedSymptoms.includes(symptom)
                  return (
                    <button
                      key={symptom}
                      type="button"
                      onClick={() => toggleSymptom(symptom)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-emerald-500 text-white border-emerald-600 shadow-xs scale-105'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {isSelected ? '✓ ' : '+ '}{symptom}
                    </button>
                  )
                })}
              </div>

              {/* Custom Symptom Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ajouter un symptôme spécifique (ex: Pharyngite, Toux nocturne...)"
                  value={customSymptomInput}
                  onChange={(e) => setCustomSymptomInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomSymptom())}
                  className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  onClick={handleAddCustomSymptom}
                  className="px-3 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-900 transition-all cursor-pointer"
                >
                  Ajouter
                </button>
              </div>

              {/* Chief Complaint Textarea */}
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-bold text-slate-700">Motif Majeur de Consultation</label>
                <textarea
                  rows={2}
                  value={chiefComplaint}
                  onChange={(e) => setChiefComplaint(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Description détaillée des plaintes exprimées par le patient..."
                />
              </div>

              {/* Clinical Observations Textarea */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Examen Physique & Remarques Médicales</label>
                <textarea
                  rows={2}
                  value={clinicalNotes}
                  onChange={(e) => setClinicalNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Auscultation, palpation, antécédents notables..."
                />
              </div>

              {/* Biology & Current Medications Inputs */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-700">Résultats Bio (optionnel)</label>
                  <input
                    type="text"
                    value={labInput}
                    onChange={(e) => setLabInput(e.target.value)}
                    placeholder="Ex: Troponine: 0.02, CRP: 14"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 mt-1"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700">Traitements Actuels</label>
                  <input
                    type="text"
                    value={medicationsInput}
                    onChange={(e) => setMedicationsInput(e.target.value)}
                    placeholder="Ex: Amlodipine, Aspirine"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 mt-1"
                  />
                </div>
              </div>

              {/* Axios Payload Drawer Toggle */}
              <div className="pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAxiosPayload(!showAxiosPayload)}
                  className="text-[11px] font-semibold text-slate-500 hover:text-emerald-600 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Database className="w-3.5 h-3.5" />
                  {showAxiosPayload ? 'Masquer la structure de la requête HTTP Axios' : 'Afficher le Payload HTTP Axios (JSON)'}
                </button>

                {showAxiosPayload && (
                  <pre className="mt-2 p-3 bg-slate-900 text-emerald-400 rounded-xl text-[10px] font-mono overflow-x-auto max-h-40 border border-slate-800">
{JSON.stringify(
  {
    method: 'POST',
    url: 'http://localhost:5030/api/ai/diagnose',
    headers: { 'Content-Type': 'application/json' },
    data: {
      patientId: selectedPatient?.id,
      patientName: selectedPatient?.name,
      symptoms: selectedSymptoms,
      chiefComplaint,
      vitals: patientVitals
    }
  },
  null,
  2
)}
                  </pre>
                )}
              </div>

              {/* Main Submit Action Button */}
              <button
                type="button"
                onClick={handleRunAIDiagnosis}
                disabled={isLoading || !selectedPatient}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-500 via-teal-600 to-emerald-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-sm rounded-xl shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-3 transition-all cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Requête Axios en cours (Étape {loadingStep}/3)...</span>
                  </>
                ) : (
                  <>
                    <Brain className="w-5 h-5 text-emerald-200" />
                    <span>Lancer l'Analyse Médicale IA (HTTP Axios)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: Results & AI Analysis Dashboard (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {isLoading ? (
              /* Loading Animation State */
              <div className="bg-white rounded-2xl p-12 border border-slate-200 shadow-sm text-center space-y-6 min-h-[500px] flex flex-col items-center justify-center">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin flex items-center justify-center" />
                  <Brain className="w-8 h-8 text-emerald-600 absolute inset-0 m-auto animate-pulse" />
                </div>
                <div className="space-y-2 max-w-md">
                  <h3 className="text-lg font-bold text-slate-800">Calcul des Recommandations Cliniques...</h3>
                  <p className="text-xs text-slate-500">
                    Transmission du payload HTTP JSON via Axios et exécution de l'algorithme d'inférence médicale.
                  </p>
                </div>

                {/* Progress Timeline */}
                <div className="w-full max-w-md space-y-3 pt-4 text-left">
                  <div className="flex items-center gap-3 text-xs font-semibold text-slate-700">
                    <CheckCircle2 className={`w-4 h-4 ${loadingStep >= 1 ? 'text-emerald-500' : 'text-slate-300'}`} />
                    <span>Transmission HTTP POST à l'API backend</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-semibold text-slate-700">
                    <CheckCircle2 className={`w-4 h-4 ${loadingStep >= 2 ? 'text-emerald-500' : 'text-slate-300'}`} />
                    <span>Cross-référencement de la base d'ontologie ICD-10</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-semibold text-slate-700">
                    <CheckCircle2 className={`w-4 h-4 ${loadingStep >= 3 ? 'text-emerald-500' : 'text-slate-300'}`} />
                    <span>Vérification des interactions médicamenteuses</span>
                  </div>
                </div>
              </div>
            ) : diagnosisResult ? (
              /* Diagnosis Result Dashboard */
              <div className="space-y-6 animate-fade-in">
                {/* Risk Level Banner */}
                <div className={`p-5 rounded-2xl border shadow-sm flex items-center justify-between ${getRiskBadge(diagnosisResult.riskLevel)}`}>
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-white/40 border border-current/20">
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs uppercase tracking-wider font-extrabold">Évaluation du Risque Clinique</span>
                        <span className="px-2 py-0.5 text-[10px] rounded-full bg-white/60 font-bold border">
                          {diagnosisResult.isSimulated ? 'Simulé localement' : 'Réponse Axios HTTP'}
                        </span>
                      </div>
                      <h3 className="text-xl font-black">{diagnosisResult.riskLevel}</h3>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-[11px] font-semibold opacity-80">Indice de Confiance IA</p>
                    <p className="text-2xl font-black">{diagnosisResult.aiConfidenceOverall}%</p>
                  </div>
                </div>

                {/* Primary Diagnoses Cards */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-emerald-500" /> Diagnostics Principaux Retenus
                    </h3>
                    <span className="text-xs font-mono text-slate-400">
                      Latence HTTP: {diagnosisResult.latencyMs}ms
                    </span>
                  </div>

                  <div className="space-y-4">
                    {diagnosisResult.primaryDiagnoses.map((diag, index) => (
                      <div
                        key={index}
                        className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/80 space-y-3 hover:border-emerald-300 transition-all"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded-md bg-slate-900 text-emerald-400 font-mono text-[10px] font-bold">
                                ICD-10: {diag.icd10}
                              </span>
                              <h4 className="text-sm font-bold text-slate-900">{diag.name}</h4>
                            </div>
                            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                              {diag.justification}
                            </p>
                          </div>

                          <div className="shrink-0 text-right">
                            <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                              {diag.confidence}% match
                            </span>
                          </div>
                        </div>

                        {/* Suggested Exams & Treatments */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-slate-200/60 text-xs">
                          <div>
                            <p className="font-bold text-slate-700 mb-1 flex items-center gap-1">
                              <FileText className="w-3.5 h-3.5 text-blue-500" /> Examens Recommandés :
                            </p>
                            <ul className="space-y-1 text-slate-600 text-[11px]">
                              {diag.recommendedExams.map((exam, i) => (
                                <li key={i} className="flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                  {exam}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <p className="font-bold text-slate-700 mb-1 flex items-center gap-1">
                              <Pill className="w-3.5 h-3.5 text-purple-500" /> Orientation Thérapeutique :
                            </p>
                            <ul className="space-y-1 text-slate-600 text-[11px]">
                              {diag.suggestedTreatments.map((treat, i) => (
                                <li key={i} className="flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                                  {treat}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Differential Diagnoses Table */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-blue-500" /> Diagnostics Différentiels à Éliminer
                  </h3>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
                          <th className="p-2.5">Hypothèse</th>
                          <th className="p-2.5">Code CIM-10</th>
                          <th className="p-2.5">Probabilité</th>
                          <th className="p-2.5">Arguments Cliniques</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {diagnosisResult.differentialDiagnoses.map((diff, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/60">
                            <td className="p-2.5 font-bold text-slate-900">{diff.name}</td>
                            <td className="p-2.5 font-mono text-[11px] text-slate-500">{diff.icd10}</td>
                            <td className="p-2.5">
                              <span className="font-bold text-slate-800">{diff.probability}%</span>
                            </td>
                            <td className="p-2.5 text-slate-600 text-[11px]">{diff.rationale}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Pharmacological Safety Alerts */}
                {diagnosisResult.drugInteractionAlerts.length > 0 && (
                  <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200/80 space-y-2">
                    <h4 className="text-xs font-bold text-amber-900 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-amber-600" /> Analyse de Sécurité Pharmacologique (Axios API)
                    </h4>
                    <ul className="space-y-1">
                      {diagnosisResult.drugInteractionAlerts.map((alert, i) => (
                        <li key={i} className="text-xs text-amber-800 flex items-start gap-2">
                          <span className="text-amber-500 font-bold">•</span>
                          <span>{alert}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Action Buttons Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyReport}
                      className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      {copiedSuccess ? 'Copié !' : 'Copier le Rapport'}
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    {saveSuccess && (
                      <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 animate-fade-in">
                        <Check className="w-4 h-4" /> Ajouté au dossier médical !
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={handleSaveToMedicalRecord}
                      className="px-5 py-2.5 bg-medical-primary hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      Insérer au Dossier Médical du Patient
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Idle Empty State */
              <div className="bg-white rounded-2xl p-12 border border-slate-200 shadow-sm text-center space-y-4 min-h-[500px] flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                  <Brain className="w-8 h-8" />
                </div>
                <div className="max-w-md space-y-2">
                  <h3 className="text-base font-bold text-slate-800">Prêt pour l'Analyse IA</h3>
                  <p className="text-xs text-slate-500">
                    Sélectionnez les symptômes du patient dans le panneau de gauche et cliquez sur **Lancer l'Analyse Médicale IA** pour générer les hypothèses cliniques via Axios HTTP.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* TAB 2: History Register */
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Historique des Analyses IA Générées</h2>
              <p className="text-xs text-slate-500">
                Registre local des diagnostics calculés par le moteur IA via requêtes Axios HTTP.
              </p>
            </div>
          </div>

          {diagnosticHistory.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs italic">
              Aucun rapport de diagnostic IA n'a encore été généré pendant cette session.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold">
                    <th className="p-3">Horodatage</th>
                    <th className="p-3">Patient</th>
                    <th className="p-3">Niveau de Risque</th>
                    <th className="p-3">Diagnostic Principal</th>
                    <th className="p-3">Score Confiance</th>
                    <th className="p-3">Mode Transport</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {diagnosticHistory.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80">
                      <td className="p-3 font-mono text-[11px]">{item.timestamp}</td>
                      <td className="p-3 font-bold text-slate-900">{item.patientName}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] border ${getRiskBadge(item.riskLevel)}`}>
                          {item.riskLevel}
                        </span>
                      </td>
                      <td className="p-3 font-semibold text-slate-800">
                        [{item.primaryDiagnoses[0]?.icd10}] {item.primaryDiagnoses[0]?.name}
                      </td>
                      <td className="p-3 font-bold text-emerald-600">{item.aiConfidenceOverall}%</td>
                      <td className="p-3 font-mono text-[10px] text-slate-400">
                        {item.isSimulated ? 'Simulé' : `Axios HTTP ${item.httpStatus}`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
