## 1. Auth state

- [x] 1.1 Extend the `AuthState` interface in `angular-app/src/app/auth/auth.service.ts` with a `resolved` flag and seed the `BehaviorSubject` with `resolved: false`; verify the file compiles under `ng build`
- [x] 1.2 Set `resolved: true` in both the `next` and `error` handlers of `checkAuth()` so a failed `/auth/me` still resolves as anonymous; verify by reading the handlers and building
- [x] 1.3 Expose the state as a single public stream and derive `isAuthenticated$` / `user$` from it with `map` (replacing the hand-wrapped `new Observable(...)` versions, which leak their inner subscription); verify `AppComponent`, `HomeComponent`, and `DashboardComponent` still type-check and `ng build` succeeds

## 2. Guard

- [x] 2.1 Rewrite `authGuard` in `angular-app/src/app/auth/auth.guard.ts` to wait for the first state with `resolved: true` (`filter` + `take(1)`) and return `true` only when a user is present; verify the `take(1)` on the raw stream is gone
- [x] 2.2 Return `router.createUrlTree(['/login'])` for the denied case instead of `router.navigate(...)` + `false`, keeping the login route unguarded so no redirect loop is possible; verified `app.routes.ts` still guards only the `dashboard` route
- [x] 2.3 Apply a `timeout` with a fallback "resolved as anonymous" state before the `filter` so a hung `/auth/me` fails closed; verify the guard type-checks and the fallback value is an anonymous state (window is `each`, not `first` - the `BehaviorSubject` seed emits synchronously, so a `first` window would never fire)
- [x] 2.4 Register the guard with `canActivate: [authGuard]` (static import) in `angular-app/src/app/app.routes.ts`; the previous lazy form `() => import("./auth/auth.guard").then((m) => m.authGuard)` is a no-op in Angular 22 (`runCanActivate` awaits a promise resolving to a function and treats it as "allow"), so the guard never ran and `/dashboard` was reachable anonymously. Verify: `ng build` succeeds, the `auth-guard` lazy chunk is gone, and a headless anonymous visit to `/dashboard` renders the login page instead of the dashboard

## 3. Verification

- [x] 3.1 Run `cd angular-app && npm run build` and confirm it completes with no errors (there are no runnable unit tests: no spec files, no `tsconfig.spec.json`, no Karma deps)
- [x] 3.2 Run `cd angular-app && npm run lint` if the project exposes a lint target, and confirm no new findings (verified: `angular.json` has no `lint` target and no ESLint package is installed, so there is nothing to run and no lint scaffolding was added)
- [ ] 3.3 Walk the scenarios with the stack running (`docker compose up`). Verified headlessly (Chrome `--dump-dom` against the live dev server on :4200): anonymous visit to `/dashboard` renders the login page, not the dashboard; a direct visit to `/login` renders the login page with no redirect loop; with `auth-service` stopped, `/dashboard` renders the login page. Still to confirm by hand: an authenticated user opening `/dashboard` sees the dashboard with no redirect, which needs a real Auth0 session and cannot be driven headlessly
