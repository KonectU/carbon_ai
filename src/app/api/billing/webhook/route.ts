import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/billing/stripe";
import { prisma } from "@/lib/db/prisma";
import Stripe from "stripe";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const signature = headers().get("stripe-signature") ?? "";
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? "";
  const body = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId;

    if (userId) {
      await prisma.user.update({
        where: { id: userId },
        data: { plan: "PRO" },
      });
    }
  }

  return NextResponse.json({ received: true });
}
