import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyTOTP } from "@/lib/totp";
import { logAuditEvent } from "@/lib/auditLogger";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { rateLimit } = await import("@/lib/rateLimit");
    const limiter = await rateLimit("2fa_enable", {
      limit: 10,
      windowMs: 15 * 60 * 1000,
    });
    if (!limiter.success) {
      return NextResponse.json(
        { error: "Too many 2FA enable attempts. Please try again in 15 minutes." },
        { status: 429 }
      );
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { secret, code } = (await request.json()) as { secret?: string; code?: string };
    if (!secret || !code) {
      return NextResponse.json({ error: "Secret and code are required" }, { status: 400 });
    }

    const isValid = verifyTOTP(code, secret);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid verification code" }, { status: 400 });
    }

    const { encrypt } = await import("@/lib/encryption");
    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        twoFactorEnabled: true,
        twoFactorSecret: encrypt(secret),
      },
    });

    await logAuditEvent({
      userId: session.user.id,
      email: session.user.email,
      action: "user_enable_2fa",
      details: "Two-Factor Authentication successfully enabled on account."
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("2FA enable route error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
