"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
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
  const [locale, setLocale] = useState<Locale>("en-US");

  useEffect(() => {
    const saved = localStorage.getItem("pharmnode-locale") as Locale | null;
    if (saved && (saved === "en-US" || saved === "en-EU" || saved === "ru-RU")) {
      setLocale(saved);
    } else {
      const match = document.cookie.match(/pharmnode-locale=([^;]+)/);
      if (match && (match[1] === "en-US" || match[1] === "en-EU" || match[1] === "ru-RU")) {
        setLocale(match[1] as Locale);
      }
    }
  }, []);

  const handleSetLocale = (newLocale: Locale) => {
    setLocale(newLocale);
    localStorage.setItem("pharmnode-locale", newLocale);
    document.cookie = `pharmnode-locale=${newLocale}; path=/; max-age=31536000`;
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
