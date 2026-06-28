import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { rateLimit } = await import("@/lib/rateLimit");
    const limiter = await rateLimit("admin_audit_logs", {
      limit: 20,
      windowMs: 15 * 60 * 1000,
    });
    if (!limiter.success) {
      return NextResponse.json(
        { error: "Too many admin requests. Please try again in 15 minutes." },
        { status: 429 }
      );
    }

    const session = await getServerSession(authOptions);
    const isSessionAdmin = session?.user?.email === "admin@pharmnode.com";
    let isAuthorized = isSessionAdmin;

    if (!isAuthorized) {
      const authHeader = request.headers.get("authorization");
      const isProduction = process.env.NODE_ENV === "production";
      if (isProduction && (!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD)) {
        throw new Error("ADMIN_USERNAME and ADMIN_PASSWORD environment variables must be set in production.");
      }
      const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
      const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "PasswordforAdmin123";
      const expectedAuth =
        "Basic " + Buffer.from(`${ADMIN_USERNAME}:${ADMIN_PASSWORD}`).toString("base64");

      if (authHeader && authHeader === expectedAuth) {
        isAuthorized = true;
      } else {
        const failedLimiter = await rateLimit("admin_basic_auth_failed", {
          limit: 5,
          windowMs: 15 * 60 * 1000,
        });
        if (!failedLimiter.success) {
          return new Response("Too many failed auth attempts. Please try again in 15 minutes.", {
            status: 429,
          });
        }
      }
    }

    if (!isAuthorized) {
      return new Response("Unauthorized", {
        status: 401,
        headers: { "WWW-Authenticate": 'Basic realm="Admin Portal"' },
      });
    }

    const auditLogs = await prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    return NextResponse.json({ success: true, auditLogs });
  } catch (err) {
    console.error("Admin audit logs route error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
