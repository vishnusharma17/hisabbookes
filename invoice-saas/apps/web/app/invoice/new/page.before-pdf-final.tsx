"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../../src/lib/api";

type Customer = {
  id: string;
  name: string;
  companyName: string | null;
  address: string | null;
  state: string | null;
  country: string;
  gstin: string | null;
  email: string | null;
  phone: string | null;
};

type Business = {
  id: string;
  legalName: string;
  displayName: string | null;
  address: string | null;
  state: string | null;
  country: string;
  gstin: string | null;
  invoiceNumberPrefix?: string;
  invoiceNumberStart?: number;
};

type Item = {
  description: string;
  hsnSac: string;
  quantity: number;
  rate: number;
  discount: number;
  taxRate: number;
};

type CustomerForm = {
  name: string;
  companyName: string;
  address: string;
  state: string;
  gstin: string;
  email: string;
  phone: string;
};

const blankCustomer: CustomerForm = {
  name: "",
  companyName: "",
  address: "",
  state: "",
  gstin: "",
  email: "",
  phone: "",
};

function money(value: number) {
  return `₹${value.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function NewInvoicePage() {
  const [business, setBusiness] = useState<Business | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerId, setCustomerId] = useState("");

  const [invoiceNumber, setInvoiceNumber] = useState("BILL-0001");
  const [invoiceDate, setInvoiceDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [dueDate, setDueDate] = useState("");

  const [items, setItems] = useState<Item[]>([
    {
      description: "",
      hsnSac: "",
      quantity: 1,
      rate: 0,
      discount: 0,
      taxRate: 18,
    },
  ]);

  const [notes, setNotes] = useState("");
  const [terms, setTerms] = useState(
    "Payment due within 15 days.",
  );

  const [customerForm, setCustomerForm] =
    useState<CustomerForm>(blankCustomer);

  const [showCustomerForm, setShowCustomerForm] =
    useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingCustomer, setSavingCustomer] =
    useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadInvoiceBuilder() {
      try {
        const businessData = await apiFetch<{
          businesses: Array<{
            id: string;
            legalName: string;
            displayName: string | null;
            address: string | null;
            state: string | null;
            country: string;
            gstin: string | null;
            invoiceNumberPrefix?: string;
            invoiceNumberStart?: number;
          }>;
        }>("/businesses");

        const currentBusiness = businessData.businesses[0];

        if (!currentBusiness) {
          throw new Error("BUSINESS_NOT_FOUND");
        }

        const [businessResponse, customerResponse] =
          await Promise.all([
            apiFetch<{ business: Business }>(
              `/businesses/${currentBusiness.id}`,
            ),
            apiFetch<{ customers: Customer[] }>(
              `/businesses/${currentBusiness.id}/customers`,
            ),
          ]);

        const b = businessResponse.business;

        setBusiness(b);
        setCustomers(customerResponse.customers);

        if (customerResponse.customers.length > 0) {
          setCustomerId(customerResponse.customers[0].id);
        }

        const prefix = b.invoiceNumberPrefix || "BILL";
        const start = b.invoiceNumberStart || 1;

        setInvoiceNumber(
          `${prefix}-${String(start).padStart(4, "0")}`,
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "INVOICE_BUILDER_FAILED",
        );
      } finally {
        setLoading(false);
      }
    }

    void loadInvoiceBuilder();
  }, []);

  const customer = customers.find(
    (item) => item.id === customerId,
  );

  const calculations = useMemo(
    () =>
      items.map((item) => {
        const gross = item.quantity * item.rate;
        const discount = Math.min(item.discount, gross);
        const taxable = gross - discount;
        const tax = taxable * (item.taxRate / 100);

        return {
          gross,
          discount,
          taxable,
          tax,
          total: taxable + tax,
        };
      }),
    [items],
  );

  const subtotal = calculations.reduce(
    (sum, item) => sum + item.gross,
    0,
  );

  const discountTotal = calculations.reduce(
    (sum, item) => sum + item.discount,
    0,
  );

  const taxableAmount = calculations.reduce(
    (sum, item) => sum + item.taxable,
    0,
  );

  const taxTotal = calculations.reduce(
    (sum, item) => sum + item.tax,
    0,
  );

  const cgst = taxTotal / 2;
  const sgst = taxTotal / 2;
  const total = taxableAmount + taxTotal;

  function updateItem(
    index: number,
    key: keyof Item,
    value: string,
  ) {
    setItems((current) =>
      current.map((item, itemIndex) => {
        if (index !== itemIndex) return item;

        if (key === "description" || key === "hsnSac") {
          return { ...item, [key]: value };
        }

        return {
          ...item,
          [key]: Math.max(0, Number(value) || 0),
        };
      }),
    );
  }

  function addItem() {
    setItems((current) => [
      ...current,
      {
        description: "",
        hsnSac: "",
        quantity: 1,
        rate: 0,
        discount: 0,
        taxRate: 18,
      },
    ]);
  }

  function removeItem(index: number) {
    if (items.length === 1) return;

    setItems((current) =>
      current.filter((_, itemIndex) => itemIndex !== index),
    );
  }

  async function saveCustomer() {
    if (!business) return;

    if (!customerForm.name.trim()) {
      setError("Customer name is required.");
      return;
    }

    setSavingCustomer(true);
    setError("");

    try {
      const response = await apiFetch<{ customer: Customer }>(
        `/businesses/${business.id}/customers`,
        {
          method: "POST",
          body: JSON.stringify({
            name: customerForm.name.trim(),
            companyName:
              customerForm.companyName.trim() || undefined,
            address:
              customerForm.address.trim() || undefined,
            state:
              customerForm.state.trim() || undefined,
            gstin:
              customerForm.gstin.trim().toUpperCase() || undefined,
            email:
              customerForm.email.trim() || undefined,
            phone:
              customerForm.phone.trim() || undefined,
          }),
        },
      );

      setCustomers((current) => [
        response.customer,
        ...current,
      ]);
      setCustomerId(response.customer.id);
      setCustomerForm(blankCustomer);
      setShowCustomerForm(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "CUSTOMER_CREATE_FAILED",
      );
    } finally {
      setSavingCustomer(false);
    }
  }

  async function saveDraft(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!business) return;

    if (!customerId) {
      setError("Please select a customer.");
      return;
    }

    if (
      items.some(
        (item) =>
          !item.description.trim() ||
          item.quantity <= 0,
      )
    ) {
      setError("Please complete every item.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await apiFetch(
        `/businesses/${business.id}/invoices`,
        {
          method: "POST",
          body: JSON.stringify({
            customerId,
            issueDate: new Date(
              `${invoiceDate}T00:00:00`,
            ).toISOString(),
            dueDate: dueDate
              ? new Date(
                  `${dueDate}T00:00:00`,
                ).toISOString()
              : undefined,
            notes: notes.trim() || undefined,
            items: items.map((item) => ({
              description: item.description.trim(),
              hsnSac: item.hsnSac.trim() || undefined,
              quantity: item.quantity,
              unitPrice: item.rate,
              discount: item.discount,
              taxRate: item.taxRate,
            })),
          }),
        },
      );

      window.location.href = "/invoices";
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "SAVE_FAILED",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="dashboard-main">
        Loading invoice builder…
      </main>
    );
  }

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
          <Link href="/business-profile">
            Business Profile
          </Link>
        </nav>

        <div className="side-bottom">
          <Link href="/dashboard" className="back-link">
            ← Dashboard
          </Link>
        </div>
      </aside>

      <main className="dashboard-main builder-main">
        <header className="invoice-builder-header">
          <div>
            <span className="eyebrow">New invoice</span>
            <h1>Create invoice</h1>
            <p>
              Enter your billing details, review the invoice
              and save it as a draft.
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
              disabled={saving}
            >
              {saving ? "Saving…" : "Save Draft"}
            </button>
          </div>
        </header>

        {error && <div className="invoice-error">{error}</div>}

        <form id="invoice-form" onSubmit={saveDraft}>
          <div className="professional-builder">
            <section className="builder-form">

              <div className="invoice-card">
                <div className="invoice-card-header">
                  <div>
                    <span className="section-kicker">
                      01 · Document
                    </span>
                    <h2>Invoice details</h2>
                    <p>
                      Enter the basic information for this invoice.
                    </p>
                  </div>
                </div>

                <div className="invoice-fields-grid">
                  <label>
                    Invoice number
                    <input
                      value={invoiceNumber}
                      onChange={(event) =>
                        setInvoiceNumber(event.target.value)
                      }
                      placeholder="BILL-0001"
                    />
                    <small>
                      You can edit the invoice number.
                    </small>
                  </label>

                  <label>
                    Invoice date
                    <input
                      type="date"
                      value={invoiceDate}
                      onChange={(event) =>
                        setInvoiceDate(event.target.value)
                      }
                    />
                  </label>

                  <label>
                    Due date
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(event) =>
                        setDueDate(event.target.value)
                      }
                    />
                  </label>

                  <label>
                    Payment terms
                    <input
                      value={terms}
                      onChange={(event) =>
                        setTerms(event.target.value)
                      }
                      placeholder="Payment due within 15 days."
                    />
                  </label>
                </div>
              </div>

              <div className="invoice-card">
                <div className="invoice-card-header">
                  <div>
                    <span className="section-kicker">
                      02 · Customer
                    </span>
                    <h2>Bill to</h2>
                    <p>
                      Select an existing customer or add a new one.
                    </p>
                  </div>

                  <button
                    type="button"
                    className="secondary-action"
                    onClick={() => {
                      setShowCustomerForm((current) => !current);
                      setError("");
                    }}
                  >
                    {showCustomerForm
                      ? "Close"
                      : "+ Add customer"}
                  </button>
                </div>

                <div className="invoice-fields-grid">
                  <label>
                    Customer
                    <select
                      value={customerId}
                      onChange={(event) =>
                        setCustomerId(event.target.value)
                      }
                    >
                      <option value="">Select customer</option>

                      {customers.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.companyName
                            ? `${item.companyName} — ${item.name}`
                            : item.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    Customer name
                    <input
                      value={customer?.name || ""}
                      readOnly
                      placeholder="Select customer"
                    />
                  </label>
                </div>

                {customer && (
                  <div className="customer-summary">
                    <div>
                      <strong>
                        {customer.companyName || customer.name}
                      </strong>

                      {customer.companyName && (
                        <span>{customer.name}</span>
                      )}

                      {customer.address && (
                        <span>{customer.address}</span>
                      )}

                      {customer.state && (
                        <span>
                          {customer.state}, {customer.country}
                        </span>
                      )}
                    </div>

                    <div>
                      {customer.phone && (
                        <span>Phone: {customer.phone}</span>
                      )}

                      {customer.email && (
                        <span>Email: {customer.email}</span>
                      )}

                      {customer.gstin && (
                        <span>GSTIN: {customer.gstin}</span>
                      )}
                    </div>
                  </div>
                )}

                {showCustomerForm && (
                  <div className="new-customer-box">
                    <div className="new-customer-heading">
                      <div>
                        <span className="section-kicker">
                          New customer
                        </span>
                        <strong>Enter customer details</strong>
                      </div>

                      <button
                        type="button"
                        className="icon-button"
                        onClick={() =>
                          setShowCustomerForm(false)
                        }
                      >
                        ×
                      </button>
                    </div>

                    <div className="new-customer-grid">
                      <label>
                        Customer name *
                        <input
                          value={customerForm.name}
                          onChange={(event) =>
                            setCustomerForm({
                              ...customerForm,
                              name: event.target.value,
                            })
                          }
                          placeholder="Rahul Sharma"
                        />
                      </label>

                      <label>
                        Company name
                        <input
                          value={customerForm.companyName}
                          onChange={(event) =>
                            setCustomerForm({
                              ...customerForm,
                              companyName: event.target.value,
                            })
                          }
                          placeholder="Rahul Traders"
                        />
                      </label>

                      <label>
                        Phone
                        <input
                          value={customerForm.phone}
                          onChange={(event) =>
                            setCustomerForm({
                              ...customerForm,
                              phone: event.target.value,
                            })
                          }
                          placeholder="9876543210"
                        />
                      </label>

                      <label>
                        Email
                        <input
                          type="email"
                          value={customerForm.email}
                          onChange={(event) =>
                            setCustomerForm({
                              ...customerForm,
                              email: event.target.value,
                            })
                          }
                          placeholder="customer@example.com"
                        />
                      </label>

                      <label className="new-customer-full">
                        Address
                        <textarea
                          rows={3}
                          value={customerForm.address}
                          onChange={(event) =>
                            setCustomerForm({
                              ...customerForm,
                              address: event.target.value,
                            })
                          }
                          placeholder="Full billing address"
                        />
                      </label>

                      <label>
                        State
                        <input
                          value={customerForm.state}
                          onChange={(event) =>
                            setCustomerForm({
                              ...customerForm,
                              state: event.target.value,
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
                          onChange={(event) =>
                            setCustomerForm({
                              ...customerForm,
                              gstin: event.target.value.toUpperCase(),
                            })
                          }
                          placeholder="GSTIN"
                        />
                      </label>
                    </div>

                    <div className="customer-form-actions">
                      <button
                        type="button"
                        className="button"
                        disabled={savingCustomer}
                        onClick={saveCustomer}
                      >
                        {savingCustomer
                          ? "Saving…"
                          : "Save Customer"}
                      </button>

                      <button
                        type="button"
                        className="button button-ghost"
                        onClick={() =>
                          setShowCustomerForm(false)
                        }
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="invoice-card">
                <div className="invoice-card-header">
                  <div>
                    <span className="section-kicker">
                      03 · Items
                    </span>
                    <h2>Products & services</h2>
                    <p>
                      Enter exactly what you are charging.
                    </p>
                  </div>

                  <button
                    type="button"
                    className="secondary-action"
                    onClick={addItem}
                  >
                    + Add item
                  </button>
                </div>

                <div className="items-table">
                  <div className="items-header">
                    <span>Description</span>
                    <span>HSN/SAC</span>
                    <span>Qty</span>
                    <span>Rate</span>
                    <span>Discount</span>
                    <span>Tax</span>
                    <span>Amount</span>
                    <span />
                  </div>

                  {items.map((item, index) => (
                    <div className="items-row" key={index}>
                      <input
                        value={item.description}
                        onChange={(event) =>
                          updateItem(
                            index,
                            "description",
                            event.target.value,
                          )
                        }
                        placeholder="Website development"
                      />

                      <input
                        value={item.hsnSac}
                        onChange={(event) =>
                          updateItem(
                            index,
                            "hsnSac",
                            event.target.value,
                          )
                        }
                        placeholder="9983"
                      />

                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(event) =>
                          updateItem(
                            index,
                            "quantity",
                            event.target.value,
                          )
                        }
                      />

                      <input
                        type="number"
                        min="0"
                        value={item.rate}
                        onChange={(event) =>
                          updateItem(
                            index,
                            "rate",
                            event.target.value,
                          )
                        }
                      />

                      <input
                        type="number"
                        min="0"
                        value={item.discount}
                        onChange={(event) =>
                          updateItem(
                            index,
                            "discount",
                            event.target.value,
                          )
                        }
                      />

                      <select
                        value={item.taxRate}
                        onChange={(event) =>
                          updateItem(
                            index,
                            "taxRate",
                            event.target.value,
                          )
                        }
                      >
                        <option value={0}>0%</option>
                        <option value={5}>5%</option>
                        <option value={12}>12%</option>
                        <option value={18}>18%</option>
                        <option value={28}>28%</option>
                      </select>

                      <strong>
                        {money(calculations[index]?.total || 0)}
                      </strong>

                      <button
                        type="button"
                        className="remove-item"
                        disabled={items.length === 1}
                        onClick={() => removeItem(index)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  className="add-line-button"
                  onClick={addItem}
                >
                  + Add another item
                </button>
              </div>

              <div className="invoice-card">
                <div className="invoice-card-header">
                  <div>
                    <span className="section-kicker">
                      04 · Tax
                    </span>
                    <h2>Tax details</h2>
                    <p>
                      Set tax treatment for the invoice.
                    </p>
                  </div>
                </div>

                <div className="invoice-fields-grid">
                  <label>
                    Default tax rate
                    <select
                      value={items[0]?.taxRate || 0}
                      onChange={(event) => {
                        const rate =
                          Number(event.target.value) || 0;

                        setItems((current) =>
                          current.map((item) => ({
                            ...item,
                            taxRate: rate,
                          })),
                        );
                      }}
                    >
                      <option value={0}>0% — No tax</option>
                      <option value={5}>5%</option>
                      <option value={12}>12%</option>
                      <option value={18}>18%</option>
                      <option value={28}>28%</option>
                    </select>
                  </label>

                  <label>
                    Tax treatment
                    <select defaultValue="intra">
                      <option value="intra">
                        Intra-state — CGST + SGST
                      </option>
                      <option value="inter">
                        Inter-state — IGST
                      </option>
                    </select>
                  </label>
                </div>
              </div>

              <div className="invoice-card">
                <div className="invoice-card-header">
                  <div>
                    <span className="section-kicker">
                      05 · Additional
                    </span>
                    <h2>Notes & terms</h2>
                    <p>
                      Add optional information for your customer.
                    </p>
                  </div>
                </div>

                <div className="notes-grid">
                  <label>
                    Notes
                    <textarea
                      rows={5}
                      value={notes}
                      onChange={(event) =>
                        setNotes(event.target.value)
                      }
                      placeholder="Thank you for your business."
                    />
                  </label>

                  <label>
                    Payment terms
                    <textarea
                      rows={5}
                      value={terms}
                      onChange={(event) =>
                        setTerms(event.target.value)
                      }
                      placeholder="Payment due within 15 days."
                    />
                  </label>
                </div>
              </div>
            </section>

            <aside className="invoice-preview-panel">
              <div className="preview-toolbar">
                <div>
                  <span>LIVE PREVIEW</span>
                  <strong>Invoice</strong>
                </div>

                <span className="preview-status">
                  DRAFT
                </span>
              </div>

              <div className="invoice-paper">
                <div className="paper-top">
                  <div>
                    <h3>
                      {business?.displayName ||
                        business?.legalName ||
                        "HisabBookes"}
                    </h3>

                    {business?.address && (
                      <span>{business.address}</span>
                    )}

                    {business?.state && (
                      <span>
                        {business.state}, {business.country}
                      </span>
                    )}

                    {business?.gstin && (
                      <span>
                        GSTIN: {business.gstin}
                      </span>
                    )}
                  </div>

                  <div className="paper-invoice-number">
                    <small>INVOICE</small>
                    <strong>{invoiceNumber}</strong>
                  </div>
                </div>

                <div className="paper-divider" />

                <div className="paper-meta-grid">
                  <div>
                    <small>BILL TO</small>

                    <strong>
                      {customer?.companyName ||
                        customer?.name ||
                        "Customer"}
                    </strong>

                    {customer?.companyName && (
                      <span>{customer.name}</span>
                    )}

                    {customer?.address && (
                      <span>{customer.address}</span>
                    )}

                    {customer?.state && (
                      <span>
                        {customer.state}, {customer.country}
                      </span>
                    )}

                    {customer?.gstin && (
                      <span>
                        GSTIN: {customer.gstin}
                      </span>
                    )}
                  </div>

                  <div className="paper-dates">
                    <div>
                      <small>ISSUED</small>
                      <strong>{invoiceDate}</strong>
                    </div>

                    <div>
                      <small>DUE</small>
                      <strong>{dueDate || "—"}</strong>
                    </div>
                  </div>
                </div>

                <div className="paper-items">
                  <div className="paper-items-head">
                    <span>DESCRIPTION</span>
                    <span>AMOUNT</span>
                  </div>

                  {items.map((item, index) => (
                    <div className="paper-item" key={index}>
                      <div>
                        <strong>
                          {item.description || "Service"}
                        </strong>

                        <span>
                          {item.quantity} × {money(item.rate)}
                          {item.hsnSac
                            ? ` · HSN/SAC ${item.hsnSac}`
                            : ""}
                        </span>
                      </div>

                      <strong>
                        {money(
                          calculations[index]?.total || 0,
                        )}
                      </strong>
                    </div>
                  ))}
                </div>

                <div className="paper-summary">
                  <div>
                    <span>Subtotal</span>
                    <strong>{money(subtotal)}</strong>
                  </div>

                  <div>
                    <span>Discount</span>
                    <strong>{money(discountTotal)}</strong>
                  </div>

                  <div>
                    <span>Taxable amount</span>
                    <strong>{money(taxableAmount)}</strong>
                  </div>

                  <div>
                    <span>CGST</span>
                    <strong>{money(cgst)}</strong>
                  </div>

                  <div>
                    <span>SGST</span>
                    <strong>{money(sgst)}</strong>
                  </div>

                  <div className="paper-grand-total">
                    <span>TOTAL</span>
                    <strong>{money(total)}</strong>
                  </div>
                </div>

                {(notes || terms) && (
                  <div className="paper-extra">
                    {notes && (
                      <div>
                        <small>NOTES</small>
                        <p>{notes}</p>
                      </div>
                    )}

                    {terms && (
                      <div>
                        <small>PAYMENT TERMS</small>
                        <p>{terms}</p>
                      </div>
                    )}
                  </div>
                )}

                <div className="paper-footer">
                  Generated by HisabBookes
                </div>
              </div>
            </aside>
          </div>
        </form>
      </main>
    </div>
  );
}
