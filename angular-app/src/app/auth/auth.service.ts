import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { BehaviorSubject, Observable, map } from "rxjs";
import { environment } from "../../environments/environment";

export interface AuthUser {
  sub: string;
  email: string;
  name: string;
  picture?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  resolved: boolean;
}

export type AuthMeResponse = Pick<AuthState, "isAuthenticated" | "user">;

export const UNRESOLVED_STATE: AuthState = {
  isAuthenticated: false,
  user: null,
  resolved: false,
};

export const ANONYMOUS_STATE: AuthState = {
  isAuthenticated: false,
  user: null,
  resolved: true,
};

@Injectable({ providedIn: "root" })
export class AuthService {
  private readonly http = inject(HttpClient);

  private readonly state$ = new BehaviorSubject<AuthState>(UNRESOLVED_STATE);

  readonly authState$: Observable<AuthState> = this.state$.asObservable();

  readonly isAuthenticated$: Observable<boolean> = this.authState$.pipe(
    map((state) => state.isAuthenticated),
  );

  readonly user$: Observable<AuthUser | null> = this.authState$.pipe(
    map((state) => state.user),
  );

  constructor() {
    this.checkAuth();
  }

  checkAuth(): void {
    this.http
      .get<AuthMeResponse>(`${environment.auth.url}/auth/me`, {
        withCredentials: true,
      })
      .subscribe({
        next: (response) => {
          this.state$.next({ ...response, resolved: true });
        },
        error: () => {
          this.state$.next(ANONYMOUS_STATE);
        },
      });
  }

  login(): void {
    window.location.href = `${environment.auth.url}/auth/login`;
  }

  logout(): void {
    window.location.href = `${environment.auth.url}/auth/logout`;
  }
}
