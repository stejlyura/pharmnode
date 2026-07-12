"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useTranslation } from "@/context/I18nContext";
import { Lock, ShieldAlert, ArrowRight, Loader2, ArrowLeft, Terminal } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

function LoginContent() {
  const { status, login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { locale } = useTranslation();
  const isRu = locale === "ru-RU";

  const callbackUrl = searchParams.get("callbackUrl") || "/projects";

  // Login form state (Only for local admin login)
  const [isAdminMode, setIsAdminMode] = useState(searchParams.get("admin") === "true");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Disclaimer Checkbox state
  const [disclaimerChecked, setDisclaimerChecked] = useState(false);

  // If already authenticated, redirect immediately
  useEffect(() => {
    if (status === "authenticated") {
      router.push(callbackUrl);
    }
  }, [status, callbackUrl, router]);

  // Handle admin credentials login
  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disclaimerChecked) {
      setError(isRu ? "Пожалуйста, примите регуляторный дисклеймер" : "Please accept the regulatory disclaimer");
      return;
    }
    if (!username.trim() || !password.trim()) {
      setError(isRu ? "Пожалуйста, заполните все поля" : "Please fill in all fields");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn("credentials", {
        username: username.trim(),
        password: password.trim(),
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        setError(isRu ? "Неверные учетные данные администратора" : "Invalid administrator credentials");
        setIsLoading(false);
      } else {
        router.push(callbackUrl);
      }
    } catch {
      setError(isRu ? "Произошла ошибка при авторизации" : "An error occurred during authentication");
      setIsLoading(false);
    }
  };

  // Handle mock logins (only in dev/sandbox)
  const handleMockLogin = async (provider: "mock-google" | "mock-github") => {
    if (!disclaimerChecked) {
      setError(isRu ? "Пожалуйста, примите регуляторный дисклеймер" : "Please accept the regulatory disclaimer");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await login(provider);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed mock login";
      setError(msg);
      setIsLoading(false);
    }
  };

  // Handle real OAuth logins
  const handleRealOAuthLogin = async (provider: "google" | "github" | "azure-ad" | "facebook" | "linkedin") => {
    if (!disclaimerChecked) {
      setError(isRu ? "Пожалуйста, примите регуляторный дисклеймер" : "Please accept the regulatory disclaimer");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await signIn(provider, { callbackUrl });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "OAuth login error";
      setError(msg);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans theme-element relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute inset-0 bg-[radial-gradient(var(--grid-dot)_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none opacity-20" />
      <div className="absolute top-0 inset-x-0 h-[400px] bg-gradient-to-b from-[#05e69f]/5 via-purple-500/0 to-transparent pointer-events-none" />

      {/* Header */}
      <header className="h-16 border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#05e69f] to-[#005eb8] flex items-center justify-center font-bold text-black text-sm shadow-[0_0_15px_rgba(5,230,159,0.2)]">
            PN
          </div>
          <div>
            <span className="text-sm font-bold text-zinc-100 uppercase tracking-wider block">PharmNode</span>
            <span className="text-[9px] text-zinc-500 block leading-none">B2B SaaS Portal</span>
          </div>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6 md:p-12 relative z-10">
        <div className="w-full max-w-md bg-zinc-900/40 border border-zinc-800/80 rounded-2xl backdrop-blur-xl p-6 md:p-8 shadow-2xl relative overflow-hidden theme-element shadow-[#05e69f]/5">
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#05e69f]/20 to-transparent" />

          {/* Icon Badge */}
          <div className="mx-auto w-12 h-12 rounded-xl bg-[#05e69f]/10 border border-[#05e69f]/20 flex items-center justify-center text-[#05e69f] mb-6 shadow-inner">
            <Lock size={20} className="animate-pulse" />
          </div>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 via-zinc-200 to-emerald-350">
              {isAdminMode
                ? (isRu ? "Вход администратора" : "Administrator Login")
                : (isRu ? "Авторизация в системе" : "System Authorization")}
            </h1>
            <p className="text-xs text-zinc-400 mt-2">
              {isAdminMode
                ? (isRu ? "Локальный доступ разработчика" : "Local developer credentials access")
                : (isRu ? "Войдите в свой аккаунт для моделирования рецептур" : "Sign in to access your formulation recipes")}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-400 flex items-start gap-2 animate-shake" data-testid="login-error">
              <ShieldAlert size={14} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Disclaimer Checkbox */}
          <div className="mb-6 p-3.5 bg-zinc-950/40 border border-zinc-850 rounded-xl flex items-start gap-3">
            <input
              type="checkbox"
              id="disclaimer-checkbox"
              checked={disclaimerChecked}
              onChange={(e) => setDisclaimerChecked(e.target.checked)}
              className="mt-0.5 w-4 h-4 text-[#05e69f] accent-[#05e69f] bg-zinc-900 border-zinc-800 rounded focus:ring-[#05e69f] cursor-pointer"
            />
            <label htmlFor="disclaimer-checkbox" className="text-[10px] text-zinc-400 leading-relaxed select-none cursor-pointer">
              {isRu ? (
                <>
                  Я соглашаюсь с дисклеймером: <span className="text-zinc-500 italic">Алгоритмы и расчеты платформы носят вычислительный характер и не заменяют лабораторные испытания. Платформа не несет юридической ответственности за произведенные физические партии.</span>
                </>
              ) : (
                <>
                  I accept the regulatory disclaimer: <span className="text-zinc-500 italic">The platform&apos;s calculations are computational and do not replace laboratory testing. The platform bears no legal liability for physical batches produced.</span>
                </>
              )}
            </label>
          </div>

          {isAdminMode ? (
            /* Admin Credentials Form */
            <form onSubmit={handleAdminSubmit} className="flex flex-col gap-4" data-testid="admin-form">
              <div>
                <label className="block text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-1.5">
                  {isRu ? "Имя администратора" : "Admin Username"}
                </label>
                <div className="relative">
                  <Terminal className="absolute left-3 top-2.5 text-zinc-500" size={14} />
                  <input
                    type="text"
                    required
                    placeholder="admin"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-zinc-950/60 border border-zinc-800 hover:border-zinc-700 focus:border-[#05e69f] rounded-lg text-xs font-medium focus:outline-none transition-all placeholder-zinc-700 text-zinc-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-1.5">
                  {isRu ? "Пароль" : "Password"}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 text-zinc-500" size={14} />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-zinc-950/60 border border-zinc-800 hover:border-zinc-700 focus:border-[#05e69f] rounded-lg text-xs font-medium focus:outline-none transition-all placeholder-zinc-700 text-zinc-100"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-2.5 bg-[#05e69f] text-black hover:bg-[#04c78a] rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin text-black" size={14} />
                ) : (
                  <>
                    {isRu ? "Войти как администратор" : "Sign In as Admin"}
                    <ArrowRight size={12} />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsAdminMode(false);
                  setError(null);
                }}
                className="mt-2 py-2 text-zinc-500 hover:text-zinc-350 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-all border-none bg-transparent"
              >
                <ArrowLeft size={11} />
                {isRu ? "Вернуться к OAuth входу" : "Back to OAuth Login"}
              </button>
            </form>
          ) : (
            /* Regular User OAuth Login Buttons */
            <div className="flex flex-col gap-2.5" data-testid="oauth-container">
              <button
                onClick={() => handleRealOAuthLogin("google")}
                disabled={isLoading}
                className="w-full py-3 bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 hover:border-zinc-700 rounded-xl text-xs font-bold text-zinc-200 hover:text-zinc-100 transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                </svg>
                {isRu ? "Войти через Google" : "Continue with Google"}
              </button>

              <button
                onClick={() => handleRealOAuthLogin("github")}
                disabled={isLoading}
                className="w-full py-3 bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 hover:border-zinc-700 rounded-xl text-xs font-bold text-zinc-200 hover:text-zinc-100 transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.577.688.479C19.138 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                </svg>
                {isRu ? "Войти через GitHub" : "Continue with GitHub"}
              </button>



              <button
                onClick={() => handleRealOAuthLogin("azure-ad")}
                disabled={isLoading}
                className="w-full py-3 bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 hover:border-zinc-700 rounded-xl text-xs font-bold text-zinc-200 hover:text-zinc-100 transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 23 23" fill="currentColor">
                  <path fill="#f25022" d="M1 1h10v10H1z" />
                  <path fill="#7fba00" d="M12 1h10v10H12z" />
                  <path fill="#00a4ef" d="M1 12h10v10H1z" />
                  <path fill="#ffb900" d="M12 12h10v10H12z" />
                </svg>
                {isRu ? "Войти через Outlook" : "Continue with Outlook"}
              </button>

              <button
                onClick={() => handleRealOAuthLogin("facebook")}
                disabled={isLoading}
                className="w-full py-3 bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 hover:border-zinc-700 rounded-xl text-xs font-bold text-zinc-200 hover:text-zinc-100 transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" fill="#1877F2"/>
                </svg>
                {isRu ? "Войти через Facebook" : "Continue with Facebook"}
              </button>

              <button
                onClick={() => handleRealOAuthLogin("linkedin")}
                disabled={isLoading}
                className="w-full py-3 bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 hover:border-zinc-700 rounded-xl text-xs font-bold text-zinc-200 hover:text-zinc-100 transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" fill="#0077B5"/>
                </svg>
                {isRu ? "Войти через LinkedIn" : "Continue with LinkedIn"}
              </button>

              {/* Mock Demo Sandboxes — hidden in production */}
              {process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT !== "production" && process.env.NODE_ENV !== "production" && (
                <div className="border-t border-zinc-850 pt-5 mt-2" data-testid="mock-sandboxes">
                  <span className="block text-[9px] text-zinc-500 font-bold uppercase tracking-wider mb-3 text-center">
                    {isRu ? "Песочница для тестирования (Демо)" : "Testing Sandbox (Demo)"}
                  </span>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleMockLogin("mock-google")}
                      disabled={isLoading}
                      className="w-full py-2 bg-zinc-950/40 border border-zinc-900 hover:bg-zinc-900 hover:border-zinc-800 text-zinc-400 hover:text-zinc-300 rounded-lg text-[10px] font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {isRu ? "Войти как Google Mock (Hobby)" : "Enter as Google Mock (Hobby)"}
                    </button>
                    <button
                      onClick={() => handleMockLogin("mock-github")}
                      disabled={isLoading}
                      className="w-full py-2 bg-zinc-950/40 border border-zinc-900 hover:bg-zinc-900 hover:border-zinc-800 text-zinc-400 hover:text-zinc-300 rounded-lg text-[10px] font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {isRu ? "Войти как GitHub Mock (Pro)" : "Enter as GitHub Mock (Pro)"}
                    </button>
                  </div>
                </div>
              )}

              {/* Admin Portal Bypass Link */}
              <div className="border-t border-zinc-850/80 pt-4 mt-2 text-center">
                <button
                  type="button"
                  onClick={() => setIsAdminMode(true)}
                  className="text-[10px] text-zinc-500 hover:text-zinc-450 tracking-wider font-semibold uppercase hover:underline transition-all cursor-pointer border-none bg-transparent"
                >
                  {isRu ? "Панель администратора" : "Administrator Portal"}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-[#05e69f] theme-element">
        <Loader2 className="animate-spin mb-4 text-[#05e69f]" size={48} />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
