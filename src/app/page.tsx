"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const ARTIST_TYPES = [
  { icon: "🎬", label: "Acteur", color: "gold" },
  { icon: "🎤", label: "Chanteur", color: "green" },
  { icon: "🎤", label: "Rappeur", color: "gold" },
  { icon: "💃", label: "Danseur", color: "green" },
  { icon: "📸", label: "Mannequin", color: "gold" },
  { icon: "🎙️", label: "Comédien voix", color: "green" },
  { icon: "😄", label: "Humoriste", color: "gold" },
  { icon: "📺", label: "Présentateur", color: "green" },
];

const STEPS_ARTIST = [
  { icon: "✍️", title: "Crée ton profil", desc: "5 min. Type, style, expérience, mensurations." },
  { icon: "⚡", title: "L'IA scanne les castings", desc: "Matching automatique sur 33+ offres en temps réel." },
  { icon: "🎯", title: "Ton score de compatibilité", desc: "Chaque casting reçoit un score 0-100 taillé pour toi." },
  { icon: "📧", title: "Postule en 1 clic", desc: "Accède directement aux contacts et à l'offre originale." },
];

const STEPS_RECRUITER = [
  { icon: "📝", title: "Décris ton projet", desc: "Brief en 3 étapes : projet, profil, critères physiques." },
  { icon: "🤖", title: "Matching IA instantané", desc: "Tous les profils scorés en quelques secondes." },
  { icon: "📊", title: "Top candidats classés", desc: "Score + raisons du match expliquées clairement." },
  { icon: "📧", title: "Contact direct", desc: "Révèle l'email avec 1 crédit. Pas d'intermédiaire." },
];

