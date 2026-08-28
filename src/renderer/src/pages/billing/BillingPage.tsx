import React, { useState, useEffect } from 'react'
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
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(invoices[0] || null)
  const [paymentMethod, setPaymentMethod] = useState<'Espèces' | 'Carte Bancaire' | 'Mobile Money'>('Espèces')

  useEffect(() => {
    if (!selectedInvoice && invoices.length > 0) {
      setSelectedInvoice(invoices[0])
    }
  }, [invoices, selectedInvoice])

  const activeInvoice = selectedInvoice || invoices[0] || null

  const unpaidInvoices = invoices.filter((i) => i.status === 'Unpaid')
  const paidInvoices = invoices.filter((i) => i.status === 'Paid')

  const handleProcessPayment = () => {
    if (!activeInvoice) return
    payInvoice(activeInvoice.id, paymentMethod)
    alert(`Paiement de ${activeInvoice.patientShare} F CFA reçu par ${paymentMethod}. Facture clôturée!`)
  }

  const handlePrintReceipt = () => {
    window.print()
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-medical-border pb-4">
        <div>
          <h2 className="text-2xl font-bold text-medical-dark flex items-center gap-2">
            <CreditCard className="w-7 h-7 text-medical-primary" />
            Espace Caisse & Facturation Sécurisée
          </h2>
          <p className="text-sm text-slate-500">
            Encaissement des actes, prise en charge mutuelle/assurance et clôture de caisse quotidienne
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-medical-border shadow-sm">
          <button
            onClick={() => setActiveTab('pos')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${activeTab === 'pos' ? 'bg-medical-primary text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 bg-white'
              }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            Point d'Encaissement ({unpaidInvoices.length})
          </button>
          <button
            onClick={() => setActiveTab('invoices')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${activeTab === 'invoices' ? 'bg-medical-primary text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 bg-white'
              }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            Historique Reçus ({paidInvoices.length})
          </button>
          <button
            onClick={() => setActiveTab('closure')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${activeTab === 'closure' ? 'bg-medical-primary text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 bg-white'
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
          <div className="bg-medical-cardBg border border-medical-border rounded-xl p-4 space-y-3 shadow-sm">
            <h3 className="font-bold text-medical-dark text-sm border-b border-medical-border pb-2">
              Actes Non Payés en Attente ({unpaidInvoices.length})
            </h3>

            <div className="space-y-2">
              {unpaidInvoices.map((inv) => (
                <div
                  key={inv.id}
                  onClick={() => setSelectedInvoice(inv)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${selectedInvoice?.id === inv.id
                      ? 'bg-medical-subtle border-emerald-300 shadow-xs'
                      : 'bg-white border-medical-border hover:border-slate-300'
                    }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900 text-xs">{inv.patientName}</span>
                    <span className="font-mono text-[10px] text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-200 font-semibold">
                      {inv.invoiceCode}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-slate-500 mt-2">
                    <span>{inv.items.length} acte(s)</span>
                    <span className="font-bold text-slate-900 font-mono text-xs">{inv.patientShare} F CFA</span>
                  </div>
                </div>
              ))}
              {unpaidInvoices.length === 0 && <p className="text-xs text-slate-400 py-6 text-center">Aucune facture en attente</p>}
            </div>
          </div>

          {/* Right 2 cols: Invoice Printable Generator & Payment Action */}
          <div className="lg:col-span-2 space-y-6">
            {selectedInvoice ? (
              <div className="bg-medical-cardBg border border-medical-border rounded-xl p-6 space-y-6 shadow-sm">
                {/* Printable Invoice Header */}
                <div className="bg-white border border-medical-border rounded-xl p-6 space-y-6 printable-area shadow-xs">
                  <div className="flex justify-between items-start border-b border-medical-border pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-medical-primary" />
                        <h3 className="font-bold text-medical-dark text-base">CENTRE HOSPITALIER WILLO</h3>
                      </div>
                      <p className="text-xs text-slate-500">Reçu & Facture d'Acquittement Médical</p>
                      <p className="text-[11px] text-slate-400">Dakar, Sénégal • Tel: +221 33 800 00 00</p>
                    </div>

                    <div className="text-right">
                      <span className="font-mono text-xs text-emerald-800 font-bold bg-medical-subtle px-2 py-1 rounded border border-emerald-200">
                        {selectedInvoice.invoiceCode}
                      </span>
                      <p className="text-xs text-slate-500 mt-1">Date: {selectedInvoice.date}</p>
                    </div>
                  </div>

                  {/* Patient & Insurance info */}
                  <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-3.5 rounded-xl border border-medical-border">
                    <div>
                      <span className="text-slate-500 block">Nom du Patient :</span>
                      <span className="font-bold text-slate-900">{selectedInvoice.patientName}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Prise en Charge Mutuelle :</span>
                      <span className="font-bold text-emerald-800">{selectedInvoice.insuranceName}</span>
                    </div>
                  </div>

                  {/* Items Table */}
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-medical-border text-slate-600 font-mono bg-slate-50">
                      <tr>
                        <th className="p-2.5">Description des Actes</th>
                        <th className="p-2.5">Catégorie</th>
                        <th className="p-2.5 text-right">Montant (F CFA)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-medical-border font-mono text-slate-700">
                      {selectedInvoice.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="p-2.5 font-bold text-slate-900">{item.description}</td>
                          <td className="p-2.5 text-slate-500">{item.category}</td>
                          <td className="p-2.5 text-right font-bold text-slate-900">{item.amount} F CFA</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Financial Breakdown */}
                  <div className="border-t border-medical-border pt-3 space-y-1.5 text-xs text-right font-mono">
                    <div className="flex justify-between text-slate-500">
                      <span>Sous-total Actes Brut :</span>
                      <span>{selectedInvoice.subtotal} F CFA</span>
                    </div>
                    <div className="flex justify-between text-emerald-800">
                      <span>Couverture Mutuelle / Assurance ({selectedInvoice.insuranceCoveragePercent}%) :</span>
                      <span>- {selectedInvoice.insuranceAmount} F CFA</span>
                    </div>
                    <div className="flex justify-between font-bold text-slate-900 text-sm pt-2 border-t border-medical-border">
                      <span>RESTE À PAYER PATIENT :</span>
                      <span className="text-medical-primary">{selectedInvoice.patientShare} F CFA</span>
                    </div>
                  </div>
                </div>

                {/* Payment Action Box */}
                {selectedInvoice.status === 'Unpaid' ? (
                  <div className="bg-slate-50 border border-medical-border rounded-xl p-4 space-y-4">
                    <h4 className="text-xs font-bold text-slate-700">Sélectionner le Mode de Règlement</h4>

                    <div className="grid grid-cols-3 gap-3">
                      {(['Espèces', 'Carte Bancaire', 'Mobile Money'] as const).map((m) => (
                        <button
                          key={m}
                          onClick={() => setPaymentMethod(m)}
                          className={`p-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1.5 ${paymentMethod === m
                              ? 'bg-medical-primary text-white border-emerald-500 shadow-sm'
                              : 'bg-white border-medical-border text-slate-600 hover:text-slate-900'
                            }`}
                        >
                          <Wallet className="w-4 h-4" />
                          {m}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={handleProcessPayment}
                      className="w-full bg-medical-primary hover:bg-medical-hover text-white font-semibold py-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Enregistrer le Paiement & Imprimer Reçu
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-medical-subtle border border-emerald-200 p-4 rounded-xl text-emerald-900 text-xs font-bold">
                    <span>Facture déjà réglée par {selectedInvoice.paymentMethod} à {selectedInvoice.paidAt}</span>
                    <button
                      onClick={handlePrintReceipt}
                      className="px-3.5 py-1.5 bg-medical-primary hover:bg-medical-hover text-white rounded-lg flex items-center gap-1 font-semibold transition-colors"
                    >
                      <Printer className="w-3.5 h-3.5" /> Imprimer Ticket
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-12 text-center text-slate-400">Sélectionnez une facture dans la liste de gauche</div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Paid Invoices History */}
      {activeTab === 'invoices' && (
        <div className="bg-medical-cardBg border border-medical-border rounded-xl p-5 space-y-4 shadow-sm">
          <h3 className="font-bold text-medical-dark text-base">Historique des Reçus Payés</h3>

          <div className="overflow-x-auto rounded-xl border border-medical-border">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-mono border-b border-medical-border">
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
              <tbody className="divide-y divide-medical-border text-slate-700 font-mono">
                {paidInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 text-medical-dark font-bold">{inv.invoiceCode}</td>
                    <td className="p-3 font-semibold text-slate-900 font-sans">{inv.patientName}</td>
                    <td className="p-3 text-slate-500">{inv.subtotal} F CFA</td>
                    <td className="p-3 text-emerald-800 font-semibold">{inv.insuranceAmount} F CFA</td>
                    <td className="p-3 font-bold text-slate-900">{inv.patientShare} F CFA</td>
                    <td className="p-3">
                      <span className="px-2.5 py-0.5 rounded-full bg-medical-subtle text-emerald-800 border border-emerald-200 text-[10px] font-semibold">
                        {inv.paymentMethod}
                      </span>
                    </td>
                    <td className="p-3 text-slate-500">{inv.paidAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Daily Cash Register Closure */}
      {activeTab === 'closure' && (
        <div className="bg-medical-cardBg border border-medical-border rounded-xl p-6 space-y-6 shadow-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-medical-border pb-4">
            <div>
              <h3 className="font-bold text-medical-dark text-base flex items-center gap-2">
                <Lock className="w-5 h-5 text-medical-primary" />
                Clôture de Caisse Quotidienne & Réconciliation
              </h3>
              <p className="text-xs text-slate-500">Synthèse journalière des encaissements par mode de paiement</p>
            </div>

            <button
              onClick={closeDailyRegister}
              disabled={dailyClosure.status === 'Closed'}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shadow-sm flex items-center gap-2 ${dailyClosure.status === 'Open'
                  ? 'bg-medical-danger hover:bg-red-600 text-white'
                  : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                }`}
            >
              <Lock className="w-4 h-4" />
              {dailyClosure.status === 'Open' ? 'Verrouiller & Clôturer la Caisse' : 'Caisse Clôturée'}
            </button>
          </div>

          {/* Totals Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-50 border border-medical-border p-4 rounded-xl space-y-1">
              <span className="text-xs text-slate-500 font-medium">Total Espèces</span>
              <p className="text-xl font-bold text-emerald-700 font-mono">{dailyClosure.cashTotal} F CFA</p>
            </div>

            <div className="bg-slate-50 border border-medical-border p-4 rounded-xl space-y-1">
              <span className="text-xs text-slate-500 font-medium">Total Carte Bancaire</span>
              <p className="text-xl font-bold text-blue-700 font-mono">{dailyClosure.cardTotal} F CFA</p>
            </div>

            <div className="bg-slate-50 border border-medical-border p-4 rounded-xl space-y-1">
              <span className="text-xs text-slate-500 font-medium">Total Mobile Money</span>
              <p className="text-xl font-bold text-purple-700 font-mono">{dailyClosure.mobileTotal} F CFA</p>
            </div>

            <div className="bg-medical-subtle border border-emerald-200 p-4 rounded-xl space-y-1">
              <span className="text-xs text-emerald-800 font-semibold">Recette Totale du Jour</span>
              <p className="text-xl font-bold text-medical-primary font-mono">{dailyClosure.grandTotal} F CFA</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
