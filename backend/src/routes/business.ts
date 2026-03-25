import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { HttpError } from "../utils/httpError.js";

export const businessRouter = Router();

businessRouter.use(requireAuth);

// --- GET /api/business/filters — distinct values for dropdowns ---
businessRouter.get("/filters", async (_req, res, next) => {
  try {
    const listings = await prisma.businessListing.findMany({
      select: { industry: true, products: true, services: true }
    });

    const industryMap = new Map<string, number>();
    const productMap = new Map<string, number>();
    const serviceMap = new Map<string, number>();

    for (const l of listings) {
      if (l.industry) industryMap.set(l.industry, (industryMap.get(l.industry) ?? 0) + 1);
      for (const p of l.products) productMap.set(p, (productMap.get(p) ?? 0) + 1);
      for (const s of l.services) serviceMap.set(s, (serviceMap.get(s) ?? 0) + 1);
    }

    const toArr = (m: Map<string, number>) =>
      Array.from(m.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => a.name.localeCompare(b.name));

    return res.json({
      industries: toArr(industryMap),
      products: toArr(productMap),
      services: toArr(serviceMap)
    });
  } catch (e) {
    return next(e);
  }
});

// --- GET /api/business — list with optional search & filters ---
businessRouter.get("/", async (req, res, next) => {
  try {
    const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
    const industry = typeof req.query.industry === "string" ? req.query.industry.trim() : "";
    const product = typeof req.query.product === "string" ? req.query.product.trim() : "";
    const service = typeof req.query.service === "string" ? req.query.service.trim() : "";

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { industry: { contains: search, mode: "insensitive" } },
        { location: { contains: search, mode: "insensitive" } },
        { products: { has: search } },
        { services: { has: search } }
      ];
    }

    if (industry) where.industry = { equals: industry, mode: "insensitive" };
    if (product) where.products = { has: product };
    if (service) where.services = { has: service };

    const listings = await prisma.businessListing.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        createdBy: { select: { id: true, name: true } }
      }
    });

    return res.json({ listings, total: listings.length });
  } catch (e) {
    return next(e);
  }
});

// --- GET /api/business/:id — single listing detail ---
businessRouter.get("/:id", async (req, res, next) => {
  try {
    const id = z.coerce.number().int().parse(req.params.id);
    const listing = await prisma.businessListing.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, name: true, profilePhoto: true } }
      }
    });
    if (!listing) throw new HttpError(404, "Business listing not found");

    // Also fetch some other listings for "More Listings"
    const moreListings = await prisma.businessListing.findMany({
      where: { id: { not: id } },
      take: 3,
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, industry: true, location: true, logoUrl: true }
    });

    return res.json({ listing, moreListings });
  } catch (e) {
    return next(e);
  }
});

const CreateListingSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  logoUrl: z.string().optional(),
  industry: z.string().optional(),
  location: z.string().optional(),
  website: z.string().optional(),
  employees: z.string().optional(),
  fundingUsd: z.string().optional(),
  contactNumber: z.string().optional(),
  contactEmail: z.string().optional(),
  products: z.array(z.string()).optional().default([]),
  services: z.array(z.string()).optional().default([]),
  socialLinkedin: z.string().optional(),
  socialTwitter: z.string().optional(),
  socialFacebook: z.string().optional(),
  socialInstagram: z.string().optional()
});

// --- POST /api/business — create listing ---
businessRouter.post("/", async (req, res, next) => {
  try {
    const data = CreateListingSchema.parse(req.body);
    const listing = await prisma.businessListing.create({
      data: {
        ...data,
        createdById: req.user!.id
      }
    });
    return res.status(201).json({ listing });
  } catch (e) {
    return next(e);
  }
});
