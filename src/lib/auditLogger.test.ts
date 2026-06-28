import { describe, it, expect, vi, beforeEach } from "vitest";
import { logAuditEvent } from "./auditLogger";
import { prisma } from "./prisma";
import type { AuditLog, SystemSetting } from "@prisma/client";

vi.mock("./prisma", () => ({
  prisma: {
    systemSetting: {
      findUnique: vi.fn(),
    },
    auditLog: {
      create: vi.fn(),
    },
  },
  default: {
    systemSetting: {
      findUnique: vi.fn(),
    },
    auditLog: {
      create: vi.fn(),
    },
  },
}));

vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue(new Map()),
}));

describe("Audit Logger System", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should write audit log by default if no database setting is found", async () => {
    const findUniqueMock = vi.mocked(prisma.systemSetting.findUnique);
    findUniqueMock.mockResolvedValueOnce(null);

    const mockAuditLog: AuditLog = {
      id: "log-123",
      userId: "user-123",
      email: "user@example.com",
      action: "test_action",
      details: "test details",
      ipAddress: "127.0.0.1",
      userAgent: "vitest",
      createdAt: new Date(),
    };

    const createMock = vi.mocked(prisma.auditLog.create);
    createMock.mockResolvedValueOnce(mockAuditLog);

    await logAuditEvent({
      userId: "user-123",
      email: "user@example.com",
      action: "test_action",
      details: "test details",
    });

    expect(findUniqueMock).toHaveBeenCalledWith({
      where: { key: "audit_logging_enabled" },
    });
    expect(createMock).toHaveBeenCalled();
  });

  it("should NOT write audit log if database setting is false", async () => {
    const mockSetting: SystemSetting = {
      key: "audit_logging_enabled",
      value: "false",
    };

    const findUniqueMock = vi.mocked(prisma.systemSetting.findUnique);
    findUniqueMock.mockResolvedValueOnce(mockSetting);

    const createMock = vi.mocked(prisma.auditLog.create);

    await logAuditEvent({
      userId: "user-123",
      email: "user@example.com",
      action: "test_action",
      details: "test details",
    });

    expect(findUniqueMock).toHaveBeenCalled();
    expect(createMock).not.toHaveBeenCalled();
  });
});
