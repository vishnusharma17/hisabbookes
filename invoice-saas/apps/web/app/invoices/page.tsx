"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../src/lib/api";

const BUSINESS_ID = process.env.NEXT_PUBLIC_BUSINESS_ID;

type Customer = { id: string; name: string; companyName: string | null };
type Invoice = {
  id: string; invoiceNumber: string; status: string; total: string;
  invoiceDate: string; dueDate: string | null; customer: Customer | null;
};
type Item = { description: string; quantity: number; unitPrice: number; taxRate: number; discount: number };
type Payment = { id: string; amount: string; method: string; reference: string | null; paidAt: string };
type PaymentSummary = {
  total: number; paidAmount: number; outstandingAmount: number;
  paymentStatus: "UNPAID" | "PARTIAL" | "PAID";
};

const emptyItem = (): Item => ({ description: "", quantity: 1, unitPrice: 0, taxRate: 18, discount: 0 });
const money = (n: number) => `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const dateText = (v?: string | null) => {
  if (!v) return "—";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<Item[]>([emptyItem()]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [paymentInvoiceId, setPaymentInvoiceId] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [paymentReference, setPaymentReference] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [paymentSummary, setPaymentSummary] = useState<PaymentSummary | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  async function loadData() {
    if (!BUSINESS_ID) { setError("NEXT_PUBLIC_BUSINESS_ID is not configured"); setLoading(false); return; }
    try {
      const [a, b] = await Promise.all([
        apiFetch<{ invoices: Invoice[] }>(`/businesses/${BUSINESS_ID}/invoices`),
        apiFetch<{ customers: Customer[] }>(`/businesses/${BUSINESS_ID}/customers`),
      ]);
      setInvoices(a.invoices); setCustomers(b.customers);
      if (!customerId && b.customers.length) setCustomerId(b.customers[0].id);
      setError("");
    } catch (e) { setError(e instanceof Error ? e.message : "LOAD_FAILED"); }
    finally { setLoading(false); }
  }
  useEffect(() => { void loadData(); }, []);

  const preview = useMemo(() => {
    let subtotal = 0, discount = 0, tax = 0;
    for (const item of items) {
      const gross = Math.max(0, item.quantity) * Math.max(0, item.unitPrice);
      const disc = Math.min(Math.max(0, item.discount), gross);
      subtotal += gross; discount += disc;
      tax += (gross - disc) * (Math.max(0, item.taxRate) / 100);
    }
    return { subtotal, discount, taxable: subtotal - discount, tax, total: subtotal - discount + tax };
  }, [items]);

  function updateItem(i: number, key: keyof Item, value: string) {
    setItems(cur => cur.map((x, n) => n !== i ? x : {
      ...x, [key]: key === "description" ? value : Math.max(0, Number(value) || 0)
    }));
  }
  function addItem() { setItems(cur => [...cur, emptyItem()]); }
  function removeItem(i: number) { setItems(cur => cur.length === 1 ? cur : cur.filter((_, n) => n !== i)); }

  async function createInvoice(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!BUSINESS_ID || !customerId) { setError("Select a customer first."); return; }
    if (items.some(x => !x.description.trim())) { setError("Every invoice item needs a description."); return; }
    setSaving(true); setError("");
    try {
      await apiFetch(`/businesses/${BUSINESS_ID}/invoices`, {
        method: "POST",
        body: JSON.stringify({
          customerId, ...(issueDate ? { issueDate } : {}),
          ...(dueDate ? { dueDate } : {}), ...(notes.trim() ? { notes: notes.trim() } : {}),
          items: items.map(x => ({ description: x.description.trim(), quantity: x.quantity, unitPrice: x.unitPrice, taxRate: x.taxRate, discount: x.discount })),
        }),
      });
      setItems([emptyItem()]); setNotes(""); setIssueDate(""); setDueDate(""); await loadData();
    } catch (e) { setError(e instanceof Error ? e.message : "CREATE_FAILED"); }
    finally { setSaving(false); }
  }

  async function loadPayments(id: string) {
    if (!BUSINESS_ID) return;
    setPaymentLoading(true); setPaymentError("");
    try {
      const d = await apiFetch<{ payments: Payment[]; summary: PaymentSummary }>(`/businesses/${BUSINESS_ID}/invoices/${id}/payments`);
      setPayments(d.payments); setPaymentSummary(d.summary);
    } catch (e) { setPaymentError(e instanceof Error ? e.message : "PAYMENTS_LOAD_FAILED"); }
    finally { setPaymentLoading(false); }
  }

  function startPayment(id: string) {
    setPaymentInvoiceId(id); setPaymentAmount(""); setPaymentMethod("UPI"); setPaymentReference("");
    setPaymentDate(new Date().toISOString().slice(0, 10)); setPaymentSummary(null); setPayments([]); void loadPayments(id);
  }

  function closePayment() { setPaymentInvoiceId(null); setPaymentSummary(null); setPayments([]); setPaymentError(""); }

  async function recordPayment(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!BUSINESS_ID || !paymentInvoiceId) return;
    const amount = Number(paymentAmount);
    if (!Number.isFinite(amount) || amount <= 0) { setPaymentError("Enter a valid payment amount."); return; }
    if (paymentSummary && amount > paymentSummary.outstandingAmount) { setPaymentError(`Maximum payment allowed is ${money(paymentSummary.outstandingAmount)}.`); return; }
    setPaymentLoading(true); setPaymentError("");
    try {
      const d = await apiFetch<{ payment: Payment; summary: PaymentSummary }>(`/businesses/${BUSINESS_ID}/invoices/${paymentInvoiceId}/payments`, {
        method: "POST",
        body: JSON.stringify({
          amount, method: paymentMethod,
          ...(paymentReference.trim() ? { reference: paymentReference.trim() } : {}),
          ...(paymentDate ? { paidAt: `${paymentDate}T00:00:00` } : {}),
        }),
      });
      setPaymentSummary(d.summary); setPaymentAmount(""); setPaymentReference("");
      await loadPayments(paymentInvoiceId); await loadData();
    } catch (e) { setPaymentError(e instanceof Error ? e.message : "PAYMENT_FAILED"); }
    finally { setPaymentLoading(false); }
  }

  async function finalizeInvoice(id: string) {
    if (!BUSINESS_ID) return;
    try { await apiFetch(`/businesses/${BUSINESS_ID}/invoices/${id}/finalize`, { method: "POST" }); await loadData(); }
    catch (e) { setError(e instanceof Error ? e.message : "FINALIZE_FAILED"); }
  }

  async function openPdf(id: string) {
    if (!BUSINESS_ID) return;
    const token = localStorage.getItem("hisabbookes_access_token");
    const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";
    const r = await fetch(`${base}/businesses/${BUSINESS_ID}/invoices/${id}/pdf`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
    if (!r.ok) { setError("PDF_DOWNLOAD_FAILED"); return; }
    const url = URL.createObjectURL(await r.blob()); window.open(url, "_blank", "noopener,noreferrer");
  }

  if (loading) return <main style={{ maxWidth: 1180, margin: "0 auto", padding: 32 }}>Loading invoices…</main>;

  return (
    <main style={page}>
      <div style={wrap}>
        <header style={header}>
          <div><div style={kicker}>Billing workspace</div><h1 style={h1}>Invoices</h1><p style={muted}>Create, finalize, collect and open your invoices.</p></div>
          <div style={{ display: "flex", gap: 10 }}><a href="/customers" style={linkBtn}>Customers</a><a href="/dashboard" style={linkBtn}>Dashboard</a></div>
        </header>

        {error && <div style={errorBox}>{error}</div>}

        <section style={card}>
          <div style={sectionHead}><div><div style={kicker}>Create</div><h2 style={h2}>New invoice</h2><p style={muted}>Add the customer, dates and services. Totals update automatically.</p></div></div>
          {customers.length === 0 ? <div style={empty}><strong>No customers found.</strong><p style={muted}>Create a customer before creating an invoice.</p><a href="/customers" style={primaryLink}>Create customer</a></div> : (
            <form onSubmit={createInvoice}>
              <div style={grid3}>
                <label style={label}>Customer<select value={customerId} onChange={e => setCustomerId(e.target.value)} style={input} required><option value="">Select customer</option>{customers.map(c => <option key={c.id} value={c.id}>{c.companyName ? `${c.companyName} — ${c.name}` : c.name}</option>)}</select></label>
                <label style={label}>Invoice date<input type="date" value={issueDate} onChange={e => setIssueDate(e.target.value)} style={input}/></label>
                <label style={label}>Due date<input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} style={input}/></label>
              </div>

              <div style={table}>
                <div style={tableHead}><span>Description</span><span>Qty</span><span>Rate</span><span>Discount</span><span>Tax %</span><span/></div>
                {items.map((item, i) => <div style={tableRow} key={i}>
                  <input value={item.description} onChange={e => updateItem(i, "description", e.target.value)} placeholder="Website development" style={input}/>
                  <input type="number" min="0.01" step="0.01" value={item.quantity} onChange={e => updateItem(i, "quantity", e.target.value)} style={input}/>
                  <input type="number" min="0" step="0.01" value={item.unitPrice} onChange={e => updateItem(i, "unitPrice", e.target.value)} style={input}/>
                  <input type="number" min="0" step="0.01" value={item.discount} onChange={e => updateItem(i, "discount", e.target.value)} style={input}/>
                  <select value={item.taxRate} onChange={e => updateItem(i, "taxRate", e.target.value)} style={input}><option value={0}>0%</option><option value={5}>5%</option><option value={12}>12%</option><option value={18}>18%</option><option value={28}>28%</option></select>
                  <button type="button" onClick={() => removeItem(i)} disabled={items.length === 1} style={remove}>×</button>
                </div>)}
              </div>
              <button type="button" onClick={addItem} style={secondary}>+ Add item</button>

              <div style={bottomGrid}>
                <label style={label}>Notes<textarea rows={5} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional notes for the customer" style={{ ...input, resize: "vertical" }}/></label>
                <div style={summary}>
                  <div style={sumRow}><span>Subtotal</span><strong>{money(preview.subtotal)}</strong></div>
                  <div style={sumRow}><span>Discount</span><strong>- {money(preview.discount)}</strong></div>
                  <div style={sumRow}><span>Taxable amount</span><strong>{money(preview.taxable)}</strong></div>
                  <div style={sumRow}><span>GST</span><strong>{money(preview.tax)}</strong></div>
                  <div style={{ ...sumRow, borderTop: "1px solid #ddd9d1", marginTop: 8, paddingTop: 14, fontSize: 18 }}><strong>Total</strong><strong>{money(preview.total)}</strong></div>
                </div>
              </div>
              <button type="submit" disabled={saving} style={primary}>{saving ? "Creating…" : "Create draft invoice"}</button>
            </form>
          )}
        </section>

        <section style={{ ...card, marginTop: 24 }}>
          <div style={sectionHead}><div><div style={kicker}>History</div><h2 style={h2}>Invoice list</h2><p style={muted}>Finalize invoices, record payments and open PDFs.</p></div><span style={muted}>{invoices.length} invoice{invoices.length === 1 ? "" : "s"}</span></div>
          {invoices.length === 0 ? <div style={empty}>No invoices yet.</div> : <div style={{ display: "grid", gap: 10 }}>{invoices.map(inv => {
            const paid = inv.status === "PAID";
            return <article key={inv.id} style={invoiceCard}>
              <div><div style={{ display: "flex", gap: 10, alignItems: "center" }}><strong style={{ fontSize: 17 }}>{inv.invoiceNumber}</strong><span style={status(inv.status)}>{inv.status}</span></div><div style={{ marginTop: 6, fontWeight: 650 }}>{inv.customer?.companyName ?? inv.customer?.name ?? "Customer"}</div><div style={{ ...muted, marginTop: 4, fontSize: 13 }}>Issued {dateText(inv.invoiceDate)}{inv.dueDate ? ` · Due ${dateText(inv.dueDate)}` : ""}</div></div>
              <div style={{ textAlign: "right" }}><strong style={{ display: "block", fontSize: 20 }}>{money(Number(inv.total))}</strong><div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 10 }}>{inv.status === "DRAFT" && <button type="button" onClick={() => finalizeInvoice(inv.id)} style={secondary}>Finalize</button>}{!paid && <button type="button" onClick={() => startPayment(inv.id)} style={primary}>Record payment</button>}<button type="button" onClick={() => openPdf(inv.id)} style={secondary}>PDF</button></div></div>
            </article>;
          })}</div>}
        </section>

        {paymentInvoiceId && <section style={{ ...card, marginTop: 24 }}>
          <div style={sectionHead}><div><div style={kicker}>Payment tracking</div><h2 style={h2}>{invoices.find(x => x.id === paymentInvoiceId)?.invoiceNumber ?? "Invoice"} payments</h2><p style={muted}>Record full or partial payments and keep a payment history.</p></div><button type="button" onClick={closePayment} style={secondary}>Close</button></div>

          {paymentSummary && <div style={stats}>
            <div style={stat}><span>Total</span><strong>{money(paymentSummary.total)}</strong></div>
            <div style={stat}><span>Paid</span><strong>{money(paymentSummary.paidAmount)}</strong></div>
            <div style={stat}><span>Outstanding</span><strong>{money(paymentSummary.outstandingAmount)}</strong></div>
            <div style={stat}><span>Status</span><strong style={{ color: paymentSummary.paymentStatus === "PAID" ? "#187a45" : paymentSummary.paymentStatus === "PARTIAL" ? "#946200" : "#555" }}>{paymentSummary.paymentStatus}</strong></div>
          </div>}

          {paymentError && <div style={errorBox}>{paymentError}</div>}

          {paymentSummary && paymentSummary.outstandingAmount > 0 && <form onSubmit={recordPayment} style={paymentForm}>
            <label style={label}>Amount<input type="number" min="0.01" step="0.01" max={paymentSummary.outstandingAmount} value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} placeholder="0.00" style={input} required/></label>
            <label style={label}>Method<select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} style={input}><option value="UPI">UPI</option><option value="CASH">Cash</option><option value="BANK_TRANSFER">Bank Transfer</option><option value="CARD">Card</option><option value="OTHER">Other</option></select></label>
            <label style={label}>Reference<input value={paymentReference} onChange={e => setPaymentReference(e.target.value)} placeholder="Optional reference" style={input}/></label>
            <label style={label}>Payment date<input type="date" value={paymentDate} onChange={e => setPaymentDate(e.target.value)} style={input} required/></label>
            <button type="submit" disabled={paymentLoading} style={primary}>{paymentLoading ? "Saving…" : "Record payment"}</button>
          </form>}

          {paymentSummary?.outstandingAmount === 0 && <div style={paidBox}>This invoice is fully paid. No outstanding amount remains.</div>}

          <h3 style={{ margin: "24px 0 12px", fontSize: 16 }}>Payment history</h3>
          {paymentLoading && payments.length === 0 ? <p style={muted}>Loading payments…</p> : payments.length === 0 ? <div style={empty}>No payments recorded yet.</div> : <div style={{ display: "grid", gap: 8 }}>{payments.map(p => <div key={p.id} style={paymentRow}><div><strong>{p.method.replaceAll("_", " ")}</strong>{p.reference && <div style={small}>Ref: {p.reference}</div>}<div style={small}>{dateText(p.paidAt)}</div></div><strong>{money(Number(p.amount))}</strong></div>)}</div>}
        </section>}
      </div>
    </main>
  );
}

const page: React.CSSProperties = { minHeight: "100vh", background: "#f7f7f5", color: "#171717", padding: "32px 24px 64px", fontFamily: "Inter, system-ui, sans-serif" };
const wrap: React.CSSProperties = { maxWidth: 1180, margin: "0 auto" };
const header: React.CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 24, marginBottom: 28 };
const kicker: React.CSSProperties = { fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "#77736b", marginBottom: 6 };
const h1: React.CSSProperties = { margin: 0, fontSize: 36, letterSpacing: "-0.04em" };
const h2: React.CSSProperties = { margin: 0, fontSize: 22, letterSpacing: "-0.025em" };
const muted: React.CSSProperties = { color: "#77736b", fontSize: 14 };
const card: React.CSSProperties = { background: "#fff", border: "1px solid #e7e5df", borderRadius: 18, padding: 24, boxShadow: "0 8px 30px rgba(20,20,20,.04)" };
const sectionHead: React.CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 20, marginBottom: 22 };
const grid3: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 16 };
const label: React.CSSProperties = { display: "grid", gap: 7, fontSize: 13, fontWeight: 650, color: "#45423d" };
const input: React.CSSProperties = { width: "100%", minHeight: 42, boxSizing: "border-box", border: "1px solid #d9d6cf", borderRadius: 9, padding: "9px 11px", background: "#fff", color: "#171717", font: "inherit" };
const primary: React.CSSProperties = { border: 0, borderRadius: 9, minHeight: 42, padding: "9px 14px", background: "#171717", color: "#fff", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" };
const secondary: React.CSSProperties = { border: "1px solid #d8d5ce", borderRadius: 9, minHeight: 40, padding: "8px 13px", background: "#fff", color: "#242321", fontWeight: 650, cursor: "pointer", whiteSpace: "nowrap" };
const linkBtn: React.CSSProperties = { ...secondary, display: "inline-flex", alignItems: "center", textDecoration: "none" };
const primaryLink: React.CSSProperties = { ...primary, display: "inline-flex", alignItems: "center", textDecoration: "none" };
const table: React.CSSProperties = { marginTop: 24, border: "1px solid #ebe9e3", borderRadius: 14, overflow: "hidden" };
const tableHead: React.CSSProperties = { display: "grid", gridTemplateColumns: "minmax(220px,2fr) 90px 120px 110px 110px 42px", gap: 10, padding: "12px 14px", background: "#fafaf8", borderBottom: "1px solid #ebe9e3", fontSize: 11, fontWeight: 700, color: "#77736b", textTransform: "uppercase", letterSpacing: ".08em" };
const tableRow: React.CSSProperties = { display: "grid", gridTemplateColumns: "minmax(220px,2fr) 90px 120px 110px 110px 42px", gap: 10, padding: 14, borderBottom: "1px solid #f0eee9" };
const remove: React.CSSProperties = { width: 42, height: 42, borderRadius: 9, border: "1px solid #e1ded7", background: "#fff", color: "#77736b", fontSize: 22, cursor: "pointer" };
const bottomGrid: React.CSSProperties = { display: "grid", gridTemplateColumns: "minmax(0,1fr) 300px", gap: 24, marginTop: 24 };
const summary: React.CSSProperties = { border: "1px solid #ebe9e3", borderRadius: 14, padding: 18, background: "#fafaf8" };
const sumRow: React.CSSProperties = { display: "flex", justifyContent: "space-between", gap: 12, padding: "5px 0", color: "#5f5b54" };
const invoiceCard: React.CSSProperties = { border: "1px solid #e8e6e0", borderRadius: 14, padding: 18, background: "#fff", display: "flex", justifyContent: "space-between", gap: 20, alignItems: "center", flexWrap: "wrap" };
const stats: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 12, marginBottom: 20 };
const stat: React.CSSProperties = { border: "1px solid #e8e5df", borderRadius: 13, padding: 16, background: "#fff", display: "grid", gap: 7 };
const paymentForm: React.CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr 1.2fr 1fr auto", gap: 12, alignItems: "end", padding: 18, borderRadius: 14, background: "#fafaf8", border: "1px solid #ebe9e3" };
const paymentRow: React.CSSProperties = { display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center", padding: "14px 16px", border: "1px solid #ebe9e3", borderRadius: 12, background: "#fff" };
const small: React.CSSProperties = { color: "#77736b", fontSize: 12, marginTop: 4 };
const empty: React.CSSProperties = { padding: 20, border: "1px dashed #d8d5ce", borderRadius: 12, color: "#77736b" };
const paidBox: React.CSSProperties = { padding: 16, borderRadius: 12, background: "#edf8f1", color: "#187a45", fontWeight: 600, marginTop: 18 };
const errorBox: React.CSSProperties = { marginBottom: 16, padding: "12px 14px", borderRadius: 10, background: "#fff1f0", border: "1px solid #ffd3cf", color: "#a1261b", fontSize: 14 };

function status(s: string): React.CSSProperties {
  return { display: "inline-flex", padding: "5px 9px", borderRadius: 999, background: s === "PAID" ? "#e9f7ef" : s === "FINALIZED" ? "#eef3ff" : "#f2f1ee", color: s === "PAID" ? "#187a45" : s === "FINALIZED" ? "#315ea8" : "#66625b", fontSize: 11, fontWeight: 800, letterSpacing: ".05em" };
}
