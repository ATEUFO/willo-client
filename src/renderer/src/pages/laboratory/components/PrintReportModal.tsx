import React from 'react'
import { Printer, X } from 'lucide-react'
import { LabRequest } from '../../store/hospitalStore'

interface PrintReportModalProps {
  request: LabRequest
  onClose: () => void
  currentUser: any
}

export const PrintReportModal: React.FC<PrintReportModalProps> = ({
  request,
  onClose,
  currentUser
}) => {
  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-start justify-center p-4 overflow-y-auto z-50 animate-fade-in print:absolute print:inset-0 print:bg-white print:p-0">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col relative overflow-hidden my-4 print:my-0 print:shadow-none print:w-full">
        {/* Controls Bar (Hidden during print) */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50 shrink-0 print:hidden">
          <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2">
            <Printer className="w-4 h-4 text-medical-primary" />
            Impression Compte-Rendu Clinique
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3.5 py-1.5 bg-medical-primary hover:bg-medical-hover text-white text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer shadow-3xs"
            >
              <Printer className="w-3.5 h-3.5" />
              Lancer l'Impression / PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-500 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div className="p-8 text-left bg-white text-slate-800 font-sans space-y-6 print:p-0">
          {/* CHU Letterhead */}
          <div className="flex justify-between items-start border-b-2 border-slate-800 pb-5">
            <div>
              <h1 className="text-base font-extrabold text-slate-900 tracking-wider">
                CENTRE HOSPITALIER UNIVERSITAIRE WILLO
              </h1>
              <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                Département de Biologie Médicale & Analyses Cliniques
              </p>
              <p className="text-[9px] text-slate-400 mt-1">
                Contact: +243 81 999 88 77 • info@chu-willo.cd
              </p>
            </div>
            <div className="text-right">
              <span className="font-mono text-xs bg-slate-100 border border-slate-200 px-2 py-1 rounded font-extrabold text-slate-800">
                N° Réf: {request.requestCode}
              </span>
              <p className="text-[9px] text-slate-400 mt-1.5">
                Poste ID: {currentUser?.department || 'LAB-01'}
              </p>
            </div>
          </div>

          {/* Title */}
          <div className="text-center">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest border-y border-dashed border-slate-300 py-1.5">
              COMPTE-RENDU D'ANALYSES BIOLOGIQUES
            </h2>
          </div>

          {/* Identity blocks */}
          <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 border border-slate-200/80 p-4 rounded-xl">
            <div className="space-y-1">
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Patient</p>
              <p className="font-black text-slate-900 text-sm">{request.patientName}</p>
              <p className="text-slate-600 font-medium">ID Patient : {request.patientId}</p>
            </div>
            <div className="space-y-1 text-right">
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Prescription</p>
              <p className="font-bold text-slate-800">{request.testName}</p>
              <p className="text-slate-600 font-medium">Prescrit par: Dr. {request.requestedBy}</p>
              <p className="text-[10px] text-slate-400 font-mono">Date : {request.dateRequested}</p>
            </div>
          </div>

          {/* Results Table */}
          <div className="space-y-1">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Paramètres Analysés ({request.results?.filter(r => r.param !== 'Observations Cliniques').length})
            </h3>
            <div className="rounded-xl border border-slate-300 overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300">
                  <tr>
                    <th className="p-3">Examen / Paramètre</th>
                    <th className="p-3">Valeur</th>
                    <th className="p-3">Unités</th>
                    <th className="p-3">Valeurs de Référence</th>
                    <th className="p-3 text-right">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-800">
                  {request.results
                    ?.filter((r) => r.param !== 'Observations Cliniques')
                    .map((item, idx) => (
                      <tr key={idx} className={item.isAbnormal ? 'bg-red-50 font-bold' : ''}>
                        <td className="p-3 font-semibold">{item.param}</td>
                        <td className={`p-3 font-mono ${item.isAbnormal ? 'text-red-700 font-black' : ''}`}>
                          {item.value || '-'}
                        </td>
                        <td className="p-3 text-slate-500 font-mono">{item.unit}</td>
                        <td className="p-3 text-slate-600 font-mono">{item.refRange}</td>
                        <td className="p-3 text-right">
                          {item.isAbnormal ? (
                            <span className="text-red-700 font-bold uppercase text-[9px]">* ANORMAL</span>
                          ) : (
                            <span className="text-slate-500 font-medium text-[9px]">CONFORME</span>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Clinical Observations Notes */}
          {(() => {
            const notes = request.results?.find((r) => r.param === 'Observations Cliniques')?.value || ''
            if (!notes) return null
            return (
              <div className="bg-slate-50 border border-slate-300 p-4 rounded-xl text-xs space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Observations Cliniques du Laborantin
                </span>
                <p className="text-slate-700 italic font-medium">
                  "{notes}"
                </p>
              </div>
            )
          })()}

          {/* Signature block */}
          <div className="grid grid-cols-2 pt-6 border-t border-slate-200">
            <div className="text-xs text-slate-400 italic">
              Document généré de façon sécurisée par le système d'information de Willo Hospital.
            </div>
            <div className="text-right space-y-2">
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                Signature du Biologiste
              </p>
              <div className="inline-block border border-slate-300 bg-slate-50 p-3 rounded-lg text-center min-w-[180px] shadow-3xs">
                <p className="font-extrabold text-slate-900 text-xs">
                  {request.validatedBy || 'Dr. Jean Biologiste'}
                </p>
                <p className="text-[9px] text-slate-500">Biologiste Clinicien</p>
                <div className="border-t border-dashed border-slate-300 my-1"></div>
                <span className="text-[8px] text-slate-400 font-mono block">
                  Validé le: {request.dateRequested}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
