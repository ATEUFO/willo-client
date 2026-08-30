import React, { useState, useMemo, useEffect } from 'react'
import {
  TestTube,
  FileCheck,
  TrendingUp,
  Search,
  Clock,
  FileText
} from 'lucide-react'
import { useHospitalStore, LabRequest, LabResultItem } from '../store/hospitalStore'
import { PrintReportModal } from './components/PrintReportModal'
import { ResultsEntryForm } from './components/ResultsEntryForm'
import { LaboratoryKanban } from './components/LaboratoryKanban'

export const LaboratoryPage: React.FC = () => {
  const { labRequests, updateLabRequestStatus, currentUser } = useHospitalStore()

  // Navigation & Search Views
  const [activeView, setActiveView] = useState<'kanban' | 'results_entry'>('kanban')
  const [selectedRequest, setSelectedRequest] = useState<LabRequest | null>(null)
  
  // Filtering & Scan States
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [barcodeInput, setBarcodeInput] = useState('')
  
  // Report Modal state
  const [viewingReportRequest, setViewingReportRequest] = useState<LabRequest | null>(null)

  // Auto select a request if results_entry is loaded without selection
  useEffect(() => {
    if (activeView === 'results_entry' && !selectedRequest && labRequests.length > 0) {
      const pendingRequests = labRequests.filter(r => r.status === 'In Progress' || r.status === 'To Do')
      if (pendingRequests.length > 0) {
        handleSelectRequest(pendingRequests[0])
      } else {
        handleSelectRequest(labRequests[0])
      }
    }
  }, [activeView, selectedRequest, labRequests])

  // Select request helper
  const handleSelectRequest = (req: LabRequest) => {
    setSelectedRequest(req)
  }

  // Save current entries as draft (Status: 'In Progress')
  const handleSaveDraft = (results: LabResultItem[], notes: string) => {
    if (!selectedRequest) return

    const dataToSave: LabResultItem[] = [
      ...results,
      {
        param: 'Observations Cliniques',
        value: notes,
        unit: '',
        refRange: '',
        isAbnormal: false
      }
    ]

    updateLabRequestStatus(selectedRequest.id, 'In Progress', dataToSave)
    
    setSelectedRequest({
      ...selectedRequest,
      status: 'In Progress',
      results: dataToSave
    })

    alert(`Brouillon enregistré localement pour ${selectedRequest.patientName}.`)
  }

  // Final validation and transmission to the doctor (Status: 'Completed')
  const handleValidateAndTransmit = (results: LabResultItem[], notes: string) => {
    if (!selectedRequest) return

    const dataToSave: LabResultItem[] = [
      ...results,
      {
        param: 'Observations Cliniques',
        value: notes,
        unit: '',
        refRange: '',
        isAbnormal: false
      }
    ]

    updateLabRequestStatus(selectedRequest.id, 'Completed', dataToSave)

    alert(`Bilan d'analyses validé avec succès. Transmis au médecin traitant!`)
    setActiveView('kanban')
    setSelectedRequest(null)
  }

  // Barcode / Sample Code Scan simulator handler
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!barcodeInput.trim()) return

    const matched = labRequests.find(
      (r) =>
        r.requestCode.toLowerCase() === barcodeInput.trim().toLowerCase() ||
        r.id.toLowerCase() === barcodeInput.trim().toLowerCase()
    )

    if (matched) {
      handleSelectRequest(matched)
      setActiveView('results_entry')
      setBarcodeInput('')
    } else {
      alert(`Aucun échantillon ne correspond au code : "${barcodeInput}"`)
    }
  }

  // Urgency dynamic configuration mapper
  const getUrgencyLevel = (req: LabRequest): { label: string; bg: string; text: string; glow?: string } => {
    const codeNum = parseInt(req.requestCode.replace(/\D/g, '')) || 0
    if (codeNum % 3 === 0) {
      return {
        label: 'Urgent',
        bg: 'bg-red-50 text-red-700 border-red-200',
        text: 'text-red-600',
        glow: 'shadow-[0_0_10px_rgba(239,68,68,0.25)] border-red-300 animate-pulse'
      }
    }
    if (codeNum % 3 === 1) {
      return {
        label: 'Prioritaire',
        bg: 'bg-amber-50 text-amber-800 border-amber-200',
        text: 'text-amber-600'
      }
    }
    return {
      label: 'Normal',
      bg: 'bg-slate-50 text-slate-600 border-slate-200',
      text: 'text-slate-500'
    }
  }

  // Filter list of requests
  const filteredRequests = useMemo(() => {
    return labRequests.filter((r) => {
      const query = searchQuery.toLowerCase().trim()
      const matchesSearch =
        r.patientName.toLowerCase().includes(query) ||
        r.requestCode.toLowerCase().includes(query) ||
        r.patientId.toLowerCase().includes(query) ||
        r.testName.toLowerCase().includes(query)

      if (!matchesSearch) return false

      if (categoryFilter !== 'all') {
        return r.category.toLowerCase() === categoryFilter.toLowerCase()
      }

      return true
    })
  }, [labRequests, searchQuery, categoryFilter])

  // Kanban column splits
  const todoList = filteredRequests.filter((r) => r.status === 'To Do')
  const inProgressList = filteredRequests.filter((r) => r.status === 'In Progress')
  const pendingValList = filteredRequests.filter((r) => r.status === 'Pending Validation')
  const completedList = filteredRequests.filter((r) => r.status === 'Completed')

  // Sidebar list items
  const sidebarPendingRequests = useMemo(() => {
    return [...inProgressList, ...todoList]
  }, [inProgressList, todoList])

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 print:p-0 print:m-0 select-none">
      {/* Top Header Controls (Hidden during physical printing) */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-medical-border pb-5 print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-medical-subtle rounded-2xl flex items-center justify-center border border-emerald-200 shadow-2xs">
            <TestTube className="w-6 h-6 text-medical-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              Espace Laboratoire & Biologie Clinique
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Pipeline des prélèvements, saisie biologique instantanée et validation de comptes-rendus.
            </p>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveView('kanban')}
            className={`px-4 py-2 rounded-lg text-xs font-bold cursor-pointer transition-all flex items-center gap-2 ${
              activeView === 'kanban'
                ? 'bg-white text-slate-800 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Pipeline Kanban ({labRequests.length})
          </button>
          <button
            onClick={() => {
              if (inProgressList.length > 0) {
                handleSelectRequest(inProgressList[0])
              } else if (todoList.length > 0) {
                handleSelectRequest(todoList[0])
              }
              setActiveView('results_entry')
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold cursor-pointer transition-all flex items-center gap-2 ${
              activeView === 'results_entry'
                ? 'bg-white text-slate-800 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            Saisie de Résultats
          </button>
        </div>
      </div>

      {/* Filter and Scan Bar (Hidden during printing) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white border border-medical-border p-4 rounded-2xl shadow-2xs print:hidden">
        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par patient, ID ou analyse..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-medical-border rounded-xl text-xs text-slate-800 focus:outline-none focus:border-medical-primary focus:ring-1 focus:ring-medical-primary transition-all"
          />
        </div>

        {/* Category filter */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-semibold whitespace-nowrap">Catégorie :</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full bg-slate-50 border border-medical-border rounded-xl p-2 text-slate-700 focus:outline-none focus:border-medical-primary font-semibold"
          >
            <option value="all">Toutes les disciplines</option>
            <option value="Biochimie">Biochimie</option>
            <option value="Hématologie">Hématologie</option>
            <option value="Microbiologie">Microbiologie</option>
            <option value="Immunologie">Immunologie</option>
          </select>
        </div>

        {/* Scanner Simulation bar */}
        <form onSubmit={handleBarcodeSubmit} className="relative">
          <input
            type="text"
            placeholder="Scanner ou saisir code échantillon (Ex: LAB-2026-088)..."
            value={barcodeInput}
            onChange={(e) => setBarcodeInput(e.target.value)}
            className="w-full pl-4 pr-16 py-2.5 bg-slate-50 border border-medical-border rounded-xl text-xs font-mono font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
          />
          <button
            type="submit"
            className="absolute right-1 top-1/2 -translate-y-1/2 bg-slate-800 text-white font-bold text-[10px] uppercase px-2.5 py-1.5 rounded-lg hover:bg-slate-900 transition-all cursor-pointer"
          >
            Scan
          </button>
        </form>
      </div>

      {/* VIEW 1: KANBAN BOARD */}
      {activeView === 'kanban' && (
        <LaboratoryKanban
          todoList={todoList}
          inProgressList={inProgressList}
          pendingValList={pendingValList}
          completedList={completedList}
          onSelectRequest={(req) => {
            handleSelectRequest(req)
            setActiveView('results_entry')
          }}
          onStartAnalysis={(id) => updateLabRequestStatus(id, 'In Progress')}
          onPrintReport={(req) => setViewingReportRequest(req)}
          getUrgencyLevel={getUrgencyLevel}
        />
      )}

      {/* VIEW 2: RESULTS ENTRY GRID */}
      {activeView === 'results_entry' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start print:hidden">
          {/* LEFT SIDE: Selection List */}
          <div className="bg-white border border-medical-border rounded-2xl p-4 space-y-4 shadow-2xs lg:col-span-1">
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              Dossiers en attente de saisie
            </h3>
            
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {sidebarPendingRequests.map((req) => {
                const isSelected = selectedRequest?.id === req.id
                return (
                  <div
                    key={req.id}
                    onClick={() => handleSelectRequest(req)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-medical-subtle border-emerald-300 shadow-2xs'
                        : 'bg-slate-50/50 border-medical-border hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="font-mono text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200 font-bold">
                        {req.requestCode}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        req.status === 'In Progress'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-slate-50 text-slate-600 border border-slate-200'
                      }`}>
                        {req.status === 'In Progress' ? 'Brouillon' : 'À prélever'}
                      </span>
                    </div>
                    <h4 className="font-bold text-xs text-slate-800 truncate">{req.testName}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Patient : {req.patientName}</p>
                  </div>
                )
              })}
              {sidebarPendingRequests.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-6">Aucune saisie en attente</p>
              )}
            </div>
          </div>

          {/* RIGHT SIDE: Dynamic Grid Form */}
          <div className="bg-white border border-medical-border rounded-2xl p-5 space-y-5 shadow-2xs lg:col-span-2">
            {selectedRequest ? (
              <ResultsEntryForm
                request={selectedRequest}
                onSaveDraft={handleSaveDraft}
                onValidate={handleValidateAndTransmit}
                onBack={() => setActiveView('kanban')}
                getUrgencyLevel={getUrgencyLevel}
              />
            ) : (
              <div className="py-20 text-center text-slate-400 space-y-3">
                <FileText className="w-12 h-12 mx-auto stroke-1" />
                <h4 className="font-bold text-slate-700 text-sm">Aucun échantillon sélectionné</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Sélectionnez une demande dans la barre latérale gauche ou scannez un code d'analyse pour ouvrir sa grille de saisie biologique.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PRINT DIALOG / REPORT MODAL */}
      {viewingReportRequest && (
        <PrintReportModal
          request={viewingReportRequest}
          onClose={() => setViewingReportRequest(null)}
          currentUser={currentUser}
        />
      )}
    </div>
  )
}
