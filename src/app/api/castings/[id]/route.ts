import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = createServiceClient();
  const { data, error } = await admin
    .from("castly_castings")
    .select("*")
    .eq("id", id)
    .single();
  if (error || !data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ casting: data });
}
