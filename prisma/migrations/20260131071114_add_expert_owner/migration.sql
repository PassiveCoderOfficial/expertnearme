-- AlterTable
ALTER TABLE "Expert" ADD COLUMN     "ownerId" INTEGER;

-- AddForeignKey
ALTER TABLE "Expert" ADD CONSTRAINT "Expert_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
