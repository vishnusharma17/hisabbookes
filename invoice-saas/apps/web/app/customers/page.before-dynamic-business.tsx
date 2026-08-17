"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { apiFetch } from "../../src/lib/api";

const BUSINESS_ID = process.env.NEXT_PUBLIC_BUSINESS_ID;

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

type CustomerInput = {
  name: string;
  companyName: string;
  address: string;
  state: string;
  country: string;
  gstin: string;
  email: string;
  phone: string;
};

const emptyForm: CustomerInput = {
  name: "",
  companyName: "",
  address: "",
  state: "",
  country: "India",
  gstin: "",
  email: "",
  phone: "",
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [form, setForm] = useState<CustomerInput>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadCustomers() {
    if (!BUSINESS_ID) {
      setError("NEXT_PUBLIC_BUSINESS_ID is not configured");
      setLoading(false);
      return;
    }

    try {
      const data = await apiFetch<{ customers: Customer[] }>(
        `/businesses/${BUSINESS_ID}/customers`,
      );
      setCustomers(data.customers);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "LOAD_FAILED");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadCustomers();
  }, []);

  const filteredCustomers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return customers;

    return customers.filter((customer) =>
      [
        customer.name,
        customer.companyName,
        customer.email,
        customer.phone,
        customer.gstin,
        customer.state,
      ]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(query)),
    );
  }, [customers, search]);

  function updateField(key: keyof CustomerInput, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function startEdit(customer: Customer) {
    setEditingId(customer.id);
    setMessage("");
    setError("");
    setForm({
      name: customer.name,
      companyName: customer.companyName ?? "",
      address: customer.address ?? "",
      state: customer.state ?? "",
      country: customer.country || "India",
      gstin: customer.gstin ?? "",
      email: customer.email ?? "",
      phone: customer.phone ?? "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!BUSINESS_ID) return;

    setSaving(true);
    setError("");
    setMessage("");

    const payload = {
      name: form.name.trim(),
      companyName: form.companyName.trim() || undefined,
      address: form.address.trim() || undefined,
      state: form.state.trim() || undefined,
      country: form.country.trim() || "India",
      gstin: form.gstin.trim().toUpperCase() || undefined,
      email: form.email.trim().toLowerCase() || undefined,
      phone: form.phone.trim() || undefined,
    };

    try {
      if (editingId) {
        await apiFetch(`/businesses/${BUSINESS_ID}/customers/${editingId}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        setMessage("Customer updated successfully.");
      } else {
        await apiFetch(`/businesses/${BUSINESS_ID}/customers`, {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setMessage("Customer added successfully.");
      }

      resetForm();
      await loadCustomers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "SAVE_FAILED");
    } finally {
      setSaving(false);
    }
  }

  async function removeCustomer(customer: Customer) {
    if (!BUSINESS_ID) return;

    const label = customer.companyName
      ? `${customer.companyName} — ${customer.name}`
      : customer.name;

    if (!window.confirm(`Delete ${label}?`)) return;

    setDeletingId(customer.id);
    setError("");
    setMessage("");

    try {
      await apiFetch(`/businesses/${BUSINESS_ID}/customers/${customer.id}`, {
        method: "DELETE",
      });

      if (editingId === customer.id) resetForm();
      setMessage("Customer deleted successfully.");
      await loadCustomers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "DELETE_FAILED");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link href="/" className="side-brand">
          HisabBookes
        </Link>

        <div className="side-label">Workspace</div>

        <nav className="side-nav">
          <Link href="/dashboard">Overview</Link>
          <Link href="/invoices">Invoices</Link>
          <Link className="active" href="/customers">
            Customers
          </Link>
          <Link href="/invoice/new">Create invoice</Link>
          <Link href="/business-profile">Business profile</Link>
        </nav>

        <div className="side-bottom">
          <Link href="/dashboard" className="back-link">
            ← Dashboard
          </Link>
        </div>
      </aside>

      <main className="dashboard-main customers-main">
        <header className="customers-header">
          <div>
            <span className="customers-kicker">Workspace</span>
            <h1>Customers</h1>
            <p>Keep your customer details organized and ready for invoices.</p>
          </div>

          <div className="customers-header-actions">
            <span className="customers-count">
              {customers.length} customer{customers.length === 1 ? "" : "s"}
            </span>
            <button
              type="button"
              className="button"
              onClick={() => {
                resetForm();
                document
                  .getElementById("customer-form")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              + Add customer
            </button>
          </div>
        </header>

        {error && <div className="customers-alert customers-alert-error">{error}</div>}
        {message && (
          <div className="customers-alert customers-alert-success">{message}</div>
        )}

        <section className="customers-layout">
          <section className="panel customer-form-panel" id="customer-form">
            <div className="customers-panel-head">
              <div>
                <span className="customers-kicker">Customer details</span>
                <h2>{editingId ? "Edit customer" : "Add customer"}</h2>
                <p>
                  {editingId
                    ? "Update the customer information used on invoices."
                    : "Add the details once and reuse them across invoices."}
                </p>
              </div>

              {editingId && (
                <button type="button" className="customers-secondary-button" onClick={resetForm}>
                  Cancel
                </button>
              )}
            </div>

            <form onSubmit={submit} className="customer-form">
              <label>
                Customer name *
                <input
                  value={form.name}
                  onChange={(event) => updateField("name", event.target.value)}
                  placeholder="Rahul Sharma"
                  required
                />
              </label>

              <label>
                Company name
                <input
                  value={form.companyName}
                  onChange={(event) => updateField("companyName", event.target.value)}
                  placeholder="Rahul Traders"
                />
              </label>

              <label className="customer-field-full">
                Address
                <textarea
                  rows={3}
                  value={form.address}
                  onChange={(event) => updateField("address", event.target.value)}
                  placeholder="Shop / office address"
                />
              </label>

              <label>
                State
                <input
                  value={form.state}
                  onChange={(event) => updateField("state", event.target.value)}
                  placeholder="Delhi"
                />
              </label>

              <label>
                Country *
                <input
                  value={form.country}
                  onChange={(event) => updateField("country", event.target.value)}
                  placeholder="India"
                  required
                />
              </label>

              <label>
                GSTIN
                <input
                  value={form.gstin}
                  onChange={(event) =>
                    updateField("gstin", event.target.value.toUpperCase())
                  }
                  placeholder="22AAAAA0000A1Z5"
                  maxLength={15}
                />
              </label>

              <label>
                Email
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => updateField("email", event.target.value)}
                  placeholder="customer@example.com"
                />
              </label>

              <label>
                Phone
                <input
                  value={form.phone}
                  onChange={(event) => updateField("phone", event.target.value)}
                  placeholder="+91 98765 43210"
                />
              </label>

              <div className="customer-form-actions customer-field-full">
                <button type="submit" className="button" disabled={saving}>
                  {saving
                    ? "Saving…"
                    : editingId
                      ? "Update customer"
                      : "Add customer"}
                </button>

                {editingId && (
                  <button
                    type="button"
                    className="customers-secondary-button"
                    onClick={resetForm}
                  >
                    Clear changes
                  </button>
                )}
              </div>
            </form>
          </section>

          <section className="panel customer-list-panel">
            <div className="customers-panel-head">
              <div>
                <span className="customers-kicker">Directory</span>
                <h2>Customer list</h2>
                <p>
                  {search
                    ? `${filteredCustomers.length} result${
                        filteredCustomers.length === 1 ? "" : "s"
                      } found`
                    : "Your saved customers."}
                </p>
              </div>
            </div>

            <div className="customer-search">
              <span>⌕</span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search name, company, email, GSTIN…"
                aria-label="Search customers"
              />
              {search && (
                <button type="button" onClick={() => setSearch("")} aria-label="Clear search">
                  ×
                </button>
              )}
            </div>

            {loading ? (
              <div className="customers-empty">Loading customers…</div>
            ) : filteredCustomers.length === 0 ? (
              <div className="customers-empty">
                <div className="customers-empty-icon">+</div>
                <h3>{search ? "No matching customers" : "No customers yet"}</h3>
                <p>
                  {search
                    ? "Try another name, company, email or GSTIN."
                    : "Add your first customer to start creating invoices."}
                </p>
                {!search && (
                  <button
                    type="button"
                    className="customers-secondary-button"
                    onClick={() =>
                      document
                        .getElementById("customer-form")
                        ?.scrollIntoView({ behavior: "smooth" })
                    }
                  >
                    Add first customer
                  </button>
                )}
              </div>
            ) : (
              <div className="customer-list">
                {filteredCustomers.map((customer) => (
                  <article className="customer-card" key={customer.id}>
                    <div className="customer-avatar">
                      {(customer.companyName ?? customer.name).charAt(0).toUpperCase()}
                    </div>

                    <div className="customer-card-body">
                      <div className="customer-card-top">
                        <div>
                          <h3>{customer.companyName ?? customer.name}</h3>
                          {customer.companyName && <p>{customer.name}</p>}
                        </div>

                        <div className="customer-card-actions">
                          <button type="button" onClick={() => startEdit(customer)}>
                            Edit
                          </button>
                          <button
                            type="button"
                            className="danger"
                            disabled={deletingId === customer.id}
                            onClick={() => void removeCustomer(customer)}
                          >
                            {deletingId === customer.id ? "Deleting…" : "Delete"}
                          </button>
                        </div>
                      </div>

                      <div className="customer-meta">
                        {customer.email && <span>✉ {customer.email}</span>}
                        {customer.phone && <span>☎ {customer.phone}</span>}
                        {customer.gstin && <span>GSTIN {customer.gstin}</span>}
                        {customer.state && <span>{customer.state}, {customer.country}</span>}
                      </div>

                      {customer.address && (
                        <p className="customer-address">{customer.address}</p>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </section>
      </main>
    </div>
  );
}
