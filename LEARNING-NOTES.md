# Workout Tracker RFE — Learning Notes

A study guide distilled from the refactor + BFF + testing session, written for an Angular
architect learning React/Next.js. Organized by concept, with the *why* emphasized. Skim the
headings; dive into whatever you want to re-cement.

> Companion docs: [CLAUDE.md](CLAUDE.md) is the authoritative current-state reference. This file
> is the *narrative + concepts* — why things are the way they are.

---

## The arc, in one paragraph

We started with a client-side SPA (JWT in `localStorage`, all fetching in the browser), fixed a
batch of React/Next idiom issues, then migrated auth to a **BFF** (backend-for-frontend: tokens in
httpOnly cookies owned by the Next server), moved route protection to `middleware.ts`, converted a
data read to a **React Server Component**, and stood up **Vitest** (unit) + **Playwright** (E2E)
testing. The .NET backend never changed.

---

## Part 1 — React / Next.js idioms (the best-practice fixes)

Each of these is a transferable idiom, not just a one-off fix.

### 1. Derive state, don't mirror it with an effect
**Bug:** `user` was stored in `useState` and set inside a mount `useEffect` that decoded the JWT.
After login (client-side nav, no reload) the effect didn't re-run, so the nav showed "Welcome,
User!" until refresh.
**Idiom:** if a value is a pure function of other state, **compute it during render** (`useMemo`),
don't copy it into separate state and sync via an effect.
**Angular parallel:** like a `computed()` signal vs. manually re-assigning a field in a subscription.

### 2. Memoize context values
**Problem:** `<AuthContext.Provider value={{...}}>` created a fresh object every render, and its
functions had new identities each time → *every* `useAuth()` consumer re-rendered on any provider
render.
**Idiom:** wrap the value in `useMemo` and callbacks in `useCallback` so the reference is stable.
**Angular parallel:** DI doesn't have this pitfall — Angular gives you one service instance. React
context passes a *value*, so reference identity matters.

### 3–5. Remove dead code / delete superseded models
Unused functions, imports, and the hand-written DTO classes (superseded by the generated
`lib/api/*` types) were deleted. Lesson: generated types from the backend OpenAPI doc are the
single source of truth — don't maintain a parallel hand-written set.

### 6. Use one typed accessor (`useAuth()`), not raw `useContext`
`useContext(AuthContext)` returns `T | undefined`, forcing defensive `?.` and `|| {}` and dead
`=== undefined` branches. `useAuth()` **throws** if used outside the provider, so it returns a
**non-nullable** value — and all that defensive noise disappears. A well-typed accessor removes a
whole category of "just in case" code.

### JSX interpolation only renders `ReactNode`s
`{workout.startDateTime}` failed because the transformer produces a `Date`, and **React won't
render a raw object** (and, unlike Angular's `{{ }}`, won't auto-`toString()` it). Fix: format to a
string yourself — `date?.toLocaleString()`.

### The ineffective `<Suspense>`
A `<Suspense>` only does something if a child actually *suspends* (throws a promise). SWR in default
mode reports `isLoading` instead, so the boundary was dead. **Pick one model** — imperative
`isLoading` checks *or* Suspense + an error boundary, not both.

---

## Part 2 — The BFF migration (the big one)

### Why
Client-side JWT-in-`localStorage` is readable by any XSS and throws away Next's server tier. The
**BFF** pattern puts the token pair in **httpOnly cookies owned by the Next server**; the browser
never sees a token. The .NET API stays bearer-only and unchanged — the browser talks to Next
(same-origin), and Next talks to the API server-to-server.

### The request flow
```
Browser ──POST /api/auth/login──► Next route handler ──► .NET /api/Auth/login
        ◄── Set-Cookie: wt_access, wt_refresh (httpOnly) ──┘
Browser ──/api/proxy/… (cookie rides along)──► Next proxy ──Bearer──► .NET API
Server Component ── reads cookie via getSessionUser() / serverApiFetch() ──► .NET API
middleware.ts (Edge) ── guards every route + refreshes expired tokens ──► before render
```

### The phases
1. **Tokens off the browser** — login/logout route handlers set/clear httpOnly cookies; the client
   `AuthProvider` slimmed to just `{ user, isAuthenticated, logout }` with `user` supplied by the
   async server layout (`getSessionUser`).
2. **Proxy** (folded into phase 1) — `app/api/proxy/[...path]/route.ts` attaches the Bearer from the
   cookie and does reactive `401 → refresh → retry`.
3. **Route protection** — `middleware.ts` replaced the per-page `RequireAuth` client gate with a
   server-side guard (no flash, uniform across all routes).
4. **RSC data fetching** — the history page became an async Server Component using `serverApiFetch`.

### The two hard constraints (the real lessons)
- **Server Components can't set cookies.** Only route handlers, Server Actions, and middleware can.
  That's *why* token refresh had to move into `middleware.ts` (proactive: decode `exp`, refresh,
  redirect with fresh cookies) once reads became RSCs — the RSC itself can't refresh in place.
- **Middleware runs on the Edge runtime**, which has only web-standard APIs (no `next/headers`, no
  Node built-ins). That forced the **edge-safe vs server-only module split**:
  - Edge-safe (importable by middleware): `lib/auth/constants.ts` (cookie names + options),
    `lib/auth/jwt.ts` (`isExpired`).
  - `server-only` (uses `next/headers`): `lib/auth/session.ts`, `lib/auth/server-fetch.ts`.

