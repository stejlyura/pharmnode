import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAuditEvent } from "@/lib/auditLogger";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sessions = await prisma.userSession.findMany({
      where: { userId: session.user.id },
      orderBy: { lastUsed: "desc" },
    });

    return NextResponse.json({ success: true, sessions });
  } catch (err) {
    console.error("Sessions GET error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { all, sessionId } = body;

    if (all) {
      await prisma.userSession.deleteMany({
        where: { userId: session.user.id },
      });

      await logAuditEvent({
        userId: session.user.id,
        email: session.user.email,
        action: "user_revoke_all_sessions",
        details: "User revoked all active device sessions."
      });

      return NextResponse.json({ success: true });
    }

    if (sessionId) {
      const existing = await prisma.userSession.findFirst({
        where: { id: sessionId, userId: session.user.id },
      });

      if (!existing) {
        return NextResponse.json({ error: "Session not found" }, { status: 404 });
      }

      await prisma.userSession.delete({
        where: { id: sessionId },
      });

      await logAuditEvent({
        userId: session.user.id,
        email: session.user.email,
        action: "user_revoke_session",
        details: `Revoked session ID: ${sessionId} (IP: ${existing.ipAddress})`
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
  } catch (err) {
    console.error("Sessions DELETE error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
