"use client";

import { createContext, useCallback, useMemo, ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { SessionUser } from "@/lib/auth/session";

interface AuthContextType {
  user: SessionUser | null;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Thin client auth context. Tokens live only in httpOnly cookies owned by the
 * BFF, so the browser never holds them. `user` is decoded server-side and passed
 * in from the root layout; this provider just exposes it plus a `logout` action.
 */
export function AuthProvider({
  user,
  children,
}: {
  user: SessionUser | null;
  children: ReactNode;
}) {
  const router = useRouter();

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh(); // re-render server components so `user` becomes null
  }, [router]);

  const value = useMemo<AuthContextType>(
    () => ({ user, isAuthenticated: !!user, logout }),
    [user, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
