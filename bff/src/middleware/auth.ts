import { Request, Response, NextFunction } from "express";
import { config } from "../config";
import { AuthenticatedUser } from "../types";

interface AuthMeResponse {
  isAuthenticated: boolean;
  user: {
    sub: string;
    email: string;
    name: string;
    picture?: string;
  } | null;
  accessToken?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      accessToken?: string;
    }
  }
}

export async function authenticateSession(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const cookieHeader = req.headers.cookie;

  if (!cookieHeader) {
    res.status(401).json({ error: "No session cookie" });
    return;
  }

  try {
    const response = await fetch(`${config.auth.serviceUrl}/auth/me`, {
      headers: {
        Cookie: cookieHeader,
      },
    });

    if (!response.ok) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    const data = (await response.json()) as AuthMeResponse;

    if (!data.isAuthenticated || !data.user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    req.user = {
      sub: data.user.sub,
      email: data.user.email,
      name: data.user.name,
      picture: data.user.picture,
    };
    req.accessToken = data.accessToken;

    next();
  } catch (error) {
    console.error("Auth service error:", error);
    res.status(500).json({ error: "Authentication service unavailable" });
  }
}
