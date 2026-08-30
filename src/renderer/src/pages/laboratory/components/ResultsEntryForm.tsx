import React, { useState, useEffect } from 'react'
import {
  AlertTriangle,
  Plus,
  Trash2,
  ChevronLeft,
  Check
} from 'lucide-react'
import { LabRequest, LabResultItem } from '../../store/hospitalStore'

// Helper to check if a result value is abnormal compared to its reference range
const checkIsAbnormal = (_param: string, value: string, refRange: string): boolean => {
  if (!value || value.trim() === '') return false

  const cleanVal = parseFloat(value.replace(',', '.'))
  if (isNaN(cleanVal)) {
    const lowerRef = refRange.toLowerCase()
    const lowerVal = value.toLowerCase()
    if (lowerRef.includes('négatif') || lowerRef.includes('stérile')) {
      return lowerVal.includes('pos') || lowerVal.includes('réac') || lowerVal.includes('oui')
    }
    return false
  }

  if (refRange.startsWith('<')) {
    const maxVal = parseFloat(refRange.replace('<', '').trim())
    return !isNaN(maxVal) && cleanVal >= maxVal
  }

  if (refRange.startsWith('>')) {
    const minVal = parseFloat(refRange.replace('>', '').trim())
    return !isNaN(minVal) && cleanVal <= minVal
  }

  const parts = refRange.split('-')
  if (parts.length === 2) {
    const minVal = parseFloat(parts[0].trim())
    const maxVal = parseFloat(parts[1].trim())
    return (!isNaN(minVal) && cleanVal < minVal) || (!isNaN(maxVal) && cleanVal > maxVal)
  }

  return false
}

// Default biological templates
const DEFAULT_PARAMETERS_BY_CATEGORY: Record<string, { param: string; unit: string; refRange: string }[]> = {
  'Hématologie': [
    { param: 'Hémoglobine (Hb)', unit: 'g/dL', refRange: '12.0 - 16.0' },
    { param: 'Globules Rouges (RBC)', unit: 'M/µL', refRange: '4.0 - 5.2' },
    { param: 'Globules Blancs (WBC)', unit: 'k/µL', refRange: '4.0 - 10.0' },
    { param: 'Plaquettes (PLT)', unit: 'k/µL', refRange: '150 - 450' }
  ],
  'Biochimie': [
    { param: 'Glycémie à jeun', unit: 'g/L', refRange: '0.70 - 1.10' },
    { param: 'Cholestérol Total', unit: 'g/L', refRange: '< 2.00' },
    { param: 'Triglycérides', unit: 'g/L', refRange: '0.40 - 1.50' },
    { param: 'Créatinine', unit: 'mg/L', refRange: '5.0 - 12.0' }
  ],
  'Microbiologie': [
    { param: 'Examen Direct (Frotti)', unit: '-', refRange: 'Négatif' },
    { param: 'Culture (24h/48h)', unit: '-', refRange: 'Stérile' },
    { param: 'Antibiogramme', unit: '-', refRange: 'Sensible' }
  ],
  'Immunologie': [
    { param: 'Statut VIH (Elisa)', unit: '-', refRange: 'Négatif' },
    { param: 'HBS Ag (Hépatite B)', unit: '-', refRange: 'Négatif' }
  ]
}

const getTemplateParameters = (category: string, testName: string) => {
  const catKey = Object.keys(DEFAULT_PARAMETERS_BY_CATEGORY).find(
    (key) => key.toLowerCase() === category.toLowerCase()
  )
  if (catKey) return DEFAULT_PARAMETERS_BY_CATEGORY[catKey]

  const lowerTest = testName.toLowerCase()
  if (lowerTest.includes('nfs') || lowerTest.includes('sang') || lowerTest.includes('hémato')) {
    return DEFAULT_PARAMETERS_BY_CATEGORY['Hématologie']
  }
  if (lowerTest.includes('glyc') || lowerTest.includes('lipid') || lowerTest.includes('cholest') || lowerTest.includes('bioch')) {
    return DEFAULT_PARAMETERS_BY_CATEGORY['Biochimie']
  }

  return [
    { param: 'Paramètre Principal', unit: '-', refRange: 'Normal' },
    { param: 'Observations', unit: '-', refRange: 'Normal' }
  ]
}

