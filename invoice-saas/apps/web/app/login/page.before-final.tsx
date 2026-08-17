"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, saveAccessToken } from "../../src/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("test@hisabbookes.local");
  const [password, setPassword] = useState("TestPass123!");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await apiFetch<{ accessToken: string }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      saveAccessToken(data.accessToken);
      router.replace("/dashboard");
    } catch (error) {
      setError(error instanceof Error ? error.message : "LOGIN_FAILED");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 420, margin: "80px auto", padding: 24 }}>
      <h1>HisabBookes</h1>
      <p>Login to your account</p>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email"
          required
        />

        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Password"
          required
        />

        {error && <p style={{ color: "red" }}>{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </main>
  );
}
