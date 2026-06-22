"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "../context/I18nContext";
import { ThemeToggle } from "./ThemeToggle";
import { 
  LogIn, 
  LogOut, 
  User, 
  ShieldCheck, 
  ChevronDown, 
  Plus, 
  Undo2, 
  Redo2,
  Sparkles,
  Sidebar,
  Grid,
  Settings,
  HelpCircle
} from "lucide-react";

import { Ingredient } from "../types/pharm";

interface HeaderProps {
  showCanvasControls?: boolean;
  undo?: () => void;
  redo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  showAddMenu?: boolean;
  setShowAddMenu?: (show: boolean) => void;
  remainingIngredients?: Ingredient[];
  handleAddIngredient?: (id: number) => void;
  tariff?: "hobby" | "professional";
  setTariff?: (tariff: "hobby" | "professional") => void;
  onOpenCompatibilityMatrix?: () => void;
  onOpenPricing?: (targetTariff?: "professional") => void;
  onOpenBenefits?: (tariff: "professional") => void;
  onOpenWizard?: () => void;
  onStartTour?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  showCanvasControls = false,
  undo,
  redo,
  canUndo = false,
  canRedo = false,
  showAddMenu = false,
  setShowAddMenu,
  remainingIngredients = [],
  handleAddIngredient,
  tariff,
  setTariff,
  onOpenCompatibilityMatrix,
  onOpenPricing,
  onOpenBenefits,
  onOpenWizard,
  onStartTour
}) => {
  const { user, status, login, logout, changeTariff } = useAuth();
  const { t, locale, setLocale } = useTranslation();
  const [showLoginMenu, setShowLoginMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const activeTariff = user ? user.tariff : (tariff || "hobby");

  const handleMockLogin = async (provider: "mock-google" | "mock-github" | "mock-microsoft") => {
    await login(provider);
    setShowLoginMenu(false);
  };

  const handleLogoutClick = async () => {
    await logout();
    setShowProfileMenu(false);
  };

  const handleTariffChange = (newTariff: "hobby" | "professional") => {
    if (newTariff === "hobby" && activeTariff === "professional") {
      return; // Block downgrading
    }
    if (user) {
      changeTariff(newTariff);
    } else if (setTariff) {
      setTariff(newTariff);
    }
    setShowProfileMenu(false);
  };

  return (
    <header className="h-16 border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md flex items-center justify-between px-6 z-40 sticky top-0 theme-element">
      <Link href="/" className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-sm shadow-[0_0_15px_rgba(99,102,241,0.3)]">
          PN
        </div>
        <div>
          <h1 className="text-sm font-bold text-zinc-100 uppercase tracking-wider">PharmNode</h1>
          <span className="text-[10px] text-zinc-500 block leading-tight">Virtual Formulation Studio</span>
        </div>
      </Link>

      {/* Middle section for page-specific canvas actions */}
      {showCanvasControls && (
        <div className="flex items-center gap-4">
          {/* Undo / Redo controls */}
          <div className="flex items-center bg-zinc-900/60 border border-zinc-800 rounded-lg p-0.5">
            <button
              onClick={undo}
              disabled={!canUndo}
              className={`p-1.5 rounded-md transition-colors ${
                canUndo 
                  ? 'text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800' 
                  : 'text-zinc-600 cursor-not-allowed'
              }`}
              title={t('header_undo')}
            >
              <Undo2 size={16} />
            </button>
            <button
              onClick={redo}
              disabled={!canRedo}
              className={`p-1.5 rounded-md transition-colors ${
                canRedo 
                  ? 'text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800' 
                  : 'text-zinc-600 cursor-not-allowed'
              }`}
              title={t('header_redo')}
            >
              <Redo2 size={16} />
            </button>
          </div>

          {/* Toggle Sidebar Panel */}
          {setShowAddMenu && (
            <button
              onClick={() => setShowAddMenu(!showAddMenu)}
              className={`p-1.5 rounded-lg border transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer theme-element ${
                showAddMenu 
                  ? 'bg-zinc-900 border-zinc-800 text-indigo-400 shadow-inner' 
                  : 'bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
              title={showAddMenu ? t('header_hide_components') : t('header_show_components')}
            >
              <Sidebar size={15} />
              <span className="hidden sm:inline">{t('header_components_panel')}</span>
            </button>
          )}

          {/* Compatibility Matrix Button */}
          {onOpenCompatibilityMatrix && (
            <button
              id="header-matrix-btn"
              onClick={onOpenCompatibilityMatrix}
              className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:text-zinc-200 transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer theme-element"
              title={t('header_open_matrix')}
            >
              <Grid size={15} />
              <span className="hidden sm:inline">{t('header_compatibility_guide')}</span>
            </button>
          )}

          {/* Wizard Button */}
          {onOpenWizard && (
            <button
              id="header-wizard-btn"
              onClick={onOpenWizard}
              className="p-1.5 rounded-lg border border-indigo-500/20 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 hover:text-indigo-300 transition-all flex items-center gap-1.5 text-xs font-bold cursor-pointer theme-element shadow-[0_0_15px_rgba(99,102,241,0.1)]"
              title={t('wizard_title')}
            >
              <Sparkles size={15} className="animate-pulse" />
              <span className="hidden sm:inline">{t('wizard_launch_btn')}</span>
            </button>
          )}

          {/* Tutorial Button */}
          {onStartTour && (
            <button
              id="header-tour-btn"
              onClick={onStartTour}
              className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:text-zinc-200 transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer theme-element"
              title={t('header_start_tour') || 'Start Onboarding Tour'}
            >
              <HelpCircle size={15} />
              <span className="hidden md:inline">{t('header_tour') || 'Tutorial'}</span>
            </button>
          )}
        </div>
      )}

      {/* Right controls: Tariff Selector, Theme Switcher & User Profile OAuth */}
      <div className="flex items-center gap-4">
        {/* Tariff Selector (visible for all users) */}
        {(setTariff || user) && (
          <div className="flex items-center bg-zinc-900/60 rounded-lg p-0.5 border border-zinc-800">
            <button
              disabled={activeTariff === "professional"}
              onClick={() => handleTariffChange("hobby")}
              className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-all ${
                activeTariff === "hobby"
                  ? "bg-zinc-800 text-indigo-400 shadow-sm"
                  : activeTariff === "professional"
                  ? "text-zinc-650 cursor-not-allowed opacity-50"
                  : "text-zinc-400 hover:text-zinc-200 cursor-pointer"
              }`}
              title={activeTariff === "professional" ? (locale === "ru-RU" ? "Нельзя переключиться на Hobby при активном Pro" : "Cannot downgrade to Hobby with active Pro") : undefined}
            >
              Hobby
            </button>
            <button
              onClick={() => {
                if (activeTariff === "professional") {
                  if (onOpenBenefits) onOpenBenefits("professional");
                } else {
                  if (onOpenPricing) onOpenPricing("professional");
                }
              }}
              className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                activeTariff === "professional"
                  ? "bg-zinc-800 text-indigo-400 shadow-sm font-extrabold"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Pro
            </button>
          </div>
        )}

        <button
          onClick={() => setLocale(locale === "ru-RU" ? "en-US" : "ru-RU")}
          className="px-2.5 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 text-xs font-bold text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer theme-element"
          title={t("header_switch_lang")}
        >
          {locale === "ru-RU" ? "RU" : "EN"}
        </button>

        <ThemeToggle />

        {status === "loading" ? (
          <div className="w-8 h-8 rounded-full border border-zinc-700 border-t-zinc-400 animate-spin" />
        ) : user ? (
          /* Logged In User Dropdown Menu */
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 p-1 pr-2 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:bg-zinc-800/60 transition-colors cursor-pointer theme-element"
            >
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name}
                  className="w-7 h-7 rounded-lg object-cover border border-zinc-700"
                />
              ) : (
                <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <User size={14} />
                </div>
              )}
              <div className="text-left hidden sm:block">
                <span className="text-[11px] font-bold text-zinc-200 block max-w-[100px] truncate leading-none">
                  {user.name}
                </span>
                <span className="text-[9px] text-zinc-500 block capitalize leading-none mt-0.5">
                  {user.tariff}
                </span>
              </div>
              <ChevronDown size={12} className="text-zinc-500" />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl border border-zinc-800 bg-zinc-900 shadow-2xl p-2 flex flex-col gap-1 z-50">
                <div className="px-2.5 py-2 border-b border-zinc-800/80 mb-1">
                  <span className="text-[10px] text-zinc-500 block leading-tight">{t('header_logged_in_as')} ({user.provider})</span>
                  <span className="text-xs font-bold text-zinc-200 block truncate mt-0.5">{user.email}</span>
                </div>

                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider px-2 py-1 block">
                  {t('header_switch_plan')}
                </span>
                
                <button
                  disabled={user.tariff === "professional"}
                  onClick={() => handleTariffChange("hobby")}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                    user.tariff === "professional"
                      ? "text-zinc-650 cursor-not-allowed opacity-50"
                      : user.tariff === "hobby"
                      ? "text-indigo-400 font-bold"
                      : "text-zinc-300 hover:bg-zinc-800 cursor-pointer"
                  }`}
                  title={user.tariff === "professional" ? (locale === "ru-RU" ? "Нельзя переключиться на Hobby при активном Pro" : "Cannot downgrade to Hobby with active Pro") : undefined}
                >
                  <span>Hobby</span>
                  <span className="text-[9px] bg-zinc-850 px-1 py-0.2 rounded text-zinc-500">$0</span>
                </button>
                <button
                  onClick={() => handleTariffChange("professional")}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-zinc-800 transition-colors flex items-center justify-between cursor-pointer ${
                    user.tariff === "professional" ? "text-indigo-400 font-bold" : "text-zinc-300"
                  }`}
                >
                  <span className="flex items-center gap-1">
                    <Sparkles size={11} className="text-indigo-400 animate-pulse" />
                    Pro
                  </span>
                  <span className="text-[9px] bg-zinc-850 px-1 py-0.2 rounded text-zinc-500">$19</span>
                </button>

                <div className="border-t border-zinc-800/80 my-1 pt-1">
                  <Link
                    href="/settings"
                    onClick={() => setShowProfileMenu(false)}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-zinc-300 hover:bg-zinc-800 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Settings size={12} className="text-zinc-500" />
                    {t('header_settings') || 'Settings'}
                  </Link>
                  <Link
                    href="/admin"
                    onClick={() => setShowProfileMenu(false)}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-zinc-300 hover:bg-zinc-800 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <User size={12} className="text-zinc-500" />
                    {t('header_admin_panel')}
                  </Link>
                  <button
                    onClick={handleLogoutClick}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-rose-400 hover:bg-rose-500/5 hover:text-rose-300 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <LogOut size={12} />
                    {t('header_logout')}
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="relative">
            <button
              onClick={() => setShowLoginMenu(!showLoginMenu)}
              className="px-3.5 py-1.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:text-zinc-100 text-zinc-200 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer theme-element"
            >
              <LogIn size={13} />
              {t('header_sign_in')}
            </button>

            {showLoginMenu && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl border border-zinc-800 bg-zinc-900 shadow-2xl p-2.5 flex flex-col gap-1.5 z-50">
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider px-1 block mb-1">
                  {t('header_auth_title')}
                </span>
                
                <button
                  onClick={() => handleMockLogin("mock-google")}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs hover:bg-zinc-800 text-zinc-200 transition-colors flex items-center gap-2 cursor-pointer border border-zinc-800/50 bg-zinc-900/40"
                >
                  <div className="w-4 h-4 rounded bg-red-500/10 flex items-center justify-center text-red-400 text-[9px] font-bold">G</div>
                  <span>Google Mock (Hobby)</span>
                </button>
                <button
                  onClick={() => handleMockLogin("mock-github")}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs hover:bg-zinc-800 text-zinc-200 transition-colors flex items-center gap-2 cursor-pointer border border-zinc-800/50 bg-zinc-900/40"
                >
                  <div className="w-4 h-4 rounded bg-indigo-500/10 flex items-center justify-center text-indigo-400 text-[9px] font-bold">Git</div>
                  <span>GitHub Mock (Pro)</span>
                </button>


                <div className="border-t border-zinc-800/80 my-1 pt-1.5 flex flex-col gap-1">
                  <span className="text-[8px] text-zinc-500 leading-normal px-1">
                    {t('header_demo_note')}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
export default Header;
