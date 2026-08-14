import PDFDocument from "pdfkit";
import { prisma } from "../lib/prisma";

function money(value: unknown) {
  return `₹${Number(value).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function date(value: Date | null | undefined) {
  return value ? value.toISOString().slice(0, 10) : "-";
}

export async function buildInvoicePdf(
  userId: string,
  businessId: string,
  invoiceId: string,
) {
  const invoice = await prisma.invoice.findFirst({
    where: {
      id: invoiceId,
      businessId,
      business: { userId },
    },
    include: {
      business: true,
      customer: true,
      items: true,
    },
  });

  if (!invoice) throw new Error("INVOICE_NOT_FOUND");

  const doc = new PDFDocument({
    size: "A4",
    margin: 48,
    info: {
      Title: `Invoice ${invoice.invoiceNumber}`,
      Author: invoice.business.displayName || invoice.business.legalName,
      Subject: "Tax Invoice",
    },
  });

  const chunks: Buffer[] = [];

  return new Promise<Buffer>((resolve, reject) => {
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const left = 48;
    const right = 547;
    const contentWidth = right - left;

    // Header
    doc
      .fontSize(22)
      .font("Helvetica-Bold")
      .text(
        invoice.business.displayName || invoice.business.legalName,
        left,
        48,
        { width: 300 },
      );

    doc
      .fontSize(9)
      .font("Helvetica")
      .fillColor("#555555");

    const businessLines = [
      invoice.business.address,
      invoice.business.state,
      invoice.business.country,
      invoice.business.gstin
        ? `GSTIN: ${invoice.business.gstin}`
        : null,
      invoice.business.contactEmail,
      invoice.business.phone,
    ].filter(Boolean) as string[];

    let businessY = 78;

    for (const line of businessLines) {
      doc.text(line, left, businessY);
      businessY += 13;
    }

    // Invoice heading block
    doc
      .fillColor("#111111")
      .font("Helvetica-Bold")
      .fontSize(25)
      .text("TAX INVOICE", 340, 52, {
        width: 207,
        align: "right",
      });

    doc
      .font("Helvetica-Bold")
      .fontSize(12)
      .text(invoice.invoiceNumber, 340, 84, {
        width: 207,
        align: "right",
      });

    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor("#555555")
      .text(`Invoice Date: ${date(invoice.invoiceDate)}`, 340, 104, {
        width: 207,
        align: "right",
      });

    doc.text(`Due Date: ${date(invoice.dueDate)}`, 340, 118, {
      width: 207,
      align: "right",
    });

    doc.text(`Status: ${invoice.status}`, 340, 132, {
      width: 207,
      align: "right",
    });

    // Divider
    doc
      .moveTo(left, 164)
      .lineTo(right, 164)
      .lineWidth(1)
      .strokeColor("#dddddd")
      .stroke();

    // Bill To
    doc
      .fillColor("#111111")
      .font("Helvetica-Bold")
      .fontSize(10)
      .text("BILL TO", left, 184);

    doc
      .font("Helvetica-Bold")
      .fontSize(12)
      .text(invoice.customer?.name || "Customer", left, 202);

    doc.font("Helvetica").fontSize(9).fillColor("#555555");

    let customerY = 220;

    if (invoice.customer?.companyName) {
      doc.text(invoice.customer.companyName, left, customerY);
      customerY += 13;
    }

    if (invoice.customer?.address) {
      doc.text(invoice.customer.address, left, customerY);
      customerY += 13;
    }

    if (invoice.customer?.state) {
      doc.text(invoice.customer.state, left, customerY);
      customerY += 13;
    }

    if (invoice.customer?.gstin) {
      doc.text(`GSTIN: ${invoice.customer.gstin}`, left, customerY);
    }

    // Items table
    const tableTop = 275;
    const columns = {
      description: left,
      qty: 330,
      rate: 370,
      discount: 425,
      tax: 475,
      amount: 520,
    };

    doc
      .rect(left, tableTop, contentWidth, 26)
      .fill("#f3f4f6");

    doc
      .fillColor("#333333")
      .font("Helvetica-Bold")
      .fontSize(8)
      .text("DESCRIPTION", columns.description + 8, tableTop + 9)
      .text("QTY", columns.qty, tableTop + 9, { width: 35, align: "right" })
      .text("RATE", columns.rate, tableTop + 9, { width: 45, align: "right" })
      .text("DISC.", columns.discount, tableTop + 9, {
        width: 45,
        align: "right",
      })
      .text("TAX", columns.tax, tableTop + 9, {
        width: 35,
        align: "right",
      })
      .text("AMOUNT", 485, tableTop + 9, {
        width: 54,
        align: "right",
      });

    let y = tableTop + 26;

    invoice.items.forEach((item) => {
      const rowHeight = 30;

      doc
        .moveTo(left, y + rowHeight)
        .lineTo(right, y + rowHeight)
        .lineWidth(0.5)
        .strokeColor("#eeeeee")
        .stroke();

      doc
        .fillColor("#222222")
        .font("Helvetica")
        .fontSize(8)
        .text(item.description, left + 8, y + 10, {
          width: 270,
          ellipsis: true,
        })
        .text(item.quantity.toString(), columns.qty, y + 10, {
          width: 35,
          align: "right",
        })
        .text(money(item.rate), columns.rate, y + 10, {
          width: 45,
          align: "right",
        })
        .text(money(item.discount), columns.discount, y + 10, {
          width: 45,
          align: "right",
        })
        .text(`${Number(item.taxRate)}%`, columns.tax, y + 10, {
          width: 35,
          align: "right",
        })
        .font("Helvetica-Bold")
        .text(money(item.amount), 485, y + 10, {
          width: 54,
          align: "right",
        });

      y += rowHeight;
    });

    // Totals
    y += 22;

    const totalsX = 365;
    const valueX = 485;

    const totalRow = (label: string, value: string, bold = false) => {
      doc
        .font(bold ? "Helvetica-Bold" : "Helvetica")
        .fontSize(bold ? 10 : 9)
        .fillColor("#222222")
        .text(label, totalsX, y, { width: 110, align: "right" })
        .text(value, valueX, y, { width: 62, align: "right" });

      y += bold ? 22 : 16;
    };

    totalRow("Subtotal", money(invoice.subtotal));
    totalRow("Discount", money(invoice.discount));
    totalRow("Taxable Amount", money(invoice.taxableAmount));
    totalRow("CGST", money(invoice.cgst));
    totalRow("SGST", money(invoice.sgst));

    doc
      .moveTo(totalsX, y - 5)
      .lineTo(right, y - 5)
      .lineWidth(1)
      .strokeColor("#cccccc")
      .stroke();

    totalRow("TOTAL", money(invoice.total), true);

    // Footer
    const footerY = 760;

    doc
      .moveTo(left, footerY - 12)
      .lineTo(right, footerY - 12)
      .lineWidth(0.5)
      .strokeColor("#dddddd")
      .stroke();

    doc
      .font("Helvetica")
      .fontSize(8)
      .fillColor("#777777")
      .text(
        "Generated by HisabBookes",
        left,
        footerY,
        { width: contentWidth / 2 },
      );

    // Keep the footer intentionally minimal and professional.

    doc.end();
  });
}
