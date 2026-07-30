import { jwtDecode, JwtPayload } from "jwt-decode";

// Edge-safe JWT helpers. This module imports ONLY jwt-decode (pure JS, no Node
// or next/headers), so it is safe to import from the Edge middleware as well as
// from server code.

/**
 * True if the access token is expired (or its `exp` can't be read). A
 * missing/undecodable `exp` is treated as expired so the caller refreshes rather
 * than trusting a bad token. Note: this is a cheap local check, not verification —
 * the .NET API remains the real validator.
 */
export function isExpired(token: string): boolean {
  try {
    const { exp } = jwtDecode<JwtPayload>(token);
    if (!exp) return true;
    return exp * 1000 <= Date.now();
  } catch {
    return true;
  }
}
