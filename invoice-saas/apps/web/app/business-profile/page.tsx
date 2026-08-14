"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { apiFetch } from "../../src/lib/api";

const BUSINESS_ID = process.env.NEXT_PUBLIC_BUSINESS_ID;

type Business = {
  id: string;
  legalName: string;
  displayName: string | null;
  address: string | null;
  state: string | null;
  country: string;
  gstin: string | null;
  contactEmail: string | null;
  phone: string | null;
  logoUrl: string | null;
  invoiceNumberPrefix: string;
  invoiceNumberStart: number;
};

export default function BusinessProfilePage() {
  const [business, setBusiness] = useState<Business | null>(null);
  const [form, setForm] = useState({
    legalName: "",
    displayName: "",
    address: "",
    state: "",
    country: "India",
    gstin: "",
    contactEmail: "",
    phone: "",
    invoiceNumberPrefix: "INV",
    invoiceNumberStart: 1,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!BUSINESS_ID) {
      setError("NEXT_PUBLIC_BUSINESS_ID is not configured");
      setLoading(false);
      return;
    }

    apiFetch<{ business: Business }>(`/businesses/${BUSINESS_ID}`)
      .then(({ business }) => {
        setBusiness(business);
        setForm({
          legalName: business.legalName ?? "",
          displayName: business.displayName ?? "",
          address: business.address ?? "",
          state: business.state ?? "",
          country: business.country ?? "India",
          gstin: business.gstin ?? "",
          contactEmail: business.contactEmail ?? "",
          phone: business.phone ?? "",
          invoiceNumberPrefix: business.invoiceNumberPrefix ?? "INV",
          invoiceNumberStart: business.invoiceNumberStart ?? 1,
        });
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!BUSINESS_ID) return;

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const { business } = await apiFetch<{ business: Business }>(
        `/businesses/${BUSINESS_ID}`,
        {
          method: "PATCH",
          body: JSON.stringify(form),
        },
      );

      setBusiness(business);
      setMessage("Business profile saved successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "SAVE_FAILED");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <main className="dashboard-main">Loading business profile…</main>;
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
          <Link href="/customers">Customers</Link>
          <Link href="/invoice/new">Create invoice</Link>
          <Link className="active" href="/business-profile">
            Business Profile
          </Link>
        </nav>

        <div className="side-bottom">
          <Link href="/" className="back-link">
            ← Back to website
          </Link>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="dash-header">
          <div>
            <span className="eyebrow">Settings</span>
            <h1>Business Profile</h1>
            <p>Keep your business details ready for invoices and PDFs.</p>
          </div>
        </header>

        <section className="panel profile-panel">
          <form onSubmit={save}>
            <div className="profile-grid">
              <label>
                Legal Name
                <input
                  value={form.legalName}
                  onChange={(e) =>
                    setForm({ ...form, legalName: e.target.value })
                  }
                  required
                />
              </label>

              <label>
                Display Name
                <input
                  value={form.displayName}
                  onChange={(e) =>
                    setForm({ ...form, displayName: e.target.value })
                  }
                />
              </label>

              <label className="profile-full">
                Address
                <textarea
                  value={form.address}
                  onChange={(e) =>
                    setForm({ ...form, address: e.target.value })
                  }
                  rows={3}
                />
              </label>

              <label>
                State
                <input
                  value={form.state}
                  onChange={(e) =>
                    setForm({ ...form, state: e.target.value })
                  }
                />
              </label>

              <label>
                Country
                <input
                  value={form.country}
                  onChange={(e) =>
                    setForm({ ...form, country: e.target.value })
                  }
                  required
                />
              </label>

              <label>
                GSTIN
                <input
                  value={form.gstin}
                  onChange={(e) =>
                    setForm({ ...form, gstin: e.target.value.toUpperCase() })
                  }
                  maxLength={15}
                />
              </label>

              <label>
                Contact Email
                <input
                  type="email"
                  value={form.contactEmail}
                  onChange={(e) =>
                    setForm({ ...form, contactEmail: e.target.value })
                  }
                />
              </label>

              <label>
                Phone
                <input
                  value={form.phone}
                  onChange={(e) =>
                    setForm({ ...form, phone: e.target.value })
                  }
                />
              </label>
            </div>

            <div className="profile-section">
              <div className="profile-section-heading">
                <span className="eyebrow">Invoices</span>
                <h2>Invoice Numbering</h2>
                <p>
                  Choose how new invoice numbers are generated.
                </p>
              </div>

              <div className="profile-grid">
                <label>
                  Invoice Prefix
                  <input
                    value={form.invoiceNumberPrefix}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        invoiceNumberPrefix: e.target.value.toUpperCase(),
                      })
                    }
                    maxLength={20}
                    placeholder="INV"
                  />
                </label>

                <label>
                  Starting Number
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={form.invoiceNumberStart}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        invoiceNumberStart: Number(e.target.value),
                      })
                    }
                  />
                </label>
              </div>

              <div className="invoice-number-example">
                <span>Next invoice example</span>
                <strong>
                  {form.invoiceNumberPrefix || "INV"}-
                  {String(form.invoiceNumberStart || 1).padStart(4, "0")}
                </strong>
              </div>
            </div>

            {error && <p style={{ color: "crimson" }}>{error}</p>}
            {message && <p style={{ color: "#15803d" }}>{message}</p>}

            <div style={{ marginTop: 24 }}>
              <button className="button" type="submit" disabled={saving}>
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </form>
        </section>

        {business?.logoUrl && (
          <section className="panel" style={{ marginTop: 16 }}>
            <h2>Logo</h2>
            <p>Logo URL is currently configured for this business.</p>
          </section>
        )}
      </main>
    </div>
  );
}
