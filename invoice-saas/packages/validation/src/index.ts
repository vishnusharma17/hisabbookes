import { z } from "zod";

export const invoiceItemSchema = z.object({
  description: z.string().trim().min(1).max(500),
  hsnSac: z.string().trim().max(50).optional(),
  quantity: z.number().positive(),
  rate: z.number().nonnegative(),
  discount: z.number().nonnegative(),
  taxRate: z.number().nonnegative()
});

export const invoiceSchema = z.object({
  invoiceNumber: z.string().trim().min(1).max(100),
  invoiceDate: z.string(),
  dueDate: z.string().optional(),
  items: z.array(invoiceItemSchema).min(1),
  currency: z.string().length(3).default("INR")
});
