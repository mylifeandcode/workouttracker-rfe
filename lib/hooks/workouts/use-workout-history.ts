'use client';

import useSWR from 'swr';
import { getApiExecutedWorkoutResponseTransformer } from "@/lib/api/transformers.gen";
import { GetApiExecutedWorkoutResponse } from "@/lib/api/types.gen";

export function useWorkoutHistory(firstRecord: number = 0, pageSize: number = 10) {
  // The request goes to the same-origin BFF proxy; the httpOnly auth cookie rides
  // along automatically, so there is no token to read or Authorization header to set.
  const { data, error, isLoading, mutate } = useSWR<GetApiExecutedWorkoutResponse>(
    ['/api/proxy/executedworkout', firstRecord, pageSize],
    ([url, firstRecord, pageSize]) =>
      fetch(`${url}?firstRecord=${firstRecord}&pageSize=${pageSize}`).then(res => {
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
