"use client";

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { baseIngredientsMatrix, Ingredient, IngredientRole } from '../types/pharm';
import { useTranslation } from '../context/I18nContext';
import {
  Search,
  GripVertical,
  ChevronLeft,
  ChevronDown,
  Sparkles,
  Layers,
  ShieldCheck,
  Flame,
  Wind,
  FlaskConical,
  Plus,
  Package,
  X,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  activeNodeIngredientIds: (number | string)[];
  onAddIngredient: (id: number | string) => void;
  customIngredients: Ingredient[];
  onOpenAddModal: () => void;
}

// Static role meta (visual only — no text labels here)
const ROLE_VISUAL: Record<IngredientRole, {
  icon: React.ReactNode;
  accent: string;
  accentBg: string;
  accentBorder: string;
  dotColor: string;
}> = {
  active: {
    icon: <Sparkles size={13} />,
    accent: 'text-rose-400',
    accentBg: 'bg-rose-500/10',
    accentBorder: 'border-rose-500/25',
    dotColor: '#f87171',
  },
  filler: {
    icon: <Layers size={13} />,
    accent: 'text-blue-400',
    accentBg: 'bg-blue-500/10',
    accentBorder: 'border-blue-500/25',
    dotColor: '#60a5fa',
  },
  'dry-binder': {
    icon: <ShieldCheck size={13} />,
    accent: 'text-emerald-400',
    accentBg: 'bg-emerald-500/10',
    accentBorder: 'border-emerald-500/25',
    dotColor: '#34d399',
  },
  lubricant: {
    icon: <Flame size={13} />,
    accent: 'text-amber-400',
    accentBg: 'bg-amber-500/10',
    accentBorder: 'border-amber-500/25',
    dotColor: '#fbbf24',
  },
  glidant: {
    icon: <Wind size={13} />,
    accent: 'text-cyan-400',
    accentBg: 'bg-cyan-500/10',
    accentBorder: 'border-cyan-500/25',
    dotColor: '#22d3ee',
  },
};

