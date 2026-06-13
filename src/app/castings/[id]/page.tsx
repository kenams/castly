"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ARTIST_TYPE_LABELS, GENDER_LABELS } from "@/types";
import type { CastlyCasting } from "@/types";

function ScoreBadge({ score }: { score: number }) {
  const cls = score >= 70 ? "score-high" : score >= 45 ? "score-mid" : "score-low";
  return <div className={`score-badge ${cls}`} style={{ width: 64, height: 64, fontSize: "1.4rem" }}>{score}</div>;
}

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

  if (loading) {
    return (
      <main style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 44, height: 44, border: "2px solid var(--gold-border)", borderTop: "2px solid var(--gold)", borderRadius: "50%", animation: "spin-slow 0.8s linear infinite", margin: "0 auto 1rem" }} />
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Chargement…</p>
        </div>
      </main>
    );
  }

  const daysLeft = casting?.deadline_at ? Math.ceil((new Date(casting.deadline_at).getTime() - Date.now()) / 86400000) : null;
  const urgent = daysLeft !== null && daysLeft <= 3 && daysLeft >= 0;

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <nav className="nav">
        <Link href="/" className="nav-logo">Castly</Link>
        <div style={{ display: "flex", gap: "0.6rem" }}>
          <Link href="/castings" className="btn-outline" style={{ padding: "0.42rem 0.9rem", fontSize: "0.8rem" }}>← Castings</Link>
          {isLoggedIn
            ? <Link href="/dashboard" className="btn-gold" style={{ padding: "0.42rem 1rem", fontSize: "0.82rem" }}>Mon dashboard →</Link>
            : <Link href="/auth/signup" className="btn-gold" style={{ padding: "0.42rem 1rem", fontSize: "0.82rem" }}>Voir mon score IA</Link>
          }
        </div>
      </nav>

      {!casting ? (
        <div style={{ maxWidth: 480, margin: "6rem auto", padding: "0 2rem", textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🎬</div>
          <p style={{ fontWeight: 700, marginBottom: "0.5rem" }}>Casting introuvable</p>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>Cette offre n&apos;existe plus ou a été supprimée.</p>
          <Link href="/castings" className="btn-gold">Voir tous les castings →</Link>
        </div>
      ) : (
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "2.5rem 2rem", display: "grid", gap: "1.25rem" }}>

          {/* HERO */}
          <div className="animate-fade-up" style={{ position: "relative", overflow: "hidden", borderRadius: 20, background: "var(--bg-card)", border: "1px solid var(--border)", padding: "2.5rem 2rem" }}>
            <div style={{ position: "absolute", inset: 0, background: casting.is_featured ? "linear-gradient(135deg,rgba(232,184,109,0.05),transparent)" : "none", pointerEvents: "none" }} />
            <div style={{ position: "relative" }}>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1rem" }}>
                {casting.is_featured && <span className="pill" style={{ fontSize: "0.72rem" }}>★ Partenaire</span>}
                {casting.is_paid && <span className="pill-green pill" style={{ fontSize: "0.72rem" }}>Rémunéré</span>}
                {urgent && <span className="pill-red" style={{ fontSize: "0.72rem" }}>⚡ Urgent</span>}
                {casting.casting_type.map(t => (
                  <span key={t} className="pill-muted pill" style={{ fontSize: "0.72rem" }}>{ARTIST_TYPE_LABELS[t]}</span>
                ))}
              </div>
              <h1 style={{ fontSize: "2rem", fontWeight: 900, lineHeight: 1.2, letterSpacing: "-0.05em", marginBottom: "0.75rem" }}>{casting.title}</h1>
              {casting.location && (
                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>📍 {casting.location}</p>
              )}
            </div>
          </div>

          {/* INFO STATS */}
          <div className="animate-fade-up-2" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: "0.75rem" }}>
            {casting.age_min != null && casting.age_max != null && (
              <div className="stat-card">
                <span style={{ fontSize: "1.1rem" }}>👤</span>
                <div>
                  <div style={{ fontWeight: 900, fontSize: "1.1rem", letterSpacing: "-0.03em" }}>{casting.age_min}–{casting.age_max} ans</div>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-faint)", marginTop: "0.15rem" }}>Tranche d&apos;âge</div>
                </div>
              </div>
            )}
            {casting.required_gender && (
              <div className="stat-card">
                <span style={{ fontSize: "1.1rem" }}>⚧</span>
                <div>
                  <div style={{ fontWeight: 900, fontSize: "1.1rem", letterSpacing: "-0.03em" }}>{GENDER_LABELS[casting.required_gender]}</div>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-faint)", marginTop: "0.15rem" }}>Genre</div>
                </div>
              </div>
            )}
            {casting.compensation_details && (
              <div className="stat-card">
                <span style={{ fontSize: "1.1rem", color: "var(--green)" }}>💰</span>
                <div>
                  <div style={{ fontWeight: 900, fontSize: "1rem", letterSpacing: "-0.02em", color: "var(--green)" }}>{casting.compensation_details}</div>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-faint)", marginTop: "0.15rem" }}>Rémunération</div>
                </div>
              </div>
            )}
            {casting.deadline_at && (
              <div className="stat-card">
                <span style={{ fontSize: "1.1rem", color: urgent ? "var(--red)" : "var(--text-muted)" }}>📅</span>
                <div>
                  <div style={{ fontWeight: 900, fontSize: "1rem", letterSpacing: "-0.02em", color: urgent ? "var(--red)" : "var(--text)" }}>
                    {daysLeft != null && daysLeft >= 0 ? `${daysLeft}j restants` : "Expiré"}
                  </div>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-faint)", marginTop: "0.15rem" }}>{new Date(casting.deadline_at).toLocaleDateString("fr-FR")}</div>
                </div>
              </div>
            )}
          </div>

          {/* DESCRIPTION */}
          {casting.description && (
            <div className="card animate-fade-up-3">
              <p style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-faint)", marginBottom: "0.75rem" }}>Description</p>
              <p style={{ color: "var(--text-muted)", lineHeight: 1.8, whiteSpace: "pre-wrap", fontSize: "0.92rem" }}>{casting.description}</p>
            </div>
          )}

          {/* CTA SCORE */}
          {isLoggedIn ? (
            <div className="card animate-fade-up-4" style={{
              background: matchScore != null
                ? matchScore >= 70 ? "linear-gradient(135deg,rgba(56,199,147,0.08),rgba(232,184,109,0.04))" : "linear-gradient(135deg,rgba(232,184,109,0.07),rgba(56,199,147,0.03))"
                : "var(--bg-card)",
              borderColor: matchScore != null && matchScore >= 70 ? "rgba(56,199,147,0.3)" : "var(--gold-border)",
              padding: "2rem", textAlign: "center",
            }}>
              {matchScore != null ? (
                <>
                  <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem" }}>
                    <ScoreBadge score={matchScore} />
                  </div>
                  <p style={{ fontWeight: 800, fontSize: "1.1rem", letterSpacing: "-0.02em", marginBottom: "0.4rem" }}>
                    Ton score de compatibilité
                  </p>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", marginBottom: "1.5rem" }}>
                    {matchScore >= 70 ? "Excellent profil pour ce casting !" : matchScore >= 50 ? "Bon match — tu mérites de postuler." : "Match partiel — tente ta chance quand même."}
                  </p>
                </>
              ) : (
                <>
                  <div style={{ fontSize: "1.5rem", marginBottom: "0.75rem" }}>✓</div>
                  <p style={{ fontWeight: 700, marginBottom: "0.4rem" }}>Tu es connecté</p>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", marginBottom: "1.5rem" }}>Lance le matching IA depuis ton dashboard pour voir ton score sur ce casting.</p>
                </>
              )}
              <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
                {casting.source_url ? (
                  <a href={casting.source_url} target="_blank" rel="noreferrer" className="btn-gold">Postuler maintenant ↗</a>
                ) : (
                  <Link href="/dashboard" className="btn-gold">Voir dans mon dashboard →</Link>
                )}
                {casting.source_url && <Link href="/dashboard" className="btn-outline">Mon dashboard →</Link>}
              </div>
            </div>
          ) : (
            <div className="card animate-fade-up-4" style={{ background: "linear-gradient(135deg,rgba(232,184,109,0.07),rgba(56,199,147,0.04))", borderColor: "var(--gold-border)", textAlign: "center", padding: "2.5rem 2rem" }}>
              <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>🎯</div>
              <p style={{ fontWeight: 800, fontSize: "1.1rem", letterSpacing: "-0.02em", marginBottom: "0.5rem" }}>Vois si tu matches avec ce casting</p>
              <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", marginBottom: "1.5rem", maxWidth: 360, margin: "0 auto 1.5rem" }}>
                Crée ton profil gratuit et l&apos;IA calcule ton score de compatibilité en quelques secondes.
              </p>
              <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
                <Link href="/auth/signup" className="btn-gold">Créer mon profil gratuit →</Link>
                {casting.source_url && (
                  <a href={casting.source_url} target="_blank" rel="noreferrer" className="btn-outline">Voir l&apos;offre originale ↗</a>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
