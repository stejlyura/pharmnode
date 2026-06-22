"use client";

import { useEffect } from "react";
import { initializePaddle } from "@paddle/paddle-js";
import type { PaddleEventData } from "@paddle/paddle-js";

export function PaddleInit() {
  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
    if (!token) {
      console.warn("Paddle: NEXT_PUBLIC_PADDLE_CLIENT_TOKEN is not defined in environment variables");
      return;
    }

    // Determine environment from explicit env var (set in .env.local for dev, Vercel for prod)
    const envVar = process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT;
    const paddleEnv: "sandbox" | "production" =
      envVar === "production" ? "production" : "sandbox";

    initializePaddle({
      environment: paddleEnv,
      token,
      eventCallback: (event: PaddleEventData) => {
        if (event.name === "checkout.completed") {
          console.log("Checkout completed in PaddleInit:", event.data);

          // ── Mock user: update localStorage and reload ────────────────────
          const mockUser = localStorage.getItem("pharmnode_mock_user");
          if (mockUser) {
            try {
              const parsed = JSON.parse(mockUser);
              parsed.tariff = "professional";
              localStorage.setItem("pharmnode_mock_user", JSON.stringify(parsed));
              // Update session cookie for server-side proxy middleware
              document.cookie = `pharmnode_mock_user=${encodeURIComponent(
                JSON.stringify(parsed)
              )}; path=/; max-age=31536000`;
              window.location.reload();
            } catch (e) {
              console.error("Failed to parse mock user in checkout callback:", e);
            }
            return;
          }

          // ── Real NextAuth user: fire a custom DOM event so AuthContext
          //    can call startSubscriptionPolling() without a circular import ──
          window.dispatchEvent(new CustomEvent("paddle:checkout:completed"));
        }
      },
    })
      .then((paddle) => {
        if (paddle) {
          const capitalizedEnv = paddleEnv === "production" ? "Production" : "Sandbox";
          console.log(`Paddle Billing (${capitalizedEnv}) initialized`);
        }
      })
      .catch((err) => {
        console.error(`Failed to initialize Paddle (${paddleEnv}):`, err);
      });
  }, []);

  return null;
}
