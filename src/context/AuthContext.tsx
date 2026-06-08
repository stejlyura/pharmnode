"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { SessionProvider, useSession, signIn, signOut } from "next-auth/react";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  image?: string;
  tariff: "hobby" | "professional" | "enterprise";
  provider: string;
}

interface AuthContextType {
  user: UserProfile | null;
  status: "authenticated" | "unauthenticated" | "loading";
  login: (
    provider: string,
    customDetails?: { name: string; email: string; tariff?: "hobby" | "professional" | "enterprise" }
  ) => Promise<void>;
  logout: () => Promise<void>;
  changeTariff: (tariff: "hobby" | "professional" | "enterprise") => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AuthLoader: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: session, status: nextAuthStatus } = useSession();
  const [mockUser, setMockUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("pharmnode_mock_user");
    if (stored) {
      try {
        setMockUser(JSON.parse(stored));
      } catch (e) {}
    }
    setLoading(false);
  }, []);

  const login = async (
    provider: string,
    customDetails?: { name: string; email: string; tariff?: "hobby" | "professional" | "enterprise" }
  ) => {
    if (provider.startsWith("mock-")) {
      const name = 
        customDetails?.name || (
          provider === "mock-google" 
            ? "Dr. Alexander Fleming" 
            : provider === "mock-github" 
            ? "Fermer Tech" 
            : "CMO Pharma Corp"
        );
      const email = 
        customDetails?.email || (
          provider === "mock-google" 
            ? "fleming@penicillin.org" 
            : provider === "mock-github" 
            ? "dev@github-pharma.com" 
            : "admin@cmo-corp.com"
        );
      const image = 
        provider === "mock-google" 
          ? "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=150&h=150&q=80"
          : provider === "mock-github"
          ? "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&h=150&q=80"
          : "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150&q=80";
      
      const newMock: UserProfile = {
        id: "mock-" + Date.now(),
        name,
        email,
        image,
        tariff: customDetails?.tariff || (provider === "mock-microsoft" ? "enterprise" : provider === "mock-github" ? "professional" : "hobby"),
        provider: provider.replace("mock-", ""),
      };
      
      setMockUser(newMock);
      localStorage.setItem("pharmnode_mock_user", JSON.stringify(newMock));
    } else {
      await signIn(provider);
    }
  };

  const logout = async () => {
    if (mockUser) {
      setMockUser(null);
      localStorage.removeItem("pharmnode_mock_user");
    } else {
      await signOut();
    }
  };

  const changeTariff = (newTariff: "hobby" | "professional" | "enterprise") => {
    if (mockUser) {
      const updated = { ...mockUser, tariff: newTariff };
      setMockUser(updated);
      localStorage.setItem("pharmnode_mock_user", JSON.stringify(updated));
    } else if (session?.user) {
      (session as any).user.tariff = newTariff;
      setMockUser(null); 
    }
  };

  let activeUser: UserProfile | null = null;
  let activeStatus: "authenticated" | "unauthenticated" | "loading" = "unauthenticated";

  if (loading) {
    activeStatus = "loading";
  } else if (mockUser) {
    activeUser = mockUser;
    activeStatus = "authenticated";
  } else if (nextAuthStatus === "authenticated" && session?.user) {
    activeUser = {
      id: (session.user as any).id || "nextauth-user-id",
      name: session.user.name || "OAuth User",
      email: session.user.email || "",
      image: session.user.image || undefined,
      tariff: (session.user as any).tariff || "hobby",
      provider: "oauth",
    };
    activeStatus = "authenticated";
  } else if (nextAuthStatus === "loading") {
    activeStatus = "loading";
  }

  return (
    <AuthContext.Provider value={{ user: activeUser, status: activeStatus, login, logout, changeTariff }}>
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
