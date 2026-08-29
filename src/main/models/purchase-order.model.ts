import { getDrizzleDb, getDatabase } from '../database'
import { purchaseOrders } from '../database/schema'
import { desc } from 'drizzle-orm'

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
    const db = getDrizzleDb()
    const rows = db
      .select()
      .from(purchaseOrders)
      .orderBy(desc(purchaseOrders.dateCreated))
      .all()
    return rows.map((r) => ({
      ...r,
      status: r.status as PurchaseOrder['status'],
      items: JSON.parse(r.items)
    }))
  }

  static create(po: Omit<PurchaseOrder, 'id' | 'orderCode' | 'dateCreated' | 'status'>): PurchaseOrder {
    const db = getDrizzleDb()
    const rawDb = getDatabase()
    const id = `po-${Date.now()}`
    
    // Using a quick raw count query for compatibility and speed
    const count = (rawDb.prepare('SELECT COUNT(*) as count FROM purchase_orders').get() as { count: number }).count + 1
    const orderCode = `PO-2026-${String(count).padStart(3, '0')}`
    const dateCreated = new Date().toLocaleString()
    const totalCost = po.items.reduce((acc, curr) => acc + curr.estimatedCost, 0)
    const status = 'Sent'

    db.insert(purchaseOrders)
      .values({
        id,
        orderCode,
        supplier: po.supplier,
        items: JSON.stringify(po.items),
        totalCost,
        dateCreated,
        status
      })
      .run()

    return { id, orderCode, supplier: po.supplier, items: po.items, totalCost, dateCreated, status }
  }
}
