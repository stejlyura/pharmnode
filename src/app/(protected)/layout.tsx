import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // If the user is logged in, we MUST check the database for their email verification status.
  // This bypasses any stale NextAuth token cookie issues and guarantees 100% reliability.
  if (session?.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { emailVerified: true },
    });

    if (!user?.emailVerified) {
      redirect("/verify-email");
    }
  } else {
    // If there is no session, middleware should have redirected them, but just in case:
    redirect("/login");
  }

  return <>{children}</>;
}
