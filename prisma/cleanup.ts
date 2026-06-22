import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database cleanup for production release...");

  // 1. Identify test users
  const testUsers = await prisma.user.findMany({
    where: {
      OR: [
        { email: { contains: "test", mode: "insensitive" } },
        { email: { contains: "mock", mode: "insensitive" } },
        { email: { endsWith: "@example.com" } },
        { name: { contains: "test", mode: "insensitive" } },
        { id: { startsWith: "mock-" } }
      ]
    }
  });

  console.log(`Found ${testUsers.length} test user accounts to delete.`);

  // Delete test users (cascade will delete recipes and custom ingredients)
  for (const user of testUsers) {
    await prisma.user.delete({
      where: { id: user.id }
    });
    console.log(`Deleted user: ${user.email}`);
  }

  // 2. Reset mock subscription details on remaining users
  const mockSubscribedUsers = await prisma.user.findMany({
    where: {
      OR: [
        { paddleSubId: { startsWith: "mock" } },
        { paddleSubId: { startsWith: "test" } },
        { paddleSubId: { contains: "test" } }
      ]
    }
  });

  console.log(`Found ${mockSubscribedUsers.length} remaining users with mock subscriptions to reset.`);

  for (const user of mockSubscribedUsers) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isSubscribed: false,
        paddleSubId: null,
        paddleCustomerId: null,
        variantId: null,
        renewsAt: null,
        billingPortalUrl: null,
        tariff: "hobby"
      }
    });
    console.log(`Reset subscription for user: ${user.email}`);
  }

  // 3. Clear processed webhook logs
  const deletedWebhooks = await prisma.processedWebhook.deleteMany({});
  console.log(`Cleared ${deletedWebhooks.count} processed webhook logs.`);

  // 4. Verify database state
  console.log("\n=== Database Cleanliness Report ===");
  const userCount = await prisma.user.count();
  const recipeCount = await prisma.recipe.count();
  const customIngredientCount = await prisma.customIngredient.count();
  const webhookCount = await prisma.processedWebhook.count();

  console.log(`Active Users: ${userCount}`);
  console.log(`Recipes: ${recipeCount}`);
  console.log(`Custom Ingredients: ${customIngredientCount}`);
  console.log(`Processed Webhooks: ${webhookCount}`);
  
  const hasOnlyAdmin = userCount === 0 || (userCount === 1 && (await prisma.user.findFirst())?.email === "admin@pharmnode.com");
  if (hasOnlyAdmin) {
    console.log("\nStatus: Database is perfectly CLEAN and ready for production launch!");
  } else {
    console.log(`\nStatus: Database cleaned. ${userCount} production-ready accounts remain.`);
  }
}

main()
  .catch((e) => {
    console.error("Cleanup script failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
