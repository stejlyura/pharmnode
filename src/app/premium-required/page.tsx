"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "@/context/I18nContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Sparkles, Check, ArrowLeft } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

export default function PremiumRequiredPage() {
  const { user, changeTariff, isPolling, pollingStatus, startSubscriptionPolling } = useAuth();
  const router = useRouter();
  const { t, locale, setLocale } = useTranslation();
  const isRu = locale === "ru-RU";

  const [simulating, setSimulating] = React.useState(false);
  const [simError, setSimError] = React.useState("");

  const handleSimulateWebhook = async () => {
    if (!user?.id) return;
    setSimulating(true);
    setSimError("");
    
    // Start client polling immediately so UI changes to spinner
    startSubscriptionPolling();
    
    try {
      const res = await fetch("/api/dev/simulate-webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Webhook simulator endpoint failed");
      }
    } catch (err: unknown) {
      setSimError(err instanceof Error ? err.message : "Failed to trigger webhook simulation");
      console.error(err);
    } finally {
      setSimulating(false);
    }
  };

  React.useEffect(() => {
    if (user?.tariff === "professional") {
      router.push("/projects");
    }
  }, [user?.tariff, router]);

  const handleCheckout = () => {
    trackEvent('checkout_initiated', {
      tariff: 'professional',
      price: '$39',
      userId: user?.id
    });
    
    const paddle = (window as unknown as { Paddle?: { Checkout: { open: (options: Record<string, unknown>) => void } } }).Paddle;
    if (paddle) {
      paddle.Checkout.open({
        items: [
          {
            priceId: process.env.NEXT_PUBLIC_PADDLE_PRICE_ID || "pri_test_placeholder",
            quantity: 1
          }
        ],
        customer: {
          email: user?.email || "",
        },
        // Pass userId as customData so we get it in the webhook
        customData: {
          userId: user?.id || "",
        }
      });
    } else {
      console.error("Paddle SDK not loaded");
      
      // Fallback for mock users in local development if SDK is blocked or offline
      if (user?.id?.startsWith('mock-')) {
        changeTariff('professional');
        router.push('/projects');
      } else {
        alert(t('paddle_sdk_error') || "Payment gateway (Paddle) failed to load. If you are using an adblocker, please disable it and refresh the page.");
      }
    }
  };

  const features = [
    t("error_premium_feature_1") || "Unlimited ingredients on active canvas",
    t("error_premium_feature_2") || "Unlimited saved recipe records",
    t("error_premium_feature_3") || "Full PDF specification report export with GMP verification",
    t("error_premium_feature_4") || "Priority compliance check (FDA CFR Title 21)",
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans theme-element relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute inset-0 bg-[radial-gradient(var(--grid-dot)_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none opacity-30" />
      <div className="absolute top-0 inset-x-0 h-[400px] bg-gradient-to-b from-indigo-500/5 via-purple-500/0 to-transparent pointer-events-none" />

      {/* Simplified Header */}
      <header className="h-16 border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-sm shadow-[0_0_15px_rgba(99,102,241,0.2)]">
            PN
          </div>
          <div>
            <span className="text-sm font-bold text-zinc-100 uppercase tracking-wider block">PharmNode</span>
            <span className="text-[9px] text-zinc-500 block leading-none">Access Control</span>
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
      <main className="flex-1 flex items-center justify-center p-4 md:p-6 relative z-10">
        <div className="w-full max-w-lg bg-zinc-900/50 border border-zinc-850 rounded-2xl backdrop-blur-md p-6 md:p-8 shadow-2xl relative overflow-hidden theme-element">
          {/* Neon-teal glow indicator */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-teal-400 via-indigo-500 to-purple-600 rounded-t-2xl" />

          {isPolling ? (
            /* Polling/Loading UI */
            <div className="flex flex-col items-center text-center py-8">
              <div className="w-16 h-16 rounded-full border-4 border-indigo-500/10 border-t-indigo-505 animate-spin flex items-center justify-center mb-6">
                <Sparkles size={24} className="text-indigo-400 animate-pulse" />
              </div>
              <h3 className="text-lg font-bold text-zinc-100 mb-2">
                {isRu ? "Обработка платежа..." : "Processing payment..."}
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed max-w-xs mb-4">
                {isRu 
                  ? "Ожидаем подтверждения от платежной системы. Это займет несколько секунд." 
                  : "Waiting for confirmation from the payment system. This will take a few seconds."}
              </p>
              <div className="text-[10px] text-zinc-650 font-mono tracking-wider uppercase">
                PharmNode Transaction Secure Polling
              </div>
            </div>
          ) : pollingStatus === "timeout" ? (
            /* Timeout UI */
            <div className="flex flex-col items-center text-center py-6">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-5">
                <Sparkles size={24} className="animate-bounce" />
              </div>
              <h3 className="text-base font-bold text-amber-400 mb-3 uppercase tracking-wide">
                {isRu ? "Платёж обрабатывается" : "Payment processing"}
              </h3>
              <p className="text-xs text-zinc-300 leading-relaxed mb-6 bg-zinc-950/80 border border-zinc-850 p-4 rounded-xl">
                {isRu 
                  ? "Платёж обрабатывается. Обновите страницу через минуту или свяжитесь с поддержкой." 
                  : "Payment is being processed. Please refresh the page in a minute or contact support."}
              </p>
              <div className="flex flex-col gap-3 w-full">
                <button
                  onClick={() => startSubscriptionPolling()}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-black rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/10"
                >
                  {isRu ? "Проверить статус снова" : "Check status again"}
                </button>
                <Link
                  href="/projects"
                  className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft size={13} />
                  {t("error_premium_back") || "Back to Workspace"}
                </Link>

                {process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT !== "production" && process.env.NODE_ENV !== "production" && (
                  <div className="mt-4 pt-4 border-t border-dashed border-zinc-800 flex flex-col gap-2 w-full">
                    <button
                      onClick={handleSimulateWebhook}
                      disabled={simulating}
                      className="w-full py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-300 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {simulating 
                        ? (isRu ? "Симуляция..." : "Simulating...") 
                        : (isRu ? "Симулировать вебхук оплаты" : "Simulate Payment Webhook")}
                    </button>
                    {simError && (
                      <p className="text-[10px] text-rose-400 font-semibold mt-1">
                        {simError}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Standard Checkout UI */
            <>
              {/* Heading info */}
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4 shadow-[0_0_15px_rgba(99,102,241,0.15)] animate-pulse">
                  <Sparkles size={26} />
                </div>
                <h2 className="text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 via-zinc-200 to-indigo-300 uppercase tracking-wide">
                  {t("error_premium_title")}
                </h2>
                <p className="text-[11px] text-indigo-400 font-bold uppercase tracking-wider mt-1.5">
                  {t("error_premium_subtitle")}
                </p>
                <p className="text-xs text-zinc-400 mt-3 leading-relaxed max-w-sm">
                  {t("error_premium_desc")}
                </p>
              </div>

              {/* Feature details */}
              <div className="bg-zinc-950/80 border border-zinc-850 rounded-xl p-5 mb-6">
                <h4 className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-3 border-b border-zinc-900 pb-2">
                  {isRu ? "План Professional включает в себя:" : "Professional Plan features include:"}
                </h4>
                <ul className="flex flex-col gap-3">
                  {features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-zinc-300">
                      <Check size={14} className="text-teal-400 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleCheckout}
                  className="w-full py-3 bg-gradient-to-r from-teal-400 to-indigo-500 hover:from-teal-500 hover:to-indigo-650 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-500/20 text-center border-none"
                >
                  <Sparkles size={14} />
                  {t("error_premium_cta") || "Upgrade to Professional ($39/mo)"}
                </button>
                
                <Link
                  href="/projects"
                  className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft size={13} />
                  {t("error_premium_back") || "Back to Workspace"}
                </Link>

                {process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT !== "production" && process.env.NODE_ENV !== "production" && (
                  <div className="mt-4 pt-4 border-t border-dashed border-zinc-800 flex flex-col gap-2 w-full">
                    <p className="text-[10px] text-zinc-500 leading-normal text-left">
                      {isRu 
                        ? "Локальный тест: так как Paddle не может отправить вебхук на ваш localhost, вы можете симулировать оплату через локальный подписанный вебхук." 
                        : "Local Dev: Since Paddle cannot deliver webhooks to localhost, you can simulate the payment webhook using this signed local trigger."}
                    </p>
                    <button
                      onClick={handleSimulateWebhook}
                      disabled={simulating}
                      className="w-full py-2 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-300 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {simulating 
                        ? (isRu ? "Симуляция..." : "Simulating...") 
                        : (isRu ? "Симулировать вебхук оплаты" : "Simulate Payment Webhook")}
                    </button>
                    {simError && (
                      <p className="text-[10px] text-rose-400 font-semibold mt-1">
                        {simError}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
