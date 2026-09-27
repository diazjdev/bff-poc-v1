import { Component, inject } from "@angular/core";
import { RouterOutlet, RouterLink, RouterLinkActive } from "@angular/router";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatButtonModule } from "@angular/material/button";
import { AuthService } from "./auth/auth.service";
import { AsyncPipe } from "@angular/common";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    AsyncPipe,
  ],
  template: `
    <mat-toolbar color="primary">
      <span>BFF POC</span>
      <span class="spacer"></span>
      <a mat-button routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">Home</a>
      @if (auth.isAuthenticated$ | async) {
        <a mat-button routerLink="/dashboard" routerLinkActive="active">Dashboard</a>
        <button mat-button (click)="logout()">Logout</button>
      } @else {
        <a mat-button routerLink="/login" routerLinkActive="active">Login</a>
      }
    </mat-toolbar>
    <router-outlet />
  `,
  styles: `
    :host {
      display: block;
    }
    .spacer {
      flex: 1 1 auto;
    }
    a.active {
      background-color: rgba(255, 255, 255, 0.1);
    }
  `,
})
export class AppComponent {
  readonly auth = inject(AuthService);

  logout(): void {
    this.auth.logout();
  }
}
