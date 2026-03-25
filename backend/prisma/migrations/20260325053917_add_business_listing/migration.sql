-- CreateTable
CREATE TABLE "BusinessListing" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "logoUrl" TEXT,
    "industry" TEXT,
    "location" TEXT,
    "website" TEXT,
    "employees" TEXT,
    "fundingUsd" TEXT,
    "contactNumber" TEXT,
    "contactEmail" TEXT,
    "products" TEXT[],
    "services" TEXT[],
    "socialLinkedin" TEXT,
    "socialTwitter" TEXT,
    "socialFacebook" TEXT,
    "socialInstagram" TEXT,
    "createdById" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BusinessListing_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "BusinessListing" ADD CONSTRAINT "BusinessListing_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
