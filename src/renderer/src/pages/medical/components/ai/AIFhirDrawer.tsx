import React, { useState } from 'react'
import { Database } from 'lucide-react'

interface AIFhirDrawerProps {
  fhirResource: any
}

export const AIFhirDrawer: React.FC<AIFhirDrawerProps> = ({ fhirResource }) => {
  const [showFhirResource, setShowFhirResource] = useState(false)

  if (!fhirResource) return null

  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-2">
      <button
        type="button"
        onClick={() => setShowFhirResource(!showFhirResource)}
        className="text-xs font-bold text-slate-700 hover:text-emerald-600 flex items-center gap-2 transition-colors cursor-pointer w-full justify-between"
      >
        <span className="flex items-center gap-2">
          <Database className="w-4 h-4 text-blue-500" /> Structure Dossier Normalisé `RiskAssessment`
        </span>
        <span className="text-[11px] text-slate-400 font-mono">
          {showFhirResource ? 'Masquer Détails' : 'Afficher Détails'}
        </span>
      </button>

      {showFhirResource && (
        <pre className="p-3.5 bg-slate-950 text-blue-300 rounded-xl text-[10px] font-mono overflow-x-auto max-h-60 border border-slate-800">
          {JSON.stringify(fhirResource, null, 2)}
        </pre>
      )}
    </div>
  )
}
