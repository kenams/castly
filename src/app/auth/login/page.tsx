"use client";
export const dynamic = "force-dynamic";
import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) { setError(err.message); setLoading(false); return; }
    router.push("/dashboard");
  }

  return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <Link href="/" className="nav-logo" style={{ display: "block", textAlign: "center", marginBottom: "2rem" }}>Castly</Link>
        <div className="card">
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.5rem" }}>Connexion</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "1.75rem" }}>Retrouve tes castings et matches.</p>
          <form onSubmit={handleLogin} style={{ display: "grid", gap: "1rem" }}>
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="ton@email.fr" />
            </div>
            <div>
              <label className="label">Mot de passe</label>
              <input className="input" type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
            </div>
            {error && <p style={{ color: "var(--red)", fontSize: "0.85rem" }}>{error}</p>}
            <button className="btn-gold" type="submit" disabled={loading} style={{ width: "100%", marginTop: "0.5rem" }}>
              {loading ? "Connexion…" : "Se connecter →"}
            </button>
          </form>
          <p style={{ textAlign: "center", marginTop: "1.25rem", fontSize: "0.88rem", color: "var(--text-muted)" }}>
            Pas encore de compte ? <Link href="/auth/signup" style={{ color: "var(--gold)", textDecoration: "none" }}>Créer un compte</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
