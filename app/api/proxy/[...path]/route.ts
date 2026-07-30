import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { API_BASE_URL } from "@/config";
import { ACCESS_COOKIE, REFRESH_COOKIE } from "@/lib/auth/constants";
import { cookieOptions } from "@/lib/auth/session";

/**
 * BFF data proxy. The browser calls `/api/proxy/<path>` same-origin (so the
 * httpOnly cookie rides along automatically); this handler attaches the access
 * token as a Bearer header and forwards to the .NET API. On a 401 it transparently
 * refreshes the token pair and retries once, re-setting the rotated cookies.
 */

function callApi(
  targetUrl: string,
  method: string,
  accessToken: string | undefined,
  body: string | undefined,
  contentType: string | null,
) {
  const headers: Record<string, string> = {};
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;
  if (contentType) headers["Content-Type"] = contentType;
  return fetch(targetUrl, { method, headers, body });
}

async function handle(
  request: NextRequest,
  ctx: { params: Promise<{ path: string[] }> },
) {
  const { path } = await ctx.params;
  const search = new URL(request.url).search;
  const targetUrl = `${API_BASE_URL}/${path.join("/")}${search}`;

  const store = await cookies();
  let accessToken = store.get(ACCESS_COOKIE)?.value;
  const refreshToken = store.get(REFRESH_COOKIE)?.value;

  const method = request.method;
  const contentType = request.headers.get("content-type");
  const body = method === "GET" || method === "HEAD" ? undefined : await request.text();

  let upstream = await callApi(targetUrl, method, accessToken, body, contentType);

  // Reactive refresh: /auth/refresh needs BOTH the (possibly expired) access token
  // and the refresh token to identify the user and rotate the pair.
  let rotated: { accessToken: string; refreshToken: string } | null = null;
  if (upstream.status === 401 && accessToken && refreshToken) {
    const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accessToken, refreshToken }),
    });

    if (refreshResponse.ok) {
      rotated = await refreshResponse.json();
      accessToken = rotated!.accessToken;
      upstream = await callApi(targetUrl, method, accessToken, body, contentType);
    } else {
      // Session is dead — clear cookies and surface the 401 to the client.
      const dead = new NextResponse(null, { status: 401 });
      dead.cookies.delete(ACCESS_COOKIE);
      dead.cookies.delete(REFRESH_COOKIE);
      return dead;
    }
  }

  const payload = await upstream.text();
  const response = new NextResponse(payload, {
    status: upstream.status,
    headers: {
      "Content-Type": upstream.headers.get("content-type") ?? "application/json",
    },
  });

  if (rotated) {
    response.cookies.set(ACCESS_COOKIE, rotated.accessToken, cookieOptions());
    response.cookies.set(REFRESH_COOKIE, rotated.refreshToken, cookieOptions());
  }

  return response;
}

export {
  handle as GET,
  handle as POST,
  handle as PUT,
  handle as PATCH,
  handle as DELETE,
};
