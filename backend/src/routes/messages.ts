import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";

export const messagesRouter = Router();

messagesRouter.use(requireAuth);

// --- GET /api/messages/unread/count ---
messagesRouter.get("/unread/count", (req, res) => {
  // Placeholder: Return 0 unread messages for now
  return res.json({ count: 0 });
});

// --- GET /api/messages ---
messagesRouter.get("/", (req, res) => {
  // Placeholder: Return empty list
  return res.json({ messages: [] });
});
