import React from 'react'
import { Brain, Sparkles, Zap, History } from 'lucide-react'
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
    <div className="bg-gradient-to-r from-[#0A192F] via-[#0F2A4A] to-[#0A192F] rounded-2xl p-6 text-white shadow-xl border border-slate-700/60 relative overflow-hidden">
      <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
            <Brain className="w-8 h-8 text-slate-950 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black tracking-tight text-white">
                Analyse Diagnostique par Intelligence Artificielle
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-400" /> Module Clinique
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Assistant d'aide aux décisions médicales, évaluation des risques pathologiques, recommandations cliniques.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="px-3 py-2 bg-slate-900/80 rounded-xl border border-slate-700/80 flex items-center gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  healthStatus?.online ? 'bg-emerald-400 animate-ping' : 'bg-rose-500'
                }`}
              />
              <span className="font-semibold text-slate-200">Serveur Backend IA</span>
            </div>
            <div className="h-4 w-px bg-slate-700" />
            <span className={`text-[11px] font-medium ${healthStatus?.online ? 'text-emerald-400' : 'text-rose-400'}`}>
              {healthStatus?.online
                ? `En Ligne (${healthStatus.serverUrl.replace(/^https?:\/\//, '')})`
                : 'Hors Ligne - Requetes Directes Backend'}
            </span>
          </div>

          <div className="flex bg-slate-900/90 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('predict')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'predict'
                  ? 'bg-medical-primary text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5" /> Évaluation Clinique
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-medical-primary text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <History className="w-3.5 h-3.5" /> Registre ({historyCount})
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
