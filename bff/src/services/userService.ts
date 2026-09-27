import { Request, Response } from "express";
import { proxyRequest } from "./proxyService";
import { mapUser } from "../utils/responseMapper";
import { DownstreamUser, ApiResponse, BffUser } from "../types";

export async function getUsers(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const response = await proxyRequest<ApiResponse<DownstreamUser[]>>(
      { method: "GET", path: "/users" },
      req.accessToken
    );

    const result: ApiResponse<BffUser[]> = {
      success: response.success,
      data: response.data.map(mapUser),
      meta: response.meta,
    };

    res.json(result);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
}

export async function getUserById(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const response = await proxyRequest<DownstreamUser>(
      { method: "GET", path: `/users/${req.params.id}` },
      req.accessToken
    );

    res.json({ success: true, data: mapUser(response) });
  } catch (error: any) {
    if (error?.response?.status === 404) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
}
