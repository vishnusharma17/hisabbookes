import { prisma } from "../lib/prisma";
import type {
  CreateInvoiceInput,
  UpdateInvoiceInput,
} from "./invoice.schemas";

function calculateItem(item: CreateInvoiceInput["items"][number]) {
  const gross = item.quantity * item.unitPrice;
  const discount = Math.min(item.discount, gross);
  const taxable = gross - discount;
  const tax = taxable * (item.taxRate / 100);

  return {
    gross,
    discount,
    taxable,
    tax,
    total: taxable + tax,
  };
}

function round(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

async function getOwnedBusiness(userId: string, businessId: string) {
  return prisma.business.findFirst({
    where: { id: businessId, userId },
    select: { id: true, invoiceNumberPrefix: true, invoiceNumberStart: true },
  });
}

export async function createInvoice(
  userId: string,
  businessId: string,
  input: CreateInvoiceInput,
) {
  const business = await getOwnedBusiness(userId, businessId);
  if (!business) throw new Error("BUSINESS_NOT_FOUND");

  const customer = await prisma.customer.findFirst({
    where: { id: input.customerId, businessId },
    select: { id: true },
  });
  if (!customer) throw new Error("CUSTOMER_NOT_FOUND");

  const lastInvoice = await prisma.invoice.findFirst({
    where: { businessId },
    orderBy: { createdAt: "desc" },
    select: { invoiceNumber: true },
  });

  const prefix = business.invoiceNumberPrefix ?? "INV";
  const fallbackNumber = business.invoiceNumberStart ?? 1;
  const lastNumeric = lastInvoice?.invoiceNumber
    ? Number(lastInvoice.invoiceNumber.replace(/^\\D+/, ""))
    : NaN;
  const nextNumeric = Number.isFinite(lastNumeric)
    ? lastNumeric + 1
    : fallbackNumber;
  const nextNumber = `${prefix}-${String(nextNumeric).padStart(4, "0")}`;

  const calculated = input.items.map(calculateItem);
  const subtotal = round(calculated.reduce((sum, item) => sum + item.gross, 0));
  const discountTotal = round(
    calculated.reduce((sum, item) => sum + item.discount, 0),
  );
  const taxTotal = round(calculated.reduce((sum, item) => sum + item.tax, 0));
  const total = round(subtotal - discountTotal + taxTotal);

  return prisma.invoice.create({
    data: {
      businessId,
      customerId: input.customerId,
      invoiceNumber: nextNumber,
      invoiceDate: input.issueDate ?? new Date(),
      dueDate: input.dueDate,
      notes: input.notes,
      subtotal,
      discount: discountTotal,
      taxableAmount: round(subtotal - discountTotal),
      cgst: round(taxTotal / 2),
      sgst: round(taxTotal / 2),
      igst: 0,
      total,
      status: "DRAFT",
      items: {
        create: input.items.map((item, index) => ({
          description: item.description,
          quantity: item.quantity,
          rate: item.unitPrice,
          taxRate: item.taxRate,
          discount: item.discount,
          amount: round(calculated[index].total),
        })),
      },
    },
    include: { items: true, customer: true },
  });
}

export async function listInvoices(userId: string, businessId: string) {
  const business = await getOwnedBusiness(userId, businessId);
  if (!business) throw new Error("BUSINESS_NOT_FOUND");

  return prisma.invoice.findMany({
    where: { businessId },
    orderBy: { createdAt: "desc" },
    include: { customer: true, items: true },
  });
}

export async function getInvoice(
  userId: string,
  businessId: string,
  invoiceId: string,
) {
  const business = await getOwnedBusiness(userId, businessId);
  if (!business) throw new Error("BUSINESS_NOT_FOUND");

  return prisma.invoice.findFirst({
    where: { id: invoiceId, businessId },
    include: { customer: true, items: true },
  });
}

export async function updateInvoice(
  userId: string,
  businessId: string,
  invoiceId: string,
  input: UpdateInvoiceInput,
) {
  const business = await getOwnedBusiness(userId, businessId);
  if (!business) throw new Error("BUSINESS_NOT_FOUND");

  const existing = await prisma.invoice.findFirst({
    where: { id: invoiceId, businessId },
    select: { id: true, status: true },
  });
  if (!existing) throw new Error("INVOICE_NOT_FOUND");

  if (existing.status === "PAID" || existing.status === "CANCELLED") {
    throw new Error("INVOICE_LOCKED");
  }

  const data = {
    ...(input.dueDate !== undefined ? { dueDate: input.dueDate } : {}),
    ...(input.notes !== undefined ? { notes: input.notes } : {}),
    ...(input.status !== undefined
      ? {
          status: input.status,
          ...(input.status === "FINALIZED" ? { finalizedAt: new Date() } : {}),
          ...(input.status === "CANCELLED" ? { cancelledAt: new Date() } : {}),
        }
      : {}),
  };

  return prisma.invoice.update({
    where: { id: invoiceId },
    data,
    include: { customer: true, items: true },
  });
}
