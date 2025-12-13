/*
  Warnings:

  - The `altitude` column on the `Mountain` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Mountain" DROP COLUMN "altitude",
ADD COLUMN     "altitude" INTEGER;
