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

  console.error("Unhandled API Error:", err);

  if (err instanceof Error) {
    // Avoid leaking stack traces in responses by default
    return res.status(500).json({ error: "Internal Server Error" });
  }

  return res.status(500).json({ error: "Internal Server Error" });
}

