import React, { useState } from 'react'
import {
  Pill,
  Search,
  ShoppingBag,
  PackageCheck,
  Plus,
  FilePlus,
  Layers
} from 'lucide-react'
import { useHospitalStore, StockItem } from '../../store/hospitalStore'

export const PharmacyPage: React.FC = () => {
  const {
    inventory,
    dispenses,
    purchaseOrders,
    dispensePrescription,
    addStockItem,
    createPurchaseOrder
  } = useHospitalStore()

  const [activeTab, setActiveTab] = useState<'dispense' | 'inventory' | 'orders'>('dispense')
  const [rxSearchCode, setRxSearchCode] = useState('ORD-2026-042')
  const [stockFilter, setStockFilter] = useState<'ALL' | 'Expiring Soon' | 'Low Stock' | 'Out of Stock'>('ALL')
  const [showAddStockModal, setShowAddStockModal] = useState(false)
  const [showAddPOModal, setShowAddPOModal] = useState(false)

  // Add stock form
  const [newStock, setNewStock] = useState({
    code: '',
    name: '',
    category: 'Antibiotique' as StockItem['category'],
    stockQuantity: 100,
    minQuantity: 20,
    unitPrice: 1500,
    expiryDate: '2027-12-31',
    batchNumber: 'LOT-2026-N01'
  })

  // Add PO form
  const [newPO, setNewPO] = useState({
    supplier: 'Pharmacie Centrale de Distribution',
    drugName: 'Amoxicilline 1g',
    quantity: 200,
    estimatedCost: 640000
  })

  const currentDispense = dispenses.find((d) => d.prescriptionCode === rxSearchCode) || dispenses[0]

  const filteredInventory = inventory.filter((item) => {
    if (stockFilter === 'ALL') return true
    return item.status === stockFilter
  })

  const handleDispense = (id: string) => {
    dispensePrescription(id)
    alert('Délivrance de l\'ordonnance validée et stock mis à jour!')
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
      stockQuantity: 100,
      minQuantity: 20,
      unitPrice: 1500,
      expiryDate: '2027-12-31',
      batchNumber: 'LOT-2026-N01'
    })
    alert('Nouveau produit ajouté à l\'inventaire de la pharmacie!')
  }

  const handleCreatePOSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createPurchaseOrder({
      supplier: newPO.supplier,
      items: [{ drugName: newPO.drugName, quantity: newPO.quantity, estimatedCost: newPO.estimatedCost }],
      totalCost: newPO.estimatedCost
    })
    setShowAddPOModal(false)
    alert('Bon de commande généré et transmitted au fournisseur!')
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-medical-border pb-4">
        <div>
          <h2 className="text-2xl font-bold text-medical-dark flex items-center gap-2">
            <Pill className="w-7 h-7 text-medical-primary" />
            Espace Pharmacie & Gestion des Médicaments
          </h2>
          <p className="text-sm text-slate-500">
            Comptoir de délivrance rapide, suivi des péremptions / ruptures et re-commandes
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-medical-border shadow-sm">
          <button
            onClick={() => setActiveTab('dispense')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'dispense' ? 'bg-medical-primary text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 bg-white'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            Comptoir Délivrance
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'inventory' ? 'bg-medical-primary text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 bg-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Gestion des Stocks ({inventory.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'orders' ? 'bg-medical-primary text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 bg-white'
            }`}
          >
            <FilePlus className="w-3.5 h-3.5" />
            Bons de Commande ({purchaseOrders.length})
          </button>
        </div>
      </div>

      {/* Tab 1: Comptoir de Délivrance */}
      {activeTab === 'dispense' && (
        <div className="bg-medical-cardBg border border-medical-border rounded-xl p-5 space-y-6 shadow-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-medical-border pb-4">
            <div>
              <h3 className="font-bold text-medical-dark text-base">Comptoir de Délivrance des Ordonnances</h3>
              <p className="text-xs text-slate-500">Saisir le code d'ordonnance pour afficher la liste des médicaments</p>
            </div>

            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Ex: ORD-2026-042..."
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
                  <h4 className="font-bold text-slate-900 text-lg mt-1">Patient : {currentDispense.patientName}</h4>
                  <p className="text-xs text-slate-500">Ordonnance rédigée par {currentDispense.prescribedBy} le {currentDispense.date}</p>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    currentDispense.status === 'Dispensed'
                      ? 'bg-medical-subtle text-emerald-800 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse'
                  }`}
                >
                  {currentDispense.status === 'Dispensed' ? 'Délivré' : 'En Attente de Délivrance'}
                </span>
              </div>

              {/* Items Breakdown */}
              <div className="overflow-x-auto rounded-xl border border-medical-border bg-white">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-mono border-b border-medical-border">
                    <tr>
                      <th className="p-3">Médicament Prescrit</th>
                      <th className="p-3">Quantité à Délivrer</th>
                      <th className="p-3">Prix Unitaire</th>
                      <th className="p-3">Total F CFA</th>
                      <th className="p-3">Vérification Stock</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-medical-border text-slate-700">
                    {currentDispense.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80">
                        <td className="p-3 font-bold text-slate-900">{item.drugName}</td>
                        <td className="p-3 font-bold text-medical-dark">{item.quantity} boîte(s)</td>
                        <td className="p-3 text-slate-500 font-mono">{item.unitPrice} F CFA</td>
                        <td className="p-3 font-bold text-slate-900 font-mono">{item.quantity * item.unitPrice} F CFA</td>
                        <td className="p-3">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-medical-subtle text-emerald-800 border border-emerald-200 font-bold">
                            En Stock (Disponibilité OK)
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between pt-3">
                <div className="text-sm">
                  <span className="text-slate-500 font-medium">Montant Total Médicaments : </span>
                  <span className="font-bold text-slate-900 font-mono text-base">{currentDispense.totalAmount} F CFA</span>
                </div>

                {currentDispense.status !== 'Dispensed' && (
                  <button
                    onClick={() => handleDispense(currentDispense.id)}
                    className="bg-medical-primary hover:bg-medical-hover text-white font-bold px-6 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-2"
                  >
                    <PackageCheck className="w-4 h-4" /> Valider la Délivrance
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400">Aucune ordonnance trouvée avec ce code</div>
          )}
        </div>
      )}

      {/* Tab 2: Inventory & Stock Management */}
      {activeTab === 'inventory' && (
        <div className="bg-medical-cardBg border border-medical-border rounded-xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="font-bold text-medical-dark text-base">Inventaire & Suivi des Péremptions</h3>
              <p className="text-xs text-slate-500">Filtres de péremption imminente et ruptures de stock</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-medical-border text-xs">
                {(['ALL', 'Expiring Soon', 'Low Stock', 'Out of Stock'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setStockFilter(f)}
                    className={`px-3 py-1 rounded-lg transition-all font-mono text-xs ${
                      stockFilter === f ? 'bg-medical-primary text-white font-bold' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {f === 'ALL' ? 'Tous' : f === 'Expiring Soon' ? 'Péremption <30j' : f === 'Low Stock' ? 'Stock Faible' : 'Rupture'}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowAddStockModal(true)}
                className="bg-medical-primary hover:bg-medical-hover text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" /> Ajouter Produit
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-medical-border">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-mono border-b border-medical-border">
                <tr>
                  <th className="p-3">Code</th>
                  <th className="p-3">Nom du Médicament</th>
                  <th className="p-3">Catégorie</th>
                  <th className="p-3">Stock Actuel</th>
                  <th className="p-3">Seuil Min.</th>
                  <th className="p-3">Prix Unitaire</th>
                  <th className="p-3">N° Lot</th>
                  <th className="p-3">Date Péremption</th>
                  <th className="p-3">Statut</th>
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
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          item.status === 'Normal'
                            ? 'bg-medical-subtle text-emerald-800 border border-emerald-200'
                            : item.status === 'Expiring Soon'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse'
                            : 'bg-red-50 text-medical-danger border border-red-200'
                        }`}
                      >
                        {item.status === 'Normal' ? 'Normal' : item.status === 'Expiring Soon' ? 'Péremption Proche' : item.status === 'Low Stock' ? 'Stock Bas' : 'Rupture'}
                      </span>
                    </td>
                  </tr>
                ))}
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
              <h3 className="font-bold text-medical-dark text-base">Bons de Commande de Réapprovisionnement</h3>
              <p className="text-xs text-slate-500">Générer les demandes d'achat pour la centrale pharmaceutique</p>
            </div>

            <button
              onClick={() => setShowAddPOModal(true)}
              className="bg-medical-primary hover:bg-medical-hover text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" /> Générer un Bon de Commande
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-medical-border">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-mono border-b border-medical-border">
                <tr>
                  <th className="p-3">N° Bon</th>
                  <th className="p-3">Fournisseur</th>
                  <th className="p-3">Articles Commandés</th>
                  <th className="p-3">Montant Estimé</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Statut</th>
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
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Add Stock */}
      {showAddStockModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-medical-border rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-medical-dark">Ajouter un produit en stock</h3>

            <form onSubmit={handleAddStockSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Code Produit</label>
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
                  <label className="block text-slate-600 font-medium mb-1">Prix Unitaire (F CFA)</label>
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
                <label className="block text-slate-600 font-medium mb-1">Nom du Médicament / Article</label>
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
                  <label className="block text-slate-600 font-medium mb-1">Quantité Initiale</label>
                  <input
                    type="number"
                    value={newStock.stockQuantity}
                    onChange={(e) => setNewStock({ ...newStock, stockQuantity: parseInt(e.target.value) || 0 })}
                    className="w-full bg-white border border-medical-border rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-medical-primary"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Seuil Alerte Min.</label>
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
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-medical-primary hover:bg-medical-hover text-white font-semibold shadow-sm"
                >
                  Ajouter au Stock
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
            <h3 className="text-lg font-bold text-medical-dark">Nouveau Bon de Commande</h3>

            <form onSubmit={handleCreatePOSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Fournisseur</label>
                <input
                  type="text"
                  required
                  value={newPO.supplier}
                  onChange={(e) => setNewPO({ ...newPO, supplier: e.target.value })}
                  className="w-full bg-white border border-medical-border rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-medical-primary"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Médicament à commander</label>
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
                  <label className="block text-slate-600 font-medium mb-1">Quantité</label>
                  <input
                    type="number"
                    value={newPO.quantity}
                    onChange={(e) => setNewPO({ ...newPO, quantity: parseInt(e.target.value) || 0 })}
                    className="w-full bg-white border border-medical-border rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-medical-primary"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Coût Estimé (F CFA)</label>
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
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-medical-primary hover:bg-medical-hover text-white font-semibold shadow-sm"
                >
                  Émettre la Commande
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
