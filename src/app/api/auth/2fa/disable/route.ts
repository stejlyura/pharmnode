import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyTOTP } from "@/lib/totp";
import { logAuditEvent } from "@/lib/auditLogger";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { code } = await request.json();
    if (!code) {
      return NextResponse.json({ error: "Verification code is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
      return NextResponse.json({ error: "2FA is not enabled on this account" }, { status: 400 });
    }

    const isValid = verifyTOTP(code, user.twoFactorSecret);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid verification code" }, { status: 400 });
    }

    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
      },
    });

    await logAuditEvent({
      userId: session.user.id,
      email: session.user.email,
      action: "user_disable_2fa",
      details: "Two-Factor Authentication successfully disabled."
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("2FA disable route error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
