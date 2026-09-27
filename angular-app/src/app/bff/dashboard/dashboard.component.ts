import { Component, OnInit, inject } from "@angular/core";
import { MatCardModule } from "@angular/material/card";
import { MatTableModule } from "@angular/material/table";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { BffService, BffUser, BffProduct } from "../bff.service";
import { AuthService } from "../../auth/auth.service";
import { AsyncPipe } from "@angular/common";

@Component({
  selector: "app-dashboard",
  standalone: true,
  imports: [
    MatCardModule,
    MatTableModule,
    MatProgressSpinnerModule,
    AsyncPipe,
  ],
  template: `
    <div class="dashboard-container">
      @if (loading) {
        <mat-spinner diameter="50" />
      } @else {
        <mat-card>
          <mat-card-header>
            <mat-card-title>
              Welcome, {{ (auth.user$ | async)?.name }}
            </mat-card-title>
            <mat-card-subtitle>Dashboard</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <p>You are authenticated via Auth0.</p>
          </mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-header>
            <mat-card-title>Users</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            @if (users.length > 0) {
              <table mat-table [dataSource]="users">
                <ng-container matColumnDef="displayName">
                  <th mat-header-cell *matHeaderCellDef>Name</th>
                  <td mat-cell *matCellDef="let user">{{ user.displayName }}</td>
                </ng-container>
                <ng-container matColumnDef="email">
                  <th mat-header-cell *matHeaderCellDef>Email</th>
                  <td mat-cell *matCellDef="let user">{{ user.email }}</td>
                </ng-container>
                <ng-container matColumnDef="role">
                  <th mat-header-cell *matHeaderCellDef>Role</th>
                  <td mat-cell *matCellDef="let user">{{ user.role }}</td>
                </ng-container>
                <tr mat-header-row *matHeaderRowDef="userColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: userColumns"></tr>
              </table>
            } @else {
              <p>No users found.</p>
            }
          </mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-header>
            <mat-card-title>Products</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            @if (products.length > 0) {
              <table mat-table [dataSource]="products">
                <ng-container matColumnDef="name">
                  <th mat-header-cell *matHeaderCellDef>Name</th>
                  <td mat-cell *matCellDef="let product">{{ product.name }}</td>
                </ng-container>
                <ng-container matColumnDef="formattedPrice">
                  <th mat-header-cell *matHeaderCellDef>Price</th>
                  <td mat-cell *matCellDef="let product">{{ product.formattedPrice }}</td>
                </ng-container>
                <ng-container matColumnDef="category">
                  <th mat-header-cell *matHeaderCellDef>Category</th>
                  <td mat-cell *matCellDef="let product">{{ product.category }}</td>
                </ng-container>
                <tr mat-header-row *matHeaderRowDef="productColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: productColumns"></tr>
              </table>
            } @else {
              <p>No products found.</p>
            }
          </mat-card-content>
        </mat-card>
      }
    </div>
  `,
  styles: `
    .dashboard-container {
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    table {
      width: 100%;
    }
  `,
})
export class DashboardComponent implements OnInit {
  private readonly bff = inject(BffService);
  readonly auth = inject(AuthService);

  users: BffUser[] = [];
  products: BffProduct[] = [];
  loading = true;
  readonly userColumns = ["displayName", "email", "role"];
  readonly productColumns = ["name", "formattedPrice", "category"];

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.loading = true;

    this.bff.getUsers().subscribe({
      next: (response) => (this.users = response.data),
      error: (err) => console.error("Error loading users:", err),
    });

    this.bff.getProducts().subscribe({
      next: (response) => {
        this.products = response.data;
        this.loading = false;
      },
      error: (err) => {
        console.error("Error loading products:", err);
        this.loading = false;
      },
    });
  }
}
