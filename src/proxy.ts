import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  console.log(`[MIDDLEWARE] request pathname: ${pathname}`);

  try {
    // Skip API routes entirely from middleware
    if (pathname.startsWith("/api/")) {
      return NextResponse.next();
    }

  // 1. Private and Admin route authentication checks
  const isPrivateRoute = 
    pathname === "/projects" || pathname.startsWith("/projects/") ||
    pathname === "/configurator" || pathname.startsWith("/configurator/") ||
    pathname === "/settings" || pathname.startsWith("/settings/");

  const isAdminRoute =
    pathname === "/admin" || pathname.startsWith("/admin/");

  if (isPrivateRoute || isAdminRoute) {
    // Check NextAuth session token
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    // Check if there is an active mock session cookie
    const mockUserCookie = request.cookies.get("pharmnode_mock_user")?.value;
    let isMockAuthenticated = false;
    let mockEmail = "";
    
    if (mockUserCookie) {
      try {
        const mockUser = JSON.parse(decodeURIComponent(mockUserCookie));
        if (mockUser && mockUser.id) {
          isMockAuthenticated = true;
          mockEmail = mockUser.email;
        }
      } catch {
        // ignore malformed cookie
      }
    }

    const isAuthenticated = !!token || isMockAuthenticated;

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
      let tariff: string | null = null;

      if (token) {
        tariff = (token.tariff as string) ?? "hobby";
      } else if (isMockAuthenticated && mockUserCookie) {
        try {
          const mockUser = JSON.parse(decodeURIComponent(mockUserCookie));
          tariff = mockUser.tariff ?? "hobby";
        } catch {
          tariff = "hobby";
        }
      }

      if (tariff !== "professional" && tariff !== "enterprise" && tariff !== "hobby") {
        const url = request.nextUrl.clone();
        url.pathname = "/premium-required";
        return NextResponse.redirect(url);
      }
    }

    if (isAdminRoute) {
      const email = token?.email || mockEmail;
      if (email !== "admin@pharmnode.com") {
        // Re-route to custom 404 page for unauthorized users
        const url = request.nextUrl.clone();
        url.pathname = "/_not-found";
        return NextResponse.rewrite(url);
      }
    }
  }

  // 2. Redirect /ru/admin (and /ru/admin/...) to /admin (always English)
  if (pathname === "/ru/admin" || pathname.startsWith("/ru/admin/")) {
    const newPath = pathname.replace(/^\/ru\/admin/, "/admin");
    const url = request.nextUrl.clone();
    url.pathname = newPath;
    return NextResponse.redirect(url);
  }

  // 2. Handle Russian language routing rewrite
  if (pathname === "/ru" || pathname.startsWith("/ru/")) {
    const newPath = pathname === "/ru" ? "/" : pathname.replace(/^\/ru/, "");
    const url = request.nextUrl.clone();
    url.pathname = newPath;
    
    const response = NextResponse.rewrite(url);
    response.cookies.set("pharmnode-locale", "ru-RU", { path: "/" });
    return response;
  }

  // 3. For admin paths, enforce English locale cookie
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    const response = NextResponse.next();
    response.cookies.set("pharmnode-locale", "en-US", { path: "/" });
    return response;
  }

  // 4. Default cookie-based locale detection
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
  } catch (error: any) {
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
     * - api/auth (NextAuth endpoints)
     */
    "/((?!_next/static|_next/image|favicon.ico|api/auth).*)",
  ],
};
export default proxy;
