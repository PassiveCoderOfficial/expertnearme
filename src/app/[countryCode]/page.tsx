import Link from "next/link";
import { prisma } from "@/lib/db";
import { MapPin, Search, Star, Users, Shield } from "lucide-react";
import MobileFirstHero from "@/components/MobileFirstHero";

interface CountryPageProps {
  params: {
    countryCode: string;
  };
}

export default async function CountryPage({ params }: CountryPageProps) {
  const { countryCode } = await params;
  
  // Fetch country data
  const country = await prisma.country.findUnique({
    where: { code: countryCode.toUpperCase() }
  });

  // Fetch experts in this country
  const experts = await prisma.expert.findMany({
    where: { 
      countryCode: countryCode.toUpperCase(),
      verified: true 
    },
    include: {
      categories: {
        include: {
          category: true
        }
      }
    },
    orderBy: { createdAt: "desc" },
    take: 50 // Limit for performance
  });

  // Get categories for this country
  const categories = await prisma.category.findMany({
    where: { 
      countryCode: countryCode.toUpperCase()
    },
    orderBy: { name: "asc" },
    take: 20
  });

  // Calculate some stats
  const totalExperts = experts.length;
  const avgRating = experts.length > 0 ? 
    (experts.reduce((sum, expert) => sum + (expert.rating || 4), 0) / experts.length).toFixed(1) : "0";

  const countryName = country?.name || countryCode.toUpperCase();

  return (
    <>
      <MobileFirstHero onScrollTo="experts" />

      {/* Country Header */}
      <section className="bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <MapPin className="w-8 h-8 text-orange-300" />
              <h1 className="text-4xl font-bold">{countryName}</h1>
            </div>
            <p className="text-xl text-orange-100 mb-8">
              Discover verified local professionals in {countryName}
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="flex items-center gap-3">
                  <Users className="w-6 h-6 text-orange-300" />
                  <div>
                    <div className="text-2xl font-bold">{totalExperts}</div>
                    <div className="text-sm text-orange-200">Verified Experts</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="flex items-center gap-3">
                  <Star className="w-6 h-6 text-yellow-400 fill-current" />
                  <div>
                    <div className="text-2xl font-bold">{avgRating}</div>
                    <div className="text-sm text-orange-200">Avg Rating</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="flex items-center gap-3">
                  <Shield className="w-6 h-6 text-green-400" />
                  <div>
                    <div className="text-2xl font-bold">{categories.length}</div>
                    <div className="text-sm text-orange-200">Categories</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section id="categories" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Popular Categories</h2>
            <p className="text-lg text-gray-600">
              Browse by service type in {countryName}
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/${countryCode}/categories/${category.slug}`}
                className="group bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-xl p-6 hover:shadow-lg transition-all duration-300 border-2 border-orange-200 hover:border-orange-300"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center text-white mb-4">
                  {category.icon || <span className="text-lg font-bold">🏢</span>}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                  {category.name}
                </h3>
                <p className="text-sm text-gray-600">
                  View {category._count.experts || 0} experts
                </p>
              </Link>
            ))}
            
            {categories.length === 0 && (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-600">Categories coming soon for {countryName}.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Find the Right Expert</h2>
            <p className="text-lg text-gray-600">
              Search by name, service, or specialty
            </p>
          </div>
          
          <div className="relative max-w-2xl mx-auto">
            <div className="flex">
              <input
                type="text"
                placeholder="Search experts or services..."
                className="flex-1 border border-gray-300 rounded-l-lg px-6 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <button className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-4 rounded-r-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-colors flex items-center gap-2">
                <Search className="w-5 h-5" />
                Search
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Experts Section */}
      <section id="experts" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Experts</h2>
            <p className="text-lg text-gray-600">
              Top-rated professionals in {countryName}
            </p>
          </div>
          
          {experts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {experts.map((expert) => (
                <Link
                  key={expert.id}
                  href={`/${countryCode}/expert/${expert.profileLink}`}
                  className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-gray-100 hover:border-orange-200 overflow-hidden"
                >
                  {/* Expert Header */}
                  <div className="h-48 bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 relative">
                    {expert.profilePicture ? (
                      <img 
                        src={expert.profilePicture} 
                        alt={expert.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                          <span className="text-3xl font-bold text-white">
                            {expert.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                    )}
                    {expert.verified && (
                      <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                        <Shield className="w-4 h-4" />
                        Verified
                      </div>
                    )}
                  </div>
                  
                  {/* Expert Info */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                      {expert.name}
                    </h3>
                    
                    {/* Rating */}
                    <div className="flex items-center gap-2 mb-3">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-semibold">{expert.rating || 4.0}</span>
                      <span className="text-sm text-gray-500">({expert.reviews?.length || 0})</span>
                    </div>
                    
                    {/* Categories */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {expert.categories?.slice(0, 3).map((category) => (
                        <span
                          key={category.category.id}
                          className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full"
                        >
                          {category.category.name}
                        </span>
                      ))}
                      {expert.categories?.length! > 3 && (
                        <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full">
                          +{expert.categories!.length - 3} more
                        </span>
                      )}
                    </div>
                    
                    {/* Description */}
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {expert.shortDesc || "Professional service provider with expertise in various fields."}
                    </p>
                    
                    {/* Contact Info */}
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      {expert.phone && (
                        <div className="flex items-center gap-1">
                          <span>📞 Available</span>
                        </div>
                      )}
                      {expert.email && (
                        <div className="flex items-center gap-1">
                          <span>📧 Contact</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-12 h-12 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">No Experts Yet</h3>
              <p className="text-gray-600 mb-8">
                We're adding more experts in {countryName} soon. In the meantime, check back frequently for new additions.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={() => window.location.href = "/"}
                  className="px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-orange-700 transition-colors"
                >
                  Browse Other Countries
                </button>
                <button 
                  onClick={() => window.location.href = "/create-expert-account"}
                  className="px-8 py-4 border-2 border-orange-600 text-orange-600 font-semibold rounded-xl hover:bg-orange-50 transition-colors"
                >
                  Register as Expert
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-orange-600 to-orange-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Can't Find What You're Looking For?
          </h2>
          <p className="text-xl mb-8 text-orange-100">
            We're constantly adding new experts to our platform. If you don't see what you need, contact us or become a verified expert yourself.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/create-expert-account"
              className="px-10 py-4 bg-white text-orange-600 font-bold rounded-xl text-lg hover:bg-gray-100 transition-colors shadow-2xl"
            >
              Join as Expert
            </Link>
            <Link 
              href="/contact"
              className="px-10 py-4 border-2 border-white/30 text-white font-semibold rounded-xl text-lg hover:bg-white/10 transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}