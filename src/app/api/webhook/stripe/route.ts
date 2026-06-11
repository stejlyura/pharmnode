import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

// ─── POST /api/webhook/stripe ─────────────────────────────────────────────────
// Processes Stripe webhook events.
// Handles: checkout.session.completed → update user tariff in DB.
export async function POST(request: Request) {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeKey || !webhookSecret) {
    console.warn("Stripe keys not configured. Webhook handler is a no-op in mock mode.");
    return NextResponse.json({ received: true, mock: true });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stripe = new Stripe(stripeKey, { apiVersion: "2025-01-27.acme" as any });

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Stripe webhook signature verification failed:", message);
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 });
  }

  // ── Handle events ──────────────────────────────────────────────────────────
  switch (event.type) {
    case "checkout.session.completed": {
      const checkoutSession = event.data.object as Stripe.Checkout.Session;
      const customerEmail = checkoutSession.customer_email;
      const plan = checkoutSession.metadata?.plan ?? "professional";

      if (customerEmail) {
        try {
          await prisma.user.update({
            where: { email: customerEmail },
            data: { tariff: plan },
          });
          console.log(`Updated tariff to '${plan}' for user: ${customerEmail}`);
        } catch (e) {
          console.error("Failed to update user tariff after checkout:", e);
          return NextResponse.json(
            { error: "Failed to update user tariff" },
            { status: 500 }
          );
        }
      }
      break;
    }

    case "customer.subscription.deleted": {
      // Downgrade tariff when subscription is cancelled
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      try {
        const customer = await stripe.customers.retrieve(customerId);
        if (!customer.deleted && customer.email) {
          await prisma.user.update({
            where: { email: customer.email },
            data: { tariff: "hobby" },
          });
          console.log(`Downgraded tariff to 'hobby' for user: ${customer.email}`);
        }
      } catch (e) {
        console.error("Failed to downgrade user tariff on subscription cancellation:", e);
      }
      break;
    }

    default:
      // Unhandled event — acknowledge receipt without error
      console.log(`Unhandled Stripe event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
