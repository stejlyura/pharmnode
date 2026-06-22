import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { sanitizeString } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const body = await request.json();
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

    if (!rawPassword || rawPassword.length < 6) {
      return NextResponse.json({ error: "Пароль должен быть не менее 6 символов" }, { status: 400 });
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

    // Create user in database
    const user = await prisma.user.create({
      data: {
        name: sanitizedName,
        email: trimmedEmail,
        passwordHash,
        tariff: "hobby",
        isSubscribed: false,
      },
    });

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
