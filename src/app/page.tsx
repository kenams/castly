"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then((result: Awaited<ReturnType<typeof supabase.auth.getUser>>) => setIsLoggedIn(!!result.data.user));
  }, []);

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)" }}>
      {/* NAV */}
      <nav className="nav">
        <Link href="/" className="nav-logo">Castly</Link>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <Link href="/castings" style={{ color: "var(--text-muted)", fontSize: "0.88rem", textDecoration: "none", padding: "0.45rem 0.75rem" }}>Castings</Link>
          {isLoggedIn ? (
            <Link href="/dashboard" className="btn-gold" style={{ padding: "0.5rem 1.2rem", fontSize: "0.85rem" }}>Mon dashboard →</Link>
          ) : (
            <>
              <Link href="/auth/login" className="btn-outline" style={{ padding: "0.5rem 1.2rem", fontSize: "0.85rem" }}>Connexion</Link>
              <Link href="/auth/signup" className="btn-gold" style={{ padding: "0.5rem 1.2rem", fontSize: "0.85rem" }}>Commencer</Link>
            </>
          )}
        </div>
      </nav>

      {/* HERO */}
      <section style={{ maxWidth: 900, margin: "0 auto", padding: "6rem 2rem 4rem", textAlign: "center" }}>
        <div className="pill" style={{ marginBottom: "1.5rem", fontSize: "0.82rem", display: "inline-flex" }}>
          ✨ IA de matching casting — France
        </div>
        <h1 style={{ fontSize: "clamp(2.4rem,6vw,4rem)", fontWeight: 900, lineHeight: 1.1, letterSpacing: "-0.04em", marginBottom: "1.5rem" }}>
          Tes prochains castings,<br />
          <span style={{ color: "var(--gold)" }}>matchés par l&apos;IA</span>
        </h1>
        <p style={{ fontSize: "1.15rem", color: "var(--text-muted)", maxWidth: 560, margin: "0 auto 2.5rem", lineHeight: 1.65 }}>
          Crée ton profil artiste. Notre IA analyse chaque casting et te donne un score de compatibilité en secondes. Fini de passer des heures à chercher.
        </p>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/auth/signup" className="btn-gold" style={{ fontSize: "1rem", padding: "0.9rem 2.2rem" }}>
            Créer mon profil gratuit →
          </Link>
          <Link href="/castings" className="btn-outline" style={{ fontSize: "1rem", padding: "0.9rem 2.2rem" }}>
            Voir les castings
          </Link>
        </div>

        {/* STATS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem", marginTop: "4rem", maxWidth: 600, margin: "4rem auto 0" }}>
          {[
            { v: "500+", l: "castings indexés" },
            { v: "IA", l: "scoring instantané" },
            { v: "Free", l: "pour commencer" },
          ].map(s => (
            <div key={s.l} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "2rem", fontWeight: 900, color: "var(--gold)" }}>{s.v}</div>
              <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* COMMENT ÇA MARCHE */}
      <section id="comment-ca-marche" style={{ maxWidth: 900, margin: "0 auto", padding: "4rem 2rem" }}>
        <h2 style={{ fontSize: "1.8rem", fontWeight: 800, textAlign: "center", marginBottom: "3rem" }}>Comment ça marche</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: "1.5rem" }}>
          {[
            { n: "1", t: "Crée ton profil", d: "Type artistique, mensuration, compétences, expérience. 5 minutes." },
            { n: "2", t: "L'IA analyse les castings", d: "Scraping continu des offres françaises. Casting.fr, Instagram, LinkedIn et plus." },
            { n: "3", t: "Score de compatibilité", d: "Chaque casting reçoit un score 0-100 basé sur ton profil. Les meilleures offres en haut." },
            { n: "4", t: "Postule en 1 clic", d: "Vois pourquoi tu matches (ou pas) et accède directement à l'offre originale." },
          ].map(s => (
            <div key={s.n} className="card" style={{ display: "grid", gap: "0.75rem" }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--gold-dim)", border: "1px solid var(--gold-border)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: "var(--gold)", fontSize: "0.9rem" }}>{s.n}</div>
              <h3 style={{ fontWeight: 700 }}>{s.t}</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: 1.6 }}>{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TYPES */}
      <section style={{ maxWidth: 900, margin: "0 auto", padding: "2rem 2rem 4rem", textAlign: "center" }}>
        <h2 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: "1.5rem", color: "var(--text-muted)" }}>Pour tous les profils artistiques</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", justifyContent: "center" }}>
          {["🎬 Acteur / Actrice","🎤 Chanteur / Chanteuse","🎤 Rappeur / Rappeuse","💃 Danseur / Danseuse","📸 Mannequin","🎸 Musicien","😄 Humoriste","📺 Présentateur","🎙️ Comédien voix"].map(t => (
            <span key={t} className="pill-muted pill">{t}</span>
          ))}
        </div>
      </section>

      {/* SECTION RECRUTEUR */}
      <section style={{ maxWidth: 900, margin: "0 auto", padding: "4rem 2rem", borderTop: "1px solid var(--border)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem", alignItems: "center" }}>
          <div>
            <div className="pill" style={{ marginBottom: "1rem", fontSize: "0.78rem", display: "inline-flex" }}>🎬 Pour les recruteurs</div>
            <h2 style={{ fontSize: "1.8rem", fontWeight: 800, lineHeight: 1.2, marginBottom: "0.75rem" }}>
              Trouvez le talent parfait<br /><span style={{ color: "var(--gold)" }}>en quelques minutes</span>
            </h2>
            <p style={{ color: "var(--text-muted)", lineHeight: 1.65, marginBottom: "1.5rem" }}>
              Décrivez votre projet en un brief. Notre IA parcourt tous les profils artistes et vous propose les candidats les plus compatibles, scorés et classés.
            </p>
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <Link href="/auth/signup" className="btn-gold" style={{ fontSize: "0.9rem" }}>Créer un compte recruteur →</Link>
              <Link href="/artists" className="btn-outline" style={{ fontSize: "0.9rem" }}>Parcourir les artistes</Link>
            </div>
          </div>
          <div style={{ display: "grid", gap: "0.75rem" }}>
            {[
              { icon: "📝", t: "Brief en 3 étapes", d: "Décris ton projet, le profil cherché, les critères. 5 minutes." },
              { icon: "⚡", t: "Matching IA instantané", d: "L'IA analyse tous les profils et te sort les meilleurs candidats scorés." },
              { icon: "📧", t: "Contact direct", d: "Révèle l'email de l'artiste et contacte-le sans intermédiaire." },
            ].map(f => (
              <div key={f.t} className="card" style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start", padding: "1rem" }}>
                <span style={{ fontSize: "1.2rem" }}>{f.icon}</span>
                <div>
                  <p style={{ fontWeight: 700, fontSize: "0.9rem" }}>{f.t}</p>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>{f.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PARTENAIRES */}
      <section style={{ maxWidth: 900, margin: "0 auto", padding: "4rem 2rem", borderTop: "1px solid var(--border)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", alignItems: "center" }}>
          <div>
            <div className="pill" style={{ marginBottom: "1rem", fontSize: "0.78rem", display: "inline-flex" }}>★ Partenaires Castly</div>
            <h2 style={{ fontSize: "1.6rem", fontWeight: 800, marginBottom: "0.75rem" }}>Vous proposez des castings ?</h2>
            <p style={{ color: "var(--text-muted)", lineHeight: 1.65, marginBottom: "1.5rem" }}>
              Mettez vos offres en avant devant des milliers d&apos;artistes ciblés. Vos castings apparaissent en tête avec le badge <strong style={{ color: "var(--gold)" }}>★ Partenaire</strong>.
            </p>
            <Link href="mailto:contact@castly.fr" className="btn-outline">Devenir partenaire →</Link>
          </div>
          <div style={{ display: "grid", gap: "0.75rem" }}>
            {[
              { icon: "🎯", t: "Ciblage précis", d: "Vos castings atteignent les profils compatibles en priorité." },
              { icon: "⚡", t: "Mise en avant IA", d: "Badge partenaire + priorité dans le scoring pour vos offres." },
              { icon: "📊", t: "Statistiques", d: "Vues, clics, postulations — tableau de bord en temps réel." },
            ].map(f => (
              <div key={f.t} className="card" style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start", padding: "1rem" }}>
                <span style={{ fontSize: "1.2rem" }}>{f.icon}</span>
                <div>
                  <p style={{ fontWeight: 700, fontSize: "0.9rem" }}>{f.t}</p>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>{f.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ maxWidth: 700, margin: "0 auto", padding: "4rem 2rem 6rem", textAlign: "center" }}>
        <div className="card" style={{ background: "linear-gradient(135deg, rgba(232,184,109,0.08), rgba(56,199,147,0.05))", borderColor: "var(--gold-border)" }}>
          <h2 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: "1rem" }}>Prêt à trouver ton prochain casting ?</h2>
          <p style={{ color: "var(--text-muted)", marginBottom: "2rem" }}>Gratuit pour commencer. Crée ton profil en 5 minutes.</p>
          <Link href="/auth/signup" className="btn-gold" style={{ fontSize: "1.05rem", padding: "1rem 2.5rem" }}>
            Créer mon profil →
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: "1px solid var(--border)", padding: "1.5rem 2rem" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <span className="nav-logo" style={{ fontSize: "1.1rem" }}>Castly</span>
          <p style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>© 2026 Castly — Tous droits réservés</p>
          <div style={{ display: "flex", gap: "1.5rem" }}>
            <Link href="/castings" style={{ color: "var(--text-muted)", fontSize: "0.82rem", textDecoration: "none" }}>Castings</Link>
            <Link href="/auth/login" style={{ color: "var(--text-muted)", fontSize: "0.82rem", textDecoration: "none" }}>Connexion</Link>
            <Link href="/auth/signup" style={{ color: "var(--text-muted)", fontSize: "0.82rem", textDecoration: "none" }}>S&apos;inscrire</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
