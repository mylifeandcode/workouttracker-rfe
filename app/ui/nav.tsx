"use client";

import Link from "next/link";
import { useAuth } from "@/lib/hooks/useAuth";

export default function Nav() {
  const { accessToken: token, logout, user } = useAuth();

  return (
    <ul>
      <li><Link href="/" className="font-bold">Workout Tracker</Link></li>
      <li><Link href="/">Home</Link></li>
      <li className="dropdown">
        <button className="dropbtn">Workouts</button>
        <div className="dropdown-content">
          <Link href="/workouts/select">Start a Workout</Link>
          <Link href="/workouts/new">Create a Workout</Link>
          <Link href="/workouts/select-for-later">Plan a Workout for Later</Link>
          <Link href="/workouts/select-planned">Start/View a Pre-Planned Workout</Link>
          <Link href="/workouts/log-past-start">Enter Information About a Past Workout</Link>
          <Link href="/workouts">Manage Workouts</Link>
          <Link href="/workouts/history">View Workout History</Link>
          <Link href="/workouts/in-progress">In-Progress Workouts</Link>
        </div>
      </li>
      <li className="dropdown">
        <button className="dropbtn">Exercises</button>
        <div className="dropdown-content">
          <Link href="/exercises/new">Create an Exercise</Link>
          <Link href="/exercises">Manage Exercises</Link>
        </div>
      </li>
      <li className="dropdown">
        <button className="dropbtn">Analytics</button>
        <div className="dropdown-content">
          <Link href="/analytics">Dashboard</Link>
          <Link href="/analytics/workouts">Workout Progress</Link>
        </div>
      </li>
      <li><Link href="/admin">Admin</Link></li>
      <li className="dropdown ml-auto">
        <button className="dropbtn">Welcome, {user?.name || "User"}!</button>
        <div className="dropdown-content">
          <Link href="/user/user-settings">Settings</Link>
        </div>
      </li>
      <li><button className="dropbtn" onClick={logout}>Logout</button></li>
    </ul>
  );
}
