import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { decrypt, decryptJson } from "@/lib/encryption";
import { logAuditEvent } from "@/lib/auditLogger";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Fetch user details
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch and decrypt recipes
    const rawRecipes = await prisma.recipe.findMany({
      where: { userId },
    });
    const recipes = rawRecipes.map(r => ({
      id: r.id,
      name: decrypt(r.name),
      nodes: decryptJson(r.nodes),
      connections: decryptJson(r.connections),
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));

    // Fetch and decrypt custom ingredients
    const rawIngredients = await prisma.customIngredient.findMany({
      where: { userId },
    });
    const customIngredients = rawIngredients.map(ing => ({
      id: ing.id,
      name: decrypt(ing.name),
      role: ing.role,
      casNumber: ing.casNumber ? decrypt(ing.casNumber) : null,
      looseBulkDensity: ing.looseBulkDensity,
      tappedBulkDensity: ing.tappedBulkDensity,
      trueDensity: ing.trueDensity,
      costPerKgUsd: ing.costPerKgUsd,
      maxSafePercentage: ing.maxSafePercentage,
      isAllergen: ing.isAllergen,
      source: ing.source ? decrypt(ing.source) : null,
      dilutionScale: ing.dilutionScale,
      dosageForm: ing.dosageForm,
      applicationArea: ing.applicationArea,
      processingTech: ing.processingTech,
      effects: decryptJson(ing.effects),
      contraindications: decryptJson(ing.contraindications),
      sideEffects: decryptJson(ing.sideEffects),
      createdAt: ing.createdAt,
      updatedAt: ing.updatedAt,
    }));

    const exportData = {
      exportedAt: new Date().toISOString(),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        tariff: user.tariff,
        isSubscribed: user.isSubscribed,
        createdAt: user.createdAt,
      },
      recipes,
      customIngredients,
    };

    await logAuditEvent({
      userId,
      email: session.user.email,
      action: "user_gdpr_export",
      details: `Exported user data profile containing ${recipes.length} recipes and ${customIngredients.length} ingredients.`
    });

    return NextResponse.json(exportData);
  } catch (err) {
    console.error("GDPR export route error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
