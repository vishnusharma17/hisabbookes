import { Router } from "express";
import {
  requireAuth,
  type AuthenticatedRequest,
} from "../auth/auth.middleware";
import {
  createInvoiceSchema,
  updateInvoiceSchema,
} from "./invoice.schemas";
import {
  createInvoice,
  getInvoice,
  listInvoices,
  updateInvoice,
} from "./invoice.service";

export const invoiceRouter = Router();
invoiceRouter.use(requireAuth);

invoiceRouter.post("/businesses/:businessId/invoices", async (req, res) => {
  const userId = (req as AuthenticatedRequest).userId;
  if (!userId) return res.status(401).json({ error: "UNAUTHORIZED" });

  const parsed = createInvoiceSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: "INVALID_INPUT",
      details: parsed.error.flatten(),
    });
  }

  try {
    const invoice = await createInvoice(
      userId,
      req.params.businessId,
      parsed.data,
    );
    return res.status(201).json({ invoice });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "BUSINESS_NOT_FOUND") {
        return res.status(404).json({ error: "BUSINESS_NOT_FOUND" });
      }
      if (error.message === "CUSTOMER_NOT_FOUND") {
        return res.status(404).json({ error: "CUSTOMER_NOT_FOUND" });
      }
    }
    console.error("Create invoice error:", error);
    return res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
  }
});

invoiceRouter.get("/businesses/:businessId/invoices", async (req, res) => {
  const userId = (req as AuthenticatedRequest).userId;
  if (!userId) return res.status(401).json({ error: "UNAUTHORIZED" });

  try {
    return res.status(200).json({
      invoices: await listInvoices(userId, req.params.businessId),
    });
  } catch (error) {
    if (error instanceof Error && error.message === "BUSINESS_NOT_FOUND") {
      return res.status(404).json({ error: "BUSINESS_NOT_FOUND" });
    }
    console.error("List invoices error:", error);
    return res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
  }
});

invoiceRouter.get(
  "/businesses/:businessId/invoices/:invoiceId",
  async (req, res) => {
    const userId = (req as AuthenticatedRequest).userId;
    if (!userId) return res.status(401).json({ error: "UNAUTHORIZED" });

    try {
      const invoice = await getInvoice(
        userId,
        req.params.businessId,
        req.params.invoiceId,
      );

      if (!invoice) {
        return res.status(404).json({ error: "INVOICE_NOT_FOUND" });
      }

      return res.status(200).json({ invoice });
    } catch (error) {
      if (error instanceof Error && error.message === "BUSINESS_NOT_FOUND") {
        return res.status(404).json({ error: "BUSINESS_NOT_FOUND" });
      }
      console.error("Get invoice error:", error);
      return res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
    }
  },
);

invoiceRouter.patch(
  "/businesses/:businessId/invoices/:invoiceId",
  async (req, res) => {
    const userId = (req as AuthenticatedRequest).userId;
    if (!userId) return res.status(401).json({ error: "UNAUTHORIZED" });

    const parsed = updateInvoiceSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: "INVALID_INPUT",
        details: parsed.error.flatten(),
      });
    }

    try {
      const invoice = await updateInvoice(
        userId,
        req.params.businessId,
        req.params.invoiceId,
        parsed.data,
      );
      return res.status(200).json({ invoice });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "BUSINESS_NOT_FOUND") {
          return res.status(404).json({ error: "BUSINESS_NOT_FOUND" });
        }
        if (error.message === "INVOICE_NOT_FOUND") {
          return res.status(404).json({ error: "INVOICE_NOT_FOUND" });
        }
        if (error.message === "INVOICE_LOCKED") {
          return res.status(409).json({ error: "INVOICE_LOCKED" });
        }
      }
      console.error("Update invoice error:", error);
      return res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
    }
  },
);
