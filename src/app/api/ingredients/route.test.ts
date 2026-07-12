import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, POST, resetIngredientsCache } from "./route";
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
    ingredient: {
      findMany: vi.fn(),
    },
    customIngredient: {
      findMany: vi.fn(),
      create: vi.fn(),
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

describe("GET /api/ingredients", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset the module-level in-memory cache between tests
    resetIngredientsCache();
  });

  it("returns standard ingredients publicly (no session needed)", async () => {
    const mockStandard = [
      {
        id: 1,
        name: "Lactose",
        activeMolecules: [],
        effects: [],
        contraindications: [],
        stabilityData: {
          ph: 5.0,
          hygroscopicity: 10,
          lightSensitive: false,
          heatDegradation: null,
        },
        regulatoryData: {
          pharmacopoeiaGrade: "USP-NF",
          allergenStatus: "Lactose",
        },
      }
    ];
    vi.mocked(prisma.ingredient.findMany).mockResolvedValue(mockStandard as any);
    vi.mocked(getServerSession).mockResolvedValue(null);

    const request = new Request("http://localhost:3000/api/ingredients?type=standard");
    const res = await GET(request);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.ingredients[0].name).toBe("Lactose");
  });

  it("includes stabilityProfile and regulatoryInfo in standard ingredient response", async () => {
    const mockStandard = [
      {
        id: 1,
        name: "Lactose",
        activeMolecules: [],
        effects: [],
        contraindications: [],
        stabilityData: {
          ph: 5.0,
          hygroscopicity: 10,
          lightSensitive: false,
          heatDegradation: null,
        },
        regulatoryData: {
          pharmacopoeiaGrade: "USP-NF",
          allergenStatus: "Lactose",
        },
      }
    ];
    vi.mocked(prisma.ingredient.findMany).mockResolvedValue(mockStandard as any);
    vi.mocked(getServerSession).mockResolvedValue(null);

    const request = new Request("http://localhost:3000/api/ingredients?type=standard");
    const res = await GET(request);
    const body = await res.json();

    const ing = body.ingredients[0];
    // stabilityProfile must be present with correct shape
    expect(ing.stabilityProfile).toBeDefined();
    expect(ing.stabilityProfile.ph).toBe(5.0);
    expect(ing.stabilityProfile.hygroscopicity).toBe(10);
    expect(ing.stabilityProfile.lightSensitive).toBe(false);
    expect(ing.stabilityProfile.heatDegradation).toBeNull();
    // regulatoryInfo must be present with correct shape
    expect(ing.regulatoryInfo).toBeDefined();
    expect(ing.regulatoryInfo.pharmacopoeiaGrade).toBe("USP-NF");
    expect(ing.regulatoryInfo.allergenStatus).toBe("Lactose");
    // raw relation objects must not be exposed
    expect(ing.stabilityData).toBeUndefined();
    expect(ing.regulatoryData).toBeUndefined();
  });

  it("returns null stabilityProfile and regulatoryInfo when relations are missing (graceful fallback)", async () => {
    const mockStandard = [
      {
        id: 99,
        name: "Unknown Excipient",
        activeMolecules: [],
        effects: [],
        contraindications: [],
        stabilityData: null,
        regulatoryData: null,
      }
    ];
    vi.mocked(prisma.ingredient.findMany).mockResolvedValue(mockStandard as any);
    vi.mocked(getServerSession).mockResolvedValue(null);

    const request = new Request("http://localhost:3000/api/ingredients?type=standard");
    const res = await GET(request);
    const body = await res.json();

    const ing = body.ingredients[0];
    expect(ing.stabilityProfile).toBeNull();
    expect(ing.regulatoryInfo).toBeNull();
  });

  it("returns 401 for custom ingredients query when unauthenticated", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    const request = new Request("http://localhost:3000/api/ingredients?type=custom");
    const res = await GET(request);

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("Unauthorized");
  });

  it("returns decrypted custom ingredients for authenticated user", async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: "user-123" }
    });
    vi.mocked(prisma.customIngredient.findMany).mockResolvedValue([
      {
        id: "cust-1",
        userId: "user-123",
        name: "encrypted:My Ingredient",
        casNumber: "encrypted:50-00-0",
        effects: JSON.stringify(["Calming"]),
        contraindications: JSON.stringify([])
      }
    ] as any);

    const request = new Request("http://localhost:3000/api/ingredients?type=custom");
    const res = await GET(request);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.ingredients[0].name).toBe("My Ingredient");
    expect(body.ingredients[0].casNumber).toBe("50-00-0");
  });
});

