"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const PACKS = [
  { key: "starter", credits: 5,  price: "9,90€", label: "Starter",  desc: "Idéal pour tester",       popular: false },
  { key: "pro",     credits: 20, price: "29,90€", label: "Pro",      desc: "Le plus populaire",       popular: true  },
  { key: "agency",  credits: 50, price: "59,90€", label: "Agence",   desc: "Pour les gros volumes",   popular: false },
];

export default function CreditsPage() {
  const [credits, setCredits] = useState<number | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async (result: Awaited<ReturnType<typeof supabase.auth.getUser>>) => {
      const user = result.data.user;
      if (!user) return;
      const { data } = await supabase
        .from("castly_recruiters")
        .select("credits")
        .eq("user_id", user.id)
        .single();
      if (data) setCredits(data.credits);
    });
  }, []);

  async function buyPack(pack: string) {
    setLoading(pack);
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pack }),
    });
    const { url, error } = await res.json();
    if (url) window.location.href = url;
    else { alert(error || "Erreur"); setLoading(null); }
  }

  return (
    <main style={{ minHeight: "100vh" }}>
      <nav className="nav">
        <Link href="/" className="nav-logo">Castly</Link>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <Link href="/recruiter/dashboard" className="btn-outline" style={{ padding: "0.45rem 1rem", fontSize: "0.82rem" }}>← Dashboard</Link>
        </div>
      </nav>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "3rem 2rem", textAlign: "center" }}>
        <div className="pill" style={{ marginBottom: "1.25rem", fontSize: "0.82rem", display: "inline-flex" }}>💳 Crédits Castly</div>
        <h1 style={{ fontSize: "2rem", fontWeight: 900, marginBottom: "0.75rem" }}>Révélez les contacts des artistes</h1>
        <p style={{ color: "var(--text-muted)", marginBottom: "0.5rem" }}>
          Chaque crédit vous permet de révéler l&apos;email d&apos;un artiste. Un contact révélé reste accessible à vie.
        </p>
        {credits !== null && (
          <p style={{ color: "var(--gold)", fontWeight: 700, marginBottom: "2rem" }}>
            Solde actuel : {credits} crédit{credits > 1 ? "s" : ""}
          </p>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.25rem", marginTop: "2rem" }}>
          {PACKS.map(p => (
            <div key={p.key} className="card" style={{
              position: "relative", padding: "1.75rem 1.25rem",
              borderColor: p.popular ? "var(--gold-border)" : "var(--border)",
              background: p.popular ? "linear-gradient(135deg,rgba(232,184,109,0.07),rgba(56,199,147,0.04))" : undefined,
            }}>
              {p.popular && (
                <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)" }}>
                  <span className="pill" style={{ fontSize: "0.72rem", whiteSpace: "nowrap" }}>★ Plus populaire</span>
                </div>
              )}
              <p style={{ fontWeight: 800, fontSize: "1.1rem", marginBottom: "0.25rem" }}>{p.label}</p>
              <p style={{ fontSize: "2rem", fontWeight: 900, color: "var(--gold)", margin: "0.5rem 0" }}>{p.price}</p>
              <p style={{ fontWeight: 700, fontSize: "1rem", marginBottom: "0.25rem" }}>{p.credits} crédits</p>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "1.25rem" }}>{p.desc}</p>
              <button
                className={p.popular ? "btn-gold" : "btn-outline"}
                style={{ width: "100%", cursor: "pointer" }}
                onClick={() => buyPack(p.key)}
                disabled={loading === p.key}
              >
                {loading === p.key ? "Redirection…" : "Acheter →"}
              </button>
            </div>
          ))}
        </div>

        <p style={{ color: "var(--text-muted)", fontSize: "0.82rem", marginTop: "2rem" }}>
          Paiement sécurisé par Stripe. Pas d&apos;abonnement, crédits valables sans limite de temps.
        </p>
      </div>
    </main>
  );
}
