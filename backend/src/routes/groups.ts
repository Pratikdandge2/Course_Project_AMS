import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { HttpError } from "../utils/httpError.js";

export const groupsRouter = Router();

groupsRouter.use(requireAuth);

// --- GET /api/groups  — list all groups, optionally filtered ---
groupsRouter.get("/", async (req, res, next) => {
  try {
    const category = z
      .enum(["INTEREST_GROUPS", "CHAPTERS", "CLASS_GROUPS", "YEAR_GROUPS"])
      .optional()
      .parse(req.query.category ?? undefined);

    const search = typeof req.query.search === "string" ? req.query.search.trim() : "";

    const where: any = {};
    if (category) where.category = category;
    if (search) where.name = { contains: search, mode: "insensitive" };

    const groups = await prisma.group.findMany({
      where,
      orderBy: { name: "asc" },
      include: { _count: { select: { members: true } } }
    });

    // Also attach whether the current user is a member
    const userId = req.user!.id;
    const myMemberships = await prisma.groupMember.findMany({
      where: { userId, groupId: { in: groups.map((g) => g.id) } },
      select: { groupId: true }
    });
    const myGroupIds = new Set(myMemberships.map((m) => m.groupId));

    const result = groups.map((g) => ({
      id: g.id,
      name: g.name,
      category: g.category,
      description: g.description,
      imageUrl: g.imageUrl,
      memberCount: g._count.members,
      isMember: myGroupIds.has(g.id)
    }));

    return res.json({ groups: result });
  } catch (e) {
    return next(e);
  }
});

// --- GET /api/groups/my  — groups the current user has joined ---
groupsRouter.get("/my", async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const memberships = await prisma.groupMember.findMany({
      where: { userId },
      include: {
        group: {
          include: { _count: { select: { members: true } } }
        }
      },
      orderBy: { joinedAt: "desc" }
    });

    const groups = memberships.map((m) => ({
      id: m.group.id,
      name: m.group.name,
      category: m.group.category,
      description: m.group.description,
      imageUrl: m.group.imageUrl,
      memberCount: m.group._count.members,
      isMember: true,
      joinedAt: m.joinedAt
    }));

    return res.json({ groups });
  } catch (e) {
    return next(e);
  }
});

// --- GET /api/groups/:id  — single group detail ---
groupsRouter.get("/:id", async (req, res, next) => {
  try {
    const id = z.coerce.number().int().parse(req.params.id);
    const group = await prisma.group.findUnique({
      where: { id },
      include: { _count: { select: { members: true } } }
    });
    if (!group) throw new HttpError(404, "Group not found");

    const membership = await prisma.groupMember.findUnique({
      where: { userId_groupId: { userId: req.user!.id, groupId: id } }
    });

    return res.json({
      id: group.id,
      name: group.name,
      category: group.category,
      description: group.description,
      imageUrl: group.imageUrl,
      memberCount: group._count.members,
      isMember: !!membership,
      createdAt: group.createdAt
    });
  } catch (e) {
    return next(e);
  }
});

// --- POST /api/groups/:id/join ---
groupsRouter.post("/:id/join", async (req, res, next) => {
  try {
    const groupId = z.coerce.number().int().parse(req.params.id);
    const userId = req.user!.id;

    const group = await prisma.group.findUnique({ where: { id: groupId } });
    if (!group) throw new HttpError(404, "Group not found");

    const existing = await prisma.groupMember.findUnique({
      where: { userId_groupId: { userId, groupId } }
    });
    if (existing) throw new HttpError(409, "Already a member of this group");

    await prisma.groupMember.create({ data: { userId, groupId } });

    return res.json({ ok: true, message: `Joined "${group.name}"` });
  } catch (e) {
    return next(e);
  }
});

// --- DELETE /api/groups/:id/leave ---
groupsRouter.delete("/:id/leave", async (req, res, next) => {
  try {
    const groupId = z.coerce.number().int().parse(req.params.id);
    const userId = req.user!.id;

    const membership = await prisma.groupMember.findUnique({
      where: { userId_groupId: { userId, groupId } }
    });
    if (!membership) throw new HttpError(404, "Not a member of this group");

    await prisma.groupMember.delete({
      where: { userId_groupId: { userId, groupId } }
    });

    return res.json({ ok: true, message: "Left the group" });
  } catch (e) {
    return next(e);
  }
});

// --- GET /api/groups/:id/members ---
groupsRouter.get("/:id/members", async (req, res, next) => {
  try {
    const groupId = z.coerce.number().int().parse(req.params.id);
    const page = z.coerce.number().int().min(1).catch(1).parse(req.query.page);
    const pageSize = z.coerce.number().int().min(1).max(50).catch(20).parse(req.query.pageSize);
    const skip = (page - 1) * pageSize;

    const group = await prisma.group.findUnique({ where: { id: groupId } });
    if (!group) throw new HttpError(404, "Group not found");

    const [total, members] = await Promise.all([
      prisma.groupMember.count({ where: { groupId } }),
      prisma.groupMember.findMany({
        where: { groupId },
        include: {
          user: {
            select: { id: true, name: true, email: true, profilePhoto: true, department: true, graduationYear: true }
          }
        },
        orderBy: { joinedAt: "asc" },
        skip,
        take: pageSize
      })
    ]);

    return res.json({
      page,
      pageSize,
      total,
      members: members.map((m) => ({
        ...m.user,
        joinedAt: m.joinedAt
      }))
    });
  } catch (e) {
    return next(e);
  }
});
