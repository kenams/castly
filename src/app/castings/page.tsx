"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ARTIST_TYPE_LABELS } from "@/types";
import type { ArtistType, CastlyCasting } from "@/types";

const TYPE_FILTERS: { key: ArtistType | "all"; label: string; icon: string }[] = [
  { key: "all", label: "Tous", icon: "🎭" },
  { key: "actor", label: "Acteurs", icon: "🎬" },
  { key: "singer", label: "Chanteurs", icon: "🎤" },
  { key: "rapper", label: "Rappeurs", icon: "🎤" },
  { key: "dancer", label: "Danseurs", icon: "💃" },
  { key: "model", label: "Mannequins", icon: "📸" },
  { key: "voice_actor", label: "Voix", icon: "🎙️" },
];

export default function CastingsPage() {
  const [castings, setCastings] = useState<CastlyCasting[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ArtistType | "all">("all");
  const [search, setSearch] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    createClient().auth.getUser().then((r: Awaited<ReturnType<ReturnType<typeof createClient>["auth"]["getUser"]>>) => setIsLoggedIn(!!r.data.user));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filter !== "all") params.set("type", filter);
    fetch(`/api/castings?${params}`)
      .then(r => r.json())
      .then(d => { setCastings(d.castings ?? []); setLoading(false); });
  }, [filter]);

  const visible = castings.filter(c =>
    search === "" ||
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    (c.location ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (c.description ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const featured = visible.filter(c => c.is_featured);
  const regular = visible.filter(c => !c.is_featured);

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <nav className="nav">
        <Link href="/" className="nav-logo">Castly</Link>
        <div style={{ display: "flex", gap: "0.6rem", alignItems: "center" }}>
          <Link href="/castings" style={{ color: "var(--gold)", fontSize: "0.85rem", textDecoration: "none", padding: "0.4rem 0.7rem", fontWeight: 600 }}>Castings</Link>
          <Link href="/artists" style={{ color: "var(--text-muted)", fontSize: "0.85rem", textDecoration: "none", padding: "0.4rem 0.7rem", transition: "color 0.15s" }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--text)")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}>Artistes</Link>
          {isLoggedIn ? (
            <Link href="/dashboard" className="btn-gold" style={{ padding: "0.45rem 1rem", fontSize: "0.82rem" }}>Dashboard →</Link>
          ) : (
            <>
              <Link href="/auth/login" className="btn-outline" style={{ padding: "0.45rem 1rem", fontSize: "0.82rem" }}>Connexion</Link>
              <Link href="/auth/signup" className="btn-gold" style={{ padding: "0.45rem 1rem", fontSize: "0.82rem" }}>S&apos;inscrire</Link>
            </>
          )}
        </div>
      </nav>

      {/* HEADER */}
      <div style={{ borderBottom: "1px solid var(--border)", background: "var(--bg-2)", padding: "2.5rem 2rem 1.75rem" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "1rem", marginBottom: "1.5rem" }}>
            <div>
              <h1 style={{ fontSize: "1.75rem", fontWeight: 900, letterSpacing: "-0.04em", marginBottom: "0.3rem" }}>Castings disponibles</h1>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                {loading ? "…" : <>{visible.length} offre{visible.length > 1 ? "s" : ""} indexée{visible.length > 1 ? "s" : ""}</>}
                {!isLoggedIn && (
                  <> — <Link href="/auth/signup" style={{ color: "var(--gold)", textDecoration: "none", fontWeight: 600 }}>Inscris-toi</Link> pour voir ton score IA</>
                )}
              </p>
            </div>
            <input
              className="input"
              placeholder="🔍  Rechercher un casting, une ville…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: "auto", minWidth: 260, fontSize: "0.85rem" }}
            />
          </div>

          {/* FILTERS */}
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {TYPE_FILTERS.map(f => (
              <button key={f.key} onClick={() => setFilter(f.key)}
                className={`filter-tab ${filter === f.key ? "active" : ""}`}>
                {f.icon} {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "2rem" }}>
        {/* CTA BAND */}
        {!isLoggedIn && (
          <div className="card animate-fade-up" style={{
            background: "linear-gradient(135deg,rgba(232,184,109,0.06),rgba(56,199,147,0.03))",
            borderColor: "var(--gold-border)", marginBottom: "1.75rem",
            display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap",
          }}>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 700, marginBottom: "0.25rem", letterSpacing: "-0.01em" }}>🎯 Vois ton score de compatibilité sur chaque casting</p>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>L&apos;IA analyse ton profil et classe les offres par chance de succès.</p>
            </div>
            <Link href="/auth/signup" className="btn-gold" style={{ flexShrink: 0, fontSize: "0.85rem" }}>Créer mon profil gratuit →</Link>
          </div>
        )}

        {loading ? (
          <div style={{ display: "grid", gap: "0.75rem" }}>
            {[1,2,3,4,5].map(i => (
              <div key={i} className="card" style={{ padding: "1.2rem 1.4rem", height: 90 }}>
                <div style={{ display: "flex", gap: "1rem" }}>
                  <div className="skeleton" style={{ width: 44, height: 44, borderRadius: "50%", flexShrink: 0 }} />
                  <div style={{ flex: 1, display: "grid", gap: "0.6rem" }}>
                    <div className="skeleton" style={{ height: 14, width: "60%", borderRadius: 6 }} />
                    <div className="skeleton" style={{ height: 11, width: "40%", borderRadius: 6 }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="card empty-state">
            <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>🎭</div>
            <p style={{ fontWeight: 700, marginBottom: "0.4rem" }}>Aucun casting pour ce filtre</p>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Essaie un autre type ou efface la recherche.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "0.65rem" }}>
            {/* FEATURED FIRST */}
            {featured.map((c, i) => <CastingRow key={c.id} c={c} idx={i} />)}
            {regular.map((c, i) => <CastingRow key={c.id} c={c} idx={featured.length + i} />)}
          </div>
        )}
      </div>
    </main>
  );
}

function CastingRow({ c, idx }: { c: CastlyCasting; idx: number }) {
  const daysLeft = c.deadline_at ? Math.ceil((new Date(c.deadline_at).getTime() - Date.now()) / 86400000) : null;
  const urgent = daysLeft !== null && daysLeft <= 3 && daysLeft >= 0;

  return (
    <Link href={`/castings/${c.id}`} style={{ textDecoration: "none", color: "inherit" }}>
      <div
        className={`casting-card ${c.is_featured ? "featured" : ""} animate-fade-up`}
        style={{ animationDelay: `${idx * 0.04}s`, display: "grid", gridTemplateColumns: "1fr auto", gap: "1rem", alignItems: "start" }}
      >
        <div style={{ display: "grid", gap: "0.5rem", minWidth: 0 }}>
          <div style={{ display: "flex", gap: "0.6rem", alignItems: "center", flexWrap: "wrap" }}>
            {c.is_featured && <span className="pill" style={{ fontSize: "0.68rem" }}>★ Partenaire</span>}
            {c.is_paid && <span className="pill-green pill" style={{ fontSize: "0.68rem" }}>Rémunéré</span>}
            {urgent && <span className="pill-red" style={{ fontSize: "0.68rem" }}>⚡ Urgent</span>}
          </div>
          <h3 style={{ fontWeight: 700, fontSize: "0.97rem", letterSpacing: "-0.01em", lineHeight: 1.3 }}>{c.title}</h3>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", fontSize: "0.8rem", color: "var(--text-muted)" }}>
            {c.location && <span>📍 {c.location}</span>}
            {(c.age_min || c.age_max) && <span>👤 {c.age_min ?? "?"}-{c.age_max ?? "?"} ans</span>}
            {c.required_gender && <span>{c.required_gender === "male" ? "Homme" : c.required_gender === "female" ? "Femme" : "Tous genres"}</span>}
          </div>
          {c.description && (
            <p style={{ fontSize: "0.83rem", color: "var(--text-muted)", lineHeight: 1.55, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
              {c.description}
            </p>
          )}
          <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
            {c.casting_type.map(t => <span key={t} className="pill-muted pill" style={{ fontSize: "0.68rem" }}>{ARTIST_TYPE_LABELS[t]}</span>)}
          </div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          {daysLeft !== null && (
            <span style={{ fontSize: "0.76rem", color: urgent ? "var(--red)" : "var(--text-faint)", display: "block", whiteSpace: "nowrap" }}>
              {daysLeft <= 0 ? "Expiré" : `${daysLeft}j`}
            </span>
          )}
          <span style={{ fontSize: "0.75rem", color: "var(--text-faint)", marginTop: "0.25rem", display: "block" }}>→</span>
        </div>
      </div>
    </Link>
  );
}
