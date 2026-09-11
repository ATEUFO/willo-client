import React from 'react'
import { AlertTriangle, CheckCircle } from 'lucide-react'
import { AIPredictionResponse } from '../../../../services/aiDiagnosticService'

interface AIRiskBannerProps {
  predictionResult: AIPredictionResponse
}

export const AIRiskBanner: React.FC<AIRiskBannerProps> = ({ predictionResult }) => {
  const p = predictionResult.prediction

  const getRiskBadgeStyle = (risk: string) => {
    switch (risk?.toUpperCase()) {
      case 'CRITICAL':
        return 'bg-rose-50 border-rose-200 text-rose-800'
      case 'HIGH':
        return 'bg-amber-50 border-amber-200 text-amber-800'
      case 'MODERATE':
        return 'bg-blue-50 border-blue-200 text-blue-800'
      default:
        return 'bg-emerald-50 border-emerald-200 text-emerald-800'
    }
  }

  const getRiskLabel = (risk: string) => {
    switch (risk?.toUpperCase()) {
      case 'CRITICAL':
        return 'Niveau : Risque Critique'
      case 'HIGH':
        return 'Niveau : Risque Élevé'
      case 'MODERATE':
        return 'Niveau : Risque Modéré'
      default:
        return 'Niveau : Risque Faible'
    }
  }

  // Only display probability index if valid score between 0 and < 1.0 is explicitly sent
  const showProbabilityScore =
    typeof p.scoreProbabilite === 'number' &&
    !isNaN(p.scoreProbabilite) &&
    p.scoreProbabilite > 0 &&
    p.scoreProbabilite < 1.0

  return (
    <div
      className={`p-5 rounded-2xl border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${getRiskBadgeStyle(
        p.niveauRisque
      )}`}
    >
      <div className="flex items-center gap-3.5">
        <div className="p-3 rounded-xl bg-white/80 border border-current/20 shadow-xs shrink-0">
          {(p.niveauRisque as string) === 'LOW' || (p.niveauRisque as string) === 'NORMAL' ? (
            <CheckCircle className="w-6 h-6 text-emerald-600" />
          ) : (
            <AlertTriangle className="w-6 h-6 text-current" />
          )}
        </div>
        <div>
          <span className="text-[11px] uppercase tracking-wider font-extrabold opacity-75 block">
            Résultat de l'Évaluation Clinique
          </span>
          <h3 className="text-xl font-black mt-0.5">{p.intituleDiagnostic}</h3>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:text-right shrink-0">
        {showProbabilityScore && (
          <div className="text-right">
            <p className="text-[10px] font-extrabold uppercase tracking-wider opacity-75">Probabilité</p>
            <p className="text-2xl font-black">{Math.round(p.scoreProbabilite * 100)}%</p>
          </div>
        )}

        <span className="px-3 py-1 rounded-lg text-xs font-black bg-white/90 border border-current/20 shadow-xs">
          {getRiskLabel(p.niveauRisque)}
        </span>
      </div>
    </div>
  )
}
