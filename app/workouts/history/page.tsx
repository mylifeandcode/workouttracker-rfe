import { redirect } from "next/navigation";
import { serverApiFetch } from "@/lib/auth/server-fetch";
import { getApiExecutedWorkoutResponseTransformer } from "@/lib/api/transformers.gen";

// Server Component: fetches on the server with the session cookie's token, so no
// data-fetching JS ships to the browser. Middleware guarantees a fresh token, so a
// 401 here means the session is genuinely gone.
export default async function Page() {
  const res = await serverApiFetch("executedworkout?firstRecord=0&pageSize=10");

  if (res.status === 401) redirect("/login");
  if (!res.ok) throw new Error(`Failed to load workout history (HTTP ${res.status})`);

  const history = await getApiExecutedWorkoutResponseTransformer(await res.json());

  return (
    <>
      <h1 className="p-1.5 bg-gradient-to-r from-[green] to-[#4cbb17] text-white">Workout History</h1>
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
          {history?.results?.map((workout) => (
            <tr key={workout.id}>
              <td>{workout.name}</td>
              <td>{workout.startDateTime?.toLocaleString()}</td>
              <td>{workout.endDateTime?.toLocaleString()}</td>
              <td>{workout.journal}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
