import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { rateLimit } = await import("@/lib/rateLimit");
    const limiter = await rateLimit("2fa_verify", {
      limit: 10,
      windowMs: 15 * 60 * 1000,
    });
    if (!limiter.success) {
      return NextResponse.json(
        { error: "Too many login/2FA verification attempts. Please try again in 15 minutes." },
        { status: 429 }
      );
    }

    const { username, password } = (await request.json()) as { username?: string; password?: string };
    const trimmedUsername = String(username ?? "").trim();
    const rawPassword = String(password ?? "");

    const isProduction = process.env.NODE_ENV === "production";
    if (isProduction && (!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD)) {
      throw new Error("ADMIN_USERNAME and ADMIN_PASSWORD environment variables must be set in production.");
    }
    const expectedUser = process.env.ADMIN_USERNAME || "admin";
    const expectedPass = process.env.ADMIN_PASSWORD || "PasswordforAdmin123";

    // 1. Check admin login
    if (trimmedUsername === expectedUser && rawPassword === expectedPass) {
      const adminUser = await prisma.user.findUnique({
        where: { email: "admin@pharmnode.com" },
      });

      const twoFactorEnabled = adminUser ? adminUser.twoFactorEnabled : false;
      return NextResponse.json({ success: true, twoFactorEnabled });
    }

    // 2. Check regular user login
    const emailKey = trimmedUsername.toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: emailKey },
    });

    if (user && user.passwordHash) {
      const isValid = verifyPassword(rawPassword, user.passwordHash);
      if (isValid) {
        // Upgrade password hash if it is in legacy format (PBKDF2)
        const { needsUpgrade, hashPassword } = await import("@/lib/password");
        if (needsUpgrade(user.passwordHash)) {
          const newHash = hashPassword(rawPassword);
          prisma.user.update({
            where: { id: user.id },
            data: { passwordHash: newHash },
          }).catch(err => console.error("Failed to upgrade user password hash in 2FA verify:", err));
        }
        return NextResponse.json({ success: true, twoFactorEnabled: user.twoFactorEnabled });
      }
    }

    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  } catch (err) {
    console.error("2FA verify credentials route error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
