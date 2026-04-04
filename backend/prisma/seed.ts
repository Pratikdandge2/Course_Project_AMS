import bcrypt from "bcrypt";
import { prisma } from "../src/prisma.js";
import { config } from "../src/config.js";

async function main() {
  const adminEmail = config.adminEmail;
  const adminPasswordHash = await bcrypt.hash(config.adminPassword, 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: "Admin",
      password: adminPasswordHash,
      role: "ADMIN",
      status: "APPROVED"
    },
    create: {
      name: "Admin",
      email: adminEmail,
      password: adminPasswordHash,
      role: "ADMIN",
      status: "APPROVED"
    }
  });

  const newsCount = await prisma.news.count();
  if (newsCount === 0) {
    await prisma.news.createMany({
      data: [
        {
          title: "Alumni Meet 2026 Announced",
          content:
            "We’re excited to announce the annual alumni meet. Register to reconnect, network, and celebrate achievements.",
          imageUrl: "/alumni-meet-2026.png"
        },
        {
          title: "VCET Startup Showcase",
          content:
            "Join the showcase to see ventures built by VCET alumni and students, and learn how to collaborate as a mentor.",
          imageUrl: "https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&w=1200&q=60"
        }
      ]
    });
  }

  const eventCount = await prisma.event.count();
  if (eventCount === 0) {
    const now = new Date();
    const upcoming = new Date(now);
    upcoming.setDate(upcoming.getDate() + 21);
    const past = new Date(now);
    past.setDate(past.getDate() - 40);

    await prisma.event.createMany({
      data: [
        {
          title: "Mentorship Program Kickoff",
          location: "VCET Auditorium",
          date: upcoming,
          isPast: false
        },
        {
          title: "Batch of 2016 Reunion",
          location: "Main Campus Lawn",
          date: past,
          isPast: true
        }
      ]
    });
  }

  const galleryCount = await prisma.galleryPhoto.count();
  if (galleryCount === 0) {
    await prisma.galleryPhoto.createMany({
      data: [
        {
          imageUrl: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=60",
          caption: "Alumni networking session"
        },
        {
          imageUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=60",
          caption: "Panel discussion"
        }
      ]
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

