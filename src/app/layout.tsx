import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Castly — Trouve tes castings avec l'IA",
  description: "La plateforme IA qui matche ton profil artistique avec les meilleures opportunités de casting en France.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
