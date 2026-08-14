import { z } from "zod";

const itemSchema = z.object({
  description: z.string().trim().min(1).max(500),
  quantity: z.number().positive(),
  unitPrice: z.number().nonnegative(),
  taxRate: z.number().min(0).max(100).default(0),
  discount: z.number().min(0).default(0),
});

export const createInvoiceSchema = z.object({
  customerId: z.string().min(1),
  issueDate: z.coerce.date().optional(),
  dueDate: z.coerce.date().optional(),
  notes: z.string().trim().max(2000).optional(),
  items: z.array(itemSchema).min(1),
});

export const updateInvoiceSchema = z.object({
  dueDate: z.coerce.date().optional(),
  notes: z.string().trim().max(2000).optional(),
  status: z.enum(["DRAFT", "FINALIZED", "PAID", "PENDING", "OVERDUE", "CANCELLED"]).optional(),
});

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
export type UpdateInvoiceInput = z.infer<typeof updateInvoiceSchema>;
