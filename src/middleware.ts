import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  console.log(`[MIDDLEWARE] request pathname: ${pathname}`);

  try {
    const isProduction =
      process.env.NODE_ENV === "production" ||
      process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT === "production";

    // Check if there is an active mock session cookie
    const mockUserCookie = request.cookies.get("pharmnode_mock_user")?.value;
    let isMockAuthenticated = false;
    let mockEmail = "";
    let mockTariff = "hobby";
    
    if (mockUserCookie && !isProduction) {
      try {
        const mockUser = JSON.parse(decodeURIComponent(mockUserCookie));
        if (mockUser && mockUser.id) {
          isMockAuthenticated = true;
          mockEmail = mockUser.email || "";
          mockTariff = mockUser.tariff || "hobby";
        }
      } catch {
        // ignore malformed cookie
      }
    }

    // Get NextAuth token if available
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    const isAuthenticated = !!token || isMockAuthenticated;

    // ─── Email Verification Enforcement ──────────────────────────────────────
    const rawVerified = token?.emailVerified as unknown;
    const isEmailVerified = token
      ? (rawVerified === true || rawVerified === "true" || (!!rawVerified && rawVerified !== "false"))
      : true;
    if (isAuthenticated && !isEmailVerified) {
      const isVerificationPage = pathname === "/verify-email";
      const isVerificationApi = pathname.startsWith("/api/auth/verify-email");
      const isSignOutApi = pathname.startsWith("/api/auth/signout");

      if (!isVerificationPage && !isVerificationApi && !isSignOutApi) {
        if (pathname.startsWith("/api/")) {
          return NextResponse.json({ error: "Email verification required" }, { status: 403 });
        }
        const url = request.nextUrl.clone();
        url.pathname = "/verify-email";
        return NextResponse.redirect(url);
      }
    }

    // ─── 1. API Route Protection ─────────────────────────────────────────────
    if (pathname.startsWith("/api/")) {
      const isAuthApi = pathname.startsWith("/api/auth/");
      const isWebhookApi = pathname.startsWith("/api/webhooks/");
      const isStandardIngredientsApi =
        pathname === "/api/ingredients" &&
        request.nextUrl.searchParams.get("type") === "standard";

      // Allow whitelisted APIs
      if (isAuthApi || isWebhookApi || isStandardIngredientsApi) {
        return NextResponse.next();
      }

      // Deny access if not authenticated
      if (!isAuthenticated) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      return NextResponse.next();
    }

    // ─── 2. Private Page Route Protection ────────────────────────────────────
    const isPrivateRoute = 
      pathname === "/projects" || pathname.startsWith("/projects/") ||
      pathname === "/configurator" || pathname.startsWith("/configurator/") ||
      pathname === "/settings" || pathname.startsWith("/settings/");

    const isAdminRoute =
      pathname === "/admin" || pathname.startsWith("/admin/");

    if (isPrivateRoute || isAdminRoute) {
      if (!isAuthenticated) {
        // Redirect to login with original callback URL
        const url = request.nextUrl.clone();
        url.pathname = "/login";
        url.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(url);
      }

      // Premium subscription check for /configurator
      const isPremiumRoute =
        pathname === "/configurator" || pathname.startsWith("/configurator/");

      if (isPremiumRoute) {
        const tariff = token ? ((token.tariff as string) ?? "hobby") : mockTariff;

        if (tariff !== "professional" && tariff !== "enterprise" && tariff !== "hobby") {
          const url = request.nextUrl.clone();
          url.pathname = "/premium-required";
          return NextResponse.redirect(url);
        }
      }

      // Admin route email validation
      if (isAdminRoute) {
        const email = token?.email || mockEmail;
        if (email !== "admin@pharmnode.com") {
          const url = request.nextUrl.clone();
          url.pathname = "/_not-found";
          return NextResponse.rewrite(url);
        }
      }
    }

    // ─── 3. Locale routing rewrites ──────────────────────────────────────────
    // Redirect /ru/admin (and /ru/admin/...) to /admin (always English)
    if (pathname === "/ru/admin" || pathname.startsWith("/ru/admin/")) {
      const newPath = pathname.replace(/^\/ru\/admin/, "/admin");
      const url = request.nextUrl.clone();
      url.pathname = newPath;
      return NextResponse.redirect(url);
    }

    // Handle Russian language routing rewrite
    if (pathname === "/ru" || pathname.startsWith("/ru/")) {
      const newPath = pathname === "/ru" ? "/" : pathname.replace(/^\/ru/, "");
      const url = request.nextUrl.clone();
      url.pathname = newPath;
      
      const response = NextResponse.rewrite(url);
      response.cookies.set("pharmnode-locale", "ru-RU", { path: "/" });
      return response;
    }

    // For admin paths, enforce English locale cookie
    if (pathname === "/admin" || pathname.startsWith("/admin/")) {
      const response = NextResponse.next();
      response.cookies.set("pharmnode-locale", "en-US", { path: "/" });
      return response;
    }

    // Default cookie-based locale detection if cookie is missing
    let locale = request.cookies.get("pharmnode-locale")?.value;

    if (!locale) {
      const acceptLanguage = request.headers.get("accept-language");
      if (acceptLanguage && (acceptLanguage.toLowerCase().includes("eu") || acceptLanguage.toLowerCase().includes("europe"))) {
        locale = "en-EU";
      } else {
        locale = "en-US";
      }
    }

    return NextResponse.next();
  } catch (error: unknown) {
    console.error("[MIDDLEWARE] Error caught in middleware:", error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
