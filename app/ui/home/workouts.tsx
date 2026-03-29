import Link from "next/link";

export default function Workouts() {
  return (
    <div className="widget">
      <h3>Workouts</h3>
      <div className="flex flex-col items-center gap-2 mt-4 w-full max-w-xs mx-auto">
        <Link href="/workouts/select" className="w-full block bg-blue-600 text-white px-4 py-2 rounded text-center">
          Start a new Workout
        </Link>
        <Link href="/workouts/select-planned" className="w-full block bg-blue-900 text-white px-4 py-2 rounded text-center">
          Start a Pre-Planned Workout
        </Link>
      </div>
    </div>
  );
}