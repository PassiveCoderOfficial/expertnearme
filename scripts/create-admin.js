// scripts/create-admin.js
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

async function main() {
  const prisma = new PrismaClient();
  const password = "P@ssiveC0der"; // change this
  const hashed = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email: "walibdpro@gmail.com",
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
