import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Fix Free plan duration (was 30 days, should be -1 = perpetual free tier)
await prisma.pricing.update({ where: { id: 1 }, data: { duration: -1, active: true, featured: false } });

// Update Pro Monthly: $49 → $80, mark inactive until Aug 16 launch
await prisma.pricing.update({ where: { id: 2 }, data: { price: 80, active: false, featured: false } });

// Update Pro Yearly: $299 → $480, mark inactive until Aug 16 launch, featured
await prisma.pricing.update({ where: { id: 3 }, data: { price: 480, active: false, featured: true } });

// Founding Expert $499: keep as-is (lifetime deal)
// id 4 unchanged

const plans = await prisma.pricing.findMany({ orderBy: { price: "asc" } });
console.log("Updated plans:");
console.log(plans.map(x => `  ${x.id}: ${x.name} $${x.price} (duration=${x.duration}, active=${x.active}, featured=${x.featured})`).join("\n"));

await prisma.$disconnect();
