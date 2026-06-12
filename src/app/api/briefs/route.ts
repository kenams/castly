import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export async function GET() {
  const admin = createServiceClient();
  const { data, error } = await admin
    .from("castly_briefs")
    .select("*, recruiter:castly_recruiters(company_name, recruiter_type, city, verified)")
    .eq("status", "open")
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ briefs: data });
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createServiceClient();
  const { data: recruiter } = await admin
    .from("castly_recruiters")
    .select("id")
    .eq("user_id", user.id)
    .single();
  if (!recruiter) return NextResponse.json({ error: "Recruiter profile not found" }, { status: 404 });

  const body = await req.json();
  const { data, error } = await admin.from("castly_briefs").insert({
    recruiter_id: recruiter.id,
    title: body.title,
    description: body.description || null,
    project_type: body.project_type,
    artist_types: body.artist_types ?? [],
    required_skills: body.required_skills ?? [],
    style_tags: body.style_tags ?? [],
    required_gender: body.required_gender || null,
    age_min: body.age_min ?? null,
    age_max: body.age_max ?? null,
    location: body.location || null,
    is_remote: body.is_remote ?? false,
    budget_range: body.budget_range || null,
    deadline_at: body.deadline_at || null,
    shoot_date: body.shoot_date || null,
    status: body.status ?? "open",
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ brief: data });
}
