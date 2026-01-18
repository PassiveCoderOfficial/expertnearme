// scripts/seed.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.setting.create({
    data: {
      emailVerificationRequired: true,
      allowGoogleLogin: true,
      allowSignup: true,
    },
  });
}

main()
  .then(() => {
    console.log("Seed data inserted successfully.");
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
