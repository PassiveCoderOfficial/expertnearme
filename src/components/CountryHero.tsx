// src/components/CountryHero.tsx
import Link from 'next/link';

interface CountryHeroProps {
  country: {
    name: string;
    code: string;
    landingContent?: string;
    currency: string;
    flagEmoji?: string;
  };
}

export default function CountryHero({ country }: CountryHeroProps) {
  return (
    <div className="bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 text-white">
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center">
          <div className="text-6xl mb-4">{country.flagEmoji || '🌍'}</div>
          <h1 className="text-5xl font-bold mb-4">
            Find Trusted Experts in {country.name}
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Connect with verified professionals across all categories. Book services instantly with secure payments.
            {country.landingContent && (
              <span className="block mt-4 text-lg">"{country.landingContent}"</span>
            )}
          </p>
          
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href={`/${country.code}/categories`}
              className="px-8 py-3 bg-white text-blue-700 rounded-full font-semibold hover:bg-gray-100 transition-colors"
            >
              Browse Categories
            </Link>
            <Link
              href={`/${country.code}/experts`}
              className="px-8 py-3 bg-transparent border-2 border-white text-white rounded-full font-semibold hover:bg-white hover:text-blue-700 transition-colors"
            >
              Find Experts
            </Link>
          </div>

          <div className="mt-12 grid grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div>
              <div className="text-4xl font-bold">1000+</div>
              <div className="text-blue-200">Experts</div>
            </div>
            <div>
              <div className="text-4xl font-bold">50+</div>
              <div className="text-blue-200">Categories</div>
            </div>
            <div>
              <div className="text-4xl font-bold">24/7</div>
              <div className="text-blue-200">Support</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}