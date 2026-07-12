"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Ingredient, IngredientRole } from '../types/pharm';
import { useTranslation } from '../context/I18nContext';
import {
  Search,
  Plus,
  X,
  ChevronDown
} from 'lucide-react';

interface MobileIngredientSheetProps {
  isOpen: boolean;
  onClose: () => void;
  activeNodeIngredientIds: (number | string)[];
  onAddIngredient: (id: number | string) => void;
  allIngredients: Ingredient[];
  onOpenAddModal: () => void;
}

const ROLE_VISUAL: Record<IngredientRole, {
  accent: string;
  accentBg: string;
  accentBorder: string;
  dotColor: string;
}> = {
  active: {
    accent: 'text-rose-400',
    accentBg: 'bg-rose-500/10',
    accentBorder: 'border-rose-500/20',
    dotColor: '#f87171',
  },
  filler: {
    accent: 'text-blue-400',
    accentBg: 'bg-blue-500/10',
    accentBorder: 'border-blue-500/20',
    dotColor: '#60a5fa',
  },
  'dry-binder': {
    accent: 'text-emerald-400',
    accentBg: 'bg-emerald-500/10',
    accentBorder: 'border-emerald-500/20',
    dotColor: '#34d399',
  },
  lubricant: {
    accent: 'text-amber-400',
    accentBg: 'bg-amber-500/10',
    accentBorder: 'border-amber-500/20',
    dotColor: '#fbbf24',
  },
  glidant: {
    accent: 'text-cyan-400',
    accentBg: 'bg-cyan-500/10',
    accentBorder: 'border-cyan-500/20',
    dotColor: '#22d3ee',
  },
  // ─── New excipient roles (Задача 1.1) ───────────────────────────────────
  disintegrant: {
    accent: 'text-violet-400',
    accentBg: 'bg-violet-500/10',
    accentBorder: 'border-violet-500/20',
    dotColor: '#a78bfa',
  },
  coating: {
    accent: 'text-pink-400',
    accentBg: 'bg-pink-500/10',
    accentBorder: 'border-pink-500/20',
    dotColor: '#f472b6',
  },
  sweetener: {
    accent: 'text-lime-400',
    accentBg: 'bg-lime-500/10',
    accentBorder: 'border-lime-500/20',
    dotColor: '#a3e635',
  },
  flavoring: {
    accent: 'text-orange-400',
    accentBg: 'bg-orange-500/10',
    accentBorder: 'border-orange-500/20',
    dotColor: '#f97316',
  },
  colorant: {
    accent: 'text-pink-400',
    accentBg: 'bg-pink-500/10',
    accentBorder: 'border-pink-500/20',
    dotColor: '#ec4899',
  },
  'anti-caking': {
    accent: 'text-orange-400',
    accentBg: 'bg-orange-500/10',
    accentBorder: 'border-orange-500/20',
    dotColor: '#fb923c',
  },
};

const CATEGORY_ORDER: IngredientRole[] = [
  'active',
  'filler',
  'dry-binder',
  'lubricant',
  'glidant',
  'disintegrant',
  'coating',
  'sweetener',
  'anti-caking',
  'flavoring',
  'colorant'
];

