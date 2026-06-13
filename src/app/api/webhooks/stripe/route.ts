import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2025-05-28.basil" });

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig!, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const { recruiter_id, credits } = session.metadata ?? {};
    if (!recruiter_id || !credits) return NextResponse.json({ ok: true });

    const supabase = await createClient();

    // Idempotency — check if already fulfilled
    const { data: existing } = await supabase
      .from("castly_stripe_sessions")
      .select("fulfilled_at")
      .eq("id", session.id)
      .single();

    if (existing?.fulfilled_at) return NextResponse.json({ ok: true });

    // Add credits
    const { data: recruiter } = await supabase
      .from("castly_recruiters")
      .select("credits")
      .eq("id", recruiter_id)
      .single();

    if (recruiter) {
      await supabase
        .from("castly_recruiters")
        .update({ credits: recruiter.credits + parseInt(credits) })
        .eq("id", recruiter_id);
    }

    // Mark fulfilled
    await supabase
      .from("castly_stripe_sessions")
      .update({ fulfilled_at: new Date().toISOString() })
      .eq("id", session.id);
  }

  return NextResponse.json({ ok: true });
}
