"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { SessionProvider, useSession, signIn, signOut } from "next-auth/react";
import { initAnalytics, identifyUser, resetAnalytics } from "@/lib/analytics";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  image?: string;
  tariff: "hobby" | "professional";
  provider: string;
  renewsAt?: string | null;
}

interface AuthContextType {
  user: UserProfile | null;
  status: "authenticated" | "unauthenticated" | "loading";
  login: (
    provider: string,
    customDetails?: { name: string; email: string; tariff?: "hobby" | "professional" }
  ) => Promise<void>;
  logout: () => Promise<void>;
  changeTariff: (tariff: "hobby" | "professional") => void;
  startSubscriptionPolling: () => void;
  isPolling: boolean;
  pollingStatus: "idle" | "polling" | "timeout";
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AuthLoader: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: session, status: nextAuthStatus, update } = useSession();
  const [mockUser, setMockUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [tariffOverride, setTariffOverride] = useState<"hobby" | "professional" | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [pollingStatus, setPollingStatus] = useState<"idle" | "polling" | "timeout">("idle");

  useEffect(() => {
    initAnalytics();
    const stored = localStorage.getItem("pharmnode_mock_user");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setTimeout(() => {
          setMockUser(parsed);
        }, 0);
      } catch (e) {
        console.error("Failed to parse mock user:", e);
      }
    }
    setTimeout(() => {
      setLoading(false);
    }, 0);
  }, []);

  const login = async (
    provider: string,
    customDetails?: { name: string; email: string; tariff?: "hobby" | "professional" }
  ) => {
    if (provider.startsWith("mock-")) {
      const name = 
        customDetails?.name || (
          provider === "mock-google" 
            ? "Dr. Alexander Fleming" 
            : "Fermer Tech"
        );
      const email = 
        customDetails?.email || (
          provider === "mock-google" 
            ? "fleming@penicillin.org" 
            : "dev@github-pharma.com"
        );
      const image = 
        provider === "mock-google" 
          ? "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=150&h=150&q=80"
          : "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&h=150&q=80";
      
      const newMock: UserProfile = {
        id: "mock-" + Date.now(),
        name,
        email,
        image,
        tariff: customDetails?.tariff || (provider === "mock-github" ? "professional" : "hobby"),
        provider: provider.replace("mock-", ""),
        renewsAt: (customDetails?.tariff || (provider === "mock-github" ? "professional" : "hobby")) === "professional" 
          ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() 
          : null,
      };
      
      setMockUser(newMock);
      localStorage.setItem("pharmnode_mock_user", JSON.stringify(newMock));
      // Set session cookie for server-side proxy middleware
      document.cookie = `pharmnode_mock_user=${encodeURIComponent(JSON.stringify(newMock))}; path=/; max-age=31536000`;
    } else {
      await signIn(provider);
    }
  };

  const logout = async () => {
    if (mockUser) {
      setMockUser(null);
      localStorage.removeItem("pharmnode_mock_user");
      // Clear session cookie for proxy
      document.cookie = "pharmnode_mock_user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    } else {
      await signOut();
    }
  };

  const changeTariff = (newTariff: "hobby" | "professional") => {
    if (mockUser) {
      const updated = { 
        ...mockUser, 
        tariff: newTariff,
        renewsAt: newTariff === "professional" 
          ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() 
          : null 
      };
      setMockUser(updated);
      localStorage.setItem("pharmnode_mock_user", JSON.stringify(updated));
      // Update session cookie for proxy
      document.cookie = `pharmnode_mock_user=${encodeURIComponent(JSON.stringify(updated))}; path=/; max-age=31536000`;
    } else if (session?.user) {
      setTariffOverride(newTariff);
      setMockUser(null); 
    }
  };

  const startSubscriptionPolling = useCallback(() => {
    // If it's a mock user, we don't need real webhook polling
    if (mockUser) return;

    let attempts = 0;
    const maxAttempts = 15; // 30 seconds limit

    setIsPolling(true);
    setPollingStatus("polling");

    const interval = setInterval(async () => {
      attempts += 1;
      try {
        const res = await fetch("/api/subscription/status");
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.tariff === "professional") {
            clearInterval(interval);
            setTariffOverride("professional");
            setIsPolling(false);
            setPollingStatus("idle");
            // Force NextAuth session update
            await update({ 
              tariff: "professional",
              renewsAt: data.renewsAt 
            });
            return;
          }
        }
      } catch (err) {
        console.error("Subscription polling error:", err);
      }

      if (attempts >= maxAttempts) {
        clearInterval(interval);
        setIsPolling(false);
        setPollingStatus("timeout");
      }
    }, 2000);
  }, [mockUser, update]);

  // Listen for Paddle checkout completion (fired by PaddleInit to avoid circular imports)
  useEffect(() => {
    const handlePaddleCheckoutCompleted = () => {
      startSubscriptionPolling();
    };
    window.addEventListener("paddle:checkout:completed", handlePaddleCheckoutCompleted);
    return () => {
      window.removeEventListener("paddle:checkout:completed", handlePaddleCheckoutCompleted);
    };
  }, [startSubscriptionPolling]);

  let activeUser: UserProfile | null = null;
  let activeStatus: "authenticated" | "unauthenticated" | "loading" = "unauthenticated";

  if (loading) {
    activeStatus = "loading";
  } else if (mockUser) {
    activeUser = mockUser;
    activeStatus = "authenticated";
  } else if (nextAuthStatus === "authenticated" && session?.user) {
    activeUser = {
      id: session.user.id || "nextauth-user-id",
      name: session.user.name || "OAuth User",
      email: session.user.email || "",
      image: session.user.image || undefined,
      tariff: tariffOverride || (session.user.tariff as "hobby" | "professional") || "hobby",
      provider: "oauth",
      renewsAt: session.user.renewsAt || null,
    };
    activeStatus = "authenticated";
  } else if (nextAuthStatus === "loading") {
    activeStatus = "loading";
  }

  // Telemetry session tracking
  useEffect(() => {
    if (activeStatus === "authenticated" && activeUser) {
      identifyUser(activeUser.id, {
        email: activeUser.email,
        name: activeUser.name,
        tariff: activeUser.tariff,
        provider: activeUser.provider
      });
    } else if (activeStatus === "unauthenticated") {
      resetAnalytics();
    }
  }, [activeUser?.id, activeUser?.tariff, activeStatus]);

  return (
    <AuthContext.Provider value={{ user: activeUser, status: activeStatus, login, logout, changeTariff, startSubscriptionPolling, isPolling, pollingStatus }}>
      {children}
    </AuthContext.Provider>
  );
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <SessionProvider>
      <AuthLoader>{children}</AuthLoader>
    </SessionProvider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
