import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  let locale = request.cookies.get("pharmnode-locale")?.value;

  if (!locale) {
    const acceptLanguage = request.headers.get("accept-language");
    if (acceptLanguage && (acceptLanguage.toLowerCase().includes("eu") || acceptLanguage.toLowerCase().includes("europe"))) {
      locale = "en-EU";
    } else {
      locale = "en-US";
    }
  }

  const response = NextResponse.next();
  response.cookies.set("pharmnode-locale", locale, {
    path: "/",
    maxAge: 31536000, // 1 year
  });

  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|api/auth).*)",
  ],
};
export default proxy;
