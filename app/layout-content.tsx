"use client";

import { useContext } from "react";
import { AuthContext } from "./contexts/auth";
import Nav from "./ui/nav";

export default function LayoutContent({ children }: { children: React.ReactNode }) {
  const auth = useContext(AuthContext);

  if (auth === undefined) {
    return <div>Loading...</div>; // Prevents render issues
  }

  return (
    <>
      {auth.accessToken && <Nav />}
      {children}
    </>
  );
}