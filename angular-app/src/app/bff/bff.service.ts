import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment";

export interface BffUser {
  id: string;
  displayName: string;
  email: string;
  role: string;
  joinedAt: string;
}

export interface BffProduct {
  id: string;
  name: string;
  description: string;
  formattedPrice: string;
  category: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    total: number;
    page: number;
    pageSize: number;
  };
}

@Injectable({ providedIn: "root" })
export class BffService {
  private readonly http = inject(HttpClient);

  getUsers(): Observable<ApiResponse<BffUser[]>> {
    return this.http.get<ApiResponse<BffUser[]>>(
      `${environment.bff.apiUrl}/users`,
      { withCredentials: true }
    );
  }

  getProducts(): Observable<ApiResponse<BffProduct[]>> {
    return this.http.get<ApiResponse<BffProduct[]>>(
      `${environment.bff.apiUrl}/products`,
      { withCredentials: true }
    );
  }

  getCurrentUser(): Observable<ApiResponse<BffUser>> {
    return this.http.get<ApiResponse<BffUser>>(
      `${environment.bff.apiUrl}/users/me`,
      { withCredentials: true }
    );
  }
}
