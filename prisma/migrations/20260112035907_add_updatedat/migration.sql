/*
  Warnings:

  - Added the required column `updatedAt` to the `Category` table. A default value is provided so existing rows can be updated safely.
*/

-- DropIndex
DROP INDEX IF EXISTS "Category_name_key";

-- AlterTable
ALTER TABLE "Category"
  ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN "parentId" INTEGER;

-- CreateIndex
CREATE INDEX "Category_parentId_idx" ON "Category"("parentId");
CREATE INDEX "Category_slug_idx" ON "Category"("slug");

-- AddForeignKey
ALTER TABLE "Category"
  ADD CONSTRAINT "Category_parentId_fkey"
  FOREIGN KEY ("parentId") REFERENCES "Category"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
