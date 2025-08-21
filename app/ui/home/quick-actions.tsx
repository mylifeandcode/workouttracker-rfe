import Link from 'next/link'

export default function QuickActions() {
  return (
    <div className="widget">
      <h3>Quick Actions</h3>
      <div className="flex flex-col items-center gap-2 mt-4 w-full mx-auto">
        <Link href="/workouts/select-for-later" className="w-full">
          <button className="w-full bg-blue-500 text-white px-2 py-2 rounded">
            Plan a Workout for Later
          </button>
        </Link>
        <Link href="/workouts/history" className="w-full">
          <button className="w-full bg-green-700 text-white px-2 py-2 rounded">
            View History
          </button>
        </Link>
        <Link href="/workouts" className="w-full">
          <button className="w-full bg-purple-800 text-white px-2 py-2 rounded">
            Manage Workouts
          </button>
        </Link>
        <Link href="/exercises" className="w-full">
          <button className="w-full bg-red-500 text-white px-2 py-2 rounded">
            Manage Exercises
          </button>
        </Link>
      </div>
    </div>
  );
}