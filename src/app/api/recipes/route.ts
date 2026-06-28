import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { sanitizeString } from "@/lib/validation";
import { checkTariffLimit } from "@/lib/tariffLimits";

const isProduction =
  process.env.NODE_ENV === "production" ||
  process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT === "production";

// ─── GET /api/recipes ─────────────────────────────────────────────────────────
// Returns all recipes for the authenticated user.
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const activeUserId = session?.user?.id;

    const { searchParams } = new URL(request.url);
    const queryUserId = searchParams.get("userId");

    // Mock dev support
    if (!isProduction && queryUserId && String(queryUserId).startsWith("mock-")) {
      return NextResponse.json({ success: true, recipes: [] });
    }

    if (!activeUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const recipeId = searchParams.get("id");
    const { decrypt, decryptJson } = await import("@/lib/encryption");

    if (recipeId) {
      const recipe = await prisma.recipe.findUnique({
        where: { id: recipeId }
      });

      if (!recipe || recipe.userId !== activeUserId) {
        return NextResponse.json({ error: "Recipe not found or forbidden" }, { status: 404 });
      }

      const decryptedRecipe = {
        ...recipe,
        name: decrypt(recipe.name),
        nodes: decryptJson(recipe.nodes),
        connections: decryptJson(recipe.connections),
      };

      return NextResponse.json({ success: true, recipe: decryptedRecipe });
    }

    const recipes = await prisma.recipe.findMany({
      where: { userId: activeUserId },
      orderBy: { updatedAt: "desc" },
    });

    const decryptedRecipes = recipes.map(r => ({
      ...r,
      name: decrypt(r.name),
      nodes: decryptJson(r.nodes),
      connections: decryptJson(r.connections),
    }));

    return NextResponse.json({ success: true, recipes: decryptedRecipes });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Fetch recipes error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ─── POST /api/recipes ────────────────────────────────────────────────────────
// Creates or updates a recipe for the authenticated user.
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const activeUserId = session?.user?.id;

    const body: Record<string, unknown> = await request.json();
    const { nodes, connections, name, userId } = body;

    // Mock dev support
    if (!isProduction && !activeUserId && userId && String(userId).startsWith("mock-")) {
      return NextResponse.json({ success: true, mock: true });
    }

    if (!activeUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ── Validation ───────────────────────────────────────────────────────────
    const recipeName = sanitizeString(name ?? "Autosaved Recipe");

    if (!recipeName) {
      return NextResponse.json(
        { error: "Имя рецептуры не может быть пустым" },
        { status: 400 }
      );
    }

    if (!Array.isArray(nodes)) {
      return NextResponse.json(
        { error: "Поле 'nodes' должно быть массивом" },
        { status: 400 }
      );
    }

    if (!Array.isArray(connections)) {
      return NextResponse.json(
        { error: "Поле 'connections' должно быть массивом" },
        { status: 400 }
      );
    }

    // ── Encrypt fields ─────────────────────────────────────────────────────
    const { encrypt, encryptJson } = await import("@/lib/encryption");
    const encryptedName = encrypt(recipeName);
    const encryptedNodes = encryptJson(nodes) as Prisma.InputJsonValue;
    const encryptedConnections = encryptJson(connections) as Prisma.InputJsonValue;

    // ── Update or Create ─────────────────────────────────────────────────────
    let dbRecipe;
    const recipeId = body.recipeId as string | undefined;

    if (recipeId) {
      // Validate ownership
      const existing = await prisma.recipe.findUnique({ where: { id: recipeId } });
      if (!existing || existing.userId !== activeUserId) {
        return NextResponse.json({ error: "Recipe not found or forbidden" }, { status: 404 });
      }

      dbRecipe = await prisma.recipe.update({
        where: { id: recipeId },
        data: { name: encryptedName, nodes: encryptedNodes, connections: encryptedConnections },
      });
    } else {
      // ── Tariff limit check (on create only) ────────────────────────────────
      const dbUser = await prisma.user.findUnique({ where: { id: activeUserId } });
      const tariff = dbUser?.tariff ?? "hobby";

      const limitCheck = await checkTariffLimit(activeUserId, tariff, "recipes");
      if (!limitCheck.allowed) {
        return NextResponse.json(
          {
            error: `Достигнут лимит тарифа (${limitCheck.limit} рецептур). Обновите тариф до Professional.`,
            code: "TARIFF_LIMIT_REACHED",
          },
          { status: 403 }
        );
      }

      dbRecipe = await prisma.recipe.create({
        data: {
          userId: activeUserId,
          name: encryptedName,
          nodes: encryptedNodes,
          connections: encryptedConnections,
        },
      });
    }

    // Log compliance event
    const { logAuditEvent } = await import("@/lib/auditLogger");
    await logAuditEvent({
      userId: activeUserId,
      email: session?.user?.email,
      action: recipeId ? "recipe_update" : "recipe_create",
      details: `Recipe ID: ${dbRecipe.id}, Name: ${recipeName}`
    });

    return NextResponse.json({ success: true, recipeId: dbRecipe.id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Recipe save error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ─── DELETE /api/recipes?id=xxx ───────────────────────────────────────────────
// Deletes a recipe by ID. User must own the recipe.
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const activeUserId = session?.user?.id;

    if (!activeUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const recipeId = searchParams.get("id");

    if (!recipeId) {
      return NextResponse.json(
        { error: "Query parameter 'id' is required" },
        { status: 400 }
      );
    }

    // Verify ownership before deleting
    const recipe = await prisma.recipe.findUnique({ where: { id: recipeId } });

    if (!recipe) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    if (recipe.userId !== activeUserId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.recipe.delete({ where: { id: recipeId } });

    // Decrypt recipe name for logging
    const { decrypt } = await import("@/lib/encryption");
    const decryptedName = decrypt(recipe.name);

    // Log compliance event
    const { logAuditEvent } = await import("@/lib/auditLogger");
    await logAuditEvent({
      userId: activeUserId,
      email: session?.user?.email,
      action: "recipe_delete",
      details: `Recipe ID: ${recipeId}, Name: ${decryptedName}`
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Recipe delete error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
