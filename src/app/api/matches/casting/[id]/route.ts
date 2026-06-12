import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("castly_profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!profile) return NextResponse.json({ error: "No profile" }, { status: 404 });

  const { data: match } = await supabase
    .from("castly_matches")
    .select("match_score, match_reasons, match_blockers, status")
    .eq("profile_id", profile.id)
    .eq("casting_id", id)
    .single();

  if (!match) return NextResponse.json({ score: null });
  return NextResponse.json({ score: match.match_score, reasons: match.match_reasons, blockers: match.match_blockers, status: match.status });
}
