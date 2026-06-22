import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();
    const trimmedUsername = String(username ?? "").trim();
    const rawPassword = String(password ?? "");

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
