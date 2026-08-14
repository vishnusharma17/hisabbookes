"use client";

import { useEffect, useState } from "react";
import { apiFetch, type Dashboard } from "../lib/api";

const BUSINESS_ID = process.env.NEXT_PUBLIC_BUSINESS_ID;

function money(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!BUSINESS_ID) {
      setError("NEXT_PUBLIC_BUSINESS_ID is not configured");
      return;
    }

    apiFetch<{ dashboard: Dashboard }>(
      `/businesses/${BUSINESS_ID}/dashboard`,
    )
      .then((data) => setDashboard(data.dashboard))
      .catch((err: Error) => setError(err.message));
  }, []);

  if (error) {
    return (
      <main style={{ padding: 32 }}>
        <h1>Dashboard</h1>
        <p>{error}</p>
      </main>
    );
  }

  if (!dashboard) {
    return <main style={{ padding: 32 }}>Loading dashboard…</main>;
  }

  const cards = [
    ["Invoiced", money(dashboard.financials.invoicedAmount)],
    ["Paid", money(dashboard.financials.paidAmount)],
    ["Outstanding", money(dashboard.financials.outstandingAmount)],
    ["Customers", String(dashboard.customers.total)],
  ];

  return (
    <main style={{ padding: 32, maxWidth: 1100, margin: "0 auto" }}>
      <h1>HisabBookes Dashboard</h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gap: 16,
          marginTop: 24,
        }}
      >
        {cards.map(([label, value]) => (
          <section
            key={label}
            style={{
              border: "1px solid #ddd",
              borderRadius: 12,
              padding: 20,
            }}
          >
            <div style={{ fontSize: 13, opacity: 0.65 }}>{label}</div>
            <strong style={{ fontSize: 24 }}>{value}</strong>
          </section>
        ))}
      </div>

      <section style={{ marginTop: 32 }}>
        <h2>Invoices</h2>
        <p>
          Total {dashboard.invoices.total} · Draft {dashboard.invoices.draft} ·
          Finalized {dashboard.invoices.finalized} · Paid {dashboard.invoices.paid}
        </p>
      </section>

      <section style={{ marginTop: 32 }}>
        <h2>Recent invoices</h2>
        <div style={{ display: "grid", gap: 10 }}>
          {dashboard.recentInvoices.map((invoice) => (
            <div
              key={invoice.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 16,
                borderBottom: "1px solid #eee",
                padding: "12px 0",
              }}
            >
              <span>
                <strong>{invoice.invoiceNumber}</strong>
                {" · "}
                {invoice.customer?.companyName ?? invoice.customer?.name ?? "Customer"}
              </span>
              <span>
                {money(Number(invoice.total))} · {invoice.status}
              </span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
