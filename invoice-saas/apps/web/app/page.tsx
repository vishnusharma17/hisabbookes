const features = [
  "Professional invoice PDFs",
  "GST-ready fields",
  "Draft and finalized invoices",
  "Invoice history"
];

export default function Home() {
  return (
    <main>
      <nav className="nav shell">
        <div className="brand">BillFlow</div>
        <div className="nav-links">
          <a href="#how-it-works">How it works</a>
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
          <a className="button button-small" href="/signup">Create Free Invoice</a>
        </div>
      </nav>

      <section className="hero shell">
        <div className="hero-copy">
          <span className="eyebrow">India-first invoicing for small businesses</span>
          <h1>Create professional invoices in seconds.</h1>
          <p>Create, customize and download invoices without complicated accounting software.</p>
          <div className="hero-actions">
            <a className="button" href="/signup">Create Free Invoice</a>
            <a className="button button-ghost" href="#how-it-works">See how it works</a>
          </div>
          <p className="microcopy">Start free · No card required for the MVP</p>
        </div>
        <div className="invoice-card" aria-label="Invoice preview">
          <div className="invoice-top"><strong>INVOICE</strong><span>INV-2026-00001</span></div>
          <div className="invoice-lines"><span>Website development</span><strong>₹50,000</strong></div>
          <div className="invoice-lines"><span>Maintenance</span><strong>₹10,000</strong></div>
          <div className="invoice-total"><span>Total</span><strong>₹60,000</strong></div>
        </div>
      </section>

      <section id="how-it-works" className="section shell">
        <span className="eyebrow">Simple workflow</span>
        <h2>From details to downloadable invoice.</h2>
        <div className="steps">
          {[
            ["01", "Add business", "Save your business details once."],
            ["02", "Add customer", "Enter who you are billing."],
            ["03", "Create invoice", "Add services, rates, discounts and approved tax fields."],
            ["04", "Preview & PDF", "Finalize and download a professional invoice."]
          ].map(([num, title, copy]) => <article className="step" key={num}><span>{num}</span><h3>{title}</h3><p>{copy}</p></article>)}
        </div>
      </section>

      <section id="features" className="section section-muted">
        <div className="shell">
          <span className="eyebrow">MVP</span>
          <h2>Everything needed to send a real invoice.</h2>
          <div className="feature-grid">
            {features.map((feature) => <div className="feature" key={feature}><span>✓</span>{feature}</div>)}
          </div>
        </div>
      </section>

      <section id="pricing" className="section shell">
        <span className="eyebrow">Pricing proposal</span>
        <h2>Start free. Upgrade when invoicing becomes a habit.</h2>
        <div className="pricing-grid">
          <article className="price-card"><h3>Free</h3><div className="price">₹0</div><p>5 invoices/month · 1 business · PDF download</p><a className="button button-ghost" href="/signup">Start free</a></article>
          <article className="price-card featured"><span className="pill">Proposed</span><h3>Pro</h3><div className="price">₹249<span>/mo</span></div><p>Unlimited invoices · branding · history · sharing</p><a className="button" href="/signup">Create account</a></article>
          <article className="price-card"><h3>Business</h3><div className="price">₹599<span>/mo</span></div><p>Multiple businesses/users · recurring invoices · reports</p><a className="button button-ghost" href="/signup">Create account</a></article>
        </div>
      </section>

      <footer className="footer"><div className="shell"><strong>BillFlow</strong><span>Create professional invoices. Get paid faster.</span></div></footer>
    </main>
  );
}
