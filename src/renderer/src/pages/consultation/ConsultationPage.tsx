import React, { useState } from 'react'
import {
  Stethoscope,
  Brain,
  FileText,
  Pill,
  Plus,
  Trash2,
  User,
  CheckCircle,
  Sparkles,
  Send
} from 'lucide-react'
import { useHospitalStore, Patient } from '../../store/hospitalStore'

export const ConsultationPage: React.FC = () => {
  const {
    patients,
    vitals,
    labRequests,
    addConsultation
  } = useHospitalStore()

  // Selected Patient
  const [selectedPatient, setSelectedPatient] = useState<Patient>(patients[2] || patients[0])
  const [activeTab360, setActiveTab360] = useState<'history' | 'vitals' | 'prescriptions' | 'labs'>('vitals')

  // Consultation Form State
  const [chiefComplaint, setChiefComplaint] = useState('Douleurs thoraciques et dyspnée à l\'effort.')
  const [clinicalNotes, setClinicalNotes] = useState('Patient masculin de 45 ans avec antécédent d\'hypertension. Auscultation régulière sans souffle.')
  const [diagnoses, setDiagnoses] = useState<string[]>(['I10 - Hypertension artérielle essentielle'])
  const [diagnosisInput, setDiagnosisInput] = useState('')

  // Prescriptions List
  const [prescriptions, setPrescriptions] = useState<{ drugName: string; dosage: string; frequency: string; duration: string }[]>([
    { drugName: 'Amlodipine 10mg', dosage: '1 comprimé', frequency: 'Matin', duration: '30 jours' }
  ])
  const [newDrug, setNewDrug] = useState({ drugName: '', dosage: '1 comp', frequency: 'Matin/Soir', duration: '7 jours' })

  // Lab Orders & AI State
  const [labOrders] = useState<string[]>(['NFS Complète', 'Glycémie à jeun'])
  const [aiSymptoms, setAiSymptoms] = useState('Douleur thoracique, dyspnée à l\'effort, céphalées matinales')
  const [aiSuggestions] = useState<{ name: string; probability: string; details: string }[]>([
    { name: 'Hypertension Artérielle Grade 2', probability: '88%', details: 'Compatible avec céphalées et dyspnée. Vérifier fond d\'œil et ECG.' },
    { name: 'Angine de Poitrine d\'Effort', probability: '65%', details: 'Si la douleur irradie au bras gauche. Prescrire Troponine & ECG.' },
    { name: 'Syndrome d\'Apnée du Sommeil', probability: '42%', details: 'Si ronflements et asthénie matinale associés.' }
  ])
  const [aiInteractionAlerts] = useState<string[]>([
    'Vérification IA : Aucune interaction néfaste majeure détectée entre Amlodipine et les traitements antérieurs.'
  ])

  const handleAddDiagnosis = () => {
    if (!diagnosisInput.trim()) return
    setDiagnoses([...diagnoses, diagnosisInput.trim()])
    setDiagnosisInput('')
  }

  const handleRemoveDiagnosis = (index: number) => {
    setDiagnoses(diagnoses.filter((_, i) => i !== index))
  }

  const handleAddPrescription = () => {
    if (!newDrug.drugName) return
    setPrescriptions([...prescriptions, { ...newDrug }])
    setNewDrug({ drugName: '', dosage: '1 comp', frequency: 'Matin/Soir', duration: '7 jours' })
  }

  const handleRemovePrescription = (index: number) => {
    setPrescriptions(prescriptions.filter((_, i) => i !== index))
  }

  const handleSaveConsultation = (e: React.FormEvent) => {
    e.preventDefault()
    addConsultation({
      patientId: selectedPatient.id,
      patientName: selectedPatient.name,
      doctorName: 'Dr. Sarah Kouassi',
      chiefComplaint,
      clinicalNotes,
      diagnoses,
      prescriptions,
      labOrders
    })

    alert(`Consultation enregistrée avec succès pour ${selectedPatient.name}!`)
  }

  // Filter vitals for patient
  const patientVitals = vitals.filter((v) => v.patientId === selectedPatient.id)
  const patientLabs = labRequests.filter((l) => l.patientId === selectedPatient.id)

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Stethoscope className="w-7 h-7 text-indigo-400" />
            Espace Consultation Médicale
          </h2>
          <p className="text-sm text-slate-400">
            Dossier médical électronique 360°, prescription et module d'assistance IA
          </p>
        </div>

        {/* Patient Picker Select */}
        <div className="flex items-center gap-3 bg-slate-900 p-2 rounded-xl border border-slate-800">
          <User className="w-4 h-4 text-indigo-400" />
          <span className="text-xs text-slate-400">Patient Actif:</span>
          <select
            value={selectedPatient.id}
            onChange={(e) => {
              const p = patients.find((pat) => pat.id === e.target.value)
              if (p) setSelectedPatient(p)
            }}
            className="bg-slate-950 text-slate-100 text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-indigo-500"
          >
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.queueNumber} - {p.status})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Grid: Left 360 View & Consultation Form | Right AI Sidepanel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols wide) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Dossier Médical Électronique (Vue 360) */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold">
                  {selectedPatient.gender}
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 text-base">{selectedPatient.name}</h3>
                  <p className="text-xs text-slate-400">
                    {selectedPatient.age} ans • Groupe {selectedPatient.bloodType} • Tel: {selectedPatient.phone}
                  </p>
                </div>
              </div>

              {/* Vue 360 Tabs */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                <button
                  onClick={() => setActiveTab360('vitals')}
                  className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                    activeTab360 === 'vitals' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Constantes du jour
                </button>
                <button
                  onClick={() => setActiveTab360('history')}
                  className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                    activeTab360 === 'history' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Historique
                </button>
                <button
                  onClick={() => setActiveTab360('prescriptions')}
                  className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                    activeTab360 === 'prescriptions' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Prescriptions
                </button>
                <button
                  onClick={() => setActiveTab360('labs')}
                  className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                    activeTab360 === 'labs' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Analyses Labo ({patientLabs.length})
                </button>
              </div>
            </div>

            {/* Content for Vue 360 */}
            {activeTab360 === 'vitals' && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                {patientVitals.length > 0 ? (
                  <>
                    <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                      <span className="text-slate-400 block">Tension Artérielle</span>
                      <span className="text-sm font-bold text-slate-100">{patientVitals[0].systolic}/{patientVitals[0].diastolic} mmHg</span>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                      <span className="text-slate-400 block">Température</span>
                      <span className="text-sm font-bold text-amber-400">{patientVitals[0].temperature} °C</span>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                      <span className="text-slate-400 block">Pouls</span>
                      <span className="text-sm font-bold text-emerald-400">{patientVitals[0].pulse} bpm</span>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                      <span className="text-slate-400 block">SpO2 / Poids</span>
                      <span className="text-sm font-bold text-cyan-400">{patientVitals[0].spO2}% • {patientVitals[0].weight} kg</span>
                    </div>
                  </>
                ) : (
                  <div className="col-span-4 p-4 text-center text-slate-500">Aucune constante saisie aujourd'hui pour ce patient</div>
                )}
              </div>
            )}

            {activeTab360 === 'history' && (
              <div className="text-xs text-slate-300 space-y-2 bg-slate-950 p-3 rounded-lg border border-slate-800">
                <p><strong className="text-indigo-400">Antecedents Médicaux:</strong> Hypertension artérielle depuis 2021, pas de chirurgie majeure.</p>
                <p><strong className="text-rose-400">Allergies Connues:</strong> Pénicilline (Éruption cutanée).</p>
              </div>
            )}

            {activeTab360 === 'labs' && (
              <div className="space-y-2 text-xs">
                {patientLabs.map((l) => (
                  <div key={l.id} className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex justify-between items-center">
                    <div>
                      <span className="font-bold text-slate-200">{l.testName}</span>
                      <span className="text-slate-400 block text-[11px]">{l.category} • {l.dateRequested}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-400 font-bold">
                      {l.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Formulaire de Consultation & Prescription */}
          <form onSubmit={handleSaveConsultation} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5">
            <h3 className="font-semibold text-slate-100 text-base flex items-center gap-2 border-b border-slate-800 pb-3">
              <FileText className="w-5 h-5 text-indigo-400" />
              Saisie de Consultation & Prescriptions
            </h3>

            {/* Motif & Clinical Notes */}
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Motif Principale de Consultation</label>
                <input
                  type="text"
                  value={chiefComplaint}
                  onChange={(e) => setChiefComplaint(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Notes Cliniques & Observations</label>
                <textarea
                  rows={4}
                  value={clinicalNotes}
                  onChange={(e) => setClinicalNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Diagnostic Selector */}
            <div className="space-y-2 text-xs">
              <label className="block text-slate-400 font-medium">Diagnostic Retenu (CIM-10)</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Rechercher code ou libellé (Ex: I10 - HTA, E11 - Diabète...)"
                  value={diagnosisInput}
                  onChange={(e) => setDiagnosisInput(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleAddDiagnosis}
                  className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Ajouter
                </button>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {diagnoses.map((diag, idx) => (
                  <span key={idx} className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 rounded-lg text-xs flex items-center gap-2">
                    {diag}
                    <button type="button" onClick={() => handleRemoveDiagnosis(idx)} className="hover:text-rose-400">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Prescription Builder */}
            <div className="space-y-3 text-xs border-t border-slate-800 pt-4">
              <h4 className="font-semibold text-slate-200 flex items-center gap-2">
                <Pill className="w-4 h-4 text-purple-400" />
                Ordonnance Médicamenteuse (Auto-complétion Pharmacie)
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                <input
                  type="text"
                  placeholder="Médicament (Ex: Paracétamol 500mg)"
                  value={newDrug.drugName}
                  onChange={(e) => setNewDrug({ ...newDrug, drugName: e.target.value })}
                  className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
                <input
                  type="text"
                  placeholder="Posologie (Ex: 1 comprimé)"
                  value={newDrug.dosage}
                  onChange={(e) => setNewDrug({ ...newDrug, dosage: e.target.value })}
                  className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
                <input
                  type="text"
                  placeholder="Fréquence (Ex: Matin/Soir)"
                  value={newDrug.frequency}
                  onChange={(e) => setNewDrug({ ...newDrug, frequency: e.target.value })}
                  className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleAddPrescription}
                  className="bg-purple-600 hover:bg-purple-500 text-white rounded-lg p-2 font-medium flex items-center justify-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Prescrire
                </button>
              </div>

              {/* Prescribed list table */}
              <div className="bg-slate-950 border border-slate-800 rounded-lg overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-slate-400 font-mono">
                    <tr>
                      <th className="p-2.5">Médicament</th>
                      <th className="p-2.5">Posologie</th>
                      <th className="p-2.5">Fréquence</th>
                      <th className="p-2.5">Durée</th>
                      <th className="p-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {prescriptions.map((p, idx) => (
                      <tr key={idx}>
                        <td className="p-2.5 font-bold text-slate-200">{p.drugName}</td>
                        <td className="p-2.5 text-slate-300">{p.dosage}</td>
                        <td className="p-2.5 text-slate-400">{p.frequency}</td>
                        <td className="p-2.5 text-slate-400">{p.duration}</td>
                        <td className="p-2.5 text-right">
                          <button type="button" onClick={() => handleRemovePrescription(idx)} className="text-rose-400 hover:text-rose-300">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-indigo-600/20"
            >
              Clôturer la Consultation & Envoyer en Pharmacie/Caisse
            </button>
          </form>
        </div>

        {/* Right Column: AI Assistance Sidepanel */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5 h-fit">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <div className="p-2 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-lg text-white">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-sm flex items-center gap-1">
                Assistant Médical IA <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              </h3>
              <p className="text-[11px] text-slate-400">Aide au diagnostic & interactions médicamenteuses</p>
            </div>
          </div>

          {/* Symptom Input */}
          <div className="space-y-2 text-xs">
            <label className="block text-slate-400 font-medium">Saisir ou analyser les symptômes</label>
            <div className="relative">
              <textarea
                rows={3}
                value={aiSymptoms}
                onChange={(e) => setAiSymptoms(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={() => alert('Analyse des symptômes actualisée par l\'IA!')}
                className="absolute right-2 bottom-2 bg-indigo-600 hover:bg-indigo-500 text-white px-2.5 py-1 rounded-md text-[10px] font-medium flex items-center gap-1"
              >
                <Send className="w-3 h-3" /> Analyser
              </button>
            </div>
          </div>

          {/* AI Diagnostic Suggestions */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Pistes Diagnostiques Suggérées</h4>

            <div className="space-y-2">
              {aiSuggestions.map((sug, idx) => (
                <div key={idx} className="bg-slate-950 border border-slate-800 p-3 rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-300 text-xs">{sug.name}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-indigo-500/20 text-indigo-400 font-bold">
                      {sug.probability}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">{sug.details}</p>
                </div>
              ))}
            </div>
          </div>

          {/* AI Drug Interaction Check */}
          <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl space-y-2 text-xs">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
              <CheckCircle className="w-4 h-4" /> Contrôle d'Interactions
            </div>
            {aiInteractionAlerts.map((alert, idx) => (
              <p key={idx} className="text-slate-300 text-[11px]">{alert}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
