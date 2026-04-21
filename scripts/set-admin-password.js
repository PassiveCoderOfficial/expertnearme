const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function main() {
  const prisma = new PrismaClient();
  const email = 'walibdpro@gmail.com';
  const password = 'SitePass@123';
  const hashed = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashed,
      role: 'ADMIN',
      verified: true,
      name: 'Wali',
    },
    create: {
      email,
      password: hashed,
      role: 'ADMIN',
      verified: true,
      name: 'Wali',
    },
  });

  console.log(`UPDATED ${user.email} ${user.role}`);
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  process.exit(1);
});
