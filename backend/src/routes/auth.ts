import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { prisma } from "../prisma.js";
import { config } from "../config.js";
import { HttpError } from "../utils/httpError.js";
import { requireAuth, requireRegistration } from "../middleware/auth.js";

const RegisterSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  graduationYear: z.number().int().min(1900).max(2100).optional(),
  department: z.string().min(1).optional(),
  linkedinUrl: z.string().url().optional(),
  profilePhoto: z.string().url().optional()
});

const Step1Schema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  gender: z.enum(["MALE", "FEMALE", "PREFER_NOT_TO_DISCLOSE"]),
  dateOfBirth: z.string().datetime().optional(),
  mobileNo: z.string().min(6),
  currentCity: z.string().min(1),
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/, "Password must include an uppercase letter")
    .regex(/[0-9]/, "Password must include a number")
    .regex(/[^A-Za-z0-9]/, "Password must include a special character"),
  acceptedTerms: z.literal(true)
});

const CourseSchema = z.object({
  degree: z.string().min(1),
  stream: z.string().min(1),
  endYear: z.number().int().min(2000).max(2100),
  isStillPursuing: z.boolean().optional()
});

const WorkSchema = z.object({
  company: z.string().optional(),
  position: z.string().optional(),
  workFromYear: z.number().int().min(1950).max(2100).optional(),
  workToYear: z.number().int().min(1950).max(2100).nullable().optional(),
  yearsExperience: z.number().int().min(0).max(60).optional(),
  rolesPlayed: z.array(z.string()).optional(),
  industries: z.array(z.string()).optional(),
  skills: z.array(z.string()).optional()
});

const Step2AlumniSchema = z.object({
  courses: z.array(CourseSchema).min(1),
  work: WorkSchema.optional()
});

const Step2StudentSchema = z.object({
  courses: z.array(CourseSchema).min(1),
  work: WorkSchema.optional()
});

const Step2FacultySchema = z.object({
  department: z.string().min(1),
  designation: z.string().min(1),
  fromYear: z.number().int().min(1950).max(2100).optional(),
  toYear: z.number().int().min(1950).max(2100).nullable().optional()
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

function signTokens(user: { id: number; role: "ALUMNI" | "ADMIN" }) {
  const accessToken = jwt.sign(
    { sub: user.id, role: user.role },
    config.jwtSecret,
    { expiresIn: config.jwtAccessTtl }
  );
  const refreshToken = jwt.sign(
    { sub: user.id, role: user.role, typ: "refresh" },
    config.jwtSecret,
    { expiresIn: config.jwtRefreshTtl }
  );
  return { accessToken, refreshToken };
}

function signRegistrationToken(userId: number) {
  return jwt.sign({ sub: userId, role: "ALUMNI", typ: "reg" }, config.jwtSecret, { expiresIn: "2h" });
}

export const authRouter = Router();

authRouter.get("/register/check", async (req, res, next) => {
  try {
    const email = z.string().email().parse(req.query.email);
    const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    return res.json({ exists: !!existing });
  } catch (e) {
    return next(e);
  }
});

authRouter.post("/register/step1", async (req, res, next) => {
  try {
    const input = Step1Schema.parse(req.body);
    const name = `${input.firstName} ${input.lastName}`.trim();

    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing && existing.status !== "INCOMPLETE") {
      throw new HttpError(409, "This email is already registered. Please login.");
    }

    const passwordHash = await bcrypt.hash(input.password, 10);
    const dob = input.dateOfBirth ? new Date(input.dateOfBirth) : undefined;

    const user = existing
      ? await prisma.user.update({
          where: { id: existing.id },
          data: {
            name,
            password: passwordHash,
            status: "INCOMPLETE",
            gender: input.gender,
            dateOfBirth: dob,
            mobileNo: input.mobileNo,
            currentCity: input.currentCity
          },
          select: { id: true, email: true, status: true }
        })
      : await prisma.user.create({
          data: {
            name,
            email: input.email,
            password: passwordHash,
            role: "ALUMNI",
            status: "INCOMPLETE",
            gender: input.gender,
            dateOfBirth: dob,
            mobileNo: input.mobileNo,
            currentCity: input.currentCity
          },
          select: { id: true, email: true, status: true }
        });

    const regToken = signRegistrationToken(user.id);
    return res.status(201).json({ regToken, user });
  } catch (e) {
    return next(e);
  }
});

authRouter.get("/register/status", requireRegistration, async (req, res, next) => {
  try {
    const u = await prisma.user.findUnique({ where: { id: req.reg!.id }, select: { status: true } });
    if (!u) throw new HttpError(404, "User not found");
    const step = u.status === "INCOMPLETE" ? 1 : 2;
    return res.json({ step, status: u.status });
  } catch (e) {
    return next(e);
  }
});

authRouter.post("/register/step2/alumni", requireRegistration, async (req, res, next) => {
  try {
    const input = Step2AlumniSchema.parse(req.body);
    const userId = req.reg!.id;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new HttpError(404, "User not found");
    if (user.status !== "INCOMPLETE") throw new HttpError(409, "Registration step already completed");

    const profile = await prisma.alumniProfile.upsert({
      where: { userId },
      update: {},
      create: { userId, rolesPlayed: [], industries: [], skills: [] }
    });

    await prisma.course.createMany({
      data: input.courses.map((c) => ({
        alumniProfileId: profile.id,
        degree: c.degree,
        stream: c.stream,
        endYear: c.endYear,
        isStillPursuing: !!c.isStillPursuing,
        type: "ALUMNI"
      }))
    });

    if (input.work) {
      await prisma.alumniProfile.update({
        where: { id: profile.id },
        data: {
          company: input.work.company ?? undefined,
          position: input.work.position ?? undefined,
          workFromYear: input.work.workFromYear ?? undefined,
          workToYear: input.work.workToYear ?? undefined,
          yearsExperience: input.work.yearsExperience ?? undefined,
          rolesPlayed: input.work.rolesPlayed ?? [],
          industries: input.work.industries ?? [],
          skills: input.work.skills ?? []
        }
      });
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { status: "PENDING" },
      select: { id: true, email: true, status: true }
    });

    return res.json({ ok: true, user: updated });
  } catch (e) {
    return next(e);
  }
});

