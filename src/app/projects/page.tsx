"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "@/context/I18nContext";
import { useRecipes } from "@/hooks/useRecipes";
import { ThemeToggle } from "@/components/ThemeToggle";
import { FolderPlus, FileText, Calendar, ArrowRight, FlaskConical, Loader2, Trash2 } from "lucide-react";

export default function ProjectsPage() {
  const { user, status } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();

  const isMockUser = !!user?.id?.startsWith('mock-');
  const { recipes, isLoading, error, loadRecipes, deleteRecipe } = useRecipes(user?.id, isMockUser);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  useEffect(() => {
    if (user?.id) {
      loadRecipes();
    }
  }, [user?.id, loadRecipes]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this project?")) {
      await deleteRecipe(id);
    }
  };

  if (status === "loading" || (isLoading && recipes.length === 0)) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-indigo-500 theme-element">
        <Loader2 className="animate-spin" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans theme-element relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute inset-0 bg-[radial-gradient(var(--grid-dot)_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none opacity-30" />
      <div className="absolute top-0 inset-x-0 h-[300px] bg-gradient-to-b from-indigo-500/5 via-purple-500/0 to-transparent pointer-events-none" />

      {/* Navigation Header */}
      <header className="h-16 border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50 px-6 flex items-center justify-between theme-element">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-sm shadow-[0_0_15px_rgba(99,102,241,0.2)] group-hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all">
            PN
          </div>
          <div>
            <span className="text-sm font-bold text-zinc-100 uppercase tracking-wider block">PharmNode</span>
            <span className="text-[9px] text-zinc-500 block leading-none">Projects Dashboard</span>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <div className="text-xs font-bold text-zinc-400 bg-zinc-900/60 px-3 py-1.5 rounded-lg border border-zinc-800">
            {user?.name || "Guest"}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-12 relative z-10">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 to-indigo-400 mb-2">
              Your Formulations
            </h1>
            <p className="text-sm text-zinc-400">
              Manage your existing projects or start a new virtual formulation.
            </p>
          </div>
          
          {error && (
            <div className="text-rose-400 bg-rose-500/10 border border-rose-500/20 px-4 py-2 rounded-xl text-sm font-semibold">
              Error: {error}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* Create New Project Card */}
          <Link
            href="/configurator"
            className="group h-48 bg-zinc-900/40 border-2 border-dashed border-zinc-800 hover:border-indigo-500/50 hover:bg-indigo-500/5 rounded-2xl p-6 flex flex-col items-center justify-center gap-4 transition-all cursor-pointer theme-element"
          >
            <div className="w-12 h-12 rounded-full bg-zinc-800 group-hover:bg-indigo-500 flex items-center justify-center text-zinc-400 group-hover:text-white transition-colors shadow-lg">
              <FolderPlus size={24} />
            </div>
            <div className="text-center">
              <h3 className="font-bold text-zinc-200 group-hover:text-indigo-400 transition-colors">New Project</h3>
              <p className="text-xs text-zinc-500 mt-1">Start a blank canvas</p>
            </div>
          </Link>

          {/* Project Cards */}
          {recipes.map((recipe) => (
            <Link
              href={`/configurator?recipeId=${recipe.id}`}
              key={recipe.id}
              className="group h-48 bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-6 flex flex-col justify-between transition-all hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)] relative overflow-hidden theme-element"
            >
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={(e) => handleDelete(e, recipe.id)}
                  className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg transition-colors cursor-pointer"
                  title="Delete Project"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-indigo-400 shrink-0">
                  <FlaskConical size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-zinc-100 line-clamp-2">{recipe.name}</h3>
                  <div className="flex items-center gap-1 mt-2 text-xs text-zinc-500">
                    <FileText size={12} />
                    <span>{recipe.nodes?.length || 0} nodes</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-zinc-800/60 pt-4 mt-4">
                <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                  <Calendar size={12} />
                  <span>{new Date(recipe.updatedAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-indigo-400 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                  Open <ArrowRight size={12} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
