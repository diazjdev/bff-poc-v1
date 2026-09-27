import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { filter, map, of, take, timeout } from "rxjs";
import { ANONYMOUS_STATE, AuthService } from "./auth.service";

const AUTH_TIMEOUT_MS = 5000;
const LOGIN_ROUTE = "/login";

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.authState$.pipe(
    // `each`, not `first`: the seeded value emits synchronously, so only the
    // gap between emissions bounds how long a hung /auth/me can stall us.
    timeout({ each: AUTH_TIMEOUT_MS, with: () => of(ANONYMOUS_STATE) }),
    filter((state) => state.resolved),
    take(1),
    // The login route stays unguarded; guarding it too would loop here.
    map((state) => (state.user ? true : router.createUrlTree([LOGIN_ROUTE]))),
  );
};
