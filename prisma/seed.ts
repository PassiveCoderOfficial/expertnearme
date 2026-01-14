/**
 * prisma/seed.ts
 *
 * Purpose:
 * --------
 * This file is used to populate your database with initial data.
 * In this case, we are creating parent categories (like "Health", "Legal", "Technology")
 * and then creating child categories under each parent (like "Dentist", "Lawyer", "Web Developer").
 *
 * Why:
 * ----
 * - Without seed data, your app starts with an empty database.
 * - Seeding ensures you have a working category hierarchy to test your provider forms and admin panel.
 *
 * How to run:
 * -----------
 * 1. Make sure your database is migrated and ready:
 *    $ npx prisma migrate dev
 *
 * 2. Run the seed file:
 *    $ npx prisma db seed
 *
 * 3. Prisma will execute this file and insert the categories.
 */

import { PrismaClient } from '@prisma/client';

// Create a new Prisma client instance to talk to the database
const prisma = new PrismaClient();

async function main() {
  /**
   * STEP 1: Create parent categories
   * --------------------------------
   * Each parent category is created first.
   * We store the returned object so we can use its "id" when creating children.
   */
  const health = await prisma.category.create({
    data: { name: 'Health', slug: 'health' },
  });

  const legal = await prisma.category.create({
    data: { name: 'Legal', slug: 'legal' },
  });

  const technology = await prisma.category.create({
    data: { name: 'Technology', slug: 'technology' },
  });

  /**
   * STEP 2: Create child categories
   * -------------------------------
   * Each child category is linked to its parent using "parentId".
   * This builds the hierarchy (tree structure).
   */
  await prisma.category.createMany({
    data: [
      // Children under Health
      { name: 'Dentist', slug: 'dentist', parentId: health.id },
      { name: 'Therapist', slug: 'therapist', parentId: health.id },

      // Children under Legal
      { name: 'Lawyer', slug: 'lawyer', parentId: legal.id },
      { name: 'Notary', slug: 'notary', parentId: legal.id },

      // Children under Technology
      { name: 'Web Developer', slug: 'web-developer', parentId: technology.id },
      { name: 'Mobile Developer', slug: 'mobile-developer', parentId: technology.id },
    ],
  });

  console.log('✅ Seed data inserted successfully!');
}

/**
 * STEP 3: Run the seeding process
 * -------------------------------
 * - main() runs our steps above.
 * - If successful, disconnect from the database.
 * - If there’s an error, log it and exit.
 */
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Error while seeding:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
