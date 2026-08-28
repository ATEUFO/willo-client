import { getDatabase } from '../database'

export interface PurchaseOrderItem {
  drugName: string
  quantity: number
  estimatedCost: number
}

export interface PurchaseOrder {
  id: string
  orderCode: string
  supplier: string
  items: PurchaseOrderItem[]
  totalCost: number
  dateCreated: string
  status: 'Draft' | 'Sent' | 'Received'
}

export class PurchaseOrderModel {
  static getAll(): PurchaseOrder[] {
    const db = getDatabase()
    const stmt = db.prepare(`
      SELECT 
        id, order_code as orderCode, supplier, items,
        total_cost as totalCost, date_created as dateCreated, status
      FROM purchase_orders 
      ORDER BY date_created DESC
    `)
    const rows = stmt.all() as (Omit<PurchaseOrder, 'items'> & { items: string })[]
    return rows.map((r) => ({ ...r, items: JSON.parse(r.items) }))
  }

  static create(po: Omit<PurchaseOrder, 'id' | 'orderCode' | 'dateCreated' | 'status'>): PurchaseOrder {
    const db = getDatabase()
    const id = `po-${Date.now()}`
    const count = (db.prepare('SELECT COUNT(*) as count FROM purchase_orders').get() as { count: number }).count + 1
    const orderCode = `PO-2026-${String(count).padStart(3, '0')}`
    const dateCreated = new Date().toLocaleString()
    const totalCost = po.items.reduce((acc, curr) => acc + curr.estimatedCost, 0)
    const status = 'Sent'

    const stmt = db.prepare(`
      INSERT INTO purchase_orders (id, order_code, supplier, items, total_cost, date_created, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `)
    stmt.run(id, orderCode, po.supplier, JSON.stringify(po.items), totalCost, dateCreated, status)
    return { id, orderCode, supplier: po.supplier, items: po.items, totalCost, dateCreated, status }
  }
}
