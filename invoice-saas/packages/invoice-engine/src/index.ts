import type { InvoiceItemInput, InvoiceTotals } from "@billflow/types";

const round = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

/**
 * MVP calculation engine.
 * Tax jurisdiction rules are intentionally not inferred here; the caller must
 * provide approved CGST/SGST/IGST allocation inputs in later iterations.
 */
export function calculateInvoice(items: InvoiceItemInput[], taxMode: "NONE" | "CGST_SGST" | "IGST" = "NONE"): InvoiceTotals {
  let subtotal = 0;
  let discount = 0;
  let cgst = 0;
  let sgst = 0;
  let igst = 0;

  for (const item of items) {
    const lineSubtotal = item.quantity * item.rate;
    const lineDiscount = Math.min(item.discount, lineSubtotal);
    const taxable = lineSubtotal - lineDiscount;
    const tax = taxable * (item.taxRate / 100);

    subtotal += lineSubtotal;
    discount += lineDiscount;
    if (taxMode === "CGST_SGST") {
      cgst += tax / 2;
      sgst += tax / 2;
    } else if (taxMode === "IGST") {
      igst += tax;
    }
  }

  const taxableAmount = subtotal - discount;
  const tax = cgst + sgst + igst;
  return {
    subtotal: round(subtotal),
    discount: round(discount),
    taxableAmount: round(taxableAmount),
    cgst: round(cgst),
    sgst: round(sgst),
    igst: round(igst),
    tax: round(tax),
    total: round(taxableAmount + tax)
  };
}
