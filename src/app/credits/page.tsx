"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const PACKS = [
  { key: "starter", credits: 5,  price: "9,90€", label: "Starter",  desc: "Pour tester", perCredit: "1,98€/crédit", popular: false },
  { key: "pro",     credits: 20, price: "29,90€", label: "Pro",      desc: "Le plus populaire", perCredit: "1,50€/crédit", popular: true  },
  { key: "agency",  credits: 50, price: "59,90€", label: "Agence",   desc: "Gros volumes", perCredit: "1,20€/crédit", popular: false },
];

export default function CreditsPage() {
  const [credits, setCredits] = useState<number | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async (r: Awaited<ReturnType<ReturnType<typeof createClient>["auth"]["getUser"]>>) => {
      if (!r.data.user) return;
      const { data } = await supabase.from("castly_recruiters").select("credits").eq("user_id", r.data.user.id).single();
      if (data) setCredits(data.credits);
    });
  }, []);

  async function buyPack(pack: string) {
    setLoading(pack);
    const res = await fetch("/api/checkout", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pack }),
    });
    const { url, error } = await res.json();
    if (url) window.location.href = url;
    else { alert(error || "Erreur"); setLoading(null); }
  }

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <nav className="nav">
        <Link href="/" className="nav-logo">Castly</Link>
        <div style={{ display: "flex", gap: "0.6rem" }}>
          <Link href="/recruiter/dashboard" className="btn-outline" style={{ padding: "0.45rem 1rem", fontSize: "0.82rem" }}>← Dashboard</Link>
        </div>
      </nav>

      <div style={{ maxWidth: 820, margin: "0 auto", padding: "4rem 2rem", textAlign: "center" }}>
        <div className="animate-fade-up" style={{ marginBottom: "3rem" }}>
          <span className="pill" style={{ marginBottom: "1.25rem", display: "inline-flex", fontSize: "0.75rem" }}>💳 Crédits Castly</span>
          <h1 style={{ fontSize: "2.2rem", fontWeight: 900, letterSpacing: "-0.05em", marginBottom: "0.75rem" }}>
            Révélez les contacts des artistes
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.92rem", maxWidth: 460, margin: "0 auto 0.75rem" }}>
            Chaque crédit vous permet de révéler l&apos;email d&apos;un artiste.<br />Un contact révélé reste accessible à vie.
          </p>
          {credits !== null && (
            <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 1.25rem", borderRadius: "999px", background: "var(--gold-dim)", border: "1px solid var(--gold-border)", marginTop: "0.75rem" }}>
              <span style={{ color: "var(--gold)", fontWeight: 800 }}>💳 {credits}</span>
              <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>crédit{credits > 1 ? "s" : ""} disponible{credits > 1 ? "s" : ""}</span>
            </div>
          )}
        </div>

        <div className="animate-fade-up-2" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1.1rem", marginBottom: "3rem" }}>
          {PACKS.map(p => (
            <div key={p.key} className="card" style={{
              position: "relative", padding: "2rem 1.5rem", textAlign: "center",
              borderColor: p.popular ? "var(--gold-border)" : "var(--border)",
              background: p.popular ? "linear-gradient(135deg,rgba(232,184,109,0.07),rgba(56,199,147,0.03))" : "var(--bg-card)",
              transition: "all 0.2s",
            }}>
              {p.popular && (
                <div style={{ position: "absolute", top: -13, left: "50%", transform: "translateX(-50%)" }}>
                  <span className="pill" style={{ fontSize: "0.68rem", whiteSpace: "nowrap", boxShadow: "0 4px 12px rgba(232,184,109,0.2)" }}>★ Plus populaire</span>
                </div>
              )}
              <p style={{ fontWeight: 800, fontSize: "1rem", letterSpacing: "-0.02em", marginBottom: "1rem" }}>{p.label}</p>
              <div style={{ marginBottom: "0.5rem" }}>
                <span style={{ fontSize: "2.2rem", fontWeight: 900, color: "var(--gold)", letterSpacing: "-0.05em" }}>{p.price}</span>
              </div>
              <p style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: "0.25rem" }}>{p.credits} crédits</p>
              <p style={{ fontSize: "0.75rem", color: "var(--text-faint)", marginBottom: "0.25rem" }}>{p.perCredit}</p>
              <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "1.5rem" }}>{p.desc}</p>
              <button
                className={p.popular ? "btn-gold" : "btn-outline"}
                style={{ width: "100%", cursor: "pointer", fontSize: "0.85rem" }}
                onClick={() => buyPack(p.key)}
                disabled={loading === p.key}
              >
                {loading === p.key ? (
                  <span style={{ display: "flex", alignItems: "center", gap: "0.4rem", justifyContent: "center" }}>
                    <span style={{ width: 12, height: 12, border: "2px solid rgba(0,0,0,0.2)", borderTop: "2px solid #000", borderRadius: "50%", animation: "spin-slow 0.7s linear infinite", display: "inline-block" }} />
                    Redirection…
                  </span>
                ) : "Acheter →"}
              </button>
            </div>
          ))}
        </div>

        <div className="card animate-fade-up-3" style={{ maxWidth: 560, margin: "0 auto", padding: "1.5rem 2rem", background: "var(--bg-2)", textAlign: "left" }}>
          {[
            { icon: "🔒", t: "Paiement sécurisé", d: "Stripe — norme PCI DSS, aucune donnée bancaire stockée." },
            { icon: "♾️", t: "Crédits sans expiration", d: "Vos crédits sont valables sans limite de temps." },
            { icon: "📧", t: "Contact à vie", d: "Un email révélé reste accessible indéfiniment dans votre compte." },
          ].map((f, i, arr) => (
            <div key={f.t} style={{ display: "flex", gap: "0.9rem", alignItems: "flex-start", padding: "0.75rem 0", borderBottom: i < arr.length - 1 ? "1px solid var(--border)" : "none" }}>
              <span style={{ fontSize: "1.1rem", marginTop: "0.05rem" }}>{f.icon}</span>
              <div>
                <p style={{ fontWeight: 700, fontSize: "0.85rem", marginBottom: "0.15rem" }}>{f.t}</p>
                <p style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>{f.d}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
