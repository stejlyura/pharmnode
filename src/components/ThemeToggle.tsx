"use client";

import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { useTranslation } from "../context/I18nContext";

export const ThemeToggle: React.FC = () => {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [mounted, setMounted] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const savedTheme = localStorage.getItem("pharmnode-theme") as "light" | "dark" | null;
    let initialTheme: "light" | "dark" = "dark";
    if (savedTheme) {
      initialTheme = savedTheme;
    } else {
      // Check if root already has data-theme attribute set by layout blocking script
      const activeTheme = document.documentElement.getAttribute("data-theme") as "light" | "dark" | null;
      if (activeTheme) {
        initialTheme = activeTheme;
      } else {
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        initialTheme = systemTheme;
      }
    }

    setTimeout(() => {
      setTheme(initialTheme);
      document.documentElement.setAttribute("data-theme", initialTheme);
      setMounted(true);
    }, 0);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("pharmnode-theme", nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
  };

  if (!mounted) {
    return (
      <div className="w-8 h-8 rounded-lg bg-zinc-900/60 border border-zinc-800 flex items-center justify-center text-zinc-400">
        <div className="w-3 h-3 rounded-full border border-zinc-700 border-t-zinc-400 animate-spin" />
      </div>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="w-8 h-8 rounded-lg bg-zinc-900/60 border border-zinc-800 flex items-center justify-center text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800/80 transition-all cursor-pointer theme-element"
      aria-label="Toggle theme"
      title={theme === "dark" ? t("theme_light") : t("theme_dark")}
    >
      {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
};
