import { Router } from "express";
import { requireAuth, type AuthenticatedRequest } from "../auth/auth.middleware";
import { createInvoicePaymentSchema } from "./payment.schemas";
import { createInvoicePayment, getInvoicePaymentSummary, listInvoicePayments } from "./payment.service";

export const paymentRouter = Router();
paymentRouter.use(requireAuth);

paymentRouter.post("/businesses/:businessId/invoices/:invoiceId/payments", async (req, res) => {
  const userId = (req as AuthenticatedRequest).userId;
  if (!userId) return res.status(401).json({ error: "UNAUTHORIZED" });

  const parsed = createInvoicePaymentSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "INVALID_INPUT", details: parsed.error.flatten() });
  }

  try {
    const payment = await createInvoicePayment(userId, req.params.businessId, req.params.invoiceId, parsed.data);
    const summary = await getInvoicePaymentSummary(userId, req.params.businessId, req.params.invoiceId);
    return res.status(201).json({ payment, summary });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "INVOICE_NOT_FOUND") return res.status(404).json({ error: "INVOICE_NOT_FOUND" });
      if (error.message === "INVOICE_CANCELLED") return res.status(409).json({ error: "INVOICE_CANCELLED" });
      if (error.message === "PAYMENT_EXCEEDS_OUTSTANDING") return res.status(409).json({ error: "PAYMENT_EXCEEDS_OUTSTANDING" });
    }
    console.error("Create invoice payment error:", error);
    return res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
  }
});

paymentRouter.get("/businesses/:businessId/invoices/:invoiceId/payments", async (req, res) => {
  const userId = (req as AuthenticatedRequest).userId;
  if (!userId) return res.status(401).json({ error: "UNAUTHORIZED" });

  try {
    const payments = await listInvoicePayments(userId, req.params.businessId, req.params.invoiceId);
    const summary = await getInvoicePaymentSummary(userId, req.params.businessId, req.params.invoiceId);
    return res.status(200).json({ payments, summary });
  } catch (error) {
    if (error instanceof Error && error.message === "INVOICE_NOT_FOUND") {
      return res.status(404).json({ error: "INVOICE_NOT_FOUND" });
    }
    console.error("List invoice payments error:", error);
    return res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
  }
});
