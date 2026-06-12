"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ARTIST_TYPE_LABELS, ARTIST_TYPE_ICONS, GENDER_LABELS } from "@/types";
import type { CastlyProfile } from "@/types";

export default function ArtistProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [artist, setArtist] = useState<Partial<CastlyProfile> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/artists/${id}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { setArtist(d?.artist ?? null); setLoading(false); });
  }, [id]);

  const age = artist?.birth_year ? new Date().getFullYear() - artist.birth_year : null;
  const links = (artist?.social_links as Record<string, string> | undefined) ?? {};

  return (
    <main style={{ minHeight: "100vh" }}>
      <nav className="nav">
        <Link href="/" className="nav-logo">Castly</Link>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <Link href="/artists" className="btn-outline" style={{ padding: "0.45rem 1rem", fontSize: "0.82rem" }}>← Artistes</Link>
          <Link href="/auth/signup" className="btn-gold" style={{ padding: "0.45rem 1rem", fontSize: "0.82rem" }}>Contacter cet artiste</Link>
        </div>
      </nav>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "2.5rem 2rem" }}>
        {loading && <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "4rem" }}>Chargement…</p>}
        {!loading && !artist && (
          <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
            <p style={{ color: "var(--text-muted)", marginBottom: "1rem" }}>Profil introuvable ou non visible.</p>
            <Link href="/artists" className="btn-gold">Voir tous les artistes</Link>
          </div>
        )}
        {artist && (
          <div style={{ display: "grid", gap: "1.5rem" }}>
            {/* HEADER */}
            <div className="card" style={{ display: "flex", gap: "1.5rem", alignItems: "flex-start", flexWrap: "wrap" }}>
              <div style={{ width: 80, height: 80, borderRadius: "50%", background: "var(--gold-dim)", border: "2px solid var(--gold-border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", flexShrink: 0 }}>
                {artist.artist_type?.[0] ? ARTIST_TYPE_ICONS[artist.artist_type[0]] : "🎭"}
              </div>
              <div style={{ flex: 1 }}>
                <h1 style={{ fontSize: "1.6rem", fontWeight: 900, marginBottom: "0.4rem" }}>{artist.display_name}</h1>
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.5rem" }}>
                  {artist.artist_type?.map(t => (
                    <span key={t} className="pill" style={{ fontSize: "0.75rem" }}>{ARTIST_TYPE_ICONS[t]} {ARTIST_TYPE_LABELS[t]}</span>
                  ))}
                </div>
                <div style={{ display: "flex", gap: "1rem", fontSize: "0.85rem", color: "var(--text-muted)", flexWrap: "wrap" }}>
                  {artist.city && <span>📍 {artist.city}</span>}
                  {age && <span>👤 {age} ans</span>}
                  {artist.gender && <span>{GENDER_LABELS[artist.gender]}</span>}
                  {artist.experience_years != null && artist.experience_years > 0 && <span>⭐ {artist.experience_years} ans d&apos;expérience</span>}
                </div>
              </div>
              {artist.day_rate_eur && (
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontSize: "1.3rem", fontWeight: 900, color: "var(--gold)" }}>{artist.day_rate_eur}€</p>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>/ jour</p>
                </div>
              )}
            </div>

            {/* INFOS PHYSIQUES */}
            {(artist.height_cm || artist.eye_color || artist.hair_color) && (
              <div className="card">
                <h2 style={{ fontWeight: 700, marginBottom: "0.75rem", fontSize: "0.95rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Profil physique</h2>
                <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
                  {artist.height_cm && <span style={{ fontSize: "0.9rem" }}>📏 {artist.height_cm} cm</span>}
                  {artist.eye_color && <span style={{ fontSize: "0.9rem" }}>👁 Yeux {artist.eye_color}</span>}
                  {artist.hair_color && <span style={{ fontSize: "0.9rem" }}>💇 Cheveux {artist.hair_color}</span>}
                </div>
              </div>
            )}

            {/* STYLE + COMPÉTENCES */}
            {((artist.style_tags?.length ?? 0) > 0 || (artist.skills?.length ?? 0) > 0) && (
              <div className="card">
                {(artist.style_tags?.length ?? 0) > 0 && (
                  <div style={{ marginBottom: artist.skills?.length ? "1rem" : 0 }}>
                    <h2 style={{ fontWeight: 700, marginBottom: "0.6rem", fontSize: "0.95rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Style</h2>
                    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                      {artist.style_tags?.map(t => <span key={t} className="pill-muted pill" style={{ fontSize: "0.8rem" }}>{t}</span>)}
                    </div>
                  </div>
                )}
                {(artist.skills?.length ?? 0) > 0 && (
                  <div>
                    <h2 style={{ fontWeight: 700, marginBottom: "0.6rem", fontSize: "0.95rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Compétences</h2>
                    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                      {artist.skills?.map(s => <span key={s} className="pill-muted pill" style={{ fontSize: "0.8rem" }}>{s}</span>)}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* BIO */}
            {artist.bio && (
              <div className="card">
                <h2 style={{ fontWeight: 700, marginBottom: "0.75rem", fontSize: "0.95rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Bio</h2>
                <p style={{ color: "var(--text-muted)", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{artist.bio}</p>
              </div>
            )}

            {/* LIENS */}
            {Object.keys(links).length > 0 && (
              <div className="card">
                <h2 style={{ fontWeight: 700, marginBottom: "0.75rem", fontSize: "0.95rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Liens</h2>
                <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                  {links.instagram && <a href={links.instagram.startsWith("http") ? links.instagram : `https://${links.instagram}`} target="_blank" rel="noreferrer" className="pill-muted pill" style={{ textDecoration: "none", fontSize: "0.85rem" }}>📸 Instagram</a>}
                  {links.tiktok && <a href={links.tiktok.startsWith("http") ? links.tiktok : `https://${links.tiktok}`} target="_blank" rel="noreferrer" className="pill-muted pill" style={{ textDecoration: "none", fontSize: "0.85rem" }}>🎵 TikTok</a>}
                  {links.spotify && <a href={links.spotify.startsWith("http") ? links.spotify : `https://${links.spotify}`} target="_blank" rel="noreferrer" className="pill-muted pill" style={{ textDecoration: "none", fontSize: "0.85rem" }}>🎧 Spotify</a>}
                  {links.soundcloud && <a href={links.soundcloud.startsWith("http") ? links.soundcloud : `https://${links.soundcloud}`} target="_blank" rel="noreferrer" className="pill-muted pill" style={{ textDecoration: "none", fontSize: "0.85rem" }}>🔊 SoundCloud</a>}
                  {links.youtube && <a href={links.youtube.startsWith("http") ? links.youtube : `https://${links.youtube}`} target="_blank" rel="noreferrer" className="pill-muted pill" style={{ textDecoration: "none", fontSize: "0.85rem" }}>▶️ YouTube</a>}
                  {links.website && <a href={links.website.startsWith("http") ? links.website : `https://${links.website}`} target="_blank" rel="noreferrer" className="pill-muted pill" style={{ textDecoration: "none", fontSize: "0.85rem" }}>🌐 Site web</a>}
                </div>
              </div>
            )}

            {/* CTA RECRUTEUR */}
            <div className="card" style={{ background: "linear-gradient(135deg,rgba(232,184,109,0.07),rgba(56,199,147,0.04))", borderColor: "var(--gold-border)", textAlign: "center", padding: "2rem" }}>
              <p style={{ fontWeight: 700, marginBottom: "0.5rem" }}>Cet artiste vous intéresse ?</p>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>Créez un compte recruteur pour contacter {artist.display_name} et accéder à tous les profils.</p>
              <Link href="/auth/signup" className="btn-gold">Créer un compte recruteur →</Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
