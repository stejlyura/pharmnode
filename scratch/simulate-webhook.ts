import { PrismaClient } from "@prisma/client";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const prisma = new PrismaClient();

// Load environment variables from .env
function loadEnv() {
  const envPath = path.resolve(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const parts = trimmed.split("=");
    const key = parts[0].trim();
    let val = parts.slice(1).join("=").trim();
    if (val.startsWith('"') && val.endsWith('"')) {
      val = val.slice(1, -1);
    }
    process.env[key] = val;
  }
}

async function main() {
  loadEnv();

  const secret = process.env.PADDLE_WEBHOOK_SECRET;
  if (!secret) {
    console.error("Error: PADDLE_WEBHOOK_SECRET is not defined in .env");
    process.exit(1);
  }

  // Find the target user
  const email = "yidohat8122@synsky.com";
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.error(`Error: User with email ${email} not found in database.`);
    process.exit(1);
  }

  console.log(`Found user: ${user.name} (${user.email}), ID: ${user.id}`);
  console.log(`Current tariff: ${user.tariff}, isSubscribed: ${user.isSubscribed}`);

  const eventId = "evt_sim_" + crypto.randomBytes(8).toString("hex");
  const subscriptionId = "sub_sim_" + crypto.randomBytes(8).toString("hex");
  const customerId = "ctm_sim_" + crypto.randomBytes(8).toString("hex");

  // Construct Paddle event payload using the exact snake_case structure
  // expected by the Paddle Node SDK unmarshaling method.
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
        userId: user.id,
      },
      items: [],
      payments: [],
    },
  };

  const requestBody = JSON.stringify(payload);
  const ts = Math.floor(Date.now() / 1000);
  const payloadWithTime = `${ts}:${requestBody}`;

  // Calculate HMAC-SHA256 signature
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(payloadWithTime);
  const h1 = hmac.digest("hex");
  const signature = `ts=${ts};h1=${h1}`;

  console.log(`Sending webhook request to http://localhost:3000/api/webhooks/paddle...`);

  const response = await fetch("http://localhost:3000/api/webhooks/paddle", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "paddle-signature": signature,
    },
    body: requestBody,
  });

  const responseText = await response.text();
  console.log(`Response status: ${response.status}`);
  console.log(`Response text: ${responseText}`);

  if (response.ok) {
    // Check if the user is updated in the database
    const updatedUser = await prisma.user.findUnique({ where: { id: user.id } });
    console.log("\n=== DATABASE STATE AFTER WEBHOOK ===");
    console.log({
      id: updatedUser?.id,
      email: updatedUser?.email,
      tariff: updatedUser?.tariff,
      isSubscribed: updatedUser?.isSubscribed,
      paddleSubId: updatedUser?.paddleSubId,
      paddleCustomerId: updatedUser?.paddleCustomerId,
    });
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
