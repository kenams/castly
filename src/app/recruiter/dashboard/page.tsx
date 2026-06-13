"use client";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { PROJECT_TYPE_LABELS, PROJECT_TYPE_ICONS, ARTIST_TYPE_LABELS, STYLE_TAG_SUGGESTIONS } from "@/types";
import type { CastlyRecruiter, CastlyBrief, CastlyBriefMatch, CastlyProfile, ArtistType, ProjectType } from "@/types";

function ScoreBadge({ score }: { score: number }) {
  const cls = score >= 70 ? "score-high" : score >= 45 ? "score-mid" : "score-low";
  return <div className={`score-badge ${cls}`}>{score}</div>;
}

const BRIEF_STEPS = ["Projet", "Profil cherché", "Détails"];

function RecruiterDashboardInner() {
  const searchParams = useSearchParams();
  const [toast, setToast] = useState("");
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
  const [revealedContacts, setRevealedContacts] = useState<Record<string, string>>({});

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
    if (searchParams.get("credits") === "ok") {
      setToast("✓ Crédits ajoutés à votre compte !");
      setTimeout(() => setToast(""), 5000);
    }
  }, [searchParams]);

  useEffect(() => {
    const supabase = createClient();
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = "/auth/login"; return; }
      const { data: rec } = await supabase.from("castly_recruiters").select("*, credits").eq("user_id", user.id).single();
      if (!rec) { window.location.href = "/recruiter/onboarding"; return; }
      setRecruiter(rec);
      const { data: b } = await supabase.from("castly_briefs").select("*").eq("recruiter_id", rec.id).order("created_at", { ascending: false });
      setBriefs(b ?? []);
      setLoading(false);
    }
    load();
  }, []);

  async function loadMatches(brief: CastlyBrief) {
    setActiveBrief(brief);
    setBriefMatches([]);
    const supabase = createClient();
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

  async function revealContact(profileId: string) {
    if (revealedContacts[profileId]) return;
    const r = await fetch(`/api/artists/${profileId}/contact`);
    if (r.ok) {
      const d = await r.json();
      setRevealedContacts(prev => ({ ...prev, [profileId]: d.contact_email }));
      if (d.credits_remaining !== undefined) {
        setRecruiter(prev => prev ? { ...prev, credits: d.credits_remaining } as never : prev);
      }
    } else if (r.status === 402) {
      window.location.href = "/credits";
    }
  }

  async function updateMatchStatus(matchId: string, status: string) {
    const supabase = createClient();
    await supabase.from("castly_brief_matches").update({ status }).eq("id", matchId);
    setBriefMatches(ms => ms.map(m => m.id === matchId ? { ...m, status: status as never } : m));
  }

  async function handleLogout() {
    await createClient().auth.signOut();
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
  const recruiterCredits = (recruiter as (CastlyRecruiter & { credits?: number }) | null)?.credits ?? 0;

  if (loading) {
    return (
      <main style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 44, height: 44, border: "2px solid var(--gold-border)", borderTop: "2px solid var(--gold)", borderRadius: "50%", animation: "spin-slow 0.8s linear infinite", margin: "0 auto 1rem" }} />
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Chargement…</p>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)" }}>
      {toast && (
        <div style={{ position: "fixed", bottom: "1.5rem", left: "50%", transform: "translateX(-50%)", background: "var(--green)", color: "#0a0a12", fontWeight: 700, padding: "0.75rem 1.5rem", borderRadius: "999px", zIndex: 9999, fontSize: "0.9rem", boxShadow: "0 8px 24px rgba(56,199,147,0.4)", animation: "fadeUp 0.3s ease" }}>
          {toast}
        </div>
      )}

      <nav className="nav">
        <Link href="/" className="nav-logo">Castly</Link>
        <div style={{ display: "flex", gap: "0.55rem", alignItems: "center" }}>
          <Link href="/artists" className="btn-outline" style={{ padding: "0.42rem 0.9rem", fontSize: "0.8rem" }}>🔍 Artistes</Link>
          <Link href="/credits" style={{
            fontSize: "0.8rem",
            color: recruiterCredits === 0 ? "var(--red)" : "var(--gold)",
            textDecoration: "none", border: "1px solid",
            borderColor: recruiterCredits === 0 ? "var(--red-border)" : "var(--gold-border)",
            background: recruiterCredits === 0 ? "var(--red-dim)" : "var(--gold-dim)",
            borderRadius: "999px", padding: "0.35rem 0.8rem", fontWeight: 700, transition: "all 0.2s",
          }}>
            💳 {recruiterCredits} crédit{recruiterCredits !== 1 ? "s" : ""}
          </Link>
          <button onClick={handleLogout} style={{ padding: "0.42rem 0.9rem", fontSize: "0.8rem", borderRadius: "999px", border: "1px solid var(--border)", background: "transparent", color: "var(--text-muted)", cursor: "pointer" }}>
            Déconnexion
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "1.75rem 2rem", display: "grid", gridTemplateColumns: "280px 1fr", gap: "1.5rem", alignItems: "start" }}>

        {/* SIDEBAR */}
        <div style={{ display: "grid", gap: "0.75rem", position: "sticky", top: "5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.1rem 0.1rem 0.5rem" }}>
            <div>
              <h2 style={{ fontWeight: 900, fontSize: "0.95rem", letterSpacing: "-0.02em" }}>{recruiter?.company_name}</h2>
              <p style={{ color: "var(--text-muted)", fontSize: "0.75rem", marginTop: "0.1rem" }}>{briefs.length} brief{briefs.length > 1 ? "s" : ""}</p>
            </div>
            <button onClick={() => { setShowNewBrief(true); setActiveBrief(null); }} className="btn-gold" style={{ padding: "0.45rem 1rem", fontSize: "0.8rem" }}>+ Brief</button>
          </div>

          {briefs.length === 0 && !showNewBrief && (
            <div className="card empty-state" style={{ padding: "1.5rem", gap: "0.6rem" }}>
              <div style={{ fontSize: "1.5rem" }}>🎬</div>
              <p style={{ fontWeight: 700, fontSize: "0.85rem" }}>Aucun brief</p>
              <p style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>Décris ton projet pour trouver les artistes parfaits.</p>
              <button onClick={() => setShowNewBrief(true)} className="btn-gold" style={{ fontSize: "0.8rem" }}>Créer mon 1er brief</button>
            </div>
          )}

          {briefs.map(b => (
            <button key={b.id} onClick={() => { setActiveBrief(null); loadMatches(b); setShowNewBrief(false); }}
              style={{
                textAlign: "left", padding: "0.85rem 1rem", borderRadius: 14,
                border: `1px solid ${activeBrief?.id === b.id ? "var(--gold-border)" : "var(--border)"}`,
                background: activeBrief?.id === b.id ? "var(--gold-dim)" : "var(--bg-card)",
                cursor: "pointer", width: "100%", transition: "all 0.18s",
              }}>
              <p style={{ fontWeight: 700, fontSize: "0.85rem", marginBottom: "0.25rem", letterSpacing: "-0.01em" }}>
                {PROJECT_TYPE_ICONS[b.project_type]} {b.title}
              </p>
              <p style={{ fontSize: "0.73rem", color: "var(--text-muted)" }}>
                {b.artist_types.slice(0, 2).map(t => ARTIST_TYPE_LABELS[t]).join(", ")}
                {b.location ? ` · 📍 ${b.location}` : ""}
              </p>
            </button>
          ))}

          {briefs.length > 0 && (
            <Link href="/artists" className="btn-outline" style={{ justifyContent: "center", fontSize: "0.8rem", marginTop: "0.25rem" }}>
              🔍 Recherche manuelle
            </Link>
          )}
        </div>

        {/* MAIN */}
        <div>
          {/* NOUVEAU BRIEF FORM */}
          {showNewBrief && (
            <div className="card animate-fade-up" style={{ marginBottom: "1.25rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <div>
                  <h2 style={{ fontWeight: 900, fontSize: "1.2rem", letterSpacing: "-0.03em" }}>Nouveau brief</h2>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.82rem", marginTop: "0.15rem" }}>
                    {BRIEF_STEPS[briefStep]} — étape {briefStep + 1}/{BRIEF_STEPS.length}
                  </p>
                </div>
                <button onClick={() => { setShowNewBrief(false); setBriefStep(0); }} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "1.1rem", padding: "0.25rem", borderRadius: 6 }}>✕</button>
              </div>

              {/* Step dots */}
              <div style={{ display: "flex", gap: "0.4rem", marginBottom: "1.75rem", alignItems: "center" }}>
                {BRIEF_STEPS.map((s, i) => (
                  <div key={s} style={{ display: "flex", alignItems: "center", gap: "0.4rem", flex: i < BRIEF_STEPS.length - 1 ? 1 : "auto" }}>
                    <div className={`step-dot ${i < briefStep ? "done" : i === briefStep ? "active" : "pending"}`}>{i < briefStep ? "✓" : i + 1}</div>
                    {i < BRIEF_STEPS.length - 1 && <div style={{ flex: 1, height: 1, background: i < briefStep ? "var(--green)" : "var(--border)", transition: "background 0.3s" }} />}
                  </div>
                ))}
              </div>

              {briefStep === 0 && (
                <div style={{ display: "grid", gap: "1rem" }}>
                  <div>
                    <label className="label">Titre du brief *</label>
                    <input className="input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                      placeholder="Ex: Cherche rappeur trap pour clip YouTube…" autoFocus />
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
                    <textarea className="input" style={{ minHeight: 100, resize: "vertical" }} value={form.description}
                      onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                      placeholder="Décris ton projet, l'ambiance, le contexte, tes attentes…" />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div>
                      <label className="label">Lieu</label>
                      <input className="input" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="Paris, Lyon, Remote…" />
                    </div>
                    <div>
                      <label className="label">Budget</label>
                      <input className="input" value={form.budget_range} onChange={e => setForm(f => ({ ...f, budget_range: e.target.value }))} placeholder="500–1000€, TBD…" />
                    </div>
                  </div>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.6rem", cursor: "pointer", fontSize: "0.88rem" }}>
                    <input type="checkbox" checked={form.is_remote} onChange={e => setForm(f => ({ ...f, is_remote: e.target.checked }))} />
                    Remote possible
                  </label>
                </div>
              )}

              {briefStep === 1 && (
                <div style={{ display: "grid", gap: "1.25rem" }}>
                  <div>
                    <label className="label">Types d&apos;artistes *</label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.45rem", marginTop: "0.5rem" }}>
                      {(Object.entries(ARTIST_TYPE_LABELS) as [ArtistType, string][]).map(([k, v]) => (
                        <label key={k} style={{ cursor: "pointer" }}>
                          <input type="checkbox" className="type-checkbox" checked={form.artist_types.includes(k)} onChange={() => toggleArtistType(k)} />
                          <span className="type-label" style={{ fontSize: "0.8rem" }}>{v}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  {suggestedTags.length > 0 && (
                    <div>
                      <label className="label">Style recherché</label>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginTop: "0.5rem" }}>
                        {suggestedTags.map(tag => (
                          <label key={tag} style={{ cursor: "pointer" }}>
                            <input type="checkbox" className="type-checkbox" checked={form.style_tags.includes(tag)} onChange={() => toggleStyleTag(tag)} />
                            <span className="type-label" style={{ fontSize: "0.75rem" }}>{tag}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="label">Compétences spécifiques <span style={{ color: "var(--text-faint)", textTransform: "none" }}>optionnel</span></label>
                    <input className="input" value={form.required_skills} onChange={e => setForm(f => ({ ...f, required_skills: e.target.value }))} placeholder="beatmaking, live, improvisation…" />
                  </div>
                </div>
              )}

              {briefStep === 2 && (
                <div style={{ display: "grid", gap: "1rem" }}>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.83rem", padding: "0.65rem 0.85rem", borderRadius: 10, background: "var(--bg-2)", border: "1px solid var(--border)" }}>
                    💡 Ces critères sont optionnels. L&apos;IA les utilise pour affiner le matching.
                  </p>
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
                      <input className="input" type="number" value={form.age_min} onChange={e => setForm(f => ({ ...f, age_min: e.target.value }))} placeholder="18" />
                    </div>
                    <div>
                      <label className="label">Âge max</label>
                      <input className="input" type="number" value={form.age_max} onChange={e => setForm(f => ({ ...f, age_max: e.target.value }))} placeholder="35" />
                    </div>
                  </div>
                  <div>
                    <label className="label">Date limite de candidature</label>
                    <input className="input" type="date" value={form.deadline_at} onChange={e => setForm(f => ({ ...f, deadline_at: e.target.value }))} />
                  </div>
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1.5rem" }}>
                {briefStep > 0
                  ? <button className="btn-outline" onClick={() => setBriefStep(s => s - 1)}>← Retour</button>
                  : <span />
                }
                {briefStep < BRIEF_STEPS.length - 1
                  ? <button className="btn-gold" onClick={() => setBriefStep(s => s + 1)} disabled={!form.title || !form.project_type}>Suivant →</button>
                  : <button className="btn-gold" onClick={submitBrief} disabled={saving}>
                      {saving ? "Création…" : "Créer le brief →"}
                    </button>
                }
              </div>
            </div>
          )}

          {/* BRIEF ACTIF */}
          {activeBrief && !showNewBrief && (
            <div>
              <div className="card animate-fade-up" style={{ marginBottom: "1.1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
                  <div>
                    <div style={{ display: "flex", gap: "0.4rem", marginBottom: "0.5rem", flexWrap: "wrap" }}>
                      <span className="pill-muted pill" style={{ fontSize: "0.72rem" }}>{PROJECT_TYPE_ICONS[activeBrief.project_type]} {PROJECT_TYPE_LABELS[activeBrief.project_type]}</span>
                      {activeBrief.is_remote && <span className="pill-muted pill" style={{ fontSize: "0.72rem" }}>🌐 Remote</span>}
                    </div>
                    <h2 style={{ fontWeight: 900, fontSize: "1.15rem", letterSpacing: "-0.03em" }}>{activeBrief.title}</h2>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.82rem", marginTop: "0.25rem" }}>
                      {activeBrief.artist_types.map(t => ARTIST_TYPE_LABELS[t]).join(", ")}
                      {activeBrief.style_tags?.length ? ` · ${activeBrief.style_tags.join(", ")}` : ""}
                      {activeBrief.location ? ` · 📍 ${activeBrief.location}` : ""}
                    </p>
                  </div>
                  <button onClick={runMatch} disabled={matching} className="btn-gold" style={{ fontSize: "0.82rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <span style={{ display: "inline-block", animation: matching ? "spin-slow 0.7s linear infinite" : "none" }}>⚡</span>
                    {matching ? "Analyse IA…" : "Lancer le matching IA"}
                  </button>
                </div>
              </div>

              {/* FILTERS */}
              <div style={{ display: "flex", gap: "0.4rem", marginBottom: "1rem", alignItems: "center" }}>
                <span style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginRight: "0.25rem" }}>{briefMatches.length} profil{briefMatches.length > 1 ? "s" : ""}</span>
                {(["all", "shortlisted"] as const).map(f => (
                  <button key={f} onClick={() => setMatchFilter(f)} className={`filter-tab ${matchFilter === f ? "active" : ""}`}>
                    {f === "all" ? `Tous (${briefMatches.length})` : `Sélectionnés (${briefMatches.filter(m => m.status === "shortlisted").length})`}
                  </button>
                ))}
              </div>

              {briefMatches.length === 0 ? (
                <div className="card empty-state">
                  <div style={{ fontSize: "2rem" }}>⚡</div>
                  <p style={{ fontWeight: 700 }}>Aucun artiste matchés</p>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Lance l&apos;analyse IA pour trouver les profils compatibles.</p>
                  <button onClick={runMatch} disabled={matching} className="btn-gold" style={{ fontSize: "0.85rem" }}>Lancer le matching IA</button>
                </div>
              ) : (
                <div style={{ display: "grid", gap: "0.75rem" }}>
                  {filteredMatches.map((match, i) => {
                    const p = match.profile as unknown as Partial<CastlyProfile>;
                    if (!p) return null;
                    const age = p.birth_year ? new Date().getFullYear() - p.birth_year : null;
                    return (
                      <div key={match.id} className="casting-card animate-fade-up" style={{ animationDelay: `${i * 0.04}s`, display: "grid", gridTemplateColumns: "auto 1fr auto", gap: "1rem", opacity: match.status === "dismissed" ? 0.4 : 1 }}>
                        <ScoreBadge score={match.match_score} />
                        <div style={{ display: "grid", gap: "0.4rem", minWidth: 0 }}>
                          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
                            <Link href={`/artists/${p.id}`} target="_blank" style={{ fontWeight: 700, fontSize: "0.95rem", textDecoration: "none", color: "inherit", letterSpacing: "-0.01em" }}>{p.display_name}</Link>
                            {p.artist_type?.slice(0, 2).map(t => <span key={t} className="pill" style={{ fontSize: "0.68rem", padding: "0.15rem 0.45rem" }}>{ARTIST_TYPE_LABELS[t]}</span>)}
                          </div>
                          <div style={{ display: "flex", gap: "1rem", fontSize: "0.78rem", color: "var(--text-muted)", flexWrap: "wrap" }}>
                            {p.city && <span>📍 {p.city}</span>}
                            {age && <span>👤 {age} ans</span>}
                            {p.experience_years != null && p.experience_years > 0 && <span>⭐ {p.experience_years} ans</span>}
                            {p.day_rate_eur && <span style={{ color: "var(--green)", fontWeight: 700 }}>💰 {p.day_rate_eur}€/j</span>}
                          </div>
                          {p.style_tags && p.style_tags.length > 0 && (
                            <div style={{ display: "flex", gap: "0.3rem", flexWrap: "wrap" }}>
                              {p.style_tags.slice(0, 4).map(t => <span key={t} className="pill-muted pill" style={{ fontSize: "0.68rem", padding: "0.12rem 0.45rem" }}>{t}</span>)}
                            </div>
                          )}
                          {match.match_reasons.length > 0 && (
                            <div style={{ display: "flex", gap: "0.3rem", flexWrap: "wrap" }}>
                              {match.match_reasons.map((r, j) => <span key={j} className="chip-green" style={{ fontSize: "0.7rem" }}>✓ {r}</span>)}
                            </div>
                          )}
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", alignItems: "flex-end", flexShrink: 0 }}>
                          <Link href={`/artists/${p.id}`} target="_blank" className="btn-outline" style={{ padding: "0.3rem 0.75rem", fontSize: "0.72rem" }}>Profil →</Link>
                          {revealedContacts[p.id as string] ? (
                            <a href={`mailto:${revealedContacts[p.id as string]}?subject=Opportunité — Castly`}
                              style={{ padding: "0.3rem 0.75rem", fontSize: "0.72rem", borderRadius: "999px", border: "1px solid rgba(56,199,147,0.4)", background: "rgba(56,199,147,0.08)", color: "var(--green)", textDecoration: "none", whiteSpace: "nowrap" }}>
                              📧 {revealedContacts[p.id as string]}
                            </a>
                          ) : (
                            <button onClick={() => revealContact(p.id as string)}
                              style={{ padding: "0.3rem 0.75rem", fontSize: "0.72rem", borderRadius: "999px", border: "1px solid var(--gold-border)", background: "var(--gold-dim)", color: "var(--gold)", cursor: "pointer", fontWeight: 700 }}>
                              📧 Contacter
                            </button>
                          )}
                          <button onClick={() => updateMatchStatus(match.id, match.status === "shortlisted" ? "new" : "shortlisted")}
                            style={{ padding: "0.3rem 0.75rem", fontSize: "0.72rem", borderRadius: "999px", border: "1px solid", borderColor: match.status === "shortlisted" ? "var(--gold-border)" : "var(--border)", background: match.status === "shortlisted" ? "var(--gold-dim)" : "transparent", color: match.status === "shortlisted" ? "var(--gold)" : "var(--text-muted)", cursor: "pointer" }}>
                            {match.status === "shortlisted" ? "★ Sélectionné" : "☆ Sélectionner"}
                          </button>
                          {match.status !== "dismissed" && (
                            <button onClick={() => updateMatchStatus(match.id, "dismissed")}
                              style={{ padding: "0.2rem 0.5rem", fontSize: "0.7rem", borderRadius: "999px", border: "none", background: "transparent", color: "rgba(255,255,255,0.15)", cursor: "pointer" }}>✕</button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ÉTAT VIDE — pas de brief actif */}
          {!activeBrief && !showNewBrief && briefs.length > 0 && (
            <div className="card empty-state animate-fade-up" style={{ padding: "3rem" }}>
              <div style={{ fontSize: "2rem" }}>👈</div>
              <p style={{ fontWeight: 700 }}>Sélectionne un brief</p>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Clique sur un brief dans la sidebar pour voir les profils matchés.</p>
            </div>
          )}

          {!activeBrief && !showNewBrief && briefs.length === 0 && (
            <div className="card animate-fade-up" style={{ textAlign: "center", padding: "4rem 3rem", background: "linear-gradient(135deg,rgba(232,184,109,0.05),rgba(56,199,147,0.03))", borderColor: "var(--gold-border)" }}>
              <div style={{ fontSize: "3.5rem", marginBottom: "1rem" }}>🎬</div>
              <h2 style={{ fontWeight: 900, fontSize: "1.4rem", letterSpacing: "-0.04em", marginBottom: "0.6rem" }}>Bienvenue, {recruiter?.company_name}</h2>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "2rem", maxWidth: 360, margin: "0 auto 2rem" }}>
                Décris ton projet en 3 étapes et l&apos;IA trouve les artistes compatibles parmi tous les profils.
              </p>
              <button onClick={() => setShowNewBrief(true)} className="btn-gold" style={{ fontSize: "0.92rem" }}>Créer mon premier brief →</button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default function RecruiterDashboard() {
  return <Suspense><RecruiterDashboardInner /></Suspense>;
}
