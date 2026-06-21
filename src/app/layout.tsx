import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Castly — Le bon casting, sans l'attente",
  description: "Castly connecte artistes et recruteurs sans agent ni commission. Acteur, rappeur, danseur, mannequin — trouve les castings faits pour toi en quelques minutes.",
  authors: [{ name: "KAH Digital", url: "https://kah-digital.ch" }],
  keywords: ["casting", "artiste", "recruteur", "clip", "mannequin", "danseur", "rappeur", "acteur", "casting France", "plateforme casting"],
  metadataBase: new URL("https://castly.kah-digital.ch"),
  openGraph: {
    title: "Castly — Le bon casting, sans l'attente",
    description: "La plateforme qui connecte artistes et recruteurs. Profil gratuit, contact direct, sans agence.",
    url: "https://castly.kah-digital.ch",
    siteName: "Castly",
    type: "website",
    locale: "fr_FR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Castly — Le bon casting, sans l'attente",
    description: "La plateforme qui connecte artistes et recruteurs. Profil gratuit, contact direct, sans agence.",
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="canonical" href="https://castly.kah-digital.ch" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
