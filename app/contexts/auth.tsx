"use client";

import { createContext, useState, useEffect, ReactNode } from "react";
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



export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  const NAME_KEY = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name";
  const ROLE_KEY = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";
  const USER_ID_KEY = "UserID";
  const USER_PUBLIC_ID_KEY = "UserPublicID";

  // Load token from localStorage on mount
  useEffect(() => {
    const storedAccessToken = localStorage.getItem("accessToken");
    const storedRefreshToken = localStorage.getItem("refreshToken");

    if (storedAccessToken) {
      setAccessToken(storedAccessToken);
      const decodedToken = jwtDecode<JwtPayload>(storedAccessToken);

      //TODO: Refactor. This is ugly. There's gotta be a better way.
      const userInfoFromToken = {
        name: (decodedToken[NAME_KEY as keyof JwtPayload] as string),
        role: (decodedToken[ROLE_KEY as keyof JwtPayload] as string),
        userId: (decodedToken[USER_ID_KEY as keyof JwtPayload] as number),
        userPublicId: (decodedToken[USER_PUBLIC_ID_KEY as keyof JwtPayload] as string)
      }

      //console.log('SETTING USER INFO: ', userInfoFromToken);

      setUser(userInfoFromToken);
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
