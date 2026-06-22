import { prisma } from "../src/lib/prisma";

async function main() {
  const userEmail = process.argv[2] || "test-dev@pharmnode.com";
  console.log(`Deactivating subscription for ${userEmail}...`);
  const user = await prisma.user.update({
    where: { email: userEmail },
    data: {
      isSubscribed: false,
      tariff: "hobby",
      paddleSubId: null,
      paddleCustomerId: null,
    },
  });
  console.log("Subscription deactivated successfully!", user);
}

main()
  .catch(err => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
