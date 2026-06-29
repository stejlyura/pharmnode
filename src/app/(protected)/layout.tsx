import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TariffSynchronizer } from "@/components/TariffSynchronizer";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // If the user is logged in, we MUST check the database for their email verification status.
  // This bypasses any stale NextAuth token cookie issues and guarantees 100% reliability.
  let dbTariff = "hobby";

  if (session?.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { emailVerified: true, tariff: true },
    });

    if (!user?.emailVerified) {
      redirect("/verify-email");
    }

    if (user?.tariff) {
      dbTariff = user.tariff;
    }
  } else {
    // If there is no session, middleware should have redirected them, but just in case:
    redirect("/login");
  }

  return (
    <>
      <TariffSynchronizer dbTariff={dbTariff} />
      {children}
    </>
  );
}