### Cookie detail worth remembering
Both cookies use a **7-day** maxAge (the refresh lifetime), not the 120-min access lifetime — the
server must still hold the (possibly expired) access token to send to `/auth/refresh`, which uses
it to identify the user.

---

## Part 3 — Testing

- **Vitest + React Testing Library** for units/components. RTL tests *through the DOM* like a user
  (`getByRole`, `userEvent`) rather than poking internals — your `TestBed` muscle memory (render →
  interact → assert) transfers; you mock the framework seams (`next/navigation`, `fetch`).
- **Playwright** for E2E — needed because **async Server Components aren't unit-testable**. It drives
  a real browser against the running app + real API, covering middleware → cookies → server render.
- **The split principle:** unit-test what runs in isolation; E2E-test what only makes sense with the
  whole stack wired together.
- **Gotcha:** E2E login needs a user that *has a password* — the RFE only implements the
  username/password flow, not the Angular app's passwordless user-select flow.

---

## Concepts we dug into (the Q&A, distilled)

### Convention over configuration (the `export const config` in middleware)
Next reads certain **named exports by convention** — `config` (middleware matcher), `metadata`
(page/layout `<head>`), `dynamic`/`revalidate`, etc. Nothing in your code imports them; the
*framework* reflects over them at build time. Same philosophy as ASP.NET MVC attributes / Angular
`@NgModule` metadata — declarative config the framework consumes. The name is reserved and the value
must be statically analyzable.

### "Edge" is not the client/server line
Edge is a **kind of server runtime** (lightweight, web-standard APIs, deployed close to users), not
the boundary between browser and server. Three tiers in this app: **browser (client)** → **Edge
runtime (middleware)** → **Node runtime (Server Components, route handlers)** → .NET API. Middleware
is server-side, just a stripped-down runtime that runs first, near the user.

### The client/server boundary is `"use client"`
Separate axis from Edge. Server Components (no directive) run on the server and **never ship to the
browser**; Client Components (`"use client"`) run in the browser.

### SSR vs. React Server Components (they're different!)
- **SSR** (what Angular also has): renders components to HTML on the server for first paint, then
  ships the component JS and **hydrates** it in the browser. The code runs in *both* places.
- **RSC** (new, no Angular analogue): the component runs **only on the server**, its code **never
  ships**, and it doesn't hydrate. You opt into client interactivity with `"use client"`.
- They're orthogonal — Next does both (client components are SSR'd + hydrated; server components are
  server-only). The genuinely new mental model is RSC, not SSR.

### SWR = "stale-while-revalidate"
A keyed, global cache for **server state**: return cached (possibly stale) data instantly, revalidate
in the background, swap in fresh. Gives dedup, caching, revalidation-on-focus/reconnect/interval, and
`mutate` for free. Manages *server state* (remote, cacheable) as distinct from *UI state*
(`useState`). Ecosystem cousin of TanStack Query / `@ngneat/query`.

### `as unknown as` is a double cast — avoid it
It switches off the type checker entirely. In tests prefer: a **real object** (`new Response(...)`),
a **narrowed type** (`Pick<T, "usedField">`), or a **typed mock** (`vi.fn<typeof fetch>()`) +
`vi.stubGlobal`. The payoff: when we typed the fetch mock properly, TS immediately caught an unsafe
`.body` access the cast had been hiding — that's the whole point.

### `@testing-library/jest-dom` is not the Jest runner
It's a runner-agnostic library of **DOM matchers** (`toBeInTheDocument`, `toHaveValue`). The name is
legacy (built for Jest first). It plugs into Vitest via its `/vitest` entry. Vitest deliberately
mirrors Jest's API, which is why Jest-era tooling and tutorials drop in almost unchanged.

---

## How to run everything

```bash
npm run dev            # dev server (http://localhost:3000)
npm run build          # production build
npm run lint           # ESLint
npm run test           # Vitest (watch)
npm run test:run       # Vitest (once)
npm run test:e2e       # Playwright (start the .NET API on :5600 first; set E2E_USERNAME to a
                       #   seeded user WITH A PASSWORD)
npm run gen-api-models # regenerate lib/api/* from the backend OpenAPI doc
```

The .NET backend (separate solution) must be running on `http://localhost:5600` for real data,
login, and E2E.

---

## Angular → React/Next quick translations

| Angular | React / Next (this app) |
|---|---|
| `computed()` signal | derive during render (`useMemo`), not effect-synced state |
| DI singleton service | React Context (but **memoize the value** — reference identity matters) |
| Route guard (`CanActivate`) | `middleware.ts` (server-side, before render) |
| HTTP interceptor (Bearer) | the BFF proxy attaches the Bearer server-side |
| `{{ expr }}` (auto-stringifies) | `{expr}` renders only `ReactNode`s — stringify objects yourself |
| `@NgModule` / attribute metadata | convention exports (`config`, `metadata`, …) |
| Karma/Jasmine + `TestBed` (scaffolded) | Vitest + RTL (assembled yourself) |
| SSR (Angular Universal) | SSR *and* RSC (RSC = server-only components, the new part) |
| TanStack Query / `@ngneat/query` | SWR |

---

## Where to go next

- **Server Actions** for writes (create a workout/exercise) — the write-side complement to the RSC
  reads. The next idiomatic thing to learn.
- Port (or intentionally skip) the **passwordless user-select login** flow the Angular app has.
- Backend hygiene (separate repo): `SimpleLogin=true` bypasses passwords; `Jwt:Key` is plaintext in
  `appsettings.json`.
- Optional hardening: proxy single-flight refresh, a shared client fetcher, `?redirect=` return-URL
  after login — all worth doing once more features justify them.
