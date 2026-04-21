import Link from "next/link";
import { Search, Bell, Shield, Users, Star, MapPin, Phone, MessageSquare, CheckCircle, Globe } from "lucide-react";
import { COUNTRIES } from "@/lib/country-middleware";

export const runtime = 'edge';

interface FeaturedExpert {
  id: string;
  name: string;
  slug: string;
  category: string;
  rating: number;
  reviewCount: number;
  location: string;
  verified: boolean;
  countryCode: string;
}

const featuredExperts: FeaturedExpert[] = [
  {
    id: "exquisite-designs",
    name: "Exquisite Designs",
    slug: "exquisite-designs",
    category: "Carpentry",
    rating: 5.0,
    reviewCount: 24,
    location: "Selangor, Malaysia",
    verified: true,
    countryCode: "my",
  },
  {
    id: "anamika-global",
    name: "Anamika Global SDN BHD",
    slug: "anamika-global",
    category: "Metal Works",
    rating: 4.9,
    reviewCount: 31,
    location: "Dengkil, Selangor",
    verified: true,
    countryCode: "my",
  },
  {
    id: "chishty-engineering",
    name: "Al Chishty Engineering Work",
    slug: "chishty-engineering",
    category: "CNC Machining",
    rating: 5.0,
    reviewCount: 47,
    location: "Ras Al Khaimah, UAE",
    verified: true,
    countryCode: "ae",
  },
  {
    id: "bagdad-curtains",
    name: "Bagdad Curtains and Decorations",
    slug: "bagdad-curtains",
    category: "Home Decor",
    rating: 4.8,
    reviewCount: 19,
    location: "Baghdad, Iraq",
    verified: true,
    countryCode: "iq",
  },
  {
    id: "qatar-furniture",
    name: "Qatar Furniture Market",
    slug: "qatar-furniture",
    category: "Furniture",
    rating: 4.7,
    reviewCount: 28,
    location: "Qatar",
    verified: true,
    countryCode: "qa",
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 L 0 0 60 0" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
            </pattern>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            {/* Logo */}
            <div className="mb-8">
              <Link href="/" className="inline-flex items-center gap-3 group">
                <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center group-hover:bg-white/20 transition-all duration-300">
                  <span className="text-3xl font-bold text-orange-600 group-hover:scale-105 transition-transform duration-300">E</span>
                  <span className="text-3xl font-bold text-orange-500 group-hover:scale-105 transition-transform duration-300">N</span>
                </div>
                <span className="text-3xl font-bold text-white ml-2 tracking-tight">xpertNear.Me</span>
              </Link>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight tracking-tight">
              Find Trusted Experts
              <br className="hidden sm:block" />Near You
            </h1>

            {/* Subheading */}
            <p className="text-lg sm:text-xl lg:text-2xl text-orange-100 mb-12 max-w-4xl mx-auto leading-relaxed font-light">
              Connect with verified professionals across construction, engineering, food & more — 
              <br className="hidden sm:block" />tailored for your local community
            </p>

            {/* Search Bar */}
            <div className="max-w-3xl mx-auto mb-12">
              <div className="relative group">
                <input
                  type="text"
                  placeholder="Search for experts or services..."
                  className="w-full px-8 py-5 pl-16 pr-16 bg-white/10 backdrop-blur-md border-2 border-white/20 rounded-3xl text-white text-lg placeholder:text-orange-200/60 focus:outline-none focus:ring-4 focus:ring-white/40 shadow-2xl transition-all duration-300"
                />
                <Search className="absolute left-6 top-1/2 w-6 h-6 text-orange-300" />
                <button className="absolute right-3 top-1/2 px-6 py-5 bg-white/10 backdrop-blur-md border-2 border-white/20 rounded-2xl hover:bg-white/20 transition-all duration-300">
                  <Globe className="w-5 h-5 text-orange-600" />
                </button>
              </div>
            </div>

            {/* Country Selector */}
            <div className="mb-12">
              <p className="text-white/70 text-sm font-medium mb-4 tracking-wide">SELECT YOUR COUNTRY:</p>
              <div className="flex flex-wrap justify-center gap-4 max-w-6xl mx-auto">
                {COUNTRIES.map((country) => (
                  <Link
                    key={country.code}
                    href={`/${country.code}`}
                    className="group relative bg-white/10 backdrop-blur-md border-2 border-white/20 rounded-2xl p-6 hover:bg-white/20 hover:scale-105 hover:shadow-2xl transition-all duration-300 min-w-[180px]"
                  >
                    <div className="text-4xl mb-3">{country.flag}</div>
                    <div className="space-y-1">
                      <div className="font-semibold text-white text-lg">{country.name}</div>
                      <div className="text-orange-200 text-sm">{country.currency} • {country.timezone}</div>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </Link>
                ))}
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/signup"
                className="px-10 py-5 bg-white text-orange-600 font-bold rounded-2xl text-lg hover:bg-gray-100 transition-all duration-300 hover:scale-105 shadow-2xl min-w-[200px]"
              >
                Join as Expert
              </Link>
              <Link
                href="/explore"
                className="px-10 py-5 bg-orange-400 text-white font-bold rounded-2xl text-lg hover:bg-orange-300 transition-all duration-300 hover:scale-105 shadow-2xl min-w-[200px]"
              >
                Explore Experts
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative Bottom Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 96L120 96c0-8.84 3.717-13.084 6.354-19.508 3.717-13.084c-3.383-5.299-6.617-10.699-3.383-13.084c-2.485-12.918-6.617-10.699C0 5.299-6.617-12.918 2.485-10.699 3.383 13.084c6.617 10.699 2.485 12.918 10.699 3.383 13.084c6.617 6.354 19.508 3.717 13.084L1440 120z" fill="rgba(255,255,255,0.1)" />
          </svg>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Browse by Category
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Find experts across 30+ categories
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {[
              { name: "Carpentry", slug: "carpentry", icon: "🔨", count: "50+" },
              { name: "Metal Works", slug: "metal-works", icon: "🔧", count: "35+" },
              { name: "CNC Machining", slug: "cnc-machining", icon: "⚙️", count: "20+" },
              { name: "Furniture", slug: "furniture", icon: "🛋️", count: "45+" },
              { name: "Interior Design", slug: "interior-design", icon: "🎨", count: "40+" },
              { name: "Curtains & Blinds", slug: "curtains-blinds", icon: "🪟", count: "25+" },
              { name: "Restaurants", slug: "restaurants", icon: "🍽️", count: "15+" },
              { name: "Electrical", slug: "electrical", icon: "⚡", count: "30+" },
            ].map((cat) => (
              <Link
                key={cat.slug}
                href="/categories"
                className="group bg-gradient-to-br from-orange-50 to-orange-100 rounded-3xl p-8 hover:shadow-2xl hover:scale-105 transition-all duration-300 border-2 border-orange-200/50 hover:border-orange-400"
              >
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">{cat.icon}</div>
                <div className="font-semibold text-gray-900 text-lg mb-2 group-hover:text-orange-700">{cat.name}</div>
                <div className="text-gray-600 text-sm">{cat.count} experts</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Experts Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Featured Experts
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Top-rated professionals in your country
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {featuredExperts.map((expert) => (
              <Link
                key={expert.id}
                href={`/${expert.countryCode}/expert/${expert.slug}`}
                className="group bg-white rounded-3xl p-8 hover:shadow-2xl hover:scale-105 transition-all duration-300 border-2 border-gray-200 hover:border-orange-400"
              >
                {/* Expert Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
                      {expert.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 text-lg group-hover:text-orange-700">{expert.name}</h3>
                      <p className="text-sm text-gray-600">{expert.category}</p>
                    </div>
                  </div>
                  {expert.verified && (
                    <div className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
                      <CheckCircle className="w-4 h-4" />
                      <span>Verified</span>
                    </div>
                  )}
                </div>

                {/* Expert Stats */}
                <div className="flex items-center gap-6 mb-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500 fill-current" />
                    <span className="font-semibold text-gray-900">{expert.rating}</span>
                    <span className="text-gray-500">({expert.reviewCount} reviews)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-orange-500" />
                    <span>{expert.location}</span>
                  </div>
                </div>

                {/* Short Description */}
                <p className="text-gray-700 mb-6 leading-relaxed">
                  {featuredExperts.find(e => e.id === expert.id)?.shortDesc}
                </p>

                {/* Contact Actions */}
                <div className="flex items-center gap-3">
                  <button className="flex-1 px-6 py-3 bg-orange-600 text-white font-semibold rounded-xl hover:bg-orange-700 transition-all duration-300 flex items-center gap-2 justify-center">
                    <Phone className="w-4 h-4" />
                    <span>Call Now</span>
                  </button>
                  <button className="flex-1 px-6 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-all duration-300 flex items-center gap-2 justify-center">
                    <MessageSquare className="w-4 h-4" />
                    <span>WhatsApp</span>
                  </button>
                  <button className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-100 transition-all duration-300">
                    View Profile
                  </button>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-orange-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border-2 border-white/20">
              <div className="text-4xl font-bold text-orange-600 mb-2">10,000+</div>
              <div className="text-gray-900 font-semibold">Verified Experts</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border-2 border-white/20">
              <div className="text-4xl font-bold text-orange-600 mb-2">7</div>
              <div className="text-gray-900 font-semibold">Countries</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border-2 border-white/20">
              <div className="text-4xl font-bold text-orange-600 mb-2">30+</div>
              <div className="text-gray-900 font-semibold">Categories</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border-2 border-white/20">
              <div className="text-4xl font-bold text-orange-600 mb-2">5.0★</div>
              <div className="text-gray-900 font-semibold">Avg Rating</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border-2 border-white/20">
              <div className="text-4xl font-bold text-orange-600 mb-2">98%</div>
              <div className="text-gray-900 font-semibold">Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div>
              <h4 className="font-bold text-lg mb-4 text-orange-400">For Experts</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><Link href="/signup" className="hover:text-white transition-colors">Join as Expert</Link></li>
                <li><Link href="/login" className="hover:text-white transition-colors">Expert Login</Link></li>
                <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-4 text-orange-400">For Customers</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><Link href="/explore" className="hover:text-white transition-colors">Find Experts</Link></li>
                <li><Link href="/categories" className="hover:text-white transition-colors">Browse Categories</Link></li>
                <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
              </ul>
            </div>
            <div className="md:col-span-2">
              <h4 className="font-bold text-lg mb-4 text-orange-400">Contact</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><Link href="/support" className="hover:text-white transition-colors">Support</Link></li>
                <li><a href="mailto:info@expertnear.me" className="hover:text-white transition-colors">Email Us</Link></li>
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
