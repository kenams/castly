"use client";
export const dynamic = "force-dynamic";
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
    if (!supabase) return;
    async function load() {
      const { data: { user } } = await supabase!.auth.getUser();
      if (!user) { window.location.href = "/auth/login"; return; }

      const { data: p } = await supabase!
        .from("castly_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (!p) { window.location.href = "/onboarding"; return; }
      setProfile(p);

      const { data: m } = await supabase!
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
    const supabase = createClient();
    if (!supabase) return;
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  const updateStatus = useCallback(async (matchId: string, status: string) => {
    const supabase = createClient();
    if (!supabase) return;
    await supabase.from("castly_matches").update({ status }).eq("id", matchId);
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

  if (loading) {
    return (
      <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>⚡</div>
          <p style={{ color: "var(--text-muted)" }}>Chargement…</p>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh" }}>
      {/* NAV */}
      <nav className="nav">
        <Link href="/" className="nav-logo">Castly</Link>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "none" }} className="hide-mobile">{profile?.display_name}</span>
          <Link href="/castings" className="btn-outline" style={{ padding: "0.45rem 1rem", fontSize: "0.82rem" }}>Castings</Link>
          <Link href="/onboarding" className="btn-outline" style={{ padding: "0.45rem 1rem", fontSize: "0.82rem" }}>Profil</Link>
          <button onClick={handleLogout} style={{ padding: "0.45rem 1rem", fontSize: "0.82rem", borderRadius: "999px", border: "1px solid var(--border)", background: "transparent", color: "var(--text-muted)", cursor: "pointer" }}>
            Déconnexion
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "2rem" }}>
        {/* HEADER */}
        <div style={{ marginBottom: "1.75rem" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 900 }}>Bonjour, {profile?.display_name} 👋</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "0.25rem" }}>Voici tes castings matchés par l&apos;IA</p>
        </div>

        {/* STATS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px,1fr))", gap: "1rem", marginBottom: "2rem" }}>
          {[
            { v: matches.length, l: "castings analysés", icon: "🎬" },
            { v: newCount, l: "nouveaux matches", icon: "⚡" },
            { v: savedCount, l: "sauvegardés", icon: "★" },
            { v: `${topScore}%`, l: "meilleur score", icon: "🎯" },
          ].map(s => (
            <div key={s.l} className="card" style={{ display: "flex", alignItems: "center", gap: "0.85rem", padding: "1rem 1.25rem" }}>
              <span style={{ fontSize: "1.3rem" }}>{s.icon}</span>
              <div>
                <div style={{ fontSize: "1.4rem", fontWeight: 900, color: "var(--gold)", lineHeight: 1 }}>{s.v}</div>
                <div style={{ fontSize: "0.73rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>{s.l}</div>
              </div>
            </div>
          ))}
        </div>

        {/* PROFIL CHIPS + ACTION */}
        <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", marginBottom: "1.5rem", alignItems: "center" }}>
          {profile?.artist_type.map(t => (
            <span key={t} className="pill">{ARTIST_TYPE_LABELS[t]}</span>
          ))}
          {profile?.city && <span className="pill-muted pill">📍 {profile.city}</span>}
          <button onClick={refreshMatches} disabled={refreshing}
            className="btn-outline" style={{ marginLeft: "auto", padding: "0.35rem 0.9rem", fontSize: "0.8rem" }}>
            {refreshing ? "Analyse…" : "↻ Relancer l'IA"}
          </button>
        </div>

        {/* FILTERS */}
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem" }}>
          {([
            { key: "all", label: `Tous (${matches.length})` },
            { key: "new", label: `Nouveaux (${newCount})` },
            { key: "saved", label: `Sauvegardés (${savedCount})` },
          ] as const).map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              style={{ padding: "0.45rem 1rem", borderRadius: "999px", border: "1px solid", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer",
                borderColor: filter === f.key ? "var(--gold-border)" : "var(--border)",
                background: filter === f.key ? "var(--gold-dim)" : "transparent",
                color: filter === f.key ? "var(--gold)" : "var(--text-muted)" }}>
              {f.label}
            </button>
          ))}
        </div>

        {/* MATCHES LIST */}
        <div style={{ display: "grid", gap: "0.75rem" }}>
          {filtered.length === 0 && (
            <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
              <p style={{ color: "var(--text-muted)", marginBottom: "1rem" }}>
                {filter === "saved" ? "Aucun casting sauvegardé." : "Aucun casting pour ce filtre."}
              </p>
              <button onClick={refreshMatches} className="btn-gold">⚡ Lancer l&apos;analyse IA</button>
            </div>
          )}
          {filtered.map(match => {
            const c = match.casting;
            if (!c) return null;
            const daysLeft = c.deadline_at ? Math.ceil((new Date(c.deadline_at).getTime() - Date.now()) / 86400000) : null;

            return (
              <div key={match.id} className={`casting-card ${c.is_featured ? "featured" : ""}`}
                style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "1rem" }}>
                <ScoreBadge score={match.match_score} />
                <div style={{ display: "grid", gap: "0.5rem", minWidth: 0 }}>
                  <div style={{ display: "flex", gap: "0.5rem", alignItems: "flex-start", flexWrap: "wrap" }}>
                    <Link href={`/castings/${c.id}`} style={{ fontWeight: 700, fontSize: "1rem", flex: 1, textDecoration: "none", color: "inherit" }}>
                      {c.title}
                    </Link>
                    {c.is_featured && <span className="pill" style={{ fontSize: "0.72rem" }}>★ Partenaire</span>}
                    {c.is_paid && <span className="pill-green pill" style={{ fontSize: "0.72rem" }}>Rémunéré</span>}
                  </div>
                  {c.location && <p style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>📍 {c.location}</p>}
                  {c.description && (
                    <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", lineHeight: 1.55, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {c.description}
                    </p>
                  )}
                  {match.match_reasons.length > 0 && (
                    <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                      {match.match_reasons.map((r, i) => (
                        <span key={i} style={{ fontSize: "0.75rem", padding: "0.2rem 0.6rem", borderRadius: "999px", background: "rgba(56,199,147,0.08)", border: "1px solid rgba(56,199,147,0.2)", color: "var(--green)" }}>✓ {r}</span>
                      ))}
                    </div>
                  )}
                  {match.match_blockers.length > 0 && (
                    <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                      {match.match_blockers.map((b, i) => (
                        <span key={i} style={{ fontSize: "0.75rem", padding: "0.2rem 0.6rem", borderRadius: "999px", background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", color: "var(--red)" }}>⚠ {b}</span>
                      ))}
                    </div>
                  )}
                  <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", marginTop: "0.25rem", flexWrap: "wrap" }}>
                    {daysLeft !== null && (
                      <span style={{ fontSize: "0.78rem", color: daysLeft <= 3 ? "var(--red)" : "var(--text-muted)" }}>
                        {daysLeft <= 0 ? "Expiré" : `${daysLeft}j restants`}
                      </span>
                    )}
                    {c.source_url && (
                      <a href={c.source_url} target="_blank" rel="noreferrer" className="btn-gold" style={{ padding: "0.35rem 1rem", fontSize: "0.8rem" }}>
                        Postuler →
                      </a>
                    )}
                    <button onClick={() => updateStatus(match.id, match.status === "saved" ? "new" : "saved")}
                      style={{ fontSize: "0.8rem", padding: "0.35rem 0.8rem", borderRadius: "999px", border: "1px solid var(--border)", background: "transparent", color: match.status === "saved" ? "var(--gold)" : "var(--text-muted)", cursor: "pointer" }}>
                      {match.status === "saved" ? "★ Sauvegardé" : "☆ Sauvegarder"}
                    </button>
                    {match.status !== "dismissed" && (
                      <button onClick={() => updateStatus(match.id, "dismissed")}
                        style={{ fontSize: "0.78rem", padding: "0.3rem 0.7rem", borderRadius: "999px", border: "none", background: "transparent", color: "rgba(255,255,255,0.2)", cursor: "pointer" }}>
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
