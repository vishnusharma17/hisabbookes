import { prisma } from "../lib/prisma";
import type { CreateInvoicePaymentInput } from "./payment.schemas";

async function ownedInvoice(userId: string, businessId: string, invoiceId: string) {
  return prisma.invoice.findFirst({
    where: { id: invoiceId, businessId, business: { userId } },
    select: { id: true, total: true, status: true },
  });
}

export async function createInvoicePayment(
  userId: string,
  businessId: string,
  invoiceId: string,
  input: CreateInvoicePaymentInput,
) {
  const invoice = await ownedInvoice(userId, businessId, invoiceId);
  if (!invoice) throw new Error("INVOICE_NOT_FOUND");
  if (invoice.status === "CANCELLED") throw new Error("INVOICE_CANCELLED");

  const existing = await prisma.invoicePayment.aggregate({
    where: { invoiceId },
    _sum: { amount: true },
  });

  const paid = Number(existing._sum.amount ?? 0);
  const total = Number(invoice.total);
  const outstanding = Math.max(0, total - paid);

  if (input.amount > outstanding) throw new Error("PAYMENT_EXCEEDS_OUTSTANDING");

  const payment = await prisma.invoicePayment.create({
    data: {
      invoiceId,
      amount: input.amount,
      method: input.method,
      reference: input.reference,
      paidAt: input.paidAt ?? new Date(),
    },
  });

  if (paid + input.amount >= total) {
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: { status: "PAID" },
    });
  }

  return payment;
}

export async function listInvoicePayments(userId: string, businessId: string, invoiceId: string) {
  if (!(await ownedInvoice(userId, businessId, invoiceId))) {
    throw new Error("INVOICE_NOT_FOUND");
  }

  return prisma.invoicePayment.findMany({
    where: { invoiceId },
    orderBy: { paidAt: "desc" },
  });
}

export async function getInvoicePaymentSummary(userId: string, businessId: string, invoiceId: string) {
  const invoice = await ownedInvoice(userId, businessId, invoiceId);
  if (!invoice) throw new Error("INVOICE_NOT_FOUND");

  const aggregate = await prisma.invoicePayment.aggregate({
    where: { invoiceId },
    _sum: { amount: true },
  });

  const total = Number(invoice.total);
  const paidAmount = Number(aggregate._sum.amount ?? 0);
  const outstandingAmount = Math.max(0, total - paidAmount);

  return {
    total,
    paidAmount,
    outstandingAmount,
    paymentStatus: paidAmount >= total ? "PAID" : paidAmount > 0 ? "PARTIAL" : "UNPAID",
  };
}