describe("POST /api/ingredients", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when unauthenticated", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    const request = new Request("http://localhost:3000/api/ingredients", {
      method: "POST",
      body: JSON.stringify({ name: "Test" })
    });
    const res = await POST(request);

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("Unauthorized");
  });

  it("returns 400 for invalid inputs (empty name or densities)", async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: "user-123" }
    });

    // Empty name
    const req1 = new Request("http://localhost:3000/api/ingredients", {
      method: "POST",
      body: JSON.stringify({ name: "", role: "active", looseBulkDensity: 0.5, tappedBulkDensity: 0.6 })
    });
    const res1 = await POST(req1);
    expect(res1.status).toBe(400);

    // Mismatched densities (loose > tapped)
    const req2 = new Request("http://localhost:3000/api/ingredients", {
      method: "POST",
      body: JSON.stringify({ name: "Test", role: "active", looseBulkDensity: 0.7, tappedBulkDensity: 0.5 })
    });
    const res2 = await POST(req2);
    expect(res2.status).toBe(400);
    const body2 = await res2.json();
    expect(body2.error).toContain("Насыпная плотность не может превышать плотность с уплотнением");
  });

  it("returns 403 when user reaches their tariff limit", async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: "user-123" }
    });
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: "user-123", tariff: "hobby" } as any);
    vi.mocked(checkTariffLimit).mockResolvedValue({ allowed: false, limit: 3, current: 3 });

    const request = new Request("http://localhost:3000/api/ingredients", {
      method: "POST",
      body: JSON.stringify({
        name: "Excipient X",
        role: "filler",
        looseBulkDensity: 0.4,
        tappedBulkDensity: 0.5,
        costPerKgUsd: 12
      })
    });
    const res = await POST(request);

    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.code).toBe("TARIFF_LIMIT_REACHED");
  });

  it("successfully creates and encrypts ingredient under allowed tariff", async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: "user-123", email: "test@example.com" }
    });
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: "user-123", tariff: "hobby" } as any);
    vi.mocked(checkTariffLimit).mockResolvedValue({ allowed: true, limit: 3, current: 2 });
    vi.mocked(prisma.customIngredient.create).mockResolvedValue({
      id: "cust-123",
      userId: "user-123",
      name: "encrypted:New Active",
      role: "active",
      casNumber: "encrypted:99-99-9",
      looseBulkDensity: 0.5,
      tappedBulkDensity: 0.6,
      trueDensity: 0.6,
      costPerKgUsd: 45,
      isAllergen: false,
      effects: JSON.stringify([]),
      contraindications: JSON.stringify([]),
      sideEffects: JSON.stringify([])
    } as any);

    const request = new Request("http://localhost:3000/api/ingredients", {
      method: "POST",
      body: JSON.stringify({
        name: "New Active",
        role: "active",
        casNumber: "99-99-9",
        looseBulkDensity: 0.5,
        tappedBulkDensity: 0.6,
        costPerKgUsd: 45
      })
    });
    const res = await POST(request);

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.ingredient.name).toBe("New Active");
    expect(body.ingredient.casNumber).toBe("99-99-9");
  });

  it("returns 400 for invalid moisture content (>100 or <0)", async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: "user-123" }
    });

    const request = new Request("http://localhost:3000/api/ingredients", {
      method: "POST",
      body: JSON.stringify({
        name: "Moist Active",
        role: "active",
        looseBulkDensity: 0.5,
        tappedBulkDensity: 0.6,
        moistureContent: 150
      })
    });
    const res = await POST(request);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("Влажность должна быть числом от 0 до 100");
  });

  it("returns 400 for invalid solubility", async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: "user-123" }
    });

    const request = new Request("http://localhost:3000/api/ingredients", {
      method: "POST",
      body: JSON.stringify({
        name: "Water Active",
        role: "active",
        looseBulkDensity: 0.5,
        tappedBulkDensity: 0.6,
        solubility: "ether"
      })
    });
    const res = await POST(request);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("Некорректное значение растворимости");
  });

  it("successfully passes moistureContent and solubility to prisma.create", async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: "user-123" }
    });
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: "user-123", tariff: "professional" } as any);
    vi.mocked(checkTariffLimit).mockResolvedValue({ allowed: true, limit: 100, current: 5 });

    let passedData: any = null;
    (prisma.customIngredient.create as any).mockImplementation(async (args: any) => {
      passedData = args.data;
      return {
        id: "cust-123",
        userId: "user-123",
        name: "encrypted:Water Active",
        role: "active",
        casNumber: null,
        looseBulkDensity: 0.5,
        tappedBulkDensity: 0.6,
        trueDensity: 0.6,
        costPerKgUsd: 10,
        isAllergen: false,
        moistureContent: 4.5,
        solubility: "water",
        effects: JSON.stringify([]),
        contraindications: JSON.stringify([]),
        sideEffects: JSON.stringify([])
      } as any;
    });

    const request = new Request("http://localhost:3000/api/ingredients", {
      method: "POST",
      body: JSON.stringify({
        name: "Water Active",
        role: "active",
        looseBulkDensity: 0.5,
        tappedBulkDensity: 0.6,
        moistureContent: 4.5,
        solubility: "water"
      })
    });
    const res = await POST(request);
    expect(res.status).toBe(201);
    expect(passedData).toBeDefined();
    expect(passedData.moistureContent).toBe(4.5);
    expect(passedData.solubility).toBe("water");
  });

  it("returns 400 for invalid bitterness (>10 or <0)", async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: "user-123" }
    });

    const request = new Request("http://localhost:3000/api/ingredients", {
      method: "POST",
      body: JSON.stringify({
        name: "Bitter Active",
        role: "active",
        looseBulkDensity: 0.5,
        tappedBulkDensity: 0.6,
        bitterness: 15
      })
    });
    const res = await POST(request);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("Горечь должна быть числом от 0 до 10");
  });

  it("successfully passes bitterness to prisma.create", async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: "user-123" }
    });
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: "user-123", tariff: "professional" } as any);
    vi.mocked(checkTariffLimit).mockResolvedValue({ allowed: true, limit: 100, current: 5 });

    let passedData: any = null;
    (prisma.customIngredient.create as any).mockImplementation(async (args: any) => {
      passedData = args.data;
      return {
        id: "cust-123",
        userId: "user-123",
        name: "encrypted:Bitter Active",
        role: "active",
        casNumber: null,
        looseBulkDensity: 0.5,
        tappedBulkDensity: 0.6,
        trueDensity: 0.6,
        costPerKgUsd: 10,
        isAllergen: false,
        bitterness: 7.5,
        effects: JSON.stringify([]),
        contraindications: JSON.stringify([]),
        sideEffects: JSON.stringify([])
      } as any;
    });

    const request = new Request("http://localhost:3000/api/ingredients", {
      method: "POST",
      body: JSON.stringify({
        name: "Bitter Active",
        role: "active",
        looseBulkDensity: 0.5,
        tappedBulkDensity: 0.6,
        bitterness: 7.5
      })
    });
    const res = await POST(request);
    expect(res.status).toBe(201);
    expect(passedData).toBeDefined();
    expect(passedData.bitterness).toBe(7.5);
  });

  it("returns 400 for invalid overagePercent (>50 or <0)", async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: "user-123" }
    });

    const request = new Request("http://localhost:3000/api/ingredients", {
      method: "POST",
      body: JSON.stringify({
        name: "Overage Active",
        role: "active",
        looseBulkDensity: 0.5,
        tappedBulkDensity: 0.6,
        overagePercent: 55
      })
    });
    const res = await POST(request);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("Технологический избыток (Overage) должен быть числом от 0 до 50");
  });

  it("successfully passes overagePercent to prisma.create", async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: "user-123" }
    });
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: "user-123", tariff: "professional" } as any);
    vi.mocked(checkTariffLimit).mockResolvedValue({ allowed: true, limit: 100, current: 5 });

    let passedData: any = null;
    (prisma.customIngredient.create as any).mockImplementation(async (args: any) => {
      passedData = args.data;
      return {
        id: "cust-123",
        userId: "user-123",
        name: "encrypted:Overage Active",
        role: "active",
        casNumber: null,
        looseBulkDensity: 0.5,
        tappedBulkDensity: 0.6,
        trueDensity: 0.6,
        costPerKgUsd: 10,
        isAllergen: false,
        overagePercent: 12.5,
        effects: JSON.stringify([]),
        contraindications: JSON.stringify([]),
        sideEffects: JSON.stringify([])
      } as any;
    });

    const request = new Request("http://localhost:3000/api/ingredients", {
      method: "POST",
      body: JSON.stringify({
        name: "Overage Active",
        role: "active",
        looseBulkDensity: 0.5,
        tappedBulkDensity: 0.6,
        overagePercent: 12.5
      })
    });
    const res = await POST(request);
    expect(res.status).toBe(201);
    expect(passedData).toBeDefined();
    expect(passedData.overagePercent).toBe(12.5);
  });
});
