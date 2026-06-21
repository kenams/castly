import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2026-05-27.dahlia" });

const PACKS = {
  starter: { priceId: "price_1TiHYOGSZgm5QCNLbjqg9ckM", credits: 5,  label: "5 crédits"  },
  pro:     { priceId: "price_1TiHYOGSZgm5QCNLIZGnDzes", credits: 20, label: "20 crédits" },
  agency:  { priceId: "price_1TiHYPGSZgm5QCNLL6KRk2Ug", credits: 50, label: "50 crédits" },
};

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { pack } = await req.json() as { pack: string };
  const packData = PACKS[pack as keyof typeof PACKS];
  if (!packData) return NextResponse.json({ error: "Invalid pack" }, { status: 400 });

  const { data: recruiter } = await supabase
    .from("castly_recruiters")
    .select("id")
    .eq("user_id", user.id)
    .single();
  if (!recruiter) return NextResponse.json({ error: "Recruiter account required" }, { status: 403 });

  const origin = req.headers.get("origin") || "https://castly.kah-digital.ch";

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [{ price: packData.priceId, quantity: 1 }],
    success_url: `${origin}/recruiter/dashboard?credits=ok`,
    cancel_url: `${origin}/credits`,
    metadata: {
      recruiter_id: recruiter.id,
      credits: String(packData.credits),
      pack,
    },
  });

  // Log session for idempotency
  await supabase.from("castly_stripe_sessions").insert({
    id: session.id,
    recruiter_id: recruiter.id,
    credits_purchased: packData.credits,
    amount_eur: session.amount_total ?? 0,
  });

  return NextResponse.json({ url: session.url });
}
