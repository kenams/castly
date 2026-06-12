"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ARTIST_TYPE_LABELS, GENDER_LABELS } from "@/types";
import type { CastlyCasting } from "@/types";

export default function CastingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [casting, setCasting] = useState<CastlyCasting | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [matchScore, setMatchScore] = useState<number | null>(null);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/castings/${id}`);
      if (!res.ok) { setLoading(false); return; }
      const data = await res.json();
      setCasting(data.casting);
      setLoading(false);
    }
    if (id) load();

    const supabase = createClient();
    void supabase.auth.getUser().then((result: Awaited<ReturnType<typeof supabase.auth.getUser>>) => {
      if (result.data.user) {
        setIsLoggedIn(true);
        fetch(`/api/matches/casting/${id}`).then(r => r.ok ? r.json() : null).then(d => {
          if (d?.score != null) setMatchScore(d.score);
        });
      }
    });
  }, [id]);

  return (
    <main style={{ minHeight: "100vh" }}>
      <nav className="nav">
        <Link href="/" className="nav-logo">Castly</Link>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <Link href="/castings" className="btn-outline" style={{ padding: "0.45rem 1rem", fontSize: "0.82rem" }}>← Castings</Link>
          {isLoggedIn
            ? <Link href="/dashboard" className="btn-gold" style={{ padding: "0.45rem 1rem", fontSize: "0.82rem" }}>← Mon dashboard</Link>
            : <Link href="/auth/signup" className="btn-gold" style={{ padding: "0.45rem 1rem", fontSize: "0.82rem" }}>Voir mon score IA</Link>
          }
        </div>
      </nav>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "2.5rem 2rem" }}>
        {loading && <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "4rem" }}>Chargement…</p>}
        {!loading && !casting && (
          <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
            <p style={{ color: "var(--text-muted)", marginBottom: "1rem" }}>Casting introuvable.</p>
            <Link href="/castings" className="btn-gold">Voir tous les castings</Link>
          </div>
        )}
        {casting && (
          <div style={{ display: "grid", gap: "1.5rem" }}>
            <div>
              <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>
                {casting.is_featured && <span className="pill" style={{ fontSize: "0.75rem" }}>★ Partenaire</span>}
                {casting.is_paid && <span className="pill-green pill" style={{ fontSize: "0.75rem" }}>Rémunéré</span>}
                {casting.casting_type.map(t => (
                  <span key={t} className="pill-muted pill" style={{ fontSize: "0.75rem" }}>{ARTIST_TYPE_LABELS[t]}</span>
                ))}
              </div>
              <h1 style={{ fontSize: "1.8rem", fontWeight: 900, lineHeight: 1.2, marginBottom: "0.5rem" }}>{casting.title}</h1>
              {casting.location && <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>📍 {casting.location}</p>}
            </div>

            {/* INFO CARDS */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: "0.75rem" }}>
              {casting.age_min && casting.age_max && (
                <div className="card" style={{ padding: "1rem" }}>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>ÂGE</p>
                  <p style={{ fontWeight: 700 }}>{casting.age_min} – {casting.age_max} ans</p>
                </div>
              )}
              {casting.required_gender && (
                <div className="card" style={{ padding: "1rem" }}>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>GENRE</p>
                  <p style={{ fontWeight: 700 }}>{GENDER_LABELS[casting.required_gender]}</p>
                </div>
              )}
              {casting.compensation_details && (
                <div className="card" style={{ padding: "1rem" }}>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>RÉMUNÉRATION</p>
                  <p style={{ fontWeight: 700 }}>{casting.compensation_details}</p>
                </div>
              )}
              {casting.deadline_at && (
                <div className="card" style={{ padding: "1rem" }}>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>DATE LIMITE</p>
                  <p style={{ fontWeight: 700 }}>{new Date(casting.deadline_at).toLocaleDateString("fr-FR")}</p>
                </div>
              )}
            </div>

            {/* DESCRIPTION */}
            {casting.description && (
              <div className="card">
                <h2 style={{ fontWeight: 700, marginBottom: "0.75rem" }}>Description</h2>
                <p style={{ color: "var(--text-muted)", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{casting.description}</p>
              </div>
            )}

            {/* CTA */}
            {isLoggedIn ? (
              <div className="card" style={{ background: "linear-gradient(135deg,rgba(56,199,147,0.08),rgba(232,184,109,0.05))", borderColor: "rgba(56,199,147,0.3)", textAlign: "center", padding: "2rem" }}>
                {matchScore != null ? (
                  <>
                    <p style={{ fontWeight: 700, marginBottom: "0.5rem", fontSize: "1.1rem" }}>
                      🎯 Ton score de compatibilité : <span style={{ color: "var(--gold)" }}>{matchScore}/100</span>
                    </p>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
                      {matchScore >= 70 ? "Excellent profil pour ce casting !" : matchScore >= 50 ? "Bon match — tu mérites de postuler." : "Match partiel — tente ta chance quand même."}
                    </p>
                  </>
                ) : (
                  <>
                    <p style={{ fontWeight: 700, marginBottom: "0.5rem", fontSize: "1.1rem" }}>Tu es connecté ✓</p>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>Lance le matching IA depuis ton dashboard pour voir ton score.</p>
                  </>
                )}
                <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
                  {casting.source_url && (
                    <a href={casting.source_url} target="_blank" rel="noreferrer" className="btn-gold">Postuler maintenant ↗</a>
                  )}
                  <Link href="/dashboard" className="btn-outline">Mon dashboard →</Link>
                </div>
              </div>
            ) : (
              <div className="card" style={{ background: "linear-gradient(135deg,rgba(232,184,109,0.07),rgba(56,199,147,0.04))", borderColor: "var(--gold-border)", textAlign: "center", padding: "2rem" }}>
                <p style={{ fontWeight: 700, marginBottom: "0.5rem", fontSize: "1.1rem" }}>Vois si tu matches avec ce casting</p>
                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>Crée ton profil gratuit et l&apos;IA calcule ton score de compatibilité.</p>
                <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
                  <Link href="/auth/signup" className="btn-gold">Créer mon profil gratuit →</Link>
                  {casting.source_url && (
                    <a href={casting.source_url} target="_blank" rel="noreferrer" className="btn-outline">
                      Voir l&apos;offre originale ↗
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
