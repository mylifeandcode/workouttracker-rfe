"use client";

import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import Link from "next/link";

export default function Nav() {
  const { token, logout } = useContext(AuthContext) || {};

  return (
    /*
    <nav className="bg-red-800 text-white shadow-md flex flex-row">
      <div>
        <ul className="p-4">
          <li><Link href="/">Workout Tracker</Link></li>
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
    */
    <ul>
      <li><Link href="/" className="font-bold">Workout Tracker</Link></li>
      <li><Link href="/">Home</Link></li>
      <li className="dropdown">
        <a href="javascript:void(0)" className="dropbtn">Workouts</a>
        <div className="dropdown-content">
          <Link href="#">Start a Workout</Link>
          <Link href="#">Create a Workout</Link>
          <Link href="#">Plan a Workout for Later</Link>
          <Link href="#">Start/View a Pre-Planned Workout</Link>
          <Link href="#">Enter Information About a Past Workout</Link>
          <Link href="#">Manage Workouts</Link>
          <Link href="#">View Workout History</Link>
          <Link href="#">Plan a Workout for Later</Link>
          <Link href="#">In-Progress Workouts</Link>
        </div>
      </li>
      <li className="dropdown">
        <a href="javascript:void(0)" className="dropbtn">Exercises</a>
        <div className="dropdown-content">
          <Link href="#">Create an Exercise</Link>
          <Link href="#">Manage Exercises</Link>
        </div>
      </li>
      <li className="dropdown">
        <a href="javascript:void(0)" className="dropbtn">Analytics</a>
        <div className="dropdown-content">
          <Link href="#">Dashboard</Link>
          <Link href="#">Workout Progress</Link>
        </div>
      </li>
      <li><Link href="/admin">Admin</Link></li>
      <li className="dropdown ml-auto">
        <a href="javascript:void(0)" className="dropbtn">Welcome, (name)!</a>
        <div className="dropdown-content">
          <Link href="#">Settings</Link>
        </div>
      </li>
      <li><Link href="#" onClick={logout}>Logout</Link></li>
    </ul>
  );
}
