/*
  Warnings:

  - You are about to drop the column `allowGoogleLogin` on the `Setting` table. All the data in the column will be lost.
  - You are about to drop the column `allowSignup` on the `Setting` table. All the data in the column will be lost.
  - You are about to drop the column `emailVerificationRequired` on the `Setting` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[key]` on the table `Setting` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `key` to the `Setting` table without a default value. This is not possible if the table is not empty.
  - Added the required column `value` to the `Setting` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Setting" DROP COLUMN "allowGoogleLogin",
DROP COLUMN "allowSignup",
DROP COLUMN "emailVerificationRequired",
ADD COLUMN     "key" TEXT NOT NULL,
ADD COLUMN     "value" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Setting_key_key" ON "Setting"("key");
