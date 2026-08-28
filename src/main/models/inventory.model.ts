import { getDatabase } from '../database'

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
    const db = getDatabase()
    const stmt = db.prepare(`
      SELECT 
        id, code, name, category, stock_quantity as stockQuantity,
        min_quantity as minQuantity, unit_price as unitPrice,
        batch_number as batchNumber, expiry_date as expiryDate,
        status, created_at as createdAt
      FROM inventory 
      ORDER BY name ASC
    `)
    return (stmt.all() as unknown[]) as InventoryItem[]
  }

  /**
   * Gets inventory item by ID.
   */
  static getById(id: string): InventoryItem | null {
    const db = getDatabase()
    const stmt = db.prepare(`
      SELECT 
        id, code, name, category, stock_quantity as stockQuantity,
        min_quantity as minQuantity, unit_price as unitPrice,
        batch_number as batchNumber, expiry_date as expiryDate,
        status, created_at as createdAt
      FROM inventory 
      WHERE id = ?
    `)
    const row = stmt.get(id) as InventoryItem | undefined
    return row || null
  }

  /**
   * Adds a new item to pharmacy inventory.
   */
  static create(item: Omit<InventoryItem, 'createdAt'>): InventoryItem {
    const db = getDatabase()
    const stmt = db.prepare(`
      INSERT INTO inventory (
        id, code, name, category, stock_quantity, min_quantity,
        unit_price, batch_number, expiry_date, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    stmt.run(
      item.id,
      item.code,
      item.name,
      item.category,
      item.stockQuantity,
      item.minQuantity,
      item.unitPrice,
      item.batchNumber,
      item.expiryDate,
      item.status
    )
    return item
  }

  /**
   * Updates stock quantity for a drug or consumable.
   */
  static updateStock(id: string, newQuantity: number): void {
    const db = getDatabase()
    const item = this.getById(id)
    if (!item) return

    let status: InventoryItem['status'] = 'Normal'
    if (newQuantity <= 0) {
      status = 'Critical'
    } else if (newQuantity <= item.minQuantity) {
      status = 'Low Stock'
    }

    const stmt = db.prepare('UPDATE inventory SET stock_quantity = ?, status = ? WHERE id = ?')
    stmt.run(newQuantity, status, id)
  }
}
