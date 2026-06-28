"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, update } = useSession();
  const token = searchParams.get("token");
  const isDev = process.env.NODE_ENV !== "production";
  const [status, setStatus] = useState<"loading" | "success" | "error" | "pending">(
    token ? "loading" : "pending"
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [devMessage, setDevMessage] = useState("");

  useEffect(() => {
    if (token) {
      fetch(`/api/auth/verify-email?token=${token}`)
        .then(async (res) => {
          const data = await res.json();
          if (res.ok && data.success) {
            setStatus("success");
            // Force refresh next-auth session to update emailVerified state
            await update({ emailVerified: true });
            setTimeout(() => {
              router.push("/projects");
            }, 3000);
          } else {
            setStatus("error");
            setErrorMessage(data.error || "Не удалось верифицировать email.");
          }
        })
        .catch((err) => {
          setStatus("error");
          setErrorMessage("Произошла ошибка при отправке запроса.");
        });
    }
  }, [token, router, update]);

  const handleDevBypass = async () => {
    if (!session?.user?.email) {
      setDevMessage("Пожалуйста, войдите в аккаунт сначала.");
      return;
    }
    try {
      const res = await fetch("/api/auth/verify-email/dev-bypass", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: session.user.email }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setDevMessage("Успешно! Email подтвержден в БД.");
        await update({ emailVerified: true });
        setTimeout(() => {
          router.push("/projects");
        }, 1500);
      } else {
        setDevMessage(data.error || "Ошибка эмуляции.");
      }
    } catch {
      setDevMessage("Сетевая ошибка при эмуляции.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white font-sans relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />

      {/* Main card */}
      <div className="w-full max-w-md p-8 rounded-2xl bg-zinc-900/60 border border-zinc-800 backdrop-blur-xl shadow-2xl relative z-10 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight mb-2 bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent">
          PharmNode
        </h1>
        
        {status === "pending" && !token && (
          <div className="space-y-6 mt-6">
            <div className="w-16 h-16 bg-zinc-800/80 rounded-full flex items-center justify-center mx-auto border border-zinc-700">
              <svg className="w-8 h-8 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-zinc-100">Подтвердите ваш email</h2>
              <p className="text-zinc-400 text-sm mt-2">
                Мы отправили ссылку для подтверждения на ваш почтовый ящик. Пожалуйста, перейдите по ней, чтобы активировать аккаунт.
              </p>
            </div>
            <div className="pt-2 text-xs text-zinc-500">
              После подтверждения обновите эту страницу или войдите заново.
            </div>
          </div>
        )}

        {status === "loading" && (
          <div className="space-y-6 mt-6">
            <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-400 rounded-full animate-spin mx-auto" />
            <div>
              <h2 className="text-xl font-semibold text-zinc-200">Подтверждаем ваш email...</h2>
              <p className="text-zinc-500 text-sm mt-1">Пожалуйста, подождите, мы проверяем ваш токен.</p>
            </div>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-6 mt-6">
            <div className="w-16 h-16 bg-emerald-950/60 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
              <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-emerald-400 animate-pulse">Email успешно подтвержден!</h2>
              <p className="text-zinc-400 text-sm mt-2">
                Сейчас вы будете автоматически перенаправлены на панель управления проектами...
              </p>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-6 mt-6">
            <div className="w-16 h-16 bg-rose-950/60 rounded-full flex items-center justify-center mx-auto border border-rose-500/30">
              <svg className="w-8 h-8 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-rose-400">Ошибка подтверждения</h2>
              <p className="text-zinc-400 text-sm mt-2">{errorMessage}</p>
            </div>
            <button
              onClick={() => setStatus("pending")}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium rounded-lg transition"
            >
              Вернуться назад
            </button>
          </div>
        )}

        {/* Developer Bypass UI */}
        {isDev && (
          <div className="mt-8 pt-6 border-t border-zinc-800 text-left">
            <div className="text-xs text-amber-400 font-bold mb-2 uppercase tracking-widest">
              Dev Mode Bypass
            </div>
            <p className="text-xs text-zinc-500 mb-3">
              Для тестирования без SMTP кликните ниже, чтобы мгновенно подтвердить email текущего аккаунта:
            </p>
            <button
              onClick={handleDevBypass}
              className="w-full py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-semibold rounded border border-amber-500/20 transition"
            >
              Подтвердить email локально
            </button>
            {devMessage && (
              <p className="text-xs text-amber-300 mt-2 text-center font-medium animate-pulse">{devMessage}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-black text-white font-sans">
        <div className="w-8 h-8 border-4 border-zinc-800 border-t-zinc-600 rounded-full animate-spin" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
