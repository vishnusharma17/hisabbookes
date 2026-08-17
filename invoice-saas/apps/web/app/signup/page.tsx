"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch, saveAccessToken } from "../../src/lib/api";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const data = await apiFetch<{ accessToken: string }>("/auth/signup", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      saveAccessToken(data.accessToken);
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "SIGNUP_FAILED");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <Link className="brand-link" href="/">
          HisabBookes
        </Link>

        <span className="eyebrow">Start free</span>
        <h1>Create your account</h1>
        <p>
          Set up your HisabBookes account and start creating invoices.
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@company.com"
              autoComplete="email"
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 8 characters"
              autoComplete="new-password"
              minLength={8}
              required
            />
          </label>

          <label>
            Confirm password
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Repeat your password"
              autoComplete="new-password"
              minLength={8}
              required
            />
          </label>

          {error && <p className="auth-error">{error}</p>}

          <button className="button" type="submit" disabled={loading}>
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link href="/login">Sign in</Link>
        </p>

        <Link className="auth-back" href="/">
          ← Back to HisabBookes
        </Link>
      </div>
    </main>
  );
}
