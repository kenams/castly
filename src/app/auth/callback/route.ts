import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  if (code) {
    const supabase = await createClient();
    const { data } = await supabase.auth.exchangeCodeForSession(code);
    const role = data.user?.user_metadata?.role;
    return NextResponse.redirect(`${origin}${role === "recruiter" ? "/recruiter/onboarding" : "/onboarding"}`);
  }
  return NextResponse.redirect(`${origin}/auth/login`);
}
