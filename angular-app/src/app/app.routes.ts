import { Routes } from "@angular/router";

export const routes: Routes = [
  {
    path: "",
    loadComponent: () =>
      import("./home/home.component").then((m) => m.HomeComponent),
  },
  {
    path: "login",
    loadComponent: () =>
      import("./auth/login/login.component").then((m) => m.LoginComponent),
  },
  {
    path: "dashboard",
    loadComponent: () =>
      import("./bff/dashboard/dashboard.component").then(
        (m) => m.DashboardComponent
      ),
    canActivate: [
      () => import("./auth/auth.guard").then((m) => m.authGuard),
    ],
  },
  { path: "**", redirectTo: "" },
];
