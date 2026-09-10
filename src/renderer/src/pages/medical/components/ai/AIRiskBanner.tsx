import React from 'react'
import { AlertTriangle } from 'lucide-react'
import { AIPredictionResponse } from '../../../../services/aiDiagnosticService'

interface AIRiskBannerProps {
  predictionResult: AIPredictionResponse
}

export const AIRiskBanner: React.FC<AIRiskBannerProps> = ({ predictionResult }) => {
  const p = predictionResult.prediction

  const getRiskBadgeStyle = (risk: string) => {
    switch (risk?.toUpperCase()) {
      case 'CRITICAL':
        return 'bg-rose-500/10 text-rose-600 border-rose-500/40 font-bold'
      case 'HIGH':
        return 'bg-amber-500/10 text-amber-600 border-amber-500/40 font-bold'
      case 'MODERATE':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/40 font-semibold'
      default:
        return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/40 font-semibold'
    }
  }

  return (
    <div
      className={`p-6 rounded-2xl border shadow-md flex items-center justify-between ${getRiskBadgeStyle(
        p.niveauRisque
      )}`}
    >
      <div className="flex items-center gap-4">
        <div className="p-3.5 rounded-xl bg-white/50 border border-current/20 shadow-xs">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider font-extrabold">Résultat d'Analyse Clinique</span>
            <span className="px-2 py-0.5 text-[10px] rounded-full bg-white/70 font-bold border">
              Évaluation Validée
            </span>
          </div>
          <h3 className="text-2xl font-black mt-0.5">{p.intituleDiagnostic}</h3>
          <p className="text-xs mt-1 font-semibold opacity-90">
            Modèle Pathologique: <span className="font-mono">{predictionResult.nomModele}</span>
          </p>
        </div>
      </div>

      <div className="text-right shrink-0">
        <p className="text-[11px] font-bold uppercase tracking-wider opacity-80">Indice de Probabilité</p>
        <p className="text-3xl font-black">{Math.round(p.scoreProbabilite * 100)}%</p>
        <span className="inline-block mt-1 px-2.5 py-0.5 rounded-md text-xs font-black bg-white/80 border">
          Niveau Risque: {p.niveauRisque}
        </span>
      </div>
    </div>
  )
}
