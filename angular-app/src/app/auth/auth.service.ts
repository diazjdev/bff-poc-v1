import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
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
}

@Injectable({ providedIn: "root" })
export class AuthService {
  private readonly http = inject(HttpClient);

  private readonly authState$ = new BehaviorSubject<AuthState>({
    isAuthenticated: false,
    user: null,
  });

  readonly isAuthenticated$: Observable<boolean> = new Observable(
    (observer) => {
      this.authState$.subscribe((state) =>
        observer.next(state.isAuthenticated),
      );
    },
  );

  readonly user$: Observable<AuthUser | null> = new Observable((observer) => {
    this.authState$.subscribe((state) => observer.next(state.user));
  });

  constructor() {
    this.checkAuth();
  }

  checkAuth(): void {
    this.http
      .get<AuthState>(`${environment.auth.url}/auth/me`, {
        withCredentials: true,
      })
      .subscribe({
        next: (response) => {
          this.authState$.next({
            isAuthenticated: response.isAuthenticated,
            user: response.user,
          });
        },
        error: () => {
          this.authState$.next({
            isAuthenticated: false,
            user: null,
          });
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
