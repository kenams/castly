"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
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
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    createClient().auth.getUser().then((r: Awaited<ReturnType<ReturnType<typeof createClient>["auth"]["getUser"]>>) => setIsLoggedIn(!!r.data.user));
  }, []);

  useEffect(() => {
    setLoading(true);
    const p = new URLSearchParams();
    if (typeFilter) p.set("type", typeFilter);
    if (genderFilter) p.set("gender", genderFilter);
    if (citySearch) p.set("city", citySearch);
    if (styleSearch) p.set("style", styleSearch);
    fetch(`/api/artists?${p}`)
      .then(r => r.json())
      .then(d => { setArtists(d.artists ?? []); setLoading(false); });
  }, [typeFilter, genderFilter, citySearch, styleSearch]);

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <nav className="nav">
        <Link href="/" className="nav-logo">Castly</Link>
        <div style={{ display: "flex", gap: "0.6rem", alignItems: "center" }}>
          <Link href="/castings" style={{ color: "var(--text-muted)", fontSize: "0.85rem", textDecoration: "none", padding: "0.4rem 0.7rem", transition: "color 0.15s" }}>Castings</Link>
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
        <div style={{ maxWidth: 1040, margin: "0 auto" }}>
          <div style={{ marginBottom: "1.5rem" }}>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 900, letterSpacing: "-0.04em", marginBottom: "0.3rem" }}>Artistes disponibles</h1>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
              {loading ? "…" : <>{artists.length} profil{artists.length > 1 ? "s" : ""} visible{artists.length > 1 ? "s" : ""}</>}
              {!isLoggedIn && (
                <> — <Link href="/auth/signup?role=recruiter" style={{ color: "var(--gold)", textDecoration: "none", fontWeight: 600 }}>Inscris-toi comme recruteur</Link> pour les contacter</>
              )}
            </p>
          </div>
          {/* FILTERS */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "0.65rem" }}>
            <select className="input" value={typeFilter} onChange={e => setTypeFilter(e.target.value as ArtistType | "")} style={{ fontSize: "0.85rem" }}>
              <option value="">🎭 Tous types</option>
              {(Object.entries(ARTIST_TYPE_LABELS) as [ArtistType, string][]).map(([k, v]) => (
                <option key={k} value={k}>{ARTIST_TYPE_ICONS[k]} {v}</option>
              ))}
            </select>
            <select className="input" value={genderFilter} onChange={e => setGenderFilter(e.target.value)} style={{ fontSize: "0.85rem" }}>
              {GENDER_OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
            </select>
            <input className="input" placeholder="📍 Ville…" value={citySearch} onChange={e => setCitySearch(e.target.value)} style={{ fontSize: "0.85rem" }} />
            <input className="input" placeholder="🎨 Style (trap, R&B…)" value={styleSearch} onChange={e => setStyleSearch(e.target.value)} style={{ fontSize: "0.85rem" }} />
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1040, margin: "0 auto", padding: "2rem" }}>
        {/* CTA RECRUTEUR */}
        {!isLoggedIn && (
          <div className="card animate-fade-up" style={{
            background: "linear-gradient(135deg,rgba(56,199,147,0.06),rgba(232,184,109,0.03))",
            borderColor: "var(--green-border)", marginBottom: "1.75rem",
            display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap",
          }}>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 700, marginBottom: "0.25rem", letterSpacing: "-0.01em" }}>🎬 Vous cherchez des artistes pour un projet ?</p>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Postez un brief et l&apos;IA vous trouve les profils les plus compatibles en quelques secondes.</p>
            </div>
            <Link href="/auth/signup?role=recruiter" className="btn-green" style={{ flexShrink: 0, fontSize: "0.85rem" }}>Poster un brief →</Link>
          </div>
        )}

        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: "1rem" }}>
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="card" style={{ padding: "1.25rem", height: 160 }}>
                <div style={{ display: "flex", gap: "0.9rem", marginBottom: "0.75rem" }}>
                  <div className="skeleton" style={{ width: 48, height: 48, borderRadius: "50%", flexShrink: 0 }} />
                  <div style={{ flex: 1, display: "grid", gap: "0.5rem", alignContent: "start" }}>
                    <div className="skeleton" style={{ height: 14, width: "70%", borderRadius: 6 }} />
                    <div className="skeleton" style={{ height: 11, width: "50%", borderRadius: 6 }} />
                  </div>
                </div>
                <div className="skeleton" style={{ height: 11, width: "90%", borderRadius: 6, marginBottom: "0.4rem" }} />
                <div className="skeleton" style={{ height: 11, width: "75%", borderRadius: 6 }} />
              </div>
            ))}
          </div>
        ) : artists.length === 0 ? (
          <div className="card empty-state">
            <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>🎭</div>
            <p style={{ fontWeight: 700, marginBottom: "0.4rem" }}>Aucun artiste pour ces critères</p>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Modifie les filtres pour élargir la recherche.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: "1rem" }}>
            {artists.map((a, i) => <ArtistCard key={a.id} a={a} idx={i} />)}
          </div>
        )}
      </div>
    </main>
  );
}

