import { describe, it, expect, vi, afterEach } from "vitest";
import request from "supertest";
import express, { Request, Response, NextFunction } from "express";

vi.mock("../../src/config", () => ({
  config: {
    port: 3000,
    auth: {
      serviceUrl: "http://localhost:3001",
    },
    downstream: {
      apiUrl: "http://localhost:4000",
    },
    cors: {
      origin: "http://localhost:4200",
    },
  },
}));

vi.mock("../../src/middleware/auth", () => ({
  authenticateSession: async (req: Request, _res: Response, next: NextFunction) => {
    const cookie = req.headers.cookie;
    if (!cookie || !cookie.includes("appSession")) {
      _res.status(401).json({ error: "No session cookie" });
      return;
    }
    req.user = {
      sub: "auth0|123",
      email: "test@example.com",
      name: "Test User",
    };
    req.accessToken = "mock-access-token";
    next();
  },
}));

vi.mock("../../src/services/userService", () => ({
  getUsers: vi.fn(),
  getUserById: vi.fn(),
}));

vi.mock("../../src/services/productService", () => ({
  getProducts: vi.fn(),
  getProductById: vi.fn(),
}));

import app from "../../src/index";
import { getUsers, getUserById } from "../../src/services/userService";
import { getProducts, getProductById } from "../../src/services/productService";

const mockGetUsers = vi.mocked(getUsers);
const mockGetUserById = vi.mocked(getUserById);
const mockGetProducts = vi.mocked(getProducts);
const mockGetProductById = vi.mocked(getProductById);

describe("Routes", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /health", () => {
    it("should return health status", async () => {
      const res = await request(app).get("/health");
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ status: "ok", service: "bff" });
    });
  });

  describe("GET /api/users", () => {
    it("should return 401 without session cookie", async () => {
      const res = await request(app).get("/api/users");
      expect(res.status).toBe(401);
    });

    it("should return users with valid session cookie", async () => {
      mockGetUsers.mockImplementation(async (_req, res) => {
        res.json({
          success: true,
          data: [
            {
              id: "1",
              displayName: "John",
              email: "john@test.com",
              role: "user",
              joinedAt: "2024-01-01",
            },
          ],
        });
      });

      const res = await request(app)
        .get("/api/users")
        .set("Cookie", "appSession=test-session-token");

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
    });
  });

  describe("GET /api/products", () => {
    it("should return 401 without session cookie", async () => {
      const res = await request(app).get("/api/products");
      expect(res.status).toBe(401);
    });

    it("should return products with valid session cookie", async () => {
      mockGetProducts.mockImplementation(async (_req, res) => {
        res.json({
          success: true,
          data: [
            {
              id: "1",
              name: "Widget",
              description: "A widget",
              formattedPrice: "$9.99",
              category: "tools",
            },
          ],
        });
      });

      const res = await request(app)
        .get("/api/products")
        .set("Cookie", "appSession=test-session-token");

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
    });
  });
});
