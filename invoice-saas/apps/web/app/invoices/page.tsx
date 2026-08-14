"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../src/lib/api";

const BUSINESS_ID = process.env.NEXT_PUBLIC_BUSINESS_ID;

type Customer = {
  id: string;
  name: string;
  companyName: string | null;
};

type Invoice = {
  id: string;
  invoiceNumber: string;
  status: string;
  total: string;
  invoiceDate: string;
  dueDate: string | null;
  customer: Customer | null;
};

type Item = {
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  discount: number;
};

const emptyItem = (): Item => ({
  description: "",
  quantity: 1,
  unitPrice: 0,
  taxRate: 18,
  discount: 0,
});

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

  async function loadData() {
    if (!BUSINESS_ID) {
      setError("NEXT_PUBLIC_BUSINESS_ID is not configured");
      setLoading(false);
      return;
    }

    try {
      const [invoiceData, customerData] = await Promise.all([
        apiFetch<{ invoices: Invoice[] }>(
          `/businesses/${BUSINESS_ID}/invoices`,
        ),
        apiFetch<{ customers: Customer[] }>(
          `/businesses/${BUSINESS_ID}/customers`,
        ),
      ]);

      setInvoices(invoiceData.invoices);
      setCustomers(customerData.customers);

      if (!customerId && customerData.customers.length > 0) {
        setCustomerId(customerData.customers[0].id);
      }
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "LOAD_FAILED");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  const preview = useMemo(() => {
    let subtotal = 0;
    let discount = 0;
    let tax = 0;

    for (const item of items) {
      const gross = Math.max(0, item.quantity) * Math.max(0, item.unitPrice);
      const itemDiscount = Math.min(Math.max(0, item.discount), gross);
      const taxable = gross - itemDiscount;

      subtotal += gross;
      discount += itemDiscount;
      tax += taxable * (Math.max(0, item.taxRate) / 100);
    }

    return {
      subtotal,
      discount,
      tax,
      total: subtotal - discount + tax,
    };
  }, [items]);

  function updateItem(index: number, key: keyof Item, value: string) {
    setItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [key]:
                key === "description"
                  ? value
                  : Number(value),
            }
          : item,
      ),
    );
  }

  function addItem() {
    setItems((current) => [...current, emptyItem()]);
  }

  function removeItem(index: number) {
    setItems((current) =>
      current.length === 1
        ? current
        : current.filter((_, itemIndex) => itemIndex !== index),
    );
  }

  async function createInvoice(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!BUSINESS_ID || !customerId) {
      setError("Select a customer first.");
      return;
    }

    if (items.some((item) => !item.description.trim())) {
      setError("Every invoice item needs a description.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await apiFetch(`/businesses/${BUSINESS_ID}/invoices`, {
        method: "POST",
        body: JSON.stringify({
          customerId,
          ...(issueDate ? { issueDate } : {}),
          ...(dueDate ? { dueDate } : {}),
          ...(notes.trim() ? { notes: notes.trim() } : {}),
          items,
        }),
      });

      setItems([emptyItem()]);
      setNotes("");
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "CREATE_FAILED");
    } finally {
      setSaving(false);
    }
  }

  async function finalizeInvoice(id: string) {
    if (!BUSINESS_ID) return;

    try {
      await apiFetch(
        `/businesses/${BUSINESS_ID}/invoices/${id}/finalize`,
        { method: "POST" },
      );
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "FINALIZE_FAILED");
    }
  }

  async function openPdf(id: string) {
    if (!BUSINESS_ID) return;

    const token = localStorage.getItem("hisabbookes_access_token");
    const base =
      process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

    const response = await fetch(
      `${base}/businesses/${BUSINESS_ID}/invoices/${id}/pdf`,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      },
    );

    if (!response.ok) {
      setError("PDF_DOWNLOAD_FAILED");
      return;
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <main style={{ maxWidth: 1150, margin: "0 auto", padding: 32 }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          <h1>Invoices</h1>
          <p>Create, finalize and view invoices.</p>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <a href="/customers">Customers</a>
          <a href="/dashboard">Dashboard</a>
        </div>
      </div>

      {error && <p style={{ color: "crimson" }}>{error}</p>}

      <section
        style={{
          marginTop: 24,
          border: "1px solid #ddd",
          borderRadius: 12,
          padding: 20,
        }}
      >
        <h2>Create invoice</h2>

        {customers.length === 0 ? (
          <p>
            No customers found. Create a customer first from{" "}
            <a href="/customers">Customers</a>.
          </p>
        ) : (
          <form onSubmit={createInvoice}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                gap: 12,
              }}
            >
              <label>
                Customer
                <select
                  value={customerId}
                  onChange={(event) => setCustomerId(event.target.value)}
                  style={{ display: "block", width: "100%", padding: 9 }}
                  required
                >
                  <option value="">Select customer</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.companyName ?? customer.name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Issue date
                <input
                  type="date"
                  value={issueDate}
                  onChange={(event) => setIssueDate(event.target.value)}
                  style={{ display: "block", width: "100%", padding: 9 }}
                />
              </label>

              <label>
                Due date
                <input
                  type="date"
                  value={dueDate}
                  onChange={(event) => setDueDate(event.target.value)}
                  style={{ display: "block", width: "100%", padding: 9 }}
                />
              </label>
            </div>

            <h3 style={{ marginTop: 24 }}>Items</h3>

            <div style={{ display: "grid", gap: 12 }}>
              {items.map((item, index) => (
                <div
                  key={index}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 0.7fr 1fr 0.8fr 0.9fr auto",
                    gap: 8,
                    alignItems: "end",
                  }}
                >
                  <label>
                    Description
                    <input
                      value={item.description}
                      onChange={(event) =>
                        updateItem(index, "description", event.target.value)
                      }
                      style={{ display: "block", width: "100%", padding: 8 }}
                      required
                    />
                  </label>

                  <label>
                    Qty
                    <input
                      type="number"
                      min="0.001"
                      step="0.001"
                      value={item.quantity}
                      onChange={(event) =>
                        updateItem(index, "quantity", event.target.value)
                      }
                      style={{ display: "block", width: "100%", padding: 8 }}
                    />
                  </label>

                  <label>
                    Rate
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(event) =>
                        updateItem(index, "unitPrice", event.target.value)
                      }
                      style={{ display: "block", width: "100%", padding: 8 }}
                    />
                  </label>

                  <label>
                    GST %
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={item.taxRate}
                      onChange={(event) =>
                        updateItem(index, "taxRate", event.target.value)
                      }
                      style={{ display: "block", width: "100%", padding: 8 }}
                    />
                  </label>

                  <label>
                    Discount
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.discount}
                      onChange={(event) =>
                        updateItem(index, "discount", event.target.value)
                      }
                      style={{ display: "block", width: "100%", padding: 8 }}
                    />
                  </label>

                  <button type="button" onClick={() => removeItem(index)}>
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <button type="button" onClick={addItem} style={{ marginTop: 12 }}>
              + Add item
            </button>

            <label style={{ display: "block", marginTop: 16 }}>
              Notes
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={3}
                style={{ display: "block", width: "100%", padding: 8 }}
              />
            </label>

            <div style={{ marginTop: 20, textAlign: "right" }}>
              <p>Subtotal: ₹{preview.subtotal.toFixed(2)}</p>
              <p>Discount: ₹{preview.discount.toFixed(2)}</p>
              <p>GST: ₹{preview.tax.toFixed(2)}</p>
              <strong>Total: ₹{preview.total.toFixed(2)}</strong>
            </div>

            <button type="submit" disabled={saving} style={{ marginTop: 16 }}>
              {saving ? "Creating..." : "Create draft invoice"}
            </button>
          </form>
        )}
      </section>

      <section style={{ marginTop: 32 }}>
        <h2>Invoice list</h2>

        {loading ? (
          <p>Loading invoices...</p>
        ) : invoices.length === 0 ? (
          <p>No invoices yet.</p>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {invoices.map((invoice) => (
              <article
                key={invoice.id}
                style={{
                  border: "1px solid #eee",
                  borderRadius: 10,
                  padding: 16,
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 16,
                }}
              >
                <div>
                  <strong>{invoice.invoiceNumber}</strong>
                  <div>
                    {invoice.customer?.companyName ??
                      invoice.customer?.name ??
                      "Customer"}
                  </div>
                  <div>
                    ₹{Number(invoice.total).toFixed(2)} · {invoice.status}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8, alignItems: "start" }}>
                  {invoice.status === "DRAFT" && (
                    <button
                      type="button"
                      onClick={() => finalizeInvoice(invoice.id)}
                    >
                      Finalize
                    </button>
                  )}

                  <button type="button" onClick={() => openPdf(invoice.id)}>
                    PDF
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