interface ResultsEntryFormProps {
  request: LabRequest
  onSaveDraft: (results: LabResultItem[], notes: string) => void
  onValidate: (results: LabResultItem[], notes: string) => void
  onBack: () => void
  getUrgencyLevel: (req: LabRequest) => { label: string; bg: string; text: string; glow?: string }
}

export const ResultsEntryForm: React.FC<ResultsEntryFormProps> = ({
  request,
  onSaveDraft,
  onValidate,
  onBack,
  getUrgencyLevel
}) => {
  const [resultItems, setResultItems] = useState<LabResultItem[]>([])
  const [clinicalNotes, setClinicalNotes] = useState('')
  
  // Custom parameter builder states
  const [newParamName, setNewParamName] = useState('')
  const [newParamUnit, setNewParamUnit] = useState('')
  const [newParamRef, setNewParamRef] = useState('')
  const [newParamVal, setNewParamVal] = useState('')

  // Map request to its dynamic results and observations on load
  useEffect(() => {
    const savedNotes = request.results?.find((r) => r.param === 'Observations Cliniques')?.value || ''
    setClinicalNotes(savedNotes)

    const actualResults = request.results?.filter((r) => r.param !== 'Observations Cliniques') || []
    
    if (actualResults.length > 0) {
      setResultItems(actualResults)
    } else {
      const templates = getTemplateParameters(request.category, request.testName)
      setResultItems(
        templates.map((t) => ({
          param: t.param,
          value: '',
          unit: t.unit,
          refRange: t.refRange,
          isAbnormal: false
        }))
      )
    }

    setNewParamName('')
    setNewParamUnit('')
    setNewParamRef('')
    setNewParamVal('')
  }, [request])

  // Handle value modifications and auto check reference ranges
  const handleValueChange = (index: number, val: string) => {
    const updated = [...resultItems]
    updated[index].value = val
    updated[index].isAbnormal = checkIsAbnormal(updated[index].param, val, updated[index].refRange)
    setResultItems(updated)
  }

  // Add custom parameter dynamically to the results list
  const handleAddCustomParam = () => {
    if (!newParamName.trim()) return

    const newItem: LabResultItem = {
      param: newParamName.trim(),
      value: newParamVal.trim(),
      unit: newParamUnit.trim() || '-',
      refRange: newParamRef.trim() || 'Normal',
      isAbnormal: checkIsAbnormal(newParamName, newParamVal, newParamRef)
    }

    setResultItems([...resultItems, newItem])

    setNewParamName('')
    setNewParamVal('')
    setNewParamUnit('')
    setNewParamRef('')
  }

  // Delete parameter row
  const handleDeleteParam = (index: number) => {
    setResultItems(resultItems.filter((_, idx) => idx !== index))
  }

  const urgency = getUrgencyLevel(request)

  return (
    <div className="space-y-5">
      {/* Entry Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-slate-100 rounded-xl border border-slate-200 transition-all cursor-pointer"
            title="Retour au Kanban"
          >
            <ChevronLeft className="w-4 h-4 text-slate-600" />
          </button>
          <div>
            <h3 className="font-bold text-slate-800 text-sm">
              Grille de saisie : <span className="text-medical-primary font-bold">{request.patientName}</span>
            </h3>
            <p className="text-[11px] text-slate-500 font-mono">
              N° Prescription : {request.requestCode} • Examen : {request.testName}
            </p>
          </div>
        </div>

        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase ${urgency.bg}`}>
          Urgence : {urgency.label}
        </span>
      </div>

      {/* Grid Table Form */}
      <div className="space-y-4">
        <div className="overflow-x-auto rounded-xl border border-medical-border">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-600 font-mono border-b border-medical-border">
              <tr>
                <th className="p-3">Paramètre</th>
                <th className="p-3">Valeur</th>
                <th className="p-3">Unité</th>
                <th className="p-3">Normes (Réf)</th>
                <th className="p-3">Statut</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-medical-border text-slate-700">
              {resultItems.map((item, idx) => (
                <tr
                  key={idx}
                  className={`transition-colors ${
                    item.isAbnormal ? 'bg-red-50/30' : 'hover:bg-slate-50/50'
                  }`}
                >
                  <td className="p-3 font-bold text-slate-800">{item.param}</td>
                  <td className="p-3">
                    <input
                      type="text"
                      placeholder="Mesure..."
                      value={item.value}
                      onChange={(e) => handleValueChange(idx, e.target.value)}
                      className={`w-28 px-2.5 py-1.5 bg-white border rounded-lg font-mono font-bold text-xs text-slate-800 focus:outline-none focus:ring-1 transition-all ${
                        item.isAbnormal
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-500 text-red-700'
                          : 'border-slate-300 focus:border-emerald-500 focus:ring-emerald-500'
                      }`}
                    />
                  </td>
                  <td className="p-3 text-slate-500 font-mono">{item.unit}</td>
                  <td className="p-3 text-slate-600 font-mono font-semibold">{item.refRange}</td>
                  <td className="p-3">
                    {item.isAbnormal ? (
                      <span className="px-2 py-0.5 rounded bg-red-100 text-red-700 border border-red-200 text-[9px] font-bold flex items-center gap-1 w-fit">
                        <AlertTriangle className="w-3 h-3" /> Hors Norme
                      </span>
                    ) : item.value ? (
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 border border-emerald-200 text-[9px] font-bold flex items-center gap-1 w-fit">
                        <Check className="w-3 h-3" /> Conforme
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">Vide</span>
                    )}
                  </td>
                  <td className="p-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleDeleteParam(idx)}
                      className="p-1 hover:bg-slate-100 text-slate-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                      title="Supprimer ce paramètre"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add parameter row builder */}
        <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            Ajouter un paramètre sur-mesure (Optionnel)
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            <input
              type="text"
              placeholder="Nom paramètre..."
              value={newParamName}
              onChange={(e) => setNewParamName(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
            />
            <input
              type="text"
              placeholder="Valeur..."
              value={newParamVal}
              onChange={(e) => setNewParamVal(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-800 focus:outline-none focus:border-emerald-500"
            />
            <input
              type="text"
              placeholder="Unité (ex: g/L)..."
              value={newParamUnit}
              onChange={(e) => setNewParamUnit(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-800 focus:outline-none focus:border-emerald-500"
            />
            <input
              type="text"
              placeholder="Norme (ex: 0.7 - 1.1)..."
              value={newParamRef}
              onChange={(e) => setNewParamRef(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-800 focus:outline-none focus:border-emerald-500"
            />
            <button
              type="button"
              onClick={handleAddCustomParam}
              className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer col-span-2 sm:col-span-1"
            >
              <Plus className="w-3.5 h-3.5" /> Ajouter
            </button>
          </div>
        </div>
      </div>

      {/* Clinical Notes */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
          Observations & Remarques Cliniques
        </label>
        <textarea
          rows={3}
          placeholder="Saisir des remarques sur la qualité de l'échantillon (ex: échantillon hémolysé) ou la technique utilisée..."
          value={clinicalNotes}
          onChange={(e) => setClinicalNotes(e.target.value)}
          className="w-full bg-slate-50/50 border border-slate-300 rounded-xl p-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
        />
      </div>

      {/* Form Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-3 border-t border-slate-100">
        <button
          type="button"
          onClick={() => onSaveDraft(resultItems, clinicalNotes)}
          className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
        >
          Enregistrer en Brouillon
        </button>
        <button
          type="button"
          onClick={() => onValidate(resultItems, clinicalNotes)}
          className="w-full sm:w-auto px-5 py-2.5 bg-medical-primary hover:bg-medical-hover text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-1 cursor-pointer"
        >
          <Check className="w-4 h-4" />
          Valider et Transmettre
        </button>
      </div>
    </div>
  )
}
