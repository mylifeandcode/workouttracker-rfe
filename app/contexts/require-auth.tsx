"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Auth state is known synchronously (decoded server-side and passed into the
  // provider), so there's no loading gate: authed users see children with no
  // flash, unauthenticated users are redirected. (Replaced by middleware in a
  // later BFF phase.)
  useEffect(() => {
    if (!isAuthenticated && pathname !== "/login") {
      router.replace("/login");
    }
  }, [isAuthenticated, pathname, router]);

  return isAuthenticated ? children : null;
}
