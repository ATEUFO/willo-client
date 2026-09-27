import React, { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  CreditCard,
  Printer,
  CheckCircle2,
  DollarSign,
  Lock,
  Wallet,
  Receipt,
  Building2,
  Plus
} from 'lucide-react'
import { useHospitalStore, Invoice } from '../store/hospitalStore'
import { CreateInvoiceModal } from './components/CreateInvoiceModal'

export const BillingPage: React.FC = () => {
  const { t } = useTranslation('billing')
  const { invoices, dailyClosure: storeDailyClosure, payInvoice, closeDailyRegister, patients, addInvoice, showNotification } = useHospitalStore()

  const [activeTab, setActiveTab] = useState<'pos' | 'invoices' | 'closure'>('pos')
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(invoices[0] || null)
  const [paymentMethod, setPaymentMethod] = useState<'Espèces' | 'Carte Bancaire' | 'Mobile Money'>('Espèces')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (!selectedInvoice && invoices.length > 0) {
      setSelectedInvoice(invoices[0])
    } else if (invoices.length === 0) {
      setSelectedInvoice(null)
    }
  }, [invoices, selectedInvoice])

  const activeInvoice = selectedInvoice || invoices[0] || null

  const unpaidInvoices = invoices.filter((i) => i.status === 'Unpaid')
  const paidInvoices = invoices.filter((i) => i.status === 'Paid')

  // Real-time calculation of daily closure totals from database paid invoices
  const dailyClosure = useMemo(() => {
    const today = new Date().toISOString().split('T')[0]
    const paidToday = paidInvoices.filter((i) => i.paidAt && i.paidAt.startsWith(today))
    const targetPaid = paidToday.length > 0 ? paidToday : paidInvoices

    const cashTotal = targetPaid
      .filter((i) => i.paymentMethod === 'Espèces')
      .reduce((sum, i) => sum + (i.patientShare || 0), 0)

    const cardTotal = targetPaid
      .filter((i) => i.paymentMethod === 'Carte Bancaire')
      .reduce((sum, i) => sum + (i.patientShare || 0), 0)

    const mobileTotal = targetPaid
      .filter((i) => i.paymentMethod === 'Mobile Money')
      .reduce((sum, i) => sum + (i.patientShare || 0), 0)

    const grandTotal = cashTotal + cardTotal + mobileTotal

    return {
      date: today,
      cashTotal,
      cardTotal,
      mobileTotal,
      grandTotal,
      status: storeDailyClosure?.status || 'Open'
    }
  }, [paidInvoices, storeDailyClosure])

  const handleProcessPayment = () => {
    if (!activeInvoice) return
    payInvoice(activeInvoice.id, paymentMethod)
    showNotification(`Paiement de ${activeInvoice.patientShare} F CFA reçu par ${paymentMethod}. Facture clôturée!`, {
      title: 'Paiement Enregistré',
      type: 'success'
    })
  }

  const handlePrintReceipt = () => {
    window.print()
  }

  const getPaymentMethodLabel = (m: string) => {
    switch (m) {
      case 'Carte Bancaire':
        return t('paymentMethods.card')
      case 'Mobile Money':
        return t('paymentMethods.mobile')
      case 'Espèces':
      default:
        return t('paymentMethods.cash')
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-medical-border pb-4">
        <div>
          <h2 className="text-2xl font-bold text-medical-dark flex items-center gap-2">
            <CreditCard className="w-7 h-7 text-medical-primary" />
            {t('headerTitle')}
          </h2>
          <p className="text-sm text-slate-500">
            {t('headerSub')}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-medical-border shadow-sm">
          <button
            onClick={() => setActiveTab('pos')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${activeTab === 'pos' ? 'bg-medical-primary text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 bg-white'
              }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            {t('tabs.pos', { count: unpaidInvoices.length })}
          </button>
          <button
            onClick={() => setActiveTab('invoices')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${activeTab === 'invoices' ? 'bg-medical-primary text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 bg-white'
              }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            {t('tabs.history', { count: paidInvoices.length })}
          </button>
          <button
            onClick={() => setActiveTab('closure')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${activeTab === 'closure' ? 'bg-medical-primary text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 bg-white'
              }`}
          >
            <Lock className="w-3.5 h-3.5" />
            {t('tabs.closure')}
          </button>
        </div>
      </div>

      {/* Tab 1: Point d'Encaissement (POS) */}
      {activeTab === 'pos' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Unpaid invoices list */}
          <div className="bg-medical-cardBg border border-medical-border rounded-xl p-4 space-y-3 shadow-sm">
            <div className="flex justify-between items-center border-b border-medical-border pb-2">
              <h3 className="font-bold text-medical-dark text-sm">
                {t('pos.unpaidTitle', { count: unpaidInvoices.length })}
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-medical-primary hover:bg-medical-hover text-white text-[11px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 transition-all cursor-pointer shadow-3xs"
              >
                <Plus className="w-3 h-3" /> {t('pos.newInvoice')}
              </button>
            </div>

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
                    <span>{t('pos.actsCount', { count: inv.items.length })}</span>
                    <span className="font-bold text-slate-900 font-mono text-xs">{inv.patientShare} F CFA</span>
                  </div>
                </div>
              ))}
              {unpaidInvoices.length === 0 && <p className="text-xs text-slate-400 py-6 text-center">{t('pos.noUnpaid')}</p>}
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
                        <h3 className="font-bold text-medical-dark text-base">{t('pos.hospitalName')}</h3>
                      </div>
                      <p className="text-xs text-slate-500">{t('pos.receiptTitle')}</p>
                      <p className="text-[11px] text-slate-400">{t('pos.location')}</p>
                    </div>

                    <div className="text-right">
                      <span className="font-mono text-xs text-emerald-800 font-bold bg-medical-subtle px-2 py-1 rounded border border-emerald-200">
                        {selectedInvoice.invoiceCode}
                      </span>
                      <p className="text-xs text-slate-500 mt-1">{t('pos.date', { date: selectedInvoice.date })}</p>
                    </div>
                  </div>

                  {/* Patient & Insurance info */}
                  <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-3.5 rounded-xl border border-medical-border">
                    <div>
                      <span className="text-slate-500 block">{t('pos.patientName')}</span>
                      <span className="font-bold text-slate-900">{selectedInvoice.patientName}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">{t('pos.insuranceCoverage')}</span>
                      <span className="font-bold text-emerald-800">{selectedInvoice.insuranceName}</span>
                    </div>
                  </div>

                  {/* Items Table */}
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-medical-border text-slate-600 font-mono bg-slate-50">
                      <tr>
                        <th className="p-2.5">{t('pos.table.description')}</th>
                        <th className="p-2.5">{t('pos.table.category')}</th>
                        <th className="p-2.5 text-right">{t('pos.table.amount')}</th>
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
                      <span>{t('pos.subtotalBrut')}</span>
                      <span>{selectedInvoice.subtotal} F CFA</span>
                    </div>
                    <div className="flex justify-between text-emerald-800">
                      <span>{t('pos.insuranceCoverPercent', { percent: selectedInvoice.insuranceCoveragePercent })}</span>
                      <span>- {selectedInvoice.insuranceAmount} F CFA</span>
                    </div>
                    <div className="flex justify-between font-bold text-slate-900 text-sm pt-2 border-t border-medical-border">
                      <span>{t('pos.patientShareRemaining')}</span>
                      <span className="text-medical-primary">{selectedInvoice.patientShare} F CFA</span>
                    </div>
                  </div>
                </div>

                {/* Payment Action Box */}
                {selectedInvoice.status === 'Unpaid' ? (
                  <div className="bg-slate-50 border border-medical-border rounded-xl p-4 space-y-4">
                    <h4 className="text-xs font-bold text-slate-700">{t('pos.paymentModeTitle')}</h4>

                    <div className="grid grid-cols-3 gap-3">
                      {(['Espèces', 'Carte Bancaire', 'Mobile Money'] as const).map((m) => (
                        <button
                          key={m}
                          onClick={() => setPaymentMethod(m)}
                          className={`p-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1.5 cursor-pointer ${paymentMethod === m
                              ? 'bg-medical-primary text-white border-emerald-500 shadow-sm'
                              : 'bg-white border-medical-border text-slate-600 hover:text-slate-900'
                            }`}
                        >
                          <Wallet className="w-4 h-4" />
                          {getPaymentMethodLabel(m)}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={handleProcessPayment}
                      className="w-full bg-medical-primary hover:bg-medical-hover text-white font-semibold py-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" /> {t('pos.payAndPrintBtn')}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-medical-subtle border border-emerald-200 p-4 rounded-xl text-emerald-900 text-xs font-bold">
                    <span>{t('pos.alreadyPaid', { method: getPaymentMethodLabel(selectedInvoice.paymentMethod || 'Espèces'), time: selectedInvoice.paidAt })}</span>
                    <button
                      onClick={handlePrintReceipt}
                      className="px-3.5 py-1.5 bg-medical-primary hover:bg-medical-hover text-white rounded-lg flex items-center gap-1 font-semibold transition-colors cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" /> {t('pos.printTicketBtn')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-12 text-center text-slate-400">{t('pos.noSelected')}</div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: All / Paid Invoices History */}
      {activeTab === 'invoices' && (
        <div className="bg-medical-cardBg border border-medical-border rounded-xl p-5 space-y-4 shadow-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-medical-border pb-3">
            <div>
              <h3 className="font-bold text-medical-dark text-base">{t('history.title', { count: invoices.length })}</h3>
              <p className="text-xs text-slate-500">{t('history.sub')}</p>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder={t('history.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white border border-medical-border rounded-xl px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-medical-primary"
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-medical-border">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-mono border-b border-medical-border">
                <tr>
                  <th className="p-3">{t('history.columns.code')}</th>
                  <th className="p-3">{t('history.columns.patient')}</th>
                  <th className="p-3">{t('history.columns.items')}</th>
                  <th className="p-3">{t('history.columns.subtotal')}</th>
                  <th className="p-3">{t('history.columns.insurance')}</th>
                  <th className="p-3">{t('history.columns.patientShare')}</th>
                  <th className="p-3">{t('history.columns.status')}</th>
                  <th className="p-3">{t('history.columns.dateReg')}</th>
                  <th className="p-3 text-right">{t('history.columns.action')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-medical-border text-slate-700 font-mono">
                {invoices
                  .filter((inv) => {
                    if (!searchQuery.trim()) return true
                    const q = searchQuery.toLowerCase().trim()
                    return (
                      inv.patientName.toLowerCase().includes(q) ||
                      inv.invoiceCode.toLowerCase().includes(q) ||
                      inv.patientId.toLowerCase().includes(q)
                    )
                  })
                  .map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors cursor-pointer" onClick={() => { setSelectedInvoice(inv); setActiveTab('pos') }}>
                      <td className="p-3 text-medical-dark font-bold">{inv.invoiceCode}</td>
                      <td className="p-3 font-semibold text-slate-900 font-sans">{inv.patientName}</td>
                      <td className="p-3 font-sans text-slate-500">{t('pos.actsCount', { count: inv.items.length })}</td>
                      <td className="p-3 text-slate-500">{inv.subtotal} F CFA</td>
                      <td className="p-3 text-emerald-800 font-semibold">{inv.insuranceAmount} F CFA</td>
                      <td className="p-3 font-bold text-slate-900">{inv.patientShare} F CFA</td>
                      <td className="p-3 font-sans">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            inv.status === 'Paid'
                              ? 'bg-medical-subtle text-emerald-800 border border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {inv.status === 'Paid' ? t('statuses.paid') : t('statuses.pending')}
                        </span>
                      </td>
                      <td className="p-3 text-slate-500 font-sans text-[11px]">{inv.paidAt || inv.date}</td>
                      <td className="p-3 text-right font-sans">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedInvoice(inv)
                            setActiveTab('pos')
                          }}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-bold text-[10px] transition-colors cursor-pointer"
                        >
                          {t('history.showReceiptBtn')}
                        </button>
                      </td>
                    </tr>
                  ))}
                {invoices.length === 0 && (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-slate-400 font-sans">
                      {t('history.noInvoices')}
                    </td>
                  </tr>
                )}
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
                {t('closure.title')}
              </h3>
              <p className="text-xs text-slate-500">{t('closure.sub')}</p>
            </div>

            <button
              onClick={closeDailyRegister}
              disabled={dailyClosure.status === 'Closed'}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shadow-sm flex items-center gap-2 cursor-pointer ${dailyClosure.status === 'Open'
                  ? 'bg-medical-danger hover:bg-red-600 text-white'
                  : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                }`}
            >
              <Lock className="w-4 h-4" />
              {dailyClosure.status === 'Open' ? t('closure.lockBtn') : t('closure.closedStatus')}
            </button>
          </div>

          {/* Totals Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-50 border border-medical-border p-4 rounded-xl space-y-1">
              <span className="text-xs text-slate-500 font-medium">{t('closure.cashTotal')}</span>
              <p className="text-xl font-bold text-emerald-700 font-mono">{dailyClosure.cashTotal.toLocaleString('fr-FR')} F CFA</p>
            </div>

            <div className="bg-slate-50 border border-medical-border p-4 rounded-xl space-y-1">
              <span className="text-xs text-slate-500 font-medium">{t('closure.cardTotal')}</span>
              <p className="text-xl font-bold text-blue-700 font-mono">{dailyClosure.cardTotal.toLocaleString('fr-FR')} F CFA</p>
            </div>

            <div className="bg-slate-50 border border-medical-border p-4 rounded-xl space-y-1">
              <span className="text-xs text-slate-500 font-medium">{t('closure.mobileTotal')}</span>
              <p className="text-xl font-bold text-purple-700 font-mono">{dailyClosure.mobileTotal.toLocaleString('fr-FR')} F CFA</p>
            </div>

            <div className="bg-medical-subtle border border-emerald-200 p-4 rounded-xl space-y-1">
              <span className="text-xs text-emerald-800 font-semibold">{t('closure.grandTotal')}</span>
              <p className="text-xl font-bold text-medical-primary font-mono">{dailyClosure.grandTotal.toLocaleString('fr-FR')} F CFA</p>
            </div>
          </div>
        </div>
      )}

      {/* CREATE INVOICE MODAL */}
      {isCreateModalOpen && (
        <CreateInvoiceModal
          patients={patients}
          onClose={() => setIsCreateModalOpen(false)}
          onSave={async (invoiceData) => {
            await addInvoice(invoiceData)
            setIsCreateModalOpen(false)
          }}
        />
      )}
    </div>
  )
}
