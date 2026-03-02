import Link from 'next/link';
import Breadcrumb from '@/components/Breadcrumb';
import { prisma } from '@/lib/db';

interface CategoriesPageProps {
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

export default async function CategoriesPage({ params }: CategoriesPageProps) {
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
    include: {
      children: {
        where: { active: true },
        include: {
          services: {
            include: {
              expert: true,
            },
          },
        },
      },
    },
    orderBy: { name: 'asc' },
  });

  return (
    <div className="min-h-screen bg-white">
      <Breadcrumb countryCode={countryCode} current="Categories" />
      
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <div className="text-6xl mb-4">🏷️</div>
          <h1 className="text-4xl font-bold mb-4">Categories in {countryData.name}</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Browse through our comprehensive list of service categories. Find the perfect expert for your needs.
          </p>
        </div>

        {categories.map((category) => (
          <section key={category.id} className="mb-20">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">{category.name}</h2>
              <p className="text-gray-600 max-w-md mx-auto">
                {category.description || 'Explore various services within this category.'}
              </p>
            </div>

            {category.children.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.children.map((subcat) => {
                  // Only keep services with a verified expert
                  const verifiedServices = subcat.services.filter(
                    (s) => s.expert && s.expert.verified
                  );
                  
                  return (
                    <div
                      key={subcat.id}
                      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all"
                    >
                      <h3 className="text-xl font-semibold mb-4">{subcat.name}</h3>
                      <div className="space-y-2 mb-4">
                        {subcat.description && (
                          <p className="text-gray-600 line-clamp-2">{subcat.description}</p>
                        )}
                      </div>

                      {verifiedServices.length > 0 && (
                        <>
                          <div className="grid grid-cols-2 gap-3 mb-4">
                            {verifiedServices.slice(0, 4).map((st) => (
                              <Link
                                key={st.id}
                                href={`/${countryCode}/categories/${category.id}/subcategories/${subcat.id}/services/${st.id}`}
                                className="px-3 py-1 bg-[#b84c4c] text-white text-xs rounded hover:bg-[#a33a3a] transition-colors"
                              >
                                {st.name}
                              </Link>
                            ))}
                          </div>

                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">
                              {verifiedServices.length} services
                            </span>
                            <Link
                              href={`/${countryCode}/categories/${category.id}/subcategories/${subcat.id}`}
                              className="text-sm text-[#b84c4c] hover:text-[#a33a3a]"
                            >
                              View All →
                            </Link>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        ))}
      </main>
    </div>
  );
}
