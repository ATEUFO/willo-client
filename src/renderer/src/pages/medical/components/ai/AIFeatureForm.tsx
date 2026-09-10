import React from 'react'
import { Activity, Brain, RefreshCw } from 'lucide-react'
import { AIModelId } from '../../../../services/aiDiagnosticService'

interface AIFeatureFormProps {
  selectedModelId: AIModelId
  features: Record<string, number>
  handleFeatureChange: (key: string, value: number) => void
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
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-500" /> Paramètres Médicaux du Patient
        </h2>
        <span className="text-[11px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
          {selectedModelId}
        </span>
      </div>

      <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
        {/* 1. Sepsis Model Features (13 features: temperature, frequenceCardiaque, pressionSystolique, pressionDiastolique, frequenceRespiratoire, saturationO2, leucocytes, lactate, scoreGlasgow, plaquettes, crp, age, sexe) */}
        {selectedModelId === 'sepsis-risk-v1' && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700">Température (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  value={features.temperature ?? 38.9}
                  onChange={(e) => handleFeatureChange('temperature', parseFloat(e.target.value) || 37.0)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold mt-1"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-700">Pouls Cardiaque (bpm)</label>
                <input
                  type="number"
                  value={features.frequenceCardiaque ?? 115}
                  onChange={(e) => handleFeatureChange('frequenceCardiaque', parseFloat(e.target.value) || 75)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700">Pression Systolique (mmHg)</label>
                <input
                  type="number"
                  value={features.pressionSystolique ?? 90}
                  onChange={(e) => handleFeatureChange('pressionSystolique', parseFloat(e.target.value) || 120)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold mt-1"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-700">Pression Diastolique (mmHg)</label>
                <input
                  type="number"
                  value={features.pressionDiastolique ?? 60}
                  onChange={(e) => handleFeatureChange('pressionDiastolique', parseFloat(e.target.value) || 80)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700">Fréquence Respiratoire (c/min)</label>
                <input
                  type="number"
                  value={features.frequenceRespiratoire ?? 24}
                  onChange={(e) => handleFeatureChange('frequenceRespiratoire', parseFloat(e.target.value) || 16)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold mt-1"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-700">Saturation O2 (%)</label>
                <input
                  type="number"
                  value={features.saturationO2 ?? 93}
                  onChange={(e) => handleFeatureChange('saturationO2', parseFloat(e.target.value) || 98)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700">Taux Leucocytes (/mm³)</label>
                <input
                  type="number"
                  value={features.leucocytes ?? 14500}
                  onChange={(e) => handleFeatureChange('leucocytes', parseFloat(e.target.value) || 7500)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold mt-1"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-700">Lactate Sanguin (mmol/L)</label>
                <input
                  type="number"
                  step="0.1"
                  value={features.lactate ?? 3.2}
                  onChange={(e) => handleFeatureChange('lactate', parseFloat(e.target.value) || 1.1)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700">Score Glasgow (3-15)</label>
                <input
                  type="number"
                  min="3"
                  max="15"
                  value={features.scoreGlasgow ?? 14}
                  onChange={(e) => handleFeatureChange('scoreGlasgow', parseFloat(e.target.value) || 15)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold mt-1"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-700">Taux Plaquettes (/mm³)</label>
                <input
                  type="number"
                  value={features.plaquettes ?? 110000}
                  onChange={(e) => handleFeatureChange('plaquettes', parseFloat(e.target.value) || 250000)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700">Protéine C-Réactive CRP (mg/L)</label>
                <input
                  type="number"
                  step="0.1"
                  value={features.crp ?? 72.0}
                  onChange={(e) => handleFeatureChange('crp', parseFloat(e.target.value) || 5.0)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold mt-1"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-700">Âge du Patient (ans)</label>
                <input
                  type="number"
                  value={features.age ?? 54}
                  onChange={(e) => handleFeatureChange('age', parseFloat(e.target.value) || 45)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold mt-1"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700">Sexe du Patient</label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => handleFeatureChange('sexe', 1.0)}
                  className={`py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    (features.sexe ?? 1.0) === 1.0
                      ? 'bg-slate-800 text-white border-slate-900 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  Masculin (1.0)
                </button>
                <button
                  type="button"
                  onClick={() => handleFeatureChange('sexe', 0.0)}
                  className={`py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    (features.sexe ?? 1.0) === 0.0
                      ? 'bg-slate-800 text-white border-slate-900 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  Féminin (0.0)
                </button>
              </div>
            </div>
          </>
        )}

        {/* 2. Malaria Model Features (8 features: temperature, frequenceCardiaque, age, tdrMalaria, plaquettes, hemoglobine, sexe, dureeSymptomesJours) */}
        {selectedModelId === 'malaria-risk-v1' && (
          <>
            <div>
              <label className="text-[11px] font-bold text-slate-700">Test Diagnostic Rapide Paludisme</label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => handleFeatureChange('tdrMalaria', 1.0)}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    features.tdrMalaria === 1.0
                      ? 'bg-rose-500 text-white border-rose-600 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  TDR Positif (1.0)
                </button>
                <button
                  type="button"
                  onClick={() => handleFeatureChange('tdrMalaria', 0.0)}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    features.tdrMalaria === 0.0
                      ? 'bg-emerald-500 text-white border-emerald-600 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  TDR Négatif (0.0)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-[11px] font-bold text-slate-700">Température (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  value={features.temperature ?? 39.4}
                  onChange={(e) => handleFeatureChange('temperature', parseFloat(e.target.value) || 38.5)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold mt-1"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-700">Pouls Cardiaque (bpm)</label>
                <input
                  type="number"
                  value={features.frequenceCardiaque ?? 105}
                  onChange={(e) => handleFeatureChange('frequenceCardiaque', parseFloat(e.target.value) || 105)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700">Taux Plaquettes (/mm³)</label>
                <input
                  type="number"
                  value={features.plaquettes ?? 110000}
                  onChange={(e) => handleFeatureChange('plaquettes', parseFloat(e.target.value) || 120000)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold mt-1"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-700">Taux Hémoglobine (g/dL)</label>
                <input
                  type="number"
                  step="0.1"
                  value={features.hemoglobine ?? 10.2}
                  onChange={(e) => handleFeatureChange('hemoglobine', parseFloat(e.target.value) || 10.5)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700">Durée Symptômes (jours)</label>
                <input
                  type="number"
                  value={features.dureeSymptomesJours ?? 4}
                  onChange={(e) => handleFeatureChange('dureeSymptomesJours', parseFloat(e.target.value) || 1)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold mt-1"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-700">Âge du Patient (ans)</label>
                <input
                  type="number"
                  value={features.age ?? 32}
                  onChange={(e) => handleFeatureChange('age', parseFloat(e.target.value) || 30)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold mt-1"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700">Sexe du Patient</label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => handleFeatureChange('sexe', 1.0)}
                  className={`py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    (features.sexe ?? 1.0) === 1.0
                      ? 'bg-slate-800 text-white border-slate-900 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  Masculin (1.0)
                </button>
                <button
                  type="button"
                  onClick={() => handleFeatureChange('sexe', 0.0)}
                  className={`py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    (features.sexe ?? 1.0) === 0.0
                      ? 'bg-slate-800 text-white border-slate-900 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  Féminin (0.0)
                </button>
              </div>
            </div>
          </>
        )}

        {/* 3. Readmission Model Features (7 features: age, nbHospitalisationsRecentes, dureeSejourJours, comorbiditesCount, scoreGlasgow, bmi, autonomie) */}
        {selectedModelId === 'readmission-risk-v1' && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700">Âge du Patient (ans)</label>
                <input
                  type="number"
                  value={features.age ?? 68}
                  onChange={(e) => handleFeatureChange('age', parseFloat(e.target.value) || 65)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold mt-1"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-700">Hospitalisations Précédentes</label>
                <input
                  type="number"
                  value={features.nbHospitalisationsRecentes ?? 2}
                  onChange={(e) => handleFeatureChange('nbHospitalisationsRecentes', parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700">Durée Séjour (jours)</label>
                <input
                  type="number"
                  value={features.dureeSejourJours ?? 6}
                  onChange={(e) => handleFeatureChange('dureeSejourJours', parseFloat(e.target.value) || 1)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold mt-1"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-700">Comorbidités Associées</label>
                <input
                  type="number"
                  value={features.comorbiditesCount ?? 3}
                  onChange={(e) => handleFeatureChange('comorbiditesCount', parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700">Score Conscience Glasgow (3-15)</label>
                <input
                  type="number"
                  min="3"
                  max="15"
                  value={features.scoreGlasgow ?? 15}
                  onChange={(e) => handleFeatureChange('scoreGlasgow', parseFloat(e.target.value) || 15)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold mt-1"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-700">Indice Masse Corporelle IMC</label>
                <input
                  type="number"
                  step="0.1"
                  value={features.bmi ?? 28.4}
                  onChange={(e) => handleFeatureChange('bmi', parseFloat(e.target.value) || 24.0)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold mt-1"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700">Niveau Autonomie (%)</label>
              <input
                type="number"
                value={features.autonomie ?? 65}
                onChange={(e) => handleFeatureChange('autonomie', parseFloat(e.target.value) || 100)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold mt-1"
              />
            </div>
          </>
        )}

        {/* 4. Cardiovascular Model Features (8 features: pressionSystolique, pressionDiastolique, frequenceCardiaque, age, bmi, diabete, tabagisme, cholesterol) */}
        {selectedModelId === 'cardiovascular-risk-v1' && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700">Pression Systolique (mmHg)</label>
                <input
                  type="number"
                  value={features.pressionSystolique ?? 165}
                  onChange={(e) => handleFeatureChange('pressionSystolique', parseFloat(e.target.value) || 120)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold mt-1"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-700">Pression Diastolique (mmHg)</label>
                <input
                  type="number"
                  value={features.pressionDiastolique ?? 102}
                  onChange={(e) => handleFeatureChange('pressionDiastolique', parseFloat(e.target.value) || 80)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700">Pouls Cardiaque (bpm)</label>
                <input
                  type="number"
                  value={features.frequenceCardiaque ?? 88}
                  onChange={(e) => handleFeatureChange('frequenceCardiaque', parseFloat(e.target.value) || 75)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold mt-1"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-700">Âge du Patient (ans)</label>
                <input
                  type="number"
                  value={features.age ?? 58}
                  onChange={(e) => handleFeatureChange('age', parseFloat(e.target.value) || 50)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700">Indice Masse Corporelle IMC</label>
                <input
                  type="number"
                  step="0.1"
                  value={features.bmi ?? 31.5}
                  onChange={(e) => handleFeatureChange('bmi', parseFloat(e.target.value) || 24.0)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold mt-1"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-700">Cholestérol (mmol/L)</label>
                <input
                  type="number"
                  step="0.1"
                  value={features.cholesterol ?? 5.8}
                  onChange={(e) => handleFeatureChange('cholesterol', parseFloat(e.target.value) || 4.5)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-[11px] font-bold text-slate-700">Diabète Connu</label>
                <select
                  value={features.diabete ?? 0}
                  onChange={(e) => handleFeatureChange('diabete', parseInt(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold mt-1"
                >
                  <option value={0}>Non (0)</option>
                  <option value={1}>Oui (1)</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-700">Tabagisme Actif</label>
                <select
                  value={features.tabagisme ?? 1}
                  onChange={(e) => handleFeatureChange('tabagisme', parseInt(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold mt-1"
                >
                  <option value={0}>Non (0)</option>
                  <option value={1}>Oui (1)</option>
                </select>
              </div>
            </div>
          </>
        )}

        {/* 5. Lab Anomaly Model Features (8 features: creatinine, leucocytes, plaquettes, bilirubine, crp, hemoglobine, potassium, natremie) */}
        {selectedModelId === 'lab-anomaly-detection-v1' && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700">Créatininémie (µmol/L)</label>
                <input
                  type="number"
                  step="0.1"
                  value={features.creatinine ?? 145.0}
                  onChange={(e) => handleFeatureChange('creatinine', parseFloat(e.target.value) || 80.0)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold mt-1"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-700">Bilirubinémie (µmol/L)</label>
                <input
                  type="number"
                  step="0.1"
                  value={features.bilirubine ?? 38.0}
                  onChange={(e) => handleFeatureChange('bilirubine', parseFloat(e.target.value) || 12.0)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700">Protéine C-Réactive CRP (mg/L)</label>
                <input
                  type="number"
                  step="0.1"
                  value={features.crp ?? 72.0}
                  onChange={(e) => handleFeatureChange('crp', parseFloat(e.target.value) || 5.0)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold mt-1"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-700">Taux Plaquettes (/mm³)</label>
                <input
                  type="number"
                  value={features.plaquettes ?? 110000}
                  onChange={(e) => handleFeatureChange('plaquettes', parseFloat(e.target.value) || 250000)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700">Taux Leucocytes (/mm³)</label>
                <input
                  type="number"
                  value={features.leucocytes ?? 12500}
                  onChange={(e) => handleFeatureChange('leucocytes', parseFloat(e.target.value) || 7500)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold mt-1"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-700">Taux Hémoglobine (g/dL)</label>
                <input
                  type="number"
                  step="0.1"
                  value={features.hemoglobine ?? 10.2}
                  onChange={(e) => handleFeatureChange('hemoglobine', parseFloat(e.target.value) || 13.5)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700">Potassium Sanguin (mmol/L)</label>
                <input
                  type="number"
                  step="0.1"
                  value={features.potassium ?? 4.5}
                  onChange={(e) => handleFeatureChange('potassium', parseFloat(e.target.value) || 4.0)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold mt-1"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-700">Natrémie Sanguine (mmol/L)</label>
                <input
                  type="number"
                  step="0.1"
                  value={features.natremie ?? 137.0}
                  onChange={(e) => handleFeatureChange('natremie', parseFloat(e.target.value) || 140.0)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold mt-1"
                />
              </div>
            </div>
          </>
        )}
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

