import { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

const BASE = "https://castly.kah-digital.ch";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();

  const [{ data: castings }, { data: artists }] = await Promise.all([
    supabase.from("castly_castings").select("id, updated_at").eq("status", "open").limit(200),
    supabase.from("castly_profiles").select("id, updated_at").eq("is_visible", true).limit(200),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${BASE}/castings`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.9 },
    { url: `${BASE}/artists`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE}/auth/signup`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
  ];

  const castingPages: MetadataRoute.Sitemap = (castings ?? []).map(c => ({
    url: `${BASE}/castings/${c.id}`,
    lastModified: new Date(c.updated_at),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const artistPages: MetadataRoute.Sitemap = (artists ?? []).map(a => ({
    url: `${BASE}/artists/${a.id}`,
    lastModified: new Date(a.updated_at),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...castingPages, ...artistPages];
}
