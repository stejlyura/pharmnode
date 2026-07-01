import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";
import prisma from "@/lib/prisma";
import { EventName } from "@paddle/paddle-node-sdk";

vi.mock("@paddle/paddle-node-sdk", () => {
  const localMockUnmarshal = vi.fn();
  (globalThis as any).__mockUnmarshal = localMockUnmarshal;
  return {
    Environment: {
      sandbox: "sandbox",
      production: "production",
    },
    EventName: {
      TransactionCompleted: "transaction.completed",
      SubscriptionCreated: "subscription.created",
      SubscriptionUpdated: "subscription.updated",
      SubscriptionCanceled: "subscription.canceled",
    },
    Paddle: class {
      webhooks = {
        unmarshal: localMockUnmarshal,
      };
    },
  };
});

const mockUnmarshal = (globalThis as any).__mockUnmarshal;

vi.mock("@/lib/prisma", () => {
  const mockPrisma = {
    processedWebhook: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    auditLog: {
      create: vi.fn(),
    },
  };
  return {
    prisma: mockPrisma,
    default: mockPrisma,
  };
});

vi.mock("@/lib/logger", () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe("POST /api/webhooks/paddle", () => {
  const originalSecret = process.env.PADDLE_WEBHOOK_SECRET;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.PADDLE_WEBHOOK_SECRET = "test_webhook_secret";
  });

  it("returns 400 when paddle-signature header is missing", async () => {
    const request = new Request("http://localhost:3000/api/webhooks/paddle", {
      method: "POST",
      body: "raw-body",
    });
    const res = await POST(request);

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Missing paddle-signature header");
  });

  it("returns 500 when PADDLE_WEBHOOK_SECRET is not configured", async () => {
    delete process.env.PADDLE_WEBHOOK_SECRET;

    const request = new Request("http://localhost:3000/api/webhooks/paddle", {
      method: "POST",
      body: "raw-body",
      headers: {
        "paddle-signature": "sig-123",
      },
    });
    const res = await POST(request);

    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe("Configuration error");
  });

  it("returns 400 when unmarshalling signature validation fails", async () => {
    mockUnmarshal.mockResolvedValue(null);

    const request = new Request("http://localhost:3000/api/webhooks/paddle", {
      method: "POST",
      body: "raw-body",
      headers: {
        "paddle-signature": "invalid-sig",
      },
    });
    const res = await POST(request);

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Invalid webhook signature");
  });

  it("returns 200 and skips processing if event is already processed", async () => {
    mockUnmarshal.mockResolvedValue({
      eventId: "evt-already-done",
      eventType: "subscription.created",
    });
    vi.mocked(prisma.processedWebhook.findUnique).mockResolvedValue({
      id: "evt-already-done",
    } as any);

    const request = new Request("http://localhost:3000/api/webhooks/paddle", {
      method: "POST",
      body: "raw-body",
      headers: {
        "paddle-signature": "valid-sig",
      },
    });
    const res = await POST(request);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.message).toBe("Already processed");
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it("processes SubscriptionCreated successfully to upgrade user tariff", async () => {
    mockUnmarshal.mockResolvedValue({
      eventId: "evt-new-sub",
      eventType: EventName.SubscriptionCreated,
      data: {
        customData: { userId: "user-123" },
        customerId: "cust-abc",
        id: "sub-xyz",
        nextBilledAt: "2026-07-29T12:00:00Z",
      },
    });
    vi.mocked(prisma.processedWebhook.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "user-123",
      email: "user@example.com",
    } as any);

    const request = new Request("http://localhost:3000/api/webhooks/paddle", {
      method: "POST",
      body: "raw-body",
      headers: {
        "paddle-signature": "valid-sig",
      },
    });
    const res = await POST(request);

    expect(res.status).toBe(200);
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: "user-123" },
      data: {
        isSubscribed: true,
        tariff: "professional",
        paddleSubId: "sub-xyz",
        paddleCustomerId: "cust-abc",
        renewsAt: new Date("2026-07-29T12:00:00Z"),
      },
    });
    expect(prisma.processedWebhook.create).toHaveBeenCalledWith({
      data: { id: "evt-new-sub" },
    });
  });

  it("processes SubscriptionUpdated (canceled status) to downgrade user tariff", async () => {
    mockUnmarshal.mockResolvedValue({
      eventId: "evt-sub-upd",
      eventType: EventName.SubscriptionUpdated,
      data: {
        id: "sub-xyz",
        status: "canceled",
      },
    });
    vi.mocked(prisma.processedWebhook.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.user.findFirst).mockResolvedValue({
      id: "user-123",
      email: "user@example.com",
      paddleSubId: "sub-xyz",
    } as any);

    const request = new Request("http://localhost:3000/api/webhooks/paddle", {
      method: "POST",
      body: "raw-body",
      headers: {
        "paddle-signature": "valid-sig",
      },
    });
    const res = await POST(request);

    expect(res.status).toBe(200);
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: "user-123" },
      data: {
        isSubscribed: false,
        tariff: "hobby",
        renewsAt: null,
      },
    });
  });

  it("processes SubscriptionCanceled directly to downgrade user tariff", async () => {
    mockUnmarshal.mockResolvedValue({
      eventId: "evt-sub-cancel",
      eventType: EventName.SubscriptionCanceled,
      data: {
        id: "sub-xyz",
      },
    });
    vi.mocked(prisma.processedWebhook.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.user.findFirst).mockResolvedValue({
      id: "user-123",
      email: "user@example.com",
      paddleSubId: "sub-xyz",
    } as any);

    const request = new Request("http://localhost:3000/api/webhooks/paddle", {
      method: "POST",
      body: "raw-body",
      headers: {
        "paddle-signature": "valid-sig",
      },
    });
    const res = await POST(request);

    expect(res.status).toBe(200);
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: "user-123" },
      data: {
        isSubscribed: false,
        tariff: "hobby",
        renewsAt: null,
      },
    });
  });
});
