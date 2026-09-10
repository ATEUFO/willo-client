import React from 'react'
import { Brain, CheckCircle2 } from 'lucide-react'

interface AILoadingStateProps {
  selectedModelId: string
  loadingStep: number
}

export const AILoadingState: React.FC<AILoadingStateProps> = ({
  selectedModelId,
  loadingStep
}) => {
  return (
    <div className="bg-white rounded-2xl p-12 border border-slate-200 shadow-sm text-center space-y-6 min-h-[500px] flex flex-col items-center justify-center">
      <div className="relative">
        <div className="w-20 h-20 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin flex items-center justify-center" />
        <Brain className="w-8 h-8 text-emerald-600 absolute inset-0 m-auto animate-pulse" />
      </div>
      <div className="space-y-2 max-w-md">
        <h3 className="text-lg font-bold text-slate-800">Évaluation Clinique {selectedModelId}...</h3>
        <p className="text-xs text-slate-500">
          Calcul des probabilités pathologiques, extraction des facteurs contributifs.
        </p>
      </div>

      <div className="w-full max-w-md space-y-3 pt-4 text-left">
        <div className="flex items-center gap-3 text-xs font-semibold text-slate-700">
          <CheckCircle2 className={`w-4 h-4 ${loadingStep >= 1 ? 'text-emerald-500' : 'text-slate-300'}`} />
          <span>Transmission des constantes médicales saisies</span>
        </div>
        <div className="flex items-center gap-3 text-xs font-semibold text-slate-700">
          <CheckCircle2 className={`w-4 h-4 ${loadingStep >= 2 ? 'text-emerald-500' : 'text-slate-300'}`} />
          <span>Analyse des seuils physiologiques, facteurs de risque</span>
        </div>
        <div className="flex items-center gap-3 text-xs font-semibold text-slate-700">
          <CheckCircle2 className={`w-4 h-4 ${loadingStep >= 3 ? 'text-emerald-500' : 'text-slate-300'}`} />
          <span>Formulation du bilan diagnostique, recommandations</span>
        </div>
      </div>
    </div>
  )
}
