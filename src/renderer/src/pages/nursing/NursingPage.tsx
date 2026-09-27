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
import { useTranslation } from 'react-i18next'
import { useHospitalStore } from '../store/hospitalStore'

export const NursingPage: React.FC = () => {
  const { t } = useTranslation('nursing')
  const {
    patients,
    vitals,
    careTasks,
    addVitals,
    toggleCareTaskStatus,
    showNotification
  } = useHospitalStore()

  const [activeTab, setActiveTab] = useState<'worklist' | 'vitals_history' | 'care_plan'>('worklist')

  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null)

  // Vitals form
  const [systolic, setSystolic] = useState<number>(120)
  const [diastolic, setDiastolic] = useState<number>(80)
  const [temperature, setTemperature] = useState<number>(37.0)
  const [pulse, setPulse] = useState<number>(75)
  const [weight, setWeight] = useState<number>(70.0)
  const [spO2, setSpO2] = useState<number>(98)
  const [nurseNotes, setNurseNotes] = useState<string>('')

  // Waiting list for vitals (only patients who haven't taken vitals yet)
  const waitingPatients = patients.filter((p) => p.status === 'Waiting')

  // Currently selected patient must be in waitingPatients queue
  const selectedPatient = waitingPatients.find((p) => p.id === selectedPatientId) || waitingPatients[0] || null

  // Abnormal checks
  const isAbnormal =
    systolic > 140 || diastolic > 90 || systolic < 90 || temperature > 38.0 || pulse > 100 || spO2 < 95

  const handleSaveVitals = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPatient) return

    await addVitals({
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

    showNotification(t('worklist.successNotification', { name: selectedPatient.name }), {
      title: t('worklist.notificationTitle'),
      type: 'success'
    })
    setNurseNotes('')
    setSelectedPatientId(null)
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header & Tabs */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-medical-border pb-4">
        <div>
          <h2 className="text-2xl font-bold text-medical-dark flex items-center gap-2">
            <Activity className="w-7 h-7 text-medical-primary" />
            {t('title')}
          </h2>
          <p className="text-sm text-slate-500">
            {t('subtitle')}
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
            {t('tabs.worklist', { count: waitingPatients.length })}
          </button>
          <button
            onClick={() => setActiveTab('vitals_history')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${activeTab === 'vitals_history'
                ? 'bg-medical-primary text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
          >
            <FileText className="w-3.5 h-3.5" />
            {t('tabs.vitalsHistory', { count: vitals.length })}
          </button>
          <button
            onClick={() => setActiveTab('care_plan')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${activeTab === 'care_plan'
                ? 'bg-medical-primary text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
          >
            <Syringe className="w-3.5 h-3.5" />
            {t('tabs.carePlan', { count: careTasks.filter((t) => t.status === 'Pending').length })}
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
              {t('worklist.waitingTitle', { count: waitingPatients.length })}
            </h3>

            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {waitingPatients.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400 font-medium bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  {t('worklist.noPatients')}
                </div>
              ) : (
                waitingPatients.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => setSelectedPatientId(p.id)}
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
                      <span>{p.gender}, {t('worklist.yearsOld', { age: p.age })} • {p.bloodType}</span>
                      <span className="text-slate-400 font-mono">{p.arrivalTime}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Form Rapid Intake Vitals */}
          <div className="lg:col-span-2 bg-medical-cardBg border border-medical-border rounded-xl p-5 space-y-5 shadow-sm">
            {selectedPatient ? (
              <form onSubmit={handleSaveVitals} className="space-y-5">
                <div className="flex items-center justify-between border-b border-medical-border pb-3">
                  <div>
                    <h3 className="font-bold text-medical-dark text-base">
                      {t('worklist.formTitle')} <span className="text-medical-primary">{selectedPatient.name}</span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      {t('worklist.patientCode', { code: selectedPatient.patientCode })} • {t('worklist.assignedDoctor', { doctor: selectedPatient.assignedDoctor })}
                    </p>
                  </div>

                  {/* Abnormal Alert Indicator */}
                  {isAbnormal ? (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-200 text-medical-danger rounded-xl text-xs font-bold animate-pulse">
                      <AlertTriangle className="w-4 h-4" />
                      {t('worklist.abnormalAlert')}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-medical-subtle border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold">
                      <CheckCircle className="w-4 h-4 text-medical-primary" />
                      {t('worklist.normalAlert')}
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
                        {t('worklist.tensionLabel')}
                      </label>
                      <span className="text-[10px] text-slate-400">{t('worklist.tensionRef')}</span>
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
                        {t('worklist.tempLabel')}
                      </label>
                      <span className="text-[10px] text-slate-400">{t('worklist.tempRef')}</span>
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
                        {t('worklist.pulseLabel')}
                      </label>
                      <span className="text-[10px] text-slate-400">{t('worklist.pulseRef')}</span>
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
                        {t('worklist.weightLabel')}
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
                        {t('worklist.spO2Label')}
                      </label>
                      <span className="text-[10px] text-slate-400">{t('worklist.spO2Ref')}</span>
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
                  <label className="block text-xs font-semibold text-slate-700 mb-1">{t('worklist.nurseNotesLabel')}</label>
                  <textarea
                    rows={3}
                    value={nurseNotes}
                    onChange={(e) => setNurseNotes(e.target.value)}
                    placeholder={t('worklist.nurseNotesPlaceholder')}
                    className="w-full bg-white border border-medical-border rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-medical-primary"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-medical-primary hover:bg-medical-hover text-white font-semibold py-3 rounded-xl transition-all shadow-sm"
                >
                  {t('worklist.submitBtn')}
                </button>
              </form>
            ) : (
              <div className="p-12 text-center text-slate-400 font-medium text-sm">
                {waitingPatients.length === 0
                  ? t('worklist.noPatients')
                  : t('worklist.selectPatientPrompt')}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Vitals History */}
      {activeTab === 'vitals_history' && (
        <div className="bg-medical-cardBg border border-medical-border rounded-xl p-5 space-y-4 shadow-sm">
          <h3 className="font-bold text-medical-dark text-base">{t('history.title')}</h3>

          <div className="overflow-x-auto rounded-xl border border-medical-border">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-mono border-b border-medical-border">
                <tr>
                  <th className="p-3">{t('history.columns.timestamp')}</th>
                  <th className="p-3">{t('history.columns.patient')}</th>
                  <th className="p-3">{t('history.columns.tension')}</th>
                  <th className="p-3">{t('history.columns.temperature')}</th>
                  <th className="p-3">{t('history.columns.pulse')}</th>
                  <th className="p-3">{t('history.columns.weight')}</th>
                  <th className="p-3">{t('history.columns.spO2')}</th>
                  <th className="p-3">{t('history.columns.visualDiagnostic')}</th>
                  <th className="p-3">{t('history.columns.observations')}</th>
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
                          {t('history.abnormalTag')}
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-medical-subtle text-emerald-800 border border-emerald-200">
                          {t('history.normalTag')}
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
              <h3 className="font-bold text-medical-dark text-base">{t('carePlan.title')}</h3>
              <p className="text-xs text-slate-500">{t('carePlan.subtitle')}</p>
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
                    <p className="text-[11px] text-slate-500">{t('carePlan.prescribedBy', { doctor: task.prescribedBy, time: task.timeScheduled })}</p>
                  </div>
                </div>

                <div>
                  {task.status === 'Administered' ? (
                    <span className="text-xs text-emerald-800 font-semibold flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5 text-medical-primary" /> {t('carePlan.administeredAt', { time: task.administeredAt })}
                    </span>
                  ) : (
                    <span className="text-xs text-amber-700 font-semibold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 animate-pulse text-amber-500" /> {t('carePlan.toAdminister')}
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

