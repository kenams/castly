"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { RECRUITER_TYPE_LABELS } from "@/types";
import type { RecruiterType } from "@/types";

export default function RecruiterOnboardingPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    company_name: "", recruiter_type: "" as RecruiterType | "",
    description: "", website: "", contact_email: "", city: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.company_name || !form.recruiter_type) { setError("Nom et type requis"); return; }
    setSaving(true); setError("");
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/auth/login"); return; }
    const { error: err } = await supabase.from("castly_recruiters").upsert({
      user_id: user.id, company_name: form.company_name,
      recruiter_type: form.recruiter_type, description: form.description || null,
      website: form.website || null, contact_email: form.contact_email || user.email, city: form.city || null,
    });
    if (err) { setError(err.message); setSaving(false); return; }
    router.push("/recruiter/dashboard");
  }

  return (
    <main style={{ minHeight: "100vh", display: "grid", gridTemplateColumns: "1fr 1fr", background: "var(--bg)" }}>
      {/* LEFT */}
      <div style={{ position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "center", padding: "3rem 2.5rem", background: "var(--bg-2)", borderRight: "1px solid var(--border)" }}>
        <div style={{ position: "absolute", inset: 0 }}>
          <div className="orb" style={{ width: 400, height: 400, background: "rgba(56,199,147,0.07)", top: "20%", left: "10%", filter: "blur(80px)" }} />
        </div>
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: "2rem", marginBottom: "1.25rem" }}>🎬</div>
          <h2 style={{ fontSize: "1.4rem", fontWeight: 900, letterSpacing: "-0.04em", marginBottom: "1rem" }}>
            Configurez votre espace recruteur
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", lineHeight: 1.7, marginBottom: "2rem" }}>
            Ces informations permettront aux artistes de savoir qui les contacte et renforceront votre crédibilité.
          </p>
          <div style={{ display: "grid", gap: "0.65rem" }}>
            {[
              "Matching IA sur tous les profils artistes",
              "Briefs en 3 étapes rapides",
              "Contact direct en 1 crédit",
              "Scores expliqués — pourquoi ce profil",
            ].map(f => (
              <div key={f} style={{ display: "flex", gap: "0.6rem", alignItems: "center", fontSize: "0.85rem" }}>
                <span style={{ color: "var(--green)", fontWeight: 800 }}>✓</span>
                <span style={{ color: "var(--text-2)" }}>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "3rem 2.5rem" }}>
        <div style={{ width: "100%", maxWidth: 420 }}>
          <div className="animate-fade-up" style={{ marginBottom: "2.25rem" }}>
            <h1 style={{ fontSize: "1.6rem", fontWeight: 900, letterSpacing: "-0.04em", marginBottom: "0.4rem" }}>Votre organisation</h1>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Ces infos s&apos;affichent aux artistes que vous contactez.</p>
          </div>

          <form onSubmit={handleSubmit} className="animate-fade-up-2" style={{ display: "grid", gap: "1rem" }}>
            <div>
              <label className="label">Nom de la société / structure *</label>
              <input className="input" required value={form.company_name} onChange={e => setForm(f => ({ ...f, company_name: e.target.value }))} placeholder="Ex: Agence Talent Plus, Studio K…" autoFocus />
            </div>
            <div>
              <label className="label">Type de recruteur *</label>
              <select className="input" required value={form.recruiter_type} onChange={e => setForm(f => ({ ...f, recruiter_type: e.target.value as RecruiterType }))}>
                <option value="">Choisir…</option>
                {(Object.entries(RECRUITER_TYPE_LABELS) as [RecruiterType, string][]).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              <div>
                <label className="label">Ville</label>
                <input className="input" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} placeholder="Paris, Lyon…" />
              </div>
              <div>
                <label className="label">Email de contact</label>
                <input className="input" type="email" value={form.contact_email} onChange={e => setForm(f => ({ ...f, contact_email: e.target.value }))} placeholder="casting@société.fr" />
              </div>
            </div>
            <div>
              <label className="label">Site web</label>
              <input className="input" value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} placeholder="https://votre-site.fr" />
            </div>
            <div>
              <label className="label">Description <span style={{ color: "var(--text-faint)", textTransform: "none", letterSpacing: 0 }}>(optionnel)</span></label>
              <textarea className="input" style={{ minHeight: 85 }} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Présentez votre activité, vos projets, ce que vous recherchez…" />
            </div>
            {error && (
              <div style={{ padding: "0.75rem 1rem", borderRadius: 12, background: "var(--red-dim)", border: "1px solid var(--red-border)", fontSize: "0.83rem", color: "var(--red)" }}>
                {error}
              </div>
            )}
            <button className="btn-green" type="submit" disabled={saving} style={{ width: "100%", padding: "0.8rem", fontSize: "0.9rem", marginTop: "0.25rem" }}>
              {saving ? "Création…" : "Accéder au tableau de bord →"}
            </button>
          </form>
        </div>
      </div>

      <style>{`@media (max-width: 720px) { main { grid-template-columns: 1fr !important; } main > div:first-child { display: none !important; } }`}</style>
    </main>
  );
}
