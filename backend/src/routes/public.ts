import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma.js";

export const publicRouter = Router();

const STREAMS = [
  "Artificial Intelligence & Data Science",
  "Civil Engineering",
  "Computer Engineering",
  "Computer Science & Engineering (Data Science)",
  "Electronics & Telecommunication Engineering",
  "Electronics Engineering (Vlsi Design & Technology)",
  "Information Technology",
  "Instrumentation Engineering",
  "Mechanical Engineering"
];

const COMPANIES = [
  "VCET",
  "TCS",
  "Infosys",
  "Wipro",
  "Accenture",
  "Capgemini",
  "Cognizant",
  "Google",
  "Microsoft",
  "Amazon",
  "Deloitte",
  "IBM"
];

publicRouter.get("/news", async (_req, res, next) => {
  try {
    const items = await prisma.news.findMany({
      orderBy: { publishedAt: "desc" },
      take: 20
    });
    return res.json(items);
  } catch (e) {
    return next(e);
  }
});

publicRouter.get("/streams", async (_req, res) => {
  return res.json({ streams: STREAMS });
});

publicRouter.get("/companies/search", async (req, res, next) => {
  try {
    const q = z.string().catch("").parse(req.query.q).trim().toLowerCase();
    if (!q) return res.json({ items: [] });
    const items = COMPANIES.filter((c) => c.toLowerCase().includes(q)).slice(0, 10);
    return res.json({ items });
  } catch (e) {
    return next(e);
  }
});

publicRouter.get("/events", async (_req, res, next) => {
  try {
    const items = await prisma.event.findMany({
      orderBy: { date: "desc" },
      take: 50
    });
    return res.json(items);
  } catch (e) {
    return next(e);
  }
});

publicRouter.get("/gallery", async (_req, res, next) => {
  try {
    const items = await prisma.galleryPhoto.findMany({
      orderBy: { id: "desc" },
      take: 100
    });
    return res.json(items);
  } catch (e) {
    return next(e);
  }
});

publicRouter.get("/members/latest", async (_req, res, next) => {
  try {
    const items = await prisma.user.findMany({
      where: { status: "APPROVED", role: "ALUMNI" },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: { id: true, name: true, profilePhoto: true, department: true, graduationYear: true }
    });
    return res.json(items);
  } catch (e) {
    return next(e);
  }
});

