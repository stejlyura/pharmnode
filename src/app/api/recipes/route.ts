import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sanitizeString } from "@/lib/validation";
import { checkTariffLimit } from "@/lib/tariffLimits";

// ─── GET /api/recipes ─────────────────────────────────────────────────────────
// Returns all recipes for the authenticated user.
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const activeUserId = session?.user?.id;

    const { searchParams } = new URL(request.url);
    const queryUserId = searchParams.get("userId");

    // Mock dev support
    if (queryUserId && String(queryUserId).startsWith("mock-")) {
      return NextResponse.json({ success: true, recipes: [] });
    }

    if (!activeUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const recipeId = searchParams.get("id");

    if (recipeId) {
      const recipe = await prisma.recipe.findUnique({
        where: { id: recipeId }
      });

      if (!recipe || recipe.userId !== activeUserId) {
        return NextResponse.json({ error: "Recipe not found or forbidden" }, { status: 404 });
      }

      return NextResponse.json({ success: true, recipe });
    }

    const recipes = await prisma.recipe.findMany({
      where: { userId: activeUserId },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ success: true, recipes });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Fetch recipes error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ─── POST /api/recipes ────────────────────────────────────────────────────────
// Creates or updates a recipe for the authenticated user.
// For simplicity in MVP: upserts the "current" recipe per user (one per user).
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const activeUserId = session?.user?.id;

    const body: Record<string, unknown> = await request.json();
    const { nodes, connections, name, userId } = body;

    // Mock dev support
    if (!activeUserId && userId && String(userId).startsWith("mock-")) {
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
        data: { name: recipeName, nodes, connections },
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
          name: recipeName,
          nodes,
          connections,
        },
      });
    }

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

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Recipe delete error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
