"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ARTIST_TYPE_LABELS, ARTIST_TYPE_ICONS } from "@/types";
import type { ArtistType, CastlyProfile } from "@/types";

const GENDER_OPTIONS = [
  { key: "", label: "Tous genres" },
  { key: "male", label: "Homme" },
  { key: "female", label: "Femme" },
];

export default function ArtistsPage() {
  const [artists, setArtists] = useState<Partial<CastlyProfile>[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<ArtistType | "">("");
  const [genderFilter, setGenderFilter] = useState("");
  const [citySearch, setCitySearch] = useState("");
  const [styleSearch, setStyleSearch] = useState("");

  useEffect(() => {
    const p = new URLSearchParams();
    if (typeFilter) p.set("type", typeFilter);
    if (genderFilter) p.set("gender", genderFilter);
    if (citySearch) p.set("city", citySearch);
    if (styleSearch) p.set("style", styleSearch);
    setLoading(true);
    fetch(`/api/artists?${p}`)
      .then(r => r.json())
      .then(d => { setArtists(d.artists ?? []); setLoading(false); });
  }, [typeFilter, genderFilter, citySearch, styleSearch]);

  return (
    <main style={{ minHeight: "100vh" }}>
      <nav className="nav">
        <Link href="/" className="nav-logo">Castly</Link>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <Link href="/castings" style={{ color: "var(--text-muted)", fontSize: "0.85rem", textDecoration: "none" }}>Castings</Link>
          <Link href="/auth/login" className="btn-outline" style={{ padding: "0.45rem 1rem", fontSize: "0.82rem" }}>Connexion</Link>
          <Link href="/auth/signup" className="btn-gold" style={{ padding: "0.45rem 1rem", fontSize: "0.82rem" }}>S&apos;inscrire</Link>
        </div>
      </nav>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "2.5rem 2rem" }}>
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "2rem", fontWeight: 900, marginBottom: "0.5rem" }}>Artistes disponibles</h1>
          <p style={{ color: "var(--text-muted)" }}>
            {artists.length} profils visibles — <Link href="/auth/signup?role=recruiter" style={{ color: "var(--gold)", textDecoration: "none" }}>Inscris-toi comme recruteur</Link> pour contacter les artistes et utiliser l&apos;IA de matching
          </p>
        </div>

        {/* FILTERS */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "0.75rem", marginBottom: "1.75rem" }}>
          <select className="input" value={typeFilter} onChange={e => setTypeFilter(e.target.value as ArtistType | "")}>
            <option value="">Tous types</option>
            {(Object.entries(ARTIST_TYPE_LABELS) as [ArtistType, string][]).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <select className="input" value={genderFilter} onChange={e => setGenderFilter(e.target.value)}>
            {GENDER_OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
          </select>
          <input className="input" placeholder="Ville…" value={citySearch} onChange={e => setCitySearch(e.target.value)} />
          <input className="input" placeholder="Style (trap, R&B, ballet…)" value={styleSearch} onChange={e => setStyleSearch(e.target.value)} />
        </div>

        {/* CTA RECRUTEUR */}
        <div className="card" style={{ background: "linear-gradient(135deg,rgba(232,184,109,0.07),rgba(56,199,147,0.04))", borderColor: "var(--gold-border)", marginBottom: "1.75rem", display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap" }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 700, marginBottom: "0.2rem" }}>🎬 Vous cherchez des artistes pour un projet ?</p>
            <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>Postez un brief et l&apos;IA vous trouve les profils les plus compatibles en quelques secondes.</p>
          </div>
          <Link href="/auth/signup" className="btn-gold" style={{ flexShrink: 0 }}>Poster un brief →</Link>
        </div>

        {/* GRID */}
        {loading ? (
          <p style={{ textAlign: "center", padding: "4rem", color: "var(--text-muted)" }}>Chargement…</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px,1fr))", gap: "1rem" }}>
            {artists.map(a => {
              const age = a.birth_year ? new Date().getFullYear() - a.birth_year : null;
              return (
                <Link key={a.id} href={`/artists/${a.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                  <div className="card" style={{ display: "grid", gap: "0.75rem", transition: "all 0.15s", cursor: "pointer" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--gold-border)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = ""; (e.currentTarget as HTMLElement).style.transform = ""; }}>
                    {/* AVATAR PLACEHOLDER */}
                    <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--gold-dim)", border: "2px solid var(--gold-border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem" }}>
                      {a.artist_type?.[0] ? ARTIST_TYPE_ICONS[a.artist_type[0]] : "🎭"}
                    </div>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: "1rem" }}>{a.display_name}</p>
                      <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginTop: "0.3rem" }}>
                        {a.artist_type?.slice(0, 2).map(t => (
                          <span key={t} className="pill" style={{ fontSize: "0.7rem", padding: "0.15rem 0.5rem" }}>{ARTIST_TYPE_LABELS[t]}</span>
                        ))}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "1rem", fontSize: "0.8rem", color: "var(--text-muted)", flexWrap: "wrap" }}>
                      {a.city && <span>📍 {a.city}</span>}
                      {age && <span>👤 {age} ans</span>}
                      {a.experience_years != null && a.experience_years > 0 && <span>⭐ {a.experience_years} ans exp.</span>}
                    </div>
                    {a.style_tags && a.style_tags.length > 0 && (
                      <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
                        {a.style_tags.slice(0, 3).map(t => (
                          <span key={t} className="pill-muted pill" style={{ fontSize: "0.7rem", padding: "0.15rem 0.5rem" }}>{t}</span>
                        ))}
                      </div>
                    )}
                    {a.bio && (
                      <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {a.bio}
                      </p>
                    )}
                    {a.day_rate_eur && (
                      <p style={{ fontSize: "0.78rem", color: "var(--green)", fontWeight: 600 }}>💰 {a.day_rate_eur}€ / jour</p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
        {!loading && artists.length === 0 && (
          <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
            <p style={{ color: "var(--text-muted)" }}>Aucun artiste pour ces critères.</p>
          </div>
        )}
      </div>
    </main>
  );
}
