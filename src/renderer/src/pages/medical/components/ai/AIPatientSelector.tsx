import React from 'react'
import { User } from 'lucide-react'
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
    <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-2">
          <User className="w-4 h-4 text-emerald-500" /> Patient Sélectionné
        </h2>
        <span className="text-[11px] font-semibold text-slate-400">
          {patients.length} Patient(s)
        </span>
      </div>

      <select
        value={selectedPatientId}
        onChange={(e) => setSelectedPatientId(e.target.value)}
        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
      >
        {patients.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name} ({p.age} ans, {p.gender === 'M' ? 'Homme' : 'Femme'}) - Code: {p.patientCode}
          </option>
        ))}
      </select>

      {selectedPatient && (
        <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">{selectedPatient.name}</span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-600 font-semibold">{selectedPatient.age} ans</span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-600 font-semibold">Groupe {selectedPatient.bloodType || 'NR'}</span>
          </div>
          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded-md">
            Dossier Actif
          </span>
        </div>
      )}
    </div>
  )
}
