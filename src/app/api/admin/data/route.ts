import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    
    const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "PasswordforAdmin123";
    const expectedAuth = "Basic " + Buffer.from(`${ADMIN_USERNAME}:${ADMIN_PASSWORD}`).toString("base64");
    
    if (!authHeader || authHeader !== expectedAuth) {
      return new Response("Unauthorized", {
        status: 401,
        headers: { "WWW-Authenticate": 'Basic realm="Admin Portal"' },
      });
    }

    const mockUsers = [
      {
        _id: "mock-user-1",
        name: "Dr. Alexander Fleming",
        email: "fleming@penicillin.org",
        image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=150&h=150&q=80",
        tariff: "hobby",
        createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      },
      {
        _id: "mock-user-2",
        name: "Fermer Tech",
        email: "dev@github-pharma.com",
        image: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&h=150&q=80",
        tariff: "professional",
        createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      },
      {
        _id: "mock-user-3",
        name: "CMO Pharma Corp",
        email: "admin@cmo-corp.com",
        image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150&q=80",
        tariff: "enterprise",
        createdAt: new Date(Date.now() - 3600000 * 120).toISOString(),
      }
    ];

    const mockRecipes = [
      {
        _id: "mock-recipe-1",
        userId: "mock-user-2",
        name: "Heart-Condition Amlodipine Formulation",
        nodes: [
          { id: "node-1", type: "ingredient", data: { ingredientId: 1, percentage: 12.5 } },
          { id: "node-2", type: "ingredient", data: { ingredientId: 2, percentage: 87.5 } },
          { id: "node-blending", type: "blending", data: {} }
        ],
        connections: [
          { id: "conn-1", source: "node-1", target: "node-blending" },
          { id: "conn-2", source: "node-2", target: "node-blending" }
        ],
        createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      },
      {
        _id: "mock-recipe-2",
        userId: "mock-user-3",
        name: "Multi-Vitamin Supplement Formula v3",
        nodes: [
          { id: "node-1", type: "ingredient", data: { ingredientId: 3, percentage: 40 } },
          { id: "node-2", type: "ingredient", data: { ingredientId: 4, percentage: 60 } },
          { id: "node-blending", type: "blending", data: {} }
        ],
        connections: [
          { id: "conn-1", source: "node-1", target: "node-blending" }
        ],
        createdAt: new Date(Date.now() - 3600000 * 96).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 80).toISOString(),
      }
    ];

    const mockIngredients = [
      {
        _id: "mock-ing-1",
        userId: "mock-user-3",
        name: "Super-Binder Excipient Alpha",
        role: "dry-binder",
        casNumber: "9004-34-6",
        looseBulkDensity: 0.32,
        tappedBulkDensity: 0.45,
        costPerKgUsd: 14.50,
        createdAt: new Date(Date.now() - 3600000 * 90).toISOString(),
      }
    ];

    if (!process.env.DATABASE_URL) {
      return NextResponse.json({
        databaseOnline: false,
        users: mockUsers,
        recipes: mockRecipes,
        customIngredients: mockIngredients,
      });
    }

    try {
      // Database is connected, fetch actual collections
      const dbUsers = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });
      const dbRecipes = await prisma.recipe.findMany({ orderBy: { updatedAt: "desc" } });
      const dbIngredients = await prisma.customIngredient.findMany({ orderBy: { createdAt: "desc" } });

      // Map id to _id for backward compatibility with frontend admin page
      const users = dbUsers.map(u => ({ ...u, _id: u.id }));
      const recipes = dbRecipes.map(r => ({ ...r, _id: r.id }));
      const customIngredients = dbIngredients.map(ing => ({ ...ing, _id: ing.id }));

      return NextResponse.json({
        databaseOnline: true,
        users,
        recipes,
        customIngredients,
      });
    } catch (dbErr) {
      console.warn("Postgres query failed, returning mock data:", dbErr);
      return NextResponse.json({
        databaseOnline: false,
        users: mockUsers,
        recipes: mockRecipes,
        customIngredients: mockIngredients,
      });
    }
  } catch (err: any) {
    console.error("Admin data route error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
