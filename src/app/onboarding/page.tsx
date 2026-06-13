"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ARTIST_TYPE_LABELS, GENDER_LABELS, STYLE_TAG_SUGGESTIONS } from "@/types";
import type { ArtistType, Gender } from "@/types";

const STEPS = ["Type & nom", "Profil physique", "Style & compétences", "Liens & bio"];

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
    if (!supabase) return;
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

  return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <div style={{ width: "100%", maxWidth: 580 }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <span className="nav-logo">Castly</span>
          <p style={{ color: "var(--text-muted)", marginTop: "0.5rem", fontSize: "0.9rem" }}>
            Profil artiste — étape {step + 1}/{STEPS.length}
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "2rem", alignItems: "center" }}>
          {STEPS.map((s, i) => (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: "0.5rem", flex: i < STEPS.length - 1 ? 1 : "auto" }}>
              <div className={`step-dot ${i < step ? "done" : i === step ? "active" : "pending"}`}>{i < step ? "✓" : i + 1}</div>
              {i < STEPS.length - 1 && <div style={{ flex: 1, height: 1, background: i < step ? "var(--green)" : "var(--border)" }} />}
            </div>
          ))}
        </div>

        <div className="card">
          {step === 0 && (
            <div style={{ display: "grid", gap: "1.5rem" }}>
              <h2 style={{ fontWeight: 800, fontSize: "1.3rem" }}>Ton nom et type artistique</h2>
              <div>
                <label className="label">Nom de scène / Pseudo</label>
                <input className="input" value={form.display_name} onChange={e => setForm(f => ({ ...f, display_name: e.target.value }))} placeholder="Ex: Kenams, DJ Shadow, Marie L." />
              </div>
              <div>
                <label className="label">Mes types artistiques (choix multiples)</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem", marginTop: "0.5rem" }}>
                  {(Object.entries(ARTIST_TYPE_LABELS) as [ArtistType, string][]).map(([k, v]) => (
                    <label key={k} style={{ display: "flex", alignItems: "center" }}>
                      <input type="checkbox" className="type-checkbox" checked={form.artist_type.includes(k)} onChange={() => toggleType(k)} />
                      <span className="type-label">{v}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div style={{ display: "grid", gap: "1rem" }}>
              <h2 style={{ fontWeight: 800, fontSize: "1.3rem" }}>Profil physique</h2>
              <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>Utilisé pour le matching sur les castings avec critères physiques. Optionnel pour les musiciens/rappeurs.</p>
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
                  <input className="input" type="number" min="1950" max="2010" value={form.birth_year} onChange={e => setForm(f => ({ ...f, birth_year: e.target.value }))} placeholder="Ex: 1995" />
                </div>
                <div>
                  <label className="label">Taille (cm)</label>
                  <input className="input" type="number" min="140" max="220" value={form.height_cm} onChange={e => setForm(f => ({ ...f, height_cm: e.target.value }))} placeholder="Ex: 175" />
                </div>
                <div>
                  <label className="label">Ville</label>
                  <input className="input" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} placeholder="Ex: Paris, Lyon…" />
                </div>
                <div>
                  <label className="label">Yeux</label>
                  <input className="input" value={form.eye_color} onChange={e => setForm(f => ({ ...f, eye_color: e.target.value }))} placeholder="marron, bleu…" />
                </div>
                <div>
                  <label className="label">Cheveux</label>
                  <input className="input" value={form.hair_color} onChange={e => setForm(f => ({ ...f, hair_color: e.target.value }))} placeholder="noir, châtain…" />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div style={{ display: "grid", gap: "1.25rem" }}>
              <h2 style={{ fontWeight: 800, fontSize: "1.3rem" }}>Style, compétences & expérience</h2>

              {suggestedTags.length > 0 && (
                <div>
                  <label className="label">Mon style (choix multiples)</label>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.82rem", marginBottom: "0.6rem" }}>Aide les recruteurs à te trouver selon le vibe de leur projet</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                    {suggestedTags.map(tag => (
                      <label key={tag} style={{ display: "flex", alignItems: "center" }}>
                        <input type="checkbox" className="type-checkbox" checked={form.style_tags.includes(tag)} onChange={() => toggleStyleTag(tag)} />
                        <span className="type-label" style={{ fontSize: "0.82rem" }}>{tag}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="label">Compétences spécifiques (séparées par des virgules)</label>
                <input className="input" value={form.skills} onChange={e => setForm(f => ({ ...f, skills: e.target.value }))}
                  placeholder={form.artist_type.includes("rapper") || form.artist_type.includes("singer") ? "Ex: écriture, prod, beatmaking, live, feat…" : "Ex: danse hip-hop, improvisation, chant…"} />
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
                  <label className="label">Tarif jour (€, optionnel)</label>
                  <input className="input" type="number" value={form.day_rate_eur} onChange={e => setForm(f => ({ ...f, day_rate_eur: e.target.value }))} placeholder="Ex: 500" />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div style={{ display: "grid", gap: "1.25rem" }}>
              <h2 style={{ fontWeight: 800, fontSize: "1.3rem" }}>Liens & bio</h2>
              <div>
                <label className="label">Bio (fortement recommandée)</label>
                <textarea className="input" style={{ minHeight: 110, resize: "vertical" }} value={form.bio}
                  onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                  placeholder={form.artist_type.includes("rapper") ? "Ex: Rappeur trap/drill basé à Paris, 4 ans de scène, 50K sur Insta, feat avec XYZ…" : "Ex: Actrice formée au cours Florent, 3 ans d'expérience court-métrage et pub…"} />
              </div>
              <div>
                <label className="label">Réseaux & liens (optionnel)</label>
                <div style={{ display: "grid", gap: "0.6rem" }}>
                  {[
                    { key: "instagram", icon: "📸", ph: "instagram.com/ton-profil" },
                    { key: "tiktok", icon: "🎵", ph: "tiktok.com/@ton-profil" },
                    ...(form.artist_type.some(t => ["rapper","singer","musician"].includes(t)) ? [
                      { key: "spotify", icon: "🎧", ph: "open.spotify.com/artist/..." },
                      { key: "soundcloud", icon: "🔊", ph: "soundcloud.com/ton-profil" },
                    ] : []),
                    { key: "youtube", icon: "▶️", ph: "youtube.com/@ton-chaine" },
                    { key: "website", icon: "🌐", ph: "ton-site.com" },
                  ].map(({ key, icon, ph }) => (
                    <div key={key} style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                      <span style={{ width: 24, textAlign: "center", fontSize: "1rem" }}>{icon}</span>
                      <input className="input" value={(form as never)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} placeholder={ph} style={{ flex: 1 }} />
                    </div>
                  ))}
                </div>
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: "0.75rem", cursor: "pointer", padding: "0.75rem", borderRadius: 12, border: "1px solid var(--border)" }}>
                <input type="checkbox" checked={form.is_visible} onChange={e => setForm(f => ({ ...f, is_visible: e.target.checked }))} />
                <div>
                  <p style={{ fontWeight: 600, fontSize: "0.9rem" }}>Profil visible par les recruteurs</p>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>Les agences et productions peuvent te trouver et te contacter</p>
                </div>
              </label>
            </div>
          )}

          {error && <p style={{ color: "var(--red)", fontSize: "0.85rem", marginTop: "1rem" }}>{error}</p>}

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "2rem", gap: "1rem" }}>
            {step > 0 ? <button className="btn-outline" onClick={() => setStep(s => s - 1)}>← Retour</button> : <span />}
            {step < STEPS.length - 1
              ? <button className="btn-gold" onClick={() => {
                  if (step === 0) {
                    if (!form.display_name.trim()) { setError("Entre ton nom de scène."); return; }
                    if (form.artist_type.length === 0) { setError("Choisis au moins un type artistique."); return; }
                  }
                  setError("");
                  setStep(s => s + 1);
                }}>Suivant →</button>
              : <button className="btn-gold" onClick={handleFinish} disabled={saving}>
                  {saving ? "⚡ Analyse IA…" : "Voir mes castings →"}
                </button>}
          </div>
        </div>
      </div>
    </main>
  );
}
