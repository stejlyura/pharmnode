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
  const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "PasswordforAdmin123";
  const expectedAuth =
    "Basic " + Buffer.from(`${ADMIN_USERNAME}:${ADMIN_PASSWORD}`).toString("base64");

  return !!(authHeader && authHeader === expectedAuth);
}

export async function GET(request: Request) {
  try {
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
    console.error("Admin settings GET route error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const isAuthorized = await verifyAdmin(request);
    if (!isAuthorized) {
      return new Response("Unauthorized", {
        status: 401,
        headers: { "WWW-Authenticate": 'Basic realm="Admin Portal"' },
      });
    }

    const { key, value } = await request.json();
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
    console.error("Admin settings POST route error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
