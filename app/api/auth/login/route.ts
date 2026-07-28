import { NextResponse } from "next/server";
import { API_BASE_URL } from "@/config";
import { ACCESS_COOKIE, REFRESH_COOKIE, cookieOptions } from "@/lib/auth/session";

/**
 * BFF login: exchange credentials for the JWT pair with the .NET API, then store
 * the pair in httpOnly cookies so the browser never sees a raw token.
 */
export async function POST(request: Request) {
  const credentials = await request.json();

  const apiResponse = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });

  if (!apiResponse.ok) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const { accessToken, refreshToken } = await apiResponse.json();

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ACCESS_COOKIE, accessToken, cookieOptions());
  response.cookies.set(REFRESH_COOKIE, refreshToken, cookieOptions());
  return response;
}
