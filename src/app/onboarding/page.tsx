"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ARTIST_TYPE_LABELS, ARTIST_TYPE_ICONS, GENDER_LABELS, STYLE_TAG_SUGGESTIONS } from "@/types";
import type { ArtistType, Gender } from "@/types";

const STEPS = [
  { label: "Type & nom", icon: "🎭" },
  { label: "Profil physique", icon: "👤" },
  { label: "Style & skills", icon: "🎨" },
  { label: "Liens & bio", icon: "🔗" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    display_name: "",
    artist_type: [] as ArtistType[],
    gender: "" as Gender | "",
    birth_year: "",
    city: "",
    height_cm: "",
    eye_color: "",
    hair_color: "",
    skills: "",
    style_tags: [] as string[],
    languages: "fr",
    experience_years: "0",
    bio: "",
    instagram: "",
    tiktok: "",
    spotify: "",
    soundcloud: "",
    youtube: "",
    website: "",
    day_rate_eur: "",
    is_visible: true,
  });

  function toggleType(t: ArtistType) {
    setForm(f => ({
      ...f,
      artist_type: f.artist_type.includes(t) ? f.artist_type.filter(x => x !== t) : [...f.artist_type, t],
      style_tags: [],
    }));
  }

  function toggleStyleTag(tag: string) {
    setForm(f => ({
      ...f,
      style_tags: f.style_tags.includes(tag) ? f.style_tags.filter(x => x !== tag) : [...f.style_tags, tag],
    }));
  }

  const suggestedTags = form.artist_type
    .flatMap(t => STYLE_TAG_SUGGESTIONS[t] ?? [])
    .filter((v, i, a) => a.indexOf(v) === i);

  async function handleFinish() {
    setSaving(true); setError("");
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/auth/login"); return; }

    const socialLinks: Record<string, string> = {};
    if (form.instagram) socialLinks.instagram = form.instagram;
    if (form.tiktok) socialLinks.tiktok = form.tiktok;
    if (form.spotify) socialLinks.spotify = form.spotify;
    if (form.soundcloud) socialLinks.soundcloud = form.soundcloud;
    if (form.youtube) socialLinks.youtube = form.youtube;
    if (form.website) socialLinks.website = form.website;

    const { error: upsertErr } = await supabase.from("castly_profiles").upsert({
      user_id: user.id,
      role: "artist",
      display_name: form.display_name || user.email?.split("@")[0] || "Artiste",
      artist_type: form.artist_type.length ? form.artist_type : ["actor"],
      gender: form.gender || null,
      birth_year: form.birth_year ? parseInt(form.birth_year) : null,
      city: form.city || null,
      height_cm: form.height_cm ? parseInt(form.height_cm) : null,
      eye_color: form.eye_color || null,
      hair_color: form.hair_color || null,
      skills: form.skills ? form.skills.split(",").map(s => s.trim()).filter(Boolean) : [],
      style_tags: form.style_tags,
      languages: form.languages ? form.languages.split(",").map(s => s.trim()).filter(Boolean) : ["fr"],
      experience_years: parseInt(form.experience_years) || 0,
      bio: form.bio || null,
      social_links: socialLinks,
      day_rate_eur: form.day_rate_eur ? parseInt(form.day_rate_eur) : null,
      is_visible: form.is_visible,
      is_complete: true,
      contact_email: user.email,
    }, { onConflict: "user_id" });
    if (upsertErr) { setError("Erreur lors de la sauvegarde. Réessaie."); setSaving(false); return; }
    await fetch("/api/match", { method: "POST" });
    router.push("/dashboard");
  }

  function next() {
    if (step === 0) {
      if (!form.display_name.trim()) { setError("Entre ton nom de scène."); return; }
      if (form.artist_type.length === 0) { setError("Choisis au moins un type artistique."); return; }
    }
    setError("");
    setStep(s => s + 1);
  }

  const progress = ((step) / STEPS.length) * 100;

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column" }}>
      {/* TOP PROGRESS BAR */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 3, background: "var(--border)", zIndex: 100 }}>
        <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg,var(--gold),var(--green))", transition: "width 0.5s cubic-bezier(0.22,1,0.36,1)" }} />
      </div>

      <nav className="nav" style={{ borderBottom: "1px solid var(--border)" }}>
        <span className="nav-logo">Castly</span>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          {STEPS.map((s, i) => (
            <div key={s.label} style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
              <div style={{
                width: 26, height: 26, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.7rem", fontWeight: 800, transition: "all 0.3s",
                background: i < step ? "var(--green)" : i === step ? "var(--gold)" : "var(--bg-2)",
                border: `2px solid ${i < step ? "var(--green)" : i === step ? "var(--gold)" : "var(--border)"}`,
                color: i <= step ? "#0a0a12" : "var(--text-faint)",
              }}>
                {i < step ? "✓" : i + 1}
              </div>
              {i < STEPS.length - 1 && <div style={{ width: 24, height: 1, background: i < step ? "var(--green)" : "var(--border)", transition: "background 0.3s" }} />}
            </div>
          ))}
        </div>
      </nav>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "3rem 1.5rem" }}>
        <div style={{ width: "100%", maxWidth: 560 }}>

          {/* STEP HEADER */}
          <div className="animate-fade-up" style={{ textAlign: "center", marginBottom: "2rem" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>{STEPS[step].icon}</div>
            <h1 style={{ fontSize: "1.6rem", fontWeight: 900, letterSpacing: "-0.04em", marginBottom: "0.35rem" }}>
              {step === 0 && "Ton identité artistique"}
              {step === 1 && "Ton profil physique"}
              {step === 2 && "Ton style & tes compétences"}
              {step === 3 && "Tes liens & ta biographie"}
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>Étape {step + 1} sur {STEPS.length}</p>
          </div>

          <div className="card animate-fade-up-2" style={{ padding: "2rem" }}>
            {step === 0 && (
              <div style={{ display: "grid", gap: "1.5rem" }}>
                <div>
                  <label className="label">Nom de scène / Pseudo *</label>
                  <input className="input" value={form.display_name} onChange={e => setForm(f => ({ ...f, display_name: e.target.value }))}
                    placeholder="Ex: Kenams, DJ Shadow, Marie L." autoFocus />
                </div>
                <div>
                  <label className="label">Mes types artistiques <span style={{ color: "var(--text-faint)", textTransform: "none" }}>(choix multiples)</span></label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.55rem", marginTop: "0.6rem" }}>
                    {(Object.entries(ARTIST_TYPE_LABELS) as [ArtistType, string][]).map(([k, v]) => (
                      <label key={k} style={{ cursor: "pointer" }}>
                        <input type="checkbox" className="type-checkbox" checked={form.artist_type.includes(k)} onChange={() => toggleType(k)} />
                        <span className="type-label" style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                          {ARTIST_TYPE_ICONS[k]} {v}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 1 && (
              <div style={{ display: "grid", gap: "1rem" }}>
                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", padding: "0.75rem", borderRadius: 10, background: "var(--bg-2)", border: "1px solid var(--border)" }}>
                  💡 Utilisé pour matcher sur les castings avec critères physiques. Tout est optionnel pour les musiciens.
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div>
                    <label className="label">Genre</label>
                    <select className="input" value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value as Gender }))}>
                      <option value="">Non précisé</option>
                      {(Object.entries(GENDER_LABELS) as [Gender, string][]).map(([k, v]) => (
                        <option key={k} value={k}>{v}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Année de naissance</label>
                    <input className="input" type="number" min="1950" max="2010" value={form.birth_year}
                      onChange={e => setForm(f => ({ ...f, birth_year: e.target.value }))} placeholder="Ex: 1995" />
                  </div>
                  <div>
                    <label className="label">Taille (cm)</label>
                    <input className="input" type="number" min="140" max="220" value={form.height_cm}
                      onChange={e => setForm(f => ({ ...f, height_cm: e.target.value }))} placeholder="Ex: 175" />
                  </div>
                  <div>
                    <label className="label">Ville</label>
                    <input className="input" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} placeholder="Paris, Lyon…" />
                  </div>
                  <div>
                    <label className="label">Couleur des yeux</label>
                    <input className="input" value={form.eye_color} onChange={e => setForm(f => ({ ...f, eye_color: e.target.value }))} placeholder="marron, bleu…" />
                  </div>
                  <div>
                    <label className="label">Couleur des cheveux</label>
                    <input className="input" value={form.hair_color} onChange={e => setForm(f => ({ ...f, hair_color: e.target.value }))} placeholder="noir, châtain…" />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div style={{ display: "grid", gap: "1.25rem" }}>
                {suggestedTags.length > 0 && (
                  <div>
                    <label className="label">Mon style <span style={{ color: "var(--text-faint)", textTransform: "none" }}>(choix multiples)</span></label>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginBottom: "0.6rem" }}>Aide les recruteurs à te trouver selon le vibe de leur projet</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.45rem" }}>
                      {suggestedTags.map(tag => (
                        <label key={tag} style={{ cursor: "pointer" }}>
                          <input type="checkbox" className="type-checkbox" checked={form.style_tags.includes(tag)} onChange={() => toggleStyleTag(tag)} />
                          <span className="type-label" style={{ fontSize: "0.8rem" }}>{tag}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <label className="label">Compétences <span style={{ color: "var(--text-faint)", textTransform: "none" }}>(séparées par des virgules)</span></label>
                  <input className="input" value={form.skills} onChange={e => setForm(f => ({ ...f, skills: e.target.value }))}
                    placeholder={form.artist_type.includes("rapper") || form.artist_type.includes("singer") ? "écriture, prod, beatmaking, live, feat…" : "danse hip-hop, improvisation, chant…"} />
                </div>
                <div>
                  <label className="label">Langues parlées</label>
                  <input className="input" value={form.languages} onChange={e => setForm(f => ({ ...f, languages: e.target.value }))} placeholder="fr, en, es…" />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div>
                    <label className="label">Expérience</label>
                    <select className="input" value={form.experience_years} onChange={e => setForm(f => ({ ...f, experience_years: e.target.value }))}>
                      {["0","1","2","3","5","8","10"].map(v => (
                        <option key={v} value={v}>{v === "0" ? "Débutant" : v === "10" ? "10 ans+" : `${v} an${parseInt(v) > 1 ? "s" : ""}`}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Tarif jour (€) <span style={{ color: "var(--text-faint)", textTransform: "none" }}>optionnel</span></label>
                    <input className="input" type="number" value={form.day_rate_eur} onChange={e => setForm(f => ({ ...f, day_rate_eur: e.target.value }))} placeholder="Ex: 500" />
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div style={{ display: "grid", gap: "1.25rem" }}>
                <div>
                  <label className="label">Biographie <span style={{ color: "var(--gold)", textTransform: "none" }}>fortement recommandée</span></label>
                  <textarea className="input" style={{ minHeight: 120, resize: "vertical" }} value={form.bio}
                    onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                    placeholder={form.artist_type.includes("rapper") ? "Rappeur trap/drill basé à Paris, 4 ans de scène, 50K Insta, feat avec XYZ…" : "Actrice formée au cours Florent, 3 ans court-métrage et pub…"} />
                </div>
                <div>
                  <label className="label">Réseaux & liens <span style={{ color: "var(--text-faint)", textTransform: "none" }}>optionnel</span></label>
                  <div style={{ display: "grid", gap: "0.55rem" }}>
                    {[
                      { key: "instagram", icon: "📸", ph: "instagram.com/ton-profil" },
                      { key: "tiktok", icon: "🎵", ph: "tiktok.com/@ton-profil" },
                      ...(form.artist_type.some(t => ["rapper","singer","musician"].includes(t)) ? [
                        { key: "spotify", icon: "🎧", ph: "open.spotify.com/artist/..." },
                        { key: "soundcloud", icon: "🔊", ph: "soundcloud.com/ton-profil" },
                      ] : []),
                      { key: "youtube", icon: "▶️", ph: "youtube.com/@ta-chaine" },
                      { key: "website", icon: "🌐", ph: "ton-site.com" },
                    ].map(({ key, icon, ph }) => (
                      <div key={key} style={{ display: "flex", gap: "0.6rem", alignItems: "center" }}>
                        <span style={{ width: 28, textAlign: "center", fontSize: "1rem", flexShrink: 0 }}>{icon}</span>
                        <input className="input" value={(form as never)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} placeholder={ph} style={{ flex: 1 }} />
                      </div>
                    ))}
                  </div>
                </div>
                <label style={{ display: "flex", alignItems: "center", gap: "0.85rem", cursor: "pointer", padding: "0.85rem 1rem", borderRadius: 12, border: `1px solid ${form.is_visible ? "var(--green-border)" : "var(--border)"}`, background: form.is_visible ? "rgba(56,199,147,0.04)" : "transparent", transition: "all 0.2s" }}>
                  <input type="checkbox" checked={form.is_visible} onChange={e => setForm(f => ({ ...f, is_visible: e.target.checked }))} style={{ width: 16, height: 16, accentColor: "var(--green)" }} />
                  <div>
                    <p style={{ fontWeight: 700, fontSize: "0.88rem" }}>Profil visible par les recruteurs</p>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>Les agences et productions peuvent te trouver et te contacter</p>
                  </div>
                  {form.is_visible && <span className="chip-green" style={{ marginLeft: "auto", flexShrink: 0 }}>Actif</span>}
                </label>
              </div>
            )}

            {error && (
              <div style={{ marginTop: "1rem", padding: "0.75rem 1rem", borderRadius: 10, background: "var(--red-dim)", border: "1px solid var(--red-border)", fontSize: "0.83rem", color: "var(--red)" }}>
                {error}
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1.75rem", gap: "0.75rem" }}>
              {step > 0
                ? <button className="btn-outline" onClick={() => { setError(""); setStep(s => s - 1); }}>← Retour</button>
                : <span />
              }
              {step < STEPS.length - 1
                ? <button className="btn-gold" onClick={next}>Suivant →</button>
                : <button className="btn-gold" onClick={handleFinish} disabled={saving} style={{ minWidth: 160 }}>
                    {saving ? (
                      <span style={{ display: "flex", alignItems: "center", gap: "0.5rem", justifyContent: "center" }}>
                        <span style={{ width: 12, height: 12, border: "2px solid rgba(0,0,0,0.2)", borderTop: "2px solid #000", borderRadius: "50%", animation: "spin-slow 0.7s linear infinite", display: "inline-block" }} />
                        Analyse IA…
                      </span>
                    ) : "⚡ Voir mes castings →"}
                  </button>
              }
            </div>
          </div>

          {/* SOCIAL PROOF FOOTER */}
          <p style={{ textAlign: "center", fontSize: "0.75rem", color: "var(--text-faint)", marginTop: "1.5rem" }}>
            Profil visible uniquement par les recruteurs vérifiés · Gratuit · Sans engagement
          </p>
        </div>
      </div>
    </main>
  );
}
