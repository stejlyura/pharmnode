import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCompatibilityRule, getIngredientsCompatibilityRule } from "@/lib/chemicalRules";

interface RecommendationIngredient {
  id: string | number;
  name: string;
  role: string;
  chemicalClassId: number;
  isAllergen: boolean;
  effects: unknown;
  contraindications: unknown;
  activeMolecules?: { chemicalClassId: number }[] | null;
}

// Indication goal aliases for Russian and English lookups
const GOALS_MAP: Record<string, string[]> = {
  "pain": ["обезболивающее", "pain relief", "painkiller"],
  "fever": ["жаропонижающее", "fever relief", "antipyretic"],
  "inflam": ["противовоспалительное", "anti-inflammatory"],
  "imm": ["иммунитет", "immunity support", "immunity"],
  "energy": ["энергия", "энергия и тонус", "energy & vitality", "energy"],
  "antiox": ["антиоксидант", "antioxidant"],
  "stim": ["стимулятор", "stimulant"],
  "focus": ["фокусировка", "фокусировка внимания", "focus & cognition", "focus"],
  "bone": ["здоровье костей", "bone health"]
};

// Safe helper to extract string array from Prisma Json values
function getJsonStringArray(field: unknown): string[] {
  if (!field) return [];
  if (Array.isArray(field)) {
    return field.map(x => String(x));
  }
  if (typeof field === "string") {
    try {
      const parsed = JSON.parse(field);
      if (Array.isArray(parsed)) {
        return parsed.map(x => String(x));
      }
    } catch {
      // ignore parsing error
    }
  }
  return [];
}

