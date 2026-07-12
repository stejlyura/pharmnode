import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { sanitizeString, validateRole, validateDensity, validatePercentage, validateOptionalString, validateDilutionScale, validateEffects, validateContraindications, validateSideEffects, validateBitterness } from "@/lib/validation";
import { checkTariffLimit } from "@/lib/tariffLimits";
import { unstable_cache } from "next/cache";

const isDev = process.env.NODE_ENV === "development";

// ─── Tariff limits (enforced server-side only) ────────────────────────────────
const TARIFF_LIMITS: Record<string, number> = {
  hobby: 3,
  professional: Infinity,
  enterprise: Infinity,
};

// ─── Valid ingredient roles per domain model ──────────────────────────────────
const VALID_ROLES = ["active", "filler", "lubricant", "glidant", "dry-binder"] as const;
type IngredientRole = (typeof VALID_ROLES)[number];

function isValidRole(role: unknown): role is IngredientRole {
  return VALID_ROLES.includes(role as IngredientRole);
}

// Wrapper to bypass unstable_cache during testing to ensure mock and test isolation
const customCache = <T extends (...args: any[]) => Promise<any>>(
  fn: T,
  keys: string[],
  options?: { revalidate?: number; tags?: string[] }
): T => {
  if (process.env.NODE_ENV === "test") {
    return fn;
  }
  return unstable_cache(fn, keys, options);
};

const getCachedStandardIngredients = customCache(
  async () => {
    const dbIngredients = await prisma.ingredient.findMany({
      orderBy: { id: "asc" },
      include: {
        activeMolecules: true,
        effects: { include: { effect: true } },
        contraindications: { include: { contraindication: true } },
        stabilityData: true,
        regulatoryData: true,
      },
    });

    return dbIngredients.map(ing => ({
      ...ing,
      effects: ing.effects.map(e => e.effect.name),
      contraindications: ing.contraindications.map(c => c.contraindication.name),
      // Map 1:1 relations to clean optional nested objects
      stabilityProfile: ing.stabilityData
        ? {
            ph: ing.stabilityData.ph,
            hygroscopicity: ing.stabilityData.hygroscopicity,
            lightSensitive: ing.stabilityData.lightSensitive,
            heatDegradation: ing.stabilityData.heatDegradation,
          }
        : null,
      regulatoryInfo: ing.regulatoryData
        ? {
            pharmacopoeiaGrade: ing.regulatoryData.pharmacopoeiaGrade,
            allergenStatus: ing.regulatoryData.allergenStatus,
          }
        : null,
      // Remove raw relation objects from top-level response
      stabilityData: undefined,
      regulatoryData: undefined,
    }));
  },
  ["standard-ingredients"],
  {
    revalidate: 300, // 5 minutes
    tags: ["ingredients"]
  }
);

/** Exported for test isolation only — resets the module-level ingredient cache */
export function resetIngredientsCache() {
  // No-op under unstable_cache as cache is bypassed during testing (NODE_ENV === 'test')
}

