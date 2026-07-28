"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import Nav from "./ui/nav";

export default function LayoutContent({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();

  return (
    <>
      {isAuthenticated && <Nav />}
      {children}
    </>
  );
}