"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { SessionProvider, useSession, signIn, signOut } from "next-auth/react";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  image?: string;
  tariff: "hobby" | "professional";
  provider: string;
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

  const changeTariff = (newTariff: "hobby" | "professional") => {
    if (mockUser) {
      const updated = { ...mockUser, tariff: newTariff };
      setMockUser(updated);
      localStorage.setItem("pharmnode_mock_user", JSON.stringify(updated));
    } else if (session?.user) {
      session.user.tariff = newTariff;
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
      id: session.user.id || "nextauth-user-id",
      name: session.user.name || "OAuth User",
      email: session.user.email || "",
      image: session.user.image || undefined,
      tariff: (session.user.tariff as "hobby" | "professional") || "hobby",
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
