import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sanitizeString, validateRole, validateDensity, validatePercentage, validateOptionalString, validateDilutionScale } from "@/lib/validation";
import { checkTariffLimit } from "@/lib/tariffLimits";

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
    if (queryUserId && String(queryUserId).startsWith("mock-")) {
      return NextResponse.json({ success: true, ingredients: [] });
    }

    const session = await getServerSession(authOptions);
    const activeUserId = session?.user?.id;

    // "standard" is always public — no auth needed
    if (typeParam === "standard" || (!typeParam && !activeUserId)) {
      const standardIngredients = await prisma.ingredient.findMany({
        orderBy: { id: "asc" },
      });
      return NextResponse.json({ success: true, ingredients: standardIngredients });
    }

    // "custom" and "all" require authentication
    if (!activeUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (typeParam === "custom") {
      const customIngredients = await prisma.customIngredient.findMany({
        where: { userId: activeUserId },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json({ success: true, ingredients: customIngredients });
    }

    // "all" or authenticated user with no param → standard + custom merged
    const [standardIngredients, customIngredients] = await Promise.all([
      prisma.ingredient.findMany({ orderBy: { id: "asc" } }),
      prisma.customIngredient.findMany({
        where: { userId: activeUserId },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return NextResponse.json({
      success: true,
      ingredients: [...standardIngredients, ...customIngredients],
      standard: standardIngredients,
      custom: customIngredients,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Fetch ingredients error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ─── POST /api/ingredients ────────────────────────────────────────────────────
// Creates a new custom ingredient for the authenticated user.
// Enforces tariff limits and validates all fields.
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
    } = body;

    // ── Mock dev support ────────────────────────────────────────────────────
    if (userId && String(userId).startsWith("mock-")) {
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

      validatedSource = validateOptionalString(source, 255, "Источник вещества");
      validatedDilutionScale = validateDilutionScale(dilutionScale);
      validatedDosageForm = validateOptionalString(dosageForm, 255, "Форма выпуска");
      validatedApplicationArea = validateOptionalString(applicationArea, 255, "Область применения");
      validatedProcessingTech = validateOptionalString(processingTech, 255, "Технология производства");
    } catch (validationErr: any) {
      return NextResponse.json({ error: validationErr.message }, { status: 400 });
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

    // ── Persist ─────────────────────────────────────────────────────────────
    const newIngredient = await prisma.customIngredient.create({
      data: {
        userId: activeUserId,
        name: cleanName,
        role: validatedRole,
        casNumber: cleanCas || null,
        looseBulkDensity: parsedLoose,
        tappedBulkDensity: parsedTapped,
        trueDensity: parsedTrue,
        costPerKgUsd: parsedCost,
        maxSafePercentage: parsedMaxSafe,
        isAllergen: !!isAllergen,
        source: validatedSource,
        dilutionScale: validatedDilutionScale,
        dosageForm: validatedDosageForm,
        applicationArea: validatedApplicationArea,
        processingTech: validatedProcessingTech,
      },
    });

    return NextResponse.json({ success: true, ingredient: newIngredient }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Save custom ingredient error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
