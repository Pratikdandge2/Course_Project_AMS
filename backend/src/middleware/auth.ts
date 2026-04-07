import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { config } from "../config.js";
import { HttpError } from "../utils/httpError.js";

const JwtPayloadSchema = z.object({
  sub: z.union([z.string(), z.number()]),
  role: z.enum(["ALUMNI", "ADMIN"]),
  status: z.enum(["INCOMPLETE", "PENDING", "APPROVED", "REJECTED"]).optional(),
  typ: z.string().optional()
});

export type AuthUser = {
  id: number;
  role: "ALUMNI" | "ADMIN";
};

export type RegistrationUser = {
  id: number;
  typ: "reg";
};

declare global {
  // eslint-disable-next-line no-var
  var __auth_user: never;
}

declare module "express-serve-static-core" {
  interface Request {
    user?: AuthUser;
    reg?: RegistrationUser;
  }
}

function parseBearer(req: Request): string | null {
  const h = req.header("authorization");
  if (!h) return null;
  const [kind, token] = h.split(" ");
  if (kind?.toLowerCase() !== "bearer" || !token) return null;
  return token;
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const token = parseBearer(req);
  if (!token) return next(new HttpError(401, "Missing Authorization: Bearer token"));

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    const parsed = JwtPayloadSchema.parse(decoded);
    const id = typeof parsed.sub === "string" ? Number(parsed.sub) : parsed.sub;
    if (!Number.isFinite(id)) throw new HttpError(401, "Invalid token subject");
    req.user = { id, role: parsed.role };
    return next();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(`[requireAuth] Auth failed for ${req.path}:`, err instanceof Error ? err.message : err);
    return next(new HttpError(401, "Invalid or expired token"));
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  return requireAuth(req, res, (err?: unknown) => {
    if (err) return next(err);
    if (req.user?.role !== "ADMIN") return next(new HttpError(403, "Admin access required"));
    return next();
  });
}

export function requireRegistration(req: Request, _res: Response, next: NextFunction) {
  const token = parseBearer(req);
  if (!token) return next(new HttpError(401, "Missing Authorization: Bearer token"));

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    const parsed = JwtPayloadSchema.parse(decoded);
    if (parsed.typ !== "reg") return next(new HttpError(401, "Invalid registration token"));
    const id = typeof parsed.sub === "string" ? Number(parsed.sub) : parsed.sub;
    if (!Number.isFinite(id)) throw new HttpError(401, "Invalid token subject");
    req.reg = { id, typ: "reg" };
    return next();
  } catch {
    return next(new HttpError(401, "Invalid or expired token"));
  }
}

