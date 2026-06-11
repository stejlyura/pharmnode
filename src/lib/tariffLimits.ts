import { prisma } from "./prisma";

export interface TariffLimitResult {
  allowed: boolean;
  limit: number;
  current: number;
}

export async function checkTariffLimit(
  userId: string,
  tariff: string,
  resource: "ingredients" | "recipes"
): Promise<TariffLimitResult> {
  const normalizedTariff = String(tariff).toLowerCase();
  
  if (normalizedTariff === "professional" || normalizedTariff === "enterprise") {
    return { allowed: true, limit: Infinity, current: 0 };
  }

  if (resource === "ingredients") {
    const current = await prisma.customIngredient.count({
      where: { userId },
    });
    const limit = 3;
    return { allowed: current < limit, limit, current };
  } else {
    const current = await prisma.recipe.count({
      where: { userId },
    });
    const limit = 1;
    return { allowed: current < limit, limit, current };
  }
}
