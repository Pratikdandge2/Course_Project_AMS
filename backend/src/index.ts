import express from "express";
import cors from "cors";
import { config } from "./config.js";
import { authRouter } from "./routes/auth.js";
import { adminRouter } from "./routes/admin.js";
import { publicRouter } from "./routes/public.js";
import { profileRouter } from "./routes/profile.js";
import { groupsRouter } from "./routes/groups.js";
import { businessRouter } from "./routes/business.js";
import { messagesRouter } from "./routes/messages.js";
import { notificationsRouter } from "./routes/notifications.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(
  cors({
    origin: config.frontendUrl,
    credentials: true
  })
);
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/api/auth", authRouter);
app.use("/api/admin", adminRouter);
app.use("/api", publicRouter);
app.use("/api/profile", profileRouter);
app.use("/api/groups", groupsRouter);
app.use("/api/business", businessRouter);
app.use("/api/messages", messagesRouter);
app.use("/api/notifications", notificationsRouter);

app.use(errorHandler);

app.listen(config.port, () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on http://localhost:${config.port}`);
});

