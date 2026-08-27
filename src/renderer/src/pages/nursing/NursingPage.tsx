import React, { useState } from 'react'
import {
  Activity,
  Heart,
  Thermometer,
  Weight,
  Syringe,
  AlertTriangle,
  Clock,
  User,
  CheckCircle,
  FileText
} from 'lucide-react'
import { useHospitalStore, Patient } from '../store/hospitalStore'

export const NursingPage: React.FC = () => {
  const {
    patients,
    vitals,
    careTasks,
    addVitals,
    toggleCareTaskStatus
  } = useHospitalStore()

  const [activeTab, setActiveTab] = useState<'worklist' | 'vitals_history' | 'care_plan'>('worklist')

  // Selected patient for vitals entry
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(patients[0] || null)

  // Vitals form
  const [systolic, setSystolic] = useState<number>(120)
  const [diastolic, setDiastolic] = useState<number>(80)
  const [temperature, setTemperature] = useState<number>(37.0)
  const [pulse, setPulse] = useState<number>(75)
  const [weight, setWeight] = useState<number>(70.0)
  const [spO2, setSpO2] = useState<number>(98)
  const [nurseNotes, setNurseNotes] = useState<string>('')

  // Abnormal checks
  const isAbnormal =
    systolic > 140 || diastolic > 90 || systolic < 90 || temperature > 38.0 || pulse > 100 || spO2 < 95

  const handleSaveVitals = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPatient) return

    addVitals({
      patientId: selectedPatient.id,
      patientName: selectedPatient.name,
      systolic,
      diastolic,
      temperature,
      pulse,
      weight,
      spO2,
      isAbnormal,
      nurseNotes
    })

    alert(`Constantes enregistrées pour ${selectedPatient.name}. Statut mis à jour!`)
    setNurseNotes('')
  }

  // Waiting list for vitals
  const waitingPatients = patients.filter((p) => p.status === 'Waiting' || p.status === 'Vitals Taken')

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header & Tabs */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-medical-border pb-4">
        <div>
          <h2 className="text-2xl font-bold text-medical-dark flex items-center gap-2">
            <Activity className="w-7 h-7 text-medical-primary" />
            Espace Soins & Prise de Constantes
          </h2>
          <p className="text-sm text-slate-500">
            Saisie rapide des paramètres vitaux, alertes d'anomalie et plan d'administration des soins
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-medical-border shadow-sm">
          <button
            onClick={() => setActiveTab('worklist')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${activeTab === 'worklist'
                ? 'bg-medical-primary text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
          >
            <Activity className="w-3.5 h-3.5" />
            Saisie Constantes ({waitingPatients.length})
          </button>
          <button
            onClick={() => setActiveTab('vitals_history')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${activeTab === 'vitals_history'
                ? 'bg-medical-primary text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Historique Relevés ({vitals.length})
          </button>
          <button
            onClick={() => setActiveTab('care_plan')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${activeTab === 'care_plan'
                ? 'bg-medical-primary text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
          >
            <Syringe className="w-3.5 h-3.5" />
            Plan de Soins ({careTasks.filter((t) => t.status === 'Pending').length})
          </button>
        </div>
      </div>

      {/* Tab 1: Worklist & Vitals Entry */}
      {activeTab === 'worklist' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Patient Worklist Side panel */}
          <div className="bg-medical-cardBg border border-medical-border rounded-xl p-4 space-y-3 shadow-sm">
            <h3 className="font-bold text-medical-dark text-sm flex items-center gap-2 border-b border-medical-border pb-2">
              <User className="w-4 h-4 text-medical-primary" />
              Patients en Attente ({waitingPatients.length})
            </h3>

            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {waitingPatients.map((p) => (
                <div
                  key={p.id}
                  onClick={() => setSelectedPatient(p)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${selectedPatient?.id === p.id
                      ? 'bg-medical-subtle border-emerald-300 shadow-xs'
                      : 'bg-white border-medical-border hover:border-slate-300'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs">{p.name}</span>
                    <span className="font-mono text-[10px] text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-200 font-semibold">
                      {p.queueNumber}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                    <span>{p.gender}, {p.age} ans • {p.bloodType}</span>
                    <span className="text-slate-400 font-mono">{p.arrivalTime}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form Rapid Intake Vitals */}
          <div className="lg:col-span-2 bg-medical-cardBg border border-medical-border rounded-xl p-5 space-y-5 shadow-sm">
            {selectedPatient ? (
              <form onSubmit={handleSaveVitals} className="space-y-5">
                <div className="flex items-center justify-between border-b border-medical-border pb-3">
                  <div>
                    <h3 className="font-bold text-medical-dark text-base">
                      Prise de Constantes pour : <span className="text-medical-primary">{selectedPatient.name}</span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      Code Patient : {selectedPatient.patientCode} • Médecin : {selectedPatient.assignedDoctor}
                    </p>
                  </div>

                  {/* Abnormal Alert Indicator */}
                  {isAbnormal ? (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-200 text-medical-danger rounded-xl text-xs font-bold animate-pulse">
                      <AlertTriangle className="w-4 h-4" />
                      Alerte Constantes Anormales !
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-medical-subtle border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold">
                      <CheckCircle className="w-4 h-4 text-medical-primary" />
                      Constantes dans la Norme
                    </div>
                  )}
                </div>

                {/* Vitals Input Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Tension */}
                  <div className={`p-4 rounded-xl border space-y-2 ${systolic > 140 || diastolic > 90 ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-medical-border'}`}>
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                        <Heart className="w-4 h-4 text-medical-danger" />
                        Tension Artérielle (mmHg)
                      </label>
                      <span className="text-[10px] text-slate-400">Réf: 120/80</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={systolic}
                        onChange={(e) => setSystolic(parseInt(e.target.value) || 0)}
                        placeholder="Sys"
                        className="w-full bg-white border border-medical-border rounded-lg p-2 text-center text-sm font-mono text-slate-800 focus:outline-none focus:border-medical-primary"
                      />
                      <span className="text-slate-400 font-bold">/</span>
                      <input
                        type="number"
                        value={diastolic}
                        onChange={(e) => setDiastolic(parseInt(e.target.value) || 0)}
                        placeholder="Dia"
                        className="w-full bg-white border border-medical-border rounded-lg p-2 text-center text-sm font-mono text-slate-800 focus:outline-none focus:border-medical-primary"
                      />
                    </div>
                  </div>

                  {/* Température */}
                  <div className={`p-4 rounded-xl border space-y-2 ${temperature > 38.0 ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-medical-border'}`}>
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                        <Thermometer className="w-4 h-4 text-amber-500" />
                        Température (°C)
                      </label>
                      <span className="text-[10px] text-slate-400">Réf: 36.5 - 37.5</span>
                    </div>
                    <input
                      type="number"
                      step="0.1"
                      value={temperature}
                      onChange={(e) => setTemperature(parseFloat(e.target.value) || 0)}
                      className="w-full bg-white border border-medical-border rounded-lg p-2 text-center text-sm font-mono text-slate-800 focus:outline-none focus:border-medical-primary"
                    />
                  </div>

                  {/* Pouls */}
                  <div className={`p-4 rounded-xl border space-y-2 ${pulse > 100 ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-medical-border'}`}>
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                        <Activity className="w-4 h-4 text-medical-primary" />
                        Pouls (BPM)
                      </label>
                      <span className="text-[10px] text-slate-400">Réf: 60 - 100</span>
                    </div>
                    <input
                      type="number"
                      value={pulse}
                      onChange={(e) => setPulse(parseInt(e.target.value) || 0)}
                      className="w-full bg-white border border-medical-border rounded-lg p-2 text-center text-sm font-mono text-slate-800 focus:outline-none focus:border-medical-primary"
                    />
                  </div>

                  {/* Poids */}
                  <div className="bg-slate-50 border border-medical-border p-4 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                        <Weight className="w-4 h-4 text-blue-500" />
                        Poids Corporel (kg)
                      </label>
                    </div>
                    <input
                      type="number"
                      step="0.1"
                      value={weight}
                      onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
                      className="w-full bg-white border border-medical-border rounded-lg p-2 text-center text-sm font-mono text-slate-800 focus:outline-none focus:border-medical-primary"
                    />
                  </div>

                  {/* SpO2 */}
                  <div className={`p-4 rounded-xl border space-y-2 ${spO2 < 95 ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-medical-border'}`}>
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                        <Activity className="w-4 h-4 text-cyan-600" />
                        Saturation SpO2 (%)
                      </label>
                      <span className="text-[10px] text-slate-400">Réf: 95 - 100%</span>
                    </div>
                    <input
                      type="number"
                      value={spO2}
                      onChange={(e) => setSpO2(parseInt(e.target.value) || 0)}
                      className="w-full bg-white border border-medical-border rounded-lg p-2 text-center text-sm font-mono text-slate-800 focus:outline-none focus:border-medical-primary"
                    />
                  </div>
                </div>

                {/* Nurse Notes */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Observations Infirmier(ère)</label>
                  <textarea
                    rows={3}
                    value={nurseNotes}
                    onChange={(e) => setNurseNotes(e.target.value)}
                    placeholder="Signes cliniques observés, symptômes rapportés..."
                    className="w-full bg-white border border-medical-border rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-medical-primary"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-medical-primary hover:bg-medical-hover text-white font-semibold py-3 rounded-xl transition-all shadow-sm"
                >
                  Valider & Transmettre au Médecin
                </button>
              </form>
            ) : (
              <div className="p-12 text-center text-slate-400">Sélectionnez un patient dans la liste de gauche</div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Vitals History */}
      {activeTab === 'vitals_history' && (
        <div className="bg-medical-cardBg border border-medical-border rounded-xl p-5 space-y-4 shadow-sm">
          <h3 className="font-bold text-medical-dark text-base">Historique des Prises de Constantes</h3>

          <div className="overflow-x-auto rounded-xl border border-medical-border">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-mono border-b border-medical-border">
                <tr>
                  <th className="p-3">Horodatage</th>
                  <th className="p-3">Patient</th>
                  <th className="p-3">Tension</th>
                  <th className="p-3">Température</th>
                  <th className="p-3">Pouls</th>
                  <th className="p-3">Poids</th>
                  <th className="p-3">SpO2</th>
                  <th className="p-3">Diagnostic Visuel</th>
                  <th className="p-3">Observations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-medical-border font-mono text-slate-700">
                {vitals.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 text-slate-500">{v.timestamp}</td>
                    <td className="p-3 font-bold text-slate-900">{v.patientName}</td>
                    <td className="p-3 font-bold text-slate-800">{v.systolic}/{v.diastolic} mmHg</td>
                    <td className={`p-3 font-bold ${v.temperature > 38 ? 'text-medical-danger' : 'text-slate-700'}`}>
                      {v.temperature} °C
                    </td>
                    <td className="p-3 text-slate-700">{v.pulse} bpm</td>
                    <td className="p-3 text-slate-700">{v.weight} kg</td>
                    <td className="p-3 text-slate-700">{v.spO2}%</td>
                    <td className="p-3">
                      {v.isAbnormal ? (
                        <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-red-50 text-medical-danger border border-red-200">
                          Anormal / Alerte
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-medical-subtle text-emerald-800 border border-emerald-200">
                          Normal
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-slate-500 font-sans text-xs max-w-xs truncate">{v.nurseNotes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Care Plan / To-do list */}
      {activeTab === 'care_plan' && (
        <div className="bg-medical-cardBg border border-medical-border rounded-xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-medical-border pb-3">
            <div>
              <h3 className="font-bold text-medical-dark text-base">Plan de Soins (Injections & Pansements)</h3>
              <p className="text-xs text-slate-500">Liste des actes médicaux prescrits à administrer aux patients</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {careTasks.map((task) => (
              <div
                key={task.id}
                className={`p-4 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all ${task.status === 'Administered'
                    ? 'bg-slate-50 border-medical-border opacity-75'
                    : 'bg-white border-emerald-300 shadow-xs'
                  }`}
              >
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => toggleCareTaskStatus(task.id)}
                    className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all ${task.status === 'Administered'
                        ? 'bg-medical-primary border-emerald-500 text-white'
                        : 'border-slate-300 hover:border-emerald-500'
                      }`}
                  >
                    {task.status === 'Administered' && <CheckCircle className="w-4 h-4" />}
                  </button>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{task.patientName}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-700 border border-slate-200">
                        {task.bedNumber}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-medical-subtle text-emerald-800 border border-emerald-200">
                        {task.type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 font-medium">{task.description}</p>
                    <p className="text-[11px] text-slate-500">Prescrit par {task.prescribedBy} • Prévu à {task.timeScheduled}</p>
                  </div>
                </div>

                <div>
                  {task.status === 'Administered' ? (
                    <span className="text-xs text-emerald-800 font-semibold flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5 text-medical-primary" /> Administré à {task.administeredAt}
                    </span>
                  ) : (
                    <span className="text-xs text-amber-700 font-semibold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 animate-pulse text-amber-500" /> À administrer
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
