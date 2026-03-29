import Link from 'next/link'

export default function QuickActions() {
  return (
    <div className="widget">
      <h3>Quick Actions</h3>
      <div className="flex flex-col items-center gap-2 mt-4 w-full mx-auto">
        <Link href="/workouts/select-for-later" className="w-full block bg-blue-500 text-white px-2 py-2 rounded text-center">
          Plan a Workout for Later
        </Link>
        <Link href="/workouts/history" className="w-full block bg-green-700 text-white px-2 py-2 rounded text-center">
          View History
        </Link>
        <Link href="/workouts" className="w-full block bg-purple-800 text-white px-2 py-2 rounded text-center">
          Manage Workouts
        </Link>
        <Link href="/exercises" className="w-full block bg-red-500 text-white px-2 py-2 rounded text-center">
          Manage Exercises
        </Link>
      </div>
    </div>
  );
}