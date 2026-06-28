import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, validatePassword } from "@/lib/password";
import { sanitizeString } from "@/lib/validation";
import crypto from "node:crypto";

export async function POST(request: Request) {
  try {
    const { rateLimit } = await import("@/lib/rateLimit");
    const limiter = await rateLimit("auth_register", {
      limit: 5,
      windowMs: 15 * 60 * 1000,
    });
    if (!limiter.success) {
      return NextResponse.json(
        { error: "Too many registration attempts. Please try again later." },
        { status: 429 }
      );
    }

    const body = (await request.json()) as { name?: string; email?: string; password?: string };
    const { name, email, password } = body;

    const sanitizedName = sanitizeString(name);
    const trimmedEmail = String(email ?? "").toLowerCase().trim();
    const rawPassword = String(password ?? "");

    if (!sanitizedName) {
      return NextResponse.json({ error: "Имя не может быть пустым" }, { status: 400 });
    }

    if (!trimmedEmail || !trimmedEmail.includes("@")) {
      return NextResponse.json({ error: "Введите корректный email" }, { status: 400 });
    }

    if (!validatePassword(rawPassword)) {
      return NextResponse.json(
        { error: "Пароль должен быть не менее 8 символов и содержать заглавные и строчные буквы, а также цифры" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email: trimmedEmail },
    });

    if (existing) {
      return NextResponse.json({ error: "Пользователь с таким email уже зарегистрирован" }, { status: 400 });
    }

    // Hash password
    const passwordHash = hashPassword(rawPassword);

    const verificationToken = crypto.randomUUID();

    // Create user in database
    const user = await prisma.user.create({
      data: {
        name: sanitizedName,
        email: trimmedEmail,
        passwordHash,
        tariff: "hobby",
        isSubscribed: false,
        emailVerified: false,
        emailVerificationToken: verificationToken,
      },
    });

    // Send email verification link
    try {
      const { sendVerificationEmail } = await import("@/actions/auth");
      const origin = request.headers.get("origin") || "http://localhost:3000";
      const verificationUrl = `${origin}/verify-email?token=${verificationToken}`;
      await sendVerificationEmail(trimmedEmail, verificationUrl);
    } catch (emailErr) {
      console.error("Verification email dispatch failed:", emailErr);
    }

    // Log registration audit event
    try {
      const { logAuditEvent } = await import("@/lib/auditLogger");
      let userAgent = "unknown";
      let ipAddress = "unknown";
      try {
        const { headers } = await import("next/headers");
        const reqHeaders = await headers();
        userAgent = reqHeaders.get("user-agent") || "unknown";
        ipAddress = reqHeaders.get("x-forwarded-for") || reqHeaders.get("x-real-ip") || "unknown";
      } catch {
        // request context offline
      }
      await logAuditEvent({
        userId: user.id,
        email: user.email,
        action: "user_register",
        details: `Registered new Credentials account. IP: ${ipAddress.slice(0, 50)}, OS/Browser: ${userAgent.slice(0, 150)}`
      });
    } catch (e) {
      console.error("Audit log failed for user registration:", e);
    }

    return NextResponse.json({ success: true, userId: user.id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("User registration error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
