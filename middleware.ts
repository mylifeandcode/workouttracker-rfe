import { NextRequest, NextResponse } from "next/server";
import { ACCESS_COOKIE } from "@/lib/auth/constants";

/**
 * Server-side route protection (the App Router equivalent of an Angular
 * CanActivate guard). Runs on the Edge before a page renders.
 *
 * It only checks whether the session cookie *exists* — it does NOT verify the
 * JWT. Verifying would require the .NET signing key (which must not live here),
 * and an expired access token with a valid refresh token is still a live session
 * (the proxy refreshes it on the next data call). The .NET API remains the real
 * validator; this is just a coarse "is there a session?" gate.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.has(ACCESS_COOKIE);

  // Logged-in users shouldn't see the login page.
  if (hasSession && pathname === "/login") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Unauthenticated users can only reach the login page.
  if (!hasSession && pathname !== "/login") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Run on every route EXCEPT API handlers (which must never be redirected —
  // login and the data proxy live under /api), Next internals, and static files.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
