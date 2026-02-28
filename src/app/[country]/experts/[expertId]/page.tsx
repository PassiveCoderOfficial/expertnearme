import Link from 'next/link';
import Breadcrumb from '@/components/Breadcrumb';

interface ExpertProfilePageProps {
  params: Promise<{ country: string; expertId: string }>;
}

export async function generateMetadata({ params }: ExpertProfilePageProps) {
  const { country, expertId } = await params;
  const expert = await prisma.expert.findUnique({
    where: { id: expertId },
    include: { categories: true },
  });

  if (!expert) return {};

  return {
    title: `${expert.name} - Expert Profile | ExpertNear.Me`,
    description: expert.bio?.slice(0, 160) || `Meet ${expert.name}, a verified expert in ${expert.categories.map(c => c.name).join(', ')}.`,
  };
}

export default async function ExpertProfilePage({ params }: ExpertProfilePageProps) {
  const { country, expertId } = await params;
  const countryCode = country.toLowerCase();

  const expert = await prisma.expert.findUnique({
    where: { id: expertId },
    include: {
      categories: true,
      serviceTypes: true,
      reviews: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!expert) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Expert Not Found</h1>
          <Link href={`/${countryCode}/experts`} className="text-[#b84c4c] hover:underline">
            ← Back to Experts
          </Link>
        </div>
      </div>
    );
  }

  const avgRating = expert.reviews.length > 0
    ? expert.reviews.reduce((sum, r) => sum + r.rating, 0) / expert.reviews.length
    : 0;

  return (
    <div className="min-h-screen bg-white">
      <Breadcrumb
        countryCode={countryCode}
        current={expert.name}
      />
      
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {/* Profile Card */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold mb-4">
                {expert.name.charAt(0).toUpperCase()}
              </div>
              <h1 className="text-2xl font-bold mb-2">{expert.name}</h1>
              <div className="flex items-center mb-4">
                <span className="text-yellow-500">★</span>
                <span className="ml-1">{avgRating.toFixed(1)}</span>
                <span className="text-gray-500 text-sm ml-1">({expert.reviews.length} reviews)</span>
              </div>

              {expert.phone && (
                <p className="text-gray-700 mb-2">
                  <span className="font-medium">Phone:</span> {expert.phone}
                </p>
              )}

              <div className="mb-4">
                <h3 className="font-semibold mb-2">Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {expert.categories.map((cat) => (
                    <span key={cat.id} className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full">
                      {cat.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Details Column */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <h2 className="text-xl font-bold mb-4">About</h2>
              <p className="text-gray-700 mb-8 leading-relaxed">
                {expert.bio || "No bio provided yet."}
              </p>

              <h2 className="text-xl font-bold mb-4">Services Offered</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
                {expert.serviceTypes.map((st) => (
                  <div
                    key={st.id}
                    className="p-4 border border-gray-200 rounded-lg hover:border-[#b84c4c] transition-colors"
                  >
                    <h3 className="font-semibold">{st.name}</h3>
                    <p className="text-sm text-gray-600">{st.description}</p>
                    <div className="mt-2 text-sm font-medium text-[#b84c4c]">
                      {st.price ? `$${st.price}` : 'Contact for price'}
                    </div>
                  </div>
                ))}
              </div>

              <Link
                href={`/${countryCode}/book?expert=${expert.id}`}
                className="block w-full text-center px-6 py-3 bg-[#b84c4c] text-white rounded-lg font-semibold hover:bg-[#a33a3a] transition-colors"
              >
                Book Now
              </Link>
            </div>

            {/* Reviews Section */}
            {expert.reviews.length > 0 && (
              <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                <h2 className="text-xl font-bold mb-6">
                  Reviews ({expert.reviews.length})
                </h2>
                <div className="space-y-6">
                  {expert.reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-200 pb-6 last:border-0">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold">{review.customerName}</span>
                        <span className="text-yellow-500">
                          {'★'.repeat(review.rating)}
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm mb-2">{review.comment}</p>
                      <span className="text-gray-500 text-xs">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}