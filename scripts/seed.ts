// scripts/seed.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const entries = [
    { key: "emailVerificationRequired", value: "true" },
    { key: "allowGoogleLogin", value: "true" },
    { key: "allowSignup", value: "true" },
  ];

  for (const e of entries) {
    await prisma.setting.upsert({
      where: { key: e.key },
      update: { value: e.value },
      create: { key: e.key, value: e.value },
    });
    console.log("Upserted", e.key);
  }

  console.log("Settings seeded/upserted.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
