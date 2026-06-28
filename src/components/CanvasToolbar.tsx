"use client";

import React from 'react';
import { useTranslation } from '../context/I18nContext';

interface CanvasToolbarProps {
  scale: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
}

export const CanvasToolbar: React.FC<CanvasToolbarProps> = ({
  scale,
  onZoomIn,
  onZoomOut,
  onZoomReset
}) => {
  const { t } = useTranslation();

  return (
    <div className="absolute bottom-6 right-6 z-40 flex items-center bg-zinc-900/90 backdrop-blur-md border border-zinc-800 rounded-xl p-1 shadow-2xl gap-1.5 theme-element">
      <button
        onClick={onZoomOut}
        className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200 transition-colors text-sm font-bold cursor-pointer"
        title={t('canvas_zoom_out') || 'Zoom Out'}
      >
        －
      </button>
      <span
        onClick={onZoomReset}
        className="px-2 text-[10px] font-bold text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer select-none font-mono min-w-[36px] text-center"
        title={t('canvas_zoom_reset') || 'Reset Zoom'}
      >
        {Math.round(scale * 100)}%
      </span>
      <button
        onClick={onZoomIn}
        className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200 transition-colors text-sm font-bold cursor-pointer"
        title={t('canvas_zoom_in') || 'Zoom In'}
      >
        ＋
      </button>
    </div>
  );
};
