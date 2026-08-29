import { getDrizzleDb } from '../database'
import { inventory } from '../database/schema'
import { eq } from 'drizzle-orm'

export interface InventoryItem {
  id: string
  code: string
  name: string
  category: string
  stockQuantity: number
  minQuantity: number
  unitPrice: number
  batchNumber: string
  expiryDate: string
  status: 'Normal' | 'Low Stock' | 'Critical' | 'Expired'
  createdAt?: string
}

export class InventoryModel {
  /**
   * Returns all pharmacy inventory items from local SQLite DB.
   */
  static getAll(): InventoryItem[] {
    const db = getDrizzleDb()
    const rows = db
      .select()
      .from(inventory)
      .orderBy(inventory.name)
      .all()
    return rows.map((r) => ({
      ...r,
      status: r.status as InventoryItem['status'],
      batchNumber: r.batchNumber || '',
      expiryDate: r.expiryDate || ''
    }))
  }

  /**
   * Gets inventory item by ID.
   */
  static getById(id: string): InventoryItem | null {
    const db = getDrizzleDb()
    const row = db
      .select()
      .from(inventory)
      .where(eq(inventory.id, id))
      .get()
    return row
      ? {
          ...row,
          status: row.status as InventoryItem['status'],
          batchNumber: row.batchNumber || '',
          expiryDate: row.expiryDate || ''
        }
      : null
  }

  /**
   * Adds a new item to pharmacy inventory.
   */
  static create(item: Omit<InventoryItem, 'createdAt'>): InventoryItem {
    const db = getDrizzleDb()
    db.insert(inventory)
      .values({
        id: item.id,
        code: item.code,
        name: item.name,
        category: item.category,
        stockQuantity: item.stockQuantity,
        minQuantity: item.minQuantity,
        unitPrice: item.unitPrice,
        batchNumber: item.batchNumber,
        expiryDate: item.expiryDate,
        status: item.status
      })
      .run()
    return item
  }

  /**
   * Updates stock quantity for a drug or consumable.
   */
  static updateStock(id: string, newQuantity: number): void {
    const db = getDrizzleDb()
    const item = this.getById(id)
    if (!item) return

    let status: InventoryItem['status'] = 'Normal'
    if (newQuantity <= 0) {
      status = 'Critical'
    } else if (newQuantity <= item.minQuantity) {
      status = 'Low Stock'
    }

    db.update(inventory)
      .set({
        stockQuantity: newQuantity,
        status
      })
      .where(eq(inventory.id, id))
      .run()
  }
}
