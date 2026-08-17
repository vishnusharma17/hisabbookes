"use client";

import { FormEvent, useEffect, useState } from "react";
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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

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

  function updateField(key: keyof CustomerInput, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function startEdit(customer: Customer) {
    setEditingId(customer.id);
    setForm({
      name: customer.name,
      companyName: customer.companyName ?? "",
      address: customer.address ?? "",
      state: customer.state ?? "",
      country: customer.country,
      gstin: customer.gstin ?? "",
      email: customer.email ?? "",
      phone: customer.phone ?? "",
    });
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

    const payload = Object.fromEntries(
      Object.entries(form).filter(([, value]) => value.trim() !== ""),
    );

    try {
      if (editingId) {
        await apiFetch(
          `/businesses/${BUSINESS_ID}/customers/${editingId}`,
          {
            method: "PATCH",
            body: JSON.stringify(payload),
          },
        );
      } else {
        await apiFetch(`/businesses/${BUSINESS_ID}/customers`, {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      resetForm();
      await loadCustomers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "SAVE_FAILED");
    } finally {
      setSaving(false);
    }
  }

  async function removeCustomer(id: string) {
    if (!BUSINESS_ID) return;
    if (!window.confirm("Delete this customer?")) return;

    try {
      await apiFetch(`/businesses/${BUSINESS_ID}/customers/${id}`, {
        method: "DELETE",
      });
      await loadCustomers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "DELETE_FAILED");
    }
  }

  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: 32 }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          <h1>Customers</h1>
          <p>Manage your business customers.</p>
        </div>
        <a href="/dashboard">Dashboard</a>
      </div>

      {error && <p style={{ color: "crimson" }}>{error}</p>}

      <section style={{ marginTop: 24, border: "1px solid #ddd", borderRadius: 12, padding: 20 }}>
        <h2>{editingId ? "Edit customer" : "Add customer"}</h2>

        <form
          onSubmit={submit}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 12,
          }}
        >
          {(
            [
              ["name", "Name", true],
              ["companyName", "Company name", false],
              ["address", "Address", false],
              ["state", "State", false],
              ["country", "Country", true],
              ["gstin", "GSTIN", false],
              ["email", "Email", false],
              ["phone", "Phone", false],
            ] as const
          ).map(([key, label, required]) => (
            <label key={key}>
              {label}
              <input
                type={key === "email" ? "email" : "text"}
                value={form[key]}
                onChange={(event) => updateField(key, event.target.value)}
                required={required}
                style={{
                  display: "block",
                  width: "100%",
                  marginTop: 4,
                  padding: 9,
                  boxSizing: "border-box",
                }}
              />
            </label>
          ))}

          <div style={{ gridColumn: "1 / -1", display: "flex", gap: 8 }}>
            <button type="submit" disabled={saving}>
              {saving ? "Saving..." : editingId ? "Update customer" : "Add customer"}
            </button>

            {editingId && (
              <button type="button" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      <section style={{ marginTop: 32 }}>
        <h2>Customer list</h2>

        {loading ? (
          <p>Loading customers...</p>
        ) : customers.length === 0 ? (
          <p>No customers yet.</p>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {customers.map((customer) => (
              <article
                key={customer.id}
                style={{
                  border: "1px solid #eee",
                  borderRadius: 10,
                  padding: 16,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
                  <div>
                    <strong>{customer.name}</strong>
                    {customer.companyName && <div>{customer.companyName}</div>}
                    {customer.email && <div>{customer.email}</div>}
                    {customer.phone && <div>{customer.phone}</div>}
                  </div>

                  <div style={{ display: "flex", gap: 8, alignItems: "start" }}>
                    <button type="button" onClick={() => startEdit(customer)}>
                      Edit
                    </button>
                    <button type="button" onClick={() => removeCustomer(customer.id)}>
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
