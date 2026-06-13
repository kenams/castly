"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ARTIST_TYPE_LABELS, ARTIST_TYPE_ICONS, GENDER_LABELS } from "@/types";
import type { CastlyProfile } from "@/types";

export default function ArtistProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [artist, setArtist] = useState<Partial<CastlyProfile> | null>(null);
  const [loading, setLoading] = useState(true);
  const [contactEmail, setContactEmail] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [contactRevealed, setContactRevealed] = useState(false);
  const [contactLoading, setContactLoading] = useState(false);
  const [credits, setCredits] = useState<number | null>(null);
  const [noCredits, setNoCredits] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/artists/${id}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { setArtist(d?.artist ?? null); setLoading(false); });

    const supabase = createClient();
    void supabase.auth.getUser().then(async (result: Awaited<ReturnType<typeof supabase.auth.getUser>>) => {
      const user = result.data.user;
      setIsLoggedIn(!!user);
      if (user) {
        const { data: rec } = await supabase.from("castly_recruiters").select("id, credits").eq("user_id", user.id).single();
        if (rec) {
          setCredits((rec as { id: string; credits: number }).credits);
          const { data: reveal } = await supabase
            .from("castly_contact_reveals")
            .select("id")
            .eq("recruiter_id", (rec as { id: string }).id)
            .eq("profile_id", id)
            .maybeSingle();
          if (reveal) {
            const r = await fetch(`/api/artists/${id}/contact`);
            if (r.ok) {
              const d = await r.json();
              setContactEmail(d.contact_email);
              setContactRevealed(true);
            }
          }
        }
      }
    });
  }, [id]);

  const revealContact = async () => {
    setContactLoading(true);
    setNoCredits(false);
    const r = await fetch(`/api/artists/${id}/contact`);
    if (r.ok) {
      const d = await r.json();
      setContactEmail(d.contact_email);
      setContactRevealed(true);
      if (d.credits_remaining !== undefined) setCredits(d.credits_remaining);
    } else if (r.status === 402) {
      setNoCredits(true);
    }
    setContactLoading(false);
  };

  const age = artist?.birth_year ? new Date().getFullYear() - artist.birth_year : null;
  const links = (artist?.social_links as Record<string, string> | undefined) ?? {};

  if (loading) {
    return (
      <main style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 44, height: 44, border: "2px solid var(--gold-border)", borderTop: "2px solid var(--gold)", borderRadius: "50%", animation: "spin-slow 0.8s linear infinite", margin: "0 auto 1rem" }} />
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Chargement du profil…</p>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <nav className="nav">
        <Link href="/" className="nav-logo">Castly</Link>
        <div style={{ display: "flex", gap: "0.6rem", alignItems: "center" }}>
          <Link href="/artists" className="btn-outline" style={{ padding: "0.42rem 0.9rem", fontSize: "0.8rem" }}>← Artistes</Link>
          {isLoggedIn && credits !== null && (
            <Link href="/credits" style={{ fontSize: "0.75rem", color: "var(--gold)", textDecoration: "none", background: "var(--gold-dim)", border: "1px solid var(--gold-border)", borderRadius: "999px", padding: "0.3rem 0.7rem", fontWeight: 700 }}>
              💳 {credits} crédit{credits !== 1 ? "s" : ""}
            </Link>
          )}
          {isLoggedIn ? (
            <button
              className={contactRevealed ? "btn-outline" : "btn-gold"}
              style={{ padding: "0.42rem 1rem", fontSize: "0.82rem", cursor: contactRevealed ? "default" : "pointer" }}
              onClick={!contactRevealed ? revealContact : undefined}
              disabled={contactLoading || contactRevealed}
            >
              {contactRevealed ? "✓ Contact révélé" : contactLoading ? (
                <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <span style={{ width: 10, height: 10, border: "2px solid rgba(0,0,0,0.2)", borderTop: "2px solid #000", borderRadius: "50%", animation: "spin-slow 0.7s linear infinite", display: "inline-block" }} />
                  Révélation…
                </span>
              ) : "📧 Contacter (1 crédit)"}
            </button>
          ) : (
            <Link href="/auth/signup" className="btn-gold" style={{ padding: "0.42rem 1rem", fontSize: "0.82rem" }}>Contacter cet artiste</Link>
          )}
        </div>
      </nav>

      {!artist ? (
        <div style={{ maxWidth: 560, margin: "6rem auto", padding: "0 2rem", textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🎭</div>
          <p style={{ fontWeight: 700, marginBottom: "0.5rem" }}>Profil introuvable</p>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>Ce profil n&apos;existe pas ou n&apos;est plus visible.</p>
          <Link href="/artists" className="btn-gold">Voir tous les artistes →</Link>
        </div>
      ) : (
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "2.5rem 2rem", display: "grid", gap: "1.25rem" }}>

          {/* HERO CARD */}
          <div className="card animate-fade-up" style={{ position: "relative", overflow: "hidden", padding: "2rem" }}>
            <div style={{ position: "absolute", top: 0, right: 0, width: 200, height: 200, background: "radial-gradient(circle,rgba(232,184,109,0.08),transparent 70%)", pointerEvents: "none" }} />
            <div style={{ display: "flex", gap: "1.5rem", alignItems: "flex-start", flexWrap: "wrap", position: "relative" }}>
              {/* AVATAR */}
              <div style={{
                width: 88, height: 88, borderRadius: "50%", flexShrink: 0,
                background: "linear-gradient(135deg,var(--gold-dim-2),var(--gold-dim))",
                border: "2px solid var(--gold-border)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "2.2rem", boxShadow: "var(--shadow-gold)",
              }}>
                {artist.artist_type?.[0] ? ARTIST_TYPE_ICONS[artist.artist_type[0]] : "🎭"}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h1 style={{ fontSize: "1.75rem", fontWeight: 900, letterSpacing: "-0.04em", marginBottom: "0.5rem" }}>{artist.display_name}</h1>
                <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>
                  {artist.artist_type?.map(t => (
                    <span key={t} className="pill" style={{ fontSize: "0.72rem" }}>{ARTIST_TYPE_ICONS[t]} {ARTIST_TYPE_LABELS[t]}</span>
                  ))}
                </div>
                <div style={{ display: "flex", gap: "1.25rem", flexWrap: "wrap", fontSize: "0.83rem", color: "var(--text-muted)" }}>
                  {artist.city && <span>📍 {artist.city}</span>}
                  {age && <span>👤 {age} ans</span>}
                  {artist.gender && <span>{GENDER_LABELS[artist.gender]}</span>}
                  {artist.experience_years != null && artist.experience_years > 0 && <span>⭐ {artist.experience_years} an{artist.experience_years > 1 ? "s" : ""} d&apos;exp.</span>}
                </div>
              </div>
              {artist.day_rate_eur && (
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: "1.5rem", fontWeight: 900, color: "var(--green)", letterSpacing: "-0.04em", lineHeight: 1 }}>{artist.day_rate_eur}€</div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-faint)", marginTop: "0.2rem" }}>/ jour</div>
                </div>
              )}
            </div>
          </div>

          {/* CONTACT RÉVÉLÉ */}
          {contactRevealed && contactEmail && (
            <div className="card animate-fade-up" style={{ background: "linear-gradient(135deg,rgba(56,199,147,0.08),rgba(232,184,109,0.05))", borderColor: "rgba(56,199,147,0.3)", padding: "1.5rem" }}>
              <p style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-faint)", marginBottom: "0.6rem" }}>📧 Contact révélé</p>
              <a href={`mailto:${contactEmail}?subject=Opportunité casting — Castly`}
                style={{ color: "var(--green)", fontWeight: 700, fontSize: "1.05rem", textDecoration: "none", letterSpacing: "-0.01em" }}>
                {contactEmail}
              </a>
              <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>Cliquez pour ouvrir votre messagerie.</p>
            </div>
          )}

          {/* PROFIL PHYSIQUE */}
          {(artist.height_cm || artist.eye_color || artist.hair_color) && (
            <div className="card animate-fade-up-2">
              <p style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-faint)", marginBottom: "1rem" }}>Profil physique</p>
              <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
                {artist.height_cm && <div><div style={{ fontSize: "1.1rem", fontWeight: 800 }}>{artist.height_cm} cm</div><div style={{ fontSize: "0.72rem", color: "var(--text-faint)", marginTop: "0.1rem" }}>Taille</div></div>}
                {artist.eye_color && <div><div style={{ fontSize: "1.1rem", fontWeight: 800 }}>{artist.eye_color}</div><div style={{ fontSize: "0.72rem", color: "var(--text-faint)", marginTop: "0.1rem" }}>Yeux</div></div>}
                {artist.hair_color && <div><div style={{ fontSize: "1.1rem", fontWeight: 800 }}>{artist.hair_color}</div><div style={{ fontSize: "0.72rem", color: "var(--text-faint)", marginTop: "0.1rem" }}>Cheveux</div></div>}
              </div>
            </div>
          )}

          {/* STYLE + COMPÉTENCES */}
          {((artist.style_tags?.length ?? 0) > 0 || (artist.skills?.length ?? 0) > 0) && (
            <div className="card animate-fade-up-2" style={{ display: "grid", gap: "1.25rem" }}>
              {(artist.style_tags?.length ?? 0) > 0 && (
                <div>
                  <p style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-faint)", marginBottom: "0.65rem" }}>Style</p>
                  <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                    {artist.style_tags?.map(t => <span key={t} className="pill-muted pill" style={{ fontSize: "0.78rem" }}>{t}</span>)}
                  </div>
                </div>
              )}
              {(artist.skills?.length ?? 0) > 0 && (
                <div>
                  <p style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-faint)", marginBottom: "0.65rem" }}>Compétences</p>
                  <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                    {artist.skills?.map(s => <span key={s} className="chip-green">{s}</span>)}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* BIO */}
          {artist.bio && (
            <div className="card animate-fade-up-3">
              <p style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-faint)", marginBottom: "0.75rem" }}>Bio</p>
              <p style={{ color: "var(--text-muted)", lineHeight: 1.75, whiteSpace: "pre-wrap", fontSize: "0.92rem" }}>{artist.bio}</p>
            </div>
          )}

          {/* LIENS */}
          {Object.keys(links).length > 0 && (
            <div className="card animate-fade-up-3">
              <p style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-faint)", marginBottom: "0.75rem" }}>Liens</p>
              <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
                {links.instagram && <a href={links.instagram.startsWith("http") ? links.instagram : `https://${links.instagram}`} target="_blank" rel="noreferrer" className="pill-muted pill" style={{ textDecoration: "none", fontSize: "0.82rem" }}>📸 Instagram</a>}
                {links.tiktok && <a href={links.tiktok.startsWith("http") ? links.tiktok : `https://${links.tiktok}`} target="_blank" rel="noreferrer" className="pill-muted pill" style={{ textDecoration: "none", fontSize: "0.82rem" }}>🎵 TikTok</a>}
                {links.spotify && <a href={links.spotify.startsWith("http") ? links.spotify : `https://${links.spotify}`} target="_blank" rel="noreferrer" className="pill-muted pill" style={{ textDecoration: "none", fontSize: "0.82rem" }}>🎧 Spotify</a>}
                {links.soundcloud && <a href={links.soundcloud.startsWith("http") ? links.soundcloud : `https://${links.soundcloud}`} target="_blank" rel="noreferrer" className="pill-muted pill" style={{ textDecoration: "none", fontSize: "0.82rem" }}>🔊 SoundCloud</a>}
                {links.youtube && <a href={links.youtube.startsWith("http") ? links.youtube : `https://${links.youtube}`} target="_blank" rel="noreferrer" className="pill-muted pill" style={{ textDecoration: "none", fontSize: "0.82rem" }}>▶️ YouTube</a>}
                {links.website && <a href={links.website.startsWith("http") ? links.website : `https://${links.website}`} target="_blank" rel="noreferrer" className="pill-muted pill" style={{ textDecoration: "none", fontSize: "0.82rem" }}>🌐 Site web</a>}
              </div>
            </div>
          )}

          {/* CTA BOTTOM */}
          {!isLoggedIn && (
            <div className="card animate-fade-up-4" style={{ background: "linear-gradient(135deg,rgba(232,184,109,0.07),rgba(56,199,147,0.04))", borderColor: "var(--gold-border)", textAlign: "center", padding: "2.5rem 2rem" }}>
              <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>🎬</div>
              <p style={{ fontWeight: 800, fontSize: "1.1rem", letterSpacing: "-0.02em", marginBottom: "0.5rem" }}>Cet artiste vous intéresse ?</p>
              <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", marginBottom: "1.5rem", maxWidth: 380, margin: "0 auto 1.5rem" }}>
                Créez un compte recruteur pour contacter {artist.display_name} et accéder à tous les profils.
              </p>
              <Link href="/auth/signup" className="btn-gold">Créer un compte recruteur →</Link>
            </div>
          )}
          {isLoggedIn && !contactRevealed && !noCredits && (
            <div className="card animate-fade-up-4" style={{ background: "linear-gradient(135deg,rgba(232,184,109,0.07),rgba(56,199,147,0.04))", borderColor: "var(--gold-border)", textAlign: "center", padding: "2rem" }}>
              <p style={{ fontWeight: 700, marginBottom: "0.4rem", letterSpacing: "-0.01em" }}>Prêt à contacter {artist.display_name} ?</p>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "1.25rem" }}>
                1 crédit débité. Contact accessible à vie.
                {credits !== null && <> — Solde : <strong style={{ color: "var(--gold)" }}>{credits} crédit{credits !== 1 ? "s" : ""}</strong></>}
              </p>
              <button className="btn-gold" onClick={revealContact} disabled={contactLoading} style={{ cursor: "pointer" }}>
                {contactLoading ? "Révélation…" : "📧 Révéler le contact (1 crédit)"}
              </button>
            </div>
          )}
          {noCredits && (
            <div className="card animate-fade-up-4" style={{ borderColor: "var(--red-border)", background: "var(--red-dim)", textAlign: "center", padding: "2rem" }}>
              <p style={{ fontWeight: 700, marginBottom: "0.4rem" }}>Plus de crédits</p>
              <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", marginBottom: "1.25rem" }}>Rechargez pour contacter {artist.display_name}.</p>
              <Link href="/credits" className="btn-gold">Acheter des crédits →</Link>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
