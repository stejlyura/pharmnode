"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

function LogoutContent() {
  const router = useRouter();
  const { status } = useSession();
  const [isSigningOut, setIsSigningOut] = useState(false);

  // If already unauthenticated, redirect to login immediately
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const handleConfirmSignOut = async () => {
    setIsSigningOut(true);
    await signOut({ callbackUrl: "/" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white font-sans relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-rose-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-zinc-500/5 blur-[120px] pointer-events-none" />

      {/* Main card */}
      <div className="w-full max-w-md p-8 rounded-2xl bg-zinc-900/60 border border-zinc-800 backdrop-blur-xl shadow-2xl relative z-10 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight mb-2 bg-gradient-to-r from-rose-400 to-amber-200 bg-clip-text text-transparent">
          PharmNode
        </h1>
        
        <div className="space-y-6 mt-6">
          <div className="w-16 h-16 bg-rose-950/40 rounded-full flex items-center justify-center mx-auto border border-rose-500/20">
            <svg className="w-8 h-8 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-zinc-100">Выход из аккаунта</h2>
            <p className="text-zinc-405 text-sm mt-2">
              Вы действительно хотите выйти из своего аккаунта PharmNode?
            </p>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <button
              onClick={handleConfirmSignOut}
              disabled={isSigningOut}
              className="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-800/40 disabled:text-zinc-500 text-white font-medium rounded-lg transition disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSigningOut ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Выходим...
                </>
              ) : (
                "Выйти"
              )}
            </button>
            <button
              onClick={() => router.back()}
              disabled={isSigningOut}
              className="w-full py-2.5 px-4 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-zinc-300 font-medium rounded-lg transition"
            >
              Отмена
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LogoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-black text-white font-sans">
        <div className="w-8 h-8 border-4 border-zinc-800 border-t-zinc-600 rounded-full animate-spin" />
      </div>
    }>
      <LogoutContent />
    </Suspense>
  );
}
