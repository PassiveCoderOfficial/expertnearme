// scripts/create-admin.js
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

async function main() {
  const prisma = new PrismaClient();
  const password = "Itsn0t@p@ssw0rd"; // change this
  const hashed = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email: "expertnearme@gmail.com",
      password: hashed,
      role: "ADMIN",
      verified: true,
    },
  });

  console.log("Created user:", user.email, "password:", password);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
