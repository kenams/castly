"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ARTIST_TYPE_LABELS } from "@/types";
import type { ArtistType, CastlyCasting } from "@/types";

const TYPE_FILTERS: { key: ArtistType | "all"; label: string }[] = [
  { key: "all", label: "Tous" },
  { key: "actor", label: "Acteurs" },
  { key: "singer", label: "Chanteurs" },
  { key: "rapper", label: "Rappeurs" },
  { key: "dancer", label: "Danseurs" },
  { key: "model", label: "Mannequins" },
  { key: "voice_actor", label: "Voix" },
];

export default function CastingsPage() {
  const [castings, setCastings] = useState<CastlyCasting[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ArtistType | "all">("all");
  const [search, setSearch] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then((result: Awaited<ReturnType<typeof supabase.auth.getUser>>) => setIsLoggedIn(!!result.data.user));
  }, []);

  useEffect(() => {
    async function load() {
      const params = new URLSearchParams();
      if (filter !== "all") params.set("type", filter);
      const res = await fetch(`/api/castings?${params}`);
      const data = await res.json();
      setCastings(data.castings ?? []);
      setLoading(false);
    }
    load();
  }, [filter]);

  const visible = castings.filter(c =>
    search === "" ||
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    (c.location ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (c.description ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main style={{ minHeight: "100vh" }}>
      <nav className="nav">
        <Link href="/" className="nav-logo">Castly</Link>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          {isLoggedIn ? (
            <Link href="/dashboard" className="btn-gold" style={{ padding: "0.45rem 1rem", fontSize: "0.82rem" }}>Mon dashboard →</Link>
          ) : (
            <>
              <Link href="/auth/login" className="btn-outline" style={{ padding: "0.45rem 1rem", fontSize: "0.82rem" }}>Connexion</Link>
              <Link href="/auth/signup" className="btn-gold" style={{ padding: "0.45rem 1rem", fontSize: "0.82rem" }}>S&apos;inscrire</Link>
            </>
          )}
        </div>
      </nav>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "2.5rem 2rem" }}>
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "2rem", fontWeight: 900, marginBottom: "0.5rem" }}>Castings disponibles</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
            {castings.length} offres indexées
            {!isLoggedIn && <> — <Link href="/auth/signup" style={{ color: "var(--gold)", textDecoration: "none" }}>Inscris-toi</Link> pour voir ton score de compatibilité</>}
          </p>
        </div>

        {/* SEARCH + FILTERS */}
        <div style={{ display: "grid", gap: "1rem", marginBottom: "2rem" }}>
          <input
            className="input"
            placeholder="Rechercher un casting, une ville…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ maxWidth: 480 }}
          />
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {TYPE_FILTERS.map(f => (
              <button key={f.key} onClick={() => setFilter(f.key)}
                style={{
                  padding: "0.4rem 1rem", borderRadius: "999px", border: "1px solid", fontSize: "0.82rem",
                  fontWeight: 600, cursor: "pointer",
                  borderColor: filter === f.key ? "var(--gold-border)" : "var(--border)",
                  background: filter === f.key ? "var(--gold-dim)" : "transparent",
                  color: filter === f.key ? "var(--gold)" : "var(--text-muted)",
                }}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* CTA BAND — seulement si non connecté */}
        {!isLoggedIn && (
          <div className="card" style={{ background: "linear-gradient(135deg,rgba(232,184,109,0.07),rgba(56,199,147,0.04))", borderColor: "var(--gold-border)", marginBottom: "1.75rem", display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap" }}>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 700, marginBottom: "0.25rem" }}>Vois ton score de compatibilité sur chaque casting</p>
              <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>L&apos;IA analyse ton profil et classe les offres par chance de succès.</p>
            </div>
            <Link href="/auth/signup" className="btn-gold" style={{ flexShrink: 0 }}>Créer mon profil gratuit →</Link>
          </div>
        )}

        {/* LIST */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "4rem", color: "var(--text-muted)" }}>Chargement des castings…</div>
        ) : visible.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
            <p style={{ color: "var(--text-muted)" }}>Aucun casting pour ce filtre.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "0.75rem" }}>
            {visible.map(c => {
              const daysLeft = c.deadline_at ? Math.ceil((new Date(c.deadline_at).getTime() - Date.now()) / 86400000) : null;
              return (
                <Link href={`/castings/${c.id}`} key={c.id}
                  style={{ textDecoration: "none", color: "inherit" }}>
                  <div className={`casting-card ${c.is_featured ? "featured" : ""}`} style={{ display: "grid", gap: "0.6rem" }}>
                    <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start", flexWrap: "wrap" }}>
                      <h3 style={{ fontWeight: 700, fontSize: "1rem", flex: 1 }}>{c.title}</h3>
                      {c.is_featured && <span className="pill" style={{ fontSize: "0.72rem" }}>★ Partenaire</span>}
                      {c.is_paid && <span className="pill-green pill" style={{ fontSize: "0.72rem" }}>Rémunéré</span>}
                    </div>
                    <div style={{ display: "flex", gap: "1.25rem", flexWrap: "wrap", fontSize: "0.82rem", color: "var(--text-muted)" }}>
                      {c.location && <span>📍 {c.location}</span>}
                      {(c.age_min || c.age_max) && <span>👤 {c.age_min ?? "?"}-{c.age_max ?? "?"} ans</span>}
                      {c.required_gender && <span>{c.required_gender === "male" ? "Homme" : c.required_gender === "female" ? "Femme" : "Tous genres"}</span>}
                      {daysLeft !== null && <span style={{ color: daysLeft <= 3 ? "var(--red)" : "inherit" }}>{daysLeft <= 0 ? "Expiré" : `${daysLeft}j restants`}</span>}
                    </div>
                    {c.description && (
                      <p style={{ fontSize: "0.87rem", color: "var(--text-muted)", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {c.description}
                      </p>
                    )}
                    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "0.1rem" }}>
                      {c.casting_type.map(t => (
                        <span key={t} className="pill-muted pill" style={{ fontSize: "0.72rem" }}>{ARTIST_TYPE_LABELS[t]}</span>
                      ))}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
