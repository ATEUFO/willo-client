import React from 'react'
import { Sliders, Activity, Bug, History, HeartPulse, FlaskConical, Brain } from 'lucide-react'
import { AIModelId, AI_MODELS_CATALOG } from '../../../../services/aiDiagnosticService'

interface AIModelSelectorProps {
  selectedModelId: AIModelId
  setSelectedModelId: (id: AIModelId) => void
}

export const AIModelSelector: React.FC<AIModelSelectorProps> = ({
  selectedModelId,
  setSelectedModelId
}) => {
  const getModelIcon = (iconName: string) => {
    switch (iconName) {
      case 'Activity':
        return <Activity className="w-4 h-4" />
      case 'Bug':
        return <Bug className="w-4 h-4" />
      case 'History':
        return <History className="w-4 h-4" />
      case 'HeartPulse':
        return <HeartPulse className="w-4 h-4" />
      case 'FlaskConical':
        return <FlaskConical className="w-4 h-4" />
      default:
        return <Brain className="w-4 h-4" />
    }
  }

  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-2">
          <Sliders className="w-4 h-4 text-emerald-500" /> CHOIX DE L'ANALYSE MÉDICALE
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5">
        {AI_MODELS_CATALOG.map((m) => {
          const isSelected = selectedModelId === m.id
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setSelectedModelId(m.id)}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                isSelected
                  ? 'bg-slate-900 text-white border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`p-1.5 rounded-lg ${
                    isSelected ? 'bg-emerald-500 text-slate-950' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {getModelIcon(m.icon)}
                </span>
              </div>

              <div>
                <h3 className="text-xs font-bold leading-snug">{m.title}</h3>
                <p className={`text-[10px] line-clamp-2 mt-0.5 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                  {m.subtitle}
                </p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
