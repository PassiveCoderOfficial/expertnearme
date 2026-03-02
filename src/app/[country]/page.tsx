import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import CountryHero from '@/components/CountryHero';
import CategoryGrid from '@/components/CategoryGrid';
import ExpertList from '@/components/ExpertList';

interface PageProps {
  params: Promise<{ country: string }>;
}

export async function generateStaticParams() {
  try {
    const countries = await prisma.country.findMany({
      where: { active: true },
      select: { code: true },
    });
    return countries.map((country) => ({
      country: country.code,
    }));
  } catch (e) {
    console.error("<generateStaticParams> failed:", e);
    return [];
  }
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
    select: {
      id: true,
      name: true,
      slug: true,
    },
  });

  const experts = await prisma.expert.findMany({
    where: {
      categories: {
        some: {
          category: {
            countryCode,
            active: true,
          },
        },
      },
    },
    include: {
      categories: {
        include: {
          category: true,
        },
      },
      reviews: {
        take: 10,
        orderBy: { createdAt: 'desc' },
      },
    },
    orderBy: { featured: 'desc' },
    take: 12,
  });

  // Transform experts for ExpertList
  const transformedExperts = experts.map(expert => {
    const categories = expert.categories.map(ec => ec.category).filter(Boolean);
    const reviewCount = expert.reviews.length;
    const rating = reviewCount > 0 
      ? expert.reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
      : 0;
    
    return {
      id: expert.id,
      name: expert.name,
      email: expert.email,
      phone: expert.phone || undefined,
      avatar: expert.profilePicture || undefined,
      rating,
      reviewCount,
      categories: categories.map(cat => ({
        id: cat.id,
        name: cat.name,
      })),
      bio: expert.shortDesc || undefined,
    };
  });

  return (
    <div className="min-h-screen bg-white">
      <CountryHero country={{ 
        name: countryData.name,
        code: countryData.code,
        landingContent: countryData.landingContent ?? undefined,
        currency: countryData.currency,
        flagEmoji: countryData.flagEmoji ?? undefined,
      }} />
      
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
          <ExpertList experts={transformedExperts} countryCode={countryCode} />
        </section>
      </main>
    </div>
  );
}

export const dynamic = 'force-dynamic';
