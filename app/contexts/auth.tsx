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
  token: string | null;
  //login: (token: string) => void;
  setToken: (token: string) => void;
  logout: () => void;
  user: User | null
}



export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  const NAME_KEY = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name";
  const ROLE_KEY = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";
  const USER_ID_KEY = "UserID";
  const USER_PUBLIC_ID_KEY = "UserPublicID";

  // Load token from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
      const decodedToken = jwtDecode<JwtPayload>(storedToken);

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
    setLoading(false);
  }, []);

  /*
  const login = (newToken: string) => {
    setToken(newToken);
    localStorage.setItem("token", newToken);
  };
  */

  const logout = () => {
    setToken(null);
    localStorage.removeItem("token");
  };

  // Function to update token on login
  const updateToken = (newToken: string | null) => {
    if (newToken) {
      localStorage.setItem("token", newToken);
    } else {
      localStorage.removeItem("token");
    }
    setToken(newToken);
  };  

  if (loading) {
    return <div>Loading...</div>; // Prevents RequireAuth from redirecting too early
  }

  return (
    <AuthContext.Provider value={{ token, setToken: updateToken, logout, user }}>
      {children}
    </AuthContext.Provider>
  );
}
