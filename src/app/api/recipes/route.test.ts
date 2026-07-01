import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, POST } from "./route";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { checkTariffLimit } from "@/lib/tariffLimits";

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
    recipe: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock("@/lib/tariffLimits", () => ({
  checkTariffLimit: vi.fn(),
}));

vi.mock("@/lib/encryption", () => ({
  encrypt: vi.fn((val) => `encrypted:${val}`),
  decrypt: vi.fn((val) => String(val).replace("encrypted:", "")),
  encryptJson: vi.fn((val) => JSON.stringify(val)),
  decryptJson: vi.fn((val) => typeof val === "string" ? JSON.parse(val) : val),
}));

vi.mock("@/lib/auditLogger", () => ({
  logAuditEvent: vi.fn().mockResolvedValue({}),
}));

describe("GET /api/recipes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when unauthenticated", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    const request = new Request("http://localhost:3000/api/recipes");
    const res = await GET(request);

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("Unauthorized");
  });

  it("returns single recipe of the user by ID", async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: "user-123" }
    });
    vi.mocked(prisma.recipe.findUnique).mockResolvedValue({
      id: "recipe-1",
      userId: "user-123",
      name: "encrypted:My Recipe",
      nodes: JSON.stringify([]),
      connections: JSON.stringify([])
    } as any);

    const request = new Request("http://localhost:3000/api/recipes?id=recipe-1");
    const res = await GET(request);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.recipe.name).toBe("My Recipe");
  });

  it("returns 404 if single recipe does not exist or belongs to another user", async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: "user-123" }
    });
    vi.mocked(prisma.recipe.findUnique).mockResolvedValue({
      id: "recipe-2",
      userId: "other-user-456",
      name: "encrypted:Secret Recipe",
      nodes: JSON.stringify([]),
      connections: JSON.stringify([])
    } as any);

    const request = new Request("http://localhost:3000/api/recipes?id=recipe-2");
    const res = await GET(request);

    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe("Recipe not found or forbidden");
  });

  it("returns list of user's recipes", async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: "user-123" }
    });
    vi.mocked(prisma.recipe.findMany).mockResolvedValue([
      {
        id: "recipe-1",
        userId: "user-123",
        name: "encrypted:My Recipe",
        nodes: JSON.stringify([]),
        connections: JSON.stringify([])
      }
    ] as any);

    const request = new Request("http://localhost:3000/api/recipes");
    const res = await GET(request);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.recipes.length).toBe(1);
    expect(body.recipes[0].name).toBe("My Recipe");
  });
});

describe("POST /api/recipes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when unauthenticated", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    const request = new Request("http://localhost:3000/api/recipes", {
      method: "POST",
      body: JSON.stringify({ name: "Recipe A", nodes: [], connections: [] })
    });
    const res = await POST(request);

    expect(res.status).toBe(401);
  });

  it("returns 400 when input validation fails (e.g. empty name, missing arrays)", async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: "user-123" }
    });

    // Empty/missing name -> returns 400
    const req1 = new Request("http://localhost:3000/api/recipes", {
      method: "POST",
      body: JSON.stringify({ name: "", nodes: [], connections: [] })
    });
    const res1 = await POST(req1);
    expect(res1.status).toBe(400);

    // Nodes field not an array
    const req2 = new Request("http://localhost:3000/api/recipes", {
      method: "POST",
      body: JSON.stringify({ name: "Recipe X", nodes: "not-an-array", connections: [] })
    });
    const res2 = await POST(req2);
    expect(res2.status).toBe(400);
  });

  it("returns 403 when user reaches recipes limit on creation", async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: "user-123" }
    });
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: "user-123", tariff: "hobby" } as any);
    vi.mocked(checkTariffLimit).mockResolvedValue({ allowed: false, limit: 10, current: 10 });

    const request = new Request("http://localhost:3000/api/recipes", {
      method: "POST",
      body: JSON.stringify({
        name: "New Recipe Limit Exceeded",
        nodes: [],
        connections: []
      })
    });
    const res = await POST(request);

    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.code).toBe("TARIFF_LIMIT_REACHED");
  });

  it("successfully creates a new recipe under allowed limits", async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: "user-123" }
    });
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: "user-123", tariff: "hobby" } as any);
    vi.mocked(checkTariffLimit).mockResolvedValue({ allowed: true, limit: 10, current: 5 });
    vi.mocked(prisma.recipe.create).mockResolvedValue({
      id: "recipe-999",
      userId: "user-123",
      name: "encrypted:Success Recipe",
      nodes: JSON.stringify([]),
      connections: JSON.stringify([])
    } as any);

    const request = new Request("http://localhost:3000/api/recipes", {
      method: "POST",
      body: JSON.stringify({
        name: "Success Recipe",
        nodes: [],
        connections: []
      })
    });
    const res = await POST(request);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.recipeId).toBe("recipe-999");
  });

  it("updates an existing recipe owned by the user", async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: "user-123" }
    });
    vi.mocked(prisma.recipe.findUnique).mockResolvedValue({
      id: "recipe-already-exists",
      userId: "user-123",
      name: "encrypted:Old Name"
    } as any);
    vi.mocked(prisma.recipe.update).mockResolvedValue({
      id: "recipe-already-exists",
      userId: "user-123",
      name: "encrypted:Updated Name",
      nodes: JSON.stringify([]),
      connections: JSON.stringify([])
    } as any);

    const request = new Request("http://localhost:3000/api/recipes", {
      method: "POST",
      body: JSON.stringify({
        recipeId: "recipe-already-exists",
        name: "Updated Name",
        nodes: [],
        connections: []
      })
    });
    const res = await POST(request);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    // Verified update calls
    expect(prisma.recipe.update).toHaveBeenCalled();
  });

  it("returns 404 when trying to update a recipe that is not owned by the user", async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: "user-123" }
    });
    vi.mocked(prisma.recipe.findUnique).mockResolvedValue({
      id: "recipe-forbidden",
      userId: "other-user-456",
      name: "encrypted:Other Recipe"
    } as any);

    const request = new Request("http://localhost:3000/api/recipes", {
      method: "POST",
      body: JSON.stringify({
        recipeId: "recipe-forbidden",
        name: "Hack attempt",
        nodes: [],
        connections: []
      })
    });
    const res = await POST(request);

    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe("Recipe not found or forbidden");
  });
});
