"use client";

import React, { useState } from 'react';
import { baseIngredientsMatrix, Ingredient, IngredientRole } from '../types/pharm';
import { 
  Search, 
  GripVertical, 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown,
  Sparkles, 
  Layers, 
  ShieldAlert, 
  Flame, 
  TrendingUp,
  FlaskConical
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  activeNodeIngredientIds: (number | string)[];
  onAddIngredient: (id: number | string) => void;
  customIngredients: Ingredient[];
  onOpenAddModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onToggle,
  activeNodeIngredientIds,
  onAddIngredient,
  customIngredients = [],
  onOpenAddModal
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
    active: true,
    filler: true,
    'dry-binder': true,
    lubricant: true,
    glidant: true
  });

  const toggleCategory = (role: string) => {
    setOpenCategories(prev => ({
      ...prev,
      [role]: !prev[role]
    }));
  };

  const categories: { role: IngredientRole; label: string }[] = [
    { role: 'active', label: 'Действующие вещества' },
    { role: 'filler', label: 'Наполнители' },
    { role: 'dry-binder', label: 'Сухие связующие' },
    { role: 'lubricant', label: 'Лубриканты' },
    { role: 'glidant', label: 'Скользящие вещества' }
  ];

  // Handle Drag Start
  const handleDragStart = (e: React.DragEvent, ingredientId: number | string) => {
    e.dataTransfer.setData('text/plain', ingredientId.toString());
    e.dataTransfer.setData('application/pharmnode-node', 'ingredient');
    e.dataTransfer.effectAllowed = 'copy';
    
    // Create a ghost drag image if desired, otherwise browser handles it
    const dragIcon = document.getElementById(`drag-ghost-${ingredientId}`);
    if (dragIcon) {
      e.dataTransfer.setDragImage(dragIcon, 10, 10);
    }
  };

  const getRoleIcon = (role: IngredientRole) => {
    switch (role) {
      case 'active':
        return <Sparkles size={14} className="text-rose-400" />;
      case 'filler':
        return <Layers size={14} className="text-blue-400" />;
      case 'dry-binder':
        return <TrendingUp size={14} className="text-emerald-400" />;
      case 'lubricant':
        return <Flame size={14} className="text-amber-400" />;
      case 'glidant':
        return <FlaskConical size={14} className="text-cyan-400" />;
      default:
        return <FlaskConical size={14} className="text-zinc-400" />;
    }
  };

  const getRoleLabel = (role: IngredientRole) => {
    switch (role) {
      case 'active': return 'Активное вещество';
      case 'filler': return 'Наполнитель';
      case 'dry-binder': return 'Сухое связующее';
      case 'lubricant': return 'Лубрикант';
      case 'glidant': return 'Скользящее вещ-во';
      default: return role;
    }
  };

  const getRoleBadgeStyle = (role: IngredientRole) => {
    switch (role) {
      case 'active': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'filler': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'dry-binder': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'lubricant': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'glidant': return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      default: return 'bg-zinc-800 text-zinc-400 border-zinc-700';
    }
  };

  const allIngredients = React.useMemo(() => {
    return [...baseIngredientsMatrix, ...customIngredients];
  }, [customIngredients]);

  // Filter ingredients
  const filteredIngredients = allIngredients.filter(ing => {
    const query = searchQuery.toLowerCase();
    return (
      ing.name.toLowerCase().includes(query) ||
      ing.role.toLowerCase().includes(query) ||
      getRoleLabel(ing.role).toLowerCase().includes(query) ||
      (ing.casNumber && ing.casNumber.includes(query))
    );
  });

  return (
    <div 
      className={`relative h-full bg-zinc-950 border-r border-zinc-900 flex flex-col transition-all duration-300 z-30 theme-element ${
        isOpen ? 'w-80' : 'w-0 border-r-0'
      }`}
    >
      {/* Collapse/Expand Toggle Button (Floats on the border edge) */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-12 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-r-md flex items-center justify-center cursor-pointer shadow-md z-45"
        title={isOpen ? "Скрыть панель" : "Показать панель"}
      >
        {isOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
      </button>

      {/* Sidebar Content (Hidden when closed to prevent layout breaking) */}
      {isOpen && (
        <div className="flex-1 flex flex-col min-w-[20rem] h-full overflow-hidden p-4">
          <div className="mb-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                <FlaskConical size={14} className="text-indigo-400" />
                Библиотека веществ
              </h2>
              <button
                onClick={onOpenAddModal}
                className="px-2 py-1 bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 text-white rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                title="Добавить собственное вещество"
              >
                ＋ Своё
              </button>
            </div>
            <p className="text-[10px] text-zinc-500 mt-1">
              Перетащите ингредиент на холст по центру
            </p>
          </div>

          {/* Search box */}
          <div className="relative mb-4">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Поиск ингредиента..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-zinc-900/60 border border-zinc-800 text-zinc-100 placeholder-zinc-500 rounded-lg text-xs focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Collapsible Accordion List */}
          <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3">
            {filteredIngredients.length === 0 ? (
              <span className="text-xs text-zinc-500 text-center py-8 italic">
                Ничего не найдено
              </span>
            ) : (
              categories.map(cat => {
                const categoryItems = filteredIngredients.filter(ing => ing.role === cat.role);
                if (categoryItems.length === 0) return null; // Hide category if no items match search

                const isCatOpen = openCategories[cat.role] ?? false;

                return (
                  <div key={cat.role} className="flex flex-col gap-2">
                    {/* Accordion Category Header */}
                    <div
                      onClick={() => toggleCategory(cat.role)}
                      className="flex items-center justify-between px-3 py-2 bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-850/60 rounded-xl cursor-pointer select-none transition-colors duration-150 group theme-element"
                    >
                      <div className="flex items-center gap-2">
                        {getRoleIcon(cat.role)}
                        <span className="text-[11px] font-bold text-zinc-300 group-hover:text-zinc-200 transition-colors">
                          {cat.label}
                        </span>
                        <span className="text-[9px] bg-zinc-800 text-zinc-500 font-mono px-1.5 py-0.2 rounded font-bold">
                          {categoryItems.length}
                        </span>
                      </div>
                      <ChevronDown
                        size={13}
                        className={`text-zinc-500 group-hover:text-zinc-400 transition-transform duration-200 ${
                          isCatOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </div>

                    {/* Accordion Category Items */}
                    {isCatOpen && (
                      <div className="flex flex-col gap-2.5 pl-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                        {categoryItems.map(ing => {
                          const isOnCanvas = activeNodeIngredientIds.includes(ing.id);

                          return (
                            <div key={ing.id} className="relative">
                              {/* Visual drag image helper */}
                              <div 
                                id={`drag-ghost-${ing.id}`} 
                                className="absolute pointer-events-none opacity-0 left-0 top-0 bg-indigo-600/90 text-white text-xs px-3 py-1.5 rounded-lg font-semibold border border-indigo-400"
                              >
                                {ing.name}
                              </div>

                              <div
                                draggable={!isOnCanvas}
                                onDragStart={(e) => handleDragStart(e, ing.id)}
                                onClick={() => {
                                  if (!isOnCanvas) {
                                    onAddIngredient(ing.id);
                                  }
                                }}
                                className={`group border rounded-xl p-3 flex flex-col gap-2 transition-all select-none ${
                                  isOnCanvas 
                                    ? 'bg-zinc-900/20 border-zinc-900/80 opacity-40 cursor-not-allowed' 
                                    : 'bg-zinc-900/40 border-zinc-850 hover:border-zinc-800 hover:bg-zinc-900/80 hover:shadow-lg hover:shadow-black/20 cursor-grab active:cursor-grabbing'
                                }`}
                              >
                                {/* Ingredient Header */}
                                <div className="flex items-start justify-between gap-1.5">
                                  <div className="flex items-center gap-1.5 min-w-0">
                                    {!isOnCanvas && (
                                      <GripVertical size={13} className="text-zinc-600 group-hover:text-zinc-400 shrink-0 cursor-grab active:cursor-grabbing" />
                                    )}
                                    <span className="font-semibold text-xs text-zinc-200 group-hover:text-zinc-100 truncate">
                                      {ing.name}
                                    </span>
                                  </div>
                                  {isOnCanvas && (
                                    <span className="text-[8px] bg-zinc-800 border border-zinc-700/80 px-1.5 py-0.2 rounded text-zinc-400 font-bold shrink-0 uppercase tracking-wider">
                                      На холсте
                                    </span>
                                  )}
                                </div>

                                {/* Ingredient Details */}
                                <div className="flex justify-between items-center text-[10px]">
                                  <span className={`text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded border ${getRoleBadgeStyle(ing.role)} flex items-center gap-1`}>
                                    {getRoleIcon(ing.role)}
                                    {getRoleLabel(ing.role)}
                                  </span>
                                  {ing.casNumber && (
                                    <span className="text-zinc-500 font-mono text-[9px]">
                                      CAS: {ing.casNumber}
                                    </span>
                                  )}
                                </div>

                                {/* Density and Cost Stats */}
                                <div className="grid grid-cols-2 gap-2 text-[9px] text-zinc-500 pt-2 border-t border-zinc-900/60 font-mono">
                                  <div>
                                    <span className="block text-zinc-600 font-sans">Плотность</span>
                                    <span className="text-zinc-300">
                                      {ing.looseBulkDensity.toFixed(2)} → {ing.tappedBulkDensity.toFixed(2)}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="block text-zinc-600 font-sans">Цена / кг</span>
                                    <span className="text-emerald-400 font-semibold">
                                      ${ing.costPerKgUsd.toFixed(2)}
                                    </span>
                                  </div>
                                </div>
                              </div>
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

          {/* Quick instructions/Status at bottom */}
          <div className="mt-4 pt-3 border-t border-zinc-900 text-[9px] text-zinc-500 leading-normal flex items-start gap-1.5">
            <ShieldAlert size={12} className="shrink-0 mt-0.5 text-zinc-600" />
            <span>
              Для добавления также можно просто кликнуть по карточке свободного ингредиента.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
