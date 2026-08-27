import React, { useState } from 'react'
import {
  CreditCard,
  Printer,
  CheckCircle2,
  DollarSign,
  Lock,
  Wallet,
  Receipt,
  Building2
} from 'lucide-react'
import { useHospitalStore, Invoice } from '../store/hospitalStore'

export const BillingPage: React.FC = () => {
  const { invoices, dailyClosure, payInvoice, closeDailyRegister } = useHospitalStore()

  const [activeTab, setActiveTab] = useState<'pos' | 'invoices' | 'closure'>('pos')
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice>(invoices[0] || invoices[1])
  const [paymentMethod, setPaymentMethod] = useState<'Espèces' | 'Carte Bancaire' | 'Mobile Money'>('Espèces')

  const unpaidInvoices = invoices.filter((i) => i.status === 'Unpaid')
  const paidInvoices = invoices.filter((i) => i.status === 'Paid')

  const handleProcessPayment = () => {
    if (!selectedInvoice) return
    payInvoice(selectedInvoice.id, paymentMethod)
    alert(`Paiement de ${selectedInvoice.patientShare} F CFA reçu par ${paymentMethod}. Facture clôturée!`)
  }

  const handlePrintReceipt = () => {
    window.print()
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <CreditCard className="w-7 h-7 text-teal-400" />
            Espace Caisse & Facturation Securisée
          </h2>
          <p className="text-sm text-slate-400">
            Encaissement des actes, prise en charge mutuelle/assurance et clôture de caisse quotidienne
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('pos')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${activeTab === 'pos' ? 'bg-teal-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            Point d'Encaissement ({unpaidInvoices.length})
          </button>
          <button
            onClick={() => setActiveTab('invoices')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${activeTab === 'invoices' ? 'bg-teal-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            Historique Reçus ({paidInvoices.length})
          </button>
          <button
            onClick={() => setActiveTab('closure')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${activeTab === 'closure' ? 'bg-teal-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
          >
            <Lock className="w-3.5 h-3.5" />
            Clôture de Caisse
          </button>
        </div>
      </div>

      {/* Tab 1: Point d'Encaissement (POS) */}
      {activeTab === 'pos' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Unpaid invoices list */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <h3 className="font-semibold text-slate-100 text-sm border-b border-slate-800 pb-2">
              Actes Non Payés en Attente ({unpaidInvoices.length})
            </h3>

            <div className="space-y-2">
              {unpaidInvoices.map((inv) => (
                <div
                  key={inv.id}
                  onClick={() => setSelectedInvoice(inv)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${selectedInvoice?.id === inv.id
                      ? 'bg-teal-500/10 border-teal-500/50 shadow-md'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-100 text-xs">{inv.patientName}</span>
                    <span className="font-mono text-[10px] text-teal-400 bg-teal-500/10 px-1.5 py-0.5 rounded border border-teal-500/20">
                      {inv.invoiceCode}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-slate-400 mt-2">
                    <span>{inv.items.length} acte(s)</span>
                    <span className="font-bold text-slate-200 font-mono text-xs">{inv.patientShare} F CFA</span>
                  </div>
                </div>
              ))}
              {unpaidInvoices.length === 0 && <p className="text-xs text-slate-500 py-6 text-center">Aucune facture en attente</p>}
            </div>
          </div>

          {/* Right 2 cols: Invoice Printable Generator & Payment Action */}
          <div className="lg:col-span-2 space-y-6">
            {selectedInvoice ? (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
                {/* Printable Invoice Header */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 space-y-6 printable-area">
                  <div className="flex justify-between items-start border-b border-slate-800 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-teal-400" />
                        <h3 className="font-bold text-slate-100 text-base">CENTRE HOSPITALIER WILLO</h3>
                      </div>
                      <p className="text-xs text-slate-400">Reçu & Facture d'Acquittement Médical</p>
                      <p className="text-[11px] text-slate-500">Dakar, Sénégal • Tel: +221 33 800 00 00</p>
                    </div>

                    <div className="text-right">
                      <span className="font-mono text-xs text-teal-400 font-bold bg-teal-500/10 px-2 py-1 rounded border border-teal-500/30">
                        {selectedInvoice.invoiceCode}
                      </span>
                      <p className="text-xs text-slate-400 mt-1">Date: {selectedInvoice.date}</p>
                    </div>
                  </div>

                  {/* Patient & Insurance info */}
                  <div className="grid grid-cols-2 gap-4 text-xs bg-slate-900 p-3 rounded-lg border border-slate-800">
                    <div>
                      <span className="text-slate-400 block">Nom du Patient:</span>
                      <span className="font-bold text-slate-100">{selectedInvoice.patientName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Prise en Charge Mutuelle:</span>
                      <span className="font-bold text-teal-300">{selectedInvoice.insuranceName}</span>
                    </div>
                  </div>

                  {/* Items Table */}
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-slate-800 text-slate-400 font-mono">
                      <tr>
                        <th className="py-2">Description des Actes</th>
                        <th className="py-2">Catégorie</th>
                        <th className="py-2 text-right">Montant (F CFA)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono">
                      {selectedInvoice.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="py-2 font-semibold text-slate-200">{item.description}</td>
                          <td className="py-2 text-slate-400">{item.category}</td>
                          <td className="py-2 text-right font-bold text-slate-100">{item.amount} F CFA</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Financial Breakdown */}
                  <div className="border-t border-slate-800 pt-3 space-y-1.5 text-xs text-right font-mono">
                    <div className="flex justify-between text-slate-400">
                      <span>Sous-total Actes Brut:</span>
                      <span>{selectedInvoice.subtotal} F CFA</span>
                    </div>
                    <div className="flex justify-between text-teal-400">
                      <span>Couverture Mutuelle / Assurance ({selectedInvoice.insuranceCoveragePercent}%):</span>
                      <span>- {selectedInvoice.insuranceAmount} F CFA</span>
                    </div>
                    <div className="flex justify-between font-bold text-slate-100 text-sm pt-2 border-t border-slate-800">
                      <span>RESTE À PAYER PATIENT:</span>
                      <span className="text-teal-400">{selectedInvoice.patientShare} F CFA</span>
                    </div>
                  </div>
                </div>

                {/* Payment Action Box */}
                {selectedInvoice.status === 'Unpaid' ? (
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-4">
                    <h4 className="text-xs font-semibold text-slate-200">Sélectionner le Mode de Règlement</h4>

                    <div className="grid grid-cols-3 gap-3">
                      {(['Espèces', 'Carte Bancaire', 'Mobile Money'] as const).map((m) => (
                        <button
                          key={m}
                          onClick={() => setPaymentMethod(m)}
                          className={`p-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1.5 ${paymentMethod === m
                              ? 'bg-teal-600 text-white border-teal-500 shadow-md'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                            }`}
                        >
                          <Wallet className="w-4 h-4" />
                          {m}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={handleProcessPayment}
                      className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-teal-600/20 flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Enregistrer le Paiement & Imprimer Reçu
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl text-emerald-400 text-xs font-bold">
                    <span>Facture déjà réglée par {selectedInvoice.paymentMethod} à {selectedInvoice.paidAt}</span>
                    <button
                      onClick={handlePrintReceipt}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg flex items-center gap-1"
                    >
                      <Printer className="w-3.5 h-3.5" /> Imprimer Ticket
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-12 text-center text-slate-500">Sélectionnez une facture dans la liste de gauche</div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Paid Invoices History */}
      {activeTab === 'invoices' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="font-semibold text-slate-100 text-base">Historique des Reçus Payés</h3>

          <div className="overflow-x-auto rounded-lg border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 font-mono">
                <tr>
                  <th className="p-3">N° Facture</th>
                  <th className="p-3">Patient</th>
                  <th className="p-3">Total Brut</th>
                  <th className="p-3">Part Mutuelle</th>
                  <th className="p-3">Payé par Patient</th>
                  <th className="p-3">Mode de Règlement</th>
                  <th className="p-3">Heure Paiement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-mono">
                {paidInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-800/40">
                    <td className="p-3 text-teal-400 font-bold">{inv.invoiceCode}</td>
                    <td className="p-3 font-semibold text-slate-200">{inv.patientName}</td>
                    <td className="p-3 text-slate-400">{inv.subtotal} F CFA</td>
                    <td className="p-3 text-teal-300">{inv.insuranceAmount} F CFA</td>
                    <td className="p-3 font-bold text-slate-100">{inv.patientShare} F CFA</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-teal-300 text-[10px]">
                        {inv.paymentMethod}
                      </span>
                    </td>
                    <td className="p-3 text-slate-400">{inv.paidAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Daily Cash Register Closure */}
      {activeTab === 'closure' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="font-semibold text-slate-100 text-base flex items-center gap-2">
                <Lock className="w-5 h-5 text-teal-400" />
                Clôture de Caisse Quotidienne & Réconciliation
              </h3>
              <p className="text-xs text-slate-400">Synthèse journalière des encaissements par mode de paiement</p>
            </div>

            <button
              onClick={closeDailyRegister}
              disabled={dailyClosure.status === 'Closed'}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 ${dailyClosure.status === 'Open'
                  ? 'bg-rose-600 hover:bg-rose-500 text-white'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
            >
              <Lock className="w-4 h-4" />
              {dailyClosure.status === 'Open' ? 'Verrouiller & Clôturer la Caisse' : 'Caisse Clôturée'}
            </button>
          </div>

          {/* Totals Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-1">
              <span className="text-xs text-slate-400">Total Espèces</span>
              <p className="text-xl font-bold text-emerald-400 font-mono">{dailyClosure.cashTotal} F CFA</p>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-1">
              <span className="text-xs text-slate-400">Total Carte Bancaire</span>
              <p className="text-xl font-bold text-sky-400 font-mono">{dailyClosure.cardTotal} F CFA</p>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-1">
              <span className="text-xs text-slate-400">Total Mobile Money</span>
              <p className="text-xl font-bold text-purple-400 font-mono">{dailyClosure.mobileTotal} F CFA</p>
            </div>

            <div className="bg-slate-950 border border-teal-500/30 p-4 rounded-xl space-y-1">
              <span className="text-xs text-slate-400">Recette Totale du Jour</span>
              <p className="text-xl font-bold text-teal-400 font-mono">{dailyClosure.grandTotal} F CFA</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
