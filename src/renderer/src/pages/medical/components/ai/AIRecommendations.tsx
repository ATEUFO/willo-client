import React from 'react'
import { ShieldCheck, CheckCircle2 } from 'lucide-react'

interface AIRecommendationsProps {
  recommandations: string[]
}

export const AIRecommendations: React.FC<AIRecommendationsProps> = ({ recommandations }) => {
  return (
    <div className="bg-emerald-50/70 rounded-2xl p-5 border border-emerald-200/80 space-y-3">
      <h3 className="text-xs font-bold text-emerald-950 flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-emerald-600" /> Orientations Thérapeutiques / Prise en Charge
      </h3>
      <ul className="space-y-2">
        {recommandations.map((rec, i) => (
          <li key={i} className="text-xs text-emerald-900 font-medium flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>{rec}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
