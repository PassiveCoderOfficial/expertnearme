/*
  Warnings:

  - You are about to drop the column `ownerId` on the `Expert` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[profileLink]` on the table `Expert` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Expert" DROP CONSTRAINT "Expert_ownerId_fkey";

-- AlterTable
ALTER TABLE "Expert" DROP COLUMN "ownerId",
ADD COLUMN     "profileLink" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Expert_profileLink_key" ON "Expert"("profileLink");
