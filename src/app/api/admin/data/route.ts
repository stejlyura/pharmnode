import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// ─── GET /api/admin/data ──────────────────────────────────────────────────────
// Admin panel endpoint. Protected by NextAuth or HTTP Basic Auth.
// Query params:
//   ?page=1     → page number (1-indexed, default: 1)
//   ?limit=20   → items per page (default: 20, max: 100)
export async function GET(request: Request) {
  try {
    const { rateLimit } = await import("@/lib/rateLimit");
    const limiter = await rateLimit("admin_data", {
      limit: 20,
      windowMs: 15 * 60 * 1000,
    });
    if (!limiter.success) {
      return NextResponse.json(
        { error: "Too many admin requests. Please try again in 15 minutes." },
        { status: 429 }
      );
    }
    // ── NextAuth Session Check ───────────────────────────────────────────────
    const session = await getServerSession(authOptions);
    const isSessionAdmin = session?.user?.email === "admin@pharmnode.com";

    // ── Basic Auth Fallback ──────────────────────────────────────────────────
    let isAuthorized = isSessionAdmin;

    if (!isAuthorized) {
      const authHeader = request.headers.get("authorization");
      const isProduction = process.env.NODE_ENV === "production";
      if (isProduction && (!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD)) {
        throw new Error("ADMIN_USERNAME and ADMIN_PASSWORD environment variables must be set in production.");
      }
      const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
      const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "PasswordforAdmin123";
      const expectedAuth =
        "Basic " + Buffer.from(`${ADMIN_USERNAME}:${ADMIN_PASSWORD}`).toString("base64");

      if (authHeader && authHeader === expectedAuth) {
        isAuthorized = true;
      } else {
        const failedLimiter = await rateLimit("admin_basic_auth_failed", {
          limit: 5,
          windowMs: 15 * 60 * 1000,
        });
        if (!failedLimiter.success) {
          return new Response("Too many failed auth attempts. Please try again in 15 minutes.", {
            status: 429,
          });
        }
      }
    }

    if (!isAuthorized) {
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
      const { decrypt } = await import("@/lib/encryption");
      const users = dbUsers.map((u) => ({ ...u, _id: u.id }));
      const recipes = dbRecipes.map((r) => ({ ...r, _id: r.id, name: decrypt(r.name) }));
      const customIngredients = dbIngredients.map((ing) => ({
        ...ing,
        _id: ing.id,
        name: decrypt(ing.name),
        casNumber: ing.casNumber ? decrypt(ing.casNumber) : null
      }));

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
