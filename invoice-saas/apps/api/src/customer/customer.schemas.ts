import { z } from "zod";

const optionalText = (max: number) =>
  z.string().trim().max(max).optional();

export const createCustomerSchema = z.object({
  name: z.string().trim().min(1).max(200),
  companyName: optionalText(200),
  address: optionalText(500),
  state: optionalText(100),
  country: z.string().trim().min(2).max(100).default("India"),
  gstin: optionalText(15),
  email: z.string().trim().toLowerCase().email().optional(),
  phone: optionalText(30),
});

export const updateCustomerSchema = createCustomerSchema.partial();

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
