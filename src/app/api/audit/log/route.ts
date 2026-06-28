import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { logAuditEvent } from "@/lib/auditLogger";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { action, details } = (await request.json()) as { action?: string; details?: string };
    if (!action) {
      return NextResponse.json({ error: "Action is required" }, { status: 400 });
    }

    await logAuditEvent({
      userId: session.user.id,
      email: session.user.email,
      action,
      details,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Client audit logging endpoint error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
