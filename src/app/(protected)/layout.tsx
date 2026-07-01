import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { cookies } from "next/headers";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getMockUser } from "@/lib/authHelpers";
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
    // Check if there is an active mock session cookie (only for non-production environments)
    const cookieStore = await cookies();
    const mockUserCookie = cookieStore.get("pharmnode_mock_user")?.value;
    const { isAuthenticated: isMockAuthenticated, tariff: mockTariff } = getMockUser(mockUserCookie);

    if (isMockAuthenticated) {
      dbTariff = mockTariff;
    } else {
      // If there is no session, middleware should have redirected them, but just in case:
      redirect("/login");
    }
  }

  return (
    <>
      <TariffSynchronizer dbTariff={dbTariff} />
      {children}
    </>
  );
}
