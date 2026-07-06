import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { SettingsForm } from "@/components/SettingsForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  // Query fresh user subscription data directly from database
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    redirect("/login");
  }

  const initialUser = {
    name: user.name,
    email: user.email,
    tariff: user.tariff,
    isSubscribed: user.isSubscribed,
    billingPortalUrl: user.billingPortalUrl,
    renewsAt: user.renewsAt ? user.renewsAt.toISOString() : null,
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col font-sans text-zinc-100 selection:bg-indigo-500/30">
      <Header showCanvasControls={false} />
      <main className="flex-1 flex items-center justify-center p-6 md:p-12 bg-radial from-zinc-900 via-zinc-950 to-zinc-950">
        <SettingsForm initialUser={initialUser} />
      </main>
    </div>
  );
}
