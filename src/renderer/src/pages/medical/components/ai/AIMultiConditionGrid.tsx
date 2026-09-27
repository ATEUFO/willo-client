import React from 'react'
import { Bug, Heart, Brain, Activity, History, FlaskConical, AlertTriangle, CheckCircle } from 'lucide-react'
import { ConditionRiskAssessment } from '../../../../services/aiDiagnosticService'

interface AIMultiConditionGridProps {
  conditions: ConditionRiskAssessment[]
}

export const AIMultiConditionGrid: React.FC<AIMultiConditionGridProps> = ({ conditions }) => {
  if (!conditions || conditions.length === 0) return null

  const getConditionIcon = (id: string) => {
    switch (id) {
      case 'paludisme':
        return <Bug className="w-5 h-5 text-amber-500" />
      case 'avc':
        return <Brain className="w-5 h-5 text-purple-500" />
      case 'crise_cardiaque':
        return <Heart className="w-5 h-5 text-rose-500" />
      case 'sepsis':
        return <Activity className="w-5 h-5 text-emerald-500" />
      case 'rehospitalisation':
        return <History className="w-5 h-5 text-blue-500" />
      default:
        return <FlaskConical className="w-5 h-5 text-cyan-500" />
    }
  }

  const getRiskBadge = (risk: string) => {
    switch (risk?.toUpperCase()) {
      case 'CRITICAL':
        return {
          label: 'CRITIQUE',
          bg: 'bg-rose-100 text-rose-800 border-rose-200',
          bar: 'bg-rose-500'
        }
      case 'HIGH':
        return {
          label: 'ÉLEVÉ',
          bg: 'bg-amber-100 text-amber-800 border-amber-200',
          bar: 'bg-amber-500'
        }
      case 'MODERATE':
        return {
          label: 'MODÉRÉ',
          bg: 'bg-blue-100 text-blue-800 border-blue-200',
          bar: 'bg-blue-500'
        }
      default:
        return {
          label: 'FAIBLE / NORMAL',
          bg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          bar: 'bg-emerald-500'
        }
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
          ÉVALUATION PAR PATHOLOGIE ({conditions.length} DIAGNOSTICS SIMULTANÉS)
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {conditions.map((c) => {
          const badge = getRiskBadge(c.niveauRisque)
          const pct = Math.round(c.scoreProbabilite * 100)

          return (
            <div
              key={c.id}
              className={`p-4 rounded-2xl border transition-all space-y-3 ${
                c.niveauRisque === 'CRITICAL'
                  ? 'bg-rose-50/40 border-rose-200 shadow-xs'
                  : c.niveauRisque === 'HIGH'
                  ? 'bg-amber-50/40 border-amber-200 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 bg-slate-100 rounded-xl shrink-0">
                    {getConditionIcon(c.id)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm leading-tight">{c.title}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">{c.subtitle}</p>
                  </div>
                </div>

                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black border uppercase tracking-wider shrink-0 ${badge.bg}`}>
                  {badge.label}
                </span>
              </div>

              {/* Progress Bar & Probability */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[11px] font-bold">
                  <span className="text-slate-600">Probabilité d'Affection</span>
                  <span className="font-mono text-slate-900">{pct}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${badge.bar}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              {/* Title & Recommendations */}
              <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-200/60 text-xs space-y-1">
                <p className="font-bold text-slate-800 flex items-center gap-1.5">
                  {c.niveauRisque === 'LOW' ? (
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  )}
                  {c.intituleDiagnostic}
                </p>
                {c.recommandations.length > 0 && (
                  <p className="text-[11px] text-slate-600 font-medium">
                    💡 <strong className="text-slate-700">Action recommandée:</strong> {c.recommandations[0]}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
