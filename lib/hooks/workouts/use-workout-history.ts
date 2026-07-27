'use client';

import { API_BASE_URL } from "@/config";
import useSWR from 'swr';
import { useAuth } from '../useAuth';
import { getApiExecutedWorkoutResponseTransformer } from "@/lib/api/transformers.gen";
import { GetApiExecutedWorkoutResponse } from "@/lib/api/types.gen";

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