export const MobileIngredientSheet: React.FC<MobileIngredientSheetProps> = ({
  isOpen,
  onClose,
  activeNodeIngredientIds,
  onAddIngredient,
  allIngredients = [],
  onOpenAddModal
}) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>(
    Object.fromEntries(CATEGORY_ORDER.map(r => [r, true]))
  );

  const ROLE_META = useMemo<Record<IngredientRole, {
    label: string;
    shortLabel: string;
    accent: string;
    accentBg: string;
    accentBorder: string;
    dotColor: string;
  }>>(() => ({
    active: { label: t('role_active'), shortLabel: t('role_active_short'), ...ROLE_VISUAL.active },
    filler: { label: t('role_filler'), shortLabel: t('role_filler_short'), ...ROLE_VISUAL.filler },
    'dry-binder': { label: t('role_dry_binder'), shortLabel: t('role_dry_binder_short'), ...ROLE_VISUAL['dry-binder'] },
    lubricant: { label: t('role_lubricant'), shortLabel: t('role_lubricant_short'), ...ROLE_VISUAL.lubricant },
    glidant: { label: t('role_glidant'), shortLabel: t('role_glidant_short'), ...ROLE_VISUAL.glidant },
    // ─── New excipient roles (Задача 1.1) ─────────────────────────────────
    disintegrant: { label: t('role_disintegrant') ?? 'Disintegrant', shortLabel: t('role_disintegrant_short') ?? 'Disint.', ...ROLE_VISUAL.disintegrant },
    coating: { label: t('role_coating') ?? 'Coating', shortLabel: t('role_coating_short') ?? 'Coat.', ...ROLE_VISUAL.coating },
    sweetener: { label: t('role_sweetener') ?? 'Sweetener', shortLabel: t('role_sweetener_short') ?? 'Sweet.', ...ROLE_VISUAL.sweetener },
    'anti-caking': { label: t('role_anti_caking') ?? 'Anti-Caking', shortLabel: t('role_anti_caking_short') ?? 'Anti-C.', ...ROLE_VISUAL['anti-caking'] },
    flavoring: { label: t('role_flavoring') ?? 'Flavoring', shortLabel: t('role_flavoring_short') ?? 'Flav.', ...ROLE_VISUAL.flavoring },
    colorant: { label: t('role_colorant') ?? 'Colorant', shortLabel: t('role_colorant_short') ?? 'Color.', ...ROLE_VISUAL.colorant },
  }), [t]);

  const toggleCategory = (role: string) => {
    setOpenCategories(prev => ({ ...prev, [role]: !prev[role] }));
  };



  const filteredIngredients = useMemo(() => {
    if (!searchQuery) return allIngredients;
    const q = searchQuery.toLowerCase();
    return allIngredients.filter(ing => 
      t(ing.name).toLowerCase().includes(q) ||
      ing.role.toLowerCase().includes(q) ||
      ROLE_META[ing.role]?.label.toLowerCase().includes(q) ||
      (ing.casNumber && ing.casNumber.includes(q))
    );
  }, [allIngredients, searchQuery, ROLE_META, t]);

  // Expand categories with results on search query change
  useEffect(() => {
    if (searchQuery) {
      const rolesWithResults = new Set(filteredIngredients.map(i => i.role));
      setTimeout(() => {
        setOpenCategories(prev => {
          const next = { ...prev };
          rolesWithResults.forEach(r => {
            next[r] = true;
          });
          return next;
        });
      }, 0);
    }
  }, [searchQuery, filteredIngredients]);

  // Handle ESC key to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when sheet is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-xs z-50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Bottom Sheet Drawer */}
      <div
        className={`fixed bottom-0 left-0 right-0 max-h-[85vh] bg-zinc-900 border-t border-zinc-800 rounded-t-2xl z-55 flex flex-col pb-safe transition-transform duration-300 ease-out transform ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {/* Drag handle decoration */}
        <div className="w-12 h-1 bg-zinc-700 rounded-full mx-auto my-3 shrink-0 cursor-pointer" onClick={onClose} />

        {/* Title and Close button */}
        <div className="flex justify-between items-center px-4 pb-2 shrink-0">
          <h2 className="text-zinc-100 font-extrabold text-base tracking-wide flex items-center gap-2">
            {t('sidebar_title')}
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-350 p-2 rounded-lg bg-zinc-800/40 border border-zinc-800"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Search & Actions block */}
        <div className="px-4 py-2 shrink-0 flex flex-col gap-3">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
            />
            {searchQuery && (
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-350"
                onClick={() => setSearchQuery('')}
              >
                <X size={14} />
              </button>
            )}
            <input
              type="text"
              placeholder={t('sidebar_search_placeholder')}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-8 py-3 bg-zinc-950 text-zinc-200 placeholder-zinc-600 border border-zinc-850 rounded-xl outline-none focus:border-indigo-500 transition-colors font-sans"
              style={{ minHeight: '44px' }}
            />
          </div>

          <button
            onClick={() => {
              onClose();
              onOpenAddModal();
            }}
            className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer"
            style={{ minHeight: '44px' }}
          >
            <Plus size={14} />
            {t('sidebar_add_custom')}
          </button>
        </div>

        {/* Scrollable list */}
        <div className="flex-1 overflow-y-auto px-4 py-2 flex flex-col gap-3">
          {filteredIngredients.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-zinc-500 text-xs">
              {t('sidebar_no_results')}
            </div>
          ) : (
            CATEGORY_ORDER.map(role => {
              const meta = ROLE_META[role];
              const items = filteredIngredients.filter(i => i.role === role);
              if (items.length === 0) return null;

              const isExpanded = openCategories[role] ?? true;

              return (
                <div key={role} className="border border-zinc-800/60 rounded-xl overflow-hidden bg-zinc-850/25">
                  <button
                    onClick={() => toggleCategory(role)}
                    className="w-full flex items-center justify-between px-3 py-3 bg-zinc-850/40 border-b border-zinc-850/20 cursor-pointer"
                    style={{ minHeight: '44px' }}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ background: meta.dotColor }}
                      />
                      <span className={`${meta.accent} text-[11px] font-bold uppercase tracking-wider`}>
                        {meta.label}
                      </span>
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-550 border border-zinc-800">
                        {items.length}
                      </span>
                    </div>
                    <ChevronDown
                      size={14}
                      className="text-zinc-500 transition-transform duration-200"
                      style={{
                        transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)'
                      }}
                    />
                  </button>

                  {isExpanded && (
                    <div className="p-2 flex flex-col gap-2">
                      {items.map(ing => {
                        const isOnCanvas = activeNodeIngredientIds.includes(ing.id);
                        const m = ROLE_META[ing.role];

                        return (
                          <div
                            key={ing.id}
                            onClick={() => {
                              if (!isOnCanvas) {
                                onAddIngredient(ing.id);
                                onClose();
                              }
                            }}
                            className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                              isOnCanvas
                                ? 'bg-zinc-950/20 border-transparent opacity-40 cursor-not-allowed'
                                : 'bg-zinc-900 border-zinc-850 hover:border-indigo-500/50 active:bg-zinc-850 cursor-pointer'
                            }`}
                            style={{ minHeight: '44px' }}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span
                                className="w-2 h-2 rounded-full shrink-0"
                                style={{ background: m.dotColor }}
                              />
                              <div className="min-w-0">
                                <p className={`text-xs font-bold truncate ${isOnCanvas ? 'text-zinc-500' : 'text-zinc-150'}`}>
                                  {t(ing.name)}
                                </p>
                                <p className="text-[10px] text-zinc-550 font-mono mt-0.5 leading-none">
                                  {ing.casNumber ? `CAS ${ing.casNumber}` : `ρ ${ing.looseBulkDensity.toFixed(2)} → ${ing.tappedBulkDensity.toFixed(2)} g/mL`}
                                </p>
                              </div>
                            </div>

                            {isOnCanvas ? (
                              <span className="text-[9px] font-bold text-zinc-500 border border-zinc-850 px-2 py-0.5 rounded-lg bg-zinc-950">
                                ✓
                              </span>
                            ) : (
                              <span className={`${m.accent} ${m.accentBg} ${m.accentBorder} text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg border shrink-0`}>
                                {m.shortLabel}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
};
