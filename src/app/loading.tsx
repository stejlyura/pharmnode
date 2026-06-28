import React from 'react';

export default function RootLoading() {
  return (
    <div className="fixed inset-0 bg-zinc-950 flex flex-col items-center justify-center gap-4 z-50">
      <div className="relative w-16 h-16 flex items-center justify-center">
        {/* Pulsing ring */}
        <div className="absolute inset-0 rounded-full border-2 border-emerald-500/25 animate-ping" />
        {/* Rotating ring */}
        <div className="absolute inset-0 rounded-full border-2 border-t-emerald-400 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
        {/* Core dot */}
        <div className="w-4 h-4 rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(5,230,159,0.5)]" />
      </div>
      <div className="flex flex-col items-center gap-1">
        <span className="text-sm font-bold tracking-wider text-zinc-200 uppercase font-sans">
          PharmNode
        </span>
        <span className="text-[10px] text-zinc-550 uppercase tracking-widest font-mono">
          Loading resources...
        </span>
      </div>
    </div>
  );
}
