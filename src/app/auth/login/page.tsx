"use client";
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

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    const supabase = createClient();
    const { data, error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) { setError(err.message); setLoading(false); return; }
    const role = data.user?.user_metadata?.role;
    router.push(role === "recruiter" ? "/recruiter/dashboard" : "/dashboard");
  }

  return (
    <main style={{ minHeight: "100vh", display: "grid", gridTemplateColumns: "1fr 1fr", background: "var(--bg)" }}>
      {/* LEFT — Déco */}
      <div style={{ position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "2.5rem", background: "var(--bg-2)", borderRight: "1px solid var(--border)" }}>
        <Link href="/" className="nav-logo" style={{ fontSize: "1.3rem", zIndex: 1 }}>Castly</Link>

        <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
          <div className="orb" style={{ width: 500, height: 500, background: "rgba(232,184,109,0.07)", top: "10%", left: "-10%", filter: "blur(90px)" }} />
          <div className="orb" style={{ width: 350, height: 350, background: "rgba(56,199,147,0.05)", bottom: "10%", right: "-5%", filter: "blur(80px)", animationDelay: "-5s" }} />
        </div>

        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "grid", gap: "1rem", marginBottom: "2.5rem" }}>
            {[
              { score: 94, title: "Rappeur trap pour clip officiel", loc: "Paris", paid: true },
              { score: 78, title: "Feat R&B artiste signé Universal", loc: "Paris", paid: true },
              { score: 61, title: "Danseur hip-hop clip rappeur", loc: "Lyon", paid: false },
            ].map(c => (
              <div key={c.title} className="card" style={{ display: "flex", gap: "0.9rem", alignItems: "center", padding: "0.9rem 1.1rem" }}>
                <div className={`score-badge ${c.score >= 70 ? "score-high" : "score-mid"}`} style={{ width: 42, height: 42, fontSize: "0.85rem" }}>{c.score}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 700, fontSize: "0.82rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.title}</p>
                  <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "0.15rem" }}>📍 {c.loc}</p>
                </div>
                {c.paid && <span className="pill-green pill" style={{ fontSize: "0.65rem" }}>Rémunéré</span>}
              </div>
            ))}
          </div>
          <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.65 }}>
            &ldquo;En 2 jours j&apos;avais 3 castings matchés à plus de 80%. L&apos;IA a compris mon style mieux que mon agent.&rdquo;
          </p>
          <p style={{ fontSize: "0.78rem", color: "var(--text-faint)", marginTop: "0.5rem" }}>— Rappeur, Paris</p>
        </div>
      </div>

      {/* RIGHT — Form */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "3rem 2.5rem" }}>
        <div style={{ width: "100%", maxWidth: 380 }}>
          <div className="animate-fade-up" style={{ marginBottom: "2.5rem" }}>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 900, letterSpacing: "-0.04em", marginBottom: "0.5rem" }}>Bon retour 👋</h1>
            <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>Connecte-toi pour accéder à tes castings matchés.</p>
          </div>

          <form onSubmit={handleLogin} className="animate-fade-up-2" style={{ display: "grid", gap: "1.1rem" }}>
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="ton@email.fr" autoFocus />
            </div>
            <div>
              <label className="label">Mot de passe</label>
              <input className="input" type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
            </div>
            {error && (
              <div style={{ padding: "0.75rem 1rem", borderRadius: 12, background: "var(--red-dim)", border: "1px solid var(--red-border)", fontSize: "0.83rem", color: "var(--red)" }}>
                {error}
              </div>
            )}
            <button className="btn-gold" type="submit" disabled={loading} style={{ width: "100%", padding: "0.8rem", fontSize: "0.9rem", marginTop: "0.25rem" }}>
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", gap: "0.5rem", justifyContent: "center" }}>
                  <span style={{ width: 14, height: 14, border: "2px solid rgba(0,0,0,0.2)", borderTop: "2px solid #000", borderRadius: "50%", animation: "spin-slow 0.7s linear infinite", display: "inline-block" }} />
                  Connexion…
                </span>
              ) : "Se connecter →"}
            </button>
          </form>

          <p className="animate-fade-up-3" style={{ textAlign: "center", marginTop: "1.75rem", fontSize: "0.85rem", color: "var(--text-muted)" }}>
            Pas encore de compte ?{" "}
            <Link href="/auth/signup" style={{ color: "var(--gold)", textDecoration: "none", fontWeight: 600 }}>Créer un compte</Link>
          </p>
        </div>
      </div>

      <style>{`@media (max-width: 720px) { main { grid-template-columns: 1fr !important; } main > div:first-child { display: none !important; } }`}</style>
    </main>
  );
}
