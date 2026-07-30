import "server-only";

import { cookies } from "next/headers";
import { API_BASE_URL } from "@/config";
import { ACCESS_COOKIE } from "@/lib/auth/constants";

/**
 * Server-side authed fetch for Server Components. Reads the access token from the
 * httpOnly cookie and calls the .NET API directly with a Bearer header — no browser
 * round-trip. Middleware refreshes an expired token before the RSC renders, so the
 * token here is expected to be valid.
 *
 * `cache: "no-store"` because this is per-user, authed data that must never be
 * cached across requests.
 */
export async function serverApiFetch(path: string, init?: RequestInit) {
  const store = await cookies();
  const accessToken = store.get(ACCESS_COOKIE)?.value;

  return fetch(`${API_BASE_URL}/${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      ...init?.headers,
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
  });
}
