import React from 'react'
import { Activity, Brain, RefreshCw, Check } from 'lucide-react'
import { AIModelId } from '../../../../services/aiDiagnosticService'

interface AIFeatureFormProps {
  selectedModelId: AIModelId
  features: Record<string, number>
  handleFeatureChange?: (key: string, value: number) => void
  handleRunPrediction: (e?: React.FormEvent) => void
  isLoading: boolean
  loadingStep: number
  hasSelectedPatient: boolean
}

export const AIFeatureForm: React.FC<AIFeatureFormProps> = ({
  selectedModelId,
  features,
  handleFeatureChange,
  handleRunPrediction,
  isLoading,
  loadingStep,
  hasSelectedPatient
}) => {

  const renderField = (label: string, key: string, unit: string) => {
    const val = features[key]
    const hasValue = typeof val === 'number' && !isNaN(val)

    return (
      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex flex-col justify-between">
        <span className="text-[10px] font-bold text-slate-500 block uppercase">{label}</span>
        {handleFeatureChange ? (
          <div className="flex items-center gap-1.5 mt-1">
            <input
              type="number"
              step="any"
              value={hasValue ? val : ''}
              onChange={(e) => {
                const valStr = e.target.value
                if (valStr === '') {
                  const copy = { ...features }
                  delete copy[key]
                  // Trigger feature update
                  handleFeatureChange(key, undefined as any)
                } else {
                  const n = parseFloat(valStr)
                  handleFeatureChange(key, isNaN(n) ? 0 : n)
                }
              }}
              placeholder="Saisir..."
              className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs font-black text-slate-900 focus:outline-none focus:border-emerald-500"
            />
            {unit && <span className="text-[10px] font-bold text-slate-500 shrink-0">{unit}</span>}
          </div>
        ) : (
          <span className={`text-xs font-black mt-1 ${hasValue ? 'text-slate-900' : 'text-slate-400 italic font-normal'}`}>
            {hasValue ? `${val} ${unit}`.trim() : 'Non renseigné'}
          </span>
        )}
      </div>
    )
  }

  const renderToggle = (label: string, key: string, options: { label: string; value: number }[]) => {
    const val = features[key]
    return (
      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex flex-col justify-between">
        <span className="text-[10px] font-bold text-slate-500 block uppercase">{label}</span>
        {handleFeatureChange ? (
          <div className="flex items-center gap-1.5 mt-1">
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleFeatureChange(key, opt.value)}
                className={`flex-1 py-1 px-2 rounded text-xs font-bold transition-all ${
                  val === opt.value
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        ) : (
          <span className={`text-xs font-black mt-1 ${typeof val === 'number' ? 'text-slate-900' : 'text-slate-400 italic font-normal'}`}>
            {typeof val === 'number'
              ? options.find((o) => o.value === val)?.label || `${val}`
              : 'Non renseigné'}
          </span>
        )}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-500" /> Paramètres Médicaux Renseignés
          </h2>
          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
            Données de santé réelles extraites du dossier patient
          </p>
        </div>
        <span className="text-[11px] text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">
          {selectedModelId}
        </span>
      </div>

      <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
        {/* 1. Sepsis Model */}
        {selectedModelId === 'sepsis-risk-v1' && (
          <div className="space-y-2.5">
            <div className="grid grid-cols-2 gap-2.5">
              {renderField('Température', 'temperature', '°C')}
              {renderField('Pouls Cardiaque', 'frequenceCardiaque', 'bpm')}
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {renderField('Pression Systolique', 'pressionSystolique', 'mmHg')}
              {renderField('Pression Diastolique', 'pressionDiastolique', 'mmHg')}
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {renderField('Fréquence Respiratoire', 'frequenceRespiratoire', 'c/min')}
              {renderField('Saturation O2', 'saturationO2', '%')}
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {renderField('Taux Leucocytes', 'leucocytes', '/mm³')}
              {renderField('Lactate Sanguin', 'lactate', 'mmol/L')}
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {renderField('Score Glasgow', 'scoreGlasgow', '/15')}
              {renderField('Taux Plaquettes', 'plaquettes', '/mm³')}
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {renderField('CRP Protéine C-Réactive', 'crp', 'mg/L')}
              {renderField('Âge du Patient', 'age', 'ans')}
            </div>
            {renderToggle('Sexe Biologique', 'sexe', [
              { label: 'Masculin (1.0)', value: 1.0 },
              { label: 'Féminin (0.0)', value: 0.0 }
            ])}
          </div>
        )}

        {/* 2. Malaria Model */}
        {selectedModelId === 'malaria-risk-v1' && (
          <div className="space-y-2.5">
            {renderToggle('Test Diagnostic Rapide Paludisme (TDR)', 'tdrMalaria', [
              { label: 'TDR Négatif (0)', value: 0.0 },
              { label: 'TDR Positif (1)', value: 1.0 }
            ])}
            <div className="grid grid-cols-2 gap-2.5">
              {renderField('Température', 'temperature', '°C')}
              {renderField('Pouls Cardiaque', 'frequenceCardiaque', 'bpm')}
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {renderField('Taux Plaquettes', 'plaquettes', '/mm³')}
              {renderField('Hémoglobine', 'hemoglobine', 'g/dL')}
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {renderField('Durée Symptômes', 'dureeSymptomesJours', 'jours')}
              {renderField('Âge du Patient', 'age', 'ans')}
            </div>
            {renderToggle('Sexe Biologique', 'sexe', [
              { label: 'Masculin (1.0)', value: 1.0 },
              { label: 'Féminin (0.0)', value: 0.0 }
            ])}
          </div>
        )}

        {/* 3. Readmission Model */}
        {selectedModelId === 'readmission-risk-v1' && (
          <div className="space-y-2.5">
            <div className="grid grid-cols-2 gap-2.5">
              {renderField('Âge du Patient', 'age', 'ans')}
              {renderField('Hospitalisations Précédentes', 'nbHospitalisationsRecentes', '')}
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {renderField('Durée Séjour', 'dureeSejourJours', 'jours')}
              {renderField('Comorbidités Associées', 'comorbiditesCount', '')}
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {renderField('Score Glasgow', 'scoreGlasgow', '/15')}
              {renderField('Indice IMC', 'bmi', 'kg/m²')}
            </div>
            {renderField('Niveau Autonomie', 'autonomie', '%')}
          </div>
        )}

        {/* 4. Cardiovascular Model */}
        {selectedModelId === 'cardiovascular-risk-v1' && (
          <div className="space-y-2.5">
            <div className="grid grid-cols-2 gap-2.5">
              {renderField('Pression Systolique', 'pressionSystolique', 'mmHg')}
              {renderField('Pression Diastolique', 'pressionDiastolique', 'mmHg')}
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {renderField('Pouls Cardiaque', 'frequenceCardiaque', 'bpm')}
              {renderField('Âge du Patient', 'age', 'ans')}
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {renderField('Indice IMC', 'bmi', 'kg/m²')}
              {renderField('Cholestérol', 'cholesterol', 'mmol/L')}
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {renderToggle('Diabète Connu', 'diabete', [
                { label: 'Non (0)', value: 0 },
                { label: 'Oui (1)', value: 1 }
              ])}
              {renderToggle('Tabagisme Actif', 'tabagisme', [
                { label: 'Non (0)', value: 0 },
                { label: 'Oui (1)', value: 1 }
              ])}
            </div>
          </div>
        )}

        {/* 5. Lab Anomaly Model */}
        {selectedModelId === 'lab-anomaly-detection-v1' && (
          <div className="space-y-2.5">
            <div className="grid grid-cols-2 gap-2.5">
              {renderField('Créatininémie', 'creatinine', 'µmol/L')}
              {renderField('Bilirubinémie', 'bilirubine', 'µmol/L')}
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {renderField('CRP Protéine C-Réactive', 'crp', 'mg/L')}
              {renderField('Taux Plaquettes', 'plaquettes', '/mm³')}
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {renderField('Taux Leucocytes', 'leucocytes', '/mm³')}
              {renderField('Hémoglobine', 'hemoglobine', 'g/dL')}
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {renderField('Potassium Sanguin', 'potassium', 'mmol/L')}
              {renderField('Natrémie Sanguine', 'natremie', 'mmol/L')}
            </div>
          </div>
        )}
      </div>

      <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-xl p-3 flex items-center gap-2 text-xs font-semibold text-emerald-900">
        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>Données dynamiques réelles envoyées au serveur IA</span>
      </div>

      <button
        type="button"
        onClick={handleRunPrediction}
        disabled={isLoading || !hasSelectedPatient}
        className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-500 via-teal-600 to-emerald-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-sm rounded-xl shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-3 transition-all cursor-pointer disabled:opacity-50"
      >
        {isLoading ? (
          <>
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span>Calcul Évaluation en Cours (Étape {loadingStep}/3)...</span>
          </>
        ) : (
          <>
            <Brain className="w-5 h-5 text-emerald-200" />
            <span>Lancer l'Analyse Diagnostique Clinique</span>
          </>
        )}
      </button>
    </div>
  )
}
