export default function SignupPage() {
  return (
    <main className="auth-page">
      <div className="auth-card">
        <a className="brand-link" href="/">BillFlow</a>
        <span className="eyebrow">Start free</span>
        <h1>Create your account</h1>
        <p>Account creation is the next implementation task. The repository foundation is ready.</p>
        <form>
          <label>Email<input type="email" name="email" placeholder="you@company.com" disabled /></label>
          <label>Password<input type="password" name="password" placeholder="••••••••" disabled /></label>
          <button type="button" disabled>Create account</button>
        </form>
        <a href="/">← Back to BillFlow</a>
      </div>
    </main>
  );
}
