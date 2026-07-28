"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { accessToken } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    if (!accessToken && pathname !== "/login") {
      router.push("/login");
    } else {
      setCheckingAuth(false);
    }
  }, [accessToken, pathname, router]);

  if (checkingAuth) return <div>Loading...</div>; // Prevents premature redirect

  return children;
}
