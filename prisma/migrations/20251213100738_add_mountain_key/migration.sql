/*
  Warnings:

  - A unique constraint covering the columns `[key]` on the table `Mountain` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `key` to the `Mountain` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Mountain" ADD COLUMN     "key" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Mountain_key_key" ON "Mountain"("key");
