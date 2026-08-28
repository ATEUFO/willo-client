import { getDatabase } from '../database'

export interface InvoiceItem {
  description: string
  amount: number
  category?: string
}

export interface Invoice {
  id: string
  invoiceCode: string
  patientId: string
  patientName: string
  insuranceName?: string
  insuranceCoveragePercent: number
  subtotal: number
  insuranceAmount: number
  patientShare: number
  paymentMethod?: 'Cash' | 'Mobile Money' | 'Card' | 'Insurance Direct'
  status: 'Unpaid' | 'Paid' | 'Partially Paid'
  paidAt?: string
  items: InvoiceItem[]
  date: string
  createdAt?: string
}

export class InvoiceModel {
  /**
   * Gets all billing invoices from local SQLite DB.
   */
  static getAll(): Invoice[] {
    const db = getDatabase()
    const stmt = db.prepare(`
      SELECT 
        id, invoice_code as invoiceCode, patient_id as patientId,
        patient_name as patientName, insurance_name as insuranceName,
        insurance_coverage_percent as insuranceCoveragePercent, subtotal,
        insurance_amount as insuranceAmount, patient_share as patientShare,
        payment_method as paymentMethod, status, paid_at as paidAt, items,
        date, created_at as createdAt
      FROM invoices 
      ORDER BY date DESC
    `)
    const rows = stmt.all() as (Omit<Invoice, 'items'> & { items: string })[]
    return rows.map((r) => ({
      ...r,
      items: JSON.parse(r.items)
    }))
  }

  /**
   * Gets invoices by Patient ID.
   */
  static getByPatientId(patientId: string): Invoice[] {
    const db = getDatabase()
    const stmt = db.prepare(`
      SELECT 
        id, invoice_code as invoiceCode, patient_id as patientId,
        patient_name as patientName, insurance_name as insuranceName,
        insurance_coverage_percent as insuranceCoveragePercent, subtotal,
        insurance_amount as insuranceAmount, patient_share as patientShare,
        payment_method as paymentMethod, status, paid_at as paidAt, items,
        date, created_at as createdAt
      FROM invoices 
      WHERE patient_id = ?
      ORDER BY date DESC
    `)
    const rows = stmt.all(patientId) as (Omit<Invoice, 'items'> & { items: string })[]
    return rows.map((r) => ({
      ...r,
      items: JSON.parse(r.items)
    }))
  }

  /**
   * Creates a new billing invoice.
   */
  static create(invoice: Omit<Invoice, 'createdAt'>): Invoice {
    const db = getDatabase()
    const stmt = db.prepare(`
      INSERT INTO invoices (
        id, invoice_code, patient_id, patient_name, insurance_name,
        insurance_coverage_percent, subtotal, insurance_amount, patient_share,
        payment_method, status, paid_at, items, date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    stmt.run(
      invoice.id,
      invoice.invoiceCode,
      invoice.patientId,
      invoice.patientName,
      invoice.insuranceName || null,
      invoice.insuranceCoveragePercent,
      invoice.subtotal,
      invoice.insuranceAmount,
      invoice.patientShare,
      invoice.paymentMethod || null,
      invoice.status,
      invoice.paidAt || null,
      JSON.stringify(invoice.items),
      invoice.date
    )
    return invoice
  }

  /**
   * Registers a payment for an invoice.
   */
  static markAsPaid(id: string, paymentMethod: Invoice['paymentMethod']): void {
    const db = getDatabase()
    const stmt = db.prepare(`
      UPDATE invoices 
      SET status = 'Paid', payment_method = ?, paid_at = ? 
      WHERE id = ?
    `)
    stmt.run(paymentMethod || null, new Date().toISOString(), id)
  }
}
