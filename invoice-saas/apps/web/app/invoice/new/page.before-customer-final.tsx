"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../../src/lib/api";

const BUSINESS_ID = process.env.NEXT_PUBLIC_BUSINESS_ID;

type Customer = {
  id: string;
  name: string;
  companyName: string | null;
};

type Item = {
  description: string;
  quantity: number;
  rate: number;
  discount: number;
};

export default function NewInvoicePage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [invoiceNo, setInvoiceNo] = useState("");
  const [issueDate, setIssueDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [dueDate, setDueDate] = useState("");
  const [items, setItems] = useState<Item[]>([
    {
      description: "Website development",
      quantity: 1,
      rate: 50000,
      discount: 0,
    },
  ]);
  const [tax, setTax] = useState(18);
  const [notes, setNotes] = useState("");
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [savingCustomer, setSavingCustomer] = useState(false);
  const [customerForm, setCustomerForm] = useState({
    name: "",
    companyName: "",
    phone: "",
    email: "",
    address: "",
    state: "",
    gstin: "",
  });

  useEffect(() => {
    if (!BUSINESS_ID) {
      setError("NEXT_PUBLIC_BUSINESS_ID is not configured");
      setLoadingCustomers(false);
      return;
    }

    apiFetch<{ customers: Customer[] }>(
      `/businesses/${BUSINESS_ID}/customers`,
    )
      .then(({ customers }) => {
        setCustomers(customers);

        if (customers.length > 0) {
          setCustomerId(customers[0].id);
        }
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoadingCustomers(false));
  }, []);

  const subtotal = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + item.quantity * item.rate,
        0,
      ),
    [items],
  );

  const discountTotal = useMemo(
    () =>
      items.reduce(
        (sum, item) =>
          sum + Math.min(item.discount, item.quantity * item.rate),
        0,
      ),
    [items],
  );

  const taxableAmount = subtotal - discountTotal;
  const taxAmount = taxableAmount * (tax / 100);
  const total = taxableAmount + taxAmount;

  function updateItem(
    index: number,
    key: keyof Item,
    value: string,
  ) {
    setItems((current) =>
      current.map((item, i) =>
        i === index
          ? {
              ...item,
              [key]:
                key === "description"
                  ? value
                  : Number(value) || 0,
            }
          : item,
      ),
    );
  }

  function addItem() {
    setItems((current) => [
      ...current,
      {
        description: "",
        quantity: 1,
        rate: 0,
        discount: 0,
      },
    ]);
  }

  function removeItem(index: number) {
    setItems((current) => current.filter((_, i) => i !== index));
  }

  async function createCustomer() {
    if (!BUSINESS_ID) {
      setError("NEXT_PUBLIC_BUSINESS_ID is not configured");
      return;
    }

    if (!customerForm.name.trim()) {
      setError("Customer name is required.");
      return;
    }

    setSavingCustomer(true);
    setError("");

    try {
      const { customer } = await apiFetch<{ customer: Customer }>(
        `/businesses/${BUSINESS_ID}/customers`,
        {
          method: "POST",
          body: JSON.stringify({
            name: customerForm.name.trim(),
            companyName: customerForm.companyName.trim() || undefined,
            phone: customerForm.phone.trim() || undefined,
            email: customerForm.email.trim() || undefined,
            address: customerForm.address.trim() || undefined,
            state: customerForm.state.trim() || undefined,
            gstin: customerForm.gstin.trim().toUpperCase() || undefined,
          }),
        },
      );

      setCustomers((current) => [customer, ...current]);
      setCustomerId(customer.id);

      setCustomerForm({
        name: "",
        companyName: "",
        phone: "",
        email: "",
        address: "",
        state: "",
        gstin: "",
      });

      setShowCustomerForm(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "CUSTOMER_CREATE_FAILED",
      );
    } finally {
      setSavingCustomer(false);
    }
  }

  async function saveDraft(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!BUSINESS_ID) {
      setError("NEXT_PUBLIC_BUSINESS_ID is not configured");
      return;
    }

    if (!customerId) {
      setError("Please select a customer.");
      return;
    }

    if (items.length === 0) {
      setError("Add at least one item.");
      return;
    }

    if (items.some((item) => !item.description.trim())) {
      setError("Every item needs a description.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await apiFetch(`/businesses/${BUSINESS_ID}/invoices`, {
        method: "POST",
        body: JSON.stringify({
          customerId,
          issueDate: issueDate
            ? new Date(`${issueDate}T00:00:00`).toISOString()
            : undefined,
          dueDate: dueDate
            ? new Date(`${dueDate}T00:00:00`).toISOString()
            : undefined,
          notes: notes.trim() || undefined,
          items: items.map((item) => ({
            description: item.description.trim(),
            quantity: item.quantity,
            unitPrice: item.rate,
            discount: item.discount,
            taxRate: tax,
          })),
        }),
      });

      window.location.href = "/invoices";
    } catch (err) {
      setError(err instanceof Error ? err.message : "SAVE_FAILED");
    } finally {
      setSaving(false);
    }
  }

  const selectedCustomer = customers.find(
    (customer) => customer.id === customerId,
  );

  return (
    <div className="app-shell invoice-builder-shell">
      <aside className="sidebar">
        <Link href="/dashboard" className="side-brand">
          HisabBookes
        </Link>

        <div className="side-label">Create</div>

        <nav className="side-nav">
          <Link href="/dashboard">Overview</Link>
          <Link href="/invoices">Invoices</Link>
          <Link href="/customers">Customers</Link>
          <Link className="active" href="/invoice/new">
            New invoice
          </Link>
          <Link href="/business-profile">Business Profile</Link>
        </nav>

        <div className="side-bottom">
          <Link href="/dashboard" className="back-link">
            ← Dashboard
          </Link>
        </div>
      </aside>

      <main className="dashboard-main builder-main">
        <header className="dash-header builder-header">
          <div>
            <span className="eyebrow">New invoice</span>
            <h1>Create invoice</h1>
            <p>
              Create a draft invoice and save it to your HisabBookes account.
            </p>
          </div>

          <div className="builder-actions">
            <Link href="/invoices" className="button button-ghost">
              Cancel
            </Link>

            <button
              className="button"
              type="submit"
              form="invoice-form"
              disabled={saving || loadingCustomers}
            >
              {saving ? "Saving…" : "Save draft"}
            </button>
          </div>
        </header>

        {error && (
          <div
            style={{
              marginBottom: 18,
              padding: "12px 14px",
              borderRadius: 10,
              background: "#fff1f2",
              color: "#be123c",
              fontSize: 13,
            }}
          >
            {error}
          </div>
        )}

        <form id="invoice-form" onSubmit={saveDraft}>
          <div className="builder-grid">
            <section className="builder-form">
              <div className="form-card">
                <div className="card-title">
                  <div>
                    <h2>Invoice details</h2>
                    <p>Basic document information.</p>
                  </div>
                </div>

                <div className="form-grid">
                  <label>
                    Invoice number
                    <input
                      value={invoiceNo}
                      onChange={(e) => setInvoiceNo(e.target.value)}
                      placeholder="Auto-generated"
                    />
                    <small>
                      Leave blank to let HisabBookes generate the number.
                    </small>
                  </label>

                  <label>
                    Invoice date
                    <input
                      type="date"
                      value={issueDate}
                      onChange={(e) => setIssueDate(e.target.value)}
                    />
                  </label>

                  <label>
                    Due date
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                    />
                  </label>

                  <label>
                    Customer
                    <select
                      value={customerId}
                      onChange={(e) => setCustomerId(e.target.value)}
                      disabled={loadingCustomers}
                    >
                      {loadingCustomers ? (
                        <option>Loading customers…</option>
                      ) : customers.length === 0 ? (
                        <option value="">No customers found</option>
                      ) : (
                        customers.map((customer) => (
                          <option key={customer.id} value={customer.id}>
                            {customer.companyName
                              ? `${customer.companyName} — ${customer.name}`
                              : customer.name}
                          </option>
                        ))
                      )}
                    </select>

                    <button
                      type="button"
                      className="mini-button"
                      style={{ marginTop: 10, alignSelf: "flex-start" }}
                      onClick={() => {
                        setShowCustomerForm((value) => !value);
                        setError("");
                      }}
                    >
                      {showCustomerForm ? "Cancel" : "+ Add new customer"}
                    </button>

                    {showCustomerForm && (
                      <div className="new-customer-box">
                        <div className="new-customer-heading">
                          <strong>Add customer</strong>
                          <span>Create a customer without leaving the invoice.</span>
                        </div>

                        <div className="new-customer-grid">
                          <label>
                            Name *
                            <input
                              value={customerForm.name}
                              onChange={(e) =>
                                setCustomerForm({
                                  ...customerForm,
                                  name: e.target.value,
                                })
                              }
                              placeholder="Customer name"
                            />
                          </label>

                          <label>
                            Company Name
                            <input
                              value={customerForm.companyName}
                              onChange={(e) =>
                                setCustomerForm({
                                  ...customerForm,
                                  companyName: e.target.value,
                                })
                              }
                              placeholder="Company name"
                            />
                          </label>

                          <label>
                            Phone
                            <input
                              value={customerForm.phone}
                              onChange={(e) =>
                                setCustomerForm({
                                  ...customerForm,
                                  phone: e.target.value,
                                })
                              }
                              placeholder="Phone number"
                            />
                          </label>

                          <label>
                            Email
                            <input
                              type="email"
                              value={customerForm.email}
                              onChange={(e) =>
                                setCustomerForm({
                                  ...customerForm,
                                  email: e.target.value,
                                })
                              }
                              placeholder="Email address"
                            />
                          </label>

                          <label className="new-customer-full">
                            Address
                            <textarea
                              rows={2}
                              value={customerForm.address}
                              onChange={(e) =>
                                setCustomerForm({
                                  ...customerForm,
                                  address: e.target.value,
                                })
                              }
                              placeholder="Address"
                            />
                          </label>

                          <label>
                            State
                            <input
                              value={customerForm.state}
                              onChange={(e) =>
                                setCustomerForm({
                                  ...customerForm,
                                  state: e.target.value,
                                })
                              }
                              placeholder="Rajasthan"
                            />
                          </label>

                          <label>
                            GSTIN
                            <input
                              maxLength={15}
                              value={customerForm.gstin}
                              onChange={(e) =>
                                setCustomerForm({
                                  ...customerForm,
                                  gstin: e.target.value.toUpperCase(),
                                })
                              }
                              placeholder="GSTIN"
                            />
                          </label>
                        </div>

                        <button
                          type="button"
                          className="button button-small"
                          disabled={savingCustomer}
                          onClick={createCustomer}
                        >
                          {savingCustomer ? "Saving…" : "Save Customer"}
                        </button>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              <div className="form-card">
                <div className="card-title">
                  <div>
                    <h2>Items / services</h2>
                    <p>Add what you are billing the customer for.</p>
                  </div>

                  <button
                    type="button"
                    className="mini-button"
                    onClick={addItem}
                  >
                    + Add item
                  </button>
                </div>

                {items.map((item, index) => (
                  <div className="item-editor" key={index}>
                    <input
                      placeholder="Description"
                      value={item.description}
                      onChange={(e) =>
                        updateItem(index, "description", e.target.value)
                      }
                    />

                    <input
                      type="number"
                      min="0"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(index, "quantity", e.target.value)
                      }
                    />

                    <input
                      type="number"
                      min="0"
                      placeholder="Rate"
                      value={item.rate}
                      onChange={(e) =>
                        updateItem(index, "rate", e.target.value)
                      }
                    />

                    <input
                      type="number"
                      min="0"
                      placeholder="Discount"
                      value={item.discount}
                      onChange={(e) =>
                        updateItem(index, "discount", e.target.value)
                      }
                    />

                    <button
                      type="button"
                      aria-label="Remove item"
                      onClick={() => removeItem(index)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              <div className="form-card">
                <div className="card-title">
                  <div>
                    <h2>Tax & notes</h2>
                    <p>Apply the tax rate and optional invoice notes.</p>
                  </div>
                </div>

                <label className="tax-field">
                  Tax rate (%)
                  <input
                    type="number"
                    min="0"
                    value={tax}
                    onChange={(e) =>
                      setTax(Number(e.target.value) || 0)
                    }
                  />
                </label>

                <label style={{ display: "block", marginTop: 18 }}>
                  Notes
                  <textarea
                    rows={4}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Optional notes for this invoice"
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      marginTop: 8,
                    }}
                  />
                </label>
              </div>
            </section>

            <aside className="invoice-preview">
              <div className="preview-top">
                <span>LIVE PREVIEW</span>
                <span>{invoiceNo || "AUTO NUMBER"}</span>
              </div>

              <div className="paper">
                <div className="paper-brand">
                  <div>
                    <strong>HisabBookes</strong>
                    <small>Professional invoice</small>
                  </div>

                  <div className="paper-invoice">
                    INVOICE
                    <br />
                    <span>{invoiceNo || "AUTO"}</span>
                  </div>
                </div>

                <div className="paper-meta">
                  <div>
                    <small>BILL TO</small>
                    <strong>
                      {selectedCustomer?.companyName ||
                        selectedCustomer?.name ||
                        "Customer"}
                    </strong>
                    <span>
                      {selectedCustomer?.name || ""}
                    </span>
                  </div>

                  <div>
                    <small>ISSUED</small>
                    <strong>{issueDate || "-"}</strong>
                    <small>DUE</small>
                    <strong>{dueDate || "-"}</strong>
                  </div>
                </div>

                <div className="paper-items">
                  <div>
                    <span>DESCRIPTION</span>
                    <span>AMOUNT</span>
                  </div>

                  {items.map((item, index) => (
                    <div key={index}>
                      <span>
                        {item.description || "Service"}
                        <small>
                          {item.quantity} × ₹
                          {item.rate.toLocaleString("en-IN")}
                        </small>
                      </span>

                      <strong>
                        ₹
                        {(
                          item.quantity * item.rate -
                          Math.min(
                            item.discount,
                            item.quantity * item.rate,
                          )
                        ).toLocaleString("en-IN")}
                      </strong>
                    </div>
                  ))}
                </div>

                <div className="paper-total">
                  <span>Subtotal</span>
                  <strong>
                    ₹{subtotal.toLocaleString("en-IN")}
                  </strong>

                  <span>Discount</span>
                  <strong>
                    ₹{discountTotal.toLocaleString("en-IN")}
                  </strong>

                  <span>Tax ({tax}%)</span>
                  <strong>
                    ₹
                    {taxAmount.toLocaleString("en-IN", {
                      maximumFractionDigits: 2,
                    })}
                  </strong>

                  <b>Total</b>
                  <b>
                    ₹
                    {total.toLocaleString("en-IN", {
                      maximumFractionDigits: 2,
                    })}
                  </b>
                </div>

                {notes && (
                  <div className="paper-note">{notes}</div>
                )}
              </div>
            </aside>
          </div>
        </form>
      </main>
    </div>
  );
}
