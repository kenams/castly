import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

// Public endpoint — returns open castings for the explore page
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const city = searchParams.get("city");
  const paid = searchParams.get("paid");

  const admin = createServiceClient();
  let query = admin
    .from("castly_castings")
    .select("*")
    .eq("status", "open")
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(50);

  if (type) query = query.contains("casting_type", [type]);
  if (city) query = query.ilike("location", `%${city}%`);
  if (paid === "true") query = query.eq("is_paid", true);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ castings: data });
}
