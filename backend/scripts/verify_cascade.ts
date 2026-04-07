import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting verification...");

  // 1. Create a test user
  const email = `test-${Date.now()}@example.com`;
  const user = await prisma.user.create({
    data: {
      name: "Test User",
      email,
      password: await bcrypt.hash("password123", 10),
      role: "ALUMNI",
      status: "APPROVED"
    }
  });
  console.log(`Created test user: ${user.id} (${user.email})`);

  // 2. Create related data to test cascade delete
  const profile = await prisma.alumniProfile.create({
    data: {
      userId: user.id,
      skills: ["Testing"]
    }
  });
  console.log(`Created profile for user: ${profile.id}`);

  // 3. Test Course creation (related to profile)
  const course = await prisma.course.create({
    data: {
      alumniProfileId: profile.id,
      degree: "B.Tech",
      stream: "CS",
      endYear: 2024
    }
  });
  console.log(`Created course: ${course.id}`);

  // 4. Verify cascade delete
  console.log(`Deleting user ${user.id}...`);
  await prisma.user.delete({ where: { id: user.id } });

  const deletedUser = await prisma.user.findUnique({ where: { id: user.id } });
  const deletedProfile = await prisma.alumniProfile.findUnique({ where: { id: profile.id } });
  const deletedCourse = await prisma.course.findFirst({ where: { alumniProfileId: profile.id } });

  if (!deletedUser && !deletedProfile && !deletedCourse) {
    console.log("✅ Cascade delete works!");
  } else {
    console.error("❌ Cascade delete FAILED!");
  }

  process.exit(0);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
