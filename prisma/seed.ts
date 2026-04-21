import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const COUNTRIES = [
  {
    code: 'sg',
    name: 'Singapore',
    currency: 'SGD',
    timezone: 'Asia/Singapore',
    phoneCode: '+65',
    flagEmoji: '🇸🇬',
    metaTitle: 'Find Experts in Singapore | ExpertNear.Me',
    metaDesc: 'Discover trusted local experts, businesses and service providers in Singapore.',
  },
  {
    code: 'ae',
    name: 'United Arab Emirates',
    currency: 'AED',
    timezone: 'Asia/Dubai',
    phoneCode: '+971',
    flagEmoji: '🇦🇪',
    metaTitle: 'Find Experts in UAE | ExpertNear.Me',
    metaDesc: 'Discover trusted local experts, businesses and service providers in the UAE.',
  },
  {
    code: 'sa',
    name: 'Saudi Arabia',
    currency: 'SAR',
    timezone: 'Asia/Riyadh',
    phoneCode: '+966',
    flagEmoji: '🇸🇦',
    metaTitle: 'Find Experts in Saudi Arabia | ExpertNear.Me',
    metaDesc: 'Discover trusted local experts, businesses and service providers in Saudi Arabia.',
  },
  {
    code: 'bd',
    name: 'Bangladesh',
    currency: 'BDT',
    timezone: 'Asia/Dhaka',
    phoneCode: '+880',
    flagEmoji: '🇧🇩',
    metaTitle: 'Find Experts in Bangladesh | ExpertNear.Me',
    metaDesc: 'Discover trusted local experts, businesses and service providers in Bangladesh.',
  },
];

const CATEGORY_DEFS = [
  { name: 'Furniture & Home Decor',    icon: '🪑', color: '#8B4513', show: true  },
  { name: 'Renovation & Construction', icon: '🔨', color: '#6B7280', show: true  },
  { name: 'Interior Design',           icon: '🏠', color: '#7C3AED', show: true  },
  { name: 'Fashion & Clothing',        icon: '👗', color: '#EC4899', show: true  },
  { name: 'Food & Catering',           icon: '🍽️', color: '#F59E0B', show: true  },
  { name: 'Cleaning Services',         icon: '🧹', color: '#10B981', show: true  },
  { name: 'Engineering',               icon: '⚙️', color: '#3B82F6', show: true  },
  { name: 'IT & Technology',           icon: '💻', color: '#6366F1', show: true  },
  { name: 'Healthcare & Medical',      icon: '❤️', color: '#EF4444', show: true  },
  { name: 'Education & Tutoring',      icon: '📚', color: '#F97316', show: true  },
  { name: 'Photography & Media',       icon: '📸', color: '#8B5CF6', show: false },
  { name: 'Events & Weddings',         icon: '💍', color: '#F43F5E', show: false },
  { name: 'Beauty & Wellness',         icon: '💆', color: '#D946EF', show: false },
  { name: 'Legal & Consulting',        icon: '⚖️', color: '#0EA5E9', show: false },
  { name: 'Automotive',                icon: '🚗', color: '#78716C', show: false },
];

function slugify(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

async function main() {
  console.log('🌍 Seeding countries...');
  for (const country of COUNTRIES) {
    await prisma.country.upsert({
      where: { code: country.code },
      update: { ...country, active: true },
      create: { ...country, active: true },
    });
    console.log(`  ✓ ${country.flagEmoji} ${country.name}`);
  }

  console.log('\n📂 Seeding categories...');
  for (const country of COUNTRIES) {
    for (const cat of CATEGORY_DEFS) {
      const slug = `${slugify(cat.name)}-${country.code}`;
      await prisma.category.upsert({
        where: { slug },
        update: {
          name: cat.name,
          icon: cat.icon,
          color: cat.color,
          countryCode: country.code,
          active: true,
          showOnHomepage: cat.show,
        },
        create: {
          name: cat.name,
          slug,
          countryCode: country.code,
          active: true,
          showOnHomepage: cat.show,
          icon: cat.icon,
          color: cat.color,
        },
      });
    }
    console.log(`  ✓ ${country.flagEmoji} ${CATEGORY_DEFS.length} categories for ${country.name}`);
  }

  console.log('\n👤 Seeding admin user...');
  const adminPass = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@expertnear.me' },
    update: {},
    create: {
      email: 'admin@expertnear.me',
      password: adminPass,
      name: 'Admin',
      role: 'ADMIN',
      verified: true,
    },
  });
  console.log('  ✓ admin@expertnear.me  (password: admin123)');

  console.log('\n⚙️  Seeding default settings...');
  const settings = [
    { key: 'siteName',                 value: 'ExpertNear.Me' },
    { key: 'emailVerificationRequired', value: 'false' },
    { key: 'maintenanceMode',           value: 'false' },
    { key: 'foundingExpertPrice',       value: '999' },
    { key: 'foundingExpertMaxSpots',    value: '500' },
  ];
  for (const s of settings) {
    await prisma.setting.upsert({
      where:  { key: s.key },
      update: { value: s.value },
      create: s,
    });
  }
  console.log(`  ✓ ${settings.length} settings`);

  console.log('\n✅ Seed complete!');
  console.log(`   Countries  : ${COUNTRIES.length}`);
  console.log(`   Categories : ${COUNTRIES.length * CATEGORY_DEFS.length}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
