"use client";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";

type Role = "artist" | "recruiter";

function SignupInner() {
  const searchParams = useSearchParams();
  const [role, setRole] = useState<Role | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const r = searchParams.get("role") as Role | null;
    if (r === "artist" || r === "recruiter") setRole(r);
  }, [searchParams]);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    const supabase = createClient();
    const { data, error: err } = await supabase.auth.signUp({
      email, password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback`, data: { role } },
    });
    if (err) { setError(err.message); setLoading(false); return; }
    if (data.session) {
      router.push(role === "recruiter" ? "/recruiter/onboarding" : "/onboarding");
    } else {
      setEmailSent(true); setLoading(false);
    }
  }

  if (emailSent) {
    return (
      <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem", background: "var(--bg)" }}>
        <div style={{ width: "100%", maxWidth: 420, textAlign: "center" }} className="animate-fade-up">
          <Link href="/" className="nav-logo" style={{ display: "block", marginBottom: "2.5rem", fontSize: "1.3rem" }}>Castly</Link>
          <div className="card" style={{ padding: "3rem 2rem" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--gold-dim)", border: "1px solid var(--gold-border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.8rem", margin: "0 auto 1.5rem" }}>📧</div>
            <h2 style={{ fontSize: "1.4rem", fontWeight: 900, letterSpacing: "-0.03em", marginBottom: "0.75rem" }}>Vérifie ta boîte mail</h2>
            <p style={{ color: "var(--text-muted)", lineHeight: 1.7, fontSize: "0.88rem", marginBottom: "1.5rem" }}>
              Lien de confirmation envoyé à <strong style={{ color: "var(--text)" }}>{email}</strong>.<br />Clique dessus pour activer ton compte.
            </p>
            <p style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>
              Déjà confirmé ?{" "}
              <Link href="/auth/login" style={{ color: "var(--gold)", textDecoration: "none", fontWeight: 600 }}>Se connecter</Link>
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (!role) {
    return (
      <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem", background: "var(--bg)", position: "relative", overflow: "hidden" }}>
        <div className="orb" style={{ width: 500, height: 500, background: "rgba(232,184,109,0.06)", top: "50%", left: "50%", transform: "translate(-50%,-50%)", filter: "blur(100px)", position: "absolute" }} />
        <div style={{ width: "100%", maxWidth: 600, position: "relative" }}>
          <div className="animate-fade-up" style={{ textAlign: "center", marginBottom: "3rem" }}>
            <Link href="/" className="nav-logo" style={{ display: "block", fontSize: "1.4rem", marginBottom: "2rem" }}>Castly</Link>
            <h1 style={{ fontSize: "2rem", fontWeight: 900, letterSpacing: "-0.05em", marginBottom: "0.6rem" }}>Je suis…</h1>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Choisis ton profil pour une expérience personnalisée</p>
          </div>
          <div className="grid-2 animate-fade-up-2">
            <button onClick={() => setRole("artist")} className="path-card path-card-gold" style={{ cursor: "pointer", border: "none", textAlign: "left" }}>
              <div style={{ fontSize: "2rem", marginBottom: "1.1rem", display: "block", animation: "float 5s ease-in-out infinite" }}>🎤</div>
              <h2 style={{ fontWeight: 800, fontSize: "1rem", marginBottom: "0.5rem", letterSpacing: "-0.02em" }} className="text-gradient-gold">Artiste</h2>
              <p style={{ color: "var(--text-muted)", fontSize: "0.83rem", lineHeight: 1.65, marginBottom: "1.25rem" }}>
                Acteur, chanteur, rappeur, danseur, mannequin… Trouve des castings matchés par l&apos;IA.
              </p>
              <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                {["Gratuit", "3 crédits offerts"].map(t => <span key={t} className="chip-gold">{t}</span>)}
              </div>
            </button>
            <button onClick={() => setRole("recruiter")} className="path-card path-card-green" style={{ cursor: "pointer", border: "none", textAlign: "left" }}>
              <div style={{ fontSize: "2rem", marginBottom: "1.1rem", display: "block", animation: "float 5s 1s ease-in-out infinite" }}>🎬</div>
              <h2 style={{ fontWeight: 800, fontSize: "1rem", marginBottom: "0.5rem", letterSpacing: "-0.02em" }} className="text-gradient-green">Recruteur</h2>
              <p style={{ color: "var(--text-muted)", fontSize: "0.83rem", lineHeight: 1.65, marginBottom: "1.25rem" }}>
                Agence, production, marque, label… Trouve les talents avec l&apos;IA de matching.
              </p>
              <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                {["Matching IA", "Contact direct"].map(t => <span key={t} className="chip-green">{t}</span>)}
              </div>
            </button>
          </div>
          <p className="animate-fade-up-3" style={{ textAlign: "center", marginTop: "1.75rem", fontSize: "0.85rem", color: "var(--text-muted)" }}>
            Déjà un compte ?{" "}
            <Link href="/auth/login" style={{ color: "var(--gold)", textDecoration: "none", fontWeight: 600 }}>Connexion</Link>
          </p>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", display: "grid", gridTemplateColumns: "1fr 1fr", background: "var(--bg)" }}>
      {/* LEFT */}
      <div style={{ position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "center", padding: "3rem 2.5rem", background: "var(--bg-2)", borderRight: "1px solid var(--border)" }}>
        <div style={{ position: "absolute", inset: 0 }}>
          <div className="orb" style={{ width: 400, height: 400, background: role === "artist" ? "rgba(232,184,109,0.08)" : "rgba(56,199,147,0.07)", top: "20%", left: "10%", filter: "blur(80px)" }} />
        </div>
        <div style={{ position: "relative", zIndex: 1 }}>
          <Link href="/" className="nav-logo" style={{ display: "block", marginBottom: "3rem", fontSize: "1.25rem" }}>Castly</Link>
          <div style={{ fontSize: "2.5rem", marginBottom: "1.25rem" }}>{role === "artist" ? "🎤" : "🎬"}</div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 900, letterSpacing: "-0.04em", marginBottom: "1rem" }}>
            {role === "artist" ? "Trouve les castings faits pour toi" : "Trouve les talents qu'il te faut"}
          </h2>
          <div style={{ display: "grid", gap: "0.6rem" }}>
            {(role === "artist"
              ? ["Score de compatibilité IA sur chaque casting", "Raisons du match expliquées", "Accès direct aux offres originales", "Profil visible par les recruteurs"]
              : ["Matching IA sur tous les profils", "Score + raisons expliquées", "Contact direct en 1 crédit", "Brief en 3 étapes rapides"]
            ).map(f => (
              <div key={f} style={{ display: "flex", gap: "0.6rem", alignItems: "center", fontSize: "0.85rem" }}>
                <span style={{ color: role === "artist" ? "var(--gold)" : "var(--green)", fontWeight: 800 }}>✓</span>
                <span style={{ color: "var(--text-2)" }}>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT — Form */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "3rem 2.5rem" }}>
        <div style={{ width: "100%", maxWidth: 380 }}>
          <div className="animate-fade-up" style={{ marginBottom: "2.5rem" }}>
            <button onClick={() => setRole(null)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "0.82rem", marginBottom: "1.25rem", padding: 0, display: "flex", alignItems: "center", gap: "0.35rem" }}>
              ← Changer de profil
            </button>
            <h1 style={{ fontSize: "1.6rem", fontWeight: 900, letterSpacing: "-0.04em", marginBottom: "0.4rem" }}>
              {role === "artist" ? "Compte artiste" : "Compte recruteur"}
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
              {role === "artist" ? "3 crédits offerts. Gratuit pour commencer." : "Postez un brief dès ce soir."}
            </p>
          </div>

          <form onSubmit={handleSignup} className="animate-fade-up-2" style={{ display: "grid", gap: "1.1rem" }}>
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="ton@email.fr" autoFocus />
            </div>
            <div>
              <label className="label">Mot de passe</label>
              <input className="input" type="password" required minLength={8} value={password} onChange={e => setPassword(e.target.value)} placeholder="8 caractères minimum" />
            </div>
            {error && (
              <div style={{ padding: "0.75rem 1rem", borderRadius: 12, background: "var(--red-dim)", border: "1px solid var(--red-border)", fontSize: "0.83rem", color: "var(--red)" }}>
                {error}
              </div>
            )}
            <button className={role === "artist" ? "btn-gold" : "btn-green"} type="submit" disabled={loading}
              style={{ width: "100%", padding: "0.8rem", fontSize: "0.9rem", marginTop: "0.25rem" }}>
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", gap: "0.5rem", justifyContent: "center" }}>
                  <span style={{ width: 14, height: 14, border: "2px solid rgba(0,0,0,0.2)", borderTop: "2px solid #000", borderRadius: "50%", animation: "spin-slow 0.7s linear infinite", display: "inline-block" }} />
                  Création…
                </span>
              ) : "Créer mon compte →"}
            </button>
          </form>

          <p className="animate-fade-up-3" style={{ textAlign: "center", marginTop: "1.75rem", fontSize: "0.82rem", color: "var(--text-muted)" }}>
            Déjà un compte ?{" "}
            <Link href="/auth/login" style={{ color: "var(--gold)", textDecoration: "none", fontWeight: 600 }}>Connexion</Link>
          </p>
        </div>
      </div>

      <style>{`@media (max-width: 720px) { main { grid-template-columns: 1fr !important; } main > div:first-child { display: none !important; } }`}</style>
    </main>
  );
}

export default function SignupPage() {
  return <Suspense><SignupInner /></Suspense>;
}
