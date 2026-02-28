// src/app/[country]/page.tsx
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import CountryHero from '@/components/CountryHero';
import CategoryGrid from '@/components/CategoryGrid';
import ExpertList from '@/components/ExpertList';

interface PageProps {
  params: Promise<{ country: string }>;
}

export async function generateStaticParams() {
  const countries = await prisma.country.findMany({
    where: { active: true },
    select: { code: true },
  });
  
  return countries.map((country) => ({
    country: country.code,
  }));
}

export async function generateMetadata({ params }: PageProps) {
  const { country } = await params;
  const countryData = await prisma.country.findUnique({
    where: { code: country.toLowerCase() },
  });

  if (!countryData) {
    return {};
  }

  return {
    title: countryData.metaTitle || `Find Experts in ${countryData.name} | ExpertNear.Me`,
    description: countryData.metaDesc || `Connect with trusted experts in ${countryData.name}. Book services instantly.`,
  };
}

export default async function CountryPage({ params }: PageProps) {
  const { country } = await params;
  const countryCode = country.toLowerCase();

  const countryData = await prisma.country.findUnique({
    where: { code: countryCode },
  });

  if (!countryData || !countryData.active) {
    notFound();
  }

  const categories = await prisma.category.findMany({
    where: { 
      countryCode,
      active: true 
    },
    orderBy: { name: 'asc' },
  });

  const experts = await prisma.expert.findMany({
    where: { 
      countryCode,
      active: true,
      verified: true,
    },
    include: {
      categories: true,
      reviews: {
        take: 10,
        orderBy: { createdAt: 'desc' },
      },
    },
    orderBy: { rating: 'desc' },
    take: 12,
  });

  return (
    <div className="min-h-screen bg-white">
      <CountryHero country={countryData} />
      
      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Categories Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8">Browse by Category</h2>
          <CategoryGrid categories={categories} countryCode={countryCode} />
        </section>

        {/* Top Experts Section */}
        <section>
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Top Experts in {countryData.name}</h2>
            <a 
              href={`/${countryCode}/experts`}
              className="text-[#b84c4c] hover:text-[#a33a3a] font-medium"
            >
              View All →
            </a>
          </div>
          <ExpertList experts={experts} countryCode={countryCode} />
        </section>
      </main>
    </div>
  );
}