// src/app/provider/[id]/page.tsx
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export const dynamic = 'force-dynamic';

interface ProviderPageProps {
  params: {
    id: string;
  };
}

export default async function ProviderPage({ params }: ProviderPageProps) {
  try {
    const provider = await prisma.expert.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        categories: {
          include: {
            category: true
          }
        },
        services: true,
        reviews: {
          include: {
            client: {
              select: {
                name: true
              }
            }
          },
          orderBy: { createdAt: "desc" }
        },
        portfolio: true
      }
    });

    if (!provider) {
      notFound();
    }

    const averageRating = provider.reviews.length > 0 
      ? provider.reviews.reduce((sum, review) => sum + review.rating, 0) / provider.reviews.length 
      : 0;

    return (
      <main className="min-h-screen bg-gray-50">
        {/* Provider Header */}
        <div className="bg-white">
          <div className="max-w-4xl mx-auto px-6 py-8">
            <div className="flex flex-col md:flex-row items-start gap-6">
              {/* Profile Picture */}
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                  {provider.name.charAt(0)}
                </div>
                {provider.verified && (
                  <div className="absolute -bottom-1 -right-1 bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold">
                    ✓
                  </div>
                )}
              </div>
              
              {/* Provider Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">{provider.name}</h1>
                  {provider.featured && (
                    <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded">
                      Featured
                    </span>
                  )}
                </div>
                
                {provider.businessName && (
                  <p className="text-gray-600 mb-2">{provider.businessName}</p>
                )}
                
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                  {provider.phone && (
                    <span>📱 {provider.phone}</span>
                  )}
                  {provider.whatsapp && (
                    <span>💬 WhatsApp: {provider.whatsapp}</span>
                  )}
                </div>
                
                {/* Categories */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {provider.categories.map((cat) => (
                    <span
                      key={cat.category.id}
                      className="bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full"
                      style={cat.category.color ? { backgroundColor: cat.category.color + '20', color: cat.category.color } : {}}
                    >
                      {cat.category.name}
                    </span>
                  ))}
                </div>
                
                {/* Rating */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={`text-lg ${
                          i < Math.floor(averageRating)
                            ? 'text-yellow-400'
                            : i === Math.floor(averageRating) && averageRating % 1 !== 0
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {averageRating.toFixed(1)} ({provider.reviews.length} reviews)
                  </span>
                </div>
                
                {/* Short Description */}
                {provider.shortDesc && (
                  <p className="text-gray-700 mb-4">{provider.shortDesc}</p>
                )}
                
                {/* Contact Button */}
                <div className="flex gap-3">
                  <Link
                    href="/contact"
                    className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Contact Now
                  </Link>
                  <button
                    className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                    onClick={() => {
                      if (provider.whatsapp) {
                        window.open(`https://wa.me/${provider.whatsapp.replace(/\D/g, '')}`, '_blank');
                      }
                    }}
                  >
                    WhatsApp
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Provider Details */}
        <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
          {/* Bio */}
          {provider.bio && (
            <section className="bg-white rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">About</h2>
              <p className="text-gray-700 leading-relaxed">{provider.bio}</p>
            </section>
          )}
          
          {/* Services */}
          {provider.services.length > 0 && (
            <section className="bg-white rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Services</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {provider.services.map((service) => (
                  <div key={service.id} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-2">{service.name}</h3>
                    {service.description && (
                      <p className="text-gray-600 text-sm">{service.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
          
          {/* Portfolio */}
          {provider.portfolio.length > 0 && (
            <section className="bg-white rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Portfolio</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {provider.portfolio.map((item) => (
                  <div key={item.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    {item.imageUrl && (
                      <div className="aspect-square bg-gray-100">
                        <Image
                          src={item.imageUrl}
                          alt="Portfolio item"
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    {item.videoUrl && (
                      <div className="aspect-video bg-gray-100 flex items-center justify-center">
                        <span className="text-gray-500">🎥 Video</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
          
          {/* Reviews */}
          {provider.reviews.length > 0 && (
            <section className="bg-white rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Reviews ({provider.reviews.length})</h2>
              <div className="space-y-6">
                {provider.reviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-200 pb-6 last:border-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{review.client.name}</span>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <span
                              key={i}
                              className={`text-sm ${
                                i < review.rating
                                  ? 'text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {review.comment && (
                      <p className="text-gray-700">{review.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
          
          {/* Location */}
          {provider.officeAddress && (
            <section className="bg-white rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Location</h2>
              <div className="space-y-2">
                <p className="text-gray-700">{provider.officeAddress}</p>
                {provider.mapLocation && (
                  <a
                    href={provider.mapLocation}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-600 text-sm"
                  >
                    View on Google Maps →
                  </a>
                )}
              </div>
            </section>
          )}
        </div>
      </main>
    );
  } catch (e) {
    console.error("ProviderPage error:", e);
    notFound();
  }
}