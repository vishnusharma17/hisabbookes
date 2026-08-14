import { prisma } from "../lib/prisma";

export async function finalizeInvoice(
  userId: string,
  businessId: string,
  invoiceId: string,
) {
  const invoice = await prisma.invoice.findFirst({
    where: { id: invoiceId, businessId, business: { userId } },
    select: { id: true, status: true, finalizedAt: true },
  });

  if (!invoice) throw new Error("INVOICE_NOT_FOUND");
  if (invoice.status === "CANCELLED") throw new Error("INVOICE_CANCELLED");
  if (invoice.status === "PAID") throw new Error("INVOICE_ALREADY_PAID");
  if (invoice.status === "FINALIZED") return invoice;

  return prisma.invoice.update({
    where: { id: invoiceId },
    data: {
      status: "FINALIZED",
      finalizedAt: new Date(),
    },
  });
}
