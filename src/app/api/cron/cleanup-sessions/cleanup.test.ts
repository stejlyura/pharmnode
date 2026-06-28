import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { GET } from "./route";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    userSession: {
      deleteMany: vi.fn(),
    },
  },
  default: {
    userSession: {
      deleteMany: vi.fn(),
    },
  },
}));

describe("Session Cleanup Cron Route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("CRON_SECRET", "test_cron_secret");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("should clean up sessions in development without auth header", async () => {
    const deleteManyMock = vi.mocked(prisma.userSession.deleteMany);
    deleteManyMock.mockResolvedValueOnce({ count: 5 });

    const request = new Request("http://localhost:3000/api/cron/cleanup-sessions");
    const response = await GET(request);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.deletedSessionsCount).toBe(5);

    expect(deleteManyMock).toHaveBeenCalledWith({
      where: {
        lastUsed: {
          lt: expect.any(Date),
        },
      },
    });
  });

  it("should fail with 401 in production if Authorization header is missing", async () => {
    vi.stubEnv("NODE_ENV", "production");

    const request = new Request("http://localhost:3000/api/cron/cleanup-sessions");
    const response = await GET(request);

    expect(response.status).toBe(401);
  });

  it("should fail with 401 in production if Authorization header is incorrect", async () => {
    vi.stubEnv("NODE_ENV", "production");

    const request = new Request("http://localhost:3000/api/cron/cleanup-sessions", {
      headers: {
        Authorization: "Bearer wrong_secret",
      },
    });
    const response = await GET(request);

    expect(response.status).toBe(401);
  });

  it("should succeed in production with correct Authorization header", async () => {
    vi.stubEnv("NODE_ENV", "production");

    const deleteManyMock = vi.mocked(prisma.userSession.deleteMany);
    deleteManyMock.mockResolvedValueOnce({ count: 12 });

    const request = new Request("http://localhost:3000/api/cron/cleanup-sessions", {
      headers: {
        Authorization: "Bearer test_cron_secret",
      },
    });
    const response = await GET(request);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.deletedSessionsCount).toBe(12);
  });
});
