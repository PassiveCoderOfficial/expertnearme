// src/components/ExpertList.tsx
import Link from 'next/link';
import { Star } from 'lucide-react';

interface Expert {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  rating: number;
  reviewCount: number;
  categories?: Array<{ id: string; name: string }>;
  bio?: string;
}

interface ExpertListProps {
  experts: Expert[];
  countryCode: string;
}

export default function ExpertList({ experts, countryCode }: ExpertListProps) {
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />);
    }
    if (hasHalfStar) {
      stars.push(<Star key="half" className="w-4 h-4 fill-yellow-200 text-yellow-400" />);
    }
    for (let i = stars.length; i < 5; i++) {
      stars.push(<Star key={i} className="w-4 h-4 text-gray-300" />);
    }
    return stars;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {experts.map((expert) => (
        <div key={expert.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
              {expert.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{expert.name}</h3>
              <div className="flex items-center gap-1 mt-1">
                {renderStars(expert.rating)}
                <span className="text-sm text-gray-600 ml-1">
                  ({expert.reviewCount})
                </span>
              </div>
            </div>
          </div>

          {expert.bio && (
            <p className="text-gray-600 mb-4 line-clamp-2">{expert.bio}</p>
          )}

          {expert.categories && expert.categories.length > 0 && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-2">
                {expert.categories.slice(0, 3).map((cat) => (
                  <span
                    key={cat.id}
                    className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
                  >
                    {cat.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Link
              href={`/${countryCode}/experts/${expert.id}`}
              className="flex-1 px-4 py-2 bg-[#b84c4c] text-white text-center rounded hover:bg-[#a33a3a] transition-colors"
            >
              View Profile
            </Link>
            <Link
              href={`/${countryCode}/book?expert=${expert.id}`}
              className="flex-1 px-4 py-2 border border-[#b84c4c] text-[#b84c4c] text-center rounded hover:bg-[#b84c4c] hover:text-white transition-colors"
            >
              Book Now
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}