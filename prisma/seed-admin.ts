/**
 * Run once to create the admin account:
 *   npx ts-node --project tsconfig.json prisma/seed-admin.ts
 * or:
 *   npx tsx prisma/seed-admin.ts
 */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@expertnear.me';
  const password = 'admin123';

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    if (existing.role !== 'ADMIN') {
      await prisma.user.update({ where: { id: existing.id }, data: { role: 'ADMIN', verified: true } });
      console.log(`Updated existing user ${email} to ADMIN.`);
    } else {
      console.log(`Admin user ${email} already exists (id: ${existing.id}). Nothing to do.`);
    }
    return;
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email,
      name: 'Super Admin',
      password: hashed,
      role: 'ADMIN',
      verified: true,
    },
  });

  console.log(`✅ Created admin user: ${user.email} (id: ${user.id})`);
  console.log(`   Email:    ${email}`);
  console.log(`   Password: ${password}`);
  console.log(`   Role:     ADMIN`);
}

main()
  .catch((e) => { console.error('❌ seed-admin failed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
