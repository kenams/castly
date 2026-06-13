import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  if (code) {
    const supabase = await createClient();
    const { data } = await supabase.auth.exchangeCodeForSession(code);
    const role = data.user?.user_metadata?.role;
    if (role === "recruiter") {
      const { data: rec } = await supabase.from("castly_recruiters").select("id").eq("user_id", data.user!.id).single();
      return NextResponse.redirect(`${origin}${rec ? "/recruiter/dashboard" : "/recruiter/onboarding"}`);
    } else {
      const { data: profile } = await supabase.from("castly_profiles").select("id").eq("user_id", data.user!.id).single();
      return NextResponse.redirect(`${origin}${profile ? "/dashboard" : "/onboarding"}`);
    }
  }
  return NextResponse.redirect(`${origin}/auth/login`);
}
