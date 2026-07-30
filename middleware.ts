import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/config";
import { ACCESS_COOKIE, REFRESH_COOKIE, cookieOptions } from "@/lib/auth/constants";
import { isExpired } from "@/lib/auth/jwt";

/**
 * Server-side route protection + proactive token refresh (runs on the Edge before
 * a page renders — the App Router equivalent of an Angular CanActivate guard).
 *
 * Presence check only for auth: the .NET API remains the real validator. But since
 * Server Components can't set cookies, this is also the one pre-render place that
 * CAN refresh an expired token, so RSC data reads always see a valid one.
 *
 * Edge-safe: imports only from constants/jwt/config — never the server-only
 * `session.ts` (which pulls in `next/headers`).
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get(ACCESS_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
  const hasSession = Boolean(accessToken);

  // Logged-in users shouldn't see the login page.
  if (hasSession && pathname === "/login") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Unauthenticated users can only reach the login page.
  if (!hasSession && pathname !== "/login") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Proactive refresh: an RSC can't refresh cookies itself, so renew here before it
  // renders. Redirect to the same URL so the browser re-requests with fresh cookies.
  if (hasSession && refreshToken && isExpired(accessToken!)) {
    const refreshed = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accessToken, refreshToken }),
    });

    if (refreshed.ok) {
      const tokens = await refreshed.json();
      const response = NextResponse.redirect(request.url);
      response.cookies.set(ACCESS_COOKIE, tokens.accessToken, cookieOptions());
      response.cookies.set(REFRESH_COOKIE, tokens.refreshToken, cookieOptions());
      return response;
    }

    // Refresh failed → session is dead; clear cookies and send to login.
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete(ACCESS_COOKIE);
    response.cookies.delete(REFRESH_COOKIE);
    return response;
  }

  return NextResponse.next();
}

export const config = {
  // Run on every route EXCEPT API handlers (which must never be redirected — login
  // and the data proxy live under /api), Next internals, and static files.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
