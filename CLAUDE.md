# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev            # Dev server with Turbopack (http://localhost:3000)
npm run build          # Production build
npm run start          # Serve production build
npm run lint           # ESLint (next/core-web-vitals)
npm run test           # Vitest unit/component tests (watch mode)
npm run test:run       # Vitest, single run
npm run test:e2e       # Playwright E2E (needs the .NET API running — see Testing)
npm run gen-api-models # Regenerate lib/api/* from the backend Swagger spec
```

## Backend dependency

This Next.js app owns **no data** — it has only a thin server tier (the BFF: auth route handlers, a data proxy, and middleware; see Authentication). All persistence and business logic live in a separate .NET backend (the WorkoutTracker API) expected at `http://localhost:5600`:

- REST base URL: `http://localhost:5600/api`, configured via `NEXT_PUBLIC_API_BASE_URL` (see `config.ts` and `.env.*`). Import the base URL from `@/config`, not from `process.env` directly.
- Swagger spec: `http://localhost:5600/swagger/v1/swagger.json`. The backend must be running to regenerate API models.

`npm run gen-api-models` (config in `openapi-ts.config.ts`) reads the live Swagger doc and overwrites `lib/api/` (`types.gen.ts`, `transformers.gen.ts`, `index.ts`). **Never hand-edit files in `lib/api/` — they are auto-generated.** The transformers exist to convert JSON date strings into `Date` objects; call the matching `*Transformer` on a fetch response when you need real `Date` values.

## Architecture

Next.js 15 App Router, React 19, TypeScript (strict), Tailwind CSS v4. Path alias `@/*` maps to the repo root.

### Authentication (BFF — httpOnly cookies + server-side)

The app uses a **backend-for-frontend (BFF)** pattern: the JWT pair lives in **httpOnly cookies owned by the Next.js server**, never in the browser. The `.NET` API stays bearer-only and unchanged — Next holds the tokens and forwards them server-to-server. The browser→Next hop is same-origin; the Next→API hop carries the `Authorization: Bearer` header.

- **Cookies** `wt_access` / `wt_refresh` — names and attributes in `lib/auth/constants.ts` (`httpOnly`, `SameSite=Lax`, `Secure` in production, both a 7-day maxAge so a possibly-expired access token is still available to send to `/auth/refresh`).
- **`app/api/auth/login/route.ts`** — exchanges credentials with the .NET API and sets the cookies. The login page (`app/login/page.tsx`) POSTs here **same-origin**, never to `:5600` directly, then `router.replace("/")` + `router.refresh()` so the server layout re-reads the new session.
- **`app/api/auth/logout/route.ts`** — best-effort server-side revoke, then clears the cookies.
- **`middleware.ts`** — global server-side route protection (unauthenticated → `/login`; logged-in-on-`/login` → `/`) **plus proactive token refresh**: it decodes the access token's `exp` and, if expired, calls `/auth/refresh` and redirects with rotated cookies (a Server Component can't set cookies, so refresh must happen here). Runs on the **Edge**, so it imports only edge-safe modules.
- **`lib/auth/session.ts`** (`server-only`) — `getSessionUser()` reads the access cookie and decodes the display user. JWT claims use full XML-schema/Microsoft URIs plus custom `UserID`/`UserPublicID`. `app/layout.tsx` is an async Server Component that calls it and passes `user` into the provider.
- **`app/contexts/auth.tsx`** — `AuthProvider` is now a thin **client** context: it receives `user` from the server layout and exposes `{ user, isAuthenticated, logout }`. No tokens, no `localStorage`, no client-side `jwt-decode`. `lib/hooks/useAuth.ts` (`useAuth()`) is the accessor; it throws outside the provider.

**Edge-safe vs server-only split (important):** `lib/auth/constants.ts` (cookie names + `cookieOptions`) and `lib/auth/jwt.ts` (`isExpired`) are dependency-free and safe to import from Edge middleware. `lib/auth/session.ts` and `lib/auth/server-fetch.ts` are `server-only` (they use `next/headers`). **Middleware must import only the edge-safe modules.**

### Data fetching (through the BFF)

All data flows through the Next server; the browser never sends a `Bearer` header. Two paths:

- **Server Components (preferred for reads):** `lib/auth/server-fetch.ts` `serverApiFetch(path, init?)` reads the access cookie and calls the .NET API directly with `Authorization: Bearer` and `cache: "no-store"`. Example: `app/workouts/history/page.tsx` is an async RSC that fetches this way and renders server-side, with `loading.tsx` / `error.tsx` beside it.
- **Client components:** call the same-origin proxy `app/api/proxy/[...path]/route.ts` — it attaches the Bearer from the cookie, forwards to the .NET API, and on a `401` does a reactive refresh + retry (re-setting the rotated cookies). Fetch `/api/proxy/<apiPath>` with **no** auth header; the httpOnly cookie rides along automatically.

Run responses that need real `Date`s through the matching generated transformer. `swr` is installed for future client-side data hooks but nothing uses it yet (the former SWR history hook was replaced by the RSC above).

### Types / DTOs

The **generated** types in `lib/api/types.gen.ts` (re-exported from `lib/api/index.ts`) are the single source of truth, mirroring the backend. The older hand-written DTO classes were removed — don't reintroduce parallel hand-maintained models; change the backend DTO and run `npm run gen-api-models` instead.

### Routing & UI

Routes live under `app/**/page.tsx` following App Router conventions. **Route protection is global via `middleware.ts`** — there is no per-page auth wrapper (the old `RequireAuth` component was removed), so every route except `/login` and `/api/*` is protected automatically. `app/ui/nav.tsx` is the canonical map of intended features (Workouts, Exercises, Analytics, Admin, Settings). Many linked pages are still stubs — `app/ui/under-construction.tsx` is the placeholder component. Styling is Tailwind utility classes plus global CSS in `app/globals.css`; nav dropdown styles (`dropdown`, `dropbtn`, `dropdown-content`) are defined there.

## Testing

- **Unit / component — Vitest + React Testing Library.** `npm run test` (watch) / `npm run test:run` (once). Config in `vitest.config.mts` (jsdom, `@/*` alias, excludes `e2e/**`); matchers registered in `vitest.setup.ts`. Tests are co-located as `*.test.ts(x)`. Good targets are pure logic (`lib/auth/*`) and client components. **Async Server Components are not unit-testable** — cover those with E2E.
- **E2E — Playwright.** `npm run test:e2e` (config `playwright.config.ts`, specs in `e2e/`). A `setup` project logs in and saves the session cookies (`storageState`); the suite reuses them. `webServer` auto-starts `npm run dev` but **not** the .NET API — start that on `:5600` yourself, then pass `E2E_USERNAME` (a seeded user that **has a password** — the RFE implements the username/password login, not the passwordless user-select flow), e.g. `E2E_USERNAME=<user> npx playwright test`.
