import type { NextFunction, Request, Response } from "express";
import { HttpError } from "../utils/httpError.js";
import { ZodError } from "zod";

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message, details: err.details });
  }

  if (err instanceof ZodError) {
    console.error("Zod Validation Error:", JSON.stringify(err.errors, null, 2));
    return res.status(400).json({ error: "Validation Error", details: err.errors });
  }

  // Prisma / DB transient failures commonly surface as "Internal Server Error" on the client.
  // Classify them as 503 so the UI can show a clearer "try again" message.
  if (
    err instanceof Error &&
    (err.name.startsWith("PrismaClient") ||
      /Can't reach database server|ECONNRESET|ETIMEDOUT|Connection terminated unexpectedly|connect ECONNREFUSED/i.test(
        err.message,
      ))
  ) {
    console.error("Database/API transient error:", err);
    return res.status(503).json({
      error: "Service temporarily unavailable. Please try again in a moment.",
    });
  }

  console.error("Unhandled API Error:", err);

  if (err instanceof Error) {
    // Avoid leaking stack traces in responses by default
    return res.status(500).json({ error: "Internal Server Error" });
  }

  return res.status(500).json({ error: "Internal Server Error" });
}

