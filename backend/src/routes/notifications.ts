import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";

export const notificationsRouter = Router();

notificationsRouter.use(requireAuth);

// --- GET /api/notifications/unread/count ---
notificationsRouter.get("/unread/count", (req, res) => {
  // Placeholder: Return 0 unread notifications for now
  return res.json({ count: 0 });
});

// --- GET /api/notifications ---
notificationsRouter.get("/", (req, res) => {
  // Placeholder: Return empty list
  return res.json({ notifications: [] });
});
