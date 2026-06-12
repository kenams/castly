"use client";
export const dynamic = "force-dynamic";
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
    company_name: "",
    recruiter_type: "" as RecruiterType | "",
    description: "",
    website: "",
    contact_email: "",
    city: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.company_name || !form.recruiter_type) { setError("Nom et type requis"); return; }
    setSaving(true); setError("");
    const supabase = createClient();
    if (!supabase) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/auth/login"); return; }

    const { error: err } = await supabase.from("castly_recruiters").upsert({
      user_id: user.id,
      company_name: form.company_name,
      recruiter_type: form.recruiter_type,
      description: form.description || null,
      website: form.website || null,
      contact_email: form.contact_email || user.email,
      city: form.city || null,
    });
    if (err) { setError(err.message); setSaving(false); return; }
    router.push("/recruiter/dashboard");
  }

  return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <div style={{ width: "100%", maxWidth: 520 }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <span className="nav-logo">Castly</span>
          <p style={{ color: "var(--text-muted)", marginTop: "0.5rem" }}>Profil recruteur</p>
        </div>
        <div className="card">
          <h1 style={{ fontSize: "1.4rem", fontWeight: 800, marginBottom: "0.5rem" }}>Ton organisation</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", marginBottom: "1.5rem" }}>
            Ces infos permettront aux artistes de savoir qui les contacte.
          </p>
          <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1rem" }}>
            <div>
              <label className="label">Nom de la société / structure *</label>
              <input className="input" required value={form.company_name} onChange={e => setForm(f => ({ ...f, company_name: e.target.value }))} placeholder="Ex: Agence Talent Plus, Studio K Productions…" />
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
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
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
              <label className="label">Description (optionnel)</label>
              <textarea className="input" style={{ minHeight: 90, resize: "vertical" }} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Présentez votre activité, vos projets types, ce que vous recherchez…" />
            </div>
            {error && <p style={{ color: "var(--red)", fontSize: "0.85rem" }}>{error}</p>}
            <button className="btn-gold" type="submit" disabled={saving} style={{ width: "100%", marginTop: "0.5rem" }}>
              {saving ? "Création…" : "Accéder au tableau de bord →"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
