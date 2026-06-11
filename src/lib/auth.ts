import { NextAuthOptions } from "next-auth";
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
    async signIn({ user }) {
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
              tariff: "hobby",
            },
          });
        }
      } catch (e) {
        console.error("Error signing in user in DB:", e);
      }

      return true;
    },

    async jwt({ token, user }) {
      // On first sign-in, `user` is populated
      if (user?.email) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: user.email },
          });
          if (dbUser) {
            token.id = dbUser.id;
            token.tariff = dbUser.tariff ?? "hobby";
          }
        } catch (e) {
          console.error("Error fetching user in JWT callback:", e);
          token.id = "mock-user-id";
          token.tariff = "hobby";
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id ?? "mock-user-id";
        session.user.tariff = token.tariff ?? "hobby";
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback-secret-for-dev",
};
