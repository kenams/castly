import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const city = searchParams.get("city");
  const style = searchParams.get("style");
  const gender = searchParams.get("gender");
  const age_min = searchParams.get("age_min");
  const age_max = searchParams.get("age_max");

  const admin = createServiceClient();
  const currentYear = new Date().getFullYear();

  let query = admin
    .from("castly_profiles")
    .select("id, display_name, artist_type, gender, birth_year, city, height_cm, eye_color, hair_color, bio, skills, style_tags, social_links, experience_years, avatar_url, is_visible, day_rate_eur")
    .eq("is_visible", true)
    .eq("is_complete", true)
    .eq("role", "artist")
    .order("created_at", { ascending: false })
    .limit(60);

  if (type) query = query.overlaps("artist_type", [type]);
  if (city) query = query.ilike("city", `%${city}%`);
  if (style) query = query.overlaps("style_tags", [style]);
  if (gender) query = query.eq("gender", gender);
  if (age_min) query = query.lte("birth_year", currentYear - parseInt(age_min));
  if (age_max) query = query.gte("birth_year", currentYear - parseInt(age_max));

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ artists: data });
}
