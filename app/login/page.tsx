"use client";

import { useContext, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "../context/AuthContext";
import { API_BASE_URL } from "@/config";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const { setToken } = useContext(AuthContext) || {};

  const handleSubmit = async (e: React.FormEvent) => {
    
    e.preventDefault();

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) throw new Error("Invalid credentials");

      //const data = await response.json();
      const token = await response.text(); //My login endpoint is returning the token string only
      
      /*
      //localStorage.setItem("token", data.token); // Consider using httpOnly cookies instead
      localStorage.setItem("token", token); // Consider using httpOnly cookies instead
      console.log('token set in local storage: ', token);
      console.log('token from local storage: ', localStorage.getItem("token"));
      */

      setToken?.(token);

      router.push("/"); // Redirect on successful login
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <form onSubmit={handleSubmit} className="p-6 bg-white shadow-md rounded">
        <h2 className="text-xl font-bold mb-4">Login</h2>
        {error && <p className="text-red-500">{error}</p>}
        <input
          type="string"
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
        <button type="submit" className="bg-blue-500 text-white p-2 rounded w-full">
          Login
        </button>
      </form>
    </div>
  );
}
