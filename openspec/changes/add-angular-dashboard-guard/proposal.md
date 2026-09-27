## Why

The `/dashboard` route is the only page in the Angular app that calls the BFF, and it must never render for an anonymous visitor. Two defects stood in the way, both found in `angular-app/src/app/auth/`:

1. The guard in `auth.guard.ts` cannot work as written: `AuthService` seeds its `BehaviorSubject` with `isAuthenticated: false` and only fills it in after the async `GET /auth/me` call returns, while the guard uses `take(1)`. On every full page load the guard would read the initial `false` and redirect an already-authenticated user to `/login` while the auth check is still in flight.
2. The guard was never actually invoked: `app.routes.ts` registered it as `canActivate: [() => import("./auth/auth.guard").then((m) => m.authGuard)]`, and the Angular router awaits that promise to a *function* and treats it as "allow". `/dashboard` was reachable by anonymous visitors regardless of the guard's logic.

## What Changes

- Make `AuthService` expose an explicit "auth state resolved" signal (loading/settled state in addition to the current `isAuthenticated` value) so consumers can distinguish "not yet known" from "known to be anonymous".
- Rewrite `authGuard` to wait for the first resolved auth state, then allow navigation only when a user is present; otherwise block the route and redirect to `/login`.
- Keep the guard registered on the `/dashboard` route, switching `canActivate` from the ineffective lazy form to a static import so the guard actually runs.
- Guard against a hung or failing `/auth/me` request so navigation is never left pending (fail closed, redirect to `/login`).

## Capabilities

### New Capabilities
- `auth-route-guard`: Client-side route protection for the Angular app - the dashboard route is only reachable when a user is resolved, anonymous or unresolvable auth state redirects to the login page.

### Modified Capabilities

<!-- None: openspec/specs is currently empty, so there are no existing capabilities to amend. -->

## Impact

- `angular-app/src/app/auth/auth.service.ts` - add resolved/pending auth state to the public observable surface (`isAuthenticated$` stays for existing consumers: `AppComponent`, `HomeComponent`).
- `angular-app/src/app/auth/auth.guard.ts` - decision logic becomes "wait for resolved state, then allow or redirect".
- `angular-app/src/app/app.routes.ts` - `canActivate: [authGuard]` with a static import; the dashboard component stays lazy-loaded.
- No BFF, auth-service, or API contract changes; `/auth/me` keeps its current `{ isAuthenticated, user }` shape.
- Verification is limited to `ng build` / `ng lint`: `angular-app` has no spec files, no `tsconfig.spec.json`, and no Karma dev dependencies installed, so unit tests cannot be run without first scaffolding a test harness (out of scope here).
