'use client';

import { API_BASE_URL } from "@/config";
import useSWR from 'swr';
import { ExecutedWorkoutSummaryDTO } from '@/app/ui/workouts/executed-workout-summary-dto';
import { useAuth } from '../useAuth';
import { PaginatedResults } from "@/app/ui/shared/models/paginated-results";

const createFetcher = (token: string) => async (url: string) => {
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch workout history');
  }
  
  return response.json();
};

export function useWorkoutHistory(firstRecord: number = 0, pageSize: number = 10) {
  const { token } = useAuth();
  
  const { data, error, isLoading, mutate } = useSWR<PaginatedResults<ExecutedWorkoutSummaryDTO>>(
    token ? `${API_BASE_URL}/executedworkout?firstRecord=${firstRecord}&pageSize=${pageSize}` : null,
    token ? createFetcher(token) : null,
    {
      revalidateOnFocus: false,
      refreshInterval: 0,
    }
  );

  return {
    workoutHistory: data,
    isLoading,
    isError: error,
    refetch: mutate,
  };
}