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

function dateText(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function statusClass(status: string) {
  return `dashboard-status dashboard-status-${status.toLowerCase()}`;
}

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!BUSINESS_ID) {
      setError("NEXT_PUBLIC_BUSINESS_ID is not configured");
      return;
    }

    apiFetch<{ dashboard: Dashboard }>(`/businesses/${BUSINESS_ID}/dashboard`)
      .then((data) => setDashboard(data.dashboard))
      .catch((err: Error) => setError(err.message));
  }, []);

  if (error) {
    return (
      <main className="dashboard-main">
        <div className="dashboard-modern-error">
          <span className="dashboard-kicker">Dashboard</span>
          <h2>Unable to load dashboard</h2>
          <p>{error}</p>
          <Link className="button" href="/login">Sign in again</Link>
        </div>
      </main>
    );
  }

  if (!dashboard) {
    return (
      <main className="dashboard-main">
        <div className="dashboard-modern-loading">
          <span className="dashboard-loading-dot" />
          Loading dashboard…
        </div>
      </main>
    );
  }

  const invoiced = dashboard.financials.invoicedAmount;
  const paid = dashboard.financials.paidAmount;
  const outstanding = dashboard.financials.outstandingAmount;
  const collectionPercent = invoiced > 0 ? Math.min(100, (paid / invoiced) * 100) : 0;

  const cards = [
    ["Total invoiced", money(invoiced), `${dashboard.invoices.total} invoice${dashboard.invoices.total === 1 ? "" : "s"}`, "dashboard-card-primary"],
    ["Collected", money(paid), `${dashboard.invoices.paid} paid invoice${dashboard.invoices.paid === 1 ? "" : "s"}`, "dashboard-card-success"],
    ["Outstanding", money(outstanding), dashboard.invoices.overdue > 0 ? `${dashboard.invoices.overdue} overdue` : "Nothing overdue", outstanding > 0 ? "dashboard-card-warning" : "dashboard-card-success"],
    ["Customers", String(dashboard.customers.total), "Active customers", "dashboard-card-neutral"],
  ];

  const statuses: [string, string, number][] = [
    ["draft", "Draft", dashboard.invoices.draft],
    ["finalized", "Finalized", dashboard.invoices.finalized],
    ["paid", "Paid", dashboard.invoices.paid],
    ["pending", "Pending", dashboard.invoices.pending],
    ["overdue", "Overdue", dashboard.invoices.overdue],
    ["cancelled", "Cancelled", dashboard.invoices.cancelled],
  ];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link href="/" className="side-brand">HisabBookes</Link>
        <div className="side-label">Workspace</div>
        <nav className="side-nav">
          <Link className="active" href="/dashboard">Overview</Link>
          <Link href="/invoices">Invoices</Link>
          <Link href="/customers">Customers</Link>
          <Link href="/invoice/new">Create invoice</Link>
          <Link href="/business-profile">Business profile</Link>
        </nav>
        <div className="side-bottom">
          <div className="dashboard-plan-card">
            <span>FREE PLAN</span>
            <strong>{dashboard.invoices.total} invoice{dashboard.invoices.total === 1 ? "" : "s"}</strong>
            <small>Upgrade when your business grows.</small>
          </div>
          <Link href="/" className="back-link">← Back to website</Link>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-modern-header">
          <div>
            <span className="dashboard-kicker">Workspace overview</span>
            <h1>Good afternoon.</h1>
            <p>Here&apos;s what&apos;s happening with your billing today.</p>
          </div>
          <div className="dashboard-header-actions">
            <Link className="button button-ghost" href="/customers">Customers</Link>
            <Link className="button" href="/invoice/new">+ Create invoice</Link>
          </div>
        </header>

        <section className="dashboard-stat-grid">
          {cards.map(([label, value, note, className]) => (
            <article className={`dashboard-modern-stat ${className}`} key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
              <small>{note}</small>
            </article>
          ))}
        </section>

        <section className="dashboard-main-grid">
          <div className="panel dashboard-status-panel">
            <div className="dashboard-panel-head">
              <div>
                <span className="dashboard-kicker">Overview</span>
                <h2>Invoice status</h2>
                <p>Current status across all invoices.</p>
              </div>
              <Link className="text-link" href="/invoices">View all →</Link>
            </div>
            <div className="dashboard-status-grid">
              {statuses.map(([key, label, value]) => (
                <div className="dashboard-status-item" key={key}>
                  <span className={`dashboard-status-dot ${key}`} />
                  <div><strong>{value}</strong><span>{label}</span></div>
                </div>
              ))}
            </div>
          </div>

          <div className="panel dashboard-collection-panel">
            <div className="dashboard-panel-head">
              <div>
                <span className="dashboard-kicker">Cash collection</span>
                <h2>Collection</h2>
                <p>How much of your invoiced amount is collected.</p>
              </div>
            </div>
            <div className="dashboard-collection-total">
              <strong>{Math.round(collectionPercent)}%</strong>
              <span>collected</span>
            </div>
            <div className="dashboard-progress">
              <span style={{ width: `${collectionPercent}%` }} />
            </div>
            <div className="dashboard-collection-values">
              <div><span>Collected</span><strong>{money(paid)}</strong></div>
              <div><span>Outstanding</span><strong>{money(outstanding)}</strong></div>
            </div>
          </div>
        </section>

        <section className="panel dashboard-recent-panel">
          <div className="dashboard-panel-head">
            <div>
              <span className="dashboard-kicker">Activity</span>
              <h2>Recent invoices</h2>
              <p>Your latest billing activity.</p>
            </div>
            <Link className="text-link" href="/invoices">View all invoices →</Link>
          </div>

          {dashboard.recentInvoices.length === 0 ? (
            <div className="dashboard-empty-modern">
              <div className="dashboard-empty-icon">+</div>
              <div>
                <h3>No invoices yet</h3>
                <p>Create your first invoice to start tracking billing.</p>
              </div>
              <Link className="button button-small" href="/invoice/new">Create invoice</Link>
            </div>
          ) : (
            <div className="dashboard-invoice-table">
              <div className="dashboard-table-row dashboard-table-head">
                <span>Invoice</span><span>Customer</span><span>Date</span><span>Total</span><span>Status</span>
              </div>
              {dashboard.recentInvoices.map((invoice) => (
                <div className="dashboard-table-row" key={invoice.id}>
                  <strong>{invoice.invoiceNumber}</strong>
                  <span>{invoice.customer?.companyName ?? invoice.customer?.name ?? "Customer"}</span>
                  <span>{dateText(invoice.invoiceDate)}</span>
                  <strong>{money(Number(invoice.total))}</strong>
                  <span><em className={statusClass(invoice.status)}>{invoice.status}</em></span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="dashboard-next-step">
          <div>
            <span className="dashboard-kicker">Next step</span>
            <h2>Create your next invoice</h2>
            <p>Add your customer and services, preview the totals, then finalize and collect payment.</p>
          </div>
          <Link className="button" href="/invoice/new">Create invoice →</Link>
        </section>
      </main>
    </div>
  );
}
