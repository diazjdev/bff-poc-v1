import { describe, it, expect, vi, beforeEach } from "vitest";
import { mapUser, mapProduct } from "../../src/utils/responseMapper";
import { DownstreamUser, DownstreamProduct } from "../../src/types";

describe("responseMapper", () => {
  describe("mapUser", () => {
    it("should map downstream user to BFF user format", () => {
      const downstream: DownstreamUser = {
        id: "usr_123",
        name: "John Doe",
        email: "john@example.com",
        role: "admin",
        createdAt: "2024-01-15T10:30:00Z",
      };

      const result = mapUser(downstream);

      expect(result).toEqual({
        id: "usr_123",
        displayName: "John Doe",
        email: "john@example.com",
        role: "admin",
        joinedAt: "2024-01-15T10:30:00Z",
      });
    });
  });

  describe("mapProduct", () => {
    it("should map downstream product to BFF product format with formatted price", () => {
      const downstream: DownstreamProduct = {
        id: "prod_456",
        name: "Widget",
        description: "A useful widget",
        price: 29.99,
        category: "tools",
      };

      const result = mapProduct(downstream);

      expect(result).toEqual({
        id: "prod_456",
        name: "Widget",
        description: "A useful widget",
        formattedPrice: "$29.99",
        category: "tools",
      });
    });

    it("should format price with two decimal places", () => {
      const downstream: DownstreamProduct = {
        id: "prod_789",
        name: "Gadget",
        description: "A cool gadget",
        price: 10,
        category: "electronics",
      };

      const result = mapProduct(downstream);

      expect(result.formattedPrice).toBe("$10.00");
    });
  });
});
