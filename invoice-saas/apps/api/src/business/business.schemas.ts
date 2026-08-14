import { z } from "zod";

export const createBusinessSchema = z.object({
  legalName: z.string().trim().min(1).max(200),
  displayName: z.string().trim().max(200).optional(),
  address: z.string().trim().max(500).optional(),
  state: z.string().trim().max(100).optional(),
  country: z.string().trim().min(2).max(100).default("India"),
  gstin: z.string().trim().max(15).optional(),
  contactEmail: z.string().trim().toLowerCase().email().optional(),
  phone: z.string().trim().max(30).optional(),
});
export const updateBusinessSchema = createBusinessSchema.partial();
export type CreateBusinessInput = z.infer<typeof createBusinessSchema>;
export type UpdateBusinessInput = z.infer<typeof updateBusinessSchema>;
