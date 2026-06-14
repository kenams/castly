import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Crédits Castly — Simple, transparent, sans abonnement",
  description: "Découvrez comment fonctionnent les crédits Castly. 3 crédits offerts à l'inscription. Sans abonnement, sans commission.",
};

const FAQS = [
  { q: "Les crédits expirent-ils ?", a: "Non. Tes crédits n'ont pas de date d'expiration. Tu les utilises quand tu veux, à ton rythme." },
  { q: "Puis-je partager mes crédits ?", a: "Les crédits sont liés à ton compte et ne peuvent pas être transférés à un autre utilisateur." },
  { q: "Y a-t-il un remboursement possible ?", a: "Les crédits achetés ne sont pas remboursables. Les 3 crédits offerts à l'inscription sont là pour te permettre de tester sans risque." },
];

export default function CreditsInfoPage() {
  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)", overflowX: "hidden" }}>

      {/* NAV minimal */}
      <nav className="nav scrolled">
        <Link href="/" className="nav-logo">Castly</Link>
        <div style={{ display: "flex", gap: "0.85rem", alignItems: "center" }}>
          <Link href="/castings" style={{ color: "var(--text-muted)", fontSize: "0.85rem", textDecoration: "none" }}>Castings</Link>
          <Link href="/auth/login" className="btn-outline" style={{ padding: "0.48rem 1.1rem", fontSize: "0.83rem" }}>Connexion</Link>
          <Link href="/auth/signup" className="btn-gold" style={{ padding: "0.48rem 1.2rem", fontSize: "0.83rem" }}>Commencer</Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ maxWidth: 720, margin: "0 auto", padding: "8rem 2rem 4rem", textAlign: "center" }}>
        <span className="pill" style={{ fontSize: "0.75rem", marginBottom: "1.5rem", display: "inline-flex" }}>💳 Crédits</span>
        <h1 style={{ fontSize: "clamp(2rem,5vw,3rem)", fontWeight: 900, letterSpacing: "-0.05em", lineHeight: 1.1, marginBottom: "1.25rem" }}>
          Les crédits Castly<br />
          <span className="text-gradient-gold">Simple, transparent, sans abonnement.</span>
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "1.05rem", lineHeight: 1.75, maxWidth: 520, margin: "0 auto" }}>
          Pas d&apos;abonnement mensuel, pas de surprise. Tu paies uniquement ce que tu utilises — et tu commences gratuitement.
        </p>
      </section>

      {/* PACKS */}
      <section style={{ maxWidth: 860, margin: "0 auto", padding: "0 2rem 5.5rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.25rem" }}>

          {/* Découverte */}
          <div className="card" style={{ padding: "2rem 1.75rem", display: "flex", flexDirection: "column", gap: "0.85rem", background: "var(--bg-2)" }}>
            <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Découverte</p>
            <div>
              <span style={{ fontSize: "2.5rem", fontWeight: 900, color: "var(--gold)", letterSpacing: "-0.05em" }}>3</span>
              <span style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginLeft: "0.4rem" }}>crédits</span>
            </div>
            <p style={{ fontSize: "1.4rem", fontWeight: 900 }}>GRATUIT</p>
            <p style={{ color: "var(--text-muted)", fontSize: "0.83rem", lineHeight: 1.6 }}>Offerts automatiquement à l&apos;inscription. Aucune CB requise.</p>
            <Link href="/auth/signup" className="btn-outline" style={{ textAlign: "center", marginTop: "auto" }}>Commencer gratuitement →</Link>
          </div>

          {/* Essentiel */}
          <div className="card" style={{ padding: "2rem 1.75rem", display: "flex", flexDirection: "column", gap: "0.85rem", background: "var(--bg-2)", border: "1px solid var(--gold-border)" }}>
            <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--gold)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Essentiel</p>
            <div>
              <span style={{ fontSize: "2.5rem", fontWeight: 900, color: "var(--gold)", letterSpacing: "-0.05em" }}>10</span>
              <span style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginLeft: "0.4rem" }}>crédits</span>
            </div>
            <p style={{ fontSize: "1.4rem", fontWeight: 900 }}>4,90€</p>
            <p style={{ color: "var(--text-muted)", fontSize: "0.83rem", lineHeight: 1.6 }}>Pour aller plus loin. Idéal pour les artistes actifs ou un premier casting à poster.</p>
            <Link href="/auth/signup" className="btn-gold" style={{ textAlign: "center", marginTop: "auto" }}>Obtenir 10 crédits →</Link>
          </div>

          {/* Pro */}
          <div className="card" style={{ padding: "2rem 1.75rem", display: "flex", flexDirection: "column", gap: "0.85rem", background: "var(--bg-2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--green)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Pro</p>
              <span className="pill-green pill" style={{ fontSize: "0.65rem" }}>Meilleur prix</span>
            </div>
            <div>
              <span style={{ fontSize: "2.5rem", fontWeight: 900, color: "var(--green)", letterSpacing: "-0.05em" }}>30</span>
              <span style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginLeft: "0.4rem" }}>crédits</span>
            </div>
            <p style={{ fontSize: "1.4rem", fontWeight: 900 }}>9,90€</p>
            <p style={{ color: "var(--text-muted)", fontSize: "0.83rem", lineHeight: 1.6 }}>Pour les recruteurs actifs ou les artistes qui ne veulent pas manquer d&apos;opportunités.</p>
            <Link href="/auth/signup" className="btn-green" style={{ textAlign: "center", marginTop: "auto" }}>Obtenir 30 crédits →</Link>
          </div>

        </div>
      </section>

      {/* 1 crédit = quoi ? */}
      <section style={{ background: "var(--bg-2)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 860, margin: "0 auto", padding: "5rem 2rem" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <span className="pill-muted pill" style={{ fontSize: "0.72rem", marginBottom: "1rem", display: "inline-flex" }}>Transparent</span>
            <h2 style={{ fontSize: "1.8rem", fontWeight: 900, letterSpacing: "-0.04em" }}>1 crédit = quoi exactement ?</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.25rem" }}>
            <div className="card" style={{ padding: "1.75rem", display: "flex", gap: "1rem", alignItems: "flex-start" }}>
              <div className="icon-circle icon-circle-gold" style={{ fontSize: "1.3rem", width: 48, height: 48, flexShrink: 0 }}>🎬</div>
              <div>
                <p style={{ fontWeight: 800, fontSize: "0.95rem", marginBottom: "0.4rem" }}>Pour les recruteurs</p>
                <p style={{ color: "var(--text-muted)", fontSize: "0.87rem", lineHeight: 1.65 }}>
                  <strong style={{ color: "var(--gold)" }}>1 crédit = 1 email d&apos;artiste révélé.</strong>{" "}
                  Voir les profils et les scores est gratuit. Tu dépenses 1 crédit uniquement quand tu veux contacter un artiste directement.
                </p>
              </div>
            </div>
            <div className="card" style={{ padding: "1.75rem", display: "flex", gap: "1rem", alignItems: "flex-start" }}>
              <div className="icon-circle icon-circle-green" style={{ fontSize: "1.3rem", width: 48, height: 48, flexShrink: 0 }}>🎤</div>
              <div>
                <p style={{ fontWeight: 800, fontSize: "0.95rem", marginBottom: "0.4rem" }}>Pour les artistes</p>
                <p style={{ color: "var(--text-muted)", fontSize: "0.87rem", lineHeight: 1.65 }}>
                  <strong style={{ color: "var(--green)" }}>1 crédit = accès au contact direct d&apos;une offre premium.</strong>{" "}
                  Les castings standards sont accessibles librement. Les offres premium (label, marque nationale) nécessitent 1 crédit.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ maxWidth: 680, margin: "0 auto", padding: "5.5rem 2rem 0" }}>
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <span className="pill-muted pill" style={{ fontSize: "0.72rem", marginBottom: "1rem", display: "inline-flex" }}>Questions</span>
          <h2 style={{ fontSize: "1.8rem", fontWeight: 900, letterSpacing: "-0.04em" }}>Questions fréquentes</h2>
        </div>
        <div style={{ display: "grid", gap: "0.75rem" }}>
          {FAQS.map((faq) => (
            <div key={faq.q} className="card" style={{ padding: "1.25rem 1.4rem", background: "var(--bg-2)" }}>
              <p style={{ fontWeight: 700, fontSize: "0.92rem", marginBottom: "0.6rem" }}>{faq.q}</p>
              <p style={{ color: "var(--text-muted)", fontSize: "0.87rem", lineHeight: 1.7 }}>{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ maxWidth: 600, margin: "0 auto", padding: "5.5rem 2rem 7rem", textAlign: "center" }}>
        <div className="card" style={{ background: "linear-gradient(135deg,rgba(232,184,109,0.06),rgba(56,199,147,0.03))", borderColor: "var(--gold-border)", padding: "3rem 2rem" }}>
          <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>🚀</div>
          <h2 style={{ fontSize: "1.6rem", fontWeight: 900, letterSpacing: "-0.04em", marginBottom: "0.75rem" }}>Commencer gratuitement</h2>
          <p style={{ color: "var(--text-muted)", marginBottom: "2rem", lineHeight: 1.7, fontSize: "0.92rem" }}>
            3 crédits offerts dès l&apos;inscription. Aucune CB. Profil en 5 minutes.
          </p>
          <Link href="/auth/signup" className="btn-gold" style={{ fontSize: "0.95rem", padding: "0.85rem 2rem" }}>
            Créer mon compte gratuit →
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: "1px solid var(--border)", padding: "1.5rem 2rem", background: "var(--bg-2)" }}>
        <div style={{ maxWidth: 920, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <span className="nav-logo" style={{ fontSize: "1.1rem" }}>Castly</span>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
            <p style={{ color: "var(--text-faint)", fontSize: "0.78rem" }}>© 2026 Castly — Tous droits réservés</p>
            <a href="https://kah-digital.ch" target="_blank" rel="noopener noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", fontSize: "0.75rem", color: "var(--text-faint)", textDecoration: "none", transition: "color 0.15s" }}
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)", borderRadius: "999px", padding: "0.3rem 0.8rem" }}>
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "linear-gradient(135deg, #e8b86d, #c48f38)", display: "inline-block" }} />
                Une production <strong style={{ color: "var(--text-muted)" }}>KAH Digital</strong>
              </span>
            </a>
          </div>
          <div style={{ display: "flex", gap: "1.5rem" }}>
            {[["Castings", "/castings"], ["Artistes", "/artists"], ["Connexion", "/auth/login"]].map(([l, h]) => (
              <Link key={h} href={h} style={{ color: "var(--text-muted)", fontSize: "0.8rem", textDecoration: "none" }}>{l}</Link>
            ))}
          </div>
        </div>
      </footer>
    </main>
  );
}
