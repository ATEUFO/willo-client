import React from 'react'
import { AIPredictionResponse } from '../../../../services/aiDiagnosticService'

interface AIHistoryTableProps {
  predictionHistory: AIPredictionResponse[]
}

export const AIHistoryTable: React.FC<AIHistoryTableProps> = ({ predictionHistory }) => {
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900">Historique des Analyses Diagnostiques</h2>
          <p className="text-xs text-slate-500">
            Registre des évaluations cliniques réalisées pendant la session.
          </p>
        </div>
      </div>

      {predictionHistory.length === 0 ? (
        <div className="text-center py-12 text-slate-400 text-xs italic">
          Aucune évaluation réalisée au cours de cette session.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold">
                <th className="p-3">Référence</th>
                <th className="p-3">Horodatage</th>
                <th className="p-3">Modèle Clinique</th>
                <th className="p-3">Identifiant Patient</th>
                <th className="p-3">Diagnostic Établi</th>
                <th className="p-3">Probabilité</th>
                <th className="p-3">Niveau Risque</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {predictionHistory.map((h, i) => (
                <tr key={i} className="hover:bg-slate-50/60">
                  <td className="p-3 font-mono text-[11px] text-slate-500">{h.inferenceId}</td>
                  <td className="p-3 font-mono text-[11px]">{new Date(h.timestamp).toLocaleTimeString()}</td>
                  <td className="p-3 font-bold text-slate-900">{h.nomModele}</td>
                  <td className="p-3 font-mono text-slate-600">{h.patientId}</td>
                  <td className="p-3 font-bold text-slate-800">{h.prediction.intituleDiagnostic}</td>
                  <td className="p-3 font-black text-emerald-600">{Math.round(h.prediction.scoreProbabilite * 100)}%</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] ${getRiskBadgeStyle(h.prediction.niveauRisque)}`}>
                      {h.prediction.niveauRisque}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
