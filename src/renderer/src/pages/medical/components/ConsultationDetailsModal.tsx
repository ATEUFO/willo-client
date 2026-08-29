import {
  FileText,
  X
} from 'lucide-react'
import { ConsultationRecord } from '../../store/hospitalStore'

interface ConsultationDetailsModalProps {
  consultation: ConsultationRecord
  onClose: () => void
}

export const ConsultationDetailsModal: React.FC<ConsultationDetailsModalProps> = ({
  consultation,
  onClose
}) => {
  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white border border-slate-800/20 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col relative overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-medical-border bg-slate-50 shrink-0">
          <div className="text-left">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <FileText className="w-5 h-5 text-medical-primary" />
              Dossier de Consultation Clinique
            </h3>
            <p className="text-[11px] text-slate-500 font-mono">
              Enregistré le : {consultation.date}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-left">
          {/* Metadata Block */}
          <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 border border-medical-border p-3.5 rounded-xl">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Patient</span>
              <strong className="text-slate-800 text-sm font-semibold">{consultation.patientName}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Médecin Consultant</span>
              <strong className="text-slate-800 text-sm font-semibold">{consultation.doctorName}</strong>
            </div>
          </div>

          {/* Chief Complaint Motif */}
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              Motif Principal de Consultation
            </span>
            <p className="text-sm font-bold text-slate-900 pl-1">{consultation.chiefComplaint}</p>
          </div>

          {/* Diagnostics Pills */}
          <div className="space-y-1.5">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              Diagnostics Retenus (CIM-10)
            </span>
            <div className="flex flex-wrap gap-1.5 pl-1">
              {consultation.diagnoses && consultation.diagnoses.length > 0 ? (
                consultation.diagnoses.map((diag, index) => (
                  <span
                    key={index}
                    className="px-2.5 py-1 bg-medical-subtle border border-emerald-200 text-emerald-800 rounded-lg text-[10px] font-bold"
                  >
                    {diag}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-500 italic">Aucun diagnostic codifié.</span>
              )}
            </div>
          </div>

          {/* Clinical Examination Notes */}
          <div className="space-y-1.5">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              Observations Cliniques & Compte-Rendu
            </span>
            <div className="bg-slate-50/50 border border-medical-border rounded-xl p-3 text-xs text-slate-800 font-medium whitespace-pre-wrap leading-relaxed">
              {consultation.clinicalNotes || 'Aucun compte rendu détaillé rédigé.'}
            </div>
          </div>

          {/* Lab Orders Requested */}
          {consultation.labOrders && consultation.labOrders.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                Examens Biologiques Demandés
              </span>
              <div className="flex flex-wrap gap-1.5 pl-1">
                {consultation.labOrders.map((lab, index) => (
                  <span
                    key={index}
                    className="px-2.5 py-1 rounded bg-purple-50 border border-purple-200 text-purple-800 text-[10px] font-bold"
                  >
                    {lab}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Prescriptions Items Details */}
          <div className="space-y-2">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              Traitement & Prescription Rédigée
            </span>
            {consultation.prescriptions && consultation.prescriptions.length > 0 ? (
              <div className="bg-white border border-medical-border rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 text-slate-600 font-mono border-b border-medical-border">
                    <tr>
                      <th className="p-2.5 font-bold">Médicament</th>
                      <th className="p-2.5 font-bold">Dose</th>
                      <th className="p-2.5 font-bold">Fréquence</th>
                      <th className="p-2.5 font-bold">Durée</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-medical-border text-slate-700 font-medium">
                    {consultation.prescriptions.map((p, index) => (
                      <tr key={index}>
                        <td className="p-2.5 font-bold text-slate-900">{p.drugName}</td>
                        <td className="p-2.5">{p.dosage}</td>
                        <td className="p-2.5">{p.frequency}</td>
                        <td className="p-2.5 text-slate-500 font-mono">{p.duration}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic pl-1">Aucune prescription associée.</p>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-medical-border bg-slate-50 text-right shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-medical-primary hover:bg-medical-hover text-white rounded-xl text-xs font-bold shadow-sm transition-colors cursor-pointer"
          >
            Fermer le Dossier
          </button>
        </div>
      </div>
    </div>
  )
}
