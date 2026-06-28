import React from 'react';

export default function ConfiguratorLoading() {
  return (
    <div className="h-screen w-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans theme-element relative overflow-hidden select-none">
      {/* Top Header Placeholder */}
      <header className="h-14 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md px-4 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-zinc-900 animate-pulse border border-zinc-800 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-emerald-500/40" />
          </div>
          <div className="h-4 w-28 bg-zinc-900 rounded animate-pulse" />
        </div>
        <div className="hidden md:flex items-center gap-2">
          <div className="h-8 w-24 bg-zinc-900 rounded-lg animate-pulse border border-zinc-800/50" />
          <div className="h-8 w-24 bg-zinc-900 rounded-lg animate-pulse border border-zinc-800/50" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-8 w-20 bg-zinc-900 rounded-lg animate-pulse border border-zinc-800/50" />
          <div className="w-8 h-8 rounded-full bg-zinc-900 animate-pulse border border-zinc-800" />
        </div>
      </header>

      {/* Main Layout Area */}
      <div className="flex flex-1 h-[calc(100vh-3.5rem)] overflow-hidden">
        {/* Left Sidebar Skeleton */}
        <aside className="w-80 border-r border-zinc-800/80 bg-zinc-950 flex flex-col shrink-0 z-10">
          <div className="p-4 border-b border-zinc-800/50 flex flex-col gap-3">
            {/* Search placeholder */}
            <div className="h-9 bg-zinc-900 border border-zinc-850 rounded-lg animate-pulse" />
            {/* Category tabs placeholder */}
            <div className="flex gap-1 bg-zinc-900 p-0.5 rounded-lg border border-zinc-850">
              <div className="flex-1 h-6 bg-zinc-800/30 rounded" />
              <div className="flex-1 h-6 rounded" />
              <div className="flex-1 h-6 rounded" />
            </div>
          </div>

          {/* List of Ingredients */}
          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="p-2.5 rounded-lg border border-zinc-900/60 bg-zinc-900/10 flex items-center justify-between gap-3 animate-pulse"
                style={{ animationDelay: `${i * 150}ms` }}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded bg-zinc-900 border border-zinc-800/50 flex items-center justify-center">
                    <div className="w-2.5 h-2.5 rounded-sm bg-zinc-800" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <div className="h-3 w-28 bg-zinc-900 rounded" />
                    <div className="h-2 w-16 bg-zinc-900 rounded" />
                  </div>
                </div>
                <div className="w-4 h-4 bg-zinc-900 rounded-sm" />
              </div>
            ))}
          </div>
        </aside>

        {/* Right Canvas Area Skeleton */}
        <main className="flex-1 bg-zinc-950 relative overflow-hidden select-none">
          {/* Background grid dot pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(var(--grid-dot)_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none opacity-30" />

          {/* Pulsing Node Cards */}
          {/* Node 1: Ingredient (left-12 top-16) */}
          <div className="absolute left-12 top-16 w-[280px] h-[265px] rounded-xl border border-zinc-800/60 bg-zinc-900/20 backdrop-blur-md flex flex-col p-4 gap-3 animate-pulse">
            <div className="flex items-center justify-between border-b border-zinc-800/50 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-emerald-500/20" />
                <div className="h-3.5 w-24 bg-zinc-900 rounded" />
              </div>
              <div className="w-4 h-4 bg-zinc-900 rounded" />
            </div>
            <div className="flex-1 flex flex-col gap-3">
              <div className="h-9 bg-zinc-900/60 rounded border border-zinc-850" />
              <div className="h-8 bg-zinc-900/40 rounded border border-zinc-850" />
              <div className="h-10 bg-zinc-900/40 rounded border border-zinc-850" />
            </div>
            {/* Output port mock */}
            <div className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/40" />
            </div>
          </div>

          {/* Connection line mock (SVG path) */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
            <path
              d="M 304 148 C 364 148, 364 280, 424 280"
              fill="none"
              stroke="url(#grad)"
              strokeWidth="2"
              className="animate-pulse"
            />
            <defs>
              <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#05e69f" />
                <stop offset="100%" stopColor="#4f46e5" />
              </linearGradient>
            </defs>
          </svg>

          {/* Node 2: Blending (left-[424px] top-32) */}
          <div className="absolute left-[424px] top-32 w-[280px] h-[360px] rounded-xl border border-zinc-800/60 bg-zinc-900/20 backdrop-blur-md flex flex-col p-4 gap-3 animate-pulse" style={{ animationDelay: '300ms' }}>
            <div className="flex items-center justify-between border-b border-zinc-800/50 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-indigo-500/20" />
                <div className="h-3.5 w-24 bg-zinc-900 rounded" />
              </div>
              <div className="w-4 h-4 bg-zinc-900 rounded" />
            </div>
            <div className="flex-1 flex flex-col gap-3.5">
              <div className="h-12 bg-zinc-900/60 rounded border border-zinc-850" />
              <div className="h-20 bg-zinc-900/40 rounded border border-zinc-850" />
              <div className="h-10 bg-zinc-900/40 rounded border border-zinc-850" />
            </div>
            {/* Input port mock */}
            <div className="absolute left-[-6px] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/40" />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
