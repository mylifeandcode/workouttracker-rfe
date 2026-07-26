"use client";

import { useContext, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "../contexts/auth";
import { API_BASE_URL } from "@/config";
import { AuthTokenResultDTO } from "@/lib/api/types.gen";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { setAccessToken, setRefreshToken } = useContext(AuthContext) || {};

  const handleSubmit = async (e: React.FormEvent) => {
    
    e.preventDefault();

    try {
      setLoggingIn(true);
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) throw new Error("Invalid credentials");

      const tokenResponse: AuthTokenResultDTO = await response.json();
      
      /*
      //localStorage.setItem("token", data.token); // Consider using httpOnly cookies instead
      localStorage.setItem("token", token); // Consider using httpOnly cookies instead
      console.log('token set in local storage: ', token);
      console.log('token from local storage: ', localStorage.getItem("token"));
      */

      setAccessToken?.(tokenResponse.accessToken);
      setRefreshToken?.(tokenResponse.refreshToken);

      router.push("/"); // Redirect on successful login
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoggingIn(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <form onSubmit={handleSubmit} className="p-6 bg-white shadow-md rounded">
        <h2 className="text-xl font-bold mb-4">Login</h2>
        {error && <p className="text-red-500">{error}</p>}
        <input
          type="text"
          placeholder="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="border p-2 w-full mb-2"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 w-full mb-4"
          required
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded w-full" disabled={loggingIn}>
          {loggingIn ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
              Logging in...
            </span>
          ) : (
            "Login"
          )}
        </button>
      </form>
    </div>
  );
}
