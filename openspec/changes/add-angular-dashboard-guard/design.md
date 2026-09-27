## Context

- `AuthService` (`angular-app/src/app/auth/auth.service.ts`) holds a `BehaviorSubject<AuthState>` initialised to `{ isAuthenticated: false, user: null }` and kicks off `checkAuth()` from its constructor, which does `GET {auth.url}/auth/me`. The `user` field is `null` both while the request is in flight and when the visitor is genuinely anonymous, so the current value cannot express "not yet known".
- `authGuard` (`angular-app/src/app/auth/auth.guard.ts`) is wired as `canActivate` on `/dashboard` in `app.routes.ts`. It does `auth.isAuthenticated$.pipe(take(1), ...)`, which reads the seeded `false` synchronously and navigates to `/login` before the HTTP response arrives.
- **The existing wiring is a no-op.** `app.routes.ts` registered the guard as `canActivate: [() => import("./auth/auth.guard").then((m) => m.authGuard)]`. `runCanActivate` (`@angular/router` `fesm2022/_router-chunk.mjs:2587`) invokes each entry once and awaits the result; that entry resolves to a *function*, which `prioritizedGuardValue()` treats as "allow". The inner guard is never called, so `/dashboard` was reachable by anonymous visitors regardless of the guard's logic. Verified headlessly before the fix: `/dashboard` rendered `<app-dashboard>` with `/auth/me` reporting `isAuthenticated: false`.
- `isAuthenticated$` and `user$` are hand-wrapped `Observable`s over the subject (no teardown of the inner subscription); they are consumed by `AppComponent`, `HomeComponent`, and `DashboardComponent`. Those consumers should keep working unchanged.
- Angular 22 standalone app, functional guard + functional interceptor, `provideHttpClient(withInterceptors([authInterceptor]))`.
- `angular-app` has no spec files, no `tsconfig.spec.json`, and no Karma dev dependencies, so `npm test` cannot run today; `ng build` / `ng lint` are the available checks.

See `proposal.md` - Why for the motivation, and `specs/auth-route-guard/spec.md` for the required behavior.

## Goals / Non-Goals

**Goals:**
- Let the guard wait for the first *determined* auth state and then decide on the user.
- Keep the public auth observable surface additive so existing components are untouched.
- Fail closed: an errored or hung `/auth/me` must end in a redirect, never in a pending navigation.

**Non-Goals:**
- No test-harness scaffolding (no `tsconfig.spec.json`, no Karma deps, no spec files) - verification is build/lint plus manual checks.
- No `returnUrl` query param on the login redirect; the ask is only "redirect to login".
- No change to `/auth/me` in `auth-service`, to the BFF, or to its JWT validation.
- No SSR/hydration work, no `canMatch`/`canLoad` route-level guards on the lazy `loadComponent` bundles.

## Decisions

**1. Add an explicit "resolved" flag to the auth state instead of deriving it.**
Extend the internal state to `{ isAuthenticated, user, resolved }`, where `resolved` flips to `true` when `/auth/me` responds *or* errors. Expose it as a new public `authState$` (or `authResolved$`) stream and keep `isAuthenticated$` / `user$` derived from it.
- Why: the guard's bug is a missing third state, not a wrong comparison. Folding "unknown" into `isAuthenticated: false` is what caused the race; a separate flag makes the distinction unrepresentable-away.
- Alternative considered: keep the two booleans and expose a promise / `firstValueFrom` of the HTTP call. Rejected - it duplicates state and needs invalidation on logout and on session expiry.
- Alternative considered: read the session synchronously from a cookie. Rejected - the session cookie is httpOnly; the app genuinely cannot know until the request returns.

**2. Guard waits for the first resolved emission, then takes one value.**
`authState$.pipe(filter(s => s.resolved), take(1), map(s => s.user ? true : router.createUrlTree(['/login'])))`.
- Why: returning a `UrlTree` instead of `router.navigate(...)` + `false` lets the router own the redirect, avoids the extra imperative navigation, and prevents a redirect loop on the login route (which is unguarded).
- Alternative considered: `router.navigate()` + `return false`. Kept only as the fallback shape if returning `UrlTree` fights the current router version's typing; behaviour is identical.

**3. Hang protection via `timeout` on the auth stream, failing closed.**
Apply `timeout({ each: AUTH_TIMEOUT_MS, with: () => of(ANONYMOUS_STATE) })` before the `filter`, so a request that never settles produces a synthetic "resolved as anonymous" state and the visitor lands on `/login`.
- Note: the window must be `each`, not `first`. `authState$` is backed by a `BehaviorSubject`, so the seeded value is emitted synchronously on subscribe and a `first` window would be satisfied instantly and never fire. `each` measures the gap between emissions, which is what bounds a hung request.
- Why: an indefinitely pending guard leaves the router frozen on a blank outlet; failing closed matches the spec requirement that an undeterminable session is denied.
- Alternative considered: no timeout, relying on the browser's own failure. Rejected - `checkAuth` catches errors but a hung socket produces no event.

**4. `checkAuth` sets `resolved: true` in both the `next` and `error` handlers**, and is called once from the constructor as today.
- Why: minimal diff; the resolution semantics live in one place. Re-calling `checkAuth()` (e.g. after login) is a no-op improvement, not part of this change.

**5. Stop hand-wrapping the subject in `isAuthenticated$` / `user$`.** Derive them with `map` off the shared state stream.
- Why: the current `new Observable(...)` wrappers never unsubscribe the inner subscription, so a component with several `async` pipes creates several permanent subscriptions. Doing this in the same file we're already editing costs three lines and removes the leak.
- Trade-off: a small extra refactor inside a bug-fix change. Kept because we are rewriting the state shape anyway and the leak sits on the same three lines.

**6. Import the guard statically in `app.routes.ts` instead of lazily.** (Added during implementation; the original assumption that the route config needed no change was wrong.)
`canActivate: [authGuard]` with a top-level import.
- Why: the lazy arrow form silently allows navigation, so no guard logic can take effect until this is fixed. `AuthService` is already in the main bundle (`AppComponent` injects it), so the extra eager cost is the guard itself - 376 bytes raw in the production build, and its own `auth-guard` lazy chunk disappears.
- Alternative considered: keep the lazy guard by moving the dashboard route into a child route loaded via `loadChildren` whose route array imports the guard. Rejected - preserves a few hundred bytes at the cost of a new file and a nested route, and the dashboard chunk is already lazy on its own.
- Trade-off: `auth.guard.ts` can no longer be tree-shaken away entirely; it stays in the main bundle.

## Risks / Trade-offs

- **Redirect loop if a future change guards `/login` too** → the guard's redirect target is a single constant (`/login`), and the login route stays unguarded; note this in the code so a future guard author does not close the loop.
- **A user with a slow `/auth/me` waits on a blank outlet** → the guard blocks (no dashboard flash) and the spinner-less wait is short; a future improvement could render a loading shell, out of scope here.
- **Test coverage gap**: no runnable unit tests in `angular-app`, so the guard logic is verified by build plus headless browser navigation checks in the tasks.
- **`console.log` left in `DashboardComponent.loadData()`** is unrelated noise; leave it (do not widen the diff).

## Migration Plan

Frontend-only change with no API contract change: ship by rebuilding the Angular bundle. Rollback is a revert of `auth.service.ts` and `auth.guard.ts`; no server or persisted state is involved.

## Open Questions

- None that affect the specs, approach, or task breakdown. Whether to add `returnUrl` round-tripping and a Karma test harness are both independent follow-ups.
