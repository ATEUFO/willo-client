import React, { useState, useMemo } from 'react'
import { X, Plus, Trash2, CreditCard } from 'lucide-react'
import { Patient, Invoice, InvoiceItem } from '../../store/hospitalStore'

interface CreateInvoiceModalProps {
  onClose: () => void
  onSave: (invoiceData: Omit<Invoice, 'id' | 'invoiceCode' | 'status' | 'date'>) => void
  patients: Patient[]
}

export const CreateInvoiceModal: React.FC<CreateInvoiceModalProps> = ({
  onClose,
  onSave,
  patients
}) => {
  const [selectedPatientId, setSelectedPatientId] = useState<string>('')
  const [insuranceName, setInsuranceName] = useState<string>('Sans Mutuelle')
  const [insuranceCoveragePercent, setInsuranceCoveragePercent] = useState<number>(0)
  const [items, setItems] = useState<InvoiceItem[]>([])

  // Item builder inputs
  const [itemDesc, setItemDesc] = useState<string>('')
  const [itemAmount, setItemAmount] = useState<string>('')
  const [itemCategory, setItemCategory] = useState<InvoiceItem['category']>('Consultation')

  // Selected patient details
  const activePatient = useMemo(() => {
    return patients.find((p) => p.id === selectedPatientId) || null
  }, [patients, selectedPatientId])

  // Dynamic computations
  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + item.amount, 0)
  }, [items])

  const insuranceAmount = useMemo(() => {
    return Math.round(subtotal * (insuranceCoveragePercent / 100))
  }, [subtotal, insuranceCoveragePercent])

  const patientShare = useMemo(() => {
    return subtotal - insuranceAmount
  }, [subtotal, insuranceAmount])

  // Handle adding an item to the list
  const handleAddItem = () => {
    if (!itemDesc.trim() || !itemAmount.trim()) return
    const amt = parseInt(itemAmount.replace(/\D/g, '')) || 0
    if (amt <= 0) return

    setItems([
      ...items,
      {
        description: itemDesc.trim(),
        amount: amt,
        category: itemCategory
      }
    ])

    setItemDesc('')
    setItemAmount('')
  }

  // Handle deleting an item
  const handleDeleteItem = (index: number) => {
    setItems(items.filter((_, idx) => idx !== index))
  }

  // Handle submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!activePatient) {
      alert('Veuillez sélectionner un patient.')
      return
    }
    if (items.length === 0) {
      alert('Veuillez ajouter au moins un acte facturable.')
      return
    }

    onSave({
      patientId: activePatient.id,
      patientName: activePatient.name,
      insuranceName: insuranceCoveragePercent > 0 ? insuranceName : 'Sans Mutuelle',
      insuranceCoveragePercent,
      subtotal,
      insuranceAmount,
      patientShare,
      items
    })
  }

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col relative overflow-hidden select-none">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50 shrink-0">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-medical-primary" />
            Enregistrer une Nouvelle Facture
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-lg text-slate-500 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs text-left">
          {/* Patient Selector */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Patient Facturé
            </label>
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-700 focus:outline-none focus:border-medical-primary font-semibold text-xs"
              required
            >
              <option value="">-- Sélectionner un patient --</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.patientCode})
                </option>
              ))}
            </select>
          </div>

          {/* Insurance Block */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Assurance / Mutuelle
              </label>
              <input
                type="text"
                placeholder="Ex: NSIA Assurance, Gras Savoye..."
                value={insuranceName}
                onChange={(e) => setInsuranceName(e.target.value)}
                disabled={insuranceCoveragePercent === 0}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-medical-primary disabled:bg-slate-100 disabled:text-slate-400"
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Taux de Prise en Charge
                </label>
                <span className="font-bold text-emerald-700 font-mono">{insuranceCoveragePercent}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={insuranceCoveragePercent}
                onChange={(e) => setInsuranceCoveragePercent(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-medical-primary"
              />
            </div>
          </div>

          {/* Act/Item builder form */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Saisie des Actes Facturables
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50/50 p-2.5 rounded-xl border border-slate-200/60">
              <input
                type="text"
                placeholder="Libellé de l'acte..."
                value={itemDesc}
                onChange={(e) => setItemDesc(e.target.value)}
                className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-medical-primary col-span-2"
              />
              <input
                type="text"
                placeholder="Prix (F CFA)..."
                value={itemAmount}
                onChange={(e) => setItemAmount(e.target.value)}
                className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-800 focus:outline-none focus:border-medical-primary"
              />
              <select
                value={itemCategory}
                onChange={(e) => setItemCategory(e.target.value as InvoiceItem['category'])}
                className="bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs text-slate-700 focus:outline-none"
              >
                <option value="Consultation">Consultation</option>
                <option value="Soins">Soins / Vitals</option>
                <option value="Laboratoire">Laboratoire</option>
                <option value="Pharmacie">Pharmacie</option>
              </select>
              <button
                type="button"
                onClick={handleAddItem}
                className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-lg py-1.5 flex items-center justify-center gap-1 transition-all cursor-pointer col-span-2 sm:col-span-4"
              >
                <Plus className="w-3.5 h-3.5" /> Ajouter l'Acte Facturable
              </button>
            </div>
          </div>

          {/* Items List Table */}
          {items.length > 0 && (
            <div className="border border-slate-200 rounded-xl overflow-hidden max-h-[160px] overflow-y-auto">
              <table className="w-full text-left text-[11px] border-collapse">
                <thead className="bg-slate-50 text-slate-500 font-mono border-b border-slate-200">
                  <tr>
                    <th className="p-2">Description</th>
                    <th className="p-2">Catégorie</th>
                    <th className="p-2 text-right">Prix</th>
                    <th className="p-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="p-2 font-bold text-slate-850">{item.description}</td>
                      <td className="p-2 text-slate-500">{item.category}</td>
                      <td className="p-2 text-right font-mono font-bold text-slate-900">{item.amount.toLocaleString('fr-FR')} F</td>
                      <td className="p-2 text-right">
                        <button
                          type="button"
                          onClick={() => handleDeleteItem(idx)}
                          className="text-slate-400 hover:text-red-600 p-0.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Financial calculations preview */}
          {items.length > 0 && (
            <div className="bg-slate-100/50 border border-slate-200 p-3 rounded-xl space-y-1.5 font-mono text-[11px]">
              <div className="flex justify-between text-slate-500">
                <span>Sous-total Actes Brut :</span>
                <span>{subtotal.toLocaleString('fr-FR')} F CFA</span>
              </div>
              {insuranceCoveragePercent > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Prise en charge ({insuranceCoveragePercent}%) :</span>
                  <span>- {insuranceAmount.toLocaleString('fr-FR')} F CFA</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-slate-900 border-t border-dashed border-slate-350 pt-1.5 text-xs">
                <span>Reste à payer Patient :</span>
                <span className="text-medical-primary">{patientShare.toLocaleString('fr-FR')} F CFA</span>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-xl text-slate-600 hover:bg-slate-50 font-bold transition-all cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={items.length === 0 || !selectedPatientId}
              className="px-4 py-2 bg-medical-primary hover:bg-medical-hover text-white font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"
            >
              Créer la Facture
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
