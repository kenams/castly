import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import Anthropic from "@anthropic-ai/sdk";
import type { CastlyBrief, CastlyProfile } from "@/types";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function scoreBriefToProfile(brief: CastlyBrief, profile: CastlyProfile): Promise<{ score: number; reasons: string[]; blockers: string[] }> {
  const prompt = `Tu es un expert casting. Évalue la compatibilité entre ce brief de projet et ce profil d'artiste.

BRIEF:
- Titre: ${brief.title}
- Type de projet: ${brief.project_type}
- Types d'artistes recherchés: ${brief.artist_types.join(", ")}
- Style recherché: ${brief.style_tags.join(", ") || "non précisé"}
- Compétences requises: ${brief.required_skills.join(", ") || "aucune spécifiée"}
- Genre requis: ${brief.required_gender || "tous"}
- Âge: ${brief.age_min ?? "?"}-${brief.age_max ?? "?"} ans
- Lieu: ${brief.location ?? "non précisé"}${brief.is_remote ? " (remote possible)" : ""}
- Budget: ${brief.budget_range ?? "non précisé"}
- Description: ${brief.description ?? "aucune"}

PROFIL ARTISTE:
- Nom: ${profile.display_name}
- Types: ${profile.artist_type.join(", ")}
- Style: ${profile.style_tags.join(", ") || "non précisé"}
- Genre: ${profile.gender ?? "non précisé"}
- Année de naissance: ${profile.birth_year ?? "non précisé"}
- Ville: ${profile.city ?? "non précisée"}
- Taille: ${profile.height_cm ?? "non précisée"} cm
- Yeux: ${profile.eye_color ?? "non précisé"}, Cheveux: ${profile.hair_color ?? "non précisés"}
- Compétences: ${profile.skills.join(", ") || "aucune"}
- Expérience: ${profile.experience_years} ans
- Bio: ${profile.bio ?? "aucune"}
- Tarif jour: ${profile.day_rate_eur ? profile.day_rate_eur + "€" : "non précisé"}

Réponds UNIQUEMENT en JSON:
{"score": 0-100, "reasons": ["raison courte 1", "raison courte 2"], "blockers": ["bloquant 1"]}

score = compatibilité globale. reasons = points forts (max 3). blockers = points manquants critiques (max 2).`;

  const res = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 250,
    messages: [{ role: "user", content: prompt }],
  });
  try {
    const text = res.content[0].type === "text" ? res.content[0].text : "{}";
    const json = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] ?? "{}");
    return { score: Math.min(100, Math.max(0, json.score ?? 0)), reasons: json.reasons ?? [], blockers: json.blockers ?? [] };
  } catch { return { score: 0, reasons: [], blockers: [] }; }
}

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: brief } = await supabase.from("castly_briefs")
    .select("*, recruiter:castly_recruiters!inner(user_id)")
    .eq("id", id)
    .single() as { data: (CastlyBrief & { recruiter: { user_id: string } }) | null };
  if (!brief || (brief.recruiter as { user_id: string }).user_id !== user.id)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data: profiles } = await supabase.from("castly_profiles")
    .select("*")
    .eq("is_visible", true)
    .eq("is_complete", true)
    .eq("role", "artist")
    .overlaps("artist_type", brief.artist_types.length ? brief.artist_types : ["actor","singer","rapper","dancer","model","musician"])
    .limit(30);

  if (!profiles?.length) return NextResponse.json({ matched: 0, message: "No visible artists" });

  const { data: existing } = await supabase.from("castly_brief_matches")
    .select("profile_id").eq("brief_id", id);
  const matchedIds = new Set((existing ?? []).map((m: { profile_id: string }) => m.profile_id));
  const toScore = (profiles as CastlyProfile[]).filter(p => !matchedIds.has(p.id));

  if (!toScore.length) return NextResponse.json({ matched: 0, message: "All profiles already matched" });

  const results = await Promise.all(
    toScore.map(async profile => {
      const r = await scoreBriefToProfile(brief as CastlyBrief, profile);
      return { profile_id: profile.id, ...r };
    })
  );

  const toInsert = results
    .filter(r => r.score >= 20)
    .sort((a, b) => b.score - a.score)
    .map(r => ({
      brief_id: id,
      profile_id: r.profile_id,
      match_score: r.score,
      match_reasons: r.reasons,
      match_blockers: r.blockers,
      status: "new",
    }));

  if (toInsert.length) await supabase.from("castly_brief_matches").insert(toInsert);
  return NextResponse.json({ matched: toInsert.length, total: results.length });
}
