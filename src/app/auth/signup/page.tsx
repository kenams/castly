"use client";
export const dynamic = "force-dynamic";
import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type Role = "artist" | "recruiter";

export default function SignupPage() {
  const [role, setRole] = useState<Role | null>(null);
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
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: { role },
      },
    });
    if (err) { setError(err.message); setLoading(false); return; }
    if (data.session) {
      router.push(role === "recruiter" ? "/recruiter/onboarding" : "/onboarding");
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
              Lien de confirmation envoyé à <strong style={{ color: "var(--text)" }}>{email}</strong>.
            </p>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
              Déjà confirmé ? <Link href="/auth/login" style={{ color: "var(--gold)", textDecoration: "none" }}>Connexion</Link>
            </p>
          </div>
        </div>
      </main>
    );
  }

  // Step 1: choose role
  if (!role) {
    return (
      <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
        <div style={{ width: "100%", maxWidth: 560 }}>
          <Link href="/" className="nav-logo" style={{ display: "block", textAlign: "center", marginBottom: "2rem" }}>Castly</Link>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 900, textAlign: "center", marginBottom: "0.5rem" }}>Je suis…</h1>
          <p style={{ color: "var(--text-muted)", textAlign: "center", marginBottom: "2rem", fontSize: "0.95rem" }}>Choisis ton profil pour une expérience adaptée</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <button onClick={() => setRole("artist")} className="card" style={{ cursor: "pointer", textAlign: "center", padding: "2rem 1.5rem", border: "1px solid var(--border)", background: "var(--bg-card)", transition: "all 0.15s" }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--gold-border)")}
              onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}>
              <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>🎭</div>
              <h2 style={{ fontWeight: 800, marginBottom: "0.5rem" }}>Artiste</h2>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", lineHeight: 1.5 }}>
                Acteur, chanteur, rappeur, danseur, mannequin… Je cherche des castings et des opportunités.
              </p>
            </button>
            <button onClick={() => setRole("recruiter")} className="card" style={{ cursor: "pointer", textAlign: "center", padding: "2rem 1.5rem", border: "1px solid var(--border)", background: "var(--bg-card)", transition: "all 0.15s" }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--gold-border)")}
              onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}>
              <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>🎬</div>
              <h2 style={{ fontWeight: 800, marginBottom: "0.5rem" }}>Recruteur</h2>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", lineHeight: 1.5 }}>
                Agence, production, marque, label… Je cherche des talents pour mes projets.
              </p>
            </button>
          </div>
          <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.88rem", color: "var(--text-muted)" }}>
            Déjà un compte ? <Link href="/auth/login" style={{ color: "var(--gold)", textDecoration: "none" }}>Connexion</Link>
          </p>
        </div>
      </main>
    );
  }

  // Step 2: email + password
  return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <Link href="/" className="nav-logo" style={{ display: "block", textAlign: "center", marginBottom: "2rem" }}>Castly</Link>
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
            <button onClick={() => setRole(null)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "1.2rem" }}>←</button>
            <div>
              <h1 style={{ fontSize: "1.4rem", fontWeight: 800 }}>{role === "artist" ? "Compte artiste" : "Compte recruteur"}</h1>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>{role === "artist" ? "Trouve tes prochains castings" : "Trouve les talents qu'il te faut"}</p>
            </div>
          </div>
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
