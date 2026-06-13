import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Castly — Trouve tes castings avec l'IA", template: "%s | Castly" },
  description: "La plateforme IA qui matche ton profil artistique avec les meilleures opportunités de casting en France. Acteurs, rappeurs, danseurs, mannequins — trouve les castings faits pour toi.",
  keywords: ["casting", "casting france", "casting acteur", "casting rappeur", "casting danseur", "casting mannequin", "agent artistique", "IA casting", "matching artistique"],
  authors: [{ name: "Castly" }],
  creator: "Castly",
  metadataBase: new URL("https://castly-chi.vercel.app"),
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://castly-chi.vercel.app",
    siteName: "Castly",
    title: "Castly — Trouve tes castings avec l'IA",
    description: "L'IA analyse ton profil artistique et te donne un score de compatibilité sur chaque casting. Artistes et recruteurs, le matching devient instantané.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Castly — Matching casting par IA" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Castly — Trouve tes castings avec l'IA",
    description: "L'IA analyse ton profil artistique et te donne un score de compatibilité sur chaque casting.",
    images: ["/og-image.png"],
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
