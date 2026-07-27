"use client";

import { createContext, useState, useEffect, useMemo, ReactNode } from "react";
import { jwtDecode, JwtPayload } from 'jwt-decode';

interface User {
  name: string;
  role: string;
  userId: number;
  userPublicId: string;
}

interface AuthContextType {
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
  refreshToken: string | null;
  setRefreshToken: (token: string | null) => void;
  logout: () => void;
  user: User | null
}

const NAME_KEY = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name";
const ROLE_KEY = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";
const USER_ID_KEY = "UserID";
const USER_PUBLIC_ID_KEY = "UserPublicID";

// The user is a pure function of the access token, so we derive it during
// render instead of storing it in state and syncing it via an effect. This
// keeps `user` consistent with `accessToken` on every update (e.g. login),
// not just on mount.
function decodeUser(token: string | null): User | null {
  if (!token) return null;
  const claims = jwtDecode<JwtPayload>(token);
  return {
    name: claims[NAME_KEY as keyof JwtPayload] as string,
    role: claims[ROLE_KEY as keyof JwtPayload] as string,
    userId: claims[USER_ID_KEY as keyof JwtPayload] as number,
    userPublicId: claims[USER_PUBLIC_ID_KEY as keyof JwtPayload] as string,
  };
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const user = useMemo(() => decodeUser(accessToken), [accessToken]);

  // Hydrate tokens from localStorage on mount. `user` is derived from
  // `accessToken` above, so there is nothing to set here for it.
  useEffect(() => {
    const storedAccessToken = localStorage.getItem("accessToken");
    const storedRefreshToken = localStorage.getItem("refreshToken");

    if (storedAccessToken) {
      setAccessToken(storedAccessToken);
    }

    if (storedRefreshToken) {
      setRefreshToken(storedRefreshToken);
    }

    setLoading(false);
  }, []);

  /*
  const login = (newToken: string) => {
    setToken(newToken);
    localStorage.setItem("token", newToken);
  };
  */

  const logout = () => {
    setAccessToken(null);
    setRefreshToken(null);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  };

  // Function to update token on login
  const updateAccessToken = (newToken: string | null) => {
    if (newToken) {
      localStorage.setItem("accessToken", newToken);
    } else {
      localStorage.removeItem("accessToken");
    }
    setAccessToken(newToken);
  };
  
  const updateRefreshToken = (newToken: string | null) => {
    if (newToken) {
      localStorage.setItem("refreshToken", newToken);
    } else {
      localStorage.removeItem("refreshToken");
    }
    setRefreshToken(newToken);
  };


  if (loading) {
    return <div>Loading...</div>; // Prevents RequireAuth from redirecting too early
  }

  return (
    <AuthContext.Provider 
      value={{ 
        accessToken: accessToken, 
        setAccessToken: updateAccessToken, 
        refreshToken: refreshToken, 
        setRefreshToken: updateRefreshToken, 
        logout, 
        user }}
      >
      {children}
    </AuthContext.Provider>
  );
}
