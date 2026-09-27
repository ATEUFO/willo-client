import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Pill,
  Search,
  ShoppingBag,
  PackageCheck,
  Plus,
  FilePlus,
  Layers
} from 'lucide-react'
import { useHospitalStore, StockItem } from '../store/hospitalStore'

export const PharmacyPage: React.FC = () => {
  const { t } = useTranslation('pharmacy')
  const { t: tc } = useTranslation('common')
  const {
    inventory,
    dispenses,
    purchaseOrders,
    dispensePrescription,
    addStockItem,
    createPurchaseOrder,
    showNotification
  } = useHospitalStore()

  const [activeTab, setActiveTab] = useState<'dispense' | 'inventory' | 'orders'>('dispense')
  const [rxSearchCode, setRxSearchCode] = useState('')
  const [stockFilter, setStockFilter] = useState<'ALL' | 'Expiring Soon' | 'Low Stock' | 'Out of Stock'>('ALL')
  const [showAddStockModal, setShowAddStockModal] = useState(false)
  const [showAddPOModal, setShowAddPOModal] = useState(false)

  // Add stock form
  const [newStock, setNewStock] = useState({
    code: '',
    name: '',
    category: 'Antibiotique' as StockItem['category'],
    stockQuantity: 0,
    minQuantity: 10,
    unitPrice: 0,
    expiryDate: '',
    batchNumber: ''
  })

  // Add PO form
  const [newPO, setNewPO] = useState({
    supplier: '',
    drugName: '',
    quantity: 100,
    estimatedCost: 0
  })

  const currentDispense = rxSearchCode.trim()
    ? dispenses.find((d) => d.prescriptionCode.toLowerCase() === rxSearchCode.trim().toLowerCase()) || null
    : dispenses[0] || null

  const filteredInventory = inventory.filter((item) => {
    if (stockFilter === 'ALL') return true
    return item.status === stockFilter
  })

  const handleDispense = (id: string) => {
    dispensePrescription(id)
    showNotification("Délivrance de l'ordonnance validée et stock mis à jour!", {
      title: t('dispense.dispensed'),
      type: 'success'
    })
  }

  const handleAddStockSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newStock.name || !newStock.code) return
    addStockItem(newStock)
    setShowAddStockModal(false)
    setNewStock({
      code: '',
      name: '',
      category: 'Antibiotique',
      stockQuantity: 0,
      minQuantity: 10,
      unitPrice: 0,
      expiryDate: '',
      batchNumber: ''
    })
    showNotification("Nouveau produit ajouté à l'inventaire de la pharmacie!", {
      title: t('inventory.addProduct'),
      type: 'success'
    })
  }

  const handleCreatePOSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createPurchaseOrder({
      supplier: newPO.supplier,
      items: [{ drugName: newPO.drugName, quantity: newPO.quantity, estimatedCost: newPO.estimatedCost }],
      totalCost: newPO.estimatedCost
    })
    setShowAddPOModal(false)
    showNotification('Bon de commande généré et transmis!', {
      title: t('orders.title'),
      type: 'success'
    })
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-medical-border pb-4">
        <div>
          <h2 className="text-2xl font-bold text-medical-dark flex items-center gap-2">
            <Pill className="w-7 h-7 text-medical-primary" />
            {t('headerTitle')}
          </h2>
          <p className="text-sm text-slate-500">
            {t('headerSub')}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-medical-border shadow-sm">
          <button
            onClick={() => setActiveTab('dispense')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${activeTab === 'dispense' ? 'bg-medical-primary text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 bg-white'
              }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            {t('tabs.dispense')}
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${activeTab === 'inventory' ? 'bg-medical-primary text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 bg-white'
              }`}
          >
            <Layers className="w-3.5 h-3.5" />
            {t('tabs.inventory', { count: inventory.length })}
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${activeTab === 'orders' ? 'bg-medical-primary text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 bg-white'
              }`}
          >
            <FilePlus className="w-3.5 h-3.5" />
            {t('tabs.orders', { count: purchaseOrders.length })}
          </button>
        </div>
      </div>

      {/* Tab 1: Comptoir de Délivrance */}
      {activeTab === 'dispense' && (
        <div className="bg-medical-cardBg border border-medical-border rounded-xl p-5 space-y-6 shadow-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-medical-border pb-4">
            <div>
              <h3 className="font-bold text-medical-dark text-base">{t('dispense.title')}</h3>
              <p className="text-xs text-slate-500">{t('dispense.sub')}</p>
            </div>

            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder={t('dispense.searchPlaceholder')}
                value={rxSearchCode}
                onChange={(e) => setRxSearchCode(e.target.value)}
                className="w-full bg-white border border-medical-border rounded-xl pl-9 pr-4 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:border-medical-primary"
              />
            </div>
          </div>

          {currentDispense ? (
            <div className="bg-slate-50 border border-medical-border rounded-xl p-5 space-y-5">
              <div className="flex items-center justify-between flex-wrap gap-3 border-b border-medical-border pb-3">
                <div>
                  <span className="font-mono text-xs text-emerald-800 bg-medical-subtle px-2 py-0.5 rounded border border-emerald-200 font-bold">
                    {currentDispense.prescriptionCode}
                  </span>
                  <h4 className="font-bold text-slate-900 text-lg mt-1">{t('dispense.patient', { name: currentDispense.patientName })}</h4>
                  <p className="text-xs text-slate-500">{t('dispense.prescribedBy', { doctor: currentDispense.prescribedBy, date: currentDispense.date })}</p>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${currentDispense.status === 'Dispensed'
                      ? 'bg-medical-subtle text-emerald-800 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse'
                    }`}
                >
                  {currentDispense.status === 'Dispensed' ? t('dispense.dispensed') : t('dispense.pending')}
                </span>
              </div>

              {/* Items Breakdown */}
              <div className="overflow-x-auto rounded-xl border border-medical-border bg-white">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-mono border-b border-medical-border">
                    <tr>
                      <th className="p-3">{t('dispense.table.drug')}</th>
                      <th className="p-3">{t('dispense.table.qty')}</th>
                      <th className="p-3">{t('dispense.table.unitPrice')}</th>
                      <th className="p-3">{t('dispense.table.total')}</th>
                      <th className="p-3">{t('dispense.table.stockCheck')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-medical-border text-slate-700">
                    {currentDispense.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80">
                        <td className="p-3 font-bold text-slate-900">{item.drugName}</td>
                        <td className="p-3 font-bold text-medical-dark">{item.quantity} {t('dispense.table.boxes')}</td>
                        <td className="p-3 text-slate-500 font-mono">{item.unitPrice} F CFA</td>
                        <td className="p-3 font-bold text-slate-900 font-mono">{item.quantity * item.unitPrice} F CFA</td>
                        <td className="p-3">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-medical-subtle text-emerald-800 border border-emerald-200 font-bold">
                            {t('dispense.table.inStock')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between pt-3">
                <div className="text-sm">
                  <span className="text-slate-500 font-medium">{t('dispense.totalAmount')} </span>
                  <span className="font-bold text-slate-900 font-mono text-base">{currentDispense.totalAmount} F CFA</span>
                </div>

                {currentDispense.status !== 'Dispensed' && (
                  <button
                    onClick={() => handleDispense(currentDispense.id)}
                    className="bg-medical-primary hover:bg-medical-hover text-white font-bold px-6 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                  >
                    <PackageCheck className="w-4 h-4" /> {t('dispense.validateBtn')}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400">{t('dispense.noPrescription')}</div>
          )}
        </div>
      )}

      {/* Tab 2: Inventory & Stock Management */}
      {activeTab === 'inventory' && (
        <div className="bg-medical-cardBg border border-medical-border rounded-xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="font-bold text-medical-dark text-base">{t('inventory.title')}</h3>
              <p className="text-xs text-slate-500">{t('inventory.sub')}</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-medical-border text-xs">
                {(['ALL', 'Expiring Soon', 'Low Stock', 'Out of Stock'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setStockFilter(f)}
                    className={`px-3 py-1 rounded-lg transition-all font-mono text-xs cursor-pointer ${stockFilter === f ? 'bg-medical-primary text-white font-bold' : 'text-slate-600 hover:text-slate-900'
                      }`}
                  >
                    {f === 'ALL' ? t('inventory.filters.all') : f === 'Expiring Soon' ? t('inventory.filters.expiring') : f === 'Low Stock' ? t('inventory.filters.low') : t('inventory.filters.out')}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowAddStockModal(true)}
                className="bg-medical-primary hover:bg-medical-hover text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" /> {t('inventory.addProduct')}
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-medical-border">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-mono border-b border-medical-border">
                <tr>
                  <th className="p-3">{t('inventory.columns.code')}</th>
                  <th className="p-3">{t('inventory.columns.name')}</th>
                  <th className="p-3">{t('inventory.columns.category')}</th>
                  <th className="p-3">{t('inventory.columns.currentStock')}</th>
                  <th className="p-3">{t('inventory.columns.minThresh')}</th>
                  <th className="p-3">{t('inventory.columns.unitPrice')}</th>
                  <th className="p-3">{t('inventory.columns.batch')}</th>
                  <th className="p-3">{t('inventory.columns.expiry')}</th>
                  <th className="p-3">{t('inventory.columns.status')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-medical-border text-slate-700">
                {filteredInventory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 font-mono text-medical-dark font-bold">{item.code}</td>
                    <td className="p-3 font-bold text-slate-900">{item.name}</td>
                    <td className="p-3 text-slate-600">{item.category}</td>
                    <td className="p-3 font-mono font-bold text-slate-800">{item.stockQuantity}</td>
                    <td className="p-3 font-mono text-slate-500">{item.minQuantity}</td>
                    <td className="p-3 font-mono text-slate-600">{item.unitPrice} F CFA</td>
                    <td className="p-3 font-mono text-slate-500">{item.batchNumber}</td>
                    <td className="p-3 font-mono text-slate-600">{item.expiryDate}</td>
                    <td className="p-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${item.status === 'Normal'
                            ? 'bg-medical-subtle text-emerald-800 border border-emerald-200'
                            : item.status === 'Expiring Soon'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse'
                              : 'bg-red-50 text-medical-danger border border-red-200'
                          }`}
                      >
                        {item.status === 'Normal' ? t('inventory.statuses.normal') : item.status === 'Expiring Soon' ? t('inventory.statuses.expiringSoon') : item.status === 'Low Stock' ? t('inventory.statuses.lowStock') : t('inventory.statuses.outOfStock')}
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredInventory.length === 0 && (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-slate-400 font-sans">
                      {t('inventory.empty')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Purchase Orders (Bons de commande) */}
      {activeTab === 'orders' && (
        <div className="bg-medical-cardBg border border-medical-border rounded-xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between flex-wrap gap-3 border-b border-medical-border pb-3">
            <div>
              <h3 className="font-bold text-medical-dark text-base">{t('orders.title')}</h3>
              <p className="text-xs text-slate-500">{t('orders.sub')}</p>
            </div>

            <button
              onClick={() => setShowAddPOModal(true)}
              className="bg-medical-primary hover:bg-medical-hover text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" /> {t('orders.generateBtn')}
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-medical-border">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-mono border-b border-medical-border">
                <tr>
                  <th className="p-3">{t('orders.columns.code')}</th>
                  <th className="p-3">{t('orders.columns.supplier')}</th>
                  <th className="p-3">{t('orders.columns.items')}</th>
                  <th className="p-3">{t('orders.columns.estimatedCost')}</th>
                  <th className="p-3">{t('orders.columns.date')}</th>
                  <th className="p-3">{t('orders.columns.status')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-medical-border text-slate-700">
                {purchaseOrders.map((po) => (
                  <tr key={po.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 font-mono text-medical-dark font-bold">{po.orderCode}</td>
                    <td className="p-3 font-semibold text-slate-900">{po.supplier}</td>
                    <td className="p-3 text-slate-700">
                      {po.items.map((i, idx) => (
                        <div key={idx}>{i.drugName} (x{i.quantity})</div>
                      ))}
                    </td>
                    <td className="p-3 font-mono font-bold text-slate-900">{po.totalCost} F CFA</td>
                    <td className="p-3 font-mono text-slate-500">{po.dateCreated}</td>
                    <td className="p-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        {po.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {purchaseOrders.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400 font-sans">
                      {t('orders.empty')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Add Stock */}
      {showAddStockModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-medical-border rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-medical-dark">{t('modal.addStockTitle')}</h3>

            <form onSubmit={handleAddStockSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">{t('modal.codeLabel')}</label>
                  <input
                    type="text"
                    required
                    value={newStock.code}
                    onChange={(e) => setNewStock({ ...newStock, code: e.target.value })}
                    placeholder="Ex: MED-CIP-500"
                    className="w-full bg-white border border-medical-border rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-medical-primary font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">{t('modal.unitPriceLabel')}</label>
                  <input
                    type="number"
                    required
                    value={newStock.unitPrice}
                    onChange={(e) => setNewStock({ ...newStock, unitPrice: parseInt(e.target.value) || 0 })}
                    className="w-full bg-white border border-medical-border rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-medical-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">{t('modal.nameLabel')}</label>
                <input
                  type="text"
                  required
                  value={newStock.name}
                  onChange={(e) => setNewStock({ ...newStock, name: e.target.value })}
                  placeholder="Ex: Ciprofloxacine 500mg"
                  className="w-full bg-white border border-medical-border rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-medical-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">{t('modal.initQtyLabel')}</label>
                  <input
                    type="number"
                    value={newStock.stockQuantity}
                    onChange={(e) => setNewStock({ ...newStock, stockQuantity: parseInt(e.target.value) || 0 })}
                    className="w-full bg-white border border-medical-border rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-medical-primary"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">{t('modal.minQtyLabel')}</label>
                  <input
                    type="number"
                    value={newStock.minQuantity}
                    onChange={(e) => setNewStock({ ...newStock, minQuantity: parseInt(e.target.value) || 0 })}
                    className="w-full bg-white border border-medical-border rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-medical-primary"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddStockModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 font-medium cursor-pointer"
                >
                  {tc('actions.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-medical-primary hover:bg-medical-hover text-white font-semibold shadow-sm cursor-pointer"
                >
                  {t('modal.addStockBtn')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Add PO */}
      {showAddPOModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-medical-border rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-medical-dark">{t('modal.addPOTitle')}</h3>

            <form onSubmit={handleCreatePOSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">{t('modal.supplierLabel')}</label>
                <input
                  type="text"
                  required
                  value={newPO.supplier}
                  onChange={(e) => setNewPO({ ...newPO, supplier: e.target.value })}
                  className="w-full bg-white border border-medical-border rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-medical-primary"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">{t('modal.drugNameLabel')}</label>
                <input
                  type="text"
                  required
                  value={newPO.drugName}
                  onChange={(e) => setNewPO({ ...newPO, drugName: e.target.value })}
                  className="w-full bg-white border border-medical-border rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-medical-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">{t('modal.qtyLabel')}</label>
                  <input
                    type="number"
                    value={newPO.quantity}
                    onChange={(e) => setNewPO({ ...newPO, quantity: parseInt(e.target.value) || 0 })}
                    className="w-full bg-white border border-medical-border rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-medical-primary"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">{t('modal.costLabel')}</label>
                  <input
                    type="number"
                    value={newPO.estimatedCost}
                    onChange={(e) => setNewPO({ ...newPO, estimatedCost: parseInt(e.target.value) || 0 })}
                    className="w-full bg-white border border-medical-border rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-medical-primary"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddPOModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 font-medium cursor-pointer"
                >
                  {tc('actions.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-medical-primary hover:bg-medical-hover text-white font-semibold shadow-sm cursor-pointer"
                >
                  {t('modal.emitPOBtn')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
