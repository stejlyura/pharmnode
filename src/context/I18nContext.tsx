"use client";

import React, { createContext, useContext, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import enUsDict from "../i18n/dictionaries/en-US.json";
import enEuDict from "../i18n/dictionaries/en-EU.json";
import ruRuDict from "../i18n/dictionaries/ru-RU.json";

type Locale = "en-US" | "en-EU" | "ru-RU";

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const dictionaries = {
  "en-US": enUsDict,
  "en-EU": enEuDict,
  "ru-RU": ruRuDict,
};


export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();

  const [localeState, setLocaleState] = useState<Locale>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("pharmnode-locale") as Locale | null;
      if (saved && (saved === "en-US" || saved === "en-EU" || saved === "ru-RU")) {
        return saved;
      }
      const match = document.cookie.match(/pharmnode-locale=([^;]+)/);
      if (match && (match[1] === "en-US" || match[1] === "en-EU" || match[1] === "ru-RU")) {
        return match[1] as Locale;
      }
    }
    return "en-US";
  });

  // Compute active locale directly during render based on the current pathname
  let locale: Locale = "en-US";
  if (pathname) {
    if (pathname === "/admin" || pathname.startsWith("/admin/")) {
      locale = "en-US";
    } else if (pathname === "/ru" || pathname.startsWith("/ru/")) {
      locale = "ru-RU";
    } else {
      if (localeState === "en-US" || localeState === "en-EU") {
        locale = localeState;
      }
    }
  }

  const handleSetLocale = (newLocale: Locale) => {
    if (pathname === "/admin" || pathname.startsWith("/admin/")) {
      return; // Force English on /admin routes
    }

    let targetPath = pathname || "/";
    if (newLocale === "ru-RU") {
      if (!targetPath.startsWith("/ru")) {
        targetPath = `/ru${targetPath === "/" ? "" : targetPath}`;
      }
    } else {
      if (targetPath.startsWith("/ru")) {
        targetPath = targetPath.replace(/^\/ru/, "") || "/";
      }
    }

    // Append search params if they exist in window object
    const search = typeof window !== "undefined" ? window.location.search : "";
    const finalUrl = `${targetPath}${search}`;

    setLocaleState(newLocale);
    localStorage.setItem("pharmnode-locale", newLocale);
    document.cookie = `pharmnode-locale=${newLocale}; path=/; max-age=31536000`;

    router.push(finalUrl);
  };

  const t = (key: string): string => {
    const dict = dictionaries[locale] as Record<string, string>;
    return dict[key] || key;
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale: handleSetLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error("useTranslation must be used within an I18nProvider");
  }
  return context;
};
