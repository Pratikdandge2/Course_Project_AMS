import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Find first user to use as creator
  const user = await prisma.user.findFirst();
  if (!user) {
    console.log("No users found. Create a user first, then re-run this seed.");
    return;
  }

  const existing = await prisma.businessListing.count();
  if (existing > 0) {
    console.log(`Already have ${existing} business listings. Skipping seed.`);
    return;
  }

  await prisma.businessListing.createMany({
    data: [
      {
        name: "Astral Technologies",
        description:
          "At Astral Technologies, we build powerful digital solutions to simplify and streamline operations in the real estate and construction industries.\n\nFounded in 2012, our journey began with custom tech services — today, we are a product-first SaaS company.",
        industry: "Construction & Real Estate",
        location: "Mumbai",
        website: "https://buildsmarterp.com/",
        employees: "20-50",
        fundingUsd: "NIL",
        contactNumber: "+91-8097595064",
        contactEmail: "sales@astralgroup.in",
        products: ["Real Estate", "Construction ERP", "CRM", "Real Estate ERP"],
        services: ["Falkonry Bootcamp", "Product Management Coaching"],
        socialLinkedin: "https://linkedin.com/company/astral-technologies",
        socialTwitter: "https://twitter.com/astraltech",
        socialFacebook: "https://facebook.com/astraltech",
        socialInstagram: "https://instagram.com/astraltech",
        createdById: user.id
      },
      {
        name: "Falkonry Inc",
        description:
          "Falkonry provides industrial AI solutions for predictive operations. Our products help enterprises discover and predict operational conditions using time series data.",
        industry: "Engineering & Technology",
        location: "Santa Clara, Ca",
        website: "https://falkonry.com/",
        employees: "50-100",
        fundingUsd: "$15M",
        contactNumber: "+1-408-555-0123",
        contactEmail: "info@falkonry.com",
        products: ["Falkonry Time Series Intellitence (TSI)"],
        services: ["Falkonry Bootcamp", "Resume Writing", "Mock Interviews", "Resume Review"],
        createdById: user.id
      },
      {
        name: "About Product",
        description:
          "About Product is an education and training company focused on product management and career development for tech professionals.",
        industry: "Education & Training",
        location: "Santa Clara, Ca",
        website: "https://aboutproduct.com/",
        employees: "10-20",
        fundingUsd: "NIL",
        contactEmail: "hello@aboutproduct.com",
        products: [],
        services: ["Product Management Coaching"],
        createdById: user.id
      }
    ]
  });

  console.log("Seeded 3 business listings ✓");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
