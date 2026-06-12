import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { batchMatchProfile } from "@/lib/matching";
import type { CastlyProfile, CastlyCasting } from "@/types";

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile, error: profileError } = await supabase
      .from("castly_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (!profile) return NextResponse.json({ error: "No profile", dbError: profileError?.message }, { status: 400 });

    const { data: existingMatches } = await supabase
      .from("castly_matches")
      .select("casting_id")
      .eq("profile_id", profile.id);

    const matchedIds = new Set((existingMatches ?? []).map((m: { casting_id: string }) => m.casting_id));

    const { data: castings } = await supabase
      .from("castly_castings")
      .select("*")
      .eq("status", "open")
      .limit(20);

    const newCastings = (castings ?? []).filter((c: CastlyCasting) => !matchedIds.has(c.id));

    if (newCastings.length === 0) {
      return NextResponse.json({ matched: 0, message: "All castings already matched" });
    }

    const results = await batchMatchProfile(profile as CastlyProfile, newCastings as CastlyCasting[]);

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
      await supabase.from("castly_matches").insert(toInsert);
    }

    return NextResponse.json({ matched: toInsert.length, total: results.length });
  } catch (err) {
    console.error("match error", err);
    return NextResponse.json({ error: "Internal error", details: String(err) }, { status: 500 });
  }
}
