"use client";

import { useState, useCallback } from "react";
import type { EditorNode, EditorConnection } from "./useNodeEditor";

export interface RecipeData {
  id: string;
  userId: string;
  name: string;
  nodes: EditorNode[];
  connections: EditorConnection[];
  createdAt: string;
  updatedAt: string;
}

export interface UseRecipesResult {
  recipes: RecipeData[];
  isLoading: boolean;
  error: string | null;
  /** Load all recipes for the current user from the server */
  loadRecipes: () => Promise<void>;
  /** Restore a specific recipe to the canvas */
  loadRecipe: (recipe: RecipeData) => { nodes: EditorNode[]; connections: EditorConnection[] };
  /** Upsert the current canvas state to the server */
  saveRecipe: (
    nodes: EditorNode[],
    connections: EditorConnection[],
    name?: string
  ) => Promise<{ success: boolean; recipeId?: string; tariffLimitReached?: boolean }>;
  /** Delete a recipe by ID */
  deleteRecipe: (recipeId: string) => Promise<{ success: boolean }>;
}

/**
 * Hook to manage recipe persistence via API.
 *
 * @param userId - User ID (used for mock support and localStorage fallback).
 * @param isMockUser - If true, skips API calls.
 */
export function useRecipes(userId?: string | null, isMockUser?: boolean): UseRecipesResult {
  const [recipes, setRecipes] = useState<RecipeData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Load all recipes ────────────────────────────────────────────────────────
  const loadRecipes = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    setError(null);

    try {
      if (isMockUser) {
        // Mock users: load from localStorage
        const storedKey = `pharmnode_recipes_mock_${userId}`;
        const stored = localStorage.getItem(storedKey);
        if (stored) {
          try {
            setRecipes(JSON.parse(stored) as RecipeData[]);
          } catch {
            setRecipes([]);
          }
        } else {
          setRecipes([]);
        }
        return;
      }

      const res = await fetch("/api/recipes");
      if (!res.ok) {
        throw new Error(`GET /api/recipes failed: ${res.status}`);
      }

      const data = await res.json();
      if (data.success && Array.isArray(data.recipes)) {
        setRecipes(data.recipes as RecipeData[]);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setError(msg);
      console.error("[useRecipes] Failed to load recipes:", err);
    } finally {
      setIsLoading(false);
    }
  }, [userId, isMockUser]);

  // ── Restore a specific recipe ───────────────────────────────────────────────
  const loadRecipe = useCallback(
    (recipe: RecipeData): { nodes: EditorNode[]; connections: EditorConnection[] } => {
      return {
        nodes: recipe.nodes,
        connections: recipe.connections,
      };
    },
    []
  );

  // ── Save / autosave ─────────────────────────────────────────────────────────
  const saveRecipe = useCallback(
    async (
      nodes: EditorNode[],
      connections: EditorConnection[],
      name = "Autosaved Recipe",
      recipeId?: string
    ): Promise<{ success: boolean; recipeId?: string; tariffLimitReached?: boolean }> => {
      if (!userId) return { success: false };

      if (isMockUser) {
        const newId = recipeId || `mock-recipe-${Date.now()}`;
        const newRecipe: RecipeData = {
          id: newId,
          userId,
          name,
          nodes,
          connections,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const storedKey = `pharmnode_recipes_mock_${userId}`;
        const stored = localStorage.getItem(storedKey);
        let existing: RecipeData[] = stored ? JSON.parse(stored) : [];

        if (recipeId) {
          existing = existing.map((r) =>
            r.id === recipeId
              ? {
                  ...r,
                  name,
                  nodes,
                  connections,
                  updatedAt: new Date().toISOString(),
                }
              : r
          );
        } else {
          existing.push(newRecipe);
        }

        localStorage.setItem(storedKey, JSON.stringify(existing));
        setRecipes(existing);
        return { success: true, recipeId: newId };
      }

      try {
        const payload: {
          nodes: EditorNode[];
          connections: EditorConnection[];
          name: string;
          userId: string;
          recipeId?: string;
        } = { nodes, connections, name, userId };
        if (recipeId) {
          payload.recipeId = recipeId;
        }

        const res = await fetch("/api/recipes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();

        // Handle tariff limit — 403 with TARIFF_LIMIT_REACHED code
        if (res.status === 403 && data.code === "TARIFF_LIMIT_REACHED") {
          return { success: false, tariffLimitReached: true };
        }

        if (data.success) {
          return { success: true, recipeId: data.recipeId };
        }
        console.warn("[useRecipes] Save failed:", data.error);
        return { success: false };
      } catch (err) {
        console.error("[useRecipes] Network error during save:", err);
        return { success: false };
      }
    },
    [userId, isMockUser]
  );

  // ── Delete recipe ───────────────────────────────────────────────────────────
  const deleteRecipe = useCallback(
    async (recipeId: string): Promise<{ success: boolean }> => {
      if (!userId) return { success: false };

      if (isMockUser) {
        try {
          const storedKey = `pharmnode_recipes_mock_${userId}`;
          const stored = localStorage.getItem(storedKey);
          if (stored) {
            let existing: RecipeData[] = JSON.parse(stored);
            existing = existing.filter((r) => r.id !== recipeId);
            localStorage.setItem(storedKey, JSON.stringify(existing));
            setRecipes(existing);
            return { success: true };
          }
        } catch (e) {
          console.error("[useRecipes] Failed to delete mock recipe:", e);
        }
        return { success: false };
      }

      try {
        const res = await fetch(`/api/recipes?id=${encodeURIComponent(recipeId)}`, {
          method: "DELETE",
        });

        const data = await res.json();
        if (data.success) {
          setRecipes((prev) => prev.filter((r) => r.id !== recipeId));
          return { success: true };
        }
        return { success: false };
      } catch (err) {
        console.error("[useRecipes] Network error during delete:", err);
        return { success: false };
      }
    },
    [userId, isMockUser]
  );

  return { recipes, isLoading, error, loadRecipes, loadRecipe, saveRecipe, deleteRecipe };
}
