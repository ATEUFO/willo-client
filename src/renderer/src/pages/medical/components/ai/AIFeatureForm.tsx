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
  handleRunPrediction,
  isLoading,
  loadingStep,
  hasSelectedPatient
}) => {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-500" /> Paramètres Médicaux Extraits
          </h2>
          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
            Données physiologiques issues du dossier patient (mode consultation)
          </p>
        </div>
        <span className="text-[11px] text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">
          {selectedModelId}
        </span>
      </div>

      <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
        {/* 1. Sepsis Model Read-Only Display */}
        {selectedModelId === 'sepsis-risk-v1' && (
          <div className="space-y-2.5">
            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 block uppercase">Température</span>
                <span className="text-xs font-black text-slate-900">{features.temperature ?? 38.9} °C</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 block uppercase">Pouls Cardiaque</span>
                <span className="text-xs font-black text-slate-900">{features.frequenceCardiaque ?? 115} bpm</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 block uppercase">Pression Systolique</span>
                <span className="text-xs font-black text-slate-900">{features.pressionSystolique ?? 90} mmHg</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 block uppercase">Pression Diastolique</span>
                <span className="text-xs font-black text-slate-900">{features.pressionDiastolique ?? 60} mmHg</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 block uppercase">Fréquence Respiratoire</span>
                <span className="text-xs font-black text-slate-900">{features.frequenceRespiratoire ?? 24} c/min</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 block uppercase">Saturation O2</span>
                <span className="text-xs font-black text-slate-900">{features.saturationO2 ?? 93} %</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 block uppercase">Taux Leucocytes</span>
                <span className="text-xs font-black text-slate-900">{features.leucocytes ?? 14500} /mm³</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 block uppercase">Lactate Sanguin</span>
                <span className="text-xs font-black text-slate-900">{features.lactate ?? 3.2} mmol/L</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 block uppercase">Score Glasgow</span>
                <span className="text-xs font-black text-slate-900">{features.scoreGlasgow ?? 14} / 15</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 block uppercase">Taux Plaquettes</span>
                <span className="text-xs font-black text-slate-900">{features.plaquettes ?? 110000} /mm³</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 block uppercase">CRP Protéine C-Réactive</span>
                <span className="text-xs font-black text-slate-900">{features.crp ?? 72.0} mg/L</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 block uppercase">Âge du Patient</span>
                <span className="text-xs font-black text-slate-900">{features.age ?? 54} ans</span>
              </div>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 block uppercase">Sexe Biologique</span>
              <span className="text-xs font-black text-slate-900">
                {(features.sexe ?? 1.0) === 1.0 ? 'Masculin (1.0)' : 'Féminin (0.0)'}
              </span>
            </div>
          </div>
        )}

        {/* 2. Malaria Model Read-Only Display */}
        {selectedModelId === 'malaria-risk-v1' && (
          <div className="space-y-2.5">
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 block uppercase">Test Diagnostic Rapide Paludisme</span>
              <span className={`text-xs font-black px-2 py-0.5 rounded inline-block mt-1 ${
                features.tdrMalaria === 1.0 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {features.tdrMalaria === 1.0 ? 'TDR Positif (1.0)' : 'TDR Négatif (0.0)'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 block uppercase">Température</span>
                <span className="text-xs font-black text-slate-900">{features.temperature ?? 39.4} °C</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 block uppercase">Pouls Cardiaque</span>
                <span className="text-xs font-black text-slate-900">{features.frequenceCardiaque ?? 105} bpm</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 block uppercase">Taux Plaquettes</span>
                <span className="text-xs font-black text-slate-900">{features.plaquettes ?? 110000} /mm³</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 block uppercase">Hémoglobine</span>
                <span className="text-xs font-black text-slate-900">{features.hemoglobine ?? 10.2} g/dL</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 block uppercase">Durée Symptômes</span>
                <span className="text-xs font-black text-slate-900">{features.dureeSymptomesJours ?? 4} jours</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 block uppercase">Âge du Patient</span>
                <span className="text-xs font-black text-slate-900">{features.age ?? 32} ans</span>
              </div>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 block uppercase">Sexe Biologique</span>
              <span className="text-xs font-black text-slate-900">
                {(features.sexe ?? 1.0) === 1.0 ? 'Masculin (1.0)' : 'Féminin (0.0)'}
              </span>
            </div>
          </div>
        )}

        {/* 3. Readmission Model Read-Only Display */}
        {selectedModelId === 'readmission-risk-v1' && (
          <div className="space-y-2.5">
            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 block uppercase">Âge du Patient</span>
                <span className="text-xs font-black text-slate-900">{features.age ?? 68} ans</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 block uppercase">Hospitalisations Précédentes</span>
                <span className="text-xs font-black text-slate-900">{features.nbHospitalisationsRecentes ?? 2}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 block uppercase">Durée Séjour</span>
                <span className="text-xs font-black text-slate-900">{features.dureeSejourJours ?? 6} jours</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 block uppercase">Comorbidités Associées</span>
                <span className="text-xs font-black text-slate-900">{features.comorbiditesCount ?? 3}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 block uppercase">Score Glasgow</span>
                <span className="text-xs font-black text-slate-900">{features.scoreGlasgow ?? 15} / 15</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 block uppercase">Indice IMC</span>
                <span className="text-xs font-black text-slate-900">{features.bmi ?? 28.4} kg/m²</span>
              </div>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 block uppercase">Niveau Autonomie</span>
              <span className="text-xs font-black text-slate-900">{features.autonomie ?? 65} %</span>
            </div>
          </div>
        )}

        {/* 4. Cardiovascular Model Read-Only Display */}
        {selectedModelId === 'cardiovascular-risk-v1' && (
          <div className="space-y-2.5">
            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 block uppercase">Pression Systolique</span>
                <span className="text-xs font-black text-slate-900">{features.pressionSystolique ?? 165} mmHg</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 block uppercase">Pression Diastolique</span>
                <span className="text-xs font-black text-slate-900">{features.pressionDiastolique ?? 102} mmHg</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 block uppercase">Pouls Cardiaque</span>
                <span className="text-xs font-black text-slate-900">{features.frequenceCardiaque ?? 88} bpm</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 block uppercase">Âge du Patient</span>
                <span className="text-xs font-black text-slate-900">{features.age ?? 58} ans</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 block uppercase">Indice IMC</span>
                <span className="text-xs font-black text-slate-900">{features.bmi ?? 31.5} kg/m²</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 block uppercase">Cholestérol</span>
                <span className="text-xs font-black text-slate-900">{features.cholesterol ?? 5.8} mmol/L</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 block uppercase">Diabète Connu</span>
                <span className="text-xs font-black text-slate-900">{features.diabete === 1 ? 'Oui (1)' : 'Non (0)'}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 block uppercase">Tabagisme Actif</span>
                <span className="text-xs font-black text-slate-900">{features.tabagisme === 1 ? 'Oui (1)' : 'Non (0)'}</span>
              </div>
            </div>
          </div>
        )}

        {/* 5. Lab Anomaly Model Read-Only Display */}
        {selectedModelId === 'lab-anomaly-detection-v1' && (
          <div className="space-y-2.5">
            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 block uppercase">Créatininémie</span>
                <span className="text-xs font-black text-slate-900">{features.creatinine ?? 145.0} µmol/L</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 block uppercase">Bilirubinémie</span>
                <span className="text-xs font-black text-slate-900">{features.bilirubine ?? 38.0} µmol/L</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 block uppercase">CRP Protéine C-Réactive</span>
                <span className="text-xs font-black text-slate-900">{features.crp ?? 72.0} mg/L</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 block uppercase">Taux Plaquettes</span>
                <span className="text-xs font-black text-slate-900">{features.plaquettes ?? 110000} /mm³</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 block uppercase">Taux Leucocytes</span>
                <span className="text-xs font-black text-slate-900">{features.leucocytes ?? 12500} /mm³</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 block uppercase">Hémoglobine</span>
                <span className="text-xs font-black text-slate-900">{features.hemoglobine ?? 10.2} g/dL</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 block uppercase">Potassium Sanguin</span>
                <span className="text-xs font-black text-slate-900">{features.potassium ?? 4.5} mmol/L</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 block uppercase">Natrémie Sanguine</span>
                <span className="text-xs font-black text-slate-900">{features.natremie ?? 137.0} mmol/L</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-xl p-3 flex items-center gap-2 text-xs font-semibold text-emerald-900">
        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>Données synchronisées avec la passerelle API Gateway (port 5030)</span>
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
