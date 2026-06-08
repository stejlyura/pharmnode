import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { nodes, connections, name, userId } = await request.json();

    let activeUserId = session?.user && (session.user as any).id;
    
    // Support mock dev profiles
    if (!activeUserId && userId && String(userId).startsWith("mock-")) {
      return NextResponse.json({ success: true, mock: true });
    }

    if (!activeUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const recipeName = String(name || "Autosaved Recipe").replace(/<[^>]*>/g, "").trim();

    // Find and update or create (upsert-like behavior per user)
    let dbRecipe = await prisma.recipe.findFirst({
      where: { userId: activeUserId },
    });

    if (dbRecipe) {
      dbRecipe = await prisma.recipe.update({
        where: { id: dbRecipe.id },
        data: {
          name: recipeName,
          nodes: nodes || [],
          connections: connections || [],
        },
      });
    } else {
      dbRecipe = await prisma.recipe.create({
        data: {
          userId: activeUserId,
          name: recipeName,
          nodes: nodes || [],
          connections: connections || [],
        },
      });
    }

    return NextResponse.json({ success: true, recipeId: dbRecipe.id });
  } catch (err: any) {
    console.error("Recipe save error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
