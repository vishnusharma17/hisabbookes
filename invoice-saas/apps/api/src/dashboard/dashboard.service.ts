import { prisma } from "../lib/prisma";

export async function getDashboardSummary(userId: string, businessId: string) {
  const business = await prisma.business.findFirst({
    where: { id: businessId, userId },
    select: { id: true },
  });

  if (!business) throw new Error("BUSINESS_NOT_FOUND");

  const [
    invoiceCounts,
    invoiceTotals,
    customerCount,
    recentInvoices,
  ] = await Promise.all([
    prisma.invoice.groupBy({
      by: ["status"],
      where: { businessId },
      _count: { _all: true },
    }),
    prisma.invoice.aggregate({
      where: { businessId },
      _sum: {
        total: true,
      },
    }),
    prisma.customer.count({
      where: { businessId },
    }),
    prisma.invoice.findMany({
      where: { businessId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        invoiceNumber: true,
        status: true,
        total: true,
        invoiceDate: true,
        dueDate: true,
        customer: {
          select: { name: true, companyName: true },
        },
      },
    }),
  ]);

  const payments = await prisma.invoicePayment.aggregate({
    where: {
      invoice: { businessId },
    },
    _sum: { amount: true },
  });

  const totalInvoices = invoiceCounts.reduce(
    (sum, item) => sum + item._count._all,
    0,
  );

  const counts = {
    draft: 0,
    finalized: 0,
    paid: 0,
    pending: 0,
    overdue: 0,
    cancelled: 0,
  };

  for (const item of invoiceCounts) {
    const key = item.status.toLowerCase() as keyof typeof counts;
    if (key in counts) counts[key] = item._count._all;
  }

  const invoiceTotal = Number(invoiceTotals._sum.total ?? 0);
  const paidAmount = Number(payments._sum.amount ?? 0);
  const outstandingAmount = Math.max(0, invoiceTotal - paidAmount);

  return {
    invoices: {
      total: totalInvoices,
      draft: counts.draft,
      finalized: counts.finalized,
      paid: counts.paid,
      pending: counts.pending,
      overdue: counts.overdue,
      cancelled: counts.cancelled,
    },
    customers: {
      total: customerCount,
    },
    financials: {
      invoicedAmount: invoiceTotal,
      paidAmount,
      outstandingAmount,
    },
    recentInvoices,
  };
}
