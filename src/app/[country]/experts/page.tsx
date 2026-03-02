import Link from 'next/link';
import Breadcrumb from '@/components/Breadcrumb';
import { prisma } from '@/lib/db';

interface ExpertsPageProps {
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

export default async function ExpertsPage({ params }: ExpertsPageProps) {
  const { country } = await params;
  const countryCode = country.toLowerCase();

  const countryData = await prisma.country.findUnique({
    where: { code: countryCode },
  });

  if (!countryData || !countryData.active) {
    return null;
  }

  const categories = await prisma.category.findMany({
    where: {
      countryCode,
      active: true,
    },
    select: {
      id: true,
    },
  });

  const categoryIds = categories.map(c => c.id);

  const experts = await prisma.expert.findMany({
    where: {
      categories: {
        some: {
          category: {
            countryCode: countryCode,
            active: true,
          },
        },
      },
      verified: true,
    },
    include: {
      categories: {
        include: {
          category: true,
        },
      },
      reviews: {
        take: 5,
        orderBy: { createdAt: 'desc' },
      },
    },
    orderBy: { name: 'asc' },
  });

  const avgRating = experts.length > 0
    ? experts.reduce((sum, e) => sum + (e.reviews.reduce((s, r) => s + r.rating, 0) / Math.max(e.reviews.length, 1)), 0) / experts.length
    : 0;

  return (
    <div className="min-h-screen bg-white">
      <Breadcrumb countryCode={countryCode} current="Experts" />
      
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">Experts in {countryData.name}</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Browse {experts.length} verified professionals ready to serve you.
            {experts.length > 0 && (
              <span className="block mt-2">
                Average rating: {avgRating.toFixed(1)} ⭐
              </span>
            )}
          </p>
        </div>

        {experts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No experts available yet in this country.</p>
            <Link
              href={`/${countryCode}/categories`}
              className="inline-block mt-4 px-6 py-2 bg-[#b84c4c] text-white rounded hover:bg-[#a33a3a]"
            >
              Browse Categories Instead
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {experts.map((expert) => {
              const rating = expert.reviews.length > 0
                ? expert.reviews.reduce((sum, r) => sum + r.rating, 0) / expert.reviews.length
                : 0;

              const categoryNames = expert.categories.map((ec) => ec.category.name);

              return (
                <div key={expert.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                      {expert.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{expert.name}</h3>
                      <div className="flex items-center">
                        <span className="text-yellow-500">⭐</span>
                        <span className="text-sm text-gray-600 ml-1">{rating.toFixed(1)} ({expert.reviews.length})</span>
                      </div>
                    </div>
                  </div>

                  {expert.shortDesc && (
                    <p className="text-gray-600 mb-4 line-clamp-2">{expert.shortDesc}</p>
                  )}

                  {categoryNames.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {categoryNames.map((catName) => (
                        <span key={catName} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                          {catName}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Link
                      href={`/${countryCode}/experts/${expert.id}`}
                      className="flex-1 px-4 py-2 bg-[#b84c4c] text-white text-center rounded hover:bg-[#a33a3a]"
                    >
                      View Profile
                    </Link>
                    <Link
                      href={`/${countryCode}/book?expert=${expert.id}`}
                      className="flex-1 px-4 py-2 border border-[#b84c4c] text-[#b84c4c] text-center rounded hover:bg-[#b84c4c] hover:text-white"
                    >
                      Book
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
