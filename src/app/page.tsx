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
  { icon: "✍️", title: "Crée ton profil en 5 min", desc: "Type, style, expérience, mensurations. Une fois, c'est fait." },
  { icon: "🔍", title: "On cherche à ta place", desc: "Des dizaines de castings analysés en continu — tu ne rates plus rien." },
  { icon: "🎯", title: "Tu vois pourquoi tu matches", desc: "Chaque offre a un score expliqué. Plus de devinettes." },
  { icon: "📧", title: "Postule en 1 clic", desc: "Contact direct, sans intermédiaire, sans agent à la commission." },
];

const STEPS_RECRUITER = [
  { icon: "📝", title: "Décris ton projet", desc: "Brief en 3 étapes : projet, profil recherché, critères physiques." },
  { icon: "⚡", title: "Les meilleurs profils remontent", desc: "Tous les artistes classés et scorés en quelques secondes." },
  { icon: "📊", title: "Tu comprends pourquoi ils matchent", desc: "Score détaillé + raisons claires pour chaque candidat." },
  { icon: "📧", title: "Contact direct, sans intermédiaire", desc: "L'email de l'artiste révélé avec 1 crédit. Pas d'agence." },
];

const FAQS = [
  { q: "C'est gratuit ?", a: "Oui. Créer ton profil et voir les castings est 100% gratuit. Tu utilises des crédits uniquement pour contacter un artiste (recruteurs) ou accéder à une offre directe." },
  { q: "C'est quoi les crédits ?", a: "3 crédits offerts à l'inscription. 1 crédit = 1 contact révélé (email de l'artiste ou lien direct de l'offre). Tu peux en racheter sans abonnement." },
  { q: "Faut-il un agent ou un CV ?", a: "Non. Castly remplace l'agent pour les artistes indépendants. Ton profil Castly est ton book numérique." },
  { q: "Quels types de castings ?", a: "Clips, films, séries, publicités, événements, showcases, collaborations musicales — 8 catégories d'artistes supportées." },
  { q: "Comment ça marche pour les recruteurs ?", a: "Tu postes un brief (3 min), tu reçois une liste d'artistes scorés et classés, tu contactes ceux qui t'intéressent. Pas d'intermédiaire, pas de commission." },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      onClick={() => setOpen(!open)}
      style={{
        borderRadius: "0.875rem", border: "1px solid var(--border)",
        background: open ? "rgba(255,255,255,0.03)" : "var(--bg-2)",
        padding: "1.1rem 1.4rem", cursor: "pointer",
        transition: "background 0.2s, border-color 0.2s",
        borderColor: open ? "var(--gold-border)" : "var(--border)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
        <p style={{ fontWeight: 700, fontSize: "0.92rem", letterSpacing: "-0.01em" }}>{q}</p>
        <span style={{ color: "var(--gold)", fontWeight: 900, fontSize: "1.1rem", flexShrink: 0, transition: "transform 0.2s", transform: open ? "rotate(45deg)" : "none" }}>+</span>
      </div>
      {open && (
        <p style={{ marginTop: "0.75rem", color: "var(--text-muted)", fontSize: "0.87rem", lineHeight: 1.7 }}>{a}</p>
      )}
    </div>
  );
}

function Counter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [val, setVal] = useState(target);
  const [animated, setAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (animated) return;
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect(); setAnimated(true); setVal(0);
      let start = 0;
      const step = Math.ceil(target / 40);
      const t = setInterval(() => {
        start = Math.min(start + step, target);
        setVal(start);
        if (start >= target) clearInterval(t);
      }, 28);
    }, { threshold: 0.4 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target, animated]);
  return <span ref={ref}>{val}{suffix}</span>;
}

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<"artist" | "recruiter">("artist");
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    createClient().auth.getUser().then((r: Awaited<ReturnType<ReturnType<typeof createClient>["auth"]["getUser"]>>) => setIsLoggedIn(!!r.data.user));
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const steps = activeTab === "artist" ? STEPS_ARTIST : STEPS_RECRUITER;

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)", overflowX: "hidden" }}>

      {/* NAV */}
      <nav className={`nav${scrolled ? " scrolled" : ""}`}>
        <Link href="/" className="nav-logo">Castly</Link>
        {/* Desktop links */}
        <div className="nav-links-desktop" style={{ display: "flex", gap: "0.6rem", alignItems: "center" }}>
          <Link href="/castings" style={{ color: "var(--text-muted)", fontSize: "0.85rem", textDecoration: "none", padding: "0.4rem 0.7rem", transition: "color 0.15s" }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--text)")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}>
            Castings
          </Link>
          <Link href="/artists" style={{ color: "var(--text-muted)", fontSize: "0.85rem", textDecoration: "none", padding: "0.4rem 0.7rem", transition: "color 0.15s" }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--text)")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}>
            Artistes
          </Link>
          {isLoggedIn ? (
            <Link href="/dashboard" className="btn-gold" style={{ padding: "0.5rem 1.2rem", fontSize: "0.83rem" }}>Dashboard →</Link>
          ) : (
            <>
              <Link href="/auth/login" className="btn-outline" style={{ padding: "0.48rem 1.1rem", fontSize: "0.83rem" }}>Connexion</Link>
              <Link href="/auth/signup" className="btn-gold" style={{ padding: "0.48rem 1.2rem", fontSize: "0.83rem" }}>Commencer</Link>
            </>
          )}
        </div>
        {/* Mobile hamburger */}
        <button className="nav-hamburger" onClick={() => setMenuOpen(true)} aria-label="Menu">
          <span /><span /><span />
        </button>
        {/* Mobile menu overlay */}
        <div className={`nav-mobile-menu ${menuOpen ? "open" : ""}`}>
          <button className="nav-mobile-close" onClick={() => setMenuOpen(false)}>✕</button>
          <Link href="/castings" onClick={() => setMenuOpen(false)}>Castings</Link>
          <Link href="/artists" onClick={() => setMenuOpen(false)}>Artistes</Link>
          {isLoggedIn ? (
            <Link href="/dashboard" className="btn-gold" onClick={() => setMenuOpen(false)}>Dashboard →</Link>
          ) : (
            <>
              <Link href="/auth/login" className="btn-outline" onClick={() => setMenuOpen(false)}>Connexion</Link>
              <Link href="/auth/signup" className="btn-gold" onClick={() => setMenuOpen(false)}>Commencer</Link>
            </>
          )}
        </div>
      </nav>

      {/* HERO */}
      <section style={{ position: "relative", minHeight: "92vh", display: "flex", alignItems: "center", overflow: "hidden" }}>
        {/* Full background video */}
        <video
          autoPlay
          muted
          loop
          playsInline
          style={{
            position: "absolute", top: 0, left: 0,
            width: "100%", height: "100%", objectFit: "cover",
            opacity: 0.18, pointerEvents: "none", zIndex: 0,
          }}
        >
          <source src="/hero.mp4" type="video/mp4" />
        </video>
        {/* Dark overlay gradient */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
          background: "linear-gradient(to bottom, rgba(7,7,15,0.55) 0%, rgba(7,7,15,0.3) 50%, rgba(7,7,15,0.75) 100%)",
        }} />
        {/* Orbs */}
        <div className="orb" style={{ width: 600, height: 600, background: "rgba(232,184,109,0.055)", top: -280, left: "50%", marginLeft: -300, zIndex: 1 }} />
        <div className="orb" style={{ width: 320, height: 320, background: "rgba(56,199,147,0.045)", top: 80, right: -80, animationDelay: "-6s", zIndex: 1 }} />
        <div className="orb" style={{ width: 240, height: 240, background: "rgba(232,184,109,0.04)", bottom: -60, left: -60, animationDelay: "-10s", zIndex: 1 }} />

        <div style={{ position: "relative", zIndex: 2, maxWidth: 1040, margin: "0 auto", padding: "8rem 2rem 5rem", textAlign: "center", width: "100%" }}>
        <div className="animate-fade-up" style={{ marginBottom: "1.75rem" }}>
          <span className="pill" style={{ fontSize: "0.75rem" }}>
            🎬 La plateforme casting qui bosse pour toi
          </span>
        </div>

        <h1 className="animate-fade-up-2" style={{
          fontSize: "clamp(2.8rem,7.5vw,5rem)", fontWeight: 900,
          lineHeight: 1.02, letterSpacing: "-0.055em", marginBottom: "1.5rem",
        }}>
          Le bon casting.<br />
          <span className="text-gradient-gold">Sans l&apos;attente.</span>
        </h1>

        <p className="animate-fade-up-3" style={{
          fontSize: "1.08rem", color: "var(--text-muted)", maxWidth: 520,
          margin: "0 auto 3.5rem", lineHeight: 1.75,
        }}>
          Artiste — on trouve les offres qui te correspondent vraiment.<br />
          Recruteur — le bon profil en quelques minutes, pas en plusieurs jours.
        </p>

        {/* DUAL PATH */}
        <div className="animate-fade-up-4 grid-2" style={{ maxWidth: 780, margin: "0 auto" }}>
          <Link href="/auth/signup?role=artist" className="path-card path-card-gold" style={{ textAlign: "left" }}>
            <div style={{ fontSize: "2.2rem", marginBottom: "1.1rem", display: "block", animation: "float 5s ease-in-out infinite" }}>🎤</div>
            <p style={{ fontSize: "1.05rem", fontWeight: 800, marginBottom: "0.5rem", letterSpacing: "-0.02em" }}>
              Je suis <span className="text-gradient-gold">artiste</span>
            </p>
            <p style={{ fontSize: "0.87rem", color: "var(--text-muted)", lineHeight: 1.65, marginBottom: "1.5rem" }}>
              Acteur, rappeur, danseur, mannequin… Crée ton profil une fois et reçois uniquement les castings qui matchent vraiment avec toi.
            </p>
            <span className="btn-gold" style={{ fontSize: "0.82rem", padding: "0.55rem 1.2rem" }}>
              Créer mon profil gratuit →
            </span>
          </Link>

          <Link href="/auth/signup?role=recruiter" className="path-card path-card-green" style={{ textAlign: "left" }}>
            <div style={{ fontSize: "2.2rem", marginBottom: "1.1rem", display: "block", animation: "float 5s 1s ease-in-out infinite" }}>🎬</div>
            <p style={{ fontSize: "1.05rem", fontWeight: 800, marginBottom: "0.5rem", letterSpacing: "-0.02em" }}>
              Je <span className="text-gradient-green">recrute</span>
            </p>
            <p style={{ fontSize: "0.87rem", color: "var(--text-muted)", lineHeight: 1.65, marginBottom: "1.5rem" }}>
              Producteur, agence, label, brand… Décris ton projet et reçois une shortlist de profils prêts à être contactés.
            </p>
            <span className="btn-green" style={{ fontSize: "0.82rem", padding: "0.55rem 1.2rem" }}>
              Trouver le bon profil →
            </span>
          </Link>
        </div>

        {/* SOCIAL PROOF INLINE */}
        <p style={{ marginTop: "2rem", fontSize: "0.8rem", color: "var(--text-faint)" }}>
          3 crédits offerts à l&apos;inscription · Profil en 5 min · Sans CB
        </p>
        </div>{/* /content wrapper */}
      </section>

      {/* STATS BAR */}
      <section style={{ borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", background: "var(--bg-2)" }}>
        <div className="grid-4" style={{ maxWidth: 860, margin: "0 auto", padding: "1.75rem 2rem", textAlign: "center" }}>
          {[
            { val: 33, suffix: "+", label: "castings ouverts", color: "var(--gold)" },
            { val: 100, suffix: "%", label: "matching IA", color: "var(--green)" },
            { val: 3, suffix: " crédits", label: "offerts à l'inscription", color: "var(--gold)" },
            { val: 8, suffix: " types", label: "d'artistes supportés", color: "var(--green)" },
          ].map(s => (
            <div key={s.label}>
              <div style={{ fontSize: "1.9rem", fontWeight: 900, color: s.color, letterSpacing: "-0.04em", lineHeight: 1 }}>
                <Counter target={s.val} suffix={s.suffix} />
              </div>
              <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "0.3rem" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* TICKER */}
      <section style={{ padding: "2rem 0", borderBottom: "1px solid var(--border)", overflow: "hidden" }}>
        <div className="ticker-wrap">
          <div className="ticker-track">
            {[...ARTIST_TYPES, ...ARTIST_TYPES].map((t, i) => (
              <div key={i} style={{
                display: "inline-flex", alignItems: "center", gap: "0.45rem",
                marginRight: "2rem", padding: "0.45rem 1.1rem", borderRadius: "999px",
                border: `1px solid ${t.color === "gold" ? "var(--gold-border)" : "var(--green-border)"}`,
                background: t.color === "gold" ? "var(--gold-dim)" : "var(--green-dim)",
                color: t.color === "gold" ? "var(--gold)" : "var(--green)",
                fontSize: "0.83rem", fontWeight: 600, whiteSpace: "nowrap",
              }}>
                <span>{t.icon}</span> {t.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMMENT ÇA MARCHE */}
      <section style={{ maxWidth: 920, margin: "0 auto", padding: "5.5rem 2rem" }}>
        <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
          <span className="pill-muted pill" style={{ fontSize: "0.72rem", marginBottom: "1rem", display: "inline-flex" }}>Simple</span>
          <h2 style={{ fontSize: "2rem", fontWeight: 900, letterSpacing: "-0.04em", marginBottom: "1.5rem" }}>Comment ça marche</h2>
          <div style={{ display: "inline-flex", background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", borderRadius: "999px", padding: "4px", gap: "3px" }}>
            {(["artist", "recruiter"] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{
                padding: "0.48rem 1.3rem", borderRadius: "999px", border: "none", cursor: "pointer",
                fontWeight: 700, fontSize: "0.83rem", transition: "all 0.2s",
                background: activeTab === tab
                  ? tab === "artist" ? "linear-gradient(135deg,#e8b86d,#d4a050)" : "linear-gradient(135deg,#38c793,#2aab7e)"
                  : "transparent",
                color: activeTab === tab ? "#07070f" : "var(--text-muted)",
              }}>
                {tab === "artist" ? "🎤 Artiste" : "🎬 Recruteur"}
              </button>
            ))}
          </div>
        </div>

        <div className="grid-4">
          {steps.map((s, i) => (
            <div key={s.title} className="card card-hover animate-fade-up" style={{ animationDelay: `${i * 0.08}s`, textAlign: "center", padding: "1.75rem 1.25rem" }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem" }}>
                <div className={`icon-circle ${activeTab === "artist" ? "icon-circle-gold" : "icon-circle-green"}`} style={{ fontSize: "1.5rem" }}>
                  {s.icon}
                </div>
              </div>
              <div style={{
                width: 24, height: 24, borderRadius: "50%",
                background: activeTab === "artist" ? "var(--gold-dim)" : "var(--green-dim)",
                border: `1px solid ${activeTab === "artist" ? "var(--gold-border)" : "var(--green-border)"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 800, color: activeTab === "artist" ? "var(--gold)" : "var(--green)",
                fontSize: "0.72rem", margin: "0 auto 0.85rem",
              }}>{i + 1}</div>
              <h3 style={{ fontWeight: 700, fontSize: "0.92rem", marginBottom: "0.4rem", letterSpacing: "-0.01em" }}>{s.title}</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.82rem", lineHeight: 1.65 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES SPLIT — Artiste */}
      <section style={{ borderTop: "1px solid var(--border)", background: "var(--bg-2)" }}>
        <div className="grid-split" style={{ maxWidth: 920, margin: "0 auto", padding: "5.5rem 2rem" }}>
          <div>
            <span className="pill" style={{ marginBottom: "1.25rem", display: "inline-flex", fontSize: "0.72rem" }}>🎤 Pour les artistes</span>
            <h2 style={{ fontSize: "1.75rem", fontWeight: 900, lineHeight: 1.2, letterSpacing: "-0.04em", marginBottom: "0.85rem" }}>
              Fini de chercher<br /><span className="text-gradient-gold">les castings un par un.</span>
            </h2>
            <p style={{ color: "var(--text-muted)", lineHeight: 1.75, marginBottom: "2rem", fontSize: "0.92rem" }}>
              Crée ton profil une fois. Castly surveille en continu les offres et te remonte uniquement celles qui te correspondent — avec une explication claire pour chacune.
            </p>
            <div style={{ display: "grid", gap: "0.65rem", marginBottom: "2.25rem" }}>
              {["Score 0-100 sur chaque casting", "Raisons du match expliquées", "Filtres par type, ville, rémunération", "Accès direct à l'offre originale"].map(f => (
                <div key={f} style={{ display: "flex", gap: "0.6rem", alignItems: "center", fontSize: "0.87rem" }}>
                  <span style={{ color: "var(--gold)", fontWeight: 800, fontSize: "0.8rem" }}>✓</span>
                  <span style={{ color: "var(--text-2)" }}>{f}</span>
                </div>
              ))}
            </div>
            <Link href="/auth/signup?role=artist" className="btn-gold">Créer mon profil gratuit →</Link>
          </div>
          <div style={{ display: "grid", gap: "0.65rem" }}>
            {[
              { score: 94, type: "🎤 Rappeur", title: "Rappeur trap pour clip officiel", loc: "Paris", days: "20j", paid: true },
              { score: 78, type: "🎤 Chanteur", title: "Feat R&B artiste signé Universal", loc: "Paris", days: "14j", paid: true },
              { score: 61, type: "💃 Danseur", title: "Danseur hip-hop clip rappeur signé", loc: "Paris", days: "11j", paid: true },
            ].map((c, i) => (
              <div key={c.title} className="card" style={{ display: "flex", gap: "0.9rem", alignItems: "center", padding: "1rem 1.2rem", animationDelay: `${i * 0.1}s` }}>
                <div className={`score-badge ${c.score >= 70 ? "score-high" : "score-mid"}`} style={{ width: 44, height: 44, fontSize: "0.88rem" }}>{c.score}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 700, fontSize: "0.85rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: "0.2rem" }}>{c.title}</p>
                  <div style={{ display: "flex", gap: "0.6rem", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    <span>{c.type}</span><span>📍 {c.loc}</span><span>{c.days}</span>
                  </div>
                </div>
                {c.paid && <span className="pill-green pill" style={{ fontSize: "0.68rem", flexShrink: 0 }}>Rémunéré</span>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES SPLIT — Recruteur */}
      <section style={{ borderTop: "1px solid var(--border)" }}>
        <div className="grid-split" style={{ maxWidth: 920, margin: "0 auto", padding: "5.5rem 2rem" }}>
          <div style={{ display: "grid", gap: "0.65rem" }}>
            {[
              { icon: "📝", title: "Brief en 3 étapes", desc: "Décris ton projet, le profil et les critères physiques." },
              { icon: "⚡", title: "Matching IA en secondes", desc: "L'IA analyse tous les profils et sort les meilleurs." },
              { icon: "📧", title: "Contact direct 1 crédit", desc: "Email de l'artiste révélé. Pas d'intermédiaire." },
            ].map(f => (
              <div key={f.title} className="card" style={{ display: "flex", gap: "1rem", alignItems: "flex-start", padding: "1.1rem 1.25rem" }}>
                <div className="icon-circle icon-circle-green" style={{ fontSize: "1.1rem", width: 42, height: 42, flexShrink: 0 }}>{f.icon}</div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: "0.88rem", marginBottom: "0.2rem", letterSpacing: "-0.01em" }}>{f.title}</p>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", lineHeight: 1.55 }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div>
            <span className="pill-green pill" style={{ marginBottom: "1.25rem", display: "inline-flex", fontSize: "0.72rem" }}>🎬 Pour les recruteurs</span>
            <h2 style={{ fontSize: "1.75rem", fontWeight: 900, lineHeight: 1.2, letterSpacing: "-0.04em", marginBottom: "0.85rem" }}>
              Le bon talent,<br /><span className="text-gradient-green">sans scroller Instagram.</span>
            </h2>
            <p style={{ color: "var(--text-muted)", lineHeight: 1.75, marginBottom: "2.25rem", fontSize: "0.92rem" }}>
              Décrivez votre projet en 3 minutes. Vous recevez une shortlist de profils classés, avec les raisons du match — prêts à être contactés directement, sans agence, sans commission.
            </p>
            <Link href="/auth/signup?role=recruiter" className="btn-green">Créer un compte recruteur →</Link>
          </div>
        </div>
      </section>

      {/* PARTENAIRES */}
      <section style={{ background: "var(--bg-2)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
        <div className="grid-split" style={{ maxWidth: 920, margin: "0 auto", padding: "4.5rem 2rem" }}>
          <div>
            <span className="pill" style={{ marginBottom: "1.25rem", display: "inline-flex", fontSize: "0.72rem" }}>★ Partenaires Castly</span>
            <h2 style={{ fontSize: "1.6rem", fontWeight: 900, letterSpacing: "-0.04em", marginBottom: "0.75rem" }}>Vous proposez des castings ?</h2>
            <p style={{ color: "var(--text-muted)", lineHeight: 1.75, marginBottom: "1.75rem", fontSize: "0.92rem" }}>
              Vos offres en tête devant des milliers d&apos;artistes ciblés avec le badge <strong style={{ color: "var(--gold)" }}>★ Partenaire</strong>.
            </p>
            <a href="mailto:contact@castly.fr" className="btn-outline">Devenir partenaire →</a>
          </div>
          <div style={{ display: "grid", gap: "0.65rem" }}>
            {[
              { icon: "🎯", t: "Ciblage précis", d: "Vos castings atteignent les profils compatibles en priorité." },
              { icon: "⚡", t: "Badge partenaire", d: "Priorité dans le scoring + badge visible sur chaque offre." },
              { icon: "📊", t: "Stats en temps réel", d: "Vues, clics, postulations — dashboard complet." },
            ].map(f => (
              <div key={f.t} className="card" style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start", padding: "1rem 1.2rem" }}>
                <span style={{ fontSize: "1.1rem", marginTop: "0.05rem" }}>{f.icon}</span>
                <div>
                  <p style={{ fontWeight: 700, fontSize: "0.87rem", marginBottom: "0.15rem" }}>{f.t}</p>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", lineHeight: 1.5 }}>{f.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ maxWidth: 720, margin: "0 auto", padding: "5.5rem 2rem 0" }}>
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <span className="pill-muted pill" style={{ fontSize: "0.72rem", marginBottom: "1rem", display: "inline-flex" }}>Questions fréquentes</span>
          <h2 style={{ fontSize: "1.8rem", fontWeight: 900, letterSpacing: "-0.04em" }}>Tout ce que tu veux savoir</h2>
        </div>
        <div style={{ display: "grid", gap: "0.75rem" }}>
          {FAQS.map((faq) => (
            <FaqItem key={faq.q} q={faq.q} a={faq.a} />
          ))}
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{ maxWidth: 680, margin: "0 auto", padding: "5.5rem 2rem 7rem", textAlign: "center" }}>
        <div className="card" style={{
          background: "linear-gradient(135deg,rgba(232,184,109,0.06),rgba(56,199,147,0.03))",
          borderColor: "var(--gold-border)", padding: "3.5rem 2.5rem",
          position: "relative", overflow: "hidden",
        }}>
          <div className="orb" style={{ width: 300, height: 300, background: "rgba(232,184,109,0.06)", top: -120, left: "50%", marginLeft: -150, filter: "blur(60px)", position: "absolute" }} />
          <div style={{ position: "relative" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "1.25rem", animation: "float 4s ease-in-out infinite" }}>🚀</div>
            <h2 style={{ fontSize: "2rem", fontWeight: 900, letterSpacing: "-0.04em", marginBottom: "0.75rem" }}>Ton prochain casting t&apos;attend.</h2>
            <p style={{ color: "var(--text-muted)", marginBottom: "2.5rem", lineHeight: 1.7, fontSize: "0.95rem" }}>
              Gratuit pour commencer. 3 crédits offerts dès l&apos;inscription. Profil créé en 5 minutes.
            </p>
            <div style={{ display: "flex", gap: "0.85rem", justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/auth/signup?role=artist" className="btn-gold" style={{ fontSize: "0.95rem", padding: "0.85rem 1.85rem" }}>
                Je suis artiste →
              </Link>
              <Link href="/auth/signup?role=recruiter" className="btn-green" style={{ fontSize: "0.95rem", padding: "0.85rem 1.85rem" }}>
                Je recrute →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: "1px solid var(--border)", padding: "1.5rem 2rem", background: "var(--bg-2)" }}>
        <div style={{ maxWidth: 920, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <span className="nav-logo" style={{ fontSize: "1.1rem" }}>Castly</span>
          <p style={{ color: "var(--text-faint)", fontSize: "0.78rem" }}>© 2026 Castly — Tous droits réservés</p>
          <div style={{ display: "flex", gap: "1.5rem" }}>
            {[["Castings", "/castings"], ["Artistes", "/artists"], ["Connexion", "/auth/login"]].map(([l, h]) => (
              <Link key={h} href={h} style={{ color: "var(--text-muted)", fontSize: "0.8rem", textDecoration: "none" }}
                onMouseEnter={e => (e.currentTarget.style.color = "var(--text-2)")}
                onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}>
                {l}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </main>
  );
}
