import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateTOTPSecret, getTOTPUri } from "@/lib/totp";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
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
