export type InvoiceStatus = "DRAFT" | "FINALIZED" | "PAID" | "PENDING" | "OVERDUE" | "CANCELLED";

export interface InvoiceItemInput {
  description: string;
  hsnSac?: string;
  quantity: number;
  rate: number;
  discount: number;
  taxRate: number;
}

export interface InvoiceTotals {
  subtotal: number;
  discount: number;
  taxableAmount: number;
  cgst: number;
  sgst: number;
  igst: number;
  tax: number;
  total: number;
}
