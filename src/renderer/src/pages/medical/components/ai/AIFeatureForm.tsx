import React from 'react'
import { Activity, Brain, RefreshCw, CheckCircle2 } from 'lucide-react'
import { AIModelId } from '../../../../services/aiDiagnosticService'

interface AIFeatureFormProps {
  selectedModelId: AIModelId
  features: Record<string, number>
  handleRunPrediction: (e?: React.FormEvent) => void
  isLoading: boolean
  loadingStep: number
  hasSelectedPatient: boolean
}

export const AIFeatureForm: React.FC<AIFeatureFormProps> = ({
  selectedModelId,
  features,
  handleRunPrediction,
  isLoading,
  loadingStep,
  hasSelectedPatient
}) => {
  // Collect recorded vitals & demographic values into a clean compact list
  const parameters: { label: string; value: string }[] = []

  if (features.temperature) parameters.push({ label: 'Température', value: `${features.temperature} °C` })
  if (features.frequenceCardiaque) parameters.push({ label: 'Pouls Cardiaque', value: `${features.frequenceCardiaque} bpm` })
  if (features.pressionSystolique && features.pressionDiastolique) {
    parameters.push({ label: 'Pression Artérielle', value: `${features.pressionSystolique} / ${features.pressionDiastolique} mmHg` })
  } else {
    if (features.pressionSystolique) parameters.push({ label: 'Pression Systolique', value: `${features.pressionSystolique} mmHg` })
    if (features.pressionDiastolique) parameters.push({ label: 'Pression Diastolique', value: `${features.pressionDiastolique} mmHg` })
  }
  if (features.saturationO2) parameters.push({ label: 'Saturation O2', value: `${features.saturationO2} %` })
  if (features.frequenceRespiratoire) parameters.push({ label: 'Fréquence Resp.', value: `${features.frequenceRespiratoire} c/min` })
  if (features.age) parameters.push({ label: 'Âge du Patient', value: `${features.age} ans` })
  if (typeof features.sexe === 'number') parameters.push({ label: 'Sexe Biologique', value: features.sexe === 1.0 ? 'Masculin' : 'Féminin' })

  if (features.hemoglobine) parameters.push({ label: 'Hémoglobine', value: `${features.hemoglobine} g/dL` })
  if (features.plaquettes) parameters.push({ label: 'Plaquettes', value: `${features.plaquettes} /mm³` })
  if (features.leucocytes) parameters.push({ label: 'Leucocytes', value: `${features.leucocytes} /mm³` })
  if (features.crp) parameters.push({ label: 'CRP', value: `${features.crp} mg/L` })
  if (features.creatinine) parameters.push({ label: 'Créatinine', value: `${features.creatinine} µmol/L` })
  if (features.lactate) parameters.push({ label: 'Lactate Sanguin', value: `${features.lactate} mmol/L` })
  if (features.scoreGlasgow) parameters.push({ label: 'Score Glasgow', value: `${features.scoreGlasgow} / 15` })

  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <div>
          <h2 className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-500" /> CONSTANTES MÉDICALES DU PATIENT
          </h2>
          <p className="text-[11px] text-slate-400 font-medium mt-0.5">
            Données physiologiques issues du dossier patient (Non modifiables ici)
          </p>
        </div>
      </div>

      {parameters.length === 0 ? (
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs text-slate-500 font-medium italic">
          Aucune constante mesurée n'est enregistrée pour ce patient.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {parameters.map((item, idx) => (
            <div key={idx} className="bg-slate-50/80 border border-slate-200/80 rounded-xl px-3 py-2 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500">{item.label}</span>
              <span className="text-xs font-black text-slate-900 bg-white border border-slate-200/70 px-2 py-0.5 rounded-md shadow-xs">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="bg-emerald-50/50 border border-emerald-200/60 rounded-xl p-2.5 flex items-center gap-2 text-xs font-medium text-emerald-900">
        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>Données synchronisées avec le dossier patient</span>
      </div>

      <button
        type="button"
        onClick={handleRunPrediction}
        disabled={isLoading || !hasSelectedPatient}
        className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2.5 transition-all cursor-pointer disabled:opacity-50"
      >
        {isLoading ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Analyse en cours (Étape {loadingStep}/3)...</span>
          </>
        ) : (
          <>
            <Brain className="w-4 h-4 text-emerald-200" />
            <span>Lancer l'Analyse Diagnostique</span>
          </>
        )}
      </button>
    </div>
  )
}
