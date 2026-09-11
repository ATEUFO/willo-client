import React, { useState } from 'react'
import { FileText } from 'lucide-react'

interface AIFhirDrawerProps {
  fhirResource: any
}

export const AIFhirDrawer: React.FC<AIFhirDrawerProps> = ({ fhirResource }) => {
  const [showFhirResource, setShowFhirResource] = useState(false)

  if (!fhirResource) return null

  return (
    <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200/80 space-y-2">
      <button
        type="button"
        onClick={() => setShowFhirResource(!showFhirResource)}
        className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-2 transition-colors cursor-pointer w-full justify-between"
      >
        <span className="flex items-center gap-2">
          <FileText className="w-3.5 h-3.5 text-slate-400" /> Données Brutes de Santé
        </span>
        <span className="text-[11px] text-slate-400">
          {showFhirResource ? 'Masquer' : 'Afficher'}
        </span>
      </button>

      {showFhirResource && (
        <pre className="p-3 bg-slate-900 text-slate-300 rounded-lg text-[10px] overflow-x-auto max-h-48 border border-slate-800 font-mono">
          {JSON.stringify(fhirResource, null, 2)}
        </pre>
      )}
    </div>
  )
}
