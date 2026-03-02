import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Default categories
  const categories = [
    { name: "Legal", slug: "legal" },
    { name: "Finance", slug: "finance" },
    { name: "Health", slug: "health" },
    { name: "Education", slug: "education" },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: {
        name: cat.name,
        slug: cat.slug,
        showOnHomepage: true,
        countryCode: "us",
      },
    });
  }

  // Test expert
  const expert = await prisma.expert.upsert({
    where: { email: "expert@example.com" },
    update: {},
    create: {
      name: "Test Expert",
      email: "expert@example.com",
      phone: "123456789",
      shortDesc: "Demo expert for testing",
      isBusiness: false,
      featured: true,
    },
  });

  // Link expert to first category
  const firstCategory = categories[0];
  await prisma.expertCategory.upsert({
    where: {
      expertId_categoryId: {
        expertId: expert.id,
        categoryId: await prisma.category.findUnique({ where: { slug: firstCategory.slug } }).then(c => c?.id ?? 0),
      },
    },
    update: {},
    create: {
      expertId: expert.id,
      categoryId: await prisma.category.findUnique({ where: { slug: firstCategory.slug } }).then(c => c?.id ?? 0),
    },
  });

  // Test user
  await prisma.user.upsert({
    where: { email: "user@example.com" },
    update: {},
    create: {
      email: "user@example.com",
      password: "hashedpassword", // replace with bcrypt hash
      name: "Test User",
      role: "USER",
      verified: true,
    },
  });
}

main()
  .then(async () => {
    console.log("Seed data inserted successfully");
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });