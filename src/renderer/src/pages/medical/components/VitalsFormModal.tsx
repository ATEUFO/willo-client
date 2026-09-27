import React, { useState, useMemo } from 'react'
import {
  Activity,
  Heart,
  Thermometer,
  Weight,
  AlertTriangle,
  CheckCircle,
  X
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Patient } from '../../store/hospitalStore'

interface VitalsFormModalProps {
  patient: Patient
  onClose: () => void
  onSave: (vitals: {
    systolic: number
    diastolic: number
    temperature: number
    pulse: number
    weight: number
    spO2: number
    isAbnormal: boolean
    nurseNotes: string
  }) => void
}

export const VitalsFormModal: React.FC<VitalsFormModalProps> = ({ patient, onClose, onSave }) => {
  const { t } = useTranslation('medical')
  const [systolic, setSystolic] = useState<number>(120)
  const [diastolic, setDiastolic] = useState<number>(80)
  const [temperature, setTemperature] = useState<number>(37.0)
  const [pulse, setPulse] = useState<number>(75)
  const [weight, setWeight] = useState<number>(70.0)
  const [spO2, setSpO2] = useState<number>(98)
  const [nurseNotes, setNurseNotes] = useState<string>('')

  const isAbnormal = useMemo(() => {
    return (
      systolic > 140 ||
      diastolic > 90 ||
      systolic < 90 ||
      temperature > 38.0 ||
      temperature < 35.5 ||
      pulse > 100 ||
      pulse < 55 ||
      spO2 < 95
    )
  }, [systolic, diastolic, temperature, pulse, spO2])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      systolic,
      diastolic,
      temperature,
      pulse,
      weight,
      spO2,
      isAbnormal,
      nurseNotes
    })
  }

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white border border-slate-800/20 rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto flex flex-col relative">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-medical-border bg-slate-50 rounded-t-2xl">
          <div>
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Activity className="w-5 h-5 text-medical-primary" />
              {t('vitalsModal.title')}
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              Patient : {patient.name} ({patient.patientCode})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="p-5 space-y-5 flex-1 text-left">
          {/* Status Indicator Bar */}
          {isAbnormal ? (
            <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 text-medical-danger rounded-xl text-xs font-bold animate-pulse">
              <AlertTriangle className="w-4 h-4" />
              {t('vitalsModal.warningAbnormal')}
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-2 bg-medical-subtle border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold">
              <CheckCircle className="w-4 h-4 text-medical-primary" />
              {t('vitalsModal.allNormal')}
            </div>
          )}

          {/* Grid Parameters Inputs */}
          <div className="grid grid-cols-2 gap-4">
            {/* Tension Artérielle */}
            <div
              className={`p-3 rounded-xl border space-y-1.5 ${
                systolic > 140 || diastolic > 90 || systolic < 90
                  ? 'bg-red-50/50 border-red-200'
                  : 'bg-slate-50 border-medical-border'
              }`}
            >
              <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 text-medical-danger" /> {t('vitalsModal.tensionLabel')}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={systolic}
                  onChange={(e) => setSystolic(parseInt(e.target.value) || 0)}
                  className="w-full bg-white border border-medical-border rounded-lg p-1.5 text-center text-xs font-bold font-mono focus:outline-none focus:border-medical-primary"
                  placeholder="Sys"
                  required
                />
                <span className="text-slate-400 font-bold">/</span>
                <input
                  type="number"
                  value={diastolic}
                  onChange={(e) => setDiastolic(parseInt(e.target.value) || 0)}
                  className="w-full bg-white border border-medical-border rounded-lg p-1.5 text-center text-xs font-bold font-mono focus:outline-none focus:border-medical-primary"
                  placeholder="Dia"
                  required
                />
              </div>
            </div>

            {/* Température */}
            <div
              className={`p-3 rounded-xl border space-y-1.5 ${
                temperature > 38.0 || temperature < 35.5
                  ? 'bg-amber-50/50 border-amber-200'
                  : 'bg-slate-50 border-medical-border'
              }`}
            >
              <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                <Thermometer className="w-3.5 h-3.5 text-amber-500" /> {t('vitalsModal.tempLabel')}
              </label>
              <input
                type="number"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value) || 0)}
                className="w-full bg-white border border-medical-border rounded-lg p-1.5 text-center text-xs font-bold font-mono focus:outline-none focus:border-medical-primary"
                required
              />
            </div>

            {/* Pouls BPM */}
            <div
              className={`p-3 rounded-xl border space-y-1.5 ${
                pulse > 100 || pulse < 55
                  ? 'bg-red-50/50 border-red-200'
                  : 'bg-slate-50 border-medical-border'
              }`}
            >
              <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-medical-primary" /> {t('vitalsModal.pulseLabel')}
              </label>
              <input
                type="number"
                value={pulse}
                onChange={(e) => setPulse(parseInt(e.target.value) || 0)}
                className="w-full bg-white border border-medical-border rounded-lg p-1.5 text-center text-xs font-bold font-mono focus:outline-none focus:border-medical-primary"
                required
              />
            </div>

            {/* Saturation SpO2 */}
            <div
              className={`p-3 rounded-xl border space-y-1.5 ${
                spO2 < 95 ? 'bg-red-50/50 border-red-200' : 'bg-slate-50 border-medical-border'
              }`}
            >
              <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-cyan-600" /> {t('vitalsModal.spO2Label')}
              </label>
              <input
                type="number"
                value={spO2}
                onChange={(e) => setSpO2(parseInt(e.target.value) || 0)}
                className="w-full bg-white border border-medical-border rounded-lg p-1.5 text-center text-xs font-bold font-mono focus:outline-none focus:border-medical-primary"
                required
              />
            </div>

            {/* Poids corporel */}
            <div className="p-3 bg-slate-50 border border-medical-border rounded-xl space-y-1.5">
              <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                <Weight className="w-3.5 h-3.5 text-blue-500" /> {t('vitalsModal.weightLabel')}
              </label>
              <input
                type="number"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
                className="w-full bg-white border border-medical-border rounded-lg p-1.5 text-center text-xs font-bold font-mono focus:outline-none focus:border-medical-primary"
                required
              />
            </div>
          </div>

          {/* Nurse notes */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-700">
              {t('vitalsModal.nurseNotesLabel')}
            </label>
            <textarea
              rows={3}
              value={nurseNotes}
              onChange={(e) => setNurseNotes(e.target.value)}
              placeholder={t('vitalsModal.nurseNotesPlaceholder')}
              className="w-full bg-white border border-medical-border rounded-xl p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-medical-primary"
            />
          </div>

          {/* Buttons Footer */}
          <div className="flex gap-2 justify-end border-t border-medical-border pt-4 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              {t('vitalsModal.cancel')}
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-medical-primary hover:bg-medical-hover text-white rounded-xl text-xs font-bold shadow-sm transition-colors cursor-pointer"
            >
              {t('vitalsModal.submit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