function ArtistCard({ a, idx }: { a: Partial<CastlyProfile>; idx: number }) {
  const age = a.birth_year ? new Date().getFullYear() - a.birth_year : null;
  const initials = (a.display_name ?? "?").slice(0, 2).toUpperCase();

  return (
    <Link href={`/artists/${a.id}`} style={{ textDecoration: "none", color: "inherit" }}>
      <div
        className="card card-hover animate-fade-up"
        style={{ animationDelay: `${idx * 0.04}s`, display: "grid", gap: "0.85rem", cursor: "pointer", height: "100%" }}
      >
        {/* AVATAR */}
        <div style={{ display: "flex", gap: "0.9rem", alignItems: "center" }}>
          <div style={{
            width: 52, height: 52, borderRadius: "50%", flexShrink: 0,
            background: "linear-gradient(135deg,var(--gold-dim-2),var(--gold-dim))",
            border: "2px solid var(--gold-border)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: a.artist_type?.[0] ? "1.4rem" : "0.9rem",
            fontWeight: 800, color: "var(--gold)",
          }}>
            {a.artist_type?.[0] ? ARTIST_TYPE_ICONS[a.artist_type[0]] : initials}
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontWeight: 700, fontSize: "0.95rem", letterSpacing: "-0.01em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.display_name}</p>
            <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap", marginTop: "0.25rem" }}>
              {a.artist_type?.slice(0, 2).map(t => (
                <span key={t} className="pill" style={{ fontSize: "0.65rem", padding: "0.15rem 0.45rem" }}>{ARTIST_TYPE_LABELS[t]}</span>
              ))}
            </div>
          </div>
        </div>

        {/* META */}
        <div style={{ display: "flex", gap: "0.75rem", fontSize: "0.78rem", color: "var(--text-muted)", flexWrap: "wrap" }}>
          {a.city && <span>📍 {a.city}</span>}
          {age && <span>👤 {age} ans</span>}
          {a.experience_years != null && a.experience_years > 0 && <span>⭐ {a.experience_years} an{a.experience_years > 1 ? "s" : ""}</span>}
        </div>

        {/* STYLE TAGS */}
        {a.style_tags && a.style_tags.length > 0 && (
          <div style={{ display: "flex", gap: "0.3rem", flexWrap: "wrap" }}>
            {a.style_tags.slice(0, 3).map(t => (
              <span key={t} className="pill-muted pill" style={{ fontSize: "0.65rem", padding: "0.12rem 0.45rem" }}>{t}</span>
            ))}
          </div>
        )}

        {/* BIO PREVIEW */}
        {a.bio && (
          <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", lineHeight: 1.55, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {a.bio}
          </p>
        )}

        {/* FOOTER */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto", paddingTop: "0.25rem" }}>
          {a.day_rate_eur ? (
            <span style={{ fontSize: "0.8rem", color: "var(--green)", fontWeight: 700 }}>{a.day_rate_eur}€<span style={{ color: "var(--text-faint)", fontWeight: 400 }}>/j</span></span>
          ) : <span />}
          <span style={{ fontSize: "0.75rem", color: "var(--text-faint)" }}>Voir le profil →</span>
        </div>
      </div>
    </Link>
  );
}
