"use client";

import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import Link from "next/link";

export default function Nav() {
  const { token, logout } = useContext(AuthContext) || {};

  return (
    <nav className="bg-red-800 text-white shadow-md flex flex-row">
      <div>
        <ul className="p-4">
          <li><Link href="#">Workout Tracker</Link></li>
        </ul>
      </div>
      <div>
        <ul className="p-4">
          <li><Link href="under-construction">Workouts</Link></li>
        </ul>
      </div>
      <div className="ml-auto bg-blue-800">
        <ul className="p-4">
          <li>
            <button onClick={logout} className="hover:text-gray-300">
              Logout
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
}
