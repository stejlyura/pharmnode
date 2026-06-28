import { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import { rateLimit } from "./rateLimit";

const isProduction = process.env.NODE_ENV === "production";
if (isProduction) {
  if (!process.env.ADMIN_USERNAME) {
    throw new Error("ADMIN_USERNAME environment variable is not set in production.");
  }
  if (!process.env.ADMIN_PASSWORD) {
    throw new Error("ADMIN_PASSWORD environment variable is not set in production.");
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    ...(process.env.GITHUB_ID && process.env.GITHUB_SECRET
      ? [
          GithubProvider({
            clientId: process.env.GITHUB_ID,
            clientSecret: process.env.GITHUB_SECRET,
          }),
        ]
      : []),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
        totpCode: { label: "2FA Code", type: "text" }
      },
      async authorize(credentials) {
        // Apply login rate limit: max 10 attempts per 15 minutes per IP
        const limiter = await rateLimit("credentials_login", {
          limit: 10,
          windowMs: 15 * 60 * 1000,
        });

        if (!limiter.success) {
          console.warn("Authentication request blocked: Too many login attempts from client IP.");
          return null;
        }

        const expectedUser = process.env.ADMIN_USERNAME;
        const expectedPass = process.env.ADMIN_PASSWORD;

        if (!expectedUser || !expectedPass) {
          throw new Error(
            "ADMIN_USERNAME and ADMIN_PASSWORD environment variables must be set."
          );
        }

        if (credentials?.username === expectedUser && credentials?.password === expectedPass) {
          // Look up or create admin user in DB
          let adminUser = await prisma.user.findUnique({
            where: { email: "admin@pharmnode.com" },
          });

          if (!adminUser) {
            adminUser = await prisma.user.create({
              data: {
                name: "Administrator",
                email: "admin@pharmnode.com",
                image: "",
                tariff: "professional",
              },
            });
          } else if (adminUser.tariff !== "professional") {
            adminUser = await prisma.user.update({
              where: { email: "admin@pharmnode.com" },
              data: { tariff: "professional" },
            });
          }

          // Check if user has 2FA enabled
          if (adminUser.twoFactorEnabled) {
            if (!credentials.totpCode || !adminUser.twoFactorSecret) {
              return null; // 2FA code is missing
            }
            const { verifyTOTP } = await import("./totp");
            const { decrypt } = await import("./encryption");
            const is2FaValid = verifyTOTP(credentials.totpCode, decrypt(adminUser.twoFactorSecret));
            if (!is2FaValid) {
              return null; // Invalid 2FA token
            }
          }

          return {
            id: adminUser.id,
            name: adminUser.name,
            email: adminUser.email,
            tariff: adminUser.tariff,
            renewsAt: adminUser.renewsAt ? adminUser.renewsAt.toISOString() : null,
            emailVerified: true,
          };
        }

        // Regular user credentials login check
        const email = credentials?.username;
        const password = credentials?.password;
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({
          where: { email: String(email).toLowerCase().trim() },
        });

        if (!user || !user.passwordHash) return null;

        const { verifyPassword, needsUpgrade, hashPassword } = await import("./password");
        const isValid = verifyPassword(password, user.passwordHash);

        if (!isValid) return null;

        // Upgrade password hash if it is in legacy format (PBKDF2)
        if (needsUpgrade(user.passwordHash)) {
          const newHash = hashPassword(password);
          prisma.user.update({
            where: { id: user.id },
            data: { passwordHash: newHash },
          }).catch(err => console.error("Failed to upgrade user password hash during login:", err));
        }

        // Check if user has 2FA enabled
        if (user.twoFactorEnabled) {
          if (!credentials.totpCode || !user.twoFactorSecret) {
            return null; // 2FA code is missing
          }
          const { verifyTOTP } = await import("./totp");
          const { decrypt } = await import("./encryption");
          const is2FaValid = verifyTOTP(credentials.totpCode, decrypt(user.twoFactorSecret));
          if (!is2FaValid) {
            return null; // Invalid 2FA token
          }
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          tariff: user.tariff,
          renewsAt: user.renewsAt ? user.renewsAt.toISOString() : null,
          emailVerified: user.emailVerified,
        };
      }
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
          const newUser = await prisma.user.create({
            data: {
              name: user.name || "User",
              email: user.email,
              image: user.image || "",
              tariff: "hobby",
              isSubscribed: false,
              emailVerified: true,
            },
          });

          // Audit log for new OAuth registration
          try {
            const { logAuditEvent } = await import("./auditLogger");
            await logAuditEvent({
              userId: newUser.id,
              email: newUser.email,
              action: "user_register_oauth",
              details: `Registered new OAuth account via provider.`,
            });
          } catch (auditErr) {
            console.error("Audit log failed for OAuth registration:", auditErr);
          }
        }
      } catch (e) {
        console.error("Error signing in user in DB:", e);
      }

      return true;
    },

    async jwt({ token, user, trigger, session }) {
      // Create user session on initial sign in
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.tariff = user.tariff ?? "hobby";
        token.renewsAt = user.renewsAt ?? null;
        token.emailVerified = (user as { emailVerified?: boolean }).emailVerified ?? false;

        const crypto = await import("node:crypto");
        const sessionToken = crypto.randomUUID();
        token.sessionToken = sessionToken;

        let userAgent = "unknown";
        let ipAddress = "unknown";
        try {
          const { headers } = await import("next/headers");
          const reqHeaders = await headers();
          userAgent = reqHeaders.get("user-agent") || "unknown";
          ipAddress = reqHeaders.get("x-forwarded-for") || reqHeaders.get("x-real-ip") || "unknown";
        } catch {
          // outside request context
        }

        try {
          await prisma.userSession.create({
            data: {
              userId: user.id,
              token: sessionToken,
              userAgent: userAgent.slice(0, 255),
              ipAddress: ipAddress.slice(0, 100),
            },
          });

          // Log login event
          const { logAuditEvent } = await import("./auditLogger");
          await logAuditEvent({
            userId: user.id,
            email: user.email,
            action: "user_login",
            details: `Provider: Credentials/OAuth. OS/Browser: ${userAgent.slice(0, 150)}`
          });
        } catch (e) {
          console.error("Failed to create user session in DB:", e);
        }
      }

      // Check database session validity for subsequent requests
      if (token.sessionToken && !user) {
        try {
          const dbSession = await prisma.userSession.findUnique({
            where: { token: token.sessionToken as string },
          });

          if (!dbSession) {
            token.error = "SessionExpired";
            token.id = undefined;
            token.email = undefined;
            token.tariff = undefined;
          } else {
            // Update last used timestamp
            prisma.userSession.update({
              where: { id: dbSession.id },
              data: { lastUsed: new Date() },
            }).catch(e => console.error("Error updating session lastUsed:", e));
          }
        } catch (e) {
          console.error("Error checking UserSession in JWT callback:", e);
        }
      }

      // Query the database to ensure we always have the fresh subscription status
      if (token.email && !token.error) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email },
          });
          if (dbUser) {
            token.id = dbUser.id;
            token.tariff = dbUser.tariff ?? "hobby";
            token.renewsAt = dbUser.renewsAt ? dbUser.renewsAt.toISOString() : null;
            token.emailVerified = dbUser.emailVerified ?? false;
          }
        } catch (e) {
          console.error("Error fetching user in JWT callback:", e);
        }
      }

      // Handle session updates triggered via useSession().update()
      if (trigger === "update") {
        if (session?.tariff) {
          token.tariff = session.tariff;
        } else if (session?.user?.tariff) {
          token.tariff = session.user.tariff;
        }

        if (session?.renewsAt !== undefined) {
          token.renewsAt = session.renewsAt;
        } else if (session?.user?.renewsAt !== undefined) {
          token.renewsAt = session.user.renewsAt;
        }

        if (session?.emailVerified !== undefined) {
          token.emailVerified = session.emailVerified;
        } else if (session?.user?.emailVerified !== undefined) {
          token.emailVerified = session.user.emailVerified;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) ?? "mock-user-id";
        session.user.tariff = (token.tariff as string) ?? "hobby";
        session.user.renewsAt = (token.renewsAt as string) ?? null;
        session.user.emailVerified = (token.emailVerified as boolean) ?? false;
      }
      if (token.error) {
        session.error = token.error as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    signOut: "/logout",
  },
  secret: (() => {
    const s = process.env.NEXTAUTH_SECRET;
    const isProd = process.env.NODE_ENV === "production";
    if (isProd && !s) {
      throw new Error(
        "NEXTAUTH_SECRET environment variable is not set in production. " +
          "Generate one with: openssl rand -base64 32"
      );
    }
    return s || "dev-nextauth-secret-key-for-pharmnode";
  })(),
};
