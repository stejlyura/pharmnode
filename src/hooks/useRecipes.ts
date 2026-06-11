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
  ) => Promise<{ success: boolean; recipeId?: string }>;
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
        // Mock users: no server recipes
        setRecipes([]);
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
      name = "Autosaved Recipe"
    ): Promise<{ success: boolean; recipeId?: string }> => {
      if (!userId) return { success: false };

      if (isMockUser) {
        // Mock mode: no-op success
        return { success: true, recipeId: "mock-recipe" };
      }

      try {
        const res = await fetch("/api/recipes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nodes, connections, name, userId }),
        });

        const data = await res.json();
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
      if (!userId || isMockUser) return { success: false };

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
