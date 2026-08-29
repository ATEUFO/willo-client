import React, { useState } from 'react'
import {
  Stethoscope,
  Syringe,
  Pill,
  Plus,
  Trash2,
  X
} from 'lucide-react'
import { Patient } from '../../store/hospitalStore'

interface ConsultationFormModalProps {
  patient: Patient
  doctorName: string
  onClose: () => void
  onSave: (consultation: {
    doctorName: string
    chiefComplaint: string
    clinicalNotes: string
    diagnoses: string[]
    prescriptions: { drugName: string; dosage: string; frequency: string; duration: string }[]
    labOrders: string[]
  }) => void
}

export const ConsultationFormModal: React.FC<ConsultationFormModalProps> = ({
  patient,
  doctorName,
  onClose,
  onSave
}) => {
  // Form State
  const [chiefComplaint, setChiefComplaint] = useState('')
  const [clinicalNotes, setClinicalNotes] = useState('')
  
  // Diagnoses List Builder
  const [diagnoses, setDiagnoses] = useState<string[]>([])
  const [diagnosisInput, setDiagnosisInput] = useState('')

  // Prescription List Builder
  const [prescriptions, setPrescriptions] = useState<
    { drugName: string; dosage: string; frequency: string; duration: string }[]
  >([])
  const [newDrug, setNewDrug] = useState({
    drugName: '',
    dosage: '1 comp',
    frequency: 'Matin/Soir',
    duration: '7 jours'
  })

  // Lab Request builder
  const [labOrders, setLabOrders] = useState<string[]>([])
  const [newLabOrder, setNewLabOrder] = useState('')

  // Handle Add Diagnosis
  const handleAddDiagnosis = () => {
    if (!diagnosisInput.trim()) return
    setDiagnoses([...diagnoses, diagnosisInput.trim()])
    setDiagnosisInput('')
  }

  // Handle Remove Diagnosis
  const handleRemoveDiagnosis = (index: number) => {
    setDiagnoses(diagnoses.filter((_, i) => i !== index))
  }

  // Handle Add Drug
  const handleAddDrug = () => {
    if (!newDrug.drugName.trim()) return
    setPrescriptions([...prescriptions, { ...newDrug }])
    setNewDrug({
      drugName: '',
      dosage: '1 comp',
      frequency: 'Matin/Soir',
      duration: '7 jours'
    })
  }

  // Handle Remove Drug
  const handleRemoveDrug = (index: number) => {
    setPrescriptions(prescriptions.filter((_, i) => i !== index))
  }

  // Handle Add Lab Request
  const handleAddLab = () => {
    if (!newLabOrder.trim()) return
    setLabOrders([...labOrders, newLabOrder.trim()])
    setNewLabOrder('')
  }

  const handleRemoveLab = (index: number) => {
    setLabOrders(labOrders.filter((_, i) => i !== index))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!chiefComplaint.trim()) {
      alert('Veuillez renseigner le motif principal de consultation.')
      return
    }
    onSave({
      doctorName,
      chiefComplaint,
      clinicalNotes,
      diagnoses,
      prescriptions,
      labOrders
    })
  }

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white border border-slate-800/20 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col relative overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-medical-border bg-slate-50 shrink-0">
          <div className="text-left">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-medical-primary" />
              Saisie de la Consultation Clinique
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              Patient : {patient.name} ({patient.patientCode}) • Médecin : {doctorName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form (Scrollable body) */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-5 text-left">
          {/* Main clinical entries */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Motif */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-700">
                Motif Principal de Consultation <span className="text-medical-danger">*</span>
              </label>
              <input
                type="text"
                placeholder="Ex: Douleurs thoraciques, fièvre modérée..."
                value={chiefComplaint}
                onChange={(e) => setChiefComplaint(e.target.value)}
                className="w-full bg-white border border-medical-border rounded-xl p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-medical-primary"
                required
              />
            </div>

            {/* CIM-10 Diagnosis builder */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-700">
                Diagnostics Retenus (CIM-10)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ex: I10 - Hypertension artérielle..."
                  value={diagnosisInput}
                  onChange={(e) => setDiagnosisInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddDiagnosis()
                    }
                  }}
                  className="flex-1 bg-white border border-medical-border rounded-xl p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-medical-primary"
                />
                <button
                  type="button"
                  onClick={handleAddDiagnosis}
                  className="px-3 py-2 bg-slate-100 border border-slate-300 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Diagnoses Pills container */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {diagnoses.length > 0 ? (
                  diagnoses.map((diag, index) => (
                    <span
                      key={index}
                      className="px-2 py-0.5 rounded-lg bg-medical-subtle border border-emerald-200 text-emerald-800 text-[10px] font-bold flex items-center gap-1.5"
                    >
                      {diag}
                      <button
                        type="button"
                        onClick={() => handleRemoveDiagnosis(index)}
                        className="text-emerald-700 hover:text-medical-danger"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))
                ) : (
                  <span className="text-[10px] text-slate-400 italic">Aucun diagnostic enregistré.</span>
                )}
              </div>
            </div>
          </div>

          {/* Clinical observations notes */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-700">
              Observations Cliniques & Signes Cardinaux (Examen Physique)
            </label>
            <textarea
              rows={4}
              placeholder="Saisir l'examen clinique complet, auscultation, palpation abdominale, etc..."
              value={clinicalNotes}
              onChange={(e) => setClinicalNotes(e.target.value)}
              className="w-full bg-white border border-medical-border rounded-xl p-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-medical-primary font-medium"
            />
          </div>

          {/* Lab Orders builder */}
          <div className="border-t border-medical-border pt-4 space-y-3">
            <label className="block text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
              <Syringe className="w-4 h-4 text-purple-600" /> Requests d'Analyses Biologiques
            </label>
            <div className="flex gap-2 max-w-md">
              <input
                type="text"
                placeholder="Ex: NFS Complète, Glycémie, Créatinine..."
                value={newLabOrder}
                onChange={(e) => setNewLabOrder(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddLab()
                  }
                }}
                className="flex-1 bg-white border border-medical-border rounded-xl p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-medical-primary"
              />
              <button
                type="button"
                onClick={handleAddLab}
                className="px-3 py-2 bg-slate-100 border border-slate-300 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Demander
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {labOrders.map((lab, index) => (
                <span
                  key={index}
                  className="px-2.5 py-1 rounded bg-purple-50 border border-purple-200 text-purple-800 text-[10px] font-bold flex items-center gap-1.5"
                >
                  {lab}
                  <button
                    type="button"
                    onClick={() => handleRemoveLab(index)}
                    className="text-purple-600 hover:text-medical-danger"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Prescription builder */}
          <div className="border-t border-medical-border pt-4 space-y-3">
            <label className="block text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
              <Pill className="w-4 h-4 text-emerald-600" /> Prescriptions Médicamenteuses
            </label>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              <input
                type="text"
                placeholder="Médicament (Ex: Amlodipine 5mg)"
                value={newDrug.drugName}
                onChange={(e) => setNewDrug({ ...newDrug, drugName: e.target.value })}
                className="bg-white border border-medical-border rounded-xl p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-medical-primary"
              />
              <input
                type="text"
                placeholder="Posologie (Ex: 1 comprimé)"
                value={newDrug.dosage}
                onChange={(e) => setNewDrug({ ...newDrug, dosage: e.target.value })}
                className="bg-white border border-medical-border rounded-xl p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-medical-primary"
              />
              <input
                type="text"
                placeholder="Fréquence (Ex: Matin / Soir)"
                value={newDrug.frequency}
                onChange={(e) => setNewDrug({ ...newDrug, frequency: e.target.value })}
                className="bg-white border border-medical-border rounded-xl p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-medical-primary"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Durée (Ex: 30 jours)"
                  value={newDrug.duration}
                  onChange={(e) => setNewDrug({ ...newDrug, duration: e.target.value })}
                  className="flex-1 bg-white border border-medical-border rounded-xl p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-medical-primary"
                />
                <button
                  type="button"
                  onClick={handleAddDrug}
                  className="px-3.5 bg-medical-primary hover:bg-medical-hover text-white font-bold rounded-xl text-xs flex items-center justify-center transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Prescribed drugs summary list */}
            {prescriptions.length > 0 ? (
              <div className="bg-slate-50 border border-medical-border rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100/80 text-slate-600 font-mono border-b border-medical-border">
                    <tr>
                      <th className="p-2.5 font-bold">Médicament</th>
                      <th className="p-2.5 font-bold">Dose</th>
                      <th className="p-2.5 font-bold">Fréquence</th>
                      <th className="p-2.5 font-bold">Durée</th>
                      <th className="p-2.5 text-right font-bold">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-medical-border text-slate-700 font-medium">
                    {prescriptions.map((p, index) => (
                      <tr key={index} className="hover:bg-slate-100/35">
                        <td className="p-2.5 font-bold text-slate-900">{p.drugName}</td>
                        <td className="p-2.5">{p.dosage}</td>
                        <td className="p-2.5">{p.frequency}</td>
                        <td className="p-2.5 text-slate-500 font-mono">{p.duration}</td>
                        <td className="p-2.5 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveDrug(index)}
                            className="text-medical-danger hover:text-red-700 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-[10px] text-slate-400 italic">Aucune prescription rédigée.</p>
            )}
          </div>

          {/* Submit/Cancel footer */}
          <div className="flex gap-2 justify-end border-t border-medical-border pt-4 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Fermer sans enregistrer
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-medical-primary hover:bg-medical-hover text-white rounded-xl text-xs font-bold shadow-sm transition-colors cursor-pointer"
            >
              Valider & Transmettre la Consultation
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
