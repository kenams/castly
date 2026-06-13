"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ARTIST_TYPE_LABELS } from "@/types";
import type { CastlyMatch, CastlyProfile } from "@/types";

function ScoreBadge({ score }: { score: number }) {
  const cls = score >= 70 ? "score-high" : score >= 45 ? "score-mid" : "score-low";
  return <div className={`score-badge ${cls}`}>{score}</div>;
}

export default function DashboardPage() {
  const [profile, setProfile] = useState<CastlyProfile | null>(null);
  const [matches, setMatches] = useState<CastlyMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<"all" | "new" | "saved">("all");

  useEffect(() => {
    const supabase = createClient();
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = "/auth/login"; return; }
      const { data: p } = await supabase.from("castly_profiles").select("*").eq("user_id", user.id).single();
      if (!p) { window.location.href = "/onboarding"; return; }
      setProfile(p);
      const { data: m } = await supabase
        .from("castly_matches")
        .select("*, casting:castly_castings(*)")
        .eq("profile_id", p.id)
        .order("match_score", { ascending: false })
        .limit(50);
      setMatches(m ?? []);
      setLoading(false);
    }
    load();
  }, []);

  async function handleLogout() {
    await createClient().auth.signOut();
    window.location.href = "/";
  }

  const updateStatus = useCallback(async (matchId: string, status: string) => {
    await createClient().from("castly_matches").update({ status }).eq("id", matchId);
    setMatches(ms => ms.map(m => m.id === matchId ? { ...m, status: status as never } : m));
  }, []);

  async function refreshMatches() {
    setRefreshing(true);
    await fetch("/api/match", { method: "POST" });
    window.location.reload();
  }

  const filtered = matches.filter(m =>
    filter === "all" ? true : filter === "new" ? m.status === "new" : m.status === "saved"
  );
  const newCount = matches.filter(m => m.status === "new").length;
  const savedCount = matches.filter(m => m.status === "saved").length;
  const topScore = matches[0]?.match_score ?? 0;

  // Profile completion
  const completionFields = [profile?.bio, profile?.city, profile?.artist_type?.length, profile?.skills?.length, profile?.social_links && Object.keys(profile.social_links).length > 0];
  const completionPct = profile ? Math.round(completionFields.filter(Boolean).length / completionFields.length * 100) : 0;

  if (loading) {
    return (
      <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 48, height: 48, border: "2px solid var(--gold-border)", borderTop: "2px solid var(--gold)", borderRadius: "50%", animation: "spin-slow 0.8s linear infinite", margin: "0 auto 1rem" }} />
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Chargement…</p>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <nav className="nav">
        <Link href="/" className="nav-logo">Castly</Link>
        <div style={{ display: "flex", gap: "0.6rem", alignItems: "center" }}>
          <Link href="/castings" className="btn-outline" style={{ padding: "0.42rem 0.9rem", fontSize: "0.8rem" }}>Castings</Link>
          <Link href="/onboarding" className="btn-outline" style={{ padding: "0.42rem 0.9rem", fontSize: "0.8rem" }}>✏️ Profil</Link>
          <button onClick={handleLogout} style={{ padding: "0.42rem 0.9rem", fontSize: "0.8rem", borderRadius: "999px", border: "1px solid var(--border)", background: "transparent", color: "var(--text-muted)", cursor: "pointer", transition: "all 0.15s" }}>
            Déconnexion
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "2rem" }}>
        {/* HEADER ROW */}
        <div className="animate-fade-up" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h1 style={{ fontSize: "1.6rem", fontWeight: 900, letterSpacing: "-0.04em", marginBottom: "0.3rem" }}>
              Bonjour, {profile?.display_name} 👋
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Voici tes castings matchés par l&apos;IA</p>
          </div>
          <button onClick={refreshMatches} disabled={refreshing} className="btn-outline" style={{ fontSize: "0.82rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <span style={{ display: "inline-block", animation: refreshing ? "spin-slow 0.7s linear infinite" : "none" }}>↻</span>
            {refreshing ? "Analyse IA…" : "Relancer l'IA"}
          </button>
        </div>

        {/* STATS */}
        <div className="animate-fade-up-2" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(155px,1fr))", gap: "0.75rem", marginBottom: "1.75rem" }}>
          {[
            { v: matches.length, l: "castings analysés", icon: "🎬", color: "var(--text)" },
            { v: newCount, l: "nouveaux matches", icon: "⚡", color: "var(--gold)" },
            { v: savedCount, l: "sauvegardés", icon: "★", color: "var(--gold)" },
            { v: `${topScore}/100`, l: "meilleur score", icon: "🎯", color: "var(--green)" },
          ].map(s => (
            <div key={s.l} className="stat-card">
              <span style={{ fontSize: "1.2rem" }}>{s.icon}</span>
              <div>
                <div style={{ fontSize: "1.35rem", fontWeight: 900, color: s.color, lineHeight: 1, letterSpacing: "-0.03em" }}>{s.v}</div>
                <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "0.2rem", lineHeight: 1.3 }}>{s.l}</div>
              </div>
            </div>
          ))}
        </div>

        {/* PROFILE COMPLETION */}
        {completionPct < 100 && (
          <div className="card animate-fade-up-3" style={{ marginBottom: "1.5rem", padding: "1.1rem 1.4rem", background: "linear-gradient(135deg,rgba(232,184,109,0.06),rgba(56,199,147,0.03))", borderColor: "var(--gold-border)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.6rem" }}>
              <div>
                <p style={{ fontWeight: 700, fontSize: "0.85rem", letterSpacing: "-0.01em" }}>Complète ton profil</p>
                <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Un profil complet améliore la qualité des matches IA</p>
              </div>
              <span style={{ fontSize: "0.9rem", fontWeight: 800, color: "var(--gold)" }}>{completionPct}%</span>
            </div>
            <div className="progress-bar" style={{ marginBottom: "0.75rem" }}>
              <div className="progress-fill" style={{ width: `${completionPct}%` }} />
            </div>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              {!profile?.bio && <Link href="/onboarding" style={{ fontSize: "0.75rem", color: "var(--gold)", textDecoration: "none", background: "var(--gold-dim)", border: "1px solid var(--gold-border)", padding: "0.2rem 0.6rem", borderRadius: "999px" }}>+ Bio</Link>}
              {!profile?.city && <Link href="/onboarding" style={{ fontSize: "0.75rem", color: "var(--gold)", textDecoration: "none", background: "var(--gold-dim)", border: "1px solid var(--gold-border)", padding: "0.2rem 0.6rem", borderRadius: "999px" }}>+ Ville</Link>}
              {!profile?.skills?.length && <Link href="/onboarding" style={{ fontSize: "0.75rem", color: "var(--gold)", textDecoration: "none", background: "var(--gold-dim)", border: "1px solid var(--gold-border)", padding: "0.2rem 0.6rem", borderRadius: "999px" }}>+ Compétences</Link>}
              {!(profile?.social_links && Object.keys(profile.social_links).length > 0) && <Link href="/onboarding" style={{ fontSize: "0.75rem", color: "var(--gold)", textDecoration: "none", background: "var(--gold-dim)", border: "1px solid var(--gold-border)", padding: "0.2rem 0.6rem", borderRadius: "999px" }}>+ Réseaux</Link>}
            </div>
          </div>
        )}

        {/* PROFIL CHIPS */}
        <div className="animate-fade-up-3" style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1.25rem", alignItems: "center" }}>
          {profile?.artist_type.map(t => <span key={t} className="pill" style={{ fontSize: "0.75rem" }}>{ARTIST_TYPE_LABELS[t]}</span>)}
          {profile?.city && <span className="pill-muted pill" style={{ fontSize: "0.75rem" }}>📍 {profile.city}</span>}
        </div>

        {/* FILTER TABS */}
        <div className="animate-fade-up-4" style={{ display: "flex", gap: "0.4rem", marginBottom: "1.25rem" }}>
          {([
            { key: "all", label: `Tous (${matches.length})` },
            { key: "new", label: `Nouveaux (${newCount})` },
            { key: "saved", label: `Sauvegardés (${savedCount})` },
          ] as const).map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)} className={`filter-tab ${filter === f.key ? "active" : ""}`}>
              {f.label}
            </button>
          ))}
        </div>

        {/* MATCHES LIST */}
        <div style={{ display: "grid", gap: "0.65rem" }}>
          {filtered.length === 0 ? (
            <div className="card empty-state">
              <div style={{ fontSize: "2.5rem" }}>⚡</div>
              <p style={{ fontWeight: 700 }}>{filter === "saved" ? "Aucun casting sauvegardé" : "Aucun casting pour ce filtre"}</p>
              <button onClick={refreshMatches} className="btn-gold" style={{ fontSize: "0.85rem" }}>Lancer l&apos;analyse IA</button>
            </div>
          ) : filtered.map((match, i) => {
            const c = match.casting;
            if (!c) return null;
            const daysLeft = c.deadline_at ? Math.ceil((new Date(c.deadline_at).getTime() - Date.now()) / 86400000) : null;
            const urgent = daysLeft !== null && daysLeft <= 3 && daysLeft >= 0;

            return (
              <div key={match.id} className={`casting-card animate-fade-up ${c.is_featured ? "featured" : ""}`} style={{ animationDelay: `${i * 0.03}s`, gridTemplateColumns: "auto 1fr" }}>
                <ScoreBadge score={match.match_score} />
                <div style={{ display: "grid", gap: "0.45rem", minWidth: 0 }}>
                  <div style={{ display: "flex", gap: "0.5rem", alignItems: "flex-start", flexWrap: "wrap" }}>
                    <Link href={`/castings/${c.id}`} style={{ fontWeight: 700, fontSize: "0.95rem", flex: 1, textDecoration: "none", color: "inherit", letterSpacing: "-0.01em" }}>
                      {c.title}
                    </Link>
                    {c.is_featured && <span className="pill" style={{ fontSize: "0.65rem" }}>★ Partenaire</span>}
                    {c.is_paid && <span className="pill-green pill" style={{ fontSize: "0.65rem" }}>Rémunéré</span>}
                    {urgent && <span className="pill-red" style={{ fontSize: "0.65rem" }}>⚡ Urgent</span>}
                  </div>
                  {c.location && <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>📍 {c.location}</p>}
                  {c.description && (
                    <p style={{ fontSize: "0.83rem", color: "var(--text-muted)", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {c.description}
                    </p>
                  )}
                  {match.match_reasons.length > 0 && (
                    <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
                      {match.match_reasons.map((r, j) => <span key={j} className="chip-green">✓ {r}</span>)}
                    </div>
                  )}
                  {match.match_blockers.length > 0 && (
                    <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
                      {match.match_blockers.map((b, j) => <span key={j} className="chip-red">⚠ {b}</span>)}
                    </div>
                  )}
                  <div style={{ display: "flex", gap: "0.6rem", alignItems: "center", marginTop: "0.15rem", flexWrap: "wrap" }}>
                    {daysLeft !== null && (
                      <span style={{ fontSize: "0.75rem", color: daysLeft <= 0 ? "var(--text-faint)" : urgent ? "var(--red)" : "var(--text-muted)" }}>
                        {daysLeft <= 0 ? "Expiré" : `${daysLeft}j restants`}
                      </span>
                    )}
                    {c.source_url && (
                      <a href={c.source_url} target="_blank" rel="noreferrer" className="btn-gold" style={{ padding: "0.3rem 0.85rem", fontSize: "0.75rem" }}>
                        Postuler →
                      </a>
                    )}
                    <button
                      onClick={() => updateStatus(match.id, match.status === "saved" ? "new" : "saved")}
                      style={{ fontSize: "0.75rem", padding: "0.3rem 0.75rem", borderRadius: "999px", border: "1px solid", cursor: "pointer", background: "transparent", transition: "all 0.15s",
                        borderColor: match.status === "saved" ? "var(--gold-border)" : "var(--border)",
                        color: match.status === "saved" ? "var(--gold)" : "var(--text-muted)" }}>
                      {match.status === "saved" ? "★ Sauvegardé" : "☆ Sauvegarder"}
                    </button>
                    {match.status !== "dismissed" && (
                      <button onClick={() => updateStatus(match.id, "dismissed")}
                        style={{ fontSize: "0.75rem", padding: "0.25rem 0.55rem", borderRadius: "999px", border: "none", background: "transparent", color: "var(--text-faint)", cursor: "pointer", transition: "color 0.15s" }}>
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