authRouter.post("/register/step2/student", requireRegistration, async (req, res, next) => {
  try {
    const input = Step2StudentSchema.parse(req.body);
    const userId = req.reg!.id;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new HttpError(404, "User not found");
    if (user.status !== "INCOMPLETE") throw new HttpError(409, "Registration step already completed");

    const profile = await prisma.alumniProfile.upsert({
      where: { userId },
      update: {},
      create: { userId, rolesPlayed: [], industries: [], skills: [] }
    });

    await prisma.course.createMany({
      data: input.courses.map((c) => ({
        alumniProfileId: profile.id,
        degree: c.degree,
        stream: c.stream,
        endYear: c.endYear,
        isStillPursuing: true,
        type: "STUDENT"
      }))
    });

    if (input.work) {
      await prisma.alumniProfile.update({
        where: { id: profile.id },
        data: {
          company: input.work.company ?? undefined,
          position: input.work.position ?? undefined,
          workFromYear: input.work.workFromYear ?? undefined,
          workToYear: input.work.workToYear ?? undefined,
          yearsExperience: input.work.yearsExperience ?? undefined,
          rolesPlayed: input.work.rolesPlayed ?? [],
          industries: input.work.industries ?? [],
          skills: input.work.skills ?? []
        }
      });
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { status: "PENDING" },
      select: { id: true, email: true, status: true }
    });

    return res.json({ ok: true, user: updated });
  } catch (e) {
    return next(e);
  }
});

authRouter.post("/register/step2/faculty", requireRegistration, async (req, res, next) => {
  try {
    const input = Step2FacultySchema.parse(req.body);
    const userId = req.reg!.id;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new HttpError(404, "User not found");
    if (user.status !== "INCOMPLETE") throw new HttpError(409, "Registration step already completed");

    const profile = await prisma.alumniProfile.upsert({
      where: { userId },
      update: {},
      create: { userId, rolesPlayed: [], industries: [], skills: [] }
    });

    await prisma.alumniProfile.update({
      where: { id: profile.id },
      data: {
        facultyDepartment: input.department,
        facultyDesignation: input.designation,
        facultyFromYear: input.fromYear ?? undefined,
        facultyToYear: input.toYear ?? undefined
      }
    });

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { status: "PENDING" },
      select: { id: true, email: true, status: true }
    });

    return res.json({ ok: true, user: updated });
  } catch (e) {
    return next(e);
  }
});

authRouter.post("/register", async (req, res, next) => {
  try {
    const input = RegisterSchema.parse(req.body);
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) throw new HttpError(409, "Email already registered");

    const password = await bcrypt.hash(input.password, 10);
    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        password,
        role: "ALUMNI",
        status: "PENDING",
        graduationYear: input.graduationYear,
        department: input.department,
        linkedinUrl: input.linkedinUrl,
        profilePhoto: input.profilePhoto
      },
      select: { id: true, email: true, status: true }
    });

    return res.status(201).json({
      user,
      message: "Your registration is under review. You'll receive an email once approved by the admin."
    });
  } catch (e) {
    return next(e);
  }
});

authRouter.post("/login", async (req, res, next) => {
  try {
    const input = LoginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: input.email } });
    if (!user) throw new HttpError(401, "Invalid credentials");

    const ok = await bcrypt.compare(input.password, user.password);
    if (!ok) throw new HttpError(401, "Invalid credentials");

    if (user.status !== "APPROVED") {
      if (user.status === "PENDING") throw new HttpError(403, "Your account is pending approval");
      if (user.status === "INCOMPLETE") throw new HttpError(403, "Please complete registration");
      throw new HttpError(403, "Your account was rejected");
    }

    const tokens = signTokens({ id: user.id, role: user.role });
    return res.json({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
      }
    });
  } catch (e) {
    return next(e);
  }
});

authRouter.post("/logout", (_req, res) => {
  // With stateless JWT, logout is handled client-side (drop tokens).
  return res.json({ ok: true });
});

authRouter.get("/me", requireAuth, async (req, res, next) => {
  try {
    const me = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        graduationYear: true,
        department: true,
        profilePhoto: true,
        linkedinUrl: true,
        createdAt: true
      }
    });
    if (!me) throw new HttpError(404, "User not found");
    return res.json(me);
  } catch (e) {
    return next(e);
  }
});

