// scripts/migrate-settings-to-keyvalue.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Read the existing single row (old schema)
  const old = await prisma.$queryRawUnsafe<any>(
    `SELECT id, "emailVerificationRequired", "allowGoogleLogin", "allowSignup" FROM "Setting" LIMIT 1`
  );

  if (!old || old.length === 0) {
    console.log("No existing settings row found. Nothing to migrate.");
    return;
  }

  const row = old[0];

  const entries = [
    { key: "emailVerificationRequired", value: String(row.emailVerificationRequired) },
    { key: "allowGoogleLogin", value: String(row.allowGoogleLogin) },
    { key: "allowSignup", value: String(row.allowSignup) },
  ];

  for (const e of entries) {
    const exists = await prisma.setting.findUnique({ where: { key: e.key } });
    if (!exists) {
      await prisma.setting.create({ data: e });
      console.log("Created", e.key);
    } else {
      console.log("Already exists", e.key);
    }
  }

  // Optional: remove the old row if you are certain
  // await prisma.$executeRawUnsafe(`DELETE FROM "Setting" WHERE id = ${row.id}`);

  console.log("Migration complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
