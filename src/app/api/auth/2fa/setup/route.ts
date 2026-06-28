import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateTOTPSecret, getTOTPUri } from "@/lib/totp";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { rateLimit } = await import("@/lib/rateLimit");
    const limiter = await rateLimit("2fa_setup", {
      limit: 10,
      windowMs: 15 * 60 * 1000,
    });
    if (!limiter.success) {
      return NextResponse.json(
        { error: "Too many 2FA setup attempts. Please try again in 15 minutes." },
        { status: 429 }
      );
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const secret = generateTOTPSecret();
    const uri = getTOTPUri(session.user.email, secret);

    return NextResponse.json({ success: true, secret, uri });
  } catch (err) {
    console.error("2FA setup route error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
