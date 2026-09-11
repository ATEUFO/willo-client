import React from 'react'
import { AlertCircle } from 'lucide-react'
import { FacteurContributif } from '../../../../services/aiDiagnosticService'

interface AIFactorsTableProps {
  facteursContributifs: FacteurContributif[]
}

export const AIFactorsTable: React.FC<AIFactorsTableProps> = ({ facteursContributifs }) => {
  const getImpactBadgeStyle = (impact: string) => {
    switch (impact?.toUpperCase()) {
      case 'CRITICAL':
      case 'HIGH':
        return 'bg-rose-100 text-rose-800 font-bold'
      case 'MODERATE':
        return 'bg-amber-100 text-amber-800 font-semibold'
      default:
        return 'bg-slate-100 text-slate-700 font-medium'
    }
  }

  const getImpactLabel = (impact: string) => {
    switch (impact?.toUpperCase()) {
      case 'CRITICAL':
      case 'HIGH':
        return 'Élevé'
      case 'MODERATE':
        return 'Modéré'
      default:
        return 'Faible'
    }
  }

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-500" /> FACTEURS CLINIQUES DÉTERMINANTS
        </h3>
        <span className="text-xs font-medium text-slate-400">
          {facteursContributifs.length} élément(s)
        </span>
      </div>

      {facteursContributifs.length === 0 ? (
        <div className="text-center py-4 text-xs text-slate-500 italic">
          Aucun facteur de risque majeur détecté. Les constantes restent dans les normes.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold">
                <th className="p-2">Constante / Mesure</th>
                <th className="p-2">Valeur</th>
                <th className="p-2">Impact</th>
                <th className="p-2">Observations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {facteursContributifs.map((f, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60">
                  <td className="p-2 font-bold text-slate-900">{f.feature}</td>
                  <td className="p-2 font-bold text-slate-800">{f.valeur}</td>
                  <td className="p-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] ${getImpactBadgeStyle(f.impact)}`}>
                      {getImpactLabel(f.impact)}
                    </span>
                  </td>
                  <td className="p-2 text-slate-600 text-[11px]">{f.explication}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
