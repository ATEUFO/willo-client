import React, { useState } from 'react'
import {
  TestTube,
  CheckCircle,
  Clock,
  AlertTriangle,
  FileCheck,
  ArrowRight
} from 'lucide-react'
import { useHospitalStore, LabRequest, LabResultItem } from '../store/hospitalStore'

export const LaboratoryPage: React.FC = () => {
  const { labRequests, updateLabRequestStatus } = useHospitalStore()

  const [activeView, setActiveView] = useState<'kanban' | 'results_entry'>('kanban')
  const [selectedRequest, setSelectedRequest] = useState<LabRequest | null>(labRequests[0] || null)

  // Results form state
  const [resultItems, setResultItems] = useState<LabResultItem[]>([
    { param: 'Glycémie à jeun', value: '1.45', unit: 'g/L', refRange: '0.70 - 1.10', isAbnormal: true },
    { param: 'Cholestérol Total', value: '2.40', unit: 'g/L', refRange: '< 2.00', isAbnormal: true },
    { param: 'Triglycérides', value: '1.30', unit: 'g/L', refRange: '0.40 - 1.50', isAbnormal: false }
  ])

  const handleResultValueChange = (index: number, val: string) => {
    const updated = [...resultItems]
    updated[index].value = val

    // Demo auto-check reference range
    const num = parseFloat(val)
    if (updated[index].param.includes('Glycémie')) {
      updated[index].isAbnormal = num < 0.70 || num > 1.10
    } else if (updated[index].param.includes('Cholestérol')) {
      updated[index].isAbnormal = num > 2.00
    }
    setResultItems(updated)
  }

  const handleSaveResults = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRequest) return

    updateLabRequestStatus(selectedRequest.id, 'Pending Validation', resultItems)
    alert(`Résultats enregistrés pour ${selectedRequest.patientName}. Transmis pour validation biologiste!`)
  }

  const handleValidateLab = (id: string) => {
    updateLabRequestStatus(id, 'Completed')
    alert('Analyse validée et disponible dans le dossier du médecin!')
  }

  const todoList = labRequests.filter((r) => r.status === 'To Do')
  const inProgressList = labRequests.filter((r) => r.status === 'In Progress')
  const pendingValList = labRequests.filter((r) => r.status === 'Pending Validation')
  const completedList = labRequests.filter((r) => r.status === 'Completed')

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-medical-border pb-4">
        <div>
          <h2 className="text-2xl font-bold text-medical-dark flex items-center gap-2">
            <TestTube className="w-7 h-7 text-medical-primary" />
            Espace Laboratoire & Biologie Clinique
          </h2>
          <p className="text-sm text-slate-500">
            Pipeline des prélèvements, grilles de saisie des résultats et repérage des valeurs hors normes
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-medical-border shadow-sm">
          <button
            onClick={() => setActiveView('kanban')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${activeView === 'kanban' ? 'bg-medical-primary text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 bg-white'
              }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Vue Kanban Demandes ({labRequests.length})
          </button>
          <button
            onClick={() => setActiveView('results_entry')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${activeView === 'results_entry' ? 'bg-medical-primary text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 bg-white'
              }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            Grille de Saisie des Résultats
          </button>
        </div>
      </div>

      {/* View 1: Kanban Pipeline */}
      {activeView === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Column 1: À faire */}
          <div className="bg-medical-cardBg border border-medical-border rounded-xl p-4 space-y-3 shadow-sm">
            <div className="flex items-center justify-between border-b border-medical-border pb-2">
              <span className="font-bold text-slate-700 text-xs flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400" /> À Faire ({todoList.length})
              </span>
            </div>
            <div className="space-y-3">
              {todoList.map((req) => (
                <div key={req.id} className="bg-white border border-medical-border p-3.5 rounded-xl space-y-2 shadow-xs">
                  <div className="flex justify-between items-start">
                    <span className="font-mono text-[10px] text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 font-semibold">
                      {req.requestCode}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">{req.category}</span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-xs">{req.testName}</h4>
                  <p className="text-xs text-slate-600">Patient : {req.patientName}</p>
                  <p className="text-[11px] text-slate-400">Prescrit par {req.requestedBy}</p>
                  <button
                    onClick={() => updateLabRequestStatus(req.id, 'In Progress')}
                    className="w-full mt-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold py-1.5 rounded-lg flex items-center justify-center gap-1 border border-slate-200 transition-colors"
                  >
                    Démarrer l'Analyse <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {todoList.length === 0 && <p className="text-xs text-slate-400 text-center py-4">Aucune demande en attente</p>}
            </div>
          </div>

          {/* Column 2: En cours */}
          <div className="bg-medical-cardBg border border-medical-border rounded-xl p-4 space-y-3 shadow-sm">
            <div className="flex items-center justify-between border-b border-medical-border pb-2">
              <span className="font-bold text-amber-700 text-xs flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" /> En Cours ({inProgressList.length})
              </span>
            </div>
            <div className="space-y-3">
              {inProgressList.map((req) => (
                <div key={req.id} className="bg-amber-50/50 border border-amber-200 p-3.5 rounded-xl space-y-2 shadow-xs">
                  <div className="flex justify-between items-start">
                    <span className="font-mono text-[10px] text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-200 font-semibold">
                      {req.requestCode}
                    </span>
                    <span className="text-[10px] text-amber-800 font-semibold">{req.category}</span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-xs">{req.testName}</h4>
                  <p className="text-xs text-slate-700">Patient : {req.patientName}</p>
                  <button
                    onClick={() => {
                      setSelectedRequest(req)
                      if (req.results.length > 0) setResultItems(req.results)
                      setActiveView('results_entry')
                    }}
                    className="w-full mt-2 bg-medical-primary hover:bg-medical-hover text-white text-xs font-semibold py-1.5 rounded-lg flex items-center justify-center gap-1 shadow-xs transition-colors"
                  >
                    Saisir les Résultats <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {inProgressList.length === 0 && <p className="text-xs text-slate-400 text-center py-4">Aucune analyse en cours</p>}
            </div>
          </div>

          {/* Column 3: En attente de validation */}
          <div className="bg-medical-cardBg border border-medical-border rounded-xl p-4 space-y-3 shadow-sm">
            <div className="flex items-center justify-between border-b border-medical-border pb-2">
              <span className="font-bold text-blue-700 text-xs flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Validation Biologiste ({pendingValList.length})
              </span>
            </div>
            <div className="space-y-3">
              {pendingValList.map((req) => (
                <div key={req.id} className="bg-white border border-medical-border p-3.5 rounded-xl space-y-2 shadow-xs">
                  <div className="flex justify-between items-start">
                    <span className="font-mono text-[10px] text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 font-semibold">
                      {req.requestCode}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-xs">{req.testName}</h4>
                  <p className="text-xs text-slate-600">Patient : {req.patientName}</p>
                  <button
                    onClick={() => handleValidateLab(req.id)}
                    className="w-full mt-2 bg-medical-primary hover:bg-medical-hover text-white text-xs font-semibold py-1.5 rounded-lg flex items-center justify-center gap-1 shadow-xs transition-colors"
                  >
                    Valider le Bilan <CheckCircle className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              {pendingValList.length === 0 && <p className="text-xs text-slate-400 text-center py-4">Aucune validation en attente</p>}
            </div>
          </div>

          {/* Column 4: Completed */}
          <div className="bg-medical-cardBg border border-medical-border rounded-xl p-4 space-y-3 shadow-sm">
            <div className="flex items-center justify-between border-b border-medical-border pb-2">
              <span className="font-bold text-emerald-800 text-xs flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-medical-primary" /> Terminés & Validés ({completedList.length})
              </span>
            </div>
            <div className="space-y-3">
              {completedList.map((req) => (
                <div key={req.id} className="bg-slate-50 border border-medical-border p-3.5 rounded-xl space-y-1 opacity-80">
                  <span className="font-mono text-[10px] text-emerald-800 bg-medical-subtle px-1.5 py-0.5 rounded border border-emerald-200 font-semibold">
                    {req.requestCode}
                  </span>
                  <h4 className="font-bold text-slate-800 text-xs">{req.testName}</h4>
                  <p className="text-[11px] text-slate-500">Patient : {req.patientName}</p>
                  <p className="text-[10px] text-emerald-800 font-semibold">Validé par {req.validatedBy}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* View 2: Results Entry Grid */}
      {activeView === 'results_entry' && (
        <div className="bg-medical-cardBg border border-medical-border rounded-xl p-5 space-y-5 shadow-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-medical-border pb-3">
            <div>
              <h3 className="font-bold text-medical-dark text-base">
                Grille de Saisie des Valeurs Biologiques pour : <span className="text-medical-primary">{selectedRequest?.patientName}</span>
              </h3>
              <p className="text-xs text-slate-500">
                Code Demande : {selectedRequest?.requestCode} • Examen : {selectedRequest?.testName}
              </p>
            </div>

            <button
              onClick={() => setActiveView('kanban')}
              className="text-xs text-slate-600 hover:text-slate-900 underline font-medium"
            >
              Retour à la vue Kanban
            </button>
          </div>

          <form onSubmit={handleSaveResults} className="space-y-5">
            <div className="overflow-x-auto rounded-xl border border-medical-border">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-mono border-b border-medical-border">
                  <tr>
                    <th className="p-3">Paramètre / Recherche</th>
                    <th className="p-3">Valeur Mesurée</th>
                    <th className="p-3">Unité</th>
                    <th className="p-3">Valeurs de Référence (Norme)</th>
                    <th className="p-3">Indicateur d'Alerte</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-medical-border text-slate-700">
                  {resultItems.map((item, idx) => (
                    <tr key={idx} className={item.isAbnormal ? 'bg-red-50/50' : 'hover:bg-slate-50/80'}>
                      <td className="p-3 font-bold text-slate-900">{item.param}</td>
                      <td className="p-3">
                        <input
                          type="text"
                          value={item.value}
                          onChange={(e) => handleResultValueChange(idx, e.target.value)}
                          className={`w-32 bg-white border rounded-xl p-2 font-mono font-bold text-xs text-slate-800 focus:outline-none ${item.isAbnormal ? 'border-red-300 text-medical-danger' : 'border-medical-border focus:border-medical-primary'
                            }`}
                        />
                      </td>
                      <td className="p-3 text-slate-500 font-mono">{item.unit}</td>
                      <td className="p-3 text-slate-600 font-mono">{item.refRange}</td>
                      <td className="p-3">
                        {item.isAbnormal ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-50 text-medical-danger border border-red-200 flex items-center gap-1 w-fit">
                            <AlertTriangle className="w-3 h-3" /> Hors Norme (Alerte)
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-medical-subtle text-emerald-800 border border-emerald-200 flex items-center gap-1 w-fit">
                            <CheckCircle className="w-3 h-3 text-medical-primary" /> Conforme
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              type="submit"
              className="w-full bg-medical-primary hover:bg-medical-hover text-white font-semibold py-3 rounded-xl transition-all shadow-sm"
            >
              Enregistrer les Résultats & Transmettre au Biologiste
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
