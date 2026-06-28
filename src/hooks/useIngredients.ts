"use client";

import { useState, useEffect, useCallback } from "react";
import { Ingredient } from "../types/pharm";
import { baseIngredientsMatrix } from "../data/baseIngredients";

export interface UseIngredientsResult {
  /** Standard + custom ingredients merged */
  ingredients: Ingredient[];
  /** Only the 26 standard ingredients from DB */
  standardIngredients: Ingredient[];
  /** Only user-added custom ingredients */
  customIngredients: Ingredient[];
  isLoading: boolean;
  error: string | null;
  /** Force reload from API */
  refetch: () => void;
}

/**
 * Hook to load ingredients from the API.
 *
 * - Standard ingredients are loaded from `/api/ingredients?type=standard` (public, no auth).
 * - Custom ingredients are loaded from `/api/ingredients?type=custom` (requires auth).
 * - Falls back to `baseIngredientsMatrix` if the API is unavailable.
 *
 * @param userId - If provided (non-mock), fetches custom ingredients for the user.
 * @param isMockUser - If true, reads/writes custom ingredients from localStorage only.
 */
export function useIngredients(
  userId?: string | null,
  isMockUser?: boolean
): UseIngredientsResult {
  const [standardIngredients, setStandardIngredients] = useState<Ingredient[]>([]);
  const [customIngredients, setCustomIngredients] = useState<Ingredient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);

      try {
        // ── Standard ingredients (always load from DB, public endpoint) ───────
        let standard: Ingredient[] = baseIngredientsMatrix; // fallback
        try {
          const res = await fetch("/api/ingredients?type=standard");
          if (res.ok) {
            const data = await res.json();
            if (data.success && Array.isArray(data.ingredients) && data.ingredients.length > 0) {
              standard = data.ingredients;
            }
          }
        } catch {
          // Network error — fall back to hardcoded matrix
          console.warn("[useIngredients] API unavailable, using baseIngredientsMatrix fallback");
        }

        if (!cancelled) setStandardIngredients(standard);

        // ── Custom ingredients ────────────────────────────────────────────────
        if (!userId) {
          if (!cancelled) setCustomIngredients([]);
          return;
        }

        // Mock users → localStorage
        if (isMockUser) {
          const stored = localStorage.getItem(`pharmnode_custom_ingredients_${userId}`);
          if (stored) {
            try {
              const parsed = JSON.parse(stored) as Ingredient[];
              if (!cancelled) setCustomIngredients(parsed);
            } catch {
              if (!cancelled) setCustomIngredients([]);
            }
          } else {
            if (!cancelled) setCustomIngredients([]);
          }
          return;
        }

        // Real users → API
        try {
          const res = await fetch("/api/ingredients?type=custom");
          if (res.ok) {
            const data = await res.json();
            if (data.success && Array.isArray(data.ingredients)) {
              if (!cancelled) setCustomIngredients(data.ingredients);
            }
          } else {
            if (!cancelled) setCustomIngredients([]);
          }
        } catch {
          console.warn("[useIngredients] Failed to fetch custom ingredients");
          if (!cancelled) setCustomIngredients([]);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        if (!cancelled) setError(msg);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [userId, isMockUser, tick]);

  const ingredients = [...standardIngredients, ...customIngredients];

  return { ingredients, standardIngredients, customIngredients, isLoading, error, refetch };
}
