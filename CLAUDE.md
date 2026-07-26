# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev            # Dev server with Turbopack (http://localhost:3000)
npm run build          # Production build
npm run start          # Serve production build
npm run lint           # ESLint (next/core-web-vitals)
npm run gen-api-models # Regenerate lib/api/* from the backend Swagger spec
```

There is no test runner configured in this project.

## Backend dependency

This is a **frontend-only** Next.js app. It talks to a separate .NET backend (the WorkoutTracker API) expected at `http://localhost:5600`:

- REST base URL: `http://localhost:5600/api`, configured via `NEXT_PUBLIC_API_BASE_URL` (see `config.ts` and `.env.*`). Import the base URL from `@/config`, not from `process.env` directly.
- Swagger spec: `http://localhost:5600/swagger/v1/swagger.json`. The backend must be running to regenerate API models.

`npm run gen-api-models` (config in `openapi-ts.config.ts`) reads the live Swagger doc and overwrites `lib/api/` (`types.gen.ts`, `transformers.gen.ts`, `index.ts`). **Never hand-edit files in `lib/api/` — they are auto-generated.** The transformers exist to convert JSON date strings into `Date` objects; call the matching `*Transformer` on a fetch response when you need real `Date` values.

## Architecture

Next.js 15 App Router, React 19, TypeScript (strict), Tailwind CSS v4. Path alias `@/*` maps to the repo root.

### Authentication (client-side, JWT in localStorage)

There is no Next.js middleware or server-side auth. Everything runs in the browser:

- `app/contexts/auth.tsx` — `AuthProvider` holds `accessToken`/`refreshToken`, persists them to `localStorage`, and decodes the access token with `jwt-decode` to populate `user`. JWT claims use full XML-schema/Microsoft claim URIs (e.g. `http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name`, plus custom `UserID`/`UserPublicID`) — reference the existing `*_KEY` constants when reading claims.
- `lib/hooks/useAuth.ts` — `useAuth()` is the standard accessor for the auth context; it throws if used outside the provider.
- `app/contexts/require-auth.tsx` — `RequireAuth` redirects to `/login` when there is no access token. It is applied **per page** (wrap a page's JSX in `<RequireAuth>`), not globally, so new protected pages must opt in themselves.
- `app/layout.tsx` wraps everything in `AuthProvider`; `app/layout-content.tsx` renders the `Nav` only when authenticated.
- Login (`app/login/page.tsx`) POSTs to `/auth/login` and stores the returned `AuthTokenResultDTO` tokens. Token refresh via the refresh token is not yet wired up.

### Data fetching (SWR + manual Bearer auth)

Feature data is loaded through SWR hooks under `lib/hooks/**` (e.g. `use-workout-history.ts`). The pattern: read `accessToken` from `useAuth()`, key the SWR call on the token (`null` key when unauthenticated so it doesn't fire), `fetch` with an `Authorization: Bearer <token>` header, and run the response through the generated transformer. There is no shared fetch wrapper yet — each hook attaches the header itself.

### Types / DTOs — two parallel worlds

1. **Generated** types in `lib/api/types.gen.ts` — the source of truth mirroring the backend, re-exported from `lib/api/index.ts`.
2. **Hand-written** DTO classes under `app/ui/**/models` and `app/ui/**` (e.g. `PaginatedResults<T>`, `ExecutedWorkoutSummaryDTO`, `NamedEntityDTO`) that predate/overlap the generated types. Prefer the generated types for new code; be aware some hooks still reference the hand-written classes.

### Routing & UI

Routes live under `app/**/page.tsx` following App Router conventions. `app/ui/nav.tsx` is the canonical map of intended features (Workouts, Exercises, Analytics, Admin, Settings). Many linked pages are still stubs — `app/ui/under-construction.tsx` is the placeholder component. Styling is Tailwind utility classes plus global CSS in `app/globals.css`; nav dropdown styles (`dropdown`, `dropbtn`, `dropdown-content`) are defined there.
