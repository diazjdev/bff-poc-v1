export interface AuthenticatedUser {
  sub: string;
  email: string;
  name: string;
  picture?: string;
}

export interface DownstreamUser {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export interface DownstreamProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
}

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
