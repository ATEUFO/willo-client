import React from 'react'
import { Zap } from 'lucide-react'
import { FacteurContributif } from '../../../../services/aiDiagnosticService'

interface AIFactorsTableProps {
  facteursContributifs: FacteurContributif[]
}

export const AIFactorsTable: React.FC<AIFactorsTableProps> = ({ facteursContributifs }) => {
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
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-500" /> Facteurs Contributifs Détectés
        </h3>
        <span className="text-xs font-mono text-slate-400">
          {facteursContributifs.length} facteur(s) déterminant(s)
        </span>
      </div>

      {facteursContributifs.length === 0 ? (
        <div className="text-center py-6 text-xs text-slate-500 italic">
          Aucun facteur risque majeur détecté. Les valeurs restent dans les limites normales.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold">
                <th className="p-2.5">Paramètre Médical</th>
                <th className="p-2.5">Valeur Obtenue</th>
                <th className="p-2.5">Niveau d'Impact</th>
                <th className="p-2.5">Explication Clinique</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {facteursContributifs.map((f, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60">
                  <td className="p-2.5 font-bold text-slate-900">{f.feature}</td>
                  <td className="p-2.5 font-bold text-slate-800">{f.valeur}</td>
                  <td className="p-2.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] ${getRiskBadgeStyle(f.impact)}`}>
                      {f.impact}
                    </span>
                  </td>
                  <td className="p-2.5 text-slate-600 text-[11px]">{f.explication}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
