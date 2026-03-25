import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma.js";
import { requireAdmin } from "../middleware/auth.js";
import { HttpError } from "../utils/httpError.js";
import { sendMail } from "../services/mailer.js";

export const adminRouter = Router();

adminRouter.use(requireAdmin);

adminRouter.get("/pending", async (req, res, next) => {
  try {
    const page = z.coerce.number().int().min(1).catch(1).parse(req.query.page);
    const pageSize = z.coerce.number().int().min(1).max(50).catch(10).parse(req.query.pageSize);
    const skip = (page - 1) * pageSize;

    const [total, users] = await Promise.all([
      prisma.user.count({ where: { status: "PENDING" } }),
      prisma.user.findMany({
        where: { status: "PENDING" },
        orderBy: { createdAt: "asc" },
        skip,
        take: pageSize,
        select: { id: true, name: true, email: true, graduationYear: true, department: true, createdAt: true }
      })
    ]);

    return res.json({ page, pageSize, total, users });
  } catch (e) {
    return next(e);
  }
});

adminRouter.put("/users/:id/approve", async (req, res, next) => {
  try {
    const id = z.coerce.number().int().parse(req.params.id);
    const user = await prisma.user.update({
      where: { id },
      data: { status: "APPROVED" },
      select: { id: true, email: true, name: true, status: true }
    }).catch(() => null);

    if (!user) throw new HttpError(404, "User not found");

    await sendMail(user.email, "You're approved!", `Hi ${user.name},\n\nYour alumni registration has been approved. You can now log in.\n`);

    return res.json({ ok: true, user });
  } catch (e) {
    return next(e);
  }
});

adminRouter.put("/users/:id/reject", async (req, res, next) => {
  try {
    const id = z.coerce.number().int().parse(req.params.id);
    const user = await prisma.user.update({
      where: { id },
      data: { status: "REJECTED" },
      select: { id: true, email: true, name: true, status: true }
    }).catch(() => null);

    if (!user) throw new HttpError(404, "User not found");

    await sendMail(user.email, "Not approved", `Hi ${user.name},\n\nUnfortunately your alumni registration was not approved.\n`);

    return res.json({ ok: true, user });
  } catch (e) {
    return next(e);
  }
});

