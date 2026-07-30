import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { API_BASE_URL } from "@/config";
import { ACCESS_COOKIE, REFRESH_COOKIE } from "@/lib/auth/constants";

/**
 * BFF logout: best-effort revoke the refresh token server-side, then clear both
 * httpOnly cookies.
 */
export async function POST() {
  const store = await cookies();
  const accessToken = store.get(ACCESS_COOKIE)?.value;

  if (accessToken) {
    // Fire-and-forget; a failed revoke must not block clearing the local session.
    await fetch(`${API_BASE_URL}/auth/revoke`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: "{}",
    }).catch(() => {});
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.delete(ACCESS_COOKIE);
  response.cookies.delete(REFRESH_COOKIE);
  return response;
}
