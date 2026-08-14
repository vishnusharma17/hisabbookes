import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export type AuthenticatedRequest = Request & { userId?: string };

function getAuthSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) throw new Error("AUTH_SECRET_MISSING_OR_TOO_SHORT");
  return secret;
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.header("authorization");
  if (!header?.startsWith("Bearer ")) return res.status(401).json({ error: "UNAUTHORIZED" });
  const token = header.slice("Bearer ".length).trim();

  try {
    const payload = jwt.verify(token, getAuthSecret());
    if (typeof payload !== "object" || payload === null || typeof payload.sub !== "string") {
      return res.status(401).json({ error: "INVALID_TOKEN" });
    }
    (req as AuthenticatedRequest).userId = payload.sub;
    return next();
  } catch {
    return res.status(401).json({ error: "INVALID_TOKEN" });
  }
}