export async function POST(request: Request) {
  try {
    const { rateLimit } = await import("@/lib/rateLimit");
    const limiter = await rateLimit("recommendations", {
      limit: 30,
      windowMs: 60 * 1000,
    });
    if (!limiter.success) {
      return NextResponse.json(
        { error: "Too many recommendation requests. Please try again later." },
        { status: 429 }
      );
    }

    const body = (await request.json()) as { goals?: string[]; limitations?: string[]; dosageForm?: string };
    const { goals = [], limitations = [], dosageForm = "tablets" } = body;

    if (!Array.isArray(goals) || !Array.isArray(limitations)) {
      return NextResponse.json(
        { error: "goals and limitations fields must be arrays" },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);
    const activeUserId = session?.user?.id;

    // Fetch standard and custom ingredients
    const [standardDbIngredients, customIngredients] = await Promise.all([
      prisma.ingredient.findMany({
        orderBy: { id: "asc" },
        include: {
          activeMolecules: true,
          effects: { include: { effect: true } },
          contraindications: { include: { contraindication: true } },
        },
      }),
      activeUserId
        ? prisma.customIngredient.findMany({
            where: { userId: activeUserId },
            orderBy: { createdAt: "desc" },
          })
        : [],
    ]);

    const standardIngredients = standardDbIngredients.map(ing => ({
      ...ing,
      effects: ing.effects.map(e => e.effect.name),
      contraindications: ing.contraindications.map(c => c.contraindication.name),
      activeMolecules: ing.activeMolecules,
    }));

    const { decrypt, decryptJson } = await import("@/lib/encryption");
    const decryptedCustom = customIngredients.map(ing => ({
      ...ing,
      name: decrypt(ing.name),
      casNumber: ing.casNumber ? decrypt(ing.casNumber) : null,
      source: ing.source ? decrypt(ing.source) : null,
      effects: decryptJson(ing.effects),
      contraindications: decryptJson(ing.contraindications),
      sideEffects: decryptJson(ing.sideEffects),
    }));

    // Format all ingredients to a unified representation
    const allIngredients: RecommendationIngredient[] = [
      ...standardIngredients.map(ing => ({
        ...ing,
        isCustom: false,
      })),
      ...decryptedCustom.map(ing => ({
        ...ing,
        isCustom: true,
        // Match string chemicalClassId to custom logic, standard is numeric
        chemicalClassId: Number(ing.incompatibleWith && ing.incompatibleWith[0]) || 35, // fallback to inert
      })),
    ];

    const normalizedLimits = limitations.map((l: string) => l.toLowerCase());
    const targetEffects = goals
      .flatMap(g => GOALS_MAP[g] || [g])
      .map(s => s.toLowerCase());

    // ── Step 1: Filter active ingredients by indication goals ──
    const candidateActives = allIngredients.filter(ing => {
      if (ing.role !== "active") return false;
      
      const effects = getJsonStringArray(ing.effects).map(e => e.toLowerCase());
      const matchesGoal = effects.some(eff =>
        targetEffects.some(target => eff.includes(target) || target.includes(eff))
      );
      return matchesGoal;
    });

    // ── Step 2: Apply constraints to active ingredients ──
    const safeActives = candidateActives.filter(ing => {
      // Allergen filter
      if (ing.isAllergen && (normalizedLimits.includes("allergen-free") || normalizedLimits.includes("без аллергенов"))) {
        return false;
      }
      
      // Sugar / Lactose filter
      const nameLower = ing.name.toLowerCase();
      if ((normalizedLimits.includes("sugar-free") || normalizedLimits.includes("без сахара")) &&
          (ing.chemicalClassId === 14 || ing.chemicalClassId === 15 || nameLower.includes("lactose") || nameLower.includes("sucrose"))) {
        return false;
      }
      if ((normalizedLimits.includes("lactose-free") || normalizedLimits.includes("без лактозы")) &&
          (ing.chemicalClassId === 14 || nameLower.includes("lactose"))) {
        return false;
      }

      // Pregnancy filter
      const contraindications = getJsonStringArray(ing.contraindications).map(c => c.toLowerCase());
      if (normalizedLimits.includes("pregnancy-safe") || normalizedLimits.includes("можно при беременности")) {
        const isPregnancyUnsafe = contraindications.some(c =>
          c.includes("беременн") || c.includes("pregnancy") || c.includes("gestation")
        );
        if (isPregnancyUnsafe) return false;
      }

      // Specific medical condition contraindications
      const hasContraindication = contraindications.some(c =>
        normalizedLimits.some(limit => c.includes(limit) || limit.includes(c))
      );
      if (hasContraindication) return false;

      return true;
    });

    // ── Step 3: Check mutual compatibility of actives ──
    const selectedActives: typeof safeActives = [];
    for (const act of safeActives) {
      let isCompat = true;
      for (const selected of selectedActives) {
        const rule = getIngredientsCompatibilityRule(act, selected);
        if (rule && rule.type === "incompatible" && rule.severity === "error") {
          isCompat = false;
          break;
        }
      }
      if (isCompat) {
        selectedActives.push(act);
      }
    }

    if (selectedActives.length === 0) {
      return NextResponse.json({
        success: true,
        ingredients: [],
        message: "No compatible active ingredients found matching goals and limitations.",
      });
    }

    // ── Step 4: Auto-select compatible excipients ──
    const chosenExcipients: RecommendationIngredient[] = [];

    const selectExcipient = (role: string): RecommendationIngredient | null => {
      const candidates = allIngredients.filter(ing => ing.role === role);

      for (const cand of candidates) {
        const nameLower = cand.name.toLowerCase();

        // Limitation filters
        if (cand.isAllergen && (normalizedLimits.includes("allergen-free") || normalizedLimits.includes("без аллергенов"))) {
          continue;
        }
        if ((normalizedLimits.includes("sugar-free") || normalizedLimits.includes("без сахара")) &&
            (cand.chemicalClassId === 14 || cand.chemicalClassId === 15 || nameLower.includes("lactose") || nameLower.includes("sucrose"))) {
          continue;
        }
        if ((normalizedLimits.includes("lactose-free") || normalizedLimits.includes("без лактозы")) &&
            (cand.chemicalClassId === 14 || nameLower.includes("lactose"))) {
          continue;
        }

        // Compatibility checks with actives
        let isCompat = true;
        for (const act of selectedActives) {
          const rule = getIngredientsCompatibilityRule(cand, act);
          if (rule && rule.type === "incompatible" && rule.severity === "error") {
            isCompat = false;
            break;
          }
        }
        if (!isCompat) continue;

        // Compatibility checks with already chosen excipients
        for (const exc of chosenExcipients) {
          const rule = getIngredientsCompatibilityRule(cand, exc);
          if (rule && rule.type === "incompatible" && rule.severity === "error") {
            isCompat = false;
            break;
          }
        }
        if (!isCompat) continue;

        return cand;
      }
      return null;
    };

    // Auto-select standard roles
    const filler = selectExcipient("filler") || allIngredients.find(i => i.id === 9) || allIngredients.find(i => i.role === "filler");
    if (filler) chosenExcipients.push(filler);

    const binder = selectExcipient("dry-binder") || allIngredients.find(i => i.id === 3) || allIngredients.find(i => i.role === "dry-binder");
    if (binder) chosenExcipients.push(binder);

    const lubricant = selectExcipient("lubricant") || allIngredients.find(i => i.id === 12) || allIngredients.find(i => i.role === "lubricant");
    if (lubricant) chosenExcipients.push(lubricant);

    const glidant = selectExcipient("glidant") || allIngredients.find(i => i.id === 5) || allIngredients.find(i => i.role === "glidant");
    if (glidant) chosenExcipients.push(glidant);

    // ── Step 5: Distribute percentages to sum to exactly 100% ──
    const list: {
      id: string | number;
      name: string;
      role: string;
      percentage: number;
    }[] = [];
    const activesCount = selectedActives.length;
    const activeTotalPct = 20.0;
    const activePct = activeTotalPct / activesCount;

    selectedActives.forEach(act => {
      list.push({
        id: act.id,
        name: act.name,
        role: "active",
        percentage: Number(activePct.toFixed(4)),
      });
    });

    // Excipients percentages
    const binderPct = 25.0;
    const lubricantPct = 1.5;
    const glidantPct = 1.5;
    const fillerPct = 100.0 - activeTotalPct - binderPct - lubricantPct - glidantPct;

    if (binder) {
      list.push({
        id: binder.id,
        name: binder.name,
        role: "dry-binder",
        percentage: binderPct,
      });
    }
    if (lubricant) {
      list.push({
        id: lubricant.id,
        name: lubricant.name,
        role: "lubricant",
        percentage: lubricantPct,
      });
    }
    if (glidant) {
      list.push({
        id: glidant.id,
        name: glidant.name,
        role: "glidant",
        percentage: glidantPct,
      });
    }
    if (filler) {
      list.push({
        id: filler.id,
        name: filler.name,
        role: "filler",
        percentage: Number(fillerPct.toFixed(4)),
      });
    }

    return NextResponse.json({
      success: true,
      ingredients: list,
      dosageForm,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Recommendations API error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
