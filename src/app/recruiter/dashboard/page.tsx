"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { PROJECT_TYPE_LABELS, PROJECT_TYPE_ICONS, ARTIST_TYPE_LABELS, STYLE_TAG_SUGGESTIONS } from "@/types";
import type { CastlyRecruiter, CastlyBrief, CastlyBriefMatch, CastlyProfile, ArtistType, ProjectType } from "@/types";

function ScoreBadge({ score }: { score: number }) {
  const cls = score >= 70 ? "score-high" : score >= 45 ? "score-mid" : "score-low";
  return <div className={`score-badge ${cls}`}>{score}</div>;
}

const BRIEF_STEPS = ["Projet", "Profil cherché", "Détails"];

export default function RecruiterDashboard() {
  const [recruiter, setRecruiter] = useState<CastlyRecruiter | null>(null);
  const [briefs, setBriefs] = useState<CastlyBrief[]>([]);
  const [activeBrief, setActiveBrief] = useState<CastlyBrief | null>(null);
  const [briefMatches, setBriefMatches] = useState<CastlyBriefMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewBrief, setShowNewBrief] = useState(false);
  const [briefStep, setBriefStep] = useState(0);
  const [matching, setMatching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [matchFilter, setMatchFilter] = useState<"all" | "shortlisted">("all");

  const [form, setForm] = useState({
    title: "",
    project_type: "" as ProjectType | "",
    artist_types: [] as ArtistType[],
    style_tags: [] as string[],
    required_skills: "",
    required_gender: "" as "male" | "female" | "any" | "",
    age_min: "",
    age_max: "",
    location: "",
    is_remote: false,
    budget_range: "",
    deadline_at: "",
    description: "",
  });

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;
    async function load() {
      const { data: { user } } = await supabase!.auth.getUser();
      if (!user) { window.location.href = "/auth/login"; return; }

      const { data: rec } = await supabase!.from("castly_recruiters").select("*").eq("user_id", user.id).single();
      if (!rec) { window.location.href = "/recruiter/onboarding"; return; }
      setRecruiter(rec);

      const { data: b } = await supabase!.from("castly_briefs").select("*").eq("recruiter_id", rec.id).order("created_at", { ascending: false });
      setBriefs(b ?? []);
      setLoading(false);
    }
    load();
  }, []);

  async function loadMatches(brief: CastlyBrief) {
    setActiveBrief(brief);
    setBriefMatches([]);
    const supabase = createClient();
    if (!supabase) return;
    const { data } = await supabase.from("castly_brief_matches")
      .select("*, profile:castly_profiles(id, display_name, artist_type, city, bio, style_tags, skills, experience_years, day_rate_eur, social_links, birth_year, gender, avatar_url)")
      .eq("brief_id", brief.id)
      .order("match_score", { ascending: false });
    setBriefMatches(data ?? []);
  }

  async function runMatch() {
    if (!activeBrief) return;
    setMatching(true);
    await fetch(`/api/briefs/${activeBrief.id}/match`, { method: "POST" });
    await loadMatches(activeBrief);
    setMatching(false);
  }

  async function updateMatchStatus(matchId: string, status: string) {
    const supabase = createClient();
    if (!supabase) return;
    await supabase.from("castly_brief_matches").update({ status }).eq("id", matchId);
    setBriefMatches(ms => ms.map(m => m.id === matchId ? { ...m, status: status as never } : m));
  }

  async function handleLogout() {
    const supabase = createClient();
    if (!supabase) return;
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  async function submitBrief() {
    setSaving(true);
    const res = await fetch("/api/briefs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        required_skills: form.required_skills ? form.required_skills.split(",").map(s => s.trim()).filter(Boolean) : [],
        required_gender: form.required_gender || null,
        age_min: form.age_min ? parseInt(form.age_min) : null,
        age_max: form.age_max ? parseInt(form.age_max) : null,
      }),
    });
    const data = await res.json();
    if (data.brief) {
      setBriefs(b => [data.brief, ...b]);
      setShowNewBrief(false);
      setBriefStep(0);
      setForm({ title: "", project_type: "", artist_types: [], style_tags: [], required_skills: "", required_gender: "", age_min: "", age_max: "", location: "", is_remote: false, budget_range: "", deadline_at: "", description: "" });
      setActiveBrief(data.brief);
      setBriefMatches([]);
    }
    setSaving(false);
  }

  function toggleArtistType(t: ArtistType) {
    setForm(f => ({ ...f, artist_types: f.artist_types.includes(t) ? f.artist_types.filter(x => x !== t) : [...f.artist_types, t], style_tags: [] }));
  }
  function toggleStyleTag(tag: string) {
    setForm(f => ({ ...f, style_tags: f.style_tags.includes(tag) ? f.style_tags.filter(x => x !== tag) : [...f.style_tags, tag] }));
  }

  const suggestedTags = form.artist_types.flatMap(t => STYLE_TAG_SUGGESTIONS[t] ?? []).filter((v, i, a) => a.indexOf(v) === i);
  const filteredMatches = briefMatches.filter(m => matchFilter === "all" || m.status === "shortlisted");

  if (loading) return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "var(--text-muted)" }}>Chargement…</p>
    </main>
  );

  return (
    <main style={{ minHeight: "100vh" }}>
      <nav className="nav">
        <Link href="/" className="nav-logo">Castly</Link>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <Link href="/artists" className="btn-outline" style={{ padding: "0.45rem 1rem", fontSize: "0.82rem" }}>🔍 Parcourir les artistes</Link>
          <button onClick={handleLogout} style={{ padding: "0.45rem 1rem", fontSize: "0.82rem", borderRadius: "999px", border: "1px solid var(--border)", background: "transparent", color: "var(--text-muted)", cursor: "pointer" }}>
            Déconnexion
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem", display: "grid", gridTemplateColumns: "300px 1fr", gap: "1.5rem", alignItems: "start" }}>
        {/* SIDEBAR BRIEFS */}
        <div style={{ display: "grid", gap: "0.75rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h2 style={{ fontWeight: 800, fontSize: "1rem" }}>{recruiter?.company_name}</h2>
              <p style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>{briefs.length} brief{briefs.length > 1 ? "s" : ""}</p>
            </div>
            <button onClick={() => setShowNewBrief(true)} className="btn-gold" style={{ padding: "0.5rem 1rem", fontSize: "0.82rem" }}>+ Brief</button>
          </div>

          {briefs.length === 0 && !showNewBrief && (
            <div className="card" style={{ textAlign: "center", padding: "1.5rem" }}>
              <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", marginBottom: "0.75rem" }}>Aucun brief. Commence par décrire ton projet.</p>
              <button onClick={() => setShowNewBrief(true)} className="btn-gold" style={{ fontSize: "0.82rem" }}>Créer mon 1er brief</button>
            </div>
          )}

          {briefs.map(b => (
            <button key={b.id} onClick={() => loadMatches(b)}
              style={{ textAlign: "left", padding: "0.9rem 1rem", borderRadius: 12, border: `1px solid ${activeBrief?.id === b.id ? "var(--gold-border)" : "var(--border)"}`, background: activeBrief?.id === b.id ? "var(--gold-dim)" : "var(--bg-card)", cursor: "pointer", width: "100%" }}>
              <p style={{ fontWeight: 600, fontSize: "0.88rem", marginBottom: "0.25rem" }}>{PROJECT_TYPE_ICONS[b.project_type]} {b.title}</p>
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                {b.artist_types.slice(0, 2).map(t => ARTIST_TYPE_LABELS[t]).join(", ")}
                {b.location ? ` · ${b.location}` : ""}
              </p>
            </button>
          ))}

          <div style={{ marginTop: "0.5rem" }}>
            <Link href="/artists" className="btn-outline" style={{ width: "100%", justifyContent: "center", fontSize: "0.82rem" }}>
              🔍 Recherche manuelle d&apos;artistes
            </Link>
          </div>
        </div>

        {/* MAIN AREA */}
        <div>
          {/* NOUVEAU BRIEF FORM */}
          {showNewBrief && (
            <div className="card" style={{ marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <h2 style={{ fontWeight: 800 }}>Nouveau brief</h2>
                <button onClick={() => { setShowNewBrief(false); setBriefStep(0); }} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "1.2rem" }}>✕</button>
              </div>

              {/* Steps */}
              <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", alignItems: "center" }}>
                {BRIEF_STEPS.map((s, i) => (
                  <div key={s} style={{ display: "flex", alignItems: "center", gap: "0.5rem", flex: i < BRIEF_STEPS.length - 1 ? 1 : "auto" }}>
                    <div className={`step-dot ${i < briefStep ? "done" : i === briefStep ? "active" : "pending"}`}>{i < briefStep ? "✓" : i + 1}</div>
                    {i < BRIEF_STEPS.length - 1 && <div style={{ flex: 1, height: 1, background: i < briefStep ? "var(--green)" : "var(--border)" }} />}
                  </div>
                ))}
              </div>

              {briefStep === 0 && (
                <div style={{ display: "grid", gap: "1rem" }}>
                  <h3 style={{ fontWeight: 700 }}>Décris ton projet</h3>
                  <div>
                    <label className="label">Titre du brief *</label>
                    <input className="input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Ex: Cherche rappeur trap pour clip YouTube…" />
                  </div>
                  <div>
                    <label className="label">Type de projet *</label>
                    <select className="input" value={form.project_type} onChange={e => setForm(f => ({ ...f, project_type: e.target.value as ProjectType }))}>
                      <option value="">Choisir…</option>
                      {(Object.entries(PROJECT_TYPE_LABELS) as [ProjectType, string][]).map(([k, v]) => (
                        <option key={k} value={k}>{PROJECT_TYPE_ICONS[k]} {v}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Description</label>
                    <textarea className="input" style={{ minHeight: 100, resize: "vertical" }} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                      placeholder="Décris ton projet, l'ambiance recherchée, le contexte, les attentes…" />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div>
                      <label className="label">Lieu</label>
                      <input className="input" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="Paris, Lyon, Remote…" />
                    </div>
                    <div>
                      <label className="label">Budget</label>
                      <input className="input" value={form.budget_range} onChange={e => setForm(f => ({ ...f, budget_range: e.target.value }))} placeholder="Ex: 500-1000€, TBD, Bénévole…" />
                    </div>
                  </div>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                    <input type="checkbox" checked={form.is_remote} onChange={e => setForm(f => ({ ...f, is_remote: e.target.checked }))} />
                    <span style={{ fontSize: "0.9rem" }}>Remote possible</span>
                  </label>
                </div>
              )}

              {briefStep === 1 && (
                <div style={{ display: "grid", gap: "1.25rem" }}>
                  <h3 style={{ fontWeight: 700 }}>Quel type d&apos;artiste cherches-tu ?</h3>
                  <div>
                    <label className="label">Types d&apos;artistes *</label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.4rem" }}>
                      {(Object.entries(ARTIST_TYPE_LABELS) as [ArtistType, string][]).map(([k, v]) => (
                        <label key={k} style={{ display: "flex", alignItems: "center" }}>
                          <input type="checkbox" className="type-checkbox" checked={form.artist_types.includes(k)} onChange={() => toggleArtistType(k)} />
                          <span className="type-label" style={{ fontSize: "0.82rem" }}>{v}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  {suggestedTags.length > 0 && (
                    <div>
                      <label className="label">Style recherché</label>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.4rem" }}>
                        {suggestedTags.map(tag => (
                          <label key={tag} style={{ display: "flex", alignItems: "center" }}>
                            <input type="checkbox" className="type-checkbox" checked={form.style_tags.includes(tag)} onChange={() => toggleStyleTag(tag)} />
                            <span className="type-label" style={{ fontSize: "0.78rem" }}>{tag}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="label">Compétences spécifiques (optionnel)</label>
                    <input className="input" value={form.required_skills} onChange={e => setForm(f => ({ ...f, required_skills: e.target.value }))} placeholder="Ex: beatmaking, live, improvisation…" />
                  </div>
                </div>
              )}

              {briefStep === 2 && (
                <div style={{ display: "grid", gap: "1rem" }}>
                  <h3 style={{ fontWeight: 700 }}>Critères physiques (optionnel)</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
                    <div>
                      <label className="label">Genre</label>
                      <select className="input" value={form.required_gender} onChange={e => setForm(f => ({ ...f, required_gender: e.target.value as never }))}>
                        <option value="">Peu importe</option>
                        <option value="male">Homme</option>
                        <option value="female">Femme</option>
                        <option value="any">Tous</option>
                      </select>
                    </div>
                    <div>
                      <label className="label">Âge min</label>
                      <input className="input" type="number" value={form.age_min} onChange={e => setForm(f => ({ ...f, age_min: e.target.value }))} placeholder="Ex: 18" />
                    </div>
                    <div>
                      <label className="label">Âge max</label>
                      <input className="input" type="number" value={form.age_max} onChange={e => setForm(f => ({ ...f, age_max: e.target.value }))} placeholder="Ex: 35" />
                    </div>
                  </div>
                  <div>
                    <label className="label">Date limite de candidature</label>
                    <input className="input" type="date" value={form.deadline_at} onChange={e => setForm(f => ({ ...f, deadline_at: e.target.value }))} />
                  </div>
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1.5rem" }}>
                {briefStep > 0 ? <button className="btn-outline" onClick={() => setBriefStep(s => s - 1)}>← Retour</button> : <span />}
                {briefStep < BRIEF_STEPS.length - 1
                  ? <button className="btn-gold" onClick={() => setBriefStep(s => s + 1)} disabled={!form.title || !form.project_type}>Suivant →</button>
                  : <button className="btn-gold" onClick={submitBrief} disabled={saving}>{saving ? "Création…" : "Créer le brief →"}</button>}
              </div>
            </div>
          )}

          {/* BRIEF ACTIF + MATCHES */}
          {activeBrief && !showNewBrief && (
            <div>
              <div className="card" style={{ marginBottom: "1.25rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
                  <div>
                    <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.4rem" }}>
                      <span className="pill-muted pill" style={{ fontSize: "0.75rem" }}>{PROJECT_TYPE_ICONS[activeBrief.project_type]} {PROJECT_TYPE_LABELS[activeBrief.project_type]}</span>
                      {activeBrief.is_remote && <span className="pill-muted pill" style={{ fontSize: "0.75rem" }}>🌐 Remote</span>}
                    </div>
                    <h2 style={{ fontWeight: 800, fontSize: "1.2rem" }}>{activeBrief.title}</h2>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "0.25rem" }}>
                      {activeBrief.artist_types.map(t => ARTIST_TYPE_LABELS[t]).join(", ")}
                      {activeBrief.style_tags?.length ? ` · ${activeBrief.style_tags.join(", ")}` : ""}
                      {activeBrief.location ? ` · 📍 ${activeBrief.location}` : ""}
                    </p>
                  </div>
                  <button onClick={runMatch} disabled={matching} className="btn-gold" style={{ fontSize: "0.85rem" }}>
                    {matching ? "⚡ Analyse IA…" : "⚡ Lancer le matching IA"}
                  </button>
                </div>
              </div>

              {/* FILTERS */}
              <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1rem", alignItems: "center" }}>
                <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{briefMatches.length} profil{briefMatches.length > 1 ? "s" : ""} matchés</span>
                <div style={{ marginLeft: "auto", display: "flex", gap: "0.5rem" }}>
                  {(["all", "shortlisted"] as const).map(f => (
                    <button key={f} onClick={() => setMatchFilter(f)}
                      style={{ padding: "0.35rem 0.85rem", borderRadius: "999px", border: "1px solid", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer",
                        borderColor: matchFilter === f ? "var(--gold-border)" : "var(--border)",
                        background: matchFilter === f ? "var(--gold-dim)" : "transparent",
                        color: matchFilter === f ? "var(--gold)" : "var(--text-muted)" }}>
                      {f === "all" ? `Tous (${briefMatches.length})` : `Sélectionnés (${briefMatches.filter(m => m.status === "shortlisted").length})`}
                    </button>
                  ))}
                </div>
              </div>

              {briefMatches.length === 0 && (
                <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
                  <p style={{ color: "var(--text-muted)", marginBottom: "1rem" }}>Lance l&apos;analyse IA pour trouver les artistes compatibles.</p>
                  <button onClick={runMatch} disabled={matching} className="btn-gold">⚡ Lancer le matching IA</button>
                </div>
              )}

              <div style={{ display: "grid", gap: "0.75rem" }}>
                {filteredMatches.map(match => {
                  const p = match.profile as unknown as Partial<CastlyProfile>;
                  if (!p) return null;
                  const age = p.birth_year ? new Date().getFullYear() - p.birth_year : null;
                  return (
                    <div key={match.id} className="casting-card" style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: "1rem", opacity: match.status === "dismissed" ? 0.4 : 1 }}>
                      <ScoreBadge score={match.match_score} />
                      <div style={{ display: "grid", gap: "0.4rem", minWidth: 0 }}>
                        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
                          <Link href={`/artists/${p.id}`} target="_blank" style={{ fontWeight: 700, fontSize: "0.95rem", textDecoration: "none", color: "inherit" }}>{p.display_name}</Link>
                          {p.artist_type?.slice(0, 2).map(t => <span key={t} className="pill" style={{ fontSize: "0.7rem", padding: "0.15rem 0.5rem" }}>{ARTIST_TYPE_LABELS[t]}</span>)}
                        </div>
                        <div style={{ display: "flex", gap: "1rem", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                          {p.city && <span>📍 {p.city}</span>}
                          {age && <span>👤 {age} ans</span>}
                          {p.experience_years != null && p.experience_years > 0 && <span>⭐ {p.experience_years} ans</span>}
                          {p.day_rate_eur && <span style={{ color: "var(--green)", fontWeight: 600 }}>💰 {p.day_rate_eur}€/j</span>}
                        </div>
                        {p.style_tags && p.style_tags.length > 0 && (
                          <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
                            {p.style_tags.slice(0, 4).map(t => <span key={t} className="pill-muted pill" style={{ fontSize: "0.7rem", padding: "0.15rem 0.5rem" }}>{t}</span>)}
                          </div>
                        )}
                        {match.match_reasons.length > 0 && (
                          <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
                            {match.match_reasons.map((r, i) => <span key={i} style={{ fontSize: "0.72rem", padding: "0.15rem 0.5rem", borderRadius: "999px", background: "rgba(56,199,147,0.08)", border: "1px solid rgba(56,199,147,0.2)", color: "var(--green)" }}>✓ {r}</span>)}
                          </div>
                        )}
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", alignItems: "flex-end", flexShrink: 0 }}>
                        <Link href={`/artists/${p.id}`} target="_blank" className="btn-outline" style={{ padding: "0.3rem 0.8rem", fontSize: "0.75rem" }}>Voir profil →</Link>
                        <button onClick={() => updateMatchStatus(match.id, match.status === "shortlisted" ? "new" : "shortlisted")}
                          style={{ padding: "0.3rem 0.8rem", fontSize: "0.75rem", borderRadius: "999px", border: "1px solid var(--border)", background: match.status === "shortlisted" ? "var(--gold-dim)" : "transparent", color: match.status === "shortlisted" ? "var(--gold)" : "var(--text-muted)", cursor: "pointer" }}>
                          {match.status === "shortlisted" ? "★ Sélectionné" : "☆ Sélectionner"}
                        </button>
                        <button onClick={() => updateMatchStatus(match.id, "dismissed")}
                          style={{ padding: "0.25rem 0.6rem", fontSize: "0.72rem", borderRadius: "999px", border: "none", background: "transparent", color: "rgba(255,255,255,0.2)", cursor: "pointer" }}>✕</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {!activeBrief && !showNewBrief && briefs.length > 0 && (
            <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
              <p style={{ color: "var(--text-muted)" }}>Sélectionne un brief pour voir les matches.</p>
            </div>
          )}

          {!activeBrief && !showNewBrief && briefs.length === 0 && (
            <div className="card" style={{ textAlign: "center", padding: "4rem" }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🎬</div>
              <h2 style={{ fontWeight: 800, marginBottom: "0.75rem" }}>Bienvenue, {recruiter?.company_name}</h2>
              <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem" }}>Crée ton premier brief et l&apos;IA trouve les artistes qui correspondent à ton projet.</p>
              <button onClick={() => setShowNewBrief(true)} className="btn-gold">Créer mon premier brief →</button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
