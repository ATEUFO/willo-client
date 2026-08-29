import { getDrizzleDb } from '../database'
import { invoices } from '../database/schema'
import { eq, desc } from 'drizzle-orm'

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
    const db = getDrizzleDb()
    const rows = db
      .select()
      .from(invoices)
      .orderBy(desc(invoices.date))
      .all()
    return rows.map((r) => ({
      ...r,
      insuranceName: r.insuranceName || undefined,
      paymentMethod: (r.paymentMethod || undefined) as Invoice['paymentMethod'],
      status: r.status as Invoice['status'],
      paidAt: r.paidAt || undefined,
      items: JSON.parse(r.items)
    }))
  }

  /**
   * Gets invoices by Patient ID.
   */
  static getByPatientId(patientId: string): Invoice[] {
    const db = getDrizzleDb()
    const rows = db
      .select()
      .from(invoices)
      .where(eq(invoices.patientId, patientId))
      .orderBy(desc(invoices.date))
      .all()
    return rows.map((r) => ({
      ...r,
      insuranceName: r.insuranceName || undefined,
      paymentMethod: (r.paymentMethod || undefined) as Invoice['paymentMethod'],
      status: r.status as Invoice['status'],
      paidAt: r.paidAt || undefined,
      items: JSON.parse(r.items)
    }))
  }

  /**
   * Creates a new billing invoice.
   */
  static create(invoice: Omit<Invoice, 'createdAt'>): Invoice {
    const db = getDrizzleDb()
    db.insert(invoices)
      .values({
        id: invoice.id,
        invoiceCode: invoice.invoiceCode,
        patientId: invoice.patientId,
        patientName: invoice.patientName,
        insuranceName: invoice.insuranceName || null,
        insuranceCoveragePercent: invoice.insuranceCoveragePercent,
        subtotal: invoice.subtotal,
        insuranceAmount: invoice.insuranceAmount,
        patientShare: invoice.patientShare,
        paymentMethod: invoice.paymentMethod || null,
        status: invoice.status,
        paidAt: invoice.paidAt || null,
        items: JSON.stringify(invoice.items),
        date: invoice.date
      })
      .run()
    return invoice
  }

  /**
   * Registers a payment for an invoice.
   */
  static markAsPaid(id: string, paymentMethod: Invoice['paymentMethod']): void {
    const db = getDrizzleDb()
    db.update(invoices)
      .set({
        status: 'Paid',
        paymentMethod: paymentMethod || null,
        paidAt: new Date().toISOString()
      })
      .where(eq(invoices.id, id))
      .run()
  }
}
