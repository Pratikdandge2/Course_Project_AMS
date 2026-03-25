import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { HttpError } from "../utils/httpError.js";

export const profileRouter = Router();

profileRouter.use(requireAuth);

function calculateCompletion(user: { name: string; profilePhoto: string | null; gender: unknown; dateOfBirth: Date | null; mobileNo: string | null; currentCity: string | null }, profile: { courses: unknown[]; company: string | null; position: string | null; skills: string[]; industries: string[] }) {
  const checks: Array<{ ok: boolean; label: string }> = [
    { ok: !!user.name, label: "Add your name" },
    { ok: !!user.profilePhoto, label: "Upload your photograph" },
    { ok: !!user.gender, label: "Select your gender" },
    { ok: !!user.dateOfBirth, label: "Add your date of birth" },
    { ok: !!user.mobileNo, label: "Add your mobile number" },
    { ok: !!user.currentCity, label: "Add your current city" },
    { ok: profile.courses.length > 0, label: "Enter your college education details" },
    { ok: !!profile.company, label: "Add your company/organization" },
    { ok: !!profile.position, label: "Add your position/role" },
    { ok: profile.skills.length > 0, label: "Add professional skills" },
    { ok: profile.industries.length > 0, label: "Add industries you worked in" }
  ];

  const done = checks.filter((c) => c.ok).length;
  const pct = Math.round((done / checks.length) * 100);
  const pending = checks.filter((c) => !c.ok).map((c) => c.label);
  return { pct, pending };
}

profileRouter.get("/completion", async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        name: true,
        profilePhoto: true,
        gender: true,
        dateOfBirth: true,
        mobileNo: true,
        currentCity: true,
        alumniProfile: {
          select: { company: true, position: true, skills: true, industries: true, courses: { select: { id: true } } }
        }
      }
    });
    if (!user) throw new HttpError(404, "User not found");
    const profile = user.alumniProfile ?? { company: null, position: null, skills: [], industries: [], courses: [] };
    const { pct, pending } = calculateCompletion(user, profile);

    await prisma.alumniProfile.upsert({
      where: { userId: req.user!.id },
      update: { profileComplete: pct },
      create: { userId: req.user!.id, profileComplete: pct, rolesPlayed: [], industries: [], skills: [] }
    });

    return res.json({ percent: pct, pending });
  } catch (e) {
    return next(e);
  }
});

profileRouter.delete("/course/:id", async (req, res, next) => {
  try {
    const id = z.coerce.number().int().parse(req.params.id);
    const course = await prisma.course.findUnique({
      where: { id },
      select: { id: true, alumniProfile: { select: { userId: true } } }
    });
    if (!course) throw new HttpError(404, "Course not found");
    if (course.alumniProfile.userId !== req.user!.id) throw new HttpError(403, "Not allowed");

    await prisma.course.delete({ where: { id } });
    return res.json({ ok: true });
  } catch (e) {
    return next(e);
  }
});

