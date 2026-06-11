import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "mock-secret", {
  apiVersion: "2025-01-27.acme" as any,
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { plan } = await request.json();

    if (!plan || plan !== "professional") {
      return NextResponse.json({ error: "Invalid plan type" }, { status: 400 });
    }

    const host = request.headers.get("origin") || "http://localhost:3000";
    const stripeKey = process.env.STRIPE_SECRET_KEY;

    if (stripeKey) {
      const checkoutSession = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: `PharmNode ${plan.toUpperCase()} License`,
                description: `Monthly B2B Virtual Formulation subscription license for ${plan} plan.`,
              },
              unit_amount: 1900,
              recurring: { interval: "month" },
            },
            quantity: 1,
          },
        ],
        mode: "subscription",
        success_url: `${host}/configurator?checkout=success&plan=${plan}`,
        cancel_url: `${host}/configurator?checkout=cancelled`,
        customer_email: session?.user?.email || undefined,
      });

      return NextResponse.json({ url: checkoutSession.url });
    } else {
      console.warn("STRIPE_SECRET_KEY is not set. Running simulated billing checkout.");

      if (session?.user?.email) {
        await prisma.user.update({
          where: { email: session.user.email },
          data: { tariff: plan },
        });
      }

      const mockCheckoutUrl = `${host}/configurator?checkout=success&plan=${plan}&mock=true`;
      return NextResponse.json({ url: mockCheckoutUrl });
    }
  } catch (err: any) {
    console.error("Checkout handler error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
