import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("castly_profiles")
    .select("id, display_name, artist_type, gender, birth_year, city, height_cm, eye_color, hair_color, bio, skills, style_tags, social_links, experience_years, avatar_url, is_visible, day_rate_eur, languages")
    .eq("id", id)
    .eq("is_visible", true)
    .eq("role", "artist")
    .single();
  if (error || !data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ artist: data });
}
