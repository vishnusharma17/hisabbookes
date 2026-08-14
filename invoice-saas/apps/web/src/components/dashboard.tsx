"use client";

import Link from "next/link";
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

function statusClass(status: string) {
  return `status status-${status.toLowerCase()}`;
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
      <main className="dashboard-main">
        <div className="panel dashboard-error">
          <h2>Unable to load dashboard</h2>
          <p>{error}</p>
          <Link className="button button-small" href="/login">
            Sign in again
          </Link>
        </div>
      </main>
    );
  }

  if (!dashboard) {
    return (
      <main className="dashboard-main">
        <div className="dashboard-loading">Loading dashboard…</div>
      </main>
    );
  }

  const cards = [
    {
      label: "Invoiced",
      value: money(dashboard.financials.invoicedAmount),
      note: `${dashboard.invoices.total} total invoice${dashboard.invoices.total === 1 ? "" : "s"}`,
      tone: "blue",
    },
    {
      label: "Paid",
      value: money(dashboard.financials.paidAmount),
      note: `${dashboard.invoices.paid} paid invoice${dashboard.invoices.paid === 1 ? "" : "s"}`,
      tone: "green",
    },
    {
      label: "Outstanding",
      value: money(dashboard.financials.outstandingAmount),
      note: `${dashboard.invoices.overdue} overdue`,
      tone: dashboard.financials.outstandingAmount > 0 ? "amber" : "green",
    },
    {
      label: "Customers",
      value: String(dashboard.customers.total),
      note: "Active customers",
      tone: "slate",
    },
  ];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link href="/" className="side-brand">
          HisabBookes
        </Link>

        <div className="side-label">Workspace</div>

        <nav className="side-nav">
          <Link className="active" href="/dashboard">Overview</Link>
          <Link href="/invoices">Invoices</Link>
          <Link href="/customers">Customers</Link>
          <Link href="/invoice/new">Create invoice</Link>
        </nav>

        <div className="side-bottom">
          <div className="plan-card">
            <span>FREE PLAN</span>
            <strong>{dashboard.invoices.total} invoice{dashboard.invoices.total === 1 ? "" : "s"}</strong>
            <small>Upgrade when you need more.</small>
          </div>
          <Link href="/" className="back-link">← Back to website</Link>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="dash-header">
          <div>
            <span className="eyebrow">Workspace overview</span>
            <h1>Good afternoon.</h1>
            <p>Your billing activity at a glance.</p>
          </div>
          <Link className="button" href="/invoice/new">
            + Create invoice
          </Link>
        </header>

        <section className="stat-grid">
          {cards.map((card) => (
            <article className={`stat-card stat-${card.tone}`} key={card.label}>
              <span>{card.label}</span>
              <strong>{card.value}</strong>
              <small>{card.note}</small>
            </article>
          ))}
        </section>

        <section className="dashboard-grid">
          <div className="panel">
            <div className="panel-head">
              <div>
                <h2>Invoice status</h2>
                <p>Current status across all invoices.</p>
              </div>
              <Link className="text-link" href="/invoices">View all</Link>
            </div>

            <div className="status-summary">
              <div><strong>{dashboard.invoices.draft}</strong><span>Draft</span></div>
              <div><strong>{dashboard.invoices.finalized}</strong><span>Finalized</span></div>
              <div><strong>{dashboard.invoices.paid}</strong><span>Paid</span></div>
              <div><strong>{dashboard.invoices.pending}</strong><span>Pending</span></div>
              <div><strong>{dashboard.invoices.overdue}</strong><span>Overdue</span></div>
              <div><strong>{dashboard.invoices.cancelled}</strong><span>Cancelled</span></div>
            </div>
          </div>

          <div className="panel collection-panel">
            <div className="panel-head">
              <div>
                <h2>Collection</h2>
                <p>Paid vs outstanding.</p>
              </div>
            </div>
            <div className="collection-values">
              <div>
                <span>Collected</span>
                <strong>{money(dashboard.financials.paidAmount)}</strong>
              </div>
              <div>
                <span>Due</span>
                <strong>{money(dashboard.financials.outstandingAmount)}</strong>
              </div>
            </div>
            <div className="collection-bar">
              <span
                style={{
                  width:
                    dashboard.financials.invoicedAmount > 0
                      ? `${Math.min(
                          100,
                          (dashboard.financials.paidAmount /
                            dashboard.financials.invoicedAmount) *
                            100,
                        )}%`
                      : "0%",
                }}
              />
            </div>
          </div>
        </section>

        <section className="panel">
          <div className="panel-head">
            <div>
              <h2>Recent invoices</h2>
              <p>Your latest billing activity.</p>
            </div>
            <Link className="text-link" href="/invoices">View all invoices</Link>
          </div>

          {dashboard.recentInvoices.length === 0 ? (
            <div className="dashboard-empty">
              <div className="empty-icon">+</div>
              <div>
                <h3>No invoices yet</h3>
                <p>Create your first invoice to start tracking billing.</p>
              </div>
              <Link className="button button-small" href="/invoice/new">
                Create invoice
              </Link>
            </div>
          ) : (
            <div className="invoice-table">
              <div className="table-row table-head">
                <span>Invoice</span>
                <span>Customer</span>
                <span>Date</span>
                <span>Total</span>
                <span>Status</span>
              </div>

              {dashboard.recentInvoices.map((invoice) => (
                <div className="table-row" key={invoice.id}>
                  <strong>{invoice.invoiceNumber}</strong>
                  <span>
                    {invoice.customer?.companyName ??
                      invoice.customer?.name ??
                      "Customer"}
                  </span>
                  <span>
                    {new Intl.DateTimeFormat("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    }).format(new Date(invoice.invoiceDate))}
                  </span>
                  <span>{money(Number(invoice.total))}</span>
                  <span>
                    <em className={statusClass(invoice.status)}>
                      {invoice.status}
                    </em>
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="empty-panel">
          <div className="empty-icon">+</div>
          <div>
            <h2>Ready for your next invoice?</h2>
            <p>Add your customer and services, preview the invoice, then finalize it.</p>
          </div>
          <Link className="button button-small" href="/invoice/new">
            Create invoice
          </Link>
        </section>
      </main>
    </div>
  );
}
