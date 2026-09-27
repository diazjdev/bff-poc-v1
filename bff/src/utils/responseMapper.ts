import { DownstreamUser, DownstreamProduct, BffUser, BffProduct } from "../types";

export function mapUser(downstream: DownstreamUser): BffUser {
  return {
    id: downstream.id,
    displayName: downstream.name,
    email: downstream.email,
    role: downstream.role,
    joinedAt: downstream.createdAt,
  };
}

export function mapProduct(downstream: DownstreamProduct): BffProduct {
  return {
    id: downstream.id,
    name: downstream.name,
    description: downstream.description,
    formattedPrice: `$${downstream.price.toFixed(2)}`,
    category: downstream.category,
  };
}
