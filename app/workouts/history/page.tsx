'use client';

import { ExecutedWorkoutSummaryDTO } from '@/app/ui/workouts/executed-workout-summary-dto'
import { Suspense } from 'react'
import { useWorkoutHistory } from '@/lib/hooks/workouts/useWorkoutHistory';
 
export default function Page() {
  const { workoutHistory, isLoading, isError } = useWorkoutHistory();

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading workout history</div>;

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ul>
        {workoutHistory?.results?.map((workout) => (
          <li key={workout.id}>{workout.name}</li>
        ))}
      </ul>
    </Suspense>
  )
}