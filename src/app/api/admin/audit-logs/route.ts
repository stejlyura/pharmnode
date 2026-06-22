import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const isSessionAdmin = session?.user?.email === "admin@pharmnode.com";
    let isAuthorized = isSessionAdmin;

    if (!isAuthorized) {
      const authHeader = request.headers.get("authorization");
      const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
      const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "PasswordforAdmin123";
      const expectedAuth =
        "Basic " + Buffer.from(`${ADMIN_USERNAME}:${ADMIN_PASSWORD}`).toString("base64");

      if (authHeader && authHeader === expectedAuth) {
        isAuthorized = true;
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
