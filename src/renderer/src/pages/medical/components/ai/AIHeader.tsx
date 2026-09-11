import React from 'react'
import { Brain, Zap, History } from 'lucide-react'
import { HealthStatusResponse } from '../../../../services/aiDiagnosticService'

interface AIHeaderProps {
  healthStatus: HealthStatusResponse | null
  activeTab: 'predict' | 'history'
  setActiveTab: (tab: 'predict' | 'history') => void
  historyCount: number
}

export const AIHeader: React.FC<AIHeaderProps> = ({
  healthStatus,
  activeTab,
  setActiveTab,
  historyCount
}) => {
  return (
    <div className="bg-slate-900 rounded-2xl p-4 sm:p-5 text-white shadow-lg border border-slate-800 relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-lg font-black tracking-tight text-white">
                Analyse & Aide au Diagnostic Clinique
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Évaluation assistée des constantes et du profil médical du patient.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 bg-slate-800/90 rounded-xl border border-slate-700/80 flex items-center gap-2 text-xs">
            <span
              className={`w-2 h-2 rounded-full ${
                healthStatus?.online ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span className="font-semibold text-slate-200">
              {healthStatus?.online ? 'Serveur Connecté' : 'Mode Autonome'}
            </span>
          </div>

          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('predict')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'predict'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5" /> Évaluation Clinique
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <History className="w-3.5 h-3.5" /> Historique ({historyCount})
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