const CATEGORY_ORDER: IngredientRole[] = ['active', 'filler', 'dry-binder', 'lubricant', 'glidant'];

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onToggle,
  activeNodeIngredientIds,
  onAddIngredient,
  customIngredients = [],
  onOpenAddModal,
}) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  // All categories open by default — like n8n / Scratch
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>(
    Object.fromEntries(CATEGORY_ORDER.map(r => [r, true]))
  );
  const [draggingId, setDraggingId] = useState<number | string | null>(null);

  const ghostRef = useRef<HTMLDivElement>(null);

  // Dynamic role meta with translated labels — recomputed on locale change
  const ROLE_META = useMemo<Record<IngredientRole, {
    label: string;
    shortLabel: string;
    icon: React.ReactNode;
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
  }), [t]);

  const toggleCategory = (role: string) => {
    setOpenCategories(prev => ({ ...prev, [role]: !prev[role] }));
  };

  const allIngredients = React.useMemo(() => {
    return [...baseIngredientsMatrix, ...customIngredients];
  }, [customIngredients]);

  const filteredIngredients = allIngredients.filter(ing => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      ing.name.toLowerCase().includes(q) ||
      ing.role.toLowerCase().includes(q) ||
      ROLE_META[ing.role]?.label.toLowerCase().includes(q) ||
      (ing.casNumber && ing.casNumber.includes(q))
    );
  });

  // When searching, auto-expand all categories that have results
  useEffect(() => {
    if (searchQuery) {
      const rolesWithResults = new Set(filteredIngredients.map(i => i.role));
      setOpenCategories(prev => {
        const next = { ...prev };
        rolesWithResults.forEach(r => { next[r] = true; });
        return next;
      });
    }
  }, [searchQuery, filteredIngredients]);

  const handleDragStart = (e: React.DragEvent, ing: Ingredient) => {
    setDraggingId(ing.id);
    e.dataTransfer.setData('text/plain', ing.id.toString());
    e.dataTransfer.setData('application/pharmnode-node', 'ingredient');
    e.dataTransfer.setData('application/pharmnode-name', ing.name);
    e.dataTransfer.effectAllowed = 'copy';

    // Build a rich ghost drag image
    const ghost = document.createElement('div');
    ghost.style.cssText = `
      position: fixed; top: -200px; left: 0;
      display: flex; align-items: center; gap: 8px;
      background: rgba(99,102,241,0.95);
      color: white; font-size: 12px; font-weight: 600;
      padding: 8px 14px; border-radius: 8px;
      border: 1px solid rgba(165,180,252,0.5);
      box-shadow: 0 8px 24px rgba(0,0,0,0.5);
      font-family: var(--font-inter), sans-serif;
      backdrop-filter: blur(4px);
      pointer-events: none; white-space: nowrap;
    `;
    ghost.textContent = `⬡ ${ing.name}`;
    document.body.appendChild(ghost);
    e.dataTransfer.setDragImage(ghost, 60, 20);
    setTimeout(() => document.body.removeChild(ghost), 0);
  };

  const handleDragEnd = () => {
    setDraggingId(null);
  };

  const totalCount = allIngredients.length;
  const onCanvasCount = activeNodeIngredientIds.length;

  return (
    <aside
      className={`sidebar-panel relative flex-shrink-0 flex flex-col h-full z-30 overflow-hidden theme-element ${
        isOpen ? 'sidebar-open' : 'sidebar-closed'
      }`}
      style={{
        width: isOpen ? '288px' : '0px',
        minWidth: isOpen ? '288px' : '0px',
        borderRight: isOpen ? '1px solid var(--border)' : 'none',
        background: 'var(--surface)',
        transition: 'width 0.28s cubic-bezier(0.4,0,0.2,1), min-width 0.28s cubic-bezier(0.4,0,0.2,1)',
      }}
    >
      {/* Toggle Button — floats on the right edge */}
      <button
        id="sidebar-toggle-btn"
        onClick={onToggle}
        title={isOpen ? t('sidebar_hide') : t('sidebar_show')}
        className="absolute -right-3.5 top-1/2 -translate-y-1/2 w-7 h-14 flex items-center justify-center z-50 cursor-pointer"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderLeft: 'none',
          borderRadius: '0 8px 8px 0',
          color: 'var(--muted)',
          boxShadow: '3px 0 10px rgba(0,0,0,0.2)',
          transition: 'background 0.2s, color 0.2s',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.color = 'var(--primary)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.color = 'var(--muted)';
        }}
      >
        <span
          style={{
            display: 'inline-flex',
            transition: 'transform 0.28s cubic-bezier(0.4,0,0.2,1)',
            transform: isOpen ? 'rotate(0deg)' : 'rotate(180deg)',
          }}
        >
          <ChevronLeft size={14} />
        </span>
      </button>

      {/* Inner content — hidden when closed */}
      <div
        className="flex flex-col h-full"
        style={{
          width: '288px',
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'opacity 0.2s ease',
        }}
      >
        {/* ── Header ── */}
        <div
          className="flex-shrink-0 px-4 pt-4 pb-3"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: 'var(--primary)', opacity: 0.9 }}
              >
                <Package size={14} color="white" />
              </div>
              <div>
                <h2
                  className="text-[11px] font-bold uppercase tracking-widest leading-none"
                  style={{ color: 'var(--text)' }}
                >
                  {t('sidebar_title')}
                </h2>
                <p className="text-[9px] mt-0.5" style={{ color: 'var(--muted)' }}>
                  {onCanvasCount} / {totalCount} {t('sidebar_on_canvas')}
                </p>
              </div>
            </div>
            <button
              id="sidebar-add-custom-btn"
              onClick={onOpenAddModal}
              title={t('sidebar_add_custom')}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-all"
              style={{
                background: 'var(--primary)',
                color: 'white',
                border: 'none',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.opacity = '0.85';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.opacity = '1';
              }}
            >
              <Plus size={11} />
              {t('sidebar_custom_btn')}
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search
              size={13}
              className="absolute left-2.5 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--muted)' }}
            />
            {searchQuery && (
              <button
                className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer"
                style={{ color: 'var(--muted)' }}
                onClick={() => setSearchQuery('')}
              >
                <X size={12} />
              </button>
            )}
            <input
              id="sidebar-search-input"
              type="text"
              placeholder={t('sidebar_search_placeholder')}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-8 pr-7 py-2 rounded-lg outline-none transition-all"
              style={{
                background: 'var(--bg)',
                color: 'var(--text)',
                border: '1px solid var(--border)',
                fontFamily: 'var(--font)',
              }}
              onFocus={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--primary)';
              }}
              onBlur={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
              }}
            />
          </div>
        </div>

        {/* ── Scrollable category list ── */}
        <div className="flex-1 overflow-y-auto">
          {filteredIngredients.length === 0 && searchQuery ? (
            <div className="flex flex-col items-center justify-center h-32 gap-2">
              <FlaskConical size={24} style={{ color: 'var(--muted)', opacity: 0.4 }} />
              <p className="text-[11px]" style={{ color: 'var(--muted)' }}>
                {t('sidebar_no_results')}
              </p>
            </div>
          ) : (
            CATEGORY_ORDER.map(role => {
              const meta = ROLE_META[role];
              const items = filteredIngredients.filter(i => i.role === role);
              if (items.length === 0) return null;

              const isExpanded = openCategories[role] ?? true;

              return (
                <div key={role} className="sidebar-category">
                  {/* Category header */}
                  <button
                    id={`sidebar-cat-${role}`}
                    onClick={() => toggleCategory(role)}
                    className="w-full flex items-center justify-between px-4 py-2.5 cursor-pointer select-none transition-colors"
                    style={{
                      background: 'transparent',
                      border: 'none',
                      borderBottom: '1px solid var(--border)',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.background = 'rgba(128,128,128,0.05)';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.background = 'transparent';
                    }}
                  >
                    <div className="flex items-center gap-2">
                      {/* Color dot */}
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: meta.dotColor }}
                      />
                      <span className={`${meta.accent} text-[10px] font-bold uppercase tracking-widest`}>
                        {meta.label}
                      </span>
                      <span
                        className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded"
                        style={{
                          background: 'var(--bg)',
                          color: 'var(--muted)',
                          border: '1px solid var(--border)',
                        }}
                      >
                        {items.length}
                      </span>
                    </div>
                    <ChevronDown
                      size={12}
                      style={{
                        color: 'var(--muted)',
                        transition: 'transform 0.2s ease',
                        transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                      }}
                    />
                  </button>

                  {/* Items */}
                  {isExpanded && (
                    <div className="px-2 py-2 flex flex-col gap-1.5">
                      {items.map(ing => {
                        const isOnCanvas = activeNodeIngredientIds.includes(ing.id);
                        const isDragging = draggingId === ing.id;
                        const m = ROLE_META[ing.role];

                        return (
                          <div
                            key={ing.id}
                            id={`sidebar-ingredient-${ing.id}`}
                            draggable={!isOnCanvas}
                            onDragStart={e => handleDragStart(e, ing)}
                            onDragEnd={handleDragEnd}
                            onClick={() => {
                              if (!isOnCanvas) onAddIngredient(ing.id);
                            }}
                            title={
                              isOnCanvas
                                ? `${ing.name} ${t('sidebar_already_on_canvas')}`
                                : `${t('sidebar_drag_hint')} ${ing.name}`
                            }
                            className="sidebar-ingredient-card group flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-all"
                            style={{
                              background: isDragging
                                ? 'rgba(99,102,241,0.15)'
                                : isOnCanvas
                                  ? 'transparent'
                                  : 'var(--bg)',
                              border: `1px solid ${isOnCanvas ? 'transparent' : 'var(--border)'}`,
                              opacity: isOnCanvas ? 0.4 : 1,
                              cursor: isOnCanvas ? 'not-allowed' : 'grab',
                              transform: isDragging ? 'scale(0.96)' : 'scale(1)',
                              boxShadow: isDragging
                                ? '0 0 0 2px var(--primary)'
                                : 'none',
                            }}
                            onMouseEnter={e => {
                              if (!isOnCanvas) {
                                const el = e.currentTarget as HTMLElement;
                                el.style.borderColor = 'var(--primary)';
                                el.style.background = 'rgba(var(--primary-rgb, 0,94,184), 0.05)';
                              }
                            }}
                            onMouseLeave={e => {
                              if (!isOnCanvas) {
                                const el = e.currentTarget as HTMLElement;
                                el.style.borderColor = 'var(--border)';
                                el.style.background = 'var(--bg)';
                              }
                            }}
                          >
                            {/* Drag grip */}
                            {!isOnCanvas ? (
                              <GripVertical
                                size={12}
                                className="flex-shrink-0 transition-colors"
                                style={{ color: 'var(--muted)', opacity: 0.5 }}
                              />
                            ) : (
                              <div className="w-3 flex-shrink-0" />
                            )}

                            {/* Color dot */}
                            <span
                              className="w-2 h-2 rounded-full flex-shrink-0"
                              style={{ background: m.dotColor, opacity: isOnCanvas ? 0.5 : 1 }}
                            />

                            {/* Text info */}
                            <div className="flex-1 min-w-0">
                              <p
                                className="text-[11px] font-semibold truncate leading-tight"
                                style={{ color: isOnCanvas ? 'var(--muted)' : 'var(--text)' }}
                              >
                                {ing.name}
                              </p>
                              <p className="text-[9px] font-mono leading-tight mt-0.5" style={{ color: 'var(--muted)' }}>
                                {ing.casNumber ? `CAS ${ing.casNumber}` : `ρ ${ing.looseBulkDensity.toFixed(2)} g/mL`}
                              </p>
                            </div>

                            {/* Right side: badge or "on canvas" indicator */}
                            {isOnCanvas ? (
                              <span
                                className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded flex-shrink-0"
                                style={{
                                  color: 'var(--muted)',
                                  border: '1px solid var(--border)',
                                }}
                              >
                                ✓
                              </span>
                            ) : (
                              <span
                                className={`${m.accent} ${m.accentBg} ${m.accentBorder} text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border flex-shrink-0`}
                              >
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

        {/* ── Footer ── */}
        <div
          className="flex-shrink-0 px-4 py-3 flex items-center gap-2"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <div
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ background: 'var(--primary)' }}
          />
          <p className="text-[9px]" style={{ color: 'var(--muted)' }}>
            {t('sidebar_footer_hint')}
          </p>
        </div>
      </div>
    </aside>
  );
};
