import NextAuth, { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID || "mock-id",
      clientSecret: process.env.GITHUB_SECRET || "mock-secret",
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "mock-id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "mock-secret",
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user.email) return false;
      
      try {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
        });
        if (!existingUser) {
          await prisma.user.create({
            data: {
              name: user.name || "User",
              email: user.email,
              image: user.image || "",
              tariff: "hobby", // Default tariff
            },
          });
        }
      } catch (e) {
        console.error("Error signing in user in DB:", e);
      }
      
      return true;
    },
    async session({ session, token }) {
      if (session.user && session.user.email) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: session.user.email },
          });
          if (dbUser) {
            (session as any).user.id = dbUser.id;
            (session as any).user.tariff = dbUser.tariff || "hobby";
          }
        } catch (e) {
          console.error("Error fetching user session from DB:", e);
          // Default mock session settings
          (session as any).user.id = "mock-user-id";
          (session as any).user.tariff = "hobby";
        }
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback-secret-for-dev",
};
