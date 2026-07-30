"use client";

// Error boundary for the history route. Must be a Client Component so React can
// catch render/fetch errors thrown by the Server Component and offer a retry.
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="p-4">
      <p>Error loading workout history.</p>
      <button
        onClick={reset}
        className="mt-2 bg-blue-600 text-white px-4 py-2 rounded"
      >
        Try again
      </button>
    </div>
  );
}
