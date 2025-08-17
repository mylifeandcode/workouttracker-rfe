export default function Workouts() {
  return (
    <div className="widget">
      <h3>Workouts</h3>
      <div className="flex flex-col items-center gap-2 mt-4 w-full max-w-xs mx-auto">
        <button className="w-full bg-blue-500 text-white px-4 py-2 rounded">Start Workout</button>
        <button className="w-full bg-green-500 text-white px-4 py-2 rounded">View History</button>
      </div>
    </div>
  );  
}