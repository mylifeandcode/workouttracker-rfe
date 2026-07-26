"use client";

import { useContext, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AuthContext } from "@/app/contexts/auth";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const auth = useContext(AuthContext);
  const router = useRouter();
  const pathname = usePathname();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    if (auth === undefined) return; // Context is still initializing

    if (!auth?.accessToken && pathname !== "/login") {
      router.push("/login");
    } else {
      setCheckingAuth(false);
    }
  }, [auth?.accessToken, pathname, router]);

  if (checkingAuth) return <div>Loading...</div>; // Prevents premature redirect

  return children;
}
