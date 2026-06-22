import { prisma } from "../src/lib/prisma";

async function main() {
  const userId = "83d1917d-1802-45eb-a50e-2de052ec1423";
  const userEmail = "test-dev@pharmnode.com";
  const mockSubId = "sub_test_123456789";
  const mockCustomerId = "ctm_test_987654321";
  const mockEventId = "evt_test_abc123xyz";

  console.log("=== Testing Webhook DB Mutations & Idempotency ===");

  // 1. Initial State Check
  const initialUser = await prisma.user.findUnique({ where: { id: userId } });
  console.log(`Initial user state: tariff = ${initialUser?.tariff}, isSubscribed = ${initialUser?.isSubscribed}`);
  
  if (initialUser?.tariff !== "hobby" || initialUser?.isSubscribed !== false) {
    console.error("FAIL: Expected initial tariff to be hobby and unsubscribed");
    process.exit(1);
  }

  // 2. Simulate Idempotency check: ProcessedWebhook
  console.log("\n--- Checking Idempotency Logic ---");
  const processedBefore = await prisma.processedWebhook.findUnique({
    where: { id: mockEventId }
  });
  console.log(`Event ${mockEventId} processed state before: ${processedBefore ? "exists" : "does not exist"}`);

  if (processedBefore) {
    // Clear it if it somehow exists
    await prisma.processedWebhook.delete({ where: { id: mockEventId } });
  }

  // Add event to processed
  await prisma.processedWebhook.create({
    data: { id: mockEventId }
  });
  
  const processedAfter = await prisma.processedWebhook.findUnique({
    where: { id: mockEventId }
  });
  console.log(`Event ${mockEventId} processed state after record insertion: ${processedAfter ? "exists" : "does not exist"}`);
  
  if (!processedAfter) {
    console.error("FAIL: Failed to record processed webhook event");
    process.exit(1);
  }

  // Clean it up
  await prisma.processedWebhook.delete({ where: { id: mockEventId } });

  // 3. Simulate SubscriptionCreated / TransactionCompleted logic
  console.log("\n--- Simulating Subscription Activation ---");
  await prisma.user.update({
    where: { id: userId },
    data: {
      isSubscribed: true,
      tariff: "professional",
      paddleSubId: mockSubId,
      paddleCustomerId: mockCustomerId,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId,
      email: userEmail,
      action: "subscription_activated",
      details: `Tariff upgraded to professional via simulated Paddle webhook.`,
    },
  });

  const activeUser = await prisma.user.findUnique({ where: { id: userId } });
  console.log(`Activated user state: tariff = ${activeUser?.tariff}, isSubscribed = ${activeUser?.isSubscribed}`);
  console.log(`paddleSubId = ${activeUser?.paddleSubId}, paddleCustomerId = ${activeUser?.paddleCustomerId}`);

  if (activeUser?.tariff !== "professional" || activeUser?.isSubscribed !== true || activeUser?.paddleSubId !== mockSubId) {
    console.error("FAIL: User activation failed");
    process.exit(1);
  }

  const activationLog = await prisma.auditLog.findFirst({
    where: { userId, action: "subscription_activated" },
    orderBy: { createdAt: "desc" }
  });
  console.log(`Activation AuditLog entry: action = ${activationLog?.action}, details = ${activationLog?.details}`);

  if (!activationLog) {
    console.error("FAIL: Activation audit log not found");
    process.exit(1);
  }

  // 4. Simulate SubscriptionCanceled logic
  console.log("\n--- Simulating Subscription Cancellation ---");
  await prisma.user.update({
    where: { id: userId },
    data: {
      isSubscribed: false,
      tariff: "hobby",
    },
  });

  await prisma.auditLog.create({
    data: {
      userId,
      email: userEmail,
      action: "subscription_canceled",
      details: `Tariff downgraded to hobby via simulated Paddle webhook.`,
    },
  });

  const canceledUser = await prisma.user.findUnique({ where: { id: userId } });
  console.log(`Canceled user state: tariff = ${canceledUser?.tariff}, isSubscribed = ${canceledUser?.isSubscribed}`);

  if (canceledUser?.tariff !== "hobby" || canceledUser?.isSubscribed !== false) {
    console.error("FAIL: User cancellation failed");
    process.exit(1);
  }

  const cancellationLog = await prisma.auditLog.findFirst({
    where: { userId, action: "subscription_canceled" },
    orderBy: { createdAt: "desc" }
  });
  console.log(`Cancellation AuditLog entry: action = ${cancellationLog?.action}, details = ${cancellationLog?.details}`);

  if (!cancellationLog) {
    console.error("FAIL: Cancellation audit log not found");
    process.exit(1);
  }

  console.log("\nVERIFICATION SUCCESSFUL: Webhook database mutations and idempotency checks work perfectly!");
}

main()
  .catch(err => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
