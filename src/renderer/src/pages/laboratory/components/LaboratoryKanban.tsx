import React from 'react'
import {
  Clock,
  FlaskConical,
  CheckCircle,
  ArrowRight,
  Printer,
  Calendar,
  User,
  Activity,
  Check,
  FileCheck
} from 'lucide-react'
import { LabRequest } from '../../store/hospitalStore'

interface LaboratoryKanbanProps {
  todoList: LabRequest[]
  inProgressList: LabRequest[]
  pendingValList: LabRequest[]
  completedList: LabRequest[]
  onSelectRequest: (req: LabRequest) => void
  onStartAnalysis: (id: string) => void
  onPrintReport: (req: LabRequest) => void
  getUrgencyLevel: (req: LabRequest) => { label: string; bg: string; text: string; glow?: string }
}

export const LaboratoryKanban: React.FC<LaboratoryKanbanProps> = ({
  todoList,
  inProgressList,
  pendingValList,
  completedList,
  onSelectRequest,
  onStartAnalysis,
  onPrintReport,
  getUrgencyLevel
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-5 items-start print:hidden">
      {/* COLUMN 1: A Prélever (To Do) */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex flex-col gap-3 min-h-[450px]">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
          <span className="font-bold text-slate-700 text-xs flex items-center gap-1.5 uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-slate-400" /> A Prélever ({todoList.length})
          </span>
        </div>
        <div className="space-y-3 overflow-y-auto max-h-[600px] pr-1">
          {todoList.map((req) => {
            const urgency = getUrgencyLevel(req)
            return (
              <div
                key={req.id}
                className={`bg-white border border-medical-border hover:border-slate-300 p-3.5 rounded-xl space-y-3 transition-all hover:-translate-y-0.5 shadow-2xs ${urgency.glow || ''}`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-mono text-[9px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/60 font-bold">
                    {req.requestCode}
                  </span>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${urgency.bg}`}>
                    {urgency.label}
                  </span>
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-800 text-xs line-clamp-1">{req.testName}</h4>
                  <p className="text-xs text-slate-600 font-semibold flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-400" /> {req.patientName}
                  </p>
                </div>
                <div className="text-[10px] text-slate-400 space-y-0.5 pt-1 border-t border-dashed border-slate-100">
                  <p className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {req.dateRequested}</p>
                  <p>Dr: {req.requestedBy}</p>
                </div>
                <button
                  onClick={() => onStartAnalysis(req.id)}
                  className="w-full bg-slate-800 hover:bg-slate-900 text-white text-[10px] font-bold py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer"
                >
                  Prélever & Analyser <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            )
          })}
          {todoList.length === 0 && (
            <div className="text-center py-10 text-slate-400 space-y-1">
              <Clock className="w-6 h-6 mx-auto stroke-1" />
              <p className="text-[11px] font-semibold">Aucun prélèvement en attente</p>
            </div>
          )}
        </div>
      </div>

      {/* COLUMN 2: En cours d'analyse */}
      <div className="bg-amber-50/30 border border-amber-200/60 rounded-2xl p-4 flex flex-col gap-3 min-h-[450px]">
        <div className="flex items-center justify-between border-b border-amber-200/60 pb-2.5">
          <span className="font-bold text-amber-700 text-xs flex items-center gap-1.5 uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" /> En Analyse ({inProgressList.length})
          </span>
        </div>
        <div className="space-y-3 overflow-y-auto max-h-[600px] pr-1">
          {inProgressList.map((req) => {
            const urgency = getUrgencyLevel(req)
            return (
              <div
                key={req.id}
                className="bg-white border border-amber-200/70 p-3.5 rounded-xl space-y-3 shadow-2xs hover:-translate-y-0.5 transition-all"
              >
                <div className="flex justify-between items-center">
                  <span className="font-mono text-[9px] text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/50 font-bold">
                    {req.requestCode}
                  </span>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${urgency.bg}`}>
                    {urgency.label}
                  </span>
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-800 text-xs line-clamp-1">{req.testName}</h4>
                  <p className="text-xs text-slate-600 font-semibold flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-400" /> {req.patientName}
                  </p>
                </div>
                <div className="text-[10px] text-slate-400 space-y-0.5 pt-1 border-t border-dashed border-slate-100">
                  <p className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {req.dateRequested}</p>
                </div>
                <button
                  onClick={() => onSelectRequest(req)}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-bold py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer shadow-3xs"
                >
                  Saisir Résultats <FileCheck className="w-3.5 h-3.5" />
                </button>
              </div>
            )
          })}
          {inProgressList.length === 0 && (
            <div className="text-center py-10 text-amber-600/60 space-y-1">
              <FlaskConical className="w-6 h-6 mx-auto stroke-1" />
              <p className="text-[11px] font-semibold">Aucune analyse active</p>
            </div>
          )}
        </div>
      </div>

      {/* COLUMN 3: Validation Biologiste */}
      <div className="bg-blue-50/30 border border-blue-200/50 rounded-2xl p-4 flex flex-col gap-3 min-h-[450px]">
        <div className="flex items-center justify-between border-b border-blue-200 pb-2.5">
          <span className="font-bold text-blue-700 text-xs flex items-center gap-1.5 uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-blue-500" /> A Valider ({pendingValList.length})
          </span>
        </div>
        <div className="space-y-3 overflow-y-auto max-h-[600px] pr-1">
          {pendingValList.map((req) => {
            const urgency = getUrgencyLevel(req)
            return (
              <div
                key={req.id}
                className="bg-white border border-blue-100 p-3.5 rounded-xl space-y-3 shadow-2xs hover:-translate-y-0.5 transition-all"
              >
                <div className="flex justify-between items-center">
                  <span className="font-mono text-[9px] text-blue-800 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200/50 font-bold">
                    {req.requestCode}
                  </span>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${urgency.bg}`}>
                    {urgency.label}
                  </span>
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-800 text-xs line-clamp-1">{req.testName}</h4>
                  <p className="text-xs text-slate-600 font-semibold flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-400" /> {req.patientName}
                  </p>
                </div>
                <div className="text-[10px] text-slate-400 space-y-0.5 pt-1 border-t border-dashed border-slate-100">
                  <p className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {req.dateRequested}</p>
                </div>
                <button
                  onClick={() => onSelectRequest(req)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer shadow-3xs"
                >
                  Vérifier & Valider <Check className="w-3.5 h-3.5" />
                </button>
              </div>
            )
          })}
          {pendingValList.length === 0 && (
            <div className="text-center py-10 text-blue-600/60 space-y-1">
              <Activity className="w-6 h-6 mx-auto stroke-1" />
              <p className="text-[11px] font-semibold">Aucun bilan à valider</p>
            </div>
          )}
        </div>
      </div>

      {/* COLUMN 4: Terminés & Validés */}
      <div className="bg-emerald-50/20 border border-emerald-200/50 rounded-2xl p-4 flex flex-col gap-3 min-h-[450px]">
        <div className="flex items-center justify-between border-b border-emerald-200/60 pb-2.5">
          <span className="font-bold text-emerald-800 text-xs flex items-center gap-1.5 uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-medical-primary" /> Validés ({completedList.length})
          </span>
        </div>
        <div className="space-y-3 overflow-y-auto max-h-[600px] pr-1">
          {completedList.map((req) => (
            <div
              key={req.id}
              className="bg-white border border-emerald-100 hover:border-emerald-200 p-3.5 rounded-xl space-y-3 shadow-3xs opacity-90 transition-all"
            >
              <div className="flex justify-between items-center">
                <span className="font-mono text-[9px] text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/50 font-bold">
                  {req.requestCode}
                </span>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full font-bold text-[9px] flex items-center gap-0.5">
                  <Check className="w-2.5 h-2.5" /> Fini
                </span>
              </div>
              <div className="space-y-0.5">
                <h4 className="font-bold text-slate-800 text-xs line-clamp-1">{req.testName}</h4>
                <p className="text-[11px] text-slate-600 font-medium">Patient: {req.patientName}</p>
                <p className="text-[9px] text-emerald-700 font-bold">Validé par : {req.validatedBy || 'Biologiste'}</p>
              </div>
              <button
                onClick={() => onPrintReport(req)}
                className="w-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-[10px] font-bold py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer shadow-3xs"
              >
                Imprimer / PDF <Printer className="w-3.5 h-3.5 text-medical-primary" />
              </button>
            </div>
          ))}
          {completedList.length === 0 && (
            <div className="text-center py-10 text-slate-400 space-y-1">
              <CheckCircle className="w-6 h-6 mx-auto stroke-1" />
              <p className="text-[11px] font-semibold">Aucun rapport complété</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
