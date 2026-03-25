-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ALUMNI', 'ADMIN');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('INCOMPLETE', 'PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'PREFER_NOT_TO_DISCLOSE');

-- CreateEnum
CREATE TYPE "CourseType" AS ENUM ('ALUMNI', 'STUDENT', 'FACULTY');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'ALUMNI',
    "status" "Status" NOT NULL DEFAULT 'INCOMPLETE',
    "graduationYear" INTEGER,
    "department" TEXT,
    "profilePhoto" TEXT,
    "linkedinUrl" TEXT,
    "gender" "Gender",
    "dateOfBirth" TIMESTAMP(3),
    "mobileNo" TEXT,
    "currentCity" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "News" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "imageUrl" TEXT,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "News_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "isPast" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GalleryPhoto" (
    "id" SERIAL NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "caption" TEXT,

    CONSTRAINT "GalleryPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AlumniProfile" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "company" TEXT,
    "position" TEXT,
    "workFromYear" INTEGER,
    "workToYear" INTEGER,
    "yearsExperience" INTEGER,
    "rolesPlayed" TEXT[],
    "industries" TEXT[],
    "skills" TEXT[],
    "profilePhotoUrl" TEXT,
    "profileComplete" INTEGER NOT NULL DEFAULT 0,
    "facultyDepartment" TEXT,
    "facultyDesignation" TEXT,
    "facultyFromYear" INTEGER,
    "facultyToYear" INTEGER,

    CONSTRAINT "AlumniProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Course" (
    "id" SERIAL NOT NULL,
    "alumniProfileId" INTEGER NOT NULL,
    "degree" TEXT NOT NULL,
    "stream" TEXT NOT NULL,
    "endYear" INTEGER NOT NULL,
    "isStillPursuing" BOOLEAN NOT NULL DEFAULT false,
    "type" "CourseType" NOT NULL DEFAULT 'ALUMNI',

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "AlumniProfile_userId_key" ON "AlumniProfile"("userId");

-- AddForeignKey
ALTER TABLE "AlumniProfile" ADD CONSTRAINT "AlumniProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_alumniProfileId_fkey" FOREIGN KEY ("alumniProfileId") REFERENCES "AlumniProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
