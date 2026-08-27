import React, { useState } from 'react'
import {
  TestTube,
  CheckCircle,
  Clock,
  AlertTriangle,
  FileCheck,
  ArrowRight
} from 'lucide-react'
import { useHospitalStore, LabRequest, LabResultItem } from '../../store/hospitalStore'

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
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <TestTube className="w-7 h-7 text-amber-400" />
            Espace Laboratoire & Biologie Clinique
          </h2>
          <p className="text-sm text-slate-400">
            Pipeline des prélèvements, grilles de saisie des résultats et repérage des valeurs hors normes
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveView('kanban')}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-2 ${
              activeView === 'kanban' ? 'bg-amber-500 text-slate-950 font-bold shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Vue Kanban Demandes ({labRequests.length})
          </button>
          <button
            onClick={() => setActiveView('results_entry')}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-2 ${
              activeView === 'results_entry' ? 'bg-amber-500 text-slate-950 font-bold shadow-md' : 'text-slate-400 hover:text-slate-200'
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
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400" /> À Faire ({todoList.length})
              </span>
            </div>
            <div className="space-y-3">
              {todoList.map((req) => (
                <div key={req.id} className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="font-mono text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                      {req.requestCode}
                    </span>
                    <span className="text-[10px] text-slate-500">{req.category}</span>
                  </div>
                  <h4 className="font-bold text-slate-100 text-xs">{req.testName}</h4>
                  <p className="text-xs text-slate-400">Patient: {req.patientName}</p>
                  <p className="text-[11px] text-slate-500">Prescrit par {req.requestedBy}</p>
                  <button
                    onClick={() => updateLabRequestStatus(req.id, 'In Progress')}
                    className="w-full mt-2 bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-medium py-1.5 rounded-lg flex items-center justify-center gap-1 border border-slate-700"
                  >
                    Démarrer l'Analyse <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {todoList.length === 0 && <p className="text-xs text-slate-500 text-center py-4">Aucune demande en attente</p>}
            </div>
          </div>

          {/* Column 2: En cours */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-amber-400 text-xs flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" /> En Cours ({inProgressList.length})
              </span>
            </div>
            <div className="space-y-3">
              {inProgressList.map((req) => (
                <div key={req.id} className="bg-slate-950 border border-amber-500/30 p-3.5 rounded-xl space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="font-mono text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                      {req.requestCode}
                    </span>
                    <span className="text-[10px] text-amber-400 font-medium">{req.category}</span>
                  </div>
                  <h4 className="font-bold text-slate-100 text-xs">{req.testName}</h4>
                  <p className="text-xs text-slate-300">Patient: {req.patientName}</p>
                  <button
                    onClick={() => {
                      setSelectedRequest(req)
                      if (req.results.length > 0) setResultItems(req.results)
                      setActiveView('results_entry')
                    }}
                    className="w-full mt-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold py-1.5 rounded-lg flex items-center justify-center gap-1"
                  >
                    Saisir les Résultats <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {inProgressList.length === 0 && <p className="text-xs text-slate-500 text-center py-4">Aucune analyse en cours</p>}
            </div>
          </div>

          {/* Column 3: En attente de validation */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-sky-400 text-xs flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400" /> Validation Biologiste ({pendingValList.length})
              </span>
            </div>
            <div className="space-y-3">
              {pendingValList.map((req) => (
                <div key={req.id} className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="font-mono text-[10px] text-sky-400 bg-sky-500/10 px-1.5 py-0.5 rounded border border-sky-500/20">
                      {req.requestCode}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-100 text-xs">{req.testName}</h4>
                  <p className="text-xs text-slate-400">Patient: {req.patientName}</p>
                  <button
                    onClick={() => handleValidateLab(req.id)}
                    className="w-full mt-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium py-1.5 rounded-lg flex items-center justify-center gap-1"
                  >
                    Valider le Bilan <CheckCircle className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              {pendingValList.length === 0 && <p className="text-xs text-slate-500 text-center py-4">Aucune validation en attente</p>}
            </div>
          </div>

          {/* Column 4: Completed */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-emerald-400 text-xs flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Terminés & Validés ({completedList.length})
              </span>
            </div>
            <div className="space-y-3">
              {completedList.map((req) => (
                <div key={req.id} className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl space-y-1 opacity-75">
                  <span className="font-mono text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                    {req.requestCode}
                  </span>
                  <h4 className="font-bold text-slate-200 text-xs">{req.testName}</h4>
                  <p className="text-[11px] text-slate-400">Patient: {req.patientName}</p>
                  <p className="text-[10px] text-emerald-400">Validé par {req.validatedBy}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* View 2: Results Entry Grid */}
      {activeView === 'results_entry' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-slate-100 text-base">
                Grille de Saisie des Valeurs Biologiques pour: <span className="text-amber-400">{selectedRequest?.patientName}</span>
              </h3>
              <p className="text-xs text-slate-400">
                Code Demande: {selectedRequest?.requestCode} • Examen: {selectedRequest?.testName}
              </p>
            </div>

            <button
              onClick={() => setActiveView('kanban')}
              className="text-xs text-slate-400 hover:text-slate-200 underline"
            >
              Retour à la vue Kanban
            </button>
          </div>

          <form onSubmit={handleSaveResults} className="space-y-5">
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 font-mono">
                  <tr>
                    <th className="p-3">Paramètre / Recherche</th>
                    <th className="p-3">Valeur Mesurée</th>
                    <th className="p-3">Unité</th>
                    <th className="p-3">Valeurs de Référence (Norme)</th>
                    <th className="p-3">Indicateur d'Alerte</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {resultItems.map((item, idx) => (
                    <tr key={idx} className={item.isAbnormal ? 'bg-rose-500/10' : ''}>
                      <td className="p-3 font-bold text-slate-200">{item.param}</td>
                      <td className="p-3">
                        <input
                          type="text"
                          value={item.value}
                          onChange={(e) => handleResultValueChange(idx, e.target.value)}
                          className={`w-32 bg-slate-950 border rounded-lg p-2 font-mono font-bold text-xs text-slate-100 focus:outline-none ${
                            item.isAbnormal ? 'border-rose-500 text-rose-400' : 'border-slate-700 focus:border-amber-500'
                          }`}
                        />
                      </td>
                      <td className="p-3 text-slate-400 font-mono">{item.unit}</td>
                      <td className="p-3 text-slate-300 font-mono">{item.refRange}</td>
                      <td className="p-3">
                        {item.isAbnormal ? (
                          <span className="px-2 py-1 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1 w-fit">
                            <AlertTriangle className="w-3 h-3" /> Hors Norme (Alerte)
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 w-fit">
                            <CheckCircle className="w-3 h-3" /> Conforme
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
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3 rounded-xl transition-all shadow-lg shadow-amber-500/20"
            >
              Enregistrer les Résultats & Transmettre au Biologiste
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
