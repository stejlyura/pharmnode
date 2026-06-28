"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "@/context/I18nContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Beaker, Lock, User, Mail, ShieldAlert, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";

function LoginContent() {
  const { status, login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { locale, setLocale } = useTranslation();
  const isRu = locale === "ru-RU";

  const callbackUrl = searchParams.get("callbackUrl") || "/projects";

  // Login form state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Register form state
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");

  // 2FA state
  const [is2FaStep, setIs2FaStep] = useState(false);
  const [totpCode, setTotpCode] = useState("");

  // Disclaimer Checkbox state
  const [disclaimerChecked, setDisclaimerChecked] = useState(false);

  // If already authenticated, redirect immediately
  useEffect(() => {
    if (status === "authenticated") {
      router.push(callbackUrl);
    }
  }, [status, callbackUrl, router]);

  // Handle credentials login
  const handleCredentialsSubmit = async (e: React.FormEvent) => {
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
      // Step 1: Check admin credentials and 2FA status
      const checkRes = await fetch("/api/auth/2fa/verify-credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password: password.trim() }),
      });

      if (!checkRes.ok) {
        setError(isRu ? "Неверное имя пользователя или пароль" : "Invalid username or password");
        setIsLoading(false);
        return;
      }

      const checkData = await checkRes.json();
      if (checkData.twoFactorEnabled) {
        setIs2FaStep(true);
        setIsLoading(false);
      } else {
        // Direct login
        const result = await signIn("credentials", {
          username: username.trim(),
          password: password.trim(),
          redirect: false,
          callbackUrl,
        });

        if (result?.error) {
          setError(isRu ? "Неверное имя пользователя или пароль" : "Invalid username or password");
          setIsLoading(false);
        } else {
          router.push(callbackUrl);
        }
      }
    } catch {
      setError(isRu ? "Произошла ошибка при авторизации" : "An error occurred during authentication");
      setIsLoading(false);
    }
  };

  const handleTotpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!totpCode.trim() || totpCode.length !== 6) {
      setError(isRu ? "Пожалуйста, введите корректный 6-значный код" : "Please enter a valid 6-digit code");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn("credentials", {
        username: username.trim(),
        password: password.trim(),
        totpCode: totpCode.trim(),
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        setError(isRu ? "Неверный код 2FA" : "Invalid 2FA code");
        setIsLoading(false);
      } else {
        router.push(callbackUrl);
      }
    } catch {
      setError(isRu ? "Произошла ошибка при валидации 2FA" : "An error occurred during 2FA verification");
      setIsLoading(false);
    }
  };

  // Handle registration
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disclaimerChecked) {
      setError(isRu ? "Пожалуйста, примите регуляторный дисклеймер" : "Please accept the regulatory disclaimer");
      return;
    }
    if (!regName.trim() || !regEmail.trim() || !regPassword.trim()) {
      setError(isRu ? "Пожалуйста, заполните все поля" : "Please fill in all fields");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: regName.trim(),
          email: regEmail.trim(),
          password: regPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      // Automatically sign in the user
      const result = await signIn("credentials", {
        username: regEmail.trim(),
        password: regPassword,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        setError(isRu ? "Учетная запись создана, но автоматический вход не удался" : "Account created, but automatic sign in failed");
        setIsLoading(false);
      } else {
        router.push(callbackUrl);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create account";
      setError(msg);
      setIsLoading(false);
    }
  };

  // Handle mock logins
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
  const handleRealOAuthLogin = async (provider: "google" | "github") => {
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

  if (status === "loading" || (status === "authenticated" && isLoading)) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-indigo-500 theme-element">
        <Loader2 className="animate-spin mb-4" size={48} />
        <span className="text-sm text-zinc-400 font-mono tracking-widest uppercase">
          {isRu ? "Проверка сессии..." : "Verifying session..."}
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans theme-element relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute inset-0 bg-[radial-gradient(var(--grid-dot)_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none opacity-30" />
      <div className="absolute top-0 inset-x-0 h-[400px] bg-gradient-to-b from-indigo-500/5 via-purple-500/0 to-transparent pointer-events-none" />

      {/* Header */}
      <header className="h-16 border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-sm shadow-[0_0_15px_rgba(99,102,241,0.2)]">
            PN
          </div>
          <div>
            <span className="text-sm font-bold text-zinc-100 uppercase tracking-wider block">PharmNode</span>
            <span className="text-[9px] text-zinc-500 block leading-none">Security Portal</span>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setLocale(locale === "ru-RU" ? "en-US" : "ru-RU")}
            className="px-2.5 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 text-xs font-bold text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer theme-element"
          >
            {isRu ? "RU" : "EN"}
          </button>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6 md:p-12 relative z-10">
        <div className="w-full max-w-md bg-zinc-900/50 border border-zinc-800/80 rounded-2xl backdrop-blur-md p-6 md:p-8 shadow-2xl relative overflow-hidden theme-element">
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />

          {/* Icon Badge */}
          <div className="mx-auto w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-6 shadow-inner">
            <Lock size={20} className="animate-pulse" />
          </div>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 via-zinc-200 to-indigo-400">
              {isRu ? "Авторизация в системе" : "System Authorization"}
            </h1>
            <p className="text-xs text-zinc-400 mt-2">
              {isRu ? "Получите доступ к облачному моделированию рецептур" : "Access virtual formulation simulation tools"}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-400 flex items-start gap-2 animate-shake">
              <ShieldAlert size={14} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Tabs Selector */}
          {!is2FaStep && (
            <div className="flex bg-zinc-950/60 p-1 rounded-xl border border-zinc-850 mb-6">
              <button
                type="button"
                onClick={() => {
                  setIsRegisterMode(false);
                  setError(null);
                }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  !isRegisterMode
                    ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/10"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {isRu ? "Вход" : "Sign In"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsRegisterMode(true);
                  setError(null);
                }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  isRegisterMode
                    ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/10"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {isRu ? "Создать аккаунт" : "Create Account"}
              </button>
            </div>
          )}

          {/* Disclaimer Checkbox */}
          {!is2FaStep && (
            <div className="mb-6 p-3.5 bg-zinc-950/40 border border-zinc-850 rounded-xl flex items-start gap-3">
              <input
                type="checkbox"
                id="disclaimer-checkbox"
                checked={disclaimerChecked}
                onChange={(e) => setDisclaimerChecked(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-indigo-500 accent-indigo-500 bg-zinc-900 border-zinc-800 rounded focus:ring-indigo-500 cursor-pointer"
              />
              <label htmlFor="disclaimer-checkbox" className="text-[10px] text-zinc-405 leading-relaxed select-none cursor-pointer">
                {isRu ? (
                  <>
                    Я соглашаюсь с дисклеймером: <span className="text-zinc-500 italic">Алгоритмы и расчеты платформы носят вычислительный характер и не заменяют сертифицированные лабораторные испытания. Платформа не несет юридической ответственности за произведенные физические партии.</span>
                  </>
                ) : (
                  <>
                    I accept the regulatory disclaimer: <span className="text-zinc-500 italic">The platform&apos;s algorithms and calculations are computational in nature and do not replace certified laboratory testing. The platform bears no legal liability for physical batches produced.</span>
                  </>
                )}
              </label>
            </div>
          )}

          {/* Forms */}
          {is2FaStep ? (
            <form onSubmit={handleTotpSubmit} className="flex flex-col gap-4 mb-6">
              <div>
                <label className="block text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1.5 text-center">
                  {isRu ? "Введите 6-значный код 2FA" : "Enter 6-digit 2FA Code"}
                </label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="000000"
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ""))}
                  className="w-full text-center tracking-widest text-lg font-bold py-2.5 bg-zinc-950/60 border border-zinc-850 focus:border-indigo-500 rounded-lg focus:outline-none transition-all placeholder-zinc-800"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || totpCode.length !== 6}
                className="w-full mt-2 py-2.5 bg-indigo-500 hover:bg-indigo-650 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={14} />
                ) : (
                  <>
                    {isRu ? "Подтвердить код 2FA" : "Confirm 2FA Code"}
                    <ArrowRight size={12} />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setIs2FaStep(false)}
                className="text-[10px] text-zinc-500 hover:text-zinc-400 text-center uppercase tracking-wider font-semibold cursor-pointer"
              >
                {isRu ? "Назад к логину" : "Back to login"}
              </button>
            </form>
          ) : isRegisterMode ? (
            <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-4 mb-6">
              <div>
                <label className="block text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-1.5">
                  {isRu ? "Ваше имя" : "Your Name"}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 text-zinc-600" size={14} />
                  <input
                    type="text"
                    required
                    placeholder={isRu ? "Александр Флеминг" : "Alexander Fleming"}
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-zinc-950/60 border border-zinc-850 hover:border-zinc-805 focus:border-indigo-500 rounded-lg text-xs font-medium focus:outline-none transition-all placeholder-zinc-700 text-zinc-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 text-zinc-600" size={14} />
                  <input
                    type="email"
                    required
                    placeholder="dev@pharmnode.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-zinc-950/60 border border-zinc-850 hover:border-zinc-805 focus:border-indigo-500 rounded-lg text-xs font-medium focus:outline-none transition-all placeholder-zinc-700 text-zinc-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-1.5">
                  {isRu ? "Пароль" : "Password"}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 text-zinc-650" size={14} />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-zinc-950/60 border border-zinc-850 hover:border-zinc-805 focus:border-indigo-500 rounded-lg text-xs font-medium focus:outline-none transition-all placeholder-zinc-700 text-zinc-100"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-2.5 bg-indigo-500 hover:bg-indigo-650 text-white rounded-lg text-xs font-bold shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/25 transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={14} />
                ) : (
                  <>
                    {isRu ? "Создать аккаунт и войти" : "Create Account & Sign In"}
                    <ArrowRight size={12} />
                  </>
                )}
              </button>
            </form>
          ) : (
            <>
              <form onSubmit={handleCredentialsSubmit} className="flex flex-col gap-4 mb-6">
                <div>
                  <label className="block text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1.5">
                    {isRu ? "Имя пользователя" : "Username"}
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 text-zinc-650" size={14} />
                    <input
                      type="text"
                      placeholder="admin"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-zinc-950/60 border border-zinc-850 hover:border-zinc-800 focus:border-indigo-500 rounded-lg text-xs font-medium focus:outline-none transition-all placeholder-zinc-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1.5">
                    {isRu ? "Пароль" : "Password"}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 text-zinc-650" size={14} />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-zinc-950/60 border border-zinc-850 hover:border-zinc-800 focus:border-indigo-500 rounded-lg text-xs font-medium focus:outline-none transition-all placeholder-zinc-700"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-2.5 bg-indigo-500 hover:bg-indigo-650 text-white rounded-lg text-xs font-bold shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/25 transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin" size={14} />
                  ) : (
                    <>
                      {isRu ? "Войти с паролем" : "Sign In with Password"}
                      <ArrowRight size={12} />
                    </>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex-1 h-[1px] bg-zinc-850" />
                <span className="text-[9px] text-zinc-600 uppercase font-bold tracking-widest shrink-0">
                  {isRu ? "или войти через" : "or connect via"}
                </span>
                <div className="flex-1 h-[1px] bg-zinc-850" />
              </div>

              {/* Social Logins */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                  onClick={() => handleRealOAuthLogin("google")}
                  disabled={isLoading}
                  className="py-2.5 bg-zinc-900 border border-zinc-850 hover:bg-zinc-850 rounded-xl text-xs font-bold text-zinc-300 hover:text-zinc-100 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <span className="w-3.5 h-3.5 rounded bg-red-500/10 text-red-400 text-[9px] font-bold flex items-center justify-center">G</span>
                  Google
                </button>
                <button
                  onClick={() => handleRealOAuthLogin("github")}
                  disabled={isLoading}
                  className="py-2.5 bg-zinc-900 border border-zinc-850 hover:bg-zinc-850 rounded-xl text-xs font-bold text-zinc-300 hover:text-zinc-100 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <span className="w-3.5 h-3.5 rounded bg-indigo-500/10 text-indigo-400 text-[9px] font-bold flex items-center justify-center">Git</span>
                  GitHub
                </button>
              </div>

              {/* Mock Demo Sandboxes — hidden in production */}
              {process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT !== "production" && process.env.NODE_ENV !== "production" && (
                <div className="border-t border-zinc-850 pt-5 mt-2">
                  <span className="block text-[9px] text-zinc-500 font-bold uppercase tracking-wider mb-3 text-center">
                    {isRu ? "Песочница для тестирования (Демо)" : "Testing Sandbox (Demo)"}
                  </span>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleMockLogin("mock-google")}
                      disabled={isLoading}
                      className="w-full py-2 bg-zinc-950/40 border border-zinc-900 hover:bg-zinc-900 hover:border-zinc-800 text-zinc-400 hover:text-zinc-300 rounded-lg text-[10px] font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Beaker size={11} className="text-zinc-500" />
                      {isRu ? "Войти как Google Mock (Hobby)" : "Enter as Google Mock (Hobby)"}
                    </button>
                    <button
                      onClick={() => handleMockLogin("mock-github")}
                      disabled={isLoading}
                      className="w-full py-2 bg-zinc-950/40 border border-zinc-900 hover:bg-zinc-900 hover:border-zinc-800 text-zinc-400 hover:text-zinc-300 rounded-lg text-[10px] font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Beaker size={11} className="text-zinc-500 animate-pulse" />
                      {isRu ? "Войти как GitHub Mock (Pro)" : "Enter as GitHub Mock (Pro)"}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-indigo-500 theme-element">
        <Loader2 className="animate-spin mb-4" size={48} />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