function Counter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [val, setVal] = useState(target);
  const [animated, setAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (animated) return;
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      setAnimated(true);
      setVal(0);
      let start = 0;
      const step = Math.ceil(target / 40);
      const t = setInterval(() => {
        start = Math.min(start + step, target);
        setVal(start);
        if (start >= target) clearInterval(t);
      }, 30);
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target, animated]);
  return <span ref={ref}>{val}{suffix}</span>;
}

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<"artist" | "recruiter">("artist");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then((result: Awaited<ReturnType<typeof supabase.auth.getUser>>) =>
      setIsLoggedIn(!!result.data.user)
    );
  }, []);

  const steps = activeTab === "artist" ? STEPS_ARTIST : STEPS_RECRUITER;

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)", overflowX: "hidden" }}>

      {/* NAV */}
      <nav className="nav">
        <Link href="/" className="nav-logo">Castly</Link>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <Link href="/castings" style={{ color: "var(--text-muted)", fontSize: "0.88rem", textDecoration: "none", padding: "0.45rem 0.75rem" }}>Castings</Link>
          <Link href="/artists" style={{ color: "var(--text-muted)", fontSize: "0.88rem", textDecoration: "none", padding: "0.45rem 0.75rem" }}>Artistes</Link>
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
      <section style={{ position: "relative", maxWidth: 1000, margin: "0 auto", padding: "5rem 2rem 4rem", textAlign: "center", overflow: "hidden" }}>
        {/* Orbs */}
        <div className="orb" style={{ width: 500, height: 500, background: "rgba(232,184,109,0.06)", top: -200, left: "50%", marginLeft: -250, animationDelay: "0s" }} />
        <div className="orb" style={{ width: 300, height: 300, background: "rgba(56,199,147,0.05)", top: 100, right: -100, animationDelay: "-4s" }} />

        <div className="animate-fade-up">
          <span className="pill" style={{ marginBottom: "1.5rem", fontSize: "0.8rem", display: "inline-flex" }}>
            ✨ IA de casting — France
          </span>
        </div>

        <h1 className="animate-fade-up-2" style={{ fontSize: "clamp(2.6rem,7vw,4.5rem)", fontWeight: 900, lineHeight: 1.05, letterSpacing: "-0.05em", marginBottom: "1.5rem" }}>
          Tes prochains castings,<br />
          <span className="text-gradient-gold">matchés par l&apos;IA</span>
        </h1>

        <p className="animate-fade-up-3" style={{ fontSize: "1.1rem", color: "var(--text-muted)", maxWidth: 520, margin: "0 auto 3rem", lineHeight: 1.7 }}>
          Artiste ou recruteur, l&apos;IA analyse chaque opportunité et te donne un score de compatibilité instantané.
        </p>

        {/* DUAL PATH CARDS */}
        <div className="animate-fade-up-4 grid-2" style={{ maxWidth: 760, margin: "0 auto" }}>
          <Link href="/auth/signup?role=artist" className="path-card path-card-gold" style={{ textAlign: "left" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "1rem", display: "block", animation: "float 4s ease-in-out infinite" }}>🎤</div>
            <p style={{ fontSize: "1.1rem", fontWeight: 800, marginBottom: "0.5rem" }}>
              Je suis <span className="text-gradient-gold">artiste</span>
            </p>
            <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: 1.6, marginBottom: "1.25rem" }}>
              Acteur, rappeur, danseur, mannequin… Crée ton profil et l&apos;IA te trouve les castings qui collent à ton style.
            </p>
            <span className="btn-gold" style={{ fontSize: "0.85rem", padding: "0.6rem 1.25rem" }}>
              Créer mon profil →
            </span>
          </Link>

          <Link href="/auth/signup?role=recruiter" className="path-card path-card-green" style={{ textAlign: "left" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "1rem", display: "block", animation: "float 4s 0.8s ease-in-out infinite" }}>🎬</div>
            <p style={{ fontSize: "1.1rem", fontWeight: 800, marginBottom: "0.5rem" }}>
              Je <span className="text-gradient-green">recrute</span>
            </p>
            <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: 1.6, marginBottom: "1.25rem" }}>
              Producteur, agence, label, brand… Poste un brief et l&apos;IA te sort les profils compatibles en secondes.
            </p>
            <span className="btn-green" style={{ fontSize: "0.85rem", padding: "0.6rem 1.25rem" }}>
              Trouver des artistes →
            </span>
          </Link>
        </div>
      </section>

      {/* STATS */}
      <section style={{ borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", background: "var(--bg-2)" }}>
        <div className="grid-4" style={{ maxWidth: 900, margin: "0 auto", padding: "2rem 2rem", textAlign: "center" }}>
          {[
            { val: 33, suffix: "+", label: "castings ouverts", color: "var(--gold)" },
            { val: 100, suffix: "%", label: "matching IA", color: "var(--green)" },
            { val: 3, suffix: " crédits", label: "offerts à l'inscription", color: "var(--gold)" },
            { val: 6, suffix: " types", label: "d'artistes supportés", color: "var(--green)" },
          ].map(s => (
            <div key={s.label}>
              <div style={{ fontSize: "2rem", fontWeight: 900, color: s.color, animation: "count-up 0.6s ease both" }}>
                <Counter target={s.val} suffix={s.suffix} />
              </div>
              <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* TYPES TICKER */}
      <section style={{ padding: "2.5rem 0", borderBottom: "1px solid var(--border)", overflow: "hidden" }}>
        <div className="ticker-wrap">
          <div className="ticker-track">
            {[...ARTIST_TYPES, ...ARTIST_TYPES].map((t, i) => (
              <div key={i} style={{
                display: "inline-flex", alignItems: "center", gap: "0.5rem",
                marginRight: "2.5rem",
                padding: "0.5rem 1.2rem",
                borderRadius: "999px",
                border: `1px solid ${t.color === "gold" ? "var(--gold-border)" : "var(--green-border)"}`,
                background: t.color === "gold" ? "var(--gold-dim)" : "var(--green-dim)",
                color: t.color === "gold" ? "var(--gold)" : "var(--green)",
                fontSize: "0.88rem", fontWeight: 600, whiteSpace: "nowrap",
              }}>
                <span>{t.icon}</span> {t.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMMENT ÇA MARCHE — onglets */}
      <section style={{ maxWidth: 900, margin: "0 auto", padding: "5rem 2rem" }}>
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <h2 style={{ fontSize: "1.9rem", fontWeight: 900, marginBottom: "1.25rem" }}>Comment ça marche</h2>
          {/* Tab switcher */}
          <div style={{ display: "inline-flex", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "999px", padding: "4px", gap: "4px" }}>
            <button
              onClick={() => setActiveTab("artist")}
              style={{
                padding: "0.5rem 1.4rem", borderRadius: "999px", border: "none", cursor: "pointer",
                fontWeight: 700, fontSize: "0.88rem",
                background: activeTab === "artist" ? "linear-gradient(135deg, #e8b86d, #d4a050)" : "transparent",
                color: activeTab === "artist" ? "#0a0a12" : "var(--text-muted)",
                transition: "all 0.2s",
              }}
            >
              🎤 Artiste
            </button>
            <button
              onClick={() => setActiveTab("recruiter")}
              style={{
                padding: "0.5rem 1.4rem", borderRadius: "999px", border: "none", cursor: "pointer",
                fontWeight: 700, fontSize: "0.88rem",
                background: activeTab === "recruiter" ? "linear-gradient(135deg, #38c793, #2aab7e)" : "transparent",
                color: activeTab === "recruiter" ? "#0a0a12" : "var(--text-muted)",
                transition: "all 0.2s",
              }}
            >
              🎬 Recruteur
            </button>
          </div>
        </div>

        <div className="grid-4">
          {steps.map((s, i) => (
            <div key={s.title} className="card card-hover animate-fade-up" style={{ animationDelay: `${i * 0.1}s`, display: "grid", gap: "0.75rem", textAlign: "center" }}>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <div className={`icon-circle ${activeTab === "artist" ? "icon-circle-gold" : "icon-circle-green"}`} style={{ fontSize: "1.6rem" }}>
                  {s.icon}
                </div>
              </div>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: activeTab === "artist" ? "var(--gold-dim)" : "var(--green-dim)", border: `1px solid ${activeTab === "artist" ? "var(--gold-border)" : "var(--green-border)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: activeTab === "artist" ? "var(--gold)" : "var(--green)", fontSize: "0.8rem", margin: "0 auto" }}>
                {i + 1}
              </div>
              <h3 style={{ fontWeight: 700, fontSize: "0.95rem" }}>{s.title}</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", lineHeight: 1.6 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES SPLIT */}
      <section style={{ borderTop: "1px solid var(--border)", background: "var(--bg-2)" }}>
        <div className="grid-split" style={{ maxWidth: 900, margin: "0 auto", padding: "5rem 2rem" }}>
          <div>
            <span className="pill" style={{ marginBottom: "1rem", display: "inline-flex", fontSize: "0.78rem" }}>🎤 Pour les artistes</span>
            <h2 style={{ fontSize: "1.7rem", fontWeight: 900, lineHeight: 1.25, marginBottom: "0.75rem" }}>
              Fini de chercher,<br /><span className="text-gradient-gold">l&apos;IA travaille pour toi</span>
            </h2>
            <p style={{ color: "var(--text-muted)", lineHeight: 1.7, marginBottom: "1.75rem" }}>
              Crée ton profil une fois. L&apos;IA scrute en continu les castings français et te donne ton score de compatibilité sur chaque offre. Tu vois directement pourquoi tu matches.
            </p>
            <div style={{ display: "grid", gap: "0.75rem", marginBottom: "2rem" }}>
              {["Score 0-100 sur chaque casting", "Raisons du match expliquées", "Filtres par type, ville, rémunération", "Accès direct à l'offre originale"].map(f => (
                <div key={f} style={{ display: "flex", gap: "0.6rem", alignItems: "center", fontSize: "0.9rem" }}>
                  <span style={{ color: "var(--gold)", fontWeight: 700 }}>✓</span>
                  <span style={{ color: "var(--text-muted)" }}>{f}</span>
                </div>
              ))}
            </div>
            <Link href="/auth/signup?role=artist" className="btn-gold">Créer mon profil gratuit →</Link>
          </div>
          <div style={{ display: "grid", gap: "0.75rem" }}>
            {[
              { score: 94, type: "🎤 Rappeur", title: "Rappeur trap pour clip officiel", loc: "Paris", days: "20j", paid: true },
              { score: 78, type: "🎤 Chanteur", title: "Feat R&B artiste signé Universal", loc: "Paris", days: "14j", paid: true },
              { score: 61, type: "💃 Danseur", title: "Danseur hip-hop clip rappeur signé", loc: "Paris", days: "11j", paid: true },
            ].map(c => (
              <div key={c.title} className="card" style={{ display: "flex", gap: "1rem", alignItems: "center", padding: "1rem 1.25rem" }}>
                <div className={`score-badge ${c.score >= 70 ? "score-high" : "score-mid"}`}>{c.score}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 700, fontSize: "0.88rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.title}</p>
                  <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.25rem", fontSize: "0.78rem", color: "var(--text-muted)" }}>
                    <span>{c.type}</span>
                    <span>📍 {c.loc}</span>
                    <span>{c.days}</span>
                  </div>
                </div>
                {c.paid && <span className="pill-green pill" style={{ fontSize: "0.7rem", flexShrink: 0 }}>Rémunéré</span>}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ borderTop: "1px solid var(--border)" }}>
        <div className="grid-split" style={{ maxWidth: 900, margin: "0 auto", padding: "5rem 2rem" }}>
          <div style={{ display: "grid", gap: "0.75rem" }}>
            {[
              { icon: "📝", title: "Brief en 3 étapes", desc: "Décris ton projet, le profil et les critères physiques." },
              { icon: "⚡", title: "Matching IA en secondes", desc: "L'IA analyse tous les profils et sort les meilleurs." },
              { icon: "📧", title: "Contact direct 1 crédit", desc: "Email de l'artiste révélé, no bullshit." },
            ].map(f => (
              <div key={f.title} className="card" style={{ display: "flex", gap: "1rem", alignItems: "flex-start", padding: "1.1rem" }}>
                <div className="icon-circle icon-circle-green" style={{ fontSize: "1.2rem", width: 44, height: 44 }}>{f.icon}</div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: "0.92rem", marginBottom: "0.2rem" }}>{f.title}</p>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div>
            <span className="pill-green pill" style={{ marginBottom: "1rem", display: "inline-flex", fontSize: "0.78rem" }}>🎬 Pour les recruteurs</span>
            <h2 style={{ fontSize: "1.7rem", fontWeight: 900, lineHeight: 1.25, marginBottom: "0.75rem" }}>
              Trouvez le talent parfait<br /><span className="text-gradient-green">en quelques minutes</span>
            </h2>
            <p style={{ color: "var(--text-muted)", lineHeight: 1.7, marginBottom: "2rem" }}>
              Fini de scroller Instagram pendant des heures. Postez un brief et l&apos;IA vous propose les candidats scorés, classés, prêts à être contactés.
            </p>
            <Link href="/auth/signup?role=recruiter" className="btn-green">Créer un compte recruteur →</Link>
          </div>
        </div>
      </section>

      {/* PARTENAIRES */}
      <section style={{ background: "var(--bg-2)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
        <div className="grid-split" style={{ maxWidth: 900, margin: "0 auto", padding: "4rem 2rem" }}>
          <div>
            <span className="pill" style={{ marginBottom: "1rem", display: "inline-flex", fontSize: "0.78rem" }}>★ Partenaires Castly</span>
            <h2 style={{ fontSize: "1.6rem", fontWeight: 900, marginBottom: "0.75rem" }}>Vous proposez des castings ?</h2>
            <p style={{ color: "var(--text-muted)", lineHeight: 1.7, marginBottom: "1.5rem" }}>
              Vos offres en tête devant des milliers d&apos;artistes ciblés avec le badge <strong style={{ color: "var(--gold)" }}>★ Partenaire</strong>.
            </p>
            <a href="mailto:contact@castly.fr" className="btn-outline">Devenir partenaire →</a>
          </div>
          <div style={{ display: "grid", gap: "0.75rem" }}>
            {[
              { icon: "🎯", t: "Ciblage précis", d: "Vos castings atteignent les profils compatibles en priorité." },
              { icon: "⚡", t: "Badge partenaire IA", d: "Priorité dans le scoring + badge visible sur chaque offre." },
              { icon: "📊", t: "Stats en temps réel", d: "Vues, clics, postulations — dashboard complet." },
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

      {/* CTA FINAL */}
      <section style={{ maxWidth: 700, margin: "0 auto", padding: "5rem 2rem 7rem", textAlign: "center" }}>
        <div className="card" style={{ background: "linear-gradient(135deg, rgba(232,184,109,0.07), rgba(56,199,147,0.04))", borderColor: "var(--gold-border)", padding: "3rem 2rem" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem", animation: "float 3s ease-in-out infinite" }}>🚀</div>
          <h2 style={{ fontSize: "1.9rem", fontWeight: 900, marginBottom: "0.75rem" }}>Prêt à te lancer ?</h2>
          <p style={{ color: "var(--text-muted)", marginBottom: "2rem", lineHeight: 1.6 }}>
            Gratuit pour commencer. 3 crédits offerts. Profil en 5 minutes.
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/auth/signup?role=artist" className="btn-gold" style={{ fontSize: "1rem", padding: "0.9rem 2rem" }}>
              Je suis artiste →
            </Link>
            <Link href="/auth/signup?role=recruiter" className="btn-green" style={{ fontSize: "1rem", padding: "0.9rem 2rem" }}>
              Je recrute →
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: "1px solid var(--border)", padding: "1.5rem 2rem" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <span className="nav-logo" style={{ fontSize: "1.1rem" }}>Castly</span>
          <p style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>© 2026 Castly — Tous droits réservés</p>
          <div style={{ display: "flex", gap: "1.5rem" }}>
            <Link href="/castings" style={{ color: "var(--text-muted)", fontSize: "0.82rem", textDecoration: "none" }}>Castings</Link>
            <Link href="/artists" style={{ color: "var(--text-muted)", fontSize: "0.82rem", textDecoration: "none" }}>Artistes</Link>
            <Link href="/auth/login" style={{ color: "var(--text-muted)", fontSize: "0.82rem", textDecoration: "none" }}>Connexion</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
