import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("=== USERS ===");
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
  });
  console.log(users.map(u => ({ id: u.id, name: u.name, email: u.email, tariff: u.tariff, isSubscribed: u.isSubscribed, paddleSubId: u.paddleSubId, paddleCustomerId: u.paddleCustomerId })));

  console.log("\n=== AUDIT LOGS ===");
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 15,
  });
  console.log(logs);

  console.log("\n=== PROCESSED WEBHOOKS ===");
  const webhooks = await prisma.processedWebhook.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
  });
  console.log(webhooks);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
