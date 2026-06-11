import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ─── GET /api/admin/data ──────────────────────────────────────────────────────
// Admin panel endpoint. Protected by HTTP Basic Auth.
// Query params:
//   ?page=1     → page number (1-indexed, default: 1)
//   ?limit=20   → items per page (default: 20, max: 100)
export async function GET(request: Request) {
  try {
    // ── Basic Auth ───────────────────────────────────────────────────────────
    const authHeader = request.headers.get("authorization");

    const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "PasswordforAdmin123";
    const expectedAuth =
      "Basic " + Buffer.from(`${ADMIN_USERNAME}:${ADMIN_PASSWORD}`).toString("base64");

    if (!authHeader || authHeader !== expectedAuth) {
      return new Response("Unauthorized", {
        status: 401,
        headers: { "WWW-Authenticate": 'Basic realm="Admin Portal"' },
      });
    }

    // ── Pagination params ────────────────────────────────────────────────────
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)));
    const skip = (page - 1) * limit;

    // ── DB queries ───────────────────────────────────────────────────────────
    try {
      const [totalUsers, totalRecipes, totalIngredients, dbUsers, dbRecipes, dbIngredients] =
        await Promise.all([
          prisma.user.count(),
          prisma.recipe.count(),
          prisma.customIngredient.count(),
          prisma.user.findMany({
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              tariff: true,
              createdAt: true,
            },
          }),
          prisma.recipe.findMany({
            orderBy: { updatedAt: "desc" },
            skip,
            take: limit,
            select: {
              id: true,
              userId: true,
              name: true,
              createdAt: true,
              updatedAt: true,
            },
          }),
          prisma.customIngredient.findMany({
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
            select: {
              id: true,
              userId: true,
              name: true,
              role: true,
              casNumber: true,
              looseBulkDensity: true,
              tappedBulkDensity: true,
              costPerKgUsd: true,
              createdAt: true,
            },
          }),
        ]);

      // Map id → _id for backward compatibility with admin frontend
      const users = dbUsers.map((u) => ({ ...u, _id: u.id }));
      const recipes = dbRecipes.map((r) => ({ ...r, _id: r.id }));
      const customIngredients = dbIngredients.map((ing) => ({ ...ing, _id: ing.id }));

      return NextResponse.json({
        databaseOnline: true,
        pagination: {
          page,
          limit,
          totalUsers,
          totalRecipes,
          totalIngredients,
        },
        users,
        recipes,
        customIngredients,
      });
    } catch (dbErr) {
      console.warn("Postgres query failed:", dbErr);
      // DB is unavailable — return empty arrays with flag, no hardcoded fake data
      return NextResponse.json({
        databaseOnline: false,
        pagination: { page, limit, totalUsers: 0, totalRecipes: 0, totalIngredients: 0 },
        users: [],
        recipes: [],
        customIngredients: [],
      });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Admin data route error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
