import { prisma } from "../src/lib/prisma";

async function main() {
  const userEmail = process.argv[2] || "test-dev@pharmnode.com";
  console.log(`Activating subscription for ${userEmail}...`);
  const user = await prisma.user.update({
    where: { email: userEmail },
    data: {
      isSubscribed: true,
      tariff: "professional",
      paddleSubId: "sub_test_active",
      paddleCustomerId: "ctm_test_active",
    },
  });
  console.log("Subscription activated successfully!", user);
}

main()
  .catch(err => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
