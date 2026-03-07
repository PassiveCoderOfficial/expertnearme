import Link from "next/link";
import { prisma } from "@/lib/db";
import { Star, MapPin, Phone, Globe, Mail, Shield, CheckCircle, Award } from "lucide-react";

interface ExpertProfilePageProps {
  params: {
    slug: string;
    countryCode: string;
  };
}

export default async function ExpertProfilePage({ params }: ExpertProfilePageProps) {
  const { slug, countryCode } = params;
  
  // Fetch expert data from database
  const expert = await prisma.expert.findUnique({
    where: {
      profileLink: slug,
      countryCode: countryCode
    },
    include: {
      categories: {
        include: {
          category: true
        }
      },
      services: {
        include: {
          category: true
        }
      },
      portfolio: true,
      reviews: {
        include: {
          client: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 6
      }
    }
  });

  if (!expert) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-8 bg-white rounded-2xl shadow-xl">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Expert Not Found</h1>
          <p className="text-gray-600 mb-6">
            The expert you're looking for doesn't exist or has been removed.
          </p>
          <Link href={`/${countryCode}`} className="inline-flex items-center gap-2 bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-orange-700 transition-colors">
            ← Back to {countryCode.toUpperCase()}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Expert Header */}
      <section className="bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6">
            <Link href={`/${countryCode}`} className="text-orange-200 hover:text-white transition-colors">
              ← Back to {countryCode.toUpperCase()}
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8 items-center">
            {/* Expert Profile Picture */}
            <div className="md:col-span-1 flex flex-col items-center">
              <div className="w-48 h-48 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center border-4 border-white/20">
                {expert.profilePicture ? (
                  <img 
                    src={expert.profilePicture} 
                    alt={expert.name} 
                    className="w-full h-full rounded-3xl object-cover"
                  />
                ) : (
                  <Shield className="w-24 h-24 text-orange-500" />
                )}
              </div>
            </div>

            {/* Expert Info */}
            <div className="md:col-span-2 space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <h1 className="text-4xl font-bold mb-2">{expert.name}</h1>
                  <div className="text-orange-200 text-sm">Expert ID: #{expert.id}</div>
                </div>
                {expert.verified && (
                  <div className="flex items-center gap-2 bg-green-500/20 backdrop-blur-sm px-4 py-2 rounded-full">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-green-300 font-semibold text-sm">Verified Expert</span>
                  </div>
                )}
              </div>

              {/* Rating & Stats */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-lg">
                  <Star className="w-6 h-6 text-yellow-400 fill-current" />
                  <span className="font-bold">4.8</span>
                  <span className="text-orange-200">★ Rating</span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-orange-400" />
                    <span>{expert.reviews?.length || 0} Reviews</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-orange-400" />
                    <span>New Expert</span>
                  </div>
                </div>

                {expert.bio && (
                  <p className="text-lg leading-relaxed text-white/90">
                    {expert.bio}
                  </p>
                )}

                {expert.shortDesc && (
                  <p className="text-lg leading-relaxed text-white/90">
                    {expert.shortDesc}
                  </p>
                )}
              </div>

              {/* Contact Actions */}
              <div className="flex flex-wrap gap-3">
                {expert.phone && (
                  <button className="flex items-center gap-2 bg-white text-orange-600 px-6 py-3 rounded-xl font-semibold hover:bg-orange-50 transition-colors shadow-lg">
                    <Phone className="w-5 h-5" />
                    <span>Call Now</span>
                  </button>
                )}
                {expert.whatsapp && (
                  <button className="flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-600 transition-colors shadow-lg">
                    <span>WhatsApp</span>
                  </button>
                )}
                {expert.email && (
                  <button className="flex items-center gap-2 bg-white/10 text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/20 transition-colors border-2 border-white/30">
                    <Mail className="w-5 h-5" />
                    <span>Send Email</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Services Offered
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {expert.services?.map((service) => (
              <div key={service.id} className="bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 border-2 border-orange-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Award className="w-6 h-6 text-orange-600" />
                  {service.name}
                </h3>
                {service.description && (
                  <p className="text-gray-700 mb-4 leading-relaxed">
                    {service.description}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-sm">Starting from</span>
                  <span className="text-2xl font-bold text-orange-600">AED 500/hour</span>
                </div>
              </div>
            )) || (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-600">No services available yet.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Portfolio Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Portfolio & Past Work
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {expert.portfolio?.map((item) => (
              <div key={item.id} className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
                {item.imageUrl && (
                  <div className="aspect-video bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700">
                    <img 
                      src={item.imageUrl} 
                      alt="Portfolio item" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Project Showcase</h3>
                  <p className="text-gray-600 mb-4">
                    Professional work completed with high quality standards. This represents the best services delivered to satisfied clients.
                  </p>
                  <div className="flex gap-3">
                    {item.imageUrl && (
                      <button className="px-4 py-2 bg-orange-600 text-white text-sm font-semibold rounded-lg hover:bg-orange-700 transition-colors">
                        View Details
                      </button>
                    )}
                    {item.videoUrl && (
                      <button className="px-4 py-2 border-2 border-orange-200 text-orange-600 text-sm font-semibold rounded-lg hover:bg-orange-50 transition-colors">
                        Watch Video
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )) || (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-600">No portfolio items available yet.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Client Reviews
          </h2>

          {/* Average Rating */}
          {expert.reviews && expert.reviews.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center justify-center gap-2 mb-6">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star 
                    key={i} 
                    className={`w-8 h-8 ${
                      i < 4 ? 'text-yellow-500 fill-current' : 'text-yellow-500'
                    }`} 
                  />
                ))}
              </div>
              <p className="text-center text-gray-700 text-lg">
                Calculating rating from {expert.reviews.length} reviews...
              </p>
            </div>
          )}

          {/* Individual Reviews */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {expert.reviews?.map((review) => (
              <div key={review.id} className="bg-gray-50 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 border-2 border-gray-200">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {review.client.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 mb-2">{review.client.name}</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      {review.createdAt.toLocaleDateString()}
                    </p>
                    <div className="flex items-center gap-1 mb-3">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star 
                          key={i} 
                          className={`w-4 h-4 ${
                            i < review.rating ? 'text-yellow-400 fill-current' : 'text-yellow-400'
                          }`} 
                        />
                      ))}
                      <span className="text-xs text-gray-500 ml-2">
                        {review.rating}/5
                      </span>
                    </div>
                    {review.comment && (
                      <p className="text-gray-700 leading-relaxed">
                        {review.comment}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )) || (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-600">No reviews available yet.</p>
              </div>
            )}
          </div>

          <div className="text-center mt-12">
            <button className="px-8 py-4 bg-orange-600 text-white font-bold rounded-xl text-lg hover:bg-orange-700 transition-colors shadow-lg">
              Write a Review
            </button>
          </div>
        </div>
      </section>

      {/* Booking CTA Section */}
      <section className="py-20 bg-gradient-to-r from-orange-600 to-orange-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8 text-orange-100">
            Book this expert for your project today and get professional service at competitive rates.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="px-10 py-4 bg-white text-orange-600 font-bold rounded-xl text-lg hover:bg-gray-100 transition-colors shadow-2xl">
              Book Appointment
            </button>
            <button className="px-10 py-4 border-2 border-white/30 text-white font-semibold rounded-xl text-lg hover:bg-white/10 transition-colors">
              Send Inquiry
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-bold text-orange-400 mb-4">For Experts</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><Link href="/login" className="hover:text-white transition-colors">Expert Login</Link></li>
                <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
                <li><Link href="/signup" className="hover:text-white transition-colors">Join as Expert</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-orange-400 mb-4">For Customers</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><Link href="/find-experts" className="hover:text-white transition-colors">Find Experts</Link></li>
                <li><Link href="/categories" className="hover:text-white transition-colors">Browse Categories</Link></li>
                <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-orange-400 mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><Link href="/support" className="hover:text-white transition-colors">Support</Link></li>
                <li><a href="mailto:info@expertnear.me" className="hover:text-white transition-colors">Email Us</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-orange-400 mb-4">Follow Us</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><Link href="#" className="hover:text-white transition-colors">Facebook</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Instagram</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Twitter</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            <p>© 2026 ExpertNear.Me. All rights reserved.</p>
            <p className="mt-2">Built for local communities worldwide</p>
          </div>
        </div>
      </footer>
    </>
  );
}
