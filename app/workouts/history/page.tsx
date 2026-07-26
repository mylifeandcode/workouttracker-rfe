'use client';

import { Suspense } from 'react'
import { useWorkoutHistory } from '@/lib/hooks/workouts/use-workout-history';

export default function Page() {
  const { workoutHistory, isLoading, error } = useWorkoutHistory();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading workout history</div>;

  return (
    <>
      <h1 className="p-1.5 bg-gradient-to-r from-[green] to-[#4cbb17] text-white">Workout History</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <table>
          <thead>
            <tr>
              <th>Workout Name</th>
              <th>Start Date/Time</th>
              <th>End Date/Time</th>
              <th>Notes/Journal</th>
            </tr>
          </thead>
          <tbody>
            {workoutHistory?.results?.map((workout) => (
              <tr key={workout.id}>
                <td>{workout.name}</td>
                <td>{workout.startDateTime}</td>
                <td>{workout.endDateTime}</td>
                <td>{workout.journal}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Suspense>
    </>
  )
}