/*
  Warnings:

  - You are about to drop the column `name` on the `MountainTranslation` table. All the data in the column will be lost.
  - Added the required column `key` to the `MountainTranslation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MountainTranslation" DROP COLUMN "name",
ADD COLUMN     "key" TEXT NOT NULL;
