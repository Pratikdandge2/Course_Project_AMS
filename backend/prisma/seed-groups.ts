import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Departments offered at VCET
  const departments = ["CE", "IT", "Mech", "ETC", "IE", "Civil"];
  const newDepartments: Record<number, string[]> = {
    2023: ["CSE (DS)"],
    2024: ["AI&DS", "CSE (DS)"]
  };

  // --- Class Groups: BE <year>, <dept> ---
  const classGroups: { name: string }[] = [];
  for (let year = 1998; year <= 2024; year++) {
    const depts = [...departments];
    if (newDepartments[year]) depts.push(...newDepartments[year]);
    for (const dept of depts) {
      classGroups.push({ name: `BE ${year}, ${dept}` });
    }
  }

  // --- Year Groups: Batch of <year> ---
  const yearGroups: { name: string }[] = [];
  for (let year = 1998; year <= 2024; year++) {
    yearGroups.push({ name: `Batch of ${year}` });
  }

  // --- Interest Groups ---
  const interestGroups = [
    { name: "Faculty" },
    { name: "Noticeboard" },
    { name: "Entrepreneurs" },
    { name: "Higher Studies" },
    { name: "Sports" }
  ];

  // --- Chapters ---
  const chapters = [
    { name: "Mumbai Chapter" },
    { name: "Pune Chapter" },
    { name: "Bangalore Chapter" },
    { name: "Delhi NCR Chapter" },
    { name: "International Chapter" }
  ];

  // Upsert all groups (skip if name already exists — simple idempotent approach)
  const allGroups = [
    ...classGroups.map((g) => ({ ...g, category: "CLASS_GROUPS" as const })),
    ...yearGroups.map((g) => ({ ...g, category: "YEAR_GROUPS" as const })),
    ...interestGroups.map((g) => ({ ...g, category: "INTEREST_GROUPS" as const })),
    ...chapters.map((g) => ({ ...g, category: "CHAPTERS" as const }))
  ];

  let created = 0;
  let skipped = 0;

  for (const g of allGroups) {
    const existing = await prisma.group.findFirst({ where: { name: g.name, category: g.category } });
    if (existing) {
      skipped++;
      continue;
    }
    await prisma.group.create({ data: { name: g.name, category: g.category } });
    created++;
  }

  console.log(`Seeding done. Created: ${created}, Skipped (existing): ${skipped}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
