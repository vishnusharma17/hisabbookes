import { z } from "zod";

export const createInvoicePaymentSchema = z.object({
  amount: z.number().positive(),
  method: z.enum(["CASH", "BANK_TRANSFER", "UPI", "CARD", "OTHER"]).default("OTHER"),
  reference: z.string().trim().max(200).optional(),
  paidAt: z.coerce.date().optional(),
});

export type CreateInvoicePaymentInput = z.infer<typeof createInvoicePaymentSchema>;
