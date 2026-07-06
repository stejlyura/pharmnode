"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from '../context/I18nContext';
import { Ingredient } from '../types/pharm';
import {
  Undo2,
  Redo2,
  Sparkles,
  Grid,
  Search,
  Plus,
  Trash2
} from 'lucide-react';

interface CanvasContextMenuProps {
  x: number;
  y: number;
  isOpen: boolean;
  onClose: () => void;
  onAddIngredient: (id: number | string) => void;
  remainingIngredients: Ingredient[];
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onOpenWizard?: () => void;
  onOpenMatrix?: () => void;
  onRemoveUnconnected?: () => void;
}

export const CanvasContextMenu: React.FC<CanvasContextMenuProps> = ({
  x,
  y,
  isOpen,
  onClose,
  onAddIngredient,
  remainingIngredients,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  onOpenWizard,
  onOpenMatrix,
  onRemoveUnconnected
}) => {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [showAddSubmenu, setShowAddSubmenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close context menu if clicked outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredIngredients = remainingIngredients
    .filter((ing) => t(ing.name).toLowerCase().includes(search.toLowerCase()))
    .slice(0, 5); // Limit to top 5 results for compactness

  return (
    <div
      ref={menuRef}
      className="fixed z-50 min-w-[220px] bg-zinc-950/95 backdrop-blur-md border border-zinc-800 rounded-xl shadow-2xl p-1.5 flex flex-col gap-1 theme-element text-xs"
      style={{ top: y, left: x }}
      onContextMenu={(e) => e.preventDefault()} // Prevent native menu on the custom menu itself
    >
      {/* Search / Quick Add Section */}
      <div className="px-2 py-1.5 border-b border-zinc-900 flex flex-col gap-1">
        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">
          {t('canvas_quick_add') || 'Quick Add Node'}
        </span>
        <div className="relative mt-1">
          <Search size={12} className="absolute left-2 top-2 text-zinc-500" />
          <input
            type="text"
            placeholder={t('sidebar_search_placeholder') || 'Search ingredients...'}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setShowAddSubmenu(true);
            }}
            className="w-full pl-7 pr-2.5 py-1.5 bg-zinc-900 border border-zinc-850 text-zinc-200 placeholder-zinc-600 rounded-lg text-[11px] focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>

      {/* Quick Add Ingredient List */}
      {showAddSubmenu || search ? (
        <div className="max-h-[160px] overflow-y-auto flex flex-col border-b border-zinc-900 pb-1 mb-1">
          {filteredIngredients.length > 0 ? (
            filteredIngredients.map((ing) => (
              <button
                key={ing.id}
                onClick={() => {
                  onAddIngredient(ing.id);
                  onClose();
                }}
                className="w-full text-left px-2.5 py-1.5 hover:bg-zinc-900 hover:text-indigo-400 text-zinc-300 rounded-lg flex items-center justify-between cursor-pointer transition-colors"
              >
                <span className="truncate">{t(ing.name)}</span>
                <Plus size={10} className="text-zinc-500" />
              </button>
            ))
          ) : (
            <span className="text-[10px] text-zinc-600 text-center py-2">
              {t('sidebar_no_ingredients') || 'No ingredients found'}
            </span>
          )}
        </div>
      ) : (
        <button
          onMouseEnter={() => setShowAddSubmenu(true)}
          className="w-full text-left px-2.5 py-1.5 hover:bg-zinc-900 hover:text-indigo-400 text-zinc-300 rounded-lg flex items-center justify-between cursor-pointer transition-colors"
        >
          <span>{t('header_components_panel') || 'Add Ingredient'}</span>
          <Plus size={12} className="text-zinc-500" />
        </button>
      )}

      {/* Undo / Redo controls */}
      <div className="flex gap-1.5 p-1 border-b border-zinc-900">
        <button
          onClick={() => {
            if (canUndo && onUndo) {
              onUndo();
              onClose();
            }
          }}
          disabled={!canUndo}
          className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors border ${
            canUndo
              ? 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 cursor-pointer'
              : 'border-transparent text-zinc-600 cursor-not-allowed'
          }`}
          title={t('header_undo')}
        >
          <Undo2 size={13} />
          <span>{t('header_undo') || 'Undo'}</span>
        </button>
        <button
          onClick={() => {
            if (canRedo && onRedo) {
              onRedo();
              onClose();
            }
          }}
          disabled={!canRedo}
          className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors border ${
            canRedo
              ? 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 cursor-pointer'
              : 'border-transparent text-zinc-600 cursor-not-allowed'
          }`}
          title={t('header_redo')}
        >
          <Redo2 size={13} />
          <span>{t('header_redo') || 'Redo'}</span>
        </button>
      </div>

      {/* Menu Options */}
      {onOpenMatrix && (
        <button
          onClick={() => {
            onOpenMatrix();
            onClose();
          }}
          className="w-full text-left px-2.5 py-1.5 hover:bg-zinc-900 hover:text-indigo-400 text-zinc-300 rounded-lg flex items-center gap-2 cursor-pointer transition-colors"
        >
          <Grid size={13} className="text-zinc-500" />
          <span>{t('header_compatibility_guide') || 'Compatibility Matrix'}</span>
        </button>
      )}

      {onOpenWizard && (
        <button
          onClick={() => {
            onOpenWizard();
            onClose();
          }}
          className="w-full text-left px-2.5 py-1.5 hover:bg-zinc-900 hover:text-indigo-400 text-zinc-300 rounded-lg flex items-center gap-2 cursor-pointer transition-colors"
        >
          <Sparkles size={13} className="text-indigo-400" />
          <span>{t('wizard_launch_btn') || 'Formulation Wizard'}</span>
        </button>
      )}

      {onRemoveUnconnected && (
        <button
          onClick={() => {
            onRemoveUnconnected();
            onClose();
          }}
          className="w-full text-left px-2.5 py-1.5 hover:bg-zinc-900 hover:text-red-400 text-zinc-300 rounded-lg flex items-center gap-2 cursor-pointer transition-colors group"
        >
          <Trash2 size={13} className="text-zinc-500 group-hover:text-red-400 transition-colors" />
          <span>{t('canvas_remove_unconnected') || 'Remove unconnected nodes'}</span>
        </button>
      )}
    </div>
  );
};
