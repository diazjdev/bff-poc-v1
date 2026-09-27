import { Component, inject } from "@angular/core";
import { MatCardModule } from "@angular/material/card";
import { MatButtonModule } from "@angular/material/button";
import { RouterLink } from "@angular/router";
import { AsyncPipe } from "@angular/common";
import { AuthService } from "../auth/auth.service";

@Component({
  selector: "app-home",
  standalone: true,
  imports: [MatCardModule, MatButtonModule, RouterLink, AsyncPipe],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>BFF POC</mat-card-title>
        <mat-card-subtitle>Backend For Frontend</mat-card-subtitle>
      </mat-card-header>
      <mat-card-content>
        <p>This is a proof of concept for a BFF architecture with:</p>
        <ul>
          <li>Express Auth Service (Auth0)</li>
          <li>Express BFF (JWT validation + API proxy)</li>
          <li>Angular Frontend</li>
        </ul>
      </mat-card-content>
      <mat-card-actions>
        @if (auth.isAuthenticated$ | async) {
          <a mat-raised-button color="primary" routerLink="/dashboard">Go to Dashboard</a>
        } @else {
          <a mat-raised-button color="primary" routerLink="/login">Login with Auth0</a>
        }
      </mat-card-actions>
    </mat-card>
  `,
})
export class HomeComponent {
  readonly auth = inject(AuthService);
}
