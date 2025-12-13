/*
  Warnings:

  - You are about to drop the column `description` on the `Mountain` table. All the data in the column will be lost.
  - You are about to drop the column `first_climber` on the `Mountain` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `Mountain` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Mountain` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Mountain" DROP COLUMN "description",
DROP COLUMN "first_climber",
DROP COLUMN "location",
DROP COLUMN "name";

-- CreateTable
CREATE TABLE "MountainTranslation" (
    "id" SERIAL NOT NULL,
    "mountainId" INTEGER NOT NULL,
    "language" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "location" TEXT NOT NULL,
    "first_climber" TEXT,

    CONSTRAINT "MountainTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MountainTranslation_mountainId_language_key" ON "MountainTranslation"("mountainId", "language");

-- AddForeignKey
ALTER TABLE "MountainTranslation" ADD CONSTRAINT "MountainTranslation_mountainId_fkey" FOREIGN KEY ("mountainId") REFERENCES "Mountain"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
