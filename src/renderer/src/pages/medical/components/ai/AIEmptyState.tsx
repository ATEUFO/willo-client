import React from 'react'
import { Brain } from 'lucide-react'

export const AIEmptyState: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl p-12 border border-slate-200 shadow-sm text-center space-y-4 min-h-[500px] flex flex-col items-center justify-center">
      <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
        <Brain className="w-8 h-8" />
      </div>
      <div className="max-w-md space-y-2">
        <h3 className="text-base font-bold text-slate-800">Prêt pour l'Analyse Diagnostique</h3>
        <p className="text-xs text-slate-500">
          Vérifiez les paramètres médicaux du patient à gauche, puis cliquez sur **Lancer l'Analyse Diagnostique Clinique**.
        </p>
      </div>
    </div>
  )
}
