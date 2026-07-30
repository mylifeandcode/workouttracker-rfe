import "server-only";

import { cookies } from "next/headers";
import { jwtDecode, JwtPayload } from "jwt-decode";
import { ACCESS_COOKIE } from "./constants";

/**
 * Server-only auth utilities. Decodes the current user from the access-token
 * cookie. Cookie names and options live in ./constants (Edge-safe); import those
 * from there directly rather than through this module.
 */

// The .NET API embeds identity in full XML-schema / Microsoft claim URIs plus
// custom UserID / UserPublicID claims.
const NAME_KEY = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name";
const ROLE_KEY = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";
const USER_ID_KEY = "UserID";
const USER_PUBLIC_ID_KEY = "UserPublicID";

export interface SessionUser {
  name: string;
  role: string;
  userId: number;
  userPublicId: string;
}

/**
 * Decode (not verify) the display identity from an access-token JWT. Verification
 * is the .NET API's job; the token here came from our own httpOnly cookie, set by
 * our server from an API-issued token, and is only used for client-side display.
 */
export function decodeUser(token: string | undefined | null): SessionUser | null {
  if (!token) return null;
  try {
    const claims = jwtDecode<JwtPayload>(token);
    return {
      name: claims[NAME_KEY as keyof JwtPayload] as string,
      role: claims[ROLE_KEY as keyof JwtPayload] as string,
      userId: claims[USER_ID_KEY as keyof JwtPayload] as number,
      userPublicId: claims[USER_PUBLIC_ID_KEY as keyof JwtPayload] as string,
    };
  } catch {
    return null;
  }
}

/** Read the current user from the access-token cookie (Server Components / route handlers). */
export async function getSessionUser(): Promise<SessionUser | null> {
  const store = await cookies();
  return decodeUser(store.get(ACCESS_COOKIE)?.value);
}
