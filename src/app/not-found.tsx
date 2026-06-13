import Link from "next/link";

export default function NotFound() {
  return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)", padding: "2rem" }}>
      <div style={{ textAlign: "center", maxWidth: 480 }}>
        <div style={{ position: "relative", display: "inline-block", marginBottom: "2rem" }}>
          <div style={{ fontSize: "6rem", fontWeight: 900, color: "var(--gold)", opacity: 0.15, lineHeight: 1, letterSpacing: "-0.05em" }}>404</div>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "3rem" }}>🎭</div>
        </div>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 900, marginBottom: "0.75rem" }}>Cette page n&apos;existe pas</h1>
        <p style={{ color: "var(--text-muted)", lineHeight: 1.6, marginBottom: "2rem" }}>
          Le casting ou le profil que tu cherches a peut-être été supprimé, ou l&apos;URL est incorrecte.
        </p>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/castings" className="btn-gold">Voir les castings →</Link>
          <Link href="/" className="btn-outline">Retour à l&apos;accueil</Link>
        </div>
      </div>
    </main>
  );
}
