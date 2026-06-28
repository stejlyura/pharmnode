import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logAuditEvent } from "@/lib/auditLogger";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");
    const email = searchParams.get("email");

    if (!token) {
      return NextResponse.json({ error: "Verification token is required" }, { status: 400 });
    }

    let user = null;

    if (email) {
      // Find user by email
      user = await prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() },
      });

      if (user) {
        // If the user is already verified, return success (idempotent behavior)
        if (user.emailVerified) {
          return NextResponse.json({ success: true });
        }

        // If not verified, check if token matches the stored token
        if (user.emailVerificationToken !== token) {
          return NextResponse.json({ error: "Invalid or expired verification token" }, { status: 400 });
        }
      }
    } else {
      // Backwards compatibility for older links
      user = await prisma.user.findFirst({
        where: { emailVerificationToken: token },
      });
    }

    if (!user) {
      return NextResponse.json({ error: "Invalid or expired verification token" }, { status: 400 });
    }

    // Verify user email
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
      },
    });

    // Log verification event
    await logAuditEvent({
      userId: user.id,
      email: user.email,
      action: "user_verify_email",
      details: "Email address successfully verified via token link."
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Email verification API error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