// ─── GET /api/ingredients ─────────────────────────────────────────────────────
// Query params:
//   ?type=standard  → standard ingredients from Ingredient table (public, no auth)
//   ?type=custom    → custom ingredients of the authenticated user (requires auth)
//   ?type=all       → standard + custom merged (requires auth)
//   (no param)      → defaults to "standard" for unauthenticated, "all" for authenticated
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const typeParam = searchParams.get("type"); // standard | custom | all | null

    // Mock user support
    const queryUserId = searchParams.get("userId");
    if (isDev && queryUserId && String(queryUserId).startsWith("mock-")) {
      return NextResponse.json({ success: true, ingredients: [] });
    }

    const session = await getServerSession(authOptions);
    const activeUserId = session?.user?.id;
    const now = Date.now();

    // "standard" is always public — no auth needed
    if (typeParam === "standard" || (!typeParam && !activeUserId)) {
      const standardIngredients = await getCachedStandardIngredients();
      return NextResponse.json({ success: true, ingredients: standardIngredients });
    }

    // "custom" and "all" require authentication
    if (!activeUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { decrypt, decryptJson } = await import("@/lib/encryption");
    const decryptCustomIngredient = (ing: {
      name: string;
      casNumber?: string | null;
      source?: string | null;
      effects?: unknown;
      contraindications?: unknown;
      sideEffects?: unknown;
      [key: string]: unknown;
    }) => ({
      ...ing,
      name: decrypt(ing.name),
      casNumber: ing.casNumber ? decrypt(ing.casNumber) : null,
      source: ing.source ? decrypt(ing.source) : null,
      effects: decryptJson(ing.effects),
      contraindications: decryptJson(ing.contraindications),
      sideEffects: decryptJson(ing.sideEffects),
    });

    if (typeParam === "custom") {
      const customIngredients = await prisma.customIngredient.findMany({
        where: { userId: activeUserId },
        orderBy: { createdAt: "desc" },
      });
      const decryptedCustom = customIngredients.map(decryptCustomIngredient);
      return NextResponse.json({ success: true, ingredients: decryptedCustom });
    }

    // "all" or authenticated user with no param → standard + custom merged
    const standardIngredients = await getCachedStandardIngredients() as any[];

    const customIngredients = await prisma.customIngredient.findMany({
      where: { userId: activeUserId },
      orderBy: { createdAt: "desc" },
    });
    const decryptedCustom = customIngredients.map(decryptCustomIngredient);

    return NextResponse.json({
      success: true,
      ingredients: [...standardIngredients, ...decryptedCustom],
      standard: standardIngredients,
      custom: decryptedCustom,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Fetch ingredients error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ─── POST /api/ingredients ────────────────────────────────────────────────────
// Creates a new custom ingredient for the authenticated user.
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const activeUserId = session?.user?.id;

    const body: Record<string, unknown> = await request.json();
    const {
      name,
      role,
      casNumber,
      looseBulkDensity,
      tappedBulkDensity,
      trueDensity,
      costPerKgUsd,
      maxSafePercentage,
      isAllergen,
      userId,
      source,
      dilutionScale,
      dosageForm,
      applicationArea,
      processingTech,
      effects,
      contraindications,
      sideEffects,
      moistureContent,
      solubility,
      bitterness,
      overagePercent,
    } = body;

    // ── Mock dev support ────────────────────────────────────────────────────
    if (isDev && userId && String(userId).startsWith("mock-")) {
      return NextResponse.json({
        success: true,
        mock: true,
        ingredient: { id: "custom-" + Date.now(), ...body },
      });
    }

    if (!activeUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ── Validation using helpers ────────────────────────────────────────────
    let cleanName: string;
    let cleanCas: string;
    let validatedRole: string;
    let parsedLoose: number;
    let parsedTapped: number;
    let parsedTrue: number;
    let parsedCost: number;
    let parsedMaxSafe: number;
    let validatedSource: string | null = null;
    let validatedDilutionScale: string | null = null;
    let validatedDosageForm: string | null = null;
    let validatedApplicationArea: string | null = null;
    let validatedProcessingTech: string | null = null;
    let validatedEffects: string[] = [];
    let validatedContraindications: string[] = [];
    let validatedSideEffects: { name: string; frequency: string; severity: 'low' | 'medium' | 'high' }[] = [];
    let parsedMoisture: number | null = null;
    let validatedSolubility: string | null = null;
    let parsedBitterness: number | null = null;
    let parsedOverage: number = 0.0;

    try {
      cleanName = sanitizeString(name);
      if (!cleanName) {
        throw new Error("Название компонента не должно быть пустым");
      }
      cleanCas = sanitizeString(casNumber);
      validatedRole = validateRole(role);
      
      parsedLoose = validateDensity(looseBulkDensity, "Насыпная плотность");
      parsedTapped = validateDensity(tappedBulkDensity, "Плотность с уплотнением");
      
      if (parsedLoose > parsedTapped) {
        throw new Error("Насыпная плотность не может превышать плотность с уплотнением");
      }

      parsedTrue = trueDensity !== undefined 
        ? validateDensity(trueDensity, "Истинная плотность") 
        : parsedTapped;

      parsedCost = parseFloat(String(costPerKgUsd ?? 0));
      if (isNaN(parsedCost) || parsedCost < 0) {
        throw new Error("Стоимость за кг не может быть отрицательной");
      }

      parsedMaxSafe = validatePercentage(maxSafePercentage ?? 100, "Максимальный безопасный процент");

      if (moistureContent !== undefined && moistureContent !== null) {
        parsedMoisture = parseFloat(String(moistureContent));
        if (isNaN(parsedMoisture) || parsedMoisture < 0 || parsedMoisture > 100) {
          throw new Error("Влажность должна быть числом от 0 до 100");
        }
      }
      if (solubility !== undefined && solubility !== null) {
        const solStr = String(solubility).toLowerCase();
        if (solStr === 'water' || solStr === 'lipid' || solStr === 'none') {
          validatedSolubility = solStr;
        } else if (solStr !== '') {
          throw new Error("Некорректное значение растворимости");
        }
      }

      if (bitterness !== undefined && bitterness !== null && bitterness !== "") {
        parsedBitterness = validateBitterness(bitterness) ?? null;
      }

      if (overagePercent !== undefined && overagePercent !== null && overagePercent !== "") {
        parsedOverage = parseFloat(String(overagePercent));
        if (isNaN(parsedOverage) || parsedOverage < 0 || parsedOverage > 50) {
          throw new Error("Технологический избыток (Overage) должен быть числом от 0 до 50");
        }
      }

      validatedSource = validateOptionalString(source, 255, "Источник вещества");
      validatedDilutionScale = validateDilutionScale(dilutionScale);
      validatedDosageForm = validateOptionalString(dosageForm, 255, "Форма выпуска");
      validatedApplicationArea = validateOptionalString(applicationArea, 255, "Область применения");
      validatedProcessingTech = validateOptionalString(processingTech, 255, "Технология производства");
      validatedEffects = validateEffects(effects);
      validatedContraindications = validateContraindications(contraindications);
      validatedSideEffects = validateSideEffects(sideEffects);
    } catch (validationErr: unknown) {
      const msg = validationErr instanceof Error ? validationErr.message : "Validation error";
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    // ── Tariff limit check ──────────────────────────────────────────────────
    const dbUser = await prisma.user.findUnique({ where: { id: activeUserId } });
    const tariff = dbUser?.tariff ?? "hobby";

    const limitCheck = await checkTariffLimit(activeUserId, tariff, "ingredients");
    if (!limitCheck.allowed) {
      return NextResponse.json(
        {
          error: `Достигнут лимит тарифа (${limitCheck.limit} ингредиентов). Обновите тариф до Professional.`,
          code: "TARIFF_LIMIT_REACHED",
        },
        { status: 403 }
      );
    }

    // ── Encrypt fields ──────────────────────────────────────────────────────
    const { encrypt, encryptJson } = await import("@/lib/encryption");
    const encryptedName = encrypt(cleanName);
    const encryptedCas = cleanCas ? encrypt(cleanCas) : null;
    const encryptedSource = validatedSource ? encrypt(validatedSource) : null;
    const encryptedEffects = encryptJson(validatedEffects) as Prisma.InputJsonValue;
    const encryptedContraindications = encryptJson(validatedContraindications) as Prisma.InputJsonValue;
    const encryptedSideEffects = encryptJson(validatedSideEffects) as Prisma.InputJsonValue;

    // ── Persist ─────────────────────────────────────────────────────────────
    const newIngredient = await prisma.customIngredient.create({
      data: {
        userId: activeUserId,
        name: encryptedName,
        role: validatedRole,
        casNumber: encryptedCas,
        looseBulkDensity: parsedLoose,
        tappedBulkDensity: parsedTapped,
        trueDensity: parsedTrue,
        costPerKgUsd: parsedCost,
        maxSafePercentage: parsedMaxSafe,
        isAllergen: !!isAllergen,
        source: encryptedSource,
        dilutionScale: validatedDilutionScale,
        dosageForm: validatedDosageForm,
        applicationArea: validatedApplicationArea,
        processingTech: validatedProcessingTech,
        effects: encryptedEffects,
        contraindications: encryptedContraindications,
        sideEffects: encryptedSideEffects,
        moistureContent: parsedMoisture,
        solubility: validatedSolubility,
        bitterness: parsedBitterness,
        overagePercent: parsedOverage,
      },
    });

    const clientIngredient = {
      ...newIngredient,
      name: cleanName,
      casNumber: cleanCas || null,
      source: validatedSource,
      effects: validatedEffects,
      contraindications: validatedContraindications,
      sideEffects: validatedSideEffects,
      overagePercent: parsedOverage,
    };

    // Log compliance event
    const { logAuditEvent } = await import("@/lib/auditLogger");
    await logAuditEvent({
      userId: activeUserId,
      email: session?.user?.email,
      action: "custom_ingredient_create",
      details: `Ingredient ID: ${newIngredient.id}, Name: ${cleanName}`
    });

    return NextResponse.json({ success: true, ingredient: clientIngredient }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Save custom ingredient error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
