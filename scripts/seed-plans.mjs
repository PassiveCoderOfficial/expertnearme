import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const freeFeatures = JSON.stringify([
  "Basic expert listing",
  "1 country, 1 category",
  "Up to 5 portfolio images",
  "Contact info visible to buyers",
  "Public profile page",
]);
const proFeatures = JSON.stringify([
  "Everything in Free",
  "Priority search placement",
  "Unlimited countries & categories",
  "Unlimited portfolio images",
  "Analytics dashboard",
  "Founding Expert badge (if before Aug 15)",
  "All future Pro features",
  "Passive Coder website included — build your own site",
]);

const existing = await prisma.pricing.findMany({
  where: { name: { in: ["Free", "Pro Monthly", "Pro Yearly"] } },
});

if (existing.length > 0) {
  console.log("Plans already exist:", existing.map((p) => p.name));
} else {
  await prisma.pricing.createMany({
    data: [
      { name: "Free", description: "Get discovered locally at no cost", price: 0, currency: "USD", duration: -1, features: freeFeatures, active: true, featured: false },
      { name: "Pro Monthly", description: "Full Pro access, billed monthly", price: 80, currency: "USD", duration: 30, features: proFeatures, active: false, featured: false },
      { name: "Pro Yearly", description: "Full Pro access — save 50% vs monthly", price: 480, currency: "USD", duration: 365, features: proFeatures, active: false, featured: true },
    ],
  });
  const plans = await prisma.pricing.findMany({ orderBy: { price: "asc" } });
  console.log("Created:", plans.map((p) => `${p.name} $${p.price}`));
}

await prisma.$disconnect();
