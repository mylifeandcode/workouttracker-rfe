'use client';

import { API_BASE_URL } from "@/config";
import useSWR from 'swr';
import { ExecutedWorkoutSummaryDTO } from '@/app/ui/workouts/executed-workout-summary-dto';
import { useAuth } from '../useAuth';
import { PaginatedResults } from "@/app/ui/shared/models/paginated-results";
import { getApiExecutedWorkoutResponseTransformer } from "@/lib/api/transformers.gen";
import { GetApiExecutedWorkoutResponse } from "@/lib/api/types.gen";

const createFetcher = (token: string) => async (url: string) => {
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} Failed to fetch workout history`);
  }
  
  return response.json();
};

export function useWorkoutHistory(firstRecord: number = 0, pageSize: number = 10) {
  const { accessToken: token } = useAuth();
  
  const { data, error, isLoading, mutate } = useSWR<GetApiExecutedWorkoutResponse>(
    token ? [`${API_BASE_URL}/executedworkout`, token, firstRecord, pageSize] : null,
    ([url, token, firstRecord, pageSize]) =>
      fetch(`${url}?firstRecord=${firstRecord}&pageSize=${pageSize}`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json().then(getApiExecutedWorkoutResponseTransformer);
      }),
    { revalidateOnFocus: false, refreshInterval: 0 }
  );

  return {
    workoutHistory: data,
    isLoading,
    error: error,
    refetch: mutate,
  };
}