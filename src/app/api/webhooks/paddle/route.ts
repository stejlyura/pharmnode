import { NextResponse } from "next/server";
import { Environment, Paddle, EventName } from "@paddle/paddle-node-sdk";
import type { SubscriptionNotification, SubscriptionCreatedNotification, TransactionNotification } from "@paddle/paddle-node-sdk";
import prisma from "@/lib/prisma";
import { logger } from "@/lib/logger";

// Determine Paddle environment from the same var used on the client side
const isProd = process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT === "production";

const paddle = new Paddle(process.env.PADDLE_API_KEY || "", {
  environment: isProd ? Environment.production : Environment.sandbox,
});

export async function POST(request: Request) {
  try {
    const signature = request.headers.get("paddle-signature");
    if (!signature) {
      return NextResponse.json({ error: "Missing paddle-signature header" }, { status: 400 });
    }

    const rawRequestBody = await request.text();
    const secret = process.env.PADDLE_WEBHOOK_SECRET || "";

    if (!secret) {
      logger.error("PADDLE_WEBHOOK_SECRET is not set", null, "webhook_paddle");
      return NextResponse.json({ error: "Configuration error" }, { status: 500 });
    }

    // Unmarshal and verify the webhook signature
    const eventData = await paddle.webhooks.unmarshal(rawRequestBody, secret, signature);
    
    if (!eventData) {
      return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
    }

    const eventType = eventData.eventType;
    logger.info(`Received Paddle event: ${eventType}`, "webhook_paddle");

    // Check idempotency (prevent processing the same event multiple times)
    const processed = await prisma.processedWebhook.findUnique({
      where: { id: eventData.eventId },
    });

    if (processed) {
      logger.info(`Paddle IPN: Event ${eventData.eventId} already processed. Skipping.`, "webhook_paddle");
      return NextResponse.json({ success: true, message: "Already processed" });
    }

    // Process specific events
    switch (eventType) {
      case EventName.TransactionCompleted:
      case EventName.SubscriptionCreated: {
        // Extract userId from customData
        let customData: Record<string, string> = {};
        let customerId: string | undefined;
        let subscriptionId: string | undefined;

        if (eventData.data && "customData" in eventData.data) {
           customData = (eventData.data.customData as Record<string, string>) || {};
        }
        
        if (eventData.data && "customerId" in eventData.data) {
           customerId = eventData.data.customerId as string;
        }

        if (eventData.data && "id" in eventData.data && eventType === EventName.SubscriptionCreated) {
           subscriptionId = eventData.data.id as string;
        } else if (eventData.data && "subscriptionId" in eventData.data && eventType === EventName.TransactionCompleted) {
           subscriptionId = eventData.data.subscriptionId as string;
        }

        const userId = customData.userId;

        if (userId) {
          const user = await prisma.user.findUnique({ where: { id: userId } });
          if (user) {
            const subData = eventData.data as SubscriptionCreatedNotification;
            const renewsAt = subData.nextBilledAt 
              ? new Date(subData.nextBilledAt) 
              : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

            await prisma.user.update({
              where: { id: userId },
              data: {
                isSubscribed: true,
                tariff: "professional",
                paddleSubId: subscriptionId,
                paddleCustomerId: customerId,
                renewsAt: renewsAt,
              },
            });
            logger.info(`Paddle IPN: Activated user ${user.email} (tariff: professional, renewsAt: ${renewsAt.toISOString()})`, "webhook_paddle");

            await prisma.auditLog.create({
              data: {
                userId: user.id,
                email: user.email,
                action: "subscription_activated",
                details: `Tariff upgraded to professional via Paddle. event: ${eventType}`,
              },
            });
          } else {
            logger.warn(`Paddle IPN: User not found for ID ${userId}`, "webhook_paddle");
          }
        }
        break;
      }
      
      case EventName.SubscriptionUpdated: {
        const subData = eventData.data as SubscriptionNotification;
        const subscriptionId = subData.id;
        
        if (subscriptionId) {
          const user = await prisma.user.findFirst({ where: { paddleSubId: subscriptionId } });
          
          if (user) {
            // For example, handle status changes like past_due, active, canceled
            const status = subData.status;
            const renewsAt = subData.nextBilledAt ? new Date(subData.nextBilledAt) : null;
            if (status === "active") {
              await prisma.user.update({
                where: { id: user.id },
                data: { 
                  isSubscribed: true, 
                  tariff: "professional",
                  renewsAt: renewsAt
                },
              });
              logger.info(`Paddle IPN: Updated subscription active for user ${user.email} (renewsAt: ${renewsAt ? renewsAt.toISOString() : 'null'})`, "webhook_paddle");
            } else if (status === "canceled" || status === "paused") {
               await prisma.user.update({
                where: { id: user.id },
                data: { 
                  isSubscribed: false, 
                  tariff: "hobby",
                  renewsAt: null
                },
              });
              logger.info(`Paddle IPN: Sub status ${status} for user ${user.email}. Downgraded.`, "webhook_paddle");
            }
          }
        }
        break;
      }

      case EventName.SubscriptionCanceled: {
        const subData = eventData.data as SubscriptionNotification;
        const subscriptionId = subData.id;

        if (subscriptionId) {
          const user = await prisma.user.findFirst({ where: { paddleSubId: subscriptionId } });
          
          if (user) {
            await prisma.user.update({
              where: { id: user.id },
              data: {
                isSubscribed: false,
                tariff: "hobby",
                renewsAt: null,
              },
            });
            logger.info(`Paddle IPN: Downgraded user ${user.email} (event: ${eventType})`, "webhook_paddle");

            await prisma.auditLog.create({
              data: {
                userId: user.id,
                email: user.email,
                action: "subscription_canceled",
                details: `Tariff downgraded to hobby via Paddle. event: ${eventType}`,
              },
            });
          }
        }
        break;
      }

      default:
        logger.info(`Unhandled Paddle event type: ${eventType}`, "webhook_paddle");
        break;
    }

    // Mark as processed
    await prisma.processedWebhook.create({
      data: { id: eventData.eventId },
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    logger.error("Paddle Webhook error", error instanceof Error ? error : null, "webhook_paddle");
    return NextResponse.json(
      { error: "Internal server error", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
