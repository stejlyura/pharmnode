import { NextResponse } from "next/server";
import crypto from "node:crypto";

export async function POST(request: Request) {
  // Guard: Only allow this simulation endpoint in development or sandbox mode
  const isProd =
    process.env.NODE_ENV === "production" &&
    process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT === "production";

  if (isProd) {
    return NextResponse.json({ error: "Forbidden in production environment" }, { status: 403 });
  }

  try {
    const { userId } = (await request.json()) as { userId?: string };

    if (!userId) {
      return NextResponse.json({ error: "Missing userId in request body" }, { status: 400 });
    }

    const secret = process.env.PADDLE_WEBHOOK_SECRET;
    if (!secret) {
      return NextResponse.json({ error: "PADDLE_WEBHOOK_SECRET is not configured on the server" }, { status: 500 });
    }

    const eventId = "evt_sim_" + crypto.randomBytes(8).toString("hex");
    const subscriptionId = "sub_sim_" + crypto.randomBytes(8).toString("hex");
    const customerId = "ctm_sim_" + crypto.randomBytes(8).toString("hex");

    // Construct raw Paddle event payload structure matching the exact shape expected by Node SDK
    const payload = {
      event_id: eventId,
      event_type: "transaction.completed",
      occurred_at: new Date().toISOString(),
      data: {
        id: "txn_sim_" + crypto.randomBytes(8).toString("hex"),
        status: "completed",
        customer_id: customerId,
        subscription_id: subscriptionId,
        next_billed_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        custom_data: {
          userId: userId,
        },
        items: [],
        payments: [],
      },
    };

    const requestBody = JSON.stringify(payload);
    const ts = Math.floor(Date.now() / 1000);
    const payloadWithTime = `${ts}:${requestBody}`;

    // Compute HMAC-SHA256 signature
    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(payloadWithTime);
    const h1 = hmac.digest("hex");
    const signature = `ts=${ts};h1=${h1}`;

    // Determine absolute URL dynamically from request URL
    const origin = new URL(request.url).origin;
    const webhookUrl = `${origin}/api/webhooks/paddle`;

    console.log(`[SIMULATOR] Forwarding simulated webhook request to ${webhookUrl}...`);

    const webhookResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "paddle-signature": signature,
      },
      body: requestBody,
    });

    const responseText = await webhookResponse.text();
    console.log(`[SIMULATOR] Webhook handler response code: ${webhookResponse.status}`);

    if (!webhookResponse.ok) {
      return NextResponse.json({
        success: false,
        error: "Webhook handler failed",
        status: webhookResponse.status,
        message: responseText
      }, { status: 502 });
    }

    return NextResponse.json({
      success: true,
      message: "Webhook simulation succeeded",
      subscriptionId,
      customerId,
      eventId
    });
  } catch (err: unknown) {
    console.error("[SIMULATOR] Error during webhook simulation:", err);
    return NextResponse.json({ error: "Simulator error", message: err instanceof Error ? err.message : "Unknown error" }, { status: 500 });
  }
}
