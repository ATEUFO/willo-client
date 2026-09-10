import React from 'react'
import { Stethoscope } from 'lucide-react'
import { Patient } from '../../../store/hospitalStore'

interface AIPatientSelectorProps {
  patients: Patient[]
  selectedPatientId: string
  setSelectedPatientId: (id: string) => void
  selectedPatient: Patient | null
}

export const AIPatientSelector: React.FC<AIPatientSelectorProps> = ({
  patients,
  selectedPatientId,
  setSelectedPatientId,
  selectedPatient
}) => {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <Stethoscope className="w-4 h-4 text-medical-primary" /> Sélection du Patient
        </h2>
        <span className="text-xs font-semibold text-slate-500">
          {patients.length} Dossier(s) Patient
        </span>
      </div>

      <select
        value={selectedPatientId}
        onChange={(e) => setSelectedPatientId(e.target.value)}
        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
      >
        {patients.map((p) => (
          <option key={p.id} value={p.id}>
            {p.patientCode} - {p.name} ({p.age} ans, {p.gender === 'M' ? 'H' : 'F'})
          </option>
        ))}
      </select>

      {selectedPatient && (
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-900">{selectedPatient.name}</span>
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded-md">
              {selectedPatient.status}
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            Âge: <b>{selectedPatient.age} ans</b> | Groupe: <b>{selectedPatient.bloodType || 'Inconnu'}</b> | N° Passage: <b>{selectedPatient.queueNumber}</b>
          </p>
        </div>
      )}
    </div>
  )
}
