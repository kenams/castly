import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { batchMatchProfile } from "@/lib/matching";
import { generateDemoCastings } from "@/lib/scraper";
import type { CastlyProfile, CastlyCasting } from "@/types";

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const admin = createServiceClient();

    // Get profile
    const { data: profile, error: profileError } = await admin
      .from("castly_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (!profile) return NextResponse.json({ error: "No profile", userId: user.id, dbError: profileError?.message }, { status: 400 });

    // Seed demo castings if none exist
    const { count } = await admin
      .from("castly_castings")
      .select("id", { count: "exact", head: true })
      .eq("status", "open");

    if (!count || count === 0) {
      const demos = generateDemoCastings();
      await admin.from("castly_castings").upsert(
        demos.map(d => ({
          source_name: d.source_name,
          source_url: d.source_url,
          external_id: d.external_id,
          title: d.title,
          description: d.description,
          location: d.location ?? null,
          casting_type: d.casting_type,
          age_min: d.age_min ?? null,
          age_max: d.age_max ?? null,
          required_gender: d.required_gender ?? null,
          is_paid: d.is_paid ?? null,
          compensation_details: d.compensation_details ?? null,
          deadline_at: d.deadline_at ?? null,
          status: "open",
          is_featured: false,
        })),
        { onConflict: "source_name,external_id" }
      );
    }

    // Get open castings not yet matched
    const { data: existingMatches } = await admin
      .from("castly_matches")
      .select("casting_id")
      .eq("profile_id", profile.id);

    const matchedIds = new Set((existingMatches ?? []).map((m: { casting_id: string }) => m.casting_id));

    const { data: castings } = await admin
      .from("castly_castings")
      .select("*")
      .eq("status", "open")
      .limit(20);

    const newCastings = (castings ?? []).filter((c: CastlyCasting) => !matchedIds.has(c.id));

    if (newCastings.length === 0) {
      return NextResponse.json({ matched: 0, message: "All castings already matched" });
    }

    // Score via Claude
    const results = await batchMatchProfile(profile as CastlyProfile, newCastings as CastlyCasting[]);

    // Only insert score >= 20
    const toInsert = results
      .filter(r => r.score >= 20)
      .map(r => ({
        profile_id: profile.id,
        casting_id: r.casting_id,
        match_score: r.score,
        match_reasons: r.reasons,
        match_blockers: r.blockers,
        status: "new",
      }));

    if (toInsert.length > 0) {
      await admin.from("castly_matches").insert(toInsert);
    }

    return NextResponse.json({ matched: toInsert.length, total: results.length });
  } catch (err) {
    console.error("match error", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
