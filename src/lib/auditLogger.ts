import { prisma } from "./prisma";
import { headers } from "next/headers";

/**
 * Log a B2B compliant audit event if audit logging is active.
 */
export async function logAuditEvent(params: {
  userId?: string | null;
  email?: string | null;
  action: string;
  details?: string | null;
}) {
  try {
    // Check system setting to determine if logging is enabled
    const setting = await prisma.systemSetting.findUnique({
      where: { key: "audit_logging_enabled" },
    });
    
    // Default to false (off by default)
    const isEnabled = setting ? setting.value === "true" : false;
    if (!isEnabled) {
      return;
    }

    let ipAddress: string | null = null;
    let userAgent: string | null = null;

    try {
      const reqHeaders = await headers();
      ipAddress = reqHeaders.get("x-forwarded-for") || reqHeaders.get("x-real-ip") || "unknown";
      userAgent = reqHeaders.get("user-agent") || "unknown";
    } catch {
      // Safe fallback when headers() cannot be called (e.g. background job / server start)
    }

    await prisma.auditLog.create({
      data: {
        userId: params.userId || null,
        email: params.email || null,
        action: params.action,
        details: params.details || null,
        ipAddress,
        userAgent,
      },
    });
  } catch (err) {
    console.error("Failed to write audit log entry:", err);
  }
}
