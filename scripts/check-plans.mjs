import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const plans = await prisma.pricing.findMany({ orderBy: { price: "asc" } });
console.log(plans.map(x => ({ id: x.id, name: x.name, price: x.price, duration: x.duration, active: x.active, featured: x.featured })));
await prisma.$disconnect();
