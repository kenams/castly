import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: recruiter } = await supabase
    .from("castly_recruiters")
    .select("id, credits")
    .eq("user_id", user.id)
    .single();
  if (!recruiter) return NextResponse.json({ error: "Recruiter account required" }, { status: 403 });

  // Check if already revealed (free re-reveal)
  const { data: existing } = await supabase
    .from("castly_contact_reveals")
    .select("id")
    .eq("recruiter_id", recruiter.id)
    .eq("profile_id", id)
    .single();

  if (!existing) {
    // Need credits
    if (recruiter.credits <= 0) {
      return NextResponse.json({ error: "No credits", need_credits: true }, { status: 402 });
    }

    // Deduct 1 credit atomically
    const { error: deductError } = await supabase
      .from("castly_recruiters")
      .update({ credits: recruiter.credits - 1 })
      .eq("id", recruiter.id)
      .eq("credits", recruiter.credits); // optimistic lock

    if (deductError) return NextResponse.json({ error: "Concurrent update, retry" }, { status: 409 });

    // Record reveal
    await supabase.from("castly_contact_reveals").insert({
      recruiter_id: recruiter.id,
      profile_id: id,
    });
  }

  const { data } = await supabase
    .from("castly_profiles")
    .select("contact_email, display_name")
    .eq("id", id)
    .eq("is_visible", true)
    .single();

  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    contact_email: data.contact_email,
    display_name: data.display_name,
    credits_remaining: existing ? recruiter.credits : recruiter.credits - 1,
  });
}
