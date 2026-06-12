"use client";
export const dynamic = "force-dynamic";
import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const router = useRouter();

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    const supabase = createClient();
    if (!supabase) return;
    const { data, error: err } = await supabase.auth.signUp({
      email, password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (err) { setError(err.message); setLoading(false); return; }
    if (data.session) {
      router.push("/onboarding");
    } else {
      setEmailSent(true);
      setLoading(false);
    }
  }

  if (emailSent) {
    return (
      <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
        <div style={{ width: "100%", maxWidth: 420 }}>
          <Link href="/" className="nav-logo" style={{ display: "block", textAlign: "center", marginBottom: "2rem" }}>Castly</Link>
          <div className="card" style={{ textAlign: "center", padding: "2.5rem" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>📧</div>
            <h2 style={{ fontWeight: 800, marginBottom: "0.75rem" }}>Vérifie ta boîte mail</h2>
            <p style={{ color: "var(--text-muted)", lineHeight: 1.6, marginBottom: "1.5rem" }}>
              Un lien de confirmation a été envoyé à <strong style={{ color: "var(--text)" }}>{email}</strong>.
              Clique dessus pour activer ton compte.
            </p>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
              Déjà confirmé ? <Link href="/auth/login" style={{ color: "var(--gold)", textDecoration: "none" }}>Connexion</Link>
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <Link href="/" className="nav-logo" style={{ display: "block", textAlign: "center", marginBottom: "2rem" }}>Castly</Link>
        <div className="card">
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.5rem" }}>Créer mon compte</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "1.75rem" }}>Gratuit. Commence en 2 minutes.</p>
          <form onSubmit={handleSignup} style={{ display: "grid", gap: "1rem" }}>
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="ton@email.fr" />
            </div>
            <div>
              <label className="label">Mot de passe</label>
              <input className="input" type="password" required minLength={8} value={password} onChange={e => setPassword(e.target.value)} placeholder="8 caractères minimum" />
            </div>
            {error && <p style={{ color: "var(--red)", fontSize: "0.85rem" }}>{error}</p>}
            <button className="btn-gold" type="submit" disabled={loading} style={{ width: "100%", marginTop: "0.5rem" }}>
              {loading ? "Création…" : "Créer mon compte →"}
            </button>
          </form>
          <p style={{ textAlign: "center", marginTop: "1.25rem", fontSize: "0.88rem", color: "var(--text-muted)" }}>
            Déjà un compte ? <Link href="/auth/login" style={{ color: "var(--gold)", textDecoration: "none" }}>Connexion</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
