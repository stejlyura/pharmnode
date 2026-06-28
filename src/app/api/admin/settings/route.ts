import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function verifyAdmin(request: Request): Promise<boolean> {
  const session = await getServerSession(authOptions);
  const isSessionAdmin = session?.user?.email === "admin@pharmnode.com";
  if (isSessionAdmin) return true;

  const authHeader = request.headers.get("authorization");
  const isProduction = process.env.NODE_ENV === "production";
  if (isProduction && (!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD)) {
    throw new Error("ADMIN_USERNAME and ADMIN_PASSWORD environment variables must be set in production.");
  }
  const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "PasswordforAdmin123";
  const expectedAuth =
    "Basic " + Buffer.from(`${ADMIN_USERNAME}:${ADMIN_PASSWORD}`).toString("base64");
  const isAuthorized = !!(authHeader && authHeader === expectedAuth);
  if (!isAuthorized) {
    const { rateLimit } = await import("@/lib/rateLimit");
    const failedLimiter = await rateLimit("admin_basic_auth_failed", {
      limit: 5,
      windowMs: 15 * 60 * 1000,
    });
    if (!failedLimiter.success) {
      throw new Error("RATE_LIMIT_EXCEEDED");
    }
  }

  return isAuthorized;
}

export async function GET(request: Request) {
  try {
    const { rateLimit } = await import("@/lib/rateLimit");
    const limiter = await rateLimit("admin_settings", {
      limit: 20,
      windowMs: 15 * 60 * 1000,
    });
    if (!limiter.success) {
      return NextResponse.json(
        { error: "Too many admin requests. Please try again in 15 minutes." },
        { status: 429 }
      );
    }

    const isAuthorized = await verifyAdmin(request);
    if (!isAuthorized) {
      return new Response("Unauthorized", {
        status: 401,
        headers: { "WWW-Authenticate": 'Basic realm="Admin Portal"' },
      });
    }

    const setting = await prisma.systemSetting.findUnique({
      where: { key: "audit_logging_enabled" },
    });

    const isEnabled = setting ? setting.value === "true" : false;

    return NextResponse.json({ success: true, auditLoggingEnabled: isEnabled });
  } catch (err) {
    if (err instanceof Error && err.message === "RATE_LIMIT_EXCEEDED") {
      return new Response("Too many failed auth attempts. Please try again in 15 minutes.", {
        status: 429,
      });
    }
    console.error("Admin settings GET route error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { rateLimit } = await import("@/lib/rateLimit");
    const limiter = await rateLimit("admin_settings", {
      limit: 20,
      windowMs: 15 * 60 * 1000,
    });
    if (!limiter.success) {
      return NextResponse.json(
        { error: "Too many admin requests. Please try again in 15 minutes." },
        { status: 429 }
      );
    }

    const isAuthorized = await verifyAdmin(request);
    if (!isAuthorized) {
      return new Response("Unauthorized", {
        status: 401,
        headers: { "WWW-Authenticate": 'Basic realm="Admin Portal"' },
      });
    }

    const { key, value } = (await request.json()) as { key?: string; value?: unknown };
    if (!key || value === undefined) {
      return NextResponse.json({ error: "Key and value are required" }, { status: 400 });
    }

    await prisma.systemSetting.upsert({
      where: { key },
      update: { value: String(value) },
      create: { key, value: String(value) },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof Error && err.message === "RATE_LIMIT_EXCEEDED") {
      return new Response("Too many failed auth attempts. Please try again in 15 minutes.", {
        status: 429,
      });
    }
    console.error("Admin settings POST route error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
