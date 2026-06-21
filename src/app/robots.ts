import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/castings", "/artists"],
        disallow: ["/dashboard", "/onboarding", "/recruiter", "/api", "/auth"],
      },
    ],
    sitemap: "https://castly.kah-digital.ch/sitemap.xml",
  };
}
