import { Router } from "express";
import {
  requireAuth,
  type AuthenticatedRequest,
} from "../auth/auth.middleware";
import { finalizeInvoice } from "./invoice.lifecycle";
import { buildInvoicePdf } from "./invoice.pdf";

export const invoiceFinalizeRouter = Router();
invoiceFinalizeRouter.use(requireAuth);

invoiceFinalizeRouter.post(
  "/businesses/:businessId/invoices/:invoiceId/finalize",
  async (req, res) => {
    const userId = (req as AuthenticatedRequest).userId;
    if (!userId) return res.status(401).json({ error: "UNAUTHORIZED" });

    try {
      const invoice = await finalizeInvoice(
        userId,
        req.params.businessId,
        req.params.invoiceId,
      );
      return res.status(200).json({ invoice });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "INVOICE_NOT_FOUND") {
          return res.status(404).json({ error: "INVOICE_NOT_FOUND" });
        }
        if (error.message === "INVOICE_CANCELLED") {
          return res.status(409).json({ error: "INVOICE_CANCELLED" });
        }
        if (error.message === "INVOICE_ALREADY_PAID") {
          return res.status(409).json({ error: "INVOICE_ALREADY_PAID" });
        }
      }
      console.error("Finalize invoice error:", error);
      return res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
    }
  },
);

invoiceFinalizeRouter.get(
  "/businesses/:businessId/invoices/:invoiceId/pdf",
  async (req, res) => {
    const userId = (req as AuthenticatedRequest).userId;
    if (!userId) return res.status(401).json({ error: "UNAUTHORIZED" });

    try {
      const pdf = await buildInvoicePdf(
        userId,
        req.params.businessId,
        req.params.invoiceId,
      );

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `inline; filename="${req.params.invoiceId}.pdf"`,
      );
      return res.status(200).send(pdf);
    } catch (error) {
      if (error instanceof Error && error.message === "INVOICE_NOT_FOUND") {
        return res.status(404).json({ error: "INVOICE_NOT_FOUND" });
      }
      console.error("Invoice PDF error:", error);
      return res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
    }
  },
);
