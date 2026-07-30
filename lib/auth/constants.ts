// Cookie config for the BFF session. Kept dependency-free (no `server-only`, no
// `next/headers`) so this module is safe to import from the Edge middleware as
// well as from server-only code.

export const ACCESS_COOKIE = "wt_access";
export const REFRESH_COOKIE = "wt_refresh";

// Both cookies live for the refresh-token lifetime (7 days), NOT the 120-min
// access lifetime: the server must still hold the (possibly expired) access token
// to send to /auth/refresh, which uses it to identify the user.
const SEVEN_DAYS_SECONDS = 60 * 60 * 24 * 7;

export function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SEVEN_DAYS_SECONDS,
  };
}
