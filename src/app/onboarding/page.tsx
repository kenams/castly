"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ARTIST_TYPE_LABELS, GENDER_LABELS } from "@/types";
import type { ArtistType, Gender } from "@/types";

const STEPS = ["Type artistique", "Profil physique", "Compétences", "Bio"];

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

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
    languages: "fr",
    experience_years: "0",
    bio: "",
  });

  function toggleType(t: ArtistType) {
    setForm(f => ({
      ...f,
      artist_type: f.artist_type.includes(t)
        ? f.artist_type.filter(x => x !== t)
        : [...f.artist_type, t],
    }));
  }

  async function handleFinish() {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/auth/login"); return; }
    await supabase.from("castly_profiles").upsert({
      user_id: user.id,
      display_name: form.display_name || user.email?.split("@")[0] || "Artiste",
      artist_type: form.artist_type.length ? form.artist_type : ["actor"],
      gender: form.gender || null,
      birth_year: form.birth_year ? parseInt(form.birth_year) : null,
      city: form.city || null,
      height_cm: form.height_cm ? parseInt(form.height_cm) : null,
      eye_color: form.eye_color || null,
      hair_color: form.hair_color || null,
      skills: form.skills ? form.skills.split(",").map(s => s.trim()).filter(Boolean) : [],
      languages: form.languages ? form.languages.split(",").map(s => s.trim()).filter(Boolean) : ["fr"],
      experience_years: parseInt(form.experience_years) || 0,
      bio: form.bio || null,
      is_complete: true,
    });
    await fetch("/api/match", { method: "POST" });
    router.push("/dashboard");
  }

  return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <div style={{ width: "100%", maxWidth: 560 }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <span className="nav-logo">Castly</span>
          <p style={{ color: "var(--text-muted)", marginTop: "0.5rem", fontSize: "0.9rem" }}>
            Crée ton profil artiste — {step + 1}/{STEPS.length}
          </p>
        </div>

        {/* Steps indicator */}
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "2rem", alignItems: "center" }}>
          {STEPS.map((s, i) => (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: "0.5rem", flex: i < STEPS.length - 1 ? 1 : "auto" }}>
              <div className={`step-dot ${i < step ? "done" : i === step ? "active" : "pending"}`}>
                {i < step ? "✓" : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div style={{ flex: 1, height: 1, background: i < step ? "var(--green)" : "var(--border)" }} />
              )}
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
              <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>Ces infos permettent de matcher les castings avec critères physiques.</p>
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
                  <label className="label">Couleur des yeux</label>
                  <input className="input" value={form.eye_color} onChange={e => setForm(f => ({ ...f, eye_color: e.target.value }))} placeholder="Ex: marron, bleu…" />
                </div>
                <div>
                  <label className="label">Couleur des cheveux</label>
                  <input className="input" value={form.hair_color} onChange={e => setForm(f => ({ ...f, hair_color: e.target.value }))} placeholder="Ex: noir, châtain…" />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div style={{ display: "grid", gap: "1.25rem" }}>
              <h2 style={{ fontWeight: 800, fontSize: "1.3rem" }}>Compétences et expérience</h2>
              <div>
                <label className="label">Compétences (séparées par des virgules)</label>
                <input className="input" value={form.skills} onChange={e => setForm(f => ({ ...f, skills: e.target.value }))} placeholder="Ex: chant, danse hip-hop, improvisation…" />
              </div>
              <div>
                <label className="label">Langues parlées</label>
                <input className="input" value={form.languages} onChange={e => setForm(f => ({ ...f, languages: e.target.value }))} placeholder="fr, en, es…" />
              </div>
              <div>
                <label className="label">Années d&apos;expérience</label>
                <select className="input" value={form.experience_years} onChange={e => setForm(f => ({ ...f, experience_years: e.target.value }))}>
                  {["0","1","2","3","5","8","10"].map(v => (
                    <option key={v} value={v}>{v === "0" ? "Débutant" : v === "10" ? "10 ans et plus" : `${v} ans`}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {step === 3 && (
            <div style={{ display: "grid", gap: "1.25rem" }}>
              <h2 style={{ fontWeight: 800, fontSize: "1.3rem" }}>Ta bio artiste</h2>
              <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>
                L&apos;IA utilise cette bio pour affiner ton matching. Plus c&apos;est précis, mieux c&apos;est.
              </p>
              <div>
                <label className="label">Bio (optionnel mais recommandé)</label>
                <textarea
                  className="input"
                  style={{ minHeight: 130, resize: "vertical" }}
                  value={form.bio}
                  onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                  placeholder="Ex: Chanteur R&B / Soul basé à Paris, 5 ans d'expérience scène, formé au CRR…"
                />
              </div>
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "2rem", gap: "1rem" }}>
            {step > 0
              ? <button className="btn-outline" onClick={() => setStep(s => s - 1)}>← Retour</button>
              : <span />}
            {step < STEPS.length - 1
              ? <button className="btn-gold" onClick={() => setStep(s => s + 1)}>Suivant →</button>
              : <button className="btn-gold" onClick={handleFinish} disabled={saving}>
                  {saving ? "Analyse en cours…" : "Voir mes castings →"}
                </button>}
          </div>
        </div>
      </div>
    </main>
  );
}
