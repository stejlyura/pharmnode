import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    let activeUserId = session?.user && (session.user as any).id;
    
    const { searchParams } = new URL(request.url);
    const queryUserId = searchParams.get("userId");
    
    if (queryUserId && queryUserId.startsWith("mock-")) {
      return NextResponse.json({ success: true, ingredients: [] });
    }
    
    if (!activeUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const dbIngredients = await prisma.customIngredient.findMany({
      where: { userId: activeUserId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, ingredients: dbIngredients });
  } catch (err: any) {
    console.error("Fetch custom ingredients error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    let activeUserId = session?.user && (session.user as any).id;
    
    const body = await request.json();
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
      userId 
    } = body;

    // 1. Sanitize string inputs to prevent XSS (HTML Tag Stripping)
    const cleanName = String(name || "").replace(/<[^>]*>/g, "").trim();
    const cleanCas = String(casNumber || "").replace(/<[^>]*>/g, "").trim();

    // 2. Perform validations
    if (!cleanName) {
      return NextResponse.json({ error: "Название компонента не должно быть пустым" }, { status: 400 });
    }

    const parsedLoose = parseFloat(looseBulkDensity);
    const parsedTapped = parseFloat(tappedBulkDensity);
    if (isNaN(parsedLoose) || parsedLoose <= 0 || isNaN(parsedTapped) || parsedTapped <= 0) {
      return NextResponse.json({ error: "Плотность должна быть положительным числом" }, { status: 400 });
    }

    if (parsedLoose > parsedTapped) {
      return NextResponse.json({ error: "Насыпная плотность не может превышать плотность с уплотнением" }, { status: 400 });
    }

    const parsedTrue = parseFloat(trueDensity) || parsedTapped;
    if (parsedTrue <= 0) {
      return NextResponse.json({ error: "Истинная плотность должна быть положительным числом" }, { status: 400 });
    }

    const parsedCost = parseFloat(costPerKgUsd);
    if (isNaN(parsedCost) || parsedCost < 0) {
      return NextResponse.json({ error: "Стоимость за кг не может быть отрицательной" }, { status: 400 });
    }

    const parsedMaxSafe = parseFloat(maxSafePercentage);
    if (isNaN(parsedMaxSafe) || parsedMaxSafe < 0 || parsedMaxSafe > 100) {
      return NextResponse.json({ error: "Максимальный безопасный процент ввода должен быть в диапазоне от 0 до 100" }, { status: 400 });
    }

    const sanitizeIngredient = {
      name: cleanName,
      role,
      casNumber: cleanCas || undefined,
      looseBulkDensity: parsedLoose,
      tappedBulkDensity: parsedTapped,
      trueDensity: parsedTrue,
      costPerKgUsd: parsedCost,
      maxSafePercentage: parsedMaxSafe,
      isAllergen: !!isAllergen
    };
    
    if (userId && String(userId).startsWith("mock-")) {
      return NextResponse.json({ 
        success: true, 
        mock: true, 
        ingredient: { id: "custom-" + Date.now(), ...sanitizeIngredient } 
      });
    }
    
    if (!activeUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const newIngredient = await prisma.customIngredient.create({
      data: {
        userId: activeUserId,
        name: cleanName,
        role,
        casNumber: cleanCas || null,
        looseBulkDensity: parsedLoose,
        tappedBulkDensity: parsedTapped,
        trueDensity: parsedTrue,
        costPerKgUsd: parsedCost,
        maxSafePercentage: parsedMaxSafe,
        isAllergen: !!isAllergen
      }
    });
    
    return NextResponse.json({ success: true, ingredient: newIngredient });
  } catch (err: any) {
    console.error("Save custom ingredient error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
