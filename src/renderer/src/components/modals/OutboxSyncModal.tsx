import React, { useEffect, useState } from 'react'
import {
  Database,
  RefreshCw,
  X,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Trash2,
  RotateCcw,
  Eye,
  ShieldAlert,
  Server,
  HardDrive
} from 'lucide-react'
import { useHospitalStore } from '../../pages/store/hospitalStore'

interface OutboxMutation {
  id: string
  resourceType: string
  resourceId: string
  action: string
  payload: string
  status: 'pending' | 'sent' | 'failed' | 'conflict'
  errorMessage?: string
  createdAt: string
}

interface OutboxSyncModalProps {
  isOpen: boolean
  onClose: () => void
}

export const OutboxSyncModal: React.FC<OutboxSyncModalProps> = ({ isOpen, onClose }) => {
  const { isOnline, loadAllData } = useHospitalStore()
  const [mutations, setMutations] = useState<OutboxMutation[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [selectedPayload, setSelectedPayload] = useState<{ title: string; json: any } | null>(null)
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'conflict' | 'failed'>('all')

  const fetchMutations = async () => {
    setIsLoading(true)
    try {
      if (window.api && window.api.outbox) {
        const data = await window.api.outbox.getMutations()
        setMutations(data || [])
      }
    } catch (err) {
      console.error('Failed to fetch outbox mutations:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchMutations()
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleRetry = async (id: string) => {
    try {
      if (window.api && window.api.outbox) {
        await window.api.outbox.retryMutation(id)
        await fetchMutations()
        loadAllData()
      }
    } catch (err) {
      alert(`Erreur lors de la tentative : ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Voulez-vous vraiment supprimer cet enregistrement du journal de synchronisation local ?')) return
    try {
      if (window.api && window.api.outbox) {
        await window.api.outbox.deleteMutation(id)
        await fetchMutations()
        loadAllData()
      }
    } catch (err) {
      alert(`Erreur lors de la suppression : ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  const handleResolveConflict = async (id: string, resolution: 'force_client' | 'accept_server') => {
    try {
      if (window.api && window.api.outbox) {
        await window.api.outbox.resolveConflict(id, resolution)
        await fetchMutations()
        loadAllData()
      }
    } catch (err) {
      alert(`Erreur lors de la résolution du conflit : ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  const handleTriggerSync = async () => {
    try {
      setIsLoading(true)
      if (window.api && window.api.sync) {
        await window.api.sync.triggerDeltas()
        await fetchMutations()
        loadAllData()
      }
    } catch (err) {
      console.error('Sync trigger error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClearSent = async () => {
    try {
      if (window.api && window.api.outbox) {
        await window.api.outbox.clearSent()
        await fetchMutations()
      }
    } catch (err) {
      console.error('Clear sent error:', err)
    }
  }

  const pendingCount = mutations.filter((m) => m.status === 'pending').length
  const conflictCount = mutations.filter((m) => m.status === 'conflict').length
  const failedCount = mutations.filter((m) => m.status === 'failed').length
  const sentCount = mutations.filter((m) => m.status === 'sent').length

  const filteredMutations = mutations.filter((m) => {
    if (filterStatus === 'pending') return m.status === 'pending'
    if (filterStatus === 'conflict') return m.status === 'conflict'
    if (filterStatus === 'failed') return m.status === 'failed'
    return true
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in select-none">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-600 border border-emerald-500/20">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                Journal des Synchronisations Locales (SQLite Outbox)
              </h2>
              <p className="text-xs text-slate-500">
                Visualisation des modifications enregistrées en mode hors-ligne et gestion des conflits
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 text-slate-500 hover:text-slate-800 rounded-xl transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Bar Summary */}
        <div className="px-6 py-3 bg-slate-100/70 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                filterStatus === 'all' ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              Tous ({mutations.length})
            </button>
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                filterStatus === 'pending' ? 'bg-amber-500 text-white' : 'bg-white text-amber-700 border border-amber-200 hover:bg-amber-50'
              }`}
            >
              En attente ({pendingCount})
            </button>
            {conflictCount > 0 && (
              <button
                onClick={() => setFilterStatus('conflict')}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  filterStatus === 'conflict' ? 'bg-purple-600 text-white' : 'bg-white text-purple-700 border border-purple-200 hover:bg-purple-50'
                }`}
              >
                Conflits ({conflictCount})
              </button>
            )}
            {failedCount > 0 && (
              <button
                onClick={() => setFilterStatus('failed')}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  filterStatus === 'failed' ? 'bg-rose-600 text-white' : 'bg-white text-rose-700 border border-rose-200 hover:bg-rose-50'
                }`}
              >
                Échecs ({failedCount})
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {sentCount > 0 && (
              <button
                onClick={handleClearSent}
                className="px-3 py-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold rounded-lg transition-all text-xs cursor-pointer flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5 text-slate-400" />
                Purger transmis ({sentCount})
              </button>
            )}
            <button
              onClick={handleTriggerSync}
              disabled={isLoading || !isOnline}
              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm transition-all text-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              Synchroniser maintenant
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredMutations.length === 0 ? (
            <div className="py-16 text-center space-y-3 bg-slate-50/50 border border-dashed border-slate-200 rounded-2xl">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <h3 className="text-sm font-bold text-slate-700">Aucune donnée en attente de synchronisation</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Toutes vos actions cliniques et administratives ont été intégrées avec succès sur la base locale et transmises au serveur.
              </p>
            </div>
          ) : (
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs bg-white">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <th className="px-4 py-3">Horodatage</th>
                    <th className="px-4 py-3">Ressource</th>
                    <th className="px-4 py-3">Action</th>
                    <th className="px-4 py-3">Statut</th>
                    <th className="px-4 py-3">Détails / Payload</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredMutations.map((m) => {
                    let parsedPayload: any = null
                    try {
                      parsedPayload = JSON.parse(m.payload)
                    } catch {
                      parsedPayload = m.payload
                    }

                    return (
                      <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-4 py-3 font-mono text-slate-500 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            {new Date(m.createdAt).toLocaleString('fr-FR')}
                          </div>
                        </td>
                        <td className="px-4 py-3 font-bold text-slate-800">
                          <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded font-mono text-[11px] text-slate-700">
                            {m.resourceType}
                          </span>
                          <span className="ml-1.5 font-mono text-[10px] text-slate-400">#{m.resourceId.slice(0, 8)}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              m.action === 'create'
                                ? 'bg-emerald-100 text-emerald-800'
                                : m.action === 'update'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {m.action}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {m.status === 'pending' && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                              <Clock className="w-3 h-3 text-amber-500" /> En attente
                            </span>
                          )}
                          {m.status === 'sent' && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                              <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Transmis
                            </span>
                          )}
                          {m.status === 'conflict' && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-md" title={m.errorMessage}>
                              <ShieldAlert className="w-3 h-3 text-purple-600" /> Conflit 409
                            </span>
                          )}
                          {m.status === 'failed' && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md" title={m.errorMessage}>
                              <AlertTriangle className="w-3 h-3 text-rose-500" /> Échec
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => setSelectedPayload({ title: `${m.resourceType} #${m.resourceId}`, json: parsedPayload })}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-md transition-all flex items-center gap-1 text-[11px] cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-500" />
                            Voir Payload JSON
                          </button>
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          {m.status === 'conflict' ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleResolveConflict(m.id, 'force_client')}
                                className="px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg text-[10px] shadow-xs cursor-pointer flex items-center gap-1"
                                title="Forcer l'envoi de la version locale sur le serveur"
                              >
                                <HardDrive className="w-3 h-3" />
                                Forcer Local
                              </button>
                              <button
                                onClick={() => handleResolveConflict(m.id, 'accept_server')}
                                className="px-2 py-1 bg-slate-600 hover:bg-slate-700 text-white font-bold rounded-lg text-[10px] shadow-xs cursor-pointer flex items-center gap-1"
                                title="Conserver la version existante du serveur"
                              >
                                <Server className="w-3 h-3" />
                                Garder Serveur
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-end gap-1.5">
                              {m.status !== 'sent' && (
                                <button
                                  onClick={() => handleRetry(m.id)}
                                  className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg transition-colors cursor-pointer border border-amber-200"
                                  title="Réessayer la transmission"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button
                                onClick={() => handleDelete(m.id)}
                                className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg transition-colors cursor-pointer border border-rose-200"
                                title="Supprimer du journal"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Detail JSON Inspector Modal */}
      {selectedPayload && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/70 p-4">
          <div className="bg-slate-900 border border-slate-700 text-slate-100 rounded-2xl max-w-2xl w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-emerald-400 font-mono">
                Inspecteur Payload - {selectedPayload.title}
              </h3>
              <button
                onClick={() => setSelectedPayload(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <pre className="bg-slate-950 p-4 rounded-xl text-xs font-mono text-emerald-300 overflow-x-auto max-h-96 border border-slate-800">
              {JSON.stringify(selectedPayload.json, null, 2)}
            </pre>
            <div className="text-right">
              <button
                onClick={() => setSelectedPayload(null)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
